import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {backend,night} from '../tests/apps-script.test.mjs';
const require=createRequire(import.meta.url),{JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync('sleep-lab.html','utf8');
const b=backend(),u=b.login('student@las.ch');
const errors=[],calls=[];let offline=false,hold=false,held=[];
const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(html,{url:'https://script.google.com/lab#log',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){
  w.SLEEP_BOOT={...u};w.matchMedia=()=>({matches:true,addEventListener(){}});w.scrollTo=()=>{};w.confirm=()=>true;
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
  const foreign={cycles:[],log:[night],synced:{}};w.localStorage.setItem('sleeplab',JSON.stringify(foreign));
  w.google={script:{run:{withSuccessHandler(ok){return {withFailureHandler(fail){return {labRequest(p){calls.push(structuredClone(p));const action=()=>{if(offline)fail(new Error('offline'));else ok(b.request(u,p));};if(hold)held.push(action);else setTimeout(action,0);}};}};}}}};
}});
const tick=()=>new Promise(r=>setTimeout(r,40));
const $=id=>dom.window.document.getElementById(id),key='sleeplab-account-'+u.accountId;
const local=()=>JSON.parse(dom.window.localStorage.getItem(key));
await tick();assert.deepEqual(errors,[]);assert.equal(local().log.length,0,'no silent import of public browser diary');assert.ok($('signOutBtn'));
function save(lat=20){$('lDate').value='2026-09-03';$('lSource').value='paper';$('lOut').value='22:30';$('lUp').value='07:00';$('lLatency').value=String(lat);$('lAwake').value='10';$('saveLog').click();}
offline=true;save();await tick();assert.equal(local().log.length,1);assert.ok(Object.keys(local().pending).length);assert.match($('acctSync').textContent,/unavailable/);
offline=false;$('syncBtn').click();await tick();await tick();assert.equal(b.request(u,{route:'me'}).nights.length,1);assert.equal(Object.keys(local().pending).length,0);
// Change an entry again while its previous edit is in flight.
hold=true;dom.window.document.querySelector('[data-edit="2026-09-03"]').click();save(30);
dom.window.document.querySelector('[data-edit="2026-09-03"]').click();save(40);
hold=false;held.splice(0).forEach(fn=>fn());await tick();await tick();assert.equal(b.request(u,{route:'me'}).nights[0].lat,40);assert.equal(Object.keys(local().pending).length,0);
// Keep a deletion queued across failed transport; retry removes server data.
offline=true;dom.window.document.querySelector('[data-del="2026-09-03"]').click();await tick();assert.equal(local().log.length,0);assert.equal(local().pending['night:2026-09-03'].route,'remove');
offline=false;$('syncBtn').click();await tick();assert.equal(b.request(u,{route:'me'}).nights.length,0);
// Remote cycle state survives a fresh pull (not merely localStorage).
const c={n:2,start:'2026-09-04',picked:['light-am'],answers:{awake:'none',phone:'away',caffeine:'early',inbed:'never',light:'lots'},committed:'2026-09-10',timelineVersion:'rolling-v1',interventionStart:'2026-09-11'};
assert.equal(b.request(u,{route:'put',kind:'cycle',key:'2',value:c}).ok,true);$('syncBtn').click();await tick();assert.equal(local().cycles.at(-1).interventionStart,'2026-09-11');
$('signOutBtn').click();await tick();assert.equal(dom.window.localStorage.getItem(key),null);assert.match(dom.window.document.body.textContent,/Signed out of Sleep Lab/);assert.equal(b.request(u,{route:'me'}).error,'session-expired');
assert.ok(dom.window.localStorage.getItem('sleeplab'),'unrelated local diary is preserved');assert.equal(calls.some(p=>p.route==='save'),false);assert.deepEqual(errors,[]);dom.window.close();
console.log('Connected UI passed: isolated account cache, offline save/delete retry, in-flight edits, remote cycles, server logout and cache clearing.');
