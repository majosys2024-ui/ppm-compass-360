# Consultant Sales Presentation Deck & Executive Pitch Kit
**Document ID:** `PK-DOC-02`  
**Purpose:** 14-Slide C-Suite Client Pitch Deck, Speaker Script & Objection Handling Kit  
**Target Audience:** Management Consultants, PMO Advisors, Fractional Portfolio Directors  
**Product:** PPM Compass 360 (Microsoft 365 In-Tenant SPFx Solution)  

---

## Pitch Deck Structure at a Glance

```
SLIDE 01: Title & Executive Context
SLIDE 02: The Real Cost of Spreadsheet & Slide Deck Governance
SLIDE 03: The Enterprise PPM Paradox (Why Heavy Tools Fail)
SLIDE 04: The Power Apps "Per-User Fee" Dilemma
SLIDE 05: Introducing Pragmatic Governance with PPM Compass 360
SLIDE 06: Architecture: 100% In-Tenant Data Sovereignty
SLIDE 07: Feature Spotlight: Objective 4-Way RAG Health
SLIDE 08: Feature Spotlight: Phase Gates & Baseline Schedule Drift
SLIDE 09: Feature Spotlight: 3×3 Risk Matrix & 1-Click Issue Escalation
SLIDE 10: Feature Spotlight: The "My Portfolio" Leadership Dashboard
SLIDE 11: Instant Board Reporting & One-Click Excel Snapshots
SLIDE 12: The 2-Week "First Governance" Implementation Roadmap
SLIDE 13: Total Cost of Ownership: Flat Site Licensing vs. Per-User Fees
SLIDE 14: Conclusion, Pilot Next Steps & Live Demo
```

---

## Slide-by-Slide Content, Visuals & Speaker Talking Points

---

### SLIDE 01: Title & Executive Context
* **Slide Title:** Establishing Practical Project Portfolio Governance
* **Subtitle:** Moving from Spreadsheet Chaos to Real-Time Portfolio Clarity in Microsoft 365
* **Presenter:** `[Consultant Name / Advisory Firm Logo]`
* **Visual Concept:** Minimalist split visual: Left side shows tangled desktop Excel files and conflicting PowerPoint slides; right side shows clean modern PPM Compass 360 portfolio dashboard.
* **Speaker Script:**
  > *"Thank you for your time today. Most leadership teams we advise find themselves at an inflection point: they are managing 20, 40, or 80 critical initiatives across the company, but their visibility relies on outdated desktop spreadsheets and manual slide decks compiled late the night before steering meetings. Today, we're sharing a proven, 2-week path to establish lasting portfolio governance—without buying bloated enterprise software and without inflicting administrative misery on your project leads."*

---

### SLIDE 02: The Real Cost of Spreadsheet & Slide Deck Governance
* **Slide Title:** The Hidden Tax of "Ad-Hoc" Governance
* **Key Bullets:**
  * **Reporting Latency:** Status is already 14 days out-of-date by the time steering committees meet.
  * **Wasted PM Capacity:** Project managers spend 8 to 15 hours each month manually formatting slides instead of driving execution.
  * **Formula Fragility:** A single broken link or altered cell in shared workbooks cascades into conflicting financial reports.
  * **Audit Blindspots:** Zero version history or audit trails on who modified project timelines or budgets.
* **Visual Concept:** Graphic showing 10 PMs × 12 hours/month = 120 wasted hours/month ($100,000+ in lost operational productivity per year).
* **Speaker Script:**
  > *"Excel is brilliant for individual calculations, but it is toxic for portfolio governance. When 30 project managers maintain their own trackers, your executive team receives 30 different definitions of project health. By the time someone manually consolidates them into a board deck, the data is already two weeks old. You are steering the ship by looking at the wake behind you."*

---

### SLIDE 03: The Enterprise PPM Paradox (Why Heavy Tools Fail)
* **Slide Title:** Why Traditional PPM Rollouts Trigger User Rebellion
* **Key Bullets:**
  * **Planview, Clarity, Jira Align:** Built for 20,000-person enterprises with full-time tool administrators.
  * **6 to 9 Month Rollout:** Heavy consulting engagements that cost 3× to 5× the software license.
  * **Administrative Misery:** Requiring 40-step stage gates and 200 dropdown fields forces PMs to bypass the tool.
  * **Massive Budget Commitment:** Minimum entry contracts start at $40,000 to $80,000 annually.
* **Visual Concept:** Comparison cartoon or diagram showing an overloaded pilot cockpit vs. a clean, intuitive modern dashboard.
* **Speaker Script:**
  > *"When mid-sized organizations realize spreadsheets aren't working, the common mistake is buying a heavy enterprise PPM suite. Nine months later, after spending $60,000 on software and six figures on consulting, project managers still rebel because the tool is too bureaucratic. What you need is not more administration—what you need is consistency, clear stage gates, and standardized health."*

