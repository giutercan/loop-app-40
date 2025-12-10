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

## External Dependencies
- **OpenAI GPT-4o**: Used for all AI-powered functionalities, including research, insight generation, recommendations, narrative creation, and industry baselines.
- **Clearout API**: Provides real-time company name autocomplete with logos.