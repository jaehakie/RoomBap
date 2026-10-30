import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {artifacts,root} from './catalog-build.mjs';
const expected=await artifacts();
assert.equal(await readFile(path.join(root,'public/catalog-data.js'),'utf8'),expected.script,'Browser catalog is stale: run npm run catalog:build');
assert.deepEqual(JSON.parse(await readFile(path.join(root,'server/data/frontend_catalog.json'),'utf8')),expected.catalog,'AI catalog is stale');
assert.deepEqual(JSON.parse(await readFile(path.join(root,'server/data/catalog-embedding-inputs.json'),'utf8')),expected.inputs,'Embedding input is stale');
const vectors=JSON.parse(await readFile(path.join(root,'server/data/vectors.json'),'utf8'));
assert.equal(vectors.catalog_version,expected.version,'Search vectors are stale: rebuild catalog embeddings');
assert.equal(vectors.dimension,384);
assert.deepEqual(Object.keys(vectors.vectors).sort(),Object.keys(expected.inputs.texts).sort(),'Retired or missing vectors');
for(const [key,text] of Object.entries(expected.inputs.texts)){
 assert.equal(vectors.text_hashes[key],createHash('sha256').update(text).digest('hex'),'Changed search text: '+key);
 const v=vectors.vectors[key];assert.ok(v.length===384&&v.every(Number.isFinite)&&v.some(x=>x!==0),'Invalid vector: '+key);
}
console.log(JSON.stringify({catalog_version:expected.version,restaurants:expected.catalog.restaurants.length,menus:expected.catalog.menus.length,vectors:Object.keys(vectors.vectors).length,browser_and_server_match:true}));
