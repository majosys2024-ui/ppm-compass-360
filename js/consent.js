/* PPM Compass website - analytics consent (Microsoft Clarity loads only after "Accept"). */
(function () {
  var KEY = 'ppm_consent_v1';
  var CLARITY_ID = 'yl9ouesi63';
  var loaded = false;

  function getChoice() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setChoice(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* storage blocked */ } }

  function loadClarity() {
    if (loaded) return;
    loaded = true;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
    window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
  }

  function closeBanner() { var b = document.getElementById('ppm-consent'); if (b) b.remove(); }

  function choose(v) {
    var before = getChoice();
    setChoice(v);
    closeBanner();
    if (v === 'granted') loadClarity();
    else if (before === 'granted' || loaded) location.reload(); // stop an already-running Clarity session
  }

  function showBanner() {
    if (document.getElementById('ppm-consent')) return;
    var dark = document.documentElement.classList.contains('dark');
    var bg = dark ? '#0f172a' : '#ffffff', fg = dark ? '#e2e8f0' : '#334155', bd = dark ? '#334155' : '#e2e8f0';
    var btn = 'padding:8px 16px;border-radius:10px;font-weight:700;font-size:12px;cursor:pointer;border:1px solid #2563eb;';
    var d = document.createElement('div');
    d.id = 'ppm-consent';
    d.setAttribute('role', 'dialog');
    d.setAttribute('aria-label', 'Cookie consent');
    d.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:640px;margin:0 auto;' +
      'background:' + bg + ';color:' + fg + ';border:1px solid ' + bd + ';border-radius:16px;padding:16px 18px;' +
      'box-shadow:0 10px 30px rgba(15,23,42,.18);font:13px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;';
    d.innerHTML =
      '<p style="margin:0 0 12px">We use optional analytics cookies to improve this website. ' +
      '<a href="/privacy/#website" style="color:#2563eb;text-decoration:underline">Privacy policy</a></p>' +
      '<div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap">' +
      '<button type="button" data-v="denied" style="' + btn + 'background:transparent;color:#2563eb">Reject</button>' +
      '<button type="button" data-v="granted" style="' + btn + 'background:transparent;color:#2563eb">Accept</button></div>';
    d.addEventListener('click', function (e) { var v = e.target.getAttribute && e.target.getAttribute('data-v'); if (v) choose(v); });
    document.body.appendChild(d);
  }

  window.ppmConsent = { open: showBanner };

  function init() { var c = getChoice(); if (c === 'granted') loadClarity(); else if (c !== 'denied') showBanner(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
