# KORN FERRY LOOP - COMPLETE TECHNICAL DOCUMENTATION

## For Translation to GPT Agents

---

# PLATFORM OVERVIEW

**Korn Ferry Loop** is a full-stack AI-powered consulting engagement platform that manages the entire client engagement lifecycle. It transforms how consultants discover insights, align on outcomes, deliver value, and capture evidence for future engagements.

**Core Technology:**
- AI Model: OpenAI GPT-4o
- Live Search: Perplexity API
- Frontend: React, TypeScript, TanStack Query
- Backend: Express.js, TypeScript
- Database: PostgreSQL (via Drizzle ORM)

---

# 1. DISCOVERY SEGMENT

## Purpose & Value
Discovery is the foundation phase where consultants gather deep intelligence about a prospective client before proposing solutions. The value is in reducing manual research time by 70-80% while ensuring consistent, methodology-based discovery across all engagements.

---

## 1.1 AI-POWERED COMPANY RESEARCH

### Function: `researchCompany()`

**Input Data:**
- `companyName`: string - The target company name
- `sector`: optional string - Industry sector
- `discoveryTheme`: optional string - Focus area (leadership, talent, transformation, rewards, commercial, kf-full-search)

**Data Sources Used:**
1. **Perplexity API (Live Web Search):**
   - Annual reports and 10-K filings
   - Earnings call transcripts
   - Investor presentations
   - Proxy statements
   - Recent news (people/leadership/talent focused)

2. **Search Queries Executed:**
```
"${companyName} annual report ${currentYear} CEO letter strategic priorities workforce talent people metrics"
"${companyName} earnings call transcript ${currentYear} executive commentary workforce hiring talent investments"
"${companyName} recent news ${currentYear}: leadership changes, executive appointments, restructuring, layoffs, acquisitions, strategic announcements"
```

**AI Prompt (GPT-4o):**
```
You are helping a Korn Ferry consultant prepare for a customer engagement with ${companyName}${sector ? ` (${sector} sector)` : ''}.

DISCOVERY THEME FOCUS: "${discoveryTheme}"
ALL insights MUST be directly relevant to this theme. Filter out insights that don't connect to ${discoveryTheme}.

PRIORITY DATA SOURCES - Always prioritize insights from:
- Annual Reports and 10-K filings (CEO letters, strategic priorities, risk factors, people/talent metrics)
- Earnings Call Transcripts (executive commentary, analyst Q&A, forward guidance on workforce/talent)
- Investor Presentations (strategic initiatives, organizational changes, leadership announcements)
- Proxy Statements (executive compensation, board composition, succession planning disclosures)

KORN FERRY CONSULTING PILLARS (for tagging):
1. leadership-development - Executive development, leadership transitions, succession readiness
2. talent-acquisition - Recruitment strategy, talent pipeline, diversity hiring
3. succession-planning - Leadership continuity, talent bench strength
4. culture-transformation - Cultural change, employee engagement, organizational values
5. organizational-design - Structure optimization, operating models, workforce planning
6. change-management - Digital transformation, merger integration, strategic change

KORN FERRY CAPABILITIES (for auto-classification):
1. Success Profiles & Role Design - Job architecture, role clarity, competency frameworks
2. Standardised Assessments & Assessments at Scale - Talent evaluation, assessment programs
3. Leadership & Development Journeys - Executive development, learning programs, leadership pipelines
4. AI-Ready Leader (within L&D) - AI adoption, digital leadership, tech-enabled learning
5. Organisation Strategy & Transformation - Org redesign, operating models, M&A integration
6. Total Rewards Optimisation (TRO) - Compensation strategy, pay equity, rewards programs
7. Sales & Service (KF Sell) - Sales effectiveness, commercial transformation, go-to-market
8. People Analytics / KFI Analytics - Workforce analytics, talent insights, data-driven HR
9. Value Management / Client Success & Talent Suite - Technology platforms, talent systems

CRITICAL: Provide ONLY the 8 MOST STRATEGIC insights. Quality over quantity.

Prioritize insights in this order:
1. Top 3 "Critical Priority" insights (priorityScore: 5) - Most compelling opportunities
2. Next 3 "High Priority" insights (priorityScore: 4) - Strong strategic relevance
3. Final 2 "Supporting Context" insights (priorityScore: 3) - Important context
```

