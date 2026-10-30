/* Reference menu snapshots; checkout, fees and options remain a simulation.
 * Unknown recipes/halal certification remain excluded from suitability filters. */
for(const ref of window.RoomBapLocalMenuReferences){
 if(!ref.items.length)continue;
 window.RoomBapMenuData[ref.restaurantId]={restaurantId:ref.restaurantId,demo:true,minOrder:15000,deliveryFee:3000,referenceSource:ref.source,items:ref.items.map(([name,price],i)=>({
  id:ref.restaurantId+'-reference-'+i,name,price,category:ref.category,soldOut:false,
  description:'Listed menu reference. Check the restaurant for current price and availability.',
  ingredients:[],allergens:[],allergenStatus:'unknown',
  dietary:{vegan:ref.vegan?'verified':'unknown',vegetarian:ref.vegan?'verified':'unknown',halal:'unknown'},
  verificationSource:ref.source,checkedAt:'2026-10-29',groups:[]
 }))};
}
// Dubai cookie is listed at the existing Hongdae dessert venue, not at Yoajung.
window.RoomBapMenuData['place-dessert-4']={restaurantId:'place-dessert-4',demo:true,minOrder:15000,deliveryFee:3000,referenceSource:'https://www.diningcode.com/profile.php?rid=3DpURfK2s6VM',items:[{id:'place-dessert-4-dubai-cookie',name:'Dubai Chewy Cookie',description:'Listed at ₩6,800 in the source menu. Stock and hotel delivery are unconfirmed.',price:6800,category:'Dessert',soldOut:false,ingredients:[],allergens:['tree nuts'],allergenStatus:'incomplete',dietary:{vegan:'unknown',vegetarian:'unknown',halal:'unknown'},verificationSource:'https://www.diningcode.com/profile.php?rid=3DpURfK2s6VM',checkedAt:'2026-10-29',groups:[]}]};

// Unverified Yeti pricing stays explicitly illustrative, matching the existing demo flow.
window.RoomBapMenuData['place-halal-yeti']={restaurantId:'place-halal-yeti',demo:true,minOrder:15000,deliveryFee:3000,items:[{id:'place-halal-yeti-demo-tandoori',name:'Tandoori Chicken — Demo',description:'Illustrative item and price for trying the order flow. Ask the venue for its current menu.',price:15000,category:'Halal',soldOut:false,ingredients:[],allergens:[],allergenStatus:'unknown',dietary:{vegan:'unknown',vegetarian:'unknown',halal:'unknown'},verificationSource:null,checkedAt:null,groups:[]}]};
