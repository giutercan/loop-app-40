import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import * as schema from "@shared/schema";
import type {
  Project, InsertProject,
  CompanyDataPoint, InsertCompanyDataPoint,
  Headline, InsertHeadline,
  DiscoveryNotes, InsertDiscoveryNotes,
  ValueCase, InsertValueCase,
  StrategicChallenge, InsertStrategicChallenge,
  Baseline, InsertBaseline,
  Kpi, InsertKpi,
  KpiReading, InsertKpiReading,
  Intervention, InsertIntervention,
  FinancialProjection, InsertFinancialProjection,
  EvidenceDocument, InsertEvidenceDocument,
  AnalyticsReview, InsertAnalyticsReview,
  ResponsibleAiChecklist, InsertResponsibleAiChecklist,
  DiscoveryQuestion, InsertDiscoveryQuestion,
  Attachment, InsertAttachment,
  SharedQuestionnaire, InsertSharedQuestionnaire,
  QuestionResponse, InsertQuestionResponse,
  JobTheme, InsertJobTheme,
  JobThemeKPI, InsertJobThemeKPI,
  DiscoveryPhaseTransfer, InsertDiscoveryPhaseTransfer,
  BusinessReview, InsertBusinessReview,
  KPIActual, InsertKPIActual,
  SuccessStory, InsertSuccessStory
} from "@shared/schema";

export interface IStorage {
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  
  // Company Data Points
  getCompanyDataPoints(projectId: number): Promise<CompanyDataPoint[]>;
  createCompanyDataPoint(dataPoint: InsertCompanyDataPoint): Promise<CompanyDataPoint>;
  updateCompanyDataPoint(id: number, dataPoint: Partial<InsertCompanyDataPoint>): Promise<CompanyDataPoint | undefined>;
  deleteCompanyDataPoint(id: number): Promise<void>;
  
  // Headlines
  getHeadlines(projectId: number): Promise<Headline[]>;
  createHeadline(headline: InsertHeadline): Promise<Headline>;
  deleteHeadline(id: number): Promise<void>;
  
  // Discovery Notes
  getDiscoveryNotes(projectId: number): Promise<DiscoveryNotes | undefined>;
  upsertDiscoveryNotes(notes: InsertDiscoveryNotes): Promise<DiscoveryNotes>;
  
  // Value Cases
  getValueCases(projectId: number): Promise<ValueCase[]>;
  getValueCase(id: number): Promise<ValueCase | undefined>;
  createValueCase(valueCase: InsertValueCase): Promise<ValueCase>;
  updateValueCase(id: number, valueCase: Partial<InsertValueCase>): Promise<ValueCase | undefined>;
  
  // Strategic Challenges
  getStrategicChallenges(projectId: number): Promise<StrategicChallenge[]>;
  createStrategicChallenge(challenge: InsertStrategicChallenge): Promise<StrategicChallenge>;
  updateStrategicChallenge(id: number, challenge: Partial<InsertStrategicChallenge>): Promise<StrategicChallenge | undefined>;
  
  // Baselines
  getBaseline(projectId: number): Promise<Baseline | undefined>;
  createBaseline(baseline: InsertBaseline): Promise<Baseline>;
  updateBaseline(id: number, baseline: Partial<InsertBaseline>): Promise<Baseline | undefined>;
  
  // KPIs
  getKpis(projectId: number): Promise<Kpi[]>;
  getKpi(id: number): Promise<Kpi | undefined>;
  createKpi(kpi: InsertKpi): Promise<Kpi>;
  updateKpi(id: number, kpi: Partial<InsertKpi>): Promise<Kpi | undefined>;
  
  // KPI Readings
  getKpiReadings(kpiId: number): Promise<KpiReading[]>;
  createKpiReading(reading: InsertKpiReading): Promise<KpiReading>;
  
  // Interventions
  getInterventions(projectId: number): Promise<Intervention[]>;
  createIntervention(intervention: InsertIntervention): Promise<Intervention>;
  updateIntervention(id: number, intervention: Partial<InsertIntervention>): Promise<Intervention | undefined>;
  deleteIntervention(id: number): Promise<void>;
  
  // Financial Projections
  getFinancialProjections(projectId: number, scenario?: string): Promise<FinancialProjection[]>;
  createFinancialProjection(projection: InsertFinancialProjection): Promise<FinancialProjection>;
  updateFinancialProjection(id: number, projection: Partial<InsertFinancialProjection>): Promise<FinancialProjection | undefined>;
  
  // Evidence Documents
  getEvidenceDocuments(projectId: number): Promise<EvidenceDocument[]>;
  createEvidenceDocument(document: InsertEvidenceDocument): Promise<EvidenceDocument>;
  deleteEvidenceDocument(id: number): Promise<void>;
  