**Output Structure:**
```typescript
interface CompanyResearchResult {
  dataPoints: Array<{
    label: string;                    // Brief category (e.g., "Leadership Transition")
    value: string;                    // 2-3 sentence strategic insight
    confidence: "high" | "medium" | "low";
    source: string;                   // Specific source name
    priorityScore: 3 | 4 | 5;
    kornFerryPillar: "leadership-development" | "talent-acquisition" | "succession-planning" | "culture-transformation" | "organizational-design" | "change-management";
    solutionArea: "ASSESS" | "DEVELOP" | "TRANSFORM" | "REWARD" | "COMMERCIAL" | "ANALYTICS";
    relatedKPIs: string[];            // 1-3 relevant KPI names
    relevantCapability: string;       // Exact Korn Ferry capability name
  }>;
  headlines: Array<{
    title: string;
    date: string;
    source: string;
    url: string;
  }>;
}
```

**Confidence Classification Rules:**
- `high`: Verified facts from official sources (10-K, earnings calls)
- `medium`: Discussed plans or stated intentions
- `low`: Vague mentions or inferred assumptions

---

## 1.2 LIVE INTELLIGENCE GENERATION

### Function: `generateLiveIntelligence()`

**Theme Descriptions Used:**
```typescript
const themeDescriptions = {
  "leadership": "Leadership Development - Executive development, succession planning, leadership pipelines",
  "talent": "Talent Acquisition - Recruitment strategy, quality of hire, employer branding",
  "transformation": "Organizational Transformation - Restructuring, M&A integration, operating model design",
  "rewards": "Total Rewards - Compensation strategy, pay equity, executive compensation",
  "commercial": "Sales Effectiveness - Sales force effectiveness, go-to-market strategy, revenue growth",
  "kf-full-search": "Full Discovery - Comprehensive analysis across all Korn Ferry solution areas"
};
```

**Output Structure:**
```typescript
interface LiveIntelligenceResult {
  companyOverview: {
    description: string;      // 2-3 sentence description
    industry: string;
    headquarters: string;
    employeeCount: string;    // e.g., "150,000+"
    revenue: string;          // e.g., "$50B+"
    founded: string;
  };
  recentNews: Array<{
    date: string;             // "Month YYYY"
    headline: string;
    source: string;
    summary: string;          // 1-2 sentences, people/talent focus
    relevance: "high" | "medium" | "low";
    opportunityType: string;  // e.g., "Leadership Transition"
  }>;
  competitors: Array<{
    name: string;
    description: string;
    competitivePosition: string;  // Talent/people strategy comparison
  }>;
  strategicInsights: Array<{
    title: string;
    insight: string;              // 2-3 sentence strategic insight
    kfOpportunity: string;        // How Korn Ferry can help
    potentialValue: string;       // e.g., "$1-3M"
    relevantCapability: string;
  }>;
  keyPeople: Array<{
    name: string;
    title: string;
    relevance: string;            // Why they matter
  }>;
  themeSpecificInsights: {
    opportunitySignal: string;
    howWeHelp: string[];          // 3 specific ways
    potentialValue: string;
    keyQuestions: string[];       // 3 discovery questions
  };
  annualReportSummary: {
    fiscalYear: string;
    ceoLetterHighlights: string[];
    strategicPriorities: string[];
    peopleMetrics: {
      headcount: string;
      turnover: string;
      diversity: string;
      engagement: string;
    };
    riskFactors: string[];
    source: string;
  };
  earningsCallHighlights: {
    quarter: string;
    executiveCommentary: string[];
    workforceDiscussions: string[];
    futureOutlook: string;
    analystQuestions: string[];
    source: string;
  };
}
```

