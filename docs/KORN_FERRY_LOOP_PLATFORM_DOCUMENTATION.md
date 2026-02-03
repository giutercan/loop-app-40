scovery" | "alignment" | "realisation";
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

# 4.5 GROWTH ACCELERATOR (Working Backwards Toolkit)

## Purpose & Value
The Growth Accelerator is a strategic sales enablement tool integrated into the Sales Workspace that helps consultants create buyer-centric sales plays. It synthesizes Discovery data into structured frameworks using the "Working Backwards" methodology popularized by Amazon.

**Strategic Distinction:**
- **Growth Accelerator = "The Promise"** - Forward-looking strategic planning for sales engagements
- **Evidence Pack = "The Proof"** - Backward-looking value realization documentation

---

## 4.5.1 CANVAS STRUCTURE (4 W's Framework)

### What to Know
Understanding the buyer deeply before engaging.

| Component | Description | AI Support |
|-----------|-------------|------------|
| **Buyer Persona** | 4-quadrant model (Facts, Goals, Pains, Behaviours) | Auto-populated from Discovery, AI-generated insights |
| **Hypotheses** | Buyer/Problem/Solution hypothesis framework | AI generates linked hypotheses from persona |
| **Buyer Journey** | 5-phase mapping (Trigger → Research → Evaluate → Decide → Adopt) | AI identifies touchpoints and objections |
| **Predictions** | 2x2 confidence/impact matrix with risky predictions | AI generates testable predictions |
| **Interview Questions** | Structured validation questions | AI suggests methodology-tagged questions |

### What to Say
Crafting compelling messaging.

| Component | Description | AI Support |
|-----------|-------------|------------|
| **Tenets** | Core principles guiding the engagement | Manual definition with AI suggestions |
| **Press Release** | Future-state announcement (Working Backwards format) | AI drafts headline, subheadline, customer quote |

### What to Show
Competitive positioning and proof points.

| Component | Description | AI Support |
|-----------|-------------|------------|
| **Battle Cards** | Competitor analysis with win strategies | AI generates from Discovery intelligence |

### What to Do
Actionable next steps.

| Component | Description | AI Support |
|-----------|-------------|------------|
| **Actions** | Immediate, discovery, and negotiation tasks | Manual with AI recommendations |

---

## 4.5.2 DATA FLOW ARCHITECTURE

```
Discovery Data → Growth Accelerator → Evidence Pack
       ↓                  ↓                    ↓
  Raw Intelligence    Strategic Plan    Leading Evidence
```

**Input Sources (Discovery → GA):**
- `companyDataPoints` → Persona Facts
- `discoveryNotes` → Goals/Pains identification
- `projectIntelligence` → Journey context
- `stakeholders` → Buyer behavior patterns

**Output Destinations (GA → Evidence Pack):**
- Buyer Personas → `stakeholder_claim` (evidencePhase: "leading")
- Hypotheses → `success_frame` (evidencePhase: "leading")
- Risky Predictions → `risk_articulation` (evidencePhase: "leading")
- Battle Cards → `claim` (evidencePhase: "leading")

---

## 4.5.3 AI GENERATION ENDPOINTS

### Generate Buyer Persona
```typescript
POST /api/growth-accelerator/canvases/:id/generate-persona
Body: { projectId: number }
Returns: BuyerPersona with 4-quadrant data
```

### Generate Hypotheses
```typescript
POST /api/growth-accelerator/canvases/:id/generate-hypotheses
Body: { personaId?: number, projectId: number }
Returns: GaHypothesis (buyer/problem/solution linked)
```

### Generate Buyer Journey
```typescript
POST /api/growth-accelerator/canvases/:id/generate-journey
Body: { personaId?: number }
Returns: BuyerJourney with 5 phases
```

### Generate Predictions
```typescript
POST /api/growth-accelerator/canvases/:id/generate-predictions
Body: { hypothesisId?: number }
Returns: GaPrediction[] with 2x2 matrix placement
```

### Push to Evidence Pack
```typescript
POST /api/growth-accelerator/canvases/:id/push-to-evidence-pack
Body: { projectId: number, packId?: number }
Returns: { packId, itemsCreated, items[] }
```

---

## 4.5.4 DATABASE SCHEMA

**Core Tables:**
- `growth_accelerator_canvases` - Main canvas entity linked to project
- `ga_buyer_personas` - 4-quadrant persona profiles
- `ga_hypotheses` - Buyer/problem/solution hypothesis sets
- `ga_buyer_journeys` - 5-phase journey maps
- `ga_predictions` - Confidence/impact matrix predictions
- `ga_tenets` - Core engagement principles
- `ga_press_releases` - Working Backwards press releases
- `ga_competitor_battle_cards` - Competitive positioning
- `ga_interview_questions` - Validation question bank
- `ga_sales_play_actions` - Actionable next steps

---

## 4.5.5 HANDOFF INTEGRATION

Growth Accelerator context is automatically included in handoff packages:

```typescript
interface GrowthAcceleratorContext {
  canvasId: number;
  canvasTitle: string;
  buyerPersona?: {
    name: string;
    title: string;
    company: string;
    topGoals: string[];
    topPains: string[];
    keyBehaviors: string[];
  };
  hypotheses?: {
    buyerHypothesis: string;
    problemHypothesis: string;
    solutionHypothesis: string;
  };
  riskyPredictions?: Array<{
    prediction: string;
    confidence: string;
    impactIfWrong: string;
  }>;
  competitiveHighlights?: Array<{
    competitor: string;
    ourAdvantage: string;
    winStrategy: string;
  }>;
  pressRelease?: {
    headline: string;
    subheadline: string;
    customerQuote: string;
  };
}
```

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
