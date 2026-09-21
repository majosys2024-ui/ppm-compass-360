# Statement of Work (SOW): "First PMO Governance" 2-Week Launch
**Document ID:** `PK-DOC-03`  
**Engagement Type:** Fixed-Fee Advisory & Implementation Sprint ($8,000 – $18,000)  
**Provider:** `[Consultancy / Advisory Firm Name]`  
**Client:** `[Client Organization Name]`  
**Technology Platform:** PPM Compass 360 (Microsoft 365 In-Tenant SPFx Solution)  

---

## 1. Executive Summary & Engagement Purpose

`[Client Organization Name]` ("Client") is engaging `[Consultancy Name]` ("Consultant") to establish a standardized, lightweight Project Portfolio Management (PPM) governance baseline across active business initiatives. 

Currently, project tracking is fragmented across personal spreadsheets, email threads, and manual slide decks, resulting in reporting latency, lack of executive visibility, and inconsistent project health assessment.

This **2-Week "First Governance" Launch Sprint** delivers:
1. **Taxonomy & Governance Standardization:** Portfolio categorization, phase-gate lifecycle, and objective 4-way RAG criteria.
2. **Technical Deployment:** Upload, activation, and permission configuration of the PPM Compass 360 solution package inside the Client's Microsoft 365 SharePoint Online tenant.
3. **Legacy Data Cleansing & Migration:** Onboarding of up to `[30 / 50 / 75]` active projects into the centralized PMO hub.
4. **Stakeholder Enablement:** Hands-on training for Project Leaders, Portfolio Managers, and Executive Sponsors.
5. **Initial Steering Committee Facilitation:** Co-running the first live executive portfolio review using the native "My Portfolio" dashboard.

---

## 2. Scope of Services & Deliverables

### Phase 1: Governance Architecture & Discovery (Days 1–3)
* **D1.1 PMO Discovery Workshop:** Facilitate a 2-hour structured session with the Executive Sponsor and PMO leads using the PMO Discovery Playbook.
* **D1.2 Portfolio Taxonomy:** Establish up to 6 approved business unit portfolios (e.g., IT, Operations, R&D, Commercial).
* **D1.3 Stage-Gate Lifecycle:** Define a uniform 5-to-6 stage phase-gate governance lifecycle.
* **D1.4 4-Way RAG Health Matrix:** Formalize objective thresholds for Timeline, Budget, Resources, and Scope ratings.
* **D1.5 3×3 Risk & Issue Matrix:** Calibrate Likelihood and Impact scales aligned with Client corporate risk tolerance.

### Phase 2: Technical Deployment & Data Migration (Days 4–5)
* **D2.1 In-Tenant SPFx Deployment:** Guide Client SharePoint Admin through uploading `ppm-compass-360.sppkg` to the Tenant App Catalog and activating on the target PMO site collection.
* **D2.2 Workspace Provisioning:** Trigger automatic provisioning of operational SharePoint lists (`PPM_APP_Projects`, `PPM_APP_Milestones`, `PPM_APP_RisksIssues`, `PPM_APP_Financials`, etc.).
* **D2.3 Security & Role Inheritance:** Configure broken role inheritance via built-in Site Owner tools, ensuring standard users belong exclusively to read-only Visitors site group.
* **D2.4 Data Migration:** Cleanse, transform, and import up to `[50]` active project charters and milestone schedules from legacy Excel workbooks.

### Phase 3: Rollout, Enablement & Steering Review (Days 6–10)
* **D3.1 Project Leader Enablement Workshops:** Deliver two (2) 90-minute hands-on training sessions for Project Managers covering:
  * 4-Way RAG commentary and monthly report publishing/locking.
  * Baseline milestone drift and timeline visualization.
  * 3×3 risk register management and 1-click issue escalation.
  * Local project snapshot export (Excel `.xlsx`, 1-pager PPTX, PDF).
* **D3.2 Executive Steering Walkthrough:** 45-minute orientation for Steering Committee members and Sponsors on the "My Portfolio" KPI dashboard.
* **D3.3 Inaugural Steering Committee Meeting:** Consultant co-facilitates the Client's first live monthly portfolio review using the interactive WebPart.
* **D3.4 Handover & Governance Playbook:** Deliver completed Client Governance Quick-Reference Guide and administrative runbook.

