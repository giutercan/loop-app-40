# Method Scaffold — Blue Sheet (SSWP) & Green Sheet (CSWP) inside the Loop

This is the agent's deep reasoning reference. Upload it to Copilot Studio as a
**knowledge source** (describe it generically — "sales-method reference" — per
Microsoft's authoring rules). The compact version lives in the instructions;
this file is the full map.

> **Reconciling the Loop's "no jargon" rule.** The Loop deliberately avoids
> governance/method language *with customers* and avoids commanding the seller
> ("go fill in a Blue Sheet"). The Blue/Green Sheet *thinking* is exactly the
> discipline the Loop wants — so the agent **reasons** with this structure and
> **surfaces** it as "what matters now / what's missing / next best move." Use
> the method as scaffolding; never expose it as bureaucracy.

## Two methods, two altitudes
- **Blue Sheet — Strategic Selling with Perspective (SSWP).** *Opportunity-level*
  strategy. Owns the Single Sales Objective, buying-influence map, competition,
  position today, best actions, providing perspective, and the One KF scorecard.
- **Green Sheet — Conceptual Selling with Perspective (CSWP).** *Meeting-cycle*
  level. A rolling workbook of dated **PRE** (pre-call plan) and **POST**
  (post-meeting debrief) pairs for a single SSO. Blue Sheet sets strategy; Green
  Sheet runs each conversation and feeds evidence back up.

## How they map to the four Loop seller surfaces
| Loop surface | Blue Sheet (opportunity) | Green Sheet (meeting cycle) |
|---|---|---|
| **Now** | Single Sales Objective, buying-influence map (roles/influence/mode/Win-Results), position today, competition | Buyer Concept, decision stage, what's confirmed so far |
| **What's Missing** | Red flags: uncontacted influences, unknown authority, unclear timing, competition pressure, contradictions | Basic Issues, missing commitments, unanswered confirmation/new-info questions |
| **Next Best Actions** | Possible → Best actions; Providing Perspective (target influence + idea + evidence-needed) | PRE plan: Valid Business Reason, question set, Best + Minimum Action Commitment |
| **Evidence Spine** | Scorecard movement (only on validated evidence) | POST debrief becomes evidence; seeds next PRE — the rolling cycle *is* the spine |

## Evidence-type extension (add to the base Loop model)
The Loop base types still apply (KPI, Baseline, Target, Risk, Decision,
Commitment, NextAction, …). Add these method-aware types:

| New type | Captures | From |
|---|---|---|
| `BuyingInfluence` | name, title, role(s)=Economic/User/Technical/Coach, degree=high/med/low, mode=growth/trouble/even-keel/overconfident, rating, basis=explicit/inferred | Blue Sheet §6 |
| `WinResult` | a personal win + a business result, per influence (never collapse the two) | Blue Sheet §6 |
| `Concept` | the buyer's concept of their need/solution; track shifts meeting to meeting | Green Sheet PRE/POST |
| `ValidBusinessReason` | why this meeting is worth the buyer's time | Green Sheet PRE |
| `BasicIssue` | structural blocker (not an objection) needing explicit handling | Green Sheet |
| `ProvidingPerspective` | message/idea + target influence + why it might work + evidence-still-needed; always a hypothesis until validated | both |

## Shared discipline (why these are a clean fit for the Loop)
Both skills already enforce the Loop's core rules — reuse them verbatim:
- **Evidence tagging** `explicit | inferred | carried_forward | unknown` ⇄ Loop
  confidence `high | medium | exploratory`. Inferred/unknown items always carry an
  evidence note + a validation question.
- **Approval gates before finalizing** ⇄ Loop "draft, seller sanctions"
  (Confirm/Edit/Reject). Never overwrite a prior value silently — present a delta
  (current → proposed → evidence → confidence → validation question).
- **Score changes only on new validated evidence** ⇄ Loop spine-confidence rises
  only on validation; executing an action does *not* move the score by itself.
- **Whole-conversation read before field extraction** ⇄ Loop meeting→evidence
  workflow (opening/ending state, momentum, inflection points), not turn-by-turn.
- **Non-vendor competition always in scope** (do-nothing, delay, internal
  resource, reallocated funds, competing priority).

## Using the bundled Claude skills (`sswp-blue-sheet`, `cswp-green-sheet`)
These are transcript-first **Claude skills** that produce a structured analysis,
workbook (.xlsx), PDF, and coaching doc. They don't run *inside* Copilot Studio,
but they fit the Loop two ways:

1. **As the spec for the agent's behaviour** — their output schemas
   (`blue-sheet-output-schema.md`, `green-sheet-output-schema.md`) are the field
   definitions this agent should reason toward. (Mapped above.)
2. **As a deeper "analysis" step behind the agent** — when a seller wants the
   full Blue/Green Sheet artifact (workbook/PDF/coaching), route the transcript to
   a Claude-skill-backed process (e.g. an Anthropic-powered Power Automate/Azure
   Function step, or the Claude Agent SDK) and return the structured result for
   the seller to confirm into the spine. Keep the *same* approval gates.

### Pre/Post rolling-cycle note
Mirror the Green Sheet's "one workbook per SSO, repeating dated PRE/POST tabs"
as the spine's natural rhythm: each meeting = a POST debrief that seeds the next
PRE plan. This is exactly the Loop's "evidence compounds, never resets."

## What I'd want from you to wire the artifacts (optional, later)
- Whether full Blue/Green Sheet **workbook + PDF generation** should be in scope
  for the seller agent, or stay in the Claude-skill tooling and just feed the spine.
- Your **One KF custom scorecard** weights (the Blue Sheet skill references a
  custom scorecard) so score-impact suggestions match your standard.
