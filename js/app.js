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
  // 5. Technical Support Desk
  else if (key === 'support' || key.includes('tech') || key.includes('security') || ctx.includes('support') || ctx.includes('help desk')) {
    if (modalTitle) modalTitle.textContent = 'Support & Architecture Desk';
    if (modalSubtitle) modalSubtitle.textContent = 'Direct response from our engineering desk within 24 hours.';
    if (submitBtn) submitBtn.innerHTML = 'Submit Support Request →';
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
    if (cLower.includes('trial') || cLower.includes('eval')) targetPlan = 'trial';
    else if (cLower.includes('3-year') || cLower.includes('3year') || cLower.includes('promo')) targetPlan = '3year';
    else if (cLower.includes('tenant')) targetPlan = 'tenant';
    else if (cLower.includes('1-year') || cLower.includes('1year') || cLower.includes('annual')) targetPlan = '1year';
    else if (cLower.includes('order')) targetPlan = '1year';
    else if (cLower.includes('partner') || cLower.includes('white-label') || cLower.includes('consulting')) targetPlan = 'partner';
    else if (cLower.includes('support') || cLower.includes('help desk') || cLower.includes('ticket') || cLower.includes('security')) targetPlan = 'support';
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

