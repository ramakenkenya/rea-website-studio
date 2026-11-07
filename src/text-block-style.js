export const TEXT_BLOCK_CSS=`
.tb-block,.tb-block *{box-sizing:border-box}
.tb-block{container-type:inline-size;width:100%;padding-block:clamp(32px,6vw,92px);padding-inline:6%;overflow-wrap:anywhere;background-color:#fbfaf5;color:#171713;border-bottom:1px solid #d6d3ca;font:16px/1.5 Arial,sans-serif}
.tb-block a{color:inherit;text-underline-offset:.18em}
.tb-block p{margin:0}
.tb-block .tb-title{margin:0 0 .35em;font:500 clamp(38px,8cqi,110px)/.95 Georgia,serif!important;letter-spacing:-.06em}
.tb-block .tb-kicker{margin:0 0 1.1em;font:700 11px/1.4 monospace;letter-spacing:.14em;text-transform:uppercase}
.tb-block .tb-copy{max-width:54ch}
.tb-block h3{margin:0 0 .32em;font:700 clamp(15px,2.6cqi,25px)/1.12 Georgia,serif!important}
.tb-outline-echo .tb-title{max-width:14ch;text-shadow:.09em -.2em #dcdad2}
.tb-bold-stack,.tb-inset-label,.tb-offset-features,.tb-vertical-index{background-color:#111211;color:#f8f6ec;border-bottom-color:#41433e}
.tb-bold-stack .tb-title,.tb-inset-label .tb-title{font:900 clamp(54px,16cqi,192px)/.82 Arial,sans-serif!important;text-transform:uppercase;letter-spacing:-.085em}
.tb-bold-stack .tb-title span{display:block}
.tb-bold-stack .tb-title span:nth-child(2){color:transparent;-webkit-text-stroke-width:1px;-webkit-text-stroke-color:#f8f6ec}
.tb-inset-label .tb-title{position:relative;display:inline-block;margin:0}
.tb-inset-label .tb-inset{position:absolute;z-index:1;top:.1em;left:.11em;background-color:#f8f6ec;color:#111211;padding:.1em .24em;font-size:.16em;letter-spacing:0;line-height:1}
.tb-split-contrast{background-image:linear-gradient(90deg,#101110 50%,#f4f1e7 50%);color:#f4f1e7}
.tb-split-contrast .tb-title{font-size:clamp(44px,11cqi,148px)!important;mix-blend-mode:difference;text-align:center}
.tb-split-copy{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10%;margin-top:2em}
.tb-split-copy article+article{color:#101110}
.tb-numbered{display:grid;gap:clamp(16px,3cqi,40px);margin:1.6em 0 0;padding:0;list-style:none}
.tb-number{display:block;font:400 clamp(42px,8cqi,94px)/.86 Georgia,serif;letter-spacing:-.08em;color:#77766d;margin-bottom:.24em}
.tb-numbered-grid .tb-numbered,.tb-team-voices .tb-numbered{grid-template-columns:repeat(2,minmax(0,1fr))}
.tb-numbered-grid .tb-item,.tb-team-voices .tb-item{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:start;gap:.8em;border-top:1px solid #ceccc2;padding-top:.8em}
.tb-staggered-reasons .tb-title,.tb-team-voices .tb-title{text-align:right}
.tb-staggered-reasons .tb-numbered{grid-template-columns:repeat(3,minmax(0,1fr))}
.tb-staggered-reasons .tb-item:nth-child(2){margin-top:2.7em}
.tb-staggered-reasons .tb-item:nth-child(3){margin-top:5.4em}
.tb-offset-features .tb-title,.tb-vertical-index .tb-title{font:800 clamp(34px,6cqi,85px)/.9 Arial,sans-serif!important;letter-spacing:-.06em;text-transform:uppercase}
.tb-offset-features .tb-numbered{grid-template-columns:repeat(4,minmax(0,1fr))}
.tb-offset-features .tb-number{font:900 clamp(46px,10cqi,132px)/.82 Arial,sans-serif;color:#f8f6ec}
.tb-offset-features .tb-item:nth-child(even){margin-top:4em}
.tb-feature-result{text-align:right}
.tb-result{display:grid;grid-template-columns:minmax(0,1fr) auto;justify-items:end;align-items:end;gap:1em 2em}
.tb-block .tb-metric{font:italic 600 clamp(46px,10cqi,120px)/1 Georgia,serif;letter-spacing:-.08em}
.tb-result .tb-kicker{margin:.6em 0 0}
.tb-process-rail .tb-numbered{grid-template-columns:repeat(5,minmax(0,1fr));border-top:1px dashed #77766d;padding-top:.8em}
.tb-process-rail .tb-number{color:transparent;-webkit-text-stroke-width:1px;-webkit-text-stroke-color:#52524b}
.tb-vertical-index{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:stretch;gap:6%}
.tb-vertical-index .tb-title{writing-mode:vertical-rl;transform:rotate(180deg);margin:0}
.tb-index-rows .tb-numbered{gap:0;margin:0}
.tb-index-rows .tb-item{display:grid;grid-template-columns:auto minmax(0,1fr);gap:1em;border-top:1px solid #62645d;padding:1em 0}
.tb-index-rows .tb-number{font:400 clamp(20px,3cqi,36px)/1 monospace;color:#cbc9be}
.tb-questions details{border-top:1px solid #a4a197;padding:.85em 0}
.tb-questions summary{cursor:pointer;font-weight:700}
.tb-questions .tb-copy{margin:.5em 0 0 1em}
.tb-reflected-callout{text-align:center}
.tb-reflected-callout .tb-title{display:inline-block;margin-bottom:.65em;-webkit-box-reflect:below -.18em linear-gradient(transparent 65%,#0003)}
.tb-reflected-callout .tb-copy{margin-inline:auto}
.tb-utility-footer{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1em 2em}
.tb-utility-footer h2{margin:0 0 .3em;font:700 24px/1.2 Georgia,serif!important}
.tb-footer-line{grid-column:1/-1;border-top:1px solid #ceccc2;padding-top:.8em;text-align:center}
@container(max-width:540px){
 .tb-offset-features .tb-numbered,.tb-process-rail .tb-numbered{grid-template-columns:repeat(2,minmax(0,1fr))}
 .tb-offset-features .tb-item:nth-child(even),.tb-staggered-reasons .tb-item:nth-child(n){margin-top:0}
 .tb-staggered-reasons .tb-numbered{grid-template-columns:1fr}
 .tb-numbered-grid .tb-item,.tb-team-voices .tb-item{display:block}
}
`;
