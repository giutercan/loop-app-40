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
  const prompt = `Research ${companyName}${sector ? ` (${sector} sector)` : ''} and provide:

1. Key company data points:
   - Revenue (latest year)
   - Employee count
   - Market cap (if public)
   - Number of locations/offices
   - Year founded
   - CEO name

2. Recent headlines or major news (last 6 months)

Return your response in JSON format with this exact structure:
{
  "dataPoints": [
    {"label": "Revenue", "value": "$X billion", "confidence": "high|medium|low", "source": "source name"}
  ],
  "headlines": [
    {"title": "headline text", "date": "YYYY-MM-DD", "source": "source name", "url": "https://..."}
  ]
}

Important:
- Use "high" confidence for publicly available facts, "medium" for estimates, "low" for uncertain data
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
