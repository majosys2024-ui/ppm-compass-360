/**
 * PPM Compass 360 - Marketing Website Scripts
 * Features: ROI Savings Calculator, FAQ Accordion, Theme Toggle, Modal Controls
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Interactive ROI / Power Apps Licensing Savings Calculator ---
  const pmSlider = document.getElementById('calc-pms');
  const viewersSlider = document.getElementById('calc-viewers');
  const pmCountLabel = document.getElementById('calc-pms-val');
  const viewersCountLabel = document.getElementById('calc-viewers-val');

  const annualPowerAppsCost = document.getElementById('calc-powerapps-annual');
  const annualEnterpriseCost = document.getElementById('calc-enterprise-annual');
  const annualPpmCost = document.getElementById('calc-ppm-annual');
  const totalSavingsLabel = document.getElementById('calc-total-savings');

  function updateRoiCalculator() {
    if (!pmSlider || !viewersSlider) return;

    const pms = parseInt(pmSlider.value, 10);
    const viewers = parseInt(viewersSlider.value, 10);
    const totalUsers = pms + viewers;

    if (pmCountLabel) pmCountLabel.textContent = pms;
    if (viewersCountLabel) viewersCountLabel.textContent = viewers;

    // Power Apps Pricing (€):
    // Standard Power Apps per-user license is ~20 €/user/month.
    // Viewers per-app passes or read access ~10 €/user/month + Dataverse storage allowance (~2.000 €/yr).
    const powerAppsAnnual = (pms * 20 * 12) + (viewers * 10 * 12) + 2000;

    // Heavy Enterprise PPM (Planview / Clarity / Monday Enterprise):
    // Blended ~45 €/user/month across PMs + Viewers + minimum support retainer
    const enterpriseAnnual = (pms * 55 * 12) + (viewers * 20 * 12) + 12000;

    // This Lightweight SPFx App:
    // Flat 2.490 € / year per site collection (3-year commitment promo, or 3.990 € 1-year) - heavily discounted from 4.990 € list price!
    const ppmAnnual = 2490;

    const savings = Math.max(0, powerAppsAnnual - ppmAnnual);

    if (annualPowerAppsCost) annualPowerAppsCost.textContent = powerAppsAnnual.toLocaleString('de-DE') + ' €';
    if (annualEnterpriseCost) annualEnterpriseCost.textContent = enterpriseAnnual.toLocaleString('de-DE') + ' €';
    if (annualPpmCost) annualPpmCost.textContent = '2.490 € (Flat)';
    if (totalSavingsLabel) totalSavingsLabel.textContent = savings.toLocaleString('de-DE') + ' € / year';
  }

  if (pmSlider && viewersSlider) {
    pmSlider.addEventListener('input', updateRoiCalculator);
    viewersSlider.addEventListener('input', updateRoiCalculator);
    updateRoiCalculator();
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

    // Estimated software wholesale margin ~30% of license (e.g. 30% of 2.490 € = ~747 € per site)
    const softwareMargin = Math.round(clients * 2490 * 0.30);

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

  // --- 5. Dark Mode Toggle ---
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      const isDark = document.documentElement.classList.contains('dark');
      localStorage.setItem('ppm_theme', isDark ? 'dark' : 'light');
    });
  }

  // Check persisted theme or system preference
  if (localStorage.getItem('ppm_theme') === 'dark' || (!('ppm_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  // --- 6. Modern Mouse Movement Tracker Trail ---
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

