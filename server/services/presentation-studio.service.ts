import { storage } from "../storage";
import { openai } from "../ai";

export type PresentationPurpose = 'customer_engagement' | 'qbr' | 'executive_pitch' | 'discovery_readout' | 'handoff_brief' | 'evidence_review' | 'value_story';

export type PresentationAudience = 'c_suite' | 'client_sponsor' | 'delivery_team' | 'board' | 'internal_review' | 'buying_committee';

export type PresentationTemplate = 'executive_modern' | 'data_driven' | 'visual_narrative';

export type TopicCategory = 'discovery_insights' | 'stakeholder_priorities' | 'kpi_commitments' | 'alignment_progress' | 'value_realization' | 'evidence_pack' | 'success_stories' | 'green_sheet_objectives' | 'growth_accelerator' | 'competitive_landscape';

export interface PresentationRequest {
  accountId: number;
  projectId: number;
  purpose: PresentationPurpose;
  audience: PresentationAudience;
  selectedTopics: TopicCategory[];
  templateOverride?: PresentationTemplate;
  customTitle?: string;
  customSubtitle?: string;
}

export interface SlideContent {
  id: string;
  slideType: 'title' | 'section_divider' | 'content' | 'kpi_scorecard' | 'chart' | 'timeline' | 'quote' | 'flow_diagram' | 'comparison' | 'summary' | 'image_feature';
  title: string;
  subtitle?: string;
  bodyContent?: string;
  bulletPoints?: string[];
  metrics?: Array<{ label: string; value: string; trend?: 'up' | 'down' | 'stable'; color?: string }>;
  chartData?: { type: 'bar' | 'pie' | 'line' | 'doughnut'; labels: string[]; data: number[]; colors?: string[] };
  quoteText?: string;
  quoteAuthor?: string;
  imageCategory?: 'professional' | 'teamwork' | 'technology' | 'leadership' | 'cityscape' | 'innovation';
  flowSteps?: Array<{ label: string; description?: string }>;
  comparisonItems?: Array<{ label: string; before: string; after: string }>;
  coachingTip?: string;
  speakerNotes?: string;
  topicSource: TopicCategory;
}

export interface CoachingRecommendation {
  type: 'strength' | 'gap' | 'suggestion' | 'narrative_flow' | 'template_tip';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionableAdvice: string;
  relatedTopic?: TopicCategory;
}

export interface PresentationPlan {
  recommendedTemplate: PresentationTemplate;
  templateRationale: string;
  slides: SlideContent[];
  coaching: CoachingRecommendation[];
  dataCompleteness: Record<TopicCategory, { available: boolean; dataPoints: number; quality: 'strong' | 'moderate' | 'weak' | 'missing' }>;
  narrativeFlow: string;
  estimatedDuration: string;
}

const BRAND_COLORS = {
  navy: "#00173B",
  forestGreen: "#00634F",
  oceanBlue: "#005971",
  emerald: "#009B77",
  mint: "#05C690",
  lime: "#8DC63F",
  cyan: "#00ADBB",
  purple: "#A3238E",
  gray: "#929192",
};

const AUDIENCE_CONTEXT: Record<PresentationAudience, string> = {
  c_suite: "C-Suite executives care about strategic impact, ROI, competitive advantage, and organizational transformation. Keep slides concise with high-level metrics and strategic narratives.",
  client_sponsor: "Client sponsors want to see progress on commitments, value delivered, and clear next steps. Balance data with narrative to reinforce the partnership.",
  delivery_team: "Delivery teams need operational detail, KPI tracking, blockers, and actionable next steps. Data-heavy slides with clear accountability.",
  board: "Board members require executive summaries, financial impact, risk assessment, and strategic alignment. Maximum 10-12 slides with powerful visuals.",
  internal_review: "Internal reviewers need comprehensive data, methodology details, and honest assessment of gaps. Include coaching notes and improvement areas.",
  buying_committee: "Buying committees evaluate ROI, risk mitigation, competitive differentiation, and implementation feasibility. Use evidence and proof points heavily.",
};

const PURPOSE_CONTEXT: Record<PresentationPurpose, string> = {
  customer_engagement: "Build trust and demonstrate understanding of the client's challenges. Lead with insights, not product features.",
  qbr: "Quarterly Business Review - showcase progress, celebrate wins, address risks, and align on next quarter priorities.",
  executive_pitch: "Concise, compelling case for investment or continued partnership. Lead with business impact.",
  discovery_readout: "Share findings from discovery phase. Demonstrate deep understanding of client's landscape and opportunities.",
  handoff_brief: "Transfer knowledge from sales to delivery. Cover commitments, stakeholder map, risks, and success criteria.",
  evidence_review: "Present evidence of value delivered. Use data, testimonials, and before/after comparisons.",
  value_story: "Tell the story of transformation. Use narrative arc: challenge, approach, results, future vision.",
};

interface AggregatedData {
  account: any;
  project: any;
  kpiCommitments: any[];
  evidencePack: any;
  evidencePackItems: any[];
  successStories: any[];
  successStoryLibrary: any[];
  headlines: any[];
  valueCases: any[];
  discoveryQuestions: any[];
  blueSheet: any;
  growthAcceleratorCanvases: any[];
  greenSheetData: any;
  narrativeCanvas: any;
  storyBuilderData: any;
}

