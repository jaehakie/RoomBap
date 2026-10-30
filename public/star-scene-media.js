/* Scene and dish photographs stay separate: scene thumbnails lead to food and
 * restaurant details. Image provenance is recorded alongside the local assets. */
const starSceneMedia={
 'kpdh-seolleongtang':{
  sceneImage:'assets/star-scenes/kpdh-seolleongtang.png',sceneAlt:'Rumi, Mira and Zoey sharing seolleongtang in KPop Demon Hunters',scenePosition:'50% 50%',sceneCredit:'Netflix / Sony Pictures Animation · via DBRITZ',sceneSource:'https://dbritz.kr/GeneralNews/?bmode=view&idx=166312712',
  foodImage:'assets/star-foods/soup.jpg',foodAlt:'Hanchon seolleongtang with beef, scallions and rice',foodCredit:'Hanchon Seolleongtang · Shuttle Delivery',foodSource:'https://www.shuttledelivery.co.kr/en/restaurant/menu/2967',
  story:'Mira and Zoey take Rumi out for seolleongtang — a warm, comforting meal shared between friends.',whatToExpect:'A milky ox-bone broth with sliced beef, usually served with rice. Add scallions, salt and pepper to your taste.',tags:['Ox-bone broth','Rice on the side']
 },
 'kpdh-corndog':{
  sceneImage:'assets/star-scenes/kpdh-corndog.png',sceneAlt:'Jinu and the Saja Boys serving Korean corn dogs during Soda Pop',scenePosition:'60% 45%',sceneCredit:'Netflix / Sony Pictures Animation · Netflix Tudum',sceneSource:'https://www.netflix.com/tudum/articles/kpop-demon-hunters-food-guide',
  foodImage:'assets/star-foods/hotdog.jpg',foodAlt:'Myungrang Korean corn dogs with crispy batter and sausage',foodCredit:'Myungrang Hot Dog · Shuttle Delivery',foodSource:'https://www.shuttledelivery.co.kr/en/restaurant/menu/2644',
  story:'The Saja Boys serve up Korean corn dogs as they charm the crowd during “Soda Pop.”',whatToExpect:'Crisp batter on a stick, with sausage or cheese inside. Potato coatings and sauces vary by menu.',tags:['Crispy coating','Easy street-food snack']
 },
 'jinnys-kitchen-street-food':{
  sceneImage:'assets/star-scenes/jinnys-street-food.jpg',sceneAlt:'V and Park Seo-joon cooking in the Jinny’s Kitchen restaurant',scenePosition:'50% 40%',sceneCredit:'tvN · via iMBC Entertainment',sceneSource:'https://enews.imbc.com/News/RetrieveNewsInfo/380585',
  foodImage:'assets/star-foods/tteokbokki.jpg',foodAlt:'Stella tteokbokki with rice cakes and fish cakes in red sauce',foodCredit:'Stella Tteokbokki · Shuttle Delivery',foodSource:'https://www.shuttledelivery.co.kr/en/restaurant/menu/2955',
  food:'A Korean Street-Food Spread',story:'V, Park Seo-joon and the cast run a restaurant in Mexico, introducing diners to Korean street-food favorites.',whatToExpect:'Start with chewy tteokbokki, then add gimbap or a corn dog. A colorful spread made for sharing.',tags:['Chewy rice cakes','Mix & match']
 },
 'woo-gimbap':{
  sceneImage:'assets/star-scenes/woo-gimbap.jpg',sceneAlt:'Woo Young-woo eating gimbap with chopsticks in Extraordinary Attorney Woo',scenePosition:'50% 45%',sceneCredit:'ENA · via OhmyNews',sceneSource:'https://www.ohmynews.com/NWS_Web/View/img_pg.aspx?CNTN_CD=IE003028614',
  foodImage:'assets/star-foods/gimbap.jpg',foodAlt:'Samchungdang gimbap with egg and vegetable fillings',foodCredit:'Samchungdang · Shuttle Delivery',foodSource:'https://www.shuttledelivery.co.kr/en/restaurant/menu/2713',
  story:'Gimbap is Woo Young-woo’s familiar favorite, returning throughout the series as part of her everyday routine.',whatToExpect:'Rice and fillings rolled in seaweed, then sliced into bites. Egg, vegetables, meat or fish depend on the roll.',tags:['Bite-size rolls','Many filling options']
 },
 'hp-egg-sandwich':{
  sceneImage:'assets/star-scenes/hp-egg-sandwich.jpg',sceneAlt:'Jang Gyeo-ul eating an EGGDROP sandwich in Hospital Playlist',scenePosition:'50% 42%',sceneCredit:'tvN / Yooborn Company · via iMBC Entertainment',sceneSource:'https://enews.imbc.com/News/RetrieveNewsInfo/282058',
  foodImage:'assets/star-foods/egg.jpg',foodAlt:'EGGDROP Mr. Egg sandwich set with hash brown and an iced drink',foodCredit:'EGGDROP · Shuttle Delivery',foodSource:'https://www.shuttledelivery.co.kr/en/restaurant/menu/2897/egg-drop',
  story:'EGGDROP sandwiches make an appearance in Hospital Playlist, including Jang Gyeo-ul’s memorable sandwich break.',whatToExpect:'Soft egg tucked into thick toasted bread. The photographed Mr. Egg set is a menu example, not a confirmed scene-specific order.',tags:['Toasted bread','Egg-filled bite']
 },
 'hwasa-gopchang':{
  sceneImage:'assets/star-scenes/hwasa-gopchang.jpg',sceneAlt:'Hwasa eating grilled gopchang on MBC’s I Live Alone',scenePosition:'50% 40%',sceneCredit:'MBC · via Insight',sceneSource:'https://www.insight.co.kr/news/160040',
  foodImage:'assets/star-foods/gopchang.jpg',foodAlt:'Jinhwa beef gopchang menu photograph with vegetables and dipping sauces',foodCredit:'Jinhwa Gopchang · Shuttle Delivery',foodSource:'https://www.shuttledelivery.co.kr/en/restaurant/menu/3283/jinhwa-gopchang',
  story:'Hwasa’s solo gopchang meal on I Live Alone became a widely shared food moment, drawing attention to grilled beef intestines.',whatToExpect:'Rich, savory beef small intestine with a chewy bite. For a hotel meal, check that your chosen option comes fully cooked.',tags:['Beef small intestine','Rich & chewy']
 }
};
window.RoomBapStarContent=(window.RoomBapStarContent||[]).map(item=>({...item,...starSceneMedia[item.id]}));
window.RoomBapStarContent.push({
 id:'my-love-chimaek',category:'K-drama',work:'My Love from the Star',food:'A Chimaek Night',cardDescription:'The chicken-and-beer scene that started a craving.',
 sceneImage:'assets/star-scenes/my-love-from-the-star.jpg',sceneAlt:'Cheon Song-yi eating fried chicken in My Love from the Star',scenePosition:'50% 0%',sceneCredit:'SBS · via Korea.net',sceneSource:'https://www.korea.net/NewsFocus/Culture/view?articleId=117903',
 foodImage:'assets/star-foods/chicken.jpg',foodAlt:'BBQ fried chicken delivery menu photograph',foodCredit:'BBQ Chicken Hongdae Station · Shuttle Delivery',foodSource:'https://www.shuttledelivery.co.kr/en/restaurant/menu/1544',
 story:'Cheon Song-yi’s chicken-and-beer scenes helped introduce chimaek to viewers far beyond Korea.',whatToExpect:'Crispy Korean fried chicken with a cold drink. These restaurants sell the same type of dish; they are not confirmed filming locations.',tags:['Fried chicken','Made for sharing'],
 sources:[{label:'Korea.net · Chimaek and the drama',url:'https://www.korea.net/NewsFocus/Culture/view?articleId=117903'}]
});

