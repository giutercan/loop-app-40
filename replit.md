# Korn Ferry Value Lifecycle Application

## Overview
A full-stack web application for Korn Ferry consultants to manage client engagements across Discovery, Alignment, and Realization phases. It integrates AI for company research and strategic insights, streamlines client tracking, enhances value case creation, and facilitates collaborative client interactions. The application aims to provide a comprehensive platform for managing the entire client engagement lifecycle, from initial research to value realization, with a focus on actionable insights and data-driven value cases. The platform is evolving into an account-centric architecture, enabling role-based views across the customer journey and supporting various teams like Sales, Consultants, Delivery, CSMs, and Client Sponsors in tracking promised versus delivered outcomes.

## User Preferences
- Consultants prefer strategic, actionable insights over basic company facts.
- Research should be relevant for management consulting engagements.
- UI should support quick access to multiple projects.

## System Architecture

### UI/UX Decisions
The application prioritizes a modern, intuitive user interface with official Korn Ferry branding. Key UI/UX decisions include a visual refresh with the Korn Ferry brand palette, consistent typography (Aptos, Roboto Mono), and WCAG AA accessibility compliance. It features visual cues like pastel badge backgrounds, prominent highlighting for follow-up research, and "New" badges. Data visualization includes circular progress rings and dynamic KPI gap visualization. Information hierarchy prioritizes insights and Korn Ferry Benchmark Callouts. The design is responsive, adapting to mobile and desktop views, and uses clear terminology like "Highlighted priorities." Modernized UI/UX incorporates gradient accents, visual score representations, and reduced text density. Collapsible sections for job theme/priority cards and visually grouped KPIs enhance scannability. An enhanced UX for Jobs & Priorities shows the complete data flow from OKR Themes to Strategic Pillars and Jobs, with linkage completeness indicators and inline pillar assignment.

### Technical Implementations
The system is built on a robust architecture leveraging AI and a structured workflow. GPT-4o powers company research, insight generation, classification into Korn Ferry capabilities, value case and KPI recommendations, stakeholder-specific value narrative generation, and on-demand industry baseline generation. It also enriches notes and generates targeted discovery questions. A quantitative value calculation framework includes financial calculations (NPV, payback period). The system integrates with Korn Ferry's knowledge base. It supports a three-phase (Discovery, Alignment, Realization) workflow, file uploads, voice notes, and a collaborative questionnaire system with secure, shareable links. A 360-Degree Discovery View consolidates data. The Jobs & Priorities system transforms insights into "Highlighted priorities" with automatic theme generation and KPI selection. An Alignment Table UI offers a scannable interface for KPIs with inline editing and real-time calculations. The Realization phase includes Business Review management, KPI Progress Tracking, and Success Story linking. A global Success Story Library provides filterable, verified case studies. Shareable Alignment Collaboration allows secure, token-based customer access for KPI editing. AI extracts insights from client questionnaire responses and generates discussion prompts. The Value Justification Studio, an AI-powered workspace, generates compelling value narratives, executive summaries, and offers an interactive chat for refinement, with version tracking. Post-Discovery finalization, structural changes are locked, but KPI value refinement is still possible. The platform is evolving to an account-centric architecture with role-based workspaces (Sales and Delivery) that redistribute Discovery/Alignment and Realization functionalities, integrating Value Realization Trends. This includes a Value Canvas, AI Discovery, Success Stories, Value Cases, and Handoff for Sales, and a Health Dashboard, KPI Tracking, QBR support, Value Governance, and Success Capture for Delivery.

### Feature Specifications
- **Discovery Phase**: Company research, data collection, note-taking, AI research, notes enrichment, collaborative questionnaires, and 360-degree discovery consolidation.
- **Alignment Phase**: Value case building, client collaboration, Jobs & Priorities system, AI-powered value case/KPI recommendations, and AI-generated value narratives.
- **Realization Phase**: Value tracking, Business Review management, KPI Progress Tracking, and Success Story linking.
- **Data Model**: Simple schema with essential fields, JSON provenance for AI data, confidence, priority, Korn Ferry pillar, solution area, related KPIs, and a success_story_library.
- **Account-centric Architecture**: Primary entity is now `accounts`, with `projects` as initiatives. Includes `accountUserRoles` (sales, consultant, delivery, csm, client_sponsor), `accountIssues`, and `evidenceArtefacts`.
- **Role-Based Workspaces**: Sales Workspace (Value Canvas, AI Discovery, Success Stories, Value Cases, Handoff) and Delivery Workspace (Health Dashboard, KPI Tracking, QBR, Value Governance, Success Capture).

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