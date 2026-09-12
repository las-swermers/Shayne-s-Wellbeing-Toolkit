(function () {
  'use strict';
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var storageKey = 'sleep-lab-passage';
  var curtain, timer, destination, ready = false;
  var cloud = new Image();
  var cow = new Image();
  function checkReady() { ready = cloud.complete && cloud.naturalWidth > 0 && cow.complete && cow.naturalWidth > 0; }
  cloud.onload = checkReady;
  cow.onload = checkReady;
  cloud.src = 'assets/cloud-line-night.svg';
  cow.src = 'assets/cow-line.svg';
  function clearStamp() { try { sessionStorage.removeItem(storageKey); } catch (e) {} }
  function reset() {
    clearTimeout(timer);
    if (curtain) curtain.remove();
    curtain = null;
    destination = null;
    clearStamp();
  }
  function createCurtain() {
    curtain = document.createElement('div');
    curtain.className = 'night-passage';
    curtain.setAttribute('aria-hidden', 'true');
    var moon = document.createElement('div');
    moon.className = 'passage-moon';
    var leaper = document.createElement('img');
    leaper.className = 'passage-cow';
    leaper.src = cow.src;
    leaper.alt = '';
    curtain.appendChild(moon);
    curtain.appendChild(leaper);
    document.body.appendChild(curtain);
  }
  function go() {
    if (!destination) return;
    try { sessionStorage.setItem(storageKey, JSON.stringify({ path: destination.pathname, time: Date.now() })); } catch (e) {}
    window.location.assign(destination.href);
  }
  var stamp;
  try { stamp = JSON.parse(sessionStorage.getItem(storageKey) || 'null'); } catch (e) {}
  clearStamp();
  if (!motion.matches && stamp && stamp.path === location.pathname && Date.now() - stamp.time < 12000) {
    createCurtain();
    curtain.classList.add('arriving');
    timer = setTimeout(reset, 850);
  }
  document.addEventListener('click', function (event) {
    var anchor = event.target.closest('a[data-night-passage]');
    if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey || anchor.hasAttribute('download') ||
        (anchor.target && anchor.target !== '_self') || motion.matches || !ready) return;
    var target = new URL(anchor.href, location.href);
    if (target.origin !== location.origin || target.pathname === location.pathname) return;
    if (destination) { event.preventDefault(); return; }
    event.preventDefault();
    reset();
    destination = target;
    createCurtain();
    // Two frames establish the initial cloud position before the transition.
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      if (curtain && destination) curtain.classList.add('covered');
    }); });
    timer = setTimeout(go, 1700);
  });
  window.addEventListener('pageshow', function (event) { if (event.persisted) reset(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape') reset(); });
  motion.addEventListener('change', function () {
    if (motion.matches && destination) { clearTimeout(timer); go(); }
    else if (motion.matches) reset();
  });
})();
