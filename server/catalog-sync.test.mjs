import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import source from '../data/catalog.json' with {type:'json'};
import registry from '../data/menu-id-registry.json' with {type:'json'};
import vectors from './data/vectors.json' with {type:'json'};
import {catalog,recommend,handleApi,CATALOG_VERSION} from './api.mjs';
import {validateCatalog,toBrowserCatalog,toApiCatalog,menuOrderability,embeddingInputs,cartConflict} from '../shared/catalog.mjs';
import trends from './data/curated_trends.json' with {type:'json'};
const noModel=()=>{throw Error('Unexpected model call');};
const byId=new Map(Object.entries(source.menus).flatMap(([rid,m])=>m.items.map(item=>[item.id,{rid,item,group:m}])));

test('browser and AI are projections of the same complete catalog',async()=>{
 const ctx={window:{}};vm.createContext(ctx);vm.runInContext(await readFile(new URL('../public/catalog-data.js',import.meta.url),'utf8'),ctx);
 const w=JSON.parse(JSON.stringify(ctx.window));assert.equal(w.RoomBapCatalogVersion,CATALOG_VERSION);
 assert.deepEqual(w.RoomBapMenuData,toBrowserCatalog(source).menus);assert.deepEqual(w.RoomBapRestaurants,source.restaurants);
 assert.deepEqual(w.RoomBapHotelStay,source.hotel);assert.deepEqual(w.RoomBapVenuePhotos,source.media.venue_photos);assert.deepEqual(w.RoomBapFoodPhotos,source.media.food_photos);
 assert.equal(catalog.menus.length,byId.size);assert.equal(catalog.restaurants.length,source.restaurants.length);
 for(const m of catalog.menus){const {rid,item,group}=byId.get(m.id);assert.equal(m.restaurant_id,rid);assert.equal(m.name,item.name);assert.equal(m.price_krw,item.price);assert.deepEqual(m.options,item.groups);assert.equal(m.in_stock_in_demo,menuOrderability(item).available);
  const route=catalog.delivery_routes.find(r=>r.restaurant_id===rid);assert.equal(route.minimum_order_krw,group.minOrder);assert.equal(route.delivery_fee_krw,group.deliveryFee);
 }
});
test('new menus exist and retired menu IDs cannot appear in recommendations or search vectors',async()=>{
 for(const id of Object.keys(registry.retired)){assert.ok(!byId.has(id));assert.ok(!catalog.menus.some(m=>m.id===id));assert.ok(!vectors.vectors['menu:'+id]);}
 assert.ok(byId.has('place-dessert-4-dubai-cookie'));assert.ok(byId.has('place-salad-plant-reference-0'));
 const r=await recommend({limit:10},{},noModel);for(const i of r.items)assert.ok(byId.has(i.menu.id));
});
test('reordering menus preserves identities; a positional ID cannot change foods',()=>{
 const s=structuredClone(source);for(const group of Object.values(s.menus))group.items.reverse();validateCatalog(s,registry);
 const projected=toApiCatalog(s,'reorder-test');for(const m of projected.menus)assert.equal(m.name,byId.get(m.id).item.name);
 const swapped=structuredClone(source),items=swapped.menus['place-salad-plant'].items;[items[0].id,items[1].id]=[items[1].id,items[0].id];assert.throws(()=>validateCatalog(swapped,registry),/menu id/);
});
test('unregistered, duplicate, retired and dangling IDs fail validation',()=>{
 const mutations=[s=>s.menus['place-salad-plant'].items[0].id='new-unregistered',s=>s.menus['place-salad-plant'].items[1].id=s.menus['place-salad-plant'].items[0].id,s=>s.menus['place-salad-plant'].items[0].id=Object.keys(registry.retired)[0],s=>s.menus.unknown=s.menus['place-salad-plant']];
 for(const mutate of mutations){const s=structuredClone(source);mutate(s);assert.throws(()=>validateCatalog(s,registry));}
});
test('impossible required options block a menu; mandatory extra prices are retained',()=>{
 const item=structuredClone(source.menus['place-chicken-1'].items[0]);item.soldOut=false;const group=item.groups.find(g=>g.required);for(const o of group.options)o.soldOut=true;assert.equal(menuOrderability(item).available,false);
 group.options[0].soldOut=false;group.options[0].price=2500;assert.ok(menuOrderability(item).minimum_required_options_krw>=2500);
});
test('raw recipe and dietary references are retained without promoting them to complete declarations',async()=>{
 const plant=catalog.menus.find(m=>m.id==='place-salad-plant-reference-0');assert.equal(plant.source_dietary.vegan,'verified');assert.deepEqual(plant.ingredients,[]);assert.equal(plant.ingredients_status,'unknown');assert.equal(plant.vegetarian_status,'unknown');
 const cookie=catalog.menus.find(m=>m.id==='place-dessert-4-dubai-cookie');assert.deepEqual(cookie.allergens,['tree_nut']);assert.equal(cookie.source_allergen_status,'incomplete');assert.equal(cookie.allergens_status,'unknown');assert.equal(cookie.price_krw,6800);
 assert.deepEqual((await recommend({preferences:{allergies:['nuts']}},{},noModel)).items,[]);
 assert.deepEqual((await recommend({preferences:{diet:'vegetarian'}},{},noModel)).items,[]);
});
test('actual dish tags do not classify all Salad/Halal restaurants as salad or certified food',()=>{
 const pizza=catalog.menus.find(m=>m.id==='place-salad-slunch-reference-0');assert.ok(pizza.tags.includes('pizza'));assert.ok(!pizza.tags.includes('salad'));
 const curry=catalog.menus.find(m=>m.id==='place-halal-amma-reference-0');assert.ok(curry.tags.includes('curry'));assert.equal(curry.source_dietary.halal,'unknown');
});
test('salad, pizza and curry filters can reach the newly synchronized real menu IDs',async()=>{
 for(const tag of ['salad','pizza','curry','poke']){const r=await recommend({profile:{required_tags:[tag]},limit:10},{},noModel);assert.ok(r.items.length,tag);for(const i of r.items){assert.ok(i.menu.tags.includes(tag));assert.ok(byId.has(i.menu.id));}}
});
test('the newly listed Dubai cookie is linked to its topic without inventing chocolate ingredients',async()=>{
 const topic=trends.find(t=>t.id==='dubai-chewy-cookie');const r=await recommend({trend_id:topic.id},{},noModel,topic);
 const item=r.related_menus.find(i=>i.menu.id==='place-dessert-4-dubai-cookie');assert.ok(item);assert.equal(item.menu.price_krw,6800);assert.ok(!item.menu.tags.includes('chocolate'));
});
test('all current menu/tag/evidence vectors belong to this catalog version',()=>{
 assert.equal(vectors.catalog_version,CATALOG_VERSION);assert.deepEqual(Object.keys(vectors.vectors).sort(),Object.keys(embeddingInputs(catalog,trends)).sort());
});
test('stale browser catalog versions are rejected before a model request',async()=>{
 const response=await handleApi(new Request('https://demo.test/api/food-finder',{method:'POST',headers:{'Content-Type':'application/json','X-RoomBap-Catalog-Version':'stale-version'},body:JSON.stringify({query:'anything'})}),{},noModel);
 assert.equal(response.status,409);const data=await response.json();assert.equal(data.detail.code,'catalog_version_mismatch');assert.equal(data.catalog_version,CATALOG_VERSION);
});
test('saved carts are blocked on retired IDs or changed prices without altering their contents',()=>{
 const retired={restaurantId:'place-dessert-4',items:[{restaurantId:'place-dessert-4',itemId:'place-dessert-4-bingsu',name:'Bingsu (Shaved Ice)',qty:2,unitPrice:12000,selections:{}}]};
 const before=structuredClone(retired);assert.equal(cartConflict(retired,source.menus),'menu_removed');assert.deepEqual(retired,before);
 const item=source.menus['place-dessert-4'].items[0];const valid={restaurantId:'place-dessert-4',items:[{restaurantId:'place-dessert-4',itemId:item.id,name:item.name,qty:1,unitPrice:item.price,selections:{}}]};
 assert.equal(cartConflict(valid,source.menus),null);valid.items[0].unitPrice=1;assert.equal(cartConflict(valid,source.menus),'price_or_name_changed');
});
