// ==================== MULTI-CURRENCY PRICING ENGINE ====================
const CURRENCY_CONFIG = {
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'EUR (€)',
    flag: '🇪🇺',
    taxNoteShort: 'exclude applicable VAT in respective locations.',
    taxNoteLong: 'exclude applicable Value Added Tax (VAT) or local sales taxes based on your billing country.',
    modalTaxNote: 'Direct invoice via 15478189 CANADA INC. All prices exclude applicable VAT/taxes. Zero spam guarantee.',
    pTrial: '0 €',
    p1Year: '3.990 €',
    p1YearList: '4.990 €',
    save1Year: 'Save 1.000 €',
    btn1Year: 'Select 1-Year (3.990 €)',
    p3YearRate: '2.990 €',
    p3YearTotal: '8.970 €',
    save3Year: 'Save 6.000 € total',
    btn3Year: 'Claim Offer (8.970 € Upfront)',
    pTenant: '11.970 €',
    pTenantFormula: '3 × 3.990 €',
    btnTenant: 'Order Tenant License (11.970 €)',
    calcPpmAnnual: 2990,
    calcPowerAppsPerPm: 20,
    calcPowerAppsPerViewer: 10,
    calcPowerAppsStorage: 2000,
    calcEnterpriseBlendedPm: 55,
    calcEnterpriseBlendedViewer: 20,
    calcEnterpriseRetainer: 12000,
    formatMoney: (n) => n.toLocaleString('de-DE') + ' €',
    compTable: {
      powerapps: ['8.400 €', '18.000 €', '42.000 €', '70.000+ €'],
      enterprise: ['24.300 €', '54.000 €', '135.000 €', '200.000+ €']
    }
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'USD ($)',
    flag: '🇺🇸',
    taxNoteShort: 'exclude applicable sales tax based on state/country.',
    taxNoteLong: 'exclude applicable state sales tax or local taxes based on your billing address.',
    modalTaxNote: 'Direct invoice via 15478189 CANADA INC. All prices exclude applicable sales taxes. Zero spam guarantee.',
    pTrial: '$0',
    p1Year: '$4,490',
    p1YearList: '$5,490',
    save1Year: 'Save $1,000',
    btn1Year: 'Select 1-Year ($4,490)',
    p3YearRate: '$3,290',
    p3YearTotal: '$9,870',
    save3Year: 'Save $6,600 total',
    btn3Year: 'Claim Offer ($9,870 Upfront)',
    pTenant: '$13,470',
    pTenantFormula: '3 × $4,490',
    btnTenant: 'Order Tenant License ($13,470)',
    calcPpmAnnual: 3290,
    calcPowerAppsPerPm: 20,
    calcPowerAppsPerViewer: 10,
    calcPowerAppsStorage: 2000,
    calcEnterpriseBlendedPm: 55,
    calcEnterpriseBlendedViewer: 20,
    calcEnterpriseRetainer: 12000,
    formatMoney: (n) => '$' + n.toLocaleString('en-US'),
    compTable: {
      powerapps: ['$9,600', '$20,400', '$47,600', '$80,000+'],
      enterprise: ['$27,500', '$61,500', '$153,000', '$225,000+']
    }
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'GBP (£)',
    flag: '🇬🇧',
    taxNoteShort: 'exclude applicable UK VAT.',
    taxNoteLong: 'exclude applicable UK Value Added Tax (VAT).',
    modalTaxNote: 'Direct invoice via 15478189 CANADA INC. All prices exclude applicable VAT. Zero spam guarantee.',
    pTrial: '£0',
    p1Year: '£3,490',
    p1YearList: '£4,490',
    save1Year: 'Save £1,000',
    btn1Year: 'Select 1-Year (£3,490)',
    p3YearRate: '£2,590',
    p3YearTotal: '£7,770',
    save3Year: 'Save £5,700 total',
    btn3Year: 'Claim Offer (£7,770 Upfront)',
    pTenant: '£10,470',
    pTenantFormula: '3 × £3,490',
    btnTenant: 'Order Tenant License (£10,470)',
    calcPpmAnnual: 2590,
    calcPowerAppsPerPm: 16,
    calcPowerAppsPerViewer: 8,
    calcPowerAppsStorage: 1600,
    calcEnterpriseBlendedPm: 45,
    calcEnterpriseBlendedViewer: 16,
    calcEnterpriseRetainer: 10000,
    formatMoney: (n) => '£' + n.toLocaleString('en-GB'),
    compTable: {
      powerapps: ['£7,200', '£15,500', '£36,000', '£60,000+'],
      enterprise: ['£21,000', '£46,500', '£116,000', '£170,000+']
    }
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'AUD (A$)',
    flag: '🇦🇺',
    taxNoteShort: 'exclude applicable GST in Australia/NZ.',
    taxNoteLong: 'exclude applicable Goods and Services Tax (GST) or regional taxes.',
    modalTaxNote: 'Direct invoice via 15478189 CANADA INC. All prices exclude applicable GST/taxes. Zero spam guarantee.',
    pTrial: 'A$0',
    p1Year: 'A$6,490',
    p1YearList: 'A$7,990',
    save1Year: 'Save A$1,500',
    btn1Year: 'Select 1-Year (A$6,490)',
    p3YearRate: 'A$4,890',
    p3YearTotal: 'A$14,670',
    save3Year: 'Save A$9,300 total',
    btn3Year: 'Claim Offer (A$14,670 Upfront)',
    pTenant: 'A$19,470',
    pTenantFormula: '3 × A$6,490',
    btnTenant: 'Order Tenant License (A$19,470)',
    calcPpmAnnual: 4890,
    calcPowerAppsPerPm: 30,
    calcPowerAppsPerViewer: 15,
    calcPowerAppsStorage: 3000,
    calcEnterpriseBlendedPm: 85,
    calcEnterpriseBlendedViewer: 30,
    calcEnterpriseRetainer: 18000,
    formatMoney: (n) => 'A$' + n.toLocaleString('en-AU'),
    compTable: {
      powerapps: ['A$13,500', 'A$29,000', 'A$68,000', 'A$110,000+'],
      enterprise: ['A$39,000', 'A$87,000', 'A$218,000', 'A$320,000+']
    }
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'CAD (C$)',
    flag: '🇨🇦',
    taxNoteShort: 'exclude applicable GST/HST/QST by province.',
    taxNoteLong: 'exclude applicable GST, HST, or provincial sales taxes based on your Canadian location.',
    modalTaxNote: 'Direct invoice via 15478189 CANADA INC. All prices exclude applicable GST/HST/QST. Zero spam guarantee.',
    pTrial: 'C$0',
    p1Year: 'C$6,490',
    p1YearList: 'C$7,990',
    save1Year: 'Save C$1,500',
    btn1Year: 'Select 1-Year (C$6,490)',
    p3YearRate: 'C$4,890',
    p3YearTotal: 'C$14,670',
    save3Year: 'Save C$9,300 total',
    btn3Year: 'Claim Offer (C$14,670 Upfront)',
    pTenant: 'C$19,470',
    pTenantFormula: '3 × C$6,490',
    btnTenant: 'Order Tenant License (C$19,470)',
    calcPpmAnnual: 4890,
    calcPowerAppsPerPm: 28,
    calcPowerAppsPerViewer: 14,
    calcPowerAppsStorage: 2800,
    calcEnterpriseBlendedPm: 80,
    calcEnterpriseBlendedViewer: 28,
    calcEnterpriseRetainer: 17000,
    formatMoney: (n) => 'C$' + n.toLocaleString('en-CA'),
    compTable: {
      powerapps: ['C$13,500', 'C$29,000', 'C$68,000', 'C$110,000+'],
      enterprise: ['C$39,000', 'C$87,000', 'C$218,000', 'C$320,000+']
    }
  },
  CHF: {
    code: 'CHF',
    symbol: 'CHF',
    name: 'CHF (CHF)',
    flag: '🇨🇭',
    taxNoteShort: 'exclude applicable Swiss VAT (MWST).',
    taxNoteLong: 'exclude applicable Swiss Value Added Tax (MWST).',
    modalTaxNote: 'Direct invoice via 15478189 CANADA INC. All prices exclude applicable Swiss VAT. Zero spam guarantee.',
    pTrial: 'CHF 0',
    p1Year: 'CHF 3,890',
    p1YearList: 'CHF 4,890',
    save1Year: 'Save CHF 1,000',
    btn1Year: 'Select 1-Year (CHF 3,890)',
    p3YearRate: 'CHF 2,890',
    p3YearTotal: 'CHF 8,670',
    save3Year: 'Save CHF 6,000 total',
    btn3Year: 'Claim Offer (CHF 8,670 Upfront)',
    pTenant: 'CHF 11,670',
    pTenantFormula: '3 × CHF 3,890',
    btnTenant: 'Order Tenant License (CHF 11,670)',
    calcPpmAnnual: 2890,
    calcPowerAppsPerPm: 19,
    calcPowerAppsPerViewer: 9,
    calcPowerAppsStorage: 1900,
    calcEnterpriseBlendedPm: 52,
    calcEnterpriseBlendedViewer: 19,
    calcEnterpriseRetainer: 11500,
    formatMoney: (n) => 'CHF ' + n.toLocaleString('de-CH'),
    compTable: {
      powerapps: ['CHF 8,000', 'CHF 17,000', 'CHF 40,000', 'CHF 66,000+'],
      enterprise: ['CHF 23,000', 'CHF 51,000', 'CHF 128,000', 'CHF 190,000+']
    }
  }
};

