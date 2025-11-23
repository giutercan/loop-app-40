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
- **Jobs & Priorities Value Build System**: Transforms discovery insights into actionable value-building priorities, including automatic job theme generation, job prioritization, KPI selection, baseline data input, and phase finalization.
- **Interactive Alignment Page**: Visual interface for KPI configuration, gap visualization, and AI-powered benchmark generation with optimistic UI updates.
- **Realization Phase - Phase 1**: Includes Business Review management, KPI Progress Tracking against baselines and targets, and Success Story linking.
- **AI-Powered Value Case Recommendations**: GPT-4o analyzes finalized Discovery jobs and KPIs to generate 3-5 strategic value case recommendations with action-oriented names, descriptions, linked jobs, suggested KPIs, financial estimates (NPV, payback period), and strategic rationale. Supports both AI-generated and custom value case creation.
- **Success Story Library**: Global repository of verified Korn Ferry success stories with approval workflow, industry/capability filtering, and metrics tracking. Stories include challenge, solution, results, and verified metrics to provide credible proof points for value narratives.
- **AI-Generated Value Narratives**: GPT-4o transforms value cases into stakeholder-specific narratives (CEO/CFO/CTO) using verified success stories. Each narrative is tailored with strategic focus (CEO), financial focus (CFO), or implementation focus (CTO), incorporating real Korn Ferry client outcomes as proof points. Includes copy-to-clipboard and export functionality.

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