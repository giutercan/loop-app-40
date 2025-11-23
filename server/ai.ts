import OpenAI from "openai";
import { getSolutionSummary } from "@shared/knowledge";
import { z } from "zod";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

interface CompanyResearchResult {
  dataPoints: Array<{
    label: string;
    value: string;
    confidence: "high" | "medium" | "low";
    source: string;
    priorityScore: number;
    kornFerryPillar: "leadership-development" | "talent-acquisition" | "succession-planning" | "culture-transformation" | "organizational-design" | "change-management";
    solutionArea: "ASSESS" | "DEVELOP" | "TRANSFORM" | "REWARD" | "COMMERCIAL" | "ANALYTICS";
    relatedKPIs: string[];
    relevantCapability: string | null; // Auto-classified Korn Ferry capability
  }>;
  headlines: Array<{
    title: string;
    date: string;
    source: string;
    url: string;
  }>;
}

export async function followUpResearch(
  companyName: string, 
  question: string, 
  existingResearch: CompanyResearchResult,
  sector?: string
): Promise<CompanyResearchResult> {
  const knowledgeBase = getSolutionSummary();
  const existingContext = `
Existing Research Summary:
${existingResearch.dataPoints.map(dp => `- [Priority ${dp.priorityScore}] [${dp.solutionArea}] ${dp.label}: ${dp.value}`).join('\n')}

Recent Headlines:
${existingResearch.headlines.map(h => `- ${h.title} (${h.date})`).join('\n')}
`;

  const prompt = `You are helping a Korn Ferry consultant who needs additional information about ${companyName}${sector ? ` (${sector} sector)` : ''}.

${existingContext}

The consultant has asked: "${question}"

KORN FERRY SOLUTIONS & CAPABILITIES:
${knowledgeBase}

KORN FERRY CONSULTING PILLARS (for tagging):
1. leadership-development - Executive development, leadership transitions
2. talent-acquisition - Recruitment strategy, talent pipeline
3. succession-planning - Leadership continuity, bench strength
4. culture-transformation - Cultural change, employee engagement
5. organizational-design - Structure optimization, operating models
6. change-management - Digital transformation, strategic change

KORN FERRY CAPABILITIES (for auto-classification):
1. Success Profiles & Role Design - Job architecture, role clarity, competency frameworks
2. Standardised Assessments & Assessments at Scale - Talent evaluation, assessment programs
3. Leadership & Development Journeys - Executive development, learning programs, leadership pipelines
4. AI-Ready Leader (within L&D) - AI adoption, digital leadership, tech-enabled learning
5. Organisation Strategy & Transformation - Org redesign, operating models, M&A integration
6. Total Rewards Optimisation (TRO) - Compensation strategy, pay equity, rewards programs
7. Sales & Service (KF Sell) - Sales effectiveness, commercial transformation, go-to-market
8. People Analytics / KFI Analytics - Workforce analytics, talent insights, data-driven HR
9. Value Management / Client Success & Talent Suite - Technology platforms, talent systems

Provide 2-4 highly targeted insights that directly answer the question. Each insight must be:
- Specifically addressing the consultant's question
- Tied to a Korn Ferry Solution Area and relevant KPIs
- Strategically actionable and outcome-focused
- Auto-classified to the MOST RELEVANT Korn Ferry capability from the list above

CAPABILITY CLASSIFICATION GUIDANCE:
- You MUST assign a capability to each insight whenever there is ANY reasonable connection
- Only use null if the insight is purely about market conditions or competitive landscape with NO people/talent dimension
- When in doubt, choose the closest capability match - err on the side of classification
- Most insights about leadership → "Leadership & Development Journeys"
- Most insights about talent/hiring → "Standardised Assessments & Assessments at Scale"
- Most insights about org structure → "Organisation Strategy & Transformation"
- Most insights about compensation → "Total Rewards Optimisation (TRO)"
- Most insights about sales/revenue → "Sales & Service (KF Sell)"
- Most insights about data/analytics → "People Analytics / KFI Analytics"

Return your response in JSON format with this exact structure:
{
  "dataPoints": [
    {
      "label": "Brief category",
      "value": "Strategic insight answering the question, linked to KPIs",
      "confidence": "high|medium|low",
      "source": "Specific source",
      "priorityScore": 4,
      "kornFerryPillar": "leadership-development",
      "solutionArea": "DEVELOP",
      "relatedKPIs": ["Business KPI Delta", "Competency Gain"],
      "relevantCapability": "Leadership & Development Journeys"
    }
  ],
  "headlines": [
    {"title": "headline text relevant to the question", "date": "YYYY-MM-DD", "source": "source name", "url": "https://..."}
  ]
}

IMPORTANT:
- Maximum 4 data points - be selective
- Assign priorityScore based on relevance to the question (4-5 for highly relevant, 3 for supporting)
- Each data point MUST have kornFerryPillar matching one of the six pillars
- Each data point MUST have solutionArea matching one of: ASSESS, DEVELOP, TRANSFORM, REWARD, COMMERCIAL, ANALYTICS
- Each data point MUST have relatedKPIs array with 1-3 relevant KPI names from the knowledge base
- Each data point MUST have relevantCapability: the EXACT capability name from the list above (strongly prefer classification over null)
- Focus on answering the specific question, not general research
- Build on existing context without repeating information
- Remember: 95% of insights should have a capability assigned - only truly generic market insights should be null`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 8192,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const result = JSON.parse(content);
    
    return {
      dataPoints: result.dataPoints || [],
      headlines: result.headlines || [],
    };
  } catch (error) {
    console.error("Error in follow-up research:", error);
    throw new Error("Failed to complete follow-up research");
  }
}

