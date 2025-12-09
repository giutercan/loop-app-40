import OpenAI from "openai";
import { 
  getSolutionSummary, 
  COMPETITORS, 
  KORN_FERRY_DIFFERENTIATORS, 
  COMPETITIVE_COMPARISONS,
  getCompetitorsBySolutionArea,
  getDifferentiatorsBySolutionArea,
  getCompetitiveComparison
} from "@shared/knowledge";
import { z } from "zod";

// Export the OpenAI client for use in routes.ts
export const openai = new OpenAI({
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

export async function researchCompany(companyName: string, sector?: string, discoveryTheme?: string): Promise<CompanyResearchResult> {
  const knowledgeBase = getSolutionSummary();
  
  const themeContext = discoveryTheme 
    ? `\n\nDISCOVERY THEME FOCUS: "${discoveryTheme}"
ALL insights MUST be directly relevant to this theme. Filter out insights that don't connect to ${discoveryTheme}. 
Prioritize research angles that will help the consultant have meaningful conversations about ${discoveryTheme}.`
    : '';
  
  const prompt = `You are helping a Korn Ferry consultant prepare for a customer engagement with ${companyName}${sector ? ` (${sector} sector)` : ''}.${themeContext}

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
- Directly actionable for a Korn Ferry engagement${discoveryTheme ? `\n- HIGHLY RELEVANT to the discovery theme: "${discoveryTheme}"` : ''}
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
  methodology?: "MILLER_HEIMAN" | "SPIN" | "PSS" | null;
  methodologyStage?: string | null;
  purpose: string;
  relatedKPI: string | null;
  followUpHint?: string | null;
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
  capabilityQuestions: DiscoveryQuestionInput[],
  companyContext?: {
    sector?: string | null;
    industry?: string | null;
    employeeCount?: number | null;
    revenue?: string | null;
    headquarters?: string | null;
    description?: string | null;
  }
): Promise<Record<string, GeneratedQuestion[]>> {
  const knowledgeBase = getSolutionSummary();
  
  const capabilityContext = capabilityQuestions.map(cq => `
${cq.capability}:
Job Theme Insights:
${cq.insights.map(i => `- ${i.label}: ${i.value}${i.relatedKPIs && i.relatedKPIs.length > 0 ? ` (KPIs: ${i.relatedKPIs.join(', ')})` : ''}`).join('\n')}
`).join('\n');

  // Build company profile context
  const companyProfileContext = companyContext ? `
=== COMPANY PROFILE ===
Company: ${companyName}
${companyContext.sector ? `Sector: ${companyContext.sector}` : ''}
${companyContext.industry ? `Industry: ${companyContext.industry}` : ''}
${companyContext.employeeCount ? `Size: ~${companyContext.employeeCount.toLocaleString()} employees` : ''}
${companyContext.revenue ? `Revenue: ${companyContext.revenue}` : ''}
${companyContext.headquarters ? `Headquarters: ${companyContext.headquarters}` : ''}
${companyContext.description ? `Overview: ${companyContext.description}` : ''}
` : '';

  const prompt = `You are a Korn Ferry consultant preparing for a discovery session with ${companyName}. You are trained in three proven sales and consulting methodologies that Korn Ferry uses to guide impactful client conversations.
${companyProfileContext}

=== CRITICAL CONTEXT ===
Your questions MUST be highly relevant and specific to:
1. THE CUSTOMER: ${companyName} - their specific industry, market position, and known challenges
2. LINE OF BUSINESS: Understand which business units, divisions, or functions are affected
3. SOLUTION FIT: Explore how Korn Ferry's specific capabilities can address their needs
4. CONTEXT: Build on the research insights gathered about their situation
5. FINDINGS: Validate and quantify the opportunities identified in preliminary research

=== KORN FERRY METHODOLOGIES ===

1. MILLER HEIMAN STRATEGIC SELLING
   - Focuses on identifying and influencing all stakeholders in complex sales
   - Key question types:
     * Conceptual Questions: Understand client's vision, goals, strategic direction
     * Attitude Questions: Uncover beliefs, concerns, and receptivity to change
     * Commitment Questions: Gauge readiness to act and investment appetite
   
2. SPIN SELLING (Situation, Problem, Implication, Need-Payoff)
   - Structured questioning to uncover pain and build urgency
   - Question progression:
     * Situation: Current state facts, context, and baseline metrics
     * Problem: Challenges, pain points, inefficiencies, gaps
     * Implication: Business impact, cost of inaction, ripple effects
     * Need-Payoff: Value of solving, benefits of improvement, ROI potential
   
3. PSS (PROFESSIONAL SELLING SKILLS)
   - Customer-centered discovery to understand needs before presenting solutions
   - Question types:
     * Open Probes: Broad questions to explore priorities and concerns
     * Control Probes: Specific questions to quantify and validate
     * Confirm Probes: Verify understanding and alignment

=== INSTRUCTIONS ===

Based on the highlighted priorities (job themes) below, generate the TOP 12 MOST IMPACTFUL discovery questions. Tag each question with the methodology and stage that best describes it.

JOB THEME INSIGHTS BY CAPABILITY (these are the key findings from our research on ${companyName}):
${capabilityContext}

KORN FERRY KNOWLEDGE BASE:
${knowledgeBase}

=== QUESTION RELEVANCE REQUIREMENTS ===
EVERY question MUST:
1. Reference ${companyName} by name or clearly relate to their specific situation
2. Connect to a specific finding or insight from the research above
3. Explore the line of business impact (which teams, functions, or divisions)
4. Lead toward a Korn Ferry solution area
5. Help quantify the opportunity or validate the challenge

Generate EXACTLY 12 high-impact discovery questions that:
1. Use a MIX of all three methodologies (at least 3 questions per methodology)
2. Progress logically from situation/context to impact/value
3. Are client-centered and conversational (not internal consulting jargon)
4. Prioritize questions that capture quantitative metrics for value calculations
5. Map to specific KPIs from the knowledge base when applicable
6. Help bridge insights to measurable business outcomes
7. ARE SPECIFIC TO ${companyName} - NOT generic questions that could apply to any company

Return JSON with this structure:
{
  "capabilityName1": [
    {
      "question": "Client-friendly question text that references ${companyName} or their specific situation",
      "questionType": "quantitative" | "qualitative" | "both",
      "methodology": "MILLER_HEIMAN" | "SPIN" | "PSS",
      "methodologyStage": "For SPIN: situation|problem|implication|need_payoff. For Miller Heiman: conceptual|attitude|commitment. For PSS: open_probe|control_probe|confirm_probe",
      "purpose": "Why we're asking this - what it helps us understand about ${companyName}",
      "contextFromFindings": "Which specific insight or finding from our research prompted this question",
      "lineOfBusinessFocus": "Which business unit, function, or division this question explores",
      "kornFerrySolutionLink": "Which Korn Ferry solution or capability this leads toward",
      "relatedKPI": "Specific KPI name from knowledge base or null",
      "followUpHint": "Suggested follow-up if they answer positively or negatively"
    }
  ],
  "capabilityName2": [...]
}

=== EXAMPLES (showing how to make questions SPECIFIC to the client) ===

SPIN - Situation (referencing research findings):
{
  "question": "Based on your recent digital transformation announcement, how many roles in your technology organization will need significant reskilling over the next 18 months?",
  "questionType": "quantitative",
  "methodology": "SPIN",
  "methodologyStage": "situation",
  "purpose": "Quantify the scale of transformation impact on talent",
  "contextFromFindings": "Client announced $500M digital transformation initiative",
  "lineOfBusinessFocus": "Technology and IT organizations",
  "kornFerrySolutionLink": "Leadership & Development Journeys, Organisation Strategy & Transformation",
  "relatedKPI": "Leadership Bench Strength",
  "followUpHint": "If high number: Ask about current development capacity and timeline"
}

SPIN - Implication (connecting to business impact):
{
  "question": "Given your Q3 emphasis on 'talent agility', what's the estimated revenue impact when key positions in your sales organization remain unfilled for extended periods?",
  "questionType": "both",
  "methodology": "SPIN",
  "methodologyStage": "implication",
  "purpose": "Quantify the cost of talent gaps in commercial functions",
  "contextFromFindings": "CEO emphasized 'talent agility' in recent earnings call",
  "lineOfBusinessFocus": "Sales and commercial operations",
  "kornFerrySolutionLink": "Sales & Service (KF Sell), Standardised Assessments",
  "relatedKPI": "Cost of Vacancy",
  "followUpHint": "Probe into specific territory coverage gaps or deal pipeline impact"
}

MILLER HEIMAN - Commitment:
{
  "question": "Your CHRO mentioned building 'bench strength for the next decade of growth' - if we could accelerate your leadership readiness by 40%, what strategic initiatives would that unlock?",
  "questionType": "qualitative",
  "methodology": "MILLER_HEIMAN",
  "methodologyStage": "commitment",
  "purpose": "Connect leadership development to strategic business outcomes",
  "contextFromFindings": "CHRO discussed 3-year plan to develop 120 senior leaders at industry conference",
  "lineOfBusinessFocus": "Senior leadership across business units",
  "kornFerrySolutionLink": "Leadership & Development Journeys, Success Profiles",
  "relatedKPI": "Time to Full Productivity",
  "followUpHint": "If interested: Explore which initiatives are blocked by leadership readiness"
}

PSS - Control Probe:
{
  "question": "Of your 120 targeted senior leader development candidates, what percentage would you say are ready-now for their next role versus needing 12-24 months of development?",
  "questionType": "quantitative",
  "methodology": "PSS",
  "methodologyStage": "control_probe",
  "purpose": "Quantify the gap between current state and target readiness",
  "contextFromFindings": "CHRO's 3-year plan to develop 120 senior leaders",
  "lineOfBusinessFocus": "Executive and senior leadership pipeline",
  "kornFerrySolutionLink": "Standardised Assessments, Leadership & Development Journeys",
  "relatedKPI": "Succession Coverage Ratio",
  "followUpHint": "Compare to best-in-class benchmark of 70-80% ready-now"
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

// KPI Rationale Schema
const kpiRationaleSchema = z.object({
  rationale: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
});

interface GenerateKPIRationaleParams {
  kpiName: string;
  unit: string;
  baselineValue: string;
  targetValue: string;
  companyName: string;
  industry: string;
  customerResponses?: Array<{
    question: string;
    answer: string;
    respondentName: string | null;
  }>;
  companyInsights?: Array<{
    label: string;
    value: string;
  }>;
}

export async function generateKPIRationale(
  params: GenerateKPIRationaleParams
): Promise<z.infer<typeof kpiRationaleSchema>> {
  const {
    kpiName,
    unit,
    baselineValue,
    targetValue,
    companyName,
    industry,
    customerResponses = [],
    companyInsights = []
  } = params;

  const baselineNum = parseFloat(baselineValue);
  const targetNum = parseFloat(targetValue);
  
  // Guard against invalid numbers or division by zero
  let improvement: string;
  if (isNaN(baselineNum) || isNaN(targetNum)) {
    improvement = "N/A (invalid numeric values)";
  } else if (baselineNum === 0) {
    improvement = "N/A (baseline is zero)";
  } else {
    improvement = ((targetNum - baselineNum) / baselineNum * 100).toFixed(1) + "%";
  }

  const contextSections = [];

  // Add customer responses if available
  if (customerResponses.length > 0) {
    const responsesText = customerResponses
      .map(r => `Q: ${r.question}\nA: ${r.answer} (${r.respondentName || 'Customer'})`)
      .join('\n\n');
    contextSections.push(`CUSTOMER QUESTIONNAIRE RESPONSES:\n${responsesText}`);
  }

  // Add company insights if available
  if (companyInsights.length > 0) {
    const insightsText = companyInsights
      .map(i => `- ${i.label}: ${i.value}`)
      .join('\n');
    contextSections.push(`COMPANY RESEARCH INSIGHTS:\n${insightsText}`);
  }

  const contextText = contextSections.length > 0 
    ? `\n\n${contextSections.join('\n\n')}`
    : '';

  const prompt = `You are a Korn Ferry management consultant helping to build a value case for ${companyName} (${industry} industry).

KPI DETAILS:
- Metric: ${kpiName}
- Current Baseline: ${baselineValue} ${unit}
- Target: ${targetValue} ${unit}
- Improvement: ${improvement}
${contextText}

TASK: Generate a brief, professional rationale (2-3 sentences) explaining why these baseline and target values are appropriate for this client.

GUIDELINES:
1. Reference customer responses or company insights when available
2. Explain why the baseline makes sense given the company's current state
3. Justify why the target is achievable and impactful
4. Keep it concise and professional
5. Focus on business context, not just the numbers

Return JSON format:
{
  "rationale": "2-3 sentence professional explanation of why these values make sense for this client",
  "confidence": "high|medium|low" (high if customer responses or strong data available, medium if some context, low if minimal context)
}`;

  try {
    console.log(`[AI Rationale] Generating for KPI: ${kpiName} (${baselineValue} → ${targetValue} ${unit})`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 300,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("AI returned empty response");
    }
    
    const parsedContent = JSON.parse(content);
    const validationResult = kpiRationaleSchema.safeParse(parsedContent);
    
    if (!validationResult.success) {
      console.error("[AI Rationale] Validation failed:", validationResult.error);
      throw new Error(`AI rationale validation failed: ${validationResult.error.message}`);
    }
    
    console.log(`[AI Rationale] Success! Generated rationale`);
    return validationResult.data;
  } catch (error) {
    console.error("[AI Rationale] Error:", error);
    throw new Error("Failed to generate KPI rationale with AI");
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
    kpiType: "primary" | "supporting";
    unit: string;
    baselineValue: string | null;
    targetValue: string | null;
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
- KPIs: ${(job.kpis || []).map(k => `${k.kpiName} (${k.baselineValue || 'TBD'} → ${k.targetValue || 'TBD'} ${k.unit})${k.kpiType === "primary" ? ' [PRIMARY]' : ''}`).join(', ') || 'No KPIs configured'}
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
// KPI-Based Value Case Recommendations
// ============================

const kpiValueCaseSchema = z.object({
  recommendations: z.array(z.object({
    title: z.string(),
    description: z.string(),
    expectedImpact: z.string(),
    timeline: z.string(),
    confidence: z.enum(["high", "medium", "low"]),
    relatedSuccessPattern: z.string().optional(),
    keyActivities: z.array(z.string()),
  })).min(2).max(4),
});

export interface KPIValueCaseInput {
  kpiName: string;
  kpiDescription: string;
  pillar: string;
  category: string;
  unit: string;
  baseline?: string | null;
  target?: string | null;
  benchmarkRange?: { low: number; mid: number; high: number };
  companyName: string;
  industry: string;
}

export async function generateKPIValueCaseRecommendations(
  input: KPIValueCaseInput
): Promise<z.infer<typeof kpiValueCaseSchema>> {
  const knowledgeBase = getSolutionSummary();
  
  const prompt = `You are a Korn Ferry consultant helping ${input.companyName} (${input.industry} industry) achieve a specific customer outcome.

CUSTOMER OUTCOME (KPI):
- Name: ${input.kpiName}
- Description: ${input.kpiDescription}
- Value Pillar: ${input.pillar}
- Category: ${input.category}
- Unit: ${input.unit}
${input.baseline ? `- Current Baseline: ${input.baseline} ${input.unit}` : '- Baseline: Not yet measured'}
${input.target ? `- Target: ${input.target} ${input.unit}` : '- Target: Not yet defined'}
${input.benchmarkRange ? `- Industry Benchmarks: Low=${input.benchmarkRange.low}, Mid=${input.benchmarkRange.mid}, High=${input.benchmarkRange.high}` : ''}

KORN FERRY SOLUTIONS & CAPABILITIES:
${knowledgeBase}

TASK: Generate 2-4 value case recommendations - specific initiatives that Korn Ferry can deliver to help the customer achieve this KPI outcome.

REQUIREMENTS:
1. Each recommendation should be a concrete, executable initiative
2. Focus on CUSTOMER VALUE - what they will achieve, not what Korn Ferry will sell
3. Include realistic timelines (typical ranges: 3-6 months for quick wins, 12-18 months for transformations)
4. Confidence levels should reflect how well-proven the approach is
5. Key activities should be specific and actionable

Return JSON format:
{
  "recommendations": [
    {
      "title": "Initiative name focused on customer outcome",
      "description": "2-3 sentences describing what this initiative delivers for the customer",
      "expectedImpact": "Specific, quantified impact on the KPI (e.g., '15-25% improvement in retention rate')",
      "timeline": "Realistic timeline (e.g., '6-9 months')",
      "confidence": "high|medium|low",
      "relatedSuccessPattern": "Brief reference to similar successful engagements",
      "keyActivities": ["Activity 1", "Activity 2", "Activity 3"]
    }
  ]
}

IMPORTANT:
- Focus on CUSTOMER OUTCOMES not Korn Ferry offerings
- Be specific about expected impact on the KPI
- Prioritize proven approaches with high confidence first
- Include mix of quick wins and longer-term transformations`;

  try {
    console.log(`[AI KPI Value Cases] Generating recommendations for KPI: ${input.kpiName}`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("AI returned empty response");
    }
    
    const parsedContent = JSON.parse(content);
    const validationResult = kpiValueCaseSchema.safeParse(parsedContent);
    
    if (!validationResult.success) {
      console.error("[AI KPI Value Cases] Validation failed:", validationResult.error);
      throw new Error("Invalid AI response structure");
    }
    
    console.log(`[AI KPI Value Cases] Generated ${validationResult.data.recommendations.length} recommendations`);
    return validationResult.data;
  } catch (error) {
    console.error("[AI KPI Value Cases] Error:", error);
    throw error;
  }
}

// ============================
// AI Narrative Generation
// ============================

// Zod schema for validating AI narrative responses
const narrativeSectionSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  executiveSummary: z.string().min(50, "Executive summary must be at least 50 characters"),
  strategicImperative: z.string().optional(),
  businessImpact: z.string().optional(),
  financialCaseOverview: z.string().optional(),
  roiBreakdown: z.string().optional(),
  riskMitigation: z.string().optional(),
  implementationApproach: z.string().optional(),
  capabilityBuild: z.string().optional(),
  changeManagement: z.string().optional(),
  successStoryHighlight: z.string().min(50, "Success story highlight required"),
  callToAction: z.string().min(20, "Call to action required"),
});

const valueNarrativeOutputSchema = z.object({
  ceoNarrative: narrativeSectionSchema.extend({
    strategicImperative: z.string().min(50, "Strategic imperative required for CEO"),
    businessImpact: z.string().min(50, "Business impact required for CEO"),
  }),
  cfoNarrative: narrativeSectionSchema.extend({
    financialCaseOverview: z.string().min(50, "Financial case overview required for CFO"),
    roiBreakdown: z.string().min(50, "ROI breakdown required for CFO"),
    riskMitigation: z.string().min(40, "Risk mitigation required for CFO"),
  }),
  ctoNarrative: narrativeSectionSchema.extend({
    implementationApproach: z.string().min(50, "Implementation approach required for CTO"),
    capabilityBuild: z.string().min(50, "Capability build required for CTO"),
    changeManagement: z.string().min(40, "Change management required for CTO"),
  }),
});

export type ValueNarrativeOutput = z.infer<typeof valueNarrativeOutputSchema>;

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
    kpiType: "primary" | "supporting";
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
        `- ${kpi.kpiName}: ${kpi.baselineValue} → ${kpi.targetValue} ${kpi.unit}${kpi.kpiType === "primary" ? ' [PRIMARY]' : ''}`
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

    // Strict Zod validation to ensure all required stakeholder sections and fields are present
    const validationResult = valueNarrativeOutputSchema.safeParse(parsedContent);
    if (!validationResult.success) {
      console.error("[AI Narrative] Validation failed:", validationResult.error);
      console.error("[AI Narrative] Received data:", parsedContent);
      throw new Error(`AI narrative validation failed: ${validationResult.error.message}. Response does not meet CEO/CFO/CTO section requirements.`);
    }

    console.log(`[AI Narrative] Success! Generated and validated narratives for all stakeholders`);
    return validationResult.data;
  } catch (error) {
    console.error("[AI Narrative] Error:", error);
    throw error;
  }
}

// KPI Recommendation Schema - Enhanced with industry benchmarks and achievement explanations
const kpiRecommendationSchema = z.object({
  kpiName: z.string().min(5, "Outcome name must be at least 5 characters"),
  kpiType: z.enum(["primary", "supporting"]),
  unit: z.string().min(1, "Unit is required"),
  definition: z.string().min(20, "Definition must be at least 20 characters"),
  strategicRationale: z.string().min(50, "Strategic rationale must be at least 50 characters"),
  achievabilityScore: z.number().int().min(1).max(10),
  valueImpactScore: z.number().int().min(1).max(10),
  kornFerryBenchmark: z.string().min(10, "Benchmark must be at least 10 characters"),
  measurementFrequency: z.string().min(3, "Measurement frequency required"),
  industryBenchmark: z.object({
    low: z.string().describe("Bottom quartile performance"),
    median: z.string().describe("Industry median/average"),
    high: z.string().describe("Top quartile/best-in-class performance"),
    source: z.string().describe("Credible data source"),
  }).optional(),
  targetRecommendation: z.object({
    suggestedTarget: z.string().describe("Recommended target value"),
    achievementRationale: z.string().describe("2-3 sentence explanation of WHY this target is achievable"),
    timeframeMonths: z.number().int().min(3).max(24).describe("Expected months to achieve"),
    successFactors: z.array(z.string()).min(2).max(4).describe("Key factors that make this achievable"),
  }).optional(),
});

// Discovery-based KPI suggestion schema (includes pillar and insight linkage)
const discoveryKpiSuggestionSchema = z.object({
  kpiName: z.string().min(5),
  kpiType: z.enum(["primary", "supporting"]),
  unit: z.string().min(1),
  definition: z.string().min(20),
  strategicRationale: z.string().min(30),
  valuePillar: z.enum(["Grow", "Optimise", "De-risk", "Strengthen Capability"]),
  baselineEstimate: z.string(),
  targetEstimate: z.string(),
  baselineReasoning: z.string().min(20),
  industryBenchmark: z.object({
    low: z.string(),
    median: z.string(),
    high: z.string(),
    source: z.string(),
  }),
  kornFerryBenchmark: z.object({
    topQuartile: z.string(),
    typical: z.string(),
    context: z.string(),
  }),
  achievabilityScore: z.number().int().min(1).max(10),
  valueImpactScore: z.number().int().min(1).max(10),
  sourceInsightTitle: z.string(),
});

const discoveryKpiSuggestionsOutputSchema = z.object({
  suggestions: z.array(discoveryKpiSuggestionSchema).min(3).max(6),
});

export type DiscoveryKpiSuggestion = z.infer<typeof discoveryKpiSuggestionSchema>;

interface GenerateDiscoveryKpiSuggestionsParams {
  companyName: string;
  industry?: string;
  discoveryTheme: string;
  insights: Array<{
    id: number;
    title: string;
    value: string;
    category?: string;
    priority?: string;
    relatedKPIs?: string[];
  }>;
  consultantNotes?: string;
}

export async function generateDiscoveryKpiSuggestions(
  params: GenerateDiscoveryKpiSuggestionsParams
): Promise<DiscoveryKpiSuggestion[]> {
  const { companyName, industry, discoveryTheme, insights, consultantNotes } = params;
  
  const knowledgeBase = getSolutionSummary();
  
  const insightsSummary = insights.map((i, idx) => 
    `[#${i.id}] ${i.title}: ${i.value}${i.category ? ` (Category: ${i.category})` : ''}${i.priority ? ` [Priority: ${i.priority}]` : ''}${i.relatedKPIs?.length ? ` Related KPIs: ${i.relatedKPIs.join(', ')}` : ''}`
  ).join('\n');

  const prompt = `You are a Korn Ferry sales consultant helping identify the most strategic OUTCOMES to propose to a client based on discovery research. Your recommendations should include detailed industry and Korn Ferry benchmarks with clear explanations of WHY these targets are achievable.

CLIENT CONTEXT:
Company: ${companyName}${industry ? `\nIndustry: ${industry}` : ''}
Discovery Theme: ${discoveryTheme}
${consultantNotes ? `\nConsultant Notes: ${consultantNotes}` : ''}

DISCOVERY INSIGHTS:
${insightsSummary}

KORN FERRY VALUE PILLARS:
1. Grow - Revenue growth, market share expansion, customer acquisition
2. Optimise - Cost reduction, productivity improvement, efficiency gains
3. De-risk - Risk mitigation, compliance, retention improvement
4. Strengthen Capability - Leadership development, culture, organizational capability

KORN FERRY KNOWLEDGE BASE:
${knowledgeBase}

YOUR MISSION:
Based on the discovery insights above, recommend 4-6 strategic OUTCOMES that:
1. DIRECTLY address the issues/opportunities identified in the insights
2. Map to one of the 4 Value Pillars (Grow, Optimise, De-risk, Strengthen Capability)
3. Include DETAILED baseline reasoning explaining why this baseline is recommended
4. Provide INDUSTRY BENCHMARKS with low/median/high ranges showing where this client sits and what's achievable
5. Provide KORN FERRY BENCHMARKS showing top quartile vs typical performance with context on what drives achievement
6. Explain WHY the target is ACHIEVABLE - specific factors that support success
7. Are ACHIEVABLE within a 6-12 month engagement timeframe
8. Reference the specific insight that supports each recommendation

IMPORTANT:
- Each outcome must tie back to a specific discovery insight by title
- Provide detailed reasoning for baseline recommendations based on industry/company context
- Include specific industry benchmark ranges (low, median, high) with sources
- Include Korn Ferry benchmark data showing top quartile vs typical client performance
- For EACH outcome, explain WHY the target is achievable citing specific evidence: similar client results, company readiness indicators from discovery, industry trajectory, etc.
- Focus on metrics the client can actually measure and improve
- Balance across value pillars based on what the insights reveal

Return JSON format:
{
  "suggestions": [
    {
      "kpiName": "Specific, measurable outcome name",
      "kpiType": "primary" or "supporting",
      "unit": "Percentage (%)", "Days", "Score 1-100", "Dollars ($)", etc.,
      "definition": "Clear definition of what this outcome measures",
      "strategicRationale": "Why this outcome matters for THIS client based on their discovery insights",
      "valuePillar": "Grow" | "Optimise" | "De-risk" | "Strengthen Capability",
      "baselineEstimate": "45%",
      "targetEstimate": "65%",
      "baselineReasoning": "Based on discovery insights about current turnover challenges and typical ${industry || 'enterprise'} performance, we recommend starting at 45% as this aligns with where most organizations in their transformation stage begin.",
      "industryBenchmark": {
        "low": "35%",
        "median": "52%",
        "high": "75%",
        "source": "2024 ${industry || 'Industry'} Benchmark Report"
      },
      "kornFerryBenchmark": {
        "topQuartile": "70-80%",
        "typical": "50-60%",
        "context": "Korn Ferry clients typically achieve 15-20% improvement in first 12 months. The target is ACHIEVABLE because: 1) Discovery shows leadership commitment, 2) Similar clients in ${industry || 'this sector'} have achieved comparable results, 3) Current gaps indicate significant room for quick wins."
      },
      "achievabilityScore": 8,
      "valueImpactScore": 9,
      "sourceInsightTitle": "Exact title of the insight that supports this outcome"
    }
  ]
}`;

  try {
    console.log(`[AI Discovery KPI Suggestions] Generating for ${companyName}, theme: ${discoveryTheme}, ${insights.length} insights`);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 2500,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("AI returned empty response");
    }

    const parsedContent = JSON.parse(content);

    const validationResult = discoveryKpiSuggestionsOutputSchema.safeParse(parsedContent);
    if (!validationResult.success) {
      console.error("[AI Discovery KPI Suggestions] Validation failed:", validationResult.error);
      console.error("[AI Discovery KPI Suggestions] Received data:", parsedContent);
      throw new Error(`AI KPI suggestion validation failed: ${validationResult.error.message}`);
    }

    console.log(`[AI Discovery KPI Suggestions] Success! Generated ${validationResult.data.suggestions.length} suggestions`);
    return validationResult.data.suggestions;
  } catch (error) {
    console.error("[AI Discovery KPI Suggestions] Error:", error);
    throw error;
  }
}

const kpiRecommendationsOutputSchema = z.object({
  recommendations: z.array(kpiRecommendationSchema).min(3).max(5),
});

export type KPIRecommendation = z.infer<typeof kpiRecommendationSchema>;

interface GenerateKPIRecommendationsParams {
  jobName: string;
  capabilityName: string;
  solutionArea: string;
  aggregationSummary?: string;
  companyName: string;
  industry?: string;
}

export async function generateKPIRecommendations(
  params: GenerateKPIRecommendationsParams
): Promise<KPIRecommendation[]> {
  const { jobName, capabilityName, solutionArea, aggregationSummary, companyName, industry } = params;
  
  const knowledgeBase = getSolutionSummary();

  const prompt = `You are a Korn Ferry strategic consultant helping identify the most valuable and achievable OUTCOMES for measuring value realization with a client.

CLIENT CONTEXT:
Company: ${companyName}${industry ? `\nIndustry: ${industry}` : ''}

JOB THEME DETAILS:
Job Name: ${jobName}
Korn Ferry Capability: ${capabilityName}
Solution Area: ${solutionArea}
${aggregationSummary ? `Context: ${aggregationSummary}` : ''}

KORN FERRY KNOWLEDGE BASE:
${knowledgeBase}

YOUR MISSION:
Recommend 3-5 strategic OUTCOMES that:
1. DIFFERENTIATE Korn Ferry's approach - focus on leading indicators and behavioral metrics, not just lagging business outcomes
2. Are ACHIEVABLE within a 6-12 month engagement timeframe
3. Have HIGH VALUE IMPACT on client business outcomes
4. Align with Korn Ferry's proven measurement frameworks and benchmarks
5. Can be measured with data the client likely has or can easily collect

KORN FERRY STRATEGIC DIFFERENTIATION:
- Prioritize people/talent metrics over pure business metrics (e.g., "Leadership Pipeline Strength Index" vs "Revenue Growth")
- Include behavioral and capability metrics (e.g., "AI Readiness Index", "Decision Lead Time")
- Combine quantitative and qualitative indicators
- Focus on transformation enablers, not just end results

SCORING GUIDANCE:
- achievabilityScore (1-10): How realistic is it to measure and improve this outcome in 6-12 months?
  * 8-10: Client likely has data already, easy to measure
  * 5-7: May require some data setup or process changes
  * 1-4: Requires significant infrastructure or cultural change

- valueImpactScore (1-10): How much business value will improving this outcome deliver?
  * 8-10: Direct impact on revenue, cost, or critical business outcomes
  * 5-7: Meaningful impact on operational efficiency or employee experience
  * 1-4: Supporting metric with indirect impact

INDUSTRY BENCHMARKING:
For each outcome, provide realistic industry benchmark ranges based on ${industry || 'typical enterprise'} data:
- low: Bottom quartile performance (25th percentile)
- median: Industry average (50th percentile)
- high: Top quartile/best-in-class (75th+ percentile)
- source: Cite a credible source (Gartner, McKinsey, Korn Ferry research, industry report)

TARGET ACHIEVEMENT EXPLANATION:
For each outcome, explain WHY the suggested target is achievable. Include:
- A specific recommended target value
- 2-3 sentence rationale explaining why this is realistic for this client
- Expected timeframe in months
- 2-4 key success factors that make achievement likely

Provide your recommendations in JSON format:
{
  "recommendations": [
    {
      "kpiName": "Specific, measurable outcome name (e.g., 'Quality of Hire Index (0-100)')",
      "kpiType": "primary" or "supporting",
      "unit": "Index 0-100", "Percent (%)", "Days", "Score", etc.,
      "definition": "Clear definition of what this outcome measures and how it's calculated",
      "strategicRationale": "Why this outcome is strategically valuable for this client - connect to business outcomes and Korn Ferry differentiation (50-100 words)",
      "achievabilityScore": 8,
      "valueImpactScore": 9,
      "kornFerryBenchmark": "Typical Korn Ferry client range or target (e.g., 'Top quartile: 75-85, Industry average: 55-65')",
      "measurementFrequency": "6 months", "Quarterly", "Monthly", etc.,
      "industryBenchmark": {
        "low": "42%",
        "median": "58%",
        "high": "75%",
        "source": "2024 ${industry || 'Industry'} Talent Metrics Report, Korn Ferry Research"
      },
      "targetRecommendation": {
        "suggestedTarget": "68%",
        "achievementRationale": "Based on current performance and Korn Ferry's proven methodology, a 68% target represents meaningful improvement while remaining realistic. Similar ${industry || 'enterprise'} clients have achieved comparable results within 9 months using Korn Ferry's structured approach.",
        "timeframeMonths": 9,
        "successFactors": ["Leadership commitment demonstrated in discovery", "Existing data infrastructure supports measurement", "Clear alignment with strategic priorities", "Proven Korn Ferry methodology for this capability"]
      }
    }
  ]
}

IMPORTANT:
- Recommend exactly 3-5 outcomes total
- At least 2 must be "primary" outcomes (high impact, direct business outcome)
- Include at least 1 behavioral/capability metric that differentiates Korn Ferry
- Each outcome must have industry benchmarks AND target achievement explanation
- Strategic rationale must explain WHY this outcome matters for THIS client
- Prioritize outcomes with achievabilityScore >= 6 AND valueImpactScore >= 7
- Target recommendations must be realistic and backed by clear reasoning`;

  try {
    console.log(`[AI Outcome Recommendations] Generating for job: ${jobName}`);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("AI returned empty response");
    }

    const parsedContent = JSON.parse(content);

    // Strict Zod validation
    const validationResult = kpiRecommendationsOutputSchema.safeParse(parsedContent);
    if (!validationResult.success) {
      console.error("[AI Outcome Recommendations] Validation failed:", validationResult.error);
      console.error("[AI Outcome Recommendations] Received data:", parsedContent);
      throw new Error(`AI outcome recommendation validation failed: ${validationResult.error.message}`);
    }

    console.log(`[AI Outcome Recommendations] Success! Generated ${validationResult.data.recommendations.length} outcomes`);
    return validationResult.data.recommendations;
  } catch (error) {
    console.error("[AI Outcome Recommendations] Error:", error);
    throw error;
  }
}

