// Optional static QA: NODE_PATH=/path/to/jsdom/node_modules node scripts/check-art.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM, VirtualConsole} = require('jsdom');
const root = path.resolve(__dirname, '..');
for (const file of ['index.html', 'sleep-lab.html']) {
  const html = fs.readFileSync(path.join(root,file),'utf8');
  const doc = new JSDOM(html).window.document;
  const ids = [...doc.querySelectorAll('[id]')].map(e=>e.id);
  assert.equal(new Set(ids).size, ids.length, file+' duplicate IDs');
  for (const el of doc.querySelectorAll('[src],link[href],a[href]')) {
    const ref = el.getAttribute('src') || el.getAttribute('href');
    if (!ref || /^(https?:|data:|mailto:|#)/.test(ref)) continue;
    assert.ok(fs.existsSync(path.resolve(root,ref.split('#')[0])), file+': '+ref);
  }
  assert.ok(doc.querySelector('link[href="illustrated.css"]'));
  assert.ok(!/Leysin American School|everyday life at LAS/.test(html));
}
const landing = new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8')).window.document;
assert.equal(landing.querySelector('h1').textContent,'Tools for everyday life.');
assert.equal(landing.querySelector('.hero-caption').textContent,'One step at a time.');
assert.equal(landing.querySelector('.hero-description').textContent,'Simple guides for sleep, sharing space, and the small stuff that adds up.');
assert.equal(landing.querySelector('.hero-copy .eyebrow').textContent,"SHAYNE'S WELLBEING TOOLKIT");
assert.equal(landing.querySelector('.hero-copy .button').textContent,'Find what you need ↓');
assert.equal(landing.querySelector('.journey-scroll span').textContent,'Take a look around');
assert.notEqual(landing.querySelector('.landscape-day').src,landing.querySelector('.landscape-night').src);
assert.equal(landing.querySelectorAll('.scene-icon img').length,4);
assert.equal(landing.querySelectorAll('[data-night-passage]').length,4);
const cssErrors=[];
for(const file of ['landing.css','illustrated.css','lab-polish.css','night-passage.css']){
  const css=fs.readFileSync(path.join(root,file),'utf8');
  const vc=new VirtualConsole();vc.on('jsdomError',e=>cssErrors.push(file+': '+e.message));
  new JSDOM('<style>'+css+'</style>',{virtualConsole:vc});
  for(const m of css.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)){
    if(!/^(data:|https?:)/.test(m[1])) assert.ok(fs.existsSync(path.resolve(root,m[1])),file+': '+m[1]);
  }
}
assert.deepEqual(cssErrors,[]);
for(const file of ['cloud-line-day.svg','cloud-line-night.svg','cow-line.svg','icon-sleep.svg','icon-roommate.svg','icon-first-weeks.svg','icon-exam.svg']){
  const doc=new JSDOM(fs.readFileSync(path.join(root,'assets',file),'utf8'),{contentType:'image/svg+xml'}).window.document;
  assert.equal(doc.documentElement.localName,'svg');
  assert.equal(doc.querySelectorAll('script,foreignObject').length,0);
}
console.log('Art checks passed: exact copy, theme assets, HTML IDs/links, CSS parsing/URLs and SVG XML.');
