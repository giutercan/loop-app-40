# Korn Ferry Value Lifecycle Application

## Overview
A full-stack web application designed to help Korn Ferry consultants manage client engagements across three phases: Discovery, Alignment, and Realization. The app features AI-powered company research that provides strategic insights to prepare consultants for client meetings.

## Purpose
Enable Korn Ferry consultants to:
- Track client engagements through structured phases
- Research companies using AI for strategic preparation
- Build and manage value hypotheses
- Collaborate with clients on engagement deliverables

## Recent Changes

### 2025-11-22: Value Calculation Framework for Alignment Phase
- Built comprehensive quantitative value hypothesis system with financial calculations
- Extended `shared/knowledge.ts` with detailed KPI metadata:
  - KPI definitions, units, and baseline guidance for all 9 capabilities
  - Translation formulas mapping KPI improvements to financial value
  - Default realisation rates (50-70%) based on typical engagement outcomes
  - Measurement frequencies and data sources for each KPI
  - Preferred research designs for validation
- Created `shared/valueCalculations.ts` with calculation utilities for 6 capabilities:
  - **Success Profiles & Role Design**: QoH improvement → hiring value
  - **Sales & Service (KF Sell)**: Win rate → revenue impact
  - **Organisation Strategy & Transformation**: Productivity gains → cost savings
  - **Total Rewards Optimisation**: Retention improvement → replacement cost savings
  - **People Analytics**: Turnover reduction → cost avoidance
  - **Leadership Development**: KPI delta → business outcome value
  - Each includes NPV calculation with discount rates, payback period analysis, and 3-year projections
- Extended database schema with value hypothesis fields:
  - `capabilityName`: Which Korn Ferry capability (e.g., "Success Profiles & Role Design")
  - `solutionArea`: Solution area enum (ASSESS, DEVELOP, TRANSFORM, REWARD, COMMERCIAL, ANALYTICS)
  - `calculationInputs`: JSON field storing capability-specific assumptions
  - `calculationResults`: JSON field with NPV, payback, year-by-year breakdown
  - `linkedInsights`: Array of data point IDs supporting the hypothesis
  - `rationale`: Why this hypothesis is valuable for the client
- Built ValueHypothesisBuilder component with 4-step workflow:
  - Step 1: Basic info (title, rationale)
  - Step 2: Capability selection (solution area → capability)
  - Step 3: Input assumptions (capability-specific forms with validation)
  - Step 4: Results display (Year 1 value, NPV, payback period, yearly breakdown)
- Created ValueHypothesisCard to display saved hypotheses with financial metrics
- Replaced Alignment page with value hypothesis-focused interface
- Capability filtering: UI only shows the 6 capabilities with implemented calculations
- End-to-end tests passed for Success Profiles (£54M Year 1, £139M NPV) and Sales & Service (£280k Year 1, £672k NPV)
- **Note**: 3 capabilities pending implementation: Standardised Assessments, AI-Ready Leader, Value Management

### 2025-11-22: Korn Ferry Knowledge Structure Integration
- Integrated comprehensive knowledge structure mapping Korn Ferry's solutions to specific KPIs
- Created `shared/knowledge.ts` with structured data:
  - 6 Solution Areas: ASSESS, DEVELOP, TRANSFORM, REWARD, COMMERCIAL, ANALYTICS & GOVERNANCE
  - Capabilities within each solution (e.g., Success Profiles, Leadership Development)
  - Jobs/applications for each capability
  - Primary and supporting KPIs with measurement sources
  - Translation notes for value articulation
- Extended database schema with two new fields:
  - `solutionArea` (enum): Maps each insight to one of 6 Korn Ferry solution areas
  - `relatedKPIs` (text array): 1-3 relevant KPI names from knowledge base
- Enhanced AI research prompts:
  - AI selects most relevant solution area for each insight
  - AI identifies 1-3 KPIs from knowledge structure based on insight content
  - All responses validated server-side with type checking
