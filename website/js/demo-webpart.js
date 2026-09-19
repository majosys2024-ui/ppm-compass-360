/**
 * PPM Compass 360 - Interactive WebPart Replica
 * Faithfully mirrors the SPFx React component hierarchy,
 * including zr (Project Detail Drawer), vr (Overview Tab), yr (Status History),
 * nr (Milestones), Sr (Change Requests), Ir (Risks & Issues), Cr (Financials), and Br (Team).
 */

(function () {
  const state = {
    currentTab: 'portfolio', // 'portfolio', 'myPortfolio', 'myProjects', 'globalSearch', 'allMilestones', 'allRisksIssues', 'analytics', 'heatmap'
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
    isFullscreen: false,
    aboutDialogOpen: false,
    selectedRiskCell: null,
    selectedProjectRiskCell: null,
    selectedKpiTile: null, // null, 'rag', 'schedule', 'finance', 'blockers', 'phase'
    includeConvertedIssues: true,
    editingQuickLinks: false,
    data: JSON.parse(JSON.stringify(window.PPM_DEMO_DATA))
  };

  const el = (id) => document.getElementById(id);

  function getFilteredProjects() {
    return state.data.projects.filter(p => {
      if (state.currentTab === 'myProjects' && !['Sarah Jenkins', 'Amara Diallo', 'Dr. Aris Thorne'].includes(p.lead)) {
        return false;
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
        return { bg: 'bg-emerald-50 dark:bg-emerald-950/50', border: 'border-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', dot: '#16a34a' };
      case 'On Track':
        return { bg: 'bg-teal-50 dark:bg-teal-950/50', border: 'border-teal-500', text: 'text-teal-700 dark:text-teal-300', dot: '#0d9488' };
      case 'At Risk':
        return { bg: 'bg-amber-50 dark:bg-amber-950/50', border: 'border-amber-500', text: 'text-amber-700 dark:text-amber-300', dot: '#d97706' };
      case 'Delayed':
        return { bg: 'bg-rose-50 dark:bg-rose-950/50', border: 'border-rose-500', text: 'text-rose-700 dark:text-rose-300', dot: '#dc2626' };
      case 'Cancelled':
        return { bg: 'bg-purple-50 dark:bg-purple-950/50', border: 'border-purple-500', text: 'text-purple-700 dark:text-purple-300', dot: '#7c6fa6' };
      default:
        return { bg: 'bg-slate-50 dark:bg-slate-800', border: 'border-slate-400', text: 'text-slate-600 dark:text-slate-300', dot: '#6b7280' };
    }
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

    const containerWidth = 840;
    const paddingLeft = 45;
    const usableWidth = containerWidth - 90;

    const parsedItems = timelineItems.map(m => {
      const dateStr = m.actualDate || m.forecastDate || m.baselineDate;
      const dateMs = new Date(dateStr).getTime();
      const x = paddingLeft + ((dateMs - minTime) / timeSpan) * usableWidth;
      return {
        ...m,
        dateStr,
        dateMs,
        x: Math.round(x)
      };
    });

    parsedItems.sort((a, b) => a.dateMs - b.dateMs);

    // Collision avoidance: module 9091 logic checks items within 92px
    const placed = [];
    const renderedItems = parsedItems.map(item => {
      const closeNeighbors = placed.filter(p => Math.abs(p.x - item.x) < 92);
      const tier = closeNeighbors.length;
      placed.push({ x: item.x, tier });

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
        stemHtml = `<div class="ppm-timeline-stem" style="left: ${item.x}px; top: 110px; height: 33px;"></div>`;
      } else if (tier === 3) {
        markerTop = 51;
        labelTop = 18;
        stemHtml = `<div class="ppm-timeline-stem" style="left: ${item.x}px; top: 77px; height: 33px;"></div>`;
      } else {
        const dir = (tier % 2 === 1) ? -1 : 1;
        const step = Math.floor(tier / 2);
        const offset = dir * (46 + (step - 1) * 32);
        markerTop = 97 + offset;
        labelTop = dir > 0 ? markerTop + 33 : markerTop - 34;
        const stemTop = dir > 0 ? 110 : (markerTop + 26);
        const stemHeight = Math.abs(markerTop + (dir > 0 ? 0 : 26) - 110);
        stemHtml = `<div class="ppm-timeline-stem" style="left: ${item.x}px; top: ${stemTop}px; height: ${stemHeight}px;"></div>`;
      }

      const style = getMilestoneStatusStyle(item.status);
      const icon = getMilestoneIcon(item.eventType, item.isPhaseGate);

      return `
        ${stemHtml}
        <!-- Marker -->
        <div class="ppm-timeline-marker border-2 ${style.border} ${style.bg}" 
             style="position: absolute; left: ${item.x - 13}px; top: ${markerTop}px;" 
             title="${item.milestoneId ? item.milestoneId + ': ' : ''}${item.title} (${item.dateStr}) — [${item.eventType || 'Milestone'}] ${item.status}">
          ${icon}
        </div>
        <!-- Label -->
        <div class="ppm-timeline-label" style="left: ${item.x}px; top: ${labelTop}px;">
          <div class="ppm-timeline-label-title" title="${item.title}">${item.title}</div>
          <div class="ppm-timeline-label-date">${item.dateStr}</div>
          <div class="inline-flex items-center gap-1 mt-0.5 px-1 py-0.2 rounded text-[9px] font-bold ${style.bg} ${style.text}">
            <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${style.dot};"></span>
            <span>${item.status}</span>
          </div>
        </div>
      `;
    }).join('');

    const todayMs = new Date('2026-09-17').getTime();
    let todayLineHtml = '';
    if (todayMs >= minTime && todayMs <= maxTime) {
      const todayX = Math.round(paddingLeft + ((todayMs - minTime) / timeSpan) * usableWidth);
      todayLineHtml = `
        <div class="ppm-timeline-today-line" style="left: ${todayX}px;"></div>
        <div class="ppm-timeline-today-badge" style="left: ${todayX}px;">Today (17 Sep)</div>
      `;
    }

    return `
      <div class="ppm-timeline-wrap">
        <div class="ppm-timeline-container" style="width: ${containerWidth}px;">
          <!-- Axis Line -->
          <div class="ppm-timeline-axis"></div>

          <!-- Project Bounds -->
          ${!isNaN(projectStartMs) ? `
            <div class="absolute text-[10px] text-slate-400 font-mono" style="left: 30px; top: 118px;">
              ▶ Start: ${project.startDate}
            </div>
          ` : ''}
          ${!isNaN(projectTargetMs) ? `
            <div class="absolute text-[10px] text-slate-400 font-mono text-right" style="right: 30px; top: 118px;">
              Target: ${project.targetDate} 🏁
            </div>
          ` : ''}

          <!-- Today line -->
          ${todayLineHtml}

          <!-- Events -->
          ${renderedItems}
        </div>
      </div>

      <!-- Footer Legend & Controls -->
      <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <div class="flex items-center gap-3">
          <span class="font-semibold text-slate-600 dark:text-slate-400">Legend:</span>
          <span class="inline-flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> Completed</span>
          <span class="inline-flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-teal-500"></span> On Track</span>
          <span class="inline-flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-500"></span> At Risk</span>
          <span class="inline-flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-rose-500"></span> Delayed</span>
        </div>
        <div class="flex items-center gap-2">
          <span>Showing <strong>${timelineItems.length}</strong> of <strong>${projectMilestones.length}</strong> milestones</span>
          <span>•</span>
          <button class="btn-jump-tab text-blue-600 hover:underline font-medium" data-target-tab="milestones">Configure items in Milestones tab →</button>
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
        <div class="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg shadow-xs">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700 select-none">
              <tr>
                <th class="py-2.5 px-3">Project</th>
                <th class="py-2.5 px-3">Phase</th>
                <th class="py-2.5 px-3">Lead / Sponsor</th>
                <th class="py-2.5 px-2 text-center">Overall</th>
                <th class="py-2.5 px-2 text-center">Timeline</th>
                <th class="py-2.5 px-2 text-center">Budget</th>
                <th class="py-2.5 px-2 text-center">Resources</th>
                <th class="py-2.5 px-2 text-center">Scope</th>
                <th class="py-2.5 px-3">Progress</th>
                <th class="py-2.5 px-3 text-right">Target Date</th>
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
                  <td class="py-2.5 px-3 w-28">
                    <div class="flex items-center gap-2">
                      <div class="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div class="bg-blue-600 h-full rounded-full" style="width: ${p.percentComplete}%"></div>
                      </div>
                      <span class="text-[11px] font-medium text-slate-600 dark:text-slate-400">${p.percentComplete}%</span>
                    </div>
                  </td>
                  <td class="py-2.5 px-3 text-right font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    ${p.targetDate}
                  </td>
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

    let projects = state.data.projects;
    if (state.selectedPortfolio !== 'all') {
      projects = projects.filter(p => p.portfolio === state.selectedPortfolio);
    }

    const projectIds = projects.map(p => p.id);
    const milestones = state.data.milestones.filter(m => projectIds.includes(m.projectId));
    const risks = state.data.risksIssues.filter(r => projectIds.includes(r.projectId));
    const financials = state.data.financials.filter(f => projectIds.includes(f.projectId));
    const statusReports = state.data.statusReports.filter(s => projectIds.includes(s.projectId));

    // KPI 1: RAG Health
    const redProjects = projects.filter(p => p.ragOverall === 'Red');
    const yellowProjects = projects.filter(p => p.ragOverall === 'Yellow');
    const greenProjects = projects.filter(p => p.ragOverall === 'Green');

    // KPI 2: On-Time Health
    const delayedMilestones = milestones.filter(m => m.status === 'Delayed' || (m.forecastDate > m.baselineDate && m.status !== 'Completed'));
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
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b">
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
                      <button data-drill-id="${p.id}" class="btn-open-from-drill text-blue-600 font-medium hover:underline">Open Drawer →</button>
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
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b">
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
                      <td class="py-2 px-3 font-mono ${m.forecastDate > m.baselineDate ? 'text-rose-600 font-bold' : ''}">${m.forecastDate}</td>
                      <td class="py-2 px-3 text-center">
                        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${m.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : (m.forecastDate > m.baselineDate ? 'bg-rose-100 text-rose-800' : 'bg-teal-100 text-teal-800')}">${m.status}</span>
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
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b">
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
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b">
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
            <h2 class="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">My Portfolio — Executive Cockpit</h2>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">Portfolio Owner View</span>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Real-time delivery KPIs, milestone variance, budget burn, and active blockers for your assigned portfolio.
          </p>
        </div>
        <div class="flex items-center gap-2 self-start sm:self-auto">
          <label class="text-xs font-semibold text-slate-500">Portfolio Scope:</label>
          <select id="select-my-portfolio" class="text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-2xs">
            <option value="all" ${state.selectedPortfolio === 'all' ? 'selected' : ''}>All Portfolios (${state.data.projects.length} Projects)</option>
            ${state.data.portfolios.filter(p => p.id !== 'all').map(p => {
              const cnt = state.data.projects.filter(prj => prj.portfolio === p.id || prj.portfolioName === p.name).length;
              return `<option value="${p.id}" ${state.selectedPortfolio === p.id || state.selectedPortfolio === p.name ? 'selected' : ''}>${p.name} (${cnt})</option>`;
            }).join('')}
          </select>
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
              ${statusReports.slice(0, 3).map(s => `
                <div class="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <span class="font-semibold text-slate-800 dark:text-slate-200">${s.projectCode} — ${s.period} Report</span>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] text-slate-400 font-mono">Submitted ${s.submittedDate}</span>
                    ${getRagBadge(s.rag, false)}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Secondary Card B: Upcoming Milestones (Next 30 Days) -->
          <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
              <div class="flex items-center gap-2">
                <span class="text-sm">🎯</span>
                <h4 class="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Upcoming Checkpoints & Gates (Next 30 Days)</h4>
              </div>
              <span class="text-xs text-blue-600 font-semibold font-mono">${milestones.filter(m => m.status !== 'Completed').length} Pending</span>
            </div>
            <div class="space-y-2 text-xs mt-3">
              ${milestones.filter(m => m.status !== 'Completed').slice(0, 4).map(m => {
                const prj = projects.find(p => p.id === m.projectId);
                return `
                  <div class="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <div>
                      <div class="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>${getMilestoneIcon(m.eventType, m.isPhaseGate)}</span>
                        <span>${m.title}</span>
                      </div>
                      <div class="text-[10px] text-slate-400 mt-0.5">${prj ? prj.title : ''} • Phase: ${m.phase}</div>
                    </div>
                    <div class="text-right font-mono text-[11px]">
                      <div class="${m.forecastDate > m.baselineDate ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-300'}">${m.forecastDate}</div>
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
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div class="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm">📋</span>
            <h4 class="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Portfolio Project Master Roster</h4>
          </div>
          <span class="text-xs text-slate-500">${projects.length} Active Projects</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50/60 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
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
                const prjMilestones = milestones.filter(m => m.projectId === p.id && m.status !== 'Completed');
                const nextM = prjMilestones.length > 0 ? prjMilestones[0] : null;

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
    const selPortfolio = el('select-my-portfolio');
    if (selPortfolio) {
      selPortfolio.onchange = () => {
        state.selectedPortfolio = selPortfolio.value;
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

  function renderAllMilestonesView() {
    const container = el('webpart-view-container');
    if (!container) return;

    const activeProjectIds = getFilteredProjects().map(p => p.id);
    const milestones = state.data.milestones.filter(m => activeProjectIds.includes(m.projectId));

    container.innerHTML = `
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">All Milestones & Phase Gate Roadmap</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Cross-project milestone roadmap with baseline date drift analysis</p>
        </div>
        <button id="btn-snapshot-now" class="px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs">
          <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
          Capture Snapshot
        </button>
      </div>

      <div class="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg shadow-xs">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th class="py-2.5 px-3">Milestone Title</th>
              <th class="py-2.5 px-3">Project</th>
              <th class="py-2.5 px-3">Type / Gate</th>
              <th class="py-2.5 px-3">Baseline</th>
              <th class="py-2.5 px-3">Forecast</th>
              <th class="py-2.5 px-3">Actual Date</th>
              <th class="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
            ${milestones.map(m => {
              const project = state.data.projects.find(p => p.id === m.projectId) || {};
              const statusColors = {
                'Completed': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
                'On Track': 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
                'At Risk': 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
                'Delayed': 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
              };
              return `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td class="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                    <div class="flex items-center gap-1.5">
                      <span class="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 text-xs">
                        ${getMilestoneIcon(m.eventType, m.isPhaseGate)}
                      </span>
                      <span>${m.title}</span>
                    </div>
                  </td>
                  <td class="py-2.5 px-3 text-slate-600 dark:text-slate-400">${project.title || '—'}</td>
                  <td class="py-2.5 px-3">
                    <span class="px-2 py-0.5 rounded text-[10px] font-medium ${m.isPhaseGate ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}">
                      ${m.eventType || (m.isPhaseGate ? 'Phase Gate' : m.phase)}
                    </span>
                  </td>
                  <td class="py-2.5 px-3 font-mono text-[11px] text-slate-500">${m.baselineDate}</td>
                  <td class="py-2.5 px-3 font-mono text-[11px] ${m.forecastDate > m.baselineDate ? 'text-amber-600 font-semibold' : 'text-slate-700 dark:text-slate-300'}">${m.forecastDate}</td>
                  <td class="py-2.5 px-3 font-mono text-[11px] text-slate-700 dark:text-slate-300">${m.actualDate || '—'}</td>
                  <td class="py-2.5 px-3 text-center">
                    <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[m.status] || 'bg-slate-100 text-slate-800'}">
                      ${m.status}
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    const snapshotBtn = el('btn-snapshot-now');
    if (snapshotBtn) {
      snapshotBtn.onclick = () => {
        alert('Snapshot captured! Stored in PM_APP_MilestoneSnapshots for baseline trend comparison.');
      };
    }
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

    const activeProjectIds = getFilteredProjects().map(p => p.id);
    const risks = state.data.risksIssues.filter(r => activeProjectIds.includes(r.projectId));

    // 3x3 Risk & Issue Matrix (Likelihood [3,2,1] x Impact [1,2,3])
    // Rows: Likelihood High(3), Medium(2), Low(1)
    // Cols: Impact Low(1), Medium(2), High(3)
    const matrix = [
      [[], [], []], // Likelihood 3 (High)
      [[], [], []], // Likelihood 2 (Medium)
      [[], [], []]  // Likelihood 1 (Low)
    ];

    risks.forEach(r => {
      // Exclude plain issues unless converted from risk or includeConvertedIssues is true
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

    container.innerHTML = `
      <div class="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Interactive 3×3 Risk & Issue Matrix</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">PMBOK Probability × Impact</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Standard 3×3 PMO heat map. Click any cell to filter the register by Likelihood and Impact coordinates.</p>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" id="toggle-converted-issues" ${state.includeConvertedIssues ? 'checked' : ''} class="rounded text-blue-600 focus:ring-blue-500">
            <span>Include converted Issues</span>
          </label>
          ${state.selectedRiskCell ? '<button id="btn-clear-matrix-filter" class="text-xs px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 font-semibold text-slate-800 dark:text-slate-200">✕ Clear Cell Filter</button>' : ''}
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        <!-- 3x3 Grid Container -->
        <div class="lg:col-span-6 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div class="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
            <span class="uppercase tracking-wider text-[11px]">Probability vs Impact Grid (3×3)</span>
            ${state.selectedRiskCell ? `<span class="text-[11px] font-bold text-blue-600">Selected: L=${state.selectedRiskCell[0]} × I=${state.selectedRiskCell[1]}</span>` : '<span class="text-[11px] text-slate-400">Showing all coordinates</span>'}
          </div>

          <div class="flex items-center">
            <div class="-rotate-90 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mr-2 select-none">Likelihood</div>
            <div class="flex-1">
              <div class="grid grid-cols-3 gap-2 text-center text-xs">
                ${[3, 2, 1].map((l, lIdx) => {
                  return [1, 2, 3].map((impact, iIdx) => {
                    const cellRisks = matrix[lIdx][iIdx];
                    const count = cellRisks.length;
                    const isSelected = state.selectedRiskCell && state.selectedRiskCell[0] === l && state.selectedRiskCell[1] === impact;
                    return `
                      <button data-l="${l}" data-i="${impact}" class="matrix-cell h-14 rounded-lg font-black text-sm flex flex-col items-center justify-center transition-all hover:scale-105 ${get3x3CellColor(cellRisks)} ${isSelected ? 'ring-4 ring-blue-600 ring-offset-2 scale-105 shadow-md' : ''}">
                        <span>${count > 0 ? count : '—'}</span>
                        <span class="text-[9px] font-normal opacity-80">${lLabels[l].split(' ')[0]}×${iLabels[impact].split(' ')[0]}</span>
                      </button>
                    `;
                  }).join('');
                }).join('')}
              </div>
              <div class="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 px-2 select-none">
                <span>Low (1)</span>
                <span>Impact</span>
                <span>High (3)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Matrix Summary Panel -->
        <div class="lg:col-span-6 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-xs">
          <div>
            <h4 class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">PMBOK 3×3 Risk Governance</h4>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Standard PMO probability-impact matrix. Cell counts show item density, colored by the worst severity present. Clicking a cell filters the register table below.
            </p>
          </div>

          <div class="grid grid-cols-3 gap-2.5 my-3 text-center">
            <div class="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900">
              <div class="text-lg font-extrabold text-rose-600 dark:text-rose-400">${risks.filter(r => r.severity === 'Critical').length}</div>
              <div class="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Critical</div>
              <div class="text-[9px] text-slate-400">Immediate Escalation</div>
            </div>
            <div class="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-900">
              <div class="text-lg font-extrabold text-amber-600 dark:text-amber-400">${risks.filter(r => r.severity === 'High').length}</div>
              <div class="text-[11px] font-semibold text-slate-600 dark:text-slate-300">High</div>
              <div class="text-[9px] text-slate-400">Active Mitigation</div>
            </div>
            <div class="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-900">
              <div class="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">${risks.filter(r => r.severity === 'Medium' || r.severity === 'Low').length}</div>
              <div class="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Med / Low</div>
              <div class="text-[9px] text-slate-400">Standard Monitoring</div>
            </div>
          </div>

          <div class="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-900/50 p-2 rounded border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>🛡️ Rating is manual, not auto-overridden</span>
            <span>Zero extra queries • OData compliant</span>
          </div>
        </div>
      </div>

      <!-- Risk Register Table filtered by 3x3 cell -->
      <div class="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg shadow-xs">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th class="py-2.5 px-3">Type</th>
              <th class="py-2.5 px-3">Title & Description</th>
              <th class="py-2.5 px-3">Project</th>
              <th class="py-2.5 px-2 text-center">Likelihood × Impact</th>
              <th class="py-2.5 px-3 text-center">Rating</th>
              <th class="py-2.5 px-3">Strategy</th>
              <th class="py-2.5 px-3">Owner</th>
              <th class="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
            ${risks.filter(r => {
              if (r.itemType === 'Issue' && !r.convertedFromRisk && !state.includeConvertedIssues) return false;
              if (state.selectedRiskCell) {
                const l = Math.min(3, Math.max(1, r.likelihood || 1));
                const i = Math.min(3, Math.max(1, r.impact || 1));
                return l === state.selectedRiskCell[0] && i === state.selectedRiskCell[1];
              }
              return true;
            }).map(r => `
              <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td class="py-2.5 px-3">
                  <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${r.itemType === 'Issue' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'}">
                    ${r.itemType}
                  </span>
                </td>
                <td class="py-2.5 px-3 max-w-xs">
                  <div class="font-semibold text-slate-900 dark:text-white">${r.title}</div>
                  <div class="text-[11px] text-slate-500 line-clamp-1 mt-0.5">${r.description}</div>
                </td>
                <td class="py-2.5 px-3 text-slate-600 dark:text-slate-400">${r.projectTitle}</td>
                <td class="py-2.5 px-2 text-center font-mono font-bold">
                  ${(r.likelihood || 1)} × ${(r.impact || 1)}
                </td>
                <td class="py-2.5 px-3 text-center">
                  <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    r.severity === 'Critical' ? 'bg-rose-600 text-white' :
                    r.severity === 'High' ? 'bg-rose-100 text-rose-800' :
                    r.severity === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }">${r.rating || r.severity}</span>
                </td>
                <td class="py-2.5 px-3 text-slate-600 dark:text-slate-400">${r.strategy}</td>
                <td class="py-2.5 px-3 text-slate-800 dark:text-slate-200 font-medium">${r.owner}</td>
                <td class="py-2.5 px-3 text-right">
                  ${r.itemType === 'Risk' ? `
                    <button data-convert-id="${r.id}" class="btn-convert-risk text-[11px] px-2 py-1 font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 rounded border border-rose-200">
                      Convert to Issue
                    </button>
                  ` : '<span class="text-[10px] text-slate-400">Issue Active</span>'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

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
          alert(`Risk "${target.title}" converted to active Issue! Timestamp recorded in PM_APP_RisksIssues.`);
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

    const activeProjectIds = getFilteredProjects().map(p => p.id);
    const allocations = state.data.teamAllocations.filter(a => activeProjectIds.includes(a.projectId));

    container.innerHTML = `
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">Resource Capacity Heatmap</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Team commitment percentages across active projects (from PM_APP_ProjectAllocations)</p>
        </div>
        <span class="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">Target: Max 100% FTE</span>
      </div>

      <div class="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg shadow-xs">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th class="py-2.5 px-3">Team Member</th>
              <th class="py-2.5 px-3">Role</th>
              <th class="py-2.5 px-3">Assigned Project</th>
              <th class="py-2.5 px-3 text-center">FTE %</th>
              <th class="py-2.5 px-3">Function</th>
              <th class="py-2.5 px-3 text-center">Allocation Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
            ${allocations.map(a => {
              const project = state.data.projects.find(p => p.id === a.projectId) || {};
              const isOverallocated = a.ftePercent > 100;
              return `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td class="py-2.5 px-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center justify-center text-[10px] font-bold">
                      ${a.personName.split(' ').map(n=>n[0]).join('')}
                    </span>
                    <span>${a.personName}</span>
                  </td>
                  <td class="py-2.5 px-3 font-medium text-slate-600 dark:text-slate-300">${a.role}</td>
                  <td class="py-2.5 px-3 text-slate-700 dark:text-slate-300">${project.title || '—'}</td>
                  <td class="py-2.5 px-3 text-center font-mono font-bold ${isOverallocated ? 'text-rose-600' : 'text-slate-700 dark:text-slate-200'}">
                    ${a.ftePercent}%
                  </td>
                  <td class="py-2.5 px-3 text-slate-500">${a.function}</td>
                  <td class="py-2.5 px-3 text-center">
                    <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      isOverallocated ? 'bg-rose-100 text-rose-800' :
                      a.ftePercent >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }">
                      ${isOverallocated ? 'Over-allocated' : a.ftePercent >= 80 ? 'Fully Utilized' : 'Available'}
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
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
                <div class="absolute right-0 mt-1 w-60 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-50 text-xs">
                  <div class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-700/50">
                    Project Leader Export (Local)
                  </div>
                  <button id="btn-export-pdf" class="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2">
                    <span>📄</span> <span>PDF (A4 Executive 1-Pager)</span>
                  </button>
                  <button id="btn-export-pptx" class="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2">
                    <span>📊</span> <span>PowerPoint (Executive 1-Slide)</span>
                  </button>
                  <button id="btn-export-xlsx" class="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 font-medium text-emerald-600">
                    <span>📗</span> <span>Excel (Entire Project Snapshot)</span>
                  </button>
                  <div class="px-3 py-1.5 text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/50">
                    🔒 No data egress — Generated in browser
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
                <!-- Sponsor attention risks -->
                <div class="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                  <div>
                    <h4 class="font-bold text-slate-900 dark:text-white">Issues & Risks for Sponsor's Attention</h4>
                    ${sponsorRisks.length > 0 ? `
                      <div class="mt-2 space-y-2">
                        ${sponsorRisks.map(r => `
                          <div class="p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800">
                            <div class="flex items-center justify-between">
                              <span class="px-1.5 py-0.2 rounded text-[10px] font-bold ${r.itemType === 'Issue' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}">${r.itemType} · ${r.rating}</span>
                              <span class="text-[10px] text-slate-400 font-medium">Owner: ${r.owner}</span>
                            </div>
                            <div class="text-[11px] text-slate-700 dark:text-slate-300 mt-1">${r.description}</div>
                          </div>
                        `).join('')}
                      </div>
                    ` : '<div class="text-slate-400 mt-2">Nothing flagged for sponsor attention.</div>'}
                  </div>
                  <button class="btn-jump-tab text-blue-600 hover:underline text-left mt-3 font-medium text-[11px]" data-target-tab="risks">View full register →</button>
                </div>

                <!-- Change History -->
                <div class="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                  <div>
                    <h4 class="font-bold text-slate-900 dark:text-white">Change History</h4>
                    ${recentCrs.length > 0 ? `
                      <div class="mt-2 space-y-2">
                        ${recentCrs.map(c => `
                          <div class="p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800">
                            <div class="flex items-center justify-between text-[10px]">
                              <span class="font-mono font-bold">${c.crNumber} (${c.crDate})</span>
                              <span class="px-1.5 py-0.2 rounded font-bold ${c.approvalStatus === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${c.approvalStatus}</span>
                            </div>
                            <div class="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5">${c.title}</div>
                          </div>
                        `).join('')}
                      </div>
                    ` : '<div class="text-slate-400 mt-2">No change requests logged.</div>'}
                  </div>
                  <button class="btn-jump-tab text-blue-600 hover:underline text-left mt-3 font-medium text-[11px]" data-target-tab="crs">View all change requests →</button>
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
                  <span class="text-blue-600 hover:underline cursor-pointer btn-jump-tab" data-target-tab="milestones">Configure items in Milestones tab →</span>
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
                <!-- Upcoming Milestones -->
                <div class="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                  <div>
                    <h4 class="font-bold text-slate-900 dark:text-white">Milestones / Deliverables — upcoming</h4>
                    <table class="w-full text-left text-[11px] mt-2">
                      <thead>
                        <tr class="text-slate-400 border-b">
                          <th class="py-1">Milestone</th>
                          <th class="py-1">Baseline</th>
                          <th class="py-1">Forecast</th>
                          <th class="py-1 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                        ${upcomingMilestones.map(m => `
                          <tr>
                            <td class="py-1 font-medium">
                              <div class="flex items-center gap-1.5">
                                <span class="text-xs">${getMilestoneIcon(m.eventType, m.isPhaseGate)}</span>
                                <span>${m.milestoneId ? m.milestoneId + ' — ' : ''}${m.title}</span>
                              </div>
                            </td>
                            <td class="py-1 font-mono text-slate-500">${m.baselineDate}</td>
                            <td class="py-1 font-mono ${m.forecastDate > m.baselineDate ? 'text-amber-600 font-bold' : ''}">${m.forecastDate}</td>
                            <td class="py-1 text-center"><span class="px-1.5 py-0.2 rounded text-[9px] font-bold ${m.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${m.status}</span></td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                  <button class="btn-jump-tab text-blue-600 hover:underline text-left mt-3 font-medium text-[11px]" data-target-tab="milestones">View all milestones →</button>
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

      // TAB 3: MILESTONES (nr from bundle)
      case 'milestones': {
        return `
          <div class="space-y-3 text-xs">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-bold text-slate-900 dark:text-white text-sm">Project Milestones & Deliverables</h4>
                <p class="text-[11px] text-slate-500">Track baseline dates vs forecast dates. Check "On Timeline" to define which deliverables appear on the High-level timeline view.</p>
              </div>
              <div class="flex gap-2">
                <button id="btn-snapshot-now-tab" class="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border font-medium">Capture Snapshot</button>
                <button id="btn-add-milestone" class="px-2 py-1 rounded bg-blue-600 text-white font-medium hover:bg-blue-700">+ New Milestone</button>
              </div>
            </div>

            <!-- 6-Color Milestone Status Legend Bar -->
            <div class="flex flex-wrap items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-md text-[11px]">
              <span class="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status:</span>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-semibold"><span class="w-2 h-2 rounded-full bg-emerald-600"></span> Completed</span>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 font-semibold"><span class="w-2 h-2 rounded-full bg-blue-600"></span> In Progress</span>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 font-semibold"><span class="w-2 h-2 rounded-full bg-amber-600"></span> At Risk</span>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 font-semibold"><span class="w-2 h-2 rounded-full bg-rose-600"></span> Late / Delayed</span>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 font-semibold"><span class="w-2 h-2 rounded-full bg-purple-600"></span> Paused</span>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 font-semibold"><span class="w-2 h-2 rounded-full bg-slate-400"></span> Planned</span>
            </div>

            <div class="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
              <table class="w-full text-left">
                <thead class="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b">
                  <tr>
                    <th class="py-2 px-2.5">ID</th>
                    <th class="py-2 px-2.5">Milestone</th>
                    <th class="py-2 px-2.5">Type</th>
                    <th class="py-2 px-2.5">Phase</th>
                    <th class="py-2 px-2.5">Baseline Date</th>
                    <th class="py-2 px-2.5">Forecast Date</th>
                    <th class="py-2 px-2.5 text-center">Status</th>
                    <th class="py-2 px-2.5 text-center" title="PL defines which items render in the High-level timeline view">On Timeline</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  ${milestones.map(m => `
                    <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td class="py-2 px-2.5 font-mono text-slate-400">${m.milestoneId || '—'}</td>
                      <td class="py-2 px-2.5 font-medium">
                        <div class="flex items-center gap-1.5">
                          <span class="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-100 dark:bg-slate-700 text-xs">
                            ${getMilestoneIcon(m.eventType, m.isPhaseGate)}
                          </span>
                          <span>${m.title}</span>
                        </div>
                      </td>
                      <td class="py-2 px-2.5">
                        <span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          ${m.eventType || (m.isPhaseGate ? 'Gate' : 'Milestone')}
                        </span>
                      </td>
                      <td class="py-2 px-2.5 text-slate-500">${m.phase}</td>
                      <td class="py-2 px-2.5 font-mono text-slate-500">${m.baselineDate}</td>
                      <td class="py-2 px-2.5 font-mono ${m.forecastDate > m.baselineDate ? 'text-amber-600 font-bold' : ''}">${m.forecastDate}</td>
                      <td class="py-2 px-2.5 text-center">
                        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${m.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                          ${m.status}
                        </span>
                      </td>
                      <td class="py-2 px-2.5 text-center">
                        <label class="inline-flex items-center cursor-pointer" title="Toggle visibility in Timeline view">
                          <input type="checkbox" class="chk-toggle-ms-timeline rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4" data-id="${m.id}" ${m.showOnTimeline !== false ? 'checked' : ''}>
                        </label>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
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

      // TAB 5: RISKS & ISSUES (Ir from bundle)
      case 'risks': {
        const cellCounts = {};
        for (let l = 1; l <= 3; l++) {
          for (let i = 1; i <= 3; i++) {
            cellCounts[`${l}x${i}`] = risks.filter(r => r.likelihood === l && r.impact === i);
          }
        }

        const filteredRisks = state.selectedProjectRiskCell
          ? risks.filter(r => `${r.likelihood}x${r.impact}` === state.selectedProjectRiskCell)
          : risks;

        return `
          <div class="space-y-3 text-xs">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-bold text-slate-900 dark:text-white text-sm">Project Risk & Issue Register</h4>
                <p class="text-[11px] text-slate-500">Interactive 3×3 Matrix · Low (1) / Medium (2) / High (3) · Zero external APIs</p>
              </div>
              <button id="btn-new-risk" class="px-2.5 py-1 rounded bg-blue-600 text-white font-medium hover:bg-blue-700">+ New Risk / Issue</button>
            </div>

            <!-- Compact Project 3x3 Risk & Issue Matrix -->
            <div class="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-lg border border-slate-200 dark:border-slate-700">
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-slate-700 dark:text-slate-200 text-xs">3×3 Risk & Issue Heatmap</span>
                ${state.selectedProjectRiskCell ? `
                  <button id="btn-clear-project-risk-cell" class="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    Clear Cell Filter (${state.selectedProjectRiskCell}) ✕
                  </button>
                ` : '<span class="text-[10px] text-slate-400">Click a cell to filter items below</span>'}
              </div>

              <div class="inline-block min-w-full">
                <div class="grid grid-cols-4 gap-1.5 text-center">
                  <div class="p-1 text-[10px] font-bold text-slate-400 uppercase flex items-center justify-center">Likelihood \\ Impact</div>
                  <div class="p-1 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded">Low (1)</div>
                  <div class="p-1 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded">Med (2)</div>
                  <div class="p-1 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded">High (3)</div>

                  <!-- Row 3: High Likelihood -->
                  <div class="p-1 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">High (3)</div>
                  ${[1, 2, 3].map(imp => {
                    const items = cellCounts[`3x${imp}`];
                    const count = items.length;
                    const isSelected = state.selectedProjectRiskCell === `3x${imp}`;
                    const hasHigh = items.some(x => x.rating === 'High' || x.rating === 'Critical' || imp >= 2);
                    const colorCls = count === 0
                      ? 'bg-white dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 border-dashed border-slate-200 dark:border-slate-700'
                      : hasHigh
                        ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800 font-bold'
                        : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800 font-bold';
                    return `
                      <button data-cell="3x${imp}" class="project-matrix-cell p-2 rounded border text-xs cursor-pointer hover:shadow-xs transition-all ${colorCls} ${isSelected ? 'ring-2 ring-blue-600 shadow-md' : ''}">
                        ${count}
                      </button>
                    `;
                  }).join('')}

                  <!-- Row 2: Medium Likelihood -->
                  <div class="p-1 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">Med (2)</div>
                  ${[1, 2, 3].map(imp => {
                    const items = cellCounts[`2x${imp}`];
                    const count = items.length;
                    const isSelected = state.selectedProjectRiskCell === `2x${imp}`;
                    const isRed = imp === 3;
                    const colorCls = count === 0
                      ? 'bg-white dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 border-dashed border-slate-200 dark:border-slate-700'
                      : isRed
                        ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800 font-bold'
                        : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800 font-bold';
                    return `
                      <button data-cell="2x${imp}" class="project-matrix-cell p-2 rounded border text-xs cursor-pointer hover:shadow-xs transition-all ${colorCls} ${isSelected ? 'ring-2 ring-blue-600 shadow-md' : ''}">
                        ${count}
                      </button>
                    `;
                  }).join('')}

                  <!-- Row 1: Low Likelihood -->
                  <div class="p-1 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">Low (1)</div>
                  ${[1, 2, 3].map(imp => {
                    const items = cellCounts[`1x${imp}`];
                    const count = items.length;
                    const isSelected = state.selectedProjectRiskCell === `1x${imp}`;
                    const colorCls = count === 0
                      ? 'bg-white dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 border-dashed border-slate-200 dark:border-slate-700'
                      : imp === 3
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800 font-bold'
                        : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 font-bold';
                    return `
                      <button data-cell="1x${imp}" class="project-matrix-cell p-2 rounded border text-xs cursor-pointer hover:shadow-xs transition-all ${colorCls} ${isSelected ? 'ring-2 ring-blue-600 shadow-md' : ''}">
                        ${count}
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>

            <!-- Risk & Issue Items List -->
            <div class="space-y-2.5">
              ${filteredRisks.length > 0 ? filteredRisks.map(r => `
                <div class="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="px-1.5 py-0.2 rounded font-bold text-[10px] ${r.itemType === 'Issue' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}">${r.itemType}</span>
                      <span class="font-mono font-bold text-slate-500">${r.rating || (r.likelihood + ' × ' + r.impact)}</span>
                      <span class="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">${r.category}</span>
                      ${r.sponsorAttentionFlag ? '<span class="px-1.5 py-0.2 rounded text-[10px] bg-purple-100 text-purple-800 font-bold">Sponsor Attention</span>' : ''}
                      ${r.convertedFromRisk ? '<span class="px-1.5 py-0.2 rounded text-[10px] bg-indigo-100 text-indigo-800 font-semibold" title="Converted from Risk to Issue">⚡ Converted Issue</span>' : ''}
                    </div>
                    <span class="text-slate-400 text-[10px]">Owner: <strong>${r.owner}</strong></span>
                  </div>
                  <h5 class="font-bold text-slate-900 dark:text-white text-xs mt-1.5">${r.title}</h5>
                  <p class="text-slate-600 dark:text-slate-400 mt-1">${r.description}</p>
                  <div class="mt-2 text-[10px] text-slate-500 flex justify-between items-center">
                    <span>Response Strategy: <strong class="text-slate-700 dark:text-slate-300">${r.strategy}</strong></span>
                    ${r.itemType === 'Risk' ? `
                      <button data-convert-id="${r.id}" class="btn-convert-risk px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded hover:bg-rose-100">
                        Convert to Issue
                      </button>
                    ` : ''}
                  </div>
                </div>
              `).join('') : '<div class="text-slate-400 p-4 text-center">No risks or issues match this cell filter.</div>'}
            </div>
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

      // TAB 7: TEAM (Br from bundle)
      case 'team': {
        return `
          <div class="space-y-3 text-xs">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-slate-900 dark:text-white text-sm">Team Allocations & Roles</h4>
              <button id="btn-add-team-member" class="px-2.5 py-1 rounded bg-blue-600 text-white font-medium hover:bg-blue-700">+ Allocate Member</button>
            </div>

            <div class="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
              <table class="w-full text-left">
                <thead class="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b">
                  <tr>
                    <th class="py-2 px-2.5">Member</th>
                    <th class="py-2 px-2.5">Role</th>
                    <th class="py-2 px-2.5 text-center">FTE %</th>
                    <th class="py-2 px-2.5">Function</th>
                    <th class="py-2 px-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  ${team.map(t => `
                    <tr>
                      <td class="py-2 px-2.5 font-semibold flex items-center gap-1.5">
                        <span class="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px] font-bold">
                          ${t.personName.split(' ').map(n=>n[0]).join('')}
                        </span>
                        <span>${t.personName}</span>
                      </td>
                      <td class="py-2 px-2.5 text-slate-600 dark:text-slate-300">${t.role}</td>
                      <td class="py-2 px-2.5 text-center font-mono font-bold text-blue-600">${t.ftePercent}%</td>
                      <td class="py-2 px-2.5 text-slate-500">${t.function}</td>
                      <td class="py-2 px-2.5 text-right">
                        <button class="text-[11px] text-slate-400 hover:text-rose-600">Deactivate</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
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

    // Export items
    const exportPdf = el('btn-export-pdf');
    const exportPptx = el('btn-export-pptx');
    const exportXlsx = el('btn-export-xlsx');
    if (exportPdf) exportPdf.onclick = () => { alert(`[100% In-Tenant] Generating Executive A4 1-Pager PDF for ${project.code}. No data leaves your SharePoint environment.`); state.exportMenuOpen = false; renderProjectDrawer(); };
    if (exportPptx) exportPptx.onclick = () => { alert(`[100% In-Tenant] Generating Executive 1-Slide PowerPoint (.pptx) for ${project.code}. No data leaves your SharePoint environment.`); state.exportMenuOpen = false; renderProjectDrawer(); };
    if (exportXlsx) exportXlsx.onclick = () => { alert(`[100% In-Tenant] Exporting entire project snapshot as Excel (.xlsx) for ${project.code}...`); exportPortfolioToCSV(); state.exportMenuOpen = false; renderProjectDrawer(); };

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
        }
      };
    });

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

    // Risk Matrix Cell Click (Filter risks tab)
    document.querySelectorAll('.project-matrix-cell').forEach(cell => {
      cell.onclick = () => {
        const cellId = cell.getAttribute('data-cell');
        state.selectedProjectRiskCell = state.selectedProjectRiskCell === cellId ? null : cellId;
        renderProjectDrawer();
      };
    });

    // Clear Project Risk Cell Filter
    const clearRiskCellBtn = el('btn-clear-project-risk-cell');
    if (clearRiskCellBtn) {
      clearRiskCellBtn.onclick = () => {
        state.selectedProjectRiskCell = null;
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
  }

  function renderView() {
    renderKPIBar();
    switch (state.currentTab) {
      case 'portfolio':
      case 'myProjects':
      case 'globalSearch':
        renderPortfolioView();
        break;
      case 'myPortfolio':
        const kpiContainer = el('webpart-kpi-bar');
        if (kpiContainer) kpiContainer.innerHTML = '';
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
      { key: 'portfolio', label: 'Portfolio' },
      { key: 'myPortfolio', label: 'My Portfolio' },
      { key: 'myProjects', label: 'My Projects' },
      { key: 'allMilestones', label: 'All Milestones' },
      { key: 'allRisksIssues', label: 'All Risks & Issues' },
      { key: 'analytics', label: 'Analytics' },
      { key: 'heatmap', label: 'Heatmap' }
    ];

    const navContainer = el('webpart-top-nav');
    if (!navContainer) return;

    const availablePortfolios = state.data.portfolios.filter(pf => pf.id !== 'all');
    const hasCustomSelection = state.selectedPortfolios.length > 0 && !state.selectedPortfolios.includes('__none__');
    const isNoneSelected = state.selectedPortfolios.includes('__none__');

    navContainer.innerHTML = navItems.map(item => {
      if (item.key === 'portfolio') {
        const activeCount = isNoneSelected ? 0 : (hasCustomSelection ? state.selectedPortfolios.length : availablePortfolios.length);
        const isTabActive = state.currentTab === 'portfolio';
        return `
          <div class="relative inline-flex items-center">
            <div class="inline-flex items-stretch rounded-md shadow-xs ${isTabActive ? 'bg-blue-600 text-white' : 'bg-transparent text-slate-600 dark:text-slate-300'}">
              <button data-nav="portfolio" class="webpart-nav-btn py-2 pl-3 pr-2 text-xs font-semibold rounded-l-md transition-all flex items-center gap-1.5 ${isTabActive ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}">
                <span>Portfolio</span>
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
        <button data-nav="${item.key}" class="webpart-nav-btn py-2 px-3 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${state.currentTab === item.key ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}">
          ${item.label}
        </button>
      `;
    }).join('');

    // Tab click handlers
    navContainer.querySelectorAll('.webpart-nav-btn').forEach(btn => {
      btn.onclick = () => {
        state.currentTab = btn.getAttribute('data-nav');
        state.portfolioPickerOpen = false;
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
      exportBtn.onclick = () => exportPortfolioToCSV();
    }

    const fsBtn = el('btn-toggle-fullscreen');
    const demoShell = el('demo-shell-container');
    if (fsBtn && demoShell) {
      fsBtn.onclick = () => {
        state.isFullscreen = !state.isFullscreen;
        if (state.isFullscreen) {
          demoShell.classList.add('fixed', 'inset-0', 'z-50', 'bg-white', 'dark:bg-slate-900', 'p-4', 'overflow-y-auto');
          fsBtn.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            <span class="hidden sm:inline">Exit Fullscreen</span>
          `;
        } else {
          demoShell.classList.remove('fixed', 'inset-0', 'z-50', 'bg-white', 'dark:bg-slate-900', 'p-4', 'overflow-y-auto');
          fsBtn.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
            <span class="hidden sm:inline">Fullscreen</span>
          `;
        }
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
    initTopNav();
    renderView();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initPpmDemo);
  } else {
    window.initPpmDemo();
  }
})();
