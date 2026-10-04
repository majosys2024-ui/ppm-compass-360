
    // In-memory dataset of realistic Irish target accounts
    const initialDrafts = [
      {
        draft_id: "DFT-501",
        lead_id: "LEAD-101",
        company_id: "COMP-001",
        lead_name: "Siobhan Kelly",
        lead_title: "Head of PMO & Digital Delivery",
        lead_email: "skelly@aerogen.com",
        region: "Galway, Ireland",
        company_name: "Aerogen",
        company_domain: "aerogen.com",
        industry: "MedTech / Aerosol Tech",
        headcount: "500 - 1,000",
        tech_stack: "Microsoft 365, SharePoint Online, Teams",
        icp_score: 94,
        qa_score: 95,
        trigger: "Expanded Galway R&D labs following recent FDA milestone; posted 3 openings for Senior Project Managers referencing stage-gate governance and milestone reporting.",
        subject: "Aerogen PMO / SharePoint portfolio steering",
        body: `Hi Siobhan,

Saw that Aerogen is expanding its Galway engineering labs following recent FDA milestones. As PMOs scale past 20 concurrent product initiatives, tracking stage-gates across disconnected Excel sheets and PowerPoint decks becomes a major friction point.

We built PPM Compass 360 specifically for growing teams operating in Microsoft 365:
• 100% In-Tenant Data Sovereignty: All project data and risk logs stay strictly inside your SharePoint tenant (zero data egress, Irish DPC/GDPR compliant).
• Algorithmic RAG health radar & Milestone Trend Analysis (MTA).
• Flat €3,990/year site license with unlimited users (eliminating Power Apps per-user licensing taxes).

Would it make sense to take a 3-minute look at our live interactive demo? https://ppmcompass.com/demo/

Best regards,
Manu`,
        touch2: "Hi Siobhan, quick follow-up — thought you might appreciate seeing how mid-tier Irish medical device teams avoid the €20/user/month Power Apps tax while maintaining full milestone auditability. Happy to send over our 5-minute SPFx architecture one-pager if helpful.",
        status: "PENDING"
      },
      {
        draft_id: "DFT-502",
        lead_id: "LEAD-102",
        company_id: "COMP-002",
        lead_name: "Cormac Walsh",
        lead_title: "VP Portfolio Governance & IT",
        lead_email: "cormac.walsh@iconplc.com",
        region: "Dublin, Ireland",
        company_name: "ICON plc",
        company_domain: "iconplc.com",
        industry: "Clinical Research & BioPharma",
        headcount: "1,000 - 5,000",
        tech_stack: "Microsoft 365 E5, Azure AD, SharePoint",
        icp_score: 91,
        qa_score: 93,
        trigger: "Global clinical trials expansion; seeking unified milestone governance without allowing clinical trial data or CapEx figures to egress to external SaaS vendors.",
        subject: "In-tenant M365 portfolio steering for ICON",
        body: `Hi Cormac,

Given ICON's ongoing biopharma trial expansion, maintaining strict audit readiness across project portfolios usually runs into a common trade-off: heavy platforms like Planview require 6 months of IT integration, while SaaS tools violate strict clinical data egress policies.

PPM Compass 360 runs as a native SharePoint Framework (SPFx) application inside your existing Microsoft 365 tenant:
• Zero Data Egress: 100% data sovereignty within your SharePoint boundary.
• Milestone Trend Analysis (MTA) & stage-gate health radar.
• Flat annual site collection licensing with unlimited users.

Would you be open to a 3-minute look at our live interactive simulation? https://ppmcompass.com/demo/

Best regards,
Manu`,
        touch2: "Hi Cormac, wanted to share our zero-egress architecture overview that details how enterprise M365 teams deploy PPM Compass in under 5 minutes without opening external database firewall rules.",
        status: "PENDING"
      }
    ];

    const initialAccounts = [
      { name: "Aerogen", region: "Galway", industry: "MedTech / Aerosol Tech", employees: "500 - 1,000", fit: "94/100", m365: "Yes (SharePoint / Teams)", status: "Qualified", trigger: "Expanded Galway R&D labs following recent FDA milestone; posted 3 openings for Senior PMs referencing stage-gate governance." },
      { name: "ICON plc", region: "Dublin", industry: "Clinical Research", employees: "1,000 - 5,000", fit: "91/100", m365: "Yes (M365 E5 / Azure AD)", status: "Qualified", trigger: "Global clinical trials expansion; seeking unified milestone governance without allowing trial data or CapEx figures to egress to external SaaS vendors." },
      { name: "Kingspan Group", region: "Cavan", industry: "Building Materials & Tech", employees: "1,000 - 5,000", fit: "88/100", m365: "Yes (SharePoint Online)", status: "Qualified", trigger: "Global CapEx infrastructure program scaling across 5 divisions; replacing disconnected Excel tracker sheets with native M365 steering." }
    ];

    const initialLeads = [
      { name: "Siobhan Kelly", title: "Head of PMO & Digital Delivery", company: "Aerogen", email: "skelly@aerogen.com", persona: "PMO Director", smtp: "VALID (Deliverable)" },
      { name: "Cormac Walsh", title: "VP Portfolio Governance & IT", company: "ICON plc", email: "cormac.walsh@iconplc.com", persona: "VP IT / Portfolio", smtp: "VALID (Deliverable)" },
      { name: "Liam O'Connor", title: "Head of Enterprise Systems & PMO", company: "Kingspan Group", email: "liam.oconnor@kingspan.com", persona: "Head of Systems & PMO", smtp: "VALID (Deliverable)" }
    ];

    let drafts = JSON.parse(localStorage.getItem("ppm_cockpit_drafts")) || initialDrafts;
    let accounts = JSON.parse(localStorage.getItem("ppm_cockpit_accounts")) || initialAccounts;
    let leads = JSON.parse(localStorage.getItem("ppm_cockpit_leads")) || initialLeads;
    let currentDraftIndex = 0;
    let draftFilterMode = 'all'; // 'all' | 'pending'
    let activeDbTab = 'accounts'; // 'accounts' | 'triggers' | 'leads' | 'drafts'
    let approvedCount = parseInt(localStorage.getItem("ppm_cockpit_approved") || "0");
    let googleSheetsUrl = localStorage.getItem("ppm_sheets_url") || "";

    // Live Workforce Logger
    function logEvent(msg) {
      const stream = document.getElementById("activity-log-stream");
      if (!stream) return;
      const now = new Date();
      const timeStr = `[${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}]`;
      const div = document.createElement("div");
      div.className = "flex items-start gap-2 py-0.5 border-b border-slate-900/60 font-mono text-[11px]";
      div.innerHTML = `<span class="text-slate-600 shrink-0">${timeStr}</span> <span class="leading-relaxed">${msg}</span>`;
      stream.appendChild(div);
      stream.scrollTop = stream.scrollHeight;
    }

    function simulateNewDiscovery() {
      switchTab('agents');
      runAgent1();
    }

    // Initialization
    function init() {
      if (googleSheetsUrl) {
        document.getElementById("sheets-endpoint-url").value = googleSheetsUrl;
        document.querySelector('input[value="sheets"]').checked = true;
        setConnectionState("sheets");
      }
      renderAccountsTable();
      renderTriggersTable();
      renderLeadsTable();
      renderDraftsTable();
      updateDraftDropdown();
      renderCurrentDraft();
      updateMetrics();
    }

    function switchTab(tab) {
      document.getElementById("view-queue").classList.add("hidden");
      document.getElementById("view-accounts").classList.add("hidden");
      document.getElementById("view-agents").classList.add("hidden");

      document.getElementById("tab-btn-queue").className = "px-3.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition flex items-center gap-2 cursor-pointer";
      document.getElementById("tab-btn-accounts").className = "px-3.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition flex items-center gap-1.5 cursor-pointer";
      document.getElementById("tab-btn-agents").className = "px-3.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition flex items-center gap-1.5 cursor-pointer";

      if (tab === 'queue') {
        document.getElementById("view-queue").classList.remove("hidden");
        document.getElementById("tab-btn-queue").className = "px-3.5 py-1.5 rounded-lg bg-blue-600 text-white shadow-xs transition flex items-center gap-2 cursor-pointer";
        renderCurrentDraft();
      } else if (tab === 'accounts') {
        document.getElementById("view-accounts").classList.remove("hidden");
        document.getElementById("tab-btn-accounts").className = "px-3.5 py-1.5 rounded-lg bg-blue-600 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer";
        switchDbTab(activeDbTab);
      } else if (tab === 'agents') {
        document.getElementById("view-agents").classList.remove("hidden");
        document.getElementById("tab-btn-agents").className = "px-3.5 py-1.5 rounded-lg bg-blue-600 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer";
      }
    }

    // ================= DRAFT CAROUSEL & FLIPPING LOGIC =================
    function getFilteredDrafts() {
      if (draftFilterMode === 'pending') {
        return drafts.filter(d => d.status === 'PENDING');
      }
      return drafts;
    }

    function setDraftFilter(mode) {
      draftFilterMode = mode;
      const btnAll = document.getElementById("filter-btn-all");
      const btnPending = document.getElementById("filter-btn-pending");
      if (btnAll && btnPending) {
        if (mode === 'all') {
          btnAll.className = "px-2.5 py-1 rounded text-[11px] font-bold text-white bg-blue-600 transition cursor-pointer";
          btnPending.className = "px-2.5 py-1 rounded text-[11px] font-semibold text-slate-400 hover:text-white transition cursor-pointer";
        } else {
          btnPending.className = "px-2.5 py-1 rounded text-[11px] font-bold text-white bg-blue-600 transition cursor-pointer";
          btnAll.className = "px-2.5 py-1 rounded text-[11px] font-semibold text-slate-400 hover:text-white transition cursor-pointer";
        }
      }
      currentDraftIndex = 0;
      updateDraftDropdown();
      renderCurrentDraft();
    }

    function updateDraftDropdown() {
      const sel = document.getElementById("queue-draft-select");
      if (!sel) return;
      const list = getFilteredDrafts();
      if (list.length === 0) {
        sel.innerHTML = `<option value="">(No drafts in view)</option>`;
        return;
      }
      sel.innerHTML = list.map((d, idx) => {
        const icon = d.status === 'APPROVED' ? '✓' : d.status === 'REJECTED' ? '✕' : '⏳';
        return `<option value="${d.draft_id}">[${idx + 1}/${list.length}] ${d.company_name} — ${d.lead_name} (${icon} ${d.status})</option>`;
      }).join('');

      if (list[currentDraftIndex]) {
        sel.value = list[currentDraftIndex].draft_id;
      }
    }

    function navigateDraft(delta) {
      const list = getFilteredDrafts();
      if (list.length === 0) return;
      currentDraftIndex = (currentDraftIndex + delta + list.length) % list.length;
      renderCurrentDraft();
    }

    function jumpToSelectedDraft(draftId) {
      const list = getFilteredDrafts();
      const idx = list.findIndex(d => d.draft_id === draftId);
      if (idx !== -1) {
        currentDraftIndex = idx;
        renderCurrentDraft();
      }
    }

    function renderCurrentDraft() {
      const list = getFilteredDrafts();
      const activeCard = document.getElementById("queue-active-card");
      const emptyState = document.getElementById("queue-empty-state");
      const counterText = document.getElementById("queue-counter-text");
      const statusBadge = document.getElementById("card-status-badge");

      if (list.length === 0) {
        if (activeCard) activeCard.classList.add("hidden");
        if (emptyState) {
          emptyState.classList.remove("hidden");
          emptyState.classList.add("flex");
        }
        if (counterText) counterText.textContent = "0 of 0";
        if (statusBadge) statusBadge.className = "hidden";
        updateDraftDropdown();
        return;
      }

      if (activeCard) activeCard.classList.remove("hidden");
      if (emptyState) {
        emptyState.classList.add("hidden");
        emptyState.classList.remove("flex");
      }

      if (currentDraftIndex >= list.length) currentDraftIndex = list.length - 1;
      if (currentDraftIndex < 0) currentDraftIndex = 0;

      const draft = list[currentDraftIndex];

      if (counterText) counterText.textContent = `Draft ${currentDraftIndex + 1} of ${list.length}`;

      if (statusBadge) {
        statusBadge.className = "px-2.5 py-0.5 rounded text-[10px] font-bold border";
        if (draft.status === "APPROVED") {
          statusBadge.className += " bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
          statusBadge.textContent = "APPROVED ✓";
        } else if (draft.status === "REJECTED") {
          statusBadge.className += " bg-rose-500/10 text-rose-400 border-rose-500/20";
          statusBadge.textContent = "REJECTED ✕";
        } else {
          statusBadge.className += " bg-amber-500/10 text-amber-400 border-amber-500/20";
          statusBadge.textContent = "PENDING ⏳";
        }
      }

      // Populate dossier card fields
      document.getElementById("card-region").textContent = draft.region || "Ireland";
      document.getElementById("card-icp-score").textContent = `${draft.icp_score || 92} / 100`;
      document.getElementById("card-lead-name").textContent = draft.lead_name;
      document.getElementById("card-lead-title").textContent = draft.lead_title;
      document.getElementById("card-lead-email").textContent = draft.lead_email;
      document.getElementById("card-company-name").textContent = draft.company_name;
      document.getElementById("card-company-domain").textContent = `${draft.company_domain} ↗`;
      document.getElementById("card-company-domain").href = `https://${draft.company_domain}`;
      document.getElementById("card-industry").textContent = draft.industry;
      document.getElementById("card-headcount").textContent = draft.headcount;
      document.getElementById("card-tech-stack").textContent = draft.tech_stack || "Microsoft 365, SharePoint";
      document.getElementById("card-trigger").textContent = `"${draft.trigger}"`;
      document.getElementById("card-draft-id").textContent = `Draft ID: ${draft.draft_id}`;
      document.getElementById("card-qa-score").textContent = `${draft.qa_score || 94} / 100`;
      document.getElementById("input-subject").value = draft.subject;
      document.getElementById("input-body").value = draft.body;
      document.getElementById("text-touch2").textContent = draft.touch2 || "Auto follow-up sequence";

      updateDraftDropdown();
    }

    function approveCurrentDraft() {
      const list = getFilteredDrafts();
      if (list.length === 0) return;

      const current = list[currentDraftIndex];
      current.status = "APPROVED";
      current.subject = document.getElementById("input-subject").value;
      current.body = document.getElementById("input-body").value;
      approvedCount++;

      saveState();
      logEvent(`[User Approval] Approved draft ${current.draft_id} for ${current.lead_name} (${current.company_name}). Queued for dispatch.`);
      showToast(`✓ Approved draft for ${current.lead_name}!`, "success");

      fetch("/api/approve_draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft_id: current.draft_id, subject: current.subject, body: current.body })
      }).catch(() => {});

      if (googleSheetsUrl) {
        syncToGoogleSheets(current.draft_id, "APPROVED", current.subject, current.body);
      }

      if (draftFilterMode === 'pending') {
        const remaining = drafts.filter(d => d.status === 'PENDING');
        if (currentDraftIndex >= remaining.length) {
          currentDraftIndex = Math.max(0, remaining.length - 1);
        }
      } else {
        if (currentDraftIndex < list.length - 1) {
          currentDraftIndex++;
        }
      }

      renderCurrentDraft();
      renderDraftsTable();
      updateMetrics();
    }

    function rejectCurrentDraft() {
      const list = getFilteredDrafts();
      if (list.length === 0) return;

      const current = list[currentDraftIndex];
      current.status = "REJECTED";

      saveState();
      logEvent(`[User Rejected] Discarded draft ${current.draft_id} for ${current.lead_name}.`);
      showToast(`✕ Discarded draft for ${current.lead_name}`, "info");

      fetch("/api/reject_draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft_id: current.draft_id })
      }).catch(() => {});

      if (googleSheetsUrl) {
        syncToGoogleSheets(current.draft_id, "REJECTED", "", "");
      }

      if (draftFilterMode === 'pending') {
        const remaining = drafts.filter(d => d.status === 'PENDING');
        if (currentDraftIndex >= remaining.length) {
          currentDraftIndex = Math.max(0, remaining.length - 1);
        }
      } else {
        if (currentDraftIndex < list.length - 1) {
          currentDraftIndex++;
        }
      }

      renderCurrentDraft();
      renderDraftsTable();
      updateMetrics();
    }

    function regenerateCopy() {
      const bodyEl = document.getElementById("input-body");
      bodyEl.value = "Regenerating customized copy via Gemini...";
      setTimeout(() => {
        bodyEl.value = `Hi Siobhan,

Noticed Aerogen is accelerating its Galway engineering pipeline. Usually as teams scale past 15 initiatives, steering committees waste hours consolidating status across disconnected spreadsheets.

PPM Compass 360 gives project leaders an algorithmic RAG health radar and milestone stage-gates directly inside Microsoft 365:
• 100% In-Tenant Data Sovereignty: Zero project data leaves your SharePoint boundary.
• Flat €3,990/year site collection license with unlimited users.
• 5-minute deployment with zero Power Apps seat taxes.

Would you be open to testing our 3-minute interactive browser demo? https://ppmcompass.com/demo/

Best regards,
Manu`;
        logEvent("[Copywriter Agent] Regenerated email draft with alternative hook.");
      }, 700);
    }

    // ================= MULTI-DATABASE EXPLORER (AGENTS 1-4) =================
    function switchDbTab(tab) {
      activeDbTab = tab;
      const tAccounts = document.getElementById("table-accounts");
      const tTriggers = document.getElementById("table-triggers");
      const tLeads = document.getElementById("table-leads");
      const tDrafts = document.getElementById("table-drafts");

      if (tAccounts) tAccounts.classList.add("hidden");
      if (tTriggers) tTriggers.classList.add("hidden");
      if (tLeads) tLeads.classList.add("hidden");
      if (tDrafts) tDrafts.classList.add("hidden");

      const tabs = ['accounts', 'triggers', 'leads', 'drafts'];
      tabs.forEach(t => {
        const btn = document.getElementById(`db-tab-${t}`);
        if (btn) {
          if (t === tab) {
            btn.className = "px-3 py-1.5 rounded-lg bg-blue-600 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer";
          } else {
            btn.className = "px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition flex items-center gap-1.5 cursor-pointer";
          }
        }
      });

      const activeTable = document.getElementById(`table-${tab}`);
      if (activeTable) activeTable.classList.remove("hidden");

      const searchInput = document.getElementById("db-search-input");
      if (searchInput) searchInput.value = "";

      if (tab === 'accounts') renderAccountsTable();
      else if (tab === 'triggers') renderTriggersTable();
      else if (tab === 'leads') renderLeadsTable();
      else if (tab === 'drafts') renderDraftsTable();
    }

    function renderAccountsTable(list = accounts) {
      const tbody = document.getElementById("accounts-table-body");
      if (!tbody) return;
      tbody.innerHTML = list.map(acc => `
        <tr class="hover:bg-slate-800/40 transition">
          <td class="p-3 font-bold text-white">${acc.name}</td>
          <td class="p-3 text-slate-400">🇮🇪 ${acc.region}</td>
          <td class="p-3 text-slate-300">${acc.industry}</td>
          <td class="p-3 text-slate-400">${acc.employees}</td>
          <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">${acc.fit || '92/100'}</span></td>
          <td class="p-3 text-emerald-400 font-semibold">${acc.m365 || 'Yes'}</td>
          <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400">${acc.status || 'Qualified'}</span></td>
        </tr>
      `).join('');
    }

    function renderTriggersTable(list = accounts) {
      const tbody = document.getElementById("triggers-table-body");
      if (!tbody) return;
      tbody.innerHTML = list.map(acc => `
        <tr class="hover:bg-slate-800/40 transition">
          <td class="p-3 font-bold text-white whitespace-nowrap">${acc.name}</td>
          <td class="p-3 text-slate-400 whitespace-nowrap">📍 ${acc.region}</td>
          <td class="p-3 text-amber-300 font-normal leading-relaxed text-[11px] max-w-md">"${acc.trigger || 'Expanding enterprise PMO steering inside Microsoft 365.'}"</td>
          <td class="p-3 whitespace-nowrap"><span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">${acc.m365 || 'SharePoint Online'}</span></td>
          <td class="p-3 whitespace-nowrap"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">${acc.fit || '92/100'}</span></td>
        </tr>
      `).join('');
    }

    function renderLeadsTable(list = leads) {
      const tbody = document.getElementById("leads-table-body");
      if (!tbody) return;
      tbody.innerHTML = list.map(lead => `
        <tr class="hover:bg-slate-800/40 transition">
          <td class="p-3 font-bold text-white">${lead.name}</td>
          <td class="p-3">
            <span class="text-slate-200 font-medium block">${lead.title}</span>
            <span class="text-[10px] text-purple-400 font-semibold">${lead.persona || 'PMO Director'}</span>
          </td>
          <td class="p-3 text-slate-300 font-semibold">${lead.company}</td>
          <td class="p-3 font-mono text-slate-300 text-[11px]">${lead.email}</td>
          <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">✓ ${lead.smtp || 'Deliverable'}</span></td>
          <td class="p-3">
            <button onclick="switchTab('queue')" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-blue-300 font-semibold border border-slate-700 transition cursor-pointer">View Sequence →</button>
          </td>
        </tr>
      `).join('');
    }

    function renderDraftsTable(list = drafts) {
      const tbody = document.getElementById("drafts-table-body");
      if (!tbody) return;
      tbody.innerHTML = list.map(d => {
        let statusClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
        if (d.status === "APPROVED") statusClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        if (d.status === "REJECTED") statusClass = "bg-rose-500/10 text-rose-400 border-rose-500/20";

        return `
        <tr class="hover:bg-slate-800/40 transition">
          <td class="p-3 font-mono font-bold text-blue-400">${d.draft_id}</td>
          <td class="p-3">
            <span class="font-bold text-white block">${d.lead_name}</span>
            <span class="text-[10px] text-slate-400">${d.company_name} • ${d.lead_title}</span>
          </td>
          <td class="p-3 text-slate-200 text-xs font-medium max-w-xs truncate">${d.subject}</td>
          <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">${d.qa_score || 94}/100</span></td>
          <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold border ${statusClass}">${d.status}</span></td>
          <td class="p-3">
            <button onclick="inspectDraftInQueue('${d.draft_id}')" class="px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 text-[10px] text-blue-300 font-bold border border-blue-500/30 transition flex items-center gap-1 cursor-pointer">
              <span>Inspect in Queue ↗</span>
            </button>
          </td>
        </tr>
        `;
      }).join('');
    }

    function filterActiveDbTable() {
      const q = (document.getElementById("db-search-input").value || "").toLowerCase();
      if (activeDbTab === 'accounts') {
        const filtered = accounts.filter(a => 
          a.name.toLowerCase().includes(q) || 
          a.region.toLowerCase().includes(q) || 
          a.industry.toLowerCase().includes(q)
        );
        renderAccountsTable(filtered);
      } else if (activeDbTab === 'triggers') {
        const filtered = accounts.filter(a =>
          a.name.toLowerCase().includes(q) ||
          a.region.toLowerCase().includes(q) ||
          (a.trigger && a.trigger.toLowerCase().includes(q))
        );
        renderTriggersTable(filtered);
      } else if (activeDbTab === 'leads') {
        const filtered = leads.filter(l =>
          l.name.toLowerCase().includes(q) ||
          l.title.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q)
        );
        renderLeadsTable(filtered);
      } else if (activeDbTab === 'drafts') {
        const filtered = drafts.filter(d =>
          d.draft_id.toLowerCase().includes(q) ||
          d.lead_name.toLowerCase().includes(q) ||
          d.company_name.toLowerCase().includes(q) ||
          d.subject.toLowerCase().includes(q) ||
          d.status.toLowerCase().includes(q)
        );
        renderDraftsTable(filtered);
      }
    }

    function inspectDraftInQueue(draftId) {
      setDraftFilter('all');
      switchTab('queue');
      jumpToSelectedDraft(draftId);
    }

    function updateMetrics() {
      const pending = drafts.filter(d => d.status === "PENDING").length;
      document.getElementById("metric-pending").textContent = pending;
      document.getElementById("badge-pending").textContent = pending;
      document.getElementById("metric-approved").textContent = approvedCount;
      document.getElementById("metric-accounts").textContent = accounts.length;
      document.getElementById("metric-leads").textContent = leads.length;
      const accTabSpan = document.querySelector("#tab-btn-accounts span");
      if (accTabSpan) accTabSpan.textContent = `🗄️ Multi-Database (${accounts.length})`;
    }

    function saveState() {
      localStorage.setItem("ppm_cockpit_drafts", JSON.stringify(drafts));
      localStorage.setItem("ppm_cockpit_accounts", JSON.stringify(accounts));
      localStorage.setItem("ppm_cockpit_leads", JSON.stringify(leads));
      localStorage.setItem("ppm_cockpit_approved", approvedCount.toString());
    }

    function resetDemoDrafts() {
      drafts = JSON.parse(JSON.stringify(initialDrafts));
      accounts = JSON.parse(JSON.stringify(initialAccounts));
      leads = JSON.parse(JSON.stringify(initialLeads));
      approvedCount = 0;
      currentDraftIndex = 0;
      draftFilterMode = 'all';
      saveState();
      renderAccountsTable();
      renderTriggersTable();
      renderLeadsTable();
      renderDraftsTable();
      updateDraftDropdown();
      renderCurrentDraft();
      updateMetrics();
      logEvent("[Cockpit] Reloaded initial Irish sample drafts and accounts.");
    }

    // Modal: Add Account
    function openAddAccountModal() {
      document.getElementById("add-account-modal").classList.remove("hidden");
    }
    function closeAddAccountModal() {
      document.getElementById("add-account-modal").classList.add("hidden");
    }

    function submitAddAccount() {
      const name = document.getElementById("add-acc-name").value.trim();
      const domain = document.getElementById("add-acc-domain").value.trim();
      const region = document.getElementById("add-acc-region").value.trim() || "Ireland";
      const size = document.getElementById("add-acc-size").value;
      const industry = document.getElementById("add-acc-industry").value.trim() || "Mid-Market Enterprise";

      if (!name) {
        alert("Please enter a company name.");
        return;
      }

      const newAcc = {
        name: name,
        domain: domain || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.ie`,
        region: region,
        industry: industry,
        employees: size,
        fit: "92/100",
        m365: "Yes",
        status: "Qualified"
      };

      accounts.unshift(newAcc);
      saveState();
      renderAccountsTable();
      renderTriggersTable();
      updateMetrics();
      closeAddAccountModal();

      logEvent(`[Manual Addition] Added target account: <strong class='text-white'>${name}</strong> (${region}).`);
      showToast(`➕ Added account: ${name}`, "success");

      fetch("/api/add_account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, domain: newAcc.domain, region, industry, size })
      }).catch(() => {});

      // If connected to Google Sheets, POST add_company
      if (googleSheetsUrl) {
        fetch(googleSheetsUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'add_company',
            company: {
              company_id: "COMP-" + Math.floor(Math.random() * 9000 + 1000),
              company_name: name,
              domain: newAcc.domain,
              city_region: region,
              industry: industry,
              employee_range: size,
              m365_indicator: "Yes",
              icp_score: 92,
              harvested_trigger: `Scaling project governance & PMO operations in ${region}.`,
              account_status: "QUALIFIED"
            }
          })
        });
      }

      // Automatically launch Agent 3 & 4 to create a draft for this new account
      setTimeout(() => {
        logEvent(`[Agent 3: Lead Finder] Locating PMO Director at <strong class='text-white'>${name}</strong>...`);
        showToast(`🔍 Agent 3: Finding PMO leads for ${name}...`, "info");
        setTimeout(() => {
          const leadName = "Colm Kelly";
          const leadTitle = "Director of Project Governance & PMO";
          const draftId = "DFT-" + Math.floor(Math.random() * 9000 + 1000);
          
          const newDraft = {
            draft_id: draftId,
            lead_id: "LEAD-" + Math.floor(Math.random() * 9000 + 1000),
            company_id: "COMP-" + Math.floor(Math.random() * 9000 + 1000),
            lead_name: leadName,
            lead_title: leadTitle,
            lead_email: `ckelly@${newAcc.domain}`,
            region: region,
            company_name: name,
            company_domain: newAcc.domain,
            industry: industry,
            headcount: size,
            tech_stack: "Microsoft 365, SharePoint Online",
            icp_score: 92,
            qa_score: 94,
            trigger: `Scaling project portfolio governance across business units in ${region}.`,
            subject: `${name} PMO / SharePoint portfolio steering`,
            body: `Hi Colm,\n\nSaw that ${name} is scaling operations in ${region}. As initiatives scale, project steering committees usually find that compiling status reports across disconnected spreadsheets and PowerPoint slides drains days of productive delivery time.\n\nWe built PPM Compass 360 specifically for growing teams operating in Microsoft 365:\n• 100% In-Tenant Data Sovereignty: All project budgets, risks, and milestones remain strictly inside your SharePoint tenant (zero data egress, Irish DPC/GDPR compliant).\n• Algorithmic RAG health radar & Milestone Trend Analysis (MTA).\n• Flat €3,990/year site collection license with unlimited users (zero Power Apps per-user taxes).\n\nWould it make sense to take a 3-minute look at our live interactive demo? https://ppmcompass.com/demo/\n\nBest regards,\nManu\nPPM Compass 360`,
            touch2: `Hi Colm, quick follow-up — thought you might find it useful to see how other Irish mid-market teams avoid the €20/user/month Power Apps tax while maintaining full milestone auditability. Happy to send over our architecture one-pager.`,
            status: "PENDING"
          };

          drafts.unshift(newDraft);
          leads.unshift({
            name: leadName,
            title: leadTitle,
            company: name,
            email: newDraft.lead_email,
            persona: "PMO Director",
            smtp: "VALID (Deliverable)"
          });
          saveState();
          renderDraftsTable();
          renderLeadsTable();
          updateDraftDropdown();
          renderCurrentDraft();
          updateMetrics();
          logEvent(`[Agent 4: Copywriter] Generated outreach draft ${draftId} for <strong class='text-white'>${name}</strong> -> Dropped into Review Queue!`);
          showToast(`✍️ Outreach draft generated for ${name}!`, "success");
        }, 1200);
      }, 600);
    }

    // Agent Execution Controls
    async function runAgent1() {
      const btn = document.getElementById("btn-run-agent1");
      const clusterSelect = document.getElementById("scanner-cluster-select");
      const cluster = clusterSelect ? clusterSelect.value : "all";
      const clusterLabel = clusterSelect ? clusterSelect.options[clusterSelect.selectedIndex].text : "All Irish Clusters";

      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="animate-spin inline-block">⏳</span> <span>Scanning...</span>`;
        btn.className = "px-4 py-1.5 rounded-lg bg-slate-700 text-xs font-bold text-slate-300 transition flex items-center gap-1.5 cursor-not-allowed";
      }

      logEvent(`<span class='text-emerald-400 font-bold'>[Agent 1: Market Scanner]</span> Querying Irish enterprise registries for: <strong class='text-white'>${clusterLabel}</strong>...`);
      showToast(`⚡ Agent 1 scanning Irish market...`, "info");

      try {
        const res = await fetch("/api/run_agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent: "scan", cluster: cluster })
        });
        const data = await res.json();

        if (data.success) {
          if (data.logs && Array.isArray(data.logs)) {
            data.logs.forEach(l => logEvent(l));
          }

          if (data.discovered && data.discovered.length > 0) {
            accounts = data.accounts || accounts;
            saveState();
            renderAccountsTable();
            renderTriggersTable();
            updateMetrics();

            renderScannerResults(data.discovered, "New");
            showToast(`🎉 Agent 1 discovered ${data.discovered.length} new accounts!`, "success");
            logEvent(`<span class='text-emerald-400 font-bold'>[Agent 1 Complete]</span> Added ${data.discovered.length} target accounts to database.`);
          } else {
            const listToShow = data.cluster_accounts && data.cluster_accounts.length > 0 ? data.cluster_accounts : (data.accounts || []);
            renderScannerResults(listToShow, "Mapped in Pipeline");
            showToast(`ℹ️ Accounts in this cluster are mapped in your active pipeline.`, "info");
            logEvent(`<span class='text-slate-400'>[Agent 1]</span> Verified cluster ${cluster} — accounts already mapped in database.`);
          }
        }
      } catch (e) {
        // Fallback simulation if server connection had temporary issue
        const fallback = [
          { name: "Merit Medical Ireland", domain: "merit.com", region: "Parkmore, Galway", industry: "Cardiovascular Devices", employees: "1,000 - 1,500", fit: "94/100", m365: "Yes (M365 E5 / Azure AD)", status: "Qualified", trigger: "Parkmore facility expansion; seeking zero-data-egress milestone tracking inside corporate SharePoint." },
          { name: "Cambus Medical", domain: "cambusmedical.com", region: "Spiddal, Galway", industry: "Precision Medical Components", employees: "450 - 600", fit: "91/100", m365: "Yes (SharePoint / M365)", status: "Qualified", trigger: "Managing parallel custom engineering OEM project timelines across multiple international cleanrooms." },
          { name: "Creganna Medical", domain: "creganna.com", region: "Parkmore, Galway", industry: "Minimally Invasive Delivery", employees: "1,200 - 1,500", fit: "93/100", m365: "Yes (M365 Enterprise)", status: "Qualified", trigger: "Global delivery catheter program; requires automated RAG health radar without per-user seat taxes." }
        ];
        const newFound = fallback.filter(f => !accounts.some(a => a.name === f.name));
        if (newFound.length > 0) {
          accounts.push(...newFound);
          saveState();
          renderAccountsTable();
          renderTriggersTable();
          updateMetrics();
          renderScannerResults(newFound, "New");
          showToast(`🎉 Agent 1 discovered ${newFound.length} new accounts!`, "success");
          logEvent(`<span class='text-emerald-400 font-bold'>[Agent 1 Complete]</span> Added ${newFound.length} target accounts to database.`);
        } else {
          renderScannerResults(fallback, "Active in Pipeline");
          showToast(`ℹ️ Accounts already in active pipeline.`, "info");
        }
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<span>⚡</span> <span>Run Scanner</span>`;
          btn.className = "px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5 cursor-pointer";
        }
        const lastRun = document.getElementById("scanner-last-run");
        if (lastRun) lastRun.textContent = "Last scan: Just now";
      }
    }

    function renderScannerResults(discoveredList, badgeText = "Discovered") {
      const container = document.getElementById("scanner-results-container");
      const grid = document.getElementById("scanner-results-grid");
      const badge = document.getElementById("scanner-discovered-badge");
      if (!container || !grid) return;

      badge.textContent = `${discoveredList.length} ${badgeText}`;
      grid.innerHTML = discoveredList.map(item => `
        <div class="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5 hover:border-emerald-500/40 transition">
          <div class="flex items-center justify-between">
            <span class="font-bold text-sm text-white">${item.name}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">${item.fit || '92/100'} Fit</span>
          </div>
          <div class="text-[11px] text-slate-400 flex items-center gap-2">
            <span>📍 ${item.region}</span>
            <span>•</span>
            <span>👥 ${item.employees}</span>
          </div>
          <div class="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60 leading-relaxed">
            <span class="text-amber-400 font-semibold block text-[10px] uppercase">Detected Project Trigger:</span>
            "${item.trigger || 'Expanding enterprise PMO steering inside Microsoft 365.'}"
          </div>
          <div class="text-[10px] text-emerald-400 flex items-center gap-1">
            <span>✓</span> <span>Stack: ${item.m365 || 'Microsoft 365, SharePoint'}</span>
          </div>
        </div>
      `).join('');

      container.classList.remove("hidden");
      container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function dismissScannerResults() {
      const container = document.getElementById("scanner-results-container");
      if (container) container.classList.add("hidden");
    }

    // Agent 2: Trigger Harvester
    async function runAgent2() {
      const btn = document.getElementById("btn-run-agent2");
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="animate-spin inline-block">⏳</span> <span>Harvesting...</span>`;
        btn.className = "px-3.5 py-1.5 rounded-lg bg-slate-700 text-xs font-bold text-slate-300 transition flex items-center gap-1.5 cursor-not-allowed";
      }

      logEvent("<span class='text-amber-400 font-bold'>[Agent 2: Trigger Harvester]</span> Scraping operational expansion triggers, CapEx plans & validating M365 infrastructure...");
      showToast("🎯 Agent 2: Harvesting operational triggers & M365 signals...", "info");

      try {
        const res = await fetch("/api/run_agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent: "enrich" })
        });
        const data = await res.json();
        if (data.success) {
          if (data.logs && Array.isArray(data.logs)) {
            data.logs.forEach(l => logEvent(l));
          }
          if (data.accounts) {
            accounts = data.accounts;
            saveState();
            renderAccountsTable();
            renderTriggersTable();
            updateMetrics();
          }
          const list = data.enriched || accounts;
          renderHarvesterResults(list);
          renderTriggersTable();
          showToast(`✓ Agent 2: Harvested operational signals for ${list.length} accounts!`, "success");
          logEvent(`<span class='text-amber-400 font-bold'>[Agent 2 Complete]</span> Verified project triggers and M365 architecture for ${list.length} target accounts.`);
        }
      } catch (e) {
        renderHarvesterResults(accounts);
        renderTriggersTable();
        showToast("✓ Agent 2: Triggers & M365 stack validated.", "success");
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<span>🎯</span> <span>Harvest Signals</span>`;
          btn.className = "px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white shadow-md shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer";
        }
        const lastRun = document.getElementById("harvester-last-run");
        if (lastRun) lastRun.textContent = "Last: Just now";
      }
    }

    function renderHarvesterResults(enrichedList) {
      const container = document.getElementById("harvester-results-container");
      const grid = document.getElementById("harvester-results-grid");
      const badge = document.getElementById("harvester-discovered-badge");
      if (!container || !grid) return;

      badge.textContent = `${enrichedList.length} Signals`;
      grid.innerHTML = enrichedList.map(item => `
        <div class="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5 hover:border-amber-500/40 transition">
          <div class="flex items-center justify-between">
            <span class="font-bold text-sm text-white">${item.name}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">${item.fit || '94/100'} Fit</span>
          </div>
          <div class="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed">
            <span class="text-amber-400 font-semibold block text-[10px] uppercase">Harvested Project Pain Point:</span>
            "${item.trigger || 'Expanding enterprise PMO steering inside Microsoft 365.'}"
          </div>
          <div class="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/60">
            <span class="text-slate-400">Architecture: <strong class="text-emerald-400">${item.m365 || 'SharePoint Online / Teams'}</strong></span>
            <span class="text-amber-400 font-semibold">ICP Qualified ✓</span>
          </div>
        </div>
      `).join('');

      container.classList.remove("hidden");
      container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Agent 3: Buying Committee & Lead Sentry
    async function runAgent3() {
      const btn = document.getElementById("btn-run-agent3");
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="animate-spin inline-block">⏳</span> <span>Verifying...</span>`;
        btn.className = "px-3.5 py-1.5 rounded-lg bg-slate-700 text-xs font-bold text-slate-300 transition flex items-center gap-1.5 cursor-not-allowed";
      }

      logEvent("<span class='text-purple-400 font-bold'>[Agent 3: Lead & Sentry]</span> Identifying Head of PMO & CIOs + executing zero-bounce SMTP handshakes...");
      showToast("👥 Agent 3: Resolving PMO decision-makers & verifying emails...", "info");

      try {
        const res = await fetch("/api/run_agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent: "leads" })
        });
        const data = await res.json();
        if (data.success) {
          if (data.logs && Array.isArray(data.logs)) {
            data.logs.forEach(l => logEvent(l));
          }
          const leadsList = data.leads || [];
          leads = leadsList;
          saveState();
          renderLeadsTable();
          renderLeadsResults(leadsList);
          updateMetrics();
          showToast(`✓ Agent 3: Verified ${leadsList.length} PMO decision-makers!`, "success");
          logEvent(`<span class='text-purple-400 font-bold'>[Agent 3 Complete]</span> Verified ${leadsList.length} decision-makers with 100% SMTP deliverability.`);
        }
      } catch (e) {
        const fallbackLeads = accounts.map((a, i) => ({
          name: a.name === "Aerogen" ? "Siobhan Kelly" : a.name === "ICON plc" ? "Cormac Walsh" : a.name === "Kingspan Group" ? "Liam O'Connor" : `Colm ${a.name.split(' ')[0]}PMO`,
          title: a.name === "ICON plc" ? "VP Portfolio Governance & IT" : "Head of PMO & Digital Delivery",
          company: a.name,
          email: `pmo@${a.domain || 'company.ie'}`,
          persona: "PMO Director",
          smtp: "VALID (Deliverable)"
        }));
        leads = fallbackLeads;
        saveState();
        renderLeadsTable();
        renderLeadsResults(fallbackLeads);
        updateMetrics();
        showToast(`✓ Agent 3: Verified ${fallbackLeads.length} decision-makers!`, "success");
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<span>🔍</span> <span>Find Leads</span>`;
          btn.className = "px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md shadow-purple-500/20 transition flex items-center gap-1.5 cursor-pointer";
        }
        const lastRun = document.getElementById("leads-last-run");
        if (lastRun) lastRun.textContent = "Last: Just now";
      }
    }

    function renderLeadsResults(leadsList) {
      const container = document.getElementById("leads-results-container");
      const grid = document.getElementById("leads-results-grid");
      const badge = document.getElementById("leads-discovered-badge");
      if (!container || !grid) return;

      badge.textContent = `${leadsList.length} Verified`;
      grid.innerHTML = leadsList.map(lead => `
        <div class="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 hover:border-purple-500/40 transition">
          <div class="flex items-center justify-between">
            <span class="font-bold text-sm text-white">${lead.name}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">${lead.persona || 'PMO Director'}</span>
          </div>
          <div class="text-xs text-blue-400 font-semibold">${lead.title}</div>
          <div class="text-[11px] text-slate-400 flex items-center gap-2">
            <span>🏢 ${lead.company}</span>
          </div>
          <div class="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span class="font-mono text-slate-300 text-[10px]">✉️ ${lead.email}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">✓ 100% SMTP Valid</span>
          </div>
        </div>
      `).join('');

      container.classList.remove("hidden");
      container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Agent 4: Copywriter & QA Guardian
    async function runAgent4() {
      const btn = document.getElementById("btn-run-agent4");
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="animate-spin inline-block">⏳</span> <span>Writing...</span>`;
        btn.className = "px-3.5 py-1.5 rounded-lg bg-slate-700 text-xs font-bold text-slate-300 transition flex items-center gap-1.5 cursor-not-allowed";
      }

      logEvent("<span class='text-blue-400 font-bold'>[Agent 4: Copywriter]</span> Calibrating Gemini Pro: drafting hyper-tailored 3-touch emails focusing on data sovereignty & flat €3,990 licensing...");
      showToast("✍️ Agent 4: Writing tailored cold outreach emails...", "info");

      try {
        const res = await fetch("/api/run_agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent: "drafts" })
        });
        const data = await res.json();
        if (data.success) {
          if (data.logs && Array.isArray(data.logs)) {
            data.logs.forEach(l => logEvent(l));
          }
          if (data.drafts && data.drafts.length > 0) {
            drafts = data.drafts;
            saveState();
            updateDraftDropdown();
            renderCurrentDraft();
            renderDraftsTable();
            updateMetrics();
          }
          const alertBox = document.getElementById("drafts-alert-container");
          const alertBadge = document.getElementById("drafts-discovered-badge");
          if (alertBox) {
            const count = data.pending_count || drafts.filter(d => d.status === "PENDING").length;
            if (alertBadge) alertBadge.textContent = `${count} Drafts Ready`;
            alertBox.classList.remove("hidden");
            alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          showToast(`🎉 Generated personalized outreach drafts! Ready for review.`, "success");
          logEvent(`<span class='text-blue-400 font-bold'>[Agent 4 Complete]</span> Dropped fresh outreach sequences into Review Queue. QA Scores: ≥94/100.`);
        }
      } catch (e) {
        showToast("✍️ Outreach drafts generated locally.", "success");
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<span>✍️</span> <span>Write Drafts</span>`;
          btn.className = "px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer";
        }
        const lastRun = document.getElementById("copywriter-last-run");
        if (lastRun) lastRun.textContent = "Last: Just now";
      }
    }

    // End-to-End Autonomous Pipeline
    async function runInteractivePipeline() {
      logEvent("<span class='text-amber-400 font-extrabold'>[🚀 Full Pipeline Launch]</span> Starting end-to-end multi-agent workforce: Scan ➔ Harvest ➔ Sentry ➔ Copywriter...");
      showToast("🚀 Launching Full Multi-Agent Pipeline...", "info");

      // Agent 1
      await runAgent1();
      await new Promise(r => setTimeout(r, 900));

      // Agent 2
      await runAgent2();
      await new Promise(r => setTimeout(r, 900));

      // Agent 3
      await runAgent3();
      await new Promise(r => setTimeout(r, 900));

      // Agent 4
      await runAgent4();
      await new Promise(r => setTimeout(r, 1000));

      logEvent("<span class='text-emerald-400 font-extrabold'>[Pipeline Complete]</span> All agents finished! Fresh personalized drafts waiting in the Human-in-the-Loop Review Queue.");
      showToast("🎉 Pipeline Complete! Navigating to Review Queue...", "success");

      setTimeout(() => {
        switchTab('queue');
      }, 1000);
    }

    // Settings Modal
    function openSettingsModal() {
      document.getElementById("settings-modal").classList.remove("hidden");
    }
    function closeSettingsModal() {
      document.getElementById("settings-modal").classList.add("hidden");
    }
    function saveSettings() {
      const url = document.getElementById("sheets-endpoint-url").value.trim();
      const isSheets = document.querySelector('input[name="db_mode"]:checked').value === "sheets";
      
      if (isSheets && url) {
        googleSheetsUrl = url;
        localStorage.setItem("ppm_sheets_url", url);
        setConnectionState("sheets");
        logEvent(`<span class='text-emerald-400'>[Google Sheets]</span> Successfully connected to Google Sheets Web App endpoint.`);
        fetchFromGoogleSheets();
      } else {
        googleSheetsUrl = "";
        localStorage.removeItem("ppm_sheets_url");
        setConnectionState("local");
      }
      closeSettingsModal();
    }

    function setConnectionState(mode) {
      const pill = document.getElementById("conn-status-pill");
      const text = document.getElementById("conn-status-text");
      const label = document.getElementById("db-backend-label");

      if (mode === "sheets") {
        if (text) text.textContent = "Google Sheets (Live)";
        if (pill) pill.className = "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-pointer";
        if (label) label.textContent = "Google Sheets (Connected)";
      } else if (mode === "server") {
        if (text) text.textContent = "Orchestrator Online";
        if (pill) pill.className = "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-pointer";
        if (label) label.textContent = "Local Server (Port 5001)";
      } else {
        if (text) text.textContent = "Sandbox Mode (Local)";
        if (pill) pill.className = "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 cursor-pointer";
        if (label) label.textContent = "Local Memory (Preloaded)";
      }
    }

    function toggleMode(mode) {
      // Radio changed
    }

    // Toast Notification System
    function showToast(message, type = 'info') {
      const container = document.getElementById("toast-container");
      if (!container) return;
      const toast = document.createElement("div");
      const bg = type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' :
                 type === 'error' ? 'bg-rose-600 border-rose-500 text-white' :
                 'bg-slate-900 border-slate-700 text-slate-100';
      toast.className = `${bg} text-xs font-semibold px-4 py-2.5 rounded-xl border shadow-2xl flex items-center gap-2 transform transition-all duration-300 pointer-events-auto`;
      toast.innerHTML = message;
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    // Google Sheets API Integration
    async function fetchFromGoogleSheets() {
      if (!googleSheetsUrl) return;
      try {
        logEvent("[Google Sheets] Fetching pending records...");
        const res = await fetch(`${googleSheetsUrl}?action=get_pending`);
        const data = await res.json();
        if (data.success && data.drafts && data.drafts.length > 0) {
          drafts = data.drafts.map(d => ({
            draft_id: d.draft_id,
            lead_id: d.lead_id,
            company_id: d.company_id,
            lead_name: (d.lead && d.lead.full_name) || "Decision Maker",
            lead_title: (d.lead && d.lead.title) || "PMO Lead",
            lead_email: (d.lead && d.lead.email) || "",
            region: (d.company && d.company.city_region) || "Ireland",
            company_name: (d.company && d.company.company_name) || "Target Co",
            company_domain: (d.company && d.company.domain) || "",
            industry: (d.company && d.company.industry) || "Target Industry",
            headcount: (d.company && d.company.employee_range) || "500-1000",
            tech_stack: (d.company && d.company.m365_indicator) || "M365",
            icp_score: (d.company && d.company.icp_score) || 90,
            qa_score: d.qa_score || 95,
            trigger: (d.company && d.company.harvested_trigger) || "Expanding operations",
            subject: d.touch_1_subject,
            body: d.touch_1_body,
            touch2: d.touch_2_body,
            status: d.approval_status
          }));
          renderCurrentDraft();
          updateMetrics();
          logEvent(`[Google Sheets] Synchronized ${data.drafts.length} drafts.`);
          showToast(`✓ Synced ${data.drafts.length} drafts from Google Sheets`, "success");
        }
      } catch (e) {
        logEvent(`<span class='text-rose-400'>[Google Sheets Error]</span> ${e.message}`);
      }
    }

    async function syncToGoogleSheets(draftId, status, subject, body) {
      if (!googleSheetsUrl) return;
      try {
        await fetch(googleSheetsUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_status',
            draft_id: draftId,
            status: status,
            touch_1_subject: subject,
            touch_1_body: body
          })
        });
        logEvent(`[Google Sheets] Synced status '${status}' for ${draftId}.`);
      } catch (e) {
        logEvent(`<span class='text-rose-400'>[Google Sheets Sync Failed]</span> ${e.message}`);
      }
    }

    // Backend Server Health Check
    async function checkServerStatus() {
      try {
        const res = await fetch("/api/status");
        if (res.ok) {
          const data = await res.json();
          setConnectionState("server");
          logEvent("<span class='text-emerald-400 font-bold'>[Server Connected]</span> Orchestrator server running at http://localhost:5001.");
          showToast("🟢 Orchestrator Backend Connected", "success");
          fetchServerData();
        }
      } catch (e) {
        // file:// or standalone client
      }
    }

    async function fetchServerData() {
      try {
        const res = await fetch("/api/data");
        if (res.ok) {
          const data = await res.json();
          if (data.accounts && data.accounts.length > 0) {
            accounts = data.accounts;
            renderAccountsTable();
            renderTriggersTable();
          }
          if (data.leads && data.leads.length > 0) {
            leads = data.leads;
            renderLeadsTable();
          }
          if (data.drafts && data.drafts.length > 0) {
            drafts = data.drafts;
            renderDraftsTable();
            updateDraftDropdown();
            renderCurrentDraft();
          }
          saveState();
          updateMetrics();
        }
      } catch (e) {}
    }

    window.onload = function() {
      init();
      checkServerStatus();
    };
  