export async function researchCompany(companyName: string, sector?: string): Promise<CompanyResearchResult> {
  const knowledgeBase = getSolutionSummary();
  
  const prompt = `You are helping a Korn Ferry consultant prepare for a customer engagement with ${companyName}${sector ? ` (${sector} sector)` : ''}. 

KORN FERRY SOLUTIONS & CAPABILITIES:
${knowledgeBase}

KORN FERRY CONSULTING PILLARS (for tagging):
1. leadership-development - Executive development, leadership transitions, succession readiness
2. talent-acquisition - Recruitment strategy, talent pipeline, diversity hiring
3. succession-planning - Leadership continuity, talent bench strength
4. culture-transformation - Cultural change, employee engagement, organizational values
5. organizational-design - Structure optimization, operating models, workforce planning
6. change-management - Digital transformation, merger integration, strategic change

KORN FERRY CAPABILITIES (for auto-classification):
1. Success Profiles & Role Design - Job architecture, role clarity, competency frameworks
2. Standardised Assessments & Assessments at Scale - Talent evaluation, assessment programs
3. Leadership & Development Journeys - Executive development, learning programs, leadership pipelines
4. AI-Ready Leader (within L&D) - AI adoption, digital leadership, tech-enabled learning
5. Organisation Strategy & Transformation - Org redesign, operating models, M&A integration
6. Total Rewards Optimisation (TRO) - Compensation strategy, pay equity, rewards programs
7. Sales & Service (KF Sell) - Sales effectiveness, commercial transformation, go-to-market
8. People Analytics / KFI Analytics - Workforce analytics, talent insights, data-driven HR
9. Value Management / Client Success & Talent Suite - Technology platforms, talent systems

CRITICAL: Provide ONLY the 8 MOST STRATEGIC insights. Quality over quantity. Each insight must be:
- Directly actionable for a Korn Ferry engagement
- Tied to one of the 6 Solution Areas (ASSESS, DEVELOP, TRANSFORM, REWARD, COMMERCIAL, ANALYTICS)
- Tagged with relevant KPIs from the knowledge base above
- Auto-classified to the MOST RELEVANT Korn Ferry capability from the list above
- Focused on measurable business outcomes that map to Korn Ferry's KPI frameworks

CAPABILITY CLASSIFICATION GUIDANCE:
- You MUST assign a capability to each insight whenever there is ANY reasonable connection
- Only use null if the insight is purely about market conditions or competitive landscape with NO people/talent dimension
- When in doubt, choose the closest capability match - err on the side of classification
- Most insights about leadership → "Leadership & Development Journeys"
- Most insights about talent/hiring → "Standardised Assessments & Assessments at Scale"
- Most insights about org structure → "Organisation Strategy & Transformation"
- Most insights about compensation → "Total Rewards Optimisation (TRO)"
- Most insights about sales/revenue → "Sales & Service (KF Sell)"
- Most insights about data/analytics → "People Analytics / KFI Analytics"

Prioritize insights in this order:
1. Top 3 "Critical Priority" insights (priorityScore: 5) - The most compelling opportunities for Korn Ferry engagement
2. Next 3 "High Priority" insights (priorityScore: 4) - Strong strategic relevance
3. Final 2 "Supporting Context" insights (priorityScore: 3) - Important contextual information

Return your response in JSON format with this exact structure:
{
  "dataPoints": [
    {
      "label": "Brief category (e.g., 'Leadership Transition', 'Digital Transformation')",
      "value": "2-3 sentence strategic insight focusing on business impact and Korn Ferry opportunity. Link to specific KPIs where possible.",
      "confidence": "high|medium|low",
      "source": "Specific source name",
      "priorityScore": 5,
      "kornFerryPillar": "leadership-development",
      "solutionArea": "DEVELOP",
      "relatedKPIs": ["Business KPI Delta", "Competency Gain"],
      "relevantCapability": "Leadership & Development Journeys"
    }
  ],
  "headlines": [
    {"title": "headline text with strategic relevance", "date": "YYYY-MM-DD", "source": "source name", "url": "https://..."}
  ]
}

IMPORTANT REQUIREMENTS:
- EXACTLY 8 data points maximum (no more, no less if possible)
- Each data point MUST have priorityScore (5 for top 3, 4 for next 3, 3 for final 2)
- Each data point MUST have kornFerryPillar matching one of the six pillars exactly
- Each data point MUST have solutionArea matching one of: ASSESS, DEVELOP, TRANSFORM, REWARD, COMMERCIAL, ANALYTICS
- Each data point MUST have relatedKPIs array with 1-3 relevant KPI names from the knowledge base
- Each data point MUST have relevantCapability: the EXACT capability name from the list above (strongly prefer classification over null)
- Focus on transformation initiatives, leadership changes, workforce challenges that map to measurable KPIs
- Use "high" confidence only for verified facts from official sources
- Omit low-value information - every insight must earn its place and connect to Korn Ferry's measurement framework
- Remember: 95% of insights should have a capability assigned - only truly generic market insights should be null`;


  try {
    console.log(`[AI Research] Starting research for ${companyName}...`);
    
    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 8192,
    });

    const content = response.choices[0]?.message?.content || "{}";
    console.log(`[AI Research] Raw AI response length: ${content.length} characters`);
    console.log(`[AI Research] First 500 chars: ${content.substring(0, 500)}`);
    
    const result = JSON.parse(content);
    console.log(`[AI Research] Parsed result - dataPoints: ${result.dataPoints?.length || 0}, headlines: ${result.headlines?.length || 0}`);
    
    return {
      dataPoints: result.dataPoints || [],
      headlines: result.headlines || [],
    };
  } catch (error) {
    console.error("Error researching company:", error);
    throw new Error("Failed to research company with AI");
  }
}

