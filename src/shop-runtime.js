import {shopEngine} from './shop-engine.js';
// Exported as a classic script. Uses DOM text nodes for all visitor/customer data.
function mountShops(E){
 document.querySelectorAll('[data-rea-shop]').forEach((root,index)=>{
  let shop;try{shop=JSON.parse(root.getAttribute('data-shop-config'));}catch{return;}
  let cart=[];const $=s=>root.querySelector(s),list=$('.rea-shopping-list'),form=$('[data-shop-checkout]'),review=$('[data-shop-review]');if(!list||!form||!review)return;
  list.id='shopping-list-'+(index+1);$('.rea-shop-list-link').href='#'+list.id;
  const node=(tag,value,attrs={})=>{const el=document.createElement(tag);if(value!==undefined)el.textContent=value;for(const [k,v]of Object.entries(attrs))el.setAttribute(k,v);return el;};
  function invalidate(){review.hidden=true;$('[data-shop-whatsapp]').removeAttribute('href');$('[data-shop-message]').value='';$('[data-shop-error]').textContent='';}
  function renderList(){
   invalidate();const host=$('[data-shop-lines]');host.replaceChildren();const s=E.summary(shop,cart);$('[data-shop-count]').textContent=String(cart.reduce((n,x)=>n+x.quantity,0));$('[data-shop-subtotal]').textContent='Estimated subtotal: '+E.money(s.totalCents,shop.currency);
   if(!cart.length){host.append(node('p','Your list is empty. Add something you like above.'));return;}
   s.lines.forEach((x,i)=>{const row=node('div',undefined,{class:'rea-cart-line'}),details=node('div');details.append(node('strong',x.product.name),node('small',[x.product.code,x.size&&'Size: '+x.size,x.colour&&'Colour: '+x.colour].filter(Boolean).join(' · ')));
    const label=node('label','Quantity'),input=node('input',undefined,{type:'number',min:'1',max:'99',step:'1',value:x.quantity,'aria-label':'Quantity for '+x.product.name+(x.size?' '+x.size:'')+(x.colour?' '+x.colour:'')});label.append(input);
    input.addEventListener('change',()=>{try{const quantity=Number(input.value);if(!Number.isInteger(quantity)||quantity<1||quantity>99)throw Error('Choose a quantity from 1 to 99.');cart[i]={...cart[i],quantity};renderList();}catch(err){input.value=x.quantity;$('[data-shop-error]').textContent=err.message;}});
    const remove=node('button','Remove',{type:'button','aria-label':'Remove '+x.product.name+(x.size?' '+x.size:'')+(x.colour?' '+x.colour:'')});remove.onclick=()=>{cart.splice(i,1);renderList();};row.append(details,label,node('strong',E.money(x.totalCents,shop.currency)),remove);host.append(row);
   });
  }
  root.querySelectorAll('[data-shop-add]').forEach(button=>button.onclick=()=>{const card=button.closest('[data-shop-product]');try{cart=E.add(shop,cart,{id:card.getAttribute('data-shop-product'),size:card.querySelector('[data-shop-size]')?.value||'',colour:card.querySelector('[data-shop-colour]')?.value||'',quantity:card.querySelector('[data-shop-quantity]').value});renderList();$('[data-shop-notice]').textContent='Added to your shopping list. Review it below.';button.textContent='Added ✓';setTimeout(()=>{button.textContent='Add to shopping list';},1200);}catch(err){$('[data-shop-notice]').textContent=err.message;}});
  function filter(){const query=$('[data-shop-search]').value.trim().toLowerCase(),category=$('[data-shop-category]').value;let count=0;root.querySelectorAll('[data-shop-product]').forEach(card=>{const p=shop.products.find(x=>x.id===card.getAttribute('data-shop-product'));const visible=!!p&&(!category||p.category===category)&&(!query||[p.name,p.code,p.description].join(' ').toLowerCase().includes(query));card.hidden=!visible;if(visible)count++;});$('[data-shop-empty]').hidden=count>0;}
  $('[data-shop-search]').oninput=filter;$('[data-shop-category]').onchange=filter;
  form.addEventListener('input',invalidate);form.addEventListener('change',invalidate);
  form.onsubmit=event=>{event.preventDefault();try{const data=Object.fromEntries(new FormData(form)),result=E.order(shop,cart,data,shop.business);$('[data-shop-message]').value=result.message;const link=$('[data-shop-whatsapp]'),status=$('[data-shop-handoff]');link.hidden=!result.url;if(result.url)link.href=result.url;else link.removeAttribute('href');status.textContent=!result.url?'This business has not set its WhatsApp number. Copy this list and contact the business directly.':'Your request is ready. It has not been sent yet.';
    if(result.url.length>6000){status.textContent='This is a long shopping list. If the WhatsApp draft is cut short, copy the full message below and paste it into the chat.';}
    review.hidden=false;review.focus();review.scrollIntoView({block:'nearest',behavior:'smooth'});
   }catch(err){$('[data-shop-error]').textContent=err.message;}
  };
  $('[data-shop-copy]').onclick=async()=>{const message=$('[data-shop-message]');try{if(!navigator.clipboard?.writeText)throw Error();await navigator.clipboard.writeText(message.value);$('[data-shop-handoff]').textContent='Shopping list copied. Paste it into your chat and send when ready.';}catch{message.focus();message.select();$('[data-shop-handoff]').textContent='Select and copy the message above, then paste it into your chat.';}};
  renderList();
 });
}
export const shopRuntimeSource=()=>`(${mountShops.toString()})((${shopEngine.toString()})());`;
