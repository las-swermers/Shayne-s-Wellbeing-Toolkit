/** Private, school-restricted Apps Script host. See SETUP.md. */
var CONFIG={ALLOWED_DOMAIN:'las.ch',TIMEZONE:'Europe/Zurich',REQUIRE_ROSTER:false};
var RECORD_HEADERS=['account_id','kind','record_key','revision','payload'];
var DISPLAY_HEADERS=['lights_out','out_of_bed','minutes_awake','minutes_asleep','day_rating','phase','cycle'];
var STRATEGY_IDS=['wake-anchor','light-am','caffeine','phone-park','runway','twenty-min','bed-for-sleep','weekend','brain-dump','cool-dark'];

function doGet(e){
  if(e && e.parameter && (e.parameter.route || e.parameter.callback))
    return HtmlService.createHtmlOutput('This connection has been upgraded. Open the web app URL without query parameters.');
  var stage='identity';
  try{
    var user=identity_();stage='lab-file';
    var template=HtmlService.createTemplateFromFile('Lab');stage='session';
    user.session=Utilities.getUuid()+Utilities.getUuid();
    CacheService.getScriptCache().put('session:'+user.session,user.accountId,21600);
    template.bootJson=JSON.stringify(user).replace(/</g,'\\u003c');
    stage='lab-render';
    return template.evaluate().setTitle("Sleep Lab — Shayne's Toolkit").addMetaTag('viewport','width=device-width, initial-scale=1');
  }catch(err){
    var messages={
      'identity':'Google could not verify an approved school account. Open this link with your las.ch account.',
      'setup-required':'Setup is incomplete. The project owner needs to run setupSheets in Apps Script.',
      'lab-file':'The Lab page could not be loaded. Check that the HTML file is named Lab.html, with a capital L and only one .html extension.',
      'session':'The Lab session could not start. Try again shortly.',
      'lab-render':'The Lab page could not be prepared. The project owner should run selfTest in Apps Script to check the HTML file.'
    };
    var code=err && err.message==='setup-required'?'setup-required':stage;
    return HtmlService.createHtmlOutput('Sleep Lab could not open. '+messages[code]+' Check: '+code+'.');
  }
}
function doPost(){return ContentService.createTextOutput('{"error":"unsupported-transport"}').setMimeType(ContentService.MimeType.JSON);}
function identity_(){
  var email=String(Session.getActiveUser().getEmail()||'').trim().toLowerCase();
  if(!email || email.split('@').length!==2 || email.split('@')[1]!==CONFIG.ALLOWED_DOMAIN)throw Error('approved-account-required');
  if(CONFIG.REQUIRE_ROSTER && !legacyRows_('Roster').some(function(r){return String(r.school_email).toLowerCase()===email && String(r.consent).toLowerCase()==='yes';}))throw Error('approved-account-required');
  var key=PropertiesService.getScriptProperties().getProperty('ACCOUNT_ID_KEY');if(!key)throw Error('setup-required');
  return {accountId:'as_v1_'+Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(email,key)).replace(/=+$/,''),email:email};
}
// Only student RPC. Every request rechecks Google identity; all helpers are private.
function labRequest(p){
  try{
    var user=identity_();if(!p || p.accountId!==user.accountId)throw Error('account-changed');
    var lock=LockService.getScriptLock();lock.waitLock(20000);
    try{
      var sessions=CacheService.getScriptCache();
      if(typeof p.session!=='string'||p.session.length>100||sessions.get('session:'+p.session)!==user.accountId)throw Error('session-expired');
      if(p.route==='logout'){sessions.remove('session:'+p.session);return {ok:true};}
      if(typeof p.route==='string' && p.route.indexOf('classes.')===0)return classRequest_(user,p);
      if(p.route==='class')return {ready:false,message:'Class codes and protected group summaries are not available in this release. Your personal log is available now.'};
      if(p.route==='me')return readMine_(user);
      if(p.route!=='put' && p.route!=='remove')throw Error('unknown-route');
      var kind=p.kind,key=String(p.key||'');if(kind!=='night' && kind!=='cycle')throw Error('bad-kind');
      if(kind==='night')date_(key);else integer_(Number(key),1,10000);
      var current=record_(user.accountId,kind,key),base=current?String(current.row[3]):'';
      var payload=p.route==='remove'?'':JSON.stringify(kind==='night'?night_(p.value,key):cycle_(p.value,key));
      // Retrying an acknowledged write after its response was lost is idempotent.
      if(current && String(current.row[4])===payload){
        if(p.route==='remove')eraseLegacy_(user.email,kind,key);
        return {ok:true,revision:base};
      }
      if(String(p.revision||'')!==base)return {error:'conflict',revision:base,value:current && current.row[4]?JSON.parse(current.row[4]):null};
      var revision=Utilities.getUuid(),row=[user.accountId,kind,key,revision,payload],sheet=records_();
      var display=kind==='night'&&payload?JSON.parse(payload):null;
      row=row.concat(display?[display.out,display.up,display.awakeMinutes,display.asleep,display.energy,display.phase,display.cycle]:['','','','','','','']);
      if(current)sheet.getRange(current.index,1,1,row.length).setValues([row]);else sheet.appendRow(row);
      if(p.route==='remove')eraseLegacy_(user.email,kind,key);
      return {ok:true,revision:revision};
    }finally{lock.releaseLock();}
  }catch(err){
    var known=['approved-account-required','account-changed','session-expired','setup-required','bad-kind','bad-value','bad-date','unknown-route','teacher-required','class-unavailable','invalid-code','try-later','membership-overlap','comparison-unavailable','period-mismatch'];
    return {error:known.indexOf(err.message)>=0?err.message:'service-unavailable'};
  }
}
function records_(){
  var s=SpreadsheetApp.getActive().getSheetByName('Records');
  if(!s || s.getLastRow()<1 || JSON.stringify(s.getRange(1,1,1,5).getValues()[0])!==JSON.stringify(RECORD_HEADERS))throw Error('setup-required');return s;
}
function record_(account,kind,key){
  var rows=records_().getDataRange().getValues();
  for(var i=1;i<rows.length;i++)if(rows[i][0]===account && rows[i][1]===kind && String(rows[i][2])===key)return {row:rows[i],index:i+1};
  return null;
}
function readMine_(user){
  var nights={},cycles={},revisions={};
  legacyRows_('Nights').filter(function(r){return String(r.school_email).toLowerCase()===user.email;}).forEach(function(r){
    var k=dateText_(r.date);nights[k]={date:k,out:timeText_(r.lights_out),up:timeText_(r.out_of_bed),lat:Number(r.mins_to_sleep)||0,wk:Number(r.wakings)||0,inBed:Number(r.mins_in_bed)||0,asleep:Number(r.mins_asleep)||0,eff:Number(r.efficiency)||0,energy:Number(r.day_rating)||3,done:Number(r.tools_done)||0,of:Number(r.tools_total)||0,cycle:Number(r.cycle)||1,phase:r.phase||'baseline',calculationVersion:'legacy-wakings-12',entrySource:'paper'};
  });
  legacyRows_('Cycles').filter(function(r){return String(r.school_email).toLowerCase()===user.email;}).forEach(function(r){
    var names=['Keep a steady sleep schedule','Make time for daylight','Skip afternoon caffeine','Give screens a bedtime','Make room to wind down','Reset when bed feels frustrating','Give studying its own space','Keep weekends consistent','Write down tomorrow','Make your room restful'];
    var picked=String(r.tools||'').split(';').map(function(t){return STRATEGY_IDS[names.indexOf(t.trim())];}).filter(Boolean);
    var n=Number(r.cycle)||1;cycles[n]={n:n,start:dateText_(r.start_date),committed:dateText_(r.committed_at),picked:picked,answers:{},timelineVersion:'fixed-calendar-v1',interventionStart:'',legacyTools:String(r.tools||'')};
  });
  records_().getDataRange().getValues().slice(1).forEach(function(r){
    if(r[0]!==user.accountId)return;var key=String(r[2]),map=r[1]==='night'?nights:cycles;revisions[r[1]+':'+key]=String(r[3]);
    if(r[4])map[key]=JSON.parse(r[4]);else delete map[key];
  });
  return {accountId:user.accountId,email:user.email,nights:Object.keys(nights).sort().map(function(k){return nights[k];}),cycles:Object.keys(cycles).sort(function(a,b){return Number(a)-Number(b);}).map(function(k){return cycles[k];}),revisions:revisions};
}
function number_(v,min,max){if(typeof v!=='number'||!isFinite(v)||v<min||v>max)throw Error('bad-value');return v;}
function integer_(v,min,max){number_(v,min,max);if(Math.floor(v)!==v)throw Error('bad-value');return v;}
function date_(v,blank){
  if(blank && v==='')return v;
  if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)||isNaN(Date.parse(v+'T00:00:00Z'))||new Date(v+'T00:00:00Z').toISOString().slice(0,10)!==v)throw Error('bad-date');return v;
}
function time_(v){if(typeof v!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(v))throw Error('bad-value');return Number(v.slice(0,2))*60+Number(v.slice(3));}
function ids_(v){if(!Array.isArray(v)||v.length>10||new Set(v).size!==v.length||v.some(function(x){return STRATEGY_IDS.indexOf(x)<0;}))throw Error('bad-value');return v.slice();}
function night_(v,key){
  if(!v||v.date!==key||date_(key)>Utilities.formatDate(new Date(),CONFIG.TIMEZONE,'yyyy-MM-dd'))throw Error('bad-date');
  var span=(time_(v.up)-time_(v.out)+1440)%1440,lat=integer_(v.lat,0,720),awake=integer_(v.awakeMinutes,0,720);
  if(span<1||lat+awake>span||v.calculationVersion!=='awake-minutes-v1')throw Error('bad-value');
  var strategies=ids_(v.strategyIds||[]),planned=integer_(v.of,0,10);
  if(strategies.length>planned||['baseline','intervention'].indexOf(v.phase)<0||['morning','paper','memory'].indexOf(v.entrySource)<0)throw Error('bad-value');
  return {date:key,out:v.out,up:v.up,lat:lat,wk:integer_(v.wk,0,50),awakeMinutes:awake,inBed:span,asleep:span-lat-awake,eff:Math.round((span-lat-awake)/span*100),energy:integer_(v.energy,1,5),done:strategies.length,of:planned,strategyIds:strategies,cycle:integer_(v.cycle,1,10000),phase:v.phase,entrySource:v.entrySource,calculationVersion:'awake-minutes-v1'};
}
function cycle_(v,key){
  if(!v||String(v.n)!==key)throw Error('bad-value');
  var answers=v.answers||{},clean={},choices={awake:['head','wired','notsleepy','room','none'],phone:['inbed','reach','away'],caffeine:['evening','afternoon','early'],inbed:['often','sometimes','never','no-space'],light:['none','some','lots']};
  Object.keys(answers).forEach(function(k){if(!choices[k]||choices[k].indexOf(answers[k])<0)throw Error('bad-value');clean[k]=answers[k];});
  if(['rolling-v1','fixed-calendar-v1'].indexOf(v.timelineVersion)<0)throw Error('bad-value');
  if(v.timelineVersion==='rolling-v1' && (v.picked||[]).length>3)throw Error('bad-value');
  var committed=v.committed||'';if(committed && !(committed==='migrated' && v.timelineVersion==='fixed-calendar-v1') && (typeof committed!=='string'||committed.length>40||isNaN(Date.parse(committed))))throw Error('bad-value');
  return {n:integer_(v.n,1,10000),start:date_(v.start||'',true),picked:ids_(v.picked||[]),answers:clean,committed:committed,timelineVersion:v.timelineVersion,interventionStart:date_(v.interventionStart||'',true)};
}
function legacyRows_(name){var s=SpreadsheetApp.getActive().getSheetByName(name);if(!s||s.getLastRow()<2)return [];var d=s.getDataRange().getValues(),h=d.shift();return d.map(function(r){var o={};h.forEach(function(k,i){o[k]=r[i];});return o;});}
function dateText_(v){return v instanceof Date?Utilities.formatDate(v,CONFIG.TIMEZONE,'yyyy-MM-dd'):String(v||'');}
function timeText_(v){
  if(v instanceof Date)return Utilities.formatDate(v,CONFIG.TIMEZONE,'HH:mm');
  var text=String(v||'');
  if(/^\d{4}-\d\d-\d\dT/.test(text)&&!isNaN(Date.parse(text)))return Utilities.formatDate(new Date(text),CONFIG.TIMEZONE,'HH:mm');
  return text;
}
function eraseLegacy_(email,kind,key){
  var s=SpreadsheetApp.getActive().getSheetByName(kind==='night'?'Nights':'Cycles');if(!s)return;var rows=s.getDataRange().getValues();
  for(var i=rows.length-1;i>=1;i--)if(String(rows[i][0]).toLowerCase()===email && (kind==='night'?dateText_(rows[i][1]):String(rows[i][1]))===key)s.deleteRow(i+1);
}
function requireOwner_(){var a=String(Session.getActiveUser().getEmail()||'').toLowerCase();if(!a||a!==String(Session.getEffectiveUser().getEmail()).toLowerCase())throw Error('owner-only');}
function setupSheets(){
  requireOwner_();var lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    var p=PropertiesService.getScriptProperties();if(!p.getProperty('ACCOUNT_ID_KEY'))p.setProperty('ACCOUNT_ID_KEY',Utilities.getUuid()+Utilities.getUuid());
    var ss=SpreadsheetApp.getActive(),s=ss.getSheetByName('Records')||ss.insertSheet('Records');
    if(s.getLastRow()===0){s.appendRow(RECORD_HEADERS.concat(DISPLAY_HEADERS));s.setFrozenRows(1);s.getRange(1,1,1,12).setFontWeight('bold');}
    records_();return 'Ready. Add Lab.html and update the existing web app deployment.';
  }finally{lock.releaseLock();}
}
// Owner-only, read-only checks. Never print emails, keys, sessions or diary contents.
function selfTest(){
  requireOwner_();
  var stage='ACCOUNT: Check that you are using your las.ch account and have run setupSheets.';
  try{
    identity_();Logger.log('PASS: School account and setup key.');
    stage='SHEET: Run setupSheets from the Apps Script project opened through the tracker Sheet.';
    records_();Logger.log('PASS: Records tab and headers.');
    stage='LAB FILE: Name the HTML file Lab (capital L, without typing .html in the name field).';
    var template=HtmlService.createTemplateFromFile('Lab');
    Logger.log('PASS: Lab.html found.');
    stage='LAB CONTENT: Replace the entire HTML file with the supplied Lab.html code using Raw on GitHub.';
    var raw=template.getRawContent();
    if(!/<!doctype html>/i.test(raw)||raw.indexOf('window.SLEEP_BOOT')<0||raw.indexOf('<?!= bootJson ?>')<0)throw Error('wrong-template');
    template.bootJson='{"accountId":"setup-check","email":"setup-check@las.ch","session":""}';
    template.evaluate().setTitle('Sleep Lab setup check').addMetaTag('viewport','width=device-width, initial-scale=1');
    Logger.log('PASS: Lab page renders. Editor checks passed. Update the existing deployment to New version and test its web app URL.');
    return 'Editor checks passed; the deployed web app still needs a live check.';
  }catch(err){
    Logger.log('CHECK FAILED — '+stage);
    throw Error(stage);
  }
}

