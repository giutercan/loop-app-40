# Korn Ferry Loop

## Overview
Korn Ferry Loop is a full-stack web application for Korn Ferry consultants to manage the entire client engagement lifecycle across Discovery, Alignment, and Realization phases. Its core feature, Loop Canvas, is a conversational AI interface. The platform uses AI for company research, strategic insights, streamlined client tracking, enhanced value case creation, and collaborative client interactions. It aims to provide actionable insights and data-driven value cases, evolving towards an account-centric architecture that supports role-based views for various teams to track promised versus delivered outcomes.

## User Preferences
- Consultants prefer strategic, actionable insights over basic company facts.
- Research should be relevant for management consulting engagements.
- UI should support quick access to multiple accounts and initiatives.
- Account-centric navigation: Users land on accounts first, then access role-based workspaces within each account.

## System Architecture

### UI/UX Decisions
The application features a modern, intuitive UI adhering to Korn Ferry branding guidelines, including a specific color palette, consistent typography, and WCAG AA accessibility compliance. It uses visual cues such as pastel badge backgrounds, highlighting for follow-up research, "New" badges, circular progress rings, and dynamic KPI gap visualization. Information hierarchy prioritizes insights and Korn Ferry Benchmark Callouts. The design is responsive, incorporates gradient accents, visual score representations, reduced text density, and collapsible sections. An enhanced UX for Jobs & Priorities visualizes data flow from OKR Themes to Strategic Pillars with linkage completeness indicators and inline pillar assignment.

### Technical Implementations
The system is built on a robust architecture leveraging AI and a structured workflow. GPT-4o powers company research, insight generation, classification, value case and KPI recommendations, stakeholder-specific value narrative generation, on-demand industry baselines, notes enrichment, and targeted discovery questions. An AI-Driven KPI Pipeline automatically flows discovery insights into pre-filled commitment drafts with full provenance tracking. All AI-generated commitments include JSONB provenance metadata and visual "AI Generated" badges. A quantitative value calculation framework includes financial metrics. The system integrates with Korn Ferry's knowledge base and supports a three-phase workflow (Discovery, Alignment, Realization), file uploads, voice notes, and a collaborative questionnaire system. Key features include a 360-Degree Discovery View, a Jobs & Priorities system with automatic theme generation, an Alignment Table UI for KPI management, Business Review management, KPI Progress Tracking, and a global Success Story Library. Shareable Alignment Collaboration allows secure client access for KPI editing. The AI-powered Value Justification Studio generates value narratives and executive summaries with version tracking. The platform supports an account-centric architecture with role-based workspaces (Sales and Delivery) that redistribute functionalities and integrate Value Realization Trends. The Sales Workspace includes a 4-stage journey (Discover, Design Outcomes, Client Alignment, Handoff) with AI-powered strategic recommendations and outcome generation. The Delivery Workspace offers a Health Dashboard, KPI Tracking, QBR support, Value Governance, and Success Capture. A Streamlined Discovery process includes Theme Selection, AI Intelligence gathering, interactive Question building, and Insight summarization. Guided Discovery utilizes AI to generate methodology-tagged questions. An Execution Canvas provides KPI health status and actionable next steps.

#### Living Evidence Pack (Miller Heiman Blue Sheet Integration)
The Evidence Pack transforms from a data dump into journey-based storytelling, organizing evidence into three narrative phases: **Leading** (discovery signals: insights, stakeholder priorities, risk articulations), **Mid-Loop** (behavior under pressure: assumption revisions, methodology compliance, sponsor alignment), and **Lagging** (results with context: KPI outcomes, success stories, reusability patterns). Features include:
- **30+ Evidence Types**: kpi_result, case_study, testimonial, methodology_metric, client_feedback, third_party_validation, roi_calculation, risk_mitigation, timeline_achievement, stakeholder_quote, success_frame, behavior_signal, assumption_revision, risk_articulation, handoff_quality, reusability_pattern, trust_milestone.
- **Trust Velocity Scorecard**: Behavioral quality metrics (Success Frame Clarity, Method Adherence, Sponsor Alignment, Handoff Completeness) with 0-100 scores and color-coded progress rings.
- **Dual Audience Views**: Client View shows "The Value Story" with visual journey timeline (Discovered → Adapted → Achieved), three-column narrative summary, and key metrics. Coaching View shows phase-based journey organization with story thread connectors and evidence completeness indicators.
- **Story Thread Visualization**: Phase-based flow connectors showing story progression across Leading → Mid-Loop → Lagging phases with "Leads to" arrows and "Complete journey documented" indicators.
- **Provenance Tracking**: Full sourceType and source metadata with "What this proves" summaries and visual source attribution.
- **Auto-Population**: Automatically populates from Discovery insights, KPI commitments, success stories, and client feedback with phase assignment based on source type.