// Strategic Pillar recommendation types
interface StrategicPillarRecommendation {
  name: string;
  description: string;
  confidence: "high" | "medium" | "low";
  sourceInsightIds: number[];
  okrThemeIds: string[];
  objectives: Array<{
    objective: string;
    keyResults: Array<{ result: string; target: string }>;
    timeline: string;
    objectiveType: "company" | "hr" | "talent";
  }>;
}

const strategicPillarOutputSchema = z.object({
  pillars: z.array(z.object({
    name: z.string(),
    description: z.string(),
    confidence: z.enum(["high", "medium", "low"]),
    sourceInsightIds: z.array(z.number()),
    okrThemeIds: z.array(z.string()),
    objectives: z.array(z.object({
      objective: z.string(),
      keyResults: z.array(z.object({
        result: z.string(),
        target: z.string()
      })),
      timeline: z.string(),
      objectiveType: z.enum(["company", "hr", "talent"])
    }))
  }))
});

export async function generateStrategicPillars(
  companyName: string,
  sector: string | null,
  dataPoints: Array<{ id: number; label: string; value: string; confidence: string; relevantCapability: string | null }>,
  headlines: Array<{ title: string; date: string }>,
  discoveryNotes: { freeformNotes?: string | null; topChallenges?: string | null; keyStakeholder?: string | null } | null
): Promise<StrategicPillarRecommendation[]> {
  const knowledgeBase = getSolutionSummary();
  
  const contextData = `
COMPANY: ${companyName}${sector ? ` (${sector} sector)` : ''}

DISCOVERY INSIGHTS:
${dataPoints.map(dp => `[ID: ${dp.id}] [${dp.confidence}] ${dp.label}: ${dp.value}${dp.relevantCapability ? ` (Capability: ${dp.relevantCapability})` : ''}`).join('\n')}

RECENT HEADLINES:
${headlines.map(h => `- ${h.title} (${h.date})`).join('\n')}

CONSULTANT NOTES:
${discoveryNotes?.freeformNotes || 'No notes'}

KEY STAKEHOLDER: ${discoveryNotes?.keyStakeholder || 'Not specified'}
TOP CHALLENGES: ${discoveryNotes?.topChallenges || 'Not specified'}
`;

  const okrThemesContext = `
ENTERPRISE OKR THEMES (Standard organizational archetypes):
- "growth": Growth & Market Position - Focus on revenue growth, market share expansion
- "profitability": Profitability & Cost Effectiveness - Margin improvement, productivity gains
- "customer": Customer Value & Loyalty - Customer experience, retention, satisfaction
- "operations": Operational Reliability & Speed - Process excellence, quality, agility
- "people": People/Leadership/Culture - Talent development, engagement, leadership capability
- "digital_ai": Digital/AI/Innovation - Technology adoption, innovation, digital transformation
- "risk_sustainability": Risk/Compliance/Sustainability - Governance, ESG, regulatory compliance`;

  const prompt = `You are a senior Korn Ferry strategic consultant helping to identify the top 3-5 Strategic Pillars for a client engagement.

Strategic Pillars are the high-level organizational priorities that connect to the client's business strategy. They should:
1. Reflect the client's most important strategic focus areas
2. Be broad enough to encompass multiple initiatives
3. Connect clearly to business outcomes and talent/leadership implications
4. Provide a framework for organizing the Korn Ferry engagement

${contextData}

KORN FERRY SOLUTIONS CONTEXT:
${knowledgeBase}
${okrThemesContext}

Based on the discovery data above, identify 3-5 Strategic Pillars that:
1. Emerge clearly from the research insights and headlines
2. Align with Korn Ferry's capabilities (leadership, talent, organization, rewards)
3. Have clear business impact and measurable outcomes
4. Connect to specific talent/HR objectives
5. Link to one or more Enterprise OKR Themes

For each Strategic Pillar, provide:
- A clear, concise name (e.g., "Operational Excellence", "Digital Transformation", "Talent Pipeline Strength")
- A detailed description explaining why this is strategic for the client
- Confidence level based on how strongly the data supports this pillar
- The IDs of discovery insights that support this pillar (from the ID numbers provided)
- One or more Enterprise OKR Theme IDs (from the list above) that this pillar aligns with
- 2-3 specific business objectives with key results and timeline

OBJECTIVE TYPES:
- "company": Business-level objectives (revenue, cost, efficiency, growth)
- "hr": HR/People function objectives (systems, processes, capabilities)
- "talent": Individual talent/leadership objectives (development, capability building)

Return your response in JSON format:
{
  "pillars": [
    {
      "name": "Strategic Pillar Name",
      "description": "Why this pillar is strategically important for this client (50-100 words)",
      "confidence": "high|medium|low",
      "sourceInsightIds": [1, 3, 5],
      "okrThemeIds": ["growth", "people"],
      "objectives": [
        {
          "objective": "Specific, measurable objective statement",
          "keyResults": [
            {"result": "Key result description", "target": "Quantified target"}
          ],
          "timeline": "Q2 2025" or "FY 2025",
          "objectiveType": "company|hr|talent"
        }
      ]
    }
  ]
}

IMPORTANT GUIDELINES:
- Recommend exactly 3-5 pillars (4 is ideal)
- Each pillar should link to at least 2 discovery insights
- Each pillar must link to 1-3 Enterprise OKR Themes (use ONLY these IDs: growth, profitability, customer, operations, people, digital_ai, risk_sustainability)
- Objectives should be actionable and measurable
- Include at least one pillar related to leadership/talent (Korn Ferry differentiation)
- Confidence should reflect strength of evidence in discovery data`;

  try {
    console.log(`[AI Strategic Pillars] Generating for ${companyName}`);
    console.log(`[AI Strategic Pillars] Analyzing ${dataPoints.length} data points and ${headlines.length} headlines`);

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

    const validationResult = strategicPillarOutputSchema.safeParse(parsedContent);
    if (!validationResult.success) {
      console.error("[AI Strategic Pillars] Validation failed:", validationResult.error);
      console.error("[AI Strategic Pillars] Received data:", parsedContent);
      throw new Error(`AI strategic pillar validation failed: ${validationResult.error.message}`);
    }

    console.log(`[AI Strategic Pillars] Success! Generated ${validationResult.data.pillars.length} pillars`);
    return validationResult.data.pillars;
  } catch (error) {
    console.error("[AI Strategic Pillars] Error:", error);
    throw error;
  }
}

