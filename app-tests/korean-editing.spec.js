import {test,expect} from '@playwright/test';
import JSZip from 'jszip';
import fs from 'node:fs/promises';
import {TEXT_BLOCK_PRESETS,textBlockMarkup} from '../src/text-blocks.js';
import {TEXT_BLOCK_CSS} from '../src/text-block-style.js';
import {TEXT_CATALOG_CSS} from '../src/text-catalog-style.js';

test('all Korean catalog layouts fit phone, tablet and desktop widths',async({page},info)=>{
 await page.setContent(`<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>body{margin:0}${TEXT_BLOCK_CSS}${TEXT_CATALOG_CSS}</style></head><body>${TEXT_BLOCK_PRESETS.map(preset=>textBlockMarkup(preset,{language:'ko'})).join('')}</body></html>`);
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900});
  const overflow=await page.locator('[data-styled-text-block]').evaluateAll(blocks=>blocks.filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>el.dataset.styledTextBlock));
  expect(overflow,`Korean blocks overflowing at ${width}px`).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.setViewportSize({width:390,height:844});
 await page.locator('.tb-ruled-faq').screenshot({path:info.outputPath('korean-faq-mobile.png')});
});

test('Korean blocks stay localized through insertion, page switching, saving, preview and export',async({page,context},info)=>{
 await page.goto('./?sample=portfolio-reference');
 await expect(page.locator('#save')).toBeEnabled();
 await page.getByRole('button',{name:'Open 한국어 page',exact:true}).click();
 const canvas=page.frameLocator('.gjs-frame');
 const tools=page.getByRole('region',{name:'Build tools'});
 const addFaq=tools.getByRole('button',{name:'Add FAQ · Ruled Questions',exact:true});
 if(!await addFaq.isVisible())await tools.getByRole('button',{name:'FAQ',exact:true}).click();
 await addFaq.click();
 const faq=canvas.locator('[data-styled-text-block="ruled-faq"]');
 await expect(faq.locator('summary').first()).toHaveText('어떻게 시작하나요?');
 await expect(faq).toHaveAttribute('lang','ko');
 await tools.getByRole('button',{name:'Header & opening',exact:true}).click();
 await tools.getByRole('button',{name:'Add Headline · Bold Stack',exact:true}).click();
 const heading=canvas.locator('.tb-bold-stack .tb-title');
 await expect(heading).toContainText('디자인');
 expect(await heading.evaluate(el=>parseFloat(getComputedStyle(el).lineHeight)/parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(1.1);
 const addText=tools.getByRole('button',{name:'Add Text',exact:true});
 if(!await addText.isVisible())await tools.getByRole('button',{name:'Start here',exact:true}).click();
 await addText.click();
 await expect(canvas.locator('[data-section="Text"] h2')).toHaveText('제목을 입력하세요');
 await tools.getByRole('button',{name:'Original portfolio',exact:true}).click();
 await tools.getByRole('button',{name:'Add About',exact:true}).click();
 await expect(canvas.locator('.tp-about-grid')).toHaveCount(2);
 await page.getByRole('button',{name:'Open English page',exact:true}).click();
 if(!await addFaq.isVisible())await tools.getByRole('button',{name:'FAQ',exact:true}).click();
 await addFaq.click();
 await expect(canvas.locator('.tb-questions summary').first()).toHaveText('How do we get started?');
 await page.getByRole('button',{name:'Open 한국어 page',exact:true}).click();
 await expect(faq.locator('summary').first()).toHaveText('어떻게 시작하나요?');
 await page.getByRole('button',{name:'Save project',exact:true}).click();
 await page.reload();await expect(page.locator('#save')).toBeEnabled();
 await page.getByRole('button',{name:'Open 한국어 page',exact:true}).click();
 await expect(faq.locator('summary').first()).toHaveText('어떻게 시작하나요?');
 const popupPromise=page.waitForEvent('popup');
 await page.locator('#preview-tab-top').click();
 const popup=await popupPromise;
 await expect(popup.frameLocator('iframe').locator('html')).toHaveAttribute('lang','ko');
 await expect(popup.frameLocator('iframe').locator('.tb-questions summary').first()).toHaveText('어떻게 시작하나요?');
 await popup.close();
 await page.getByRole('button',{name:'Export site',exact:true}).click();
 const download=page.waitForEvent('download');
 await page.getByRole('button',{name:'Download website ZIP',exact:true}).click();
 const zip=await JSZip.loadAsync(await fs.readFile(await (await download).path()));
 const files=Object.fromEntries(await Promise.all(Object.keys(zip.files).map(async name=>[name,await zip.file(name).async('string')])));
 const exported=await context.newPage();
 await exported.route('https://korean-export.example/**',route=>{const name=new URL(route.request().url()).pathname.slice(1)||'index.html';return route.fulfill({contentType:name.endsWith('.css')?'text/css':'text/html',body:files[name]||''});});
 await exported.goto('https://korean-export.example/ko.html');
 await expect(exported.locator('html')).toHaveAttribute('lang','ko');
 await expect(exported.locator('.tb-questions summary').first()).toHaveText('어떻게 시작하나요?');
 for(const width of [320,390,768,1440]){
  await exported.setViewportSize({width,height:900});
  expect(await exported.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await exported.setViewportSize({width:390,height:844});
 await exported.locator('.tb-bold-stack').screenshot({path:info.outputPath('korean-heading-mobile.png')});
 await exported.getByRole('link',{name:'English',exact:true}).click();
 await expect(exported.locator('h1')).toContainText('RAMA');
});