- Updated UI to display knowledge structure:
  - Solution area badges with color coding (blue, emerald, purple, amber, red, cyan)
  - "Relevant KPIs:" section with outlined KPI badges
  - Visual hierarchy: Priority → Confidence → Pillar → Solution Area → KPIs
- Pastel badge backgrounds chosen for readability in data-dense interface
- Knowledge structure enables consultants to quickly map insights to Korn Ferry service offerings and measurable outcomes

### 2025-11-22: AI Research Prioritization System
- Implemented priority scoring (1-5 scale) for all AI-generated insights
- AI now returns maximum 8 high-quality insights instead of 15-20
- Three priority tiers:
  - **Critical (Score 5)**: Top 3 most strategic insights - displayed with flame icon
  - **High (Score 4)**: Next 3 important insights - displayed with 4 stars
  - **Supporting (Score 2-3)**: Context and background - displayed with muted stars
- Each insight tagged with Korn Ferry consulting pillar (Leadership Development, Talent Acquisition, Succession Planning, Culture Transformation, Organizational Design, Change Management)
- Server validates all AI responses:
  - Priority scores must be 1-5 integers
  - Korn Ferry pillars must be valid enum values
  - Defaults to safe values with warning logs if AI misbehaves
- Data automatically sorted by priority (descending), then confidence
- Visual hierarchy helps consultants quickly identify most strategic opportunities

### 2025-11-22: Notes & Evidence with Korn Ferry Job Categories
- Added data point selection system for organizing insights by Korn Ferry job relevance
- Users can now:
  - Select/deselect data points using checkboxes on Organization tab
  - Tag selected insights with Korn Ferry job categories (Leadership Development, Talent Acquisition, etc.)
  - View organized evidence in Notes & Evidence tab grouped by job category
- Implemented optimistic UI updates for instant feedback on selection changes
- Fixed critical deselection bug ensuring relevantJob is properly cleared when unchecking
- All interactive elements use unique data-testid attributes based on data point IDs

### 2025-11-22: Enhanced Follow-up Research UI
- Moved "Need More Information" prompt to top of results for better visibility
- Added prominent card with primary-colored background above research results
- New insights from follow-up questions are visually highlighted with:
  - Subtle primary-colored background (bg-primary/10)
  - Border accent (border-primary/20)
  - "New" badge to easily identify fresh insights
- Clean, easy-to-scan interface for distinguishing original vs follow-up research

### 2025-11-22: Follow-up Research Feature
- Added ability for users to ask follow-up questions after initial AI research
- New dialog allows consultants to request specific additional information
- AI provides targeted insights based on existing research context
- Follow-up responses are appended to the existing research data

### 2025-11-22: Company Autocomplete
- Integrated Clearout's free company autocomplete API
- Real-time company search with logo display
- Manual entry fallback for companies not found
- Backend proxy to avoid CORS issues

### Earlier: Initial AI Research System
- Implemented GPT-5 powered company research
- Categorized research into Strategic Intelligence, Industry Context, and Business Performance
- Added company verification flow with logo display
- Created project management with delete functionality

## Project Architecture

### Tech Stack
- **Frontend**: React, TypeScript, Wouter (routing), TanStack Query, Shadcn UI
- **Backend**: Express.js, TypeScript
- **AI**: OpenAI GPT-5 via Replit AI Integrations
- **Storage**: In-memory storage (MemStorage)
- **APIs**: Clearout company autocomplete (free, no API key)

### Key Features

#### 1. AI-Powered Company Research with Prioritization
- **Initial Research**: Strategic analysis limited to 8 high-quality insights:
  - Each insight assigned priority score (1-5) based on strategic importance
  - All insights tagged with Korn Ferry consulting pillar
  - 3 Critical (priority 5) + 3 High (priority 4) + 2 Supporting (priority 2-3)
  - Focus areas: Strategic initiatives, competitive advantages, industry trends, business performance
- **Follow-up Questions**: Targeted 2-4 additional insights based on specific consultant questions
  - Follow-up insights default to priority 4 (high)
  - Maintain same quality and tagging standards
