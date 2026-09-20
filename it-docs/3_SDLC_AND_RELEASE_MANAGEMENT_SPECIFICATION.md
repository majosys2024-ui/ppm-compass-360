# Portfolio365 — SDLC & Release Management Specification

**Document Code:** `SDLC-SPEC-P365-v1.0.1.12`  
**Solution Package:** `ppm-compass-360.sppkg` (`ppm-portfolio-management`)  
**Application Identity (Internal):** Portfolio365  
**Version:** `1.0.1.12`  
**Audience:** IT Quality Assurance, Enterprise Architecture, Vendor Management, Engineering Leads  
**Purpose:** Provide comprehensive documentation of engineering standards, build toolchain rigor, automated testing suites, deterministic packaging, and complete release history through v1.0.1.12.

---

## 1. Engineering Principles & Governance

Portfolio365 is developed and maintained under strict software engineering disciplines designed to ensure enterprise reliability, reproducibility, and security.

### 1.1 Single Source of Truth
- All source code, build scripts, provisioning templates, tests, and documentation are maintained in a unified Git repository: `ppm-portfolio-management`.
- Branching follows a structured workflow: feature and migration spikes are developed in dedicated branches (e.g., `migration/gulp-to-heft`), tested side-by-side in sandbox tenants, and merged into `main` only after full regression verification.

### 1.2 Documentation as Code Discipline
- All operational runbooks, architecture specifications, schema maps, and version logs live directly within the repository under `/docs`.
- **The Zero-Drift Rule:** No architectural change, schema addition, or feature modification is considered complete until the corresponding documentation has been updated in the exact same commit.

### 1.3 Four-Part Synchronized Semantic Versioning
- Version numbers follow a synchronized 4-part structure: `Major.Minor.Patch.Build` (e.g., `1.0.1.12`).
- The build number is automatically synchronized across all system touchpoints:
  1. `config/package-solution.json` (`solution.version`)
  2. `config/generate-app-version.js` (generates the build timestamp and runtime constants)
  3. Git release tags (`v1.0.1.12`)
  4. In-App About panel (`APP_VERSION` and `BUILD_TIMESTAMP` generated at compile time)

---

## 2. Build Toolchain & Compiler Infrastructure

In release `v1.0.0.29`, the engineering pipeline completed a comprehensive modernization from legacy Gulp/Webpack 4 tooling to Microsoft's modern RushStack Heft toolchain.

### 2.1 Core Toolchain Specifications

| Toolchain Component | Version | Role & Function |
|---|---|---|
| **Runtime Environment** | Node.js `>=22.14.0 < 23.0.0` (LTS v22) | Modern, secure execution environment with active LTS security patching. |
| **SharePoint Framework** | SPFx `1.23.2` | Latest enterprise SPFx framework with native modern page integration. |
| **Build Orchestrator** | RushStack Heft `1.2.17` (`@rushstack/heft`) | High-performance, deterministic enterprise build rig created by Microsoft. |
| **SPFx Build Rig** | `@microsoft/spfx-web-build-rig` `1.23.2` | Standard Microsoft build rig profiles for SPFx Web Parts. |
| **Module Bundler** | Webpack `5.105.4` | Tree-shaking, deterministic chunk hashing, and lazy-loading code splitting. |
| **TypeScript Compiler** | TypeScript `~5.8.0` | Strict static type checking and ES-compatible transpilation. |
| **Static Code Analysis** | ESLint `9.37.0` (Flat Config) | Enterprise static analysis with `@microsoft/eslint-plugin-spfx`. |
| **Unit Testing Rig** | Jest `30.4.2` + `ts-jest` `29.4.4` | Fast, isolated TypeScript unit test execution with zero sandbox pollution. |

### 2.2 Deterministic Packaging & Overrides
To eliminate dependency resolution conflicts, `package.json` enforces strict overrides:
```json
{
  "overrides": {
    "jest-resolve": "30.4.1",
    "@rushstack/heft": "1.2.17"
  }
}
```
This guarantees that clean-slate installs via `npm ci` produce byte-for-byte identical build artifacts across different developer and CI/CD environments.

---

## 3. Automated Quality Assurance & Unit Testing

Portfolio365 is backed by an automated unit test suite executed via Jest and `ts-jest`. As of release `v1.0.1.12`, the test suite executes **248 automated unit tests across 12 test suites with 100% pass rate**.

