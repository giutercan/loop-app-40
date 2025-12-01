# Korn Ferry Value Lifecycle Application

## Overview
A full-stack web application for Korn Ferry consultants to manage client engagements across Discovery, Alignment, and Realization phases. It integrates AI for company research and strategic insights, streamlines client tracking, enhances value case creation, and facilitates collaborative client interactions. The application aims to provide a comprehensive platform for managing the entire client engagement lifecycle, from initial research to value realization, with a focus on actionable insights and data-driven value cases. The platform is evolving into an account-centric architecture, enabling role-based views across the customer journey and supporting various teams like Sales, Consultants, Delivery, CSMs, and Client Sponsors in tracking promised versus delivered outcomes.

## User Preferences
- Consultants prefer strategic, actionable insights over basic company facts.
- Research should be relevant for management consulting engagements.
- UI should support quick access to multiple accounts and initiatives.
- Account-centric navigation: Users land on accounts first, then access role-based workspaces within each account.

## System Architecture

### UI/UX Decisions
The application prioritizes a modern, intuitive user interface with official Korn Ferry branding. Key UI/UX decisions include a visual refresh with the Korn Ferry brand palette, consistent typography (Aptos, Roboto Mono), and WCAG AA accessibility compliance. It features visual cues like pastel badge backgrounds, prominent highlighting for follow-up research, and "New" badges. Data visualization includes circular progress rings and dynamic KPI gap visualization. Information hierarchy prioritizes insights and Korn Ferry Benchmark Callouts. The design is responsive, adapting to mobile and desktop views, and uses clear terminology like "Highlighted priorities." Modernized UI/UX incorporates gradient accents, visual score representations, and reduced text density. Collapsible sections for job theme/priority cards and visually grouped KPIs enhance scannability. An enhanced UX for Jobs & Priorities shows the complete data flow from OKR Themes to Strategic Pillars and Jobs, with linkage completeness indicators and inline pillar assignment.

### Technical Implementations
The system is built on a robust architecture leveraging AI and a structured workflow. GPT-4o powers company research, insight generation, classification into Korn Ferry capabilities, value case and KPI recommendations, stakeholder-specific value narrative generation, and on-demand industry baseline generation. It also enriches notes and generates targeted discovery questions. **AI-Driven KPI Pipeline**: Discovery insights automatically flow through the backend KPI generator (`generateDiscoveryKpiSuggestions`) into pre-filled commitment drafts with full provenance tracking. **Provenance Tracking**: All AI-generated commitments include JSONB provenance metadata (`{ source: "ai_generated", sourceInsightTitle, prefillData }`) enabling audit trails and visual "AI Generated" badges throughout the commitment pipeline. A quantitative value calculation framework includes financial calculations (NPV, payback period). The system integrates with Korn Ferry's knowledge base. It supports a three-phase (Discovery, Alignment, Realization) workflow, file uploads, voice notes, and a collaborative questionnaire system with secure, shareable links. A 360-Degree Discovery View consolidates data. The Jobs & Priorities system transforms insights into "Highlighted priorities" with automatic theme generation and KPI selection. An Alignment Table UI offers a scannable interface for KPIs with inline editing and real-time calculations. The Realization phase includes Business Review management, KPI Progress Tracking, and Success Story linking. A global Success Story Library provides filterable, verified case studies. Shareable Alignment Collaboration allows secure, token-based customer access for KPI editing. AI extracts insights from client questionnaire responses and generates discussion prompts. The Value Justification Studio, an AI-powered workspace, generates compelling value narratives, executive summaries, and offers an interactive chat for refinement, with version tracking. Post-Discovery finalization, structural changes are locked, but KPI value refinement is still possible. The platform is evolving to an account-centric architecture with role-based workspaces (Sales and Delivery) that redistribute Discovery/Alignment and Realization functionalities, integrating Value Realization Trends. This includes a Value Canvas, AI Discovery, Success Stories, Value Cases, and Handoff for Sales, and a Health Dashboard, KPI Tracking, QBR support, Value Governance, and Success Capture for Delivery.

### Feature Specifications
- **Discovery Phase**: Company research, data collection, note-taking, AI research, notes enrichment, collaborative questionnaires, and 360-degree discovery consolidation.
- **Alignment Phase**: Value case building, client collaboration, Jobs & Priorities system, AI-powered value case/KPI recommendations, and AI-generated value narratives.
- **Realization Phase**: Value tracking, Business Review management, KPI Progress Tracking, and Success Story linking.
- **Data Model**: Simple schema with essential fields, JSON provenance for AI data, confidence, priority, Korn Ferry pillar, solution area, related KPIs, and a success_story_library.
- **Value Realisation Framework** (shared/value-frameworks.ts):
  - **4 Value Pillars**: Grow (revenue/market share), Optimise (productivity/cost), De-risk (turnover/compliance), Strengthen Capability (leadership/culture)
  - **6 Solution Patterns**: Leadership Development, Talent Acquisition, Succession Planning, Culture Transformation, Org Design, Change Management
  - **KPI Library**: 50+ pre-defined KPIs with formulas, benchmarks, and pillar alignment (Leading Indicators + Lagging Indicators)
  - **Health Scores**: On Track, At Risk, Off Track, Needs Data - for tracking KPI progress with color-coded badges
  - **QBR Templates**: Standard quarterly business review structure with executive summary, value delivered, health overview, and strategic alignment sections
