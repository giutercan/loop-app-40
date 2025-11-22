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
- **AI-Powered Notes Enrichment**: Consultants can trigger AI analysis of their notes and attachments to extract strategic insights. The AI analyzes freeform notes, text files (.txt, .csv, .json), PDFs, and voice transcriptions to identify new data points, metrics, challenges, and opportunities. Extracted insights are automatically classified to Korn Ferry capabilities and solution areas, then added to the Organization tab with "notes_enrichment" provenance. Token limit protection (50k chars per attachment) prevents AI failures. Discovery questions can be regenerated with enriched data for deeper client investigations.

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