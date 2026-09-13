// Optional DOM journey: run with jsdom 26.1.0 on NODE_PATH.
const {JSDOM,VirtualConsole}=require('jsdom');
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../sleep-lab.html'),'utf8');
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const log=Array.from({length:8},(_,i)=>({date:'2026-09-0'+(i+1),cycle:1,phase:'baseline',out:'22:30',up:'07:00',lat:15+i,wk:0,awakeMinutes:0,inBed:510,asleep:495-i,eff:96,energy:3,done:0,of:0,entrySource:'paper',calculationVersion:'awake-minutes-v1'}));
const dom=new JSDOM(html,{url:'https://toolkit.invalid/sleep-lab.html#log',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){
 const Native=w.Date;w.Date=class extends Native{constructor(...a){super(...(a.length?a:['2026-09-12T12:00:00Z']));}};
 w.matchMedia=()=>({matches:true,addEventListener(){}});w.scrollTo=()=>{};w.confirm=()=>true;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 w.localStorage.setItem('sleeplab',JSON.stringify({v:3,cycles:[{n:1,start:'2026-09-01',timelineVersion:'rolling-v1',picked:[],answers:{},committed:''}],log,synced:{}}));
}});
const d=dom.window.document,$=id=>d.getElementById(id),saved=()=>JSON.parse(dom.window.localStorage.getItem('sleeplab'));
assert.deepEqual(errors,[]);
assert.equal($('entryView').hidden,false);assert.equal($('calendarView').hidden,true);
assert.equal(d.querySelectorAll('[data-progress-date]').length,7);
assert.match(d.querySelector('.progress-label').textContent,/Baseline 8/);
assert.equal(d.querySelector('[data-progress-date="2026-09-01"]'),null);
assert.ok(d.querySelector('[data-progress-date="2026-09-08"]'));
// Mode changes preserve the in-progress entry and never switch top-level tabs.
$('lOut').value='23:15';$('lLatency').value='45';$('openCalendar').click();
assert.equal($('entryView').hidden,true);assert.equal($('calendarView').hidden,false);
assert.equal(d.querySelectorAll('.calendar-day.recorded').length,8);
assert.equal($('t-log').getAttribute('aria-selected'),'true');
$('openCalendar').dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));
assert.equal(d.activeElement.id,'entryTab');assert.equal($('lOut').value,'23:15');assert.equal($('lLatency').value,'45');
// A dot loads that exact day's values; saving edits never creates another record.
d.querySelector('[data-progress-date="2026-09-05"]').click();
assert.equal($('entryView').hidden,false);assert.equal($('lDate').value,'2026-09-05');assert.equal($('lLatency').value,'19');
assert.equal(d.querySelector('[data-progress-date="2026-09-05"]').getAttribute('aria-current'),'true');
$('lLatency').value='25';$('saveLog').click();
assert.equal(saved().log.length,8);assert.equal(saved().log.find(e=>e.date==='2026-09-05').lat,25);
// Overflow and calendar expose dates outside the seven recent dots.
d.querySelector('[data-progress-month]').click();assert.equal($('calendarView').hidden,false);
d.querySelector('[data-night="2026-09-01"]').click();
assert.equal($('entryView').hidden,false);assert.equal($('lDate').value,'2026-09-01');assert.equal($('lLatency').value,'15');
$('entryHelp').click();assert.equal($('entryHelpDialog').open,true);$('closeEntryHelp').click();
$('printBtn2').click();assert.equal($('paperPreview').open,true);assert.ok($('paperPreview').contains($('fName')));
const ids=Array.from(d.querySelectorAll('[id]'),e=>e.id);assert.equal(new Set(ids).size,ids.length);
assert.deepEqual(errors,[]);dom.window.close();
console.log('Log workspace passed: mode switching, keyboard tabs, draft retention, saved-date markers, clickable dots, overflow dates, edit persistence and secondary controls.');
