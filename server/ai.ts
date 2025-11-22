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

Return a JSON object with two arrays: dataPoints and headlines.

For dataPoints, include 15+ items covering:
- Annual report priorities (revenue targets, strategic initiatives, M&A)
- Industry trends (disruptions, technology adoption, regulatory changes)
- Recent news items (leadership changes, product launches, partnerships)
- Operational metrics (headcount, markets, supply chain)
- LinkedIn insights (hiring patterns, departures)
- Competitive position (market share, threats, customer satisfaction)

For headlines, include 8+ recent news items from the last 12 months.

JSON format (return ONLY the JSON object, no markdown, no extra text):
{
  "dataPoints": [
    {
      "label": "string describing the data point",
      "value": "specific fact or number",
      "confidence": "high" | "medium" | "low",
      "source": "source of information"
    }
  ],
  "headlines": [
    {
      "title": "news headline",
      "date": "YYYY-MM-DD",
      "source": "news source",
      "url": "https://example.com/news"
    }
  ]
}`;

  let rawContent = "";
  try {
    console.log(`Starting AI research for ${companyName}${sector ? ` (${sector})` : ''}`);
    
    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 8192,
    });

    console.log(`Full response object:`, JSON.stringify({
      choices_length: response.choices?.length,
      first_choice_message: response.choices?.[0]?.message,
      finish_reason: response.choices?.[0]?.finish_reason
    }, null, 2));

    rawContent = response.choices?.[0]?.message?.content || "";
    console.log(`Raw AI response received, length: ${rawContent.length}, content: "${rawContent.substring(0, 200)}"`);
    
    if (!rawContent || rawContent.trim() === "") {
      console.error("Empty response from AI - this may indicate an API issue");
      console.error("Response finish reason:", response.choices?.[0]?.finish_reason);
      return { dataPoints: [], headlines: [] };
    }

    let content = rawContent.trim();
    
    // Remove markdown if present
    if (content.includes("```")) {
      content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    }
    
    console.log(`Parsing JSON, content preview: ${content.substring(0, 100)}...`);
    const result = JSON.parse(content);
    
    console.log(`Parsed result - dataPoints: ${result.dataPoints?.length || 0}, headlines: ${result.headlines?.length || 0}`);
    
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
    console.error("Raw response content:", rawContent.substring(0, 500));
    // Return empty arrays instead of throwing to avoid breaking the API
    return { dataPoints: [], headlines: [] };
  }
}