---

## 1.3 NOTES ENRICHMENT

### Function: `enrichFromNotes()`

**Purpose:** Extract strategic insights from consultant notes and uploaded documents.

**Input:**
```typescript
interface NotesEnrichmentInput {
  freeformNotes: string;
  attachmentContents: Array<{
    fileName: string;
    content: string;
    type: "file" | "voice";
  }>;
}
```

**AI Prompt Extract:**
```
TASK: Extract 3-6 NEW strategic insights from the consultant's notes and attachments that are NOT already captured in the existing research. Focus on:
- Specific metrics, numbers, or data points mentioned
- Client challenges, pain points, or opportunities discussed
- Strategic initiatives or goals mentioned
- Leadership changes or organizational developments
- Any information that could strengthen a value hypothesis

Each insight must be:
- NEW information not already in the existing research
- Tied to a Korn Ferry Solution Area and relevant KPIs
- Strategically actionable and outcome-focused
- Auto-classified to the MOST RELEVANT Korn Ferry capability
```

---

## 1.4 DISCOVERY QUESTION GENERATION

### Function: `generateDiscoveryQuestions()`

**Three Methodologies Trained:**

**1. MILLER HEIMAN STRATEGIC SELLING**
- Conceptual Questions: Understand client's vision, goals, strategic direction
- Attitude Questions: Uncover beliefs, concerns, receptivity to change
- Commitment Questions: Gauge readiness to act and investment appetite

**2. SPIN SELLING**
- Situation: Current state facts, context, baseline metrics
- Problem: Challenges, pain points, inefficiencies, gaps
- Implication: Business impact, cost of inaction, ripple effects
- Need-Payoff: Value of solving, benefits of improvement, ROI potential

**3. PSS (PROFESSIONAL SELLING SKILLS)**
- Open Probes: Broad questions to explore priorities and concerns
- Control Probes: Specific questions to quantify and validate
- Confirm Probes: Verify understanding and alignment

**AI Prompt Key Requirements:**
```
EVERY question MUST:
1. Reference ${companyName} by name or clearly relate to their specific situation
2. Connect to a specific finding or insight from the research above
3. Explore the line of business impact (which teams, functions, or divisions)
4. Lead toward a Korn Ferry solution area
5. Help quantify the opportunity or validate the challenge

Generate EXACTLY 12 high-impact discovery questions that:
1. Use a MIX of all three methodologies (at least 3 questions per methodology)
2. Progress logically from situation/context to impact/value
3. Are client-centered and conversational (not internal consulting jargon)
4. Prioritize questions that capture quantitative metrics for value calculations
5. Map to specific KPIs from the knowledge base when applicable
```

**Question Output Structure:**
```typescript
interface GeneratedQuestion {
  question: string;                 // Client-friendly question text
  questionType: "quantitative" | "qualitative" | "both";
  methodology: "MILLER_HEIMAN" | "SPIN" | "PSS";
  methodologyStage: string;         // e.g., "situation", "conceptual", "open_probe"
  purpose: string;                  // Why we're asking this
  contextFromFindings: string;      // Which insight prompted this question
  lineOfBusinessFocus: string;      // Which function this explores
  kornFerrySolutionLink: string;    // Which capability this leads toward
  relatedKPI: string | null;
  followUpHint: string;             // Suggested follow-up
}
```

**Example Question (from prompt):**
```json
{
  "question": "Based on your recent digital transformation announcement, how many roles in your technology organization will need significant reskilling over the next 18 months?",
  "questionType": "quantitative",
  "methodology": "SPIN",
  "methodologyStage": "situation",
  "purpose": "Quantify the scale of transformation impact on talent",
  "contextFromFindings": "Client announced $500M digital transformation initiative",
  "lineOfBusinessFocus": "Technology and IT organizations",
  "kornFerrySolutionLink": "Leadership & Development Journeys, Organisation Strategy & Transformation",
  "relatedKPI": "Leadership Bench Strength",
  "followUpHint": "If high number: Ask about current development capacity and timeline"
}
```

