# PPM Compass 360 for Microsoft 365

> **Lightweight, 100% In-Tenant Project Portfolio Management (PPM) for Microsoft SharePoint Online.**

## Overview

**PPM Compass 360** is a native SharePoint Framework (SPFx) application engineered to provide pragmatic project portfolio governance without the heavy administrative overhead of traditional enterprise PPM suites or the recurring per-user licensing fees of Microsoft Power Apps.

- **Zero Data Egress:** 100% in-tenant execution. All data lives in standard SharePoint lists under your Microsoft 365 tenant boundary.
- **Zero "Member" Access Architecture:** All regular users stay in the read-only Visitors group. The built-in Admin Settings page breaks list permission inheritance to grant role-based write permissions dynamically, and hides underlying lists to prevent tampering.
- **Predictable Licensing:** Flat annual per-site collection licensing with unlimited users.

## Repository Contents

- `ppm-compass-360.sppkg`: The production-ready SharePoint Framework solution package for App Catalog deployment.
- `website/`: Complete marketing website, interactive clickable web part demo, ROI savings calculator, and Microsoft Marketplace compliance pages (`privacy.html`, `terms.html`, `support.html`).

## Live Website & GitHub Pages Deployment

This repository is pre-configured for **GitHub Pages**:
1. In your GitHub repository, go to **Settings > Pages**.
2. Under **Build and deployment > Branch**, select `main` (or `master`) and folder `/(root)`.
3. Click **Save**. Your site will be live within seconds!

## Contact & Support

- Technical Support: [support@ceohub.app](mailto:support@ceohub.app)
- Commercial Inquiries: [assistant@ceohub.app](mailto:assistant@ceohub.app)