---

### SLIDE 04: The Power Apps "Per-User Fee" Dilemma
* **Slide Title:** Why "Low-Code" Power Apps Become a Budget Trap
* **Key Bullets:**
  * **$20 / user / month:** Required Power Apps Premium licenses for every Project Leader who updates an item.
  * **$10 / user / month:** Read access passes for steering committee members and occasional viewers.
  * **Dataverse Storage Quotas:** Additional database capacity fees that grow every year.
  * **For 100 Users:** **$24,000+ every single year** in Microsoft software taxes before writing a single workflow.
* **Visual Concept:** Pricing calculation card showing 25 PMs + 75 Viewers = $18,000/yr in recurring Power Apps licensing fees.
* **Speaker Script:**
  > *"Many IT teams suggest building a custom app on Power Platform. But here is the catch that Microsoft doesn't advertise: every user who touches that app requires a premium Power Apps license. For a company with 25 project leads and 75 stakeholders, that is an $18,000 to $24,000 annual license tax. And ironically, your company already pays for SharePoint Online in your existing Microsoft 365 agreement."*

---

### SLIDE 05: Introducing Pragmatic Governance with PPM Compass 360
* **Slide Title:** The PPM Solution Your Team Won't Hate Using
* **Key Bullets:**
  * **100% Native Microsoft 365:** Runs directly inside your existing SharePoint Online environment.
  * **5-Minute Deployment:** Pre-compiled SPFx solution package (`.sppkg`) uploaded to your tenant App Catalog.
  * **Flat Per-Site Licensing:** Unlimited users and unlimited stakeholders with **zero per-seat fees**.
  * **Fast Adoption:** Intuitive Fluent UI design with zero training barriers.
* **Visual Concept:** Hero screenshot of the PPM Compass 360 web part running on a modern SharePoint page.
* **Speaker Script:**
  > *"PPM Compass 360 bridges the gap perfectly. It delivers the structured governance of an enterprise PPM—4-way RAG, phase gates, 3×3 risk matrices, and executive financial tracking—while running 100% inside your existing SharePoint Online tenant. There are no external databases, no new logins, and absolutely zero per-user seat fees."*

---

### SLIDE 06: Architecture: 100% In-Tenant Data Sovereignty
* **Slide Title:** Zero Egress: Your Data Never Leaves Microsoft 365
* **Key Bullets:**
  * **No External Servers:** Operates entirely client-side as React/TypeScript in the user's browser.
  * **No Telemetry or Ad Trackers:** Zero background beaconing, zero third-party cookies.
  * **Native REST APIs:** Reads and writes directly to standard SharePoint lists using the user's M365 identity.
  * **5-Minute IT Security Approval:** Passes enterprise SecOps audits without DPA revisions or firewall holes.
* **Visual Concept:** Architecture diagram showing browser communicating strictly over HTTPS with SharePoint Online inside the corporate tenant boundary.
* **Speaker Script:**
  > *"For your IT and Information Security team, this is an immediate green light. Unlike SaaS PPM platforms that store your strategic roadmaps and budgets on third-party servers, PPM Compass 360 has zero external egress. All project data resides strictly inside your own SharePoint lists under your existing Azure Active Directory security and compliance policies."*

---

### SLIDE 07: Feature Spotlight: Objective 4-Way RAG Health
* **Slide Title:** Ending Subjective "Color Politics"
* **Key Bullets:**
  * **Four Distinct Dimensions:** Independent tracking for **Timeline**, **Budget**, **Resources**, and **Scope/Quality**.
  * **Aggregated Overall RAG:** Clear corporate health algorithm paired with overall score.
  * **Mandatory Commentary:** Requires PMs to document the root cause, mitigation, and sponsor support required when flagging Amber or Red.
  * **Executive Consistency:** Leadership sees exactly *why* a project is struggling at a single glance.
* **Visual Concept:** Screenshot of the 4 RAG boxes (`TIMELINE`, `BUDGET`, `RESOURCES`, `SCOPE/QUAL.`) with distinct status chips.
* **Speaker Script:**
  > *"In most organizations, 'Amber' is a political hiding place. PPM Compass 360 splits project health into four objective dimensions: Timeline, Budget, Resources, and Scope. A project can have Green timeline and scope, but Red resources because a lead architect resigned. This gives the executive sponsor immediate clarity on where their intervention is needed."*

---