---

## 1.5 MEETING ATTENDEE RESEARCH

### Function: `researchMeetingAttendee()`

**Data Sources:**
- LinkedIn profiles (via Perplexity search)
- Public professional information
- News mentions

**Output Structure:**
```typescript
interface AttendeeResearchResult {
  name: string;
  title: string | null;
  company: string | null;
  background: string;
  careerHistory: string[];
  recentActivity: string[];
  knownConcerns: string;
  coachingTips: string[];
  linkedInSummary: string | null;
  linkedInProfileUrl: string | null;
  linkedInHeadline: string | null;
  linkedInEducation: string[];
  linkedInSkills: string[];
  linkedInConnections: string | null;
  citations: string[];
  retrievedAt: string;
  isLive: boolean;
  linkedInDataFound: boolean;
}
```

---

# 2. ENGAGEMENT SEGMENT (Sales Workspace)

## Purpose & Value
Supports consultants through the 4-stage sales journey from initial discovery through client handoff, with AI-powered outcome generation and strategic recommendations.

---

## 2.1 FOUR-STAGE SALES JOURNEY

**Stage 1: DISCOVER**
- AI intelligence gathering
- Theme selection
- Insight summarization

**Stage 2: DESIGN OUTCOMES**
- AI-powered strategic recommendations
- Outcome generation
- KPI suggestions

**Stage 3: CLIENT ALIGNMENT**
- Collaborative KPI definition
- Shareable alignment links
- Real-time collaboration

**Stage 4: HANDOFF**
- Structured transition to delivery
- Complete context preservation
- Quality checklists

---

## 2.2 VALUE CASE RECOMMENDATIONS

### Function: `generateValueCaseRecommendations()`

**Input Context Used:**
- Discovery insights (top 10)
- Aligned KPIs
- Consultant notes
- Company name and industry

**AI Behavior:**
- Generates 3-5 value case recommendations
- Each tied to specific Korn Ferry capability
- Includes expected impact and timeline
- Confidence scoring (high/medium/low)

---

## 2.3 SUCCESS STORY RECOMMENDATIONS

### Function: `generateSuccessStoryRecommendations()`

**AI Prompt:**
```
Generate 3-5 Korn Ferry client success stories for ${projectContext.companyName}

Make each story:
- Aligned with the client's insights and KPIs
- Focused on measurable outcomes
- Tied to a specific Korn Ferry capability
- Realistic and professionally written
```

**Output Structure:**
```typescript
interface SuccessStoryRecommendation {
  title: string;
  url: string;                       // kornferry.com format
  category: string;
  relevanceReason: string;
  industry: string;
  capabilityName: string;
  solutionArea: "ASSESS" | "DEVELOP" | "TRANSFORM" | "REWARD" | "COMMERCIAL" | "ANALYTICS";
  impactSummary: string;             // Measurable outcomes
}
```

---

# 3. ALIGNMENT OUTCOMES SEGMENT

## Purpose & Value
Transform discovery insights into measurable commitments with full provenance tracking, ensuring both consultant and client agree on what success looks like.

---

## 3.1 KPI RECOMMENDATION ENGINE

### Function: `generateKPIRecommendations()`

**Input:**
- Project context
- Job/theme name
- Capability name
- Company name
- Industry
- Existing KPIs (to avoid duplicates)

**AI Requirements:**
```
Each outcome must have:
- kpiType: "primary" (drives deal value) or "supporting" (enables primary)
- achievabilityScore: 1-10 based on client context
- valueImpactScore: 1-10 based on financial/strategic importance
- kornFerryBenchmark: Reference to Korn Ferry's benchmark data
- industryBenchmark: Low/median/high with source
- targetRecommendation: Including rationale for WHY this target is achievable
```

