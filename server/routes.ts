import type { Express } from "express";
import { storage } from "./storage";
import { researchCompany, followUpResearch, generateDiscoveryQuestions, enrichFromNotes, generateSuccessStoryRecommendations, generateBusinessReviewAgenda, generateIndustryBenchmark } from "./ai";
import { z } from "zod";

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
  insertSuccessStorySchema
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
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Get selected insights grouped by capability
      const allDataPoints = await storage.getCompanyDataPoints(projectId);
      const selectedInsights = allDataPoints.filter(dp => dp.selectedForNotes);
      
      if (selectedInsights.length === 0) {
        return res.status(400).json({ error: "No insights selected for discovery questions" });
      }

      // Group by capability
      const capabilityGroups = new Map<string, typeof selectedInsights>();
      for (const insight of selectedInsights) {
        if (insight.relevantCapability) {
          const existing = capabilityGroups.get(insight.relevantCapability) || [];
          existing.push(insight);
          capabilityGroups.set(insight.relevantCapability, existing);
        }
      }

      if (capabilityGroups.size === 0) {
        return res.status(400).json({ error: "Selected insights must have capability classification" });
      }

      // Prepare input for AI
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
              purpose: q.purpose,
              relatedKPI: q.relatedKPI,
              answer: null,
              isTemplate: false,
              sortOrder: sortOrder++
            });
            savedQuestions.push(await storage.createDiscoveryQuestion(validated));
          } catch (validationError: any) {
            console.error("Invalid question from AI:", validationError.message, q);
          }
        }
      }

      res.json({
        questions: savedQuestions,
        summary: `Generated ${savedQuestions.length} discovery questions across ${capabilityGroups.size} capabilities`
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
        
        const capabilityGroups = new Map<string, { insights: any[], questions: any[] }>();
        
        // Group insights by capability
        insights.forEach(insight => {
          if (insight.relevantCapability) {
            if (!capabilityGroups.has(insight.relevantCapability)) {
              capabilityGroups.set(insight.relevantCapability, { insights: [], questions: [] });
            }
            capabilityGroups.get(insight.relevantCapability)!.insights.push(insight);
          }
        });
        
        // Group questions by capability
        questions.forEach(question => {
          if (question.capabilityName) {
            if (!capabilityGroups.has(question.capabilityName)) {
              capabilityGroups.set(question.capabilityName, { insights: [], questions: [] });
            }
            capabilityGroups.get(question.capabilityName)!.questions.push(question);
          }
        });
        
        // Create job themes from capability groups
        for (const [capabilityName, data] of Array.from(capabilityGroups.entries())) {
          const { getCapabilityMetadata, getSolutionAreaForCapability } = await import("@shared/knowledge");
          const capability = getCapabilityMetadata(capabilityName);
          const solutionArea = getSolutionAreaForCapability(capabilityName);
          
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
              compositeScore: avgScore,
              evidenceCount: data.insights.length + data.questions.length
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
          }
        }
        
        // Fetch the newly created themes
        jobThemes = await storage.getJobThemes(projectId);
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

  // Update job theme prioritization (set top 3)
  app.post("/api/projects/:projectId/job-themes/prioritize", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Validate request body with Zod schema (enforces top-3 constraint)
      const validated = prioritizeJobsRequestSchema.parse(req.body);
      const { prioritizedIds } = validated;
      
      // Clear existing priorities
      const allThemes = await storage.getJobThemes(projectId);
      for (const theme of allThemes) {
        await storage.updateJobTheme(theme.id, { priorityRank: null });
      }
      
      // Set new priorities
      for (let i = 0; i < prioritizedIds.length; i++) {
        await storage.updateJobTheme(prioritizedIds[i], { priorityRank: i + 1 });
      }
      
      const updatedThemes = await storage.getJobThemes(projectId);
      res.json(updatedThemes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update KPI selection and baseline data
  app.patch("/api/job-theme-kpis/:kpiId", async (req, res) => {
    try {
      const kpiId = parseInt(req.params.kpiId);
      
      // Validate request body with Zod schema
      const validated = updateJobThemeKPIRequestSchema.parse(req.body);
      
      const updated = await storage.updateJobThemeKPI(kpiId, validated);
      
      if (!updated) {
        return res.status(404).json({ error: "KPI not found" });
      }
      
      res.json(updated);
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
      
      res.json(benchmark);
    } catch (error: any) {
      console.error("Error generating AI benchmark:", error);
      res.status(500).json({ error: error.message || "Failed to generate benchmark" });
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
      const prioritized = jobThemes
        .filter(t => t.priorityRank !== null)
        .sort((a, b) => (a.priorityRank || 999) - (b.priorityRank || 999));
      
      if (prioritized.length === 0) {
        return res.status(400).json({ error: "No job themes have been prioritized" });
      }
      
      // Check if already finalized (idempotent - return existing transfer)
      let transfer = await storage.getDiscoveryPhaseTransfer(projectId);
      
      if (transfer && transfer.isFinalized) {
        return res.json(transfer);
      }
      
      // Create or update transfer record
      if (transfer) {
        transfer = await storage.updateDiscoveryPhaseTransfer(transfer.id, {
          isFinalized: true,
          finalizedJobThemeIds: prioritized.map(t => t.id),
          transferredAt: new Date()
        });
      } else {
        transfer = await storage.createDiscoveryPhaseTransfer({
          projectId,
          isFinalized: true,
          finalizedJobThemeIds: prioritized.map(t => t.id),
          transferredAt: new Date()
        });
      }
      
      // Update project phase to alignment
      await storage.updateProject(projectId, { currentPhase: "alignment" });
      
      res.json(transfer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get finalized discovery data for Alignment page
  app.get("/api/projects/:projectId/alignment/finalized-jobs", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Get discovery phase transfer
      const transfer = await storage.getDiscoveryPhaseTransfer(projectId);
      
      if (!transfer || !transfer.isFinalized) {
        return res.json({ finalized: false, jobs: [] });
      }
      
      // Get finalized job themes with KPIs
      const finalizedJobIds = transfer.finalizedJobThemeIds || [];
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
}
