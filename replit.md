# Korn Ferry Value Lifecycle Application

## Overview
A full-stack web application designed to empower Korn Ferry consultants in managing client engagements across the Discovery, Alignment, and Realization phases. The application integrates AI-powered company research to deliver strategic insights, aiding consultants in preparing for client meetings and building robust value hypotheses. Its purpose is to streamline client engagement tracking, enhance company research with AI, facilitate the creation and management of value hypotheses, and enable collaborative client interactions.

## User Preferences
- Consultants prefer strategic, actionable insights over basic company facts.
- Research should be relevant for management consulting engagements.
- UI should support quick access to multiple projects.

## System Architecture

### Tech Stack
- **Frontend**: React, TypeScript, Wouter (routing), TanStack Query, Shadcn UI
- **Backend**: Express.js, TypeScript
- **AI**: OpenAI GPT-5 via Replit AI Integrations
- **Storage**: In-memory storage (MemStorage), designed for easy migration to a persistent database.

### UI/UX Decisions
- Pastel badge backgrounds for readability in data-dense interfaces.
- Visual hierarchy for insights: Priority → Confidence → Pillar → Solution Area → KPIs.
- Prominent display for follow-up research with primary-colored highlighting and "New" badges.
- Optimistic UI updates for instant feedback on user actions (e.g., capability changes, data point selection).

### Technical Implementations
- **AI-Powered Company Research with Prioritization**: GPT-5 generates up to 8 high-quality, prioritized insights (Critical, High, Supporting) tagged with Korn Ferry consulting pillars. Follow-up questions generate targeted additional insights. All AI responses are validated server-side for type safety and quality.
- **Automatic AI Classification of Insights to Korn Ferry Capabilities**: Insights are automatically classified into 9 Korn Ferry capabilities and grouped accordingly in the UI. Manual adjustment of capabilities is supported.
- **Value Calculation Framework**: A quantitative value hypothesis system with financial calculations (NPV, payback period, 3-year projections) is implemented for 7 key capabilities. This includes detailed KPI metadata and translation formulas to financial value.
- **Korn Ferry Knowledge Structure Integration**: Comprehensive knowledge mapping Korn Ferry's solutions, capabilities, jobs, and KPIs. AI integrates this structure by assigning solution areas and relevant KPIs to insights.
- **Company Search & Autocomplete**: Real-time company name autocomplete with logos using Clearout's API, with manual entry fallback.
- **Engagement Management**: Structured three-phase (Discovery, Alignment, Realization) workflow.
- **Project Management**: Creation, selection, and deletion of projects.
- **Notes & Evidence System**: Users can select insights via checkbox, organizing them in a dedicated tab grouped by their AI-classified Korn Ferry capability.
- **File Upload & Voice Notes**: Consultants can attach supporting documents (PDF, Word, Excel, images, text files up to 10MB) and record voice notes using browser speech recognition. Attachments are stored with base64 encoding and displayed in the Build Value Case tab. Backend validates file types, sizes, and prevents empty voice transcriptions. All mutations include comprehensive error handling with user-visible toasts.
- **AI-Powered Notes Enrichment**: Consultants can trigger AI analysis of their notes and attachments to extract strategic insights. The AI analyzes freeform notes, text files (.txt, .csv, .json), and voice transcriptions to identify new data points, metrics, challenges, and opportunities. Extracted insights are automatically classified to Korn Ferry capabilities and solution areas, then added to the Organization tab with "notes_enrichment" provenance. Token limit protection (50k chars per attachment) prevents AI failures. Discovery questions can be regenerated with enriched data for deeper client investigations. (Note: PDF support planned for future release)
- **Collaborative Questionnaire System**: Consultants can share discovery questions with clients via a secure, shareable link. The system tracks response attribution (consultant vs. client) with visual distinction (blue badges for clients, green for consultants). Client-facing questionnaire page requires no login, enabling seamless collaboration. Consultants and clients can both answer questions, with all responses visible in the Discovery tab organized by capability. Share functionality includes optional client name/email capture and one-click link copying.
- **360-Degree Discovery View**: Comprehensive consolidation of all discovery data sources appears automatically when insights exist from multiple sources (research, notes enrichment, questionnaire responses). The view provides overall statistics, capability-by-capability breakdowns showing research insights, enriched insights, and questionnaire completion rates. This consolidated summary ensures consultants have a complete picture before transitioning to the Alignment phase for Job mapping and hypothesis building.
- **Jobs & Priorities Value Build System**: Transforms discovery insights into actionable value-building priorities by aggregating insights to "Jobs We Do" (Korn Ferry's strategic job framework). Features include: (1) Automatic job theme generation from capability-classified insights with evidence tracking, (2) Top-3 job prioritization with drag-and-select interface and backend constraint enforcement via Zod validation, (3) KPI selection system with checkbox controls for primary and supporting KPIs per job, (4) Baseline data input with Korn Ferry benchmark fallback values when client data unavailable, (5) Discovery phase finalization that locks selections and creates transfer record for Alignment phase, (6) Complete type safety with TypeScript interfaces and Zod schemas throughout the stack, (7) Idempotent finalize endpoint that returns existing transfer without errors for already-finalized projects. UI provides locked state visualization post-finalization with disabled inputs and clear status messaging.
- **Alignment Phase - Finalized Discovery Integration**: The Alignment page now displays finalized discovery data at the top, showing the top-3 prioritized jobs from Discovery with their selected KPIs. For each KPI, consultants can view and edit both baseline values (current state from Discovery) and target values (desired outcome state). The schema includes `targetValue` and `targetSource` fields in the `jobThemeKPIs` table. Backend route GET `/api/projects/:projectId/alignment/finalized-jobs` fetches the discovery transfer with nested jobs and KPIs. The UI provides side-by-side editable inputs for baseline and target values with source attribution, displays Korn Ferry benchmarks when available, and includes proper cache invalidation to ensure data consistency. This integration enables consultants to establish the value gap (baseline vs target) that forms the foundation for building value hypotheses.

### Feature Specifications
- **Discovery Phase**: Focuses on company research, data collection, and initial note-taking.
- **Alignment Phase**: Dedicated to building and managing value hypotheses, enabling client collaboration.
- **Realization Phase**: Designed for delivery and outcome tracking.
- **Data Model**: Simple schema with essential fields, including JSON provenance for AI-generated data, confidence levels, priority scores (1-5), Korn Ferry pillar enum, solution area enum, and related KPIs array.

### System Design Choices
- **AI Research Strategy**: Prioritizes quality over quantity, focusing on strategic and actionable insights. Existing research provides context for follow-up questions.
- **Data Sorting**: Insights are sorted by priority (descending) then confidence (descending).
- **Storage Architecture**: Interface-based design to allow for future migration from in-memory to persistent storage.

## External Dependencies
- **OpenAI GPT-5**: Utilized for AI-powered company research and insight generation.
- **Clearout API**: Used for real-time company autocomplete functionality (free tier, no API key required).