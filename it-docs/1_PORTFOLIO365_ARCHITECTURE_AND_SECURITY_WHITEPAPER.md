# Portfolio365 — Architecture, Data Flow, and Enterprise Security Whitepaper

**Document Classification:** Internal Technical Evaluation & InfoSec Clearance  
**Solution Package:** `ppm-compass-360.sppkg` (`ppm-portfolio-management`)  
**Application Identity (Internal):** Portfolio365  
**Version:** `1.0.1.12` (SPFx `1.23.2` | React `17.0.1` | Webpack `5.105.4` | TypeScript `5.8.0`)  
**Date:** September 2026  
**Target Audience:** Enterprise Architects, Chief Information Security Officers (CISOs), SecOps Engineers, SharePoint Administrators, and IT Governance Teams  

---

## Executive Summary

**Portfolio365** is a single-tier, modern SharePoint Framework (SPFx) client-side application designed to deliver full-lifecycle Project Portfolio Management (PPM) directly within an organization's existing Microsoft 365 tenant.

From an enterprise security and risk perspective, Portfolio365 possesses a distinctive architectural profile:
1. **Zero External Infrastructure:** Portfolio365 operates with **no external backend servers**, **no cloud databases**, **no external APIs**, and **no third-party software-as-a-service (SaaS) dependencies**.
2. **Zero Telemetry and Zero Data Egress:** The application contains **zero tracking beacons**, **zero analytics scripts**, **zero crash-reporting pings**, and **zero outbound network connections**. 100% of network traffic remains strictly confined within the customer's authenticated Microsoft 365 SharePoint Online domain.
3. **100% Customer Data Residency:** All project data, budgets, financials, risk registers, milestone timelines, status reports, change requests, and resource allocations reside entirely within standard SharePoint Online lists on the customer's host site collection. Data never leaves the tenant.
4. **Zero-Trust Privilege Model (Zero Member Access):** Portfolio365 introduces a hardened operational permission model wherein all regular users (Project Leaders, Team Members, Executives) are placed in the read-only **Visitors** group. Fine-grained write permissions are scoped specifically to operational lists via automated broken role inheritance, eliminating the catastrophic risk of users altering site settings, deleting document libraries, or corrupting configuration lists.
5. **M365 Copilot & Tenant Search Boundary Enforcement:** The application provides automated controls (`NoCrawl: true`) to isolate sensitive project narratives, confidential risks, and financial summaries from tenant-wide search crawlers and Microsoft 365 Copilot semantic indices.
6. **Offline Cryptographic Licensing with Zero-Lockout Guarantee:** Licensing is validated purely client-side using W3C standard Web Cryptography (`SubtleCrypto`) and ECDSA P-256 / SHA-256 digital signatures. No license server is contacted. If a license expires, write capabilities are gated, but **all reporting, querying, and full-fidelity data export functions (Excel, PDF, PowerPoint) remain 100% accessible forever**.

---

## 1. System Architecture & Topology

### 1.1 Single-Tier Client-Side Execution

Portfolio365 is compiled into an SPFx Web Part (`PpmPortfolioWebPart`). When an authenticated user accesses a SharePoint modern page hosting Portfolio365:
- The user's web browser downloads the verified JavaScript and CSS assets directly from the tenant's internal SharePoint App Catalog (`HTTPS://SPCLIENTSIDEASSETLIBRARY/`).
- The application executes entirely within the browser's JavaScript sandbox.
- State management, view routing, financial calculations, RAG (Red-Amber-Green) scoring, timeline rendering, and data transformations execute on the client's local CPU.
- All persistent storage operations communicate exclusively with the local SharePoint site collection via standard SharePoint Online REST APIs (`/_api/web/...`) utilizing the enterprise-standard PnPjs library (`@pnp/sp` v4.20.0).

