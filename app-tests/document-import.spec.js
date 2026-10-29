import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import JSZip from 'jszip';
import {completedDocx,completedPdf,sampleRaw} from './import-fixture.js';
const ready=async page=>{await page.goto('./');await expect(page.getByRole('button',{name:'Save project',exact:true})).toBeEnabled();};
const open=async page=>{await page.getByRole('button',{name:'New website',exact:true}).click();await page.getByRole('button',{name:'Upload completed template',exact:true}).click();};
const upload=async(page,buffer,name='Rama Living.docx')=>{await page.getByLabel('Website template document',{exact:true}).setInputFiles({name,mimeType:name.endsWith('.pdf')?'application/pdf':'application/vnd.openxmlformats-officedocument.wordprocessingml.document',buffer:Buffer.from(buffer)});};
test('Word import creates four editable pages, survives save and exports a working shop',async({page,context},info)=>{
 await ready(page);await page.route('https://images.example/**',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="tan"/></svg>'}));
 await open(page);await upload(page,await completedDocx());await expect(page.locator('#document-import-summary')).toContainText('4 pages');await expect(page.locator('#document-import-summary')).toContainText('6 products');
 await page.getByLabel('Business name',{exact:true}).fill('Rama Living Reviewed');
 await page.getByRole('button',{name:'Create website from document',exact:true}).click();
 await expect(page.locator('#studio-page-tabs [data-page]')).toHaveCount(4);await expect(page.locator('#project-name')).toHaveText('Rama Living Reviewed');
 await page.getByRole('button',{name:'Open Shop page',exact:true}).click();await expect(page.frameLocator('.gjs-frame').locator('.rea-product')).toHaveCount(6);
 await page.getByRole('button',{name:'Save project',exact:true}).click();await page.reload();await expect(page.locator('#studio-page-tabs [data-page]')).toHaveCount(4);
 const backupEvent=page.waitForEvent('download');await page.getByRole('button',{name:'Project backup',exact:true}).click();const backup=await fs.readFile(await(await backupEvent).path());
 await page.getByRole('button',{name:'Export site',exact:true}).click();const event=page.waitForEvent('download');await page.getByRole('button',{name:'Download website ZIP',exact:true}).click();const zip=await JSZip.loadAsync(await fs.readFile(await(await event).path()));
 const files={};for(const [name,file]of Object.entries(zip.files))if(!file.dir)files[name]=await file.async('string');
 expect(files['index.html']).toContain('Rama Living Reviewed');expect(files['shop.html']).toContain('Nia Sofa');expect(files['lookbook.html']).toContain('Room inspiration');expect(files['about.html']).toContain('Can I pay here?');expect(files['IMAGE-CREDITS.txt']).toContain('Demo Photographer');
 const standalone=await context.newPage();await standalone.route('https://portable.example/**',route=>{const name=new URL(route.request().url()).pathname.slice(1)||'index.html';return route.fulfill({status:files[name]?200:404,contentType:name.endsWith('.css')?'text/css':name.endsWith('.js')?'text/javascript':'text/html',body:files[name]||''});});
 await standalone.goto('https://portable.example/index.html');await standalone.getByRole('link',{name:'Shop',exact:true}).first().click();await expect(standalone).toHaveURL('https://portable.example/shop.html');
 for(const [name,count]of [['Nia Sofa',1],['Kazi Office Desk',1],['Soma Bookshelf',2]]){const card=standalone.locator('.rea-product').filter({has:standalone.getByRole('heading',{name,exact:true})});await card.locator('[data-shop-size]').selectOption('Standard');await card.locator('[data-shop-colour]').selectOption('Sand');await card.getByRole('spinbutton',{name:'Quantity',exact:true}).fill(String(count));await card.getByRole('button',{name:'Add to shopping list',exact:true}).click();}
 await expect(standalone.locator('[data-shop-subtotal]')).toContainText('83,500');
 await page.getByRole('button',{name:'New website',exact:true}).click();await page.getByLabel('Business name',{exact:true}).fill('Temporary');page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Create website',exact:true}).click();
 page.once('dialog',d=>d.accept());await page.locator('#restore-file').setInputFiles({name:'import-backup.json',mimeType:'application/json',buffer:backup});
 // Restore can prompt synchronously after file parsing; handle it before continuing.
 await expect(page.locator('#studio-page-tabs [data-page]')).toHaveCount(4);
 await page.screenshot({path:info.outputPath('document-import-four-pages.png'),fullPage:true});
});
test('filled PDF creates its page and catalogue without requiring duplicate brief entry',async({page})=>{
 await ready(page);await open(page);await upload(page,await completedPdf(),'completed.pdf');await expect(page.locator('#document-import-summary')).toContainText('1 page');await expect(page.getByLabel('Business name',{exact:true})).toHaveValue('Rama Living PDF');await page.getByRole('button',{name:'Create website from document',exact:true}).click();await expect(page.frameLocator('.gjs-frame').locator('h1')).toHaveText('Welcome home');await expect(page.frameLocator('.gjs-frame').locator('.rea-product')).toHaveCount(1);
});
test('invalid document and missing product price keep the open project intact; cancel is harmless',async({page})=>{
 await ready(page);await page.getByRole('button',{name:'Save project',exact:true}).click();const before=await page.evaluate(()=>localStorage.getItem('rea-studio.project.v1'));
 await open(page);await upload(page,Buffer.from('broken'),'broken.docx');await expect(page.locator('#document-import-message')).toContainText('valid Word');
 const raw=sampleRaw();raw.records.product[0]['product.price']='';await upload(page,await completedDocx(raw));await expect(page.locator('#document-import-issues')).toContainText('Nia Sofa');await expect(page.getByRole('button',{name:'Create website from document',exact:true})).toBeDisabled();
 await page.getByRole('button',{name:'Cancel',exact:true}).click();await expect(page.locator('#studio-page-tabs [data-page]')).toHaveCount(1);expect(await page.evaluate(()=>localStorage.getItem('rea-studio.project.v1'))).toBe(before);
});
test('replacement requires a deliberate choice and preserves the saved project until explicit save',async({page})=>{
 await ready(page);await page.getByRole('button',{name:'Save project',exact:true}).click();const before=await page.evaluate(()=>localStorage.getItem('rea-studio.project.v1'));
 await open(page);await upload(page,await completedPdf(),'completed.pdf');await expect(page.getByLabel('Replace the open website with this document',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Create website from document',exact:true})).toBeDisabled();await page.getByLabel('Replace the open website with this document',{exact:true}).check();await page.getByRole('button',{name:'Create website from document',exact:true}).click();expect(await page.evaluate(()=>localStorage.getItem('rea-studio.project.v1'))).toBe(before);await expect(page.locator('#project-name')).toHaveText('Rama Living PDF');
});
test('phone review fits without horizontal overflow and all actions remain reachable',async({page},info)=>{
 await page.setViewportSize({width:390,height:844});await ready(page);await open(page);await upload(page,await completedPdf(),'completed.pdf');await expect(page.getByRole('button',{name:'Create website from document',exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:info.outputPath('phone-document-review.png'),fullPage:true});
});
test('closing Brief while the document reader loads discards the late result',async({page})=>{
 await ready(page);let release;const gate=new Promise(resolve=>{release=resolve;});await page.route('**/assets/document-reader-*.js',async route=>{await gate;await route.continue();});
 await open(page);await upload(page,await completedPdf(),'completed.pdf');await page.getByRole('button',{name:'Cancel',exact:true}).click();release();
 await page.getByRole('button',{name:'New website',exact:true}).click();await expect(page.getByLabel('Business name',{exact:true})).toHaveValue('');await expect(page.getByRole('button',{name:'Create website',exact:true})).toBeVisible();await expect(page.locator('#studio-page-tabs [data-page]')).toHaveCount(1);
});
test('an imported project cannot inherit a pending autosave from the previous project',async({page})=>{
 await ready(page);await page.getByRole('button',{name:'Studio tools',exact:true}).click();await page.getByRole('tab',{name:'History',exact:true}).click();await page.getByLabel('Autosave this project on this device',{exact:true}).check();await page.getByRole('button',{name:'Close studio tools',exact:true}).click();await page.getByRole('button',{name:'Save project',exact:true}).click();const before=await page.evaluate(()=>localStorage.getItem('rea-studio.project.v1'));
 await open(page);await upload(page,await completedPdf(),'completed.pdf');await page.getByLabel('Replace the open website with this document',{exact:true}).check();await page.getByRole('button',{name:'Create website from document',exact:true}).click();await expect(page.locator('#project-name')).toHaveText('Rama Living PDF');await page.waitForTimeout(1800);expect(await page.evaluate(()=>localStorage.getItem('rea-studio.project.v1'))).toBe(before);
});
