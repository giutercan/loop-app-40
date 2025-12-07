import { storage } from "./storage";
import type { 
  Account, Project, JobTheme, JobThemeKPI, KPIActual,
  DiscoveryQuestion, StrategicPillar, InsertJobThemeKPI,
  InsertDiscoveryNotes, ToolCapability, NavigationCommand, 
  Recommendation, CompanionTask, EntityReference, CompanionSessionState
} from "@shared/schema";
import { generateDiscoveryQuestions, generateKPIRecommendations, generateBusinessReviewAgenda, openai } from "./ai";

// Helper function for robust HTML/script sanitization (mirrors routes.ts)
function sanitizeInput(input: string): string {
  let sanitized = input;
  
  // Remove script tags and their entire content
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

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  navigationCommand?: NavigationCommand;
  recommendations?: Recommendation[];
  taskProgress?: CompanionTask;
}

export interface CompanionContext {
  accountId?: number;
  projectId?: number;
  userId?: string;
  currentPage?: string;
  sessionState?: CompanionSessionState;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  capability: ToolCapability;
  requiresConfirmation?: boolean;
  requiredContext?: string[];
}

// Helper to check if a tool requires confirmation based on capability
export function toolRequiresConfirmation(capability: ToolCapability): boolean {
  return capability === "write" || capability === "edit" || capability === "workflow";
}

// Helper to check if a tool is read-only (for backward compatibility)
export function isReadOnlyTool(toolName: string): boolean {
  const tool = companionToolDefinitions.find(t => t.name === toolName);
  return tool?.capability === "read" || tool?.capability === "navigate";
}