export async function aggregatePresentationData(
  accountId: number,
  projectId: number,
  topics: TopicCategory[]
): Promise<AggregatedData> {
  const data: AggregatedData = {
    account: null,
    project: null,
    kpiCommitments: [],
    evidencePack: null,
    evidencePackItems: [],
    successStories: [],
    successStoryLibrary: [],
    headlines: [],
    valueCases: [],
    discoveryQuestions: [],
    blueSheet: null,
    growthAcceleratorCanvases: [],
    greenSheetData: null,
    narrativeCanvas: null,
    storyBuilderData: null,
  };

  try {
    data.account = await storage.getAccount(accountId);
  } catch (e) {
    console.warn("[PresentationStudio] Failed to fetch account:", e);
  }

  try {
    data.project = await storage.getProject(projectId);
    if (data.project) {
      data.greenSheetData = data.project.greenSheetData || null;
      data.narrativeCanvas = data.project.narrativeCanvas || null;
      data.storyBuilderData = data.project.storyBuilderData || null;
    }
  } catch (e) {
    console.warn("[PresentationStudio] Failed to fetch project:", e);
  }

  try {
    data.kpiCommitments = await storage.getKpiCommitments(projectId);
  } catch (e) {
    console.warn("[PresentationStudio] Failed to fetch KPI commitments:", e);
  }

  try {
    const pack = await storage.getEvidencePackByProject(projectId);
    data.evidencePack = pack || null;
    if (pack) {
      try {
        data.evidencePackItems = await storage.getEvidencePackItems(pack.id);
      } catch (e) {
        console.warn("[PresentationStudio] Failed to fetch evidence pack items:", e);
      }
    }
  } catch (e) {
    console.warn("[PresentationStudio] Failed to fetch evidence packs:", e);
  }

  try {
    data.successStories = await storage.getSuccessStories(projectId);
  } catch (e) {
    console.warn("[PresentationStudio] Failed to fetch success stories:", e);
  }

  try {
    const accountData = data.account;
    const industry = accountData?.industry || undefined;
    data.successStoryLibrary = await storage.getSuccessStoryLibrary({
      industry,
      approvalStatus: 'approved',
    });
  } catch (e) {
    console.warn("[PresentationStudio] Failed to fetch success story library:", e);
  }

  try {
    data.headlines = await storage.getHeadlines(projectId);
  } catch (e) {
    console.warn("[PresentationStudio] Failed to fetch headlines:", e);
  }

  try {
    data.valueCases = await storage.getValueCases(projectId);
  } catch (e) {
    console.warn("[PresentationStudio] Failed to fetch value cases:", e);
  }

  try {
    data.discoveryQuestions = await storage.getDiscoveryQuestions(projectId);
  } catch (e) {
    console.warn("[PresentationStudio] Failed to fetch discovery questions:", e);
  }

  try {
    data.blueSheet = await storage.getBlueSheet(projectId) || null;
  } catch (e) {
    console.warn("[PresentationStudio] Failed to fetch blue sheet:", e);
  }

  try {
    data.growthAcceleratorCanvases = await storage.getGrowthAcceleratorCanvases(projectId);
  } catch (e) {
    console.warn("[PresentationStudio] Failed to fetch growth accelerator canvases:", e);
  }

  return data;
}

export function selectTemplate(
  purpose: PresentationPurpose,
  audience: PresentationAudience,
  topics: TopicCategory[]
): PresentationTemplate {
  const executiveAudiences: PresentationAudience[] = ['c_suite', 'board'];
  const executivePurposes: PresentationPurpose[] = ['executive_pitch'];
  if (executiveAudiences.includes(audience) || executivePurposes.includes(purpose)) {
    return 'executive_modern';
  }

  const dataDrivenAudiences: PresentationAudience[] = ['delivery_team', 'internal_review'];
  const dataDrivenPurposes: PresentationPurpose[] = ['qbr', 'evidence_review'];
  if (dataDrivenAudiences.includes(audience) || dataDrivenPurposes.includes(purpose)) {
    return 'data_driven';
  }

  const narrativeAudiences: PresentationAudience[] = ['client_sponsor', 'buying_committee'];
  const narrativePurposes: PresentationPurpose[] = ['customer_engagement', 'discovery_readout', 'value_story', 'handoff_brief'];
  if (narrativeAudiences.includes(audience) || narrativePurposes.includes(purpose)) {
    return 'visual_narrative';
  }

  const dataTopics: TopicCategory[] = ['kpi_commitments', 'value_realization', 'evidence_pack'];
  const dataTopicCount = topics.filter(t => dataTopics.includes(t)).length;
  if (dataTopicCount >= 2) {
    return 'data_driven';
  }

  return 'visual_narrative';
}

function assessDataCompleteness(
  data: AggregatedData,
  topics: TopicCategory[]
): Record<TopicCategory, { available: boolean; dataPoints: number; quality: 'strong' | 'moderate' | 'weak' | 'missing' }> {
  const allTopics: TopicCategory[] = [
    'discovery_insights', 'stakeholder_priorities', 'kpi_commitments',
    'alignment_progress', 'value_realization', 'evidence_pack',
    'success_stories', 'green_sheet_objectives', 'growth_accelerator',
    'competitive_landscape'
  ];

  const result: Record<string, { available: boolean; dataPoints: number; quality: 'strong' | 'moderate' | 'weak' | 'missing' }> = {};

  for (const topic of allTopics) {
    let dataPoints = 0;
    let available = false;

    switch (topic) {
      case 'discovery_insights': {
        const answeredQuestions = data.discoveryQuestions.filter((q: any) => q.answer);
        dataPoints = answeredQuestions.length;
        available = dataPoints > 0 || !!data.project?.discoveryCompleted;
        break;
      }
      case 'stakeholder_priorities': {
        const hasGreenSheet = !!data.greenSheetData?.meetingContact;
        const hasBlueSheet = !!data.blueSheet?.data;
        dataPoints = (hasGreenSheet ? 1 : 0) + (hasBlueSheet ? 1 : 0);
        available = hasGreenSheet || hasBlueSheet;
        break;
      }
      case 'kpi_commitments': {
        dataPoints = data.kpiCommitments.length;
        available = dataPoints > 0;
        break;
      }
      case 'alignment_progress': {
        dataPoints = data.valueCases.length + data.headlines.length;
        available = dataPoints > 0;
        break;
      }
      case 'value_realization': {
        const withBaselines = data.kpiCommitments.filter((k: any) => k.baselineValue);
        const withTargets = data.kpiCommitments.filter((k: any) => k.targetValue);
        dataPoints = withBaselines.length + withTargets.length;
        available = dataPoints > 0;
        break;
      }
      case 'evidence_pack': {
        dataPoints = data.evidencePackItems.length;
        available = dataPoints > 0;
        break;
      }
      case 'success_stories': {
        dataPoints = data.successStories.length + data.successStoryLibrary.length;
        available = dataPoints > 0;
        break;
      }
      case 'green_sheet_objectives': {
        const hasCallPlanner = !!data.greenSheetData?.callPlanner;
        const hasNarrative = !!data.narrativeCanvas;
        dataPoints = (hasCallPlanner ? 1 : 0) + (hasNarrative ? 1 : 0);
        available = hasCallPlanner || hasNarrative;
        break;
      }
      case 'growth_accelerator': {
        dataPoints = data.growthAcceleratorCanvases.length;
        available = dataPoints > 0;
        break;
      }
      case 'competitive_landscape': {
        const hasBlueSheetCompetitions = !!(data.blueSheet?.data as any)?.competitions;
        dataPoints = hasBlueSheetCompetitions ? 1 : 0;
        available = hasBlueSheetCompetitions;
        break;
      }
    }

    let quality: 'strong' | 'moderate' | 'weak' | 'missing';
    if (!available || dataPoints === 0) {
      quality = 'missing';
    } else if (dataPoints >= 5) {
      quality = 'strong';
    } else if (dataPoints >= 2) {
      quality = 'moderate';
    } else {
      quality = 'weak';
    }

    result[topic] = { available, dataPoints, quality };
  }

  return result as Record<TopicCategory, { available: boolean; dataPoints: number; quality: 'strong' | 'moderate' | 'weak' | 'missing' }>;
}

