# BUILD RUNBOOK — Loop Seller Companion (full build, in order)

Follow these phases top to bottom. Each builds on the previous one, so the agent
is demonstrable after **Phase 6** and complete after **Phase 11**. Don't skip
ahead — later phases assume the names and tables created earlier exist.

> Legend: 🎯 goal · ⛓ depends on · 🛠 steps · ✅ done when

Reference files: `01` instructions · `02` Salesforce tools · `03` starters ·
`04` model · `05` method knowledge · `06` artifacts · `07` v1 quickstart ·
`08` Dataverse schema.

---

## Phase 0 — Prerequisites & licensing
🎯 Have every account, license, and sandbox ready before you build anything.
🛠
- Power Platform environment (with **Dataverse** enabled) + maker access.
- Copilot Studio access in that environment.
- **Salesforce sandbox** + an integration user with **read + write** (create Task,
  update Opportunity, read Account/Contact/OpportunityContactRole).
- Licensing check: Dataverse + HTTP are **premium** connectors; **Office Scripts
  needs a business M365 license**; Excel/Word/SharePoint/OneDrive are standard.
- A SharePoint site (document library) for rendered workbooks/PDFs (Phase 9).
✅ You can sign in to Copilot Studio, see the Dataverse environment, and read a
test Opportunity in the Salesforce sandbox.

---

## Phase 1 — Salesforce prep
🎯 Make the deal data the agent needs readable, and give the Success Frame a home.
⛓ Phase 0.
🛠
- Create the **Salesforce connection** (OAuth) in Power Platform.
- Decide Success-Frame storage (see `02-…` §"Mapping the Success Frame"):
  recommended — add custom fields or a child object on Opportunity
  (`Loop_KPI__c`: Baseline, Target, Horizon, Owner, Confidence, Validated).
  (If you'd rather not touch the SF org for the pilot, skip this — the Success
  Frame lives only in Dataverse, Phase 2.)
- Confirm the integration user can create a Task and update an Opportunity.
✅ You can query the test Opportunity, its Account, and its contacts through the
connector, and create a test Task.

---

## Phase 2 — Dataverse spine
🎯 Stand up the persistent Living Evidence Spine.
⛓ Phase 0.
🛠
- Build the **3 tables** exactly as in `08-dataverse-spine-schema.md`
  (Evidence Spine, Evidence Item, Success Frame KPI) with the listed choices.
- Set security: seller-owned rows + the agent's service principal.
- Create one test Spine row linked to your test Opportunity Id.
✅ The three tables exist with their choice sets; a test spine row reads back.

---

## Phase 3 — Agent shell
🎯 Create the agent with its brain (instructions) and model.
⛓ Phases 0–2.
🛠
- New agent in Copilot Studio → turn **generative orchestration ON**.
- Paste the instruction block from `01-agent-instructions.md` (it already
  includes read + write tool references and the write-safety rules).
- Set the model per `04-…`: pilot **Claude Sonnet 4.6** primary; if client-data
  residency matters, **GPT-5.3 chat**. Point the **deep-reasoning** slot at
  **Claude Opus 4.6** or GPT-5.2 reasoning.
✅ The agent answers a generic question in the test pane using the instructions'
tone (concise, proposes a next step).

---

## Phase 4 — Read tools (+ test)
🎯 Give the agent live situational awareness.
⛓ Phases 1, 3.
🛠 Add 3 Salesforce connector tools, **named exactly** (names outweigh
descriptions in orchestration):
- `GetSalesforceOpportunity` (Get record · Opportunity)
- `GetSalesforceAccount` (Get record · Account)
- `ListOpportunityStakeholders` (Get records · OpportunityContactRole/Contact)
✅ "Where does this deal stand?" returns a real Success Frame + buying-influence
map, clearly separating agreed vs assumed, with no invented fields.

---

## Phase 5 — Knowledge + conversation starters
🎯 Wire in the method depth and the four entry points.
⛓ Phase 3.
🛠
- Upload `05-method-scaffold-bluesheet-greensheet.md` as a **knowledge source**
  (describe generically, e.g. "sales-method reference").
- Add the **conversation starters** from `03-…` (all four surfaces).
✅ The starters appear; "What's missing before I advance?" produces
blocker/warning/info gaps grounded in the live read; buying-influence/Basic-Issue
language shows up naturally (never "go do a Blue Sheet").

---

## Phase 6 — Write tools (+ confirmation)  ← demonstrable milestone
🎯 Let confirmed actions reach Salesforce, safely.
⛓ Phases 1, 4.
🛠 Add 3 write tools, named exactly, each set to **require confirmation**:
- `CreateSalesforceTask` (Create record · Task)
- `LogSalesforceActivity` (Create record · Task/Event completed, or Note)
- `UpdateOpportunityStage` (Update record · Opportunity) — most guarded
✅ "Create a task for the P0 action" shows the **exact payload**, waits for
confirmation, then writes it. Stage updates never fire without explicit confirm.
**At this point you have a working, useful seller agent (this is v1, `07-…`).**

