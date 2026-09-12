import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../sleep-lab.html',import.meta.url),'utf8');
function model(cycles=[],log=[]){
  const ctx={state:{cycles,log},CONFIG:{BASELINE_DAYS:7,INTERVENTION_DAYS:7,REVIEW_AFTER:5,RESULTS_AFTER:5,STUDY_START:''},
    toMin:t=>{const [h,m]=t.split(':').map(Number);return h*60+m;}};
  vm.createContext(ctx);
  vm.runInContext(html.slice(html.indexOf('function newCycle('),html.indexOf('/* ═════════ STAGE & REVIEW UI')),ctx);
  vm.runInContext(html.slice(html.indexOf('function sleepEstimate('),html.indexOf('var editingDate=')),ctx);
  return ctx;
}
test('awake minutes determine the estimate across midnight and in daytime',()=>{
  const m=model();
  assert.equal(m.sleepEstimate('22:30','07:00',20,47).asleep,443);
  assert.equal(m.sleepEstimate('08:00','16:00',30,0).asleep,450);
  assert.equal(m.sleepEstimate('23:00','07:00',20,460).asleep,0);
});
test('invalid or impossible estimates are rejected rather than silently clamped',()=>{
  const m=model();
  for(const args of [['23:00','07:00',20,NaN],['23:00','07:00',20,-1],['23:00','07:00',20,1.5],
    ['23:00','07:00',20,461],['07:00','07:00',0,0],['25:00','07:00',20,0]]) assert.throws(()=>m.sleepEstimate(...args));
});
test('rolling baseline survives missed days and changes start only at the persisted boundary',()=>{
  const m=model();m.state.cycles=[m.newCycle(1,'2026-09-01')];
  assert.equal(m.phaseFor('2026-09-18').phase,'baseline');
  Object.assign(m.currentCycle(),{committed:'2026-09-18',interventionStart:'2026-09-19'});
  assert.equal(m.phaseFor('2026-09-18').phase,'baseline');
  assert.equal(m.phaseFor('2026-09-19').phase,'intervention');
  assert.equal(m.phaseFor('2026-10-01').phase,'intervention');
  assert.equal(m.phaseFor('2026-08-31'),null);
});
test('migration preserves committed calendar rounds and stamped historical ownership',()=>{
  const c={n:1,start:'2026-09-01',committed:'2026-09-06',picked:[]};
  const old={date:'2026-09-08',cycle:1,phase:'intervention',asleep:456};
  const m=model([c],[old]);m.ensureCycles();
  assert.equal(c.timelineVersion,'fixed-calendar-v1');
  assert.equal(m.phaseFor('2026-09-07').phase,'baseline');
  m.state.cycles.push(m.newCycle(2,'2026-09-09'));m.restamp();
  assert.equal(old.cycle,1);assert.equal(old.phase,'intervention');assert.equal(old.asleep,456);
  assert.equal(m.phaseFor('2026-09-09').cycle,2);
});
test('calendar arithmetic handles daylight-saving boundaries and leap years',()=>{
  const m=model();
  assert.equal(m.daysBetween('2026-03-28','2026-03-30'),2);
  assert.equal(m.nextMorning('2028-02-28'),'2028-02-29');
  assert.equal(m.nextMorning('2026-12-31'),'2027-01-01');
});
test('mixed historical methods are disclosed, never silently recalculated',()=>{
  const m=model();
  assert.match(m.estimateDescription([{}, {calculationVersion:'awake-minutes-v1'}]),/1 older record uses/);
  assert.doesNotMatch(m.estimateDescription([{calculationVersion:'awake-minutes-v1'}]),/12-minutes/);
});
