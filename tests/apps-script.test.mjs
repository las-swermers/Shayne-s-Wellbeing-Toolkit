import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const code=fs.readFileSync(new URL('../apps-script/Code.gs',import.meta.url),'utf8');
export function backend(){
  let email='owner@las.ch',serial=0;const sheets={},props={},cache={};
  class Sheet{
    constructor(){this.rows=[];}
    getLastRow(){return this.rows.length;}
    appendRow(row){this.rows.push(structuredClone(row));}
    getDataRange(){return {getValues:()=>structuredClone(this.rows)};}
    getRange(row,col,h,w){return {getValues:()=>this.rows.slice(row-1,row-1+h).map(r=>r.slice(col-1,col-1+w)),setValues:values=>{values.forEach((r,i)=>{this.rows[row-1+i]??=[];this.rows[row-1+i].splice(col-1,w,...structuredClone(r));});},setFontWeight(){}};}
    setFrozenRows(){} deleteRow(i){this.rows.splice(i-1,1);}
  }
  const ss={getSheetByName:n=>sheets[n],insertSheet:n=>sheets[n]=new Sheet()};
  const ctx={console,Date,Set,JSON,Logger:{log(){}},Session:{getActiveUser:()=>({getEmail:()=>email}),getEffectiveUser:()=>({getEmail:()=> 'owner@las.ch'})},SpreadsheetApp:{getActive:()=>ss},PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k],setProperty:(k,v)=>props[k]=v})},CacheService:{getScriptCache:()=>({get:k=>cache[k],put:(k,v)=>cache[k]=v,remove:k=>delete cache[k]})},LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},Utilities:{getUuid:()=> 'uuid-'+(++serial),computeHmacSha256Signature:(e,k)=>crypto.createHmac('sha256',k).update(e).digest(),base64EncodeWebSafe:b=>Buffer.from(b).toString('base64url'),formatDate:(d,tz,format)=>format==='yyyy-MM-dd'?d.toISOString().slice(0,10):new Intl.DateTimeFormat('en-GB',{timeZone:tz,hour:'2-digit',minute:'2-digit',hour12:false}).format(d)},HtmlService:{createHtmlOutput:text=>({text}),createTemplateFromFile:()=>({evaluate(){return {setTitle(){return this;},addMetaTag(){return this;}};}})},ContentService:{MimeType:{JSON:'json'},createTextOutput:text=>({text,setMimeType(){return this;}})}};
  vm.createContext(ctx);vm.runInContext(code,ctx);ctx.setupSheets();
  function login(address='owner@las.ch'){email=address;const u=ctx.identity_();u.session='test-'+(++serial);cache['session:'+u.session]=u.accountId;return u;}
  return {ctx,ss,login,setEmail:x=>{email=x;},request:(u,p)=>ctx.labRequest({...p,...u}),sheets};
}
export const night={date:'2026-09-03',out:'22:30',up:'07:00',lat:20,wk:2,awakeMinutes:10,energy:3,done:1,of:2,strategyIds:['light-am'],cycle:1,phase:'intervention',entrySource:'paper',calculationVersion:'awake-minutes-v1',inBed:99,asleep:999,eff:999};
test('private record round trip, derived metrics and pseudonymous ownership',()=>{
  const b=backend(),u=b.login('student@las.ch');const p={route:'put',kind:'night',key:night.date,value:night};
  assert.equal(b.request(u,p).ok,true);const data=b.request(u,{route:'me'});
  assert.equal(data.nights[0].asleep,480);assert.equal(data.nights[0].awakeMinutes,10);assert.deepEqual(data.nights[0].strategyIds,['light-am']);
  assert.equal(JSON.stringify(b.sheets.Records.rows).includes('student@las.ch'),false);
  const other=b.login('second@las.ch');assert.equal(b.request(other,{route:'me'}).nights.length,0);
  assert.equal(b.request(u,{route:'me'}).error,'account-changed');
});
test('denies blank or outside-domain identity and unauthenticated sessions',()=>{
  const b=backend(),u=b.login();b.setEmail('');assert.equal(b.request(u,{route:'me'}).error,'approved-account-required');
  b.setEmail('student@las.ch.evil.test');assert.equal(b.request(u,{route:'me'}).error,'approved-account-required');
  b.setEmail('owner@las.ch');assert.equal(b.request({...u,session:'forged'},{route:'me'}).error,'session-expired');
});
test('stale writes conflict, retries deduplicate and deletions cannot be resurrected silently',()=>{
  const b=backend(),u=b.login(),p={route:'put',kind:'night',key:night.date,value:night};
  const a=b.request(u,p);assert.equal(b.request(u,p).revision,a.revision);
  assert.equal(b.sheets.Records.rows.length,2);
  const q={...p,value:{...night,lat:25}};assert.equal(b.request(u,q).error,'conflict');
  const gone=b.request(u,{route:'remove',kind:'night',key:night.date,revision:a.revision});assert.equal(gone.ok,true);
  assert.equal(b.request(u,{...q,revision:a.revision}).error,'conflict');assert.equal(b.request(u,{route:'me'}).nights.length,0);
  assert.equal(b.sheets.Records.rows[1][4],'');
});
test('invalid dates, impossible sleep and unexpected strategy IDs fail before writes',()=>{
  const b=backend(),u=b.login();for(const value of [{...night,date:'2026-02-30'},{...night,awakeMinutes:700},{...night,strategyIds:['made-up']},{...night,energy:0}]){
    const r=b.request(u,{route:'put',kind:'night',key:value.date,value});assert.ok(r.error);
  }assert.equal(b.sheets.Records.rows.length,1);
});
test('review boundary and all five answers round trip',()=>{
  const b=backend(),u=b.login(),value={n:1,start:'2026-09-01',picked:['light-am','weekend'],answers:{awake:'none',phone:'away',caffeine:'early',inbed:'no-space',light:'lots'},committed:'2026-09-10',timelineVersion:'rolling-v1',interventionStart:'2026-09-11'};
  assert.equal(b.request(u,{route:'put',kind:'cycle',key:'1',value}).ok,true);
  assert.deepEqual(b.request(u,{route:'me'}).cycles[0],value);
});
test('logout revokes the Lab session and setup helpers reject students',()=>{
  const b=backend(),u=b.login('student@las.ch');assert.equal(b.request(u,{route:'logout'}).ok,true);
  assert.equal(b.request(u,{route:'me'}).error,'session-expired');assert.throws(()=>b.ctx.setupSheets(),/owner-only/);
});
test('legacy time values normalize and legacy deletion uses date values correctly',()=>{
  const b=backend(),u=b.login(),s=b.ss.insertSheet('Nights');s.appendRow(['school_email','date','lights_out','out_of_bed']);s.appendRow(['owner@las.ch',new Date('2026-09-03T00:00:00Z'),'1899-12-30T21:30:00.000Z',new Date('1899-12-30T06:00:00Z')]);
  const data=b.request(u,{route:'me'});assert.equal(data.nights[0].out,'22:30');assert.equal(data.nights[0].up,'07:00');
  b.request(u,{route:'remove',kind:'night',key:'2026-09-03'});assert.equal(s.rows.length,1);
});
test('old URL and JSONP routes never return private records or mutate rows',()=>{
  const b=backend();for(const route of ['me','save','delete','class'])assert.match(b.ctx.doGet({parameter:{route,callback:'evil'}}).text,/upgraded/);
  assert.equal(b.sheets.Records.rows.length,1);assert.match(b.ctx.doPost().text,/unsupported/);
});
