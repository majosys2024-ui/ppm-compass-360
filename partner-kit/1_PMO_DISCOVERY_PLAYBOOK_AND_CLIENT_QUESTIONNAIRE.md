# PMO Discovery Playbook & Client Governance Questionnaire
**Document ID:** `PK-DOC-01`  
**Purpose:** Client Stakeholder Intake & Governance Calibration Guide for Implementation Partners  
**Target Audience:** PMO Consultants, Project Portfolio Managers, Transformation Advisory Leads  
**Compatible Solution:** PPM Compass 360 (Native SPFx for Microsoft 365)  

---

## 1. Executive Overview for the Consultant

When guiding a client out of spreadsheet chaos, the primary challenge is **cultural and operational**, not purely technological. Most small-and-mid-market organizations (100 to 5,000 employees) manage between 15 and 80 concurrent initiatives across disconnected desktop Excel trackers, personal OneDrive links, and monthly PowerPoint steering decks.

As an implementation partner, your mission during the discovery phase is to:
1. **Audit Current State & Pain Points:** Quantify hours lost to manual reporting and status chasing.
2. **Standardize Project Taxonomy:** Establish clear portfolio categories, phases, and ownership boundaries.
3. **Calibrate 4-Way RAG Health:** Replace subjective "gut feel" colors with agreed mathematical or operational criteria.
4. **Define the 3×3 Risk & Issue Thresholds:** Establish uniform likelihood/impact boundaries aligned with corporate risk tolerance.
5. **Plan the 2-Week Migration:** Map existing spreadsheet columns to PPM Compass 360 SharePoint fields.

---

## 2. Phase 1: Client PMO Maturity Assessment (Discovery Interview)

Conduct this 45-minute structured interview with the client's Executive Sponsor, PMO Director, or Head of IT/Operations.

### Section A: Operational Scale & Pain Points
| Question | Assessment Focus | Client Response / Notes |
| :--- | :--- | :--- |
| **Q1.** How many active projects, programs, or capital initiatives are currently running? | Scale calibration (10–30: Small; 30–75: Mid-tier; 75+: Enterprise). | |
| **Q2.** Where does project data currently live? (Excel, MS Project, Planner, Jira, Trello, Email)? | Quantify tool fragmentation and data silo count. | |
| **Q3.** How many hours per month does each Project Leader spend compiling slides for steering meetings? | **ROI Metric:** Multiply PM count by hours spent (typically 6–12 hrs/mo per PM). | |
| **Q4.** When executive leadership asks for total portfolio spend vs. budget, how long does it take to answer? | Benchmark reporting latency (Days vs. Real-Time). | |
| **Q5.** Have previous attempts to roll out enterprise tools (e.g., Planview, Clarity, Jira Align) failed? Why? | Identifies tool aversion, administrative bloat, or user resistance. | |

### Section B: M365 Infrastructure & Governance Boundaries
| Question | Assessment Focus | Client Response / Notes |
| :--- | :--- | :--- |
| **Q6.** Does the organization use Microsoft 365 E3 or E5 licensing? | Confirms SharePoint Online & Power Automate entitlement at no extra cost. | |
| **Q7.** Does IT have strict policies against external cloud data storage (Data Egress)? | Validates the 100% In-Tenant SharePoint architecture value proposition. | |
| **Q8.** Who owns project financials? (Project Managers or central Finance/Controlling)? | Verifies need for read-only Finance separation of duties (`PPM_APP_Financials`). | |
| **Q9.** How are Change Requests (CRs) currently approved? | Identifies need for automated Teams/Outlook approval workflows. | |

---

## 3. Phase 2: Portfolio Taxonomy & Phase-Gate Calibration

Work with the sponsor to configure the organization's business units and stage gates. PPM Compass 360 supports multi-portfolio switching and custom project lifecycles.

### Worksheet 1: Business Unit / Portfolio Categorization
Define the top-level portfolio groupings (e.g., up to 6–8 business units):

```
Client Portfolio Taxonomy:
├── [ ] Portfolio 1: ___________________________ (e.g., Digital Transformation & IT)
├── [ ] Portfolio 2: ___________________________ (e.g., Operations & Supply Chain)
├── [ ] Portfolio 3: ___________________________ (e.g., Product R&D / Engineering)
├── [ ] Portfolio 4: ___________________________ (e.g., Regulatory & Compliance / Quality)
├── [ ] Portfolio 5: ___________________________ (e.g., Commercial, Sales & Marketing)
└── [ ] Portfolio 6: ___________________________ (e.g., Customer Experience / Service)
```

### Worksheet 2: Standard Stage-Gate Lifecycle
Confirm which phase gate lifecycle applies across portfolios:

* **Standard Corporate Lifecycle:**
  `1. Intake / Proposal` ➔ `2. Business Case & Gating` ➔ `3. Planning & Design` ➔ `4. Active Execution` ➔ `5. Testing / Validation` ➔ `6. Go-Live & Closeout`
* **Agile / Hybrid Product Delivery:**
  `1. Discovery / Backlog` ➔ `2. Sprint Execution (MVP)` ➔ `3. Pilot / Beta Release` ➔ `4. General Availability (GA)`
* **Regulated Sector (MedTech / Pharma / Automotive / Aerospace):**
  `1. Concept Feasibility` ➔ `2. Design Freeze & DHF` ➔ `3. V&V Testing` ➔ `4. Regulatory Submission` ➔ `5. Commercial Launch`

---

## 4. Phase 3: 4-Way RAG Health Calibration Worksheet

Subjective project health reporting causes political friction. In PPM Compass 360, health is tracked across **four explicit dimensions** plus overall status: **Timeline**, **Budget**, **Resources**, and **Scope/Quality**.

Use this calibration matrix to establish organizational consensus before launch:

