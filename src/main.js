import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import './style.css';
import {normalizeBrief,snapshot,validateSnapshot,migrateBundledSample,readSaved,writeSaved,serializeBackup,MAX_BACKUP_BYTES,STORAGE_KEY,escapeHtml as esc,fileSlug} from './project.js';
import {createStarter,sectionContent,THEMES} from './templates.js';
import {TEXT_THEME_CSS} from './text-theme-style.js';
import {TEXT_BLOCK_CSS} from './text-block-style.js';
import {TEXT_CATALOG_CSS} from './text-catalog-style.js';
import {mountTextSections} from './text-theme-editor.js';
import {TYPE_TREATMENT_CSS,mountTypeTreatment} from './type-treatment.js';
import {siteZip,download,exportName,buildDocument} from './export.js';
import {audit} from './quality.js';
import {mountStudio} from './studio-v2.js';
import {createStudio} from './site-model.js';
import {EXTRA_BLOCKS,extraSection,EXTRA_CSS} from './blocks.js';
import {mountBriefImport} from './brief-import.js';
import {replaceImportedProject} from './import-transaction.js';
import {registerTextPortrait,mountPortraitControls,TEXTUAL_IMAGE_CSS} from './text-portrait.js';
import {createTextPortfolio,TEXT_SAMPLE_BRIEF,textSampleProject,textSampleMetadata} from './text-portfolio.js';
import {REFERENCE_PORTFOLIO_CSS,REFERENCE_PAINT_CSS,REFERENCE_PAINT_SELECTOR,PORTFOLIO_PART_CSS,referencePortfolioProject,referencePage} from './portfolio-reference.js';
const paths={grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',spark:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z',file:'M14 2H5v20h14V7zM14 2v6h5M8 13h8M8 17h6',palette:'M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h4c6 0 5-10-5-10zM7 8h.01M12 6h.01M17 8h.01',check:'m5 12 4 4L19 6',shield:'m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6zM8 12l3 3 5-6',arrow:'M5 12h14m-6-6 6 6-6 6',plus:'M12 5v14M5 12h14',close:'m6 6 12 12M6 18 18 6',download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',save:'M4 3h14l3 3v15H3V3zM7 3v7h10V3M7 21v-7h10v7',desktop:'M3 4h18v13H3zM8 21h8M12 17v4',tablet:'M5 2h14v20H5zM11 18h2',phone:'M7 2h10v20H7zM11 18h2',undo:'M4 4v6h6M4 10a8 8 0 1 1-1 7',redo:'M20 4v6h-6M20 10a8 8 0 1 0 1 7',image:'M3 3h18v18H3zM3 17l6-6 4 4 3-3 5 5M15 7h.01',text:'M4 5h16M12 5v15M8 20h8',layers:'m12 3 10 5-10 5L2 8zM2 12l10 5 10-5M2 16l10 5 10-5',up:'m6 15 6-6 6 6',down:'m6 9 6 6 6-6',trash:'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7',cursor:'m5 3 14 10-7 1-3 7z',external:'M14 3h7v7M21 3 10 14M10 3H3v18h18v-7',mail:'M3 5h18v14H3zM3 5l9 8 9-8',lock:'M5 10h14v11H5zM8 10V6a4 4 0 0 1 8 0v4',book:'M12 5C8 2 5 3 2 4v16c5-2 7-1 10 1 3-2 5-3 10-1V4c-3-1-6-2-10 1zM12 5v16',align:'M4 6h16M4 10h11M4 14h16M4 18h11'};
const icon=(name)=>`<svg aria-hidden="true" viewBox="0 0 24 24"><path d="${paths[name]||paths.grid}"/></svg>`;
const sections=[['hero','Hero','spark'],['services','Services','grid'],['about','About','text'],['image','Image','image'],['contact','Contact','mail']];
const initial={name:'Rama Studio',description:'Thoughtful spaces. Meaningful connections. We bring your ideas to life, one considered detail at a time.',services:'Architecture, Interiors, Creative direction',email:'',title:'Rama Studio — spaces with intention',cta:'Start a conversation',theme:'editorial'};
let brief=normalizeBrief(initial),dirty=false,ready=false,toastTimer,importing=false;
let browserCopy={ok:true,revision:null},baseRevision=null,ownsBrowserCopy=false,browserProblem='',autosaveTimer;
document.querySelector('#app').innerHTML=`
<header class="topbar"><a class="brand" href="./" aria-label="REA Studio home"><span class="brand-mark">R</span><span><strong>rea studio<span style="color:#87b5a0">.</span></strong><small>IDEA TO WEBSITE</small></span></a><div class="top-meta"><span class="dot"></span>Your ideas. Your website. Your code.</div><div class="top-actions"><a href="https://github.com/ramakenkenya/rea-website-studio" target="_blank" rel="noopener">View source ${icon('external')}</a><button class="btn ghost" id="evidence-top">${icon('book')} The REA story</button><button class="btn primary" id="new-site">${icon('plus')} New website</button></div></header>
<div class="app-layout"><aside class="sidebar"><div><p class="workspace-name">YOUR WORKSPACE</p><div class="workspace-card"><span class="workspace-icon">${icon('grid')}</span><span><strong>Personal studio</strong><small>A place for your ideas</small></span></div></div><div><p class="workspace-name">MAKE IT HAPPEN</p><nav class="nav-items" aria-label="Website workflow">${[['brief','file','Brief','01'],['pages','file','Pages','02'],['design','palette','Design','03'],['build','grid','Build','04'],['checks','shield','Checks','05'],['export','download','Export','06']].map(([id,i,name,num])=>`<button class="nav-item ${id==='build'?'active':''}" data-nav="${id}" aria-label="${name}">${icon(i)}<span>${name}</span><small class="nav-number">${num}</small></button>`).join('')}</nav></div><div class="research-card"><span class="mini-label">THE EXPERIMENT</span><strong>Reverse engineered.<br/>Reimagined by you.</strong><p>Built from an actual REA investigation of an open-source editor.</p><button id="evidence-side">Explore the evidence ${icon('arrow')}</button></div><div class="sidebar-footer">A Rama Ken project · v0.2.2</div></aside>
<main class="main"><div class="breadcrumb">Workspace <span>/</span> Websites <span>/</span> <strong id="crumb-name">Rama Studio</strong></div><div class="intro"><div><p class="eyebrow-app">A LITTLE IDEA. A REAL WEBSITE.</p><h1>One idea. A whole website.</h1><p>Create pages, shape your brand, and take your website with you.</p></div><div class="intro-actions"><a class="btn" href="?sample=portfolio-reference" target="_blank" rel="noopener">Open portfolio example ${icon('external')}</a><a class="btn tutorial-link" href="https://youtu.be/qEY4QGfgPTM" target="_blank" rel="noopener noreferrer" aria-label="Watch tutorial on YouTube (opens in a new tab)"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/></svg>Watch tutorial ${icon('external')}</a><span class="intro-tag">${icon('check')} Your code. No lock-in.</span></div></div>
<section class="template-downloads" aria-labelledby="template-downloads-heading"><div><h2 id="template-downloads-heading">Plan your website with a template</h2><p>Fill in your business details, pages and content. Word is editable; the PDF has fillable fields.</p><p class="template-status">Fill in a template, then open Brief and choose Upload completed template.</p></div><div class="template-download-actions"><a class="btn green" href="./templates/Rama_Studio_Website_Templates_v1.zip" download>${icon('download')} Download both <span>(ZIP)</span></a><a class="btn" href="./templates/Rama_Studio_Website_Template_v1.docx" download>Word <span>(.docx)</span></a><a class="btn" href="./templates/Rama_Studio_Website_Template_v1.pdf" download>Fillable PDF</a></div></section>
<div class="project-bar"><div class="project-info"><span class="project-square">${icon('file')}</span><div><h2 id="project-name">Rama Studio</h2><small>Multipage website <span aria-hidden="true">·</span> <span id="project-kind">Example project</span></small></div><span class="badge">DRAFT</span></div><div class="project-tools"><div class="save-summary"><span class="save-info" id="save-status" aria-live="polite">Example · not saved yet</span><time id="save-time" hidden></time><button class="save-details" id="browser-saving" type="button">Browser saving</button></div><button class="btn backup-btn" id="backup">${icon('file')} Project backup</button><button class="btn" id="save" aria-label="Save project" disabled>${icon('save')} Save project</button><button class="btn" id="preview-tab-top" disabled>${icon('external')} Preview in new tab</button><button class="btn green" id="export-top">${icon('external')} Export site</button></div></div>
<div class="mobile-tools"><button class="active" data-mobile="canvas">Canvas</button><button data-mobile="sections">Sections</button><button data-mobile="inspector">Edit</button><button id="mobile-brief">Brief</button><button id="mobile-checks">Checks</button></div>
<div class="studio-shell" id="studio-shell"><section class="left-panel" aria-label="Build tools"><div class="panel-title">Build your page <small>+ make it yours</small></div><div class="panel-tabs"><button class="panel-tab active" data-panel="blocks-panel" aria-pressed="true">Sections</button><button class="panel-tab" data-panel="layers-panel" aria-pressed="false">Layers</button><button class="panel-tab" data-panel="style-panel" aria-pressed="false" hidden>Style</button></div><div id="blocks-panel"><p class="block-help">Drag a section onto your page.<br/>Or use a quick-add button below.</p><div id="blocks"></div><div id="standard-quick-add"><p class="insert-title">QUICK ADD</p><div class="quick-add">${sections.map(([key,name])=>`<button data-add="${key}" aria-label="Add ${name} section">+ ${name}</button>`).join('')}</div></div></div><div id="layers-panel" class="panel-body-hidden"><p class="block-help">Arrange sections with the arrows.</p><div id="layers"></div></div><div id="style-panel" class="panel-body-hidden"></div></section>
<section class="canvas-area" aria-label="Website canvas"><div class="canvas-toolbar"><div class="history-group"><button class="device-btn" id="undo" aria-label="Undo" title="Undo">${icon('undo')}</button><button class="device-btn" id="redo" aria-label="Redo" title="Redo">${icon('redo')}</button></div><span class="canvas-url">${icon('lock')} your-website.preview</span><div class="device-group">${[['Desktop','desktop'],['Tablet','tablet'],['Mobile','phone']].map(([name,i])=>`<button class="device-btn ${name==='Desktop'?'active':''}" data-device="${name}" aria-label="${name} preview" title="${name} preview">${icon(i)}</button>`).join('')}</div></div><div class="canvas-stage"><div class="canvas-window" id="canvas-window"><div id="gjs"></div><div id="text-empty-canvas" hidden><strong>Start with a text block.</strong><p>Pick a style in Sections to place it on this page.</p></div></div></div><div class="canvas-status"><span class="dot-live"></span> LIVE EDITOR <span>·</span> Click to select. Double-click to edit.</div></section>
<aside class="inspector" aria-label="Selection editor"><div class="panel-title">Make it yours ${icon('palette')}</div><div class="inspector-content"><div class="selection-label">${icon('cursor')}<span id="selection-name">Select an element</span></div><p class="selection-empty" id="selection-hint">Click a heading, paragraph, image or section in your website to edit it here.</p><div id="selected-controls" class="hide"><div id="text-section-controls" hidden></div><div id="selection-text"><label class="field">Selected text<textarea id="selected-text" rows="3" placeholder="Select a heading or paragraph"></textarea></label><button class="btn sm text-wide" id="apply-text">Apply text ${icon('check')}</button></div><div id="selection-appearance"><div class="field-title">APPEARANCE</div><div class="field-row"><label class="field">Text color<input id="text-color" type="color" value="#203137"/></label><label class="field">Background<input id="bg-color" type="color" value="#f5f1e9"/></label></div><label class="field">Font size<input id="font-size" type="number" min="8" max="180" placeholder="e.g. 48"/></label><div class="alignment">${['left','center','right'].map(a=>`<button data-align="${a}" aria-label="Align ${a}">${icon('align')}</button>`).join('')}</div></div><div class="inspector-divider"></div><div id="image-controls" class="hide"><label class="field">Image description<input id="image-alt" placeholder="Describe the image"/></label><button class="btn sm text-wide" id="replace-image">${icon('image')} Choose online image</button><p class="inspector-note">Choose a free photo or paste an image URL in Studio tools → Assets.</p></div><div class="inspector-actions"><button class="btn sm text-wide" id="delete-selected">${icon('trash')} Remove element</button></div></div><div class="inspector-divider"></div><div class="field-title">BUILT TO BE YOURS</div><p class="inspector-note">No subscriptions. No locked templates. Download your website and host it wherever you like.</p><button class="btn sm text-wide" id="preview-site">${icon('external')} Preview website</button><div class="legal-links"><a href="./licenses/GrapesJS.txt" target="_blank">GrapesJS license</a><a href="https://github.com/morluto/rea" target="_blank" rel="noopener">REA</a></div></div></aside></div>
<div class="workflow-footer"><strong>${icon('shield')} Your saved draft stays in this browser profile. Download a backup to keep a separate copy.</strong><div class="project-options"><label class="file-label" for="restore-file">${icon('file')} Restore project</label><button class="btn sm" id="footer-checks">Run preflight ${icon('arrow')}</button></div></div><input class="hidden-input" id="restore-file" type="file" accept=".json,application/json" aria-label="Restore project backup"/></main></div>
<dialog id="brief-dialog"><form id="brief-form"><div class="dialog-head"><div><p class="eyebrow-app">START WITH YOUR STORY</p><h2 id="brief-heading">A brief. A direction. Your website.</h2><p>Your details become an editable starter layout. Make every word and section your own.</p></div><button type="button" class="btn icon-only" data-close aria-label="Close brief">${icon('close')}</button></div><div class="dialog-body"><div class="field-row"><label class="field">Business name<input name="name" required maxlength="80"/></label><label class="field">Contact email<input name="email" type="email" placeholder="you@yourbusiness.com"/></label></div><label class="field">What do you do?<textarea name="description" maxlength="320" rows="2" placeholder="Who you help, what you offer, and what makes it personal."></textarea></label><label class="field">Services, separated by commas<input name="services" placeholder="Design, Planning, Collaboration"/></label><div class="field-row"><label class="field">Page title<input name="title" maxlength="70"/></label><label class="field">Button text<input name="cta" placeholder="Let’s talk" maxlength="50"/></label></div><div class="field-title">CHOOSE YOUR STARTING POINT</div><div class="theme-options">${Object.entries(THEMES).map(([key,t])=>`<label class="theme-option"><div class="theme-preview" aria-hidden="true"></div><input type="radio" name="theme" value="${key}" ${key==='editorial'?'checked':''}/> ${t.name}</label>`).join('')}</div><p id="text-theme-hint" class="block-help" hidden>Start with the editable Rama Ken portfolio. Choose treatments for individual text in Style.</p><label class="text-blank-option" hidden><input id="text-start-blank" name="text-start-blank" type="checkbox"> Start with a blank page</label><p class="form-error" id="brief-error" aria-live="polite"></p></div><div class="dialog-footer"><small id="brief-footnote">A starter built from your brief. No AI account needed.</small><div class="dialog-actions"><button type="button" class="btn" data-close>Cancel</button><button class="btn primary" id="brief-submit" type="submit">Create website ${icon('arrow')}</button><button class="btn hide" id="brief-details" type="submit" data-action="details">Save details only</button></div></div></form></dialog>
<dialog id="checks-dialog"><div class="dialog-head"><div><p class="eyebrow-app">READY FOR THE WORLD?</p><h2>A little check goes a long way.</h2><p>A practical preflight for your static website.</p></div><button class="btn icon-only" data-close aria-label="Close checks">${icon('close')}</button></div><div class="dialog-body"><div id="quality-results" class="checks-list"></div><p class="check-disclaimer">These checks cover common basics, not a full SEO, accessibility, performance or security audit. Review your content and test the exported site on real devices before publishing.</p></div><div class="dialog-footer"><small>Good websites get better with a little care.</small><button class="btn primary" id="checks-export">Download website ZIP ${icon('download')}</button></div></dialog>
<dialog id="export-dialog"><div class="dialog-head"><div><p class="eyebrow-app">TAKE IT WITH YOU</p><h2>Your website. Out in the world.</h2><p>Download real HTML and CSS. No editor runtime required.</p></div><button class="btn icon-only" data-close aria-label="Close export">${icon('close')}</button></div><div class="dialog-body"><div class="proof-card"><strong>Ready for any static host.</strong><p>Your ZIP contains every page as HTML, its styles, shared branding, robots.txt, a 404 page and a publishing guide. New pictures keep their source URLs and need internet access. Saved image credits are included in the ZIP.</p></div><ol class="publish-steps"><li>Download and unzip your website.</li><li>Open index.html to review the exported result.</li><li>Upload the files to your static host, or a GitHub repository with Pages enabled.</li></ol><p class="check-disclaimer">Publishing a customer website to its own account is a manual handoff in this version. Save a project backup too, so you can keep editing.</p></div><div class="dialog-footer"><button class="btn" id="export-checks">Run preflight</button><button class="btn primary" id="download-site">Download website ZIP ${icon('download')}</button></div></dialog>
<dialog id="evidence-dialog"><div class="dialog-head"><div><p class="eyebrow-app">THE REA EXPERIMENT</p><h2>From investigation to something useful.</h2><p>The research trail behind this studio, with real evidence you can inspect.</p></div><button class="btn icon-only" data-close aria-label="Close evidence">${icon('close')}</button></div><div class="dialog-body"><div class="proof-card"><strong>REA ran. The findings were checked.</strong><p>Two successful cloud investigations parsed selected GrapesJS sources. We verified source hashes and the recovered method locations before using them here.</p></div><ul class="evidence-list"><li><strong>Save an editable project:</strong> getProjectData / loadProjectData.</li><li><strong>Export a website:</strong> getHtml / getCss.</li><li>GrapesJS supplies the visual editing engine. REA supplied static investigation evidence; it is not running inside this app.</li><li><a href="https://github.com/ramakenkenya/rea-website-studio/actions/runs/39131482263" target="_blank" rel="noopener">Inspect the successful cloud run ↗</a></li><li><a href="https://github.com/ramakenkenya/rea-website-studio/blob/main/docs/V2_REA_FINDINGS.md" target="_blank" rel="noopener">Read the findings, source locations and limitations ↗</a></li></ul><p class="check-disclaimer">The v0.2 analysis covered four selected source files for pages, assets and the editor. Static relationships do not establish complete dependency coverage or prove runtime behavior. Browser checks for this release are recorded separately in the repository’s deployment workflow.</p></div><div class="dialog-footer"><small>Built in public by Rama Ken.</small><button class="btn green" data-close>Back to creating ${icon('arrow')}</button></div></dialog>
<div class="toast" id="toast" role="status" aria-live="polite"></div>`;
const $=s=>document.querySelector(s);
const toast=(msg)=>{clearTimeout(toastTimer);$('#toast').textContent=msg;toastTimer=setTimeout(()=>$('#toast').textContent='',5500);};
const editor=grapesjs.init({container:'#gjs',height:'100%',width:'auto',storageManager:false,assetManager:{custom:{open:()=>studio.open('Assets'),close:()=>{}},upload:false,embedAsBase64:false,dropzone:false,openAssetsOnDrop:false},panels:{defaults:[]},blockManager:{appendTo:'#blocks'},selectorManager:{componentFirst:true},deviceManager:{devices:[{name:'Desktop',width:''},{name:'Tablet',width:'768px',widthMedia:'992px'},{name:'Mobile',width:'375px',widthMedia:'640px'}]},canvas:{styles:[],scripts:[]},parser:{optionsHtml:{allowScripts:false,allowUnsafeAttr:false,allowUnsafeAttrValue:false}},allowScripts:0,noticeOnUnload:false,fromElement:false,nativeDnD:false});
let mode='new',selected=null;
registerTextPortrait(editor);
const textSections=mountTextSections({editor,getBrief:()=>brief,toast,markDirty});
const typeTreatment=mountTypeTreatment({editor,markDirty,toast,onChange:selectComponent});
const studio=mountStudio({editor,getBrief:()=>brief,setBrief:next=>{brief=normalizeBrief(next);updateNames();registerBlocks();},toast,markDirty,capture:()=>capture(),restore:loadProject,onSelect:()=>{selectComponent(null);layers();},browserSaving:{refresh:refreshBrowserSaving,open:openBrowserCopy,detach:detachBrowserCopy}});
mountPortraitControls({editor,getBrief:()=>brief,toast,markDirty});
function capture(){studio.sync();return snapshot(brief,editor.getProjectData(),studio.getState());}
function hasWorkToReplace(){return dirty||(!referencePage(editor.getWrapper())&&studio.getState()?.pages.length>1);}
function browserStorage(){try{return window.localStorage;}catch{return undefined;}}
function readBrowserCopy(){return readSaved(browserStorage());}
function mayAutosave(){
 return ready&&!importing&&dirty&&studio.getState()?.autosave&&browserCopy.revision===baseRevision&&
  (ownsBrowserCopy||browserCopy.ok&&!browserCopy.revision)&&!browserProblem;
}
function markDirty(){
 if(importing||!ready)return;
 dirty=true;
 if(!browserProblem)$('#save-status').textContent='Unsaved changes';
 clearTimeout(autosaveTimer);
 if(mayAutosave())autosaveTimer=setTimeout(flushAutosave,1400);
 refreshBrowserSaving();
}
function updateNames(){for(const id of ['project-name','crumb-name'])$('#'+id).textContent=brief.name;}
function registerBlocks(){
 const styleTab=$('[data-panel="style-panel"]');
 styleTab.hidden=brief.theme!=='text';
 if(styleTab.hidden&&styleTab.classList.contains('active'))changePanel('blocks-panel');
 editor.Blocks.getAll().reset();
 if(!editor.Css.getRule('.extra-lead'))editor.addStyle(EXTRA_CSS);
 if(textSections.register()){
  if(!editor.Css.getRule('.type-section'))editor.addStyle(TEXT_THEME_CSS);
  if(!editor.Css.getRule('.textual-image'))editor.addStyle(TEXTUAL_IMAGE_CSS);
  if(!editor.Css.getRule('.tb-block'))editor.addStyle(TEXT_BLOCK_CSS);
  if(!editor.Css.getRule('.tb-inline-masthead'))editor.addStyle(TEXT_CATALOG_CSS);
  if(!editor.Css.getRule('body [data-type-treatment]:is([data-type-treatment="echo"])'))editor.addStyle(TYPE_TREATMENT_CSS);
  if(!editor.Css.getRule('.tp-hero [data-copied-hero-title]'))editor.addStyle(PORTFOLIO_PART_CSS);
  if(referencePage(editor.getWrapper())&&!editor.Css.getRule(REFERENCE_PAINT_SELECTOR))editor.addStyle(REFERENCE_PAINT_CSS);
  return;
 }
 for(const [id,label,i] of sections)editor.Blocks.add(id,{label,media:icon(i),content:sectionContent(id,brief)});
 for(const b of EXTRA_BLOCKS)editor.Blocks.add(b.id,{label:b.name,media:icon('grid'),content:extraSection(b.id,brief)});
}
function layerName(c){return c.getAttributes()['data-section']||({header:'Header',footer:'Footer',section:'Section'}[c.get('tagName')])||c.getName();}
function editableLayers(){
 const wrapper=editor.getWrapper(),page=referencePage(wrapper);
 if(!page)return wrapper?.components();
 return page.components().models.flatMap(component=>component.get('tagName')==='main'?component.components().models:[component]);
}
function layers(){if(importing)return;const components=editableLayers();if(!components)return;$('#text-empty-canvas').hidden=brief.theme!=='text'||components.length>0;$('#layers').innerHTML=components.map((c,i)=>`<div class="layer-row"><button data-index="${i}" data-action="select">${esc(layerName(c))}</button><button data-index="${i}" data-action="up" aria-label="Move ${esc(layerName(c))} up">${icon('up')}</button><button data-index="${i}" data-action="down" aria-label="Move ${esc(layerName(c))} down">${icon('down')}</button></div>`).join('');}
function selectComponent(c){selected=c;textSections.select(c);typeTreatment.select(c);$('#selection-name').textContent=c?layerName(c):'Select an element';$('#selection-hint').classList.toggle('hide',!!c);$('#selected-controls').classList.toggle('hide',!c);if(!c)return;const isInset=c.getClasses().includes('tp-inset-heading')||c.getAttributes()['data-type-treatment']==='inset'||!!c.find('.tb-inset')[0]&&c.getClasses().includes('tb-title');const isText=!isInset&&(c.is('text')||/^(h[1-6]|p|a|span)$/.test(c.get('tagName')));const textBlock=!!c.getAttributes()['data-text-section'],picture=!!c.getAttributes()['data-picture-to-text'];$('#selection-text').hidden=textBlock||picture;$('#selection-appearance').hidden=textBlock||picture;$('#selected-text').disabled=!isText;$('#apply-text').disabled=!isText;$('#selected-text').value=isText?(c.getEl()?.textContent||''):'';const style=c.getStyle();$('#font-size').value=parseInt(style['font-size'])||'';$('#image-controls').classList.toggle('hide',!c.is('image'));$('#image-alt').value=c.getAttributes().alt||'';}
function fillBrief(){const form=$('#brief-form');for(const [key,value]of Object.entries(brief)){if(form.elements[key])form.elements[key].value=value;}}
function updateTextBrief(){
 const isText=$('#brief-form').elements.theme.value==='text';
 $('#brief-form').elements.name.required=mode!=='new'||!isText;
 $('#text-theme-hint').hidden=!isText;
 $('.text-blank-option').hidden=mode!=='new'||!isText;
}
function openBrief(nextMode){mode=nextMode;fillBrief();$('#text-start-blank').checked=false;if(mode==='new'){const f=$('#brief-form');for(const key of ['name','description','services','email','title'])f.elements[key].value='';}$('#brief-heading').textContent=mode==='new'?'A brief. A direction. Your website.':'Your story, in your own words.';$('#brief-submit').innerHTML=mode==='new'?`Create website ${icon('arrow')}`:`Build page from brief ${icon('arrow')}`;$('#brief-details').classList.toggle('hide',mode==='new');$('#brief-footnote').textContent=mode==='new'?'Creating a website replaces the open canvas. Back up anything you want to keep.':'Build page replaces the current layout, text and images with a starter from these details. Save details only keeps your canvas unchanged.';$('#brief-error').textContent='';briefImport.reset();updateTextBrief();$('#brief-dialog').showModal();}
function loadProject(data){
 const valid=migrateBundledSample(data);
 const previous={brief,project:editor.getProjectData(),studio:studio.getState()};
 importing=true;
 try{editor.loadProjectData(valid.project);brief=valid.brief;studio.init(valid.studio);}
 catch(error){editor.loadProjectData(previous.project);brief=previous.brief;studio.init(previous.studio||undefined);throw error;}
 finally{importing=false;}
 updateNames();registerBlocks();layers();selectComponent(null);dirty=false;$('#project-kind').textContent='Your project';
}
const saveTimeFormatter=new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'});
const formatSavedTime=value=>Number.isFinite(Date.parse(value))?saveTimeFormatter.format(new Date(value)):'';
function refreshBrowserSaving(){
 const saved=browserCopy.data;
 const date=formatSavedTime(saved?.savedAt);
 const time=$('#save-time');
 time.hidden=!ownsBrowserCopy||browserCopy.revision!==baseRevision||!date;
 time.textContent=time.hidden?'':date;
 if(time.hidden)time.removeAttribute('datetime');else time.dateTime=saved.savedAt;
 const card=$('#v2-browser-copy');
 if(!card)return;
 card.textContent=saved?`Saved draft · ${saved.brief.name}`:browserCopy.ok?'No draft saved in this browser':'Saved draft unavailable';
 $('#v2-browser-time').textContent=date?`Last saved ${date}`:'';
 $('#v2-open-browser-copy').disabled=!saved;
 $('#v2-browser-note').textContent=browserProblem||(!browserCopy.ok?browserCopy.error:
  studio.getState()?.autosave&&!ownsBrowserCopy&&saved?'Save the open draft once before autosave can update this browser copy.':
  studio.getState()?.autosave?'Autosave is on.':'Autosave is off.');
}
function detachBrowserCopy(){
 clearTimeout(autosaveTimer);
 ownsBrowserCopy=false;
 if(browserCopy.revision===baseRevision)browserProblem='';
 refreshBrowserSaving();
}
function openBrowserCopy(){
 const latest=readBrowserCopy();
 if(!latest.ok||!latest.data){toast(latest.error||'There is no saved draft in this browser.');return false;}
 if(dirty&&!confirm('Open the saved draft and replace the unsaved changes on your canvas?'))return false;
 loadProject(latest.data);
 clearTimeout(autosaveTimer);
 browserCopy=latest;baseRevision=latest.revision;ownsBrowserCopy=true;browserProblem='';
 $('#save-status').textContent='Saved on this device';
 editor.UndoManager.clear();
 refreshBrowserSaving();
 toast('Saved draft opened.');
 return true;
}
function save(automatic=false){
 clearTimeout(autosaveTimer);
 try{
  const data=capture();
  let result=writeSaved(browserStorage(),data,{expectedRevision:baseRevision});
  if(result.reason==='conflict'){
   browserCopy=readBrowserCopy();
   if(!automatic&&browserCopy.revision!==undefined&&confirm('The saved draft changed in another tab. Replace it with the draft open in this tab?')){
    result=writeSaved(browserStorage(),data,{expectedRevision:browserCopy.revision});
   }
  }
  if(!result.ok){
   browserProblem=result.error;
   $('#save-status').textContent=result.reason==='conflict'?'Browser copy changed':'Browser save failed';
   refreshBrowserSaving();toast(result.error);return false;
  }
  browserCopy={ok:true,data,revision:result.revision};baseRevision=result.revision;
  ownsBrowserCopy=true;browserProblem='';dirty=false;
  $('#save-status').textContent=automatic?'Autosaved on this device':'Saved on this device';
  refreshBrowserSaving();
  if(!automatic)toast('Project saved on this device.');
  return true;
 }catch{
  browserProblem='Could not save this draft. Download a project backup to keep your changes.';
  $('#save-status').textContent='Browser save failed';
  refreshBrowserSaving();toast(browserProblem);return false;
 }
}
function flushAutosave(){if(mayAutosave())save(true);}
function showChecks(){const results=studio.audit();$('#quality-results').innerHTML=results.map(r=>`<div class="check-item"><span class="check-dot ${r.ok?'':'warn'}">${r.ok?icon('check'):'!'}</span><div><strong>${esc(r.label)}</strong><p>${esc(r.detail)}</p></div></div>`).join('');$('#checks-dialog').showModal();}
function changePanel(id){
 for(const button of document.querySelectorAll('[data-panel]')){
  const active=button.dataset.panel===id;
  button.classList.toggle('active',active);
  button.setAttribute('aria-pressed',String(active));
  $('#'+button.dataset.panel).classList.toggle('panel-body-hidden',!active);
 }
 layers();
}
async function downloadWebsite(){try{const blob=await siteZip(editor,brief,studio.getState());download(blob,exportName(brief));document.querySelectorAll('#checks-dialog[open],#export-dialog[open]').forEach(d=>d.close());toast('Website ZIP downloaded. Unzip it and open index.html.');}catch{toast('Export failed. Please try again.');}}
editor.on('load',()=>{
 const saved=readBrowserCopy(),sample=new URLSearchParams(location.search).get('sample');
 browserCopy=saved;baseRevision=saved.revision??null;
 importing=true;
 if(sample==='text-portfolio'||sample==='portfolio-reference'){
  const reference=sample!=='text-portfolio';
  brief=normalizeBrief(TEXT_SAMPLE_BRIEF);
  editor.loadProjectData(reference?referencePortfolioProject():textSampleProject());
  editor.setStyle(reference?REFERENCE_PORTFOLIO_CSS:createTextPortfolio(brief,{sample:true}).css);
  studio.init(textSampleMetadata());
  registerBlocks();
  $('#save-status').textContent='Example · not saved yet';
  if(sample)history.replaceState(null,'',location.pathname+location.hash);
  if(!saved.ok)toast(saved.error);
  else if(sample)toast('Rama’s text portfolio is ready to edit. Your saved project is unchanged until you choose Save project.');
 }else if(saved.ok&&saved.data&&sample!=='rama-studio'){
  loadProject(saved.data);ownsBrowserCopy=true;$('#save-status').textContent='Saved on this device';
 }else{
  const starter=createStarter(brief);editor.setComponents(starter.html);editor.setStyle(starter.css);registerBlocks();
  if(sample==='rama-studio')history.replaceState(null,'',location.pathname+location.hash);
  if(!saved.ok)toast(saved.error);
 }
 importing=false;ready=true;if(!studio.getState())studio.init();$('#save').disabled=false;$('#preview-tab-top').disabled=false;layers();updateNames();editor.UndoManager.clear();refreshBrowserSaving();
});
editor.on('page:select',()=>{if(ready&&!importing)registerBlocks();});
editor.on('update',markDirty);editor.on('component:selected',selectComponent);editor.on('component:deselected',()=>selectComponent(null));editor.on('component:add component:remove',()=>{if(ready)layers();});
const briefImport=mountBriefImport({dialog:$('#brief-dialog'),form:$('#brief-form'),backup:()=>$('#backup').click(),needsReplacement:()=>hasWorkToReplace()||!!readBrowserCopy().data,apply:async next=>{
 const previousDirty=dirty,previousStatus=$('#save-status').textContent;
 await replaceImportedProject({capture,pause:()=>{clearTimeout(autosaveTimer);importing=true;},apply:loadProject,resume:success=>{importing=false;if(success)detachBrowserCopy();else{dirty=previousDirty;$('#save-status').textContent=previousStatus;if(mayAutosave())autosaveTimer=setTimeout(flushAutosave,1400);}}},next);
},onImported:()=>{editor.UndoManager.clear();markDirty();toast('Document imported. Your website is ready to edit. Save the project to keep it.');}});
$('#brief-form').addEventListener('change',event=>{if(event.target.name==='theme')updateTextBrief();});
$('#new-site').onclick=()=>openBrief('new');$('#mobile-brief').onclick=()=>openBrief('edit');
$('#brief-form').onsubmit=e=>{e.preventDefault();if(briefImport.active()){briefImport.create();return;}try{
 const data=Object.fromEntries(new FormData(e.target));
 const blankText=mode==='new'&&data.theme==='text'&&$('#text-start-blank').checked;
 if(blankText)data.name=data.name.trim()||'Text website';
 else if(mode==='new'&&data.theme==='text'){
  for(const key of ['name','description','services','title'])if(!data[key]?.trim())data[key]=TEXT_SAMPLE_BRIEF[key];
 }
 const next=normalizeBrief(data),previousTheme=brief.theme;
 const currentState=studio.getState();if(currentState)createStudio(editor.getProjectData(),next,{...currentState,site:{...currentState.site,name:next.name},pages:currentState.pages.map(p=>p.id===editor.Pages.getSelected()?.id?{...p,title:next.title,description:next.description}:p)});
 const rebuild=mode==='new'||e.submitter?.dataset.action!=='details';
 if(rebuild){
  if(mode==='edit'&&!confirm('Building from this brief replaces your current page, including custom text, layout and images. Download a project backup first if you want to keep them. Continue?'))return;
  if(mode==='new'&&hasWorkToReplace()&&!confirm('Replace the open canvas? Download a project backup first if you want to keep it.'))return;
  const portfolio=next.theme==='text'&&!blankText?referencePortfolioProject():null;
  const existingLocale=referencePage(editor.getWrapper())?.getAttributes().lang;
  const starter=portfolio?{html:portfolio.pages[existingLocale==='ko'?1:0].component,css:REFERENCE_PORTFOLIO_CSS}:createStarter(next);
  importing=true;
  try{
   if(mode==='new'){
    editor.loadProjectData(portfolio||{pages:[{id:crypto.randomUUID(),name:'Home',component:starter.html}],styles:[]});
    editor.setStyle(starter.css);
    brief=next;
    studio.init(portfolio?textSampleMetadata():undefined);
    detachBrowserCopy();
   }else{
    editor.setComponents(starter.html);
    editor.addStyle(starter.css);
    brief=next;
   }
   editor.UndoManager.clear();
  }finally{importing=false;}
  selectComponent(null);$('#project-kind').textContent='Your project';
 }else{brief={...next,theme:previousTheme};}
 updateNames();registerBlocks();layers();studio.sync();
 const state=studio.getState();
 if(state){
  state.site.name=brief.name;
  if(rebuild&&(previousTheme!==brief.theme||brief.theme==='text')){
   const theme=brief.theme==='text'?textSampleMetadata().site.brand:THEMES[brief.theme];
   Object.assign(state.site.brand,{paper:theme.paper,ink:theme.ink,accent:theme.accent,font:brief.theme==='text'?'sans':'serif'});
  }
  const current=state.pages.find(p=>p.id===editor.Pages.getSelected()?.id);
  if(current){current.title=brief.title;current.description=brief.description;}
  if(rebuild)studio.resetPage();
 }
 markDirty();$('#brief-dialog').close();
 if(rebuild&&brief.theme==='text'){
  $('[data-mobile="canvas"]').click();
  changePanel('blocks-panel');
  $('#studio-shell').scrollIntoView({block:'start'});
 }
 toast(blankText?'Your blank Text Only page is ready. Add your first block from Sections.':rebuild&&brief.theme==='text'?'The Text Only portfolio is ready to edit. Select text to explore the Style tab.':rebuild?'Your website was built from this brief. Save the project to keep it.':'Project details saved. The visible page is unchanged.');
 }catch(err){$('#brief-error').textContent=err.message;}};
$('#save').onclick=()=>save();$('#browser-saving').onclick=()=>studio.open('History');$('#backup').onclick=()=>{try{download(new Blob([serializeBackup(capture())],{type:'application/json'}),fileSlug(brief.name)+'-project.json');toast('Project backup downloaded. Restore this file to keep editing.');}catch(err){toast(err.message);}};
$('#restore-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>MAX_BACKUP_BYTES)throw new Error('Project files must be under 32 MB.');const data=validateSnapshot(JSON.parse(await file.text()));if(dirty&&!confirm('Restore this backup and replace the open canvas?'))return;loadProject(data);detachBrowserCopy();editor.UndoManager.clear();markDirty();toast('Project restored. Save it on this device to keep it.');}catch(err){toast('Could not restore. '+(err.message.includes('JSON')?'Choose a valid project backup.':err.message));}finally{e.target.value='';}};
function historyStep(action){editor.UndoManager[action]();layers();}
function syncHistoryButtons(){
 const disabled=!editor.UndoManager.hasUndo();
 $('#undo').disabled=disabled;
 $('#redo').disabled=!editor.UndoManager.hasRedo();
 const button=$('.selection-undo');
 if(button)button.disabled=disabled;
}
editor.Commands.add('studio-undo-step',()=>historyStep('undo'));
editor.on('component:selected',component=>{
 const toolbar=component.get('toolbar');
 if(!toolbar?.length||toolbar.some(item=>item.id==='studio-undo-step'))return;
 component.set('toolbar',[...toolbar,{
  id:'studio-undo-step',command:'studio-undo-step',events:{click:'handleClick'},
  label:`<button type="button" class="selection-undo" aria-label="Undo last edit" title="Undo last edit">${icon('undo')}</button>`,
 }],{avoidStore:true,noUndo:true});
});
editor.on('load update undo redo component:toggled',()=>queueMicrotask(syncHistoryButtons));
$('#undo').onclick=()=>historyStep('undo');
$('#redo').onclick=()=>historyStep('redo');
$('#apply-text').onclick=()=>{if(selected&&!$('#selected-text').disabled){selected.components(esc($('#selected-text').value));markDirty();toast('Text updated.');}};
$('#font-size').onchange=e=>{const size=Number(e.target.value);if(selected&&size>=8&&size<=180)selected.addStyle({'font-size':size+'px'});};
$('#text-color').oninput=e=>selected?.addStyle({color:e.target.value});$('#bg-color').oninput=e=>selected?.addStyle({'background-color':e.target.value});
document.querySelectorAll('[data-align]').forEach(b=>b.onclick=()=>selected?.addStyle({'text-align':b.dataset.align}));
$('#image-alt').oninput=e=>{if(selected?.is('image'))selected.addAttributes({alt:e.target.value});};
$('#delete-selected').onclick=()=>{if(selected){const c=selected;editor.select(null);c.remove();layers();}};
document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{editor.addComponents(sectionContent(b.dataset.add,brief),{at:Math.max(0,editor.getWrapper().components().length-1)});layers();toast(b.dataset.add[0].toUpperCase()+b.dataset.add.slice(1)+' section added.');});
$('#layers').onclick=e=>{const b=e.target.closest('button[data-index]');if(!b)return;const items=editableLayers();const c=Array.isArray(items)?items[Number(b.dataset.index)]:items.at(Number(b.dataset.index));if(!c)return;if(b.dataset.action==='select'){editor.select(c);c.getEl()?.scrollIntoView({block:'center'});}else{const parent=c.parent();const at=c.index()+(b.dataset.action==='up'?-1:1);if(at>=0&&at<parent.components().length)c.move(parent,{at});layers();}};
document.querySelectorAll('[data-panel]').forEach(b=>b.onclick=()=>changePanel(b.dataset.panel));
document.querySelectorAll('[data-device]').forEach(b=>b.onclick=()=>{editor.setDevice(b.dataset.device);document.querySelectorAll('[data-device]').forEach(x=>x.classList.toggle('active',x===b));$('#canvas-window').classList.toggle('phone',b.dataset.device==='Mobile');});
document.querySelectorAll('[data-mobile]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-mobile]').forEach(x=>x.classList.toggle('active',x===b));$('#studio-shell').classList.toggle('show-sections',b.dataset.mobile==='sections');$('#studio-shell').classList.toggle('show-inspector',b.dataset.mobile==='inspector');});
for(const id of ['evidence-top','evidence-side'])$('#'+id).onclick=()=>$('#evidence-dialog').showModal();
for(const id of ['mobile-checks','footer-checks'])$('#'+id).onclick=showChecks;
for(const id of ['export-top'])$('#'+id).onclick=()=>$('#export-dialog').showModal();
for(const id of ['download-site','checks-export'])$('#'+id).onclick=downloadWebsite;
$('#export-checks').onclick=()=>{$('#export-dialog').close();showChecks();};
$('#preview-site').onclick=()=>studio.showPreview();
document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{if(b.dataset.nav==='brief')openBrief('edit');else if(b.dataset.nav==='design')studio.open('Brand');else if(b.dataset.nav==='pages')studio.open('Pages');else if(b.dataset.nav==='checks')showChecks();else if(b.dataset.nav==='export')$('#export-dialog').showModal();else document.querySelector('#gjs').scrollIntoView({block:'nearest'});});
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
window.addEventListener('storage',event=>{
 if(!ready||event.storageArea!==browserStorage()||(event.key!==STORAGE_KEY&&event.key!==null))return;
 browserCopy=readBrowserCopy();
 if(browserCopy.revision!==baseRevision){
  clearTimeout(autosaveTimer);
  browserProblem='The saved draft changed in another tab. Open the saved draft or save your open draft to replace it.';
  $('#save-status').textContent='Browser copy changed';
 }
 refreshBrowserSaving();
});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flushAutosave();});
window.addEventListener('pagehide',flushAutosave);
window.addEventListener('beforeunload',e=>{flushAutosave();if(dirty){e.preventDefault();e.returnValue='';}});