---

## 3. Out-of-Scope Items

To guarantee delivery within the 2-week timeline, the following activities are strictly out of scope for this sprint (available under subsequent advisory phases):
* Custom code modifications to the compiled SPFx React bundle.
* Integration with third-party ERP/accounting systems (SAP, Oracle, NetSuite) beyond standard manual Capex/Opex list entry.
* Migration of more than `[50]` legacy projects (additional projects scoped separately).
* Advanced custom Power BI dashboard development or multi-tier corporate gateway setups.

---

## 4. Day-by-Day Consultant Delivery Roadmap

```
WEEK 1: ARCHITECTURE, DEPLOYMENT & MIGRATION
├── Day 01: Project Kick-off, PMO Discovery Workshop & Stakeholder Interviews
├── Day 02: Portfolio Taxonomy, 4-Way RAG Calibration & 3×3 Risk Threshold Sign-off
├── Day 03: SharePoint App Catalog Deployment & Workspace Permission Configuration
├── Day 04: Legacy Spreadsheet Extraction, Data Cleansing & Column Mapping
└── Day 05: In-Tenant Data Import, List Verification & System Smoke Testing

WEEK 2: ENABLEMENT, USER TRAINING & EXECUTIVE LAUNCH
├── Day 06: Project Leader Workshop #1: Charter Management & Milestone Drift
├── Day 07: Project Leader Workshop #2: 3×3 Risk Matrix & Monthly Locked Status
├── Day 08: Executive Sponsor Walkthrough: "My Portfolio" Dashboard & KPI Drill-down
├── Day 09: Final Dry-Run & Steering Committee Agenda Alignment
└── Day 10: Live Steering Committee Review Facilitation & Engagement Sign-Off
```

---

## 5. Client Responsibilities & Prerequisites

The successful execution of this 2-Week Launch depends upon Client fulfilling the following commitments:
1. **SharePoint Administrator Access:** Client must provide a designated SharePoint or Tenant Administrator for a 30-minute deployment window on Day 3.
2. **Access to Legacy Trackers:** Client will provide all existing project tracking spreadsheets and slide decks by end of Day 2.
3. **Stakeholder Attendance:** Mandatory attendance of designated Project Leaders in the two training workshops during Week 2.
4. **Single Point of Contact (SPOC):** A dedicated Client PMO Lead authorized to approve taxonomy and RAG definitions.

---

## 6. Commercial Terms & Payment Schedule

### Professional Services Fee: `[$12,500 USD / 12.000 €]` *(Example Tier)*
The engagement is performed on a **Fixed-Fee basis**, billed against agreed completion milestones:

| Milestone | Deliverables Trigger | Amount (% of Total) |
| :--- | :--- | :--- |
| **Milestone 1: Project Kick-Off** | Execution of SOW; Discovery Workshop scheduled. | 40% (`$5,000`) |
| **Milestone 2: System Deployed & Data Migrated** | Solution activated in App Catalog; legacy projects imported. | 40% (`$5,000`) |
| **Milestone 3: Enablement & Steering Review** | Training completed; first live review facilitated; handover. | 20% (`$2,500`) |

*Note: Software licensing for PPM Compass 360 is billed separately (`2.990 € / yr` promo billed as 8.970 € upfront for 3 years, or `3.990 € / yr` standard per site collection, excl. applicable VAT).*

---

## 7. Change Control & Extension Terms

Any modification to scope, project volume, or schedule will be managed through a formal Change Request (CR) document detailing impact on timeline and fees. Additional consulting days outside this SOW are billed at Consultant’s standard daily rate of `[$1,800 / day]`.

---

## 8. Engagement Sign-Off & Acceptance

By signing below, the parties agree to the terms, scope, and deliverables specified in this Statement of Work.

### For Client: `[Client Organization Name]`
* **Authorized Signatory:** __________________________________________________
* **Title:** _______________________________________________________________
* **Date:** ________________________________________________________________

### For Consultant: `[Consultancy Name]`
* **Authorized Signatory:** __________________________________________________
* **Title:** _______________________________________________________________
* **Date:** ________________________________________________________________
