/* Base demo ordering templates. Source-backed menu references for newly
 * researched venues are applied later by local-menu-references.js.
 * None of the 40 Hongdae restaurants have an independently verified item-level
 * menu (restaurants.js only carries a map "kind" description, not real menu
 * items, prices or delivery fees). So every restaurant's menu here is built
 * from a category-shaped demo template: realistic item/option structure for
 * that food type, but illustrative names/prices — never presented as a
 * confirmed real menu. Each restaurant still gets its own item ids, its own
 * price variation and its own sold-out state, generated deterministically
 * from the restaurant id so re-loading the page is stable.
 *
 * Dietary fields follow dist/dietary.js's verification model: vegan/
 * vegetarian are 'verified' | 'not-suitable' | 'unknown'; halal is
 * 'certified' | 'restaurant-declared' | 'not-suitable' | 'unknown'. Since
 * none of this demo data has been confirmed by an actual restaurant, no item
 * here is ever marked 'verified' or 'certified' — only the dish-type facts
 * that can be stated with confidence (e.g. a pork dish is halal
 * 'not-suitable') are filled in; everything else is 'unknown' on purpose,
 * so the recommendation filter in dietary.js will correctly exclude it. */
(function(){
'use strict';
const demoDietaryNote={verificationSource:'Dish-type reference only — not restaurant-confirmed',checkedAt:null};
const templates={
 Chicken:{minOrder:15000,items:[
  {key:'whole',name:'Fried Chicken (Whole)',description:'A full bird, double-fried until crisp. Good for two to three people.',basePrice:18000,
   ingredients:['chicken','wheat','soy'],allergens:['wheat','soy'],dietary:{vegan:'not-suitable',vegetarian:'not-suitable',halal:'unknown'},
   groups:[
    {key:'cut',label:'Cut',type:'single',required:true,min:1,max:1,options:[{key:'bone-in',label:'Bone-in',price:0},{key:'boneless',label:'Boneless',price:2000}]},
    {key:'flavor',label:'Flavor',type:'single',required:true,min:1,max:1,options:[{key:'original',label:'Original fried',price:0},{key:'yangnyeom',label:'Spicy yangnyeom',price:0},{key:'soy-garlic',label:'Soy garlic',price:500}]},
    {key:'side',label:'Add a side',type:'single',required:false,min:0,max:1,options:[{key:'fries',label:'French fries',price:2000}]},
    {key:'drink',label:'Add a drink',type:'single',required:false,min:0,max:1,options:[{key:'cola',label:'Cola 1.25L',price:2500}]}
   ]},
  {key:'half-half',name:'Half & Half Chicken',description:'Two flavors in one box — a classic way to try more than one sauce.',basePrice:20000,
   ingredients:['chicken','wheat','soy'],allergens:['wheat','soy'],dietary:{vegan:'not-suitable',vegetarian:'not-suitable',halal:'unknown'},
   groups:[
    {key:'flavor-a',label:'First half',type:'single',required:true,min:1,max:1,options:[{key:'original',label:'Original fried',price:0},{key:'yangnyeom',label:'Spicy yangnyeom',price:0},{key:'soy-garlic',label:'Soy garlic',price:0}]},
    {key:'flavor-b',label:'Second half',type:'single',required:true,min:1,max:1,options:[{key:'original',label:'Original fried',price:0},{key:'yangnyeom',label:'Spicy yangnyeom',price:0},{key:'soy-garlic',label:'Soy garlic',price:0}]},
    {key:'side',label:'Add a side',type:'single',required:false,min:0,max:1,options:[{key:'fries',label:'French fries',price:2000}]}
   ]},
  {key:'wings',name:'Seasoned Wings',description:'Bite-size wings tossed in sauce, good for sharing.',basePrice:15000,
   ingredients:['chicken','wheat','soy'],allergens:['wheat','soy'],dietary:{vegan:'not-suitable',vegetarian:'not-suitable',halal:'unknown'},
   groups:[
    {key:'spice',label:'Spice level',type:'single',required:true,min:1,max:1,options:[{key:'mild',label:'Mild',price:0},{key:'hot',label:'Hot',price:0}]},
    {key:'side',label:'Add a side',type:'single',required:false,min:0,max:1,options:[{key:'fries',label:'French fries',price:2000}]}
   ]}
 ]},
 Rice:{minOrder:12000,items:[
  {key:'bulgogi-bowl',name:'Bulgogi Rice Bowl',description:'Sweet-savory beef over rice, served with a fried egg on top.',basePrice:12000,
   ingredients:['beef','egg','soy','wheat','sesame'],allergens:['egg','soy','wheat','sesame'],dietary:{vegan:'not-suitable',vegetarian:'not-suitable',halal:'unknown'},
   groups:[
    {key:'size',label:'Size',type:'single',required:true,min:1,max:1,options:[{key:'regular',label:'Regular',price:0},{key:'large',label:'Large',price:2000}]},
    {key:'rice',label:'Extra rice',type:'single',required:false,min:0,max:1,options:[{key:'extra-rice',label:'Add a serving of rice',price:1000}]},
    {key:'topping',label:'Toppings',type:'multi',required:false,min:0,max:2,options:[{key:'egg',label:'Extra fried egg',price:1000},{key:'cheese',label:'Cheese',price:1500}]}
   ]},
  {key:'spicy-pork-bowl',name:'Spicy Pork Rice Bowl',description:'Gochujang-glazed pork over rice with a light kick of heat.',basePrice:11000,
   ingredients:['pork','soy','wheat','sesame'],allergens:['soy','wheat','sesame'],dietary:{vegan:'not-suitable',vegetarian:'not-suitable',halal:'not-suitable'},
   groups:[
    {key:'size',label:'Size',type:'single',required:true,min:1,max:1,options:[{key:'regular',label:'Regular',price:0},{key:'large',label:'Large',price:2000}]},
    {key:'rice',label:'Extra rice',type:'single',required:false,min:0,max:1,options:[{key:'extra-rice',label:'Add a serving of rice',price:1000}]},
    {key:'topping',label:'Toppings',type:'multi',required:false,min:0,max:2,options:[{key:'egg',label:'Extra fried egg',price:1000},{key:'cheese',label:'Cheese',price:1500}]}
   ]},
  {key:'veg-bibimbap',name:'Vegetable Bibimbap',description:'Rice with seasoned vegetables, mixed at the table.',basePrice:10000,
   ingredients:['rice','assorted vegetables','sesame'],allergens:['sesame'],dietary:{vegan:'unknown',vegetarian:'unknown',halal:'unknown'},
   groups:[
    {key:'size',label:'Size',type:'single',required:true,min:1,max:1,options:[{key:'regular',label:'Regular',price:0},{key:'large',label:'Large',price:2000}]},
    {key:'topping',label:'Toppings',type:'multi',required:false,min:0,max:2,options:[{key:'egg',label:'Extra fried egg',price:1000}]}
   ]}
 ]},
 Noodles:{minOrder:10000,items:[
  {key:'ramen',name:'Tonkotsu-style Ramen',description:'Noodles in a rich, slow-simmered broth.',basePrice:10000,
   ingredients:['pork','wheat','egg'],allergens:['wheat','egg'],dietary:{vegan:'not-suitable',vegetarian:'not-suitable',halal:'not-suitable'},
   groups:[
    {key:'noodle',label:'Noodle amount',type:'single',required:true,min:1,max:1,options:[{key:'regular',label:'Regular',price:0},{key:'extra',label:'Extra noodles',price:1500}]},
    {key:'topping',label:'Toppings',type:'multi',required:false,min:0,max:3,options:[{key:'chashu',label:'Extra chashu pork',price:2000},{key:'egg',label:'Soft-boiled egg',price:1000},{key:'corn',label:'Corn',price:500}]}
   ]},
  {key:'spicy-mixed',name:'Spicy Mixed Noodles',description:'Chewy noodles tossed in a spicy sauce, served cold.',basePrice:9000,
   ingredients:['wheat','gochujang','sesame'],allergens:['wheat','sesame'],dietary:{vegan:'unknown',vegetarian:'unknown',halal:'unknown'},
   groups:[
    {key:'noodle',label:'Noodle amount',type:'single',required:true,min:1,max:1,options:[{key:'regular',label:'Regular',price:0},{key:'extra',label:'Extra noodles',price:1500}]},
    {key:'topping',label:'Toppings',type:'multi',required:false,min:0,max:2,options:[{key:'egg',label:'Soft-boiled egg',price:1000}]}
   ]},
  {key:'cold-noodles',name:'Cold Noodles',description:'Chilled noodles in a tangy broth, a warm-weather favorite.',basePrice:9500,
   ingredients:['beef','wheat','egg'],allergens:['wheat','egg'],dietary:{vegan:'not-suitable',vegetarian:'not-suitable',halal:'unknown'},
   groups:[
    {key:'noodle',label:'Noodle amount',type:'single',required:true,min:1,max:1,options:[{key:'regular',label:'Regular',price:0},{key:'extra',label:'Extra noodles',price:1500}]}
   ]}
 ]},
 Soup:{minOrder:10000,items:[
  {key:'pork-gukbap',name:'Pork Soup & Rice',description:'Pork bone broth with rice, a hearty everyday bowl.',basePrice:10000,
   ingredients:['pork','soy'],allergens:['soy'],dietary:{vegan:'not-suitable',vegetarian:'not-suitable',halal:'not-suitable'},
   groups:[
    {key:'meat',label:'Extra meat',type:'single',required:false,min:0,max:1,options:[{key:'extra-meat',label:'Add extra meat',price:3000}]},
    {key:'rice',label:'Rice',type:'single',required:true,min:1,max:1,options:[{key:'in-soup',label:'Rice in the soup',price:0},{key:'on-side',label:'Rice on the side',price:0}]}
   ]},
  {key:'beef-bone-soup',name:'Beef Bone Soup & Rice',description:'Milky beef bone broth, mild and comforting.',basePrice:11000,
   ingredients:['beef'],allergens:[],dietary:{vegan:'not-suitable',vegetarian:'not-suitable',halal:'unknown'},
   groups:[
    {key:'meat',label:'Extra meat',type:'single',required:false,min:0,max:1,options:[{key:'extra-meat',label:'Add extra meat',price:3000}]},
    {key:'rice',label:'Rice',type:'single',required:true,min:1,max:1,options:[{key:'in-soup',label:'Rice in the soup',price:0},{key:'on-side',label:'Rice on the side',price:0}]}
   ]},
  {key:'sundae-soup',name:'Sundae (Blood Sausage) Soup',description:'A spiced broth with Korean blood sausage and vegetables.',basePrice:9500,
   ingredients:['pork','blood sausage','buckwheat'],allergens:['buckwheat'],dietary:{vegan:'not-suitable',vegetarian:'not-suitable',halal:'not-suitable'},
   groups:[
    {key:'spice',label:'Spice level',type:'single',required:true,min:1,max:1,options:[{key:'mild',label:'Mild',price:0},{key:'spicy',label:'Spicy',price:0}]}
   ]}
 ]},
 'Street food':{minOrder:10000,items:[
  {key:'tteokbokki',name:'Tteokbokki',description:'Chewy rice cakes simmered in a sweet-spicy sauce.',basePrice:9000,
   ingredients:['rice cake','wheat','fish cake'],allergens:['wheat','fish'],dietary:{vegan:'unknown',vegetarian:'unknown',halal:'unknown'},
   groups:[
    {key:'size',label:'Size',type:'single',required:true,min:1,max:1,options:[{key:'regular',label:'Regular',price:0},{key:'large',label:'Large',price:3000}]},
    {key:'sari',label:'Add-ins',type:'multi',required:false,min:0,max:3,options:[{key:'ramen',label:'Ramen noodles',price:1500},{key:'tteok',label:'Extra rice cake',price:1500},{key:'fishcake',label:'Fish cake',price:1000}]},
    {key:'cheese',label:'Add cheese',type:'single',required:false,min:0,max:1,options:[{key:'cheese',label:'Melted cheese topping',price:1500}]}
   ]},
  {key:'gimbap',name:'Gimbap (Rice Roll)',description:'Rice and vegetables rolled in seaweed, sliced into pieces.',basePrice:4000,
   ingredients:['rice','egg','vegetables','sesame'],allergens:['egg','sesame'],dietary:{vegan:'unknown',vegetarian:'unknown',halal:'unknown'},
   groups:[
    {key:'type',label:'Type',type:'single',required:true,min:1,max:1,options:[{key:'classic',label:'Classic vegetable',price:0},{key:'tuna',label:'Tuna mayo',price:1000},{key:'cheese',label:'Cheese',price:1000}]}
   ]},
  {key:'corndog',name:'Korean Corn Dog',description:'A skewered, batter-fried street snack.',basePrice:3500,
   ingredients:['sausage','wheat','sugar'],allergens:['wheat'],dietary:{vegan:'not-suitable',vegetarian:'not-suitable',halal:'unknown'},
   groups:[
    {key:'coating',label:'Coating',type:'single',required:true,min:1,max:1,options:[{key:'original',label:'Original',price:0},{key:'potato',label:'Potato-crusted',price:500},{key:'ramen',label:'Ramen-crumb crusted',price:500}]}
   ]}
 ]},
 Chinese:{minOrder:9000,items:[
  {key:'steamed',name:'Steamed Mandu',description:'Dumplings filled with pork and vegetables, steamed.',basePrice:8000,
   ingredients:['pork','wheat','soy'],allergens:['wheat','soy'],dietary:{vegan:'not-suitable',vegetarian:'not-suitable',halal:'not-suitable'},
   groups:[
    {key:'size',label:'Portion',type:'single',required:true,min:1,max:1,options:[{key:'six',label:'6 pieces',price:0},{key:'ten',label:'10 pieces',price:3000}]},
    {key:'sauce',label:'Dip sauce',type:'single',required:false,min:0,max:1,options:[{key:'soy-vinegar',label:'Soy-vinegar dip',price:0}]}
   ]},
  {key:'pan-fried',name:'Pan-fried Mandu',description:'The same filling, pan-fried for a crisp bottom.',basePrice:8500,
   ingredients:['pork','wheat','soy'],allergens:['wheat','soy'],dietary:{vegan:'not-suitable',vegetarian:'not-suitable',halal:'not-suitable'},
   groups:[
    {key:'size',label:'Portion',type:'single',required:true,min:1,max:1,options:[{key:'six',label:'6 pieces',price:0},{key:'ten',label:'10 pieces',price:3000}]}
   ]},
  {key:'mandu-soup',name:'Spicy Mandu Soup',description:'Dumplings simmered in a spiced broth.',basePrice:9500,
   ingredients:['pork','wheat','soy'],allergens:['wheat','soy'],dietary:{vegan:'not-suitable',vegetarian:'not-suitable',halal:'not-suitable'},
   groups:[
    {key:'spice',label:'Spice level',type:'single',required:true,min:1,max:1,options:[{key:'mild',label:'Mild',price:0},{key:'hot',label:'Hot',price:0}]}
   ]}
 ]},
 BBQ:{minOrder:20000,items:[
  {key:'pork-belly',name:'Grilled Pork Belly Set',description:'Thick-cut pork belly, grilled at the table-style portion.',basePrice:22000,
   ingredients:['pork'],allergens:[],dietary:{vegan:'not-suitable',vegetarian:'not-suitable',halal:'not-suitable'},
   groups:[
    {key:'portion',label:'Portion',type:'single',required:true,min:1,max:1,options:[{key:'one',label:'1 person',price:0},{key:'two',label:'2 people',price:15000}]},
    {key:'side',label:'Add sides',type:'multi',required:false,min:0,max:2,options:[{key:'lettuce',label:'Lettuce wrap set',price:2000},{key:'garlic',label:'Grilled garlic',price:1000}]}
   ]},
  {key:'pork-neck',name:'Grilled Pork Neck Set',description:'A leaner, well-marbled cut, grilled and sliced.',basePrice:20000,
   ingredients:['pork'],allergens:[],dietary:{vegan:'not-suitable',vegetarian:'not-suitable',halal:'not-suitable'},
   groups:[
    {key:'portion',label:'Portion',type:'single',required:true,min:1,max:1,options:[{key:'one',label:'1 person',price:0},{key:'two',label:'2 people',price:15000}]},
    {key:'side',label:'Add sides',type:'multi',required:false,min:0,max:2,options:[{key:'lettuce',label:'Lettuce wrap set',price:2000},{key:'garlic',label:'Grilled garlic',price:1000}]}
   ]},
  {key:'bbq-combo',name:'Korean BBQ Combo',description:'A mixed grill plate with a couple of cuts to share.',basePrice:28000,
   ingredients:['pork','beef'],allergens:[],dietary:{vegan:'not-suitable',vegetarian:'not-suitable',halal:'not-suitable'},
   groups:[
    {key:'portion',label:'Portion',type:'single',required:true,min:1,max:1,options:[{key:'two',label:'2 people',price:0},{key:'three',label:'3 people',price:12000}]}
   ]}
 ]},
 Dessert:{minOrder:8000,items:[
  {key:'bingsu',name:'Bingsu (Shaved Ice)',description:'Fine shaved ice with toppings, meant for sharing.',basePrice:12000,
   ingredients:['milk','red bean'],allergens:['milk'],dietary:{vegan:'not-suitable',vegetarian:'unknown',halal:'unknown'},
   groups:[
    {key:'flavor',label:'Flavor',type:'single',required:true,min:1,max:1,options:[{key:'redbean',label:'Red bean',price:0},{key:'mango',label:'Mango',price:2000},{key:'injeolmi',label:'Injeolmi (rice cake)',price:1500}]}
   ]},
  {key:'fruit-tart',name:'Seasonal Fruit Tart',description:'A small tart topped with seasonal fruit.',basePrice:7000,
   ingredients:['wheat','egg','butter'],allergens:['wheat','egg','milk'],dietary:{vegan:'not-suitable',vegetarian:'unknown',halal:'unknown'},
   groups:[
    {key:'flavor',label:'Flavor',type:'single',required:true,min:1,max:1,options:[{key:'mixed-berry',label:'Mixed berry',price:0},{key:'mango',label:'Mango',price:0}]}
   ]},
  {key:'soft-serve',name:'Soft Serve Ice Cream',description:'Classic soft-serve in a cup or cone.',basePrice:5000,
   ingredients:['milk'],allergens:['milk'],dietary:{vegan:'not-suitable',vegetarian:'unknown',halal:'unknown'},
   groups:[
    {key:'topping',label:'Toppings',type:'multi',required:false,min:0,max:2,options:[{key:'choco',label:'Chocolate sauce',price:500},{key:'nuts',label:'Crushed nuts',price:500},{key:'cone',label:'Waffle cone',price:1000}]}
   ]}
 ]}
};
function hash(str){let h=0;for(let i=0;i<str.length;i++)h=(h*31+str.charCodeAt(i))>>>0;return h}
function jitter(seed,range){const h=hash(seed);const span=range*2+1;return (h%span)-range}
function buildMenu(restaurant){
 const tpl=templates[restaurant.category];
 if(!tpl)return null;
 const deliveryFee=2000+(hash(restaurant.id)%2)*1000;
 const items=tpl.items.map((it,i)=>{
  const priceJitter=Math.round(jitter(restaurant.id+it.key,1500)/500)*500;
  const price=Math.max(2000,it.basePrice+priceJitter);
  const itemSoldOut=hash(restaurant.id+it.key+'soldout')%7===0;
  const groups=it.groups.map(g=>({
   ...g,
   options:g.options.map(o=>({...o,soldOut:hash(restaurant.id+it.key+g.key+o.key)%11===0}))
  }));
  return {id:restaurant.id+'-'+it.key,name:it.name,description:it.description,price,category:restaurant.category,soldOut:itemSoldOut,
   ingredients:it.ingredients||[],allergens:it.allergens||[],dietary:it.dietary||{vegan:'unknown',vegetarian:'unknown',halal:'unknown'},
   verificationSource:demoDietaryNote.verificationSource,checkedAt:demoDietaryNote.checkedAt,
   groups};
 });
 return {restaurantId:restaurant.id,demo:true,minOrder:tpl.minOrder,deliveryFee,items};
}
const data={};
(window.RoomBapRestaurants||[]).forEach(r=>{const m=buildMenu(r);if(m)data[r.id]=m});
window.RoomBapMenuData=data;
window.RoomBapHotelStay={hotelName:'Hongdae Stay',addressEn:'Hongdae, Mapo-gu, Seoul (demo QR check-in)',room:'302',pickupOptions:[{id:'room',label:'To my room'},{id:'lobby',label:'Lobby pickup'}]};
})();
