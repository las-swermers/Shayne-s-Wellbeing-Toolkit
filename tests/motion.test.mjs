import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('../landing.js',import.meta.url),'utf8');

function scene(width,height=800) {
  const values=new Map(), events={}, queue=[];
  const motion={matches:false,addEventListener:(n,f)=>events.motion=f};
  const short={matches:height<=600,addEventListener:()=>{}};
  const make=()=>({inert:false,attrs:{},addEventListener:()=>{},
    contains(el){return el===this;},
    setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];}});
  const intro=make(),cue=make(),classes=new Set();
  const journey={top:0,offsetHeight:height*2.4,getBoundingClientRect(){return {top:this.top};},
    classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)}};
  const stage={clientWidth:width,clientHeight:height,style:{setProperty:(k,v)=>values.set(k,v)},
    removeAttribute:()=>values.clear()};
  const landscape={complete:true,naturalWidth:1774,addEventListener:()=>{}};
  const nodes={'.journey':journey,'.journey-stage':stage,'.hero-copy':intro,
    '.journey-scroll':cue,'.journey-cow':{clientWidth:width<480?112:180},'.journey-landscape':landscape};
  const document={documentElement:{dataset:{}},activeElement:null,
    querySelector:s=>nodes[s]||null,getElementById:()=>null};
  vm.runInNewContext(source,{document,localStorage:{getItem:()=>null},
    requestAnimationFrame:f=>{queue.push(f);return queue.length;},
    window:{matchMedia:q=>q.includes('reduced')?motion:short,addEventListener:(n,f)=>events[n]=f}});
  const flush=()=>{while(queue.length)queue.shift()();};
  flush();
  return {values,classes,intro,document,landscape,journey,events,motion,flush,
    scroll(p){journey.top=-p*(journey.offsetHeight-height);events.scroll();flush();}};
}
test('scroll scene produces finite positions across phone, tablet and desktop widths',()=>{
  for(const width of [360,390,768,1440]) {
    const s=scene(width);
    for(const p of [0,.25,.5,.75,1]){
      s.scroll(p);
      for(const key of ['--cow-x','--cow-y','--cow-opacity','--cloud-opacity']){
        assert.ok(Number.isFinite(parseFloat(s.values.get(key))),width+' '+key);
      }
    }
    assert.equal(s.intro.inert,true);
    s.scroll(0);assert.equal(s.intro.inert,false);
  }
});
test('focused intro links stay visible; reduced motion clears hidden states',()=>{
  const s=scene(390);s.document.activeElement=s.intro;s.scroll(.6);
  assert.equal(s.intro.inert,false);
  assert.equal(s.values.get('--intro-opacity'),1);
  s.document.activeElement=null;s.scroll(.6);assert.equal(s.intro.inert,true);
  s.motion.matches=true;s.events.motion();s.flush();
  assert.equal(s.classes.has('is-enhanced'),false);
  assert.equal(s.intro.inert,false);
  assert.equal(s.values.size,0);
});
test('short screens and failed images retain an unpinned readable scene',()=>{
  assert.equal(scene(900,500).classes.has('is-enhanced'),false);
  const s=scene(390);s.landscape.naturalWidth=0;s.scroll(.6);
  assert.equal(s.classes.has('is-enhanced'),false);
  assert.equal(s.intro.inert,false);
});