interface DiscoveryQuestionInput {
  capability: string;
  insights: Array<{
    label: string;
    value: string;
    relatedKPIs?: string[];
  }>;
}

interface GeneratedQuestion {
  question: string;
  questionType: "quantitative" | "qualitative" | "both";
  purpose: string;
  relatedKPI: string | null;
}

interface NotesEnrichmentInput {
  freeformNotes: string;
  attachmentContents: Array<{
    fileName: string;
    content: string;
    type: "file" | "voice";
  }>;
}

export async function enrichFromNotes(
  companyName: string,
  notesInput: NotesEnrichmentInput,
  existingResearch: CompanyResearchResult,
  sector?: string
): Promise<CompanyResearchResult> {
  const knowledgeBase = getSolutionSummary();
  const existingContext = `
Existing Research Summary:
${existingResearch.dataPoints.map(dp => `- [Priority ${dp.priorityScore}] [${dp.solutionArea}] ${dp.label}: ${dp.value}`).join('\n')}
`;

  const notesContext = `
CONSULTANT'S NOTES:
${notesInput.freeformNotes || "(No freeform notes)"}

UPLOADED DOCUMENTS & VOICE NOTES:
${notesInput.attachmentContents.length > 0 
  ? notesInput.attachmentContents.map(att => `
[${att.type === "voice" ? "Voice Note" : `File: ${att.fileName}`}]
${att.content}
`).join('\n---\n')
  : "(No attachments)"}
`;

  const prompt = `You are helping a Korn Ferry consultant analyze notes and documents collected about ${companyName}${sector ? ` (${sector} sector)` : ''}.

${existingContext}

${notesContext}

KORN FERRY SOLUTIONS & CAPABILITIES:
${knowledgeBase}

KORN FERRY CONSULTING PILLARS (for tagging):
1. leadership-development - Executive development, leadership transitions
2. talent-acquisition - Recruitment strategy, talent pipeline
3. succession-planning - Leadership continuity, bench strength
4. culture-transformation - Cultural change, employee engagement
5. organizational-design - Structure optimization, operating models
6. change-management - Digital transformation, strategic change

KORN FERRY CAPABILITIES (for auto-classification):
1. Success Profiles & Role Design - Job architecture, role clarity, competency frameworks
2. Standardised Assessments & Assessments at Scale - Talent evaluation, assessment programs
3. Leadership & Development Journeys - Executive development, learning programs, leadership pipelines
4. AI-Ready Leader (within L&D) - AI adoption, digital leadership, tech-enabled learning
5. Organisation Strategy & Transformation - Org redesign, operating models, M&A integration
6. Total Rewards Optimisation (TRO) - Compensation strategy, pay equity, rewards programs
7. Sales & Service (KF Sell) - Sales effectiveness, commercial transformation, go-to-market
8. People Analytics / KFI Analytics - Workforce analytics, talent insights, data-driven HR
9. Value Management / Client Success & Talent Suite - Technology platforms, talent systems

TASK: Extract 3-6 NEW strategic insights from the consultant's notes and attachments that are NOT already captured in the existing research. Focus on:
- Specific metrics, numbers, or data points mentioned
- Client challenges, pain points, or opportunities discussed
- Strategic initiatives or goals mentioned
- Leadership changes or organizational developments
- Any information that could strengthen a value hypothesis

Each insight must be:
- NEW information not already in the existing research
- Tied to a Korn Ferry Solution Area and relevant KPIs
- Strategically actionable and outcome-focused
- Auto-classified to the MOST RELEVANT Korn Ferry capability

CAPABILITY CLASSIFICATION GUIDANCE:
- You MUST assign a capability to each insight whenever there is ANY reasonable connection
- Only use null if the insight is purely about market conditions with NO people/talent dimension
- When in doubt, choose the closest capability match
- Most insights about leadership → "Leadership & Development Journeys"
- Most insights about talent/hiring → "Standardised Assessments & Assessments at Scale"
- Most insights about org structure → "Organisation Strategy & Transformation"
- Most insights about compensation → "Total Rewards Optimisation (TRO)"
- Most insights about sales/revenue → "Sales & Service (KF Sell)"
- Most insights about data/analytics → "People Analytics / KFI Analytics"

Return your response in JSON format with this exact structure:
{
  "dataPoints": [
    {
      "label": "Brief category",
      "value": "Strategic insight extracted from notes, linked to KPIs",
      "confidence": "high|medium|low",
      "source": "Consultant Notes" or "Voice Note" or specific file name,
      "priorityScore": 3-5,
      "kornFerryPillar": "leadership-development",
      "solutionArea": "DEVELOP",
      "relatedKPIs": ["Business KPI Delta", "Competency Gain"],
      "relevantCapability": "Leadership & Development Journeys"
    }
  ],
  "headlines": []
}

IMPORTANT:
- Maximum 6 data points - only extract truly valuable new information
- Assign priorityScore based on strategic value (4-5 for critical insights with numbers, 3 for supporting context)
- Each data point MUST have all required fields
- Use "high" confidence only for specific facts/metrics mentioned
- Use "medium" confidence for discussed plans or intentions
- Use "low" confidence for vague mentions or assumptions
- If no valuable new information is found, return empty dataPoints array
- DO NOT repeat information already in the existing research
- Focus on extracting concrete, measurable insights that could support value calculations`;

  try {
    console.log(`[AI Enrichment] Analyzing notes for ${companyName}...`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 6144,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const result = JSON.parse(content);
    
    console.log(`[AI Enrichment] Extracted ${result.dataPoints?.length || 0} new insights from notes`);
    
    return {
      dataPoints: result.dataPoints || [],
      headlines: [], // No headlines from notes enrichment
    };
  } catch (error) {
    console.error("Error enriching from notes:", error);
    throw new Error("Failed to enrich insights from notes");
  }
}

export async function generateDiscoveryQuestions(
  companyName: string,
  capabilityQuestions: DiscoveryQuestionInput[]
): Promise<Record<string, GeneratedQuestion[]>> {
  const knowledgeBase = getSolutionSummary();
  
  const capabilityContext = capabilityQuestions.map(cq => `
${cq.capability}:
Selected Insights:
${cq.insights.map(i => `- ${i.label}: ${i.value}${i.relatedKPIs && i.relatedKPIs.length > 0 ? ` (KPIs: ${i.relatedKPIs.join(', ')})` : ''}`).join('\n')}
`).join('\n');

  const prompt = `You are a Korn Ferry consultant preparing for a discovery session with ${companyName}. Based on the AI research insights that have been selected, generate targeted discovery questions that will help investigate further and capture data for KPI calculations.

SELECTED INSIGHTS BY CAPABILITY:
${capabilityContext}

KORN FERRY KNOWLEDGE BASE:
${knowledgeBase}

For each capability with selected insights, generate 2-4 discovery questions that:
1. Build on the selected insights to dig deeper into the client's situation
2. Are client-centered and conversational (not internal consulting jargon)
3. Capture both quantitative metrics (for calculations) and qualitative context (for rationale)
4. Map to specific KPIs from the knowledge base when applicable
5. Help bridge insights to value hypotheses

Question types:
- "quantitative": Asks for numbers, metrics, counts, percentages
- "qualitative": Asks for context, challenges, goals, strategies
- "both": Asks for both quantitative data and qualitative context

Return JSON with this structure:
{
  "capabilityName1": [
    {
      "question": "Client-friendly question text",
      "questionType": "quantitative" | "qualitative" | "both",
      "purpose": "Why we're asking this - what it helps us understand",
      "relatedKPI": "Specific KPI name from knowledge base or null"
    }
  ],
  "capabilityName2": [...]
}

EXAMPLES:
For "Leadership & Development Journeys" with insight about leadership transitions:
{
  "question": "How many leadership transitions do you anticipate in the next 12-18 months?",
  "questionType": "quantitative",
  "purpose": "Understand the scale of succession planning needs",
  "relatedKPI": "Leadership Bench Strength"
}

{
  "question": "What are the biggest challenges you've faced with recent leadership transitions?",
  "questionType": "qualitative",
  "purpose": "Identify pain points in current succession process",
  "relatedKPI": null
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const result = JSON.parse(content);
    
    return result;
  } catch (error) {
    console.error("Error generating discovery questions:", error);
    throw new Error("Failed to generate discovery questions with AI");
  }
}

// ============================================================================
// Success Story Recommendations
// ============================================================================

interface SuccessStoryRecommendation {
  title: string;
  url: string;
  category: string;
  relevanceReason: string;
  industry: string;
  capabilityName: string;
  solutionArea: "ASSESS" | "DEVELOP" | "TRANSFORM" | "REWARD" | "COMMERCIAL" | "ANALYTICS";
  impactSummary: string;
}

// Zod schema for validating AI response
const successStoryRecommendationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Must be a valid URL"),
  category: z.string().min(1, "Category is required"),
  relevanceReason: z.string().min(1, "Relevance reason is required"),
  industry: z.string().min(1, "Industry is required"),
  capabilityName: z.string().min(1, "Capability name is required"),
  solutionArea: z.enum(["ASSESS", "DEVELOP", "TRANSFORM", "REWARD", "COMMERCIAL", "ANALYTICS"]),
  impactSummary: z.string().min(1, "Impact summary is required"),
});

const aiSuccessStoriesResponseSchema = z.object({
  recommendations: z.array(successStoryRecommendationSchema).min(1, "At least one recommendation required").max(10, "Too many recommendations"),
});

export async function generateSuccessStoryRecommendations(
  projectContext: {
    companyName: string;
    industry?: string;
    discoveryInsights: Array<{ label: string; value: string; capability: string; solutionArea: string }>;
    alignedKPIs: Array<{ kpiName: string; baseline: string; target: string }>;
    notesContent?: string;
  }
): Promise<{ recommendations: SuccessStoryRecommendation[] }> {
  const knowledgeBase = getSolutionSummary();
  
  const insightsContext = projectContext.discoveryInsights.length > 0
    ? `Discovery Insights:\n${projectContext.discoveryInsights.slice(0, 10).map(i => `- [${i.capability}] ${i.label}: ${i.value}`).join('\n')}`
    : 'No discovery insights available yet.';
  
  const kpisContext = projectContext.alignedKPIs.length > 0
    ? `Key Performance Indicators:\n${projectContext.alignedKPIs.slice(0, 8).map(k => `- ${k.kpiName}: Baseline ${k.baseline} → Target ${k.target}`).join('\n')}`
    : 'No KPIs defined yet.';
  
  const notesContext = projectContext.notesContent 
    ? `Consultant Notes:\n${projectContext.notesContent.slice(0, 1000)}`
    : '';

  const systemPrompt = `You are a Korn Ferry AI assistant. Generate realistic client success story recommendations in JSON format with key "recommendations" containing an array of 3-5 case studies.`;

  const userPrompt = `Generate 3-5 Korn Ferry client success stories for ${projectContext.companyName}${projectContext.industry ? ` (${projectContext.industry})` : ''}.

${insightsContext}

${kpisContext}

Return JSON with this exact structure (no markdown, just raw JSON):
{
  "recommendations": [
    {
      "title": "Descriptive case study title",
      "url": "https://www.kornferry.com/insights/case-studies/example-slug",
      "category": "Transformation category",
      "relevanceReason": "Why this is relevant to the client",
      "industry": "Client industry",
      "capabilityName": "Korn Ferry capability name",
      "solutionArea": "ASSESS or DEVELOP or TRANSFORM or REWARD or COMMERCIAL or ANALYTICS",
      "impactSummary": "Measurable outcomes achieved"
    }
  ]
}

Make each story:
- Aligned with the client's insights and KPIs
- Focused on measurable outcomes
- Tied to a specific Korn Ferry capability
- Realistic and professionally written`;

  try {
    console.log("Calling OpenAI API for success stories...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_completion_tokens: 4000,
      temperature: 0.7,
    });

    console.log("OpenAI API response received");
    console.log("Finish reason:", response.choices[0]?.finish_reason);
    
    let content = response.choices[0]?.message?.content || "";
    console.log("Raw AI response (first 500 chars):", content.substring(0, 500));
    
    // Extract JSON from response (might have markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }
    
    // Parse and validate AI response with Zod
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
      console.log("AI Success Stories Response (parsed):", JSON.stringify(parsedContent, null, 2));
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.error("Raw AI response:", content);
      throw new Error("AI returned invalid JSON response");
    }
    
    // Validate with Zod schema
    const validationResult = aiSuccessStoriesResponseSchema.safeParse(parsedContent);
    if (!validationResult.success) {
      console.error("AI response validation failed:", validationResult.error);
      console.error("Parsed content that failed validation:", JSON.stringify(parsedContent, null, 2));
      throw new Error(`AI response validation failed: ${validationResult.error.message}`);
    }
    
    return validationResult.data;
  } catch (error) {
    console.error("Error generating success story recommendations:", error);
    if (error instanceof Error && error.message.includes("AI")) {
      throw error; // Re-throw AI-specific errors with original message
    }
    throw new Error("Failed to generate success story recommendations with AI");
  }
}

// ============================================================================
// AI-Powered Business Review Agenda Generation
// ============================================================================

interface BusinessReviewAgendaInput {
  companyName: string;
  reviewType: "quarterly" | "monthly" | "ad-hoc";
  projectPhase: "discovery" | "alignment" | "realisation";
  kpiProgress?: Array<{
    kpiName: string;
    baseline: string;
    target: string;
    actual?: string;
    trend: "improving" | "declining" | "stagnant" | "unknown";
  }>;
  previousReviewNotes?: string;
  openActionItems?: Array<{
    description: string;
    owner?: string;
    dueDate?: string;
  }>;
  discoveryInsights?: string[];
}

interface BusinessReviewAgenda {
  suggestedTitle: string;
  objectives: string[];
  topics: Array<{
    title: string;
    duration: string; // e.g., "15 min"
    keyQuestions: string[];
    focusArea: string; // What this topic aims to achieve
  }>;
  actionItems: Array<{
    description: string;
    suggestedOwner?: string;
    rationale: string;
  }>;
  successMetrics: string[]; // What defines a successful review
}

const businessReviewAgendaSchema = z.object({
  suggestedTitle: z.string().min(10),
  objectives: z.array(z.string()).min(2).max(5),
  topics: z.array(z.object({
    title: z.string(),
    duration: z.string(),
    keyQuestions: z.array(z.string()).min(1),
    focusArea: z.string()
  })).min(3).max(8),
  actionItems: z.array(z.object({
    description: z.string(),
    suggestedOwner: z.string().optional(),
    rationale: z.string()
  })).max(6),
  successMetrics: z.array(z.string()).min(2).max(4)
});

export async function generateBusinessReviewAgenda(
  input: BusinessReviewAgendaInput
): Promise<BusinessReviewAgenda> {
  const kpiContext = input.kpiProgress && input.kpiProgress.length > 0 
    ? `
KPI PROGRESS SINCE LAST REVIEW:
${input.kpiProgress.map(kpi => 
  `- ${kpi.kpiName}: Baseline ${kpi.baseline} → ${kpi.actual ? `Current ${kpi.actual}` : 'Not measured yet'} → Target ${kpi.target} (Trend: ${kpi.trend})`
).join('\n')}`
    : 'No KPI progress data available yet.';

  const previousNotesContext = input.previousReviewNotes 
    ? `
PREVIOUS REVIEW KEY TAKEAWAYS:
${input.previousReviewNotes}`
    : 'This is the first business review for this engagement.';

  const actionItemsContext = input.openActionItems && input.openActionItems.length > 0
    ? `
OPEN ACTION ITEMS TO REVIEW:
${input.openActionItems.map(item => 
  `- ${item.description}${item.owner ? ` (Owner: ${item.owner})` : ''}${item.dueDate ? ` (Due: ${item.dueDate})` : ''}`
).join('\n')}`
    : 'No open action items from previous reviews.';

  const insightsContext = input.discoveryInsights && input.discoveryInsights.length > 0
    ? `
KEY DISCOVERY INSIGHTS:
${input.discoveryInsights.slice(0, 5).map(insight => `- ${insight}`).join('\n')}`
    : '';

  const prompt = `You are an expert Korn Ferry consultant preparing a structured business review meeting for ${input.companyName}.

ENGAGEMENT CONTEXT:
- Review Type: ${input.reviewType}
- Current Phase: ${input.projectPhase}

${kpiContext}

${previousNotesContext}

${actionItemsContext}

${insightsContext}

TASK: Generate a professional, focused business review agenda that:
1. Maximizes value for both the client and Korn Ferry team
2. Addresses current performance trends and concerns
3. Builds on previous discussions and open items
4. Creates clear next steps and accountability

BEST PRACTICES:
- Start with wins and progress before challenges
- Focus on data-driven discussions (reference specific KPIs)
- Include time for client feedback and concerns
- Balance strategic discussion with tactical execution
- End with clear action items and next steps
- Keep total meeting to 60-90 minutes

Generate the agenda in this JSON format:

{
  "suggestedTitle": "Descriptive title for the review meeting",
  "objectives": ["Primary goal 1", "Primary goal 2", ...],
  "topics": [
    {
      "title": "Topic name",
      "duration": "15 min",
      "keyQuestions": ["Question to guide discussion", ...],
      "focusArea": "What this topic aims to achieve"
    }
  ],
  "actionItems": [
    {
      "description": "Suggested follow-up action",
      "suggestedOwner": "Role who should own this (e.g., 'Korn Ferry Lead', 'Client CHRO')",
      "rationale": "Why this action is important"
    }
  ],
  "successMetrics": ["How we'll know this review was successful", ...]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 2500,
    });

    const content = response.choices[0]?.message?.content || "{}";
    
    // Parse and validate
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse AI agenda response:", parseError);
      throw new Error("AI returned invalid JSON for business review agenda");
    }
    
    const validationResult = businessReviewAgendaSchema.safeParse(parsedContent);
    if (!validationResult.success) {
      console.error("AI agenda validation failed:", validationResult.error);
      throw new Error(`AI agenda validation failed: ${validationResult.error.message}`);
    }
    
    return validationResult.data;
  } catch (error) {
    console.error("Error generating business review agenda:", error);
    if (error instanceof Error && error.message.includes("AI")) {
      throw error;
    }
    throw new Error("Failed to generate business review agenda with AI");
  }
}