- **Account-centric Architecture**: Primary entity is now `accounts`, with `projects` as initiatives. Includes `accountUserRoles` (sales, consultant, delivery, csm, client_sponsor), `accountIssues`, and `evidenceArtefacts`.
- **Role-Based Workspaces**: 
  - **Sales Workspace (4-Stage Journey)**: 
    - **Discover**: Theme-driven AI research with methodology-tagged questions (SPIN, Miller Heiman, PSS), interactive call builder, and Green Sheet
    - **Build Value**: Overview dashboard, AI-Suggested KPIs from discovery, Commitments sub-tab, and Success Stories sub-tab
    - **Align**: Client collaboration, value agreement, and confirmation workflow
    - **Handoff**: Auto-populated confirmed commitments, Select All, bundle creation for CSM transfer
  - **Sales Workflow Progress**: Visual sidebar with stage completion indicators showing progress across all 4 stages
  - **Delivery Workspace**: Health Dashboard, KPI Tracking, QBR, Value Governance, Success Capture.
- **Guided Discovery**: AI generates methodology-tagged questions (SPIN Selling, Miller Heiman Strategic Selling, PSS Professional Selling Skills) with methodology stages, follow-up hints, and related KPIs. Questions are collapsible by methodology with mark-as-asked functionality.
- **Execution Canvas**: Enhanced with KPI health status overview (On Track, At Risk, Off Track, Needs Data), status-based color coding, current value tracking from actuals, and intelligent actionable next steps based on current progress.
- **Interactive Green Sheet**: Enhanced Miller Heiman Green Sheet with meeting contact identification (name, title, buying role, influence level). Provides role-based coaching for Economic Buyers, User Buyers, Technical Buyers, Coaches, and Champions. Includes editable call objective, desired outcome, opening statement, and best action commitment fields.
- **Interactive Story Builder**: Three-phase storytelling framework for building compelling narratives:
  - BEFORE (Craft): Single provocative message, emotional reaction selection, story structure templates (Situation-Struggle-Insight-Outcome, Problem-Agitate-Solve, etc.), starting hook, hero character, and evidence to reference.
  - DURING (Tell): Opening line, turning point, key data points, with coaching tips for pacing and delivery.
  - AFTER (Land): Moment of meaning, explicit takeaway, and call to action. Includes story test functionality to validate if stories are compelling (stranger care test, simplicity test, leadership values test) with visual readiness scoring.
  - **Tension Questions System**: Enhanced question management with AI-powered recommendations tagged by sales methodology (SPIN, Miller Heiman, PSS). Features include:
    - Story Questions Coach dialog for generating contextual questions based on Green Sheet contact info and discovery themes
    - Multi-select question picker with methodology badges and expected outcomes
    - Custom question input for manual additions
    - Individual response fields for each selected question
    - Auto-save with version tracking and debounce to prevent data loss
    - Backward compatibility migration from legacy single-field `tensionQuestion` to new `tensionQuestions` array structure
- **Executive Demo Mode**: Guided tour showcasing the complete Sales → Delivery journey using Chanel as a fictitious luxury retail customer.
  - **Demo Activation**: Purple "Executive Demo" button in header triggers demo mode with dialog explaining what users will see.
  - **Demo Data Seeding**: POST `/api/demo/seed-chanel` endpoint creates complete Chanel account, project, job themes, KPI commitments, and handoff packets. Use `?force=true` query param to reseed fresh data.
  - **Guided Tour**: React Joyride-powered tour with 13 steps highlighting key features with executive-focused messaging (AI time savings, decision quality, seamless workflows).
  - **Tour Anchors**: `data-demo-step` attributes on key UI elements: account-header, workflow-progress, discovery-research, insight-card, kpi-suggestions, benchmark-display, multi-select, kpi-pipeline, handoff-section, value-summary, delivery-dashboard, incoming-handoffs, kpi-tracking.
  - **Demo Data Structure**: Creates Chanel account with €12.5M promised value, 3 KPI commitments (Leadership Succession, Director Productivity, HiPo Retention), 2 handoff packets (1 accepted, 1 pending for demo), 4 job themes with Korn Ferry solution mappings.
  - **Demo Files**: `client/src/demo/` contains ExecutiveDemoTour.tsx, DemoModeContext.tsx, DemoModeButton.tsx, and chanel-demo-data.ts.

### System Design Choices
- **AI Strategy**: Focuses on strategic and actionable insights.
- **Data Sorting**: Insights sorted by priority then confidence.
- **Storage Architecture**: Interface-based for future migration.
- **Date Handling**: Robust serialization between frontend and backend.
- **Cache Management**: Consistent string-first query keys and `invalidateQueries` for TanStack Query.
- **Security**: Server-side XSS protection via `sanitizeInput()` and React's default JSX escaping.
- **Navigation**: Wouter for routing and URL-driven state.
- **Discovery Finalization**: Locks structural changes while allowing KPI value refinement.
- **Account-First Hierarchy**: Accounts are the primary entry point, with projects linked under them.
- **Role Detection**: Via URL parameters with validation for role-based workspaces.

### Tech Stack
- **Frontend**: React, TypeScript, Wouter, TanStack Query, Shadcn UI
- **Backend**: Express.js, TypeScript
- **AI**: OpenAI GPT-4o
- **Storage**: In-memory storage (MemStorage)

## External Dependencies
- **OpenAI GPT-4o**: For all AI-powered functionalities (research, insight generation, recommendations, narrative creation, industry baselines).
- **Clearout API**: For real-time company name autocomplete with logos.