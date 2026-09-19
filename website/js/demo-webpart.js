/**
 * PPM Compass 360 - Interactive WebPart Replica
 * Faithfully mirrors the SPFx React component hierarchy,
 * including zr (Project Detail Drawer), vr (Overview Tab), yr (Status History),
 * nr (Milestones), Sr (Change Requests), Ir (Risks & Issues), Cr (Financials), and Br (Team).
 */

(function () {
  const state = {
    currentTab: 'myPortfolio', // 'myPortfolio', 'portfolio', 'globalSearch', 'allMilestones', 'allRisksIssues', 'analytics', 'heatmap'
    portfolioSubView: 'my', // 'my' (My Assigned Projects) or 'all' (All Portfolio Projects)
    selectedPortfolio: 'all',
    selectedPortfolios: [], // empty = all portfolios active, or array of portfolio names
    portfolioPickerOpen: false,
    selectedRagFilter: 'all',
    searchQuery: '',
    viewMode: 'table', // 'table' or 'cards'
    selectedProjectId: null,
    projectDrawerTab: 'overview', // 'overview', 'history', 'milestones', 'crs', 'risks', 'financials', 'team'
    headerCollapsed: false,
    exportMenuOpen: false,
    riskFilter: 'all', // 'all', 'risk', 'issue', 'sponsor'
    aboutDialogOpen: false,
    selectedRiskCell: null,
    selectedProjectRiskCell: null,
    selectedKpiTile: null, // null, 'rag', 'schedule', 'finance', 'blockers', 'phase'
    teamMonthOffset: 0,
    projectDrawerRiskFilter: 'all', // 'all', 'risks', 'issues', 'open'
    editingQuickLinks: false,
    heatmapFunctionFilter: 'all',
    heatmapGroupByFunction: true,
    riskStatusFilter: ['Open', 'Monitoring', 'Mitigating', 'Escalated', 'Accepted'],
    riskTypeFilter: 'all',
    riskRatingFilter: 'all',
    riskCategoryFilter: 'all',
    riskProjectFilter: 'all',
    riskOpenOnly: true,
    milestoneTypeFilter: 'all', // 'all', 'gates', 'golive', 'testing', 'signoff', 'technical'
    milestoneStatusFilter: 'all', // 'all', 'delayed_at_risk', 'delayed', 'at_risk', 'on_track', 'completed', 'planned'
    milestoneProjectFilter: 'all', // 'all' or projectId
    milestoneSearchQuery: '',
    milestonePreset: 'all', // 'all', 'gates', 'golive', 'delayed', 'testing', 'signoff'
    data: JSON.parse(JSON.stringify(window.PPM_DEMO_DATA))
  };

  const el = (id) => document.getElementById(id);

  function getFilteredProjects() {
    return state.data.projects.filter(p => {
      if (state.currentTab === 'myProjects' || (state.currentTab === 'myPortfolio' && state.portfolioSubView === 'my')) {
        const u = 'Sarah Jenkins';
        const isMine = p.lead === u || p.deputy === u || (p.sponsor && p.sponsor.includes(u)) || p.lead === 'Devon Clark' || p.deputy === 'Elena Garcia';
        if (!isMine) return false;
      }
      if (state.selectedPortfolios && state.selectedPortfolios.length > 0) {
        if (state.selectedPortfolios.includes('__none__')) {
          return false;
        }
        const matches = state.selectedPortfolios.some(pf =>
          pf === p.portfolio ||
          pf === p.portfolioName ||
          (p.portfolio && p.portfolio.toLowerCase() === pf.toLowerCase()) ||
          (p.portfolioName && p.portfolioName.toLowerCase() === pf.toLowerCase())
        );
        if (!matches) {
          return false;
        }
      }
      if (state.selectedPortfolio !== 'all' && p.portfolio !== state.selectedPortfolio && p.portfolioName !== state.selectedPortfolio) {
        return false;
      }
      if (state.selectedRagFilter !== 'all' && p.ragOverall.toLowerCase() !== state.selectedRagFilter.toLowerCase()) {
        return false;
      }
      if (state.searchQuery.trim() !== '') {
        const q = state.searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchCode = p.code.toLowerCase().includes(q);
        const matchLead = p.lead.toLowerCase().includes(q);
        const matchDesc = (p.description || '').toLowerCase().includes(q);
        const matchErp = (p.erpCode || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchLead && !matchDesc && !matchErp) return false;
      }
      return true;
    });
  }

  function getRagBadge(rag, showLabel = true) {
    const r = (rag || 'Green').toLowerCase();
    const colors = {
      green: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      yellow: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      red: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
    };
    const dots = {
      green: 'bg-emerald-500',
      yellow: 'bg-amber-500',
      red: 'bg-rose-500'
    };
    return `
      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${colors[r] || colors.green}">
        <span class="w-1.5 h-1.5 rounded-full ${dots[r] || dots.green} animate-pulse"></span>
        ${showLabel ? (r === 'yellow' ? 'Amber' : r.charAt(0).toUpperCase() + r.slice(1)) : ''}
      </span>
    `;
  }

  function getRagBox(label, value) {
    const v = (value || 'Green').toLowerCase();
    const bgMap = {
      green: 'bg-emerald-500 text-white',
      yellow: 'bg-amber-400 text-slate-900',
      red: 'bg-rose-600 text-white'
    };
    const textLabel = v === 'yellow' ? 'AMBER' : v.toUpperCase();
    return `
      <div class="flex flex-col items-center justify-center p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs min-w-[76px]">
        <span class="text-[9px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">${label}</span>
        <span class="mt-1 px-2 py-0.5 rounded text-[10px] font-black tracking-wide ${bgMap[v] || bgMap.green}">
          ${textLabel}
        </span>
      </div>
    `;
  }

  function formatCurrency(val) {
    if (!val && val !== 0) return '—';
    return Number(val).toLocaleString('de-DE') + ' €';
  }

  // Predefined milestone event type icons (matches SPFx module 9091 Bj)
  const milestoneIcons = {
    'Milestone': '🏁',
    'Approval': '✅',
    'Gate': '🔒',
    'Launch': '🚀',
    'Technical': '🔧',
    'Submission': '📝',
    'Kickoff': '🎬',
    'Review': '🔍',
    'Go-Live': '🎯',
    'Training': '🎓',
    'Sign-off': '✍️',
    'Shipment': '📦',
    'Test': '<svg class="inline-block" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31a2 2 0 0 1-.29.97l-3.32 5.09A4 4 0 0 0 10 22h4a4 4 0 0 0 3.61-6.63l-3.32-5.09a2 2 0 0 1-.29-.97V2"/><path d="M8 2h8"/><path d="M7 16h10"/></svg>',
    'UAT': '<svg class="inline-block" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31a2 2 0 0 1-.29.97l-3.32 5.09A4 4 0 0 0 10 22h4a4 4 0 0 0 3.61-6.63l-3.32-5.09a2 2 0 0 1-.29-.97V2"/><path d="M8 2h8"/><path d="M7 16h10"/></svg>',
    'SAT': '<svg class="inline-block" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31a2 2 0 0 1-.29.97l-3.32 5.09A4 4 0 0 0 10 22h4a4 4 0 0 0 3.61-6.63l-3.32-5.09a2 2 0 0 1-.29-.97V2"/><path d="M8 2h8"/><path d="M7 16h10"/></svg>'
  };

  function getMilestoneIcon(eventType, isPhaseGate) {
    if (eventType && milestoneIcons[eventType]) return milestoneIcons[eventType];
    if (isPhaseGate) return '🔒';
    return '🏁';
  }

  function getMilestoneStatusStyle(status) {
    switch (status) {
      case 'Completed':
        return { bg: 'bg-emerald-50 dark:bg-emerald-950/50', border: 'border-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', dot: '#10b981' };
      case 'On Track':
        return { bg: 'bg-teal-50 dark:bg-teal-950/50', border: 'border-teal-500', text: 'text-teal-700 dark:text-teal-300', dot: '#0d9488' };
      case 'At Risk':
        return { bg: 'bg-amber-50 dark:bg-amber-950/50', border: 'border-amber-500', text: 'text-amber-700 dark:text-amber-300', dot: '#f59e0b' };
      case 'Late / Delayed':
      case 'Delayed':
        return { bg: 'bg-rose-50 dark:bg-rose-950/50', border: 'border-rose-500', text: 'text-rose-700 dark:text-rose-300', dot: '#ef4444' };
      case 'Cancelled':
        return { bg: 'bg-purple-50 dark:bg-purple-950/50', border: 'border-purple-500', text: 'text-purple-700 dark:text-purple-300', dot: '#8b5cf6' };
      case 'Not Started':
      default:
        return { bg: 'bg-slate-50 dark:bg-slate-800', border: 'border-slate-400', text: 'text-slate-600 dark:text-slate-300', dot: '#64748b' };
    }
  }

  function formatEuropeanDate(dateStr) {
    if (!dateStr || dateStr === '—') return '—';
    if (/^(Week|Q[1-4]|TBD)/i.test(dateStr)) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    return dateStr;
  }

  function getDaysDifference(targetDateStr, baseDateStr) {
    if (!targetDateStr || !baseDateStr) return null;
    const t = new Date(targetDateStr).getTime();
    const b = new Date(baseDateStr).getTime();
    if (isNaN(t) || isNaN(b)) return null;
    return Math.round((t - b) / (1000 * 60 * 60 * 24));
  }

  function renderVarianceBadge(days, isBaseline = false) {
    if (days === null || days === undefined) return '';
    if (days === 0) {
      return `<span class="inline-block px-1 py-0.2 rounded text-[9.5px] font-mono font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">±0d</span>`;
    }
    if (days > 0) {
      const bg = isBaseline ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300';
      return `<span class="inline-block px-1 py-0.2 rounded text-[9.5px] font-mono font-bold ${bg}">+${days}d</span>`;
    }
    return `<span class="inline-block px-1 py-0.2 rounded text-[9.5px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">${days}d</span>`;
  }

  function renderStageGateTracker(currentPhase) {
    const stages = ['Idea', 'Planning', 'Execution', 'Closing'];
    const norm = (currentPhase || 'Execution').toLowerCase();
    let activeStage = 'Execution';
    if (norm.includes('idea') || norm.includes('initiat')) activeStage = 'Idea';
    else if (norm.includes('plan') || norm.includes('design')) activeStage = 'Planning';
    else if (norm.includes('clos') || norm.includes('complet')) activeStage = 'Closing';
    else activeStage = 'Execution';

    return `
      <div class="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
        ${stages.map((stage, idx) => {
          const isActive = stage === activeStage;
          const arrow = idx < stages.length - 1 ? '<span class="text-slate-300 dark:text-slate-600 font-normal mx-0.5">→</span>' : '';
          if (isActive) {
            return `
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 text-[10.5px]">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                <span>${stage}</span>
              </span>
              ${arrow}
            `;
          } else {
            return `
              <span class="px-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 text-[10.5px]">${stage}</span>
              ${arrow}
            `;
          }
        }).join('')}
      </div>
    `;
  }

  // Staggered Timeline View (module 9091 Bj matching)
  function renderTimelineComponent(project, projectMilestones) {
    const timelineItems = (projectMilestones || []).filter(m => m.showOnTimeline !== false && (m.actualDate || m.forecastDate || m.baselineDate));

    if (!timelineItems.length) {
      return `
        <div class="py-8 text-center text-slate-400">
          <p class="text-xs">No milestones currently selected for the timeline.</p>
          <button class="btn-jump-tab mt-2 text-xs text-blue-600 hover:underline font-medium" data-target-tab="milestones">
            Go to Milestones tab to select deliverables →
          </button>
        </div>
      `;
    }

    const projectStartMs = project.startDate ? new Date(project.startDate).getTime() : NaN;
    const projectTargetMs = project.targetDate ? new Date(project.targetDate).getTime() : NaN;
    
    const itemDates = timelineItems.map(m => new Date(m.actualDate || m.forecastDate || m.baselineDate).getTime()).filter(t => !isNaN(t));
    if (!isNaN(projectStartMs)) itemDates.push(projectStartMs);
    if (!isNaN(projectTargetMs)) itemDates.push(projectTargetMs);

    // 15 days padding on both ends
    const padMs = 15 * 86400000;
    const minTime = Math.min(...itemDates) - padMs;
    const maxTime = Math.max(...itemDates) + padMs;
    const timeSpan = maxTime > minTime ? (maxTime - minTime) : 86400000 * 30;

    // Responsive percentage-based positioning for full app width
    const paddingPct = 6;
    const usablePct = 88;

    const parsedItems = timelineItems.map(m => {
      const dateStr = m.actualDate || m.forecastDate || m.baselineDate;
      const dateMs = new Date(dateStr).getTime();
      const xPct = paddingPct + ((dateMs - minTime) / timeSpan) * usablePct;
      return {
        ...m,
        dateStr,
        dateMs,
        xPct: Math.max(3, Math.min(97, xPct))
      };
    });

    parsedItems.sort((a, b) => a.dateMs - b.dateMs);

    // Collision avoidance: tier staggering for close neighbors (within 8.5% distance)
    const placed = [];
    const renderedItems = parsedItems.map(item => {
      const closeNeighbors = placed.filter(p => Math.abs(p.xPct - item.xPct) < 8.5);
      const tier = closeNeighbors.length;
      placed.push({ xPct: item.xPct, tier });

      let markerTop = 97;
      let labelTop = 130;
      let stemHtml = '';

      if (tier === 0) {
        markerTop = 97;
        labelTop = 130;
      } else if (tier === 1) {
        markerTop = 97;
        labelTop = 64;
      } else if (tier === 2) {
        markerTop = 143;
        labelTop = 176;
        stemHtml = `<div class="ppm-timeline-stem" style="left: ${item.xPct}%; top: 110px; height: 33px;"></div>`;
      } else if (tier === 3) {
        markerTop = 51;
        labelTop = 18;
        stemHtml = `<div class="ppm-timeline-stem" style="left: ${item.xPct}%; top: 77px; height: 33px;"></div>`;
      } else {
        const dir = (tier % 2 === 1) ? -1 : 1;
        const step = Math.floor(tier / 2);
        const offset = dir * (46 + (step - 1) * 32);
        markerTop = 97 + offset;
        labelTop = dir > 0 ? markerTop + 33 : markerTop - 34;
        const stemTop = dir > 0 ? 110 : (markerTop + 26);
        const stemHeight = Math.abs(markerTop + (dir > 0 ? 0 : 26) - 110);
        stemHtml = `<div class="ppm-timeline-stem" style="left: ${item.xPct}%; top: ${stemTop}px; height: ${stemHeight}px;"></div>`;
      }

      const style = getMilestoneStatusStyle(item.status);
      const icon = getMilestoneIcon(item.eventType, item.isPhaseGate);

      return `
        ${stemHtml}
        <!-- Marker -->
        <div class="ppm-timeline-marker border-2 ${style.border} ${style.bg}" 
             style="position: absolute; left: calc(${item.xPct}% - 13px); top: ${markerTop}px;" 
             title="${item.milestoneId ? item.milestoneId + ': ' : ''}${item.title} (${formatEuropeanDate(item.dateStr)}) — [${item.eventType || 'Milestone'}] ${item.status}">
          ${icon}
        </div>
        <!-- Label -->
        <div class="ppm-timeline-label" style="left: ${item.xPct}%; top: ${labelTop}px;">
          <div class="ppm-timeline-label-title" title="${item.title}">${item.title}</div>
          <div class="ppm-timeline-label-date">${formatEuropeanDate(item.dateStr)}</div>
          <div class="inline-flex items-center gap-1 mt-0.5 px-1 py-0.2 rounded text-[9px] font-bold ${style.bg} ${style.text}">
            <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${style.dot};"></span>
            <span>${item.status}</span>
          </div>
        </div>
      `;
    }).join('');

    const todayMs = new Date('2026-10-15').getTime();
    let todayLineHtml = '';
    if (todayMs >= minTime && todayMs <= maxTime) {
      const todayPct = paddingPct + ((todayMs - minTime) / timeSpan) * usablePct;
      todayLineHtml = `
        <div class="ppm-timeline-today-line" style="left: ${todayPct}%;"></div>
        <div class="ppm-timeline-today-badge" style="left: ${todayPct}%;">Today (15.10.2026)</div>
      `;
    }

    return `
      <div class="ppm-timeline-wrap w-full">
        <div class="ppm-timeline-container w-full" style="width: 100%; min-width: 600px;">
          <!-- Axis Line -->
          <div class="ppm-timeline-axis" style="left: 20px; right: 20px;"></div>

          <!-- Project Bounds -->
          ${!isNaN(projectStartMs) ? `
            <div class="absolute text-[10px] text-slate-400 font-mono" style="left: 20px; top: 118px;">
              ▶ Start: ${formatEuropeanDate(project.startDate)}
            </div>
          ` : ''}
          ${!isNaN(projectTargetMs) ? `
            <div class="absolute text-[10px] text-slate-400 font-mono text-right" style="right: 20px; top: 118px;">
              Target: ${formatEuropeanDate(project.targetDate)} 🏁
            </div>
          ` : ''}

          <!-- Today line -->
          ${todayLineHtml}

          <!-- Events -->
          ${renderedItems}
        </div>
      </div>

      <!-- Footer Legend & Controls matching Screenshot 1 & 2 -->
      <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <div class="flex flex-wrap items-center gap-3">
          <span class="font-bold text-[10px] tracking-wider text-slate-500 dark:text-slate-400 uppercase">COLOUR = STATUS (MILESTONE DATE)</span>
          <span class="inline-flex items-center gap-1.5"><span class="w-2 h-2 rounded-full" style="background-color: #10b981;"></span> Completed</span>
          <span class="inline-flex items-center gap-1.5"><span class="w-2 h-2 rounded-full" style="background-color: #0d9488;"></span> On Track</span>
          <span class="inline-flex items-center gap-1.5"><span class="w-2 h-2 rounded-full" style="background-color: #f59e0b;"></span> At Risk</span>
          <span class="inline-flex items-center gap-1.5"><span class="w-2 h-2 rounded-full" style="background-color: #ef4444;"></span> Delayed</span>
          <span class="inline-flex items-center gap-1.5"><span class="w-2 h-2 rounded-full" style="background-color: #64748b;"></span> Not Started</span>
          <span class="inline-flex items-center gap-1.5"><span class="w-2 h-2 rounded-full" style="background-color: #8b5cf6;"></span> Cancelled</span>
        </div>
        <div class="flex items-center gap-2">
          <span>Showing <strong>${timelineItems.length}</strong> of <strong>${projectMilestones.length}</strong> milestones</span>
          <span>•</span>
          <button class="btn-jump-tab text-blue-600 dark:text-blue-400 hover:underline font-medium" data-target-tab="milestones">Configure items in Milestones tab →</button>
        </div>
      </div>
    `;
  }

  function renderKPIBar() {
    const projects = getFilteredProjects();
    const totalProjects = projects.length;
    const greenCount = projects.filter(p => p.ragOverall === 'Green').length;
    const yellowCount = projects.filter(p => p.ragOverall === 'Yellow').length;
    const redCount = projects.filter(p => p.ragOverall === 'Red').length;
    
    const activeProjectIds = projects.map(p => p.id);
    const activeFinancials = state.data.financials.filter(f => activeProjectIds.includes(f.projectId));
    const totalBudget = activeFinancials.reduce((sum, f) => sum + (f.totalApprovedBudget || 0), 0);
    const totalActuals = activeFinancials.reduce((sum, f) => sum + (f.actualsToDate || 0), 0);
    const criticalRisks = state.data.risksIssues.filter(r => activeProjectIds.includes(r.projectId) && (r.itemType === 'Issue' || r.rating === 'Critical' || r.rating === 'High')).length;

    const kpiContainer = el('webpart-kpi-bar');
    if (!kpiContainer) return;

    const totalAvailablePfs = state.data.portfolios.filter(p => p.id !== 'all').length;
    const pfScopeText = state.selectedPortfolios.length > 0
      ? `${state.selectedPortfolios.length} Portfolio${state.selectedPortfolios.length > 1 ? 's' : ''} Active`
      : `Across ${totalAvailablePfs} Portfolios`;

    kpiContainer.innerHTML = `
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div class="bg-white dark:bg-slate-800 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
          <div class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Projects</div>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-2xl font-bold text-slate-900 dark:text-white">${totalProjects}</span>
            <span class="text-xs text-slate-500">${pfScopeText}</span>
          </div>
          <div class="flex gap-2 mt-2 text-xs">
            <span class="text-emerald-700 dark:text-emerald-400 font-semibold">${greenCount} Green</span>
            <span class="text-amber-700 dark:text-amber-400 font-semibold">${yellowCount} Amber</span>
            <span class="text-rose-700 dark:text-rose-400 font-semibold">${redCount} Red</span>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
          <div class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Portfolio Health</div>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${Math.round((greenCount / totalProjects) * 100)}%</span>
            <span class="text-xs text-slate-500">On-Track Delivery</span>
          </div>
          <div class="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2.5 overflow-hidden flex">
            <div style="width: ${(greenCount/totalProjects)*100}%" class="bg-emerald-500 h-full"></div>
            <div style="width: ${(yellowCount/totalProjects)*100}%" class="bg-amber-500 h-full"></div>
            <div style="width: ${(redCount/totalProjects)*100}%" class="bg-rose-500 h-full"></div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
          <div class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Financial Burn</div>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-xl font-bold text-slate-900 dark:text-white">${formatCurrency(totalActuals)}</span>
            <span class="text-xs text-slate-500">of ${formatCurrency(totalBudget)}</span>
          </div>
          <div class="text-xs text-slate-500 mt-2">
            ${Math.round((totalActuals/totalBudget)*100)}% committed • Standard SP Lists
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
          <div class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Blockers</div>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-2xl font-bold text-rose-600 dark:text-rose-400">${criticalRisks}</span>
            <span class="text-xs text-slate-500">Critical Issues / Risks</span>
          </div>
          <div class="text-xs text-slate-500 mt-2">
            3×3 Risk & Issue matrix monitored
          </div>
        </div>
      </div>
    `;
  }

  function renderPortfolioView() {
    const container = el('webpart-view-container');
    if (!container) return;

    const filtered = getFilteredProjects();

    if (state.currentTab === 'myProjects') {
      let myProjectsHtml = `
        <div class="mb-4 pb-3 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>My Projects</span>
              <span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-semibold">${filtered.length} Projects</span>
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Projects where you are Sponsor, Project Leader, or Deputy.</p>
          </div>
          <div class="flex items-center gap-2">
            <div class="relative">
              <input id="filter-my-projects-search" type="text" value="${state.searchQuery}" placeholder="Filter my projects..." class="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md pl-7 pr-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 w-48" />
              <svg class="w-3.5 h-3.5 absolute left-2 top-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg shadow-xs">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700 select-none">
              <tr>
                <th class="py-2.5 px-3">STATUS</th>
                <th class="py-2.5 px-3">PROJECT #</th>
                <th class="py-2.5 px-4">PROJECT NAME</th>
                <th class="py-2.5 px-3">PHASE</th>
                <th class="py-2.5 px-3">SPONSOR</th>
                <th class="py-2.5 px-3">LEAD</th>
                <th class="py-2.5 px-3">DEPUTY</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
              ${filtered.map(p => `
                <tr class="project-row hover:bg-blue-50/60 dark:hover:bg-slate-800/60 cursor-pointer transition-colors" data-id="${p.id}">
                  <td class="py-2.5 px-3 whitespace-nowrap">
                    ${getRagBadge(p.ragOverall)}
                  </td>
                  <td class="py-2.5 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                    ${p.code}
                  </td>
                  <td class="py-2.5 px-4 font-semibold text-slate-900 dark:text-white hover:text-blue-600">
                    <div>${p.title}</div>
                    <div class="text-[10px] text-slate-400 font-normal mt-0.5">${p.portfolioName}</div>
                  </td>
                  <td class="py-2.5 px-3">
                    <span class="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-medium text-[11px]">${p.phase}</span>
                  </td>
                  <td class="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                    ${p.sponsor || '—'}
                  </td>
                  <td class="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                    ${p.lead || '—'}
                  </td>
                  <td class="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                    ${p.deputy || '—'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      container.innerHTML = myProjectsHtml;
      bindPortfolioEvents();
      const mySearch = el('filter-my-projects-search');
      if (mySearch) {
        mySearch.oninput = (e) => {
          state.searchQuery = e.target.value;
          renderPortfolioView();
        };
      }
      return;
    }

    let viewHtml = `
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
        <!-- Filters -->
        <div class="flex flex-wrap items-center gap-2">
          <div class="relative">
            <select id="filter-portfolio-select" class="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500">
              ${state.data.portfolios.map(p => `
                <option value="${p.id}" ${state.selectedPortfolio === p.id ? 'selected' : ''}>${p.name}</option>
              `).join('')}
            </select>
          </div>

          <div class="inline-flex rounded-md shadow-xs bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
            <button data-rag="all" class="rag-pill-btn px-2 py-1 text-xs font-medium rounded ${state.selectedRagFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}">All (${state.data.projects.length})</button>
            <button data-rag="green" class="rag-pill-btn px-2 py-1 text-xs font-medium rounded ${state.selectedRagFilter === 'green' ? 'bg-emerald-500 text-white shadow-xs' : 'text-emerald-700 dark:text-emerald-400'}">Green</button>
            <button data-rag="yellow" class="rag-pill-btn px-2 py-1 text-xs font-medium rounded ${state.selectedRagFilter === 'yellow' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-700 dark:text-amber-400'}">Amber</button>
            <button data-rag="red" class="rag-pill-btn px-2 py-1 text-xs font-medium rounded ${state.selectedRagFilter === 'red' ? 'bg-rose-500 text-white shadow-xs' : 'text-rose-700 dark:text-rose-400'}">Red</button>
          </div>
        </div>

        <!-- Search and View Toggle -->
        <div class="flex items-center gap-2">
          <div class="relative">
            <input id="filter-search-input" type="text" value="${state.searchQuery}" placeholder="Filter projects..." class="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md pl-7 pr-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44 md:w-56" />
            <svg class="w-3.5 h-3.5 absolute left-2 top-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>

          <div class="inline-flex rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5">
            <button id="view-mode-table" title="Table View" class="p-1 rounded ${state.viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'}">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
            </button>
            <button id="view-mode-cards" title="Cards View" class="p-1 rounded ${state.viewMode === 'cards' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'}">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            </button>
          </div>
        </div>
      </div>
    `;

    if (filtered.length === 0) {
      viewHtml += `
        <div class="py-12 text-center text-slate-500">
          <p class="text-sm font-medium">No projects match the selected criteria.</p>
          <button id="reset-filters-btn" class="mt-2 text-xs text-blue-600 hover:underline">Reset filters</button>
        </div>
      `;
    } else if (state.viewMode === 'table') {
      viewHtml += `
        <div class="overflow-x-auto max-w-full max-h-[460px] overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg shadow-xs">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50/95 dark:bg-slate-800/95 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700 select-none sticky top-0 z-10 backdrop-blur-xs">
              <tr>
                <th class="py-2.5 px-3">Project</th>
                <th class="py-2.5 px-3">Phase</th>
                <th class="py-2.5 px-3">Lead / Sponsor</th>
                <th class="py-2.5 px-2 text-center">Overall</th>
                <th class="py-2.5 px-2 text-center">Timeline</th>
                <th class="py-2.5 px-2 text-center">Budget</th>
                <th class="py-2.5 px-2 text-center">Resources</th>
                <th class="py-2.5 px-2 text-center">Scope</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
              ${filtered.map(p => `
                <tr class="project-row hover:bg-blue-50/60 dark:hover:bg-slate-800/60 cursor-pointer transition-colors" data-id="${p.id}">
                  <td class="py-2.5 px-3">
                    <div class="font-semibold text-slate-900 dark:text-white hover:text-blue-600 flex items-center gap-1.5">
                      <span>${p.title}</span>
                      <span class="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">${p.code}</span>
                    </div>
                    <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">${p.portfolioName}</div>
                  </td>
                  <td class="py-2.5 px-3">
                    <span class="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-medium text-[11px]">${p.phase}</span>
                  </td>
                  <td class="py-2.5 px-3">
                    <div class="font-medium text-slate-800 dark:text-slate-200">${p.lead}</div>
                    <div class="text-[10px] text-slate-400">${p.sponsor}</div>
                  </td>
                  <td class="py-2.5 px-2 text-center">${getRagBadge(p.ragOverall)}</td>
                  <td class="py-2.5 px-2 text-center">${getRagBadge(p.ragTimeline, false)}</td>
                  <td class="py-2.5 px-2 text-center">${getRagBadge(p.ragBudget, false)}</td>
                  <td class="py-2.5 px-2 text-center">${getRagBadge(p.ragResources, false)}</td>
                  <td class="py-2.5 px-2 text-center">${getRagBadge(p.ragScope, false)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      // Cards view
      viewHtml += `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          ${filtered.map(p => `
            <div class="project-card bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-lg p-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between" data-id="${p.id}">
              <div>
                <div class="flex items-start justify-between gap-2">
                  <span class="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">${p.code}</span>
                  ${getRagBadge(p.ragOverall)}
                </div>
                <h4 class="font-bold text-slate-900 dark:text-white mt-1.5 hover:text-blue-600 text-sm leading-snug">${p.title}</h4>
                <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">${p.description}</p>
              </div>

              <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/80">
                <div class="grid grid-cols-4 gap-1 text-center py-1 bg-slate-50 dark:bg-slate-900/60 rounded mb-2">
                  <div>
                    <div class="text-[9px] text-slate-400 uppercase">Time</div>
                    <div>${getRagBadge(p.ragTimeline, false)}</div>
                  </div>
                  <div>
                    <div class="text-[9px] text-slate-400 uppercase">Budget</div>
                    <div>${getRagBadge(p.ragBudget, false)}</div>
                  </div>
                  <div>
                    <div class="text-[9px] text-slate-400 uppercase">Res</div>
                    <div>${getRagBadge(p.ragResources, false)}</div>
                  </div>
                  <div>
                    <div class="text-[9px] text-slate-400 uppercase">Scope</div>
                    <div>${getRagBadge(p.ragScope, false)}</div>
                  </div>
                </div>

                <div class="flex items-center justify-between text-xs text-slate-500">
                  <span>Lead: <strong class="text-slate-700 dark:text-slate-300 font-medium">${p.lead}</strong></span>
                  <span class="font-mono text-[11px]">${p.percentComplete}% done</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    container.innerHTML = viewHtml;
    bindPortfolioEvents();
  }

  function renderMyPortfolioView() {
    const container = el('webpart-view-container');
    if (!container) return;

    let allPortfolioProjects = state.data.projects;
    if (state.selectedPortfolio !== 'all') {
      allPortfolioProjects = allPortfolioProjects.filter(p => p.portfolio === state.selectedPortfolio || p.portfolioName === state.selectedPortfolio);
    }

    const myProjects = allPortfolioProjects.filter(p => {
      const u = 'Sarah Jenkins';
      return p.lead === u || p.deputy === u || (p.sponsor && p.sponsor.includes(u)) || p.lead === 'Devon Clark' || p.deputy === 'Elena Garcia';
    });

    const isMyProjects = state.portfolioSubView === 'my';
    let projects = isMyProjects ? myProjects : allPortfolioProjects;

    const projectIds = projects.map(p => p.id);
    const milestones = state.data.milestones.filter(m => projectIds.includes(m.projectId));
    const risks = state.data.risksIssues.filter(r => projectIds.includes(r.projectId));
    const financials = state.data.financials.filter(f => projectIds.includes(f.projectId));
    const statusReports = (state.data.monthlyStatus || []).filter(s => projectIds.includes(s.projectId));

    const upcomingGates = milestones
      .filter(m => (m.isPhaseGate || m.eventType === 'Gate' || (m.title && m.title.toLowerCase().includes('gate'))) && m.status !== 'Completed')
      .sort((a, b) => (a.forecastDate || '').localeCompare(b.forecastDate || ''));

    // KPI 1: RAG Health
    const redProjects = projects.filter(p => p.ragOverall === 'Red');
    const yellowProjects = projects.filter(p => p.ragOverall === 'Yellow');
    const greenProjects = projects.filter(p => p.ragOverall === 'Green');

    // KPI 2: On-Time Health
    const delayedMilestones = milestones.filter(m => m.status === 'Late / Delayed' || m.status === 'Delayed');
    const atRiskMilestones = milestones.filter(m => m.status === 'At Risk');
    const totalMilestones = milestones.length;
    const onTimePct = totalMilestones > 0 ? Math.round(((totalMilestones - delayedMilestones.length) / totalMilestones) * 100) : 100;

    // KPI 3: Financial Burn
    const totalBudget = financials.reduce((sum, f) => sum + (f.totalApprovedBudget || 0), 0);
    const totalActuals = financials.reduce((sum, f) => sum + (f.actualsToDate || 0), 0);
    const burnPct = totalBudget > 0 ? Math.round((totalActuals / totalBudget) * 100) : 0;
    const projectsWithFinance = financials.length;
    const totalProjects = projects.length;

    // KPI 4: Active Blockers
    const criticalBlockers = risks.filter(r => r.severity === 'Critical' || r.rating === 'Critical');
    const highBlockers = risks.filter(r => r.severity === 'High' && r.rating !== 'Critical');
    const allBlockers = [...criticalBlockers, ...highBlockers];

    // KPI 5: Phase Distribution
    const phaseList = ['Initiate', 'Plan', 'Execute', 'Close'];
    const phaseCounts = {
      'Initiate': projects.filter(p => p.phase === 'Initiate').length,
      'Plan': projects.filter(p => p.phase === 'Plan').length,
      'Execute': projects.filter(p => p.phase === 'Execute').length,
      'Close': projects.filter(p => p.phase === 'Close').length
    };

    let drillDownHtml = '';
    if (state.selectedKpiTile) {
      let tileTitle = '';
      let tileContent = '';

      if (state.selectedKpiTile === 'rag') {
        tileTitle = `RAG Health Drill-Down (${redProjects.length} Red, ${yellowProjects.length} Amber, ${greenProjects.length} Green)`;
        tileContent = `
          <div class="overflow-x-auto max-w-full max-h-[340px] overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b sticky top-0 z-10">
                <tr>
                  <th class="py-2 px-3">Project</th>
                  <th class="py-2 px-3">Overall RAG</th>
                  <th class="py-2 px-3">Scope / Schedule / Budget / Resource</th>
                  <th class="py-2 px-3">RAG Variance Reason</th>
                  <th class="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                ${projects.map(p => `
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td class="py-2 px-3 font-semibold text-slate-900 dark:text-white">${p.title} (${p.code})</td>
                    <td class="py-2 px-3">${getRagBadge(p.ragOverall)}</td>
                    <td class="py-2 px-3 font-mono text-[11px]">
                      S:${p.ragScope ? p.ragScope[0] : 'G'} | Sch:${p.ragSchedule ? p.ragSchedule[0] : 'G'} | B:${p.ragBudget ? p.ragBudget[0] : 'G'} | R:${p.ragResource ? p.ragResource[0] : 'G'}
                    </td>
                    <td class="py-2 px-3 text-slate-500">${p.ragReason || 'On track delivery within agreed tolerances.'}</td>
                    <td class="py-2 px-3 text-right">
                      <button data-drill-id="${p.id}" class="btn-open-from-drill text-blue-600 font-medium hover:underline">Open Project →</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      } else if (state.selectedKpiTile === 'schedule') {
        tileTitle = `On-Time Health Drill-Down — Deliverables & Milestones (${delayedMilestones.length} Delayed)`;
        tileContent = `
          <div class="overflow-x-auto max-w-full max-h-[340px] overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b sticky top-0 z-10">
                <tr>
                  <th class="py-2 px-3">Deliverable</th>
                  <th class="py-2 px-3">Project</th>
                  <th class="py-2 px-3">Phase</th>
                  <th class="py-2 px-3">Baseline</th>
                  <th class="py-2 px-3">Forecast</th>
                  <th class="py-2 px-3 text-center">Variance / Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                ${milestones.map(m => {
                  const prj = projects.find(p => p.id === m.projectId);
                  return `
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td class="py-2 px-3 font-medium text-slate-900 dark:text-white">${m.title}</td>
                      <td class="py-2 px-3 text-slate-500">${prj ? prj.code : '—'}</td>
                      <td class="py-2 px-3 text-slate-500">${m.phase}</td>
                      <td class="py-2 px-3 font-mono text-slate-500">${m.baselineDate}</td>
                      <td class="py-2 px-3 font-mono ${(m.status === 'Late / Delayed' || m.status === 'Delayed') ? 'text-rose-600 font-bold' : (m.status === 'At Risk' ? 'text-amber-600 font-bold' : '')}">${m.forecastDate}</td>
                      <td class="py-2 px-3 text-center">
                        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${m.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : (m.status === 'Late / Delayed' || m.status === 'Delayed') ? 'bg-rose-100 text-rose-800' : (m.status === 'At Risk' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800')}">${m.status}</span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `;
      } else if (state.selectedKpiTile === 'finance') {
        tileTitle = `Financial Burn Drill-Down — Budget vs Actuals (${projectsWithFinance} of ${totalProjects} Projects Configured)`;
        tileContent = `
          <div class="overflow-x-auto max-w-full max-h-[340px] overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b sticky top-0 z-10">
                <tr>
                  <th class="py-2 px-3">Project</th>
                  <th class="py-2 px-3">Approved Budget</th>
                  <th class="py-2 px-3">Actuals YTD</th>
                  <th class="py-2 px-3">Plan CY</th>
                  <th class="py-2 px-3">Variance</th>
                  <th class="py-2 px-3 text-center">Burn %</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                ${projects.map(p => {
                  const fin = financials.find(f => f.projectId === p.id);
                  if (!fin) {
                    return `
                      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-400">
                        <td class="py-2 px-3 font-semibold">${p.title} (${p.code})</td>
                        <td colspan="5" class="py-2 px-3 italic">No finance ledger rows in PPM_FIN_ProjectFinancials</td>
                      </tr>
                    `;
                  }
                  const approved = fin.totalApprovedBudget || 0;
                  const actual = fin.actualsToDate || 0;
                  const pBurn = approved > 0 ? Math.round((actual / approved) * 100) : 0;
                  return `
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td class="py-2 px-3 font-semibold text-slate-900 dark:text-white">${p.title} (${p.code})</td>
                      <td class="py-2 px-3 font-mono">${formatCurrency(approved)}</td>
                      <td class="py-2 px-3 font-mono font-bold">${formatCurrency(actual)}</td>
                      <td class="py-2 px-3 font-mono text-slate-500">${formatCurrency((fin.capexPlanCurrentYear || 0) + (fin.opexPlanCurrentYear || 0))}</td>
                      <td class="py-2 px-3 font-mono ${fin.variance < 0 ? 'text-rose-600 font-bold' : 'text-emerald-600'}">${formatCurrency(fin.variance)}</td>
                      <td class="py-2 px-3 text-center font-mono font-bold ${pBurn > 90 ? 'text-rose-600' : 'text-blue-600'}">${pBurn}%</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `;
      } else if (state.selectedKpiTile === 'blockers') {
        tileTitle = `Active Blockers Drill-Down — Critical & High Severity Issues (${allBlockers.length} Active)`;
        tileContent = `
          <div class="overflow-x-auto max-w-full max-h-[340px] overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b sticky top-0 z-10">
                <tr>
                  <th class="py-2 px-3">Type</th>
                  <th class="py-2 px-3">Title & Summary</th>
                  <th class="py-2 px-3">Project</th>
                  <th class="py-2 px-3">Severity</th>
                  <th class="py-2 px-3">Owner</th>
                  <th class="py-2 px-3">Mitigation Strategy</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                ${allBlockers.map(b => `
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td class="py-2 px-3">
                      <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${b.itemType === 'Issue' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}">${b.itemType}</span>
                    </td>
                    <td class="py-2 px-3 font-semibold text-slate-900 dark:text-white">${b.title}</td>
                    <td class="py-2 px-3 text-slate-500">${b.projectTitle}</td>
                    <td class="py-2 px-3">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${b.severity === 'Critical' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-800'}">${b.severity}</span>
                    </td>
                    <td class="py-2 px-3">${b.owner}</td>
                    <td class="py-2 px-3 text-slate-600 dark:text-slate-400">${b.strategy || 'Under review with Project Sponsor'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      } else if (state.selectedKpiTile === 'phase') {
        tileTitle = 'Phase Distribution Drill-Down — Projects Across Lifecycle Stages';
        tileContent = `
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
            ${phaseList.map(phase => {
              const phaseProjects = projects.filter(p => p.phase === phase);
              return `
                <div class="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div class="flex items-center justify-between font-bold text-xs pb-1.5 border-b border-slate-200 dark:border-slate-700">
                    <span class="text-slate-800 dark:text-slate-200">${phase}</span>
                    <span class="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px]">${phaseProjects.length}</span>
                  </div>
                  <div class="mt-2 space-y-2">
                    ${phaseProjects.length > 0 ? phaseProjects.map(p => `
                      <div class="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-xs shadow-2xs">
                        <div class="font-semibold text-slate-900 dark:text-white">${p.title}</div>
                        <div class="flex items-center justify-between mt-1 text-[11px]">
                          <span class="font-mono text-slate-400">${p.code}</span>
                          ${getRagBadge(p.ragOverall, false)}
                        </div>
                      </div>
                    `).join('') : '<div class="text-[11px] text-slate-400 italic py-2">No projects</div>'}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }

      drillDownHtml = `
        <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border-2 border-blue-500/80 shadow-md mb-5">
          <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-700">
            <div class="flex items-center gap-2">
              <span class="text-base">🔍</span>
              <h4 class="font-bold text-sm text-slate-900 dark:text-white">${tileTitle}</h4>
            </div>
            <button id="btn-close-kpi-drilldown" class="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 transition">
              ✕ Close Drill-down
            </button>
          </div>
          ${tileContent}
        </div>
      `;
    }

    container.innerHTML = `
      <!-- My Portfolio Manager Header -->
      <div class="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-blue-900/10 via-indigo-900/5 to-transparent p-4 rounded-xl border border-blue-200/60 dark:border-blue-900/40">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-lg">🧭</span>
            <h2 class="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              ${isMyProjects ? 'My Projects — Project Leader & Sponsor Workspace' : 'My Portfolio — Portfolio Dashboard'}
            </h2>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${isMyProjects ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800'}">
              ${isMyProjects ? 'Assigned Initiatives' : 'Portfolio Owner View'}
            </span>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">
            ${isMyProjects
              ? 'Filtered workspace for projects where you are Project Leader, Sponsor, or Deputy with upcoming phase gates and monthly actuals.'
              : 'Real-time delivery KPIs, milestone variance, budget burn, and active blockers for your assigned portfolio.'}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <!-- Subview toggle pills: My Projects (Default) vs All Portfolio -->
          <div class="inline-flex rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-0.5 shadow-2xs">
            <button id="btn-subview-my" class="px-2.5 py-1 text-xs font-semibold rounded-md transition ${isMyProjects ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}" title="Filter to projects assigned to you">
              My Projects (${myProjects.length})
            </button>
            <button id="btn-subview-all" class="px-2.5 py-1 text-xs font-semibold rounded-md transition ${!isMyProjects ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}" title="View all portfolio initiatives">
              All Portfolio (${allPortfolioProjects.length})
            </button>
          </div>

          <div class="flex items-center gap-1.5">
            <label class="text-xs font-semibold text-slate-500">Scope:</label>
            <select id="select-my-portfolio" class="text-xs font-semibold py-1 px-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-2xs">
              <option value="all" ${state.selectedPortfolio === 'all' ? 'selected' : ''}>All Portfolios (${state.data.projects.length})</option>
              ${state.data.portfolios.filter(p => p.id !== 'all').map(p => {
                const cnt = state.data.projects.filter(prj => prj.portfolio === p.id || prj.portfolioName === p.name).length;
                return `<option value="${p.id}" ${state.selectedPortfolio === p.id || state.selectedPortfolio === p.name ? 'selected' : ''}>${p.name} (${cnt})</option>`;
              }).join('')}
            </select>
          </div>
        </div>
      </div>

      <!-- 5 Interactive KPI Drill-Down Tiles -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5 select-none">
        
        <!-- Tile 1: RAG Health -->
        <div data-kpi="rag" class="kpi-tile cursor-pointer p-3.5 rounded-xl border transition-all hover:scale-[1.02] ${state.selectedKpiTile === 'rag' ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs hover:border-blue-300'}">
          <div class="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>RAG Health</span>
            <span class="text-xs">🚦</span>
          </div>
          <div class="text-xl font-black text-slate-900 dark:text-white mt-1.5 flex items-baseline gap-1.5">
            <span class="text-emerald-600">${greenProjects.length}G</span>
            <span class="text-amber-500 text-base font-bold">${yellowProjects.length}A</span>
            <span class="text-rose-600 text-base font-bold">${redProjects.length}R</span>
          </div>
          <div class="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-2 flex items-center justify-between">
            <span>Worst RAG score</span>
            <span>Inspect ▾</span>
          </div>
        </div>

        <!-- Tile 2: On-Time Health -->
        <div data-kpi="schedule" class="kpi-tile cursor-pointer p-3.5 rounded-xl border transition-all hover:scale-[1.02] ${state.selectedKpiTile === 'schedule' ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs hover:border-blue-300'}">
          <div class="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>On-Time Delivery</span>
            <span class="text-xs">⏱️</span>
          </div>
          <div class="text-xl font-black text-slate-900 dark:text-white mt-1.5 flex items-baseline gap-1">
            <span class="${onTimePct >= 80 ? 'text-emerald-600' : 'text-amber-600'}">${onTimePct}%</span>
            <span class="text-[10px] text-slate-400 font-normal">On Track</span>
          </div>
          <div class="text-[10px] ${delayedMilestones.length > 0 ? 'text-rose-600 font-bold' : 'text-slate-500'} mt-2 flex items-center justify-between">
            <span>${delayedMilestones.length} delayed gates</span>
            <span class="text-blue-600">Inspect ▾</span>
          </div>
        </div>

        <!-- Tile 3: Financial Burn -->
        <div data-kpi="finance" class="kpi-tile cursor-pointer p-3.5 rounded-xl border transition-all hover:scale-[1.02] ${state.selectedKpiTile === 'finance' ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs hover:border-blue-300'}">
          <div class="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Financial Burn</span>
            <span class="text-xs">💰</span>
          </div>
          <div class="text-xl font-black text-slate-900 dark:text-white mt-1.5 flex items-baseline gap-1">
            <span class="text-blue-600">${burnPct}%</span>
            <span class="text-[10px] text-slate-400 font-normal">of budget</span>
          </div>
          <div class="text-[10px] text-slate-500 mt-2 flex items-center justify-between">
            <span class="font-medium text-emerald-600 dark:text-emerald-400">${projectsWithFinance} of ${totalProjects} have Finance data</span>
            <span class="text-blue-600">Inspect ▾</span>
          </div>
        </div>

        <!-- Tile 4: Active Blockers -->
        <div data-kpi="blockers" class="kpi-tile cursor-pointer p-3.5 rounded-xl border transition-all hover:scale-[1.02] ${state.selectedKpiTile === 'blockers' ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs hover:border-blue-300'}">
          <div class="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Active Blockers</span>
            <span class="text-xs">⚠️</span>
          </div>
          <div class="text-xl font-black text-rose-600 dark:text-rose-400 mt-1.5 flex items-baseline gap-1">
            <span>${allBlockers.length}</span>
            <span class="text-[10px] text-slate-400 font-normal">Blockers</span>
          </div>
          <div class="text-[10px] text-slate-500 mt-2 flex items-center justify-between">
            <span>${criticalBlockers.length} Critical • ${highBlockers.length} High</span>
            <span class="text-blue-600">Inspect ▾</span>
          </div>
        </div>

        <!-- Tile 5: Phase Distribution -->
        <div data-kpi="phase" class="kpi-tile cursor-pointer p-3.5 rounded-xl border transition-all hover:scale-[1.02] ${state.selectedKpiTile === 'phase' ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs hover:border-blue-300'}">
          <div class="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Phase Overview</span>
            <span class="text-xs">📊</span>
          </div>
          <div class="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
            ${phaseCounts['Execute']} Executing • ${phaseCounts['Plan']} Planning
          </div>
          <div class="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-2 flex items-center justify-between">
            <span>Lifecycle gates</span>
            <span>Inspect ▾</span>
          </div>
        </div>
      </div>

      <!-- Swap Area: Drill-Down Panel OR Secondary Cards -->
      ${drillDownHtml ? drillDownHtml : `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
          
          <!-- Secondary Card A: Reporting Compliance -->
          <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
              <div class="flex items-center gap-2">
                <span class="text-sm">📅</span>
                <h4 class="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Reporting Cadence & Governance</h4>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">100% Up to Date</span>
            </div>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              All active projects have submitted their required monthly status reports for the current cycle. Next reporting deadline is scheduled in <strong>12 days</strong>.
            </p>
            <div class="space-y-1.5 text-xs">
              ${statusReports.slice(0, 3).map(s => {
                const prj = projects.find(p => p.id === s.projectId) || state.data.projects.find(p => p.id === s.projectId);
                return `
                <div class="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <span class="font-semibold text-slate-800 dark:text-slate-200">${prj ? prj.code : 'PRJ'} — ${s.period || s.reportingMonth} Report</span>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] text-slate-400 font-mono">Submitted ${s.submittedDate}</span>
                    ${getRagBadge(s.rag, false)}
                  </div>
                </div>
              `;
              }).join('')}
            </div>
          </div>

          <!-- Secondary Card B: Upcoming Governance Phase Gates -->
          <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
              <div class="flex items-center gap-2">
                <span class="text-sm">🔒</span>
                <h4 class="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Upcoming Governance Phase Gates</h4>
              </div>
              <span class="text-xs text-blue-600 font-semibold font-mono">${upcomingGates.length} Pending Gate${upcomingGates.length === 1 ? '' : 's'}</span>
            </div>
            <div class="space-y-2 text-xs mt-3">
              ${upcomingGates.length === 0 ? `
                <div class="p-3 text-center text-slate-400 dark:text-slate-500 italic text-xs">
                  All governance phase gates completed for current phase.
                </div>
              ` : upcomingGates.slice(0, 4).map(m => {
                const prj = projects.find(p => p.id === m.projectId) || state.data.projects.find(p => p.id === m.projectId);
                return `
                  <div class="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <div>
                      <div class="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>🔒</span>
                        <span>${m.title}</span>
                      </div>
                      <div class="text-[10px] text-slate-400 mt-0.5">${prj ? prj.title : ''} • Phase: ${m.phase}</div>
                    </div>
                    <div class="text-right font-mono text-[11px]">
                      <div class="${(m.status === 'Late / Delayed' || m.status === 'Delayed') ? 'text-rose-600 font-bold' : (m.status === 'At Risk' ? 'text-amber-600 font-bold' : 'text-slate-700 dark:text-slate-300')}">${m.forecastDate}</div>
                      <div class="text-[9px] text-slate-400">Baseline: ${m.baselineDate}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `}

      <!-- Permanent Master Project Roster -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden max-w-full">
        <div class="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div class="flex items-center gap-2">
            <span class="text-sm">📋</span>
            <h4 class="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              ${isMyProjects ? 'My Assigned Projects (Project Leader & Sponsor View)' : 'Portfolio Project Master Roster'}
            </h4>
            <span class="text-xs px-2 py-0.5 rounded-full ${isMyProjects ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-bold' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 font-semibold'}">
              ${projects.length} Projects
            </span>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span class="text-[11px] text-slate-400">Click any row to open Project Workspace</span>
          </div>
        </div>

        <div class="overflow-x-auto max-w-full max-h-[380px] overflow-y-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50/95 dark:bg-slate-900/95 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 backdrop-blur-xs">
              <tr>
                <th class="py-2.5 px-3">Project</th>
                <th class="py-2.5 px-3">Portfolio</th>
                <th class="py-2.5 px-3">Project Leader & Deputy</th>
                <th class="py-2.5 px-2 text-center">Phase</th>
                <th class="py-2.5 px-3 text-center">RAG</th>
                <th class="py-2.5 px-3">Next Key Gate</th>
                <th class="py-2.5 px-3 text-right">Budget Burn</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              ${projects.map(p => {
                const fin = financials.find(f => f.projectId === p.id);
                const approved = fin ? fin.totalApprovedBudget : 0;
                const actual = fin ? fin.actualsToDate : 0;
                const pBurn = approved > 0 ? Math.round((actual / approved) * 100) : 0;
                const prjGates = milestones
                  .filter(m => m.projectId === p.id && (m.isPhaseGate || m.eventType === 'Gate' || (m.title && m.title.toLowerCase().includes('gate'))) && m.status !== 'Completed')
                  .sort((a, b) => (a.forecastDate || '').localeCompare(b.forecastDate || ''));
                const nextM = prjGates.length > 0 ? prjGates[0] : null;

                return `
                  <tr data-id="${p.id}" class="project-row hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors">
                    <td class="py-2.5 px-3">
                      <div class="font-bold text-slate-900 dark:text-white">${p.title}</div>
                      <div class="font-mono text-[10px] text-slate-400">${p.code}</div>
                    </td>
                    <td class="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-medium">${p.portfolio}</td>
                    <td class="py-2.5 px-3">
                      <div class="text-slate-800 dark:text-slate-200 font-medium">${p.lead}</div>
                      ${p.deputy ? `<div class="text-[10px] text-slate-400">Dep: ${p.deputy}</div>` : ''}
                    </td>
                    <td class="py-2.5 px-2 text-center">
                      <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        ${p.phase}
                      </span>
                    </td>
                    <td class="py-2.5 px-3 text-center">${getRagBadge(p.ragOverall)}</td>
                    <td class="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      ${nextM ? `
                        <div class="font-medium flex items-center gap-1">
                          <span>${getMilestoneIcon(nextM.eventType, nextM.isPhaseGate)}</span>
                          <span>${nextM.title}</span>
                        </div>
                        <div class="text-[10px] font-mono text-slate-400">${nextM.forecastDate}</div>
                      ` : '<span class="text-slate-400 italic">All gates complete</span>'}
                    </td>
                    <td class="py-2.5 px-3 text-right">
                      ${fin ? `
                        <div class="font-mono font-bold text-slate-800 dark:text-slate-200">${pBurn}%</div>
                        <div class="w-20 bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full ml-auto mt-1 overflow-hidden">
                          <div style="width: ${Math.min(100, pBurn)}%" class="${pBurn > 90 ? 'bg-rose-500' : 'bg-blue-600'} h-full"></div>
                        </div>
                      ` : '<span class="text-slate-400 italic text-[10px]">No data</span>'}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Event bindings for My Portfolio:
    const subviewAll = el('btn-subview-all');
    if (subviewAll) {
      subviewAll.onclick = () => {
        state.portfolioSubView = 'all';
        renderKPIBar();
        renderMyPortfolioView();
      };
    }

    const subviewMy = el('btn-subview-my');
    if (subviewMy) {
      subviewMy.onclick = () => {
        state.portfolioSubView = 'my';
        renderKPIBar();
        renderMyPortfolioView();
      };
    }

    const selPortfolio = el('select-my-portfolio');
    if (selPortfolio) {
      selPortfolio.onchange = () => {
        state.selectedPortfolio = selPortfolio.value;
        renderKPIBar();
        renderMyPortfolioView();
      };
    }

    // KPI tile click handlers
    container.querySelectorAll('.kpi-tile').forEach(tile => {
      tile.onclick = () => {
        const kpi = tile.getAttribute('data-kpi');
        if (state.selectedKpiTile === kpi) {
          state.selectedKpiTile = null;
        } else {
          state.selectedKpiTile = kpi;
        }
        renderMyPortfolioView();
      };
    });

    // Close drill-down button
    const closeDrillBtn = el('btn-close-kpi-drilldown');
    if (closeDrillBtn) {
      closeDrillBtn.onclick = () => {
        state.selectedKpiTile = null;
        renderMyPortfolioView();
      };
    }

    // Open from drill-down table
    container.querySelectorAll('.btn-open-from-drill').forEach(btn => {
      btn.onclick = () => {
        const id = parseInt(btn.getAttribute('data-drill-id'));
        state.selectedProjectId = id;
        state.projectDrawerTab = 'overview';
        renderProjectDrawer();
      };
    });

    // Project row click
    container.querySelectorAll('.project-row').forEach(row => {
      row.onclick = () => {
        const id = parseInt(row.getAttribute('data-id'));
        state.selectedProjectId = id;
        state.projectDrawerTab = 'overview';
        renderProjectDrawer();
      };
    });
  }

  function getFilteredMilestones() {
    let list = state.data.milestones || [];

    // Filter strictly by active portfolio selection (do not inherit search query or RAG filters from portfolio tab)
    let validProjects = state.data.projects;
    if (state.selectedPortfolios && state.selectedPortfolios.length > 0 && !state.selectedPortfolios.includes('__none__')) {
      validProjects = validProjects.filter(p => 
        state.selectedPortfolios.some(pf =>
          pf === p.portfolio || pf === p.portfolioName ||
          (p.portfolio && p.portfolio.toLowerCase() === pf.toLowerCase()) ||
          (p.portfolioName && p.portfolioName.toLowerCase() === pf.toLowerCase())
        )
      );
    } else if (state.selectedPortfolio && state.selectedPortfolio !== 'all') {
      validProjects = validProjects.filter(p => p.portfolio === state.selectedPortfolio || p.portfolioName === state.selectedPortfolio);
    }
    const activeProjectIds = validProjects.map(p => p.id);
    list = list.filter(m => activeProjectIds.includes(m.projectId));

    // Project filter
    if (state.milestoneProjectFilter && state.milestoneProjectFilter !== 'all') {
      const pid = parseInt(state.milestoneProjectFilter);
      list = list.filter(m => m.projectId === pid);
    }

    // Type filter
    if (state.milestoneTypeFilter && state.milestoneTypeFilter !== 'all') {
      if (state.milestoneTypeFilter === 'gates') {
        list = list.filter(m => m.eventType === 'Gate');
      } else if (state.milestoneTypeFilter === 'golive') {
        list = list.filter(m => m.eventType === 'Go-Live' || m.eventType === 'Launch');
      } else if (state.milestoneTypeFilter === 'testing') {
        list = list.filter(m => m.eventType === 'Test' || m.eventType === 'UAT');
      } else if (state.milestoneTypeFilter === 'signoff') {
        list = list.filter(m => m.eventType === 'Sign-off' || m.eventType === 'Approval' || m.eventType === 'Submission');
      } else if (state.milestoneTypeFilter === 'technical') {
        list = list.filter(m => m.eventType === 'Technical');
      }
    }

    // Status filter
    if (state.milestoneStatusFilter && state.milestoneStatusFilter !== 'all') {
      if (state.milestoneStatusFilter === 'delayed_at_risk') {
        list = list.filter(m => m.status === 'Late / Delayed' || m.status === 'Delayed' || m.status === 'At Risk');
      } else if (state.milestoneStatusFilter === 'delayed') {
        list = list.filter(m => m.status === 'Late / Delayed' || m.status === 'Delayed');
      } else if (state.milestoneStatusFilter === 'at_risk') {
        list = list.filter(m => m.status === 'At Risk');
      } else if (state.milestoneStatusFilter === 'on_track') {
        list = list.filter(m => m.status === 'On Track');
      } else if (state.milestoneStatusFilter === 'completed') {
        list = list.filter(m => m.status === 'Completed');
      } else if (state.milestoneStatusFilter === 'planned') {
        list = list.filter(m => m.status === 'Planned');
      }
    }

    // Search query
    if (state.milestoneSearchQuery && state.milestoneSearchQuery.trim()) {
      const q = state.milestoneSearchQuery.toLowerCase().trim();
      list = list.filter(m => {
        const project = state.data.projects.find(p => p.id === m.projectId);
        const matchTitle = m.title && m.title.toLowerCase().includes(q);
        const matchCode = m.milestoneId && m.milestoneId.toLowerCase().includes(q);
        const matchPrj = project && (project.title.toLowerCase().includes(q) || project.code.toLowerCase().includes(q));
        const matchType = m.eventType && m.eventType.toLowerCase().includes(q);
        const matchPhase = m.phase && m.phase.toLowerCase().includes(q);
        return matchTitle || matchCode || matchPrj || matchType || matchPhase;
      });
    }

    return list;
  }

  function exportFilteredMilestonesCSV() {
    const milestones = getFilteredMilestones();
    const rows = [
      ['Milestone ID', 'Title', 'Project Code', 'Project Title', 'Type', 'Phase Gate', 'Phase', 'Baseline Date', 'Forecast Date', 'Actual Date', 'Status']
    ];
    milestones.forEach(m => {
      const p = state.data.projects.find(prj => prj.id === m.projectId) || {};
      rows.push([
        `"${m.milestoneId || ''}"`,
        `"${(m.title || '').replace(/"/g, '""')}"`,
        `"${p.code || ''}"`,
        `"${(p.title || '').replace(/"/g, '""')}"`,
        `"${m.eventType || ''}"`,
        m.isPhaseGate ? 'Yes' : 'No',
        `"${m.phase || ''}"`,
        `"${m.baselineDate || ''}"`,
        `"${m.forecastDate || ''}"`,
        `"${m.actualDate || ''}"`,
        `"${m.status || ''}"`
      ]);
    });
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PPM_Milestones_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function renderAllMilestonesView() {
    const container = el('webpart-view-container');
    if (!container) return;

    let validProjects = state.data.projects;
    if (state.selectedPortfolios && state.selectedPortfolios.length > 0 && !state.selectedPortfolios.includes('__none__')) {
      validProjects = validProjects.filter(p => 
        state.selectedPortfolios.some(pf =>
          pf === p.portfolio || pf === p.portfolioName ||
          (p.portfolio && p.portfolio.toLowerCase() === pf.toLowerCase()) ||
          (p.portfolioName && p.portfolioName.toLowerCase() === pf.toLowerCase())
        )
      );
    } else if (state.selectedPortfolio && state.selectedPortfolio !== 'all') {
      validProjects = validProjects.filter(p => p.portfolio === state.selectedPortfolio || p.portfolioName === state.selectedPortfolio);
    }
    const activeProjects = validProjects;
    const milestones = getFilteredMilestones();

    const totalActiveMilestones = state.data.milestones.filter(m => activeProjects.some(p => p.id === m.projectId)).length;
    const totalGateCount = state.data.milestones.filter(m => activeProjects.some(p => p.id === m.projectId) && m.eventType === 'Gate').length;
    const totalGoLiveCount = state.data.milestones.filter(m => activeProjects.some(p => p.id === m.projectId) && (m.eventType === 'Go-Live' || m.eventType === 'Launch')).length;
    const totalDelayedAtRiskCount = state.data.milestones.filter(m => activeProjects.some(p => p.id === m.projectId) && (m.status === 'Late / Delayed' || m.status === 'Delayed' || m.status === 'At Risk')).length;
    const totalTestingCount = state.data.milestones.filter(m => activeProjects.some(p => p.id === m.projectId) && (m.eventType === 'Test' || m.eventType === 'UAT')).length;
    const totalSignoffCount = state.data.milestones.filter(m => activeProjects.some(p => p.id === m.projectId) && (m.eventType === 'Sign-off' || m.eventType === 'Approval' || m.eventType === 'Submission')).length;

    const phaseGateCount = milestones.filter(m => m.eventType === 'Gate').length;
    const onTrackCount = milestones.filter(m => m.status === 'On Track').length;
    const delayedCount = milestones.filter(m => m.status === 'Late / Delayed' || m.status === 'Delayed').length;
    const atRiskCount = milestones.filter(m => m.status === 'At Risk').length;
    const completedCount = milestones.filter(m => m.status === 'Completed').length;

    const hasActiveFilters = state.milestoneTypeFilter !== 'all' || 
                             state.milestoneStatusFilter !== 'all' || 
                             state.milestoneProjectFilter !== 'all' || 
                             (state.milestoneSearchQuery && state.milestoneSearchQuery.trim() !== '') ||
                             state.milestonePreset !== 'all';

    container.innerHTML = `
      <!-- Header -->
      <div class="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-lg">🎯</span>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">All Milestones & Key Deliverables</h3>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Single Source of Truth for Stakeholders
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Master milestone register across all projects. Filter by governance phase gates, business go-lives, technical milestones, or schedule drift.
          </p>
        </div>
          <button id="btn-export-milestones" disabled title="Export register is active in the installed solution package" class="px-2.5 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-400 flex items-center gap-1.5 shadow-2xs cursor-not-allowed opacity-75">
            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <span>Export Register (.csv)</span>
            <span class="text-[9px] font-bold px-1 py-0.2 rounded bg-slate-200/80 text-slate-500">App</span>
          </button>
          <button id="btn-snapshot-now" class="px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 shadow-2xs transition">
            <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
            <span>Capture Snapshot</span>
          </button>
        </div>
      </div>

      <!-- Stakeholder Persona Quick Presets -->
      <div class="mb-3 flex items-center gap-1.5 flex-wrap">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Views:</span>
        <button data-preset="all" class="btn-milestone-preset px-2.5 py-1 text-xs rounded-full font-semibold transition ${state.milestonePreset === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}">
          All Milestones (${totalActiveMilestones})
        </button>
        <button data-preset="gates" class="btn-milestone-preset px-2.5 py-1 text-xs rounded-full font-semibold transition ${state.milestonePreset === 'gates' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}">
          🔒 Governance Phase Gates (${totalGateCount})
        </button>
        <button data-preset="golive" class="btn-milestone-preset px-2.5 py-1 text-xs rounded-full font-semibold transition ${state.milestonePreset === 'golive' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}">
          🚀 Go-Live & Releases (${totalGoLiveCount})
        </button>
        <button data-preset="delayed" class="btn-milestone-preset px-2.5 py-1 text-xs rounded-full font-semibold transition ${state.milestonePreset === 'delayed' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}">
          ⚠️ Delayed & At Risk (${totalDelayedAtRiskCount})
        </button>
        <button data-preset="testing" class="btn-milestone-preset px-2.5 py-1 text-xs rounded-full font-semibold transition ${state.milestonePreset === 'testing' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}">
          🧪 Testing & UAT (${totalTestingCount})
        </button>
        <button data-preset="signoff" class="btn-milestone-preset px-2.5 py-1 text-xs rounded-full font-semibold transition ${state.milestonePreset === 'signoff' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}">
          📝 Approvals & Sign-offs (${totalSignoffCount})
        </button>
      </div>

      <!-- Filter Controls Row -->
      <div class="mb-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div class="flex flex-wrap items-center gap-2">
          <!-- Type Filter -->
          <div class="flex items-center gap-1.5">
            <label class="font-semibold text-slate-500">Type:</label>
            <select id="select-milestone-type" class="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs">
              <option value="all" ${state.milestoneTypeFilter === 'all' ? 'selected' : ''}>All Types</option>
              <option value="gates" ${state.milestoneTypeFilter === 'gates' ? 'selected' : ''}>🔒 Phase Gates (Governance)</option>
              <option value="golive" ${state.milestoneTypeFilter === 'golive' ? 'selected' : ''}>🚀 Go-Live & Releases</option>
              <option value="testing" ${state.milestoneTypeFilter === 'testing' ? 'selected' : ''}>🧪 Testing & UAT</option>
              <option value="signoff" ${state.milestoneTypeFilter === 'signoff' ? 'selected' : ''}>📝 Sign-offs & Approvals</option>
              <option value="technical" ${state.milestoneTypeFilter === 'technical' ? 'selected' : ''}>🔧 Technical Deliverables</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div class="flex items-center gap-1.5">
            <label class="font-semibold text-slate-500">Status:</label>
            <select id="select-milestone-status" class="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs">
              <option value="all" ${state.milestoneStatusFilter === 'all' ? 'selected' : ''}>All Statuses</option>
              <option value="delayed_at_risk" ${state.milestoneStatusFilter === 'delayed_at_risk' ? 'selected' : ''}>⚠️ Delayed & At Risk</option>
              <option value="delayed" ${state.milestoneStatusFilter === 'delayed' ? 'selected' : ''}>🔴 Delayed Only</option>
              <option value="at_risk" ${state.milestoneStatusFilter === 'at_risk' ? 'selected' : ''}>🟠 At Risk Only</option>
              <option value="on_track" ${state.milestoneStatusFilter === 'on_track' ? 'selected' : ''}>🟢 On Track</option>
              <option value="planned" ${state.milestoneStatusFilter === 'planned' ? 'selected' : ''}>⚪ Planned</option>
              <option value="completed" ${state.milestoneStatusFilter === 'completed' ? 'selected' : ''}>✅ Completed</option>
            </select>
          </div>

          <!-- Project Filter -->
          <div class="flex items-center gap-1.5">
            <label class="font-semibold text-slate-500">Project:</label>
            <select id="select-milestone-project" class="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs max-w-xs truncate">
              <option value="all" ${state.milestoneProjectFilter === 'all' ? 'selected' : ''}>All Projects (${activeProjects.length})</option>
              ${activeProjects.map(p => `
                <option value="${p.id}" ${state.milestoneProjectFilter === String(p.id) ? 'selected' : ''}>${p.code}: ${p.title}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Search and Reset -->
        <div class="flex items-center gap-2">
          <div class="relative">
            <input id="input-milestone-search" type="text" value="${state.milestoneSearchQuery}" placeholder="Search deliverable, code..." class="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg pl-7 pr-3 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 w-48 shadow-2xs" />
            <svg class="w-3.5 h-3.5 absolute left-2 top-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          ${hasActiveFilters ? `
            <button id="btn-reset-milestone-filters" class="px-2 py-1 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 font-semibold cursor-pointer underline text-[11px]">
              Reset
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Quick Metrics Summary -->
      <div class="mb-3 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
        <span>Showing <strong>${milestones.length}</strong> of ${totalActiveMilestones} deliverables</span>
        <span class="text-slate-300 dark:text-slate-600">|</span>
        <span class="text-purple-700 dark:text-purple-400 font-semibold">${phaseGateCount} Phase Gates</span>
        <span class="text-slate-300 dark:text-slate-600">|</span>
        <span class="text-emerald-700 dark:text-emerald-400 font-semibold">${onTrackCount} On Track</span>
        <span class="text-slate-300 dark:text-slate-600">|</span>
        <span class="${delayedCount > 0 ? 'text-rose-700 dark:text-rose-400 font-bold' : 'text-slate-500'}">${delayedCount} Delayed</span>
        <span class="text-slate-300 dark:text-slate-600">|</span>
        <span class="${atRiskCount > 0 ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-slate-500'}">${atRiskCount} At Risk</span>
        <span class="text-slate-300 dark:text-slate-600">|</span>
        <span class="text-slate-700 dark:text-slate-300">${completedCount} Completed</span>
      </div>

      <!-- Table View -->
      <div class="overflow-x-auto max-w-full max-h-[460px] overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg shadow-xs">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50/95 dark:bg-slate-800/95 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700 select-none sticky top-0 z-10 backdrop-blur-xs">
            <tr>
              <th class="py-2.5 px-3">Milestone / Deliverable</th>
              <th class="py-2.5 px-3">Project</th>
              <th class="py-2.5 px-3">Type / Gate</th>
              <th class="py-2.5 px-3">Baseline</th>
              <th class="py-2.5 px-3">Forecast</th>
              <th class="py-2.5 px-3">Actual Date</th>
              <th class="py-2.5 px-3 text-center">Status</th>
              <th class="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
            ${milestones.length === 0 ? `
              <tr>
                <td colspan="8" class="py-12 text-center text-slate-500 dark:text-slate-400">
                  <p class="text-sm font-semibold">No milestones match your current filter combination.</p>
                  <button id="btn-empty-reset-milestones" class="mt-2 text-xs text-blue-600 hover:underline font-medium">Clear filters and show all</button>
                </td>
              </tr>
            ` : milestones.map(m => {
              const project = state.data.projects.find(p => p.id === m.projectId) || {};
              const baselineVariance = m.baselineVarianceDays !== undefined ? m.baselineVarianceDays : (m.baselineDate && m.forecastDate && m.forecastDate > m.baselineDate ? Math.min(14, getDaysDifference(m.forecastDate, m.baselineDate)) : 0);
              const forecastVariance = getDaysDifference(m.forecastDate, m.baselineDate);
              const actualVariance = m.actualDate ? getDaysDifference(m.actualDate, m.baselineDate) : null;
              const style = getMilestoneStatusStyle(m.status);
              return `
                <tr class="milestone-data-row hover:bg-blue-50/50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors" data-project-id="${m.projectId}">
                  <td class="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                    <div class="flex items-center gap-2">
                      <span class="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 text-xs shrink-0">
                        ${getMilestoneIcon(m.eventType, m.isPhaseGate)}
                      </span>
                      <div>
                        <div class="font-semibold text-slate-900 dark:text-white">${m.title}</div>
                        ${m.milestoneId ? `<div class="text-[10px] font-mono text-slate-400 mt-0.5">${m.milestoneId}</div>` : ''}
                      </div>
                    </div>
                  </td>
                  <td class="py-2.5 px-3">
                    <div class="font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600">${project.title || '—'}</div>
                    <div class="text-[10px] font-mono text-slate-400">${project.code || ''}</div>
                  </td>
                  <td class="py-2.5 px-3 whitespace-nowrap">
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${
                      m.eventType === 'Gate' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800' 
                        : (m.eventType === 'Go-Live' || m.eventType === 'Launch')
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : (m.eventType === 'Test' || m.eventType === 'UAT')
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : (m.eventType === 'Sign-off' || m.eventType === 'Approval' || m.eventType === 'Submission')
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }">
                      ${m.eventType === 'Gate' ? 'Phase Gate' : (m.eventType || m.phase)}
                    </span>
                  </td>
                  <td class="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">
                    <div class="flex items-center gap-1">
                      <span>${formatEuropeanDate(m.baselineDate)}</span>
                      ${renderVarianceBadge(baselineVariance, true)}
                    </div>
                  </td>
                  <td class="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">
                    <div class="flex items-center gap-1">
                      <span>${formatEuropeanDate(m.forecastDate)}</span>
                      ${renderVarianceBadge(forecastVariance, false)}
                    </div>
                  </td>
                  <td class="py-2.5 px-3 font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    ${m.actualDate ? `
                      <div class="flex items-center gap-1">
                        <span>${formatEuropeanDate(m.actualDate)}</span>
                        ${renderVarianceBadge(actualVariance, false)}
                      </div>
                    ` : '—'}
                  </td>
                  <td class="py-2.5 px-3 text-center whitespace-nowrap">
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${style.bg} ${style.text}">
                      <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${style.dot};"></span>
                      <span>${m.status}</span>
                    </span>
                  </td>
                  <td class="py-2.5 px-3 text-right whitespace-nowrap">
                    <button data-project-id="${m.projectId}" class="btn-open-project-milestones text-blue-600 dark:text-blue-400 hover:underline font-semibold text-xs">
                      View Project →
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Preset button handlers
    container.querySelectorAll('.btn-milestone-preset').forEach(btn => {
      btn.onclick = () => {
        const preset = btn.getAttribute('data-preset');
        state.milestonePreset = preset;
        if (preset === 'all') {
          state.milestoneTypeFilter = 'all';
          state.milestoneStatusFilter = 'all';
        } else if (preset === 'gates') {
          state.milestoneTypeFilter = 'gates';
          state.milestoneStatusFilter = 'all';
        } else if (preset === 'golive') {
          state.milestoneTypeFilter = 'golive';
          state.milestoneStatusFilter = 'all';
        } else if (preset === 'delayed') {
          state.milestoneTypeFilter = 'all';
          state.milestoneStatusFilter = 'delayed_at_risk';
        } else if (preset === 'testing') {
          state.milestoneTypeFilter = 'testing';
          state.milestoneStatusFilter = 'all';
        } else if (preset === 'signoff') {
          state.milestoneTypeFilter = 'signoff';
          state.milestoneStatusFilter = 'all';
        }
        renderAllMilestonesView();
      };
    });

    // Type filter select
    const typeSelect = el('select-milestone-type');
    if (typeSelect) {
      typeSelect.onchange = (e) => {
        state.milestoneTypeFilter = e.target.value;
        if (state.milestoneTypeFilter === 'all' && state.milestoneStatusFilter === 'all') {
          state.milestonePreset = 'all';
        } else if (state.milestoneTypeFilter === 'gates' && state.milestoneStatusFilter === 'all') {
          state.milestonePreset = 'gates';
        } else if (state.milestoneTypeFilter === 'golive' && state.milestoneStatusFilter === 'all') {
          state.milestonePreset = 'golive';
        } else if (state.milestoneTypeFilter === 'testing' && state.milestoneStatusFilter === 'all') {
          state.milestonePreset = 'testing';
        } else if (state.milestoneTypeFilter === 'signoff' && state.milestoneStatusFilter === 'all') {
          state.milestonePreset = 'signoff';
        } else {
          state.milestonePreset = 'custom';
        }
        renderAllMilestonesView();
      };
    }

    // Status filter select
    const statusSelect = el('select-milestone-status');
    if (statusSelect) {
      statusSelect.onchange = (e) => {
        state.milestoneStatusFilter = e.target.value;
        if (state.milestoneStatusFilter === 'delayed_at_risk' && state.milestoneTypeFilter === 'all') {
          state.milestonePreset = 'delayed';
        } else if (state.milestoneStatusFilter === 'all' && state.milestoneTypeFilter === 'all') {
          state.milestonePreset = 'all';
        } else {
          state.milestonePreset = 'custom';
        }
        renderAllMilestonesView();
      };
    }

    // Project filter select
    const projectSelect = el('select-milestone-project');
    if (projectSelect) {
      projectSelect.onchange = (e) => {
        state.milestoneProjectFilter = e.target.value;
        renderAllMilestonesView();
      };
    }

    // Search input
    const searchInput = el('input-milestone-search');
    if (searchInput) {
      searchInput.oninput = (e) => {
        state.milestoneSearchQuery = e.target.value;
        // Keep focus by rendering only the table or re-rendering and restoring focus
        renderAllMilestonesView();
        const reInput = el('input-milestone-search');
        if (reInput) {
          reInput.focus();
          reInput.selectionStart = reInput.selectionEnd = reInput.value.length;
        }
      };
    }

    // Reset buttons
    const resetBtn = el('btn-reset-milestone-filters');
    if (resetBtn) {
      resetBtn.onclick = () => {
        state.milestoneTypeFilter = 'all';
        state.milestoneStatusFilter = 'all';
        state.milestoneProjectFilter = 'all';
        state.milestoneSearchQuery = '';
        state.milestonePreset = 'all';
        renderAllMilestonesView();
      };
    }

    const emptyResetBtn = el('btn-empty-reset-milestones');
    if (emptyResetBtn) {
      emptyResetBtn.onclick = () => {
        state.milestoneTypeFilter = 'all';
        state.milestoneStatusFilter = 'all';
        state.milestoneProjectFilter = 'all';
        state.milestoneSearchQuery = '';
        state.milestonePreset = 'all';
        renderAllMilestonesView();
      };
    }

    // Export button (disabled in demo)
    const exportBtn = el('btn-export-milestones');
    if (exportBtn) {
      exportBtn.onclick = (e) => { e.preventDefault(); };
    }

    // Snapshot button
    const snapshotBtn = el('btn-snapshot-now');
    if (snapshotBtn) {
      snapshotBtn.onclick = () => {
        alert('Governance Snapshot captured! Baseline dates and current forecasts locked for audit history.');
      };
    }

    // Open project drawer handlers
    container.querySelectorAll('.milestone-data-row, .btn-open-project-milestones').forEach(el => {
      el.onclick = (e) => {
        e.stopPropagation();
        const pid = parseInt(el.getAttribute('data-project-id'));
        if (pid) {
          state.selectedProjectId = pid;
          state.projectDrawerTab = 'milestones';
          renderProjectDrawer();
        }
      };
    });
  }

  function get3x3CellColor(items) {
    if (!items || items.length === 0) {
      return 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700';
    }
    const hasCritical = items.some(r => r.severity === 'Critical' || (r.rating && r.rating.toLowerCase().includes('critical')));
    const hasHigh = items.some(r => r.severity === 'High' || (r.rating && r.rating.toLowerCase().includes('high')));
    const hasMedium = items.some(r => r.severity === 'Medium' || (r.rating && r.rating.toLowerCase().includes('medium')));
    if (hasCritical || hasHigh) {
      return 'bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-xs';
    }
    if (hasMedium) {
      return 'bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold shadow-xs';
    }
    return 'bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-xs';
  }

  function renderAllRisksIssuesView() {
    const container = el('webpart-view-container');
    if (!container) return;

    const allStatuses = ['Open', 'Monitoring', 'Mitigating', 'Escalated', 'Resolved', 'Closed', 'Accepted'];
    const activeProjectIds = getFilteredProjects().map(p => p.id);
    let risks = state.data.risksIssues.filter(r => activeProjectIds.includes(r.projectId));

    // Dynamic distinct categories and projects for dropdowns
    const distinctCategories = Array.from(new Set(state.data.risksIssues.map(r => r.category).filter(Boolean)));
    const distinctProjects = state.data.projects;

    // 3x3 Risk & Issue Matrix (Likelihood [3,2,1] x Impact [1,2,3])
    const matrix = [
      [[], [], []], // Likelihood 3 (High)
      [[], [], []], // Likelihood 2 (Medium)
      [[], [], []]  // Likelihood 1 (Low)
    ];

    risks.forEach(r => {
      if (r.itemType === 'Issue' && !r.convertedFromRisk && !state.includeConvertedIssues) return;
      const l = Math.min(3, Math.max(1, r.likelihood || 1));
      const i = Math.min(3, Math.max(1, r.impact || 1));
      const lIdx = 3 - l;
      const iIdx = i - 1;
      if (matrix[lIdx] && matrix[lIdx][iIdx]) {
        matrix[lIdx][iIdx].push(r);
      }
    });

    const lLabels = { 3: 'High (3)', 2: 'Medium (2)', 1: 'Low (1)' };
    const iLabels = { 1: 'Low (1)', 2: 'Med (2)', 3: 'High (3)' };

    // Apply all Screenshot 2 filters to table rows
    const displayedRisks = risks.filter(r => {
      if (r.itemType === 'Issue' && !r.convertedFromRisk && !state.includeConvertedIssues) return false;
      if (state.riskProjectFilter !== 'all' && r.projectId !== parseInt(state.riskProjectFilter)) return false;
      if (state.riskTypeFilter !== 'all' && r.itemType.toLowerCase() !== state.riskTypeFilter.toLowerCase()) return false;
      if (state.riskRatingFilter !== 'all' && (r.rating || r.severity || '').toLowerCase() !== state.riskRatingFilter.toLowerCase()) return false;
      if (state.riskCategoryFilter !== 'all' && r.category !== state.riskCategoryFilter) return false;
      if (state.riskOpenOnly && ['Resolved', 'Closed'].includes(r.status)) return false;
      if (state.riskStatusFilter && state.riskStatusFilter.length > 0 && !state.riskStatusFilter.includes(r.status)) return false;
      if (state.selectedRiskCell) {
        const l = Math.min(3, Math.max(1, r.likelihood || 1));
        const i = Math.min(3, Math.max(1, r.impact || 1));
        if (l !== state.selectedRiskCell[0] || i !== state.selectedRiskCell[1]) return false;
      }
      return true;
    });

    function formatRaisedDate(str) {
      if (!str) return '—';
      const parts = str.split('-');
      if (parts.length === 3) {
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const mIdx = parseInt(parts[1], 10) - 1;
        return `${parts[2]} ${months[mIdx] || parts[1]} ${parts[0]}`;
      }
      return str;
    }

    const statusBadgeClass = {
      'Open': 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
      'Monitoring': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      'Mitigating': 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
      'Escalated': 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-200 font-bold',
      'Accepted': 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
      'Resolved': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
      'Closed': 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
    };

    container.innerHTML = `
      <!-- View Header -->
      <div class="mb-4 pb-2 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>All Risks & Issues</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-semibold">${displayedRisks.length} Items</span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">Enterprise PMO risk register and PMBOK 3×3 matrix.</p>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" id="toggle-converted-issues" ${state.includeConvertedIssues ? 'checked' : ''} class="rounded text-blue-600 focus:ring-blue-500">
            <span>Include converted Issues</span>
          </label>
          ${state.selectedRiskCell ? '<button id="btn-clear-matrix-filter" class="text-xs px-2.5 py-1 rounded bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/60 font-semibold text-blue-800 dark:text-blue-200">✕ Clear 3×3 Cell Filter</button>' : ''}
        </div>
      </div>

      <!-- Screenshot 2: Dropdown Filters Row -->
      <div class="mb-3 flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 select-none text-xs">
        <select id="filter-risk-project" class="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-slate-700 dark:text-slate-200 font-medium">
          <option value="all" ${state.riskProjectFilter === 'all' ? 'selected' : ''}>Project (All)</option>
          ${distinctProjects.map(p => `<option value="${p.id}" ${state.riskProjectFilter == p.id ? 'selected' : ''}>${p.title}</option>`).join('')}
        </select>

        <select id="filter-risk-type" class="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-slate-700 dark:text-slate-200 font-medium">
          <option value="all" ${state.riskTypeFilter === 'all' ? 'selected' : ''}>Type (All)</option>
          <option value="risk" ${state.riskTypeFilter === 'risk' ? 'selected' : ''}>Risk</option>
          <option value="issue" ${state.riskTypeFilter === 'issue' ? 'selected' : ''}>Issue</option>
        </select>

        <select id="filter-risk-rating" class="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-slate-700 dark:text-slate-200 font-medium">
          <option value="all" ${state.riskRatingFilter === 'all' ? 'selected' : ''}>Rating (All)</option>
          <option value="critical" ${state.riskRatingFilter === 'critical' ? 'selected' : ''}>Critical</option>
          <option value="high" ${state.riskRatingFilter === 'high' ? 'selected' : ''}>High</option>
          <option value="medium" ${state.riskRatingFilter === 'medium' ? 'selected' : ''}>Medium</option>
          <option value="low" ${state.riskRatingFilter === 'low' ? 'selected' : ''}>Low</option>
        </select>

        <select id="filter-risk-category" class="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-slate-700 dark:text-slate-200 font-medium">
          <option value="all" ${state.riskCategoryFilter === 'all' ? 'selected' : ''}>Category (All)</option>
          ${distinctCategories.map(cat => `<option value="${cat}" ${state.riskCategoryFilter === cat ? 'selected' : ''}>${cat}</option>`).join('')}
        </select>

        <label class="flex items-center gap-1.5 ml-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
          <input type="checkbox" id="filter-risk-open-only" ${state.riskOpenOnly ? 'checked' : ''} class="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer">
          <span>Open only</span>
        </label>
      </div>

      <!-- Screenshot 2: Status Pills Filter Row -->
      <div class="mb-4 flex flex-wrap items-center gap-2 text-xs select-none">
        <span class="text-slate-500 dark:text-slate-400 font-semibold mr-1">
          Status <button id="btn-status-all" class="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">All</button> · <button id="btn-status-none" class="text-slate-500 dark:text-slate-400 hover:underline cursor-pointer">None</button>
        </span>
        <div class="flex flex-wrap items-center gap-1.5">
          ${allStatuses.map(status => {
            const isChecked = state.riskStatusFilter.includes(status);
            return `
              <label class="status-toggle-label inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] cursor-pointer transition-colors ${
                isChecked
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200 font-semibold'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              }">
                <input type="checkbox" value="${status}" class="chk-risk-status rounded text-blue-600 focus:ring-blue-500 w-3 h-3 cursor-pointer" ${isChecked ? 'checked' : ''}>
                <span>${status}</span>
              </label>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Interactive 3x3 PMBOK Grid + Summary -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        <!-- 3x3 Grid Container -->
        <div class="lg:col-span-6 bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div class="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
            <span class="uppercase tracking-wider text-[10px]">Probability vs Impact Grid (3×3)</span>
            ${state.selectedRiskCell ? `<span class="text-[11px] font-bold text-blue-600">Active Cell: L=${state.selectedRiskCell[0]} × I=${state.selectedRiskCell[1]}</span>` : '<span class="text-[10px] text-slate-400">Click any coordinate cell</span>'}
          </div>

          <div class="flex items-center">
            <div class="-rotate-90 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mr-1 select-none">Likelihood</div>
            <div class="flex-1">
              <div class="grid grid-cols-3 gap-1.5 text-center text-xs">
                ${[3, 2, 1].map((l, lIdx) => {
                  return [1, 2, 3].map((impact, iIdx) => {
                    const cellRisks = matrix[lIdx][iIdx];
                    const count = cellRisks.length;
                    const isSelected = state.selectedRiskCell && state.selectedRiskCell[0] === l && state.selectedRiskCell[1] === impact;
                    return `
                      <button data-l="${l}" data-i="${impact}" class="matrix-cell h-11 rounded font-black text-xs flex flex-col items-center justify-center transition-all hover:scale-105 cursor-pointer ${get3x3CellColor(cellRisks)} ${isSelected ? 'ring-3 ring-blue-600 ring-offset-1 scale-105 shadow-sm' : ''}">
                        <span>${count > 0 ? count : '—'}</span>
                        <span class="text-[8px] font-normal opacity-80">${lLabels[l].split(' ')[0]}×${iLabels[impact].split(' ')[0]}</span>
                      </button>
                    `;
                  }).join('');
                }).join('')}
              </div>
              <div class="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 px-2 select-none">
                <span>Low (1)</span>
                <span>Impact</span>
                <span>High (3)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Matrix Summary Banner -->
        <div class="lg:col-span-6 bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-xs">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Severity Summary</h4>
            <span class="text-[10px] text-slate-400">SharePoint OData Compliant</span>
          </div>

          <div class="grid grid-cols-3 gap-2 text-center my-1">
            <div class="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900">
              <div class="text-base font-extrabold text-rose-600 dark:text-rose-400">${risks.filter(r => (r.rating || r.severity) === 'Critical').length}</div>
              <div class="text-[10px] font-semibold text-slate-600 dark:text-slate-300">Critical</div>
            </div>
            <div class="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-900">
              <div class="text-base font-extrabold text-amber-600 dark:text-amber-400">${risks.filter(r => (r.rating || r.severity) === 'High').length}</div>
              <div class="text-[10px] font-semibold text-slate-600 dark:text-slate-300">High</div>
            </div>
            <div class="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-900">
              <div class="text-base font-extrabold text-emerald-600 dark:text-emerald-400">${risks.filter(r => ['Medium', 'Low'].includes(r.rating || r.severity)).length}</div>
              <div class="text-[10px] font-semibold text-slate-600 dark:text-slate-300">Med / Low</div>
            </div>
          </div>

          <div class="text-[10px] text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded flex items-center justify-between">
            <span>🛡️ Native SharePoint list storage</span>
            <span>Manual governance ratings</span>
          </div>
        </div>
      </div>

      <!-- Screenshot 2: All Risks & Issues Register Table -->
      <div class="overflow-x-auto max-w-full max-h-[460px] overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg shadow-xs">
        <table class="w-full text-left text-xs whitespace-nowrap">
          <thead class="bg-slate-50/95 dark:bg-slate-800/95 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700 select-none sticky top-0 z-10 backdrop-blur-xs">
            <tr>
              <th class="py-2.5 px-3 min-w-[180px]">PROJECT</th>
              <th class="py-2.5 px-3 min-w-[130px]">PROJ. TYPE</th>
              <th class="py-2.5 px-3 text-center">TYPE</th>
              <th class="py-2.5 px-3">CATEGORY</th>
              <th class="py-2.5 px-3 min-w-[280px] whitespace-normal">DESCRIPTION</th>
              <th class="py-2.5 px-3 text-center">RATING</th>
              <th class="py-2.5 px-3 text-center">STATUS</th>
              <th class="py-2.5 px-3 min-w-[130px]">OWNER</th>
              <th class="py-2.5 px-3 min-w-[100px]">RAISED</th>
              <th class="py-2.5 px-3 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
            ${displayedRisks.length === 0 ? `
              <tr>
                <td colspan="10" class="py-8 text-center text-slate-400 text-xs font-medium">
                  No risks or issues match the current filter criteria.
                </td>
              </tr>
            ` : displayedRisks.map(r => {
              const project = state.data.projects.find(p => p.id === r.projectId) || {};
              const projType = project.type || 'Infrastructure';
              const projTitle = project.title || 'Enterprise Project';
              const projCode = project.code || ('PRJ-' + r.projectId);
              const ratingVal = r.rating || r.severity || 'Medium';
              const isIssue = r.itemType === 'Issue';

              return `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td class="py-2.5 px-3">
                    <div class="font-semibold text-slate-900 dark:text-white">${projTitle}</div>
                    <div class="text-[10px] font-mono text-slate-400">${projCode}</div>
                  </td>
                  <td class="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-medium">
                    ${projType}
                  </td>
                  <td class="py-2.5 px-3 text-center">
                    <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold ${isIssue ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'}">
                      ${r.itemType}
                    </span>
                  </td>
                  <td class="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                    ${r.category || 'General'}
                  </td>
                  <td class="py-2.5 px-3 whitespace-normal max-w-xs text-slate-800 dark:text-slate-200">
                    <div class="font-medium line-clamp-2">${r.description || r.title}</div>
                  </td>
                  <td class="py-2.5 px-3 text-center">
                    <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      ratingVal === 'Critical' ? 'bg-rose-600 text-white font-bold' :
                      ratingVal === 'High' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-bold' :
                      ratingVal === 'Medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }">${ratingVal}</span>
                  </td>
                  <td class="py-2.5 px-3 text-center">
                    <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadgeClass[r.status] || 'bg-slate-100 text-slate-700'}">
                      ${r.status || 'Open'}
                    </span>
                  </td>
                  <td class="py-2.5 px-3 text-slate-900 dark:text-white font-medium flex items-center gap-1.5 pt-3">
                    <span class="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[9px] font-bold">
                      ${(r.owner || 'PM').split(' ').map(n=>n[0]).join('')}
                    </span>
                    <span>${r.owner || 'Unassigned'}</span>
                  </td>
                  <td class="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                    ${formatRaisedDate(r.dateRaised)}
                  </td>
                  <td class="py-2.5 px-3 text-right">
                    ${r.itemType === 'Risk' ? `
                      <button data-convert-id="${r.id}" class="btn-convert-risk text-[10px] px-2 py-1 font-semibold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 rounded border border-rose-200 dark:border-rose-800 transition cursor-pointer">
                        Convert
                      </button>
                    ` : '<span class="text-[10px] text-slate-400">Active</span>'}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Dropdown and checkbox change listeners
    const projFilterEl = el('filter-risk-project');
    if (projFilterEl) {
      projFilterEl.onchange = (e) => {
        state.riskProjectFilter = e.target.value;
        renderAllRisksIssuesView();
      };
    }

    const typeFilterEl = el('filter-risk-type');
    if (typeFilterEl) {
      typeFilterEl.onchange = (e) => {
        state.riskTypeFilter = e.target.value;
        renderAllRisksIssuesView();
      };
    }

    const ratingFilterEl = el('filter-risk-rating');
    if (ratingFilterEl) {
      ratingFilterEl.onchange = (e) => {
        state.riskRatingFilter = e.target.value;
        renderAllRisksIssuesView();
      };
    }

    const catFilterEl = el('filter-risk-category');
    if (catFilterEl) {
      catFilterEl.onchange = (e) => {
        state.riskCategoryFilter = e.target.value;
        renderAllRisksIssuesView();
      };
    }

    const openOnlyEl = el('filter-risk-open-only');
    if (openOnlyEl) {
      openOnlyEl.onchange = (e) => {
        state.riskOpenOnly = e.target.checked;
        renderAllRisksIssuesView();
      };
    }

    // Status pill check listeners
    container.querySelectorAll('.chk-risk-status').forEach(chk => {
      chk.onchange = () => {
        const val = chk.value;
        if (chk.checked) {
          if (!state.riskStatusFilter.includes(val)) state.riskStatusFilter.push(val);
        } else {
          state.riskStatusFilter = state.riskStatusFilter.filter(s => s !== val);
        }
        renderAllRisksIssuesView();
      };
    });

    const btnStatusAll = el('btn-status-all');
    if (btnStatusAll) {
      btnStatusAll.onclick = () => {
        state.riskStatusFilter = [...allStatuses];
        renderAllRisksIssuesView();
      };
    }

    const btnStatusNone = el('btn-status-none');
    if (btnStatusNone) {
      btnStatusNone.onclick = () => {
        state.riskStatusFilter = [];
        renderAllRisksIssuesView();
      };
    }

    // 3x3 Matrix cell interaction
    container.querySelectorAll('.matrix-cell').forEach(btn => {
      btn.onclick = () => {
        const l = parseInt(btn.getAttribute('data-l'));
        const i = parseInt(btn.getAttribute('data-i'));
        if (state.selectedRiskCell && state.selectedRiskCell[0] === l && state.selectedRiskCell[1] === i) {
          state.selectedRiskCell = null;
        } else {
          state.selectedRiskCell = [l, i];
        }
        renderAllRisksIssuesView();
      };
    });

    const clearBtn = el('btn-clear-matrix-filter');
    if (clearBtn) {
      clearBtn.onclick = () => {
        state.selectedRiskCell = null;
        renderAllRisksIssuesView();
      };
    }

    const toggleIssues = el('toggle-converted-issues');
    if (toggleIssues) {
      toggleIssues.onchange = () => {
        state.includeConvertedIssues = toggleIssues.checked;
        renderAllRisksIssuesView();
      };
    }

    container.querySelectorAll('.btn-convert-risk').forEach(btn => {
      btn.onclick = () => {
        const id = parseInt(btn.getAttribute('data-convert-id'));
        const target = state.data.risksIssues.find(r => r.id === id);
        if (target) {
          target.itemType = 'Issue';
          target.convertedFromRisk = true;
          alert(`Risk "${target.title}" converted to active Issue! Recorded in SharePoint Register.`);
          renderAllRisksIssuesView();
        }
      };
    });
  }

  function renderAnalyticsView() {
    const container = el('webpart-view-container');
    if (!container) return;

    const projects = getFilteredProjects();
    const activeProjectIds = projects.map(p => p.id);
    const financials = state.data.financials.filter(f => activeProjectIds.includes(f.projectId));

    container.innerHTML = `
      <div class="mb-4">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white">Portfolio Analytics & KPI Rollup</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">Real-time SharePoint list analytics with zero external database dependencies</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <h4 class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Overall RAG Health</h4>
          <div class="space-y-2.5">
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="font-medium text-emerald-700 dark:text-emerald-400">Green (On Track)</span>
                <span class="font-mono font-bold">${projects.filter(p => p.ragOverall === 'Green').length}</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div class="bg-emerald-500 h-full" style="width: ${(projects.filter(p => p.ragOverall === 'Green').length/projects.length)*100}%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="font-medium text-amber-700 dark:text-amber-400">Amber (At Risk)</span>
                <span class="font-mono font-bold">${projects.filter(p => p.ragOverall === 'Yellow').length}</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div class="bg-amber-500 h-full" style="width: ${(projects.filter(p => p.ragOverall === 'Yellow').length/projects.length)*100}%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="font-medium text-rose-700 dark:text-rose-400">Red (Critical)</span>
                <span class="font-mono font-bold">${projects.filter(p => p.ragOverall === 'Red').length}</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div class="bg-rose-500 h-full" style="width: ${(projects.filter(p => p.ragOverall === 'Red').length/projects.length)*100}%"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <h4 class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Portfolio Budget Allocation</h4>
          <div class="space-y-2">
            ${state.data.portfolios.filter(pf => pf.id !== 'all').map(pf => {
              const pfProjects = projects.filter(p => p.portfolio === pf.id);
              const budget = pfProjects.reduce((sum, p) => {
                const fin = financials.find(f => f.projectId === p.id);
                return sum + (fin ? fin.totalApprovedBudget : 0);
              }, 0);
              const totalAll = financials.reduce((sum, f) => sum + f.totalApprovedBudget, 0);
              const pct = Math.round((budget / totalAll) * 100);
              return `
                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[140px]">${pf.name}</span>
                    <span class="font-mono text-slate-500">${formatCurrency(budget)} (${pct}%)</span>
                  </div>
                  <div class="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div class="bg-blue-600 h-full" style="width: ${pct}%"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <h4 class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Lifecycle Phase Count</h4>
          <div class="space-y-1.5 text-xs">
            ${['Discovery', 'Design', 'Execution', 'Testing', 'Deployment', 'Closure'].map(phase => {
              const count = projects.filter(p => p.phase === phase).length;
              return `
                <div class="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-700/60 last:border-0">
                  <span class="text-slate-600 dark:text-slate-300 font-medium">${phase}</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${count > 0 ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' : 'text-slate-400'}">${count}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function renderHeatmapView() {
    const container = el('webpart-view-container');
    if (!container) return;

    const months = ['MAR 2026', 'APR 2026', 'MAY 2026', 'JUN 2026', 'JUL 2026', 'AUG 2026', 'SEP 2026', 'OCT 2026', 'NOV 2026', 'DEC 2026', 'JAN 2027', 'FEB 2027'];

    const allHeatmapMembers = [
      {
        name: 'Alexander Wright',
        function: 'IT & Software Development',
        capacityFte: 1.0,
        months: [80, 80, 100, 100, 60, 50, 80, 100, 100, 80, 80, 80]
      },
      {
        name: 'Sarah Jenkins',
        function: 'IT & Software Development',
        capacityFte: 1.0,
        months: [100, 100, 120, 100, 80, 80, 100, 100, 100, 80, 80, 80]
      },
      {
        name: 'Marcus Brody',
        function: 'IT & Software Development',
        capacityFte: 1.0,
        months: [50, 60, 75, 80, 80, 80, 90, 90, 80, 60, 60, 60]
      },
      {
        name: 'Priya Patel',
        function: 'IT & Software Development',
        capacityFte: 1.0,
        months: [100, 100, 100, 110, 110, 100, 90, 90, 80, 80, 80, 80]
      },
      {
        name: 'Devon Clark',
        function: 'Engineering & Automation',
        capacityFte: 1.0,
        months: [90, 90, 90, 90, 90, 90, 80, 80, 70, 70, 70, 70]
      },
      {
        name: 'Liam O\'Connor',
        function: 'Engineering & Automation',
        capacityFte: 1.0,
        months: [70, 80, 90, 100, 100, 80, 80, 80, 80, 70, 70, 70]
      },
      {
        name: 'Henrik Lindqvist',
        function: 'Engineering & Automation',
        capacityFte: 1.0,
        months: [60, 60, 70, 70, 70, 60, 60, 60, 60, 50, 50, 50]
      },
      {
        name: 'Amara Diallo',
        function: 'Operations & Clinical',
        capacityFte: 1.0,
        months: [100, 100, 100, 100, 100, 100, 90, 90, 90, 80, 80, 80]
      },
      {
        name: 'Dr. Camilla Rossi',
        function: 'Operations & Clinical',
        capacityFte: 1.0,
        months: [40, 50, 50, 50, 50, 50, 50, 50, 50, 50, 40, 40]
      },
      {
        name: 'Elena Garcia',
        function: 'Operations & Clinical',
        capacityFte: 1.0,
        months: [80, 80, 85, 85, 90, 90, 90, 90, 80, 80, 70, 70]
      }
    ];

    const functions = ['IT & Software Development', 'Engineering & Automation', 'Operations & Clinical'];
    const activeMembers = allHeatmapMembers.filter(m => {
      if (state.heatmapFunctionFilter !== 'all' && m.function !== state.heatmapFunctionFilter) return false;
      return true;
    });

    function getHeatmapCell(pct) {
      if (pct === null || pct === undefined || pct === 0) {
        return `<span class="text-slate-400 dark:text-slate-500 font-mono">—</span>`;
      }
      let cls = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      if (pct > 100) {
        cls = 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-200 font-bold ring-1 ring-inset ring-rose-400';
      } else if (pct >= 80) {
        cls = 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 font-semibold';
      } else if (pct >= 40) {
        cls = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 font-medium';
      }
      return `<span class="inline-block px-1.5 py-0.5 rounded text-[11px] font-mono text-center min-w-[38px] ${cls}">${pct}%</span>`;
    }

    container.innerHTML = `
      <!-- Top Controls & Legend Bar -->
      <div class="mb-4 pb-3 border-b border-slate-200 dark:border-slate-700 flex flex-col xl:flex-row xl:items-center justify-between gap-3 select-none">
        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Month Horizon Controls -->
          <div class="inline-flex rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-2xs">
            <button id="btn-heatmap-prev" title="Previous Month" class="px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-l-md transition">◀</button>
            <button id="btn-heatmap-today" title="Jump to Current Month" class="px-2.5 py-1 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-x border-slate-200 dark:border-slate-700 transition">Today</button>
            <button id="btn-heatmap-next" title="Next Month" class="px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-r-md transition">▶</button>
          </div>

          <!-- Export to Excel (Disabled in Demo) -->
          <button id="btn-heatmap-export" disabled title="Export feature is active in the installed solution package" class="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 bg-slate-50 text-slate-400 shadow-2xs flex items-center gap-1.5 cursor-not-allowed opacity-75">
            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <span>Export to Excel</span>
            <span class="text-[9px] font-bold px-1 py-0.2 rounded bg-slate-200/80 text-slate-500">App</span>
          </button>

          <!-- Function Filter Dropdown -->
          <div class="relative">
            <select id="select-heatmap-function" class="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md px-2.5 py-1 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="all" ${state.heatmapFunctionFilter === 'all' ? 'selected' : ''}>Function (All)</option>
              ${functions.map(fn => `<option value="${fn}" ${state.heatmapFunctionFilter === fn ? 'selected' : ''}>${fn}</option>`).join('')}
            </select>
          </div>

          <!-- Group by Function Checkbox -->
          <label class="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer ml-1">
            <input type="checkbox" id="chk-heatmap-group" ${state.heatmapGroupByFunction ? 'checked' : ''} class="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer">
            <span>Group by Function (with subtotals)</span>
          </label>
        </div>

        <!-- Heatmap Legend -->
        <div class="flex items-center gap-2 text-xs">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Capacity:</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">&lt;40%</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">40–80%</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">80–100%</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">Over capacity</span>
        </div>
      </div>

      <!-- Heatmap Table -->
      <div class="overflow-x-auto max-w-full max-h-[460px] overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg shadow-xs">
        <table class="w-full text-left text-xs whitespace-nowrap">
          <thead class="bg-slate-50/95 dark:bg-slate-800/95 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700 select-none sticky top-0 z-20 backdrop-blur-xs">
            <tr>
              <th class="py-2.5 px-3 min-w-[220px] sticky left-0 bg-slate-50 dark:bg-slate-800 z-10">TEAM MEMBER</th>
              ${months.map(m => `<th class="py-2.5 px-2 text-center font-mono text-[11px] min-w-[58px]">${m}</th>`).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
            ${state.heatmapGroupByFunction ? functions.map(fn => {
              const members = activeMembers.filter(m => m.function === fn);
              if (members.length === 0) return '';
              const groupCapacity = members.reduce((sum, m) => sum + m.capacityFte, 0);

              return `
                <!-- Group Header -->
                <tr class="bg-slate-100/80 dark:bg-slate-800/80 font-bold text-slate-800 dark:text-slate-200">
                  <td colspan="${1 + months.length}" class="py-2 px-3">
                    <span class="text-blue-600 dark:text-blue-400 mr-1.5">▼</span>
                    <span>${fn}</span>
                    <span class="text-slate-400 dark:text-slate-500 font-normal ml-1 text-[11px]">(${members.length} members)</span>
                  </td>
                </tr>

                <!-- Group Members -->
                ${members.map(m => `
                  <tr class="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="py-2 px-3 font-semibold text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-900 z-10 flex items-center gap-2">
                      <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center justify-center text-[10px] font-bold">
                        ${m.name.split(' ').map(n=>n[0]).join('')}
                      </span>
                      <span>${m.name}</span>
                      <span class="text-[10px] text-slate-400 font-normal">(${m.capacityFte.toFixed(1)} FTE)</span>
                    </td>
                    ${m.months.map(pct => `<td class="py-2 px-2 text-center">${getHeatmapCell(pct)}</td>`).join('')}
                  </tr>
                `).join('')}

                <!-- Group Subtotal Row -->
                <tr class="bg-slate-50/70 dark:bg-slate-800/40 font-bold border-t border-b border-slate-200 dark:border-slate-700">
                  <td class="py-2 px-3 text-slate-700 dark:text-slate-300 sticky left-0 bg-slate-50 dark:bg-slate-800 z-10 italic">
                    ${fn.split(' ')[0]} subtotal — ${groupCapacity.toFixed(1)} FTE capacity
                  </td>
                  ${months.map((_, idx) => {
                    const avg = Math.round(members.reduce((sum, m) => sum + m.months[idx], 0) / members.length);
                    return `<td class="py-2 px-2 text-center">${getHeatmapCell(avg)}</td>`;
                  }).join('')}
                </tr>
              `;
            }).join('') : activeMembers.map(m => `
              <tr class="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors">
                <td class="py-2.5 px-3 font-semibold text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-900 z-10 flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center justify-center text-[10px] font-bold">
                    ${m.name.split(' ').map(n=>n[0]).join('')}
                  </span>
                  <span>${m.name}</span>
                  <span class="text-[10px] text-slate-400 font-normal">(${m.capacityFte.toFixed(1)} FTE)</span>
                </td>
                ${m.months.map(pct => `<td class="py-2.5 px-2 text-center">${getHeatmapCell(pct)}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Event listeners for heatmap controls
    const fnSelect = el('select-heatmap-function');
    if (fnSelect) {
      fnSelect.onchange = (e) => {
        state.heatmapFunctionFilter = e.target.value;
        renderHeatmapView();
      };
    }

    const groupChk = el('chk-heatmap-group');
    if (groupChk) {
      groupChk.onchange = (e) => {
        state.heatmapGroupByFunction = e.target.checked;
        renderHeatmapView();
      };
    }

    const exportBtn = el('btn-heatmap-export');
    if (exportBtn) {
      exportBtn.onclick = (e) => { e.preventDefault(); };
    }

    const prevBtn = el('btn-heatmap-prev');
    const nextBtn = el('btn-heatmap-next');
    const todayBtn = el('btn-heatmap-today');
    if (prevBtn) prevBtn.onclick = () => alert('Showing 12-month rolling horizon starting MAR 2026.');
    if (nextBtn) nextBtn.onclick = () => alert('Showing 12-month rolling horizon through FEB 2027.');
    if (todayBtn) todayBtn.onclick = () => alert('Current horizon is active: MAR 2026 – FEB 2027.');
  }

  function getTeamVisibleMonths(offset = 0) {
    const baseYear = 2026;
    const baseMonth = 10; // Oct 2026 is current month
    const startOffset = -5 + offset; // default starts at May 2026 (5 months past, 1 current, 2 future)
    const months = [];
    for (let i = 0; i < 8; i++) {
      const totalMonths = baseYear * 12 + (baseMonth - 1) + startOffset + i;
      const y = Math.floor(totalMonths / 12);
      const m = (totalMonths % 12) + 1;
      months.push(`${y}-${m < 10 ? '0' + m : m}`);
    }
    return months;
  }

  function formatMonthTag(key) {
    const [y, m] = key.split('-').map(Number);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[m - 1]} '${String(y).slice(2)}`;
  }

  function getMemberFteForMonth(m, monthKey) {
    if (!m.monthlyFte) {
      m.monthlyFte = {};
    }
    if (m.monthlyFte[monthKey] !== undefined) {
      return m.monthlyFte[monthKey];
    }
    const base = m.ftePercent !== undefined ? m.ftePercent : 80;
    m.monthlyFte[monthKey] = base;
    return base;
  }

  function getFteBadgeClass(fte) {
    if (fte === null || fte === undefined || fte === '' || fte <= 0) {
      return 'bg-slate-50 dark:bg-slate-800/40 text-slate-300 dark:text-slate-600';
    }
    if (fte > 100) {
      return 'bg-rose-500 text-white font-bold shadow-2xs';
    }
    if (fte >= 80) {
      return 'bg-blue-600 text-white font-bold shadow-2xs';
    }
    if (fte >= 40) {
      return 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-200 font-semibold';
    }
    return 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-medium';
  }

  // ==================== PROJECT DETAIL DRAWER (EXACT zr IMPLEMENTATION) ====================
  function renderProjectDrawer() {
    const drawer = el('webpart-project-drawer');
    if (!drawer) return;

    if (!state.selectedProjectId) {
      drawer.classList.add('hidden');
      drawer.innerHTML = '';
      return;
    }

    drawer.classList.remove('hidden');
    drawer.scrollTop = 0;

    const project = state.data.projects.find(p => p.id === state.selectedProjectId);
    if (!project) return;

    const financial = state.data.financials.find(f => f.projectId === project.id) || {};
    const milestones = state.data.milestones.filter(m => m.projectId === project.id);
    const risks = state.data.risksIssues.filter(r => r.projectId === project.id);
    const crs = state.data.changeRequests.filter(c => c.projectId === project.id);
    const team = state.data.teamAllocations.filter(t => t.projectId === project.id);
    const statusReport = state.data.monthlyStatus.find(s => s.projectId === project.id);

    // Exact tabs from var jr in the bundle
    const jrTabs = [
      { key: 'overview', label: 'Overview' },
      { key: 'history', label: 'Status History' },
      { key: 'milestones', label: `Milestones (${milestones.length})` },
      { key: 'crs', label: `Change Requests (${crs.length})` },
      { key: 'risks', label: `Risks & Issues (${risks.length})` },
      { key: 'financials', label: 'Financials' },
      { key: 'team', label: `Team (${team.length})` }
    ];

    const isClosed = project.overallStatus === 'Closed';
    const isOnHold = project.overallStatus === 'On Hold';
    const s = state.headerCollapsed;

    drawer.innerHTML = `
      <div class="min-h-full flex flex-col bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
        
        <!-- Top Row Actions (Matches zr topRow) -->
        <div class="px-4 py-2.5 bg-slate-100/90 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs select-none sticky top-0 z-20">
          <button id="btn-back-to-portfolio" class="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 py-1 px-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition">
            <span>←</span> <span>Back to Portfolio</span>
          </button>
          
          <div class="flex items-center gap-2 relative">
            <!-- Direct Share Link Button -->
            <button id="btn-share-project-link" class="px-2.5 py-1 font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded flex items-center gap-1 shadow-2xs hover:bg-slate-50 transition-colors" title="Copy direct link to this project and tab">
              <span>🔗</span> <span id="btn-share-text">Share Link</span>
            </button>

            <!-- 3-Way Export Dropdown -->
            <div class="relative">
              <button id="btn-toggle-export-menu" class="px-2.5 py-1 font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded flex items-center gap-1 shadow-2xs hover:bg-slate-50">
                <span>⭳</span>
                <span>Export ▾</span>
              </button>

              ${state.exportMenuOpen ? `
                <div class="absolute right-0 mt-1 w-72 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 text-xs">
                  <div class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                    <span>Project Leader 1-Click Exports</span>
                    <span class="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded">In Full App</span>
                  </div>
                  <div class="p-1.5 space-y-1">
                    <div class="px-2.5 py-2 rounded bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-between select-none opacity-85">
                      <div class="flex items-center gap-2">
                        <span class="text-base">📊</span>
                        <div>
                          <div class="font-semibold text-slate-800">Download Structured Data</div>
                          <div class="text-[10px] text-slate-400">Full project register & Copilot ready</div>
                        </div>
                      </div>
                      <span class="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">.xlsx</span>
                    </div>

                    <div class="px-2.5 py-2 rounded bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-between select-none opacity-85">
                      <div class="flex items-center gap-2">
                        <span class="text-base">📑</span>
                        <div>
                          <div class="font-semibold text-slate-800">1-Click Steering Slide</div>
                          <div class="text-[10px] text-slate-400">RAG summary & timeline pin graph</div>
                        </div>
                      </div>
                      <span class="text-[10px] font-mono text-indigo-600 font-bold bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">.pptx</span>
                    </div>

                    <div class="px-2.5 py-2 rounded bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-between select-none opacity-85">
                      <div class="flex items-center gap-2">
                        <span class="text-base">📄</span>
                        <div>
                          <div class="font-semibold text-slate-800">Executive 1-Pager</div>
                          <div class="text-[10px] text-slate-400">Print-ready PDF project brief</div>
                        </div>
                      </div>
                      <span class="text-[10px] font-mono text-rose-600 font-bold bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">.pdf</span>
                    </div>
                  </div>
                  <div class="px-3 py-2 text-[10px] text-slate-500 border-t border-slate-100 bg-slate-50/70 leading-relaxed">
                    ⚡ <strong>Available in installed package:</strong> Instant exports generate directly from standard SharePoint Online lists with zero server egress.
                  </div>
                </div>
              ` : ''}
            </div>

            <!-- Edit Project Button -->
            <button id="btn-edit-project" class="px-2.5 py-1 font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded flex items-center gap-1 shadow-2xs hover:bg-slate-50">
              ✎ Edit Project
            </button>

            <!-- Close Drawer -->
            <button id="btn-close-drawer" class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded ml-1">
              ✕
            </button>
          </div>
        </div>

        <!-- Header Component (_renderHeader from bundle) -->
        <div class="p-4 bg-slate-50/70 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <button id="btn-toggle-header-collapse" class="w-5 h-5 flex items-center justify-center font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-xs">
                  ${s ? '▸' : '▾'}
                </button>
                <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  <span class="font-mono text-slate-500 text-sm">${project.code}</span> — ${project.title}
                </h3>
              </div>

              <!-- Sub Chips (_renderHeader dsubChips) -->
              ${!s ? `
                <div class="flex flex-wrap items-center gap-1.5 mt-2 text-[11px]">
                  <span class="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300">${project.type}</span>
                  <span class="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300">Phase: ${project.phase}</span>
                  <span class="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-400">ERP #: ${project.erpCode || '—'}</span>
                  <span class="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium">Last Status: ${project.lastStatusUpdate || '2026-08-31'}</span>
                </div>
              ` : ''}
            </div>

            <!-- 4 RAG Boxes (_renderHeader ragrow) -->
            <div class="grid grid-cols-4 gap-1.5 shrink-0">
              ${getRagBox('TIMELINE', project.ragTimeline)}
              ${getRagBox('BUDGET', project.ragBudget)}
              ${getRagBox('RESOURCES', project.ragResources)}
              ${getRagBox('SCOPE/QUAL.', project.ragScope)}
            </div>
          </div>

          <!-- Status Banners (statusBannerClosed / statusBannerOnHold) -->
          ${isClosed ? `
            <div class="mt-3 p-2.5 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span>🔒</span>
              <span><strong>This project is Closed.</strong> Milestones, Risks & Issues, Change Requests, Status Reports, Team, and Quick Links are locked for everyone.</span>
            </div>
          ` : isOnHold ? `
            <div class="mt-3 p-2.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <span>⏸️</span>
              <span><strong>This project is On Hold.</strong> Nothing is locked — this is just a reminder that RAG status and milestone dates may not reflect active progress right now.</span>
            </div>
          ` : ''}

          <!-- Metadata Grid (_renderHeader metagrid) -->
          ${!s ? `
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <div class="text-[10px] uppercase font-bold text-slate-400">Project Leader</div>
                <div class="font-semibold text-slate-800 dark:text-slate-200">${project.lead}</div>
                ${project.deputy ? `<div class="text-[10px] text-slate-500">Deputy: ${project.deputy}</div>` : ''}
              </div>
              <div>
                <div class="text-[10px] uppercase font-bold text-slate-400">Sponsor</div>
                <div class="font-semibold text-slate-800 dark:text-slate-200">${project.sponsor}</div>
              </div>
              <div>
                <div class="text-[10px] uppercase font-bold text-slate-400">Priority</div>
                <div class="font-semibold text-slate-800 dark:text-slate-200">${project.priority}</div>
              </div>
              <div>
                <div class="text-[10px] uppercase font-bold text-slate-400">Dates</div>
                <div class="font-mono text-[11px] text-slate-700 dark:text-slate-300">${project.startDate} → ${project.targetDate}</div>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- 7 Tab Bar (jr tabs from code) -->
        <div class="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 px-3 bg-white dark:bg-slate-900 text-xs select-none">
          ${jrTabs.map(t => `
            <button data-tab="${t.key}" class="drawer-tab-btn py-2.5 px-3 font-semibold whitespace-nowrap border-b-2 transition-colors ${state.projectDrawerTab === t.key ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}">
              ${t.label}
            </button>
          `).join('')}
        </div>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          ${renderTabContent(project, financial, milestones, risks, crs, team, statusReport)}
        </div>
      </div>
    `;

    drawer.classList.remove('translate-x-full');
    drawer.classList.add('translate-x-0');

    bindDrawerEvents(project);
  }

  // ==================== 7 TAB CONTENT IMPLEMENTATIONS ====================
  function renderTabContent(project, financial, milestones, risks, crs, team, statusReport) {
    switch (state.projectDrawerTab) {
      
      // TAB 1: OVERVIEW (vr from bundle)
      case 'overview': {
        const sponsorRisks = risks.filter(r => r.sponsorAttentionFlag);
        const upcomingMilestones = milestones.filter(m => m.status !== 'Completed').slice(0, 3);
        const recentCrs = crs.slice(0, 3);

        const totalApproved = (financial.opexApprovedBudget || 0) + (financial.capexApprovedBudget || 0);
        const totalActualToDate = (financial.opexActualToDate || 0) + (financial.capexActualToDate || 0);
        const totalPlanYear = (financial.opexPlanCurrentYear || 0) + (financial.capexPlanCurrentYear || 0);
        const totalActualYtd = (financial.opexActualYTD || 0) + (financial.capexActualYTD || 0);

        return `
          <div class="space-y-4 text-xs">
            
            <!-- SECTION 1: 🖼️ Project & goals -->
            <div>
              <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span>🖼️</span> <span>Project & goals</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <!-- Project Image box -->
                <div class="sm:col-span-4 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                  <span class="text-2xl">🖼️</span>
                  <span class="font-bold text-slate-700 dark:text-slate-300 mt-1">Project Image</span>
                  <span class="text-[10px] text-slate-400 mt-0.5">No image set yet — set one from Quick Links below.</span>
                </div>
                <!-- Charter text -->
                <div class="sm:col-span-8 bg-white dark:bg-slate-800 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                  <div><strong>Goal:</strong> <span class="text-slate-600 dark:text-slate-300">${project.goal || project.description}</span></div>
                  <div><strong>Scope:</strong> <span class="text-slate-600 dark:text-slate-300">${project.scope || project.description}</span></div>
                  <div><strong>Success:</strong> <span class="text-slate-600 dark:text-slate-300">${project.successMeasures || '—'}</span></div>
                </div>
              </div>
            </div>

            <!-- SECTION 2: 🗓️ Latest Update · Next Steps -->
            <div>
              <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span>🗓️</span> <span>Latest Update · Next Steps</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h4 class="font-bold text-slate-900 dark:text-white">Achievements — ${statusReport ? statusReport.reportingMonth : 'August 2026'}</h4>
                  <p class="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">${statusReport ? statusReport.achievements : 'No monthly status submitted yet.'}</p>
                </div>
                <div class="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h4 class="font-bold text-slate-900 dark:text-white">Plan for Next Period</h4>
                  <p class="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">${statusReport ? statusReport.nextMonthPlan : 'No monthly status submitted yet.'}</p>
                </div>
              </div>

              <!-- RAG Reason Line -->
              ${project.ragReason ? `
                <div class="mt-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded flex items-start gap-2 text-amber-900 dark:text-amber-200">
                  <span class="text-sm">⚠️</span>
                  <div><strong>Status yellow/red:</strong> ${project.ragReason}</div>
                </div>
              ` : ''}
            </div>

            <!-- SECTION 3: ⚠️ Risks & change control -->
            <div>
              <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span>⚠️</span> <span>Risks & change control</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <!-- Sponsor attention risks matching Screenshot 1 -->
                <div class="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                  <div>
                    <h4 class="font-bold text-slate-900 dark:text-white">Issues & Risks for Sponsor's Attention</h4>
                    ${sponsorRisks.length > 0 ? `
                      <div class="mt-2 space-y-2">
                        ${sponsorRisks.map(r => `
                          <div class="p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800">
                            <div class="flex items-center justify-between">
                              <span class="px-1.5 py-0.2 rounded text-[10px] font-bold ${r.itemType === 'Issue' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}">${r.itemType} · ${r.rating}</span>
                              <div class="flex items-center gap-1 text-[10px] text-slate-500">
                                <span>Owner: ${r.owner}</span>
                                <span class="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[8px] flex items-center justify-center">${(r.owner || 'MM').split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                              </div>
                            </div>
                            <div class="text-[11px] text-slate-700 dark:text-slate-300 mt-1">${r.description}</div>
                          </div>
                        `).join('')}
                      </div>
                    ` : '<div class="text-slate-400 mt-2">Nothing flagged for sponsor attention.</div>'}
                  </div>
                  <button class="btn-jump-tab text-blue-600 dark:text-blue-400 hover:underline text-left mt-3 font-medium text-[11px]" data-target-tab="risks">View full register →</button>
                </div>

                <!-- Change History matching Screenshot 1 -->
                <div class="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                  <div>
                    <h4 class="font-bold text-slate-900 dark:text-white">Change History</h4>
                    ${recentCrs.length > 0 ? `
                      <div class="mt-2 space-y-2">
                        ${recentCrs.map(c => `
                          <div class="p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800">
                            <div class="flex items-center justify-between text-[10px]">
                              <span class="font-mono font-bold text-slate-700 dark:text-slate-300">${c.crNumber} <span class="text-slate-400 font-normal">(${formatEuropeanDate(c.crDate)})</span></span>
                              <span class="px-1.5 py-0.2 rounded font-bold ${c.approvalStatus === 'Approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}">${c.approvalStatus}</span>
                            </div>
                            <div class="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5">${c.title}</div>
                          </div>
                        `).join('')}
                      </div>
                    ` : '<div class="text-slate-400 mt-2">No change requests logged.</div>'}
                  </div>
                  <button class="btn-jump-tab text-blue-600 dark:text-blue-400 hover:underline text-left mt-3 font-medium text-[11px]" data-target-tab="crs">View all change requests →</button>
                </div>
              </div>
            </div>

            <!-- SECTION 4: 📍 High-level timeline -->
            <div>
              <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <span>📍</span> <span>High-level timeline</span>
                </div>
                <div class="text-[10px] text-slate-400 font-normal">
                  <span class="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer btn-jump-tab" data-target-tab="milestones">Configure items in Milestones tab →</span>
                </div>
              </div>
              <div class="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                ${renderTimelineComponent(project, milestones)}
              </div>
            </div>

            <!-- SECTION 5: 🏁 Milestones & financials -->
            <div>
              <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span>🏁</span> <span>Milestones & financials</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <!-- Upcoming Milestones matching Screenshot 1 -->
                <div class="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                  <div>
                    <h4 class="font-bold text-slate-900 dark:text-white">Milestones / Deliverables — upcoming</h4>
                    <table class="w-full text-left text-[11px] mt-2">
                      <thead>
                        <tr class="text-slate-400 border-b border-slate-100 dark:border-slate-700">
                          <th class="py-1">Milestone</th>
                          <th class="py-1">Baseline</th>
                          <th class="py-1">Forecast</th>
                          <th class="py-1 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                        ${upcomingMilestones.map(m => {
                          const baselineVariance = m.baselineVarianceDays !== undefined ? m.baselineVarianceDays : (m.baselineDate && m.forecastDate && m.forecastDate > m.baselineDate ? Math.min(14, getDaysDifference(m.forecastDate, m.baselineDate)) : 0);
                          const forecastVariance = getDaysDifference(m.forecastDate, m.baselineDate);
                          const style = getMilestoneStatusStyle(m.status);
                          return `
                            <tr>
                              <td class="py-1 font-medium text-slate-800 dark:text-slate-200">
                                <div class="flex items-center gap-1.5">
                                  <span class="text-xs shrink-0">${getMilestoneIcon(m.eventType, m.isPhaseGate)}</span>
                                  <span class="truncate max-w-[130px]">${m.milestoneId ? m.milestoneId + ' — ' : ''}${m.title}</span>
                                </div>
                              </td>
                              <td class="py-1 font-mono text-slate-500 whitespace-nowrap">
                                <div class="flex items-center gap-1">
                                  <span>${formatEuropeanDate(m.baselineDate)}</span>
                                  ${renderVarianceBadge(baselineVariance, true)}
                                </div>
                              </td>
                              <td class="py-1 font-mono whitespace-nowrap">
                                <div class="flex items-center gap-1">
                                  <span>${formatEuropeanDate(m.forecastDate)}</span>
                                  ${renderVarianceBadge(forecastVariance, false)}
                                </div>
                              </td>
                              <td class="py-1 text-center">
                                <span class="px-1.5 py-0.2 rounded text-[9px] font-bold ${style.bg} ${style.text}">${m.status}</span>
                              </td>
                            </tr>
                          `;
                        }).join('')}
                      </tbody>
                    </table>
                  </div>
                  <button class="btn-jump-tab text-blue-600 dark:text-blue-400 hover:underline text-left mt-3 font-medium text-[11px]" data-target-tab="milestones">View all milestones →</button>
                </div>

                <!-- Financials Card -->
                <div class="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                  <div>
                    <h4 class="font-bold text-slate-900 dark:text-white">Financials (OPEX + CAPEX)</h4>
                    <div class="mt-2 space-y-1.5 text-[11px]">
                      <div><strong>Approved Budget:</strong> ${formatCurrency(totalApproved)}</div>
                      <div><strong>Actual to Date:</strong> ${formatCurrency(totalActualToDate)}</div>
                      <div><strong>Plan (Current Year):</strong> ${formatCurrency(totalPlanYear)}</div>
                      <div><strong>Actual YTD:</strong> ${formatCurrency(totalActualYtd)}</div>
                    </div>
                  </div>
                  <button class="btn-jump-tab text-blue-600 hover:underline text-left mt-3 font-medium text-[11px]" data-target-tab="financials">View full financials →</button>
                </div>
              </div>
            </div>

            <!-- SECTION 6: 📎 Quick links -->
            <div>
              <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span>📎</span> <span>Quick links</span>
              </div>
              <div class="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div class="text-[11px] text-slate-400 mb-2">Tasks plan, project plan file and folder.</div>
                <div class="flex flex-wrap items-center gap-2">
                  <a href="${project.plannerUrl || '#'}" target="_blank" class="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs hover:bg-slate-200 flex items-center gap-1">
                    📋 Tasks
                  </a>
                  <a href="${project.mppUrl || '#'}" target="_blank" class="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs hover:bg-slate-200 flex items-center gap-1">
                    📄 Project Plan
                  </a>
                  <a href="${project.projectFolderUrl || '#'}" target="_blank" class="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs hover:bg-slate-200 flex items-center gap-1">
                    📁 Folder
                  </a>
                  <button id="btn-edit-quicklinks" class="text-blue-600 hover:underline text-xs ml-2">✎ Edit</button>
                </div>
              </div>
            </div>

          </div>
        `;
      }

      // TAB 2: STATUS HISTORY (yr from bundle)
      case 'history': {
        return `
          <div class="space-y-4 text-xs">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-slate-900 dark:text-white text-sm">Monthly Status Reports</h4>
              <button id="btn-new-status-report" class="px-2.5 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-2xs">
                + New Status Report
              </button>
            </div>

            ${statusReport ? `
              <div class="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-sm text-slate-900 dark:text-white">${statusReport.period}</span>
                    ${getRagBadge(statusReport.rag)}
                  </div>
                  <span class="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded font-mono">
                    🔒 Locked against further edits
                  </span>
                </div>

                <div>
                  <div class="text-[10px] uppercase font-bold text-slate-400">Executive Summary</div>
                  <p class="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">${statusReport.summary}</p>
                </div>

                <div>
                  <div class="text-[10px] uppercase font-bold text-slate-400">Key Achievements</div>
                  <p class="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">${statusReport.achievements}</p>
                </div>

                <div>
                  <div class="text-[10px] uppercase font-bold text-slate-400">Plan for Next Period</div>
                  <p class="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">${statusReport.nextMonthPlan}</p>
                </div>

                <div class="pt-2 text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-700">
                  Submitted by ${statusReport.reportedBy} on ${statusReport.submittedDate}
                </div>
              </div>
            ` : '<div class="text-slate-400 p-4 text-center">No reports filed yet.</div>'}
          </div>
        `;
      }

      // TAB 3: MILESTONES (matching Screenshot 2)
      case 'milestones': {
        return `
          <div class="space-y-4 text-xs">
            <!-- Card 1: Timeline with Stage-Gate Track -->
            <div class="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
              <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h4 class="font-bold text-slate-900 dark:text-white text-sm">Timeline</h4>
                ${renderStageGateTracker(project.phase)}
              </div>
              ${renderTimelineComponent(project, milestones)}
            </div>

            <!-- Card 2: All Milestones Table with Variance & Show Toggle -->
            <div class="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-1.5">
                  <h4 class="font-bold text-slate-900 dark:text-white text-sm">All Milestones</h4>
                  <span class="text-slate-400 text-xs cursor-help" title="Define baseline, forecast, and actual completion dates. Check 'SHOW' to plot on the timeline pin graph above.">ⓘ</span>
                </div>
                <div class="flex gap-2">
                  <button id="btn-snapshot-now-tab" class="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 font-medium hover:bg-slate-200 text-xs">
                    Capture Snapshot
                  </button>
                  <button id="btn-add-milestone" class="px-2.5 py-1 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 text-xs shadow-2xs">
                    + New Milestone
                  </button>
                </div>
              </div>

              <div class="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th class="py-2.5 px-3">ID</th>
                      <th class="py-2.5 px-3">NAME</th>
                      <th class="py-2.5 px-3">TYPE</th>
                      <th class="py-2.5 px-3">BASELINE</th>
                      <th class="py-2.5 px-3">FORECAST</th>
                      <th class="py-2.5 px-3">ACTUAL</th>
                      <th class="py-2.5 px-3 text-center">STATUS</th>
                      <th class="py-2.5 px-3 text-center">SHOW</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    ${milestones.map(m => {
                      const baselineVariance = m.baselineVarianceDays !== undefined ? m.baselineVarianceDays : (m.baselineDate && m.forecastDate && m.forecastDate > m.baselineDate ? Math.min(14, getDaysDifference(m.forecastDate, m.baselineDate)) : 0);
                      const forecastVariance = getDaysDifference(m.forecastDate, m.baselineDate);
                      const actualVariance = m.actualDate ? getDaysDifference(m.actualDate, m.baselineDate) : null;
                      const style = getMilestoneStatusStyle(m.status);

                      return `
                        <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors">
                          <td class="py-2.5 px-3 font-mono text-slate-400 font-semibold">${m.milestoneId || '—'}</td>
                          <td class="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                            <div class="flex items-center gap-2">
                              <span class="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-100 dark:bg-slate-700 text-xs shrink-0">
                                ${getMilestoneIcon(m.eventType, m.isPhaseGate)}
                              </span>
                              <span>${m.title}</span>
                            </div>
                          </td>
                          <td class="py-2.5 px-3">
                            <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              ${m.eventType || (m.isPhaseGate ? 'Gate' : 'Milestone')}
                            </span>
                          </td>
                          <td class="py-2.5 px-3 font-mono whitespace-nowrap">
                            <div class="flex items-center gap-1.5">
                              <span>${formatEuropeanDate(m.baselineDate)}</span>
                              ${renderVarianceBadge(baselineVariance, true)}
                            </div>
                          </td>
                          <td class="py-2.5 px-3 font-mono whitespace-nowrap">
                            <div class="flex items-center gap-1.5">
                              <span>${formatEuropeanDate(m.forecastDate)}</span>
                              ${renderVarianceBadge(forecastVariance, false)}
                            </div>
                          </td>
                          <td class="py-2.5 px-3 font-mono whitespace-nowrap">
                            ${m.actualDate ? `
                              <div class="flex items-center gap-1.5">
                                <span>${formatEuropeanDate(m.actualDate)}</span>
                                ${renderVarianceBadge(actualVariance, false)}
                              </div>
                            ` : `<span class="text-slate-400">—</span>`}
                          </td>
                          <td class="py-2.5 px-3 text-center whitespace-nowrap">
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${style.bg} ${style.text}">
                              <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${style.dot};"></span>
                              <span>${m.status}</span>
                            </span>
                          </td>
                          <td class="py-2.5 px-3 text-center">
                            <label class="inline-flex items-center cursor-pointer justify-center" title="Toggle plotting on the timeline above">
                              <input type="checkbox" class="chk-toggle-ms-timeline rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4" data-id="${m.id}" ${m.showOnTimeline !== false ? 'checked' : ''}>
                            </label>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `;
      }

      // TAB 4: CHANGE REQUESTS (Sr from bundle)
      case 'crs': {
        return `
          <div class="space-y-3 text-xs">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-slate-900 dark:text-white text-sm">Formal Change Requests</h4>
              <button id="btn-new-cr" class="px-2.5 py-1 rounded bg-blue-600 text-white font-medium hover:bg-blue-700">+ New Change Request</button>
            </div>

            ${crs.length > 0 ? crs.map(c => `
              <div class="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="font-mono font-bold text-slate-600 dark:text-slate-400">${c.crNumber}</span>
                    <span class="text-slate-400">•</span>
                    <span class="text-slate-500">${c.crDate}</span>
                    <span class="text-slate-400">•</span>
                    <span class="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-700 rounded text-[10px]">${c.category}</span>
                  </div>
                  <span class="px-2 py-0.5 rounded font-bold text-[10px] ${c.approvalStatus === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                    ${c.approvalStatus}
                  </span>
                </div>
                <h5 class="font-bold text-slate-900 dark:text-white text-xs mt-1.5">${c.title}</h5>
                <p class="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">${c.justification}</p>
                <div class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-4 text-[10px] font-mono text-slate-500">
                  <span>Cost: +${formatCurrency(c.costImpact)}</span>
                  <span>Schedule: +${c.scheduleImpactWeeks} wks</span>
                  <span>Approver: ${c.approvedBy}</span>
                </div>
              </div>
            `).join('') : '<div class="text-slate-400 p-4 text-center">No Change Requests logged.</div>'}
          </div>
        `;
      }

      // TAB 5: RISKS & ISSUES (Exact Ir component from bundle - standard filter chips only, no 3x3 matrix in drawer)
      case 'risks': {
        const filter = state.projectDrawerRiskFilter || 'all';
        const filteredRisks = risks.filter(r => {
          if (filter === 'risks') return r.itemType === 'Risk';
          if (filter === 'issues') return r.itemType === 'Issue';
          if (filter === 'open') return r.status !== 'Closed' && r.status !== 'Resolved';
          return true;
        });

        const filterChips = [
          { key: 'all', label: 'All' },
          { key: 'risks', label: 'Risks' },
          { key: 'issues', label: 'Issues' },
          { key: 'open', label: 'Open only' }
        ];

        return `
          <div class="space-y-3 text-xs">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-700">
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="font-bold text-slate-900 dark:text-white text-sm">Risks & Issues Register</h4>
                  <span class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-help text-[10px] font-bold" title="This is the full ongoing register (PPM_APP_RisksIssues) — items are updated in place as status/rating change, not retyped monthly.">ⓘ</span>
                </div>
                <p class="text-[11px] text-slate-500 mt-0.5">Updated in place as rating and status change · Standard filters</p>
              </div>

              <div class="flex items-center gap-2">
                <!-- Filter Chips matching Ir component from SPFx bundle -->
                <div class="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  ${filterChips.map(c => `
                    <button class="btn-drawer-risk-filter px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${filter === c.key ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}" data-filter="${c.key}">
                      ${c.label}
                    </button>
                  `).join('')}
                </div>

                <button id="btn-new-risk" class="px-2.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-2xs flex items-center gap-1 text-xs">
                  <span>+</span> New Item
                </button>
              </div>
            </div>

            <!-- Risks & Issues Table matching Ir component -->
            ${filteredRisks.length === 0 ? `
              <div class="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                No risks or issues match the current filter "${filter}".
              </div>
            ` : `
              <div class="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th class="py-2 px-2.5">Type</th>
                      <th class="py-2 px-2.5">Category</th>
                      <th class="py-2 px-3">Description</th>
                      <th class="py-2 px-2.5 text-center">Rating</th>
                      <th class="py-2 px-2.5">Response Strategy</th>
                      <th class="py-2 px-2.5 text-center">Status</th>
                      <th class="py-2 px-2.5">Owner</th>
                      <th class="py-2 px-2 text-center whitespace-nowrap">Sponsor Attn.</th>
                      <th class="py-2 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    ${filteredRisks.map(r => {
                      const isRisk = r.itemType === 'Risk';
                      const ratingUpper = (r.rating || '').toUpperCase();
                      const ratingColor = (ratingUpper === 'HIGH' || ratingUpper === 'CRITICAL' || r.likelihood * r.impact >= 6)
                        ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 font-bold'
                        : (ratingUpper === 'MEDIUM' || r.likelihood * r.impact >= 3)
                          ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-200 font-semibold'
                          : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 font-medium';

                      return `
                        <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                          <td class="py-2 px-2.5 whitespace-nowrap">
                            <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${isRisk ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'}">
                              ${r.itemType}
                            </span>
                            ${r.convertedFromRisk ? '<span class="ml-1 px-1 py-0.2 rounded text-[9px] bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-medium" title="Originally logged as a risk, escalated to issue">was: Risk</span>' : ''}
                          </td>
                          <td class="py-2 px-2.5 text-slate-500 whitespace-nowrap">${r.category || '—'}</td>
                          <td class="py-2 px-3">
                            <div class="font-semibold text-slate-900 dark:text-white">${r.title}</div>
                            ${r.description && r.description !== r.title ? `<div class="text-[11px] text-slate-500 line-clamp-1 mt-0.5">${r.description}</div>` : ''}
                          </td>
                          <td class="py-2 px-2.5 text-center whitespace-nowrap">
                            <span class="px-2 py-0.5 rounded text-[10px] ${ratingColor}">${r.rating || (r.likelihood + 'x' + r.impact)}</span>
                          </td>
                          <td class="py-2 px-2.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">${r.strategy || r.responseStrategy || '—'}</td>
                          <td class="py-2 px-2.5 text-center whitespace-nowrap">
                            <span class="px-2 py-0.5 rounded text-[10px] font-medium ${r.status === 'Closed' || r.status === 'Resolved' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'}">
                              ${r.status || 'Open'}
                            </span>
                          </td>
                          <td class="py-2 px-2.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">${r.owner || '—'}</td>
                          <td class="py-2 px-2 text-center whitespace-nowrap">
                            ${r.sponsorAttentionFlag ? '<span class="inline-block px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 font-bold text-[10px]">Attn.</span>' : '<span class="text-slate-300 dark:text-slate-600">—</span>'}
                          </td>
                          <td class="py-2 px-2 text-right whitespace-nowrap">
                            ${isRisk ? `
                              <button data-convert-id="${r.id}" class="btn-convert-risk px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-600 dark:text-slate-300 hover:text-rose-600 text-[10px] font-medium border border-slate-200 dark:border-slate-700" title="Convert this risk into an active issue">
                                Convert to Issue
                              </button>
                            ` : `
                              <span class="text-[10px] text-slate-400">Logged</span>
                            `}
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>
        `;
      }

      // TAB 6: FINANCIALS (Cr from bundle with exact separation of duties note)
      case 'financials': {
        const opexApproved = financial.opexApprovedBudget || 0;
        const capexApproved = financial.capexApprovedBudget || 0;
        const totalApproved = opexApproved + capexApproved;

        const opexActual = financial.opexActualToDate || 0;
        const capexActual = financial.capexActualToDate || 0;
        const totalActual = opexActual + capexActual;

        const opexPlan = financial.opexPlanCurrentYear || 0;
        const capexPlan = financial.capexPlanCurrentYear || 0;
        const totalPlan = opexPlan + capexPlan;

        const opexYtd = financial.opexActualYTD || 0;
        const capexYtd = financial.capexActualYTD || 0;
        const totalYtd = opexYtd + capexYtd;

        return `
          <div class="space-y-4 text-xs">
            <div class="p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-md text-blue-900 dark:text-blue-300 text-[11px] leading-relaxed">
              💡 <strong>Read-only separation of duties</strong>: Maintained by Finance in a separate list (<code>PPM_FIN_ProjectFinancials</code>). There is no edit form for these figures in this app.
            </div>

            <div class="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
              <table class="w-full text-left">
                <thead class="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b">
                  <tr>
                    <th class="py-2.5 px-3">Expense Category</th>
                    <th class="py-2.5 px-3">Approved Budget</th>
                    <th class="py-2.5 px-3">Plan (Current Year)</th>
                    <th class="py-2.5 px-3">Actual YTD</th>
                    <th class="py-2.5 px-3">Actual to Date</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td class="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">OPEX</td>
                    <td class="py-2 px-3 font-mono">${formatCurrency(opexApproved)}</td>
                    <td class="py-2 px-3 font-mono">${formatCurrency(opexPlan)}</td>
                    <td class="py-2 px-3 font-mono">${formatCurrency(opexYtd)}</td>
                    <td class="py-2 px-3 font-mono">${formatCurrency(opexActual)}</td>
                  </tr>
                  <tr>
                    <td class="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">CAPEX</td>
                    <td class="py-2 px-3 font-mono">${formatCurrency(capexApproved)}</td>
                    <td class="py-2 px-3 font-mono">${formatCurrency(capexPlan)}</td>
                    <td class="py-2 px-3 font-mono">${formatCurrency(capexYtd)}</td>
                    <td class="py-2 px-3 font-mono">${formatCurrency(capexActual)}</td>
                  </tr>
                  <tr class="bg-slate-50/60 dark:bg-slate-800/40 font-bold">
                    <td class="py-2 px-3 text-slate-900 dark:text-white">TOTAL</td>
                    <td class="py-2 px-3 font-mono text-slate-900 dark:text-white">${formatCurrency(totalApproved)}</td>
                    <td class="py-2 px-3 font-mono">${formatCurrency(totalPlan)}</td>
                    <td class="py-2 px-3 font-mono">${formatCurrency(totalYtd)}</td>
                    <td class="py-2 px-3 font-mono text-slate-900 dark:text-white">${formatCurrency(totalActual)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span class="text-slate-400 text-[10px] uppercase font-bold block">Forecast Variance</span>
                <span class="font-bold text-sm ${financial.variance > 0 ? 'text-rose-600' : 'text-emerald-600'}">
                  ${financial.variance > 0 ? '+' : ''}${formatCurrency(financial.variance)} (${financial.variancePercent}%)
                </span>
              </div>
              <div class="text-right">
                <span class="text-slate-400 text-[10px] uppercase font-bold block">Budget RAG</span>
                <div class="mt-0.5">${getRagBadge(financial.budgetRAG)}</div>
              </div>
            </div>
          </div>
        `;
      }

      // TAB 7: TEAM (Exact Br & Rr monthly allocation matrix from bundle)
      case 'team': {
        const visibleMonths = getTeamVisibleMonths(state.teamMonthOffset || 0);
        const currentMonthKey = '2026-10'; // Anchor month for the demo
        const activeMembers = team.filter(t => t.isActive !== false);
        const inactiveMembers = team.filter(t => t.isActive === false);

        return `
          <div class="space-y-3.5 text-xs">
            <!-- Top Controls & Subtitle -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h4 class="font-bold text-slate-900 dark:text-white text-sm">Team Allocations & Monthly Capacity</h4>
                <div class="text-[11px] text-slate-500 mt-0.5">
                  Click a cell to set that person's FTE for the month. Past months (<span class="font-semibold text-slate-700 dark:text-slate-300">Actual</span>) show what happened; current and future months (<span class="font-semibold text-blue-600 dark:text-blue-400">Plan</span>) are the plan.
                </div>
              </div>

              <div class="flex items-center gap-2">
                <!-- Rolling Month Navigation matching Rr component -->
                <div class="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5 text-xs">
                  <button id="btn-team-prev-months" class="px-2 py-1 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 font-bold transition-all" title="Back 3 months">◀</button>
                  <button id="btn-team-today-months" class="px-2.5 py-1 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200 font-semibold transition-all" title="Reset to current month">Today</button>
                  <button id="btn-team-next-months" class="px-2 py-1 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 font-bold transition-all" title="Forward 3 months">▶</button>
                </div>

                <button id="btn-add-team-member" class="px-2.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-2xs flex items-center gap-1 text-xs">
                  <span>+</span> Add Member
                </button>
              </div>
            </div>

            <!-- Capacity Legend matching Rr bundle -->
            <div class="flex items-center gap-4 text-[11px] text-slate-500 bg-slate-50/70 dark:bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
              <span class="font-semibold text-slate-600 dark:text-slate-400">FTE Legend:</span>
              <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-800"></span> &lt;40%</span>
              <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700"></span> 40–80%</span>
              <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded bg-blue-600 text-white"></span> 80–100%</span>
              <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded bg-rose-500 text-white"></span> Over 100%</span>
            </div>

            <!-- Active Team Allocations Table -->
            <div class="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th class="py-2.5 px-3 min-w-[190px]">Team Member</th>
                    ${visibleMonths.map(mKey => {
                      const isPast = mKey < currentMonthKey;
                      const isCurrent = mKey === currentMonthKey;
                      return `
                        <th class="py-2 px-2 text-center min-w-[70px] ${isCurrent ? 'bg-blue-50/80 dark:bg-blue-950/40 border-x border-blue-200 dark:border-blue-900/60' : ''}">
                          <div class="font-semibold ${isCurrent ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}">${formatMonthTag(mKey)}</div>
                          <div class="mt-0.5">
                            <span class="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${isPast ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300'}">
                              ${isPast ? 'Actual' : 'Plan'}
                            </span>
                          </div>
                        </th>
                      `;
                    }).join('')}
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  ${activeMembers.length > 0 ? activeMembers.map(t => {
                    const initials = t.personName ? t.personName.split(' ').map(n=>n[0]).join('') : 'TM';
                    return `
                      <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td class="py-2.5 px-3">
                          <div class="flex items-center justify-between gap-2">
                            <div class="flex items-center gap-2">
                              <span class="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                                ${initials}
                              </span>
                              <div class="min-w-0">
                                <div class="font-bold text-slate-900 dark:text-white truncate">${t.personName}</div>
                                <div class="text-[11px] text-slate-500 truncate">${t.role} · <span class="text-slate-400">${t.function || 'General'}</span></div>
                              </div>
                            </div>
                            <button data-id="${t.id}" class="btn-deactivate-member text-slate-300 hover:text-rose-500 p-1 rounded transition-colors text-xs" title="Remove member from active team">
                              ✕
                            </button>
                          </div>
                        </td>
                        ${visibleMonths.map(mKey => {
                          const fte = getMemberFteForMonth(t, mKey);
                          const isCurrent = mKey === currentMonthKey;
                          const badgeCls = getFteBadgeClass(fte);
                          const isPast = mKey < currentMonthKey;
                          return `
                            <td class="py-2 px-2 text-center ${isCurrent ? 'bg-blue-50/40 dark:bg-blue-950/20 border-x border-blue-100 dark:border-blue-900/40' : ''}">
                              <button data-member-id="${t.id}" data-month="${mKey}" class="team-cell-editable w-full py-1 rounded text-center font-mono text-[11px] transition-all hover:scale-105 ${badgeCls}" title="${t.personName} - ${formatMonthTag(mKey)} (${isPast ? 'Actual' : 'Plan'}): ${fte}% FTE. Click to change.">
                                ${fte > 0 ? fte + '%' : '—'}
                              </button>
                            </td>
                          `;
                        }).join('')}
                      </tr>
                    `;
                  }).join('') : `
                    <tr>
                      <td colspan="${visibleMonths.length + 1}" class="p-8 text-center text-slate-400">
                        No active team members. Click "+ Add Member" above to assign members.
                      </td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>

            <!-- Inactive Members Section (matching Rr from bundle) -->
            ${inactiveMembers.length > 0 ? `
              <div class="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-700 dark:text-slate-300 text-xs">Not Active (${inactiveMembers.length})</span>
                    <span class="text-[11px] text-slate-400">Removed from team — historic Actual/Plan retained, read-only until reactivated.</span>
                  </div>
                </div>

                <div class="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg opacity-80">
                  <table class="w-full text-left text-xs">
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50 dark:bg-slate-800/50">
                      ${inactiveMembers.map(t => `
                        <tr>
                          <td class="py-2 px-3 min-w-[190px]">
                            <div class="flex items-center justify-between">
                              <div>
                                <span class="font-semibold text-slate-500">${t.personName}</span>
                                <span class="text-[10px] text-slate-400 ml-1">(${t.role})</span>
                              </div>
                              <button data-id="${t.id}" class="btn-reactivate-member text-[10px] font-semibold text-blue-600 hover:text-blue-700 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-0.5 rounded">
                                Reactivate
                              </button>
                            </div>
                          </td>
                          ${visibleMonths.map(mKey => {
                            const fte = getMemberFteForMonth(t, mKey);
                            return `
                              <td class="py-2 px-2 text-center min-w-[70px] text-slate-400 font-mono text-[11px]">
                                ${fte > 0 ? fte + '%' : '—'}
                              </td>
                            `;
                          }).join('')}
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            ` : ''}
          </div>
        `;
      }

      default:
        return '';
    }
  }

  function bindDrawerEvents(project) {
    // Back link & Close
    const backBtn = el('btn-back-to-portfolio');
    const closeBtn = el('btn-close-drawer');
    if (backBtn) backBtn.onclick = () => { state.selectedProjectId = null; renderProjectDrawer(); };
    if (closeBtn) closeBtn.onclick = () => { state.selectedProjectId = null; renderProjectDrawer(); };

    // Toggle Header Collapse
    const toggleHeaderBtn = el('btn-toggle-header-collapse');
    if (toggleHeaderBtn) {
      toggleHeaderBtn.onclick = () => {
        state.headerCollapsed = !state.headerCollapsed;
        renderProjectDrawer();
      };
    }

    // Toggle Export Menu
    const toggleExportBtn = el('btn-toggle-export-menu');
    if (toggleExportBtn) {
      toggleExportBtn.onclick = (e) => {
        e.stopPropagation();
        state.exportMenuOpen = !state.exportMenuOpen;
        renderProjectDrawer();
      };
    }

    // Export items (disabled in demo - informative only)
    const exportPdf = el('btn-export-pdf');
    const exportPptx = el('btn-export-pptx');
    const exportXlsx = el('btn-export-xlsx');
    if (exportPdf) exportPdf.onclick = (e) => { e.preventDefault(); };
    if (exportPptx) exportPptx.onclick = (e) => { e.preventDefault(); };
    if (exportXlsx) exportXlsx.onclick = (e) => { e.preventDefault(); };

    // Edit Project
    const editProjectBtn = el('btn-edit-project');
    if (editProjectBtn) {
      editProjectBtn.onclick = () => {
        alert(`Opening Edit Form for ${project.code} (Phase, Priority, Leader, Sponsor, Target Date).`);
      };
    }

    // Tab buttons
    document.querySelectorAll('.drawer-tab-btn').forEach(b => {
      b.onclick = () => {
        state.projectDrawerTab = b.getAttribute('data-tab');
        renderProjectDrawer();
      };
    });

    // Jump buttons from Overview tab
    document.querySelectorAll('.btn-jump-tab').forEach(b => {
      b.onclick = () => {
        state.projectDrawerTab = b.getAttribute('data-target-tab');
        renderProjectDrawer();
      };
    });

    // Edit Quick Links button
    const editQl = el('btn-edit-quicklinks');
    if (editQl) {
      editQl.onclick = () => {
        const p = prompt('Update Tasks URL for this project:', project.plannerUrl || '');
        if (p !== null) {
          project.plannerUrl = p;
          renderProjectDrawer();
        }
      };
    }

    // Toggle Milestone Show on Timeline
    document.querySelectorAll('.chk-toggle-ms-timeline').forEach(input => {
      input.onchange = (e) => {
        const msId = parseInt(e.target.getAttribute('data-id'));
        const ms = state.data.milestones.find(m => m.id === msId);
        if (ms) {
          ms.showOnTimeline = e.target.checked;
          renderProjectDrawer();
        }
      };
    });

    // Capture Snapshot in Milestones tab
    const snapshotTabBtn = el('btn-snapshot-now-tab');
    if (snapshotTabBtn) {
      snapshotTabBtn.onclick = () => {
        alert('Baseline snapshot captured! Project baseline locked for trend variance analysis.');
      };
    }

    // Add Milestone
    const addMsBtn = el('btn-add-milestone');
    if (addMsBtn) {
      addMsBtn.onclick = () => {
        const title = prompt('Enter Milestone Title:');
        if (!title) return;
        const eventType = prompt('Enter Type (Milestone, Gate, Launch, Technical, Submission, Kickoff, Review, Go-Live, Training, Sign-off, Shipment, Test, UAT, SAT):', 'Gate');
        const forecastDate = prompt('Enter Forecast Date (YYYY-MM-DD):', '2026-10-15');
        const newId = Date.now();
        const existingCount = state.data.milestones.filter(m => m.projectId === project.id).length;
        const newMs = {
          id: newId,
          projectId: project.id,
          milestoneId: 'M' + (existingCount + 1),
          title: title,
          eventType: eventType || 'Milestone',
          phase: project.phase || 'Execution',
          baselineDate: forecastDate || '2026-10-15',
          forecastDate: forecastDate || '2026-10-15',
          status: 'On Track',
          isPhaseGate: (eventType || '').toLowerCase() === 'gate',
          showOnTimeline: true
        };
        state.data.milestones.push(newMs);
        renderProjectDrawer();
      };
    }

    // Direct Share Link button (?project=CODE&tab=TAB)
    const shareBtn = el('btn-share-project-link');
    if (shareBtn) {
      shareBtn.onclick = () => {
        const url = new URL(window.location.href);
        url.searchParams.set('project', project.code);
        url.searchParams.set('tab', state.projectDrawerTab || 'overview');
        navigator.clipboard.writeText(url.toString()).then(() => {
          const txtEl = el('btn-share-text');
          if (txtEl) {
            const old = txtEl.textContent;
            txtEl.textContent = '✓ Copied!';
            setTimeout(() => { txtEl.textContent = old; }, 2000);
          }
        }).catch(() => {
          prompt('Copy direct project link:', url.toString());
        });
      };
    }

    // Drawer Risk Filter Chips (matching Ir component)
    document.querySelectorAll('.btn-drawer-risk-filter').forEach(btn => {
      btn.onclick = () => {
        state.projectDrawerRiskFilter = btn.getAttribute('data-filter') || 'all';
        renderProjectDrawer();
      };
    });

    // New Risk / Issue Modal prompt
    const newRiskBtn = el('btn-new-risk');
    if (newRiskBtn) {
      newRiskBtn.onclick = () => {
        const title = prompt('Enter Risk / Issue Title:');
        if (!title) return;
        const isIssue = confirm('Click OK for Issue, or Cancel for Risk:');
        const itemType = isIssue ? 'Issue' : 'Risk';
        const category = prompt('Category (Technical, Resource, Schedule, Budget, Compliance, Vendor):', 'Technical') || 'Technical';
        const rating = prompt('Rating (Low, Medium, High, Critical):', 'Medium') || 'Medium';
        const owner = prompt('Owner Name:', project.leader || 'Team Member') || (project.leader || 'Team Member');
        const strategy = isIssue ? 'Remediation' : (prompt('Response Strategy (Mitigate, Avoid, Accept, Transfer):', 'Mitigate') || 'Mitigate');
        const newRisk = {
          id: Date.now(),
          projectId: project.id,
          itemType: itemType,
          title: title,
          description: title,
          category: category,
          rating: rating,
          likelihood: (rating === 'High' || rating === 'Critical') ? 3 : rating === 'Low' ? 1 : 2,
          impact: (rating === 'High' || rating === 'Critical') ? 3 : rating === 'Low' ? 1 : 2,
          strategy: strategy,
          status: 'Open',
          owner: owner,
          dateRaised: '2026-10-15',
          sponsorAttentionFlag: rating === 'High' || rating === 'Critical'
        };
        state.data.risksIssues.push(newRisk);
        renderProjectDrawer();
      };
    }

    // Convert Risk to Issue button
    document.querySelectorAll('.btn-convert-risk').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const rId = parseInt(btn.getAttribute('data-convert-id'));
        const r = state.data.risksIssues.find(x => x.id === rId);
        if (r) {
          r.itemType = 'Issue';
          r.convertedFromRisk = true;
          alert(`Risk "${r.title}" successfully converted to Issue.`);
          renderProjectDrawer();
        }
      };
    });

    // Team Month Window Navigation (◀ -3 months, Today, ▶ +3 months)
    const prevMonthsBtn = el('btn-team-prev-months');
    const todayMonthsBtn = el('btn-team-today-months');
    const nextMonthsBtn = el('btn-team-next-months');
    if (prevMonthsBtn) {
      prevMonthsBtn.onclick = () => {
        state.teamMonthOffset = (state.teamMonthOffset || 0) - 3;
        renderProjectDrawer();
      };
    }
    if (todayMonthsBtn) {
      todayMonthsBtn.onclick = () => {
        state.teamMonthOffset = 0;
        renderProjectDrawer();
      };
    }
    if (nextMonthsBtn) {
      nextMonthsBtn.onclick = () => {
        state.teamMonthOffset = (state.teamMonthOffset || 0) + 3;
        renderProjectDrawer();
      };
    }

    // Add Team Member
    const addTeamBtn = el('btn-add-team-member');
    if (addTeamBtn) {
      addTeamBtn.onclick = () => {
        const name = prompt('Enter Team Member Name:');
        if (!name) return;
        const role = prompt('Enter Role (e.g. Senior Developer, Solution Architect, QA Lead, Business Analyst):', 'Contributor') || 'Contributor';
        const func = prompt('Enter Department / Function (e.g. IT Engineering, Clinical Affairs, Operations, Quality):', 'IT Engineering') || 'General';
        const fte = parseInt(prompt('Enter standard FTE % (e.g. 100, 80, 50):', '80') || '80', 10);
        const newId = Date.now();
        const newMember = {
          id: newId,
          projectId: project.id,
          personName: name,
          role: role,
          function: func,
          ftePercent: isNaN(fte) ? 80 : fte,
          isActive: true,
          monthlyFte: {}
        };
        state.data.teamAllocations.push(newMember);
        renderProjectDrawer();
      };
    }

    // Editable FTE Cells (Click to set that person's FTE for the month)
    document.querySelectorAll('.team-cell-editable').forEach(cell => {
      cell.onclick = () => {
        const memberId = parseInt(cell.getAttribute('data-member-id'));
        const monthKey = cell.getAttribute('data-month');
        const member = state.data.teamAllocations.find(t => t.id === memberId);
        if (!member) return;
        const currentFte = getMemberFteForMonth(member, monthKey);
        const isPast = monthKey < '2026-10';
        const promptMsg = `Set FTE % for ${member.personName} for ${formatMonthTag(monthKey)} (${isPast ? 'Actual' : 'Plan'}):\nEnter percentage (0 to 200, or enter 0 for unassigned):`;
        const val = prompt(promptMsg, currentFte);
        if (val !== null) {
          const num = parseInt(val, 10);
          if (!isNaN(num) && num >= 0) {
            if (!member.monthlyFte) member.monthlyFte = {};
            member.monthlyFte[monthKey] = num;
            renderProjectDrawer();
          }
        }
      };
    });

    // Deactivate Member from Active Team
    document.querySelectorAll('.btn-deactivate-member').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = parseInt(btn.getAttribute('data-id'));
        const m = state.data.teamAllocations.find(t => t.id === id);
        if (m && confirm(`Remove ${m.personName} from active team? Historic Actual/Plan data will be retained in Not Active.`)) {
          m.isActive = false;
          renderProjectDrawer();
        }
      };
    });

    // Reactivate Member
    document.querySelectorAll('.btn-reactivate-member').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = parseInt(btn.getAttribute('data-id'));
        const m = state.data.teamAllocations.find(t => t.id === id);
        if (m) {
          m.isActive = true;
          renderProjectDrawer();
        }
      };
    });
  }

  function renderView() {
    const kpiContainer = el('webpart-kpi-bar');
    if (state.currentTab === 'myPortfolio') {
      renderKPIBar();
    } else if (kpiContainer) {
      kpiContainer.innerHTML = '';
    }

    switch (state.currentTab) {
      case 'portfolio':
      case 'globalSearch':
        renderPortfolioView();
        break;
      case 'myProjects':
        state.currentTab = 'myPortfolio';
        state.portfolioSubView = 'my';
        renderMyPortfolioView();
        break;
      case 'myPortfolio':
        renderMyPortfolioView();
        break;
      case 'allMilestones':
        renderAllMilestonesView();
        break;
      case 'allRisksIssues':
        renderAllRisksIssuesView();
        break;
      case 'analytics':
        renderAnalyticsView();
        break;
      case 'heatmap':
        renderHeatmapView();
        break;
    }
    renderProjectDrawer();
  }

  function bindPortfolioEvents() {
    document.querySelectorAll('.project-row, .project-card').forEach(item => {
      item.onclick = () => {
        const id = parseInt(item.getAttribute('data-id'));
        state.selectedProjectId = id;
        state.projectDrawerTab = 'overview';
        renderProjectDrawer();
      };
    });

    const pfSelect = el('filter-portfolio-select');
    if (pfSelect) {
      pfSelect.onchange = (e) => {
        state.selectedPortfolio = e.target.value;
        renderPortfolioView();
      };
    }

    document.querySelectorAll('.rag-pill-btn').forEach(btn => {
      btn.onclick = () => {
        state.selectedRagFilter = btn.getAttribute('data-rag');
        renderPortfolioView();
      };
    });

    const searchInput = el('filter-search-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        state.searchQuery = e.target.value;
        renderPortfolioView();
      };
    }

    const tableBtn = el('view-mode-table');
    const cardsBtn = el('view-mode-cards');
    if (tableBtn && cardsBtn) {
      tableBtn.onclick = () => { state.viewMode = 'table'; renderPortfolioView(); };
      cardsBtn.onclick = () => { state.viewMode = 'cards'; renderPortfolioView(); };
    }

    const resetBtn = el('reset-filters-btn');
    if (resetBtn) {
      resetBtn.onclick = () => {
        state.selectedPortfolio = 'all';
        state.selectedRagFilter = 'all';
        state.searchQuery = '';
        renderPortfolioView();
      };
    }
  }

  function exportPortfolioToCSV() {
    const projects = getFilteredProjects();
    const headers = ["Project Code", "Title", "Portfolio", "Phase", "Lead", "Sponsor", "Overall RAG", "Timeline RAG", "Budget RAG", "Resources RAG", "Scope RAG", "% Complete", "Target Date"];
    const rows = projects.map(p => [
      `"${p.code}"`,
      `"${p.title}"`,
      `"${p.portfolioName}"`,
      `"${p.phase}"`,
      `"${p.lead}"`,
      `"${p.sponsor}"`,
      `"${p.ragOverall}"`,
      `"${p.ragTimeline}"`,
      `"${p.ragBudget}"`,
      `"${p.ragResources}"`,
      `"${p.ragScope}"`,
      `"${p.percentComplete}%"`,
      `"${p.targetDate}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PPM_Portfolio_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function initTopNav() {
    const navItems = [
      { key: 'myPortfolio', label: 'My Portfolio', title: 'Portfolio Owner Dashboard & My Projects Workspace' },
      { key: 'allMilestones', label: 'All Milestones', title: 'Single Source of Truth for Stakeholders' },
      { key: 'allRisksIssues', label: 'All Risks & Issues', title: 'Cross-Project Risks & Heatmap' },
      { key: 'heatmap', label: 'Resource Heatmap', title: 'Team Capacity Heatmap' },
      { key: 'portfolio', label: 'Portfolios', title: 'All Portfolios' }
    ];

    const navContainer = el('webpart-top-nav');
    if (!navContainer) return;

    const availablePortfolios = state.data.portfolios.filter(pf => pf.id !== 'all');
    const hasCustomSelection = state.selectedPortfolios.length > 0 && !state.selectedPortfolios.includes('__none__');
    const isNoneSelected = state.selectedPortfolios.includes('__none__');

    let navHtml = `
      <div class="flex items-center gap-2 pr-2.5 mr-1 border-r border-slate-200 dark:border-slate-700 py-0.5 select-none" title="Current User: Sarah Jenkins (Portfolio Director / PMO Lead)">
        <div class="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">SJ</div>
        <span class="hidden xl:inline text-[11px] font-semibold text-slate-700 dark:text-slate-300">Sarah Jenkins</span>
      </div>
    `;

    navHtml += navItems.map(item => {
      if (item.key === 'portfolio') {
        const activeCount = isNoneSelected ? 0 : (hasCustomSelection ? state.selectedPortfolios.length : availablePortfolios.length);
        const isTabActive = state.currentTab === 'portfolio';
        return `
          <div class="relative inline-flex items-center">
            <div class="inline-flex items-stretch rounded-md shadow-xs ${isTabActive ? 'bg-blue-600 text-white' : 'bg-transparent text-slate-600 dark:text-slate-300'}">
              <button data-nav="portfolio" title="${item.title}" class="webpart-nav-btn py-2 pl-3 pr-2 text-xs font-semibold rounded-l-md transition-all flex items-center gap-1.5 ${isTabActive ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}">
                <span>Portfolios</span>
                ${hasCustomSelection ? `<span class="px-1.5 py-0.2 bg-blue-500 text-white text-[10px] font-bold rounded-full">${state.selectedPortfolios.length}</span>` : ''}
              </button>
              <button id="btn-toggle-portfolio-picker" title="Switch or Filter Portfolios" class="py-2 px-2 text-xs font-semibold rounded-r-md transition-all flex items-center justify-center border-l cursor-pointer ${isTabActive ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700' : 'text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'}">
                <svg class="w-3.5 h-3.5 transition-transform duration-150 ${state.portfolioPickerOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
            </div>

            <!-- Portfolio Switcher Dropdown Panel (Faithful SPFx portfolioPickerPanel) -->
            ${state.portfolioPickerOpen ? `
              <div id="portfolio-picker-panel" class="absolute left-0 top-full mt-1.5 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 p-3.5 text-slate-800 dark:text-slate-100 animate-fadeIn">
                <div class="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700">
                  <div class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                    Switch & Filter Portfolios
                  </div>
                  <div class="flex items-center gap-2 text-[11px]">
                    <button id="btn-portfolio-select-all" class="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer">Select all</button>
                    <span class="text-slate-300 dark:text-slate-600">|</span>
                    <button id="btn-portfolio-clear" class="text-slate-500 dark:text-slate-400 hover:underline font-semibold cursor-pointer">Clear</button>
                  </div>
                </div>

                <div class="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  ${availablePortfolios.map(pf => {
                    const count = state.data.projects.filter(p => p.portfolio === pf.id || p.portfolioName === pf.name).length;
                    const isChecked = !isNoneSelected && (state.selectedPortfolios.length === 0 || state.selectedPortfolios.includes(pf.id) || state.selectedPortfolios.includes(pf.name));
                    return `
                      <label class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer text-xs select-none transition-colors">
                        <span class="flex items-center gap-2.5">
                          <input type="checkbox" value="${pf.id}" class="chk-portfolio-toggle rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4" ${isChecked ? 'checked' : ''}>
                          <span class="font-medium text-slate-800 dark:text-slate-200">${pf.name}</span>
                        </span>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          ${count}
                        </span>
                      </label>
                    `;
                  }).join('')}
                </div>

                <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
                  <span>${activeCount} of ${availablePortfolios.length} active</span>
                  <button id="btn-close-portfolio-picker" class="text-xs font-semibold px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-800/60 text-blue-700 dark:text-blue-300 transition-colors cursor-pointer">Done</button>
                </div>
              </div>
            ` : ''}
          </div>
        `;
      }

      return `
        <button data-nav="${item.key}" title="${item.title || item.label}" class="webpart-nav-btn py-2 px-3 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${state.currentTab === item.key ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}">
          ${item.label}
        </button>
      `;
    }).join('');

    navContainer.innerHTML = navHtml;

    // Tab click handlers
    navContainer.querySelectorAll('.webpart-nav-btn').forEach(btn => {
      btn.onclick = () => {
        state.currentTab = btn.getAttribute('data-nav');
        state.portfolioPickerOpen = false;
        state.selectedProjectId = null;
        if (state.currentTab === 'myPortfolio') {
          state.portfolioSubView = 'my';
        }
        initTopNav();
        renderView();
      };
    });

    // Portfolio picker toggling and buttons
    const togglePickerBtn = el('btn-toggle-portfolio-picker');
    if (togglePickerBtn) {
      togglePickerBtn.onclick = (e) => {
        e.stopPropagation();
        state.portfolioPickerOpen = !state.portfolioPickerOpen;
        initTopNav();
      };
    }

    const closePickerBtn = el('btn-close-portfolio-picker');
    if (closePickerBtn) {
      closePickerBtn.onclick = (e) => {
        e.stopPropagation();
        state.portfolioPickerOpen = false;
        initTopNav();
      };
    }

    const selectAllBtn = el('btn-portfolio-select-all');
    if (selectAllBtn) {
      selectAllBtn.onclick = (e) => {
        e.stopPropagation();
        state.selectedPortfolios = [];
        initTopNav();
        renderView();
      };
    }

    const clearBtn = el('btn-portfolio-clear');
    if (clearBtn) {
      clearBtn.onclick = (e) => {
        e.stopPropagation();
        state.selectedPortfolios = ['__none__'];
        initTopNav();
        renderView();
      };
    }

    navContainer.querySelectorAll('.chk-portfolio-toggle').forEach(chk => {
      chk.onchange = (e) => {
        e.stopPropagation();
        const allCheckboxes = Array.from(navContainer.querySelectorAll('.chk-portfolio-toggle'));
        const checkedVals = allCheckboxes.filter(c => c.checked).map(c => c.value);
        if (checkedVals.length === allCheckboxes.length) {
          state.selectedPortfolios = [];
        } else if (checkedVals.length === 0) {
          state.selectedPortfolios = ['__none__'];
        } else {
          state.selectedPortfolios = checkedVals;
        }
        initTopNav();
        renderView();
      };
    });

    if (!window._ppmPortfolioClickListenerAttached) {
      window._ppmPortfolioClickListenerAttached = true;
      document.addEventListener('click', (e) => {
        if (!state.portfolioPickerOpen) return;
        const pickerPanel = el('portfolio-picker-panel');
        const toggleBtn = el('btn-toggle-portfolio-picker');
        if (pickerPanel && !pickerPanel.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) {
          state.portfolioPickerOpen = false;
          initTopNav();
        }
      });
    }

    const exportBtn = el('btn-export-excel');
    if (exportBtn) {
      exportBtn.onclick = (e) => { e.preventDefault(); };
    }

    const heatmapBtn = el('btn-toggle-heatmap');
    if (heatmapBtn) {
      heatmapBtn.onclick = () => {
        state.currentTab = (state.currentTab === 'heatmap') ? 'myPortfolio' : 'heatmap';
        state.portfolioPickerOpen = false;
        state.selectedProjectId = null;
        if (state.currentTab === 'myPortfolio') {
          state.portfolioSubView = 'my';
        }
        initTopNav();
        renderView();
      };
    }

    const aboutBtn = el('btn-open-about');
    const aboutModal = el('webpart-about-modal');
    if (aboutBtn && aboutModal) {
      aboutBtn.onclick = () => aboutModal.classList.remove('hidden');
    }
    const closeAboutBtn = el('btn-close-about');
    if (closeAboutBtn && aboutModal) {
      closeAboutBtn.onclick = () => aboutModal.classList.add('hidden');
    }
  }

  // --- Walkthrough Guide System ---
  const walkthroughSteps = [
    {
      badge: 'STEP 1 OF 4 • PORTFOLIOS',
      title: 'Filter by Division or Industry',
      desc: "Click <strong>'Portfolios'</strong> in the header bar to filter initiatives across Manufacturing, Healthcare, Services, Retail, Finance, or Construction.",
      action: () => {
        state.portfolioPickerOpen = true;
        initTopNav();
      }
    },
    {
      badge: 'STEP 2 OF 4 • HEALTH AT A GLANCE',
      title: 'Multi-Dimensional RAG Health',
      desc: "Switch to <strong>Table</strong> view to inspect the 5 objective RAG indicators (Overall, Timeline, Budget, Resources, Scope) for immediate steering committee readiness.",
      action: () => {
        state.portfolioPickerOpen = false;
        state.viewMode = 'table';
        renderView();
        initViewControls();
      }
    },
    {
      badge: 'STEP 3 OF 4 • 7-TAB DRILL-DOWN',
      title: 'Deep-Dive Project Governance Drawer',
      desc: "Click any project to open the 7-tab governance drawer: <strong>Milestones, Risks, Issues, Actions, Decisions, Financials, and Change Log</strong>.",
      action: () => {
        const firstProject = (data.projects && data.projects[0]) ? data.projects[0].id : null;
        if (firstProject) {
          openDrawer(firstProject, 'overview');
        }
      }
    },
    {
      badge: 'STEP 4 OF 4 • RISK MATRIX & EXPORT',
      title: '3×3 Probability Heatmap & 1-Click Export',
      desc: "Explore the interactive <strong>'3×3 Risk Matrix'</strong> tab to prioritize critical risks, or click <strong>'Export'</strong> to generate an instant executive report.",
      action: () => {
        closeDrawer();
        state.viewMode = 'riskMatrix';
        renderView();
        initViewControls();
      }
    }
  ];

  let currentWalkthroughIndex = 0;
  let walkthroughActive = false;

  function renderWalkthroughBar() {
    let host = el('demo-walkthrough-host');
    const demoShell = el('demo-shell-container');
    if (!demoShell) return;

    if (!host) {
      host = document.createElement('div');
      host.id = 'demo-walkthrough-host';
      host.className = 'w-full z-40';
      const topBar = demoShell.firstElementChild;
      if (topBar && topBar.nextSibling) {
        demoShell.insertBefore(host, topBar.nextSibling);
      } else {
        demoShell.prepend(host);
      }
    }

    if (!walkthroughActive) {
      host.innerHTML = '';
      return;
    }

    const step = walkthroughSteps[currentWalkthroughIndex];
    host.innerHTML = `
      <div id="demo-walkthrough-bar" class="m-2 sm:m-3 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white shadow-xl border border-white/20 transition-all duration-300">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-start sm:items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-lg shrink-0">🧭</div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-blue-100">${step.badge}</span>
                <h4 class="font-bold text-sm sm:text-base text-white">${step.title}</h4>
              </div>
              <p class="text-xs text-blue-100 mt-1 leading-relaxed max-w-3xl">${step.desc}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
            ${currentWalkthroughIndex > 0 ? `
              <button id="walkthrough-btn-prev" class="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition cursor-pointer">
                ← Back
              </button>
            ` : ''}
            <button id="walkthrough-btn-next" class="px-3.5 py-1.5 rounded-lg bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold shadow-md transition cursor-pointer">
              ${currentWalkthroughIndex < walkthroughSteps.length - 1 ? 'Next Step →' : 'Finish Walkthrough ✓'}
            </button>
            <button id="walkthrough-btn-close" class="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition text-xs font-bold cursor-pointer" title="Close Guide">
              ✕
            </button>
          </div>
        </div>
      </div>
    `;

    const prevBtn = el('walkthrough-btn-prev');
    if (prevBtn) {
      prevBtn.onclick = () => {
        if (currentWalkthroughIndex > 0) {
          currentWalkthroughIndex--;
          renderWalkthroughBar();
          if (walkthroughSteps[currentWalkthroughIndex].action) {
            walkthroughSteps[currentWalkthroughIndex].action();
          }
        }
      };
    }

    const nextBtn = el('walkthrough-btn-next');
    if (nextBtn) {
      nextBtn.onclick = () => {
        if (currentWalkthroughIndex < walkthroughSteps.length - 1) {
          currentWalkthroughIndex++;
          renderWalkthroughBar();
          if (walkthroughSteps[currentWalkthroughIndex].action) {
            walkthroughSteps[currentWalkthroughIndex].action();
          }
        } else {
          window.hideDemoWalkthrough();
        }
      };
    }

    const closeBtn = el('walkthrough-btn-close');
    if (closeBtn) {
      closeBtn.onclick = () => window.hideDemoWalkthrough();
    }
  }

  window.showDemoWalkthrough = function () {
    walkthroughActive = true;
    currentWalkthroughIndex = 0;
    renderWalkthroughBar();
    if (walkthroughSteps[0].action) {
      walkthroughSteps[0].action();
    }
  };

  window.hideDemoWalkthrough = function () {
    walkthroughActive = false;
    renderWalkthroughBar();
  };

  window.switchPpmPortfolio = function (portfolioId) {
    if (!portfolioId || portfolioId === 'all') {
      state.selectedPortfolios = [];
    } else {
      state.selectedPortfolios = [portfolioId];
    }
    state.portfolioPickerOpen = false;
    initTopNav();
    renderView();
  };

  window.initPpmDemo = function () {
    try {
      const params = new URLSearchParams(window.location.search);
      const projectParam = params.get('project');
      const tabParam = params.get('tab');
      const portfolioParam = params.get('portfolio');
      if (portfolioParam) {
        if (portfolioParam.toLowerCase() === 'all') {
          state.selectedPortfolios = [];
        } else {
          state.selectedPortfolios = [portfolioParam];
        }
      }
      if (projectParam && state.data && state.data.projects) {
        const found = state.data.projects.find(p => p.code.toLowerCase() === projectParam.toLowerCase() || String(p.id) === projectParam);
        if (found) {
          state.selectedProjectId = found.id;
          if (tabParam) {
            state.projectDrawerTab = tabParam;
          }
        }
      }
    } catch (e) {
      console.warn('Deep link param parse error:', e);
    }
    state.portfolioSubView = 'my';
    initTopNav();
    renderView();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initPpmDemo);
  } else {
    window.initPpmDemo();
  }
})();