// Schema for industry benchmark response
const industryBenchmarkSchema = z.object({
  benchmarkValue: z.string(),
  rationale: z.string(),
  source: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
});

export async function generateIndustryBenchmark(
  kpiName: string,
  unit: string,
  industry: string,
  companyName: string
): Promise<z.infer<typeof industryBenchmarkSchema>> {
  const prompt = `You are a Korn Ferry industry expert providing realistic benchmark data for management consulting engagements.

CONTEXT:
- Client Company: ${companyName}
- Industry: ${industry}
- KPI: ${kpiName}
- Unit: ${unit}

TASK: Provide a realistic industry benchmark baseline value for this KPI.

GUIDELINES:
1. Use actual industry data ranges when possible
2. Be conservative and realistic - avoid aspirational targets
3. Consider the industry sector and typical company performance
4. Provide a specific numeric value (not a range)
5. Include brief rationale explaining the benchmark
6. Cite credible sources (industry reports, research firms, etc.)

Return JSON format:
{
  "benchmarkValue": "numeric value only (e.g., '45' or '12.5')",
  "rationale": "Brief explanation of why this is a realistic baseline for this industry/KPI",
  "source": "Credible source (e.g., 'Industry average per Gartner 2024', 'McKinsey benchmark data')",
  "confidence": "high|medium|low"
}`;

  try {
    console.log(`[AI Benchmark] Generating for KPI: ${kpiName}, Industry: ${industry}`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    console.log(`[AI Benchmark] Raw response:`, content);
    
    if (!content) {
      throw new Error("AI returned empty response");
    }
    
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
      console.log(`[AI Benchmark] Parsed content:`, parsedContent);
    } catch (parseError) {
      console.error("[AI Benchmark] Failed to parse AI response:", parseError);
      throw new Error("AI returned invalid JSON for industry benchmark");
    }
    
    const validationResult = industryBenchmarkSchema.safeParse(parsedContent);
    if (!validationResult.success) {
      console.error("[AI Benchmark] Validation failed:", validationResult.error);
      console.error("[AI Benchmark] Received data:", parsedContent);
      throw new Error(`AI benchmark validation failed: ${validationResult.error.message}`);
    }
    
    console.log(`[AI Benchmark] Success! Generated benchmark:`, validationResult.data);
    return validationResult.data;
  } catch (error) {
    console.error("[AI Benchmark] Error:", error);
    console.log("[AI Benchmark] Providing fallback benchmark due to AI failure");
    
    // Provide a reasonable fallback when AI fails
    return {
      benchmarkValue: "50",
      rationale: `Industry average for ${industry} sector. Note: This is a fallback value as AI generation encountered an issue. Please verify with actual industry data.`,
      source: "Fallback estimate - verification recommended",
      confidence: "low" as const,
    };
  }
}

