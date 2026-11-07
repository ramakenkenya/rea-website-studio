// These selectors are shared by the canvas, preview, and static HTML export.
export const TEXT_THEME_CSS=`
body{margin:0}
.type-section,.type-section *{box-sizing:border-box}
.type-section{--type-paper:var(--studio-paper,#faf8f2);--type-ink:var(--studio-ink,#20211d);width:100%;padding-block-start:clamp(30px,4.4vw,70px);padding-block-end:clamp(30px,4.4vw,70px);padding-inline-start:max(6%,calc((100% - var(--studio-width,1200px))/2));padding-inline-end:max(6%,calc((100% - var(--studio-width,1200px))/2));background-color:var(--type-paper);color:var(--type-ink);border-bottom:1px solid color-mix(in srgb,currentColor 25%,transparent);line-height:1.55;overflow-wrap:anywhere}
.type-section a{color:inherit;text-underline-offset:.22em}
.type-section a:focus-visible,.type-section summary:focus-visible{outline:2px solid currentColor;outline-offset:4px}
.type-tone-light{--type-paper:#f3f1e9;--type-ink:#151515}
.type-tone-dark{--type-paper:#0b0b0b;--type-ink:#f3f1e9}
.type-section p{max-width:57ch;margin:0 0 1em}
.type-title{font-size:clamp(36px,5.4vw,76px);line-height:.98;letter-spacing:-.055em;margin:0 0 .3em;font-weight:800}
.type-label,.type-number,.type-brand{font-family:monospace;font-weight:700;letter-spacing:.08em}
.type-label{display:block;font-size:.74rem;margin-bottom:1.3rem}
.type-style-outline .type-title{color:var(--type-ink)}
@supports (-webkit-text-stroke:1px black){.type-style-outline .type-title{color:transparent;-webkit-text-stroke-width:1.3px;-webkit-text-stroke-color:var(--type-ink)}}
.type-style-serif .type-title{font-family:Georgia,serif!important;font-weight:500;letter-spacing:-.05em}
.type-header,.type-footer{display:flex;justify-content:space-between;align-items:baseline;gap:1rem 2rem;flex-wrap:wrap;padding-block-start:24px;padding-block-end:24px}
.type-header nav{display:flex;gap:.5rem 1.35rem;flex-wrap:wrap}
.type-header a,.type-footer a{font-size:.84rem}
.type-brand{font-size:1rem;text-decoration:none}
.type-header.type-layout-stacked,.type-footer.type-layout-stacked{display:grid;justify-content:start}
.type-hero{align-items:center}
.type-hero.type-layout-stacked{padding-block-start:clamp(46px,6.5vw,98px);padding-block-end:clamp(36px,5.5vw,74px)}
.type-hero .type-title{font-size:clamp(48px,8.7vw,126px);line-height:.97;max-width:18ch}
.type-hero-meta{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.9rem 2rem;border-top:1px solid color-mix(in srgb,currentColor 25%,transparent);padding-top:1.05rem}
.type-hero .type-intro{font-size:clamp(1rem,1.5vw,1.19rem);margin:0}
.type-hero .type-action{margin:0}
.type-hero.type-layout-split{grid-template-columns:minmax(0,1.4fr) minmax(0,1fr)}
.type-hero.type-layout-split .type-title{font-size:clamp(42px,6.2vw,92px)}
.type-hero.type-layout-stacked .type-art{display:none}
.type-action{display:inline-block;border:1px solid currentColor;padding:.55em .9em;margin-top:.45em;font-weight:700}
.type-layout-split{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(20px,4vw,60px)}
.type-layout-split .type-title{font-size:clamp(40px,7vw,100px)}
.type-layout-stacked .type-art{max-width:360px;margin:24px auto 0}
.type-art{margin:0;min-width:0;width:100%;max-width:360px}
.type-picture.type-layout-stacked .type-heading{text-align:center}
.type-art .tp-art[data-picture-empty="true"]{font-size:.78rem;letter-spacing:.13em;line-height:1.4;padding:clamp(28px,6vw,64px) 8px}
.type-art-surface{container-type:inline-size;background-color:var(--type-paper);color:var(--type-ink);border:1px solid color-mix(in srgb,currentColor 26%,transparent);text-align:center;min-width:0}
.type-art .tp-art{display:block;margin:0 auto;width:100%;padding:0;font-family:'Courier New',monospace;font-size:clamp(3px,.7vw,9px);font-size:calc(160cqw / var(--picture-columns,72));line-height:.98;letter-spacing:0;white-space:pre;text-align:center;overflow:hidden}
.type-art figcaption{margin:.85rem 0 0}
.type-items{display:grid;gap:0 1.4rem}
.type-layout-grid .type-items,.type-layout-stagger .type-items,.type-layout-timeline .type-items{grid-template-columns:repeat(3,minmax(0,1fr))}
.type-layout-stagger .type-item:nth-child(3n+2){margin-top:2.5rem}
.type-layout-stagger .type-item:nth-child(3n){margin-top:5rem}
.type-section .type-item{min-width:0;border-top:1px solid color-mix(in srgb,currentColor 32%,transparent);padding:1rem 0;margin-inline:0}
.type-section .type-item h3{margin:0 0 .35em;font-size:clamp(1.12rem,2vw,1.55rem);line-height:1.17}
.type-section .type-item p{margin:0}
.type-section .type-item blockquote{margin:0 0 .7rem}
.type-number{display:block;font-size:1.15rem;margin-bottom:.45rem}
.type-layout-rows .type-item:not(li){display:grid;grid-template-columns:3rem minmax(0,1fr);gap:.6rem}
.type-layout-rows .type-quote:not(li){display:block}
.type-steps{padding-inline-start:1.2em;list-style:decimal-leading-zero}
.type-steps li{display:list-item;margin-inline:1em}
.type-questions details{border-top:1px solid color-mix(in srgb,currentColor 32%,transparent);padding:1em 0}
.type-questions summary{cursor:pointer;font-weight:700}
.type-questions p{margin:.75em 0 0}
.type-cta.type-layout-stacked{text-align:center}
.type-cta.type-layout-stacked p{margin-inline:auto}
@media(max-width:760px){.type-layout-split,.type-hero.type-layout-split{grid-template-columns:minmax(0,1fr)}.type-layout-grid .type-items,.type-layout-stagger .type-items,.type-layout-timeline .type-items{grid-template-columns:minmax(0,1fr)}.type-layout-stagger .type-item:nth-child(n){margin-top:0}.type-hero{min-height:0}}
`;
