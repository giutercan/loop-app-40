import { pgTable, text, serial, integer, decimal, timestamp, boolean, jsonb, date, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Projects - Each client engagement
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  companyName: text("company_name").notNull(),
  businessUnit: text("business_unit"),
  sector: text("sector"),
  companyLogoUrl: text("company_logo_url"),
  currentPhase: text("current_phase", { enum: ["discovery", "alignment", "realisation"] }).notNull().default("discovery"),
  status: text("status", { enum: ["active", "completed", "archived"] }).notNull().default("active"),
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

// Interventions (timeline items) with provenance
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
  purpose: text("purpose").notNull(), // Why we're asking this question
  relatedKPI: text("related_kpi"), // KPI this question helps measure
  answer: text("answer"), // Client's answer
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
  aggregationSummary: text("aggregation_summary"), // AI-generated summary of all insights for this job
  sourceInsightIds: integer("source_insight_ids").array(), // IDs of companyDataPoints that contribute to this job
  sourceQuestionIds: integer("source_question_ids").array(), // IDs of discoveryQuestions that contribute
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
  prioritizedIds: z.array(z.number()).min(1).max(3), // Enforce top-3 constraint
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
    benchmarkValue: z.string().nullable().optional(),
    benchmarkSource: z.string().nullable().optional(),
    definition: z.string().nullable().optional(),
    measurementFrequency: z.string().nullable().optional(),
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

// KPI Actuals - Track actual KPI values over time (for progress tracking)
export const kpiActuals = pgTable("kpi_actuals", {
  id: serial("id").primaryKey(),
  jobThemeKPIId: integer("job_theme_kpi_id").notNull().references(() => jobThemeKPIs.id, { onDelete: "cascade" }),
  actualValue: text("actual_value").notNull(), // Actual measured value (stored as text for flexibility)
  actualDate: timestamp("actual_date").notNull(), // When this value was measured
  actualSource: text("actual_source"), // Where this data came from (e.g., "Client HRIS", "Survey results")
  notes: text("notes"), // Additional context about this measurement
  validatedBy: text("validated_by"), // Who validated this data (consultant or client name)
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
