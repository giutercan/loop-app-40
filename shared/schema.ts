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
