/** Sleep Lab backend — paste into a script bound to the staff-owned “Sleep Lab” Sheet. */
const CONFIG = {
  TIMEZONE: 'Europe/Zurich',
  STUDY_START: '2026-09-14', // staff: first baseline date (YYYY-MM-DD)
  BASELINE_DAYS: 7,
  INTERVENTION_DAYS: 7,
  // Optional counsellor-issued fallback code. A code must exist in Roster to be accepted.
  ALLOW_CODE_FALLBACK: true
};
const HEADERS = {
  Roster: ['code', 'school_email', 'house', 'cohort', 'consent', 'updated_at'],
  Plans: ['school_email', 'code', 'tools_chosen', 'wake_time', 'obstacle', 'study_start', 'updated_at'],
  Nights: ['school_email', 'code', 'date', 'bed_time', 'wake_time', 'quality', 'note', 'phase', 'updated_at'],
  Class: ['phase', 'nights', 'average_quality', 'updated_at']
};

function doGet() { return HtmlService.createHtmlOutputFromFile('Index').setTitle('Sleep Lab'); }
function setupSheets() { Object.keys(HEADERS).forEach(name => { const s = sheet_(name); if (s.getLastRow() === 0) s.appendRow(HEADERS[name]); }); return 'Sleep Lab tabs ready.'; }
function whoAmI(fallbackCode) { const user = identity_(fallbackCode); return { email: user.email, code: user.code, house: user.roster.house || '', cohort: user.roster.cohort || '', study: study_() }; }
function loadMine(fallbackCode) { const u = identity_(fallbackCode), key = u.email || u.code; return { plan: find_(sheet_('Plans'), r => r.school_email === key || r.code === key), nights: rows_(sheet_('Nights')).filter(r => r.school_email === key || r.code === key), study: study_() }; }
function savePlan(payload, fallbackCode) { const u = identity_(fallbackCode); const key = u.email || u.code; upsert_(sheet_('Plans'), r => r.school_email === key || r.code === key, { school_email: u.email || u.code, code: u.code, tools_chosen: array_(payload.tools).join(', '), wake_time: clean_(payload.wake), obstacle: clean_(payload.obstacle), study_start: CONFIG.STUDY_START, updated_at: stamp_() }); return { ok: true }; }
function saveNight(payload, fallbackCode) { const u = identity_(fallbackCode), date = clean_(payload.date); if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('A valid date is required.'); const key = u.email || u.code; const phase = phase_(date); upsert_(sheet_('Nights'), r => (r.school_email === key || r.code === key) && r.date === date, { school_email: u.email || u.code, code: u.code, date, bed_time: clean_(payload.bed), wake_time: clean_(payload.wake), quality: clean_(payload.quality), note: clean_(payload.note), phase, updated_at: stamp_() }); rebuildClass_(); return { ok: true, phase }; }
function classTotals() { rebuildClass_(); return rows_(sheet_('Class')); }

function identity_(fallbackCode) { const email = (Session.getActiveUser().getEmail() || '').trim().toLowerCase(); const code = (fallbackCode || '').trim().toUpperCase(); if (!email && (!CONFIG.ALLOW_CODE_FALLBACK || !/^[A-Z0-9]{4}$/.test(code))) throw new Error('Use your school account, or enter your 4-character counsellor-issued code.'); const roster = rows_(sheet_('Roster')).find(r => (email && r.school_email.toLowerCase() === email) || (!email && r.code.toUpperCase() === code)); if (!roster || String(roster.consent).toLowerCase() !== 'yes') throw new Error('You are not on the consented Sleep Lab roster. Please speak with counselling.'); return { email, code: roster.code || code, roster }; }
function study_() { return { start: CONFIG.STUDY_START, baselineDays: CONFIG.BASELINE_DAYS, interventionDays: CONFIG.INTERVENTION_DAYS }; }
function phase_(date) { const start = new Date(CONFIG.STUDY_START + 'T00:00:00'); const day = Math.floor((new Date(date + 'T00:00:00') - start) / 86400000); if (day >= 0 && day < CONFIG.BASELINE_DAYS) return 'baseline'; if (day >= CONFIG.BASELINE_DAYS && day < CONFIG.BASELINE_DAYS + CONFIG.INTERVENTION_DAYS) return 'intervention'; return 'outside_study'; }
function rebuildClass_() { const data = rows_(sheet_('Nights')).filter(r => r.phase === 'baseline' || r.phase === 'intervention'); const out = ['baseline', 'intervention'].map(phase => { const n = data.filter(r => r.phase === phase), scores = n.map(r => Number(String(r.quality).match(/^\d/) || 0)).filter(Boolean); return [phase, n.length, scores.length ? scores.reduce((a,b) => a+b,0)/scores.length : '', stamp_()]; }); const s = sheet_('Class'); s.clearContents(); s.appendRow(HEADERS.Class); if (out.length) s.getRange(2,1,out.length,4).setValues(out); }
function sheet_(name) { const ss = SpreadsheetApp.getActive(); return ss.getSheetByName(name) || ss.insertSheet(name); }
function rows_(s) { const v=s.getDataRange().getValues(), h=v.shift() || []; return v.filter(r=>r.some(x=>x !== '')).map(r=>Object.fromEntries(h.map((x,i)=>[x,String(r[i] == null ? '' : r[i])]))); }
function find_(s, test) { return rows_(s).find(test) || null; }
function upsert_(s, test, obj) { const headers=HEADERS[s.getName()]; if(s.getLastRow()===0)s.appendRow(headers); const existing=rows_(s), i=existing.findIndex(test), row=headers.map(h=>obj[h] == null ? '' : obj[h]); if(i<0)s.appendRow(row); else s.getRange(i+2,1,1,row.length).setValues([row]); }
function clean_(v) { return String(v == null ? '' : v).trim().slice(0,1000); } function array_(v) { return Array.isArray(v) ? v.map(clean_) : []; } function stamp_() { return Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss"); }
