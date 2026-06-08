# Artifact generation with Power Automate (no Azure required)

**Yes — we can do all of it with Power Automate.** The original note mentioned an
Azure Function only as one option for running the Blue/Green Sheet skill scripts.
None of that needs Azure. The whole artifact pipeline runs on Power Platform +
Microsoft 365.

## Architecture: brain / hands / memory / files
```
Copilot Studio agent  ──►  Power Automate flows  ──►  M365 file services
   (the BRAIN)               (the HANDS)               (the FILES)
 reasons with the Loop +    create tabs, fill          OneDrive / SharePoint
 Blue/Green Sheet method,   templates, render PDF,      hold the workbook(s),
 produces the structured    return file links          PDFs and coaching docs
 analysis JSON, gets seller
 approval                          │
                                   ▼
                          Dataverse (the SPINE)
                       evidence items, confidence,
                       opportunity links (the living record)
```
The agent already *is* the analysis engine (it runs the Blue/Green Sheet method
from its instructions + the `05-…` knowledge file). Power Automate only has to
**render artifacts** from the approved structured object — it does not need to
"think."

## What replaces the Azure/Python pieces
| Original (Azure / Claude SDK / Python) | Power-Automate-only equivalent | First-party? |
|---|---|---|
| Python `create_meeting_cycle.py` (copy hidden PRE/POST tabs, write header, append index) | **Office Script** run via *Excel Online (Business) → Run script* — see `power-automate/create-meeting-cycle.osts.ts` | ✅ |
| Python populate workbook fields | **Office Script** writes the approved fields to the dated tabs / scorecard | ✅ |
| Render Blue/Green Sheet **PDF** | *Word Online (Business) → Convert Word Document to PDF*, or OneDrive/SharePoint *Convert file* | ✅ |
| Generate **coaching .docx** | *Word Online (Business) → Populate a Microsoft Word template* | ✅ |
| Claude Agent SDK / Azure Function "do the analysis" | The **Copilot Studio agent** itself (Claude or GPT model) produces the structured JSON | ✅ |
| (Optional) call **Anthropic Claude** mid-flow | *HTTP* premium connector → `api.anthropic.com`, key in an **environment variable** — no Azure | ✅ (premium) |

## The four flows
Build these as cloud flows; the agent calls them as **tools** ("Add a flow" in
Copilot Studio) and passes the approved JSON.

**Flow A — Create / append meeting cycle.** Trigger: called by agent (or on a
Dataverse "meeting logged" row). Steps: copy the SSO's master workbook from a
SharePoint "templates" library if it's the first meeting → *Run script*
(`create-meeting-cycle.osts.ts`) with `{meetingDate, phase, account, owner,
attendees}` → return the created tab names. Mirrors the bundled cycle rules
(one workbook per SSO; never overwrite a dated tab silently).

**Flow B — Write approved analysis into the workbook.** Trigger: agent, after the
seller confirms. Steps: *Run script* that writes the approved POST/PRE fields and
any **scorecard** changes into the dated tabs + updates the `CSWP Index`. Keep the
"deltas surfaced before finalize" rule — the agent does the diffing; the flow only
writes confirmed values.

**Flow C — Render PDF.** Steps: either (a) *Convert file* on the workbook/selected
sheet, or (b) populate a Word render template then *Convert Word Document to PDF* →
save to SharePoint → return the share link to the agent.

**Flow D — Coaching document.** Steps: *Populate a Microsoft Word template* with
hypotheses / validation questions / red flags / next-meeting recommendations →
optionally *Convert Word Document to PDF* → save + return link.

## Approval gates (Loop "draft → sanction")
Two equally valid options, no Azure either way:
1. **In-agent:** the Copilot Studio agent presents Confirm/Edit/Reject (Adaptive
   Card) and only calls Flow B/C/D after the seller confirms. Simplest.
2. **Power Automate Approvals:** add an *Approvals → Start and wait for an
   approval* action before any write/render, for an auditable trail (good for
   scorecard changes destined for formal circulation).

## Storage choices
- **Workbooks / PDFs / docx:** SharePoint document library (per account/opportunity
  folder) or OneDrive for Business. SharePoint is better for sharing + ACLs.
- **The Evidence Spine:** Dataverse table keyed by Opportunity Id (as in `02-…`).
  Flows read/write it; the workbook is a *rendered view*, not the source of truth.

## Licensing & gotchas (flag these to your admin)
- **Office Scripts requires a qualifying business M365 license** and the files in
  OneDrive/SharePoint for Business. (Confirmed in MS Learn.)
- **Excel Online (Business)**, **Word Online (Business)**, **SharePoint**,
  **OneDrive** are standard connectors. **HTTP** and **Dataverse** are **premium**
  — covered by a Power Automate premium / Power Apps per-app or the Copilot Studio
  capacity, but confirm your plan.
- **Word "Populate a template" does not support repeating table content controls.**
  Blue/Green Sheets are table-heavy, so for the *workbook* stay in Excel + Office
  Scripts; for *PDF/coaching* either render the Excel to PDF, use SharePoint
  **Syntex "Generate document"** (supports table placeholders via JSON), or a
  premium doc connector (Encodian/Plumsail) if you want pixel-perfect layout.
- Office Scripts **avoid relative references** (no "active sheet") — the bundled
  script uses explicit sheet names, which is why it's Power-Automate-safe.

## If you specifically want the Anthropic Claude model inside a flow
You don't need it for the analysis (the agent covers that), but if you want a
discrete Claude call — e.g. a heavier batch debrief — use the **HTTP** premium
connector: `POST https://api.anthropic.com/v1/messages`, headers
`x-api-key` (from a secured environment variable) + `anthropic-version`, body =
your prompt + the transcript. Still 100% Power Platform, no Azure.

## Bottom line
The Azure mention was optional. Recommended no-Azure path: **Copilot Studio agent
(analysis + approval) → Power Automate (Office Scripts + Word/PDF) → SharePoint +
Dataverse.** Start with Flow A + the Office Script (already written), prove the
rolling PRE/POST cycle, then add B/C/D.
