import {createTextPortfolio,TEXT_SAMPLE_BRIEF} from '../src/text-portfolio.js';
import {buildDocument} from '../src/export.js';

export function textSampleFiles(){
 const sample=createTextPortfolio(TEXT_SAMPLE_BRIEF,{sample:true});
 // This is a showcase entry point; normal customer exports omit editor links.
 const html=sample.html.replace('<span>MADE OF TYPE. FULL OF IDEAS.</span>','<a href="../../?sample=text-portfolio">USE THIS TEMPLATE ↗</a>');
 return {'samples/rama-ken/index.html':buildDocument({html,brief:TEXT_SAMPLE_BRIEF}),'samples/rama-ken/styles.css':sample.css};
}

export function textSamplePlugin(){
 return {name:'rama-text-sample',generateBundle(){for(const [fileName,source]of Object.entries(textSampleFiles()))this.emitFile({type:'asset',fileName,source});},
  configureServer(server){server.middlewares.use((req,res,next)=>{
   const path=(req.url||'').split('?')[0].replace(/^\//,'').replace(/\/$/,'/index.html');
   const file=textSampleFiles()[path];if(!file)return next();res.setHeader('Content-Type',path.endsWith('.css')?'text/css':'text/html');res.end(file);
  });}};
}
