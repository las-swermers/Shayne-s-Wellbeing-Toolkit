/**
 * The Sleep Lab — backend for the counselling-owned Google Sheet.
 *
 * Paste this into a script BOUND to that Sheet (Extensions → Apps Script), then
 * deploy it twice. Setup, in order, is in SETUP.md.
 *
 *   Student deployment · Execute as: Me · Access: Anyone in <your school>
 *     Google performs the login and hands this script a verified school email,
 *     so the page never sees a password and students never touch the Sheet.
 *
 *   Public deployment  · Execute as: Me · Access: Anyone
 *     Serves route=class only. Aggregate counts, nothing else.
 *
 * Everything answers JSONP, because the static site is on another origin and an
 * Apps Script web app redirects in a way that breaks a plain cross-origin fetch.
 */

var CONFIG = {
  TIMEZONE: 'Europe/Zurich',

  /* Only addresses on this domain may log anything. Leave blank to accept any
     account the student deployment lets through — the deployment's own
     "Anyone in <school>" setting is then the only gate. */
  ALLOWED_DOMAIN: '',           // e.g. 'lasglion.ch'

  /* Set true if counselling wants to approve each student before they can log.
     The Roster tab then acts as a consent list: an address must appear there
     with consent = yes. False means any signed-in school account may take part. */
  REQUIRE_ROSTER: false,

  /* The public dashboard stays blank until this many different students have
     logged a night. It is the whole anonymity guarantee — do not lower it
     without deciding, on purpose, that you are happy for a small group to be
     identifiable from the totals. */
  MIN_STUDENTS: 5,
  MIN_BUCKET: 3,                // a bar with fewer nights than this is folded away

  /* Baseline-then-intervention study. Leave STUDY_START blank to run the Lab
     as an open tracker with no phases. Do not change the dates mid-study. */
  STUDY_START: '',              // 'YYYY-MM-DD', first baseline morning
  BASELINE_DAYS: 7,
  INTERVENTION_DAYS: 7,

  CACHE_SECONDS: 300            // how long the public dashboard may be stale
};

var HEADERS = {
  Roster:   ['school_email', 'house', 'year_group', 'consent', 'added_at'],
  Students: ['school_email', 'house', 'first_seen', 'last_seen', 'nights_logged'],
  Nights:   ['school_email', 'date', 'lights_out', 'out_of_bed', 'mins_to_sleep',
             'wakings', 'mins_in_bed', 'mins_asleep', 'efficiency', 'day_rating',
             'tools_done', 'tools_total', 'tools', 'phase', 'updated_at']
};

/* ═════════ ROUTING ═════════ */

function doGet(e) {
  var p = (e && e.parameter) || {};
  var route = p.route || 'signin';

  if (route === 'signin') return signinPage_();

  var body;
  try {
    if (route === 'class')       body = classSummary_();
    else if (route === 'me')     body = me_();
    else if (route === 'save')   body = saveNight_(p);
    else if (route === 'delete') body = deleteNight_(p);
    else                         body = { error: 'unknown-route' };
  } catch (err) {
    body = { error: String(err && err.message || err) };
  }
  return reply_(body, p.callback);
}