export const companionToolDefinitions: ToolDefinition[] = [
  // ============================================================================
  // READ TOOLS - Fetch and display data
  // ============================================================================
  {
    name: "getAccountSummary",
    description: "Get a comprehensive summary of an account including all initiatives, KPIs, health metrics, and team members. Use this when the user asks for an overview of an account or client.",
    parameters: {
      type: "object",
      properties: {
        accountId: { type: "number", description: "The account ID to summarize" }
      },
      required: ["accountId"]
    },
    capability: "read"
  },
  {
    name: "getInitiativeSummary",
    description: "Get detailed information about a specific initiative/project including its phase, KPIs, job themes, and progress. Use this when user asks about a specific engagement or project.",
    parameters: {
      type: "object",
      properties: {
        projectId: { type: "number", description: "The project/initiative ID" }
      },
      required: ["projectId"]
    },
    capability: "read"
  },
  {
    name: "listKPIs",
    description: "List all KPIs for a project with their current values, targets, and health status. Use when user wants to see KPI performance or track progress.",
    parameters: {
      type: "object",
      properties: {
        projectId: { type: "number", description: "The project ID to list KPIs for" }
      },
      required: ["projectId"]
    },
    capability: "read"
  },
  {
    name: "prepareMeetingBundle",
    description: "Generate a comprehensive meeting prep bundle including discovery questions, talking points, key insights, and suggested agenda. Use when user is preparing for a client call or meeting.",
    parameters: {
      type: "object",
      properties: {
        projectId: { type: "number", description: "The project ID" },
        meetingType: { 
          type: "string", 
          enum: ["discovery", "alignment", "qbr", "general"],
          description: "Type of meeting to prepare for"
        },
        contactName: { type: "string", description: "Name of the person they're meeting with (optional)" }
      },
      required: ["projectId"]
    },
    capability: "read"
  },
  {
    name: "listAccounts",
    description: "List all accounts/clients. Use when user asks which accounts they have or wants to select one to work with.",
    parameters: {
      type: "object",
      properties: {}
    },
    capability: "read"
  },
  {
    name: "listInitiatives",
    description: "List all initiatives/projects for an account. Use when user asks about projects under a specific client.",
    parameters: {
      type: "object",
      properties: {
        accountId: { type: "number", description: "The account ID to list initiatives for" }
      },
      required: ["accountId"]
    },
    capability: "read"
  },
  {
    name: "listJobThemes",
    description: "List all job themes/priorities for a project. Use when user asks about priorities or themes for an initiative.",
    parameters: {
      type: "object",
      properties: {
        projectId: { type: "number", description: "The project ID to list job themes for" }
      },
      required: ["projectId"]
    },
    capability: "read"
  },
  
  // ============================================================================
  // WRITE TOOLS - Create new records
  // ============================================================================
  {
    name: "createKPI",
    description: "Create a new KPI for tracking value in a job theme. Use when user wants to add a new metric or KPI to track.",
    parameters: {
      type: "object",
      properties: {
        jobThemeId: { type: "number", description: "The job theme to add the KPI to" },
        kpiName: { type: "string", description: "Name of the KPI" },
        kpiType: { type: "string", enum: ["primary", "supporting"], description: "Whether this is a primary or supporting KPI" },
        unit: { type: "string", description: "Unit of measurement (e.g., %, $, count)" },
        baselineValue: { type: "string", description: "Current baseline value" },
        targetValue: { type: "string", description: "Target value to achieve" },
        estimatedValuePerUnit: { type: "number", description: "Estimated dollar value per unit improvement (optional)" }
      },
      required: ["jobThemeId", "kpiName", "unit"]
    },
    capability: "write",
    requiresConfirmation: true
  },
  {
    name: "addDiscoveryNote",
    description: "Add a note or insight from a discovery conversation. Use when user shares information from a client conversation that should be captured.",
    parameters: {
      type: "object",
      properties: {
        projectId: { type: "number", description: "The project ID" },
        noteContent: { type: "string", description: "The note or insight to add" },
        category: { 
          type: "string", 
          enum: ["pain_point", "opportunity", "insight", "quote", "action_item"],
          description: "Category of the note"
        }
      },
      required: ["projectId", "noteContent"]
    },
    capability: "write",
    requiresConfirmation: true
  },
  {
    name: "generateValueCase",
    description: "Generate an AI-powered value case narrative for a specific job theme or KPI. Use when user needs help articulating the business value.",
    parameters: {
      type: "object",
      properties: {
        projectId: { type: "number", description: "The project ID" },
        jobThemeId: { type: "number", description: "The job theme to generate value case for" },
        audience: { 
          type: "string", 
          enum: ["ceo", "cfo", "chro", "general"],
          description: "Target audience for the value narrative"
        }
      },
      required: ["projectId", "jobThemeId"]
    },
    capability: "write",
    requiresConfirmation: true
  },
  
  // ============================================================================
  // EDIT TOOLS - Modify existing records inline
  // ============================================================================
  {
    name: "editKPI",
    description: "Edit an existing KPI's name, targets, baseline, or value per unit. Use when user wants to modify an existing KPI's properties.",
    parameters: {
      type: "object",
      properties: {
        kpiId: { type: "number", description: "The KPI ID to edit" },
        kpiName: { type: "string", description: "New name for the KPI (optional)" },
        targetValue: { type: "string", description: "New target value (optional)" },
        baselineValue: { type: "string", description: "New baseline value (optional)" },
        estimatedValuePerUnit: { type: "number", description: "New estimated value per unit (optional)" },
        unit: { type: "string", description: "New unit of measurement (optional)" }
      },
      required: ["kpiId"]
    },
    capability: "edit",
    requiresConfirmation: true
  },
  {
    name: "editJobTheme",
    description: "Edit an existing job theme's name, priority rank, or pillar assignment. Use when user wants to modify a priority or job theme.",
    parameters: {
      type: "object",
      properties: {
        jobThemeId: { type: "number", description: "The job theme ID to edit" },
        jobName: { type: "string", description: "New name for the job theme (optional)" },
        priorityRank: { type: "number", description: "New priority ranking (optional)" },
        strategicPillarId: { type: "number", description: "ID of strategic pillar to assign (optional)" }
      },
      required: ["jobThemeId"]
    },
    capability: "edit",
    requiresConfirmation: true
  },
  {
    name: "editAccount",
    description: "Edit an account's name, industry, tier, or strategy notes. Use when user wants to update account information.",
    parameters: {
      type: "object",
      properties: {
        accountId: { type: "number", description: "The account ID to edit" },
        name: { type: "string", description: "New account name (optional)" },
        industry: { type: "string", description: "New industry classification (optional)" },
        tier: { type: "string", enum: ["enterprise", "strategic", "growth"], description: "New account tier (optional)" },
        strategyNotes: { type: "string", description: "New strategy notes (optional)" }
      },
      required: ["accountId"]
    },
    capability: "edit",
    requiresConfirmation: true
  },
  {
    name: "updateKPI",
    description: "Update an existing KPI's target, baseline, or record a new actual value. Use when user wants to log KPI progress.",
    parameters: {
      type: "object",
      properties: {
        kpiId: { type: "number", description: "The KPI ID to update" },
        targetValue: { type: "string", description: "New target value (optional)" },
        baselineValue: { type: "string", description: "New baseline value (optional)" },
        actualValue: { type: "string", description: "Record a new actual value (optional)" },
        notes: { type: "string", description: "Notes about the update (optional)" }
      },
      required: ["kpiId"]
    },
    capability: "edit",
    requiresConfirmation: true
  },
  
  // ============================================================================
  // RECOMMEND TOOLS - AI-powered suggestions with rationale
  // ============================================================================
  {
    name: "recommendNextAction",
    description: "Analyze the current state of an account or initiative and recommend the most impactful next actions. Use when user asks what they should focus on or needs guidance.",
    parameters: {
      type: "object",
      properties: {
        accountId: { type: "number", description: "Account ID (optional if projectId provided)" },
        projectId: { type: "number", description: "Project ID (optional if accountId provided)" }
      }
    },
    capability: "recommend"
  },
  {
    name: "recommendKPIs",
    description: "Suggest relevant KPIs based on the project's context, industry, and job themes. Returns ranked recommendations with rationale.",
    parameters: {
      type: "object",
      properties: {
        projectId: { type: "number", description: "The project ID to recommend KPIs for" },
        jobThemeId: { type: "number", description: "Specific job theme to focus recommendations on (optional)" },
        count: { type: "number", description: "Number of recommendations to return (default: 5)" }
      },
      required: ["projectId"]
    },
    capability: "recommend"
  },
  {
    name: "recommendQuestions",
    description: "Suggest discovery questions based on the conversation context and project phase. Returns methodology-tagged questions with expected outcomes.",
    parameters: {
      type: "object",
      properties: {
        projectId: { type: "number", description: "The project ID" },
        methodology: { type: "string", enum: ["spin", "miller_heiman", "pss", "any"], description: "Sales methodology to filter by (optional)" },
        topic: { type: "string", description: "Specific topic or area to focus questions on (optional)" },
        count: { type: "number", description: "Number of questions to return (default: 5)" }
      },
      required: ["projectId"]
    },
    capability: "recommend"
  },
  {
    name: "recommendSuccessStories",
    description: "Find relevant success stories from the library that match the current project's context, industry, or KPIs.",
    parameters: {
      type: "object",
      properties: {
        projectId: { type: "number", description: "The project ID to find matching stories for" },
        industry: { type: "string", description: "Filter by industry (optional)" },
        valuePillar: { type: "string", enum: ["grow", "optimise", "de_risk", "strengthen"], description: "Filter by value pillar (optional)" }
      },
      required: ["projectId"]
    },
    capability: "recommend"
  },
  
  // ============================================================================
  // WORKFLOW TOOLS - Multi-step orchestrated actions
  // ============================================================================
  {
    name: "runDiscoverySetup",
    description: "Set up a complete discovery session: runs AI research, generates discovery questions, creates initial job themes, and prepares a meeting bundle. Use when user wants to quickly prepare for a new client engagement.",
    parameters: {
      type: "object",
      properties: {
        projectId: { type: "number", description: "The project ID to set up discovery for" },
        focusAreas: { type: "array", items: { type: "string" }, description: "Specific areas to focus the discovery on (optional)" }
      },
      required: ["projectId"]
    },
    capability: "workflow",
    requiresConfirmation: true
  },
  {
    name: "runQBRPrep",
    description: "Prepare a complete Quarterly Business Review: compiles KPI progress, generates executive summary, identifies highlights and risks, and creates agenda. Use when user is preparing for a client QBR.",
    parameters: {
      type: "object",
      properties: {
        projectId: { type: "number", description: "The project ID" },
        reviewPeriod: { type: "string", description: "Time period for the review (e.g., 'Q4 2024')" },
        audience: { type: "string", enum: ["executive", "working_team", "mixed"], description: "Target audience for the QBR" }
      },
      required: ["projectId"]
    },
    capability: "workflow",
    requiresConfirmation: true
  },
  {
    name: "runHandoffBundle",
    description: "Create a complete handoff package: selects confirmed commitments, generates CSM briefing, compiles key context, and prepares onboarding materials. Use when handing off an account to delivery or CSM.",
    parameters: {
      type: "object",
      properties: {
        projectId: { type: "number", description: "The project ID" },
        recipientRole: { type: "string", enum: ["csm", "delivery", "consultant"], description: "Role receiving the handoff" },
        includeFullHistory: { type: "boolean", description: "Include complete conversation and note history" }
      },
      required: ["projectId", "recipientRole"]
    },
    capability: "workflow",
    requiresConfirmation: true
  },
  
  // ============================================================================
  // NAVIGATE TOOLS - Guide user through the application
  // ============================================================================
  {
    name: "navigateTo",
    description: "Navigate the user to a specific page, highlight an element, open a dialog, or scroll to a section. Use to guide users through the application based on conversation context.",
    parameters: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["navigate", "highlight", "openDialog", "scrollTo", "focus"], description: "Type of navigation action" },
        path: { type: "string", description: "Page path to navigate to (for navigate action)" },
        elementId: { type: "string", description: "Element ID to highlight, scroll to, or focus (optional)" },
        dialogType: { type: "string", description: "Type of dialog to open (optional)" },
        dialogProps: { type: "object", description: "Props to pass to the dialog (optional)" },
        description: { type: "string", description: "Brief description of what the user will see" }
      },
      required: ["action"]
    },
    capability: "navigate"
  },
  {
    name: "showInContext",
    description: "Display relevant information inline in the chat without navigating away. Use to surface quick insights, KPI cards, or entity summaries.",
    parameters: {
      type: "object",
      properties: {
        entityType: { type: "string", enum: ["account", "project", "kpi", "jobTheme", "successStory"], description: "Type of entity to show" },
        entityId: { type: "number", description: "ID of the entity" },
        displayMode: { type: "string", enum: ["card", "summary", "details"], description: "How to display the information" }
      },
      required: ["entityType", "entityId"]
    },
    capability: "navigate"
  }
];

