/** Private, school-restricted Apps Script host. See SETUP.md. */
var CONFIG={ALLOWED_DOMAIN:'las.ch',TIMEZONE:'Europe/Zurich',REQUIRE_ROSTER:false};
var RECORD_HEADERS=['account_id','kind','record_key','revision','payload'];
var DISPLAY_HEADERS=['lights_out','out_of_bed','minutes_awake','minutes_asleep','day_rating','phase','cycle'];
var STRATEGY_IDS=['wake-anchor','light-am','caffeine','phone-park','runway','twenty-min','bed-for-sleep','weekend','brain-dump','cool-dark'];

function doGet(e){
  if(e && e.parameter && (e.parameter.route || e.parameter.callback))
    return HtmlService.createHtmlOutput('This connection has been upgraded. Open the web app URL without query parameters.');
  try{
    var user=identity_(),template=HtmlService.createTemplateFromFile('Lab');
    user.session=Utilities.getUuid()+Utilities.getUuid();
    CacheService.getScriptCache().put('session:'+user.session,user.accountId,21600);
    template.bootJson=JSON.stringify(user).replace(/</g,'\\u003c');
    return template.evaluate().setTitle("Sleep Lab — Shayne's Toolkit").addMetaTag('viewport','width=device-width, initial-scale=1');
  }catch(err){return HtmlService.createHtmlOutput('Sleep Lab could not open. Use your las.ch account. If already signed in, ask Shayne to check the Apps Script setup and Lab file.');}
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
    var known=['approved-account-required','account-changed','session-expired','setup-required','bad-kind','bad-value','bad-date','unknown-route'];
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
function selfTest(){requireOwner_();identity_();records_();Logger.log('Owner identity, domain and Records schema passed. Test student login and live saves next.');}
