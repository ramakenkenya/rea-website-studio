import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import JSZip from 'jszip';

async function checkSwitch(frame,keyboard=false){
 const korean=frame.getByRole('link',{name:'한국어',exact:true});
 await expect(korean).toHaveAttribute('href','ko.html');
 await expect(korean).not.toHaveAttribute('aria-disabled','true');
 await expect(korean).toHaveCSS('cursor','pointer');
 if(keyboard)await korean.press('Enter');else await korean.click();
 await expect(frame.locator('html')).toHaveAttribute('lang','ko');
 await expect(frame.locator('h1')).toContainText('라마');
 await expect(frame.getByRole('link',{name:'작업',exact:true})).toBeVisible();
 await frame.getByRole('link',{name:'English',exact:true}).click();
 await expect(frame.locator('html')).toHaveAttribute('lang','en');
 await expect(frame.locator('h1')).toContainText('RAMA');
}
for(const legacy of [false,true])test(`${legacy?'legacy single-page saved draft':'complete starter'} switches languages in modal, separate preview and export`,async({page,context})=>{
 await page.goto('./?sample=portfolio-reference');await expect(page.locator('#save')).toBeEnabled();
 if(legacy){
  await page.getByRole('button',{name:'Save project',exact:true}).click();
  // Recreate the old New website flow: an ordinary Home page containing the
  // bilingual header, but no Korean page. Keep an author edit and site setting.
  await page.evaluate(()=>{
   const key='rea-studio.project.v1',draft=JSON.parse(localStorage.getItem(key));
   const en=draft.project.pages[0];en.id='legacy-home';en.name='Home';
   const visit=value=>{if(!value||typeof value!=='object')return;delete value['data-language-pair-version'];if(value.content==='RAMA')value.content='RAMA CUSTOM';for(const child of Object.values(value))visit(child);};visit(en);
   draft.project.pages=[en];draft.studio.homeId='legacy-home';draft.studio.pages=[{...draft.studio.pages[0],id:'legacy-home',name:'Home',title:'My custom title'}];
   localStorage.setItem(key,JSON.stringify(draft));
  });
  await page.reload();await expect(page.locator('#save')).toBeEnabled();
  await expect(page.locator('#studio-page-tabs button')).toHaveCount(2);
  await expect(page.frameLocator('.gjs-frame').locator('h1')).toContainText('CUSTOM');
  await page.getByRole('button',{name:'Save project',exact:true}).click();
  await page.reload();await expect(page.locator('#save')).toBeEnabled();
  await expect(page.locator('#studio-page-tabs button')).toHaveCount(2);
 }
 await page.getByRole('button',{name:'Preview website',exact:true}).click();
 await checkSwitch(page.frameLocator('#studio-preview-frame'));
 const popupPromise=page.waitForEvent('popup');await page.getByRole('button',{name:'Open in new tab',exact:true}).click();
 const popup=await popupPromise;await checkSwitch(popup.frameLocator('iframe'),true);await popup.close();
 await page.getByRole('button',{name:'Close website preview',exact:true}).click();
 await page.getByRole('button',{name:'Export site',exact:true}).click();
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download website ZIP',exact:true}).click();
 const zip=await JSZip.loadAsync(await fs.readFile(await (await download).path()));
 expect(zip.file('ko.html')).toBeTruthy();
 const files=Object.fromEntries(await Promise.all(Object.keys(zip.files).filter(name=>!zip.files[name].dir).map(async name=>[name,await zip.file(name).async('string')])));
 const exported=await context.newPage();
 await exported.route('https://language-export.example/**',route=>{const name=new URL(route.request().url()).pathname.slice(1)||'index.html';return route.fulfill({contentType:name.endsWith('.css')?'text/css':'text/html',body:files[name]||''});});
 await exported.goto('https://language-export.example/');await checkSwitch(exported,true);
 if(legacy)await expect(exported.locator('h1')).toContainText('CUSTOM');
});

test('deleting Korean from a complete starter stays deleted after saving and reopening',async({page})=>{
 await page.goto('./?sample=portfolio-reference');await expect(page.locator('#save')).toBeEnabled();
 await page.getByRole('button',{name:'Open 한국어 page',exact:true}).click();
 await page.getByRole('button',{name:'Studio tools',exact:true}).click();
 page.on('dialog',dialog=>dialog.accept());
 await page.getByRole('button',{name:'Delete page',exact:true}).click();
 await page.getByRole('button',{name:'Close studio tools',exact:true}).click();
 await page.getByRole('button',{name:'Save project',exact:true}).click();
 await page.reload();await expect(page.locator('#save')).toBeEnabled();
 await expect(page.locator('#studio-page-tabs button')).toHaveCount(1);
 await page.getByRole('button',{name:'Preview website',exact:true}).click();
 await expect(page.frameLocator('#studio-preview-frame').locator('[data-language-target="ko"]')).toHaveAttribute('aria-disabled','true');
});
