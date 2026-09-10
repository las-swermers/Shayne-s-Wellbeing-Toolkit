import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../sleep-lab.html',import.meta.url),'utf8');
const render = html.slice(html.indexOf('function renderLog(){'),html.indexOf('function renderLogChart(){'));
function results(log, committed='2026-09-08') {
  const nodes = new Map();
  const $ = id => {
    if (!nodes.has(id)) nodes.set(id,{style:{},innerHTML:'',querySelectorAll:()=>[]});
    return nodes.get(id);
  };
  const context = {
    $, state:{log}, CONFIG:{REVIEW_AFTER:5,RESULTS_AFTER:5},
    currentCycle:()=>({n:2,committed}), nightsIn:n=>log.filter(e=>e.cycle===n),
    restamp:()=>{},stage:()=>({id:'intervention'}),renderLogChart:()=>{},
    pad:n=>String(n).padStart(2,'0')
  };
  vm.runInNewContext(render+';renderLog();',context);
  return $;
}
function nights(cycle, count, phase, hours) {
  return Array.from({length:count},(_,i)=>({
    cycle,phase,date:'2026-09-'+String(i+(phase==='baseline'?1:8)).padStart(2,'0'),
    out:'22:00',up:'07:00',lat:10,energy:3,asleep:hours*60,eff:90,done:1,of:1
  }));
}
test('results isolate current round while retaining the complete history table',()=>{
  const $=results([...nights(1,5,'baseline',2),...nights(1,5,'intervention',3),
    ...nights(2,5,'baseline',8),...nights(2,5,'intervention',9)]);
  assert.match($('phaseCompare').innerHTML,/8\.0h/);
  assert.match($('phaseCompare').innerHTML,/9\.0h/);
  assert.match($('stats').innerHTML,/Nights logged<\/span><span class="sv">10/);
  assert.equal(($('logTable').innerHTML.match(/data-del=/g)||[]).length,20);
});
test('comparison does not unlock at three nights or without a committed review',()=>{
  const partial=[...nights(2,3,'baseline',8),...nights(2,3,'intervention',9)];
  assert.doesNotMatch(results(partial)('phaseCompare').innerHTML,/<table/);
  assert.match(results(partial)('phaseCompare').innerHTML,/5 baseline nights and 5/);
  const full=[...nights(2,5,'baseline',8),...nights(2,5,'intervention',9)];
  assert.doesNotMatch(results(full,'')('phaseCompare').innerHTML,/<table/);
});
test('all inline application scripts parse',()=>{
  for(const file of ['index.html','sleep-lab.html']){
    const source=readFileSync(new URL('../'+file,import.meta.url),'utf8');
    for(const match of source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)) {
      new vm.Script(match[1],{filename:file});
    }
  }
});
