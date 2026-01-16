import OpenAI from "openai";
import { storage } from "./storage";
import type { 
  EvidencePack, 
  SuccessFrameSnapshot, 
  BehaviouralConditionLog, 
  KPIMovementView, 
  SponsorNarrativeSpine,
  InsertAIGuidanceEvent,
  LifecyclePhase
} from "@shared/schema";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

interface InferenceContext {
  projectId: number;
  packId: number;
  currentPhase: LifecyclePhase;
  successFrame?: SuccessFrameSnapshot | null;
  behaviouralLog?: BehaviouralConditionLog | null;
  kpiMovement?: KPIMovementView | null;
  narrative?: SponsorNarrativeSpine | null;
}

interface InferredKPI {
  name: string;
  baseline: string;
  target: string;
  rationale: string;
  confidence: number;
}

interface InferredCondition {
  lever: string;
  behaviour: string;
  linkedKPI: string;
  rationale: string;
  confidence: number;
}

interface InferredNarrativeSection {
  section: "executiveSummary" | "keyOutcomes" | "quotableExcerpt";
  content: string;
  confidence: number;
}

export async function inferKPIsFromContext(
  context: InferenceContext,
  projectDescription: string
): Promise<InferredKPI[]> {
  const prompt = `You are an evidence pack AI assistant for the Korn Ferry Loop platform.

Based on the following project context, suggest 3-5 sponsor-owned KPIs that would be valuable to track.

PROJECT CONTEXT:
${projectDescription}

CURRENT PHASE: ${context.currentPhase}

${context.successFrame ? `EXISTING KPIs:
${JSON.stringify(context.successFrame.kpis, null, 2)}` : 'No KPIs defined yet.'}

For each suggested KPI, provide:
1. A clear, measurable name
2. A suggested baseline value (or "To be confirmed")
3. A realistic target value
4. Rationale for why this KPI matters
5. Confidence level (0-100) in this suggestion

Return JSON in this format:
{
  "kpis": [
    {
      "name": "string",
      "baseline": "string",
      "target": "string",
      "rationale": "string",
      "confidence": number
    }
  ]
}

Focus on KPIs that the SPONSOR would care about - business outcomes, not activity metrics.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const result = JSON.parse(content);
    return result.kpis || [];
  } catch (error) {
    console.error("[Evidence Pack AI] Error inferring KPIs:", error);
    return [];
  }
}

export async function inferBehavioursFromKPIs(
  context: InferenceContext
): Promise<InferredCondition[]> {
  if (!context.successFrame?.kpis || context.successFrame.kpis.length === 0) {
    return [];
  }

  const prompt = `You are an evidence pack AI assistant analyzing the connection between business outcomes and behaviours.

Given these sponsor-owned KPIs:
${JSON.stringify(context.successFrame.kpis, null, 2)}

Suggest behavioural conditions that would indicate progress toward these KPIs.
A behavioural condition follows the pattern: LEVER → BEHAVIOUR → KPI

For example:
- LEVER: "Manager coaching frequency"
- BEHAVIOUR: "Weekly 1:1 coaching sessions observed"
- LINKED KPI: "Employee engagement score"

Return JSON in this format:
{
  "conditions": [
    {
      "lever": "string (the input/intervention)",
      "behaviour": "string (the observable behaviour change)",
      "linkedKPI": "string (which KPI this connects to)",
      "rationale": "string (why this behaviour matters)",
      "confidence": number (0-100)
    }
  ]
}

Suggest 2-4 behavioural conditions. Focus on OBSERVABLE behaviours, not outcomes.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const result = JSON.parse(content);
    return result.conditions || [];
  } catch (error) {
    console.error("[Evidence Pack AI] Error inferring behaviours:", error);
    return [];
  }
}

