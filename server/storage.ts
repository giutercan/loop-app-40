import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import * as schema from "@shared/schema";
import type {
  Project, InsertProject,
  CompanyDataPoint, InsertCompanyDataPoint,
  Headline, InsertHeadline,
  DiscoveryNotes, InsertDiscoveryNotes,
  ValueHypothesis, InsertValueHypothesis,
  StrategicChallenge, InsertStrategicChallenge,
  Baseline, InsertBaseline,
  Kpi, InsertKpi,
  KpiReading, InsertKpiReading,
  Intervention, InsertIntervention,
  FinancialProjection, InsertFinancialProjection,
  EvidenceDocument, InsertEvidenceDocument,
  AnalyticsReview, InsertAnalyticsReview,
  ResponsibleAiChecklist, InsertResponsibleAiChecklist
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
  
  // Value Hypotheses
  getValueHypotheses(projectId: number): Promise<ValueHypothesis[]>;
  getValueHypothesis(id: number): Promise<ValueHypothesis | undefined>;
  createValueHypothesis(hypothesis: InsertValueHypothesis): Promise<ValueHypothesis>;
  updateValueHypothesis(id: number, hypothesis: Partial<InsertValueHypothesis>): Promise<ValueHypothesis | undefined>;
  
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
  deleteValueHypothesis(id: number): Promise<void>;
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
      .where(eq(schema.companyDataPoints.projectId, projectId));
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

  // Value Hypotheses
  async getValueHypotheses(projectId: number): Promise<ValueHypothesis[]> {
    return await db.select().from(schema.valueHypotheses)
      .where(eq(schema.valueHypotheses.projectId, projectId))
      .orderBy(desc(schema.valueHypotheses.createdAt));
  }

  async getValueHypothesis(id: number): Promise<ValueHypothesis | undefined> {
    const results = await db.select().from(schema.valueHypotheses)
      .where(eq(schema.valueHypotheses.id, id));
    return results[0];
  }

  async createValueHypothesis(hypothesis: InsertValueHypothesis): Promise<ValueHypothesis> {
    const results = await db.insert(schema.valueHypotheses).values(hypothesis).returning();
    return results[0];
  }

  async updateValueHypothesis(id: number, hypothesis: Partial<InsertValueHypothesis>): Promise<ValueHypothesis | undefined> {
    const results = await db.update(schema.valueHypotheses)
      .set(hypothesis)
      .where(eq(schema.valueHypotheses.id, id))
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

  async deleteValueHypothesis(id: number): Promise<void> {
    await db.delete(schema.valueHypotheses).where(eq(schema.valueHypotheses.id, id));
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
}

export const storage = new DbStorage();