### SLIDE 08: Feature Spotlight: Phase Gates & Baseline Schedule Drift
* **Slide Title:** Schedule Drift Transparency
* **Key Bullets:**
  * **Governance Phase Gates:** Enforce stage approval milestones (e.g. Concept, Gate 1, Design Freeze, Execution, Go-Live).
  * **Baseline vs. Forecast Drift:** Visual indicators show exactly how many days an upcoming milestone has slipped.
  * **6-Color Status Lifecycle:** Completed, In Progress, At Risk, Late/Delayed, Paused, and Planned.
  * **High-Level Visual Timeline:** Built-in collision-avoidance algorithm renders milestones cleanly without overlapping text.
* **Visual Concept:** Close-up of the Milestones tab showing baseline dates, forecast dates, slip badges (+12d), and the interactive staggered timeline.
* **Speaker Script:**
  > *"Projects rarely fail overnight; they fail one slipping milestone at a time. PPM Compass 360 locks the baseline milestone dates agreed during charter sign-off, and contrasts them against current forecasts. If a phase gate drifts by 10 days, the system immediately flags the variance so the team can recover schedule before the client deadline is missed."*

---

### SLIDE 09: Feature Spotlight: 3×3 Risk Matrix & 1-Click Issue Escalation
* **Slide Title:** Proactive Risk Governance Before Crisis Hits
* **Key Bullets:**
  * **Standardized 3×3 Scoring:** Low, Medium, High scales for Likelihood and Impact.
  * **Visual Density Matrix:** Interactive heat grid showing risk clusters by severity.
  * **1-Click "Convert to Issue":** When a risk materializes, convert it into an active blocker instantly.
  * **Sponsor Visibility:** Flagged risks require active executive mitigation and visibility in monthly steering reviews.
* **Visual Concept:** Screenshot of the 3×3 Likelihood × Impact grid with density counts and the "Convert to Issue" workflow banner.
* **Speaker Script:**
  > *"Most risk registers are where good intentions go to die in an unread spreadsheet tab. Our visual 3×3 matrix categorizes risks by likelihood and impact. If a high-impact risk materializes—such as a key vendor going into insolvency—the project leader clicks 'Convert to Issue' with one click, creating an active blocker that demands steering committee action."*

---

### SLIDE 10: Feature Spotlight: The "My Portfolio" Leadership Dashboard
* **Slide Title:** The Portfolio Manager's Single-Pane-of-Glass
* **Key Bullets:**
  * **5 Interactive KPI Drill-Downs:** RAG Health, On-Time Delivery, Financial Burn, Active Blockers, and Phase Distribution.
  * **Financial Transparency:** Shows total budget vs. actuals with explicit "N of M projects have Finance data" disclosure.
  * **Multi-Portfolio Switcher:** Filter instantly across business units (MedTech, Pharma, IT, Operations, Commercial).
  * **Secondary Compliance Roster:** Tracks locked monthly audit compliance and overdue reports.
* **Visual Concept:** Screenshot of the "My Portfolio" view with the 5 interactive KPI tiles and filtered project roster.
* **Speaker Script:**
  > *"For Portfolio Directors and Department Heads, the 'My Portfolio' tab provides an interactive management dashboard. Clicking any tile—such as 'Active Blockers' or 'Late Milestones'—immediately filters the portfolio roster below. You can run your entire monthly steering review directly from this screen without opening a single PowerPoint presentation."*

---

### SLIDE 11: Instant Board Reporting & One-Click Excel Snapshots
* **Slide Title:** Friction-Free Executive Reporting & AI Readiness
* **Key Bullets:**
  * **Locked Monthly Audits:** Project leads publish monthly status summaries that lock cryptographically for audit compliance.
  * **1-Click Executive 1-Pagers:** Export PDF and PowerPoint slide summaries directly from the project drawer.
  * **Entire Project Snapshot (Excel):** Export complete project registers, milestones, risks, and financial history with one click.
  * **Copilot & AI Ready:** Feed clean Excel snapshots directly into Microsoft 365 Copilot for automated board briefing summaries—with zero write hazard to your live data.
* **Visual Concept:** Graphic showing the export dropdown (`📄 1-Pager PDF`, `📊 1-Pager PPTX`, `📗 Full Snapshot .xlsx`) and a Copilot summary window.
* **Speaker Script:**
  > *"We know executives still need to share reports outside of SharePoint. With one click, project leaders can export a presentation-ready 1-pager PDF or PowerPoint slide. Furthermore, Project Leaders can download the entire project snapshot as an Excel file and feed it into Microsoft 365 Copilot to generate executive briefing memos. The live SharePoint data remains 100% pristine and secure."*

---

