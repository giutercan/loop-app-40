import type { Express } from "express";
import { storage } from "./storage";
import { researchCompany, followUpResearch, generateDiscoveryQuestions, enrichFromNotes, generateSuccessStoryRecommendations, generateBusinessReviewAgenda, generateIndustryBenchmark, generateValueCaseRecommendations, generateKPIRecommendations, generateKPIRationale, generateStrategicPillars, generateStorySuggestion } from "./ai";
import { z } from "zod";
import crypto from "crypto";

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
  lifecyclePhases,
  type LifecyclePhase
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

      if (jobThemeInsightIds.size === 0) {
        return res.status(400).json({ error: "No insights found in job themes. Please ensure your highlighted priorities have associated insights." });
      }

      // Get only insights that are part of job themes
      const allDataPoints = await storage.getCompanyDataPoints(projectId);
      let jobThemeInsights = allDataPoints.filter(dp => jobThemeInsightIds.has(dp.id));
      
      if (jobThemeInsights.length === 0) {
        return res.status(400).json({ error: "No valid insights found for job themes" });
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

      // Generate questions with AI
      let generatedQuestions;
      try {
        generatedQuestions = await generateDiscoveryQuestions(project.companyName, capabilityQuestions);
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
      const [dataPoints, headlines, discoveryNotes] = await Promise.all([
        storage.getCompanyDataPoints(projectId),
        storage.getHeadlines(projectId),
        storage.getDiscoveryNotes(projectId)
      ]);

      if (dataPoints.length === 0 && headlines.length === 0) {
        return res.status(400).json({ 
          error: "Not enough discovery data", 
          message: "Please complete company research first to generate strategic pillars" 
        });
      }

      // Generate pillars using AI
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
          freeformNotes: discoveryNotes.freeformNotes,
          topChallenges: discoveryNotes.topChallenges,
          keyStakeholder: discoveryNotes.keyStakeholder
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
          isSelected: false, // Not selected by default - consultant chooses
        });
        createdKPIs.push(newKPI);
      }
      
      console.log(`[AI KPI Recommendations] Created ${createdKPIs.length} recommendations for job theme ${jobTheme.id}`);
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

      // Load notes content
      const notes = await storage.getDiscoveryNotes(projectId);
      const notesContent = notes?.freeformNotes || '';

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
        discoveryTheme, 
        successStories, 
        currentDraft, 
        fieldToSuggest, 
        phase 
      } = req.body;
      
      if (!fieldToSuggest || !phase) {
        return res.status(400).json({ error: "fieldToSuggest and phase are required" });
      }
      
      const suggestion = await generateStorySuggestion({
        companyName: project.companyName,
        companyContext: project.sector ? `${project.sector} sector` : undefined,
        discoveryTheme,
        meetingContact,
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

  // POST /api/migrate/projects-to-accounts - Migration endpoint to auto-create accounts
  app.post("/api/migrate/projects-to-accounts", async (req, res) => {
    try {
      await storage.migrateProjectsToAccounts();
      res.json({ success: true, message: "Migration completed - projects linked to accounts" });
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
}