// Value Case Recommendation Schema
const valueCaseRecommendationSchema = z.object({
  recommendations: z.array(z.object({
    name: z.string(),
    description: z.string(),
    linkedJobThemeIds: z.array(z.number()),
    suggestedKPIs: z.array(z.string()),
    estimatedNPV: z.string(),
    estimatedPaybackMonths: z.number(),
    rationale: z.string(),
  })).min(3).max(5),
});

interface JobThemeWithKPIs {
  id: number;
  jobName: string;
  capabilityName: string;
  aggregationSummary: string | null;
  sourceInsightIds: number[] | null;
  evidenceCount: number;
  priorityRank: number | null;
  kpis: Array<{
    id: number;
    kpiName: string;
    unit: string;
    baselineValue: string | null;
    targetValue: string | null;
    isPrimary: boolean;
  }>;
}

export async function generateValueCaseRecommendations(
  companyName: string,
  industry: string,
  finalizedJobs: JobThemeWithKPIs[]
): Promise<z.infer<typeof valueCaseRecommendationSchema>> {
  const knowledgeBase = getSolutionSummary();
  
  const jobsSummary = finalizedJobs.map((job, idx) => `
Priority ${idx + 1}: ${job.jobName}
- Capability: ${job.capabilityName}
- Summary: ${job.aggregationSummary || 'No summary available'}
- Evidence Count: ${job.evidenceCount} supporting insights
- KPIs: ${(job.kpis || []).map(k => `${k.kpiName} (${k.baselineValue || 'TBD'} → ${k.targetValue || 'TBD'} ${k.unit})${k.isPrimary ? ' [PRIMARY]' : ''}`).join(', ') || 'No KPIs configured'}
`).join('\n');

  const prompt = `You are a Korn Ferry consultant creating value case recommendations for ${companyName} in the ${industry} industry.

FINALIZED DISCOVERY JOBS & PRIORITIES:
${jobsSummary}

KORN FERRY SOLUTIONS & CAPABILITIES:
${knowledgeBase}

TASK: Generate 3-5 strategic value case recommendations that tie directly to the finalized Discovery jobs above.

REQUIREMENTS:
1. Each value case should address 1-3 of the prioritized jobs
2. Link to specific KPIs from the jobs (use exact KPI names)
3. Provide realistic financial estimates (NPV and payback period)
4. Include clear rationale showing how Discovery insights support this case
5. Focus on high-impact, executable initiatives

VALUE CASE STRUCTURE:
- Name: Clear, action-oriented title (e.g., "Executive Leadership Development Program", "Sales Excellence Transformation")
- Description: 2-3 sentences describing the initiative and expected outcomes
- LinkedJobThemeIds: Array of job IDs this case addresses (use IDs: ${finalizedJobs.map(j => j.id).join(', ')})
- SuggestedKPIs: Exact KPI names from the jobs that this case will impact
- EstimatedNPV: Conservative NPV estimate as string (e.g., "$2.5M over 3 years")
- EstimatedPaybackMonths: Realistic payback period in months (12-36 typical)
- Rationale: How this case connects to Discovery findings and why it's high-priority

Return JSON format:
{
  "recommendations": [
    {
      "name": "Value case name",
      "description": "Detailed description of the initiative and outcomes",
      "linkedJobThemeIds": [1, 2],
      "suggestedKPIs": ["KPI name 1", "KPI name 2"],
      "estimatedNPV": "$X.XM over 3 years",
      "estimatedPaybackMonths": 18,
      "rationale": "Why this case is strategic based on Discovery data"
    }
  ]
}

IMPORTANT:
- Generate 3-5 recommendations (prioritize quality over quantity)
- Use ONLY the job IDs provided: ${finalizedJobs.map(j => j.id).join(', ')}
- Use EXACT KPI names from the jobs listed above
- Be realistic with financial estimates - conservative is better
- Each case should clearly tie back to Discovery evidence`;

  try {
    console.log(`[AI Value Cases] Generating recommendations for ${companyName}`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    console.log(`[AI Value Cases] Raw response:`, content);
    
    if (!content) {
      throw new Error("AI returned empty response");
    }
    
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
      console.log(`[AI Value Cases] Parsed content:`, parsedContent);
    } catch (parseError) {
      console.error("[AI Value Cases] Failed to parse AI response:", parseError);
      throw new Error("AI returned invalid JSON for value case recommendations");
    }
    
    const validationResult = valueCaseRecommendationSchema.safeParse(parsedContent);
    if (!validationResult.success) {
      console.error("[AI Value Cases] Validation failed:", validationResult.error);
      console.error("[AI Value Cases] Received data:", parsedContent);
      throw new Error(`AI value case validation failed: ${validationResult.error.message}`);
    }
    
    console.log(`[AI Value Cases] Success! Generated ${validationResult.data.recommendations.length} recommendations`);
    return validationResult.data;
  } catch (error) {
    console.error("[AI Value Cases] Error:", error);
    throw error; // Don't provide fallback for value cases - frontend should handle error
  }
}

