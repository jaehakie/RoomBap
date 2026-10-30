import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {randomUUID} from 'node:crypto';
import {cartConflict} from '../shared/catalog.mjs';
const script=await readFile(new URL('../public/cart-order-fixes.js',import.meta.url),'utf8');
const plain=value=>JSON.parse(JSON.stringify(value));
function setup(uuid=randomUUID){
 const events={},messages=[],writes=[],calls={open:[],normalAdd:[],cart:0,badge:0,orders:[]};
 const item={id:'meal',name:'Meal',category:'Rice',price:10000,soldOut:false,groups:[{key:'size',type:'single',required:true,min:1,max:1,options:[{key:'regular',price:0,soldOut:false},{key:'large',price:2000,soldOut:false}]}]};
 const line={lineId:'line-1',restaurantId:'restaurant',itemId:item.id,name:item.name,category:item.category,selections:{size:['regular']},unitPrice:10000,qty:2,key:'meal::size=regular'};
 const elements={'#detail-close':{onclick:null},'#detail':{addEventListener(name,fn){(events[name]??=[]).push(fn);}},'#pay-btn':{disabled:false,textContent:''}};
 const c={structuredClone,crypto:{randomUUID:uuid},document:{querySelector:key=>elements[key]},profile:{lang:'en'},menuData:{restaurant:{minOrder:10000,deliveryFee:2000,items:[item]}},restaurants:[{id:'restaurant',en:'Demo Restaurant'}],cart:{restaurantId:'restaurant',items:[line]},orders:[],orderSubmitting:false,checkoutInfo:{room:'302',pickup:{label:'Lobby'},name:'Demo Guest',phoneCode:'+82',phone:'01000000000',restaurantNote:'',receivingNote:'',cutlery:true},paymentMethods:[{id:'demo',label:'Demo — no charge'}],selectedPayment:'demo',RoomBapCartConflict:cartConflict,
  toast:value=>messages.push(value),put:(key,value)=>writes.push({key,value:plain(value)}),renderCartBadge:()=>calls.badge++,openCart:()=>calls.cart++,showOrder:value=>calls.orders.push(value),
  openMenuItem:(...args)=>calls.open.push(args),addToCart:(...args)=>calls.normalAdd.push(args),closeDetail:()=>{for(const fn of events.close||[])fn();},completeOrder:()=>{},
  selectionPrice:(item,selections)=>item.price+item.groups.reduce((total,g)=>total+(selections[g.key]||[]).reduce((n,key)=>n+(g.options.find(o=>o.key===key)?.price||0),0),0),
  selectionSummary:(item,selections)=>Object.entries(selections).map(([key,values])=>key+': '+values.join(', ')).join(' · '),
  cartLineKey:(id,selections)=>id+'::'+Object.keys(selections).sort().map(k=>k+'='+[...selections[k]].sort().join(',')).join('|'),
  cartTotals:()=>{const subtotal=c.cart.items.reduce((n,l)=>n+l.unitPrice*l.qty,0);return {itemsTotal:subtotal,deliveryFee:2000,total:subtotal+2000,belowMin:subtotal<10000};},
 };
 c.window=c;vm.createContext(c);vm.runInContext(script,c);
 return {c,item,line,calls,messages,writes,elements};
}
test('opening an edit leaves the cart and persisted state unchanged, and gives the renderer a copy',()=>{
 const {c,calls,writes}=setup(),before=plain(c.cart);c.editCartLine('line-1');assert.deepEqual(plain(c.cart),before);assert.equal(writes.length,0);assert.equal(calls.open.length,1);
 calls.open[0][2].size.push('draft-only');assert.deepEqual(plain(c.cart),before);
});
test('closing or canceling preserves the original options/quantity and abandons the edit',()=>{
 const {c,writes,calls,elements}=setup(),before=plain(c.cart);c.editCartLine('line-1');elements['#detail-close'].onclick();assert.deepEqual(plain(c.cart),before);assert.equal(writes.length,0);
 c.addToCart('restaurant','meal',{size:['large']},1);assert.equal(calls.normalAdd.length,1);
});
test('a normal menu opening abandons an old draft without replacing an unrelated item',()=>{
 const {c,calls}=setup();c.editCartLine('line-1');c.openMenuItem('restaurant','meal');c.addToCart('restaurant','meal',{size:['regular']},1);assert.equal(calls.normalAdd.length,1);assert.equal(c.cart.items[0].qty,2);
});
test('saving changes replaces the same line once, updates price, and does not add the old quantity',()=>{
 const {c,writes,calls}=setup();c.editCartLine('line-1');c.addToCart('restaurant','meal',{size:['large']},3);
 assert.equal(c.cart.items.length,1);const l=c.cart.items[0];assert.equal(l.lineId,'line-1');assert.equal(l.qty,3);assert.equal(l.unitPrice,12000);assert.deepEqual(plain(l.selections),{size:['large']});assert.equal(c.cartTotals().itemsTotal,36000);assert.equal(c.cartTotals().total,38000);
 assert.equal(writes.filter(w=>w.key==='cart').length,1);assert.equal(calls.normalAdd.length,0);assert.equal(calls.cart,1);
});
test('editing into identical options merges the quantity without duplicate lines',()=>{
 const {c}=setup();c.cart.items.push({...plain(c.cart.items[0]),lineId:'line-2',key:'meal::size=large',selections:{size:['large']},unitPrice:12000,qty:4});
 c.editCartLine('line-1');c.addToCart('restaurant','meal',{size:['large']},3);assert.equal(c.cart.items.length,1);assert.equal(c.cart.items[0].lineId,'line-2');assert.equal(c.cart.items[0].qty,7);
});
test('over-limit merging is rejected without silently deleting quantity and can be corrected',()=>{
 const {c,writes,messages}=setup();c.cart.items.push({...plain(c.cart.items[0]),lineId:'line-2',key:'meal::size=large',selections:{size:['large']},unitPrice:12000,qty:7});const before=plain(c.cart);
 c.editCartLine('line-1');c.addToCart('restaurant','meal',{size:['large']},5);assert.deepEqual(plain(c.cart),before);assert.equal(writes.length,0);assert.ok(messages.at(-1).includes('10'));
 c.addToCart('restaurant','meal',{size:['large']},2);assert.equal(c.cart.items.length,1);assert.equal(c.cart.items[0].qty,9);
});
test('invalid or unavailable options do not replace the existing line',()=>{
 const {c,item,writes}=setup(),before=plain(c.cart);c.editCartLine('line-1');c.addToCart('restaurant','meal',{size:['nonexistent']},3);assert.deepEqual(plain(c.cart),before);
 item.groups[0].options[1].soldOut=true;c.addToCart('restaurant','meal',{size:['large']},3);assert.deepEqual(plain(c.cart),before);assert.equal(writes.length,0);
});
test('a line removed while editing is not silently re-added as a new item',()=>{
 const {c,calls,writes}=setup();c.editCartLine('line-1');c.cart.items=[];c.addToCart('restaurant','meal',{size:['large']},3);assert.equal(c.cart.items.length,0);assert.equal(calls.normalAdd.length,0);assert.equal(writes.length,0);
});
test('missing or sold-out menus cannot start an edit or remove the old item',()=>{
 for(const soldOut of [false,true]){const {c,item,calls}=setup(),before=plain(c.cart);if(soldOut)item.soldOut=true;else c.menuData.restaurant.items=[];c.editCartLine('line-1');assert.deepEqual(plain(c.cart),before);assert.equal(calls.open.length,0);}
});
test('a completed order uses a full UUID, preserves totals, and ignores a repeated old payment callback',()=>{
 const {c,calls,writes}=setup();c.orders.push({id:'RB-123456',stage:2});c.completeOrder();c.completeOrder();
 assert.equal(c.orders.length,2);assert.match(c.orders[0].id,/^RB-[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/);assert.equal(c.orders[0].itemsTotal,20000);assert.equal(c.orders[0].total,22000);assert.equal(c.orders[1].id,'RB-123456');assert.equal(c.orders[1].stage,2);
 assert.equal(c.cart.items.length,0);assert.equal(c.checkoutInfo,null);assert.equal(calls.orders.length,1);assert.equal(writes.filter(w=>w.key==='orders').length,1);
});
test('UUID collision retries check existing order history',()=>{
 const existing='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',next='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';let n=0;const {c}=setup(()=>++n===1?existing:next);c.orders.push({id:'RB-'+existing.toUpperCase()});c.completeOrder();assert.equal(n,2);assert.equal(c.orders[0].id,'RB-'+next.toUpperCase());
});
test('persistent ID collision or crypto failure cannot create an order or clear the cart',()=>{
 for(const throwError of [false,true]){const id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';const {c,writes}=setup(()=>{if(throwError)throw Error('unavailable');return id;});c.orders.push({id:'RB-'+id.toUpperCase()});const before=plain(c.cart);c.completeOrder();assert.equal(c.orders.length,1);assert.deepEqual(plain(c.cart),before);assert.equal(writes.length,0);assert.ok(c.checkoutInfo);}
});
test('changed prices, incomplete checkout and unfinished edits cannot create an order',()=>{
 for(const scenario of ['price','checkout','edit']){const {c,writes}=setup(),before=plain(c.cart);if(scenario==='price')c.cart.items[0].unitPrice=1;if(scenario==='checkout')c.checkoutInfo=null;if(scenario==='edit')c.editCartLine('line-1');const current=plain(c.cart);c.completeOrder();assert.equal(c.orders.length,0);assert.deepEqual(plain(c.cart),current);assert.equal(writes.length,0);}
});
