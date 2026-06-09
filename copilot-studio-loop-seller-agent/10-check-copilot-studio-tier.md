# How to check your Copilot Studio tier (and unblock the build)

You need to know one thing: **do you have generative orchestration, or only
classic?** Three ways to find out, fastest first.

## Check 1 — In the product (≈60 seconds, most reliable)
1. Go to **https://copilotstudio.microsoft.com** and sign in with your work account.
2. **Create a new agent** (skip the conversational setup → "Skip to configure").
3. Open the agent → **Settings** (top right) → **Generative AI** (or
   **Orchestration**).
4. Look at the orchestration choice:
   - You can select **Generative** (a.k.a. "Generative orchestration" / "let the
     agent reason over tools and knowledge") → ✅ **you have the full tier.**
   - Only **Classic** is available, or the option is greyed/absent → **Teams plan.**
5. Cross-check with **Channels** (left nav → **Channels** or **Publish**):
   - More than just Teams (Web/custom website, Direct Line, etc.) → full tier.
   - Teams only → Teams plan.
6. And **Tools → + Add a tool**: if you can add **Connectors / Flows** → full tier
   capability is present.

## Check 2 — Admin center SKUs (if you have admin, or ask your admin)
**admin.microsoft.com → Billing → Your products** (or **Licenses**). Look for:
- **"Microsoft 365 Copilot"** → the $30 add-on; unlocks agent use + some
  zero-rated usage (but agent *flows/actions* still need credits).
- **"Microsoft Copilot Studio"** (standalone) or **"Copilot Studio Viral Trial"**
  → full generative tier.
- If you see only **E3/E5/Business Premium** and **Power Automate Premium** (no
  Copilot Studio / M365 Copilot SKU) → you have the **bundled Teams plan** only.

## Check 3 — Ask your Power Platform / M365 admin one question
> "Do we have a standalone **Microsoft Copilot Studio** subscription or **Copilot
> Studio capacity/credits** allocated to a Power Platform environment, or just the
> Copilot Studio that's bundled with our M365 E3/E5?"

---

## The unblock: build the full design today with a free trial
Regardless of the answer, you can **build and test the full generative-orchestration
agent now**:
- Start the **Copilot Studio free trial** (sign up at copilotstudio.microsoft.com,
  or have an admin assign a trial license). It gives **full generative
  orchestration** for building and testing in the **test pane**.
- Caveat: on the **trial you can build and test but can't publish**. That's fine —
  we validate the whole experience first, then sort out production licensing
  (standalone subscription, M365 Copilot, or capacity/credits) before go-live.

## What each answer means for our build
| Finding | Phase 3 path | Everything else |
|---|---|---|
| **Generative available** (standalone / trial / credits) | Use `01-…` as written (generative orchestration). | Phases 1–2 flows + Dataverse unchanged. |
| **Teams plan only** | Build **classic topics** that call the same flows; use **generative answers** nodes for the reasoning-heavy surfaces. I'll provide a classic-topic variant of `01-…`. | Phases 1–2 flows + Dataverse unchanged. |

## Meanwhile — keep building (unaffected by the answer)
Start now; neither path changes these:
1. **Dataverse tables** per `08-dataverse-spine-schema.md` (Phase 2).
2. **`GetSalesforceOpportunity`** flow per the worked example in
   `09-power-automate-flows-build.md` (Phase 1/4).
