import type { Express } from "express";
import { storage } from "./storage";
import { researchCompany, followUpResearch, generateDiscoveryQuestions } from "./ai";
import { z } from "zod";
import { 
  insertProjectSchema,
  insertCompanyDataPointSchema,
  insertHeadlineSchema,
  insertDiscoveryNotesSchema,
  insertValueHypothesisSchema,
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
  insertAttachmentSchema
} from "@shared/schema";

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
      const project = await storage.createProject(validated);
      res.json(project);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const validated = insertProjectSchema.partial().parse(req.body);
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

  // Value Hypotheses
  app.get("/api/projects/:projectId/value-hypotheses", async (req, res) => {
    try {
      const hypotheses = await storage.getValueHypotheses(parseInt(req.params.projectId));
      res.json(hypotheses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/value-hypotheses/:id", async (req, res) => {
    try {
      const hypothesis = await storage.getValueHypothesis(parseInt(req.params.id));
      if (!hypothesis) {
        return res.status(404).json({ error: "Value hypothesis not found" });
      }
      res.json(hypothesis);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/projects/:projectId/value-hypotheses", async (req, res) => {
    try {
      const validated = insertValueHypothesisSchema.parse({
        ...req.body,
        projectId: parseInt(req.params.projectId)
      });
      const hypothesis = await storage.createValueHypothesis(validated);
      res.json(hypothesis);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/value-hypotheses/:id", async (req, res) => {
    try {
      const validated = insertValueHypothesisSchema.partial().parse(req.body);
      const hypothesis = await storage.updateValueHypothesis(parseInt(req.params.id), validated);
      if (!hypothesis) {
        return res.status(404).json({ error: "Value hypothesis not found" });
      }
      res.json(hypothesis);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/value-hypotheses/:id", async (req, res) => {
    try {
      await storage.deleteValueHypothesis(parseInt(req.params.id));
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
}