// Job Theme generation from Strategic Pillars
interface JobThemeFromPillarRecommendation {
  pillarId: number;
  jobs: Array<{
    jobName: string;
    capabilityName: string;
    solutionArea: "ASSESS" | "DEVELOP" | "TRANSFORM" | "REWARD" | "COMMERCIAL" | "ANALYTICS";
    rationale: string;
    pillarLinkageNarrative: string;
    priorityScore: number; // 1-10
    kpis: Array<{
      kpiName: string;
      kpiType: "primary" | "supporting";
      unit: string;
      definition: string;
      strategicRationale: string;
      achievabilityScore: number;
      valueImpactScore: number;
      kornFerryBenchmark: string;
      measurementFrequency: string;
    }>;
  }>;
}

const jobThemeFromPillarOutputSchema = z.object({
  pillars: z.array(z.object({
    pillarId: z.number(),
    jobs: z.array(z.object({
      jobName: z.string().min(5),
      capabilityName: z.string(),
      solutionArea: z.enum(["ASSESS", "DEVELOP", "TRANSFORM", "REWARD", "COMMERCIAL", "ANALYTICS"]),
      rationale: z.string().min(20),
      pillarLinkageNarrative: z.string().min(20),
      priorityScore: z.number().min(1).max(10),
      kpis: z.array(z.object({
        kpiName: z.string().min(3),
        kpiType: z.enum(["primary", "supporting"]),
        unit: z.string(),
        definition: z.string().min(10),
        strategicRationale: z.string().min(20),
        achievabilityScore: z.number().min(1).max(10),
        valueImpactScore: z.number().min(1).max(10),
        kornFerryBenchmark: z.string(),
        measurementFrequency: z.string()
      })).min(2).max(5)
    }))
  }))
});

