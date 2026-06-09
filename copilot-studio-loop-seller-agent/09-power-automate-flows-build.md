# Flows-first architecture & build (Power Automate Premium)

**Why this doc exists:** your licensing is **Power Automate = premium; Copilot
Studio = base**. The Salesforce connector and Dataverse are premium connectors,
so instead of adding them directly as agent tools, we wrap **every** premium call
in a **Power Automate cloud flow** (covered by your Power Automate Premium) and
the agent calls the flow. This supersedes the "direct connector tools" wording in
`02-…`/`07-…` — same tool *names*, just backed by flows.

```
Agent  ──(calls flow tool)──►  Power Automate flow  ──(premium connector)──►  Salesforce / Dataverse
        "When an agent calls          holds the premium               (PA Premium covers this)
         the flow" trigger            Salesforce/Dataverse action
        "Respond to the agent"        + "Respond to the agent"
```

## The one open decision (Phase 3 only): Copilot Studio plan
- **Standalone Copilot Studio** (capacity/messages) → **generative orchestration**
  works; the agent picks flows/knowledge dynamically. This is the design in `01-…`.
  *Recommended* — start a Copilot Studio trial if you don't have it.
- **Free / Teams plan** → no generative orchestration. Fallback: **classic
  topics** with trigger phrases that call the same flows. More wiring, same flows.
- Either way **Phases 1–2 (Dataverse + flows) are identical**, so we build those
  now and decide the agent style at Phase 3.

## Flow requirements (apply to every flow below)
To be callable by the agent, each flow must (per Microsoft docs):
1. Use the **When an agent calls the flow** trigger (older alias: *Run a flow from Copilot*).
2. End with **Respond to the agent** (older alias: *Respond to Copilot*).
3. Have **Asynchronous response = Off** and return within **100 seconds**.
4. Live in a **solution** in the **same environment** as the agent, and be **published**.

> First, make a solution: Power Automate → **Solutions → New solution**
> ("Loop Seller Companion", publisher prefix e.g. `kf`). Build all flows inside it.

---

## The 8 flows

### Read (Salesforce)
**1. `GetSalesforceOpportunity`**
- Trigger input: `opportunityId` (text).
- Action: **Salesforce → Get record** · Object type *Opportunities* · Record ID = `opportunityId`.
- Respond to the agent (JSON): `stageName`, `amount`, `closeDate`, `probability`,
  and any `Loop_KPI__c` Success-Frame fields.

**2. `GetSalesforceAccount`**
- Input: `accountId`. Action: **Get record** · *Accounts*.
- Respond: `name`, `industry`, `region`, strategic-theme fields.

**3. `ListOpportunityStakeholders`**
- Input: `opportunityId`. Action: **Salesforce → Get records** · *Opportunity
  Contact Roles* · Filter `OpportunityId eq '@{...}'` (then Get record on each
  Contact for name/title if needed).
- Respond: array of `{contactId, name, title, role, influence, stance}`.

### Write (Salesforce) — agent must confirm before calling these
**4. `CreateSalesforceTask`**
- Inputs: `opportunityId`, `subject`, `description`, `activityDate`, `priority`.
- Action: **Create record** · *Tasks* (WhatId = opportunityId). Respond: `taskId`.

**5. `LogSalesforceActivity`**
- Inputs: `opportunityId`, `subject`, `description`.
- Action: **Create record** · *Tasks* with Status=Completed (or a Note). Respond: `recordId`.

**6. `UpdateOpportunityStage`** — most guarded
- Inputs: `opportunityId`, `stageName`.
- Action: **Update record** · *Opportunities*. Respond: `success`.

### Spine (Dataverse)
**7. `GetEvidenceSpine`**
- Input: `opportunityId`.
- Actions: **Dataverse → List rows** on *Evidence Spine* (filter
  `kf_opportunityid eq '@{...}'`) → **List rows** on *Evidence Item* (filter by
  spine) → **List rows** on *Success Frame KPI* (filter by spine).
- Respond: `{ spine, items[], kpis[] }`.

