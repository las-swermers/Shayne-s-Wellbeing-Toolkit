// Full DOM interaction checks; requires jsdom on NODE_PATH.
const {JSDOM}=require('jsdom'),fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const path=require('node:path'),root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const dom=new JSDOM(html,{url:'https://toolkit.invalid/index.html',runScripts:'outside-only'});
const w=dom.window,d=w.document;
const frames=new Map(),timers=new Map(),events={},motion={matches:false,addEventListener:(k,f)=>events.motion=f};
let id=0;
w.matchMedia=()=>motion;w.requestAnimationFrame=f=>{frames.set(++id,f);return id;};
w.eval(fs.readFileSync(path.join(root,'landing.js'),'utf8'));
const menu=d.getElementById('headerMenu');
menu.open=true;menu.querySelector('a').click();assert.equal(menu.open,false);
menu.open=true;d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
assert.equal(menu.open,false);assert.equal(d.activeElement,menu.querySelector('summary'));
menu.open=true;d.querySelector('h1').click();assert.equal(menu.open,false);
const band=d.getElementById('wellbeingBand');
assert.equal(band.querySelectorAll('.wellbeing-group').length,2);
assert.equal(band.querySelectorAll('.wellbeing-group:not([aria-hidden]) li').length,8);
assert.equal(band.querySelector('.wellbeing-group[aria-hidden="true"]').inert,true);
frames.clear();
const navigations=[],images=[];
class FakeImage {
  constructor(){this.complete=true;this.naturalWidth=768;images.push(this);}
  set src(value){this._src=value;if(this.onload)this.onload();}
  get src(){return this._src;}
}
const location={href:'https://toolkit.invalid/index.html',origin:'https://toolkit.invalid',pathname:'/index.html',assign:url=>navigations.push(url)};
const ctx={document:d,window:{matchMedia:()=>motion,location,addEventListener:(k,f)=>events[k]=f},
  location,sessionStorage:w.sessionStorage,Image:FakeImage,URL,Date,
  requestAnimationFrame:f=>{frames.set(++id,f);return id;},cancelAnimationFrame:i=>frames.delete(i),
  setTimeout:(f,ms)=>{timers.set(++id,{f,ms});return id;},clearTimeout:i=>timers.delete(i)};
vm.runInNewContext(fs.readFileSync(path.join(root,'night-passage.js'),'utf8'),ctx);
const link=d.querySelector('[data-night-passage]');
function click(opts={}){return link.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true,button:0,...opts}));}
function frame(time){const batch=[...frames.values()];frames.clear();batch.forEach(f=>f(time));}
link.focus();click();frame(0);frame(16);
assert.ok(d.querySelector('.night-passage.covered'));
assert.equal(d.querySelector('main').inert,true);
assert.equal(d.activeElement.className,'passage-skip');
const scene=d.querySelector('.passage-scene'),cow=d.querySelector('.passage-cow');
Object.defineProperties(scene,{clientWidth:{value:600},clientHeight:{value:400}});
frame(1101); // 16ms start + 260ms lead + half of the 1650ms jump.
const xy=cow.style.transform.match(/translate3d\(([^p]+)px,([^p]+)px/);
assert.ok(Math.abs(Number(xy[1])-210)<.1);
assert.ok(Number(xy[2])+128 < .61*400-.125*600,'cow clears moon at apex');
d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
assert.equal(d.querySelector('.night-passage'),null);assert.equal(d.activeElement,link);
assert.ok(!d.querySelector('main').inert);assert.equal(timers.size,0);
click();frame(1200);d.querySelector('.passage-skip').click();
assert.equal(navigations.length,1);assert.match(navigations[0],/sleep-lab.html#log$/);
d.querySelector('.passage-skip').click();assert.equal(navigations.length,1);
events.pageshow({persisted:true});assert.equal(d.querySelector('.night-passage'),null);
motion.matches=true;assert.equal(click(),true);assert.equal(d.querySelector('.night-passage'),null);
motion.matches=false;assert.equal(click({ctrlKey:true}),true);
images.forEach(im=>{im.naturalWidth=0;im.onload();});
assert.equal(click(),true);assert.equal(d.querySelector('.night-passage'),null);
dom.window.close();
console.log('Landing checks passed: dropdown, accessible ribbon duplicates, jump clearance, Escape/focus, skip once, Back, reduced motion and missing-art fallback.');