interface PillarForJobGeneration {
  id: number;
  name: string;
  description: string;
  confidence: string;
  okrThemeIds: string[];
  okrThemeNames: string[];
  objectives: Array<{ objective: string; keyResults: Array<{ result: string; target: string }> }>;
}

export async function generateJobThemesFromPillars(
  companyName: string,
  sector: string | null,
  pillars: PillarForJobGeneration[],
  discoveryInsights: Array<{ label: string; value: string; relevantCapability: string | null }>
): Promise<JobThemeFromPillarRecommendation[]> {
  const knowledgeBase = getSolutionSummary();

  const pillarContext = pillars.map(p => `
PILLAR: ${p.name} (ID: ${p.id})
Description: ${p.description}
Confidence: ${p.confidence}
OKR Themes: ${p.okrThemeNames.join(", ")}
Objectives:
${p.objectives.map(o => `  - ${o.objective}
    Key Results: ${o.keyResults.map(kr => kr.result).join("; ")}`).join("\n")}
`).join("\n---\n");

  const insightsContext = discoveryInsights
    .filter(d => d.relevantCapability)
    .slice(0, 20) // Limit to top 20 insights
    .map(d => `- ${d.label}: ${d.value} (${d.relevantCapability})`)
    .join("\n");

  const prompt = `You are a senior Korn Ferry strategic consultant. Based on the Strategic Pillars defined for this client engagement, generate targeted Job Themes (actionable work packages) with KPIs for value tracking.

COMPANY: ${companyName}${sector ? ` (${sector} sector)` : ''}

STRATEGIC PILLARS DEFINED:
${pillarContext}

DISCOVERY INSIGHTS (for context):
${insightsContext}

KORN FERRY KNOWLEDGE BASE:
${knowledgeBase}

YOUR MISSION:
For EACH Strategic Pillar, recommend 1-3 Job Themes that:
1. Directly support the pillar's objectives and key results
2. Map to a specific Korn Ferry capability and solution area
3. Include 2-5 strategic KPIs per job for value measurement
4. Prioritize leading indicators and behavioral metrics (Korn Ferry differentiation)

Return JSON in this exact format:
{
  "pillars": [
    {
      "pillarId": 1,
      "jobs": [
        {
          "jobName": "Action-oriented job description (e.g., 'Define role success; align roles')",
          "capabilityName": "Exact Korn Ferry capability name from knowledge base",
          "solutionArea": "ASSESS|DEVELOP|TRANSFORM|REWARD|COMMERCIAL|ANALYTICS",
          "rationale": "Why this job is critical for the pillar's success",
          "pillarLinkageNarrative": "How this job directly supports the pillar's objectives",
          "priorityScore": 8,
          "kpis": [
            {
              "kpiName": "Specific, measurable KPI name",
              "kpiType": "primary|supporting",
              "unit": "% or # or $ or days",
              "definition": "Clear definition of what is measured",
              "strategicRationale": "Why this KPI matters for value realization",
              "achievabilityScore": 7,
              "valueImpactScore": 9,
              "kornFerryBenchmark": "Industry benchmark with source",
              "measurementFrequency": "Monthly|Quarterly|Annual"
            }
          ]
        }
      ]
    }
  ]
}

IMPORTANT GUIDELINES:
- Each pillar should have 1-3 jobs (don't overload)
- Jobs must use EXACT capability names from the Korn Ferry knowledge base
- KPIs should be a mix of primary (outcome-focused) and supporting (leading indicators)
- Focus on behavioral/people metrics that differentiate Korn Ferry's approach
- priorityScore should reflect strategic importance (1-10)
- achievabilityScore reflects ease of measurement within 6-12 months
- valueImpactScore reflects potential business impact`;

  try {
    console.log(`[AI Job Themes from Pillars] Generating for ${companyName} with ${pillars.length} pillars`);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("AI returned empty response");
    }

    const parsedContent = JSON.parse(content);

    const validationResult = jobThemeFromPillarOutputSchema.safeParse(parsedContent);
    if (!validationResult.success) {
      console.error("[AI Job Themes from Pillars] Validation failed:", validationResult.error);
      console.error("[AI Job Themes from Pillars] Received data:", JSON.stringify(parsedContent, null, 2));
      throw new Error(`AI job theme validation failed: ${validationResult.error.message}`);
    }

    console.log(`[AI Job Themes from Pillars] Success! Generated jobs for ${validationResult.data.pillars.length} pillars`);
    return validationResult.data.pillars;
  } catch (error) {
    console.error("[AI Job Themes from Pillars] Error:", error);
    throw error;
  }
}

// ============================================
// AI-POWERED PILLAR ASSIGNMENT FOR JOBS
// ============================================

interface JobForPillarAssignment {
  id: number;
  jobName: string;
  capabilityName: string;
  solutionArea: string | null;
  aggregationSummary: string | null;
  evidenceCount: number;
}

interface PillarForAssignment {
  id: number;
  name: string;
  description: string | null;
  objectives: Array<{ objective: string; keyResults: Array<{ result: string; target: string }> }>;
}

interface PillarAssignmentResult {
  jobId: number;
  pillarId: number;
  pillarLinkageNarrative: string;
  confidence: "high" | "medium" | "low";
}

const pillarAssignmentOutputSchema = z.object({
  assignments: z.array(z.object({
    jobId: z.number(),
    pillarId: z.number(),
    pillarLinkageNarrative: z.string().min(20),
    confidence: z.enum(["high", "medium", "low"])
  }))
});

export async function assignJobsToPillars(
  companyName: string,
  sector: string | null,
  jobs: JobForPillarAssignment[],
  pillars: PillarForAssignment[]
): Promise<PillarAssignmentResult[]> {
  if (jobs.length === 0 || pillars.length === 0) {
    return [];
  }

  const knowledgeBase = getSolutionSummary();

  const jobsContext = jobs.map(j => `
JOB ID ${j.id}: "${j.jobName}"
  Capability: ${j.capabilityName}
  Solution Area: ${j.solutionArea || "Not specified"}
  Evidence: ${j.evidenceCount} supporting insights
  Summary: ${j.aggregationSummary || "No summary available"}
`).join("\n");

  const pillarsContext = pillars.map(p => `
PILLAR ID ${p.id}: "${p.name}"
  Description: ${p.description || "No description"}
  Objectives:
${p.objectives.map(o => `    - ${o.objective}
      Key Results: ${o.keyResults.map(kr => kr.result).join("; ")}`).join("\n")}
`).join("\n");

  const prompt = `You are a senior Korn Ferry strategic consultant. Your task is to analyze the Jobs (work packages) and Strategic Pillars for a client engagement, then determine the BEST pillar assignment for each job.

COMPANY: ${companyName}${sector ? ` (${sector} sector)` : ''}

JOBS TO ASSIGN:
${jobsContext}

AVAILABLE STRATEGIC PILLARS:
${pillarsContext}

KORN FERRY SOLUTIONS (for context):
${knowledgeBase}

YOUR MISSION:
For EACH job, determine which Strategic Pillar it most directly supports. Consider:
1. How the job's capability and solution area align with the pillar's objectives
2. Whether the job's expected outcomes would contribute to the pillar's key results
3. The strength of the conceptual relationship between the job and pillar

ASSIGNMENT GUIDELINES:
- Every job MUST be assigned to exactly ONE pillar
- Choose the pillar where the job provides the STRONGEST contribution
- If a job could reasonably support multiple pillars, choose the one with the clearest alignment
- Provide a narrative explaining how the job supports the pillar (50-100 words)
- Assign confidence based on how clear the alignment is:
  * "high" = obvious, direct alignment with pillar objectives
  * "medium" = reasonable alignment, some interpretation required
  * "low" = weak alignment, but best available match

Return your response in JSON format:
{
  "assignments": [
    {
      "jobId": 1,
      "pillarId": 2,
      "pillarLinkageNarrative": "This job directly supports the pillar by... [specific explanation of how the job's outcomes contribute to the pillar's objectives and key results]",
      "confidence": "high"
    }
  ]
}

IMPORTANT:
- Include an assignment for EVERY job provided
- Each job should appear exactly once in the assignments array
- Use the exact jobId and pillarId numbers provided
- Write clear, specific narratives that connect job outcomes to pillar objectives`;

  try {
    console.log(`[AI Pillar Assignment] Assigning ${jobs.length} jobs to ${pillars.length} pillars for ${companyName}`);

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

    const validationResult = pillarAssignmentOutputSchema.safeParse(parsedContent);
    if (!validationResult.success) {
      console.error("[AI Pillar Assignment] Validation failed:", validationResult.error);
      console.error("[AI Pillar Assignment] Received data:", JSON.stringify(parsedContent, null, 2));
      throw new Error(`AI pillar assignment validation failed: ${validationResult.error.message}`);
    }

    console.log(`[AI Pillar Assignment] Success! Assigned ${validationResult.data.assignments.length} jobs`);
    return validationResult.data.assignments;
  } catch (error) {
    console.error("[AI Pillar Assignment] Error:", error);
    throw error;
  }
}

