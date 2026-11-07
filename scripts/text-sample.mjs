import {createTextPortfolio,TEXT_SAMPLE_BRIEF,prefixTextPortfolioIds} from '../src/text-portfolio.js';
import {buildDocument} from '../src/export.js';
import {PORTFOLIO_COPY} from '../src/text-portfolio-copy.js';

export function textSampleFiles(){
 const files={};
 for(const language of ['en','ko']){
  const sample=createTextPortfolio(TEXT_SAMPLE_BRIEF,{sample:true,language}),copy=PORTFOLIO_COPY[language];
  // Showcase entry points link to the editor; ordinary customer exports do not.
  const html=sample.html.replace(`<span>${copy.footer}</span>`,`<a href="../../?sample=text-portfolio">${copy.use}</a>`);
  const brief={...TEXT_SAMPLE_BRIEF,...(language==='ko'?{title:'라마 켄 — 아이디어를 실제로 만드는 일',description:copy.intro}:{})};
  files[`samples/rama-ken/${language==='en'?'index':'ko'}.html`]=buildDocument({html,brief});
  files['samples/rama-ken/styles.css']=sample.css;
 }
 files['samples/rama-ken/preview.html']=bilingualSampleDocument();
 return files;
}

// A single downloadable file can change language offline using native fragment
// navigation. The Korean region declares lang=ko; inactive content is not read.
export function bilingualSampleDocument(){
 const english=createTextPortfolio(TEXT_SAMPLE_BRIEF,{sample:true,language:'en',languageLinks:{en:'#en',ko:'#ko'}});
 let korean=createTextPortfolio(TEXT_SAMPLE_BRIEF,{sample:true,language:'ko',languageLinks:{en:'#en',ko:'#ko'}}).html;
 korean=prefixTextPortfolioIds(korean);
 const css=`${english.css}\n.tp-preview-ko{display:none}.tp-bilingual:has(#ko:target,[id^="ko-"]:target)>.tp-preview-en{display:none}.tp-bilingual:has(#ko:target,[id^="ko-"]:target)>.tp-preview-ko{display:block}`;
 const html=`<div class="tp-bilingual"><div id="en" class="tp-preview-en">${english.html}</div><div id="ko" class="tp-preview-ko">${korean}</div></div>`;
 return buildDocument({html,brief:{...TEXT_SAMPLE_BRIEF,title:'Rama Ken / 라마 켄 — Portfolio'}}).replace('<link rel="stylesheet" href="styles.css">',`<style>${css}</style>`);
}

export function textSamplePlugin(){
 return {name:'rama-text-sample',generateBundle(){for(const [fileName,source]of Object.entries(textSampleFiles()))this.emitFile({type:'asset',fileName,source});},
  configureServer(server){server.middlewares.use((req,res,next)=>{
   const path=(req.url||'').split('?')[0].replace(/^\//,'').replace(/\/$/,'/index.html');
   const file=textSampleFiles()[path];if(!file)return next();res.setHeader('Content-Type',path.endsWith('.css')?'text/css':'text/html');res.end(file);
  });}};
}