// ============================
// AI Narrative Generation
// ============================

export interface ValueNarrativeInput {
  valueCaseName: string;
  capabilityName: string;
  solutionArea: string;
  challenge: string;
  proposedSolution: string;
  linkedKPIs: Array<{
    kpiName: string;
    unit: string;
    baselineValue: string;
    targetValue: string;
    isPrimary: boolean;
  }>;
  financialResults?: {
    totalNPV: number;
    paybackMonths: number;
    yearOneImpact: number;
    yearTwoImpact: number;
    yearThreeImpact: number;
    implementationCost: number;
  };
  companyName: string;
  industry: string;
  relevantSuccessStories: Array<{
    title: string;
    industry: string;
    capabilityName: string;
    challenge: string;
    solution: string;
    results: string;
    metrics: Record<string, string>;
    clientType: string;
  }>;
}

export interface ValueNarrativeOutput {
  ceoNarrative: {
    title: string;
    executiveSummary: string;
    strategicImperative: string;
    businessImpact: string;
    successStoryHighlight: string;
    callToAction: string;
  };
  cfoNarrative: {
    title: string;
    executiveSummary: string;
    financialCaseOverview: string;
    roiBreakdown: string;
    riskMitigation: string;
    successStoryHighlight: string;
    callToAction: string;
  };
  ctoNarrative: {
    title: string;
    executiveSummary: string;
    implementationApproach: string;
    capabilityBuild: string;
    changeManagement: string;
    successStoryHighlight: string;
    callToAction: string;
  };
}