// ============================================================================
// AI Value Justification Generation
// ============================================================================

interface ValueJustificationInput {
  priority: {
    name: string;
    capabilityName: string;
    solutionArea?: string | null;
    summary?: string | null;
  };
  company?: {
    name: string;
    sector?: string | null;
  };
  insights: Array<{
    label: string;
    value: string;
    confidence: string;
  }>;
  notes?: {
    freeformNotes?: string | null;
    challenges?: string | null;
  };
  responses: Array<{
    question: string;
    answer: string | null;
  }>;
  kpis: Array<{
    name: string;
    unit: string;
    baseline?: string | null;
    target?: string | null;
    benchmark?: string | null;
  }>;
  tone: "executive" | "technical" | "persuasive";
  focusAreas?: string[];
  includeFinancials?: boolean;
}

interface ValueJustificationResult {
  draftContent: string;
  executiveSummary: string;
  projectedValue?: number | null;
  projectedValueTimeframe?: string;
  confidenceLevel: "high" | "medium" | "low";
}

const valueJustificationSchema = z.object({
  draftContent: z.string().min(100),
  executiveSummary: z.string().min(50).max(500),
  projectedValue: z.number().nullable().optional(),
  projectedValueTimeframe: z.string().optional(),
  confidenceLevel: z.enum(["high", "medium", "low"])
});

export async function generateValueJustificationDraft(
  input: ValueJustificationInput
): Promise<ValueJustificationResult> {
  const knowledgeBase = getSolutionSummary();
  
  const insightsContext = input.insights.length > 0
    ? `Discovery Insights:\n${input.insights.map(i => `- [${i.confidence}] ${i.label}: ${i.value}`).join('\n')}`
    : 'No discovery insights available.';
  
  const notesContext = input.notes?.freeformNotes 
    ? `Consultant Notes:\n${input.notes.freeformNotes}`
    : '';
  
  const challengesContext = input.notes?.challenges
    ? `Client Challenges:\n${input.notes.challenges}`
    : '';
  
  const responsesContext = input.responses.length > 0
    ? `Client Questionnaire Responses:\n${input.responses.filter(r => r.answer).map(r => `Q: ${r.question}\nA: ${r.answer}`).join('\n\n')}`
    : '';
  
  const kpisContext = input.kpis.length > 0
    ? `Target KPIs:\n${input.kpis.map(k => {
        const gap = k.baseline && k.target 
          ? ` (Gap: ${parseFloat(k.target) - parseFloat(k.baseline)} ${k.unit})`
          : '';
        return `- ${k.name}: Baseline ${k.baseline || 'TBD'} → Target ${k.target || 'TBD'} ${k.unit}${k.benchmark ? ` [Benchmark: ${k.benchmark}]` : ''}${gap}`;
      }).join('\n')}`
    : '';
  
  const toneInstructions = {
    executive: "Write for a C-level audience. Focus on strategic impact, ROI, and competitive advantage. Be concise and action-oriented.",
    technical: "Include more detail on methodology, implementation approach, and measurement frameworks. Be specific about how value will be created.",
    persuasive: "Emphasize the compelling case for change, using data to create urgency. Highlight risks of inaction and benefits of partnership."
  };
  
  const focusAreasText = input.focusAreas?.length 
    ? `\nSPECIFIC FOCUS AREAS TO EMPHASIZE:\n${input.focusAreas.map(a => `- ${a}`).join('\n')}`
    : '';

  const prompt = `You are a senior Korn Ferry management consultant creating a compelling value justification document for a client engagement.

CONTEXT:
Company: ${input.company?.name || 'Client Company'}${input.company?.sector ? ` (${input.company.sector})` : ''}
Priority Area: ${input.priority.name}
Korn Ferry Capability: ${input.priority.capabilityName}
Solution Area: ${input.priority.solutionArea || 'Not specified'}

${input.priority.summary ? `AI Summary: ${input.priority.summary}` : ''}

${insightsContext}

${notesContext}

${challengesContext}

${responsesContext}

${kpisContext}

KORN FERRY KNOWLEDGE BASE:
${knowledgeBase}

WRITING TONE: ${input.tone.toUpperCase()}
${toneInstructions[input.tone]}
${focusAreasText}

TASK: Generate a comprehensive value justification document that will convince client stakeholders to invest in this initiative.

STRUCTURE YOUR RESPONSE AS FOLLOWS:

## Executive Summary
A powerful one-paragraph summary (3-4 sentences) that captures the strategic opportunity and expected value.

## The Business Challenge
- What specific problems does the client face?
- What is the cost of inaction?
- Use insights from discovery data to ground the narrative.

## The Opportunity
- How does addressing this priority create value?
- What outcomes can the client expect?
- Reference specific KPI improvements with targets.

## Korn Ferry's Approach
- How will Korn Ferry help achieve these outcomes?
- What makes our approach differentiated?
- Reference relevant capabilities and methodologies.

## Expected Value & ROI
${input.includeFinancials ? `- Provide specific financial projections based on KPI improvements
- Calculate potential value creation (use conservative estimates)
- Include payback period and multi-year value projection` : '- Focus on qualitative value creation and strategic benefits'}

## Next Steps
- Clear call to action
- Proposed timeline

IMPORTANT GUIDELINES:
1. Be specific - use actual data from the discovery insights
2. Be credible - cite Korn Ferry benchmarks and methodologies
3. Be compelling - create urgency without being alarmist
4. Be concise - each section should be impactful, not lengthy
5. Connect the dots - show how discovery insights lead to KPI targets lead to value

Return your response in JSON format:
{
  "draftContent": "Full markdown document with all sections",
  "executiveSummary": "The one-paragraph executive summary only",
  "projectedValue": null or number (estimated dollar value if calculable),
  "projectedValueTimeframe": "timeframe for projected value (e.g., '3 years', '12 months')",
  "confidenceLevel": "high" | "medium" | "low" (based on quality of input data)
}`;

  try {
    console.log(`[AI Value Justification] Generating draft for priority: ${input.priority.name}`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("AI returned empty response");
    }
    
    const parsedContent = JSON.parse(content);
    
    const validationResult = valueJustificationSchema.safeParse(parsedContent);
    if (!validationResult.success) {
      console.error("[AI Value Justification] Validation failed:", validationResult.error);
      throw new Error(`AI value justification validation failed: ${validationResult.error.message}`);
    }
    
    console.log(`[AI Value Justification] Success! Generated draft with confidence: ${validationResult.data.confidenceLevel}`);
    return validationResult.data;
  } catch (error) {
    console.error("[AI Value Justification] Error:", error);
    throw error;
  }
}

// ============================================================================
// AI Value Justification Refinement (Chat)
// ============================================================================

interface RefineValueJustificationInput {
  currentDraft: string;
  executiveSummary: string;
  userMessage: string;
  action?: "refine" | "expand" | "simplify" | "add_metrics" | "change_tone";
  conversationHistory: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
}

interface RefineValueJustificationResult {
  updatedDraft: string;
  updatedSummary?: string;
  responseMessage: string;
  changes?: Array<{
    section: string;
    changeType: string;
    description: string;
  }>;
}

const refineValueJustificationSchema = z.object({
  updatedDraft: z.string(),
  updatedSummary: z.string().optional(),
  responseMessage: z.string(),
  changes: z.array(z.object({
    section: z.string(),
    changeType: z.string(),
    description: z.string()
  })).optional()
});

export async function refineValueJustification(
  input: RefineValueJustificationInput
): Promise<RefineValueJustificationResult> {
  const actionInstructions = {
    refine: "Make the requested changes while maintaining the overall structure and quality.",
    expand: "Add more detail and depth to the specified sections or areas.",
    simplify: "Reduce complexity and make the content more accessible while retaining key messages.",
    add_metrics: "Incorporate additional quantitative data, benchmarks, or financial projections.",
    change_tone: "Adjust the writing style while preserving the content and arguments."
  };
  
  const conversationContext = input.conversationHistory.length > 0
    ? `\nPREVIOUS CONVERSATION:\n${input.conversationHistory.slice(-6).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')}`
    : '';

  const prompt = `You are a Korn Ferry AI assistant helping a consultant refine a value justification document through conversation.

CURRENT DRAFT:
${input.currentDraft}

CURRENT EXECUTIVE SUMMARY:
${input.executiveSummary}
${conversationContext}

USER REQUEST:
${input.userMessage}

${input.action ? `ACTION TYPE: ${input.action}\n${actionInstructions[input.action]}` : ''}

TASK: Respond to the user's request and provide an updated version of the document.

GUIDELINES:
1. Be conversational and helpful in your response
2. Make precise changes based on the request
3. Preserve sections that don't need changes
4. Explain what changes you made and why
5. If the request is unclear, ask for clarification
6. Update the executive summary if the changes warrant it

Return your response in JSON format:
{
  "updatedDraft": "The complete updated draft (markdown format)",
  "updatedSummary": "Updated executive summary if changed, or omit if unchanged",
  "responseMessage": "Your conversational response explaining what you did",
  "changes": [
    {
      "section": "Section name that was changed",
      "changeType": "added|modified|removed|restructured",
      "description": "Brief description of the change"
    }
  ]
}`;

  try {
    console.log(`[AI Value Justification Refine] Processing user request: ${input.userMessage.slice(0, 50)}...`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("AI returned empty response");
    }
    
    const parsedContent = JSON.parse(content);
    
    const validationResult = refineValueJustificationSchema.safeParse(parsedContent);
    if (!validationResult.success) {
      console.error("[AI Value Justification Refine] Validation failed:", validationResult.error);
      throw new Error(`AI refinement validation failed: ${validationResult.error.message}`);
    }
    
    console.log(`[AI Value Justification Refine] Success! Made ${validationResult.data.changes?.length || 0} changes`);
    return validationResult.data;
  } catch (error) {
    console.error("[AI Value Justification Refine] Error:", error);
    throw error;
  }
}

// ============================================
// AI-POWERED STORY SUGGESTIONS
// ============================================

export interface StorySuggestionInput {
  companyName: string;
  companyContext?: string;
  discoveryTheme?: string;
  discoveryInsights?: Array<{
    title: string;
    content: string;
    category?: string;
    priority?: string;
    confidence?: number;
  }>;
  meetingContact?: {
    name?: string;
    title?: string;
    role?: string;
    influence?: string;
    knownConcerns?: string;
    decisionCriteria?: string;
  };
  successStories?: Array<{
    client: string;
    industry: string;
    challenge: string;
    metrics: string[];
  }>;
  currentDraft?: {
    singleMessage?: string;
    emotionalReaction?: string;
    startingHook?: string;
    structure?: string;
    heroCharacter?: string;
    evidence?: string;
  };
  fieldToSuggest: "all" | "singleMessage" | "emotionalReaction" | "startingHook" | "heroCharacter" | "evidence" | "openingLine" | "turningPoint" | "keyDataPoint" | "meaningMoment" | "takeaway" | "callToAction";
  phase: "before" | "during" | "after";
}

export interface StorySuggestionResult {
  suggestions: {
    singleMessage?: string;
    emotionalReaction?: string;
    startingHook?: string;
    heroCharacter?: string;
    evidence?: string;
    openingLine?: string;
    turningPoint?: string;
    keyDataPoint?: string;
    meaningMoment?: string;
    takeaway?: string;
    callToAction?: string;
  };
  reasoning: string;
  alternativeSuggestions?: string[];
}

const storySuggestionSchema = z.object({
  suggestions: z.object({
    singleMessage: z.string().optional(),
    emotionalReaction: z.string().optional(),
    startingHook: z.string().optional(),
    heroCharacter: z.string().optional(),
    evidence: z.string().optional(),
    openingLine: z.string().optional(),
    turningPoint: z.string().optional(),
    keyDataPoint: z.string().optional(),
    meaningMoment: z.string().optional(),
    takeaway: z.string().optional(),
    callToAction: z.string().optional()
  }),
  reasoning: z.string(),
  alternativeSuggestions: z.array(z.string()).optional()
});

