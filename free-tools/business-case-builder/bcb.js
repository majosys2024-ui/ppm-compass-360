/* PPM Compass – free Business Case Builder.
 * Everything runs in the browser: the draft is autosaved to localStorage,
 * the PDF is generated locally with jsPDF (loaded on demand from /js/vendor/).
 * Exported JSON follows the versioned "ppmcompass.proposal" schema (v1, additive fields only),
 * which the Proposal Prioritizer and the PPM Compass 360 import will read.
 *
 * Finance model: every cost mode (quick size, cost blocks, year-by-year cash flow) produces
 * yearly cost and benefit series for Year 0 (set-up) … Year N. NPV, IRR, payback and ROI are
 * calculated from those series. An optional uncertainty range (whole case or per line) adds a
 * downside and an upside scenario.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'ppmc.bcb.draft.v1';
  var SCHEMA = 'ppmcompass.proposal';
  var SCHEMA_VERSION = 1;
  var JSPDF_SRC = '/js/vendor/jspdf-2.5.2.umd.min.js';
  var MAX_YEARS = 5;
  var SUGGESTED_RATE = 8;

  var SIZES = {
    S: { label: 'S', range: 'under 25k', mid: 15000 },
    M: { label: 'M', range: '25k – 100k', mid: 60000 },
    L: { label: 'L', range: '100k – 500k', mid: 250000 },
    XL: { label: 'XL', range: 'over 500k', mid: 750000 }
  };
  var LEVELS = ['Low', 'Medium', 'High'];
  var BENEFIT_TYPES = ['Cost saving', 'Cost avoidance', 'Revenue increase', 'Productivity / time saved', 'Risk reduction', 'Compliance', 'Customer / quality', 'Other'];
  var RISK_SUGGESTIONS = [
    'Key people not available when needed',
    'Vendor or supplier delivers late',
    'Data migration is harder than expected',
    'Low user adoption after go-live',
    'Scope grows during delivery',
    'Integration with existing systems fails',
    'Budget overrun on external services',
    'Competing priorities pull the team away'
  ];
  var RAMPS = {
    flat: { label: '100 % from year 1', f: [0, 1, 1, 1, 1, 1] },
    ramp50: { label: '50 % in year 1, then 100 %', f: [0, 0.5, 1, 1, 1, 1] },
    ramp25: { label: '25 % → 75 % → 100 %', f: [0, 0.25, 0.75, 1, 1, 1] },
    delayed: { label: 'Starts in year 2', f: [0, 0, 1, 1, 1, 1] },
    custom: { label: 'Custom per year', f: null }
  };
  var LINE_RANGE_DEFAULTS = { cost: [-10, 20], benefit: [-25, 10] };

  // Typical lines per business case type. Costs: [label, 'one-off' | 'running', estimating tip].
  // Benefits: [benefit type, short chip label, description added to step 4]. Amounts are never pre-filled.
  var CONTINGENCY = ['Contingency', 'one-off', 'Often 10–20 % of one-off costs; more for new technology'];
  var CASE_TYPES = {
    software: {
      label: 'IT system / software rollout',
      costs: [
        ['Software licences / subscriptions', 'running', 'Users × price per user per year'],
        ['Implementation partner', 'one-off', 'Quote: fixed price or days × day rate'],
        ['Internal project team', 'one-off', 'Person-days × internal day rate'],
        ['Data migration', 'one-off', 'Often underestimated: clean-up, mapping, test runs'],
        ['Integration with existing systems', 'one-off', 'Interfaces × effort per interface'],
        ['Training and change management', 'one-off', 'People × hours × hourly cost, plus trainer'],
        ['Support and maintenance', 'running', 'Vendor support, often 15–22 % of licence cost'],
        ['Internal administration', 'running', 'FTE share × yearly cost for system owner/admin'],
        CONTINGENCY
      ],
      benefits: [
        ['Productivity / time saved', 'Less manual work', 'Less manual work and rework (hours saved per month × hourly cost × 12)'],
        ['Cost saving', 'Retire legacy system', 'Retire legacy licences, hosting and maintenance'],
        ['Cost avoidance', 'Avoided extra headcount', 'Handle growth without additional headcount'],
        ['Risk reduction', 'Fewer errors and outages', 'Fewer errors, outages and security gaps'],
        ['Customer / quality', 'Faster service', 'Faster, more consistent service to customers']
      ]
    },
    process: {
      label: 'Process improvement / automation',
      costs: [
        ['Process analysis and design', 'one-off', 'Workshops and mapping: days × rate'],
        ['Automation build / configuration', 'one-off', 'Number of workflows × effort per workflow'],
        ['Internal team effort', 'one-off', 'Person-days × internal day rate'],
        ['Training', 'one-off', 'People × hours × hourly cost'],
        ['Automation platform licences', 'running', 'Licences or usage fees per year'],
        ['Ongoing maintenance', 'running', 'Hours per month × hourly cost × 12'],
        CONTINGENCY
      ],
      benefits: [
        ['Productivity / time saved', 'Time saved per case', 'Minutes saved per case × cases per year × hourly cost'],
        ['Cost saving', 'Less rework', 'Lower cost of errors, rework and corrections'],
        ['Customer / quality', 'Shorter lead time', 'Shorter lead and response times'],
        ['Compliance', 'Auditable process', 'Consistent, documented and auditable process']
      ]
    },
    infrastructure: {
      label: 'Infrastructure / hardware / cloud',
      costs: [
        ['Hardware / equipment purchase', 'one-off', 'Units × unit price'],
        ['Cloud or hosting fees', 'running', 'Monthly fee × 12'],
        ['Installation and migration', 'one-off', 'Vendor quote or days × rate'],
        ['Internal IT effort', 'one-off', 'Person-days × internal day rate'],
        ['Decommissioning old systems', 'one-off', 'Removal, data wiping, disposal'],
        ['Maintenance and support contracts', 'running', 'Yearly contract value'],
        ['Energy and operating costs', 'running', 'kWh × price, or facility share'],
        CONTINGENCY
      ],
      benefits: [
        ['Cost saving', 'Lower running costs', 'Lower maintenance, energy and hosting costs of the old setup'],
        ['Cost avoidance', 'Avoided end-of-life failure', 'Avoid emergency replacement and failure costs of end-of-life equipment'],
        ['Risk reduction', 'Fewer outages', 'Fewer outages and security incidents'],
        ['Productivity / time saved', 'Less downtime', 'Less downtime for users (hours × users × hourly cost)']
      ]
    },
    compliance: {
      label: 'Compliance / regulatory',
      costs: [
        ['Legal / compliance advisory', 'one-off', 'Advisor quote or days × rate'],
        ['Process and policy changes', 'one-off', 'Person-days × internal day rate'],
        ['System changes', 'one-off', 'IT change effort or vendor quote'],
        ['Training and awareness', 'one-off', 'People × hours × hourly cost'],
        ['Audits and certification', 'running', 'Yearly audit and certification fees'],
        ['Ongoing compliance monitoring', 'running', 'FTE share × yearly cost'],
        CONTINGENCY
      ],
      benefits: [
        ['Compliance', 'Meet the regulatory deadline', 'Meet the regulatory requirement before the deadline'],
        ['Cost avoidance', 'Avoided fines', 'Avoided fines and penalties (probability × expected amount)'],
        ['Risk reduction', 'Lower legal risk', 'Lower legal and reputational risk'],
        ['Revenue increase', 'Keep certified customers', 'Keep or win customers who require certification']
      ]
    },
    product: {
      label: 'New product / service',
      costs: [
        ['Market research and validation', 'one-off', 'Research budget or days × rate'],
        ['Product development', 'one-off', 'Team size × months × monthly cost'],
        ['Marketing and launch', 'one-off', 'Campaign budget'],
        ['Sales enablement', 'one-off', 'Training, materials, demo setup'],
        ['Production / delivery costs', 'running', 'Units × cost per unit'],
        ['Ongoing marketing', 'running', 'Yearly marketing budget'],
        ['Customer support', 'running', 'Support FTE × yearly cost'],
        CONTINGENCY
      ],
      benefits: [
        ['Revenue increase', 'New revenue', 'New product revenue (units × price)'],
        ['Revenue increase', 'Cross-sell', 'Cross-sell to existing customers'],
        ['Customer / quality', 'Higher retention', 'Higher customer retention'],
        ['Other', 'Market position', 'Stronger market position against competitors']
      ]
    },
    people: {
      label: 'Organisational change / training',
      costs: [
        ['Change management / consultants', 'one-off', 'Days × day rate'],
        ['Training design and delivery', 'one-off', 'Courses × cost per course'],
        ['Employee time in training', 'one-off', 'People × hours × hourly cost'],
        ['Communication', 'one-off', 'Events, materials, internal campaign'],
        ['Ongoing coaching / refreshers', 'running', 'Yearly coaching or e-learning budget'],
        CONTINGENCY
      ],
      benefits: [
        ['Productivity / time saved', 'Higher productivity', 'Higher output per employee'],
        ['Cost saving', 'Lower turnover', 'Lower staff turnover and hiring costs (leavers avoided × cost per hire)'],
        ['Customer / quality', 'Better service quality', 'Better service quality and fewer complaints'],
        ['Risk reduction', 'Fewer incidents', 'Fewer errors and safety incidents']
      ]
    },
    facilities: {
      label: 'Facilities / equipment',
      costs: [
        ['Equipment / fit-out', 'one-off', 'Units × unit price or supplier quote'],
        ['Planning and permits', 'one-off', 'Architect, engineering and permit fees'],
        ['Construction / installation', 'one-off', 'Contractor quote'],
        ['Moving and disruption', 'one-off', 'Moving costs plus lost working hours'],
        ['Maintenance', 'running', 'Yearly maintenance contract'],
        ['Energy and operating costs', 'running', 'Yearly utilities and service costs'],
        ['Insurance', 'running', 'Yearly premium'],
        CONTINGENCY
      ],
      benefits: [
        ['Cost saving', 'Lower operating costs', 'Lower rent, energy or maintenance costs'],
        ['Productivity / time saved', 'More capacity', 'More capacity or a better working environment'],
        ['Risk reduction', 'Safer workplace', 'Health and safety improvements'],
        ['Other', 'Lower emissions', 'Lower CO2 emissions (sustainability targets)']
      ]
    },
    other: {
      label: 'Other / general',
      costs: [
        ['Internal effort', 'one-off', 'Person-days × internal day rate'],
        ['External services', 'one-off', 'Quotes from suppliers'],
        ['Purchases and licences', 'one-off', 'Items × price'],
        ['Running costs', 'running', 'Yearly licences, support, operations'],
        CONTINGENCY
      ],
      benefits: [
        ['Cost saving', 'Cost savings', 'Direct cost savings'],
        ['Productivity / time saved', 'Time saved', 'Hours saved × hourly cost'],
        ['Revenue increase', 'Additional revenue', 'Additional revenue'],
        ['Risk reduction', 'Lower risk', 'Lower operational risk']
      ]
    }
  };
  var SOLUTION_WORDS = /^(we need|we should|we want|implement|introduce|buy|purchase|deploy|roll out|rollout|install|migrate to|replace|build|develop|upgrade|switch to|move to)\b/i;

  var STEPS = [
    { id: 'problem', title: 'Problem', kicker: 'Step 1 of 7', h: 'What problem are we solving?', p: 'Committees fund problems, not tools. Describe what hurts today and what it costs to do nothing.' },
    { id: 'solution', title: 'Solution & scope', kicker: 'Step 2 of 7', h: 'What do you propose, and what not?', p: 'Summarise the solution, draw the scope boundaries and name the alternatives you considered.' },
    { id: 'strategy', title: 'Strategic fit', kicker: 'Step 3 of 7', h: 'Which strategic objective does it serve?', p: 'Link the proposal to one objective your leadership already cares about.' },
    { id: 'benefits', title: 'Benefits', kicker: 'Step 4 of 7', h: 'What do we get?', p: 'List the expected benefits. Put a yearly amount on the ones you can; keep the rest qualitative.' },
    { id: 'cost', title: 'Cost & financials', kicker: 'Step 5 of 7', h: 'What will it cost, and what is it worth?', p: 'Pick a size, enter the main cost blocks, or build a year-by-year cash flow. Optionally add a range to show the downside and upside.' },
    { id: 'risks', title: 'Risks', kicker: 'Step 6 of 7', h: 'What could go wrong?', p: 'Name the top 3–5 risks and how you would reduce them. It shows you have thought it through.' },
    { id: 'resources', title: 'Resources & decision', kicker: 'Step 7 of 7', h: 'Who is needed, and what do you ask for?', p: 'State the people and time needed, and the exact decision you want from the committee.' },
    { id: 'review', title: 'Review & download', kicker: 'Done', h: 'Your one-page business case', p: 'Check the preview, then download the PDF. Save the .json file if you want to edit it later or add it to a prioritization.' }
  ];
  var COST_STEP = 4;

  /* ---------------- State ---------------- */
  function uid(p) { return p + '_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4); }

  function emptyProposal() {
    var now = new Date().toISOString();
    return {
      schema: SCHEMA,
      version: SCHEMA_VERSION,
      id: uid('p'),
      createdAt: now,
      updatedAt: now,
      title: '',
      author: '',
      department: '',
      caseType: '',
      currency: 'EUR',
      problem: { statement: '', affected: '', costOfInactionMonthly: null },
      solution: { summary: '', inScope: '', outOfScope: '', alternatives: '' },
      strategy: { objective: '', contribution: 'direct', rationale: '' },
      benefits: [],
      cost: { mode: 'quick', size: '', estimate: null, internalDays: null, dayRate: null, external: null, oneOff: null, annualRun: null },
      finance: { years: 5, discountRate: SUGGESTED_RATE, appendix: false },
      range: { mode: 'none', costLow: -10, costHigh: 25, benefitLow: -30, benefitHigh: 10, showInReport: true },
      cashflow: { lines: [] },
      risks: [],
      resources: { roles: '', effort: '', durationMonths: null, start: '', milestones: '', decision: '' }
    };
  }

  function newLine(kind, extra) {
    var d = LINE_RANGE_DEFAULTS[kind];
    var l = { id: uid('l'), kind: kind, category: kind === 'cost' ? 'one-off' : '', label: '', hint: '', benefitId: null, ramp: 'flat', amounts: [null, null, null, null, null, null], low: d[0], high: d[1] };
    if (extra) Object.keys(extra).forEach(function (k) { l[k] = extra[k]; });
    return l;
  }

  var state = load() || emptyProposal();
  var current = 0;
  var saveTimer = null;

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return normalize(JSON.parse(raw));
    } catch (e) { return null; }
  }

  function save() {
    state.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setSaved('Saved in this browser');
    } catch (e) {
      setSaved('Not saved (browser storage blocked). Download the .json to keep your work.');
    }
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    setSaved('Saving…');
    saveTimer = setTimeout(save, 400);
  }

  function setSaved(t) {
    var el = $('#bcb-saved');
    if (el) el.textContent = t;
  }

  // Merge an imported/loaded object onto a fresh skeleton so missing fields never break the UI.
  function normalize(obj) {
    if (!obj || typeof obj !== 'object') return null;
    var base = emptyProposal();
    ['id', 'createdAt', 'updatedAt', 'title', 'author', 'department', 'caseType', 'currency'].forEach(function (k) {
      if (typeof obj[k] === 'string' && obj[k]) base[k] = obj[k];
    });
    if (base.caseType && !CASE_TYPES[base.caseType]) base.caseType = '';
    ['problem', 'solution', 'strategy', 'cost', 'resources', 'finance', 'range'].forEach(function (k) {
      if (obj[k] && typeof obj[k] === 'object') {
        Object.keys(base[k]).forEach(function (f) {
          if (obj[k][f] !== undefined) base[k][f] = obj[k][f];
        });
      }
    });
    if (['quick', 'detailed', 'cashflow'].indexOf(base.cost.mode) < 0) base.cost.mode = 'quick';
    if ([3, 4, 5].indexOf(+base.finance.years) < 0) base.finance.years = 5; else base.finance.years = +base.finance.years;
    if (numOrNull(base.finance.discountRate) === null) base.finance.discountRate = SUGGESTED_RATE;
    base.finance.appendix = !!base.finance.appendix;
    if (['none', 'total', 'line'].indexOf(base.range.mode) < 0) base.range.mode = 'none';
    base.range.showInReport = base.range.showInReport !== false;

    if (Array.isArray(obj.benefits)) {
      base.benefits = obj.benefits.map(function (b) {
        return { id: str(b.id) || uid('b'), type: str(b.type) || BENEFIT_TYPES[0], description: str(b.description), annualAmount: numOrNull(b.annualAmount), confidence: LEVELS.indexOf(b.confidence) >= 0 ? b.confidence : 'Medium' };
      });
    }
    if (Array.isArray(obj.risks)) {
      base.risks = obj.risks.map(function (r) {
        return { description: str(r.description), likelihood: LEVELS.indexOf(r.likelihood) >= 0 ? r.likelihood : 'Medium', impact: LEVELS.indexOf(r.impact) >= 0 ? r.impact : 'Medium', mitigation: str(r.mitigation) };
      });
    }
    if (obj.cashflow && Array.isArray(obj.cashflow.lines)) {
      base.cashflow.lines = obj.cashflow.lines.map(function (l) {
        var kind = l.kind === 'benefit' ? 'benefit' : 'cost';
        var amounts = [];
        for (var t = 0; t <= MAX_YEARS; t++) amounts.push(Array.isArray(l.amounts) ? numOrNull(l.amounts[t]) : null);
        return newLine(kind, {
          id: str(l.id) || uid('l'),
          category: kind === 'cost' ? (l.category === 'running' ? 'running' : 'one-off') : '',
          label: str(l.label),
          hint: str(l.hint),
          benefitId: l.benefitId ? str(l.benefitId) : null,
          ramp: RAMPS[l.ramp] ? l.ramp : 'flat',
          amounts: amounts,
          low: numOrNull(l.low) === null ? LINE_RANGE_DEFAULTS[kind][0] : numOrNull(l.low),
          high: numOrNull(l.high) === null ? LINE_RANGE_DEFAULTS[kind][1] : numOrNull(l.high)
        });
      });
    }
    return base;
  }

  /* ---------------- Helpers ---------------- */
  function $(s, root) { return (root || document).querySelector(s); }
  function $$(s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); }
  function str(v) { return typeof v === 'string' ? v : (v == null ? '' : String(v)); }
  function numOrNull(v) {
    if (v === '' || v === null || v === undefined || typeof v === 'boolean') return null;
    var n = typeof v === 'number' ? v : parseFloat(String(v).replace(/−/g, '-').replace(/[^0-9.\-]/g, ''));
    return isFinite(n) ? n : null;
  }
  function filled(s, min) { return str(s).trim().length >= (min || 1); }
  function esc(s) {
    return str(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function getPath(obj, path) { return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj); }
  function setPath(obj, path, val) {
    var parts = path.split('.'); var last = parts.pop();
    var target = parts.reduce(function (o, k) { return o[k]; }, obj);
    target[last] = val;
  }
  function sum(a) { return a.reduce(function (s, x) { return s + (x || 0); }, 0); }
  function zeros(n) { var a = []; for (var i = 0; i < n; i++) a.push(0); return a; }
  function money(n, opts) {
    if (n === null || n === undefined || !isFinite(n)) return '–';
    try {
      return new Intl.NumberFormat('en', Object.assign({ style: 'currency', currency: state.currency, maximumFractionDigits: 0 }, opts || {})).format(n);
    } catch (e) { return Math.round(n).toLocaleString('en') + ' ' + state.currency; }
  }
  function compact(n) {
    if (n === null || n === undefined || !isFinite(n)) return '–';
    try { return new Intl.NumberFormat('en', { style: 'currency', currency: state.currency, notation: 'compact', maximumFractionDigits: 1 }).format(n); }
    catch (e) { return money(n); }
  }
  function num(n) { return (n === null || !isFinite(n)) ? '–' : new Intl.NumberFormat('en', { maximumFractionDigits: 0 }).format(Math.round(n)); }
  function pct(x) { return (x === null || x === undefined || !isFinite(x)) ? '–' : Math.round(x * 100) + ' %'; }
  function signedPct(v) { var n = numOrNull(v) || 0; return (n > 0 ? '+' : '') + n + ' %'; }
  function payback(m, long) {
    if (m === null || m === undefined) return '–';
    if (m < 1) return long ? 'under 1 month' : '< 1 mo';
    return Math.round(m) + (long ? ' months' : ' mo');
  }
  function track(name) {
    try { if (typeof window.clarity === 'function') window.clarity('event', name); } catch (e) { /* analytics optional */ }
  }
  function toast(msg) {
    var t = $('#ft-toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }
  function slug(s) { return (str(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'business-case').slice(0, 60); }

  /* ---------------- Finance model ---------------- */
  function years() { return state.finance.years || 5; }
  function rate() { var r = numOrNull(state.finance.discountRate); return r === null ? 0 : r; }
  function rangeMode() {
    var m = state.range.mode;
    if (m === 'line' && state.cost.mode !== 'cashflow') return 'total';
    return m;
  }
  function benefitById(id) { for (var i = 0; i < state.benefits.length; i++) if (state.benefits[i].id === id) return state.benefits[i]; return null; }

  function simpleOneOff() {
    var c = state.cost;
    if (c.mode === 'quick') {
      var est = numOrNull(c.estimate);
      return est !== null ? est : (SIZES[c.size] ? SIZES[c.size].mid : null);
    }
    var s = (numOrNull(c.internalDays) || 0) * (numOrNull(c.dayRate) || 0) + (numOrNull(c.external) || 0) + (numOrNull(c.oneOff) || 0);
    return s > 0 ? s : null;
  }
  function benefitYearly() { return state.benefits.reduce(function (s, b) { return s + (numOrNull(b.annualAmount) || 0); }, 0); }

  // Keep one linked cash-flow line per benefit from step 4 (cash-flow mode only).
  function syncLinked() {
    var ids = state.benefits.map(function (b) { return b.id; });
    state.cashflow.lines = state.cashflow.lines.filter(function (l) { return !l.benefitId || ids.indexOf(l.benefitId) >= 0; });
    state.benefits.forEach(function (b) {
      var has = state.cashflow.lines.some(function (l) { return l.benefitId === b.id; });
      if (!has) state.cashflow.lines.push(newLine('benefit', { benefitId: b.id }));
    });
  }

  function lineAmounts(l) {
    var N = years(), out = [];
    var linked = l.benefitId && l.ramp !== 'custom' ? benefitById(l.benefitId) : null;
    for (var t = 0; t <= N; t++) {
      if (l.benefitId && l.ramp !== 'custom') {
        out.push((linked ? (numOrNull(linked.annualAmount) || 0) : 0) * RAMPS[l.ramp || 'flat'].f[t]);
      } else {
        out.push(numOrNull(l.amounts[t]) || 0);
      }
    }
    return out;
  }

  function lineLabel(l) {
    if (l.benefitId) {
      var b = benefitById(l.benefitId);
      if (b) return b.type + (filled(b.description) ? ': ' + b.description : '');
    }
    return filled(l.label) ? l.label : (l.kind === 'cost' ? 'Cost item' : 'Benefit item');
  }

  function lineTypeLabel(l) { return l.kind === 'benefit' ? 'Benefit' : (l.category === 'running' ? 'Cost (running)' : 'Cost (one-off)'); }

  // Rows that make up the cash flow, whatever the cost mode.
  function cashRows() {
    var N = years();
    if (state.cost.mode === 'cashflow') {
      return state.cashflow.lines.map(function (l) {
        return { kind: l.kind, label: lineLabel(l), type: lineTypeLabel(l), values: lineAmounts(l), low: l.low, high: l.high, ramp: l.benefitId ? l.ramp : null };
      });
    }
    var rows = [], o = simpleOneOff(), run = numOrNull(state.cost.annualRun) || 0;
    var c = state.cost;
    if (o) {
      var label = c.mode === 'quick'
        ? (numOrNull(c.estimate) !== null ? 'One-off investment (estimate)' : 'One-off investment (size ' + c.size + ' midpoint)')
        : 'One-off investment (effort, services, licences)';
      var v = zeros(N + 1); v[0] = o;
      rows.push({ kind: 'cost', label: label, type: 'Cost (one-off)', values: v });
    }
    if (run > 0) {
      var r = zeros(N + 1); for (var t = 1; t <= N; t++) r[t] = run;
      rows.push({ kind: 'cost', label: 'Running costs', type: 'Cost (running)', values: r });
    }
    state.benefits.forEach(function (b) {
      var a = numOrNull(b.annualAmount) || 0;
      if (a <= 0) return;
      var bv = zeros(N + 1); for (var t2 = 1; t2 <= N; t2++) bv[t2] = a;
      rows.push({ kind: 'benefit', label: b.type + (filled(b.description) ? ': ' + b.description : ''), type: 'Benefit', values: bv });
    });
    return rows;
  }

  function scenario(sc) {
    var N = years(), costs = zeros(N + 1), bens = zeros(N + 1), rm = rangeMode(), R = state.range;
    function factor(kind, low, high) {
      if (sc === 'base' || rm === 'none') return 1;
      var p = kind === 'cost' ? (sc === 'down' ? high : low) : (sc === 'down' ? low : high);
      return 1 + (numOrNull(p) || 0) / 100;
    }
    cashRows().forEach(function (row) {
      var f = rm === 'line'
        ? factor(row.kind, row.low, row.high)
        : factor(row.kind, row.kind === 'cost' ? R.costLow : R.benefitLow, row.kind === 'cost' ? R.costHigh : R.benefitHigh);
      var target = row.kind === 'cost' ? costs : bens;
      for (var t = 0; t <= N; t++) target[t] += row.values[t] * f;
    });
    return metrics(costs, bens, rate());
  }

  function irr(net) {
    function npvAt(r) { var s = 0; for (var t = 0; t < net.length; t++) s += net[t] / Math.pow(1 + r, t); return s; }
    var lo = -0.95, hi = 10, flo = npvAt(lo), fhi = npvAt(hi);
    if (!isFinite(flo) || !isFinite(fhi) || flo * fhi > 0) return null;
    for (var i = 0; i < 200; i++) {
      var mid = (lo + hi) / 2, fm = npvAt(mid);
      if (Math.abs(fm) < 1e-7) return mid;
      if (fm * flo > 0) { lo = mid; flo = fm; } else { hi = mid; }
    }
    return (lo + hi) / 2;
  }

  function metrics(costs, bens, ratePct) {
    var r = ratePct / 100, net = [], cum = [], dnet = [], c = 0, npv = 0;
    for (var t = 0; t < costs.length; t++) {
      net[t] = bens[t] - costs[t];
      c += net[t]; cum[t] = c;
      dnet[t] = net[t] / Math.pow(1 + r, t);
      npv += dnet[t];
    }
    var totalCost = sum(costs), totalBenefit = sum(bens);
    var pb = null;
    if (totalCost > 0 && totalBenefit > 0) {
      if (cum[0] >= 0) pb = 0;
      else for (var k = 1; k < cum.length; k++) {
        if (cum[k - 1] < 0 && cum[k] >= 0) { pb = ((k - 1) + (-cum[k - 1]) / net[k]) * 12; break; }
      }
    }
    var empty = totalCost === 0 && totalBenefit === 0;
    return {
      costs: costs, bens: bens, net: net, cum: cum, dnet: dnet,
      totalCost: totalCost, totalBenefit: totalBenefit,
      npv: empty ? null : npv,
      irr: empty ? null : irr(net),
      payback: pb,
      paybackBeyond: !empty && totalCost > 0 && totalBenefit > 0 && pb === null,
      roi: totalCost > 0 ? (totalBenefit - totalCost) / totalCost : null,
      empty: empty
    };
  }

  function figures() {
    if (state.cost.mode === 'cashflow') syncLinked();
    var rm = rangeMode();
    var base = scenario('base');
    var c = state.cost;
    var inaction = numOrNull(state.problem.costOfInactionMonthly);
    return {
      mode: c.mode, years: years(), rate: rate(),
      base: base,
      down: rm !== 'none' ? scenario('down') : null,
      up: rm !== 'none' ? scenario('up') : null,
      rangeMode: rm,
      rangeOn: rm !== 'none',
      rangeInReport: rm !== 'none' && state.range.showInReport,
      oneOff: base.costs[0] || null,
      benefitYearly: benefitYearly(),
      isSizeEstimate: c.mode === 'quick' && numOrNull(c.estimate) === null && !!SIZES[c.size],
      inactionYear: inaction !== null ? inaction * 12 : null
    };
  }

  function paybackText(m, long, years) {
    if (m.payback !== null) return payback(m.payback, long);
    if (m.paybackBeyond) return long ? 'not within ' + years + ' years' : '> ' + years + ' yr';
    return '–';
  }

  function rangeSummary(inAppendix) {
    var rm = rangeMode(), R = state.range;
    if (rm === 'none') return '';
    if (rm === 'line') return 'Range set per line item' + (inAppendix ? ' (Range column)' : (state.finance.appendix ? ' (see financial appendix)' : ''));
    return 'Range: costs ' + signedPct(R.costLow) + ' / ' + signedPct(R.costHigh) + ', benefits ' + signedPct(R.benefitLow) + ' / ' + signedPct(R.benefitHigh);
  }

  /* ---------------- Score ---------------- */
  function score() {
    var p = state, f = figures();
    var quantified = p.benefits.filter(function (b) { return numOrNull(b.annualAmount) > 0; }).length;
    var anyBenefit = p.benefits.filter(function (b) { return filled(b.description) || numOrNull(b.annualAmount) > 0; }).length;
    var risks = p.risks.filter(function (r) { return filled(r.description); });
    var mitigated = risks.filter(function (r) { return filled(r.mitigation, 5); }).length;
    var checks = [
      { label: 'Problem clearly described', pts: 10, got: filled(p.problem.statement, 80) ? 10 : (filled(p.problem.statement, 15) ? 5 : 0), step: 0 },
      { label: 'Cost of doing nothing quantified', pts: 5, got: numOrNull(p.problem.costOfInactionMonthly) > 0 ? 5 : 0, step: 0 },
      { label: 'Solution summarised', pts: 10, got: filled(p.solution.summary, 40) ? 10 : (filled(p.solution.summary, 10) ? 5 : 0), step: 1 },
      { label: 'Scope boundaries set', pts: 5, got: (filled(p.solution.inScope) && filled(p.solution.outOfScope)) ? 5 : ((filled(p.solution.inScope) || filled(p.solution.outOfScope)) ? 2 : 0), step: 1 },
      { label: 'Alternatives considered', pts: 10, got: filled(p.solution.alternatives, 15) ? 10 : 0, step: 1 },
      { label: 'Linked to a strategic objective', pts: 10, got: filled(p.strategy.objective) && p.strategy.contribution !== 'none' ? (filled(p.strategy.rationale, 10) ? 10 : 7) : 0, step: 2 },
      { label: 'Benefits quantified', pts: 15, got: (quantified > 0 || f.base.totalBenefit > 0) ? 15 : (anyBenefit > 0 ? 5 : 0), step: 3 },
      { label: 'Costs estimated', pts: 10, got: f.base.totalCost > 0 ? 10 : 0, step: 4 },
      { label: 'At least 2 risks identified', pts: 5, got: risks.length >= 2 ? 5 : (risks.length === 1 ? 2 : 0), step: 5 },
      { label: 'Every risk has a mitigation', pts: 5, got: risks.length > 0 && mitigated === risks.length ? 5 : 0, step: 5 },
      { label: 'Resources & timeline stated', pts: 5, got: (filled(p.resources.roles) ? 3 : 0) + (numOrNull(p.resources.durationMonths) > 0 ? 2 : 0), step: 6 },
      { label: 'Clear decision request', pts: 10, got: filled(p.resources.decision, 15) ? 10 : 0, step: 6 }
    ];
    var total = checks.reduce(function (s, c) { return s + c.got; }, 0);
    var band = total >= 80 ? { cls: 'b2', label: 'Committee-ready' } : (total >= 50 ? { cls: 'b1', label: 'Nearly ready' } : { cls: 'b0', label: 'Draft' });
    return { total: total, checks: checks, band: band };
  }

  /* ---------------- Chart (SVG, used in the app and preview) ---------------- */
  function cumChartSvg(f) {
    var series = [{ d: f.base.cum, cls: 'base', name: 'Base' }];
    if (f.rangeOn) { series.push({ d: f.down.cum, cls: 'down', name: 'Downside' }); series.push({ d: f.up.cum, cls: 'up', name: 'Upside' }); }
    var all = [0]; series.forEach(function (s) { all = all.concat(s.d); });
    var min = Math.min.apply(null, all), max = Math.max.apply(null, all);
    if (min === max) { max = min + 1; }
    var W = 820, H = 230, L = 70, R = 14, T = 12, B = 26, N = f.years;
    function x(t) { return L + (W - L - R) * t / N; }
    function y(v) { return T + (H - T - B) * (max - v) / (max - min); }
    var g = '<line class="zero" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(0).toFixed(1) + '" y2="' + y(0).toFixed(1) + '"/>';
    for (var t = 0; t <= N; t++) g += '<text class="xl" x="' + x(t).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle">' + (t === 0 ? 'Y0' : 'Y' + t) + '</text>';
    g += '<text class="yl" x="' + (L - 6) + '" y="' + (y(max) + 4).toFixed(1) + '" text-anchor="end">' + esc(compact(max)) + '</text>';
    g += '<text class="yl" x="' + (L - 6) + '" y="' + (y(min) + 4).toFixed(1) + '" text-anchor="end">' + esc(compact(min)) + '</text>';
    if (min < 0 && max > 0) g += '<text class="yl" x="' + (L - 6) + '" y="' + (y(0) + 4).toFixed(1) + '" text-anchor="end">0</text>';
    series.slice().reverse().forEach(function (s) {
      g += '<polyline class="' + s.cls + '" points="' + s.d.map(function (v, i) { return x(i).toFixed(1) + ',' + y(v).toFixed(1); }).join(' ') + '"/>';
    });
    var legend = f.rangeOn ? '<div class="bcb-legend"><span class="base">Base</span><span class="down">Downside</span><span class="up">Upside</span></div>' : '';
    return '<div class="bcb-chart"><div class="bcb-chart-title">Cumulative cash flow (' + esc(state.currency) + ')</div><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Cumulative cash flow by year">' + g + '</svg>' + legend + '</div>';
  }

  function finTableHtml(f, long, small) {
    var cols = f.rangeOn ? [['Downside', f.down], ['Base', f.base], ['Upside', f.up]] : [['Base', f.base]];
    var mf = small ? compact : money, yrs = small ? '' : ' (' + f.years + ' yrs)';
    var rows = [
      ['Total cost' + yrs, function (m) { return mf(m.totalCost); }],
      ['Total benefit' + yrs, function (m) { return mf(m.totalBenefit); }],
      ['Net cash flow', function (m) { return mf(sum(m.net)); }],
      ['NPV @ ' + f.rate + ' %', function (m) { return mf(m.npv); }],
      ['IRR', function (m) { return pct(m.irr); }],
      ['Payback', function (m) { return paybackText(m, long, f.years); }],
      ['ROI' + yrs, function (m) { return pct(m.roi); }]
    ];
    return '<table class="bcb-fin"><thead><tr><th></th>' + cols.map(function (c) { return '<th class="' + (c[0] === 'Base' ? 'is-base' : '') + '">' + c[0] + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr><td>' + esc(r[0]) + '</td>' + cols.map(function (c) { return '<td class="num' + (c[0] === 'Base' ? ' is-base' : '') + '">' + esc(r[1](c[1])) + '</td>'; }).join('') + '</tr>';
      }).join('') + '</tbody></table>';
  }

  /* ---------------- Rendering ---------------- */
  function renderSteps() {
    var sc = score();
    var stepDone = STEPS.map(function (s, i) {
      var cs = sc.checks.filter(function (c) { return c.step === i; });
      return cs.length > 0 && cs.every(function (c) { return c.got > 0; });
    });
    $('#bcb-steps').innerHTML = STEPS.map(function (s, i) {
      var cls = 'bcb-step' + (i === current ? ' is-active' : '') + (stepDone[i] && i !== current ? ' is-done' : '');
      var n = stepDone[i] && i !== current ? '✓' : (i === STEPS.length - 1 ? '★' : String(i + 1));
      return '<button type="button" class="' + cls + '" data-goto="' + i + '"' + (i === current ? ' aria-current="step"' : '') + '><span class="n">' + n + '</span>' + esc(s.title) + '</button>';
    }).join('');
    // On narrow screens the stepper scrolls sideways: keep the active step visible.
    var nav = $('#bcb-steps'), active = $('.bcb-step.is-active', nav);
    if (active && nav.scrollWidth > nav.clientWidth) {
      nav.scrollLeft = active.offsetLeft - nav.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
    }
  }

  function renderHead() {
    var s = STEPS[current];
    $('#bcb-kicker').textContent = s.kicker;
    $('#bcb-title').textContent = s.h;
    $('#bcb-desc').textContent = s.p;
    $$('.bcb-section').forEach(function (el) { el.hidden = el.getAttribute('data-step') !== s.id; });
    setWide();
    $('#bcb-prev').disabled = current === 0;
    var next = $('#bcb-next');
    if (current === STEPS.length - 1) { next.hidden = true; }
    else {
      next.hidden = false;
      next.textContent = current === STEPS.length - 2 ? 'Review & download →' : 'Next: ' + STEPS[current + 1].title + ' →';
    }
  }

  function renderScore() {
    var sc = score();
    var C = 2 * Math.PI * 32;
    var color = sc.total >= 80 ? '#059669' : (sc.total >= 50 ? '#f59e0b' : '#ef4444');
    $('#bcb-ring-arc').setAttribute('stroke-dasharray', (C * sc.total / 100).toFixed(1) + ' ' + C.toFixed(1));
    $('#bcb-ring-arc').setAttribute('stroke', color);
    $('#bcb-ring-val').textContent = sc.total;
    var band = $('#bcb-band');
    band.className = 'bcb-band ' + sc.band.cls;
    band.textContent = sc.band.label;
    $('#bcb-checks').innerHTML = sc.checks.map(function (c) {
      var st = c.got >= c.pts ? 'ok' : (c.got > 0 ? 'part' : '');
      return '<li class="' + st + '"><span class="ic">' + (st === 'ok' ? '✓' : (st === 'part' ? '~' : '')) + '</span>' +
        '<button type="button" data-goto="' + c.step + '">' + esc(c.label) + '</button><span class="pts">' + c.got + '/' + c.pts + '</span></li>';
    }).join('');
  }

  function rangeLine(vals, fmt) {
    var v = vals.filter(function (x) { return x !== null && x !== undefined && isFinite(x); });
    if (v.length < 2) return '';
    return 'range ' + fmt(Math.min.apply(null, v)) + ' to ' + fmt(Math.max.apply(null, v));
  }

  function renderFigures() {
    var f = figures(), b = f.base;
    $('#fig-cost-k').textContent = 'Total cost (' + f.years + ' yr)';
    $('#fig-roi-k').textContent = 'ROI (' + f.years + ' yr)';
    $('#fig-cost').textContent = b.totalCost ? compact(b.totalCost) : '–';
    var npv = $('#fig-npv');
    npv.textContent = b.npv === null ? '–' : compact(b.npv);
    npv.className = 'v' + (b.npv === null ? '' : (b.npv >= 0 ? ' pos' : ' neg'));
    $('#fig-payback').textContent = paybackText(b, false, f.years);
    var roi = $('#fig-roi');
    roi.textContent = pct(b.roi);
    roi.className = 'v' + (b.roi === null ? '' : (b.roi >= 0 ? ' pos' : ' neg'));
    var sc = f.rangeOn ? [f.down, f.up] : [];
    $('#fig-cost-r').textContent = f.rangeOn ? rangeLine(sc.map(function (m) { return m.totalCost; }), compact) : '';
    $('#fig-npv-r').textContent = f.rangeOn ? rangeLine(sc.map(function (m) { return m.npv; }), compact) : '';
    $('#fig-payback-r').textContent = f.rangeOn ? rangeLine(sc.map(function (m) { return m.payback; }), function (x) { return payback(x); }) : '';
    $('#fig-roi-r').textContent = f.rangeOn ? rangeLine(sc.map(function (m) { return m.roi; }), pct) : '';
    $('#fig-note').textContent = 'NPV at ' + f.rate + ' % over ' + f.years + ' years (Year 0 = set-up). ROI = (total benefits − total costs) ÷ total costs.' +
      (f.isSizeEstimate ? ' Cost uses the midpoint of size ' + state.cost.size + '.' : '');

    var bt = $('#bcb-benefit-total');
    if (bt) bt.innerHTML = '<span>Total yearly benefit: <b>' + money(f.benefitYearly) + '</b></span><span>Quantified items: <b>' +
      state.benefits.filter(function (x) { return numOrNull(x.annualAmount) > 0; }).length + ' of ' + state.benefits.length + '</b></span>' +
      (state.cost.mode === 'cashflow' ? '<span>You can phase these over the years in step 5 (cash flow).</span>' : '');

    var fr = $('#bcb-fin-results');
    if (fr && current === COST_STEP) {
      fr.innerHTML = (b.empty ? '<div class="bcb-empty">Enter costs and benefits to see NPV, IRR, payback and ROI.</div>' : finTableHtml(f, true) + cumChartSvg(f));
    }
    if (state.cost.mode === 'cashflow' && current === COST_STEP) renderCfFoot(f);
  }

  function renderHints() {
    var st = str(state.problem.statement).trim();
    $('#hint-problem').hidden = !(st && SOLUTION_WORDS.test(st));
    $('#hint-decision').hidden = current !== 6 || filled(state.resources.decision, 15);
    var risks = state.risks.filter(function (r) { return filled(r.description); });
    $('#hint-risks').hidden = !(risks.length > 0 && risks.some(function (r) { return !filled(r.mitigation, 5); }));
  }

  function renderBenefits() {
    var wrap = $('#bcb-benefits');
    if (!state.benefits.length) {
      wrap.innerHTML = '<div class="bcb-empty">No benefits yet. Add at least one, and put a yearly amount on it if you can.</div>';
      return;
    }
    wrap.innerHTML = state.benefits.map(function (b, i) {
      return '<div class="bcb-item">' +
        '<div class="bcb-item-head"><span>Benefit ' + (i + 1) + '</span><button type="button" class="ft-btn ft-btn-danger" data-del-benefit="' + i + '" aria-label="Remove benefit ' + (i + 1) + '">Remove</button></div>' +
        '<div class="bcb-row c3">' +
          '<div><label class="bcb-mini-label" for="b-type-' + i + '">Type</label><select id="b-type-' + i + '" class="ft-select" data-benefit="' + i + '" data-key="type">' +
            BENEFIT_TYPES.map(function (t) { return '<option' + (t === b.type ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select></div>' +
          '<div><label class="bcb-mini-label" for="b-amt-' + i + '">Yearly amount (' + esc(state.currency) + ')</label><input id="b-amt-' + i + '" class="ft-input" inputmode="decimal" placeholder="e.g. 40000" data-benefit="' + i + '" data-key="annualAmount" value="' + (b.annualAmount == null ? '' : esc(b.annualAmount)) + '" /></div>' +
          '<div><label class="bcb-mini-label" for="b-conf-' + i + '">Confidence</label><select id="b-conf-' + i + '" class="ft-select" data-benefit="' + i + '" data-key="confidence">' +
            LEVELS.map(function (l) { return '<option' + (l === b.confidence ? ' selected' : '') + '>' + l + '</option>'; }).join('') + '</select></div>' +
        '</div>' +
        '<div style="margin-top:10px"><label class="bcb-mini-label" for="b-desc-' + i + '">Description</label><input id="b-desc-' + i + '" class="ft-input" placeholder="e.g. 2 fewer FTE days per month spent on manual status reports" data-benefit="' + i + '" data-key="description" value="' + esc(b.description) + '" /></div>' +
      '</div>';
    }).join('');
  }

  function renderRisks() {
    var wrap = $('#bcb-risks');
    if (!state.risks.length) {
      wrap.innerHTML = '<div class="bcb-empty">No risks yet. Pick a suggestion above or add your own.</div>';
      return;
    }
    wrap.innerHTML = state.risks.map(function (r, i) {
      return '<div class="bcb-item">' +
        '<div class="bcb-item-head"><span>Risk ' + (i + 1) + '</span><button type="button" class="ft-btn ft-btn-danger" data-del-risk="' + i + '" aria-label="Remove risk ' + (i + 1) + '">Remove</button></div>' +
        '<div class="bcb-row c-risk">' +
          '<div><label class="bcb-mini-label" for="r-desc-' + i + '">Risk</label><input id="r-desc-' + i + '" class="ft-input" data-risk="' + i + '" data-key="description" value="' + esc(r.description) + '" placeholder="What could go wrong?" /></div>' +
          '<div><label class="bcb-mini-label" for="r-l-' + i + '">Likelihood</label><select id="r-l-' + i + '" class="ft-select" data-risk="' + i + '" data-key="likelihood">' + LEVELS.map(function (l) { return '<option' + (l === r.likelihood ? ' selected' : '') + '>' + l + '</option>'; }).join('') + '</select></div>' +
          '<div><label class="bcb-mini-label" for="r-i-' + i + '">Impact</label><select id="r-i-' + i + '" class="ft-select" data-risk="' + i + '" data-key="impact">' + LEVELS.map(function (l) { return '<option' + (l === r.impact ? ' selected' : '') + '>' + l + '</option>'; }).join('') + '</select></div>' +
        '</div>' +
        '<div style="margin-top:10px"><label class="bcb-mini-label" for="r-m-' + i + '">Mitigation</label><input id="r-m-' + i + '" class="ft-input" data-risk="' + i + '" data-key="mitigation" value="' + esc(r.mitigation) + '" placeholder="How will you reduce it?" /></div>' +
      '</div>';
    }).join('');
  }

  // The cash-flow table needs room: drop the sidebar below the panel while it is shown.
  function setWide() {
    $('#bcb-app').classList.toggle('is-wide', current === COST_STEP && state.cost.mode === 'cashflow');
  }

  function renderCostMode() {
    var m = state.cost.mode, rm = rangeMode();
    setWide();
    $$('[data-cost-mode]').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-cost-mode') === m); });
    $('#cost-quick').hidden = m !== 'quick';
    $('#cost-detailed').hidden = m !== 'detailed';
    $('#cost-cashflow').hidden = m !== 'cashflow';
    $('#cost-run-field').hidden = m === 'cashflow';
    $('#sug-cf-tip').hidden = m === 'cashflow';
    $$('.bcb-size').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-size') === state.cost.size); });
    $$('[data-size-range]').forEach(function (el) {
      var s = SIZES[el.getAttribute('data-size-range')];
      el.textContent = s.range + ' ' + state.currency;
    });
    $$('[data-currency-label]').forEach(function (el) { el.textContent = state.currency; });
    $$('[data-years]').forEach(function (b) { b.classList.toggle('is-on', +b.getAttribute('data-years') === years()); });
    $$('[data-rate]').forEach(function (b) { b.classList.toggle('is-on', +b.getAttribute('data-rate') === rate()); });
    $$('[data-range-mode]').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-range-mode') === rm); });
    $('[data-range-mode="line"]').hidden = m !== 'cashflow';
    $('#range-total').hidden = rm !== 'total';
    $('#range-line-note').hidden = rm !== 'line';
    $('#range-report-opt').hidden = rm === 'none';
  }

  function renderCashflow() {
    if (state.cost.mode !== 'cashflow') return;
    syncLinked();
    var N = years(), lineRange = rangeMode() === 'line';
    var head = '<tr><th class="lbl">Line item</th><th>Type</th>';
    for (var t = 0; t <= N; t++) head += '<th class="num">' + (t === 0 ? 'Year 0<br><span>set-up</span>' : 'Year ' + t) + '</th>';
    head += '<th class="num">Total</th>' + (lineRange ? '<th class="num">Range<br><span>− % / + %</span></th>' : '') + '<th></th></tr>';

    var body = state.cashflow.lines.map(function (l, i) {
      var linked = !!l.benefitId;
      var cells = '';
      if (linked) {
        cells += '<td class="lbl"><div class="bcb-cf-linked" title="From step 4 (Benefits)">↳ ' + esc(lineLabel(l)) + '</div>' +
          '<select class="ft-select bcb-cf-ramp" data-cf="' + i + '" data-key="ramp" aria-label="Phasing">' +
          Object.keys(RAMPS).map(function (k) { return '<option value="' + k + '"' + (k === l.ramp ? ' selected' : '') + '>' + esc(RAMPS[k].label) + '</option>'; }).join('') + '</select></td>' +
          '<td><span class="bcb-cf-type benefit">Benefit</span></td>';
      } else {
        var tv = l.kind === 'benefit' ? 'benefit' : (l.category === 'running' ? 'cost-running' : 'cost-oneoff');
        cells += '<td class="lbl"><input class="ft-input" data-cf="' + i + '" data-key="label" value="' + esc(l.label) + '" placeholder="' + (l.kind === 'cost' ? 'e.g. External consultants' : 'e.g. Licence savings') + '" aria-label="Line item name" />' +
          (filled(l.hint) ? '<div class="bcb-cf-tip">' + esc(l.hint) + '</div>' : '') + '</td>' +
          '<td><select class="ft-select" data-cf="' + i + '" data-key="type" aria-label="Type">' +
          '<option value="cost-oneoff"' + (tv === 'cost-oneoff' ? ' selected' : '') + '>Cost (one-off)</option>' +
          '<option value="cost-running"' + (tv === 'cost-running' ? ' selected' : '') + '>Cost (running)</option>' +
          '<option value="benefit"' + (tv === 'benefit' ? ' selected' : '') + '>Benefit</option></select></td>';
      }
      var a = lineAmounts(l);
      for (var t = 0; t <= N; t++) {
        if (linked && l.ramp !== 'custom') cells += '<td class="num ro">' + num(a[t]) + '</td>';
        else cells += '<td class="num"><input class="ft-input num" inputmode="decimal" data-cf="' + i + '" data-key="amount" data-year="' + t + '" value="' + (l.amounts[t] == null ? '' : esc(l.amounts[t])) + '" aria-label="' + esc(lineLabel(l)) + ', year ' + t + '" /></td>';
      }
      cells += '<td class="num tot" data-cf-total="' + i + '">' + num(sum(a)) + '</td>';
      if (lineRange) {
        cells += '<td class="num rng"><div class="rngw"><input class="ft-input num" inputmode="decimal" data-cf="' + i + '" data-key="low" value="' + esc(l.low) + '" aria-label="Range low %" /><input class="ft-input num" inputmode="decimal" data-cf="' + i + '" data-key="high" value="' + esc(l.high) + '" aria-label="Range high %" /></div></td>';
      }
      cells += '<td>' + (linked ? '<span class="bcb-cf-hint" title="Edit or remove this benefit in step 4">step 4</span>' : '<button type="button" class="ft-btn ft-btn-danger" data-cf-del="' + i + '" aria-label="Remove line">✕</button>') + '</td>';
      return '<tr class="' + (l.kind === 'cost' ? 'is-cost' : 'is-benefit') + '">' + cells + '</tr>';
    }).join('');
    if (!state.cashflow.lines.length) body = '<tr><td colspan="' + (N + 5) + '" class="bcb-cf-empty">No lines yet. Add cost and benefit lines below.</td></tr>';

    $('#bcb-cf').innerHTML = '<thead>' + head + '</thead><tbody>' + body + '</tbody><tfoot id="bcb-cf-foot"></tfoot>';
    renderCfFoot(figures());
  }

  function renderCfFoot(f) {
    var foot = $('#bcb-cf-foot');
    if (!foot) return;
    var N = f.years, b = f.base, extra = rangeMode() === 'line' ? 1 : 0;
    function row(label, arr, cls) {
      var h = '<tr class="' + (cls || '') + '"><td class="lbl" colspan="2">' + label + '</td>';
      for (var t = 0; t <= N; t++) h += '<td class="num' + (arr[t] < 0 ? ' neg' : '') + '">' + num(arr[t]) + '</td>';
      h += '<td class="num">' + (cls === 'cum' ? '' : num(sum(arr))) + '</td>' + (extra ? '<td></td>' : '') + '<td></td></tr>';
      return h;
    }
    var h = row('Total costs', b.costs) + row('Total benefits', b.bens) + row('Net cash flow', b.net, 'net') + row('Cumulative', b.cum, 'cum');
    if (f.rate > 0) h += row('Discounted net (' + f.rate + ' %)', b.dnet, 'disc');
    foot.innerHTML = h;
    state.cashflow.lines.forEach(function (l, i) {
      var cell = $('[data-cf-total="' + i + '"]');
      if (cell) cell.textContent = num(sum(lineAmounts(l)));
    });
  }

  function fillInputs() {
    $$('[data-bind]').forEach(function (el) {
      var v = getPath(state, el.getAttribute('data-bind'));
      if (el.type === 'checkbox') el.checked = !!v;
      else el.value = v == null ? '' : v;
    });
  }

  function renderPreview() {
    var p = state, f = figures(), sc = score();
    var date = new Date(p.updatedAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    var meta = [p.author, p.department, CASE_TYPES[p.caseType] ? CASE_TYPES[p.caseType].label : '', date].filter(Boolean).map(esc).join(' · ');
    var none = '<span class="muted">Not provided</span>';
    function para(t) { return filled(t) ? '<p>' + esc(t.trim()) + '</p>' : '<p>' + none + '</p>'; }
    var benefits = p.benefits.filter(function (b) { return filled(b.description) || numOrNull(b.annualAmount) > 0; });
    var risks = p.risks.filter(function (r) { return filled(r.description); });
    var objective = filled(p.strategy.objective)
      ? '<p><b>' + esc(p.strategy.objective) + '</b> · ' + ({ direct: 'Direct contribution', indirect: 'Indirect contribution', none: 'No direct link' }[p.strategy.contribution] || '') + '</p>' + (filled(p.strategy.rationale) ? '<p>' + esc(p.strategy.rationale) + '</p>' : '')
      : '<p>' + none + '</p>';
    var dur = numOrNull(p.resources.durationMonths);
    var b = f.base;
    var fin;
    if (b.empty) fin = '<p>' + none + '</p>';
    else if (f.rangeInReport) fin = finTableHtml(f, false, true) +'<p class="bcb-doc-small">' + esc(rangeSummary()) + '</p>';
    else fin = '<div class="bcb-doc-fin">' +
      '<div><span>One-off cost (Year 0)' + (f.isSizeEstimate ? ', size ' + esc(p.cost.size) : '') + '</span><b>' + money(f.oneOff || 0) + '</b></div>' +
      '<div><span>Total cost (' + f.years + ' yrs)</span><b>' + money(b.totalCost) + '</b></div>' +
      '<div><span>Total benefit (' + f.years + ' yrs)</span><b>' + money(b.totalBenefit) + '</b></div>' +
      '<div><span>NPV @ ' + f.rate + ' %</span><b>' + money(b.npv) + '</b></div>' +
      '<div><span>IRR</span><b>' + pct(b.irr) + '</b></div>' +
      '<div><span>Payback</span><b>' + esc(paybackText(b, true, f.years)) + '</b></div>' +
      '<div><span>ROI (' + f.years + ' yrs)</span><b>' + pct(b.roi) + '</b></div></div>';

    $('#bcb-doc').innerHTML =
      '<div class="bcb-doc-head"><div><h3>' + (filled(p.title) ? esc(p.title) : '<span class="muted">Untitled proposal</span>') + '</h3><div class="bcb-doc-meta">' + (meta || 'Business case') + '</div></div>' +
        '<div class="bcb-doc-score">Readiness<b>' + sc.total + '/100</b>' + esc(sc.band.label) + '</div></div>' +
      '<div class="bcb-doc-decision"><b>Decision requested:</b> ' + (filled(p.resources.decision) ? esc(p.resources.decision) : '<span class="muted">Not provided</span>') + '</div>' +
      '<div class="bcb-doc-cols"><div>' +
        '<h4>Problem</h4>' + para(p.problem.statement) +
        (filled(p.problem.affected) ? '<p style="margin-top:4px"><b>Affected:</b> ' + esc(p.problem.affected) + '</p>' : '') +
        (f.inactionYear ? '<p style="margin-top:4px"><b>Cost of doing nothing:</b> ' + money(f.inactionYear) + ' per year</p>' : '') +
        '<h4>Proposed solution</h4>' + para(p.solution.summary) +
        ((filled(p.solution.inScope) || filled(p.solution.outOfScope)) ? '<p style="margin-top:4px"><b>In scope:</b> ' + (esc(p.solution.inScope) || '–') + '</p><p><b>Out of scope:</b> ' + (esc(p.solution.outOfScope) || '–') + '</p>' : '') +
        '<h4>Alternatives considered</h4>' + para(p.solution.alternatives) +
      '</div><div>' +
        '<h4>Strategic fit</h4>' + objective +
        '<h4>Financial summary (' + esc(p.currency) + ', ' + f.years + ' years)</h4>' + fin +
        '<h4>Benefits</h4>' + (benefits.length ? '<ul>' + benefits.map(function (bn) {
          return '<li><b>' + esc(bn.type) + '</b>' + (numOrNull(bn.annualAmount) > 0 ? ' · ' + money(numOrNull(bn.annualAmount)) + '/yr' : '') + ' · ' + esc(bn.confidence) + ' confidence' + (filled(bn.description) ? '<br>' + esc(bn.description) : '') + '</li>';
        }).join('') + '</ul>' : '<p>' + none + '</p>') +
      '</div></div>' +
      '<h4>Key risks</h4>' + (risks.length ? '<table><thead><tr><th>Risk</th><th>Likelihood</th><th>Impact</th><th>Mitigation</th></tr></thead><tbody>' + risks.map(function (r) {
        return '<tr><td>' + esc(r.description) + '</td><td>' + esc(r.likelihood) + '</td><td>' + esc(r.impact) + '</td><td>' + (esc(r.mitigation) || '–') + '</td></tr>';
      }).join('') + '</tbody></table>' : '<p>' + none + '</p>') +
      '<h4>Resources & timeline</h4>' +
        '<p>' + (filled(p.resources.roles) ? esc(p.resources.roles) : none) + '</p>' +
        ((filled(p.resources.effort) || dur || filled(p.resources.start)) ? '<p style="margin-top:4px">' + [filled(p.resources.effort) ? '<b>Effort:</b> ' + esc(p.resources.effort) : '', dur ? '<b>Duration:</b> ' + dur + ' months' : '', filled(p.resources.start) ? '<b>Start:</b> ' + esc(p.resources.start) : ''].filter(Boolean).join(' · ') + '</p>' : '') +
        (filled(p.resources.milestones) ? '<p style="margin-top:4px"><b>Milestones:</b> ' + esc(p.resources.milestones.split('\n').filter(Boolean).join(' · ')) + '</p>' : '') +
      '<div class="bcb-doc-foot"><span>Rough estimate · NPV at ' + f.rate + ' %, ' + f.years + ' years</span><span>Created with the free Business Case Builder · ppmcompass.com/free-tools</span></div>';

    var d2 = $('#bcb-doc2');
    d2.hidden = !(p.finance.appendix && !b.empty);
    if (!d2.hidden) d2.innerHTML = appendixHtml(f);
  }

  function appendixHtml(f) {
    var N = f.years, rows = cashRows(), b = f.base, lineRange = f.rangeMode === 'line' && f.rangeInReport;
    var head = '<tr><th>Line item</th><th>Type</th>' + (lineRange ? '<th class="num">Range</th>' : '');
    for (var t = 0; t <= N; t++) head += '<th class="num">Y' + t + '</th>';
    head += '<th class="num">Total</th></tr>';
    function tr(label, type, rng, arr, cls) {
      var h = '<tr class="' + (cls || '') + '"><td>' + esc(label) + '</td><td>' + esc(type) + '</td>' + (lineRange ? '<td class="num">' + esc(rng) + '</td>' : '');
      for (var t = 0; t <= N; t++) h += '<td class="num">' + num(arr[t]) + '</td>';
      return h + '<td class="num">' + (cls === 'cum' ? '' : num(sum(arr))) + '</td></tr>';
    }
    var body = rows.map(function (r) { return tr(r.label, r.type, signedPct(r.low) + ' / ' + signedPct(r.high), r.values); }).join('') +
      tr('Total costs', '', '', b.costs, 'sum') + tr('Total benefits', '', '', b.bens, 'sum') + tr('Net cash flow', '', '', b.net, 'sum') + tr('Cumulative', '', '', b.cum, 'cum') +
      (f.rate > 0 ? tr('Discounted net (' + f.rate + ' %)', '', '', b.dnet, 'sum') : '');
    return '<div class="bcb-doc-head"><div><h3 style="font-size:16px">Financial appendix</h3><div class="bcb-doc-meta">' + esc(state.title || 'Business case') + ' · page 2</div></div></div>' +
      '<p class="bcb-doc-small" style="margin-top:10px">' + esc(assumptionsText(f, f.rangeInReport)) + '</p>' +
      '<h4>Year-by-year cash flow (' + esc(state.currency) + ')</h4><div class="bcb-doc-scroll"><table>' + '<thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>' +
      '<h4>Key figures</h4>' + finTableHtml(f.rangeInReport ? f : Object.assign({}, f, { rangeOn: false }), true) +
      cumChartSvg(f.rangeInReport ? f : Object.assign({}, f, { rangeOn: false }));
  }

  function assumptionsText(f, withRange) {
    var parts = ['Analysis period: ' + f.years + ' years plus set-up (Year 0)', 'Discount rate: ' + f.rate + ' %', 'Currency: ' + state.currency];
    if (withRange && f.rangeOn) parts.push(rangeSummary(true) + '. Downside = higher costs and lower benefits; upside = the reverse');
    return parts.join(' · ');
  }

  function renderAll() {
    renderSteps();
    renderHead();
    if (current === COST_STEP) { renderCostMode(); renderCashflow(); }
    renderScore();
    renderFigures();
    renderHints();
    if (STEPS[current].id === 'review') renderPreview();
  }

  function go(i) {
    if (i < 0 || i >= STEPS.length) return;
    current = i;
    renderAll();
    if (STEPS[i].id === 'review') track('bcb_review_opened');
    var top = $('#builder');
    if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------------- Events ---------------- */
  function onInput(e) {
    var el = e.target;
    var path = el.getAttribute('data-bind');
    if (path) {
      var val = el.type === 'checkbox' ? el.checked : (el.getAttribute('data-num') !== null ? numOrNull(el.value) : el.value);
      setPath(state, path, val);
      if (path === 'currency') { renderBenefits(); renderCostMode(); renderCashflow(); }
      if (path === 'finance.discountRate') renderCostMode();
      if (path === 'caseType') { renderSuggestions(); track('bcb_case_type_' + (state.caseType || 'none')); }
      changed();
      return;
    }
    var bi = el.getAttribute('data-benefit');
    if (bi !== null) {
      var bk = el.getAttribute('data-key');
      state.benefits[+bi][bk] = bk === 'annualAmount' ? numOrNull(el.value) : el.value;
      changed();
      return;
    }
    var ri = el.getAttribute('data-risk');
    if (ri !== null) {
      state.risks[+ri][el.getAttribute('data-key')] = el.value;
      changed();
      return;
    }
    var ci = el.getAttribute('data-cf');
    if (ci !== null) {
      var l = state.cashflow.lines[+ci], k = el.getAttribute('data-key');
      if (!l) return;
      if (k === 'amount') {
        var yr = +el.getAttribute('data-year'), val = numOrNull(el.value);
        l.amounts[yr] = val;
        // Recurring lines: a year-1 amount is copied into later years that are still empty.
        var recurring = (l.kind === 'cost' && l.category === 'running') || (l.kind === 'benefit' && !l.benefitId);
        if (e.type === 'change' && recurring && yr === 1 && val !== null) {
          var later = l.amounts.slice(2, years() + 1);
          if (later.every(function (v) { return v === null || v === undefined || v === ''; })) {
            for (var y2 = 2; y2 <= years(); y2++) l.amounts[y2] = val;
            renderCashflow();
          }
        }
      }
      else if (k === 'label') l.label = el.value;
      else if (k === 'low' || k === 'high') l[k] = numOrNull(el.value);
      else if (k === 'type' && e.type === 'change') {
        if (el.value === 'benefit') { l.kind = 'benefit'; l.category = ''; }
        else { l.kind = 'cost'; l.category = el.value === 'cost-running' ? 'running' : 'one-off'; }
        renderCashflow();
      } else if (k === 'ramp' && e.type === 'change') {
        if (el.value === 'custom' && l.ramp !== 'custom') {
          var a = lineAmounts(l);
          l.amounts = [0, 1, 2, 3, 4, 5].map(function (t) { return t < a.length ? a[t] : null; });
        }
        l.ramp = el.value;
        renderCashflow();
      }
      changed();
    }
  }

  var startedTracked = false;
  function changed() {
    if (!startedTracked) { startedTracked = true; track('bcb_started'); }
    scheduleSave();
    renderSuggestions();
    renderSteps();
    renderScore();
    renderFigures();
    renderHints();
  }

  // Start a cash flow from what the user already entered in the quick/detailed modes.
  function seedCashflow() {
    var c = state.cost, N = years(), lines = [];
    function oneOffLine(label, v) { var l = newLine('cost', { label: label, category: 'one-off' }); l.amounts[0] = v; lines.push(l); }
    if (c.mode === 'detailed' || (numOrNull(c.internalDays) && numOrNull(c.dayRate))) {
      var internal = (numOrNull(c.internalDays) || 0) * (numOrNull(c.dayRate) || 0);
      if (internal) oneOffLine('Internal effort', internal);
      if (numOrNull(c.external)) oneOffLine('External services', numOrNull(c.external));
      if (numOrNull(c.oneOff)) oneOffLine('Licences & other one-off', numOrNull(c.oneOff));
    }
    if (!lines.length) {
      var o = numOrNull(c.estimate) !== null ? numOrNull(c.estimate) : (SIZES[c.size] ? SIZES[c.size].mid : null);
      if (o !== null) oneOffLine('One-off investment', o);
    }
    if (numOrNull(c.annualRun)) {
      var run = newLine('cost', { label: 'Running costs (licences, support)', category: 'running' });
      for (var t = 1; t <= MAX_YEARS; t++) run.amounts[t] = numOrNull(c.annualRun);
      lines.push(run);
    }
    state.cashflow.lines = lines;
    // Nothing entered yet: start from the typical cost lines of the chosen business case type.
    var ct = CASE_TYPES[state.caseType];
    if (!lines.length && ct) {
      ct.costs.forEach(addSuggestedCost);
      toast('Added typical cost lines for ' + ct.label + '. Fill in your amounts.');
    } else if (!lines.length) {
      state.cashflow.lines.push(newLine('cost', { label: 'One-off investment', category: 'one-off' }));
      state.cashflow.lines.push(newLine('cost', { label: 'Running costs', category: 'running' }));
    }
    syncLinked();
    state.finance.appendix = true;
    fillInputs();
  }

  function onClick(e) {
    var t = e.target.closest('button');
    if (!t) return;
    var g = t.getAttribute('data-goto');
    if (g !== null) { go(+g); return; }
    if (t.id === 'bcb-next') { track('bcb_step_completed_' + (current + 1)); go(current + 1); return; }
    if (t.id === 'bcb-prev') { go(current - 1); return; }

    if (t.hasAttribute('data-cost-mode')) {
      var m = t.getAttribute('data-cost-mode');
      if (m === 'cashflow' && !state.cashflow.lines.length) seedCashflow();
      state.cost.mode = m;
      if (m === 'cashflow') track('bcb_cashflow_mode');
      renderCostMode(); renderCashflow(); changed(); return;
    }
    if (t.hasAttribute('data-size')) { state.cost.size = t.getAttribute('data-size'); renderCostMode(); changed(); return; }
    if (t.hasAttribute('data-years')) { state.finance.years = +t.getAttribute('data-years'); renderCostMode(); renderCashflow(); changed(); return; }
    if (t.hasAttribute('data-rate')) { state.finance.discountRate = +t.getAttribute('data-rate'); fillInputs(); renderCostMode(); changed(); return; }
    if (t.hasAttribute('data-range-mode')) {
      state.range.mode = t.getAttribute('data-range-mode');
      if (state.range.mode !== 'none') track('bcb_range_' + state.range.mode);
      renderCostMode(); renderCashflow(); changed(); return;
    }
    if (t.id === 'add-cf-cost' || t.id === 'add-cf-benefit') {
      state.cashflow.lines.push(newLine(t.id === 'add-cf-cost' ? 'cost' : 'benefit'));
      renderCashflow(); changed();
      var inputs = $$('#bcb-cf [data-key="label"]'); if (inputs.length) inputs[inputs.length - 1].focus();
      return;
    }
    if (t.hasAttribute('data-cf-del')) { state.cashflow.lines.splice(+t.getAttribute('data-cf-del'), 1); renderCashflow(); changed(); return; }
    if (t.hasAttribute('data-contrib')) {
      state.strategy.contribution = t.getAttribute('data-contrib');
      $$('[data-contrib]').forEach(function (b) { b.classList.toggle('is-on', b === t); });
      changed(); return;
    }
    if (t.hasAttribute('data-objective')) {
      state.strategy.objective = t.getAttribute('data-objective');
      $('#f-objective').value = state.strategy.objective;
      changed(); return;
    }
    if (t.id === 'add-benefit') {
      state.benefits.push({ id: uid('b'), type: BENEFIT_TYPES[0], description: '', annualAmount: null, confidence: 'Medium' });
      renderBenefits(); changed();
      var last = $$('[data-benefit][data-key="description"]').pop(); if (last) last.focus();
      return;
    }
    if (t.hasAttribute('data-del-benefit')) { state.benefits.splice(+t.getAttribute('data-del-benefit'), 1); renderBenefits(); changed(); return; }
    if (t.id === 'add-risk' || t.hasAttribute('data-risk-suggest')) {
      state.risks.push({ description: t.getAttribute('data-risk-suggest') || '', likelihood: 'Medium', impact: 'Medium', mitigation: '' });
      renderRisks(); changed();
      var lr = t.id === 'add-risk' ? $$('[data-risk][data-key="description"]').pop() : $$('[data-risk][data-key="mitigation"]').pop();
      if (lr) lr.focus();
      return;
    }
    if (t.hasAttribute('data-del-risk')) { state.risks.splice(+t.getAttribute('data-del-risk'), 1); renderRisks(); changed(); return; }

    if (t.hasAttribute('data-custom-calc')) { openCustomCalc(); return; }
    if (t.hasAttribute('data-sug-benefit') || t.hasAttribute('data-sug-cost') || t.hasAttribute('data-sug-all')) {
      var ct = CASE_TYPES[state.caseType];
      if (!ct) return;
      if (t.hasAttribute('data-sug-benefit')) addSuggestedBenefit(ct.benefits[+t.getAttribute('data-sug-benefit')]);
      else if (t.hasAttribute('data-sug-cost')) addSuggestedCost(ct.costs[+t.getAttribute('data-sug-cost')]);
      else {
        ct.benefits.forEach(addSuggestedBenefit);
        if (t.getAttribute('data-sug-all') === 'costs') ct.costs.forEach(addSuggestedCost);
        track('bcb_suggestions_all_' + t.getAttribute('data-sug-all'));
      }
      afterSuggestion();
      return;
    }
    if (t.id === 'bcb-pdf') { downloadPdf(t); return; }
    if (t.id === 'bcb-json') { downloadJson(); return; }
    if (t.id === 'bcb-csv') { downloadCsv(); return; }
    if (t.id === 'bcb-import') { $('#bcb-file').click(); return; }
    if (t.id === 'bcb-example' || t.id === 'hero-example') { loadExample(); return; }
    if (t.id === 'bcb-reset') {
      if (window.confirm('Start a new business case? Your current draft in this browser will be cleared. Download the .json first if you want to keep it.')) {
        state = emptyProposal(); save(); refreshAll(); go(0); toast('Started a new business case');
      }
      return;
    }
  }

  // Opens the site's contact form, pre-filled with a requirements checklist.
  // Only the calculator settings are added (no figures or proposal text); the user can edit everything before sending.
  function openCustomCalc() {
    track('bcb_custom_calc_opened');
    if (typeof window.openContactModal !== 'function') {
      location.href = 'mailto:contact@ppmcompass.com?subject=' + encodeURIComponent('Custom business case calculator');
      return;
    }
    window.openContactModal('Free Tools - Custom business case calculator', 'general');
    var title = $('#modal-title'), sub = $('#modal-subtitle'), btn = $('#modal-submit-btn');
    var subject = $('#form-subject'), msg = $('#lead-form textarea[name="message"]');
    if (title) title.textContent = 'Request a custom calculator';
    if (sub) sub.textContent = 'Tell us what your calculator needs to do. Only what you type in this form is sent; your business case stays in your browser.';
    if (btn) btn.innerHTML = 'Send requirements →';
    if (subject) subject.value = 'Free Tools: custom business case calculator request';
    var status = $('#form-status');
    if (status) status.textContent = '🔒 We reply within 1–2 working days with questions or a proposal. No spam.';
    if (msg && !msg.value.trim()) {
      var modeLabel = { quick: 'Quick size estimate', detailed: 'Cost blocks', cashflow: 'Year-by-year cash flow' }[state.cost.mode];
      var rangeLabel = { none: 'no range', total: 'range for the whole case', line: 'range per line item' }[rangeMode()];
      msg.value = 'We would like a customised business case calculator.\n\n' +
        'Our requirements (please edit):\n' +
        '- Calculations and KPIs (e.g. NPV, TCO, our hurdle rate):\n' +
        '- Our own cost and benefit categories:\n' +
        '- Approval rules or thresholds:\n' +
        '- Report / PDF template and branding:\n' +
        '- Where it should run (website, Microsoft 365 / SharePoint, Excel):\n' +
        '- Number of users and timeline:\n\n' +
        'Current setup in the free builder: ' + modeLabel + ', ' + years() + ' years, ' + rate() + ' % discount rate, ' + rangeLabel + ', ' + state.currency + '.';
      msg.rows = 9;
    }
  }

  /* ---------------- Suggested lines per business case type ---------------- */
  function norm(s) { return str(s).trim().toLowerCase(); }
  function hasCostLine(label) { return state.cashflow.lines.some(function (l) { return !l.benefitId && norm(l.label) === norm(label); }); }
  function hasBenefit(desc) { return state.benefits.some(function (b) { return norm(b.description) === norm(desc); }); }

  function caseTypeOptions() {
    return '<option value="">Choose a type…</option>' + Object.keys(CASE_TYPES).map(function (k) {
      return '<option value="' + k + '"' + (k === state.caseType ? ' selected' : '') + '>' + esc(CASE_TYPES[k].label) + '</option>';
    }).join('');
  }

  function sugBlock(kind) {
    var ct = CASE_TYPES[state.caseType], isCost = kind === 'costs';
    var head = '<div class="bcb-sug-head"><label for="ct-' + kind + '">' + (isCost ? 'Typical cost lines for' : 'Typical benefits for') + '</label>' +
      '<select id="ct-' + kind + '" class="ft-select" data-bind="caseType">' + caseTypeOptions() + '</select></div>';
    if (!ct) return head + '<p class="bcb-help" style="margin:0">Pick the type of business case to get typical ' + (isCost ? 'cost lines' : 'benefits') + ' you can add with one click.</p>';
    var items = isCost ? ct.costs : ct.benefits, open = 0;
    var chips = items.map(function (it, i) {
      var has = isCost ? hasCostLine(it[0]) : hasBenefit(it[2]);
      if (!has) open++;
      var text = isCost ? it[0] + (it[1] === 'running' ? ' (yearly)' : '') : it[1];
      return '<button type="button" class="bcb-chip' + (has ? ' is-added' : '') + '"' + (has ? ' disabled' : '') + ' data-sug-' + (isCost ? 'cost' : 'benefit') + '="' + i + '" title="' + esc(isCost ? it[2] : it[2]) + '">' + (has ? '✓ ' : '+ ') + esc(text) + '</button>';
    }).join('');
    var benefitsOpen = isCost ? ct.benefits.filter(function (b) { return !hasBenefit(b[2]); }).length : 0;
    var allLabel = isCost
      ? 'Add all suggested lines' + (benefitsOpen ? ' (incl. ' + benefitsOpen + ' benefits)' : '')
      : 'Add all ' + open + ' suggested benefits';
    var showAll = isCost ? (open + benefitsOpen > 0) : open > 0;
    return head + '<div class="bcb-chips" style="margin:8px 0">' + chips + '</div>' +
      (showAll ? '<button type="button" class="ft-btn ft-btn-ghost" data-sug-all="' + kind + '">' + esc(allLabel) + '</button>' : '') +
      '<p class="bcb-help" style="margin:6px 0 0">Suggestions add the line with a blank amount' + (isCost ? ' and an estimating tip' : '') + '. Fill in your own figures.</p>';
  }

  function renderSuggestions() {
    var sb = $('#sug-benefits'), sc = $('#sug-costs');
    if (sb) sb.innerHTML = sugBlock('benefits');
    if (sc) sc.innerHTML = sugBlock('costs');
    $$('select[data-bind="caseType"]').forEach(function (s) { s.value = state.caseType || ''; });
  }

  function addSuggestedBenefit(b) {
    if (hasBenefit(b[2])) return;
    state.benefits.push({ id: uid('b'), type: b[0], description: b[2], annualAmount: null, confidence: 'Medium' });
  }
  function addSuggestedCost(c) {
    if (hasCostLine(c[0])) return;
    state.cashflow.lines.push(newLine('cost', { label: c[0], category: c[1], hint: c[2] }));
  }
  function afterSuggestion() {
    renderBenefits();
    if (state.cost.mode === 'cashflow') renderCashflow();
    renderSuggestions();
    changed();
  }

  function refreshAll() {
    fillInputs();
    $$('[data-contrib]').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-contrib') === state.strategy.contribution); });
    renderBenefits();
    renderRisks();
    renderCostMode();
    renderCashflow();
    renderSuggestions();
    renderAll();
  }

  /* ---------------- Import / export ---------------- */
  function exportObject() {
    var f = figures(), sc = score();
    var out = JSON.parse(JSON.stringify(state));
    out.schema = SCHEMA;
    out.version = SCHEMA_VERSION;
    function m(x) {
      return x ? {
        totalCost: Math.round(x.totalCost), totalBenefit: Math.round(x.totalBenefit),
        npv: x.npv === null ? null : Math.round(x.npv),
        irr: x.irr === null ? null : Math.round(x.irr * 1000) / 1000,
        paybackMonths: x.payback === null ? null : Math.round(x.payback * 10) / 10,
        roi: x.roi === null ? null : Math.round(x.roi * 1000) / 1000,
        costsByYear: x.costs.map(Math.round), benefitsByYear: x.bens.map(Math.round)
      } : null;
    }
    out.computed = {
      years: f.years, discountRate: f.rate, oneOffCost: f.oneOff, readinessScore: sc.total,
      base: m(f.base), downside: m(f.down), upside: m(f.up)
    };
    out.generator = 'ppmcompass.com/free-tools/business-case-builder';
    return out;
  }

  function downloadBlob(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function downloadJson() {
    downloadBlob(new Blob([JSON.stringify(exportObject(), null, 2)], { type: 'application/json' }), slug(state.title) + '.proposal.json');
    track('bcb_downloaded_json');
    toast('Saved .json. Load it here any time to keep editing.');
  }

  function downloadCsv() {
    var f = figures(), N = f.years, rows = cashRows(), b = f.base, lineRange = f.rangeMode === 'line';
    function q(v) { v = v === null || v === undefined ? '' : String(v); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
    function r2(n) { return n === null || n === undefined || !isFinite(n) ? '' : Math.round(n * 100) / 100; }
    var out = [];
    out.push(['Business case', state.title || 'Untitled proposal']);
    out.push(['Currency', state.currency]);
    out.push(['Analysis period (years)', N]);
    out.push(['Discount rate (%)', f.rate]);
    if (f.rangeOn) out.push(['Range', rangeSummary()]);
    out.push([]);
    var head = ['Line item', 'Type'];
    if (lineRange) head.push('Range low %', 'Range high %');
    for (var t = 0; t <= N; t++) head.push('Year ' + t);
    head.push('Total');
    out.push(head);
    function line(label, type, arr, lo, hi) {
      var r = [label, type]; if (lineRange) r.push(lo === undefined ? '' : lo, hi === undefined ? '' : hi);
      for (var t = 0; t <= N; t++) r.push(r2(arr[t]));
      r.push(type === 'cumulative' ? '' : r2(sum(arr)));
      return r;
    }
    rows.forEach(function (r) { out.push(line(r.label, r.type, r.values, r.low, r.high)); });
    out.push(line('Total costs', 'total', b.costs));
    out.push(line('Total benefits', 'total', b.bens));
    out.push(line('Net cash flow', 'total', b.net));
    out.push(line('Cumulative', 'cumulative', b.cum));
    out.push(line('Discounted net', 'total', b.dnet));
    out.push([]);
    var cols = f.rangeOn ? [['Downside', f.down], ['Base', f.base], ['Upside', f.up]] : [['Base', f.base]];
    out.push(['Key figures'].concat(cols.map(function (c) { return c[0]; })));
    [['Total cost', 'totalCost'], ['Total benefit', 'totalBenefit'], ['NPV', 'npv']].forEach(function (k) {
      out.push([k[0]].concat(cols.map(function (c) { return r2(c[1][k[1]]); })));
    });
    out.push(['IRR (%)'].concat(cols.map(function (c) { return c[1].irr === null ? '' : r2(c[1].irr * 100); })));
    out.push(['Payback (months)'].concat(cols.map(function (c) { return c[1].payback === null ? '' : r2(c[1].payback); })));
    out.push(['ROI (%)'].concat(cols.map(function (c) { return c[1].roi === null ? '' : r2(c[1].roi * 100); })));
    var csv = 'sep=,\r\n' + out.map(function (r) { return r.map(q).join(','); }).join('\r\n');
    downloadBlob(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }), slug(state.title) + '.cash-flow.csv');
    track('bcb_downloaded_csv');
    toast('Cash flow downloaded (.csv)');
  }

  function importFile(file) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast('That file is too large for a proposal (.json, max 2 MB).'); return; }
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var obj = JSON.parse(reader.result);
        if (obj.schema && obj.schema !== SCHEMA) throw new Error('schema');
        var n = normalize(obj);
        if (!n) throw new Error('empty');
        state = n; save(); refreshAll(); go(0);
        track('bcb_imported_json');
        toast('Loaded "' + (state.title || 'proposal') + '"');
      } catch (e) {
        toast('This file is not a Business Case Builder .json file.');
      }
    };
    reader.readAsText(file);
  }

  function loadExample() {
    if (hasContent() && !window.confirm('Replace your current draft with the example? Download the .json first if you want to keep it.')) return;
    state = normalize({
      title: 'Central project portfolio reporting in Microsoft 365',
      author: 'Alex Morgan, Head of PMO',
      department: 'Operations',
      caseType: 'software',
      currency: state.currency || 'EUR',
      problem: {
        statement: 'Project status is collected every month from 27 project managers through email and Excel templates. The PMO spends about 6 working days per month merging files, and leadership sees a portfolio picture that is 3–4 weeks old. Two budget overruns last year were spotted only at quarter-end.',
        affected: 'PMO (3 people), 27 project managers, executive board',
        costOfInactionMonthly: 7500
      },
      solution: {
        summary: 'Introduce one shared portfolio register in our existing Microsoft 365 tenant with standard status, milestone, risk and budget fields, plus a monthly portfolio dashboard for the board.',
        inScope: 'All projects above 50k budget, monthly status, milestones, top risks, budget vs. actuals',
        outOfScope: 'Time tracking, resource scheduling, ERP integration (phase 2)',
        alternatives: '1) Do nothing: keep Excel consolidation (6 PMO days/month). 2) Enterprise PPM suite: strong features but high per-seat cost and 6–9 month rollout. 3) Build our own Power Apps solution: needs scarce internal developers and premium licences.'
      },
      strategy: { objective: 'Operational efficiency', contribution: 'direct', rationale: 'Supports the 2027 goal to cut reporting overhead by 30% and to give the board monthly, reliable portfolio data.' },
      benefits: [
        { id: 'b_ex1', type: 'Productivity / time saved', description: 'PMO consolidation drops from 6 to 1 day per month; PMs save ~1 hour each per month', annualAmount: 52000, confidence: 'High' },
        { id: 'b_ex2', type: 'Cost avoidance', description: 'Earlier detection of budget overruns (assume 1 of 2 avoided per year)', annualAmount: 40000, confidence: 'Medium' },
        { id: 'b_ex3', type: 'Risk reduction', description: 'Consistent risk escalation across all projects', annualAmount: null, confidence: 'Medium' }
      ],
      cost: { mode: 'cashflow', size: 'M', estimate: null, internalDays: 60, dayRate: 650, external: 15000, oneOff: 4500, annualRun: 6000 },
      finance: { years: 5, discountRate: 8, appendix: true },
      range: { mode: 'line', costLow: -10, costHigh: 25, benefitLow: -30, benefitHigh: 10, showInReport: true },
      cashflow: {
        lines: [
          { id: 'l_ex1', kind: 'cost', category: 'one-off', label: 'Internal effort (60 person-days)', amounts: [39000, 0, 0, 0, 0, 0], low: -10, high: 30 },
          { id: 'l_ex2', kind: 'cost', category: 'one-off', label: 'External setup and training', amounts: [15000, 0, 0, 0, 0, 0], low: -5, high: 15 },
          { id: 'l_ex3', kind: 'cost', category: 'one-off', label: 'Licences, first year', amounts: [4490, 0, 0, 0, 0, 0], low: 0, high: 0 },
          { id: 'l_ex4', kind: 'cost', category: 'running', label: 'Licences and support', amounts: [0, 6000, 6000, 6000, 6000, 6000], low: 0, high: 10 },
          { id: 'l_ex5', kind: 'benefit', benefitId: 'b_ex1', ramp: 'ramp50', low: -20, high: 10 },
          { id: 'l_ex6', kind: 'benefit', benefitId: 'b_ex2', ramp: 'delayed', low: -50, high: 25 },
          { id: 'l_ex7', kind: 'benefit', benefitId: 'b_ex3', ramp: 'flat', low: -25, high: 10 }
        ]
      },
      risks: [
        { description: 'Project managers keep using their own Excel files', likelihood: 'Medium', impact: 'High', mitigation: 'Board only accepts status from the register from month 2; 30-minute onboarding per PM' },
        { description: 'Key PMO analyst unavailable during rollout', likelihood: 'Low', impact: 'Medium', mitigation: 'Name a backup and document the setup in week 1' },
        { description: 'Data quality of migrated projects is poor', likelihood: 'Medium', impact: 'Medium', mitigation: 'Migrate only active projects and clean data in a 2-week sprint' }
      ],
      resources: {
        roles: 'PMO lead (sponsor), 1 PMO analyst, M365 administrator, 2 pilot project managers',
        effort: 'about 60 person-days internally',
        durationMonths: 4,
        start: '2027-02',
        milestones: 'Pilot with 5 projects (month 1)\nAll projects migrated (month 3)\nFirst board report from the register (month 4)',
        decision: 'Approve 58,490 EUR one-off budget and 0.5 FTE PMO analyst for 4 months, starting February 2027.'
      }
    });
    save(); refreshAll(); go(STEPS.length - 1);
    track('bcb_example_loaded');
    toast('Example loaded. Edit any step or download the PDF.');
  }

  function hasContent() {
    return filled(state.title) || filled(state.problem.statement) || filled(state.solution.summary) || state.benefits.length > 0 || state.risks.length > 0;
  }

  /* ---------------- PDF ---------------- */
  function loadJsPdf() {
    if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = JSPDF_SRC;
      s.onload = function () { window.jspdf && window.jspdf.jsPDF ? resolve(window.jspdf.jsPDF) : reject(new Error('jsPDF missing')); };
      s.onerror = function () { reject(new Error('jsPDF failed to load')); };
      document.head.appendChild(s);
    });
  }

  // Standard PDF fonts only cover Windows-1252; map common typographic characters and drop the rest.
  function pdfText(s) {
    return str(s)
      .replace(/[→⇒]/g, '->').replace(/←/g, '<-')
      .replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/−/g, '-')
      .replace(/ | | /g, ' ')
      .replace(/✓|✔/g, 'v')
      .replace(/[^\x09\x0a\x0d\x20-\x7e -ÿ€‘’‚“”„†‡•…‰‹›ŒœŠšŸŽžƒˆ˜–—™]/g, '');
  }

  function buildPdf(JsPDF) {
    var p = state, f = figures(), sc = score(), b = f.base;
    var doc = new JsPDF({ unit: 'mm', format: 'a4' });
    var W = 210, M = 14, CW = W - 2 * M, y = M;
    var BLUE = [37, 99, 235], INK = [15, 23, 42], TXT = [51, 65, 85], MUTED = [100, 116, 139], LINE = [226, 232, 240];
    var GREEN = [5, 150, 105], RED = [220, 38, 38];
    var LH = 3.9; // line height for 8.6pt body text
    var FY = 287;

    function color(c) { doc.setTextColor(c[0], c[1], c[2]); }
    function font(style, size) { doc.setFont('helvetica', style); doc.setFontSize(size); }
    function lines(text, width, max) {
      var ls = doc.splitTextToSize(pdfText(text), width);
      if (max && ls.length > max) {
        ls = ls.slice(0, max);
        var last = ls[max - 1];
        while (last.length && doc.getTextWidth(last + '...') > width) last = last.slice(0, -1);
        ls[max - 1] = last.replace(/\s+$/, '') + '...';
      }
      return ls;
    }
    function para(text, x, yy, width, max) {
      font('normal', 8.6); color(TXT);
      if (!filled(text)) { font('italic', 8.6); color(MUTED); doc.text('Not provided', x, yy); return yy + LH; }
      var ls = lines(text.trim(), width, max);
      doc.text(ls, x, yy);
      return yy + ls.length * LH;
    }
    function label(text, x, yy) {
      font('bold', 7.4); color(BLUE);
      doc.text(pdfText(text).toUpperCase(), x, yy, { charSpace: 0.25 });
      return yy + 4.2;
    }
    function kv(k, v, x, yy, width) {
      font('bold', 8.6); color(INK);
      var kw = doc.getTextWidth(pdfText(k) + ' ');
      doc.text(pdfText(k), x, yy);
      font('normal', 8.6); color(TXT);
      var ls = lines(v, width - kw, 2);
      doc.text(ls[0] || '', x + kw, yy);
      if (ls[1]) { doc.text(ls[1], x, yy + LH); return yy + 2 * LH; }
      return yy + LH;
    }
    function footer(pageLabel) {
      doc.setDrawColor(LINE[0], LINE[1], LINE[2]); doc.setLineWidth(0.2); doc.line(M, FY - 4, W - M, FY - 4);
      font('normal', 7); color(MUTED);
      doc.text(pdfText(pageLabel), M, FY);
      color(BLUE);
      doc.textWithLink('Created with the free Business Case Builder - ppmcompass.com/free-tools', W - M, FY, { align: 'right', url: 'https://ppmcompass.com/free-tools/business-case-builder/' });
    }
    function pm(n) { return pdfText(money(n)); }
    function pc(n) { return pdfText(compact(n)); }

    // ---------- Page 1 ----------
    font('bold', 17); color(INK);
    var titleLines = lines(filled(p.title) ? p.title : 'Untitled proposal', CW - 34, 2);
    doc.text(titleLines, M, y + 6);
    y += 6 + (titleLines.length - 1) * 7;
    var date = new Date(p.updatedAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    font('normal', 8.4); color(MUTED);
    doc.text(lines([p.author, p.department, CASE_TYPES[p.caseType] ? CASE_TYPES[p.caseType].label : 'Business case', date].filter(Boolean).join('  |  '), CW - 34, 1), M, y + 5);
    doc.setDrawColor(LINE[0], LINE[1], LINE[2]); doc.setFillColor(248, 250, 252);
    doc.roundedRect(W - M - 30, M, 30, 17, 2, 2, 'FD');
    font('bold', 6.6); color(MUTED); doc.text('READINESS', W - M - 15, M + 4.6, { align: 'center' });
    font('bold', 14); color(sc.total >= 80 ? GREEN : (sc.total >= 50 ? [180, 83, 9] : RED));
    doc.text(sc.total + '/100', W - M - 15, M + 10.8, { align: 'center' });
    font('normal', 6.6); color(MUTED); doc.text(sc.band.label, W - M - 15, M + 14.8, { align: 'center' });
    y = Math.max(y + 9, M + 21);
    doc.setDrawColor(BLUE[0], BLUE[1], BLUE[2]); doc.setLineWidth(0.8); doc.line(M, y, W - M, y); doc.setLineWidth(0.2);
    y += 5;

    font(filled(p.resources.decision) ? 'bold' : 'italic', 8.8);
    var decLines = lines(filled(p.resources.decision) ? p.resources.decision : 'Not provided', CW - 10, 3);
    var decH = 6.5 + decLines.length * LH;
    doc.setFillColor(239, 246, 255); doc.rect(M, y, CW, decH, 'F');
    doc.setFillColor(BLUE[0], BLUE[1], BLUE[2]); doc.rect(M, y, 1.2, decH, 'F');
    font('bold', 7.4); color(BLUE); doc.text('DECISION REQUESTED', M + 5, y + 4.4, { charSpace: 0.25 });
    font(filled(p.resources.decision) ? 'bold' : 'italic', 8.8); color([30, 58, 138]);
    doc.text(decLines, M + 5, y + 8.6);
    y += decH + 6;

    var GAP = 7, LW = 100, RW = CW - LW - GAP, LX = M, RX = M + LW + GAP;
    var ly = y, ry = y;

    ly = label('Problem', LX, ly);
    ly = para(p.problem.statement, LX, ly, LW, 6);
    if (filled(p.problem.affected)) ly = kv('Affected:', p.problem.affected, LX, ly + 1, LW);
    if (f.inactionYear) ly = kv('Cost of doing nothing:', pm(f.inactionYear) + ' per year', LX, ly + (filled(p.problem.affected) ? 0 : 1), LW);
    ly += 3.5;
    ly = label('Proposed solution', LX, ly);
    ly = para(p.solution.summary, LX, ly, LW, 5);
    if (filled(p.solution.inScope)) ly = kv('In scope:', p.solution.inScope, LX, ly + 1, LW);
    if (filled(p.solution.outOfScope)) ly = kv('Out of scope:', p.solution.outOfScope, LX, ly + (filled(p.solution.inScope) ? 0 : 1), LW);
    ly += 3.5;
    ly = label('Alternatives considered', LX, ly);
    ly = para(p.solution.alternatives, LX, ly, LW, 5);

    ry = label('Strategic fit', RX, ry);
    if (filled(p.strategy.objective)) {
      font('bold', 8.8); color(INK);
      var objL = lines(p.strategy.objective, RW, 2); doc.text(objL, RX, ry); ry += objL.length * LH;
      font('normal', 7.8); color(MUTED);
      doc.text(({ direct: 'Direct contribution', indirect: 'Indirect contribution', none: 'No direct link' }[p.strategy.contribution] || ''), RX, ry); ry += LH;
      if (filled(p.strategy.rationale)) ry = para(p.strategy.rationale, RX, ry, RW, 3);
    } else { ry = para('', RX, ry, RW); }
    ry += 3.5;

    ry = label('Financials (' + p.currency + ', ' + f.years + ' years)', RX, ry);
    if (b.empty) { ry = para('', RX, ry, RW); ry += 2; }
    else if (f.rangeInReport) {
      var cw = 15.5, lx = RX + 2.5, cx0 = RX + RW - 2.5 - 2 * cw;
      var rowsR = [
        ['Total cost', function (m) { return pc(m.totalCost); }],
        ['Total benefit', function (m) { return pc(m.totalBenefit); }],
        ['NPV @ ' + f.rate + ' %', function (m) { return pc(m.npv); }],
        ['IRR', function (m) { return pdfText(pct(m.irr)); }],
        ['Payback', function (m) { return pdfText(paybackText(m, false, f.years)); }],
        ['ROI', function (m) { return pdfText(pct(m.roi)); }]
      ];
      var boxH = (rowsR.length + 1) * 4.7 + 3;
      doc.setFillColor(248, 250, 252); doc.setDrawColor(LINE[0], LINE[1], LINE[2]);
      doc.roundedRect(RX, ry - 3, RW, boxH, 1.5, 1.5, 'FD');
      font('bold', 6.6); color(MUTED);
      [['DOWNSIDE', 0], ['BASE', 1], ['UPSIDE', 2]].forEach(function (h) { doc.text(h[0], cx0 + h[1] * cw, ry + 1, { align: 'right' }); });
      rowsR.forEach(function (r, i) {
        var yy = ry + 1 + (i + 1) * 4.7;
        font('normal', 7.8); color(TXT); doc.text(pdfText(r[0]), lx, yy);
        [f.down, f.base, f.up].forEach(function (m, j) {
          font(j === 1 ? 'bold' : 'normal', 7.8); color(j === 1 ? INK : TXT);
          doc.text(r[1](m), cx0 + j * cw, yy, { align: 'right' });
        });
      });
      ry += boxH;
      font('italic', 6.6); color(MUTED);
      var rl = lines(rangeSummary(), RW, 2); doc.text(rl, RX, ry); ry += rl.length * 3 + 2;
    } else {
      var rows = [
        ['One-off cost (Year 0)' + (f.isSizeEstimate ? ', size ' + p.cost.size : ''), pm(f.oneOff || 0)],
        ['Total cost (' + f.years + ' yrs)', pm(b.totalCost)],
        ['Total benefit (' + f.years + ' yrs)', pm(b.totalBenefit)],
        ['NPV @ ' + f.rate + ' %', pm(b.npv)],
        ['IRR', pdfText(pct(b.irr))],
        ['Payback', pdfText(paybackText(b, true, f.years))],
        ['ROI (' + f.years + ' yrs)', pdfText(pct(b.roi))]
      ];
      var finH = rows.length * 4.8 + 3;
      doc.setFillColor(248, 250, 252); doc.setDrawColor(LINE[0], LINE[1], LINE[2]);
      doc.roundedRect(RX, ry - 3, RW, finH, 1.5, 1.5, 'FD');
      rows.forEach(function (r, i) {
        var yy = ry + 1.4 + i * 4.8;
        font('normal', 8.2); color(TXT); doc.text(r[0], RX + 3, yy);
        font('bold', 8.4); color(INK); doc.text(r[1], RX + RW - 3, yy, { align: 'right' });
      });
      ry += finH + 2.5;
    }

    ry = label('Benefits', RX, ry);
    var bens = p.benefits.filter(function (bn) { return filled(bn.description) || numOrNull(bn.annualAmount) > 0; });
    var maxB = f.rangeInReport ? 3 : 4;
    if (!bens.length) ry = para('', RX, ry, RW);
    bens.slice(0, maxB).forEach(function (bn) {
      font('bold', 8.2); color(INK);
      var head = bn.type + (numOrNull(bn.annualAmount) > 0 ? '  ' + pm(numOrNull(bn.annualAmount)) + '/yr' : '') + '  (' + bn.confidence + ')';
      doc.text(lines(head, RW - 3, 1), RX + 3, ry);
      doc.setFillColor(BLUE[0], BLUE[1], BLUE[2]); doc.circle(RX + 0.8, ry - 1.1, 0.6, 'F');
      ry += LH;
      if (filled(bn.description)) { font('normal', 8); color(TXT); var dl = lines(bn.description, RW - 3, 2); doc.text(dl, RX + 3, ry); ry += dl.length * 3.7; }
      ry += 1;
    });
    if (bens.length > maxB) { font('italic', 7.6); color(MUTED); doc.text('+ ' + (bens.length - maxB) + ' more in the .json file', RX + 3, ry); ry += LH; }

    y = Math.max(ly, ry) + 4;

    y = label('Key risks', M, y);
    var risks = p.risks.filter(function (r) { return filled(r.description); });
    if (!risks.length) { y = para('', M, y, CW); }
    else {
      var cols = [{ t: 'Risk', w: 74 }, { t: 'Likelihood', w: 19 }, { t: 'Impact', w: 16 }, { t: 'Mitigation', w: CW - 109 }];
      font('bold', 7); color(MUTED);
      var cxx = M; cols.forEach(function (c) { doc.text(c.t.toUpperCase(), cxx, y); cxx += c.w; });
      y += 1.5; doc.setDrawColor(LINE[0], LINE[1], LINE[2]); doc.line(M, y, W - M, y); y += 3.6;
      risks.slice(0, 5).forEach(function (r) {
        font('normal', 8.2); color(TXT);
        var a = lines(r.description, cols[0].w - 3, 2), d = lines(r.mitigation || '-', cols[3].w, 2);
        doc.text(a, M, y); doc.text(pdfText(r.likelihood), M + 74, y); doc.text(pdfText(r.impact), M + 93, y); doc.text(d, M + 109, y);
        y += Math.max(a.length, d.length) * 3.7 + 1.4;
      });
      if (risks.length > 5) { font('italic', 7.6); color(MUTED); doc.text('+ ' + (risks.length - 5) + ' more in the .json file', M, y); y += LH; }
    }
    y += 3;

    y = label('Resources & timeline', M, y);
    y = para(p.resources.roles, M, y, CW, 2);
    var dur = numOrNull(p.resources.durationMonths);
    var facts = [filled(p.resources.effort) ? 'Effort: ' + p.resources.effort : '', dur ? 'Duration: ' + dur + ' months' : '', filled(p.resources.start) ? 'Start: ' + p.resources.start : ''].filter(Boolean).join('   |   ');
    if (facts) { font('normal', 8.4); color(INK); doc.text(lines(facts, CW, 1), M, y + 0.6); y += LH + 0.6; }
    if (filled(p.resources.milestones)) y = kv('Milestones:', p.resources.milestones.split('\n').map(function (s) { return s.trim(); }).filter(Boolean).join('  >  '), M, y + 0.6, CW);

    var appendix = p.finance.appendix && !b.empty;
    footer('Rough estimate. NPV at ' + f.rate + ' %, ' + f.years + ' years.' + (appendix ? ' Details: page 2.' : ''));

    // ---------- Page 2: financial appendix ----------
    if (appendix) {
      doc.addPage();
      y = M;
      font('bold', 14); color(INK); doc.text('Financial appendix', M, y + 5);
      font('normal', 8.4); color(MUTED); doc.text(lines(p.title || 'Untitled proposal', CW, 1), M, y + 10.5);
      y += 14;
      doc.setDrawColor(BLUE[0], BLUE[1], BLUE[2]); doc.setLineWidth(0.8); doc.line(M, y, W - M, y); doc.setLineWidth(0.2);
      y += 5;
      font('normal', 7.8); color(TXT);
      var al = lines(assumptionsText(f, f.rangeInReport), CW, 3); doc.text(al, M, y); y += al.length * 3.6 + 3;

      // Cash-flow table
      y = label('Year-by-year cash flow (' + p.currency + ')', M, y);
      var N = f.years, lineRange = f.rangeMode === 'line' && f.rangeInReport;
      var numW = N >= 5 ? 16 : 18, typeW = 21, rngW = lineRange ? 18 : 0;
      var lblW = CW - typeW - rngW - (N + 2) * numW;
      var x0 = M, xType = x0 + lblW, xRng = xType + typeW, xNum = xRng + rngW;
      font('bold', 6.8); color(MUTED);
      doc.text('LINE ITEM', x0, y); doc.text('TYPE', xType, y);
      if (lineRange) doc.text('RANGE', xRng + rngW - 1.5, y, { align: 'right' });
      for (var t = 0; t <= N; t++) doc.text(t === 0 ? 'YEAR 0' : 'YEAR ' + t, xNum + (t + 1) * numW - 1.5, y, { align: 'right' });
      doc.text('TOTAL', xNum + (N + 2) * numW - 1.5, y, { align: 'right' });
      y += 1.5; doc.setDrawColor(LINE[0], LINE[1], LINE[2]); doc.line(M, y, W - M, y); y += 3.4;

      var rowsCF = cashRows(), maxRows = 26;
      function cfRow(lbl, type, rng, arr, bold, noTotal) {
        font(bold ? 'bold' : 'normal', 7.4); color(bold ? INK : TXT);
        var ll = lines(lbl, lblW - 2, 2);
        doc.text(ll, x0, y);
        if (type) { font('normal', 6.8); color(MUTED); doc.text(pdfText(type), xType, y); }
        if (rng) { font('normal', 6.8); color(MUTED); doc.text(pdfText(rng), xRng + rngW - 1.5, y, { align: 'right' }); }
        font(bold ? 'bold' : 'normal', 7.4);
        for (var t = 0; t <= N; t++) {
          var v = arr[t];
          color(v < 0 ? RED : (bold ? INK : TXT));
          doc.text(num(v), xNum + (t + 1) * numW - 1.5, y, { align: 'right' });
        }
        if (!noTotal) { var s = sum(arr); color(s < 0 ? RED : INK); font('bold', 7.4); doc.text(num(s), xNum + (N + 2) * numW - 1.5, y, { align: 'right' }); }
        y += ll.length * 3.3 + 1.2;
      }
      rowsCF.slice(0, maxRows).forEach(function (r) {
        cfRow(r.label, r.type, lineRange ? signedPct(r.low) + ' / ' + signedPct(r.high) : '', r.values, false);
      });
      if (rowsCF.length > maxRows) { font('italic', 7); color(MUTED); doc.text('+ ' + (rowsCF.length - maxRows) + ' more lines in the .csv download', x0, y); y += 4; }
      doc.setDrawColor(LINE[0], LINE[1], LINE[2]); doc.line(M, y - 2.2, W - M, y - 2.2); y += 1;
      cfRow('Total costs', '', '', b.costs, true);
      cfRow('Total benefits', '', '', b.bens, true);
      cfRow('Net cash flow', '', '', b.net, true);
      cfRow('Cumulative', '', '', b.cum, false, true);
      if (f.rate > 0) cfRow('Discounted net (' + f.rate + ' %)', '', '', b.dnet, false);
      y += 3;

      // Key figures table
      var showR = f.rangeInReport;
      y = label('Key figures', M, y);
      var kcols = showR ? [['Downside', f.down], ['Base', f.base], ['Upside', f.up]] : [['Base', f.base]];
      var kw = 30, kx = M + 60;
      font('bold', 6.8); color(MUTED);
      kcols.forEach(function (c, j) { doc.text(c[0].toUpperCase(), kx + (j + 1) * kw, y, { align: 'right' }); });
      y += 1.5; doc.line(M, y, kx + kcols.length * kw + 2, y); y += 3.6;
      [
        ['Total cost', function (m) { return pm(m.totalCost); }],
        ['Total benefit', function (m) { return pm(m.totalBenefit); }],
        ['NPV @ ' + f.rate + ' %', function (m) { return pm(m.npv); }],
        ['IRR', function (m) { return pdfText(pct(m.irr)); }],
        ['Payback', function (m) { return pdfText(paybackText(m, true, f.years)); }],
        ['ROI (' + f.years + ' years)', function (m) { return pdfText(pct(m.roi)); }]
      ].forEach(function (r) {
        font('normal', 7.8); color(TXT); doc.text(pdfText(r[0]), M, y);
        kcols.forEach(function (c, j) {
          var isBase = c[0] === 'Base';
          font(isBase ? 'bold' : 'normal', 7.8); color(isBase ? INK : TXT);
          doc.text(r[1](c[1]), kx + (j + 1) * kw, y, { align: 'right' });
        });
        y += 4.3;
      });
      y += 3;

      // Cumulative cash-flow chart
      var chartH = 52;
      if (y + chartH + 12 < FY - 6) {
        y = label('Cumulative cash flow (' + p.currency + ')', M, y);
        var series = [{ d: b.cum, c: BLUE, dash: false, n: 'Base' }];
        if (showR) { series.push({ d: f.down.cum, c: RED, dash: true, n: 'Downside' }); series.push({ d: f.up.cum, c: GREEN, dash: true, n: 'Upside' }); }
        var all = [0]; series.forEach(function (s) { all = all.concat(s.d); });
        var mn = Math.min.apply(null, all), mx = Math.max.apply(null, all); if (mn === mx) mx = mn + 1;
        var gx = M + 18, gw = CW - 22, gy = y + 1, gh = chartH - 8;
        function X(t) { return gx + gw * t / N; }
        function Y(v) { return gy + gh * (mx - v) / (mx - mn); }
        doc.setDrawColor(LINE[0], LINE[1], LINE[2]); doc.setLineWidth(0.2);
        doc.line(gx, gy, gx, gy + gh);
        doc.setDrawColor(148, 163, 184); doc.line(gx, Y(0), gx + gw, Y(0));
        font('normal', 6.6); color(MUTED);
        doc.text(pc(mx), gx - 2, Y(mx) + 1.2, { align: 'right' });
        doc.text(pc(mn), gx - 2, Y(mn) + 1.2, { align: 'right' });
        if (mn < 0 && mx > 0) doc.text('0', gx - 2, Y(0) + 1.2, { align: 'right' });
        for (var tt = 0; tt <= N; tt++) doc.text('Y' + tt, X(tt), gy + gh + 4, { align: 'center' });
        series.slice().reverse().forEach(function (s) {
          doc.setDrawColor(s.c[0], s.c[1], s.c[2]); doc.setLineWidth(s.dash ? 0.4 : 0.8);
          if (s.dash) doc.setLineDashPattern([1.4, 1], 0);
          for (var i = 1; i < s.d.length; i++) doc.line(X(i - 1), Y(s.d[i - 1]), X(i), Y(s.d[i]));
          doc.setLineDashPattern([], 0);
        });
        doc.setLineWidth(0.2);
        if (showR) {
          var lgx = gx + gw;
          series.slice().reverse().forEach(function (s) {
            font('normal', 6.8); color(s.c);
            var w = doc.getTextWidth(s.n);
            lgx -= w + 8;
            doc.setDrawColor(s.c[0], s.c[1], s.c[2]); doc.setLineWidth(0.6); doc.line(lgx, gy - 1.2, lgx + 4, gy - 1.2);
            doc.text(s.n, lgx + 5, gy - 0.2);
          });
          doc.setLineWidth(0.2);
        }
      }
      footer('Year 0 undiscounted; later years discounted at ' + f.rate + ' %.');
    }

    doc.setProperties({ title: pdfText(p.title || 'Business case'), subject: 'One-page business case', creator: 'PPM Compass Business Case Builder' });
    return doc;
  }

  function downloadPdf(btn) {
    var lbl = btn.textContent;
    btn.disabled = true; btn.textContent = 'Creating PDF…';
    loadJsPdf().then(function (JsPDF) {
      var doc = buildPdf(JsPDF);
      doc.save(slug(state.title) + '.pdf');
      track('bcb_downloaded_pdf');
      var next = $('#bcb-next-steps'); if (next) next.hidden = false;
      toast('PDF downloaded');
    }).catch(function () {
      toast('The PDF engine could not load. Use your browser’s Print → Save as PDF instead.');
    }).then(function () { btn.disabled = false; btn.textContent = lbl; });
  }

  // Exposed for automated checks only.
  window.__bcb = { buildPdf: function () { return loadJsPdf().then(buildPdf); }, score: score, figures: figures, state: function () { return state; } };

  /* ---------------- Init ---------------- */
  function init() {
    var app = $('#bcb-app');
    if (!app) return;
    $('#f-casetype').innerHTML = caseTypeOptions();
    $('#bcb-risk-chips').innerHTML = RISK_SUGGESTIONS.map(function (r) {
      return '<button type="button" class="bcb-chip" data-risk-suggest="' + esc(r) + '">+ ' + esc(r) + '</button>';
    }).join('');
    app.addEventListener('input', onInput);
    app.addEventListener('change', onInput);
    document.addEventListener('click', onClick);
    $('#bcb-file').addEventListener('change', function (e) { importFile(e.target.files[0]); e.target.value = ''; });
    app.addEventListener('dragover', function (e) { e.preventDefault(); });
    app.addEventListener('drop', function (e) {
      var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file && /\.json$/i.test(file.name)) { e.preventDefault(); importFile(file); }
    });
    refreshAll();
    if (hasContent()) setSaved('Draft restored from this browser');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
