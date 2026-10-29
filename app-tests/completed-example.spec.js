import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import JSZip from 'jszip';

// Serve the real checked-in JPEG bytes from the preview deployment. No dummy
// image, placeholder SVG or test-only document is substituted for this journey.
async function localPhotos(page){
 await page.route('https://ramakenkenya.github.io/rea-website-studio/example-photos/**',async route=>{
  const name=new URL(route.request().url()).pathname.split('/').at(-1);
  if(!/^[a-z0-9-]+\.jpg$/.test(name))return route.abort();
  await route.fulfill({contentType:'image/jpeg',body:await fs.readFile(new URL('../public/example-photos/'+name,import.meta.url))});
 });
}
async function loadedImages(frame,selector,count){
 const images=frame.locator(selector);await expect(images).toHaveCount(count);
 for(const im of await images.all()){await im.scrollIntoViewIfNeeded();await expect.poll(()=>im.evaluate(i=>i.complete&&i.naturalWidth>300)).toBe(true);}
}
for(const ext of ['docx','pdf'])test(`real downloadable ${ext} example renders photos, styled navigation and shop; preserves them on export`,async({page,context},info)=>{
 await localPhotos(page);await page.goto('./');await expect(page.getByRole('button',{name:'Save project',exact:true})).toBeEnabled();
 await page.getByRole('button',{name:'New website',exact:true}).click();await page.getByRole('button',{name:'Upload completed template',exact:true}).click();
 await page.getByText('Try a completed example',{exact:true}).click();
 const link=page.getByRole('link',{name:ext==='pdf'?'Rama Living PDF example':'Rama Living Word example',exact:true});
 const download=page.waitForEvent('download');await link.click();const file=await download;const buffer=await fs.readFile(await file.path());
 await page.getByLabel('Website template document',{exact:true}).setInputFiles({name:file.suggestedFilename(),mimeType:ext==='pdf'?'application/pdf':'application/vnd.openxmlformats-officedocument.wordprocessingml.document',buffer});
 await expect(page.locator('#document-import-summary')).toContainText('4 pages');await expect(page.locator('#document-import-summary')).toContainText('6 products');
 await page.getByRole('button',{name:'Create website from document',exact:true}).click();
 const canvas=page.frameLocator('.gjs-frame');await loadedImages(canvas,'.site-hero > img',1);
 await expect(canvas.locator('.site-nav nav')).toHaveCSS('display','flex');await expect(canvas.locator('.site-nav .site-brand')).toHaveCSS('text-decoration-line','none');
 await page.screenshot({path:info.outputPath(ext+'-home.png'),fullPage:true});
 await page.getByRole('button',{name:'Open Shop page',exact:true}).click();await loadedImages(canvas,'.rea-product img',6);await expect(canvas.locator('.rea-shop-grid')).toHaveCSS('display','grid');
 await page.screenshot({path:info.outputPath(ext+'-shop.png'),fullPage:true});
 await page.getByRole('button',{name:'Open Lookbook page',exact:true}).click();await loadedImages(canvas,'.doc-gallery img',9);await expect(canvas.locator('.doc-gallery')).toHaveCSS('display','grid');
 await page.getByRole('button',{name:'Save project',exact:true}).click();await page.reload();await expect(page.locator('#studio-page-tabs [data-page]')).toHaveCount(4);
 await page.getByRole('button',{name:'Export site',exact:true}).click();const exported=page.waitForEvent('download');await page.getByRole('button',{name:'Download website ZIP',exact:true}).click();
 const zip=await JSZip.loadAsync(await fs.readFile(await(await exported).path()));const files={};for(const [name,file]of Object.entries(zip.files))if(!file.dir)files[name]=await file.async('string');
 expect(files['IMAGE-CREDITS.txt']).toContain('Carlos ZGZ');expect(files['IMAGE-CREDITS.txt']).toContain('Hency Xu');expect(files['IMAGE-CREDITS.txt']).not.toContain('Not supplied');
 const standalone=await context.newPage();await localPhotos(standalone);await standalone.route('https://portable.example/**',route=>{const name=new URL(route.request().url()).pathname.slice(1)||'index.html';return route.fulfill({status:files[name]?200:404,contentType:name.endsWith('.css')?'text/css':name.endsWith('.js')?'text/javascript':'text/html',body:files[name]||''});});
 await standalone.goto('https://portable.example/index.html');await loadedImages(standalone,'.site-hero > img',1);await expect(standalone.locator('.site-nav nav')).toHaveCSS('display','flex');
 await standalone.getByRole('link',{name:'Shop',exact:true}).first().click();await loadedImages(standalone,'.rea-product img',6);await expect(standalone.locator('.rea-shop-grid')).toHaveCSS('display','grid');
 const sofa=standalone.locator('.rea-product').filter({has:standalone.getByRole('heading',{name:'Nia Sofa',exact:true})});await sofa.locator('[data-shop-size]').selectOption('Standard');await sofa.locator('[data-shop-colour]').selectOption('Sand');await sofa.getByRole('button',{name:'Add to shopping list',exact:true}).click();await expect(standalone.locator('[data-shop-subtotal]')).toContainText('48,000');
 await standalone.setViewportSize({width:390,height:844});await expect.poll(()=>standalone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await standalone.screenshot({path:info.outputPath(ext+'-mobile-export.png'),fullPage:true});
});