export async function generateStorySuggestion(
  input: StorySuggestionInput
): Promise<StorySuggestionResult> {
  const buyerRoleContext = input.meetingContact?.role ? {
    economic_buyer: "This is an Economic Buyer who controls budget - focus on ROI, business impact, and strategic value. Lead with outcomes, not features.",
    user_buyer: "This is a User Buyer who will use the solution daily - emphasize practical impact, ease of implementation, and how it makes their work better.",
    technical_buyer: "This is a Technical Buyer who evaluates feasibility - have data and methodology ready. They screen for fit and will ask detailed questions.",
    coach: "This is a Coach who can guide the sales process - they share inside information and help navigate the organization.",
    champion: "This is a Champion who will advocate internally - give them soundbites, data, and stories they can share with decision-makers."
  }[input.meetingContact.role] : "";

  const influenceContext = input.meetingContact?.influence ? {
    decision_maker: "As a Decision Maker, they have final authority. Your story should compel action and address their strategic priorities directly.",
    strong_influencer: "As a Strong Influencer, they significantly shape the decision. Help them build the case internally with compelling evidence.",
    influencer: "As an Influencer, they provide input to decision-makers. Give them clear talking points and memorable metrics.",
    gatekeeper: "As a Gatekeeper, they control access and information flow. Build trust and demonstrate credibility first."
  }[input.meetingContact.influence] : "";

  const successStoriesContext = input.successStories?.length ? `
RELEVANT SUCCESS STORIES TO REFERENCE:
${input.successStories.map(s => `- ${s.client} (${s.industry}): ${s.challenge}. Results: ${s.metrics.join(", ")}`).join("\n")}
` : "";

  const discoveryInsightsContext = input.discoveryInsights?.length ? `
DISCOVERY INSIGHTS (Use these to ground your story in real company data):
${input.discoveryInsights.slice(0, 10).map(i => `- ${i.title}: ${i.content}${i.priority ? ` [Priority: ${i.priority}]` : ""}`).join("\n")}
` : "";

  const currentDraftContext = input.currentDraft ? `
CURRENT DRAFT ELEMENTS:
- Single Message: ${input.currentDraft.singleMessage || "(not yet defined)"}
- Emotional Reaction: ${input.currentDraft.emotionalReaction || "(not yet defined)"}
- Starting Hook: ${input.currentDraft.startingHook || "(not yet defined)"}
- Story Structure: ${input.currentDraft.structure || "situation-struggle-insight-outcome"}
- Hero Character: ${input.currentDraft.heroCharacter || "(not yet defined)"}
- Evidence: ${input.currentDraft.evidence || "(not yet defined)"}
` : "";

  const phaseInstructions = {
    before: `You are crafting the BEFORE phase - preparing the story elements before telling it.
Key principles:
- The single message should be one provocative statement they MUST remember
- The emotional reaction should be the feeling you want to evoke (urgency, curiosity, hope, etc.)
- The starting hook must create instant tension or intrigue
- The hero character should be relatable to the buyer
- Evidence should be specific, quantifiable, and relevant to their industry`,

    during: `You are crafting the DURING phase - the actual telling of the story.
Key principles:
- The opening line should grab attention immediately
- The turning point is where insight meets action - the "aha" moment
- Key data points should be memorable and impactful (use the "40% in 12 months" format)`,

    after: `You are crafting the AFTER phase - landing the story and inspiring action.
Key principles:
- The meaning moment reveals why this story matters to THEM specifically
- The takeaway should be crystal clear and actionable
- The call to action should be a natural next step they can commit to`
  };

  const fieldGuidance: Record<string, string> = {
    singleMessage: "Generate ONE provocative statement that encapsulates the core message. It should be counterintuitive or surprising, yet backed by evidence. Format: 'Leaders who [action] before [event] outperform those who don't by [metric]%.'",
    emotionalReaction: "Identify the primary emotion to evoke: urgency, curiosity, hope, fear of missing out, validation, or inspiration. Consider what will motivate this specific buyer to act.",
    startingHook: "Create a high-tension opening that immediately creates curiosity. Use formats like: 'Picture this: It's Monday morning and...' or 'What if I told you that...' or a surprising statistic.",
    heroCharacter: "Define who the hero of the story should be - typically someone similar to the buyer or their team. The hero should face a relatable challenge and achieve transformation.",
    evidence: "Provide specific, quantifiable evidence that proves the story's message. Include metrics, timeframes, and industry-relevant data points.",
    openingLine: "Write the exact first sentence to say. It should be memorable, set the scene, and create immediate engagement.",
    turningPoint: "Describe the pivotal moment where the hero gains insight and takes action. This is the 'aha' moment that changes everything.",
    keyDataPoint: "Select the single most powerful metric or data point to emphasize. Use the '[X]% improvement in [timeframe]' format.",
    meaningMoment: "Articulate why this story matters specifically to THIS buyer. Connect the story's lesson to their situation, concerns, and goals.",
    takeaway: "State the clear, actionable lesson they should remember. Make it specific and applicable to their context.",
    callToAction: "Propose a natural next step they can commit to. It should be low-risk but meaningful: a follow-up meeting, a pilot program, an assessment, etc."
  };

  const fieldsToGenerate = input.fieldToSuggest === "all" 
    ? (input.phase === "before" 
        ? ["singleMessage", "emotionalReaction", "startingHook", "heroCharacter", "evidence"]
        : input.phase === "during"
          ? ["openingLine", "turningPoint", "keyDataPoint"]
          : ["meaningMoment", "takeaway", "callToAction"])
    : [input.fieldToSuggest];

  const fieldInstructions = fieldsToGenerate
    .map(field => `- ${field}: ${fieldGuidance[field]}`)
    .join("\n");

  const prompt = `You are a master storyteller helping a Korn Ferry consultant craft a compelling narrative for a sales meeting.

CONTEXT:
- Company: ${input.companyName}
- Discovery Theme: ${input.discoveryTheme || "General business consulting"}
${input.companyContext ? `- Company Context: ${input.companyContext}` : ""}

MEETING CONTACT:
${input.meetingContact ? `- Name: ${input.meetingContact.name || "Unknown"}
- Title: ${input.meetingContact.title || "Unknown"}
- Known Concerns: ${input.meetingContact.knownConcerns || "Not specified"}
- Decision Criteria: ${input.meetingContact.decisionCriteria || "Not specified"}` : "No meeting contact specified"}

${buyerRoleContext ? `BUYER ROLE GUIDANCE: ${buyerRoleContext}` : ""}
${influenceContext ? `INFLUENCE LEVEL: ${influenceContext}` : ""}

${successStoriesContext}
${discoveryInsightsContext}
${currentDraftContext}

${phaseInstructions[input.phase]}

FIELDS TO GENERATE:
${fieldInstructions}

Generate story suggestions that are:
1. Tailored to this specific buyer's role, concerns, and decision criteria
2. Backed by relevant evidence and success stories when available
3. Emotionally compelling yet professionally credible
4. Specific and actionable, not generic
5. Appropriate for a Korn Ferry consulting context

Return your response in JSON format:
{
  "suggestions": {
    ${fieldsToGenerate.map(f => `"${f}": "Your suggestion"`).join(",\n    ")}
  },
  "reasoning": "Brief explanation of why these suggestions work for this specific buyer",
  "alternativeSuggestions": ["Alternative approach 1", "Alternative approach 2"]
}`;

  try {
    console.log(`[AI Story Suggestion] Generating ${input.fieldToSuggest} for ${input.companyName} (${input.phase} phase)`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("AI returned empty response");
    }
    
    const parsedContent = JSON.parse(content);
    
    const validationResult = storySuggestionSchema.safeParse(parsedContent);
    if (!validationResult.success) {
      console.error("[AI Story Suggestion] Validation failed:", validationResult.error);
      throw new Error(`AI story suggestion validation failed: ${validationResult.error.message}`);
    }
    
    console.log(`[AI Story Suggestion] Success! Generated suggestions for: ${Object.keys(validationResult.data.suggestions).join(", ")}`);
    return validationResult.data;
  } catch (error) {
    console.error("[AI Story Suggestion] Error:", error);
    throw error;
  }
}

// ============================================================================
// DISCOVERY INSIGHTS SYNTHESIS - AI-powered strategic summary of discovery data
// ============================================================================

export interface DiscoverySynthesisInput {
  companyName: string;
  industry?: string;
  discoveryTheme?: string;
  researchDataPoints?: Array<{
    label: string;
    value: string;
    kornFerryPillar?: string;
    solutionArea?: string;
  }>;
  headlines?: Array<{ title: string; date: string }>;
  greenSheetData?: {
    callObjective?: string;
    desiredOutcome?: string;
    openingStatement?: string;
    bestActionCommitment?: string;
    contacts?: Array<{
      name: string;
      title?: string;
      buyingRole?: string;
      influenceLevel?: string;
    }>;
  };
  storyBuilderData?: {
    before?: {
      singleMessage?: string;
      emotionalReaction?: string;
      storyStructure?: string;
      startingHook?: string;
      heroCharacter?: string;
      tensionQuestions?: Array<{ prompt: string; response?: string }>;
    };
    during?: {
      openingLine?: string;
      turningPoint?: string;
      keyDataPoints?: string[];
    };
    after?: {
      momentOfMeaning?: string;
      explicitTakeaway?: string;
      callToAction?: string;
    };
  };
  questionResponses?: Array<{
    question: string;
    response: string;
    methodology?: string;
  }>;
  notes?: Array<{
    content: string;
    category?: string;
  }>;
  callFlow?: Array<{
    question: string;
    phase: string;
  }>;
}

export interface DiscoverySynthesisResult {
  whatWeLearned: {
    keyThemes: Array<{
      theme: string;
      insight: string;
      evidence: string[];
    }>;
    summary: string;
  };
  businessImplications: {
    opportunities: Array<{
      title: string;
      description: string;
      kornFerryPillar: string;
      potentialValue: string;
      priority: "high" | "medium" | "low";
    }>;
    risks: Array<{
      title: string;
      description: string;
      mitigation: string;
    }>;
    summary: string;
  };
  stakeholderSignals: {
    championStatus: string;
    buyingCommittee: string;
    momentum: "strong" | "moderate" | "weak" | "unclear";
    nextActions: string[];
    summary: string;
  };
  readinessToBuildValue: {
    score: number; // 0-100
    strengths: string[];
    gaps: string[];
    recommendations: string[];
    nextSteps: string[];
    summary: string;
  };
  executiveSummary: string;
}

const discoverySynthesisSchema = z.object({
  whatWeLearned: z.object({
    keyThemes: z.array(z.object({
      theme: z.string(),
      insight: z.string(),
      evidence: z.array(z.string())
    })),
    summary: z.string()
  }),
  businessImplications: z.object({
    opportunities: z.array(z.object({
      title: z.string(),
      description: z.string(),
      kornFerryPillar: z.string(),
      potentialValue: z.string(),
      priority: z.enum(["high", "medium", "low"])
    })),
    risks: z.array(z.object({
      title: z.string(),
      description: z.string(),
      mitigation: z.string()
    })),
    summary: z.string()
  }),
  stakeholderSignals: z.object({
    championStatus: z.string(),
    buyingCommittee: z.string(),
    momentum: z.enum(["strong", "moderate", "weak", "unclear"]),
    nextActions: z.array(z.string()),
    summary: z.string()
  }),
  readinessToBuildValue: z.object({
    score: z.number().min(0).max(100),
    strengths: z.array(z.string()),
    gaps: z.array(z.string()),
    recommendations: z.array(z.string()),
    nextSteps: z.array(z.string()),
    summary: z.string()
  }),
  executiveSummary: z.string()
});

