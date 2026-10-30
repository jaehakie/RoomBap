/* Pure projections of the one editable menu catalog, shared by build and server. */
export const TAGS=['rice','chicken','soup','dumplings','bbq','street_food','dessert','noodles','warm','mild','spicy','fruity','chewy','sweet','chocolate','bread','pastry','rice_cake','crispy','nutty','salad','poke','pizza','curry','sandwich','falafel','naan','gnocchi'];
const fail=message=>{throw new Error('Invalid catalog: '+message);};
const unique=(items,name)=>{if(new Set(items).size!==items.length)fail('duplicate '+name);};
const integer=(value,name)=>{if(!Number.isSafeInteger(value)||value<0)fail('invalid '+name);};
export function validateCatalog(source,registry){
 if(source.schema_version!=='1.0'||!Array.isArray(source.restaurants)||!source.menus||!source.hotel_id)fail('schema');
 const restaurants=new Set(source.restaurants.map(r=>r.id));unique(source.restaurants.map(r=>r.id),'restaurant id');
 const active=[];
 for(const [rid,group] of Object.entries(source.menus)){
  if(!restaurants.has(rid)||group.restaurantId!==rid||!Array.isArray(group.items))fail('restaurant/menu reference');
  integer(group.minOrder,'minimum order');integer(group.deliveryFee,'delivery fee');
  for(const item of group.items){
   if(typeof item.id!=='string'||!item.id||typeof item.name!=='string'||!item.name||!Array.isArray(item.groups)||typeof item.soldOut!=='boolean')fail('menu fields');
   integer(item.price,'price');active.push(item.id);
   if(!item.ai||!Array.isArray(item.ai.tags)||item.ai.tags.some(t=>!TAGS.includes(t))||!Array.isArray(item.ai.topic_ids))fail('search tags');
   unique(item.ai.tags,'tag');unique(item.groups.map(g=>g.key),'option group');
   for(const g of item.groups){
    if(!['single','multi'].includes(g.type)||typeof g.required!=='boolean'||!Array.isArray(g.options))fail('option group');
    integer(g.min,'option minimum');integer(g.max,'option maximum');if(g.min>g.max||(g.type==='single'&&g.max>1))fail('option count');
    unique(g.options.map(o=>o.key),'option key');
    for(const o of g.options){integer(o.price,'option price');if(typeof o.soldOut!=='boolean')fail('option stock');}
   }
   const identity=registry.active[item.id];
   if(!identity||identity.restaurant_id!==rid||identity.name!==item.name||registry.retired[item.id])fail('unregistered, reused or renamed menu id '+item.id);
  }
 }
 unique(active,'menu id');
 if(Object.keys(registry.active).length!==active.length||Object.keys(registry.active).some(id=>!active.includes(id)))fail('update the ID registry for deleted menus');
 return source;
}
export function toBrowserCatalog(source){
 const menus={};
 for(const [id,group] of Object.entries(source.menus))menus[id]={...group,items:group.items.map(({ai,...item})=>item)};
 return {restaurants:source.restaurants,menus,hotel:source.hotel,media:source.media};
}
export function menuOrderability(item){
 let minimumExtra=0;
 for(const g of item.groups){
  if(!g.required)continue;
  const available=g.options.filter(o=>!o.soldOut).sort((a,b)=>a.price-b.price);
  if(available.length<g.min)return {available:false,minimum_required_options_krw:null};
  minimumExtra+=available.slice(0,g.min).reduce((n,o)=>n+o.price,0);
 }
 return {available:!item.soldOut,minimum_required_options_krw:minimumExtra};
}
export function cartConflict(cart,menus){
 if(!cart||!Array.isArray(cart.items)||!cart.items.length)return null;
 for(const line of cart.items){
  const item=menus[line.restaurantId]?.items.find(i=>i.id===line.itemId);
  if(line.restaurantId!==cart.restaurantId||!item)return 'menu_removed';
  if(item.soldOut)return 'menu_unavailable';
  if(!Number.isInteger(line.qty)||line.qty<1||line.qty>10||!line.selections||typeof line.selections!=='object')return 'invalid_selection';
  if(Object.keys(line.selections).some(k=>!item.groups.some(g=>g.key===k)))return 'options_changed';
  let price=item.price;
  for(const g of item.groups){
   const selected=line.selections[g.key]||[];
   if(!Array.isArray(selected)||new Set(selected).size!==selected.length||selected.length>g.max||(g.required&&selected.length<g.min))return 'options_changed';
   for(const key of selected){const option=g.options.find(o=>o.key===key&&!o.soldOut);if(!option)return 'options_changed';price+=option.price;}
  }
  if(price!==line.unitPrice||line.name!==item.name)return 'price_or_name_changed';
 }
 return null;
}
export function toApiCatalog(source,version){
 const menus=[],routes=[];
 for(const [rid,group] of Object.entries(source.menus)){
  routes.push({restaurant_id:rid,hotel_id:source.hotel_id,enabled:true,minimum_order_krw:group.minOrder,delivery_fee_krw:group.deliveryFee,mode:'demo'});
  for(const item of group.items){
   const {ai,...display}=item;const order=menuOrderability(item);
   const sourceUrl=/^https:\/\//.test(item.verificationSource||'')?item.verificationSource:null;
   menus.push({id:item.id,restaurant_id:rid,name:item.name,description:item.description,price_krw:item.price,hotel_ids:[source.hotel_id],tags:ai.tags,topic_ids:ai.topic_ids,
    // The existing AI policy still requires complete declarations for restrictions.
    ingredients:Array.isArray(item.ingredients)?item.ingredients:null,allergens:Array.isArray(item.allergens)?item.allergens.map(a=>a==='tree nuts'?'tree_nut':a):null,vegetarian:null,
    price_status:'declared',ingredients_status:'unknown',allergens_status:'unknown',vegetarian_status:'unknown',
    source_dietary:item.dietary||null,source_allergen_status:item.allergenStatus||'unspecified',source_url:sourceUrl,source_checked_at:item.checkedAt||null,
    data_origin:sourceUrl?'source_linked_menu_reference':'illustrative_demo',options:item.groups,minimum_required_options_krw:order.minimum_required_options_krw,
    open_in_demo:true,in_stock_in_demo:order.available});
  }
 }
 return {contract_version:'0.5',catalog_version:version,mode:'demo',hotels:[{id:source.hotel_id,name:source.hotel.hotelName,active:true}],restaurants:source.restaurants.map(r=>({id:r.id,name:r.en,operating_status:'open',delivery_status:'available',status_scope:'demo_only'})),menus,delivery_routes:routes};
}
export function embeddingInputs(catalog,trends){
 const texts={};
 for(const m of catalog.menus)texts['menu:'+m.id]=`${m.name}. ${m.description}. Food features: ${m.tags.join(', ')}`;
 for(const tag of TAGS)texts['tag:'+tag]='Food preference: '+tag.replaceAll('_',' ');
 for(const t of trends){texts['topic:'+t.id]=t.name+'. '+t.tags.join(', ');for(const e of t.evidence)texts['evidence:'+e.id]=t.name+'. '+e.claim;}
 return texts;
}
