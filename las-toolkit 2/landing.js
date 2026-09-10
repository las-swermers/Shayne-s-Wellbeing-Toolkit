(function () {
  'use strict';
  var root = document.documentElement;
  var toggle = document.getElementById('themeToggle');
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var scene = document.querySelector('.alpine-window');
  var passage = document.querySelector('.moon-passage');
  var passageStage = document.querySelector('.passage-stage');
  function labelTheme() {
    toggle.setAttribute('aria-label', root.dataset.theme === 'day' ? 'Switch to night view' : 'Switch to day view');
  }
  labelTheme();
  toggle.addEventListener('click', function () {
    root.dataset.theme = root.dataset.theme === 'day' ? 'night' : 'day';
    try { localStorage.setItem('sleeplab-theme', root.dataset.theme); } catch (e) {}
    labelTheme();
  });
  try {
    var record = JSON.parse(localStorage.getItem('sleeplab') || 'null');
    if (record && Array.isArray(record.log) && record.log.length) {
      document.querySelector('#enterLab span').textContent = 'Continue Sleep Lab';
    }
  } catch (e) {}
  var pending = false;
  function paintScene() {
    pending = false;
    if (motion.matches) {
      scene.style.removeProperty('--scene-offset');
      scene.style.removeProperty('--cloud-back-x');
      scene.style.removeProperty('--cloud-front-x');
      return;
    }
    var bounds = scene.getBoundingClientRect();
    if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;
    var progress = Math.max(-1, Math.min(1, (window.innerHeight / 2 - bounds.top) / (window.innerHeight + bounds.height)));
    scene.style.setProperty('--scene-offset', (progress * 22) + 'px');
    scene.style.setProperty('--cloud-back-x', (progress * 75) + 'px');
    scene.style.setProperty('--cloud-front-x', (-progress * 110) + 'px');
  }
  function scheduleScene() { if (!pending) { pending = true; requestAnimationFrame(paintScene); } }
  window.addEventListener('scroll', scheduleScene, { passive: true });
  window.addEventListener('resize', scheduleScene, { passive: true });
  motion.addEventListener('change', scheduleScene);
  scheduleScene();
  var passagePending = false;
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function paintPassage() {
    passagePending = false;
    if (!passage || !passageStage || motion.matches) return;
    var bounds = passage.getBoundingClientRect();
    var range = Math.max(1, passage.offsetHeight - window.innerHeight);
    var progress = clamp(-bounds.top / range, 0, 1);
    var arc = Math.sin(Math.PI * progress);
    var x = -8 + progress * 155;
    var y = 24 - arc * 108;
    var cloud = clamp((progress - .08) / .72, 0, 1);
    var copyStart = 1 - clamp((progress - .1) / .27, 0, 1);
    var copyEnd = clamp((progress - .56) / .3, 0, 1);
    passageStage.style.setProperty('--cow-x', x + '%');
    passageStage.style.setProperty('--cow-y', (50 + y * .3) + '%');
    passageStage.style.setProperty('--cow-rotate', (-8 + progress * 16) + 'deg');
    passageStage.style.setProperty('--cow-scale', (0.9 + arc * .16) + '');
    passageStage.style.setProperty('--cloud-opacity', cloud.toFixed(3));
    passageStage.style.setProperty('--cloud-one-x', ((1 - cloud) * -22) + '%');
    passageStage.style.setProperty('--cloud-one-y', ((1 - cloud) * 22 - cloud * 10) + '%');
    passageStage.style.setProperty('--cloud-one-scale', (1 + cloud * .34) + '');
    passageStage.style.setProperty('--cloud-two-x', ((1 - cloud) * 24) + '%');
    passageStage.style.setProperty('--cloud-two-y', ((1 - cloud) * 26 - cloud * 9) + '%');
    passageStage.style.setProperty('--cloud-two-scale', (1 + cloud * .38) + '');
    passageStage.style.setProperty('--passage-scene-y', (progress * -22) + 'px');
    passageStage.style.setProperty('--copy-start-opacity', copyStart.toFixed(3));
    passageStage.style.setProperty('--copy-end-opacity', copyEnd.toFixed(3));
    passageStage.style.setProperty('--meter-scale', Math.max(.12, progress).toFixed(3));
  }
  function schedulePassage() { if (!passagePending) { passagePending = true; requestAnimationFrame(paintPassage); } }
  window.addEventListener('scroll', schedulePassage, { passive: true });
  window.addEventListener('resize', schedulePassage, { passive: true });
  motion.addEventListener('change', schedulePassage);
  schedulePassage();
  // Content remains visible when JavaScript, observers or animations are unavailable.
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
