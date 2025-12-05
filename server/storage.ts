import { db } from "./db";
import { eq, desc, and, inArray } from "drizzle-orm";
import * as schema from "@shared/schema";

// Safe numeric parsing helper - returns null for invalid inputs
function parseNumeric(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value === 'number') {
    return isFinite(value) ? value : null;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}
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
  SuccessStory, InsertSuccessStory,
  AlignmentShareLink, InsertAlignmentShareLink,
  Milestone, InsertMilestone,
  ProjectValueMetrics, InsertProjectValueMetrics,
  StrategicPillar, InsertStrategicPillar,
  PillarObjective, InsertPillarObjective,
  PillarShareLink, InsertPillarShareLink,
  PillarOkrTheme, InsertPillarOkrTheme,
  DashboardLayout, InsertDashboardLayout,
  ValueJustification, InsertValueJustification,
  ValueJustificationMessage, InsertValueJustificationMessage,
  Account, InsertAccount,
  AccountUserRole, InsertAccountUserRole,
  AccountIssue, InsertAccountIssue,
  EvidenceArtefact, InsertEvidenceArtefact,
  AccountHub, LifecyclePhase,
  KpiCommitment, InsertKpiCommitment,
  HandoffPacket, InsertHandoffPacket
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
  getQuestionResponsesByProject(projectId: number): Promise<Array<QuestionResponse & { questionCapability: string | null }>>;
  createQuestionResponse(response: InsertQuestionResponse): Promise<QuestionResponse>;
  updateQuestionResponse(id: number, response: Partial<InsertQuestionResponse>): Promise<QuestionResponse | undefined>;
  
  // Job Themes (aggregated insights by "Jobs We Do")
  getJobThemes(projectId: number): Promise<JobTheme[]>;
  getJobTheme(id: number): Promise<JobTheme | undefined>;
  createJobTheme(theme: InsertJobTheme): Promise<JobTheme>;
  updateJobTheme(id: number, theme: Partial<InsertJobTheme>): Promise<JobTheme | undefined>;
  deleteJobTheme(id: number): Promise<void>;
  deleteAllJobThemesForProject(projectId: number): Promise<void>;
  
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
  
  // Alignment Share Links (customer collaboration on KPIs)
  getAlignmentShareLink(projectId: number): Promise<schema.AlignmentShareLink | undefined>;
  getAlignmentShareLinkByToken(token: string): Promise<schema.AlignmentShareLink | undefined>;
  createAlignmentShareLink(link: schema.InsertAlignmentShareLink): Promise<schema.AlignmentShareLink>;
  updateAlignmentShareLink(id: number, link: Partial<schema.InsertAlignmentShareLink>): Promise<schema.AlignmentShareLink | undefined>;
  deleteAlignmentShareLink(id: number): Promise<void>;
  
  // Milestones
  getMilestones(projectId: number): Promise<Milestone[]>;
  getMilestone(id: number): Promise<Milestone | undefined>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  updateMilestone(id: number, milestone: Partial<InsertMilestone>): Promise<Milestone | undefined>;
  deleteMilestone(id: number): Promise<void>;
  
  // Project Value Metrics
  getProjectValueMetrics(projectId: number): Promise<ProjectValueMetrics | undefined>;
  upsertProjectValueMetrics(metrics: InsertProjectValueMetrics): Promise<ProjectValueMetrics>;
  
  // Bulk fetches for efficient aggregation (eliminates N+1 queries)
  getAllJobThemeKPIsForProject(projectId: number): Promise<JobThemeKPI[]>;
  getAllKPIActualsForProject(projectId: number): Promise<KPIActual[]>;
  
  // Strategic Pillars (organizational priorities)
  getStrategicPillars(projectId: number): Promise<StrategicPillar[]>;
  getStrategicPillar(id: number): Promise<StrategicPillar | undefined>;
  createStrategicPillar(pillar: InsertStrategicPillar): Promise<StrategicPillar>;
  updateStrategicPillar(id: number, pillar: Partial<InsertStrategicPillar>): Promise<StrategicPillar | undefined>;
  deleteStrategicPillar(id: number): Promise<void>;
  
  // Pillar Objectives (business OKRs linked to pillars)
  getPillarObjectives(pillarId: number): Promise<PillarObjective[]>;
  getPillarObjective(id: number): Promise<PillarObjective | undefined>;
  createPillarObjective(objective: InsertPillarObjective): Promise<PillarObjective>;
  updatePillarObjective(id: number, objective: Partial<InsertPillarObjective>): Promise<PillarObjective | undefined>;
  deletePillarObjective(id: number): Promise<void>;
  getAllPillarObjectivesForProject(projectId: number): Promise<PillarObjective[]>;
  
  // Pillar OKR Theme Links (connect pillars to enterprise OKR themes)
  getPillarOkrThemes(pillarId: number): Promise<PillarOkrTheme[]>;
  getAllPillarOkrThemesForProject(projectId: number): Promise<PillarOkrTheme[]>;
  createPillarOkrTheme(link: InsertPillarOkrTheme): Promise<PillarOkrTheme>;
  deletePillarOkrTheme(id: number): Promise<void>;
  deletePillarOkrThemesByPillar(pillarId: number): Promise<void>;
  
  // Pillar Share Links (client collaboration on strategic pillars)
  getPillarShareLink(projectId: number): Promise<PillarShareLink | undefined>;
  getPillarShareLinkByToken(token: string): Promise<PillarShareLink | undefined>;
  createPillarShareLink(link: InsertPillarShareLink): Promise<PillarShareLink>;
  updatePillarShareLink(id: number, link: Partial<InsertPillarShareLink>): Promise<PillarShareLink | undefined>;
  deletePillarShareLink(id: number): Promise<void>;
  
  // Dashboard Layouts (user-configurable widget arrangements)
  getDashboardLayout(projectId: number): Promise<DashboardLayout | undefined>;
  upsertDashboardLayout(layout: InsertDashboardLayout): Promise<DashboardLayout>;
  
  // Value Justifications (AI-generated value narratives)
  getValueJustification(jobThemeId: number): Promise<ValueJustification | undefined>;
  getValueJustificationById(id: number): Promise<ValueJustification | undefined>;
  getAllValueJustificationsForProject(projectId: number): Promise<ValueJustification[]>;
  createValueJustification(justification: InsertValueJustification): Promise<ValueJustification>;
  updateValueJustification(id: number, justification: Partial<InsertValueJustification>): Promise<ValueJustification | undefined>;
  deleteValueJustification(id: number): Promise<void>;
  
  // Value Justification Messages (AI chat history)
  getValueJustificationMessages(valueJustificationId: number): Promise<ValueJustificationMessage[]>;
  createValueJustificationMessage(message: InsertValueJustificationMessage): Promise<ValueJustificationMessage>;
  deleteValueJustificationMessages(valueJustificationId: number): Promise<void>;
  
  // ============================================================================
  // CLIENT VALUE HUB - ACCOUNT-CENTRIC ENTITIES
  // ============================================================================
  
  // Accounts (primary organizing entity)
  getAccounts(): Promise<Account[]>;
  getAccount(id: number): Promise<Account | undefined>;
  getAccountByName(name: string): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: number, account: Partial<InsertAccount>): Promise<Account | undefined>;
  deleteAccount(id: number): Promise<void>;
  
  // Account User Roles (role-based access)
  getAccountUserRoles(accountId: number): Promise<AccountUserRole[]>;
  getAccountUserRolesByRole(accountId: number, role: string): Promise<AccountUserRole[]>;
  createAccountUserRole(role: InsertAccountUserRole): Promise<AccountUserRole>;
  deleteAccountUserRole(id: number): Promise<void>;
  
  // Account Issues / Opportunities
  getAccountIssues(accountId: number): Promise<AccountIssue[]>;
  getAccountIssue(id: number): Promise<AccountIssue | undefined>;
  createAccountIssue(issue: InsertAccountIssue): Promise<AccountIssue>;
  updateAccountIssue(id: number, issue: Partial<InsertAccountIssue>): Promise<AccountIssue | undefined>;
  deleteAccountIssue(id: number): Promise<void>;
  
  // Evidence Artefacts (for QBR support)
  getEvidenceArtefacts(accountId: number): Promise<EvidenceArtefact[]>;
  getEvidenceArtefact(id: number): Promise<EvidenceArtefact | undefined>;
  getEvidenceArtefactsByInitiative(initiativeId: number): Promise<EvidenceArtefact[]>;
  createEvidenceArtefact(artefact: InsertEvidenceArtefact): Promise<EvidenceArtefact>;
  updateEvidenceArtefact(id: number, artefact: Partial<InsertEvidenceArtefact>): Promise<EvidenceArtefact | undefined>;
  deleteEvidenceArtefact(id: number): Promise<void>;
  
  // Account-Initiative relationship helpers
  getInitiativesForAccount(accountId: number): Promise<Project[]>;
  getAccountForInitiative(projectId: number): Promise<Account | undefined>;
  
  // Account Hub - Aggregated data for Client Value Hub
  getAccountHub(accountId: number, phase?: LifecyclePhase): Promise<AccountHub | null>;
  
  // KPI Actuals by account
  getKPIActualsForAccount(accountId: number): Promise<KPIActual[]>;
  
  // Migration helper - auto-create accounts for existing projects
  migrateProjectsToAccounts(): Promise<void>;
  
  // ============================================================================
  // KPI COMMITMENTS & SALES-TO-CSM HANDOFF
  // ============================================================================
  
  // KPI Commitments (Sales-defined deliverables)
  getKpiCommitments(projectId: number): Promise<KpiCommitment[]>;
  getKpiCommitment(id: number): Promise<KpiCommitment | undefined>;
  getKpiCommitmentsByStatus(projectId: number, status: string): Promise<KpiCommitment[]>;
  createKpiCommitment(commitment: InsertKpiCommitment): Promise<KpiCommitment>;
  updateKpiCommitment(id: number, commitment: Partial<InsertKpiCommitment>): Promise<KpiCommitment | undefined>;
  deleteKpiCommitment(id: number): Promise<void>;
  
  // Handoff Packets (Sales to CSM transfer)
  getHandoffPackets(projectId: number): Promise<HandoffPacket[]>;
  getHandoffPacket(id: number): Promise<HandoffPacket | undefined>;
  getHandoffPacketsByAcceptanceState(projectId: number, state: string): Promise<HandoffPacket[]>;
  createHandoffPacket(packet: InsertHandoffPacket): Promise<HandoffPacket>;
  updateHandoffPacket(id: number, packet: Partial<InsertHandoffPacket>): Promise<HandoffPacket | undefined>;
  deleteHandoffPacket(id: number): Promise<void>;
  
  // ============================================================================
  // COMPETITIVE INTELLIGENCE
  // ============================================================================
  
  // Competitive Intelligence (AI-generated positioning per competitor)
  getCompetitiveIntelligence(projectId: number): Promise<schema.CompetitiveIntelligence[]>;
  getCompetitiveIntelligenceBySolutionArea(projectId: number, solutionArea: string): Promise<schema.CompetitiveIntelligence[]>;
  createCompetitiveIntelligence(intel: schema.InsertCompetitiveIntelligence): Promise<schema.CompetitiveIntelligence>;
  updateCompetitiveIntelligence(id: number, intel: Partial<schema.InsertCompetitiveIntelligence>): Promise<schema.CompetitiveIntelligence | undefined>;
  deleteCompetitiveIntelligence(id: number): Promise<void>;
  deleteAllCompetitiveIntelligenceForProject(projectId: number): Promise<void>;
  
  // Competitive Summary (high-level AI-generated competitive positioning)
  getCompetitiveSummary(projectId: number): Promise<schema.CompetitiveSummary | undefined>;
  upsertCompetitiveSummary(summary: schema.InsertCompetitiveSummary): Promise<schema.CompetitiveSummary>;
  deleteCompetitiveSummary(projectId: number): Promise<void>;
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
  
  async getQuestionResponsesByProject(projectId: number): Promise<Array<QuestionResponse & { questionCapability: string | null }>> {
    const results = await db.select({
      id: schema.questionResponses.id,
      questionId: schema.questionResponses.questionId,
      sharedQuestionnaireId: schema.questionResponses.sharedQuestionnaireId,
      respondentType: schema.questionResponses.respondentType,
      respondentName: schema.questionResponses.respondentName,
      answer: schema.questionResponses.answer,
      createdAt: schema.questionResponses.createdAt,
      updatedAt: schema.questionResponses.updatedAt,
      questionCapability: schema.discoveryQuestions.capabilityName,
    })
    .from(schema.questionResponses)
    .innerJoin(schema.discoveryQuestions, eq(schema.questionResponses.questionId, schema.discoveryQuestions.id))
    .where(eq(schema.discoveryQuestions.projectId, projectId))
    .orderBy(schema.questionResponses.createdAt);
    
    return results;
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
  
  async deleteAllJobThemesForProject(projectId: number): Promise<void> {
    // First delete all KPIs for all job themes in this project (cascade won't work for this)
    const themes = await this.getJobThemes(projectId);
    for (const theme of themes) {
      await db.delete(schema.jobThemeKPIs).where(eq(schema.jobThemeKPIs.jobThemeId, theme.id));
    }
    // Then delete all job themes
    await db.delete(schema.jobThemes).where(eq(schema.jobThemes.projectId, projectId));
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
  
  // Alignment Share Links (customer collaboration on KPIs)
  async getAlignmentShareLink(projectId: number): Promise<schema.AlignmentShareLink | undefined> {
    const results = await db.select().from(schema.alignmentShareLinks)
      .where(eq(schema.alignmentShareLinks.projectId, projectId))
      .orderBy(desc(schema.alignmentShareLinks.createdAt));
    return results[0];
  }
  
  async getAlignmentShareLinkByToken(token: string): Promise<schema.AlignmentShareLink | undefined> {
    const results = await db.select().from(schema.alignmentShareLinks)
      .where(eq(schema.alignmentShareLinks.shareToken, token));
    return results[0];
  }
  
  async createAlignmentShareLink(link: schema.InsertAlignmentShareLink): Promise<schema.AlignmentShareLink> {
    const results = await db.insert(schema.alignmentShareLinks).values(link).returning();
    return results[0];
  }
  
  async updateAlignmentShareLink(id: number, link: Partial<schema.InsertAlignmentShareLink>): Promise<schema.AlignmentShareLink | undefined> {
    const results = await db.update(schema.alignmentShareLinks)
      .set(link)
      .where(eq(schema.alignmentShareLinks.id, id))
      .returning();
    return results[0];
  }
  
  async deleteAlignmentShareLink(id: number): Promise<void> {
    await db.delete(schema.alignmentShareLinks).where(eq(schema.alignmentShareLinks.id, id));
  }
  
  // Milestones
  async getMilestones(projectId: number): Promise<Milestone[]> {
    return await db.select().from(schema.milestones)
      .where(eq(schema.milestones.projectId, projectId))
      .orderBy(desc(schema.milestones.milestoneDate));
  }
  
  async getMilestone(id: number): Promise<Milestone | undefined> {
    const results = await db.select().from(schema.milestones)
      .where(eq(schema.milestones.id, id));
    return results[0];
  }
  
  async createMilestone(milestone: InsertMilestone): Promise<Milestone> {
    const results = await db.insert(schema.milestones).values(milestone).returning();
    return results[0];
  }
  
  async updateMilestone(id: number, milestone: Partial<InsertMilestone>): Promise<Milestone | undefined> {
    const results = await db.update(schema.milestones)
      .set({...milestone, updatedAt: new Date()})
      .where(eq(schema.milestones.id, id))
      .returning();
    return results[0];
  }
  
  async deleteMilestone(id: number): Promise<void> {
    await db.delete(schema.milestones).where(eq(schema.milestones.id, id));
  }
  
  // Project Value Metrics
  async getProjectValueMetrics(projectId: number): Promise<ProjectValueMetrics | undefined> {
    const results = await db.select().from(schema.projectValueMetrics)
      .where(eq(schema.projectValueMetrics.projectId, projectId));
    return results[0];
  }
  
  async upsertProjectValueMetrics(metrics: InsertProjectValueMetrics): Promise<ProjectValueMetrics> {
    const existing = await this.getProjectValueMetrics(metrics.projectId);
    
    if (existing) {
      const results = await db.update(schema.projectValueMetrics)
        .set({...metrics, updatedAt: new Date(), lastCalculatedAt: new Date()})
        .where(eq(schema.projectValueMetrics.projectId, metrics.projectId))
        .returning();
      return results[0];
    } else {
      const results = await db.insert(schema.projectValueMetrics).values(metrics).returning();
      return results[0];
    }
  }
  
  // Bulk fetches for efficient aggregation
  async getAllJobThemeKPIsForProject(projectId: number): Promise<JobThemeKPI[]> {
    // Get all job themes for this project first
    const jobThemes = await db.select().from(schema.jobThemes)
      .where(eq(schema.jobThemes.projectId, projectId));
    
    if (jobThemes.length === 0) {
      return [];
    }
    
    const jobThemeIds = jobThemes.map(jt => jt.id);
    
    // Fetch all KPIs for these job themes in a single query
    return await db.select().from(schema.jobThemeKPIs)
      .where(inArray(schema.jobThemeKPIs.jobThemeId, jobThemeIds))
      .orderBy(schema.jobThemeKPIs.id);
  }
  
  async getAllKPIActualsForProject(projectId: number): Promise<KPIActual[]> {
    // Get all KPIs for this project
    const kpis = await this.getAllJobThemeKPIsForProject(projectId);
    
    if (kpis.length === 0) {
      return [];
    }
    
    const kpiIds = kpis.map(k => k.id);
    
    // Fetch all actuals for these KPIs in a single query
    return await db.select().from(schema.kpiActuals)
      .where(inArray(schema.kpiActuals.jobThemeKPIId, kpiIds))
      .orderBy(desc(schema.kpiActuals.actualDate));
  }
  
  // Strategic Pillars (organizational priorities)
  async getStrategicPillars(projectId: number): Promise<StrategicPillar[]> {
    return await db.select().from(schema.strategicPillars)
      .where(eq(schema.strategicPillars.projectId, projectId))
      .orderBy(schema.strategicPillars.priority, schema.strategicPillars.createdAt);
  }
  
  async getStrategicPillar(id: number): Promise<StrategicPillar | undefined> {
    const results = await db.select().from(schema.strategicPillars)
      .where(eq(schema.strategicPillars.id, id));
    return results[0];
  }
  
  async createStrategicPillar(pillar: InsertStrategicPillar): Promise<StrategicPillar> {
    const results = await db.insert(schema.strategicPillars).values(pillar).returning();
    return results[0];
  }
  
  async updateStrategicPillar(id: number, pillar: Partial<InsertStrategicPillar>): Promise<StrategicPillar | undefined> {
    const results = await db.update(schema.strategicPillars)
      .set({ ...pillar, updatedAt: new Date() })
      .where(eq(schema.strategicPillars.id, id))
      .returning();
    return results[0];
  }
  
  async deleteStrategicPillar(id: number): Promise<void> {
    await db.delete(schema.strategicPillars).where(eq(schema.strategicPillars.id, id));
  }
  
  // Pillar Objectives (business OKRs linked to pillars)
  async getPillarObjectives(pillarId: number): Promise<PillarObjective[]> {
    return await db.select().from(schema.pillarObjectives)
      .where(eq(schema.pillarObjectives.pillarId, pillarId))
      .orderBy(schema.pillarObjectives.createdAt);
  }
  
  async getPillarObjective(id: number): Promise<PillarObjective | undefined> {
    const results = await db.select().from(schema.pillarObjectives)
      .where(eq(schema.pillarObjectives.id, id));
    return results[0];
  }
  
  async createPillarObjective(objective: InsertPillarObjective): Promise<PillarObjective> {
    const results = await db.insert(schema.pillarObjectives).values(objective).returning();
    return results[0];
  }
  
  async updatePillarObjective(id: number, objective: Partial<InsertPillarObjective>): Promise<PillarObjective | undefined> {
    const results = await db.update(schema.pillarObjectives)
      .set({ ...objective, updatedAt: new Date() })
      .where(eq(schema.pillarObjectives.id, id))
      .returning();
    return results[0];
  }
  
  async deletePillarObjective(id: number): Promise<void> {
    await db.delete(schema.pillarObjectives).where(eq(schema.pillarObjectives.id, id));
  }
  
  async getAllPillarObjectivesForProject(projectId: number): Promise<PillarObjective[]> {
    const pillars = await this.getStrategicPillars(projectId);
    if (pillars.length === 0) return [];
    
    const pillarIds = pillars.map(p => p.id);
    return await db.select().from(schema.pillarObjectives)
      .where(inArray(schema.pillarObjectives.pillarId, pillarIds))
      .orderBy(schema.pillarObjectives.createdAt);
  }
  
  // Pillar OKR Theme Links (connect pillars to enterprise OKR themes)
  async getPillarOkrThemes(pillarId: number): Promise<PillarOkrTheme[]> {
    return await db.select().from(schema.pillarOkrThemes)
      .where(eq(schema.pillarOkrThemes.pillarId, pillarId))
      .orderBy(schema.pillarOkrThemes.createdAt);
  }
  
  async getAllPillarOkrThemesForProject(projectId: number): Promise<PillarOkrTheme[]> {
    const pillars = await this.getStrategicPillars(projectId);
    if (pillars.length === 0) return [];
    
    const pillarIds = pillars.map(p => p.id);
    return await db.select().from(schema.pillarOkrThemes)
      .where(inArray(schema.pillarOkrThemes.pillarId, pillarIds))
      .orderBy(schema.pillarOkrThemes.createdAt);
  }
  
  async createPillarOkrTheme(link: InsertPillarOkrTheme): Promise<PillarOkrTheme> {
    const results = await db.insert(schema.pillarOkrThemes).values(link).returning();
    return results[0];
  }
  
  async deletePillarOkrTheme(id: number): Promise<void> {
    await db.delete(schema.pillarOkrThemes).where(eq(schema.pillarOkrThemes.id, id));
  }
  
  async deletePillarOkrThemesByPillar(pillarId: number): Promise<void> {
    await db.delete(schema.pillarOkrThemes).where(eq(schema.pillarOkrThemes.pillarId, pillarId));
  }
  
  // Pillar Share Links (client collaboration on strategic pillars)
  async getPillarShareLink(projectId: number): Promise<PillarShareLink | undefined> {
    const results = await db.select().from(schema.pillarShareLinks)
      .where(eq(schema.pillarShareLinks.projectId, projectId))
      .orderBy(desc(schema.pillarShareLinks.createdAt));
    return results[0];
  }
  
  async getPillarShareLinkByToken(token: string): Promise<PillarShareLink | undefined> {
    const results = await db.select().from(schema.pillarShareLinks)
      .where(eq(schema.pillarShareLinks.token, token));
    return results[0];
  }
  
  async createPillarShareLink(link: InsertPillarShareLink): Promise<PillarShareLink> {
    const results = await db.insert(schema.pillarShareLinks).values(link).returning();
    return results[0];
  }
  
  async updatePillarShareLink(id: number, link: Partial<InsertPillarShareLink>): Promise<PillarShareLink | undefined> {
    const results = await db.update(schema.pillarShareLinks)
      .set(link)
      .where(eq(schema.pillarShareLinks.id, id))
      .returning();
    return results[0];
  }
  
  async deletePillarShareLink(id: number): Promise<void> {
    await db.delete(schema.pillarShareLinks).where(eq(schema.pillarShareLinks.id, id));
  }
  
  // Dashboard Layouts
  async getDashboardLayout(projectId: number): Promise<DashboardLayout | undefined> {
    const results = await db.select().from(schema.dashboardLayouts)
      .where(eq(schema.dashboardLayouts.projectId, projectId));
    return results[0];
  }
  
  async upsertDashboardLayout(layout: InsertDashboardLayout): Promise<DashboardLayout> {
    const existing = await this.getDashboardLayout(layout.projectId);
    if (existing) {
      const results = await db.update(schema.dashboardLayouts)
        .set({ ...layout, updatedAt: new Date() })
        .where(eq(schema.dashboardLayouts.id, existing.id))
        .returning();
      return results[0];
    } else {
      const results = await db.insert(schema.dashboardLayouts).values(layout).returning();
      return results[0];
    }
  }
  
  // Value Justifications (AI-generated value narratives)
  async getValueJustification(jobThemeId: number): Promise<ValueJustification | undefined> {
    const results = await db.select().from(schema.valueJustifications)
      .where(eq(schema.valueJustifications.jobThemeId, jobThemeId))
      .orderBy(desc(schema.valueJustifications.updatedAt));
    return results[0];
  }
  
  async getValueJustificationById(id: number): Promise<ValueJustification | undefined> {
    const results = await db.select().from(schema.valueJustifications)
      .where(eq(schema.valueJustifications.id, id));
    return results[0];
  }
  
  async getAllValueJustificationsForProject(projectId: number): Promise<ValueJustification[]> {
    return await db.select().from(schema.valueJustifications)
      .where(eq(schema.valueJustifications.projectId, projectId))
      .orderBy(desc(schema.valueJustifications.updatedAt));
  }
  
  async createValueJustification(justification: InsertValueJustification): Promise<ValueJustification> {
    const results = await db.insert(schema.valueJustifications).values(justification).returning();
    return results[0];
  }
  
  async updateValueJustification(id: number, justification: Partial<InsertValueJustification>): Promise<ValueJustification | undefined> {
    const results = await db.update(schema.valueJustifications)
      .set({ ...justification, updatedAt: new Date() })
      .where(eq(schema.valueJustifications.id, id))
      .returning();
    return results[0];
  }
  
  async deleteValueJustification(id: number): Promise<void> {
    await db.delete(schema.valueJustifications).where(eq(schema.valueJustifications.id, id));
  }
  
  // Value Justification Messages (AI chat history)
  async getValueJustificationMessages(valueJustificationId: number): Promise<ValueJustificationMessage[]> {
    return await db.select().from(schema.valueJustificationMessages)
      .where(eq(schema.valueJustificationMessages.valueJustificationId, valueJustificationId))
      .orderBy(schema.valueJustificationMessages.createdAt);
  }
  
  async createValueJustificationMessage(message: InsertValueJustificationMessage): Promise<ValueJustificationMessage> {
    const results = await db.insert(schema.valueJustificationMessages).values(message).returning();
    return results[0];
  }
  
  async deleteValueJustificationMessages(valueJustificationId: number): Promise<void> {
    await db.delete(schema.valueJustificationMessages)
      .where(eq(schema.valueJustificationMessages.valueJustificationId, valueJustificationId));
  }
  
  // ============================================================================
  // CLIENT VALUE HUB - ACCOUNT-CENTRIC ENTITIES
  // ============================================================================
  
  // Accounts (primary organizing entity)
  async getAccounts(): Promise<Account[]> {
    return await db.select().from(schema.accounts).orderBy(desc(schema.accounts.updatedAt));
  }
  
  async getAccount(id: number): Promise<Account | undefined> {
    const results = await db.select().from(schema.accounts).where(eq(schema.accounts.id, id));
    return results[0];
  }
  
  async getAccountByName(name: string): Promise<Account | undefined> {
    const results = await db.select().from(schema.accounts).where(eq(schema.accounts.name, name));
    return results[0];
  }
  
  async createAccount(account: InsertAccount): Promise<Account> {
    const results = await db.insert(schema.accounts).values(account).returning();
    return results[0];
  }
  
  async updateAccount(id: number, account: Partial<InsertAccount>): Promise<Account | undefined> {
    const results = await db.update(schema.accounts)
      .set({ ...account, updatedAt: new Date() })
      .where(eq(schema.accounts.id, id))
      .returning();
    return results[0];
  }
  
  async deleteAccount(id: number): Promise<void> {
    await db.delete(schema.accounts).where(eq(schema.accounts.id, id));
  }
  
  // Account User Roles (role-based access)
  async getAccountUserRoles(accountId: number): Promise<AccountUserRole[]> {
    return await db.select().from(schema.accountUserRoles)
      .where(eq(schema.accountUserRoles.accountId, accountId))
      .orderBy(schema.accountUserRoles.role);
  }
  
  async getAccountUserRolesByRole(accountId: number, role: string): Promise<AccountUserRole[]> {
    return await db.select().from(schema.accountUserRoles)
      .where(and(
        eq(schema.accountUserRoles.accountId, accountId),
        eq(schema.accountUserRoles.role, role as any)
      ));
  }
  
  async createAccountUserRole(role: InsertAccountUserRole): Promise<AccountUserRole> {
    const results = await db.insert(schema.accountUserRoles).values(role).returning();
    return results[0];
  }
  
  async deleteAccountUserRole(id: number): Promise<void> {
    await db.delete(schema.accountUserRoles).where(eq(schema.accountUserRoles.id, id));
  }
  
  // Account Issues / Opportunities
  async getAccountIssues(accountId: number): Promise<AccountIssue[]> {
    return await db.select().from(schema.accountIssues)
      .where(eq(schema.accountIssues.accountId, accountId))
      .orderBy(desc(schema.accountIssues.severity), desc(schema.accountIssues.createdAt));
  }
  
  async getAccountIssue(id: number): Promise<AccountIssue | undefined> {
    const results = await db.select().from(schema.accountIssues)
      .where(eq(schema.accountIssues.id, id));
    return results[0];
  }
  
  async createAccountIssue(issue: InsertAccountIssue): Promise<AccountIssue> {
    const results = await db.insert(schema.accountIssues).values(issue).returning();
    return results[0];
  }
  
  async updateAccountIssue(id: number, issue: Partial<InsertAccountIssue>): Promise<AccountIssue | undefined> {
    const results = await db.update(schema.accountIssues)
      .set({ ...issue, updatedAt: new Date() })
      .where(eq(schema.accountIssues.id, id))
      .returning();
    return results[0];
  }
  
  async deleteAccountIssue(id: number): Promise<void> {
    await db.delete(schema.accountIssues).where(eq(schema.accountIssues.id, id));
  }
  
  // Evidence Artefacts (for QBR support)
  async getEvidenceArtefacts(accountId: number): Promise<EvidenceArtefact[]> {
    return await db.select().from(schema.evidenceArtefacts)
      .where(eq(schema.evidenceArtefacts.accountId, accountId))
      .orderBy(desc(schema.evidenceArtefacts.createdAt));
  }
  
  async getEvidenceArtefact(id: number): Promise<EvidenceArtefact | undefined> {
    const results = await db.select().from(schema.evidenceArtefacts)
      .where(eq(schema.evidenceArtefacts.id, id));
    return results[0];
  }
  
  async getEvidenceArtefactsByInitiative(initiativeId: number): Promise<EvidenceArtefact[]> {
    return await db.select().from(schema.evidenceArtefacts)
      .where(eq(schema.evidenceArtefacts.initiativeId, initiativeId))
      .orderBy(desc(schema.evidenceArtefacts.createdAt));
  }
  
  async createEvidenceArtefact(artefact: InsertEvidenceArtefact): Promise<EvidenceArtefact> {
    const results = await db.insert(schema.evidenceArtefacts).values(artefact).returning();
    return results[0];
  }
  
  async updateEvidenceArtefact(id: number, artefact: Partial<InsertEvidenceArtefact>): Promise<EvidenceArtefact | undefined> {
    const results = await db.update(schema.evidenceArtefacts)
      .set({ ...artefact, updatedAt: new Date() })
      .where(eq(schema.evidenceArtefacts.id, id))
      .returning();
    return results[0];
  }
  
  async deleteEvidenceArtefact(id: number): Promise<void> {
    await db.delete(schema.evidenceArtefacts).where(eq(schema.evidenceArtefacts.id, id));
  }
  
  // Account-Initiative relationship helpers
  async getInitiativesForAccount(accountId: number): Promise<Project[]> {
    return await db.select().from(schema.projects)
      .where(eq(schema.projects.accountId, accountId))
      .orderBy(desc(schema.projects.updatedAt));
  }
  
  async getAccountForInitiative(projectId: number): Promise<Account | undefined> {
    const project = await this.getProject(projectId);
    if (!project?.accountId) return undefined;
    return await this.getAccount(project.accountId);
  }
  
  // Account Hub - Aggregated data for Client Value Hub (optimized with bulk fetching)
  async getAccountHub(accountId: number, phase?: LifecyclePhase): Promise<AccountHub | null> {
    const account = await this.getAccount(accountId);
    if (!account) return null;
    
    // Get all initiatives for this account
    let initiatives = await this.getInitiativesForAccount(accountId);
    
    // Filter by lifecycle phase if specified
    if (phase) {
      initiatives = initiatives.filter(p => p.lifecyclePhase === phase);
    }
    
    // Early return if no initiatives
    if (initiatives.length === 0) {
      const issues = await this.getAccountIssues(accountId);
      const teamRoles = await this.getAccountUserRoles(accountId);
      
      return {
        account: {
          id: account.id,
          name: account.name,
          industry: account.industry,
          tier: account.tier as "enterprise" | "strategic" | "growth" | null,
          companyLogoUrl: account.companyLogoUrl,
          healthScore: account.healthScore,
          strategyNotes: account.strategyNotes,
          okrSummary: account.okrSummary,
          accountOwner: account.accountOwner,
          clientSponsor: account.clientSponsor,
          contractStartDate: account.contractStartDate,
          contractEndDate: account.contractEndDate,
          annualContractValue: account.annualContractValue,
          totalValuePromised: account.totalValuePromised ?? 0,
          totalValueRealized: account.totalValueRealized ?? 0,
          lastQbrDate: account.lastQbrDate,
          nextQbrDate: account.nextQbrDate,
        },
        initiatives: [],
        kpis: [],
        issues: issues.map(i => ({
          id: i.id,
          title: i.title,
          type: i.type as "issue" | "risk" | "opportunity",
          severity: i.severity as "critical" | "high" | "medium" | "low",
          status: i.status as "open" | "in_progress" | "resolved" | "closed",
          solutionArea: i.solutionArea,
          estimatedValue: i.estimatedValue,
          owner: i.owner,
          dueDate: i.dueDate,
        })),
        teamRoles: teamRoles.map(r => ({
          id: r.id,
          userName: r.userName,
          userEmail: r.userEmail,
          role: r.role as "sales" | "consultant" | "delivery" | "csm" | "client_sponsor",
          isPrimary: r.isPrimary,
        })),
        headlineValue: {
          totalPromised: 0,
          totalRealized: 0,
          realizationRate: 0,
          initiativesCount: 0,
          initiativesActive: 0,
          kpisTotal: 0,
          kpisOnTrack: 0,
          kpisAtRisk: 0,
        },
      };
    }
    
    // Get issues and team roles in parallel
    const [issues, teamRoles] = await Promise.all([
      this.getAccountIssues(accountId),
      this.getAccountUserRoles(accountId),
    ]);
    
    // BULK FETCH: Get all job themes for all initiatives in one query
    const initiativeIds = initiatives.map(i => i.id);
    const allJobThemes = await db.select().from(schema.jobThemes)
      .where(inArray(schema.jobThemes.projectId, initiativeIds));
    
    // Early return if no job themes
    if (allJobThemes.length === 0) {
      const initiativeSummaries = initiatives.map(p => ({
        id: p.id,
        name: p.name,
        companyName: p.companyName,
        currentPhase: p.currentPhase as "discovery" | "alignment" | "realisation",
        lifecyclePhase: p.lifecyclePhase as LifecyclePhase | null,
        status: p.status as "active" | "completed" | "archived",
        ragStatus: p.ragStatus as "green" | "amber" | "red" | null,
        startDate: p.startDate,
        targetEndDate: p.targetEndDate,
        initiativeOwner: p.initiativeOwner,
        clientLead: p.clientLead,
        totalPromisedValue: null,
        totalRealizedValue: null,
        kpiCount: 0,
        kpisOnTrack: 0,
        kpisAtRisk: 0,
      }));
      
      return {
        account: {
          id: account.id,
          name: account.name,
          industry: account.industry,
          tier: account.tier as "enterprise" | "strategic" | "growth" | null,
          companyLogoUrl: account.companyLogoUrl,
          healthScore: account.healthScore,
          strategyNotes: account.strategyNotes,
          okrSummary: account.okrSummary,
          accountOwner: account.accountOwner,
          clientSponsor: account.clientSponsor,
          contractStartDate: account.contractStartDate,
          contractEndDate: account.contractEndDate,
          annualContractValue: account.annualContractValue,
          totalValuePromised: account.totalValuePromised ?? 0,
          totalValueRealized: account.totalValueRealized ?? 0,
          lastQbrDate: account.lastQbrDate,
          nextQbrDate: account.nextQbrDate,
        },
        initiatives: initiativeSummaries,
        kpis: [],
        issues: issues.map(i => ({
          id: i.id,
          title: i.title,
          type: i.type as "issue" | "risk" | "opportunity",
          severity: i.severity as "critical" | "high" | "medium" | "low",
          status: i.status as "open" | "in_progress" | "resolved" | "closed",
          solutionArea: i.solutionArea,
          estimatedValue: i.estimatedValue,
          owner: i.owner,
          dueDate: i.dueDate,
        })),
        teamRoles: teamRoles.map(r => ({
          id: r.id,
          userName: r.userName,
          userEmail: r.userEmail,
          role: r.role as "sales" | "consultant" | "delivery" | "csm" | "client_sponsor",
          isPrimary: r.isPrimary,
        })),
        headlineValue: {
          totalPromised: 0,
          totalRealized: 0,
          realizationRate: 0,
          initiativesCount: initiatives.length,
          initiativesActive: initiatives.filter(p => p.status === "active").length,
          kpisTotal: 0,
          kpisOnTrack: 0,
          kpisAtRisk: 0,
        },
      };
    }
    
    // Create mapping from jobTheme to initiative
    const jobThemeToInitiative = new Map<number, Project>();
    for (const theme of allJobThemes) {
      const initiative = initiatives.find(i => i.id === theme.projectId);
      if (initiative) {
        jobThemeToInitiative.set(theme.id, initiative);
      }
    }
    
    // BULK FETCH: Get all KPIs for all job themes in one query
    const jobThemeIds = allJobThemes.map(jt => jt.id);
    const allKpis = await db.select().from(schema.jobThemeKPIs)
      .where(inArray(schema.jobThemeKPIs.jobThemeId, jobThemeIds));
    
    // Filter to only selected KPIs
    const selectedKpis = allKpis.filter(kpi => kpi.isSelected);
    
    // BULK FETCH: Get all actuals for all KPIs in one query
    const kpiIds = selectedKpis.map(k => k.id);
    const allActuals = kpiIds.length > 0 
      ? await db.select().from(schema.kpiActuals)
          .where(inArray(schema.kpiActuals.jobThemeKPIId, kpiIds))
          .orderBy(desc(schema.kpiActuals.actualDate))
      : [];
    
    // Create mapping from KPI ID to its latest actual
    const latestActualsByKpi = new Map<number, typeof allActuals[0]>();
    for (const actual of allActuals) {
      if (!latestActualsByKpi.has(actual.jobThemeKPIId)) {
        latestActualsByKpi.set(actual.jobThemeKPIId, actual);
      }
    }
    
    // Aggregate KPIs across all initiatives
    const kpiSummaries: AccountHub["kpis"] = [];
    let totalPromised = 0;
    let totalRealized = 0;
    let kpisTotal = 0;
    let kpisOnTrack = 0;
    let kpisAtRisk = 0;
    let kpisNoData = 0;
    
    for (const kpi of selectedKpis) {
      const initiative = jobThemeToInitiative.get(kpi.jobThemeId);
      if (!initiative) continue;
      
      const latestActual = latestActualsByKpi.get(kpi.id);
      
      kpisTotal++;
      if (latestActual?.varianceDirection === "above" || latestActual?.varianceDirection === "on_track") {
        kpisOnTrack++;
      } else if (latestActual?.varianceDirection === "below") {
        kpisAtRisk++;
      } else {
        kpisNoData++;
      }
      
      // Calculate value with safe numeric parsing using parseNumeric helper
      let kpiPromisedValue: number | null = null;
      if (kpi.estimatedValuePerUnit && kpi.baselineValue && kpi.targetValue) {
        const baseline = parseNumeric(kpi.baselineValue);
        const target = parseNumeric(kpi.targetValue);
        if (baseline !== null && target !== null) {
          const improvement = target - baseline;
          kpiPromisedValue = kpi.estimatedValuePerUnit * Math.abs(improvement);
          totalPromised += kpiPromisedValue;
        }
      }
      
      if (latestActual?.valueImpactAmount) {
        totalRealized += latestActual.valueImpactAmount;
      }
      
      kpiSummaries.push({
        id: kpi.id,
        initiativeId: initiative.id,
        initiativeName: initiative.name,
        kpiName: kpi.kpiName,
        kpiType: kpi.kpiType as "primary" | "supporting",
        unit: kpi.unit,
        baselineValue: kpi.baselineValue,
        targetValue: kpi.targetValue,
        latestActualValue: latestActual?.actualValue || null,
        latestActualDate: latestActual?.actualDate || null,
        varianceDirection: latestActual?.varianceDirection as "above" | "on_track" | "below" | null || null,
        estimatedValuePerUnit: kpi.estimatedValuePerUnit,
        promisedValue: kpiPromisedValue,
        realizedValue: latestActual?.valueImpactAmount || null,
      });
    }
    
    // Pre-compute per-initiative KPI stats in single pass (O(n) instead of O(n²))
    const initiativeStats: Record<number, { 
      kpiCount: number; 
      kpisOnTrack: number; 
      kpisAtRisk: number;
      promisedValue: number;
      realizedValue: number;
    }> = {};
    
    for (const kpiSummary of kpiSummaries) {
      if (!initiativeStats[kpiSummary.initiativeId]) {
        initiativeStats[kpiSummary.initiativeId] = { 
          kpiCount: 0, 
          kpisOnTrack: 0, 
          kpisAtRisk: 0,
          promisedValue: 0,
          realizedValue: 0,
        };
      }
      const stats = initiativeStats[kpiSummary.initiativeId];
      stats.kpiCount++;
      
      if (kpiSummary.varianceDirection === "above" || kpiSummary.varianceDirection === "on_track") {
        stats.kpisOnTrack++;
      } else if (kpiSummary.varianceDirection === "below") {
        stats.kpisAtRisk++;
      }
      
      if (kpiSummary.promisedValue !== null && kpiSummary.promisedValue !== undefined) {
        stats.promisedValue += kpiSummary.promisedValue;
      }
      if (kpiSummary.realizedValue !== null && kpiSummary.realizedValue !== undefined) {
        stats.realizedValue += kpiSummary.realizedValue;
      }
    }
    
    // Build initiative summaries using pre-computed stats
    const initiativeSummaries: AccountHub["initiatives"] = initiatives.map(p => {
      const stats = initiativeStats[p.id] || { kpiCount: 0, kpisOnTrack: 0, kpisAtRisk: 0, promisedValue: 0, realizedValue: 0 };
      // Only null if no KPIs have value data; zero is a valid value
      const hasValueData = stats.kpiCount > 0;
      return {
        id: p.id,
        name: p.name,
        companyName: p.companyName,
        currentPhase: p.currentPhase as "discovery" | "alignment" | "realisation",
        lifecyclePhase: p.lifecyclePhase as LifecyclePhase | null,
        status: p.status as "active" | "completed" | "archived",
        ragStatus: p.ragStatus as "green" | "amber" | "red" | null,
        startDate: p.startDate,
        targetEndDate: p.targetEndDate,
        initiativeOwner: p.initiativeOwner,
        clientLead: p.clientLead,
        totalPromisedValue: hasValueData ? stats.promisedValue : null,
        totalRealizedValue: hasValueData ? stats.realizedValue : null,
        kpiCount: stats.kpiCount,
        kpisOnTrack: stats.kpisOnTrack,
        kpisAtRisk: stats.kpisAtRisk,
      };
    });
    
    return {
      account: {
        id: account.id,
        name: account.name,
        industry: account.industry,
        tier: account.tier as "enterprise" | "strategic" | "growth" | null,
        companyLogoUrl: account.companyLogoUrl,
        healthScore: account.healthScore,
        strategyNotes: account.strategyNotes,
        okrSummary: account.okrSummary,
        accountOwner: account.accountOwner,
        clientSponsor: account.clientSponsor,
        contractStartDate: account.contractStartDate,
        contractEndDate: account.contractEndDate,
        annualContractValue: account.annualContractValue,
        totalValuePromised: account.totalValuePromised ?? totalPromised,
        totalValueRealized: account.totalValueRealized ?? totalRealized,
        lastQbrDate: account.lastQbrDate,
        nextQbrDate: account.nextQbrDate,
      },
      initiatives: initiativeSummaries,
      kpis: kpiSummaries,
      issues: issues.map(i => ({
        id: i.id,
        title: i.title,
        type: i.type as "issue" | "risk" | "opportunity",
        severity: i.severity as "critical" | "high" | "medium" | "low",
        status: i.status as "open" | "in_progress" | "resolved" | "closed",
        solutionArea: i.solutionArea,
        estimatedValue: i.estimatedValue,
        owner: i.owner,
        dueDate: i.dueDate,
      })),
      teamRoles: teamRoles.map(r => ({
        id: r.id,
        userName: r.userName,
        userEmail: r.userEmail,
        role: r.role as "sales" | "consultant" | "delivery" | "csm" | "client_sponsor",
        isPrimary: r.isPrimary,
      })),
      headlineValue: {
        totalPromised: totalPromised,
        totalRealized: totalRealized,
        realizationRate: totalPromised > 0 ? Math.round((totalRealized / totalPromised) * 100) : 0,
        initiativesCount: initiatives.length,
        initiativesActive: initiatives.filter(p => p.status === "active").length,
        kpisTotal,
        kpisOnTrack,
        kpisAtRisk,
      },
    };
  }
  
  // KPI Actuals by account
  async getKPIActualsForAccount(accountId: number): Promise<KPIActual[]> {
    return await db.select().from(schema.kpiActuals)
      .where(eq(schema.kpiActuals.accountId, accountId))
      .orderBy(desc(schema.kpiActuals.actualDate));
  }
  
  // Migration helper - auto-create accounts for existing projects without accounts
  async migrateProjectsToAccounts(): Promise<void> {
    // Get all projects without an account
    const projectsWithoutAccount = await db.select().from(schema.projects)
      .where(eq(schema.projects.accountId, null as any));
    
    // Group projects by companyName
    const projectsByCompany: Record<string, Project[]> = {};
    for (const project of projectsWithoutAccount) {
      if (!projectsByCompany[project.companyName]) {
        projectsByCompany[project.companyName] = [];
      }
      projectsByCompany[project.companyName].push(project);
    }
    
    // Create an account for each unique company and link projects
    for (const companyName of Object.keys(projectsByCompany)) {
      const projects = projectsByCompany[companyName];
      
      // Check if an account already exists for this company
      let account = await this.getAccountByName(companyName);
      
      if (!account) {
        // Create new account
        account = await this.createAccount({
          name: companyName,
          industry: projects[0]?.sector || null,
          companyLogoUrl: projects[0]?.companyLogoUrl || null,
          status: "active",
        });
      }
      
      // Link all projects to this account
      for (const project of projects) {
        await this.updateProject(project.id, {
          accountId: account.id,
          // Also set lifecycle phase based on current phase
          lifecyclePhase: schema.phaseMapping[project.currentPhase] || "discover_qualify",
        });
      }
    }
  }
  
  // ============================================================================
  // KPI COMMITMENTS & SALES-TO-CSM HANDOFF
  // ============================================================================
  
  // KPI Commitments
  async getKpiCommitments(projectId: number): Promise<KpiCommitment[]> {
    return await db.select().from(schema.kpiCommitments)
      .where(eq(schema.kpiCommitments.projectId, projectId))
      .orderBy(desc(schema.kpiCommitments.createdAt));
  }
  
  async getKpiCommitment(id: number): Promise<KpiCommitment | undefined> {
    const results = await db.select().from(schema.kpiCommitments)
      .where(eq(schema.kpiCommitments.id, id));
    return results[0];
  }
  
  async getKpiCommitmentsByStatus(projectId: number, status: string): Promise<KpiCommitment[]> {
    return await db.select().from(schema.kpiCommitments)
      .where(and(
        eq(schema.kpiCommitments.projectId, projectId),
        eq(schema.kpiCommitments.status, status as "draft" | "proposed" | "client_confirmed" | "handed_off" | "in_delivery" | "completed" | "cancelled")
      ))
      .orderBy(desc(schema.kpiCommitments.createdAt));
  }
  
  async createKpiCommitment(commitment: InsertKpiCommitment): Promise<KpiCommitment> {
    const results = await db.insert(schema.kpiCommitments).values(commitment).returning();
    return results[0];
  }
  
  async updateKpiCommitment(id: number, commitment: Partial<InsertKpiCommitment>): Promise<KpiCommitment | undefined> {
    const results = await db.update(schema.kpiCommitments)
      .set({ ...commitment, updatedAt: new Date() })
      .where(eq(schema.kpiCommitments.id, id))
      .returning();
    return results[0];
  }
  
  async deleteKpiCommitment(id: number): Promise<void> {
    await db.delete(schema.kpiCommitments).where(eq(schema.kpiCommitments.id, id));
  }
  
  // Handoff Packets
  async getHandoffPackets(projectId: number): Promise<HandoffPacket[]> {
    return await db.select().from(schema.handoffPackets)
      .where(eq(schema.handoffPackets.projectId, projectId))
      .orderBy(desc(schema.handoffPackets.generatedAt));
  }
  
  async getHandoffPacket(id: number): Promise<HandoffPacket | undefined> {
    const results = await db.select().from(schema.handoffPackets)
      .where(eq(schema.handoffPackets.id, id));
    return results[0];
  }
  
  async getHandoffPacketsByAcceptanceState(projectId: number, state: string): Promise<HandoffPacket[]> {
    return await db.select().from(schema.handoffPackets)
      .where(and(
        eq(schema.handoffPackets.projectId, projectId),
        eq(schema.handoffPackets.acceptanceState, state as "pending" | "accepted" | "needs_clarification" | "rejected")
      ))
      .orderBy(desc(schema.handoffPackets.generatedAt));
  }
  
  async createHandoffPacket(packet: InsertHandoffPacket): Promise<HandoffPacket> {
    const results = await db.insert(schema.handoffPackets).values(packet).returning();
    return results[0];
  }
  
  async updateHandoffPacket(id: number, packet: Partial<InsertHandoffPacket>): Promise<HandoffPacket | undefined> {
    const results = await db.update(schema.handoffPackets)
      .set({ ...packet, updatedAt: new Date() })
      .where(eq(schema.handoffPackets.id, id))
      .returning();
    return results[0];
  }
  
  async deleteHandoffPacket(id: number): Promise<void> {
    await db.delete(schema.handoffPackets).where(eq(schema.handoffPackets.id, id));
  }
  
  // ============================================================================
  // COMPETITIVE INTELLIGENCE
  // ============================================================================
  
  // Competitive Intelligence (AI-generated positioning per competitor)
  async getCompetitiveIntelligence(projectId: number): Promise<schema.CompetitiveIntelligence[]> {
    return await db.select().from(schema.competitiveIntelligence)
      .where(eq(schema.competitiveIntelligence.projectId, projectId))
      .orderBy(schema.competitiveIntelligence.solutionArea, schema.competitiveIntelligence.competitorName);
  }
  
  async getCompetitiveIntelligenceBySolutionArea(projectId: number, solutionArea: string): Promise<schema.CompetitiveIntelligence[]> {
    return await db.select().from(schema.competitiveIntelligence)
      .where(and(
        eq(schema.competitiveIntelligence.projectId, projectId),
        eq(schema.competitiveIntelligence.solutionArea, solutionArea as "ASSESS" | "DEVELOP" | "TRANSFORM" | "REWARD" | "COMMERCIAL" | "ANALYTICS")
      ))
      .orderBy(schema.competitiveIntelligence.competitorName);
  }
  
  async createCompetitiveIntelligence(intel: schema.InsertCompetitiveIntelligence): Promise<schema.CompetitiveIntelligence> {
    const results = await db.insert(schema.competitiveIntelligence).values(intel).returning();
    return results[0];
  }
  
  async updateCompetitiveIntelligence(id: number, intel: Partial<schema.InsertCompetitiveIntelligence>): Promise<schema.CompetitiveIntelligence | undefined> {
    const results = await db.update(schema.competitiveIntelligence)
      .set({ ...intel, updatedAt: new Date() })
      .where(eq(schema.competitiveIntelligence.id, id))
      .returning();
    return results[0];
  }
  
  async deleteCompetitiveIntelligence(id: number): Promise<void> {
    await db.delete(schema.competitiveIntelligence).where(eq(schema.competitiveIntelligence.id, id));
  }
  
  async deleteAllCompetitiveIntelligenceForProject(projectId: number): Promise<void> {
    await db.delete(schema.competitiveIntelligence).where(eq(schema.competitiveIntelligence.projectId, projectId));
  }
  
  // Competitive Summary (high-level AI-generated competitive positioning)
  async getCompetitiveSummary(projectId: number): Promise<schema.CompetitiveSummary | undefined> {
    const results = await db.select().from(schema.competitiveSummary)
      .where(eq(schema.competitiveSummary.projectId, projectId));
    return results[0];
  }
  
  async upsertCompetitiveSummary(summary: schema.InsertCompetitiveSummary): Promise<schema.CompetitiveSummary> {
    const existing = await this.getCompetitiveSummary(summary.projectId);
    if (existing) {
      const results = await db.update(schema.competitiveSummary)
        .set({ ...summary, updatedAt: new Date() })
        .where(eq(schema.competitiveSummary.projectId, summary.projectId))
        .returning();
      return results[0];
    } else {
      const results = await db.insert(schema.competitiveSummary).values(summary).returning();
      return results[0];
    }
  }
  
  async deleteCompetitiveSummary(projectId: number): Promise<void> {
    await db.delete(schema.competitiveSummary).where(eq(schema.competitiveSummary.projectId, projectId));
  }
}

export const storage = new DbStorage();
