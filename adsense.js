/* My Khata - Google AdSense side rails (160x600, left + right).
   Rules built in:
   - Only big screen (>=1200px) + mouse/trackpad. Phones, tablets, installed phone app: nothing shown, AdSense never loaded.
   - Only when the real app is on screen (not login, not setup, not PIN lock). Ad code is loaded the first time the rails are visible.
   - Rails sit in the empty space beside the 820px app; if there is not enough room they stay hidden. No close/hide button.
   - Not included in admin.html. Disabled until config.js ADS has real IDs. */
(function () {
  var C = (window.KHATA_CFG && window.KHATA_CFG.ADS) || {};
  if (!/^ca-pub-\d{16}$/.test(C.CLIENT || '') || !/^\d{5,}$/.test(C.SLOT_LEFT || '') || !/^\d{5,}$/.test(C.SLOT_RIGHT || '')) return;

  var W = 160, H = 600, GAP = 14, LABEL = 16;
  var mq = window.matchMedia('(min-width:1200px) and (hover:hover) and (pointer:fine)');
  var rails = null, loaded = false, pushed = false, raf = 0;

  var st = document.createElement('style');
  st.textContent =
    '.khad{position:fixed;z-index:40;width:' + W + 'px;height:' + (H + LABEL) + 'px;display:none;overflow:hidden;font-family:Inter,sans-serif}' +
    '.khad-l{height:' + LABEL + 'px;font-size:10px;letter-spacing:.6px;text-transform:uppercase;color:var(--ink-soft,#666);opacity:.7;text-align:center}' +
    '.khad ins{display:inline-block;width:' + W + 'px;height:' + H + 'px}' +
    '.khad:has(ins[data-ad-status="unfilled"]){display:none!important}' +
    '@media print{.khad{display:none!important}}';
  document.head.appendChild(st);

  function make(slot) {
    var a = document.createElement('aside');
    a.className = 'khad';
    a.setAttribute('aria-label', 'Advertisement');
    a.innerHTML = '<div class="khad-l">Advertisement</div><ins class="adsbygoogle" data-ad-client="' + C.CLIENT + '" data-ad-slot="' + slot + '"></ins>';
    document.body.appendChild(a);
    return a;
  }

  function hide() { if (rails) rails.forEach(function (r) { r.style.display = 'none'; }); }

  function update() {
    raf = 0;
    var app = document.getElementById('root');
    if (!window.__khAppOK || !mq.matches || !navigator.onLine || !app) return hide();
    var r = app.getBoundingClientRect(), vw = document.documentElement.clientWidth, vh = window.innerHeight;
    // need free space on both sides and enough height, otherwise stay hidden (never cover the work area)
    if (r.width < 300 || r.left < W + GAP + 6 || vw - r.right < W + GAP + 6 || vh < H + LABEL + 12) return hide();
    var top = Math.max(12, Math.min(96, vh - H - LABEL - 12));
    if (!rails) rails = [make(C.SLOT_LEFT), make(C.SLOT_RIGHT)];
    rails[0].style.left = Math.round(r.left - W - GAP) + 'px';
    rails[1].style.left = Math.round(r.right + GAP) + 'px';
    rails.forEach(function (x) { x.style.top = top + 'px'; x.style.display = 'block'; });
    if (!loaded) {
      loaded = true;
      var s = document.createElement('script');
      s.async = true; s.crossOrigin = 'anonymous';
      s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + C.CLIENT;
      document.head.appendChild(s);
    }
    if (!pushed) {
      pushed = true; // ask for each ad exactly once, only after the rails are visible
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    }
  }
  function sched() { if (!raf) raf = requestAnimationFrame(update); }

  window.addEventListener('khata-view', sched);
  window.addEventListener('resize', sched);
  window.addEventListener('online', sched);
  window.addEventListener('offline', sched);
  try { mq.addEventListener('change', sched); } catch (e) {}
  sched();
})();
