# v1 Quickstart — conversation-first, live Salesforce read + write

The easiest build that still delivers the Loop's core seller value. **No
Dataverse, no Office Scripts, no PDF rendering.** The agent reads live deal data,
runs Now / What's Missing / Next Best Actions, and writes confirmed actions/notes
back to Salesforce. The Evidence Spine is held in the chat session. Add
persistence + artifacts later (`06-…`) once the flow feels right.

## What's in / out of v1
| In v1 | Deferred (later phases) |
|---|---|
| Live **read** of opportunity, account, contacts | Dataverse spine (persistence across sessions) |
| **Write** confirmed tasks, notes, stage updates to Salesforce | Workbook / PDF / coaching-doc rendering |
| Now / What's Missing / Next Best Actions surfaces | Event-trigger flows (stage-change, meeting-logged) |
| Meeting → draft evidence (in-session) | |
| Sponsor narrative spine on demand | |

## Prerequisites
- A Copilot Studio environment + maker access.
- A **Salesforce connection** for the Power Platform Salesforce connector
  (OAuth) with **read + write** scope (create Task, update Opportunity).
- A test Opportunity Id you can read and safely write to (use a sandbox).

## Steps
1. **Create the agent.** New agent → turn **generative orchestration** ON.
2. **Paste instructions.** Copy the block from `01-agent-instructions.md` as-is —
   it already includes the write tools and the write-safety rules.
3. **Add the 6 tools** (Salesforce connector), named exactly as the instructions
   expect (names carry more orchestration weight than descriptions):
   - Read: `GetSalesforceOpportunity`, `GetSalesforceAccount`, `ListOpportunityStakeholders`
   - Write: `CreateSalesforceTask`, `LogSalesforceActivity`, `UpdateOpportunityStage`
4. **Turn on confirmation for every write tool.** In each write tool's settings
   set it to **require confirmation** — a second safety layer behind the
   instruction rule "show the exact payload and get explicit confirmation."
   Keep `UpdateOpportunityStage` the most guarded (stage changes are high-impact).
5. **Add the knowledge file.** Upload `05-method-scaffold-bluesheet-greensheet.md`
   as a knowledge source (describe it generically, e.g. "sales-method reference").
6. **Add conversation starters** from `03-…` (all four surfaces).
7. **Set the model.** Pilot: **Claude Sonnet 4.6** as primary (see `04-…`). If
   client-data residency is a concern, use **GPT-5.3 chat** instead.
8. **Test in the pane.** Give it the Opportunity Id and try, in order:
   - "Where does this deal stand?" → Success Frame + buying-influence map, agreed vs assumed.
   - "What's missing before I advance?" → blocker/warning/info gaps.
   - "What should I do next?" → 2–4 prioritised actions with why/what/evidence.
   - "Create a task for the P0 action" → agent shows the **exact payload**, asks to
     confirm, then calls `CreateSalesforceTask`.
   - Paste meeting notes → **draft** evidence items with Confirm/Edit/Reject; on
     confirm, offer `LogSalesforceActivity`.

## Acceptance ("v1 is done")
- Agent reads the live opportunity and never invents a field — missing data
  becomes a question or a red flag.
- The four surfaces are recognisable and useful.
- Every write is **preview → confirm → execute**; nothing is written silently,
  and `UpdateOpportunityStage` only fires after explicit confirmation.
- Every evidence item is a **draft** the seller confirms before anything leaves
  the chat.

## The one upgrade that's worth doing next
Add the **Dataverse spine** (path 2) so evidence survives between sessions — that
single step turns the demo into something that actually "compounds." Artifacts
(workbook/PDF via `06-…`) can wait until a seller asks for a document.
