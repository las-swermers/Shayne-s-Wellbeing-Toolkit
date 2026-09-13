import test from 'node:test';
import assert from 'node:assert/strict';
import {readConfig} from '../config.mjs';
import {verifyGoogle} from '../google-identity.mjs';
import {createHandler} from '../app.mjs';
const env={GOOGLE_CLIENT_ID:'123-abc.apps.googleusercontent.com',SPREADSHEET_ID:'example_sheet',ACCOUNT_ID_KEY:'a'.repeat(32),ALLOWED_DOMAIN:'las.ch',ALLOWED_ORIGINS:'https://toolkit.example'};
const config=readConfig(env);
const payload={iss:'https://accounts.google.com',aud:config.clientId,exp:Math.floor(Date.now()/1000)+3600,hd:'las.ch',sub:'student-1',email:'student@las.ch',email_verified:true};
const client=p=>({verifyIdToken:async args=>{assert.equal(args.idToken,'signed.token');assert.equal(args.audience,config.clientId);return {getPayload:()=>p};}});
test('Google identity validates claims and generates a stable pseudonymous ID from subject',async()=>{
 const a=await verifyGoogle('signed.token',config,client(payload));
 const b=await verifyGoogle('signed.token',config,client({...payload,email:'new@las.ch'}));
 assert.equal(a.accountId,b.accountId);assert.match(a.accountId,/^gis_v1_[a-f0-9]{64}$/);
 assert.notEqual(a.accountId,(await verifyGoogle('signed.token',config,client({...payload,sub:'other'}))).accountId);
});
test('wrong hosted domain, issuer, audience, expired or unverified identities are denied',async()=>{
 for(const change of [{hd:'elsewhere.ch'},{hd:undefined},{iss:'fake'},{aud:'other'},{exp:1},{email_verified:false},{sub:''},{email:undefined}]) await assert.rejects(verifyGoogle('signed.token',config,client({...payload,...change})));
 await assert.rejects(verifyGoogle('signed.token',config,{verifyIdToken:async()=>{throw new Error('bad signature');}}));
 await assert.rejects(verifyGoogle('',config,client(payload)));
});
test('configuration rejects missing values, weak account keys and wildcard/path origins',()=>{
 for(const change of [{ACCOUNT_ID_KEY:'short'},{GOOGLE_CLIENT_ID:''},{SPREADSHEET_ID:''},{ALLOWED_DOMAIN:'example.com'},{ALLOWED_ORIGINS:'*'},{ALLOWED_ORIGINS:'http://toolkit.example'},{ALLOWED_ORIGINS:'https://toolkit.example/path'}]) assert.throws(()=>readConfig({...env,...change}));
});
async function request({path='/api/session',method='POST',headers={},failAuth=false,failSheet=false}={}){
 let verified=0,probed=0;const response={headers:{},setHeader(k,v){this.headers[k]=v;},writeHead(s,h){this.status=s;Object.assign(this.headers,h);},end(body){this.body=body?JSON.parse(body):null;}};
 await createHandler({config,verify:async token=>{verified++;if(failAuth||token!=='signed.token')throw new Error('invalid');return {accountId:'test',email:'student@las.ch',expiresAt:payload.exp*1000};},probeSheet:async()=>{probed++;if(failSheet)throw new Error('private error details');}})({url:path,method,headers:{origin:config.origins[0],authorization:'Bearer signed.token',...headers}},response);
 return {...response,verified,probed};
}
test('unauthenticated health works; protected routes never probe before authentication',async()=>{
 assert.equal((await request({path:'/healthz',method:'GET',headers:{origin:undefined}})).status,200);
 for(const headers of [{authorization:''},{authorization:'Bearer bad'},{authorization:undefined}]){const r=await request({path:'/api/connection',headers});assert.equal(r.status,401);assert.equal(r.probed,0);}
});
test('CORS uses an exact allowlist and a restricted preflight',async()=>{
 for(const origin of ['https://toolkit.example.evil.test',undefined,'null']){const r=await request({headers:{origin}});assert.equal(r.status,403);assert.equal(r.verified,0);assert.equal(r.headers['Access-Control-Allow-Origin'],undefined);}
 const r=await request({method:'OPTIONS',headers:{'access-control-request-method':'POST','access-control-request-headers':'authorization'}});
 assert.equal(r.status,204);assert.equal(r.verified,0);assert.equal(r.headers['Access-Control-Allow-Origin'],config.origins[0]);
 assert.equal((await request({method:'OPTIONS',headers:{'access-control-request-method':'DELETE'}})).status,405);
});
test('read-only session and connection responses expose no workbook contents',async()=>{
 const session=await request();assert.equal(session.status,200);assert.equal(session.body.recordSync,false);assert.equal(session.probed,0);
 const r=await request({path:'/api/connection'});assert.deepEqual(r.body,{connected:true,recordSync:false});assert.equal(r.probed,1);
 const failed=await request({path:'/api/connection',failSheet:true});assert.equal(failed.status,503);assert.equal(JSON.stringify(failed.body).includes('private error'),false);
});
test('write routes, unexpected methods and request bodies are unavailable',async()=>{
 assert.equal((await request({path:'/api/records'})).status,404);
 assert.equal((await request({method:'DELETE'})).status,405);
 assert.equal((await request({headers:{'content-length':'100'}})).status,400);
});