```
+---------------------------------------------------------------------------------------------------+
|                                     CUSTOMER WORKSTATION                                          |
|                                                                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  |                                  Standard Web Browser                                       |  |
|  |                                                                                             |  |
|  |  +---------------------------------------------------------------------------------------+  |  |
|  |  |                     Portfolio365 Client-Side Runtime (React 17)                       |  |  |
|  |  |                                                                                       |  |  |
|  |  |  [ UI Views & Forms ]    [ State Management ]    [ Offline ECDSA License Validator ]  |  |  |
|  |  |  [ RAG Trend Engine ]    [ In-Memory Exporter ]  [ Optimistic Concurrency Manager ]   |  |  |
|  |  |                                                                                       |  |  |
|  |  |                            PnPjs v4 REST Client Layer                                 |  |  |
|  |  +-------------------------------------------+-------------------------------------------+  |  |
|  +----------------------------------------------|----------------------------------------------+  |
+-------------------------------------------------|-------------------------------------------------+
                                                  |
                     HTTPS / TLS 1.3              | Standard SharePoint Online REST APIs
               (Authenticated M365 Session)       | (Scoped strictly to host Site Collection)
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                 MICROSOFT 365 TENANT BOUNDARY                                     |
|                                                                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  |                      Host SharePoint Site Collection (e.g. /sites/ppm)                      |  |
|  |                                                                                             |  |
|  |  +---------------------------+  +---------------------------+  +-------------------------+  |  |
|  |  |   Core Project Data       |  |  Governance & Reporting   |  |   Configuration         |  |  |
|  |  |  - PPM_APP_Projects       |  |  - PPM_APP_MonthlyStatus  |  |  - PPM_CFG_AppSettings  |  |  |
|  |  |  - PPM_APP_Milestones     |  |  - PPM_APP_ChangeRequests |  |  - PPM_CFG_Portfolios   |  |  |
|  |  |  - PPM_APP_RisksIssues    |  |  - PPM_APP_Financials     |  |  - PPM_CFG_ProjectType- |  |  |
|  |  |  - PPM_APP_Allocations    |  |  - PPM_APP_PersonCapacity |  |    Phases                |  |  |
|  |  +---------------------------+  +---------------------------+  +-------------------------+  |  |
|  +---------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  X  <-- ZERO OUTBOUND NETWORK TRAFFIC
                                                  |      (Blocked by design - no connectors,
                                                  v       no telemetry, no external endpoints)
+---------------------------------------------------------------------------------------------------+
|                                      PUBLIC INTERNET                                              |
|                                                                                                   |
|               [ External SaaS ]       [ Telemetry / Tracking ]       [ License Servers ]          |
|                   (NONE)                      (NONE)                       (NONE)                 |
+---------------------------------------------------------------------------------------------------+
```

### 1.2 Structural Isolation: No Power Platform / No Connectors

Earlier enterprise project portfolio tools frequently relied on Power Apps Canvas applications, Power Automate cloud flows, and Dataverse or third-party premium connectors. Portfolio365 was intentionally architected to eliminate this entire attack surface:
- **No Premium Connectors:** Zero dependency on Power Apps per-user licenses or external data gateways.
- **No Azure App Registrations:** Operates without enterprise application credentials, client secrets, or delegated OAuth scopes.
- **No Power Automate Runtime Dependency:** All core project lifecycle actions, state transitions, validation rules, RAG rollups, and locks execute synchronously within the React application. (An optional, non-premium Power Automate approval flow template is available for Change Requests if an organization elects to approve requests via Outlook, but the web part functions autonomously without it).

---

## 2. Authentication, Authorization & Identity Governance

### 2.1 Identity Context

Portfolio365 possesses **no independent service account, daemon principal, or background worker**. Every operation executed by the application runs strictly within the ambient Microsoft Entra ID (Azure AD) security context of the human user sitting at the keyboard:
- The user authenticates against Microsoft 365 using the enterprise's configured Single Sign-On (SSO) and Multi-Factor Authentication (MFA) policies, including Conditional Access and Intune device compliance.
- HTTP requests sent from Portfolio365 to SharePoint Online automatically leverage the browser's native session cookies and Microsoft 365 security tokens.
- The web part's `AppManifest.xml` demands **zero `<WebApiPermissionRequests>`**. It requests no permissions to Microsoft Graph, Azure DevOps, Exchange Online, or third-party APIs.

### 2.2 The "Zero Member Access" Security Architecture

In standard SharePoint team sites, users assigned to the default "Members" group possess site-wide *Edit* or *Contribute* permissions. In a project portfolio environment, granting hundreds of project participants broad Member access creates severe operational and compliance risks:
- Users can accidentally delete site pages, alter navigation, or create unapproved document libraries.
- Users can browse to list settings, modify choice values, or delete lists.
- Users can edit or delete project data belonging to other departments.

To solve this, Portfolio365 implements a hardened **Zero Member Access Model**:

