# PPM Compass 360 for Microsoft 365

> **Lightweight, 100% In-Tenant Project Portfolio Management (PPM) for Microsoft SharePoint Online.**

## Overview

**PPM Compass 360** is a native SharePoint Framework (SPFx) application engineered to provide pragmatic project portfolio governance without the heavy administrative overhead of traditional enterprise PPM suites or the recurring per-user licensing fees of Microsoft Power Apps.

- **Zero Data Egress:** 100% in-tenant execution. All data lives in standard SharePoint lists under your Microsoft 365 tenant boundary.
- **Zero "Member" Access Architecture:** All regular users stay in the read-only Visitors group. The built-in Admin Settings page breaks list permission inheritance to grant role-based write permissions dynamically, and hides underlying lists to prevent tampering.
- **Predictable Licensing:** Flat annual per-site collection licensing with unlimited users.

## Repository Contents & Clean URL Architecture

- `/`: Root marketing portal (`index.html`), and global assets (`css/`, `js/`, `images/`).
- `/demo/`: Full-page standalone interactive live demo simulation.
- `/products/`: Dedicated product specifications (`/products/ppm-compass-360/`).
- `/who-is-this-for/`: Honest product positioning and audience guide for PMO leaders, IT directors, and growing SMEs (graduating from Excel).
- `/pricing/`: Transparent site collection licensing, 30-day evaluation trial, and Power Apps ROI calculator.
- `/partners/`: Consulting and implementation partner program hub.
- `/support/`: Technical desk, step-by-step SPFx deployment guide, and security FAQ.
- `/privacy/` & `/terms/`: AppSource and enterprise legal compliance.

## Live Website & GitHub Pages Deployment

This repository is pre-configured for **GitHub Pages** with clean, extensionless URLs:
1. In your GitHub repository, go to **Settings > Pages**.
2. Under **Build and deployment > Branch**, select `main` (or `master`) and folder `/(root)`.
3. Custom domain is bound via `CNAME` (`ppmcompass.com`). Zero redirect hops; root serves directly!

## Website & Contact

- Official Website: [https://ppmcompass.com](https://ppmcompass.com)
- Technical Support: [support@ppmcompass.com](mailto:support@ppmcompass.com)
- Consulting & Partner Desk: [partner@ppmcompass.com](mailto:partner@ppmcompass.com)
- Commercial Inquiries: [contact@ppmcompass.com](mailto:contact@ppmcompass.com)
