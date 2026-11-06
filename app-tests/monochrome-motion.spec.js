import {test,expect} from '@playwright/test';

test('contrast section moves in opposite directions, pauses by keyboard and respects reduced motion',async({page},testInfo)=>{
 await page.goto('./samples/rama-ken/');
 const section=page.locator('.mm-section'),tracks=section.locator('.mm-track');
 await expect(section).toBeVisible();await section.scrollIntoViewIfNeeded();
 await expect.poll(()=>section.locator('img').evaluateAll(images=>images.every(i=>i.complete&&i.naturalWidth===600))).toBe(true);
 expect(await tracks.evaluateAll(els=>els.map(el=>getComputedStyle(el).animationDirection))).toEqual(['normal','reverse']);
 const before=await tracks.first().evaluate(el=>getComputedStyle(el).transform);
 await page.waitForTimeout(150);
 expect(await tracks.first().evaluate(el=>getComputedStyle(el).transform)).not.toBe(before);
 const control=section.getByRole('checkbox');await control.focus();await page.keyboard.press('Space');
 await expect(control).toBeChecked();await expect(section.getByText('Resume motion',{exact:true})).toBeVisible();
 expect(await tracks.evaluateAll(els=>els.every(el=>getComputedStyle(el).animationPlayState==='paused'))).toBe(true);
 const paused=await tracks.first().evaluate(el=>getComputedStyle(el).transform);await page.waitForTimeout(150);
 expect(await tracks.first().evaluate(el=>getComputedStyle(el).transform)).toBe(paused);
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:1000});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await section.screenshot({path:testInfo.outputPath(`contrast-${width}.png`)});
 }
 await page.keyboard.press('Space');await expect(control).not.toBeChecked();
 await page.emulateMedia({reducedMotion:'reduce'});
 expect(await tracks.evaluateAll(els=>els.every(el=>getComputedStyle(el).animationName==='none'))).toBe(true);
 await expect(section.locator('.mm-control')).toBeHidden();
 await expect(section.locator('.mm-still')).toBeVisible();
 await section.screenshot({path:testInfo.outputPath('contrast-reduced-motion.png')});
});

test('single-file Korean contrast is localized and works offline; editor export preserves motion styles',async({page},testInfo)=>{
 await page.goto('./samples/rama-ken/preview.html#ko');
 await page.context().setOffline(true);
 const korean=page.locator('#ko .mm-section');
 await expect(korean).toContainText('계속 만들다');await expect(korean).toContainText('움직임 멈추기');
 await korean.getByRole('checkbox').check();await expect(korean.getByText('움직임 재생하기',{exact:true})).toBeVisible();
 await page.setViewportSize({width:390,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await korean.screenshot({path:testInfo.outputPath('contrast-korean-390.png')});
 await page.context().setOffline(false);
 await page.goto('./?sample=text-portfolio');await expect(page.locator('#save')).toBeEnabled();
 const canvas=page.frameLocator('.gjs-frame');
 await expect(canvas.locator('.mm-section')).toBeAttached();
 await page.locator('#save').click();await page.reload();
 await expect(canvas.locator('.mm-section img')).toHaveCount(2);
 await page.locator('#export-top').click();const event=page.waitForEvent('download');await page.locator('#download-site').click();
 const download=await event;
 const {default:JSZip}=await import('jszip');const fs=await import('node:fs/promises');
 const zip=await JSZip.loadAsync(await fs.readFile(await download.path()));
 const css=await zip.file('styles.css').async('string');
 expect(css).toContain('@keyframes mm-travel');expect(css).toContain('animation-play-state:paused');
 expect(css).toContain('prefers-reduced-motion');
});