// Class membership release. No route in this release reads or publishes diary metrics.
var CLASS_TABLES={Classes:['id','payload'],Memberships:['id','payload'],Comparisons:['id','payload']};
function setupClasses(){
  requireOwner_();var lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    var ss=SpreadsheetApp.getActive(),definitions={Teachers:['school_email','display_name','active']};
    Object.keys(CLASS_TABLES).forEach(function(k){definitions[k]=CLASS_TABLES[k];});
    Object.keys(definitions).forEach(function(name){
      var s=ss.getSheetByName(name)||ss.insertSheet(name),h=definitions[name];
      if(!s.getLastRow()){s.appendRow(h);s.setFrozenRows(1);}
      if(JSON.stringify(s.getRange(1,1,1,h.length).getValues()[0])!==JSON.stringify(h))throw Error('setup-required');
    });
    Logger.log('Class tables ready. The Sheet owner must add approved staff to Teachers. No teacher roles were granted.');
  }finally{lock.releaseLock();}
}
function classSheet_(name){
  var s=SpreadsheetApp.getActive().getSheetByName(name),h=CLASS_TABLES[name];
  if(!s||!h||!s.getLastRow()||JSON.stringify(s.getRange(1,1,1,2).getValues()[0])!==JSON.stringify(h))throw Error('setup-required');return s;
}
function classRows_(name){return classSheet_(name).getDataRange().getValues().slice(1).filter(function(r){return r[1];}).map(function(r){return JSON.parse(r[1]);});}
function classWrite_(name,item){
  var s=classSheet_(name),rows=s.getDataRange().getValues(),row=[item.id,JSON.stringify(item)];
  for(var i=1;i<rows.length;i++)if(rows[i][0]===item.id){s.getRange(i+1,1,1,2).setValues([row]);return;}
  s.appendRow(row);
}
function classDelete_(name,id){var s=classSheet_(name),r=s.getDataRange().getValues();for(var i=r.length-1;i>0;i--)if(r[i][0]===id)s.deleteRow(i+1);}
function classHash_(value){
  var key=PropertiesService.getScriptProperties().getProperty('ACCOUNT_ID_KEY');if(!key)throw Error('setup-required');
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(value,key)).replace(/=+$/,'');
}
function teacher_(u){
  var s=SpreadsheetApp.getActive().getSheetByName('Teachers');if(!s)return null;
  var rows=s.getDataRange().getValues();if(JSON.stringify(rows[0])!==JSON.stringify(['school_email','display_name','active']))throw Error('setup-required');
  for(var i=1;i<rows.length;i++)if(String(rows[i][0]).trim().toLowerCase()===u.email && String(rows[i][2]).toLowerCase()==='yes'){
    var name=String(rows[i][1]||'').trim();if(name && name.length<=60)return {name:name};
  }return null;
}
function requireTeacher_(u){var t=teacher_(u);if(!t)throw Error('teacher-required');return t;}
function classOwned_(u,id){requireTeacher_(u);var c=classRows_('Classes').filter(function(c){return c.id===id&&c.owner===u.accountId&&!c.archived;})[0];if(!c)throw Error('class-unavailable');return c;}
function classOwnerActive_(c){
  var s=SpreadsheetApp.getActive().getSheetByName('Teachers');if(!s)return false;
  return s.getDataRange().getValues().slice(1).some(function(r){var e=String(r[0]).trim().toLowerCase();return String(r[2]).toLowerCase()==='yes' && 'as_v1_'+classHash_(e)===c.owner;});
}
function classPublic_(c){return {id:c.id,name:c.name,teacher:c.teacher,start:c.start,end:c.end,open:!!c.open,archived:!!c.archived};}
function classCode_(scope){
  var code=classHash_(scope+Utilities.getUuid()+Utilities.getUuid()).replace(/[^a-z0-9]/gi,'').slice(0,12).toUpperCase();
  if(code.length!==12)throw Error('service-unavailable');return code.match(/.{4}/g).join('-');
}
function classCodeHash_(scope,code){
  code=String(code||'').toUpperCase().replace(/[\s-]/g,'');if(!/^[A-Z0-9]{12}$/.test(code))throw Error('invalid-code');return classHash_(scope+':'+code);
}
function classLimit_(u){
  var cache=CacheService.getScriptCache(),key='class-attempt:'+u.accountId,old=JSON.parse(cache.get(key)||'null'),now=Date.now();
  if(!old||old.until<now)old={n:0,until:now+600000};if(old.n>=20)throw Error('try-later');old.n++;cache.put(key,JSON.stringify(old),600);
}
function classFromCode_(u,code){
  classLimit_(u);var h=classCodeHash_('join',code);
  var c=classRows_('Classes').filter(function(c){return !c.archived&&c.open&&c.codeHash===h&&c.expires>Date.now();})[0];
  if(!c||!classOwnerActive_(c))throw Error('invalid-code');return c;
}
function comparisonFromCode_(u,code){
  classLimit_(u);var h=classCodeHash_('compare',code);
  var c=classRows_('Comparisons').filter(function(c){return c.status==='invited'&&c.codeHash===h&&c.expires>Date.now();})[0];
  var source=c&&classRows_('Classes').filter(function(x){return x.id===c.source&&!x.archived;})[0];
  if(!source||!classOwnerActive_(source))throw Error('invalid-code');return {comparison:c,source:source};
}
function classRequest_(u,p){
  var route=p.route.slice(8),t=teacher_(u),classes=classRows_('Classes');
  if(route==='state'){
    var owned=t?classes.filter(function(c){return c.owner===u.accountId&&!c.archived;}):[];
    var mine=classRows_('Memberships').filter(function(m){return m.account===u.accountId;}).map(function(m){return classes.filter(function(c){return c.id===m.classId&&!c.archived;})[0];}).filter(Boolean);
    var ids=owned.map(function(c){return c.id;}),comparisons=classRows_('Comparisons').filter(function(x){return ids.indexOf(x.source)>=0||ids.indexOf(x.target)>=0;}).map(function(x){
      var a=classes.filter(function(c){return c.id===x.source;})[0],b=classes.filter(function(c){return c.id===x.target;})[0];
      return {id:x.id,source:a?classPublic_(a):null,target:b?classPublic_(b):null,status:x.status};
    });
    return {ok:true,teacher:!!t,classes:owned.map(classPublic_),memberships:mine.map(classPublic_),comparisons:comparisons,summariesEnabled:false};
  }
  if(route==='preview')return {ok:true,classInfo:classPublic_(classFromCode_(u,p.code))};
  if(route==='join'){
    var c=classFromCode_(u,p.code);if(c.id!==p.classId||p.confirm!==true)throw Error('bad-value');
    var memberships=classRows_('Memberships').filter(function(m){return m.account===u.accountId;});
    if(memberships.some(function(m){return m.classId===c.id;}))return {ok:true};
    if(memberships.some(function(m){var other=classes.filter(function(x){return x.id===m.classId&&!x.archived;})[0];return other && other.start<=c.end&&c.start<=other.end;}))throw Error('membership-overlap');
    classWrite_('Memberships',{id:classHash_('member:'+u.accountId+':'+c.id),account:u.accountId,classId:c.id,joined:Date.now()});return {ok:true};
  }
  if(route==='leave'){classDelete_('Memberships',classHash_('member:'+u.accountId+':'+String(p.classId)));return {ok:true};}
  requireTeacher_(u);
  if(route==='create'){
    var name=typeof p.name==='string'?p.name.trim():'';if(!name||name.length>60||/[\x00-\x1f]/.test(name))throw Error('bad-value');
    var start=date_(p.start),end=date_(p.end);if(start>end||Date.parse(end)-Date.parse(start)>366*86400000)throw Error('bad-date');
    if(typeof p.requestId!=='string'||!/^[A-Za-z0-9-]{8,80}$/.test(p.requestId))throw Error('bad-value');
    var id=classHash_('class:'+u.accountId+':'+p.requestId),existing=classes.filter(function(c){return c.id===id;})[0];
    if(existing)return {ok:true,classInfo:classPublic_(existing),code:null};
    if(classes.filter(function(c){return c.owner===u.accountId&&!c.archived;}).length>=50)throw Error('try-later');
    var code=classCode_('join');if(classes.some(function(c){return c.codeHash===classCodeHash_('join',code);}))throw Error('try-later');
    var created={id:id,owner:u.accountId,teacher:t.name,name:name,start:start,end:end,open:true,archived:false,codeHash:classCodeHash_('join',code),expires:Date.now()+7*86400000};
    classWrite_('Classes',created);return {ok:true,classInfo:classPublic_(created),code:code};
  }
  if(['rotate','close','archive'].indexOf(route)>=0){
    var c=classOwned_(u,p.classId),code=null;
    if(route==='rotate'){
      code=classCode_('join');var hash=classCodeHash_('join',code);if(classes.some(function(x){return x.codeHash===hash;}))throw Error('try-later');
      c.codeHash=hash;c.expires=Date.now()+7*86400000;c.open=true;
    }else {c.open=false;c.codeHash='';c.expires=0;}
    if(route==='archive'){
      c.archived=true;
      classRows_('Memberships').filter(function(m){return m.classId===c.id;}).forEach(function(m){classDelete_('Memberships',m.id);});
      classRows_('Comparisons').filter(function(x){return x.source===c.id||x.target===c.id;}).forEach(function(x){x.status='revoked';x.codeHash='';classWrite_('Comparisons',x);});
    }
    classWrite_('Classes',c);return {ok:true,code:code};
  }
  if(route==='invite'){
    var c=classOwned_(u,p.classId),rows=classRows_('Comparisons');
    if(rows.some(function(x){return x.status==='accepted'&&(x.source===c.id||x.target===c.id);}))throw Error('comparison-unavailable');
    rows.filter(function(x){return x.source===c.id&&x.status==='invited';}).forEach(function(x){x.status='revoked';x.codeHash='';classWrite_('Comparisons',x);});
    var code=classCode_('compare'),h=classCodeHash_('compare',code);if(rows.some(function(x){return x.codeHash===h;}))throw Error('try-later');
    classWrite_('Comparisons',{id:Utilities.getUuid(),source:c.id,target:null,status:'invited',codeHash:h,expires:Date.now()+7*86400000});
    return {ok:true,code:code};
  }
  if(route==='previewComparison'){var x=comparisonFromCode_(u,p.code);return {ok:true,source:classPublic_(x.source)};}
  if(route==='accept'){
    var x=comparisonFromCode_(u,p.code),target=classOwned_(u,p.classId),source=x.source;
    if(p.confirm!==true||p.sourceId!==source.id)throw Error('bad-value');
    if(source.owner===u.accountId||source.id===target.id)throw Error('comparison-unavailable');
    if(source.start!==target.start||source.end!==target.end)throw Error('period-mismatch');
    var rows=classRows_('Comparisons');if(rows.some(function(r){return r.status==='accepted'&&[r.source,r.target].some(function(id){return id===source.id||id===target.id;});}))throw Error('comparison-unavailable');
    rows.filter(function(r){return r.id!==x.comparison.id&&r.status==='invited'&&[source.id,target.id].indexOf(r.source)>=0;}).forEach(function(r){r.status='revoked';r.codeHash='';classWrite_('Comparisons',r);});
    x.comparison.target=target.id;x.comparison.status='accepted';x.comparison.codeHash='';classWrite_('Comparisons',x.comparison);return {ok:true};
  }
  if(route==='revoke'){
    var x=classRows_('Comparisons').filter(function(x){return x.id===p.comparisonId;})[0];if(!x)throw Error('comparison-unavailable');
    if(!classes.some(function(c){return c.owner===u.accountId&&(c.id===x.source||c.id===x.target);}))throw Error('comparison-unavailable');
    x.status='revoked';x.codeHash='';classWrite_('Comparisons',x);return {ok:true};
  }
  throw Error('unknown-route');
}
