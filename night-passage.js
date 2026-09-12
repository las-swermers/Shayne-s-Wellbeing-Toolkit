(function () {
  'use strict';
  var motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  var storageKey='sleep-lab-passage', duration=2500;
  var curtain, scene, leaper, timer, frame, destination, started, previousFocus, locked=[];
  var navigating=false, ready=false, cloud=new Image(), cow=new Image();
  function checkReady(){ready=cloud.complete&&cloud.naturalWidth>0&&cow.complete&&cow.naturalWidth>0;}
  cloud.onload=checkReady;cow.onload=checkReady;
  cloud.src='assets/cloud-line-day.svg';cow.src='assets/cow-jump-v2.webp';
  function clearStamp(){try{sessionStorage.removeItem(storageKey);}catch(e){}}
  function unlock(){locked.forEach(function(item){item.el.inert=item.inert;});locked=[];}
  function reset(){
    clearTimeout(timer);cancelAnimationFrame(frame);unlock();
    if(curtain)curtain.remove();
    curtain=null;destination=null;started=null;navigating=false;clearStamp();
    if(previousFocus&&previousFocus.isConnected)previousFocus.focus({preventScroll:true});
    previousFocus=null;
  }
  function element(tag,name,parent){
    var el=document.createElement(tag);el.className=name;parent.appendChild(el);return el;
  }
  function createCurtain(interactive){
    curtain=document.createElement('div');curtain.className='night-passage';
    var art=element('div','passage-art',curtain);art.setAttribute('aria-hidden','true');
    element('div','passage-stars',art);
    element('div','passage-cloud back-left',art);
    element('div','passage-cloud back-right',art);
    scene=element('div','passage-scene',art);
    element('div','passage-moon',scene);
    leaper=element('img','passage-cow',scene);leaper.src=cow.src;leaper.alt='';
    element('div','passage-veil',art);
    document.body.appendChild(curtain);
    if(interactive){
      previousFocus=document.activeElement;
      Array.prototype.forEach.call(document.body.children,function(el){
        if(el!==curtain){locked.push({el:el,inert:el.inert});el.inert=true;}
      });
      var caption=element('div','passage-caption',curtain);
      var label=element('span','passage-label',caption);label.textContent='Entering Sleep Lab';
      var skip=element('button','passage-skip',caption);skip.type='button';skip.textContent='Skip animation';
      skip.addEventListener('click',go);skip.focus({preventScroll:true});
    }
  }
  function go(){
    if(!destination||navigating)return;
    navigating=true;clearTimeout(timer);cancelAnimationFrame(frame);
    try{sessionStorage.setItem(storageKey,JSON.stringify({path:destination.pathname,time:Date.now()}));}catch(e){}
    window.location.assign(destination.href);
  }
  function paint(now){
    if(!curtain||!destination||navigating)return;
    if(started===null)started=now;
    var elapsed=now-started;
    var p=Math.max(0,Math.min(1,(elapsed-260)/1650));
    var w=scene.clientWidth,h=scene.clientHeight;
    // Constant horizontal speed and a parabola give a smooth, single jump.
    // Both moon and cow use this same scene coordinate system at every size.
    var x=(.02+.66*p)*w, y=(.62-2.4*p*(1-p))*h;
    var tilt=-17+34*p;
    leaper.style.transform='translate3d('+x+'px,'+y+'px,0) rotate('+tilt+'deg)';
    leaper.style.opacity=Math.min(1,p/.07,(1-p)/.09);
    frame=requestAnimationFrame(paint);
  }
  var stamp;try{stamp=JSON.parse(sessionStorage.getItem(storageKey)||'null');}catch(e){}
  clearStamp();
  if(!motion.matches&&stamp&&stamp.path===location.pathname&&Date.now()-stamp.time<12000){
    createCurtain(false);curtain.classList.add('arriving');timer=setTimeout(reset,700);
  }
  document.addEventListener('click',function(event){
    var anchor=event.target.closest('a[data-night-passage]');
    if(!anchor||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||
      anchor.hasAttribute('download')||(anchor.target&&anchor.target!=='_self')||motion.matches||!ready)return;
    var target=new URL(anchor.href,location.href);
    if(target.origin!==location.origin||target.pathname===location.pathname)return;
    event.preventDefault();if(destination)return;
    reset();destination=target;createCurtain(true);started=null;
    requestAnimationFrame(function(){
      if(!curtain||!destination)return;
      curtain.classList.add('covered');frame=requestAnimationFrame(paint);
      timer=setTimeout(go,duration);
    });
  });
  window.addEventListener('pageshow',function(event){if(event.persisted)reset();});
  document.addEventListener('keydown',function(event){
    if(event.key==='Escape')reset();
    if(event.key==='Tab'&&destination){event.preventDefault();curtain.querySelector('.passage-skip').focus();}
  });
  motion.addEventListener('change',function(){
    if(motion.matches&&destination){go();reset();}
    else if(motion.matches)reset();
  });
})();