**Output Structure:**
```typescript
interface KPIRecommendation {
  kpiName: string;
  kpiType: "primary" | "supporting";
  unit: string;
  definition: string;                    // Min 20 characters
  strategicRationale: string;            // Min 50 characters
  achievabilityScore: number;            // 1-10
  valueImpactScore: number;              // 1-10
  kornFerryBenchmark: string;
  measurementFrequency: string;
  industryBenchmark?: {
    low: string;                         // Bottom quartile
    median: string;                      // Industry average
    high: string;                        // Top quartile
    source: string;                      // Credible data source
  };
  targetRecommendation?: {
    suggestedTarget: string;
    achievementRationale: string;        // 2-3 sentence explanation
    timeframeMonths: number;             // 3-24 months
    successFactors: string[];            // 2-4 key factors
  };
}
```

---

## 3.2 VALUE NARRATIVE GENERATION

### Function: `generateValueNarrative()`

**Purpose:** Create stakeholder-specific value narratives for CEO, CFO, and CTO/Operations.

**Input Data:**
```typescript
interface ValueNarrativeInput {
  valueCaseName: string;
  capabilityName: string;
  solutionArea: string;
  challenge: string;
  proposedSolution: string;
  linkedKPIs: Array<{
    kpiName: string;
    baselineValue: string;
    targetValue: string;
    unit: string;
    kpiType: "primary" | "supporting";
  }>;
  financialResults?: {
    totalNPV: number;
    paybackMonths: number;
    yearOneImpact: number;
    yearTwoImpact: number;
    yearThreeImpact: number;
    implementationCost: number;
  };
  companyName: string;
  industry: string;
  relevantSuccessStories: Array<{...}>;
}
```

**AI Prompt Key Section:**
```
TASK: Generate THREE distinct value narratives, each optimized for a specific C-suite stakeholder:

1. CEO NARRATIVE - Strategic Focus
   - Emphasize business transformation, competitive advantage, strategic alignment
   - Lead with vision and market positioning
   - Use success story to demonstrate strategic outcomes
   - Keep it inspiring and forward-looking

2. CFO NARRATIVE - Financial Focus
   - Lead with ROI, payback period, and risk mitigation
   - Emphasize measurable financial outcomes and prudent investment
   - Use success story to demonstrate financial returns
   - Keep it data-driven and conservative

3. CTO/Operations NARRATIVE - Implementation Focus
   - Emphasize capability building, change management, and execution
   - Focus on how the transformation will be achieved
   - Use success story to demonstrate implementation approach
   - Keep it pragmatic and execution-oriented
```

**Output Structure (per stakeholder):**
```typescript
interface StakeholderNarrative {
  title: string;                    // 8-12 words
  executiveSummary: string;         // 60-80 words
  [stakeholderSpecificSection]: string;  // 80-100 words each
  successStoryHighlight: string;    // 60-80 words, woven naturally
  callToAction: string;             // 30-40 words
}
```

---

## 3.3 KPI COMMITMENT DATA STRUCTURE

**Database Schema:**
```typescript
const kpiCommitments = pgTable("kpi_commitments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  
  // Discovery Link
  discoveryThemeId: text("discovery_theme_id"),
  jobThemeId: integer("job_theme_id"),
  
  // Strategic Alignment
  strategicPillarId: integer("strategic_pillar_id"),
  pillarObjectiveId: integer("pillar_objective_id"),
  strategyAlignmentRationale: text("strategy_alignment_rationale"),
  
  // Value Pillar (Grow, Optimize, Protect, Enable)
  valuePillar: text("value_pillar"),
  
  // Commitment Details
  commitmentTitle: text("commitment_title"),
  commitmentDescription: text("commitment_description"),
  kpiUnit: text("kpi_unit"),
  baselineValue: text("baseline_value"),
  targetValue: text("target_value"),
  targetDate: timestamp("target_date"),
  
  // Financial Value
  estimatedAnnualValue: decimal("estimated_annual_value"),
  valueCalculationMethod: text("value_calculation_method"),
  
  // Workflow Status
  status: text("status", { enum: ["draft", "proposed", "confirmed", "client_confirmed", "delivered"] }),
  
  // AI Provenance
  aiGenerated: boolean("ai_generated"),
  aiProvenance: jsonb("ai_provenance"),  // Full trace of origin
});
```