window.currentPpmCurrency = 'EUR';

function detectUserCurrency() {
  try {
    const saved = localStorage.getItem('ppm_currency');
    if (saved && CURRENCY_CONFIG[saved]) return saved;
  } catch (e) {}

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.startsWith('Australia/') || tz.startsWith('Pacific/Guam') || tz === 'Australia/Lord_Howe') return 'AUD';
    if (tz === 'Europe/London' || tz === 'Europe/Belfast' || tz === 'Europe/Jersey' || tz === 'Europe/Guernsey' || tz === 'Europe/Isle_of_Man') return 'GBP';
    if (tz === 'Europe/Zurich') return 'CHF';
    if (tz.startsWith('Canada/') || tz === 'America/Toronto' || tz === 'America/Vancouver' || tz === 'America/Montreal' || tz === 'America/Edmonton' || tz === 'America/Halifax' || tz === 'America/Winnipeg' || tz === 'America/Regina' || tz === 'America/St_Johns' || tz === 'America/Calgary') return 'CAD';
    if (tz.startsWith('America/')) return 'USD';
    
    const euroTimezones = [
      'Europe/Berlin', 'Europe/Paris', 'Europe/Madrid', 'Europe/Rome', 'Europe/Amsterdam',
      'Europe/Brussels', 'Europe/Vienna', 'Europe/Dublin', 'Europe/Lisbon', 'Europe/Helsinki',
      'Europe/Athens', 'Europe/Luxembourg', 'Europe/Tallinn', 'Europe/Riga', 'Europe/Vilnius',
      'Europe/Bratislava', 'Europe/Ljubljana', 'Europe/Nicosia', 'Europe/Malta', 'Europe/Zagreb'
    ];
    if (euroTimezones.includes(tz)) return 'EUR';
    if (tz.startsWith('Europe/')) return 'EUR';
  } catch (e) {}

  try {
    const lang = (navigator.language || (navigator.languages && navigator.languages[0]) || '').toLowerCase();
    if (lang.endsWith('-au')) return 'AUD';
    if (lang.endsWith('-ca')) return 'CAD';
    if (lang.endsWith('-gb')) return 'GBP';
    if (lang.endsWith('-ch')) return 'CHF';
    if (lang.endsWith('-us')) return 'USD';
    if (lang.startsWith('de') || lang.startsWith('fr') || lang.startsWith('es') || lang.startsWith('it') || lang.startsWith('nl')) return 'EUR';
  } catch (e) {}

  return 'USD';
}

