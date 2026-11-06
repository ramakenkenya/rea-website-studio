import {escapeHtml as e} from './project.js';
import {RAMA_PHOTO} from './rama-photo.js';

const COPY={
 en:{label:'EXPERIMENT / CONTRAST IN MOTION',heading:'A different perspective.',portrait:'Portrait of Rama Ken in a split black-and-white composition',top:'ONE PERSON. MANY POSSIBILITIES.',rows:['STAY CURIOUS.','KEEP BUILDING.'],caption:'Two tones. An idea that keeps moving.',pause:'Pause motion',resume:'Resume motion',still:'Still view · reduced motion',edition:'BLACK / WHITE',foot:'CURIOSITY HAS NO SINGLE DIRECTION.'},
 ko:{label:'타이포그래피 실험 / 대비와 움직임',heading:'다른 시선으로 바라보다.',portrait:'흑백으로 나누어 표현한 라마 켄의 초상',top:'한 사람, 무한한 가능성.',rows:['계속 궁금해하다.','계속 만들다.'],caption:'두 가지 색, 계속 움직이는 생각.',pause:'움직임 멈추기',resume:'움직임 재생하기',still:'정지 화면 · 움직임 줄이기',edition:'검정 / 하양',foot:'호기심은 한 방향으로만 흐르지 않는다.'}
};

// The original bitmap is untouched. Aligned positive/negative CSS treatments
// meet at the centre; moving white lettering inverts over each background.
// A nested native checkbox needs no scripts or cross-page ID references.
export function monochromeMotion({sample=false,language='en',name='Your name'}={}){
 const locale=language==='ko'?'ko':'en',t=COPY[locale];
 const image=sample?`<img class="mm-photo mm-positive" src="${RAMA_PHOTO}" alt="${e(t.portrait)}" width="600" height="600" loading="lazy" decoding="async"/><img class="mm-photo mm-negative" src="${RAMA_PHOTO}" alt="" aria-hidden="true" width="600" height="600" loading="lazy" decoding="async"/>`:`<div class="mm-monogram" aria-hidden="true">${e(name.trim().slice(0,1).toUpperCase()||'M')}<span>↗</span></div>`;
 const rail=(text,i)=>`<div class="mm-rail"><div class="mm-track${i?' mm-reverse':''}">${Array.from({length:4},()=>`<span class="mm-word">${e(text)} <span class="mm-star">✳</span></span>`).join('')}</div></div>`;
 return `<section class="mm-section" data-section="Monochrome motion" lang="${locale}">
 <div class="mm-heading"><span class="mm-eyebrow">${e(t.label)}</span><h2>${e(t.heading)}</h2></div>
 <div class="mm-stage"><div class="mm-stage-meta" aria-hidden="true"><span>${e(sample?'RAMA KEN / '+t.edition:name)}</span><span>01 — ∞</span></div>
 <p class="mm-stage-title">${e(t.top)}</p>${image}
 <div class="mm-type" aria-hidden="true">${t.rows.map(rail).join('')}</div>
 <p class="mm-reader">${e(t.rows.join(' '))}</p><span class="mm-stage-foot" aria-hidden="true">${e(t.foot)}</span></div>
 <div class="mm-footer"><p>${e(t.caption)}</p><label class="mm-control"><input type="checkbox"/><span class="mm-pause">${e(t.pause)}</span><span class="mm-resume">${e(t.resume)}</span></label><span class="mm-still">${e(t.still)}</span></div></section>`;
}