function summarizeDataForPrompt(data: AggregatedData, topics: TopicCategory[]): string {
  const sections: string[] = [];

  if (data.account) {
    sections.push(`ACCOUNT: ${data.account.name} | Industry: ${data.account.industry || 'N/A'} | Tier: ${data.account.tier || 'N/A'} | Health Score: ${data.account.healthScore ?? 'N/A'}/100 | Total Value Promised: $${data.account.totalValuePromised?.toLocaleString() || 'N/A'} | Total Value Realized: $${data.account.totalValueRealized?.toLocaleString() || 'N/A'} | Account Owner: ${data.account.accountOwner || 'N/A'} | Client Sponsor: ${data.account.clientSponsor || 'N/A'} | ACV: ${data.account.annualContractValue || 'N/A'}`);
  }

  if (data.project) {
    sections.push(`PROJECT: ${data.project.name} | Phase: ${data.project.currentPhase || 'N/A'} | Discovery Completed: ${data.project.discoveryCompleted ? 'Yes' : 'No'}`);
  }

  if (topics.includes('discovery_insights') && data.discoveryQuestions.length > 0) {
    const answered = data.discoveryQuestions.filter((q: any) => q.answer).slice(0, 10);
    const qaSummary = answered.map((q: any) => `Q: ${q.question}\nA: ${q.answer}`).join('\n');
    sections.push(`DISCOVERY INSIGHTS (${answered.length} answered questions):\n${qaSummary}`);
  }

  if (topics.includes('stakeholder_priorities')) {
    if (data.greenSheetData?.meetingContact) {
      const mc = data.greenSheetData.meetingContact;
      sections.push(`STAKEHOLDER (Green Sheet): ${mc.name} - ${mc.title} | Role: ${mc.role || 'N/A'} | Influence: ${mc.influence || 'N/A'} | Concerns: ${mc.knownConcerns || 'N/A'} | Decision Criteria: ${mc.decisionCriteria || 'N/A'}`);
    }
    if (data.blueSheet?.data) {
      const bs = data.blueSheet.data as any;
      if (bs.buyingInfluences?.length > 0) {
        sections.push(`BUYING INFLUENCES (Blue Sheet): ${bs.buyingInfluences.map((bi: any) => `${bi.name || 'Unknown'} - ${bi.role || 'N/A'}`).join('; ')}`);
      }
    }
  }

  if (topics.includes('kpi_commitments') && data.kpiCommitments.length > 0) {
    const kpiSummary = data.kpiCommitments.slice(0, 8).map((k: any) =>
      `- ${k.commitmentTitle}: ${k.outcomeStatement || k.commitmentDescription || 'N/A'} | Pillar: ${k.valuePillar || 'N/A'} | Status: ${k.healthStatus || k.status || 'N/A'} | Baseline: ${k.baselineValue || 'N/A'} | Target: ${k.targetValue || 'N/A'} | Est. Annual Value: ${k.estimatedAnnualValue || 'N/A'}`
    ).join('\n');
    sections.push(`KPI COMMITMENTS (${data.kpiCommitments.length} total):\n${kpiSummary}`);
  }

  if (topics.includes('alignment_progress')) {
    if (data.valueCases.length > 0) {
      const vcSummary = data.valueCases.slice(0, 5).map((vc: any) =>
        `- ${vc.title}: ${vc.description || 'N/A'} | Impact: ${vc.estimatedImpact || 'N/A'} | Confidence: ${vc.confidence || 'N/A'} | Priority: ${vc.priority || 'N/A'}`
      ).join('\n');
      sections.push(`VALUE CASES (${data.valueCases.length} total):\n${vcSummary}`);
    }
    if (data.headlines.length > 0) {
      const hlSummary = data.headlines.slice(0, 5).map((h: any) =>
        `- ${h.title}: ${h.value || 'N/A'} | Category: ${h.category || 'N/A'} | Priority: ${h.priority || 'N/A'}`
      ).join('\n');
      sections.push(`HEADLINES (${data.headlines.length} total):\n${hlSummary}`);
    }
  }

  if (topics.includes('evidence_pack') && data.evidencePackItems.length > 0) {
    const itemSummary = data.evidencePackItems.slice(0, 8).map((item: any) =>
      `- [${item.itemType || 'N/A'}] ${item.claim || 'N/A'} | Evidence: ${item.evidence?.substring(0, 100) || 'N/A'} | Phase: ${item.phase || 'N/A'} | Confidence: ${item.confidence || 'N/A'}`
    ).join('\n');
    sections.push(`EVIDENCE PACK (${data.evidencePackItems.length} items, Quality Score: ${data.evidencePack?.qualityScore || 'N/A'}):\n${itemSummary}`);
  }

  if (topics.includes('success_stories')) {
    const stories: string[] = [];
    if (data.successStories.length > 0) {
      const projectStories = data.successStories.slice(0, 5).map((s: any) =>
        `- [Project] ${s.title}: Category: ${s.category || 'N/A'} | Industry: ${s.industry || 'N/A'} | Capability: ${s.capabilityName || 'N/A'} | Relevance: ${s.relevanceReason || 'N/A'} | Excerpt: ${s.excerpt || 'N/A'}`
      ).join('\n');
      stories.push(projectStories);
    }
    if (data.successStoryLibrary.length > 0) {
      const libraryStories = data.successStoryLibrary.slice(0, 5).map((s: any) =>
        `- [Library] ${s.title}: Challenge: ${s.challenge || 'N/A'} | Solution: ${s.solution || 'N/A'} | Results: ${s.results || 'N/A'} | Metrics: ${s.metrics || 'N/A'} | Industry: ${s.industry || 'N/A'} | Capability: ${s.capabilityName || 'N/A'} | Timeframe: ${s.timeframeMonths ? s.timeframeMonths + ' months' : 'N/A'}`
      ).join('\n');
      stories.push(libraryStories);
    }
    const totalCount = data.successStories.length + data.successStoryLibrary.length;
    if (totalCount > 0) {
      sections.push(`SUCCESS STORIES (${totalCount} total - ${data.successStories.length} project-specific, ${data.successStoryLibrary.length} from library):\n${stories.join('\n')}`);
    }
  }

  if (topics.includes('green_sheet_objectives')) {
    if (data.greenSheetData?.callPlanner) {
      const cp = data.greenSheetData.callPlanner;
      sections.push(`GREEN SHEET OBJECTIVES: Objective: ${cp.objective || 'N/A'} | Desired Outcome: ${cp.desiredOutcome || 'N/A'} | Opening Statement: ${cp.openingStatement || 'N/A'} | Best Action Commitment: ${cp.bestActionCommitment || 'N/A'}`);
    }
    if (data.narrativeCanvas) {
      const nc = data.narrativeCanvas as any;
      sections.push(`NARRATIVE CANVAS: Opener: ${nc.opener || 'N/A'} | Key Message: ${nc.keyMessage || 'N/A'} | Proof Point: ${nc.proofPoint || 'N/A'} | Call to Action: ${nc.callToAction || 'N/A'}`);
    }
  }

  if (topics.includes('growth_accelerator') && data.growthAcceleratorCanvases.length > 0) {
    sections.push(`GROWTH ACCELERATOR CANVASES: ${data.growthAcceleratorCanvases.length} canvas(es) available`);
  }

  if (topics.includes('competitive_landscape') && data.blueSheet?.data) {
    const bs = data.blueSheet.data as any;
    if (bs.competitions?.length > 0) {
      sections.push(`COMPETITIVE LANDSCAPE: ${bs.competitions.map((c: any) => `${c.name || 'Unknown'}: ${c.strengths || 'N/A'}`).join('; ')}`);
    }
  }

  return sections.join('\n\n');
}

