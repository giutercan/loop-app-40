import { pgTable, text, serial, integer, decimal, timestamp, boolean, jsonb, date } from "drizzle-orm/pg-core";
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
  priorityScore: integer("priority_score").default(3).notNull(),
  kornFerryPillar: text("korn_ferry_pillar", { 
    enum: ["leadership-development", "talent-acquisition", "succession-planning", "culture-transformation", "organizational-design", "change-management"] 
  }),
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

// Value Hypotheses with provenance
export const valueHypotheses = pgTable("value_hypotheses", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  job: text("job").notNull(),
  primaryKpi: text("primary_kpi").notNull(),
  exposure: decimal("exposure", { precision: 20, scale: 4 }).notNull(),
  target: text("target").notNull(),
  researchDesign: text("research_design"),
  status: text("status", { enum: ["draft", "sent", "approved"] }).notNull().default("draft"),
  confidence: text("confidence", { enum: ["high", "medium", "low"] }).notNull().default("medium"),
  provenance: jsonb("provenance"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertValueHypothesisSchema = createInsertSchema(valueHypotheses).omit({
  id: true,
  createdAt: true,
});
export type InsertValueHypothesis = z.infer<typeof insertValueHypothesisSchema>;
export type ValueHypothesis = typeof valueHypotheses.$inferSelect;

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
