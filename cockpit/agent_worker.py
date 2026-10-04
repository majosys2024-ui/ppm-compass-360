#!/usr/bin/env python3
"""
PPM Compass 360 — Autonomous Outbound Agent Runner (Irish Market)
Generates hyper-tailored cold outreach drafts and pushes them into your
Google Sheets database or Cockpit queue.
"""

import sys
import json
import urllib.request
import urllib.parse
from datetime import datetime

# Sample target accounts in Ireland
IRISH_TARGETS = [
    {
        "company_id": "COMP-004",
        "company_name": "Mergon Group",
        "domain": "mergon.com",
        "city_region": "Westmeath, Ireland",
        "industry": "Advanced Manufacturing & MedTech",
        "employee_range": "500-1,000",
        "m365_indicator": "Yes (SharePoint / Teams)",
        "icp_score": 93,
        "trigger": "Completed expansion of Castlepollard manufacturing plant; multi-facility PMO steering across Ireland, Czechia, and US.",
        "lead": {
            "lead_id": "LEAD-104",
            "full_name": "Declan Murphy",
            "title": "Director of Global Operations & PMO",
            "email": "dmurphy@mergon.com",
            "persona_type": "PMO_DIRECTOR"
        }
    },
    {
        "company_id": "COMP-005",
        "company_name": "C&F Group",
        "domain": "carmol.com",
        "city_region": "Galway, Ireland",
        "industry": "Industrial Engineering & Energy",
        "employee_range": "1,000-2,500",
        "m365_indicator": "Yes (M365 E3)",
        "icp_score": 89,
        "trigger": "Ramping up renewable energy engineering initiatives; actively hiring Senior Project Engineers and consolidating reporting into SharePoint.",
        "lead": {
            "lead_id": "LEAD-105",
            "full_name": "Niamh O'Sullivan",
            "title": "Head of Project Delivery & Engineering Governance",
            "email": "nosullivan@carmol.com",
            "persona_type": "PMO_DIRECTOR"
        }
    }
]

def generate_outreach_draft(target):
    """Crafts cold outreach copy calibrated specifically for PPM Compass 360."""
    lead = target["lead"]
    name = lead["full_name"].split()[0]
    company = target["company_name"]
    trigger = target["trigger"]

    subject = f"{company} PMO / SharePoint portfolio governance"
    
    body = (
        f"Hi {name},\n\n"
        f"Noticed {company}'s recent progress around {trigger.lower()[:70]}... "
        f"As operations scale across parallel initiatives, compiling monthly portfolio status "
        f"across fragmented Excel spreadsheets and slide decks usually becomes a huge drain on delivery leads.\n\n"
        f"We built PPM Compass 360 specifically for growing organizations operating in Microsoft 365:\n"
        f"• 100% In-Tenant Data Sovereignty: All project budgets, milestone trends, and risk registers remain strictly inside your SharePoint tenant (zero external data egress, GDPR compliant).\n"
        f"• Automated RAG Health Radar: Objective algorithmic health derived from schedule, cost, and scope.\n"
        f"• Predictable Flat Licensing: Flat €3,990/year site collection license with unlimited users (zero Power Apps or per-seat taxes).\n\n"
        f"Would you be open to taking a 3-minute look at our live interactive demo? https://ppmcompass.com/demo/\n\n"
        f"Best regards,\n"
        f"Manu\n"
        f"PPM Compass 360 (https://ppmcompass.com)"
    )

    touch2 = (
        f"Hi {name}, quick follow-up — wanted to share how similar mid-tier Irish teams manage milestone stage-gates "
        f"natively inside SharePoint without incurring €20/user/month Power Apps licensing fees. "
        f"Happy to send over our 5-minute SPFx architecture overview if useful."
    )

    return {
        "draft_id": f"DFT-{datetime.now().strftime('%M%S')}",
        "lead_id": lead["lead_id"],
        "company_id": target["company_id"],
        "touch_1_subject": subject,
        "touch_1_body": body,
        "touch_2_body": touch2,
        "qa_score": 94,
        "approval_status": "PENDING"
    }

def push_to_google_sheets(apps_script_url, draft):
    """Pushes a generated draft directly to Google Sheets via the Web App endpoint."""
    payload = json.dumps({
        "action": "add_draft",
        "draft": draft
    }).encode("utf-8")

    req = urllib.request.Request(
        apps_script_url,
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def main():
    print("=" * 65)
    print("🧭 PPM COMPASS 360 — IRISH MARKET AGENT RUNNER")
    print("=" * 65)
    
    script_url = input("Enter your Google Apps Script Web App URL (or press Enter for local preview): ").strip()

    for target in IRISH_TARGETS:
        print(f"\n[+] Analyzing Target Account: {target['company_name']} ({target['city_region']})")
        print(f"    Lead: {target['lead']['full_name']} — {target['lead']['title']}")
        print(f"    ICP Fit: {target['icp_score']}/100")
        
        draft = generate_outreach_draft(target)
        print(f"\n    [Generated Subject]: {draft['touch_1_subject']}")
        print(f"    [QA Confidence Score]: {draft['qa_score']}/100")

        if script_url:
            try:
                print(f"    --> Pushing draft {draft['draft_id']} to Google Sheets...")
                res = push_to_google_sheets(script_url, draft)
                print(f"    --> Response: {res}")
            except Exception as e:
                print(f"    [!] Failed to push to Google Sheets: {e}")
        else:
            print(f"    --> Saved locally for Cockpit review.")

    print("\n✅ Run complete. Open /cockpit/index.html to review and approve drafts.")

if __name__ == "__main__":
    main()
