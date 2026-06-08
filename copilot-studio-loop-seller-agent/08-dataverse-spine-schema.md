# Dataverse schema — the Living Evidence Spine

The spine is the source of truth; the Salesforce records and any rendered
workbook/PDF are views of it. Keep it lean: **3 tables**. Create them in the same
Power Platform environment as the agent. (Display names shown; let Dataverse
generate logical names, prefixed by your publisher, e.g. `kf_`.)

## Table 1 — Evidence Spine  (one row per opportunity / SSO)
| Column | Type | Notes |
|---|---|---|
| Name | Text (primary) | e.g. "Aerospace Equipment Inc. — Sales Transformation" |
| Opportunity Id | Text | Salesforce Opportunity Id (the join key) |
| Account Name | Text | denormalised for quick display |
| Single Sales Objective | Text (multiline) | the SSWP SSO |
| Status | Choice | Draft / Active / At-risk / Complete |
| Confidence Score | Whole number (0–100) | computed; see scoring below |
| Last Updated | Date and time | set on every write |

## Table 2 — Evidence Item  (the timeline; many per spine)
| Column | Type | Notes |
|---|---|---|
| Title | Text (primary) | short label |
| Spine | Lookup → Evidence Spine | parent |
| Type | Choice | KPI, Baseline, Target, Assumption, StakeholderClaim, MeetingInsight, BehaviorCondition, BehaviorSignal, LeverApplied, OutcomeSignal, Risk, Decision, Commitment, Deliverable, ProofObject, NextAction, **BuyingInfluence, WinResult, Concept, ValidBusinessReason, BasicIssue, ProvidingPerspective** |
| Content | Text (multiline) | JSON body of the item |
| Source Kind | Choice | AI_draft / Human / System_event / Integration |
| Confidence | Choice | high / medium / exploratory |
| Status | Choice | draft / validated / rejected / needs_stakeholder_validation / needs_input |
| Stakeholder Ref | Text | optional SF Contact Id |
| KPI Ref | Lookup → Success Frame KPI | optional |
| Event Time | Date and time | when it happened |
| Idempotency Key | Text | `sha256(spineId+eventId+type+title)` — dedupe on upsert |

## Table 3 — Success Frame KPI  (3–5 per spine)
| Column | Type | Notes |
|---|---|---|
| KPI | Text (primary) | e.g. "Enterprise win rate" |
| Spine | Lookup → Evidence Spine | parent |
| Baseline | Text | keep as text — values are often qualitative early |
| Target / Direction | Text | e.g. "↑ 30%" |
| Horizon | Text | e.g. "4 quarters" |
| Owner | Text | sponsor name / role |
| Confidence | Choice | high / medium / exploratory |
| Validated | Yes/No | true only when the sponsor confirms |

## Confidence scoring (simple v1 — compute in the write flow)
Start at 0, clamp 0–100:
- +20 Success Frame has 3–5 KPIs
- +15 economic buyer identified & a KPI they own is Validated
- +10 per Validated Target/Baseline pair (max +30)
- +10 a BehaviorCondition exists and is linked to a KPI
- +10 a ProofObject is attached
- −15 stage advanced with a blocker-level gap open
- −10 contradictory items unresolved
- −10 any item older than 60 days with status still `draft`

## Notes
- **Security:** restrict the tables to the agent's service principal + sellers'
  team; row-level ownership by seller.
- **Why text not number for Baseline/Target:** early discovery values are often
  ranges or directions; store raw, quantify later in the value case.
- The agent reads/writes these via the two flows in the runbook (Phase 7); it
  never writes silently — only confirmed items are persisted.