window.setCurrency = function(code) {
  if (!CURRENCY_CONFIG[code]) return;
  try {
    localStorage.setItem('ppm_currency', code);
  } catch (e) {}

  window.currentPpmCurrency = code;
  applyCurrency(code);
};

function applyCurrency(code) {
  const c = CURRENCY_CONFIG[code] || CURRENCY_CONFIG.EUR;
  
  // 1. Update switcher buttons
  document.querySelectorAll('[data-currency]').forEach(btn => {
    const isSelected = btn.getAttribute('data-currency') === code;
    if (isSelected) {
      btn.className = 'currency-btn px-3 py-1.5 rounded-lg transition-all cursor-pointer bg-blue-600 text-white font-bold shadow-xs';
      btn.setAttribute('aria-pressed', 'true');
    } else {
      btn.className = 'currency-btn px-3 py-1.5 rounded-lg transition-all cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold';
      btn.setAttribute('aria-pressed', 'false');
    }
  });

  // 2. Update dynamic text targets
  document.querySelectorAll('[data-curr-target]').forEach(el => {
    const targetKey = el.getAttribute('data-curr-target');
    if (c[targetKey] !== undefined) {
      el.textContent = c[targetKey];
    }
  });

  // 3. Update tax note elements
  document.querySelectorAll('[data-curr="tax-note-short"]').forEach(el => {
    el.textContent = c.taxNoteShort;
  });
  document.querySelectorAll('[data-curr="tax-note-long"]').forEach(el => {
    el.textContent = c.taxNoteLong;
  });
  document.querySelectorAll('[data-curr="name"]').forEach(el => {
    el.textContent = c.name;
  });

  // 4. Update comparison table competitor benchmarks
  if (c.compTable) {
    c.compTable.powerapps.forEach((val, idx) => {
      document.querySelectorAll(`[data-curr-comp="powerapps-${idx+1}"]`).forEach(el => {
        el.textContent = val;
      });
    });
    c.compTable.enterprise.forEach((val, idx) => {
      document.querySelectorAll(`[data-curr-comp="enterprise-${idx+1}"]`).forEach(el => {
        el.textContent = val;
      });
    });
  }

  // 5. Update contact modal plan dropdown option labels
  document.querySelectorAll('#modal-plan-select, select[name="role"]').forEach(planSelect => {
    const opt1Year = planSelect.querySelector('option[value="1year"]');
    if (opt1Year) opt1Year.textContent = `1-Year Site License (${c.p1Year}/yr)`;
    const opt3Year = planSelect.querySelector('option[value="3year"]');
    if (opt3Year) opt3Year.textContent = `3-Year Partnership Promo (${c.p3YearTotal} upfront / ${c.p3YearRate}/yr)`;
    const optTenant = planSelect.querySelector('option[value="tenant"]');
    if (optTenant) optTenant.textContent = `Multi-Site Tenant (${c.pTenant}/yr)`;
  });

  document.querySelectorAll('#form-status').forEach(statusEl => {
    statusEl.innerHTML = `🔒 Fixed transparent pricing. Direct invoice via 15478189 CANADA INC. ${c.modalTaxNote}`;
  });

  // 6. Update ROI savings calculator
  if (typeof window.updateRoiCalculator === 'function') {
    window.updateRoiCalculator();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize detected or stored currency
  const detectedCurrency = detectUserCurrency();
  window.setCurrency(detectedCurrency);

  // --- 1. Interactive ROI / Power Apps Licensing Savings Calculator ---
  const pmSlider = document.getElementById('calc-pms');
  const viewersSlider = document.getElementById('calc-viewers');
  const pmCountLabel = document.getElementById('calc-pms-val');
  const viewersCountLabel = document.getElementById('calc-viewers-val');

  const annualPowerAppsCost = document.getElementById('calc-powerapps-annual');
  const annualEnterpriseCost = document.getElementById('calc-enterprise-annual');
  const annualPpmCost = document.getElementById('calc-ppm-annual');
  const totalSavingsLabel = document.getElementById('calc-total-savings');

  window.updateRoiCalculator = function() {
    if (!pmSlider || !viewersSlider) return;

    const pms = parseInt(pmSlider.value, 10);
    const viewers = parseInt(viewersSlider.value, 10);
    const curr = CURRENCY_CONFIG[window.currentPpmCurrency] || CURRENCY_CONFIG.EUR;

    if (pmCountLabel) pmCountLabel.textContent = pms;
    if (viewersCountLabel) viewersCountLabel.textContent = viewers;

    const powerAppsAnnual = (pms * curr.calcPowerAppsPerPm * 12) + (viewers * curr.calcPowerAppsPerViewer * 12) + curr.calcPowerAppsStorage;
    const enterpriseAnnual = (pms * curr.calcEnterpriseBlendedPm * 12) + (viewers * curr.calcEnterpriseBlendedViewer * 12) + curr.calcEnterpriseRetainer;
    const ppmAnnual = curr.calcPpmAnnual;

    const savings = Math.max(0, powerAppsAnnual - ppmAnnual);

    if (annualPowerAppsCost) annualPowerAppsCost.textContent = curr.formatMoney(powerAppsAnnual);
    if (annualEnterpriseCost) annualEnterpriseCost.textContent = curr.formatMoney(enterpriseAnnual);
    if (annualPpmCost) annualPpmCost.textContent = curr.p3YearRate + ' (Flat)';
    if (totalSavingsLabel) totalSavingsLabel.textContent = curr.formatMoney(savings) + ' / year';
  };

  if (pmSlider && viewersSlider) {
    pmSlider.addEventListener('input', window.updateRoiCalculator);
    viewersSlider.addEventListener('input', window.updateRoiCalculator);
    window.updateRoiCalculator();
  }

  // --- 1b. Interactive Partner Practice Revenue Calculator (partners.html) ---
  const partnerClientsSlider = document.getElementById('partner-calc-clients');
  const partnerFeeSlider = document.getElementById('partner-calc-fee');
  const partnerRetainersSlider = document.getElementById('partner-calc-retainers');

  const partnerClientsVal = document.getElementById('partner-calc-clients-val');
  const partnerFeeVal = document.getElementById('partner-calc-fee-val');
  const partnerRetainersVal = document.getElementById('partner-calc-retainers-val');

  const partnerResImpl = document.getElementById('partner-res-impl');
  const partnerResRetainer = document.getElementById('partner-res-retainer');
  const partnerResMargin = document.getElementById('partner-res-margin');
  const partnerResTotal = document.getElementById('partner-res-total');

  function updatePartnerCalculator() {
    if (!partnerClientsSlider || !partnerFeeSlider || !partnerRetainersSlider) return;

    const clients = parseInt(partnerClientsSlider.value, 10);
    const fee = parseInt(partnerFeeSlider.value, 10);
    const retainers = parseInt(partnerRetainersSlider.value, 10);

    if (partnerClientsVal) partnerClientsVal.textContent = clients;
    if (partnerFeeVal) partnerFeeVal.textContent = fee.toLocaleString('de-DE') + ' €';
    if (partnerRetainersVal) partnerRetainersVal.textContent = retainers;

    // Implementation revenue = clients * fee
    const implRevenue = clients * fee;

    // Retainer revenue = retainers * 3.500 €/mo * 12 months
    const retainerRevenue = retainers * 3500 * 12;

    // Estimated software wholesale margin ~30% of license (e.g. 30% of 2.990 € = ~897 € per site)
    const softwareMargin = Math.round(clients * 2990 * 0.30);

    const totalPracticeRevenue = implRevenue + retainerRevenue + softwareMargin;

    if (partnerResImpl) partnerResImpl.textContent = implRevenue.toLocaleString('de-DE') + ' €';
    if (partnerResRetainer) partnerResRetainer.textContent = retainerRevenue.toLocaleString('de-DE') + ' €';
    if (partnerResMargin) partnerResMargin.textContent = '+ ' + softwareMargin.toLocaleString('de-DE') + ' €';
    if (partnerResTotal) partnerResTotal.textContent = totalPracticeRevenue.toLocaleString('de-DE') + ' €';
  }

  if (partnerClientsSlider && partnerFeeSlider && partnerRetainersSlider) {
    partnerClientsSlider.addEventListener('input', updatePartnerCalculator);
    partnerFeeSlider.addEventListener('input', updatePartnerCalculator);
    partnerRetainersSlider.addEventListener('input', updatePartnerCalculator);
    updatePartnerCalculator();
  }

  // --- 2. FAQ Accordion ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');
    const icon = item.querySelector('.faq-icon');

    if (trigger && content) {
      trigger.addEventListener('click', () => {
        const isOpen = !content.classList.contains('hidden');
        // Close all others
        faqItems.forEach(other => {
          const c = other.querySelector('.faq-content');
          const ic = other.querySelector('.faq-icon');
          if (c) c.classList.add('hidden');
          if (ic) ic.style.transform = 'rotate(0deg)';
        });

        if (!isOpen) {
          content.classList.remove('hidden');
          if (icon) icon.style.transform = 'rotate(180deg)';
        }
      });
    }
  });

  // --- 3. Smooth Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // --- 4. Mobile Menu & Nav Dropdowns ---
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Support click/tap toggle for desktop dropdowns (helpful for touchscreen laptops or keyboards)
  const navDropdowns = document.querySelectorAll('.nav-dropdown');
  navDropdowns.forEach(dropdown => {
    const btn = dropdown.querySelector('.nav-dropdown-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('is-open');
        navDropdowns.forEach(d => d.classList.remove('is-open'));
        if (!isOpen) {
          dropdown.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        } else {
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    }
  });

  // Close dropdowns on outside click or escape
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) {
      navDropdowns.forEach(d => {
        d.classList.remove('is-open');
        const btn = d.querySelector('.nav-dropdown-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      navDropdowns.forEach(d => {
        d.classList.remove('is-open');
        const btn = d.querySelector('.nav-dropdown-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
      }
    }
  });

  // --- 5. Clean Professional Light Theme (Dark mode disabled) ---
  try {
    localStorage.removeItem('ppm_theme');
    document.documentElement.classList.remove('dark');
  } catch (e) {}

  // --- 6. Hero Message Carousel / Swiper ---
  initHeroSlider();


  // --- 7. Modern Mouse Movement Tracker Trail ---
  initMouseTracker();
});