An Interactive Green Sheet offers role-based coaching and editable call objective fields. The Interactive Story Builder provides a three-phase storytelling framework with coaching tips and a story test functionality. A Tension Questions System offers AI-powered question recommendations. An Executive Demo Mode provides a guided tour showcasing the Sales to Delivery journey using seeded demo data.

#### Growth Accelerator (Working Backwards Toolkit)
The Growth Accelerator is a strategic sales enablement tool in the Sales Workspace that creates buyer-centric sales plays using the "Working Backwards" methodology. It follows a 4 W's framework: **What to Know** (Buyer Persona 4-quadrant model, Hypotheses, Buyer Journey 5-phase, Predictions 2x2 matrix, Interview Questions), **What to Say** (Tenets, Press Release), **What to Show** (Battle Cards), **What to Do** (Actions). Key features include:
- **Data Flow**: Discovery → GA → Evidence Pack. Discovery data auto-populates Persona Facts, Goals/Pains, Journey context. GA outputs push to Evidence Pack as "Leading Evidence."
- **AI Generation**: Endpoints for generate-persona, generate-hypotheses, generate-journey, generate-predictions, push-to-evidence-pack.
- **Database Tables**: `growth_accelerator_canvases`, `ga_buyer_personas`, `ga_hypotheses`, `ga_buyer_journeys`, `ga_predictions`, `ga_tenets`, `ga_press_releases`, `ga_competitor_battle_cards`, `ga_interview_questions`, `ga_sales_play_actions`.
- **Handoff Integration**: GA context (buyer persona summary, hypotheses, risky predictions, competitive highlights, press release elements) automatically included in handoff packages via `growthAcceleratorContext` field.

### System Design Choices
The AI strategy focuses on strategic and actionable insights, with data sorted by priority then confidence. The storage architecture is interface-based for future migration flexibility. Robust serialization handles date handling between frontend and backend. Cache management uses consistent string-first query keys and `invalidateQueries` for TanStack Query. Security includes server-side XSS protection via `sanitizeInput()` and React's default JSX escaping. Wouter is used for routing and URL-driven state. Discovery finalization locks structural changes while allowing KPI value refinement. The system employs an account-first hierarchy, with projects linked under accounts. Role detection for role-based workspaces is managed via URL parameters with validation.

### Tech Stack
- **Frontend**: React, TypeScript, Wouter, TanStack Query, Shadcn UI
- **Backend**: Express.js, TypeScript
- **AI**: OpenAI GPT-4o
- **Storage**: In-memory storage (MemStorage)

## External Dependencies
- **OpenAI GPT-4o**: Used for all AI-powered functionalities, including research, insight generation, recommendations, narrative creation, and industry baselines.
- **Clearout API**: Provides real-time company name autocomplete with logos.
- **Salesforce CRM**: Two-way integration for syncing accounts and opportunities.
  - **Features**: OAuth 2.0 Authentication, Account Sync (pull/push), Opportunity Sync (pull/push KPI Commitments), Sync Logs, Manual Sync.
  - **Database Tables**: `salesforce_integrations`, `salesforce_account_links`, `salesforce_opportunity_links`, `salesforce_sync_logs`.
  - **Configuration**: Environment variables for `SALESFORCE_CLIENT_ID`, `SALESFORCE_CLIENT_SECRET`, `SALESFORCE_CALLBACK_URL`, `SALESFORCE_LOGIN_URL`.
  - **API Routes**: `GET /api/integrations/salesforce/status`, `GET /api/integrations/salesforce/auth`, `GET /api/integrations/salesforce/callback`, `POST /api/integrations/salesforce/disconnect`, `POST /api/integrations/salesforce/sync`, `GET /api/integrations/salesforce/logs`.
  - **Frontend**: Settings integration in Accounts dashboard, showing status, linked records, sync history, and control buttons.