```
+---------------------------------------------------------------------------------------------------+
|                                   ZERO MEMBER ACCESS PERMISSION MODEL                             |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  1. SITE LEVEL (Root Site Collection Permissions):                                                |
|     - Site Owners Group:    Full Control (Administrators / Portfolio Office only)                 |
|     - Site Visitors Group:  Read-Only (100% of regular users: PMs, Team Members, Executives)      |
|     - Site Members Group:   EMPTY (0 users assigned; verified via compliance audit)              |
|                                                                                                   |
|  2. LIST LEVEL (Automated Broken Role Inheritance via "Site Owner Tools"):                        |
|                                                                                                   |
|     +-----------------------------------------+  +---------------------------------------------+  |
|     |     RESTRICTED CONFIGURATION LISTS      |  |           OPERATIONAL PROJECT LISTS         |  |
|     |    (Inherit from Site Collection)       |  |          (Broken Inheritance Applied)       |  |
|     |                                         |  |                                             |  |
|     |  - PPM_CFG_AppSettings                  |  |  - PPM_APP_Projects                         |  |
|     |  - PPM_CFG_Portfolios                   |  |  - PPM_APP_Milestones                       |  |
|     |  - PPM_CFG_ProjectTypePhases            |  |  - PPM_APP_RisksIssues                      |  |
|     |                                         |  |  - PPM_APP_MonthlyStatus                    |  |
|     |  Permissions:                           |  |  - PPM_APP_ChangeRequests                   |  |
|     |  * Site Owners:   Full Control          |  |  - PPM_APP_Financials                       |  |
|     |  * Site Visitors: READ-ONLY             |  |  - PPM_APP_ProjectAllocations               |  |
|     |                                         |  |                                             |  |
|     |  (Guarantees no non-admin user can ever |  |  Permissions:                               |  |
|     |   alter system settings or options)     |  |  * Site Owners:   Full Control              |  |
|     |                                         |  |  * Site Visitors: Contribute (scoped write)|  |
|     +-----------------------------------------+  +---------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
```

#### Automated Implementation via Site Owner Tools
The built-in **Site Owner Tools** administration panel provides one-click automation for Site Owners:
- **`applyBrokenInheritance` (`breakRoleInheritance`):** Programmatically severs list permission inheritance on operational lists and grants the site's *Visitors* group scoped *Contribute* access on those lists alone.
- **`reportMembersVsVisitors`:** Executes an automated audit across the site groups. If any user or security group is detected in the site's default *Members* group, a prominent warning is flagged, instructing the administrator to transition them to *Visitors*.
- **"View as Visitor" Simulation:** An in-app preview toggle enables Site Owners to instantly preview the UI from the perspective of a restricted Visitor without logging out or requiring dummy test accounts. All write actions safely no-op with a clear notice.

### 2.3 Application-Level Role-Based Access Control (RBAC)

Layered on top of SharePoint permissions, Portfolio365 enforces robust application-level governance:
- **Project Leader (PL) & Deputy Scoping:** When the optional `restrictEditToOwnProjects` policy is enabled in `PPM_CFG_AppSettings`, users with Contribute access can only edit Milestones, Risks, Change Requests, and Status Reports for projects where they are explicitly named as the Project Leader, Deputy, or Sponsor.
- **Portfolio Owners & Deputies ("My Portfolio" Workspace):** Configured in `PPM_CFG_Portfolios`. Portfolio Owners and Deputies have access to a dedicated **"My Portfolio"** KPI dashboard (`PpmPortfolioManagerKpi`), gated on `getPortfoliosOwnedByCurrentUser()`. This view aggregates five real-time KPI tiles (RAG Health, On-Time Schedule, Financial Burn with reporting-gap indicators, Active High/Critical Blockers, and Phase Distribution) with interactive click-to-drill-down panels, alongside secondary compliance and milestone cards, without requiring global Site Owner rights.
- **Record Immutability & Lifecycle Locking:**
  - **Closed Projects:** When a project's `OverallStatus` is set to "Closed", all associated records (Milestones, Risks, Allocations, Status Reports, Quick Links) are locked against modifications for all users.
  - **Submitted/Approved Change Requests:** Change Requests in Submitted, Approved, Rejected, or Deferred status are permanently locked.
  - **Submitted Status Reports:** Historical status reports lock upon submission, capturing immutable snapshots of project health and milestone statuses.
- **Direct Collaboration via In-Browser Deep Linking:** A dedicated **Share Link** on the Project Detail tab bar copies a verified deep link (`?project=<ProjectNumber>&tab=<tab>`) to the user's clipboard via standard browser `navigator.clipboard` APIs. Operates 100% client-side across all 7 project tabs with zero external URL shorteners or tracking redirects.

---

## 3. Data Governance, Isolation & Privacy

### 3.1 Interactive 3×3 Risk & Issue Matrix Architecture