async function generateSlidesWithAI(
  data: AggregatedData,
  template: PresentationTemplate,
  request: PresentationRequest
): Promise<SlideContent[]> {
  const dataSummary = summarizeDataForPrompt(data, request.selectedTopics);
  const audienceContext = AUDIENCE_CONTEXT[request.audience];
  const purposeContext = PURPOSE_CONTEXT[request.purpose];

  const prompt = `You are a Korn Ferry senior presentation strategist. Generate a RICH, DATA-DENSE, VISUALLY COMPELLING slide deck in JSON format.

CONTEXT:
- Audience: ${request.audience} - ${audienceContext}
- Purpose: ${request.purpose} - ${purposeContext}
- Template Style: ${template}
- Account: ${data.account?.name || 'Unknown'}
- Custom Title: ${request.customTitle || 'auto-generate'}
- Custom Subtitle: ${request.customSubtitle || 'auto-generate'}

AVAILABLE DATA:
${dataSummary}

CRITICAL DESIGN PRINCIPLES:
1. EVERY SLIDE must contain substantial, specific content - NO generic placeholder text
2. Use REAL numbers, names, and data from the available data above
3. VARY slide types extensively - mix kpi_scorecard, chart, flow_diagram, comparison, quote, content, image_feature
4. Each kpi_scorecard slide should have 3-6 metrics with specific values and trend indicators
5. Each chart slide must have chartData with real labels and realistic data values (3-8 data points)
6. comparison slides must show specific before vs after values from the data
7. flow_diagram slides should have 3-5 clear steps with descriptions
8. Content slides should have 3-5 substantive bullet points with specific insights, not generic statements
9. Quote slides should feature client-relevant quotes or powerful value statements
10. Include bodyContent AND bulletPoints AND metrics on content slides where relevant - pack value into every slide
11. Speaker notes should be detailed talking points (2-3 sentences), not one-liners

TEMPLATE GUIDELINES:
- executive_modern: 10-12 slides. Lead with bold metrics. Use kpi_scorecard + image_feature + comparison heavily. Every slide must have either metrics or a chart.
- data_driven: 12-15 slides. Heavy use of charts, kpi_scorecards, comparison slides. Include chartData on at least 40% of slides. Each chart needs 4+ labeled data points.
- visual_narrative: 10-14 slides. Story arc with quote slides, flow_diagrams, image_features. But still include data - every narrative slide should have at least one metric or bullet point backed by data.

IMAGE CATEGORIES (assign to image_feature and section_divider slides):
- 'professional', 'teamwork', 'technology', 'leadership', 'cityscape', 'innovation'

BRAND COLORS (REQUIRED for chart colors and metric colors - assign specific colors):
- Navy: "#00173B", Forest Green: "#00634F", Ocean Blue: "#005971"
- Emerald: "#009B77" (for positive/success), Mint: "#05C690" (highlights)
- Lime: "#8DC63F" (growth), Cyan: "#00ADBB" (info), Purple: "#A3238E" (premium)

SLIDE TYPE REQUIREMENTS:
- title: Must have title, subtitle, and bodyContent with date/context
- section_divider: Must have title, subtitle, imageCategory
- content: Must have title + at least 3 bulletPoints + optional bodyContent + optional metrics
- kpi_scorecard: Must have title + 3-6 metrics each with label, value, trend ("up"/"down"/"stable"), and color
- chart: Must have title + chartData with type (bar/pie/line/doughnut), labels array, data array, colors array
- quote: Must have quoteText + quoteAuthor + optional bodyContent
- flow_diagram: Must have title + 3-5 flowSteps each with label and description
- comparison: Must have title + 3-5 comparisonItems each with label, before, after
- summary: Must have title + 3-5 bulletPoints with specific next steps + optional metrics
- image_feature: Must have title + subtitle + bodyContent + imageCategory

Return ONLY valid JSON with a "slides" array. Each slide must have: id (e.g. "slide-1"), slideType, title, topicSource, speakerNotes. Include all relevant optional fields to make slides data-rich.`;


  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a Korn Ferry presentation strategist. You create compelling, data-driven presentations that tell value stories. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 8000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.warn("[PresentationStudio] Empty AI response, falling back to structured slides");
      return generateFallbackSlides(data, template, request);
    }

    const parsed = JSON.parse(content);
    const slides: SlideContent[] = parsed.slides || [];

    if (slides.length === 0) {
      return generateFallbackSlides(data, template, request);
    }

    return slides.map((slide: any, index: number) => ({
      id: slide.id || `slide-${index + 1}`,
      slideType: slide.slideType || 'content',
      title: slide.title || 'Untitled Slide',
      subtitle: slide.subtitle,
      bodyContent: slide.bodyContent,
      bulletPoints: slide.bulletPoints,
      metrics: slide.metrics,
      chartData: slide.chartData,
      quoteText: slide.quoteText,
      quoteAuthor: slide.quoteAuthor,
      imageCategory: slide.imageCategory,
      flowSteps: slide.flowSteps,
      comparisonItems: slide.comparisonItems,
      coachingTip: slide.coachingTip,
      speakerNotes: slide.speakerNotes,
      topicSource: slide.topicSource || request.selectedTopics[0] || 'discovery_insights',
    }));
  } catch (error) {
    console.error("[PresentationStudio] AI generation failed:", error);
    return generateFallbackSlides(data, template, request);
  }
}

