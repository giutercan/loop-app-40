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

#### 1. AI-Powered Company Research
- **Initial Research**: Comprehensive company analysis covering:
  - Strategic initiatives and transformation programs
  - Competitive advantages and market positioning
  - Industry trends and disruptions
  - Business performance and outlook
- **Follow-up Questions**: Targeted additional research based on specific consultant questions
- All research uses GPT-5 model with structured JSON responses

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
- Provide existing research as context for follow-up questions
- Mark AI-generated data with provenance tracking
- Replace old AI research on re-run to prevent duplication

#### Data Model
- Simple schema focused on essential fields only
- No unnecessary timestamp fields (createdAt/updatedAt)
- JSON provenance field to track AI-generated vs manual data
- Confidence levels (high/medium/low) for all data points

#### Storage Architecture
- In-memory storage for rapid development
- Interface-based design allows easy migration to database
- All CRUD operations through storage interface

## File Structure

### Key Files
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
