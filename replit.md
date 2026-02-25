# Korn Ferry Loop

## Overview
Korn Ferry Loop is a full-stack web application designed for Korn Ferry consultants to manage the entire client engagement lifecycle across Discovery, Alignment, and Realization phases. Its primary feature, Loop Canvas, offers a conversational AI interface. The platform leverages AI for comprehensive company research, strategic insight generation, streamlined client tracking, enhanced value case creation, and collaborative client interactions. The goal is to deliver actionable insights and data-driven value cases, evolving into an account-centric architecture that provides role-based views for various teams to monitor promised versus delivered outcomes.

## User Preferences
- Consultants prefer strategic, actionable insights over basic company facts.
- Research should be relevant for management consulting engagements.
- UI should support quick access to multiple accounts and initiatives.
- Account-centric navigation: Users land on accounts first, then access role-based workspaces within each account.

## System Architecture

### UI/UX Decisions
The application features a modern, intuitive UI consistent with Korn Ferry branding guidelines, including a specific color palette, typography, and WCAG AA accessibility. It utilizes visual cues like pastel badges, highlighting for follow-up, "New" badges, progress rings, and dynamic KPI gap visualization. Information hierarchy prioritizes insights and Korn Ferry Benchmark Callouts. The design is responsive, incorporates gradient accents, visual score representations, reduced text density, and collapsible sections. An enhanced UX for Jobs & Priorities visualizes data flow from OKR Themes to Strategic Pillars with linkage completeness indicators and inline pillar assignment.

### Technical Implementations
The system is built on a robust architecture leveraging AI, primarily GPT-4o, for company research, insight generation, classification, value case and KPI recommendations, value narrative generation, industry baselines, notes enrichment, and targeted discovery questions. An AI-Driven KPI Pipeline automates the flow of discovery insights into commitment drafts with provenance tracking. All AI-generated commitments include JSONB metadata and visual badges. A quantitative value calculation framework includes financial metrics. The system integrates with Korn Ferry's knowledge base and supports a three-phase workflow (Discovery, Alignment, Realization), file uploads, voice notes, and a collaborative questionnaire system. Key features include a 360-Degree Discovery View, a Jobs & Priorities system with automatic theme generation, an Alignment Table UI for KPI management, Business Review management, KPI Progress Tracking, and a global Success Story Library. Shareable Alignment Collaboration enables secure client access for KPI editing. The AI-powered Value Justification Studio generates value narratives and executive summaries with version tracking. The platform supports an account-centric architecture with role-based workspaces (Sales and Delivery) that redistribute functionalities and integrate Value Realization Trends.

#### Living Evidence Pack
The Evidence Pack transforms discovery and outcome data into journey-based storytelling, organizing evidence into Leading, Mid-Loop, and Lagging narrative phases. It supports over 30 evidence types and includes a Trust Velocity Scorecard for behavioral quality metrics. It offers dual audience views (Client View and Coaching View) and visualizes story threads across phases with provenance tracking. Evidence is auto-populated from various sources.

#### Presentation Studio
The Presentation Studio is an AI-powered "seller's presentation coach" for generating branded, client-ready PowerPoint presentations. It aggregates data from across the platform (accounts, projects, KPIs, evidence packs, success stories, etc.) and uses GPT-4o to generate slide content, narratives, speaker notes, and coaching recommendations. It supports smart template selection, offers a coaching system, and allows multi-selection of 10 topic categories. Presentations can be tailored for various audiences and purposes, with export to .pptx using `pptxgenjs` including Korn Ferry branding and an image library. It integrates with Green Sheet objectives. Brand templates (from uploaded .pptx) take priority over slide style selection for colors/fonts; the style selector controls only content layout and tone when a brand template is active. All generated presentations are auto-saved to a browsable history repository with account/project context, allowing users to load, re-download, or delete past presentations.

