# THE SIMPLE PILOT — build this, defer the rest

A deliberate simplification pass over the kit. The outcome we're buying:
**a seller asks about a deal, gets grounded Loop guidance, and confirmed actions
land in Salesforce.** Everything below delivers that; everything else in this
folder is deferred until a real seller asks for it.

## Scope: 1 agent + 3 flows. That's the pilot.

```
Agent (instructions already pasted, generative orchestration ON)
 ├─ GetDealContext          (read: opportunity + account + stakeholders, ONE call)
 ├─ CreateSalesforceTask    (write, behind confirmation)
 └─ LogSalesforceActivity   (write, behind confirmation)
```

Explicitly deferred (don't build yet): the other read flows,
`UpdateOpportunityStage`, the Dataverse spine + confidence scoring (`08`),
artifact rendering (`06`), event triggers, deep reasoning. The runbook (`00`)
remains the long-term map.

## Flow 1 — `GetDealContext`
If you started `GetSalesforceOpportunity`, **rename it and add two actions** —
don't build separate read flows.

1. Trigger: **When an agent calls the flow** · input `opportunityId` (text).
2. **Salesforce → Get record** · *Opportunities* · Record ID = `opportunityId`.
3. **Salesforce → Get record** · *Accounts* · Record ID = `Account ID` (dynamic
   content from step 2).
4. **Salesforce → Get records** · *Opportunity Contact Roles* · Filter:
   `OpportunityId eq '@{triggerBody()?['text']}'` (use your trigger input token).
5. **Respond to the agent** — outputs (all text):
   - `stageName`, `amount`, `closeDate`, `probability` (from step 2)
   - `accountName`, `industry` (from step 3)
   - `stakeholders` = a **Compose/join** of step 4 results as JSON
     (`[{ "name": "...", "role": "...", "isPrimary": ... }]`) — or pass the raw
     value of List records; the agent can read JSON fine.
6. **Asynchronous response = Off** → Save → **Publish** → test with a real Id.

## Flows 2 & 3 — the writes (unchanged from `09-…`)
- `CreateSalesforceTask`: inputs `opportunityId, subject, description,
  activityDate, priority` → **Create record** · *Tasks* → respond `taskId`.
- `LogSalesforceActivity`: inputs `opportunityId, subject, description` →
  **Create record** · *Tasks* (Status = Completed) → respond `recordId`.
- Add both to the agent with **"require confirmation"** on.

## The one instruction edit (2 minutes)
In the agent's Instructions, replace the whole **# Using Salesforce** section
with:

```
# Using Salesforce
- **GetDealContext** — one call returns the opportunity (stage, amount, close
  date), account context, and the buying group. Call it whenever the seller asks
  about a deal.
- **CreateSalesforceTask** — turn a CONFIRMED Next Best Action into a task.
- **LogSalesforceActivity** — write a CONFIRMED meeting summary back as a note.
For ANY write to Salesforce, first show the seller exactly what will be written
and get explicit confirmation. If a tool returns no data or errors, tell the
seller plainly and continue with what you have.
```

## Pilot acceptance (4 prompts, that's the whole test)
1. "Where does this deal stand for opportunity `<Id>`?" → Success Frame-style
   read + buying group, agreed vs assumed, **one** tool call.
2. "What's missing before I advance?" → blocker/warning/info gaps.
3. "What should I do next? Create a task for the top one." → 2–4 options →
   payload preview → confirm → task appears in Salesforce.
4. Paste meeting notes → draft evidence items → confirm → offer to log the note.

When sellers use it and ask "can this remember between sessions?" → that's the
trigger to build the Dataverse spine (`08`). When they ask "can I get this as a
document?" → that's the trigger for artifacts (`06`). Build on pull, not push.