  // Delete operations for core entities
  deleteProject(id: number): Promise<void>;
  deleteValueCase(id: number): Promise<void>;
  deleteKpi(id: number): Promise<void>;
  deleteBaseline(id: number): Promise<void>;
  deleteKpiReading(id: number): Promise<void>;
  deleteFinancialProjection(id: number): Promise<void>;
  
  // Analytics Reviews
  getAnalyticsReviews(projectId: number): Promise<AnalyticsReview[]>;
  getAnalyticsReview(id: number): Promise<AnalyticsReview | undefined>;
  createAnalyticsReview(review: InsertAnalyticsReview): Promise<AnalyticsReview>;
  updateAnalyticsReview(id: number, review: Partial<InsertAnalyticsReview>): Promise<AnalyticsReview | undefined>;
  deleteAnalyticsReview(id: number): Promise<void>;
  
  // Responsible AI Checklists
  getResponsibleAiChecklists(projectId: number): Promise<ResponsibleAiChecklist[]>;
  getResponsibleAiChecklist(id: number): Promise<ResponsibleAiChecklist | undefined>;
  createResponsibleAiChecklist(checklist: InsertResponsibleAiChecklist): Promise<ResponsibleAiChecklist>;
  updateResponsibleAiChecklist(id: number, checklist: Partial<InsertResponsibleAiChecklist>): Promise<ResponsibleAiChecklist | undefined>;
  deleteResponsibleAiChecklist(id: number): Promise<void>;
  
  // Discovery Questions
  getDiscoveryQuestions(projectId: number): Promise<DiscoveryQuestion[]>;
  getDiscoveryQuestionById(id: number): Promise<DiscoveryQuestion | undefined>;
  createDiscoveryQuestion(question: InsertDiscoveryQuestion): Promise<DiscoveryQuestion>;
  updateDiscoveryQuestion(id: number, question: Partial<InsertDiscoveryQuestion>): Promise<DiscoveryQuestion | undefined>;
  deleteDiscoveryQuestion(id: number): Promise<void>;
  
  // Attachments (file uploads and voice notes)
  getAttachments(projectId: number): Promise<Attachment[]>;
  createAttachment(attachment: InsertAttachment): Promise<Attachment>;
  deleteAttachment(id: number): Promise<void>;
  
  // Shared Questionnaires (client collaboration)
  getSharedQuestionnaire(projectId: number): Promise<SharedQuestionnaire | undefined>;
  getSharedQuestionnaireByToken(token: string): Promise<SharedQuestionnaire | undefined>;
  createSharedQuestionnaire(questionnaire: InsertSharedQuestionnaire): Promise<SharedQuestionnaire>;
  updateSharedQuestionnaire(id: number, questionnaire: Partial<InsertSharedQuestionnaire>): Promise<SharedQuestionnaire | undefined>;
  
  // Question Responses (consultant and client answers)
  getQuestionResponses(questionId: number): Promise<QuestionResponse[]>;
  getQuestionResponsesByQuestionnaire(sharedQuestionnaireId: number): Promise<QuestionResponse[]>;
  createQuestionResponse(response: InsertQuestionResponse): Promise<QuestionResponse>;
  updateQuestionResponse(id: number, response: Partial<InsertQuestionResponse>): Promise<QuestionResponse | undefined>;
  
  // Job Themes (aggregated insights by "Jobs We Do")
  getJobThemes(projectId: number): Promise<JobTheme[]>;
  getJobTheme(id: number): Promise<JobTheme | undefined>;
  createJobTheme(theme: InsertJobTheme): Promise<JobTheme>;
  updateJobTheme(id: number, theme: Partial<InsertJobTheme>): Promise<JobTheme | undefined>;
  deleteJobTheme(id: number): Promise<void>;
  
  // Job Theme KPIs (selected KPIs with baseline data)
  getJobThemeKPIs(jobThemeId: number): Promise<JobThemeKPI[]>;
  createJobThemeKPI(kpi: InsertJobThemeKPI): Promise<JobThemeKPI>;
  updateJobThemeKPI(id: number, kpi: Partial<InsertJobThemeKPI>): Promise<JobThemeKPI | undefined>;
  deleteJobThemeKPI(id: number): Promise<void>;
  
  // Discovery Phase Transfer (finalization and lock)
  getDiscoveryPhaseTransfer(projectId: number): Promise<DiscoveryPhaseTransfer | undefined>;
  createDiscoveryPhaseTransfer(transfer: InsertDiscoveryPhaseTransfer): Promise<DiscoveryPhaseTransfer>;
  updateDiscoveryPhaseTransfer(id: number, transfer: Partial<InsertDiscoveryPhaseTransfer>): Promise<DiscoveryPhaseTransfer | undefined>;
  
  // PHASE 1: Value Realization Features
  
  // Business Reviews
  getBusinessReviews(projectId: number): Promise<BusinessReview[]>;
  getBusinessReview(id: number): Promise<BusinessReview | undefined>;
  createBusinessReview(review: InsertBusinessReview): Promise<BusinessReview>;
  updateBusinessReview(id: number, review: Partial<InsertBusinessReview>): Promise<BusinessReview | undefined>;
  deleteBusinessReview(id: number): Promise<void>;
  