- **Prioritization Logic**:
  - Critical insights: Immediate value drivers, major risks/opportunities, direct client pain points
  - High insights: Strategic context, competitive dynamics, market trends
  - Supporting insights: Background information, industry context
- All research uses GPT-5 model with structured JSON responses
- Server validates all responses for type safety and data quality

#### 2. Company Search & Autocomplete
- Real-time company name autocomplete with logos
- Uses Clearout's free API (no authentication required)
- Fallback to manual entry
- Company verification with logo display

#### 3. Three-Phase Engagement Management
- **Discovery**: Company research, data collection, note-taking
- **Alignment**: Value hypothesis building and client collaboration
- **Realization**: Delivery and outcome tracking

#### 4. Project Management
- Create projects with company name, business unit, and sector
- Switch between projects easily
- Delete projects with confirmation dialog

### User Preferences
- Consultants prefer strategic, actionable insights over basic company facts
- Research should be relevant for management consulting engagements
- UI should support quick access to multiple projects

### Design Decisions

#### AI Research Strategy
- Use GPT-5 for highest quality strategic insights
- Quality over quantity: 8 strategic insights vs comprehensive coverage
- Provide existing research as context for follow-up questions
- Mark AI-generated data with provenance tracking
- Replace old AI research on re-run to prevent duplication
- Prioritization ensures consultants focus on most impactful opportunities
- Korn Ferry pillar tagging aligns insights with service offerings

#### Data Model
- Simple schema focused on essential fields only
- No unnecessary timestamp fields (createdAt/updatedAt)
- JSON provenance field to track AI-generated vs manual data
- Confidence levels (high/medium/low) for all data points
- Priority scores (1-5 integer) with server-side validation
- Korn Ferry pillar enum (6 consulting service categories)
- Solution area enum (ASSESS, DEVELOP, TRANSFORM, REWARD, COMMERCIAL, ANALYTICS)
- Related KPIs array (1-3 KPI names from knowledge structure)
- Data sorted by priority DESC, then confidence DESC

#### Storage Architecture
- In-memory storage for rapid development
- Interface-based design allows easy migration to database
- All CRUD operations through storage interface

## File Structure

### Key Files
- `shared/knowledge.ts`: Korn Ferry knowledge structure (solutions, capabilities, jobs, KPIs)
- `server/ai.ts`: AI research logic (initial + follow-up)
- `server/routes.ts`: API endpoints for all features
- `server/storage.ts`: Storage interface and in-memory implementation
- `shared/schema.ts`: TypeScript types and Zod schemas
- `client/src/pages/discovery.tsx`: Main discovery phase UI
- `client/src/components/OrganisationCard.tsx`: Research results display
- `client/src/components/ProjectSelector.tsx`: Project management with company autocomplete

### API Endpoints
- `POST /api/projects/:projectId/research`: Initial AI company research
- `POST /api/projects/:projectId/research/follow-up`: Follow-up research questions
- `GET /api/search-companies`: Company name autocomplete
- `POST /api/verify-company`: Company logo verification
- Full CRUD for projects, data points, headlines, notes, and hypotheses

## Environment Variables
- `AI_INTEGRATIONS_OPENAI_API_KEY`: OpenAI API key (managed by Replit integration)
- `AI_INTEGRATIONS_OPENAI_BASE_URL`: OpenAI base URL (managed by Replit integration)

## Development Notes

### Running the Project
- Single command: `npm run dev`
- Serves both frontend (Vite) and backend (Express) on port 5000
- Auto-restart on file changes

### Adding New Features
1. Define types in `shared/schema.ts`
2. Add storage methods to `IStorage` interface
3. Implement storage methods in `MemStorage`
4. Create API routes in `server/routes.ts`
5. Build frontend components and pages

### Testing
- All interactive elements have `data-testid` attributes
- Use Playwright for e2e testing
- Test AI features with real API calls in development

## Future Considerations
- Migration from in-memory to persistent database
- Enhanced collaboration features for Alignment phase
- Export capabilities for client deliverables
- Analytics and reporting dashboard
