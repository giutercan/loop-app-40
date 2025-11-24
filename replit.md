# Korn Ferry Value Lifecycle Application

## Overview
A full-stack web application for Korn Ferry consultants to manage client engagements across Discovery, Alignment, and Realization phases. It integrates AI for company research and strategic insights, streamlines client tracking, enhances value case creation, and facilitates collaborative client interactions to empower consultants in preparing for client meetings and building robust value cases.

## User Preferences
- Consultants prefer strategic, actionable insights over basic company facts.
- Research should be relevant for management consulting engagements.
- UI should support quick access to multiple projects.

## System Architecture

### UI/UX Decisions
- Pastel badge backgrounds for readability.
- Visual hierarchy for insights: Priority → Confidence → Pillar → Solution Area → KPIs.
- Prominent display for follow-up research with primary-colored highlighting and "New" badges.
- Optimistic UI updates for instant feedback.
- Interactive Alignment page features collapsible job cards, circular progress rings for KPI completion, dynamic KPI gap visualization, and percentage improvement badges.
- Enhanced header displays summary statistics with iconography.
- Korn Ferry Benchmark Callouts are highlighted.
- Responsive grid layouts with flex-wrap for mobile compatibility.
- **Terminology**: User-facing text refers to "Highlighted priorities" (instead of "jobs") for clarity and strategic focus. Internal code still uses "jobTheme" terminology.

### Technical Implementations
- **AI-Powered Company Research**: GPT-4o generates prioritized insights tagged with Korn Ferry pillars.
- **Automatic AI Classification**: Insights are classified into Korn Ferry capabilities with manual adjustment support.
- **Value Calculation Framework**: Quantitative value case system with financial calculations (NPV, payback period, 3-year projections) for key capabilities, including KPI metadata and financial translation formulas.
- **Korn Ferry Knowledge Structure Integration**: AI assigns solution areas and KPIs to insights based on Korn Ferry's knowledge base.
- **Company Search & Autocomplete**: Real-time company name autocomplete with logos via Clearout's API.
- **Engagement Management**: Structured three-phase (Discovery, Alignment, Realization) workflow.
- **Project Management**: Full project lifecycle management with a dashboard, creation, and phase-specific navigation.
- **Notes & Evidence System**: Users can select and organize insights grouped by AI-classified capabilities.
- **File Upload & Voice Notes**: Support for various document types (PDF, Word, Excel, images, text) and voice recordings with AI validation and error handling.
- **AI-Powered Notes Enrichment**: AI analyzes notes and attachments to extract strategic insights, classified into Korn Ferry capabilities and solution areas.
- **Collaborative Questionnaire System**: Secure, shareable links for client collaboration on discovery questions, tracking response attribution.
- **360-Degree Discovery View**: Consolidates all discovery data sources (research, enriched notes, questionnaire responses) for a comprehensive overview.
- **Jobs & Priorities Value Build System**: Transforms discovery insights into actionable value-building "Highlighted priorities" (user-facing terminology), including automatic job theme generation, priority selection via 3-slot visual picker, KPI selection, baseline data input, duplicate prevention, completion validation, and phase finalization.
- **Comprehensive Alignment Table UI**: Table-based interface showing all KPIs in one scannable view with clear baseline → target → benefit flow. Features inline editing with local state management, real-time gap calculations, improvement percentages, visual progress bars, and trending icons. Replaces linear KPI cards for improved data density and comprehensiveness.
- **Realization Phase - Phase 1**: Includes Business Review management, KPI Progress Tracking against baselines and targets, and Success Story linking.
- **AI-Powered Value Case Recommendations**: GPT-4o analyzes finalized Discovery jobs and KPIs to generate 3-5 strategic value case recommendations with action-oriented names, descriptions, linked jobs, suggested KPIs, financial estimates (NPV, payback period), and strategic rationale. Supports both AI-generated and custom value case creation.
- **Success Story Library**: Global repository of verified Korn Ferry success stories with approval workflow, industry/capability filtering, and metrics tracking. Stories include challenge, solution, results, and verified metrics to provide credible proof points for value narratives.
- **AI-Generated Value Narratives**: GPT-4o transforms value cases into stakeholder-specific narratives (CEO/CFO/CTO) using verified success stories. Each narrative is tailored with strategic focus (CEO), financial focus (CFO), or implementation focus (CTO), incorporating real Korn Ferry client outcomes as proof points. Includes copy-to-clipboard and export functionality.
- **AI-Powered KPI Recommendations**: GPT-4o analyzes job theme context (capability, solution area, company industry) to suggest 3-5 strategic KPIs from Korn Ferry's knowledge base. Each recommendation includes achievability scores (1-10), value impact scores (1-10), strategic rationale, Korn Ferry benchmarks, and one-click selection to add to tracking. Accessible via "Suggest KPIs" button on both Discovery Jobs & Priorities cards and Alignment page job cards.
- **Shareable Alignment Collaboration**: Consultants can generate secure, token-based shareable links for customers to view and edit KPI baselines/targets without authentication. Features include configurable permissions (view/edit), optional expiration dates, customer name attribution for all edits, comment fields for customer rationale, and real-time synchronization with consultant view. Attribution badges show who entered each value (consultant vs customer with name). Follows same security pattern as collaborative questionnaire system with crypto-secure tokens.
- **Job Theme-Based Discovery Questions**: AI-generated discovery questions are now exclusively based on job themes (highlighted priorities) identified in the Notes & Evidence system, ensuring questions are strategically targeted to the specific organizational capabilities and opportunities the consultant has chosen to focus on. **AI generates exactly 10 most impactful questions** (instead of 2-4 per capability), prioritizing questions that unlock the highest financial impact, validate critical assumptions, and have clear measurable KPI connections. Questions are no longer generated from all selected insights, but only from insights associated with job themes.
- **Client Response Insights**: Discovery Engagement Analysis automatically extracts key metrics, themes, and strategic discussion points from client questionnaire responses. Features include automatic metric detection (percentages, USD amounts, time periods), theme identification from keywords (challenges, opportunities, risks), and AI-generated discussion prompts tailored to response content. Provides consultants with strategic talking points and validation questions for their next client meeting.
- **Modernized UI/UX**: Both the KPI Recommendation Dialog and Build Value Case page feature contemporary design with gradient accents, visual score representations (progress bars), cleaner information hierarchy, and reduced text density for improved scannability.