Risk visualization in Portfolio365 utilizes a standard PMBOK/PMO probability-impact heat map:
- **3×3 Matrix Layout:** Low, Medium, and High ratings across Likelihood (horizontal) and Impact (vertical) axes.
- **Pure Client-Side Bucketing:** Implemented via pure functional layout logic (`riskMatrixLayout.ts`) without external charting dependencies. The matrix plots all active `ItemType = Risk` items and converted issues (`ConvertedFromRisk = true`).
- **Interactive Drill-Down & Count Density:** Each cell renders a count of items falling within that risk coordinate, color-coded by the worst severity rating present (Critical/High red, Medium amber, Low green). Clicking any cell instantly filters the risk register table below to display only matching records.
- **Zero API Overhead:**
  - *Project Level (`PpmRisksTab`):* Renders directly from data already in browser memory. Dispatches zero additional REST calls.
  - *Portfolio Level (`PpmAnalytics`):* Scoped via the existing indexed `getRisksIssuesPage()` OData query, maintaining 100% compliance with the 5,000-item List View Threshold.


### 3.2 M365 Copilot & Search Crawl Protection (`NoCrawl`)

In modern Microsoft 365 environments, search crawlers and Microsoft 365 Copilot index content across all accessible SharePoint sites. For sensitive project portfolios containing proprietary R&D timelines, confidential restructuring plans, or project budgets, public search indexing presents a substantial risk of accidental disclosure.

Portfolio365 addresses this through automated crawler suppression:
- The **Site Owner Tools** panel includes an automated **`applySearchHidden`** utility.
- When executed, it sets the SharePoint native `NoCrawl = true` property on all internal portfolio lists (`PPM_APP_*` and `PPM_CFG_*`).
- **Result:** Microsoft Search and Microsoft 365 Copilot are strictly barred from indexing list rows, preventing project narratives, risk descriptions, and financials from appearing in enterprise-wide search queries or AI summaries.

### 3.3 Concurrency Control & Data Integrity

To prevent data loss in multi-user environments (e.g., two project leads editing the same project or status report simultaneously), Portfolio365 implements strict **Optimistic Concurrency Control**:
- When an entity form opens (Project, Milestone, Risk/Issue, Change Request, Status Report), the record's SharePoint `Modified` timestamp is captured.
- Prior to committing an update via REST, the application verifies that the item's current `Modified` timestamp on the server matches the initial read.
- If a collision occurs, the write is aborted, and the user is presented with a non-destructive conflict notification offering an immediate "Reload latest version" action.

### 3.4 SharePoint 5,000 List View Threshold Immunity

SharePoint Online enforces a strict List View Threshold of 5,000 items. Unindexed queries or queries using non-seekable operators fail with fatal HTTP 500 threshold exceptions once a list exceeds 5,000 items.

Portfolio365 is engineered from the ground up for scale:
1. **Automated Index Provisioning:** Every queried column (e.g., `ProjectId`, `ProjectNumber`, `Status`, `ReportingMonth`, `IsActive`) is automatically indexed via `PpmProvisioningService` during workspace setup.
2. **Positive Filter Clauses:** The query engine rejects non-indexable negative operators (`ne`, `<>`, `not`). In `pagingUtils.ts`, the `buildPositiveStatusFilter` method dynamically constructs seekable `eq` / `or` chains (e.g., `(Status eq 'Open' or Status eq 'In Progress')`), ensuring the database query optimizer executes indexed index seeks rather than full table scans.
3. **Monotonic Id-Cursor Pagination:** Pagination across large datasets (All Milestones, All Risks, Analytics) relies on monotonic `Id gt {lastId}` cursor filters rather than fragile `$skip`/`$top` offsets.
4. **Windowed Queries:** Resource allocation queries are strictly bounded to the active displayed window (e.g., rolling 24-month horizon) with roster-seeded rows.
5. **Row-Count Health Bands:** The health check monitors table sizes against proactive thresholds (🟢 < 8,000 items, 🟡 8,000–15,000 items, 🔴 > 15,000 items).

### 3.5 Version History & Storage Quota Protection

SharePoint Online versioning can consume massive tenant storage if unlimited versions are retained on frequently updated lists.
- During provisioning, Portfolio365 automatically configures a strict retention cap: **`MajorVersionLimit: 100`** across all lists (and **`300`** on `PPM_APP_Projects`).
- This safeguards enterprise SharePoint storage quotas while providing a robust, 100-version rollback and audit trail.

---

## 4. Offline Cryptographic Licensing Architecture

### 4.1 Threat Model & Design Philosophy

Enterprise IT teams routinely object to commercial add-ins that phone home to external licensing servers, transmit tenant identifiers, or lock customer data behind remote activation endpoints. Portfolio365 eliminates this risk entirely by implementing an **offline, key-based cryptographic licensing mechanism**:

