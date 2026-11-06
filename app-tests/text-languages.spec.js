import {test,expect} from '@playwright/test';

test('Korean typography keeps a complete readable layout across phone and desktop widths',async({page},info)=>{
 await page.goto('./samples/rama-ken/');
 await expect(page.locator('.tp-kicker')).toContainText('LIVED & STUDIED IN SOUTH KOREA');
 await page.getByRole('link',{name:'한국어',exact:true}).click();
 await expect(page.locator('html')).toHaveAttribute('lang','ko');
 await expect(page.locator('h1')).toHaveText('라마켄.');
 await expect(page.locator('.tp-language-switch a[aria-current="page"]')).toHaveText('한국어');
 await expect(page.locator('.tp-about-copy')).toContainText('한국에서 생활하며 공부');
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:1000});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  for(const link of await page.locator('.tp-language-switch a').all())expect((await link.boundingBox()).height).toBeGreaterThanOrEqual(44);
  expect(await page.locator('.tp-art').evaluate(el=>getComputedStyle(el).fontFamily)).toContain('Courier');
  await page.screenshot({path:info.outputPath(`korean-${width}.png`),fullPage:true});
 }
 await page.getByRole('link',{name:'English',exact:true}).click();await expect(page.locator('h1')).toContainText('RAMA');
});

test('single-file sample changes language offline, keeps Korean section navigation and keyboard access',async({page},info)=>{
 await page.goto('./samples/rama-ken/preview.html');await page.context().setOffline(true);
 await page.setViewportSize({width:390,height:844});
 await expect(page.locator('.tp-preview-en')).toBeVisible();await expect(page.locator('.tp-preview-ko')).toBeHidden();
 const korean=page.getByRole('link',{name:'한국어',exact:true});await korean.focus();await page.keyboard.press('Enter');
 await expect(page.locator('.tp-preview-ko')).toBeVisible();await expect(page.locator('.tp-preview-en')).toBeHidden();
 await page.getByRole('link',{name:'작업',exact:true}).click();
 await expect(page).toHaveURL(/#ko-work$/);await expect(page.locator('.tp-preview-ko')).toBeVisible();
 await page.getByRole('link',{name:'소개',exact:true}).click();await expect(page.locator('#ko-about')).toBeVisible();
 await page.getByRole('link',{name:'맨 위로 ↑',exact:true}).click();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:info.outputPath('bilingual-offline-korean.png'),fullPage:true});
 await page.getByRole('link',{name:'English',exact:true}).click();await expect(page.locator('.tp-preview-en')).toBeVisible();
 expect(await page.locator('script').count()).toBe(0);
});

test('completed bilingual starter opens both editable languages from Library',async({page})=>{
 await page.goto('./');await expect(page.locator('#save')).toBeEnabled();page.on('dialog',d=>d.accept());
 await page.getByRole('button',{name:'Studio tools',exact:true}).click();await page.getByRole('tab',{name:'Library',exact:true}).click();
 await page.getByRole('button',{name:'Use Rama Ken · text portfolio starter',exact:true}).click();
 await expect(page.locator('#studio-page-tabs button')).toHaveCount(2);
 await page.getByRole('button',{name:'Open 한국어 page',exact:true}).click();
 await expect(page.frameLocator('.gjs-frame').locator('h1')).toContainText('라마');
 await expect(page.frameLocator('.gjs-frame').locator('header')).toHaveCount(1);
 await page.getByRole('button',{name:'Studio tools',exact:true}).click();await page.getByRole('tab',{name:'Library',exact:true}).click();
 await page.getByRole('button',{name:'Insert FAQ',exact:true}).click();await page.getByRole('button',{name:'Close studio tools',exact:true}).click();
 expect(await page.frameLocator('.gjs-frame').locator('[data-section="FAQ"]').evaluate(el=>parseFloat(getComputedStyle(el).paddingTop))).toBeGreaterThan(0);
});
