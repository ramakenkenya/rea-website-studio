import {test,expect} from '@playwright/test';
import JSZip from 'jszip';
import fs from 'node:fs/promises';

test('process text crosses a static split at phone, tablet and desktop widths', async ({page}, testInfo) => {
 await page.goto('./samples/rama-ken/');
 const section = page.locator('.bw-section');
 await expect(section.getByRole('heading',{name:/^how i work$/i})).toBeVisible();
 await expect(section.locator('article')).toHaveCount(2);
 await expect(section.locator('img,input,button')).toHaveCount(0);
 expect(await section.evaluate(el => el.getAnimations({subtree:true}).length)).toBe(0);
 for (const width of [320,390,768,1440]) {
  await page.setViewportSize({width,height:1000});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const word = await section.locator('.bw-word').evaluate(el => {
   const range = document.createRange();
   range.selectNodeContents(el);
   const text = range.getBoundingClientRect();
   const panel = el.closest('.bw-panel').getBoundingClientRect();
   const seam = panel.left + panel.width / 2;
   return {crossesSeam:text.left < seam && text.right > seam, fits:text.left >= panel.left && text.right <= panel.right};
  });
  expect(word).toEqual({crossesSeam:true,fits:true});
  await section.screenshot({path:testInfo.outputPath(`split-process-${width}.png`)});
 }
});

test('Korean offline preview and restored editor export retain the static process section', async ({page,context},testInfo) => {
 await page.goto('./samples/rama-ken/preview.html#ko');
 await context.setOffline(true);
 const korean = page.locator('#ko .bw-section');
 await expect(korean.getByRole('heading',{name:'나의 작업 방식'})).toBeVisible();
 await expect(korean).toContainText('위성 영상');
 await page.setViewportSize({width:390,height:844});
 expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
 await korean.screenshot({path:testInfo.outputPath('split-process-korean-390.png')});
 await context.setOffline(false);

 await page.goto('./?sample=text-portfolio');
 await expect(page.locator('#save')).toBeEnabled();
 const canvas = page.frameLocator('.gjs-frame');
 await expect(canvas.locator('.bw-section')).toBeAttached();
 await page.locator('#save').click();
 await page.reload();
 await expect(canvas.locator('.bw-section article')).toHaveCount(2);
 await page.locator('#export-top').click();
 const event = page.waitForEvent('download');
 await page.locator('#download-site').click();
 const download = await event;
 const zip = await JSZip.loadAsync(await fs.readFile(await download.path()));
 const exported = await context.newPage();
 await exported.route('https://process-export.example/**', async route => {
  const path = new URL(route.request().url()).pathname.slice(1) || 'index.html';
  const file = zip.file(path);
  await route.fulfill({status:file?200:404,contentType:path.endsWith('.css')?'text/css':'text/html',body:file?await file.async('string'):''});
 });
 await exported.goto('https://process-export.example/');
 const section = exported.locator('.bw-section');
 await expect(section).toContainText('For Gorilla Rampage');
 await expect(section.locator('.bw-panel')).toHaveCSS('background-image',/linear-gradient/);
 await expect(section.locator('img,input,button')).toHaveCount(0);
 expect(await section.locator('.bw-word').evaluate(el => getComputedStyle(el).backgroundClip)).toBe('text');
 await exported.setViewportSize({width:390,height:844});
 await section.screenshot({path:testInfo.outputPath('split-process-export-390.png')});
});