```
+---------------------------------------------------------------------------------------------------+
|                            OFFLINE CRYPTOGRAPHIC LICENSING WORKFLOW                               |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  1. AIR-GAPPED TOKEN ISSUANCE (Vendor Environment):                                               |
|     - Payload constructed: { tenantId, siteId, sku, tier, validUntil, issuedAt }                  |
|     - Payload digitally signed using Vendor ECDSA P-256 Private Signing Key (NIST P-256 / SHA-256) |
|     - Base64URL-encoded token delivered to customer via email or administrative portal            |
|                                                                                                   |
|  2. CLIENT-SIDE VALIDATION (Customer Browser Runtime):                                            |
|     - Administrator pastes token into Portfolio365 -> Site Owner Tools -> License tab             |
|     - Token stored in local list: PPM_CFG_AppSettings (Key: 'LicenseToken')                       |
|     - Web part verifies signature using Hardcoded ECDSA P-256 Public Key                          |
|     - Verification executed via W3C standard: window.crypto.subtle.verify()                       |
|     - Scope evaluated: Matches Current Site Collection GUID or Tenant GUID?                        |
|     - Expiration evaluated: validUntil >= Current UTC Date?                                       |
|                                                                                                   |
|  3. ZERO NETWORK CALLS:                                                                           |
|     - Zero HTTP requests dispatched. Zero external telemetry. Complete air-gap compatibility.   |
+---------------------------------------------------------------------------------------------------+
```

### 4.2 Ethical "Zero-Lockout" Data Export Guarantee

A critical compliance feature of Portfolio365 is its ethical licensing fail-safe:
- If a license expires or becomes invalid, the application sets an internal state flag: `writeBlocked = true`.
- Create, edit, and delete operations across projects, milestones, risks, change requests, and status reports are disabled with a clear informational notice.
- **The Zero-Lockout Carve-Out:** All read access, navigation, dashboards, analytics, and **all export capabilities remain 100% functional and unlocked forever**.
- Customers can export their entire portfolio to **Excel (`.xlsx`)**, export one-page executive summaries to **PDF (`.pdf`)**, or generate slide decks to **PowerPoint (`.pptx`)** directly from browser memory without any active license.

---

## 5. Client-Side Export Architecture & Privacy

All export features in Portfolio365 execute **entirely client-side within the browser**:

| Export Format | Library Used | Execution Mechanism | Network Impact |
|---|---|---|---|
| **Excel (`.xlsx`)** | `xlsx` (SheetJS v0.18.5) | Client-side memory assembly into binary Blob; downloaded via `URL.createObjectURL()`. | **Zero network calls**. Gated to Admins, Portfolio Owners, and assigned Project roles. |
| **PDF (`.pdf`)** | `jspdf` (v4.2.1) | Vector-drawn executive summary cards, milestones, and status charts rendered in browser memory. | **Zero network calls**. No intermediate cloud rendering. |
| **PowerPoint (`.pptx`)** | `pptxgenjs` (v4.0.1) | Programmatic slide deck generation with native shapes, tables, and brand typography. | **Zero network calls**. Generates instant `.pptx` file directly in browser. |

---

## 6. Architecture & Security Sign-Off Summary

| Evaluation Criteria | Finding | IT Compliance Rating |
|---|---|---|
| **Data Hosting & Residency** | 100% in customer's SharePoint site collection. Zero external databases. | **COMPLIANT** (Full Data Sovereignty) |
| **External Network Connections** | 0 outbound HTTP/HTTPS requests to external hosts. | **COMPLIANT** (Zero Data Egress) |
| **Identity & Authentication** | Ambient Entra ID SSO. Zero service accounts or app secrets. | **COMPLIANT** (Zero-Trust Aligned) |
| **Tenant API Permissions** | Zero `<WebApiPermissionRequests>`. No Graph API access requested. | **COMPLIANT** (Least Privilege) |
| **Access Governance** | "Zero Member Access" model with automated broken role inheritance. | **COMPLIANT** (Hardened Surface) |
| **Search & AI Governance** | Automated `NoCrawl` flag suppresses Microsoft 365 Copilot indexing. | **COMPLIANT** (Information Barrier) |
| **Concurrency & Integrity** | Optimistic locking via `Modified` timestamps on all entity updates. | **COMPLIANT** (Data Integrity Assured) |
| **Licensing Mechanism** | Air-gapped offline ECDSA P-256 public key verification. | **COMPLIANT** (Zero Telemetry) |
| **Exit Strategy / Lockout** | Full read-only access and Excel/PDF/PPTX export permanently available. | **COMPLIANT** (Zero Vendor Lock-in) |
