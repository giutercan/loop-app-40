# Korn Ferry Loop

## Overview
Korn Ferry Loop is a full-stack web application designed for Korn Ferry consultants to manage the entire client engagement lifecycle across Discovery, Alignment, and Realization phases. Its core feature, **Loop Canvas**, is a conversational AI interface that leverages natural language for user interaction. The platform integrates AI for company research, strategic insights, streamlined client tracking, enhanced value case creation, and collaborative client interactions. It aims to provide actionable insights and data-driven value cases, evolving towards an account-centric architecture that supports role-based views for various teams (Sales, Consultants, Delivery, CSMs, Client Sponsors) to track promised versus delivered outcomes.

## User Preferences
- Consultants prefer strategic, actionable insights over basic company facts.
- Research should be relevant for management consulting engagements.
- UI should support quick access to multiple accounts and initiatives.
- Account-centric navigation: Users land on accounts first, then access role-based workspaces within each account.

## System Architecture

### UI/UX Decisions
The application features a modern, intuitive UI adhering to Korn Ferry branding guidelines, including a specific color palette, consistent typography (Aptos, Roboto Mono), and WCAG AA accessibility compliance. It uses visual cues such as pastel badge backgrounds, prominent highlighting for follow-up research, "New" badges, circular progress rings, and dynamic KPI gap visualization. Information hierarchy prioritizes insights and Korn Ferry Benchmark Callouts. The design is responsive, incorporates gradient accents, visual score representations, reduced text density, and collapsible sections for improved scannability. An enhanced UX for Jobs & Priorities visualizes the data flow from OKR Themes to Strategic Pillars with linkage completeness indicators and inline pillar assignment.

### Technical Implementations
The system is built on a robust architecture leveraging AI and a structured workflow. GPT-4o powers company research, insight generation, classification, value case and KPI recommendations, stakeholder-specific value narrative generation, on-demand industry baselines, notes enrichment, and targeted discovery questions. An **AI-Driven KPI Pipeline** automatically flows discovery insights into pre-filled commitment drafts with full provenance tracking. All AI-generated commitments include JSONB provenance metadata for audit trails and visual "AI Generated" badges. A quantitative value calculation framework includes financial metrics. The system integrates with Korn Ferry's knowledge base and supports a three-phase workflow (Discovery, Alignment, Realization), file uploads, voice notes, and a collaborative questionnaire system. Key features include a 360-Degree Discovery View, a Jobs & Priorities system with automatic theme generation, an Alignment Table UI for KPI management, Business Review management, KPI Progress Tracking, and a global Success Story Library. Shareable Alignment Collaboration allows secure client access for KPI editing. The AI-powered Value Justification Studio generates value narratives and executive summaries with version tracking. The platform supports an account-centric architecture with role-based workspaces (Sales and Delivery) that redistribute functionalities and integrate Value Realization Trends. The Sales Workspace includes a 4-stage journey (Discover, Design Outcomes, Client Alignment, Handoff) with AI-powered strategic recommendations and outcome generation. The Delivery Workspace offers a Health Dashboard, KPI Tracking, QBR support, Value Governance, and Success Capture. A Streamlined Discovery process includes Theme Selection, AI Intelligence gathering, interactive Question building (Green Sheet, Story Builder coach), and Insight summarization. Guided Discovery utilizes AI to generate methodology-tagged questions (SPIN, Miller Heiman, PSS). An Execution Canvas provides KPI health status and actionable next steps. An Interactive Green Sheet offers role-based coaching and editable call objective fields. The Interactive Story Builder provides a three-phase storytelling framework (BEFORE, DURING, AFTER) with coaching tips and a story test functionality. A Tension Questions System offers AI-powered question recommendations. An Executive Demo Mode provides a guided tour showcasing the Sales to Delivery journey using seeded demo data.

### System Design Choices
The AI strategy focuses on strategic and actionable insights, with data sorted by priority then confidence. The storage architecture is interface-based for future migration flexibility. Robust serialization handles date handling between frontend and backend. Cache management uses consistent string-first query keys and `invalidateQueries` for TanStack Query. Security includes server-side XSS protection via `sanitizeInput()` and React's default JSX escaping. Wouter is used for routing and URL-driven state. Discovery finalization locks structural changes while allowing KPI value refinement. The system employs an account-first hierarchy, with projects linked under accounts. Role detection for role-based workspaces is managed via URL parameters with validation.

### Tech Stack
- **Frontend**: React, TypeScript, Wouter, TanStack Query, Shadcn UI
- **Backend**: Express.js, TypeScript
- **AI**: OpenAI GPT-4o
- **Storage**: In-memory storage (MemStorage)

## Recent Changes (January 2026)
- **Evidence Pack Service Refactoring**: Extracted auto-populate logic from routes.ts (565KB) into dedicated `server/services/evidence-pack.service.ts` service module
  - EvidencePackService class with dependency injection (IStorage interface)
  - 6 modular import methods: KPIs, Insights, Stakeholders, Artifacts, Risks, Decisions
  - Enhanced deduplication with `sourceType-sourceId-itemType` composite keys
  - Standardized provenance tracking (sourceKind, sourceEventId, sourceArtifactId)
  - Fixed BlueSheet data access patterns (via `.data` property)
  - Corrected storage method names (getBlueSheet, getInteractionArtifacts)
  - Reduced routes.ts complexity by ~180 lines

