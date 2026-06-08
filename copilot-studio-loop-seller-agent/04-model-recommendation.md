# Which model should run the Seller Companion?

Verified against Microsoft Learn (Copilot Studio model docs), June 2026.

## What Copilot Studio actually offers today
The agent's **primary (orchestration) model** is chosen from a dropdown. Current
options and how Microsoft categorises them:

| Model | Category | Rate | Context | Notes |
|---|---|---|---|---|
| GPT-4.1 mini | Mini (default) | Basic | 128K | Cheap/fast; weak for nuanced judgment. |
| GPT-4.1 | General | Standard | 128K | Solid GA workhorse. |
| GPT-5 chat | General | Standard | 128K | — |
| **GPT-5.3 chat** | General | Standard | 128K | **Managed (inside Microsoft).** Your "GPT-5.3". |
| GPT-5 reasoning / GPT-5.2 reasoning | Deep | Premium | 400K | For deep-reasoning tasks. |
| **Claude Sonnet 4.6** | General | Standard | **200K** | External (Anthropic). Flagged **experimental**. |
| **Claude Opus 4.6** | Deep | Premium | **200K** | External (Anthropic). Flagged **experimental**. |
| Grok 4.1 Fast | General | Standard | — | — |

Two facts that matter for your decision:
1. **There is no "Claude 4.7" in Copilot Studio's dropdown.** The Claude options
   are **Sonnet 4.6** and **Opus 4.6**. (The "4.7/4.8" you may have seen are in
   other surfaces like GitHub Copilot / SSMS, not the Copilot Studio agent
   model picker.) So plan around 4.6.
2. **Anthropic Claude models are "experimental"** in Copilot Studio even though
   they show no tag. Microsoft warns data in experimental models *may be
   processed/stored outside your geographic boundary*, and they're *not
   recommended for production*. That is a real constraint for an agent touching
   **client CRM data**.

## Recommendation

**For a pilot / demo (quality first): Claude Sonnet 4.6 as the primary model.**
- The Loop's whole ethos — *stabilise judgment, draft-not-decide, modest
  attribution, structured evidence, "select don't write"* — rewards a model with
  strong instruction-following and disciplined structured output. Claude is
  excellent at exactly this.
- **200K context** is the largest on offer — it matters because the Evidence
  Spine grows over the life of the deal, and you'll feed back accumulated
  context.
- Sonnet (not Opus) for the primary loop: it's the **General**-tier, Standard-rate
  model — fast and cheap enough for turn-by-turn seller flow.

**For production with real client data: GPT-5.3 chat as the primary model.**
- It's a **managed** model that runs inside Microsoft's boundary → cleaner
  data-residency / compliance story for Korn Ferry client data. Claude's
  experimental status is the blocker here, not its quality.
- Comparable General-tier capability; 128K context is enough for a single
  opportunity's working context.

**For the "deep" jobs, regardless of primary model:** Copilot Studio has a
separate **deep-reasoning** model setting. Point it at **Claude Opus 4.6** (or
**GPT-5.2 reasoning**) and use it only for the heavier seller tasks —
stage-readiness diagnosis and the sponsor narrative-spine assembly — where the
extra reasoning earns its Premium cost. Keep the conversational turns on the
cheaper General model.

## Bottom line
| Phase | Primary (orchestration) | Deep-reasoning slot |
|---|---|---|
| Pilot / demo | **Claude Sonnet 4.6** | Claude Opus 4.6 |
| Production (client data) | **GPT-5.3 chat** | GPT-5.2 reasoning |

Start the pilot on **Claude Sonnet 4.6** to feel the quality, validate the
data-residency posture with your security team, and switch the primary to
**GPT-5.3 chat** for production if the experimental/residency status of Claude
isn't cleared for client data. Don't default to GPT-4.1 mini — the seller
guidance needs judgment, not just speed.
