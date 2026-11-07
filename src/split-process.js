import {escapeHtml as e} from './project.js';

const ENGLISH = {
 label: 'PROCESS',
 title: ['How I', 'Work'],
 steps: [
  ['01 / RESEARCH', 'Start with evidence', 'I gather examples and look at the details before deciding what to build.'],
  ['02 / TEST', 'Test the details', 'I try an early version in real use and use what I learn to improve it.'],
 ],
};

const RAMA_STEPS = [
 ['01 / RESEARCH', 'Start with evidence', 'For MvuaKenya, I compare maps, satellite imagery and local reports to understand where flooding is a concern.'],
 ['02 / TEST', 'Test the details', 'For Gorilla Rampage, I play new mechanics on desktop and mobile, then tune the controls, timing and sound.'],
];

const KOREAN = {
 label: '작업 과정',
 title: ['나의 작업', '방식'],
 steps: [
  ['01 / 조사', '자료에서 시작합니다', 'MvuaKenya에서는 지도, 위성 영상, 현지 자료를 비교해 홍수 위험이 있는 곳을 살펴봅니다.'],
  ['02 / 테스트', '직접 해 보고 다듬습니다', '고릴라 램페이지의 새 기능을 PC와 모바일에서 직접 플레이하며 조작감, 타이밍, 소리를 조정합니다.'],
 ],
};

export function splitProcess({language='en', sample=false}={}) {
 const locale = language === 'ko' ? 'ko' : 'en';
 const copy = locale === 'ko' ? KOREAN : ENGLISH;
 const steps = locale === 'en' && sample ? RAMA_STEPS : copy.steps;
 return `<section class="bw-section" data-section="How I work" lang="${locale}">
  <div class="bw-panel">
   <div class="bw-header">
    <span class="bw-index">${e(copy.label)}</span>
    <h2 class="bw-heading"><span class="bw-prefix">${e(copy.title[0])}</span> <span class="bw-word">${e(copy.title[1])}</span></h2>
   </div>
   <div class="bw-columns">
    ${steps.map(([index, title, description]) => `<article class="bw-step">
     <span class="bw-index">${e(index)}</span>
     <h3>${e(title)}</h3>
     <p>${e(description)}</p>
    </article>`).join('')}
   </div>
  </div>
 </section>`;
}

export const SPLIT_PROCESS_CSS = `
.bw-section {
 box-sizing: border-box;
 max-width: var(--studio-width,1280px);
 margin-inline: auto;
 padding-block: clamp(42px,6vw,80px);
}
.bw-section * { box-sizing: border-box; }
.bw-section .bw-panel {
 --bw-dark: #0b0b0b;
 --bw-light: #f3f1e9;
 container-type: inline-size;
 background-image: linear-gradient(90deg,var(--bw-dark) 50%,var(--bw-light) 50%);
 border: 1px solid #575757;
}
.bw-section .bw-header {
 padding-block: clamp(28px,5cqw,60px) clamp(28px,4cqw,54px);
 text-align: center;
}
.bw-section .bw-heading {
 margin: 16px 0 0;
 font-weight: 700;
 text-transform: uppercase;
}
/* The text spans the full panel, so its color changes on the same seam. */
.bw-section .bw-header .bw-index,
.bw-section .bw-prefix,
.bw-section .bw-word {
 display: block;
 background-image: linear-gradient(90deg,var(--bw-light) 50%,var(--bw-dark) 50%);
 -webkit-background-clip: text;
 background-clip: text;
 color: transparent;
}
.bw-section .bw-index {
 font: 600 11px/1.5 'Courier New',monospace;
 letter-spacing: .12em;
}
.bw-section .bw-prefix {
 font: 700 clamp(16px,2.3cqw,28px)/1.25 Georgia,'Times New Roman',serif;
 letter-spacing: .22em;
}
.bw-section .bw-word {
 font: 700 clamp(44px,27cqw,250px)/.95 Georgia,'Times New Roman',serif;
 letter-spacing: -.065em;
 white-space: nowrap;
}
.bw-section .bw-columns {
 display: grid;
 grid-template-columns: repeat(2,minmax(0,1fr));
}
.bw-section .bw-step {
 color: var(--bw-light);
 padding: clamp(13px,3.5cqw,44px);
 border-top: 1px solid color-mix(in srgb,currentColor 32%,transparent);
}
.bw-section .bw-step + .bw-step { color: var(--bw-dark); }
.bw-section .bw-step h3 {
 margin: 12px 0 10px;
 font: 700 clamp(18px,3cqw,34px)/1.15 Georgia,'Times New Roman',serif;
 font-family: Georgia,'Times New Roman',serif !important;
 letter-spacing: -.025em;
}
.bw-section .bw-step p {
 margin: 0;
 max-width: 36ch;
 font: 400 clamp(14px,1.6cqw,17px)/1.55 Arial,Helvetica,sans-serif;
 overflow-wrap: anywhere;
}
.bw-section:lang(ko) .bw-prefix,
.bw-section:lang(ko) .bw-word {
 font-family: Batang,'Noto Serif CJK KR','Noto Serif KR',serif;
 line-height: 1.15;
}
.bw-section:lang(ko) .bw-step p,
.bw-section:lang(ko) .bw-index {
 font-family: 'Apple SD Gothic Neo','Malgun Gothic','Noto Sans CJK KR',sans-serif;
 word-break: keep-all;
}
@media (forced-colors: active) {
 .bw-section .bw-panel { background-image: none; background-color: Canvas; }
 .bw-section .bw-header .bw-index,
 .bw-section .bw-prefix,
 .bw-section .bw-word { background-image: none; color: CanvasText; }
}
`;