## Recent Changes (December 2024)
- **Enhanced Customer Portal**: 
  - Discovery Summary in Overview tab: Shows executive summary, strategic themes, insights (collapsible), conversation notes (collapsible), and strategic implications
  - Baseline Editing: Clients with "edit" permission can modify outcome baselines/targets directly in the portal with visual feedback and save/cancel controls
  - "Why We Recommend This" explanations: Each outcome now includes recommendation rationale and Korn Ferry solution context
  - Client edit tracking: Shows "Edited by [name]" badge on outcomes modified by clients
  - PATCH `/api/portal/:token/outcome/:outcomeId` endpoint for baseline updates
- **AI-Powered Green Sheet Enrichment**: Pre-meeting documents can be analyzed to auto-populate call objectives, desired outcomes, opening statements, and contact details via POST `/api/projects/:id/green-sheet/enrich`
- **Discovery Toolkit Reorganization**: Pre-Meeting Materials section now appears above Green Sheet with "AI Context" badge to establish intuitive upload-then-enrich workflow
- **Strategy Selection Persistence**: Added `strategySelections` database table to persist strategy choices and generated outcomes per project. Enables restoring state when users return, with handoff confirmation gate before delivery handoff.
  - Database table: `strategySelections` with JSONB fields for `selectedStrategiesData` and `generatedOutcomesData`
  - API routes: GET/POST/PATCH `/api/projects/:projectId/strategy-selection`
  - Frontend: Auto-restores saved selections on mount, persists on confirm, handoff confirmation dialog
  - **Outcome-to-Commitment Conversion**: When outcomes are saved (status: outcomes_generated or outcomes_selected) or handoff is confirmed, selected outcomes are automatically converted to kpiCommitment records with:
    - Field mapping: outcomeName → commitmentTitle, valuePillar, KPI details (metric, unit, baseline, target)
    - Journey templates: Solution pattern is inferred from kornFerrySolution/kfOffering fields and OUTCOME_JOURNEY_TEMPLATES are injected for phases, quickWins, milestones
    - AI provenance tracking: Each commitment stores metadata about its origin (strategy outcome ID, generation timestamp)
    - Duplicate prevention: Existing commitment titles are checked to avoid creating duplicates
- **Unified Strategy-to-Outcomes Workflow**: StrategicAlignmentSelector is now the single entry point for outcome creation in Design Outcomes stage. AI generates outcomes based on selected strategies, creating them as drafts that flow through draft → proposed → confirmed workflow.
- **Narrative Outcome Display**: Replaced 3-column grid layout with storytelling format - outcomes grouped by Value Pillars (Grow, Optimise, De-risk, Strengthen) with "We will..." narrative presentation.
- **Enhanced Pipeline Visualization**: Header shows total value, pipeline status counts (Draft/Review/Confirmed), and visual progress bar.
- **Collapsible Outcomes in Progress**: Draft and pending review items now in collapsible section for cleaner view.
- **AI Schema Validation**: Zod transform normalizes invalid achievability values (e.g., "medium-high" → "medium").
- **"Copy Client Link" placeholder**: Shows "Coming Soon" toast until shareable link feature is fully implemented.

## External Dependencies
- **OpenAI GPT-4o**: Used for all AI-powered functionalities, including research, insight generation, recommendations, narrative creation, and industry baselines.
- **Clearout API**: Provides real-time company name autocomplete with logos.
- **Salesforce CRM**: Two-way integration for syncing accounts and opportunities (see Salesforce Integration section).

## Salesforce Integration
The platform supports two-way synchronization with Salesforce CRM to keep accounts and opportunities in sync.

### Features
- **OAuth 2.0 Authentication**: Connect Salesforce account via secure OAuth flow
- **Account Sync**: Pull Salesforce Accounts → local accounts, push local accounts → Salesforce
- **Opportunity Sync**: Pull Salesforce Opportunities → KPI Commitments, push commitments → Opportunities
- **Sync Logs**: Track all sync operations with success/failure counts
- **Manual Sync**: Trigger sync on demand with direction control (pull/push/bidirectional)

### Database Tables
- `salesforce_integrations`: Stores OAuth tokens and connection info
- `salesforce_account_links`: Maps local accounts ↔ Salesforce Account IDs
- `salesforce_opportunity_links`: Maps KPI commitments ↔ Salesforce Opportunity IDs
- `salesforce_sync_logs`: Audit trail of all sync operations

### Configuration (Environment Variables)
- `SALESFORCE_CLIENT_ID`: Connected App Consumer Key
- `SALESFORCE_CLIENT_SECRET`: Connected App Consumer Secret
- `SALESFORCE_CALLBACK_URL`: OAuth callback URL (e.g., `https://your-app.replit.app/api/integrations/salesforce/callback`)
- `SALESFORCE_LOGIN_URL`: Optional, defaults to `https://login.salesforce.com` (use `https://test.salesforce.com` for sandbox)

### API Routes
- `GET /api/integrations/salesforce/status`: Get connection status
- `GET /api/integrations/salesforce/auth`: Start OAuth flow
- `GET /api/integrations/salesforce/callback`: OAuth callback handler
- `POST /api/integrations/salesforce/disconnect`: Disconnect integration
- `POST /api/integrations/salesforce/sync`: Trigger manual sync with `{ direction: 'pull' | 'push' | 'bidirectional' }`
- `GET /api/integrations/salesforce/logs`: Get recent sync logs

### Frontend
- Settings icon in Accounts dashboard header → `/integrations` page
- Shows connection status, linked record counts, sync history
- Connect/disconnect buttons, manual sync with direction selector