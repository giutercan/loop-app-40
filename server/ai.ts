import OpenAI from "openai";
import { getSolutionSummary } from "@shared/knowledge";

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
      model: "gpt-5",
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
      model: "gpt-5",
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
      model: "gpt-5",
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
