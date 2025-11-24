# Korn Ferry Value Lifecycle Application

## Overview
A full-stack web application for Korn Ferry consultants to manage client engagements across Discovery, Alignment, and Realization phases. It integrates AI for company research and strategic insights, streamlines client tracking, enhances value case creation, and facilitates collaborative client interactions to empower consultants in preparing for client meetings and building robust value cases. The application aims to provide a comprehensive platform for managing the entire client engagement lifecycle, from initial research to value realization, with a focus on actionable insights and data-driven value cases.

## User Preferences
- Consultants prefer strategic, actionable insights over basic company facts.
- Research should be relevant for management consulting engagements.
- UI should support quick access to multiple projects.

## System Architecture

### UI/UX Decisions
The application prioritizes a modern, intuitive user interface with a consistent visual hierarchy. Key UI/UX decisions include:
- **Visual Cues**: Pastel badge backgrounds, prominent primary-colored highlighting for follow-up research, "New" badges, and optimistic UI updates.
- **Data Visualization**: Circular progress rings for KPI completion, dynamic KPI gap visualization, percentage improvement badges, and enhanced header displays with iconography.
- **Information Hierarchy**: Prioritization of insights (Priority → Confidence → Pillar → Solution Area → KPIs), and prominent display of Korn Ferry Benchmark Callouts.
- **Responsive Design**: Grid layouts with flex-wrap for mobile compatibility, 2-column KPI grid on desktop (single column on mobile).
- **Terminology**: User-facing text uses "Highlighted priorities" instead of internal "jobTheme" for clarity.
- **Modernized UI/UX**: Contemporary design with gradient accents, visual score representations, cleaner information hierarchy, and reduced text density for improved scannability in key areas like KPI recommendations and value case building.
- **Collapsible Priorities**: Job theme/priority cards feature collapsible sections using Radix UI Collapsible component with ChevronDown toggle for focused navigation.
- **KPI Organization**: KPIs are visually grouped by type (Primary KPIs vs Supporting KPIs) with distinct section headers and visual dividers for improved scannability.

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

### Tech Stack
- **Frontend**: React, TypeScript, Wouter, TanStack Query, Shadcn UI
- **Backend**: Express.js, TypeScript
- **AI**: OpenAI GPT-4o
- **Storage**: In-memory storage (MemStorage)

## External Dependencies
- **OpenAI GPT-4o**: For all AI-powered functionalities, including research, insight generation, recommendations, and narrative creation.
- **Clearout API**: For real-time company name autocomplete with logos.
- **Jobs & Priorities KPI Cards Modernization**: Completely redesigned KPI display in priority cards to match the beautiful KPI Recommendation Dialog design. AI-recommended KPIs now show gradient accent bars (purple→blue→cyan), Korn Ferry Recommended badges, visual score cards with progress bars for Achievability and Value Impact scores, strategic rationale sections, Korn Ferry Benchmark callouts with blue/cyan gradients, and measurement details (unit, frequency). Non-AI KPIs maintain clean modern styling with proper typography and spacing. Updated jobThemeWithKPIsSchema to include all AI recommendation fields (isAIRecommended, aiStrategicRationale, aiAchievabilityScore, aiValueImpactScore, aiKornFerryBenchmark, targetValue, targetSource) ensuring type safety across frontend and backend.
