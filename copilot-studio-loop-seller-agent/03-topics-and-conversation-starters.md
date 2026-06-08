# Topics & Conversation Starters (Seller Flow)

With **generative orchestration** on, you don't need to hand-build a topic for
every path — the orchestrator plans across your tools and instructions. Keep
topics **bite-size** and use them for the few deterministic flows. Use
**conversation starters** to expose the four seller surfaces as one-tap entry
points.

## Conversation starters (set these on the agent)
Map directly to the four Loop seller surfaces:

| Starter (button label) | Maps to surface | What the agent does |
|---|---|---|
| **Where does this deal stand?** | NOW | Calls `GetSalesforceOpportunity` + `ListOpportunityStakeholders`; shows Success Frame + buying-group map, agreed vs assumed. |
| **What's missing before I advance?** | WHAT'S MISSING | Runs the stage-readiness check; lists blocker/warning/info gaps. |
| **What should I do next?** | NEXT BEST ACTIONS | Proposes 2–4 prioritised actions, each with why / what / template / evidence captured. |
| **I just had a meeting — capture it** | EVIDENCE SPINE | Accepts pasted notes/transcript; returns draft evidence items to Confirm/Edit/Reject. |
| **Draft a sponsor update** | EVIDENCE SPINE | Assembles the 7-part Sponsor Narrative Spine from validated evidence. |

## Deterministic topics worth authoring
Keep these as small, reusable topics (trigger phrases + a redirect or two):

1. **Log Meeting** — trigger phrases: "log a meeting", "here are my notes",
   "capture this call". Collects the transcript (one Question node), then runs
   the meeting→evidence extraction. Outputs draft items + an Adaptive Card with
   Confirm / Edit / Reject buttons.
2. **Stage Readiness Check** — trigger phrases: "am I ready to advance",
   "readiness check", "move to {stage}". Slot-fills target stage, calls the
   readiness logic, returns the gap list. Redirects to **Next Best Actions** at the end.
3. **Confirm Evidence** (reusable, no trigger phrase) — called by other topics;
   handles the Confirm/Edit/Reject/Needs-validation choices and writes the
   sanctioned item to the spine (Dataverse) and, if applicable,
   `LogSalesforceActivity`.
4. **Disambiguation / catch-all** — if a request overlaps surfaces, ask one
   clarifying question that routes to the right surface.

## Authoring tips (from Microsoft's guidance)
- Use **exact tool names** in instructions and topic descriptions; names weigh
  more than descriptions during orchestration.
- Prefer **Adaptive Cards** for the Confirm/Edit/Reject control — agent
  instructions cannot change how cards trigger, so build the card directly.
- Keep topics **bite-size and reusable**; redirect rather than duplicate logic.
- Give the agent an **out** in every generative path (it's already in the
  instructions: "if you cannot help… say so plainly").
- Turn on **follow-up questions** so the agent asks the *right* next question
  (requires "allow ungrounded responses" if the question has no citation).
