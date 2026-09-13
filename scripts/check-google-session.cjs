// Optional DOM check; jsdom 26.1.0 on NODE_PATH. No real accounts or credentials.
const {JSDOM}=require('jsdom'),fs=require('node:fs'),assert=require('node:assert/strict');
const script=fs.readFileSync(require('node:path').join(__dirname,'../google-session.js'),'utf8');
function open(apiBase='https://backend.example'){
 const dom=new JSDOM('<div id="acct">Local diary</div><div id="googleAccount" hidden></div>',{url:'https://toolkit.example',runScripts:'outside-only'}),w=dom.window;
 let initialize,requests=[];
 w.TOOLKIT_GOOGLE={apiBase,clientId:'123-abc.apps.googleusercontent.com',domain:'las.ch'};
 w.localStorage.setItem('sleeplab','private local diary');
 w.google={accounts:{id:{initialize:c=>initialize=c,renderButton:(el)=>el.textContent='Sign in with Google',disableAutoSelect(){}}}};
 w.fetch=async(url,options)=>{requests.push({url,options});return {ok:true,json:async()=>url.endsWith('/session')?{authenticated:true,recordSync:false,accountId:'opaque',email:'student@las.ch',expiresAt:Date.now()+60000}:{connected:true,recordSync:false}};};
 w.eval(script);const loader=w.document.querySelector('script');if(loader)loader.onload();
 return {dom,w,$:id=>w.document.getElementById(id),requests,credentials:r=>initialize.callback(r),get config(){return initialize;}};
}
(async()=>{
 let t=open('');assert.equal(t.$('googleAccount').hidden,true);assert.equal(t.w.document.querySelector('script'),null);t.dom.window.close();
 t=open();assert.equal(t.config.hd,'las.ch');assert.equal(t.config.auto_select,false);
 await t.credentials({credential:'test.jwt'});
 assert.equal(t.$('googleSignOut').hidden,false);assert.match(t.$('googleStatus').textContent,/Entries still belong to this browser/);
 assert.equal(t.requests[0].options.headers.Authorization,'Bearer test.jwt');assert.equal(t.requests[0].options.credentials,'omit');assert.equal(t.requests[0].options.redirect,'error');assert.equal(t.requests[0].options.body,undefined);
 assert.equal(t.w.localStorage.length,1);assert.equal(t.w.localStorage.getItem('sleeplab'),'private local diary');
 t.$('googleCheck').click();await new Promise(resolve=>setImmediate(resolve));
 assert.match(t.$('googleStatus').textContent,/No student entries were read or uploaded/);
 // A late response must not resurrect a signed-out identity or connection status.
 let resolveRequest;t.w.fetch=()=>new Promise(resolve=>resolveRequest=resolve);
 t.$('googleCheck').click();t.$('googleSignOut').click();
 resolveRequest({ok:true,json:async()=>({connected:true,recordSync:false})});await new Promise(resolve=>setImmediate(resolve));
 assert.equal(t.$('googleSignOut').hidden,true);assert.doesNotMatch(t.$('googleStatus').textContent,/confirmed/);
 t.w.fetch=async()=>({ok:false,status:401});await t.credentials({credential:'bad.jwt'});
 assert.equal(t.$('googleSignOut').hidden,true);assert.match(t.$('googleStatus').textContent,/Sign-in could not finish/);
 assert.equal(t.w.localStorage.getItem('sleeplab'),'private local diary');t.dom.window.close();
 console.log('Google session passed: disabled configuration, verified sign-in, bearer transport, local diary isolation, read-only check, rejection and sign-out race.');
})().catch(e=>{console.error(e);process.exitCode=1;});