/**
 * Modern Mouse Movement Tracker Trail
 * - High-tech ambient cursor glow that softly tracks the pointer
 * - Delicate micro-particle particle & ribbon trail that swiftly dissolves (under 300ms)
 * - Zero interference with reading: completely transparent and vanishes when cursor pauses
 * - Zero click interference: pointer-events: none
 * - Battery & CPU friendly: pauses requestAnimationFrame when cursor is stationary
 * - Automatically disabled on touch-only devices and if prefers-reduced-motion is set
 */
function initMouseTracker() {
  // Accessibility check
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  // Ignore small touch-first devices
  if ('ontouchstart' in window && window.innerWidth < 1024) {
    return;
  }

  // 1. Ambient Glow Element
  let ambientGlow = document.getElementById('ambient-cursor-glow');
  if (!ambientGlow) {
    ambientGlow = document.createElement('div');
    ambientGlow.id = 'ambient-cursor-glow';
    ambientGlow.className = 'ambient-cursor-glow';
    ambientGlow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ambientGlow);
  }

  // 2. Micro-Trail Canvas
  let canvas = document.getElementById('cursor-trail-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'cursor-trail-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');
  let dpr = window.devicePixelRatio || 1;

  function resizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  // Coordinates & State
  let mouseX = -9999;
  let mouseY = -9999;
  let glowX = -9999;
  let glowY = -9999;
  let isMouseInside = false;
  let animId = null;
  let lastMoveTime = 0;
  const points = [];
  const MAX_AGE = 18; // ~300ms at 60fps - quick graceful dissolve so text reading is undisturbed

  function addPoint(x, y) {
    const last = points[points.length - 1];
    if (last) {
      const dx = x - last.x;
      const dy = y - last.y;
      if (dx * dx + dy * dy < 16) return; // at least 4px away to prevent clustering
    }
    points.push({
      x,
      y,
      age: 0,
      radius: 2.8
    });
  }

  function renderLoop() {
    // 1. Smoothly interpolate ambient glow position (gentle lag for organic fluidity)
    if (isMouseInside && mouseX > -1000) {
      if (glowX === -9999) {
        glowX = mouseX;
        glowY = mouseY;
      } else {
        glowX += (mouseX - glowX) * 0.15;
        glowY += (mouseY - glowY) * 0.15;
      }
      ambientGlow.style.transform = `translate3d(${glowX - 180}px, ${glowY - 180}px, 0)`;
      ambientGlow.style.opacity = '1';
    } else {
      ambientGlow.style.opacity = '0';
    }

    // 2. Render particle trail on canvas
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    const isDark = document.documentElement.classList.contains('dark');
    const rgb = isDark ? '99, 102, 241' : '37, 99, 235'; // Indigo in dark mode, vibrant blue in light mode

    if (points.length > 1) {
      // Connect points with a subtle luminous line beam
      for (let i = 1; i < points.length; i++) {
        const p1 = points[i - 1];
        const p2 = points[i];
        const avgAge = (p1.age + p2.age) / 2;
        const alpha = Math.max(0, (1 - avgAge / MAX_AGE) * 0.22);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(${rgb}, ${alpha})`;
        ctx.lineWidth = Math.max(0.4, (1 - avgAge / MAX_AGE) * 2.2);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
    }

    // Draw small delicate dots at vertices
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const life = 1 - p.age / MAX_AGE;
      const alpha = Math.max(0, life * 0.45);
      const r = Math.max(0.6, life * p.radius);

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
      ctx.fill();

      p.age++;
    }

    // Remove expired points
    while (points.length > 0 && points[0].age >= MAX_AGE) {
      points.shift();
    }

    // Continue loop if points remain or mouse recently moved
    const now = performance.now();
    const isMovingRecently = (now - lastMoveTime) < 500;

    if (points.length > 0 || isMovingRecently) {
      animId = requestAnimationFrame(renderLoop);
    } else {
      // Clean up completely when idle: zero CPU consumption
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      animId = null;
    }
  }

  function startLoopIfNeeded() {
    if (!animId) {
      animId = requestAnimationFrame(renderLoop);
    }
  }

  // Pointer Movement Handlers
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isMouseInside = true;
    lastMoveTime = performance.now();
    addPoint(mouseX, mouseY);
    startLoopIfNeeded();
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    isMouseInside = false;
    mouseX = -9999;
    mouseY = -9999;
    ambientGlow.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    isMouseInside = true;
  });
}

/**
 * Hero Message Carousel / Swiper
 * - Smooth 3-message rotating ticker with manual controls and touch gestures
 * - Seamless auto-advance every 6.5s, pauses on hover / touch
 * - Left/Right arrows, active indicator pills, keyboard navigation
 */
function initHeroSlider() {
  const track = document.getElementById('hero-track');
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  const prevBtn = document.getElementById('hero-prev-btn');
  const nextBtn = document.getElementById('hero-next-btn');
  const sliderContainer = document.getElementById('hero-slider');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  const totalSlides = slides.length;
  let autoplayTimer = null;
  const autoplayDelay = 5000;

  function updateSlider(index) {
    currentIndex = (index + totalSlides) % totalSlides;
    if (track) {
      track.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    dots.forEach((dot, idx) => {
      if (idx === currentIndex) {
        dot.className = 'hero-dot group flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer bg-blue-600 text-white shadow-xs';
      } else {
        dot.className = 'hero-dot group flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700';
      }
    });
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      updateSlider(currentIndex + 1);
    }, autoplayDelay);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      updateSlider(idx);
      startAutoplay();
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      updateSlider(currentIndex - 1);
      startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      updateSlider(currentIndex + 1);
      startAutoplay();
    });
  }

  // Touch Swipe for Mobile & Tablet
  let touchStartX = 0;
  let touchEndX = 0;

  if (sliderContainer) {
    sliderContainer.addEventListener('mouseenter', stopAutoplay);
    sliderContainer.addEventListener('mouseleave', startAutoplay);
    sliderContainer.addEventListener('focusin', stopAutoplay);
    sliderContainer.addEventListener('focusout', startAutoplay);

    sliderContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoplay();
    }, { passive: true });

    sliderContainer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          updateSlider(currentIndex + 1);
        } else {
          updateSlider(currentIndex - 1);
        }
      }
      startAutoplay();
    }, { passive: true });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (sliderContainer && sliderContainer.contains(document.activeElement)) {
      if (e.key === 'ArrowLeft') {
        updateSlider(currentIndex - 1);
        startAutoplay();
      } else if (e.key === 'ArrowRight') {
        updateSlider(currentIndex + 1);
        startAutoplay();
      }
    }
  });

  // Start autoplay
  startAutoplay();
}

// --- 8. Reusable Contact / Evaluation / Order Modal Controller ---
function updateModalTexts(targetKey, context) {
  const modal = document.getElementById('contact-modal');
  if (!modal) return;
  const modalTitle = document.getElementById('modal-title') || modal.querySelector('h3');
  const modalSubtitle = document.getElementById('modal-subtitle') || modal.querySelector('p');
  const submitBtn = document.getElementById('modal-submit-btn') || modal.querySelector('button[type="submit"]');

  const key = (targetKey || '').toLowerCase();
  const ctx = (context || '').toLowerCase();

  // 1. General Contact / Message (from footer, about, general query)
  if (key === 'general' || key === 'contact' || key === 'other' || ctx.includes('contact') || ctx.includes('about')) {
    if (modalTitle) modalTitle.textContent = 'Get in Touch';
    if (modalSubtitle) modalSubtitle.textContent = 'Have questions about PPM Compass 360 or need assistance? We typically reply within 24 hours.';
    if (submitBtn) submitBtn.innerHTML = 'Send Message →';
  } 
  // 2. Free Evaluation / 30-Day Trial
  else if (key === 'trial' || key.includes('eval') || ctx.includes('trial') || ctx.includes('eval')) {
    if (modalTitle) modalTitle.textContent = 'Request Full Trial Version (30-Day Evaluation)';
    if (modalSubtitle) modalSubtitle.textContent = 'We will email the .sppkg solution package directly to your work email within 24 hours.';
    if (submitBtn) submitBtn.innerHTML = 'Start My 30-Day Evaluation →';
  } 
  // 3. License Orders (1-Year, 3-Year, Tenant)
  else if (key === '1year' || key === '3year' || key === 'tenant' || key === 'order' || ctx.includes('order')) {
    if (modalTitle) modalTitle.textContent = 'Order PPM Compass 360 License';
    if (modalSubtitle) modalSubtitle.textContent = 'Fixed-price direct licensing • Invoiced with 30-day money-back guarantee.';
    if (submitBtn) submitBtn.innerHTML = 'Submit License Order →';
  } 
  // 4. Partner & Consulting Program
  else if (key === 'partner' || key.includes('tier') || key.includes('walkthrough') || ctx.includes('partner') || ctx.includes('white-label')) {
    if (modalTitle) modalTitle.textContent = 'Partner & Consultant Program Inquiry';
    if (modalSubtitle) modalSubtitle.textContent = 'Connect with our team to discuss partner margins, client deployments, and advisory packages.';
    if (submitBtn) submitBtn.innerHTML = 'Submit Partner Inquiry →';
  } 
  // 5. Security & Architecture Review
  else if (key === 'security' || key.includes('ciso') || ctx.includes('security') || ctx.includes('ciso') || ctx.includes('compliance')) {
    if (modalTitle) modalTitle.textContent = 'Request Security & Architecture Review';
    if (modalSubtitle) modalSubtitle.textContent = 'Direct assistance with internal IT security reviews, zero-egress audits, architecture whitepapers, and GDPR compliance.';
    if (submitBtn) submitBtn.innerHTML = 'Request Security Review →';
  }
  // 6. Technical Support Desk
  else if (key === 'support' || key === 'tech_support' || key.includes('tech') || ctx.includes('support') || ctx.includes('help desk') || ctx.includes('ticket')) {
    if (modalTitle) modalTitle.textContent = 'Technical Support Desk';
    if (modalSubtitle) modalSubtitle.textContent = 'Direct response from our engineering desk within 24 hours.';
    if (submitBtn) submitBtn.innerHTML = 'Submit Support Ticket →';
  } 
  // Fallback (Generic, safe, friendly)
  else {
    if (modalTitle) modalTitle.textContent = 'Get in Touch';
    if (modalSubtitle) modalSubtitle.textContent = 'We typically respond within 24 hours.';
    if (submitBtn) submitBtn.innerHTML = 'Send Message →';
  }
}

window.openContactModal = function(context, plan) {
  const modal = document.getElementById('contact-modal');
  if (!modal) return;
  const subjectInput = document.getElementById('form-subject');
  const planSelect = document.getElementById('modal-plan-select') || modal.querySelector('select[name="role"]');

  if (subjectInput && context) {
    subjectInput.value = 'PPM Compass 360: ' + context;
  }

  let targetPlan = plan;
  if (!targetPlan && context) {
    const cLower = context.toLowerCase();
    if (cLower.includes('security') || cLower.includes('ciso') || cLower.includes('compliance')) targetPlan = 'security';
    else if (cLower.includes('trial') || cLower.includes('eval')) targetPlan = 'trial';
    else if (cLower.includes('3-year') || cLower.includes('3year') || cLower.includes('promo')) targetPlan = '3year';
    else if (cLower.includes('tenant')) targetPlan = 'tenant';
    else if (cLower.includes('1-year') || cLower.includes('1year') || cLower.includes('annual')) targetPlan = '1year';
    else if (cLower.includes('order')) targetPlan = '1year';
    else if (cLower.includes('partner') || cLower.includes('white-label') || cLower.includes('consulting')) targetPlan = 'partner';
    else if (cLower.includes('support') || cLower.includes('help desk') || cLower.includes('ticket')) targetPlan = 'support';
    else if (cLower.includes('contact') || cLower.includes('about') || cLower.includes('footer')) targetPlan = 'general';
    else targetPlan = 'general';
  }
  if (!targetPlan) targetPlan = 'general';

  if (planSelect) {
    const options = Array.from(planSelect.options).map(o => o.value);
    if (options.includes(targetPlan)) {
      planSelect.value = targetPlan;
    } else if (targetPlan === 'general' && options.includes('other')) {
      planSelect.value = 'other';
    } else if (targetPlan === 'partner' && options.includes('tier2')) {
      planSelect.value = 'tier2';
    } else if (targetPlan === 'support' && options.includes('tech_support')) {
      planSelect.value = 'tech_support';
    } else if (targetPlan === 'security' && options.includes('security')) {
      planSelect.value = 'security';
    }
  }

  updateModalTexts(planSelect ? planSelect.value : targetPlan, context);

  modal.classList.remove('hidden');
};

window.closeContactModal = function() {
  const modal = document.getElementById('contact-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
};

// Listeners for ESC, outside click, and form submit
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') window.closeContactModal();
});

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('contact-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target.id === 'contact-modal') window.closeContactModal();
    });
  }

  const planSelect = document.getElementById('modal-plan-select') || (modal ? modal.querySelector('select[name="role"]') : null);
  if (planSelect) {
    planSelect.addEventListener('change', () => {
      updateModalTexts(planSelect.value);
    });
  }

  const leadForm = document.getElementById('lead-form');
  if (leadForm) {
    leadForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const statusEl = document.getElementById('form-status');
      const submitBtn = leadForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending...';
      }

      try {
        const formData = new FormData(leadForm);
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });
        const result = await response.json();
        if (result.success) {
          leadForm.innerHTML = '<div class="py-8 text-center"><div class="text-3xl mb-2">🎉</div><h4 class="text-base font-bold text-slate-900 dark:text-white">Thank You!</h4><p class="text-xs text-slate-600 dark:text-slate-300 mt-1">We have received your inquiry and will be in touch within 24 hours.</p><button type="button" onclick="closeContactModal()" class="mt-4 px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer">Close</button></div>';
        } else {
          if (statusEl) statusEl.innerHTML = '<span class="text-rose-500">Submission error. Please try again or email us.</span>';
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }
        }
      } catch (err) {
        if (statusEl) statusEl.innerHTML = '<span class="text-rose-500">Network error. Please try again later.</span>';
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      }
    });
  }
});

