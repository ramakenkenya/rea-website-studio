import {test,expect} from '@playwright/test';
import JSZip from 'jszip';
import fs from 'node:fs/promises';
const ready=async page=>{await page.goto('./');await expect(page.getByRole('button',{name:'Save project',exact:true})).toBeEnabled();};
const tools=async(page,name)=>{await page.getByRole('button',{name:'Studio tools',exact:true}).click();await page.getByRole('tab',{name,exact:true}).click();};
const close=page=>page.getByRole('button',{name:'Close studio tools',exact:true}).click();
test('multipage site keeps edits, page metadata and portable links through ZIP and restore',async({page,context},info)=>{
 await ready(page);await tools(page,'Pages');
 await page.getByLabel('New page name',{exact:true}).fill('Our products');
 await page.getByLabel('Page layout',{exact:true}).selectOption('products');
 await page.getByRole('button',{name:'Add page',exact:true}).click();
 await expect(page.getByLabel('Page name',{exact:true})).toHaveValue('Our products');
 await page.getByLabel('Page URL slug',{exact:true}).fill('collection');
 await page.getByLabel('Search title',{exact:true}).fill('Our furniture collection');
 await page.getByRole('button',{name:'Save page settings',exact:true}).click();
 await close(page);await expect(page.frameLocator('.gjs-frame').locator('[data-section="Products"]')).toBeVisible();
 await tools(page,'Pages');await page.getByRole('button',{name:'Duplicate page',exact:true}).click();
 await expect(page.locator('#studio-page-tabs button[data-page]')).toHaveCount(3);
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Delete page',exact:true}).click();
 await expect(page.locator('#studio-page-tabs button[data-page]')).toHaveCount(2);
 await close(page);await page.getByRole('button',{name:'Preview website',exact:true}).click();
 const preview=page.frameLocator('#studio-preview-frame');await expect(preview.locator('body')).toContainText('Our products');
 await page.getByRole('button',{name:'Close website preview',exact:true}).click();
 await page.getByRole('button',{name:'Export site',exact:true}).click();const event=page.waitForEvent('download');
 await page.getByRole('button',{name:'Download website ZIP',exact:true}).click();
 const zip=await JSZip.loadAsync(await fs.readFile(await (await event).path()));
 expect(zip.file('index.html')).toBeTruthy();expect(zip.file('collection.html')).toBeTruthy();expect(zip.file('robots.txt')).toBeTruthy();expect(zip.file('404.html')).toBeTruthy();
 expect(await zip.file('collection.html').async('string')).toContain('Our furniture collection');
 expect(await zip.file('index.html').async('string')).toContain('collection.html');
 const files={};for(const name of Object.keys(zip.files))if(!zip.files[name].dir)files[name]=await zip.file(name).async('string');
 const standalone=await context.newPage();await standalone.route('https://portable.example/**',route=>{const name=new URL(route.request().url()).pathname.slice(1)||'index.html';return route.fulfill({status:files[name]?200:404,contentType:name.endsWith('.css')?'text/css':'text/html',body:files[name]||files['404.html']});});
 await standalone.goto('https://portable.example/index.html');await standalone.getByRole('link',{name:'Our products',exact:true}).click();await expect(standalone).toHaveURL('https://portable.example/collection.html');await expect(standalone.locator('h1')).toHaveCount(1);
 await page.getByRole('button',{name:'Save project',exact:true}).click();await page.reload();await expect(page.locator('#studio-page-tabs button[data-page]')).toHaveCount(2);
 await page.screenshot({path:info.outputPath('multipage-studio.png'),fullPage:true});
});
test('brand, reusable blocks, assets, site settings and checkpoints are real controls',async({page},info)=>{
 await ready(page);await tools(page,'Brand');
 await page.getByLabel('Accent color',{exact:true}).fill('#804530');await page.getByLabel('Font pairing',{exact:true}).selectOption('serif');
 await page.getByLabel('Content width',{exact:true}).fill('1080');await page.getByRole('button',{name:'Apply brand',exact:true}).click();
 await page.getByRole('tab',{name:'Library',exact:true}).click();
 await page.getByRole('button',{name:'Insert FAQ',exact:true}).click();await close(page);
 await expect(page.frameLocator('.gjs-frame').locator('details')).toHaveCount(3);
 await page.frameLocator('.gjs-frame').locator('[data-section="FAQ"]').click();
 await tools(page,'Library');await page.getByLabel('Section name',{exact:true}).fill('My FAQ');await page.getByRole('button',{name:'Save selected section',exact:true}).click();
 await expect(page.getByRole('button',{name:'Insert My FAQ',exact:true})).toBeVisible();
 await page.getByRole('tab',{name:'Assets',exact:true}).click();
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aF1kAAAAASUVORK5CYII=','base64');
 await page.getByLabel('Upload images',{exact:true}).setInputFiles({name:'product.png',mimeType:'image/png',buffer:png});
 await expect(page.getByRole('button',{name:'Insert product.png',exact:true})).toBeVisible();
 await page.getByRole('tab',{name:'Site',exact:true}).click();await page.getByLabel('Public site URL',{exact:true}).fill('https://example.com/shop/');
 await page.getByRole('button',{name:'Save site settings',exact:true}).click();
 await page.getByRole('tab',{name:'History',exact:true}).click();await page.getByLabel('Restore point name',{exact:true}).fill('Before edits');
 await page.getByRole('button',{name:'Create restore point',exact:true}).click();await expect(page.getByRole('button',{name:'Restore Before edits',exact:true})).toBeVisible();
 await close(page);await page.screenshot({path:info.outputPath('v2-brand-and-blocks.png'),fullPage:true});
});
test('studio tools remain reachable on a phone without horizontal overflow',async({page},info)=>{
 await page.setViewportSize({width:390,height:844});await ready(page);await tools(page,'Pages');
 for(const name of ['Brand','Assets','Library','History','Site','Pages']){await page.getByRole('tab',{name,exact:true}).click();await expect(page.getByRole('button',{name:'Close studio tools',exact:true})).toBeVisible();}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:info.outputPath('v2-mobile-tools.png'),fullPage:true});
});

test('autosave and five named restore points preserve an earlier edited website',async({page},info)=>{
 await ready(page);await tools(page,'History');await page.getByLabel('Autosave this project on this device',{exact:true}).check();
 for(let i=1;i<=5;i++){await page.getByLabel('Restore point name',{exact:true}).fill('Version '+i);await page.getByRole('button',{name:'Create restore point',exact:true}).click();}
 await expect(page.locator('[data-checkpoint]')).toHaveCount(5);await close(page);
 const canvas=page.frameLocator('.gjs-frame');await canvas.locator('h1').click();await page.getByLabel('Selected text').fill('A completely new headline');await page.getByRole('button',{name:'Apply text',exact:true}).click();
 await expect(page.locator('#save-status')).toHaveText('Autosaved on this device',{timeout:10000});
 await page.reload();await expect(page.frameLocator('.gjs-frame').locator('h1')).toHaveText('A completely new headline');
 await tools(page,'History');page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Restore Version 1',exact:true}).click();
 await expect(page.frameLocator('.gjs-frame').locator('h1')).toContainText('Rama Studio');
 await page.getByRole('button',{name:'Save project',exact:true}).click();await page.screenshot({path:info.outputPath('history-restored.png'),fullPage:true});
});