function reply_(obj, callback) {
  var json = JSON.stringify(obj);
  if (!callback || !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(callback)) {
    return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(callback + '(' + json + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

/* The popup the sign-in button opens. Google has already done the work by the
   time this renders — reaching it at all means the cookie is set. */
function signinPage_() {
  var email = activeEmail_();
  var msg = email
    ? 'Signed in as ' + email + '. You can close this window.'
    : 'Sign in with your school Google account, then close this window.';
  return HtmlService.createHtmlOutput(
    '<!doctype html><meta charset="utf-8"><title>Sleep Lab</title>' +
    '<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#121A2B;' +
    'color:#EDE6D6;font:15px/1.6 system-ui,sans-serif;text-align:center;padding:2rem}' +
    'p{max-width:22rem}</style><p>' + escapeHtml_(msg) + '</p>' +
    '<script>setTimeout(function(){try{window.close()}catch(e){}},1800);</script>'
  ).setTitle('Sleep Lab').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/* ═════════ IDENTITY ═════════ */

function activeEmail_() {
  return String(Session.getActiveUser().getEmail() || '').trim().toLowerCase();
}

/* Throws rather than returning an anonymous fallback: no identity means no
   write, and the page treats the failure as "not signed in". */
function requireStudent_() {
  var email = activeEmail_();
  if (!email) throw new Error('signed-out');
  if (CONFIG.ALLOWED_DOMAIN && email.slice(email.indexOf('@') + 1) !== CONFIG.ALLOWED_DOMAIN.toLowerCase())
    throw new Error('forbidden');
  if (CONFIG.REQUIRE_ROSTER) {
    var row = rows_('Roster').filter(function (r) {
      return String(r.school_email).trim().toLowerCase() === email;
    })[0];
    if (!row || String(row.consent).trim().toLowerCase() !== 'yes') throw new Error('forbidden');
  }
  return email;
}

/* ═════════ STUDENT ROUTES ═════════ */

function me_() {
  var email = requireStudent_();
  var mine = rows_('Nights').filter(function (r) { return sameEmail_(r.school_email, email); });
  return {
    email: email,
    name: email.split('@')[0],
    house: houseOf_(email),
    study: CONFIG.STUDY_START ? {
      start: CONFIG.STUDY_START,
      baselineDays: CONFIG.BASELINE_DAYS,
      interventionDays: CONFIG.INTERVENTION_DAYS
    } : null,
    nights: mine.map(function (r) {
      return {
        date: r.date, out: r.lights_out, up: r.out_of_bed,
        lat: num_(r.mins_to_sleep), wk: num_(r.wakings),
        inBed: num_(r.mins_in_bed), asleep: num_(r.mins_asleep),
        eff: num_(r.efficiency), energy: num_(r.day_rating),
        done: num_(r.tools_done), of: num_(r.tools_total), phase: r.phase || ''
      };
    })
  };
}

function saveNight_(p) {
  var email = requireStudent_();
  var date = clean_(p.date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('bad-date');

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    upsertNight_(email, date, {
      school_email: email,
      date: date,
      lights_out: clean_(p.out),
      out_of_bed: clean_(p.up),
      mins_to_sleep: num_(p.lat),
      wakings: num_(p.wk),
      mins_in_bed: num_(p.inBed),
      mins_asleep: num_(p.asleep),
      efficiency: num_(p.eff),
      day_rating: num_(p.energy),
      tools_done: num_(p.done),
      tools_total: num_(p.of),
      tools: clean_(p.tools),
      phase: phaseFor_(date) || clean_(p.phase),
      updated_at: stamp_()
    });
    touchStudent_(email, clean_(p.house));
  } finally {
    lock.releaseLock();
  }
  CacheService.getScriptCache().remove('class-summary');
  return { ok: true, date: date, phase: phaseFor_(date) };
}

function deleteNight_(p) {
  var email = requireStudent_();
  var date = clean_(p.date);
  var sheet = sheet_('Nights');
  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (sameEmail_(data[i][0], email) && String(data[i][1]) === date) sheet.deleteRow(i + 1);
  }
  CacheService.getScriptCache().remove('class-summary');
  return { ok: true };
}

/* ═════════ PUBLIC ROUTE ═════════ */

/**
 * Every number the open dashboard is allowed to know. Reads Nights, returns
 * counts. No email address, no per-student row and no single night ever leaves
 * this function — if you add a field here, check it cannot be traced to a person.
 */
function classSummary_() {
  var cache = CacheService.getScriptCache();
  var hit = cache.get('class-summary');
  if (hit) return JSON.parse(hit);

  var all = rows_('Nights').filter(function (r) { return num_(r.mins_asleep) > 0; });
  var people = {};
  all.forEach(function (r) { people[String(r.school_email).toLowerCase()] = 1; });
  var students = Object.keys(people).length;

  var out;
  if (students < CONFIG.MIN_STUDENTS || !all.length) {
    out = {
      ready: false,
      message: 'The dashboard opens once at least ' + CONFIG.MIN_STUDENTS +
               ' students have logged a night, so that no one can be picked out of the totals.'
    };
  } else {
    var hours = all.map(function (r) { return num_(r.mins_asleep) / 60; });
    var enough = hours.filter(function (h) { return h >= 8; }).length;

    out = {
      ready: true,
      students: students,
      nights: all.length,
      avgHours: mean_(hours),
      pctEnough: Math.round(enough / all.length * 100),
      avgEnergy: mean_(all.map(function (r) { return num_(r.day_rating); })),
      hours: bucketHours_(all),
      energy: bucketEnergy_(all),
      weekday: byWeekday_(all),
      tools: topTools_(all),
      phases: phaseAverages_(all),
      updated: stamp_()
    };
  }
  cache.put('class-summary', JSON.stringify(out), CONFIG.CACHE_SECONDS);
  return out;
}

function bucketHours_(rows) {
  var bands = [
    ['Under 6h',  function (h) { return h < 6; }],
    ['6 – 7h',    function (h) { return h >= 6 && h < 7; }],
    ['7 – 8h',    function (h) { return h >= 7 && h < 8; }],
    ['8 – 9h',    function (h) { return h >= 8 && h < 9; }],
    ['9h or more',function (h) { return h >= 9; }]
  ];
  return bands.map(function (b) {
    var n = rows.filter(function (r) { return b[1](num_(r.mins_asleep) / 60); }).length;
    return { band: b[0], n: n < CONFIG.MIN_BUCKET ? 0 : n };
  });
}

function bucketEnergy_(rows) {
  var labels = ['1 · rough', '2', '3 · okay', '4', '5 · rested'];
  return labels.map(function (label, i) {
    var n = rows.filter(function (r) { return num_(r.day_rating) === i + 1; }).length;
    return { band: label, n: n < CONFIG.MIN_BUCKET ? 0 : n };
  });
}

function byWeekday_(rows) {
  var names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var order = [1, 2, 3, 4, 5, 6, 0];
  return order.map(function (d) {
    var hrs = rows.filter(function (r) { return dayOf_(r.date) === d; })
                  .map(function (r) { return num_(r.mins_asleep) / 60; });
    return { day: names[d], hours: hrs.length >= CONFIG.MIN_BUCKET ? mean_(hrs) : 0 };
  });
}

function topTools_(rows) {
  var tally = {};
  rows.forEach(function (r) {
    String(r.tools || '').split(';').forEach(function (t) {
      t = t.trim();
      if (t) tally[t] = (tally[t] || 0) + 1;
    });
  });
  return Object.keys(tally)
    .map(function (k) { return { name: k, n: tally[k] }; })
    .filter(function (t) { return t.n >= CONFIG.MIN_BUCKET; })
    .sort(function (a, b) { return b.n - a.n; })
    .slice(0, 8);
}

function phaseAverages_(rows) {
  if (!CONFIG.STUDY_START) return null;
  var out = {};
  ['baseline', 'intervention'].forEach(function (phase) {
    var set = rows.filter(function (r) { return r.phase === phase; });
    if (set.length < CONFIG.MIN_STUDENTS) return;
    out[phase] = {
      hours:  mean_(set.map(function (r) { return num_(r.mins_asleep) / 60; })),
      lat:    mean_(set.map(function (r) { return num_(r.mins_to_sleep); })),
      eff:    mean_(set.map(function (r) { return num_(r.efficiency); })),
      energy: mean_(set.map(function (r) { return num_(r.day_rating); }))
    };
  });
  return (out.baseline && out.intervention) ? out : null;
}

/* ═════════ SHEET PLUMBING ═════════ */

/** Run once from the editor, then approve the permissions Google asks for. */
function setupSheets() {
  Object.keys(HEADERS).forEach(function (name) {
    var s = sheet_(name);
    if (s.getLastRow() === 0) {
      s.appendRow(HEADERS[name]);
      s.getRange(1, 1, 1, HEADERS[name].length).setFontWeight('bold');
      s.setFrozenRows(1);
    }
  });
  return 'Sleep Lab tabs ready. Next: deploy twice, per SETUP.md.';
}

/** Sanity check before you hand the link out. Run from the editor. */
function selfTest() {
  var report = [
    'Signed in as: ' + (activeEmail_() || '(none)'),
    'Domain lock: ' + (CONFIG.ALLOWED_DOMAIN || 'off'),
    'Roster required: ' + CONFIG.REQUIRE_ROSTER,
    'Nights on file: ' + rows_('Nights').length,
    'Public dashboard: ' + (classSummary_().ready ? 'live' : 'held back for anonymity')
  ].join('\n');
  Logger.log(report);
  return report;
}

function sheet_(name) {
  var ss = SpreadsheetApp.getActive();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function rows_(name) {
  var s = sheet_(name);
  if (s.getLastRow() < 2) return [];
  var v = s.getDataRange().getValues();
  var h = v.shift();
  return v.filter(function (r) { return r.some(function (x) { return x !== ''; }); })
          .map(function (r) {
            var o = {};
            h.forEach(function (key, i) { o[key] = r[i] == null ? '' : r[i]; });
            o.date = normDate_(o.date);
            return o;
          });
}

/* Sheets happily turns '2026-09-14' into a Date object. Normalise on the way
   out so string comparison against the page's ISO dates keeps working. */
function normDate_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, CONFIG.TIMEZONE, 'yyyy-MM-dd');
  return String(v || '');
}

function upsertNight_(email, date, obj) {
  var s = sheet_('Nights');
  if (s.getLastRow() === 0) s.appendRow(HEADERS.Nights);
  var row = HEADERS.Nights.map(function (h) { return obj[h] == null ? '' : obj[h]; });
  var data = s.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (sameEmail_(data[i][0], email) && normDate_(data[i][1]) === date) {
      s.getRange(i + 1, 1, 1, row.length).setValues([row]);
      return;
    }
  }
  s.appendRow(row);
}

function touchStudent_(email, house) {
  var s = sheet_('Students');
  if (s.getLastRow() === 0) s.appendRow(HEADERS.Students);
  var count = rows_('Nights').filter(function (r) { return sameEmail_(r.school_email, email); }).length;
  var data = s.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (sameEmail_(data[i][0], email)) {
      s.getRange(i + 1, 2, 1, 4).setValues([[house || data[i][1], data[i][2], stamp_(), count]]);
      return;
    }
  }
  s.appendRow([email, house || '', stamp_(), stamp_(), count]);
}

function houseOf_(email) {
  var r = rows_('Students').filter(function (x) { return sameEmail_(x.school_email, email); })[0];
  return r ? String(r.house || '') : '';
}

/* ═════════ SMALL HELPERS ═════════ */

function sameEmail_(a, b) { return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase(); }
function clean_(v) { return String(v == null ? '' : v).trim().slice(0, 500); }
function num_(v) { var n = Number(v); return isFinite(n) ? n : 0; }
function mean_(a) { return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : 0; }
function stamp_() { return Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd HH:mm"); }
function dayOf_(iso) { var d = new Date(iso + 'T00:00:00'); return isNaN(d) ? -1 : d.getDay(); }
function escapeHtml_(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function phaseFor_(date) {
  if (!CONFIG.STUDY_START) return '';
  var start = new Date(CONFIG.STUDY_START + 'T00:00:00');
  var day = Math.floor((new Date(date + 'T00:00:00') - start) / 86400000);
  if (day < 0) return 'before_study';
  if (day < CONFIG.BASELINE_DAYS) return 'baseline';
  if (day < CONFIG.BASELINE_DAYS + CONFIG.INTERVENTION_DAYS) return 'intervention';
  return 'after_study';
}
