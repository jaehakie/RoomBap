/* Shared dietary-suitability rules, kept separate from menu data and UI so
 * the same checks can later be applied to results from an external AI
 * recommendation API, not just the local demo menus.
 *
 * Principle: an "unknown" dietary status is never treated as suitable.
 * - vegan / vegetarian: 'verified' | 'not-suitable' | 'unknown'
 *   Only 'verified' counts as suitable to recommend.
 * - halal: 'certified' | 'restaurant-declared' | 'not-suitable' | 'unknown'
 *   'certified' and 'restaurant-declared' are both suitable to recommend,
 *   but only 'certified' may ever show a "Halal certified" badge —
 *   'restaurant-declared' must be shown as the restaurant's own claim,
 *   not an independent certification.
 * Allergens are informational only and are never used to assert a dish is
 * "safe" — insufficient allergen data should never read as a safety claim. */
window.RoomBapDietary=(()=>{
 function isVeganSuitable(item){return item?.dietary?.vegan==='verified'}
 function isVegetarianSuitable(item){return item?.dietary?.vegetarian==='verified'}
 function halalStatus(item){
  const h=item?.dietary?.halal;
  if(h==='certified')return{suitable:true,certified:true,label:'Halal certified'};
  if(h==='restaurant-declared')return{suitable:true,certified:false,label:'Restaurant says halal-friendly · not independently certified'};
  return{suitable:false,certified:false,label:null};
 }
 function isSuitable(item,dietKey){
  if(dietKey==='halal')return halalStatus(item).suitable;
  if(dietKey==='vegan')return isVeganSuitable(item);
  if(dietKey==='vegetarian')return isVegetarianSuitable(item);
  return false;
 }
 function hasAllergen(item,allergenKey){return (item?.allergens||[]).includes(allergenKey)}
 /* Flattens every restaurant's menu into {restaurant,item} pairs across ALL
  * categories — recommendation is item/option level, never "this whole
  * category/restaurant counts," so a verified-vegan item in, say, Rice is
  * just as eligible as one in Salad, and an unverified Salad item is not
  * included just because it's in the Salad category. */
 function collectMenuEntries(menuData,restaurants){
  const byId={};(restaurants||[]).forEach(r=>byId[r.id]=r);
  const entries=[];
  Object.keys(menuData||{}).forEach(restaurantId=>{
   const restaurant=byId[restaurantId];
   (menuData[restaurantId].items||[]).forEach(item=>entries.push({restaurant,item}));
  });
  return entries;
 }
 function filterSuitableItems(entries,dietKey){
  return entries.filter(({item})=>isSuitable(item,dietKey));
 }
 return {isVeganSuitable,isVegetarianSuitable,halalStatus,isSuitable,hasAllergen,collectMenuEntries,filterSuitableItems};
})();
