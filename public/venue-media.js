/* Shared restaurant imagery: food first; original venue photographs remain archived. */
window.RoomBapMedia=(()=>{
 const items={...window.RoomBapVenuePhotos,...window.RoomBapFoodPhotos};
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const label=id=>window.RoomBapFoodPhotos?.[id]?'Food photo':'Venue photo';
 document.addEventListener('error',e=>{if(e.target.matches?.('img[data-venue-photo]')){e.target.hidden=true;e.target.closest('.venue-photo')?.classList.add('photo-unavailable')}},true);
 return {
  items,label,
  photo(p,style=''){
   const media=items[p.id],food=window.RoomBapFoodPhotos?.[p.id];
   const alt=food?`${p.en||p.name} — ${food.dish}`:`${p.en||p.name} — venue photo`;
   return `<span class="venue-photo ${esc(style)}"><span class="venue-photo-fallback" aria-hidden="true">Photo unavailable</span>${media?`<img data-venue-photo src="${esc(media.src)}" alt="${esc(alt)}" ${food?.position?`style="object-position:${esc(food.position)}"`:''} loading="lazy" decoding="async" width="800" height="600">`:''}</span>`;
  },
  credit(id){
   const p=items[id];
   return p?`<p class="source-caption venue-photo-credit">${esc(label(id))}${p.dish?' · '+esc(p.dish):''} · <a href="${esc(p.sourceUrl)}" target="_blank" rel="noopener noreferrer">${window.RoomBapFoodPhotos?.[id]?'Photo source':'Google Maps source'} ↗</a><br>Photos © their respective photographers.</p>`:'';
  }
 };
})();
