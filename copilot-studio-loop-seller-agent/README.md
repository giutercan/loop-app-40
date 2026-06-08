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

## Files in this kit
| File | What it is |
|---|---|
| `01-agent-instructions.md` | **Paste-ready** agent instructions (6.3k chars, < 8k limit). The heart of the agent. |
| `02-salesforce-and-tools.md` | Salesforce connector tools the agent calls + how to store the Success Frame. |
| `03-topics-and-conversation-starters.md` | Conversation starters + the few deterministic topics. |
| `04-model-recommendation.md` | Which model to run it on (verified against current Copilot Studio options). |
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
4. **Your methodology skills/docs:** you mentioned skills covering the
   methodology — share them and I'll fold the exact KF levers, KPI library, and
   behavioural-condition picklists into the instructions and tool schemas.
5. **A sample opportunity** (sanitised) to tune the readiness check and NBA logic.
6. **Confirm scope:** seller-only now, with manager + delivery as later phases
   on the same spine — yes?

Once I have #1–#3 I can turn this into an importable Copilot Studio solution
(agent + tools + topics) rather than a paste-in kit.