  // KPI Actuals
  getKPIActuals(jobThemeKPIId: number): Promise<KPIActual[]>;
  createKPIActual(actual: InsertKPIActual): Promise<KPIActual>;
  updateKPIActual(id: number, actual: Partial<InsertKPIActual>): Promise<KPIActual | undefined>;
  deleteKPIActual(id: number): Promise<void>;
  
  // Success Stories (project-specific case study links)
  getSuccessStories(projectId: number): Promise<SuccessStory[]>;
  createSuccessStory(story: InsertSuccessStory): Promise<SuccessStory>;
  updateSuccessStory(id: number, story: Partial<InsertSuccessStory>): Promise<SuccessStory | undefined>;
  deleteSuccessStory(id: number): Promise<void>;
  
  // Success Story Library (global verified stories for AI narrative generation)
  getSuccessStoryLibrary(filters?: { 
    industry?: string; 
    capabilityName?: string; 
    solutionArea?: string;
    approvalStatus?: string;
  }): Promise<schema.SuccessStoryLibraryItem[]>;
  getSuccessStoryLibraryItem(id: number): Promise<schema.SuccessStoryLibraryItem | undefined>;
  createSuccessStoryLibraryItem(story: schema.InsertSuccessStoryLibrary): Promise<schema.SuccessStoryLibraryItem>;
  updateSuccessStoryLibraryItem(id: number, story: Partial<schema.InsertSuccessStoryLibrary>): Promise<schema.SuccessStoryLibraryItem | undefined>;
  approveSuccessStoryLibraryItem(id: number, approvedBy: string): Promise<schema.SuccessStoryLibraryItem | undefined>;
  deleteSuccessStoryLibraryItem(id: number): Promise<void>;
}

