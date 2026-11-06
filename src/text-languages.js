import {pageFile} from './site-model.js';
import {escapeHtml as e} from './project.js';

export function textPageLocale(wrapper){
 return wrapper.findType?.(c=>['en','ko'].includes(c.getAttributes()['data-text-locale']),{max:1})?.[0]?.getAttributes()['data-text-locale'];
}
export function textLanguageTargets(editorPages,studio){
 const targets={};
 for(const page of editorPages){
  const locale=textPageLocale(page.getMainComponent());
  if(!['en','ko'].includes(locale))continue;
  const meta=studio.pages.find(p=>p.id===page.id);if(meta&&(!targets[locale]||meta.id===studio.homeId))targets[locale]=pageFile(meta,studio);
 }
 return targets;
}
export function rewriteTextLanguageLinks(html,targets){
 return html.replace(/<a\b[^>]*\bdata-language-target="(en|ko)"[^>]*>/g,(tag,locale)=>{
  const clean=tag.replace(/\s(?:href|aria-disabled)="[^"]*"/g,'');
  return clean.slice(0,-1)+(targets[locale]?` href="${e(targets[locale])}">`:' aria-disabled="true">');
 });
}
export function syncTextLanguageLinks(editor,studio){
 const pages=Array.from(editor.Pages.getAll()),targets=textLanguageTargets(pages,studio);
 for(const page of pages)for(const link of page.getMainComponent().findType(c=>['en','ko'].includes(c.getAttributes()['data-language-target']))){
  const href=targets[link.getAttributes()['data-language-target']];
  link.removeAttributes(href?'aria-disabled':'href');link.addAttributes(href?{href}:{'aria-disabled':'true'});
 }
}