| Dimension | 🟢 Green (On Track) | 🟡 Amber (Attention Required) | 🔴 Red (Critical / Escalated) |
| :--- | :--- | :--- | :--- |
| **Overall Health** | All dimensions Green or minor Amber with approved mitigation. | 1 or 2 Amber ratings; corrective actions active; sponsor informed. | Any Red dimension, or milestone slip impacting corporate commitments. |
| **Timeline** | Forecast completion within baseline date or slip < 5 business days. | Schedule slip between 5 and 15 business days; critical path stressed. | Schedule slip > 15 business days; major phase-gate deadline missed. |
| **Budget** | Forecast variance < 5% of approved budget; spend on track. | Forecast variance between 5% and 15% over approved budget. | Forecast variance > 15% or unapproved budget overrun requiring steering funding. |
| **Resources** | Core roles allocated (≥ 80% staffed); key architects available. | Temporary resource gap (1–2 weeks); key lead partially double-booked. | Critical role vacancy > 3 weeks; critical skills bottleneck halting progress. |
| **Scope / Quality** | Deliverables align 100% with project charter; test passes > 95%. | Minor scope changes absorbed in sprint/contingency; minor defect backlog. | Significant scope creep; regulatory non-compliance; major defect blockers. |

> **Consultant Pro-Tip:** Insist that any project leader changing a dimension to **Amber** or **Red** must enter mandatory commentary explaining:
> 1. What caused the variance?
> 2. What corrective action is in flight?
> 3. What specific support is needed from the Executive Sponsor?

---

## 5. Phase 4: 3×3 Risk & Issue Tolerance Calibration

PPM Compass 360 enforces a standardized **3×3 Likelihood × Impact scoring matrix** (Low = 1, Medium = 2, High = 3). Calibrate client definitions:

```
                  LIKELIHOOD SCALE
               Low (1)      Medium (2)     High (3)
            ┌─────────────┬─────────────┬─────────────┐
   High (3) │  Amber (3)  │   RED (6)   │  CRITICAL 9 │
I           ├─────────────┼─────────────┼─────────────┤
M  Med (2)  │  Green (2)  │  Amber (4)  │   RED (6)   │
P           ├─────────────┼─────────────┼─────────────┤
   Low (1)  │  Green (1)  │  Green (2)  │  Amber (3)  │
            └─────────────┴─────────────┴─────────────┘
```

### Risk Calibration Definitions:
1. **Impact (Financial, Schedule, Reputation):**
   * **Low (1):** Cost impact < $10k; schedule impact < 1 week; internal only.
   * **Medium (2):** Cost impact $10k–$50k; schedule impact 1–3 weeks; business unit visibility.
   * **High (3):** Cost impact > $50k; schedule impact > 3 weeks; executive/client visibility or regulatory breach.
2. **Likelihood:**
   * **Low (1):** Unlikely (< 20% probability).
   * **Medium (2):** Possible (20% – 60% probability).
   * **High (3):** Probable / Anticipated (> 60% probability).
3. **Issue Escalation Rule:** When an active risk materializes, the Project Leader clicks **"Convert to Issue"** in PPM Compass 360. This preserves the historical risk record while creating an active blocker requiring sponsor unblocking.

---

## 6. Phase 5: Excel-to-SharePoint Data Migration Worksheet

During Week 1 of your consulting engagement, gather the client's current project spreadsheets and map columns into the native `PPM_APP_Projects` list:

| Client Legacy Spreadsheet Column | PPM Compass 360 Target Field | Data Type | Notes / Value Mapping |
| :--- | :--- | :--- | :--- |
| Project ID / Reference # | `ProjectCode` (`Title`) | Single Line Text | e.g. `PRJ-101`, `MED-201` |
| Project Name / Initiative Title | `ProjectTitle` | Single Line Text | Descriptive project title |
| Department / Division | `Portfolio` | Choice | Match configured Portfolio choice |
| Project Manager / Owner | `ProjectLead` | Person / User | M365 Azure AD user lookup |
| Executive Sponsor | `ProjectSponsor` | Person / User | M365 Azure AD user lookup |
| Stage / Status | `ProjectPhase` | Choice | Map to approved phase gate lifecycle |
| Overall RAG Status | `OverallHealth` | Choice | `Green`, `Amber`, `Red` |
| Timeline RAG | `TimelineHealth` | Choice | `Green`, `Amber`, `Red` |
| Budget RAG | `BudgetHealth` | Choice | `Green`, `Amber`, `Red` |
| Resources RAG | `ResourcesHealth` | Choice | `Green`, `Amber`, `Red` |
| Scope / Quality RAG | `ScopeHealth` | Choice | `Green`, `Amber`, `Red` |
| Planned Start Date | `StartDate` | Date Only | Initial kick-off date |
| Target Completion Date | `TargetDate` | Date Only | Current approved forecast date |
| Approved Budget | `ApprovedBudget` | Currency | Optional: Or maintain in `PPM_APP_Financials` |
| Total Actual Spend YTD | `ActualSpendYTD` | Currency | Maintained by Finance or PM |
| Executive Summary / Goals | `ProjectDescription` | Multi-line Text | Strategic objective overview |

---

## 7. Discovery Deliverable Sign-Off Sheet

Present this completed summary to the Executive Sponsor at the end of Week 1:

* **Client Organization:** __________________________________________________
* **Executive Sponsor:** ____________________________________________________
* **Lead PMO Consultant:** _________________________________________________
* **Total Projects in Initial Wave:** _________ active initiatives
* **Approved Portfolios:** [1] ________ [2] ________ [3] ________ [4] ________
* **Target Launch Date (Week 2):** ________________________

**Sponsor Approval Signature:** ____________________________ **Date:** ____________
