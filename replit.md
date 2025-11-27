# Korn Ferry Value Lifecycle Application

## Overview
A full-stack web application for Korn Ferry consultants to manage client engagements across Discovery, Alignment, and Realization phases. It integrates AI for company research and strategic insights, streamlines client tracking, enhances value case creation, and facilitates collaborative client interactions to empower consultants in preparing for client meetings and building robust value cases. The application aims to provide a comprehensive platform for managing the entire client engagement lifecycle, from initial research to value realization, with a focus on actionable insights and data-driven value cases.

## User Preferences
- Consultants prefer strategic, actionable insights over basic company facts.
- Research should be relevant for management consulting engagements.
- UI should support quick access to multiple projects.

## System Architecture

### UI/UX Decisions
The application prioritizes a modern, intuitive user interface with a consistent visual hierarchy and official Korn Ferry branding. Key UI/UX decisions include:
- **Korn Ferry Brand Identity (November 2024)**: Complete visual refresh applying official Korn Ferry brand palette throughout the application:
  - Primary: Deep Forest Green (#00634F) for CTAs, navigation, key actions
  - Secondary: Ocean Blue (#005971) for interactive elements and links
  - Accent: Emerald (#009B77) for success states, Mint (#05C690) for highlights
  - Supporting: Lime Green (#8DC63F), Cyan (#00ADBB), Purple (#A3238E), Navy (#00173B)
  - Neutral: Gray (#929192), Light Gray (#DAD8D6) for backgrounds
  - Typography: Aptos font family with Roboto Mono for data/code
  - Professional Imagery: Strategic use of high-quality business photography on landing page hero and empty states
  - Accessibility: All text meets WCAG AA contrast requirements (≥4.5:1)
- **Visual Cues**: Pastel badge backgrounds, prominent primary-colored highlighting for follow-up research, "New" badges, and optimistic UI updates.
- **Data Visualization**: Circular progress rings for KPI completion, dynamic KPI gap visualization, percentage improvement badges, and enhanced header displays with iconography.
- **Information Hierarchy**: Prioritization of insights (Priority → Confidence → Pillar → Solution Area → KPIs), and prominent display of Korn Ferry Benchmark Callouts.
- **Responsive Design**: Grid layouts with flex-wrap for mobile compatibility, 2-column KPI grid on desktop (single column on mobile).
- **Terminology**: User-facing text uses "Highlighted priorities" instead of internal "jobTheme" for clarity.
- **Modernized UI/UX**: Contemporary design with gradient accents using brand colors, visual score representations, cleaner information hierarchy, and reduced text density for improved scannability in key areas like KPI recommendations and value case building.
- **Collapsible Priorities**: Job theme/priority cards feature collapsible sections using Radix UI Collapsible component with ChevronDown toggle for focused navigation.
- **KPI Organization**: KPIs are visually grouped by type (Primary KPIs vs Supporting KPIs) with distinct section headers and visual dividers for improved scannability.
- **Jobs & Priorities Strategic Thread (November 2024)**: Enhanced UX showing the complete data flow from Discovery to Jobs:
  - Strategic Thread panel displays visual flow: OKR Themes → Strategic Pillars → Jobs with counts
  - Linkage completeness indicator showing X/Y pillars have linked jobs with checkmark/warning icons
  - "Needs Assignment" filter (amber styling) replaces confusing "Unlinked" terminology
  - Inline pillar assignment dropdown on unassigned job cards for quick linking
  - Amber highlighting on jobs needing pillar assignment to draw attention to incomplete setup

### Technical Implementations
The system is built on a robust architecture incorporating AI and a structured workflow:
- **AI-Powered Capabilities**: GPT-4o is utilized for company research, insight generation, automatic classification into Korn Ferry capabilities, value case recommendations, KPI recommendations, stakeholder-specific value narrative generation, and on-demand industry baseline generation. AI also enriches notes and generates targeted discovery questions based on identified "job themes."
- **AI Industry Baseline Generation**: For selected KPIs without existing benchmarks, consultants can trigger AI to generate industry-standard baseline values with contextual sources, automatically persisted for immediate use in baseline setting.
- **Value Calculation Framework**: A quantitative value case system includes financial calculations (NPV, payback period, 3-year projections) with KPI metadata and financial translation formulas.
- **Korn Ferry Knowledge Integration**: AI integrates with Korn Ferry's knowledge base for assigning solution areas and KPIs.
- **Engagement & Project Management**: Structured three-phase (Discovery, Alignment, Realization) workflow with full project lifecycle management.
- **Data Collection & Collaboration**: Supports file uploads, voice notes, and a collaborative questionnaire system with secure, shareable links and client response attribution.
- **360-Degree Discovery View**: Consolidates all discovery data sources for comprehensive overviews.
- **Jobs & Priorities System**: Transforms discovery insights into actionable "Highlighted priorities" with automatic theme generation, KPI selection, baseline data input, and completion validation.
- **Alignment Table UI**: A comprehensive, scannable table interface for all KPIs, featuring inline editing, real-time gap calculations, improvement percentages, visual progress bars, and trending icons.
- **Realization Phase**: Includes Business Review management, KPI Progress Tracking against baselines and targets, and Success Story linking.
- **Success Story Library**: A global, filterable repository of verified Korn Ferry success stories with an approval workflow to provide credible proof points.
- **Shareable Alignment Collaboration**: Secure, token-based shareable links allow customers to view and edit KPI baselines/targets without authentication, with configurable permissions and attribution.
- **Client Response Insights**: AI automatically extracts key metrics, themes, and strategic discussion points from client questionnaire responses, generating discussion prompts for consultants.
- **Value Justification Studio (November 2024)**: AI-powered workspace integrated into Priority detail view that generates compelling value narratives from Discovery insights, KPIs, and benchmarks. Features include:
  - Journey Flow visualization showing Discovery → KPIs → Value progression with insight/KPI counts
  - AI draft generation using GPT-4o that synthesizes Discovery data (insights, notes, questionnaire responses) with KPI gaps and benchmarks
  - Executive summary auto-generation with projected value and confidence levels
  - Interactive chat interface for refining drafts (adjust tone, focus areas, add details)
  - Source context panel displaying linked Discovery insights and KPI improvements used in generation
  - Version tracking with copy/regenerate functionality
  - Database tables: valueJustifications (stores drafts with Discovery/KPI linkage) and valueJustificationMessages (chat history)

### Feature Specifications
- **Discovery Phase**: Company research, data collection, note-taking, AI research, notes enrichment, collaborative questionnaires, and 360-degree discovery consolidation.
- **Alignment Phase**: Value case building and management, client collaboration, Jobs & Priorities system, AI-powered value case recommendations, and AI-generated value narratives with stakeholder customization.
- **Realization Phase**: Value tracking and continuous client engagement, including Business Review management, KPI Progress Tracking, and Success Story linking.
- **Data Model**: Simple schema with essential fields, including JSON provenance for AI data, confidence, priority, Korn Ferry pillar, solution area, related KPIs, tables for Realization phase entities, and a success_story_library table for verified case studies with approval workflow.

### System Design Choices
- **AI Strategy**: Focuses on strategic and actionable insights.
- **Data Sorting**: Insights are sorted by priority then confidence.
- **Storage Architecture**: Interface-based for future migration to persistent storage.
- **Date Handling**: Robust date serialization between frontend and backend.
- **Cache Management**: Consistent string-first query keys and `invalidateQueries` for TanStack Query.
- **Security**: Server-side XSS protection via `sanitizeInput()` and React's default JSX escaping.
- **Navigation**: Wouter for routing and URL-driven state, ensuring defensive rendering.
- **Discovery Finalization Behavior (November 2024)**: After Discovery is finalized, structural changes are locked (no adding/removing jobs or KPIs), but KPI value refinement remains available. Consultants can edit baseline values, baseline sources, target values, target sources, and generate AI industry benchmarks even after finalization, enabling iterative data refinement throughout the engagement. Job re-prioritization is handled through the dedicated Re-prioritize feature in the Alignment phase.

### Tech Stack
- **Frontend**: React, TypeScript, Wouter, TanStack Query, Shadcn UI
- **Backend**: Express.js, TypeScript
- **AI**: OpenAI GPT-4o
- **Storage**: In-memory storage (MemStorage)

## External Dependencies
- **OpenAI GPT-4o**: For all AI-powered functionalities, including research, insight generation, recommendations, and narrative creation.
- **Clearout API**: For real-time company name autocomplete with logos.
- **Jobs & Priorities KPI Cards Modernization**: Completely redesigned KPI display in priority cards to match the beautiful KPI Recommendation Dialog design. AI-recommended KPIs now show gradient accent bars (purple→blue→cyan), Korn Ferry Recommended badges, visual score cards with progress bars for Achievability and Value Impact scores, strategic rationale sections, Korn Ferry Benchmark callouts with blue/cyan gradients, and measurement details (unit, frequency). Non-AI KPIs maintain clean modern styling with proper typography and spacing. Updated jobThemeWithKPIsSchema to include all AI recommendation fields (isAIRecommended, aiStrategicRationale, aiAchievabilityScore, aiValueImpactScore, aiKornFerryBenchmark, targetValue, targetSource) ensuring type safety across frontend and backend.

## Client Value Hub (November 2024)

### Overview
Evolution of the Value Lifecycle Platform into an account-centric architecture enabling role-based views across the customer journey. Sales, Consultants, Delivery teams, CSMs, and Client Sponsors can view tailored slices of shared data tracking promised versus delivered outcomes with QBR support.

### Architecture Changes
- **Account as Primary Entity**: Accounts are now the top-level organizing entity, with projects functioning as "initiatives" under accounts
- **Role-Based Access**: AccountUserRoles table with enum: sales, consultant, delivery, csm, client_sponsor
- **Value Spine**: Aggregated view showing account health, all initiatives, KPIs, and value metrics across the entire engagement

### New Database Entities
- `accounts`: Primary organizing entity (name, industry, tier, contractStartDate, healthScore, etc.)
- `accountUserRoles`: Maps users to roles per account (role enum: sales|consultant|delivery|csm|client_sponsor)
- `accountIssues`: Opportunities, risks, and issues tracked at account level (title, description, severity, type, status, linkedInitiativeId)
- `evidenceArtefacts`: QBR support artifacts (artefactType: screenshot|document|report|testimonial|data_export, sourceUrl, linkedInitiativeId, linkedKpiId)
- Extended `projects` with `accountId` FK to link initiatives to accounts

### API Endpoints
- `GET/POST/PATCH/DELETE /api/accounts` - Account CRUD
- `GET /api/accounts/:id/value-spine` - Aggregated value data for account view
- `GET /api/accounts/:id/initiatives` - All initiatives under account
- `GET/POST /api/accounts/:id/user-roles` - Role management
- `DELETE /api/account-user-roles/:id` - Remove user role
- `GET/POST /api/accounts/:id/issues` - Account issues
- `GET/PATCH/DELETE /api/account-issues/:id` - Issue management
- `GET/POST /api/accounts/:id/evidence-artefacts` - Evidence artifacts
- `GET/PATCH/DELETE /api/evidence-artefacts/:id` - Artifact management

### Navigation Architecture (November 2024)
- **Accounts-First Hierarchy**: Landing page now leads with Accounts as the primary entry point with main CTAs pointing to /accounts
- **Project-Account Linking**: New project creation flow includes optional account selector to link projects to parent accounts
- **Breadcrumb Trail**: Always starts with Accounts → conditionally shows parent account → Projects → Project → Phase for consistent hierarchy navigation
- **Sidebar Navigation**: Always exposes "All Accounts" and "All Projects" links, plus parent account shortcut when project is linked to an account
- **Account Grouping**: Projects dashboard supports filtering by account and displays account badges on project cards
