/* Shared helpers for the PPM Compass free tools pages:
 * - "Notify me" waitlist forms (email only, sent via the site's existing Web3Forms endpoint)
 * - lightweight click tracking for elements with data-track (Microsoft Clarity custom events, only if analytics consent was given)
 */
(function () {
  'use strict';

  var WEB3FORMS_KEY = 'c913267c-6c38-4480-bd78-2b5b253a79d5';

  function track(name) {
    try { if (typeof window.clarity === 'function') window.clarity('event', name); } catch (e) { /* optional */ }
  }
  window.ftTrack = track;

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-track]');
    if (el) track(el.getAttribute('data-track'));
  });

  function setStatus(form, text, cls) {
    var s = form.querySelector('.ft-form-status');
    if (!s) return;
    s.textContent = text;
    s.className = 'ft-form-status' + (cls ? ' ' + cls : '');
  }

  function bindNotify(form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.querySelector('input[name=email]');
      var consent = form.querySelector('input[name=consent]');
      var bot = form.querySelector('input[name=botcheck]');
      var btn = form.querySelector('button[type=submit]');
      var value = (email.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { setStatus(form, 'Please enter a valid email address.', 'err'); email.focus(); return; }
      if (consent && !consent.checked) { setStatus(form, 'Please tick the box so we may email you.', 'err'); consent.focus(); return; }
      if (bot && bot.checked) return;

      var tool = form.getAttribute('data-notify') || 'Free tools';
      var source = form.getAttribute('data-source') || location.pathname;
      btn.disabled = true;
      setStatus(form, 'Sending…');
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: 'Free Tools waitlist: ' + tool,
          from_name: 'PPM Compass Free Tools',
          email: value,
          message: 'Please notify me when "' + tool + '" launches.\nSource page: ' + source + '\nMarketing consent: yes (checkbox ticked ' + new Date().toISOString() + ')',
          botcheck: false
        })
      }).then(function (r) { return r.json().catch(function () { return { success: r.ok }; }); })
        .then(function (res) {
          if (res && res.success) {
            setStatus(form, '✓ Thanks! We will let you know when it launches.', 'ok');
            form.reset();
            track('notify_signup_' + tool.toLowerCase().replace(/[^a-z]+/g, '_'));
          } else {
            setStatus(form, 'Something went wrong. Please try again, or email contact@ppmcompass.com.', 'err');
          }
        })
        .catch(function () { setStatus(form, 'Could not send. Please check your connection and try again.', 'err'); })
        .then(function () { btn.disabled = false; });
    });
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('form[data-notify]'), bindNotify);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