export async function executeCompanionTool(
  toolName: string, 
  args: Record<string, any>,
  context: CompanionContext
): Promise<ToolResult> {
  try {
    switch (toolName) {
      case "getAccountSummary":
        return await getAccountSummary(args.accountId);
      
      case "getInitiativeSummary":
        return await getInitiativeSummary(args.projectId);
      
      case "listKPIs":
        return await listKPIs(args.projectId);
      
      case "prepareMeetingBundle":
        return await prepareMeetingBundle(args.projectId, args.meetingType, args.contactName);
      
      case "recommendNextAction":
        return await recommendNextAction(args.accountId, args.projectId);
      
      case "createKPI":
        return await createKPI(args);
      
      case "updateKPI":
        return await updateKPI(args);
      
      case "addDiscoveryNote":
        return await addDiscoveryNote(args.projectId, args.noteContent, args.category);
      
      case "generateValueCase":
        return await generateValueCase(args.projectId, args.jobThemeId, args.audience);
      
      case "navigateToPage":
        return { success: true, data: { navigate: args.path, description: args.description } };
      
      case "listAccounts":
        return await listAccounts();
      
      case "listInitiatives":
        return await listInitiatives(args.accountId);
      
      default:
        return { success: false, error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    console.error(`Tool execution error (${toolName}):`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

async function getAccountSummary(accountId: number): Promise<ToolResult> {
  const accountHub = await storage.getAccountHub(accountId);
  if (!accountHub) {
    return { success: false, error: "Account not found" };
  }
  
  return {
    success: true,
    data: {
      account: accountHub.account,
      initiativeCount: accountHub.initiatives.length,
      initiatives: accountHub.initiatives.map(i => ({
        id: i.id,
        name: i.name,
        phase: i.currentPhase,
        status: i.status,
        ragStatus: i.ragStatus,
        kpiCount: i.kpiCount,
        kpisOnTrack: i.kpisOnTrack,
        kpisAtRisk: i.kpisAtRisk
      })),
      headlineValue: accountHub.headlineValue,
      openIssues: accountHub.issues.filter(i => i.status === "open").length,
      teamMembers: accountHub.teamRoles.length
    }
  };
}

async function getInitiativeSummary(projectId: number): Promise<ToolResult> {
  const project = await storage.getProject(projectId);
  if (!project) {
    return { success: false, error: "Initiative not found" };
  }
  
  const jobThemes = await storage.getJobThemes(projectId);
  const kpis = await storage.getAllJobThemeKPIsForProject(projectId);
  const pillars = await storage.getStrategicPillars(projectId);
  
  return {
    success: true,
    data: {
      initiative: {
        id: project.id,
        name: project.name,
        company: project.companyName,
        phase: project.currentPhase,
        lifecyclePhase: project.lifecyclePhase,
        status: project.status,
        ragStatus: project.ragStatus,
        owner: project.initiativeOwner,
        clientLead: project.clientLead,
        startDate: project.startDate,
        targetEndDate: project.targetEndDate
      },
      jobThemes: jobThemes.map(t => ({
        id: t.id,
        name: t.jobName,
        priority: t.priorityRank
      })),
      kpiCount: kpis.length,
      strategicPillars: pillars.map(p => ({ id: p.id, name: p.name }))
    }
  };
}

async function listKPIs(projectId: number): Promise<ToolResult> {
  const kpis = await storage.getAllJobThemeKPIsForProject(projectId);
  const actuals = await storage.getAllKPIActualsForProject(projectId);
  
  const actualsMap = new Map<number, typeof actuals[0]>();
  actuals.forEach(a => {
    if (!actualsMap.has(a.jobThemeKPIId) || 
        new Date(a.actualDate!) > new Date(actualsMap.get(a.jobThemeKPIId)!.actualDate!)) {
      actualsMap.set(a.jobThemeKPIId, a);
    }
  });
  
  return {
    success: true,
    data: kpis.map(kpi => {
      const latestActual = actualsMap.get(kpi.id);
      return {
        id: kpi.id,
        name: kpi.kpiName,
        type: kpi.kpiType,
        unit: kpi.unit,
        baseline: kpi.baselineValue,
        target: kpi.targetValue,
        latestActual: latestActual?.actualValue,
        latestActualDate: latestActual?.actualDate,
        estimatedValue: kpi.estimatedValuePerUnit
      };
    })
  };
}

async function prepareMeetingBundle(
  projectId: number, 
  meetingType?: string,
  contactName?: string
): Promise<ToolResult> {
  const project = await storage.getProject(projectId);
  if (!project) {
    return { success: false, error: "Project not found" };
  }
  
  const questions = await storage.getDiscoveryQuestions(projectId);
  const notes = await storage.getDiscoveryNotes(projectId);
  const jobThemes = await storage.getJobThemes(projectId);
  const kpis = await storage.getAllJobThemeKPIsForProject(projectId);
  
  const unansweredQuestions = questions.filter(q => !q.isAsked);
  
  return {
    success: true,
    data: {
      meetingContext: {
        company: project.companyName,
        initiative: project.name,
        phase: project.currentPhase,
        contact: contactName,
        meetingType: meetingType || "general"
      },
      suggestedQuestions: unansweredQuestions.slice(0, 5).map(q => ({
        question: q.question,
        methodology: q.methodology,
        purpose: q.purpose
      })),
      keyThemes: jobThemes.slice(0, 3).map(t => t.jobName),
      kpiSnapshot: kpis.slice(0, 3).map(k => ({
        name: k.kpiName,
        baseline: k.baselineValue,
        target: k.targetValue
      })),
      previousNotes: notes?.freeformNotes?.substring(0, 500) || null,
      talkingPoints: [
        `Review progress on ${project.name}`,
        jobThemes.length > 0 ? `Discuss priorities around ${jobThemes[0]?.jobName}` : "Identify key priorities",
        kpis.length > 0 ? `Review KPI targets and progress` : "Establish measurable outcomes"
      ]
    }
  };
}

async function recommendNextAction(accountId?: number, projectId?: number): Promise<ToolResult> {
  const recommendations: string[] = [];
  
  if (projectId) {
    const project = await storage.getProject(projectId);
    if (!project) {
      return { success: false, error: "Project not found" };
    }
    
    const jobThemes = await storage.getJobThemes(projectId);
    const kpis = await storage.getAllJobThemeKPIsForProject(projectId);
    const questions = await storage.getDiscoveryQuestions(projectId);
    
    if (project.currentPhase === "discovery") {
      if (jobThemes.length === 0) {
        recommendations.push("Run AI discovery to identify key job themes and priorities");
      }
      const unanswered = questions.filter(q => !q.isAsked).length;
      if (unanswered > 5) {
        recommendations.push(`You have ${unanswered} discovery questions ready - schedule a client call`);
      }
    }
    
    if (project.currentPhase === "alignment") {
      if (kpis.length === 0) {
        recommendations.push("Define KPIs for your identified job themes");
      }
      const missingTargets = kpis.filter(k => !k.targetValue).length;
      if (missingTargets > 0) {
        recommendations.push(`Set target values for ${missingTargets} KPIs`);
      }
    }
    
    if (project.currentPhase === "realisation") {
      const actuals = await storage.getAllKPIActualsForProject(projectId);
      if (actuals.length === 0) {
        recommendations.push("Start tracking KPI progress by logging actual values");
      }
    }
    
    if (recommendations.length === 0) {
      recommendations.push("Great progress! Consider scheduling a business review with the client");
    }
  } else if (accountId) {
    const accountHub = await storage.getAccountHub(accountId);
    if (!accountHub) {
      return { success: false, error: "Account not found" };
    }
    
    if (accountHub.initiatives.length === 0) {
      recommendations.push("Create your first initiative for this account");
    }
    
    const atRiskKpis = accountHub.headlineValue.kpisAtRisk;
    if (atRiskKpis > 0) {
      recommendations.push(`Address ${atRiskKpis} at-risk KPIs to improve account health`);
    }
    
    const openIssues = accountHub.issues.filter(i => i.status === "open");
    if (openIssues.length > 0) {
      recommendations.push(`Review and address ${openIssues.length} open issues`);
    }
  }
  
  return {
    success: true,
    data: {
      recommendations,
      priority: recommendations[0] || "Continue current work"
    }
  };
}

async function createKPI(args: {
  jobThemeId: number;
  kpiName: string;
  kpiType?: string;
  unit: string;
  baselineValue?: string;
  targetValue?: string;
  estimatedValuePerUnit?: number;
}): Promise<ToolResult> {
  // Sanitize all user-provided text inputs
  const sanitizedKpiName = sanitizeInput(args.kpiName);
  const sanitizedUnit = sanitizeInput(args.unit);
  const sanitizedBaseline = args.baselineValue ? sanitizeInput(args.baselineValue) : null;
  const sanitizedTarget = args.targetValue ? sanitizeInput(args.targetValue) : null;
  
  if (!sanitizedKpiName || !sanitizedUnit) {
    return { success: false, error: "KPI name and unit are required" };
  }
  
  const kpiData: InsertJobThemeKPI = {
    jobThemeId: args.jobThemeId,
    kpiName: sanitizedKpiName,
    kpiType: (args.kpiType as "primary" | "supporting") || "primary",
    unit: sanitizedUnit,
    baselineValue: sanitizedBaseline,
    targetValue: sanitizedTarget,
    estimatedValuePerUnit: args.estimatedValuePerUnit || null
  };
  
  return {
    success: true,
    requiresConfirmation: true,
    confirmationMessage: `Create KPI "${args.kpiName}" (${args.unit}) with baseline: ${args.baselineValue || 'TBD'} and target: ${args.targetValue || 'TBD'}?`,
    data: { action: "createKPI", payload: kpiData }
  };
}

async function updateKPI(args: {
  kpiId: number;
  targetValue?: string;
  baselineValue?: string;
  actualValue?: string;
  notes?: string;
}): Promise<ToolResult> {
  const existingKpi = await storage.getJobThemeKPI(args.kpiId);
  if (!existingKpi) {
    return { success: false, error: "KPI not found" };
  }
  
  // Sanitize all user-provided text inputs
  const sanitizedTarget = args.targetValue ? sanitizeInput(args.targetValue) : undefined;
  const sanitizedBaseline = args.baselineValue ? sanitizeInput(args.baselineValue) : undefined;
  const sanitizedActual = args.actualValue ? sanitizeInput(args.actualValue) : undefined;
  const sanitizedNotes = args.notes ? sanitizeInput(args.notes) : undefined;
  
  const updates: any = {};
  if (sanitizedTarget) updates.targetValue = sanitizedTarget;
  if (sanitizedBaseline) updates.baselineValue = sanitizedBaseline;
  
  const confirmParts: string[] = [];
  if (sanitizedTarget) confirmParts.push(`target to ${sanitizedTarget}`);
  if (sanitizedBaseline) confirmParts.push(`baseline to ${sanitizedBaseline}`);
  if (sanitizedActual) confirmParts.push(`record actual value ${sanitizedActual}`);
  
  return {
    success: true,
    requiresConfirmation: true,
    confirmationMessage: `Update "${existingKpi.kpiName}": ${confirmParts.join(", ")}?`,
    data: { 
      action: "updateKPI", 
      kpiId: args.kpiId,
      updates,
      newActual: sanitizedActual ? { actualValue: sanitizedActual, notes: sanitizedNotes } : null
    }
  };
}

async function addDiscoveryNote(
  projectId: number, 
  noteContent: string,
  category?: string
): Promise<ToolResult> {
  // Sanitize user-provided text input
  const sanitizedNoteContent = sanitizeInput(noteContent);
  
  if (!sanitizedNoteContent) {
    return { success: false, error: "Note content is required" };
  }
  
  const existing = await storage.getDiscoveryNotes(projectId);
  const timestamp = new Date().toISOString();
  const formattedNote = `[${timestamp}] ${category ? `(${category}) ` : ''}${sanitizedNoteContent}`;
  
  const newNotes = existing?.freeformNotes 
    ? `${existing.freeformNotes}\n\n${formattedNote}`
    : formattedNote;
  
  return {
    success: true,
    requiresConfirmation: true,
    confirmationMessage: `Add note to discovery: "${sanitizedNoteContent.substring(0, 100)}${sanitizedNoteContent.length > 100 ? '...' : ''}"?`,
    data: {
      action: "addDiscoveryNote",
      projectId,
      notes: { projectId, freeformNotes: newNotes } as InsertDiscoveryNotes
    }
  };
}

async function generateValueCase(
  projectId: number,
  jobThemeId: number,
  audience?: string
): Promise<ToolResult> {
  const project = await storage.getProject(projectId);
  const jobTheme = await storage.getJobTheme(jobThemeId);
  const kpis = await storage.getJobThemeKPIs(jobThemeId);
  
  if (!project || !jobTheme) {
    return { success: false, error: "Project or job theme not found" };
  }
  
  return {
    success: true,
    data: {
      needsAIGeneration: true,
      context: {
        company: project.companyName,
        initiative: project.name,
        theme: jobTheme.jobName,
        audience: audience || "general",
        kpis: kpis.map(k => ({
          name: k.kpiName,
          baseline: k.baselineValue,
          target: k.targetValue,
          value: k.estimatedValuePerUnit
        }))
      }
    }
  };
}

async function listAccounts(): Promise<ToolResult> {
  const accounts = await storage.getAccounts();
  return {
    success: true,
    data: accounts.map(a => ({
      id: a.id,
      name: a.name,
      industry: a.industry,
      tier: a.tier,
      healthScore: a.healthScore,
      status: a.status
    }))
  };
}

async function listInitiatives(accountId: number): Promise<ToolResult> {
  const initiatives = await storage.getInitiativesForAccount(accountId);
  return {
    success: true,
    data: initiatives.map(i => ({
      id: i.id,
      name: i.name,
      phase: i.currentPhase,
      status: i.status,
      ragStatus: i.ragStatus
    }))
  };
}

export async function confirmAndExecuteAction(
  action: string,
  payload: any
): Promise<ToolResult> {
  try {
    switch (action) {
      case "createKPI":
        // Payload is already sanitized in createKPI tool
        const newKpi = await storage.createJobThemeKPI(payload);
        return { success: true, data: { created: newKpi } };
      
      case "updateKPI":
        // Re-sanitize updates to ensure no bypassing
        if (payload.updates && Object.keys(payload.updates).length > 0) {
          const safeUpdates: any = {};
          if (payload.updates.targetValue) {
            safeUpdates.targetValue = sanitizeInput(payload.updates.targetValue);
          }
          if (payload.updates.baselineValue) {
            safeUpdates.baselineValue = sanitizeInput(payload.updates.baselineValue);
          }
          if (Object.keys(safeUpdates).length > 0) {
            await storage.updateJobThemeKPI(payload.kpiId, safeUpdates);
          }
        }
        if (payload.newActual) {
          // Sanitize actualValue and notes before persistence
          const sanitizedActualValue = sanitizeInput(payload.newActual.actualValue || "");
          const sanitizedNotes = payload.newActual.notes ? sanitizeInput(payload.newActual.notes) : null;
          
          if (sanitizedActualValue) {
            await storage.createKPIActual({
              jobThemeKPIId: payload.kpiId,
              actualValue: sanitizedActualValue,
              actualDate: new Date(),
              actualSource: "ai_companion",
              notes: sanitizedNotes
            });
          }
        }
        return { success: true, data: { updated: true } };
      
      case "addDiscoveryNote":
        // Re-sanitize notes content before persistence
        if (payload.notes?.freeformNotes) {
          payload.notes.freeformNotes = sanitizeInput(payload.notes.freeformNotes);
        }
        await storage.upsertDiscoveryNotes(payload.notes);
        return { success: true, data: { added: true } };
      
      default:
        return { success: false, error: `Unknown action: ${action}` };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to execute action" 
    };
  }
}
