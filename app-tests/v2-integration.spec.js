import {test,expect} from '@playwright/test';
import JSZip from 'jszip';
import fs from 'node:fs/promises';
import {mockImageHost,addUrlPhoto,photoUrl} from './photo-fixture.js';
const ready=async p=>{await p.goto('./');await expect(p.getByRole('button',{name:'Save project',exact:true})).toBeEnabled();};
const tools=async(p,tab)=>{await p.getByRole('button',{name:'Studio tools',exact:true}).click();await p.getByRole('tab',{name:tab,exact:true}).click();};
const close=p=>p.getByRole('button',{name:'Close studio tools',exact:true}).click();
const zip=async p=>{await p.getByRole('button',{name:'Export site',exact:true}).click();const event=p.waitForEvent('download');await p.getByRole('button',{name:'Download website ZIP',exact:true}).click();return JSZip.loadAsync(await fs.readFile(await(await event).path()));};
test('unvisited pages keep one navigation and export home, order and search visibility',async({page})=>{
 await ready(page);await tools(page,'Pages');
 for(const [name,kind]of[['Our story','about'],['Contact us','contact']]){await page.getByLabel('New page name',{exact:true}).fill(name);await page.getByLabel('Page layout',{exact:true}).selectOption(kind);await page.getByRole('button',{name:'Add page',exact:true}).click();}
 await page.getByRole('button',{name:'Make home page',exact:true}).click();await page.getByRole('button',{name:'Move page earlier',exact:true}).click();
 await page.getByLabel('Show in site navigation',{exact:true}).uncheck();await page.getByLabel('Ask search engines not to index this page',{exact:true}).check();await page.getByRole('button',{name:'Save page settings',exact:true}).click();
 await page.getByRole('tab',{name:'Site',exact:true}).click();await page.getByLabel('Public site URL',{exact:true}).fill('https://example.com/studio');await page.getByRole('button',{name:'Save site settings',exact:true}).click();await close(page);
 const files=await zip(page),home=await files.file('index.html').async('string'),story=await files.file('our-story.html').async('string');
 expect(home).toContain('noindex,follow');expect(await files.file('robots.txt').async('string')).not.toContain('Disallow:');expect(story).not.toContain('>Contact us</a>');expect(home.match(/<header\b/g)).toHaveLength(1);expect(story.match(/<header\b/g)).toHaveLength(1);expect(await files.file('sitemap.xml').async('string')).not.toContain('/index.html');
 await page.getByRole('button',{name:'Save project',exact:true}).click();await page.reload();await expect(page.locator('#studio-page-tabs button[data-page]').nth(1)).toHaveText('⌂ Contact us');
 await page.getByRole('button',{name:'Checks',exact:true}).click();await expect(page.locator('#quality-results .check-item')).toHaveCount(21);await expect(page.locator('#quality-results')).toContainText('Our story · Internal link destinations');await page.getByRole('button',{name:'Close checks',exact:true}).click();
});
test('saved sections survive reload and reuse without reverting the current brand',async({page})=>{
 await ready(page);await tools(page,'Library');await page.getByRole('button',{name:'Insert FAQ',exact:true}).click();await close(page);
 const canvas=page.frameLocator('.gjs-frame');await canvas.locator('[data-section="FAQ"] h2').click();await page.getByLabel('Font size',{exact:true}).fill('47');await page.getByLabel('Font size',{exact:true}).press('Tab');
 await tools(page,'Library');await page.getByLabel('Section name',{exact:true}).fill('Portable FAQ');await page.getByRole('button',{name:'Save selected section',exact:true}).click();await close(page);
 await page.getByRole('button',{name:'Save project',exact:true}).click();await page.reload();await tools(page,'Brand');await page.getByLabel('Paper color',{exact:true}).fill('#eeeecc');await page.getByRole('button',{name:'Apply brand',exact:true}).click();
 await page.getByRole('tab',{name:'Library',exact:true}).click();await page.getByRole('button',{name:'Insert Portable FAQ',exact:true}).click();await close(page);
 await expect(canvas.locator('[data-section="FAQ"]')).toHaveCount(2);await expect(canvas.locator('details')).toHaveCount(6);for(const heading of await canvas.locator('[data-section="FAQ"] h2').all())await expect(heading).toHaveCSS('font-size','47px');await expect(canvas.locator('body')).toHaveCSS('background-color','rgb(238, 238, 204)');
 await page.getByRole('button',{name:'Save project',exact:true}).click();await page.reload();await expect(canvas.locator('details')).toHaveCount(6);
});
test('assets, logo, favicon, language and sharing metadata reach the website ZIP',async({page})=>{
 await mockImageHost(page);await ready(page);await tools(page,'Assets');await addUrlPhoto(page);await page.getByLabel('Search assets',{exact:true}).fill('missing');await expect(page.getByRole('button',{name:'Insert studio logo',exact:true})).toHaveCount(0);await page.getByLabel('Search assets',{exact:true}).fill('logo');await page.getByRole('button',{name:'Insert studio logo',exact:true}).click();
 await page.getByRole('tab',{name:'Brand',exact:true}).click();await page.getByLabel('Business logo URL',{exact:true}).fill(photoUrl);await page.getByRole('button',{name:'Apply logo URL',exact:true}).click();await expect(page.locator('#toast')).toHaveText('Logo applied to your navigation.');
 await page.getByRole('tab',{name:'Site',exact:true}).click();await page.getByLabel('Favicon URL',{exact:true}).fill(photoUrl);await page.getByRole('button',{name:'Apply favicon URL',exact:true}).click();await expect(page.locator('#toast')).toHaveText('Favicon included in your export.');
 await page.getByLabel('Site language',{exact:true}).fill('sw');await page.getByLabel('Text direction',{exact:true}).selectOption('rtl');await page.getByLabel('Social sharing image URL',{exact:true}).fill('https://example.com/share.png');await page.getByRole('button',{name:'Save site settings',exact:true}).click();await close(page);
 await expect(page.frameLocator('.gjs-frame').locator('body')).toHaveAttribute('dir','rtl');
 const files=await zip(page),html=await files.file('index.html').async('string');expect(html).toContain('lang="sw" dir="rtl"');expect(html).toContain('rel="icon" href="https://images.example/studio-logo.png');expect(html).toContain('property="og:image" content="https://example.com/share.png"');expect(html).toContain('<img');expect(html).toContain('alt="studio logo"');expect(html).toContain('class="site-brand"');
});
test('all three original starters replace copy and artwork, and canvas save shortcut works',async({page},info)=>{
 await ready(page);page.on('dialog',d=>d.accept());
 for(const [label,name]of[['Coffee shop','Morning Fold Coffee'],['Furniture showroom','Field & Form'],['Personal portfolio','Alex Morgan']]){await tools(page,'Library');await page.getByRole('button',{name:`Use ${label} starter`,exact:true}).click();await expect(page.frameLocator('.gjs-frame').locator('body')).toContainText(name);await expect(page.frameLocator('.gjs-frame').locator('h1')).toHaveCount(1);}
 await page.frameLocator('.gjs-frame').locator('h1').click();await page.keyboard.press('Control+s');await expect(page.locator('#save-status')).toHaveText('Saved on this device');await page.screenshot({path:info.outputPath('portfolio-starter.png'),fullPage:true});
});

test('text search, element duplication, link controls and responsive visibility reach exports',async({page})=>{
 await ready(page);await tools(page,'Library');await page.getByLabel('Find page text',{exact:true}).fill('Start a conversation');await page.getByRole('button',{name:'Find on this page',exact:true}).click();await page.locator('#v2-found-text [data-found]').first().click();
 await page.getByLabel('Link destination',{exact:true}).fill('https://example.com/book');await page.getByLabel('Open link in new tab',{exact:true}).check();await page.getByRole('button',{name:'Apply link',exact:true}).click();await page.getByLabel('Element visibility',{exact:true}).selectOption('phone');await page.getByRole('button',{name:'Duplicate selected element',exact:true}).click();
 await expect(page.frameLocator('.gjs-frame').locator('a[href="https://example.com/book"]')).toHaveCount(2);
 const files=await zip(page),html=await files.file('index.html').async('string');expect(html).toContain('target="_blank"');expect(html).toContain('noopener noreferrer');expect(html).toContain('studio-hide-phone');expect(await files.file('studio.css').async('string')).toContain('.studio-hide-phone');
});
