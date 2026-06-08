# Loop Seller Companion — Copilot Studio build kit

A from-scratch package to build a **Microsoft Copilot Studio** agent for the
**seller** persona, true to the **Korn Ferry Loop** methodology, integrated with
**Salesforce**. (Scope is deliberately the seller piece; manager and delivery
personas reuse the same Evidence Spine later.)

## What the Loop is (the backbone of this agent)
> The Loop coordinates how the seller shows up — before, during, and after the
> customer conversation. It is an **evidence engine, not a sales tool**.
> **AI stabilises the seller's judgment; it never replaces it.**

- **Three phases:** Discovery → Alignment → Realization.
- **Four lived seller surfaces:** **Now** (situational awareness) · **What's
  Missing** (discipline) · **Next Best Actions** (guidance) · **Evidence Spine**
  (the living record).
- **Living Evidence Spine:** evidence is a *by-product of work*, drafted by AI and
  *sanctioned by the seller*; it compounds and never resets.
- **Discipline:** never invent facts · select, don't write · 2–3 options not
  commands · always label confidence · event-triggered, no admin.

### Folded in: Blue Sheet & Green Sheet (your skills)
The **Blue Sheet (Strategic Selling, SSWP)** and **Green Sheet (Conceptual
Selling, CSWP)** skills are used as the agent's *reasoning scaffold* — buying
influences, win-results, basic issues, pre-call plans, commitments, providing
perspective — surfaced as plain seller guidance, **never as "go fill in a Blue
Sheet."** They fit because they already share the Loop's discipline: evidence
tagged explicit/inferred/unknown, approval gates before finalizing, no silent
overwrites, and scores moving only on validated evidence. Full mapping in
`05-method-scaffold-bluesheet-greensheet.md`.

## Files in this kit
| File | What it is |
|---|---|
| `01-agent-instructions.md` | **Paste-ready** agent instructions (6.3k chars, < 8k limit). The heart of the agent. |
| `02-salesforce-and-tools.md` | Salesforce connector tools the agent calls + how to store the Success Frame. |
| `03-topics-and-conversation-starters.md` | Conversation starters + the few deterministic topics. |
| `04-model-recommendation.md` | Which model to run it on (verified against current Copilot Studio options). |
| `05-method-scaffold-bluesheet-greensheet.md` | **Blue Sheet (SSWP) + Green Sheet (CSWP)** method folded into the Loop surfaces. Upload as a knowledge source. |
| `06-artifact-generation-power-automate.md` | **No-Azure** pipeline to render Blue/Green Sheet workbooks, PDFs & coaching docs via Power Automate. |
| `power-automate/create-meeting-cycle.osts.ts` | Office Script (Power Automate) that creates dated PRE/POST tabs — replaces the bundled Python script. |
| `loop-seller-flow.html` | **Front-end stage visualizer** — open in a browser to *see* the seller flow. |

## Build it in ~6 steps
1. Create a new agent in **Copilot Studio**; turn on **generative orchestration**.
2. Paste the block from `01-agent-instructions.md` into **Instructions**.
3. Add the **conversation starters** from `03-…` (the four surfaces).
4. Add the **Salesforce tools** from `02-…` (start read-only).
5. Set the model per `04-…` (pilot: **Claude Sonnet 4.6**; deep slot: **Opus 4.6**).
6. Test in the test pane against a sample opportunity; add write tools + event triggers once "Now / Missing / Next" feel right.

## Model — short answer
- **Pilot / demo:** **Claude Sonnet 4.6** primary (best instruction-following +
  200K context for the growing spine), **Claude Opus 4.6** in the deep-reasoning slot.
- **Production with client data:** switch primary to **GPT-5.3 chat** — it's a
  *managed* model inside Microsoft's boundary; Claude models in Copilot Studio are
  currently flagged **experimental** and may process data outside your geo.
- Two corrections worth knowing: Copilot Studio's dropdown has **Claude 4.6**, not
  4.7; and **GPT-5.3 chat** *is* available there. Full reasoning in `04-…`.

## What I need from you to take this further
1. **Salesforce shape:** which objects/fields hold deals today, and can we add
   custom fields for the Success Frame, or should the spine live in **Dataverse**?
2. **Data-residency call:** is client CRM data allowed through an *experimental*
   external model (Claude), or must we stay on the managed GPT-5.3 path? (Drives
   the model choice.)
3. **Where sellers live:** Teams, the Copilot Studio web chat, or **embedded in
   Salesforce**? (Changes the channel + auth setup.)
4. **Blue/Green Sheet depth:** the skills are folded in as the reasoning scaffold
   (`05-…`) and the artifact pipeline is designed for **Power Automate, no Azure**
   (`06-…` + the Office Script). Share your **One KF custom scorecard** weights so
   score-impact suggestions match your standard, and confirm whether you want full
   workbook/PDF rendering in v1 or just the spine first.
5. **A sample opportunity** (sanitised) to tune the readiness check and NBA logic.
6. **Confirm scope:** seller-only now, with manager + delivery as later phases
   on the same spine — yes?

Once I have #1–#3 I can turn this into an importable Copilot Studio solution
(agent + tools + topics) rather than a paste-in kit.