### SLIDE 12: The 2-Week "First Governance" Implementation Roadmap
* **Slide Title:** From Spreadsheet Chaos to Governed Portfolio in 10 Days
* **Key Milestones:**
  * **Week 1 (Days 1–5): Foundation & Calibration**
    * Day 1–2: Intake charter audit and portfolio taxonomy calibration.
    * Day 3: Deploy `.sppkg` package to tenant App Catalog (5-minute IT setup).
    * Day 4–5: Cleanse and migrate existing spreadsheets into SharePoint.
  * **Week 2 (Days 6–10): Rollout & Enablement**
    * Day 6–7: Configure 4-way RAG and 3×3 risk tolerance thresholds.
    * Day 8–9: Interactive Project Leader training workshops (2 × 90 mins).
    * Day 10: Facilitate the first live monthly Executive Steering Committee review.
* **Visual Concept:** Gantt-style 2-week sprint roadmap with clear deliverables and milestones.
* **Speaker Script:**
  > *"Because PPM Compass 360 is already built and deploys natively into your SharePoint Online, we don't spend months writing code. Over a 2-week fixed sprint, our advisory team configures your taxonomy, migrates your active projects, trains your project leaders, and facilitates your very first executive steering review using the live system."*

---

### SLIDE 13: Total Cost of Ownership: Flat Site Licensing vs. Per-User Fees
* **Slide Title:** Predictable Budget Sanity: Zero Per-User Fees
* **Key Bullets:**
  * **Enterprise PPM Suite:** $45k–$75k/year + $40k consulting setup.
  * **Power Apps Accelerators:** $18k–$25k/year in user licenses + ongoing developer maintenance.
  * **PPM Compass 360:** **Flat 2.990 € / year** per site collection (Promo, excl. VAT) or **3.990 € / year** standard (excl. VAT).
  * **ROI & Breakeven:** Saves **$15,000 to $50,000+ every year** in software licensing fees alone.
* **Visual Concept:** TCO Comparison Bar Chart showing Enterprise PPM vs Power Apps vs PPM Compass 360.
* **Speaker Script:**
  > *"When you look at total cost of ownership, the numbers speak for themselves. While SaaS PPM vendors charge $20 to $60 per user per month, PPM Compass 360 is a flat annual license per site collection. Whether you have 10 people or 500 people accessing the PMO hub, your software cost remains completely flat. Every dollar saved goes into actual project delivery."*

---

### SLIDE 14: Conclusion, Pilot Next Steps & Live Demo
* **Slide Title:** Take Your First Step to Portfolio Clarity
* **Recommended Next Steps:**
  1. **Interactive Demo Walkthrough:** Test drive the live app today across realistic industry portfolios.
  2. **30-Day Risk-Free Evaluation:** Deploy the evaluation package directly to your test site collection.
  3. **Schedule 2-Week Launch Sprint:** Align stakeholders and establish your first governance baseline.
* **Visual Concept:** CTA buttons with direct contact info and links to the live interactive demo.
* **Speaker Script:**
  > *"We would love to show you the application in action. Let's switch over to the live interactive demo right now so you can see how straightforward it is for a project leader to update milestones, manage risks, and publish a locked monthly report. What questions can we answer before we dive in?"*

---

## Executive Objection Handling Guide for Consultants

### Objection 1: "Why not just use Microsoft Planner or Microsoft Lists?"
* **Consultant Answer:** 
  > *"Planner and raw Microsoft Lists are task management tools, not portfolio governance systems. They don't support 4-way RAG tracking, baseline vs. forecast schedule drift, separation of duties for financial Capex/Opex, or locked monthly status audits. You end up with 30 disconnected task boards and still have to copy data into spreadsheets to see the big picture. PPM Compass 360 gives you the portfolio roll-up while using the same underlying SharePoint infrastructure."*

### Objection 2: "Can our internal IT department just build this in Power Apps?"
* **Consultant Answer:**
  > *"They certainly could, but it typically takes 3 to 6 months of internal developer time and requires ongoing bug fixes and maintenance. More importantly, building on Power Apps triggers Microsoft's per-user license requirement: every project manager and viewer requires a $20/month Power Apps license, costing $15,000 to $25,000 every single year. PPM Compass 360 is ready today, fully tested, and carries zero per-user fees."*

### Objection 3: "Is our data safe? Does anything leave our tenant?"
* **Consultant Answer:**
  > *"Nothing leaves your tenant. PPM Compass 360 is built using Microsoft's official SharePoint Framework (SPFx). It executes 100% in the user's web browser and communicates strictly with standard SharePoint lists in your own tenant via native REST APIs. There is zero external data egress, zero external database hosting, and zero telemetry tracking."*

### Objection 4: "Our project managers are resistant to heavy new tools. Will they actually use this?"
* **Consultant Answer:**
  > *"That is precisely why we recommend this solution. It was designed to eliminate tool fatigue. A project leader can update their entire project—4-way RAG commentary, slipping milestones, active risks, and monthly status—in less than 10 minutes a month. Because the UI is clean and responsive, adoption rates are dramatically higher than traditional enterprise suites."*
