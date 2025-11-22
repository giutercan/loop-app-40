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

export async function researchCompany(companyName: string, sector?: string): Promise<CompanyResearchResult> {
  const prompt = `Deep research ${companyName}${sector ? ` (${sector} sector)` : ''} to provide TANGIBLE business intelligence for a sales/consulting conversation. Return REAL, SPECIFIC findings.

FOCUS ON THESE AREAS (use your latest knowledge):

1. STRATEGIC PRIORITIES & ANNUAL REPORT FINDINGS:
   - Key strategic initiatives mentioned in latest annual report
   - Revenue growth targets/actual growth rates
   - Market expansion plans
   - Digital transformation initiatives
   - Cost optimization or efficiency programs
   - Geographic expansion or contraction
   - M&A activity or partnerships

2. INDUSTRY TRENDS & MARKET CONTEXT:
   - Key industry disruptions (AI, automation, consolidation, etc.)
   - Regulatory changes impacting the industry
   - Shifting customer preferences in the sector
   - Emerging competitors or new business models
   - Industry growth rates and forecasts
   - Technology adoption trends (cloud, AI, blockchain, etc.)
   - Sustainability/ESG trends in the industry
   - Labor market trends in the industry
   - Supply chain evolution in the sector

3. RECENT NEWS & PRESS RELEASES (Last 12 months):
   - Leadership changes (C-suite appointments/departures)
   - Major product launches or announcements
   - Earnings surprises or guidance changes
   - Sustainability/ESG commitments
   - Industry awards or recognitions
   - Layoff announcements or hiring sprees
   - Strategic partnerships or deals

4. OPERATIONAL METRICS & CHALLENGES:
   - Current headcount and recent changes
   - Key markets by revenue
   - Customer concentration or churn issues
   - Supply chain challenges
   - Regulatory or compliance issues
   - Industry disruption threats

5. LINKEDIN & TALENT INSIGHTS:
   - Recent high-profile departures or hirings
   - Areas with most hiring activity
   - Cultural themes from employee posts
   - Leadership visibility on LinkedIn

6. COMPETITIVE POSITION:
   - Market share vs competitors
   - Unique value proposition
   - Key competitive threats
   - Customer satisfaction indicators

Return ONLY valid JSON (no markdown, no extra text):
{
  "dataPoints": [
    {"label": "Strategic Priority: [initiative name]", "value": "[specific detail from annual report/earnings]", "confidence": "high|medium|low", "source": "[Annual Report 2024|Press Release|Earnings Call|LinkedIn|News Article]"},
    {"label": "Industry Trend: [trend name]", "value": "[specific market impact/adoption rate]", "confidence": "high|medium|low", "source": "[Industry Report|Market Analysis|News]"}
  ],
  "headlines": [
    {"title": "[Specific news headline with actual details]", "date": "YYYY-MM-DD", "source": "[Company|Reuters|Bloomberg|Press Release|Industry News]", "url": "https://[real domain]/news/[slug]"}
  ]
}

CRITICAL: 
- ONLY include real, verifiable facts from your knowledge
- Mark confidence as "high" only for official company announcements or well-established facts
- Mark as "medium" for recent reports and news
- Mark as "low" for analysis or predictions
- Include AT LEAST 15 data points covering strategic priorities, industry trends, operational metrics, and competitive landscape
- Include AT LEAST 5 data points specifically about industry trends and how they impact this company
- Include AT LEAST 8 recent news items (last 12 months)
- Be SPECIFIC with numbers, dates, and actual initiatives - NOT generic
- Focus on what helps someone prepare for a business conversation with this company`;

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