export class DbStorage implements IStorage {
  // Projects
  async getProjects(): Promise<Project[]> {
    return await db.select().from(schema.projects).orderBy(desc(schema.projects.updatedAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const results = await db.select().from(schema.projects).where(eq(schema.projects.id, id));
    return results[0];
  }

  async createProject(project: InsertProject): Promise<Project> {
    const results = await db.insert(schema.projects).values(project).returning();
    return results[0];
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const results = await db.update(schema.projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(schema.projects.id, id))
      .returning();
    return results[0];
  }

  // Company Data Points
  async getCompanyDataPoints(projectId: number): Promise<CompanyDataPoint[]> {
    return await db.select().from(schema.companyDataPoints)
      .where(eq(schema.companyDataPoints.projectId, projectId))
      .orderBy(desc(schema.companyDataPoints.priorityScore), desc(schema.companyDataPoints.confidence));
  }

  async createCompanyDataPoint(dataPoint: InsertCompanyDataPoint): Promise<CompanyDataPoint> {
    const results = await db.insert(schema.companyDataPoints).values(dataPoint).returning();
    return results[0];
  }

  async updateCompanyDataPoint(id: number, dataPoint: Partial<InsertCompanyDataPoint>): Promise<CompanyDataPoint | undefined> {
    const results = await db.update(schema.companyDataPoints)
      .set(dataPoint)
      .where(eq(schema.companyDataPoints.id, id))
      .returning();
    return results[0];
  }

  async deleteCompanyDataPoint(id: number): Promise<void> {
    await db.delete(schema.companyDataPoints).where(eq(schema.companyDataPoints.id, id));
  }

  // Headlines
  async getHeadlines(projectId: number): Promise<Headline[]> {
    return await db.select().from(schema.headlines)
      .where(eq(schema.headlines.projectId, projectId))
      .orderBy(desc(schema.headlines.createdAt));
  }

  async createHeadline(headline: InsertHeadline): Promise<Headline> {
    const results = await db.insert(schema.headlines).values(headline).returning();
    return results[0];
  }

  async deleteHeadline(id: number): Promise<void> {
    await db.delete(schema.headlines).where(eq(schema.headlines.id, id));
  }

  // Discovery Notes
  async getDiscoveryNotes(projectId: number): Promise<DiscoveryNotes | undefined> {
    const results = await db.select().from(schema.discoveryNotes)
      .where(eq(schema.discoveryNotes.projectId, projectId));
    return results[0];
  }

  async upsertDiscoveryNotes(notes: InsertDiscoveryNotes): Promise<DiscoveryNotes> {
    const existing = await this.getDiscoveryNotes(notes.projectId);
    if (existing) {
      const results = await db.update(schema.discoveryNotes)
        .set({ ...notes, updatedAt: new Date() })
        .where(eq(schema.discoveryNotes.projectId, notes.projectId))
        .returning();
      return results[0];
    } else {
      const results = await db.insert(schema.discoveryNotes).values(notes).returning();
      return results[0];
    }
  }

  // Value Cases
  async getValueCases(projectId: number): Promise<ValueCase[]> {
    return await db.select().from(schema.valueCases)
      .where(eq(schema.valueCases.projectId, projectId))
      .orderBy(desc(schema.valueCases.createdAt));
  }

  async getValueCase(id: number): Promise<ValueCase | undefined> {
    const results = await db.select().from(schema.valueCases)
      .where(eq(schema.valueCases.id, id));
    return results[0];
  }

  async createValueCase(valueCase: InsertValueCase): Promise<ValueCase> {
    const results = await db.insert(schema.valueCases).values(valueCase).returning();
    return results[0];
  }

  async updateValueCase(id: number, valueCase: Partial<InsertValueCase>): Promise<ValueCase | undefined> {
    const results = await db.update(schema.valueCases)
      .set(valueCase)
      .where(eq(schema.valueCases.id, id))
      .returning();
    return results[0];
  }

  // Strategic Challenges
  async getStrategicChallenges(projectId: number): Promise<StrategicChallenge[]> {
    return await db.select().from(schema.strategicChallenges)
      .where(eq(schema.strategicChallenges.projectId, projectId))
      .orderBy(schema.strategicChallenges.sortOrder);
  }

  async createStrategicChallenge(challenge: InsertStrategicChallenge): Promise<StrategicChallenge> {
    const results = await db.insert(schema.strategicChallenges).values(challenge).returning();
    return results[0];
  }

  async updateStrategicChallenge(id: number, challenge: Partial<InsertStrategicChallenge>): Promise<StrategicChallenge | undefined> {
    const results = await db.update(schema.strategicChallenges)
      .set(challenge)
      .where(eq(schema.strategicChallenges.id, id))
      .returning();
    return results[0];
  }

  // Baselines
  async getBaseline(projectId: number): Promise<Baseline | undefined> {
    const results = await db.select().from(schema.baselines)
      .where(eq(schema.baselines.projectId, projectId))
      .orderBy(desc(schema.baselines.createdAt));
    return results[0];
  }

  async createBaseline(baseline: InsertBaseline): Promise<Baseline> {
    const results = await db.insert(schema.baselines).values(baseline).returning();
    return results[0];
  }

  async updateBaseline(id: number, baseline: Partial<InsertBaseline>): Promise<Baseline | undefined> {
    const results = await db.update(schema.baselines)
      .set(baseline)
      .where(eq(schema.baselines.id, id))
      .returning();
    return results[0];
  }

  // KPIs
  async getKpis(projectId: number): Promise<Kpi[]> {
    return await db.select().from(schema.kpis)
      .where(eq(schema.kpis.projectId, projectId));
  }

  async getKpi(id: number): Promise<Kpi | undefined> {
    const results = await db.select().from(schema.kpis).where(eq(schema.kpis.id, id));
    return results[0];
  }

  async createKpi(kpi: InsertKpi): Promise<Kpi> {
    const results = await db.insert(schema.kpis).values(kpi).returning();
    return results[0];
  }

  async updateKpi(id: number, kpi: Partial<InsertKpi>): Promise<Kpi | undefined> {
    const results = await db.update(schema.kpis)
      .set(kpi)
      .where(eq(schema.kpis.id, id))
      .returning();
    return results[0];
  }

  // KPI Readings
  async getKpiReadings(kpiId: number): Promise<KpiReading[]> {
    return await db.select().from(schema.kpiReadings)
      .where(eq(schema.kpiReadings.kpiId, kpiId))
      .orderBy(schema.kpiReadings.recordedAt);
  }

  async createKpiReading(reading: InsertKpiReading): Promise<KpiReading> {
    const results = await db.insert(schema.kpiReadings).values(reading).returning();
    return results[0];
  }

  // Interventions
  async getInterventions(projectId: number): Promise<Intervention[]> {
    return await db.select().from(schema.interventions)
      .where(eq(schema.interventions.projectId, projectId))
      .orderBy(schema.interventions.sortOrder);
  }

  async createIntervention(intervention: InsertIntervention): Promise<Intervention> {
    const results = await db.insert(schema.interventions).values(intervention).returning();
    return results[0];
  }

  async updateIntervention(id: number, intervention: Partial<InsertIntervention>): Promise<Intervention | undefined> {
    const results = await db.update(schema.interventions)
      .set(intervention)
      .where(eq(schema.interventions.id, id))
      .returning();
    return results[0];
  }

  async deleteIntervention(id: number): Promise<void> {
    await db.delete(schema.interventions).where(eq(schema.interventions.id, id));
  }

  // Financial Projections
  async getFinancialProjections(projectId: number, scenario?: string): Promise<FinancialProjection[]> {
    const results = await db.select().from(schema.financialProjections)
      .where(eq(schema.financialProjections.projectId, projectId))
      .orderBy(schema.financialProjections.year);
    
    if (scenario) {
      return results.filter(r => r.scenario === scenario);
    }
    return results;
  }

  async createFinancialProjection(projection: InsertFinancialProjection): Promise<FinancialProjection> {
    const results = await db.insert(schema.financialProjections).values(projection).returning();
    return results[0];
  }

  async updateFinancialProjection(id: number, projection: Partial<InsertFinancialProjection>): Promise<FinancialProjection | undefined> {
    const results = await db.update(schema.financialProjections)
      .set(projection)
      .where(eq(schema.financialProjections.id, id))
      .returning();
    return results[0];
  }

  // Evidence Documents
  async getEvidenceDocuments(projectId: number): Promise<EvidenceDocument[]> {
    return await db.select().from(schema.evidenceDocuments)
      .where(eq(schema.evidenceDocuments.projectId, projectId))
      .orderBy(desc(schema.evidenceDocuments.createdAt));
  }

  async createEvidenceDocument(document: InsertEvidenceDocument): Promise<EvidenceDocument> {
    const results = await db.insert(schema.evidenceDocuments).values(document).returning();
    return results[0];
  }

  async deleteEvidenceDocument(id: number): Promise<void> {
    await db.delete(schema.evidenceDocuments).where(eq(schema.evidenceDocuments.id, id));
  }

  // Delete operations for core entities
  async deleteProject(id: number): Promise<void> {
    await db.delete(schema.projects).where(eq(schema.projects.id, id));
  }

  async deleteValueCase(id: number): Promise<void> {
    await db.delete(schema.valueCases).where(eq(schema.valueCases.id, id));
  }

  async deleteKpi(id: number): Promise<void> {
    await db.delete(schema.kpis).where(eq(schema.kpis.id, id));
  }

  async deleteBaseline(id: number): Promise<void> {
    await db.delete(schema.baselines).where(eq(schema.baselines.id, id));
  }

  async deleteKpiReading(id: number): Promise<void> {
    await db.delete(schema.kpiReadings).where(eq(schema.kpiReadings.id, id));
  }

  async deleteFinancialProjection(id: number): Promise<void> {
    await db.delete(schema.financialProjections).where(eq(schema.financialProjections.id, id));
  }

  // Analytics Reviews
  async getAnalyticsReviews(projectId: number): Promise<AnalyticsReview[]> {
    return await db.select().from(schema.analyticsReviews)
      .where(eq(schema.analyticsReviews.projectId, projectId))
      .orderBy(desc(schema.analyticsReviews.submittedAt));
  }

  async getAnalyticsReview(id: number): Promise<AnalyticsReview | undefined> {
    const results = await db.select().from(schema.analyticsReviews)
      .where(eq(schema.analyticsReviews.id, id));
    return results[0];
  }

  async createAnalyticsReview(review: InsertAnalyticsReview): Promise<AnalyticsReview> {
    const results = await db.insert(schema.analyticsReviews).values(review).returning();
    return results[0];
  }

  async updateAnalyticsReview(id: number, review: Partial<InsertAnalyticsReview>): Promise<AnalyticsReview | undefined> {
    const results = await db.update(schema.analyticsReviews)
      .set(review)
      .where(eq(schema.analyticsReviews.id, id))
      .returning();
    return results[0];
  }

  async deleteAnalyticsReview(id: number): Promise<void> {
    await db.delete(schema.analyticsReviews).where(eq(schema.analyticsReviews.id, id));
  }

  // Responsible AI Checklists
  async getResponsibleAiChecklists(projectId: number): Promise<ResponsibleAiChecklist[]> {
    return await db.select().from(schema.responsibleAiChecklists)
      .where(eq(schema.responsibleAiChecklists.projectId, projectId))
      .orderBy(desc(schema.responsibleAiChecklists.createdAt));
  }

  async getResponsibleAiChecklist(id: number): Promise<ResponsibleAiChecklist | undefined> {
    const results = await db.select().from(schema.responsibleAiChecklists)
      .where(eq(schema.responsibleAiChecklists.id, id));
    return results[0];
  }

  async createResponsibleAiChecklist(checklist: InsertResponsibleAiChecklist): Promise<ResponsibleAiChecklist> {
    const results = await db.insert(schema.responsibleAiChecklists).values(checklist).returning();
    return results[0];
  }

  async updateResponsibleAiChecklist(id: number, checklist: Partial<InsertResponsibleAiChecklist>): Promise<ResponsibleAiChecklist | undefined> {
    const results = await db.update(schema.responsibleAiChecklists)
      .set(checklist)
      .where(eq(schema.responsibleAiChecklists.id, id))
      .returning();
    return results[0];
  }

  async deleteResponsibleAiChecklist(id: number): Promise<void> {
    await db.delete(schema.responsibleAiChecklists).where(eq(schema.responsibleAiChecklists.id, id));
  }
  
  // Discovery Questions
  async getDiscoveryQuestions(projectId: number): Promise<DiscoveryQuestion[]> {
    return await db.select().from(schema.discoveryQuestions)
      .where(eq(schema.discoveryQuestions.projectId, projectId))
      .orderBy(schema.discoveryQuestions.sortOrder, schema.discoveryQuestions.createdAt);
  }
  
  async getDiscoveryQuestionById(id: number): Promise<DiscoveryQuestion | undefined> {
    const results = await db.select().from(schema.discoveryQuestions)
      .where(eq(schema.discoveryQuestions.id, id));
    return results[0];
  }
  
  async createDiscoveryQuestion(question: InsertDiscoveryQuestion): Promise<DiscoveryQuestion> {
    const results = await db.insert(schema.discoveryQuestions).values(question).returning();
    return results[0];
  }
  
  async updateDiscoveryQuestion(id: number, question: Partial<InsertDiscoveryQuestion>): Promise<DiscoveryQuestion | undefined> {
    const results = await db.update(schema.discoveryQuestions)
      .set({...question, updatedAt: new Date()})
      .where(eq(schema.discoveryQuestions.id, id))
      .returning();
    return results[0];
  }
  
  async deleteDiscoveryQuestion(id: number): Promise<void> {
    await db.delete(schema.discoveryQuestions).where(eq(schema.discoveryQuestions.id, id));
  }
  
  // Attachments (file uploads and voice notes)
  async getAttachments(projectId: number): Promise<Attachment[]> {
    return await db.select().from(schema.attachments)
      .where(eq(schema.attachments.projectId, projectId))
      .orderBy(desc(schema.attachments.createdAt));
  }
  
  async createAttachment(attachment: InsertAttachment): Promise<Attachment> {
    const results = await db.insert(schema.attachments).values(attachment).returning();
    return results[0];
  }
  
  async deleteAttachment(id: number): Promise<void> {
    await db.delete(schema.attachments).where(eq(schema.attachments.id, id));
  }
  
  // Shared Questionnaires (client collaboration)
  async getSharedQuestionnaire(projectId: number): Promise<SharedQuestionnaire | undefined> {
    const results = await db.select().from(schema.sharedQuestionnaires)
      .where(eq(schema.sharedQuestionnaires.projectId, projectId))
      .orderBy(desc(schema.sharedQuestionnaires.createdAt))
      .limit(1);
    return results[0];
  }
  
  async getSharedQuestionnaireByToken(token: string): Promise<SharedQuestionnaire | undefined> {
    const results = await db.select().from(schema.sharedQuestionnaires)
      .where(eq(schema.sharedQuestionnaires.shareToken, token));
    return results[0];
  }
  
  async createSharedQuestionnaire(questionnaire: InsertSharedQuestionnaire): Promise<SharedQuestionnaire> {
    const results = await db.insert(schema.sharedQuestionnaires).values(questionnaire).returning();
    return results[0];
  }
  
  async updateSharedQuestionnaire(id: number, questionnaire: Partial<InsertSharedQuestionnaire>): Promise<SharedQuestionnaire | undefined> {
    const results = await db.update(schema.sharedQuestionnaires)
      .set(questionnaire)
      .where(eq(schema.sharedQuestionnaires.id, id))
      .returning();
    return results[0];
  }
  
  // Question Responses (consultant and client answers)
  async getQuestionResponses(questionId: number): Promise<QuestionResponse[]> {
    return await db.select().from(schema.questionResponses)
      .where(eq(schema.questionResponses.questionId, questionId))
      .orderBy(schema.questionResponses.createdAt);
  }
  
  async getQuestionResponsesByQuestionnaire(sharedQuestionnaireId: number): Promise<QuestionResponse[]> {
    return await db.select().from(schema.questionResponses)
      .where(eq(schema.questionResponses.sharedQuestionnaireId, sharedQuestionnaireId))
      .orderBy(schema.questionResponses.createdAt);
  }
  
  async createQuestionResponse(response: InsertQuestionResponse): Promise<QuestionResponse> {
    const results = await db.insert(schema.questionResponses).values(response).returning();
    return results[0];
  }
  
  async updateQuestionResponse(id: number, response: Partial<InsertQuestionResponse>): Promise<QuestionResponse | undefined> {
    const results = await db.update(schema.questionResponses)
      .set({...response, updatedAt: new Date()})
      .where(eq(schema.questionResponses.id, id))
      .returning();
    return results[0];
  }
  
  // Job Themes (aggregated insights by "Jobs We Do")
  async getJobThemes(projectId: number): Promise<JobTheme[]> {
    return await db.select().from(schema.jobThemes)
      .where(eq(schema.jobThemes.projectId, projectId))
      .orderBy(desc(schema.jobThemes.compositeScore), desc(schema.jobThemes.evidenceCount));
  }
  
  async getJobTheme(id: number): Promise<JobTheme | undefined> {
    const results = await db.select().from(schema.jobThemes)
      .where(eq(schema.jobThemes.id, id));
    return results[0];
  }
  
  async createJobTheme(theme: InsertJobTheme): Promise<JobTheme> {
    const results = await db.insert(schema.jobThemes).values(theme).returning();
    return results[0];
  }
  
  async updateJobTheme(id: number, theme: Partial<InsertJobTheme>): Promise<JobTheme | undefined> {
    const results = await db.update(schema.jobThemes)
      .set({...theme, updatedAt: new Date()})
      .where(eq(schema.jobThemes.id, id))
      .returning();
    return results[0];
  }
  
  async deleteJobTheme(id: number): Promise<void> {
    await db.delete(schema.jobThemes).where(eq(schema.jobThemes.id, id));
  }
  
  // Job Theme KPIs (selected KPIs with baseline data)
  async getJobThemeKPIs(jobThemeId: number): Promise<JobThemeKPI[]> {
    return await db.select().from(schema.jobThemeKPIs)
      .where(eq(schema.jobThemeKPIs.jobThemeId, jobThemeId))
      .orderBy(desc(schema.jobThemeKPIs.isSelected));
  }
  
  async getJobThemeKPI(kpiId: number): Promise<JobThemeKPI | undefined> {
    const results = await db.select().from(schema.jobThemeKPIs)
      .where(eq(schema.jobThemeKPIs.id, kpiId));
    return results[0];
  }
  
  async createJobThemeKPI(kpi: InsertJobThemeKPI): Promise<JobThemeKPI> {
    const results = await db.insert(schema.jobThemeKPIs).values(kpi).returning();
    return results[0];
  }
  
  async updateJobThemeKPI(id: number, kpi: Partial<InsertJobThemeKPI>): Promise<JobThemeKPI | undefined> {
    const results = await db.update(schema.jobThemeKPIs)
      .set({...kpi, updatedAt: new Date()})
      .where(eq(schema.jobThemeKPIs.id, id))
      .returning();
    return results[0];
  }
  
  async deleteJobThemeKPI(id: number): Promise<void> {
    await db.delete(schema.jobThemeKPIs).where(eq(schema.jobThemeKPIs.id, id));
  }
  
  // Discovery Phase Transfer (finalization and lock)
  async getDiscoveryPhaseTransfer(projectId: number): Promise<DiscoveryPhaseTransfer | undefined> {
    const results = await db.select().from(schema.discoveryPhaseTransfers)
      .where(eq(schema.discoveryPhaseTransfers.projectId, projectId))
      .orderBy(desc(schema.discoveryPhaseTransfers.createdAt))
      .limit(1);
    return results[0];
  }
  
  async createDiscoveryPhaseTransfer(transfer: InsertDiscoveryPhaseTransfer): Promise<DiscoveryPhaseTransfer> {
    const results = await db.insert(schema.discoveryPhaseTransfers).values(transfer).returning();
    return results[0];
  }
  
  async updateDiscoveryPhaseTransfer(id: number, transfer: Partial<InsertDiscoveryPhaseTransfer>): Promise<DiscoveryPhaseTransfer | undefined> {
    const results = await db.update(schema.discoveryPhaseTransfers)
      .set({...transfer, updatedAt: new Date()})
      .where(eq(schema.discoveryPhaseTransfers.id, id))
      .returning();
    return results[0];
  }
  
  // ============================================================================
  // PHASE 1: VALUE REALIZATION FEATURES
  // ============================================================================
  
  // Business Reviews
  async getBusinessReviews(projectId: number): Promise<BusinessReview[]> {
    return await db.select().from(schema.businessReviews)
      .where(eq(schema.businessReviews.projectId, projectId))
      .orderBy(desc(schema.businessReviews.reviewDate));
  }
  
  async getBusinessReview(id: number): Promise<BusinessReview | undefined> {
    const results = await db.select().from(schema.businessReviews)
      .where(eq(schema.businessReviews.id, id));
    return results[0];
  }
  
  async createBusinessReview(review: InsertBusinessReview): Promise<BusinessReview> {
    const results = await db.insert(schema.businessReviews).values(review).returning();
    return results[0];
  }
  
  async updateBusinessReview(id: number, review: Partial<InsertBusinessReview>): Promise<BusinessReview | undefined> {
    const results = await db.update(schema.businessReviews)
      .set({...review, updatedAt: new Date()})
      .where(eq(schema.businessReviews.id, id))
      .returning();
    return results[0];
  }
  
  async deleteBusinessReview(id: number): Promise<void> {
    await db.delete(schema.businessReviews).where(eq(schema.businessReviews.id, id));
  }
  
  // KPI Actuals
  async getKPIActuals(jobThemeKPIId: number): Promise<KPIActual[]> {
    return await db.select().from(schema.kpiActuals)
      .where(eq(schema.kpiActuals.jobThemeKPIId, jobThemeKPIId))
      .orderBy(desc(schema.kpiActuals.actualDate));
  }
  
  async createKPIActual(actual: InsertKPIActual): Promise<KPIActual> {
    const results = await db.insert(schema.kpiActuals).values(actual).returning();
    return results[0];
  }
  
  async updateKPIActual(id: number, actual: Partial<InsertKPIActual>): Promise<KPIActual | undefined> {
    const results = await db.update(schema.kpiActuals)
      .set({...actual, updatedAt: new Date()})
      .where(eq(schema.kpiActuals.id, id))
      .returning();
    return results[0];
  }
  
  async deleteKPIActual(id: number): Promise<void> {
    await db.delete(schema.kpiActuals).where(eq(schema.kpiActuals.id, id));
  }
  
  // Success Stories
  async getSuccessStories(projectId: number): Promise<SuccessStory[]> {
    return await db.select().from(schema.successStories)
      .where(eq(schema.successStories.projectId, projectId))
      .orderBy(desc(schema.successStories.isHighlighted), desc(schema.successStories.createdAt));
  }
  
  async createSuccessStory(story: InsertSuccessStory): Promise<SuccessStory> {
    try {
      const results = await db.insert(schema.successStories).values(story).returning();
      return results[0];
    } catch (error: any) {
      // Gracefully handle unique constraint violations (duplicate project_id + url)
      // This ensures deduplication regardless of caller (route, admin tools, tests)
      if (error.code === '23505' || error.message?.includes('unique constraint') || error.message?.includes('success_stories_project_url_idx')) {
        console.log(`Storage: Skipping duplicate success story (unique constraint): ${story.title} | ${story.url}`);
        // Return existing story instead of throwing
        const existing = await db.select().from(schema.successStories)
          .where(and(
            eq(schema.successStories.projectId, story.projectId),
            eq(schema.successStories.url, story.url)
          ))
          .limit(1);
        return existing[0];
      }
      // Re-throw other errors
      throw error;
    }
  }
  
  async updateSuccessStory(id: number, story: Partial<InsertSuccessStory>): Promise<SuccessStory | undefined> {
    const results = await db.update(schema.successStories)
      .set(story)
      .where(eq(schema.successStories.id, id))
      .returning();
    return results[0];
  }
  
  async deleteSuccessStory(id: number): Promise<void> {
    await db.delete(schema.successStories).where(eq(schema.successStories.id, id));
  }
  
  // Success Story Library (global verified stories for AI narrative generation)
  async getSuccessStoryLibrary(filters?: { 
    industry?: string; 
    capabilityName?: string; 
    solutionArea?: string;
    approvalStatus?: string;
  }): Promise<schema.SuccessStoryLibraryItem[]> {
    let query = db.select().from(schema.successStoryLibrary);
    
    const conditions = [];
    if (filters?.industry) {
      conditions.push(eq(schema.successStoryLibrary.industry, filters.industry));
    }
    if (filters?.capabilityName) {
      conditions.push(eq(schema.successStoryLibrary.capabilityName, filters.capabilityName));
    }
    if (filters?.solutionArea) {
      conditions.push(eq(schema.successStoryLibrary.solutionArea, filters.solutionArea as any));
    }
    if (filters?.approvalStatus) {
      conditions.push(eq(schema.successStoryLibrary.approvalStatus, filters.approvalStatus as any));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(
      desc(schema.successStoryLibrary.isHighlighted),
      desc(schema.successStoryLibrary.createdAt)
    );
  }
  
  async getSuccessStoryLibraryItem(id: number): Promise<schema.SuccessStoryLibraryItem | undefined> {
    const results = await db.select().from(schema.successStoryLibrary)
      .where(eq(schema.successStoryLibrary.id, id));
    return results[0];
  }
  
  async createSuccessStoryLibraryItem(story: schema.InsertSuccessStoryLibrary): Promise<schema.SuccessStoryLibraryItem> {
    const results = await db.insert(schema.successStoryLibrary).values(story).returning();
    return results[0];
  }
  
  async updateSuccessStoryLibraryItem(id: number, story: Partial<schema.InsertSuccessStoryLibrary>): Promise<schema.SuccessStoryLibraryItem | undefined> {
    const results = await db.update(schema.successStoryLibrary)
      .set({ ...story, updatedAt: new Date() })
      .where(eq(schema.successStoryLibrary.id, id))
      .returning();
    return results[0];
  }
  
  async approveSuccessStoryLibraryItem(id: number, approvedBy: string): Promise<schema.SuccessStoryLibraryItem | undefined> {
    const results = await db.update(schema.successStoryLibrary)
      .set({ 
        approvalStatus: 'approved',
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(schema.successStoryLibrary.id, id))
      .returning();
    return results[0];
  }
  
  async deleteSuccessStoryLibraryItem(id: number): Promise<void> {
    await db.delete(schema.successStoryLibrary).where(eq(schema.successStoryLibrary.id, id));
  }
}

export const storage = new DbStorage();