---

# 4. STRATEGY SEGMENT (Delivery & Value Realization)

## Purpose & Value
Ongoing management of engagement health, KPI tracking, and strategic adjustments. Provides real-time visibility into value delivery.

---

## 4.1 HEALTH SCORE CALCULATION

**Inputs:**
- KPI progress (actual vs. target)
- Milestone completion rates
- Risk count and severity
- Client engagement frequency
- Deliverable status

**Score Ranges:**
- 80-100: Healthy (green)
- 60-79: Needs Attention (yellow)
- 0-59: At Risk (red)

---

## 4.2 BUSINESS REVIEW AGENDA GENERATION

### Function: `generateBusinessReviewAgenda()`

**Input Context:**
```typescript
interface BusinessReviewAgendaInput {
  companyName: string;
  reviewType: "quarterly" | "monthly" | "ad-hoc";
  projectPhase: "discovery" | "alignment" | "realisation";
  kpiProgress?: Array<{
    kpiName: string;
    baseline: string;
    target: string;
    actual?: string;
    trend?: "improving" | "stable" | "declining";
  }>;
  previousReviewNotes?: string;
  discoveryInsights?: Array<{...}>;
}
```

**AI Generates:**
- Executive summary tailored to review type
- Key discussion points
- KPI progress summary with trends
- Risks and mitigations
- Recommended actions
- Next steps

---

## 4.3 ROLE-BASED VIEWS

**Executive View:**
- High-level health score gauge
- Value realization progress
- Key metrics at a glance
- Critical alerts only

**Manager View:**
- Executive view +
- Activity feed
- Journey timeline
- Operational metrics
- KPI health matrix

**Detailed View:**
- Manager view +
- Full initiative list
- Issues and opportunities
- Team roles
- Account health breakdown
- All evidence and documentation

---

# 5. HANDOFF SEGMENT

## Purpose & Value
Structured transition from sales to delivery with complete context preservation, ensuring nothing is lost between teams.

---

## 5.1 HANDOFF PACKAGE GENERATION

### Function: `generateHandoffPackage()`

**Data Gathered:**
```typescript
const context = {
  companyName: project.companyName,
  projectName: project.name,
  sector: project.sector,
  businessUnit: project.businessUnit,
  confirmedOutcomes: [...],       // KPI commitments
  keyInsights: [...],             // Top 10 data points
  discoveryContext: {
    keyStakeholder: string,
    topChallenges: string[],
    timeline: string,
    freeformNotes: string,
  },
  bluesheetData: {
    salesObjective: string,
    buyingInfluences: [...],
    redFlags: [...],
    strengthsOfPosition: [...],
  },
  evidenceCount: number,
  handoffNotes: string,
};
```

**AI Prompt:**
```
You are an expert Customer Success Manager preparing a handoff brief for a delivery team.

Based on the following sales engagement data, generate a comprehensive handoff package that will enable the delivery team to hit the ground running.

Focus on actionable, specific information that helps the delivery team understand:
1. What success looks like from the customer's perspective
2. Who the key players are and how to work with them
3. What risks to watch for
4. What to do first
```