### Feature Specifications
- **Discovery Phase**: Company research, data collection, note-taking, AI research, notes enrichment, collaborative questionnaires, and 360-degree discovery consolidation.
- **Alignment Phase**: Value case building and management, client collaboration, Jobs & Priorities system, AI-powered value case recommendations, and AI-generated value narratives with stakeholder customization.
- **Realization Phase**: Value tracking and continuous client engagement, including Business Review management, KPI Progress Tracking, and Success Story linking.
- **Data Model**: Simple schema with essential fields, including JSON provenance for AI data, confidence, priority, Korn Ferry pillar, solution area, related KPIs, tables for Realization phase entities, and success_story_library table for verified case studies with approval workflow.

### System Design Choices
- **AI Research Strategy**: Prioritizes strategic and actionable insights.
- **Data Sorting**: Insights sorted by priority then confidence.
- **Storage Architecture**: Interface-based for future migration to persistent storage.
- **Date Serialization**: Robust handling of date formats between frontend and backend.
- **Cache Invalidation & Query Keys**: Consistent string-first query keys and `invalidateQueries` for reliable TanStack Query cache management.
- **Security Architecture**: Server-side XSS protection via `sanitizeInput()` for input fields and React's default JSX escaping for output.
- **SPA Navigation & Breadcrumbs**: Wouter for routing and navigation, ensuring URL-driven state and defensive rendering.