---

## Phase 7 — Persist the spine
🎯 Make evidence survive across sessions and compound.
⛓ Phases 2, 6.
🛠 Build two cloud flows the agent calls as tools:
- `GetEvidenceSpine` — input Opportunity Id → returns the Spine + its Evidence
  Items + Success Frame KPIs (Dataverse list rows).
- `UpsertEvidenceItem` — input a **confirmed** evidence item (JSON) → upsert by
  `Idempotency Key`, then recompute Confidence Score per `08-…`.
- Update the instructions' workflows so "confirm" routes through
  `UpsertEvidenceItem`, and "Now" merges the live SF read with the stored spine.
✅ Confirm an item in one session; reopen the agent later → it's still there and
the Confidence Score reflects it.

---

## Phase 8 — Meeting→evidence & narrative spine
🎯 Prove the two signature workflows end-to-end against the persistent spine.
⛓ Phase 7.
🛠
- Test "I just had a meeting — capture it": paste notes → draft items →
  Confirm/Edit/Reject → confirmed items land via `UpsertEvidenceItem` and (if a
  summary) optionally `LogSalesforceActivity`.
- Test "Draft a sponsor update": 7-part narrative spine assembled from
  **validated** items only; unvalidated flagged "to confirm".
✅ Both workflows run cleanly and only persist sanctioned evidence.

---

## Phase 9 — Artifact generation (Power Automate, no Azure)
🎯 Optional but in-scope: produce Blue/Green Sheet workbook, PDF, coaching doc.
⛓ Phases 7–8. Full design in `06-artifact-generation-power-automate.md`.
🛠 In order:
- Put `assets/green-sheet-workbook-template.xlsx` & `blue-sheet-template.xlsx`
  (from the skills) in the SharePoint templates library.
- Save the Office Script `power-automate/create-meeting-cycle.osts.ts` in Excel
  Online.
- **Flow A** create/append meeting cycle (Run script) → **Flow B** write approved
  fields → **Flow C** render PDF → **Flow D** coaching doc. Mind the Word
  "repeating tables" limitation (use Excel→PDF or Syntex; see `06-…`).
- Add these flows as agent tools, invoked only after seller confirmation.
✅ "Give me this as a Blue Sheet" produces a workbook/PDF link from the approved
spine, with no silent overwrites of prior dated tabs.

---

## Phase 10 — Event triggers (living, no admin)
🎯 Make the spine update when work happens, not on a schedule.
⛓ Phases 6–7.
🛠 Power Automate flows on the Salesforce connector (or Dataverse):
- Opportunity **StageName changed** → run readiness check, notify seller.
- New **OpportunityContactRole** → prompt "which KPI do they own? stance?".
- **Task/Event completed** → offer meeting→evidence extraction.
✅ Changing a stage in Salesforce nudges the agent/seller with a readiness check.

---

## Phase 11 — End-to-end test
🎯 Validate the whole loop on a clean test opportunity.
🛠 Run the day-in-the-life: read deal → spot gaps → take a next best action
(write task) → log a meeting → confirm evidence → advance stage (confirmed) →
draft sponsor update → (optional) render artifact. Check acceptance in `07-…`
plus: spine persists, confidence score moves only on validated evidence, nothing
writes without confirmation.
✅ All steps pass; no invented facts; every write was preview→confirm→execute.

---

## Phase 12 — Publish & deploy
🎯 Get it in front of sellers.
🛠
- **Channel (pick one):** Microsoft **Teams** (easiest, sellers already there) ·
  Copilot Studio **web chat** (quick demo) · **embedded in Salesforce** (richest,
  most setup — see `02-…` and MS "embedded experience in Salesforce").
  Recommendation: start in **Teams**.
- **Security/auth:** set authentication; restrict the Dataverse tables; least-
  privilege the Salesforce integration user.
- **ALM:** export the agent + flows + Dataverse as a **solution** so you can move
  pilot → production cleanly. Re-confirm the model choice for production
  (residency: GPT-5.3 chat vs experimental Claude — `04-…`).
✅ A seller opens it in Teams, runs the four surfaces against a real (sandbox)
deal, and you can re-import the solution into another environment.

---

## Build order at a glance
0 prereqs → 1 Salesforce → 2 Dataverse → 3 agent shell → 4 read tools →
5 knowledge+starters → **6 write tools (v1 works here)** → 7 persist spine →
8 meeting/narrative → 9 artifacts → 10 triggers → 11 test → 12 publish.
