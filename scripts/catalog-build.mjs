import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {validateCatalog,toBrowserCatalog,toApiCatalog,embeddingInputs,cartConflict} from '../shared/catalog.mjs';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value;
export const digest=value=>createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');
export async function artifacts(){
 const source=JSON.parse(await readFile(path.join(root,'data/catalog.json'),'utf8'));
 const registry=JSON.parse(await readFile(path.join(root,'data/menu-id-registry.json'),'utf8'));
 validateCatalog(source,registry);
 const version=digest(source),catalog=toApiCatalog(source,version),browser=toBrowserCatalog(source);
 const trends=JSON.parse(await readFile(path.join(root,'server/data/curated_trends.json'),'utf8'));
 const topics=new Set(trends.map(t=>t.id));if(catalog.menus.some(m=>m.topic_ids.some(id=>!topics.has(id))))throw Error('Unknown linked food topic');
 const payload=JSON.stringify({version,...browser}).replaceAll('<','\\u003c').replaceAll('\u2028','\\u2028').replaceAll('\u2029','\\u2029');
 const script=`/* Generated from data/catalog.json. Run npm run catalog:build; do not edit. */\n(function(){'use strict';const data=${payload};window.RoomBapRestaurants=data.restaurants;window.RoomBapMenuData=data.menus;window.RoomBapHotelStay=data.hotel;window.RoomBapVenuePhotos=data.media.venue_photos;window.RoomBapFoodPhotos=data.media.food_photos;window.RoomBapCatalogVersion=data.version;window.RoomBapCartConflict=${cartConflict.toString()};})();\n`;
 return {version,catalog,script,inputs:{catalog_version:version,texts:embeddingInputs(catalog,trends)}};
}
export async function buildCatalog(){
 const result=await artifacts();
 await writeFile(path.join(root,'public/catalog-data.js'),result.script);
 await writeFile(path.join(root,'server/data/frontend_catalog.json'),JSON.stringify(result.catalog,null,2)+'\n');
 await writeFile(path.join(root,'server/data/catalog-embedding-inputs.json'),JSON.stringify(result.inputs,null,2)+'\n');
 return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const a=await buildCatalog();console.log(JSON.stringify({version:a.version,restaurants:a.catalog.restaurants.length,menus:a.catalog.menus.length}));
}