**Output Structure:**
```typescript
interface HandoffPackage {
  executiveSummary: string;              // 2-3 sentences
  whyTheyBought: string[];               // 3-5 key reasons
  successCriteria: string[];             // 3-5 measurable criteria
  keyStakeholders: Array<{
    name: string;
    role: string;
    influence: "high" | "medium" | "low";
    notes: string;
  }>;
  risksAndConcerns: string[];            // 3-5 risks
  specialCommitments: string[];          // Promises made during sales
  recommendedActions: string[];          // 3-5 first actions
  generatedAt: string;
}
```

---

## 5.2 DELIVERY READINESS SCORE

**Checks Performed:**
| Check | Weight |
|-------|--------|
| Confirmed outcomes defined | 25% |
| Value metrics established | 20% |
| Stakeholder identified | 20% |
| Discovery completed | 15% |
| Handoff package generated | 15% |
| Risks documented | 5% |

---

# 6. EVIDENCE PACKAGE SEGMENT

## Purpose & Value
Transforms engagement data into compelling proof of value delivery, organized as a narrative journey that can be reused for future sales.

---

## 6.1 EVIDENCE PACK STRUCTURE

**Three Narrative Phases:**

**LEADING (Discovery Signals)**
- Discovery insights
- Stakeholder priorities
- Risk articulations
- Initial hypotheses

**MID-LOOP (Behavior Under Pressure)**
- Assumption revisions
- Methodology compliance
- Sponsor alignment
- Adaptation decisions

**LAGGING (Results with Context)**
- KPI outcomes
- Success stories
- Reusability patterns
- Client testimonials

---

## 6.2 EVIDENCE TYPES (30+)

```typescript
type EvidenceType = 
  | "kpi_result"
  | "case_study"
  | "testimonial"
  | "methodology_metric"
  | "client_feedback"
  | "third_party_validation"
  | "roi_calculation"
  | "risk_mitigation"
  | "timeline_achievement"
  | "stakeholder_quote"
  | "success_frame"
  | "behavior_signal"
  | "assumption_revision"
  | "risk_articulation"
  | "handoff_quality"
  | "reusability_pattern"
  | "trust_milestone";
```

---

## 6.3 AI-POWERED KPI INFERENCE

### Function: `inferKPIsFromContext()`

**AI Prompt:**
```
You are an evidence pack AI assistant for the Korn Ferry Loop platform.

Based on the following project context, suggest 3-5 sponsor-owned KPIs that would be valuable to track.

For each suggested KPI, provide:
1. A clear, measurable name
2. A suggested baseline value (or "To be confirmed")
3. A realistic target value
4. Rationale for why this KPI matters
5. Confidence level (0-100) in this suggestion

Focus on KPIs that the SPONSOR would care about - business outcomes, not activity metrics.
```

---

## 6.4 BEHAVIORAL CONDITION INFERENCE

### Function: `inferBehavioursFromKPIs()`

**Purpose:** Connect business outcomes (KPIs) to observable behaviors.

**AI Prompt:**
```
Suggest behavioural conditions that would indicate progress toward these KPIs.
A behavioural condition follows the pattern: LEVER → BEHAVIOUR → KPI

For example:
- LEVER: "Manager coaching frequency"
- BEHAVIOUR: "Weekly 1:1 coaching sessions observed"
- LINKED KPI: "Employee engagement score"

Suggest 2-4 behavioural conditions. Focus on OBSERVABLE behaviours, not outcomes.
```

**Output:**
```typescript
interface InferredCondition {
  lever: string;              // The input/intervention
  behaviour: string;          // The observable behaviour change
  linkedKPI: string;          // Which KPI this connects to
  rationale: string;          // Why this behaviour matters
  confidence: number;         // 0-100
}
```

---

## 6.5 NARRATIVE GENERATION FROM EVIDENCE

### Function: `inferNarrativeFromEvidence()`

**Input:**
- KPIs tracked
- Behavioural conditions observed
- KPI movements over time

