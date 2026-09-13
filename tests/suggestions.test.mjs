import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../sleep-lab.html',import.meta.url),'utf8');
function rules(log=[]){
 const ctx={CONFIG:{REVIEW_AFTER:5},nightsIn:()=>log,toMin:t=>t.split(':').reduce((h,m)=>h*60+Number(m)),hhmm:String};
 vm.createContext(ctx);
 vm.runInContext(html.slice(html.indexOf('var SOURCES ='),html.indexOf('var state =')),ctx);
 ctx.byId=id=>ctx.STRATS.find(t=>t.id===id);
 vm.runInContext(html.slice(html.indexOf('function signals('),html.indexOf('/* ═════════ TRACKER')),ctx);
 return ctx;
}
const typical={hours:8,latency:15,eff:90,wakings:0,wakeSwing:20,lightsOut:1350};
test('short sleep and waking alone do not infer caffeine, room, studying, or circadian causes',()=>{
 const r=rules().recommend({...typical,hours:5,wakings:3,eff:60,lightsOut:1510},{});
 for(const id of ['caffeine','cool-dark','bed-for-sleep']) assert.ok(!r.some(x=>x.id===id));
 const light=r.find(x=>x.id==='light-am');assert.equal(light.score,0);
 assert.ok(rules().recommend(typical,{caffeine:'evening'}).some(x=>x.id==='caffeine'));
 assert.ok(rules().recommend(typical,{awake:'room'}).some(x=>x.id==='cool-dark'));
});
test('practical constraints and neutral answers do not force a problem category',()=>{
 const r=rules().recommend({...typical,eff:50},{awake:'none',inbed:'no-space'});
 assert.ok(!r.some(x=>x.id==='bed-for-sleep'));
 assert.ok(!r.some(x=>x.id==='brain-dump'));
});
test('recalled nights do not drive diary suggestions and midnight wake times stay close',()=>{
 const log=Array.from({length:5},(_,i)=>({entrySource:'paper',lat:15,wk:0,asleep:480,eff:95,energy:3,up:i%2?'23:50':'00:10',out:'16:00'}));
 log.push({...log[0],entrySource:'recalled',lat:120,asleep:120});
 const r=rules(log),sig=r.signals(1);
 assert.equal(sig.nights,5);assert.equal(sig.hours,8);assert.equal(sig.latency,15);
 assert.ok(sig.wakeSwing<11);
 assert.equal(rules(log.slice(0,4)).signals(1),null);
});
