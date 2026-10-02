/*!
 * PPM Compass 360 -- interactive website demo.
 * Vanilla JS (ES6+ IIFE), no dependencies, no bundler. Styled with Tailwind utility classes
 * (incl. dark: variants). Reads mock data from window.PPM_DEMO_DATA (see ppm-demo-data.js).
 *
 * Usage:
 *   <div id="ppm-compass-demo" data-page="allProjects" data-chrome="sharepoint" data-height="760"></div>
 *   <script src="ppm-demo-data.js"><\/script>
 *   <script src="ppm-compass-demo.js"><\/script>
 * Options (data- attributes on the mount element):
 *   data-page    allProjects | myProjects | myPortfolio | search | strategy | milestones | risks | analytics | heatmap | project
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
  function fmtDate(iso) { if (!iso) return '-'; var d = new Date(iso + (iso.length === 10 ? 'T00:00:00Z' : '')); return pad(d.getUTCDate()) + '.' + pad(d.getUTCMonth() + 1) + '.' + d.getUTCFullYear(); }
  function fmtNum(n) { return n == null ? '-' : Math.round(n).toLocaleString(S.lang === 'de' ? 'de-CH' : 'en-US'); }
  var DE_COMPACT = typeof Intl !== 'undefined' ? new Intl.NumberFormat('de-CH', { notation: 'compact', maximumFractionDigits: 1 }) : null;
  function fmtMoney(n) { if (n == null) return '-'; if (S.lang === 'de' && DE_COMPACT) return DE_COMPACT.format(n); if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M'; if (n >= 1e3) return Math.round(n / 1e3) + 'k'; return String(n); } // no currency symbol, as in the app
  function monthLabel(ym) { var m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; var p = ym.split('-'); return m[+p[1] - 1] + ' ' + p[0]; }
  function daysBetween(a, b) { return Math.round((new Date(b) - new Date(a)) / 864e5); }
  function initials(name) { return (name || '?').replace(/^Dr\.\s*/, '').split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase(); }
  var AV = [['#e7f6ec', '#067647'], ['#fdf3e3', '#b45309'], ['#efeafd', '#6d28d9'], ['#e8f0fc', '#1a4fa0'], ['#fde8ef', '#be185d'], ['#e6f6f5', '#0f766e']];
  function avatar(name) {
    var h = 0; for (var i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    var c = AV[h % AV.length];
    return '<span class="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full text-[8px] font-bold shrink-0" style="background:' + c[0] + ';color:' + c[1] + '">' + initials(name) + '</span>';
  }
  function person(name) { return name ? '<span class="inline-flex items-center gap-1.5 whitespace-nowrap">' + avatar(name) + '<span>' + esc(name) + '</span></span>' : '<span class="text-[#9aa3b2]">-</span>'; }

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

  // ---------- health scoring (mirrors utils/projectHealth.ts) ----------
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
    var eng = g ? g * 20 : null; // 1-5 smiley -> 20/40/60/80/100
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
  function freshState() { return { archive: 'active', lang: 'en', stView: 'map', stNode: null, stType: 'all', stCollapsed: [], stStrategy: '', stPortfolio: '', stAssess: '', stMine: false, flowBy: 'budget', flowSec: false, flowCollapsed: [2], flowFocus: null, storyClosed: ['comments'], page: 'allProjects', project: null, tab: 'overview', portfolios: [], view: 'list', query: '', expanded: {}, zoom: 100,
    reportsOpen: false, userMenuOpen: false, modal: null, overviewTab: 'overview', includeClosed: false, showClosedMyProjects: false, analyticsProject: '', searchQ: 'warehouse', riskCell: null }; }
  var S = freshState();
  function projects() { return DATA.projects; }
  function byNum(n) { return projects().filter(function (p) { return p.number === n; })[0]; }
  function inScope(p) { return !S.portfolios.length || S.portfolios.indexOf(p.portfolio) !== -1; }
  function live(p) { return p.status !== 'Closed' && p.active !== false; }
  function schedCheck(p) {
    var open = p.status !== 'Closed' && !archived(p), latest = null;
    p.milestones.forEach(function (m) { if (m.status === 'Cancelled') return; var d = m.actual || m.forecast || m.baseline; if (d && (!latest || d > latest)) latest = d; });
    return { endPassed: open && p.end < DATA.today, msAfter: !!latest && latest > p.end, latest: latest };
  }
  function schedText(c) { return (c.endPassed ? 'The Target End Date has passed but the project is not closed. Update the date or close the project. ' : '') + (c.msAfter ? 'A milestone (' + fmtDate(c.latest) + ') lies after the Target End Date. Update the end date or the milestone.' : ''); }
  function schedWarn(p) { var c = schedCheck(p); return c.endPassed || c.msAfter ? ' <span role="img" class="text-[#d97706] cursor-help" title="' + esc(schedText(c).trim()) + '">⚠</span>' : ''; }
  function archived(p) { return p.active === false; }
  function archiveMatch(p) { return S.archive === 'all' || (S.archive === 'archived' ? archived(p) : !archived(p)); }
  function archiveSelect() { return '<select data-input="archive" aria-label="Show active or archived projects" class="rounded-md border border-[#d5dbe4] dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-[12.5px]">' + [['active', 'Active projects'], ['archived', 'Archived projects'], ['all', 'Active and archived']].map(function (o) { return '<option value="' + o[0] + '"' + (S.archive === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>'; }
  function archivedTag(p) { return archived(p) ? ' <span class="ml-1 rounded bg-[#eceef1] dark:bg-slate-700 text-[#4b5563] dark:text-slate-300 px-1.5 py-[1px] text-[10px] font-semibold align-middle">Archived</span>' : ''; }
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
          '<button type="button" data-act="toggle-user-menu" class="flex items-center gap-2 rounded-full hover:bg-white/15 active:bg-white/25 pl-2.5 pr-1.5 py-1 text-white text-[12px] font-medium transition-colors focus:outline-none" title="Current user: ' + esc(DATA.currentUser.name) + ' (' + esc(DATA.currentUser.role) + ') - Click to switch persona">' +
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
      navBtn('myProjects', 'My Projects') + (isPfMgr ? navBtn('myPortfolio', 'My Portfolio') : '') + navBtn('search', 'Search') + navBtn('allProjects', 'All Projects') + (DATA.strategy ? navBtn('strategy', 'Strategy') : '') +
      '<div class="ml-auto flex items-center gap-2 py-2">' +
      '<button type="button" data-act="toast:New Project opens the project form (Portfolio Owners, Deputies and the PPM team)." class="rounded-md bg-[#1a4fa0] hover:bg-[#123a7c] text-white text-[12px] font-semibold px-2.5 py-1">+ New Project</button>' +
      langSelect() + '<span class="hidden sm:inline-flex rounded-md border border-[#d5dbe4] dark:border-slate-600 overflow-hidden text-[11.5px] font-semibold bg-white dark:bg-slate-800"><button data-act="zoom:-10" class="px-2 py-0.5">A−</button><button data-act="zoom:0" class="px-2 py-0.5 border-x border-[#d5dbe4] dark:border-slate-600 text-[#6b7280]">' + S.zoom + '%</button><button data-act="zoom:10" class="px-2 py-0.5">A+</button></span>' +
      '<span class="relative"><button type="button" data-act="reports" title="Reports" class="px-1.5 py-0.5 rounded hover:bg-white/70 ' + (['milestones', 'risks', 'analytics', 'heatmap'].indexOf(S.page) !== -1 ? 'bg-white dark:bg-slate-800 shadow-sm' : '') + '"><svg width="16" height="16" viewBox="0 0 16 16"><rect x="1.5" y="8" width="3" height="6.5" rx=".6" fill="#16a34a"/><rect x="6.5" y="4.5" width="3" height="10" rx=".6" fill="#1a4fa0"/><rect x="11.5" y="1.5" width="3" height="13" rx=".6" fill="#d97706"/></svg></button>' +
      (S.reportsOpen ? '<div class="absolute right-0 top-8 z-30 w-[200px] ' + CARD + ' py-1 shadow-lg">' + rep.map(function (r) { return '<button type="button" data-act="go:' + r[0] + '" class="block w-full text-left px-3 py-1.5 text-[12.5px] hover:bg-[#f5f8fd] dark:hover:bg-slate-700">' + r[1] + '</button>'; }).join('') + '<div class="border-t border-[#e1e5eb] dark:border-slate-700 my-1"></div><button data-act="toast:Export All creates one PowerPoint slide per project for the selected portfolios." class="block w-full text-left px-3 py-1.5 text-[12.5px] hover:bg-[#f5f8fd] dark:hover:bg-slate-700">▤ Export All (PPTX)</button></div>' : '') + '</span>' +
      '<button data-act="toast:Full screen hides the SharePoint page chrome." class="text-[#6b7280] px-1" title="Full screen">⤢</button><button data-act="about" class="text-[#6b7280] hover:text-[#1a4fa0] px-1 transition-colors" title="About PPM Compass 360">ⓘ</button>' +
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
    var shown = list.filter(function (p) { return archiveMatch(p) && (archived(p) || p.status !== 'Closed') && (!q || (p.number + ' ' + p.name + ' ' + p.lead + ' ' + p.sponsor + ' ' + p.phase).toLowerCase().indexOf(q) !== -1); });
    var h = renderPortfolioBar() +
      '<div class="flex flex-wrap items-center gap-2.5 mb-3"><div class="mr-2 text-center leading-none"><div class="text-[30px] font-extrabold">' + list.length + '</div><div class="text-[9px] font-semibold tracking-[.1em] text-[#6b7280] mt-0.5">TOTAL</div></div>' +
      '<span class="inline-flex items-center gap-2 rounded-full border border-[#b9cbe9] bg-[#e8f0fc] dark:bg-blue-900/30 dark:border-blue-800 px-3 py-1.5 text-[12.5px] font-semibold text-[#1a4fa0] dark:text-blue-300">' + run.length + ' Running ' + countDot(rc('Green'), '#16a34a') + countDot(rc('Yellow'), '#d97706') + countDot(rc('Red'), '#dc2626') + '</span>' +
      ['Not Started', 'On Hold', 'Closed'].map(function (st) { return '<span class="rounded-full bg-[#e4e8ee] dark:bg-slate-700 px-3 py-1.5 text-[12.5px] font-semibold ' + (st === 'Closed' ? 'text-[#9aa3b2]' : 'text-[#4b5563] dark:text-slate-300') + '">' + cnt(st) + ' ' + st + '</span>'; }).join('') + '</div>' +
      '<div class="' + CARD + ' p-3 mb-3 flex flex-wrap items-center gap-2"><label class="relative flex-1 min-w-[220px] max-w-[380px]"><span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9aa3b2] text-[12px]">🔍</span><input data-input="query" value="' + esc(S.query) + '" placeholder="Search project #, name, phase, sponsor, lead, or ERP #…" class="w-full rounded-md border border-[#d5dbe4] dark:border-slate-600 dark:bg-slate-900 pl-8 pr-2 py-1.5 text-[12.5px] outline-none focus:border-[#1a4fa0]"></label>' + archiveSelect() +
      btn('Type (3) ▾', 'toast:Filter by project type (PRO, ORG, RES).', 'rounded-full') + btn('Status (4) ▾', 'toast:Filter by status.', 'rounded-full') + btn('⭐ Presets ▾', 'toast:Saved filter presets per user.', 'rounded-full') + btn('Columns (2) ▾', 'toast:Choose columns - your choice is saved to your profile.', 'rounded-full') +
      '<span class="ml-auto inline-flex rounded-md border border-[#d5dbe4] dark:border-slate-600 overflow-hidden text-[12px] font-semibold"><button data-act="view:list" class="px-3 py-1.5 ' + (S.view === 'list' ? 'bg-[#1a4fa0] text-white' : 'bg-white dark:bg-slate-800') + '">≡ List</button><button data-act="view:card" class="px-3 py-1.5 ' + (S.view === 'card' ? 'bg-[#1a4fa0] text-white' : 'bg-white dark:bg-slate-800 text-[#4b5563]') + '">▦ Card</button></span></div>';
    if (S.view === 'card') {
      h += '<div class="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">' + shown.map(function (p) {
        var ms = nextMs(p);
        return '<div data-act="open:' + p.number + '" class="' + CARD + ' p-4 cursor-pointer hover:shadow-[0_4px_16px_rgba(20,30,60,.08)] transition-shadow"><div class="flex items-center justify-between mb-1.5"><span class="font-mono text-[11px] text-[#6b7280]">' + p.number + '</span><span class="inline-flex items-center">' + statusPill(p) + healthIcon(p) + '</span></div>' +
          '<div class="font-bold text-[13.5px] leading-snug mb-1">' + esc(p.name) + archivedTag(p) + '</div><div class="text-[11.5px] text-[#6b7280] mb-3">' + esc(p.portfolio) + ' · ' + esc(p.phase) + '</div>' +
          '<div class="grid grid-cols-4 gap-1.5 mb-3">' + ['timeline', 'budget', 'resources', 'scope'].map(function (k) { return '<div class="text-center rounded px-1 py-1 ' + PILL[ragKey(p.rag[k])] + '"><div class="text-[8.5px] font-bold tracking-wider uppercase opacity-80">' + (k === 'scope' ? 'Scope' : k === 'timeline' ? 'Schedule' : k) + '</div><div class="text-[11px] font-bold">' + esc(p.rag[k]) + '</div></div>'; }).join('') + '</div>' +
          '<div class="flex items-center justify-between text-[11.5px]">' + person(p.lead) + '<span class="text-[#6b7280]">' + (ms ? 'Next: ' + esc(ms.name) + ' · ' + fmtDate(ms.forecast) : 'No open milestones') + '</span></div></div>';
      }).join('') + '</div>';
    } else {
      h += '<div class="' + CARD + ' overflow-x-auto"><table class="w-full border-collapse text-[12.5px]"><thead><tr><th class="' + TH + ' w-6"></th><th class="' + TH + '">Status</th><th class="' + TH + '">Project #</th><th class="' + TH + '">Project Name</th><th class="' + TH + '">Portfolio</th><th class="' + TH + '">Phase</th><th class="' + TH + '">Priority</th><th class="' + TH + '">Lead</th></tr></thead><tbody>' +
        shown.map(function (p, i) {
          var ex = S.expanded[p.number];
          return '<tr data-act="open:' + p.number + '" class="cursor-pointer ' + (i % 2 ? 'bg-[#fafbfd] dark:bg-slate-800/60' : '') + ' hover:bg-[#f2f6fc] dark:hover:bg-slate-700/60"><td class="' + TD + ' text-[#9aa3b2] text-[10px]"><button data-act="expand:' + p.number + '" class="px-1">' + (ex ? '▾' : '▸') + '</button></td><td class="' + TD + ' whitespace-nowrap">' + statusPill(p) + healthIcon(p) + '</td><td class="' + TD + ' font-mono text-[11.5px] text-[#4b5563] dark:text-slate-400">' + p.number + '</td><td class="' + TD + ' font-bold">' + esc(p.name) + archivedTag(p) + '</td><td class="' + TD + ' text-[#4b5563] dark:text-slate-300">' + esc(p.portfolio) + '</td><td class="' + TD + '">' + esc(p.phase) + '</td><td class="' + TD + '">' + esc(p.priority) + '</td><td class="' + TD + '">' + person(p.lead) + '</td></tr>' +
            (ex ? '<tr class="bg-[#f7f9fc] dark:bg-slate-800"><td></td><td colspan="7" class="px-3 py-3 border-b border-[#eef1f5] dark:border-slate-700"><div class="flex flex-wrap gap-6 text-[12px]"><div><div class="text-[10px] uppercase tracking-wider text-[#6b7280] mb-1">RAG</div><div class="flex gap-1.5">' + ['timeline', 'budget', 'resources', 'scope'].map(function (k) { return '<span class="text-[10px] text-[#6b7280] uppercase">' + (k === 'timeline' ? 'sched' : k.slice(0, 5)) + '</span>' + ragBadge(p.rag[k]); }).join('') + '</div></div><div><div class="text-[10px] uppercase tracking-wider text-[#6b7280] mb-1">Sponsor</div>' + esc(p.sponsor) + '</div><div><div class="text-[10px] uppercase tracking-wider text-[#6b7280] mb-1">Dates</div>' + fmtDate(p.start) + ' → ' + fmtDate(p.end) + '</div><div><div class="text-[10px] uppercase tracking-wider text-[#6b7280] mb-1">ERP #</div>' + esc(p.erp) + '</div></div></td></tr>' : '');
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
      '</div><div class="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 mb-3">' +
      tile('Reporting Compliance', '<div class="text-[16px] font-bold">' + sub + ' of ' + due.length + ' <span class="text-[12px] font-normal text-[#6b7280]">September reports submitted</span></div>') +
      tile('Upcoming Milestones (next 30 days)', '<div class="text-[16px] font-bold">' + up + '</div>') + tile('Schedule check', (function () {
        var hits = list.filter(function (p) { return p.status !== 'Closed' && !archived(p); }).map(function (p) { return { p: p, c: schedCheck(p) }; }).filter(function (x) { return x.c.endPassed || x.c.msAfter; });
        if (!hits.length) return '<div class="text-[16px] font-bold text-[#16a34a]">All dates consistent</div>';
        return '<div class="text-[16px] font-bold text-[#d97706]">' + hits.length + ' project' + (hits.length === 1 ? '' : 's') + '</div>' + hits.map(function (x) {
          return '<a href="#" data-act="open:' + x.p.number + '" class="block text-[11.5px] mt-1 hover:underline"><b>' + x.p.number + '</b> · ' + [x.c.endPassed ? 'End date passed' : '', x.c.msAfter ? 'Milestone after end (' + fmtDate(x.c.latest) + ')' : ''].filter(Boolean).join(' · ') + '</a>';
        }).join('');
      })()) + '</div>';
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
        var rep = p.status === 'Not Started' ? '<span class="text-[#9aa3b2]">-</span>' : last && last.submitted ? '<span class="text-[#15803d] text-[11.5px]">✔ Submitted ' + fmtDate(last.submitted) + '</span>' : '<button data-act="toast:Opens the Status Report wizard for this month." class="inline-flex items-center gap-1 rounded border border-[#f59e0b] bg-[#fffaf0] text-[#b45309] px-2 py-0.5 text-[11px] font-semibold">⏰ Overdue - Start Status Report</button>';
        var mine = function (n) { return n === me ? '<b class="text-[#1a4fa0] dark:text-blue-300">' + esc(n) + '</b> <span class="text-[#1a4fa0] dark:text-blue-300 text-[8px]">●</span>' : esc(n); };
        return '<tr data-act="open:' + p.number + '" class="cursor-pointer hover:bg-[#f2f6fc] dark:hover:bg-slate-700/60"><td class="' + TD + ' whitespace-nowrap">' + ragBadge(p.status === 'Running' ? p.rag.overall : p.status) + healthIcon(p) + '</td><td class="' + TD + ' font-bold">' + p.number + '</td><td class="' + TD + '">' + esc(p.name) + '</td><td class="' + TD + ' text-[#4b5563] dark:text-slate-300">' + esc(p.portfolio) + '</td><td class="' + TD + '">' + p.type + ' - ' + esc(p.phase) + '</td><td class="' + TD + '"><span class="inline-flex items-center gap-1.5">' + avatar(p.sponsor) + mine(p.sponsor) + '</span></td><td class="' + TD + '"><span class="inline-flex items-center gap-1.5">' + avatar(p.lead) + mine(p.lead) + '</span></td><td class="' + TD + '">' + (p.deputy ? '<span class="inline-flex items-center gap-1.5">' + avatar(p.deputy) + mine(p.deputy) + '</span>' : '-') + '</td><td class="' + TD + '">' + rep + '</td></tr>';
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
    var h = pageTitle('My Portfolio', 'Your owned portfolio' + (owned.length > 1 ? 's' : '') + ' (' + owned.join(', ') + ') at a glance - click any tile or card below to see what’s behind the number.') +
      renderPortfolioBar('Showing only portfolios you own as Portfolio Manager.', owned) +
      tiles(list);
    h += '<div class="' + CARD + ' overflow-x-auto p-3"><div class="font-bold text-[13px] mb-1">Projects in scope (' + list.length + ')</div><table class="w-full border-collapse text-[12.5px]"><thead><tr>' +
      ['Project', 'Portfolio', 'RAG', 'Phase', 'Next Milestone', 'Burn %', 'Blockers', 'PL'].map(function (t) { return '<th class="' + TH + '">' + t + '</th>'; }).join('') + '</tr></thead><tbody>' +
      (list.length ? list.map(function (p) {
        var ms = nextMs(p), B = totalBudget(p.financials), burn = B && p.status !== 'Not Started' ? Math.round((p.financials.opexActual + p.financials.capexActual) / B * 100) : null;
        var bl = openRisks(p).filter(function (r) { return r.rating === 'Critical' || r.rating === 'High'; }).length;
        return '<tr class="hover:bg-[#f2f6fc] dark:hover:bg-slate-700/60"><td class="' + TD + '"><a href="#" data-act="open:' + p.number + '" class="font-semibold text-[#1a4fa0] dark:text-blue-300 hover:underline">' + p.number + ' - ' + esc(p.name) + '</a></td><td class="' + TD + ' text-[#4b5563] dark:text-slate-300">' + esc(p.portfolio) + '</td><td class="' + TD + ' whitespace-nowrap">' + ragBadge(p.status === 'Running' ? p.rag.overall : p.status) + healthIcon(p) + '</td><td class="' + TD + '">' + esc(p.phase) + '</td><td class="' + TD + '">' + (ms ? esc(ms.name) + ' (' + fmtDate(ms.forecast) + ')' : '-') + '</td><td class="' + TD + ' ' + (burn > 85 ? 'text-[#dc2626] font-semibold' : '') + '">' + (burn == null ? '-' : burn + '%') + '</td><td class="' + TD + ' ' + (bl ? 'font-semibold' : '') + '">' + bl + '</td><td class="' + TD + '">' + esc(p.lead) + '</td></tr>';
      }).join('') : '<tr><td colspan="8" class="p-6 text-center text-[#6b7280]">No projects found in the selected portfolio filter.</td></tr>') + '</tbody></table></div>';
    return h;
  }

  // ---------- Search ----------
  function renderSearch() {
    var q = S.searchQ.toLowerCase(), list = projects().filter(archiveMatch);
    var mp = q.length < 3 ? [] : list.filter(function (p) { return (p.number + ' ' + p.name).toLowerCase().indexOf(q) !== -1; });
    var mm = q.length < 3 ? [] : allMs(list).filter(function (m) { return (m.name + ' ' + m.p.name).toLowerCase().indexOf(q) !== -1; });
    var mr = q.length < 3 ? [] : allRisks(list).filter(function (r) { return (r.description + ' ' + r.p.name).toLowerCase().indexOf(q) !== -1; });
    var sec = function (title, n, rows) { return '<div class="' + CARD + ' mb-3"><div class="px-4 py-2 border-b border-[#e1e5eb] dark:border-slate-700 font-bold text-[12.5px]">' + title + ' <span class="text-[#6b7280] font-normal">(' + n + ')</span></div>' + (rows || '<div class="px-4 py-3 text-[#9aa3b2] text-[12px]">No matches.</div>') + '</div>'; };
    var row = function (act, a, b, c) { return '<button data-act="' + act + '" class="flex w-full items-center gap-3 px-4 py-2 text-left border-b border-[#eef1f5] dark:border-slate-700 last:border-0 hover:bg-[#f2f6fc] dark:hover:bg-slate-700/60">' + a + '<span class="font-semibold">' + b + '</span><span class="ml-auto text-[11.5px] text-[#6b7280]">' + c + '</span></button>'; };
    return pageTitle('Search', 'One search across projects, milestones, risks &amp; issues and change requests.') +
      '<div class="' + CARD + ' p-3 mb-3"><input data-input="searchQ" value="' + esc(S.searchQ) + '" placeholder="Type at least 3 characters…" class="w-full rounded-md border border-[#d5dbe4] dark:border-slate-600 dark:bg-slate-900 px-3 py-2 text-[13px] outline-none focus:border-[#1a4fa0]"><div class="flex flex-wrap gap-4 mt-2 text-[12px]">' + ['Projects', 'Milestones', 'Risks &amp; Issues', 'Change Requests'].map(function (t) { return '<label class="inline-flex items-center gap-1.5"><input type="checkbox" checked class="accent-[#1a4fa0]">' + t + '</label>'; }).join('') + '<label class="inline-flex items-center gap-1.5 text-[#6b7280]"><input type="checkbox" class="accent-[#1a4fa0]">Include closed projects</label>' + archiveSelect() + '</div><div class="text-[11.5px] text-[#6b7280] mt-2">' + (mp.length + mm.length + mr.length) + ' results across 4 of 4 sources</div></div>' +
      sec('Projects', mp.length, mp.map(function (p) { return row('open:' + p.number, statusPill(p) + healthIcon(p), p.number + ' - ' + esc(p.name), esc(p.phase)); }).join('')) +
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
    h += '<div class="' + CARD + ' px-4 py-3.5"><div class="flex flex-wrap justify-between gap-4"><div><div class="flex items-center gap-2"><span class="text-[10px] text-[#6b7280] border border-[#d5dbe4] rounded px-1">▾</span><div class="text-[17px] font-extrabold">' + p.number + ' - ' + esc(p.name) + archivedTag(p) + '</div></div><div class="flex flex-wrap gap-1.5 mt-1.5">' + chip(p.type) + chip('Phase: ' + p.type + ' - ' + esc(p.phase)) + chip('ERP #: ' + esc(p.erp)) + chip('Last Status Update: ' + (last ? fmtDate(last.submitted) : '-')) + '</div></div>' +
      '<div class="flex flex-wrap gap-2">' + ragBox('Schedule', p.rag.timeline) + ragBox('Budget', p.rag.budget) + ragBox('Resources', p.rag.resources) + ragBox('Scope/Qual.', p.rag.scope) + '</div></div>' +
      '<div class="grid gap-3 mt-3.5 pt-3.5 border-t border-[#eef1f5] dark:border-slate-700 grid-cols-2 md:grid-cols-[minmax(110px,1fr)_minmax(110px,1fr)_minmax(80px,.7fr)_minmax(230px,1.7fr)_auto]">' +
      meta('Project Leader', esc(p.lead) + (p.deputy ? '<div class="text-[10.5px] text-[#6b7280] font-normal">Deputy: ' + esc(p.deputy) + '</div>' : '')) + meta('Sponsor', esc(p.sponsor) + '<div class="text-[10.5px] text-[#6b7280] font-normal">' + esc(p.sponsorTitle) + '</div>') + meta('Priority', esc(p.priority)) +
      meta('Dates', '<div class="flex items-start gap-3"><div>' + fmtDate(p.start) + '<div class="text-[10px] text-[#6b7280] font-normal">(first MS: ' + fmtDate(sorted[0].forecast) + ')</div></div><span class="text-[#6b7280]">→</span><div>' + fmtDate(p.end) + schedWarn(p) + '<div class="text-[10px] text-[#6b7280] font-normal">(last MS: ' + fmtDate(sorted[sorted.length - 1].forecast) + ')</div></div></div>') +
      '<div class="justify-self-end"><div class="text-[10px] font-semibold uppercase tracking-[.08em] text-[#6b7280] text-right">Health</div><button data-act="healthmodal" title="Project Health Radar: click to enlarge" class="block mt-0.5 rounded-md border border-transparent hover:border-[#c7d3e8] hover:bg-[#f5f8fd] cursor-zoom-in text-[#1f2430]">' + radar(scoresFor(p), 52, { mini: true }) + '</button></div></div></div>';
    if (archived(p)) h += '<div class="mt-3 rounded-md border border-[#d5dbe4] bg-[#eceef1] dark:bg-slate-700 dark:border-slate-600 px-3 py-2 text-[12px]">🗄️ This project is archived: everything is read-only. The PPM team or the portfolio owner can make it active again under Edit project.</div>';
    else if (p.status === 'Closed') h += '<div class="mt-3 rounded-md border border-[#d5dbe4] bg-[#eceef1] px-3 py-2 text-[12px]">🔒 This project is Closed. Milestones, Risks &amp; Issues, Change Requests, Status Reports, Team and Quick Links are locked for everyone.</div>';
    if (p.status === 'On Hold') h += '<div class="mt-3 rounded-md border border-[#f59e0b] bg-[#fffaf0] px-3 py-2 text-[12px] text-[#92400e]">⏸️ This project is On Hold. Nothing is locked - this is a reminder that RAG status and milestone dates may not reflect active progress right now.</div>';
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
  function strategyLine(p) {
    if (!DATA.strategy) return '';
    var ls = DATA.strategy.links.filter(function (l) { return l.projectId === p.id; }).sort(function (a, b) { return (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0); });
    return '<p class="pt-2 border-t border-[#eef1f5] dark:border-slate-700"><b>Strategy:</b> ' + (ls.length ? ls.map(function (l) {
      var n = stNode(l.nodeId), par = stNode(n.parentId);
      var ctx = n.nodeType === 'Initiative' ? 'Initiative · ' + par.title : 'Objective · ' + par.title;
      return '<button data-act="snode:' + n.id + '" class="font-semibold text-[#1a4fa0] dark:text-blue-300 hover:underline" title="' + esc(stPath(n.id).concat(n.title).join(' › ') + (l.rationale ? ' - ' + l.rationale : '')) + '">' + esc(n.title) + '</button> <span class="text-[#6b7280]">(' + esc(ctx) + ')</span>' + (l.isPrimary && ls.length > 1 ? ' <span class="rounded bg-[#e6eefb] text-[#1a4fa0] px-1.5 py-[1px] text-[10px] font-bold">primary</span>' : '');
    }).join(' <span class="text-[#9aa3b2]">·</span> ') : '<span class="text-[#6b7280]">no link</span>') + '</p>';
  }
  function tabOverview(p) {
    var last = p.statusHistory[0];
    var monthName = last ? monthLabel(last.month).replace(/(\w+) (\d+)/, function (_, m, y) { return { Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June', Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December' }[m] + ' ' + y; }) : '';
    var attn = openRisks(p).sort(function (a, b) { return RATING_ORDER.indexOf(a.rating) - RATING_ORDER.indexOf(b.rating); }).slice(0, 3);
    var up = p.milestones.filter(function (m) { return !m.actual; }).slice(0, 4);
    var h = '<div class="' + EYEBROW + '">🖼️ Project &amp; Goals</div><div class="grid gap-3 md:grid-cols-[1fr_2fr]"><div class="' + CARD + ' p-2 h-[190px]">' + projectImage(p) + '</div><div class="' + CARD + ' p-4 text-[12.5px] space-y-2"><p><b>Goal:</b> ' + esc(p.goal) + '</p><p><b>Scope:</b> ' + esc(p.scope) + '</p><p><b>Success:</b> ' + esc(p.success) + '</p>' + strategyLine(p) + '</div></div>';
    h += '<div class="' + EYEBROW + '">🗓️ Latest Update · Next Steps</div><div class="grid gap-3 md:grid-cols-2"><div class="' + CARD + ' p-4"><div class="font-bold text-[13px] mb-1.5">Achievements - ' + monthName + '</div><div class="text-[12.5px]">' + esc(p.achievements) + '</div></div><div class="' + CARD + ' p-4"><div class="font-bold text-[13px] mb-1.5">Plan for Next Period</div><div class="text-[12.5px]">' + esc(p.nextSteps) + '</div></div></div>';
    if (p.ragReason) h += '<div class="mt-3 border-l-4 border-[#d97706] pl-3 py-1 text-[12.5px]">⚠️ <b>Status yellow/red:</b> ' + esc(p.ragReason) + '</div>';
    h += '<div class="' + EYEBROW + '">⚠️ Risks &amp; Change Control</div><div class="grid gap-3 md:grid-cols-[3fr_2fr]"><div class="' + CARD + ' p-4"><div class="font-bold text-[13px] mb-2">Issues &amp; Risks for Sponsor’s Attention</div>' +
      (attn.length ? attn.map(function (r) { return '<div class="mb-3 last:mb-0"><span class="inline-block rounded px-1.5 py-[1px] text-[10px] font-bold ' + (RATING_CLS[r.rating] || '') + '">' + r.type + ' · ' + r.rating + '</span><div class="text-[12.5px] mt-1">' + esc(r.description) + '</div><div class="text-[11px] text-[#6b7280]">Owner: ' + esc(r.owner) + (r.exposure ? ' · Est. cost ' + fmtMoney(r.exposure) : '') + '</div></div>'; }).join('') : '<div class="text-[#9aa3b2]">Nothing open.</div>') +
      '</div><div class="' + CARD + ' p-4"><div class="font-bold text-[13px] mb-2">Change History</div>' + p.changeRequests.map(function (c) { return '<div class="pb-2 mb-2 border-b border-dashed border-[#e1e5eb] dark:border-slate-700 last:border-0"><div class="flex items-center justify-between"><span><b>' + c.number + '</b> <span class="text-[11px] text-[#6b7280]">' + fmtDate(c.date) + '</span></span>' + (c.status === 'Approved' ? '<span class="rounded px-1.5 text-[10px] font-bold bg-[#e7f6ec] text-[#15803d]">🔒 Approved</span>' : '<span class="rounded px-1.5 text-[10px] font-bold bg-[#fdf3e3] text-[#b45309]">Submitted</span>') + '</div><div class="text-[12px] text-[#4b5563] dark:text-slate-300">' + esc(c.title) + '</div><div class="text-[11px] text-[#6b7280]">Category: ' + c.category + ' · ' + esc(c.impact) + '</div></div>'; }).join('') + '</div></div>';
    h += '<div class="' + EYEBROW + '">🏁 Upcoming Milestones</div><div class="' + CARD + ' overflow-x-auto"><table class="w-full border-collapse text-[12.5px]"><tbody>' + up.map(function (m) { var s = slip(m); return '<tr><td class="' + TD + ' w-8">' + (MS_ICON[m.type] || '🏁') + '</td><td class="' + TD + ' font-semibold">' + esc(m.name) + '</td><td class="' + TD + '">' + fmtDate(m.forecast) + (s > 0 ? ' <span class="rounded bg-[#fbe9e9] text-[#dc2626] text-[10px] font-bold px-1">+' + s + 'd</span>' : '') + '</td><td class="' + TD + ' ' + (MS_CLS[m.status] || '') + ' font-semibold">' + m.status + '</td></tr>'; }).join('') + '</tbody></table></div>';
    return h;
  }

  // ---------- v1.5 demo: Team / Heatmap / Status History as in the product ----------
  var WIN = ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12', '2027-01', '2027-02', '2027-03'];
  var CUR = '2026-09';
  var FUNC = { 'Project Leader': 'PMO', 'Deputy': 'PMO', 'Business Analyst': 'Business', 'Data Analyst': 'Business', 'Architect': 'IT', 'Solution Architect': 'IT', 'Developer': 'IT', 'Integration Specialist': 'IT', 'UX Designer': 'IT', 'Test Analyst': 'Quality', 'QA Lead': 'Quality', 'Trainer': 'Change', 'Change Manager': 'Change' };
  var CAP = { 'Devon Clark': 80, 'Hannah Novak': 60, 'Felix Braun': 90, 'Lucia Moreno': 80 };
  function fnOf(role) { return FUNC[role] || 'PMO'; }
  // Allocation of one team row per window month (% FTE): data plan for Oct–Mar, Sep = first plan month, Apr–Aug = actuals.
  function allocRow(p, t) {
    return WIN.map(function (ym, j) {
      if (ym < (p.start || '').slice(0, 7)) return 0;
      if (j >= 6) return t.fte[j - 6];
      if (j === 5) return t.fte[0];
      return t.fte[(j + 2) % 6];
    });
  }
  function bandCls(ratio, v) { return !v ? 'empty' : ratio > 1 ? 'over' : ratio >= 0.8 ? 'high' : ratio >= 0.4 ? 'med' : 'low'; }
  var BAND = { empty: 'background:#fff;color:#9aa3b2', low: 'background:#eaf3ea;color:#1e6b3a', med: 'background:#cdeccd;color:#14532d', high: 'background:#fde68a;color:#92400e', over: 'background:#fecaca;color:#991b1b' };
  function legend(first) {
    var sw = function (k, l) { return '<span class="inline-flex items-center gap-1"><i class="inline-block w-3 h-3 rounded-sm border border-[#e1e5eb]" style="' + BAND[k] + '"></i>' + l + '</span>'; };
    return '<div class="flex flex-wrap gap-3 text-[11px] text-[#6b7280] my-2">' + sw('low', first) + sw('med', '40–80%') + sw('high', '80–100%') + sw('over', first.indexOf('capacity') !== -1 ? 'Over capacity' : 'Over 100%') + '</div>';
  }
  function monHead(ym, withKind) {
    var plan = ym >= CUR;
    return '<th class="' + TH + ' text-center' + (ym === CUR ? ' border-l-2 border-l-[#1a4fa0]' : '') + '">' + monthLabel(ym).toUpperCase() + (withKind ? '<div class="text-[8.5px] font-bold tracking-[.08em] opacity-70">' + (plan ? 'PLAN' : 'ACTUAL') + '</div>' : '') + '</th>';
  }
  function navBtns(extra) { return '<div class="flex items-center gap-1.5">' + btn('◀', 'toast:Back 3 months') + btn('Today', 'toast:Jump to today') + btn('▶', 'toast:Forward 3 months') + (extra || '') + '</div>'; }
  function tabHistory(p) {
    var sub = p.statusHistory.filter(function (r) { return r.submitted; });
    var view = S.histView || 'feed';
    var seg = '<div class="inline-flex rounded-md overflow-hidden border border-[#d5dbe4]">' + [['feed', 'Feed'], ['compare', 'Compare']].map(function (x) { var on = view === x[0]; return '<button type="button" data-act="hview:' + x[0] + '" class="px-3 py-1 text-[12px] font-semibold ' + (on ? 'bg-[#1a4fa0] text-white' : 'bg-white text-[#6b7280] dark:bg-slate-800') + '">' + x[1] + '</button>'; }).join('') + '</div>';
    var h = '<div class="flex items-center justify-between mt-4 mb-3">' + btn('+ New Status Report', 'toast:Opens the two-step status report wizard.', 'border-[#1a4fa0] text-[#1a4fa0]') + seg + '</div>';
    var box = function (l, v) { return ragBox(l, v || 'N/A'); };
    var smiley = ['', '😟', '🙁', '😐', '🙂', '😀'];
    var names = function (r, i) { return i === 0 ? r : null; };
    if (view === 'compare') {
      if (sub.length < 2) return h + '<div class="' + CARD + ' p-4 text-[12.5px] text-[#6b7280]">Needs at least 2 submitted reports to compare</div>';
      var a = sub[1], b = sub[0];
      var rows = [['Overall', 'overall'], ['Schedule', 'timeline'], ['Budget', 'budget'], ['Resources', 'resources'], ['Scope/Qual.', 'scope'], ['Output', 'outputPct'], ['Team engagement', 'engagement']];
      return h + '<div class="' + CARD + ' p-3 overflow-x-auto"><table class="w-full border-collapse text-[12.5px]"><thead><tr><th class="' + TH + '"></th><th class="' + TH + '">' + monthLabel(a.month) + '</th><th class="' + TH + '">' + monthLabel(b.month) + '</th></tr></thead><tbody>' +
        rows.map(function (r) { var va = a[r[1]], vb = b[r[1]], diff = va !== vb, fmt = function (v) { return r[1] === 'outputPct' ? v + '%' : r[1] === 'engagement' ? smiley[v] || '-' : ragBadge(v); };
          return '<tr' + (diff ? ' style="background:#fff8e6"' : '') + '><td class="' + TD + ' font-semibold">' + r[0] + '</td><td class="' + TD + '">' + fmt(va) + '</td><td class="' + TD + '">' + fmt(vb) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    }
    return h + sub.map(function (r, i) {
      var latest = i === 0;
      var txt = function (l, v) { return v ? '<div class="mt-1.5"><b>' + l + '</b> ' + esc(v) + '</div>' : ''; };
      var reason = (r.overall === 'Yellow' || r.overall === 'Red') && latest ? p.ragReason : '';
      return '<div class="' + CARD + ' px-4 py-3 mb-3"><div class="flex flex-wrap justify-between gap-2"><div class="font-bold text-[13px]">' + monthLabel(r.month).replace(/^(\w+)/, function (m) { return { Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June', Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December' }[m]; }) + '</div>' +
        '<div class="text-[11px] text-[#6b7280]">Submitted by ' + esc(p.lead) + ' on ' + fmtDate(r.submitted) + ' · <a href="#" data-act="toast:Opens the submitted report; unlocking follows the report rules." class="text-[#1a4fa0] font-semibold">View / Unlock</a></div></div>' +
        '<div class="flex flex-wrap gap-2 mt-2 items-stretch">' + box('Schedule', r.timeline) + box('Budget', r.budget) + box('Resources', r.resources) + box('Scope/Qual.', r.scope) +
        '<div class="rounded-md border border-[#e1e5eb] px-2.5 py-1 flex items-center gap-2 text-[9px] font-bold tracking-[.08em] text-[#6b7280]">OUTPUT <span class="inline-block w-14 h-[5px] rounded-full bg-[#eceef1] overflow-hidden"><span class="block h-full bg-[#1a4fa0]" style="width:' + (r.outputPct || 0) + '%"></span></span><span class="text-[12px] text-[#1f2430] dark:text-slate-200">' + (r.outputPct || 0) + '%</span></div>' +
        '<div class="rounded-md border border-[#e1e5eb] px-2.5 py-1 flex items-center gap-2 text-[9px] font-bold tracking-[.08em] text-[#6b7280]">TEAM <span class="text-[16px]">' + (smiley[r.engagement] || '-') + '</span></div></div>' +
        (latest ? '<div class="text-[12.5px] mt-2">' + txt('Achievements:', p.achievements) + txt('Plan for next period:', p.nextSteps) + (reason ? txt('Reason (Yellow/Red):', reason) : '') + '</div>' : '') +
        '<div class="text-[10.5px] text-[#9aa3b2] mt-2">PL at the time: ' + esc(p.lead) + ' · Sponsor at the time: ' + esc(p.sponsor) + ' · Phase at the time: ' + esc(p.phase) + ' · Status at the time: Running · Priority at the time: ' + esc(p.priority) + '</div></div>';
    }).join('');
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
      rows.map(function (m) { var s = slip(m); return '<tr><td class="' + TD + ' font-mono text-[11px] text-[#6b7280]">' + m.id + '</td><td class="' + TD + '">' + (MS_ICON[m.type] || '') + ' ' + esc(m.name) + '</td><td class="' + TD + '">' + m.type + '</td><td class="' + TD + '">' + fmtDate(m.baseline) + '</td><td class="' + TD + '">' + fmtDate(m.forecast) + (s > 0 ? ' <span class="rounded bg-[#fbe9e9] text-[#dc2626] text-[10px] font-bold px-1">+' + s + 'd</span>' : s < 0 ? ' <span class="rounded bg-[#e7f6ec] text-[#15803d] text-[10px] font-bold px-1">' + s + 'd</span>' : '') + '</td><td class="' + TD + '">' + (m.actual ? fmtDate(m.actual) : '-') + '</td><td class="' + TD + ' font-semibold ' + (MS_CLS[m.status] || '') + '">' + m.status + '</td><td class="' + TD + '"><input type="checkbox" ' + (m.show ? 'checked' : '') + ' class="accent-[#1a4fa0]"></td></tr>'; }).join('') + '</tbody></table></div>';
  }
  function tabCrs(p) {
    return '<div class="flex justify-end mt-4 mb-2">' + pbtn('+ New Change Request', 'toast:New Change Request - approval runs through Power Automate.') + '</div><div class="' + CARD + ' overflow-x-auto"><table class="w-full border-collapse text-[12.5px]"><thead><tr>' + ['CR #', 'Date', 'Title', 'Category', 'Impact', 'Requested by', 'Status'].map(function (t) { return '<th class="' + TH + '">' + t + '</th>'; }).join('') + '</tr></thead><tbody>' +
      p.changeRequests.map(function (c) { return '<tr><td class="' + TD + ' font-bold">' + c.number + '</td><td class="' + TD + '">' + fmtDate(c.date) + '</td><td class="' + TD + '">' + esc(c.title) + '</td><td class="' + TD + '">' + c.category + '</td><td class="' + TD + '">' + esc(c.impact) + '</td><td class="' + TD + '">' + person(c.requestedBy) + '</td><td class="' + TD + '">' + (c.status === 'Approved' ? '<span class="rounded px-1.5 text-[10.5px] font-bold bg-[#e7f6ec] text-[#15803d]">🔒 Approved</span>' : '<span class="rounded px-1.5 text-[10.5px] font-bold bg-[#fdf3e3] text-[#b45309]">Submitted</span>') + '</td></tr>'; }).join('') + '</tbody></table></div>';
  }
  function tabDecisions(p) {
    return '<div class="flex flex-wrap justify-between items-center gap-2 mt-4 mb-2"><div class="text-[12.5px] text-[#6b7280]">What was decided, when, by whom and why. Drafts can be edited; recorded decisions are locked.</div>' + pbtn('+ New Decision', 'toast:New decision - save as draft, or record it (then it is locked).') + '</div>' +
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
      I.forEach(function (i) { var n = risks.filter(function (r) { return r.likelihood === l && r.impact === i; }).length; var on = sel && sel[0] === l && sel[1] === i; o += '<button data-act="cell:' + l + ':' + i + '" class="h-[40px] rounded text-white text-center leading-tight ' + (on ? 'ring-2 ring-offset-1 ring-[#1f2430]' : '') + '" style="background:' + cellCol(l, i) + ';opacity:' + (n ? 1 : .35) + '"><div class="text-[15px] font-extrabold">' + (n || '-') + '</div><div class="text-[8.5px] opacity-90">' + l + '×' + i + '</div></button>'; });
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
      rows.map(function (r) { return '<tr>' + (withProject ? '<td class="' + TD + '"><a href="#" data-act="open:' + r.p.number + ':risks" class="font-semibold text-[#1a4fa0]">' + r.p.number + '</a></td>' : '') + '<td class="' + TD + ' font-mono text-[11px] text-[#6b7280]">' + r.id + '</td><td class="' + TD + '">' + r.type + '</td><td class="' + TD + ' max-w-[380px]">' + esc(r.description) + '</td><td class="' + TD + '">' + r.category + '</td><td class="' + TD + '">' + ratingBadge(r.rating) + '</td><td class="' + TD + '">' + r.status + '</td><td class="' + TD + '">' + person(r.owner) + '</td><td class="' + TD + ' whitespace-nowrap">' + (r.exposure ? fmtMoney(r.exposure) + ' <span class="text-[10px] text-[#6b7280]">× ' + (r.type === 'Issue' ? '100' : Math.round(PROB[r.likelihood] * 100)) + '%</span>' : '-') + '</td></tr>'; }).join('') + '</tbody></table>';
  }
  function tabRisks(p) {
    var risks = openRisks(p);
    var sel = S.riskCell, shown = sel ? risks.filter(function (r) { return r.likelihood === sel[0] && r.impact === sel[1]; }) : p.risks;
    return '<div class="' + CARD + ' p-4 mt-4"><div class="flex items-center justify-between mb-2"><div class="font-bold text-[13px]">Risk Matrix <span class="text-[#9aa3b2] text-[11px]">ⓘ</span></div><span class="text-[11.5px] text-[#6b7280]">▾ Hide</span></div><label class="inline-flex items-center gap-1.5 text-[11.5px] text-[#6b7280] mb-3"><input type="checkbox" checked class="accent-[#1a4fa0]">Include converted Issues</label><div class="flex flex-wrap gap-5 items-center">' + riskMatrix(risks, sel) + sevCards(risks) + '</div></div>' +
      '<div class="flex justify-between items-center mt-3 mb-2"><div class="text-[12px] text-[#6b7280]">' + (sel ? 'Showing ' + sel[0] + ' likelihood × ' + sel[1] + ' impact · <a href="#" data-act="cell:clear" class="text-[#1a4fa0]">clear</a>' : 'All risks &amp; issues (' + p.risks.length + ')') + '</div>' + pbtn('+ New Risk / Issue', 'toast:New Risk or Issue - including the estimated cost if it happens.') + '</div><div class="' + CARD + ' overflow-x-auto">' + riskTable(shown, false) + '</div>';
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
  function tabTeam(p) {
    var cells = function (vals) { return vals.map(function (v, j) { var ym = WIN[j]; return '<td class="px-0.5 py-1' + (ym === CUR ? ' border-l-2 border-l-[#1a4fa0]' : '') + '"><div class="text-center text-[11.5px] font-semibold py-2" style="' + BAND[bandCls(v / 100, v)] + '">' + (v ? v + '%' : '') + '</div></td>'; }).join(''); };
    return '<div class="' + CARD + ' p-4 mt-4"><div class="flex flex-wrap justify-between gap-3"><div><div class="font-bold text-[13px]">Project Team <span class="text-[#9aa3b2] text-[11px]">ⓘ</span></div>' +
      '<div class="text-[11.5px] text-[#6b7280] mt-1 max-w-[520px]">Click a cell to set that person\'s FTE for the month. Past months (<b>ACTUAL</b>) show what happened; the current and future months (<b>PLAN</b>) are the plan.</div></div>' +
      '<div class="flex flex-col items-end gap-2">' + btn('+ Add Team Member', 'toast:Add a person, their role and a starting allocation for this month.', 'border-[#1a4fa0] text-[#1a4fa0]') + navBtns() + '</div></div>' + legend('<40%') +
      '<div class="overflow-x-auto"><table class="w-full border-collapse text-[12.5px]"><thead><tr><th class="' + TH + ' min-w-[170px]">Person</th>' + WIN.map(function (ym) { return monHead(ym, true); }).join('') + '</tr></thead><tbody>' +
      p.team.map(function (t) { return '<tr><td class="' + TD + '"><div class="flex items-start justify-between gap-2"><div>' + person(t.person) + '<div class="text-[10.5px] text-[#6b7280] ml-6">' + esc(t.role) + '</div><div class="text-[10.5px] italic text-[#9aa3b2] ml-6">' + fnOf(t.role) + '</div></div><span class="text-[#9aa3b2] cursor-pointer" title="Remove from project team — deletes their future allocation plan, keeps past months as history">✕</span></div></td>' + cells(allocRow(p, t)) + '</tr>'; }).join('') + '</tbody></table></div></div>';
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
      '<div class="' + CARD + ' p-4 mt-3"><div class="font-bold text-[13px] mb-3">Risk Matrix - portfolio</div><div class="flex flex-wrap gap-5 items-center">' + riskMatrix(risks, null) + sevCards(risks) + '</div></div>';
    return h;
  }

  // ---------- Analytics ----------
  function renderAnalytics() {
    var list = projects().filter(inScope);
    var sel = S.analyticsProject ? byNum(S.analyticsProject) : null;
    var livep = list.filter(function (p) { return p.status !== 'Closed' && p.status !== 'Not Started'; });
    var scores = sel ? scoresFor(sel) : median(livep.map(function (p) { return scoresFor(p); }));
    var h = renderPortfolioBar() + pageTitle('Analytics &amp; Reporting', 'Portfolio-wide trends - health, status history and milestone slippage, built from the Status Reports already captured. Pick a project to see its own.') +
      '<div class="mb-3"><label class="inline-flex items-center gap-2 text-[12.5px] font-semibold">Project <select data-input="analyticsProject" class="rounded-md border border-[#d5dbe4] dark:border-slate-600 dark:bg-slate-800 px-2 py-1 font-normal"><option value="">Whole portfolio</option>' + list.filter(function (p) { return p.status !== 'Not Started'; }).map(function (p) { return '<option value="' + p.number + '" ' + (S.analyticsProject === p.number ? 'selected' : '') + '>' + p.number + ' - ' + esc(p.name) + '</option>'; }).join('') + '</select></label></div>';
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
    projects().filter(function (p) { return inScope(p) && p.status === 'Running'; }).forEach(function (p) { p.team.forEach(function (t) { var e = ppl[t.person] = ppl[t.person] || { role: t.role, m: WIN.map(function () { return 0; }), br: WIN.map(function () { return []; }) }; allocRow(p, t).forEach(function (v, i) { e.m[i] += v; if (v) e.br[i].push(p.number + ' ' + p.name + ' — ' + t.role + ': ' + (v / 100).toFixed(1) + ' FTE'); }); }); });
    var names = Object.keys(ppl).sort();
    var cap = function (n) { return CAP[n] || 100; };
    var cell = function (v, c, j, tip) { var ym = WIN[j]; return '<td class="px-0.5 py-0.5' + (ym === CUR ? ' border-l-2 border-l-[#1a4fa0]' : '') + '"><div class="text-center text-[11.5px] font-semibold py-2.5" title="' + esc(tip || '') + '" style="' + BAND[bandCls(v / c, v)] + '">' + (v ? (v / 100).toFixed(1) : '') + '</div></td>'; };
    var personRow = function (n) { var e = ppl[n]; return '<tr><td class="' + TD + '">' + person(n) + '<div class="text-[10.5px] text-[#1a4fa0] ml-6">' + cap(n) + '% capacity</div><div class="text-[10.5px] text-[#6b7280] ml-6">' + fnOf(e.role) + '</div></td>' + e.m.map(function (v, j) { return cell(v, cap(n), j, n + ' — ' + monthLabel(WIN[j]) + ': ' + (v / 100).toFixed(1) + ' FTE total\n' + e.br[j].join('\n')); }).join('') + '</tr>'; };
    var group = S.hmGroup !== false, body = '';
    if (group) {
      var fns = {}; names.forEach(function (n) { (fns[fnOf(ppl[n].role)] = fns[fnOf(ppl[n].role)] || []).push(n); });
      Object.keys(fns).sort().forEach(function (fn) {
        var list = fns[fn], capSum = list.reduce(function (s, n) { return s + cap(n); }, 0), tot = WIN.map(function (_, j) { return list.reduce(function (s, n) { return s + ppl[n].m[j]; }, 0); });
        body += '<tr><td colspan="' + (WIN.length + 1) + '" class="px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[.06em] text-[#6b7280] bg-[#f7f8fa] dark:bg-slate-700/40">▾ ' + fn + ' (' + list.length + ')</td></tr>' + list.map(personRow).join('') +
          '<tr class="bg-[#f7f8fa] dark:bg-slate-700/40"><td class="' + TD + ' font-bold text-[11.5px]">' + fn + ' subtotal — ' + (capSum / 100).toFixed(1) + ' FTE capacity</td>' + tot.map(function (v, j) { return cell(v, capSum, j, ''); }).join('') + '</tr>';
      });
    } else body = names.map(personRow).join('');
    return renderPortfolioBar() +
      '<div class="flex flex-wrap items-start justify-between gap-3 mt-1"><div>' + pageTitle('Resource Allocation Heatmap', 'Summed monthly FTE per person, across every project, coloured against each person\'s own working capacity. Hover a cell for the per-project breakdown.') + '</div>' +
      navBtns(btn('⬇ Export to Excel', 'toast:Exports the current view with the per-project breakdown.') + btn('↻ Refresh', 'toast:Loads other people\'s latest changes.')) + '</div>' +
      '<div class="flex flex-wrap items-center gap-3 text-[12px] mt-2">' + btn('Function (5 of 5) ▾', 'toast:Filter people by Function.') + '<label class="inline-flex items-center gap-1.5"><input type="checkbox" data-act="hmgroup" ' + (group ? 'checked' : '') + ' class="accent-[#1a4fa0]">Group by Function (with subtotals)</label></div>' + legend('<40% of capacity') +
      '<div class="' + CARD + ' overflow-x-auto"><table class="w-full border-collapse text-[12.5px]"><thead><tr><th class="' + TH + ' min-w-[170px]">Person</th>' + WIN.map(function (ym) { return monHead(ym, false); }).join('') + '</tr></thead><tbody>' + body + '</tbody></table></div>';
  }

  // ---------- modal + popover ----------
  function renderModal() {
    if (S.modal === 'about') {
      return '<div class="absolute inset-0 z-40 bg-[#1f2430]/40 flex items-start justify-center p-6 overflow-auto" data-act="overlay">' +
        '<div class="' + CARD + ' w-full max-w-[560px] shadow-2xl" data-stop>' +
          '<div class="flex items-center justify-between px-4 py-3 border-b border-[#e1e5eb] dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 rounded-t-lg">' +
            '<div class="flex items-center gap-2">' +
              '<span class="text-base">🧭</span>' +
              '<b class="text-[13.5px] font-extrabold text-[#1f2430] dark:text-white">About PPM Compass 360</b>' +
              '<span class="rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">SPFx Solution</span>' +
            '</div>' +
            '<button data-act="closemodal" class="text-[18px] leading-none text-[#6b7280] hover:text-[#1f2430] dark:hover:text-white">×</button>' +
          '</div>' +
          '<div class="p-5 space-y-4 text-[12px] leading-relaxed">' +
            '<div class="p-3 bg-[#e8f0fc] dark:bg-blue-900/30 rounded-lg border border-[#b9cbe9] dark:border-blue-800 text-[#1a4fa0] dark:text-blue-300 font-medium">' +
              'PPM Compass 360 is an enterprise Project Portfolio Management solution engineered natively for Microsoft 365 SharePoint Online. 100% in-tenant governance, zero external databases, flat per-site licensing.' +
            '</div>' +
            '<div class="space-y-2 text-[#4b5563] dark:text-slate-300">' +
              '<p>• <b>Pure Client-Side Architecture:</b> Runs directly inside your browser against standard SharePoint lists.</p>' +
              '<p>• <b>Zero Data Egress:</b> Your project schedules, risks, and financial records never leave your Microsoft 365 tenant boundary.</p>' +
              '<p>• <b>Continuous Governance Improvements:</b> Regularly enhanced with new site owner settings, automated validations, and reporting tools.</p>' +
            '</div>' +
            '<div class="pt-3 border-t border-[#eef1f5] dark:border-slate-700 flex items-center justify-between text-[11px] text-[#6b7280]">' +
              '<span>For detailed version history and changelogs:</span>' +
              '<a href="/release-notes/" target="_blank" class="px-3.5 py-1.5 rounded-lg bg-[#1a4fa0] hover:bg-[#123a7c] text-white font-semibold transition">View Release Notes ↗</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }
    var p = byNum(S.project); if (!p) return '';
    var raw = rawInputs(p), now = scoresFor(p), prevRep = p.statusHistory.filter(function (h) { return h.submitted; })[1];
    var prev = prevRep ? scoresFor(p, new Date(prevRep.submitted), prevRep.outputPct, prevRep.engagement) : null;
    var pc = function (v) { return v == null ? 'no data' : Math.round(v) + '%'; };
    var based = ['Output ' + pc(raw.output) + ' vs time elapsed ' + pc(raw.time), 'Output ' + pc(raw.output) + ' vs budget used ' + pc(raw.budget), 'Latest submitted Status Report', 'Latest Status Report (' + (p.engagement ? FACES[p.engagement - 1] : '-') + ')', 'Expected risk cost ' + pc(raw.exposure) + ' of budget'];
    return '<div class="absolute inset-0 z-40 bg-[#1f2430]/40 flex items-start justify-center p-6 overflow-auto" data-act="overlay"><div class="' + CARD + ' w-full max-w-[880px] shadow-xl" data-stop><div class="flex items-center justify-between px-4 py-2.5 border-b border-[#e1e5eb] dark:border-slate-700"><b>Project Health - ' + p.number + '</b><button data-act="closemodal" class="text-[18px] leading-none text-[#6b7280]">×</button></div><div class="p-4 flex flex-wrap gap-5 items-start">' + radar(now, 300, { previous: prev }) +
      '<table class="flex-1 min-w-[280px] text-[12.5px] border-collapse"><thead><tr><th class="' + TH + '">Axis</th><th class="' + TH + '">Score</th><th class="' + TH + '">Based on</th></tr></thead><tbody>' + AXES.map(function (a, i) { var b = bandLabel(now[i], i); return '<tr><td class="' + TD + '">' + a + '</td><td class="' + TD + ' ' + BAND_CLS[b.cls] + '">' + b.text + '</td><td class="' + TD + ' text-[#4b5563] dark:text-slate-300">' + based[i] + '</td></tr>'; }).join('') + '</tbody></table><div class="basis-full text-[11.5px] text-[#6b7280]">Further out is healthier. ' + (prev ? 'Dashed grey: the report of ' + fmtDate(prevRep.submitted) + '.' : '') + '</div></div></div></div>';
  }
  function renderPopoverHost() { return '<div data-pop class="hidden absolute z-50 w-[360px] ' + CARD + ' p-3 shadow-[0_10px_28px_rgba(20,30,60,.18)] pointer-events-none"></div>'; }
  function popContent(p) {
    var sc = scoresFor(p);
    return '<div class="font-bold text-[12.5px] mb-1">' + p.number + ' - ' + esc(p.name) + '</div><div class="flex justify-center text-[#1f2430] dark:text-slate-100">' + radar(sc, 220) + '</div><div class="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 text-[11.5px] mt-1">' + AXES.map(function (a, i) { var b = bandLabel(sc[i], i); return '<span>' + a + '</span><span class="' + BAND_CLS[b.cls] + '">' + (sc[i] == null || i === OUTPUT_AXIS ? b.text : Math.round(sc[i]) + ' ' + b.text) + '</span>'; }).join('') + '</div>';
  }

  // ---------- Strategy (v1.3.0+, optional module; mirrors PpmStrategy.tsx: Map · Coverage · Maintain, detail) ----------
  var ST_BADGE = { Strategy: 'background:#e6eefb;color:#1a4fa0', Objective: 'background:#efe9fa;color:#5a3d9a', Initiative: 'background:#eceef2;color:#3a4252' };
  var ST_PILL = { g: 'background:#e3f4e8;color:#1e7a3c', a: 'background:#fdf0e0;color:#9a4f06', r: 'background:#fde4e4;color:#c93b3b', gy: 'background:#eceef2;color:#4b5363' };
  var ST_DOT = { g: '#2e8b57', a: '#d98a1c', r: '#c93b3b', gy: '#8a93a3' };
  var ST_ASSESS = { 'On track': 'g', 'At risk': 'a', 'Off track': 'r' };
  var ST_MIX = [['completed', 'Completed', '#1a4fa0'], ['onTrack', 'On track', '#2e8b57'], ['atRisk', 'At risk', '#d98a1c'], ['delayed', 'Delayed', '#c93b3b'], ['notStarted', 'Not started', '#b8bfcc']];
  function stData() { return DATA.strategy || { mode: 'primary', nodes: [], links: [] }; }
  function stNode(id) { return stData().nodes.filter(function (n) { return n.id === id; })[0]; }
  function stKids(id) { return stData().nodes.filter(function (n) { return n.parentId === id; }); }
  function stDesc(id) { var o = []; stKids(id).forEach(function (k) { o.push(k.id); o = o.concat(stDesc(k.id)); }); return o; }
  function stPath(id) { var o = [], n = stNode(id); while (n && n.parentId) { n = stNode(n.parentId); if (n) o.unshift(n.title); } return o; }
  function stProj(id) { return projects().filter(function (p) { return p.id === id; })[0]; }
  function stActive(p) { return !!p && p.status !== 'Closed'; }
  function stUniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
  function stCls(p) { var d = displayStatus(p); return d.key === 'Green' ? 'g' : d.key === 'Yellow' ? 'a' : d.key === 'Red' ? 'r' : 'gy'; }
  function stMixOf(p) {
    var m = { completed: 0, onTrack: 0, atRisk: 0, delayed: 0, notStarted: 0 };
    p.milestones.forEach(function (x) {
      if (x.status === 'Cancelled') return;
      if (x.status === 'Completed' || x.actual) m.completed++;
      else if (x.status === 'On Track') m.onTrack++;
      else if (x.status === 'At Risk') m.atRisk++;
      else if (x.status === 'Delayed') m.delayed++;
      else m.notStarted++;
    });
    return m;
  }
  function stSupporters(scope) { var sup = []; stData().nodes.filter(function (n) { return n.supportsId != null && scope.indexOf(n.supportsId) !== -1; }).forEach(function (n) { sup.push(n.id); sup = sup.concat(stDesc(n.id)); }); return sup; }
  function stRoll(id) {
    var d = stData(), scope = [id].concat(stDesc(id)), sup = stSupporters(scope), LK = stLinks();
    var direct = LK.filter(function (l) { return scope.indexOf(l.nodeId) !== -1 && stActive(stProj(l.projectId)); });
    var dIds = stUniq(direct.map(function (l) { return l.projectId; }));
    var iIds = stUniq(LK.filter(function (l) { return sup.indexOf(l.nodeId) !== -1 && stActive(stProj(l.projectId)); }).map(function (l) { return l.projectId; })).filter(function (x) { return dIds.indexOf(x) === -1; });
    var bIds = d.mode === 'primary' ? stUniq(direct.filter(function (l) { return l.isPrimary; }).map(function (l) { return l.projectId; })) : dIds;
    var plan = 0, used = 0;
    bIds.forEach(function (pid) { var f = stProj(pid).financials; plan += totalBudget(f) || 0; used += (f.opexActual || 0) + (f.capexActual || 0); });
    var mix = { completed: 0, onTrack: 0, atRisk: 0, delayed: 0, notStarted: 0 };
    dIds.forEach(function (pid) { var m = stMixOf(stProj(pid)); ST_MIX.forEach(function (k) { mix[k[0]] += m[k[0]]; }); });
    return { direct: dIds, indirect: iIds, plan: plan, used: used, mix: mix };
  }
  function stAmt(n) { if (S.lang === 'de' && DE_COMPACT) return DE_COMPACT.format(n); if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M'; if (n >= 1e3) return Math.round(n / 1e3) + 'k'; return String(Math.round(n)); }
  function stBudget(r) { return r.plan > 0 ? stAmt(r.used) + ' of ' + stAmt(r.plan) : '-'; }
  function stBadge(n) { var lbl = n.nodeType === 'Strategy' ? (n.strategyType || 'Corporate') : n.nodeType; return '<span class="shrink-0 rounded-full px-2 py-[2px] text-[11px] font-bold" style="' + ST_BADGE[n.nodeType] + '">' + lbl + '</span>'; }
  function stPill(label, cls) { return '<span class="inline-block rounded-full px-2 py-[2px] text-[11px] font-bold whitespace-nowrap" style="' + ST_PILL[cls] + '">' + esc(label) + '</span>'; }
  function stAssess(a, id) { var tr = id != null ? stTrend(id) : ''; return a ? stPill(a + (tr ? ' ' + tr : ''), ST_ASSESS[a] || 'gy') : '<span class="text-[#6b7280]">Not assessed</span>'; }
  function stPeriod(n) { return n.periodStart ? n.periodStart.slice(0, 4) + '–' + n.periodEnd.slice(0, 4) : ''; }
  function stMixTotal(m) { return ST_MIX.reduce(function (s, k) { return s + m[k[0]]; }, 0); }
  function stMixBar(m, act) {
    var tot = stMixTotal(m);
    if (!tot) return '<span class="text-[#6b7280]">-</span>';
    var tip = ST_MIX.map(function (k) { return k[1] + ': ' + m[k[0]]; }).join('&#10;');
    return '<span ' + (act ? 'data-act="' + act + '" ' : '') + 'class="inline-flex items-center gap-2 ' + (act ? 'cursor-pointer' : '') + '" title="' + tip + '"><span class="flex overflow-hidden rounded-full" style="width:96px;height:8px;background:#eceef1">' +
      ST_MIX.map(function (k) { return m[k[0]] ? '<span style="width:' + (m[k[0]] / tot * 100) + '%;background:' + k[2] + '"></span>' : ''; }).join('') + '</span><b class="text-[12px]">' + tot + '</b></span>';
  }
  function stSeg() {
    var v = S.stView === 'detail' ? 'map' : S.stView;
    function b(key, label) { return '<button data-act="sview:' + key + '" class="px-3 py-1.5 ' + (v === key ? 'bg-[#1a4fa0] text-white' : 'bg-white dark:bg-slate-800 text-[#4b5563]') + '">' + label + '</button>'; }
    return '<span class="ml-auto inline-flex rounded-md border border-[#d5dbe4] dark:border-slate-600 overflow-hidden text-[12px] font-semibold">' + b('map', 'Map') + b('flow', 'Flow') + b('story', 'Executive story') + b('coverage', 'Coverage') + b('manage', 'Maintain') + '</span>';
  }
  function stNote() { return stData().mode === 'primary' ? 'A project\'s budget counts only under its primary link, so totals never overlap.' : 'A project\'s budget counts under every link; totals marked * overlap and must not be added up.'; }
  function stChip(act, label, on) { return '<button data-act="' + act + '" class="rounded-full px-3 py-1 text-[12px] font-semibold border ' + (on ? 'bg-[#1a4fa0] text-white border-[#1a4fa0]' : 'bg-white dark:bg-slate-800 border-[#d5dbe4] dark:border-slate-600') + '">' + label + '</button>'; }
  var ST_GRID = 'display:grid;grid-template-columns:minmax(260px,2.4fr) minmax(110px,1fr) minmax(90px,.8fr) minmax(90px,.8fr) minmax(90px,.9fr) minmax(100px,1fr) minmax(130px,1.1fr);gap:10px;align-items:center;min-width:960px';
  var ST_EYE = 'text-[10.5px] font-semibold uppercase tracking-[.06em] text-[#6b7280]';

  // ---------- v1.5 demo: shared filter bar, Flow (Sankey) and Executive story (mirror PpmStrategyFlow/Story.tsx) ----------
  var ST_ROOTCOL = ['#1a4fa0', '#0f8a7e', '#7c3aed', '#b45309', '#be185d', '#0369a1', '#4d7c0f'];
  var ST_COMMENTS = [
    { nodeId: 21, assessment: 'Off track', prev: 'At risk', comment: 'Pilot customers onboard in November instead of October; scope cut to ordering only, tracking moves to phase 2.', date: '2026-09-21', by: 'Jessica Miller' },
    { nodeId: 11, assessment: 'At risk', prev: 'On track', comment: 'ERP go-live wave 1 depends on the integration test backlog; recovery plan agreed with the sponsor.', date: '2026-09-18', by: 'David Vance' },
    { nodeId: 31, assessment: 'At risk', prev: 'At risk', comment: 'Prototype gate moved by three weeks; field test still planned for Q1 2027.', date: '2026-09-15', by: 'Dr. Aris Thorne' }
  ];
  function stTrend(id) { var c = ST_COMMENTS.filter(function (x) { return x.nodeId === id; })[0]; if (!c) return ''; var R = { 'Off track': 0, 'At risk': 1, 'On track': 2 }; var d = R[c.assessment] - R[c.prev]; return d > 0 ? '↑' : d < 0 ? '↓' : ''; }
  function stFilterActive() { return S.stType !== 'all' || !!S.stStrategy || !!S.stPortfolio || !!S.stAssess || S.stMine; }
  function stLinks() { var d = stData(); return S.stPortfolio ? d.links.filter(function (l) { var p = stProj(l.projectId); return p && p.portfolio === S.stPortfolio; }) : d.links; }
  function stAnc(n) { var o = []; while (n && n.parentId) { n = stNode(n.parentId); if (n) o.push(n); } return o; }
  function stVisible() {
    var d = stData(), links = stLinks(), me = DATA.currentUser.name, out = {};
    var linked = links.map(function (l) { return l.nodeId; });
    var served = function (n) { return [n.id].concat(stDesc(n.id)).some(function (id) { return linked.indexOf(id) !== -1; }); };
    var owns = function (n) { return n.ownerName === me || n.deputyName === me; };
    var match = function (n) {
      if (S.stMine && ![n].concat(stAnc(n)).some(owns)) return false;
      if (S.stAssess) {
        if (n.nodeType === 'Strategy') return false;
        var a = n.ownerAssessment || '';
        if (S.stAssess === 'none' && a) return false;
        if (S.stAssess === 'attention' && !(a === 'At risk' || a === 'Off track' || !served(n))) return false;
        if (S.stAssess !== 'none' && S.stAssess !== 'attention' && a !== S.stAssess) return false;
      }
      if (S.stPortfolio && n.nodeType !== 'Strategy' && !served(n)) return false;
      return true;
    };
    var walk = function (n) {
      var any = false; stKids(n.id).forEach(function (k) { if (walk(k)) any = true; });
      var self = n.nodeType === 'Strategy' ? (!S.stAssess && !S.stPortfolio && (!S.stMine || match(n))) : match(n);
      if (self || any) { out[n.id] = true; return true; } return false;
    };
    d.nodes.filter(function (n) { return !n.parentId; })
      .filter(function (s) { return S.stType === 'all' || (s.strategyType || 'Corporate') === S.stType; })
      .filter(function (s) { return !S.stStrategy || String(s.id) === S.stStrategy; })
      .filter(function (s) { return !S.stPortfolio || s.strategyType !== 'Functional' || s.portfolio === S.stPortfolio; })
      .forEach(walk);
    return out;
  }
  function stSel(key, label, opts) { return '<select data-input="' + key + '" aria-label="' + label + '" class="rounded-md border border-[#d5dbe4] dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-[12px]">' + opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(S[key]) === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>'; }
  function stFilterBar(extra) {
    var roots = stData().nodes.filter(function (n) { return !n.parentId && (S.stType === 'all' || (n.strategyType || 'Corporate') === S.stType); });
    var pfs = stUniq(projects().filter(stActive).map(function (p) { return p.portfolio; })).sort();
    return '<div class="' + CARD + ' px-4 py-2.5 mb-3 flex flex-wrap items-center gap-2"><span class="' + ST_EYE + ' mr-1">Type</span>' +
      stChip('stype:all', 'All', S.stType === 'all') + stChip('stype:Corporate', 'Corporate', S.stType === 'Corporate') + stChip('stype:Functional', 'Functional', S.stType === 'Functional') +
      stSel('stStrategy', 'Strategy filter', [['', 'All strategies']].concat(roots.map(function (s) { return [String(s.id), s.title]; }))) +
      stSel('stPortfolio', 'Portfolio filter', [['', 'All portfolios']].concat(pfs.map(function (p) { return [p, p]; }))) +
      stSel('stAssess', 'Assessment', [['', 'All assessments'], ['attention', 'Needs attention'], ['On track', 'On track'], ['At risk', 'At risk'], ['Off track', 'Off track'], ['none', 'Not assessed']]) +
      '<label class="inline-flex items-center gap-1.5 text-[12px] cursor-pointer"><input type="checkbox" data-act="smine" ' + (S.stMine ? 'checked' : '') + ' class="accent-[#1a4fa0]">Only items I own</label>' +
      (stFilterActive() ? stChip('sreset:all', 'Reset filters', false) : '') + (extra || '') + '</div>';
  }

  // Flow: Strategy → Objective → Initiative → Project; band = primary-link budget (or 1 per project).
  function stChain(id) { var o = [], n = stNode(id); while (n) { o.unshift(n); n = n.parentId ? stNode(n.parentId) : null; } return o; }
  function stFlowLayout(vis) {
    var col = { Strategy: 0, Objective: 1, Initiative: 2 }, X = [0, 235, 470, 705], NW = 14, coll = S.flowCollapsed;
    var budget = function (pid) { var p = stProj(pid); return p ? (totalBudget(p.financials) || 0) : 0; };
    var links = stLinks().filter(function (l) { return stActive(stProj(l.projectId)) && vis[l.nodeId] && (l.isPrimary || S.flowSec); });
    var nodes = {}, raw = [];
    var add = function (k, c, extra) { if (!nodes[k]) nodes[k] = Object.assign({ key: k, col: c, value: 0, budget: 0, gap: false }, extra); return nodes[k]; };
    var hidden = function (n) { return stChain(n.id).slice(0, -1).some(function (a) { return coll.indexOf(a.id) !== -1; }); };
    stData().nodes.filter(function (n) { return vis[n.id] && !hidden(n); }).forEach(function (n) { add('n' + n.id, col[n.nodeType], { nodeId: n.id, rootId: stChain(n.id)[0].id }); });
    links.forEach(function (l) {
      var ch = stChain(l.nodeId), root = ch[0].id, v = l.isPrimary ? (S.flowBy === 'budget' ? budget(l.projectId) : 1) : 0;
      var ci = -1; ch.forEach(function (x, i) { if (ci < 0 && coll.indexOf(x.id) !== -1) ci = i; });
      var vs = ci >= 0 ? ch.slice(0, ci + 1) : ch;
      if (vs.some(function (x) { return !nodes['n' + x.id]; })) return;
      for (var i = 0; i < vs.length - 1; i++) raw.push({ from: 'n' + vs[i].id, to: 'n' + vs[i + 1].id, v: v, sec: !l.isPrimary, lid: l.projectId + ':' + l.nodeId, pid: l.projectId, root: root });
      var last = vs[vs.length - 1], to;
      if (ci >= 0) { to = 'g' + last.id; var g = add(to, 3, { nodeId: last.id, rootId: root, group: [] }); if (g.group.indexOf(l.projectId) < 0) g.group.push(l.projectId); }
      else { to = 'p' + l.projectId; add(to, 3, { projectId: l.projectId, rootId: root }); }
      raw.push({ from: 'n' + last.id, to: to, v: v, sec: !l.isPrimary, lid: l.projectId + ':' + l.nodeId, pid: l.projectId, root: root });
      if (l.isPrimary) { vs.forEach(function (x) { nodes['n' + x.id].budget += budget(l.projectId); }); nodes[to].budget += budget(l.projectId); }
    });
    var inV = {}, outV = {}, touched = {};
    raw.forEach(function (r) { outV[r.from] = (outV[r.from] || 0) + r.v; inV[r.to] = (inV[r.to] || 0) + r.v; touched[r.from] = touched[r.to] = true; });
    Object.keys(nodes).forEach(function (k) { var n = nodes[k], sn = n.nodeId != null ? stNode(n.nodeId) : null; n.value = Math.max(inV[k] || 0, outV[k] || 0); n.gap = k[0] === 'n' && sn && sn.nodeType !== 'Strategy' && !touched[k] && coll.indexOf(sn.id) === -1; });
    var seq = [], cols = [[], [], [], []];
    var walk = function (n) { if (!nodes['n' + n.id]) return; seq.push('n' + n.id); if (coll.indexOf(n.id) !== -1) return; stKids(n.id).forEach(walk); };
    stData().nodes.filter(function (n) { return !n.parentId; }).forEach(walk);
    seq.forEach(function (k) { cols[nodes[k].col].push(nodes[k]); });
    seq.forEach(function (k) { raw.filter(function (r) { return r.from === k && (r.to[0] === 'p' || r.to[0] === 'g'); }).forEach(function (r) { if (cols[3].indexOf(nodes[r.to]) < 0) cols[3].push(nodes[r.to]); }); });
    var rows = Math.max.apply(null, cols.map(function (c) { return c.length; }).concat([1])), H = Math.max(360, rows * 38), PAD = 8, SLOT = 30, GAP = 10;
    var sc = cols.map(function (c) { var tot = c.reduce(function (s, n) { return s + n.value; }, 0), z = c.filter(function (n) { return !n.value; }).length; return tot ? (H - PAD * Math.max(0, c.length - 1) - z * GAP) / tot : Infinity; }).filter(function (x) { return isFinite(x) && x > 0; });
    var scale = sc.length ? Math.min.apply(null, sc) : 1, height = 0, oy = {}, iy = {};
    cols.forEach(function (c, ci) { var y = 6; c.forEach(function (n) { n.x = X[ci]; n.y = y; n.h = n.value ? Math.max(2, n.value * scale) : GAP; oy[n.key] = iy[n.key] = y; y += Math.max(n.h, SLOT) + PAD; }); height = Math.max(height, y); });
    var pos = function (k) { return cols[nodes[k].col].indexOf(nodes[k]); };
    var lks = raw.slice().sort(function (a, b) { return pos(a.from) - pos(b.from) || pos(a.to) - pos(b.to); }).map(function (r) {
      var a = nodes[r.from], b = nodes[r.to], th = r.sec ? 2 : Math.max(1, r.v * scale);
      var y0 = r.sec ? a.y + a.h / 2 : oy[r.from] + th / 2, y1 = r.sec ? b.y + b.h / 2 : iy[r.to] + th / 2;
      if (!r.sec) { oy[r.from] += th; iy[r.to] += th; }
      return Object.assign({}, r, { th: th, x0: a.x + NW, x1: b.x, y0: y0, y1: y1 });
    });
    return { nodes: cols.reduce(function (a, c) { return a.concat(c); }, []), links: lks, height: height + 10, NW: NW };
  }
  function stRootCol(id) { var roots = stData().nodes.filter(function (n) { return !n.parentId; }); var i = roots.map(function (r) { return r.id; }).indexOf(id); return ST_ROOTCOL[Math.max(0, i) % ST_ROOTCOL.length]; }
  function stCut(s, m) { return s.length > m ? s.slice(0, m - 1) + '…' : s; }
  function renderStrategyFlow() {
    var vis = stVisible(), L = stFlowLayout(vis), RAGC = { g: '#2e8540', a: '#e8a33d', r: '#c93b3b', gy: '#9aa3b2' };
    var amt = function (v) { return S.flowBy === 'budget' ? stAmt(v) : Math.round(v) + ' proj.'; };
    var lab = function (n) {
      if (n.projectId != null) { var p = stProj(n.projectId); return { t: p.number + ' ' + p.name, s: stAmt(n.budget) + ' · ' + displayStatus(p).label, c: RAGC[stCls(p)] }; }
      if (n.group) return { t: n.group.length + ' projects (collapsed)', s: stAmt(n.budget), c: '#b8bfcc', i: 1 };
      var sn = stNode(n.nodeId); return { t: sn.title, s: n.gap ? 'no project' : (n.value ? amt(n.value) : 'secondary links only') + (sn.ownerAssessment ? ' · ' + sn.ownerAssessment : ''), c: n.col === 0 ? stRootCol(sn.id) : '#5b6b86' };
    };
    var hot = null, hotN = {};
    if (S.flowFocus) { hot = {}; L.links.forEach(function (l) { if (l.from === S.flowFocus || l.to === S.flowFocus) hot[l.lid] = 1; }); L.links.forEach(function (l) { if (hot[l.lid]) { hotN[l.from] = hotN[l.to] = 1; } }); }
    var svg = '<svg viewBox="0 0 960 ' + L.height + '" style="width:100%;height:auto;display:block" font-family="inherit">';
    L.links.forEach(function (l) { var m = (l.x0 + l.x1) / 2, op = hot ? (hot[l.lid] ? .65 : .07) : .35; svg += '<path d="M' + l.x0 + ',' + l.y0 + 'C' + m + ',' + l.y0 + ' ' + m + ',' + l.y1 + ' ' + l.x1 + ',' + l.y1 + '" fill="none" stroke="' + stRootCol(l.root) + '" stroke-opacity="' + op + '" stroke-width="' + l.th + '"' + (l.sec ? ' stroke-dasharray="4 3"' : '') + '><title>' + esc(lab(L.nodes.filter(function (n) { return n.key === l.from; })[0]).t + ' → ' + lab(L.nodes.filter(function (n) { return n.key === l.to; })[0]).t) + '&#10;' + (l.sec ? 'Secondary link (not counted)' : amt(l.v)) + '</title></path>'; });
    L.nodes.forEach(function (n) {
      var b = lab(n), sn = n.nodeId != null ? stNode(n.nodeId) : null, tg = sn && !n.group && n.col < 2 && (stKids(sn.id).length || stData().links.some(function (x) { return x.nodeId === sn.id; }));
      var closed = sn && S.flowCollapsed.indexOf(sn.id) !== -1, lx = n.x + L.NW + (tg ? 24 : 6), op = hot && !hotN[n.key] ? .3 : 1;
      svg += '<g data-act="ffocus:' + n.key + '" style="cursor:pointer;opacity:' + op + '"><title>' + esc(b.t) + '</title>' + (n.gap ? '<rect x="' + n.x + '" y="' + n.y + '" width="' + L.NW + '" height="' + n.h + '" rx="2" fill="#fff" stroke="#c93b3b" stroke-dasharray="3 2"/>' : '<rect x="' + n.x + '" y="' + n.y + '" width="' + L.NW + '" height="' + n.h + '" rx="2" fill="' + b.c + '"/>') +
        '<text x="' + lx + '" y="' + (n.y + 13) + '" font-size="12" fill="currentColor" font-weight="' + (n.col === 0 ? 700 : 500) + '"' + (b.i ? ' font-style="italic"' : '') + '>' + esc(stCut(b.t, n.col === 3 ? 36 : tg ? 26 : 30)) + '</text><text x="' + lx + '" y="' + (n.y + 26) + '" font-size="10.5" fill="' + (n.gap ? '#c93b3b' : '#6b7280') + '">' + esc(stCut(b.s, 44)) + '</text></g>' +
        (tg ? '<g data-act="fcoll:' + sn.id + '" style="cursor:pointer"><title>' + (closed ? 'Expand' : 'Collapse') + '</title><circle cx="' + (n.x + L.NW + 11) + '" cy="' + (n.y + 9) + '" r="7" fill="#fff" stroke="#8a93a3"/><text x="' + (n.x + L.NW + 11) + '" y="' + (n.y + 13) + '" text-anchor="middle" font-size="12" font-weight="700" fill="#4b5563">' + (closed ? '+' : '−') + '</text></g>' : '');
    });
    svg += '</svg>';
    var foc = S.flowFocus ? L.nodes.filter(function (n) { return n.key === S.flowFocus; })[0] : null, focBar = '';
    if (foc) { var fb = lab(foc); focBar = '<div class="flex items-center gap-3 rounded-md px-3 py-1.5 mb-2 text-[12.5px]" style="background:#f2f6fc;border:1px solid #d7e1f0"><b>' + esc(fb.t) + '</b>' + (foc.projectId != null ? '<a href="#" data-act="open:' + stProj(foc.projectId).number + '" class="text-[#1a4fa0] font-semibold">Open project →</a>' : foc.group ? '' : '<a href="#" data-act="snode:' + foc.nodeId + '" class="text-[#1a4fa0] font-semibold">Open details →</a>') + '<a href="#" data-act="ffocus:" class="ml-auto text-[#1a4fa0] font-semibold">Show all</a></div>'; }
    var chip = function (v, l) { return stChip('fby:' + v, l, S.flowBy === v); };
    var COLH = 'display:grid;grid-template-columns:repeat(4,1fr)';
    return stFilterBar() + '<div class="' + CARD + ' p-4"><div class="flex flex-wrap items-center gap-2 mb-2"><span class="' + ST_EYE + '">Width by</span>' + chip('budget', 'Budget') + chip('projects', 'Projects') +
      '<label class="inline-flex items-center gap-1.5 text-[12px] cursor-pointer"><input type="checkbox" data-act="fsec" ' + (S.flowSec ? 'checked' : '') + ' class="accent-[#1a4fa0]">Show secondary links</label><span class="ml-auto"></span>' + stChip('fexpand:all', 'Expand all', false) + '</div>' + focBar +
      '<div class="' + ST_EYE + '" style="' + COLH + ';margin-bottom:4px"><span>Strategy</span><span>Objective</span><span>Initiative</span><span>Project</span></div>' + (L.nodes.length ? svg : '<div class="text-[#6b7280] py-4">Nothing matches the filters.</div>') +
      '<div class="flex flex-wrap gap-4 mt-2 text-[11.5px] text-[#6b7280]"><span>Band colour = strategy</span><span>Project = latest RAG</span><span>Dashed red = no project yet</span><span>⊖ / ⊕ folds a branch · click a node to trace its flows</span></div></div>' +
      '<p class="text-[11.5px] text-[#6b7280] mt-2">Budget counts once, under each project\'s primary link. Closed and archived projects are left out.</p>';
  }

  // Executive story
  function renderStrategyStory() {
    var vis = stVisible(), d = stData(), act = projects().filter(function (p) { return stActive(p) && (!S.stPortfolio || p.portfolio === S.stPortfolio); }), actIds = act.map(function (p) { return p.id; });
    var links = stLinks().filter(function (l) { return actIds.indexOf(l.projectId) !== -1; });
    var shown = d.nodes.filter(function (n) { return vis[n.id]; }), objs = shown.filter(function (n) { return n.nodeType === 'Objective'; });
    var cnt = function (a) { return objs.filter(function (o) { return (o.ownerAssessment || '') === a; }).length; };
    var projOf = function (id) { var sc = [id].concat(stDesc(id)); return stUniq(links.filter(function (l) { return sc.indexOf(l.nodeId) !== -1; }).map(function (l) { return l.projectId; })); };
    var rank = function (n) { return n.ownerAssessment === 'Off track' ? 0 : 1; };
    var bad = function (n) { return n.ownerAssessment === 'At risk' || n.ownerAssessment === 'Off track'; };
    var attn = shown.filter(function (n) { return n.nodeType !== 'Strategy' && bad(n) && !(n.nodeType === 'Initiative' && shown.some(function (p) { return p.id === n.parentId && bad(p) && rank(p) <= rank(n); })); }).sort(function (a, b) { return rank(a) - rank(b) || (a.title < b.title ? -1 : 1); });
    var gaps = shown.filter(function (n) { return n.nodeType !== 'Strategy' && !projOf(n.id).length && !(n.nodeType === 'Initiative' && shown.some(function (p) { return p.id === n.parentId; }) && !projOf(n.parentId).length); });
    var bud = function (pid) { return totalBudget(stProj(pid).financials) || 0; };
    var aligned = stUniq(links.filter(function (l) { return l.isPrimary && vis[l.nodeId]; }).map(function (l) { return l.projectId; })).reduce(function (s, p) { return s + bud(p); }, 0);
    var total = act.reduce(function (s, p) { return s + (totalBudget(p.financials) || 0); }, 0), pct = total ? Math.round(aligned / total * 100) : 0;
    var orphans = act.filter(function (p) { return !links.some(function (l) { return l.projectId === p.id; }); });
    var roots = shown.filter(function (n) { return n.nodeType === 'Strategy'; });
    var lead = cnt('On track') + ' of ' + objs.length + ' objectives are on track. ' + (attn.length ? attn.length + ' need attention, led by ' + attn[0].title + ' (' + attn[0].ownerAssessment.toLowerCase() + '). ' : '') + pct + '% of the active project budget (' + stAmt(aligned) + ' of ' + stAmt(total) + ') is linked to a strategic objective. ' + (gaps.length ? 'Objectives and initiatives without a project: ' + gaps.length + ' (' + gaps.map(function (g) { return g.title; }).join(', ') + ').' : 'Every objective has at least one project.');
    var end = new Date(Date.parse(DATA.today + 'T00:00:00Z') + 30 * 864e5).toISOString().slice(0, 10);
    var up = [];
    act.forEach(function (p) { var l = links.filter(function (x) { return x.projectId === p.id && vis[x.nodeId]; }).sort(function (a, b) { return b.isPrimary - a.isPrimary; })[0]; if (!l) return; p.milestones.forEach(function (m) { if (!m.actual && m.status !== 'Completed' && m.status !== 'Cancelled' && m.forecast >= DATA.today && m.forecast <= end) up.push({ p: p, m: m, n: stNode(l.nodeId) }); }); });
    up.sort(function (a, b) { return a.m.forecast < b.m.forecast ? -1 : 1; });
    var MSC = { 'On Track': 'g', 'At Risk': 'a', 'Delayed': 'r' };
    var blk = function (k, title, body) { var c = S.storyClosed.indexOf(k) !== -1; return '<section style="border-top:1px solid #e3e7ee;margin-top:12px;padding-top:10px"><div class="flex items-center gap-2"><h3 class="font-bold text-[14px] flex-1">' + title + '</h3><button data-act="sblk:' + k + '" aria-label="' + (c ? 'Expand' : 'Collapse') + ': ' + title + '" title="' + (c ? 'Expand' : 'Collapse') + '" class="rounded-md border border-[#d5dbe4] bg-white dark:bg-slate-800 text-[12px]" style="width:26px;height:24px">' + (c ? '▸' : '▾') + '</button></div>' + (c ? '' : '<div class="mt-2">' + body + '</div>') + '</section>'; };
    var kpi = function (l, v, s, col) { return '<div style="border:1px solid #e3e7ee;border-radius:8px;padding:10px 12px"><div class="' + ST_EYE + '">' + l + '</div><div style="font-size:24px;font-weight:700;margin:2px 0;' + (col ? 'color:' + col : '') + '">' + v + '</div><div class="text-[12px] text-[#6b7280]">' + s + '</div></div>'; };
    var kpis = '<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px">' + kpi('Objectives on track', cnt('On track') + '<span class="text-[14px] text-[#6b7280]"> / ' + objs.length + '</span>', cnt('At risk') + ' at risk · ' + cnt('Off track') + ' off track · ' + cnt('') + ' not assessed', '#1e7a3c') + kpi('Budget aligned to strategy', pct + '%', stAmt(aligned) + ' of ' + stAmt(total) + ' active budget') + kpi('Without a project', gaps.length, 'objectives and initiatives no project serves', gaps.length ? '#c93b3b' : '#1e7a3c') + kpi('Projects without a strategy', orphans.length, orphans.map(function (p) { return p.number; }).join(', ') || 'none') + '</div>';
    var row = 'display:grid;grid-template-columns:auto 1fr auto;gap:2px 10px;padding:8px 0;border-bottom:1px solid #eef1f5;align-items:baseline';
    var com = function (id) { return ST_COMMENTS.filter(function (c) { return c.nodeId === id; })[0]; };
    var att = attn.map(function (n) { var c = com(n.id), tr = stTrend(n.id); return '<div style="' + row + '">' + stPill(n.ownerAssessment + (tr ? ' ' + tr : ''), ST_ASSESS[n.ownerAssessment]) + '<button data-act="snode:' + n.id + '" class="text-left font-bold hover:underline">' + esc(n.title) + '</button><span class="text-[12px] text-[#6b7280]">' + esc(n.ownerName || '') + '</span><div class="text-[12.5px] flex flex-wrap gap-1.5 items-center" style="grid-column:2/4">' + (c ? '<i>“' + esc(c.comment) + '”</i>' : '') + projOf(n.id).map(function (pid) { var p = stProj(pid); return ragBadge(displayStatus(p).label) + ' ' + p.number; }).join(' ') + '</div></div>'; }).join('') +
      gaps.map(function (n) { return '<div style="' + row + '">' + stPill('Gap', 'r') + '<button data-act="snode:' + n.id + '" class="text-left font-bold hover:underline">' + esc(n.title) + '</button><span class="text-[12px] text-[#6b7280]">' + esc(n.ownerName || '') + '</span><div class="text-[12.5px]" style="grid-column:2/4">No project serves this yet. Start a project or retire it.</div></div>'; }).join('');
    var per = roots.map(function (r) { var rl = stRoll(r.id); return { r: r, plan: rl.plan, used: rl.used }; }), max = Math.max.apply(null, [1].concat(per.map(function (x) { return x.plan; })));
    var money = per.map(function (x) { var c = stRootCol(x.r.id), u = Math.min(x.used, x.plan); return '<div style="display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr) auto;gap:10px;align-items:center;padding:6px 0;font-size:13px"><span>' + esc(x.r.title) + '</span><span style="height:10px;background:#eef1f5;border-radius:5px;overflow:hidden;display:flex"><span style="width:' + (u / max * 100) + '%;background:' + c + '"></span><span style="width:' + ((x.plan - u) / max * 100) + '%;background:' + c + ';opacity:.35"></span></span><span>' + stAmt(x.used) + ' of ' + stAmt(x.plan) + '</span></div>'; }).join('') + '<p class="text-[11.5px] text-[#6b7280] mt-1">Dark = spent, light = remaining plan. Primary links only, so totals do not overlap.</p>';
    var coming = up.length ? up.map(function (x) { return '<div style="display:grid;grid-template-columns:86px 1fr auto;gap:10px;padding:7px 0;border-bottom:1px solid #eef1f5;font-size:13px;align-items:baseline"><span>' + fmtDate(x.m.forecast) + '</span><span><b>' + x.p.number + '</b> ' + esc(x.m.name) + ' <span class="text-[#6b7280]">· ' + esc(x.n.title) + '</span></span>' + stPill(x.m.status, MSC[x.m.status] || 'gy') + '</div>'; }).join('') : '<div class="text-[#6b7280]">No open milestones of linked projects in the next 30 days.</div>';
    var comments = ST_COMMENTS.filter(function (c) { return vis[c.nodeId]; }).map(function (c) { var n = stNode(c.nodeId); return '<div style="' + row + '">' + stPill(c.assessment, ST_ASSESS[c.assessment]) + '<button data-act="snode:' + n.id + '" class="text-left font-bold hover:underline">' + esc(n.title) + '</button><span class="text-[12px] text-[#6b7280]">' + esc(c.by) + ' · ' + fmtDate(c.date) + '</span><div class="text-[12.5px]" style="grid-column:2/4"><i>“' + esc(c.comment) + '”</i></div></div>'; }).join('') || '<div class="text-[#6b7280]">No comments yet.</div>';
    return stFilterBar() + '<div class="' + CARD + ' p-5"><div class="flex flex-wrap items-start gap-2"><div class="flex-1"><div class="text-[19px] font-extrabold">Strategy at a glance</div><div class="text-[12px] text-[#6b7280]">As of ' + fmtDate(DATA.today) + ' · ' + roots.length + ' strategies · ' + objs.length + ' objectives · ' + (S.stPortfolio || 'All portfolios') + '</div></div>' +
      btn('▤ Export as PowerPoint', 'toast:Creates two slides: the summary with key figures, and the coming milestones with owner comments.') + btn('⎙ Print / PDF', 'toast:Opens a print-ready page; choose Save as PDF to keep a copy.') + '</div>' +
      '<p class="text-[15px] leading-relaxed mt-3">' + esc(lead) + '</p>' + blk('kpis', 'Key figures', kpis) +
      '<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0 28px"><div>' + blk('attention', 'Needs attention', att || '<div class="text-[#6b7280]">Nothing at risk or off track, and no gaps.</div>') + '</div><div>' + blk('money', 'Where the money goes', money) + blk('coming', 'Coming up (next 30 days)', coming) + '</div></div>' +
      blk('comments', 'Owner comments', comments) + '</div>';
  }
  function renderStrategy() {
    if (S.stView === 'detail') return renderStrategyDetail();
    var h = '<div class="flex flex-wrap items-end gap-3 mb-3"><div>' + pageTitle('Strategy', 'Why projects exist: strategies, objectives and initiatives with the projects that serve them.') + '</div>' + stSeg() + '</div>';
    if (S.stView === 'coverage') return h + stFilterBar() + renderStrategyCoverage();
    if (S.stView === 'flow') return h + renderStrategyFlow();
    if (S.stView === 'story') return h + renderStrategyStory();
    if (S.stView === 'manage') return h + '<div class="' + CARD + ' p-4 text-[12.5px]"><p class="mb-2">Add and edit the objectives and initiatives of the strategies you own, and assign their owners. Objective owners maintain their own initiatives.</p><p class="text-[#6b7280]">Read-only in this demo. In the app everyone can open Maintain; buttons for items you do not own are greyed out with a hint.</p></div>';
    var rows = [], VIS = stVisible();
    (function walk(list, depth) {
      list.forEach(function (n) {
        if (!VIS[n.id]) return;
        rows.push({ n: n, depth: depth });
        if (n.nodeType !== 'Initiative' && S.stCollapsed.indexOf(n.id) === -1) walk(stKids(n.id), depth + 1);
      });
    })(stData().nodes.filter(function (n) { return !n.parentId; }), 0);
    h += stFilterBar('<span class="ml-auto"></span>' + stChip('sexpand:all', 'Expand all', false) + stChip('scollapse:all', 'Collapse all', false));
    h += '<div class="' + CARD + ' overflow-x-auto"><div class="' + TH + '" style="' + ST_GRID + '"><span>Name</span><span>Owner</span><span>Assessment</span><span>Projects</span><span>RAG mix</span><span>Budget used / planned</span><span>Milestones</span></div>' +
      rows.map(function (x) {
        var n = x.n, r = stRoll(n.id), isS = n.nodeType === 'Strategy', gap = !isS && !r.direct.length && !S.stPortfolio;
        var hasKids = n.nodeType !== 'Initiative' && stKids(n.id).length, closed = S.stCollapsed.indexOf(n.id) !== -1;
        var dots = ['g', 'a', 'r', 'gy'].map(function (c) {
          var ps = r.direct.map(stProj).filter(function (p) { return stCls(p) === c; });
          return ps.length ? '<span class="inline-flex items-center justify-center rounded-full text-[11px] font-bold text-white" style="min-width:22px;height:22px;padding:0 5px;background:' + ST_DOT[c] + '" title="' + esc(ps.map(function (p) { return p.number + ' · ' + displayStatus(p).label; }).join('\n')) + '">' + ps.length + '</span>' : '';
        }).join('');
        return '<div class="' + TD + ' text-[12.5px]" style="' + ST_GRID + (isS ? ';background:#f5f7fa' : '') + '">' +
          '<div class="flex items-center gap-1.5 min-w-0" style="padding-left:' + (x.depth * 24) + 'px">' +
            (hasKids ? '<button data-act="stoggle:' + n.id + '" class="text-[13px] shrink-0" style="width:20px" title="' + (closed ? 'Expand' : 'Collapse') + '">' + (closed ? '▸' : '▾') + '</button>' : '<span class="shrink-0" style="width:20px"></span>') +
            stBadge(n) + '<button data-act="snode:' + n.id + '" class="text-left truncate ' + (isS ? 'font-extrabold' : 'font-semibold text-[#1a4fa0] dark:text-blue-300 hover:underline') + '" title="' + esc(n.description || n.title) + '">' + esc(n.title) + '</button>' +
            (gap ? stPill('Gap', 'r') : '') + '</div>' +
          '<span>' + esc(n.ownerName || '-') + '</span>' +
          '<span>' + (isS ? '<span class="text-[#6b7280]">' + (n.strategyType === 'Functional' && n.portfolio ? 'Portfolio ' + esc(n.portfolio) : stPeriod(n)) + '</span>' : stAssess(n.ownerAssessment, n.id)) + '</span>' +
          '<span class="font-bold">' + r.direct.length + (r.indirect.length ? ' <span class="font-normal text-[#6b7280]">+' + r.indirect.length + ' indirect</span>' : '') + '</span>' +
          '<span class="inline-flex gap-1">' + dots + '</span>' +
          '<span>' + stBudget(r) + '</span>' +
          stMixBar(r.mix, 'snode:' + n.id) + '</div>';
      }).join('') + '</div>' +
      '<p class="text-[11.5px] text-[#6b7280] mt-2">' + stNote() + ' Functional objectives show which corporate objective they support; their projects count there as indirect.</p>';
    return h;
  }
  function renderStrategyDetail() {
    var d = stData(), n = stNode(S.stNode);
    if (!n) { S.stView = 'map'; return renderStrategy(); }
    var r = stRoll(n.id), scope = [n.id].concat(stDesc(n.id)), sup = stSupporters(scope);
    var lines = d.links.filter(function (l) { return scope.indexOf(l.nodeId) !== -1 && r.direct.indexOf(l.projectId) !== -1; }).map(function (l) { return { l: l, rel: 'direct' }; })
      .concat(d.links.filter(function (l) { return sup.indexOf(l.nodeId) !== -1 && r.indirect.indexOf(l.projectId) !== -1; }).map(function (l) { return { l: l, rel: 'indirect' }; }));
    var supported = n.supportsId != null ? stNode(n.supportsId) : null, path = stPath(n.id), root = n;
    while (root.parentId) root = stNode(root.parentId);
    var fact = function (k, v) { return '<div><div class="' + ST_EYE + '">' + k + '</div><div class="font-bold text-[12.5px]">' + v + '</div></div>'; };
    var kpi = function (k, v, sub) { return '<div class="' + CARD + ' p-3"><div class="' + ST_EYE + '">' + k + '</div><div class="text-[20px] font-extrabold mt-1">' + v + '</div>' + (sub || '') + '</div>'; };
    var chipS = 'rounded-full px-2 py-[2px] text-[11px] font-semibold bg-[#eef1f5] text-[#4b5563]';
    var h = '<div class="flex flex-wrap items-center gap-3 mb-3 mt-2"><button data-act="sview:map" class="font-semibold text-[#1a4fa0] dark:text-blue-300 hover:underline text-[12.5px]">← Back to the strategy map</button>' + (path.length ? '<span class="text-[12px] text-[#6b7280]">' + esc(path.join(' › ')) + '</span>' : '') + '</div>';
    h += '<div class="' + CARD + ' p-4 mb-3"><div class="flex flex-wrap items-start gap-4"><div class="flex-1 min-w-0"><h2 class="text-[17px] font-extrabold">' + esc(n.title) + '</h2><div class="flex flex-wrap gap-1.5 mt-1.5">' + stBadge(n) +
      (stPeriod(root) ? '<span class="' + chipS + '">Period ' + stPeriod(root) + '</span>' : '') + (n.code ? '<span class="' + chipS + '">' + esc(n.code) + '</span>' : '') + '</div></div>' +
      (n.nodeType !== 'Strategy' ? '<div><div class="' + ST_EYE + ' mb-1">Owner\'s assessment</div>' + stAssess(n.ownerAssessment) + '</div>' : '') + '</div>' +
      '<div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">' + fact('Owner', esc(n.ownerName || '-')) + fact('Deputy', esc(n.deputyName || '-')) + fact('Success measure', esc(n.successMeasure || '-')) + fact('Target', esc(n.target || '-')) +
      fact('Supports', supported ? '<button data-act="snode:' + supported.id + '" class="text-[#1a4fa0] dark:text-blue-300 hover:underline text-left">' + esc(supported.title) + '</button>' : '-') + '</div>' +
      (n.description ? '<p class="text-[12.5px] text-[#4b5563] dark:text-slate-300 mt-3">' + esc(n.description) + '</p>' : '') + '</div>';
    h += '<div class="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-3">' + kpi('Projects direct', r.direct.length) + kpi('Projects indirect', r.indirect.length) +
      kpi('Budget used / planned', stBudget(r), '<div class="text-[11px] text-[#6b7280]">' + (d.mode === 'primary' ? 'primary links only' : 'every link · overlapping') + '</div>') +
      kpi('Milestones', stMixTotal(r.mix), '<div class="mt-1">' + stMixBar(r.mix) + '</div>') + '</div>';
    var mixRows = ST_MIX.map(function (k) {
      var ps = r.direct.map(stProj).map(function (p) { return { p: p, c: stMixOf(p)[k[0]] }; }).filter(function (x) { return x.c; });
      return { k: k, count: ps.reduce(function (s, x) { return s + x.c; }, 0), ps: ps };
    });
    if (mixRows.some(function (x) { return x.count; })) {
      h += '<div class="' + CARD + ' p-4 mb-3"><div class="font-bold text-[13px] mb-2">Milestones</div>' + mixRows.map(function (x) {
        return x.count ? '<div class="flex items-center gap-3 py-1 text-[12.5px]"><span class="shrink-0 rounded-sm" style="width:12px;height:12px;background:' + x.k[2] + '"></span><b style="min-width:110px">' + x.k[1] + '</b><b style="min-width:30px">' + x.count + '</b><span class="text-[#6b7280]">' + x.ps.map(function (y) { return y.p.number + ' (' + y.c + ')'; }).join(', ') + '</span></div>' : '';
      }).join('') + '</div>';
    }
    var kids = stKids(n.id);
    if (kids.length) {
      h += '<div class="flex flex-wrap items-center gap-2 mb-3"><span class="' + ST_EYE + '">' + (n.nodeType === 'Strategy' ? 'Objectives:' : 'Initiatives:') + '</span>' + kids.map(function (k) {
        var kr = stRoll(k.id);
        return '<button data-act="snode:' + k.id + '" class="rounded-full px-3 py-1 text-[12.5px] font-semibold bg-white dark:bg-slate-800 border" style="' + (kr.direct.length ? 'color:#1a4fa0;border-color:#cfd5df' : 'color:#c93b3b;border-color:#e8a3a3') + '">' + esc(k.title) + ' · ' + kr.direct.length + '</button>';
      }).join('') + '</div>';
    }
    h += '<div class="' + CARD + ' overflow-x-auto"><table class="w-full border-collapse text-[12.5px]"><thead><tr><th class="' + TH + '">Project</th><th class="' + TH + '">Via</th><th class="' + TH + '">Link</th><th class="' + TH + '">Primary</th><th class="' + TH + '">Status</th><th class="' + TH + '">Budget</th><th class="' + TH + '">Reason</th></tr></thead><tbody>' +
      (lines.length ? lines.map(function (x) {
        var p = stProj(x.l.projectId), via = x.l.nodeId === n.id ? '-' : (stNode(x.l.nodeId) || {}).title;
        var counted = x.rel === 'direct' && (x.l.isPrimary || d.mode === 'every');
        return '<tr class="hover:bg-[#f2f6fc] dark:hover:bg-slate-700/60"><td class="' + TD + '"><a href="#" data-act="open:' + p.number + '" class="font-semibold text-[#1a4fa0] dark:text-blue-300 hover:underline">' + p.number + ' ' + esc(p.name) + '</a></td><td class="' + TD + '">' + esc(via) + '</td><td class="' + TD + (x.rel === 'direct' ? ' font-bold' : ' text-[#6b7280]') + '">' + (x.rel === 'direct' ? 'Direct' : 'Indirect') + '</td><td class="' + TD + '">' + (x.l.isPrimary ? 'Yes' : 'No') + '</td><td class="' + TD + '">' + stPill(displayStatus(p).label, stCls(p)) + '</td><td class="' + TD + '">' + (counted ? stAmt(totalBudget(p.financials) || 0) : '(not counted)') + '</td><td class="' + TD + ' text-[#6b7280]">' + esc(x.l.rationale || '') + '</td></tr>';
      }).join('') : '<tr><td colspan="7" class="' + TD + ' text-[#c93b3b]">No project serves this yet - it shows under Coverage as a gap.</td></tr>') + '</tbody></table></div>' +
      '<p class="text-[11.5px] text-[#6b7280] mt-2">' + stNote() + '</p>';
    return h;
  }
  function renderStrategyCoverage() {
    var d = stData(), act = projects().filter(stActive);
    var liveLinks = d.links.filter(function (l) { return stActive(stProj(l.projectId)); });
    var gaps = d.nodes.filter(function (n) { if (n.nodeType === 'Strategy') return false; var sc = [n.id].concat(stDesc(n.id)); return !liveLinks.some(function (l) { return sc.indexOf(l.nodeId) !== -1; }); });
    var orphans = act.filter(function (p) { return !d.links.some(function (l) { return l.projectId === p.id; }); });
    var objs = d.nodes.filter(function (n) { return n.nodeType === 'Objective'; }).map(function (n) { return { n: n, r: stRoll(n.id) }; });
    var max = Math.max.apply(null, [1].concat(objs.map(function (o) { return o.r.plan; })));
    var head = function (t, s) { return '<div class="mb-2"><div class="font-bold text-[13px]">' + t + '</div><div class="text-[11.5px] text-[#6b7280]">' + s + '</div></div>'; };
    var row = 'flex items-center gap-3 py-2 border-b border-[#eef1f5] dark:border-slate-700 last:border-0';
    return '<div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">' +
      '<div class="' + CARD + ' p-4">' + head('Gaps · ' + gaps.length, 'Active objectives and initiatives that no project serves yet.') + (gaps.length ? gaps.map(function (n) {
        return '<div class="' + row + '">' + stBadge(n) + '<div class="flex-1 min-w-0"><button data-act="snode:' + n.id + '" class="font-semibold text-[#1a4fa0] dark:text-blue-300 hover:underline text-left">' + esc(n.title) + '</button><div class="text-[11px] text-[#6b7280]">' + esc(stPath(n.id).join(' › ')) + '</div></div><span class="text-[12px]">' + esc(n.ownerName || '-') + '</span></div>';
      }).join('') : '<div class="text-[#6b7280]">No gaps.</div>') + '</div>' +
      '<div class="' + CARD + ' p-4">' + head('Projects without a strategy link · ' + orphans.length, 'Active projects not yet linked to an objective or initiative.') + (orphans.length ? orphans.map(function (p) {
        return '<div class="' + row + '"><div class="flex-1 min-w-0"><a href="#" data-act="open:' + p.number + '" class="font-semibold text-[#1a4fa0] dark:text-blue-300 hover:underline">' + p.number + ' ' + esc(p.name) + '</a><div class="text-[11px] text-[#6b7280]">' + esc(p.portfolio + ' · ' + p.lead) + '</div></div>' + stPill(displayStatus(p).label, stCls(p)) + '</div>';
      }).join('') : '<div class="text-[#6b7280]">No projects without a link.</div>') + '</div></div>' +
      '<div class="' + CARD + ' p-4">' + head('Budget per objective (planned)', stNote()) + objs.map(function (o) {
        return '<div class="grid items-center gap-3 py-1.5 text-[12.5px]" style="grid-template-columns:minmax(180px,1.2fr) 3fr 70px"><button data-act="snode:' + o.n.id + '" class="text-left font-semibold text-[#1a4fa0] dark:text-blue-300 hover:underline truncate">' + esc(o.n.title) + '</button><div class="rounded-full" style="height:12px;background:#eceef1"><div class="rounded-full" style="height:12px;background:#1a4fa0;width:' + Math.round(o.r.plan / max * 100) + '%"></div></div><span class="text-right">' + (o.r.plan ? stAmt(o.r.plan) : '-') + '</span></div>';
      }).join('') + '</div>';
  }

  var I18N_DE = {
"Flow": "Fluss",
"Executive story": "Management-Überblick",
"Strategy filter": "Strategie-Filter",
"All strategies": "Alle Strategien",
"Portfolio filter": "Portfolio-Filter",
"All portfolios": "Alle Portfolios",
"All assessments": "Alle Einschätzungen",
"Needs attention": "Braucht Aufmerksamkeit",
"Only items I own": "Nur meine Einträge",
"Reset filters": "Filter zurücksetzen",
"Width by": "Breite nach",
"Show secondary links": "Sekundäre Bezüge zeigen",
"Initiative": "Initiative",
"Band colour = strategy": "Bandfarbe = Strategie",
"Project = latest RAG": "Projekt = letzter RAG-Status",
"Dashed red = no project yet": "Rot gestrichelt = noch kein Projekt",
"⊖ / ⊕ folds a branch · click a node to trace its flows": "⊖ / ⊕ klappt einen Zweig zu · Klick auf einen Knoten zeigt seine Flüsse",
"Budget counts once, under each project's primary link. Closed and archived projects are left out.": "Budget zählt einmal, beim primären Bezug des Projekts. Abgeschlossene und archivierte Projekte fehlen.",
"Open project →": "Projekt öffnen →",
"Open details →": "Details öffnen →",
"Show all": "Alles zeigen",
"no project": "kein Projekt",
"secondary links only": "nur sekundäre Bezüge",
"Secondary link (not counted)": "Sekundärer Bezug (nicht gezählt)",
"Nothing matches the filters.": "Keine Einträge passen zu den Filtern.",
"Strategy at a glance": "Strategie auf einen Blick",
"Key figures": "Kennzahlen",
"Where the money goes": "Wohin das Geld fliesst",
"Coming up (next 30 days)": "Demnächst (nächste 30 Tage)",
"Owner comments": "Kommentare der Verantwortlichen",
"Objectives on track": "Ziele im Plan",
"Budget aligned to strategy": "Budget mit Strategiebezug",
"Without a project": "Ohne Projekt",
"Projects without a strategy": "Projekte ohne Strategie",
"objectives and initiatives no project serves": "Ziele und Initiativen, denen kein Projekt dient",
"none": "keine",
"No project serves this yet. Start a project or retire it.": "Noch kein Projekt dient diesem Eintrag. Projekt starten oder Eintrag beenden.",
"Nothing at risk or off track, and no gaps.": "Nichts gefährdet oder ausser Plan, keine Lücken.",
"Dark = spent, light = remaining plan. Primary links only, so totals do not overlap.": "Dunkel = ausgegeben, hell = restlicher Plan. Nur primäre Bezüge, Summen überlappen nicht.",
"No open milestones of linked projects in the next 30 days.": "Keine offenen Meilensteine verknüpfter Projekte in den nächsten 30 Tagen.",
"No comments yet.": "Noch keine Kommentare.",
"▤ Export as PowerPoint": "▤ Als PowerPoint exportieren",
"⎙ Print / PDF": "⎙ Drucken / PDF",
"Creates two slides: the summary with key figures, and the coming milestones with owner comments.": "Erstellt zwei Folien: die Übersicht mit Kennzahlen und die kommenden Meilensteine mit Kommentaren.",
"Opens a print-ready page; choose Save as PDF to keep a copy.": "Öffnet eine Druckansicht; mit «Als PDF speichern» behalten Sie eine Kopie.",
"Expand": "Aufklappen",
"Pilot customers onboard in November instead of October; scope cut to ordering only, tracking moves to phase 2.": "Pilotkunden starten im November statt im Oktober; Umfang auf Bestellung reduziert, Sendungsverfolgung folgt in Phase 2.",
"ERP go-live wave 1 depends on the integration test backlog; recovery plan agreed with the sponsor.": "ERP-Go-live Welle 1 hängt vom Integrationstest-Rückstand ab; Auffangplan mit dem Sponsor vereinbart.",
"Prototype gate moved by three weeks; field test still planned for Q1 2027.": "Prototyp-Gate um drei Wochen verschoben; Feldtest weiterhin für Q1 2027 geplant.",
"Feed": "Verlauf",
"Compare": "Vergleichen",
"+ New Status Report": "+ Neuer Statusbericht",
"View / Unlock": "Anzeigen / Entsperren",
"Achievements:": "Erfolge:",
"Plan for next period:": "Plan für nächste Periode:",
"Reason (Yellow/Red):": "Begründung (Gelb/Rot):",
"Needs at least 2 submitted reports to compare": "Für einen Vergleich braucht es mindestens 2 eingereichte Berichte",
"OUTPUT": "LEISTUNG",
"TEAM": "TEAM",
"Project Team": "Projektteam",
"ACTUAL": "IST",
"PLAN": "PLAN",
"<40%": "<40 %",
"Over 100%": "Über 100 %",
"40–80%": "40–80 %",
"80–100%": "80–100 %",
"Resource Allocation Heatmap": "Heatmap Ressourcenzuteilung",
"<40% of capacity": "<40 % der Kapazität",
"Over capacity": "Über Kapazität",
"⬇ Export to Excel": "⬇ Nach Excel exportieren",
"↻ Refresh": "↻ Aktualisieren",
"Group by Function (with subtotals)": "Nach Funktion gruppieren (mit Zwischentotalen)",
"Function (5 of 5) ▾": "Funktion (5 von 5) ▾",
"Back 3 months": "3 Monate zurück",
"Forward 3 months": "3 Monate vor",
"Jump to today": "Zu heute springen",
"Summed monthly FTE per person, across every project, coloured against each person's own working capacity. Hover a cell for the per-project breakdown.": "Monatliche FTE-Summe pro Person über alle Projekte, eingefärbt im Verhältnis zur eigenen Arbeitskapazität der Person. Fahren Sie über eine Zelle für die Aufteilung pro Projekt.",
"Click a cell to set that person's FTE for the month. Past months (": "Klicken Sie auf eine Zelle, um das FTE der Person für den Monat festzulegen. Vergangene Monate (",
") show what happened; the current and future months (": ") zeigen, was tatsächlich geschah; der aktuelle und künftige Monate (",
") are the plan.": ") sind der Plan.",
"Opens the two-step status report wizard.": "Öffnet den zweistufigen Statusbericht-Assistenten.",
"Add a person, their role and a starting allocation for this month.": "Person, Rolle und Startauslastung für diesen Monat hinzufügen.",
"Exports the current view with the per-project breakdown.": "Exportiert die aktuelle Ansicht mit der Aufteilung pro Projekt.",
"Loads other people's latest changes.": "Lädt die neuesten Änderungen anderer.",
"Filter people by Function.": "Personen nach Funktion filtern.",
"Opens the submitted report; unlocking follows the report rules.": "Öffnet den eingereichten Bericht; Entsperren folgt den Berichtsregeln.",
"Remove from project team — deletes their future allocation plan, keeps past months as history": "Aus dem Projektteam entfernen – löscht die künftige Planung, behält vergangene Monate als Verlauf",
"January": "Januar",
"February": "Februar",
"March": "März",
"June": "Juni",
"July": "Juli",
"October": "Oktober",
"December": "Dezember",
"At risk": "Gefährdet",
"Corporate": "Unternehmen",
"Draft": "Entwurf",
"Functional": "Funktional",
"Mitigating": "In Minderung",
"Monitoring": "Beobachtung",
"Objective": "Ziel",
"On track": "Im Plan",
"Open": "Offen",
"Project Leader": "Projektleitung",
"Resolved": "Erledigt",
"Strategy": "Strategie",
"Back to the strategy map": "Zurück zur Strategie-Karte",
"(not counted)": "(nicht gezählt)",
"+ Add Team Member": "+ Teammitglied hinzufügen",
"+ New Change Request": "+ Neuer Änderungsantrag",
"+ New Decision": "+ Neuer Entscheid",
"+ New Project": "+ Neues Projekt",
"+ New Risk / Issue": "+ Neues Risiko / Problem",
"Collapse": "Zuklappen",
"Full screen": "Vollbild",
"Project Health Radar: click to enlarge": "Projektgesundheits-Radar: zum Vergrössern klicken",
"Reports": "Berichte",
"Search project #, name, phase, sponsor, lead, or ERP #…": "Projekt-Nr., Name, Phase, Sponsor, Leitung oder ERP-Nr. suchen…",
"Show active or archived projects": "Aktive oder archivierte Projekte anzeigen",
"A project's budget counts only under its primary link, so totals never overlap.": "Das Budget eines Projekts zählt nur beim primären Bezug, Summen überlappen nie.",
"Active Blockers": "Aktive Blocker",
"Active and archived": "Aktive und archivierte",
"Active items only": "Nur aktive Einträge",
"Active objectives and initiatives that no project serves yet.": "Aktive Ziele und Initiativen, auf die noch kein Projekt einzahlt.",
"Active projects": "Aktive Projekte",
"Active projects not yet linked to an objective or initiative.": "Aktive Projekte, die noch keinem Ziel und keiner Initiative zugeordnet sind.",
"Actual": "Ist",
"Actual YTD": "Ist YTD",
"Actual to Date": "Ist bis heute",
"Add and edit the objectives and initiatives of the strategies you own, and assign their owners. Objective owners maintain their own initiatives.": "Erfassen und bearbeiten Sie Ziele und Initiativen der Strategien, für die Sie verantwortlich sind, und weisen Sie Verantwortliche zu. Verantwortliche eines Ziels pflegen dessen Initiativen.",
"Aging": "Alter",
"All": "Alle",
"All Milestones": "Alle Meilensteine",
"All Projects": "Alle Projekte",
"All Risks & Issues": "Alle Risiken & Probleme",
"Analytics": "Analyse",
"Analytics & Reporting": "Analyse & Reporting",
"Approved Budget": "Genehmigtes Budget",
"Archived": "Archiviert",
"Archived projects": "Archivierte Projekte",
"Assessment": "Einschätzung",
"At a Glance": "Auf einen Blick",
"Axis": "Achse",
"Based on": "Basierend auf",
"Blockers": "Blocker",
"Budget per objective (planned)": "Budget pro Ziel (geplant)",
"Budget used / planned": "Budget verbr. / geplant",
"Burn %": "Verbrauch %",
"By Rating": "Nach Bewertung",
"Category": "Kategorie",
"Change History": "Änderungsverlauf",
"Change Requests": "Änderungsanträge",
"Collapse all": "Alle zuklappen",
"Colour = status (milestone date)": "Farbe = Status (Meilensteindatum)",
"Cost health": "Kostengesundheit",
"Coverage": "Abdeckung",
"Date": "Datum",
"Dates": "Daten",
"Decided by": "Entschieden von",
"Decision": "Entscheid",
"Decisions": "Entscheide",
"Deep Dive": "Detailanalyse",
"Description": "Beschreibung",
"Direct": "Direkt",
"Est. cost": "Gesch. Kosten",
"Expand all": "Alle aufklappen",
"Financial Burn": "Mittelverbrauch",
"Financials": "Finanzen",
"Forecast": "Prognose",
"Further out is healthier.": "Weiter aussen = gesünder.",
"Gap": "Lücke",
"Goal:": "Ziel:",
"Health": "Gesundheit",
"Impact": "Auswirkung",
"Impact →": "Auswirkung →",
"Include closed projects": "Abgeschlossene Projekte einbeziehen",
"Include converted Issues": "Umgewandelte Probleme einbeziehen",
"Indirect": "Indirekt",
"Initiatives:": "Initiativen:",
"Latest submitted Status Report": "Letzter eingereichter Statusbericht",
"Lead": "Leitung",
"Likelihood ↑": "Wahrscheinlichkeit ↑",
"Link": "Bezug",
"Maintain": "Pflegen",
"Map": "Karte",
"Milestone Slippage Over Time": "Meilensteinverzug im Zeitverlauf",
"Milestones": "Meilensteine",
"My Portfolio": "Mein Portfolio",
"My Projects": "Meine Projekte",
"Needs Sponsor": "Sponsor erforderlich",
"New this month": "Neu diesen Monat",
"New this week": "Neu diese Woche",
"Next Milestone": "Nächster Meilenstein",
"No decisions logged yet.": "Noch keine Entscheide erfasst.",
"Not assessed": "Nicht bewertet",
"Not enough data yet": "Noch nicht genügend Daten",
"Not started": "Nicht begonnen",
"On-Time Health": "Termintreue",
"Overview": "Übersicht",
"Owner": "Verantwortlich",
"Owner's assessment": "Einschätzung Verantwortliche/r",
"Plan (Current Year)": "Plan (laufendes Jahr)",
"Plan for Next Period": "Plan für nächste Periode",
"Primary": "Primär",
"Priority": "Priorität",
"Project": "Projekt",
"Project #": "Projekt-Nr.",
"Project Health": "Projektgesundheit",
"Project Name": "Projektname",
"Projects": "Projekte",
"Projects direct": "Projekte direkt",
"Projects indirect": "Projekte indirekt",
"Projects where you are Sponsor, Project Leader, or Deputy.": "Projekte, in denen Sie Sponsor, Projektleitung oder Stellvertretung sind.",
"RAG Health": "RAG-Zustand",
"RAG Status Over Time": "RAG-Status im Zeitverlauf",
"RAG mix": "RAG-Mix",
"Rating": "Bewertung",
"Rating × Category": "Bewertung × Kategorie",
"Rationale": "Begründung",
"Reason": "Begründung",
"Refresh": "Aktualisieren",
"Reporting": "Berichterstattung",
"Reporting Compliance": "Berichtstreue",
"Resources": "Ressourcen",
"Risk Matrix": "Risikomatrix",
"Risk health": "Risikogesundheit",
"Risks & Issues": "Risiken & Probleme",
"Role": "Rolle",
"Schedule check": "Terminprüfung",
"Schedule health": "Termingesundheit",
"Scope:": "Umfang:",
"Score": "Wert",
"Search": "Suche",
"Show": "Anzeigen",
"Status History": "Statusverlauf",
"Status yellow/red:": "Status gelb/rot:",
"Strategy:": "Strategie:",
"Submitted Status Reports per month by overall RAG.": "Eingereichte Statusberichte pro Monat nach Gesamt-RAG.",
"Success measure": "Erfolgsmessung",
"Success:": "Erfolg:",
"Supports": "Unterstützt",
"Target": "Zielwert",
"Team engagement": "Team-Engagement",
"Timeline": "Zeitachse",
"Title": "Titel",
"Today": "Heute",
"Type": "Typ",
"Upcoming Milestones (next 30 days)": "Anstehende Meilensteine (nächste 30 Tage)",
"Via": "Über",
"What was decided, when, by whom and why. Drafts can be edited; recorded decisions are locked.": "Was wurde wann, von wem und warum entschieden. Entwürfe können bearbeitet werden; erfasste Entscheide sind gesperrt.",
"Whole portfolio": "Gesamtes Portfolio",
"Why projects exist: strategies, objectives and initiatives with the projects that serve them.": "Warum Projekte existieren: Strategien, Ziele und Initiativen mit den Projekten, die darauf einzahlen.",
"Yes": "Ja",
"no data": "keine Daten",
"no link": "kein Bezug",
"oldest open High/Critical": "älteste offene Hoch/Kritisch",
"primary links only": "nur primäre Bezüge",
"← Back to Portfolio": "← Zurück zum Portfolio",
"■ Act": "■ Handeln",
"▦ Card": "▦ Karten",
"▲ Watch": "▲ Beobachten",
"▾ Hide": "▾ Ausblenden",
"✎ Edit Project": "✎ Projekt bearbeiten",
"✔ On track": "✔ Im Plan",
"🔒 Recorded": "🔒 Erfasst",
"🔗 Share": "🔗 Teilen",
"Running": "Laufend",
"On Track": "Im Plan",
"At Risk": "Gefährdet",
"Delayed": "Verzögert",
"Not Started": "Nicht gestartet",
"On Hold": "Pausiert",
"Closed": "Geschlossen",
"Completed": "Abgeschlossen",
"High": "Hoch",
"Medium": "Mittel",
"Low": "Tief",
"Critical": "Kritisch",
"Risk": "Risiko",
"Issue": "Problem",
"Schedule": "Termine",
"Scope": "Umfang",
"Deputy": "Stellvertretung",
"Achievements": "Erfolge",
"Submitted": "Eingereicht",
"Approved": "Genehmigt",
"Green": "Grün",
"Yellow": "Gelb",
"Red": "Rot",
"Unclear": "Unklar",
"(value × likelihood)": "(Wert × Wahrscheinlichkeit)",
"About PPM Compass 360": "Über PPM Compass 360",
"Project health radar": "Projektgesundheits-Radar",
"Type at least 3 characters…": "Mindestens 3 Zeichen eingeben…",
"Average days a milestone’s forecast has moved vs. its baseline.": "Durchschnittliche Tage, um die sich die Prognose eines Meilensteins gegenüber der Baseline verschoben hat.",
"CR #": "ÄA-Nr.",
"Continuous Governance Improvements:": "Laufende Governance-Verbesserungen:",
"Expected cost of open risks:": "Erwartete Kosten offener Risiken:",
"For detailed version history and changelogs:": "Ausführliche Versionshistorie und Änderungen:",
"Function ▾": "Funktion ▾",
"Group by": "Gruppieren nach",
"HIGH": "HOCH",
"LOW": "TIEF",
"MEDIUM": "MITTEL",
"Issues & Risks for Sponsor’s Attention": "Probleme & Risiken für den Sponsor",
"Nothing open.": "Nichts offen.",
"One search across projects, milestones, risks & issues and change requests.": "Eine Suche über Projekte, Meilensteine, Risiken & Probleme und Änderungsanträge.",
"Output": "Leistung",
"Overall": "Gesamt",
"Next Steps": "Nächste Schritte",
"Upcoming Milestones": "Nächste Meilensteine",
"Planned allocation (% of FTE) per month. Edit in the grid; the Heatmap adds it up across projects.": "Geplante Auslastung (% eines Vollzeitäquivalents) pro Monat. Im Raster bearbeiten; die Heatmap summiert über alle Projekte.",
"Planned allocation per person across all projects, by month. Over 100% means someone is overbooked.": "Geplante Auslastung pro Person über alle Projekte, nach Monat. Über 100 % bedeutet überbucht.",
"Portfolio-wide trends - health, status history and milestone slippage, built from the Status Reports already captured. Pick a project to see its own.": "Portfolioweite Trends – Gesundheit, Statusverlauf und Meilenstein-Verschiebungen aus den bereits erfassten Statusberichten. Wählen Sie ein Projekt, um seine eigenen zu sehen.",
"PPM Compass 360 is an enterprise Project Portfolio Management solution engineered natively for Microsoft 365 SharePoint Online. 100% in-tenant governance, zero external databases, flat per-site licensing.": "PPM Compass 360 ist eine Lösung für Projektportfolio-Management, gebaut für Microsoft 365 SharePoint Online. Governance zu 100 % im eigenen Tenant, keine externen Datenbanken, Pauschallizenz pro Site.",
"Pure Client-Side Architecture:": "Rein clientseitige Architektur:",
"Read-only in this demo. In the app everyone can open Maintain; buttons for items you do not own are greyed out with a hint.": "In dieser Demo nur lesend. In der App kann jede Person «Pflegen» öffnen; Schaltflächen für Elemente anderer Verantwortlicher sind mit Hinweis ausgegraut.",
"Regularly enhanced with new site owner settings, automated validations, and reporting tools.": "Regelmässig erweitert um neue Einstellungen für Websitebesitzer, automatische Prüfungen und Berichtswerkzeuge.",
"Report": "Bericht",
"Requested by": "Beantragt von",
"Resource Heatmap": "Ressourcen-Heatmap",
"Risk Matrix - portfolio": "Risikomatrix – Portfolio",
"Runs directly inside your browser against standard SharePoint lists.": "Läuft direkt in Ihrem Browser auf Standard-SharePoint-Listen.",
"SPFx Solution": "SPFx-Lösung",
"Scope/Qual.": "Umfang/Qual.",
"Showing only portfolios you own as Portfolio Manager.": "Es werden nur Portfolios angezeigt, die Sie als Portfolio-Manager verantworten.",
"Switch Demo Persona": "Demo-Persona wechseln",
"Test permissions & portfolio visibility across roles": "Berechtigungen und Portfolio-Sichtbarkeit je Rolle testen",
"Updated just now ·": "Gerade aktualisiert ·",
"View Release Notes ↗": "Versionshinweise ansehen ↗",
"Your project schedules, risks, and financial records never leave your Microsoft 365 tenant boundary.": "Termine, Risiken und Finanzdaten Ihrer Projekte verlassen Ihren Microsoft-365-Tenant nie.",
"Zero Data Egress:": "Kein Datenabfluss:",
"open High/Critical risks & issues": "offene hohe/kritische Risiken & Probleme",
"≡ List": "≡ Liste",
"⏰ Overdue - Start Status Report": "⏰ Überfällig – Statusbericht starten",
"⏸️ This project is On Hold. Nothing is locked - this is a reminder that RAG status and milestone dates may not reflect active progress right now.": "⏸️ Dieses Projekt ist pausiert. Nichts ist gesperrt – ein Hinweis, dass RAG-Status und Meilensteindaten im Moment keinen aktiven Fortschritt zeigen.",
"▤ Export All (PPTX)": "▤ Alle exportieren (PPTX)",
"⭐ Presets ▾": "⭐ Vorlagen ▾",
"Latest Update · Next Steps": "Letzter Stand · Nächste Schritte",
"Risks & Change Control": "Risiken & Änderungssteuerung",
"Project & Goals": "Projekt & Ziele",
"This project is archived: everything is read-only. The PPM team or the portfolio owner can make it active again under Edit project.": "Dieses Projekt ist archiviert: Alles ist schreibgeschützt. Das PPM-Team oder der Portfolio-Verantwortliche kann es unter «Projekt bearbeiten» wieder aktivieren.",
"All dates consistent": "Alle Termine stimmig",
"End date passed": "Enddatum überschritten",
"Back to Portfolio": "Zurück zum Portfolio",
"Language": "Sprache",
"No projects without a link.": "Keine Projekte ohne Bezug.",
"No gaps.": "Keine Lücken.",
"primary": "primär",
"Off track": "Nicht im Plan",
"Add a person and their monthly allocation.": "Person und deren monatliche Auslastung hinzufügen.",
"Choose columns - your choice is saved to your profile.": "Spalten wählen – Ihre Auswahl wird in Ihrem Profil gespeichert.",
"Copies a link that opens this project and tab directly.": "Kopiert einen Link, der dieses Projekt und diesen Reiter direkt öffnet.",
"Edit Project is enabled only when your SharePoint access allows saving.": "«Projekt bearbeiten» ist nur aktiv, wenn Ihr SharePoint-Zugriff das Speichern erlaubt.",
"Export All creates one PowerPoint slide per project for the selected portfolios.": "«Alle exportieren» erstellt eine PowerPoint-Folie pro Projekt der gewählten Portfolios.",
"Export this project as a one-page PDF, a PowerPoint slide or a full Excel workbook.": "Dieses Projekt als einseitiges PDF, PowerPoint-Folie oder vollständige Excel-Arbeitsmappe exportieren.",
"Filter by project type (PRO, ORG, RES).": "Nach Projekttyp filtern (PRO, ORG, RES).",
"Filter by status.": "Nach Status filtern.",
"Full screen hides the SharePoint page chrome.": "Vollbild blendet die SharePoint-Seitenelemente aus.",
"Group by Function or Role; filter by project or person.": "Nach Funktion oder Rolle gruppieren; nach Projekt oder Person filtern.",
"New Change Request - approval runs through Power Automate.": "Neuer Änderungsantrag – die Genehmigung läuft über Power Automate.",
"New Project opens the project form (Portfolio Owners, Deputies and the PPM team).": "«Neues Projekt» öffnet das Projektformular (Portfolio-Verantwortliche, Stellvertretungen und das PPM-Team).",
"New Risk or Issue - including the estimated cost if it happens.": "Neues Risiko oder Problem – inklusive geschätzter Kosten bei Eintritt.",
"New decision - save as draft, or record it (then it is locked).": "Neuer Entscheid – als Entwurf speichern oder erfassen (dann gesperrt).",
"Opens the Status Report wizard for this month.": "Öffnet den Statusbericht-Assistenten für diesen Monat.",
"Saved filter presets per user.": "Gespeicherte Filtervorlagen pro Person."
};
  // ---------- Language (v1.2.0: EN / DE top-bar switch; UI text only - project data stays as entered) ----------
  var MONTH_DE = { Jan: 'Jan', Feb: 'Feb', Mar: 'Mär', Apr: 'Apr', May: 'Mai', Jun: 'Jun', Jul: 'Jul', Aug: 'Aug', Sep: 'Sep', Oct: 'Okt', Nov: 'Nov', Dec: 'Dez',
    January: 'Januar', February: 'Februar', March: 'März', April: 'April', June: 'Juni', July: 'Juli', August: 'August', September: 'September', October: 'Oktober', November: 'November', December: 'Dezember' };
  function de(s) { return I18N_DE[s] || null; }
  function deOr(s) { return I18N_DE[s] || s; }
  var DE_RULES = [
    [/^(On track|At risk|Off track) ([↑↓])$/, function (m) { return deOr(m[1]) + ' ' + m[2]; }],
    [/^(\d+) of (\d+) objectives are on track\. (.*)$/, function (m) { return null; }],
    [/^As of (.+) · (\d+) strategies · (\d+) objectives · (.+)$/, function (m) { return 'Stand ' + m[1] + ' · ' + m[2] + ' Strategien · ' + m[3] + ' Ziele · ' + deOr(m[4]); }],
    [/^(\d+) at risk · (\d+) off track · (\d+) not assessed$/, function (m) { return m[1] + ' gefährdet · ' + m[2] + ' nicht im Plan · ' + m[3] + ' ohne Einschätzung'; }],
    [/^(.+) of (.+) active budget$/, function (m) { return m[1] + ' von ' + m[2] + ' aktivem Budget'; }],
    [/^(\d+) projects \(collapsed\)$/, function (m) { return m[1] + ' Projekte (zugeklappt)'; }],
    [/^(\d+) proj\.$/, function (m) { return m[1] + ' Proj.'; }],
    [/^Submitted by (.+) on (.+)$/, function (m) { return 'Eingereicht von ' + m[1] + ' am ' + m[2]; }],
    [/^PL at the time: (.+) · Sponsor at the time: (.+) · Phase at the time: (.+) · Status at the time: (.+) · Priority at the time: (.+)$/, function (m) { return 'PL zu diesem Zeitpunkt: ' + m[1] + ' · Sponsor zu diesem Zeitpunkt: ' + m[2] + ' · Phase zu diesem Zeitpunkt: ' + deOr(m[3]) + ' · Status zu diesem Zeitpunkt: ' + deOr(m[4]) + ' · Priorität zu diesem Zeitpunkt: ' + deOr(m[5]); }],
    [/^(\d+)% capacity$/, function (m) { return m[1] + ' % Kapazität'; }],
    [/^(.+) subtotal — ([\d.]+) FTE capacity$/, function (m) { return m[1] + ': Zwischentotal – ' + m[2] + ' FTE Kapazität'; }],
    [/^(January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})$/, function (m) { return MONTH_DE[m[1]] + ' ' + m[2]; }],
    [/^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC) (\d{4})$/, function (m) { var k = m[1][0] + m[1].slice(1).toLowerCase(); return (MONTH_DE[k] || k).toUpperCase() + ' ' + m[2]; }],
    [/^▾ (\w+) \((\d+)\)$/, function (m) { return null; }],
    [/^\((Initiative|Objective) · (.+)\)$/, function (m) { return '(' + (m[1] === 'Objective' ? 'Ziel' : 'Initiative') + ' · ' + m[2] + ')'; }],
    [/^\((first|last) MS: (.+)\)$/, function (m) { return '(' + (m[1] === 'first' ? 'erster' : 'letzter') + ' MS: ' + m[2] + ')'; }],
    [/^\+(\d+) indirect$/, function (m) { return '+' + m[1] + ' indirekt'; }],
    [/^([+-]?[\d.,]+)d$/, function (m) { return m[1] + ' T'; }],
    [/^(\d.*?) of (\d.*)$/, function (m) { return m[1].length < 16 && m[2].length < 16 ? m[1] + ' von ' + m[2] : null; }],
    [/^(\d+) (Closed|Not Started|On Hold|Running)$/, function (m) { return m[1] + ' ' + deOr(m[2]); }],
    [/^(\d+) projects?$/, function (m) { return m[1] + (m[1] === '1' ? ' Projekt' : ' Projekte'); }],
    [/^(\d+) results across (\d+) of (\d+) sources$/, function (m) { return m[1] + ' Treffer in ' + m[2] + ' von ' + m[3] + ' Quellen'; }],
    [/^(\d+) Delayed · (\d+) At Risk · (\d+) On Track$/, function (m) { return m[1] + ' ' + deOr('Delayed') + ' · ' + m[2] + ' ' + deOr('At Risk') + ' · ' + m[3] + ' ' + deOr('On Track'); }],
    [/^(\d+) of (\d+) projects have Finance data · (.+) of (.+)$/, function (m) { return m[1] + ' von ' + m[2] + ' Projekten mit Finanzdaten · ' + m[3] + ' von ' + m[4]; }],
    [/^(\d+) projects? assigned to (.+)$/, function (m) { return m[1] + (m[1] === '1' ? ' Projekt' : ' Projekte') + ' mit Rolle von ' + m[2]; }],
    [/^(\d+) ✔ On track$/, function (m) { return m[1] + ' ✔ Im Plan'; }],
    [/^(\d+)% on track$/, function (m) { return m[1] + ' % im Plan'; }],
    [/^(\d+)% done$/, function (m) { return m[1] + ' % erledigt'; }],
    [/^Current user: (.+) - Click to switch persona$/, function (m) { return 'Aktuelle Person: ' + m[1] + ' – klicken, um die Persona zu wechseln'; }],
    [/^Project health for (.+)$/, function (m) { return 'Projektgesundheit für ' + m[1]; }],
    [/^Project Health - (.+)$/, function (m) { return 'Projektgesundheit – ' + m[1]; }],
    [/^Achievements -( (\w+) (\d{4}))?$/, function (m) { return 'Erfolge –' + (m[1] ? ' ' + (MONTH_DE[m[2]] || m[2]) + ' ' + m[3] : ''); }],
    [/^All risks & issues \((\d+)\)$/, function (m) { return 'Alle Risiken & Probleme (' + m[1] + ')'; }],
    [/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)( \d{4})?$/, function (m) { return MONTH_DE[m[1]] + (m[2] || ''); }],
    [/^Category: (\w+) · (.+)$/, function (m) { return 'Kategorie: ' + deOr(m[1]) + ' · ' + m[2]; }],
    [/^(Risk|Issue) · (High|Medium|Low|Critical)$/, function (m) { return deOr(m[1]) + ' · ' + deOr(m[2]); }],
    [/^(.+) · (High|Medium|Low|Critical)$/, function (m) { return m[1] + ' · ' + deOr(m[2]); }],
    [/^(Columns|Status|Type) \((\d+)\) ▾$/, function (m) { return { Columns: 'Spalten', Status: 'Status', Type: 'Typ' }[m[1]] + ' (' + m[2] + ') ▾'; }],
    [/^Deputy: (.+)$/, function (m) { return 'Stellvertretung: ' + m[1]; }],
    [/^ERP #: (.+)$/, function (m) { return 'ERP-Nr.: ' + m[1]; }],
    [/^Owner: (.+?)(?: · Est\. cost (.+))?$/, function (m) { return 'Verantwortlich: ' + m[1] + (m[2] ? ' · Gesch. Kosten ' + m[2] : ''); }],
    [/^Expected risk cost (\d+)% of budget$/, function (m) { return 'Erwartete Risikokosten ' + m[1] + ' % des Budgets'; }],
    [/^Further out is healthier\. Dashed grey: the report of (.+)\.$/, function (m) { return 'Weiter aussen ist gesünder. Grau gestrichelt: der Bericht vom ' + m[1] + '.'; }],
    [/^Median health score per axis across the (\d+) live projects in the selected portfolio\(s\)\. Further out is healthier\.$/, function (m) { return 'Median-Gesundheitswert pro Achse über die ' + m[1] + ' laufenden Projekte der gewählten Portfolios. Weiter aussen ist gesünder.'; }],
    [/^(High|Medium|Low)×(High|Medium|Low)$/, function (m) { return deOr(m[1]) + '×' + deOr(m[2]); }],
    [/^Gaps · (\d+)$/, function (m) { return 'Lücken · ' + m[1]; }],
    [/^Projects without a strategy link · (\d+)$/, function (m) { return 'Projekte ohne Strategiebezug · ' + m[1]; }],
    [/^Last Status Update: (.+)$/, function (m) { return 'Letzter Statusbericht: ' + m[1]; }],
    [/^Last updated: (.+)$/, function (m) { return 'Zuletzt aktualisiert: ' + m[1]; }],
    [/^Latest Status Report \((.+)\)$/, function (m) { return 'Letzter Statusbericht (' + m[1] + ')'; }],
    [/^Output (.+) vs (budget used|time elapsed) (.+)$/, function (m) { return 'Leistung ' + m[1].replace('no data', 'keine Daten') + ' vs. ' + (m[2] === 'budget used' ? 'verbrauchtes Budget ' : 'verstrichene Zeit ') + m[3]; }],
    [/^Period (.+)$/, function (m) { return 'Periode ' + m[1]; }],
    [/^Projects in scope \((\d+)\)$/, function (m) { return 'Projekte im Umfang (' + m[1] + ')'; }],
    [/^Show closed projects \((\d+)\)$/, function (m) { return 'Geschlossene Projekte anzeigen (' + m[1] + ')'; }],
    [/^(\w+) reports submitted$/, function (m) { return 'Statusberichte ' + (MONTH_DE[m[1]] || m[1]) + ' eingereicht'; }],
    [/^Your owned portfolios? \((.+)\) at a glance - click any tile or card below to see what’s behind the number\.$/, function (m) { return 'Ihre Portfolios (' + m[1] + ') auf einen Blick – klicken Sie auf eine Kachel oder Karte, um zu sehen, was hinter der Zahl steckt.'; }],
    [/^· Milestone after end \((.+)\)$/, function (m) { return '· Meilenstein nach Ende (' + m[1] + ')'; }],
    [/^Milestone after end \((.+)\)$/, function (m) { return 'Meilenstein nach Ende (' + m[1] + ')'; }],
    [/^✔ Submitted (.+)$/, function (m) { return '✔ Eingereicht ' + m[1]; }],
    [/^Switched demo user to (.+) \((.+)\)$/, function (m) { return 'Demo-Person gewechselt zu ' + m[1] + ' (' + m[2] + ')'; }],
    [/^Completed: (\d+)\nOn track: (\d+)\nAt risk: (\d+)\nDelayed: (\d+)\nNot started: (\d+)$/, function (m) { return 'Abgeschlossen: ' + m[1] + '\nIm Plan: ' + m[2] + '\nGefährdet: ' + m[3] + '\nVerzögert: ' + m[4] + '\nNicht gestartet: ' + m[5]; }],
    [/^(.+) · (\d+)$/, function () { return null; }]
  ];
  function deLead(s) {
    var m = s.match(/^(\d+) of (\d+) objectives are on track\. (?:(\d+) need attention, led by (.+?) \((.+?)\)\. )?(\d+)% of the active project budget \((.+?) of (.+?)\) is linked to a strategic objective\. (?:Objectives and initiatives without a project: (\d+) \((.+)\)\.|Every objective has at least one project\.)$/);
    if (!m) return null;
    return m[1] + ' von ' + m[2] + ' Zielen sind im Plan. ' + (m[3] ? m[3] + ' brauchen Aufmerksamkeit, vorne ' + m[4] + ' (' + deOr(m[5].replace(/^./, function (c) { return c.toUpperCase(); })).toLowerCase() + '). ' : '') + m[6] + ' % des aktiven Projektbudgets (' + m[7] + ' von ' + m[8] + ') sind einem strategischen Ziel zugeordnet. ' + (m[9] ? 'Ziele und Initiativen ohne Projekt: ' + m[9] + ' (' + m[10] + ').' : 'Jedes Ziel hat mindestens ein Projekt.');
  }
  function deSentences(s) {
    var L = deLead(s); if (L) return L;
    // schedule-check tooltip: one or two fixed sentences
    var a = 'The Target End Date has passed but the project is not closed. Update the date or close the project.';
    var out = s.replace(a, 'Das Zielenddatum ist überschritten, das Projekt ist aber nicht abgeschlossen. Passen Sie das Datum an oder schliessen Sie das Projekt ab.')
      .replace(/A milestone \(([^)]+)\) lies after the Target End Date\. Update the end date or the milestone\./, 'Ein Meilenstein ($1) liegt nach dem Zielenddatum. Passen Sie das Enddatum oder den Meilenstein an.')
      .replace('A project\'s budget counts only under its primary link, so totals never overlap.', 'Das Budget eines Projekts zählt nur beim primären Bezug, Summen überlappen nie.')
      .replace('Functional objectives show which corporate objective they support; their projects count there as indirect.', 'Funktionale Ziele zeigen, welches Unternehmensziel sie unterstützen; deren Projekte zählen dort als indirekt.');
    return out !== s ? out : null;
  }
  function tr(s) {
    if (S.lang !== 'de' || !s) return s;
    var t = s.trim(); if (!t) return s;
    var r = de(t);
    if (r == null) for (var i = 0; i < DE_RULES.length && r == null; i++) { var m = t.match(DE_RULES[i][0]); if (m) r = DE_RULES[i][1](m); }
    if (r == null) { var pm = t.match(/^([^A-Za-z0-9(«]+?)\s+([A-Za-z].*)$/); if (pm) { var inner = de(pm[2]); if (inner == null) { var sub = tr(pm[2]); if (sub !== pm[2]) inner = sub; } if (inner != null) r = pm[1] + ' ' + inner; } }
    if (r == null) r = deSentences(t);
    if (r == null) return s;
    var lead = s.match(/^\s*/)[0], trail = s.match(/\s*$/)[0];
    return lead + r + trail;
  }
  function translateTree(root) {
    if (S.lang !== 'de' || !root) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), n, list = [];
    while ((n = w.nextNode())) list.push(n);
    list.forEach(function (x) { var v = tr(x.nodeValue); if (v !== x.nodeValue) x.nodeValue = v; });
    root.querySelectorAll('[title],[placeholder],[aria-label]').forEach(function (el) { ['title', 'placeholder', 'aria-label'].forEach(function (a) { var v = el.getAttribute(a); if (v) { var t2 = tr(v); if (t2 !== v) el.setAttribute(a, t2); } }); });
  }
  function langSelect() { return '<select data-input="lang" aria-label="' + (S.lang === 'de' ? 'Sprache' : 'Language') + '" title="' + (S.lang === 'de' ? 'Sprache' : 'Language') + '" class="rounded-md border border-[#d5dbe4] dark:border-slate-600 bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[11.5px] font-semibold"><option value="en"' + (S.lang === 'en' ? ' selected' : '') + '>EN</option><option value="de"' + (S.lang === 'de' ? ' selected' : '') + '>DE</option></select>'; }

  // ---------- render + events ----------
  function render() {
    var body = { allProjects: renderAllProjects, myProjects: renderMyProjects, myPortfolio: renderMyPortfolio, search: renderSearch, project: renderProject, milestones: renderMilestones, risks: renderRisks, analytics: renderAnalytics, heatmap: renderHeatmap, strategy: renderStrategy }[S.page] || renderAllProjects;
    var scroll = ROOT.querySelector('.ppm-scroll'), st = scroll ? scroll.scrollTop : 0;
    var focusKey = document.activeElement && ROOT.contains(document.activeElement) ? document.activeElement.getAttribute('data-input') : null;
    ROOT.innerHTML = renderChrome('<div class="pt-2">' + renderTopNav() + body() + '</div>');
    translateTree(ROOT);
    var sc = ROOT.querySelector('.ppm-scroll'); if (sc && S._keepScroll) sc.scrollTop = st; S._keepScroll = false;
    if (focusKey) { var el = ROOT.querySelector('[data-input="' + focusKey + '"]'); if (el) { el.focus(); var v = el.value; if (el.setSelectionRange) el.setSelectionRange(v.length, v.length); } }
  }
  function toast(msg) { var t = ROOT.querySelector('[data-toast]'); if (!t) return; t.textContent = 'Demo · ' + tr(msg); t.style.opacity = '1'; clearTimeout(toast._t); toast._t = setTimeout(function () { t.style.opacity = '0'; }, 2600); }
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
    if (page === 'strategy' && S.stView === 'detail' && !num) { S.stView = 'map'; S.stNode = null; }
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
    if (k === 'hview') { S.histView = p[1]; S._keepScroll = true; return render(); }
    if (k === 'hmgroup') { S.hmGroup = S.hmGroup === false; S._keepScroll = true; return render(); }
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
    if (k === 'sview') { S.stView = p[1]; S.stNode = null; if (S.page !== 'strategy') return go('strategy'); return render(); }
    if (k === 'snode') { S.page = 'strategy'; S.stView = 'detail'; S.stNode = +p[1]; return render(); }
    if (k === 'smine') { S.stMine = !S.stMine; S._keepScroll = true; return render(); }
    if (k === 'sreset') { S.stType = 'all'; S.stStrategy = ''; S.stPortfolio = ''; S.stAssess = ''; S.stMine = false; S._keepScroll = true; return render(); }
    if (k === 'fby') { S.flowBy = p[1]; S._keepScroll = true; return render(); }
    if (k === 'fsec') { S.flowSec = !S.flowSec; S._keepScroll = true; return render(); }
    if (k === 'fexpand') { S.flowCollapsed = []; S.flowFocus = null; S._keepScroll = true; return render(); }
    if (k === 'fcoll') { e.stopPropagation(); var fid = +p[1], fi = S.flowCollapsed.indexOf(fid); if (fi === -1) S.flowCollapsed.push(fid); else S.flowCollapsed.splice(fi, 1); S.flowFocus = null; S._keepScroll = true; return render(); }
    if (k === 'ffocus') { S.flowFocus = p[1] && S.flowFocus !== p[1] ? p[1] : null; S._keepScroll = true; return render(); }
    if (k === 'sblk') { var bi = S.storyClosed.indexOf(p[1]); if (bi === -1) S.storyClosed.push(p[1]); else S.storyClosed.splice(bi, 1); S._keepScroll = true; return render(); }
    if (k === 'stype') { S.stType = p[1]; S._keepScroll = true; return render(); }
    if (k === 'stoggle') { var sid = +p[1], si = S.stCollapsed.indexOf(sid); if (si === -1) S.stCollapsed.push(sid); else S.stCollapsed.splice(si, 1); S._keepScroll = true; return render(); }
    if (k === 'sexpand') { S.stCollapsed = []; S._keepScroll = true; return render(); }
    if (k === 'scollapse') { S.stCollapsed = DATA.strategy.nodes.filter(function (n) { return n.nodeType !== 'Initiative'; }).map(function (n) { return n.id; }); S._keepScroll = true; return render(); }
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
    pop.innerHTML = popContent(p); translateTree(pop); pop.classList.remove('hidden');
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