/* External delivery-menu examples, kept outside the local restaurant catalog.
 * No hotel coverage or RoomBap partnership is asserted by these references. */
window.RoomBapStarDeliveryReferences={
 'kpdh-seolleongtang':[{name:'Hanchon Seolleongtang',menu:'Seolleongtang with rice',relation:'try-this',url:'https://www.shuttledelivery.co.kr/en/restaurant/menu/2967'}],
 'kpdh-corndog':[{name:'Myungrang Hot Dog',menu:'Korean corn dogs',relation:'try-this',url:'https://www.shuttledelivery.co.kr/en/restaurant/menu/2644'}],
 'jinnys-kitchen-street-food':[{name:'Stella Tteokbokki',menu:'Tteokbokki',relation:'try-this',url:'https://www.shuttledelivery.co.kr/en/restaurant/menu/2955'}],
 'woo-gimbap':[{name:'Samchungdang · Gangnam POSCO Center',menu:'Gimbap',relation:'try-this',url:'https://www.shuttledelivery.co.kr/en/restaurant/menu/2713'}],
 'hp-egg-sandwich':[{name:'EGGDROP',menu:'Egg sandwiches',relation:'same-brand',url:'https://www.shuttledelivery.co.kr/en/restaurant/menu/2897/egg-drop'}],
 'hwasa-gopchang':[{name:'Jinhwa Gopchang',menu:'Grilled beef gopchang',relation:'try-this',url:'https://www.shuttledelivery.co.kr/en/restaurant/menu/3283/jinhwa-gopchang'}],
 'my-love-chimaek':[{name:'BBQ Chicken · Hongdae Station',menu:'Fried chicken',relation:'try-this',url:'https://www.shuttledelivery.co.kr/en/restaurant/menu/1544'}]
};
