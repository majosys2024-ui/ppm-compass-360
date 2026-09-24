/* PPM Compass 360 -- website demo data (mock). Edit freely; the demo reads window.PPM_DEMO_DATA. */
window.PPM_DEMO_DATA = {
 "today": "2026-09-24",
 "appName": "PPM Compass 360",
 "tenant": "Contoso Global",
 "sitePath": "PMO Hub › Project Portfolio Management",
 "currentUser": {
  "name": "Sarah Jenkins",
  "initials": "SJ",
  "role": "PMO Lead"
 },
 "portfolios": [
  "IT & Infrastructure",
  "Operations & Supply Chain",
  "Product Engineering",
  "Customer & Digital",
  "Finance & Corporate"
 ],
 "months": [
  "Oct 2026",
  "Nov 2026",
  "Dec 2026",
  "Jan 2027",
  "Feb 2027",
  "Mar 2027"
 ],
 "projects": [
  {
   "id": 1,
   "number": "PPM-101",
   "name": "PPM Compass 360 — IT Portfolio Rollout",
   "type": "ORG",
   "portfolio": "IT & Infrastructure",
   "status": "Running",
   "phase": "Execution",
   "phases": [
    "Idea",
    "Planning",
    "Execution",
    "Closing"
   ],
   "priority": "Critical",
   "lead": "Sarah Jenkins",
   "sponsor": "David Vance",
   "sponsorTitle": "VP Technology & Risk",
   "deputy": "Devon Clark",
   "start": "2026-03-02",
   "end": "2026-12-18",
   "erp": "ORG.2026.100",
   "rag": {
    "overall": "Green",
    "timeline": "Green",
    "budget": "Green",
    "resources": "Green",
    "scope": "Green"
   },
   "ragReason": null,
   "goal": "Replace spreadsheet trackers with one live portfolio view in Microsoft 365, so steering meetings run on the app instead of slides.",
   "scope": "In scope: process design, configuration, data migration, testing, training and hypercare. Out of scope: changes to upstream legacy systems.",
   "success": "Go-live without critical defects; 90% of users trained; benefits tracked monthly in the portfolio review.",
   "achievements": "SharePoint lists provisioned and security reviewed with no open gaps; 11 of 14 IT projects migrated from spreadsheets; first two monthly status cycles completed on time.",
   "nextSteps": "Migrate the last three IT projects, train Project Leaders in the Operations portfolio, and prepare the go/no-go pack for company-wide rollout.",
   "outputPct": 75,
   "engagement": 5,
   "riskExposure": 12600,
   "financials": {
    "opexBudget": 148800,
    "opexActual": 106020,
    "opexPlanYear": 81600,
    "opexActualYtd": 76950,
    "capexBudget": 91200,
    "capexActual": 64980,
    "capexPlanYear": 48000,
    "capexActualYtd": 46170
   },
   "lastFinanceUpdate": "2026-09-15",
   "milestones": [
    {
     "id": "PPM-101-M01",
     "name": "Project kickoff",
     "type": "Kickoff",
     "baseline": "2026-03-21",
     "forecast": "2026-03-21",
     "actual": "2026-03-21",
     "status": "Completed",
     "show": true
    },
    {
     "id": "PPM-101-M02",
     "name": "Business case approval",
     "type": "Approval",
     "baseline": "2026-04-22",
     "forecast": "2026-04-22",
     "actual": "2026-04-22",
     "status": "Completed",
     "show": true
    },
    {
     "id": "PPM-101-M03",
     "name": "Design review",
     "type": "Review",
     "baseline": "2026-05-25",
     "forecast": "2026-05-25",
     "actual": "2026-05-25",
     "status": "Completed",
     "show": false
    },
    {
     "id": "PPM-101-M04",
     "name": "Gate: Execution approval",
     "type": "Gate",
     "baseline": "2026-06-26",
     "forecast": "2026-06-26",
     "actual": "2026-06-26",
     "status": "Completed",
     "show": true
    },
    {
     "id": "PPM-101-M05",
     "name": "Integration build complete",
     "type": "Technical",
     "baseline": "2026-07-28",
     "forecast": "2026-07-28",
     "actual": "2026-07-28",
     "status": "Completed",
     "show": true
    },
    {
     "id": "PPM-101-M06",
     "name": "System test complete",
     "type": "Test",
     "baseline": "2026-08-30",
     "forecast": "2026-08-30",
     "actual": "2026-08-30",
     "status": "Completed",
     "show": false
    },
    {
     "id": "PPM-101-M07",
     "name": "User acceptance testing",
     "type": "UAT",
     "baseline": "2026-10-01",
     "forecast": "2026-10-01",
     "actual": null,
     "status": "On Track",
     "show": true
    },
    {
     "id": "PPM-101-M08",
     "name": "End-user training",
     "type": "Training",
     "baseline": "2026-11-02",
     "forecast": "2026-11-02",
     "actual": null,
     "status": "On Track",
     "show": true
    },
    {
     "id": "PPM-101-M09",
     "name": "Go-live",
     "type": "Go-Live",
     "baseline": "2026-12-05",
     "forecast": "2026-12-05",
     "actual": null,
     "status": "On Track",
     "show": true
    }
   ],
   "risks": [
    {
     "id": "R-001",
     "type": "Risk",
     "description": "Key vendor delivery may slip past the integration test window",
     "category": "Schedule",
     "likelihood": "High",
     "impact": "Medium",
     "rating": "High",
     "status": "Mitigating",
     "owner": "Sarah Jenkins",
     "raised": "2026-03-17",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": 9000
    },
    {
     "id": "R-002",
     "type": "Risk",
     "description": "Only one SME can configure the interfaces; availability is limited in Q4",
     "category": "Resource",
     "likelihood": "High",
     "impact": "Low",
     "rating": "Medium",
     "status": "Open",
     "owner": "Nina Schulz",
     "raised": "2026-04-09",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": 9000
    },
    {
     "id": "R-003",
     "type": "Risk",
     "description": "Legacy data quality may require more cleansing cycles than planned",
     "category": "Technical",
     "likelihood": "Medium",
     "impact": "Medium",
     "rating": "Medium",
     "status": "Resolved",
     "owner": "Felix Braun",
     "raised": "2026-05-02",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": null
    }
   ],
   "changeRequests": [
    {
     "number": "CR-01",
     "date": "2026-04-11",
     "title": "Extend scope to site B warehouse",
     "category": "Scope",
     "impact": "+€45k, +3 weeks",
     "status": "Approved",
     "requestedBy": "David Vance"
    }
   ],
   "decisions": [
    {
     "number": "D-001",
     "date": "2026-03-22",
     "title": "Pilot with one portfolio before company-wide rollout",
     "decidedBy": "Steering Committee",
     "context": "Several options were discussed in the project board.",
     "options": "1) Proceed as planned. 2) Phase the rollout. 3) Defer.",
     "rationale": "Limits support load and gives real usage data before scaling.",
     "linked": "",
     "status": "Recorded"
    },
    {
     "number": "D-002",
     "date": "2026-04-26",
     "title": "Keep all project data inside our Microsoft 365 tenant",
     "decidedBy": "Head of PMO",
     "context": "Several options were discussed in the project board.",
     "options": "1) Proceed as planned. 2) Phase the rollout. 3) Defer.",
     "rationale": "No new vendor database to secure or audit; uses existing SharePoint permissions.",
     "linked": "CR-01",
     "status": "Recorded"
    }
   ],
   "statusHistory": [
    {
     "month": "2026-09",
     "submitted": null,
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 75,
     "engagement": 5
    },
    {
     "month": "2026-08",
     "submitted": "2026-09-04",
     "overall": "Yellow",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 65,
     "engagement": 5
    },
    {
     "month": "2026-07",
     "submitted": "2026-08-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Yellow",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 60,
     "engagement": 4
    },
    {
     "month": "2026-06",
     "submitted": "2026-07-05",
     "overall": "Yellow",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 50,
     "engagement": 5
    },
    {
     "month": "2026-05",
     "submitted": "2026-06-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 45,
     "engagement": 5
    },
    {
     "month": "2026-04",
     "submitted": "2026-05-05",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 35,
     "engagement": 5
    },
    {
     "month": "2026-03",
     "submitted": "2026-04-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 25,
     "engagement": 5
    }
   ],
   "team": [
    {
     "person": "Sarah Jenkins",
     "role": "Project Leader",
     "fte": [
      55,
      40,
      50,
      40,
      55,
      50
     ]
    },
    {
     "person": "Devon Clark",
     "role": "Deputy",
     "fte": [
      25,
      20,
      25,
      10,
      20,
      20
     ]
    },
    {
     "person": "Felix Braun",
     "role": "Architect",
     "fte": [
      40,
      45,
      40,
      40,
      30,
      30
     ]
    },
    {
     "person": "Giorgio Pellegrini",
     "role": "Solution Architect",
     "fte": [
      20,
      20,
      25,
      20,
      20,
      20
     ]
    },
    {
     "person": "James Okafor",
     "role": "QA Lead",
     "fte": [
      20,
      20,
      10,
      10,
      20,
      25
     ]
    }
   ]
  },
  {
   "id": 2,
   "number": "ERP-201",
   "name": "Cloud ERP Migration & Warehouse Inventory Sync",
   "type": "PRO",
   "portfolio": "Operations & Supply Chain",
   "status": "Running",
   "phase": "Execution",
   "phases": [
    "Idea",
    "Concept",
    "Planning",
    "Execution",
    "Launch",
    "Closing"
   ],
   "priority": "Critical",
   "lead": "Devon Clark",
   "sponsor": "Michael Chang",
   "sponsorTitle": "COO",
   "deputy": "Lucia Moreno",
   "start": "2025-11-03",
   "end": "2027-03-31",
   "erp": "PRO.2026.107",
   "rag": {
    "overall": "Yellow",
    "timeline": "Yellow",
    "budget": "Red",
    "resources": "Yellow",
    "scope": "Green"
   },
   "ragReason": "Timeline flagged Yellow: supplier deliveries are two weeks late; recovery plan agreed with the sponsor.",
   "goal": "Move the on-premise ERP to the cloud and synchronise warehouse inventory in real time across three distribution centres.",
   "scope": "In scope: process design, configuration, data migration, testing, training and hypercare. Out of scope: changes to upstream legacy systems.",
   "success": "Go-live without critical defects; 90% of users trained; benefits tracked monthly in the portfolio review.",
   "achievements": "Finance and procurement modules configured; data migration dry-run 2 finished with 99.2% record match; warehouse interface build 80% complete.",
   "nextSteps": "Close the integration test backlog, re-baseline the warehouse cut-over plan with the vendor, and confirm the extra test environment.",
   "outputPct": 50,
   "engagement": 3,
   "riskExposure": 576000,
   "financials": {
    "opexBudget": 1488000,
    "opexActual": 930000,
    "opexPlanYear": 816000,
    "opexActualYtd": 675000,
    "capexBudget": 912000,
    "capexActual": 570000,
    "capexPlanYear": 480000,
    "capexActualYtd": 405000
   },
   "lastFinanceUpdate": "2026-09-15",
   "milestones": [
    {
     "id": "ERP-201-M01",
     "name": "Project kickoff",
     "type": "Kickoff",
     "baseline": "2025-12-07",
     "forecast": "2025-12-07",
     "actual": "2025-12-07",
     "status": "Completed",
     "show": true
    },
    {
     "id": "ERP-201-M02",
     "name": "Business case approval",
     "type": "Approval",
     "baseline": "2026-02-02",
     "forecast": "2026-02-02",
     "actual": "2026-02-02",
     "status": "Completed",
     "show": true
    },
    {
     "id": "ERP-201-M03",
     "name": "Design review",
     "type": "Review",
     "baseline": "2026-03-31",
     "forecast": "2026-03-31",
     "actual": "2026-03-31",
     "status": "Completed",
     "show": false
    },
    {
     "id": "ERP-201-M04",
     "name": "Gate: Planning approval",
     "type": "Gate",
     "baseline": "2026-05-27",
     "forecast": "2026-05-27",
     "actual": "2026-05-27",
     "status": "Completed",
     "show": true
    },
    {
     "id": "ERP-201-M05",
     "name": "Integration build complete",
     "type": "Technical",
     "baseline": "2026-07-23",
     "forecast": "2026-07-23",
     "actual": "2026-07-23",
     "status": "Completed",
     "show": true
    },
    {
     "id": "ERP-201-M06",
     "name": "System test complete",
     "type": "Test",
     "baseline": "2026-09-18",
     "forecast": "2026-09-18",
     "actual": "2026-09-18",
     "status": "Completed",
     "show": false
    },
    {
     "id": "ERP-201-M07",
     "name": "User acceptance testing",
     "type": "UAT",
     "baseline": "2026-11-14",
     "forecast": "2026-11-21",
     "actual": null,
     "status": "At Risk",
     "show": true
    },
    {
     "id": "ERP-201-M08",
     "name": "End-user training",
     "type": "Training",
     "baseline": "2027-01-10",
     "forecast": "2027-01-10",
     "actual": null,
     "status": "On Track",
     "show": true
    },
    {
     "id": "ERP-201-M09",
     "name": "Go-live",
     "type": "Go-Live",
     "baseline": "2027-03-08",
     "forecast": "2027-03-22",
     "actual": null,
     "status": "Delayed",
     "show": true
    }
   ],
   "risks": [
    {
     "id": "R-011",
     "type": "Issue",
     "description": "Licence price increase at renewal could exceed the approved contingency",
     "category": "Financial",
     "likelihood": "Medium",
     "impact": "High",
     "rating": "High",
     "status": "Mitigating",
     "owner": "Lucia Moreno",
     "raised": "2025-11-18",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": 144000
    },
    {
     "id": "R-012",
     "type": "Risk",
     "description": "Hardware lead times for scanners have increased to 14 weeks",
     "category": "Supply Chain",
     "likelihood": "Low",
     "impact": "Low",
     "rating": "Low",
     "status": "Monitoring",
     "owner": "Devon Clark",
     "raised": "2025-12-11",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": 1440000
    },
    {
     "id": "R-013",
     "type": "Risk",
     "description": "Works council consultation may delay the rollout to site B",
     "category": "Other",
     "likelihood": "Low",
     "impact": "Low",
     "rating": "Low",
     "status": "Open",
     "owner": "Nina Schulz",
     "raised": "2026-01-03",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": 1440000
    },
    {
     "id": "R-014",
     "type": "Risk",
     "description": "Performance of the reporting layer not yet proven at full data volume",
     "category": "Technical",
     "likelihood": "Medium",
     "impact": "Medium",
     "rating": "Medium",
     "status": "Open",
     "owner": "Devon Clark",
     "raised": "2026-01-26",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": 360000
    },
    {
     "id": "R-015",
     "type": "Risk",
     "description": "Parallel ERP cut-over competes for the same test environments",
     "category": "Schedule",
     "likelihood": "Medium",
     "impact": "Medium",
     "rating": "Medium",
     "status": "Resolved",
     "owner": "Devon Clark",
     "raised": "2026-02-18",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": null
    }
   ],
   "changeRequests": [
    {
     "number": "CR-01",
     "date": "2025-12-13",
     "title": "Extend scope to site B warehouse",
     "category": "Scope",
     "impact": "+€45k, +3 weeks",
     "status": "Approved",
     "requestedBy": "Michael Chang"
    },
    {
     "number": "CR-02",
     "date": "2026-02-01",
     "title": "Add Power BI executive dashboard",
     "category": "Scope",
     "impact": "+€18k, no schedule impact",
     "status": "Submitted",
     "requestedBy": "Michael Chang"
    }
   ],
   "decisions": [
    {
     "number": "D-001",
     "date": "2025-11-23",
     "title": "Pilot with one portfolio before company-wide rollout",
     "decidedBy": "Steering Committee",
     "context": "Several options were discussed in the project board.",
     "options": "1) Proceed as planned. 2) Phase the rollout. 3) Defer.",
     "rationale": "Limits support load and gives real usage data before scaling.",
     "linked": "",
     "status": "Recorded"
    },
    {
     "number": "D-002",
     "date": "2025-12-28",
     "title": "Keep all project data inside our Microsoft 365 tenant",
     "decidedBy": "Head of PMO",
     "context": "Several options were discussed in the project board.",
     "options": "1) Proceed as planned. 2) Phase the rollout. 3) Defer.",
     "rationale": "No new vendor database to secure or audit; uses existing SharePoint permissions.",
     "linked": "CR-01",
     "status": "Recorded"
    },
    {
     "number": "D-003",
     "date": "2026-02-01",
     "title": "Status reports due by the 5th working day",
     "decidedBy": "Steering Committee",
     "context": "Several options were discussed in the project board.",
     "options": "1) Proceed as planned. 2) Phase the rollout. 3) Defer.",
     "rationale": "Gives Project Leaders month-end close while keeping reviews current.",
     "linked": "",
     "status": "Recorded"
    }
   ],
   "statusHistory": [
    {
     "month": "2026-09",
     "submitted": "2026-09-05",
     "overall": "Yellow",
     "timeline": "Yellow",
     "budget": "Red",
     "resources": "Yellow",
     "scope": "Green",
     "outputPct": 50,
     "engagement": 3
    },
    {
     "month": "2026-08",
     "submitted": "2026-09-04",
     "overall": "Green",
     "timeline": "Yellow",
     "budget": "Red",
     "resources": "Green",
     "scope": "Yellow",
     "outputPct": 45,
     "engagement": 3
    },
    {
     "month": "2026-07",
     "submitted": "2026-08-04",
     "overall": "Yellow",
     "timeline": "Yellow",
     "budget": "Red",
     "resources": "Yellow",
     "scope": "Green",
     "outputPct": 40,
     "engagement": 2
    },
    {
     "month": "2026-06",
     "submitted": "2026-07-05",
     "overall": "Yellow",
     "timeline": "Yellow",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 35,
     "engagement": 2
    },
    {
     "month": "2026-05",
     "submitted": "2026-06-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 30,
     "engagement": 3
    },
    {
     "month": "2026-04",
     "submitted": "2026-05-05",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 25,
     "engagement": 3
    },
    {
     "month": "2026-03",
     "submitted": "2026-04-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 20,
     "engagement": 3
    },
    {
     "month": "2026-02",
     "submitted": "2026-03-07",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 15,
     "engagement": 2
    }
   ],
   "team": [
    {
     "person": "Devon Clark",
     "role": "Project Leader",
     "fte": [
      40,
      65,
      50,
      50,
      50,
      55
     ]
    },
    {
     "person": "Lucia Moreno",
     "role": "Deputy",
     "fte": [
      25,
      20,
      20,
      10,
      20,
      20
     ]
    },
    {
     "person": "Nina Schulz",
     "role": "Business Analyst",
     "fte": [
      0,
      55,
      50,
      10,
      10,
      10
     ]
    },
    {
     "person": "Anna Berg",
     "role": "Test Analyst",
     "fte": [
      10,
      10,
      10,
      10,
      10,
      10
     ]
    },
    {
     "person": "Kenji Sato",
     "role": "Developer",
     "fte": [
      15,
      10,
      10,
      0,
      15,
      15
     ]
    }
   ]
  },
  {
   "id": 3,
   "number": "CRM-202",
   "name": "B2B Customer Portal & Self-Service Order Tracking",
   "type": "PRO",
   "portfolio": "Customer & Digital",
   "status": "Running",
   "phase": "Execution",
   "phases": [
    "Idea",
    "Concept",
    "Planning",
    "Execution",
    "Launch",
    "Closing"
   ],
   "priority": "High",
   "lead": "Amara Diallo",
   "sponsor": "Jessica Miller",
   "sponsorTitle": "Commercial Director",
   "deputy": "Priya Kumar",
   "start": "2026-01-12",
   "end": "2026-11-27",
   "erp": "PRO.2026.114",
   "rag": {
    "overall": "Red",
    "timeline": "Red",
    "budget": "Yellow",
    "resources": "Red",
    "scope": "Yellow"
   },
   "ragReason": "Timeline and resources Red: integration testing blocked by missing test data; escalated to the sponsor for decision on scope split.",
   "goal": "Give B2B customers self-service order tracking and invoice download, cutting inbound service calls by 30%.",
   "scope": "In scope: process design, configuration, data migration, testing, training and hypercare. Out of scope: changes to upstream legacy systems.",
   "success": "Go-live without critical defects; 90% of users trained; benefits tracked monthly in the portfolio review.",
   "achievements": "Portal design approved by the commercial team; order-tracking API connected to the ERP sandbox; 12 pilot customers onboarded to the test site.",
   "nextSteps": "Resolve the test-data blocker with IT, decide on the scope split proposed in CR-02, and restart UAT with the pilot customers.",
   "outputPct": 55,
   "engagement": 2,
   "riskExposure": 283600,
   "financials": {
    "opexBudget": 533200,
    "opexActual": 410440,
    "opexPlanYear": 292400,
    "opexActualYtd": 297900,
    "capexBudget": 326800,
    "capexActual": 251560,
    "capexPlanYear": 172000,
    "capexActualYtd": 178740
   },
   "lastFinanceUpdate": "2026-09-15",
   "milestones": [
    {
     "id": "CRM-202-M01",
     "name": "Project kickoff",
     "type": "Kickoff",
     "baseline": "2026-02-02",
     "forecast": "2026-02-02",
     "actual": "2026-02-02",
     "status": "Completed",
     "show": true
    },
    {
     "id": "CRM-202-M02",
     "name": "Business case approval",
     "type": "Approval",
     "baseline": "2026-03-09",
     "forecast": "2026-03-09",
     "actual": "2026-03-09",
     "status": "Completed",
     "show": true
    },
    {
     "id": "CRM-202-M03",
     "name": "Design review",
     "type": "Review",
     "baseline": "2026-04-14",
     "forecast": "2026-04-14",
     "actual": "2026-04-14",
     "status": "Completed",
     "show": false
    },
    {
     "id": "CRM-202-M04",
     "name": "Gate: Planning approval",
     "type": "Gate",
     "baseline": "2026-05-19",
     "forecast": "2026-05-19",
     "actual": "2026-05-19",
     "status": "Completed",
     "show": true
    },
    {
     "id": "CRM-202-M05",
     "name": "Integration build complete",
     "type": "Technical",
     "baseline": "2026-06-24",
     "forecast": "2026-07-15",
     "actual": "2026-07-15",
     "status": "Completed",
     "show": true
    },
    {
     "id": "CRM-202-M06",
     "name": "System test complete",
     "type": "Test",
     "baseline": "2026-07-29",
     "forecast": "2026-08-19",
     "actual": "2026-08-19",
     "status": "Completed",
     "show": false
    },
    {
     "id": "CRM-202-M07",
     "name": "User acceptance testing",
     "type": "UAT",
     "baseline": "2026-09-02",
     "forecast": "2026-10-07",
     "actual": null,
     "status": "Delayed",
     "show": true
    },
    {
     "id": "CRM-202-M08",
     "name": "End-user training",
     "type": "Training",
     "baseline": "2026-10-08",
     "forecast": "2026-11-12",
     "actual": null,
     "status": "Delayed",
     "show": true
    },
    {
     "id": "CRM-202-M09",
     "name": "Go-live",
     "type": "Go-Live",
     "baseline": "2026-11-12",
     "forecast": "2026-12-03",
     "actual": null,
     "status": "Delayed",
     "show": true
    }
   ],
   "risks": [
    {
     "id": "R-021",
     "type": "Issue",
     "description": "Performance of the reporting layer not yet proven at full data volume",
     "category": "Technical",
     "likelihood": "Medium",
     "impact": "High",
     "rating": "High",
     "status": "Open",
     "owner": "Amara Diallo",
     "raised": "2026-01-27",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": 71000
    },
    {
     "id": "R-022",
     "type": "Risk",
     "description": "Parallel ERP cut-over competes for the same test environments",
     "category": "Schedule",
     "likelihood": "Low",
     "impact": "High",
     "rating": "Medium",
     "status": "Open",
     "owner": "Priya Kumar",
     "raised": "2026-02-19",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": 710000
    },
    {
     "id": "R-023",
     "type": "Risk",
     "description": "Change-management lead leaves at the end of the quarter",
     "category": "Resource",
     "likelihood": "Medium",
     "impact": "High",
     "rating": "High",
     "status": "Open",
     "owner": "Nina Schulz",
     "raised": "2026-03-14",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": 177000
    },
    {
     "id": "R-024",
     "type": "Risk",
     "description": "Regulatory guidance on e-invoicing still being finalised",
     "category": "Other",
     "likelihood": "Low",
     "impact": "Low",
     "rating": "Low",
     "status": "Mitigating",
     "owner": "Nina Schulz",
     "raised": "2026-04-06",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": null
    },
    {
     "id": "R-025",
     "type": "Risk",
     "description": "Key vendor delivery may slip past the integration test window",
     "category": "Schedule",
     "likelihood": "Low",
     "impact": "Medium",
     "rating": "Low",
     "status": "Monitoring",
     "owner": "Felix Braun",
     "raised": "2026-04-29",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": null
    },
    {
     "id": "R-026",
     "type": "Risk",
     "description": "Only one SME can configure the interfaces; availability is limited in Q4",
     "category": "Resource",
     "likelihood": "Medium",
     "impact": "Medium",
     "rating": "Medium",
     "status": "Open",
     "owner": "Nina Schulz",
     "raised": "2026-05-22",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": 177000
    },
    {
     "id": "R-027",
     "type": "Risk",
     "description": "Legacy data quality may require more cleansing cycles than planned",
     "category": "Technical",
     "likelihood": "Low",
     "impact": "Medium",
     "rating": "Low",
     "status": "Resolved",
     "owner": "Nina Schulz",
     "raised": "2026-06-14",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": null
    }
   ],
   "changeRequests": [
    {
     "number": "CR-01",
     "date": "2026-02-21",
     "title": "Extend scope to site B warehouse",
     "category": "Scope",
     "impact": "+€45k, +3 weeks",
     "status": "Approved",
     "requestedBy": "Jessica Miller"
    },
    {
     "number": "CR-02",
     "date": "2026-04-12",
     "title": "Add Power BI executive dashboard",
     "category": "Scope",
     "impact": "+€18k, no schedule impact",
     "status": "Submitted",
     "requestedBy": "Jessica Miller"
    },
    {
     "number": "CR-03",
     "date": "2026-06-01",
     "title": "Shift go-live by two weeks for peak season",
     "category": "Schedule",
     "impact": "No cost impact, +2 weeks",
     "status": "Approved",
     "requestedBy": "Jessica Miller"
    }
   ],
   "decisions": [
    {
     "number": "D-001",
     "date": "2026-02-01",
     "title": "Pilot with one portfolio before company-wide rollout",
     "decidedBy": "Steering Committee",
     "context": "Several options were discussed in the project board.",
     "options": "1) Proceed as planned. 2) Phase the rollout. 3) Defer.",
     "rationale": "Limits support load and gives real usage data before scaling.",
     "linked": "",
     "status": "Recorded"
    },
    {
     "number": "D-002",
     "date": "2026-03-08",
     "title": "Keep all project data inside our Microsoft 365 tenant",
     "decidedBy": "Head of PMO",
     "context": "Several options were discussed in the project board.",
     "options": "1) Proceed as planned. 2) Phase the rollout. 3) Defer.",
     "rationale": "No new vendor database to secure or audit; uses existing SharePoint permissions.",
     "linked": "CR-01",
     "status": "Recorded"
    },
    {
     "number": "D-003",
     "date": "2026-04-12",
     "title": "Status reports due by the 5th working day",
     "decidedBy": "Steering Committee",
     "context": "Several options were discussed in the project board.",
     "options": "1) Proceed as planned. 2) Phase the rollout. 3) Defer.",
     "rationale": "Gives Project Leaders month-end close while keeping reviews current.",
     "linked": "",
     "status": "Recorded"
    },
    {
     "number": "D-004",
     "date": "2026-05-17",
     "title": "Add health radar to monthly portfolio reviews",
     "decidedBy": "Head of PMO",
     "context": "Several options were discussed in the project board.",
     "options": "1) Proceed as planned. 2) Phase the rollout. 3) Defer.",
     "rationale": "More signal than RAG alone without full earned-value admin.",
     "linked": "",
     "status": "Draft"
    }
   ],
   "statusHistory": [
    {
     "month": "2026-09",
     "submitted": "2026-09-05",
     "overall": "Red",
     "timeline": "Red",
     "budget": "Yellow",
     "resources": "Red",
     "scope": "Yellow",
     "outputPct": 55,
     "engagement": 2
    },
    {
     "month": "2026-08",
     "submitted": "2026-09-04",
     "overall": "Red",
     "timeline": "Red",
     "budget": "Green",
     "resources": "Green",
     "scope": "Yellow",
     "outputPct": 50,
     "engagement": 1
    },
    {
     "month": "2026-07",
     "submitted": "2026-08-04",
     "overall": "Red",
     "timeline": "Green",
     "budget": "Yellow",
     "resources": "Yellow",
     "scope": "Yellow",
     "outputPct": 45,
     "engagement": 2
    },
    {
     "month": "2026-06",
     "submitted": "2026-07-05",
     "overall": "Yellow",
     "timeline": "Red",
     "budget": "Yellow",
     "resources": "Red",
     "scope": "Green",
     "outputPct": 35,
     "engagement": 3
    },
    {
     "month": "2026-05",
     "submitted": "2026-06-04",
     "overall": "Yellow",
     "timeline": "Yellow",
     "budget": "Yellow",
     "resources": "Yellow",
     "scope": "Yellow",
     "outputPct": 30,
     "engagement": 2
    },
    {
     "month": "2026-04",
     "submitted": "2026-05-05",
     "overall": "Yellow",
     "timeline": "Yellow",
     "budget": "Yellow",
     "resources": "Yellow",
     "scope": "Yellow",
     "outputPct": 25,
     "engagement": 2
    },
    {
     "month": "2026-03",
     "submitted": "2026-04-04",
     "overall": "Yellow",
     "timeline": "Yellow",
     "budget": "Yellow",
     "resources": "Yellow",
     "scope": "Yellow",
     "outputPct": 20,
     "engagement": 1
    },
    {
     "month": "2026-02",
     "submitted": "2026-03-07",
     "overall": "Yellow",
     "timeline": "Yellow",
     "budget": "Yellow",
     "resources": "Yellow",
     "scope": "Yellow",
     "outputPct": 15,
     "engagement": 3
    }
   ],
   "team": [
    {
     "person": "Amara Diallo",
     "role": "Project Leader",
     "fte": [
      40,
      40,
      40,
      40,
      40,
      40
     ]
    },
    {
     "person": "Priya Kumar",
     "role": "Deputy",
     "fte": [
      20,
      35,
      30,
      30,
      30,
      35
     ]
    },
    {
     "person": "Hannah Novak",
     "role": "Trainer",
     "fte": [
      10,
      15,
      10,
      0,
      15,
      10
     ]
    },
    {
     "person": "Olivia White",
     "role": "Change Manager",
     "fte": [
      15,
      10,
      10,
      10,
      15,
      15
     ]
    },
    {
     "person": "Yusuf Malik",
     "role": "Data Analyst",
     "fte": [
      30,
      20,
      35,
      30,
      35,
      30
     ]
    }
   ]
  },
  {
   "id": 4,
   "number": "CYB-203",
   "name": "M365 Zero-Trust Security & ISO 27001 Baseline",
   "type": "PRO",
   "portfolio": "IT & Infrastructure",
   "status": "Running",
   "phase": "Execution",
   "phases": [
    "Idea",
    "Concept",
    "Planning",
    "Execution",
    "Launch",
    "Closing"
   ],
   "priority": "Critical",
   "lead": "Rachel Wu",
   "sponsor": "David Vance",
   "sponsorTitle": "VP Technology & Risk",
   "deputy": "Felix Braun",
   "start": "2026-02-02",
   "end": "2027-01-29",
   "erp": "PRO.2026.121",
   "rag": {
    "overall": "Green",
    "timeline": "Green",
    "budget": "Green",
    "resources": "Yellow",
    "scope": "Green"
   },
   "ragReason": null,
   "goal": "Reach ISO 27001 certification readiness with a zero-trust baseline across Microsoft 365.",
   "scope": "In scope: process design, configuration, data migration, testing, training and hypercare. Out of scope: changes to upstream legacy systems.",
   "success": "Go-live without critical defects; 90% of users trained; benefits tracked monthly in the portfolio review.",
   "achievements": "Conditional access baseline rolled out to 2,400 users; privileged identity management live for all admin roles; ISO 27001 gap assessment closed.",
   "nextSteps": "Roll out device compliance policies to the remaining sites and run the internal audit rehearsal.",
   "outputPct": 65,
   "engagement": 4,
   "riskExposure": 46500,
   "financials": {
    "opexBudget": 322400,
    "opexActual": 209560,
    "opexPlanYear": 176800,
    "opexActualYtd": 152100,
    "capexBudget": 197600,
    "capexActual": 128440,
    "capexPlanYear": 104000,
    "capexActualYtd": 91260
   },
   "lastFinanceUpdate": "2026-09-15",
   "milestones": [
    {
     "id": "CYB-203-M01",
     "name": "Project kickoff",
     "type": "Kickoff",
     "baseline": "2026-02-26",
     "forecast": "2026-02-26",
     "actual": "2026-02-26",
     "status": "Completed",
     "show": true
    },
    {
     "id": "CYB-203-M02",
     "name": "Business case approval",
     "type": "Approval",
     "baseline": "2026-04-07",
     "forecast": "2026-04-07",
     "actual": "2026-04-07",
     "status": "Completed",
     "show": true
    },
    {
     "id": "CYB-203-M03",
     "name": "Design review",
     "type": "Review",
     "baseline": "2026-05-17",
     "forecast": "2026-05-17",
     "actual": "2026-05-17",
     "status": "Completed",
     "show": false
    },
    {
     "id": "CYB-203-M04",
     "name": "Gate: Planning approval",
     "type": "Gate",
     "baseline": "2026-06-26",
     "forecast": "2026-06-26",
     "actual": "2026-06-26",
     "status": "Completed",
     "show": true
    },
    {
     "id": "CYB-203-M05",
     "name": "Integration build complete",
     "type": "Technical",
     "baseline": "2026-08-05",
     "forecast": "2026-08-05",
     "actual": "2026-08-05",
     "status": "Completed",
     "show": true
    },
    {
     "id": "CYB-203-M06",
     "name": "System test complete",
     "type": "Test",
     "baseline": "2026-09-14",
     "forecast": "2026-09-14",
     "actual": "2026-09-14",
     "status": "Completed",
     "show": false
    },
    {
     "id": "CYB-203-M07",
     "name": "User acceptance testing",
     "type": "UAT",
     "baseline": "2026-10-24",
     "forecast": "2026-10-24",
     "actual": null,
     "status": "On Track",
     "show": true
    },
    {
     "id": "CYB-203-M08",
     "name": "End-user training",
     "type": "Training",
     "baseline": "2026-12-03",
     "forecast": "2026-12-06",
     "actual": null,
     "status": "On Track",
     "show": true
    },
    {
     "id": "CYB-203-M09",
     "name": "Go-live",
     "type": "Go-Live",
     "baseline": "2027-01-12",
     "forecast": "2027-01-12",
     "actual": null,
     "status": "On Track",
     "show": true
    }
   ],
   "risks": [
    {
     "id": "R-031",
     "type": "Risk",
     "description": "Regulatory guidance on e-invoicing still being finalised",
     "category": "Other",
     "likelihood": "Medium",
     "impact": "High",
     "rating": "High",
     "status": "Mitigating",
     "owner": "Felix Braun",
     "raised": "2026-02-17",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": 29000
    },
    {
     "id": "R-032",
     "type": "Risk",
     "description": "Key vendor delivery may slip past the integration test window",
     "category": "Schedule",
     "likelihood": "Low",
     "impact": "Medium",
     "rating": "Low",
     "status": "Monitoring",
     "owner": "Nina Schulz",
     "raised": "2026-03-12",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": 117000
    },
    {
     "id": "R-033",
     "type": "Risk",
     "description": "Only one SME can configure the interfaces; availability is limited in Q4",
     "category": "Resource",
     "likelihood": "Medium",
     "impact": "Medium",
     "rating": "Medium",
     "status": "Open",
     "owner": "Nina Schulz",
     "raised": "2026-04-04",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": 29000
    },
    {
     "id": "R-034",
     "type": "Risk",
     "description": "Legacy data quality may require more cleansing cycles than planned",
     "category": "Technical",
     "likelihood": "Low",
     "impact": "Medium",
     "rating": "Low",
     "status": "Monitoring",
     "owner": "Rachel Wu",
     "raised": "2026-04-27",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": null
    },
    {
     "id": "R-035",
     "type": "Risk",
     "description": "Licence price increase at renewal could exceed the approved contingency",
     "category": "Financial",
     "likelihood": "Medium",
     "impact": "Medium",
     "rating": "Medium",
     "status": "Open",
     "owner": "Felix Braun",
     "raised": "2026-05-20",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": 29000
    },
    {
     "id": "R-036",
     "type": "Risk",
     "description": "Hardware lead times for scanners have increased to 14 weeks",
     "category": "Supply Chain",
     "likelihood": "High",
     "impact": "High",
     "rating": "Critical",
     "status": "Resolved",
     "owner": "Nina Schulz",
     "raised": "2026-06-12",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": null
    }
   ],
   "changeRequests": [
    {
     "number": "CR-01",
     "date": "2026-03-14",
     "title": "Extend scope to site B warehouse",
     "category": "Scope",
     "impact": "+€45k, +3 weeks",
     "status": "Approved",
     "requestedBy": "David Vance"
    }
   ],
   "decisions": [
    {
     "number": "D-001",
     "date": "2026-02-22",
     "title": "Pilot with one portfolio before company-wide rollout",
     "decidedBy": "Steering Committee",
     "context": "Several options were discussed in the project board.",
     "options": "1) Proceed as planned. 2) Phase the rollout. 3) Defer.",
     "rationale": "Limits support load and gives real usage data before scaling.",
     "linked": "",
     "status": "Recorded"
    },
    {
     "number": "D-002",
     "date": "2026-03-29",
     "title": "Keep all project data inside our Microsoft 365 tenant",
     "decidedBy": "Head of PMO",
     "context": "Several options were discussed in the project board.",
     "options": "1) Proceed as planned. 2) Phase the rollout. 3) Defer.",
     "rationale": "No new vendor database to secure or audit; uses existing SharePoint permissions.",
     "linked": "CR-01",
     "status": "Recorded"
    }
   ],
   "statusHistory": [
    {
     "month": "2026-09",
     "submitted": "2026-09-05",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Yellow",
     "scope": "Green",
     "outputPct": 65,
     "engagement": 4
    },
    {
     "month": "2026-08",
     "submitted": "2026-09-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Yellow",
     "scope": "Green",
     "outputPct": 60,
     "engagement": 4
    },
    {
     "month": "2026-07",
     "submitted": "2026-08-04",
     "overall": "Green",
     "timeline": "Yellow",
     "budget": "Yellow",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 55,
     "engagement": 3
    },
    {
     "month": "2026-06",
     "submitted": "2026-07-05",
     "overall": "Yellow",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Yellow",
     "scope": "Green",
     "outputPct": 45,
     "engagement": 4
    },
    {
     "month": "2026-05",
     "submitted": "2026-06-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 40,
     "engagement": 3
    },
    {
     "month": "2026-04",
     "submitted": "2026-05-05",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 35,
     "engagement": 5
    },
    {
     "month": "2026-03",
     "submitted": "2026-04-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 30,
     "engagement": 5
    },
    {
     "month": "2026-02",
     "submitted": "2026-03-07",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 25,
     "engagement": 5
    }
   ],
   "team": [
    {
     "person": "Rachel Wu",
     "role": "Project Leader",
     "fte": [
      55,
      50,
      55,
      50,
      55,
      50
     ]
    },
    {
     "person": "Felix Braun",
     "role": "Deputy",
     "fte": [
      10,
      25,
      10,
      20,
      20,
      20
     ]
    },
    {
     "person": "Rafael Fernandes",
     "role": "Integration Specialist",
     "fte": [
      20,
      20,
      20,
      20,
      20,
      25
     ]
    },
    {
     "person": "Chloe Laurent",
     "role": "UX Designer",
     "fte": [
      20,
      20,
      20,
      10,
      25,
      20
     ]
    },
    {
     "person": "Ingrid Eriksen",
     "role": "Business Analyst",
     "fte": [
      25,
      20,
      25,
      20,
      20,
      20
     ]
    }
   ]
  },
  {
   "id": 5,
   "number": "OPS-301",
   "name": "Warehouse Barcode Scanning & Pick-and-Pack Automation",
   "type": "PRO",
   "portfolio": "Operations & Supply Chain",
   "status": "Running",
   "phase": "Execution",
   "phases": [
    "Idea",
    "Concept",
    "Planning",
    "Execution",
    "Launch",
    "Closing"
   ],
   "priority": "High",
   "lead": "Devon Clark",
   "sponsor": "Marcus Brody",
   "sponsorTitle": "Director of Supply Chain",
   "deputy": null,
   "start": "2026-04-06",
   "end": "2027-02-26",
   "erp": "PRO.2026.128",
   "rag": {
    "overall": "Yellow",
    "timeline": "Yellow",
    "budget": "Green",
    "resources": "Yellow",
    "scope": "Green"
   },
   "ragReason": "Timeline flagged Yellow: supplier deliveries are two weeks late; recovery plan agreed with the sponsor.",
   "goal": "Deliver the Warehouse Barcode Scanning & Pick-and-Pack Automation programme on time and within budget, with measurable adoption by the business.",
   "scope": "In scope: process design, configuration, data migration, testing, training and hypercare. Out of scope: changes to upstream legacy systems.",
   "success": "Go-live without critical defects; 90% of users trained; benefits tracked monthly in the portfolio review.",
   "achievements": "Design signed off and build sprint 3 completed; key users from two sites nominated for testing.",
   "nextSteps": "Complete system testing, run UAT with key users from two sites, and prepare the go-live readiness review.",
   "outputPct": 45,
   "engagement": 3,
   "riskExposure": 183400,
   "financials": {
    "opexBudget": 713000,
    "opexActual": 352780,
    "opexPlanYear": 391000,
    "opexActualYtd": 256050,
    "capexBudget": 437000,
    "capexActual": 216220,
    "capexPlanYear": 230000,
    "capexActualYtd": 153630
   },
   "lastFinanceUpdate": "2026-09-15",
   "milestones": [
    {
     "id": "OPS-301-M01",
     "name": "Project kickoff",
     "type": "Kickoff",
     "baseline": "2026-04-27",
     "forecast": "2026-04-27",
     "actual": "2026-04-27",
     "status": "Completed",
     "show": true
    },
    {
     "id": "OPS-301-M02",
     "name": "Business case approval",
     "type": "Approval",
     "baseline": "2026-06-02",
     "forecast": "2026-06-02",
     "actual": "2026-06-02",
     "status": "Completed",
     "show": true
    },
    {
     "id": "OPS-301-M03",
     "name": "Design review",
     "type": "Review",
     "baseline": "2026-07-09",
     "forecast": "2026-07-09",
     "actual": "2026-07-09",
     "status": "Completed",
     "show": false
    },
    {
     "id": "OPS-301-M04",
     "name": "Gate: Planning approval",
     "type": "Gate",
     "baseline": "2026-08-14",
     "forecast": "2026-08-14",
     "actual": "2026-08-14",
     "status": "Completed",
     "show": true
    },
    {
     "id": "OPS-301-M05",
     "name": "Integration build complete",
     "type": "Technical",
     "baseline": "2026-09-19",
     "forecast": "2026-09-19",
     "actual": "2026-09-19",
     "status": "Completed",
     "show": true
    },
    {
     "id": "OPS-301-M06",
     "name": "System test complete",
     "type": "Test",
     "baseline": "2026-10-25",
     "forecast": "2026-11-01",
     "actual": null,
     "status": "At Risk",
     "show": false
    },
    {
     "id": "OPS-301-M07",
     "name": "User acceptance testing",
     "type": "UAT",
     "baseline": "2026-12-01",
     "forecast": "2026-12-15",
     "actual": null,
     "status": "Delayed",
     "show": true
    },
    {
     "id": "OPS-301-M08",
     "name": "End-user training",
     "type": "Training",
     "baseline": "2027-01-06",
     "forecast": "2027-01-06",
     "actual": null,
     "status": "On Track",
     "show": true
    },
    {
     "id": "OPS-301-M09",
     "name": "Go-live",
     "type": "Go-Live",
     "baseline": "2027-02-11",
     "forecast": "2027-02-11",
     "actual": null,
     "status": "Not Started",
     "show": true
    }
   ],
   "risks": [
    {
     "id": "R-041",
     "type": "Issue",
     "description": "Legacy data quality may require more cleansing cycles than planned",
     "category": "Technical",
     "likelihood": "Medium",
     "impact": "Low",
     "rating": "Low",
     "status": "Mitigating",
     "owner": "Devon Clark",
     "raised": "2026-04-21",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": 61000
    },
    {
     "id": "R-042",
     "type": "Risk",
     "description": "Licence price increase at renewal could exceed the approved contingency",
     "category": "Financial",
     "likelihood": "Medium",
     "impact": "Medium",
     "rating": "Medium",
     "status": "Open",
     "owner": "Nina Schulz",
     "raised": "2026-05-14",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": 153000
    },
    {
     "id": "R-043",
     "type": "Risk",
     "description": "Hardware lead times for scanners have increased to 14 weeks",
     "category": "Supply Chain",
     "likelihood": "Medium",
     "impact": "High",
     "rating": "High",
     "status": "Open",
     "owner": "Nina Schulz",
     "raised": "2026-06-06",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": 153000
    },
    {
     "id": "R-044",
     "type": "Risk",
     "description": "Works council consultation may delay the rollout to site B",
     "category": "Other",
     "likelihood": "Medium",
     "impact": "High",
     "rating": "High",
     "status": "Resolved",
     "owner": "Devon Clark",
     "raised": "2026-06-29",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": null
    }
   ],
   "changeRequests": [
    {
     "number": "CR-01",
     "date": "2026-05-16",
     "title": "Extend scope to site B warehouse",
     "category": "Scope",
     "impact": "+€45k, +3 weeks",
     "status": "Approved",
     "requestedBy": "Marcus Brody"
    },
    {
     "number": "CR-02",
     "date": "2026-07-05",
     "title": "Add Power BI executive dashboard",
     "category": "Scope",
     "impact": "+€18k, no schedule impact",
     "status": "Submitted",
     "requestedBy": "Marcus Brody"
    }
   ],
   "decisions": [
    {
     "number": "D-001",
     "date": "2026-04-26",
     "title": "Pilot with one portfolio before company-wide rollout",
     "decidedBy": "Steering Committee",
     "context": "Several options were discussed in the project board.",
     "options": "1) Proceed as planned. 2) Phase the rollout. 3) Defer.",
     "rationale": "Limits support load and gives real usage data before scaling.",
     "linked": "",
     "status": "Recorded"
    },
    {
     "number": "D-002",
     "date": "2026-05-31",
     "title": "Keep all project data inside our Microsoft 365 tenant",
     "decidedBy": "Head of PMO",
     "context": "Several options were discussed in the project board.",
     "options": "1) Proceed as planned. 2) Phase the rollout. 3) Defer.",
     "rationale": "No new vendor database to secure or audit; uses existing SharePoint permissions.",
     "linked": "CR-01",
     "status": "Recorded"
    },
    {
     "number": "D-003",
     "date": "2026-07-05",
     "title": "Status reports due by the 5th working day",
     "decidedBy": "Steering Committee",
     "context": "Several options were discussed in the project board.",
     "options": "1) Proceed as planned. 2) Phase the rollout. 3) Defer.",
     "rationale": "Gives Project Leaders month-end close while keeping reviews current.",
     "linked": "",
     "status": "Recorded"
    }
   ],
   "statusHistory": [
    {
     "month": "2026-09",
     "submitted": "2026-09-05",
     "overall": "Yellow",
     "timeline": "Yellow",
     "budget": "Green",
     "resources": "Yellow",
     "scope": "Green",
     "outputPct": 45,
     "engagement": 3
    },
    {
     "month": "2026-08",
     "submitted": "2026-09-04",
     "overall": "Yellow",
     "timeline": "Yellow",
     "budget": "Green",
     "resources": "Yellow",
     "scope": "Green",
     "outputPct": 40,
     "engagement": 3
    },
    {
     "month": "2026-07",
     "submitted": "2026-08-04",
     "overall": "Yellow",
     "timeline": "Yellow",
     "budget": "Green",
     "resources": "Yellow",
     "scope": "Green",
     "outputPct": 35,
     "engagement": 3
    },
    {
     "month": "2026-06",
     "submitted": "2026-07-05",
     "overall": "Green",
     "timeline": "Yellow",
     "budget": "Green",
     "resources": "Yellow",
     "scope": "Yellow",
     "outputPct": 25,
     "engagement": 3
    },
    {
     "month": "2026-05",
     "submitted": "2026-06-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 20,
     "engagement": 3
    },
    {
     "month": "2026-04",
     "submitted": "2026-05-05",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 15,
     "engagement": 4
    }
   ],
   "team": [
    {
     "person": "Devon Clark",
     "role": "Project Leader",
     "fte": [
      10,
      15,
      10,
      10,
      10,
      10
     ]
    },
    {
     "person": "Kenji Sato",
     "role": "Developer",
     "fte": [
      35,
      30,
      30,
      35,
      30,
      30
     ]
    },
    {
     "person": "Anna Berg",
     "role": "Test Analyst",
     "fte": [
      45,
      40,
      40,
      40,
      45,
      40
     ]
    },
    {
     "person": "Nina Schulz",
     "role": "Business Analyst",
     "fte": [
      30,
      20,
      35,
      30,
      30,
      30
     ]
    }
   ]
  },
  {
   "id": 6,
   "number": "LOG-302",
   "name": "Regional Delivery Fleet GPS Routing & Telematics",
   "type": "PRO",
   "portfolio": "Operations & Supply Chain",
   "status": "Running",
   "phase": "Launch",
   "phases": [
    "Idea",
    "Concept",
    "Planning",
    "Execution",
    "Launch",
    "Closing"
   ],
   "priority": "Medium",
   "lead": "Liam O'Connor",
   "sponsor": "Marcus Brody",
   "sponsorTitle": "Director of Supply Chain",
   "deputy": "James Okafor",
   "start": "2026-02-16",
   "end": "2026-12-11",
   "erp": "PRO.2026.135",
   "rag": {
    "overall": "Green",
    "timeline": "Green",
    "budget": "Green",
    "resources": "Green",
    "scope": "Green"
   },
   "ragReason": null,
   "goal": "Deliver the Regional Delivery Fleet GPS Routing & Telematics programme on time and within budget, with measurable adoption by the business.",
   "scope": "In scope: process design, configuration, data migration, testing, training and hypercare. Out of scope: changes to upstream legacy systems.",
   "success": "Go-live without critical defects; 90% of users trained; benefits tracked monthly in the portfolio review.",
   "achievements": "Design signed off and build sprint 3 completed; key users from two sites nominated for testing.",
   "nextSteps": "Complete system testing, run UAT with key users from two sites, and prepare the go-live readiness review.",
   "outputPct": 75,
   "engagement": 4,
   "riskExposure": 44700,
   "financials": {
    "opexBudget": 396800,
    "opexActual": 274040,
    "opexPlanYear": 217600,
    "opexActualYtd": 198900,
    "capexBudget": 243200,
    "capexActual": 167960,
    "capexPlanYear": 128000,
    "capexActualYtd": 119340
   },
   "lastFinanceUpdate": "2026-09-15",
   "milestones": [
    {
     "id": "LOG-302-M01",
     "name": "Project kickoff",
     "type": "Kickoff",
     "baseline": "2026-03-07",
     "forecast": "2026-03-07",
     "actual": "2026-03-07",
     "status": "Completed",
     "show": true
    },
    {
     "id": "LOG-302-M02",
     "name": "Business case approval",
     "type": "Approval",
     "baseline": "2026-04-09",
     "forecast": "2026-04-09",
     "actual": "2026-04-09",
     "status": "Completed",
     "show": true
    },
    {
     "id": "LOG-302-M03",
     "name": "Design review",
     "type": "Review",
     "baseline": "2026-05-13",
     "forecast": "2026-05-13",
     "actual": "2026-05-13",
     "status": "Completed",
     "show": false
    },
    {
     "id": "LOG-302-M04",
     "name": "Gate: Planning approval",
     "type": "Gate",
     "baseline": "2026-06-15",
     "forecast": "2026-06-15",
     "actual": "2026-06-15",
     "status": "Completed",
     "show": true
    },
    {
     "id": "LOG-302-M05",
     "name": "Integration build complete",
     "type": "Technical",
     "baseline": "2026-07-18",
     "forecast": "2026-07-18",
     "actual": "2026-07-18",
     "status": "Completed",
     "show": true
    },
    {
     "id": "LOG-302-M06",
     "name": "System test complete",
     "type": "Test",
     "baseline": "2026-08-20",
     "forecast": "2026-08-20",
     "actual": "2026-08-20",
     "status": "Completed",
     "show": false
    },
    {
     "id": "LOG-302-M07",
     "name": "User acceptance testing",
     "type": "UAT",
     "baseline": "2026-09-22",
     "forecast": "2026-09-22",
     "actual": "2026-09-22",
     "status": "Completed",
     "show": true
    },
    {
     "id": "LOG-302-M08",
     "name": "End-user training",
     "type": "Training",
     "baseline": "2026-10-25",
     "forecast": "2026-10-25",
     "actual": null,
     "status": "On Track",
     "show": true
    },
    {
     "id": "LOG-302-M09",
     "name": "Go-live",
     "type": "Go-Live",
     "baseline": "2026-11-27",
     "forecast": "2026-11-27",
     "actual": null,
     "status": "On Track",
     "show": true
    }
   ],
   "risks": [
    {
     "id": "R-051",
     "type": "Risk",
     "description": "Works council consultation may delay the rollout to site B",
     "category": "Other",
     "likelihood": "Low",
     "impact": "Medium",
     "rating": "Low",
     "status": "Monitoring",
     "owner": "Felix Braun",
     "raised": "2026-03-03",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": 149000
    },
    {
     "id": "R-052",
     "type": "Risk",
     "description": "Performance of the reporting layer not yet proven at full data volume",
     "category": "Technical",
     "likelihood": "Low",
     "impact": "Low",
     "rating": "Low",
     "status": "Open",
     "owner": "James Okafor",
     "raised": "2026-03-26",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": 149000
    },
    {
     "id": "R-053",
     "type": "Risk",
     "description": "Parallel ERP cut-over competes for the same test environments",
     "category": "Schedule",
     "likelihood": "Low",
     "impact": "Medium",
     "rating": "Low",
     "status": "Monitoring",
     "owner": "James Okafor",
     "raised": "2026-04-18",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": 149000
    },
    {
     "id": "R-054",
     "type": "Risk",
     "description": "Change-management lead leaves at the end of the quarter",
     "category": "Resource",
     "likelihood": "Low",
     "impact": "Low",
     "rating": "Low",
     "status": "Resolved",
     "owner": "Nina Schulz",
     "raised": "2026-05-11",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": null
    }
   ],
   "changeRequests": [
    {
     "number": "CR-01",
     "date": "2026-03-28",
     "title": "Extend scope to site B warehouse",
     "category": "Scope",
     "impact": "+€45k, +3 weeks",
     "status": "Approved",
     "requestedBy": "Marcus Brody"
    },
    {
     "number": "CR-02",
     "date": "2026-05-17",
     "title": "Add Power BI executive dashboard",
     "category": "Scope",
     "impact": "+€18k, no schedule impact",
     "status": "Submitted",
     "requestedBy": "Marcus Brody"
    },
    {
     "number": "CR-03",
     "date": "2026-07-06",
     "title": "Shift go-live by two weeks for peak season",
     "category": "Schedule",
     "impact": "No cost impact, +2 weeks",
     "status": "Approved",
     "requestedBy": "Marcus Brody"
    }
   ],
   "decisions": [
    {
     "number": "D-001",
     "date": "2026-03-08",
     "title": "Pilot with one portfolio before company-wide rollout",
     "decidedBy": "Steering Committee",
     "context": "Several options were discussed in the project board.",
     "options": "1) Proceed as planned. 2) Phase the rollout. 3) Defer.",
     "rationale": "Limits support load and gives real usage data before scaling.",
     "linked": "",
     "status": "Recorded"
    },
    {
     "number": "D-002",
     "date": "2026-04-12",
     "title": "Keep all project data inside our Microsoft 365 tenant",
     "decidedBy": "Head of PMO",
     "context": "Several options were discussed in the project board.",
     "options": "1) Proceed as planned. 2) Phase the rollout. 3) Defer.",
     "rationale": "No new vendor database to secure or audit; uses existing SharePoint permissions.",
     "linked": "CR-01",
     "status": "Recorded"
    },
    {
     "number": "D-003",
     "date": "2026-05-17",
     "title": "Status reports due by the 5th working day",
     "decidedBy": "Steering Committee",
     "context": "Several options were discussed in the project board.",
     "options": "1) Proceed as planned. 2) Phase the rollout. 3) Defer.",
     "rationale": "Gives Project Leaders month-end close while keeping reviews current.",
     "linked": "",
     "status": "Recorded"
    },
    {
     "number": "D-004",
     "date": "2026-06-21",
     "title": "Add health radar to monthly portfolio reviews",
     "decidedBy": "Head of PMO",
     "context": "Several options were discussed in the project board.",
     "options": "1) Proceed as planned. 2) Phase the rollout. 3) Defer.",
     "rationale": "More signal than RAG alone without full earned-value admin.",
     "linked": "",
     "status": "Draft"
    }
   ],
   "statusHistory": [
    {
     "month": "2026-09",
     "submitted": null,
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 75,
     "engagement": 4
    },
    {
     "month": "2026-08",
     "submitted": "2026-09-04",
     "overall": "Green",
     "timeline": "Yellow",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 65,
     "engagement": 3
    },
    {
     "month": "2026-07",
     "submitted": "2026-08-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 60,
     "engagement": 4
    },
    {
     "month": "2026-06",
     "submitted": "2026-07-05",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Yellow",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 50,
     "engagement": 4
    },
    {
     "month": "2026-05",
     "submitted": "2026-06-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 45,
     "engagement": 4
    },
    {
     "month": "2026-04",
     "submitted": "2026-05-05",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 35,
     "engagement": 3
    },
    {
     "month": "2026-03",
     "submitted": "2026-04-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 25,
     "engagement": 4
    },
    {
     "month": "2026-02",
     "submitted": "2026-03-07",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 20,
     "engagement": 4
    }
   ],
   "team": [
    {
     "person": "Liam O'Connor",
     "role": "Project Leader",
     "fte": [
      40,
      40,
      45,
      30,
      40,
      40
     ]
    },
    {
     "person": "James Okafor",
     "role": "Deputy",
     "fte": [
      20,
      10,
      10,
      20,
      20,
      20
     ]
    },
    {
     "person": "Olivia White",
     "role": "Change Manager",
     "fte": [
      35,
      30,
      30,
      30,
      20,
      30
     ]
    },
    {
     "person": "Hannah Novak",
     "role": "Trainer",
     "fte": [
      20,
      25,
      10,
      25,
      20,
      20
     ]
    },
    {
     "person": "Rafael Fernandes",
     "role": "Integration Specialist",
     "fte": [
      35,
      30,
      30,
      30,
      35,
      30
     ]
    }
   ]
  },
  {
   "id": 7,
   "number": "ENG-501",
   "name": "Next-Gen Compact Sensor Hardware Prototyping",
   "type": "RES",
   "portfolio": "Product Engineering",
   "status": "Running",
   "phase": "Prototype",
   "phases": [
    "Idea",
    "Feasibility",
    "Prototype",
    "Validation",
    "Transfer"
   ],
   "priority": "High",
   "lead": "Henrik Lindqvist",
   "sponsor": "Dr. Aris Thorne",
   "sponsorTitle": "VP Product Engineering",
   "deputy": null,
   "start": "2025-10-06",
   "end": "2027-04-30",
   "erp": "RES.2026.142",
   "rag": {
    "overall": "Yellow",
    "timeline": "Yellow",
    "budget": "Yellow",
    "resources": "Green",
    "scope": "Green"
   },
   "ragReason": "Timeline flagged Yellow: supplier deliveries are two weeks late; recovery plan agreed with the sponsor.",
   "goal": "Deliver the Next-Gen Compact Sensor Hardware Prototyping programme on time and within budget, with measurable adoption by the business.",
   "scope": "In scope: process design, configuration, data migration, testing, training and hypercare. Out of scope: changes to upstream legacy systems.",
   "success": "Go-live without critical defects; 90% of users trained; benefits tracked monthly in the portfolio review.",
   "achievements": "Design signed off and build sprint 3 completed; key users from two sites nominated for testing.",
   "nextSteps": "Complete system testing, run UAT with key users from two sites, and prepare the go-live readiness review.",
   "outputPct": 50,
   "engagement": 4,
   "riskExposure": 377300,
   "financials": {
    "opexBudget": 1116000,
    "opexActual": 658440,
    "opexPlanYear": 612000,
    "opexActualYtd": 477900,
    "capexBudget": 684000,
    "capexActual": 403560,
    "capexPlanYear": 360000,
    "capexActualYtd": 286740
   },
   "lastFinanceUpdate": "2026-09-15",
   "milestones": [
    {
     "id": "ENG-501-M01",
     "name": "Project kickoff",
     "type": "Kickoff",
     "baseline": "2025-11-13",
     "forecast": "2025-11-13",
     "actual": "2025-11-13",
     "status": "Completed",
     "show": true
    },
    {
     "id": "ENG-501-M02",
     "name": "Business case approval",
     "type": "Approval",
     "baseline": "2026-01-15",
     "forecast": "2026-01-15",
     "actual": "2026-01-15",
     "status": "Completed",
     "show": true
    },
    {
     "id": "ENG-501-M03",
     "name": "Design review",
     "type": "Review",
     "baseline": "2026-03-19",
     "forecast": "2026-03-19",
     "actual": "2026-03-19",
     "status": "Completed",
     "show": false
    },
    {
     "id": "ENG-501-M04",
     "name": "Gate: Prototype approval",
     "type": "Gate",
     "baseline": "2026-05-22",
     "forecast": "2026-05-22",
     "actual": "2026-05-22",
     "status": "Completed",
     "show": true
    },
    {
     "id": "ENG-501-M05",
     "name": "Integration build complete",
     "type": "Technical",
     "baseline": "2026-07-24",
     "forecast": "2026-07-24",
     "actual": "2026-07-24",
     "status": "Completed",
     "show": true
    },
    {
     "id": "ENG-501-M06",
     "name": "System test complete",
     "type": "Test",
     "baseline": "2026-09-26",
     "forecast": "2026-10-10",
     "actual": null,
     "status": "Delayed",
     "show": false
    },
    {
     "id": "ENG-501-M07",
     "name": "User acceptance testing",
     "type": "UAT",
     "baseline": "2026-11-28",
     "forecast": "2026-12-12",
     "actual": null,
     "status": "Delayed",
     "show": true
    },
    {
     "id": "ENG-501-M08",
     "name": "End-user training",
     "type": "Training",
     "baseline": "2027-01-31",
     "forecast": "2027-01-31",
     "actual": null,
     "status": "Not Started",
     "show": true
    },
    {
     "id": "ENG-501-M09",
     "name": "Go-live",
     "type": "Go-Live",
     "baseline": "2027-04-04",
     "forecast": "2027-04-18",
     "actual": null,
     "status": "Delayed",
     "show": true
    }
   ],
   "risks": [
    {
     "id": "R-061",
     "type": "Issue",
     "description": "Change-management lead leaves at the end of the quarter",
     "category": "Resource",
     "likelihood": "Medium",
     "impact": "Medium",
     "rating": "Medium",
     "status": "Open",
     "owner": "Henrik Lindqvist",
     "raised": "2025-10-21",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": 94000
    },
    {
     "id": "R-062",
     "type": "Risk",
     "description": "Regulatory guidance on e-invoicing still being finalised",
     "category": "Other",
     "likelihood": "Low",
     "impact": "High",
     "rating": "Medium",
     "status": "Monitoring",
     "owner": "Henrik Lindqvist",
     "raised": "2025-11-13",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": 945000
    },
    {
     "id": "R-063",
     "type": "Risk",
     "description": "Key vendor delivery may slip past the integration test window",
     "category": "Schedule",
     "likelihood": "Low",
     "impact": "Low",
     "rating": "Low",
     "status": "Open",
     "owner": "Nina Schulz",
     "raised": "2025-12-06",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": null
    },
    {
     "id": "R-064",
     "type": "Risk",
     "description": "Only one SME can configure the interfaces; availability is limited in Q4",
     "category": "Resource",
     "likelihood": "Medium",
     "impact": "Medium",
     "rating": "Medium",
     "status": "Open",
     "owner": "Nina Schulz",
     "raised": "2025-12-29",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": 236000
    },
    {
     "id": "R-065",
     "type": "Risk",
     "description": "Legacy data quality may require more cleansing cycles than planned",
     "category": "Technical",
     "likelihood": "Medium",
     "impact": "High",
     "rating": "High",
     "status": "Open",
     "owner": "Felix Braun",
     "raised": "2026-01-21",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": 236000
    },
    {
     "id": "R-066",
     "type": "Risk",
     "description": "Licence price increase at renewal could exceed the approved contingency",
     "category": "Financial",
     "likelihood": "Medium",
     "impact": "Low",
     "rating": "Low",
     "status": "Resolved",
     "owner": "Nina Schulz",
     "raised": "2026-02-13",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": null
    }
   ],
   "changeRequests": [
    {
     "number": "CR-01",
     "date": "2025-11-15",
     "title": "Extend scope to site B warehouse",
     "category": "Scope",
     "impact": "+€45k, +3 weeks",
     "status": "Approved",
     "requestedBy": "Dr. Aris Thorne"
    }
   ],
   "decisions": [],
   "statusHistory": [
    {
     "month": "2026-09",
     "submitted": "2026-09-05",
     "overall": "Yellow",
     "timeline": "Yellow",
     "budget": "Yellow",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 50,
     "engagement": 4
    },
    {
     "month": "2026-08",
     "submitted": "2026-09-04",
     "overall": "Yellow",
     "timeline": "Yellow",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 45,
     "engagement": 3
    },
    {
     "month": "2026-07",
     "submitted": "2026-08-04",
     "overall": "Yellow",
     "timeline": "Yellow",
     "budget": "Yellow",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 40,
     "engagement": 4
    },
    {
     "month": "2026-06",
     "submitted": "2026-07-05",
     "overall": "Yellow",
     "timeline": "Green",
     "budget": "Yellow",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 35,
     "engagement": 4
    },
    {
     "month": "2026-05",
     "submitted": "2026-06-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 30,
     "engagement": 4
    },
    {
     "month": "2026-04",
     "submitted": "2026-05-05",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 25,
     "engagement": 4
    },
    {
     "month": "2026-03",
     "submitted": "2026-04-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 20,
     "engagement": 5
    },
    {
     "month": "2026-02",
     "submitted": "2026-03-07",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 15,
     "engagement": 3
    }
   ],
   "team": [
    {
     "person": "Henrik Lindqvist",
     "role": "Project Leader",
     "fte": [
      40,
      30,
      30,
      40,
      40,
      30
     ]
    },
    {
     "person": "Ingrid Eriksen",
     "role": "Business Analyst",
     "fte": [
      30,
      20,
      30,
      30,
      30,
      20
     ]
    },
    {
     "person": "Chloe Laurent",
     "role": "UX Designer",
     "fte": [
      45,
      40,
      30,
      30,
      40,
      45
     ]
    },
    {
     "person": "Lucia Moreno",
     "role": "Data Engineer",
     "fte": [
      20,
      25,
      25,
      20,
      20,
      10
     ]
    }
   ]
  },
  {
   "id": 8,
   "number": "ENG-502",
   "name": "Product Lifecycle Data Platform (PLM) Upgrade",
   "type": "PRO",
   "portfolio": "Product Engineering",
   "status": "Running",
   "phase": "Planning",
   "phases": [
    "Idea",
    "Concept",
    "Planning",
    "Execution",
    "Launch",
    "Closing"
   ],
   "priority": "Medium",
   "lead": "Felix Braun",
   "sponsor": "Dr. Aris Thorne",
   "sponsorTitle": "VP Product Engineering",
   "deputy": "Lucia Moreno",
   "start": "2026-05-04",
   "end": "2027-06-30",
   "erp": "PRO.2026.149",
   "rag": {
    "overall": "Green",
    "timeline": "Green",
    "budget": "Green",
    "resources": "Green",
    "scope": "Green"
   },
   "ragReason": null,
   "goal": "Deliver the Product Lifecycle Data Platform (PLM) Upgrade programme on time and within budget, with measurable adoption by the business.",
   "scope": "In scope: process design, configuration, data migration, testing, training and hypercare. Out of scope: changes to upstream legacy systems.",
   "success": "Go-live without critical defects; 90% of users trained; benefits tracked monthly in the portfolio review.",
   "achievements": "Design signed off and build sprint 3 completed; key users from two sites nominated for testing.",
   "nextSteps": "Complete system testing, run UAT with key users from two sites, and prepare the go-live readiness review.",
   "outputPct": 35,
   "engagement": 5,
   "riskExposure": 76400,
   "financials": {
    "opexBudget": 589000,
    "opexActual": 210180,
    "opexPlanYear": 323000,
    "opexActualYtd": 152550,
    "capexBudget": 361000,
    "capexActual": 128820,
    "capexPlanYear": 190000,
    "capexActualYtd": 91530
   },
   "lastFinanceUpdate": "2026-09-15",
   "milestones": [
    {
     "id": "ENG-502-M01",
     "name": "Project kickoff",
     "type": "Kickoff",
     "baseline": "2026-06-01",
     "forecast": "2026-06-01",
     "actual": "2026-06-01",
     "status": "Completed",
     "show": true
    },
    {
     "id": "ENG-502-M02",
     "name": "Business case approval",
     "type": "Approval",
     "baseline": "2026-07-18",
     "forecast": "2026-07-18",
     "actual": "2026-07-18",
     "status": "Completed",
     "show": true
    },
    {
     "id": "ENG-502-M03",
     "name": "Design review",
     "type": "Review",
     "baseline": "2026-09-02",
     "forecast": "2026-09-02",
     "actual": "2026-09-02",
     "status": "Completed",
     "show": false
    },
    {
     "id": "ENG-502-M04",
     "name": "Gate: Planning approval",
     "type": "Gate",
     "baseline": "2026-10-19",
     "forecast": "2026-10-19",
     "actual": null,
     "status": "On Track",
     "show": true
    },
    {
     "id": "ENG-502-M05",
     "name": "Integration build complete",
     "type": "Technical",
     "baseline": "2026-12-05",
     "forecast": "2026-12-05",
     "actual": null,
     "status": "On Track",
     "show": true
    },
    {
     "id": "ENG-502-M06",
     "name": "System test complete",
     "type": "Test",
     "baseline": "2027-01-21",
     "forecast": "2027-01-19",
     "actual": null,
     "status": "On Track",
     "show": false
    },
    {
     "id": "ENG-502-M07",
     "name": "User acceptance testing",
     "type": "UAT",
     "baseline": "2027-03-09",
     "forecast": "2027-03-09",
     "actual": null,
     "status": "Not Started",
     "show": true
    },
    {
     "id": "ENG-502-M08",
     "name": "End-user training",
     "type": "Training",
     "baseline": "2027-04-25",
     "forecast": "2027-04-28",
     "actual": null,
     "status": "Not Started",
     "show": true
    },
    {
     "id": "ENG-502-M09",
     "name": "Go-live",
     "type": "Go-Live",
     "baseline": "2027-06-11",
     "forecast": "2027-06-14",
     "actual": null,
     "status": "Not Started",
     "show": true
    }
   ],
   "risks": [
    {
     "id": "R-071",
     "type": "Risk",
     "description": "Only one SME can configure the interfaces; availability is limited in Q4",
     "category": "Resource",
     "likelihood": "Medium",
     "impact": "Low",
     "rating": "Low",
     "status": "Mitigating",
     "owner": "Nina Schulz",
     "raised": "2026-05-19",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": 48000
    },
    {
     "id": "R-072",
     "type": "Risk",
     "description": "Legacy data quality may require more cleansing cycles than planned",
     "category": "Technical",
     "likelihood": "Low",
     "impact": "Medium",
     "rating": "Low",
     "status": "Monitoring",
     "owner": "Felix Braun",
     "raised": "2026-06-11",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": 190000
    },
    {
     "id": "R-073",
     "type": "Risk",
     "description": "Licence price increase at renewal could exceed the approved contingency",
     "category": "Financial",
     "likelihood": "Low",
     "impact": "High",
     "rating": "Medium",
     "status": "Open",
     "owner": "Nina Schulz",
     "raised": "2026-07-04",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": 190000
    },
    {
     "id": "R-074",
     "type": "Risk",
     "description": "Hardware lead times for scanners have increased to 14 weeks",
     "category": "Supply Chain",
     "likelihood": "Medium",
     "impact": "Low",
     "rating": "Low",
     "status": "Open",
     "owner": "Felix Braun",
     "raised": "2026-07-27",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": null
    },
    {
     "id": "R-075",
     "type": "Risk",
     "description": "Works council consultation may delay the rollout to site B",
     "category": "Other",
     "likelihood": "Medium",
     "impact": "High",
     "rating": "High",
     "status": "Monitoring",
     "owner": "Lucia Moreno",
     "raised": "2026-08-19",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": 48000
    },
    {
     "id": "R-076",
     "type": "Risk",
     "description": "Performance of the reporting layer not yet proven at full data volume",
     "category": "Technical",
     "likelihood": "Medium",
     "impact": "High",
     "rating": "High",
     "status": "Resolved",
     "owner": "Lucia Moreno",
     "raised": "2026-09-11",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": null
    }
   ],
   "changeRequests": [
    {
     "number": "CR-01",
     "date": "2026-06-13",
     "title": "Extend scope to site B warehouse",
     "category": "Scope",
     "impact": "+€45k, +3 weeks",
     "status": "Approved",
     "requestedBy": "Dr. Aris Thorne"
    },
    {
     "number": "CR-02",
     "date": "2026-08-02",
     "title": "Add Power BI executive dashboard",
     "category": "Scope",
     "impact": "+€18k, no schedule impact",
     "status": "Submitted",
     "requestedBy": "Dr. Aris Thorne"
    }
   ],
   "decisions": [],
   "statusHistory": [
    {
     "month": "2026-09",
     "submitted": "2026-09-05",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 35,
     "engagement": 5
    },
    {
     "month": "2026-08",
     "submitted": "2026-09-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 30,
     "engagement": 5
    },
    {
     "month": "2026-07",
     "submitted": "2026-08-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Yellow",
     "resources": "Green",
     "scope": "Yellow",
     "outputPct": 25,
     "engagement": 4
    },
    {
     "month": "2026-06",
     "submitted": "2026-07-05",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 20,
     "engagement": 4
    },
    {
     "month": "2026-05",
     "submitted": "2026-06-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 15,
     "engagement": 5
    }
   ],
   "team": [
    {
     "person": "Felix Braun",
     "role": "Project Leader",
     "fte": [
      10,
      15,
      10,
      15,
      10,
      10
     ]
    },
    {
     "person": "Lucia Moreno",
     "role": "Deputy",
     "fte": [
      30,
      30,
      30,
      30,
      30,
      30
     ]
    },
    {
     "person": "Giorgio Pellegrini",
     "role": "Solution Architect",
     "fte": [
      20,
      25,
      20,
      10,
      20,
      25
     ]
    },
    {
     "person": "Hannah Novak",
     "role": "Trainer",
     "fte": [
      10,
      10,
      20,
      25,
      20,
      20
     ]
    },
    {
     "person": "Yusuf Malik",
     "role": "Data Analyst",
     "fte": [
      10,
      10,
      15,
      0,
      10,
      10
     ]
    }
   ]
  },
  {
   "id": 9,
   "number": "FIN-601",
   "name": "Automated Accounts Payable & Invoice OCR",
   "type": "PRO",
   "portfolio": "Finance & Corporate",
   "status": "Running",
   "phase": "Launch",
   "phases": [
    "Idea",
    "Concept",
    "Planning",
    "Execution",
    "Launch",
    "Closing"
   ],
   "priority": "High",
   "lead": "Elena Garcia",
   "sponsor": "Elena Rostova",
   "sponsorTitle": "Finance Director",
   "deputy": "Nina Schulz",
   "start": "2026-01-19",
   "end": "2026-10-30",
   "erp": "PRO.2026.156",
   "rag": {
    "overall": "Green",
    "timeline": "Green",
    "budget": "Green",
    "resources": "Green",
    "scope": "Green"
   },
   "ragReason": null,
   "goal": "Deliver the Automated Accounts Payable & Invoice OCR programme on time and within budget, with measurable adoption by the business.",
   "scope": "In scope: process design, configuration, data migration, testing, training and hypercare. Out of scope: changes to upstream legacy systems.",
   "success": "Go-live without critical defects; 90% of users trained; benefits tracked monthly in the portfolio review.",
   "achievements": "Design signed off and build sprint 3 completed; key users from two sites nominated for testing.",
   "nextSteps": "Complete system testing, run UAT with key users from two sites, and prepare the go-live readiness review.",
   "outputPct": 85,
   "engagement": 4,
   "riskExposure": 22600,
   "financials": {
    "opexBudget": 235600,
    "opexActual": 194060,
    "opexPlanYear": 129200,
    "opexActualYtd": 140850,
    "capexBudget": 144400,
    "capexActual": 118940,
    "capexPlanYear": 76000,
    "capexActualYtd": 84510
   },
   "lastFinanceUpdate": "2026-09-15",
   "milestones": [
    {
     "id": "FIN-601-M01",
     "name": "Project kickoff",
     "type": "Kickoff",
     "baseline": "2026-02-06",
     "forecast": "2026-02-06",
     "actual": "2026-02-06",
     "status": "Completed",
     "show": true
    },
    {
     "id": "FIN-601-M02",
     "name": "Business case approval",
     "type": "Approval",
     "baseline": "2026-03-10",
     "forecast": "2026-03-10",
     "actual": "2026-03-10",
     "status": "Completed",
     "show": true
    },
    {
     "id": "FIN-601-M03",
     "name": "Design review",
     "type": "Review",
     "baseline": "2026-04-11",
     "forecast": "2026-04-11",
     "actual": "2026-04-11",
     "status": "Completed",
     "show": false
    },
    {
     "id": "FIN-601-M04",
     "name": "Gate: Planning approval",
     "type": "Gate",
     "baseline": "2026-05-12",
     "forecast": "2026-05-12",
     "actual": "2026-05-12",
     "status": "Completed",
     "show": true
    },
    {
     "id": "FIN-601-M05",
     "name": "Integration build complete",
     "type": "Technical",
     "baseline": "2026-06-13",
     "forecast": "2026-06-13",
     "actual": "2026-06-13",
     "status": "Completed",
     "show": true
    },
    {
     "id": "FIN-601-M06",
     "name": "System test complete",
     "type": "Test",
     "baseline": "2026-07-14",
     "forecast": "2026-07-14",
     "actual": "2026-07-14",
     "status": "Completed",
     "show": false
    },
    {
     "id": "FIN-601-M07",
     "name": "User acceptance testing",
     "type": "UAT",
     "baseline": "2026-08-15",
     "forecast": "2026-08-18",
     "actual": "2026-08-18",
     "status": "Completed",
     "show": true
    },
    {
     "id": "FIN-601-M08",
     "name": "End-user training",
     "type": "Training",
     "baseline": "2026-09-15",
     "forecast": "2026-09-15",
     "actual": "2026-09-15",
     "status": "Completed",
     "show": true
    },
    {
     "id": "FIN-601-M09",
     "name": "Go-live",
     "type": "Go-Live",
     "baseline": "2026-10-17",
     "forecast": "2026-10-15",
     "actual": null,
     "status": "On Track",
     "show": true
    }
   ],
   "risks": [
    {
     "id": "R-081",
     "type": "Risk",
     "description": "Hardware lead times for scanners have increased to 14 weeks",
     "category": "Supply Chain",
     "likelihood": "Medium",
     "impact": "Low",
     "rating": "Low",
     "status": "Mitigating",
     "owner": "Elena Garcia",
     "raised": "2026-02-03",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": 28000
    },
    {
     "id": "R-082",
     "type": "Risk",
     "description": "Works council consultation may delay the rollout to site B",
     "category": "Other",
     "likelihood": "Low",
     "impact": "Low",
     "rating": "Low",
     "status": "Mitigating",
     "owner": "Elena Garcia",
     "raised": "2026-02-26",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": 114000
    },
    {
     "id": "R-083",
     "type": "Risk",
     "description": "Performance of the reporting layer not yet proven at full data volume",
     "category": "Technical",
     "likelihood": "High",
     "impact": "Low",
     "rating": "Medium",
     "status": "Resolved",
     "owner": "Elena Garcia",
     "raised": "2026-03-21",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": null
    }
   ],
   "changeRequests": [
    {
     "number": "CR-01",
     "date": "2026-02-28",
     "title": "Extend scope to site B warehouse",
     "category": "Scope",
     "impact": "+€45k, +3 weeks",
     "status": "Approved",
     "requestedBy": "Elena Rostova"
    },
    {
     "number": "CR-02",
     "date": "2026-04-19",
     "title": "Add Power BI executive dashboard",
     "category": "Scope",
     "impact": "+€18k, no schedule impact",
     "status": "Submitted",
     "requestedBy": "Elena Rostova"
    },
    {
     "number": "CR-03",
     "date": "2026-06-08",
     "title": "Shift go-live by two weeks for peak season",
     "category": "Schedule",
     "impact": "No cost impact, +2 weeks",
     "status": "Approved",
     "requestedBy": "Elena Rostova"
    }
   ],
   "decisions": [],
   "statusHistory": [
    {
     "month": "2026-09",
     "submitted": "2026-09-05",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 85,
     "engagement": 4
    },
    {
     "month": "2026-08",
     "submitted": "2026-09-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Yellow",
     "scope": "Green",
     "outputPct": 75,
     "engagement": 3
    },
    {
     "month": "2026-07",
     "submitted": "2026-08-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Yellow",
     "scope": "Green",
     "outputPct": 70,
     "engagement": 3
    },
    {
     "month": "2026-06",
     "submitted": "2026-07-05",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Yellow",
     "outputPct": 60,
     "engagement": 4
    },
    {
     "month": "2026-05",
     "submitted": "2026-06-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 55,
     "engagement": 4
    },
    {
     "month": "2026-04",
     "submitted": "2026-05-05",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 45,
     "engagement": 4
    },
    {
     "month": "2026-03",
     "submitted": "2026-04-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 35,
     "engagement": 4
    },
    {
     "month": "2026-02",
     "submitted": "2026-03-07",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 30,
     "engagement": 3
    }
   ],
   "team": [
    {
     "person": "Elena Garcia",
     "role": "Project Leader",
     "fte": [
      40,
      40,
      45,
      40,
      40,
      40
     ]
    },
    {
     "person": "Nina Schulz",
     "role": "Deputy",
     "fte": [
      20,
      20,
      20,
      25,
      10,
      10
     ]
    },
    {
     "person": "Priya Kumar",
     "role": "Developer",
     "fte": [
      30,
      20,
      30,
      30,
      30,
      30
     ]
    },
    {
     "person": "Olivia White",
     "role": "Change Manager",
     "fte": [
      20,
      25,
      20,
      25,
      20,
      20
     ]
    },
    {
     "person": "Giorgio Pellegrini",
     "role": "Solution Architect",
     "fte": [
      30,
      35,
      30,
      35,
      30,
      35
     ]
    }
   ]
  },
  {
   "id": 10,
   "number": "FIN-602",
   "name": "Group Consolidation & Close Acceleration",
   "type": "ORG",
   "portfolio": "Finance & Corporate",
   "status": "Running",
   "phase": "Planning",
   "phases": [
    "Idea",
    "Planning",
    "Execution",
    "Closing"
   ],
   "priority": "Medium",
   "lead": "Maya Kapoor",
   "sponsor": "Elena Rostova",
   "sponsorTitle": "Finance Director",
   "deputy": null,
   "start": "2026-06-01",
   "end": "2027-05-28",
   "erp": "ORG.2026.163",
   "rag": {
    "overall": "Green",
    "timeline": "Green",
    "budget": "Green",
    "resources": "Yellow",
    "scope": "Green"
   },
   "ragReason": null,
   "goal": "Deliver the Group Consolidation & Close Acceleration programme on time and within budget, with measurable adoption by the business.",
   "scope": "In scope: process design, configuration, data migration, testing, training and hypercare. Out of scope: changes to upstream legacy systems.",
   "success": "Go-live without critical defects; 90% of users trained; benefits tracked monthly in the portfolio review.",
   "achievements": "Design signed off and build sprint 3 completed; key users from two sites nominated for testing.",
   "nextSteps": "Complete system testing, run UAT with key users from two sites, and prepare the go-live readiness review.",
   "outputPct": 35,
   "engagement": 4,
   "riskExposure": 42000,
   "financials": {
    "opexBudget": 260400,
    "opexActual": 81840,
    "opexPlanYear": 142800,
    "opexActualYtd": 59400,
    "capexBudget": 159600,
    "capexActual": 50160,
    "capexPlanYear": 84000,
    "capexActualYtd": 35640
   },
   "lastFinanceUpdate": "2026-09-15",
   "milestones": [
    {
     "id": "FIN-602-M01",
     "name": "Project kickoff",
     "type": "Kickoff",
     "baseline": "2026-06-25",
     "forecast": "2026-06-25",
     "actual": "2026-06-25",
     "status": "Completed",
     "show": true
    },
    {
     "id": "FIN-602-M02",
     "name": "Business case approval",
     "type": "Approval",
     "baseline": "2026-08-04",
     "forecast": "2026-08-04",
     "actual": "2026-08-04",
     "status": "Completed",
     "show": true
    },
    {
     "id": "FIN-602-M03",
     "name": "Design review",
     "type": "Review",
     "baseline": "2026-09-13",
     "forecast": "2026-09-13",
     "actual": "2026-09-13",
     "status": "Completed",
     "show": false
    },
    {
     "id": "FIN-602-M04",
     "name": "Gate: Execution approval",
     "type": "Gate",
     "baseline": "2026-10-23",
     "forecast": "2026-10-23",
     "actual": null,
     "status": "On Track",
     "show": true
    },
    {
     "id": "FIN-602-M05",
     "name": "Integration build complete",
     "type": "Technical",
     "baseline": "2026-12-02",
     "forecast": "2026-12-02",
     "actual": null,
     "status": "On Track",
     "show": true
    },
    {
     "id": "FIN-602-M06",
     "name": "System test complete",
     "type": "Test",
     "baseline": "2027-01-11",
     "forecast": "2027-01-09",
     "actual": null,
     "status": "On Track",
     "show": false
    },
    {
     "id": "FIN-602-M07",
     "name": "User acceptance testing",
     "type": "UAT",
     "baseline": "2027-02-20",
     "forecast": "2027-02-23",
     "actual": null,
     "status": "Not Started",
     "show": true
    },
    {
     "id": "FIN-602-M08",
     "name": "End-user training",
     "type": "Training",
     "baseline": "2027-04-01",
     "forecast": "2027-04-04",
     "actual": null,
     "status": "Not Started",
     "show": true
    },
    {
     "id": "FIN-602-M09",
     "name": "Go-live",
     "type": "Go-Live",
     "baseline": "2027-05-11",
     "forecast": "2027-05-14",
     "actual": null,
     "status": "Not Started",
     "show": true
    }
   ],
   "risks": [
    {
     "id": "R-091",
     "type": "Risk",
     "description": "Parallel ERP cut-over competes for the same test environments",
     "category": "Schedule",
     "likelihood": "Medium",
     "impact": "Medium",
     "rating": "Medium",
     "status": "Open",
     "owner": "Felix Braun",
     "raised": "2026-06-16",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": 35000
    },
    {
     "id": "R-092",
     "type": "Risk",
     "description": "Change-management lead leaves at the end of the quarter",
     "category": "Resource",
     "likelihood": "Low",
     "impact": "Low",
     "rating": "Low",
     "status": "Mitigating",
     "owner": "Maya Kapoor",
     "raised": "2026-07-09",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": 140000
    },
    {
     "id": "R-093",
     "type": "Risk",
     "description": "Regulatory guidance on e-invoicing still being finalised",
     "category": "Other",
     "likelihood": "High",
     "impact": "Low",
     "rating": "Medium",
     "status": "Open",
     "owner": "Nina Schulz",
     "raised": "2026-08-01",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": 20000
    },
    {
     "id": "R-094",
     "type": "Risk",
     "description": "Key vendor delivery may slip past the integration test window",
     "category": "Schedule",
     "likelihood": "Medium",
     "impact": "Low",
     "rating": "Low",
     "status": "Resolved",
     "owner": "Nina Schulz",
     "raised": "2026-08-24",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": null
    }
   ],
   "changeRequests": [
    {
     "number": "CR-01",
     "date": "2026-07-11",
     "title": "Extend scope to site B warehouse",
     "category": "Scope",
     "impact": "+€45k, +3 weeks",
     "status": "Approved",
     "requestedBy": "Elena Rostova"
    }
   ],
   "decisions": [],
   "statusHistory": [
    {
     "month": "2026-09",
     "submitted": "2026-09-05",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Yellow",
     "scope": "Green",
     "outputPct": 35,
     "engagement": 4
    },
    {
     "month": "2026-08",
     "submitted": "2026-09-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Yellow",
     "resources": "Yellow",
     "scope": "Yellow",
     "outputPct": 30,
     "engagement": 4
    },
    {
     "month": "2026-07",
     "submitted": "2026-08-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Yellow",
     "resources": "Yellow",
     "scope": "Green",
     "outputPct": 25,
     "engagement": 4
    },
    {
     "month": "2026-06",
     "submitted": "2026-07-05",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Yellow",
     "scope": "Green",
     "outputPct": 15,
     "engagement": 4
    }
   ],
   "team": [
    {
     "person": "Maya Kapoor",
     "role": "Project Leader",
     "fte": [
      20,
      20,
      30,
      30,
      35,
      30
     ]
    },
    {
     "person": "Kenji Sato",
     "role": "Developer",
     "fte": [
      20,
      30,
      35,
      30,
      35,
      20
     ]
    },
    {
     "person": "James Okafor",
     "role": "QA Lead",
     "fte": [
      25,
      25,
      10,
      10,
      25,
      25
     ]
    },
    {
     "person": "Yusuf Malik",
     "role": "Data Analyst",
     "fte": [
      10,
      20,
      10,
      10,
      20,
      20
     ]
    }
   ]
  },
  {
   "id": 11,
   "number": "DIG-701",
   "name": "Customer Data Platform & Consent Management",
   "type": "PRO",
   "portfolio": "Customer & Digital",
   "status": "Running",
   "phase": "Execution",
   "phases": [
    "Idea",
    "Concept",
    "Planning",
    "Execution",
    "Launch",
    "Closing"
   ],
   "priority": "High",
   "lead": "Tom Becker",
   "sponsor": "Jessica Miller",
   "sponsorTitle": "Commercial Director",
   "deputy": "Nina Schulz",
   "start": "2026-03-16",
   "end": "2027-02-12",
   "erp": "PRO.2026.170",
   "rag": {
    "overall": "Yellow",
    "timeline": "Green",
    "budget": "Yellow",
    "resources": "Yellow",
    "scope": "Green"
   },
   "ragReason": "Timeline flagged Yellow: supplier deliveries are two weeks late; recovery plan agreed with the sponsor.",
   "goal": "Deliver the Customer Data Platform & Consent Management programme on time and within budget, with measurable adoption by the business.",
   "scope": "In scope: process design, configuration, data migration, testing, training and hypercare. Out of scope: changes to upstream legacy systems.",
   "success": "Go-live without critical defects; 90% of users trained; benefits tracked monthly in the portfolio review.",
   "achievements": "Design signed off and build sprint 3 completed; key users from two sites nominated for testing.",
   "nextSteps": "Complete system testing, run UAT with key users from two sites, and prepare the go-live readiness review.",
   "outputPct": 50,
   "engagement": 3,
   "riskExposure": 108800,
   "financials": {
    "opexBudget": 483600,
    "opexActual": 261020,
    "opexPlanYear": 265200,
    "opexActualYtd": 189450,
    "capexBudget": 296400,
    "capexActual": 159980,
    "capexPlanYear": 156000,
    "capexActualYtd": 113670
   },
   "lastFinanceUpdate": "2026-09-15",
   "milestones": [
    {
     "id": "DIG-701-M01",
     "name": "Project kickoff",
     "type": "Kickoff",
     "baseline": "2026-04-07",
     "forecast": "2026-04-07",
     "actual": "2026-04-07",
     "status": "Completed",
     "show": true
    },
    {
     "id": "DIG-701-M02",
     "name": "Business case approval",
     "type": "Approval",
     "baseline": "2026-05-14",
     "forecast": "2026-05-14",
     "actual": "2026-05-14",
     "status": "Completed",
     "show": true
    },
    {
     "id": "DIG-701-M03",
     "name": "Design review",
     "type": "Review",
     "baseline": "2026-06-20",
     "forecast": "2026-06-20",
     "actual": "2026-06-20",
     "status": "Completed",
     "show": false
    },
    {
     "id": "DIG-701-M04",
     "name": "Gate: Planning approval",
     "type": "Gate",
     "baseline": "2026-07-27",
     "forecast": "2026-07-27",
     "actual": "2026-07-27",
     "status": "Completed",
     "show": true
    },
    {
     "id": "DIG-701-M05",
     "name": "Integration build complete",
     "type": "Technical",
     "baseline": "2026-09-02",
     "forecast": "2026-09-02",
     "actual": "2026-09-02",
     "status": "Completed",
     "show": true
    },
    {
     "id": "DIG-701-M06",
     "name": "System test complete",
     "type": "Test",
     "baseline": "2026-10-09",
     "forecast": "2026-10-12",
     "actual": null,
     "status": "On Track",
     "show": false
    },
    {
     "id": "DIG-701-M07",
     "name": "User acceptance testing",
     "type": "UAT",
     "baseline": "2026-11-15",
     "forecast": "2026-11-13",
     "actual": null,
     "status": "On Track",
     "show": true
    },
    {
     "id": "DIG-701-M08",
     "name": "End-user training",
     "type": "Training",
     "baseline": "2026-12-22",
     "forecast": "2026-12-22",
     "actual": null,
     "status": "On Track",
     "show": true
    },
    {
     "id": "DIG-701-M09",
     "name": "Go-live",
     "type": "Go-Live",
     "baseline": "2027-01-28",
     "forecast": "2027-01-28",
     "actual": null,
     "status": "Not Started",
     "show": true
    }
   ],
   "risks": [
    {
     "id": "R-101",
     "type": "Issue",
     "description": "Key vendor delivery may slip past the integration test window",
     "category": "Schedule",
     "likelihood": "Medium",
     "impact": "High",
     "rating": "High",
     "status": "Mitigating",
     "owner": "Felix Braun",
     "raised": "2026-03-31",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": 27000
    },
    {
     "id": "R-102",
     "type": "Risk",
     "description": "Only one SME can configure the interfaces; availability is limited in Q4",
     "category": "Resource",
     "likelihood": "High",
     "impact": "Low",
     "rating": "Medium",
     "status": "Open",
     "owner": "Nina Schulz",
     "raised": "2026-04-23",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": 39000
    },
    {
     "id": "R-103",
     "type": "Risk",
     "description": "Legacy data quality may require more cleansing cycles than planned",
     "category": "Technical",
     "likelihood": "Medium",
     "impact": "High",
     "rating": "High",
     "status": "Open",
     "owner": "Nina Schulz",
     "raised": "2026-05-16",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": 68000
    },
    {
     "id": "R-104",
     "type": "Risk",
     "description": "Licence price increase at renewal could exceed the approved contingency",
     "category": "Financial",
     "likelihood": "Low",
     "impact": "Medium",
     "rating": "Low",
     "status": "Mitigating",
     "owner": "Nina Schulz",
     "raised": "2026-06-08",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": 273000
    },
    {
     "id": "R-105",
     "type": "Risk",
     "description": "Hardware lead times for scanners have increased to 14 weeks",
     "category": "Supply Chain",
     "likelihood": "Medium",
     "impact": "Low",
     "rating": "Low",
     "status": "Open",
     "owner": "Nina Schulz",
     "raised": "2026-07-01",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": null
    },
    {
     "id": "R-106",
     "type": "Risk",
     "description": "Works council consultation may delay the rollout to site B",
     "category": "Other",
     "likelihood": "Medium",
     "impact": "Low",
     "rating": "Low",
     "status": "Resolved",
     "owner": "Nina Schulz",
     "raised": "2026-07-24",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": null
    }
   ],
   "changeRequests": [
    {
     "number": "CR-01",
     "date": "2026-04-25",
     "title": "Extend scope to site B warehouse",
     "category": "Scope",
     "impact": "+€45k, +3 weeks",
     "status": "Approved",
     "requestedBy": "Jessica Miller"
    },
    {
     "number": "CR-02",
     "date": "2026-06-14",
     "title": "Add Power BI executive dashboard",
     "category": "Scope",
     "impact": "+€18k, no schedule impact",
     "status": "Submitted",
     "requestedBy": "Jessica Miller"
    }
   ],
   "decisions": [],
   "statusHistory": [
    {
     "month": "2026-09",
     "submitted": null,
     "overall": "Yellow",
     "timeline": "Green",
     "budget": "Yellow",
     "resources": "Yellow",
     "scope": "Green",
     "outputPct": 50,
     "engagement": 3
    },
    {
     "month": "2026-08",
     "submitted": "2026-09-04",
     "overall": "Yellow",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Yellow",
     "scope": "Green",
     "outputPct": 45,
     "engagement": 3
    },
    {
     "month": "2026-07",
     "submitted": "2026-08-04",
     "overall": "Yellow",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Yellow",
     "scope": "Green",
     "outputPct": 40,
     "engagement": 2
    },
    {
     "month": "2026-06",
     "submitted": "2026-07-05",
     "overall": "Yellow",
     "timeline": "Yellow",
     "budget": "Green",
     "resources": "Yellow",
     "scope": "Yellow",
     "outputPct": 30,
     "engagement": 2
    },
    {
     "month": "2026-05",
     "submitted": "2026-06-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 25,
     "engagement": 3
    },
    {
     "month": "2026-04",
     "submitted": "2026-05-05",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 20,
     "engagement": 2
    },
    {
     "month": "2026-03",
     "submitted": "2026-04-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 15,
     "engagement": 3
    }
   ],
   "team": [
    {
     "person": "Tom Becker",
     "role": "Project Leader",
     "fte": [
      55,
      55,
      50,
      50,
      50,
      50
     ]
    },
    {
     "person": "Nina Schulz",
     "role": "Deputy",
     "fte": [
      15,
      10,
      10,
      0,
      10,
      10
     ]
    },
    {
     "person": "Anna Berg",
     "role": "Test Analyst",
     "fte": [
      15,
      0,
      10,
      0,
      10,
      10
     ]
    },
    {
     "person": "Hannah Novak",
     "role": "Trainer",
     "fte": [
      25,
      25,
      20,
      20,
      20,
      20
     ]
    },
    {
     "person": "Ingrid Eriksen",
     "role": "Business Analyst",
     "fte": [
      0,
      10,
      10,
      10,
      10,
      10
     ]
    }
   ]
  },
  {
   "id": 12,
   "number": "OPS-303",
   "name": "Supplier Quality Portal",
   "type": "PRO",
   "portfolio": "Operations & Supply Chain",
   "status": "On Hold",
   "phase": "Concept",
   "phases": [
    "Idea",
    "Concept",
    "Planning",
    "Execution",
    "Launch",
    "Closing"
   ],
   "priority": "Low",
   "lead": "Liam O'Connor",
   "sponsor": "Marcus Brody",
   "sponsorTitle": "Director of Supply Chain",
   "deputy": null,
   "start": "2026-05-11",
   "end": "2027-01-15",
   "erp": "PRO.2026.177",
   "rag": {
    "overall": "Yellow",
    "timeline": "Yellow",
    "budget": "Green",
    "resources": "Yellow",
    "scope": "Green"
   },
   "ragReason": "Timeline flagged Yellow: supplier deliveries are two weeks late; recovery plan agreed with the sponsor.",
   "goal": "Deliver the Supplier Quality Portal programme on time and within budget, with measurable adoption by the business.",
   "scope": "In scope: process design, configuration, data migration, testing, training and hypercare. Out of scope: changes to upstream legacy systems.",
   "success": "Go-live without critical defects; 90% of users trained; benefits tracked monthly in the portfolio review.",
   "achievements": "Design signed off and build sprint 3 completed; key users from two sites nominated for testing.",
   "nextSteps": "Complete system testing, run UAT with key users from two sites, and prepare the go-live readiness review.",
   "outputPct": 40,
   "engagement": 3,
   "riskExposure": 35800,
   "financials": {
    "opexBudget": 186000,
    "opexActual": 74400,
    "opexPlanYear": 102000,
    "opexActualYtd": 54000,
    "capexBudget": 114000,
    "capexActual": 45600,
    "capexPlanYear": 60000,
    "capexActualYtd": 32400
   },
   "lastFinanceUpdate": "2026-09-15",
   "milestones": [
    {
     "id": "OPS-303-M01",
     "name": "Project kickoff",
     "type": "Kickoff",
     "baseline": "2026-05-27",
     "forecast": "2026-05-27",
     "actual": "2026-05-27",
     "status": "Completed",
     "show": true
    },
    {
     "id": "OPS-303-M02",
     "name": "Business case approval",
     "type": "Approval",
     "baseline": "2026-06-24",
     "forecast": "2026-06-24",
     "actual": "2026-06-24",
     "status": "Completed",
     "show": true
    },
    {
     "id": "OPS-303-M03",
     "name": "Design review",
     "type": "Review",
     "baseline": "2026-07-21",
     "forecast": "2026-07-21",
     "actual": "2026-07-21",
     "status": "Completed",
     "show": false
    },
    {
     "id": "OPS-303-M04",
     "name": "Gate: Planning approval",
     "type": "Gate",
     "baseline": "2026-08-18",
     "forecast": "2026-08-18",
     "actual": "2026-08-18",
     "status": "Completed",
     "show": true
    },
    {
     "id": "OPS-303-M05",
     "name": "Integration build complete",
     "type": "Technical",
     "baseline": "2026-09-15",
     "forecast": "2026-09-15",
     "actual": "2026-09-15",
     "status": "Completed",
     "show": true
    },
    {
     "id": "OPS-303-M06",
     "name": "System test complete",
     "type": "Test",
     "baseline": "2026-10-12",
     "forecast": "2026-10-12",
     "actual": null,
     "status": "On Track",
     "show": false
    },
    {
     "id": "OPS-303-M07",
     "name": "User acceptance testing",
     "type": "UAT",
     "baseline": "2026-11-09",
     "forecast": "2026-11-16",
     "actual": null,
     "status": "At Risk",
     "show": true
    },
    {
     "id": "OPS-303-M08",
     "name": "End-user training",
     "type": "Training",
     "baseline": "2026-12-07",
     "forecast": "2026-12-21",
     "actual": null,
     "status": "Delayed",
     "show": true
    },
    {
     "id": "OPS-303-M09",
     "name": "Go-live",
     "type": "Go-Live",
     "baseline": "2027-01-03",
     "forecast": "2027-01-03",
     "actual": null,
     "status": "On Track",
     "show": true
    }
   ],
   "risks": [
    {
     "id": "R-111",
     "type": "Issue",
     "description": "Licence price increase at renewal could exceed the approved contingency",
     "category": "Financial",
     "likelihood": "Medium",
     "impact": "Medium",
     "rating": "Medium",
     "status": "Open",
     "owner": "Liam O'Connor",
     "raised": "2026-05-26",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": 9000
    },
    {
     "id": "R-112",
     "type": "Risk",
     "description": "Hardware lead times for scanners have increased to 14 weeks",
     "category": "Supply Chain",
     "likelihood": "Medium",
     "impact": "High",
     "rating": "High",
     "status": "Open",
     "owner": "Liam O'Connor",
     "raised": "2026-06-18",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": 22000
    },
    {
     "id": "R-113",
     "type": "Risk",
     "description": "Works council consultation may delay the rollout to site B",
     "category": "Other",
     "likelihood": "Low",
     "impact": "Low",
     "rating": "Low",
     "status": "Open",
     "owner": "Liam O'Connor",
     "raised": "2026-07-11",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": 90000
    },
    {
     "id": "R-114",
     "type": "Risk",
     "description": "Performance of the reporting layer not yet proven at full data volume",
     "category": "Technical",
     "likelihood": "Low",
     "impact": "Low",
     "rating": "Low",
     "status": "Monitoring",
     "owner": "Liam O'Connor",
     "raised": "2026-08-03",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": null
    },
    {
     "id": "R-115",
     "type": "Risk",
     "description": "Parallel ERP cut-over competes for the same test environments",
     "category": "Schedule",
     "likelihood": "Low",
     "impact": "High",
     "rating": "Medium",
     "status": "Open",
     "owner": "Liam O'Connor",
     "raised": "2026-08-26",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": 90000
    },
    {
     "id": "R-116",
     "type": "Risk",
     "description": "Change-management lead leaves at the end of the quarter",
     "category": "Resource",
     "likelihood": "Low",
     "impact": "Medium",
     "rating": "Low",
     "status": "Monitoring",
     "owner": "Liam O'Connor",
     "raised": "2026-09-18",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": null
    },
    {
     "id": "R-117",
     "type": "Risk",
     "description": "Regulatory guidance on e-invoicing still being finalised",
     "category": "Other",
     "likelihood": "Low",
     "impact": "Medium",
     "rating": "Low",
     "status": "Resolved",
     "owner": "Liam O'Connor",
     "raised": "2026-09-24",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": null
    }
   ],
   "changeRequests": [
    {
     "number": "CR-01",
     "date": "2026-06-20",
     "title": "Extend scope to site B warehouse",
     "category": "Scope",
     "impact": "+€45k, +3 weeks",
     "status": "Approved",
     "requestedBy": "Marcus Brody"
    },
    {
     "number": "CR-02",
     "date": "2026-08-09",
     "title": "Add Power BI executive dashboard",
     "category": "Scope",
     "impact": "+€18k, no schedule impact",
     "status": "Submitted",
     "requestedBy": "Marcus Brody"
    },
    {
     "number": "CR-03",
     "date": "2026-09-28",
     "title": "Shift go-live by two weeks for peak season",
     "category": "Schedule",
     "impact": "No cost impact, +2 weeks",
     "status": "Approved",
     "requestedBy": "Marcus Brody"
    }
   ],
   "decisions": [],
   "statusHistory": [
    {
     "month": "2026-09",
     "submitted": "2026-09-05",
     "overall": "Yellow",
     "timeline": "Yellow",
     "budget": "Green",
     "resources": "Yellow",
     "scope": "Green",
     "outputPct": 40,
     "engagement": 3
    },
    {
     "month": "2026-08",
     "submitted": "2026-09-04",
     "overall": "Yellow",
     "timeline": "Yellow",
     "budget": "Green",
     "resources": "Yellow",
     "scope": "Green",
     "outputPct": 35,
     "engagement": 2
    },
    {
     "month": "2026-07",
     "submitted": "2026-08-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Yellow",
     "scope": "Yellow",
     "outputPct": 30,
     "engagement": 3
    },
    {
     "month": "2026-06",
     "submitted": "2026-07-05",
     "overall": "Green",
     "timeline": "Yellow",
     "budget": "Yellow",
     "resources": "Yellow",
     "scope": "Green",
     "outputPct": 20,
     "engagement": 2
    },
    {
     "month": "2026-05",
     "submitted": "2026-06-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 15,
     "engagement": 2
    }
   ],
   "team": [
    {
     "person": "Liam O'Connor",
     "role": "Project Leader",
     "fte": [
      0,
      0,
      0,
      0,
      0,
      0
     ]
    },
    {
     "person": "Rafael Fernandes",
     "role": "Integration Specialist",
     "fte": [
      0,
      0,
      0,
      0,
      0,
      0
     ]
    },
    {
     "person": "Olivia White",
     "role": "Change Manager",
     "fte": [
      0,
      0,
      0,
      0,
      0,
      0
     ]
    },
    {
     "person": "Yusuf Malik",
     "role": "Data Analyst",
     "fte": [
      0,
      0,
      0,
      0,
      0,
      0
     ]
    }
   ]
  },
  {
   "id": 13,
   "number": "FAC-401",
   "name": "Central Distribution Center Mezzanine Expansion",
   "type": "ORG",
   "portfolio": "Operations & Supply Chain",
   "status": "Closed",
   "phase": "Closing",
   "phases": [
    "Idea",
    "Planning",
    "Execution",
    "Closing"
   ],
   "priority": "Medium",
   "lead": "Sarah Jenkins",
   "sponsor": "Michael Chang",
   "sponsorTitle": "COO",
   "deputy": null,
   "start": "2025-09-01",
   "end": "2026-08-28",
   "erp": "ORG.2026.184",
   "rag": {
    "overall": "Green",
    "timeline": "Green",
    "budget": "Green",
    "resources": "Green",
    "scope": "Green"
   },
   "ragReason": null,
   "goal": "Deliver the Central Distribution Center Mezzanine Expansion programme on time and within budget, with measurable adoption by the business.",
   "scope": "In scope: process design, configuration, data migration, testing, training and hypercare. Out of scope: changes to upstream legacy systems.",
   "success": "Go-live without critical defects; 90% of users trained; benefits tracked monthly in the portfolio review.",
   "achievements": "Design signed off and build sprint 3 completed; key users from two sites nominated for testing.",
   "nextSteps": "Complete system testing, run UAT with key users from two sites, and prepare the go-live readiness review.",
   "outputPct": 100,
   "engagement": 4,
   "riskExposure": 0,
   "financials": {
    "opexBudget": 837000,
    "opexActual": 820260,
    "opexPlanYear": 459000,
    "opexActualYtd": 595350,
    "capexBudget": 513000,
    "capexActual": 502740,
    "capexPlanYear": 270000,
    "capexActualYtd": 357210
   },
   "lastFinanceUpdate": "2026-09-15",
   "milestones": [
    {
     "id": "FAC-401-M01",
     "name": "Project kickoff",
     "type": "Kickoff",
     "baseline": "2025-09-25",
     "forecast": "2025-09-25",
     "actual": "2025-09-25",
     "status": "Completed",
     "show": true
    },
    {
     "id": "FAC-401-M02",
     "name": "Business case approval",
     "type": "Approval",
     "baseline": "2025-11-04",
     "forecast": "2025-11-04",
     "actual": "2025-11-04",
     "status": "Completed",
     "show": true
    },
    {
     "id": "FAC-401-M03",
     "name": "Design review",
     "type": "Review",
     "baseline": "2025-12-14",
     "forecast": "2025-12-14",
     "actual": "2025-12-14",
     "status": "Completed",
     "show": false
    },
    {
     "id": "FAC-401-M04",
     "name": "Gate: Execution approval",
     "type": "Gate",
     "baseline": "2026-01-23",
     "forecast": "2026-01-23",
     "actual": "2026-01-23",
     "status": "Completed",
     "show": true
    },
    {
     "id": "FAC-401-M05",
     "name": "Integration build complete",
     "type": "Technical",
     "baseline": "2026-03-04",
     "forecast": "2026-03-04",
     "actual": "2026-03-04",
     "status": "Completed",
     "show": true
    },
    {
     "id": "FAC-401-M06",
     "name": "System test complete",
     "type": "Test",
     "baseline": "2026-04-13",
     "forecast": "2026-04-13",
     "actual": "2026-04-13",
     "status": "Completed",
     "show": false
    },
    {
     "id": "FAC-401-M07",
     "name": "User acceptance testing",
     "type": "UAT",
     "baseline": "2026-05-23",
     "forecast": "2026-05-23",
     "actual": "2026-05-23",
     "status": "Completed",
     "show": true
    },
    {
     "id": "FAC-401-M08",
     "name": "End-user training",
     "type": "Training",
     "baseline": "2026-07-02",
     "forecast": "2026-06-30",
     "actual": "2026-06-30",
     "status": "Completed",
     "show": true
    },
    {
     "id": "FAC-401-M09",
     "name": "Go-live",
     "type": "Go-Live",
     "baseline": "2026-08-11",
     "forecast": "2026-08-11",
     "actual": "2026-08-11",
     "status": "Completed",
     "show": true
    }
   ],
   "risks": [
    {
     "id": "R-121",
     "type": "Risk",
     "description": "Performance of the reporting layer not yet proven at full data volume",
     "category": "Technical",
     "likelihood": "High",
     "impact": "High",
     "rating": "Critical",
     "status": "Closed",
     "owner": "Nina Schulz",
     "raised": "2025-09-16",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": null
    },
    {
     "id": "R-122",
     "type": "Risk",
     "description": "Parallel ERP cut-over competes for the same test environments",
     "category": "Schedule",
     "likelihood": "Medium",
     "impact": "Medium",
     "rating": "Medium",
     "status": "Closed",
     "owner": "Sarah Jenkins",
     "raised": "2025-10-09",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": null
    },
    {
     "id": "R-123",
     "type": "Risk",
     "description": "Change-management lead leaves at the end of the quarter",
     "category": "Resource",
     "likelihood": "Low",
     "impact": "Low",
     "rating": "Low",
     "status": "Closed",
     "owner": "Felix Braun",
     "raised": "2025-11-01",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": null
    }
   ],
   "changeRequests": [
    {
     "number": "CR-01",
     "date": "2025-10-11",
     "title": "Extend scope to site B warehouse",
     "category": "Scope",
     "impact": "+€45k, +3 weeks",
     "status": "Approved",
     "requestedBy": "Michael Chang"
    }
   ],
   "decisions": [],
   "statusHistory": [
    {
     "month": "2026-09",
     "submitted": "2026-09-05",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 100,
     "engagement": 4
    },
    {
     "month": "2026-08",
     "submitted": "2026-09-04",
     "overall": "Green",
     "timeline": "Yellow",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 90,
     "engagement": 5
    },
    {
     "month": "2026-07",
     "submitted": "2026-08-04",
     "overall": "Yellow",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 80,
     "engagement": 5
    },
    {
     "month": "2026-06",
     "submitted": "2026-07-05",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 70,
     "engagement": 4
    },
    {
     "month": "2026-05",
     "submitted": "2026-06-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 60,
     "engagement": 3
    },
    {
     "month": "2026-04",
     "submitted": "2026-05-05",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 50,
     "engagement": 5
    },
    {
     "month": "2026-03",
     "submitted": "2026-04-04",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 40,
     "engagement": 5
    },
    {
     "month": "2026-02",
     "submitted": "2026-03-07",
     "overall": "Green",
     "timeline": "Green",
     "budget": "Green",
     "resources": "Green",
     "scope": "Green",
     "outputPct": 30,
     "engagement": 4
    }
   ],
   "team": [
    {
     "person": "Sarah Jenkins",
     "role": "Project Leader",
     "fte": [
      0,
      0,
      0,
      0,
      0,
      0
     ]
    },
    {
     "person": "Rafael Fernandes",
     "role": "Integration Specialist",
     "fte": [
      0,
      0,
      0,
      0,
      0,
      0
     ]
    },
    {
     "person": "Priya Kumar",
     "role": "Developer",
     "fte": [
      0,
      0,
      0,
      0,
      0,
      0
     ]
    },
    {
     "person": "Chloe Laurent",
     "role": "UX Designer",
     "fte": [
      0,
      0,
      0,
      0,
      0,
      0
     ]
    }
   ]
  },
  {
   "id": 14,
   "number": "DIG-702",
   "name": "AI Service Desk Assistant Pilot",
   "type": "RES",
   "portfolio": "Customer & Digital",
   "status": "Not Started",
   "phase": "Idea",
   "phases": [
    "Idea",
    "Feasibility",
    "Prototype",
    "Validation",
    "Transfer"
   ],
   "priority": "Medium",
   "lead": "Maya Kapoor",
   "sponsor": "David Vance",
   "sponsorTitle": "VP Technology & Risk",
   "deputy": null,
   "start": "2026-10-19",
   "end": "2027-04-30",
   "erp": "RES.2026.191",
   "rag": {
    "overall": "Unclear",
    "timeline": "Unclear",
    "budget": "Unclear",
    "resources": "Unclear",
    "scope": "Unclear"
   },
   "ragReason": null,
   "goal": "Deliver the AI Service Desk Assistant Pilot programme on time and within budget, with measurable adoption by the business.",
   "scope": "In scope: process design, configuration, data migration, testing, training and hypercare. Out of scope: changes to upstream legacy systems.",
   "success": "Go-live without critical defects; 90% of users trained; benefits tracked monthly in the portfolio review.",
   "achievements": "Design signed off and build sprint 3 completed; key users from two sites nominated for testing.",
   "nextSteps": "Complete system testing, run UAT with key users from two sites, and prepare the go-live readiness review.",
   "outputPct": null,
   "engagement": null,
   "riskExposure": 0,
   "financials": {
    "opexBudget": 161200,
    "opexActual": 0,
    "opexPlanYear": 88400,
    "opexActualYtd": 0,
    "capexBudget": 98800,
    "capexActual": 0,
    "capexPlanYear": 52000,
    "capexActualYtd": 0
   },
   "lastFinanceUpdate": "2026-09-15",
   "milestones": [
    {
     "id": "DIG-702-M01",
     "name": "Project kickoff",
     "type": "Kickoff",
     "baseline": "2026-10-31",
     "forecast": "2026-10-31",
     "actual": null,
     "status": "On Track",
     "show": true
    },
    {
     "id": "DIG-702-M02",
     "name": "Business case approval",
     "type": "Approval",
     "baseline": "2026-11-22",
     "forecast": "2026-11-22",
     "actual": null,
     "status": "On Track",
     "show": true
    },
    {
     "id": "DIG-702-M03",
     "name": "Design review",
     "type": "Review",
     "baseline": "2026-12-13",
     "forecast": "2026-12-13",
     "actual": null,
     "status": "On Track",
     "show": false
    },
    {
     "id": "DIG-702-M04",
     "name": "Gate: Prototype approval",
     "type": "Gate",
     "baseline": "2027-01-04",
     "forecast": "2027-01-04",
     "actual": null,
     "status": "On Track",
     "show": true
    },
    {
     "id": "DIG-702-M05",
     "name": "Integration build complete",
     "type": "Technical",
     "baseline": "2027-01-25",
     "forecast": "2027-01-25",
     "actual": null,
     "status": "Not Started",
     "show": true
    },
    {
     "id": "DIG-702-M06",
     "name": "System test complete",
     "type": "Test",
     "baseline": "2027-02-16",
     "forecast": "2027-02-19",
     "actual": null,
     "status": "Not Started",
     "show": false
    },
    {
     "id": "DIG-702-M07",
     "name": "User acceptance testing",
     "type": "UAT",
     "baseline": "2027-03-09",
     "forecast": "2027-03-12",
     "actual": null,
     "status": "Not Started",
     "show": true
    },
    {
     "id": "DIG-702-M08",
     "name": "End-user training",
     "type": "Training",
     "baseline": "2027-03-30",
     "forecast": "2027-03-30",
     "actual": null,
     "status": "Not Started",
     "show": true
    },
    {
     "id": "DIG-702-M09",
     "name": "Go-live",
     "type": "Go-Live",
     "baseline": "2027-04-21",
     "forecast": "2027-04-19",
     "actual": null,
     "status": "Not Started",
     "show": true
    }
   ],
   "risks": [
    {
     "id": "R-131",
     "type": "Risk",
     "description": "Regulatory guidance on e-invoicing still being finalised",
     "category": "Other",
     "likelihood": "Medium",
     "impact": "Low",
     "rating": "Low",
     "status": "Monitoring",
     "owner": "Maya Kapoor",
     "raised": "2026-09-24",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": null
    },
    {
     "id": "R-132",
     "type": "Risk",
     "description": "Key vendor delivery may slip past the integration test window",
     "category": "Schedule",
     "likelihood": "Low",
     "impact": "Low",
     "rating": "Low",
     "status": "Monitoring",
     "owner": "Felix Braun",
     "raised": "2026-09-24",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": null
    },
    {
     "id": "R-133",
     "type": "Risk",
     "description": "Only one SME can configure the interfaces; availability is limited in Q4",
     "category": "Resource",
     "likelihood": "Medium",
     "impact": "Low",
     "rating": "Low",
     "status": "Open",
     "owner": "Nina Schulz",
     "raised": "2026-09-24",
     "mitigation": "Weekly checkpoint with the supplier; fallback plan agreed with the sponsor.",
     "exposure": null
    },
    {
     "id": "R-134",
     "type": "Risk",
     "description": "Legacy data quality may require more cleansing cycles than planned",
     "category": "Technical",
     "likelihood": "Medium",
     "impact": "High",
     "rating": "High",
     "status": "Resolved",
     "owner": "Nina Schulz",
     "raised": "2026-09-24",
     "mitigation": "Second SME being trained; knowledge transfer sessions scheduled.",
     "exposure": null
    }
   ],
   "changeRequests": [
    {
     "number": "CR-01",
     "date": "2026-11-28",
     "title": "Extend scope to site B warehouse",
     "category": "Scope",
     "impact": "+€45k, +3 weeks",
     "status": "Approved",
     "requestedBy": "David Vance"
    },
    {
     "number": "CR-02",
     "date": "2027-01-17",
     "title": "Add Power BI executive dashboard",
     "category": "Scope",
     "impact": "+€18k, no schedule impact",
     "status": "Submitted",
     "requestedBy": "David Vance"
    }
   ],
   "decisions": [],
   "statusHistory": [],
   "team": [
    {
     "person": "Maya Kapoor",
     "role": "Project Leader",
     "fte": [
      0,
      0,
      0,
      0,
      0,
      0
     ]
    },
    {
     "person": "Rafael Fernandes",
     "role": "Integration Specialist",
     "fte": [
      0,
      0,
      0,
      0,
      0,
      0
     ]
    },
    {
     "person": "Ingrid Eriksen",
     "role": "Business Analyst",
     "fte": [
      0,
      0,
      0,
      0,
      0,
      0
     ]
    },
    {
     "person": "James Okafor",
     "role": "QA Lead",
     "fte": [
      0,
      0,
      0,
      0,
      0,
      0
     ]
    }
   ]
  }
 ]
};
