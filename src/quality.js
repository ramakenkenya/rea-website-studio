export function audit(editor,brief){
 const doc=new DOMParser().parseFromString(editor.getHtml(),'text/html');const css=editor.getCss();
 const links=[...doc.querySelectorAll('a')];
 const broken=links.filter(a=>{const v=a.getAttribute('href')||'';return !v||v==='#'||v.startsWith('#')&&!doc.getElementById(v.slice(1));});
 const images=[...doc.querySelectorAll('img')];
 return [
 {label:'Page title',ok:!!brief.title&&brief.title.length<=70,detail:brief.title?`${brief.title.length} characters. Aim for a clear, descriptive title.`:'Add a page title in the Brief panel.'},
 {label:'Search description',ok:brief.description.length>=30&&brief.description.length<=160,detail:`${brief.description.length} characters. Aim for 30–160 useful characters.`},
 {label:'One main heading',ok:doc.querySelectorAll('h1').length===1,detail:`${doc.querySelectorAll('h1').length} H1 headings found.`},
 {label:'Image descriptions',ok:images.every(i=>(i.getAttribute('alt')||'').trim()),detail:`${images.filter(i=>!(i.getAttribute('alt')||'').trim()).length} images need descriptive alt text.`},
 {label:'Contact email',ok:!!brief.email,detail:brief.email||'Add a real contact email before publishing.'},
 {label:'Link destinations',ok:broken.length===0,detail:`${broken.length} empty or missing anchor destinations. Check external links manually.`},
 {label:'Responsive styles',ok:css.includes('@media'),detail:'Responsive CSS is included. Check the phone preview and your actual devices.'},
 {label:'Standalone export',ok:!!doc.querySelector('main,section'),detail:'Export contains page HTML and CSS; no editor account or runtime is required.'}
 ];
}
