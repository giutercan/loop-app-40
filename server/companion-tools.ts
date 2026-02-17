import { storage } from "./storage";
import type { 
  Account, Project, JobTheme, JobThemeKPI, KPIActual,
  DiscoveryQuestion, StrategicPillar, InsertJobThemeKPI,
  InsertDiscoveryNotes, ToolCapability, NavigationCommand, 
  Recommendation, CompanionTask, EntityReference, CompanionSessionState
} from "@shared/schema";
import { generateDiscoveryQuestions, generateKPIRecommendations, generateBusinessReviewAgenda, openai, researchCompany } from "./ai";

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
    name: "createAccount",
    description: "Create a new account/client in the system. Use when user asks to add a new client or account.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "The account/company name" },
        industry: { type: "string", description: "Industry sector (optional)" },
        tier: { type: "string", enum: ["enterprise", "strategic", "growth"], description: "Account tier level (optional)" },
        strategyNotes: { type: "string", description: "Initial strategy notes (optional)" }
      },
      required: ["name"]
    },
    capability: "write",
    requiresConfirmation: true
  },
  {
    name: "createInitiative",
    description: "Create a new initiative/project under an account. Use when user asks to add a new project, initiative, or engagement.",
    parameters: {
      type: "object",
      properties: {
        accountId: { type: "number", description: "The account ID to create the initiative under" },
        name: { type: "string", description: "The initiative/project name" },
        description: { type: "string", description: "Brief description of the initiative (optional)" }
      },
      required: ["accountId", "name"]
    },
    capability: "write",
    requiresConfirmation: true
  },
  {
    name: "createInitiativeWithDiscovery",
    description: "Create a new initiative and automatically run AI-powered discovery research to pre-populate insights about the company. Use when user wants to create an initiative with AI-generated discovery data or when creating an initiative after account creation.",
    parameters: {
      type: "object",
      properties: {
        accountId: { type: "number", description: "The account ID to create the initiative under" },
        name: { type: "string", description: "The initiative/project name" },
        description: { type: "string", description: "Brief description of the initiative (optional)" },
        discoveryTheme: { type: "string", description: "Focus theme for AI research (e.g., 'leadership development', 'talent acquisition')" }
      },
      required: ["accountId", "name"]
    },
    capability: "workflow",
    requiresConfirmation: true
  },
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
  // DASHBOARD TOOLS - Control what appears on the left panel
  // ============================================================================
  {
    name: "surfaceData",
    description: `Show real-time data visualization on the left dashboard panel. ALWAYS call this tool when you have data to present visually. The tool queries actual system data and renders it on the left panel.

WHEN TO USE:
- After retrieving any data with other tools (accounts, KPIs, initiatives)
- When the user asks to see/show/display/visualize anything
- When you want to highlight specific data points from the conversation
- After completing a workflow to show results

WHEN NOT TO USE:
- When you are still gathering information and don't have real data yet
- When you are asking clarifying questions

The "view" parameter determines what data to pull from the system. Available views:
- "account_detail": Show a single account with its initiatives and KPI health (requires accountId)
- "account_list": Show all accounts with tier/industry breakdown
- "initiative_detail": Show an initiative with KPIs, phase, and progress (requires projectId)
- "kpi_health": Show KPI health dashboard for a project (requires projectId)
- "portfolio_overview": Show cross-portfolio health metrics
- "meeting_prep": Show meeting preparation data (requires projectId)
- "comparison": Compare multiple entities side by side (requires entityIds)
- "kpi_trends": Show KPI progress over time (requires projectId)
- "info_card": Show a simple information card with title and content you provide (no system query needed)

IMPORTANT: Only use "info_card" view when you want to display AI-generated content or conversation summaries. For ALL data that exists in the system, use the specific view type so real data is fetched.`,
    parameters: {
      type: "object",
      properties: {
        view: { 
          type: "string", 
          enum: ["account_detail", "account_list", "initiative_detail", "kpi_health", "portfolio_overview", "meeting_prep", "comparison", "kpi_trends", "info_card"],
          description: "What type of data visualization to show"
        },
        accountId: { type: "number", description: "Account ID (for account_detail view)" },
        projectId: { type: "number", description: "Project/initiative ID (for initiative_detail, kpi_health, meeting_prep, kpi_trends views)" },
        entityIds: { type: "array", items: { type: "number" }, description: "IDs to compare (for comparison view)" },
        entityType: { type: "string", enum: ["accounts", "initiatives", "kpis"], description: "Type of entities to compare (for comparison view)" },
        title: { type: "string", description: "Custom title for the panel (optional, defaults based on view type)" },
        infoContent: { type: "string", description: "Content for info_card view - markdown-formatted text to display" },
        infoItems: { type: "array", items: { type: "object", properties: { label: { type: "string" }, value: { type: "string" } } }, description: "Key-value pairs for info_card view" }
      },
      required: ["view"]
    },
    capability: "read"
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
      
      case "createAccount":
        return await createAccount(args as { name: string; industry?: string; tier?: string; strategyNotes?: string });
      
      case "createInitiative":
        return await createInitiative(args as { accountId: number; name: string; description?: string });
      
      case "createInitiativeWithDiscovery":
        return await createInitiativeWithDiscovery(args as { accountId: number; name: string; description?: string; discoveryTheme?: string });
      
      case "createKPI":
        return await createKPI(args as { jobThemeId: number; kpiName: string; kpiType?: string; unit: string; baselineValue?: string; targetValue?: string; estimatedValuePerUnit?: number });
      
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
      
      case "listJobThemes":
        return await listJobThemes(args.projectId);
      
      case "editKPI":
        return await editKPI(args);
      
      case "editJobTheme":
        return await editJobTheme(args);
      
      case "editAccount":
        return await editAccount(args);
      
      case "recommendKPIs":
        return await recommendKPIs(args.projectId, args.jobThemeId, args.count);
      
      case "recommendQuestions":
        return await recommendQuestions(args.projectId, args.methodology, args.topic, args.count);
      
      case "recommendSuccessStories":
        return await recommendSuccessStories(args.projectId, args.industry, args.valuePillar);
      
      case "runDiscoverySetup":
        return await runDiscoverySetup(args.projectId, args.focusAreas);
      
      case "runQBRPrep":
        return await runQBRPrep(args.projectId, args.reviewPeriod, args.audience);
      
      case "runHandoffBundle":
        return await runHandoffBundle(args.projectId, args.recipientRole, args.includeFullHistory);
      
      case "navigateTo":
        return await navigateTo(args);
      
      case "showInContext":
        return await showInContext(args.entityType, args.entityId, args.displayMode);
      
      case "surfaceData":
        return await executeSurfaceData(args);
      
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

async function createAccount(args: {
  name: string;
  industry?: string;
  tier?: string;
  strategyNotes?: string;
}): Promise<ToolResult> {
  const sanitizedName = sanitizeInput(args.name);
  if (!sanitizedName) {
    return { success: false, error: "Account name is required" };
  }
  
  const sanitizedIndustry = args.industry ? sanitizeInput(args.industry) : "";
  
  const accountData = {
    name: sanitizedName,
    industry: sanitizedIndustry,
    tier: (args.tier as "enterprise" | "strategic" | "growth") || null,
    strategyNotes: args.strategyNotes ? sanitizeInput(args.strategyNotes) : null
  };
  
  return {
    success: true,
    requiresConfirmation: true,
    confirmationMessage: `Create new account "${sanitizedName}"${sanitizedIndustry ? ` in ${sanitizedIndustry}` : ""}?`,
    data: {
      action: "createAccount",
      payload: accountData,
      preview: `Account: ${sanitizedName}${args.tier ? ` (${args.tier})` : ""}`,
      suggestInitiativeCreation: true,
      accountName: sanitizedName,
      accountIndustry: sanitizedIndustry
    }
  };
}

async function createInitiative(args: {
  accountId: number;
  name: string;
  description?: string;
}): Promise<ToolResult> {
  const sanitizedName = sanitizeInput(args.name);
  if (!sanitizedName) {
    return { success: false, error: "Initiative name is required" };
  }
  
  const account = await storage.getAccount(args.accountId);
  if (!account) {
    return { success: false, error: "Account not found" };
  }
  
  const initiativeData = {
    accountId: args.accountId,
    name: sanitizedName,
    description: args.description ? sanitizeInput(args.description) : null,
    status: "active",
    currentPhase: "discovery"
  };
  
  return {
    success: true,
    requiresConfirmation: true,
    confirmationMessage: `Create new initiative "${sanitizedName}" under account "${account.name}"?`,
    data: {
      action: "createInitiative",
      payload: initiativeData,
      preview: `Initiative: ${sanitizedName} (under ${account.name})`
    }
  };
}

async function createInitiativeWithDiscovery(args: {
  accountId: number;
  name: string;
  description?: string;
  discoveryTheme?: string;
}): Promise<ToolResult> {
  const sanitizedName = sanitizeInput(args.name);
  if (!sanitizedName) {
    return { success: false, error: "Initiative name is required" };
  }
  
  const account = await storage.getAccount(args.accountId);
  if (!account) {
    return { success: false, error: "Account not found" };
  }
  
  const initiativeData = {
    accountId: args.accountId,
    name: sanitizedName,
    description: args.description ? sanitizeInput(args.description) : null,
    status: "active",
    currentPhase: "discovery"
  };
  
  const discoveryTheme = args.discoveryTheme ? sanitizeInput(args.discoveryTheme) : null;
  
  return {
    success: true,
    requiresConfirmation: true,
    confirmationMessage: `Create initiative "${sanitizedName}" under "${account.name}" and run AI discovery research${discoveryTheme ? ` focused on ${discoveryTheme}` : ''}? This will automatically populate insights about the company.`,
    data: {
      action: "createInitiativeWithDiscovery",
      payload: initiativeData,
      accountName: account.name,
      accountIndustry: account.industry,
      discoveryTheme,
      preview: `Initiative: ${sanitizedName} (under ${account.name}) + AI Discovery`
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

async function listJobThemes(projectId: number): Promise<ToolResult> {
  const jobThemes = await storage.getJobThemes(projectId);
  return {
    success: true,
    data: jobThemes.map(t => ({
      id: t.id,
      name: t.jobName,
      priorityRank: t.priorityRank,
      strategicPillarId: t.pillarId,
      solutionArea: t.solutionArea,
      kornFerryPillar: t.kornFerryPillar
    }))
  };
}

async function editKPI(args: {
  kpiId: number;
  kpiName?: string;
  targetValue?: string;
  baselineValue?: string;
  estimatedValuePerUnit?: number;
  unit?: string;
}): Promise<ToolResult> {
  const existingKpi = await storage.getJobThemeKPI(args.kpiId);
  if (!existingKpi) {
    return { success: false, error: "KPI not found" };
  }
  
  const updates: any = {};
  const confirmParts: string[] = [];
  
  if (args.kpiName) {
    updates.kpiName = sanitizeInput(args.kpiName);
    confirmParts.push(`name to "${updates.kpiName}"`);
  }
  if (args.targetValue) {
    updates.targetValue = sanitizeInput(args.targetValue);
    confirmParts.push(`target to ${updates.targetValue}`);
  }
  if (args.baselineValue) {
    updates.baselineValue = sanitizeInput(args.baselineValue);
    confirmParts.push(`baseline to ${updates.baselineValue}`);
  }
  if (args.estimatedValuePerUnit !== undefined) {
    updates.estimatedValuePerUnit = args.estimatedValuePerUnit;
    confirmParts.push(`value per unit to $${args.estimatedValuePerUnit}`);
  }
  if (args.unit) {
    updates.unit = sanitizeInput(args.unit);
    confirmParts.push(`unit to ${updates.unit}`);
  }
  
  if (confirmParts.length === 0) {
    return { success: false, error: "No changes specified" };
  }
  
  return {
    success: true,
    requiresConfirmation: true,
    confirmationMessage: `Update "${existingKpi.kpiName}": ${confirmParts.join(", ")}?`,
    data: { action: "editKPI", kpiId: args.kpiId, updates }
  };
}

async function editJobTheme(args: {
  jobThemeId: number;
  jobName?: string;
  priorityRank?: number;
  strategicPillarId?: number;
}): Promise<ToolResult> {
  const existingTheme = await storage.getJobTheme(args.jobThemeId);
  if (!existingTheme) {
    return { success: false, error: "Job theme not found" };
  }
  
  const updates: any = {};
  const confirmParts: string[] = [];
  
  if (args.jobName) {
    updates.jobName = sanitizeInput(args.jobName);
    confirmParts.push(`name to "${updates.jobName}"`);
  }
  if (args.priorityRank !== undefined) {
    updates.priorityRank = args.priorityRank;
    confirmParts.push(`priority to #${args.priorityRank}`);
  }
  if (args.strategicPillarId !== undefined) {
    updates.pillarId = args.strategicPillarId;
    confirmParts.push(`strategic pillar assignment`);
  }
  
  if (confirmParts.length === 0) {
    return { success: false, error: "No changes specified" };
  }
  
  return {
    success: true,
    requiresConfirmation: true,
    confirmationMessage: `Update job theme "${existingTheme.jobName}": ${confirmParts.join(", ")}?`,
    data: { action: "editJobTheme", jobThemeId: args.jobThemeId, updates }
  };
}

async function editAccount(args: {
  accountId: number;
  name?: string;
  industry?: string;
  tier?: string;
  strategyNotes?: string;
}): Promise<ToolResult> {
  const existingAccount = await storage.getAccount(args.accountId);
  if (!existingAccount) {
    return { success: false, error: "Account not found" };
  }
  
  const updates: any = {};
  const confirmParts: string[] = [];
  
  if (args.name) {
    updates.name = sanitizeInput(args.name);
    confirmParts.push(`name to "${updates.name}"`);
  }
  if (args.industry) {
    updates.industry = sanitizeInput(args.industry);
    confirmParts.push(`industry to ${updates.industry}`);
  }
  if (args.tier) {
    updates.tier = args.tier;
    confirmParts.push(`tier to ${args.tier}`);
  }
  if (args.strategyNotes) {
    updates.strategyNotes = sanitizeInput(args.strategyNotes);
    confirmParts.push(`strategy notes`);
  }
  
  if (confirmParts.length === 0) {
    return { success: false, error: "No changes specified" };
  }
  
  return {
    success: true,
    requiresConfirmation: true,
    confirmationMessage: `Update account "${existingAccount.name}": ${confirmParts.join(", ")}?`,
    data: { action: "editAccount", accountId: args.accountId, updates }
  };
}

async function recommendKPIs(
  projectId: number, 
  jobThemeId?: number, 
  count: number = 5
): Promise<ToolResult> {
  const project = await storage.getProject(projectId);
  if (!project) {
    return { success: false, error: "Project not found" };
  }
  
  const jobThemes = jobThemeId 
    ? [await storage.getJobTheme(jobThemeId)].filter(Boolean)
    : await storage.getJobThemes(projectId);
  
  if (jobThemes.length === 0) {
    return { success: false, error: "No job themes found for KPI recommendations" };
  }
  
  const primaryTheme = jobThemes[0];
  
  try {
    const recommendations = await generateKPIRecommendations({
      jobName: primaryTheme?.jobName || "",
      capabilityName: primaryTheme?.capabilityName || "",
      solutionArea: primaryTheme?.solutionArea || "DEVELOP",
      companyName: project.companyName,
      industry: project.sector || undefined
    });
    
    return {
      success: true,
      data: {
        recommendations: recommendations.slice(0, count).map((r, idx) => ({
          rank: idx + 1,
          kpiName: r.kpiName,
          unit: r.unit,
          definition: r.definition,
          strategicRationale: r.strategicRationale,
          achievabilityScore: r.achievabilityScore,
          valueImpactScore: r.valueImpactScore,
          kornFerryBenchmark: r.kornFerryBenchmark
        }))
      },
      recommendations: recommendations.slice(0, count).map(r => ({
        id: `kpi-${Date.now()}-${Math.random()}`,
        type: "kpi" as const,
        title: r.kpiName,
        description: r.strategicRationale,
        rationale: r.definition,
        confidence: r.achievabilityScore / 10,
        priority: r.valueImpactScore >= 7 ? "high" as const : r.valueImpactScore >= 4 ? "medium" as const : "low" as const,
        suggestedAction: {
          toolName: "createKPI",
          toolArgs: {
            jobThemeId: jobThemeId || jobThemes[0]?.id,
            kpiName: r.kpiName,
            unit: r.unit
          },
          confirmationMessage: `Create KPI "${r.kpiName}"?`
        },
        metadata: {
          kornFerryBenchmark: r.kornFerryBenchmark,
          industryBenchmark: r.industryBenchmark,
          targetRecommendation: r.targetRecommendation
        }
      }))
    };
  } catch (error) {
    return { 
      success: false, 
      error: "Failed to generate KPI recommendations" 
    };
  }
}

async function recommendQuestions(
  projectId: number,
  methodology?: string,
  topic?: string,
  count: number = 5
): Promise<ToolResult> {
  const project = await storage.getProject(projectId);
  if (!project) {
    return { success: false, error: "Project not found" };
  }
  
  const jobThemes = await storage.getJobThemes(projectId);
  const dataPoints = await storage.getCompanyDataPoints(projectId);
  
  const capabilityQuestions = jobThemes.map(theme => ({
    capability: theme.capabilityName || theme.jobName,
    insights: dataPoints
      .filter(dp => dp.relevantCapability === theme.capabilityName || dp.solutionArea === theme.solutionArea)
      .slice(0, 3)
      .map(dp => ({
        label: dp.label,
        value: dp.value,
        relatedKPIs: dp.relatedKPIs || undefined
      }))
  })).filter(cq => cq.insights.length > 0);
  
  if (capabilityQuestions.length === 0) {
    capabilityQuestions.push({
      capability: topic || "General Discovery",
      insights: [{ label: "Context", value: `Preparing discovery for ${project.companyName}` }]
    });
  }
  
  try {
    const questionsMap = await generateDiscoveryQuestions(
      project.companyName,
      capabilityQuestions,
      {
        sector: project.sector,
        industry: project.sector
      }
    );
    
    const allQuestions = Object.values(questionsMap).flat();
    
    const filtered = methodology && methodology !== "any"
      ? allQuestions.filter(q => q.methodology?.toLowerCase().includes(methodology.toLowerCase()))
      : allQuestions;
    
    return {
      success: true,
      data: {
        questions: filtered.slice(0, count).map(q => ({
          question: q.question,
          questionType: q.questionType,
          methodology: q.methodology,
          methodologyStage: q.methodologyStage,
          purpose: q.purpose,
          relatedKPI: q.relatedKPI,
          followUpHint: q.followUpHint
        }))
      }
    };
  } catch (error) {
    return { 
      success: false, 
      error: "Failed to generate discovery questions" 
    };
  }
}

async function recommendSuccessStories(
  projectId: number,
  industry?: string,
  valuePillar?: string
): Promise<ToolResult> {
  const project = await storage.getProject(projectId);
  if (!project) {
    return { success: false, error: "Project not found" };
  }
  
  const stories = await storage.getSuccessStoryLibrary();
  const jobThemes = await storage.getJobThemes(projectId);
  
  let filteredStories = stories;
  
  if (industry) {
    filteredStories = filteredStories.filter(s => 
      s.industry?.toLowerCase().includes(industry.toLowerCase())
    );
  }
  
  if (valuePillar) {
    filteredStories = filteredStories.filter(s => 
      s.capabilityName?.toLowerCase().includes(valuePillar.toLowerCase())
    );
  }
  
  const scoredStories = filteredStories.map(story => {
    let score = 0;
    if (story.industry?.toLowerCase() === project.sector?.toLowerCase()) score += 2;
    if (story.approvalStatus === "approved") score += 1;
    jobThemes.forEach(theme => {
      if (story.solutionArea === theme.solutionArea) score += 1;
      if (story.capabilityName === theme.capabilityName) score += 1;
    });
    return { story, score };
  }).sort((a, b) => b.score - a.score);
  
  return {
    success: true,
    data: {
      stories: scoredStories.slice(0, 5).map(({ story, score }) => ({
        id: story.id,
        title: story.title,
        clientIndustry: story.industry,
        capabilityName: story.capabilityName,
        results: story.results,
        approved: story.approvalStatus === "approved",
        relevanceScore: score,
        solutionArea: story.solutionArea
      }))
    }
  };
}

async function runDiscoverySetup(
  projectId: number,
  focusAreas?: string[]
): Promise<ToolResult> {
  const project = await storage.getProject(projectId);
  if (!project) {
    return { success: false, error: "Project not found" };
  }
  
  const steps = [
    { stepId: "step-1", description: "Run AI research on company", toolName: "companyResearch", status: "pending" as const },
    { stepId: "step-2", description: "Generate discovery questions", toolName: "generateQuestions", status: "pending" as const },
    { stepId: "step-3", description: "Create initial job themes", toolName: "createJobThemes", status: "pending" as const },
    { stepId: "step-4", description: "Prepare meeting bundle", toolName: "prepareMeetingBundle", status: "pending" as const }
  ];
  
  return {
    success: true,
    requiresConfirmation: true,
    confirmationMessage: `Set up discovery for ${project.companyName}? This will run AI research, generate discovery questions, and prepare a meeting bundle.`,
    data: {
      action: "runDiscoverySetup",
      projectId,
      focusAreas: focusAreas || [],
      steps
    },
    taskProgress: {
      id: `discovery-setup-${projectId}-${Date.now()}`,
      type: "workflow" as const,
      name: "Discovery Setup",
      description: `Complete discovery setup for ${project.companyName}`,
      steps,
      status: "pending" as const,
      createdAt: new Date().toISOString()
    }
  };
}

async function runQBRPrep(
  projectId: number,
  reviewPeriod?: string,
  audience?: string
): Promise<ToolResult> {
  const project = await storage.getProject(projectId);
  if (!project) {
    return { success: false, error: "Project not found" };
  }
  
  const kpis = await storage.getAllJobThemeKPIsForProject(projectId);
  const actuals = await storage.getAllKPIActualsForProject(projectId);
  const jobThemes = await storage.getJobThemes(projectId);
  
  try {
    const kpiProgress = kpis.map(kpi => {
      const kpiActuals = actuals.filter(a => a.jobThemeKPIId === kpi.id);
      const latestActual = kpiActuals.sort((a, b) => 
        new Date(b.actualDate!).getTime() - new Date(a.actualDate!).getTime()
      )[0];
      
      let trend: "improving" | "declining" | "stagnant" | "unknown" = "unknown";
      if (kpiActuals.length >= 2) {
        const prev = kpiActuals[1]?.actualValue;
        const curr = latestActual?.actualValue;
        if (prev && curr) {
          const prevNum = parseFloat(prev);
          const currNum = parseFloat(curr);
          if (!isNaN(prevNum) && !isNaN(currNum)) {
            trend = currNum > prevNum ? "improving" : currNum < prevNum ? "declining" : "stagnant";
          }
        }
      }
      
      return {
        kpiName: kpi.kpiName,
        baseline: kpi.baselineValue || "",
        target: kpi.targetValue || "",
        actual: latestActual?.actualValue,
        trend
      };
    });
    
    const agenda = await generateBusinessReviewAgenda({
      companyName: project.companyName,
      reviewType: "quarterly",
      projectPhase: (project.currentPhase as "discovery" | "alignment" | "realisation") || "discovery",
      kpiProgress,
      discoveryInsights: jobThemes.map(t => t.jobName)
    });
    
    const kpiSummary = kpis.map(kpi => {
      const kpiActuals = actuals.filter(a => a.jobThemeKPIId === kpi.id);
      const latestActual = kpiActuals.sort((a, b) => 
        new Date(b.actualDate!).getTime() - new Date(a.actualDate!).getTime()
      )[0];
      
      return {
        kpiName: kpi.kpiName,
        baseline: kpi.baselineValue,
        target: kpi.targetValue,
        current: latestActual?.actualValue,
        status: latestActual ? "tracked" as const : "needs_data" as const
      };
    });
    
    return {
      success: true,
      data: {
        reviewPeriod: reviewPeriod || "Current Quarter",
        audience: audience || "executive",
        company: project.companyName,
        initiative: project.name,
        kpiProgress: kpiSummary,
        agenda,
        suggestedHighlights: kpiSummary.filter(k => k.status === "tracked").slice(0, 3),
        risks: kpiSummary.filter(k => k.status === "needs_data")
      }
    };
  } catch (error) {
    return { 
      success: false, 
      error: "Failed to prepare QBR materials" 
    };
  }
}

async function runHandoffBundle(
  projectId: number,
  recipientRole: string,
  includeFullHistory?: boolean
): Promise<ToolResult> {
  const project = await storage.getProject(projectId);
  if (!project) {
    return { success: false, error: "Project not found" };
  }
  
  const jobThemes = await storage.getJobThemes(projectId);
  const kpis = await storage.getAllJobThemeKPIsForProject(projectId);
  const notes = await storage.getDiscoveryNotes(projectId);
  const questions = await storage.getDiscoveryQuestions(projectId);
  
  const handoffPackets = await storage.getHandoffPackets(projectId);
  const handoffPacket = handoffPackets[0] || null;
  
  return {
    success: true,
    requiresConfirmation: true,
    confirmationMessage: `Create handoff bundle for ${recipientRole.toUpperCase()}? This will compile all confirmed commitments and key context for ${project.companyName}.`,
    data: {
      action: "runHandoffBundle",
      projectId,
      recipientRole,
      bundle: {
        company: project.companyName,
        initiative: project.name,
        phase: project.currentPhase,
        handedOffTo: recipientRole,
        confirmedCommitments: kpis.filter(k => k.commitmentStatus === "confirmed").map(k => ({
          kpiName: k.kpiName,
          target: k.targetValue,
          baseline: k.baselineValue
        })),
        jobThemes: jobThemes.map(t => ({
          name: t.jobName,
          priority: t.priorityRank
        })),
        discoveryContext: includeFullHistory ? {
          notes: notes?.freeformNotes,
          questionsAsked: questions.filter(q => q.isAsked).length,
          keyStakeholder: notes?.keyStakeholder
        } : null,
        existingHandoff: handoffPacket ? {
          id: handoffPacket.id,
          status: handoffPacket.status,
          createdAt: handoffPacket.createdAt
        } : null
      }
    }
  };
}

function parseNumericValue(val: any): number | null {
  if (val === null || val === undefined) return null;
  const n = Number(String(val).replace(/[^0-9.\-]/g, ''));
  return isNaN(n) ? null : n;
}

async function executeSurfaceData(args: {
  view: string;
  accountId?: number;
  projectId?: number;
  entityIds?: number[];
  entityType?: string;
  title?: string;
  infoContent?: string;
  infoItems?: Array<{ label: string; value: string }>;
}): Promise<ToolResult> {
  const { view } = args;

  if (view === "info_card") {
    return {
      success: true,
      data: {
        _dashboardPayload: {
          type: "info_card",
          title: args.title || "Information",
          metrics: [],
          charts: [],
          tables: [],
          actions: [],
          infoContent: args.infoContent || "",
          infoItems: args.infoItems || [],
        }
      }
    };
  }

  if (view === "account_detail") {
    if (!args.accountId) return { success: false, error: "accountId is required for account_detail view" };
    const account = await storage.getAccount(args.accountId);
    if (!account) return { success: false, error: `Account ${args.accountId} not found` };
    const initiatives = await storage.getInitiativesForAccount(args.accountId);
    let onTrack = 0, atRisk = 0, offTrack = 0, noData = 0;
    let totalValue = 0;
    const initiativeRows: string[][] = [];
    const initiativeRowLinks: Array<{ route: string }> = [];
    const phaseCount: Record<string, number> = {};

    for (const proj of initiatives) {
      const phase = proj.currentPhase || "discovery";
      phaseCount[phase] = (phaseCount[phase] || 0) + 1;
      const kpis = await storage.getAllJobThemeKPIsForProject(proj.id);
      const actuals = await storage.getAllKPIActualsForProject(proj.id);
      const actualsMap = new Map<number, any[]>();
      for (const a of actuals) {
        if (!actualsMap.has(a.jobThemeKPIId)) actualsMap.set(a.jobThemeKPIId, []);
        actualsMap.get(a.jobThemeKPIId)!.push(a);
      }
      let projOnTrack = 0, projAtRisk = 0, projOffTrack = 0;
      for (const kpi of kpis) {
        if (!kpi.isSelected) continue;
        const kActuals = actualsMap.get(kpi.id) || [];
        const base = parseNumericValue(kpi.baselineValue);
        const target = parseNumericValue(kpi.targetValue);
        if (base === null || target === null || kActuals.length === 0) { noData++; continue; }
        const sorted = [...kActuals].sort((a, b) => new Date(b.actualDate).getTime() - new Date(a.actualDate).getTime());
        const latest = parseNumericValue(sorted[0]?.actualValue);
        if (latest === null) { noData++; continue; }
        const td = target - base;
        const cd = latest - base;
        const pct = td !== 0 ? (cd / td) * 100 : 0;
        if (pct >= 80) { onTrack++; projOnTrack++; }
        else if (pct >= 50) { atRisk++; projAtRisk++; }
        else { offTrack++; projOffTrack++; }
        const vpu = parseNumericValue(kpi.estimatedValuePerUnit);
        if (vpu !== null) totalValue += Math.abs(cd) * vpu;
      }
      const healthLabel = projOffTrack > 0 ? "At Risk" : projAtRisk > 0 ? "Caution" : projOnTrack > 0 ? "Healthy" : "No Data";
      initiativeRows.push([proj.name, phase.charAt(0).toUpperCase() + phase.slice(1), healthLabel]);
      initiativeRowLinks.push({ route: `/projects/${proj.id}/sales` });
    }

    return {
      success: true,
      data: {
        _dashboardPayload: {
          type: "account",
          title: args.title || account.name,
          metrics: [
            { label: "Initiatives", value: String(initiatives.length), trend: "stable", color: "#005971" },
            { label: "KPIs On Track", value: `${onTrack}/${onTrack + atRisk + offTrack + noData}`, trend: onTrack >= offTrack ? "up" : "down", color: "#009B77" },
            { label: "At Risk", value: String(atRisk), trend: atRisk > 0 ? "down" : "up", color: "#f59e0b" },
            { label: "Value Realized", value: totalValue > 0 ? `$${(totalValue / 1000000).toFixed(1)}M` : "$0", trend: "up", color: "#00634F" }
          ],
          charts: [
            ...(onTrack + atRisk + offTrack > 0 ? [{
              id: "acct-kpi-health",
              type: "doughnut" as const,
              title: "KPI Health Distribution",
              labels: ["On Track", "At Risk", "Off Track", "No Data"],
              data: [onTrack, atRisk, offTrack, noData],
              colors: ["#009B77", "#f59e0b", "#ef4444", "#929192"]
            }] : []),
            ...(Object.keys(phaseCount).length > 0 ? [{
              id: "acct-phases",
              type: "bar" as const,
              title: "Initiatives by Phase",
              labels: Object.keys(phaseCount).map(p => p.charAt(0).toUpperCase() + p.slice(1)),
              data: Object.values(phaseCount),
              colors: ["#005971", "#00634F", "#009B77"]
            }] : [])
          ],
          tables: initiativeRows.length > 0 ? [{
            title: "Initiatives",
            headers: ["Name", "Phase", "Health"],
            rows: initiativeRows,
            rowLinks: initiativeRowLinks
          }] : [],
          actions: [
            { label: "Open Account Page", route: `/accounts/${account.id}/sales` },
            { label: "Create New Initiative", prompt: `Create a new initiative for ${account.name}` },
            ...(atRisk + offTrack > 0 ? [{ label: "Review At-Risk KPIs", prompt: `Show me the at-risk KPIs for ${account.name}` }] : []),
            { label: "Prepare Meeting Brief", prompt: `Prepare a meeting brief for ${account.name}` }
          ],
          accountId: account.id
        }
      }
    };
  }

  if (view === "account_list") {
    const accounts = await storage.getAccounts();
    const tierCounts: Record<string, number> = {};
    const industryCounts: Record<string, number> = {};
    const accountRows: string[][] = [];
    const accountRowLinks: Array<{ route: string }> = [];
    for (const a of accounts) {
      const t = a.tier || "unspecified";
      const ind = a.industry || "Other";
      tierCounts[t] = (tierCounts[t] || 0) + 1;
      industryCounts[ind] = (industryCounts[ind] || 0) + 1;
      accountRows.push([a.name, ind, t.charAt(0).toUpperCase() + t.slice(1)]);
      accountRowLinks.push({ route: `/accounts/${a.id}/sales` });
    }
    return {
      success: true,
      data: {
        _dashboardPayload: {
          type: "accounts",
          title: args.title || "All Accounts",
          metrics: [
            { label: "Total Accounts", value: String(accounts.length), trend: "stable", color: "#00634F" },
            { label: "Enterprise", value: String(tierCounts["enterprise"] || 0), trend: "stable", color: "#00173B" },
            { label: "Strategic", value: String(tierCounts["strategic"] || 0), trend: "stable", color: "#005971" },
            { label: "Growth", value: String(tierCounts["growth"] || 0), trend: "stable", color: "#009B77" }
          ],
          charts: [
            ...(Object.keys(industryCounts).length > 1 ? [{
              id: "accts-industry",
              type: "doughnut" as const,
              title: "By Industry",
              labels: Object.keys(industryCounts),
              data: Object.values(industryCounts)
            }] : []),
            ...(Object.keys(tierCounts).length > 1 ? [{
              id: "accts-tier",
              type: "bar" as const,
              title: "By Tier",
              labels: Object.keys(tierCounts).map(t => t.charAt(0).toUpperCase() + t.slice(1)),
              data: Object.values(tierCounts),
              colors: ["#00173B", "#005971", "#009B77"]
            }] : [])
          ],
          tables: accountRows.length > 0 ? [{
            title: "Account Portfolio",
            headers: ["Account", "Industry", "Tier"],
            rows: accountRows.slice(0, 15),
            rowLinks: accountRowLinks.slice(0, 15)
          }] : [],
          actions: [
            { label: "View All Accounts", route: "/accounts" },
            { label: "Create New Account", prompt: "Create a new account" },
            { label: "Portfolio Overview", prompt: "Show me the portfolio overview" }
          ]
        }
      }
    };
  }

  if (view === "initiative_detail") {
    if (!args.projectId) return { success: false, error: "projectId is required for initiative_detail view" };
    const project = await storage.getProject(args.projectId);
    if (!project) return { success: false, error: `Initiative ${args.projectId} not found` };
    const themes = await storage.getJobThemes(args.projectId);
    const kpis = await storage.getAllJobThemeKPIsForProject(args.projectId);
    const actuals = await storage.getAllKPIActualsForProject(args.projectId);
    const actualsMap = new Map<number, any[]>();
    for (const a of actuals) {
      if (!actualsMap.has(a.jobThemeKPIId)) actualsMap.set(a.jobThemeKPIId, []);
      actualsMap.get(a.jobThemeKPIId)!.push(a);
    }
    let onTrack = 0, atRisk = 0, offTrack = 0, noData = 0;
    const kpiRows: string[][] = [];
    for (const kpi of kpis) {
      if (!kpi.isSelected) continue;
      const kActuals = actualsMap.get(kpi.id) || [];
      const base = parseNumericValue(kpi.baselineValue);
      const target = parseNumericValue(kpi.targetValue);
      if (base === null || target === null || kActuals.length === 0) {
        noData++;
        kpiRows.push([kpi.kpiName, "No Data", "—", "—"]);
        continue;
      }
      const sorted = [...kActuals].sort((a, b) => new Date(b.actualDate).getTime() - new Date(a.actualDate).getTime());
      const latest = parseNumericValue(sorted[0]?.actualValue);
      if (latest === null) { noData++; kpiRows.push([kpi.kpiName, "No Data", "—", "—"]); continue; }
      const td = target - base;
      const cd = latest - base;
      const pct = td !== 0 ? Math.round((cd / td) * 100) : 0;
      let status: string;
      if (pct >= 80) { onTrack++; status = "On Track"; }
      else if (pct >= 50) { atRisk++; status = "At Risk"; }
      else { offTrack++; status = "Off Track"; }
      kpiRows.push([kpi.kpiName, status, `${pct}%`, `${latest} / ${target} ${kpi.unit || ''}`]);
    }
    const phase = project.currentPhase || "discovery";
    return {
      success: true,
      data: {
        _dashboardPayload: {
          type: "initiative",
          title: args.title || project.name,
          metrics: [
            { label: "Phase", value: phase.charAt(0).toUpperCase() + phase.slice(1), trend: "stable", color: "#00634F" },
            { label: "Job Themes", value: String(themes.length), trend: "stable", color: "#005971" },
            { label: "KPIs On Track", value: `${onTrack}/${onTrack + atRisk + offTrack + noData}`, trend: onTrack >= offTrack ? "up" : "down", color: "#009B77" },
            { label: "Off Track", value: String(offTrack), trend: offTrack > 0 ? "down" : "up", color: "#ef4444" }
          ],
          charts: onTrack + atRisk + offTrack > 0 ? [{
            id: "init-kpi-health",
            type: "doughnut" as const,
            title: "KPI Health",
            labels: ["On Track", "At Risk", "Off Track", "No Data"],
            data: [onTrack, atRisk, offTrack, noData],
            colors: ["#009B77", "#f59e0b", "#ef4444", "#929192"]
          }] : [],
          tables: kpiRows.length > 0 ? [{
            title: "KPI Performance",
            headers: ["KPI", "Status", "Progress", "Value"],
            rows: kpiRows
          }] : [],
          actions: [
            { label: "Open Initiative", route: `/projects/${project.id}/sales` },
            { label: "View KPI Trends", prompt: `Show me KPI trends for ${project.name}` },
            { label: "Prepare Meeting Brief", prompt: `Prepare a meeting brief for ${project.name}` },
            ...(offTrack > 0 ? [{ label: "Review Off-Track KPIs", prompt: `Which KPIs are off track for ${project.name} and what can we do?` }] : [])
          ],
          projectId: project.id
        }
      }
    };
  }

  if (view === "kpi_health") {
    if (!args.projectId) return { success: false, error: "projectId is required for kpi_health view" };
    const project = await storage.getProject(args.projectId);
    if (!project) return { success: false, error: `Initiative ${args.projectId} not found` };
    const kpis = await storage.getAllJobThemeKPIsForProject(args.projectId);
    const actuals = await storage.getAllKPIActualsForProject(args.projectId);
    const actualsMap = new Map<number, any[]>();
    for (const a of actuals) {
      if (!actualsMap.has(a.jobThemeKPIId)) actualsMap.set(a.jobThemeKPIId, []);
      actualsMap.get(a.jobThemeKPIId)!.push(a);
    }
    let onTrack = 0, atRisk = 0, offTrack = 0, noData = 0;
    const kpiRows: string[][] = [];
    const progressData: number[] = [];
    const progressLabels: string[] = [];
    for (const kpi of kpis) {
      if (!kpi.isSelected) continue;
      const kActuals = actualsMap.get(kpi.id) || [];
      const base = parseNumericValue(kpi.baselineValue);
      const target = parseNumericValue(kpi.targetValue);
      if (base === null || target === null || kActuals.length === 0) {
        noData++;
        kpiRows.push([kpi.kpiName, "No Data", "—"]);
        continue;
      }
      const sorted = [...kActuals].sort((a, b) => new Date(b.actualDate).getTime() - new Date(a.actualDate).getTime());
      const latest = parseNumericValue(sorted[0]?.actualValue);
      if (latest === null) { noData++; kpiRows.push([kpi.kpiName, "No Data", "—"]); continue; }
      const td = target - base;
      const cd = latest - base;
      const pct = td !== 0 ? Math.round((cd / td) * 100) : 0;
      let status: string;
      if (pct >= 80) { onTrack++; status = "On Track"; }
      else if (pct >= 50) { atRisk++; status = "At Risk"; }
      else { offTrack++; status = "Off Track"; }
      kpiRows.push([kpi.kpiName, status, `${pct}%`]);
      progressLabels.push(kpi.kpiName.length > 15 ? kpi.kpiName.slice(0, 15) + '...' : kpi.kpiName);
      progressData.push(Math.max(0, Math.min(100, pct)));
    }
    const totalTracked = onTrack + atRisk + offTrack + noData;
    const overallHealth = totalTracked > 0 ? Math.round((onTrack / totalTracked) * 100) : 0;
    return {
      success: true,
      data: {
        _dashboardPayload: {
          type: "kpis",
          title: args.title || `KPIs - ${project.name}`,
          metrics: [
            { label: "Total KPIs", value: String(totalTracked), trend: "stable", color: "#005971" },
            { label: "On Track", value: String(onTrack), trend: "up", color: "#009B77" },
            { label: "At Risk", value: String(atRisk), trend: atRisk > 0 ? "down" : "up", color: "#f59e0b" },
            { label: "Off Track", value: String(offTrack), trend: offTrack > 0 ? "down" : "up", color: "#ef4444" }
          ],
          charts: [
            ...(onTrack + atRisk + offTrack > 0 ? [{
              id: "kpi-health-doughnut",
              type: "doughnut" as const,
              title: "KPI Health Distribution",
              labels: ["On Track", "At Risk", "Off Track", "No Data"],
              data: [onTrack, atRisk, offTrack, noData],
              colors: ["#009B77", "#f59e0b", "#ef4444", "#929192"]
            }] : []),
            { id: "kpi-overall-gauge", type: "gauge" as const, title: "Overall Health Score", labels: ["Health %"], data: [overallHealth], maxValue: 100 },
            ...(progressData.length > 0 ? [{
              id: "kpi-progress-bars",
              type: "horizontal_bar" as const,
              title: "KPI Progress",
              labels: progressLabels,
              data: progressData
            }] : [])
          ],
          tables: kpiRows.length > 0 ? [{
            title: "KPI Details",
            headers: ["KPI", "Status", "Progress"],
            rows: kpiRows
          }] : [],
          actions: [
            { label: "Open Initiative", route: `/projects/${args.projectId}/sales` },
            { label: "View KPI Trends", prompt: `Show me the KPI trends for this initiative` },
            ...(offTrack > 0 ? [{ label: "Recommend Improvements", prompt: `What actions can improve the off-track KPIs?` }] : []),
            { label: "Prepare QBR", prompt: `Help me prepare a QBR for this initiative` }
          ],
          projectId: args.projectId
        }
      }
    };
  }

  if (view === "portfolio_overview") {
    const accounts = await storage.getAccounts();
    let totalInitiatives = 0, totalKPIs = 0;
    let onTrack = 0, atRisk = 0, offTrack = 0, noData = 0;
    let totalValuePromised = 0, totalValueRealized = 0;
    const phaseCount: Record<string, number> = { discovery: 0, alignment: 0, realisation: 0 };
    const accountHealthRows: string[][] = [];
    const accountHealthRowLinks: Array<{ route: string }> = [];

    for (const account of accounts) {
      const initiatives = await storage.getInitiativesForAccount(account.id);
      totalInitiatives += initiatives.length;
      let acctOn = 0, acctRisk = 0, acctOff = 0;
      for (const proj of initiatives) {
        if (proj.currentPhase && phaseCount[proj.currentPhase] !== undefined) phaseCount[proj.currentPhase]++;
        const kpis = await storage.getAllJobThemeKPIsForProject(proj.id);
        const actuals = await storage.getAllKPIActualsForProject(proj.id);
        const actualsMap = new Map<number, any[]>();
        for (const a of actuals) {
          if (!actualsMap.has(a.jobThemeKPIId)) actualsMap.set(a.jobThemeKPIId, []);
          actualsMap.get(a.jobThemeKPIId)!.push(a);
        }
        for (const kpi of kpis) {
          if (!kpi.isSelected) continue;
          totalKPIs++;
          const kActuals = actualsMap.get(kpi.id) || [];
          const base = parseNumericValue(kpi.baselineValue);
          const target = parseNumericValue(kpi.targetValue);
          if (base === null || target === null || kActuals.length === 0) { noData++; continue; }
          const sorted = [...kActuals].sort((a, b) => new Date(b.actualDate).getTime() - new Date(a.actualDate).getTime());
          const latest = parseNumericValue(sorted[0]?.actualValue);
          if (latest === null) { noData++; continue; }
          const td = target - base;
          const cd = latest - base;
          const pct = td !== 0 ? (cd / td) * 100 : 0;
          if (pct >= 80) { onTrack++; acctOn++; }
          else if (pct >= 50) { atRisk++; acctRisk++; }
          else { offTrack++; acctOff++; }
          const vpu = parseNumericValue(kpi.estimatedValuePerUnit);
          if (vpu !== null) {
            totalValuePromised += Math.abs(td) * vpu;
            totalValueRealized += Math.abs(cd) * vpu;
          }
        }
      }
      if (initiatives.length > 0) {
        const health = acctOff > 0 ? "Needs Attention" : acctRisk > 0 ? "Caution" : acctOn > 0 ? "Healthy" : "No KPI Data";
        accountHealthRows.push([account.name, String(initiatives.length), health]);
        accountHealthRowLinks.push({ route: `/accounts/${account.id}/sales` });
      }
    }

    return {
      success: true,
      data: {
        _dashboardPayload: {
          type: "portfolio",
          title: args.title || "Portfolio Overview",
          metrics: [
            { label: "Accounts", value: String(accounts.length), trend: "stable", color: "#00634F" },
            { label: "Initiatives", value: String(totalInitiatives), trend: "stable", color: "#005971" },
            { label: "KPIs On Track", value: `${onTrack}/${totalKPIs}`, trend: onTrack >= offTrack ? "up" : "down", color: "#009B77" },
            { label: "Pipeline Value", value: totalValuePromised > 0 ? `$${(totalValuePromised / 1000000).toFixed(1)}M` : "$0", trend: "up", color: "#00173B" }
          ],
          charts: [
            ...(onTrack + atRisk + offTrack > 0 ? [{
              id: "portfolio-health",
              type: "doughnut" as const,
              title: "KPI Health Across Portfolio",
              labels: ["On Track", "At Risk", "Off Track", "No Data"],
              data: [onTrack, atRisk, offTrack, noData],
              colors: ["#009B77", "#f59e0b", "#ef4444", "#929192"]
            }] : []),
            {
              id: "portfolio-phases",
              type: "bar" as const,
              title: "Initiatives by Phase",
              labels: ["Discovery", "Alignment", "Realisation"],
              data: [phaseCount.discovery, phaseCount.alignment, phaseCount.realisation],
              colors: ["#005971", "#00634F", "#009B77"]
            },
            ...(totalValuePromised > 0 ? [{
              id: "portfolio-value-gauge",
              type: "gauge" as const,
              title: "Value Realization",
              labels: ["Realized %"],
              data: [totalValuePromised > 0 ? Math.round((totalValueRealized / totalValuePromised) * 100) : 0],
              maxValue: 100
            }] : [])
          ],
          tables: accountHealthRows.length > 0 ? [{
            title: "Account Health Summary",
            headers: ["Account", "Initiatives", "Health"],
            rows: accountHealthRows,
            rowLinks: accountHealthRowLinks
          }] : [],
          actions: [
            { label: "View All Accounts", route: "/accounts" },
            { label: "Show Account List", prompt: "Show me all accounts" },
            ...(offTrack > 0 ? [{ label: "Review At-Risk Accounts", prompt: "Which accounts need attention and why?" }] : [])
          ]
        }
      }
    };
  }

  if (view === "kpi_trends") {
    if (!args.projectId) return { success: false, error: "projectId is required for kpi_trends view" };
    const project = await storage.getProject(args.projectId);
    if (!project) return { success: false, error: `Initiative ${args.projectId} not found` };
    const kpis = await storage.getAllJobThemeKPIsForProject(args.projectId);
    const actuals = await storage.getAllKPIActualsForProject(args.projectId);
    const actualsMap = new Map<number, any[]>();
    for (const a of actuals) {
      if (!actualsMap.has(a.jobThemeKPIId)) actualsMap.set(a.jobThemeKPIId, []);
      actualsMap.get(a.jobThemeKPIId)!.push(a);
    }
    const trendRows: string[][] = [];
    const kpiNames: string[] = [];
    const latestPcts: number[] = [];
    for (const kpi of kpis) {
      if (!kpi.isSelected) continue;
      const kActuals = actualsMap.get(kpi.id) || [];
      if (kActuals.length === 0) continue;
      const base = parseNumericValue(kpi.baselineValue);
      const target = parseNumericValue(kpi.targetValue);
      if (base === null || target === null) continue;
      const sorted = [...kActuals].sort((a, b) => new Date(a.actualDate).getTime() - new Date(b.actualDate).getTime());
      const td = target - base;
      const latestVal = parseNumericValue(sorted[sorted.length - 1]?.actualValue);
      const prevVal = sorted.length > 1 ? parseNumericValue(sorted[sorted.length - 2]?.actualValue) : null;
      if (latestVal === null) continue;
      const pct = td !== 0 ? Math.round(((latestVal - base) / td) * 100) : 0;
      const trend = prevVal !== null && td !== 0 ? Math.round(((latestVal - prevVal) / Math.abs(td)) * 100) : 0;
      const trendStr = trend > 0 ? `+${trend}%` : `${trend}%`;
      trendRows.push([kpi.kpiName, `${latestVal}`, `${target}`, `${pct}%`, trendStr]);
      kpiNames.push(kpi.kpiName.length > 12 ? kpi.kpiName.slice(0, 12) + '..' : kpi.kpiName);
      latestPcts.push(Math.max(0, Math.min(100, pct)));
    }
    return {
      success: true,
      data: {
        _dashboardPayload: {
          type: "kpis",
          title: args.title || `KPI Trends - ${project.name}`,
          metrics: [
            { label: "KPIs Tracked", value: String(trendRows.length), trend: "stable", color: "#005971" }
          ],
          charts: latestPcts.length > 0 ? [{
            id: "kpi-trends-bar",
            type: "horizontal_bar" as const,
            title: "Current Progress (%)",
            labels: kpiNames,
            data: latestPcts
          }] : [],
          tables: trendRows.length > 0 ? [{
            title: "KPI Trend Data",
            headers: ["KPI", "Current", "Target", "Progress", "Trend"],
            rows: trendRows
          }] : [],
          actions: [
            { label: "Open Initiative", route: `/projects/${args.projectId}/sales` },
            { label: "View KPI Health", prompt: `Show me the KPI health dashboard for ${project.name}` },
            { label: "Recommend Actions", prompt: `Based on these KPI trends, what actions should I take?` }
          ],
          projectId: args.projectId
        }
      }
    };
  }

  if (view === "meeting_prep") {
    if (!args.projectId) return { success: false, error: "projectId is required for meeting_prep view" };
    const project = await storage.getProject(args.projectId);
    if (!project) return { success: false, error: `Initiative ${args.projectId} not found` };
    const themes = await storage.getJobThemes(args.projectId);
    const questions = await storage.getQuestions(args.projectId);
    const notes = await storage.getDiscoveryNotes(args.projectId);
    const kpis = await storage.getAllJobThemeKPIsForProject(args.projectId);
    const selectedKPIs = kpis.filter(k => k.isSelected);

    return {
      success: true,
      data: {
        _dashboardPayload: {
          type: "meeting",
          title: args.title || `Meeting Prep - ${project.name}`,
          metrics: [
            { label: "Job Themes", value: String(themes.length), trend: "stable", color: "#005971" },
            { label: "Discovery Questions", value: String(questions.length), trend: "stable", color: "#00634F" },
            { label: "Notes Captured", value: String(notes.length), trend: "stable", color: "#009B77" },
            { label: "Active KPIs", value: String(selectedKPIs.length), trend: "stable", color: "#A3238E" }
          ],
          charts: [],
          tables: [
            ...(themes.length > 0 ? [{
              title: "Key Themes to Discuss",
              headers: ["Theme", "Priority"],
              rows: themes.slice(0, 8).map((t: any) => [t.jobName, t.priorityRank ? `#${t.priorityRank}` : "—"])
            }] : []),
            ...(selectedKPIs.length > 0 ? [{
              title: "KPIs to Review",
              headers: ["KPI", "Baseline", "Target"],
              rows: selectedKPIs.slice(0, 8).map((k: any) => [k.kpiName, k.baselineValue || "—", k.targetValue || "—"])
            }] : [])
          ],
          actions: [
            { label: "Open Initiative", route: `/projects/${args.projectId}/sales` },
            { label: "Generate Talking Points", prompt: `Generate meeting talking points for ${project.name}` },
            { label: "View KPI Health", prompt: `Show me the KPI health for ${project.name}` },
            { label: "Create Meeting Bundle", prompt: `Prepare a full meeting bundle for ${project.name}` }
          ],
          projectId: args.projectId
        }
      }
    };
  }

  if (view === "comparison") {
    if (!args.entityIds || args.entityIds.length < 2) return { success: false, error: "entityIds with at least 2 IDs is required for comparison view" };
    const entityType = args.entityType || "accounts";
    
    if (entityType === "accounts") {
      const rows: string[][] = [];
      const rowLinks: Array<{ route: string }> = [];
      for (const id of args.entityIds) {
        const acct = await storage.getAccount(id);
        if (!acct) continue;
        const inits = await storage.getInitiativesForAccount(id);
        rows.push([acct.name, acct.industry || "—", acct.tier || "—", String(inits.length)]);
        rowLinks.push({ route: `/accounts/${acct.id}/sales` });
      }
      return {
        success: true,
        data: {
          _dashboardPayload: {
            type: "accounts",
            title: args.title || "Account Comparison",
            metrics: [{ label: "Comparing", value: `${rows.length} accounts`, trend: "stable", color: "#005971" }],
            charts: [],
            tables: rows.length > 0 ? [{
              title: "Side-by-Side Comparison",
              headers: ["Account", "Industry", "Tier", "Initiatives"],
              rows,
              rowLinks
            }] : [],
            actions: rows.map((r, i) => ({ label: `Open ${r[0]}`, route: rowLinks[i]?.route }))
          }
        }
      };
    }
    return { success: true, data: { _dashboardPayload: { type: "info_card", title: "Comparison", metrics: [], charts: [], tables: [], actions: [], infoContent: "Comparison view is available for accounts." } } };
  }

  return { success: false, error: `Unknown view type: ${view}` };
}

async function navigateTo(args: {
  action: string;
  path?: string;
  elementId?: string;
  dialogType?: string;
  dialogProps?: Record<string, any>;
  description?: string;
}): Promise<ToolResult> {
  const navigationCommand: NavigationCommand = {
    type: args.action as NavigationCommand["type"],
    path: args.path,
    elementId: args.elementId,
    dialogType: args.dialogType,
    dialogProps: args.dialogProps,
    description: args.description || "Navigation"
  };
  
  return {
    success: true,
    data: { navigation: navigationCommand },
    navigationCommand
  };
}

async function showInContext(
  entityType: string,
  entityId: number,
  displayMode?: string
): Promise<ToolResult> {
  let entityData: any = null;
  
  switch (entityType) {
    case "account":
      const account = await storage.getAccount(entityId);
      entityData = account ? {
        id: account.id,
        name: account.name,
        industry: account.industry,
        tier: account.tier,
        healthScore: account.healthScore
      } : null;
      break;
    
    case "project":
      const project = await storage.getProject(entityId);
      entityData = project ? {
        id: project.id,
        name: project.name,
        company: project.companyName,
        phase: project.currentPhase,
        status: project.status
      } : null;
      break;
    
    case "kpi":
      const kpi = await storage.getJobThemeKPI(entityId);
      entityData = kpi ? {
        id: kpi.id,
        name: kpi.kpiName,
        unit: kpi.unit,
        baseline: kpi.baselineValue,
        target: kpi.targetValue
      } : null;
      break;
    
    case "jobTheme":
      const theme = await storage.getJobTheme(entityId);
      entityData = theme ? {
        id: theme.id,
        name: theme.jobName,
        priority: theme.priorityRank,
        solutionArea: theme.solutionArea
      } : null;
      break;
    
    case "successStory":
      const story = await storage.getSuccessStoryLibraryItem(entityId);
      entityData = story ? {
        id: story.id,
        title: story.title,
        industry: story.industry,
        results: story.results,
        approved: story.approvalStatus === "approved"
      } : null;
      break;
  }
  
  if (!entityData) {
    return { success: false, error: `${entityType} not found` };
  }
  
  return {
    success: true,
    data: {
      entityType,
      displayMode: displayMode || "card",
      entity: entityData
    }
  };
}

export async function confirmAndExecuteAction(
  action: string,
  payload: any
): Promise<ToolResult> {
  try {
    switch (action) {
      case "createAccount":
        // Payload is already sanitized in createAccount tool
        const newAccount = await storage.createAccount(payload);
        return { success: true, data: { created: newAccount, message: `Account "${newAccount.name}" created successfully!` } };
      
      case "createInitiative":
        // Payload is already sanitized in createInitiative tool
        const newProject = await storage.createProject(payload);
        return { success: true, data: { created: newProject, message: `Initiative "${newProject.name}" created successfully!` } };
      
      case "createInitiativeWithDiscovery":
        // Create the initiative first
        const initiativePayload = payload.payload || payload;
        const newInitiative = await storage.createProject(initiativePayload);
        
        // Get account name and discovery theme for research
        const accountName = payload.accountName || newInitiative.companyName || "Unknown Company";
        const accountIndustry = payload.accountIndustry || "";
        const discoveryTheme = payload.discoveryTheme || null;
        
        // Run AI research with theme focus
        let researchResult = { dataPoints: [] as any[], headlines: [] as any[] };
        try {
          researchResult = await researchCompany(accountName, accountIndustry || undefined, discoveryTheme || undefined);
          console.log(`[AI Discovery] Generated ${researchResult.dataPoints.length} insights for ${accountName}${discoveryTheme ? ` (theme: ${discoveryTheme})` : ''}`);
          
          // Store the data points as company insights
          for (const dataPoint of researchResult.dataPoints) {
            await storage.createCompanyDataPoint({
              projectId: newInitiative.id,
              label: dataPoint.label,
              value: dataPoint.value,
              confidence: dataPoint.confidence || "medium",
              source: dataPoint.source || "AI Research",
              priorityScore: dataPoint.priorityScore || 3,
              kornFerryPillar: dataPoint.kornFerryPillar || null,
              solutionArea: dataPoint.solutionArea || null,
              relatedKPIs: dataPoint.relatedKPIs || [],
              relevantCapability: dataPoint.relevantCapability || null,
              provenance: { source: "ai_generated", tool: "companion_discovery" }
            });
          }
          
          // Store headlines
          for (const headline of researchResult.headlines) {
            await storage.createHeadline({
              projectId: newInitiative.id,
              title: headline.title,
              date: headline.date || null,
              source: headline.source || null,
              url: headline.url || null
            });
          }
        } catch (researchError) {
          console.error("[AI Discovery] Research failed:", researchError);
          // Continue - initiative is still created even if research fails
        }
        
        return { 
          success: true, 
          data: { 
            created: newInitiative,
            insightsGenerated: researchResult.dataPoints.length,
            headlinesGenerated: researchResult.headlines.length,
            message: `Initiative "${newInitiative.name}" created with ${researchResult.dataPoints.length} AI-generated insights!`
          } 
        };
      
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