export async function generateValueNarrative(
  input: ValueNarrativeInput
): Promise<ValueNarrativeOutput> {
  const {
    valueCaseName,
    capabilityName,
    solutionArea,
    challenge,
    proposedSolution,
    linkedKPIs,
    financialResults,
    companyName,
    industry,
    relevantSuccessStories,
  } = input;

  // Format KPIs for prompt
  const kpiSummary = linkedKPIs
    .map(
      (kpi) =>
        `- ${kpi.kpiName}: ${kpi.baselineValue} → ${kpi.targetValue} ${kpi.unit}${kpi.isPrimary ? ' [PRIMARY]' : ''}`
    )
    .join('\n');

  // Format financial results for prompt
  const financialSummary = financialResults
    ? `
FINANCIAL PROJECTIONS:
- Net Present Value (NPV): £${financialResults.totalNPV.toLocaleString()} over 3 years
- Payback Period: ${financialResults.paybackMonths} months
- Year 1 Impact: £${financialResults.yearOneImpact.toLocaleString()}
- Year 2 Impact: £${financialResults.yearTwoImpact.toLocaleString()}
- Year 3 Impact: £${financialResults.yearThreeImpact.toLocaleString()}
- Implementation Cost: £${financialResults.implementationCost.toLocaleString()}
- ROI: ${((financialResults.totalNPV / financialResults.implementationCost) * 100).toFixed(0)}%
`
    : `
ESTIMATED FINANCIAL IMPACT:
- Detailed financial calculations are being developed
- Conservative estimates suggest significant positive ROI
- Full financial model will be available upon engagement
`;

  // Format success stories for prompt
  const successStoriesSummary = relevantSuccessStories
    .map(
      (story, idx) => `
SUCCESS STORY ${idx + 1}: ${story.title}
- Industry: ${story.industry}
- Client Type: ${story.clientType}
- Capability: ${story.capabilityName}
- Challenge: ${story.challenge}
- Solution: ${story.solution}
- Results: ${story.results}
- Key Metrics: ${Object.entries(story.metrics || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}
`
    )
    .join('\n');

  const prompt = `You are a senior Korn Ferry consultant crafting compelling value narratives for different stakeholders at ${companyName} in the ${industry} industry.

VALUE CASE OVERVIEW:
Name: ${valueCaseName}
Capability: ${capabilityName}
Solution Area: ${solutionArea}
Challenge: ${challenge}
Proposed Solution: ${proposedSolution}

KEY PERFORMANCE INDICATORS:
${kpiSummary}

${financialSummary}

RELEVANT VERIFIED KORN FERRY SUCCESS STORIES (for credibility and proof points):
${successStoriesSummary}

TASK: Generate THREE distinct value narratives, each optimized for a specific C-suite stakeholder:

1. CEO NARRATIVE - Strategic Focus
   - Emphasize business transformation, competitive advantage, strategic alignment
   - Lead with vision and market positioning
   - Use success story to demonstrate strategic outcomes
   - Keep it inspiring and forward-looking

2. CFO NARRATIVE - Financial Focus
   - Lead with ROI, payback period, and risk mitigation
   - Emphasize measurable financial outcomes and prudent investment
   - Use success story to demonstrate financial returns
   - Keep it data-driven and conservative

3. CTO/Operations NARRATIVE - Implementation Focus
   - Emphasize capability building, change management, and execution
   - Focus on how the transformation will be achieved
   - Use success story to demonstrate implementation approach
   - Keep it pragmatic and execution-oriented

GUIDELINES:
- Each narrative should be 300-500 words total across all sections
- Weave in success story details naturally - don't just copy-paste
- Use specific metrics from success stories as proof points
- Maintain Korn Ferry's professional yet confident tone
- Make it personal to ${companyName}'s context and challenges
- Each narrative should feel distinct in tone and emphasis

Return JSON format:
{
  "ceoNarrative": {
    "title": "Compelling title for CEO (8-12 words)",
    "executiveSummary": "One-paragraph overview emphasizing strategic value (60-80 words)",
    "strategicImperative": "Why this matters strategically, competitive positioning (80-100 words)",
    "businessImpact": "Expected business outcomes and transformation (80-100 words)",
    "successStoryHighlight": "How a similar client achieved strategic results - woven naturally into context (60-80 words)",
    "callToAction": "Clear next steps for CEO (30-40 words)"
  },
  "cfoNarrative": {
    "title": "Compelling title for CFO (8-12 words)",
    "executiveSummary": "One-paragraph overview emphasizing financial prudence (60-80 words)",
    "financialCaseOverview": "High-level financial case and investment rationale (80-100 words)",
    "roiBreakdown": "Detailed ROI explanation with key metrics (80-100 words)",
    "riskMitigation": "How this investment mitigates risk and ensures returns (60-80 words)",
    "successStoryHighlight": "How a similar client achieved financial results - woven naturally into context (60-80 words)",
    "callToAction": "Clear next steps for CFO (30-40 words)"
  },
  "ctoNarrative": {
    "title": "Compelling title for CTO/Operations (8-12 words)",
    "executiveSummary": "One-paragraph overview emphasizing implementation excellence (60-80 words)",
    "implementationApproach": "How the transformation will be executed (80-100 words)",
    "capabilityBuild": "What capabilities will be built and how (80-100 words)",
    "changeManagement": "How change will be managed and adoption ensured (60-80 words)",
    "successStoryHighlight": "How a similar client implemented successfully - woven naturally into context (60-80 words)",
    "callToAction": "Clear next steps for CTO/Operations (30-40 words)"
  }
}

IMPORTANT:
- Be specific to ${companyName} and ${industry}
- Use actual metrics from success stories as proof points
- Each narrative should feel authentic to that stakeholder's priorities
- Don't fabricate metrics - use only what's provided in success stories or financial results
- Success story highlights should flow naturally, not feel like testimonials`;

  try {
    console.log(`[AI Narrative] Generating value narrative for: ${valueCaseName}`);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 3000,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("AI returned empty response");
    }

    const parsedContent = JSON.parse(content);

    // Validate structure (basic check)
    if (
      !parsedContent.ceoNarrative ||
      !parsedContent.cfoNarrative ||
      !parsedContent.ctoNarrative
    ) {
      throw new Error("AI response missing required narrative sections");
    }

    console.log(`[AI Narrative] Success! Generated narratives for all stakeholders`);
    return parsedContent as ValueNarrativeOutput;
  } catch (error) {
    console.error("[AI Narrative] Error:", error);
    throw error;
  }
}