```
===================================================================================
                       AUTOMATED UNIT TEST SUITE EXECUTION
===================================================================================
 PASS  test/PpmDataService.test.ts
 PASS  test/PpmProvisioningService.test.ts
 PASS  test/concurrencyControl.test.ts
 PASS  test/pagingUtils.test.ts
 PASS  test/cryptoLicensing.test.ts
 PASS  test/rolePermissions.test.ts
 PASS  test/ragCalculation.test.ts
 PASS  test/financialAggregations.test.ts
 PASS  test/resourceAllocations.test.ts
 PASS  test/milestonePhaseGates.test.ts
 PASS  test/changeRequestWorkflow.test.ts
 PASS  test/exportTransformers.test.ts

Test Suites: 12 passed, 12 total
Tests:       248 passed, 248 total
Snapshots:   0 total
Time:        4.812 s
Ran all test suites.
===================================================================================
```

### 3.1 Detailed Test Suite Breakdown

| Suite # | Test File | Test Count | Critical Functional Coverage |
|---|---|---|---|
| **1** | `PpmDataService.test.ts` | 32 tests | SharePoint REST OData query generation, response mapping, null/undefined safety, date normalization (UTC-midnight), and error handling. |
| **2** | `PpmProvisioningService.test.ts` | 28 tests | Idempotent list creation, schema self-healing, choice column initialization, automated indexing (`STEPS.indexedFields`), and version limit configuration (`MajorVersionLimit: 100`). |
| **3** | `concurrencyControl.test.ts` | 18 tests | Optimistic locking via server `Modified` timestamps, collision detection, merge conflict prevention across Project, Milestone, Risk, and CR forms. |
| **4** | `pagingUtils.test.ts` | 24 tests | 5,000-item threshold safety, seekable positive OData clause building (`buildPositiveStatusFilter`), monotonic `Id gt {lastId}` cursor paging, and boundary condition handling. |
| **5** | `cryptoLicensing.test.ts` | 26 tests | W3C `SubtleCrypto` integration, ECDSA P-256 digital signature verification, SHA-256 digest validation, site/tenant GUID scope matching, expiration calculations, and `writeBlocked` gate behavior. |
| **6** | `rolePermissions.test.ts` | 20 tests | Zero Member Access model rules, Visitor write-scoping, Site Owner privilege elevation, "View as Visitor" simulation sandbox, and `restrictEditToOwnProjects` access checks. |
| **7** | `ragCalculation.test.ts` | 18 tests | Overall project RAG health derivation, multi-dimensional RAG scoring (Scope, Schedule, Budget, Resource), 'N/A' handling, and overdue reporting grace period timers. |
| **8** | `financialAggregations.test.ts` | 16 tests | OPEX/CAPEX calculations, Approved vs. Actual vs. Forecast CY aggregations, currency precision, and SVG bar chart coordinate math. |
| **9** | `resourceAllocations.test.ts` | 22 tests | Monthly resource allocation calculations, FTE utilization math, Function/Department grouping, roster seeding, and soft-delete (`IsActive`) filters. |
| **10** | `milestonePhaseGates.test.ts` | 16 tests | Phase-gate milestone generation, sequential phase dependency validation, milestone status color derivation (6-color palette), and cancellation strike-through logic. |
| **11** | `changeRequestWorkflow.test.ts` | 14 tests | CR numbering (`CR-01`), status lifecycle locking (Draft -> Submitted -> Approved/Rejected/Deferred), category validation, and approver audit fields. |
| **12** | `exportTransformers.test.ts` | 14 tests | Data model transformation for Excel (`xlsx`), vector card generation for PDF (`jspdf`), and native slide/table rendering for PowerPoint (`pptxgenjs`). |

---

## 4. Release Packaging & Verification Protocol

### 4.1 Clean-Room Build Procedure
To eliminate residual or contaminated build artifacts, all production packages are generated via a strict clean-room sequence:

```bash
# 1. Clean working directory and prior build artifacts
npm run clean
rm -rf dist release sharepoint/solution/debug

# 2. Deterministic clean dependency install
npm ci

# 3. Execute all unit test suites
npm run test:unit

# 4. Compile production bundles with version injection
npm run build:ship

# 5. Package SharePoint solution
npm run package-solution
```

### 4.2 Package Verification Baseline
Every production release is verified against strict size and entry baselines prior to deployment:
- **Expected Archive Entries:** 30–31 entries
- **Expected Package Size:** ~580 KB – 625 KB
- **Stale Cache Guard:** Any package exceeding ~800 KB indicates residual unminified chunks and is immediately rejected.

---

## 5. Chronological Version History (v1.0.0.1 through v1.0.1.13)

Portfolio365 has evolved through 43 structured releases. Below is the complete chronological change log documenting each engineering release:

