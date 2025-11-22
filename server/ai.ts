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
  const prompt = `You are a business intelligence analyst. Research ${companyName}${sector ? ` (${sector})` : ''} and provide specific, actionable insights.

Return valid JSON with two arrays: dataPoints and headlines.

For dataPoints, include 15+ items covering:
- Annual report priorities (revenue targets, strategic initiatives, M&A)
- Industry trends (disruptions, technology adoption, regulatory changes)
- Recent news items (leadership changes, product launches, partnerships)
- Operational metrics (headcount, markets, supply chain)
- LinkedIn insights (hiring patterns, departures)
- Competitive position (market share, threats, customer satisfaction)

For headlines, include 8+ recent news items from the last 12 months.

Return this JSON:
{
  "dataPoints": [{"label": "string", "value": "string", "confidence": "high|medium|low", "source": "string"}],
  "headlines": [{"title": "string", "date": "YYYY-MM-DD", "source": "string", "url": "string"}]
}`;

  let rawContent = "";
  try {
    console.log(`Starting AI research for ${companyName}${sector ? ` (${sector})` : ''}`);
    console.log(`API Key available: ${!!process.env.AI_INTEGRATIONS_OPENAI_API_KEY}`);
    console.log(`API Base URL: ${process.env.AI_INTEGRATIONS_OPENAI_BASE_URL}`);
    
    // Use gpt-4 for compatibility with Replit OpenAI integration
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: 2000,
    });

    rawContent = response.choices?.[0]?.message?.content || "";
    console.log(`Raw AI response received, length: ${rawContent.length}`);
    
    if (!rawContent || rawContent.trim() === "") {
      console.error("Empty response from AI - API may be unavailable or rate limited");
      return { dataPoints: [], headlines: [] };
    }

    let content = rawContent.trim();
    
    // Remove markdown if present
    if (content.includes("```")) {
      content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    }
    
    const result = JSON.parse(content);
    
    // Ensure we have valid arrays
    const dataPoints = Array.isArray(result.dataPoints) ? result.dataPoints : [];
    const headlines = Array.isArray(result.headlines) ? result.headlines : [];
    
    console.log(`Successfully processed research: ${dataPoints.length} data points, ${headlines.length} headlines`);
    
    return {
      dataPoints,
      headlines,
    };
  } catch (error) {
    console.error("Error researching company:", error instanceof Error ? error.message : String(error));
    return { dataPoints: [], headlines: [] };
  }
}
