// Self-contained so precisely the same arithmetic and order rules run in exported sites.
export function shopEngine(){
 const text=v=>String(v??'').trim();
 function phone(value){const raw=text(value);if(!raw)return '';if(!/^\+?[\d\s()-]+$/.test(raw))throw Error('Use the business WhatsApp number with its country code, e.g. +254712345678.');const digits=raw.replace(/\D/g,'');if(!/^[1-9]\d{7,14}$/.test(digits))throw Error('Use 8–15 digits including the country code, without a leading zero.');return digits;}
 function money(cents,currency){return new Intl.NumberFormat('en',{style:'currency',currency,minimumFractionDigits:2,maximumFractionDigits:2}).format(cents/100);}
 function line(shop,input){const p=shop.products.find(p=>p.id===input.id);if(!p||!p.available)throw Error('This product is not available.');const quantity=Number(input.quantity);if(!Number.isInteger(quantity)||quantity<1||quantity>99)throw Error('Choose a quantity from 1 to 99.');const size=text(input.size),colour=text(input.colour);if(p.sizes.length?!p.sizes.includes(size):!!size)throw Error('Choose an available size.');if(p.colours.length?!p.colours.includes(colour):!!colour)throw Error('Choose an available colour.');return {id:p.id,size,colour,quantity};}
 function add(shop,cart,input){const next=cart.map(x=>line(shop,x)),item=line(shop,input),match=next.find(x=>x.id===item.id&&x.size===item.size&&x.colour===item.colour);if(match){if(match.quantity+item.quantity>99)throw Error('A product option can have at most 99 items.');match.quantity+=item.quantity;}else{if(next.length>=12)throw Error('Keep up to 12 different product options per shopping list.');next.push(item);}return next;}
 function summary(shop,cart){const lines=cart.map(input=>{const item=line(shop,input),product=shop.products.find(p=>p.id===item.id);return {...item,product,totalCents:product.priceCents*item.quantity};});return {lines,totalCents:lines.reduce((sum,x)=>sum+x.totalCents,0)};}
 function order(shop,cart,customer,business='Our shop'){
  if(!cart.length)throw Error('Your shopping list is empty. Add a product first.');
  const s=summary(shop,cart),name=text(customer.name),contact=text(customer.phone),method=text(customer.method),location=text(customer.location),notes=text(customer.notes);
  if(!name||name.length>100)throw Error('Enter your name (up to 100 characters).');if(!contact||contact.length>40)throw Error('Enter your contact phone (up to 40 characters).');
  if(!['Pickup','Delivery'].includes(method))throw Error('Choose pickup or delivery.');if(method==='Delivery'&&!location)throw Error('Enter your delivery location.');if(location.length>200||notes.length>500)throw Error('Use up to 200 characters for location and 500 for notes.');
  const message=[`Shopping request — ${text(business).slice(0,180)}`, '',...s.lines.map((x,i)=>`${i+1}. ${x.product.name} [${x.product.code}]${x.size?' · Size: '+x.size:''}${x.colour?' · Colour: '+x.colour:''}\n   ${x.quantity} × ${money(x.product.priceCents,shop.currency)} = ${money(x.totalCents,shop.currency)}`),'',`Estimated subtotal: ${money(s.totalCents,shop.currency)}`,'Delivery fees not included. Please confirm availability and final total.','',`Name: ${name}`,`Phone: ${contact}`,`Method: ${method}`,location?`Location: ${location}`:'',notes?`Notes: ${notes}`:''].filter((x,i,a)=>x!==''||a[i-1]!=='').join('\n');
  const recipient=phone(shop.phone);return {message,url:recipient?'https://wa.me/'+recipient+'?text='+encodeURIComponent(message):'',totalCents:s.totalCents};
 }
 return {phone,money,add,summary,order};
}