Key coaching and intelligence features:
- **Presentation Readiness Scorecard**: AI evaluates decks across 5 dimensions (narrative flow, audience alignment, data support, call-to-action, completeness), displays score out of 100 with per-slide improvement suggestions and visual score ring.
- **Slide-Level AI Refinement**: 6 quick actions (make compelling, simplify for C-suite, add data, add differentiators, make concise, add storytelling) plus custom instructions per slide.
- **Rehearsal Mode**: Sellers practice delivery with talking points, get AI feedback on strengths/improvements, priority coverage, timing, and per-slide coaching with suggested opening/closing lines.
- **Competitive Battle Slides**: Perplexity API-powered "Add Battle Slide" action generates "Why Korn Ferry vs [Competitor]" comparison slides with real-time competitive intelligence.
- **Deal Context Auto-Pull**: Pulls deal stage, job themes, discovery notes, success stories from account/project data to auto-contextualize presentations.
- **Presentation History with Outcomes**: Stores all generated presentations with account/project context, browsable history with deal outcome tracking (won/lost/deferred/expanded/renewed).
- **Approval Workflow**: Route decks through coach review with submit/approve/reject actions and inline rejection comments.

#### Loop Canvas (Joule-Inspired AI Agent Workspace)
Loop Canvas is the core AI workspace, featuring a split-panel layout with live dashboards (left) and conversational chat (right). It offers proactive intelligence via automated briefings on portfolio health and action recommendations. It supports portfolio analytics (KPI health, phase breakdown, pipeline value) and persistent agent memory for personalized experiences. All tool responses include server-computed dashboard payloads. It orchestrates multi-step workflows (Discovery Setup, QBR Prep, Handoff) with progress indicators and provides AI explainability through confidence indicators, reasoning chains, and impact previews. The UI incorporates SVG chart components with Korn Ferry branding, voice I/O, and requires explicit user confirmation for write/edit operations. The AI can navigate users and perform over 25 tool functions.

#### Growth Accelerator (Working Backwards Toolkit)
The Growth Accelerator is a strategic sales enablement tool in the Sales Workspace, creating buyer-centric sales plays using the "Working Backwards" methodology. It follows a 4 W's framework (What to Know, What to Say, What to Show, What to Do). It leverages AI generation for buyer personas, hypotheses, buyer journeys, predictions, interview scripts, battle cards (with live competitive intelligence via Perplexity API), tenets, press releases, and sales actions. Data from Discovery auto-populates sections, and outputs can be pushed to the Evidence Pack as "Leading Evidence." It supports PDF export of the complete sales play document and integrates context into handoff packages.

### System Design Choices
The AI strategy prioritizes strategic and actionable insights, with data sorted by priority then confidence. The storage architecture is interface-based for migration flexibility. Robust serialization handles date management. Cache management uses consistent query keys and `invalidateQueries`. Security includes server-side XSS protection and React's default JSX escaping. Wouter is used for routing. Discovery finalization locks structural changes. The system uses an account-first hierarchy with role detection via URL parameters.

### Tech Stack
- **Frontend**: React, TypeScript, Wouter, TanStack Query, Shadcn UI
- **Backend**: Express.js, TypeScript
- **AI**: OpenAI GPT-4o
- **Storage**: In-memory storage (MemStorage)

## External Dependencies
- **OpenAI GPT-4o**: Powers all AI functionalities, including research, insight generation, recommendations, narrative creation, and industry baselines.
- **Clearout API**: Provides real-time company name autocomplete with logos.
- **Salesforce CRM**: Two-way integration for syncing accounts and opportunities, supporting OAuth 2.0, account and opportunity sync, sync logs, and manual sync.
- **Perplexity API**: (llama-3.1-sonar-small-128k-online model) used by Growth Accelerator for real-time competitive intelligence in battle card generation.
- **GitHub API**: (@octokit/rest) Connected via Replit integration for exporting project code to GitHub repositories. Export button available on the Accounts Dashboard header. Service file: `server/services/github.service.ts`.