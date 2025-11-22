import OpenAI from "openai";

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
  const existingContext = `
Existing Research Summary:
${existingResearch.dataPoints.map(dp => `- ${dp.label}: ${dp.value}`).join('\n')}

Recent Headlines:
${existingResearch.headlines.map(h => `- ${h.title} (${h.date})`).join('\n')}
`;

  const prompt = `You are helping a Korn Ferry consultant who needs additional information about ${companyName}${sector ? ` (${sector} sector)` : ''}.

${existingContext}

The consultant has asked: "${question}"

Provide targeted, strategic insights to answer this specific question. Focus on actionable information that would help a management consultant prepare for client engagement.

Return your response in JSON format with this exact structure:
{
  "dataPoints": [
    {"label": "Category or aspect", "value": "Detailed answer or insight", "confidence": "high|medium|low", "source": "source name"}
  ],
  "headlines": [
    {"title": "headline text relevant to the question", "date": "YYYY-MM-DD", "source": "source name", "url": "https://..."}
  ]
}

Important:
- Focus specifically on answering the consultant's question
- Provide concrete, actionable insights
- Use "high" confidence for publicly available facts, "medium" for analyst estimates, "low" for uncertain data
- Include specific sources
- Build on the existing research context provided above`;

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
  const prompt = `You are helping a Korn Ferry consultant prepare for a customer engagement. Research ${companyName}${sector ? ` (${sector} sector)` : ''} and provide strategically relevant insights:

1. Strategic Intelligence (from latest annual reports, investor presentations, and company statements):
   - Key strategic initiatives and transformation programs underway
   - Stated competitive advantages and market positioning strategy
   - Major investment priorities (R&D, technology, digital transformation)
   - Organizational structure and recent leadership changes
   - Merger & acquisition strategy and recent deals
   - Geographic expansion and market entry priorities
   - Sustainability and ESG commitments and progress

2. Industry Context & Trends:
   - Key industry trends and disruptions affecting the company
   - Competitive pressures and market headwinds
   - Regulatory changes impacting the business
   - Emerging opportunities in the market
   - Supply chain considerations and challenges

3. Business Performance & Outlook:
   - Recent financial performance and guidance
   - Key growth drivers and revenue streams
   - Operational challenges and efficiency initiatives
   - Workforce and talent strategy

Return your response in JSON format with this exact structure:
{
  "dataPoints": [
    {"label": "Strategic Initiative", "value": "Description of initiative and business impact", "confidence": "high|medium|low", "source": "source name"},
    {"label": "Market Position", "value": "Competitive advantages and positioning", "confidence": "high|medium|low", "source": "source name"}
  ],
  "headlines": [
    {"title": "headline text with strategic relevance", "date": "YYYY-MM-DD", "source": "source name", "url": "https://..."}
  ]
}

Important:
- Prioritize data points that would be most relevant for a management consultant to understand before engaging with this company
- Use "high" confidence for publicly available facts from annual reports and official sources, "medium" for analyst estimates or less-confirmed reports, "low" for uncertain or speculative data
- Focus on strategic, operational, and market intelligence rather than just basic company facts
- Include specific sources for each data point
- For headlines, use real or plausible URLs
- If you don't have current data, use your training data and mark confidence as "medium" or "low"`;

  try {
    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
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
    console.error("Error researching company:", error);
    throw new Error("Failed to research company with AI");
  }
}
