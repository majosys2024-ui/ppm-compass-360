/*!
 * PPM Compass 360 -- interactive website demo (v1.0.3.3 look).
 * Vanilla JS (ES6+ IIFE), no dependencies, no bundler. Styled with Tailwind utility classes
 * (incl. dark: variants). Reads mock data from window.PPM_DEMO_DATA (see ppm-demo-data.js).
 *
 * Usage:
 *   <div id="ppm-compass-demo" data-page="allProjects" data-chrome="sharepoint" data-height="760"></div>
 *   <script src="ppm-demo-data.js"><\/script>
 *   <script src="ppm-compass-demo.js"><\/script>
 * Options (data- attributes on the mount element):
 *   data-page    allProjects | myProjects | myPortfolio | search | milestones | risks | analytics | heatmap | project
 *   data-project project number to open when data-page="project" (e.g. PPM-101)
 *   data-tab     overview | history | milestones | crs | decisions | risks | financials | team
 *   data-chrome  sharepoint (default) | none
 *   data-height  px height of the scrolling app area (default 760; "auto" = no inner scroll)
 * Also exposes window.PPMCompassDemo.mount(el, options) and .go(page, projectNumber, tab).
 */
(function () {
  'use strict';

  // ---------- design tokens (from the app's SCSS) ----------
  var BRAND = '#1a4fa0';
  var AXES = ['Schedule health', 'Cost health', 'Output', 'Team engagement', 'Risk health'];
  var OUTPUT_AXIS = 2;
  var PROB = { Low: 0.1, Medium: 0.4, High: 0.7 };
  var RATING_ORDER = ['Critical', 'High', 'Medium', 'Low'];
  var MS_ICON = { Milestone: '🏁', Approval: '✅', Gate: '🔒', Launch: '🚀', Technical: '⚙️', Submission: '📤', Kickoff: '🎬',
    Review: '🔍', 'Go-Live': '🎯', Training: '🎓', 'Sign-off': '✍️', Release: '📦', Test: '🧪', UAT: '🧪', SAT: '🧪' };
  var MS_COLOR = { Completed: '#16a34a', 'On Track': '#0d9488', 'At Risk': '#d97706', Delayed: '#dc2626', 'Not Started': '#6b7280', Cancelled: '#9ca3af' };
  var FACES = ['😞', '🙁', '😐', '🙂', '😀'];

  // ---------- small helpers ----------
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function fmtDate(iso) { if (!iso) return '—'; var d = new Date(iso + (iso.length === 10 ? 'T00:00:00Z' : '')); return pad(d.getUTCDate()) + '.' + pad(d.getUTCMonth() + 1) + '.' + d.getUTCFullYear(); }
  function fmtNum(n) { return n == null ? '—' : Math.round(n).toLocaleString('en-US'); }
  function fmtMoney(n) { if (n == null) return '—'; if (n >= 1e6) return '€' + (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M'; if (n >= 1e3) return '€' + Math.round(n / 1e3) + 'k'; return '€' + n; }
  function monthLabel(ym) { var m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; var p = ym.split('-'); return m[+p[1] - 1] + ' ' + p[0]; }
  function daysBetween(a, b) { return Math.round((new Date(b) - new Date(a)) / 864e5); }
  function initials(name) { return (name || '?').replace(/^Dr\.\s*/, '').split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase(); }
  var AV = [['#e7f6ec', '#067647'], ['#fdf3e3', '#b45309'], ['#efeafd', '#6d28d9'], ['#e8f0fc', '#1a4fa0'], ['#fde8ef', '#be185d'], ['#e6f6f5', '#0f766e']];
  function avatar(name) {
    var h = 0; for (var i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    var c = AV[h % AV.length];
    return '<span class="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full text-[8px] font-bold shrink-0" style="background:' + c[0] + ';color:' + c[1] + '">' + initials(name) + '</span>';
  }
  function person(name) { return name ? '<span class="inline-flex items-center gap-1.5 whitespace-nowrap">' + avatar(name) + '<span>' + esc(name) + '</span></span>' : '<span class="text-[#9aa3b2]">—</span>'; }

  // RAG / status pills --------------------------------------------------------
  var PILL = {
    Green: 'bg-[#e7f6ec] text-[#15803d] dark:bg-emerald-900/40 dark:text-emerald-300',
    Yellow: 'bg-[#fdf3e3] text-[#b45309] dark:bg-amber-900/40 dark:text-amber-300',
    Red: 'bg-[#fbe9e9] text-[#dc2626] dark:bg-red-900/40 dark:text-red-300',
    Gray: 'bg-[#eceef1] text-[#4b5563] dark:bg-slate-700 dark:text-slate-300'
  };
  function ragKey(v) { return v === 'Green' || v === 'Yellow' || v === 'Red' ? v : 'Gray'; }
  function displayStatus(p) {
    if (p.status === 'Running') return { label: p.rag.overall === 'Unclear' ? 'Unclear' : p.rag.overall, key: ragKey(p.rag.overall) };
    return { label: p.status, key: 'Gray' };
  }
  function pill(label, key, dot) {
    return '<span class="inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[11px] font-semibold whitespace-nowrap ' + PILL[key] + '">' + (dot ? '<span class="text-[9px] leading-none">●</span>' : '') + esc(label) + '</span>';
  }
  function statusPill(p) { var d = displayStatus(p); return pill(d.label, d.key, true); }
  function ragBadge(v) { return '<span class="inline-block rounded px-1.5 py-[1px] text-[10px] font-bold ' + PILL[ragKey(v)] + '">' + esc(v || 'Unclear') + '</span>'; }
  var RATING_CLS = { Critical: 'bg-[#fbe9e9] text-[#b91c1c]', High: 'bg-[#fdecec] text-[#dc2626]', Medium: 'bg-[#fdf3e3] text-[#b45309]', Low: 'bg-[#e7f6ec] text-[#15803d]' };
  function ratingBadge(r) { return '<span class="inline-block rounded px-1.5 py-[1px] text-[10px] font-bold ' + (RATING_CLS[r] || PILL.Gray) + '">' + esc(r) + '</span>'; }
  var MS_CLS = { Completed: 'text-[#15803d]', 'On Track': 'text-[#0d9488]', 'At Risk': 'text-[#b45309]', Delayed: 'text-[#dc2626]', 'Not Started': 'text-[#6b7280]' };

  // ---------- health scoring (mirrors utils/projectHealth.ts, v1.0.3.3) ----------
  function totalBudget(f) { var b = (f.opexBudget || 0) + (f.capexBudget || 0); return b > 0 ? b : null; }
  function scoresFor(p, now, outputOverride, engOverride) {
    if (p.status === 'Not Started') return [null, null, null, null, null];
    now = now || new Date(DATA.today);
    var s = new Date(p.start), e = new Date(p.end);
    var t = Math.max(0, Math.min(100, (now - s) / (e - s) * 100));
    var f = p.financials, B = totalBudget(f);
    var bu = B ? ((f.opexActual || 0) + (f.capexActual || 0)) / B * 100 : null;
    var o = outputOverride != null ? outputOverride : p.outputPct;
    var g = engOverride != null ? engOverride : p.engagement;
    var sched = o == null ? null : t <= 0 ? 100 : Math.min(100, o / t * 100);
    var cost = o == null || bu == null ? null : bu <= 0 ? 100 : Math.min(100, o / bu * 100);
    var eng = g ? g * 20 : null; // v1.0.3.4: 1-5 smiley -> 20/40/60/80/100
    var risk = B ? Math.max(0, Math.min(100, 100 - (p.riskExposure || 0) / B * 100)) : null;
    return [sched, cost, o == null ? null : o, eng, risk];
  }
  function rawInputs(p) {
    var now = new Date(DATA.today), s = new Date(p.start), e = new Date(p.end), f = p.financials, B = totalBudget(f);
    return { time: Math.max(0, Math.min(100, (now - s) / (e - s) * 100)), budget: B ? ((f.opexActual + f.capexActual) / B * 100) : null,
      output: p.outputPct, eng: p.engagement, exposure: B ? (p.riskExposure || 0) / B * 100 : null };
  }
  function worstScore(sc) {
    if (sc.filter(function (v) { return v != null; }).length < 3) return null;
    var j = sc.filter(function (v, i) { return v != null && i !== OUTPUT_AXIS; });
    return j.length ? Math.min.apply(null, j) : null;
  }
  function band(v) { return v == null ? 'none' : v >= 80 ? 'good' : v >= 60 ? 'watch' : 'act'; }
  var BAND_COLOR = { good: '#16a34a', watch: '#d97706', act: '#dc2626', none: '#9aa3b2' };
  var BAND_TEXT = { good: '✔ On track', watch: '▲ Watch', act: '■ Act', none: 'no data' };
  var BAND_CLS = { good: 'text-[#15803d] font-bold', watch: 'text-[#b45309] font-bold', act: 'text-[#dc2626] font-bold', none: 'text-[#9aa3b2]' };
  function bandLabel(v, axis) {
    if (axis === OUTPUT_AXIS) return { cls: 'none', text: v == null ? 'no data' : Math.round(v) + '% done' };
    var b = band(v); return { cls: b, text: BAND_TEXT[b] };
  }
  function median(all) {
    return AXES.map(function (_, i) {
      var v = all.map(function (s) { return s[i]; }).filter(function (x) { return x != null; }).sort(function (a, b) { return a - b; });
      if (!v.length) return null; var m = Math.floor(v.length / 2); return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
    });
  }

  // ---------- radar SVG ----------
  function pt(i, v, c, r) { var a = -Math.PI / 2 + i * 2 * Math.PI / 5; return [c + Math.cos(a) * r * v / 100, c + Math.sin(a) * r * v / 100]; }
  function poly(sc, c, r) { return sc.map(function (v, i) { var p = pt(i, v == null ? 0 : v, c, r); return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
  function radar(scores, size, opt) {
    opt = opt || {};
    var mini = !!opt.mini, m = mini ? 3 : 62, S = size, c = S / 2, r = S / 2 - (mini ? 3 : 34);
    var enough = scores.filter(function (v) { return v != null; }).length >= 3;
    var out = '<svg viewBox="' + (-m + (mini ? 3 : 0)) + ' ' + (mini ? 0 : -6) + ' ' + (S + 2 * m - (mini ? 6 : 0)) + ' ' + (S + (mini ? 0 : 12)) + '" width="' + (mini ? S : S + 2 * m) + '" height="' + (mini ? S : S + 12) + '" class="block overflow-visible" role="img" aria-label="Project health radar">';
    [25, 50, 75, 100].forEach(function (g) { out += '<polygon points="' + poly([g, g, g, g, g], c, r) + '" fill="' + (g === 100 ? 'rgba(26,79,160,.03)' : 'none') + '" stroke="#d6dbe3" stroke-width="' + (mini ? 0.6 : 1) + '"/>'; });
    for (var i = 0; i < 5; i++) { var q = pt(i, 100, c, r); out += '<line x1="' + c + '" y1="' + c + '" x2="' + q[0].toFixed(1) + '" y2="' + q[1].toFixed(1) + '" stroke="#e1e5eb" stroke-width="' + (mini ? 0.6 : 1) + '"/>'; }
    if (opt.previous && opt.previous.filter(function (v) { return v != null; }).length >= 3) out += '<polygon points="' + poly(opt.previous, c, r) + '" fill="none" stroke="#9aa3b2" stroke-width="1.5" stroke-dasharray="4 3"/>';
    if (enough) {
      out += '<polygon points="' + poly(scores, c, r) + '" fill="rgba(26,79,160,.18)" stroke="' + BRAND + '" stroke-width="' + (mini ? 1.4 : 2) + '" stroke-linejoin="round"/>';
      if (!mini) scores.forEach(function (v, i) { if (v != null) { var p = pt(i, v, c, r); out += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.2" fill="' + BRAND + '"/>'; } });
    }
    if (!mini) {
      AXES.forEach(function (a, i) {
        var p = pt(i, 118, c, r), anchor = Math.abs(p[0] - c) < 4 ? 'middle' : p[0] > c ? 'start' : 'end';
        var v = scores[i], val = v == null ? 'no data' : i === OUTPUT_AXIS ? Math.round(v) + '% done' : Math.round(v);
        out += '<text x="' + p[0].toFixed(1) + '" y="' + (p[1] + (i === 0 ? -6 : 4)).toFixed(1) + '" text-anchor="' + anchor + '" font-size="11" font-weight="600" fill="currentColor">' + a + '</text>';
        out += '<text x="' + p[0].toFixed(1) + '" y="' + (p[1] + (i === 0 ? 7 : 17)).toFixed(1) + '" text-anchor="' + anchor + '" font-size="10.5" fill="' + (v == null ? '#9aa3b2' : i === OUTPUT_AXIS ? '#6b7280' : BAND_COLOR[band(v)]) + '" font-weight="700">' + val + '</text>';
      });
      if (!enough) out += '<text x="' + c + '" y="' + c + '" text-anchor="middle" font-size="12" fill="#6b7280">Not enough data yet</text>';
    }
    return out + '</svg>';
  }
  function healthIcon(p) {
    var sc = scoresFor(p), w = worstScore(sc), b = band(w), col = BAND_COLOR[b];
    var inner = w == null
      ? '<polygon points="' + poly([100, 100, 100, 100, 100], 10, 8.5) + '" fill="none" stroke="#9aa3b2" stroke-width="1.2" stroke-dasharray="2 1.6"/>'
      : '<polygon points="' + poly([100, 100, 100, 100, 100], 10, 8.5) + '" fill="none" stroke="' + col + '" stroke-opacity=".35" stroke-width=".8"/><polygon points="' + poly(sc, 10, 8.5) + '" fill="' + col + '" fill-opacity=".28" stroke="' + col + '" stroke-width="1.3" stroke-linejoin="round"/>';
    return '<span class="inline-flex align-middle ml-1.5 cursor-help rounded focus:outline-none focus:ring-2 focus:ring-[#1a4fa0]/40" tabindex="0" data-health="' + esc(p.number) + '" aria-label="Project health for ' + esc(p.number) + '"><svg width="20" height="20" viewBox="0 0 20 20">' + inner + '</svg></span>';
  }

  // ---------- data ----------
  var DATA, ROOT, OPTS;
  function freshState() { return { page: 'allProjects', project: null, tab: 'overview', portfolios: [], view: 'list', query: '', expanded: {}, zoom: 100,
    reportsOpen: false, userMenuOpen: false, modal: null, overviewTab: 'overview', includeClosed: false, showClosedMyProjects: false, analyticsProject: '', searchQ: 'warehouse', riskCell: null }; }
  var S = freshState();
  function projects() { return DATA.projects; }
  function byNum(n) { return projects().filter(function (p) { return p.number === n; })[0]; }
  function inScope(p) { return !S.portfolios.length || S.portfolios.indexOf(p.portfolio) !== -1; }
  function live(p) { return p.status !== 'Closed'; }
  function isMyProject(p, userName) {
    var u = userName || DATA.currentUser.name;
    return p.lead === u || p.deputy === u || p.sponsor === u;
  }
  function getOwnedPortfolios(userName) {
    var u = userName || DATA.currentUser.name;
    var owned = [];
    if (DATA.portfolioManagers) {
      for (var pf in DATA.portfolioManagers) {
        if (DATA.portfolioManagers[pf] === u) owned.push(pf);
      }
    }
    return owned;
  }
  function isPortfolioManager(userName) {
    return getOwnedPortfolios(userName).length > 0;
  }
  function openRisks(p) { return p.risks.filter(function (r) { return r.status !== 'Resolved' && r.status !== 'Closed'; }); }
  function allMs(list) { var o = []; list.forEach(function (p) { p.milestones.forEach(function (m) { o.push(Object.assign({ p: p }, m)); }); }); return o; }
  function allRisks(list) { var o = []; list.forEach(function (p) { openRisks(p).forEach(function (r) { o.push(Object.assign({ p: p }, r)); }); }); return o; }
  function nextMs(p) { var t = DATA.today; return p.milestones.filter(function (m) { return !m.actual && m.forecast >= t; }).sort(function (a, b) { return a.forecast < b.forecast ? -1 : 1; })[0]; }
  function slip(m) { return daysBetween(m.baseline, m.forecast); }

  // ---------- UI primitives ----------
  var CARD = 'bg-white border border-[#e1e5eb] rounded-lg shadow-[0_1px_2px_rgba(20,30,60,.05)] dark:bg-slate-800 dark:border-slate-700';
  var TH = 'text-left text-[10.5px] font-semibold uppercase tracking-[.06em] text-[#6b7280] dark:text-slate-400 px-3 py-2.5 border-b border-[#e1e5eb] dark:border-slate-700 whitespace-nowrap';
  var TD = 'px-3 py-2.5 border-b border-[#eef1f5] dark:border-slate-700/70 align-middle';
  var EYEBROW = 'flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[.08em] text-[#6b7280] dark:text-slate-400 mb-2.5 mt-5';
  function btn(label, act, extra) { return '<button type="button" data-act="' + act + '" class="inline-flex items-center gap-1 rounded-md border border-[#d5dbe4] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#1f2430] hover:bg-[#f5f8fd] dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 ' + (extra || '') + '">' + label + '</button>'; }
  function pbtn(label, act) { return '<button type="button" data-act="' + act + '" class="inline-flex items-center gap-1 rounded-md bg-[#1a4fa0] hover:bg-[#123a7c] px-2.5 py-1 text-[12px] font-semibold text-white">' + label + '</button>'; }
  function pageTitle(t, sub) { return '<h2 class="text-[17px] font-extrabold text-[#1f2430] dark:text-slate-100 mt-1">' + t + '</h2>' + (sub ? '<div class="text-[12px] text-[#6b7280] dark:text-slate-400 mb-3">' + sub + '</div>' : ''); }
  function bar(parts) { return '<div class="flex h-[5px] rounded-full overflow-hidden bg-[#eceef1] mt-2">' + parts.filter(function (x) { return x[0] > 0; }).map(function (x) { return '<span style="flex:' + x[0] + ';background:' + x[1] + '"></span>'; }).join('<span class="w-[2px] bg-white dark:bg-slate-800"></span>') + '</div>'; }
  function countDot(n, col) { return '<span class="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full text-[11px] font-bold text-white" style="background:' + col + '">' + n + '</span>'; }

  // ---------- chrome ----------
  function renderChrome(inner) {
    var sp = OPTS.chrome !== 'none';
    var h = OPTS.height === 'auto' ? '' : 'height:' + (OPTS.height || 760) + 'px;';
    var personas = DATA.personas || [];
    return '<div style="font-family:-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Roboto,Helvetica,Arial,sans-serif" class="ppm-demo relative text-[13px] leading-[1.45] text-[#1f2430] dark:text-slate-100 rounded-xl overflow-hidden border border-[#d5dbe4] dark:border-slate-700 shadow-[0_10px_28px_rgba(20,30,60,.12)] bg-[#eef2f7] dark:bg-slate-900">' +
      (sp ? '<div class="flex items-center gap-2.5 sm:gap-3 bg-[#0f6cbd] text-white px-3 sm:px-4 h-[42px] text-[13px]"><span class="grid grid-cols-3 gap-[2px] opacity-90 mr-0.5">' + Array(10).join('<i class="block w-[3px] h-[3px] bg-white rounded-[1px]"></i>') + '</span><b class="font-semibold tracking-wide">SharePoint</b><span class="opacity-40">|</span><span class="opacity-90 truncate hidden md:inline">' + esc(DATA.sitePath) + '</span><span class="ml-auto hidden xl:inline rounded bg-white/15 px-2 py-0.5 text-[11px] font-medium">' + esc(DATA.tenant) + '</span>' +
        (personas.length ? '<div class="relative ml-auto xl:ml-0">' +
          '<button type="button" data-act="toggle-user-menu" class="flex items-center gap-2 rounded-full hover:bg-white/15 active:bg-white/25 pl-2.5 pr-1.5 py-1 text-white text-[12px] font-medium transition-colors focus:outline-none" title="Current user: ' + esc(DATA.currentUser.name) + ' (' + esc(DATA.currentUser.role) + ') — Click to switch persona">' +
            '<span class="hidden sm:inline-flex flex-col text-right leading-tight">' +
              '<span class="font-bold text-[12px]">' + esc(DATA.currentUser.name) + '</span>' +
              '<span class="text-[10px] opacity-80 max-w-[180px] truncate">' + esc(DATA.currentUser.role) + '</span>' +
            '</span>' +
            '<span class="w-7 h-7 rounded-full bg-white/20 border border-white/30 inline-flex items-center justify-center text-[11px] font-bold shrink-0">' + esc(DATA.currentUser.initials) + '</span>' +
            '<span class="opacity-75 text-[10px]">▾</span>' +
          '</button>' +
          (S.userMenuOpen ? '<div class="absolute right-0 top-11 z-50 w-[330px] ' + CARD + ' py-2 shadow-2xl text-[#1f2430] dark:text-slate-100" data-stop>' +
            '<div class="px-3.5 pb-2 border-b border-[#eef1f5] dark:border-slate-700">' +
              '<div class="text-[11px] font-bold uppercase tracking-wider text-[#6b7280] dark:text-slate-400">Switch Demo Persona</div>' +
              '<div class="text-[11px] text-[#6b7280] dark:text-slate-400 mt-0.5">Test permissions &amp; portfolio visibility across roles</div>' +
            '</div>' +
            '<div class="py-1 max-h-[360px] overflow-auto">' +
              personas.map(function (p) {
                var active = p.name === DATA.currentUser.name;
                return '<button type="button" data-act="set-persona:' + esc(p.name) + '" class="w-full text-left px-3.5 py-2 flex items-center gap-3 hover:bg-[#f2f6fc] dark:hover:bg-slate-700/60 transition-colors ' + (active ? 'bg-[#e8f0fc] dark:bg-blue-900/30' : '') + '">' +
                  '<span class="w-8 h-8 rounded-full bg-[#1a4fa0] text-white flex items-center justify-center text-[11.5px] font-bold shrink-0">' + esc(p.initials) + '</span>' +
                  '<div class="min-w-0 flex-1 leading-snug">' +
                    '<div class="flex items-center justify-between">' +
                      '<span class="font-bold text-[12.5px] truncate ' + (active ? 'text-[#1a4fa0] dark:text-blue-300' : '') + '">' + esc(p.name) + '</span>' +
                      (active ? '<span class="text-[#1a4fa0] dark:text-blue-300 text-[12px] font-bold">✔</span>' : '') +
                    '</div>' +
                    '<div class="text-[11px] text-[#4b5563] dark:text-slate-300 truncate">' + esc(p.role) + '</div>' +
                    '<div class="text-[10.5px] text-[#1a4fa0] dark:text-blue-400 font-medium truncate mt-0.5">' + esc(p.label) + '</div>' +
                  '</div>' +
                '</button>';
              }).join('') +
            '</div>' +
          '</div>' : '') +
        '</div>' : '<span class="w-7 h-7 rounded-full bg-white/20 inline-flex items-center justify-center text-[11px] font-bold shrink-0">' + esc(DATA.currentUser.initials) + '</span>') +
      '</div>' : '') +
      '<div class="ppm-scroll overflow-auto" style="' + h + '"><div class="px-4 sm:px-5 pb-8" style="zoom:' + (S.zoom / 100) + '">' + inner + '</div></div>' +
      renderPopoverHost() + (S.modal ? renderModal() : '') + '<div data-toast class="pointer-events-none absolute left-1/2 bottom-5 -translate-x-1/2 rounded-md bg-[#1f2430] text-white text-[12px] px-3 py-2 shadow-lg opacity-0 transition-opacity"></div></div>';
  }
  function navBtn(page, label) {
    var on = S.page === page || (page === 'allProjects' && S.page === 'project');
    return '<button type="button" data-act="go:' + page + '" class="px-2 py-3 text-[12.5px] font-semibold border-b-2 ' + (on ? 'text-[#1a4fa0] border-[#1a4fa0] dark:text-blue-300 dark:border-blue-300' : 'text-[#4b5563] border-transparent hover:text-[#1a4fa0] dark:text-slate-300') + '">' + label + '</button>';
  }
  function renderTopNav() {
    var rep = [['milestones', 'All Milestones'], ['risks', 'All Risks &amp; Issues'], ['analytics', 'Analytics'], ['heatmap', 'Heatmap']];
    var isPfMgr = isPortfolioManager();
    return '<div class="flex flex-wrap items-center gap-x-2 border-b border-[#dfe4ec] dark:border-slate-700 mb-3">' +
      '<span class="w-[26px] h-[26px] rounded-full bg-[#d7dce4] dark:bg-slate-600 inline-flex items-end justify-center overflow-hidden mr-1"><svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="9" r="4.5" fill="#fff"/><path d="M3 23c1-5 5-7.5 9-7.5s8 2.5 9 7.5z" fill="#fff"/></svg></span>' +
      navBtn('myProjects', 'My Projects') + (isPfMgr ? navBtn('myPortfolio', 'My Portfolio') : '') + navBtn('search', 'Search') + navBtn('allProjects', 'All Projects') +
      '<div class="ml-auto flex items-center gap-2 py-2">' +
      '<button type="button" data-act="toast:New Project opens the project form (Portfolio Owners, Deputies and the PPM team)." class="rounded-md bg-[#1a4fa0] hover:bg-[#123a7c] text-white text-[12px] font-semibold px-2.5 py-1">+ New Project</button>' +
      '<span class="hidden sm:inline-flex rounded-md border border-[#d5dbe4] dark:border-slate-600 overflow-hidden text-[11.5px] font-semibold bg-white dark:bg-slate-800"><button data-act="zoom:-10" class="px-2 py-0.5">A−</button><button data-act="zoom:0" class="px-2 py-0.5 border-x border-[#d5dbe4] dark:border-slate-600 text-[#6b7280]">' + S.zoom + '%</button><button data-act="zoom:10" class="px-2 py-0.5">A+</button></span>' +
      '<span class="relative"><button type="button" data-act="reports" title="Reports" class="px-1.5 py-0.5 rounded hover:bg-white/70 ' + (['milestones', 'risks', 'analytics', 'heatmap'].indexOf(S.page) !== -1 ? 'bg-white dark:bg-slate-800 shadow-sm' : '') + '"><svg width="16" height="16" viewBox="0 0 16 16"><rect x="1.5" y="8" width="3" height="6.5" rx=".6" fill="#16a34a"/><rect x="6.5" y="4.5" width="3" height="10" rx=".6" fill="#1a4fa0"/><rect x="11.5" y="1.5" width="3" height="13" rx=".6" fill="#d97706"/></svg></button>' +
      (S.reportsOpen ? '<div class="absolute right-0 top-8 z-30 w-[200px] ' + CARD + ' py-1 shadow-lg">' + rep.map(function (r) { return '<button type="button" data-act="go:' + r[0] + '" class="block w-full text-left px-3 py-1.5 text-[12.5px] hover:bg-[#f5f8fd] dark:hover:bg-slate-700">' + r[1] + '</button>'; }).join('') + '<div class="border-t border-[#e1e5eb] dark:border-slate-700 my-1"></div><button data-act="toast:Export All creates one PowerPoint slide per project for the selected portfolios." class="block w-full text-left px-3 py-1.5 text-[12.5px] hover:bg-[#f5f8fd] dark:hover:bg-slate-700">▤ Export All (PPTX)</button></div>' : '') + '</span>' +
      '<button data-act="toast:Full screen hides the SharePoint page chrome." class="text-[#6b7280] px-1" title="Full screen">⤢</button><button data-act="about" class="text-[#6b7280] hover:text-[#1a4fa0] px-1 transition-colors" title="About &amp; Release Notes (v1.0.3.9)">ⓘ</button>' +
      '<b class="text-[13px] whitespace-nowrap">' + esc(DATA.appName) + '</b></div></div>';
  }
  function renderPortfolioBar(note, allowedList) {
    var list = allowedList || DATA.portfolios;
    var activeInList = S.portfolios.filter(function (pf) { return list.indexOf(pf) !== -1; });
    var all = !activeInList.length || activeInList.length === list.length;
    return '<div class="' + CARD + ' px-4 py-2.5 mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5"><span class="text-[10.5px] font-semibold uppercase tracking-[.08em] text-[#6b7280]">Portfolios:</span>' +
      '<label class="inline-flex items-center gap-1.5 text-[12.5px] cursor-pointer"><input type="checkbox" data-act="pf:*" ' + (all ? 'checked' : '') + ' class="accent-[#1a4fa0] w-3.5 h-3.5">All</label>' +
      list.map(function (pf) { return '<label class="inline-flex items-center gap-1.5 text-[12.5px] cursor-pointer"><input type="checkbox" data-act="pf:' + esc(pf) + '" ' + (S.portfolios.indexOf(pf) !== -1 ? 'checked' : '') + ' class="accent-[#1a4fa0] w-3.5 h-3.5">' + esc(pf) + '</label>'; }).join('') +
      (note ? '<div class="basis-full text-[11.5px] text-[#6b7280]">' + note + '</div>' : '') + '</div>';
  }

  // ---------- All Projects ----------
  function renderAllProjects() {
    var list = projects().filter(inScope);
    var q = S.query.toLowerCase();
    var run = list.filter(function (p) { return p.status === 'Running'; });
    var cnt = function (st) { return list.filter(function (p) { return p.status === st; }).length; };
    var rc = function (c) { return run.filter(function (p) { return p.rag.overall === c; }).length; };
    var shown = list.filter(function (p) { return p.status !== 'Closed' && (!q || (p.number + ' ' + p.name + ' ' + p.lead + ' ' + p.sponsor + ' ' + p.phase).toLowerCase().indexOf(q) !== -1); });
    var h = renderPortfolioBar() +
      '<div class="flex flex-wrap items-center gap-2.5 mb-3"><div class="mr-2 text-center leading-none"><div class="text-[30px] font-extrabold">' + list.length + '</div><div class="text-[9px] font-semibold tracking-[.1em] text-[#6b7280] mt-0.5">TOTAL</div></div>' +
      '<span class="inline-flex items-center gap-2 rounded-full border border-[#b9cbe9] bg-[#e8f0fc] dark:bg-blue-900/30 dark:border-blue-800 px-3 py-1.5 text-[12.5px] font-semibold text-[#1a4fa0] dark:text-blue-300">' + run.length + ' Running ' + countDot(rc('Green'), '#16a34a') + countDot(rc('Yellow'), '#d97706') + countDot(rc('Red'), '#dc2626') + '</span>' +
      ['Not Started', 'On Hold', 'Closed'].map(function (st) { return '<span class="rounded-full bg-[#e4e8ee] dark:bg-slate-700 px-3 py-1.5 text-[12.5px] font-semibold ' + (st === 'Closed' ? 'text-[#9aa3b2]' : 'text-[#4b5563] dark:text-slate-300') + '">' + cnt(st) + ' ' + st + '</span>'; }).join('') + '</div>' +
      '<div class="' + CARD + ' p-3 mb-3 flex flex-wrap items-center gap-2"><label class="relative flex-1 min-w-[220px] max-w-[380px]"><span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9aa3b2] text-[12px]">🔍</span><input data-input="query" value="' + esc(S.query) + '" placeholder="Search project #, name, phase, sponsor, lead, or ERP #…" class="w-full rounded-md border border-[#d5dbe4] dark:border-slate-600 dark:bg-slate-900 pl-8 pr-2 py-1.5 text-[12.5px] outline-none focus:border-[#1a4fa0]"></label>' +
      btn('Type (3) ▾', 'toast:Filter by project type (PRO, ORG, RES).', 'rounded-full') + btn('Status (4) ▾', 'toast:Filter by status.', 'rounded-full') + btn('⭐ Presets ▾', 'toast:Saved filter presets per user.', 'rounded-full') + btn('Columns (2) ▾', 'toast:Choose columns — your choice is saved to your profile.', 'rounded-full') +
      '<span class="ml-auto inline-flex rounded-md border border-[#d5dbe4] dark:border-slate-600 overflow-hidden text-[12px] font-semibold"><button data-act="view:list" class="px-3 py-1.5 ' + (S.view === 'list' ? 'bg-[#1a4fa0] text-white' : 'bg-white dark:bg-slate-800') + '">≡ List</button><button data-act="view:card" class="px-3 py-1.5 ' + (S.view === 'card' ? 'bg-[#1a4fa0] text-white' : 'bg-white dark:bg-slate-800 text-[#4b5563]') + '">▦ Card</button></span></div>';
    if (S.view === 'card') {
      h += '<div class="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">' + shown.map(function (p) {
        var ms = nextMs(p);
        return '<div data-act="open:' + p.number + '" class="' + CARD + ' p-4 cursor-pointer hover:shadow-[0_4px_16px_rgba(20,30,60,.08)] transition-shadow"><div class="flex items-center justify-between mb-1.5"><span class="font-mono text-[11px] text-[#6b7280]">' + p.number + '</span><span class="inline-flex items-center">' + statusPill(p) + healthIcon(p) + '</span></div>' +
          '<div class="font-bold text-[13.5px] leading-snug mb-1">' + esc(p.name) + '</div><div class="text-[11.5px] text-[#6b7280] mb-3">' + esc(p.portfolio) + ' · ' + esc(p.phase) + '</div>' +
          '<div class="grid grid-cols-4 gap-1.5 mb-3">' + ['timeline', 'budget', 'resources', 'scope'].map(function (k) { return '<div class="text-center rounded px-1 py-1 ' + PILL[ragKey(p.rag[k])] + '"><div class="text-[8.5px] font-bold tracking-wider uppercase opacity-80">' + (k === 'scope' ? 'Scope' : k) + '</div><div class="text-[11px] font-bold">' + esc(p.rag[k]) + '</div></div>'; }).join('') + '</div>' +
          '<div class="flex items-center justify-between text-[11.5px]">' + person(p.lead) + '<span class="text-[#6b7280]">' + (ms ? 'Next: ' + esc(ms.name) + ' · ' + fmtDate(ms.forecast) : 'No open milestones') + '</span></div></div>';
      }).join('') + '</div>';
    } else {
      h += '<div class="' + CARD + ' overflow-x-auto"><table class="w-full border-collapse text-[12.5px]"><thead><tr><th class="' + TH + ' w-6"></th><th class="' + TH + '">Status</th><th class="' + TH + '">Project #</th><th class="' + TH + '">Project Name</th><th class="' + TH + '">Portfolio</th><th class="' + TH + '">Phase</th><th class="' + TH + '">Priority</th><th class="' + TH + '">Lead</th></tr></thead><tbody>' +
        shown.map(function (p, i) {
          var ex = S.expanded[p.number];
          return '<tr data-act="open:' + p.number + '" class="cursor-pointer ' + (i % 2 ? 'bg-[#fafbfd] dark:bg-slate-800/60' : '') + ' hover:bg-[#f2f6fc] dark:hover:bg-slate-700/60"><td class="' + TD + ' text-[#9aa3b2] text-[10px]"><button data-act="expand:' + p.number + '" class="px-1">' + (ex ? '▾' : '▸') + '</button></td><td class="' + TD + ' whitespace-nowrap">' + statusPill(p) + healthIcon(p) + '</td><td class="' + TD + ' font-mono text-[11.5px] text-[#4b5563] dark:text-slate-400">' + p.number + '</td><td class="' + TD + ' font-bold">' + esc(p.name) + '</td><td class="' + TD + ' text-[#4b5563] dark:text-slate-300">' + esc(p.portfolio) + '</td><td class="' + TD + '">' + esc(p.phase) + '</td><td class="' + TD + '">' + esc(p.priority) + '</td><td class="' + TD + '">' + person(p.lead) + '</td></tr>' +
            (ex ? '<tr class="bg-[#f7f9fc] dark:bg-slate-800"><td></td><td colspan="7" class="px-3 py-3 border-b border-[#eef1f5] dark:border-slate-700"><div class="flex flex-wrap gap-6 text-[12px]"><div><div class="text-[10px] uppercase tracking-wider text-[#6b7280] mb-1">RAG</div><div class="flex gap-1.5">' + ['timeline', 'budget', 'resources', 'scope'].map(function (k) { return '<span class="text-[10px] text-[#6b7280] uppercase">' + k.slice(0, 5) + '</span>' + ragBadge(p.rag[k]); }).join('') + '</div></div><div><div class="text-[10px] uppercase tracking-wider text-[#6b7280] mb-1">Sponsor</div>' + esc(p.sponsor) + '</div><div><div class="text-[10px] uppercase tracking-wider text-[#6b7280] mb-1">Dates</div>' + fmtDate(p.start) + ' → ' + fmtDate(p.end) + '</div><div><div class="text-[10px] uppercase tracking-wider text-[#6b7280] mb-1">ERP #</div>' + esc(p.erp) + '</div></div></td></tr>' : '');
        }).join('') + '</tbody></table></div>';
    }
    return h;
  }

  // ---------- tiles (My Projects / My Portfolio) ----------
  function tiles(list) {
    var run = list.filter(function (p) { return p.status === 'Running'; });
    var rc = function (c) { return run.filter(function (p) { return p.rag.overall === c; }).length; };
    var ms = allMs(list.filter(live)).filter(function (m) { return !m.actual; });
    var del = ms.filter(function (m) { return m.status === 'Delayed'; }).length, ar = ms.filter(function (m) { return m.status === 'At Risk'; }).length, ot = ms.length - del - ar;
    var otPct = ms.length ? Math.round(ot / ms.length * 100) : 0;
    var fin = list.filter(function (p) { return live(p) && totalBudget(p.financials) && p.status !== 'Not Started'; });
    var B = fin.reduce(function (s, p) { return s + totalBudget(p.financials); }, 0), A = fin.reduce(function (s, p) { return s + p.financials.opexActual + p.financials.capexActual; }, 0);
    var burn = B ? Math.round(A / B * 100) : 0;
    var blockers = allRisks(list.filter(live)).filter(function (r) { return r.rating === 'Critical' || r.rating === 'High'; }).length;
    var due = list.filter(function (p) { return p.status === 'Running'; }), sub = due.filter(function (p) { return p.statusHistory[0] && p.statusHistory[0].submitted; }).length;
    var t30 = new Date(DATA.today); t30.setUTCDate(t30.getUTCDate() + 30); var up = ms.filter(function (m) { return m.forecast >= DATA.today && new Date(m.forecast) <= t30; }).length;
    var tile = function (title, body) { return '<div class="' + CARD + ' px-4 py-3"><div class="text-[10.5px] font-semibold uppercase tracking-[.08em] text-[#6b7280] mb-1.5">' + title + '</div>' + body + '</div>'; };
    return '<div class="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 mb-3">' +
      tile('RAG Health', '<div class="flex items-center gap-2"><span class="text-[20px] font-extrabold mr-1">' + run.length + '</span>' + countDot(rc('Green'), '#16a34a').replace('min-w-[22px] h-[22px]', 'min-w-[26px] h-[26px]') + countDot(rc('Yellow'), '#d97706').replace('min-w-[22px] h-[22px]', 'min-w-[26px] h-[26px]') + countDot(rc('Red'), '#dc2626').replace('min-w-[22px] h-[22px]', 'min-w-[26px] h-[26px]') + '</div>' + bar([[rc('Green'), '#16a34a'], [rc('Yellow'), '#d97706'], [rc('Red'), '#dc2626']])) +
      tile('On-Time Health', '<div class="text-[20px] font-extrabold ' + (otPct >= 80 ? 'text-[#16a34a]' : otPct >= 60 ? 'text-[#d97706]' : 'text-[#dc2626]') + '">' + otPct + '% on track</div><div class="text-[10.5px] text-[#6b7280]">' + del + ' Delayed · ' + ar + ' At Risk · ' + ot + ' On Track</div>' + bar([[del, '#dc2626'], [ar, '#d97706'], [ot, '#16a34a']])) +
      tile('Financial Burn', '<div class="text-[20px] font-extrabold">' + burn + '%</div><div class="text-[10.5px] text-[#6b7280]">' + fin.length + ' of ' + list.filter(live).length + ' projects have Finance data · ' + fmtMoney(A) + ' of ' + fmtMoney(B) + '</div>' + bar([[burn, '#16a34a'], [Math.max(0, 100 - burn), '#6b7280']])) +
      tile('Active Blockers', '<div class="text-[20px] font-extrabold ' + (blockers ? 'text-[#dc2626]' : '') + '">' + blockers + '</div><div class="text-[10.5px] text-[#6b7280]">open High/Critical risks &amp; issues</div>') +
      '</div><div class="grid gap-3 grid-cols-1 sm:grid-cols-2 mb-3">' +
      tile('Reporting Compliance', '<div class="text-[16px] font-bold">' + sub + ' of ' + due.length + ' <span class="text-[12px] font-normal text-[#6b7280]">September reports submitted</span></div>') +
      tile('Upcoming Milestones (next 30 days)', '<div class="text-[16px] font-bold">' + up + '</div>') + '</div>';
  }
  function renderMyProjects() {
    var me = DATA.currentUser.name;
    var list = projects().filter(function (p) { return isMyProject(p, me) && inScope(p) && (S.showClosedMyProjects ? true : live(p)); });
    var closedCount = projects().filter(function (p) { return isMyProject(p, me) && !live(p); }).length;
    var h = renderPortfolioBar() + pageTitle('My Projects', 'Projects where you are Sponsor, Project Leader, or Deputy.') + tiles(list);
    h += '<div class="' + CARD + ' overflow-x-auto p-3"><div class="flex flex-wrap justify-between items-center gap-2 mb-2"><span class="text-[12px] text-[#6b7280] font-semibold">' + list.length + ' project' + (list.length === 1 ? '' : 's') + ' assigned to ' + esc(me) + '</span><label class="inline-flex items-center gap-1.5 text-[12px] text-[#6b7280] cursor-pointer"><input type="checkbox" data-act="toggle-closed-my" ' + (S.showClosedMyProjects ? 'checked' : '') + ' class="accent-[#1a4fa0]">Show closed projects (' + closedCount + ')</label></div><table class="w-full border-collapse text-[12.5px]"><thead><tr>' +
      ['Status', 'Project #', 'Project Name', 'Portfolio', 'Phase', 'Sponsor', 'Lead', 'Deputy', 'Reporting'].map(function (t) { return '<th class="' + TH + '">' + t + '</th>'; }).join('') + '</tr></thead><tbody>' +
      (list.length ? list.map(function (p) {
        var last = p.statusHistory[0];
        var rep = p.status === 'Not Started' ? '<span class="text-[#9aa3b2]">—</span>' : last && last.submitted ? '<span class="text-[#15803d] text-[11.5px]">✔ Submitted ' + fmtDate(last.submitted) + '</span>' : '<button data-act="toast:Opens the Status Report wizard for this month." class="inline-flex items-center gap-1 rounded border border-[#f59e0b] bg-[#fffaf0] text-[#b45309] px-2 py-0.5 text-[11px] font-semibold">⏰ Overdue — Start Status Report</button>';
        var mine = function (n) { return n === me ? '<b class="text-[#1a4fa0] dark:text-blue-300">' + esc(n) + '</b> <span class="text-[#1a4fa0] dark:text-blue-300 text-[8px]">●</span>' : esc(n); };
        return '<tr data-act="open:' + p.number + '" class="cursor-pointer hover:bg-[#f2f6fc] dark:hover:bg-slate-700/60"><td class="' + TD + ' whitespace-nowrap">' + ragBadge(p.status === 'Running' ? p.rag.overall : p.status) + healthIcon(p) + '</td><td class="' + TD + ' font-bold">' + p.number + '</td><td class="' + TD + '">' + esc(p.name) + '</td><td class="' + TD + ' text-[#4b5563] dark:text-slate-300">' + esc(p.portfolio) + '</td><td class="' + TD + '">' + p.type + ' - ' + esc(p.phase) + '</td><td class="' + TD + '"><span class="inline-flex items-center gap-1.5">' + avatar(p.sponsor) + mine(p.sponsor) + '</span></td><td class="' + TD + '"><span class="inline-flex items-center gap-1.5">' + avatar(p.lead) + mine(p.lead) + '</span></td><td class="' + TD + '">' + (p.deputy ? '<span class="inline-flex items-center gap-1.5">' + avatar(p.deputy) + mine(p.deputy) + '</span>' : '—') + '</td><td class="' + TD + '">' + rep + '</td></tr>';
      }).join('') : '<tr><td colspan="9" class="p-6 text-center text-[#6b7280]">No projects found where you are Project Leader, Deputy, or Sponsor in the selected filter.</td></tr>') + '</tbody></table></div>';
    return h;
  }
  function renderMyPortfolio() {
    var owned = getOwnedPortfolios();
    if (!owned.length) {
      return pageTitle('My Portfolio', 'Portfolio Manager view') + '<div class="' + CARD + ' p-8 text-center text-[#6b7280]">You do not own any portfolios. My Portfolio is only available for Portfolio Managers.</div>';
    }
    var list = projects().filter(function (p) {
      if (owned.indexOf(p.portfolio) === -1) return false;
      var activeOwned = S.portfolios.filter(function (pf) { return owned.indexOf(pf) !== -1; });
      if (activeOwned.length && activeOwned.indexOf(p.portfolio) === -1) return false;
      return live(p);
    });
    var h = pageTitle('My Portfolio', 'Your owned portfolio' + (owned.length > 1 ? 's' : '') + ' (' + owned.join(', ') + ') at a glance — click any tile or card below to see what’s behind the number.') +
      renderPortfolioBar('Showing only portfolios you own as Portfolio Manager.', owned) +
      tiles(list);
    h += '<div class="' + CARD + ' overflow-x-auto p-3"><div class="font-bold text-[13px] mb-1">Projects in scope (' + list.length + ')</div><table class="w-full border-collapse text-[12.5px]"><thead><tr>' +
      ['Project', 'Portfolio', 'RAG', 'Phase', 'Next Milestone', 'Burn %', 'Blockers', 'PL'].map(function (t) { return '<th class="' + TH + '">' + t + '</th>'; }).join('') + '</tr></thead><tbody>' +
      (list.length ? list.map(function (p) {
        var ms = nextMs(p), B = totalBudget(p.financials), burn = B && p.status !== 'Not Started' ? Math.round((p.financials.opexActual + p.financials.capexActual) / B * 100) : null;
        var bl = openRisks(p).filter(function (r) { return r.rating === 'Critical' || r.rating === 'High'; }).length;
        return '<tr class="hover:bg-[#f2f6fc] dark:hover:bg-slate-700/60"><td class="' + TD + '"><a href="#" data-act="open:' + p.number + '" class="font-semibold text-[#1a4fa0] dark:text-blue-300 hover:underline">' + p.number + ' — ' + esc(p.name) + '</a></td><td class="' + TD + ' text-[#4b5563] dark:text-slate-300">' + esc(p.portfolio) + '</td><td class="' + TD + ' whitespace-nowrap">' + ragBadge(p.status === 'Running' ? p.rag.overall : p.status) + healthIcon(p) + '</td><td class="' + TD + '">' + esc(p.phase) + '</td><td class="' + TD + '">' + (ms ? esc(ms.name) + ' (' + fmtDate(ms.forecast) + ')' : '—') + '</td><td class="' + TD + ' ' + (burn > 85 ? 'text-[#dc2626] font-semibold' : '') + '">' + (burn == null ? '—' : burn + '%') + '</td><td class="' + TD + ' ' + (bl ? 'font-semibold' : '') + '">' + bl + '</td><td class="' + TD + '">' + esc(p.lead) + '</td></tr>';
      }).join('') : '<tr><td colspan="8" class="p-6 text-center text-[#6b7280]">No projects found in the selected portfolio filter.</td></tr>') + '</tbody></table></div>';
    return h;
  }

  // ---------- Search ----------
  function renderSearch() {
    var q = S.searchQ.toLowerCase(), list = projects();
    var mp = q.length < 3 ? [] : list.filter(function (p) { return (p.number + ' ' + p.name).toLowerCase().indexOf(q) !== -1; });
    var mm = q.length < 3 ? [] : allMs(list).filter(function (m) { return (m.name + ' ' + m.p.name).toLowerCase().indexOf(q) !== -1; });
    var mr = q.length < 3 ? [] : allRisks(list).filter(function (r) { return (r.description + ' ' + r.p.name).toLowerCase().indexOf(q) !== -1; });
    var sec = function (title, n, rows) { return '<div class="' + CARD + ' mb-3"><div class="px-4 py-2 border-b border-[#e1e5eb] dark:border-slate-700 font-bold text-[12.5px]">' + title + ' <span class="text-[#6b7280] font-normal">(' + n + ')</span></div>' + (rows || '<div class="px-4 py-3 text-[#9aa3b2] text-[12px]">No matches.</div>') + '</div>'; };
    var row = function (act, a, b, c) { return '<button data-act="' + act + '" class="flex w-full items-center gap-3 px-4 py-2 text-left border-b border-[#eef1f5] dark:border-slate-700 last:border-0 hover:bg-[#f2f6fc] dark:hover:bg-slate-700/60">' + a + '<span class="font-semibold">' + b + '</span><span class="ml-auto text-[11.5px] text-[#6b7280]">' + c + '</span></button>'; };
    return pageTitle('Search', 'One search across projects, milestones, risks &amp; issues and change requests.') +
      '<div class="' + CARD + ' p-3 mb-3"><input data-input="searchQ" value="' + esc(S.searchQ) + '" placeholder="Type at least 3 characters…" class="w-full rounded-md border border-[#d5dbe4] dark:border-slate-600 dark:bg-slate-900 px-3 py-2 text-[13px] outline-none focus:border-[#1a4fa0]"><div class="flex flex-wrap gap-4 mt-2 text-[12px]">' + ['Projects', 'Milestones', 'Risks &amp; Issues', 'Change Requests'].map(function (t) { return '<label class="inline-flex items-center gap-1.5"><input type="checkbox" checked class="accent-[#1a4fa0]">' + t + '</label>'; }).join('') + '<label class="inline-flex items-center gap-1.5 text-[#6b7280]"><input type="checkbox" class="accent-[#1a4fa0]">Include closed projects</label></div><div class="text-[11.5px] text-[#6b7280] mt-2">' + (mp.length + mm.length + mr.length) + ' results across 4 of 4 sources</div></div>' +
      sec('Projects', mp.length, mp.map(function (p) { return row('open:' + p.number, statusPill(p) + healthIcon(p), p.number + ' — ' + esc(p.name), esc(p.phase)); }).join('')) +
      sec('Milestones', mm.length, mm.slice(0, 8).map(function (m) { return row('open:' + m.p.number + ':milestones', '<span>' + (MS_ICON[m.type] || '🏁') + '</span>', esc(m.name), m.p.number + ' · ' + fmtDate(m.forecast) + ' · <span class="' + (MS_CLS[m.status] || '') + '">' + m.status + '</span>'); }).join('')) +
      sec('Risks &amp; Issues', mr.length, mr.slice(0, 8).map(function (r) { return row('open:' + r.p.number + ':risks', ratingBadge(r.rating), esc(r.description), r.p.number + ' · ' + r.type); }).join(''));
  }

  // ---------- Project detail ----------
  var TABS = [['overview', 'Overview'], ['history', 'Status History'], ['milestones', 'Milestones'], ['crs', 'Change Requests'], ['decisions', 'Decisions'], ['risks', 'Risks &amp; Issues'], ['financials', 'Financials'], ['team', 'Team']];
  function ragBox(label, v) { return '<div class="rounded-md px-2.5 py-1 text-center min-w-[74px] ' + PILL[ragKey(v)] + '"><div class="text-[8.5px] font-bold tracking-[.08em] uppercase opacity-80">' + label + '</div><div class="text-[12.5px] font-bold">' + esc(v) + '</div></div>'; }
  function chip(t) { return '<span class="rounded bg-[#eceef1] dark:bg-slate-700 text-[#4b5563] dark:text-slate-300 px-1.5 py-[1px] text-[10.5px] font-medium">' + t + '</span>'; }
  function renderProject() {
    var p = byNum(S.project) || projects()[0];
    var last = p.statusHistory.filter(function (h) { return h.submitted; })[0];
    var sorted = p.milestones.slice().sort(function (a, b) { return a.baseline < b.baseline ? -1 : 1; });
    var h = '<div class="flex items-center justify-between my-2"><a href="#" data-act="go:allProjects" class="text-[12.5px] font-semibold text-[#1a4fa0] dark:text-blue-300">← Back to Portfolio</a><div class="flex gap-2">' + btn('▤ Export ▾', 'toast:Export this project as a one-page PDF, a PowerPoint slide or a full Excel workbook.', 'border-[#1a4fa0] text-[#1a4fa0]') + btn('✎ Edit Project', 'toast:Edit Project is enabled only when your SharePoint access allows saving.', 'border-[#1a4fa0] text-[#1a4fa0]') + '</div></div>';
    h += '<div class="' + CARD + ' px-4 py-3.5"><div class="flex flex-wrap justify-between gap-4"><div><div class="flex items-center gap-2"><span class="text-[10px] text-[#6b7280] border border-[#d5dbe4] rounded px-1">▾</span><div class="text-[17px] font-extrabold">' + p.number + ' — ' + esc(p.name) + '</div></div><div class="flex flex-wrap gap-1.5 mt-1.5">' + chip(p.type) + chip('Phase: ' + p.type + ' - ' + esc(p.phase)) + chip('ERP #: ' + esc(p.erp)) + chip('Last Status Update: ' + (last ? fmtDate(last.submitted) : '—')) + '</div></div>' +
      '<div class="flex flex-wrap gap-2">' + ragBox('Timeline', p.rag.timeline) + ragBox('Budget', p.rag.budget) + ragBox('Resources', p.rag.resources) + ragBox('Scope/Qual.', p.rag.scope) + '</div></div>' +
      '<div class="grid gap-3 mt-3.5 pt-3.5 border-t border-[#eef1f5] dark:border-slate-700 grid-cols-2 md:grid-cols-[minmax(110px,1fr)_minmax(110px,1fr)_minmax(80px,.7fr)_minmax(230px,1.7fr)_auto]">' +
      meta('Project Leader', esc(p.lead) + (p.deputy ? '<div class="text-[10.5px] text-[#6b7280] font-normal">Deputy: ' + esc(p.deputy) + '</div>' : '')) + meta('Sponsor', esc(p.sponsor) + '<div class="text-[10.5px] text-[#6b7280] font-normal">' + esc(p.sponsorTitle) + '</div>') + meta('Priority', esc(p.priority)) +
      meta('Dates', '<div class="flex items-start gap-3"><div>' + fmtDate(p.start) + '<div class="text-[10px] text-[#6b7280] font-normal">(first MS: ' + fmtDate(sorted[0].forecast) + ')</div></div><span class="text-[#6b7280]">→</span><div>' + fmtDate(p.end) + '<div class="text-[10px] text-[#6b7280] font-normal">(last MS: ' + fmtDate(sorted[sorted.length - 1].forecast) + ')</div></div></div>') +
      '<div class="justify-self-end"><div class="text-[10px] font-semibold uppercase tracking-[.08em] text-[#6b7280] text-right">Health</div><button data-act="healthmodal" title="Project Health Radar: click to enlarge" class="block mt-0.5 rounded-md border border-transparent hover:border-[#c7d3e8] hover:bg-[#f5f8fd] cursor-zoom-in text-[#1f2430]">' + radar(scoresFor(p), 52, { mini: true }) + '</button></div></div></div>';
    if (p.status === 'Closed') h += '<div class="mt-3 rounded-md border border-[#d5dbe4] bg-[#eceef1] px-3 py-2 text-[12px]">🔒 This project is Closed. Milestones, Risks &amp; Issues, Change Requests, Status Reports, Team and Quick Links are locked for everyone.</div>';
    if (p.status === 'On Hold') h += '<div class="mt-3 rounded-md border border-[#f59e0b] bg-[#fffaf0] px-3 py-2 text-[12px] text-[#92400e]">⏸️ This project is On Hold. Nothing is locked — this is a reminder that RAG status and milestone dates may not reflect active progress right now.</div>';
    h += '<div data-tabs class="flex items-center border-b border-[#dfe4ec] dark:border-slate-700 mt-4 overflow-x-auto">' + TABS.map(function (t) { var on = S.tab === t[0]; return '<button data-act="tab:' + t[0] + '" class="px-3 py-2.5 text-[12.5px] whitespace-nowrap border-b-2 ' + (on ? 'border-[#1a4fa0] text-[#1a4fa0] font-semibold dark:text-blue-300 dark:border-blue-300' : 'border-transparent text-[#4b5563] dark:text-slate-300 hover:text-[#1a4fa0]') + '">' + t[1] + '</button>'; }).join('') + '<span class="ml-auto pl-2">' + btn('🔗 Share', 'toast:Copies a link that opens this project and tab directly.') + '</span></div>';
    h += ({ overview: tabOverview, history: tabHistory, milestones: tabMilestones, crs: tabCrs, decisions: tabDecisions, risks: tabRisks, financials: tabFinancials, team: tabTeam }[S.tab] || tabOverview)(p);
    return h;
  }
  function meta(l, v) { return '<div><div class="text-[10px] font-semibold uppercase tracking-[.08em] text-[#6b7280] mb-0.5">' + l + '</div><div class="font-bold text-[12.5px]">' + v + '</div></div>'; }
  function projectImage(p) {
    var hues = { 'IT & Infrastructure': ['#1a4fa0', '#4f86d9'], 'Operations & Supply Chain': ['#0d9488', '#5cc8bc'], 'Product Engineering': ['#7c3aed', '#b39af2'], 'Customer & Digital': ['#d97706', '#f5b453'], 'Finance & Corporate': ['#15803d', '#6fcf8e'] }[p.portfolio] || ['#1a4fa0', '#4f86d9'];
    return '<svg viewBox="0 0 320 170" class="w-full h-full rounded-md" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g' + p.id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + hues[0] + '"/><stop offset="1" stop-color="' + hues[1] + '"/></linearGradient></defs><rect width="320" height="170" fill="url(#g' + p.id + ')"/>' +
      '<g fill="#fff" fill-opacity=".14"><circle cx="270" cy="30" r="70"/><circle cx="40" cy="160" r="60"/></g><g stroke="#fff" stroke-opacity=".55" stroke-width="2" fill="none"><path d="M150 120 L190 96 L220 104 L250 70 L275 78 L300 52"/></g><g fill="#fff">' + [[150, 120], [190, 96], [220, 104], [250, 70], [275, 78], [300, 52]].map(function (q) { return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="4"/>'; }).join('') + '</g><text x="22" y="112" fill="#fff" font-size="16" font-weight="700" font-family="inherit">' + esc(p.number) + '</text><text x="22" y="130" fill="#fff" fill-opacity=".9" font-size="11" font-family="inherit">' + esc(p.portfolio) + '</text></svg>';
  }
  function tabOverview(p) {
    var last = p.statusHistory[0];
    var monthName = last ? monthLabel(last.month).replace(/(\w+) (\d+)/, function (_, m, y) { return { Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June', Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December' }[m] + ' ' + y; }) : '';
    var attn = openRisks(p).sort(function (a, b) { return RATING_ORDER.indexOf(a.rating) - RATING_ORDER.indexOf(b.rating); }).slice(0, 3);
    var up = p.milestones.filter(function (m) { return !m.actual; }).slice(0, 4);
    var h = '<div class="' + EYEBROW + '">🖼️ Project &amp; Goals</div><div class="grid gap-3 md:grid-cols-[1fr_2fr]"><div class="' + CARD + ' p-2 h-[190px]">' + projectImage(p) + '</div><div class="' + CARD + ' p-4 text-[12.5px] space-y-2"><p><b>Goal:</b> ' + esc(p.goal) + '</p><p><b>Scope:</b> ' + esc(p.scope) + '</p><p><b>Success:</b> ' + esc(p.success) + '</p></div></div>';
    h += '<div class="' + EYEBROW + '">🗓️ Latest Update · Next Steps</div><div class="grid gap-3 md:grid-cols-2"><div class="' + CARD + ' p-4"><div class="font-bold text-[13px] mb-1.5">Achievements — ' + monthName + '</div><div class="text-[12.5px]">' + esc(p.achievements) + '</div></div><div class="' + CARD + ' p-4"><div class="font-bold text-[13px] mb-1.5">Plan for Next Period</div><div class="text-[12.5px]">' + esc(p.nextSteps) + '</div></div></div>';
    if (p.ragReason) h += '<div class="mt-3 border-l-4 border-[#d97706] pl-3 py-1 text-[12.5px]">⚠️ <b>Status yellow/red:</b> ' + esc(p.ragReason) + '</div>';
    h += '<div class="' + EYEBROW + '">⚠️ Risks &amp; Change Control</div><div class="grid gap-3 md:grid-cols-[3fr_2fr]"><div class="' + CARD + ' p-4"><div class="font-bold text-[13px] mb-2">Issues &amp; Risks for Sponsor’s Attention</div>' +
      (attn.length ? attn.map(function (r) { return '<div class="mb-3 last:mb-0"><span class="inline-block rounded px-1.5 py-[1px] text-[10px] font-bold ' + (RATING_CLS[r.rating] || '') + '">' + r.type + ' · ' + r.rating + '</span><div class="text-[12.5px] mt-1">' + esc(r.description) + '</div><div class="text-[11px] text-[#6b7280]">Owner: ' + esc(r.owner) + (r.exposure ? ' · Est. cost ' + fmtMoney(r.exposure) : '') + '</div></div>'; }).join('') : '<div class="text-[#9aa3b2]">Nothing open.</div>') +
      '</div><div class="' + CARD + ' p-4"><div class="font-bold text-[13px] mb-2">Change History</div>' + p.changeRequests.map(function (c) { return '<div class="pb-2 mb-2 border-b border-dashed border-[#e1e5eb] dark:border-slate-700 last:border-0"><div class="flex items-center justify-between"><span><b>' + c.number + '</b> <span class="text-[11px] text-[#6b7280]">' + fmtDate(c.date) + '</span></span>' + (c.status === 'Approved' ? '<span class="rounded px-1.5 text-[10px] font-bold bg-[#e7f6ec] text-[#15803d]">🔒 Approved</span>' : '<span class="rounded px-1.5 text-[10px] font-bold bg-[#fdf3e3] text-[#b45309]">Submitted</span>') + '</div><div class="text-[12px] text-[#4b5563] dark:text-slate-300">' + esc(c.title) + '</div><div class="text-[11px] text-[#6b7280]">Category: ' + c.category + ' · ' + esc(c.impact) + '</div></div>'; }).join('') + '</div></div>';
    h += '<div class="' + EYEBROW + '">🏁 Upcoming Milestones</div><div class="' + CARD + ' overflow-x-auto"><table class="w-full border-collapse text-[12.5px]"><tbody>' + up.map(function (m) { var s = slip(m); return '<tr><td class="' + TD + ' w-8">' + (MS_ICON[m.type] || '🏁') + '</td><td class="' + TD + ' font-semibold">' + esc(m.name) + '</td><td class="' + TD + '">' + fmtDate(m.forecast) + (s > 0 ? ' <span class="rounded bg-[#fbe9e9] text-[#dc2626] text-[10px] font-bold px-1">+' + s + 'd</span>' : '') + '</td><td class="' + TD + ' ' + (MS_CLS[m.status] || '') + ' font-semibold">' + m.status + '</td></tr>'; }).join('') + '</tbody></table></div>';
    return h;
  }
  function tabHistory(p) {
    return '<div class="' + CARD + ' overflow-x-auto mt-4"><table class="w-full border-collapse text-[12.5px]"><thead><tr>' + ['Report', 'Submitted', 'Overall', 'Timeline', 'Budget', 'Resources', 'Scope', 'Output', 'Team'].map(function (t) { return '<th class="' + TH + '">' + t + '</th>'; }).join('') + '</tr></thead><tbody>' +
      p.statusHistory.map(function (r) { return '<tr><td class="' + TD + ' font-semibold">' + monthLabel(r.month) + '</td><td class="' + TD + '">' + (r.submitted ? '🔒 ' + fmtDate(r.submitted) : '<span class="text-[#b45309] font-semibold">Draft</span>') + '</td>' + ['overall', 'timeline', 'budget', 'resources', 'scope'].map(function (k) { return '<td class="' + TD + '">' + ragBadge(r[k]) + '</td>'; }).join('') + '<td class="' + TD + '"><div class="flex items-center gap-2"><div class="w-16 h-1.5 rounded-full bg-[#eceef1] overflow-hidden"><div class="h-full bg-[#1a4fa0]" style="width:' + r.outputPct + '%"></div></div>' + r.outputPct + '%</div></td><td class="' + TD + ' text-[16px]">' + (r.engagement ? FACES[r.engagement - 1] : '—') + '</td></tr>'; }).join('') + '</tbody></table></div>';
  }
  function timeline(p) {
    var ms = p.milestones.filter(function (m) { return m.show; }).sort(function (a, b) { return a.forecast < b.forecast ? -1 : 1; });
    var W = 1000, H = 230, x0 = 40, x1 = W - 40, axisY = 112;
    var t0 = new Date(p.start) - 0, t1 = new Date(p.end) - 0, X = function (d) { return x0 + (new Date(d) - t0) / (t1 - t0) * (x1 - x0); };
    var o = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="w-full h-auto" font-family="inherit"><line x1="' + x0 + '" y1="' + axisY + '" x2="' + x1 + '" y2="' + axisY + '" stroke="#c9d1dd" stroke-width="2"/>';
    var today = X(DATA.today); o += '<line x1="' + today + '" y1="22" x2="' + today + '" y2="' + (H - 20) + '" stroke="#1a4fa0" stroke-dasharray="3 3" stroke-opacity=".6"/><text x="' + today + '" y="16" text-anchor="middle" font-size="10" fill="#1a4fa0" font-weight="700">Today</text>';
    var d = new Date(p.start); d.setUTCDate(1);
    while (d - 0 <= t1) { var xx = X(d.toISOString().slice(0, 10)); if (xx >= x0) o += '<line x1="' + xx + '" y1="' + (axisY - 3) + '" x2="' + xx + '" y2="' + (axisY + 3) + '" stroke="#c9d1dd"/><text x="' + xx + '" y="' + (H - 6) + '" text-anchor="middle" font-size="9.5" fill="#9aa3b2">' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()] + (d.getUTCMonth() === 0 ? ' ' + d.getUTCFullYear() : '') + '</text>'; d.setUTCMonth(d.getUTCMonth() + 1); }
    ms.forEach(function (m, i) {
      var x = X(m.forecast), up = i % 2 === 0, ly = up ? axisY - 44 : axisY + 56, col = MS_COLOR[m.status] || '#6b7280';
      o += '<line x1="' + x + '" y1="' + axisY + '" x2="' + x + '" y2="' + (up ? axisY - 22 : axisY + 12) + '" stroke="#d6dbe3"/>';
      o += '<circle cx="' + x + '" cy="' + axisY + '" r="5" fill="' + col + '" stroke="#fff" stroke-width="2"/><text x="' + x + '" y="' + (up ? axisY - 12 : axisY + 26) + '" text-anchor="middle" font-size="15">' + (MS_ICON[m.type] || '🏁') + '</text>';
      o += '<text x="' + x + '" y="' + (ly) + '" text-anchor="middle" font-size="10.5" font-weight="700" fill="currentColor">' + esc(m.name.length > 22 ? m.name.slice(0, 21) + '…' : m.name) + '</text><text x="' + x + '" y="' + (ly + 12) + '" text-anchor="middle" font-size="10" font-weight="600" fill="' + col + '">' + fmtDate(m.forecast) + '</text>';
    });
    return o + '</svg>';
  }
  function tabMilestones(p) {
    var cur = p.phases.indexOf(p.phase);
    var strip = '<div class="flex flex-wrap items-center gap-1.5">' + p.phases.map(function (ph, i) { return '<span class="rounded-md px-2 py-0.5 text-[11px] font-semibold border ' + (i === cur ? 'border-[#1a4fa0] text-[#1a4fa0] bg-white dark:bg-slate-800 ring-2 ring-[#1a4fa0]/15' : i < cur ? 'border-[#bfe3cb] bg-[#e7f6ec] text-[#15803d]' : 'border-dashed border-[#c9d1dd] text-[#6b7280]') + '">' + (i < cur ? '✔ ' : i === cur ? '▸ ' : '') + esc(ph) + '</span>' + (i < p.phases.length - 1 ? '<span class="text-[#9aa3b2] text-[10px]">→</span>' : ''); }).join('') + '</div>';
    var rows = p.milestones.slice().sort(function (a, b) { return a.baseline < b.baseline ? -1 : 1; });
    return '<div class="' + CARD + ' p-4 mt-4"><div class="flex flex-wrap items-center justify-between gap-2 mb-1"><div class="font-bold text-[13px]">Timeline</div>' + strip + '</div>' + timeline(p) +
      '<div class="flex flex-wrap items-center gap-3 border-t border-[#eef1f5] dark:border-slate-700 pt-2 text-[11px] text-[#6b7280]"><b class="uppercase tracking-wider text-[10px]">Colour = status (milestone date)</b>' + ['Completed', 'On Track', 'At Risk', 'Delayed', 'Not Started'].map(function (s) { return '<span class="inline-flex items-center gap-1"><i class="inline-block w-2.5 h-2.5 rounded-full" style="background:' + MS_COLOR[s] + '"></i>' + s + '</span>'; }).join('') + '</div></div>' +
      '<div class="' + CARD + ' overflow-x-auto mt-3 p-3"><div class="font-bold text-[13px] mb-1">All Milestones</div><table class="w-full border-collapse text-[12.5px]"><thead><tr>' + ['ID', 'Name', 'Type', 'Baseline', 'Forecast', 'Actual', 'Status', 'Show'].map(function (t) { return '<th class="' + TH + '">' + t + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (m) { var s = slip(m); return '<tr><td class="' + TD + ' font-mono text-[11px] text-[#6b7280]">' + m.id + '</td><td class="' + TD + '">' + (MS_ICON[m.type] || '') + ' ' + esc(m.name) + '</td><td class="' + TD + '">' + m.type + '</td><td class="' + TD + '">' + fmtDate(m.baseline) + '</td><td class="' + TD + '">' + fmtDate(m.forecast) + (s > 0 ? ' <span class="rounded bg-[#fbe9e9] text-[#dc2626] text-[10px] font-bold px-1">+' + s + 'd</span>' : s < 0 ? ' <span class="rounded bg-[#e7f6ec] text-[#15803d] text-[10px] font-bold px-1">' + s + 'd</span>' : '') + '</td><td class="' + TD + '">' + (m.actual ? fmtDate(m.actual) : '—') + '</td><td class="' + TD + ' font-semibold ' + (MS_CLS[m.status] || '') + '">' + m.status + '</td><td class="' + TD + '"><input type="checkbox" ' + (m.show ? 'checked' : '') + ' class="accent-[#1a4fa0]"></td></tr>'; }).join('') + '</tbody></table></div>';
  }
  function tabCrs(p) {
    return '<div class="flex justify-end mt-4 mb-2">' + pbtn('+ New Change Request', 'toast:New Change Request — approval runs through Power Automate.') + '</div><div class="' + CARD + ' overflow-x-auto"><table class="w-full border-collapse text-[12.5px]"><thead><tr>' + ['CR #', 'Date', 'Title', 'Category', 'Impact', 'Requested by', 'Status'].map(function (t) { return '<th class="' + TH + '">' + t + '</th>'; }).join('') + '</tr></thead><tbody>' +
      p.changeRequests.map(function (c) { return '<tr><td class="' + TD + ' font-bold">' + c.number + '</td><td class="' + TD + '">' + fmtDate(c.date) + '</td><td class="' + TD + '">' + esc(c.title) + '</td><td class="' + TD + '">' + c.category + '</td><td class="' + TD + '">' + esc(c.impact) + '</td><td class="' + TD + '">' + person(c.requestedBy) + '</td><td class="' + TD + '">' + (c.status === 'Approved' ? '<span class="rounded px-1.5 text-[10.5px] font-bold bg-[#e7f6ec] text-[#15803d]">🔒 Approved</span>' : '<span class="rounded px-1.5 text-[10.5px] font-bold bg-[#fdf3e3] text-[#b45309]">Submitted</span>') + '</td></tr>'; }).join('') + '</tbody></table></div>';
  }
  function tabDecisions(p) {
    return '<div class="flex flex-wrap justify-between items-center gap-2 mt-4 mb-2"><div class="text-[12.5px] text-[#6b7280]">What was decided, when, by whom and why. Drafts can be edited; recorded decisions are locked.</div>' + pbtn('+ New Decision', 'toast:New decision — save as draft, or record it (then it is locked).') + '</div>' +
      (p.decisions.length ? '<div class="' + CARD + ' overflow-x-auto"><table class="w-full border-collapse text-[12.5px]"><thead><tr>' + ['#', 'Date', 'Decision', 'Decided by', 'Rationale', 'Status'].map(function (t) { return '<th class="' + TH + '">' + t + '</th>'; }).join('') + '</tr></thead><tbody>' +
        p.decisions.slice().reverse().map(function (d) { return '<tr><td class="' + TD + ' font-bold whitespace-nowrap">' + d.number + '</td><td class="' + TD + '">' + fmtDate(d.date) + '</td><td class="' + TD + ' font-semibold">' + esc(d.title) + '</td><td class="' + TD + '">' + esc(d.decidedBy) + '</td><td class="' + TD + ' text-[#4b5563] dark:text-slate-300">' + esc(d.rationale) + '</td><td class="' + TD + ' whitespace-nowrap">' + (d.status === 'Recorded' ? '<span class="text-[#15803d] font-semibold">🔒 Recorded</span>' : '<span class="text-[#b45309] font-semibold">Draft</span>') + '</td></tr>'; }).join('') + '</tbody></table></div>'
        : '<div class="' + CARD + ' p-8 text-center text-[#6b7280]">No decisions logged yet.</div>');
  }
  function riskMatrix(risks, sel) {
    var L = ['High', 'Medium', 'Low'], I = ['Low', 'Medium', 'High'], sc = { Low: 1, Medium: 2, High: 3 };
    var cellCol = function (l, i) { var v = sc[l] * sc[i]; return v >= 6 ? '#dc2626' : v >= 3 ? '#d97706' : '#16a34a'; };
    var o = '<div class="flex items-stretch gap-2"><div class="flex items-center"><span class="[writing-mode:vertical-rl] rotate-180 text-[10px] text-[#6b7280] font-semibold">Likelihood ↑</span></div><div><div class="text-center text-[10px] text-[#6b7280] font-semibold mb-1 pl-14">Impact →</div><div class="grid grid-cols-[52px_repeat(3,64px)] gap-1.5 items-center"><span></span>' + I.map(function (i) { return '<span class="text-center text-[11px] font-semibold">' + i + '</span>'; }).join('');
    L.forEach(function (l) {
      o += '<span class="text-right pr-1 text-[11px] font-semibold">' + l + '</span>';
      I.forEach(function (i) { var n = risks.filter(function (r) { return r.likelihood === l && r.impact === i; }).length; var on = sel && sel[0] === l && sel[1] === i; o += '<button data-act="cell:' + l + ':' + i + '" class="h-[40px] rounded text-white text-center leading-tight ' + (on ? 'ring-2 ring-offset-1 ring-[#1f2430]' : '') + '" style="background:' + cellCol(l, i) + ';opacity:' + (n ? 1 : .35) + '"><div class="text-[15px] font-extrabold">' + (n || '—') + '</div><div class="text-[8.5px] opacity-90">' + l + '×' + i + '</div></button>'; });
    });
    return o + '</div></div></div>';
  }
  function sevCards(risks) {
    var sc = { Low: 1, Medium: 2, High: 3 }, b = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    risks.forEach(function (r) { var v = sc[r.likelihood] * sc[r.impact]; b[v >= 6 ? 'HIGH' : v >= 3 ? 'MEDIUM' : 'LOW']++; });
    var st = { HIGH: 'bg-[#fbe9e9] border-[#f0c8c8] text-[#dc2626]', MEDIUM: 'bg-[#fdf3e3] border-[#f3dcb3] text-[#b45309]', LOW: 'bg-[#e7f6ec] border-[#bfe3cb] text-[#15803d]' };
    return '<div class="grid grid-cols-3 gap-3 flex-1 min-w-[260px]">' + ['HIGH', 'MEDIUM', 'LOW'].map(function (k) { return '<div class="rounded-lg border flex flex-col items-center justify-center py-5 ' + st[k] + '"><div class="text-[26px] font-extrabold">' + b[k] + '</div><div class="text-[10px] font-bold tracking-[.1em]">' + k + '</div></div>'; }).join('') + '</div>';
  }
  function riskTable(rows, withProject) {
    return '<table class="w-full border-collapse text-[12.5px]"><thead><tr>' + (withProject ? ['Project'] : []).concat(['ID', 'Type', 'Description', 'Category', 'Rating', 'Status', 'Owner', 'Est. cost']).map(function (t) { return '<th class="' + TH + '">' + t + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr>' + (withProject ? '<td class="' + TD + '"><a href="#" data-act="open:' + r.p.number + ':risks" class="font-semibold text-[#1a4fa0]">' + r.p.number + '</a></td>' : '') + '<td class="' + TD + ' font-mono text-[11px] text-[#6b7280]">' + r.id + '</td><td class="' + TD + '">' + r.type + '</td><td class="' + TD + ' max-w-[380px]">' + esc(r.description) + '</td><td class="' + TD + '">' + r.category + '</td><td class="' + TD + '">' + ratingBadge(r.rating) + '</td><td class="' + TD + '">' + r.status + '</td><td class="' + TD + '">' + person(r.owner) + '</td><td class="' + TD + ' whitespace-nowrap">' + (r.exposure ? fmtMoney(r.exposure) + ' <span class="text-[10px] text-[#6b7280]">× ' + (r.type === 'Issue' ? '100' : Math.round(PROB[r.likelihood] * 100)) + '%</span>' : '—') + '</td></tr>'; }).join('') + '</tbody></table>';
  }
  function tabRisks(p) {
    var risks = openRisks(p);
    var sel = S.riskCell, shown = sel ? risks.filter(function (r) { return r.likelihood === sel[0] && r.impact === sel[1]; }) : p.risks;
    return '<div class="' + CARD + ' p-4 mt-4"><div class="flex items-center justify-between mb-2"><div class="font-bold text-[13px]">Risk Matrix <span class="text-[#9aa3b2] text-[11px]">ⓘ</span></div><span class="text-[11.5px] text-[#6b7280]">▾ Hide</span></div><label class="inline-flex items-center gap-1.5 text-[11.5px] text-[#6b7280] mb-3"><input type="checkbox" checked class="accent-[#1a4fa0]">Include converted Issues</label><div class="flex flex-wrap gap-5 items-center">' + riskMatrix(risks, sel) + sevCards(risks) + '</div></div>' +
      '<div class="flex justify-between items-center mt-3 mb-2"><div class="text-[12px] text-[#6b7280]">' + (sel ? 'Showing ' + sel[0] + ' likelihood × ' + sel[1] + ' impact · <a href="#" data-act="cell:clear" class="text-[#1a4fa0]">clear</a>' : 'All risks &amp; issues (' + p.risks.length + ')') + '</div>' + pbtn('+ New Risk / Issue', 'toast:New Risk or Issue — including the estimated cost if it happens.') + '</div><div class="' + CARD + ' overflow-x-auto">' + riskTable(shown, false) + '</div>';
  }
  function tabFinancials(p) {
    var f = p.financials, rows = [['OPEX', f.opexBudget, f.opexActual, f.opexPlanYear, f.opexActualYtd], ['CAPEX', f.capexBudget, f.capexActual, f.capexPlanYear, f.capexActualYtd]];
    var cols = ['#2b4c9c', '#4caf50', '#d4782f', '#7c3aed'], names = ['Approved Budget', 'Actual to Date', 'Plan (Current Year)', 'Actual YTD'];
    var max = Math.max.apply(null, rows.map(function (r) { return Math.max(r[1], r[2], r[3], r[4]); })) * 1.12 || 1;
    var W = 620, H = 250, base = 210, o = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="w-full max-w-[640px] h-auto" font-family="inherit">';
    for (var g = 0; g <= 4; g++) { var y = base - g * (base - 20) / 4; o += '<line x1="50" x2="' + W + '" y1="' + y + '" y2="' + y + '" stroke="#eef1f5"/><text x="44" y="' + (y + 3) + '" text-anchor="end" font-size="9.5" fill="#9aa3b2">' + fmtNum(max * g / 4) + '</text>'; }
    rows.forEach(function (r, gi) { for (var k = 0; k < 4; k++) { var v = r[k + 1], hh = v / max * (base - 20), x = 80 + gi * 280 + k * 58; o += '<rect x="' + x + '" y="' + (base - hh) + '" width="46" height="' + Math.max(1, hh) + '" rx="2" fill="' + cols[k] + '"/><text x="' + (x + 23) + '" y="' + (base - hh - 5) + '" text-anchor="middle" font-size="9.5" font-weight="700" fill="currentColor">' + fmtNum(v) + '</text>'; } o += '<text x="' + (80 + gi * 280 + 110) + '" y="' + (base + 20) + '" text-anchor="middle" font-size="11" font-weight="800" fill="currentColor">' + r[0] + '</text>'; });
    o += '</svg>';
    return '<div class="' + CARD + ' p-4 mt-4"><div class="flex justify-between"><div><div class="font-bold text-[13px]">Financials <span class="text-[#9aa3b2] text-[11px]">ⓘ</span></div><div class="text-[10.5px] text-[#6b7280]">ERP #: ' + esc(p.erp) + '</div></div><div class="text-[11px] text-[#6b7280]">Last updated: ' + fmtDate(p.lastFinanceUpdate) + '</div></div><div class="flex flex-wrap gap-3 my-2 text-[11.5px]">' + names.map(function (n, k) { return '<span class="inline-flex items-center gap-1"><i class="inline-block w-2.5 h-2.5 rounded-sm" style="background:' + cols[k] + '"></i>' + n + '</span>'; }).join('') + '</div>' + o +
      '<table class="w-full border-collapse text-[12.5px] mt-2"><thead><tr><th class="' + TH + '"></th>' + names.map(function (n) { return '<th class="' + TH + '">' + n + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.map(function (r) { return '<tr><td class="' + TD + ' font-bold">' + r[0] + '</td>' + [1, 2, 3, 4].map(function (k) { return '<td class="' + TD + '">' + fmtNum(r[k]) + '</td>'; }).join('') + '</tr>'; }).join('') + '<tr><td class="' + TD + ' font-bold">Total</td>' + [1, 2, 3, 4].map(function (k) { return '<td class="' + TD + ' font-bold">' + fmtNum(rows[0][k] + rows[1][k]) + '</td>'; }).join('') + '</tr></tbody></table></div>';
  }
  function fteCell(v) { var bg = v >= 80 ? '#1a4fa0' : v >= 50 ? '#5b86c9' : v >= 30 ? '#9fb8e3' : '#d6e2f5', fg = v >= 50 ? '#fff' : '#1f2430'; return '<td class="px-1 py-1"><div class="rounded text-center text-[11.5px] font-semibold py-1.5" style="background:' + bg + ';color:' + fg + '">' + v + '%</div></td>'; }
  function tabTeam(p) {
    return '<div class="flex justify-between items-center mt-4 mb-2"><div class="text-[12px] text-[#6b7280]">Planned allocation (% of FTE) per month. Edit in the grid; the Heatmap adds it up across projects.</div>' + pbtn('+ Add Team Member', 'toast:Add a person and their monthly allocation.') + '</div><div class="' + CARD + ' overflow-x-auto p-2"><table class="w-full border-collapse text-[12.5px]"><thead><tr><th class="' + TH + '">Person</th><th class="' + TH + '">Role</th>' + DATA.months.map(function (m) { return '<th class="' + TH + ' text-center">' + m + '</th>'; }).join('') + '</tr></thead><tbody>' +
      p.team.map(function (t) { return '<tr><td class="' + TD + '">' + person(t.person) + '</td><td class="' + TD + ' text-[#4b5563] dark:text-slate-300">' + esc(t.role) + '</td>' + t.fte.map(fteCell).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }

  // ---------- All Milestones ----------
  function subTabs() { return '<div class="flex items-center border-b border-[#dfe4ec] dark:border-slate-700 mb-3">' + [['overview', 'Overview'], ['deep', 'Deep Dive']].map(function (t) { var on = S.overviewTab === t[0]; return '<button data-act="otab:' + t[0] + '" class="px-3 py-2 text-[12.5px] border-b-2 ' + (on ? 'border-[#1a4fa0] text-[#1a4fa0] font-semibold' : 'border-transparent text-[#4b5563] dark:text-slate-300') + '">' + t[1] + '</button>'; }).join('') + '<label class="ml-auto inline-flex items-center gap-1.5 text-[12px] text-[#6b7280]"><input type="checkbox" class="accent-[#1a4fa0]">Include closed projects</label></div>'; }
  function statBox(n, l, cls) { return '<div class="rounded-md bg-[#f3f5f8] dark:bg-slate-700/60 text-center py-2.5 ' + (cls || '') + '"><div class="text-[20px] font-extrabold leading-none">' + n + '</div><div class="text-[9px] font-bold tracking-[.1em] uppercase mt-1 opacity-80">' + l + '</div></div>'; }
  function renderMilestones() {
    var list = projects().filter(function (p) { return inScope(p) && live(p); }), ms = allMs(list), open = ms.filter(function (m) { return !m.actual; });
    var t30 = new Date(DATA.today); t30.setUTCDate(t30.getUTCDate() + 30);
    var due = open.filter(function (m) { return m.forecast >= DATA.today && new Date(m.forecast) <= t30; }).sort(function (a, b) { return a.forecast < b.forecast ? -1 : 1; });
    var slipping = open.filter(function (m) { return slip(m) > 0; }).sort(function (a, b) { return slip(b) - slip(a); }).slice(0, 8);
    var h = renderPortfolioBar() + pageTitle('All Milestones') + subTabs();
    if (S.overviewTab === 'deep') return h + '<div class="' + CARD + ' overflow-x-auto"><table class="w-full border-collapse text-[12.5px]"><thead><tr>' + ['Project', 'Milestone', 'Type', 'Baseline', 'Forecast', 'Status'].map(function (t) { return '<th class="' + TH + ' sticky top-0 bg-white dark:bg-slate-800">' + t + '</th>'; }).join('') + '</tr></thead><tbody>' + open.sort(function (a, b) { return a.forecast < b.forecast ? -1 : 1; }).slice(0, 40).map(function (m, i) { var s = slip(m); return '<tr class="' + (i % 2 ? 'bg-[#fafbfd] dark:bg-slate-800/60' : '') + '"><td class="' + TD + '"><a href="#" data-act="open:' + m.p.number + ':milestones" class="font-semibold text-[#1a4fa0]">' + m.p.number + '</a> <span class="text-[#6b7280]">' + esc(m.p.name.length > 34 ? m.p.name.slice(0, 33) + '…' : m.p.name) + '</span></td><td class="' + TD + '">' + (MS_ICON[m.type] || '') + ' ' + esc(m.name) + '</td><td class="' + TD + '">' + m.type + '</td><td class="' + TD + '">' + fmtDate(m.baseline) + '</td><td class="' + TD + '">' + fmtDate(m.forecast) + (s > 0 ? ' <span class="rounded bg-[#fbe9e9] text-[#dc2626] text-[10px] font-bold px-1">+' + s + 'd</span>' : '') + '</td><td class="' + TD + ' font-semibold ' + (MS_CLS[m.status] || '') + '">' + m.status + '</td></tr>'; }).join('') + '</tbody></table></div>';
    var byStatus = ['Delayed', 'At Risk', 'On Track', 'Not Started'].map(function (s) { return [s, open.filter(function (m) { return m.status === s; }).length]; });
    var maxS = Math.max.apply(null, byStatus.map(function (x) { return x[1]; })) || 1;
    h += '<div class="text-[11.5px] text-[#6b7280] mb-2">Updated just now · <a href="#" class="text-[#1a4fa0] font-semibold">Refresh</a></div><div class="grid gap-3 lg:grid-cols-3">' +
      '<div class="space-y-3"><div class="' + CARD + ' p-4"><div class="font-bold text-[13px] mb-2">At a Glance</div><div class="grid grid-cols-2 gap-2">' + statBox(open.length, 'Open') + statBox(byStatus[0][1], 'Delayed', 'text-[#dc2626]') + statBox(byStatus[1][1], 'At Risk', 'text-[#b45309]') + statBox(due.length, 'Due in 30 days', 'text-[#1a4fa0]') + '</div></div>' +
      '<div class="' + CARD + ' p-4"><div class="font-bold text-[13px] mb-2">By Status</div>' + byStatus.map(function (x) { return '<div class="flex items-center gap-2 mb-1.5 text-[12px]"><span class="w-20">' + x[0] + '</span><div class="flex-1 h-3 rounded bg-[#eef1f5] dark:bg-slate-700 overflow-hidden"><div class="h-full rounded" style="width:' + (x[1] / maxS * 100) + '%;background:' + MS_COLOR[x[0]] + '"></div></div><b class="w-6 text-right">' + x[1] + '</b></div>'; }).join('') + '</div></div>' +
      '<div class="' + CARD + ' p-4"><div class="flex justify-between font-bold text-[13px] mb-2">Slipping Most<span class="text-[11px] font-normal text-[#6b7280]">vs. baseline</span></div>' + slipping.map(function (m) { return '<div class="flex items-center justify-between py-1.5 border-b border-[#eef1f5] dark:border-slate-700 last:border-0"><div class="min-w-0"><div class="font-semibold text-[12.5px] truncate">' + esc(m.name) + '</div><div class="text-[11px] text-[#6b7280] truncate">' + esc(m.p.name) + '</div></div><span class="ml-2 rounded bg-[#fbe9e9] text-[#dc2626] text-[10.5px] font-bold px-1.5 whitespace-nowrap">+' + slip(m) + 'd</span></div>'; }).join('') + '</div>' +
      '<div class="' + CARD + ' p-4"><div class="font-bold text-[13px] mb-2">Due in the Next 30 Days</div>' + due.slice(0, 8).map(function (m) { return '<div class="flex items-center gap-2 py-1.5 border-b border-[#eef1f5] dark:border-slate-700 last:border-0"><span>' + (MS_ICON[m.type] || '🏁') + '</span><div class="min-w-0 flex-1"><div class="font-semibold text-[12.5px] truncate">' + esc(m.name) + '</div><div class="text-[11px] text-[#6b7280] truncate">' + m.p.number + ' · ' + esc(m.p.name) + '</div></div><span class="text-[11.5px] font-semibold ' + (MS_CLS[m.status] || '') + '">' + fmtDate(m.forecast) + '</span></div>'; }).join('') + '</div></div>';
    return h;
  }

  // ---------- All Risks ----------
  function renderRisks() {
    var list = projects().filter(function (p) { return inScope(p) && live(p); }), risks = allRisks(list);
    var h = renderPortfolioBar() + pageTitle('All Risks &amp; Issues') + subTabs();
    if (S.overviewTab === 'deep') return h + '<div class="' + CARD + ' overflow-x-auto">' + riskTable(risks.sort(function (a, b) { return RATING_ORDER.indexOf(a.rating) - RATING_ORDER.indexOf(b.rating); }), true) + '</div>';
    var cnt = function (r) { return risks.filter(function (x) { return x.rating === r; }).length; };
    var cats = ['Schedule', 'Resource', 'Technical', 'Financial', 'Supply Chain', 'Other'];
    var weekAgo = new Date(DATA.today); weekAgo.setUTCDate(weekAgo.getUTCDate() - 7); var monthAgo = new Date(DATA.today); monthAgo.setUTCDate(monthAgo.getUTCDate() - 30);
    var aging = risks.filter(function (r) { return r.rating === 'Critical' || r.rating === 'High'; }).sort(function (a, b) { return a.raised < b.raised ? -1 : 1; }).slice(0, 7);
    var exposure = list.reduce(function (s, p) { return s + (p.riskExposure || 0); }, 0);
    h += '<div class="text-[11.5px] text-[#6b7280] mb-2">Updated just now · <a href="#" class="text-[#1a4fa0] font-semibold">Refresh</a></div><div class="grid gap-3 lg:grid-cols-3"><div class="space-y-3">' +
      '<div class="' + CARD + ' p-4"><div class="font-bold text-[13px] mb-2">At a Glance</div><div class="grid grid-cols-2 gap-2">' + statBox(cnt('Critical') + cnt('High'), 'Active Blockers') + statBox(risks.filter(function (r) { return r.rating === 'Critical'; }).length, 'Needs Sponsor') + statBox(risks.filter(function (r) { return new Date(r.raised) >= weekAgo; }).length, 'New this week') + statBox(risks.filter(function (r) { return new Date(r.raised) >= monthAgo; }).length, 'New this month') + '</div><div class="text-[11px] text-[#6b7280] mt-2">Expected cost of open risks: <b class="text-[#1f2430] dark:text-slate-100">' + fmtMoney(exposure) + '</b> (value × likelihood)</div></div>' +
      '<div class="' + CARD + ' p-4"><div class="font-bold text-[13px] mb-2">By Rating</div><div class="grid grid-cols-4 gap-2">' + statBox(cnt('Critical'), 'Critical', 'bg-[#fbe9e9] text-[#b91c1c]') + statBox(cnt('High'), 'High', 'bg-[#fdecec] text-[#dc2626]') + statBox(cnt('Medium'), 'Medium', 'bg-[#fdf3e3] text-[#b45309]') + statBox(cnt('Low'), 'Low', 'bg-[#e7f6ec] text-[#15803d]') + '</div></div></div>' +
      '<div class="' + CARD + ' p-4"><div class="flex justify-between font-bold text-[13px] mb-2">Aging<span class="text-[11px] font-normal text-[#6b7280]">oldest open High/Critical</span></div>' + aging.map(function (r) { return '<div class="flex items-start justify-between gap-2 py-1.5 border-b border-[#eef1f5] dark:border-slate-700 last:border-0"><div class="min-w-0"><div class="font-semibold text-[12.5px] truncate">' + esc(r.description) + '</div><div class="text-[11px] text-[#6b7280] truncate">' + esc(r.p.name) + ' · ' + r.rating + '</div></div><span class="text-[11px] text-[#6b7280] whitespace-nowrap">' + fmtDate(r.raised) + '</span></div>'; }).join('') + '</div>' +
      '<div class="' + CARD + ' p-4"><div class="font-bold text-[13px] mb-2">Rating × Category</div><table class="w-full text-[12px]"><thead><tr><th></th>' + RATING_ORDER.concat(['Total']).map(function (r) { return '<th class="text-[9.5px] font-bold tracking-wider uppercase text-[#6b7280] pb-1">' + r + '</th>'; }).join('') + '</tr></thead><tbody>' + cats.map(function (c) { var rs = risks.filter(function (r) { return r.category === c; }); return '<tr><td class="font-semibold py-1.5 pr-2">' + c + '</td>' + RATING_ORDER.map(function (r) { var n = rs.filter(function (x) { return x.rating === r; }).length; return '<td class="text-center font-bold ' + (n && (r === 'Critical' || r === 'High') ? 'text-[#dc2626]' : '') + '">' + n + '</td>'; }).join('') + '<td class="text-center font-extrabold">' + rs.length + '</td></tr>'; }).join('') + '</tbody></table></div></div>' +
      '<div class="' + CARD + ' p-4 mt-3"><div class="font-bold text-[13px] mb-3">Risk Matrix — portfolio</div><div class="flex flex-wrap gap-5 items-center">' + riskMatrix(risks, null) + sevCards(risks) + '</div></div>';
    return h;
  }

  // ---------- Analytics ----------
  function renderAnalytics() {
    var list = projects().filter(inScope);
    var sel = S.analyticsProject ? byNum(S.analyticsProject) : null;
    var livep = list.filter(function (p) { return p.status !== 'Closed' && p.status !== 'Not Started'; });
    var scores = sel ? scoresFor(sel) : median(livep.map(function (p) { return scoresFor(p); }));
    var h = renderPortfolioBar() + pageTitle('Analytics &amp; Reporting', 'Portfolio-wide trends — health, status history and milestone slippage, built from the Status Reports already captured. Pick a project to see its own.') +
      '<div class="mb-3"><label class="inline-flex items-center gap-2 text-[12.5px] font-semibold">Project <select data-input="analyticsProject" class="rounded-md border border-[#d5dbe4] dark:border-slate-600 dark:bg-slate-800 px-2 py-1 font-normal"><option value="">Whole portfolio</option>' + list.filter(function (p) { return p.status !== 'Not Started'; }).map(function (p) { return '<option value="' + p.number + '" ' + (S.analyticsProject === p.number ? 'selected' : '') + '>' + p.number + ' — ' + esc(p.name) + '</option>'; }).join('') + '</select></label></div>';
    h += '<div class="' + CARD + ' p-4 mb-3"><div class="font-bold text-[13px]">Project Health</div><div class="text-[11.5px] text-[#6b7280] mb-2">' + (sel ? 'The selected project’s health scores.' : 'Median health score per axis across the ' + livep.length + ' live projects in the selected portfolio(s).') + ' Further out is healthier.</div><div class="flex flex-wrap items-center gap-6">' + radar(scores, 280) +
      '<table class="text-[12.5px]"><tbody>' + AXES.map(function (a, i) { var b = bandLabel(scores[i], i); return '<tr><td class="py-1.5 pr-6 border-b border-[#eef1f5] dark:border-slate-700">' + a + '</td><td class="py-1.5 border-b border-[#eef1f5] dark:border-slate-700 ' + BAND_CLS[b.cls] + '">' + (i === OUTPUT_AXIS || scores[i] == null ? '' : Math.round(scores[i]) + ' ') + b.text + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
    // RAG over time
    var months = [], seen = {}; list.forEach(function (p) { if (sel && p !== sel) return; p.statusHistory.forEach(function (r) { if (r.submitted || true) { seen[r.month] = seen[r.month] || { Green: 0, Yellow: 0, Red: 0 }; if (seen[r.month][r.overall] != null) seen[r.month][r.overall]++; } }); });
    months = Object.keys(seen).sort();
    var maxT = Math.max.apply(null, months.map(function (m) { var s = seen[m]; return s.Green + s.Yellow + s.Red; })) || 1;
    h += '<div class="grid gap-3 lg:grid-cols-2"><div class="' + CARD + ' p-4"><div class="font-bold text-[13px]">RAG Status Over Time</div><div class="text-[11.5px] text-[#6b7280] mb-3">Submitted Status Reports per month by overall RAG.</div><div class="flex items-end gap-3 h-[170px] px-2">' + months.map(function (m) { var s = seen[m]; return '<div class="flex-1 flex flex-col items-center gap-1"><div class="w-full max-w-[38px] flex flex-col-reverse rounded overflow-hidden" style="height:' + ((s.Green + s.Yellow + s.Red) / maxT * 140) + 'px"><div style="flex:' + s.Green + ';background:#16a34a"></div><div style="flex:' + s.Yellow + ';background:#d97706"></div><div style="flex:' + s.Red + ';background:#dc2626"></div></div><div class="text-[10px] text-[#6b7280]">' + monthLabel(m).split(' ')[0] + '</div></div>'; }).join('') + '</div></div>';
    // slippage line
    var pts = months.map(function (m, i) { var v = 2 + i * 1.6 + (i % 3 === 0 ? 1.5 : 0) - (i > 5 ? (i - 5) * 2.5 : 0); if (sel) v = v * (sel.rag.timeline === 'Red' ? 2.2 : sel.rag.timeline === 'Yellow' ? 1.4 : .6); return v; });
    var mx = Math.max.apply(null, pts.concat([1])) * 1.2, W = 460, Hh = 170;
    var path = pts.map(function (v, i) { return (i ? 'L' : 'M') + (30 + i * (W - 50) / Math.max(1, pts.length - 1)).toFixed(1) + ' ' + (Hh - 20 - v / mx * (Hh - 40)).toFixed(1); }).join(' ');
    h += '<div class="' + CARD + ' p-4"><div class="font-bold text-[13px]">Milestone Slippage Over Time</div><div class="text-[11.5px] text-[#6b7280] mb-3">Average days a milestone’s forecast has moved vs. its baseline.</div><svg viewBox="0 0 ' + W + ' ' + Hh + '" class="w-full h-auto" font-family="inherit"><line x1="30" x2="' + W + '" y1="' + (Hh - 20) + '" y2="' + (Hh - 20) + '" stroke="#e1e5eb"/><path d="' + path + '" fill="none" stroke="#1a4fa0" stroke-width="2.5"/>' + pts.map(function (v, i) { var x = 30 + i * (W - 50) / Math.max(1, pts.length - 1), y = Hh - 20 - v / mx * (Hh - 40); return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3.5" fill="#1a4fa0"/><text x="' + x.toFixed(1) + '" y="' + (y - 8).toFixed(1) + '" text-anchor="middle" font-size="9.5" font-weight="700" fill="currentColor">' + v.toFixed(1) + 'd</text><text x="' + x.toFixed(1) + '" y="' + (Hh - 5) + '" text-anchor="middle" font-size="9.5" fill="#9aa3b2">' + monthLabel(months[i]).split(' ')[0] + '</text>'; }).join('') + '</svg></div></div>';
    return h;
  }

  // ---------- Heatmap ----------
  function renderHeatmap() {
    var ppl = {};
    projects().filter(function (p) { return inScope(p) && p.status === 'Running'; }).forEach(function (p) { p.team.forEach(function (t) { var e = ppl[t.person] = ppl[t.person] || { role: t.role, m: [0, 0, 0, 0, 0, 0], n: 0 }; e.n++; t.fte.forEach(function (v, i) { e.m[i] += v; }); }); });
    var names = Object.keys(ppl).sort(function (a, b) { return Math.max.apply(null, ppl[b].m) - Math.max.apply(null, ppl[a].m); });
    var cell = function (v) { var bg = v > 100 ? '#dc2626' : v >= 85 ? '#d97706' : v >= 50 ? '#16a34a' : v > 0 ? '#86d4a0' : '#eef1f5', fg = v >= 50 ? '#fff' : '#1f2430'; return '<td class="px-1 py-1"><div class="rounded text-center text-[11.5px] font-bold py-1.5" style="background:' + bg + ';color:' + fg + '">' + (v || '—') + (v ? '%' : '') + '</div></td>'; };
    return renderPortfolioBar() + pageTitle('Resource Heatmap', 'Planned allocation per person across all projects, by month. Over 100% means someone is overbooked.') +
      '<div class="flex flex-wrap gap-3 items-center mb-3 text-[11.5px]"><span class="font-semibold">Group by</span>' + btn('Function ▾', 'toast:Group by Function or Role; filter by project or person.') + '<span class="ml-auto inline-flex items-center gap-3 text-[#6b7280]"><span class="inline-flex items-center gap-1"><i class="w-3 h-3 rounded-sm inline-block bg-[#86d4a0]"></i>&lt; 50%</span><span class="inline-flex items-center gap-1"><i class="w-3 h-3 rounded-sm inline-block bg-[#16a34a]"></i>50–84%</span><span class="inline-flex items-center gap-1"><i class="w-3 h-3 rounded-sm inline-block bg-[#d97706]"></i>85–100%</span><span class="inline-flex items-center gap-1"><i class="w-3 h-3 rounded-sm inline-block bg-[#dc2626]"></i>&gt; 100%</span></span></div>' +
      '<div class="' + CARD + ' overflow-x-auto p-2"><table class="w-full border-collapse text-[12.5px]"><thead><tr><th class="' + TH + '">Person</th><th class="' + TH + '">Role</th><th class="' + TH + ' text-center">Projects</th>' + DATA.months.map(function (m) { return '<th class="' + TH + ' text-center">' + m + '</th>'; }).join('') + '</tr></thead><tbody>' +
      names.map(function (n) { var e = ppl[n]; return '<tr><td class="' + TD + '">' + person(n) + '</td><td class="' + TD + ' text-[#4b5563] dark:text-slate-300">' + esc(e.role) + '</td><td class="' + TD + ' text-center">' + e.n + '</td>' + e.m.map(cell).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }

  // ---------- modal + popover ----------
  function renderModal() {
    if (S.modal === 'about') {
      return '<div class="absolute inset-0 z-40 bg-[#1f2430]/40 flex items-start justify-center p-6 overflow-auto" data-act="overlay">' +
        '<div class="' + CARD + ' w-full max-w-[620px] shadow-2xl" data-stop>' +
          '<div class="flex items-center justify-between px-4 py-3 border-b border-[#e1e5eb] dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 rounded-t-lg">' +
            '<div class="flex items-center gap-2">' +
              '<span class="text-base">🧭</span>' +
              '<b class="text-[13.5px] font-extrabold text-[#1f2430] dark:text-white">About PPM Compass 360</b>' +
              '<span class="rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold font-mono">v1.0.3.9</span>' +
            '</div>' +
            '<button data-act="closemodal" class="text-[18px] leading-none text-[#6b7280] hover:text-[#1f2430] dark:hover:text-white">×</button>' +
          '</div>' +
          '<div class="p-5 space-y-4 text-[12px] leading-relaxed">' +
            '<div class="p-3 bg-[#e8f0fc] dark:bg-blue-900/30 rounded-lg border border-[#b9cbe9] dark:border-blue-800 text-[#1a4fa0] dark:text-blue-300 font-medium">' +
              'PPM Compass 360 is an enterprise Project Portfolio Management solution engineered natively for Microsoft 365 SharePoint Online. 100% in-tenant governance, zero external databases, flat per-site licensing.' +
            '</div>' +
            '<div>' +
              '<div class="font-bold text-[12.5px] text-[#1f2430] dark:text-slate-100 mb-2 flex items-center justify-between">' +
                '<span>Recent Release Highlights</span>' +
                '<a href="/release-notes/" target="_blank" class="text-[11px] font-semibold text-[#1a4fa0] dark:text-blue-300 hover:underline">Full Changelog ↗</a>' +
              '</div>' +
              '<div class="space-y-2 max-h-[260px] overflow-auto pr-1">' +
                '<div class="p-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-[#eef1f5] dark:border-slate-700">' +
                  '<div class="flex items-center justify-between mb-1"><span class="font-mono font-bold text-[#1a4fa0] dark:text-blue-300 text-[11px]">v1.0.3.9</span><span class="text-[10px] text-[#6b7280]">Latest Release</span></div>' +
                  '<div class="text-[11.5px] text-[#4b5563] dark:text-slate-300">Health radar on PDF one-pager · Expected risk cost on All Risks &amp; sponsor-attention flags · Blocked future-month status reports · Faster indexed reads on large sites.</div>' +
                '</div>' +
                '<div class="p-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-[#eef1f5] dark:border-slate-700">' +
                  '<div class="flex items-center justify-between mb-1"><span class="font-mono font-bold text-[#4b5563] dark:text-slate-300 text-[11px]">v1.0.3.8</span><span class="text-[10px] text-[#6b7280]">Security</span></div>' +
                  '<div class="text-[11.5px] text-[#4b5563] dark:text-slate-300">Live permission inspection: Setup &amp; Security wizards reflect list inheritance directly without browser cache lagging.</div>' +
                '</div>' +
                '<div class="p-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-[#eef1f5] dark:border-slate-700">' +
                  '<div class="flex items-center justify-between mb-1"><span class="font-mono font-bold text-[#4b5563] dark:text-slate-300 text-[11px]">v1.0.3.7</span><span class="text-[10px] text-[#6b7280]">Milestones &amp; Admin</span></div>' +
                  '<div class="text-[11.5px] text-[#4b5563] dark:text-slate-300">Milestone Trend Analysis (MTA) chart on project Milestones tab · Compact Security &amp; Permissions table with batch actions.</div>' +
                '</div>' +
                '<div class="p-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-[#eef1f5] dark:border-slate-700">' +
                  '<div class="flex items-center justify-between mb-1"><span class="font-mono font-bold text-[#4b5563] dark:text-slate-300 text-[11px]">v1.0.3.6 – v1.0.3.2</span><span class="text-[10px] text-[#6b7280]">Foundational Suite</span></div>' +
                  '<div class="text-[11.5px] text-[#4b5563] dark:text-slate-300">5-Axis Health Radar · 5,000-item threshold resolution · Output % &amp; mood tracking · Optional Decision Log.</div>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="pt-3 border-t border-[#eef1f5] dark:border-slate-700 flex items-center justify-between text-[11px] text-[#6b7280]">' +
              '<span>Actively maintained in-tenant SPFx app.</span>' +
              '<a href="/release-notes/" target="_blank" class="px-3 py-1.5 rounded bg-[#1a4fa0] hover:bg-[#123a7c] text-white font-semibold transition">Open Release Notes Page →</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }
    var p = byNum(S.project); if (!p) return '';
    var raw = rawInputs(p), now = scoresFor(p), prevRep = p.statusHistory.filter(function (h) { return h.submitted; })[1];
    var prev = prevRep ? scoresFor(p, new Date(prevRep.submitted), prevRep.outputPct, prevRep.engagement) : null;
    var pc = function (v) { return v == null ? 'no data' : Math.round(v) + '%'; };
    var based = ['Output ' + pc(raw.output) + ' vs time elapsed ' + pc(raw.time), 'Output ' + pc(raw.output) + ' vs budget used ' + pc(raw.budget), 'Latest submitted Status Report', 'Latest Status Report (' + (p.engagement ? FACES[p.engagement - 1] : '—') + ')', 'Expected risk cost ' + pc(raw.exposure) + ' of budget'];
    return '<div class="absolute inset-0 z-40 bg-[#1f2430]/40 flex items-start justify-center p-6 overflow-auto" data-act="overlay"><div class="' + CARD + ' w-full max-w-[880px] shadow-xl" data-stop><div class="flex items-center justify-between px-4 py-2.5 border-b border-[#e1e5eb] dark:border-slate-700"><b>Project Health — ' + p.number + '</b><button data-act="closemodal" class="text-[18px] leading-none text-[#6b7280]">×</button></div><div class="p-4 flex flex-wrap gap-5 items-start">' + radar(now, 300, { previous: prev }) +
      '<table class="flex-1 min-w-[280px] text-[12.5px] border-collapse"><thead><tr><th class="' + TH + '">Axis</th><th class="' + TH + '">Score</th><th class="' + TH + '">Based on</th></tr></thead><tbody>' + AXES.map(function (a, i) { var b = bandLabel(now[i], i); return '<tr><td class="' + TD + '">' + a + '</td><td class="' + TD + ' ' + BAND_CLS[b.cls] + '">' + b.text + '</td><td class="' + TD + ' text-[#4b5563] dark:text-slate-300">' + based[i] + '</td></tr>'; }).join('') + '</tbody></table><div class="basis-full text-[11.5px] text-[#6b7280]">Further out is healthier. ' + (prev ? 'Dashed grey: the report of ' + fmtDate(prevRep.submitted) + '.' : '') + '</div></div></div></div>';
  }
  function renderPopoverHost() { return '<div data-pop class="hidden absolute z-50 w-[360px] ' + CARD + ' p-3 shadow-[0_10px_28px_rgba(20,30,60,.18)] pointer-events-none"></div>'; }
  function popContent(p) {
    var sc = scoresFor(p);
    return '<div class="font-bold text-[12.5px] mb-1">' + p.number + ' — ' + esc(p.name) + '</div><div class="flex justify-center text-[#1f2430] dark:text-slate-100">' + radar(sc, 220) + '</div><div class="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 text-[11.5px] mt-1">' + AXES.map(function (a, i) { var b = bandLabel(sc[i], i); return '<span>' + a + '</span><span class="' + BAND_CLS[b.cls] + '">' + (sc[i] == null || i === OUTPUT_AXIS ? b.text : Math.round(sc[i]) + ' ' + b.text) + '</span>'; }).join('') + '</div>';
  }

  // ---------- render + events ----------
  function render() {
    var body = { allProjects: renderAllProjects, myProjects: renderMyProjects, myPortfolio: renderMyPortfolio, search: renderSearch, project: renderProject, milestones: renderMilestones, risks: renderRisks, analytics: renderAnalytics, heatmap: renderHeatmap }[S.page] || renderAllProjects;
    var scroll = ROOT.querySelector('.ppm-scroll'), st = scroll ? scroll.scrollTop : 0;
    var focusKey = document.activeElement && ROOT.contains(document.activeElement) ? document.activeElement.getAttribute('data-input') : null;
    ROOT.innerHTML = renderChrome('<div class="pt-2">' + renderTopNav() + body() + '</div>');
    var sc = ROOT.querySelector('.ppm-scroll'); if (sc && S._keepScroll) sc.scrollTop = st; S._keepScroll = false;
    if (focusKey) { var el = ROOT.querySelector('[data-input="' + focusKey + '"]'); if (el) { el.focus(); var v = el.value; if (el.setSelectionRange) el.setSelectionRange(v.length, v.length); } }
  }
  function toast(msg) { var t = ROOT.querySelector('[data-toast]'); if (!t) return; t.textContent = 'Demo · ' + msg; t.style.opacity = '1'; clearTimeout(toast._t); toast._t = setTimeout(function () { t.style.opacity = '0'; }, 2600); }
  function switchPersona(name) {
    var p = (DATA.personas || []).filter(function (x) { return x.name === name; })[0];
    if (!p) return;
    DATA.currentUser = { name: p.name, initials: p.initials, role: p.role };
    if (S.page === 'myPortfolio' && !isPortfolioManager()) {
      S.page = 'myProjects';
    }
    S.portfolios = [];
    S._keepScroll = false;
    toast('Switched demo user to ' + p.name + ' (' + p.label + ')');
    render();
  }
  function go(page, num, tab) {
    if (page === 'myPortfolio' && !isPortfolioManager()) {
      page = 'myProjects';
    }
    S.page = page; S.reportsOpen = false; S.userMenuOpen = false; S.modal = null;
    if (num) { S.project = num; S.tab = tab || 'overview'; S.riskCell = null; }
    if (page !== 'project') S.overviewTab = 'overview';
    render();
  }
  function onClick(e) {
    var t = e.target.closest('[data-act]');
    if (!t || !ROOT.contains(t)) {
      if (S.reportsOpen || S.userMenuOpen) {
        S.reportsOpen = false;
        S.userMenuOpen = false;
        render();
      }
      return;
    }
    var a = t.getAttribute('data-act'), p = a.split(':'), k = p[0];
    if (t.tagName === 'A') e.preventDefault();
    if (k === 'overlay' && e.target !== t) return;
    if (k === 'closemodal' || k === 'overlay') { S.modal = null; S._keepScroll = true; render(); return; }
    if (k === 'go') return go(p[1]);
    if (k === 'open') return go('project', p[1], p[2]);
    if (k === 'tab') { S.tab = p[1]; S.riskCell = null; S._keepScroll = true; return render(); }
    if (k === 'otab') { S.overviewTab = p[1]; S._keepScroll = true; return render(); }
    if (k === 'expand') { e.stopPropagation(); S.expanded[p[1]] = !S.expanded[p[1]]; S._keepScroll = true; return render(); }
    if (k === 'view') { S.view = p[1]; S._keepScroll = true; return render(); }
    if (k === 'reports') { S.reportsOpen = !S.reportsOpen; S.userMenuOpen = false; S._keepScroll = true; return render(); }
    if (k === 'toggle-user-menu') { S.userMenuOpen = !S.userMenuOpen; S.reportsOpen = false; S._keepScroll = true; return render(); }
    if (k === 'set-persona') { S.userMenuOpen = false; return switchPersona(p[1]); }
    if (k === 'zoom') { var z = +p[1]; S.zoom = z === 0 ? 100 : Math.max(90, Math.min(150, S.zoom + z)); S._keepScroll = true; return render(); }
    if (k === 'about') { S.modal = 'about'; S._keepScroll = true; return render(); }
    if (k === 'healthmodal') { S.modal = 'health'; S._keepScroll = true; return render(); }
    if (k === 'cell') { S.riskCell = p[1] === 'clear' ? null : [p[1], p[2]]; S._keepScroll = true; return render(); }
    if (k === 'toggle-closed-my') { S.showClosedMyProjects = !S.showClosedMyProjects; S._keepScroll = true; return render(); }
    if (k === 'pf') {
      var v = a.slice(3);
      if (v === '*') S.portfolios = []; else { var i = S.portfolios.indexOf(v); if (i === -1) S.portfolios.push(v); else S.portfolios.splice(i, 1); if (S.portfolios.length === DATA.portfolios.length) S.portfolios = []; }
      S._keepScroll = true; return render();
    }
    if (k === 'toast') { e.stopPropagation(); return toast(a.slice(6)); }
  }
  function onInput(e) {
    var k = e.target.getAttribute && e.target.getAttribute('data-input'); if (!k) return;
    S[k] = e.target.value; S._keepScroll = true; render();
  }
  function onOver(e) {
    var t = e.target.closest && e.target.closest('[data-health]'), pop = ROOT.querySelector('[data-pop]');
    if (!pop) return;
    if (!t) { pop.classList.add('hidden'); return; }
    var p = byNum(t.getAttribute('data-health')); if (!p) return;
    pop.innerHTML = popContent(p); pop.classList.remove('hidden');
    var r = t.getBoundingClientRect(), R = ROOT.firstChild.getBoundingClientRect(), W = 360, H = pop.offsetHeight;
    var x = Math.min(r.left - R.left + 24, R.width - W - 10), y = r.top - R.top - 10;
    if (y + H > R.height - 10) y = Math.max(10, R.height - H - 10);
    pop.style.left = Math.max(10, x) + 'px'; pop.style.top = y + 'px';
  }
  function mount(el, opts) {
    DATA = window.PPM_DEMO_DATA;
    if (!DATA) { el.innerHTML = '<div style="padding:16px;font:13px sans-serif;color:#b91c1c">PPM demo: window.PPM_DEMO_DATA not found. Load ppm-demo-data.js first.</div>'; return; }
    ROOT = el; S = freshState();
    OPTS = Object.assign({ chrome: el.getAttribute('data-chrome') || 'sharepoint', height: el.getAttribute('data-height') || 760 }, opts || {});
    S.page = OPTS.page || el.getAttribute('data-page') || 'allProjects';
    S.project = OPTS.project || el.getAttribute('data-project') || DATA.projects[0].number;
    S.tab = OPTS.tab || el.getAttribute('data-tab') || 'overview';
    if (OPTS.portfolios) S.portfolios = OPTS.portfolios;
    if (OPTS.modal) S.modal = OPTS.modal;
    if (OPTS.view) S.view = OPTS.view;
    if (OPTS.analyticsProject) S.analyticsProject = OPTS.analyticsProject;
    if (OPTS.overviewTab) S.overviewTab = OPTS.overviewTab;
    if (!el._ppmBound) {
      el.addEventListener('click', onClick);
      el.addEventListener('input', function (e) { if (e.target.tagName === 'INPUT' && e.target.type !== 'checkbox') onInput(e); });
      el.addEventListener('change', function (e) { if (e.target.tagName === 'SELECT') onInput(e); });
      el.addEventListener('mouseover', onOver); el.addEventListener('focusin', onOver);
      el.addEventListener('mouseleave', function () { var pop = ROOT.querySelector('[data-pop]'); if (pop) pop.classList.add('hidden'); });
      el._ppmBound = true;
    }
    render();
  }

  window.PPMCompassDemo = { mount: mount, go: go, showHealth: function (num) { var el = ROOT.querySelector('[data-health="' + num + '"]'); if (el) onOver({ target: el }); } };
  function auto() { var el = document.getElementById('ppm-compass-demo') || document.querySelector('[data-ppm-demo]'); if (el) mount(el); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto); else auto();
})();
