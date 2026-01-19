import type { Express } from "express";
import { storage } from "./storage";
import { researchCompany, followUpResearch, generateDiscoveryQuestions, enrichFromNotes, generateSuccessStoryRecommendations, generateBusinessReviewAgenda, generateIndustryBenchmark, generateValueCaseRecommendations, generateKPIRecommendations, generateKPIRationale, generateStrategicPillars, generateStorySuggestion, generateDiscoveryKpiSuggestions, enrichContactWithAI, openai, generateCompetitiveIntelligence, generateKPIValueCaseRecommendations, generateLiveIntelligence, generateEvidencePackRecommendations, generateItemCoaching } from "./ai";
import { z } from "zod";
import crypto from "crypto";
import { OUTCOME_JOURNEY_TEMPLATES, type SolutionPatternId } from "@shared/value-frameworks";

// Track in-flight success story generations per project (prevents concurrent requests)
// NOTE: This in-memory Set is sufficient for single-instance Replit deployment.
// If scaling to multiple processes/workers, migrate to storage-level locking with
// a database flag or distributed lock service (e.g., Redis).
const generationLocks = new Set<number>();
import { 
  insertProjectSchema,
  insertCompanyDataPointSchema,
  insertHeadlineSchema,
  insertDiscoveryNotesSchema,
  insertValueCaseSchema,
  insertStrategicChallengeSchema,
  insertBaselineSchema,
  insertKpiSchema,
  insertKpiReadingSchema,
  insertInterventionSchema,
  insertFinancialProjectionSchema,
  insertEvidenceDocumentSchema,
  insertAnalyticsReviewSchema,
  insertResponsibleAiChecklistSchema,
  insertDiscoveryQuestionSchema,
  updateDiscoveryQuestionSchema,
  insertAttachmentSchema,
  prioritizeJobsRequestSchema,
  updateJobThemeKPIRequestSchema,
  finalizeDiscoveryRequestSchema,
  insertBusinessReviewSchema,
  insertKPIActualSchema,
  insertSuccessStorySchema,
  insertSuccessStoryLibrarySchema,
  insertStrategicPillarSchema,
  insertPillarObjectiveSchema,
  insertPillarShareLinkSchema,
  insertAccountSchema,
  insertAccountUserRoleSchema,
  insertAccountIssueSchema,
  insertEvidenceArtefactSchema,
  insertKpiCommitmentSchema,
  insertHandoffPacketSchema,
  lifecyclePhases,
  type LifecyclePhase,
  insertEvidencePackSchema,
  insertEvidencePackItemSchema,
  insertEvidencePackCommentSchema,
  insertEvidencePackAuditLogSchema
} from "@shared/schema";

// Helper function for robust HTML/script sanitization
function sanitizeInput(input: string): string {
  let sanitized = input;
  
  // Remove script tags and their entire content (handle nested brackets/quotes)
  // Use a loop to handle multiple occurrences and nested cases
  let prevLength;
  do {
    prevLength = sanitized.length;
    sanitized = sanitized.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  } while (sanitized.length !== prevLength);
  
  // Remove style tags and their entire content
  do {
    prevLength = sanitized.length;
    sanitized = sanitized.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
  } while (sanitized.length !== prevLength);
  
  // Remove all remaining HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, "");
  
  // Remove any remaining script-like patterns
  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=/gi, ""); // Remove event handlers like onclick=
  
  return sanitized.trim();
}

// Helper function for defensive numeric parsing (handles blank/non-numeric strings)
// Returns null for invalid inputs so callers can handle missing data appropriately
function parseNumeric(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value === 'number') {
    return isFinite(value) ? value : null;
  }
  const trimmed = String(value).trim();
  if (trimmed === '' || trimmed === 'N/A' || trimmed === 'n/a') {
    return null;
  }
  const parsed = parseFloat(trimmed);
  return isFinite(parsed) ? parsed : null;
}

// Safe version that returns 0 for invalid inputs (use when default value is acceptable)
function safeParseFloat(value: string | number | null | undefined): number {
  const parsed = parseNumeric(value);
  return parsed !== null ? parsed : 0;
}

// Helper function to gather enriched context from artifacts and Green Sheet
// This provides a unified knowledge base for AI coaching and recommendations
// Note: Only AI-extracted insights are included (no raw content) to respect token limits and privacy
interface EnrichedContext {
  artifactInsights: {
    summary: string;
    keyInsights: string[];
    actionItems: string[];
    risks: string[];
    stakeholderMentions: string[];
  };
  greenSheet: {
    meetingContact: {
      name: string;
      title: string;
      role: string | null;
      influence: string | null;
      knownConcerns: string;
      decisionCriteria: string;
    } | null;
    callPlanner: {
      objective: string;
      desiredOutcome: string;
      bestActionCommitment: string;
    } | null;
  };
  combinedContext: string; // Formatted text for AI prompts (max ~2000 chars)
}

// Truncate text to max length with ellipsis
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

async function getEnrichedDiscoveryContext(
  projectId: number,
  storageRef: typeof storage
): Promise<EnrichedContext> {
  // Fetch artifacts and project in parallel
  const [artifacts, project] = await Promise.all([
    storageRef.getInteractionArtifacts(projectId),
    storageRef.getProject(projectId)
  ]);

  // Extract insights from artifacts - both AI-processed and manually added notes
  const analyzedArtifacts = artifacts.filter(a => a.aiProcessingStatus === 'completed');
  const allInsights: string[] = [];
  const allActionItems: string[] = [];
  const allRisks: string[] = [];
  const allStakeholders: string[] = [];
  const allSummaries: string[] = [];
  const consultantNotes: string[] = [];

  for (const artifact of analyzedArtifacts) {
    // Include AI-generated summaries
    if (artifact.aiSummary) {
      allSummaries.push(truncateText(artifact.aiSummary, 300));
    }
    
    // Include consultant's manually added notes on artifacts
    if (artifact.freeformNotes && artifact.freeformNotes.trim()) {
      consultantNotes.push(truncateText(artifact.freeformNotes, 200));
    }
    
    if (artifact.aiExtractedInsights) {
      const insights = artifact.aiExtractedInsights as any;
      if (insights.insights?.length) {
        allInsights.push(...insights.insights.slice(0, 5).map((i: string) => truncateText(i, 150)));
      }
      if (insights.actionItems?.length) {
        allActionItems.push(...insights.actionItems.slice(0, 3).map((i: string) => truncateText(i, 100)));
      }
      if (insights.risks?.length) {
        allRisks.push(...insights.risks.slice(0, 3).map((r: string) => truncateText(r, 100)));
      }
      if (insights.stakeholderMentions?.length) {
        // Only include role/title, not personal details
        allStakeholders.push(...insights.stakeholderMentions.slice(0, 5));
      }
    }
  }
  
  // Also include artifacts that have notes but aren't AI-processed yet
  const artifactsWithNotes = artifacts.filter(a => 
    a.aiProcessingStatus !== 'completed' && a.freeformNotes && a.freeformNotes.trim()
  );
  for (const artifact of artifactsWithNotes.slice(0, 3)) {
    consultantNotes.push(truncateText(artifact.freeformNotes!, 200));
  }

  // Extract Green Sheet data (business context only, no PII)
  const greenSheetData = project?.greenSheetData as any;
  const meetingContact = greenSheetData?.meetingContact || null;
  const callPlanner = greenSheetData?.callPlanner || null;

  // Build combined context string for AI prompts - keep compact (~1500 chars max)
  // NOTE: Excludes all PII (names, titles, personal details) - only business context
  const contextParts: string[] = [];

  // Include consultant's manually added notes first (most valuable context)
  if (consultantNotes.length > 0) {
    contextParts.push(`Consultant Notes: ${consultantNotes.slice(0, 3).join(' | ')}`);
  }

  if (allSummaries.length > 0) {
    contextParts.push(`Meeting Insights: ${allSummaries.slice(0, 2).join(' | ')}`);
  }

  if (allInsights.length > 0) {
    contextParts.push(`Key Findings: ${allInsights.slice(0, 4).join('; ')}`);
  }

  if (allRisks.length > 0) {
    contextParts.push(`Concerns: ${allRisks.slice(0, 2).join('; ')}`);
  }

  // Include only business-relevant Green Sheet info (NO names, titles, or PII)
  if (meetingContact?.knownConcerns) {
    contextParts.push(`Stakeholder Concerns: ${truncateText(meetingContact.knownConcerns, 150)}`);
  }
  if (meetingContact?.decisionCriteria) {
    contextParts.push(`Decision Criteria: ${truncateText(meetingContact.decisionCriteria, 150)}`);
  }

  if (callPlanner?.objective) {
    contextParts.push(`Call Objective: ${truncateText(callPlanner.objective, 120)}`);
  }
  if (callPlanner?.desiredOutcome) {
    contextParts.push(`Desired Outcome: ${truncateText(callPlanner.desiredOutcome, 120)}`);
  }

  // Final context limited to ~1500 chars, empty string if no context
  const rawContext = contextParts.join('. ');
  const combinedContext = rawContext.length > 0 
    ? ` Additional discovery context: ${truncateText(rawContext, 1400)}`
    : '';

  return {
    artifactInsights: {
      summary: allSummaries.join('\n\n'),
      keyInsights: allInsights,
      actionItems: allActionItems,
      risks: allRisks,
      stakeholderMentions: [...new Set(allStakeholders)]
    },
    greenSheet: {
      meetingContact: meetingContact ? {
        name: meetingContact.name,
        title: meetingContact.title,
        role: meetingContact.role,
        influence: meetingContact.influence,
        knownConcerns: meetingContact.knownConcerns,
        decisionCriteria: meetingContact.decisionCriteria
      } : null,
      callPlanner: callPlanner ? {
        objective: callPlanner.objective,
        desiredOutcome: callPlanner.desiredOutcome,
        bestActionCommitment: callPlanner.bestActionCommitment
      } : null
    },
    combinedContext
  };
}

// Helper function to calculate project value metrics
async function calculateProjectValueMetrics(projectId: number, storage: typeof import("./storage").storage) {
  // Bulk fetch all data in parallel with minimal queries
  const [jobThemes, allKPIs, allActuals] = await Promise.all([
    storage.getJobThemes(projectId),
    storage.getAllJobThemeKPIsForProject(projectId),
    storage.getAllKPIActualsForProject(projectId)
  ]);
  
  let totalValuePromised = 0;
  let totalValueRealized = 0;
  let kpisOnTrack = 0;
  let kpisAtRisk = 0;
  let kpisOffTrack = 0;
  let kpisNoData = 0;
  let totalConfidence = 0;
  let kpiCount = 0;
  
  const valuePromisedBreakdown: Record<string, number> = {};
  const valueRealizedBreakdown: Record<string, number> = {};
  
  // Create a map of KPI ID to its actuals for efficient lookup (properly typed as array of individual actuals)
  type MetricsKPIActualRecord = (typeof allActuals)[number];
  const actualsMap = new Map<number, MetricsKPIActualRecord[]>();
  for (const actual of allActuals) {
    if (!actualsMap.has(actual.jobThemeKPIId)) {
      actualsMap.set(actual.jobThemeKPIId, []);
    }
    actualsMap.get(actual.jobThemeKPIId)!.push(actual);
  }
  
  // Sort each KPI's actuals by date descending (newest first) for correct latest actual selection
  actualsMap.forEach((actuals, kpiId) => {
    actuals.sort((a, b) => new Date(b.actualDate).getTime() - new Date(a.actualDate).getTime());
  });
  
  // Track KPIs with complete value configuration separately
  let kpisWithValueConfig = 0;
  let kpisFinancialNoData = 0;
  let kpisNoActuals = 0;
  
  // Process each KPI with its actuals
  allKPIs.forEach((kpi) => {
    const actuals = actualsMap.get(kpi.id) || [];
    
    // Parse numeric values using parseNumeric to detect missing/invalid data
    const baselineParsed = parseNumeric(kpi.baselineValue);
    const targetParsed = parseNumeric(kpi.targetValue);
    const valuePerUnitParsed = parseNumeric(kpi.estimatedValuePerUnit);
    
    // Skip KPI if essential metrics are missing (baseline or target)
    if (baselineParsed === null || targetParsed === null) {
      kpisNoData++;
      return;
    }
    
    const baseline = baselineParsed;
    const target = targetParsed;
    const targetDelta = target - baseline;
    
    // Check if this KPI has complete value configuration
    const hasValueConfig = valuePerUnitParsed !== null;
    
    // Only count KPIs with complete value configuration for health metrics
    // KPIs without value config are treated as financial-no-data and excluded from all aggregates
    if (!hasValueConfig) {
      // Track as missing value config but don't include in health scoring
      kpisFinancialNoData++;
      return;
    }
    
    const valuePerUnit = valuePerUnitParsed;
    
    // Track configured KPIs and promised value (regardless of actuals)
    // This reflects pipeline value from all configured KPIs
    kpiCount++;
    const kpiValuePromised = Math.abs(targetDelta) * valuePerUnit;
    totalValuePromised += kpiValuePromised;
    valuePromisedBreakdown[kpi.jobThemeId] = (valuePromisedBreakdown[kpi.jobThemeId] || 0) + kpiValuePromised;
    
    // Process actuals - health scoring requires valid actuals
    if (actuals.length === 0) {
      // Has value config but no actuals - track separately, exclude from health scoring
      kpisNoActuals++;
      return;
    }
    
    // Find the most recent valid actual (fall back if latest is invalid)
    let validActual = null;
    for (const actual of actuals) {
      const parsed = parseNumeric(actual.actualValue);
      if (parsed !== null) {
        validActual = { actual, value: parsed };
        break;
      }
    }
    
    // Skip health scoring if no valid actual found
    if (validActual === null) {
      // Has value config but all actuals are invalid - track as no valid data
      kpisNoActuals++;
      return;
    }
    
    const latestActual = validActual.actual;
    const currentParsed = validActual.value;
    
    // Only now include this KPI in health scoring (has value config AND valid actuals)
    kpisWithValueConfig++;
    
    const current = currentParsed;
    const currentDelta = current - baseline;
    const progressPercent = targetDelta !== 0 ? (currentDelta / targetDelta) * 100 : 0;
    
    // Categorize KPI status (only reaches here if hasValueConfig is true AND has valid actuals)
    if (progressPercent >= 80) {
      kpisOnTrack++;
    } else if (progressPercent >= 50) {
      kpisAtRisk++;
    } else {
      kpisOffTrack++;
    }
    
    // Calculate value realized for this KPI (only if value configuration exists)
    const valueImpactParsed = parseNumeric(latestActual.valueImpactAmount);
    if (valueImpactParsed !== null) {
      // Use explicit value impact if provided
      totalValueRealized += valueImpactParsed;
      valueRealizedBreakdown[kpi.jobThemeId] = (valueRealizedBreakdown[kpi.jobThemeId] || 0) + valueImpactParsed;
    } else if (hasValueConfig && valuePerUnitParsed > 0) {
      // Calculate based on progress and value per unit
      const kpiValueRealized = Math.abs(currentDelta) * valuePerUnitParsed;
      totalValueRealized += kpiValueRealized;
      valueRealizedBreakdown[kpi.jobThemeId] = (valueRealizedBreakdown[kpi.jobThemeId] || 0) + kpiValueRealized;
    }
    
    // Track confidence
    if (latestActual.confidenceScore) {
      totalConfidence += latestActual.confidenceScore;
    }
  });
  
  // Use kpisWithValueConfig as denominator (excludes KPIs without financial configuration)
  const overallProgressPercent = kpisWithValueConfig > 0 
    ? Math.round(((kpisOnTrack + kpisAtRisk * 0.5) / kpisWithValueConfig) * 100)
    : 0;
  
  const confidenceLevel = kpisWithValueConfig > 0 ? Math.round(totalConfidence / kpisWithValueConfig) : 0;
  
  // Get business review info
  const reviews = await storage.getBusinessReviews(projectId);
  const lastReview = reviews.length > 0 ? reviews[0] : null;
  const clientSentimentAvg = reviews.length > 0 
    ? Math.round(reviews.reduce((sum, r) => sum + (r.clientSentiment || 0), 0) / reviews.length)
    : undefined;
  
  // Upsert metrics with numeric values
  const metrics = await storage.upsertProjectValueMetrics({
    projectId,
    totalValuePromised,
    totalValueRealized,
    valuePromisedBreakdown,
    valueRealizedBreakdown,
    overallProgressPercent,
    kpisOnTrack,
    kpisAtRisk,
    kpisOffTrack,
    kpisNoData,
    confidenceLevel,
    lastReviewDate: lastReview?.reviewDate,
    nextReviewDate: lastReview?.nextReviewDate,
    clientSentimentAvg,
    calculationNotes: `Value promised from ${kpiCount} configured KPIs. Health score based on ${kpisWithValueConfig} with valid actuals. Excluded from health: ${kpisNoActuals} awaiting measurements. Excluded from all: ${kpisFinancialNoData} missing value-per-unit, ${kpisNoData} missing baseline/target. Job themes: ${jobThemes.length}.`
  });
  
  return metrics;
}

// Helper function to calculate KPI status breakdown
async function calculateKPIStatus(projectId: number, storage: typeof import("./storage").storage) {
  const jobThemes = await storage.getJobThemes(projectId);
  
  const kpiStatuses: Array<{
    kpiId: number;
    kpiName: string;
    jobThemeName: string;
    baseline: string;
    target: string;
    current: string | null;
    progressPercent: number;
    status: 'on-track' | 'at-risk' | 'off-track' | 'no-data';
    lastUpdated: Date | null;
    confidenceScore: number | null;
    valueImpact: string | null;
  }> = [];
  
  for (const jobTheme of jobThemes) {
    const kpis = await storage.getJobThemeKPIs(jobTheme.id);
    
    for (const kpi of kpis) {
      const actuals = await storage.getKPIActuals(kpi.id);
      
      if (actuals.length === 0) {
        kpiStatuses.push({
          kpiId: kpi.id,
          kpiName: kpi.kpiName,
          jobThemeName: jobTheme.jobName,
          baseline: kpi.baselineValue || 'N/A',
          target: kpi.targetValue || 'N/A',
          current: null,
          progressPercent: 0,
          status: 'no-data',
          lastUpdated: null,
          confidenceScore: null,
          valueImpact: null
        });
        continue;
      }
      
      const latestActual = actuals[0];
      const baseline = parseFloat(kpi.baselineValue || '0');
      const target = parseFloat(kpi.targetValue || '0');
      const current = parseFloat(latestActual.actualValue);
      
      const targetDelta = target - baseline;
      const currentDelta = current - baseline;
      const progressPercent = targetDelta !== 0 ? (currentDelta / targetDelta) * 100 : 0;
      
      let status: 'on-track' | 'at-risk' | 'off-track' | 'no-data';
      if (progressPercent >= 80) {
        status = 'on-track';
      } else if (progressPercent >= 50) {
        status = 'at-risk';
      } else {
        status = 'off-track';
      }
      
      kpiStatuses.push({
        kpiId: kpi.id,
        kpiName: kpi.kpiName,
        jobThemeName: jobTheme.jobName,
        baseline: kpi.baselineValue || 'N/A',
        target: kpi.targetValue || 'N/A',
        current: latestActual.actualValue,
        progressPercent: Math.round(progressPercent),
        status,
        lastUpdated: latestActual.actualDate,
        confidenceScore: latestActual.confidenceScore,
        valueImpact: latestActual.valueImpact
      });
    }
  }
  
  return kpiStatuses;
}

export function registerRoutes(app: Express) {
  // Projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Project progress checklist for phase tracking
  app.get("/api/projects/:id/progress", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Fetch all required data in parallel
      const [strategicPillars, allKPIs, valueCases, jobThemes] = await Promise.all([
        storage.getStrategicPillars(projectId),
        storage.getAllJobThemeKPIsForProject(projectId),
        storage.getValueCases(projectId),
        storage.getJobThemes(projectId),
      ]);

      // Calculate Discovery milestones
      const hasCompanyResearch = !!(project.companyName && project.companyName.trim() !== "");
      const hasStrategicPillars = strategicPillars.length > 0;
      const selectedKPIs = allKPIs.filter(k => k.isSelected);
      const hasMinimumKPIs = selectedKPIs.length >= 3;
      const hasPrioritizedJobs = jobThemes.some(j => j.priorityRank !== null && j.priorityRank > 0);

      // Calculate Alignment milestones
      const kpisWithBaselines = selectedKPIs.filter(k => k.baselineValue && k.baselineValue.trim() !== "");
      const kpisWithTargets = selectedKPIs.filter(k => k.targetValue && k.targetValue.trim() !== "");
      const hasAllBaselines = selectedKPIs.length > 0 && kpisWithBaselines.length === selectedKPIs.length;
      const hasAllTargets = selectedKPIs.length > 0 && kpisWithTargets.length === selectedKPIs.length;
      const hasValueCase = valueCases.length > 0;

      // Calculate Realization milestones (simplified for now)
      const hasKPIActuals = await storage.getAllKPIActualsForProject(projectId);
      const hasProgressTracking = hasKPIActuals.length > 0;

      const progress = {
        discovery: {
          milestones: [
            { id: "company_research", label: "Complete company research", completed: hasCompanyResearch },
            { id: "strategic_pillars", label: "Define strategic pillars", completed: hasStrategicPillars, count: strategicPillars.length },
            { id: "prioritize_jobs", label: "Prioritize key jobs", completed: hasPrioritizedJobs },
            { id: "select_kpis", label: "Select KPIs (3+ recommended)", completed: hasMinimumKPIs, count: selectedKPIs.length, target: 3 },
          ],
          completedCount: [hasCompanyResearch, hasStrategicPillars, hasPrioritizedJobs, hasMinimumKPIs].filter(Boolean).length,
          totalCount: 4,
        },
        alignment: {
          milestones: [
            { 
              id: "set_baselines", 
              label: "Set KPI baselines", 
              completed: hasAllBaselines, 
              count: kpisWithBaselines.length, 
              target: selectedKPIs.length,
              progressText: selectedKPIs.length > 0 ? `${kpisWithBaselines.length}/${selectedKPIs.length}` : "No KPIs selected"
            },
            { 
              id: "define_targets", 
              label: "Define KPI targets", 
              completed: hasAllTargets, 
              count: kpisWithTargets.length, 
              target: selectedKPIs.length,
              progressText: selectedKPIs.length > 0 ? `${kpisWithTargets.length}/${selectedKPIs.length}` : "No KPIs selected"
            },
            { id: "build_value_case", label: "Build value case", completed: hasValueCase, count: valueCases.length },
          ],
          completedCount: [hasAllBaselines, hasAllTargets, hasValueCase].filter(Boolean).length,
          totalCount: 3,
        },
        realization: {
          milestones: [
            { id: "track_progress", label: "Track KPI progress", completed: hasProgressTracking },
          ],
          completedCount: [hasProgressTracking].filter(Boolean).length,
          totalCount: 1,
        },
        summary: {
          discoveryComplete: hasCompanyResearch && hasStrategicPillars && hasPrioritizedJobs && hasMinimumKPIs,
          alignmentComplete: hasAllBaselines && hasAllTargets && hasValueCase,
          realizationComplete: hasProgressTracking,
          totalKPIs: selectedKPIs.length,
          totalPillars: strategicPillars.length,
          totalValueCases: valueCases.length,
        }
      };

      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validated = insertProjectSchema.parse(req.body);
      
      // Sanitize companyName using robust helper
      if (validated.companyName) {
        validated.companyName = sanitizeInput(validated.companyName);
      }
      
      // Sanitize name field
      if (validated.name) {
        validated.name = sanitizeInput(validated.name);
      }
      
      // Sanitize and validate companyLogoUrl
      if (validated.companyLogoUrl) {
        try {
          const logoUrl = new URL(validated.companyLogoUrl);
          // Only allow HTTPS URLs from trusted domains
          if (logoUrl.protocol !== "https:" || 
              !["logo.clearbit.com", "clearbit.com"].some(domain => logoUrl.hostname.endsWith(domain))) {
            validated.companyLogoUrl = null;
          }
        } catch {
          // Invalid URL, set to null
          validated.companyLogoUrl = null;
        }
      }
      
      // Sanitize sector using robust helper
      if (validated.sector) {
        validated.sector = sanitizeInput(validated.sector);
        if (!validated.sector) {
          validated.sector = null;
        }
      }
      
      const project = await storage.createProject(validated);
      res.json(project);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const validated = insertProjectSchema.partial().parse(req.body);
      
      // Sanitize companyName using robust helper
      if (validated.companyName !== undefined) {
        if (validated.companyName) {
          validated.companyName = sanitizeInput(validated.companyName);
          // Reject empty company names after sanitization
          if (!validated.companyName) {
            return res.status(400).json({ error: "Company name cannot be empty after sanitization" });
          }
        }
      }
      
      // Sanitize name field
      if (validated.name !== undefined) {
        if (validated.name) {
          validated.name = sanitizeInput(validated.name);
          if (!validated.name) {
            return res.status(400).json({ error: "Project name cannot be empty after sanitization" });
          }
        }
      }
      
      // Sanitize and validate companyLogoUrl
      if (validated.companyLogoUrl !== undefined) {
        if (validated.companyLogoUrl) {
          try {
            const logoUrl = new URL(validated.companyLogoUrl);
            if (logoUrl.protocol !== "https:" || 
                !["logo.clearbit.com", "clearbit.com"].some(domain => logoUrl.hostname.endsWith(domain))) {
              validated.companyLogoUrl = null;
            }
          } catch {
            validated.companyLogoUrl = null;
          }
        }
      }
      
      // Sanitize sector using robust helper
      if (validated.sector !== undefined) {
        if (validated.sector) {
          validated.sector = sanitizeInput(validated.sector);
          if (!validated.sector) {
            validated.sector = null;
          }
        }
      }
      
      const project = await storage.updateProject(parseInt(req.params.id), validated);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      await storage.deleteProject(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Company Search Autocomplete
  app.get("/api/search-companies", async (req, res) => {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return res.json([]);
      }

      // Use Clearout's free autocomplete API
      const response = await fetch(
        `https://api.clearout.io/public/companies/autocomplete?query=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) {
        return res.json([]);
      }

      const data = await response.json();
      
      // Transform the response to our format
      const companies = (data.data || []).map((company: any) => ({
        name: company.name,
        domain: company.domain,
        logo: company.logo || `https://logo.clearbit.com/${company.domain}`,
      }));
      
      res.json(companies);
    } catch (error: any) {
      console.error("Company search error:", error);
      res.json([]);
    }
  });

  // Company Logo Verification
  app.post("/api/verify-company", async (req, res) => {
    try {
      const { companyName } = req.body;
      if (!companyName) {
        return res.status(400).json({ error: "Company name is required" });
      }
      
      // Use web search to find the company's website and logo
      // For now, we'll use a simple heuristic based on the company domain
      const domainGuess = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const logoUrl = `https://logo.clearbit.com/${domainGuess}.com`;
      
      res.json({
        companyName,
        logoUrl,
        verified: false
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Manually update project logo
  const updateLogoSchema = z.object({
    logoUrl: z.string().nullable(),
  }).strict();

  app.patch("/api/projects/:projectId/logo", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Validate request body
      const parseResult = updateLogoSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid request body" });
      }
      const { logoUrl } = parseResult.data;
      
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Allow clearing the logo (null, undefined, or empty string)
      if (logoUrl === null || logoUrl === undefined || logoUrl === "") {
        await storage.updateProject(projectId, { companyLogoUrl: null });
        return res.json({ logoUrl: null, updated: true });
      }

      // Validate URL format
      try {
        new URL(logoUrl);
      } catch {
        return res.status(400).json({ error: "Invalid URL format" });
      }

      // Verify the logo URL exists and is an image (try HEAD first, fallback to GET)
      try {
        let response = await fetch(logoUrl, { method: 'HEAD' });
        
        // Some servers don't support HEAD or block anonymous requests, try GET
        if (!response.ok && (response.status === 405 || response.status === 403)) {
          response = await fetch(logoUrl, { method: 'GET' });
        }
        
        const contentType = response.headers.get('content-type') || '';
        // Accept 200-399 status codes (success and redirects)
        if (response.status >= 400) {
          return res.status(400).json({ error: "Logo URL is not accessible" });
        }
        // Allow missing content-type for some CDNs, but still require image if present
        if (contentType && !contentType.startsWith('image/')) {
          return res.status(400).json({ error: "URL does not point to an image" });
        }
      } catch {
        // If verification fails completely, still allow the URL (user chose it)
        console.warn("Could not verify logo URL, proceeding anyway:", logoUrl);
      }

      await storage.updateProject(projectId, { companyLogoUrl: logoUrl });
      res.json({ logoUrl, updated: true });
    } catch (error: any) {
      console.error("Error updating logo:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Auto-fetch logo for a project using Clearout API
  app.post("/api/projects/:projectId/fetch-logo", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // If project already has a logo, return it
      if (project.companyLogoUrl) {
        return res.json({ logoUrl: project.companyLogoUrl, updated: false });
      }

      // Helper to verify if a logo URL actually exists
      const verifyLogoUrl = async (url: string): Promise<boolean> => {
        try {
          const headResponse = await fetch(url, { method: 'HEAD' });
          return headResponse.ok && headResponse.headers.get('content-type')?.startsWith('image/');
        } catch {
          return false;
        }
      };

      // Search for company using Clearout API
      const response = await fetch(
        `https://api.clearout.io/public/companies/autocomplete?query=${encodeURIComponent(project.companyName)}`
      );
      
      let logoUrl: string | null = null;
      
      if (response.ok) {
        const data = await response.json();
        const companies = data.data || [];
        
        // Find a matching company (case-insensitive)
        const match = companies.find((c: any) => 
          c.name.toLowerCase() === project.companyName.toLowerCase()
        ) || companies[0]; // Fall back to first result
        
        if (match) {
          const candidateUrl = match.logo || `https://logo.clearbit.com/${match.domain}`;
          // Verify the logo URL actually works
          if (await verifyLogoUrl(candidateUrl)) {
            logoUrl = candidateUrl;
          }
        }
      }
      
      // If no verified logo found, try direct Clearbit with domain guess
      if (!logoUrl) {
        const domainGuess = project.companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const candidateUrl = `https://logo.clearbit.com/${domainGuess}.com`;
        if (await verifyLogoUrl(candidateUrl)) {
          logoUrl = candidateUrl;
        }
      }

      // Only update if we found a valid logo
      if (logoUrl) {
        await storage.updateProject(projectId, { companyLogoUrl: logoUrl });
        res.json({ logoUrl, updated: true });
      } else {
        res.json({ logoUrl: null, updated: false });
      }
    } catch (error: any) {
      console.error("Error fetching logo:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // AI Research
  app.post("/api/projects/:projectId/research", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      let result;
      try {
        result = await researchCompany(project.companyName, project.sector || undefined);
      } catch (aiError: any) {
        return res.status(500).json({ 
          error: "AI research failed",
          details: aiError.message,
          suggestion: "Please try again or add company data manually"
        });
      }

      const existingDataPoints = await storage.getCompanyDataPoints(projectId);
      const aiDataPoints = existingDataPoints.filter(
        dp => dp.provenance && typeof dp.provenance === 'object' && 
        'type' in dp.provenance && dp.provenance.type === 'ai_generated'
      );
      
      for (const aiDp of aiDataPoints) {
        await storage.deleteCompanyDataPoint(aiDp.id);
      }

      const existingHeadlines = await storage.getHeadlines(projectId);
      const aiHeadlines = existingHeadlines.filter(
        h => h.source === 'AI Research'
      );
      
      for (const aiH of aiHeadlines) {
        await storage.deleteHeadline(aiH.id);
      }

      // Validate AI response quality
      if (result.dataPoints.length < 6) {
        console.warn(`AI returned only ${result.dataPoints.length} insights (expected 8)`);
      }

      const validKornFerryPillars = [
        "leadership-development", "talent-acquisition", "succession-planning",
        "culture-transformation", "organizational-design", "change-management"
      ];

      const validSolutionAreas = ["ASSESS", "DEVELOP", "TRANSFORM", "REWARD", "COMMERCIAL", "ANALYTICS"];

      const validatedDataPoints = [];
      for (const dp of result.dataPoints) {
        try {
          // Validate and sanitize priority score
          let priorityScore = 3; // default
          if (typeof dp.priorityScore === 'number' && !isNaN(dp.priorityScore)) {
            if (dp.priorityScore >= 1 && dp.priorityScore <= 5) {
              priorityScore = Math.round(dp.priorityScore); // Ensure integer
            } else {
              console.warn(`AI returned out-of-range priorityScore ${dp.priorityScore}, using default 3`);
            }
          } else if (dp.priorityScore !== undefined && dp.priorityScore !== null) {
            console.warn(`AI returned non-numeric priorityScore ${dp.priorityScore}, using default 3`);
          }
          
          // Validate and sanitize Korn Ferry pillar
          let kornFerryPillar = null;
          if (dp.kornFerryPillar) {
            if (typeof dp.kornFerryPillar === 'string' && validKornFerryPillars.includes(dp.kornFerryPillar)) {
              kornFerryPillar = dp.kornFerryPillar;
            } else {
              console.warn(`AI returned invalid kornFerryPillar "${dp.kornFerryPillar}", setting to null`);
            }
          }

          // Validate and sanitize solution area
          let solutionArea = null;
          if (dp.solutionArea) {
            if (typeof dp.solutionArea === 'string' && validSolutionAreas.includes(dp.solutionArea)) {
              solutionArea = dp.solutionArea;
            } else {
              console.warn(`AI returned invalid solutionArea "${dp.solutionArea}", setting to null`);
            }
          }

          // Validate and sanitize related KPIs
          let relatedKPIs = null;
          if (dp.relatedKPIs && Array.isArray(dp.relatedKPIs)) {
            relatedKPIs = dp.relatedKPIs.filter((kpi: any) => typeof kpi === 'string' && kpi.trim().length > 0);
            if (relatedKPIs.length === 0) {
              relatedKPIs = null;
            }
          } else if (dp.relatedKPIs) {
            console.warn(`AI returned invalid relatedKPIs (expected array), setting to null`);
          }

          // Validate and sanitize relevant capability
          let relevantCapability = null;
          if (dp.relevantCapability) {
            if (typeof dp.relevantCapability === 'string' && dp.relevantCapability.trim().length > 0) {
              relevantCapability = dp.relevantCapability.trim();
            } else {
              console.warn(`AI returned invalid relevantCapability, setting to null`);
            }
          }
          
          const validated = insertCompanyDataPointSchema.parse({
            projectId,
            label: dp.label,
            value: dp.value,
            confidence: dp.confidence,
            source: dp.source || "AI Research",
            sourceUrl: null,
            provenance: { type: "ai_generated", model: "gpt-5", timestamp: new Date().toISOString() },
            selectedForNotes: false,
            relevantJob: null,
            relevantCapability,
            priorityScore,
            kornFerryPillar,
            solutionArea,
            relatedKPIs
          });
          validatedDataPoints.push(await storage.createCompanyDataPoint(validated));
        } catch (validationError: any) {
          console.error("Invalid data point from AI:", validationError.message, dp);
        }
      }

      const validatedHeadlines = [];
      for (const h of result.headlines) {
        try {
          const validated = insertHeadlineSchema.parse({
            projectId,
            title: h.title,
            date: h.date,
            source: h.source || "AI Research",
            url: h.url || "",
            excerpt: null
          });
          validatedHeadlines.push(await storage.createHeadline(validated));
        } catch (validationError: any) {
          console.error("Invalid headline from AI:", validationError.message, h);
        }
      }

      res.json({
        dataPoints: validatedDataPoints,
        headlines: validatedHeadlines,
        summary: `Successfully created ${validatedDataPoints.length} data points and ${validatedHeadlines.length} headlines`
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: "An unexpected error occurred",
        details: error.message 
      });
    }
  });

  // AI Follow-up Research
  app.post("/api/projects/:projectId/research/follow-up", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { question } = req.body;
      
      if (!question || typeof question !== 'string' || question.trim().length === 0) {
        return res.status(400).json({ error: "Question is required" });
      }

      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Get existing research to provide context
      const existingDataPoints = await storage.getCompanyDataPoints(projectId);
      const existingHeadlines = await storage.getHeadlines(projectId);

      // Map existing research with proper type safety
      const existingResearch = {
        dataPoints: existingDataPoints.map(dp => {
          const pillar = dp.kornFerryPillar as "leadership-development" | "talent-acquisition" | "succession-planning" | "culture-transformation" | "organizational-design" | "change-management" | null;
          const solution = dp.solutionArea as "ASSESS" | "DEVELOP" | "TRANSFORM" | "REWARD" | "COMMERCIAL" | "ANALYTICS" | null;
          return {
            label: dp.label,
            value: dp.value,
            confidence: dp.confidence as "high" | "medium" | "low",
            source: dp.source || "",
            priorityScore: dp.priorityScore,
            kornFerryPillar: pillar || "leadership-development", // Provide safe default for AI context
            solutionArea: solution || "DEVELOP",
            relatedKPIs: (dp.relatedKPIs as string[] | null) || [],
            relevantCapability: dp.relevantCapability
          };
        }),
        headlines: existingHeadlines.map(h => ({
          title: h.title,
          date: h.date,
          source: h.source,
          url: h.url
        }))
      };

      let result;
      try {
        result = await followUpResearch(
          project.companyName, 
          question, 
          existingResearch,
          project.sector || undefined
        );
      } catch (aiError: any) {
        return res.status(500).json({ 
          error: "AI follow-up research failed",
          details: aiError.message
        });
      }

      // Add new data points with follow-up provenance
      const validKornFerryPillars = [
        "leadership-development", "talent-acquisition", "succession-planning",
        "culture-transformation", "organizational-design", "change-management"
      ];

      const validSolutionAreas = ["ASSESS", "DEVELOP", "TRANSFORM", "REWARD", "COMMERCIAL", "ANALYTICS"];

      const validatedDataPoints = [];
      for (const dp of result.dataPoints) {
        try {
          // Validate and sanitize priority score
          let priorityScore = 4; // default for follow-up
          if (typeof dp.priorityScore === 'number' && !isNaN(dp.priorityScore)) {
            if (dp.priorityScore >= 1 && dp.priorityScore <= 5) {
              priorityScore = Math.round(dp.priorityScore); // Ensure integer
            } else {
              console.warn(`Follow-up AI returned out-of-range priorityScore ${dp.priorityScore}, using default 4`);
            }
          } else if (dp.priorityScore !== undefined && dp.priorityScore !== null) {
            console.warn(`Follow-up AI returned non-numeric priorityScore ${dp.priorityScore}, using default 4`);
          }
          
          // Validate and sanitize Korn Ferry pillar
          let kornFerryPillar = null;
          if (dp.kornFerryPillar) {
            if (typeof dp.kornFerryPillar === 'string' && validKornFerryPillars.includes(dp.kornFerryPillar)) {
              kornFerryPillar = dp.kornFerryPillar;
            } else {
              console.warn(`Follow-up AI returned invalid kornFerryPillar "${dp.kornFerryPillar}", setting to null`);
            }
          }

          // Validate and sanitize solution area
          let solutionArea = null;
          if (dp.solutionArea) {
            if (typeof dp.solutionArea === 'string' && validSolutionAreas.includes(dp.solutionArea)) {
              solutionArea = dp.solutionArea;
            } else {
              console.warn(`Follow-up AI returned invalid solutionArea "${dp.solutionArea}", setting to null`);
            }
          }

          // Validate and sanitize related KPIs
          let relatedKPIs = null;
          if (dp.relatedKPIs && Array.isArray(dp.relatedKPIs)) {
            relatedKPIs = dp.relatedKPIs.filter((kpi: any) => typeof kpi === 'string' && kpi.trim().length > 0);
            if (relatedKPIs.length === 0) {
              relatedKPIs = null;
            }
          } else if (dp.relatedKPIs) {
            console.warn(`Follow-up AI returned invalid relatedKPIs (expected array), setting to null`);
          }

          // Validate and sanitize relevant capability
          let relevantCapability = null;
          if (dp.relevantCapability) {
            if (typeof dp.relevantCapability === 'string' && dp.relevantCapability.trim().length > 0) {
              relevantCapability = dp.relevantCapability.trim();
            } else {
              console.warn(`Follow-up AI returned invalid relevantCapability, setting to null`);
            }
          }
          
          const validated = insertCompanyDataPointSchema.parse({
            projectId,
            label: dp.label,
            value: dp.value,
            confidence: dp.confidence,
            source: dp.source || "AI Follow-up",
            sourceUrl: null,
            provenance: { 
              type: "ai_follow_up", 
              model: "gpt-5", 
              timestamp: new Date().toISOString(),
              question 
            },
            selectedForNotes: false,
            relevantJob: null,
            relevantCapability,
            priorityScore,
            kornFerryPillar,
            solutionArea,
            relatedKPIs
          });
          validatedDataPoints.push(await storage.createCompanyDataPoint(validated));
        } catch (validationError: any) {
          console.error("Invalid data point from follow-up AI:", validationError.message, dp);
        }
      }

      const validatedHeadlines = [];
      for (const h of result.headlines) {
        try {
          const validated = insertHeadlineSchema.parse({
            projectId,
            title: h.title,
            date: h.date,
            source: h.source || "AI Follow-up",
            url: h.url || "",
            excerpt: null
          });
          validatedHeadlines.push(await storage.createHeadline(validated));
        } catch (validationError: any) {
          console.error("Invalid headline from follow-up AI:", validationError.message, h);
        }
      }

      res.json({
        dataPoints: validatedDataPoints,
        headlines: validatedHeadlines,
        summary: `Added ${validatedDataPoints.length} new insights and ${validatedHeadlines.length} headlines based on your question`
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: "An unexpected error occurred",
        details: error.message 
      });
    }
  });

  // Live Company Intelligence (theme-based)
  app.post("/api/projects/:projectId/live-intelligence", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { discoveryTheme } = req.body;
      
      if (!discoveryTheme || typeof discoveryTheme !== 'string') {
        return res.status(400).json({ error: "Discovery theme is required" });
      }

      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      console.log(`[Live Intelligence] Generating for ${project.companyName} with theme: ${discoveryTheme}`);
      
      const intelligence = await generateLiveIntelligence(
        project.companyName,
        discoveryTheme,
        project.sector || undefined
      );

      // Auto-save the intelligence to database for persistence
      await storage.saveProjectIntelligence({
        projectId,
        discoveryTheme,
        intelligenceData: intelligence as Record<string, any>
      });
      
      res.json(intelligence);
    } catch (error: any) {
      console.error("[Live Intelligence] Error:", error);
      res.status(500).json({ 
        error: "Failed to generate live intelligence",
        details: error.message 
      });
    }
  });
  
  // GET saved intelligence (load from database)
  app.get("/api/projects/:projectId/intelligence/:theme", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { theme } = req.params;
      
      const saved = await storage.getProjectIntelligence(projectId, theme);
      if (!saved) {
        return res.status(404).json({ error: "No saved intelligence found for this theme" });
      }
      
      // Return in same format as live intelligence
      res.json({
        ...saved.intelligenceData,
        generatedAt: saved.regeneratedAt?.toISOString() || saved.generatedAt.toISOString(),
        savedId: saved.id,
        probeHistory: saved.probeHistory || []
      });
    } catch (error: any) {
      console.error("[Load Intelligence] Error:", error);
      res.status(500).json({ error: "Failed to load saved intelligence" });
    }
  });
  
  // POST probe the intelligence (ask follow-up questions)
  app.post("/api/projects/:projectId/intelligence/:theme/probe", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { theme } = req.params;
      const { question } = req.body;
      
      if (!question || typeof question !== 'string') {
        return res.status(400).json({ error: "Question is required" });
      }
      
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Get existing intelligence for context
      const saved = await storage.getProjectIntelligence(projectId, theme);
      if (!saved) {
        return res.status(404).json({ error: "No saved intelligence found. Generate intelligence first." });
      }
      
      // Build context from saved intelligence
      const intelligenceContext = JSON.stringify(saved.intelligenceData, null, 2);
      
      // Call OpenAI to answer the probe question
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a Korn Ferry strategic consultant assistant. You have access to detailed intelligence about ${project.companyName} that was gathered for a ${theme} discovery engagement.

Use this intelligence to answer the user's follow-up questions with strategic, actionable insights relevant to Korn Ferry's consulting capabilities.

Intelligence Context:
${intelligenceContext}

Be concise but comprehensive. Focus on strategic implications and actionable recommendations for the engagement.`
          },
          {
            role: "user",
            content: question
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });
      
      const answer = response.choices[0].message.content || "Unable to generate response.";
      
      // Save the probe to history
      const probeHistory = saved.probeHistory || [];
      const newEntry = [
        { role: "user" as const, content: question, timestamp: new Date().toISOString() },
        { role: "assistant" as const, content: answer, timestamp: new Date().toISOString() }
      ];
      
      await storage.updateProjectIntelligenceProbeHistory(saved.id, [...probeHistory, ...newEntry]);
      
      res.json({
        question,
        answer,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("[Probe Intelligence] Error:", error);
      res.status(500).json({ error: "Failed to process probe question" });
    }
  });

  // ============================================================================
  // MEETING PROFILES - Adaptive meeting preparation with single/multi attendee
  // ============================================================================
  
  // GET meeting profile for a project
  app.get("/api/projects/:projectId/meeting-profile", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const profile = await storage.getMeetingProfile(projectId);
      
      if (!profile) {
        return res.status(404).json({ error: "No meeting profile found" });
      }
      
      res.json(profile);
    } catch (error: any) {
      console.error("[Get Meeting Profile] Error:", error);
      res.status(500).json({ error: "Failed to get meeting profile" });
    }
  });
  
  // POST create or update meeting profile
  app.post("/api/projects/:projectId/meeting-profile", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const existing = await storage.getMeetingProfile(projectId);
      
      if (existing) {
        // Update existing profile
        const updated = await storage.updateMeetingProfile(existing.id, req.body);
        return res.json(updated);
      }
      
      // Create new profile
      const profile = await storage.createMeetingProfile({
        projectId,
        ...req.body
      });
      
      res.json(profile);
    } catch (error: any) {
      console.error("[Create/Update Meeting Profile] Error:", error);
      res.status(500).json({ error: "Failed to save meeting profile" });
    }
  });
  
  // PATCH update specific fields of meeting profile
  app.patch("/api/projects/:projectId/meeting-profile", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const existing = await storage.getMeetingProfile(projectId);
      
      if (!existing) {
        return res.status(404).json({ error: "Meeting profile not found" });
      }
      
      const updated = await storage.updateMeetingProfile(existing.id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("[Update Meeting Profile] Error:", error);
      res.status(500).json({ error: "Failed to update meeting profile" });
    }
  });
  
  // POST generate methodology questions for meeting
  app.post("/api/projects/:projectId/meeting-profile/generate-questions", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const profile = await storage.getMeetingProfile(projectId);
      const discoveryTheme = project.discoveryTheme || "leadership";
      
      // Get intelligence data for context
      const intelligence = await storage.getProjectIntelligence(projectId, discoveryTheme);
      const intelligenceContext = intelligence?.intelligenceData ? JSON.stringify(intelligence.intelligenceData) : "";
      
      // Get Green Sheet context
      const greenSheet = await storage.getGreenSheet(projectId);
      const greenSheetContext = greenSheet ? `
Meeting Objective: ${greenSheet.callPlanner?.objective || "Not specified"}
Desired Outcome: ${greenSheet.callPlanner?.desiredOutcome || "Not specified"}
Opening Statement: ${greenSheet.callPlanner?.openingStatement || "Not specified"}
Best Action Commitment: ${greenSheet.callPlanner?.bestActionCommitment || "Not specified"}` : "";
      
      // Build detailed attendee list with all context
      const mode = profile?.attendanceMode || "single";
      let attendeeList: Array<{id: string; name: string; title: string; role: string; influence: string; concerns: string; outcomes: string; rapport: string; criteria: string}> = [];
      
      if (mode === "multiple" && profile?.participants && profile.participants.length > 0) {
        attendeeList = profile.participants.map((p: any, idx: number) => ({
          id: p.id || `attendee-${idx}`,
          name: p.name || `Attendee ${idx + 1}`,
          title: p.title || "Unknown title",
          role: p.role || "unknown",
          influence: p.influence || "unknown",
          concerns: p.knownConcerns || "not specified",
          outcomes: p.preferredOutcomes || "not specified",
          rapport: p.personalRapport || "not specified",
          criteria: p.decisionCriteria || "not specified"
        }));
      } else if (profile?.singleContact) {
        const c = profile.singleContact as any;
        attendeeList = [{
          id: c.id || "single-attendee",
          name: c.name || "Primary Contact",
          title: c.title || "Unknown title",
          role: c.role || "unknown",
          influence: c.influence || "unknown",
          concerns: c.knownConcerns || "not specified",
          outcomes: c.preferredOutcomes || "not specified",
          rapport: c.personalRapport || "not specified",
          criteria: c.decisionCriteria || "not specified"
        }];
      }
      
      const attendeeSummary = attendeeList.length > 0 
        ? attendeeList.map(a => `- ${a.name} (${a.title})
    Role: ${a.role}, Influence: ${a.influence}
    Known Concerns: ${a.concerns}
    Preferred Outcomes: ${a.outcomes}
    Decision Criteria: ${a.criteria}`).join("\n\n")
        : "No attendees specified";
      
      const attendeeNames = attendeeList.map(a => a.name);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a Korn Ferry strategic sales consultant expert in Miller Heiman, SPIN Selling, and PSS methodologies.

Generate discovery questions for a ${discoveryTheme} engagement with ${project.companyName}.

## Meeting Attendees (${attendeeList.length} people):
${attendeeSummary}

## Green Sheet Context:
${greenSheetContext || "No Green Sheet data available"}

${intelligenceContext ? `## Company Intelligence:\n${intelligenceContext}` : ""}

## Your Task:
Generate 10-15 questions tagged by methodology (SPIN, Miller Heiman, PSS) that:
1. Include BOTH questions for ALL attendees AND questions targeted to SPECIFIC individuals
2. For questions targeting ALL attendees, set targetAudience to "all"
3. For questions targeting specific people, set targetAudience to "specific" and list their names in targetAttendeeNames
4. IMPORTANT: Every attendee should have at least 1-2 questions specifically for them based on their role, concerns, and outcomes
5. Uncover pain points, implications, and needs relevant to each person's perspective
6. Align with the ${discoveryTheme} discovery theme
7. Consider the Green Sheet objectives when framing questions

Return as JSON object with "questions" array:
{
  "questions": [
    {
      "id": "q1",
      "question": "...",
      "methodology": "SPIN" | "Miller Heiman" | "PSS",
      "stage": "Situation" | "Problem" | "Implication" | "Need-Payoff" | "Concept" | "Impact" | "Proof" | "Opening" | "Probing" | "Supporting" | "Closing",
      "targetAudience": "all" | "specific",
      "targetAttendeeNames": ["Name1", "Name2"] or [],
      "targetRole": "economic_buyer" | "user_buyer" | "technical_buyer" | "coach" | "champion" | null,
      "rationale": "Why this question is important for this audience",
      "followUpHint": "...",
      "isAsked": false
    }
  ],
  "attendeeCoverage": {
    "attendeeName1": ["q1", "q5"],
    "attendeeName2": ["q2", "q7"]
  }
}`
          },
          {
            role: "user",
            content: `Generate methodology-based discovery questions for this ${mode === "multiple" ? "multi-stakeholder" : "single-stakeholder"} meeting.

Attendee names to ensure coverage for: ${attendeeNames.join(", ") || "Unknown attendees"}

Make sure EVERY attendee has at least 1-2 questions specifically targeting them based on their unique concerns, role, and decision criteria.`
          }
        ],
        max_tokens: 3500,
        temperature: 0.7,
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0].message.content || "{}";
      let questions = [];
      let attendeeCoverage = {};
      try {
        const parsed = JSON.parse(content);
        questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);
        attendeeCoverage = parsed.attendeeCoverage || {};
      } catch (e) {
        console.error("[Generate Questions] Parse error:", e);
        questions = [];
      }
      
      // Save questions to meeting profile
      if (profile) {
        await storage.updateMeetingProfile(profile.id, { generatedQuestions: questions });
      }
      
      res.json({ 
        questions, 
        attendeeCoverage,
        attendeeCount: attendeeList.length,
        attendeeNames 
      });
    } catch (error: any) {
      console.error("[Generate Meeting Questions] Error:", error);
      res.status(500).json({ error: "Failed to generate questions" });
    }
  });
  
  // POST generate combined meeting story
  app.post("/api/projects/:projectId/meeting-profile/generate-story", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const profile = await storage.getMeetingProfile(projectId);
      if (!profile) {
        return res.status(404).json({ error: "Meeting profile not found. Set up attendees first." });
      }
      
      const discoveryTheme = project.discoveryTheme || "leadership";
      const intelligence = await storage.getProjectIntelligence(projectId, discoveryTheme);
      const intelligenceContext = intelligence?.intelligenceData ? JSON.stringify(intelligence.intelligenceData) : "";
      
      const mode = profile.attendanceMode || "single";
      
      let attendeeContext = "";
      if (mode === "multiple" && profile.participants && profile.participants.length > 0) {
        attendeeContext = profile.participants.map(p => 
          `- ${p.name} (${p.title}): Role: ${p.role}, Influence: ${p.influence}, Concerns: ${p.knownConcerns || "not specified"}, Preferred outcomes: ${p.preferredOutcomes || "not specified"}`
        ).join("\n");
      } else if (profile.singleContact) {
        const c = profile.singleContact;
        attendeeContext = `- ${c.name} (${c.title}): Role: ${c.role || "not specified"}, Influence: ${c.influence || "not specified"}, Concerns: ${c.knownConcerns || "not specified"}`;
      }
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a Korn Ferry strategic sales consultant preparing a meeting narrative using Miller Heiman Strategic Selling methodology.

Create a comprehensive meeting story that synthesizes what ALL stakeholders care about into a cohesive narrative.

Company: ${project.companyName}
Discovery Theme: ${discoveryTheme}
Meeting Objective: ${profile.meetingObjective || "Discovery and value alignment"}

Meeting Attendees:
${attendeeContext || "Attendees not yet specified"}

${intelligenceContext ? `Company Intelligence:\n${intelligenceContext}` : ""}

Generate a meeting preparation package as JSON:
{
  "narrative": "A 2-3 paragraph narrative that tells a compelling story connecting all stakeholder interests",
  "keyThemes": ["Theme that resonates across all attendees"],
  "talkingPoints": [{"point": "Key message", "targetAudience": ["role1", "role2"]}],
  "objectionHandling": [{"objection": "Likely pushback", "response": "Strategic response", "relevantTo": ["role"]}],
  "agenda": [{"topic": "Discussion topic", "duration": "10 min", "leadWith": "Key angle"}],
  "proofPoints": [{"claim": "Value statement", "evidence": "Supporting data", "resonatesWith": ["role"]}]
}`
          },
          {
            role: "user",
            content: `Generate a combined meeting story for this ${mode === "multiple" ? "multi-stakeholder" : "single-stakeholder"} discovery meeting.`
          }
        ],
        max_tokens: 2500,
        temperature: 0.7,
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0].message.content || "{}";
      let story = null;
      try {
        story = JSON.parse(content);
        story.generatedAt = new Date().toISOString();
      } catch (e) {
        console.error("[Generate Story] Parse error:", e);
        return res.status(500).json({ error: "Failed to parse generated story" });
      }
      
      // Save story to meeting profile
      await storage.updateMeetingProfile(profile.id, { combinedMeetingStory: story });
      
      res.json({ story });
    } catch (error: any) {
      console.error("[Generate Meeting Story] Error:", error);
      res.status(500).json({ error: "Failed to generate meeting story" });
    }
  });
  
  // POST analyze meeting transcript
  app.post("/api/projects/:projectId/meeting-profile/analyze-transcript", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { transcript } = req.body;
      
      if (!transcript || typeof transcript !== 'string') {
        return res.status(400).json({ error: "Transcript is required" });
      }
      
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const profile = await storage.getMeetingProfile(projectId);
      if (!profile) {
        return res.status(404).json({ error: "Meeting profile not found" });
      }
      
      const discoveryTheme = project.discoveryTheme || "leadership";
      
      // Build attendee context for analysis
      let attendeeContext = "";
      if (profile.attendanceMode === "multiple" && profile.participants) {
        attendeeContext = profile.participants.map(p => `${p.name} (${p.role})`).join(", ");
      } else if (profile.singleContact) {
        attendeeContext = `${profile.singleContact.name} (${profile.singleContact.role || "stakeholder"})`;
      }
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a Korn Ferry strategic sales coach analyzing a meeting transcript.

Company: ${project.companyName}
Discovery Theme: ${discoveryTheme}
Meeting Attendees: ${attendeeContext || "Not specified"}

Analyze this transcript and provide:
1. Executive summary of the meeting
2. Key insights discovered
3. Action items with owners
4. Stakeholder sentiment analysis (per person if multiple)
5. Coaching notes for the sales team (what went well, what to improve)
6. Suggested follow-up questions

Return as JSON:
{
  "summary": "2-3 sentence executive summary",
  "keyInsights": ["Insight 1", "Insight 2"],
  "actionItems": [{"item": "Action", "owner": "Who", "dueDate": "optional"}],
  "stakeholderSentiment": {"PersonName": {"sentiment": "positive|neutral|cautious|concerned", "signals": ["What indicated this"]}},
  "coachingNotes": [{"area": "Discovery Questions", "observation": "What happened", "suggestion": "How to improve"}],
  "followUpQuestions": ["Question to ask in follow-up"]
}`
          },
          {
            role: "user",
            content: `Analyze this meeting transcript:\n\n${transcript.substring(0, 15000)}`
          }
        ],
        max_tokens: 3000,
        temperature: 0.5,
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0].message.content || "{}";
      let analysis = null;
      try {
        analysis = JSON.parse(content);
        analysis.analyzedAt = new Date().toISOString();
      } catch (e) {
        console.error("[Analyze Transcript] Parse error:", e);
        return res.status(500).json({ error: "Failed to parse analysis" });
      }
      
      // Save transcript and analysis to meeting profile
      await storage.updateMeetingProfile(profile.id, { 
        transcript, 
        transcriptAnalysis: analysis 
      });
      
      res.json({ analysis });
    } catch (error: any) {
      console.error("[Analyze Transcript] Error:", error);
      res.status(500).json({ error: "Failed to analyze transcript" });
    }
  });

  // POST research and enrich attendees with AI
  app.post("/api/projects/:projectId/meeting-profile/research-attendees", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { participantIds } = req.body; // Optional: specific participants to research
      
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const profile = await storage.getMeetingProfile(projectId);
      if (!profile || !profile.participants || profile.participants.length === 0) {
        return res.status(404).json({ error: "No attendees found. Please add attendees to research." });
      }
      
      // Ensure all participants have stable IDs before processing
      const participantsWithIds = profile.participants.map((p: any, idx: number) => ({
        ...p,
        id: p.id || `attendee-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`
      }));
      
      // Get all participants to research (both client and internal team)
      let participantsToResearch = [...participantsWithIds];
      
      // If specific IDs provided, filter to those only
      if (participantIds && Array.isArray(participantIds) && participantIds.length > 0) {
        participantsToResearch = participantsToResearch.filter((p: any) => participantIds.includes(p.id));
      }
      
      if (participantsToResearch.length === 0) {
        return res.status(400).json({ error: "No attendees to research." });
      }
      
      const clientCount = participantsToResearch.filter((p: any) => (p.affiliation || "client") === "client").length;
      const internalCount = participantsToResearch.length - clientCount;
      console.log(`[Attendee Research] Found ${participantsToResearch.length} attendees to research (${clientCount} client, ${internalCount} internal)`);
      
      // Build context about the company and industry
      const companyContext = `
Company: ${project.companyName || "Unknown"}
Industry: ${project.sector || project.industry || "Unknown"}
Initiative: ${project.name}
Discovery Theme: ${project.discoveryTheme || "general business transformation"}
      `.trim();
      
      // Research each attendee with AI
      const researchResults = [];
      const updatedParticipants = [...participantsWithIds];
      
      for (const participant of participantsToResearch) {
        const isInternal = (participant.affiliation || "client") === "internal";
        console.log(`[Attendee Research] Researching: ${participant.name} (${isInternal ? 'internal' : 'client'}) at ${project.companyName}`);
        
        // Different prompts for internal vs client attendees
        const systemPrompt = isInternal
          ? `You are a Korn Ferry sales enablement expert helping consultants prepare for high-stakes client meetings.

Your task is to enrich an internal team member's profile to understand their role in the deal:
1. What their Korn Ferry role typically contributes to client engagements
2. How they can best support this specific opportunity
3. Their likely expertise and what they bring to the meeting
4. How to leverage their strengths in the client conversation
5. Coordination tips for working effectively with this team member

Use your knowledge of:
- Management consulting sales cycles and team dynamics
- Korn Ferry solution areas (talent, leadership, organization)
- Miller Heiman Blue/Gold sheet methodology roles
- Effective client engagement team structures

Be specific about their meeting role and contribution.`
          : `You are a Korn Ferry executive researcher helping sales consultants prepare for high-stakes client meetings.

Your task is to enrich an attendee profile with deeper context about:
1. What their role typically cares about (based on their title/role)
2. Key priorities and challenges for someone in this position
3. How to build rapport and credibility with them
4. What messaging would resonate with their role
5. Industry-specific context that would matter to them
6. Suggestions for their likely full title if only a first name is known

Use your knowledge of:
- Executive roles and responsibilities
- Industry trends and challenges for ${project.sector || "their industry"}
- Sales methodology best practices (Miller Heiman, SPIN, Strategic Selling)
- Leadership and organizational dynamics

Be specific and actionable. Focus on insights that help build a compelling story for this person.`;

        const userPrompt = isInternal
          ? `Research and enrich this internal team member's profile:

${companyContext}

INTERNAL TEAM MEMBER:
- Name: ${participant.name}
- Title/Role: ${participant.title || "Unknown"}
- Meeting Role: ${participant.role || "Unknown"} (${
  participant.role === 'champion' ? 'Internal advocate for the deal' :
  participant.role === 'coach' ? 'Guides the sales strategy' :
  participant.role === 'technical_buyer' ? 'Solution/delivery expert' :
  participant.role === 'user_buyer' ? 'Subject matter expert' :
  participant.role === 'economic_buyer' ? 'Deal sponsor' : 'Team member'
})

Provide enriched profile as JSON:
{
  "suggestedFullName": "${participant.name}",
  "suggestedTitle": "Likely Korn Ferry title based on their role",
  "roleContext": "What this team member brings to client engagements",
  "keyPriorities": ["Top 3-5 things they care about in the deal cycle"],
  "likelyChallenges": ["Challenges they might face in this engagement"],
  "messagingThatResonates": ["How to best utilize their expertise in the meeting"],
  "rapportBuildingTips": ["How to coordinate effectively with this team member"],
  "questionsToAsk": ["Questions they might help answer for the client"],
  "industryContext": "Their expertise relevant to this client's industry",
  "storyAngle": "How they contribute to the overall client narrative",
  "redFlags": ["Things to coordinate on before the meeting"]
}`
          : `Research and enrich this attendee profile:

${companyContext}

ATTENDEE TO RESEARCH:
- Name: ${participant.name}
- Current Title: ${participant.title || "Unknown"}
- Role Type: ${participant.role || "Unknown"} (${
  participant.role === 'economic_buyer' ? 'Budget holder/decision maker' :
  participant.role === 'user_buyer' ? 'End user of the solution' :
  participant.role === 'technical_buyer' ? 'Evaluates technical fit' :
  participant.role === 'coach' ? 'Internal guide/advisor' :
  participant.role === 'champion' ? 'Internal advocate' : 'Client stakeholder'
})
- Influence Level: ${participant.influence || "Not specified"}
- Known Concerns: ${participant.knownConcerns || "None captured yet"}
- Preferred Outcomes: ${participant.preferredOutcomes || "None captured yet"}

Provide enriched profile as JSON:
{
  "suggestedFullName": "Best guess at full name if only first name given, or the name as-is",
  "suggestedTitle": "Likely title based on context (or confirmed title if known)",
  "roleContext": "What this role typically cares about at a company like ${project.companyName}",
  "keyPriorities": ["Top 3-5 priorities someone in this role would have"],
  "likelyChallenges": ["Challenges they probably face"],
  "messagingThatResonates": ["Types of messages/stories that would resonate with this role"],
  "rapportBuildingTips": ["How to build credibility and rapport with this person"],
  "questionsToAsk": ["Discovery questions tailored to this role"],
  "industryContext": "How ${project.sector || "their industry"} trends affect their priorities",
  "storyAngle": "Recommended narrative angle when presenting to this person",
  "redFlags": ["Things to avoid or be careful about with this role"]
}`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 1500,
          temperature: 0.7,
          response_format: { type: "json_object" }
        });
        
        const content = response.choices[0].message.content || "{}";
        let research = null;
        try {
          research = JSON.parse(content);
          research.researchedAt = new Date().toISOString();
        } catch (e) {
          console.error(`[Attendee Research] Parse error for ${participant.name}:`, e);
          continue;
        }
        
        // Update participant with research data
        const participantIndex = updatedParticipants.findIndex(p => p.id === participant.id);
        if (participantIndex >= 0) {
          updatedParticipants[participantIndex] = {
            ...updatedParticipants[participantIndex],
            // Update title if we have a better suggestion and current is empty
            title: updatedParticipants[participantIndex].title || research.suggestedTitle || "",
            // Store research as extended data
            aiResearch: research
          } as any;
        }
        
        researchResults.push({
          participantId: participant.id,
          name: participant.name,
          research
        });
      }
      
      // Save updated participants with research
      await storage.updateMeetingProfile(profile.id, {
        participants: updatedParticipants
      });
      
      res.json({
        success: true,
        participantsResearched: researchResults.length,
        research: researchResults
      });
    } catch (error: any) {
      console.error("[Attendee Research] Error:", error);
      res.status(500).json({ error: "Failed to research attendees: " + error.message });
    }
  });
  
  // AI Notes Enrichment
  app.post("/api/projects/:projectId/enrich-from-notes", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Get notes and attachments
      const notes = await storage.getDiscoveryNotes(projectId);
      const attachments = await storage.getAttachments(projectId);

      // Get existing research to avoid duplicates
      const existingDataPoints = await storage.getCompanyDataPoints(projectId);
      const existingHeadlines = await storage.getHeadlines(projectId);

      const existingResearch = {
        dataPoints: existingDataPoints.map(dp => {
          const pillar = dp.kornFerryPillar as "leadership-development" | "talent-acquisition" | "succession-planning" | "culture-transformation" | "organizational-design" | "change-management" | null;
          const solution = dp.solutionArea as "ASSESS" | "DEVELOP" | "TRANSFORM" | "REWARD" | "COMMERCIAL" | "ANALYTICS" | null;
          return {
            label: dp.label,
            value: dp.value,
            confidence: dp.confidence as "high" | "medium" | "low",
            source: dp.source || "",
            priorityScore: dp.priorityScore,
            kornFerryPillar: pillar || "leadership-development",
            solutionArea: solution || "DEVELOP",
            relatedKPIs: (dp.relatedKPIs as string[] | null) || [],
            relevantCapability: dp.relevantCapability
          };
        }),
        headlines: existingHeadlines.map(h => ({
          title: h.title,
          date: h.date,
          source: h.source,
          url: h.url
        }))
      };

      // Prepare notes input with attachment contents
      const MAX_TEXT_LENGTH = 50000; // Max characters per attachment to avoid token limits
      const attachmentContents = [];
      const fileProcessingErrors: string[] = [];
      let supportedFilesCount = 0;
      
      for (const att of attachments) {
        if (att.type === "voice") {
          // Voice notes: content is already transcription text
          let content = att.content || "";
          if (content.length > MAX_TEXT_LENGTH) {
            content = content.substring(0, MAX_TEXT_LENGTH) + "\n[... transcription truncated for length ...]";
          }
          attachmentContents.push({
            fileName: att.fileName || "voice_note",
            content,
            type: "voice" as const
          });
        } else if (att.type === "file") {
          // File attachments: extract text based on MIME type AND file extension
          const mimeType = att.mimeType || "";
          const fileName = att.fileName || "";
          const fileExt = fileName.toLowerCase().split('.').pop() || "";
          
          const isTextFile = mimeType.includes("text/") || 
                           mimeType.includes("csv") ||
                           mimeType === "application/json" ||
                           ["txt", "csv", "json"].includes(fileExt);
          
          if (isTextFile && att.content) {
            supportedFilesCount++;
            try {
              // Extract base64 data after the data URL prefix
              const base64Data = att.content.split(',')[1];
              if (!base64Data) continue;
              
              // Decode text files
              let extractedText = Buffer.from(base64Data, 'base64').toString('utf-8');
              
              // Truncate very long text to avoid token limits
              if (extractedText.length > MAX_TEXT_LENGTH) {
                extractedText = extractedText.substring(0, MAX_TEXT_LENGTH) + "\n[... file content truncated for length ...]";
              }
              
              if (extractedText.trim().length > 0) {
                attachmentContents.push({
                  fileName: att.fileName || "file",
                  content: extractedText,
                  type: "file" as const
                });
              }
            } catch (error) {
              console.error(`Failed to process text file ${att.fileName}:`, error);
              fileProcessingErrors.push(`Failed to read ${att.fileName}`);
            }
          } else {
            // For other binary files (PDFs, images, Word, Excel, etc.), note they're not supported
            console.log(`Skipping unsupported file format for enrichment: ${att.fileName} (${mimeType})`);
          }
        }
      }

      const notesInput = {
        freeformNotes: notes?.freeformNotes || "",
        attachmentContents
      };

      // Check if there's any content to analyze
      if (!notesInput.freeformNotes && notesInput.attachmentContents.length === 0) {
        return res.status(400).json({ 
          error: "No notes or attachments to analyze",
          suggestion: "Add notes or upload files before enriching insights"
        });
      }

      let result;
      try {
        result = await enrichFromNotes(
          project.companyName,
          notesInput,
          existingResearch,
          project.sector || undefined
        );
      } catch (aiError: any) {
        return res.status(500).json({ 
          error: "AI enrichment failed",
          details: aiError.message
        });
      }

      // Validate and add new data points with enrichment provenance
      const validKornFerryPillars = [
        "leadership-development", "talent-acquisition", "succession-planning",
        "culture-transformation", "organizational-design", "change-management"
      ];

      const validSolutionAreas = ["ASSESS", "DEVELOP", "TRANSFORM", "REWARD", "COMMERCIAL", "ANALYTICS"];

      // Helper function to normalize text for duplicate detection
      const normalizeText = (text: string): string => {
        return text
          .toLowerCase()
          .trim()
          // Normalize numbers and units
          .replace(/\$\s*/g, 'dollar ')
          .replace(/(\d+)\s*%/g, '$1 percent')
          .replace(/(\d+)\s*(million|m)\b/gi, '$1000000')
          .replace(/(\d+)\s*(billion|b)\b/gi, '$1000000000')
          .replace(/(\d+)\s*(thousand|k)\b/gi, '$1000')
          // Remove common stopwords that don't change meaning
          .replace(/\b(the|a|an|and|or|but|in|on|at|to|for|of|with|by)\b/g, '')
          // Remove punctuation
          .replace(/[^\w\s]/g, '')
          // Normalize whitespace
          .replace(/\s+/g, ' ')
          .trim();
      };

      // Build set of existing data points (normalized) for duplicate detection
      const existingNormalized = new Set<string>();
      for (const existing of existingDataPoints) {
        const normalized = normalizeText(`${existing.label}:${existing.value}`);
        existingNormalized.add(normalized);
      }

      const validatedDataPoints = [];
      for (const dp of result.dataPoints) {
        try {
          // Check for duplicates using normalized text
          const newNormalized = normalizeText(`${dp.label}:${dp.value}`);
          if (existingNormalized.has(newNormalized)) {
            console.log(`Skipping duplicate insight: "${dp.label}"`);
            continue; // Skip this duplicate
          }
          let priorityScore = 4;
          if (typeof dp.priorityScore === 'number' && !isNaN(dp.priorityScore)) {
            if (dp.priorityScore >= 1 && dp.priorityScore <= 5) {
              priorityScore = Math.round(dp.priorityScore);
            }
          }
          
          let kornFerryPillar = null;
          if (dp.kornFerryPillar && validKornFerryPillars.includes(dp.kornFerryPillar)) {
            kornFerryPillar = dp.kornFerryPillar;
          }

          let solutionArea = null;
          if (dp.solutionArea && validSolutionAreas.includes(dp.solutionArea)) {
            solutionArea = dp.solutionArea;
          }

          let relatedKPIs = null;
          if (dp.relatedKPIs && Array.isArray(dp.relatedKPIs)) {
            relatedKPIs = dp.relatedKPIs.filter((kpi: any) => typeof kpi === 'string' && kpi.trim().length > 0);
            if (relatedKPIs.length === 0) {
              relatedKPIs = null;
            }
          }

          let relevantCapability = null;
          if (dp.relevantCapability && typeof dp.relevantCapability === 'string') {
            relevantCapability = dp.relevantCapability.trim();
          }
          
          const validated = insertCompanyDataPointSchema.parse({
            projectId,
            label: dp.label,
            value: dp.value,
            confidence: dp.confidence,
            source: dp.source || "Notes Enrichment",
            sourceUrl: null,
            provenance: { 
              type: "notes_enrichment", 
              model: "gpt-5", 
              timestamp: new Date().toISOString()
            },
            selectedForNotes: false,
            relevantJob: null,
            relevantCapability,
            priorityScore,
            kornFerryPillar,
            solutionArea,
            relatedKPIs
          });
          
          // Add to storage and track in duplicate set
          const newDataPoint = await storage.createCompanyDataPoint(validated);
          validatedDataPoints.push(newDataPoint);
          existingNormalized.add(newNormalized); // Prevent duplicates within this batch
        } catch (validationError: any) {
          console.error("Invalid data point from enrichment AI:", validationError.message, dp);
        }
      }

      // Check if all file processing failed
      if (supportedFilesCount > 0 && fileProcessingErrors.length === supportedFilesCount && validatedDataPoints.length === 0) {
        // All supported files failed to process and no insights extracted
        return res.status(422).json({
          error: "Failed to process uploaded files",
          details: fileProcessingErrors.join("; "),
          suggestion: "Only text files (.txt, .csv, .json) can be analyzed for insights. Make sure your files are in a supported format."
        });
      }

      // Return success with warnings if some files failed
      const count = validatedDataPoints.length;
      let summary = count === 0 
        ? "No new insights found - your research may already be comprehensive!"
        : `Extracted ${count} new insight${count !== 1 ? 's' : ''} from your notes and attachments`;

      // Add warnings if some (but not all) files failed to process
      const warnings = fileProcessingErrors.length > 0 ? fileProcessingErrors : undefined;
      if (warnings && warnings.length > 0) {
        summary += ` (Note: ${warnings.length} file${warnings.length !== 1 ? 's' : ''} could not be processed)`;
      }

      res.json({
        dataPoints: validatedDataPoints,
        summary,
        warnings
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: "An unexpected error occurred",
        details: error.message 
      });
    }
  });

  // Discovery Questions
  app.get("/api/projects/:projectId/discovery-questions", async (req, res) => {
    try {
      const questions = await storage.getDiscoveryQuestions(parseInt(req.params.projectId));
      res.json(questions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/projects/:projectId/discovery-questions/generate", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { mode = "full", solutionArea } = req.body;
      
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Get job themes to determine which insights to use for question generation
      const jobThemes = await storage.getJobThemes(projectId);
      
      if (jobThemes.length === 0) {
        return res.status(400).json({ error: "No job themes found. Please complete the Notes & Evidence step first to identify highlighted priorities." });
      }

      // Collect all insight IDs referenced in job themes
      const jobThemeInsightIds = new Set<number>();
      for (const theme of jobThemes) {
        if (theme.sourceInsightIds) {
          for (const id of theme.sourceInsightIds) {
            jobThemeInsightIds.add(id);
          }
        }
      }

      // Get ALL research insights for the company (not just those linked to job themes)
      const allDataPoints = await storage.getCompanyDataPoints(projectId);
      
      // Use all available research data - prioritize by score and recency
      const allResearchInsights = allDataPoints
        .filter(dp => dp.value && dp.value.length > 10) // Filter out empty/trivial insights
        .sort((a, b) => {
          // Sort by priority score (higher first), then by date (newer first)
          const scoreDiff = (b.priorityScore || 0) - (a.priorityScore || 0);
          if (scoreDiff !== 0) return scoreDiff;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
        .slice(0, 30); // Limit to top 30 most relevant insights
      
      // Use job theme linked insights as primary, but add ALL research insights as context
      let jobThemeInsights = jobThemeInsightIds.size > 0 
        ? allDataPoints.filter(dp => jobThemeInsightIds.has(dp.id))
        : [];
      
      // If no insights linked to job themes, use ALL research insights + job theme names
      if (jobThemeInsights.length === 0) {
        // Start with all research insights
        jobThemeInsights = allResearchInsights.length > 0 ? allResearchInsights : [];
        
        // Add synthetic insights from job theme names if no research at all
        if (jobThemeInsights.length === 0) {
          jobThemeInsights = jobThemes.map((theme, idx) => ({
            id: -1 - idx,
            projectId,
            label: theme.jobName,
            value: theme.aggregationSummary || `Priority area: ${theme.jobName}`,
            confidence: "high" as const,
            source: "job_theme",
            relevantCapability: theme.capabilityName,
            priority: theme.priorityRank || 1,
            isFollowUp: false,
            relatedKPIs: null,
            aiGenerated: false,
            createdAt: new Date(),
            solutionArea: theme.solutionArea || null,
            provenance: null,
            sourceUrl: null,
            kornferryBenchmark: null,
            followUpQuestion: null,
            category: null,
            sentimentScore: null,
            selectedForNotes: false,
            relevantJob: null,
            priorityScore: 0,
            kornFerryPillar: null
          }));
        }
      } else {
        // Add research insights that aren't already in job themes as additional context
        const existingIds = new Set(jobThemeInsights.map(i => i.id));
        const additionalInsights = allResearchInsights.filter(i => !existingIds.has(i.id));
        jobThemeInsights = [...jobThemeInsights, ...additionalInsights.slice(0, 15)];
      }

      // Filter by solution area if in focused mode
      if (mode === "focused" && solutionArea) {
        jobThemeInsights = jobThemeInsights.filter(insight => 
          insight.solutionArea === solutionArea || 
          (insight.relevantCapability && insight.relevantCapability.toUpperCase().includes(solutionArea.toUpperCase()))
        );
        
        if (jobThemeInsights.length === 0) {
          return res.status(400).json({ 
            error: `No insights found for solution area "${solutionArea}". Try using full discovery mode.` 
          });
        }
      }

      // Group by capability
      const capabilityGroups = new Map<string, typeof jobThemeInsights>();
      for (const insight of jobThemeInsights) {
        if (insight.relevantCapability) {
          const existing = capabilityGroups.get(insight.relevantCapability) || [];
          existing.push(insight);
          capabilityGroups.set(insight.relevantCapability, existing);
        }
      }

      if (capabilityGroups.size === 0) {
        return res.status(400).json({ error: "Job theme insights must have capability classification" });
      }

      // Prepare input for AI with mode context
      const capabilityQuestions = Array.from(capabilityGroups.entries()).map(([capability, insights]) => ({
        capability,
        insights: insights.map(i => ({
          label: i.label,
          value: i.value,
          relatedKPIs: i.relatedKPIs as string[] || undefined
        }))
      }));

      // Get enriched context from artifacts and Green Sheet
      const enrichedContext = await getEnrichedDiscoveryContext(projectId, storage);
      
      // Build enhanced description with enriched context
      const enhancedDescription = enrichedContext.combinedContext 
        ? `${project.description || 'No company description available.'}${enrichedContext.combinedContext}`
        : project.description;
      
      // Generate questions with AI - include company context and enriched discovery materials
      let generatedQuestions;
      try {
        generatedQuestions = await generateDiscoveryQuestions(
          project.companyName, 
          capabilityQuestions,
          {
            sector: project.sector,
            industry: project.industry,
            employeeCount: project.employeeCount,
            revenue: project.revenue,
            headquarters: project.headquarters,
            description: enhancedDescription
          }
        );
      } catch (aiError: any) {
        return res.status(500).json({ 
          error: "AI question generation failed",
          details: aiError.message
        });
      }

      // Delete existing AI-generated questions for this project
      const existingQuestions = await storage.getDiscoveryQuestions(projectId);
      const aiQuestions = existingQuestions.filter(q => !q.isTemplate);
      for (const q of aiQuestions) {
        await storage.deleteDiscoveryQuestion(q.id);
      }

      // Save new questions
      const savedQuestions = [];
      let sortOrder = 0;
      for (const [capabilityName, questions] of Object.entries(generatedQuestions)) {
        for (const q of questions) {
          try {
            const validated = insertDiscoveryQuestionSchema.parse({
              projectId,
              capabilityName,
              question: q.question,
              questionType: q.questionType,
              methodology: q.methodology || null,
              methodologyStage: q.methodologyStage || null,
              purpose: q.purpose,
              relatedKPI: q.relatedKPI,
              followUpHint: q.followUpHint || null,
              answer: null,
              isAsked: false,
              notes: null,
              isTemplate: false,
              sortOrder: sortOrder++
            });
            savedQuestions.push(await storage.createDiscoveryQuestion(validated));
          } catch (validationError: any) {
            console.error("Invalid question from AI:", validationError.message, q);
          }
        }
      }

      const modeLabel = mode === "focused" && solutionArea 
        ? `focused on ${solutionArea}` 
        : "across all Korn Ferry solutions";
      
      res.json({
        questions: savedQuestions,
        summary: `Generated ${savedQuestions.length} discovery questions ${modeLabel} (${capabilityGroups.size} capabilities)`
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: "An unexpected error occurred",
        details: error.message 
      });
    }
  });

  app.patch("/api/discovery-questions/:id", async (req, res) => {
    try {
      const validated = updateDiscoveryQuestionSchema.parse(req.body);
      const question = await storage.updateDiscoveryQuestion(parseInt(req.params.id), validated);
      if (!question) {
        return res.status(404).json({ error: "Discovery question not found" });
      }
      res.json(question);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/discovery-questions/:id", async (req, res) => {
    try {
      await storage.deleteDiscoveryQuestion(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Attachments (file uploads and voice notes)
  app.get("/api/projects/:projectId/attachments", async (req, res) => {
    try {
      const attachments = await storage.getAttachments(parseInt(req.params.projectId));
      res.json(attachments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/projects/:projectId/attachments", async (req, res) => {
    try {
      const parsed = insertAttachmentSchema.parse({
        ...req.body,
        projectId: parseInt(req.params.projectId),
      });

      // Validate file attachments
      if (parsed.type === "file") {
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        const ALLOWED_MIME_TYPES = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
          'text/csv',
          'image/jpeg',
          'image/png',
          'image/gif',
        ];

        if (!parsed.fileName || !parsed.mimeType || !parsed.content) {
          return res.status(400).json({ error: "File name, MIME type, and content are required for file attachments" });
        }

        if (!ALLOWED_MIME_TYPES.includes(parsed.mimeType)) {
          return res.status(400).json({ error: "File type not allowed. Supported types: PDF, Word, Excel, text files, and images" });
        }

        if (parsed.fileSize && parsed.fileSize > MAX_FILE_SIZE) {
          return res.status(400).json({ error: "File size exceeds maximum limit of 10MB" });
        }

        // Validate base64 content
        if (!parsed.content.startsWith('data:')) {
          return res.status(400).json({ error: "Invalid file data format" });
        }
      }

      // Validate voice transcriptions
      if (parsed.type === "voice") {
        if (!parsed.content || parsed.content.trim().length === 0) {
          return res.status(400).json({ error: "Voice transcription cannot be empty" });
        }
        if (parsed.content.length > 10000) {
          return res.status(400).json({ error: "Voice transcription too long (max 10,000 characters)" });
        }
      }

      const attachment = await storage.createAttachment(parsed);
      res.json(attachment);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/attachments/:id", async (req, res) => {
    try {
      await storage.deleteAttachment(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Company Data Points
  app.get("/api/projects/:projectId/data-points", async (req, res) => {
    try {
      const dataPoints = await storage.getCompanyDataPoints(parseInt(req.params.projectId));
      res.json(dataPoints);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/projects/:projectId/data-points", async (req, res) => {
    try {
      const validated = insertCompanyDataPointSchema.parse({
        ...req.body,
        projectId: parseInt(req.params.projectId)
      });
      const dataPoint = await storage.createCompanyDataPoint(validated);
      res.json(dataPoint);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/data-points/:id", async (req, res) => {
    try {
      const validated = insertCompanyDataPointSchema.partial().parse(req.body);
      const dataPoint = await storage.updateCompanyDataPoint(parseInt(req.params.id), validated);
      if (!dataPoint) {
        return res.status(404).json({ error: "Data point not found" });
      }
      res.json(dataPoint);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/data-points/:id", async (req, res) => {
    try {
      await storage.deleteCompanyDataPoint(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Headlines
  app.get("/api/projects/:projectId/headlines", async (req, res) => {
    try {
      const headlines = await storage.getHeadlines(parseInt(req.params.projectId));
      res.json(headlines);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/projects/:projectId/headlines", async (req, res) => {
    try {
      const validated = insertHeadlineSchema.parse({
        ...req.body,
        projectId: parseInt(req.params.projectId)
      });
      const headline = await storage.createHeadline(validated);
      res.json(headline);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/headlines/:id", async (req, res) => {
    try {
      await storage.deleteHeadline(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Discovery Notes
  app.get("/api/projects/:projectId/discovery-notes", async (req, res) => {
    try {
      const notes = await storage.getDiscoveryNotes(parseInt(req.params.projectId));
      res.json(notes || {});
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/projects/:projectId/discovery-notes", async (req, res) => {
    try {
      const validated = insertDiscoveryNotesSchema.parse({
        ...req.body,
        projectId: parseInt(req.params.projectId)
      });
      const notes = await storage.upsertDiscoveryNotes(validated);
      res.json(notes);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Value Cases
  app.get("/api/projects/:projectId/value-cases", async (req, res) => {
    try {
      const valueCases = await storage.getValueCases(parseInt(req.params.projectId));
      res.json(valueCases);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/value-cases/:id", async (req, res) => {
    try {
      const valueCase = await storage.getValueCase(parseInt(req.params.id));
      if (!valueCase) {
        return res.status(404).json({ error: "Value case not found" });
      }
      res.json(valueCase);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/projects/:projectId/value-cases", async (req, res) => {
    try {
      const validated = insertValueCaseSchema.parse({
        ...req.body,
        projectId: parseInt(req.params.projectId)
      });
      const valueCase = await storage.createValueCase(validated);
      res.json(valueCase);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/value-cases/:id", async (req, res) => {
    try {
      const validated = insertValueCaseSchema.partial().parse(req.body);
      const valueCase = await storage.updateValueCase(parseInt(req.params.id), validated);
      if (!valueCase) {
        return res.status(404).json({ error: "Value case not found" });
      }
      res.json(valueCase);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/value-cases/:id", async (req, res) => {
    try {
      await storage.deleteValueCase(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI-powered Value Case Recommendations
  app.post("/api/projects/:projectId/value-cases/generate-recommendations", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Get project info
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Get discovery phase transfer
      const transfer = await storage.getDiscoveryPhaseTransfer(projectId);
      if (!transfer || !transfer.isFinalized) {
        return res.status(400).json({ 
          error: "Discovery phase must be finalized before generating value case recommendations" 
        });
      }
      
      // Get finalized job themes with KPIs
      const finalizedJobIds = transfer.finalizedJobThemeIds || [];
      if (finalizedJobIds.length === 0) {
        return res.status(400).json({ 
          error: "No finalized jobs found. Please complete the Discovery phase first." 
        });
      }
      
      const jobsWithKPIs = [];
      for (const jobId of finalizedJobIds) {
        const job = await storage.getJobTheme(jobId);
        if (job) {
          const kpis = await storage.getJobThemeKPIs(jobId);
          jobsWithKPIs.push({
            ...job,
            kpis: kpis
          });
        }
      }
      
      // Sort by priority rank
      jobsWithKPIs.sort((a, b) => (a.priorityRank || 999) - (b.priorityRank || 999));
      
      // Generate AI recommendations
      const recommendations = await generateValueCaseRecommendations(
        project.companyName,
        project.sector || "General Business",
        jobsWithKPIs
      );
      
      res.json(recommendations);
    } catch (error: any) {
      console.error("[Value Case Recommendations] Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate value case recommendations" });
    }
  });

  // KPI-based Value Case Recommendations (AI-powered)
  app.post("/api/projects/:projectId/kpi-value-cases", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const { kpiName, kpiDescription, pillar, category, unit, baseline, target, benchmarkRange } = req.body;
      
      if (!kpiName || !kpiDescription || !pillar) {
        return res.status(400).json({ error: "Missing required fields: kpiName, kpiDescription, pillar" });
      }
      
      const recommendations = await generateKPIValueCaseRecommendations({
        kpiName,
        kpiDescription,
        pillar,
        category: category || "General",
        unit: unit || "",
        baseline,
        target,
        benchmarkRange,
        companyName: project.companyName,
        industry: project.sector || "General Business"
      });
      
      res.json(recommendations);
    } catch (error: any) {
      console.error("[KPI Value Case Recommendations] Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate recommendations" });
    }
  });

  // Strategic Challenges
  app.get("/api/projects/:projectId/strategic-challenges", async (req, res) => {
    try {
      const challenges = await storage.getStrategicChallenges(parseInt(req.params.projectId));
      res.json(challenges);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/projects/:projectId/strategic-challenges", async (req, res) => {
    try {
      const validated = insertStrategicChallengeSchema.parse({
        ...req.body,
        projectId: parseInt(req.params.projectId)
      });
      const challenge = await storage.createStrategicChallenge(validated);
      res.json(challenge);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/strategic-challenges/:id", async (req, res) => {
    try {
      const validated = insertStrategicChallengeSchema.partial().parse(req.body);
      const challenge = await storage.updateStrategicChallenge(parseInt(req.params.id), validated);
      if (!challenge) {
        return res.status(404).json({ error: "Strategic challenge not found" });
      }
      res.json(challenge);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Baselines
  app.get("/api/projects/:projectId/baseline", async (req, res) => {
    try {
      const baseline = await storage.getBaseline(parseInt(req.params.projectId));
      res.json(baseline || {});
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/projects/:projectId/baseline", async (req, res) => {
    try {
      const validated = insertBaselineSchema.parse({
        ...req.body,
        projectId: parseInt(req.params.projectId)
      });
      const baseline = await storage.createBaseline(validated);
      res.json(baseline);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/baselines/:id", async (req, res) => {
    try {
      const validated = insertBaselineSchema.partial().parse(req.body);
      const baseline = await storage.updateBaseline(parseInt(req.params.id), validated);
      if (!baseline) {
        return res.status(404).json({ error: "Baseline not found" });
      }
      res.json(baseline);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/baselines/:id", async (req, res) => {
    try {
      await storage.deleteBaseline(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // KPIs
  app.get("/api/projects/:projectId/kpis", async (req, res) => {
    try {
      const kpis = await storage.getKpis(parseInt(req.params.projectId));
      res.json(kpis);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/kpis/:id", async (req, res) => {
    try {
      const kpi = await storage.getKpi(parseInt(req.params.id));
      if (!kpi) {
        return res.status(404).json({ error: "KPI not found" });
      }
      res.json(kpi);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/projects/:projectId/kpis", async (req, res) => {
    try {
      const validated = insertKpiSchema.parse({
        ...req.body,
        projectId: parseInt(req.params.projectId)
      });
      const kpi = await storage.createKpi(validated);
      res.json(kpi);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/kpis/:id", async (req, res) => {
    try {
      const validated = insertKpiSchema.partial().parse(req.body);
      const kpi = await storage.updateKpi(parseInt(req.params.id), validated);
      if (!kpi) {
        return res.status(404).json({ error: "KPI not found" });
      }
      res.json(kpi);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/kpis/:id", async (req, res) => {
    try {
      await storage.deleteKpi(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // KPI Readings
  app.get("/api/kpis/:kpiId/readings", async (req, res) => {
    try {
      const readings = await storage.getKpiReadings(parseInt(req.params.kpiId));
      res.json(readings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/kpis/:kpiId/readings", async (req, res) => {
    try {
      const validated = insertKpiReadingSchema.parse({
        ...req.body,
        kpiId: parseInt(req.params.kpiId)
      });
      const reading = await storage.createKpiReading(validated);
      res.json(reading);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/kpi-readings/:id", async (req, res) => {
    try {
      await storage.deleteKpiReading(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Interventions
  app.get("/api/projects/:projectId/interventions", async (req, res) => {
    try {
      const interventions = await storage.getInterventions(parseInt(req.params.projectId));
      res.json(interventions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/projects/:projectId/interventions", async (req, res) => {
    try {
      const validated = insertInterventionSchema.parse({
        ...req.body,
        projectId: parseInt(req.params.projectId)
      });
      const intervention = await storage.createIntervention(validated);
      res.json(intervention);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/interventions/:id", async (req, res) => {
    try {
      const validated = insertInterventionSchema.partial().parse(req.body);
      const intervention = await storage.updateIntervention(parseInt(req.params.id), validated);
      if (!intervention) {
        return res.status(404).json({ error: "Intervention not found" });
      }
      res.json(intervention);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/interventions/:id", async (req, res) => {
    try {
      await storage.deleteIntervention(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Financial Projections
  app.get("/api/projects/:projectId/financial-projections", async (req, res) => {
    try {
      const scenario = req.query.scenario as string | undefined;
      const projections = await storage.getFinancialProjections(parseInt(req.params.projectId), scenario);
      res.json(projections);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/projects/:projectId/financial-projections", async (req, res) => {
    try {
      const validated = insertFinancialProjectionSchema.parse({
        ...req.body,
        projectId: parseInt(req.params.projectId)
      });
      const projection = await storage.createFinancialProjection(validated);
      res.json(projection);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/financial-projections/:id", async (req, res) => {
    try {
      const validated = insertFinancialProjectionSchema.partial().parse(req.body);
      const projection = await storage.updateFinancialProjection(parseInt(req.params.id), validated);
      if (!projection) {
        return res.status(404).json({ error: "Financial projection not found" });
      }
      res.json(projection);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/financial-projections/:id", async (req, res) => {
    try {
      await storage.deleteFinancialProjection(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Evidence Documents
  app.get("/api/projects/:projectId/evidence-documents", async (req, res) => {
    try {
      const documents = await storage.getEvidenceDocuments(parseInt(req.params.projectId));
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/projects/:projectId/evidence-documents", async (req, res) => {
    try {
      const validated = insertEvidenceDocumentSchema.parse({
        ...req.body,
        projectId: parseInt(req.params.projectId)
      });
      const document = await storage.createEvidenceDocument(validated);
      res.json(document);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/evidence-documents/:id", async (req, res) => {
    try {
      await storage.deleteEvidenceDocument(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Analytics Reviews
  app.get("/api/projects/:projectId/analytics-reviews", async (req, res) => {
    try {
      const reviews = await storage.getAnalyticsReviews(parseInt(req.params.projectId));
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics-reviews/:id", async (req, res) => {
    try {
      const review = await storage.getAnalyticsReview(parseInt(req.params.id));
      if (!review) {
        return res.status(404).json({ error: "Analytics review not found" });
      }
      res.json(review);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/projects/:projectId/analytics-reviews", async (req, res) => {
    try {
      const validated = insertAnalyticsReviewSchema.parse({
        ...req.body,
        projectId: parseInt(req.params.projectId)
      });
      const review = await storage.createAnalyticsReview(validated);
      res.json(review);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/analytics-reviews/:id", async (req, res) => {
    try {
      const validated = insertAnalyticsReviewSchema.partial().parse(req.body);
      const review = await storage.updateAnalyticsReview(parseInt(req.params.id), validated);
      if (!review) {
        return res.status(404).json({ error: "Analytics review not found" });
      }
      res.json(review);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/analytics-reviews/:id", async (req, res) => {
    try {
      await storage.deleteAnalyticsReview(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Responsible AI Checklists
  app.get("/api/projects/:projectId/responsible-ai-checklists", async (req, res) => {
    try {
      const checklists = await storage.getResponsibleAiChecklists(parseInt(req.params.projectId));
      res.json(checklists);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/responsible-ai-checklists/:id", async (req, res) => {
    try {
      const checklist = await storage.getResponsibleAiChecklist(parseInt(req.params.id));
      if (!checklist) {
        return res.status(404).json({ error: "Responsible AI checklist not found" });
      }
      res.json(checklist);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/projects/:projectId/responsible-ai-checklists", async (req, res) => {
    try {
      const validated = insertResponsibleAiChecklistSchema.parse({
        ...req.body,
        projectId: parseInt(req.params.projectId)
      });
      const checklist = await storage.createResponsibleAiChecklist(validated);
      res.json(checklist);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/responsible-ai-checklists/:id", async (req, res) => {
    try {
      const validated = insertResponsibleAiChecklistSchema.partial().parse(req.body);
      const checklist = await storage.updateResponsibleAiChecklist(parseInt(req.params.id), validated);
      if (!checklist) {
        return res.status(404).json({ error: "Responsible AI checklist not found" });
      }
      res.json(checklist);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/responsible-ai-checklists/:id", async (req, res) => {
    try {
      await storage.deleteResponsibleAiChecklist(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI-Assisted Company Research
  app.post("/api/projects/:projectId/research-company", async (req, res) => {
    try {
      const { companyName } = req.body;
      
      if (!companyName) {
        return res.status(400).json({ error: "Company name is required" });
      }

      // This will be implemented in the next task with OpenAI integration
      res.json({ message: "AI research feature coming soon" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Shared Questionnaires - Client Collaboration
  
  // Share questionnaire with client
  app.post("/api/projects/:projectId/share-questionnaire", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { clientName, clientEmail } = req.body;
      
      // Check if project exists
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Check if questions exist
      const questions = await storage.getDiscoveryQuestions(projectId);
      if (questions.length === 0) {
        return res.status(400).json({ error: "No discovery questions to share. Generate questions first." });
      }
      
      // Generate unique share token
      const crypto = await import('crypto');
      const shareToken = crypto.randomBytes(16).toString('hex');
      
      // Create shared questionnaire
      const sharedQuestionnaire = await storage.createSharedQuestionnaire({
        projectId,
        shareToken,
        clientName: clientName || null,
        clientEmail: clientEmail || null,
        status: "active"
      });
      
      res.json(sharedQuestionnaire);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get shared questionnaire status
  app.get("/api/projects/:projectId/shared-questionnaire", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const sharedQuestionnaire = await storage.getSharedQuestionnaire(projectId);
      res.json(sharedQuestionnaire || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Public endpoint: Get questionnaire by token (for clients)
  app.get("/api/questionnaire/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      // Get shared questionnaire
      const sharedQuestionnaire = await storage.getSharedQuestionnaireByToken(token);
      if (!sharedQuestionnaire) {
        return res.status(404).json({ error: "Questionnaire not found or expired" });
      }
      
      if (sharedQuestionnaire.status !== "active") {
        return res.status(410).json({ error: "This questionnaire is no longer active" });
      }
      
      // Get project details
      const project = await storage.getProject(sharedQuestionnaire.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Get discovery questions
      const questions = await storage.getDiscoveryQuestions(sharedQuestionnaire.projectId);
      
      // Get existing responses
      const responses = await storage.getQuestionResponsesByQuestionnaire(sharedQuestionnaire.id);
      
      res.json({
        project: {
          name: project.name,
          companyName: project.companyName,
          companyLogoUrl: project.companyLogoUrl
        },
        sharedQuestionnaire,
        questions,
        responses
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Public endpoint: Submit client responses
  app.post("/api/questionnaire/:token/responses", async (req, res) => {
    try {
      const { token } = req.params;
      const { questionId, answer, respondentName } = req.body;
      
      // Validate input
      if (!questionId || !answer) {
        return res.status(400).json({ error: "Question ID and answer are required" });
      }
      
      // Get shared questionnaire
      const sharedQuestionnaire = await storage.getSharedQuestionnaireByToken(token);
      if (!sharedQuestionnaire) {
        return res.status(404).json({ error: "Questionnaire not found" });
      }
      
      if (sharedQuestionnaire.status !== "active") {
        return res.status(410).json({ error: "This questionnaire is no longer active" });
      }
      
      // Create response
      const response = await storage.createQuestionResponse({
        questionId,
        sharedQuestionnaireId: sharedQuestionnaire.id,
        respondentType: "client",
        respondentName: respondentName || null,
        answer
      });
      
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get all responses for a project's shared questionnaire
  app.get("/api/projects/:projectId/questionnaire-responses", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Get shared questionnaire
      const sharedQuestionnaire = await storage.getSharedQuestionnaire(projectId);
      if (!sharedQuestionnaire) {
        return res.json([]);
      }
      
      // Get all responses
      const responses = await storage.getQuestionResponsesByQuestionnaire(sharedQuestionnaire.id);
      res.json(responses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Consultant submits response
  app.post("/api/projects/:projectId/consultant-response", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Validate request body
      const bodySchema = z.object({
        questionId: z.number(),
        response: z.string().min(1)
      });
      
      const validated = bodySchema.safeParse(req.body);
      if (!validated.success) {
        return res.status(400).json({ error: "Invalid request body", details: validated.error });
      }
      
      const { questionId, response: answer } = validated.data;
      
      // Verify the question belongs to this project (security check)
      const question = await storage.getDiscoveryQuestionById(questionId);
      if (!question || question.projectId !== projectId) {
        return res.status(403).json({ error: "Question does not belong to this project" });
      }
      
      // Get or create shared questionnaire
      let sharedQuestionnaire = await storage.getSharedQuestionnaire(projectId);
      if (!sharedQuestionnaire) {
        const crypto = await import('crypto');
        const shareToken = crypto.randomBytes(16).toString('hex');
        sharedQuestionnaire = await storage.createSharedQuestionnaire({
          projectId,
          shareToken,
          status: "active"
        });
      }
      
      // Create consultant response
      const response = await storage.createQuestionResponse({
        questionId,
        sharedQuestionnaireId: sharedQuestionnaire.id,
        respondentType: "consultant",
        answer
      });
      
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // STRATEGIC PILLARS (ORGANIZATIONAL PRIORITIES)
  // ============================================

  // Get all strategic pillars for a project (with objectives)
  app.get("/api/projects/:projectId/strategic-pillars", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const pillars = await storage.getStrategicPillars(projectId);
      
      // Fetch objectives for each pillar
      const pillarsWithObjectives = await Promise.all(
        pillars.map(async (pillar) => ({
          ...pillar,
          objectives: await storage.getPillarObjectives(pillar.id)
        }))
      );
      
      res.json(pillarsWithObjectives);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get a single strategic pillar
  app.get("/api/strategic-pillars/:pillarId", async (req, res) => {
    try {
      const pillarId = parseInt(req.params.pillarId);
      const pillar = await storage.getStrategicPillar(pillarId);
      if (!pillar) {
        return res.status(404).json({ error: "Strategic pillar not found" });
      }
      res.json(pillar);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new strategic pillar
  app.post("/api/projects/:projectId/strategic-pillars", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const validatedData = insertStrategicPillarSchema.parse({
        ...req.body,
        projectId
      });

      const pillar = await storage.createStrategicPillar(validatedData);
      res.status(201).json(pillar);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Update a strategic pillar
  app.patch("/api/strategic-pillars/:pillarId", async (req, res) => {
    try {
      const pillarId = parseInt(req.params.pillarId);
      const existing = await storage.getStrategicPillar(pillarId);
      if (!existing) {
        return res.status(404).json({ error: "Strategic pillar not found" });
      }

      const pillar = await storage.updateStrategicPillar(pillarId, req.body);
      res.json(pillar);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete a strategic pillar
  app.delete("/api/strategic-pillars/:pillarId", async (req, res) => {
    try {
      const pillarId = parseInt(req.params.pillarId);
      const existing = await storage.getStrategicPillar(pillarId);
      if (!existing) {
        return res.status(404).json({ error: "Strategic pillar not found" });
      }

      await storage.deleteStrategicPillar(pillarId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // PILLAR OBJECTIVES (BUSINESS OKRS)
  // ============================================

  // Get all objectives for a pillar
  app.get("/api/strategic-pillars/:pillarId/objectives", async (req, res) => {
    try {
      const pillarId = parseInt(req.params.pillarId);
      const objectives = await storage.getPillarObjectives(pillarId);
      res.json(objectives);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all objectives for a project
  app.get("/api/projects/:projectId/pillar-objectives", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const objectives = await storage.getAllPillarObjectivesForProject(projectId);
      res.json(objectives);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new objective
  app.post("/api/strategic-pillars/:pillarId/objectives", async (req, res) => {
    try {
      const pillarId = parseInt(req.params.pillarId);
      const pillar = await storage.getStrategicPillar(pillarId);
      if (!pillar) {
        return res.status(404).json({ error: "Strategic pillar not found" });
      }

      const validatedData = insertPillarObjectiveSchema.parse({
        ...req.body,
        pillarId
      });

      const objective = await storage.createPillarObjective(validatedData);
      res.status(201).json(objective);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Update an objective
  app.patch("/api/pillar-objectives/:objectiveId", async (req, res) => {
    try {
      const objectiveId = parseInt(req.params.objectiveId);
      const existing = await storage.getPillarObjective(objectiveId);
      if (!existing) {
        return res.status(404).json({ error: "Objective not found" });
      }

      const objective = await storage.updatePillarObjective(objectiveId, req.body);
      res.json(objective);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete an objective
  app.delete("/api/pillar-objectives/:objectiveId", async (req, res) => {
    try {
      const objectiveId = parseInt(req.params.objectiveId);
      const existing = await storage.getPillarObjective(objectiveId);
      if (!existing) {
        return res.status(404).json({ error: "Objective not found" });
      }

      await storage.deletePillarObjective(objectiveId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // PILLAR OKR THEME LINKS
  // ============================================

  // Get the static list of Enterprise OKR Themes (from knowledge base)
  app.get("/api/okr-themes", async (_req, res) => {
    try {
      const { ENTERPRISE_OKR_THEMES } = await import("@shared/knowledge");
      res.json(ENTERPRISE_OKR_THEMES);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get OKR theme links for a pillar
  app.get("/api/strategic-pillars/:pillarId/okr-themes", async (req, res) => {
    try {
      const pillarId = parseInt(req.params.pillarId);
      const pillar = await storage.getStrategicPillar(pillarId);
      if (!pillar) {
        return res.status(404).json({ error: "Strategic pillar not found" });
      }
      const themes = await storage.getPillarOkrThemes(pillarId);
      res.json(themes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all OKR theme links for a project
  app.get("/api/projects/:projectId/pillar-okr-themes", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const themes = await storage.getAllPillarOkrThemesForProject(projectId);
      res.json(themes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create an OKR theme link for a pillar
  app.post("/api/strategic-pillars/:pillarId/okr-themes", async (req, res) => {
    try {
      const pillarId = parseInt(req.params.pillarId);
      const pillar = await storage.getStrategicPillar(pillarId);
      if (!pillar) {
        return res.status(404).json({ error: "Strategic pillar not found" });
      }

      const { okrThemeId } = req.body;
      if (!okrThemeId) {
        return res.status(400).json({ error: "okrThemeId is required" });
      }

      // Verify the theme exists in the knowledge base
      const { ENTERPRISE_OKR_THEMES } = await import("@shared/knowledge");
      const theme = ENTERPRISE_OKR_THEMES.find((t: { id: string }) => t.id === okrThemeId);
      if (!theme) {
        return res.status(400).json({ error: "Invalid OKR theme ID" });
      }

      const link = await storage.createPillarOkrTheme({
        pillarId,
        okrThemeId
      });
      res.status(201).json(link);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete an OKR theme link
  app.delete("/api/pillar-okr-themes/:linkId", async (req, res) => {
    try {
      const linkId = parseInt(req.params.linkId);
      await storage.deletePillarOkrTheme(linkId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update all OKR theme links for a pillar (replace operation)
  app.put("/api/strategic-pillars/:pillarId/okr-themes", async (req, res) => {
    try {
      const pillarId = parseInt(req.params.pillarId);
      const pillar = await storage.getStrategicPillar(pillarId);
      if (!pillar) {
        return res.status(404).json({ error: "Strategic pillar not found" });
      }

      const { okrThemeIds } = req.body;
      if (!Array.isArray(okrThemeIds)) {
        return res.status(400).json({ error: "okrThemeIds must be an array" });
      }

      // Verify all themes exist
      const { ENTERPRISE_OKR_THEMES } = await import("@shared/knowledge");
      const validThemeIds = ENTERPRISE_OKR_THEMES.map((t: { id: string }) => t.id);
      for (const okrThemeId of okrThemeIds) {
        if (!validThemeIds.includes(okrThemeId)) {
          return res.status(400).json({ error: `Invalid OKR theme ID: ${okrThemeId}` });
        }
      }

      // Delete existing links and create new ones
      await storage.deletePillarOkrThemesByPillar(pillarId);
      const links = [];
      for (const okrThemeId of okrThemeIds) {
        const link = await storage.createPillarOkrTheme({ pillarId, okrThemeId });
        links.push(link);
      }
      res.json(links);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // PILLAR SHARE LINKS (CLIENT COLLABORATION)
  // ============================================

  // Get share link for a project's pillars
  app.get("/api/projects/:projectId/pillar-share-link", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const link = await storage.getPillarShareLink(projectId);
      res.json(link || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create a share link
  app.post("/api/projects/:projectId/pillar-share-link", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Generate a secure token
      const token = crypto.randomBytes(32).toString("hex");

      const validatedData = insertPillarShareLinkSchema.parse({
        projectId,
        token,
        permissions: req.body.permissions || "edit",
        customerName: req.body.customerName,
        customerEmail: req.body.customerEmail,
        expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
        status: "active"
      });

      const link = await storage.createPillarShareLink(validatedData);
      res.status(201).json(link);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Access shared pillars via token (for customers)
  app.get("/api/shared-pillars/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const link = await storage.getPillarShareLinkByToken(token);
      
      if (!link || link.status !== "active") {
        return res.status(404).json({ error: "Share link not found or expired" });
      }

      // Check expiration
      if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
        return res.status(410).json({ error: "Share link has expired" });
      }

      // Update last accessed timestamp
      await storage.updatePillarShareLink(link.id, { lastAccessedAt: new Date() });

      // Get project and pillars with objectives
      const project = await storage.getProject(link.projectId);
      const pillars = await storage.getStrategicPillars(link.projectId);
      
      // Get objectives for each pillar
      const pillarsWithObjectives = await Promise.all(
        pillars.map(async (pillar) => ({
          ...pillar,
          objectives: await storage.getPillarObjectives(pillar.id)
        }))
      );

      res.json({
        project: project ? { id: project.id, name: project.name, companyName: project.companyName } : null,
        pillars: pillarsWithObjectives,
        shareLink: {
          permissions: link.permissions,
          customerName: link.customerName
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update pillar via shared link (customer edits)
  app.patch("/api/shared-pillars/:token/pillars/:pillarId", async (req, res) => {
    try {
      const { token, pillarId } = req.params;
      const link = await storage.getPillarShareLinkByToken(token);
      
      if (!link || link.status !== "active") {
        return res.status(404).json({ error: "Share link not found or expired" });
      }

      if (link.permissions !== "edit") {
        return res.status(403).json({ error: "View-only access" });
      }

      // Check expiration
      if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
        return res.status(410).json({ error: "Share link has expired" });
      }

      const pillar = await storage.getStrategicPillar(parseInt(pillarId));
      if (!pillar || pillar.projectId !== link.projectId) {
        return res.status(404).json({ error: "Pillar not found" });
      }

      const updated = await storage.updateStrategicPillar(parseInt(pillarId), req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Revoke a share link
  app.delete("/api/projects/:projectId/pillar-share-link/:linkId", async (req, res) => {
    try {
      const linkId = parseInt(req.params.linkId);
      await storage.updatePillarShareLink(linkId, { status: "revoked" });
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // LINK JOBS TO STRATEGIC PILLARS
  // ============================================

  // Update job theme to link it to a pillar
  app.patch("/api/job-themes/:jobThemeId/pillar-link", async (req, res) => {
    try {
      const jobThemeId = parseInt(req.params.jobThemeId);
      const { pillarId, pillarLinkageNarrative } = req.body;

      const jobTheme = await storage.getJobTheme(jobThemeId);
      if (!jobTheme) {
        return res.status(404).json({ error: "Job theme not found" });
      }

      // If pillarId is provided, verify the pillar exists and belongs to the same project
      if (pillarId) {
        const pillar = await storage.getStrategicPillar(pillarId);
        if (!pillar) {
          return res.status(404).json({ error: "Strategic pillar not found" });
        }
        if (pillar.projectId !== jobTheme.projectId) {
          return res.status(400).json({ error: "Pillar must belong to the same project" });
        }
      }

      const updated = await storage.updateJobTheme(jobThemeId, { 
        pillarId, 
        pillarLinkageNarrative 
      });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI-powered auto-assignment of jobs to strategic pillars
  app.post("/api/projects/:projectId/job-themes/auto-assign-pillars", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Get project info
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Get all jobs and pillars for this project
      const [jobThemes, pillars] = await Promise.all([
        storage.getJobThemes(projectId),
        storage.getStrategicPillars(projectId)
      ]);

      if (jobThemes.length === 0) {
        return res.status(400).json({ error: "No jobs found. Please generate jobs first." });
      }

      if (pillars.length === 0) {
        return res.status(400).json({ error: "No strategic pillars found. Please create pillars first." });
      }

      // Get objectives for each pillar and transform to AI-friendly format
      const pillarsWithObjectives = await Promise.all(
        pillars.map(async (pillar) => {
          const objectives = await storage.getPillarObjectives(pillar.id);
          return {
            id: pillar.id,
            name: pillar.name,
            description: pillar.description,
            objectives: objectives.map(o => ({
              objective: o.objective,
              keyResults: Array.isArray(o.keyResults) 
                ? (o.keyResults as Array<{ result: string; target: string }>)
                : []
            }))
          };
        })
      );

      // Prepare jobs for AI (filter to unassigned or get all based on request)
      const { reassignAll = false } = req.body;
      const jobsToAssign = reassignAll 
        ? jobThemes 
        : jobThemes.filter(j => !j.pillarId);

      if (jobsToAssign.length === 0) {
        return res.json({ 
          message: "All jobs are already assigned to pillars",
          assignedCount: 0,
          assignments: []
        });
      }

      const jobsForAI = jobsToAssign.map(j => ({
        id: j.id,
        jobName: j.jobName,
        capabilityName: j.capabilityName,
        solutionArea: j.solutionArea,
        aggregationSummary: j.aggregationSummary,
        evidenceCount: j.evidenceCount
      }));

      // Call AI to get assignments
      const { assignJobsToPillars } = await import("./ai");
      const assignments = await assignJobsToPillars(
        project.companyName,
        project.sector,
        jobsForAI,
        pillarsWithObjectives
      );

      // Apply the assignments
      const updatedJobs = [];
      for (const assignment of assignments) {
        // Validate the pillar belongs to this project
        const pillar = pillars.find(p => p.id === assignment.pillarId);
        if (!pillar) {
          console.warn(`[Auto-assign] Skipping job ${assignment.jobId}: pillar ${assignment.pillarId} not found`);
          continue;
        }

        const updated = await storage.updateJobTheme(assignment.jobId, {
          pillarId: assignment.pillarId,
          pillarLinkageNarrative: assignment.pillarLinkageNarrative
        });
        updatedJobs.push({
          ...updated,
          confidence: assignment.confidence
        });
      }

      res.json({
        message: `Successfully assigned ${updatedJobs.length} jobs to pillars`,
        assignedCount: updatedJobs.length,
        assignments: updatedJobs
      });
    } catch (error: any) {
      console.error("[Auto-assign pillars] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // AI-powered Strategic Pillar generation
  app.post("/api/projects/:projectId/strategic-pillars/generate", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Get project
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Gather discovery data for AI analysis
      const [dataPoints, headlines, discoveryNotes, enrichedContext] = await Promise.all([
        storage.getCompanyDataPoints(projectId),
        storage.getHeadlines(projectId),
        storage.getDiscoveryNotes(projectId),
        getEnrichedDiscoveryContext(projectId, storage)
      ]);

      if (dataPoints.length === 0 && headlines.length === 0) {
        return res.status(400).json({ 
          error: "Not enough discovery data", 
          message: "Please complete company research first to generate strategic pillars" 
        });
      }

      // Generate pillars using AI - include enriched context from artifacts and Green Sheet
      const aiPillars = await generateStrategicPillars(
        project.companyName,
        project.sector,
        dataPoints.map(dp => ({
          id: dp.id,
          label: dp.label,
          value: dp.value,
          confidence: dp.confidence,
          relevantCapability: dp.relevantCapability
        })),
        headlines.map(h => ({
          title: h.title,
          date: h.date
        })),
        discoveryNotes ? {
          // Append enriched context to freeform notes for AI consideration
          freeformNotes: (discoveryNotes.freeformNotes || '') + enrichedContext.combinedContext,
          topChallenges: discoveryNotes.topChallenges,
          keyStakeholder: discoveryNotes.keyStakeholder
        } : enrichedContext.combinedContext ? {
          freeformNotes: enrichedContext.combinedContext,
          topChallenges: null,
          keyStakeholder: null
        } : null
      );

      // Store the generated pillars
      const createdPillars = [];
      for (let i = 0; i < aiPillars.length; i++) {
        const pillarData = aiPillars[i];
        
        // Create the pillar
        const pillar = await storage.createStrategicPillar({
          projectId,
          name: pillarData.name,
          description: pillarData.description,
          priority: i + 1,
          status: "draft",
          isAISuggested: true,
          confidence: pillarData.confidence,
          sourceInsightIds: pillarData.sourceInsightIds,
          provenance: { source: "ai", generatedAt: new Date().toISOString() }
        });

        // Create objectives for this pillar
        const createdObjectives = [];
        for (const objData of pillarData.objectives) {
          const objective = await storage.createPillarObjective({
            pillarId: pillar.id,
            objective: objData.objective,
            objectiveType: objData.objectiveType,
            keyResults: objData.keyResults,
            timeline: objData.timeline,
            status: "not_started",
            isAISuggested: true
          });
          createdObjectives.push(objective);
        }

        // Create OKR theme links for this pillar (if AI inferred them)
        const createdThemeLinks = [];
        if (pillarData.okrThemeIds && pillarData.okrThemeIds.length > 0) {
          for (const okrThemeId of pillarData.okrThemeIds) {
            try {
              const themeLink = await storage.createPillarOkrTheme({
                pillarId: pillar.id,
                okrThemeId,
                confidence: pillarData.confidence,
                isAIInferred: true,
                rationale: `AI-inferred from discovery data analysis`
              });
              createdThemeLinks.push(themeLink);
            } catch (themeError) {
              console.warn(`[Strategic Pillars] Failed to create theme link for ${okrThemeId}:`, themeError);
            }
          }
        }

        createdPillars.push({
          ...pillar,
          objectives: createdObjectives,
          okrThemeLinks: createdThemeLinks
        });
      }

      res.status(201).json({
        pillars: createdPillars,
        message: `Generated ${createdPillars.length} strategic pillars based on discovery data`
      });
    } catch (error: any) {
      console.error("[Strategic Pillars Generate] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // JOB THEMES & VALUE BUILD PRIORITIZATION
  // ============================================

  // Get discovery phase transfer (finalize state)
  app.get("/api/projects/:projectId/phase-transfer", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const transfer = await storage.getDiscoveryPhaseTransfer(projectId);
      
      if (!transfer) {
        return res.json({ isFinalized: false });
      }
      
      res.json(transfer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get or generate job themes (aggregated insights by "Jobs We Do")
  app.get("/api/projects/:projectId/job-themes", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Check if project exists
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Get existing job themes
      let jobThemes = await storage.getJobThemes(projectId);
      
      // If no job themes exist, generate them from insights
      if (jobThemes.length === 0) {
        // Aggregate insights by capability
        const insights = await storage.getCompanyDataPoints(projectId);
        const questions = await storage.getDiscoveryQuestions(projectId);
        const responses = await storage.getQuestionResponsesByProject(projectId);
        
        console.log(`[Job Theme Generation] Project ${projectId}: Found ${insights.length} insights, ${questions.length} questions, ${responses.length} responses`);
        console.log(`[Job Theme Generation] Insights with capability:`, insights.filter(i => i.relevantCapability).map(i => ({ id: i.id, capability: i.relevantCapability, label: i.label })));
        console.log(`[Job Theme Generation] Responses by type:`, {
          client: responses.filter(r => r.respondentType === 'client').length,
          consultant: responses.filter(r => r.respondentType === 'consultant').length
        });
        
        const capabilityGroups = new Map<string, { insights: any[], questions: any[], responses: any[] }>();
        
        // Group insights by capability
        insights.forEach(insight => {
          if (insight.relevantCapability) {
            if (!capabilityGroups.has(insight.relevantCapability)) {
              capabilityGroups.set(insight.relevantCapability, { insights: [], questions: [], responses: [] });
            }
            capabilityGroups.get(insight.relevantCapability)!.insights.push(insight);
          }
        });
        
        // Group questions by capability
        questions.forEach(question => {
          if (question.capabilityName) {
            if (!capabilityGroups.has(question.capabilityName)) {
              capabilityGroups.set(question.capabilityName, { insights: [], questions: [], responses: [] });
            }
            capabilityGroups.get(question.capabilityName)!.questions.push(question);
          }
        });
        
        // Group responses by capability (via their linked question's capability)
        responses.forEach(response => {
          if (response.questionCapability) {
            if (!capabilityGroups.has(response.questionCapability)) {
              capabilityGroups.set(response.questionCapability, { insights: [], questions: [], responses: [] });
            }
            capabilityGroups.get(response.questionCapability)!.responses.push(response);
          }
        });
        
        // Create job themes from capability groups
        console.log(`[Job Theme Generation] Found ${capabilityGroups.size} capability groups:`, Array.from(capabilityGroups.keys()));
        
        for (const [capabilityName, data] of Array.from(capabilityGroups.entries())) {
          const { getCapabilityMetadata, getSolutionAreaForCapability } = await import("@shared/knowledge");
          const capability = getCapabilityMetadata(capabilityName);
          const solutionArea = getSolutionAreaForCapability(capabilityName);
          
          console.log(`[Job Theme Generation] Processing capability "${capabilityName}": found=${!!capability}, insights=${data.insights.length}, questions=${data.questions.length}, responses=${data.responses.length}`);
          
          if (capability) {
            // Calculate composite score (average of insight priority scores)
            const avgScore = data.insights.length > 0
              ? Math.round(data.insights.reduce((sum: number, i: any) => sum + (i.priorityScore || 3), 0) / data.insights.length)
              : 3;
            
            const theme = await storage.createJobTheme({
              projectId,
              jobName: capability.jobs,
              capabilityName: capability.name,
              solutionArea: solutionArea as any,
              sourceInsightIds: data.insights.map((i: any) => i.id),
              sourceQuestionIds: data.questions.map((q: any) => q.id),
              sourceResponseIds: data.responses.map((r: any) => r.id),
              compositeScore: avgScore,
              evidenceCount: data.insights.length + data.questions.length + data.responses.length
            });
            
            // Create KPIs for this job theme
            const { getAllKPIsForCapability, getBenchmarkForKPI } = await import("@shared/knowledge");
            const kpis = getAllKPIsForCapability(capabilityName);
            
            for (const kpi of kpis) {
              const benchmark = getBenchmarkForKPI(kpi.name);
              await storage.createJobThemeKPI({
                jobThemeId: theme.id,
                kpiName: kpi.name,
                kpiType: kpi.type,
                unit: kpi.unit,
                definition: kpi.definition,
                measurementFrequency: kpi.measurementFrequency,
                benchmarkValue: benchmark?.benchmarkValue || null,
                benchmarkSource: benchmark?.source || null
              });
            }
            console.log(`[Job Theme Generation] Created job theme: ${theme.jobName} with ${kpis.length} KPIs`);
          } else {
            console.log(`[Job Theme Generation] WARNING: Could not find capability metadata for "${capabilityName}"`);
          }
        }
        
        // Fetch the newly created themes
        jobThemes = await storage.getJobThemes(projectId);
        console.log(`[Job Theme Generation] Final result: ${jobThemes.length} job themes created`);
      }
      
      // Enrich with KPIs
      const enrichedThemes = await Promise.all(
        jobThemes.map(async (theme) => {
          const kpis = await storage.getJobThemeKPIs(theme.id);
          return { ...theme, kpis };
        })
      );
      
      res.json(enrichedThemes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Regenerate job themes from Strategic Pillars (AI-powered)
  app.post("/api/projects/:projectId/job-themes/regenerate", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Check if project exists
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Check if discovery is finalized (block regeneration if so)
      const phaseTransfer = await storage.getDiscoveryPhaseTransfer(projectId);
      if (phaseTransfer?.isFinalized) {
        return res.status(400).json({ 
          error: "Cannot regenerate jobs after discovery is finalized. Use Re-prioritize in Alignment phase." 
        });
      }
      
      // Get strategic pillars with objectives and OKR themes
      const pillars = await storage.getStrategicPillars(projectId);
      if (pillars.length === 0) {
        return res.status(400).json({ 
          error: "No Strategic Pillars defined. Generate pillars first before creating jobs." 
        });
      }
      
      // Get pillar objectives and OKR theme links
      const pillarOkrThemes = await storage.getAllPillarOkrThemesForProject(projectId);
      const { ENTERPRISE_OKR_THEMES } = await import("@shared/knowledge");
      
      const pillarsWithContext = await Promise.all(pillars.map(async (pillar) => {
        const objectives = await storage.getPillarObjectives(pillar.id);
        const themeLinks = pillarOkrThemes.filter(link => link.pillarId === pillar.id);
        const themeIds = themeLinks.map(link => link.okrThemeId);
        const themeNames = themeIds.map((id: string) => 
          ENTERPRISE_OKR_THEMES.find((t: { id: string; name: string }) => t.id === id)?.name || id
        );
        
        return {
          id: pillar.id,
          name: pillar.name,
          description: pillar.description || "",
          confidence: pillar.confidence || "medium",
          okrThemeIds: themeIds,
          okrThemeNames: themeNames,
          objectives: objectives.map(o => ({
            objective: o.objective,
            keyResults: (o.keyResults || []) as Array<{ result: string; target: string }>
          }))
        };
      }));
      
      // Get discovery insights for context
      const insights = await storage.getCompanyDataPoints(projectId);
      const discoveryInsights = insights.map(i => ({
        label: i.label,
        value: i.value,
        relevantCapability: i.relevantCapability
      }));
      
      // Delete existing job themes and KPIs
      console.log(`[Regenerate Jobs] Deleting existing job themes for project ${projectId}`);
      await storage.deleteAllJobThemesForProject(projectId);
      
      // Generate new job themes from pillars using AI
      const { generateJobThemesFromPillars } = await import("./ai");
      const aiResult = await generateJobThemesFromPillars(
        project.companyName,
        project.sector,
        pillarsWithContext,
        discoveryInsights
      );
      
      // Create job themes and KPIs from AI recommendations
      const createdThemes = [];
      for (const pillarResult of aiResult) {
        for (const job of pillarResult.jobs) {
          const theme = await storage.createJobTheme({
            projectId,
            jobName: job.jobName,
            capabilityName: job.capabilityName,
            solutionArea: job.solutionArea,
            pillarId: pillarResult.pillarId,
            pillarLinkageNarrative: job.pillarLinkageNarrative,
            aggregationSummary: job.rationale,
            compositeScore: job.priorityScore,
            evidenceCount: pillarsWithContext.find(p => p.id === pillarResult.pillarId)?.objectives.length || 0
          });
          
          // Create KPIs for this job theme
          for (const kpi of job.kpis) {
            await storage.createJobThemeKPI({
              jobThemeId: theme.id,
              kpiName: kpi.kpiName,
              kpiType: kpi.kpiType,
              unit: kpi.unit,
              definition: kpi.definition,
              measurementFrequency: kpi.measurementFrequency,
              benchmarkValue: kpi.kornFerryBenchmark,
              benchmarkSource: "Korn Ferry AI Analysis",
              isAIRecommended: true,
              aiStrategicRationale: kpi.strategicRationale,
              aiAchievabilityScore: kpi.achievabilityScore,
              aiValueImpactScore: kpi.valueImpactScore,
              aiKornFerryBenchmark: kpi.kornFerryBenchmark
            });
          }
          
          createdThemes.push(theme);
        }
      }
      
      console.log(`[Regenerate Jobs] Created ${createdThemes.length} job themes from ${pillarsWithContext.length} pillars`);
      
      // Return enriched themes with KPIs
      const enrichedThemes = await Promise.all(
        createdThemes.map(async (theme) => {
          const kpis = await storage.getJobThemeKPIs(theme.id);
          return { ...theme, kpis };
        })
      );
      
      res.json(enrichedThemes);
    } catch (error: any) {
      console.error("[Regenerate Jobs] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update job theme prioritization (set top 3)
  app.post("/api/projects/:projectId/job-themes/prioritize", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Validate request body with Zod schema (enforces top-3 constraint)
      const validated = prioritizeJobsRequestSchema.parse(req.body);
      const { prioritizedIds } = validated;
      
      console.log(`[Prioritize Jobs] Project ${projectId}: Setting priorities for IDs:`, prioritizedIds);
      
      // Clear existing priorities
      const allThemes = await storage.getJobThemes(projectId);
      console.log(`[Prioritize Jobs] Found ${allThemes.length} total themes, clearing priorities...`);
      for (const theme of allThemes) {
        await storage.updateJobTheme(theme.id, { priorityRank: null });
      }
      
      // Set new priorities
      for (let i = 0; i < prioritizedIds.length; i++) {
        console.log(`[Prioritize Jobs] Setting theme ${prioritizedIds[i]} to rank ${i + 1}`);
        await storage.updateJobTheme(prioritizedIds[i], { priorityRank: i + 1 });
      }
      
      const updatedThemes = await storage.getJobThemes(projectId);
      const prioritized = updatedThemes.filter(t => t.priorityRank !== null);
      console.log(`[Prioritize Jobs] After update: ${prioritized.length} themes have priorityRank:`, prioritized.map(t => ({ id: t.id, rank: t.priorityRank })));
      
      res.json(updatedThemes);
    } catch (error: any) {
      console.error(`[Prioritize Jobs] Error:`, error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update KPI selection and baseline data
  app.patch("/api/job-theme-kpis/:kpiId", async (req, res) => {
    try {
      const kpiId = parseInt(req.params.kpiId);
      
      // Validate request body with Zod schema
      const validated = updateJobThemeKPIRequestSchema.parse(req.body);
      console.log(`[PATCH /api/job-theme-kpis/${kpiId}] Request body:`, JSON.stringify(validated, null, 2));
      
      const updated = await storage.updateJobThemeKPI(kpiId, validated);
      
      if (!updated) {
        return res.status(404).json({ error: "KPI not found" });
      }
      
      console.log(`[PATCH /api/job-theme-kpis/${kpiId}] Updated KPI - isSelected:`, updated.isSelected, "isAIRecommended:", updated.isAIRecommended);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get a single job theme KPI by ID
  app.get("/api/job-theme-kpis/:kpiId", async (req, res) => {
    try {
      const kpiId = parseInt(req.params.kpiId);
      const kpi = await storage.getJobThemeKPI(kpiId);
      
      if (!kpi) {
        return res.status(404).json({ error: "KPI not found" });
      }
      
      res.json(kpi);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Generate AI industry benchmark for a KPI
  app.post("/api/job-theme-kpis/:kpiId/generate-benchmark", async (req, res) => {
    try {
      const kpiId = parseInt(req.params.kpiId);
      
      // Get the KPI details
      const kpiData = await storage.getJobThemeKPI(kpiId);
      if (!kpiData) {
        return res.status(404).json({ error: "KPI not found" });
      }
      
      // Get project details for industry context
      const jobTheme = await storage.getJobTheme(kpiData.jobThemeId);
      if (!jobTheme) {
        return res.status(404).json({ error: "Job theme not found" });
      }
      
      const project = await storage.getProject(jobTheme.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Generate AI benchmark
      const benchmark = await generateIndustryBenchmark(
        kpiData.kpiName,
        kpiData.unit,
        project.sector || "General Business",
        project.companyName
      );
      
      // Save the benchmark to the KPI
      const updated = await storage.updateJobThemeKPI(kpiId, {
        benchmarkValue: benchmark.benchmarkValue,
        benchmarkSource: benchmark.source
      });
      
      if (!updated) {
        return res.status(404).json({ error: "Failed to update KPI with benchmark" });
      }
      
      res.json(updated);
    } catch (error: any) {
      console.error("Error generating AI benchmark:", error);
      res.status(500).json({ error: error.message || "Failed to generate benchmark" });
    }
  });

  // GET AI-recommended KPIs for a job theme
  app.get("/api/job-themes/:jobThemeId/recommend-kpis", async (req, res) => {
    try {
      const jobThemeId = parseInt(req.params.jobThemeId);
      
      // Get all KPIs for this job theme and filter to AI-recommended ones
      const allKPIs = await storage.getJobThemeKPIs(jobThemeId);
      const recommendations = allKPIs.filter(kpi => kpi.isAIRecommended === true);
      
      res.json(recommendations);
    } catch (error: any) {
      console.error("[GET KPI Recommendations] Error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch KPI recommendations" });
    }
  });

  // Generate AI KPI suggestions from discovery insights (for Sales workflow)
  app.post("/api/projects/:projectId/discovery-kpi-suggestions", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Get discovery insights for this project
      const dataPoints = await storage.getCompanyDataPoints(projectId);
      
      if (dataPoints.length === 0) {
        return res.status(400).json({ error: "No discovery insights found. Complete discovery research first." });
      }
      
      // Get discovery notes and enriched context for additional context
      const [discoveryNotes, enrichedContext] = await Promise.all([
        storage.getDiscoveryNotes(projectId),
        getEnrichedDiscoveryContext(projectId, storage)
      ]);
      
      // Map data points to the format expected by the AI function
      const insights = dataPoints.map(dp => ({
        id: dp.id,
        title: dp.label,
        value: dp.value,
        category: dp.kornFerryPillar || undefined,
        priority: dp.priorityScore >= 4 ? "high" : dp.priorityScore >= 2 ? "medium" : "low",
        relatedKPIs: dp.relatedKPIs || undefined,
      }));
      
      // Use discoveryTheme from project or fallback to sector
      const discoveryTheme = project.discoveryTheme || project.sector || "General business consulting";
      
      console.log(`[Discovery KPI Suggestions] Project ${projectId}: ${insights.length} insights, theme: ${discoveryTheme}`);
      
      // Include enriched context from artifacts and Green Sheet in consultant notes (handle null safely)
      const baseNotes = discoveryNotes?.freeformNotes || '';
      const enrichedNotes = enrichedContext.combinedContext 
        ? `${baseNotes}${enrichedContext.combinedContext}`
        : baseNotes;
      
      const suggestions = await generateDiscoveryKpiSuggestions({
        companyName: project.companyName,
        industry: project.sector || undefined,
        discoveryTheme,
        insights,
        consultantNotes: enrichedNotes || undefined,
      });
      
      res.json({ suggestions, theme: discoveryTheme, insightsCount: insights.length });
    } catch (error: any) {
      console.error("[Discovery KPI Suggestions] Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate KPI suggestions" });
    }
  });

  // Generate AI-powered KPI recommendations for a job theme
  app.post("/api/job-themes/:jobThemeId/recommend-kpis", async (req, res) => {
    try {
      const jobThemeId = parseInt(req.params.jobThemeId);
      
      // Get the job theme details
      const jobTheme = await storage.getJobTheme(jobThemeId);
      if (!jobTheme) {
        return res.status(404).json({ error: "Job theme not found" });
      }
      
      // Get project details for company context
      const project = await storage.getProject(jobTheme.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Generate AI recommendations
      const recommendations = await generateKPIRecommendations({
        jobName: jobTheme.jobName,
        capabilityName: jobTheme.capabilityName,
        solutionArea: jobTheme.solutionArea || "ASSESS",
        aggregationSummary: jobTheme.aggregationSummary || undefined,
        companyName: project.companyName,
        industry: project.sector || undefined,
      });
      
      // Save recommendations as new KPIs for this job theme
      const createdKPIs = [];
      for (const rec of recommendations) {
        const newKPI = await storage.createJobThemeKPI({
          jobThemeId: jobTheme.id,
          kpiName: rec.kpiName,
          kpiType: rec.kpiType,
          unit: rec.unit,
          definition: rec.definition,
          measurementFrequency: rec.measurementFrequency,
          isAIRecommended: true,
          aiStrategicRationale: rec.strategicRationale,
          aiAchievabilityScore: rec.achievabilityScore,
          aiValueImpactScore: rec.valueImpactScore,
          aiKornFerryBenchmark: rec.kornFerryBenchmark,
          aiIndustryBenchmark: rec.industryBenchmark || null,
          aiTargetRecommendation: rec.targetRecommendation || null,
          isSelected: false, // Not selected by default - consultant chooses
        });
        createdKPIs.push(newKPI);
      }
      
      console.log(`[AI Outcome Recommendations] Created ${createdKPIs.length} recommendations for job theme ${jobTheme.id}`);
      res.json(createdKPIs);
    } catch (error: any) {
      console.error("Error generating KPI recommendations:", error);
      res.status(500).json({ error: error.message || "Failed to generate KPI recommendations" });
    }
  });

  // Finalize discovery phase and transfer to alignment
  app.post("/api/projects/:projectId/finalize-discovery", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Validate request body (empty body expected)
      finalizeDiscoveryRequestSchema.parse(req.body);
      
      // Get prioritized job themes
      const jobThemes = await storage.getJobThemes(projectId);
      console.log(`[Finalize Discovery] Project ${projectId}: Found ${jobThemes.length} total job themes`);
      console.log(`[Finalize Discovery] Job themes with priorityRank:`, jobThemes.filter(t => t.priorityRank !== null).map(t => ({ id: t.id, name: t.jobName, rank: t.priorityRank })));
      
      const prioritized = jobThemes
        .filter(t => t.priorityRank !== null)
        .sort((a, b) => (a.priorityRank || 999) - (b.priorityRank || 999));
      
      console.log(`[Finalize Discovery] ${prioritized.length} prioritized themes:`, prioritized.map(t => ({ id: t.id, name: t.jobName, rank: t.priorityRank })));
      
      if (prioritized.length === 0) {
        console.log(`[Finalize Discovery] ERROR: No job themes have been prioritized`);
        return res.status(400).json({ error: "No job themes have been prioritized" });
      }
      
      // Check if already finalized (idempotent - return existing transfer)
      let transfer = await storage.getDiscoveryPhaseTransfer(projectId);
      
      if (transfer && transfer.isFinalized) {
        console.log(`[Finalize Discovery] Already finalized, returning existing transfer with jobs:`, transfer.finalizedJobThemeIds);
        return res.json(transfer);
      }
      
      // Create or update transfer record
      const finalizedIds = prioritized.map(t => t.id);
      console.log(`[Finalize Discovery] Creating/updating transfer with finalizedJobThemeIds:`, finalizedIds);
      
      if (transfer) {
        transfer = await storage.updateDiscoveryPhaseTransfer(transfer.id, {
          isFinalized: true,
          finalizedJobThemeIds: finalizedIds,
          transferredAt: new Date()
        });
      } else {
        transfer = await storage.createDiscoveryPhaseTransfer({
          projectId,
          isFinalized: true,
          finalizedJobThemeIds: finalizedIds,
          transferredAt: new Date()
        });
      }
      
      console.log(`[Finalize Discovery] Transfer created/updated:`, transfer);
      
      // Update project phase to alignment
      await storage.updateProject(projectId, { currentPhase: "alignment" });
      
      res.json(transfer);
    } catch (error: any) {
      console.error(`[Finalize Discovery] Error:`, error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get finalized discovery data for Alignment page
  app.get("/api/projects/:projectId/alignment/finalized-jobs", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      console.log(`[GET finalized-jobs] Project ${projectId}: Fetching finalized jobs...`);
      
      // Get discovery phase transfer
      const transfer = await storage.getDiscoveryPhaseTransfer(projectId);
      
      if (!transfer || !transfer.isFinalized) {
        console.log(`[GET finalized-jobs] Project ${projectId}: No finalized transfer found`);
        return res.json({ finalized: false, jobs: [] });
      }
      
      console.log(`[GET finalized-jobs] Project ${projectId}: Found transfer with finalizedJobThemeIds:`, transfer.finalizedJobThemeIds);
      
      // Get finalized job themes with KPIs
      const finalizedJobIds = transfer.finalizedJobThemeIds || [];
      const jobsWithKPIs = [];
      
      for (const jobId of finalizedJobIds) {
        const job = await storage.getJobTheme(jobId);
        if (job) {
          const kpis = await storage.getJobThemeKPIs(jobId);
          console.log(`[GET finalized-jobs] Job ${jobId} (${job.jobName}) has ${kpis.length} KPIs, selected: ${kpis.filter(k => k.isSelected).length}, AI-recommended: ${kpis.filter(k => k.isAIRecommended).length}`);
          jobsWithKPIs.push({
            ...job,
            kpis: kpis
          });
        } else {
          console.log(`[GET finalized-jobs] Job ${jobId} not found in storage!`);
        }
      }
      
      // Sort by priority rank
      jobsWithKPIs.sort((a, b) => (a.priorityRank || 999) - (b.priorityRank || 999));
      
      console.log(`[GET finalized-jobs] Returning ${jobsWithKPIs.length} jobs with total ${jobsWithKPIs.reduce((sum, j) => sum + j.kpis.length, 0)} KPIs`);
      res.json({
        finalized: true,
        jobs: jobsWithKPIs,
        transferredAt: transfer.transferredAt
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // PHASE 1: VALUE REALIZATION FEATURES
  // ============================================================================

  // Business Reviews
  app.get("/api/projects/:projectId/business-reviews", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const reviews = await storage.getBusinessReviews(projectId);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/projects/:projectId/business-reviews", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const validated = insertBusinessReviewSchema.parse({
        ...req.body,
        projectId
      });
      const review = await storage.createBusinessReview(validated);
      res.json(review);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/business-reviews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Validate partial update with Zod
      const validated = insertBusinessReviewSchema.partial().parse(req.body);
      const updated = await storage.updateBusinessReview(id, validated);
      if (!updated) {
        return res.status(404).json({ error: "Business review not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/business-reviews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBusinessReview(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI-Powered Business Review Agenda Generation
  app.post("/api/projects/:projectId/business-reviews/generate-agenda", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Validate request body
      const requestSchema = z.object({
        reviewType: z.enum(["quarterly", "monthly", "ad-hoc"]).default("monthly")
      });
      const validated = requestSchema.parse(req.body);
      const { reviewType } = validated;

      // Load project context
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Load discovery insights for context
      const dataPoints = await storage.getCompanyDataPoints(projectId);
      const discoveryInsights = dataPoints
        .filter(dp => dp.priorityScore >= 4) // High priority insights
        .slice(0, 5)
        .map(dp => `${dp.label}: ${dp.value}`);

      // Load finalized jobs and KPIs for progress tracking
      const transfer = await storage.getDiscoveryPhaseTransfer(projectId);
      let kpiProgress: Array<{
        kpiName: string;
        baseline: string;
        target: string;
        actual?: string;
        trend: "improving" | "declining" | "stagnant" | "unknown";
      }> = [];

      if (transfer?.finalizedJobThemeIds && transfer.finalizedJobThemeIds.length > 0) {
        // Get all finalized jobs with their KPIs
        const jobs = await Promise.all(
          transfer.finalizedJobThemeIds.map(id => storage.getJobTheme(id))
        );
        
        for (const job of jobs.filter(j => j !== undefined)) {
          const kpis = await storage.getJobThemeKPIs(job!.id);
          const selectedKPIs = kpis.filter(kpi => kpi.isSelected);
          
          for (const kpi of selectedKPIs) {
            // Get actual values to determine trend
            const actuals = await storage.getKPIActuals(kpi.id);
            const latestActual = actuals[0]; // Most recent
            
            let trend: "improving" | "declining" | "stagnant" | "unknown" = "unknown";
            if (latestActual && kpi.baselineValue && kpi.targetValue) {
              const baseline = parseFloat(kpi.baselineValue);
              const target = parseFloat(kpi.targetValue);
              const actual = parseFloat(latestActual.actualValue);
              
              if (!isNaN(baseline) && !isNaN(target) && !isNaN(actual)) {
                const targetDirection = target > baseline ? "up" : "down";
                if (targetDirection === "up") {
                  trend = actual > baseline ? "improving" : (actual < baseline ? "declining" : "stagnant");
                } else {
                  trend = actual < baseline ? "improving" : (actual > baseline ? "declining" : "stagnant");
                }
              }
            }
            
            kpiProgress.push({
              kpiName: kpi.kpiName,
              baseline: kpi.baselineValue || "Not set",
              target: kpi.targetValue || "Not set",
              actual: latestActual?.actualValue,
              trend
            });
          }
        }
      }

      // Load previous reviews for context
      const previousReviews = await storage.getBusinessReviews(projectId);
      const lastCompletedReview = previousReviews
        .filter(r => r.status === "completed")
        .sort((a, b) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime())[0];

      const previousReviewNotes = lastCompletedReview?.notes || undefined;

      // Extract open action items from last review
      const openActionItems = lastCompletedReview?.actionItems 
        ? (lastCompletedReview.actionItems as any[]).filter((item: any) => !item.completed)
        : [];

      // Generate agenda using AI
      const agenda = await generateBusinessReviewAgenda({
        companyName: project.companyName,
        reviewType: reviewType || "monthly",
        projectPhase: project.currentPhase,
        kpiProgress: kpiProgress.length > 0 ? kpiProgress : undefined,
        previousReviewNotes,
        openActionItems: openActionItems.length > 0 ? openActionItems : undefined,
        discoveryInsights: discoveryInsights.length > 0 ? discoveryInsights : undefined
      });

      res.json(agenda);
    } catch (error: any) {
      console.error("Error generating business review agenda:", error);
      res.status(500).json({ error: error.message || "Failed to generate agenda" });
    }
  });

  // KPI Actuals
  app.get("/api/job-theme-kpis/:kpiId/actuals", async (req, res) => {
    try {
      const kpiId = parseInt(req.params.kpiId);
      const actuals = await storage.getKPIActuals(kpiId);
      res.json(actuals);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/job-theme-kpis/:kpiId/actuals", async (req, res) => {
    try {
      const kpiId = parseInt(req.params.kpiId);
      const validated = insertKPIActualSchema.parse({
        ...req.body,
        jobThemeKPIId: kpiId
      });
      const actual = await storage.createKPIActual(validated);
      res.json(actual);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/kpi-actuals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Validate partial update with Zod
      const validated = insertKPIActualSchema.partial().parse(req.body);
      const updated = await storage.updateKPIActual(id, validated);
      if (!updated) {
        return res.status(404).json({ error: "KPI actual not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/kpi-actuals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteKPIActual(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Milestones
  app.get("/api/projects/:projectId/milestones", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const milestones = await storage.getMilestones(projectId);
      res.json(milestones);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/projects/:projectId/milestones", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const milestone = await storage.createMilestone({
        ...req.body,
        projectId
      });
      res.json(milestone);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/milestones/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateMilestone(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Milestone not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/milestones/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMilestone(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Value Realization Aggregation APIs

  // Get overall value metrics for a project
  app.get("/api/projects/:projectId/realization/metrics", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Get or create project value metrics
      let metrics = await storage.getProjectValueMetrics(projectId);
      
      if (!metrics) {
        // Calculate metrics for the first time
        metrics = await calculateProjectValueMetrics(projectId, storage);
      }
      
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get KPI status breakdown (on-track, at-risk, off-track, no-data)
  app.get("/api/projects/:projectId/realization/kpi-status", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const kpiStatus = await calculateKPIStatus(projectId, storage);
      res.json(kpiStatus);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get realization timeline (milestones, reviews, interventions)
  app.get("/api/projects/:projectId/realization/timeline", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      const [milestones, reviews, interventions] = await Promise.all([
        storage.getMilestones(projectId),
        storage.getBusinessReviews(projectId),
        storage.getInterventions(projectId)
      ]);
      
      // Combine and sort by date
      const timeline = [
        ...milestones.map(m => ({
          type: 'milestone' as const,
          id: m.id,
          title: m.title,
          description: m.description,
          date: m.milestoneDate,
          status: m.status,
          data: m
        })),
        ...reviews.map(r => ({
          type: 'review' as const,
          id: r.id,
          title: `${r.reviewType} Review`,
          description: r.agenda || '',
          date: r.reviewDate,
          status: r.status,
          data: r
        })),
        ...interventions.map(i => ({
          type: 'intervention' as const,
          id: i.id,
          title: i.title,
          description: i.description || '',
          date: i.startDate,
          status: i.status,
          data: i
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      res.json(timeline);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Recalculate value metrics
  app.post("/api/projects/:projectId/realization/recalculate", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const metrics = await calculateProjectValueMetrics(projectId, storage);
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Enhanced Realization Dashboard Summary - comprehensive data for dashboard
  app.get("/api/projects/:projectId/realization/dashboard", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Fetch all data in parallel
      const [jobThemes, allKPIs, allActuals, reviews, milestones, interventions] = await Promise.all([
        storage.getJobThemes(projectId),
        storage.getAllJobThemeKPIsForProject(projectId),
        storage.getAllKPIActualsForProject(projectId),
        storage.getBusinessReviews(projectId),
        storage.getMilestones(projectId),
        storage.getInterventions(projectId)
      ]);
      
      // Create actuals map for efficient lookup (properly typed as array of individual actuals)
      type KPIActualRecord = (typeof allActuals)[number];
      const actualsMap = new Map<number, KPIActualRecord[]>();
      for (const actual of allActuals) {
        if (!actualsMap.has(actual.jobThemeKPIId)) {
          actualsMap.set(actual.jobThemeKPIId, []);
        }
        actualsMap.get(actual.jobThemeKPIId)!.push(actual);
      }
      
      // Sort each KPI's actuals by date descending (newest first) for correct latest actual selection
      actualsMap.forEach((actuals) => {
        actuals.sort((a, b) => new Date(b.actualDate).getTime() - new Date(a.actualDate).getTime());
      });
      
      // Build KPI details with trend data and health scores
      const kpiDetails: Array<{
        id: number;
        name: string;
        jobName: string;
        unit: string | null;
        baseline: number;
        target: number;
        current: number | null;
        progressPercent: number;
        status: 'on-track' | 'at-risk' | 'off-track' | 'no-data' | 'financial-no-data';
        healthScore: number;
        trendDirection: 'up' | 'down' | 'stable';
        trendPercent: number;
        forecast: number | null;
        forecastStatus: 'exceeding' | 'on-pace' | 'behind' | null;
        lastUpdated: string | null;
        history: Array<{ date: string; value: number }>;
        alerts: Array<{ type: string; message: string; severity: 'warning' | 'critical' }>;
      }> = [];
      
      let totalHealthScore = 0;
      let kpiCount = 0;
      const alerts: Array<{ kpiId: number; kpiName: string; type: string; message: string; severity: 'warning' | 'critical' }> = [];
      
      // Create job theme name map
      const jobThemeMap = new Map(jobThemes.map(jt => [jt.id, jt.jobName]));
      
      for (const kpi of allKPIs) {
        if (!kpi.isSelected) continue;
        
        const actuals = actualsMap.get(kpi.id) || [];
        const jobName = jobThemeMap.get(kpi.jobThemeId) || 'Unknown';
        
        // Parse baseline and target using parseNumeric to detect missing data
        const baselineParsed = parseNumeric(kpi.baselineValue);
        const targetParsed = parseNumeric(kpi.targetValue);
        
        // If essential metrics are missing, mark as no-data with alert
        if (baselineParsed === null || targetParsed === null) {
          kpiDetails.push({
            id: kpi.id,
            name: kpi.kpiName,
            jobName,
            unit: kpi.unit,
            baseline: baselineParsed !== null ? baselineParsed : 0,
            target: targetParsed !== null ? targetParsed : 0,
            current: null,
            progressPercent: 0,
            status: 'no-data',
            healthScore: 0,
            trendDirection: 'stable',
            trendPercent: 0,
            forecast: null,
            forecastStatus: null,
            lastUpdated: null,
            history: [],
            alerts: [{ type: 'missing-config', message: `Missing baseline or target for ${kpi.kpiName}`, severity: 'warning' }]
          });
          
          alerts.push({
            kpiId: kpi.id,
            kpiName: kpi.kpiName,
            type: 'missing-config',
            message: `${kpi.kpiName} is missing baseline or target configuration`,
            severity: 'warning'
          });
          continue;
        }
        
        const baseline = baselineParsed;
        const target = targetParsed;
        const targetDelta = target - baseline;
        
        // Check if value configuration is missing (for value metrics alerts)
        const valuePerUnitParsed = parseNumeric(kpi.estimatedValuePerUnit);
        const hasMissingValueConfig = valuePerUnitParsed === null;
        
        kpiCount++;
        
        // Build history from actuals (sorted by date, oldest first for charts)
        // Filter out invalid values to avoid skewing trend/forecast calculations
        const history = actuals
          .map(a => {
            const parsedValue = parseNumeric(a.actualValue);
            return parsedValue !== null ? {
              date: new Date(a.actualDate).toISOString(),
              value: parsedValue
            } : null;
          })
          .filter((h): h is { date: string; value: number } => h !== null)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        if (actuals.length === 0) {
          // Determine status based on value configuration
          const noActualsStatus = hasMissingValueConfig ? 'financial-no-data' : 'no-data';
          const noActualsAlerts: Array<{ type: string; message: string; severity: 'warning' | 'critical' }> = [];
          
          if (hasMissingValueConfig) {
            noActualsAlerts.push({ 
              type: 'missing-value-config', 
              message: `${kpi.kpiName} is missing value-per-unit configuration`, 
              severity: 'warning' 
            });
            alerts.push({
              kpiId: kpi.id,
              kpiName: kpi.kpiName,
              type: 'missing-value-config',
              message: `${kpi.kpiName} is missing value-per-unit configuration`,
              severity: 'warning'
            });
          }
          
          kpiDetails.push({
            id: kpi.id,
            name: kpi.kpiName,
            jobName,
            unit: kpi.unit,
            baseline,
            target,
            current: null,
            progressPercent: 0,
            status: noActualsStatus,
            healthScore: 0,
            trendDirection: 'stable',
            trendPercent: 0,
            forecast: null,
            forecastStatus: null,
            lastUpdated: null,
            history,
            alerts: noActualsAlerts
          });
          
          // Add alert for no data only if not already flagged as missing value config
          if (!hasMissingValueConfig) {
            alerts.push({
              kpiId: kpi.id,
              kpiName: kpi.kpiName,
              type: 'no-data',
              message: `No measurements recorded for ${kpi.kpiName}`,
              severity: 'warning'
            });
          }
          continue;
        }
        
        // Find the most recent valid actual (fall back if latest is invalid)
        let validActual: { actual: typeof actuals[0]; value: number } | null = null;
        let hasInvalidLatest = false;
        
        for (let i = 0; i < actuals.length; i++) {
          const parsed = parseNumeric(actuals[i].actualValue);
          if (parsed !== null) {
            validActual = { actual: actuals[i], value: parsed };
            if (i > 0) hasInvalidLatest = true; // Latest was invalid but found valid fallback
            break;
          }
          if (i === 0) hasInvalidLatest = true;
        }
        
        // If no valid actual found, treat as no-data with alert
        if (validActual === null) {
          const invalidDataStatus = hasMissingValueConfig ? 'financial-no-data' : 'no-data';
          const invalidDataAlerts: Array<{ type: string; message: string; severity: 'warning' | 'critical' }> = [
            { type: 'invalid-data', message: `All measurements for ${kpi.kpiName} are invalid`, severity: 'warning' }
          ];
          
          if (hasMissingValueConfig) {
            invalidDataAlerts.push({ 
              type: 'missing-value-config', 
              message: `${kpi.kpiName} is missing value-per-unit configuration`, 
              severity: 'warning' 
            });
          }
          
          kpiDetails.push({
            id: kpi.id,
            name: kpi.kpiName,
            jobName,
            unit: kpi.unit,
            baseline,
            target,
            current: null,
            progressPercent: 0,
            status: invalidDataStatus,
            healthScore: 0,
            trendDirection: 'stable',
            trendPercent: 0,
            forecast: null,
            forecastStatus: null,
            lastUpdated: new Date(actuals[0].actualDate).toISOString(),
            history: history.filter(h => h.value !== null && isFinite(h.value)),
            alerts: invalidDataAlerts
          });
          
          alerts.push({
            kpiId: kpi.id,
            kpiName: kpi.kpiName,
            type: 'invalid-data',
            message: `${kpi.kpiName} has invalid measurement data`,
            severity: 'warning'
          });
          continue;
        }
        
        const latestActual = validActual.actual;
        const current = validActual.value;
        const currentDelta = current - baseline;
        const progressPercent = targetDelta !== 0 ? Math.round((currentDelta / targetDelta) * 100) : 0;
        
        // Determine status - KPIs with missing value config get dedicated status
        let status: 'on-track' | 'at-risk' | 'off-track' | 'no-data' | 'financial-no-data';
        let healthScore: number;
        
        if (hasMissingValueConfig) {
          // Missing value configuration - exclude from health aggregates
          status = 'financial-no-data';
          healthScore = 0;
        } else {
          // Has complete value configuration - include in health aggregates
          if (progressPercent >= 80) {
            status = 'on-track';
          } else if (progressPercent >= 50) {
            status = 'at-risk';
          } else {
            status = 'off-track';
          }
          healthScore = Math.min(100, Math.max(0, progressPercent));
          totalHealthScore += healthScore;
        }
        
        // Calculate trend (compare last 2 measurements)
        let trendDirection: 'up' | 'down' | 'stable' = 'stable';
        let trendPercent = 0;
        if (actuals.length >= 2) {
          const prevParsed = parseNumeric(actuals[1].actualValue);
          if (prevParsed !== null) {
            const prev = prevParsed;
            const change = current - prev;
            const isPositiveDirection = target > baseline; // Determines if increase is good
            
            if (Math.abs(change) > 0.01) {
              trendDirection = (isPositiveDirection ? change > 0 : change < 0) ? 'up' : 'down';
              trendPercent = prev !== 0 ? Math.round((change / prev) * 100) : 0;
            }
          }
        }
        
        // Simple linear forecast
        let forecast: number | null = null;
        let forecastStatus: 'exceeding' | 'on-pace' | 'behind' | null = null;
        if (history.length >= 2) {
          const firstPoint = history[0];
          const lastPoint = history[history.length - 1];
          const daysDiff = (new Date(lastPoint.date).getTime() - new Date(firstPoint.date).getTime()) / (1000 * 60 * 60 * 24);
          
          if (daysDiff > 0) {
            const dailyRate = (lastPoint.value - firstPoint.value) / daysDiff;
            const daysRemaining = 365; // Assume 1 year target window
            forecast = Math.round((current + (dailyRate * daysRemaining)) * 100) / 100;
            
            if (targetDelta > 0) {
              forecastStatus = forecast >= target ? 'exceeding' : forecast >= baseline + (targetDelta * 0.8) ? 'on-pace' : 'behind';
            } else {
              forecastStatus = forecast <= target ? 'exceeding' : forecast <= baseline + (targetDelta * 0.8) ? 'on-pace' : 'behind';
            }
          }
        }
        
        // Generate alerts
        const kpiAlerts: Array<{ type: string; message: string; severity: 'warning' | 'critical' }> = [];
        
        // Alert when latest actual is invalid but using fallback
        if (hasInvalidLatest) {
          const alertItem = {
            kpiId: kpi.id,
            kpiName: kpi.kpiName,
            type: 'invalid-latest-data',
            message: `Latest measurement for ${kpi.kpiName} is invalid - using older valid data`,
            severity: 'warning' as const
          };
          alerts.push(alertItem);
          kpiAlerts.push({ type: alertItem.type, message: alertItem.message, severity: alertItem.severity });
        }
        
        if (status === 'off-track') {
          const alertItem = {
            kpiId: kpi.id,
            kpiName: kpi.kpiName,
            type: 'off-track',
            message: `${kpi.kpiName} is significantly behind target (${progressPercent}% progress)`,
            severity: 'critical' as const
          };
          alerts.push(alertItem);
          kpiAlerts.push({ type: alertItem.type, message: alertItem.message, severity: alertItem.severity });
        } else if (status === 'at-risk') {
          const alertItem = {
            kpiId: kpi.id,
            kpiName: kpi.kpiName,
            type: 'at-risk',
            message: `${kpi.kpiName} needs attention (${progressPercent}% progress)`,
            severity: 'warning' as const
          };
          alerts.push(alertItem);
          kpiAlerts.push({ type: alertItem.type, message: alertItem.message, severity: alertItem.severity });
        }
        
        if (trendDirection === 'down' && status !== 'on-track') {
          kpiAlerts.push({
            type: 'declining',
            message: 'Trending in wrong direction',
            severity: 'warning'
          });
        }
        
        // Add alert for missing value configuration (so users know value metrics are incomplete)
        if (hasMissingValueConfig) {
          const alertItem = {
            kpiId: kpi.id,
            kpiName: kpi.kpiName,
            type: 'missing-value-config',
            message: `${kpi.kpiName} is missing value-per-unit configuration for financial tracking`,
            severity: 'warning' as const
          };
          alerts.push(alertItem);
          kpiAlerts.push({ type: alertItem.type, message: alertItem.message, severity: alertItem.severity });
        }
        
        kpiDetails.push({
          id: kpi.id,
          name: kpi.kpiName,
          jobName,
          unit: kpi.unit,
          baseline,
          target,
          current,
          progressPercent,
          status,
          healthScore,
          trendDirection,
          trendPercent,
          forecast,
          forecastStatus,
          lastUpdated: new Date(latestActual.actualDate).toISOString(),
          history,
          alerts: kpiAlerts
        });
      }
      
      // Count KPIs with complete value configuration for health score denominator
      // Uses dedicated 'financial-no-data' status instead of alert filtering
      const kpisWithCompleteConfig = kpiDetails.filter(k => 
        k.status !== 'no-data' && k.status !== 'financial-no-data'
      ).length;
      
      // Calculate overall health score (only include KPIs with complete configuration)
      const overallHealthScore = kpisWithCompleteConfig > 0 ? Math.round(totalHealthScore / kpisWithCompleteConfig) : 0;
      
      // Health status breakdown uses dedicated status values
      const healthBreakdown = {
        onTrack: kpiDetails.filter(k => k.status === 'on-track').length,
        atRisk: kpiDetails.filter(k => k.status === 'at-risk').length,
        offTrack: kpiDetails.filter(k => k.status === 'off-track').length,
        noData: kpiDetails.filter(k => k.status === 'no-data').length,
        financialNoData: kpiDetails.filter(k => k.status === 'financial-no-data').length
      };
      
      // Calculate value metrics using parseNumeric to handle missing data properly
      let totalValuePromised = 0;
      let totalValueRealized = 0;
      let kpisWithValueConfig = 0;
      
      for (const kpi of allKPIs) {
        if (!kpi.isSelected) continue;
        
        const baselineParsed = parseNumeric(kpi.baselineValue);
        const targetParsed = parseNumeric(kpi.targetValue);
        const valuePerUnitParsed = parseNumeric(kpi.estimatedValuePerUnit);
        
        // Skip if essential metrics are missing
        if (baselineParsed === null || targetParsed === null) continue;
        
        // Only calculate value if valuePerUnit is valid
        if (valuePerUnitParsed !== null) {
          kpisWithValueConfig++;
          totalValuePromised += Math.abs(targetParsed - baselineParsed) * valuePerUnitParsed;
          
          const actuals = actualsMap.get(kpi.id) || [];
          if (actuals.length > 0) {
            const currentParsed = parseNumeric(actuals[0].actualValue);
            if (currentParsed !== null) {
              const valueImpactParsed = parseNumeric(actuals[0].valueImpactAmount);
              if (valueImpactParsed !== null) {
                totalValueRealized += valueImpactParsed;
              } else {
                totalValueRealized += Math.abs(currentParsed - baselineParsed) * valuePerUnitParsed;
              }
            }
          }
        }
      }
      
      // Milestones summary
      const milestonesSummary = {
        total: milestones.length,
        achieved: milestones.filter(m => m.status === 'achieved').length,
        planned: milestones.filter(m => m.status === 'planned').length,
        missed: milestones.filter(m => m.status === 'missed').length,
        upcoming: milestones.filter(m => m.status === 'planned' && new Date(m.milestoneDate) > new Date()).slice(0, 3)
      };
      
      // Next review
      const lastReview = reviews.length > 0 ? reviews[0] : null;
      
      res.json({
        overallHealthScore,
        healthBreakdown,
        kpiDetails,
        alerts: alerts.sort((a, b) => (a.severity === 'critical' ? -1 : 1)),
        valueMetrics: {
          promised: totalValuePromised,
          realized: totalValueRealized,
          realizationPercent: totalValuePromised > 0 ? Math.round((totalValueRealized / totalValuePromised) * 100) : 0
        },
        milestonesSummary,
        lastReviewDate: lastReview?.reviewDate,
        nextReviewDate: lastReview?.nextReviewDate,
        interventionsActive: interventions.filter(i => i.status === 'in_progress').length
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // QBR Summary Generation
  app.post("/api/projects/:projectId/qbr-summary/generate", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { summaryType } = req.body;
      
      // Fetch all necessary data
      const [project, jobThemes, allKPIs, allActuals, reviews, milestones] = await Promise.all([
        storage.getProject(projectId),
        storage.getJobThemes(projectId),
        storage.getAllJobThemeKPIsForProject(projectId),
        storage.getAllKPIActualsForProject(projectId),
        storage.getBusinessReviews(projectId),
        storage.getMilestones(projectId)
      ]);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Calculate metrics for AI context (properly typed as array of individual actuals)
      type QBRKPIActualRecord = (typeof allActuals)[number];
      const actualsMap = new Map<number, QBRKPIActualRecord[]>();
      for (const actual of allActuals) {
        if (!actualsMap.has(actual.jobThemeKPIId)) {
          actualsMap.set(actual.jobThemeKPIId, []);
        }
        actualsMap.get(actual.jobThemeKPIId)!.push(actual);
      }
      
      // Sort each KPI's actuals by date descending (newest first) for correct latest actual selection
      actualsMap.forEach((actuals) => {
        actuals.sort((a, b) => new Date(b.actualDate).getTime() - new Date(a.actualDate).getTime());
      });
      
      let kpisOnTrack = 0, kpisAtRisk = 0, kpisOffTrack = 0, kpisNoData = 0;
      let totalValuePromised = 0, totalValueRealized = 0;
      const kpiSummaries: string[] = [];
      
      for (const kpi of allKPIs) {
        if (!kpi.isSelected) continue;
        
        const actuals = actualsMap.get(kpi.id) || [];
        
        // Parse numeric values using parseNumeric to detect missing/invalid data
        const baselineParsed = parseNumeric(kpi.baselineValue);
        const targetParsed = parseNumeric(kpi.targetValue);
        const valuePerUnitParsed = parseNumeric(kpi.estimatedValuePerUnit);
        
        // Skip KPI if essential metrics are missing (baseline or target)
        if (baselineParsed === null || targetParsed === null) {
          kpisNoData++;
          kpiSummaries.push(`- ${kpi.kpiName}: Missing baseline or target data`);
          continue;
        }
        
        const baseline = baselineParsed;
        const target = targetParsed;
        const targetDelta = target - baseline;
        const valuePerUnit = valuePerUnitParsed !== null ? valuePerUnitParsed : 0;
        
        // Calculate value promised (only if valuePerUnit is valid)
        if (valuePerUnitParsed !== null) {
          totalValuePromised += Math.abs(targetDelta) * valuePerUnit;
        }
        
        if (actuals.length === 0) {
          kpisNoData++;
          kpiSummaries.push(`- ${kpi.kpiName}: No data collected yet`);
          continue;
        }
        
        const currentParsed = parseNumeric(actuals[0].actualValue);
        
        // If the actual value is invalid, treat as no-data
        if (currentParsed === null) {
          kpisNoData++;
          kpiSummaries.push(`- ${kpi.kpiName}: Invalid measurement data`);
          continue;
        }
        
        const current = currentParsed;
        const currentDelta = current - baseline;
        const progressPercent = targetDelta !== 0 ? Math.round((currentDelta / targetDelta) * 100) : 0;
        
        const valueImpact = parseNumeric(actuals[0].valueImpactAmount);
        if (valueImpact !== null) {
          totalValueRealized += valueImpact;
        } else if (valuePerUnitParsed !== null && valuePerUnit > 0) {
          totalValueRealized += Math.abs(currentDelta) * valuePerUnit;
        }
        
        if (progressPercent >= 80) {
          kpisOnTrack++;
          kpiSummaries.push(`- ${kpi.kpiName}: On track (${progressPercent}% to target)`);
        } else if (progressPercent >= 50) {
          kpisAtRisk++;
          kpiSummaries.push(`- ${kpi.kpiName}: At risk (${progressPercent}% to target)`);
        } else {
          kpisOffTrack++;
          kpiSummaries.push(`- ${kpi.kpiName}: Off track (${progressPercent}% to target)`);
        }
      }
      
      const totalKPIs = kpisOnTrack + kpisAtRisk + kpisOffTrack + kpisNoData;
      const healthScore = totalKPIs > 0 ? Math.round((kpisOnTrack / totalKPIs) * 100) : 0;
      
      // Generate summary using AI
      const prompt = `Generate a ${summaryType === 'executive' ? 'concise executive' : summaryType === 'detailed' ? 'comprehensive detailed' : 'action-focused'} summary for a Quarterly Business Review.

Company: ${project.companyName}
Project: ${project.name}
Sector: ${project.sector || 'Not specified'}

Key Metrics:
- Overall Health Score: ${healthScore}%
- KPIs On Track: ${kpisOnTrack} of ${totalKPIs}
- KPIs At Risk: ${kpisAtRisk}
- KPIs Off Track: ${kpisOffTrack}
- Value Promised: $${(totalValuePromised / 1000000).toFixed(2)}M
- Value Realized: $${(totalValueRealized / 1000000).toFixed(2)}M (${totalValuePromised > 0 ? Math.round((totalValueRealized / totalValuePromised) * 100) : 0}%)

Milestones:
- Achieved: ${milestones.filter(m => m.status === 'achieved').length} of ${milestones.length}
- Planned: ${milestones.filter(m => m.status === 'planned').length}
- Missed: ${milestones.filter(m => m.status === 'missed').length}

KPI Details:
${kpiSummaries.join('\n')}

Last Business Review: ${reviews.length > 0 ? new Date(reviews[0].reviewDate).toLocaleDateString() : 'None scheduled'}

${summaryType === 'executive' ? 'Provide a brief 2-3 paragraph executive summary highlighting key achievements, concerns, and recommended actions.' : 
  summaryType === 'detailed' ? 'Provide a comprehensive report with sections for Overview, Value Metrics, KPI Analysis, Milestones, and Recommendations.' :
  'List the top 5-7 priority action items with owners and suggested timelines based on the current status.'}

Format in Markdown.`;

      try {
        const aiResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a management consultant preparing quarterly business review materials. Be concise, data-driven, and actionable."
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        });
        
        res.json({ 
          summary: aiResponse.choices[0].message.content || "Summary generation failed"
        });
      } catch (aiError) {
        // Fallback to a templated summary if AI fails
        const fallbackSummary = `# Quarterly Business Review Summary
## ${project.companyName} - ${new Date().toLocaleDateString()}

### Executive Overview
${project.name} shows ${healthScore >= 80 ? 'strong performance' : healthScore >= 50 ? 'moderate progress with areas needing attention' : 'significant challenges requiring immediate action'}.

### Key Metrics
- **Health Score:** ${healthScore}%
- **Value Realized:** $${(totalValueRealized / 1000000).toFixed(2)}M of $${(totalValuePromised / 1000000).toFixed(2)}M promised (${totalValuePromised > 0 ? Math.round((totalValueRealized / totalValuePromised) * 100) : 0}%)
- **KPI Status:** ${kpisOnTrack} on track, ${kpisAtRisk} at risk, ${kpisOffTrack} off track

### Recommendations
${kpisOffTrack > 0 ? '1. Address off-track KPIs immediately\n' : ''}${kpisAtRisk > 0 ? '2. Review at-risk KPIs and develop intervention plans\n' : ''}3. Continue monitoring progress and celebrate wins`;
        
        res.json({ summary: fallbackSummary });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Success Stories
  app.get("/api/projects/:projectId/success-stories", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const stories = await storage.getSuccessStories(projectId);
      res.json(stories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/projects/:projectId/success-stories", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const validated = insertSuccessStorySchema.parse({
        ...req.body,
        projectId
      });
      const story = await storage.createSuccessStory(validated);
      res.json(story);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/success-stories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Validate partial update with Zod
      const validated = insertSuccessStorySchema.partial().parse(req.body);
      const updated = await storage.updateSuccessStory(id, validated);
      if (!updated) {
        return res.status(404).json({ error: "Success story not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/success-stories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSuccessStory(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI-powered Success Story Generation
  app.post("/api/projects/:projectId/success-stories/generate", async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    
    try {
      // Server-side lock: Reject if generation already in flight for this project
      if (generationLocks.has(projectId)) {
        return res.status(409).json({ error: "Success story generation already in progress for this project" });
      }
      
      // Acquire lock
      generationLocks.add(projectId);
      
      // Load project context
      const project = await storage.getProject(projectId);
      if (!project) {
        generationLocks.delete(projectId); // Release lock
        return res.status(404).json({ error: "Project not found" });
      }

      // Load discovery insights
      const dataPoints = await storage.getCompanyDataPoints(projectId);
      const discoveryInsights = dataPoints
        .filter(dp => dp.relevantCapability && dp.solutionArea)
        .map(dp => ({
          label: dp.label,
          value: dp.value,
          capability: dp.relevantCapability!,
          solutionArea: dp.solutionArea!
        }));

      // Load aligned KPIs from finalized discovery
      const transfer = await storage.getDiscoveryPhaseTransfer(projectId);
      const alignedKPIs: Array<{ kpiName: string; baseline: string; target: string }> = [];
      
      if (transfer?.isFinalized) {
        const jobs = await storage.getJobThemes(projectId);
        for (const job of jobs) {
          const kpis = await storage.getJobThemeKPIs(job.id);
          for (const kpi of kpis.filter(k => k.isSelected)) {
            alignedKPIs.push({
              kpiName: kpi.kpiName,
              baseline: kpi.baselineValue || 'Not set',
              target: kpi.targetValue || 'Not set'
            });
          }
        }
      }

      // Load notes content and enriched context from artifacts and Green Sheet
      const [notes, enrichedContext] = await Promise.all([
        storage.getDiscoveryNotes(projectId),
        getEnrichedDiscoveryContext(projectId, storage)
      ]);
      
      // Include enriched context in notes content for AI consideration (handle null safely)
      const baseNotes = notes?.freeformNotes || '';
      const notesContent = enrichedContext.combinedContext 
        ? `${baseNotes}${enrichedContext.combinedContext}`
        : baseNotes;

      // Generate AI recommendations
      const { recommendations } = await generateSuccessStoryRecommendations({
        companyName: project.companyName,
        industry: project.sector || undefined,
        discoveryInsights,
        alignedKPIs,
        notesContent
      });

      // Load existing stories for deduplication
      const existingStories = await storage.getSuccessStories(projectId);
      const existingUrls = new Set(existingStories.map(s => s.url.toLowerCase()));
      const existingTitles = new Set(existingStories.map(s => s.title.toLowerCase()));

      // Store each recommendation as a new success story (with deduplication)
      const createdStories = [];
      for (const rec of recommendations) {
        // Skip if duplicate URL or title already exists
        if (existingUrls.has(rec.url.toLowerCase()) || existingTitles.has(rec.title.toLowerCase())) {
          continue;
        }
        
        try {
          const story = await storage.createSuccessStory({
            projectId,
            title: rec.title,
            url: rec.url,
            category: rec.category,
            relevanceReason: rec.relevanceReason,
            industry: rec.industry,
            capabilityName: rec.capabilityName,
            solutionArea: rec.solutionArea,
            excerpt: rec.impactSummary
          });
          createdStories.push(story);
          
          // Add to deduplication sets to prevent duplicates within this batch
          existingUrls.add(rec.url.toLowerCase());
          existingTitles.add(rec.title.toLowerCase());
        } catch (error: any) {
          // Gracefully handle unique constraint violations (duplicate URL)
          // This can occur in rare race conditions or if AI returns duplicate URLs
          if (error.code === '23505' || error.message?.includes('unique constraint')) {
            console.log(`Skipping duplicate success story (unique constraint): ${rec.title} | ${rec.url}`);
            continue;
          }
          // Re-throw other errors
          throw error;
        }
      }

      res.json({ 
        success: true, 
        count: createdStories.length,
        stories: createdStories 
      });
    } catch (error: any) {
      console.error("Error generating success stories:", error);
      res.status(500).json({ error: error.message || "Failed to generate success stories" });
    } finally {
      // Always release lock
      generationLocks.delete(projectId);
    }
  });

  // ============================
  // Success Story Library Routes (Global verified stories for AI narrative generation)
  // ============================

  // GET /api/success-story-library - List all success stories with optional filters
  app.get("/api/success-story-library", async (req, res) => {
    try {
      const filters = {
        industry: req.query.industry as string | undefined,
        capabilityName: req.query.capabilityName as string | undefined,
        solutionArea: req.query.solutionArea as string | undefined,
        approvalStatus: req.query.approvalStatus as string | undefined,
      };
      
      // Remove undefined filters
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== undefined)
      );
      
      const stories = await storage.getSuccessStoryLibrary(
        Object.keys(cleanFilters).length > 0 ? cleanFilters : undefined
      );
      
      res.json(stories);
    } catch (error: any) {
      console.error("Error fetching success story library:", error);
      res.status(500).json({ error: error.message || "Failed to fetch success stories" });
    }
  });

  // GET /api/success-story-library/:id - Get a single success story
  app.get("/api/success-story-library/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const story = await storage.getSuccessStoryLibraryItem(id);
      
      if (!story) {
        return res.status(404).json({ error: "Success story not found" });
      }
      
      res.json(story);
    } catch (error: any) {
      console.error("Error fetching success story:", error);
      res.status(500).json({ error: error.message || "Failed to fetch success story" });
    }
  });

  // POST /api/success-story-library - Create a new success story
  app.post("/api/success-story-library", async (req, res) => {
    try {
      const insertSchema = insertSuccessStoryLibrarySchema;
      const validatedData = insertSchema.parse(req.body);
      
      const story = await storage.createSuccessStoryLibraryItem(validatedData);
      res.status(201).json(story);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error creating success story:", error);
      res.status(500).json({ error: error.message || "Failed to create success story" });
    }
  });

  // PATCH /api/success-story-library/:id - Update a success story
  app.patch("/api/success-story-library/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const story = await storage.updateSuccessStoryLibraryItem(id, req.body);
      
      if (!story) {
        return res.status(404).json({ error: "Success story not found" });
      }
      
      res.json(story);
    } catch (error: any) {
      console.error("Error updating success story:", error);
      res.status(500).json({ error: error.message || "Failed to update success story" });
    }
  });

  // POST /api/success-story-library/:id/approve - Approve a success story
  app.post("/api/success-story-library/:id/approve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { approvedBy } = req.body;
      
      if (!approvedBy) {
        return res.status(400).json({ error: "approvedBy field is required" });
      }
      
      const story = await storage.approveSuccessStoryLibraryItem(id, approvedBy);
      
      if (!story) {
        return res.status(404).json({ error: "Success story not found" });
      }
      
      res.json(story);
    } catch (error: any) {
      console.error("Error approving success story:", error);
      res.status(500).json({ error: error.message || "Failed to approve success story" });
    }
  });

  // DELETE /api/success-story-library/:id - Delete a success story
  app.delete("/api/success-story-library/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSuccessStoryLibraryItem(id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting success story:", error);
      res.status(500).json({ error: error.message || "Failed to delete success story" });
    }
  });

  // ============================
  // AI Value Narrative Generation
  // ============================

  // POST /api/projects/:projectId/value-cases/:valueCaseId/generate-narrative
  app.post("/api/projects/:projectId/value-cases/:valueCaseId/generate-narrative", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const valueCaseId = parseInt(req.params.valueCaseId);

      // Load project
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Load value case
      const valueCase = await storage.getValueCase(valueCaseId);
      if (!valueCase || valueCase.projectId !== projectId) {
        return res.status(404).json({ error: "Value case not found" });
      }

      // Load calculation results if available
      const calculationResults = valueCase.calculationResults as any;

      // Load KPIs linked to this value case
      const linkedKPIs = await Promise.all(
        (valueCase.linkedKPIs || []).map(async (kpiId: number) => {
          // Find KPI in job themes
          const jobs = await storage.getJobThemes(projectId);
          for (const job of jobs) {
            const kpis = await storage.getJobThemeKPIs(job.id);
            const kpi = kpis.find(k => k.id === kpiId);
            if (kpi) {
              return {
                kpiName: kpi.kpiName,
                unit: kpi.unit,
                baselineValue: kpi.baselineValue || "TBD",
                targetValue: kpi.targetValue || "TBD",
                kpiType: kpi.kpiType
              };
            }
          }
          return null;
        })
      ).then(kpis => kpis.filter(k => k !== null));

      // Load relevant success stories from library
      // Filter by capability and industry for relevance
      const successStories = await storage.getSuccessStoryLibrary({
        approvalStatus: "approved",
        capabilityName: valueCase.capabilityName || undefined,
      });

      // Further filter by industry similarity (optional - take top 3 most relevant)
      const relevantStories = successStories
        .slice(0, 3)
        .map(story => ({
          title: story.title,
          industry: story.industry,
          capabilityName: story.capabilityName,
          challenge: story.challenge || "",
          solution: story.solution || "",
          results: story.results || "",
          metrics: (story.metrics as Record<string, string>) || {},
          clientType: story.clientType || "Enterprise"
        }));

      if (relevantStories.length === 0) {
        return res.status(400).json({ 
          error: "No approved success stories found in the library. Please add verified stories before generating narratives." 
        });
      }

      // Generate narrative using AI
      const { generateValueNarrative } = await import("./ai");
      const narrativeOutput = await generateValueNarrative({
        valueCaseName: valueCase.name,
        capabilityName: valueCase.capabilityName || "Unknown",
        solutionArea: valueCase.solutionArea || "TRANSFORM",
        challenge: valueCase.challenge || "Organization facing strategic challenges",
        proposedSolution: valueCase.proposedSolution || "Strategic intervention to drive business impact",
        linkedKPIs,
        financialResults: calculationResults ? {
          totalNPV: calculationResults.totalNPV || 0,
          paybackMonths: calculationResults.paybackMonths || 0,
          yearOneImpact: calculationResults.yearOneImpact || 0,
          yearTwoImpact: calculationResults.yearTwoImpact || 0,
          yearThreeImpact: calculationResults.yearThreeImpact || 0,
          implementationCost: calculationResults.implementationCost || 0,
        } : undefined,
        companyName: project.companyName,
        industry: project.sector || "General Business",
        relevantSuccessStories: relevantStories
      });

      res.json({
        success: true,
        narrative: narrativeOutput,
        successStoriesUsed: relevantStories.length,
        metadata: {
          valueCaseName: valueCase.name,
          companyName: project.companyName,
          capability: valueCase.capabilityName,
          hasFinancials: !!calculationResults,
          linkedKPICount: linkedKPIs.length
        }
      });
    } catch (error: any) {
      console.error("Error generating value narrative:", error);
      res.status(500).json({ error: error.message || "Failed to generate value narrative" });
    }
  });
  
  // ============================
  // Alignment Share Links Routes (Customer Collaboration)
  // ============================
  
  // Generate shareable link for customer collaboration
  app.post("/api/projects/:projectId/alignment/share", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { customerName, customerEmail, expiresInDays } = req.body;
      
      // Verify project exists
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Generate unique share token
      const shareToken = crypto.randomUUID();
      
      // Calculate expiration date if provided
      const expiresAt = expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : null;
      
      // Create share link with edit + comment permissions by default
      const shareLink = await storage.createAlignmentShareLink({
        projectId,
        shareToken,
        customerName: customerName ? sanitizeInput(customerName) : null,
        customerEmail: customerEmail ? sanitizeInput(customerEmail) : null,
        permissions: "edit", // Customers can edit baseline/target and add comments
        status: "active",
        expiresAt
      });
      
      res.json({
        success: true,
        shareLink,
        shareUrl: `/shared/alignment/${shareToken}`
      });
    } catch (error: any) {
      console.error("Error creating alignment share link:", error);
      res.status(500).json({ error: error.message || "Failed to create share link" });
    }
  });
  
  // Get alignment data by share token (public access)
  app.get("/api/alignment/shared/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      // Find share link
      const shareLink = await storage.getAlignmentShareLinkByToken(token);
      if (!shareLink) {
        return res.status(404).json({ error: "Share link not found" });
      }
      
      // Check if link is active and not expired
      if (shareLink.status !== "active") {
        return res.status(403).json({ error: "This link has been revoked" });
      }
      if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
        return res.status(403).json({ error: "This link has expired" });
      }
      
      // Update last accessed timestamp
      await storage.updateAlignmentShareLink(shareLink.id, {
        lastAccessedAt: new Date()
      });
      
      // Get project
      const project = await storage.getProject(shareLink.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Get discovery phase transfer to find finalized job themes
      const transfer = await storage.getDiscoveryPhaseTransfer(shareLink.projectId);
      if (!transfer || !transfer.isFinalized) {
        return res.json({
          project: {
            name: project.name,
            companyName: project.companyName,
            companyLogoUrl: project.companyLogoUrl,
          },
          jobThemes: [],
          permissions: shareLink.permissions,
          customerName: shareLink.customerName
        });
      }
      
      // Get only finalized job themes with KPIs
      const finalizedJobIds = transfer.finalizedJobThemeIds || [];
      const jobThemesWithKPIs = [];
      
      for (const jobId of finalizedJobIds) {
        const job = await storage.getJobTheme(jobId);
        if (job) {
          const kpis = await storage.getJobThemeKPIs(jobId);
          console.log(`[GET shared alignment] Job ${jobId} has ${kpis.length} KPIs (${kpis.filter(k => k.isSelected).length} selected)`);
          jobThemesWithKPIs.push({
            ...job,
            kpis: kpis
          });
        }
      }
      
      // Sort by priority rank
      jobThemesWithKPIs.sort((a, b) => (a.priorityRank || 999) - (b.priorityRank || 999));
      
      console.log(`[GET shared alignment] Returning ${jobThemesWithKPIs.length} finalized jobs with total ${jobThemesWithKPIs.reduce((sum, j) => sum + j.kpis.length, 0)} KPIs`);
      
      res.json({
        project: {
          name: project.name,
          companyName: project.companyName,
          companyLogoUrl: project.companyLogoUrl,
        },
        jobThemes: jobThemesWithKPIs,
        permissions: shareLink.permissions,
        customerName: shareLink.customerName
      });
    } catch (error: any) {
      console.error("Error fetching shared alignment:", error);
      res.status(500).json({ error: error.message || "Failed to fetch alignment data" });
    }
  });
  
  // Generate AI rationale for KPI (public endpoint for shared link)
  app.post("/api/alignment/shared/:token/kpis/:kpiId/generate-rationale", async (req, res) => {
    try {
      const { token, kpiId } = req.params;
      
      // Find share link
      const shareLink = await storage.getAlignmentShareLinkByToken(token);
      if (!shareLink) {
        return res.status(404).json({ error: "Share link not found" });
      }
      
      // Verify permissions
      if (shareLink.status !== "active") {
        return res.status(403).json({ error: "This link has been revoked" });
      }
      if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
        return res.status(403).json({ error: "This link has expired" });
      }
      
      // Get KPI
      const kpi = await storage.getJobThemeKPI(parseInt(kpiId));
      if (!kpi) {
        return res.status(404).json({ error: "KPI not found" });
      }
      
      // Verify KPI has baseline and target values
      if (!kpi.baselineValue || !kpi.targetValue) {
        return res.status(400).json({ 
          error: "Both baseline and target values are required to generate rationale" 
        });
      }
      
      // Get project for context
      const project = await storage.getProject(shareLink.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Get customer questionnaire responses for context
      const sharedQuestionnaire = await storage.getSharedQuestionnaire(shareLink.projectId);
      const customerResponses = sharedQuestionnaire 
        ? await storage.getQuestionResponsesByQuestionnaire(sharedQuestionnaire.id)
        : [];
      
      // Get company insights for context
      const companyDataPoints = await storage.getCompanyDataPoints(shareLink.projectId);
      const selectedInsights = companyDataPoints
        .filter(dp => dp.selectedForNotes)
        .slice(0, 10); // Top 10 insights
      
      // Generate rationale using AI
      const result = await ai.generateKPIRationale({
        kpiName: kpi.kpiName,
        unit: kpi.unit,
        baselineValue: kpi.baselineValue,
        targetValue: kpi.targetValue,
        companyName: project.companyName,
        industry: project.sector || "Unknown",
        customerResponses: customerResponses.map(r => ({
          question: r.question || "",
          answer: r.answer,
          respondentName: r.respondentName
        })),
        companyInsights: selectedInsights.map(dp => ({
          label: dp.label,
          value: dp.value
        }))
      });
      
      res.json(result);
    } catch (error: any) {
      console.error("Error generating KPI rationale:", error);
      res.status(500).json({ error: error.message || "Failed to generate rationale" });
    }
  });

  // Update KPI with customer input (public endpoint for shared link)
  app.patch("/api/alignment/shared/:token/kpis/:kpiId", async (req, res) => {
    try {
      const { token, kpiId } = req.params;
      const { baselineValue, targetValue, customerComment, customerName } = req.body;
      
      // Find share link
      const shareLink = await storage.getAlignmentShareLinkByToken(token);
      if (!shareLink) {
        return res.status(404).json({ error: "Share link not found" });
      }
      
      // Verify permissions
      if (shareLink.status !== "active") {
        return res.status(403).json({ error: "This link has been revoked" });
      }
      if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
        return res.status(403).json({ error: "This link has expired" });
      }
      if (shareLink.permissions === "view") {
        return res.status(403).json({ error: "You do not have permission to edit" });
      }
      
      // Build update object with attribution
      const updateData: any = {};
      
      if (baselineValue !== undefined) {
        updateData.baselineValue = baselineValue;
        updateData.baselineEnteredBy = "customer";
        updateData.baselineEnteredByName = customerName ? sanitizeInput(customerName) : "Customer";
      }
      
      if (targetValue !== undefined) {
        updateData.targetValue = targetValue;
        updateData.targetEnteredBy = "customer";
        updateData.targetEnteredByName = customerName ? sanitizeInput(customerName) : "Customer";
      }
      
      if (customerComment !== undefined) {
        updateData.customerComment = sanitizeInput(customerComment);
        updateData.customerCommentedAt = new Date();
      }
      
      // Update KPI
      const updatedKPI = await storage.updateJobThemeKPI(parseInt(kpiId), updateData);
      
      if (!updatedKPI) {
        return res.status(404).json({ error: "KPI not found" });
      }
      
      res.json(updatedKPI);
    } catch (error: any) {
      console.error("Error updating KPI from shared link:", error);
      res.status(500).json({ error: error.message || "Failed to update KPI" });
    }
  });
  
  // Approve a KPI from shared link
  app.post("/api/alignment/shared/:token/kpis/:kpiId/approve", async (req, res) => {
    try {
      const { token, kpiId } = req.params;
      const { customerName } = req.body;
      
      // Find share link
      const shareLink = await storage.getAlignmentShareLinkByToken(token);
      if (!shareLink) {
        return res.status(404).json({ error: "Share link not found" });
      }
      
      // Verify permissions
      if (shareLink.status !== "active") {
        return res.status(403).json({ error: "This link has been revoked" });
      }
      if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
        return res.status(403).json({ error: "This link has expired" });
      }
      if (shareLink.permissions === "view") {
        return res.status(403).json({ error: "You do not have permission to approve" });
      }
      
      // Update KPI with approval
      const updateData = {
        approvalStatus: "approved",
        approvedBy: customerName ? sanitizeInput(customerName) : "Customer",
        approvedAt: new Date().toISOString()
      };
      
      const updatedKPI = await storage.updateJobThemeKPI(parseInt(kpiId), updateData);
      
      if (!updatedKPI) {
        return res.status(404).json({ error: "KPI not found" });
      }
      
      res.json(updatedKPI);
    } catch (error: any) {
      console.error("Error approving KPI from shared link:", error);
      res.status(500).json({ error: error.message || "Failed to approve KPI" });
    }
  });
  
  // Add a comment to a KPI from shared link
  app.post("/api/alignment/shared/:token/kpis/:kpiId/comments", async (req, res) => {
    try {
      const { token, kpiId } = req.params;
      const { text, customerName } = req.body;
      
      if (!text || !text.trim()) {
        return res.status(400).json({ error: "Comment text is required" });
      }
      
      // Find share link
      const shareLink = await storage.getAlignmentShareLinkByToken(token);
      if (!shareLink) {
        return res.status(404).json({ error: "Share link not found" });
      }
      
      // Verify permissions
      if (shareLink.status !== "active") {
        return res.status(403).json({ error: "This link has been revoked" });
      }
      if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
        return res.status(403).json({ error: "This link has expired" });
      }
      if (shareLink.permissions === "view") {
        return res.status(403).json({ error: "You do not have permission to comment" });
      }
      
      // Get existing KPI to retrieve current comments
      const kpiIdNum = parseInt(kpiId);
      const existingKPI = await storage.getJobThemeKPI(kpiIdNum);
      
      if (!existingKPI) {
        return res.status(404).json({ error: "KPI not found" });
      }
      
      // Add new comment to existing comments array
      const existingComments = (existingKPI as any).comments || [];
      const newComment = {
        id: `comment_${Date.now()}`,
        text: sanitizeInput(text),
        author: customerName ? sanitizeInput(customerName) : "Customer",
        authorType: "customer",
        createdAt: new Date().toISOString()
      };
      
      const updatedKPI = await storage.updateJobThemeKPI(kpiIdNum, {
        comments: [...existingComments, newComment]
      } as any);
      
      res.json(updatedKPI);
    } catch (error: any) {
      console.error("Error adding comment to KPI from shared link:", error);
      res.status(500).json({ error: error.message || "Failed to add comment" });
    }
  });
  
  // Get existing share link for a project
  app.get("/api/projects/:projectId/alignment/share", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const shareLink = await storage.getAlignmentShareLink(projectId);
      
      if (!shareLink) {
        return res.json({ shareLink: null });
      }
      
      res.json({
        shareLink,
        shareUrl: `/shared/alignment/${shareLink.shareToken}`
      });
    } catch (error: any) {
      console.error("Error fetching alignment share link:", error);
      res.status(500).json({ error: error.message || "Failed to fetch share link" });
    }
  });
  
  // Revoke a share link
  app.delete("/api/projects/:projectId/alignment/share/:linkId", async (req, res) => {
    try {
      const linkId = parseInt(req.params.linkId);
      
      await storage.updateAlignmentShareLink(linkId, {
        status: "revoked"
      });
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error revoking alignment share link:", error);
      res.status(500).json({ error: error.message || "Failed to revoke share link" });
    }
  });

  // ============================================================================
  // CUSTOMER PORTAL API - Full collaboration portal for clients
  // ============================================================================

  // Get customer portal data by share token
  app.get("/api/portal/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      const shareLink = await storage.getAlignmentShareLinkByToken(token);
      if (!shareLink) {
        return res.status(404).json({ error: "Portal link not found" });
      }
      
      if (shareLink.status !== "active") {
        return res.status(403).json({ error: "This portal link has been revoked" });
      }
      if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
        return res.status(403).json({ error: "This portal link has expired" });
      }
      
      await storage.updateAlignmentShareLink(shareLink.id, {
        lastAccessedAt: new Date()
      });
      
      const project = await storage.getProject(shareLink.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const strategySelection = await storage.getStrategySelection(shareLink.projectId);
      // Access the correct field names from the database schema
      const generatedStrategies = (strategySelection?.generatedStrategies as any[]) || [];
      const selectedStrategyIds = strategySelection?.selectedStrategyIds || [];
      const strategies = generatedStrategies.filter((s: any) => selectedStrategyIds.includes(s?.id));
      const generatedOutcomes = (strategySelection?.generatedOutcomes as any[]) || [];
      const selectedOutcomeIds = strategySelection?.selectedOutcomeIds || [];
      const outcomes = generatedOutcomes.filter((o: any) => selectedOutcomeIds.includes(o?.id));
      
      const commitments = await storage.getKpiCommitments(shareLink.projectId);
      
      // Get discovery data for summary
      const discoveryNotesData = await storage.getDiscoveryNotes(shareLink.projectId);
      const themes = await storage.getJobThemes(shareLink.projectId) || [];
      // Get company data points (AI-generated insights) instead of non-existent getAIInsights
      const companyDataPoints = await storage.getCompanyDataPoints(shareLink.projectId) || [];
      const aiInsights = companyDataPoints.filter(dp => dp.provenance === 'ai_generated');
      
      // Get discovery synthesis if available
      const discoverySynthesis = (project as any).discoverySynthesis || null;
      
      // Get meeting transcripts and artifacts
      const artifacts = await storage.getInteractionArtifactsByContext(shareLink.projectId, "post_meeting");
      
      res.json({
        project: {
          id: project.id,
          name: project.name,
          companyName: project.companyName,
          companyLogoUrl: project.companyLogoUrl,
          sector: project.sector,
        },
        strategies,
        outcomes,
        commitments: commitments.map(c => {
          const provenance = (c.aiProvenance as any) || {};
          return {
            id: c.id,
            commitmentTitle: c.commitmentTitle,
            commitmentDescription: c.commitmentDescription,
            status: c.status,
            valuePillar: c.valuePillar,
            baselineValue: c.baselineValue,
            targetValue: c.targetValue,
            metricUnit: c.metricUnit,
            // Include client edit tracking
            clientEditedAt: provenance.clientEditedAt || null,
            clientEditedBy: provenance.clientEditedBy || null,
            clientConfirmed: provenance.clientConfirmed || false,
          };
        }),
        // Discovery summary data
        discovery: {
          themes: themes.map(t => ({
            id: t.id,
            name: t.name,
            description: t.description,
            priority: t.priority,
          })),
          notes: discoveryNotesData ? [{
            id: discoveryNotesData.id,
            content: discoveryNotesData.freeformNotes || '',
            noteType: 'discovery',
            keyStakeholder: discoveryNotesData.keyStakeholder,
            topChallenges: discoveryNotesData.topChallenges,
            timeline: discoveryNotesData.timeline,
          }] : [],
          insights: aiInsights.slice(0, 10).map(i => ({
            id: i.id,
            headline: i.label,
            insightType: i.kornFerryPillar || 'general',
            keyFinding: i.value,
            strategicImplication: i.relevantJob || null,
          })),
          synthesis: discoverySynthesis,
          meetingNotes: artifacts.filter(a => a.freeformNotes).map(a => ({
            id: a.id,
            title: a.title,
            notes: a.freeformNotes,
            createdAt: a.createdAt,
          })),
        },
        permissions: shareLink.permissions,
        customerName: shareLink.customerName,
        welcomeMessage: shareLink.welcomeMessage,
        portalTitle: shareLink.portalTitle,
        portalSections: shareLink.portalSections || { overview: true, strategies: true, outcomes: true, progress: true },
        clientComments: shareLink.clientComments || [],
        clientApprovals: shareLink.clientApprovals || [],
      });
    } catch (error: any) {
      console.error("Error fetching customer portal:", error);
      res.status(500).json({ error: error.message || "Failed to fetch portal data" });
    }
  });

  // Add comment to portal item
  app.post("/api/portal/:token/comment", async (req, res) => {
    try {
      const { token } = req.params;
      const { section, itemId, comment, customerName } = req.body;
      
      const shareLink = await storage.getAlignmentShareLinkByToken(token);
      if (!shareLink) {
        return res.status(404).json({ error: "Portal link not found" });
      }
      
      if (shareLink.status !== "active") {
        return res.status(403).json({ error: "This portal link has been revoked" });
      }
      if (shareLink.permissions === "view") {
        return res.status(403).json({ error: "You do not have permission to comment" });
      }
      
      const existingComments = shareLink.clientComments || [];
      const newComment = {
        id: `comment_${Date.now()}`,
        section: sanitizeInput(section),
        itemId: sanitizeInput(itemId),
        comment: sanitizeInput(comment),
        createdAt: new Date().toISOString(),
        customerName: sanitizeInput(customerName) || "Anonymous",
      };
      
      await storage.updateAlignmentShareLink(shareLink.id, {
        clientComments: [...existingComments, newComment] as any,
      });
      
      res.json({ success: true, comment: newComment });
    } catch (error: any) {
      console.error("Error adding portal comment:", error);
      res.status(500).json({ error: error.message || "Failed to add comment" });
    }
  });

  // Approve portal item
  app.post("/api/portal/:token/approve", async (req, res) => {
    try {
      const { token } = req.params;
      const { section, itemId, customerName } = req.body;
      
      const shareLink = await storage.getAlignmentShareLinkByToken(token);
      if (!shareLink) {
        return res.status(404).json({ error: "Portal link not found" });
      }
      
      if (shareLink.status !== "active") {
        return res.status(403).json({ error: "This portal link has been revoked" });
      }
      if (shareLink.permissions === "view") {
        return res.status(403).json({ error: "You do not have permission to approve items" });
      }
      
      const existingApprovals = shareLink.clientApprovals || [];
      const existingIndex = existingApprovals.findIndex(
        a => a.section === section && a.itemId === itemId
      );
      
      const newApproval = {
        section: sanitizeInput(section),
        itemId: sanitizeInput(itemId),
        approved: true,
        approvedAt: new Date().toISOString(),
        customerName: sanitizeInput(customerName) || "Anonymous",
      };
      
      let updatedApprovals;
      if (existingIndex >= 0) {
        updatedApprovals = [...existingApprovals];
        updatedApprovals[existingIndex] = newApproval;
      } else {
        updatedApprovals = [...existingApprovals, newApproval];
      }
      
      await storage.updateAlignmentShareLink(shareLink.id, {
        clientApprovals: updatedApprovals as any,
      });
      
      res.json({ success: true, approval: newApproval });
    } catch (error: any) {
      console.error("Error adding portal approval:", error);
      res.status(500).json({ error: error.message || "Failed to add approval" });
    }
  });

  // Update outcome baselines from customer portal
  const portalOutcomeUpdateSchema = z.object({
    baseline: z.string().max(100).optional(),
    target: z.string().max(100).optional(),
    customerName: z.string().max(100).optional(),
  }).strict();

  app.patch("/api/portal/:token/outcome/:outcomeId", async (req, res) => {
    try {
      const { token, outcomeId } = req.params;
      
      // Validate input with Zod schema
      const parseResult = portalOutcomeUpdateSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid input", details: parseResult.error.errors });
      }
      
      const { baseline, target, customerName } = parseResult.data;
      
      const shareLink = await storage.getAlignmentShareLinkByToken(token);
      if (!shareLink) {
        return res.status(404).json({ error: "Portal link not found" });
      }
      
      if (shareLink.status !== "active") {
        return res.status(403).json({ error: "This portal link has been revoked" });
      }
      if (shareLink.permissions !== "edit") {
        return res.status(403).json({ error: "You do not have permission to edit" });
      }
      
      // Get current strategy selection and update the outcome
      const strategySelection = await storage.getStrategySelection(shareLink.projectId);
      if (!strategySelection) {
        return res.status(404).json({ error: "Strategy selection not found" });
      }
      
      // Access the correct field name from database schema
      const outcomes = (strategySelection.generatedOutcomes as any[]) || [];
      const outcomeIndex = outcomes.findIndex((o: any) => o.id === outcomeId);
      
      if (outcomeIndex === -1) {
        return res.status(404).json({ error: "Outcome not found" });
      }
      
      // Update the outcome's baseline/target
      const updatedOutcomes = [...outcomes];
      const outcomeData = updatedOutcomes[outcomeIndex];
      updatedOutcomes[outcomeIndex] = {
        ...outcomeData,
        kpiDetails: {
          ...outcomeData.kpiDetails,
          suggestedBaseline: baseline !== undefined ? sanitizeInput(baseline) : outcomeData.kpiDetails.suggestedBaseline,
          suggestedTarget: target !== undefined ? sanitizeInput(target) : outcomeData.kpiDetails.suggestedTarget,
        },
        clientEditedAt: new Date().toISOString(),
        clientEditedBy: sanitizeInput(customerName) || "Anonymous",
        clientConfirmed: true, // Mark as confirmed by client
      };
      
      await storage.updateStrategySelection(shareLink.projectId, {
        generatedOutcomes: updatedOutcomes,
      });
      
      // Also update the corresponding kpiCommitment if it exists
      // Find commitment by matching outcome name to commitment title
      const commitments = await storage.getKpiCommitments(shareLink.projectId);
      const matchingCommitment = commitments.find(c => 
        c.commitmentTitle.toLowerCase() === outcomeData.outcomeName?.toLowerCase() ||
        c.commitmentTitle.toLowerCase().includes(outcomeData.outcomeName?.toLowerCase())
      );
      
      if (matchingCommitment) {
        // Update the commitment with client-provided baselines
        const existingProvenance = (matchingCommitment.aiProvenance as any) || {};
        await storage.updateKpiCommitment(matchingCommitment.id, {
          baselineValue: baseline !== undefined ? sanitizeInput(baseline) : matchingCommitment.baselineValue,
          targetValue: target !== undefined ? sanitizeInput(target) : matchingCommitment.targetValue,
          // Add client edit tracking to provenance metadata
          aiProvenance: {
            ...existingProvenance,
            clientEditedAt: new Date().toISOString(),
            clientEditedBy: sanitizeInput(customerName) || "Anonymous",
            clientConfirmed: true,
            originalBaseline: existingProvenance.originalBaseline || matchingCommitment.baselineValue,
            originalTarget: existingProvenance.originalTarget || matchingCommitment.targetValue,
          },
        });
      }
      
      res.json({ 
        success: true, 
        outcome: updatedOutcomes[outcomeIndex],
        commitmentUpdated: !!matchingCommitment,
      });
    } catch (error: any) {
      console.error("Error updating outcome from portal:", error);
      res.status(500).json({ error: error.message || "Failed to update outcome" });
    }
  });

  // Create/update portal share link for a project
  app.post("/api/projects/:projectId/portal/share", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { 
        customerName, 
        customerEmail, 
        expiresInDays, 
        portalTitle, 
        welcomeMessage,
        portalSections 
      } = req.body;
      
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const existingLink = await storage.getAlignmentShareLink(projectId);
      
      if (existingLink && existingLink.status === "active") {
        const updated = await storage.updateAlignmentShareLink(existingLink.id, {
          customerName: customerName ? sanitizeInput(customerName) : existingLink.customerName,
          customerEmail: customerEmail ? sanitizeInput(customerEmail) : existingLink.customerEmail,
          portalTitle: portalTitle ? sanitizeInput(portalTitle) : existingLink.portalTitle,
          welcomeMessage: welcomeMessage ? sanitizeInput(welcomeMessage) : existingLink.welcomeMessage,
          portalSections: portalSections || existingLink.portalSections,
        });
        
        return res.json({
          shareLink: updated,
          shareUrl: `/portal/${updated?.shareToken}`,
        });
      }
      
      const shareToken = `portal_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const expiresAt = expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : null;
      
      const newLink = await storage.createAlignmentShareLink({
        projectId,
        shareToken,
        customerName: customerName ? sanitizeInput(customerName) : null,
        customerEmail: customerEmail ? sanitizeInput(customerEmail) : null,
        permissions: "edit",
        status: "active",
        expiresAt,
        portalTitle: portalTitle ? sanitizeInput(portalTitle) : "Collaboration Portal",
        welcomeMessage: welcomeMessage ? sanitizeInput(welcomeMessage) : null,
        portalSections: portalSections || { overview: true, strategies: true, outcomes: true, progress: true },
      });
      
      res.json({
        shareLink: newLink,
        shareUrl: `/portal/${newLink.shareToken}`,
      });
    } catch (error: any) {
      console.error("Error creating portal share link:", error);
      res.status(500).json({ error: error.message || "Failed to create portal link" });
    }
  });

  // Get existing portal share link for a project
  app.get("/api/projects/:projectId/portal/share", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const shareLink = await storage.getAlignmentShareLink(projectId);
      
      if (!shareLink) {
        return res.json({ shareLink: null });
      }
      
      res.json({
        shareLink,
        shareUrl: `/portal/${shareLink.shareToken}`,
      });
    } catch (error: any) {
      console.error("Error fetching portal share link:", error);
      res.status(500).json({ error: error.message || "Failed to fetch share link" });
    }
  });
  
  // Dashboard Layouts - User-configurable widget arrangements
  app.get("/api/projects/:projectId/dashboard-layout", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const layout = await storage.getDashboardLayout(projectId);
      
      if (!layout) {
        // Return default layout if none exists
        return res.json({ layout: null });
      }
      
      res.json(layout);
    } catch (error: any) {
      console.error("Error fetching dashboard layout:", error);
      res.status(500).json({ error: error.message || "Failed to fetch dashboard layout" });
    }
  });
  
  app.put("/api/projects/:projectId/dashboard-layout", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { layoutConfig, widgets } = req.body;
      
      if (!layoutConfig || !widgets) {
        return res.status(400).json({ error: "Missing layoutConfig or widgets" });
      }
      
      const layout = await storage.upsertDashboardLayout({
        projectId,
        layoutConfig,
        widgets
      });
      
      res.json(layout);
    } catch (error: any) {
      console.error("Error saving dashboard layout:", error);
      res.status(500).json({ error: error.message || "Failed to save dashboard layout" });
    }
  });
  
  // ============================================================================
  // AI VALUE JUSTIFICATION SYSTEM
  // ============================================================================
  
  // Get aggregated Discovery context for a priority (for AI value justification)
  app.get("/api/projects/:projectId/priorities/:priorityId/context", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const priorityId = parseInt(req.params.priorityId);
      
      // Fetch the priority (job theme)
      const jobThemes = await storage.getJobThemes(projectId);
      const priority = jobThemes.find(jt => jt.id === priorityId);
      
      if (!priority) {
        return res.status(404).json({ error: "Priority not found" });
      }
      
      // Fetch all related Discovery data in parallel
      const [
        project,
        companyDataPoints,
        discoveryNotes,
        discoveryQuestions,
        questionResponses,
        kpis
      ] = await Promise.all([
        storage.getProject(projectId),
        storage.getCompanyDataPoints(projectId),
        storage.getDiscoveryNotes(projectId),
        storage.getDiscoveryQuestions(projectId),
        storage.getQuestionResponses(projectId),
        storage.getJobThemeKPIs(priorityId)
      ]);
      
      // Filter insights linked to this priority
      const linkedInsights = companyDataPoints.filter(dp => 
        priority.sourceInsightIds?.includes(dp.id)
      );
      
      // Filter question responses linked to this priority  
      const linkedResponses = questionResponses.filter(qr =>
        priority.sourceResponseIds?.includes(qr.id)
      );
      
      // Get questions for the linked responses
      const linkedQuestionIds = linkedResponses.map(r => r.questionId);
      const linkedQuestions = discoveryQuestions.filter(q => 
        linkedQuestionIds.includes(q.id)
      );
      
      // Build context object
      const context = {
        priority: {
          id: priority.id,
          name: priority.jobName,
          capabilityName: priority.capabilityName,
          solutionArea: priority.solutionArea,
          aggregationSummary: priority.aggregationSummary,
          priorityRank: priority.priorityRank
        },
        company: project ? {
          name: project.companyName,
          sector: project.sector,
          businessUnit: project.businessUnit
        } : null,
        discoveryInsights: linkedInsights.map(insight => ({
          id: insight.id,
          label: insight.label,
          value: insight.value,
          confidence: insight.confidence,
          source: insight.source,
          kornFerryPillar: insight.kornFerryPillar,
          solutionArea: insight.solutionArea,
          relatedKPIs: insight.relatedKPIs
        })),
        discoveryNotes: discoveryNotes ? {
          freeformNotes: discoveryNotes.freeformNotes,
          keyStakeholder: discoveryNotes.keyStakeholder,
          topChallenges: discoveryNotes.topChallenges,
          timeline: discoveryNotes.timeline
        } : null,
        questionnaireResponses: linkedResponses.map(response => {
          const question = linkedQuestions.find(q => q.id === response.questionId);
          return {
            id: response.id,
            question: question?.question || "Unknown question",
            answer: response.answer,
            respondentType: response.respondentType,
            respondentName: response.respondentName
          };
        }),
        kpis: kpis.filter(k => k.isSelected).map(kpi => ({
          id: kpi.id,
          name: kpi.kpiName,
          type: kpi.kpiType,
          unit: kpi.unit,
          baselineValue: kpi.baselineValue,
          baselineSource: kpi.baselineSource,
          targetValue: kpi.targetValue,
          targetSource: kpi.targetSource,
          benchmarkValue: kpi.benchmarkValue,
          benchmarkSource: kpi.benchmarkSource,
          definition: kpi.definition,
          aiStrategicRationale: kpi.aiStrategicRationale,
          aiKornFerryBenchmark: kpi.aiKornFerryBenchmark
        })),
        // Calculate KPI gaps for financial context
        kpiGaps: kpis.filter(k => k.isSelected && k.baselineValue && k.targetValue).map(kpi => {
          const baseline = parseNumeric(kpi.baselineValue);
          const target = parseNumeric(kpi.targetValue);
          const gap = baseline !== null && target !== null ? target - baseline : null;
          const percentImprovement = baseline !== null && target !== null && baseline !== 0 
            ? ((target - baseline) / baseline * 100).toFixed(1) 
            : null;
          return {
            kpiName: kpi.kpiName,
            baseline,
            target,
            gap,
            percentImprovement,
            unit: kpi.unit
          };
        })
      };
      
      res.json(context);
    } catch (error: any) {
      console.error("Error fetching priority context:", error);
      res.status(500).json({ error: error.message || "Failed to fetch priority context" });
    }
  });
  
  // Generate AI value justification draft for a priority
  app.post("/api/projects/:projectId/priorities/:priorityId/value-justification/generate", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const priorityId = parseInt(req.params.priorityId);
      const { tone = "executive", focusAreas = [], includeFinancials = true } = req.body;
      
      // First get the context
      const jobThemes = await storage.getJobThemes(projectId);
      const priority = jobThemes.find(jt => jt.id === priorityId);
      
      if (!priority) {
        return res.status(404).json({ error: "Priority not found" });
      }
      
      // Fetch all context data
      const [
        project,
        companyDataPoints,
        discoveryNotes,
        questionResponses,
        kpis
      ] = await Promise.all([
        storage.getProject(projectId),
        storage.getCompanyDataPoints(projectId),
        storage.getDiscoveryNotes(projectId),
        storage.getQuestionResponses(projectId),
        storage.getJobThemeKPIs(priorityId)
      ]);
      
      // Filter linked data
      const linkedInsights = companyDataPoints.filter(dp => 
        priority.sourceInsightIds?.includes(dp.id)
      );
      const linkedResponses = questionResponses.filter(qr =>
        priority.sourceResponseIds?.includes(qr.id)
      );
      const selectedKPIs = kpis.filter(k => k.isSelected);
      
      // Check if a value justification already exists for this priority
      let existingJustification = await storage.getValueJustification(priorityId);
      
      // Generate AI draft using OpenAI
      const { generateValueJustificationDraft } = await import("./ai");
      const aiResult = await generateValueJustificationDraft({
        priority: {
          name: priority.jobName,
          capabilityName: priority.capabilityName,
          solutionArea: priority.solutionArea,
          summary: priority.aggregationSummary
        },
        company: project ? {
          name: project.companyName,
          sector: project.sector
        } : undefined,
        insights: linkedInsights.map(i => ({
          label: i.label,
          value: i.value,
          confidence: i.confidence
        })),
        notes: discoveryNotes ? {
          freeformNotes: discoveryNotes.freeformNotes,
          challenges: discoveryNotes.topChallenges
        } : undefined,
        responses: linkedResponses.map(r => ({
          question: "Client feedback",
          answer: r.answer
        })),
        kpis: selectedKPIs.map(k => ({
          name: k.kpiName,
          unit: k.unit,
          baseline: k.baselineValue,
          target: k.targetValue,
          benchmark: k.aiKornFerryBenchmark
        })),
        tone,
        focusAreas,
        includeFinancials
      });
      
      // Create or update the value justification
      const sessionId = crypto.randomUUID();
      
      if (existingJustification) {
        // Update existing
        const updated = await storage.updateValueJustification(existingJustification.id, {
          draftContent: aiResult.draftContent,
          executiveSummary: aiResult.executiveSummary,
          aiSessionId: sessionId,
          aiModelVersion: "gpt-4o",
          linkedDiscoveryInsightIds: linkedInsights.map(i => i.id),
          linkedQuestionResponseIds: linkedResponses.map(r => r.id),
          linkedKPIIds: selectedKPIs.map(k => k.id),
          projectedValue: aiResult.projectedValue,
          projectedValueTimeframe: aiResult.projectedValueTimeframe,
          confidenceLevel: aiResult.confidenceLevel,
          version: existingJustification.version + 1,
          status: "draft"
        });
        
        // Clear old messages for new session
        await storage.deleteValueJustificationMessages(existingJustification.id);
        
        // Add system message
        await storage.createValueJustificationMessage({
          valueJustificationId: existingJustification.id,
          role: "system",
          content: `Value justification regenerated with ${tone} tone. Ready for refinement.`,
          appliedToVersion: existingJustification.version + 1
        });
        
        res.json({
          justification: updated,
          isNew: false
        });
      } else {
        // Create new
        const newJustification = await storage.createValueJustification({
          projectId,
          jobThemeId: priorityId,
          title: `${priority.jobName} - Value Justification`,
          draftContent: aiResult.draftContent,
          executiveSummary: aiResult.executiveSummary,
          aiSessionId: sessionId,
          aiModelVersion: "gpt-4o",
          linkedDiscoveryInsightIds: linkedInsights.map(i => i.id),
          linkedQuestionResponseIds: linkedResponses.map(r => r.id),
          linkedKPIIds: selectedKPIs.map(k => k.id),
          projectedValue: aiResult.projectedValue,
          projectedValueTimeframe: aiResult.projectedValueTimeframe,
          confidenceLevel: aiResult.confidenceLevel,
          status: "draft"
        });
        
        // Add system message
        await storage.createValueJustificationMessage({
          valueJustificationId: newJustification.id,
          role: "system",
          content: `Value justification generated with ${tone} tone. You can refine it by asking me to make changes.`,
          appliedToVersion: 1
        });
        
        res.json({
          justification: newJustification,
          isNew: true
        });
      }
    } catch (error: any) {
      console.error("Error generating value justification:", error);
      res.status(500).json({ error: error.message || "Failed to generate value justification" });
    }
  });
  
  // Get value justification with chat messages
  app.get("/api/value-justifications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const [justification, messages] = await Promise.all([
        storage.getValueJustificationById(id),
        storage.getValueJustificationMessages(id)
      ]);
      
      if (!justification) {
        return res.status(404).json({ error: "Value justification not found" });
      }
      
      res.json({
        ...justification,
        messages
      });
    } catch (error: any) {
      console.error("Error fetching value justification:", error);
      res.status(500).json({ error: error.message || "Failed to fetch value justification" });
    }
  });
  
  // Get value justification by priority ID
  app.get("/api/projects/:projectId/priorities/:priorityId/value-justification", async (req, res) => {
    try {
      const priorityId = parseInt(req.params.priorityId);
      
      const justification = await storage.getValueJustification(priorityId);
      
      if (!justification) {
        return res.json({ justification: null });
      }
      
      const messages = await storage.getValueJustificationMessages(justification.id);
      
      res.json({
        justification: {
          ...justification,
          messages
        }
      });
    } catch (error: any) {
      console.error("Error fetching value justification for priority:", error);
      res.status(500).json({ error: error.message || "Failed to fetch value justification" });
    }
  });
  
  // Chat with AI to refine value justification
  app.post("/api/value-justifications/:id/chat", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { message, action } = req.body;
      
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }
      
      const justification = await storage.getValueJustificationById(id);
      
      if (!justification) {
        return res.status(404).json({ error: "Value justification not found" });
      }
      
      if (justification.isLocked) {
        return res.status(403).json({ error: "This value justification is locked and cannot be edited" });
      }
      
      // Get existing messages for context
      const existingMessages = await storage.getValueJustificationMessages(id);
      
      // Store user message
      await storage.createValueJustificationMessage({
        valueJustificationId: id,
        role: "user",
        content: sanitizeInput(message),
        appliedToVersion: justification.version
      });
      
      // Call AI to refine the draft
      const { refineValueJustification } = await import("./ai");
      const aiResult = await refineValueJustification({
        currentDraft: justification.draftContent || "",
        executiveSummary: justification.executiveSummary || "",
        userMessage: message,
        action,
        conversationHistory: existingMessages.map(m => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content
        }))
      });
      
      // Update the justification with new content
      const updatedJustification = await storage.updateValueJustification(id, {
        draftContent: aiResult.updatedDraft,
        executiveSummary: aiResult.updatedSummary || justification.executiveSummary,
        version: justification.version + 1,
        status: "refined"
      });
      
      // Store assistant response
      const assistantMessage = await storage.createValueJustificationMessage({
        valueJustificationId: id,
        role: "assistant",
        content: aiResult.responseMessage,
        suggestedChanges: aiResult.changes,
        appliedToVersion: justification.version + 1
      });
      
      res.json({
        justification: updatedJustification,
        assistantMessage
      });
    } catch (error: any) {
      console.error("Error in value justification chat:", error);
      res.status(500).json({ error: error.message || "Failed to process chat message" });
    }
  });
  
  // Update value justification (manual edits)
  app.patch("/api/value-justifications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { draftContent, executiveSummary, status } = req.body;
      
      const justification = await storage.getValueJustificationById(id);
      
      if (!justification) {
        return res.status(404).json({ error: "Value justification not found" });
      }
      
      if (justification.isLocked) {
        return res.status(403).json({ error: "This value justification is locked and cannot be edited" });
      }
      
      const updateData: any = {};
      if (draftContent !== undefined) updateData.draftContent = draftContent;
      if (executiveSummary !== undefined) updateData.executiveSummary = executiveSummary;
      if (status !== undefined) updateData.status = status;
      
      const updated = await storage.updateValueJustification(id, updateData);
      
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating value justification:", error);
      res.status(500).json({ error: error.message || "Failed to update value justification" });
    }
  });
  
  // Lock/approve value justification
  app.post("/api/value-justifications/:id/lock", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { lockedBy } = req.body;
      
      const updated = await storage.updateValueJustification(id, {
        isLocked: true,
        lockedAt: new Date(),
        lockedBy: lockedBy ? sanitizeInput(lockedBy) : "Consultant",
        status: "approved"
      });
      
      if (!updated) {
        return res.status(404).json({ error: "Value justification not found" });
      }
      
      res.json(updated);
    } catch (error: any) {
      console.error("Error locking value justification:", error);
      res.status(500).json({ error: error.message || "Failed to lock value justification" });
    }
  });
  
  // ============================================================================
  // CLIENT VALUE HUB - ACCOUNT-CENTRIC API ENDPOINTS
  // ============================================================================
  
  // Accounts CRUD
  app.get("/api/accounts", async (req, res) => {
    try {
      const accounts = await storage.getAccounts();
      res.json(accounts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get("/api/accounts/:id", async (req, res) => {
    try {
      const account = await storage.getAccount(parseInt(req.params.id));
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.json(account);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post("/api/accounts", async (req, res) => {
    try {
      const validated = insertAccountSchema.parse(req.body);
      
      // Auto-fetch company logo if not provided
      if (!validated.companyLogoUrl && validated.name) {
        try {
          // Use Clearout API to find company info
          const searchResponse = await fetch(
            `https://api.clearout.io/public/companies/autocomplete?query=${encodeURIComponent(validated.name)}`
          );
          
          if (searchResponse.ok) {
            const companies = await searchResponse.json();
            if (companies && companies.length > 0) {
              // Use logo from first match or generate from Clearbit using domain
              const company = companies[0];
              if (company.logo) {
                validated.companyLogoUrl = company.logo;
              } else if (company.domain) {
                validated.companyLogoUrl = `https://logo.clearbit.com/${company.domain}`;
              }
            }
          }
          
          // Fallback: generate Clearbit URL from company name
          if (!validated.companyLogoUrl) {
            const domainGuess = validated.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            validated.companyLogoUrl = `https://logo.clearbit.com/${domainGuess}.com`;
          }
        } catch (logoError) {
          console.error("Error fetching company logo:", logoError);
          // Continue without logo - not critical
        }
      }
      
      const account = await storage.createAccount(validated);
      res.json(account);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.patch("/api/accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validated = insertAccountSchema.partial().parse(req.body);
      const updated = await storage.updateAccount(id, validated);
      if (!updated) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.delete("/api/accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAccount(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Account Value Spine - Aggregated data for the main account view
  app.get("/api/accounts/:id/value-spine", async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const account = await storage.getAccount(accountId);
      
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }
      
      // Fetch all related data in parallel
      const [initiatives, issues, evidenceArtefacts, userRoles] = await Promise.all([
        storage.getInitiativesForAccount(accountId),
        storage.getAccountIssues(accountId),
        storage.getEvidenceArtefacts(accountId),
        storage.getAccountUserRoles(accountId)
      ]);
      
      // Aggregate KPIs and value metrics across all initiatives
      let totalValuePromised = 0;
      let totalValueRealized = 0;
      let allKPIs: any[] = [];
      
      for (const initiative of initiatives) {
        const [jobThemes, allInitiativeKPIs, allActuals, valueMetrics] = await Promise.all([
          storage.getJobThemes(initiative.id),
          storage.getAllJobThemeKPIsForProject(initiative.id),
          storage.getAllKPIActualsForProject(initiative.id),
          storage.getProjectValueMetrics(initiative.id)
        ]);
        
        // Add value metrics
        if (valueMetrics) {
          totalValuePromised += valueMetrics.totalValuePromised || 0;
          totalValueRealized += valueMetrics.totalValueRealized || 0;
        }
        
        // Build KPI summary with actuals
        for (const kpi of allInitiativeKPIs.filter(k => k.isSelected)) {
          const kpiActuals = allActuals.filter(a => a.jobThemeKPIId === kpi.id);
          const latestActual = kpiActuals.sort((a, b) => 
            new Date(b.actualDate).getTime() - new Date(a.actualDate).getTime()
          )[0];
          
          const jobTheme = jobThemes.find(jt => jt.id === kpi.jobThemeId);
          
          allKPIs.push({
            id: kpi.id,
            name: kpi.kpiName,
            unit: kpi.unit,
            baseline: kpi.baselineValue,
            target: kpi.targetValue,
            current: latestActual?.actualValue || null,
            initiativeId: initiative.id,
            initiativeName: initiative.name,
            jobName: jobTheme?.jobName || 'Unknown',
            status: calculateKPIHealthStatus(
              parseNumeric(kpi.baselineValue),
              parseNumeric(kpi.targetValue),
              latestActual ? parseNumeric(latestActual.actualValue) : null
            )
          });
        }
      }
      
      // Calculate headline value case summary
      const valueCases = await Promise.all(
        initiatives.map(i => storage.getValueCases(i.id))
      ).then(results => results.flat());
      
      const headlineValueCase = valueCases.sort((a, b) => {
        const npvA = parseNumeric(a.estimatedNPV?.replace(/[^0-9.-]/g, '')) || 0;
        const npvB = parseNumeric(b.estimatedNPV?.replace(/[^0-9.-]/g, '')) || 0;
        return npvB - npvA;
      })[0];
      
      res.json({
        account,
        initiatives: initiatives.map(i => ({
          id: i.id,
          name: i.name,
          phase: i.currentPhase,
          status: i.status,
          ragStatus: i.ragStatus,
          owner: i.initiativeOwner,
          startDate: i.startDate,
          targetEndDate: i.targetEndDate
        })),
        issues,
        evidenceArtefacts,
        userRoles,
        kpis: allKPIs,
        valueMetrics: {
          totalValuePromised,
          totalValueRealized,
          realizationPercent: totalValuePromised > 0 
            ? Math.round((totalValueRealized / totalValuePromised) * 100) 
            : 0
        },
        headlineValueCase: headlineValueCase ? {
          id: headlineValueCase.id,
          title: headlineValueCase.title,
          estimatedNPV: headlineValueCase.estimatedNPV,
          confidence: headlineValueCase.confidence,
          status: headlineValueCase.status
        } : null
      });
    } catch (error: any) {
      console.error("Error fetching account value spine:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Account Initiatives (projects linked to account)
  app.get("/api/accounts/:id/initiatives", async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const initiatives = await storage.getInitiativesForAccount(accountId);
      res.json(initiatives);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Account User Roles
  app.get("/api/accounts/:id/user-roles", async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const roles = await storage.getAccountUserRoles(accountId);
      res.json(roles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post("/api/accounts/:id/user-roles", async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const validated = insertAccountUserRoleSchema.parse({
        ...req.body,
        accountId
      });
      const role = await storage.createAccountUserRole(validated);
      res.json(role);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.delete("/api/account-user-roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAccountUserRole(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Account Issues / Opportunities
  app.get("/api/accounts/:id/issues", async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const issues = await storage.getAccountIssues(accountId);
      res.json(issues);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get("/api/account-issues/:id", async (req, res) => {
    try {
      const issue = await storage.getAccountIssue(parseInt(req.params.id));
      if (!issue) {
        return res.status(404).json({ error: "Issue not found" });
      }
      res.json(issue);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post("/api/accounts/:id/issues", async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const validated = insertAccountIssueSchema.parse({
        ...req.body,
        accountId
      });
      const issue = await storage.createAccountIssue(validated);
      res.json(issue);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.patch("/api/account-issues/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validated = insertAccountIssueSchema.partial().parse(req.body);
      const updated = await storage.updateAccountIssue(id, validated);
      if (!updated) {
        return res.status(404).json({ error: "Issue not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.delete("/api/account-issues/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAccountIssue(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Evidence Artefacts (for QBR support)
  app.get("/api/accounts/:id/evidence-artefacts", async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const artefacts = await storage.getEvidenceArtefacts(accountId);
      res.json(artefacts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get("/api/evidence-artefacts/:id", async (req, res) => {
    try {
      const artefact = await storage.getEvidenceArtefact(parseInt(req.params.id));
      if (!artefact) {
        return res.status(404).json({ error: "Evidence artefact not found" });
      }
      res.json(artefact);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post("/api/accounts/:id/evidence-artefacts", async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const validated = insertEvidenceArtefactSchema.parse({
        ...req.body,
        accountId
      });
      const artefact = await storage.createEvidenceArtefact(validated);
      res.json(artefact);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.patch("/api/evidence-artefacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validated = insertEvidenceArtefactSchema.partial().parse(req.body);
      const updated = await storage.updateEvidenceArtefact(id, validated);
      if (!updated) {
        return res.status(404).json({ error: "Evidence artefact not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.delete("/api/evidence-artefacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEvidenceArtefact(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ============================================================================
  // ACCOUNT HUB - Client Value Hub aggregated endpoint
  // ============================================================================
  
  // GET /api/accounts/:id/hub - Aggregated hub data for Account Hub page
  app.get("/api/accounts/:id/hub", async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const phase = req.query.phase as LifecyclePhase | undefined;
      
      const hubData = await storage.getAccountHub(accountId, phase);
      
      if (!hubData) {
        return res.status(404).json({ error: "Account not found" });
      }
      
      res.json(hubData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // POST /api/kpis/:id/actuals - Log a KPI actual value
  app.post("/api/kpis/:id/actuals", async (req, res) => {
    try {
      const jobThemeKPIId = parseInt(req.params.id);
      
      // Verify KPI exists
      const kpi = await storage.getJobThemeKPI(jobThemeKPIId);
      if (!kpi) {
        return res.status(404).json({ error: "KPI not found" });
      }
      
      // Get the project to find the account
      const jobTheme = await storage.getJobTheme(kpi.jobThemeId);
      if (!jobTheme) {
        return res.status(404).json({ error: "Job theme not found" });
      }
      
      const project = await storage.getProject(jobTheme.projectId);
      
      const validated = insertKPIActualSchema.parse({
        ...req.body,
        jobThemeKPIId,
        accountId: project?.accountId || null,
        actualDate: new Date(req.body.actualDate),
      });
      
      const actual = await storage.createKPIActual(validated);
      res.json(actual);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // GET /api/accounts/:id/kpi-actuals - Get all KPI actuals for an account
  app.get("/api/accounts/:id/kpi-actuals", async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const actuals = await storage.getKPIActualsForAccount(accountId);
      res.json(actuals);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // PATCH /api/projects/:id/lifecycle-phase - Update project lifecycle phase
  app.patch("/api/projects/:id/lifecycle-phase", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { lifecyclePhase } = req.body;
      
      if (!lifecyclePhases.includes(lifecyclePhase)) {
        return res.status(400).json({ error: "Invalid lifecycle phase" });
      }
      
      const updated = await storage.updateProject(id, { lifecyclePhase });
      if (!updated) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // PATCH /api/projects/:id/discovery-progress - Update discovery wizard progress
  const discoverySteps = ["theme-select", "intelligence", "questions", "review", "insights"];
  app.patch("/api/projects/:id/discovery-progress", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { discoveryTheme, discoveryStep, discoveryCompleted } = req.body;
      
      // Validate step if provided
      if (discoveryStep && !discoverySteps.includes(discoveryStep)) {
        return res.status(400).json({ error: "Invalid discovery step" });
      }
      
      const updateData: Record<string, any> = {};
      if (discoveryTheme !== undefined) updateData.discoveryTheme = discoveryTheme;
      if (discoveryStep !== undefined) updateData.discoveryStep = discoveryStep;
      if (discoveryCompleted !== undefined) updateData.discoveryCompleted = discoveryCompleted;
      
      const updated = await storage.updateProject(id, updateData);
      if (!updated) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // POST /api/projects/:id/discovery-insights/summary - Generate AI-powered discovery synthesis
  app.post("/api/projects/:id/discovery-insights/summary", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Get related data from storage
      const discoveryNotes = await storage.getDiscoveryNotes(id);
      const companyDataPoints = await storage.getCompanyDataPoints(id);
      const headlines = await storage.getHeadlines(id);
      const jobThemes = await storage.getJobThemes(id);
      const account = project.accountId ? await storage.getAccount(project.accountId) : null;
      
      // Build synthesis input from all available discovery data
      const synthesisInput: import("./ai").DiscoverySynthesisInput = {
        companyName: project.companyName || account?.name || "Unknown Company",
        industry: project.sector || account?.industry || undefined,
        discoveryTheme: project.discoveryTheme || undefined,
        researchDataPoints: companyDataPoints.map(dp => ({
          label: dp.label,
          value: dp.value,
          kornFerryPillar: dp.kornFerryPillar || undefined,
          solutionArea: dp.solutionArea || undefined
        })),
        headlines: headlines.map(h => ({
          title: h.title,
          date: h.date || new Date().toISOString()
        })),
        greenSheetData: (project as any).greenSheetData ? {
          callObjective: (project as any).greenSheetData.callPlanner?.objective,
          desiredOutcome: (project as any).greenSheetData.callPlanner?.desiredOutcome,
          openingStatement: (project as any).greenSheetData.callPlanner?.openingStatement,
          bestActionCommitment: (project as any).greenSheetData.callPlanner?.bestActionCommitment,
          contacts: (project as any).greenSheetData.meetingContact ? [{
            name: (project as any).greenSheetData.meetingContact.name,
            title: (project as any).greenSheetData.meetingContact.title,
            buyingRole: (project as any).greenSheetData.meetingContact.role,
            influenceLevel: (project as any).greenSheetData.meetingContact.influence
          }] : []
        } : undefined,
        storyBuilderData: (project as any).storyBuilderData ? {
          before: {
            singleMessage: (project as any).storyBuilderData.before?.singleMessage,
            emotionalReaction: (project as any).storyBuilderData.before?.emotionalReaction,
            storyStructure: (project as any).storyBuilderData.before?.storyStructure,
            startingHook: (project as any).storyBuilderData.before?.startingHook,
            heroCharacter: (project as any).storyBuilderData.before?.heroCharacter,
            tensionQuestions: (project as any).storyBuilderData.before?.tensionQuestions?.map((tq: any) => ({
              prompt: tq.prompt,
              response: tq.response
            }))
          },
          during: {
            openingLine: (project as any).storyBuilderData.during?.openingLine,
            turningPoint: (project as any).storyBuilderData.during?.turningPoint,
            keyDataPoints: (project as any).storyBuilderData.during?.keyDataPoints
          },
          after: {
            momentOfMeaning: (project as any).storyBuilderData.after?.momentOfMeaning,
            explicitTakeaway: (project as any).storyBuilderData.after?.explicitTakeaway,
            callToAction: (project as any).storyBuilderData.after?.callToAction
          }
        } : undefined,
        notes: discoveryNotes ? [{
          content: discoveryNotes.freeformNotes || "",
          category: "discovery"
        }] : [],
        callFlow: (project as any).callFlowData?.items?.map((item: any) => ({
          question: item.question,
          phase: item.phase
        }))
      };
      
      // Import and call the synthesis function
      const { synthesizeDiscoveryInsights } = await import("./ai");
      const result = await synthesizeDiscoveryInsights(synthesisInput);
      
      // Cache the result on the project
      await storage.updateProject(id, {
        discoverySynthesis: {
          ...result,
          generatedAt: new Date().toISOString()
        }
      } as any);
      
      res.json(result);
    } catch (error: any) {
      console.error("[Discovery Synthesis] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // GET /api/projects/:id/discovery-insights/summary - Get cached discovery synthesis
  app.get("/api/projects/:id/discovery-insights/summary", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const cached = (project as any).discoverySynthesis;
      if (cached) {
        res.json(cached);
      } else {
        res.status(404).json({ error: "No discovery synthesis available. Generate one first." });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // POST /api/projects/:id/strategic-recommendations - Generate AI-powered organizational strategies
  app.post("/api/projects/:id/strategic-recommendations", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const account = project.accountId ? await storage.getAccount(project.accountId) : null;
      const synthesis = (project as any).discoverySynthesis;
      
      // Import and call the strategic recommendations function
      const { generateStrategicRecommendations } = await import("./ai");
      const result = await generateStrategicRecommendations({
        companyName: project.companyName || account?.name || "Unknown Company",
        industry: project.sector || account?.industry || undefined,
        discoveryTheme: (project as any).discoveryTheme,
        discoverySynthesis: synthesis || undefined,
        accountContext: account ? {
          recentNews: (account as any).recentNews || [],
          competitivePosition: (account as any).competitivePosition,
          businessChallenges: (account as any).businessChallenges || []
        } : undefined
      });
      
      // Cache strategies on project
      await storage.updateProject(id, {
        strategicRecommendations: {
          ...result,
          generatedAt: new Date().toISOString()
        }
      } as any);
      
      res.json(result);
    } catch (error: any) {
      console.error("[Strategic Recommendations] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // GET /api/projects/:id/strategic-recommendations - Get cached strategic recommendations
  app.get("/api/projects/:id/strategic-recommendations", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const cached = (project as any).strategicRecommendations;
      if (cached) {
        res.json(cached);
      } else {
        res.status(404).json({ error: "No strategic recommendations available. Generate them first." });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // POST /api/projects/:id/strategy-outcomes - Generate AI-powered outcomes from selected strategies
  app.post("/api/projects/:id/strategy-outcomes", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const { selectedStrategies } = req.body;
      if (!selectedStrategies || !Array.isArray(selectedStrategies) || selectedStrategies.length === 0) {
        return res.status(400).json({ error: "selectedStrategies array is required" });
      }
      
      const account = project.accountId ? await storage.getAccount(project.accountId) : null;
      
      // Fetch discovery context for more personalized outcomes
      const [dataPoints, interactionArtifacts] = await Promise.all([
        storage.getCompanyDataPoints(id),
        storage.getInteractionArtifacts(id)
      ]);
      
      const synthesis = (project as any).discoverySynthesis;
      
      // Build discovery context
      const discoveryContext = {
        executiveSummary: synthesis?.executiveSummary,
        keyChallenges: synthesis?.keyChallenges,
        strategicOpportunities: synthesis?.strategicOpportunities,
        insights: dataPoints.slice(0, 10).map(dp => ({
          label: dp.label,
          value: dp.value,
          solutionArea: dp.solutionArea || undefined,
          kornFerryPillar: dp.kornFerryPillar || undefined
        })),
        interactionNotes: interactionArtifacts
          .filter(a => a.freeformNotes)
          .slice(0, 5)
          .map(a => a.freeformNotes as string)
      };
      
      // Import and call the strategy outcomes function
      const { generateOutcomesFromStrategies } = await import("./ai");
      const result = await generateOutcomesFromStrategies({
        companyName: project.companyName || account?.name || "Unknown Company",
        industry: project.sector || account?.industry || undefined,
        selectedStrategies,
        discoveryContext: (discoveryContext.executiveSummary || discoveryContext.insights?.length) ? discoveryContext : undefined
      });
      
      res.json(result);
    } catch (error: any) {
      console.error("[Strategy Outcomes] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // POST /api/projects/:id/value-story - Generate AI-powered value story narrative
  app.post("/api/projects/:id/value-story", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const account = project.accountId ? await storage.getAccount(project.accountId) : null;
      const synthesis = (project as any).discoverySynthesis;
      
      // Get confirmed outcomes/commitments
      const commitments = await storage.getKpiCommitments(id);
      const confirmedCommitments = commitments.filter(c => c.status === 'confirmed');
      
      // Import and call the value story function
      const { generateValueStory } = await import("./ai");
      const result = await generateValueStory({
        companyName: project.companyName || account?.name || "Unknown Company",
        industry: project.sector || account?.industry || undefined,
        discoverySynthesis: synthesis ? {
          executiveSummary: synthesis.executiveSummary,
          keyChallenges: synthesis.keyChallenges,
          strategicOpportunities: synthesis.strategicOpportunities
        } : undefined,
        outcomes: confirmedCommitments.map(c => ({
          name: c.commitmentTitle,
          description: c.commitmentDescription || undefined,
          valuePillar: (c as any).valuePillar || undefined,
          baselineValue: c.baselineValue,
          targetValue: c.targetValue,
          kpiUnit: c.kpiUnit || undefined,
          estimatedAnnualValue: c.estimatedAnnualValue
        })),
        clientQuotes: req.body.clientQuotes || [],
        risks: req.body.risks || []
      });
      
      // Cache the value story on the project
      await storage.updateProject(id, {
        valueStory: result
      } as any);
      
      res.json(result);
    } catch (error: any) {
      console.error("[Value Story] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // GET /api/projects/:id/value-story - Get cached value story
  app.get("/api/projects/:id/value-story", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const cached = (project as any).valueStory;
      if (cached) {
        res.json(cached);
      } else {
        res.status(404).json({ error: "No value story available. Generate one first." });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // POST /api/projects/:id/outcome-recommendations - Generate AI-powered outcome recommendations
  app.post("/api/projects/:id/outcome-recommendations", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Get discovery synthesis - required for generating recommendations
      const synthesis = (project as any).discoverySynthesis;
      if (!synthesis) {
        return res.status(400).json({ 
          error: "Discovery synthesis required. Please generate insights first from the Discovery stage." 
        });
      }
      
      // Get existing commitments, account info, and enriched context
      const [existingCommitments, enrichedContext] = await Promise.all([
        storage.getKpiCommitments(id),
        getEnrichedDiscoveryContext(id, storage)
      ]);
      const account = project.accountId ? await storage.getAccount(project.accountId) : null;
      
      // Enhance synthesis with enriched context from artifacts and Green Sheet
      const enhancedSynthesis = {
        ...synthesis,
        additionalContext: enrichedContext.combinedContext
      };
      
      // Import and call the outcome recommendations function
      const { generateOutcomeRecommendations } = await import("./ai");
      const result = await generateOutcomeRecommendations({
        companyName: project.companyName || account?.name || "Unknown Company",
        industry: project.sector || account?.industry || undefined,
        discoverySynthesis: enhancedSynthesis,
        existingCommitments: existingCommitments.map(c => ({
          title: c.commitmentTitle,
          kpiName: c.customMetricName || undefined
        }))
      });
      
      // Cache recommendations on project
      await storage.updateProject(id, {
        outcomeRecommendations: {
          ...result,
          generatedAt: new Date().toISOString()
        }
      } as any);
      
      res.json(result);
    } catch (error: any) {
      console.error("[Outcome Recommendations] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // GET /api/projects/:id/outcome-recommendations - Get cached outcome recommendations
  app.get("/api/projects/:id/outcome-recommendations", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const cached = (project as any).outcomeRecommendations;
      if (cached) {
        res.json(cached);
      } else {
        res.status(404).json({ error: "No outcome recommendations available. Generate them first." });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // PATCH /api/projects/:id/narrative-canvas - Save Narrative Canvas content
  app.patch("/api/projects/:id/narrative-canvas", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { opener, keyMessage, proofPoint, keyQuestions, callToAction } = req.body;
      
      const narrativeCanvas = {
        opener: opener || "",
        keyMessage: keyMessage || "",
        proofPoint: proofPoint || "",
        keyQuestions: keyQuestions || [],
        callToAction: callToAction || "",
        lastUpdated: new Date().toISOString(),
      };
      
      const updated = await storage.updateProject(id, { narrativeCanvas } as any);
      if (!updated) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // PATCH /api/projects/:id/green-sheet - Save Green Sheet data
  app.patch("/api/projects/:id/green-sheet", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { meetingContact, callPlanner } = req.body;
      
      const greenSheetData = {
        meetingContact: meetingContact || {
          name: "",
          title: "",
          role: null,
          influence: null,
          knownConcerns: "",
          personalRapport: "",
          decisionCriteria: ""
        },
        callPlanner: callPlanner || {
          objective: "",
          desiredOutcome: "",
          openingStatement: "",
          bestActionCommitment: ""
        },
        lastUpdated: new Date().toISOString(),
      };
      
      const updated = await storage.updateProject(id, { greenSheetData } as any);
      if (!updated) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // POST /api/projects/:id/green-sheet/enrich - Enrich Green Sheet from artifacts
  app.post("/api/projects/:id/green-sheet/enrich", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Get both pre-meeting AND post-meeting artifacts
      const preMeetingArtifacts = await storage.getInteractionArtifactsByContext(projectId, "pre_meeting");
      const postMeetingArtifacts = await storage.getInteractionArtifactsByContext(projectId, "post_meeting");
      const artifacts = [...preMeetingArtifacts, ...postMeetingArtifacts];
      
      if (artifacts.length === 0) {
        return res.status(400).json({ error: "No meeting documents found. Please upload documents in the 'Pre-Meeting' or 'Post-Meeting' section first." });
      }
      
      // Try to extract text from artifacts that don't have it yet
      for (const artifact of artifacts) {
        if (!artifact.extractedText && !artifact.freeformNotes && artifact.objectStorageKey) {
          try {
            console.log("[Green Sheet Enrich] Extracting text from:", artifact.objectStorageKey);
            const { Client } = await import("@replit/object-storage");
            const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
            if (bucketId) {
              const client = new Client({ bucketId });
              const fileBuffer = await client.downloadAsBytes(artifact.objectStorageKey);
              
              if (fileBuffer.ok && fileBuffer.value) {
                const uint8Array = fileBuffer.value;
                const buffer = Buffer.from(uint8Array.buffer, uint8Array.byteOffset, uint8Array.byteLength);
                let extractedText = "";
                
                if (artifact.mimeType === 'text/plain' || artifact.mimeType === 'text/csv' || artifact.mimeType === 'application/json') {
                  extractedText = buffer.toString('utf-8');
                } else if (artifact.mimeType === 'application/pdf') {
                  const pdfParse = (await import('pdf-parse')).default || (await import('pdf-parse'));
                  const pdfData = await pdfParse(buffer);
                  extractedText = pdfData.text;
                } else if (artifact.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                           artifact.mimeType === 'application/msword') {
                  const mammoth = await import('mammoth');
                  const result = await mammoth.extractRawText({ buffer: buffer });
                  extractedText = result.value;
                }
                
                if (extractedText) {
                  await storage.updateInteractionArtifact(artifact.id, { 
                    extractedText: extractedText.substring(0, 50000),
                    aiProcessingStatus: 'completed'
                  });
                  (artifact as any).extractedText = extractedText;
                  console.log("[Green Sheet Enrich] Text extracted, length:", extractedText.length);
                }
              }
            }
          } catch (extractError) {
            console.error("[Green Sheet Enrich] Failed to extract text from artifact:", artifact.id, extractError);
          }
        }
      }
      
      const artifactsWithContent = artifacts.filter(a => a.extractedText || a.freeformNotes);
      
      if (artifactsWithContent.length === 0) {
        return res.status(400).json({ 
          error: "Unable to read document content. Please try re-uploading your documents, or add notes to them manually.",
          documentsCount: artifacts.length
        });
      }
      
      // Combine all artifact content
      const combinedContent = artifactsWithContent.map(a => {
        const parts = [];
        if (a.title) parts.push(`[${a.title}]`);
        if (a.extractedText) parts.push(a.extractedText);
        if (a.freeformNotes) parts.push(`Notes: ${a.freeformNotes}`);
        return parts.join("\n");
      }).join("\n\n---\n\n");
      
      // Get existing green sheet data and meeting profile
      const existingGreenSheet = (project as any).greenSheetData;
      const meetingProfile = await storage.getMeetingProfile(projectId);
      const existingParticipants = meetingProfile?.participants || [];
      
      // Categorize artifacts by context for the AI
      const preMeetingContent = artifactsWithContent
        .filter(a => a.meetingContext === 'pre_meeting')
        .map(a => {
          const parts = [];
          if (a.title) parts.push(`[PRE-MEETING: ${a.title}]`);
          if (a.extractedText) parts.push(a.extractedText);
          if (a.freeformNotes) parts.push(`Notes: ${a.freeformNotes}`);
          return parts.join("\n");
        }).join("\n\n---\n\n");
      
      const postMeetingContent = artifactsWithContent
        .filter(a => a.meetingContext === 'post_meeting')
        .map(a => {
          const parts = [];
          if (a.title) parts.push(`[POST-MEETING: ${a.title}]`);
          if (a.extractedText) parts.push(a.extractedText);
          if (a.freeformNotes) parts.push(`Notes: ${a.freeformNotes}`);
          return parts.join("\n");
        }).join("\n\n---\n\n");
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a Korn Ferry strategic sales consultant helping prepare for and follow up on client meetings. 
Analyze the provided pre-meeting AND post-meeting documents and notes to update the Green Sheet meeting planner.

IMPORTANT: Extract ALL attendees/participants mentioned in the documents. If multiple people are mentioned (in meeting invites, transcripts, notes, etc.), capture each person separately.

Extract and suggest:
1. Call Objective: What is/was the primary goal for this meeting?
2. Desired Outcome: What specific outcomes should result from this meeting?
3. Opening Statement: A strong opening to set context and credibility
4. Best Action Commitment: The ideal next step or commitment to secure

For EACH attendee/participant mentioned, extract:
- Name (as mentioned in documents)
- Title/Position (if mentioned)
- Role in buying process: economic_buyer (budget holder), user_buyer (end user), technical_buyer (evaluates solution), coach (internal champion), or champion (advocate)
- Influence level: high, medium, or low
- Known concerns or challenges they expressed
- Preferred outcomes they mentioned
- Personal rapport notes (interests, background, communication style)
- Decision criteria they mentioned

Look for attendee information in:
- Meeting invites and attendee lists
- Email signatures and headers
- Transcript speaker labels
- "Attendees:", "Participants:", "Present:" sections
- Names mentioned in conversation
- Sign-offs and greetings

Be specific and actionable. Use the exact language and concerns from the documents where possible.`
          },
          {
            role: "user",
            content: `Company: ${project.companyName || "Unknown"}
Initiative: ${project.name}

Existing Green Sheet Data:
${existingGreenSheet ? JSON.stringify(existingGreenSheet, null, 2) : "None"}

Existing Meeting Participants (do not duplicate these, but update if new info found):
${existingParticipants.length > 0 ? JSON.stringify(existingParticipants.map(p => ({ name: p.name, title: p.title })), null, 2) : "None"}

PRE-MEETING Documents and Notes:
${preMeetingContent.substring(0, 12000) || "None"}

POST-MEETING Documents and Notes:
${postMeetingContent.substring(0, 12000) || "None"}`
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "green_sheet_suggestions",
            strict: true,
            schema: {
              type: "object",
              properties: {
                callPlanner: {
                  type: "object",
                  properties: {
                    objective: { type: "string", description: "Suggested call objective" },
                    desiredOutcome: { type: "string", description: "Suggested desired outcome" },
                    openingStatement: { type: "string", description: "Suggested opening statement" },
                    bestActionCommitment: { type: "string", description: "Suggested best action commitment" }
                  },
                  required: ["objective", "desiredOutcome", "openingStatement", "bestActionCommitment"],
                  additionalProperties: false
                },
                attendees: {
                  type: "array",
                  description: "All attendees/participants found in documents",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Person's name" },
                      title: { type: "string", description: "Job title if found, empty string if unknown" },
                      role: { 
                        type: "string", 
                        enum: ["economic_buyer", "user_buyer", "technical_buyer", "coach", "champion"],
                        description: "Buying role"
                      },
                      influence: { 
                        type: "string", 
                        enum: ["high", "medium", "low"],
                        description: "Influence level"
                      },
                      knownConcerns: { type: "string", description: "Concerns or challenges they expressed" },
                      preferredOutcomes: { type: "string", description: "Outcomes they want" },
                      personalRapport: { type: "string", description: "Personal notes for rapport building" },
                      decisionCriteria: { type: "string", description: "Decision criteria they mentioned" }
                    },
                    required: ["name", "title", "role", "influence", "knownConcerns", "preferredOutcomes", "personalRapport", "decisionCriteria"],
                    additionalProperties: false
                  }
                },
                sourcedFrom: {
                  type: "array",
                  items: { type: "string" },
                  description: "List of document titles that informed these suggestions"
                }
              },
              required: ["callPlanner", "attendees", "sourcedFrom"],
              additionalProperties: false
            }
          }
        }
      });
      
      const suggestions = JSON.parse(response.choices[0].message.content || "{}");
      
      // Auto-add new attendees to the meeting profile
      let attendeesAdded = 0;
      let attendeesUpdated = 0;
      
      if (suggestions.attendees && suggestions.attendees.length > 0) {
        // Get or create meeting profile
        let profile = meetingProfile;
        if (!profile) {
          profile = await storage.createMeetingProfile({
            projectId,
            attendanceMode: suggestions.attendees.length > 1 ? "multiple" : "single",
            participants: []
          });
        }
        
        const currentParticipants = profile.participants || [];
        const updatedParticipants = [...currentParticipants];
        
        for (const attendee of suggestions.attendees) {
          if (!attendee.name || attendee.name.trim() === "") continue;
          
          // Check if participant already exists (case-insensitive name match)
          const existingIndex = updatedParticipants.findIndex(
            p => p.name.toLowerCase().trim() === attendee.name.toLowerCase().trim()
          );
          
          if (existingIndex >= 0) {
            // Update existing participant with new information (merge, don't overwrite blanks)
            const existing = updatedParticipants[existingIndex];
            updatedParticipants[existingIndex] = {
              ...existing,
              title: attendee.title || existing.title,
              role: attendee.role || existing.role,
              influence: attendee.influence || existing.influence,
              knownConcerns: attendee.knownConcerns || existing.knownConcerns,
              preferredOutcomes: attendee.preferredOutcomes || existing.preferredOutcomes,
              personalRapport: attendee.personalRapport || existing.personalRapport,
              decisionCriteria: attendee.decisionCriteria || existing.decisionCriteria,
            };
            attendeesUpdated++;
          } else {
            // Add new participant
            updatedParticipants.push({
              id: `participant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: attendee.name,
              title: attendee.title || "",
              role: attendee.role || "user_buyer",
              influence: attendee.influence || "medium",
              knownConcerns: attendee.knownConcerns || "",
              preferredOutcomes: attendee.preferredOutcomes || "",
              personalRapport: attendee.personalRapport || "",
              decisionCriteria: attendee.decisionCriteria || "",
            });
            attendeesAdded++;
          }
        }
        
        // Update meeting profile with new participants
        if (attendeesAdded > 0 || attendeesUpdated > 0) {
          await storage.updateMeetingProfile(profile.id, {
            participants: updatedParticipants,
            attendanceMode: updatedParticipants.length > 1 ? "multiple" : "single"
          });
        }
      }
      
      res.json({ 
        suggestions,
        artifactsAnalyzed: artifactsWithContent.length,
        preMeetingDocs: preMeetingContent ? artifactsWithContent.filter(a => a.meetingContext === 'pre_meeting').length : 0,
        postMeetingDocs: postMeetingContent ? artifactsWithContent.filter(a => a.meetingContext === 'post_meeting').length : 0,
        attendeesDetected: suggestions.attendees?.length || 0,
        attendeesAdded,
        attendeesUpdated
      });
    } catch (error: any) {
      console.error("Error enriching green sheet:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // PATCH /api/projects/:id/story-builder - Save Story Builder data
  app.patch("/api/projects/:id/story-builder", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { before, during, after, storyTest, refineResult, selectedTemplates, templateRecommendations } = req.body;
      
      const storyBuilderData = {
        before: {
          singleMessage: before?.singleMessage || "",
          emotionalReaction: before?.emotionalReaction || "",
          storyStructure: before?.storyStructure || "",
          startingHook: before?.startingHook || "",
          heroCharacter: before?.heroCharacter || "",
          evidenceToReference: before?.evidenceToReference || "",
          tensionQuestion: before?.tensionQuestion || "",
          tensionQuestions: before?.tensionQuestions || []
        },
        during: during || {
          openingLine: "",
          turningPoint: "",
          keyDataPoints: "",
          pausePoints: [],
          pacingNotes: ""
        },
        after: after || {
          momentOfMeaning: "",
          explicitTakeaway: "",
          callToAction: ""
        },
        storyTest: storyTest || {
          strangerCareScore: null,
          simplicityScore: null,
          leadershipValuesScore: null,
          testNotes: ""
        },
        refineResult: refineResult || null,
        selectedTemplates: selectedTemplates || [],
        templateRecommendations: templateRecommendations || null,
        lastUpdated: new Date().toISOString(),
      };
      
      const updated = await storage.updateProject(id, { storyBuilderData } as any);
      if (!updated) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // PATCH /api/projects/:id/call-flow - Save Call Flow data
  app.patch("/api/projects/:id/call-flow", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { questions, methodologyQuestions } = req.body;
      
      const callFlowData = {
        questions: questions || [],
        methodologyQuestions: methodologyQuestions || [],
        lastUpdated: new Date().toISOString(),
      };
      
      const updated = await storage.updateProject(id, { callFlowData } as any);
      if (!updated) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // POST /api/projects/:projectId/ai/enrich-contact - AI-powered contact research for Green Sheet
  app.post("/api/projects/:projectId/ai/enrich-contact", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const { contactName, title, linkedInUrl } = req.body;
      
      if (!contactName) {
        return res.status(400).json({ error: "contactName is required" });
      }
      
      const enrichmentResult = await enrichContactWithAI({
        contactName,
        companyName: project.companyName,
        title: title || undefined,
        linkedInUrl: linkedInUrl || undefined
      });
      
      res.json(enrichmentResult);
    } catch (error: any) {
      console.error("[Contact Enrichment API] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/projects/:projectId/ai/generate-narrative - Generate complete call narrative for Narrative Canvas
  app.post("/api/projects/:projectId/ai/generate-narrative", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const { companyName, theme, contactName, contactRole, insights } = req.body;
      
      // Fetch insights from database if not provided
      let insightTitles = insights || [];
      if (insightTitles.length === 0) {
        const storedInsights = await storage.getCompanyDataPoints(projectId);
        insightTitles = storedInsights.slice(0, 5).map((i: { label: string }) => i.label);
      }
      
      const roleContext = contactRole ? `They are a ${contactRole.replace('_', ' ')}` : '';
      const insightContext = insightTitles.length > 0 ? `Key insights discovered: ${insightTitles.join(', ')}` : '';
      
      const prompt = `You are a senior sales consultant helping prepare for a client meeting.

Company: ${companyName || project.companyName}
Theme: ${theme || 'General business consulting'}
Contact: ${contactName || 'Unknown'} ${roleContext}
${insightContext}

Generate a complete call narrative with these 5 elements. Be specific to this company and context:

1. OPENER: A compelling opening statement or question (2-3 sentences) that shows you've done your homework and creates curiosity.

2. KEY_MESSAGE: The single most important idea you want them to remember (1-2 sentences). Make it provocative but relevant.

3. PROOF_POINT: A specific evidence point, data, or success story reference that supports your message (1-2 sentences).

4. KEY_QUESTIONS: Three strategic questions to explore during the conversation. Focus on uncovering needs and building value.

5. CALL_TO_ACTION: A clear, specific next step to propose at the end of the call (1-2 sentences).

Respond in JSON format:
{
  "opener": "...",
  "keyMessage": "...",
  "proofPoint": "...",
  "keyQuestions": ["...", "...", "..."],
  "callToAction": "..."
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 800,
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from AI");
      }
      
      const result = JSON.parse(content);
      res.json(result);
    } catch (error: any) {
      console.error("[Generate Narrative API] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/projects/:projectId/ai/story-suggestion - Generate AI story suggestions
  app.post("/api/projects/:projectId/ai/story-suggestion", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const { 
        meetingContact, 
        greenSheet,
        discoveryTheme, 
        discoveryInsights,
        successStories, 
        currentDraft, 
        fieldToSuggest, 
        phase,
        includeIntelligence 
      } = req.body;
      
      if (!fieldToSuggest || !phase) {
        return res.status(400).json({ error: "fieldToSuggest and phase are required" });
      }
      
      // Fetch insights from database if not provided in request
      let insightsForAi = discoveryInsights;
      if (!insightsForAi || insightsForAi.length === 0) {
        const storedInsights = await storage.getCompanyDataPoints(projectId);
        insightsForAi = storedInsights.slice(0, 10).map((i) => ({
          title: i.label,
          content: i.value || "",
          category: i.relevantCapability || "general",
          priority: i.priorityScore,
          confidence: i.confidence || undefined
        }));
      }
      
      // Fetch intelligence data if requested
      let intelligenceData = null;
      if (includeIntelligence) {
        const themeForIntelligence = discoveryTheme || project.discoveryTheme || "leadership";
        const intelligence = await storage.getProjectIntelligence(projectId, themeForIntelligence);
        if (intelligence?.intelligenceData) {
          intelligenceData = intelligence.intelligenceData;
        }
      }
      
      const suggestion = await generateStorySuggestion({
        companyName: project.companyName,
        companyContext: project.sector ? `${project.sector} sector` : undefined,
        discoveryTheme,
        discoveryInsights: insightsForAi,
        meetingContact,
        greenSheet,
        intelligenceData,
        successStories,
        currentDraft,
        fieldToSuggest,
        phase
      });
      
      res.json(suggestion);
    } catch (error: any) {
      console.error("[Story Suggestion API] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/projects/:projectId/ai/refine-story - AI reviews and critiques user's story with improvement suggestions
  app.post("/api/projects/:projectId/ai/refine-story", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const { storyData, meetingContext } = req.body;
      
      if (!storyData) {
        return res.status(400).json({ error: "storyData is required" });
      }
      
      const prompt = `You are an expert storytelling coach at Korn Ferry, helping consultants craft compelling stories for executive audiences.

=== COMPANY CONTEXT ===
Company: ${project.companyName}
Industry: ${project.sector || 'Not specified'}

=== MEETING CONTEXT ===
${meetingContext?.contactName ? `Meeting with: ${meetingContext.contactName}, ${meetingContext.contactTitle || ''}` : 'No specific contact'}
${meetingContext?.objective ? `Objective: ${meetingContext.objective}` : ''}

=== CURRENT STORY DRAFT ===
BEFORE (Crafting):
- Core Message: ${storyData.before?.singleMessage || '[Empty]'}
- Emotional Goal: ${storyData.before?.emotionalReaction || '[Empty]'}
- Opening Hook: ${storyData.before?.startingHook || '[Empty]'}
- Story Structure: ${storyData.before?.storyStructure || '[Empty]'}
- Hero/Characters: ${storyData.before?.heroCharacter || '[Empty]'}
- Evidence: ${storyData.before?.evidenceToReference || '[Empty]'}

DURING (Telling):
- Opening Line: ${storyData.during?.openingLine || '[Empty]'}
- Turning Point: ${storyData.during?.turningPoint || '[Empty]'}
- Key Data Points: ${storyData.during?.keyDataPoints || '[Empty]'}
- Pacing Notes: ${storyData.during?.pacingNotes || '[Empty]'}

AFTER (Landing):
- Moment of Meaning: ${storyData.after?.momentOfMeaning || '[Empty]'}
- Explicit Takeaway: ${storyData.after?.explicitTakeaway || '[Empty]'}
- Call to Action: ${storyData.after?.callToAction || '[Empty]'}

=== YOUR TASK ===
Review this story draft and provide specific, actionable coaching feedback. Evaluate each filled element and suggest improvements. Be encouraging but honest.

Provide your response in this JSON format:
{
  "overallScore": <number 1-10>,
  "overallFeedback": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": [
    {
      "element": "<element name like 'Core Message'>",
      "currentIssue": "<what's wrong or could be better>",
      "suggestion": "<specific improvement suggestion>",
      "improvedVersion": "<optional: rewritten version>"
    }
  ],
  "missingElements": ["<critical missing element 1>"],
  "nextSteps": ["<next action 1>", "<next action 2>"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from AI");
      }
      
      const result = JSON.parse(content);
      res.json(result);
    } catch (error: any) {
      console.error("[Refine Story API] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/projects/:projectId/ai/suggest-templates - AI-powered template suggestions based on context
  app.post("/api/projects/:projectId/ai/suggest-templates", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const { 
        templates, 
        discoveryTheme, 
        greenSheet, 
        meetingAttendees,
        discoveryInsights 
      } = req.body;
      
      if (!templates || !Array.isArray(templates) || templates.length === 0) {
        return res.status(400).json({ error: "templates array is required" });
      }
      
      // Fetch stored insights if not provided
      let insightsContext = "";
      if (discoveryInsights && discoveryInsights.length > 0) {
        insightsContext = discoveryInsights.slice(0, 8).map((i: any) => 
          `- ${i.title || i.label}: ${i.content || i.value}`
        ).join("\n");
      } else {
        const storedInsights = await storage.getCompanyDataPoints(projectId);
        if (storedInsights.length > 0) {
          insightsContext = storedInsights.slice(0, 8).map(i => 
            `- ${i.label}: ${i.value || ''}`
          ).join("\n");
        }
      }
      
      // Build attendee context
      let attendeeContext = "";
      if (meetingAttendees && meetingAttendees.length > 0) {
        attendeeContext = meetingAttendees.map((a: any) => 
          `- ${a.name}: ${a.title || ''} (${a.role || a.affiliation || ''})`
        ).join("\n");
      }
      
      const prompt = `You are an expert storytelling coach at Korn Ferry. Based on the client context, recommend the best story templates for this upcoming conversation.

=== CLIENT CONTEXT ===
Company: ${project.companyName}
Industry: ${project.sector || 'Not specified'}
Discovery Theme: ${discoveryTheme || project.discoveryTheme || 'General engagement'}

=== GREEN SHEET CONTEXT ===
${greenSheet?.objective ? `Call Objective: ${greenSheet.objective}` : ''}
${greenSheet?.desiredOutcome ? `Desired Outcome: ${greenSheet.desiredOutcome}` : ''}
${greenSheet?.openingStatement ? `Opening Statement: ${greenSheet.openingStatement}` : ''}

=== MEETING ATTENDEES ===
${attendeeContext || 'No specific attendees identified'}

=== DISCOVERY INSIGHTS ===
${insightsContext || 'No discovery insights available'}

=== AVAILABLE TEMPLATES ===
${templates.map((t: any) => `
Template ID: ${t.id}
Name: ${t.name}
Description: ${t.description}
Tags: ${t.tags?.join(', ') || 'None'}
Themes: ${t.themes?.join(', ') || 'None'}
Use Cases: ${t.useCases?.join(', ') || 'None'}
Target Audience: ${t.audienceRoles?.join(', ') || 'Any'}
Korn Ferry Solutions: ${t.kornFerrySolutions?.join(', ') || 'General'}
`).join('\n---\n')}

=== YOUR TASK ===
Analyze the context and rank the templates by relevance. For each template, provide:
1. A relevance score (0-100)
2. A brief rationale explaining why this template fits or doesn't fit
3. Specific fit reasons based on the context

Return JSON:
{
  "recommendations": [
    {
      "templateId": "<template id>",
      "score": <0-100>,
      "rationale": "<2-3 sentence explanation of fit>",
      "fitReasons": ["<reason 1>", "<reason 2>"],
      "bestFor": "<specific scenario this works best for>"
    }
  ],
  "suggestedCombination": {
    "templateIds": ["<id1>", "<id2>"],
    "reason": "<why these work well together>"
  }
}`;

      console.log("[Template Suggestion] Generating recommendations for", project.companyName);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from AI");
      }
      
      const result = JSON.parse(content);
      console.log("[Template Suggestion] Success! Ranked", result.recommendations?.length || 0, "templates");
      res.json(result);
    } catch (error: any) {
      console.error("[Template Suggestion API] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/projects/:projectId/ai/merge-templates - Merge multiple templates into cohesive narrative
  app.post("/api/projects/:projectId/ai/merge-templates", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const { 
        templates, 
        discoveryTheme, 
        greenSheet, 
        meetingAttendees,
        currentStoryData,
        mergeMode 
      } = req.body;
      
      if (!templates || !Array.isArray(templates) || templates.length < 1) {
        return res.status(400).json({ error: "At least one template is required" });
      }
      
      // Build attendee context
      let attendeeContext = "";
      if (meetingAttendees && meetingAttendees.length > 0) {
        attendeeContext = meetingAttendees.map((a: any) => 
          `- ${a.name}: ${a.title || ''} (${a.role || a.affiliation || ''})`
        ).join("\n");
      }
      
      const prompt = `You are an expert storytelling coach at Korn Ferry. Your task is to merge multiple story templates into a single, cohesive narrative that flows naturally.

=== CLIENT CONTEXT ===
Company: ${project.companyName}
Industry: ${project.sector || 'Not specified'}
Discovery Theme: ${discoveryTheme || project.discoveryTheme || 'General engagement'}

=== GREEN SHEET CONTEXT ===
${greenSheet?.objective ? `Call Objective: ${greenSheet.objective}` : ''}
${greenSheet?.desiredOutcome ? `Desired Outcome: ${greenSheet.desiredOutcome}` : ''}

=== MEETING ATTENDEES ===
${attendeeContext || 'No specific attendees identified'}

=== TEMPLATES TO MERGE ===
${templates.map((t: any, idx: number) => `
TEMPLATE ${idx + 1}: ${t.name}
Description: ${t.description}
BEFORE:
- Key Message: ${t.data?.before?.singleMessage || ''}
- Opening Hook: ${t.data?.before?.startingHook || ''}
- Hero Character: ${t.data?.before?.heroCharacter || ''}
- Emotional Goal: ${t.data?.before?.emotionalReaction || ''}
- Story Structure: ${t.data?.before?.storyStructure || ''}
DURING:
- Opening Line: ${t.data?.during?.openingLine || ''}
- Turning Point: ${t.data?.during?.turningPoint || ''}
- Key Data Points: ${t.data?.during?.keyDataPoints || ''}
AFTER:
- Moment of Meaning: ${t.data?.after?.momentOfMeaning || ''}
- Call to Action: ${t.data?.after?.callToAction || ''}
`).join('\n---\n')}

${currentStoryData && mergeMode === 'fill_gaps' ? `
=== EXISTING STORY (preserve these elements) ===
BEFORE:
- Key Message: ${currentStoryData.before?.singleMessage || '[Empty - fill from templates]'}
- Opening Hook: ${currentStoryData.before?.startingHook || '[Empty - fill from templates]'}
- Hero Character: ${currentStoryData.before?.heroCharacter || '[Empty - fill from templates]'}
DURING:
- Opening Line: ${currentStoryData.during?.openingLine || '[Empty - fill from templates]'}
- Turning Point: ${currentStoryData.during?.turningPoint || '[Empty - fill from templates]'}
AFTER:
- Moment of Meaning: ${currentStoryData.after?.momentOfMeaning || '[Empty - fill from templates]'}
- Call to Action: ${currentStoryData.after?.callToAction || '[Empty - fill from templates]'}
` : ''}

=== YOUR TASK ===
Create a unified, cohesive story that blends the best elements from the selected templates.
${mergeMode === 'fill_gaps' ? 'IMPORTANT: Only fill empty elements. Preserve any existing content.' : 'Create a fresh narrative combining the templates\' strengths.'}

The merged story should:
1. Have a clear, unified core message that connects the themes
2. Flow naturally from BEFORE → DURING → AFTER
3. Be tailored to ${project.companyName} and the meeting context
4. Feel like ONE story, not multiple stories stitched together

Return JSON:
{
  "mergedStory": {
    "before": {
      "singleMessage": "<unified core message>",
      "emotionalReaction": "<best fit emotion>",
      "storyStructure": "<best fit structure>",
      "startingHook": "<compelling opening>",
      "heroCharacter": "<who the story is about>",
      "evidenceToReference": ""
    },
    "during": {
      "openingLine": "<opening line>",
      "turningPoint": "<pivotal moment>",
      "keyDataPoints": "<supporting metrics>"
    },
    "after": {
      "momentOfMeaning": "<insight or lesson>",
      "callToAction": "<specific next step>"
    }
  },
  "narrativeSummary": "<2-3 sentence summary of the unified story>",
  "templateContributions": [
    { "templateId": "<id>", "elementsUsed": ["<element1>", "<element2>"] }
  ]
}`;

      console.log("[Template Merge] Merging", templates.length, "templates for", project.companyName);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from AI");
      }
      
      const result = JSON.parse(content);
      console.log("[Template Merge] Success! Created unified narrative");
      res.json(result);
    } catch (error: any) {
      console.error("[Template Merge API] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/projects/:projectId/ai/generate-methodology-questions - Generate methodology-tagged discovery questions
  app.post("/api/projects/:projectId/ai/generate-methodology-questions", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const { 
        companyName, 
        theme, 
        contactRole, 
        contactName,
        contactTitle,
        contactInfluence,
        knownConcerns,
        meetingObjective,
        desiredOutcome,
        methodology, 
        includeIntelligence,
        meetingAttendees,
        meetingMode
      } = req.body;
      
      // Fetch intelligence data if requested
      let intelligenceContext = "";
      if (includeIntelligence) {
        const discoveryTheme = theme || project.discoveryTheme || "leadership";
        const intelligence = await storage.getProjectIntelligence(projectId, discoveryTheme);
        if (intelligence?.intelligenceData) {
          const data = intelligence.intelligenceData as any;
          // Extract key insights in a concise format
          const keyFindings: string[] = [];
          if (data.companyOverview) keyFindings.push(`Company Context: ${data.companyOverview}`);
          if (data.strategicPriorities?.length) keyFindings.push(`Strategic Priorities: ${data.strategicPriorities.slice(0, 3).join(", ")}`);
          if (data.challenges?.length) keyFindings.push(`Key Challenges: ${data.challenges.slice(0, 3).join(", ")}`);
          if (data.competitivePosition) keyFindings.push(`Competitive Position: ${data.competitivePosition}`);
          if (data.marketContext) keyFindings.push(`Market Context: ${data.marketContext}`);
          intelligenceContext = keyFindings.join("\n");
        }
      }
      
      const methodologyGuide = {
        spin: `SPIN Selling methodology:
- SITUATION: Questions about their current state, processes, and context (not challenges yet)
- PROBLEM: Questions that uncover pain points, inefficiencies, and difficulties
- IMPLICATION: Questions about the consequences and impact of the problems (makes pain bigger)
- NEED-PAYOFF: Questions that get them to articulate the value of solving the problem`,
        miller_heiman: `Miller Heiman Strategic Selling:
- Focus on understanding the buying process and decision-makers
- Questions about their decision-making process and buying criteria
- Questions to identify Economic Buyers, User Buyers, Technical Buyers
- Questions about their ideal outcome and what success looks like`,
        pss: `Professional Selling Skills (PSS):
- Opening: Questions that create rapport and establish context
- Probing: Questions that deeply explore needs and priorities
- Supporting: Questions that help them envision the solution
- Closing: Questions that move toward commitment and next steps`,
        all: `Mix of SPIN Selling, Miller Heiman Strategic Selling, and PSS methodologies:
Use a variety of approaches to uncover needs, understand the buying process, and build value.`
      };
      
      const methodologyContext = methodologyGuide[methodology as keyof typeof methodologyGuide] || methodologyGuide.all;
      
      // Build attendee list from meetingAttendees array (multi-stakeholder) or single contact
      let attendeeList: Array<{name: string; title: string; role: string; influence: string; concerns: string; outcomes: string}> = [];
      
      if (meetingMode === "multiple" && meetingAttendees && Array.isArray(meetingAttendees) && meetingAttendees.length > 0) {
        attendeeList = meetingAttendees.map((a: any) => ({
          name: a.name || "Unknown",
          title: a.title || "Unknown",
          role: a.role || "unknown",
          influence: a.influence || "unknown",
          concerns: a.knownConcerns || a.concerns || "not specified",
          outcomes: a.preferredOutcomes || a.outcomes || "not specified"
        }));
      } else if (contactName) {
        attendeeList = [{
          name: contactName,
          title: contactTitle || "Unknown",
          role: contactRole || "unknown",
          influence: contactInfluence || "unknown",
          concerns: knownConcerns || "not specified",
          outcomes: desiredOutcome || "not specified"
        }];
      }
      
      const attendeeNames = attendeeList.map(a => a.name);
      const hasMultipleAttendees = attendeeList.length > 1;
      
      // Build attendee context for prompt
      const attendeeContext = attendeeList.length > 0 
        ? attendeeList.map(a => `- ${a.name} (${a.title})
    Role: ${a.role}, Influence: ${a.influence}
    Concerns: ${a.concerns}
    Preferred Outcomes: ${a.outcomes}`).join("\n\n")
        : `- ${contactName || "Unknown Contact"} (${contactTitle || "Unknown Title"})
    Role: ${contactRole || "unknown"}, Influence: ${contactInfluence || "unknown"}
    Concerns: ${knownConcerns || "not specified"}`;
      
      // Build Green Sheet context
      const greenSheetContext = [
        meetingObjective ? `Meeting Objective: ${meetingObjective}` : "",
        desiredOutcome ? `Desired Outcome: ${desiredOutcome}` : ""
      ].filter(Boolean).join("\n");
      
      const prompt = `You are an expert Korn Ferry sales consultant helping prepare high-impact discovery questions.

=== COMPANY CONTEXT ===
Company: ${companyName || project.companyName}
Discovery Theme: ${theme || 'Leadership Development'}

=== MEETING ATTENDEES (${attendeeList.length} people) ===
${attendeeContext}

=== GREEN SHEET (Meeting Preparation) ===
${greenSheetContext || "No specific meeting context provided"}

=== INTELLIGENCE & RESEARCH ===
${intelligenceContext || "No intelligence data available - use general industry knowledge"}

=== SALES METHODOLOGY ===
${methodologyContext}

=== YOUR TASK ===
Generate ${hasMultipleAttendees ? "10-12" : "6"} powerful, outcome-focused discovery questions that:
1. Directly reference the company's specific situation, challenges, or strategic priorities from the intelligence above
2. ${hasMultipleAttendees 
  ? `Include BOTH questions for ALL attendees AND questions specifically targeted to individual attendees based on their roles, concerns, and outcomes. EVERY attendee (${attendeeNames.join(", ")}) should have at least 1-2 questions specifically for them.`
  : `Are tailored to the contact's role (${contactRole || 'decision maker'}) and concerns`}
3. Align with the meeting objective: "${meetingObjective || 'Discovery and qualification'}"
4. Help uncover measurable business outcomes and build urgency for change
5. Use the specific language and context provided - don't be generic

IMPORTANT: Questions MUST be specific to ${companyName || project.companyName} and reference actual intelligence/context provided above.

For each question, provide:
- question: A specific, provocative question that references ${companyName || project.companyName}'s situation
- methodology: Either "SPIN", "Miller Heiman", or "PSS"
- stage: The specific stage within that methodology
- targetAudience: "all" (for questions relevant to everyone) OR "specific" (for questions targeted at specific people)
- targetAttendeeNames: ${hasMultipleAttendees ? `Array of names from [${attendeeNames.map(n => `"${n}"`).join(", ")}] when targetAudience is "specific", empty array [] when "all"` : "Empty array []"}
- rationale: Why this question is important for this audience
- outcome: What business outcome/KPI this question helps uncover
- followUp: A follow-up question hint

${methodology !== 'all' ? `Focus primarily on ${methodology === 'spin' ? 'SPIN Selling' : methodology === 'miller_heiman' ? 'Miller Heiman' : 'PSS'} methodology.` : 'Use a mix of all three methodologies.'}

Respond in JSON format:
{
  "questions": [
    {
      "question": "...",
      "methodology": "SPIN" | "Miller Heiman" | "PSS",
      "stage": "...",
      "targetAudience": "all" | "specific",
      "targetAttendeeNames": ["Name1"] | [],
      "rationale": "...",
      "outcome": "...",
      "followUp": "..."
    }
  ],
  "attendeeCoverage": {
    ${attendeeNames.map(n => `"${n}": ["list of question indices targeted at this person"]`).join(",\n    ")}
  }
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 2500,
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from AI");
      }
      
      const result = JSON.parse(content);
      res.json({
        ...result,
        attendeeCount: attendeeList.length,
        attendeeNames
      });
    } catch (error: any) {
      console.error("[Generate Methodology Questions API] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/projects/:projectId/ai/suggest-success-stories - Suggest relevant Korn Ferry success stories
  app.post("/api/projects/:projectId/ai/suggest-success-stories", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const { companyName, industry, theme, keyMessage, insights } = req.body;
      
      // Curated Korn Ferry success stories from kornferry.com/about-us/business-impact/client-stories
      const kornFerryStories = [
        {
          title: "Employee Engagement Success for a Global Insurance Leader",
          client: "Allianz",
          industry: "Insurance/Financial Services",
          solution: "Employee Engagement, Korn Ferry Listen",
          outcome: "Enhanced team performance through employee engagement technology and consulting",
          url: "https://www.kornferry.com/insights/featured-topics/employee-experience/employee-engagement-success-for-a-global-insurance-leader"
        },
        {
          title: "How Interim Solutions Supported a Global Financial Leader",
          client: "Western Union",
          industry: "Financial Services",
          solution: "Interim Talent Solutions, Digital Banking",
          outcome: "Expanded digital banking platform through specialized technology experts",
          url: "https://www.kornferry.com/insights/featured-topics/employee-experience/how-interim-solutions-supported-a-global-financial-leader"
        },
        {
          title: "Winning Sales Chemistry with a Global Industry Leader",
          client: "Brenntag",
          industry: "Chemical Distribution",
          solution: "Sales Transformation, Korn Ferry Sell",
          outcome: "Implemented consistent sales processes and drove success across global operations",
          url: "https://www.kornferry.com/insights/featured-topics/sales-transformation/winning-sales-chemistry-with-a-global-industry-leader"
        },
        {
          title: "A High-Flying Partnership to Build a Resilient Workforce",
          client: "Massport",
          industry: "Government/Transportation",
          solution: "Organizational Transformation, Talent Development",
          outcome: "Transformed talent strategy and enhanced customer experience",
          url: "https://www.kornferry.com/insights/featured-topics/organizational-transformation/a-high-flying-partnership-to-build-a-resilient-workforce"
        },
        {
          title: "Delivering a Recipe for Sales Success to a Global Food Supplier",
          client: "Lamb Weston",
          industry: "Food & Beverage",
          solution: "Sales Transformation",
          outcome: "Developed winning strategy for sales transformation in restaurant and retail channels",
          url: "https://www.kornferry.com/insights/featured-topics/sales-transformation/delivering-a-recipe-for-sales-success-to-a-global-food-supplier"
        },
        {
          title: "Nurturing Talent Success for a Global Semiconductor Leader",
          client: "ASML",
          industry: "Technology/Semiconductors",
          solution: "Talent Management, Workforce Planning",
          outcome: "Enabled strong talent management structure for semiconductor industry leader",
          url: "https://www.kornferry.com/insights/featured-topics/workforce-management/nuturing-talent-success-for-a-global-semiconductor-leader"
        },
        {
          title: "Investing in Korn Ferry Assess for Talent Management Solutions",
          client: "NatWest",
          industry: "Banking/Financial Services",
          solution: "Korn Ferry Assess, Talent Strategy",
          outcome: "Advanced talent strategy through assessment products",
          url: "https://www.kornferry.com/insights/featured-topics/workforce-management/investing-in-korn-ferry-assess-for-talent-management-solutions"
        },
        {
          title: "Ensuring Strong Leadership Talent through Korn Ferry Assess",
          client: "State Farm",
          industry: "Insurance",
          solution: "Leadership Development, Korn Ferry Assess",
          outcome: "Developed leadership pipeline and improved talent development strategies",
          url: "https://www.kornferry.com/insights/featured-topics/workforce-management/ensuring-strong-leadership-talent-through-korn-ferry-assess"
        },
        {
          title: "Engineering a Win for Sales",
          client: "IMI",
          industry: "Engineering/Manufacturing",
          solution: "Sales Transformation, Korn Ferry Sell",
          outcome: "Improved sales processes and built culture of success",
          url: "https://www.kornferry.com/insights/featured-topics/sales-transformation/engineering-a-win-for-sales"
        },
        {
          title: "Korn Ferry Boosts Talent Strategy for Chemicals Company",
          client: "Clariant",
          industry: "Chemicals",
          solution: "Job Structure, Workforce Planning",
          outcome: "Upgraded job structure and improved workforce planning",
          url: "https://www.kornferry.com/insights/featured-topics/organizational-transformation/korn-ferry-digital-boosts-talent-strategy-for-chemicals-company"
        },
        {
          title: "Improving Customer Satisfaction at Leading Telecommunications Company",
          client: "Telstra",
          industry: "Telecommunications",
          solution: "Customer Service Training, NPS Improvement",
          outcome: "Improved NPS scores through comprehensive customer service training",
          url: "https://www.kornferry.com/insights/featured-topics/organizational-transformation/improving-customer-satisfaction-at-leading-telecommunications-company"
        },
        {
          title: "Juicing Up Talent at a Multi-Billion Dollar Beverage Company",
          client: "Tropicana",
          industry: "Food & Beverage",
          solution: "Talent Recruitment, Operations Optimization",
          outcome: "Strengthened internal processes, placed critical roles, optimized operations",
          url: "https://www.kornferry.com/insights/featured-topics/talent-recruitment/juicing-up-talent-at-a-multi-billion-dollar-beverage-company"
        },
        {
          title: "A Major Tire Company Rolls with Korn Ferry",
          client: "Goodyear",
          industry: "Manufacturing/Automotive",
          solution: "Learning & Development",
          outcome: "Developed and integrated global L&D framework",
          url: "https://www.kornferry.com/insights/featured-topics/organizational-transformation/a-major-tire-company-rolls-with-korn-ferry"
        },
        {
          title: "Driving Transformation With a Large Sanitation Company",
          client: "Sabesp",
          industry: "Utilities/Infrastructure",
          solution: "Leadership Development, Organizational Alignment",
          outcome: "Strengthened leaders and improved internal alignment",
          url: "https://www.kornferry.com/insights/featured-topics/organizational-transformation/driving-transformation-with-a-large-sanitation-company"
        },
        {
          title: "The Right Prescription: Building a Global RPO Partnership",
          client: "Global Biopharmaceutical Company",
          industry: "Pharmaceutical/Healthcare",
          solution: "RPO, Talent Acquisition",
          outcome: "Implemented complete recruitment solution and improved talent acquisition",
          url: "https://www.kornferry.com/insights/featured-topics/talent-recruitment/building-a-global-rpo-partnership"
        },
        {
          title: "Providing Talent Management Solutions at the Speed of AI",
          client: "European AI Manufacturing Hub",
          industry: "Technology/Manufacturing",
          solution: "Talent Strategy, HR Digitization",
          outcome: "Redefined talent strategy and digitized HR processes",
          url: "https://www.kornferry.com/insights/featured-topics/workforce-management/providing-talent-management-solutions-at-the-speed-of-ai"
        },
        {
          title: "How KF Sell Helped a Global Financial Market Leader to Thrive",
          client: "Global Financial Market Infrastructure Provider",
          industry: "Financial Services",
          solution: "Sales Transformation, Korn Ferry Sell",
          outcome: "Transformed sales organization and drove strategic, sustainable growth",
          url: "https://www.kornferry.com/insights/featured-topics/sales-transformation/how-korn-ferry-sell-helped-a-global-financial-market-leader-to-thrive"
        },
        {
          title: "Global Beauty Leader Transforms Employee Experience",
          client: "Global Beauty Company",
          industry: "Consumer Goods/Beauty",
          solution: "Employee Engagement, Culture Alignment",
          outcome: "Measured employee engagement and aligned it with company culture",
          url: "https://www.kornferry.com/insights/featured-topics/employee-experience/global-beauty-leader-transforms-employee-experience"
        },
        {
          title: "A Talent Management Strategy to Move the World",
          client: "Maersk",
          industry: "Logistics/Shipping",
          solution: "Talent Management, Organizational Transformation",
          outcome: "Human-centric talent management strategy transforming the organization",
          url: "https://www.kornferry.com/insights/featured-topics/organizational-transformation/a-talent-management-strategy-to-move-the-world"
        }
      ];
      
      const insightContext = insights?.length > 0 ? `Known company challenges: ${insights.join(', ')}` : '';
      
      const prompt = `You are a Korn Ferry sales consultant helping find the most relevant success stories to share with a prospect.

Target Company: ${companyName || project.companyName}
Industry: ${industry || project.sector || 'Not specified'}
Theme/Need: ${theme || 'General consulting'}
${keyMessage ? `Key Message to Support: ${keyMessage}` : ''}
${insightContext}

Here are Korn Ferry's available client success stories:
${kornFerryStories.map((s, i) => `${i + 1}. "${s.title}" - ${s.client} (${s.industry}) - Solution: ${s.solution} - Outcome: ${s.outcome}`).join('\n')}

Select the 3 MOST RELEVANT stories for this prospect. Consider:
1. Industry similarity or transferable lessons
2. Solution alignment with the prospect's likely needs
3. Compelling outcomes that would resonate

For each selected story, explain WHY it's relevant to this specific prospect.

Respond in JSON format:
{
  "stories": [
    {
      "title": "exact story title from list",
      "client": "client name",
      "industry": "industry",
      "solution": "solution type",
      "outcome": "specific outcome achieved",
      "relevance": "1-2 sentence explanation of why this is relevant to the prospect",
      "url": "story URL"
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from AI");
      }
      
      const result = JSON.parse(content);
      
      // Ensure URLs are included from our curated list
      if (result.stories) {
        result.stories = result.stories.map((story: any) => {
          const matchedStory = kornFerryStories.find(s => 
            s.title.toLowerCase().includes(story.title?.toLowerCase()?.substring(0, 30) || '') ||
            story.title?.toLowerCase()?.includes(s.title.toLowerCase().substring(0, 30))
          );
          return {
            ...story,
            url: matchedStory?.url || story.url || "https://www.kornferry.com/about-us/business-impact/client-stories"
          };
        });
      }
      
      res.json(result);
    } catch (error: any) {
      console.error("[Suggest Success Stories API] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/migrate/projects-to-accounts - Migration endpoint to auto-create accounts
  app.post("/api/migrate/projects-to-accounts", async (req, res) => {
    try {
      await storage.migrateProjectsToAccounts();
      res.json({ success: true, message: "Migration completed - projects linked to accounts" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ============================================================================
  // STRATEGY SELECTIONS API - Persisted strategy choices and outcomes
  // ============================================================================
  
  // GET /api/projects/:projectId/strategy-selection - Get strategy selection for a project
  app.get("/api/projects/:projectId/strategy-selection", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const selection = await storage.getStrategySelection(projectId);
      
      if (!selection) {
        return res.status(404).json({ error: "No strategy selection found for this project" });
      }
      
      // Transform database data back to frontend format
      // Database stores: generatedStrategies, selectedStrategyIds, generatedOutcomes, selectedOutcomeIds
      // Frontend expects: selectedStrategiesData: {strategies, selectedIds, customStrategies}
      //                   generatedOutcomesData: {outcomes, selectedOutcomeIds}
      const strategies = (selection.generatedStrategies as any[]) || [];
      const selectedIds = selection.selectedStrategyIds || [];
      const outcomes = (selection.generatedOutcomes as any[]) || [];
      const selectedOutcomeIds = selection.selectedOutcomeIds || [];
      
      const response = {
        ...selection,
        // Add frontend-expected nested structures
        selectedStrategiesData: {
          strategies: strategies,
          selectedIds: selectedIds,
          customStrategies: [], // Custom strategies are merged with strategies
        },
        generatedOutcomesData: {
          outcomes: outcomes,
          selectedOutcomeIds: selectedOutcomeIds,
        },
      };
      
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // POST /api/projects/:projectId/strategy-selection - Create or update strategy selection
  app.post("/api/projects/:projectId/strategy-selection", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Transform frontend data to match database schema
      // Frontend sends: selectedStrategiesData: {strategies, selectedIds, customStrategies}
      //                 generatedOutcomesData: {outcomes, selectedOutcomeIds}
      // Database expects: generatedStrategies, selectedStrategyIds, generatedOutcomes, selectedOutcomeIds
      
      const transformedData: any = {
        status: req.body.status,
      };
      
      // Transform selectedStrategiesData
      if (req.body.selectedStrategiesData) {
        const { strategies, selectedIds, customStrategies } = req.body.selectedStrategiesData;
        // Merge AI strategies with custom strategies
        const allStrategies = [...(strategies || []), ...(customStrategies || [])];
        transformedData.generatedStrategies = allStrategies;
        transformedData.selectedStrategyIds = selectedIds || [];
        transformedData.strategiesSelectedAt = new Date();
      }
      
      // Transform generatedOutcomesData
      if (req.body.generatedOutcomesData) {
        const { outcomes, selectedOutcomeIds } = req.body.generatedOutcomesData;
        transformedData.generatedOutcomes = outcomes || [];
        transformedData.selectedOutcomeIds = selectedOutcomeIds || [];
        transformedData.outcomesGeneratedAt = new Date();
      }
      
      // Handle handoff confirmation
      if (req.body.handoffConfirmed === true) {
        transformedData.status = "ready_for_handoff";
        transformedData.outcomesConfirmedAt = new Date();
      }
      
      // Check if selection already exists
      const existing = await storage.getStrategySelection(projectId);
      
      let result;
      if (existing) {
        // Update existing selection
        result = await storage.updateStrategySelection(projectId, {
          ...transformedData,
          updatedAt: new Date(),
        });
      } else {
        // Create new selection
        result = await storage.createStrategySelection({
          projectId,
          ...transformedData,
        });
      }
      
      // Create kpiCommitments when outcomes are generated/saved OR when handoff is confirmed
      const shouldCreateCommitments = 
        (req.body.status === "outcomes_generated" || 
         req.body.status === "outcomes_selected" || 
         req.body.handoffConfirmed === true) && 
        req.body.generatedOutcomesData;
      
      if (shouldCreateCommitments) {
        const { outcomes, selectedOutcomeIds } = req.body.generatedOutcomesData;
        
        if (outcomes && selectedOutcomeIds && selectedOutcomeIds.length > 0) {
          // Helper function to map kornFerrySolution to solutionPattern
          const mapToSolutionPattern = (kornFerrySolution: string, kfOfferingName?: string): SolutionPatternId | null => {
            const combined = (kornFerrySolution + " " + (kfOfferingName || "")).toLowerCase();
            
            if (combined.includes("sales") || combined.includes("revenue") || combined.includes("commercial")) {
              return "sales_effectiveness";
            }
            if (combined.includes("leader") || combined.includes("executive") || combined.includes("succession")) {
              return "leadership_development";
            }
            if (combined.includes("organization") || combined.includes("transformation") || combined.includes("design") || combined.includes("change")) {
              return "org_transformation";
            }
            if (combined.includes("talent") || combined.includes("recruit") || combined.includes("hire") || combined.includes("acquisition")) {
              return "talent_acquisition";
            }
            if (combined.includes("reward") || combined.includes("compensation") || combined.includes("pay") || combined.includes("benefit")) {
              return "rewards_optimization";
            }
            return null;
          };
          
          // Get existing commitments to avoid duplicates
          const existingCommitments = await storage.getKpiCommitments(projectId);
          const existingTitles = new Set(existingCommitments.map(c => c.commitmentTitle.toLowerCase()));
          
          // Create kpiCommitments from selected outcomes
          for (const outcome of outcomes) {
            if (!selectedOutcomeIds.includes(outcome.id)) continue;
            
            // Skip if commitment with same title already exists
            if (existingTitles.has(outcome.outcomeName?.toLowerCase() || "")) continue;
            
            const solutionPattern = mapToSolutionPattern(
              outcome.kornFerrySolution || "", 
              outcome.kfOffering?.name || ""
            );
            
            // Get journey template if solution pattern is mapped
            let journeyPhases = null;
            let quickWins = null;
            let keyMilestones = null;
            let implementationTimeline = null;
            
            if (solutionPattern && OUTCOME_JOURNEY_TEMPLATES[solutionPattern]) {
              const template = OUTCOME_JOURNEY_TEMPLATES[solutionPattern];
              journeyPhases = template.phases;
              quickWins = template.quickWins;
              keyMilestones = template.milestones;
              implementationTimeline = template.typicalTimeline;
            }
            
            // Create the commitment
            const commitmentData = {
              projectId,
              commitmentTitle: outcome.outcomeName || "Untitled Outcome",
              commitmentDescription: outcome.outcomeDescription || null,
              valuePillar: outcome.valuePillar || null,
              solutionPattern: solutionPattern,
              customMetricName: outcome.kpiDetails?.metricName || null,
              metricUnit: outcome.kpiDetails?.unit || null,
              baselineValue: outcome.kpiDetails?.suggestedBaseline || null,
              targetValue: outcome.kpiDetails?.suggestedTarget || null,
              status: "draft" as const,
              journeyPhases,
              quickWins,
              keyMilestones,
              implementationTimeline,
              aiProvenance: {
                generatedFrom: "strategy_outcome",
                outcomeId: outcome.id,
                strategyId: outcome.strategyId,
                generatedAt: new Date().toISOString(),
              },
            };
            
            await storage.createKpiCommitment(commitmentData);
            existingTitles.add((outcome.outcomeName || "").toLowerCase());
          }
        }
      }
      
      return res.status(existing ? 200 : 201).json(result);
    } catch (error: any) {
      console.error("Strategy selection error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // PATCH /api/projects/:projectId/strategy-selection - Update strategy selection
  app.patch("/api/projects/:projectId/strategy-selection", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Check if selection exists
      const existing = await storage.getStrategySelection(projectId);
      
      if (!existing) {
        // Create new selection if it doesn't exist
        const selection = await storage.createStrategySelection({
          projectId,
          ...req.body,
        });
        return res.status(201).json(selection);
      }
      
      const updated = await storage.updateStrategySelection(projectId, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ============================================================================
  // KPI COMMITMENTS API - Sales-defined deliverables with customer
  // ============================================================================
  
  // GET /api/projects/:projectId/commitments - Get all KPI commitments for a project
  app.get("/api/projects/:projectId/commitments", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { status } = req.query;
      
      let commitments;
      if (status && typeof status === 'string') {
        commitments = await storage.getKpiCommitmentsByStatus(projectId, status);
      } else {
        commitments = await storage.getKpiCommitments(projectId);
      }
      
      // Add 'name' alias for frontend compatibility (maps to commitmentTitle)
      const commitmentsWithName = commitments.map(c => ({
        ...c,
        name: c.commitmentTitle, // Alias for UI that expects 'name' field
        description: c.commitmentDescription, // Alias for consistency
      }));
      
      res.json(commitmentsWithName);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // GET /api/projects/:projectId/commitments/:id - Get a specific commitment
  app.get("/api/projects/:projectId/commitments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const commitment = await storage.getKpiCommitment(id);
      
      if (!commitment) {
        return res.status(404).json({ error: "Commitment not found" });
      }
      
      // Add 'name' alias for frontend compatibility
      const commitmentWithName = {
        ...commitment,
        name: commitment.commitmentTitle,
        description: commitment.commitmentDescription,
      };
      
      res.json(commitmentWithName);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // POST /api/projects/:projectId/commitments - Create a new commitment
  app.post("/api/projects/:projectId/commitments", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Verify project exists
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Check BEFORE schema parsing if journey data was explicitly provided
      const hasExplicitJourney = req.body.journeyPhases && 
        Array.isArray(req.body.journeyPhases) && 
        req.body.journeyPhases.length > 0;
      
      // Prepare the data with potential template injection
      let dataToValidate = { ...req.body, projectId };
      
      // If solutionPattern is provided but no explicit journey data, inject template
      const solutionPattern = req.body.solutionPattern as SolutionPatternId | undefined;
      if (solutionPattern && OUTCOME_JOURNEY_TEMPLATES[solutionPattern] && !hasExplicitJourney) {
        const template = OUTCOME_JOURNEY_TEMPLATES[solutionPattern];
        dataToValidate = {
          ...dataToValidate,
          journeyPhases: template.phases,
          quickWins: template.quickWins,
          keyMilestones: template.milestones,
          implementationTimeline: req.body.implementationTimeline || template.typicalTimeline,
        };
      }
      
      const validated = insertKpiCommitmentSchema.parse(dataToValidate);
      const commitment = await storage.createKpiCommitment(validated);
      
      // Add 'name' alias for frontend compatibility
      const commitmentWithName = {
        ...commitment,
        name: commitment.commitmentTitle,
        description: commitment.commitmentDescription,
      };
      
      res.status(201).json(commitmentWithName);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // PATCH /api/projects/:projectId/commitments/:id - Update a commitment
  app.patch("/api/projects/:projectId/commitments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get existing commitment to check for pattern changes
      const existing = await storage.getKpiCommitment(id);
      if (!existing) {
        return res.status(404).json({ error: "Commitment not found" });
      }
      
      let updateData = { ...req.body };
      
      // Only inject template data when:
      // 1. solutionPattern is changing to a new value
      // 2. Journey fields are not explicitly provided in the request
      const newPattern = req.body.solutionPattern as SolutionPatternId | undefined;
      const isPatternChange = newPattern && newPattern !== existing.solutionPattern;
      
      if (isPatternChange && OUTCOME_JOURNEY_TEMPLATES[newPattern]) {
        const template = OUTCOME_JOURNEY_TEMPLATES[newPattern];
        
        // Only apply template if journey fields are not explicitly provided
        if (req.body.journeyPhases === undefined) {
          updateData.journeyPhases = template.phases;
        }
        if (req.body.quickWins === undefined) {
          updateData.quickWins = template.quickWins;
        }
        if (req.body.keyMilestones === undefined) {
          updateData.keyMilestones = template.milestones;
        }
        if (req.body.implementationTimeline === undefined) {
          updateData.implementationTimeline = template.typicalTimeline;
        }
      }
      
      const updated = await storage.updateKpiCommitment(id, updateData);
      
      // Add 'name' alias for frontend compatibility
      const updatedWithName = updated ? {
        ...updated,
        name: updated.commitmentTitle,
        description: updated.commitmentDescription,
      } : null;
      
      res.json(updatedWithName);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // DELETE /api/projects/:projectId/commitments/:id - Delete a commitment
  app.delete("/api/projects/:projectId/commitments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteKpiCommitment(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // PATCH /api/projects/:projectId/commitments/:id/confirm - Client confirms a commitment
  app.patch("/api/projects/:projectId/commitments/:id/confirm", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { clientConfirmedBy } = req.body;
      
      const updated = await storage.updateKpiCommitment(id, {
        status: "client_confirmed",
        clientConfirmedAt: new Date(),
        clientConfirmedBy: clientConfirmedBy || "Client",
      });
      
      if (!updated) {
        return res.status(404).json({ error: "Commitment not found" });
      }
      
      // Add 'name' alias for frontend compatibility
      const updatedWithName = {
        ...updated,
        name: updated.commitmentTitle,
        description: updated.commitmentDescription,
      };
      
      res.json(updatedWithName);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ============================================================================
  // HANDOFF PACKETS API - Sales to CSM transfer
  // ============================================================================
  
  // GET /api/projects/:projectId/handoffs - Get all handoff packets for a project
  app.get("/api/projects/:projectId/handoffs", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { state } = req.query;
      
      let packets;
      if (state && typeof state === 'string') {
        packets = await storage.getHandoffPacketsByAcceptanceState(projectId, state);
      } else {
        packets = await storage.getHandoffPackets(projectId);
      }
      
      res.json(packets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // GET /api/projects/:projectId/handoffs/:id - Get a specific handoff packet
  app.get("/api/projects/:projectId/handoffs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const packet = await storage.getHandoffPacket(id);
      
      if (!packet) {
        return res.status(404).json({ error: "Handoff packet not found" });
      }
      
      res.json(packet);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // POST /api/projects/:projectId/handoffs - Create a new handoff packet
  app.post("/api/projects/:projectId/handoffs", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Verify project exists
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Get all the commitments being handed off
      const { commitmentIds } = req.body;
      if (!commitmentIds || !Array.isArray(commitmentIds) || commitmentIds.length === 0) {
        return res.status(400).json({ error: "At least one commitment ID is required" });
      }
      
      // Calculate total committed value
      let totalValue = 0;
      for (const cId of commitmentIds) {
        const commitment = await storage.getKpiCommitment(cId);
        if (commitment?.estimatedAnnualValue) {
          totalValue += commitment.estimatedAnnualValue;
        }
      }
      
      // Extract Story Coach context from project for handoff
      const storyBuilderData = (project as any).storyBuilderData;
      let storyCoachContext = null;
      if (storyBuilderData) {
        storyCoachContext = {
          coreNarrative: {
            keyMessage: storyBuilderData.before?.singleMessage || "",
            emotionalGoal: storyBuilderData.before?.emotionalReaction || "",
            openingHook: storyBuilderData.before?.startingHook || "",
            callToAction: storyBuilderData.after?.callToAction || "",
            turningPoint: storyBuilderData.during?.turningPoint || "",
            momentOfMeaning: storyBuilderData.after?.momentOfMeaning || "",
          },
          tensionQuestions: (storyBuilderData.before?.tensionQuestions || []).map((q: any) => ({
            id: q.id,
            prompt: q.prompt,
            response: q.response || "",
            methodology: q.methodology,
            rationale: q.rationale,
            source: q.source,
            order: q.order,
            targetAudience: q.targetAudience,
            targetAttendeeNames: q.targetAttendeeNames,
          })),
          storyTestResults: storyBuilderData.refineResult ? {
            overallScore: storyBuilderData.refineResult.overallScore,
            overallFeedback: storyBuilderData.refineResult.overallFeedback,
            strengths: storyBuilderData.refineResult.strengths,
            improvements: storyBuilderData.refineResult.improvements,
            missingElements: storyBuilderData.refineResult.missingElements,
            nextSteps: storyBuilderData.refineResult.nextSteps,
          } : undefined,
          selectedTemplates: storyBuilderData.selectedTemplates || [],
          templateRecommendations: storyBuilderData.templateRecommendations?.recommendations || [],
          lastUpdated: storyBuilderData.lastUpdated,
        };
      }
      
      const validated = insertHandoffPacketSchema.parse({
        ...req.body,
        projectId,
        totalCommittedValue: totalValue,
        storyCoachContext,
      });
      
      const packet = await storage.createHandoffPacket(validated);
      
      // Mark all included commitments as handed off
      for (const cId of commitmentIds) {
        await storage.updateKpiCommitment(cId, { status: "handed_off" });
      }
      
      res.status(201).json(packet);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // PATCH /api/projects/:projectId/handoffs/:id - Update a handoff packet
  app.patch("/api/projects/:projectId/handoffs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const updated = await storage.updateHandoffPacket(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Handoff packet not found" });
      }
      
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // PATCH /api/projects/:projectId/handoffs/:id/accept - CSM accepts a handoff packet
  app.patch("/api/projects/:projectId/handoffs/:id/accept", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { csmOwnerName, csmOwnerEmail, acceptanceNotes } = req.body;
      
      const updated = await storage.updateHandoffPacket(id, {
        acceptanceState: "accepted",
        acceptedAt: new Date(),
        csmOwnerName,
        csmOwnerEmail,
        acceptanceNotes,
      });
      
      if (!updated) {
        return res.status(404).json({ error: "Handoff packet not found" });
      }
      
      // Mark all commitments as in_delivery
      if (updated.commitmentIds) {
        for (const cId of updated.commitmentIds) {
          await storage.updateKpiCommitment(cId, { status: "in_delivery" });
        }
      }
      
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // PATCH /api/projects/:projectId/handoffs/:id/clarify - CSM requests clarification
  app.patch("/api/projects/:projectId/handoffs/:id/clarify", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { question } = req.body;
      
      if (!question) {
        return res.status(400).json({ error: "Clarification question is required" });
      }
      
      const packet = await storage.getHandoffPacket(id);
      if (!packet) {
        return res.status(404).json({ error: "Handoff packet not found" });
      }
      
      const existingRequests = (packet.clarificationRequests as any[]) || [];
      const newRequest = {
        question,
        askedAt: new Date().toISOString(),
        answeredAt: null,
        answer: null,
      };
      
      const updated = await storage.updateHandoffPacket(id, {
        acceptanceState: "needs_clarification",
        clarificationRequests: [...existingRequests, newRequest],
      });
      
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // PATCH /api/projects/:projectId/handoffs/:id/answer - Sales answers clarification
  app.patch("/api/projects/:projectId/handoffs/:id/answer", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { questionIndex, answer } = req.body;
      
      if (questionIndex === undefined || !answer) {
        return res.status(400).json({ error: "questionIndex and answer are required" });
      }
      
      const packet = await storage.getHandoffPacket(id);
      if (!packet) {
        return res.status(404).json({ error: "Handoff packet not found" });
      }
      
      const requests = (packet.clarificationRequests as any[]) || [];
      if (questionIndex < 0 || questionIndex >= requests.length) {
        return res.status(400).json({ error: "Invalid question index" });
      }
      
      requests[questionIndex] = {
        ...requests[questionIndex],
        answer,
        answeredAt: new Date().toISOString(),
      };
      
      // Check if all questions are answered
      const allAnswered = requests.every(r => r.answer !== null);
      
      const updated = await storage.updateHandoffPacket(id, {
        acceptanceState: allAnswered ? "pending" : "needs_clarification",
        clarificationRequests: requests,
      });
      
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // POST /api/projects/:projectId/confirm-handoff - Confirm sales-to-delivery handoff
  app.post("/api/projects/:projectId/confirm-handoff", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { handoffNotes, confirmedAt } = req.body;
      
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Update project to delivery stage with handoff notes
      const updated = await storage.updateProject(projectId, {
        salesStage: "handoff",
        deliveryStage: "health_dashboard",
        handoffNotes: handoffNotes || null,
        handoffConfirmedAt: confirmedAt ? new Date(confirmedAt) : new Date(),
      });
      
      // Mark all confirmed commitments as handed_off
      const commitments = await storage.getKpiCommitments(projectId);
      for (const c of commitments) {
        if (c.status === "client_confirmed") {
          await storage.updateKpiCommitment(c.id, { status: "handed_off" });
        }
      }
      
      res.json({ 
        success: true, 
        project: updated,
        handoffConfirmedAt: confirmedAt,
        handoffNotes
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Helper to calculate KPI health status
  function calculateKPIHealthStatus(
    baseline: number | null, 
    target: number | null, 
    current: number | null
  ): 'on-track' | 'at-risk' | 'off-track' | 'no-data' {
    if (baseline === null || target === null || current === null) {
      return 'no-data';
    }
    
    const totalGap = target - baseline;
    if (totalGap === 0) return 'on-track';
    
    const progress = (current - baseline) / totalGap;
    
    if (progress >= 0.8) return 'on-track';
    if (progress >= 0.5) return 'at-risk';
    return 'off-track';
  }

  // POST /api/demo/seed-chanel - Seed Chanel demo data for executive demo
  app.post("/api/demo/seed-chanel", async (req, res) => {
    try {
      const forceReseed = req.query.force === "true";
      
      // Check if demo account already exists
      const existingAccounts = await storage.getAccounts();
      const chanelExists = existingAccounts.find(a => a.name === "Chanel");
      
      if (chanelExists && !forceReseed) {
        const allProjects = await storage.getProjects();
        const chanelProjects = allProjects.filter(p => p.accountId === chanelExists.id);
        return res.json({ 
          success: true, 
          message: "Chanel demo data already exists", 
          accountId: chanelExists.id,
          projectId: chanelProjects[0]?.id || null
        });
      }
      
      // If force reseed, delete existing Chanel account first
      if (chanelExists && forceReseed) {
        const allProjects = await storage.getProjects();
        const chanelProjects = allProjects.filter(p => p.accountId === chanelExists.id);
        for (const project of chanelProjects) {
          await storage.deleteProject(project.id);
        }
        await storage.deleteAccount(chanelExists.id);
      }

      // Create Chanel account
      const account = await storage.createAccount({
        name: "Chanel",
        industry: "Luxury Retail & Fashion",
        sector: "Haute Couture & Accessories",
        tier: "enterprise",
        companyLogoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Chanel_logo.svg/200px-Chanel_logo.svg.png",
        website: "https://www.chanel.com",
        strategyNotes: "Global expansion into emerging markets while maintaining brand exclusivity. Focus on digital transformation, next-gen leadership pipeline, and sustainable luxury practices.",
        okrSummary: "O1: Accelerate leadership succession globally. O2: Reduce time-to-productivity for new boutique directors. O3: Strengthen cultural alignment across 400+ boutiques.",
        fiscalYearStart: "January",
        accountOwner: "Sarah Mitchell",
        clientSponsor: "Philippe Lefort, CHRO",
        annualContractValue: "$4.2M",
        primaryContactName: "Isabelle Renaud",
        primaryContactEmail: "i.renaud@chanel.com",
        healthScore: 85,
        totalValuePromised: 12500000,
        totalValueRealized: 4800000,
        status: "active",
      });

      // Create Chanel project
      const project = await storage.createProject({
        accountId: account.id,
        name: "Chanel Leadership Transformation",
        companyName: "Chanel S.A.",
        sector: "Luxury Retail & Fashion",
        phase: "alignment",
        status: "active",
        projectGoal: "Transform Chanel's leadership pipeline and talent development to support global expansion while preserving the maison's unique heritage and culture.",
        stakeholderName: "Philippe Lefort",
        stakeholderRole: "Chief Human Resources Officer",
        stakeholderEmail: "p.lefort@chanel.com",
        idealCustomerProfile: "Global luxury brand facing succession challenges, committed to cultural preservation, budget for transformation initiatives",
        aiResearchStatus: "completed",
        discoveryFinalized: true,
      });

      // Create job themes (which contain discovery insights)
      const jobThemesData = [
        {
          jobName: "Leadership Succession & Pipeline",
          capabilityName: "Succession Planning & Leadership Assessment",
          aggregationSummary: "Only 23% of boutique director roles have identified successors. With 35% of current directors retiring within 5 years, Chanel faces a significant leadership vacuum that threatens boutique performance and brand consistency.",
          solutionArea: "ASSESS" as const,
          evidenceCount: 5,
          compositeScore: 92,
          priorityRank: 1,
        },
        {
          jobName: "New Director Productivity",
          capabilityName: "Leadership Development & Onboarding",
          aggregationSummary: "New boutique directors take 14-18 months to reach full productivity vs. industry average of 9 months. This extended ramp-up period costs an estimated €2.3M annually in lost revenue opportunity.",
          solutionArea: "DEVELOP" as const,
          evidenceCount: 4,
          compositeScore: 88,
          priorityRank: 2,
        },
        {
          jobName: "Cultural Alignment Across Regions",
          capabilityName: "Culture Transformation & Engagement",
          aggregationSummary: "Employee engagement surveys reveal 22-point variance in 'brand culture alignment' scores between European and Asia-Pacific boutiques. APAC region shows declining scores over past 3 years.",
          solutionArea: "TRANSFORM" as const,
          evidenceCount: 3,
          compositeScore: 85,
          priorityRank: 3,
        },
        {
          jobName: "High-Potential Talent Retention",
          capabilityName: "Talent Management & Development",
          aggregationSummary: "Voluntary turnover among high-potential talent (top 15%) is 18% vs. 8% industry benchmark for luxury retail. Exit interviews cite limited career visibility and development opportunities.",
          solutionArea: "DEVELOP" as const,
          evidenceCount: 4,
          compositeScore: 90,
          priorityRank: 4,
        },
      ];

      for (const theme of jobThemesData) {
        await storage.createJobTheme({
          projectId: project.id,
          ...theme,
        });
      }

      // Create KPI commitments
      const commitments = [
        {
          commitmentTitle: "Leadership Bench Strength Index",
          commitmentDescription: "Percentage of critical leadership roles with at least one ready-now successor identified and validated",
          metricUnit: "%",
          baselineValue: "23",
          targetValue: "75",
          targetDate: new Date("2025-12-31"),
          estimatedAnnualValue: 3200000,
          valuePillar: "derisk" as const,
          solutionPattern: "leadership_development" as const,
          status: "client_confirmed" as const,
          healthStatus: "on_track" as const,
        },
        {
          commitmentTitle: "Time-to-Productivity (New Directors)",
          commitmentDescription: "Months required for new boutique directors to achieve 90% of target boutique performance metrics",
          metricUnit: "months",
          baselineValue: "16",
          targetValue: "9",
          targetDate: new Date("2025-12-31"),
          estimatedAnnualValue: 2300000,
          valuePillar: "optimise" as const,
          solutionPattern: "leadership_development" as const,
          status: "client_confirmed" as const,
          healthStatus: "at_risk" as const,
        },
        {
          commitmentTitle: "High-Potential Retention Rate",
          commitmentDescription: "Annual retention rate of employees identified as high-potential (top 15% performers)",
          metricUnit: "%",
          baselineValue: "82",
          targetValue: "92",
          targetDate: new Date("2025-12-31"),
          estimatedAnnualValue: 2800000,
          valuePillar: "derisk" as const,
          solutionPattern: "talent_acquisition" as const,
          status: "client_confirmed" as const,
          healthStatus: "needs_data" as const,
        },
      ];

      const createdCommitments = [];
      for (const commitment of commitments) {
        const created = await storage.createKpiCommitment({
          projectId: project.id,
          ...commitment,
          provenance: { source: "ai_generated", generatedAt: new Date().toISOString() },
        });
        createdCommitments.push(created);
      }

      // Create handoff packet 1 - Accepted (shows completed handoff)
      await storage.createHandoffPacket({
        projectId: project.id,
        packetName: "Phase 1: Leadership & Director Development",
        commitmentIds: [createdCommitments[0].id, createdCommitments[1].id],
        generatedByRole: "sales" as const,
        generatedByName: "Sarah Mitchell",
        executiveSummary: "Phase 1: Leadership succession and director development. Total value €5.5M covering succession pipeline and onboarding acceleration. Client sponsor Philippe Lefort (CHRO) has approved targets.",
        totalCommittedValue: 5500000,
        acceptanceState: "accepted" as const,
        acceptedAt: new Date(),
        csmOwnerName: "Marie Dubois",
        acceptanceNotes: "Confirmed alignment with Chanel leadership. Measurement framework established with HR Analytics. Monthly progress reviews scheduled.",
      });

      // Create handoff packet 2 - Pending (for demo of acceptance workflow)
      await storage.createHandoffPacket({
        projectId: project.id,
        packetName: "Phase 2: High-Potential Retention Initiative",
        commitmentIds: [createdCommitments[2].id],
        generatedByRole: "sales" as const,
        generatedByName: "Sarah Mitchell",
        executiveSummary: "Phase 2: High-Potential Talent Retention Initiative. Annual value €2.8M targeting 92% retention of top performers. Requires CSM review and acceptance before delivery kickoff.",
        totalCommittedValue: 2800000,
        acceptanceState: "pending" as const,
      });

      res.json({ 
        success: true, 
        message: "Chanel demo data seeded successfully",
        accountId: account.id,
        projectId: project.id
      });
    } catch (error: any) {
      console.error("Error seeding Chanel demo data:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/demo/chanel-status - Check if Chanel demo exists
  app.get("/api/demo/chanel-status", async (req, res) => {
    try {
      const accounts = await storage.getAccounts();
      const chanel = accounts.find(a => a.name === "Chanel" && a.sector === "Haute Couture & Accessories");
      
      if (chanel) {
        const allProjects = await storage.getProjects();
        const chanelProjects = allProjects.filter(p => p.accountId === chanel.id);
        res.json({ 
          exists: true, 
          accountId: chanel.id,
          projectId: chanelProjects[0]?.id || null
        });
      } else {
        res.json({ exists: false });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // COMPETITIVE INTELLIGENCE ROUTES
  // ============================================================================

  // GET /api/projects/:projectId/competitive-intelligence - Get all competitive intelligence for a project
  app.get("/api/projects/:projectId/competitive-intelligence", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }
      
      const [competitiveIntel, competitiveSummary] = await Promise.all([
        storage.getCompetitiveIntelligence(projectId),
        storage.getCompetitiveSummary(projectId)
      ]);
      
      res.json({ 
        positioning: competitiveIntel,
        summary: competitiveSummary || null
      });
    } catch (error: any) {
      console.error("Error fetching competitive intelligence:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/projects/:projectId/competitive-intelligence/generate - Generate AI-powered competitive intelligence
  app.post("/api/projects/:projectId/competitive-intelligence/generate", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }
      
      // Validate request body
      const requestSchema = z.object({
        solutionAreas: z.array(z.enum(["ASSESS", "DEVELOP", "TRANSFORM", "REWARD", "COMMERCIAL", "ANALYTICS"])).min(1),
        regenerate: z.boolean().optional()
      });
      
      const parseResult = requestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid request body", details: parseResult.error });
      }
      
      const { solutionAreas, regenerate } = parseResult.data;
      
      // Get project data for context
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Check if we already have intelligence and regenerate is not requested
      const existingSummary = await storage.getCompetitiveSummary(projectId);
      if (existingSummary && !regenerate) {
        return res.status(200).json({ 
          message: "Competitive intelligence already exists. Set regenerate: true to refresh.",
          summary: existingSummary
        });
      }
      
      // Gather context from project
      const [dataPoints, discoverySynthesis] = await Promise.all([
        storage.getCompanyDataPoints(projectId),
        Promise.resolve(project.discoverySynthesis) // Already on the project
      ]);
      
      // Generate competitive intelligence using AI
      const result = await generateCompetitiveIntelligence({
        companyName: project.companyName,
        industry: project.sector || undefined,
        discoveryTheme: project.discoveryTheme || undefined,
        discoverySynthesis: discoverySynthesis || undefined,
        dataPoints: dataPoints
          .filter(dp => dp.solutionArea && dp.kornFerryPillar)
          .map(dp => ({
            label: dp.label,
            value: dp.value,
            solutionArea: dp.solutionArea!,
            kornFerryPillar: dp.kornFerryPillar!
          })),
        solutionAreas
      });
      
      // Clear existing intelligence if regenerating
      if (regenerate) {
        await storage.deleteAllCompetitiveIntelligenceForProject(projectId);
        await storage.deleteCompetitiveSummary(projectId);
      }
      
      // Save the summary
      await storage.upsertCompetitiveSummary({
        projectId,
        executiveSummary: result.executiveSummary,
        primaryCompetitors: result.primaryCompetitors,
        competitorLikelihood: result.competitorLikelihood,
        kornFerryDifferentiators: result.kornFerryDifferentiators,
        keyWinThemes: result.keyWinThemes,
        avoidThemes: result.avoidThemes,
        industryContext: result.industryContext
      });
      
      // Save individual competitor positioning
      for (const pos of result.positioning) {
        await storage.createCompetitiveIntelligence({
          projectId,
          solutionArea: pos.solutionArea as "ASSESS" | "DEVELOP" | "TRANSFORM" | "REWARD" | "COMMERCIAL" | "ANALYTICS",
          competitorId: pos.competitorId,
          competitorName: pos.competitorName,
          contextualPositioning: pos.contextualPositioning,
          clientSpecificAdvantages: pos.clientSpecificAdvantages,
          conversationStarters: pos.conversationStarters,
          battleCardScenario: pos.battleCardScenario,
          battleCardResponse: pos.battleCardResponse,
          winTheme: pos.winTheme
        });
      }
      
      res.json({
        success: true,
        message: `Generated competitive intelligence for ${result.positioning.length} competitors`,
        summary: result
      });
    } catch (error: any) {
      console.error("Error generating competitive intelligence:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/projects/:projectId/competitive-intelligence/by-solution/:solutionArea - Get competitive intel by solution area
  app.get("/api/projects/:projectId/competitive-intelligence/by-solution/:solutionArea", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const solutionArea = req.params.solutionArea;
      
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }
      
      const validAreas = ["ASSESS", "DEVELOP", "TRANSFORM", "REWARD", "COMMERCIAL", "ANALYTICS"];
      if (!validAreas.includes(solutionArea)) {
        return res.status(400).json({ error: `Invalid solution area. Must be one of: ${validAreas.join(", ")}` });
      }
      
      const positioning = await storage.getCompetitiveIntelligenceBySolutionArea(projectId, solutionArea);
      res.json({ positioning });
    } catch (error: any) {
      console.error("Error fetching competitive intelligence by solution area:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/projects/:projectId/competitive-intelligence - Clear all competitive intelligence for a project
  app.delete("/api/projects/:projectId/competitive-intelligence", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }
      
      await Promise.all([
        storage.deleteAllCompetitiveIntelligenceForProject(projectId),
        storage.deleteCompetitiveSummary(projectId)
      ]);
      
      res.json({ success: true, message: "Competitive intelligence cleared" });
    } catch (error: any) {
      console.error("Error clearing competitive intelligence:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // AI COMPANION CHAT ENDPOINTS
  // ============================================================================

  // POST /api/companion/sessions - Create a new companion session
  app.post("/api/companion/sessions", async (req, res) => {
    try {
      const requestSchema = z.object({
        accountId: z.number().optional(),
        projectId: z.number().optional(),
        userId: z.string().optional(),
        title: z.string().optional(),
        contextType: z.enum(["global", "account", "initiative", "discovery", "alignment", "realisation", "canvas"]).optional()
      });
      
      const parseResult = requestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid request body", details: parseResult.error });
      }
      
      const { accountId, projectId, userId, title, contextType } = parseResult.data;
      const sessionId = crypto.randomUUID();
      
      const session = await storage.createAiSession({
        sessionId,
        userId: userId || null,
        accountId: accountId || null,
        projectId: projectId || null,
        contextType: contextType || "global",
        title: title || null,
        isActive: true
      });
      
      res.status(201).json(session);
    } catch (error: any) {
      console.error("Error creating companion session:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/companion/sessions/:sessionId - Get a session with messages
  app.get("/api/companion/sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      const [session, messages] = await Promise.all([
        storage.getAiSession(sessionId),
        storage.getAiMessages(sessionId)
      ]);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      res.json({ session, messages });
    } catch (error: any) {
      console.error("Error fetching companion session:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/companion/sessions - Get sessions by context
  app.get("/api/companion/sessions", async (req, res) => {
    try {
      const accountId = req.query.accountId ? parseInt(req.query.accountId as string) : undefined;
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      
      const sessions = await storage.getAiSessionsByContext(accountId, projectId);
      res.json(sessions);
    } catch (error: any) {
      console.error("Error fetching companion sessions:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/companion/sessions/:sessionId - Delete a session
  app.delete("/api/companion/sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      await storage.deleteAiSession(sessionId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting companion session:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /api/companion/sessions/:sessionId/state - Sync session presence state
  app.patch("/api/companion/sessions/:sessionId/state", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      const stateSchema = z.object({
        currentRoute: z.string().optional(),
        previousRoutes: z.array(z.string()).optional(),
        activeEntities: z.array(z.object({
          type: z.enum(["account", "project", "jobTheme", "kpi", "successStory"]),
          id: z.number(),
          name: z.string().optional(),
        })).optional(),
        formContext: z.object({
          formId: z.string(),
          entityType: z.string(),
          entityId: z.number().optional(),
          isDirty: z.boolean(),
          fieldsFocused: z.array(z.string()).optional(),
        }).optional().nullable(),
        lastSyncAt: z.string().optional(),
      });
      
      const parseResult = stateSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid state data", details: parseResult.error });
      }
      
      const session = await storage.getAiSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      const existingSnapshot = (session.contextSnapshot as Record<string, any>) || {};
      const updatedSnapshot = {
        ...existingSnapshot,
        ...parseResult.data,
        lastSyncAt: new Date().toISOString(),
      };
      
      const updated = await storage.updateAiSession(sessionId, {
        contextSnapshot: updatedSnapshot,
      });
      
      res.json({ success: true, state: updatedSnapshot });
    } catch (error: any) {
      console.error("Error syncing companion session state:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/companion/chat - Send a message and get AI response
  app.post("/api/companion/chat", async (req, res) => {
    const { 
      executeCompanionTool, 
      companionToolDefinitions 
    } = await import("./companion-tools");
    
    try {
      const requestSchema = z.object({
        sessionId: z.string(),
        message: z.string().min(1),
        context: z.object({
          accountId: z.number().optional(),
          projectId: z.number().optional(),
          currentPage: z.string().optional(),
          canvasMode: z.boolean().optional()
        }).optional()
      });
      
      const parseResult = requestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid request body", details: parseResult.error });
      }
      
      const { sessionId, message, context } = parseResult.data;
      
      // Verify session exists
      const session = await storage.getAiSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      // Get message history for context
      const history = await storage.getAiMessages(sessionId);
      
      // Fetch project and account context for richer prompts
      let projectContext: any = null;
      let accountContext: any = null;
      if (context?.projectId) {
        projectContext = await storage.getProject(context.projectId);
        if (projectContext?.accountId) {
          accountContext = await storage.getAccount(projectContext.accountId);
        }
      } else if (context?.accountId) {
        accountContext = await storage.getAccount(context.accountId);
      }
      
      // Save user message
      await storage.createAiMessage({
        sessionId,
        role: "user",
        content: message
      });
      
      // Build system prompt with context
      const isCanvasMode = context?.canvasMode === true;
      
      let systemPrompt = isCanvasMode 
        ? `You are a proactive AI companion for the Korn Ferry Value Lifecycle Platform. You are operating in "Canvas Mode" - a conversational interface where the user interacts with you as their primary way to use the platform.

YOUR ROLE AS A COACH AND ASSISTANT:
- Be proactive and guide the user through workflows naturally
- Anticipate what they might need next and offer suggestions
- Ask clarifying questions to understand their goals before acting
- Provide coaching and recommendations based on best practices
- Execute actions on their behalf when they confirm

CAPABILITIES:
- Create and manage accounts and initiatives
- Run AI-powered discovery research
- Track and update KPIs
- Prepare meeting bundles and talking points
- Navigate to different parts of the platform
- Provide strategic recommendations

WORKFLOW GUIDANCE:
- When the user mentions a company name, offer to create an account and initiative for them
- Always use "createInitiativeWithDiscovery" for new initiatives to pre-populate insights
- After creating something, proactively suggest next steps
- When discussing KPIs, offer to show current status or recommend improvements
- For meeting prep, ask about the meeting type and provide tailored talking points

CONVERSATION STYLE:
- Be warm and professional, like a helpful colleague
- Keep responses focused but thorough
- Use bullet points for lists and recommendations
- When showing data, summarize the key insights
- Always end with a clear next step or question

Be the user's trusted partner in managing their client engagements.`
        : `You are a helpful AI assistant for the Korn Ferry Value Lifecycle Platform. You help users:
- Create new accounts and initiatives/projects
- Get summaries of accounts and initiatives
- Prepare for client meetings
- Track and update KPIs
- Navigate the platform
- Get recommendations on next actions

You have access to tools to read and write data. When the user asks to CREATE something (accounts, initiatives, KPIs, notes), USE THE APPROPRIATE TOOL - do not just give instructions. For write operations, the tool will automatically ask for confirmation before executing.

IMPORTANT WORKFLOW GUIDANCE:
- After a user creates a new account, ALWAYS proactively offer to create an initiative for that account. Say something like "Would you like me to create an initiative for [account name]? I can run AI-powered discovery research to automatically populate insights about the company."
- When creating initiatives, prefer using the "createInitiativeWithDiscovery" tool which creates the initiative AND runs AI research to pre-populate discovery insights. This saves the user time and gives them a head start on the engagement.
- If the user just says "create an initiative" without specifying whether they want AI discovery, default to using createInitiativeWithDiscovery since it provides more value.
- ALWAYS ask for or use the discovery theme when creating initiatives. The discovery theme focuses all AI research and insights on the specific area (e.g., "leadership development", "talent acquisition", "succession planning").

Be concise but helpful. Use the user's context (current account, project, page) to provide relevant information.`;

      // Add rich context about current account and project
      let contextDetails: string[] = [];
      if (accountContext) {
        contextDetails.push(`Account: "${accountContext.name}"${accountContext.industry ? ` (${accountContext.industry})` : ''}`);
      }
      if (projectContext) {
        contextDetails.push(`Initiative: "${projectContext.name}"`);
        if (projectContext.discoveryTheme) {
          contextDetails.push(`Discovery Theme: "${projectContext.discoveryTheme}" - ALL suggestions, research, and insights should focus on this theme`);
        }
        if (projectContext.currentPhase) {
          contextDetails.push(`Current Phase: ${projectContext.currentPhase}`);
        }
      }
      if (context?.currentPage) {
        contextDetails.push(`Current Page: ${context.currentPage}`);
      }
      
      if (contextDetails.length > 0) {
        systemPrompt += `\n\nCURRENT CONTEXT:\n${contextDetails.map(d => `- ${d}`).join('\n')}`;
      }

      // Build messages for OpenAI
      const openAiMessages: any[] = [
        { role: "system", content: systemPrompt }
      ];
      
      // Add history (last 20 messages for context window)
      const recentHistory = history.slice(-20);
      for (const msg of recentHistory) {
        if (msg.role === "user" || msg.role === "assistant") {
          openAiMessages.push({ role: msg.role, content: msg.content });
        }
      }
      
      // Add current message
      openAiMessages.push({ role: "user", content: message });

      // Convert tool definitions to OpenAI format
      const tools = companionToolDefinitions.map(tool => ({
        type: "function" as const,
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters
        }
      }));

      // Call OpenAI with function calling
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: openAiMessages,
        tools,
        tool_choice: "auto"
      });

      const assistantMessage = response.choices[0].message;
      let responseContent = assistantMessage.content || "";
      let toolResults: any[] = [];
      let pendingConfirmation: any = null;

      // Handle tool calls
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        for (const toolCall of assistantMessage.tool_calls) {
          // Type guard for function tool calls
          if (!('function' in toolCall)) continue;
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments);
          
          const toolResult = await executeCompanionTool(
            toolName,
            toolArgs,
            {
              accountId: context?.accountId,
              projectId: context?.projectId,
              currentPage: context?.currentPage
            }
          );
          
          toolResults.push({
            toolName,
            arguments: toolArgs,
            result: toolResult
          });
          
          // If tool requires confirmation, save for frontend handling
          if (toolResult.requiresConfirmation) {
            pendingConfirmation = {
              toolName,
              arguments: toolArgs,
              confirmationMessage: toolResult.confirmationMessage,
              action: toolResult.data?.action,
              payload: toolResult.data?.payload || toolResult.data
            };
          }
        }

        // If tools were called, get a follow-up response with results
        if (toolResults.length > 0 && !pendingConfirmation) {
          const toolResultsForAI = toolResults.map(tr => ({
            role: "tool" as const,
            content: JSON.stringify(tr.result),
            tool_call_id: assistantMessage.tool_calls!.find(tc => 'function' in tc && tc.function.name === tr.toolName)?.id || ""
          }));

          const followUpResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              ...openAiMessages,
              assistantMessage,
              ...toolResultsForAI
            ]
          });
          
          responseContent = followUpResponse.choices[0].message.content || "";
        }
      }

      // Save assistant response
      await storage.createAiMessage({
        sessionId,
        role: "assistant",
        content: responseContent,
        toolCalls: toolResults.length > 0 ? toolResults : null
      });

      // Update session timestamp
      await storage.updateAiSession(sessionId, {});

      // Build context update for canvas mode based on tool results
      let contextUpdate: any = null;
      let navigationCommand: any = null;
      
      if (toolResults.length > 0) {
        for (const tr of toolResults) {
          // Extract navigation command if tool returned one
          if (tr.result.navigationCommand) {
            navigationCommand = tr.result.navigationCommand;
          }
          
          // Build context updates for canvas mode
          if (isCanvasMode && tr.result.success && tr.result.data) {
            // Determine context update type based on tool used
            if (tr.toolName === "getAccountSummary" || tr.toolName === "createAccount") {
              contextUpdate = { 
                type: "account", 
                data: tr.result.data,
                title: tr.result.data?.name || "Account"
              };
            } else if (tr.toolName === "getInitiativeSummary" || tr.toolName === "createInitiative" || tr.toolName === "createInitiativeWithDiscovery") {
              contextUpdate = { 
                type: "initiative", 
                data: tr.result.data,
                title: tr.result.data?.name || "Initiative"
              };
            } else if (tr.toolName === "listKPIs") {
              contextUpdate = { 
                type: "kpis", 
                data: tr.result.data,
                title: "KPIs"
              };
            } else if (tr.toolName === "prepareMeetingBundle") {
              contextUpdate = { 
                type: "meeting", 
                data: tr.result.data,
                title: "Meeting Prep"
              };
            } else if (tr.toolName === "listAccounts") {
              contextUpdate = { 
                type: "accounts", 
                data: tr.result.data,
                title: "All Accounts"
              };
            } else if (tr.toolName === "listInitiatives") {
              contextUpdate = { 
                type: "initiatives", 
                data: tr.result.data,
                title: "Initiatives"
              };
            }
          }
        }
      }

      res.json({
        response: responseContent,
        toolResults: toolResults.length > 0 ? toolResults : undefined,
        pendingConfirmation,
        contextUpdate,
        navigationCommand
      });
    } catch (error: any) {
      console.error("Error in companion chat:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/companion/confirm - Confirm and execute a pending action
  app.post("/api/companion/confirm", async (req, res) => {
    const { confirmAndExecuteAction } = await import("./companion-tools");
    
    try {
      const requestSchema = z.object({
        sessionId: z.string(),
        action: z.string(),
        payload: z.any(),
        confirmed: z.boolean()
      });
      
      const parseResult = requestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid request body", details: parseResult.error });
      }
      
      const { sessionId, action, payload, confirmed } = parseResult.data;
      
      // Session ownership verification - ensure session exists and is active
      const session = await storage.getAiSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      if (!session.isActive) {
        return res.status(403).json({ error: "Session is no longer active" });
      }
      
      if (!confirmed) {
        // User declined - save message and return
        await storage.createAiMessage({
          sessionId,
          role: "assistant",
          content: "Action cancelled. Let me know if you'd like to do something else."
        });
        return res.json({ success: true, cancelled: true });
      }
      
      // Execute the action
      const result = await confirmAndExecuteAction(action, payload);
      
      // Save result as message
      const getSuccessMessage = () => {
        if (result.data?.message) return `Done! ${result.data.message}`;
        switch (action) {
          case 'createAccount': return 'Done! Account created successfully.';
          case 'createInitiative': return 'Done! Initiative created successfully.';
          case 'createKPI': return 'Done! KPI created successfully.';
          case 'updateKPI': return 'Done! KPI updated successfully.';
          default: return 'Done! Action completed successfully.';
        }
      };
      await storage.createAiMessage({
        sessionId,
        role: "assistant",
        content: result.success 
          ? getSuccessMessage()
          : `Sorry, there was an error: ${result.error}`,
        toolCalls: [{ toolName: action, arguments: payload, result }]
      });
      
      res.json(result);
    } catch (error: any) {
      console.error("Error confirming companion action:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/companion/tools - Get available tool definitions
  app.get("/api/companion/tools", async (req, res) => {
    const { companionToolDefinitions } = await import("./companion-tools");
    res.json(companionToolDefinitions);
  });

  // POST /api/companion/quick-action - Execute a quick action without full chat
  // SECURITY: Only read-only tools are allowed via quick-action endpoint
  app.post("/api/companion/quick-action", async (req, res) => {
    const { executeCompanionTool, companionToolDefinitions, isReadOnlyTool } = await import("./companion-tools");
    
    try {
      const requestSchema = z.object({
        toolName: z.string(),
        args: z.record(z.any()),
        context: z.object({
          accountId: z.number().optional(),
          projectId: z.number().optional(),
          currentPage: z.string().optional()
        }).optional()
      });
      
      const parseResult = requestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid request body", details: parseResult.error });
      }
      
      const { toolName, args, context } = parseResult.data;
      
      // Security: Only allow read-only tools via quick-action (no session required)
      const toolDef = companionToolDefinitions.find(t => t.name === toolName);
      if (!toolDef) {
        return res.status(400).json({ error: "Unknown tool" });
      }
      if (!isReadOnlyTool(toolName)) {
        return res.status(403).json({ error: "Write operations require a chat session" });
      }
      
      const result = await executeCompanionTool(
        toolName,
        args,
        {
          accountId: context?.accountId,
          projectId: context?.projectId,
          currentPage: context?.currentPage
        }
      );
      
      res.json(result);
    } catch (error: any) {
      console.error("Error executing quick action:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/companion/voice/transcribe - Speech-to-text using OpenAI Whisper
  app.post("/api/companion/voice/transcribe", async (req, res) => {
    try {
      const contentType = req.headers['content-type'] || '';
      
      if (!contentType.includes('audio/')) {
        return res.status(400).json({ error: "Expected audio content type" });
      }
      
      const chunks: Buffer[] = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', async () => {
        try {
          const audioBuffer = Buffer.concat(chunks);
          
          if (audioBuffer.length === 0) {
            return res.status(400).json({ error: "No audio data received" });
          }
          
          const audioFile = new File([audioBuffer], 'audio.webm', { type: contentType });
          
          const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-1",
            language: "en"
          });
          
          res.json({ 
            text: transcription.text,
            success: true 
          });
        } catch (error: any) {
          console.error("Whisper transcription error:", error);
          res.status(500).json({ error: error.message });
        }
      });
    } catch (error: any) {
      console.error("Error in voice transcribe:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/companion/voice/speak - Text-to-speech using OpenAI TTS
  app.post("/api/companion/voice/speak", async (req, res) => {
    try {
      const requestSchema = z.object({
        text: z.string().min(1).max(4096),
        voice: z.enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"]).optional().default("nova")
      });
      
      const parseResult = requestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid request body", details: parseResult.error });
      }
      
      const { text, voice } = parseResult.data;
      
      const mp3Response = await openai.audio.speech.create({
        model: "tts-1",
        voice: voice,
        input: text
      });
      
      const arrayBuffer = await mp3Response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString()
      });
      res.send(buffer);
    } catch (error: any) {
      console.error("Error in voice speak:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // INTERACTION ARTIFACTS - Pre/Post Meeting Context & Documents
  // ============================================================================

  // GET /api/projects/:id/interaction-artifacts - Get all artifacts for a project
  app.get("/api/projects/:id/interaction-artifacts", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const { context } = req.query;
      
      let artifacts;
      if (context && (context === 'pre_meeting' || context === 'post_meeting')) {
        artifacts = await storage.getInteractionArtifactsByContext(projectId, context);
      } else {
        artifacts = await storage.getInteractionArtifacts(projectId);
      }
      res.json(artifacts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/interaction-artifacts/:id - Get a single artifact
  app.get("/api/interaction-artifacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const artifact = await storage.getInteractionArtifact(id);
      if (!artifact) {
        return res.status(404).json({ error: "Artifact not found" });
      }
      res.json(artifact);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Zod schemas for artifact validation
  const createArtifactSchema = z.object({
    artifactType: z.enum(["document", "transcript", "notes", "voice_memo"]),
    meetingContext: z.enum(["pre_meeting", "post_meeting"]),
    title: z.string().max(500).optional(),
    freeformNotes: z.string().max(50000).optional(),
    meetingType: z.string().max(100).optional(),
    meetingDate: z.string().optional(),
    attendees: z.array(z.string()).optional(),
    aiProcessingStatus: z.enum(["pending", "processing", "completed", "failed"]).optional()
  });

  const uploadArtifactSchema = z.object({
    fileName: z.string().min(1).max(255),
    fileContent: z.string().min(1).max(15000000), // ~10MB base64 limit
    mimeType: z.enum([
      "application/pdf",
      "text/plain",
      "text/csv",
      "application/json",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]),
    fileSize: z.number().max(10485760).optional(), // 10MB max
    meetingContext: z.enum(["pre_meeting", "post_meeting"]),
    title: z.string().max(500).optional(),
    meetingType: z.string().max(100).optional(),
    meetingDate: z.string().optional(),
    freeformNotes: z.string().max(10000).optional()
  });

  // POST /api/projects/:id/interaction-artifacts - Create a new artifact (notes only)
  app.post("/api/projects/:id/interaction-artifacts", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      const parseResult = createArtifactSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid request body", details: parseResult.error.issues });
      }
      
      const artifact = await storage.createInteractionArtifact({
        ...parseResult.data,
        projectId,
        meetingDate: parseResult.data.meetingDate ? new Date(parseResult.data.meetingDate) : null
      });
      res.json(artifact);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/projects/:id/interaction-artifacts/upload - Upload a document
  app.post("/api/projects/:id/interaction-artifacts/upload", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      const parseResult = uploadArtifactSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid upload data", details: parseResult.error.issues });
      }
      
      const { fileName, fileContent, mimeType, fileSize, meetingContext, title, meetingType, meetingDate, freeformNotes } = parseResult.data;
      
      // Generate unique key for object storage
      const timestamp = Date.now();
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const objectStorageKey = `.private/artifacts/${projectId}/${timestamp}_${sanitizedName}`;
      
      // Store file in object storage
      const { Client } = await import("@replit/object-storage");
      const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
      if (!bucketId) {
        throw new Error("Object storage is not configured. Please set up object storage first.");
      }
      const client = new Client({ bucketId });
      const fileBuffer = Buffer.from(fileContent, 'base64');
      await client.uploadFromBytes(objectStorageKey, fileBuffer);
      
      // Extract text from documents for AI processing
      let extractedText = "";
      if (mimeType === 'text/plain' || mimeType === 'text/csv' || mimeType === 'application/json') {
        extractedText = fileBuffer.toString('utf-8');
      } else if (mimeType === 'application/pdf') {
        // Use pdf-parse for PDF extraction
        try {
          const pdfParse = (await import('pdf-parse')).default || (await import('pdf-parse'));
          const pdfData = await pdfParse(fileBuffer);
          extractedText = pdfData.text;
        } catch (pdfError) {
          console.error("PDF parsing error:", pdfError);
        }
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                 mimeType === 'application/msword') {
        // Use mammoth for Word document extraction
        try {
          const mammoth = await import('mammoth');
          const result = await mammoth.extractRawText({ buffer: fileBuffer });
          extractedText = result.value;
        } catch (docError) {
          console.error("Word document parsing error:", docError);
        }
      }
      
      // Create artifact record
      const artifact = await storage.createInteractionArtifact({
        projectId,
        artifactType: 'document',
        meetingContext,
        fileName,
        fileSize: fileSize || fileBuffer.length,
        mimeType,
        objectStorageKey,
        title: title || fileName,
        freeformNotes,
        extractedText: extractedText ? extractedText.substring(0, 50000) : null, // Limit to 50k chars
        meetingDate: meetingDate ? new Date(meetingDate) : null,
        meetingType,
        aiProcessingStatus: extractedText ? 'completed' : 'pending'
      });
      
      res.json(artifact);
    } catch (error: any) {
      console.error("Error uploading artifact:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /api/interaction-artifacts/:id - Update an artifact
  app.patch("/api/interaction-artifacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const artifact = await storage.updateInteractionArtifact(id, req.body);
      if (!artifact) {
        return res.status(404).json({ error: "Artifact not found" });
      }
      res.json(artifact);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/interaction-artifacts/:id - Delete an artifact
  app.delete("/api/interaction-artifacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const artifact = await storage.getInteractionArtifact(id);
      
      if (!artifact) {
        return res.status(404).json({ error: "Artifact not found" });
      }
      
      // Delete from object storage if file exists
      if (artifact.objectStorageKey) {
        try {
          const { Client } = await import("@replit/object-storage");
          const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
          if (bucketId) {
            const client = new Client({ bucketId });
            await client.delete(artifact.objectStorageKey);
          }
        } catch (storageError) {
          console.error("Error deleting from object storage:", storageError);
        }
      }
      
      await storage.deleteInteractionArtifact(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/interaction-artifacts/:id/process - Trigger AI processing on artifact
  app.post("/api/interaction-artifacts/:id/process", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const artifact = await storage.getInteractionArtifact(id);
      
      if (!artifact) {
        return res.status(404).json({ error: "Artifact not found" });
      }
      
      // Get project for context
      const project = await storage.getProject(artifact.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Update status to processing
      await storage.updateInteractionArtifact(id, { aiProcessingStatus: 'processing' });
      
      // Extract insights from content - try extractedText first, then fetch from object storage
      let contentToAnalyze = artifact.extractedText || artifact.freeformNotes;
      
      // If no extracted text but we have a file in object storage, fetch and extract it
      if (!contentToAnalyze && artifact.objectStorageKey) {
        try {
          console.log("[Artifact Process] Fetching file from object storage:", artifact.objectStorageKey);
          const { Client } = await import("@replit/object-storage");
          const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
          if (bucketId) {
            const client = new Client({ bucketId });
            const fileBuffer = await client.downloadAsBytes(artifact.objectStorageKey);
            
            if (fileBuffer.ok && fileBuffer.value) {
              const uint8Array = fileBuffer.value;
              const buffer = Buffer.from(uint8Array.buffer, uint8Array.byteOffset, uint8Array.byteLength);
              console.log("[Artifact Process] File downloaded, size:", buffer.length, "bytes, mimeType:", artifact.mimeType);
              
              // Extract text based on mime type
              if (artifact.mimeType === 'text/plain' || artifact.mimeType === 'text/csv' || artifact.mimeType === 'application/json') {
                contentToAnalyze = buffer.toString('utf-8');
              } else if (artifact.mimeType === 'application/pdf') {
                try {
                  const pdfParse = (await import('pdf-parse')).default || (await import('pdf-parse'));
                  const pdfData = await pdfParse(buffer);
                  contentToAnalyze = pdfData.text;
                  console.log("[Artifact Process] PDF text extracted, length:", contentToAnalyze?.length || 0);
                } catch (pdfError) {
                  console.error("[Artifact Process] PDF parsing error:", pdfError);
                }
              } else if (artifact.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                         artifact.mimeType === 'application/msword') {
                try {
                  const mammoth = await import('mammoth');
                  const result = await mammoth.extractRawText({ buffer: buffer });
                  contentToAnalyze = result.value;
                  console.log("[Artifact Process] Word document text extracted, length:", contentToAnalyze?.length || 0);
                } catch (docError) {
                  console.error("[Artifact Process] Word document parsing error:", docError);
                }
              }
              
              // Save extracted text for future use
              if (contentToAnalyze) {
                await storage.updateInteractionArtifact(id, { 
                  extractedText: contentToAnalyze.substring(0, 50000) 
                });
              }
            } else {
              console.error("[Artifact Process] Failed to download file:", fileBuffer);
            }
          }
        } catch (storageError) {
          console.error("[Artifact Process] Error fetching from object storage:", storageError);
        }
      }
      
      if (!contentToAnalyze) {
        await storage.updateInteractionArtifact(id, { aiProcessingStatus: 'failed' });
        return res.status(400).json({ error: "No content to process. Please ensure the document contains readable text." });
      }
      
      const contextType = artifact.meetingContext === 'pre_meeting' ? 'preparation' : 'debrief';
      
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a senior Korn Ferry consultant analyzing ${contextType} materials for a client engagement with ${project.companyName} in the ${project.sector} sector.`
          },
          {
            role: "user",
            content: `Analyze this ${artifact.meetingType || 'meeting'} ${contextType} content and extract key insights:

${contentToAnalyze.substring(0, 10000)}

Provide a JSON response with:
{
  "summary": "A 2-3 sentence summary of the key points",
  "insights": ["List of 3-5 key insights or observations"],
  "actionItems": ["List of action items or follow-ups identified"],
  "stakeholderMentions": ["Names or roles of stakeholders mentioned"],
  "risks": ["Any risks or concerns identified"],
  "opportunities": ["Any opportunities or positive signals"]
}`
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const aiInsights = JSON.parse(aiResponse.choices[0].message.content || "{}");
      
      await storage.updateInteractionArtifact(id, {
        aiProcessingStatus: 'completed',
        aiSummary: aiInsights.summary,
        aiExtractedInsights: aiInsights
      });
      
      const updatedArtifact = await storage.getInteractionArtifact(id);
      res.json(updatedArtifact);
    } catch (error: any) {
      console.error("Error processing artifact:", error);
      await storage.updateInteractionArtifact(parseInt(req.params.id), { aiProcessingStatus: 'failed' });
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // SALESFORCE INTEGRATION ROUTES
  // ============================================================================

  // Import salesforce lazily on first request to avoid circular dependencies
  const getSalesforce = () => import('./salesforce');

  // GET /api/integrations/salesforce/status - Get integration status
  app.get("/api/integrations/salesforce/status", async (_req, res) => {
    try {
      const salesforce = await getSalesforce();
      const integration = await salesforce.getActiveIntegration();
      
      const isConfigured = !!(process.env.SALESFORCE_CLIENT_ID && process.env.SALESFORCE_CLIENT_SECRET);
      
      if (!integration) {
        return res.json({ 
          connected: false,
          configured: isConfigured,
          syncStatus: null
        });
      }
      
      const syncStatus = await salesforce.getSyncStatus(integration.id);
      
      res.json({
        connected: true,
        configured: isConfigured,
        integration: {
          id: integration.id,
          instanceUrl: integration.instanceUrl,
          userName: integration.userName,
          orgId: integration.orgId,
          lastSyncAt: integration.lastSyncAt
        },
        syncStatus
      });
    } catch (error: any) {
      console.error("Salesforce status error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/integrations/salesforce/auth - Start OAuth flow
  app.get("/api/integrations/salesforce/auth", async (_req, res) => {
    try {
      if (!process.env.SALESFORCE_CLIENT_ID || !process.env.SALESFORCE_CLIENT_SECRET) {
        return res.status(400).json({ 
          error: "Salesforce integration not configured. Please add SALESFORCE_CLIENT_ID and SALESFORCE_CLIENT_SECRET." 
        });
      }
      
      const salesforce = await getSalesforce();
      const authUrl = salesforce.getAuthorizationUrl();
      res.json({ authUrl });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/integrations/salesforce/callback - OAuth callback
  app.get("/api/integrations/salesforce/callback", async (req, res) => {
    try {
      const code = req.query.code as string;
      
      if (!code) {
        return res.status(400).send("Authorization code not provided");
      }
      
      const salesforce = await getSalesforce();
      const result = await salesforce.exchangeCodeForTokens(code);
      
      // Redirect back to integrations page with success
      res.redirect("/integrations?salesforce=connected");
    } catch (error: any) {
      console.error("Salesforce OAuth callback error:", error);
      res.redirect("/integrations?salesforce=error&message=" + encodeURIComponent(error.message));
    }
  });

  // POST /api/integrations/salesforce/disconnect - Disconnect integration
  app.post("/api/integrations/salesforce/disconnect", async (_req, res) => {
    try {
      const salesforce = await getSalesforce();
      const integration = await salesforce.getActiveIntegration();
      
      if (!integration) {
        return res.status(404).json({ error: "No active integration found" });
      }
      
      await salesforce.disconnectIntegration(integration.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/integrations/salesforce/sync - Trigger manual sync
  app.post("/api/integrations/salesforce/sync", async (req, res) => {
    try {
      const salesforce = await getSalesforce();
      const integration = await salesforce.getActiveIntegration();
      
      if (!integration) {
        return res.status(404).json({ error: "No active integration found" });
      }
      
      const { direction = "bidirectional" } = req.body;
      const conn = await salesforce.createConnection(integration);
      
      let result;
      if (direction === "pull") {
        const accounts = await salesforce.pullAccountsFromSalesforce(conn, integration.id);
        const opportunities = await salesforce.pullOpportunitiesFromSalesforce(conn, integration.id);
        result = { accounts, opportunities };
      } else if (direction === "push") {
        const accounts = await salesforce.pushAccountsToSalesforce(conn, integration.id);
        const opportunities = await salesforce.pushCommitmentsToSalesforce(conn, integration.id);
        result = { accounts, opportunities };
      } else {
        result = await salesforce.fullSync(integration.id);
      }
      
      res.json({ success: true, result });
    } catch (error: any) {
      console.error("Salesforce sync error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/integrations/salesforce/logs - Get sync logs
  app.get("/api/integrations/salesforce/logs", async (req, res) => {
    try {
      const salesforce = await getSalesforce();
      const integration = await salesforce.getActiveIntegration();
      
      if (!integration) {
        return res.json({ logs: [] });
      }
      
      const limit = parseInt(req.query.limit as string) || 10;
      const logs = await salesforce.getRecentSyncLogs(integration.id, limit);
      
      res.json({ logs });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // EVIDENCE PACK API ROUTES
  // ============================================================================

  // GET /api/evidence-packs - Get all evidence packs (for leader workspace)
  app.get("/api/evidence-packs", async (req, res) => {
    try {
      const { reviewerId, status } = req.query;
      let packs;
      
      if (reviewerId) {
        packs = await storage.getEvidencePacksForLeader(reviewerId as string);
      } else {
        packs = await storage.getAllEvidencePacks();
      }
      
      // Filter by status if provided
      if (status) {
        packs = packs.filter(p => p.status === status);
      }
      
      res.json(packs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/evidence-packs/:id - Get evidence pack with items and comments
  app.get("/api/evidence-packs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pack = await storage.getEvidencePack(id);
      
      if (!pack) {
        return res.status(404).json({ error: "Evidence pack not found" });
      }
      
      const items = await storage.getEvidencePackItems(id);
      const comments = await storage.getEvidencePackComments(id);
      
      res.json({ pack, items, comments });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/projects/:projectId/evidence-pack - Get evidence pack for a project
  app.get("/api/projects/:projectId/evidence-pack", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const pack = await storage.getEvidencePackByProject(projectId);
      
      if (!pack) {
        return res.json({ pack: null, items: [], comments: [] });
      }
      
      const items = await storage.getEvidencePackItems(pack.id);
      const comments = await storage.getEvidencePackComments(pack.id);
      
      res.json({ pack, items, comments });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/projects/:projectId/evidence-pack - Create evidence pack for project
  app.post("/api/projects/:projectId/evidence-pack", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Check if pack already exists
      const existing = await storage.getEvidencePackByProject(projectId);
      if (existing) {
        return res.status(400).json({ error: "Evidence pack already exists for this project" });
      }
      
      // Get project for default title
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const packData = insertEvidencePackSchema.parse({
        projectId,
        accountId: project.accountId,
        title: req.body.title || `${project.companyName} - Evidence Pack`,
        description: req.body.description,
        ownerName: req.body.ownerName,
        ownerId: req.body.ownerId,
      });
      
      const pack = await storage.createEvidencePack(packData);
      
      // Create audit log entry
      await storage.createEvidencePackAuditLogEntry({
        packId: pack.id,
        action: "created",
        actorId: req.body.ownerId || "system",
        actorName: req.body.ownerName || "System",
        actorRole: "seller",
        notes: "Evidence pack created",
      });
      
      res.status(201).json(pack);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // PATCH /api/evidence-packs/:id - Update evidence pack
  app.patch("/api/evidence-packs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existing = await storage.getEvidencePack(id);
      
      if (!existing) {
        return res.status(404).json({ error: "Evidence pack not found" });
      }
      
      const updates = req.body;
      
      // Track status changes for audit log
      const statusChanged = updates.status && updates.status !== existing.status;
      
      const updated = await storage.updateEvidencePack(id, updates);
      
      if (statusChanged) {
        let action: any = "updated";
        if (updates.status === "pending_review") action = "submitted_for_review";
        if (updates.status === "in_review") action = "review_started";
        if (updates.status === "approved") action = "approved";
        if (updates.status === "rejected") action = "rejected";
        if (updates.status === "shared") action = "shared";
        
        await storage.createEvidencePackAuditLogEntry({
          packId: id,
          action,
          actorId: updates.actorId || "system",
          actorName: updates.actorName || "System",
          actorRole: updates.actorRole || "system",
          previousValue: { status: existing.status },
          newValue: { status: updates.status },
          notes: updates.reviewNotes,
        });
      }
      
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // DELETE /api/evidence-packs/:id - Delete evidence pack
  app.delete("/api/evidence-packs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEvidencePack(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/evidence-packs/:id/share - Generate share token for pack
  app.post("/api/evidence-packs/:id/share", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pack = await storage.getEvidencePack(id);
      
      if (!pack) {
        return res.status(404).json({ error: "Evidence pack not found" });
      }
      
      // Only allow sharing of approved packs
      if (pack.status !== "approved") {
        return res.status(400).json({ error: "Only approved packs can be shared" });
      }
      
      const shareToken = pack.shareToken || crypto.randomBytes(32).toString("hex");
      
      const updated = await storage.updateEvidencePack(id, {
        shareToken,
        sharedAt: new Date(),
        sharedWithEmail: req.body.email,
        status: "shared",
      });
      
      await storage.createEvidencePackAuditLogEntry({
        packId: id,
        action: "shared",
        actorId: req.body.actorId || "system",
        actorName: req.body.actorName || "System",
        actorRole: "seller",
        notes: `Shared with ${req.body.email || "external recipient"}`,
      });
      
      res.json({ shareToken, shareUrl: `/evidence-pack/${shareToken}` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/evidence-pack/share/:token - Get shared evidence pack (public)
  app.get("/api/evidence-pack/share/:token", async (req, res) => {
    try {
      const token = req.params.token;
      const pack = await storage.getEvidencePackByToken(token);
      
      if (!pack) {
        return res.status(404).json({ error: "Evidence pack not found" });
      }
      
      if (pack.status !== "shared" && pack.status !== "approved") {
        return res.status(403).json({ error: "This pack is not available for viewing" });
      }
      
      const items = await storage.getEvidencePackItems(pack.id);
      
      // Only return approved items for external view
      const approvedItems = items.filter(item => item.itemStatus === "approved");
      
      // Get project info for context
      const project = await storage.getProject(pack.projectId);
      
      res.json({ 
        pack: {
          title: pack.title,
          description: pack.description,
          qualityScore: pack.qualityScore,
          ownerName: pack.ownerName,
        },
        items: approvedItems,
        projectName: project?.companyName,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // EVIDENCE PACK ITEMS
  // ============================================================================

  // GET /api/evidence-packs/:packId/items - Get items for a pack
  app.get("/api/evidence-packs/:packId/items", async (req, res) => {
    try {
      const packId = parseInt(req.params.packId);
      const items = await storage.getEvidencePackItems(packId);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/evidence-packs/:packId/items - Add item to pack
  app.post("/api/evidence-packs/:packId/items", async (req, res) => {
    try {
      const packId = parseInt(req.params.packId);
      
      const pack = await storage.getEvidencePack(packId);
      if (!pack) {
        return res.status(404).json({ error: "Evidence pack not found" });
      }
      
      // Get current max order
      const existingItems = await storage.getEvidencePackItems(packId);
      const maxOrder = existingItems.length > 0 
        ? Math.max(...existingItems.map(i => i.displayOrder)) 
        : -1;
      
      const itemData = insertEvidencePackItemSchema.parse({
        packId,
        itemType: req.body.itemType || "claim",
        sourceType: req.body.sourceType,
        sourceId: req.body.sourceId,
        claim: req.body.claim,
        claimContext: req.body.claimContext,
        proofSources: req.body.proofSources,
        aiGenerated: req.body.aiGenerated || false,
        aiProvenance: req.body.aiProvenance,
        displayOrder: req.body.displayOrder ?? maxOrder + 1,
        section: req.body.section,
        valuePillar: req.body.valuePillar,
        coachingTip: req.body.coachingTip,
      });
      
      const item = await storage.createEvidencePackItem(itemData);
      
      await storage.createEvidencePackAuditLogEntry({
        packId,
        itemId: item.id,
        action: "item_added",
        actorId: req.body.actorId || "system",
        actorName: req.body.actorName || "System",
        actorRole: req.body.actorRole || "seller",
        newValue: { claim: item.claim, itemType: item.itemType },
      });
      
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // PATCH /api/evidence-pack-items/:id - Update item
  app.patch("/api/evidence-pack-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existing = await storage.getEvidencePackItem(id);
      
      if (!existing) {
        return res.status(404).json({ error: "Evidence pack item not found" });
      }
      
      const updates = req.body;
      
      // Track status changes
      const statusChanged = updates.itemStatus && updates.itemStatus !== existing.itemStatus;
      
      if (statusChanged) {
        updates.reviewedAt = new Date();
        updates.reviewedBy = req.body.reviewedBy;
      }
      
      const updated = await storage.updateEvidencePackItem(id, updates);
      
      if (statusChanged) {
        let action: any = "updated";
        if (updates.itemStatus === "approved") action = "item_approved";
        if (updates.itemStatus === "rejected") action = "item_rejected";
        
        await storage.createEvidencePackAuditLogEntry({
          packId: existing.packId,
          itemId: id,
          action,
          actorId: req.body.actorId || "system",
          actorName: req.body.actorName || "System",
          actorRole: req.body.actorRole || "leader",
          previousValue: { itemStatus: existing.itemStatus },
          newValue: { itemStatus: updates.itemStatus },
          notes: updates.reviewerComment,
        });
      }
      
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // DELETE /api/evidence-pack-items/:id - Delete item
  app.delete("/api/evidence-pack-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getEvidencePackItem(id);
      
      if (item) {
        await storage.createEvidencePackAuditLogEntry({
          packId: item.packId,
          itemId: id,
          action: "item_removed",
          actorId: req.body.actorId || "system",
          actorName: req.body.actorName || "System",
          actorRole: req.body.actorRole || "seller",
          previousValue: { claim: item.claim },
        });
      }
      
      await storage.deleteEvidencePackItem(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // EVIDENCE PACK COMMENTS
  // ============================================================================

  // GET /api/evidence-packs/:packId/comments - Get comments for pack
  app.get("/api/evidence-packs/:packId/comments", async (req, res) => {
    try {
      const packId = parseInt(req.params.packId);
      const comments = await storage.getEvidencePackComments(packId);
      res.json(comments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/evidence-packs/:packId/comments - Add comment
  app.post("/api/evidence-packs/:packId/comments", async (req, res) => {
    try {
      const packId = parseInt(req.params.packId);
      
      const commentData = insertEvidencePackCommentSchema.parse({
        packId,
        itemId: req.body.itemId,
        content: req.body.content,
        authorId: req.body.authorId,
        authorName: req.body.authorName,
        authorRole: req.body.authorRole,
        commentType: req.body.commentType || "feedback",
      });
      
      const comment = await storage.createEvidencePackComment(commentData);
      res.status(201).json(comment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // PATCH /api/evidence-pack-comments/:id/resolve - Resolve a comment
  app.patch("/api/evidence-pack-comments/:id/resolve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateEvidencePackComment(id, {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy: req.body.resolvedBy,
      });
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================================================
  // EVIDENCE PACK AUDIT LOG
  // ============================================================================

  // GET /api/evidence-packs/:packId/audit-log - Get audit log for pack
  app.get("/api/evidence-packs/:packId/audit-log", async (req, res) => {
    try {
      const packId = parseInt(req.params.packId);
      const log = await storage.getEvidencePackAuditLog(packId);
      res.json(log);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // EVIDENCE PACK PDF EXPORT
  // ============================================================================

  // GET /api/evidence-packs/:packId/export/pdf - Generate PDF export
  app.get("/api/evidence-packs/:packId/export/pdf", async (req, res) => {
    try {
      const packId = parseInt(req.params.packId);
      const pack = await storage.getEvidencePack(packId);
      
      if (!pack) {
        return res.status(404).json({ error: "Evidence pack not found" });
      }
      
      const items = await storage.getEvidencePackItems(packId);
      const project = await storage.getProject(pack.projectId);
      
      const { generateEvidencePackPDF } = await import("./pdfExport");
      const pdfBuffer = await generateEvidencePackPDF(pack, items, project?.companyName);
      
      const filename = `evidence-pack-${pack.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error("PDF export error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // LEADER WORKSPACE - Aggregated views
  // ============================================================================

  // GET /api/leader/dashboard - Get leader dashboard summary
  app.get("/api/leader/dashboard", async (req, res) => {
    try {
      const packs = await storage.getAllEvidencePacks();
      
      // Calculate summary metrics
      const summary = {
        totalPacks: packs.length,
        pendingReview: packs.filter(p => p.status === "pending_review").length,
        inReview: packs.filter(p => p.status === "in_review").length,
        approved: packs.filter(p => p.status === "approved").length,
        rejected: packs.filter(p => p.status === "rejected").length,
        shared: packs.filter(p => p.status === "shared").length,
        avgQualityScore: packs.filter(p => p.qualityScore != null).length > 0
          ? Math.round(packs.filter(p => p.qualityScore != null).reduce((acc, p) => acc + (p.qualityScore || 0), 0) / packs.filter(p => p.qualityScore != null).length)
          : null,
        packsNeedingAttention: packs.filter(p => 
          p.status === "pending_review" || 
          (p.qualityScore != null && p.qualityScore < 70)
        ),
      };
      
      // Get recent packs with project info
      const recentPacks = await Promise.all(
        packs.slice(0, 10).map(async (pack) => {
          const project = await storage.getProject(pack.projectId);
          const items = await storage.getEvidencePackItems(pack.id);
          return {
            ...pack,
            projectName: project?.companyName,
            itemCount: items.length,
            approvedItems: items.filter(i => i.itemStatus === "approved").length,
            flaggedItems: items.filter(i => i.itemStatus === "flagged").length,
          };
        })
      );
      
      res.json({ summary, recentPacks });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // EVIDENCE PACK AI RECOMMENDATIONS
  // ============================================================================

  // POST /api/evidence-packs/:packId/recommendations - Generate AI recommendations for pack
  app.post("/api/evidence-packs/:packId/recommendations", async (req, res) => {
    try {
      const packId = parseInt(req.params.packId);
      const pack = await storage.getEvidencePack(packId);
      
      if (!pack) {
        return res.status(404).json({ error: "Evidence pack not found" });
      }
      
      const project = await storage.getProject(pack.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Gather discovery insights
      const dataPoints = await storage.getCompanyDataPoints(pack.projectId);
      const discoveryInsights = dataPoints.map(dp => ({
        label: dp.label,
        value: dp.value,
        confidence: dp.confidence
      }));
      
      // Gather outcomes
      const valueCases = await storage.getValueCases(pack.projectId);
      const outcomes = valueCases.map(vc => ({
        title: vc.title || vc.jobToComplete,
        kpiName: vc.commitmentSummary || undefined,
        targetValue: undefined
      }));
      
      // Get success stories in library for matching
      const successStories = await storage.getSuccessStoryLibrary();
      const storyRefs = successStories.map(s => ({
        title: s.title,
        industry: s.industry || undefined,
        outcome: s.summary || undefined
      }));
      
      // Get existing items
      const existingItems = await storage.getEvidencePackItems(packId);
      const existingClaims = existingItems.map(i => ({
        claim: i.claim,
        itemType: i.itemType,
        valuePillar: i.valuePillar || undefined
      }));
      
      const recommendations = await generateEvidencePackRecommendations({
        companyName: project.companyName,
        sector: project.sector || undefined,
        discoveryTheme: req.body.discoveryTheme,
        discoveryInsights,
        outcomes,
        successStories: storyRefs,
        existingItems: existingClaims,
        phase: req.body.phase || "discovery"
      });
      
      res.json(recommendations);
    } catch (error: any) {
      console.error("[Evidence Pack Recommendations] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/evidence-pack-items/:itemId/coaching - Get AI coaching for specific item
  app.post("/api/evidence-pack-items/:itemId/coaching", async (req, res) => {
    try {
      const itemId = parseInt(req.params.itemId);
      const item = await storage.getEvidencePackItem(itemId);
      
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      
      const pack = await storage.getEvidencePack(item.packId);
      if (!pack) {
        return res.status(404).json({ error: "Pack not found" });
      }
      
      const project = await storage.getProject(pack.projectId);
      
      const coaching = await generateItemCoaching({
        claim: item.claim,
        itemType: item.itemType,
        valuePillar: item.valuePillar,
        proofSources: item.proofSources as any[] || [],
        companyName: project?.companyName || "Unknown",
        sector: project?.sector || undefined
      });
      
      // Optionally update the item with the coaching tip
      if (coaching.tip && req.body.saveCoaching) {
        await storage.updateEvidencePackItem(itemId, {
          coachingTip: coaching.tip
        });
      }
      
      res.json(coaching);
    } catch (error: any) {
      console.error("[Evidence Pack Item Coaching] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // EVIDENCE PACK LIVING DOCUMENT ARTIFACTS
  // ============================================================================

  // ----------------------
  // SUCCESS FRAME SNAPSHOTS
  // ----------------------
  
  // GET /api/evidence-packs/:packId/success-frame - Get current success frame
  app.get("/api/evidence-packs/:packId/success-frame", async (req, res) => {
    try {
      const packId = parseInt(req.params.packId);
      const snapshot = await storage.getSuccessFrameSnapshot(packId);
      res.json(snapshot || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // POST /api/evidence-packs/:packId/success-frame - Create success frame
  app.post("/api/evidence-packs/:packId/success-frame", async (req, res) => {
    try {
      const packId = parseInt(req.params.packId);
      const pack = await storage.getEvidencePack(packId);
      if (!pack) {
        return res.status(404).json({ error: "Evidence pack not found" });
      }
      
      const snapshot = await storage.createSuccessFrameSnapshot({
        packId,
        projectId: pack.projectId,
        kpis: req.body.kpis || [],
        uncertaintyStatement: req.body.uncertaintyStatement,
        assumptionsNotes: req.body.assumptionsNotes,
        aiInferred: req.body.aiInferred || false,
        aiInferenceSource: req.body.aiInferenceSource,
      });
      
      res.status(201).json(snapshot);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // PATCH /api/success-frames/:id - Update success frame
  app.patch("/api/success-frames/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const snapshot = await storage.updateSuccessFrameSnapshot(id, req.body);
      if (!snapshot) {
        return res.status(404).json({ error: "Success frame not found" });
      }
      res.json(snapshot);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // POST /api/success-frames/:id/lock - Lock the success frame
  app.post("/api/success-frames/:id/lock", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const snapshot = await storage.updateSuccessFrameSnapshot(id, {
        isLocked: true,
        lockedAt: new Date(),
        lockedBy: req.body.lockedBy || "System",
      });
      if (!snapshot) {
        return res.status(404).json({ error: "Success frame not found" });
      }
      res.json(snapshot);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // POST /api/success-frames/:id/confirm-ai - Confirm AI inference
  app.post("/api/success-frames/:id/confirm-ai", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const snapshot = await storage.updateSuccessFrameSnapshot(id, {
        aiConfirmedBy: req.body.confirmedBy || "User",
        aiConfirmedAt: new Date(),
      });
      if (!snapshot) {
        return res.status(404).json({ error: "Success frame not found" });
      }
      res.json(snapshot);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ----------------------
  // BEHAVIOURAL CONDITION LOGS
  // ----------------------
  
  // GET /api/evidence-packs/:packId/behavioural-log - Get behavioural condition log
  app.get("/api/evidence-packs/:packId/behavioural-log", async (req, res) => {
    try {
      const packId = parseInt(req.params.packId);
      const log = await storage.getBehaviouralConditionLog(packId);
      res.json(log || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // POST /api/evidence-packs/:packId/behavioural-log - Create behavioural log
  app.post("/api/evidence-packs/:packId/behavioural-log", async (req, res) => {
    try {
      const packId = parseInt(req.params.packId);
      const pack = await storage.getEvidencePack(packId);
      if (!pack) {
        return res.status(404).json({ error: "Evidence pack not found" });
      }
      
      const log = await storage.createBehaviouralConditionLog({
        packId,
        projectId: pack.projectId,
        conditions: req.body.conditions || [],
        aiSuggestedConditions: req.body.aiSuggestedConditions,
      });
      
      res.status(201).json(log);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // PATCH /api/behavioural-logs/:id - Update behavioural log
  app.patch("/api/behavioural-logs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const log = await storage.updateBehaviouralConditionLog(id, req.body);
      if (!log) {
        return res.status(404).json({ error: "Behavioural log not found" });
      }
      res.json(log);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ----------------------
  // KPI MOVEMENT VIEWS
  // ----------------------
  
  // GET /api/evidence-packs/:packId/kpi-movement - Get KPI movement view
  app.get("/api/evidence-packs/:packId/kpi-movement", async (req, res) => {
    try {
      const packId = parseInt(req.params.packId);
      const view = await storage.getKPIMovementView(packId);
      res.json(view || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // POST /api/evidence-packs/:packId/kpi-movement - Create KPI movement view
  app.post("/api/evidence-packs/:packId/kpi-movement", async (req, res) => {
    try {
      const packId = parseInt(req.params.packId);
      const pack = await storage.getEvidencePack(packId);
      if (!pack) {
        return res.status(404).json({ error: "Evidence pack not found" });
      }
      
      const successFrame = await storage.getSuccessFrameSnapshot(packId);
      
      const view = await storage.createKPIMovementView({
        packId,
        projectId: pack.projectId,
        successFrameId: successFrame?.id,
        movements: req.body.movements || [],
        overallHealthScore: req.body.overallHealthScore,
        overallNarrative: req.body.overallNarrative,
      });
      
      res.status(201).json(view);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // PATCH /api/kpi-movements/:id - Update KPI movement view
  app.patch("/api/kpi-movements/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const view = await storage.updateKPIMovementView(id, req.body);
      if (!view) {
        return res.status(404).json({ error: "KPI movement view not found" });
      }
      res.json(view);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ----------------------
  // SPONSOR NARRATIVE SPINES
  // ----------------------
  
  // GET /api/evidence-packs/:packId/narrative-spine - Get narrative spine
  app.get("/api/evidence-packs/:packId/narrative-spine", async (req, res) => {
    try {
      const packId = parseInt(req.params.packId);
      const spine = await storage.getSponsorNarrativeSpine(packId);
      res.json(spine || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // POST /api/evidence-packs/:packId/narrative-spine - Create narrative spine
  app.post("/api/evidence-packs/:packId/narrative-spine", async (req, res) => {
    try {
      const packId = parseInt(req.params.packId);
      const pack = await storage.getEvidencePack(packId);
      if (!pack) {
        return res.status(404).json({ error: "Evidence pack not found" });
      }
      
      const spine = await storage.createSponsorNarrativeSpine({
        packId,
        projectId: pack.projectId,
        spine: req.body.spine,
        aiGenerated: req.body.aiGenerated || false,
        aiGeneratedAt: req.body.aiGenerated ? new Date() : undefined,
        aiModel: req.body.aiModel,
        aiConfidence: req.body.aiConfidence,
      });
      
      res.status(201).json(spine);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // PATCH /api/narrative-spines/:id - Update narrative spine
  app.patch("/api/narrative-spines/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const spine = await storage.updateSponsorNarrativeSpine(id, req.body);
      if (!spine) {
        return res.status(404).json({ error: "Narrative spine not found" });
      }
      res.json(spine);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ----------------------
  // AI GUIDANCE EVENTS
  // ----------------------
  
  // GET /api/projects/:projectId/guidance - Get AI guidance for a project
  app.get("/api/projects/:projectId/guidance", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const persona = req.query.persona as string | undefined;
      const events = await storage.getAIGuidanceEvents(projectId, persona);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // GET /api/projects/:projectId/guidance/pending - Get pending guidance
  app.get("/api/projects/:projectId/guidance/pending", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const persona = (req.query.persona as string) || "seller";
      const events = await storage.getPendingAIGuidanceEvents(projectId, persona);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // PATCH /api/guidance/:id - Update guidance event status
  app.patch("/api/guidance/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.updateAIGuidanceEvent(id, {
        status: req.body.status,
        viewedAt: req.body.status === "viewed" ? new Date() : undefined,
        actedOnAt: req.body.status === "acted_on" ? new Date() : undefined,
        dismissedAt: req.body.status === "dismissed" ? new Date() : undefined,
        dismissReason: req.body.dismissReason,
        wasHelpful: req.body.wasHelpful,
        helpfulnessNotes: req.body.helpfulnessNotes,
      });
      if (!event) {
        return res.status(404).json({ error: "Guidance event not found" });
      }
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ----------------------
  // EVIDENCE PACK LIFECYCLE EVENTS
  // ----------------------
  
  // POST /api/evidence-packs/:packId/lifecycle-event - Create lifecycle event
  app.post("/api/evidence-packs/:packId/lifecycle-event", async (req, res) => {
    try {
      const packId = parseInt(req.params.packId);
      const pack = await storage.getEvidencePack(packId);
      if (!pack) {
        return res.status(404).json({ error: "Evidence pack not found" });
      }
      
      const event = await storage.createEvidencePackLifecycleEvent({
        packId,
        projectId: pack.projectId,
        eventType: req.body.eventType,
        eventData: req.body.eventData,
      });
      
      res.status(201).json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // GET /api/evidence-packs/:packId/lifecycle-events - Get lifecycle events
  app.get("/api/evidence-packs/:packId/lifecycle-events", async (req, res) => {
    try {
      const packId = parseInt(req.params.packId);
      const events = await storage.getEvidencePackLifecycleEvents(packId);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ----------------------
  // COMBINED ARTIFACTS ENDPOINT
  // ----------------------
  
  // GET /api/evidence-packs/:packId/artifacts - Get all living document artifacts
  app.get("/api/evidence-packs/:packId/artifacts", async (req, res) => {
    try {
      const packId = parseInt(req.params.packId);
      
      const [successFrame, behaviouralLog, kpiMovement, narrativeSpine] = await Promise.all([
        storage.getSuccessFrameSnapshot(packId),
        storage.getBehaviouralConditionLog(packId),
        storage.getKPIMovementView(packId),
        storage.getSponsorNarrativeSpine(packId),
      ]);
      
      res.json({
        successFrame: successFrame || null,
        behaviouralLog: behaviouralLog || null,
        kpiMovement: kpiMovement || null,
        narrativeSpine: narrativeSpine || null,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ----------------------
  // AI INFERENCE LAYER (Infer First, Confirm Second)
  // ----------------------
  
  const inferRequestSchema = z.object({
    targetPersona: z.enum(["seller", "manager"]).optional().default("seller")
  });
  
  const processEventRequestSchema = z.object({
    eventType: z.string().min(1, "eventType is required"),
    eventData: z.record(z.any()).optional().default({})
  });
  
  const confirmInferenceRequestSchema = z.object({
    confirmed: z.boolean(),
    notes: z.string().optional()
  });
  
  // POST /api/evidence-packs/:packId/infer - Generate AI inferences for evidence pack
  app.post("/api/evidence-packs/:packId/infer", async (req, res) => {
    try {
      const packId = parseInt(req.params.packId);
      const validatedBody = inferRequestSchema.parse(req.body);
      
      const { getInferredSuggestionsForPack } = await import("./evidence-pack-ai");
      const suggestions = await getInferredSuggestionsForPack(packId, validatedBody.targetPersona);
      
      res.json(suggestions);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid request body", details: error.errors });
      }
      console.error("[AI Inference] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // POST /api/evidence-packs/:packId/process-event - Process lifecycle event with AI
  app.post("/api/evidence-packs/:packId/process-event", async (req, res) => {
    try {
      const packId = parseInt(req.params.packId);
      const validatedBody = processEventRequestSchema.parse(req.body);
      
      const pack = await storage.getEvidencePack(packId);
      if (!pack) {
        return res.status(404).json({ error: "Evidence pack not found" });
      }
      
      const { processLifecycleEvent } = await import("./evidence-pack-ai");
      const result = await processLifecycleEvent(packId, pack.projectId, validatedBody.eventType, validatedBody.eventData);
      
      res.json(result);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid request body", details: error.errors });
      }
      console.error("[AI Inference] Error processing event:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // POST /api/guidance/:id/confirm - Confirm or dismiss AI inference
  app.post("/api/guidance/:id/confirm", async (req, res) => {
    try {
      const guidanceEventId = parseInt(req.params.id);
      const validatedBody = confirmInferenceRequestSchema.parse(req.body);
      
      const { confirmInference } = await import("./evidence-pack-ai");
      await confirmInference(guidanceEventId, validatedBody.confirmed, validatedBody.notes);
      
      res.json({ success: true, confirmed: validatedBody.confirmed });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid request body", details: error.errors });
      }
      console.error("[AI Inference] Error confirming:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // ----------------------
  // BLUE SHEET ROUTES (Miller Heiman Strategic Selling)
  // ----------------------

  // Blue Sheet Zod validation schemas
  const blueSheetBuyingInfluenceSchema = z.object({
    name: z.string(),
    title: z.string().optional(),
    company: z.string().optional(),
    role: z.enum(["Economic", "User", "Technical", "Coach"]),
    mode: z.enum(["Growth", "Trouble", "EvenKeel", "Overconfident"]).optional(),
    rating: z.enum(["+5", "+4", "+3", "+2", "+1", "0", "-1", "-2", "-3", "-4", "-5"]).optional(),
    degreeOfInfluence: z.enum(["High", "Medium", "Low"]).optional(),
    coveredBy: z.string().optional(),
    resultsWanted: z.string().optional(),
    personalWins: z.string().optional(),
    positionMarker: z.enum(["RedFlag", "Strength", "Unknown"]).optional(),
    notes: z.string().optional(),
  });

  const blueSheetCompetitionSchema = z.object({
    competitor: z.string(),
    strengths: z.string().optional(),
    weaknesses: z.string().optional(),
    strategy: z.string().optional(),
    uniqueBusinessStrength: z.string().optional(),
    rating: z.enum(["Strong", "Moderate", "Weak"]).optional(),
  });

  const blueSheetSummaryPositionSchema = z.object({
    type: z.enum(["RedFlag", "Strength"]),
    description: z.string(),
    priority: z.enum(["High", "Medium", "Low"]).optional(),
    buyingInfluenceName: z.string().optional(),
  });

  const blueSheetActionPlanSchema = z.object({
    action: z.string(),
    targetDate: z.string().optional(),
    owner: z.string().optional(),
    status: z.enum(["pending", "in_progress", "completed"]).optional(),
    addressesRedFlag: z.string().optional(),
    leveragesStrength: z.string().optional(),
    priority: z.number().optional(),
  });

  const blueSheetConflictSchema = z.object({
    description: z.string(),
    buyingInfluencesInvolved: z.array(z.string()).optional(),
    resolution: z.string().optional(),
  });

  const blueSheetDataSchema = z.object({
    singleSalesObjective: z.string().optional(),
    singleSalesObjectiveMarker: z.enum(["RedFlag", "Strength", "Unknown"]).optional(),
    customerTimingForPriorities: z.enum(["Urgent", "Later", "Unknown"]).optional(),
    customersStatedObjectives: z.string().optional(),
    evaluationOfObjective: z.string().optional(),
    currentPosition: z.enum(["Best", "SharedBest", "Shared", "Trailing", "Panic", "Unknown"]).optional(),
    competitions: z.array(blueSheetCompetitionSchema).optional(),
    buyingInfluences: z.array(blueSheetBuyingInfluenceSchema).optional(),
    summaryOfPositions: z.array(blueSheetSummaryPositionSchema).optional(),
    actionPlans: z.array(blueSheetActionPlanSchema).optional(),
    conflicts: z.array(blueSheetConflictSchema).optional(),
  });

  const createBlueSheetRequestSchema = z.object({
    data: blueSheetDataSchema,
    status: z.enum(["draft", "in_progress", "completed"]).optional().default("draft"),
    aiGenerated: z.boolean().optional().default(false),
    aiModel: z.string().optional(),
    sourceContext: z.record(z.any()).optional(),
  });

  const updateBlueSheetRequestSchema = z.object({
    data: blueSheetDataSchema.optional(),
    status: z.enum(["draft", "in_progress", "completed"]).optional(),
    lastEditedBy: z.string().optional(),
    sectionCompletion: z.record(z.number()).optional(),
  });

  const generateBlueSheetRequestSchema = z.object({
    theme: z.string().optional(),
  });

  // GET /api/projects/:id/bluesheet - Get Blue Sheet for project
  app.get("/api/projects/:id/bluesheet", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const blueSheet = await storage.getBlueSheet(projectId);
      res.json(blueSheet || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/projects/:id/bluesheet - Create new Blue Sheet
  app.post("/api/projects/:id/bluesheet", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      // Validate request body
      const validatedBody = createBlueSheetRequestSchema.parse(req.body);
      
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Check if blue sheet already exists
      const existing = await storage.getBlueSheet(projectId);
      if (existing) {
        return res.status(400).json({ error: "Blue sheet already exists for this project. Use PATCH to update." });
      }

      const blueSheet = await storage.createBlueSheet({
        projectId,
        data: validatedBody.data,
        status: validatedBody.status,
        aiGenerated: validatedBody.aiGenerated,
        aiModel: validatedBody.aiModel,
        aiGeneratedAt: validatedBody.aiGenerated ? new Date() : undefined,
        sourceContext: validatedBody.sourceContext,
      });

      res.status(201).json(blueSheet);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid request body", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /api/projects/:id/bluesheet - Update Blue Sheet
  app.patch("/api/projects/:id/bluesheet", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      // Validate request body
      const validatedBody = updateBlueSheetRequestSchema.parse(req.body);
      
      const existing = await storage.getBlueSheet(projectId);
      
      if (!existing) {
        return res.status(404).json({ error: "Blue sheet not found" });
      }

      const updated = await storage.updateBlueSheet(existing.id, {
        data: validatedBody.data ?? existing.data,
        status: validatedBody.status ?? existing.status,
        lastEditedBy: validatedBody.lastEditedBy,
        lastEditedAt: new Date(),
        sectionCompletion: validatedBody.sectionCompletion,
      });

      res.json(updated);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid request body", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/projects/:id/bluesheet/generate - AI-generate Blue Sheet from discovery context
  app.post("/api/projects/:id/bluesheet/generate", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      // Validate request body
      const validatedBody = generateBlueSheetRequestSchema.parse(req.body);
      
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Gather discovery context
      const discoveryNotes = await storage.getDiscoveryNotes(projectId);
      const theme = validatedBody.theme || project.discoveryTheme || "General";
      const intelligence = await storage.getProjectIntelligence(projectId, theme);
      const jobThemes = await storage.getJobThemes(projectId);
      
      // Build context for AI
      const context = {
        companyName: project.companyName,
        industry: project.industry,
        discoveryNotes: discoveryNotes?.notes || "",
        intelligenceData: intelligence?.data,
        theme: theme,
        jobThemes: jobThemes.map(jt => ({ theme: jt.theme, summary: jt.summary })),
      };

      // Generate Blue Sheet using OpenAI
      const systemPrompt = `You are a Strategic Selling® / Miller Heiman Blue Sheet analyst.
Your job is to convert discovery artifacts into a Blue Sheet JSON.

OUTPUT FORMAT (strict):
- Output ONLY a JSON object matching the schema. No markdown, no commentary.
- Use "Unknown" exactly where required/appropriate.
- Use empty arrays when no items exist.

GLOBAL RULES:
1) Everything ties back to the Single Sales Objective (SSO).
2) If you do not know something, treat it as a RedFlag and create actions to resolve.
3) Ensure summaryOfPositions includes at least one RedFlag.
4) Customer point of view is the anchor.

Generate a Blue Sheet with these sections:
- singleSalesObjective: "To sell [solution] to [customer] by [date]"
- singleSalesObjectiveMarker: RedFlag/Strength/Unknown
- customerTimingForPriorities: Urgent/Later/Unknown
- customersStatedObjectives: Customer's business objective in their words
- evaluationOfObjective: Effects/Implications/Benefits
- currentPosition: Best/SharedBest/Shared/Trailing/Panic/Unknown
- competitions: Array of competitor analysis
- buyingInfluences: Array of stakeholders with roles, modes, ratings
- summaryOfPositions: Array of Strengths and RedFlags
- actionPlans: Array of 10+ concrete actions`;

      const userPrompt = `Analyze this discovery data and generate a Blue Sheet:

Company: ${context.companyName}
Industry: ${context.industry || "Unknown"}
Theme: ${context.theme}

Job Themes:
${context.jobThemes.map(jt => `- ${jt.theme}: ${jt.summary || "No summary"}`).join("\n") || "None captured"}

Discovery Notes:
${context.discoveryNotes || "None captured"}

Intelligence Data:
${JSON.stringify(context.intelligenceData, null, 2) || "None captured"}

Generate a comprehensive Blue Sheet JSON.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const blueSheetData = JSON.parse(completion.choices[0].message.content || "{}");

      // Calculate section completion
      const sectionCompletion = {
        sso: blueSheetData.singleSalesObjective && blueSheetData.singleSalesObjective !== "Unknown" ? 100 : 0,
        buyingInfluences: blueSheetData.buyingInfluences?.length > 0 ? 100 : 0,
        competition: blueSheetData.competitions?.length > 0 ? 100 : 0,
        winResults: blueSheetData.buyingInfluences?.some((bi: any) => bi.personalWins) ? 100 : 0,
        strengthsRedFlags: blueSheetData.summaryOfPositions?.length > 0 ? 100 : 0,
        actionPlan: blueSheetData.actionPlans?.length >= 10 ? 100 : (blueSheetData.actionPlans?.length > 0 ? 50 : 0),
      };

      // Check if existing and update, otherwise create
      const existing = await storage.getBlueSheet(projectId);
      let blueSheet;
      
      if (existing) {
        blueSheet = await storage.updateBlueSheet(existing.id, {
          data: blueSheetData,
          aiGenerated: true,
          aiModel: "gpt-4o",
          aiGeneratedAt: new Date(),
          sourceContext: {
            discoveryTheme: context.theme,
            intelligenceData: !!context.intelligenceData,
            greenSheetData: false,
            discoveryQuestions: false,
            meetingAttendees: false,
            storyBuilderData: false,
          },
          sectionCompletion,
          version: existing.version + 1,
        });
      } else {
        blueSheet = await storage.createBlueSheet({
          projectId,
          data: blueSheetData,
          status: "draft",
          aiGenerated: true,
          aiModel: "gpt-4o",
          aiGeneratedAt: new Date(),
          sourceContext: {
            discoveryTheme: context.theme,
            intelligenceData: !!context.intelligenceData,
            greenSheetData: false,
            discoveryQuestions: false,
            meetingAttendees: false,
            storyBuilderData: false,
          },
          sectionCompletion,
        });
      }

      res.json(blueSheet);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid request body", details: error.errors });
      }
      console.error("[Blue Sheet] Generation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/projects/:id/bluesheet - Delete Blue Sheet
  app.delete("/api/projects/:id/bluesheet", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const existing = await storage.getBlueSheet(projectId);
      
      if (!existing) {
        return res.status(404).json({ error: "Blue sheet not found" });
      }

      await storage.deleteBlueSheet(existing.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
