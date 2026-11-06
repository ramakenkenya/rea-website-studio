import {test,expect} from '@playwright/test';
import JSZip from 'jszip';
import fs from 'node:fs/promises';
import {RAMA_PORTRAIT} from '../src/rama-portrait.js';

test('standalone text sample is readable offline at phone, tablet and desktop widths',async({page},testInfo)=>{
 await page.goto('./samples/rama-ken/');
 await expect(page.locator('h1')).toContainText('RAMA');
 await expect(page.locator('[data-text-portrait]')).toHaveText(RAMA_PORTRAIT,{useInnerText:false});
 expect(await page.locator('img,canvas,script').count()).toBe(0);
 await page.context().setOffline(true);
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:1000});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const portrait=await page.locator('.tp-art').boundingBox();expect(portrait.width).toBeGreaterThan(200);expect(portrait.height).toBeGreaterThan(240);
  await page.screenshot({path:testInfo.outputPath(`sample-${width}.png`),fullPage:true});
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 expect(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
});

test('sample opens without overwriting a saved project; artwork survives restore and offline export',async({page,context},testInfo)=>{
 await page.goto('./');await expect(page.locator('#save')).toBeEnabled();
 await page.locator('#save').click();const saved=await page.evaluate(()=>localStorage.getItem('rea-studio.project.v1'));
 await page.goto('./?sample=text-portfolio');await expect(page.locator('#save')).toBeEnabled();
 const canvas=page.frameLocator('.gjs-frame');
 await expect(canvas.locator('h1')).toContainText('RAMA');
 expect(await page.evaluate(()=>localStorage.getItem('rea-studio.project.v1'))).toBe(saved);
 expect(await canvas.locator('.tp-art').textContent()).toBe(RAMA_PORTRAIT);
 expect(await canvas.locator('h1').evaluate(el=>getComputedStyle(el).fontFamily)).toContain('Arial');
 await page.locator('#save').click();await page.reload();
 await expect(page.frameLocator('.gjs-frame').locator('h1')).toContainText('RAMA');
 expect(await canvas.locator('.tp-art').textContent()).toBe(RAMA_PORTRAIT);
 const backupEvent=page.waitForEvent('download');await page.locator('#backup').click();const backup=await backupEvent;
 await page.locator('#restore-file').setInputFiles(await backup.path());await expect(page.getByRole('status')).toContainText('Project restored');
 expect(await canvas.locator('.tp-art').textContent()).toBe(RAMA_PORTRAIT);
 await page.locator('#export-top').click();const event=page.waitForEvent('download');await page.locator('#download-site').click();
 const zip=await JSZip.loadAsync(await fs.readFile(await(await event).path()));
 const files=Object.fromEntries(await Promise.all(Object.keys(zip.files).map(async name=>[name,await zip.file(name).async('string')])));
 const standalone=await context.newPage();
 await standalone.route('https://text-export.example/**',route=>{const name=new URL(route.request().url()).pathname.slice(1)||'index.html';return route.fulfill({contentType:name.endsWith('.css')?'text/css':'text/html',body:files[name]||''});});
 await standalone.goto('https://text-export.example/');
 expect(await standalone.locator('.tp-art').textContent()).toBe(RAMA_PORTRAIT);
 await expect(standalone.getByRole('link',{name:'Work',exact:true})).toHaveAttribute('href','#work');
 await standalone.setViewportSize({width:390,height:844});
 expect(await standalone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(await standalone.locator('.tp-art').evaluate(el=>getComputedStyle(el).whiteSpace)).toBe('pre');
 await standalone.screenshot({path:testInfo.outputPath('export-phone.png'),fullPage:true});
});

test('generic text theme uses the brief and portrait photo replacement is saved as characters',async({page},testInfo)=>{
 await page.goto('./');await expect(page.locator('#save')).toBeEnabled();
 await page.locator('#new-site').click();await page.getByLabel('Business name').fill('Independent Maker');await page.getByLabel('What do you do?').fill('I make useful things.');
 await page.getByRole('radio',{name:'Text only',exact:true}).check();await page.locator('#brief-submit').click();
 const canvas=page.frameLocator('.gjs-frame');await expect(canvas.locator('h1')).toContainText('Independent');
 await expect(canvas.locator('.tp-project').first()).toContainText('Your project 01');
 await canvas.locator('.tp-art').click();await expect(page.locator('#portrait-controls')).toBeVisible();
 const before=await canvas.locator('.tp-art').textContent();
 await page.locator('#portrait-file').setInputFiles({name:'broken.png',mimeType:'image/png',buffer:Buffer.from('not a picture')});
 await expect(page.getByRole('status')).toContainText('could not be read');expect(await canvas.locator('.tp-art').textContent()).toBe(before);
 // A small deterministic PNG exercises the browser's real decoder and converter.
 const png=await page.evaluate(async()=>{const c=document.createElement('canvas');c.width=100;c.height=100;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,100,100);x.fillStyle='#000';x.fillRect(20,10,60,80);return c.toDataURL().split(',')[1];});
 await page.locator('#portrait-file').setInputFiles({name:'portrait.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
 await expect(page.getByRole('status')).toContainText('Text portrait updated');
 const after=await canvas.locator('.tp-art').textContent();expect(after).not.toBe(before);expect(after.split('\n')).toHaveLength(88);
 await page.locator('#portrait-description').fill('Portrait of Independent Maker');await page.locator('#portrait-description').blur();
 await page.locator('#save').click();await page.reload();
 expect(await canvas.locator('.tp-art').textContent()).toBe(after);await expect(canvas.locator('.tp-art')).toHaveAttribute('aria-label','Portrait of Independent Maker');
 await page.screenshot({path:testInfo.outputPath('editor-text-theme.png'),fullPage:true});
});
