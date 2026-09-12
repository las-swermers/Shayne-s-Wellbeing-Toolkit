// Optional end-to-end DOM check; run with jsdom 26.1.0 on NODE_PATH.
const {JSDOM,VirtualConsole}=require('jsdom');
const fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../sleep-lab.html'),'utf8');
let now='2026-09-05T12:00:00Z';
const log=Array.from({length:5},(_,i)=>({cycle:1,date:'2026-09-0'+(i+1),out:'22:30',up:'07:00',lat:20,wk:1,inBed:510,asleep:478,eff:94,energy:3,done:0,of:0,phase:'baseline'}));
const initial={v:2,cycles:[{n:1,start:'2026-09-01',picked:[],answers:{},committed:''}],log,synced:{}};
const errors=[];
function open(saved){
  const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
  return new JSDOM(source,{url:'https://toolkit.invalid/sleep-lab.html#log',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){
    const NativeDate=w.Date;
    w.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:[now]));}static now(){return new NativeDate(now).getTime();}};
    w.matchMedia=()=>({matches:false,addEventListener(){}});w.scrollTo=()=>{};w.confirm=()=>true;
    w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
    w.HTMLDialogElement.prototype.close=function(){this.open=false;};
    w.localStorage.setItem('sleeplab',JSON.stringify(saved));
  }});
}
let dom=open(initial),w=dom.window,d=w.document;
const $=id=>d.getElementById(id),saved=()=>JSON.parse(w.localStorage.getItem('sleeplab'));
$('openReview').click();$('startRoutineQuiz').click();
for(let i=0;i<5;i++){d.querySelector('[data-q]').click();$('reviewNext').click();}
d.querySelector('[data-rec]').click();$('commitBtn').click();
assert.equal(saved().cycles[0].interventionStart,'2026-09-06');
assert.equal(saved().log.filter(e=>e.phase==='baseline').length,5);
assert.equal(saved().log[0].asleep,478);
// Editing an old entry requires a new estimate and retains its round and phase.
$('t-results').click();d.querySelector('[data-edit="2026-09-01"]').click();
assert.equal($('lAwake').value,'');assert.equal($('lDate').disabled,true);
$('saveLog').click();assert.equal(saved().log[0].asleep,478);
$('lAwake').value='35';$('saveLog').click();
assert.equal(saved().log[0].asleep,455);
assert.equal(saved().log[0].calculationVersion,'awake-minutes-v1');
assert.equal(saved().log[0].phase,'baseline');assert.equal(saved().log[0].cycle,1);
assert.equal($('lDate').disabled,false);
// Five subsequent morning logs reflect the selected plan and unlock results.
for(let day=6;day<=10;day++){
  const date='2026-09-'+String(day).padStart(2,'0');now=date+'T12:00:00Z';
  $('lDate').value=date;$('lDate').dispatchEvent(new w.Event('change'));
  $('lOut').value='23:00';$('lUp').value='07:00';$('lLatency').value='20';$('lAwake').value='40';$('lWakings').value='2';
  assert.equal($('checkField').style.display,'');d.querySelector('[data-chk]').click();$('saveLog').click();
}
assert.equal(saved().log.filter(e=>e.phase==='intervention').length,5);
assert.equal(saved().log.at(-1).asleep,420);
assert.equal(saved().log.at(-1).strategyIds.length,1);
$('t-results').click();assert.ok($('phaseCompare').querySelector('table'));
assert.match($('estimateNote').textContent,/4 older records/);
// New rounds cannot steal old entries, and editing uses that entry's original plan.
$('newCycle').click();assert.equal(saved().cycles[1].start,'2026-09-11');
$('t-results').click();d.querySelector('[data-edit="2026-09-06"]').click();
assert.equal($('checkField').style.display,'');assert.equal(d.querySelector('[data-chk]').getAttribute('aria-pressed'),'true');
$('lAwake').value='30';$('saveLog').click();
assert.equal(saved().log.find(e=>e.date==='2026-09-06').cycle,1);
const before=saved();dom.window.close();
dom=open(before);w=dom.window;d=w.document;
assert.deepEqual(saved().log,before.log);
$('t-results').click();assert.match($('phaseCompare').textContent,/0 baseline, 0/);
assert.deepEqual(errors,[]);
dom.window.close();
console.log('Record journey passed: migration, review boundary, edit validation, five changes nights, new round, original-plan editing and reload.');
