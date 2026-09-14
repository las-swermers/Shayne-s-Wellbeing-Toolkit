// Optional integration check: requires jsdom 26.1.0 on NODE_PATH.
const {JSDOM,VirtualConsole}=require('jsdom');
const fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../sleep-lab.html'),'utf8');
const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(source,{url:'https://toolkit.invalid/sleep-lab.html#log',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){
 w.matchMedia=()=>({matches:false,addEventListener(){}});w.scrollTo=()=>{};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 const log=Array.from({length:5},(_,i)=>({cycle:1,date:'2026-09-0'+(i+1),out:'22:30',up:'07:00',lat:20,wk:0,inBed:510,asleep:490,eff:96,energy:3,done:0,of:0,phase:'baseline'}));
 w.localStorage.setItem('sleeplab',JSON.stringify({v:2,cycles:[{n:1,start:'2026-09-01',picked:[],answers:{},committed:''}],log,synced:{}}));
}});
const d=dom.window.document,$=id=>d.getElementById(id);
assert.deepEqual(errors,[]);
assert.equal(d.querySelector('.panel.active').id,'p-log');
$('openReview').click();assert.equal($('reviewDialog').open,true);
$('startRoutineQuiz').click();
for(let i=0;i<5;i++){
 assert.equal(d.querySelectorAll('.rq').length,1);
 assert.equal($('reviewNext').disabled,true);
 d.querySelector('[data-q]').click();
 assert.equal($('reviewNext').disabled,false);
 $('reviewNext').click();
}
assert.ok(d.querySelectorAll('[data-rec]').length>0);
assert.ok(d.querySelectorAll('.rec-source').length>0);
$('reviewBack').click();assert.equal(d.querySelectorAll('.rq').length,1);
$('reviewNext').click();d.querySelector('[data-rec]').click();$('commitBtn').click();
assert.equal($('reviewDialog').open,false);
$('printBtn2').click();assert.equal($('paperPreview').open,true);assert.equal($('downloadTracker').hidden,false);$('closePaper').click();
$('t-results').click();$('printResults').click();assert.equal($('paperPreview').open,true);assert.equal($('reportPreview').hidden,false);assert.ok($('reportPreview').textContent.includes('recorded nights'));$('closePaper').click();
$('t-class').click();assert.equal($('classWorkspace').hidden,true);assert.equal($('classConnect').hidden,false);assert.ok($('classNote').textContent.includes('school account'));
$('t-resources').click();assert.equal(d.querySelector('.panel.active').id,'p-resources');assert.equal(d.querySelectorAll('.resource-card').length,10);
assert.deepEqual(errors,[]);
console.log('DOM integration passed: full init, five review steps, back/edit, choose/commit, tracker/report previews, resource navigation, school empty state.');
dom.window.close();
