// Rules are shared by the miniature cards and the editable blocks in the canvas.
export const TEXT_CATALOG_CSS=`
.tb-block{--tb-type-ink:#171713;--tb-type-paper:#fbfaf5;--tb-rule:#c8c5ba}
.tb-bold-stack,.tb-inset-label,.tb-offset-features,.tb-vertical-index,.tb-utility-features,.tb-case-list,.tb-vertical-process,.tb-side-process,.tb-dark-profiles,.tb-vertical-faq,.tb-stacked-invitation,.tb-index-footer{--tb-type-ink:#f8f6ec;--tb-type-paper:#111211;--tb-rule:#666860;background-color:#111211;color:#f8f6ec;border-bottom-color:#41433e}
.tb-block:is([data-text-tone="light"],[data-text-tone="grid"]){--tb-type-ink:#171713;--tb-type-paper:#fbfaf5;--tb-rule:#c8c5ba;background-color:#fbfaf5;color:#171713;border-color:#c8c5ba}
.tb-block[data-text-tone="grid"]{background-image:repeating-linear-gradient(90deg,transparent 0,transparent calc(12.5% - 1px),#dddad0 calc(12.5% - 1px),#dddad0 12.5%)}
.tb-block[data-text-tone="dark"]{--tb-type-ink:#f8f6ec;--tb-type-paper:#111211;--tb-rule:#666860;background-color:#111211;color:#f8f6ec;border-color:#666860}
.tb-split-contrast:is([data-text-tone="dark"],[data-text-tone="light"]){background-image:none}
.tb-split-contrast[data-text-tone] .tb-title{mix-blend-mode:normal}
.tb-split-contrast[data-text-tone] .tb-split-copy article+article{color:inherit}
.tb-block[data-text-tone] .tb-number{color:inherit}
.tb-block[data-text-tone] .tb-inset{background-color:var(--tb-type-ink);color:var(--tb-type-paper)}
.tb-outline-echo[data-text-tone="dark"] .tb-title:not([data-type-treatment]){text-shadow:.09em -.2em #62635b}
.tb-process-rail[data-text-tone] .tb-number,.tb-bold-stack[data-text-tone] .tb-title span:nth-child(2){color:transparent;-webkit-text-stroke-color:var(--tb-type-ink)}
.tb-block .tb-action{display:inline-block;border:1px solid currentColor;padding:.65em 1em;margin-top:1.4em;text-decoration:none;font-weight:700}
.tb-block .tb-action:hover{text-decoration:underline}
.tb-inline-masthead{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1em 2em;padding-block:1.4em}
.tb-wordmark{font:700 1.1em Georgia,serif;text-decoration:none}
.tb-inline-masthead nav,.tb-utility-footer nav{display:flex;flex-wrap:wrap;gap:.6em 1.3em;font:700 .72em/1.35 monospace;text-transform:uppercase}
.tb-utility-footer nav{margin-top:.75em}
.tb-outline-poster,.tb-framed-hero{position:relative;isolation:isolate;display:grid;align-items:center;min-height:clamp(300px,45vw,660px)}
.tb-poster-type{position:relative;width:100%;font:900 clamp(42px,24cqi,290px)/.79 Arial,sans-serif;letter-spacing:-.075em;color:transparent;-webkit-text-stroke-width:1px;-webkit-text-stroke-color:var(--tb-type-ink)}
.tb-poster-type span{display:block}
.tb-poster-copy{position:absolute;z-index:1;left:6%;right:8%;width:fit-content;max-width:86%;padding:.7em .9em;background-color:var(--tb-type-paper)}
.tb-poster-copy .tb-title{font:900 clamp(24px,4.2cqi,58px)/.95 Arial,sans-serif!important;letter-spacing:-.045em}
.tb-framed-hero{border:1px solid var(--tb-rule);min-height:clamp(240px,32vw,500px)}
.tb-framed-hero .tb-poster-type{font-size:clamp(42px,21cqi,245px)}
.tb-editorial-columns{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,11em),1fr));gap:1.5em;margin-top:1.3em}
.tb-editorial-philosophy,.tb-quote-grid,.tb-milestone-circles{border:1px solid var(--tb-rule)}
.tb-block .tb-quote{margin:1.2em 0 0;padding-top:1em;border-top:1px solid var(--tb-rule)}
.tb-quote blockquote{margin:0;font:italic 500 clamp(18px,4cqi,42px)/1.12 Georgia,serif}
.tb-quote figcaption{margin-top:.65em;font:11px/1.5 monospace;text-transform:uppercase;letter-spacing:.1em}
.tb-editorial-spread{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr);gap:2em;border:1px solid var(--tb-rule)}
.tb-editorial-spread>div+div{padding-inline-start:1.5em;border-inline-start:1px solid var(--tb-rule)}
.tb-editorial-spread .tb-numbered{grid-template-columns:repeat(3,minmax(0,1fr));margin:1em 0 2em}
.tb-pull-quote .tb-quote{max-width:48ch}
.tb-case-list,.tb-vertical-process,.tb-side-process,.tb-vertical-faq{display:grid;grid-template-columns:auto minmax(0,1fr);gap:6%;align-items:start}
.tb-case-list .tb-title,.tb-vertical-process .tb-title,.tb-side-process .tb-title,.tb-vertical-faq .tb-title,.tb-stacked-invitation .tb-title{font:900 clamp(26px,6cqi,90px)/.9 Arial,sans-serif!important;text-transform:uppercase}
.tb-side-process .tb-title,.tb-vertical-faq .tb-title{writing-mode:vertical-rl;transform:rotate(180deg);margin:0}
.tb-side-process .tb-title{grid-column:2;grid-row:1;color:transparent;-webkit-text-stroke-width:1px;-webkit-text-stroke-color:var(--tb-type-ink)}
.tb-side-process{grid-template-columns:minmax(0,1fr) auto}
.tb-side-process .tb-numbered{grid-column:1;grid-row:1}
.tb-vertical-process .tb-numbered,.tb-side-process .tb-numbered{gap:0;margin:0}
.tb-vertical-process .tb-item,.tb-side-process .tb-item,.tb-case-rows article{display:grid;grid-template-columns:auto minmax(0,1fr);gap:1em;padding:.9em 0;border-top:1px solid var(--tb-rule)}
.tb-case-rows article{grid-template-columns:minmax(0,1fr) auto}
.tb-case-rows .tb-kicker{align-self:center;margin:0}
.tb-vertical-process .tb-number,.tb-side-process .tb-number{color:inherit;font:700 15px/1 monospace;letter-spacing:0}
.tb-milestone-circles .tb-numbered,.tb-index-footer{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.35em}
.tb-milestone-circles .tb-number{display:grid;place-items:center;width:2.1em;height:2.1em;border:1px solid var(--tb-rule);border-radius:50%;font:700 clamp(21px,4cqi,42px)/1 monospace;color:inherit}
.tb-process-rail .tb-numbered{border-top:none}
.tb-process-rail .tb-item{display:grid;grid-template-rows:auto auto 1fr;align-items:start}
.tb-process-rail .tb-item>div{display:contents}
.tb-process-rail h3{grid-row:1;padding-bottom:.55em;border-bottom:1px solid var(--tb-rule);font:700 clamp(12px,1.7cqi,20px)/1.25 monospace!important;text-transform:uppercase}
.tb-process-rail li:not(:last-child) h3::after{content:' →';white-space:nowrap}
.tb-utility-features .tb-numbered{grid-template-columns:repeat(4,minmax(0,1fr))}
.tb-utility-features .tb-item{padding-top:1em;border-top:1px solid var(--tb-rule)}
.tb-utility-features .tb-number{color:inherit;font:700 16px/1 monospace;letter-spacing:0}
.tb-dark-profiles .tb-editorial-columns{grid-template-columns:repeat(3,minmax(0,1fr))}
.tb-dark-profiles h3,.tb-utility-features h3{font-family:Arial,sans-serif!important}
.tb-answers article{border-top:1px solid var(--tb-rule);padding:.8em 0}
.tb-offset-faq .tb-answers article:nth-child(even){padding-left:20%}
.tb-stacked-invitation{text-align:center}
.tb-stacked-invitation .tb-title{font-size:clamp(48px,13cqi,170px)!important}
.tb-stacked-invitation .tb-title span,.tb-index-footer a{display:block}
.tb-index-footer a+a{margin-top:.4em}
.tb-vertical-index .tb-item,.tb-questions details,.tb-utility-footer .tb-footer-line{border-color:var(--tb-rule)}
@media(max-width:600px){
 .tb-editorial-spread{grid-template-columns:1fr}
 .tb-editorial-spread>div+div{padding:1em 0 0;border:0;border-top:1px solid var(--tb-rule)}
 .tb-case-list,.tb-vertical-process,.tb-side-process,.tb-vertical-faq{display:block}
 .tb-case-list .tb-title,.tb-vertical-process .tb-title,.tb-side-process .tb-title,.tb-vertical-faq .tb-title{writing-mode:horizontal-tb;transform:none;margin-bottom:.7em}
}
@media(max-width:440px){.tb-index-footer{grid-template-columns:1fr}}
@container(max-width:530px){
 .tb-utility-features .tb-numbered,.tb-dark-profiles .tb-editorial-columns{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@container(max-width:320px){
 .tb-milestone-circles .tb-numbered,.tb-dark-profiles .tb-editorial-columns{grid-template-columns:1fr}
 .tb-offset-faq .tb-answers article:nth-child(even){padding-left:8%}
}
`;
