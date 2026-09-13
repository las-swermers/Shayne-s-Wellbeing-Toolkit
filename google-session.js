/* Read-only sign-in/connection check. Student diary ownership is not active yet. */
(function(){
  'use strict';
  var config=window.TOOLKIT_GOOGLE,host=document.getElementById('googleAccount');
  if(!host || !config || !config.apiBase) return;
  var api;
  try {api=new URL(config.apiBase);if(api.protocol!=='https:' || api.origin!==config.apiBase) return;}catch(e){return;}
  var token='',identity=null,epoch=0,expiryTimer,pending=false;
  host.hidden=false;document.getElementById('acct').hidden=true;
  host.innerHTML='<div id="googleSignIn"></div><span id="googleStatus" role="status" aria-live="polite">Loading Google sign-in…</span><button id="googleCheck" class="btn ghost" type="button" hidden>Check Sheet connection</button><button id="googleSignOut" class="btn ghost" type="button" hidden>Sign out</button>';
  var byId=function(id){return document.getElementById(id);};
  function render(message){
    byId('googleSignIn').hidden=!!identity;
    byId('googleCheck').hidden=!identity;byId('googleCheck').disabled=pending;
    byId('googleSignOut').hidden=!identity;
    byId('googleStatus').textContent=message || (identity?'Signed in as '+identity.email+'. Entries still belong to this browser; account sync is not active.':'Sign in to check the connection. Your diary stays in this browser.');
  }
  function clear(message){
    epoch++;token='';identity=null;pending=false;clearTimeout(expiryTimer);
    if(window.google && google.accounts) google.accounts.id.disableAutoSelect();
    render(message);
  }
  async function request(path,credential){
    var controller=new AbortController(),timer=setTimeout(function(){controller.abort();},12000);
    try{
      var response=await fetch(config.apiBase+path,{method:'POST',headers:{Authorization:'Bearer '+credential},credentials:'omit',redirect:'error',cache:'no-store',signal:controller.signal});
      if(!response.ok){var error=new Error(response.status===401?'Sign in with an approved las.ch account.':response.status===503?'The backend could not access the Sheet. Check its service account and Viewer access.':'Could not complete the connection check.');error.status=response.status;throw error;}
      return await response.json();
    }finally{clearTimeout(timer);}
  }
  async function onCredential(result){
    if(!result || typeof result.credential!=='string')return;
    var turn=++epoch;token='';identity=null;clearTimeout(expiryTimer);pending=true;render('Checking your Google account…');
    try{
      var session=await request('/api/session',result.credential);
      if(turn!==epoch)return;
      if(session.authenticated!==true || session.recordSync!==false || !session.accountId || !session.email || !Number.isFinite(session.expiresAt) || session.expiresAt<=Date.now())throw new Error('Unexpected sign-in response.');
      token=result.credential;identity=session;pending=false;render();
      expiryTimer=setTimeout(function(){clear('Your sign-in expired. Sign in again to check the connection.');},session.expiresAt-Date.now());
    }catch(e){if(turn===epoch){pending=false;render(e.message==='Unexpected sign-in response.'?e.message:'Sign-in could not finish. Check the connection and use your las.ch account.');}}
  }
  byId('googleCheck').addEventListener('click',async function(){
    if(!token || pending)return;
    var turn=epoch;pending=true;render('Checking read-only Sheet access…');
    try{
      var result=await request('/api/connection',token);
      if(turn!==epoch)return;
      if(result.connected!==true || result.recordSync!==false)throw new Error('Unexpected connection response.');
      pending=false;render('Sheet connection confirmed. No student entries were read or uploaded. Account sync is not active.');
    }catch(e){if(turn===epoch){if(e.status===401)clear('Your sign-in expired. Please sign in again.');else{pending=false;render(e.status===503?e.message:'Could not reach the connection service. Try again.');}}}
  });
  byId('googleSignOut').addEventListener('click',function(){clear();});
  var script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.async=true;
  script.onload=function(){
    if(!window.google || !google.accounts){render('Google sign-in is unavailable. You can keep using your local diary.');return;}
    google.accounts.id.initialize({client_id:config.clientId,callback:onCredential,hd:config.domain,auto_select:false,ux_mode:'popup'});
    google.accounts.id.renderButton(byId('googleSignIn'),{type:'standard',theme:'outline',size:'medium',text:'signin_with',shape:'pill'});
    render();
  };
  script.onerror=function(){render('Google sign-in could not load. You can keep using your local diary.');};
  document.head.appendChild(script);
})();
