# Salesforce Integration & Tool Design (Seller Companion)

Copilot Studio gives you several ways to connect Salesforce. For a *seller* agent
that reads deal context and writes back tasks/notes, the **Power Platform
Salesforce connector** (action tools) plus the **Salesforce CRM Copilot
connector** (knowledge/RAG) is the right combination. Other patterns
(Einstein-bot handoff, server-to-server Sales agent) are for contact-center or
admin scenarios and are out of scope here.

## A. Action tools — Power Platform Salesforce connector
Add these as **tools** on the agent. The instruction file references each by the
exact names below, so name them identically in Copilot Studio (names carry more
weight than descriptions in orchestration).

| Tool name (use verbatim) | Salesforce connector action | Inputs | Returns | Read/Write |
|---|---|---|---|---|
| `GetSalesforceOpportunity` | Get record (Opportunity) | Opportunity Id | Stage, Amount, CloseDate, Probability, custom Success-Frame fields | Read |
| `GetSalesforceAccount` | Get record (Account) | Account Id | Name, Industry, Region, strategic-theme fields | Read |
| `ListOpportunityStakeholders` | Get records (OpportunityContactRole / Contact) | Opportunity Id | Contact name, Role, Influence, Stance | Read |
| `CreateSalesforceTask` | Create record (Task) | WhatId (Opp), Subject, Description, ActivityDate, Priority | Task Id | **Write** |
| `LogSalesforceActivity` | Create record (Task/Event "Completed") or Note | WhatId, Subject, Description | Record Id | **Write** |
| `UpdateOpportunityStage` | Update record (Opportunity) | Opportunity Id, StageName | Success | **Write** |

**Write-safety rule (already in the instructions):** the agent must show the
exact payload and get explicit seller confirmation before any Create/Update.
Configure these connector actions with **"require confirmation"** in Copilot
Studio as a second layer of protection.

### Mapping the Loop "Success Frame" to Salesforce
The Success Frame (3–5 sponsor-owned KPIs) has no native home in Salesforce. Pick one:
- **Recommended:** add custom fields / a child object on Opportunity
  (`Loop_KPI__c` with Baseline, Target, Horizon, Owner, Confidence). Clean,
  reportable, and `GetSalesforceOpportunity` returns it directly.
- **Lightweight pilot:** store the Success Frame as JSON in a long-text custom
  field (`Loop_Success_Frame__c`) and have the agent parse it.
- **No-Salesforce-change pilot:** keep the spine in **Dataverse** and link by
  Opportunity Id. Fastest to stand up; least disruptive to the SF org.

## B. Knowledge — Salesforce CRM Copilot connector
Use the Microsoft 365 **Salesforce CRM Copilot connector** to index Accounts,
Opportunities, Contacts, Leads, and Cases for grounded ("generative answers")
retrieval. This lets the seller ask "what do we know about this account?" and get
cited answers. Per Microsoft's instruction-authoring guidance, **describe this
knowledge generically in the prompt** ("account and opportunity records") rather
than naming the source.

## C. Event triggers (make the spine "living" without admin)
The Loop says evidence must update when *work happens*, not on a schedule. Wire
these with **Power Automate flows** that call the agent or update Dataverse:
- Opportunity **StageName changed** → trigger a readiness check, notify seller.
- New **OpportunityContactRole** (stakeholder added) → prompt: "which KPI do they own? stance?"
- **Task/Event completed** (meeting logged) → offer meeting→evidence extraction.
- Close date inside renewal window → prompt delivery/renewal hand-off (future).

## D. Suggested build order
1. Stand up the agent with **read-only** tools (`Get*`, `List*`) + the knowledge connector. Prove "Now" + "What's Missing".
2. Add the **Next Best Actions** surface (no writes yet).
3. Add **write** tools (`CreateSalesforceTask`, `LogSalesforceActivity`) behind confirmation.
4. Add `UpdateOpportunityStage` last, and the event-trigger flows.
5. Decide Success-Frame storage (custom fields vs Dataverse) before going beyond pilot.

## E. Data-residency note (important for client data)
Connector traffic to Salesforce (a non-Microsoft system) is the **maker's**
responsibility for compliance. Also see the model note in `04-model-recommendation.md`:
Anthropic Claude models in Copilot Studio are currently flagged **experimental**
and may process data outside your geographic boundary — which matters when the
agent handles client CRM data.
