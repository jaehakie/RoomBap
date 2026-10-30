/* Restaurant connections for Star's Pick content (star-content.js).
 * Kept separate so matches can be added or corrected without touching story text.
 * relation: 'featured' = confirmed real visit/filming location, 'same-brand' = the
 * matched restaurant is the same brand shown in the content, 'try-this' = sells the
 * same dish but has no confirmed connection to the show/artist.
 * Every match below was checked against restaurants.js "kind" field by hand —
 * no restaurant is listed for a dish unless its kind explicitly confirms it. */
window.RoomBapStarContentMatches={
'kpdh-seolleongtang':[],
'kpdh-corndog':[],
'jinnys-kitchen-street-food':[
 {restaurantId:'place-street-food-1',menu:'Tteokbokki',relation:'try-this'},
 {restaurantId:'place-street-food-2',menu:'Tteokbokki',relation:'try-this'},
 {restaurantId:'place-street-food-3',menu:'Tteokbokki',relation:'try-this'},
 {restaurantId:'place-street-food-5',menu:'Tteokbokki',relation:'try-this'}
],
'woo-gimbap':[],
'hp-egg-sandwich':[],
'hwasa-gopchang':[],
'my-love-chimaek':[
 {restaurantId:'place-chicken-2',menu:'Chicken menu · demo ordering available',relation:'try-this'}
]
};