export async function synthesizeDiscoveryInsights(input: DiscoverySynthesisInput): Promise<DiscoverySynthesisResult> {
  // Build context from all available data
  const researchContext = input.researchDataPoints?.length 
    ? `RESEARCH FINDINGS:\n${input.researchDataPoints.map(dp => `- [${dp.kornFerryPillar || 'General'}] ${dp.label}: ${dp.value}`).join('\n')}`
    : "No research data collected yet.";

  const headlinesContext = input.headlines?.length
    ? `RECENT NEWS:\n${input.headlines.slice(0, 5).map(h => `- ${h.title} (${h.date})`).join('\n')}`
    : "";

  const greenSheetContext = input.greenSheetData ? `
GREEN SHEET (Call Preparation):
- Call Objective: ${input.greenSheetData.callObjective || "Not set"}
- Desired Outcome: ${input.greenSheetData.desiredOutcome || "Not set"}
- Opening Statement: ${input.greenSheetData.openingStatement || "Not set"}
- Best Action Commitment: ${input.greenSheetData.bestActionCommitment || "Not set"}
${input.greenSheetData.contacts?.length ? `- Key Contacts: ${input.greenSheetData.contacts.map(c => 
  `${c.name}${c.title ? ` (${c.title})` : ''}${c.buyingRole ? ` - ${c.buyingRole}` : ''}`
).join(', ')}` : ''}` : "";

  const storyContext = input.storyBuilderData?.before ? `
NARRATIVE PREPARATION:
- Core Message: ${input.storyBuilderData.before.singleMessage || "Not defined"}
- Target Emotional Reaction: ${input.storyBuilderData.before.emotionalReaction || "Not defined"}
- Story Structure: ${input.storyBuilderData.before.storyStructure || "Not selected"}
- Opening Hook: ${input.storyBuilderData.before.startingHook || "Not crafted"}
- Hero Character: ${input.storyBuilderData.before.heroCharacter || "Not identified"}
${input.storyBuilderData.before.tensionQuestions?.length ? `
TENSION QUESTIONS & RESPONSES:
${input.storyBuilderData.before.tensionQuestions.map(tq => 
  `Q: ${tq.prompt}\nA: ${tq.response || "No response recorded"}`
).join('\n\n')}` : ''}` : "";

  const questionResponsesContext = input.questionResponses?.length
    ? `\nDISCOVERY QUESTION RESPONSES:\n${input.questionResponses.map(qr => 
        `Q (${qr.methodology || 'General'}): ${qr.question}\nA: ${qr.response}`
      ).join('\n\n')}`
    : "";

  const notesContext = input.notes?.length
    ? `\nDISCOVERY NOTES:\n${input.notes.map(n => `- [${n.category || 'general'}] ${n.content}`).join('\n')}`
    : "";

  const callFlowContext = input.callFlow?.length
    ? `\nPLANNED CALL FLOW:\n${input.callFlow.map(cf => `- [${cf.phase}] ${cf.question}`).join('\n')}`
    : "";

  const prompt = `You are a senior Korn Ferry consultant analyzing discovery data for ${input.companyName}${input.industry ? ` (${input.industry} industry)` : ''}.

DISCOVERY THEME: ${input.discoveryTheme || "General Discovery"}

${researchContext}

${headlinesContext}

${greenSheetContext}

${storyContext}

${questionResponsesContext}

${notesContext}

${callFlowContext}

Based on ALL the discovery data above, synthesize strategic insights that will help the consultant transition to building value. Analyze patterns, identify opportunities, and provide actionable recommendations.

KORN FERRY VALUE PILLARS (use these for classification):
- Grow: Revenue growth, market expansion, sales effectiveness
- Optimise: Cost reduction, productivity improvement, efficiency
- De-risk: Compliance, retention, succession planning
- Strengthen Capability: Leadership development, culture, talent

Provide a comprehensive synthesis in JSON format:
{
  "whatWeLearned": {
    "keyThemes": [
      {
        "theme": "Theme title (e.g., 'Leadership Succession Gap')",
        "insight": "What we discovered and why it matters",
        "evidence": ["Specific data point or response that supports this", "Another supporting evidence"]
      }
    ],
    "summary": "2-3 sentence overview of key learnings"
  },
  "businessImplications": {
    "opportunities": [
      {
        "title": "Opportunity name",
        "description": "Why this is valuable for the client",
        "kornFerryPillar": "Grow|Optimise|De-risk|Strengthen Capability",
        "potentialValue": "Estimated business impact or value",
        "priority": "high|medium|low"
      }
    ],
    "risks": [
      {
        "title": "Risk name",
        "description": "Potential concern or obstacle",
        "mitigation": "How to address this risk"
      }
    ],
    "summary": "2-3 sentence overview of business implications"
  },
  "stakeholderSignals": {
    "championStatus": "Assessment of whether we have a champion and their strength",
    "buyingCommittee": "Overview of the decision-making landscape",
    "momentum": "strong|moderate|weak|unclear",
    "nextActions": ["Specific stakeholder-related action items"],
    "summary": "2-3 sentence stakeholder assessment"
  },
  "readinessToBuildValue": {
    "score": 75,
    "strengths": ["What's going well in the discovery"],
    "gaps": ["What's missing or needs more work"],
    "recommendations": ["Specific advice for strengthening position"],
    "nextSteps": ["Concrete next actions before building value case"],
    "summary": "Assessment of readiness to move forward"
  },
  "executiveSummary": "3-4 sentence executive summary of the entire discovery, suitable for sharing with leadership"
}

IMPORTANT:
- Base ALL insights on the actual data provided - reference specific findings
- If data is sparse, acknowledge gaps and focus on what IS available
- Be specific and actionable, not generic
- Tie opportunities to Korn Ferry pillars
- Provide realistic readiness scores based on available information
- Make the executive summary compelling and strategic`;

  try {
    console.log(`[AI Discovery Synthesis] Generating insights for ${input.companyName}`);
    
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
    
    const validationResult = discoverySynthesisSchema.safeParse(parsedContent);
    if (!validationResult.success) {
      console.error("[AI Discovery Synthesis] Validation failed:", validationResult.error);
      throw new Error(`AI discovery synthesis validation failed: ${validationResult.error.message}`);
    }
    
    console.log(`[AI Discovery Synthesis] Success! Generated strategic insights for ${input.companyName}`);
    return validationResult.data;
  } catch (error) {
    console.error("[AI Discovery Synthesis] Error:", error);
    throw error;
  }
}

// ============================================================================
// CONTACT ENRICHMENT - AI-powered research for Green Sheet contacts
// ============================================================================

export interface ContactEnrichmentInput {
  contactName: string;
  companyName: string;
  title?: string;
  linkedInUrl?: string;
}

export interface ContactEnrichmentResult {
  suggestedTitle: string | null;
  suggestedRole: string | null;
  suggestedInfluence: string | null;
  background: string;
  likelyPriorities: string[];
  potentialConcerns: string[];
  rapportBuilders: string[];
  communicationStyle: string;
  decisionMakingStyle: string;
  recommendedApproach: string;
}

const contactEnrichmentSchema = z.object({
  suggestedTitle: z.string().nullable(),
  suggestedRole: z.enum(["economic_buyer", "user_buyer", "technical_buyer", "coach", "champion"]).nullable(),
  suggestedInfluence: z.enum(["high", "medium", "low"]).nullable(),
  background: z.string(),
  likelyPriorities: z.array(z.string()),
  potentialConcerns: z.array(z.string()),
  rapportBuilders: z.array(z.string()),
  communicationStyle: z.string(),
  decisionMakingStyle: z.string(),
  recommendedApproach: z.string()
});

export async function enrichContactWithAI(input: ContactEnrichmentInput): Promise<ContactEnrichmentResult> {
  const prompt = `You are a strategic sales consultant helping prepare for an important meeting. Research and provide insights about this executive contact.

CONTACT INFORMATION:
- Name: ${input.contactName}
- Company: ${input.companyName}
${input.title ? `- Known Title: ${input.title}` : ""}
${input.linkedInUrl ? `- LinkedIn: ${input.linkedInUrl}` : ""}

Based on the contact's name, title, and company context, provide strategic intelligence to help prepare for the meeting. Even without direct access to their profile, use your knowledge of:
1. Typical responsibilities for this role/title
2. Common priorities for executives at companies like ${input.companyName}
3. Industry-specific challenges and trends
4. Communication preferences typical of this role level

INSTRUCTIONS:
- If the title is provided, use it to infer their buying role and influence level
- Generate realistic and useful insights based on role patterns
- Focus on actionable intelligence for a sales meeting
- Be specific to the industry/company context when possible

Return your analysis in JSON format:
{
  "suggestedTitle": "Title if not provided, null if already known",
  "suggestedRole": "One of: economic_buyer, user_buyer, technical_buyer, coach, champion - based on their likely decision authority",
  "suggestedInfluence": "One of: high, medium, low - based on title seniority",
  "background": "2-3 sentence professional background based on typical career paths for this role",
  "likelyPriorities": ["Priority 1", "Priority 2", "Priority 3"] - what they likely care about most,
  "potentialConcerns": ["Concern 1", "Concern 2", "Concern 3"] - what might worry them about a consulting engagement,
  "rapportBuilders": ["Topic 1", "Topic 2"] - conversation starters or shared interests,
  "communicationStyle": "Brief description of how they likely prefer to communicate (data-driven, story-oriented, etc.)",
  "decisionMakingStyle": "How they likely make decisions (consensus, data-driven, intuitive, etc.)",
  "recommendedApproach": "Specific tactical advice for the first meeting with this person"
}`;

  try {
    console.log(`[AI Contact Enrichment] Researching ${input.contactName} at ${input.companyName}`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("AI returned empty response");
    }
    
    const parsedContent = JSON.parse(content);
    
    const validationResult = contactEnrichmentSchema.safeParse(parsedContent);
    if (!validationResult.success) {
      console.error("[AI Contact Enrichment] Validation failed:", validationResult.error);
      throw new Error(`AI contact enrichment validation failed: ${validationResult.error.message}`);
    }
    
    console.log(`[AI Contact Enrichment] Success! Generated insights for ${input.contactName}`);
    return validationResult.data;
  } catch (error) {
    console.error("[AI Contact Enrichment] Error:", error);
    throw error;
  }
}

// ============================================================================
// OUTCOME RECOMMENDATIONS - AI-powered recommendations from discovery synthesis
// ============================================================================

export interface OutcomeRecommendationInput {
  companyName: string;
  industry?: string;
  discoverySynthesis: DiscoverySynthesisResult;
  existingCommitments?: Array<{ title: string; kpiName?: string }>;
}

export interface OutcomeRecommendation {
  id: string;
  outcomeName: string;
  outcomeDescription: string;
  why: {
    strategicRationale: string;
    discoveryEvidence: string[];
    businessImpact: string;
  };
  how: {
    approach: string;
    kornFerrySolution: string;
    timeframe: string;
    keyActivities: string[];
  };
  benchmark: {
    industryLow: string;
    industryMedian: string;
    industryHigh: string;
    topPerformerTarget: string;
    source: string;
  };
  kpiDetails: {
    metricName: string;
    unit: string;
    suggestedBaseline: string;
    suggestedTarget: string;
    targetTimeframe: string;
  };
  valuePillar: "grow" | "optimise" | "derisk" | "strengthen";
  priority: "high" | "medium" | "low";
  estimatedAnnualValue: string;
  confidenceScore: number;
}

export interface OutcomeRecommendationsResult {
  recommendations: OutcomeRecommendation[];
  summary: string;
  totalPotentialValue: string;
}

const outcomeRecommendationSchema = z.object({
  id: z.string(),
  outcomeName: z.string(),
  outcomeDescription: z.string(),
  why: z.object({
    strategicRationale: z.string(),
    discoveryEvidence: z.array(z.string()),
    businessImpact: z.string()
  }),
  how: z.object({
    approach: z.string(),
    kornFerrySolution: z.string(),
    timeframe: z.string(),
    keyActivities: z.array(z.string())
  }),
  benchmark: z.object({
    industryLow: z.string(),
    industryMedian: z.string(),
    industryHigh: z.string(),
    topPerformerTarget: z.string(),
    source: z.string()
  }),
  kpiDetails: z.object({
    metricName: z.string(),
    unit: z.string(),
    suggestedBaseline: z.string(),
    suggestedTarget: z.string(),
    targetTimeframe: z.string()
  }),
  valuePillar: z.enum(["grow", "optimise", "derisk", "strengthen"]),
  priority: z.enum(["high", "medium", "low"]),
  estimatedAnnualValue: z.string(),
  confidenceScore: z.number().min(0).max(100)
});

const outcomeRecommendationsResultSchema = z.object({
  recommendations: z.array(outcomeRecommendationSchema),
  summary: z.string(),
  totalPotentialValue: z.string()
});