export async function inferNarrativeFromEvidence(
  context: InferenceContext
): Promise<InferredNarrativeSection[]> {
  const evidence = {
    kpis: context.successFrame?.kpis || [],
    conditions: context.behaviouralLog?.conditions || [],
    movements: context.kpiMovement?.movements || [],
  };

  if (evidence.kpis.length === 0 && evidence.conditions.length === 0) {
    return [];
  }

  const prompt = `You are crafting a sponsor narrative for a Korn Ferry engagement.

Based on the evidence collected:

KPIs TRACKED:
${JSON.stringify(evidence.kpis, null, 2)}

BEHAVIOURAL CONDITIONS:
${JSON.stringify(evidence.conditions, null, 2)}

KPI MOVEMENTS:
${JSON.stringify(evidence.movements, null, 2)}

Generate narrative sections that could be used in sponsor communications:

1. Executive Summary (2-3 sentences capturing the value story)
2. Key Outcomes (bullet points of measurable achievements)
3. Quotable Excerpt (a single sentence a sponsor could use in their own communications)

Return JSON in this format:
{
  "sections": [
    {
      "section": "executiveSummary" | "keyOutcomes" | "quotableExcerpt",
      "content": "string",
      "confidence": number (0-100)
    }
  ]
}

Write in a professional, outcome-focused tone suitable for executive communication.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const result = JSON.parse(content);
    return result.sections || [];
  } catch (error) {
    console.error("[Evidence Pack AI] Error inferring narrative:", error);
    return [];
  }
}

export async function generateGuidanceForPhase(
  context: InferenceContext,
  targetPersona: "seller" | "manager"
): Promise<InsertAIGuidanceEvent[]> {
  const events: InsertAIGuidanceEvent[] = [];
  
  const phaseGuidance = getPhaseGuidanceConfig(context.currentPhase);
  
  const gaps = detectEvidenceGaps(context);
  for (const gap of gaps) {
    events.push({
      projectId: context.projectId,
      packId: context.packId,
      targetPersona,
      guidanceType: "whats_missing",
      title: gap.title,
      message: gap.description,
      priority: gap.severity === "critical" ? "high" : gap.severity === "moderate" ? "medium" : "low",
      triggerEvent: "gap_detected",
      triggerDetails: { gapType: gap.type, artifactType: gap.artifactType },
      suggestedActions: [{
        action: gap.suggestedFix,
        rationale: gap.rationale,
        effort: "low",
        impact: "high",
        route: null
      }],
      status: "pending",
      aiModel: "gpt-4o",
      aiConfidence: gap.confidence,
      aiReasoning: gap.rationale,
    });
  }
  
  const priorities = getPrioritiesForPhase(context);
  for (const priority of priorities) {
    events.push({
      projectId: context.projectId,
      packId: context.packId,
      targetPersona,
      guidanceType: "what_matters",
      title: priority.title,
      message: priority.description,
      priority: priority.urgency,
      triggerEvent: "phase_transition",
      triggerDetails: { phase: context.currentPhase },
      suggestedActions: priority.actions,
      status: "pending",
      aiModel: "gpt-4o",
      aiConfidence: 75,
      aiReasoning: `Phase-appropriate priority for ${context.currentPhase}`,
    });
  }
  
  const nextAction = getNextBestAction(context);
  if (nextAction) {
    events.push({
      projectId: context.projectId,
      packId: context.packId,
      targetPersona,
      guidanceType: "next_action",
      title: nextAction.title,
      message: nextAction.description,
      priority: "high",
      triggerEvent: "time_based",
      triggerDetails: { reason: nextAction.rationale },
      suggestedActions: [{
        action: nextAction.action,
        rationale: nextAction.rationale,
        effort: nextAction.effort,
        impact: nextAction.impact,
        route: nextAction.route
      }],
      status: "pending",
      aiModel: "gpt-4o",
      aiConfidence: 80,
      aiReasoning: nextAction.rationale,
    });
  }
  
  return events;
}

interface EvidenceGap {
  type: "confirmation" | "evidence" | "document";
  title: string;
  description: string;
  severity: "critical" | "moderate" | "minor";
  suggestedFix: string;
  rationale: string;
  artifactType: string;
  confidence: number;
}

function detectEvidenceGaps(context: InferenceContext): EvidenceGap[] {
  const gaps: EvidenceGap[] = [];
  
  if (!context.successFrame || !context.successFrame.kpis || context.successFrame.kpis.length === 0) {
    gaps.push({
      type: "document",
      title: "No Success Frame KPIs defined",
      description: "The Success Frame is empty - sponsor-owned KPIs need to be identified",
      severity: "critical",
      suggestedFix: "Work with sponsor to identify 3-5 key outcomes they care about",
      rationale: "KPIs are the foundation of value measurement",
      artifactType: "success_frame",
      confidence: 95
    });
  } else {
    const unlockedKpis = context.successFrame.kpis.filter((kpi: any) => 
      kpi.baselineStatus === "exploratory" || !kpi.baselineLocked
    );
    if (unlockedKpis.length > 0) {
      gaps.push({
        type: "confirmation",
        title: `${unlockedKpis.length} KPI baseline(s) not confirmed`,
        description: `The following KPIs need baseline confirmation: ${unlockedKpis.map((k: any) => k.kpiName || k.id).join(", ")}`,
        severity: unlockedKpis.length > 2 ? "critical" : "moderate",
        suggestedFix: "Schedule sponsor meeting to confirm baseline values",
        rationale: "Locked baselines are required for credible before/after measurement",
        artifactType: "success_frame",
        confidence: 90
      });
    }
  }
  
  if (!context.behaviouralLog || !context.behaviouralLog.conditions || context.behaviouralLog.conditions.length === 0) {
    if (context.successFrame?.kpis && context.successFrame.kpis.length > 0) {
      gaps.push({
        type: "document",
        title: "No behavioural conditions defined",
        description: "KPIs exist but no lever→behaviour→outcome hypotheses have been captured",
        severity: "moderate",
        suggestedFix: "Define 2-3 behavioural conditions that would indicate progress",
        rationale: "Behaviours are leading indicators of KPI movement",
        artifactType: "behavioural_log",
        confidence: 85
      });
    }
  } else {
    const staleConditions = context.behaviouralLog.conditions.filter((c: any) => {
      const lastObs = c.observations?.[c.observations.length - 1];
      if (!lastObs) return true;
      const daysSinceObs = (Date.now() - new Date(lastObs.date).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceObs > 14;
    });
    if (staleConditions.length > 0) {
      gaps.push({
        type: "evidence",
        title: `${staleConditions.length} condition(s) need observation updates`,
        description: `No recent observations for: ${staleConditions.map((c: any) => c.lever).join(", ")}`,
        severity: "moderate",
        suggestedFix: "Capture field observations from recent engagements",
        rationale: "Regular observation updates maintain evidence currency",
        artifactType: "behavioural_log",
        confidence: 80
      });
    }
  }
  
  if (!context.narrative || !context.narrative.spine?.agreedSuccess?.summary) {
    if (context.kpiMovement?.movements && context.kpiMovement.movements.length > 0) {
      gaps.push({
        type: "document",
        title: "Narrative spine missing executive summary",
        description: "KPI data exists but no sponsor-ready narrative has been crafted",
        severity: "moderate",
        suggestedFix: "Generate draft narrative from accumulated evidence",
        rationale: "The narrative spine is needed for sponsor communications",
        artifactType: "narrative_spine",
        confidence: 85
      });
    }
  }
  
  return gaps;
}

interface PhasePriority {
  title: string;
  description: string;
  urgency: "high" | "medium" | "low";
  actions: Array<{
    action: string;
    rationale: string;
    effort: "low" | "medium" | "high";
    impact: "low" | "medium" | "high";
    route: string | null;
  }>;
}

function getPrioritiesForPhase(context: InferenceContext): PhasePriority[] {
  const priorities: PhasePriority[] = [];
  
  switch (context.currentPhase) {
    case "discover_qualify":
      priorities.push({
        title: "Establish sponsor-owned outcomes",
        description: "Discovery phase priority: identify what success looks like from the sponsor's perspective",
        urgency: "high",
        actions: [{
          action: "Schedule sponsor alignment meeting",
          rationale: "Early sponsor alignment prevents scope creep and ensures buy-in",
          effort: "medium",
          impact: "high",
          route: null
        }]
      });
      break;
      
    case "shape_sell":
      priorities.push({
        title: "Lock KPI baselines before proposal",
        description: "Alignment phase priority: confirm measurable baselines to include in proposal",
        urgency: "high",
        actions: [{
          action: "Confirm baseline data with sponsor",
          rationale: "Locked baselines strengthen proposal credibility",
          effort: "low",
          impact: "high",
          route: null
        }]
      });
      break;
      
    case "deliver_realise":
      priorities.push({
        title: "Capture behavioural observations",
        description: "Realization phase priority: document evidence of change as it happens",
        urgency: "high",
        actions: [{
          action: "Record observations from recent sessions",
          rationale: "Real-time capture prevents evidence loss",
          effort: "low",
          impact: "high",
          route: null
        }]
      });
      break;
      
    case "review_renew":
      priorities.push({
        title: "Prepare QBR narrative",
        description: "Review phase priority: synthesize evidence into sponsor-ready story",
        urgency: "high",
        actions: [{
          action: "Generate executive summary from evidence",
          rationale: "Strong narrative supports renewal conversation",
          effort: "medium",
          impact: "high",
          route: null
        }]
      });
      break;
  }
  
  return priorities;
}

interface NextAction {
  title: string;
  description: string;
  action: string;
  rationale: string;
  effort: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
  route: string | null;
}

function getNextBestAction(context: InferenceContext): NextAction | null {
  if (!context.successFrame?.kpis || context.successFrame.kpis.length === 0) {
    return {
      title: "Define your first sponsor KPI",
      description: "Start building your evidence pack by identifying what the sponsor cares about",
      action: "Add a sponsor-owned KPI to the Success Frame",
      rationale: "Every evidence pack starts with measurable outcomes",
      effort: "low",
      impact: "high",
      route: "/evidence-pack/success-frame"
    };
  }
  
  const unlockedKpis = context.successFrame.kpis.filter((k: any) => !k.baselineLocked);
  if (unlockedKpis.length > 0) {
    return {
      title: `Confirm baseline for "${(unlockedKpis[0] as any).kpiName || unlockedKpis[0].id}"`,
      description: "Lock in the starting point to enable before/after measurement",
      action: "Confirm baseline value with sponsor and lock it",
      rationale: "Locked baselines provide credible measurement foundation",
      effort: "low",
      impact: "high",
      route: "/evidence-pack/success-frame"
    };
  }
  
  if (!context.behaviouralLog?.conditions || context.behaviouralLog.conditions.length === 0) {
    return {
      title: "Add a behavioural hypothesis",
      description: "Define what observable behaviours would indicate KPI progress",
      action: "Create a Lever → Behaviour → KPI hypothesis",
      rationale: "Behaviours are leading indicators that predict KPI movement",
      effort: "medium",
      impact: "high",
      route: "/evidence-pack/behavioural-log"
    };
  }
  
  if (!context.narrative?.spine?.agreedSuccess?.summary && context.kpiMovement?.movements?.length) {
    return {
      title: "Generate narrative from evidence",
      description: "Your evidence is ready to be synthesized into a sponsor story",
      action: "Use AI to draft executive summary from accumulated evidence",
      rationale: "Transform data into compelling sponsor communication",
      effort: "low",
      impact: "high",
      route: "/evidence-pack/narrative-spine"
    };
  }
  
  return null;
}

function getPhaseGuidanceConfig(phase: LifecyclePhase) {
  const config = {
    discover_qualify: {
      focus: "Identify sponsor outcomes",
      keyArtifacts: ["success_frame"],
      guidanceEmphasis: "what_matters"
    },
    shape_sell: {
      focus: "Lock baselines and hypotheses",
      keyArtifacts: ["success_frame", "behavioural_log"],
      guidanceEmphasis: "whats_missing"
    },
    deliver_realise: {
      focus: "Capture evidence of change",
      keyArtifacts: ["behavioural_log", "kpi_movement"],
      guidanceEmphasis: "next_action"
    },
    review_renew: {
      focus: "Synthesize narrative for QBR",
      keyArtifacts: ["narrative_spine", "kpi_movement"],
      guidanceEmphasis: "what_matters"
    },
    learn_scale: {
      focus: "Document reusable patterns",
      keyArtifacts: ["narrative_spine"],
      guidanceEmphasis: "whats_scaling"
    }
  };
  
  return config[phase] || config.discover_qualify;
}

export async function processLifecycleEvent(
  packId: number,
  projectId: number,
  eventType: string,
  eventData: Record<string, any>
): Promise<{ guidanceCreated: number; artifactsUpdated: string[] }> {
  console.log(`[Evidence Pack AI] Processing lifecycle event: ${eventType} for pack ${packId}`);
  
  const pack = await storage.getEvidencePack(packId);
  if (!pack) {
    throw new Error(`Evidence pack ${packId} not found`);
  }
  
  const phase = (pack as any).currentPhase || "discover_qualify";
  const context = await buildInferenceContext(packId, projectId, phase as LifecyclePhase);
  
  const guidanceEvents = await generateGuidanceForPhase(context, "seller");
  
  let guidanceCreated = 0;
  for (const event of guidanceEvents) {
    try {
      await storage.createAIGuidanceEvent(event);
      guidanceCreated++;
    } catch (error) {
      console.error("[Evidence Pack AI] Error creating guidance event:", error);
    }
  }
  
  await storage.createEvidencePackLifecycleEvent({
    packId,
    projectId,
    eventType: eventType as any,
    eventData,
    processed: true,
    processedAt: new Date(),
    guidanceGenerated: guidanceCreated > 0,
    guidanceEventIds: [],
  });
  
  return {
    guidanceCreated,
    artifactsUpdated: []
  };
}

async function buildInferenceContext(
  packId: number, 
  projectId: number, 
  currentPhase: LifecyclePhase
): Promise<InferenceContext> {
  const successFrame = await storage.getSuccessFrameSnapshot(packId);
  const behaviouralLog = await storage.getBehaviouralConditionLog(packId);
  const kpiMovement = await storage.getKPIMovementView(packId);
  const narrative = await storage.getSponsorNarrativeSpine(packId);
  
  return {
    projectId,
    packId,
    currentPhase,
    successFrame,
    behaviouralLog,
    kpiMovement,
    narrative
  };
}

export async function confirmInference(
  guidanceEventId: number,
  confirmed: boolean,
  notes?: string
): Promise<void> {
  const events = await storage.getAIGuidanceEvents(0);
  const event = events.find(e => e.id === guidanceEventId);
  if (!event) {
    throw new Error(`Guidance event ${guidanceEventId} not found`);
  }
  
  await storage.updateAIGuidanceEvent(guidanceEventId, {
    status: confirmed ? "acted_on" : "dismissed",
    actedOnAt: confirmed ? new Date() : undefined,
    dismissedAt: confirmed ? undefined : new Date(),
    dismissReason: confirmed ? undefined : notes,
    wasHelpful: confirmed,
    helpfulnessNotes: notes,
  });
}

export async function getInferredSuggestionsForPack(
  packId: number,
  targetPersona: "seller" | "manager"
): Promise<{
  kpis: InferredKPI[];
  conditions: InferredCondition[];
  narrativeSections: InferredNarrativeSection[];
}> {
  const pack = await storage.getEvidencePack(packId);
  if (!pack) {
    throw new Error(`Evidence pack ${packId} not found`);
  }
  
  const phase = (pack as any).currentPhase || "discover_qualify";
  const context = await buildInferenceContext(
    packId, 
    pack.projectId, 
    phase as LifecyclePhase
  );
  
  const project = await storage.getProject(pack.projectId);
  const projectDescription = (project as any)?.description || project?.name || "Korn Ferry consulting engagement";
  
  const [kpis, conditions, narrativeSections] = await Promise.all([
    inferKPIsFromContext(context, projectDescription),
    inferBehavioursFromKPIs(context),
    inferNarrativeFromEvidence(context)
  ]);
  
  return { kpis, conditions, narrativeSections };
}
