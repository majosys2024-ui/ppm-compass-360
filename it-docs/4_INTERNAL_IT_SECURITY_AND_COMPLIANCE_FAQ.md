# Portfolio365 — Internal IT Security & Compliance FAQ

**Document Classification:** Enterprise IT Security Clearance & Vendor Risk Assessment  
**Product Reference (Internal):** Portfolio365  
**Package Artifact:** `ppm-compass-360.sppkg` (`ppm-portfolio-management`)  
**Version:** `1.0.1.12`  
**Target Audience:** Chief Information Security Officers (CISOs), InfoSec Auditors, Enterprise Architects, SharePoint Online Administrators, Compliance & Privacy Officers  
**Framework Alignment:** Aligned with Cloud Security Alliance (CSA) CAIQ, ISO/IEC 27001 Annex A, and Microsoft 365 Shared Responsibility Model  

---

## Domain 1: System Architecture & Data Residency

### Q1: Where does customer data reside when using Portfolio365?
**Answer:** 100% of all customer data resides directly within the customer's own Microsoft 365 tenant, specifically inside standard SharePoint Online lists on the designated host site collection (e.g., `https://<company>.sharepoint.com/sites/ppm`). No data is ever stored on vendor infrastructure or third-party cloud environments.

### Q2: Are there any backend servers, microservices, or cloud databases hosted by the vendor?
**Answer:** No. Portfolio365 is a single-tier, purely client-side SharePoint Framework (SPFx) web part. There are no vendor-hosted application servers, backend databases, API gateways, or container services. When a user closes their browser tab, zero software processes continue to run.

### Q3: Does the developer or vendor have access to customer data or the SharePoint environment?
**Answer:** No. The vendor possesses zero access to the customer's Microsoft 365 environment, SharePoint site collection, or data. The application requires no vendor accounts, shared secrets, or external monitoring credentials.

### Q4: What happens to customer data if the vendor dissolves or ceases development?
**Answer:** The customer experiences zero operational disruption. Because the application runs entirely client-side and persistent data is stored in standard SharePoint Online lists, the software continues operating normally. Furthermore, customers retain full ownership of their data and can access or export it at any time via native SharePoint interfaces or standard Microsoft 365 tools (Power BI, Excel, PowerShell).

### Q5: Does Portfolio365 introduce any multi-tenant data co-mingling risks?
**Answer:** No. Portfolio365 is inherently single-tenant because it is deployed directly into the customer's dedicated Microsoft 365 tenant. It does not interface with any shared or multi-tenant database.

---

## Domain 2: Network, Connectivity & Data Egress

### Q6: What outbound network connections does Portfolio365 make?
**Answer:** Zero. The application makes zero outbound network requests to the public internet. All network communication consists exclusively of browser-level HTTPS calls to the host SharePoint Online REST API (`/_api/web/...`) within the customer's authenticated domain (`*.sharepoint.com`).

### Q7: Does the application require any firewall or proxy rule exceptions?
**Answer:** No. Portfolio365 requires no new firewall rules, proxy whitelisting, or open inbound/outbound ports. It operates strictly across the standard HTTPS (Port 443) channels already approved for Microsoft 365 traffic.

### Q8: Are external Content Delivery Networks (CDNs) or third-party scripts loaded at runtime?
**Answer:** No. As declared in `WebPart.xml`, all JavaScript, CSS, and localization assets are hosted internally in the customer's own SharePoint App Catalog (`HTTPS://SPCLIENTSIDEASSETLIBRARY/`). The application does not load scripts from unvetted public CDNs (such as unpkg, cdnjs, or Google Fonts).

### Q9: Does Portfolio365 collect application telemetry, error reports, or usage analytics?
**Answer:** No. Portfolio365 contains zero analytics trackers, telemetry beacons, crash reporters, or tracking cookies (e.g., no Google Analytics, Segment, Mixpanel, Sentry, or Application Insights). All diagnostic messages remain local to the user's browser developer console or in-app diagnostic panels.

### Q10: Does the application establish WebSockets, WebRTC, or background polling channels?
**Answer:** No. The web part operates strictly via stateless, on-demand REST calls initiated by user interaction. No persistent WebSockets, peer-to-peer WebRTC connections, or background daemon threads are utilized.