**8. `UpsertEvidenceItem`** (the tricky one — full logic below)
- Input: a **confirmed** evidence item JSON + `spineId`.
- Upsert by `idempotencyKey`, then recompute the spine Confidence Score.

---

## Flow 8 in detail — `UpsertEvidenceItem`
Trigger input (single text param `itemJson`, the confirmed item; the agent fills it):
```json
{ "spineId":"<guid>", "idempotencyKey":"<sha>", "type":"Target",
  "title":"Win rate 22% -> 30%", "content":"{...}", "sourceKind":"Human",
  "confidence":"high", "status":"validated", "kpiRef":"<guid|null>",
  "stakeholderRef":"0035…", "eventTime":"2026-06-09T00:00:00Z" }
```
Steps:
1. **Parse JSON** (`itemJson`) → use a schema so fields are typed.
2. **Dataverse → List rows** on *Evidence Item*, filter
   `kf_idempotencykey eq '@{body('Parse_JSON')?['idempotencyKey']}'`, Top 1.
3. **Condition**: `length(outputs of List rows value) > 0`
   - **Yes** → **Update a row** (that row id) with the new field values.
   - **No** → **Add a new row** to *Evidence Item* with all fields + the Spine lookup
     (`kf_Spine@odata.bind = /kf_evidencespines(<spineId>)`).
4. **Recompute confidence** (next section) → **Update a row** on *Evidence Spine*
   set `kf_confidencescore` and `kf_lastupdated = utcNow()`.
5. **Respond to the agent**: `{ "status":"upserted", "confidenceScore": <n> }`.

### Confidence recompute (do it in the flow)
After the upsert, **List rows** all *Evidence Item* + *Success Frame KPI* for the
spine, then compute in a **Compose** (or a child flow) per `08-…`:
```
score = 0
+20 if kpis.count between 3 and 5
+15 if any kpi.owner is the economic buyer AND that kpi.validated == true
+10 per validated Target+Baseline pair (cap +30)
+10 if an item type=BehaviorCondition is linked to a kpi
+10 if an item type=ProofObject exists
-15 if spine.status moved to a stage with an open blocker-level Risk item
-10 if two items contradict (a Risk item flagged 'contradiction')
-10 if any item status=='draft' and eventTime older than 60 days
clamp 0..100
```
Implement with `length(filter(...))` expressions over the listed rows. Keep v1
simple; refine later.

---

## Build order for the flows
Inside the solution, build in this order and **publish** each:
1. `GetSalesforceOpportunity` → test with your sandbox Opportunity Id.
2. `GetSalesforceAccount`, `ListOpportunityStakeholders`.
3. `GetEvidenceSpine`, `UpsertEvidenceItem` (needs the Dataverse tables from `08-…` first).
4. `CreateSalesforceTask`, `LogSalesforceActivity`, `UpdateOpportunityStage`.

Then at **Phase 3** we add them to the agent as flow tools (generative
orchestration) or call them from classic topics, depending on your Copilot Studio
plan.

## Worked example — building `GetSalesforceOpportunity` click-by-click
1. In the solution → **New → Automation → Cloud flow → Instant** (we'll swap the trigger).
2. Trigger: search **Copilot** → **When an agent calls the flow**. Add an input:
   text, name `opportunityId`, description "Salesforce Opportunity record Id".
3. **+ New step → Salesforce → Get record.** Sign in / create the Salesforce
   connection. Object type = **Opportunities**. Record ID = `opportunityId` (dynamic).
4. **+ New step → Copilot → Respond to the agent.** Add outputs (text) and map:
   `stageName` = `StageName`, `amount` = `Amount`, `closeDate` = `CloseDate`,
   `probability` = `Probability`. (Add `Loop_KPI__c` outputs if you created them.)
5. In **Respond to the agent → Settings**, ensure **Asynchronous response = Off**.
6. **Save → Publish.** Test: **Test → Manually**, supply a real Opportunity Id,
   confirm the outputs come back.
✅ When this returns live data, you've proven the whole premium-via-flow pattern;
the other seven flows follow the same shape.
