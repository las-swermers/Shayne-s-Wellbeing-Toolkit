// Optional DOM journey: NODE_PATH pointing to jsdom 26.1.0.
const {JSDOM,VirtualConsole}=require('jsdom');
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../sleep-lab.html'),'utf8');
const errors=[];
let now='2026-09-14T12:00:00Z';
function open(saved){
 const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 return new JSDOM(html,{url:'https://toolkit.invalid/sleep-lab.html#log',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){
  const Native=w.Date;w.Date=class extends Native{constructor(...a){super(...(a.length?a:[now]));}static now(){return new Native(now).getTime();}};
  w.matchMedia=()=>({matches:true,addEventListener(){}});w.scrollTo=()=>{};w.confirm=()=>true;
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
  if(saved) w.localStorage.setItem('sleeplab',JSON.stringify(saved));
 }});
}
let dom=open(),w=dom.window,d=w.document;
const $=id=>d.getElementById(id),saved=()=>JSON.parse(w.localStorage.getItem('sleeplab'));
function select(date){$('openCalendar').click();const button=d.querySelector('[data-night="'+date+'"]');assert.ok(button);assert.equal(button.disabled,false);button.click();}
function fill(date,source){select(date);$('lSource').value=source;$('lLatency').value='15';$('saveLog').click();}
// Old memories cannot quietly become a near-waking diary entry.
fill('2026-09-10','morning');assert.equal(saved(),null);
fill('2026-09-10','paper');
// The first paper date entered need not be the earliest one.
fill('2026-09-01','paper');fill('2026-09-06','paper');fill('2026-09-03','paper');
assert.equal(saved().cycles[0].start,'2026-09-01');assert.equal($('reviewDialog').open,false);
fill('2026-09-14','paper');
assert.equal(saved().log.length,5);assert.equal($('reviewDialog').open,true);
assert.match($('reviewBox').textContent,/5 entries across 14 calendar days/);
assert.equal(d.querySelectorAll('.suggestion-grid>.suggestion-card').length,d.querySelectorAll('[data-rec]').length);
$('closeReview').click();
// Editing a date loads actual stored values and keeps the five-entry count.
select('2026-09-06');assert.equal($('lLatency').value,'15');assert.equal($('lSource').value,'paper');
$('lLatency').value='30';$('saveLog').click();
assert.equal(saved().log.length,5);assert.equal($('reviewDialog').open,false);
const before=saved();dom.window.close();dom=open(before);w=dom.window;d=w.document;
assert.equal($('reviewDialog').open,false);$('openReview').click();
$('startRoutineQuiz').click();
for(let i=0;i<5;i++){d.querySelector('[data-q]').click();$('reviewNext').click();}
d.querySelector('[data-rec]').click();$('commitBtn').click();
assert.equal(saved().cycles[0].interventionStart,'2026-09-15');assert.equal($('reviewDialog').open,false);
assert.equal(saved().cycles[0].reviewSnapshot.dates.length,5);
const snapshot=JSON.stringify(saved().cycles[0].reviewSnapshot);
// Importing additional baseline paper notes after committing does not move the boundary or snapshot.
fill('2026-09-04','paper');
assert.equal(saved().log.find(e=>e.date==='2026-09-04').phase,'baseline');
assert.equal(saved().cycles[0].interventionStart,'2026-09-15');
assert.equal(JSON.stringify(saved().cycles[0].reviewSnapshot),snapshot);
$('openCalendar').click();assert.equal(d.querySelector('[data-night="2026-09-15"]').disabled,true);$('closeCalendar').click();
now='2026-09-20T12:00:00Z';fill('2026-09-16','recalled');
assert.equal(saved().log.find(e=>e.date==='2026-09-16').phase,'intervention');
$('t-results').click();assert.match($('estimateNote').textContent,/1 remembered later/);
const persisted=saved();dom.window.close();dom=open(persisted);w=dom.window;d=w.document;
assert.deepEqual(saved().log,persisted.log);assert.deepEqual(errors,[]);
dom.window.close();
console.log('Flexible diary passed: 5 sparse nights, calendar edit, source validation, one-time review, reload/resume, commit snapshot, late baseline import, future-date blocking and recalled entry persistence.');