---

## Domain 3: Authentication, Authorization & Access Governance

### Q11: How are users authenticated, and how does the application handle credentials?
**Answer:** Authentication is handled entirely by Microsoft Entra ID (Azure AD). Portfolio365 does not collect, store, transmit, or process user credentials, passwords, or tokens. The web part inherits the authenticated browser session via SharePoint Online SSO, fully enforcing corporate Multi-Factor Authentication (MFA) and Conditional Access policies.

### Q12: Does the application require Azure AD App Registrations or elevated Graph API permissions?
**Answer:** No. In `AppManifest.xml`, the `<WebApiPermissionRequests>` element is empty. Portfolio365 demands zero application registrations, zero client secrets, and zero delegated permissions to Microsoft Graph, Exchange Online, or Azure.

### Q13: What is the "Zero Member Access" permission model?
**Answer:** Under standard SharePoint administration, regular users in the "Members" group possess broad site edit rights, creating risks of accidental page, library, or configuration list deletion. Portfolio365 implements a Zero Member Access architecture:
1. 100% of regular business users (Project Managers, Team Members, Executives) are placed in the read-only **Site Visitors** group.
2. The built-in **Site Owner Tools** automate broken role inheritance on operational lists (`PPM_APP_*`), granting Visitors scoped Contribute rights to project items.
3. System configuration lists (`PPM_CFG_*`) retain strict inherited read-only permissions for non-administrators, preventing unauthorized system changes.

### Q14: Can a regular user bypass permissions using browser developer tools?
**Answer:** No. All security boundaries are enforced server-side by SharePoint Online's native Access Control Lists (ACLs). Even if a user attempts to dispatch arbitrary REST requests via the browser console, SharePoint Online evaluates the user's permissions and rejects unauthorized writes with an HTTP 403 Forbidden response.

### Q15: How does the "View as Visitor" role switcher work?
**Answer:** The "View as" feature is an in-memory client-side preview tool designed for Site Owners to verify what restricted visitors see. It operates strictly within the browser's React state. If a Site Owner in "View as" mode attempts to perform a write, the UI safely no-ops and displays an informational reminder. It does not alter server permissions.

---

## Domain 4: Data Protection, M365 Copilot & Governance

### Q16: How is data encrypted in transit and at rest?
**Answer:**
- **In Transit:** All communications between the user's browser and SharePoint Online are encrypted using TLS 1.3/1.2 with enterprise-grade cipher suites managed by Microsoft 365.
- **At Rest:** All project data stored in SharePoint Online lists is protected by Microsoft 365 native encryption, including BitLocker, per-file encryption (FIPS 140-2 validated), and customer-managed keys (Customer Key / BYOK) if enabled in the tenant.

### Q17: How does Portfolio365 protect sensitive project data from Microsoft 365 Copilot and enterprise search crawling?
**Answer:** Through the automated **`applySearchHidden`** utility in Site Owner Tools, the application sets the native SharePoint `NoCrawl = true` and `Hidden = true` attributes on all portfolio lists. This instructs Microsoft Search and Microsoft 365 Copilot's semantic indexers to exclude project narratives, risk descriptions, and budgets from organization-wide search queries and AI summaries.

### Q18: How does the application prevent accidental data overwrite during concurrent editing?
**Answer:** Portfolio365 implements strict Optimistic Concurrency Control. Before committing an edit to a Project, Milestone, Risk, Change Request, or Status Report, the web part checks the item's server-side `Modified` timestamp against the timestamp retrieved when the form was opened. If another user committed an edit in the interim, the update is blocked, and the user is presented with a non-destructive conflict notification with an option to reload.

### Q19: How does the application safeguard tenant storage quotas from version history bloat?
**Answer:** The automated workspace provisioning engine (`PpmProvisioningService`) configures a strict retention cap of **`MajorVersionLimit: 100`** on all operational lists (and **`300`** on `PPM_APP_Projects`). This ensures an extensive audit trail while preventing uncontrolled storage consumption.

