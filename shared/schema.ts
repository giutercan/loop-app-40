import { pgTable, text, serial, integer, decimal, timestamp, boolean, jsonb, date, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// CLIENT VALUE HUB - ACCOUNT-CENTRIC MODEL
// ============================================================================

// Accounts - Primary organizing entity for Client Value Hub
// One account per client company, contains all initiatives, issues, and value data
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Company/client name
  industry: text("industry"), // e.g., "Financial Services", "Healthcare"
  sector: text("sector"), // More specific sector within industry
  tier: text("tier", { enum: ["enterprise", "strategic", "growth"] }), // Account tier
  companyLogoUrl: text("company_logo_url"),
  website: text("website"),
  
  // Strategy / OKRs (free text + structured)
  strategyNotes: text("strategy_notes"), // Free-form strategic priorities description
  okrSummary: text("okr_summary"), // High-level OKR summary
  fiscalYearStart: text("fiscal_year_start"), // e.g., "January", "April"
  
  // Account metadata
  accountOwner: text("account_owner"), // Primary Korn Ferry account owner
  clientSponsor: text("client_sponsor"), // Client-side executive sponsor
  relationshipStartDate: timestamp("relationship_start_date"),
  
  // Contract details
  contractStartDate: timestamp("contract_start_date"),
  contractEndDate: timestamp("contract_end_date"),
  annualContractValue: text("annual_contract_value"), // e.g., "$2.5M"
  primaryContactName: text("primary_contact_name"),
  primaryContactEmail: text("primary_contact_email"),
  
  // Health metrics
  healthScore: integer("health_score"), // 0-100 score
  lastQbrDate: timestamp("last_qbr_date"),
  nextQbrDate: timestamp("next_qbr_date"),
  
  // Value tracking at account level
  totalValuePromised: integer("total_value_promised"), // Aggregate promised value across initiatives
  totalValueRealized: integer("total_value_realized"), // Aggregate realized value across initiatives
  
  status: text("status", { enum: ["active", "inactive", "prospect"] }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accounts.$inferSelect;

// Account User Roles - Track which users have which roles for an account
export const accountUserRoles = pgTable("account_user_roles", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  userName: text("user_name").notNull(), // User identifier (for now, just a name)
  userEmail: text("user_email"),
  role: text("role", { 
    enum: ["sales", "consultant", "delivery", "csm", "client_sponsor"] 
  }).notNull(),
  isPrimary: boolean("is_primary").notNull().default(false), // Primary contact for this role
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAccountUserRoleSchema = createInsertSchema(accountUserRoles).omit({
  id: true,
  createdAt: true,
});
export type InsertAccountUserRole = z.infer<typeof insertAccountUserRoleSchema>;
export type AccountUserRole = typeof accountUserRoles.$inferSelect;

// Account Issues / Opportunities - Linked to Account
export const accountIssues = pgTable("account_issues", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  title: text("title").notNull(), // Short description of issue/opportunity
  description: text("description"), // Detailed description
  type: text("type", { enum: ["issue", "risk", "opportunity"] }).notNull().default("issue"),
  severity: text("severity", { enum: ["critical", "high", "medium", "low"] }).notNull().default("medium"),
  status: text("status", { enum: ["open", "in_progress", "resolved", "closed"] }).notNull().default("open"),
  
  // Korn Ferry solution mapping
  solutionArea: text("solution_area", {
    enum: ["ASSESS", "DEVELOP", "TRANSFORM", "REWARD", "COMMERCIAL", "ANALYTICS"]
  }),
  kornFerryPillar: text("korn_ferry_pillar", { 
    enum: ["leadership-development", "talent-acquisition", "succession-planning", "culture-transformation", "organizational-design", "change-management"] 
  }),
  
  // Value tracking
  estimatedValue: integer("estimated_value"), // Estimated $ value if addressed
  linkedInitiativeIds: integer("linked_initiative_ids").array(), // Projects/initiatives addressing this
  
  owner: text("owner"), // Who is responsible for this issue
  dueDate: timestamp("due_date"),
  resolvedAt: timestamp("resolved_at"),
  
  // Source tracking
  sourceInsightIds: integer("source_insight_ids").array(), // Discovery insights that identified this
  provenance: jsonb("provenance"), // AI/manual source info
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAccountIssueSchema = createInsertSchema(accountIssues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAccountIssue = z.infer<typeof insertAccountIssueSchema>;
export type AccountIssue = typeof accountIssues.$inferSelect;

// Evidence Artefacts - For QBR support and client proof points
export const evidenceArtefacts = pgTable("evidence_artefacts", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  initiativeId: integer("initiative_id"), // Optional link to specific initiative
  
  title: text("title").notNull(),
  artefactType: text("artefact_type", { 
    enum: ["case_note", "client_quote", "report", "presentation", "data_export", "email", "other"] 
  }).notNull().default("other"),
  
  description: text("description"),
  content: text("content"), // For text-based artefacts (quotes, notes)
  fileUrl: text("file_url"), // For uploaded files
  externalUrl: text("external_url"), // For linked external resources
  
  // Context
  linkedKPIIds: integer("linked_kpi_ids").array(), // KPIs this evidence supports
  linkedInterventionIds: integer("linked_intervention_ids").array(), // Interventions this relates to
  
  // Metadata
  capturedDate: timestamp("captured_date"),
  capturedBy: text("captured_by"),
  clientApproved: boolean("client_approved").notNull().default(false), // Can be shared with client
  
  // For QBR usage
  usedInQBRIds: integer("used_in_qbr_ids").array(), // Which QBRs featured this
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEvidenceArtefactSchema = createInsertSchema(evidenceArtefacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEvidenceArtefact = z.infer<typeof insertEvidenceArtefactSchema>;
export type EvidenceArtefact = typeof evidenceArtefacts.$inferSelect;

// ============================================================================
// LIFECYCLE PHASES (Client Value Hub Journey)
// ============================================================================
// The 5 phases of the Client Value Hub lifecycle:
// 1. discover_qualify - Discovery & qualification of client needs
// 2. shape_sell - Shaping solutions and selling value
// 3. deliver_realise - Delivery and value realization
// 4. review_renew - Quarterly reviews and contract renewal
// 5. learn_scale - Learning from engagement and scaling success

export const lifecyclePhases = ["discover_qualify", "shape_sell", "deliver_realise", "review_renew", "learn_scale"] as const;
export type LifecyclePhase = typeof lifecyclePhases[number];

// Mapping between old 3-phase model and new 5-phase model
export const phaseMapping: Record<string, LifecyclePhase> = {
  "discovery": "discover_qualify",
  "alignment": "shape_sell",
  "realisation": "deliver_realise",
};

// ============================================================================
// PROJECTS (now also "Initiatives" - child of Account)
// ============================================================================

// Projects - Each client engagement/initiative (now linked to Account)
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id, { onDelete: "set null" }), // Link to parent account (nullable for migration)
  name: text("name").notNull(),
  companyName: text("company_name").notNull(), // Kept for backward compatibility
  businessUnit: text("business_unit"),
  sector: text("sector"),
  companyLogoUrl: text("company_logo_url"),
  currentPhase: text("current_phase", { enum: ["discovery", "alignment", "realisation"] }).notNull().default("discovery"),
  // New 5-phase lifecycle (Client Value Hub)
  lifecyclePhase: text("lifecycle_phase", { 
    enum: ["discover_qualify", "shape_sell", "deliver_realise", "review_renew", "learn_scale"] 
  }).default("discover_qualify"),
  status: text("status", { enum: ["active", "completed", "archived"] }).notNull().default("active"),
  
  // Initiative-specific fields (for Value Hub)
  initiativeOwner: text("initiative_owner"), // KF delivery lead
  clientLead: text("client_lead"), // Client-side lead
  startDate: timestamp("start_date"),
  targetEndDate: timestamp("target_end_date"),
  conditionsForSuccess: text("conditions_for_success"), // What defines success for this initiative
  ragStatus: text("rag_status", { enum: ["green", "amber", "red"] }).default("green"), // RAG status for delivery view
  
  // Sales workflow stage tracking (4-stage Sales journey)
  salesStage: text("sales_stage", { 
    enum: ["discover", "build_value", "align", "handoff"] 
  }).default("discover"),
  // Delivery workflow stage tracking (4-stage Delivery journey)
  deliveryStage: text("delivery_stage", { 
    enum: ["health_dashboard", "kpi_tracking", "business_review", "success_stories"] 
  }), // null means not yet in delivery
  
  // Handoff tracking (sales-to-delivery transition)
  handoffNotes: text("handoff_notes"), // Notes from sales team to delivery
  handoffConfirmedAt: timestamp("handoff_confirmed_at"), // When handoff was confirmed
  handoffConfirmedBy: text("handoff_confirmed_by"), // Who confirmed the handoff
  
  // Customer Success Lifecycle (post-handoff stages)
  csLifecycleStage: text("cs_lifecycle_stage", { 
    enum: ["onboarding", "adoption", "value_realization", "expansion", "advocacy"] 
  }).default("onboarding"),
  
  // Health & Maturity Tracking
  healthScore: integer("health_score").default(100), // 0-100 composite health score
  maturityScore: integer("maturity_score").default(0), // 0-100 customer maturity
  lastHealthUpdate: timestamp("last_health_update"),
  healthFactors: jsonb("health_factors").$type<{
    engagement: number; // 0-100 based on touchpoints, meetings
    adoption: number; // 0-100 based on usage/feature uptake
    sentiment: number; // 0-100 based on NPS, feedback
    outcomes: number; // 0-100 based on KPI achievement
    lastCalculated?: string;
  }>(),
  
  // Handoff Package (AI-generated summary for delivery team)
  handoffPackage: jsonb("handoff_package").$type<{
    executiveSummary: string;
    whyTheyBought: string[];
    successCriteria: string[];
    keyStakeholders: Array<{
      name: string;
      role: string;
      influence: string;
      notes: string;
    }>;
    risksAndConcerns: string[];
    specialCommitments: string[];
    recommendedActions: string[];
    generatedAt?: string;
  }>(),
  
  // Discovery progress tracking (Guided Discovery wizard state)
  discoveryTheme: text("discovery_theme"), // Selected theme ID (e.g., "leadership", "kf-full-search")
  discoveryStep: text("discovery_step", { 
    enum: ["theme-select", "intelligence", "questions", "review", "insights"] 
  }).default("theme-select"),
  discoveryCompleted: boolean("discovery_completed").default(false).notNull(),
  
  // Narrative Canvas content (OPEN/STORY/ASK/CLOSE lanes for call preparation)
  narrativeCanvas: jsonb("narrative_canvas").$type<{
    opener: string;
    keyMessage: string;
    proofPoint: string;
    keyQuestions: string[];
    callToAction: string;
    lastUpdated?: string;
  }>(),
  
  // Green Sheet data (Miller Heiman Strategic Selling call preparation)
  greenSheetData: jsonb("green_sheet_data").$type<{
    meetingContact: {
      name: string;
      title: string;
      role: "economic_buyer" | "user_buyer" | "technical_buyer" | "coach" | "champion" | null;
      influence: "high" | "medium" | "low" | null;
      knownConcerns: string;
      personalRapport: string;
      decisionCriteria: string;
    };
    callPlanner: {
      objective: string;
      desiredOutcome: string;
      openingStatement: string;
      bestActionCommitment: string;
    };
    lastUpdated?: string;
  }>(),
  
  // Interactive Story Builder (3-phase storytelling framework)
  storyBuilderData: jsonb("story_builder_data").$type<{
    before: {
      singleMessage: string;
      emotionalReaction: string;
      storyStructure: string;
      startingHook: string;
      heroCharacter: string;
      evidenceToReference: string;
      tensionQuestion: string;
      tensionQuestions?: Array<{
        id: string;
        prompt: string;
        response: string;
        methodology?: string;
        rationale?: string;
        source?: "ai" | "manual";
        order: number;
        targetAudience?: "all" | "specific";
        targetAttendeeNames?: string[];
      }>;
    };
    during: {
      openingLine: string;
      turningPoint: string;
      keyDataPoints: string;
      pausePoints: string[];
      pacingNotes: string;
    };
    after: {
      momentOfMeaning: string;
      explicitTakeaway: string;
      callToAction: string;
    };
    storyTest: {
      strangerCareScore: number | null;
      simplicityScore: number | null;
      leadershipValuesScore: number | null;
      testNotes: string;
    };
    refineResult?: {
      overallScore: number;
      overallFeedback: string;
      strengths: string[];
      improvements: Array<{ element: string; currentIssue: string; suggestion: string; improvedVersion?: string }>;
      missingElements: string[];
      nextSteps: string[];
    };
    selectedTemplates?: string[];
    templateRecommendations?: {
      recommendations: Array<{
        templateId: string;
        score: number;
        rationale: string;
        fitReasons: string[];
        bestFor?: string;
      }>;
      suggestedCombination?: {
        templateIds: string[];
        reason: string;
      };
    };
    lastUpdated?: string;
  }>(),
  
  // Call Flow data (methodology-tagged questions for client interaction)
  callFlowData: jsonb("call_flow_data").$type<{
    questions: Array<{
      id: number;
      question: string;
      phase: string;
      methodology?: string;
      response?: string;
      isAsked?: boolean;
    }>;
    methodologyQuestions: Array<{
      question: string;
      methodology: string;
      stage: string;
      relatedKPI?: string;
      followUpHint?: string;
    }>;
    lastUpdated?: string;
  }>(),
  
  // AI-generated Discovery Synthesis (4-panel executive brief)
  discoverySynthesis: jsonb("discovery_synthesis").$type<{
    whatWeLearned: Array<{
      insight: string;
      evidence: string[];
      sourceContext?: string;
    }>;
    businessImplications: Array<{
      implication: string;
      urgency: "high" | "medium" | "low";
      kornFerryAlignment?: string;
    }>;
    stakeholderSignals: Array<{
      signal: string;
      stakeholderType?: string;
      sentiment?: "positive" | "neutral" | "cautious" | "concerned";
    }>;
    readinessToBuildValue: {
      score: number;
      rationale: string;
      gaps: string[];
      nextSteps: string[];
    };
    generatedAt?: string;
  }>(),
  
  // AI-generated Outcome Recommendations (Build Value stage)
  outcomeRecommendations: jsonb("outcome_recommendations").$type<{
    recommendations: Array<{
      id: string;
      outcomeName: string;
      outcomeDescription: string;
      why: {
        strategicRationale: string;
        discoveryEvidence: string[];
        businessImpact: string;
      };
      how: {
        approach: string;
        kornFerrySolution: string;
        timeframe: string;
        keyActivities: string[];
      };
      benchmark: {
        industryLow: string;
        industryMedian: string;
        industryHigh: string;
        topPerformerTarget: string;
        source: string;
      };
      kpiDetails: {
        metricName: string;
        unit: string;
        suggestedBaseline: string;
        suggestedTarget: string;
        targetTimeframe: string;
      };
      valuePillar: "grow" | "optimise" | "derisk" | "strengthen";
      priority: "high" | "medium" | "low";
      estimatedAnnualValue: string;
      confidenceScore: number;
    }>;
    summary: string;
    totalPotentialValue: string;
    generatedAt?: string;
  }>(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Project Intelligence - Persisted AI-generated company research for Discovery workflow
export const projectIntelligence = pgTable("project_intelligence", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  discoveryTheme: text("discovery_theme").notNull(), // Theme ID (e.g., "leadership", "talent-acquisition")
  
  // AI-generated intelligence data (stored as raw JSON to match LiveIntelligenceResult from ai.ts)
  intelligenceData: jsonb("intelligence_data").$type<Record<string, any>>().notNull(),
  
  // Probe conversation history (optional)
  probeHistory: jsonb("probe_history").$type<Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>>(),
  
  // Metadata
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  regeneratedAt: timestamp("regenerated_at"),
  generatedBy: text("generated_by"), // User who triggered generation
});

export const insertProjectIntelligenceSchema = createInsertSchema(projectIntelligence).omit({
  id: true,
  generatedAt: true,
});
export type InsertProjectIntelligence = z.infer<typeof insertProjectIntelligenceSchema>;
export type ProjectIntelligence = typeof projectIntelligence.$inferSelect;

// Meeting Profiles - Adaptive meeting preparation with single/multi attendee support
export const meetingProfiles = pgTable("meeting_profiles", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  
  // Mode selection: single attendee or multiple attendees
  attendanceMode: text("attendance_mode", { enum: ["single", "multiple"] }).notNull().default("single"),
  
  // Meeting metadata
  meetingTitle: text("meeting_title"),
  meetingDate: timestamp("meeting_date"),
  meetingObjective: text("meeting_objective"),
  desiredOutcome: text("desired_outcome"),
  
  // Single attendee mode - simplified contact info
  singleContact: jsonb("single_contact").$type<{
    name: string;
    title: string;
    role: "economic_buyer" | "user_buyer" | "technical_buyer" | "coach" | "champion" | null;
    influence: "high" | "medium" | "low" | null;
    knownConcerns: string;
    decisionCriteria: string;
  }>(),
  
  // Multiple attendees mode - array of participants
  participants: jsonb("participants").$type<Array<{
    id: string;
    name: string;
    title: string;
    role: "economic_buyer" | "user_buyer" | "technical_buyer" | "coach" | "champion";
    influence: "high" | "medium" | "low";
    knownConcerns: string;
    preferredOutcomes: string;
    personalRapport: string;
    decisionCriteria: string;
  }>>(),
  
  // AI-generated combined meeting story (synthesizes all attendees + intelligence)
  combinedMeetingStory: jsonb("combined_meeting_story").$type<{
    narrative: string;
    keyThemes: string[];
    talkingPoints: Array<{ point: string; targetAudience: string[] }>;
    objectionHandling: Array<{ objection: string; response: string; relevantTo: string[] }>;
    agenda: Array<{ topic: string; duration: string; leadWith: string }>;
    proofPoints: Array<{ claim: string; evidence: string; resonatesWith: string[] }>;
    generatedAt: string;
  }>(),
  
  // Per-attendee story briefs (for multi-mode)
  participantBriefs: jsonb("participant_briefs").$type<Record<string, {
    personalizedOpener: string;
    keyMessage: string;
    anticipatedConcerns: string[];
    tailoredProofPoints: string[];
  }>>(),
  
  // Miller Heiman call planner
  callPlanner: jsonb("call_planner").$type<{
    openingStatement: string;
    bestActionCommitment: string;
    redFlags: string[];
    strengthsToLeverage: string[];
  }>(),
  
  // AI-generated methodology questions (adapted to attendee count + discovery theme)
  generatedQuestions: jsonb("generated_questions").$type<Array<{
    id: string;
    question: string;
    methodology: "SPIN" | "Miller Heiman" | "PSS";
    stage: string;
    targetRole?: string;
    followUpHint: string;
    response?: string;
    isAsked: boolean;
  }>>(),
  
  // Meeting transcript and AI analysis
  transcript: text("transcript"),
  transcriptAnalysis: jsonb("transcript_analysis").$type<{
    summary: string;
    keyInsights: string[];
    actionItems: Array<{ item: string; owner: string; dueDate?: string }>;
    stakeholderSentiment: Record<string, { sentiment: string; signals: string[] }>;
    coachingNotes: Array<{ area: string; observation: string; suggestion: string }>;
    followUpQuestions: string[];
    analyzedAt: string;
  }>(),
  
  // Archived participants (when switching from multi to single)
  archivedParticipants: jsonb("archived_participants").$type<Array<{
    id: string;
    name: string;
    title: string;
    role: string;
    archivedAt: string;
  }>>(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMeetingProfileSchema = createInsertSchema(meetingProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertMeetingProfile = z.infer<typeof insertMeetingProfileSchema>;
export type MeetingProfile = typeof meetingProfiles.$inferSelect;

// Company Data Points with confidence and provenance
export const companyDataPoints = pgTable("company_data_points", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  value: text("value").notNull(),
  confidence: text("confidence", { enum: ["high", "medium", "low"] }).notNull(),
  source: text("source"),
  sourceUrl: text("source_url"),
  provenance: jsonb("provenance"),
  selectedForNotes: boolean("selected_for_notes").default(false).notNull(),
  relevantJob: text("relevant_job"),
  relevantCapability: text("relevant_capability"), // Auto-classified by AI based on knowledge structure
  priorityScore: integer("priority_score").default(3).notNull(),
  kornFerryPillar: text("korn_ferry_pillar", { 
    enum: ["leadership-development", "talent-acquisition", "succession-planning", "culture-transformation", "organizational-design", "change-management"] 
  }),
  solutionArea: text("solution_area", {
    enum: ["ASSESS", "DEVELOP", "TRANSFORM", "REWARD", "COMMERCIAL", "ANALYTICS"]
  }),
  relatedKPIs: text("related_kpis").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCompanyDataPointSchema = createInsertSchema(companyDataPoints).omit({
  id: true,
  createdAt: true,
});
export type InsertCompanyDataPoint = z.infer<typeof insertCompanyDataPointSchema>;
export type CompanyDataPoint = typeof companyDataPoints.$inferSelect;

// Headlines
export const headlines = pgTable("headlines", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  date: text("date").notNull(),
  source: text("source").notNull(),
  url: text("url").notNull(),
  excerpt: text("excerpt"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHeadlineSchema = createInsertSchema(headlines).omit({
  id: true,
  createdAt: true,
});
export type InsertHeadline = z.infer<typeof insertHeadlineSchema>;
export type Headline = typeof headlines.$inferSelect;

// Discovery Notes
export const discoveryNotes = pgTable("discovery_notes", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  freeformNotes: text("freeform_notes"),
  keyStakeholder: text("key_stakeholder"),
  topChallenges: text("top_challenges"),
  timeline: text("timeline"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDiscoveryNotesSchema = createInsertSchema(discoveryNotes).omit({
  id: true,
  updatedAt: true,
});
export type InsertDiscoveryNotes = z.infer<typeof insertDiscoveryNotesSchema>;
export type DiscoveryNotes = typeof discoveryNotes.$inferSelect;

// Value Cases with detailed calculation support
export const valueCases = pgTable("value_hypotheses", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  
  // Basic information
  title: text("title").notNull(), // e.g., "Improve Quality of Hire in Tech Hiring"
  capabilityName: text("capability_name"), // From knowledge.ts (nullable for AI recommendations)
  solutionArea: text("solution_area", {
    enum: ["ASSESS", "DEVELOP", "TRANSFORM", "REWARD", "COMMERCIAL", "ANALYTICS"]
  }), // Nullable for AI recommendations that span multiple areas
  
  // Calculation data
  calculationInputs: jsonb("calculation_inputs").notNull(), // All inputs to calculation function
  calculationResults: jsonb("calculation_results"), // Full ValueCalculationResult
  
  // Supporting evidence
  linkedInsights: text("linked_insights").array(), // Array of data point IDs
  rationale: text("rationale"), // Why this case is valuable
  
  // AI-generated recommendation fields
  linkedJobThemeIds: integer("linked_job_theme_ids").array(), // Jobs this case addresses
  suggestedKPIs: text("suggested_kpis").array(), // KPIs this case will impact
  estimatedNPV: text("estimated_npv"), // NPV estimate (e.g., "$2.5M over 3 years")
  estimatedPaybackMonths: integer("estimated_payback_months"), // Payback period in months
  
  // Legacy fields (kept for compatibility)
  job: text("job"),
  primaryKpi: text("primary_kpi"),
  exposure: decimal("exposure", { precision: 20, scale: 4 }),
  target: text("target"),
  researchDesign: text("research_design"),
  
  // Status tracking
  status: text("status", { enum: ["draft", "sent", "approved"] }).notNull().default("draft"),
  confidence: text("confidence", { enum: ["high", "medium", "low"] }).notNull().default("medium"),
  provenance: jsonb("provenance"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertValueCaseSchema = createInsertSchema(valueCases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertValueCase = z.infer<typeof insertValueCaseSchema>;
export type ValueCase = typeof valueCases.$inferSelect;

// Strategic Challenges
export const strategicChallenges = pgTable("strategic_challenges", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  selected: boolean("selected").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertStrategicChallengeSchema = createInsertSchema(strategicChallenges).omit({
  id: true,
});
export type InsertStrategicChallenge = z.infer<typeof insertStrategicChallengeSchema>;
export type StrategicChallenge = typeof strategicChallenges.$inferSelect;

// Baseline Data with approval tracking
export const baselines = pgTable("baselines", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  exposure: decimal("exposure", { precision: 20, scale: 4 }).notNull(),
  confidence: text("confidence", { enum: ["high", "medium", "low"] }).notNull(),
  sources: jsonb("sources").notNull(),
  provenance: jsonb("provenance"),
  isLocked: boolean("is_locked").notNull().default(false),
  lockedAt: timestamp("locked_at"),
  confirmedByEmail: text("confirmed_by_email"),
  approvedBy: text("approved_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBaselineSchema = createInsertSchema(baselines).omit({
  id: true,
  createdAt: true,
});
export type InsertBaseline = z.infer<typeof insertBaselineSchema>;
export type Baseline = typeof baselines.$inferSelect;

// KPIs with provenance and confidence
export const kpis = pgTable("kpis", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  unit: text("unit"),
  baselineValue: text("baseline_value").notNull(),
  currentValue: text("current_value").notNull(),
  targetValue: text("target_value"),
  confidence: text("confidence", { enum: ["high", "medium", "low"] }).notNull().default("medium"),
  provenance: jsonb("provenance"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertKpiSchema = createInsertSchema(kpis).omit({
  id: true,
  createdAt: true,
});
export type InsertKpi = z.infer<typeof insertKpiSchema>;
export type Kpi = typeof kpis.$inferSelect;

// KPI Readings (time series data) with provenance
export const kpiReadings = pgTable("kpi_readings", {
  id: serial("id").primaryKey(),
  kpiId: integer("kpi_id").notNull().references(() => kpis.id, { onDelete: "cascade" }),
  value: decimal("value", { precision: 20, scale: 6 }).notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  notes: text("notes"),
  confidence: text("confidence", { enum: ["high", "medium", "low"] }).notNull().default("medium"),
  provenance: jsonb("provenance"),
});

export const insertKpiReadingSchema = createInsertSchema(kpiReadings).omit({
  id: true,
  recordedAt: true,
});
export type InsertKpiReading = z.infer<typeof insertKpiReadingSchema>;
export type KpiReading = typeof kpiReadings.$inferSelect;

// Interventions (timeline items) with provenance and value realization tracking
export const interventions = pgTable("interventions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  owner: text("owner"),
  status: text("status", { enum: ["planned", "in_progress", "completed", "cancelled"] }).notNull().default("planned"),
  sortOrder: integer("sort_order").notNull().default(0),
  // Value realization enhancements
  interventionType: text("intervention_type", { 
    enum: ["training", "coaching", "process_change", "technology", "organizational_design", "other"] 
  }),
  targetedKPIIds: integer("targeted_kpi_ids").array(), // KPIs this intervention aims to improve
  estimatedCost: text("estimated_cost"), // Financial investment
  estimatedImpact: text("estimated_impact"), // Expected improvement
  provenance: jsonb("provenance"),
});

export const insertInterventionSchema = createInsertSchema(interventions).omit({
  id: true,
});
export type InsertIntervention = z.infer<typeof insertInterventionSchema>;
export type Intervention = typeof interventions.$inferSelect;

// Financial Projections with provenance and proper precision
export const financialProjections = pgTable("financial_projections", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  year: integer("year").notNull(),
  incrementalCashFlow: decimal("incremental_cash_flow", { precision: 20, scale: 4 }).notNull(),
  cumulative: decimal("cumulative", { precision: 20, scale: 4 }).notNull(),
  npv: decimal("npv", { precision: 20, scale: 4 }).notNull(),
  discountRate: decimal("discount_rate", { precision: 10, scale: 6 }).notNull(),
  notes: text("notes"),
  calculation: text("calculation"),
  scenario: text("scenario", { enum: ["conservative", "base", "optimistic"] }).notNull().default("base"),
  confidence: text("confidence", { enum: ["high", "medium", "low"] }).notNull().default("medium"),
  provenance: jsonb("provenance"),
});

export const insertFinancialProjectionSchema = createInsertSchema(financialProjections).omit({
  id: true,
});
export type InsertFinancialProjection = z.infer<typeof insertFinancialProjectionSchema>;
export type FinancialProjection = typeof financialProjections.$inferSelect;

// Evidence Documents for provenance tracking
export const evidenceDocuments = pgTable("evidence_documents", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  date: text("date").notNull(),
  source: text("source").notNull(),
  excerpt: text("excerpt"),
  url: text("url"),
  documentType: text("document_type", { enum: ["earnings_call", "sec_filing", "press_release", "research_report", "internal_doc", "other"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEvidenceDocumentSchema = createInsertSchema(evidenceDocuments).omit({
  id: true,
  createdAt: true,
});
export type InsertEvidenceDocument = z.infer<typeof insertEvidenceDocumentSchema>;
export type EvidenceDocument = typeof evidenceDocuments.$inferSelect;

// Analytics Reviews and Sign-offs for Tier 3 reports
export const analyticsReviews = pgTable("analytics_reviews", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  ticketNumber: text("ticket_number").notNull(),
  reviewer: text("reviewer").notNull(),
  status: text("status", { enum: ["pending", "in_review", "approved", "rejected"] }).notNull().default("pending"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  comments: text("comments"),
  responsibleAiChecklist: jsonb("responsible_ai_checklist"),
});

export const insertAnalyticsReviewSchema = createInsertSchema(analyticsReviews).omit({
  id: true,
  submittedAt: true,
});
export type InsertAnalyticsReview = z.infer<typeof insertAnalyticsReviewSchema>;
export type AnalyticsReview = typeof analyticsReviews.$inferSelect;

// Responsible AI Checklist for transparency
export const responsibleAiChecklists = pgTable("responsible_ai_checklists", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  aiFeatureUsed: text("ai_feature_used").notNull(),
  humanInLoop: boolean("human_in_loop").notNull().default(true),
  transparencyScore: integer("transparency_score").notNull(),
  dataProvenanceComplete: boolean("data_provenance_complete").notNull().default(false),
  biasAssessmentComplete: boolean("bias_assessment_complete").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertResponsibleAiChecklistSchema = createInsertSchema(responsibleAiChecklists).omit({
  id: true,
  createdAt: true,
});
export type InsertResponsibleAiChecklist = z.infer<typeof insertResponsibleAiChecklistSchema>;
export type ResponsibleAiChecklist = typeof responsibleAiChecklists.$inferSelect;

// Discovery Questions for client engagement
export const discoveryQuestions = pgTable("discovery_questions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  capabilityName: text("capability_name").notNull(), // Which Korn Ferry capability this relates to
  question: text("question").notNull(), // The customized question
  questionType: text("question_type", { enum: ["quantitative", "qualitative", "both"] }).notNull(),
  methodology: text("methodology", { enum: ["MILLER_HEIMAN", "SPIN", "PSS"] }), // Korn Ferry methodology framework
  methodologyStage: text("methodology_stage"), // Stage within the methodology (e.g., situation, problem, implication, need_payoff for SPIN)
  purpose: text("purpose").notNull(), // Why we're asking this question
  relatedKPI: text("related_kpi"), // KPI this question helps measure
  followUpHint: text("follow_up_hint"), // Suggested follow-up based on answer
  answer: text("answer"), // Client's answer
  isAsked: boolean("is_asked").notNull().default(false), // Track if question has been asked
  notes: text("notes"), // Consultant notes on this question
  isTemplate: boolean("is_template").notNull().default(false), // true if from template, false if AI-generated
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDiscoveryQuestionSchema = createInsertSchema(discoveryQuestions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertDiscoveryQuestion = z.infer<typeof insertDiscoveryQuestionSchema>;

// Schema for updating discovery questions (allows partial updates including answer field)
export const updateDiscoveryQuestionSchema = insertDiscoveryQuestionSchema.partial();
export type UpdateDiscoveryQuestion = z.infer<typeof updateDiscoveryQuestionSchema>;

export type DiscoveryQuestion = typeof discoveryQuestions.$inferSelect;

// Attachments for Build Value Case (file uploads and voice notes)
export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["file", "voice"] }).notNull(),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  content: text("content"), // Base64 for files or transcription text for voice
  duration: integer("duration"), // For voice recordings in seconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAttachmentSchema = createInsertSchema(attachments).omit({
  id: true,
  createdAt: true,
});
export type InsertAttachment = z.infer<typeof insertAttachmentSchema>;
export type Attachment = typeof attachments.$inferSelect;

// Shared Questionnaires - for client collaboration
export const sharedQuestionnaires = pgTable("shared_questionnaires", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  shareToken: text("share_token").notNull().unique(), // Unique token for the shareable link
  clientName: text("client_name"), // Optional: who the questionnaire is shared with
  clientEmail: text("client_email"), // Optional: client contact
  status: text("status", { enum: ["active", "completed", "expired"] }).notNull().default("active"),
  expiresAt: timestamp("expires_at"), // Optional: expiration date for the link
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"), // When both parties finalized
});

export const insertSharedQuestionnaireSchema = createInsertSchema(sharedQuestionnaires).omit({
  id: true,
  createdAt: true,
});
export type InsertSharedQuestionnaire = z.infer<typeof insertSharedQuestionnaireSchema>;
export type SharedQuestionnaire = typeof sharedQuestionnaires.$inferSelect;

// Question Responses - tracks answers from both consultant and client
export const questionResponses = pgTable("question_responses", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull().references(() => discoveryQuestions.id, { onDelete: "cascade" }),
  sharedQuestionnaireId: integer("shared_questionnaire_id").references(() => sharedQuestionnaires.id, { onDelete: "cascade" }),
  respondentType: text("respondent_type", { enum: ["consultant", "client"] }).notNull(),
  respondentName: text("respondent_name"), // Optional: who specifically answered
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertQuestionResponseSchema = createInsertSchema(questionResponses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertQuestionResponse = z.infer<typeof insertQuestionResponseSchema>;
export type QuestionResponse = typeof questionResponses.$inferSelect;

// Job Themes - Aggregated insights grouped by "Jobs We Do"
export const jobThemes = pgTable("job_themes", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  jobName: text("job_name").notNull(), // e.g., "Define role success; align roles"
  capabilityName: text("capability_name").notNull(), // e.g., "Success Profiles & Role Design"
  solutionArea: text("solution_area", {
    enum: ["ASSESS", "DEVELOP", "TRANSFORM", "REWARD", "COMMERCIAL", "ANALYTICS"]
  }),
  priorityRank: integer("priority_rank"), // 1, 2, 3 for top priorities (null if not prioritized yet)
  pillarId: integer("pillar_id"), // Link to strategic pillar (optional until linked)
  pillarLinkageNarrative: text("pillar_linkage_narrative"), // How this job supports the strategic pillar
  aggregationSummary: text("aggregation_summary"), // AI-generated summary of all insights for this job
  sourceInsightIds: integer("source_insight_ids").array(), // IDs of companyDataPoints that contribute to this job
  sourceQuestionIds: integer("source_question_ids").array(), // IDs of discoveryQuestions that contribute
  sourceResponseIds: integer("source_response_ids").array(), // IDs of questionResponses (client/consultant answers)
  compositeScore: integer("composite_score").notNull().default(3), // Weighted score from constituent insights
  evidenceCount: integer("evidence_count").notNull().default(0), // Total number of supporting insights
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertJobThemeSchema = createInsertSchema(jobThemes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertJobTheme = z.infer<typeof insertJobThemeSchema>;
export type JobTheme = typeof jobThemes.$inferSelect;

// Job Theme KPIs - Selected KPIs with baseline data for each job theme
export const jobThemeKPIs = pgTable("job_theme_kpis", {
  id: serial("id").primaryKey(),
  jobThemeId: integer("job_theme_id").notNull().references(() => jobThemes.id, { onDelete: "cascade" }),
  kpiName: text("kpi_name").notNull(), // e.g., "Quality of Hire (QoH) at 6 months"
  kpiType: text("kpi_type", { enum: ["primary", "supporting"] }).notNull(),
  unit: text("unit").notNull(), // e.g., "Index 0-100", "Percent (%)", "Days"
  isSelected: boolean("is_selected").notNull().default(false), // User selected this KPI for hypothesis
  baselineValue: text("baseline_value"), // User-provided baseline (stored as text for flexibility)
  baselineSource: text("baseline_source"), // e.g., "Client data", "HRIS", "Manager estimate"
  targetValue: text("target_value"), // Target/outcome value set in Alignment phase
  targetSource: text("target_source"), // e.g., "Consultant estimate", "Industry best practice"
  benchmarkValue: text("benchmark_value"), // Korn Ferry industry benchmark
  benchmarkSource: text("benchmark_source"), // e.g., "Korn Ferry 2024 Study", "Industry average"
  definition: text("definition"), // KPI definition from knowledge base
  measurementFrequency: text("measurement_frequency"), // e.g., "6 months", "Quarterly"
  // Attribution tracking for customer collaboration
  baselineEnteredBy: text("baseline_entered_by", { enum: ["consultant", "customer"] }), // Who entered baseline value
  baselineEnteredByName: text("baseline_entered_by_name"), // Name of person who entered baseline
  targetEnteredBy: text("target_entered_by", { enum: ["consultant", "customer"] }), // Who entered target value
  targetEnteredByName: text("target_entered_by_name"), // Name of person who entered target
  customerComment: text("customer_comment"), // Customer's rationale/notes
  customerCommentedAt: timestamp("customer_commented_at"), // When customer commented
  // AI Recommendation fields - Korn Ferry strategic differentiation
  isAIRecommended: boolean("is_ai_recommended").notNull().default(false), // True if suggested by AI
  aiStrategicRationale: text("ai_strategic_rationale"), // Why this outcome is strategically valuable
  aiAchievabilityScore: integer("ai_achievability_score"), // 1-10 score for how achievable this is
  aiValueImpactScore: integer("ai_value_impact_score"), // 1-10 score for business value impact
  aiKornFerryBenchmark: text("ai_korn_ferry_benchmark"), // Korn Ferry typical range or target
  aiIndustryBenchmark: jsonb("ai_industry_benchmark"), // { low, median, high, source } - industry benchmark ranges
  aiTargetRecommendation: jsonb("ai_target_recommendation"), // { suggestedTarget, achievementRationale, timeframeMonths, successFactors }
  // Value realization tracking
  estimatedValuePerUnit: integer("estimated_value_per_unit"), // Dollar value per unit improvement (for calculating promised/realized value)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertJobThemeKPISchema = createInsertSchema(jobThemeKPIs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertJobThemeKPI = z.infer<typeof insertJobThemeKPISchema>;
export type JobThemeKPI = typeof jobThemeKPIs.$inferSelect;

// Discovery Phase Transfer - Locks selections for Alignment phase
export const discoveryPhaseTransfers = pgTable("discovery_phase_transfers", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  isFinalized: boolean("is_finalized").notNull().default(false),
  finalizedJobThemeIds: integer("finalized_job_theme_ids").array(), // Top 3 prioritized job themes
  transferredAt: timestamp("transferred_at"),
  transferredBy: text("transferred_by"), // Consultant name/ID
  notes: text("notes"), // Optional notes about the transfer
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDiscoveryPhaseTransferSchema = createInsertSchema(discoveryPhaseTransfers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertDiscoveryPhaseTransfer = z.infer<typeof insertDiscoveryPhaseTransferSchema>;
export type DiscoveryPhaseTransfer = typeof discoveryPhaseTransfers.$inferSelect;

// Competitive Intelligence - AI-generated positioning tailored to specific company
export const competitiveIntelligence = pgTable("competitive_intelligence", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  solutionArea: text("solution_area", {
    enum: ["ASSESS", "DEVELOP", "TRANSFORM", "REWARD", "COMMERCIAL", "ANALYTICS"]
  }).notNull(),
  competitorId: text("competitor_id").notNull(), // References competitor id from knowledge.ts
  competitorName: text("competitor_name").notNull(), // Denormalized for display
  contextualPositioning: text("contextual_positioning").notNull(), // AI-generated: how KF differentiates vs this competitor for THIS company
  clientSpecificAdvantages: text("client_specific_advantages").array(), // Why KF is better for this specific client
  conversationStarters: text("conversation_starters").array(), // AI-generated talking points
  battleCardScenario: text("battle_card_scenario"), // Specific competitive scenario
  battleCardResponse: text("battle_card_response"), // How to respond
  winTheme: text("win_theme"), // Key theme to emphasize
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCompetitiveIntelligenceSchema = createInsertSchema(competitiveIntelligence).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCompetitiveIntelligence = z.infer<typeof insertCompetitiveIntelligenceSchema>;
export type CompetitiveIntelligence = typeof competitiveIntelligence.$inferSelect;

// Competitive Summary - High-level AI-generated competitive positioning for a project
export const competitiveSummary = pgTable("competitive_summary", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }).unique(),
  executiveSummary: text("executive_summary"), // AI-generated: Overall competitive positioning for this opportunity
  primaryCompetitors: text("primary_competitors").array(), // Competitor IDs most likely to compete for this work
  competitorLikelihood: jsonb("competitor_likelihood"), // { competitorId: { likelihood: "high"|"medium"|"low", reason: string } }
  kornFerryDifferentiators: text("korn_ferry_differentiators").array(), // Differentiator IDs most relevant for this client
  keyWinThemes: text("key_win_themes").array(), // Top 3 themes to emphasize when competing
  avoidThemes: text("avoid_themes").array(), // Topics to downplay or avoid
  industryContext: text("industry_context"), // AI-generated industry-specific competitive dynamics
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCompetitiveSummarySchema = createInsertSchema(competitiveSummary).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCompetitiveSummary = z.infer<typeof insertCompetitiveSummarySchema>;
export type CompetitiveSummary = typeof competitiveSummary.$inferSelect;

// API Request/Response Schemas for Jobs & Priorities

// Prioritize Jobs Request
export const prioritizeJobsRequestSchema = z.object({
  prioritizedIds: z.array(z.number()).max(3), // Enforce top-3 constraint, allow empty array when removing all
});
export type PrioritizeJobsRequest = z.infer<typeof prioritizeJobsRequestSchema>;

// Update KPI Request
export const updateJobThemeKPIRequestSchema = z.object({
  isSelected: z.boolean().optional(),
  baselineValue: z.string().optional(),
  baselineSource: z.string().optional(),
  targetValue: z.string().optional(),
  targetSource: z.string().optional(),
});
export type UpdateJobThemeKPIRequest = z.infer<typeof updateJobThemeKPIRequestSchema>;

// Finalize Discovery Request (empty body, validation in backend)
export const finalizeDiscoveryRequestSchema = z.object({});
export type FinalizeDiscoveryRequest = z.infer<typeof finalizeDiscoveryRequestSchema>;

// Job Theme Response (with nested KPIs for frontend) - matches backend SELECT response
export const jobThemeWithKPIsSchema = z.object({
  id: z.number(),
  projectId: z.number(),
  jobName: z.string(),
  capabilityName: z.string(),
  solutionArea: z.enum(["ASSESS", "DEVELOP", "TRANSFORM", "REWARD", "COMMERCIAL", "ANALYTICS"]).nullable().optional(),
  priorityRank: z.number().nullable().optional(),
  aggregationSummary: z.string().nullable().optional(),
  sourceInsightIds: z.array(z.number()).nullable().optional(),
  sourceQuestionIds: z.array(z.number()).nullable().optional(),
  compositeScore: z.number(),
  evidenceCount: z.number(),
  pillarId: z.number().nullable().optional(), // Link to strategic pillar
  pillarLinkageNarrative: z.string().nullable().optional(), // AI-generated explanation of pillar linkage
  createdAt: z.any(), // Date from DB, allow flexible parsing
  updatedAt: z.any(), // Date from DB, allow flexible parsing
  kpis: z.array(z.object({
    id: z.number(),
    jobThemeId: z.number(),
    kpiName: z.string(),
    kpiType: z.enum(["primary", "supporting"]),
    unit: z.string(),
    isSelected: z.boolean(),
    baselineValue: z.string().nullable().optional(),
    baselineSource: z.string().nullable().optional(),
    targetValue: z.string().nullable().optional(),
    targetSource: z.string().nullable().optional(),
    benchmarkValue: z.string().nullable().optional(),
    benchmarkSource: z.string().nullable().optional(),
    definition: z.string().nullable().optional(),
    measurementFrequency: z.string().nullable().optional(),
    // AI Recommendation fields
    isAIRecommended: z.boolean().optional(),
    aiStrategicRationale: z.string().nullable().optional(),
    aiAchievabilityScore: z.number().nullable().optional(),
    aiValueImpactScore: z.number().nullable().optional(),
    aiKornFerryBenchmark: z.string().nullable().optional(),
    createdAt: z.any(), // Date from DB
    updatedAt: z.any(), // Date from DB
  })),
});
export type JobThemeWithKPIs = z.infer<typeof jobThemeWithKPIsSchema>;

// ============================================================================
// PHASE 1: VALUE REALIZATION FEATURES
// ============================================================================

// Success Plans - Joint success plans co-created with customers
export const successPlans = pgTable("success_plans", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("Success Plan"),
  status: text("status", { 
    enum: ["draft", "active", "completed", "archived"] 
  }).notNull().default("draft"),
  
  // Customer Context
  desiredOutcomes: jsonb("desired_outcomes").$type<Array<{
    id: string;
    outcome: string;
    businessImpact: string;
    successMetric: string;
    targetDate: string;
    status: "not_started" | "in_progress" | "achieved" | "at_risk";
    linkedKPIIds?: number[];
  }>>(),
  
  // Responsibilities & Ownership
  customerResponsibilities: text("customer_responsibilities").array(),
  vendorResponsibilities: text("vendor_responsibilities").array(),
  executiveSponsor: text("executive_sponsor"),
  deliveryLead: text("delivery_lead"),
  
  // Timeline & Cadence
  kickoffDate: timestamp("kickoff_date"),
  targetCompletionDate: timestamp("target_completion_date"),
  reviewCadence: text("review_cadence", { 
    enum: ["weekly", "bi-weekly", "monthly", "quarterly"] 
  }).default("monthly"),
  nextReviewDate: timestamp("next_review_date"),
  
  // Health & Progress
  overallProgress: integer("overall_progress").default(0), // 0-100%
  riskLevel: text("risk_level", { 
    enum: ["low", "medium", "high"] 
  }).default("low"),
  riskNotes: text("risk_notes"),
  
  // Audit
  createdBy: text("created_by"),
  lastUpdatedBy: text("last_updated_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSuccessPlanSchema = createInsertSchema(successPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  kickoffDate: z.coerce.date().nullable().optional(),
  targetCompletionDate: z.coerce.date().nullable().optional(),
  nextReviewDate: z.coerce.date().nullable().optional(),
});
export type InsertSuccessPlan = z.infer<typeof insertSuccessPlanSchema>;
export type SuccessPlan = typeof successPlans.$inferSelect;

// Business Reviews - Regular meetings to validate alignment and track progress
export const businessReviews = pgTable("business_reviews", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  reviewDate: timestamp("review_date").notNull(),
  reviewType: text("review_type", { enum: ["monthly", "quarterly", "milestone", "ad_hoc"] }).notNull().default("monthly"),
  attendees: text("attendees"), // Comma-separated list of attendees
  agenda: text("agenda"), // Meeting agenda
  notes: text("notes"), // Meeting notes and discussion points
  actionItems: jsonb("action_items"), // Array of {task: string, owner: string, dueDate: string, status: string}
  clientSentiment: integer("client_sentiment"), // 1-10 score
  sentimentNotes: text("sentiment_notes"), // Qualitative feedback on client mood
  keyDecisions: text("key_decisions"), // Important decisions made
  nextReviewDate: timestamp("next_review_date"), // Scheduled next review
  status: text("status", { enum: ["scheduled", "completed", "cancelled"] }).notNull().default("scheduled"),
  createdBy: text("created_by"), // Consultant who created the review
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBusinessReviewSchema = createInsertSchema(businessReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  reviewDate: z.coerce.date(),
  nextReviewDate: z.coerce.date().nullable().optional(),
});
export type InsertBusinessReview = z.infer<typeof insertBusinessReviewSchema>;
export type BusinessReview = typeof businessReviews.$inferSelect;

// Milestones - Track major project achievements and key dates
export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(), // e.g., "Phase 1 Complete", "First Cohort Trained"
  description: text("description"), // Detailed description
  milestoneType: text("milestone_type", { 
    enum: ["phase_completion", "deliverable", "measurement", "review", "custom"] 
  }).notNull().default("custom"),
  milestoneDate: timestamp("milestone_date").notNull(),
  status: text("status", { enum: ["planned", "achieved", "missed"] }).notNull().default("planned"),
  linkedKPIIds: integer("linked_kpi_ids").array(), // KPIs impacted by this milestone
  linkedReviewId: integer("linked_review_id").references(() => businessReviews.id, { onDelete: "set null" }),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  milestoneDate: z.coerce.date(),
});
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type Milestone = typeof milestones.$inferSelect;

// KPI Actuals - Track actual KPI values over time (for progress tracking)
// Enhanced for Client Value Hub with account-level aggregation
export const kpiActuals = pgTable("kpi_actuals", {
  id: serial("id").primaryKey(),
  jobThemeKPIId: integer("job_theme_kpi_id").notNull().references(() => jobThemeKPIs.id, { onDelete: "cascade" }),
  accountId: integer("account_id").references(() => accounts.id, { onDelete: "set null" }), // For account-level hub aggregation
  actualValue: text("actual_value").notNull(), // Actual measured value (stored as text for flexibility)
  actualDate: timestamp("actual_date").notNull(), // When this value was measured
  measurementPeriod: text("measurement_period"), // e.g., "Q1 2024", "H1 2024", "Monthly - March 2024"
  actualSource: text("actual_source"), // Where this data came from (e.g., "Client HRIS", "Survey results")
  notes: text("notes"), // Additional context about this measurement
  validatedBy: text("validated_by"), // Who validated this data (consultant or client name)
  recordedByRole: text("recorded_by_role", { 
    enum: ["consultant", "delivery", "csm", "client"] 
  }), // Role of person who recorded
  // Value realization enhancements
  confidenceScore: integer("confidence_score"), // 1-10 confidence in this measurement
  valueImpact: text("value_impact"), // Financial value delivered description (e.g., "$250,000 cost savings")
  valueImpactAmount: integer("value_impact_amount"), // Numeric value in dollars (for aggregation)
  variance: text("variance"), // Calculated variance from target (can be % or absolute)
  varianceDirection: text("variance_direction", { enum: ["above", "on_track", "below"] }), // Quick indicator
  linkedInterventionId: integer("linked_intervention_id").references(() => interventions.id, { onDelete: "set null" }),
  linkedMilestoneId: integer("linked_milestone_id").references(() => milestones.id, { onDelete: "set null" }),
  linkedArtefactIds: integer("linked_artefact_ids").array(), // Evidence artefacts supporting this actual
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertKPIActualSchema = createInsertSchema(kpiActuals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  actualDate: z.coerce.date(),
});
export type InsertKPIActual = z.infer<typeof insertKPIActualSchema>;
export type KPIActual = typeof kpiActuals.$inferSelect;

// Success Stories - Link relevant Korn Ferry case studies to projects
export const successStories = pgTable("success_stories", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(), // Case study title
  url: text("url").notNull(), // Link to Korn Ferry case study
  category: text("category"), // e.g., "Sales Transformation", "Employee Experience"
  relevanceReason: text("relevance_reason"), // Why this is relevant to current project
  industry: text("industry"), // Industry of the case study client
  capabilityName: text("capability_name"), // Related Korn Ferry capability
  solutionArea: text("solution_area", {
    enum: ["ASSESS", "DEVELOP", "TRANSFORM", "REWARD", "COMMERCIAL", "ANALYTICS"]
  }),
  excerpt: text("excerpt"), // Brief excerpt from the case study
  isHighlighted: boolean("is_highlighted").notNull().default(false), // Feature this story
  addedBy: text("added_by"), // Consultant who added this
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Unique index: Prevent duplicate URLs within same project (DB-enforced deduplication)
  uniqueProjectUrlIdx: uniqueIndex("success_stories_project_url_idx").on(table.projectId, table.url),
}));

export const insertSuccessStorySchema = createInsertSchema(successStories).omit({
  id: true,
  createdAt: true,
});
export type InsertSuccessStory = z.infer<typeof insertSuccessStorySchema>;
export type SuccessStory = typeof successStories.$inferSelect;

// Success Story Library - Global repository of verified Korn Ferry success stories for AI narrative generation
export const successStoryLibrary = pgTable("success_story_library", {
  id: serial("id").primaryKey(),
  
  // Basic Information
  title: text("title").notNull(), // e.g., "Global Bank Reduces Payment Failures by 94%"
  industry: text("industry").notNull(), // e.g., "Financial Services", "Healthcare"
  clientType: text("client_type"), // e.g., "Fortune 500", "Mid-market", "Public Sector"
  
  // Korn Ferry Classification
  capabilityName: text("capability_name").notNull(), // From knowledge.ts
  solutionArea: text("solution_area", {
    enum: ["ASSESS", "DEVELOP", "TRANSFORM", "REWARD", "COMMERCIAL", "ANALYTICS"]
  }).notNull(),
  relatedKPIs: text("related_kpis").array(), // KPIs this story demonstrates
  
  // Story Content
  challenge: text("challenge").notNull(), // The client's problem/challenge
  solution: text("solution").notNull(), // What Korn Ferry implemented
  results: text("results").notNull(), // The outcomes achieved
  
  // Metrics & Proof Points
  metrics: jsonb("metrics"), // Structured metrics: { "roi": "2.3x", "timeframe": "18 months", "improvement": "94%" }
  timeframeMonths: integer("timeframe_months"), // How long to achieve results
  
  // Verification & Approval
  verificationSource: text("verification_source").notNull(), // e.g., "Published case study", "Internal project records"
  sourceUrl: text("source_url"), // Link to published case study if available
  approvalStatus: text("approval_status", { 
    enum: ["pending", "approved", "archived"] 
  }).notNull().default("pending"),
  approvedBy: text("approved_by"), // Admin who approved this story
  approvedAt: timestamp("approved_at"),
  
  // Metadata
  tags: text("tags").array(), // For filtering: ["digital-transformation", "payments", "reliability"]
  isHighlighted: boolean("is_highlighted").notNull().default(false), // Feature this story
  createdBy: text("created_by").notNull(), // Consultant/admin who created this
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSuccessStoryLibrarySchema = createInsertSchema(successStoryLibrary).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedAt: true,
});
export type InsertSuccessStoryLibrary = z.infer<typeof insertSuccessStoryLibrarySchema>;
export type SuccessStoryLibraryItem = typeof successStoryLibrary.$inferSelect;

// Alignment Share Links - For customer collaboration on KPI baselines/targets
export const alignmentShareLinks = pgTable("alignment_share_links", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  shareToken: text("share_token").notNull().unique(), // Unique token for shareable link
  customerName: text("customer_name"), // Optional: customer contact name
  customerEmail: text("customer_email"), // Optional: customer contact email
  permissions: text("permissions", { enum: ["view", "edit", "comment"] }).notNull().default("edit"), // What customers can do
  status: text("status", { enum: ["active", "expired", "revoked"] }).notNull().default("active"),
  expiresAt: timestamp("expires_at"), // Optional: link expiration
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastAccessedAt: timestamp("last_accessed_at"), // Track when customer last viewed
  
  // Portal section permissions - which sections client can access
  portalSections: jsonb("portal_sections").$type<{
    overview: boolean;
    strategies: boolean;
    outcomes: boolean;
    progress: boolean;
  }>(),
  // Portal customization
  welcomeMessage: text("welcome_message"), // Custom welcome message for client
  portalTitle: text("portal_title"), // Custom portal title
  // Client interaction tracking
  clientComments: jsonb("client_comments").$type<Array<{
    id: string;
    section: string;
    itemId: string;
    comment: string;
    createdAt: string;
    customerName: string;
  }>>(),
  clientApprovals: jsonb("client_approvals").$type<Array<{
    section: string;
    itemId: string;
    approved: boolean;
    approvedAt: string;
    customerName: string;
  }>>(),
});

export const insertAlignmentShareLinkSchema = createInsertSchema(alignmentShareLinks).omit({
  id: true,
  createdAt: true,
});
export type InsertAlignmentShareLink = z.infer<typeof insertAlignmentShareLinkSchema>;
export type AlignmentShareLink = typeof alignmentShareLinks.$inferSelect;

// Project Value Metrics - Aggregate value realization tracking at project level
export const projectValueMetrics = pgTable("project_value_metrics", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }).unique(),
  // Value Promised (from Alignment phase targets) - stored as integers for reliable aggregation
  totalValuePromised: integer("total_value_promised"), // Total promised value in dollars
  valuePromisedBreakdown: jsonb("value_promised_breakdown"), // {jobId: value} breakdown
  // Value Realized (from actual measurements) - stored as integers for reliable aggregation
  totalValueRealized: integer("total_value_realized"), // Actual value delivered so far in dollars
  valueRealizedBreakdown: jsonb("value_realized_breakdown"), // {jobId: value} breakdown
  // Progress Metrics
  overallProgressPercent: integer("overall_progress_percent"), // 0-100
  kpisOnTrack: integer("kpis_on_track").notNull().default(0),
  kpisAtRisk: integer("kpis_at_risk").notNull().default(0),
  kpisOffTrack: integer("kpis_off_track").notNull().default(0),
  kpisNoData: integer("kpis_no_data").notNull().default(0),
  // Velocity & Forecasting
  monthlyValueVelocity: text("monthly_value_velocity"), // Rate of value delivery per month
  projectedCompletionDate: timestamp("projected_completion_date"), // When will targets be hit?
  confidenceLevel: integer("confidence_level"), // 1-10 overall confidence
  // Business Health
  lastReviewDate: timestamp("last_review_date"),
  nextReviewDate: timestamp("next_review_date"),
  clientSentimentAvg: integer("client_sentiment_avg"), // Average from business reviews
  // Metadata
  lastCalculatedAt: timestamp("last_calculated_at").defaultNow().notNull(),
  calculationNotes: text("calculation_notes"), // Any assumptions or notes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProjectValueMetricsSchema = createInsertSchema(projectValueMetrics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastCalculatedAt: true,
});
export type InsertProjectValueMetrics = z.infer<typeof insertProjectValueMetricsSchema>;
export type ProjectValueMetrics = typeof projectValueMetrics.$inferSelect;

// Strategic Pillars - High-level organizational priorities (3-5 per client)
export const strategicPillars = pgTable("strategic_pillars", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g., "Operational Excellence", "Digital Transformation"
  description: text("description"), // Detailed description of the pillar
  owner: text("owner"), // Executive sponsor or owner
  priority: integer("priority"), // Order/rank among pillars (1 = highest)
  status: text("status", { enum: ["draft", "confirmed", "in_progress", "achieved"] }).notNull().default("draft"),
  isAISuggested: boolean("is_ai_suggested").notNull().default(false), // True if AI recommended
  confidence: text("confidence", { enum: ["high", "medium", "low"] }), // AI confidence level
  provenance: jsonb("provenance"), // Source info (AI reasoning, user edits, etc.)
  sourceInsightIds: integer("source_insight_ids").array(), // Links to companyDataPoints that support this pillar
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStrategicPillarSchema = createInsertSchema(strategicPillars).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertStrategicPillar = z.infer<typeof insertStrategicPillarSchema>;
export type StrategicPillar = typeof strategicPillars.$inferSelect;

// Pillar OKR Theme Links - Connect pillars to enterprise OKR themes (many-to-many)
export const pillarOkrThemes = pgTable("pillar_okr_themes", {
  id: serial("id").primaryKey(),
  pillarId: integer("pillar_id").notNull().references(() => strategicPillars.id, { onDelete: "cascade" }),
  okrThemeId: text("okr_theme_id").notNull(), // References ENTERPRISE_OKR_THEMES id from knowledge.ts
  isAIInferred: boolean("is_ai_inferred").notNull().default(false), // True if AI suggested this link
  confidence: text("confidence", { enum: ["high", "medium", "low"] }), // AI confidence level
  rationale: text("rationale"), // Why this theme applies to this pillar
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPillarOkrThemeSchema = createInsertSchema(pillarOkrThemes).omit({
  id: true,
  createdAt: true,
});
export type InsertPillarOkrTheme = z.infer<typeof insertPillarOkrThemeSchema>;
export type PillarOkrTheme = typeof pillarOkrThemes.$inferSelect;

// Pillar Objectives - Business OKRs linked to each strategic pillar
export const pillarObjectives = pgTable("pillar_objectives", {
  id: serial("id").primaryKey(),
  pillarId: integer("pillar_id").notNull().references(() => strategicPillars.id, { onDelete: "cascade" }),
  objectiveType: text("objective_type", { enum: ["company", "hr", "talent"] }).notNull().default("company"),
  objective: text("objective").notNull(), // The objective statement e.g., "Reduce time-to-productivity by 30%"
  keyResults: jsonb("key_results"), // Array of {result: string, target: string, current?: string}
  timeline: text("timeline"), // e.g., "Q1 2025", "FY 2024"
  sponsor: text("sponsor"), // Executive sponsor
  status: text("status", { enum: ["not_started", "in_progress", "on_track", "at_risk", "completed"] }).notNull().default("not_started"),
  isAISuggested: boolean("is_ai_suggested").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPillarObjectiveSchema = createInsertSchema(pillarObjectives).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPillarObjective = z.infer<typeof insertPillarObjectiveSchema>;
export type PillarObjective = typeof pillarObjectives.$inferSelect;

// Strategic Pillar Share Links - Allow clients to view/edit pillars
export const pillarShareLinks = pgTable("pillar_share_links", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(), // Secure random token for URL
  permissions: text("permissions", { enum: ["view", "edit"] }).notNull().default("edit"),
  customerName: text("customer_name"), // Name of customer contact
  customerEmail: text("customer_email"), // Email of customer contact
  status: text("status", { enum: ["active", "expired", "revoked"] }).notNull().default("active"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastAccessedAt: timestamp("last_accessed_at"),
});

export const insertPillarShareLinkSchema = createInsertSchema(pillarShareLinks).omit({
  id: true,
  createdAt: true,
});
export type InsertPillarShareLink = z.infer<typeof insertPillarShareLinkSchema>;
export type PillarShareLink = typeof pillarShareLinks.$inferSelect;

// Dashboard Layouts - User-configurable dashboard widget arrangements per project
export const dashboardLayouts = pgTable("dashboard_layouts", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  layoutConfig: jsonb("layout_config").notNull(), // react-grid-layout config: {lg: Layout[], md: Layout[], sm: Layout[]}
  widgets: jsonb("widgets").notNull(), // Array of {id: string, type: string, title: string, visible: boolean}
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDashboardLayoutSchema = createInsertSchema(dashboardLayouts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertDashboardLayout = z.infer<typeof insertDashboardLayoutSchema>;
export type DashboardLayout = typeof dashboardLayouts.$inferSelect;

// Widget configuration type for type safety
export const widgetConfigSchema = z.object({
  id: z.string(),
  type: z.enum([
    "value-summary",
    "kpi-status-chart", 
    "confidence-gauge",
    "client-sentiment",
    "upcoming-reviews",
    "risk-alerts",
    "strategic-coverage",
    "recent-activity"
  ]),
  title: z.string(),
  visible: z.boolean().default(true),
});
export type WidgetConfig = z.infer<typeof widgetConfigSchema>;

// Layout item type matching react-grid-layout
export const layoutItemSchema = z.object({
  i: z.string(), // widget id
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  minW: z.number().optional(),
  minH: z.number().optional(),
  maxW: z.number().optional(),
  maxH: z.number().optional(),
});
export type LayoutItem = z.infer<typeof layoutItemSchema>;

// ============================================================================
// AI VALUE JUSTIFICATION SYSTEM
// ============================================================================

// Value Justifications - AI-generated value narratives tied to priorities
export const valueJustifications = pgTable("value_justifications", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  jobThemeId: integer("job_theme_id").notNull().references(() => jobThemes.id, { onDelete: "cascade" }),
  
  // Draft content
  title: text("title").notNull(), // e.g., "Reducing Leadership Turnover Value Case"
  draftContent: text("draft_content"), // Rich text/markdown content of the justification
  executiveSummary: text("executive_summary"), // One-paragraph summary for executives
  
  // AI session tracking
  aiSessionId: text("ai_session_id"), // Unique session ID for AI conversation
  aiModelVersion: text("ai_model_version"), // Track which AI model version generated this
  
  // Discovery linkage - tracks which insights were used to generate this
  linkedDiscoveryInsightIds: integer("linked_discovery_insight_ids").array(), // companyDataPoints IDs
  linkedQuestionResponseIds: integer("linked_question_response_ids").array(), // questionResponses IDs
  linkedNoteIds: integer("linked_note_ids").array(), // discoveryNotes IDs
  
  // KPI linkage
  linkedKPIIds: integer("linked_kpi_ids").array(), // jobThemeKPIs IDs used in justification
  
  // Financial projections (extracted/calculated)
  projectedValue: integer("projected_value"), // Total projected value in dollars
  projectedValueTimeframe: text("projected_value_timeframe"), // e.g., "3 years", "12 months"
  confidenceLevel: text("confidence_level", { enum: ["high", "medium", "low"] }),
  
  // Versioning
  version: integer("version").notNull().default(1),
  isLocked: boolean("is_locked").notNull().default(false), // Locked after client approval
  lockedAt: timestamp("locked_at"),
  lockedBy: text("locked_by"),
  
  // Status tracking
  status: text("status", { enum: ["generating", "draft", "refined", "approved", "sent"] }).notNull().default("draft"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertValueJustificationSchema = createInsertSchema(valueJustifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertValueJustification = z.infer<typeof insertValueJustificationSchema>;
export type ValueJustification = typeof valueJustifications.$inferSelect;

// Value Justification Chat Messages - Interactive AI refinement conversation
export const valueJustificationMessages = pgTable("value_justification_messages", {
  id: serial("id").primaryKey(),
  valueJustificationId: integer("value_justification_id").notNull().references(() => valueJustifications.id, { onDelete: "cascade" }),
  
  role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
  content: text("content").notNull(),
  
  // For assistant messages, track what changes were made
  suggestedChanges: jsonb("suggested_changes"), // Array of {section: string, oldText: string, newText: string}
  appliedToVersion: integer("applied_to_version"), // Which draft version this message relates to
  
  // Metadata
  metadata: jsonb("metadata"), // Any additional context (e.g., tokens used, model, etc.)
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertValueJustificationMessageSchema = createInsertSchema(valueJustificationMessages).omit({
  id: true,
  createdAt: true,
});
export type InsertValueJustificationMessage = z.infer<typeof insertValueJustificationMessageSchema>;
export type ValueJustificationMessage = typeof valueJustificationMessages.$inferSelect;

// API Request/Response Schemas for Value Justification

// Generate Value Justification Request
export const generateValueJustificationRequestSchema = z.object({
  tone: z.enum(["executive", "technical", "persuasive"]).optional().default("executive"),
  focusAreas: z.array(z.string()).optional(), // Specific areas to emphasize
  includeFinancials: z.boolean().optional().default(true),
});
export type GenerateValueJustificationRequest = z.infer<typeof generateValueJustificationRequestSchema>;

// Chat Message Request
export const valueJustificationChatRequestSchema = z.object({
  message: z.string().min(1),
  action: z.enum(["refine", "expand", "simplify", "add_metrics", "change_tone"]).optional(),
});
export type ValueJustificationChatRequest = z.infer<typeof valueJustificationChatRequestSchema>;

// Value Justification with Messages (for frontend)
export const valueJustificationWithMessagesSchema = z.object({
  id: z.number(),
  projectId: z.number(),
  jobThemeId: z.number(),
  title: z.string(),
  draftContent: z.string().nullable().optional(),
  executiveSummary: z.string().nullable().optional(),
  aiSessionId: z.string().nullable().optional(),
  linkedDiscoveryInsightIds: z.array(z.number()).nullable().optional(),
  linkedQuestionResponseIds: z.array(z.number()).nullable().optional(),
  linkedNoteIds: z.array(z.number()).nullable().optional(),
  linkedKPIIds: z.array(z.number()).nullable().optional(),
  projectedValue: z.number().nullable().optional(),
  projectedValueTimeframe: z.string().nullable().optional(),
  confidenceLevel: z.enum(["high", "medium", "low"]).nullable().optional(),
  version: z.number(),
  isLocked: z.boolean(),
  status: z.enum(["generating", "draft", "refined", "approved", "sent"]),
  createdAt: z.any(),
  updatedAt: z.any(),
  messages: z.array(z.object({
    id: z.number(),
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
    suggestedChanges: z.any().nullable().optional(),
    appliedToVersion: z.number().nullable().optional(),
    createdAt: z.any(),
  })),
});

// ============================================================================
// KPI COMMITMENTS & SALES-TO-CSM HANDOFF
// ============================================================================

// KPI Commitments - Sales-defined deliverables linked to customer strategies
export const kpiCommitments = pgTable("kpi_commitments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  
  // Link to Discovery
  discoveryThemeId: text("discovery_theme_id"), // Which discovery theme this relates to
  jobThemeId: integer("job_theme_id").references(() => jobThemes.id, { onDelete: "set null" }),
  
  // Strategic Alignment - links to customer's organizational strategy
  strategicPillarId: integer("strategic_pillar_id").references(() => strategicPillars.id, { onDelete: "set null" }),
  pillarObjectiveId: integer("pillar_objective_id").references(() => pillarObjectives.id, { onDelete: "set null" }),
  strategyAlignmentRationale: text("strategy_alignment_rationale"), // Why this links to their strategy
  
  // Value Pillar - ties to Korn Ferry value framework (Grow, Optimise, De-risk, Strengthen)
  valuePillar: text("value_pillar", { 
    enum: ["grow", "optimise", "derisk", "strengthen"] 
  }),
  
  // Solution Pattern - which KF solution this relates to
  solutionPattern: text("solution_pattern", { 
    enum: ["sales_effectiveness", "leadership_development", "org_transformation", "talent_acquisition", "rewards_optimization"] 
  }),
  
  // Health Score for tracking progress
  healthStatus: text("health_status", { 
    enum: ["on_track", "at_risk", "off_track", "needs_data"] 
  }).default("needs_data"),
  
  // The Commitment Details
  commitmentTitle: text("commitment_title").notNull(), // e.g., "Reduce Leadership Turnover by 25%"
  commitmentDescription: text("commitment_description"), // Detailed description
  
  // KPI Definition
  kpiId: integer("kpi_id").references(() => kpis.id, { onDelete: "set null" }), // Link to existing KPI if applicable
  customMetricName: text("custom_metric_name"), // For new metrics not yet in system
  metricUnit: text("metric_unit"), // e.g., "%", "$", "days", "score"
  baselineValue: text("baseline_value"), // Current state
  targetValue: text("target_value"), // Committed target
  targetDate: timestamp("target_date"), // When to achieve
  
  // Ownership
  customerStakeholderName: text("customer_stakeholder_name"), // Client-side owner
  customerStakeholderTitle: text("customer_stakeholder_title"),
  customerStakeholderEmail: text("customer_stakeholder_email"),
  kfOwnerRole: text("kf_owner_role", { enum: ["sales", "consultant", "delivery", "csm"] }), // KF team member role
  kfOwnerName: text("kf_owner_name"),
  
  // Financial Value
  estimatedAnnualValue: integer("estimated_annual_value"), // $ value per year
  valueCalculationNotes: text("value_calculation_notes"), // How value was calculated
  
  // Success Narrative - what does success look like?
  successNarrative: text("success_narrative"), // Qualitative description of success
  
  // ============================================
  // OUTCOME JOURNEY - Korn Ferry Value Path
  // ============================================
  
  // Clear outcome statement - what success looks like
  outcomeStatement: text("outcome_statement"), // e.g., "Leaders at Director+ level will have 2 ready-now successors each"
  
  // Journey Phases - structured implementation path (JSONB)
  // Structure: [{ phase: string, description: string, duration: string, activities: string[], milestones: string[] }]
  journeyPhases: jsonb("journey_phases"), 
  
  // Quick Wins - early value indicators (JSONB)
  // Structure: [{ title: string, description: string, timeline: string, expectedImpact: string }]
  quickWins: jsonb("quick_wins"),
  
  // Key Milestones - major checkpoints (JSONB)
  // Structure: [{ title: string, targetDate: string, description: string, successCriteria: string }]
  keyMilestones: jsonb("key_milestones"),
  
  // Implementation Timeline
  implementationTimeline: text("implementation_timeline"), // e.g., "12-18 months"
  
  // Delivery Readiness
  deliveryReadinessScore: integer("delivery_readiness_score"), // 0-100 score for handoff
  deliveryNotes: text("delivery_notes"), // Special notes for delivery team
  
  // Client Collaboration
  collaborationNotes: text("collaboration_notes"), // Notes from client discussions
  clientConfirmedAt: timestamp("client_confirmed_at"), // When client approved
  clientConfirmedBy: text("client_confirmed_by"), // Who approved
  
  // Workflow Status
  status: text("status", { 
    enum: ["draft", "proposed", "client_confirmed", "handed_off", "in_delivery", "completed", "cancelled"] 
  }).notNull().default("draft"),
  
  // Provenance
  provenance: jsonb("provenance"), // AI suggestions, source data, etc.
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertKpiCommitmentSchema = createInsertSchema(kpiCommitments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertKpiCommitment = z.infer<typeof insertKpiCommitmentSchema>;
export type KpiCommitment = typeof kpiCommitments.$inferSelect;

// Strategy Selections - Persisted strategy choices and generated outcomes per project
export const strategySelections = pgTable("strategy_selections", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  
  // AI-generated strategies (full list from AI)
  generatedStrategies: jsonb("generated_strategies"), // Array of strategy objects
  
  // User-selected strategy IDs
  selectedStrategyIds: text("selected_strategy_ids").array(), // Array of strategy IDs user chose
  
  // AI-generated outcomes based on selected strategies
  generatedOutcomes: jsonb("generated_outcomes"), // Array of outcome objects
  
  // User-selected outcome IDs for handoff
  selectedOutcomeIds: text("selected_outcome_ids").array(), // Array of outcome IDs user confirmed
  
  // Workflow state
  status: text("status", { 
    enum: ["draft", "strategies_selected", "outcomes_generated", "outcomes_confirmed", "ready_for_handoff"] 
  }).notNull().default("draft"),
  
  // Timestamps
  strategiesGeneratedAt: timestamp("strategies_generated_at"),
  strategiesSelectedAt: timestamp("strategies_selected_at"),
  outcomesGeneratedAt: timestamp("outcomes_generated_at"),
  outcomesConfirmedAt: timestamp("outcomes_confirmed_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStrategySelectionSchema = createInsertSchema(strategySelections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertStrategySelection = z.infer<typeof insertStrategySelectionSchema>;
export type StrategySelection = typeof strategySelections.$inferSelect;

// Handoff Packets - Bundle of commitments transferred from Sales to CSM
export const handoffPackets = pgTable("handoff_packets", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  
  // Packet Details
  packetName: text("packet_name").notNull(), // e.g., "Q1 2025 Value Commitments"
  
  // Commitments included
  commitmentIds: integer("commitment_ids").array().notNull(), // Array of kpiCommitment IDs
  
  // Sales Side
  generatedByRole: text("generated_by_role", { enum: ["sales", "consultant"] }).notNull(),
  generatedByName: text("generated_by_name"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  
  // Summary for client/CSM
  executiveSummary: text("executive_summary"), // High-level summary
  clientVisibleSummary: text("client_visible_summary"), // What client sees
  keyDeliverables: text("key_deliverables").array(), // Bullet-point deliverables
  
  // Total Value
  totalCommittedValue: integer("total_committed_value"), // Sum of all commitment values
  
  // CSM Acceptance
  csmOwnerId: text("csm_owner_id"), // CSM who will own delivery
  csmOwnerName: text("csm_owner_name"),
  csmOwnerEmail: text("csm_owner_email"),
  
  // Acceptance Status
  acceptanceState: text("acceptance_state", { 
    enum: ["pending", "accepted", "needs_clarification", "rejected"] 
  }).notNull().default("pending"),
  acceptedAt: timestamp("accepted_at"),
  acceptanceNotes: text("acceptance_notes"), // CSM notes on acceptance
  
  // Follow-up
  clarificationRequests: jsonb("clarification_requests"), // Array of {question, askedAt, answeredAt, answer}
  
  // Handoff Meeting
  handoffMeetingDate: timestamp("handoff_meeting_date"),
  handoffMeetingNotes: text("handoff_meeting_notes"),
  
  // Story Coach Context (from Sales preparation)
  storyCoachContext: jsonb("story_coach_context").$type<{
    coreNarrative: {
      keyMessage: string;
      emotionalGoal: string;
      openingHook: string;
      callToAction: string;
      turningPoint?: string;
      momentOfMeaning?: string;
    };
    tensionQuestions: Array<{
      id?: string;
      prompt: string;
      response?: string;
      methodology?: string;
      rationale?: string;
      source?: "ai" | "manual";
      order?: number;
      targetAudience?: "all" | "specific";
      targetAttendeeNames?: string[];
    }>;
    storyTestResults?: {
      overallScore?: number;
      overallFeedback?: string;
      strengths?: string[];
      improvements?: Array<{ element: string; currentIssue: string; suggestion: string; improvedVersion?: string }>;
      missingElements?: string[];
      nextSteps?: string[];
    };
    selectedTemplates?: string[];
    templateRecommendations?: Array<{
      templateId: string;
      score: number;
      rationale: string;
      fitReasons: string[];
    }>;
    lastUpdated?: string;
  }>(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertHandoffPacketSchema = createInsertSchema(handoffPackets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  generatedAt: true,
});
export type InsertHandoffPacket = z.infer<typeof insertHandoffPacketSchema>;
export type HandoffPacket = typeof handoffPackets.$inferSelect;

// ============================================================================
// AI COMPANION - Session and Message tracking
// ============================================================================

// AI Companion Sessions - Track conversation sessions with context
export const aiSessions = pgTable("ai_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(), // UUID for session identification
  userId: text("user_id"), // Optional user identifier
  accountId: integer("account_id").references(() => accounts.id, { onDelete: "set null" }),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "set null" }),
  
  // Context snapshot - what page/state the user was on
  contextType: text("context_type", { 
    enum: ["global", "account", "initiative", "discovery", "alignment", "realisation", "canvas"] 
  }).notNull().default("global"),
  contextSnapshot: jsonb("context_snapshot"), // Additional context data (page, filters, etc.)
  
  // Session metadata
  title: text("title"), // Optional session title (can be auto-generated)
  isActive: boolean("is_active").notNull().default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAiSessionSchema = createInsertSchema(aiSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAiSession = z.infer<typeof insertAiSessionSchema>;
export type AiSession = typeof aiSessions.$inferSelect;

// AI Companion Messages - Individual messages in a session
export const aiMessages = pgTable("ai_messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => aiSessions.sessionId, { onDelete: "cascade" }),
  
  // Message content
  role: text("role", { enum: ["user", "assistant", "system", "tool"] }).notNull(),
  content: text("content").notNull(),
  
  // Tool calls and results (for assistant messages that invoke tools)
  toolCalls: jsonb("tool_calls"), // Array of {toolName, arguments, result}
  toolName: text("tool_name"), // For tool role messages, which tool was called
  
  // Metadata
  metadata: jsonb("metadata"), // Additional data (tokens used, model, etc.)
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAiMessageSchema = createInsertSchema(aiMessages).omit({
  id: true,
  createdAt: true,
});
export type InsertAiMessage = z.infer<typeof insertAiMessageSchema>;
export type AiMessage = typeof aiMessages.$inferSelect;

// Tool execution result for tracking actions taken
export const toolExecutionSchema = z.object({
  toolName: z.string(),
  arguments: z.record(z.any()),
  result: z.any(),
  status: z.enum(["success", "error", "pending_confirmation"]),
  executedAt: z.string(),
  confirmedByUser: z.boolean().optional(),
});
export type ToolExecution = z.infer<typeof toolExecutionSchema>;

// ============================================================================
// AGENTIC COMPANION - Enhanced State and Capability Framework
// ============================================================================

// Tool capability categories for authorization and UX
export const toolCapabilities = ["read", "write", "edit", "recommend", "workflow", "navigate"] as const;
export type ToolCapability = typeof toolCapabilities[number];

// Entity reference for context tracking
export const entityReferenceSchema = z.object({
  type: z.enum(["account", "project", "kpi", "jobTheme", "pillar", "businessReview", "handoffPacket"]),
  id: z.number(),
  name: z.string().optional(),
  resolvedAt: z.string().optional(),
});
export type EntityReference = z.infer<typeof entityReferenceSchema>;

// Task in the companion's task stack (for multi-step workflows)
export const companionTaskSchema = z.object({
  id: z.string(),
  type: z.enum(["workflow", "recommendation", "edit", "query"]),
  description: z.string(),
  status: z.enum(["pending", "in_progress", "awaiting_confirmation", "completed", "failed"]),
  steps: z.array(z.object({
    stepId: z.string(),
    description: z.string(),
    toolName: z.string().optional(),
    status: z.enum(["pending", "in_progress", "completed", "skipped", "failed"]),
    result: z.any().optional(),
  })).optional(),
  createdAt: z.string(),
  completedAt: z.string().optional(),
});
export type CompanionTask = z.infer<typeof companionTaskSchema>;

// Working memory entry for conversational context
export const workingMemoryEntrySchema = z.object({
  key: z.string(),
  value: z.any(),
  source: z.enum(["user", "tool", "inference"]),
  confidence: z.number().min(0).max(1).optional(),
  expiresAt: z.string().optional(),
});
export type WorkingMemoryEntry = z.infer<typeof workingMemoryEntrySchema>;

// Navigation command for directing user to specific screens
export const navigationCommandSchema = z.object({
  type: z.enum(["navigate", "highlight", "openDialog", "scrollTo", "focus"]),
  path: z.string().optional(),
  elementId: z.string().optional(),
  dialogType: z.string().optional(),
  dialogProps: z.record(z.any()).optional(),
  description: z.string().optional(),
});
export type NavigationCommand = z.infer<typeof navigationCommandSchema>;

// Proactive insight surfaced by the companion
export const proactiveInsightSchema = z.object({
  id: z.string(),
  type: z.enum(["alert", "suggestion", "reminder", "milestone"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  title: z.string(),
  description: z.string(),
  relatedEntity: entityReferenceSchema.optional(),
  suggestedAction: z.object({
    label: z.string(),
    toolName: z.string().optional(),
    toolArgs: z.record(z.any()).optional(),
    navigationPath: z.string().optional(),
  }).optional(),
  dismissedAt: z.string().optional(),
  expiresAt: z.string().optional(),
});
export type ProactiveInsight = z.infer<typeof proactiveInsightSchema>;

// Enhanced companion session state for persistent context
export const companionSessionStateSchema = z.object({
  // Current navigation context
  currentRoute: z.string().optional(),
  previousRoutes: z.array(z.string()).optional(),
  
  // Active entity references (what the user is currently working with)
  activeEntities: z.array(entityReferenceSchema).optional(),
  
  // Task stack for multi-step workflows
  taskStack: z.array(companionTaskSchema).optional(),
  
  // Working memory for conversational context
  workingMemory: z.array(workingMemoryEntrySchema).optional(),
  
  // Pending navigation commands
  pendingNavigation: navigationCommandSchema.optional(),
  
  // Proactive insights to surface
  insights: z.array(proactiveInsightSchema).optional(),
  
  // User preferences inferred during session
  inferredPreferences: z.record(z.any()).optional(),
  
  // Last sync timestamp for frontend state
  lastSyncAt: z.string().optional(),
});
export type CompanionSessionState = z.infer<typeof companionSessionStateSchema>;

// Recommendation result from AI analysis
export const recommendationSchema = z.object({
  id: z.string(),
  type: z.enum(["kpi", "jobTheme", "question", "action", "successStory", "benchmark"]),
  title: z.string(),
  description: z.string(),
  rationale: z.string(),
  confidence: z.number().min(0).max(1),
  priority: z.enum(["low", "medium", "high"]),
  relatedEntity: entityReferenceSchema.optional(),
  suggestedAction: z.object({
    toolName: z.string(),
    toolArgs: z.record(z.any()),
    confirmationMessage: z.string(),
  }).optional(),
  metadata: z.record(z.any()).optional(),
});
export type Recommendation = z.infer<typeof recommendationSchema>;

// Workflow definition for multi-step actions
export const workflowDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(["discovery", "alignment", "realisation", "handoff", "reporting"]),
  steps: z.array(z.object({
    id: z.string(),
    name: z.string(),
    toolName: z.string(),
    toolArgsTemplate: z.record(z.any()),
    optional: z.boolean().optional(),
    dependsOn: z.array(z.string()).optional(),
  })),
  requiredContext: z.array(z.enum(["accountId", "projectId", "jobThemeId", "kpiId"])),
  estimatedDuration: z.string().optional(),
});
export type WorkflowDefinition = z.infer<typeof workflowDefinitionSchema>;

// ============================================================================
// ACCOUNT HUB - Aggregated view for Client Value Hub
// ============================================================================

// Initiative Summary - Compact view of a project/engagement for hub display
export const initiativeSummarySchema = z.object({
  id: z.number(),
  name: z.string(),
  companyName: z.string(),
  currentPhase: z.enum(["discovery", "alignment", "realisation"]),
  lifecyclePhase: z.enum(["discover_qualify", "shape_sell", "deliver_realise", "review_renew", "learn_scale"]).nullable(),
  status: z.enum(["active", "completed", "archived"]),
  ragStatus: z.enum(["green", "amber", "red"]).nullable(),
  startDate: z.any().nullable(),
  targetEndDate: z.any().nullable(),
  initiativeOwner: z.string().nullable(),
  clientLead: z.string().nullable(),
  // Value metrics for this initiative
  totalPromisedValue: z.number().nullable(),
  totalRealizedValue: z.number().nullable(),
  kpiCount: z.number(),
  kpisOnTrack: z.number(),
  kpisAtRisk: z.number(),
});
export type InitiativeSummary = z.infer<typeof initiativeSummarySchema>;

// KPI Summary - Aggregated KPI data for hub display  
export const kpiSummarySchema = z.object({
  id: z.number(),
  initiativeId: z.number(),
  initiativeName: z.string(),
  kpiName: z.string(),
  kpiType: z.enum(["primary", "supporting"]),
  unit: z.string(),
  baselineValue: z.string().nullable(),
  targetValue: z.string().nullable(),
  latestActualValue: z.string().nullable(),
  latestActualDate: z.any().nullable(),
  varianceDirection: z.enum(["above", "on_track", "below"]).nullable(),
  estimatedValuePerUnit: z.number().nullable(),
  promisedValue: z.number().nullable(),
  realizedValue: z.number().nullable(),
});
export type KPISummary = z.infer<typeof kpiSummarySchema>;

// Account Hub - Complete aggregated view for the Account Hub page
export const accountHubSchema = z.object({
  // Account info
  account: z.object({
    id: z.number(),
    name: z.string(),
    industry: z.string().nullable(),
    tier: z.enum(["enterprise", "strategic", "growth"]).nullable(),
    companyLogoUrl: z.string().nullable(),
    healthScore: z.number().nullable(),
    strategyNotes: z.string().nullable(),
    okrSummary: z.string().nullable(),
    accountOwner: z.string().nullable(),
    clientSponsor: z.string().nullable(),
    contractStartDate: z.any().nullable(),
    contractEndDate: z.any().nullable(),
    annualContractValue: z.string().nullable(),
    totalValuePromised: z.number().nullable(),
    totalValueRealized: z.number().nullable(),
    lastQbrDate: z.any().nullable(),
    nextQbrDate: z.any().nullable(),
  }),
  
  // All initiatives/engagements under this account
  initiatives: z.array(initiativeSummarySchema),
  
  // Aggregated KPIs across all initiatives
  kpis: z.array(kpiSummarySchema),
  
  // Account-level issues and opportunities
  issues: z.array(z.object({
    id: z.number(),
    title: z.string(),
    type: z.enum(["issue", "risk", "opportunity"]),
    severity: z.enum(["critical", "high", "medium", "low"]),
    status: z.enum(["open", "in_progress", "resolved", "closed"]),
    solutionArea: z.string().nullable(),
    estimatedValue: z.number().nullable(),
    owner: z.string().nullable(),
    dueDate: z.any().nullable(),
  })),
  
  // Team roles
  teamRoles: z.array(z.object({
    id: z.number(),
    userName: z.string(),
    userEmail: z.string().nullable(),
    role: z.enum(["sales", "consultant", "delivery", "csm", "client_sponsor"]),
    isPrimary: z.boolean(),
  })),
  
  // Headline value metrics
  headlineValue: z.object({
    totalPromised: z.number(),
    totalRealized: z.number(),
    realizationRate: z.number(), // percentage
    initiativesCount: z.number(),
    initiativesActive: z.number(),
    kpisTotal: z.number(),
    kpisOnTrack: z.number(),
    kpisAtRisk: z.number(),
  }),
});
export type AccountHub = z.infer<typeof accountHubSchema>;

// ============================================================================
// INTERACTION ARTIFACTS - Pre/Post Meeting Context & Documents
// ============================================================================

// Interaction Artifacts - Documents and notes for meeting prep and debrief
export const interactionArtifacts = pgTable("interaction_artifacts", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  
  // Artifact classification
  artifactType: text("artifact_type", { 
    enum: ["document", "transcript", "notes", "voice_memo"] 
  }).notNull(),
  meetingContext: text("meeting_context", { 
    enum: ["pre_meeting", "post_meeting"] 
  }).notNull(),
  
  // File metadata (for documents)
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  objectStorageKey: text("object_storage_key"), // Path in object storage
  
  // Content
  title: text("title"), // User-provided title
  freeformNotes: text("freeform_notes"), // Free text notes
  extractedText: text("extracted_text"), // AI-extracted text from documents
  
  // Meeting context
  meetingDate: timestamp("meeting_date"),
  meetingType: text("meeting_type"), // e.g., "Discovery Call", "QBR", "Stakeholder Interview"
  attendees: text("attendees").array(), // List of attendee names
  
  // AI processing
  aiProcessingStatus: text("ai_processing_status", {
    enum: ["pending", "processing", "completed", "failed"]
  }).notNull().default("pending"),
  aiExtractedInsights: jsonb("ai_extracted_insights"), // AI-generated insights from content
  aiSummary: text("ai_summary"), // AI-generated summary
  
  // Metadata
  uploadedBy: text("uploaded_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertInteractionArtifactSchema = createInsertSchema(interactionArtifacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertInteractionArtifact = z.infer<typeof insertInteractionArtifactSchema>;
export type InteractionArtifact = typeof interactionArtifacts.$inferSelect;

// ============================================================================
// SALESFORCE INTEGRATION
// ============================================================================

// Salesforce Integration - OAuth tokens and connection info (one per org)
export const salesforceIntegrations = pgTable("salesforce_integrations", {
  id: serial("id").primaryKey(),
  instanceUrl: text("instance_url").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  tokenIssuedAt: timestamp("token_issued_at").notNull(),
  tokenExpiresAt: timestamp("token_expires_at"),
  userId: text("user_id"),
  userName: text("user_name"),
  orgId: text("org_id"),
  isActive: boolean("is_active").notNull().default(true),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSalesforceIntegrationSchema = createInsertSchema(salesforceIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSalesforceIntegration = z.infer<typeof insertSalesforceIntegrationSchema>;
export type SalesforceIntegration = typeof salesforceIntegrations.$inferSelect;

// Salesforce Account Link - Maps local accounts to Salesforce accounts
export const salesforceAccountLinks = pgTable("salesforce_account_links", {
  id: serial("id").primaryKey(),
  localAccountId: integer("local_account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  salesforceAccountId: text("salesforce_account_id").notNull(),
  salesforceAccountName: text("salesforce_account_name"),
  lastSyncedAt: timestamp("last_synced_at"),
  syncStatus: text("sync_status", { enum: ["synced", "pending", "conflict", "error"] }).notNull().default("synced"),
  lastSyncDirection: text("last_sync_direction", { enum: ["push", "pull"] }),
  syncError: text("sync_error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSalesforceAccountLinkSchema = createInsertSchema(salesforceAccountLinks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSalesforceAccountLink = z.infer<typeof insertSalesforceAccountLinkSchema>;
export type SalesforceAccountLink = typeof salesforceAccountLinks.$inferSelect;

// Salesforce Opportunity Link - Maps local commitments to Salesforce opportunities
export const salesforceOpportunityLinks = pgTable("salesforce_opportunity_links", {
  id: serial("id").primaryKey(),
  localCommitmentId: integer("local_commitment_id").notNull().references(() => kpiCommitments.id, { onDelete: "cascade" }),
  salesforceOpportunityId: text("salesforce_opportunity_id").notNull(),
  salesforceOpportunityName: text("salesforce_opportunity_name"),
  lastSyncedAt: timestamp("last_synced_at"),
  syncStatus: text("sync_status", { enum: ["synced", "pending", "conflict", "error"] }).notNull().default("synced"),
  lastSyncDirection: text("last_sync_direction", { enum: ["push", "pull"] }),
  syncError: text("sync_error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSalesforceOpportunityLinkSchema = createInsertSchema(salesforceOpportunityLinks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSalesforceOpportunityLink = z.infer<typeof insertSalesforceOpportunityLinkSchema>;
export type SalesforceOpportunityLink = typeof salesforceOpportunityLinks.$inferSelect;

// Salesforce Sync Log - History of sync operations
export const salesforceSyncLogs = pgTable("salesforce_sync_logs", {
  id: serial("id").primaryKey(),
  integrationId: integer("integration_id").notNull().references(() => salesforceIntegrations.id, { onDelete: "cascade" }),
  syncType: text("sync_type", { enum: ["full", "incremental", "manual"] }).notNull(),
  direction: text("direction", { enum: ["push", "pull", "bidirectional"] }).notNull(),
  status: text("status", { enum: ["started", "completed", "failed", "partial"] }).notNull(),
  recordsProcessed: integer("records_processed").default(0),
  recordsCreated: integer("records_created").default(0),
  recordsUpdated: integer("records_updated").default(0),
  recordsSkipped: integer("records_skipped").default(0),
  recordsFailed: integer("records_failed").default(0),
  errors: jsonb("errors"),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSalesforceSyncLogSchema = createInsertSchema(salesforceSyncLogs).omit({
  id: true,
  createdAt: true,
});
export type InsertSalesforceSyncLog = z.infer<typeof insertSalesforceSyncLogSchema>;
export type SalesforceSyncLog = typeof salesforceSyncLogs.$inferSelect;

// ============================================================================
// EVIDENCE PACK - Living document for AI-generated claims with proof sources
// ============================================================================

// Evidence Packs - The living envelope for each project/initiative
export const evidencePacks = pgTable("evidence_packs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  accountId: integer("account_id").references(() => accounts.id, { onDelete: "set null" }),
  
  // Pack metadata
  title: text("title").notNull(), // e.g., "Acme Corp - Leadership Transformation Value Case"
  description: text("description"), // Executive summary of the pack
  version: integer("version").notNull().default(1), // Version number for tracking iterations
  
  // Quality scoring (0-100 composite)
  qualityScore: integer("quality_score"), // Overall quality score
  provenanceScore: integer("provenance_score"), // Do sources exist and are they valid?
  confidenceScore: integer("confidence_score"), // How confident is the AI in claims?
  assumptionsScore: integer("assumptions_score"), // Are there undisclosed assumptions?
  leaderScore: integer("leader_score"), // Manager's subjective assessment
  
  // Workflow status
  status: text("status", { 
    enum: ["draft", "pending_review", "in_review", "approved", "rejected", "shared"] 
  }).notNull().default("draft"),
  
  // AI generation metadata
  aiGeneratedAt: timestamp("ai_generated_at"), // When AI last enriched the pack
  aiModelUsed: text("ai_model_used"), // e.g., "gpt-4o"
  aiPromptContext: text("ai_prompt_context"), // Context used to generate recommendations
  
  // Leader review tracking
  reviewerId: text("reviewer_id"), // Leader assigned to review
  reviewerName: text("reviewer_name"),
  reviewStartedAt: timestamp("review_started_at"),
  reviewCompletedAt: timestamp("review_completed_at"),
  reviewNotes: text("review_notes"), // Overall feedback from leader
  
  // Seller/owner
  ownerId: text("owner_id"), // Seller who owns this pack
  ownerName: text("owner_name"),
  
  // Sharing
  shareToken: text("share_token").unique(), // For shareable link to buyers
  sharedAt: timestamp("shared_at"),
  sharedWithEmail: text("shared_with_email"),
  
  // Lifecycle timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEvidencePackSchema = createInsertSchema(evidencePacks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEvidencePack = z.infer<typeof insertEvidencePackSchema>;
export type EvidencePack = typeof evidencePacks.$inferSelect;

// Evidence Pack Items - Individual claims with their supporting evidence
export const evidencePackItems = pgTable("evidence_pack_items", {
  id: serial("id").primaryKey(),
  packId: integer("pack_id").notNull().references(() => evidencePacks.id, { onDelete: "cascade" }),
  
  // Item type - expanded to support full evidence taxonomy
  itemType: text("item_type", { 
    enum: [
      // Original types
      "claim", "insight", "outcome", "success_story", "benchmark", "testimonial", "artifact",
      // Quantitative evidence
      "kpi", "baseline", "target", "assumption",
      // Discovery evidence  
      "stakeholder_claim", "meeting_insight",
      // Adoption/behavior indicators
      "behavior_condition", "behavior_signal", "lever_applied",
      // Delivery proof
      "outcome_signal", "proof_object",
      // Deal progression
      "risk", "decision", "commitment", "deliverable", "next_action",
      // Skills & coaching (internal-facing)
      "coaching_observation", "communication_signal", "leadership_behavior", "skill_growth_metric",
      // Relationship building
      "stakeholder_trust_signal", "relationship_milestone", "engagement_indicator",
      // Journey-based trust evidence (new)
      "success_frame", "assumption_revision", "risk_articulation", "handoff_quality", "reusability_pattern", "trust_milestone"
    ] 
  }).notNull(),
  
  // Evidence phase - where in the trust journey this evidence appears
  evidencePhase: text("evidence_phase", {
    enum: ["leading", "mid_loop", "lagging"]
  }),
  
  // Confidence level for the evidence
  confidenceLevel: text("confidence_level", {
    enum: ["high", "medium", "exploratory"]
  }).default("medium"),
  
  // Source tracking - where this evidence originated
  sourceKind: text("source_kind", {
    enum: ["ai_draft", "human", "system_event", "integration"]
  }),
  sourceEventId: text("source_event_id"), // External event reference
  sourceMeetingId: text("source_meeting_id"), // Meeting this came from
  sourceArtifactId: text("source_artifact_id"), // Document/artifact reference
  sourceRawExcerpt: text("source_raw_excerpt"), // Original quoted text
  
  // Legacy source references (for backwards compatibility)
  sourceType: text("source_type", {
    enum: ["discovery_insight", "outcome", "success_story", "kpi_commitment", "evidence_artefact", "manual", "ai_generated"]
  }),
  sourceId: integer("source_id"), // ID in the source table
  
  // Links to related entities - creates connected evidence graph
  links: jsonb("links").$type<{
    accountId?: number;
    projectId?: number;
    opportunityId?: string;
    engagementId?: string;
    stakeholderIds?: number[];
    kpiIds?: number[];
    commitmentIds?: number[];
    behaviorConditionIds?: number[];
    insightIds?: number[];
    bluesheetId?: number;
  }>(),
  
  // The claim/statement
  claim: text("claim").notNull(), // The value proposition/claim being made
  claimContext: text("claim_context"), // Additional context for the claim
  
  // Structured content for typed items (KPI, baseline, etc)
  content: jsonb("content").$type<{
    metricName?: string;
    value?: number | string;
    unit?: string;
    targetValue?: number | string;
    baselineValue?: number | string;
    delta?: number | string;
    period?: string;
    formula?: string;
    assumptions?: string[];
    stakeholderName?: string;
    stakeholderRole?: string;
    behaviorDescription?: string;
    signalType?: string;
    riskDescription?: string;
    riskSeverity?: "high" | "medium" | "low";
    decisionOutcome?: string;
    deliverableStatus?: string;
    dueDate?: string;
    actionOwner?: string;
    // Journey/trust evidence fields
    successFrameClarity?: "high" | "medium" | "low"; // How clear is the success definition
    sponsorAlignment?: boolean; // Is sponsor aligned on this
    methodAdherence?: "consistent" | "partial" | "deviated"; // Deal discipline
    assumptionRevisionReason?: string; // Why was assumption revised
    handoffCompleteness?: number; // 0-100 score for handoff quality
    reusabilityScore?: number; // 0-100 how reusable is this pattern
    whatThisProves?: string; // Narrative summary of what this evidence proves
  }>(),
  
  // Story thread - links evidence items that form a narrative chain
  storyThreadId: text("story_thread_id"), // Groups related evidence into a story
  precedingItemId: integer("preceding_item_id"), // Previous item in the story chain
  followingItemId: integer("following_item_id"), // Next item in the story chain
  
  // Supporting evidence
  proofSources: jsonb("proof_sources").$type<Array<{
    type: "url" | "pdf" | "case_study" | "benchmark" | "testimonial" | "data_point";
    title: string;
    url?: string;
    excerpt?: string;
    source?: string;
    confidence?: "high" | "medium" | "low";
  }>>(),
  
  // AI provenance - tracking AI generation lineage
  aiGenerated: boolean("ai_generated").notNull().default(false),
  aiProvenance: jsonb("ai_provenance").$type<{
    model: string;
    prompt: string;
    generatedAt: string;
    confidence: number;
    reasoning?: string;
  }>(),
  
  // Quality metrics for this item
  itemConfidenceScore: integer("item_confidence_score"), // 0-100 how confident in this claim
  provenanceVerified: boolean("provenance_verified").notNull().default(false), // Has source been verified?
  
  // Review status - expanded to support validation workflow
  itemStatus: text("item_status", { 
    enum: ["draft", "pending", "validated", "approved", "flagged", "rejected", "needs_evidence", "needs_stakeholder_validation", "needs_input"] 
  }).notNull().default("draft"),
  reviewerComment: text("reviewer_comment"), // Leader's feedback on this specific item
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by"),
  
  // Coaching notes for seller
  coachingTip: text("coaching_tip"), // AI-generated coaching for improving this claim
  
  // Ordering
  displayOrder: integer("display_order").notNull().default(0),
  section: text("section"), // Grouping label (e.g., "Value Proposition", "ROI Claims", "Implementation")
  
  // Value pillar alignment
  valuePillar: text("value_pillar", { enum: ["grow", "optimise", "derisk", "strengthen"] }),
  
  // Audience targeting - who should see this evidence
  audienceScope: text("audience_scope", { 
    enum: ["customer", "internal", "both"] 
  }).default("both"),
  
  // Evidence sensitivity - controls sharing
  evidenceSensitivity: text("evidence_sensitivity", {
    enum: ["client_shareable", "internal_only", "leadership_only"]
  }).default("client_shareable"),
  
  // Skill domain classification - for metrics and coaching
  skillDomain: text("skill_domain", {
    enum: ["soft_skill", "hard_data", "relationship", "skills_building"]
  }),
  
  // Skill category - specific skill being demonstrated/measured
  skillCategory: text("skill_category", {
    enum: [
      // Soft skills
      "communication", "coaching", "leadership", "influence", "negotiation", "presentation",
      // Relationship building
      "stakeholder_trust", "engagement", "rapport", "alignment", "collaboration",
      // Hard data/quantitative
      "financial_impact", "operational_metrics", "performance_data", "benchmark_comparison",
      // Skills building
      "methodology_application", "discovery_technique", "value_articulation", "objection_handling"
    ]
  }),
  
  // Metric tracking for skills/relationship building
  metricType: text("metric_type", {
    enum: ["quantitative", "qualitative", "behavioral", "milestone"]
  }),
  metricValue: text("metric_value"), // The measured value (could be number or rating)
  metricUnit: text("metric_unit"), // e.g., "%, score, count, rating"
  metricBaseline: text("metric_baseline"), // Starting point for comparison
  metricTarget: text("metric_target"), // Goal to achieve
  
  // Idempotency key for deduplication when syncing
  idempotencyKey: text("idempotency_key").unique(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEvidencePackItemSchema = createInsertSchema(evidencePackItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEvidencePackItem = z.infer<typeof insertEvidencePackItemSchema>;
export type EvidencePackItem = typeof evidencePackItems.$inferSelect;

// Evidence Pack Comments - Communication thread between leader and seller
export const evidencePackComments = pgTable("evidence_pack_comments", {
  id: serial("id").primaryKey(),
  packId: integer("pack_id").notNull().references(() => evidencePacks.id, { onDelete: "cascade" }),
  itemId: integer("item_id").references(() => evidencePackItems.id, { onDelete: "cascade" }), // Optional: specific item comment
  
  // Comment content
  content: text("content").notNull(),
  
  // Author info
  authorId: text("author_id").notNull(),
  authorName: text("author_name").notNull(),
  authorRole: text("author_role", { enum: ["seller", "leader", "system"] }).notNull(),
  
  // Comment type
  commentType: text("comment_type", { 
    enum: ["feedback", "question", "coaching", "approval", "rejection", "suggestion"] 
  }).notNull().default("feedback"),
  
  // Resolution tracking
  isResolved: boolean("is_resolved").notNull().default(false),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: text("resolved_by"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEvidencePackCommentSchema = createInsertSchema(evidencePackComments).omit({
  id: true,
  createdAt: true,
});
export type InsertEvidencePackComment = z.infer<typeof insertEvidencePackCommentSchema>;
export type EvidencePackComment = typeof evidencePackComments.$inferSelect;

// Evidence Pack Audit Log - Track all changes for compliance
export const evidencePackAuditLog = pgTable("evidence_pack_audit_log", {
  id: serial("id").primaryKey(),
  packId: integer("pack_id").notNull().references(() => evidencePacks.id, { onDelete: "cascade" }),
  itemId: integer("item_id").references(() => evidencePackItems.id, { onDelete: "set null" }),
  
  // Action tracking
  action: text("action", { 
    enum: ["created", "updated", "item_added", "item_removed", "item_approved", "item_rejected", 
           "submitted_for_review", "review_started", "approved", "rejected", "shared", "exported"] 
  }).notNull(),
  
  // Actor info
  actorId: text("actor_id").notNull(),
  actorName: text("actor_name").notNull(),
  actorRole: text("actor_role"),
  
  // Change details
  previousValue: jsonb("previous_value"), // State before change
  newValue: jsonb("new_value"), // State after change
  notes: text("notes"), // Additional context
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEvidencePackAuditLogSchema = createInsertSchema(evidencePackAuditLog).omit({
  id: true,
  createdAt: true,
});
export type InsertEvidencePackAuditLog = z.infer<typeof insertEvidencePackAuditLogSchema>;
export type EvidencePackAuditLog = typeof evidencePackAuditLog.$inferSelect;

// Evidence Pack with Items - Combined type for API responses
export const evidencePackWithItemsSchema = z.object({
  pack: z.object({
    id: z.number(),
    projectId: z.number(),
    accountId: z.number().nullable().optional(),
    title: z.string(),
    description: z.string().nullable().optional(),
    version: z.number(),
    qualityScore: z.number().nullable().optional(),
    provenanceScore: z.number().nullable().optional(),
    confidenceScore: z.number().nullable().optional(),
    assumptionsScore: z.number().nullable().optional(),
    leaderScore: z.number().nullable().optional(),
    status: z.enum(["draft", "pending_review", "in_review", "approved", "rejected", "shared"]),
    reviewerId: z.string().nullable().optional(),
    reviewerName: z.string().nullable().optional(),
    ownerId: z.string().nullable().optional(),
    ownerName: z.string().nullable().optional(),
    shareToken: z.string().nullable().optional(),
    createdAt: z.any(),
    updatedAt: z.any(),
  }),
  items: z.array(z.object({
    id: z.number(),
    packId: z.number(),
    itemType: z.enum(["claim", "insight", "outcome", "success_story", "benchmark", "testimonial", "artifact"]),
    sourceType: z.enum(["discovery_insight", "outcome", "success_story", "kpi_commitment", "evidence_artefact", "manual", "ai_generated"]).nullable().optional(),
    sourceId: z.number().nullable().optional(),
    claim: z.string(),
    claimContext: z.string().nullable().optional(),
    proofSources: z.array(z.object({
      type: z.enum(["url", "pdf", "case_study", "benchmark", "testimonial", "data_point"]),
      title: z.string(),
      url: z.string().optional(),
      excerpt: z.string().optional(),
      source: z.string().optional(),
      confidence: z.enum(["high", "medium", "low"]).optional(),
    })).nullable().optional(),
    aiGenerated: z.boolean(),
    itemConfidenceScore: z.number().nullable().optional(),
    provenanceVerified: z.boolean(),
    itemStatus: z.enum(["pending", "approved", "flagged", "rejected", "needs_evidence"]),
    reviewerComment: z.string().nullable().optional(),
    coachingTip: z.string().nullable().optional(),
    displayOrder: z.number(),
    section: z.string().nullable().optional(),
    valuePillar: z.enum(["grow", "optimise", "derisk", "strengthen"]).nullable().optional(),
    createdAt: z.any(),
    updatedAt: z.any(),
  })),
  comments: z.array(z.object({
    id: z.number(),
    packId: z.number(),
    itemId: z.number().nullable().optional(),
    content: z.string(),
    authorName: z.string(),
    authorRole: z.enum(["seller", "leader", "system"]),
    commentType: z.enum(["feedback", "question", "coaching", "approval", "rejection", "suggestion"]),
    isResolved: z.boolean(),
    createdAt: z.any(),
  })).optional(),
});
export type EvidencePackWithItems = z.infer<typeof evidencePackWithItemsSchema>;

// ============================================================================
// EVIDENCE PACK LIVING DOCUMENT ARTIFACTS
// Four core artifacts that make the Evidence Pack a living cognitive surface
// ============================================================================

// 1️⃣ Success Frame Snapshot - Sponsor-owned KPIs with baselines, targets, confidence
// This is Evidence Definition - what becomes true for the sponsor
export const successFrameSnapshots = pgTable("success_frame_snapshots", {
  id: serial("id").primaryKey(),
  packId: integer("pack_id").notNull().references(() => evidencePacks.id, { onDelete: "cascade" }),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  
  // Snapshot versioning (living document pattern)
  version: integer("version").notNull().default(1),
  isCurrentVersion: boolean("is_current_version").notNull().default(true),
  previousVersionId: integer("previous_version_id"), // Link to superseded version
  
  // 3-5 Sponsor-owned KPIs
  kpis: jsonb("kpis").$type<Array<{
    id: string;
    kpiName: string;
    baseline: string | null;
    baselineDate: string | null;
    baselineSource: string | null;
    target: string | null; // Can be direction (e.g., "improve by 10%") not just absolute
    targetTimeframe: string | null; // e.g., "Q4 2025", "12 months"
    confidenceLevel: "high" | "medium" | "exploratory";
    ownerName: string | null; // CRO/CFO who owns this KPI
    ownerRole: string | null;
    notes: string | null;
    linkedJobThemeKPIId: number | null; // Link to existing KPI if applicable
  }>>().notNull().default([]),
  
  // Uncertainty acknowledgment (critical for sponsor trust)
  uncertaintyStatement: text("uncertainty_statement"), // Explicit acknowledgment of what we don't know
  assumptionsNotes: text("assumptions_notes"), // Key assumptions made
  
  // Lock state
  isLocked: boolean("is_locked").notNull().default(false), // Once agreed with sponsor, lock it
  lockedAt: timestamp("locked_at"),
  lockedBy: text("locked_by"),
  
  // AI inference tracking
  aiInferred: boolean("ai_inferred").notNull().default(false),
  aiInferenceSource: text("ai_inference_source"), // What triggered AI to suggest this
  aiConfirmedBy: text("ai_confirmed_by"), // Who confirmed the AI suggestion
  aiConfirmedAt: timestamp("ai_confirmed_at"),
  
  // Review/approval
  sponsorApproved: boolean("sponsor_approved").notNull().default(false),
  sponsorApprovedAt: timestamp("sponsor_approved_at"),
  sponsorApprovedBy: text("sponsor_approved_by"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSuccessFrameSnapshotSchema = createInsertSchema(successFrameSnapshots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSuccessFrameSnapshot = z.infer<typeof insertSuccessFrameSnapshotSchema>;
export type SuccessFrameSnapshot = typeof successFrameSnapshots.$inferSelect;

// 2️⃣ Behavioural Condition Log - The most important and most neglected layer
// Tracks: What did we deliberately try to change?
export const behaviouralConditionLogs = pgTable("behavioural_condition_logs", {
  id: serial("id").primaryKey(),
  packId: integer("pack_id").notNull().references(() => evidencePacks.id, { onDelete: "cascade" }),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  
  // Max 5 conditions - enforced at application level
  conditions: jsonb("conditions").$type<Array<{
    id: string;
    conditionName: string; // e.g., "Deal shaping quality", "Coaching cadence"
    description: string | null;
    
    // Lever → Behaviour → KPI hypothesis (one line each)
    lever: string; // The KF lever applied
    targetBehaviour: string; // What behaviour we're trying to change
    expectedKPIImpact: string; // Which KPI(s) this should influence
    hypothesis: string; // The explicit hypothesis linking lever to outcome
    
    // Where it shows up
    workflowLocation: string | null; // Where this appears in daily workflow
    measurementMethod: string | null; // How we observe this condition
    
    // RAG status + narrative note
    ragStatus: "red" | "amber" | "green" | null;
    narrativeNote: string | null; // Interpretation, not explanation
    
    // Tracking
    observedBehaviourShift: string | null; // What actually changed
    linkedKPIIds: string[] | null; // KPIs this condition is linked to
    
    // Timestamps
    establishedAt: string | null;
    lastObservedAt: string | null;
    lastUpdatedAt: string;
  }>>().notNull().default([]),
  
  // AI inference
  aiSuggestedConditions: jsonb("ai_suggested_conditions").$type<Array<{
    conditionName: string;
    lever: string;
    targetBehaviour: string;
    expectedKPIImpact: string;
    confidence: number;
    reasoning: string;
    suggestedAt: string;
  }>>(),
  
  // Version tracking
  version: integer("version").notNull().default(1),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBehaviouralConditionLogSchema = createInsertSchema(behaviouralConditionLogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBehaviouralConditionLog = z.infer<typeof insertBehaviouralConditionLogSchema>;
export type BehaviouralConditionLog = typeof behaviouralConditionLogs.$inferSelect;

// 3️⃣ KPI Movement View - Baseline → Current → Trend with RAG status
// Visual representation of progress against success frame KPIs
export const kpiMovementViews = pgTable("kpi_movement_views", {
  id: serial("id").primaryKey(),
  packId: integer("pack_id").notNull().references(() => evidencePacks.id, { onDelete: "cascade" }),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  successFrameId: integer("success_frame_id").references(() => successFrameSnapshots.id, { onDelete: "set null" }),
  
  // KPI movement records
  movements: jsonb("movements").$type<Array<{
    id: string;
    kpiId: string; // Reference to success frame KPI
    kpiName: string;
    
    // Movement data
    baseline: string;
    baselineDate: string;
    current: string;
    currentDate: string;
    target: string;
    
    // Trend calculation
    trendDirection: "up" | "down" | "flat";
    trendPercentage: number | null; // Calculated percentage change
    trendDescription: string | null; // e.g., "Improved 15% from baseline"
    
    // RAG status with note
    ragStatus: "red" | "amber" | "green";
    ragNote: string | null; // Interpretive note, not explanation
    
    // Progress against target
    progressPercentage: number | null; // 0-100% toward target
    projectedCompletionDate: string | null;
    
    // Historical readings (for sparkline/trend visualization)
    readings: Array<{
      value: string;
      date: string;
      source: string | null;
    }>;
    
    // Linked interventions
    linkedInterventionIds: number[] | null;
    linkedBehaviouralConditionIds: string[] | null;
  }>>().notNull().default([]),
  
  // Overall summary
  overallHealthScore: integer("overall_health_score"), // 0-100
  overallNarrative: text("overall_narrative"), // AI-generated summary of KPI health
  
  // Auto-calculation metadata
  lastCalculatedAt: timestamp("last_calculated_at").defaultNow(),
  calculationSource: text("calculation_source"), // What triggered recalculation
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertKPIMovementViewSchema = createInsertSchema(kpiMovementViews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertKPIMovementView = z.infer<typeof insertKPIMovementViewSchema>;
export type KPIMovementView = typeof kpiMovementViews.$inferSelect;

// 4️⃣ Sponsor Narrative Spine - Auto-generated, reusable story structure
// A single, repeatable structure that can become any artifact (QBR, renewal, ExCo update)
export const sponsorNarrativeSpines = pgTable("sponsor_narrative_spines", {
  id: serial("id").primaryKey(),
  packId: integer("pack_id").notNull().references(() => evidencePacks.id, { onDelete: "cascade" }),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  
  // Version tracking (narrative accumulates, never restarts)
  version: integer("version").notNull().default(1),
  previousVersionId: integer("previous_version_id"), // For audit trail
  
  // The Narrative Spine structure (each section auto-assembled from evidence)
  spine: jsonb("spine").$type<{
    // 1. What we agreed success meant
    agreedSuccess: {
      summary: string;
      kpiSummary: string;
      sponsorQuote: string | null;
      agreedAt: string | null;
      sourceSuccessFrameId: number | null;
    };
    
    // 2. Where we started
    startingPoint: {
      summary: string;
      keyBaselines: Array<{ kpi: string; baseline: string; date: string }>;
      initialChallenges: string[];
      contextNotes: string | null;
    };
    
    // 3. What we deliberately changed
    deliberateChanges: {
      summary: string;
      interventions: Array<{
        intervention: string;
        rationale: string;
        lever: string | null;
      }>;
      sourceBehaviouralConditionIds: string[] | null;
    };
    
    // 4. What behaviours shifted (or didn't)
    behaviourShifts: {
      summary: string;
      shifts: Array<{
        behaviour: string;
        shifted: boolean;
        evidence: string | null;
        impact: string | null;
      }>;
      unshiftedBehaviours: string[];
    };
    
    // 5. What moved in the numbers
    numberMovements: {
      summary: string;
      movements: Array<{
        kpi: string;
        from: string;
        to: string;
        change: string;
        ragStatus: "red" | "amber" | "green";
      }>;
      overallProgress: string;
      sourceKPIMovementViewId: number | null;
    };
    
    // 6. What we learned
    learnings: {
      summary: string;
      keyLearnings: string[];
      surprises: string[] | null;
      whatWorked: string[] | null;
      whatDidnt: string[] | null;
    };
    
    // 7. What we will do next
    nextSteps: {
      summary: string;
      plannedActions: Array<{
        action: string;
        owner: string | null;
        timeline: string | null;
      }>;
      openQuestions: string[] | null;
    };
  }>().notNull(),
  
  // AI generation metadata
  aiGenerated: boolean("ai_generated").notNull().default(false),
  aiGeneratedAt: timestamp("ai_generated_at"),
  aiModel: text("ai_model"),
  aiConfidence: integer("ai_confidence"), // 0-100
  
  // Human review
  humanReviewedAt: timestamp("human_reviewed_at"),
  humanReviewedBy: text("human_reviewed_by"),
  humanEdits: jsonb("human_edits").$type<Array<{
    section: string;
    originalText: string;
    editedText: string;
    editedAt: string;
    editedBy: string;
  }>>(),
  
  // Export tracking
  lastExportedAs: text("last_exported_as"), // "qbr_deck", "renewal_brief", "exec_update"
  lastExportedAt: timestamp("last_exported_at"),
  exportHistory: jsonb("export_history").$type<Array<{
    format: string;
    exportedAt: string;
    exportedBy: string;
  }>>(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSponsorNarrativeSpineSchema = createInsertSchema(sponsorNarrativeSpines).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSponsorNarrativeSpine = z.infer<typeof insertSponsorNarrativeSpineSchema>;
export type SponsorNarrativeSpine = typeof sponsorNarrativeSpines.$inferSelect;

// ============================================================================
// AI GUIDANCE SYSTEM - Next Best Action engine for Sellers and Managers
// ============================================================================

// AI Guidance Events - Event-triggered AI suggestions for sellers/managers
export const aiGuidanceEvents = pgTable("ai_guidance_events", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  packId: integer("pack_id").references(() => evidencePacks.id, { onDelete: "set null" }),
  
  // Target persona
  targetPersona: text("target_persona", { enum: ["seller", "manager"] }).notNull(),
  
  // Guidance type (maps to the three surfaces per persona)
  guidanceType: text("guidance_type", {
    // Seller surfaces
    // "what_matters" = situational awareness
    // "whats_missing" = AI-detected gaps
    // "next_action" = guided recommendations
    // Manager surfaces  
    // "confidence_breakdown" = pattern recognition
    // "coach_vs_intervene" = AI-guided decisions
    // "whats_scaling" = reusable patterns
    enum: ["what_matters", "whats_missing", "next_action", "confidence_breakdown", "coach_vs_intervene", "whats_scaling"]
  }).notNull(),
  
  // The guidance content
  title: text("title").notNull(),
  message: text("message").notNull(),
  priority: text("priority", { enum: ["high", "medium", "low"] }).notNull().default("medium"),
  
  // What triggered this guidance
  triggerEvent: text("trigger_event", {
    enum: ["deal_stage_change", "meeting_held", "stakeholder_added", "outcome_discussed", 
           "qbr_completed", "kpi_updated", "phase_transition", "time_based", "gap_detected", "manual"]
  }).notNull(),
  triggerDetails: jsonb("trigger_details"), // Context about the trigger
  
  // Suggested actions
  suggestedActions: jsonb("suggested_actions").$type<Array<{
    action: string;
    rationale: string;
    effort: "low" | "medium" | "high";
    impact: "low" | "medium" | "high";
    route: string | null; // Where to navigate in the app
  }>>(),
  
  // Status tracking
  status: text("status", { 
    enum: ["pending", "viewed", "acted_on", "dismissed", "snoozed"] 
  }).notNull().default("pending"),
  viewedAt: timestamp("viewed_at"),
  actedOnAt: timestamp("acted_on_at"),
  dismissedAt: timestamp("dismissed_at"),
  dismissReason: text("dismiss_reason"),
  snoozedUntil: timestamp("snoozed_until"),
  
  // AI metadata
  aiModel: text("ai_model"),
  aiConfidence: integer("ai_confidence"), // 0-100
  aiReasoning: text("ai_reasoning"),
  
  // Effectiveness tracking
  wasHelpful: boolean("was_helpful"), // User feedback
  helpfulnessNotes: text("helpfulness_notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // Guidance can expire
});

export const insertAIGuidanceEventSchema = createInsertSchema(aiGuidanceEvents).omit({
  id: true,
  createdAt: true,
});
export type InsertAIGuidanceEvent = z.infer<typeof insertAIGuidanceEventSchema>;
export type AIGuidanceEvent = typeof aiGuidanceEvents.$inferSelect;

// Evidence Pack Lifecycle Events - For event-triggered updates
export const evidencePackLifecycleEvents = pgTable("evidence_pack_lifecycle_events", {
  id: serial("id").primaryKey(),
  packId: integer("pack_id").notNull().references(() => evidencePacks.id, { onDelete: "cascade" }),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  
  // Event type
  eventType: text("event_type", {
    enum: ["deal_stage_change", "meeting_held", "stakeholder_added", "kpi_updated",
           "intervention_added", "qbr_completed", "phase_transition", "evidence_added",
           "behaviour_observed", "narrative_updated", "artifact_created"]
  }).notNull(),
  
  // Event details
  eventData: jsonb("event_data").notNull(), // Flexible event payload
  
  // Processing status
  processed: boolean("processed").notNull().default(false),
  processedAt: timestamp("processed_at"),
  
  // What was updated as result
  resultingUpdates: jsonb("resulting_updates").$type<Array<{
    artifactType: "success_frame" | "behavioural_log" | "kpi_movement" | "narrative_spine";
    updateType: "created" | "updated" | "enriched";
    details: string;
  }>>(),
  
  // AI guidance generated
  guidanceGenerated: boolean("guidance_generated").notNull().default(false),
  guidanceEventIds: integer("guidance_event_ids").array(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEvidencePackLifecycleEventSchema = createInsertSchema(evidencePackLifecycleEvents).omit({
  id: true,
  createdAt: true,
});
export type InsertEvidencePackLifecycleEvent = z.infer<typeof insertEvidencePackLifecycleEventSchema>;
export type EvidencePackLifecycleEvent = typeof evidencePackLifecycleEvents.$inferSelect;

// ============================================================================
// MILLER HEIMAN BLUE SHEET - Strategic Selling Planning Tool
// ============================================================================

// TypeScript interfaces for Blue Sheet JSON structure
export interface BlueSheetBuyingInfluence {
  contactName: string;
  title?: string;
  company?: string;
  buyingInfluenceRoles: ("Economic" | "User" | "Technical" | "Coach")[];
  degreeOfInfluence: "High" | "Medium" | "Low" | "Unknown";
  degreeOfInfluenceMarker: "RedFlag" | "Strength" | "Unknown";
  buyingMode: "Growth" | "Trouble" | "EvenKeel" | "OverConfident" | "Unknown";
  buyingModeMarker: "RedFlag" | "Strength" | "Unknown";
  competitivePreference: "Us" | "Them" | "UsingBudgetForSomethingElse" | "DoNothing" | "UsingInternalResources" | "Unknown";
  competitivePreferenceMarker: "RedFlag" | "Strength" | "Unknown";
  personalWins?: string;
  personalWinsMarker: "RedFlag" | "Strength" | "Unknown";
  businessResults?: string;
  businessResultsMarker: "RedFlag" | "Strength" | "Unknown";
  rating: number; // -5 to +5
  ratingText?: string;
  ratingMarker: "RedFlag" | "Strength" | "Unknown";
  ratingEvidence?: string;
  notes?: string;
}

export interface BlueSheetCompetition {
  competitorType: "BuyingFromSomeoneElse" | "DoNothing" | "UsingBudgetForSomethingElse" | "UsingInternalResources";
  competitorTypeMarker: "RedFlag" | "Strength" | "Unknown";
  competitorName?: string;
  competitorNameMarker: "RedFlag" | "Strength" | "Unknown";
  positionVsCompetitor: "Plus" | "Zero" | "Minus" | "Unknown";
  positionVsCompetitorMarker: "RedFlag" | "Strength" | "Unknown";
  competitiveDetail?: string;
  competitiveDetailMarker: "RedFlag" | "Strength" | "Unknown";
}

export interface BlueSheetSummaryPosition {
  positionType: "RedFlag" | "Strength";
  description: string;
  relatedBuyingInfluence?: string;
  priority: "High" | "Medium" | "Low";
  createdAt?: string;
}

export interface BlueSheetActionPlan {
  id: string;
  subject: string;
  description: string;
  customActionType: "Validate" | "Develop" | "Leverage" | "Remove" | "ProvidePerspective" | "Unknown";
  perspectiveType?: "UnrecognizedProblem" | "UnseenOpportunity" | "UnanticipatedSolution" | "BrokerOfCapabilities";
  assignedTo?: string;
  contactName?: string;
  customPlanPriority: "High" | "Medium" | "Low";
  scheduledStart?: string;
  scheduledEnd?: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  completedAt?: string;
  notes?: string;
}

export interface BlueSheetConflict {
  field: string;
  sourceValues: Record<string, string>;
  conflictDescription: string;
  severity: "High" | "Medium" | "Low";
  resolvedAt?: string;
  resolution?: string;
}

export interface BlueSheetData {
  // Core Objective
  singleSalesObjective: string;
  singleSalesObjectiveMarker: "RedFlag" | "Strength" | "Unknown";
  
  // Customer Timing
  customerTimingForPriorities: "Urgent" | "Later" | "Unknown";
  customerTimingForPrioritiesMarker: "RedFlag" | "Strength" | "Unknown";
  
  // Customer's Stated Objectives
  customersStatedObjectives?: string;
  
  // Evaluation of Objective
  evaluationOfObjective?: string;
  evaluationOfObjectiveMarker: "RedFlag" | "Strength" | "Unknown";
  
  // Current Position
  currentPosition: "Best" | "SharedBest" | "Shared" | "Trailing" | "Panic" | "Unknown";
  currentPositionMarker: "RedFlag" | "Strength" | "Unknown";
  
  // Arrays
  competitions: BlueSheetCompetition[];
  buyingInfluences: BlueSheetBuyingInfluence[];
  summaryOfPositions: BlueSheetSummaryPosition[];
  actionPlans: BlueSheetActionPlan[];
  conflicts: BlueSheetConflict[];
}

// Blue Sheets table - linked to projects
export const blueSheets = pgTable("blue_sheets", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  
  // Version tracking for living document
  version: integer("version").notNull().default(1),
  status: text("status", { 
    enum: ["draft", "in_progress", "reviewed", "finalized"] 
  }).notNull().default("draft"),
  
  // The full Blue Sheet data as JSONB
  data: jsonb("data").$type<BlueSheetData>().notNull(),
  
  // AI generation metadata
  aiGenerated: boolean("ai_generated").notNull().default(false),
  aiModel: text("ai_model"),
  aiGeneratedAt: timestamp("ai_generated_at"),
  sourceContext: jsonb("source_context").$type<{
    discoveryTheme?: string;
    intelligenceData?: boolean;
    greenSheetData?: boolean;
    discoveryQuestions?: boolean;
    meetingAttendees?: boolean;
    storyBuilderData?: boolean;
  }>(),
  
  // Human edits tracking
  lastEditedBy: text("last_edited_by"),
  lastEditedAt: timestamp("last_edited_at"),
  editHistory: jsonb("edit_history").$type<Array<{
    section: string;
    field?: string;
    previousValue: unknown;
    newValue: unknown;
    editedBy: string;
    editedAt: string;
  }>>(),
  
  // Section completion tracking
  sectionCompletion: jsonb("section_completion").$type<{
    sso: number; // 0-100
    buyingInfluences: number;
    competition: number;
    winResults: number;
    strengthsRedFlags: number;
    actionPlan: number;
  }>(),
  
  // Export tracking
  lastExportedAt: timestamp("last_exported_at"),
  exportFormat: text("export_format"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBlueSheetSchema = createInsertSchema(blueSheets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBlueSheet = z.infer<typeof insertBlueSheetSchema>;
export type BlueSheet = typeof blueSheets.$inferSelect;