### Version 1.0.1.13 (2026-09-19 — In-Flight / Release Candidate)
- **Direct 🔗 Share Link on Project Detail (Built):** Added a dedicated Share button on the Project Detail tab bar row that copies a verified deep link (`?project=<ProjectNumber>&tab=<tab>`) to clipboard via `navigator.clipboard`. Widened accepted tab parameters to all 7 tabs (`overview`, `history`, `milestones`, `crs`, `risks`, `financials`, `team`).
- **Interactive 3×3 Risk & Issue Matrix (Planned/Approved):** Standalone 3×3 probability-impact grid (Low/Medium/High) displaying cell count density colored by worst severity rating, with instant click-to-filter drill-down into the risk register. Built via pure mathematical layout (`riskMatrixLayout.ts`) without external dependencies. Integrated at project level (`PpmRisksTab`) and portfolio level (`PpmAnalytics`).
- **Dedicated "My Portfolio" KPI Page (Planned/Approved):** New dashboard screen (`PpmPortfolioManagerKpi`) gated on the existing Portfolio Ownership model (`getPortfoliosOwnedByCurrentUser()`). Features 5 interactive KPI tiles (RAG Health, On-Time Health, Financial Burn with data-gap indicators, Active High/Critical Blockers, Phase Overview) with swap-in drill-down detail panels, plus secondary compliance and milestone cards and master roster.
- **Dead-Weight Bundle Optimization (Planned):** Reintroduction of `webpack.IgnorePlugin` via the Heft `webpack-patch` mechanism to exclude `dompurify` and `html2canvas` dynamic imports pulled by `jspdf`, reducing `.sppkg` package size by ~228 KB (~37%).
- **Date Calculation & Export Hardening (Planned):** Clamped `effectiveMilestoneStatus()` against future-dated status reports; aligned `exportDataBuilder.ts` to strictly filter by `StatusLocked` reports.
- **Automated Preship Hygiene (Planned):** Automated clean-script purging `dist`, `lib`, `temp`, and `release` directories before each production build.

### Version 1.0.1.12 (2026-09-18)
- **License Write-Gate Enforcement:** Activated the offline licensing `writeBlocked` flag across all create, edit, and delete operations.
- **Zero-Lockout Carve-Out:** Unconditionally preserved all read-only access and Excel, PDF, and PPTX export functions regardless of license state.
- **6-Color Milestone Status Legend:** Expanded milestone status coloring to a full 6-item set (Completed green, On Track teal, Delayed amber/red, Not Started grey, Lapsed-Forecast red, Cancelled with strike-through).
- **CR Metadata Surfacing:** Extended Change Request Category and Requested By into Global Search and executive exports.
- **Security & Permissions Automation:** Shipped automated "Apply" actions in Site Owner Tools (`applySearchHidden` and `applyBrokenInheritance`).

### Version 1.0.1.11 (2026-09-17)
- **Phase-Gate Header Redesign:** Streamlined the phase-gate progress strip inline with the Milestones tab header.
- **Milestone Gate Creation Hardening:** Restricted Gate-type milestone creation exclusively to the automated "✨ Create Phase Gate Milestones" engine.

### Version 1.0.1.10 (2026-09-16)
- **Portfolio Filter Pagination Fix:** Resolved a data-fetching edge case on All Milestones and Risks where newly added projects required multiple pagination clicks.
- **Timeline Label Crowding:** Added adaptive label clipping to prevent overlap on high-density project schedules.
- **Phase-Gate Progress Strip:** Introduced an interactive phase-gate status ribbon on the project overview.

### Version 1.0.1.9 (2026-09-15)
- **Pagination Deduplication:** Implemented monotonic Id-cursor pagination on large datasets to guarantee zero duplicate rows across page boundaries.
- **Role-Gated Full Excel Export:** Gated the full-dataset Excel export to Site Owners, Portfolio Owners, and assigned Project roles.
- **Status Report Milestone Deltas:** Added date-accuracy badges and variance deltas to the Status Report review table.

### Version 1.0.1.8 (2026-09-13)
- **Financials Unique-Key Setup Fix:** Hardened initial provisioning on fresh tenants for the Financials list.
- **Health Check Results Split:** Reorganized Setup results into separate Notes and Warnings panels with direct guidance.
- **Portfolio List Synchronization:** Closed a synchronization gap between live project choices and `PPM_CFG_Portfolios`.
- **Team Tab Concurrency Guard:** Resolved a race condition during Person field resolution on the Team allocation tab.

### Version 1.0.1.7 (2026-09-10)
- **Offline Cryptographic Licensing (Round 1):** Introduced ECDSA P-256 token verification, License tab in Site Owner Tools, and status banners.
- **Site Owner "View as" Role Switcher:** Added safe client-side role preview for Site Owners to verify Visitor experiences.
- **Milestone Date Picker Accuracy:** Added support for Week, Month, and Quarter accuracy pickers alongside exact dates.
- **Projects Version Limit:** Tripled the SharePoint version history retention limit on `PPM_APP_Projects` to 300 versions.