export const MONOCHROME_MOTION_CSS=`
.mm-section{box-sizing:border-box;margin:0 auto;padding:64px 0;max-width:var(--studio-width,1280px);color:var(--studio-ink,#f3f1e9);font-family:Arial,Helvetica,sans-serif}
.mm-section *{box-sizing:border-box}
.mm-section .mm-heading{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:24px}
.mm-section .mm-eyebrow{font:11px/1.5 'Courier New',monospace;letter-spacing:1px}
.mm-section .mm-heading h2{font:700 clamp(23px,3vw,38px)/1.1 Arial,Helvetica,sans-serif;letter-spacing:-1px;margin:0}
.mm-section .mm-stage{position:relative;isolation:isolate;overflow:hidden;height:660px;background:linear-gradient(90deg,#080808 50%,#f5f3eb 50%);border:1px solid #424242;container-type:inline-size}
.mm-section .mm-stage-meta{position:absolute;z-index:3;top:24px;left:24px;right:24px;display:flex;justify-content:space-between;font:11px/1.5 'Courier New',monospace;letter-spacing:1px;color:white;mix-blend-mode:difference}
.mm-section .mm-stage-title{position:absolute;top:68px;left:24px;width:200px;margin:0;z-index:3;color:white;mix-blend-mode:difference;font:700 13px/1.5 Arial,sans-serif;letter-spacing:1px}
.mm-section .mm-photo{position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:min(640px,130%);max-width:none;height:auto;aspect-ratio:1;object-fit:contain;margin:0;border:0;border-radius:0}
.mm-section .mm-positive{filter:grayscale(1) contrast(3) brightness(1.1);mix-blend-mode:multiply;clip-path:inset(0 0 0 50%)}
.mm-section .mm-negative{filter:grayscale(1) contrast(3) brightness(1.1) invert(1);mix-blend-mode:screen;clip-path:inset(0 50% 0 0)}
.mm-section .mm-type{position:absolute;bottom:58px;left:0;right:0;z-index:4;color:#fff;mix-blend-mode:difference;pointer-events:none}
.mm-section .mm-rail{overflow:hidden}
.mm-section .mm-track{display:flex;width:max-content;animation:mm-travel 32s linear infinite;will-change:transform}
.mm-section .mm-reverse{animation-direction:reverse;animation-duration:38s}
.mm-section .mm-word{display:block;flex:none;white-space:nowrap;padding-right:32px;font:900 clamp(54px,9.5cqw,142px)/.98 Arial,Helvetica,sans-serif;letter-spacing:-.055em}
.mm-section .mm-star{display:inline-block;font-weight:400;vertical-align:10%;font-size:.55em;letter-spacing:0;margin-inline:12px}
.mm-section .mm-stage-foot{position:absolute;bottom:20px;left:24px;z-index:4;color:white;mix-blend-mode:difference;font:10px/1.5 'Courier New',monospace;letter-spacing:1px}
.mm-section .mm-footer{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-top:16px;font:12px/1.6 Arial,sans-serif}
.mm-section .mm-footer p{margin:0}
.mm-section .mm-control{display:inline-flex;align-items:center;gap:9px;min-height:44px;cursor:pointer;flex-shrink:0}
.mm-section .mm-control input{appearance:auto;width:18px;height:18px;margin:0;accent-color:currentColor;cursor:pointer}
.mm-section .mm-control:focus-within{outline:2px solid currentColor;outline-offset:5px}
.mm-section .mm-resume,.mm-section .mm-still{display:none}
.mm-section:has(.mm-control input:checked) .mm-track{animation-play-state:paused}
.mm-section:has(.mm-control input:checked) .mm-pause{display:none}
.mm-section:has(.mm-control input:checked) .mm-resume{display:inline}
.mm-section .mm-reader{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.mm-section .mm-monogram{position:absolute;inset:80px 0 0;display:flex;align-items:center;justify-content:center;gap:24px;color:white;mix-blend-mode:difference;font:900 clamp(150px,48cqw,600px)/1 Arial,sans-serif;letter-spacing:-.1em}
.mm-section .mm-monogram span{font-size:.55em}
.mm-section:lang(ko),.mm-section:lang(ko) .mm-heading h2,.mm-section:lang(ko) .mm-word,.mm-section:lang(ko) .mm-stage-title{font-family:'Apple SD Gothic Neo','Malgun Gothic','Noto Sans CJK KR','Noto Sans KR',Arial,sans-serif;word-break:keep-all}
.mm-section:lang(ko) .mm-word{font-size:clamp(48px,8.5cqw,125px);line-height:1.12;letter-spacing:-.065em}
@keyframes mm-travel{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@media(max-width:760px){.mm-section{padding:48px 0}.mm-section .mm-heading{align-items:start;flex-direction:column;gap:12px}.mm-section .mm-stage{height:540px}.mm-section .mm-stage-title{top:62px;width:170px}.mm-section .mm-footer{align-items:start}.mm-section .mm-footer p{max-width:200px}.mm-section .mm-stage-meta{font-size:10px}}
@media(max-width:480px){.mm-section .mm-stage{height:480px}.mm-section .mm-stage-meta{top:18px;left:16px;right:16px;font-size:9px;letter-spacing:0}.mm-section .mm-stage-title{left:16px;width:150px;font-size:11px}.mm-section .mm-photo{width:440px;max-width:none}.mm-section .mm-type{bottom:54px}.mm-section .mm-word{padding-right:18px}.mm-section .mm-stage-foot{left:16px;right:16px;font-size:8px;letter-spacing:.5px}.mm-section .mm-footer{flex-wrap:wrap;gap:8px}.mm-section .mm-footer p{max-width:none}.mm-section .mm-control{margin-left:auto}}
@media(prefers-reduced-motion:reduce){.mm-section .mm-track{animation:none;transform:none;will-change:auto;display:block;width:100%}.mm-section .mm-word{white-space:normal;font-size:clamp(26px,6cqw,72px);line-height:1.15;padding:0 16px}.mm-section:lang(ko) .mm-word{font-size:clamp(24px,5.5cqw,68px)}.mm-section .mm-word:not(:first-child){display:none}.mm-section .mm-star{font-size:.6em;margin-inline:5px}.mm-section .mm-control{display:none}.mm-section .mm-still{display:inline}}
`;
