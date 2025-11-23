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
- **AI-Powered Company Research**: GPT-5 generates prioritized insights tagged with Korn Ferry pillars.
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
- **AI-Powered Value Case Recommendations**: GPT-5 generates strategic value case recommendations based on finalized Discovery data, including action-oriented names, descriptions, linked jobs, suggested KPIs, financial estimates, and strategic rationale.

### Feature Specifications
- **Discovery Phase**: Company research, data collection, note-taking, AI research, notes enrichment, collaborative questionnaires, and 360-degree discovery consolidation.
- **Alignment Phase**: Value case building and management, client collaboration, Jobs & Priorities system, and AI-powered value case recommendations.
- **Realization Phase**: Value tracking and continuous client engagement, including Business Review management, KPI Progress Tracking, and Success Story linking.
- **Data Model**: Simple schema with essential fields, including JSON provenance for AI data, confidence, priority, Korn Ferry pillar, solution area, related KPIs, and tables for Realization phase entities.

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
- **AI**: OpenAI GPT-5
- **Storage**: In-memory storage (MemStorage)

## External Dependencies
- **OpenAI GPT-5**: For AI-powered company research and insight generation.
- **Clearout API**: For real-time company autocomplete functionality.