### Tech Stack
- **Frontend**: React, TypeScript, Wouter, TanStack Query, Shadcn UI
- **Backend**: Express.js, TypeScript
- **AI**: OpenAI GPT-4o
- **Storage**: In-memory storage (MemStorage)

## External Dependencies
- **OpenAI GPT-4o**: For AI-powered company research, insight generation, value case recommendations, and stakeholder-specific value narrative generation.
- **Clearout API**: For real-time company autocomplete functionality.

## Recent Technical Changes
- **Value Case Terminology Refactor**: Renamed all "Value Hypothesis" references to "Value Case" across database, backend, and frontend for clarity.
- **AI Recommendation Schema**: Added nullable fields (linkedJobThemeIds, suggestedKPIs, estimatedNPV, estimatedPaybackMonths) to support AI-generated value cases that may span multiple capabilities.
- **Schema Flexibility**: Made capabilityName and solutionArea nullable to accommodate AI recommendations that don't fit rigid classification constraints.
- **Frontend Response Parsing**: Fixed API response handling to properly parse JSON from apiRequest() Response objects.
- **Success Story Library Implementation**: Added success_story_library table with approval workflow (pending/approved/archived), verification fields (source, approval_status), and comprehensive CRUD operations via storage interface and REST API.
- **AI Narrative Generation Service**: Implemented generateValueNarrative() function with strict Zod validation ensuring CEO/CFO/CTO narratives meet quality standards (minimum content lengths, required sections, success story integration).
- **Stakeholder-Specific Narratives**: ValueNarrativeDialog component provides tabbed interface for viewing CEO (strategic), CFO (financial), and CTO (implementation) narratives with copy-to-clipboard functionality and generation key-based stale data prevention.
- **KPI Progress Tracking Implementation**: Built complete KPI measurement tracking system with KPIProgressTracker component, RecordMeasurementDialog, and timeline visualization. Fixed critical React Hooks violation by refactoring to useQueries, added defensive loading guards, and enhanced status calculation to handle decreasing KPIs and regression detection.
- **Discovery Target Value Fix**: Added missing target value input fields to Jobs & Priorities tab, completing the baseline → target → measurement workflow. Improved type safety by using schema-derived JobThemeKPI and UpdateJobThemeKPIRequest types instead of custom interfaces.
- **Known UI Limitation**: Alignment page displays "£NaN" for AI-generated value cases without calculationResults; future enhancement planned to show estimatedNPV/payback when full calculations are absent.
- **AI KPI Recommendation System**: Implemented complete end-to-end AI KPI suggestion feature with generateKPIRecommendations() service, KPIRecommendationDialog component displaying Korn Ferry-branded recommendations with strategic rationale and scores, GET /api/job-themes/:id/recommend-kpis endpoint to retrieve existing recommendations, and cache invalidation fix using refetchType: "all" to ensure Alignment page refreshes immediately after KPI selection.
- **Alignment UI Redesign**: Completely redesigned Alignment page from linear KPI cards to comprehensive table layout addressing user feedback about "messy, not comprehensive" UI. New table shows KPI Metric | Current (Baseline) | → | Target (Desired) | Gap & Benefit columns with inline editing, local state synchronized via useEffect, real-time benefit calculations (gap value + improvement percentage), visual progress bars, and color-coded trending indicators. All input fields use onBlur persistence to backend with local state for immediate UI responsiveness.
- **Jobs & Priorities Interface Redesign**: Completely redesigned Jobs & Priorities workflow to address user feedback about "confusing, text-heavy, not user friendly" interface. New design features 3 Priority Slot Cards with embedded KPI configuration (eliminating separate sections), visual progress tracking showing X/3 priorities selected, duplicate prevention with toast notifications, completion validation requiring 3 priorities with ≥1 KPI each, helpful requirements messaging, and 2-column compact grid for available highlighted priorities. User-facing terminology changed from "jobs" to "Highlighted priorities" for clearer strategic communication.