import {test} from 'node:test';
import assert from 'node:assert/strict';
import {catalog,trends,TAGS,validateProfile,validatePreferences,mergeProfile,eligible,recommend,handleApi,semanticGate,mentionedTopics,retrieve,validateGrounding} from './api.mjs';
const noModel=()=>{throw new Error('Unexpected model call');};
const api=(body,path='/api/food-finder',fn=noModel)=>handleApi(new Request('https://demo.test'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),{},fn);
const mock=data=>async()=>new Response(JSON.stringify({stop_reason:'end_turn',content:[{type:'text',text:JSON.stringify(data)}]}));
const env={ANTHROPIC_API_KEY:'test-only',CLAUDE_MODEL:'test-only'};

test('catalog has unique frontend ids, complete routes and embedding features',()=>{
 assert.equal(catalog.menus.length,144);assert.equal(catalog.restaurants.length,50);assert.equal(new Set(catalog.menus.map(m=>m.id)).size,144);
 for(const m of catalog.menus){assert.ok(catalog.restaurants.some(r=>r.id===m.restaurant_id));assert.ok(catalog.delivery_routes.some(r=>r.restaurant_id===m.restaurant_id));assert.equal(m.allergens_status,'unknown');assert.equal(m.ingredients_status,'unknown');assert.equal(m.vegetarian,null);}
});
for(const budget of [0,5000,10000,14999,15000,100000])for(const tag of TAGS){
 test(`hard conditions survive ranking: ${tag}, KRW ${budget}`,async()=>{
  const p=validateProfile({required_tags:[tag],max_price_krw:budget});const result=await recommend({profile:p,limit:10},{},noModel);
  for(const r of result.items){assert.ok(r.menu.tags.includes(tag));assert.ok(r.menu.price_krw<=budget);assert.ok(eligible(r.menu,p,'hongdae-stay'));assert.equal(r.can_order,false);assert.ok(catalog.menus.some(m=>m.id===r.menu.id&&m.price_krw===r.menu.price_krw));}
  const count=catalog.menus.filter(m=>eligible(m,p,'hongdae-stay')).length;assert.equal(result.items.length,Math.min(10,count));
 });
}
for(const prefs of [{diet:'vegan'},{diet:'halal'},{diet:'pescatarian'},{avoid:['pork']},{avoid:['beef']},{allergies:['buckwheat']},{allergies:['squid']},{allergies:['crustacean']},{other:'celery'}]){
 test('unsupported selected restriction stops before model: '+JSON.stringify(prefs),async()=>assert.equal((await api({preferences:prefs,query:'추천해줘'})).status,422));
}
for(const allergy of ['peanut','nuts','milk','egg','wheat','soy','fish','shellfish','sesame']){
 test('undeclared allergen cannot be labelled safe: '+allergy,async()=>{const r=await api({preferences:{allergies:[allergy]}});assert.equal(r.status,200);assert.deepEqual((await r.json()).items,[]);});
}
test('vegetarian does not pass unknown declarations',async()=>assert.deepEqual((await recommend({preferences:{diet:'vegetarian'}},{},noModel)).items,[]));
test('all requested positive tastes must be present, with no unrelated padding',async()=>{const r=await recommend({profile:{liked_tags:['fruity','sweet']}},{},noModel);assert.ok(r.items.length);assert.ok(r.items.every(i=>i.menu.tags.includes('fruity')&&i.menu.tags.includes('sweet')));});
test('excluded tags and saved nonspicy preference survive merge',()=>{const p=mergeProfile(validateProfile({required_tags:['noodles'],max_price_krw:14999}),validatePreferences({spice:'none'}));assert.deepEqual(p.required_tags,['mild','noodles']);assert.deepEqual(p.excluded_tags,['spicy']);assert.equal(p.max_price_krw,14999);});
test('saved preference conflict is rejected',()=>assert.throws(()=>mergeProfile(validateProfile({required_tags:['spicy']}),validatePreferences({spice:'none'}))));
test('closed hotel and no-results budget never trigger filler menus',async()=>{for(const body of [{hotel_id:'unknown'},{profile:{max_price_krw:0}},{profile:{required_tags:['chicken','chocolate']}}])assert.deepEqual((await recommend(body,{},noModel)).items,[]);});
for(const body of [{query:''},{query:'  '},{query:'food',profile:{}},{profile:{max_price_krw:'15000'}},{profile:{required_tags:['invented']}},{profile:{required_tags:['mild','spicy']}},{profile:{vegetarian:'yes'}},{limit:0},{limit:11},{preferences:{allergies:null}},{preferences:{lang:'de'}},{preferences:{spice:'fake'}},{preferences:{country:22}},{unknown:'bad'}]){
 test('invalid request fails closed: '+JSON.stringify(body),async()=>assert.equal((await api(body)).status,422));
}
test('provider error returns no fake recommendation',async()=>{const r=await handleApi(new Request('https://demo.test/api/food-finder',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:'따뜻한 국수'})}),env,async()=>new Response('{}',{status:503}));assert.equal(r.status,502);assert.equal((await r.json()).items,undefined);});
test('nonfood and unsupported parsed requests stop',async()=>{for(const raw of [{profile:validateProfile(),unsupported_constraints:['halal'],semantic_requirements:[],is_food_request:true,clarification_question:null},{profile:validateProfile(),unsupported_constraints:[],semantic_requirements:[],is_food_request:false,clarification_question:'음식 취향을 입력해 주세요.'}])await assert.rejects(recommend({query:'test '+JSON.stringify(raw)},env,mock(raw)),error=>error.status===422);});
test('model cannot invent menu ids or supporting quotes',async()=>{const m=catalog.menus[0];for(const result of [{matches:[{menu_id:'invented',support:[]}]},{matches:[{menu_id:m.id,support:[{requirement:'specific dish',field:'description',quote:'invented ingredient'}]}]}])await assert.rejects(semanticGate([m],['specific dish'],'specific dish',env,mock(result)),error=>error.status===502);});
test('specific dish mismatch returns no alternatives',async()=>assert.deepEqual(await semanticGate([catalog.menus[0]],['sushi'],'sushi',env,mock({matches:[]})),[]));
test('semantic support must cover every requirement exactly once',async()=>{const m=catalog.menus[0];await assert.rejects(semanticGate([m],['one','two'],'food',env,mock({matches:[{menu_id:m.id,support:[{requirement:'one',field:'name',quote:m.name},{requirement:'one',field:'name',quote:m.name}]}]})),error=>error.status===502);});
test('longest multilingual topic alias controls retrieval',()=>{assert.ok(mentionedTopics('크로플은 뭐야?').has('croffle'));const ids=mentionedTopics('두바이 소금빵이 뭐야?');assert.ok(ids.has('dubai-salt-bread'));assert.ok(!ids.has('salt-bread'));assert.ok(retrieve('크로플은 뭐야?').every(p=>p.trend_id==='croffle'));});
test('grounding rejects missing citations, fabricated quotes and safety assertions',()=>{
 const passages=retrieve('크로플은 뭐야?'),p=passages[0],draft={language:'ko',answerable:true,claims:[{id:'c1',text:'크로플 설명',evidence_ids:[p.document_id]}]},audit={language_correct:true,verdicts:[{claim_id:'c1',supported:true,relevant:true,prohibited_assertion:false,support:[{document_id:p.document_id,text:p.evidence.claim}]}]};
 assert.equal(validateGrounding(draft,audit,passages,'ko').length,1);
 for(const mutate of [a=>a.language_correct=false,a=>a.verdicts[0].prohibited_assertion=true,a=>a.verdicts[0].support[0].text='not in document',a=>a.verdicts[0].support=[],a=>a.verdicts.push(a.verdicts[0])]){const a=structuredClone(audit);mutate(a);assert.equal(validateGrounding(draft,a,passages,'ko'),null);}
 assert.equal(validateGrounding({...draft,language:'en'},audit,passages,'ko'),null);
});
test('cross-origin POST is rejected without using model',async()=>{const r=await handleApi(new Request('https://demo.test/api/food-finder',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://evil.test'},body:'{}'}),{},noModel);assert.equal(r.status,403);});
test('malformed JSON is rejected',async()=>assert.equal((await handleApi(new Request('https://demo.test/api/food-finder',{method:'POST',headers:{'Content-Type':'application/json'},body:'{bad'}),{},noModel)).status,422));
test('trend matches preserve earlier meal restrictions',async()=>{const t=trends.find(t=>t.id==='croffle'),r=await recommend({trend_id:t.id,profile:{required_tags:['noodles']}},{},noModel,t);assert.deepEqual(r.related_menus,[]);assert.ok(r.profile_used.required_tags.includes('noodles'));});