export async function generateOutcomeRecommendations(input: OutcomeRecommendationInput): Promise<OutcomeRecommendationsResult> {
  const { companyName, industry, discoverySynthesis, existingCommitments } = input;
  
  const existingContext = existingCommitments?.length 
    ? `\nEXISTING COMMITMENTS (avoid duplicates):\n${existingCommitments.map(c => `- ${c.title}${c.kpiName ? ` (${c.kpiName})` : ''}`).join('\n')}`
    : "";

  const synthesisContext = `
DISCOVERY SYNTHESIS FOR ${companyName.toUpperCase()}${industry ? ` (${industry})` : ''}:

WHAT WE LEARNED:
${discoverySynthesis.whatWeLearned.keyThemes.map(t => 
  `Theme: ${t.theme}\nInsight: ${t.insight}\nEvidence: ${t.evidence.join('; ')}`
).join('\n\n')}
Summary: ${discoverySynthesis.whatWeLearned.summary}

BUSINESS OPPORTUNITIES:
${discoverySynthesis.businessImplications.opportunities.map(o => 
  `[${o.priority.toUpperCase()}] ${o.title}: ${o.description} (${o.kornFerryPillar}, Value: ${o.potentialValue})`
).join('\n')}

RISKS TO ADDRESS:
${discoverySynthesis.businessImplications.risks.map(r => 
  `${r.title}: ${r.description} (Mitigation: ${r.mitigation})`
).join('\n')}

STAKEHOLDER SIGNALS:
- Champion Status: ${discoverySynthesis.stakeholderSignals.championStatus}
- Buying Committee: ${discoverySynthesis.stakeholderSignals.buyingCommittee}
- Momentum: ${discoverySynthesis.stakeholderSignals.momentum}

READINESS ASSESSMENT:
- Score: ${discoverySynthesis.readinessToBuildValue.score}/100
- Strengths: ${discoverySynthesis.readinessToBuildValue.strengths.join('; ')}
- Gaps: ${discoverySynthesis.readinessToBuildValue.gaps.join('; ')}

EXECUTIVE SUMMARY: ${discoverySynthesis.executiveSummary}
${existingContext}`;

  const prompt = `You are a senior Korn Ferry value architect. Based on the discovery synthesis below, generate outcome recommendations that this customer should commit to achieving.

${synthesisContext}

Generate 3-5 outcome recommendations. Each recommendation must be:
1. Directly tied to discovery insights (with evidence)
2. Measurable with clear KPIs
3. Achievable within 12-18 months
4. Aligned to Korn Ferry solutions and value pillars

KORN FERRY VALUE PILLARS:
- grow: Revenue growth, market expansion, sales effectiveness
- optimise: Cost reduction, productivity improvement, efficiency gains
- derisk: Risk mitigation, compliance, retention, succession
- strengthen: Leadership development, culture transformation, capability building

KORN FERRY SOLUTIONS:
- Leadership Development: Executive coaching, leadership programs
- Talent Acquisition: Recruitment optimization, employer branding
- Succession Planning: Pipeline development, high-potential programs
- Organizational Design: Structure optimization, role clarity
- Culture Transformation: Engagement, values alignment
- Sales Effectiveness: Revenue enablement, sales training
- Rewards & Performance: Compensation, recognition programs

INDUSTRY BENCHMARKS:
Provide realistic benchmarks based on the industry. Use ranges (low/median/high) and cite "Korn Ferry Industry Benchmarks 2024" or "Industry Best Practice Research".

Return your recommendations in this JSON format:
{
  "recommendations": [
    {
      "id": "rec_1",
      "outcomeName": "Reduce Leadership Turnover",
      "outcomeDescription": "Decrease voluntary turnover among senior leaders through targeted retention and development programs",
      "why": {
        "strategicRationale": "Why this outcome matters for this specific customer",
        "discoveryEvidence": ["Evidence point 1 from discovery", "Evidence point 2"],
        "businessImpact": "The quantifiable business impact of achieving this outcome"
      },
      "how": {
        "approach": "Brief description of how to achieve this",
        "kornFerrySolution": "Which Korn Ferry solution area applies",
        "timeframe": "12 months",
        "keyActivities": ["Activity 1", "Activity 2", "Activity 3"]
      },
      "benchmark": {
        "industryLow": "25%",
        "industryMedian": "18%",
        "industryHigh": "8%",
        "topPerformerTarget": "10%",
        "source": "Korn Ferry Industry Benchmarks 2024"
      },
      "kpiDetails": {
        "metricName": "Leadership Turnover Rate",
        "unit": "%",
        "suggestedBaseline": "22%",
        "suggestedTarget": "12%",
        "targetTimeframe": "12 months"
      },
      "valuePillar": "derisk",
      "priority": "high",
      "estimatedAnnualValue": "$2.5M",
      "confidenceScore": 85
    }
  ],
  "summary": "Brief executive summary of the recommendations package",
  "totalPotentialValue": "$X.XM"
}

Guidelines:
- Generate recommendations that directly address discovery findings
- Use specific numbers in benchmarks and targets
- Ensure recommendations complement (don't duplicate) existing commitments
- Prioritize high-impact, achievable outcomes
- Include a mix of value pillars where supported by discovery`;

  try {
    console.log(`[AI Outcome Recommendations] Generating for ${companyName}`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("AI returned empty response");
    }
    
    const parsedContent = JSON.parse(content);
    
    const validationResult = outcomeRecommendationsResultSchema.safeParse(parsedContent);
    if (!validationResult.success) {
      console.error("[AI Outcome Recommendations] Validation failed:", validationResult.error);
      throw new Error(`AI outcome recommendations validation failed: ${validationResult.error.message}`);
    }
    
    console.log(`[AI Outcome Recommendations] Success! Generated ${validationResult.data.recommendations.length} recommendations for ${companyName}`);
    return validationResult.data;
  } catch (error) {
    console.error("[AI Outcome Recommendations] Error:", error);
    throw error;
  }
}

// ============================================================================
// COMPETITIVE INTELLIGENCE - AI-Generated Positioning
// ============================================================================

export interface CompetitiveIntelligenceInput {
  companyName: string;
  industry?: string;
  discoveryTheme?: string;
  discoverySynthesis?: any; // Full synthesis from discovery phase
  dataPoints?: Array<{
    label: string;
    value: string;
    solutionArea: string;
    kornFerryPillar: string;
  }>;
  solutionAreas: string[]; // Which solution areas to analyze (e.g., ["ASSESS", "DEVELOP"])
}

export interface CompetitorPositioning {
  competitorId: string;
  competitorName: string;
  solutionArea: string;
  contextualPositioning: string; // How KF differentiates vs this competitor FOR THIS client
  clientSpecificAdvantages: string[];
  conversationStarters: string[];
  battleCardScenario: string;
  battleCardResponse: string;
  winTheme: string;
  likelihoodToCompete: "high" | "medium" | "low";
  likelihoodReason: string;
}

export interface CompetitiveSummaryResult {
  executiveSummary: string;
  primaryCompetitors: string[]; // Top 3-5 competitors most likely to compete for this work
  competitorLikelihood: Record<string, { likelihood: "high" | "medium" | "low"; reason: string }>;
  kornFerryDifferentiators: string[]; // Most relevant differentiators for this client
  keyWinThemes: string[];
  avoidThemes: string[];
  industryContext: string;
  positioning: CompetitorPositioning[];
}

const competitorPositioningSchema = z.object({
  competitorId: z.string(),
  competitorName: z.string(),
  solutionArea: z.string(),
  contextualPositioning: z.string(),
  clientSpecificAdvantages: z.array(z.string()),
  conversationStarters: z.array(z.string()),
  battleCardScenario: z.string(),
  battleCardResponse: z.string(),
  winTheme: z.string(),
  likelihoodToCompete: z.enum(["high", "medium", "low"]),
  likelihoodReason: z.string()
});

const competitiveSummaryResultSchema = z.object({
  executiveSummary: z.string(),
  primaryCompetitors: z.array(z.string()),
  competitorLikelihood: z.record(z.object({
    likelihood: z.enum(["high", "medium", "low"]),
    reason: z.string()
  })),
  kornFerryDifferentiators: z.array(z.string()),
  keyWinThemes: z.array(z.string()),
  avoidThemes: z.array(z.string()),
  industryContext: z.string(),
  positioning: z.array(competitorPositioningSchema)
});

export async function generateCompetitiveIntelligence(
  input: CompetitiveIntelligenceInput
): Promise<CompetitiveSummaryResult> {
  const { companyName, industry, discoveryTheme, discoverySynthesis, dataPoints, solutionAreas } = input;
  
  // Build context from static knowledge base
  const relevantCompetitors: typeof COMPETITORS = [];
  const relevantDifferentiators: typeof KORN_FERRY_DIFFERENTIATORS = [];
  const relevantComparisons: typeof COMPETITIVE_COMPARISONS = [];
  
  for (const area of solutionAreas) {
    const areaCompetitors = getCompetitorsBySolutionArea(area);
    areaCompetitors.forEach(c => {
      if (!relevantCompetitors.find(rc => rc.id === c.id)) {
        relevantCompetitors.push(c);
      }
    });
    
    const areaDifferentiators = getDifferentiatorsBySolutionArea(area);
    areaDifferentiators.forEach(d => {
      if (!relevantDifferentiators.find(rd => rd.id === d.id)) {
        relevantDifferentiators.push(d);
      }
    });
    
    const comparison = getCompetitiveComparison(area);
    if (comparison) {
      relevantComparisons.push(comparison);
    }
  }
  
  // Build the competitive knowledge context
  const competitorContext = relevantCompetitors.map(c => {
    // Extract strengths and limitations from all offerings
    const allStrengths: string[] = [];
    const allLimitations: string[] = [];
    Object.values(c.offerings).forEach(offering => {
      allStrengths.push(...(offering.strengths || []));
      allLimitations.push(...(offering.limitations || []));
    });
    
    return `
COMPETITOR: ${c.name} (${c.id})
Category: ${c.category}
Solution Areas: ${c.solutionAreas.join(", ")}
Strengths: ${allStrengths.slice(0, 5).join("; ") || "Not specified"}
Weaknesses/Limitations: ${allLimitations.slice(0, 5).join("; ") || "Not specified"}
`;
  }).join("\n");

  const differentiatorContext = relevantDifferentiators.map(d => `
DIFFERENTIATOR: ${d.title}
Description: ${d.description}
Evidence: ${d.proofPoints.join("; ")}
Competitive Advantage vs: ${d.competitiveAdvantageVs.join(", ")}
`).join("\n");

  const comparisonContext = relevantComparisons.map(c => `
SOLUTION AREA: ${c.solutionArea}
KF Strengths: ${c.kornFerryStrengths.join("; ")}
Battle Cards: ${c.battleCards.map(bc => `Scenario: ${bc.scenario} → Response: ${bc.kornFerryResponse}`).join("\n")}
`).join("\n");

  // Build discovery context if available
  let discoveryContext = "";
  if (discoverySynthesis) {
    discoveryContext = `
DISCOVERY SYNTHESIS:
Executive Summary: ${discoverySynthesis.executiveSummary || "Not available"}
What We Learned: ${discoverySynthesis.whatWeLearned?.keyThemes?.map((t: any) => t.theme + ": " + t.insight).join("; ") || "Not available"}
Business Opportunities: ${discoverySynthesis.businessImplications?.opportunities?.map((o: any) => o.title).join(", ") || "Not available"}
`;
  }
  
  if (dataPoints && dataPoints.length > 0) {
    discoveryContext += `\nKEY INSIGHTS FROM RESEARCH:
${dataPoints.slice(0, 10).map(dp => `- ${dp.label}: ${dp.value} [${dp.solutionArea}]`).join("\n")}
`;
  }
  
  const prompt = `You are a senior Korn Ferry competitive strategist. Generate personalized competitive intelligence for this specific client engagement.

CLIENT CONTEXT:
Company: ${companyName}
${industry ? `Industry: ${industry}` : ""}
${discoveryTheme ? `Discovery Theme: ${discoveryTheme}` : ""}
Solution Areas in Scope: ${solutionAreas.join(", ")}

${discoveryContext}

COMPETITIVE LANDSCAPE KNOWLEDGE:
${competitorContext}

KORN FERRY DIFFERENTIATORS:
${differentiatorContext}

COMPETITIVE COMPARISONS BY SOLUTION AREA:
${comparisonContext}

Based on the client context and competitive knowledge above, generate a comprehensive competitive intelligence brief.

IMPORTANT GUIDELINES:
1. Be specific to ${companyName} - use their industry, challenges, and context to personalize positioning
2. For each competitor, explain WHY they might compete for THIS specific engagement
3. Create battle card scenarios that are realistic for this client's situation
4. Recommend differentiators that resonate with this client's priorities
5. Identify themes to emphasize AND themes to avoid based on client context
6. Include 2-3 conversation starters per competitor that a consultant could use

Return your analysis in this JSON format:
{
  "executiveSummary": "2-3 sentence overview of competitive positioning for this opportunity",
  "primaryCompetitors": ["competitorId1", "competitorId2", "competitorId3"],
  "competitorLikelihood": {
    "competitorId": { "likelihood": "high|medium|low", "reason": "Why they're likely to compete" }
  },
  "kornFerryDifferentiators": ["differentiator_id_1", "differentiator_id_2"],
  "keyWinThemes": ["Theme to emphasize 1", "Theme to emphasize 2", "Theme to emphasize 3"],
  "avoidThemes": ["Topic to avoid or downplay"],
  "industryContext": "Industry-specific competitive dynamics for ${industry || "this sector"}",
  "positioning": [
    {
      "competitorId": "mckinsey",
      "competitorName": "McKinsey & Company",
      "solutionArea": "TRANSFORM",
      "contextualPositioning": "How KF wins against this competitor for THIS client",
      "clientSpecificAdvantages": ["Advantage 1 relevant to client", "Advantage 2"],
      "conversationStarters": ["Question to ask client about competitor", "Another opener"],
      "battleCardScenario": "Realistic scenario for this engagement",
      "battleCardResponse": "How to respond effectively",
      "winTheme": "Key theme to emphasize",
      "likelihoodToCompete": "high|medium|low",
      "likelihoodReason": "Why this competitor might/might not compete"
    }
  ]
}

Generate positioning for the top 4-6 most relevant competitors for the solution areas in scope.`;

  try {
    console.log(`[AI Competitive Intelligence] Generating for ${companyName}, areas: ${solutionAreas.join(", ")}`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 6000,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("AI returned empty response");
    }
    
    const parsedContent = JSON.parse(content);
    
    const validationResult = competitiveSummaryResultSchema.safeParse(parsedContent);
    if (!validationResult.success) {
      console.error("[AI Competitive Intelligence] Validation failed:", validationResult.error);
      throw new Error(`AI competitive intelligence validation failed: ${validationResult.error.message}`);
    }
    
    console.log(`[AI Competitive Intelligence] Success! Generated positioning for ${validationResult.data.positioning.length} competitors`);
    return validationResult.data;
  } catch (error) {
    console.error("[AI Competitive Intelligence] Error:", error);
    throw error;
  }
}
