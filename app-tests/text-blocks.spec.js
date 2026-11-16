import {test,expect} from '@playwright/test';
import JSZip from 'jszip';
import fs from 'node:fs/promises';

test('Text only opens the portfolio and applies editable styles from a separate tab',async({page})=>{
 await page.goto('./');
 await expect(page.locator('#save')).toBeEnabled();
 await page.getByRole('button',{name:'New website',exact:true}).click();
 await page.getByRole('radio',{name:'Text only',exact:true}).check();
 await page.getByRole('button',{name:'Create website',exact:true}).click();
 const canvas=page.frameLocator('.gjs-frame');
 const left=page.getByRole('region',{name:'Build tools'});
 await left.getByRole('button',{name:'Original portfolio',exact:true}).press('Enter');
 await expect(left.getByRole('button',{name:'Add Editorial notes'})).toBeVisible();
 await expect(left.getByRole('button',{name:'Add Monochrome motion',exact:true})).toHaveCount(0);
 await expect(canvas.locator('.mm-section')).toHaveCount(0);
 await page.getByRole('button',{name:'Open 한국어 page',exact:true}).click();
 await expect(canvas.locator('.tp-page[lang="ko"]')).toBeVisible();
 await expect(canvas.locator('.mm-section')).toHaveCount(0);
 await page.getByRole('button',{name:'Open English page',exact:true}).click();
 await expect(left.getByRole('combobox')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Open 한국어 page',exact:true})).toBeVisible();
 await expect(canvas.locator('.tp-hero h1')).toHaveText(/RAMA\s*KEN/);
 await expect(canvas.locator('.tp-hero .tp-outline')).toHaveCSS('-webkit-text-stroke-width','1px');
 await expect(canvas.locator('.tp-project-num').first()).toHaveCSS('-webkit-text-stroke-width','1px');
 await expect(canvas.locator('.tp-inset-small')).toHaveCSS('background-color','rgb(243, 241, 233)');
 await left.getByRole('button',{name:'Style',exact:true}).click();
 await expect(left.getByRole('button',{name:'Add Editorial notes'})).toBeHidden();
 await canvas.locator('.tp-note h3').first().click();
 await left.getByRole('button',{name:'Inset text',exact:true}).click();
 const treated=canvas.locator('.tp-note h3[data-type-treatment="inset"]');
 await expect(treated.locator('.type-treatment-main')).toHaveText('The work behind the finished thing.');
 await left.getByLabel('Small text').fill('A closer');
 await left.getByLabel('Large text').fill('LOOK');
 await left.getByRole('button',{name:'Update inset text'}).click();
 await expect(treated.locator('.type-treatment-small')).toHaveText('A closer');
 await expect(treated.locator('.type-treatment-main')).toHaveText('LOOK');
 await page.getByRole('button',{name:'Mobile preview',exact:true}).click();
 await expect.poll(()=>canvas.locator('.tp-page').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
 await page.getByRole('button',{name:'Save project',exact:true}).click();
 await page.reload();
 await expect(treated.locator('.type-treatment-small')).toHaveText('A closer');
 await page.getByRole('button',{name:'Export site',exact:true}).click();
 const download=page.waitForEvent('download');
 await page.getByRole('button',{name:'Download website ZIP',exact:true}).click();
 const zip=await JSZip.loadAsync(await fs.readFile(await (await download).path()));
 expect(await zip.file('index.html').async('string')).toContain('A closer');
 expect(await zip.file('styles.css').async('string')).toContain('type-treatment-main');
 expect(zip.file('ko.html')).toBeTruthy();
});

test('a blank Text Only site can mix inspiration sections and original portfolio blocks',async({page})=>{
 await page.goto('./?sample=rama-studio');
 await expect(page.locator('#save')).toBeEnabled();
 const left=page.getByRole('region',{name:'Build tools'});
 await expect(left.getByRole('button',{name:'Start here',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'New website',exact:true}).click();
 await page.getByRole('radio',{name:'Text only',exact:true}).check();
 await page.getByLabel('Start with a blank page').check();
 await page.getByLabel('Business name').fill('My text website');
 await page.getByRole('button',{name:'Create website',exact:true}).click();
 const canvas=page.frameLocator('.gjs-frame');
 await expect(page.locator('#text-empty-canvas')).toBeVisible();
 await expect(left.locator('.styled-text-preset')).toHaveCount(41);
 const group=name=>left.getByRole('button',{name,exact:true});
 const add=name=>left.getByRole('button',{name:'Add '+name,exact:true});
 await group('Header & opening').click();
 await add('Headline · Outline Poster').click();
 await expect(canvas.locator('.tb-outline-poster .tb-title')).toHaveText('My text website');
 await expect(canvas.locator('.tb-outline-poster .tb-poster-type')).toHaveCSS('-webkit-text-stroke-width','1px');
 await group('About & statements').click();
 await add('About · Framed Editorial Spread').click();
 const spread=canvas.locator('.tb-editorial-spread');
 await expect(spread.locator('h2')).toHaveText('Ideas in practice');
 await page.getByLabel('Section colors').selectOption('dark');
 await expect(spread).toHaveCSS('background-color','rgb(17, 18, 17)');
 await spread.locator('h2').click();
 await group('Style').click();
 await group('Outline echo').click();
 await expect(spread.locator('h2')).toHaveAttribute('data-type-treatment','echo');
 await expect(spread.locator('h2')).not.toHaveCSS('text-shadow','none');
 await group('Sections').click();
 await group('Original portfolio').click();
 await add('Portfolio footer').click();
 await expect(canvas.locator('[data-portfolio-part="footer"] footer')).toBeVisible();
 await page.getByRole('button',{name:'Mobile preview',exact:true}).click();
 await expect.poll(()=>spread.evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(1);
 await page.getByRole('button',{name:'Save project',exact:true}).click();
 await page.reload();
 await expect(spread).toHaveAttribute('data-text-tone','dark');
 await expect(spread.locator('h2')).toHaveAttribute('data-type-treatment','echo');
 await page.getByRole('button',{name:'Export site',exact:true}).click();
 const download=page.waitForEvent('download');
 await page.getByRole('button',{name:'Download website ZIP',exact:true}).click();
 const zip=await JSZip.loadAsync(await fs.readFile(await (await download).path()));
 expect(await zip.file('index.html').async('string')).toContain('data-styled-text-block="editorial-spread"');
 expect(await zip.file('styles.css').async('string')).toContain('.tb-editorial-spread');
});

test('older Text Only drafts and backups reopen without the retired section on any page',async({page})=>{
 await page.goto('./?sample=portfolio-reference');
 await expect(page.locator('#save')).toBeEnabled();
 await page.getByRole('button',{name:'Save project',exact:true}).click();
 const oldDraft=await page.evaluate(()=>{
  const key='rea-studio.project.v1';
  const draft=JSON.parse(localStorage.getItem(key));
  const retired={tagName:'section',classes:['mm-section'],attributes:{'data-section':'Monochrome motion'},
   components:[{tagName:'h2',content:'A different perspective.'}]};
  const custom={tagName:'section',classes:['custom-section'],content:'My existing section'};
  for(const [index,entry] of draft.project.pages.entries()){
   const wrapper=entry.frames[0].component;
   wrapper.components.push(custom,index===0?retired:{
    tagName:'div',attributes:{'data-portfolio-part':'motion'},components:[retired],
   });
  }
  draft.project.styles.push({selectors:['mm-section'],style:{animation:'mm-travel 32s linear infinite'}});
  draft.studio.sections.push({id:'legacy-motion',name:'My saved motion section',html:'<section class="mm-section"><h2>A different perspective.</h2></section>'});
  const text=JSON.stringify(draft);
  localStorage.setItem(key,text);
  return text;
 });
 const canvas=page.frameLocator('.gjs-frame');
 const checkPages=async()=>{
  await expect(canvas.locator('.custom-section')).toHaveText('My existing section');
  await expect(canvas.locator('.mm-section')).toHaveCount(0);
  await page.getByRole('button',{name:'Open 한국어 page',exact:true}).click();
  await expect(canvas.locator('.tp-page[lang="ko"]')).toBeVisible();
  await expect(canvas.locator('.custom-section')).toHaveText('My existing section');
  await expect(canvas.locator('[data-portfolio-part="motion"],.mm-section')).toHaveCount(0);
 };
 await page.reload();
 await checkPages();
 await page.locator('#restore-file').setInputFiles({name:'old-text-project.json',mimeType:'application/json',buffer:Buffer.from(oldDraft)});
 await expect(page.locator('#toast')).toContainText('Project restored');
 await checkPages();
 await page.getByRole('button',{name:'Export site',exact:true}).click();
 const download=page.waitForEvent('download');
 await page.getByRole('button',{name:'Download website ZIP',exact:true}).click();
 const zip=await JSZip.loadAsync(await fs.readFile(await (await download).path()));
 for(const file of ['index.html','ko.html']){
  const html=await zip.file(file).async('string');
  expect(html).toContain('My existing section');
  expect(html).not.toMatch(/mm-section|<h2[^>]*>A different perspective\.<\/h2>/);
 }
 expect(await zip.file('styles.css').async('string')).not.toMatch(/mm-section|mm-travel/);
 await page.getByRole('button',{name:'Save project',exact:true}).click();
 const saved=await page.evaluate(()=>localStorage.getItem('rea-studio.project.v1'));
 expect(saved).not.toMatch(/mm-section|mm-travel|legacy-motion/);
});