function generateFallbackSlides(
  data: AggregatedData,
  template: PresentationTemplate,
  request: PresentationRequest
): SlideContent[] {
  const slides: SlideContent[] = [];
  const accountName = data.account?.name || data.project?.companyName || 'Client';
  const projectName = data.project?.name || 'Engagement';

  slides.push({
    id: 'slide-title',
    slideType: 'title',
    title: request.customTitle || `${accountName} - ${formatPurpose(request.purpose)}`,
    subtitle: request.customSubtitle || projectName,
    bodyContent: `Prepared by Korn Ferry | ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    imageCategory: 'leadership',
    speakerNotes: `Welcome and introductions. Set the context for this ${formatPurpose(request.purpose)}.`,
    topicSource: request.selectedTopics[0] || 'discovery_insights',
  });

  if (data.account) {
    slides.push({
      id: 'slide-account-overview',
      slideType: 'content',
      title: 'Account Overview',
      metrics: [
        { label: 'Health Score', value: `${data.account.healthScore ?? 'N/A'}/100`, trend: (data.account.healthScore ?? 0) >= 70 ? 'up' : 'down', color: BRAND_COLORS.emerald },
        { label: 'Value Promised', value: `$${(data.account.totalValuePromised || 0).toLocaleString()}`, color: BRAND_COLORS.oceanBlue },
        { label: 'Value Realized', value: `$${(data.account.totalValueRealized || 0).toLocaleString()}`, trend: 'up', color: BRAND_COLORS.mint },
        { label: 'ACV', value: data.account.annualContractValue || 'N/A', color: BRAND_COLORS.navy },
      ],
      bulletPoints: [
        `Industry: ${data.account.industry || 'N/A'}`,
        `Tier: ${data.account.tier || 'N/A'}`,
        `Account Owner: ${data.account.accountOwner || 'N/A'}`,
        `Client Sponsor: ${data.account.clientSponsor || 'N/A'}`,
      ],
      speakerNotes: 'Provide an overview of the account relationship and current health.',
      topicSource: 'stakeholder_priorities',
    });
  }

  if (request.selectedTopics.includes('discovery_insights') && data.discoveryQuestions.length > 0) {
    const answered = data.discoveryQuestions.filter((q: any) => q.answer);
    slides.push({
      id: 'slide-discovery-divider',
      slideType: 'section_divider',
      title: 'Discovery Insights',
      subtitle: `${answered.length} key findings from our discovery process`,
      imageCategory: 'technology',
      speakerNotes: 'Transition to discovery findings.',
      topicSource: 'discovery_insights',
    });

    slides.push({
      id: 'slide-discovery-insights',
      slideType: 'content',
      title: 'Key Discovery Findings',
      bulletPoints: answered.slice(0, 6).map((q: any) =>
        `${q.question}: ${(q.answer || '').substring(0, 120)}${(q.answer || '').length > 120 ? '...' : ''}`
      ),
      coachingTip: answered.length < 3 ? 'Consider completing more discovery questions for a richer presentation.' : undefined,
      speakerNotes: 'Walk through the key findings, pausing for client reactions and validations.',
      topicSource: 'discovery_insights',
    });
  }

  if (request.selectedTopics.includes('kpi_commitments') && data.kpiCommitments.length > 0) {
    slides.push({
      id: 'slide-kpi-divider',
      slideType: 'section_divider',
      title: 'KPI Commitments',
      subtitle: `${data.kpiCommitments.length} commitments driving measurable outcomes`,
      imageCategory: 'professional',
      speakerNotes: 'Transition to KPI commitments discussion.',
      topicSource: 'kpi_commitments',
    });

    const kpiMetrics = data.kpiCommitments.slice(0, 6).map((k: any) => ({
      label: k.commitmentTitle || 'KPI',
      value: k.targetValue || k.estimatedAnnualValue || 'TBD',
      trend: k.healthStatus === 'on_track' ? 'up' as const : k.healthStatus === 'at_risk' ? 'stable' as const : 'down' as const,
      color: k.healthStatus === 'on_track' ? BRAND_COLORS.emerald : k.healthStatus === 'at_risk' ? BRAND_COLORS.lime : BRAND_COLORS.gray,
    }));

    slides.push({
      id: 'slide-kpi-scorecard',
      slideType: 'kpi_scorecard',
      title: 'KPI Performance Scorecard',
      metrics: kpiMetrics,
      speakerNotes: 'Review each KPI commitment, highlighting progress and any areas needing attention.',
      topicSource: 'kpi_commitments',
    });

    const pillars = data.kpiCommitments.reduce((acc: Record<string, number>, k: any) => {
      const pillar = k.valuePillar || 'Other';
      acc[pillar] = (acc[pillar] || 0) + 1;
      return acc;
    }, {});

    if (Object.keys(pillars).length > 1) {
      slides.push({
        id: 'slide-kpi-distribution',
        slideType: 'chart',
        title: 'KPI Distribution by Value Pillar',
        chartData: {
          type: 'doughnut',
          labels: Object.keys(pillars),
          data: Object.values(pillars),
          colors: [BRAND_COLORS.forestGreen, BRAND_COLORS.oceanBlue, BRAND_COLORS.emerald, BRAND_COLORS.purple, BRAND_COLORS.cyan],
        },
        speakerNotes: 'Show the balance of KPIs across value pillars.',
        topicSource: 'kpi_commitments',
      });
    }
  }

  if (request.selectedTopics.includes('evidence_pack') && data.evidencePackItems.length > 0) {
    slides.push({
      id: 'slide-evidence-divider',
      slideType: 'section_divider',
      title: 'Evidence of Value',
      subtitle: `${data.evidencePackItems.length} evidence items supporting our value story`,
      imageCategory: 'teamwork',
      speakerNotes: 'Transition to evidence presentation.',
      topicSource: 'evidence_pack',
    });

    const phases = data.evidencePackItems.reduce((acc: Record<string, number>, item: any) => {
      const phase = item.phase || 'unclassified';
      acc[phase] = (acc[phase] || 0) + 1;
      return acc;
    }, {});

    slides.push({
      id: 'slide-evidence-overview',
      slideType: 'chart',
      title: 'Evidence by Phase',
      chartData: {
        type: 'bar',
        labels: Object.keys(phases),
        data: Object.values(phases),
        colors: [BRAND_COLORS.forestGreen, BRAND_COLORS.oceanBlue, BRAND_COLORS.emerald],
      },
      bodyContent: `Total evidence items: ${data.evidencePackItems.length} | Quality Score: ${data.evidencePack?.qualityScore || 'N/A'}`,
      speakerNotes: 'Highlight the depth of evidence across lifecycle phases.',
      topicSource: 'evidence_pack',
    });

    const topItems = data.evidencePackItems
      .filter((item: any) => item.confidence === 'high' || item.confidence === 'medium')
      .slice(0, 4);

    if (topItems.length > 0) {
      slides.push({
        id: 'slide-evidence-highlights',
        slideType: 'content',
        title: 'Key Evidence Highlights',
        bulletPoints: topItems.map((item: any) =>
          `${item.claim || 'Evidence'}: ${(item.evidence || '').substring(0, 100)}${(item.evidence || '').length > 100 ? '...' : ''}`
        ),
        speakerNotes: 'Present the strongest evidence items with confidence.',
        topicSource: 'evidence_pack',
      });
    }
  }

  if (request.selectedTopics.includes('success_stories')) {
    const allStories: any[] = [];
    for (const s of data.successStories.slice(0, 3)) {
      allStories.push({
        id: s.id,
        title: s.title || 'Success Story',
        bullets: [
          s.category ? `Category: ${s.category}` : null,
          s.capabilityName ? `Capability: ${s.capabilityName}` : null,
          s.industry ? `Industry: ${s.industry}` : null,
          s.relevanceReason ? `Relevance: ${s.relevanceReason}` : null,
          s.excerpt ? `${s.excerpt}` : null,
        ].filter(Boolean) as string[],
      });
    }
    for (const s of data.successStoryLibrary.slice(0, 3)) {
      allStories.push({
        id: s.id,
        title: s.title || 'Success Story',
        bullets: [
          s.challenge ? `Challenge: ${s.challenge}` : null,
          s.solution ? `Solution: ${s.solution}` : null,
          s.results ? `Results: ${s.results}` : null,
          s.metrics ? `Metrics: ${s.metrics}` : null,
          s.industry ? `Industry: ${s.industry}` : null,
          s.timeframeMonths ? `Achieved in ${s.timeframeMonths} months` : null,
        ].filter(Boolean) as string[],
      });
    }
    for (const story of allStories.slice(0, 2)) {
      slides.push({
        id: `slide-story-${story.id || slides.length}`,
        slideType: 'content',
        title: story.title,
        bulletPoints: story.bullets,
        imageCategory: 'teamwork',
        speakerNotes: 'Share this success story to reinforce credibility and value delivery.',
        topicSource: 'success_stories',
      });
    }
  }

  if (request.selectedTopics.includes('alignment_progress') && data.valueCases.length > 0) {
    slides.push({
      id: 'slide-value-cases',
      slideType: 'content',
      title: 'Value Hypotheses & Alignment',
      bulletPoints: data.valueCases.slice(0, 5).map((vc: any) =>
        `${vc.title}: ${vc.description?.substring(0, 80) || 'N/A'} (Impact: ${vc.estimatedImpact || 'TBD'})`
      ),
      speakerNotes: 'Review the value hypotheses and current alignment status.',
      topicSource: 'alignment_progress',
    });
  }

  if (request.selectedTopics.includes('green_sheet_objectives') && data.greenSheetData?.callPlanner) {
    const cp = data.greenSheetData.callPlanner;
    slides.push({
      id: 'slide-objectives',
      slideType: 'flow_diagram',
      title: 'Meeting Objectives & Next Steps',
      flowSteps: [
        { label: 'Objective', description: cp.objective || 'N/A' },
        { label: 'Desired Outcome', description: cp.desiredOutcome || 'N/A' },
        { label: 'Action Commitment', description: cp.bestActionCommitment || 'N/A' },
      ],
      speakerNotes: 'Align on objectives and desired outcomes for this engagement.',
      topicSource: 'green_sheet_objectives',
    });
  }

  if (request.selectedTopics.includes('competitive_landscape') && data.blueSheet?.data) {
    const bs = data.blueSheet.data as any;
    if (bs.competitions?.length > 0) {
      slides.push({
        id: 'slide-competitive',
        slideType: 'comparison',
        title: 'Competitive Landscape',
        comparisonItems: bs.competitions.slice(0, 4).map((c: any) => ({
          label: c.name || 'Competitor',
          before: c.strengths || 'N/A',
          after: c.weaknesses || 'N/A',
        })),
        speakerNotes: 'Position Korn Ferry against key competitors.',
        topicSource: 'competitive_landscape',
      });
    }
  }

  slides.push({
    id: 'slide-summary',
    slideType: 'summary',
    title: 'Summary & Next Steps',
    bulletPoints: [
      `Continue strengthening the ${accountName} partnership`,
      'Align on priority actions for the coming quarter',
      'Schedule follow-up reviews to track progress',
    ],
    imageCategory: 'cityscape',
    speakerNotes: 'Summarize key takeaways and confirm next steps with clear owners and timelines.',
    coachingTip: 'End with a clear call to action. What do you want the audience to do after this presentation?',
    topicSource: request.selectedTopics[request.selectedTopics.length - 1] || 'discovery_insights',
  });

  return slides;
}

function formatPurpose(purpose: PresentationPurpose): string {
  const labels: Record<PresentationPurpose, string> = {
    customer_engagement: 'Customer Engagement',
    qbr: 'Quarterly Business Review',
    executive_pitch: 'Executive Pitch',
    discovery_readout: 'Discovery Readout',
    handoff_brief: 'Handoff Brief',
    evidence_review: 'Evidence Review',
    value_story: 'Value Story',
  };
  return labels[purpose] || purpose;
}

export function generateCoaching(
  request: PresentationRequest,
  aggregatedData: AggregatedData,
  slides: SlideContent[]
): CoachingRecommendation[] {
  const coaching: CoachingRecommendation[] = [];

  if (aggregatedData.kpiCommitments.length > 0) {
    const withoutBaselines = aggregatedData.kpiCommitments.filter((k: any) => !k.baselineValue);
    if (withoutBaselines.length > 0) {
      coaching.push({
        type: 'gap',
        priority: 'high',
        title: 'Missing KPI Baselines',
        description: `${withoutBaselines.length} KPI commitment(s) are missing baseline values.`,
        actionableAdvice: 'Add baseline values to these KPIs before presenting to strengthen credibility. Baselines provide the "before" in your value story.',
        relatedTopic: 'kpi_commitments',
      });
    }

    const withoutTargets = aggregatedData.kpiCommitments.filter((k: any) => !k.targetValue);
    if (withoutTargets.length > 0) {
      coaching.push({
        type: 'gap',
        priority: 'high',
        title: 'Missing KPI Targets',
        description: `${withoutTargets.length} KPI commitment(s) are missing target values.`,
        actionableAdvice: 'Set clear, measurable targets for each KPI. Use industry benchmarks to set realistic but ambitious goals.',
        relatedTopic: 'kpi_commitments',
      });
    }

    const onTrack = aggregatedData.kpiCommitments.filter((k: any) => k.healthStatus === 'on_track');
    if (onTrack.length > aggregatedData.kpiCommitments.length / 2) {
      coaching.push({
        type: 'strength',
        priority: 'medium',
        title: 'Strong KPI Performance',
        description: `${onTrack.length} of ${aggregatedData.kpiCommitments.length} KPIs are on track.`,
        actionableAdvice: 'Lead with these wins. Position them prominently in the first third of your presentation.',
        relatedTopic: 'kpi_commitments',
      });
    }
  } else if (request.selectedTopics.includes('kpi_commitments')) {
    coaching.push({
      type: 'gap',
      priority: 'high',
      title: 'No KPI Commitments Found',
      description: 'No KPI commitments have been created for this project yet.',
      actionableAdvice: 'Create KPI commitments before building the presentation. Without measurable commitments, the value story lacks credibility.',
      relatedTopic: 'kpi_commitments',
    });
  }

  if (aggregatedData.evidencePackItems.length >= 10) {
    coaching.push({
      type: 'strength',
      priority: 'medium',
      title: 'Comprehensive Evidence Pack',
      description: `Strong evidence pack with ${aggregatedData.evidencePackItems.length} items - this will make a compelling case.`,
      actionableAdvice: 'Select the 3-5 strongest items for the main presentation. Keep the full pack as a backup appendix.',
      relatedTopic: 'evidence_pack',
    });
  } else if (request.selectedTopics.includes('evidence_pack') && aggregatedData.evidencePackItems.length === 0) {
    coaching.push({
      type: 'gap',
      priority: 'high',
      title: 'No Evidence Items',
      description: 'The evidence pack is empty. Without evidence, the value story lacks proof points.',
      actionableAdvice: 'Add at least 3-5 evidence items covering leading, mid-loop, and lagging indicators before the presentation.',
      relatedTopic: 'evidence_pack',
    });
  } else if (request.selectedTopics.includes('evidence_pack') && aggregatedData.evidencePackItems.length < 5) {
    coaching.push({
      type: 'gap',
      priority: 'medium',
      title: 'Limited Evidence',
      description: `Only ${aggregatedData.evidencePackItems.length} evidence items available. Consider adding more proof points.`,
      actionableAdvice: 'Aim for at least 5 evidence items across different phases (leading, mid-loop, lagging) for a balanced presentation.',
      relatedTopic: 'evidence_pack',
    });
  }

  if (request.selectedTopics.includes('discovery_insights')) {
    const answeredQuestions = aggregatedData.discoveryQuestions.filter((q: any) => q.answer);
    if (answeredQuestions.length === 0) {
      coaching.push({
        type: 'gap',
        priority: 'medium',
        title: 'Incomplete Discovery',
        description: 'No discovery questions have been answered yet.',
        actionableAdvice: 'Complete the discovery process before presenting insights. Unanswered questions suggest gaps in understanding.',
        relatedTopic: 'discovery_insights',
      });
    } else if (answeredQuestions.length >= 8) {
      coaching.push({
        type: 'strength',
        priority: 'low',
        title: 'Thorough Discovery',
        description: `${answeredQuestions.length} discovery questions answered - demonstrates deep understanding.`,
        actionableAdvice: 'Highlight the depth of your discovery process. Clients appreciate the thoroughness.',
        relatedTopic: 'discovery_insights',
      });
    }
  }

  if (request.selectedTopics.includes('success_stories')) {
    const totalStories = aggregatedData.successStories.length + aggregatedData.successStoryLibrary.length;
    if (totalStories === 0) {
      coaching.push({
        type: 'gap',
        priority: 'medium',
        title: 'No Success Stories',
        description: 'No success stories are available for this project or in the global library.',
        actionableAdvice: 'Add success stories from similar engagements. Even early-stage wins can be powerful proof points.',
        relatedTopic: 'success_stories',
      });
    } else {
      coaching.push({
        type: 'strength',
        priority: 'low',
        title: 'Success Stories Available',
        description: `${totalStories} success story(ies) ready to showcase (${aggregatedData.successStories.length} project-specific, ${aggregatedData.successStoryLibrary.length} from library).`,
        actionableAdvice: 'Use success stories to create emotional connection. Place them after data-heavy sections to re-engage the audience.',
        relatedTopic: 'success_stories',
      });
    }
  }

  if (request.audience === 'c_suite' || request.audience === 'board') {
    coaching.push({
      type: 'narrative_flow',
      priority: 'high',
      title: 'Executive Audience Tip',
      description: 'C-Suite and Board audiences have limited attention spans.',
      actionableAdvice: 'Keep the deck under 12 slides. Lead with the "so what" - business impact first, methodology second. Use the 10-20-30 rule: 10 slides, 20 minutes, 30pt minimum font.',
    });
  }

  if (request.audience === 'buying_committee') {
    coaching.push({
      type: 'narrative_flow',
      priority: 'high',
      title: 'Buying Committee Strategy',
      description: 'Buying committees have diverse stakeholders with different priorities.',
      actionableAdvice: 'Include something for each buying influence: Economic Buyer (ROI), User Buyer (ease of use), Technical Buyer (implementation details), Coach (internal advocacy talking points).',
    });
  }

  if (slides.length > 15) {
    coaching.push({
      type: 'suggestion',
      priority: 'medium',
      title: 'Deck Length Warning',
      description: `The presentation has ${slides.length} slides, which may be too long for your audience.`,
      actionableAdvice: 'Consider reducing to 10-15 slides for maximum impact. Move supporting detail to an appendix.',
    });
  }

  const templateTips: Record<PresentationTemplate, CoachingRecommendation> = {
    executive_modern: {
      type: 'template_tip',
      priority: 'low',
      title: 'Executive Modern Template Tips',
      description: 'This template emphasizes clean design and powerful statements.',
      actionableAdvice: 'Use large numbers and bold statements. Each slide should have one key message. Limit bullet points to 3 per slide. Use the image_feature slides to break up data-heavy content.',
    },
    data_driven: {
      type: 'template_tip',
      priority: 'low',
      title: 'Data-Driven Template Tips',
      description: 'This template is designed for detailed analysis and metrics.',
      actionableAdvice: 'Ensure all charts have clear labels and takeaways. Use the KPI scorecard to create a dashboard feel. Include trend indicators to show direction of progress.',
    },
    visual_narrative: {
      type: 'template_tip',
      priority: 'low',
      title: 'Visual Narrative Template Tips',
      description: 'This template tells a story through visuals and narrative flow.',
      actionableAdvice: 'Open with a compelling challenge statement. Build tension through the middle slides. Resolve with evidence and impact. Use quote slides to feature client voices.',
    },
  };

  const selectedTemplate = request.templateOverride || selectTemplate(request.purpose, request.audience, request.selectedTopics);
  coaching.push(templateTips[selectedTemplate]);

  return coaching;
}

export async function generatePresentationPlan(
  request: PresentationRequest
): Promise<PresentationPlan> {
  const aggregatedData = await aggregatePresentationData(
    request.accountId,
    request.projectId,
    request.selectedTopics
  );

  const template = request.templateOverride || selectTemplate(
    request.purpose,
    request.audience,
    request.selectedTopics
  );

  const templateRationales: Record<PresentationTemplate, string> = {
    executive_modern: 'Selected for executive-level communication. Clean design with high-impact metrics and strategic narratives.',
    data_driven: 'Selected for data-intensive review. Optimized for charts, scorecards, and detailed analysis.',
    visual_narrative: 'Selected for story-driven engagement. Combines visuals, quotes, and narrative flow for maximum impact.',
  };

  const dataCompleteness = assessDataCompleteness(aggregatedData, request.selectedTopics);

  const slides = await generateSlidesWithAI(aggregatedData, template, request);

  const coaching = generateCoaching(request, aggregatedData, slides);

  const estimatedMinutes = Math.max(5, Math.min(45, slides.length * 2));
  const estimatedDuration = estimatedMinutes <= 10
    ? `${estimatedMinutes} minutes`
    : `${estimatedMinutes}-${estimatedMinutes + 5} minutes`;

  const purposeFlows: Record<PresentationPurpose, string> = {
    customer_engagement: 'Context → Discovery Insights → Value Opportunity → Proposed Approach → Next Steps',
    qbr: 'Relationship Health → KPI Progress → Evidence of Value → Risks & Mitigations → Next Quarter Priorities',
    executive_pitch: 'Strategic Challenge → Our Approach → Expected Outcomes → Investment Case → Call to Action',
    discovery_readout: 'Research Summary → Key Findings → Stakeholder Landscape → Opportunities → Recommended Focus Areas',
    handoff_brief: 'Engagement Overview → Client Expectations → KPI Commitments → Stakeholder Map → Risks & Success Criteria',
    evidence_review: 'Evidence Framework → Leading Indicators → Mid-Loop Progress → Lagging Outcomes → Value Delivered',
    value_story: 'The Challenge → Our Partnership → The Transformation → Measurable Impact → Future Vision',
  };

  return {
    recommendedTemplate: template,
    templateRationale: request.templateOverride
      ? `Template overridden to ${request.templateOverride}. ${templateRationales[request.templateOverride]}`
      : templateRationales[template],
    slides,
    coaching,
    dataCompleteness,
    narrativeFlow: purposeFlows[request.purpose],
    estimatedDuration,
  };
}
