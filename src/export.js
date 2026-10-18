import JSZip from 'jszip';
import {escapeHtml as e,fileSlug} from './project.js';
export function buildDocument({html,brief}){
 const body=/^\s*<body[\s>]/i.test(html)?html:`<body>${html}</body>`;
 return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(brief.title||brief.name)}</title><meta name="description" content="${e(brief.description)}"><meta property="og:title" content="${e(brief.title||brief.name)}"><meta property="og:description" content="${e(brief.description)}"><meta property="og:type" content="website"><link rel="stylesheet" href="styles.css"></head>${body}</html>`;
}
export function exportFiles(editor,brief){return {'index.html':buildDocument({html:editor.getHtml({cleanId:true}),brief}),'styles.css':editor.getCss(),'README.txt':`Created with REA Studio.\n\nOpen index.html beside styles.css to preview your website. Upload both files to a static host, including GitHub Pages. Embedded uploaded images are included in the HTML.\n\nCheck your business copy, contact links, image descriptions and licensing before publishing. This package is a static website; it does not include a form backend or analytics.\n\nKeep a separate REA project JSON backup if you want to edit this design later.\n`};}
export async function siteZip(editor,brief){const z=new JSZip();for(const [name,content] of Object.entries(exportFiles(editor,brief)))z.file(name,content);return z.generateAsync({type:'blob'});}
export function download(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);}
export const exportName=brief=>fileSlug(brief.name)+'-website.zip';