**AI Prompt:**
```
You are crafting a sponsor narrative for a Korn Ferry engagement.

Generate narrative sections that could be used in sponsor communications:

1. Executive Summary (2-3 sentences capturing the value story)
2. Key Outcomes (bullet points of measurable achievements)
3. Quotable Excerpt (a single sentence a sponsor could use in their own communications)

Write in a professional, outcome-focused tone suitable for executive communication.
```

---

## 6.6 TRUST VELOCITY SCORECARD

**Behavioral Quality Metrics (0-100 each):**
- Success Frame Clarity
- Method Adherence
- Sponsor Alignment
- Handoff Completeness

**Visual Representation:**
- Color-coded progress rings
- Phase-based journey connectors
- "Complete journey documented" indicators

---

## 6.7 DUAL AUDIENCE VIEWS

**Client View ("The Value Story"):**
- Visual journey timeline: Discovered → Adapted → Achieved
- Three-column narrative summary
- Key metrics highlights
- Clean, executive-friendly format

**Coaching View:**
- Phase-based journey organization
- Story thread connectors between phases
- Evidence completeness indicators
- Detailed provenance tracking
- "What this proves" summaries

---

# CROSS-CUTTING AI CAPABILITIES

## Knowledge Base Integration

All AI functions have access to a `getSolutionSummary()` function that provides:
- Korn Ferry's 6 Solution Areas (ASSESS, DEVELOP, TRANSFORM, REWARD, COMMERCIAL, ANALYTICS)
- 9 Capability definitions
- 6 Consulting Pillars
- Standard KPI frameworks
- Benchmark data

## Provenance Tracking

Every AI-generated item includes:
```typescript
interface AIProvenance {
  model: string;              // e.g., "gpt-4o"
  generatedAt: string;        // ISO timestamp
  sourceType: string;         // e.g., "discovery_insight", "kpi_commitment"
  sourceId: number;
  confidence: number;         // 0-100
  reasoning?: string;
}
```

## Validation & Safety

- All AI outputs validated with Zod schemas
- Input sanitization via `sanitizeInput()` function
- Server-side XSS protection
- Confidence scoring on all recommendations
- Human review required for client-facing outputs

---

# APPENDIX: SOLUTION AREAS & CAPABILITIES

## 6 Solution Areas

| Code | Name | Description |
|------|------|-------------|
| ASSESS | Assessment | Talent evaluation and assessment programs |
| DEVELOP | Development | Leadership development and learning journeys |
| TRANSFORM | Transformation | Organizational strategy and change management |
| REWARD | Rewards | Total rewards optimization and compensation |
| COMMERCIAL | Commercial | Sales effectiveness and go-to-market |
| ANALYTICS | Analytics | People analytics and workforce insights |

## 9 Capabilities

1. **Success Profiles & Role Design** - Job architecture, role clarity, competency frameworks
2. **Standardised Assessments & Assessments at Scale** - Talent evaluation, assessment programs
3. **Leadership & Development Journeys** - Executive development, learning programs, leadership pipelines
4. **AI-Ready Leader** - AI adoption, digital leadership, tech-enabled learning
5. **Organisation Strategy & Transformation** - Org redesign, operating models, M&A integration
6. **Total Rewards Optimisation (TRO)** - Compensation strategy, pay equity, rewards programs
7. **Sales & Service (KF Sell)** - Sales effectiveness, commercial transformation, go-to-market
8. **People Analytics / KFI Analytics** - Workforce analytics, talent insights, data-driven HR
9. **Value Management / Client Success & Talent Suite** - Technology platforms, talent systems

## 6 Consulting Pillars

1. **leadership-development** - Executive development, leadership transitions
2. **talent-acquisition** - Recruitment strategy, talent pipeline
3. **succession-planning** - Leadership continuity, bench strength
4. **culture-transformation** - Cultural change, employee engagement
5. **organizational-design** - Structure optimization, operating models
6. **change-management** - Digital transformation, strategic change

---

*Document Generated: January 2026*
*Version: 1.0*
*For: GPT Agent Translation*
