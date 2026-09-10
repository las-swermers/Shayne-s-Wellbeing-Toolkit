(function () {
  'use strict';
  var root = document.documentElement;
  var toggle = document.getElementById('themeToggle');
  var journey = document.querySelector('.journey');
  var stage = document.querySelector('.journey-stage');
  var intro = document.querySelector('.hero-copy');
  var cue = document.querySelector('.journey-scroll');
  var cow = document.querySelector('.journey-cow');
  var landscape = document.querySelector('.journey-landscape');
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var shortScreen = window.matchMedia('(max-height: 600px)');
  var frame = 0;
  var clamp = function (n) { return Math.max(0, Math.min(1, n)); };
  var smooth = function (a, b, n) { var t = clamp((n-a)/(b-a)); return t*t*(3-2*t); };
  function labelTheme() {
    if (toggle) toggle.setAttribute('aria-label', root.dataset.theme === 'day' ? 'Switch to night view' : 'Switch to day view');
  }
  labelTheme();
  if (toggle) toggle.addEventListener('click', function () {
    root.dataset.theme = root.dataset.theme === 'day' ? 'night' : 'day';
    try { localStorage.setItem('sleeplab-theme', root.dataset.theme); } catch (e) {}
    labelTheme();
  });
  try {
    var record = JSON.parse(localStorage.getItem('sleeplab') || 'null');
    var enter = document.querySelector('#enterLab span');
    if (enter && record && Array.isArray(record.log) && record.log.length) enter.textContent = 'Continue Sleep Lab';
  } catch (e) {}
  function set(name, value) { stage.style.setProperty('--' + name, value); }
  function reset() {
    journey.classList.remove('is-enhanced');
    stage.removeAttribute('style');
    intro.inert = false;
    intro.removeAttribute('aria-hidden');
    cue.inert = false;
    cue.removeAttribute('aria-hidden');
  }
  function paint() {
    frame = 0;
    if (!journey || !stage || !cow || !landscape) return;
    if (motion.matches || shortScreen.matches || !landscape.complete || !landscape.naturalWidth) { reset(); return; }
    journey.classList.add('is-enhanced');
    var box = journey.getBoundingClientRect();
    var width = stage.clientWidth, height = stage.clientHeight;
    var progress = clamp(-box.top / Math.max(1, journey.offsetHeight-height));
    var introFade = smooth(.06,.30,progress);
    // Never hide a focused link while someone is navigating with a keyboard.
    var focused = intro.contains(document.activeElement);
    set('intro-opacity', focused ? 1 : 1-introFade);
    set('intro-y', focused ? '0px' : (-introFade*42)+'px');
    intro.inert = introFade === 1 && !focused;
    if (intro.inert) intro.setAttribute('aria-hidden','true'); else intro.removeAttribute('aria-hidden');
    var cueHidden = progress > .12 && !cue.contains(document.activeElement);
    set('scroll-opacity',cueHidden ? 0 : 1);
    cue.inert = cueHidden;
    if(cueHidden) cue.setAttribute('aria-hidden','true'); else cue.removeAttribute('aria-hidden');
    // Locate the moon in the actual cover crop (1774 × 887 source, 70% x).
    // The path is anchored to the artwork, not arbitrary viewport percentages.
    var scale = Math.max(width/1774,height/887);
    var moonX = (width-1774*scale)*.70+1265*scale;
    var moonY = (height-887*scale)*.50+315*scale;
    var radius = 145*scale;
    var leap = smooth(.20,.76,progress);
    var span = Math.max(radius*1.7, cow.clientWidth*1.3);
    var x = moonX+(leap*2-1)*span;
    var apex = Math.max(cow.clientWidth*.45,moonY-radius-cow.clientWidth*.45);
    var y = moonY-Math.sin(Math.PI*leap)*(moonY-apex);
    set('cow-x',x+'px'); set('cow-y',y+'px');
    set('cow-angle',(-12+leap*24)+'deg');
    set('cow-opacity',smooth(.16,.25,progress)*(1-smooth(.72,.82,progress)));
    var clouds = smooth(.43,.98,progress);
    set('cloud-opacity',.18+clouds*.82);
    set('cloud-scale',1+clouds*.52);
    set('near-x',clouds*13+'%'); set('near-y',-clouds*37+'%');
    set('far-x',-clouds*17+'%'); set('far-y',-clouds*31+'%');
    set('exit-opacity',.10+.9*smooth(.78,1,progress));
    set('caption-opacity',smooth(.29,.43,progress)*(1-smooth(.66,.82,progress)));
    set('caption-y',(1-smooth(.29,.43,progress))*12+'px');
  }
  function schedule() { if (!frame) frame=requestAnimationFrame(paint); }
  if (journey) {
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',schedule,{passive:true});
    window.addEventListener('pageshow',schedule);
    motion.addEventListener('change',schedule);
    shortScreen.addEventListener('change',schedule);
    landscape.addEventListener('load',schedule);
    landscape.addEventListener('error',reset);
    intro.addEventListener('focusin',schedule);
    intro.addEventListener('focusout',schedule);
    schedule();
  }
  // Progressive enhancement: text is visible even if the observer never runs.
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (!motion.matches) entry.target.classList.add('entering');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(function (item) { observer.observe(item); });
  }
})();