### Q20: How does Portfolio365 handle the SharePoint 5,000 List View Threshold?
**Answer:** Portfolio365 is immune to 5,000-item threshold failures through three architectural controls:
1. All filtered and sorted columns (`ProjectId`, `Status`, `ReportingMonth`, etc.) are automatically indexed during provisioning.
2. The query engine builds positive, index-seekable OData clauses (`buildPositiveStatusFilter`) using `eq` and `or` expressions, avoiding non-seekable negative operators (`ne`).
3. Large record sets utilize monotonic `Id gt {lastId}` cursor pagination rather than offset paging.

---

## Domain 5: Operational Lifecycle, Licensing & Disaster Recovery

### Q21: How does licensing verification function without connecting to external servers?
**Answer:** Portfolio365 utilizes an offline, asymmetric cryptographic licensing engine. A license token contains a signed payload (Tenant ID, Site ID, Tier, Expiration Date) digitally signed using the vendor's private key. The web part validates the digital signature client-side using a compiled ECDSA P-256 public key via the standard W3C Web Cryptography API (`crypto.subtle.verify`). The process is 100% offline and requires zero network calls.

### Q22: What happens if a license token expires? Is there a data lockout risk?
**Answer:** No. Portfolio365 enforces an ethical **Zero Data Lockout Guarantee**:
- If a license expires, write actions (creating, editing, deleting) are gated (`writeBlocked = true`).
- **All read-only navigation, dashboards, analytics, and data export features (Excel `.xlsx`, PDF, PowerPoint `.pptx`) remain 100% unlocked and operational indefinitely.** Customers can always view, analyze, and export their data.

### Q23: How are file exports (Excel, PDF, PowerPoint) generated?
**Answer:** All exports are compiled entirely inside the browser's JavaScript memory using trusted open-source libraries (`xlsx`, `jspdf`, `pptxgenjs`). Once compiled into a binary `Blob`, the browser downloads the file directly to the user's local disk via `URL.createObjectURL()`. No document data is ever sent to an external server or cloud conversion service.

### Q24: How does disaster recovery, backup, and restore work?
**Answer:** Because all data is stored natively in SharePoint Online, Portfolio365 integrates seamlessly with existing enterprise backup procedures:
- Accidental list deletions are restorable from the SharePoint Site Collection Recycle Bin or Second-Stage Recycle Bin.
- Data is covered by enterprise Microsoft 365 backup solutions (e.g., Veeam, Commvault, Microsoft 365 Backup).
- The in-app health check can automatically repair schema drift or missing columns via idempotent provisioning without affecting existing records.

### Q25: How is the application upgraded or rolled back?
**Answer:**
- **Upgrade:** An administrator uploads the new `.sppkg` file to the tenant SharePoint App Catalog. The web part automatically updates for all users on subsequent page loads. No per-site installation or end-user action is required.
- **Rollback:** To roll back, an administrator simply uploads the previous `.sppkg` version to the App Catalog. The rollback takes effect immediately upon page refresh with zero impact on underlying SharePoint list data.

### Q26: How do the 3×3 Risk Matrix, the dedicated "My Portfolio" page, and the direct Share Link operate from an IT perspective?
**Answer:**
- **3×3 Risk Matrix:** Operates 100% in-browser via pure mathematical layout algorithms (`riskMatrixLayout.ts`). It uses the existing SharePoint Choice fields (`Likelihood` and `Impact`), requiring zero schema changes. At the project level, it computes directly from in-memory risk records without dispatching any additional HTTP calls. At the portfolio level, it leverages existing index-seekable OData queries compliant with the 5,000 List View Threshold.
- **"My Portfolio" KPI Dashboard:** Reuses the existing Portfolio Ownership governance model (`PPM_CFG_Portfolios`). It requires no new permission structures or elevated roles. The 5 interactive KPI tiles and drill-down panels are computed entirely client-side using existing cached or portfolio-scoped queries.
- **Project Detail Share Link:** Generates an in-browser deep-link URL (`?project=<Nr>&tab=<tab>`) and copies it to the user clipboard via the native W3C `navigator.clipboard` API. It does not contact external URL shorteners, tracking links, or redirection servers.