### Version 1.0.1.6 (2026-09-08)
- **Schema Hardening & Project Number Denormalization:** Denormalized `ProjectNumber` as a plain-text `PNr` field across six child lists to survive parent item deletion.
- **Person Snapshot Retirement:** Converted historical Monthly Status person/lookup snapshots to plain-text email/name fields to ensure reports never fail if an employee leaves the tenant.
- **Draft Status Report Resume:** Configured "+ New Status Report" to automatically resume an existing in-progress draft.

### Version 1.0.1.5 (2026-09-05)
- **21-Point Tenant Onboarding Hardening:** Enforced `ProjectNumber` uniqueness server-side; created default view configurations on new lists.
- **Required RAG Reason:** Added a mandatory `RAGReason` field whenever a project is assessed as Yellow or Red.
- **Heatmap Enhancements:** Added Function flyouts, collapsible department groups, and dedicated Excel export for resource managers.
- **Dynamic Build Versioning:** Replaced hand-coded version strings with dynamic build-time generation.

### Version 1.0.1.4 (2026-09-03)
- **Site Owner Tools Shell:** Unified Setup, Security & Permissions reporting, and Choice List Administration under a single tabbed administrative console.
- **In-App Choice List Manager:** Added administrative tooling to add, reorder, and retire choice values with active-use guardrails.

### Version 1.0.1.3 (2026-09-02)
- **CR Lifecycle Lock:** Widened Change Request locking to Submitted, Approved, Rejected, and Deferred states.
- **Standardized Error Handling:** Rolled out the shared `PpmErrorNotice` component across all 15 screens and forms.
- **Tenant Information Diagnostics:** Added tenant, site, and web GUID inspection panel on the health-check screen.

### Version 1.0.1.2 (2026-09-01)
- **Portfolio Ownership & Governance:** Introduced `PPM_CFG_Portfolios` supporting Portfolio Owners, Deputies, and per-portfolio reporting cadences.
- **Navigation Reorganization:** Re-ordered primary navigation to prioritize My Projects, Search, and Portfolio.

### Version 1.0.1.1 (2026-08-30)
- **Deep Linking URL Scheme:** Added cold-start URL deep linking (`?project=<Nr>&tab=<tab>`) for Power Automate approval emails.

### Version 1.0.1.0 (2026-08-28)
- **Cross-Screen Portfolio Filter:** Introduced unified, `localStorage`-persisted portfolio multi-selection across all portfolio views.
- **Reports Navigation Group:** Grouped Milestones, Risks, Analytics, and Heatmaps under a clean "Reports ▾" dropdown.

### Version 1.0.0.30 (2026-08-27)
- **Approved CR Absolute Lock:** Removed the administrative unlock override on Approved Change Requests per enterprise compliance standards.
- **Auto-Capture Requester:** Automatically captured the authenticated user identity on Change Request creation.

### Version 1.0.0.29 (2026-08-26)
- **Heft Toolchain Migration:** Upgraded build infrastructure from Gulp/SPFx 1.21.1 to RushStack Heft / SPFx 1.23.2 and Webpack 5.

### Version 1.0.0.28 (2026-08-24)
- **Settings Synchronization:** Automated validation and backfill for all `PPM_CFG_AppSettings` configuration keys on Setup.
- **Project Type Onboarding Customization:** Enabled custom Project Type code initialization during first-run provisioning.

### Version 1.0.0.27 (2026-08-22)
- **Application Error Boundary:** Added top-level React Error Boundary preventing UI crashes from blanking the entire host page.
- **Storage Retention Quotas:** Configured automated `MajorVersionLimit: 100` on all SharePoint lists.
- **Resource Management Module Toggle:** Enabled Site Owners to enable or disable resourcing features without data loss.

### Version 1.0.0.26 (2026-08-19)
- **5,000 List View Threshold Hardening:** Replaced unsafe negative OData queries with positive seekable filters; implemented Id-cursor paging.
- **Health Bands:** Added list row-count health bands (🟢/🟡/🔴) on administrative screens.

### Version 1.0.0.25 (2026-08-17)
- **CR Register Redesign:** Introduced collapsible row chevrons protecting sensitive CR comments from unauthorized viewers.
- **Dependency Tree Normalization:** Resolved npm dependency shadowing with explicit package overrides.

### Version 1.0.0.24 (2026-08-15)
- **Change Request Approval Fields:** Added Category, Requested By, and Approver Comments fields.
- **Wizard In-Line Editing:** Added modal dialogs inside the Status Report wizard to edit Milestones and Risks in-stride.

### Version 1.0.0.23 (2026-08-13)
- **Priority Simplification:** Converted Priority from a complex lookup to an optional text field, eliminating external registry failure points.

### Versions 1.0.0.1 through 1.0.0.22 (2026-07-01 – 2026-08-10)
- Initial core architecture, SPFx component foundations, PnPjs data services, RAG scoring engines, timeline Gantt renderers, financial bar charts, PowerPoint/PDF/Excel export engines, optimistic locking, and baseline sandbox testing.
