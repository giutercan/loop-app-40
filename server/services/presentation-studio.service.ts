import { storage } from "../storage";
import { openai } from "../ai";
import type { SavedPresentation } from "@shared/schema";

const savedPresentations: SavedPresentation[] = [];
let nextPresentationId = 1;

export function savePresentation(presentation: Omit<SavedPresentation, 'id' | 'createdAt'>): SavedPresentation {
  const saved: SavedPresentation = {
    ...presentation,
    id: `pres-${nextPresentationId++}`,
    createdAt: new Date().toISOString(),
  };
  savedPresentations.unshift(saved);
  return saved;
}

export function getSavedPresentations(accountId?: number, projectId?: number): SavedPresentation[] {
  let results = [...savedPresentations];
  if (accountId) results = results.filter(p => p.accountId === accountId);
  if (projectId) results = results.filter(p => p.projectId === projectId);
  return results;
}

export function getSavedPresentation(id: string): SavedPresentation | undefined {
  return savedPresentations.find(p => p.id === id);
}

export function deleteSavedPresentation(id: string): boolean {
  const idx = savedPresentations.findIndex(p => p.id === id);
  if (idx === -1) return false;
  savedPresentations.splice(idx, 1);
  return true;
}

export type PresentationPurpose = 'customer_engagement' | 'qbr' | 'executive_pitch' | 'discovery_readout' | 'handoff_brief' | 'evidence_review' | 'value_story';

export type PresentationAudience = 'c_suite' | 'client_sponsor' | 'delivery_team' | 'board' | 'internal_review' | 'buying_committee';

export type PresentationTemplate = 'executive_modern' | 'data_driven' | 'visual_narrative';

export type TopicCategory = 'discovery_insights' | 'stakeholder_priorities' | 'kpi_commitments' | 'alignment_progress' | 'value_realization' | 'evidence_pack' | 'success_stories' | 'green_sheet_objectives' | 'growth_accelerator' | 'competitive_landscape';

export interface AudiencePriority {
  id: string;
  title: string;
  description: string;
  recommendation: string;
  rationale: string;
  impact: 'high' | 'medium' | 'low';
  dataSupport: 'strong' | 'moderate' | 'weak';
  relatedTopics: TopicCategory[];
}

export interface AudiencePriorityAdvice {
  top3: AudiencePriority[];
  alternatives: AudiencePriority[];
  audienceInsight: string;
  winningStrategy: string;
}

export interface PresentationRequest {
  accountId: number;
  projectId: number;
  purpose: PresentationPurpose;
  audience: PresentationAudience;
  selectedTopics: TopicCategory[];
  templateOverride?: PresentationTemplate;
  customTitle?: string;
  customSubtitle?: string;
  userBrief?: string;
  additionalMaterials?: string;
  gapAnswers?: Array<{ question: string; answer: string }>;
  audiencePriorities?: AudiencePriority[];
  brandTemplate?: {
    name: string;
    colors: Record<string, string>;
    fonts: { major: string; minor: string };
    layouts: Array<{ name: string; type: string }>;
  };
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

export interface ProjectContextSummary {
  projectName: string;
  companyName: string;
  accountName: string;
  phase: string;
  sector: string;
  discoveryCompleted: boolean;
  availableData: {
    discoveryInsights: { count: number; sample: string[] };
    kpis: { count: number; sample: string[] };
    valueCases: { count: number; sample: string[] };
    evidencePack: { count: number; quality: string };
    successStories: { count: number; sample: string[] };
    greenSheet: { available: boolean; objective: string };
    narrativeCanvas: { available: boolean; keyMessage: string };
    storyBuilder: { available: boolean; hook: string };
    growthAccelerator: { count: number };
    competitiveLandscape: { available: boolean };
  };
  totalDataPoints: number;
}

export interface RecommendedStory {
  id: number | string;
  title: string;
  industry: string;
  capability: string;
  challenge: string;
  results: string;
  relevanceReason: string;
  sourceUrl?: string;
  sourceType?: 'project' | 'library' | 'kf_client_story';
  company?: string;
  imageUrl?: string;
}

export interface KFClientStory {
  id: string;
  title: string;
  company: string;
  description: string;
  industry: string;
  capabilities: string[];
  themes: string[];
  url: string;
  imageUrl: string;
  date: string;
}

export const KF_CLIENT_STORIES: KFClientStory[] = [
  {
    id: 'kf-blue-sheet',
    title: 'How Korn Ferry\'s Iconic Blue Sheet Drives Win Rates and Revenue Predictability',
    company: 'Korn Ferry (Internal)',
    description: 'Discover how Korn Ferry\'s Blue Sheet has evolved from a paper-based sales tool into a modern, AI-enabled framework embedded in Korn Ferry Sell.',
    industry: 'Professional Services',
    capabilities: ['Sales Transformation', 'AI/Technology', 'Revenue Growth'],
    themes: ['sales_methodology', 'digital_transformation', 'revenue_predictability', 'win_rates'],
    url: 'https://www.kornferry.com/insights/featured-topics/sales-transformation/the-blue-sheet-history-and-evolution-of-an-industry-icon',
    imageUrl: 'https://www.kornferry.com/content/dam/kornferry-v2/featured-topics/sales/BlueSheet_375x300.jpg',
    date: '2025-09-02',
  },
  {
    id: 'kf-allianz-engagement',
    title: 'Employee Engagement Success for a Global Insurance Leader',
    company: 'Allianz',
    description: 'Using our Korn Ferry Listen technology and consulting expertise, we helped the world\'s largest insurance company enhance team performance.',
    industry: 'Insurance / Financial Services',
    capabilities: ['Employee Engagement', 'Listening & Surveys', 'Team Performance'],
    themes: ['employee_engagement', 'team_performance', 'culture', 'listening_technology'],
    url: 'https://www.kornferry.com/insights/featured-topics/employee-experience/employee-engagement-success-for-a-global-insurance-leader',
    imageUrl: 'https://www.kornferry.com/content/dam/kornferry-v2/featured-topics/employee-experience/allianz-375x300.jpg',
    date: '2025-08-18',
  },
  {
    id: 'kf-western-union-interim',
    title: 'How Interim Solutions Supported a Global Financial Leader',
    company: 'Western Union',
    description: 'Our interim talent solutions helped a leading global financial services firm expand its digital banking platform by recruiting specialized technology experts.',
    industry: 'Financial Services',
    capabilities: ['Interim Solutions', 'Digital Transformation', 'Technology Talent'],
    themes: ['interim_talent', 'digital_banking', 'technology_recruitment', 'specialized_talent'],
    url: 'https://www.kornferry.com/insights/featured-topics/employee-experience/how-interim-solutions-supported-a-global-financial-leader',
    imageUrl: 'https://www.kornferry.com/content/dam/kornferry-v2/featured-topics/employee-experience/western-union-375x300.jpg',
    date: '2025-08-18',
  },
  {
    id: 'kf-brenntag-sales',
    title: 'Winning Sales Chemistry with a Global Industry Leader',
    company: 'Brenntag',
    description: 'How we helped a global leader in chemical and ingredients distribution implement consistent sales processes and drive success.',
    industry: 'Chemicals / Distribution',
    capabilities: ['Sales Transformation', 'Process Consistency', 'Sales Culture'],
    themes: ['sales_process', 'sales_culture', 'global_consistency', 'distribution'],
    url: 'https://www.kornferry.com/insights/featured-topics/sales-transformation/winning-sales-chemistry-with-a-global-industry-leader',
    imageUrl: 'https://www.kornferry.com/content/dam/kornferry-v2/featured-topics/sales/Brenntag-375x300.jpg',
    date: '2025-08-14',
  },
  {
    id: 'kf-massport-workforce',
    title: 'A High-Flying Partnership to Build a Resilient Workforce',
    company: 'Massport',
    description: 'How we helped a prominent state port authority in North America transform its talent and enhance its customer experience.',
    industry: 'Government / Transportation',
    capabilities: ['Workforce Transformation', 'Talent Strategy', 'Customer Experience'],
    themes: ['workforce_resilience', 'talent_transformation', 'customer_experience', 'public_sector'],
    url: 'https://www.kornferry.com/insights/featured-topics/organizational-transformation/a-high-flying-partnership-to-build-a-resilient-workforce',
    imageUrl: 'https://www.kornferry.com/content/dam/kornferry-v2/featured-topics/organizational-transformation/massport-375x300.jpg',
    date: '2025-08-14',
  },
  {
    id: 'kf-lamb-weston-sales',
    title: 'Delivering a Recipe for Sales Success to a Global Food Supplier',
    company: 'Lamb Weston',
    description: 'How we helped a leading global supplier of frozen food products for restaurants and retailers develop a winning strategy for sales transformation.',
    industry: 'Food & Beverage / CPG',
    capabilities: ['Sales Transformation', 'Sales Strategy', 'Growth'],
    themes: ['sales_strategy', 'food_industry', 'global_growth', 'sales_transformation'],
    url: 'https://www.kornferry.com/insights/featured-topics/sales-transformation/delivering-a-recipe-for-sales-success-to-a-global-food-supplier',
    imageUrl: 'https://www.kornferry.com/content/dam/kornferry-v2/featured-topics/sales/lamb-weston-375x300.jpg',
    date: '2025-08-14',
  },
  {
    id: 'kf-asml-talent',
    title: 'Nurturing Talent Success for a Global Semiconductor Leader',
    company: 'ASML',
    description: 'How we enabled a strong talent management structure for a leading global supplier to the semiconductor industry.',
    industry: 'Technology / Semiconductor',
    capabilities: ['Talent Management', 'Organizational Structure', 'Workforce Planning'],
    themes: ['talent_management', 'semiconductor', 'organizational_structure', 'high_tech'],
    url: 'https://www.kornferry.com/insights/featured-topics/workforce-management/nuturing-talent-success-for-a-global-semiconductor-leader',
    imageUrl: 'https://www.kornferry.com/content/dam/kornferry-v2/featured-topics/workforce-management/asml-375x300.jpg',
    date: '2025-08-14',
  },
  {
    id: 'kf-natwest-assess',
    title: 'Investing in Korn Ferry Assess for Talent Management Solutions',
    company: 'NatWest',
    description: 'How we used Korn Ferry Assess products to advance the talent strategy for a UK-based financial institution.',
    industry: 'Banking / Financial Services',
    capabilities: ['Assessment', 'Talent Strategy', 'Leadership Development'],
    themes: ['assessment', 'talent_strategy', 'banking', 'leadership_pipeline'],
    url: 'https://www.kornferry.com/insights/featured-topics/workforce-management/investing-in-korn-ferry-assess-for-talent-management-solutions',
    imageUrl: 'https://www.kornferry.com/content/dam/kornferry-v2/featured-topics/workforce-management/Natwest-375x300.jpg',
    date: '2025-08-07',
  },
  {
    id: 'kf-state-farm-assess',
    title: 'Ensuring Strong Leadership Talent through Korn Ferry Assess',
    company: 'State Farm',
    description: 'How we helped a global mutual insurance company develop its leadership pipeline and improve upon its talent development strategies.',
    industry: 'Insurance',
    capabilities: ['Assessment', 'Leadership Development', 'Talent Pipeline'],
    themes: ['leadership_pipeline', 'talent_development', 'insurance', 'assessment'],
    url: 'https://www.kornferry.com/insights/featured-topics/workforce-management/ensuring-strong-leadership-talent-through-korn-ferry-assess',
    imageUrl: 'https://www.kornferry.com/content/dam/kornferry-v2/featured-topics/workforce-management/state-farm-375x300.jpg',
    date: '2025-08-07',
  },
  {
    id: 'kf-imi-sales',
    title: 'Engineering a Win for Sales',
    company: 'IMI',
    description: 'How we helped a global engineering company improve its sales processes and build a culture of success through Korn Ferry Sell.',
    industry: 'Engineering / Manufacturing',
    capabilities: ['Sales Transformation', 'Sales Culture', 'KF Sell'],
    themes: ['sales_culture', 'engineering', 'sales_process', 'kf_sell'],
    url: 'https://www.kornferry.com/insights/featured-topics/sales-transformation/engineering-a-win-for-sales',
    imageUrl: 'https://www.kornferry.com/content/dam/kornferry-v2/featured-topics/sales/imi-375x300.jpg',
    date: '2025-08-07',
  },
  {
    id: 'kf-clariant-talent',
    title: 'Korn Ferry Boosts Talent Strategy for Chemicals Company',
    company: 'Clariant',
    description: 'How we partnered with a Switzerland-based specialty chemicals company to upgrade its job structure and improve workforce planning.',
    industry: 'Chemicals',
    capabilities: ['Job Architecture', 'Workforce Planning', 'Talent Strategy'],
    themes: ['job_architecture', 'workforce_planning', 'chemicals', 'organizational_design'],
    url: 'https://www.kornferry.com/insights/featured-topics/organizational-transformation/korn-ferry-digital-boosts-talent-strategy-for-chemicals-company',
    imageUrl: 'https://www.kornferry.com/content/dam/kornferry-v2/featured-topics/organizational-transformation/clariant-300x375.jpg',
    date: '2025-08-07',
  },
  {
    id: 'kf-telstra-cx',
    title: 'Improving Customer Satisfaction at Leading Telecommunications Company',
    company: 'Telstra',
    description: 'How we partnered with a leading telecommunications provider in Australia to provide comprehensive customer service training and improve NPS scores.',
    industry: 'Telecommunications',
    capabilities: ['Customer Experience', 'Training & Development', 'NPS Improvement'],
    themes: ['customer_satisfaction', 'nps', 'training', 'telecommunications', 'customer_service'],
    url: 'https://www.kornferry.com/insights/featured-topics/organizational-transformation/improving-customer-satisfaction-at-leading-telecommunications-company',
    imageUrl: 'https://www.kornferry.com/content/dam/kornferry-v2/featured-topics/organizational-transformation/telstra-375x300.jpg',
    date: '2025-07-31',
  },
  {
    id: 'kf-tropicana-talent',
    title: 'Juicing Up Talent at a Multi-Billion Dollar Beverage Company',
    company: 'Tropicana',
    description: 'How we strengthened internal processes, placed critical roles, and optimized operations for a large beverage company.',
    industry: 'Food & Beverage / CPG',
    capabilities: ['Talent Acquisition', 'Process Optimization', 'Executive Placement'],
    themes: ['talent_acquisition', 'operations', 'executive_placement', 'beverage'],
    url: 'https://www.kornferry.com/insights/featured-topics/talent-recruitment/juicing-up-talent-at-a-multi-billion-dollar-beverage-company',
    imageUrl: 'https://www.kornferry.com/content/dam/kornferry-v2/featured-topics/talent-recruitment/tropicana-375x300.jpg',
    date: '2025-07-31',
  },
  {
    id: 'kf-goodyear-ld',
    title: 'A Major Tire Company Rolls with Korn Ferry',
    company: 'Goodyear',
    description: 'How we helped a major North American tire company develop and integrate a global learning and development framework.',
    industry: 'Manufacturing / Automotive',
    capabilities: ['Learning & Development', 'Global Framework', 'Organizational Transformation'],
    themes: ['learning_development', 'global_framework', 'manufacturing', 'capability_building'],
    url: 'https://www.kornferry.com/insights/featured-topics/organizational-transformation/a-major-tire-company-rolls-with-korn-ferry',
    imageUrl: 'https://www.kornferry.com/content/dam/kornferry-v2/featured-topics/organizational-transformation/goodyear-375x300.jpg',
    date: '2025-07-31',
  },
  {
    id: 'kf-sabesp-transformation',
    title: 'Driving Transformation With a Large Sanitation Company',
    company: 'Sabesp',
    description: 'How we partnered with a leading sanitation company in Latin America to strengthen leaders and improve internal alignment.',
    industry: 'Utilities / Public Sector',
    capabilities: ['Leadership Development', 'Organizational Alignment', 'Transformation'],
    themes: ['leadership', 'organizational_alignment', 'transformation', 'latin_america', 'utilities'],
    url: 'https://www.kornferry.com/insights/featured-topics/organizational-transformation/driving-transformation-with-a-large-sanitation-company',
    imageUrl: 'https://www.kornferry.com/content/dam/kornferry-v2/featured-topics/organizational-transformation/Sabesp-375x300.jpg',
    date: '2025-07-31',
  },
  {
    id: 'kf-biopharma-rpo',
    title: 'The Right Prescription: Building a Global RPO Partnership',
    company: 'Global Biopharmaceutical Company',
    description: 'How we partnered with a global biopharmaceutical company to implement a complete recruitment solution and improve talent acquisition processes.',
    industry: 'Pharmaceuticals / Life Sciences',
    capabilities: ['RPO', 'Talent Acquisition', 'Recruitment Transformation'],
    themes: ['rpo', 'recruitment', 'pharma', 'global_talent', 'talent_acquisition'],
    url: 'https://www.kornferry.com/insights/featured-topics/talent-recruitment/building-a-global-rpo-partnership',
    imageUrl: 'https://www.kornferry.com/content/dam/kornferry-v2/featured-topics/talent-recruitment/Labs-375x300.jpg',
    date: '2025-07-23',
  },
  {
    id: 'kf-ai-manufacturing-talent',
    title: 'Providing Talent Management Solutions at the Speed of AI',
    company: 'AI-Driven Manufacturing Hub',
    description: 'How we partnered with a leading AI-driven manufacturing and supply chain hub in Europe to redefine its talent strategy and digitize its HR processes.',
    industry: 'Manufacturing / Technology',
    capabilities: ['Talent Strategy', 'HR Digitization', 'AI Integration'],
    themes: ['ai', 'hr_digitization', 'talent_strategy', 'manufacturing', 'supply_chain'],
    url: 'https://www.kornferry.com/insights/featured-topics/workforce-management/providing-talent-management-solutions-at-the-speed-of-ai',
    imageUrl: 'https://www.kornferry.com/content/dam/kornferry-v2/featured-topics/workforce-management/Providing-Talent-Management-Solutions-375x300.jpg',
    date: '2025-07-22',
  },
  {
    id: 'kf-financial-infra-sell',
    title: 'How KF Sell Helped a Global Financial Market Leader to Thrive',
    company: 'Global Financial Market Infrastructure Provider',
    description: 'How we partnered with a global financial market infrastructure provider to transform its sales organization and drive strategic, sustainable growth.',
    industry: 'Financial Services',
    capabilities: ['Sales Transformation', 'KF Sell', 'Strategic Growth'],
    themes: ['sales_transformation', 'financial_markets', 'sustainable_growth', 'kf_sell'],
    url: 'https://www.kornferry.com/insights/featured-topics/sales-transformation/how-korn-ferry-sell-helped-a-global-financial-market-leader-to-thrive',
    imageUrl: 'https://www.kornferry.com/content/dam/kornferry-v2/featured-topics/sales/KF-Sell-Financial-leader-375x300.jpg',
    date: '2025-07-22',
  },
  {
    id: 'kf-beauty-engagement',
    title: 'Global Beauty Leader Transforms Employee Experience',
    company: 'Global Beauty Leader',
    description: 'We partnered with a global leader in the beauty industry to measure employee engagement and align it with the company culture.',
    industry: 'Consumer Goods / Beauty',
    capabilities: ['Employee Engagement', 'Culture Alignment', 'Employee Experience'],
    themes: ['employee_engagement', 'culture', 'beauty_industry', 'employee_experience'],
    url: 'https://www.kornferry.com/insights/featured-topics/employee-experience/global-beauty-leader-transforms-employee-experience',
    imageUrl: 'https://www.kornferry.com/content/dam/kornferry-v2/featured-topics/employee-experience/Transform-Employee-Experience-375x300.jpg',
    date: '2025-07-21',
  },
  {
    id: 'kf-maersk-talent',
    title: 'A Talent Management Strategy to Move the World',
    company: 'Maersk',
    description: 'Learn how Maersk\'s new human-centric talent management strategy is transforming the organization and opening up new business horizons.',
    industry: 'Logistics / Transportation',
    capabilities: ['Talent Management', 'Organizational Transformation', 'Strategy'],
    themes: ['talent_management', 'human_centric', 'logistics', 'organizational_transformation'],
    url: 'https://www.kornferry.com/insights/featured-topics/organizational-transformation/a-talent-management-strategy-to-move-the-world',
    imageUrl: 'https://www.kornferry.com/content/dam/kornferry-v2/featured-topics/business-impact/maersk-client-story-375x300.jpg',
    date: '2023-12-15',
  },
];

export function extractCapabilitiesFromProject(data: AggregatedData): string[] {
  const caps: string[] = [];
  if (data.kpis?.length) caps.push('KPI Management', 'Performance Measurement');
  if (data.valueCases?.length) caps.push('Value Realization');
  if (data.discoveryQuestions?.length) caps.push('Discovery', 'Consulting');
  if (data.successStories?.length || data.successStoryLibrary?.length) caps.push('Success Stories');
  if (data.evidencePack) caps.push('Evidence-Based Consulting');
  if (data.storyBuilderData) caps.push('Storytelling');
  if (data.growthAccelerator?.length) caps.push('Sales Transformation', 'Growth Strategy');
  const account = data.account as any;
  if (account?.solutionPattern) {
    const patterns: Record<string, string[]> = {
      talent_acquisition: ['Talent Acquisition', 'RPO', 'Recruitment'],
      leadership_development: ['Leadership Development', 'Assessment', 'Coaching'],
      organizational_transformation: ['Organizational Transformation', 'Change Management'],
      sales_effectiveness: ['Sales Transformation', 'Sales Culture', 'Revenue Growth'],
      total_rewards: ['Total Rewards', 'Compensation', 'Benefits'],
      workforce_transformation: ['Workforce Transformation', 'Workforce Planning'],
      dei: ['DEI', 'Diversity', 'Inclusion'],
    };
    const patternCaps = patterns[account.solutionPattern];
    if (patternCaps) caps.push(...patternCaps);
  }
  return [...new Set(caps)];
}

export function extractThemesFromProject(data: AggregatedData): string[] {
  const themes: string[] = [];
  if (data.kpis?.length) themes.push('performance_measurement', 'kpi_tracking');
  if (data.valueCases?.length) themes.push('value_realization', 'roi');
  if (data.discoveryQuestions?.length) themes.push('discovery', 'client_insights');
  if (data.growthAccelerator?.length) themes.push('sales_transformation', 'growth');
  if (data.storyBuilderData) themes.push('storytelling', 'narrative');
  if (data.evidencePack) themes.push('evidence', 'proof_points');
  const account = data.account as any;
  if (account?.industry) {
    const ind = account.industry.toLowerCase();
    if (ind.includes('financial') || ind.includes('bank') || ind.includes('insurance')) themes.push('financial_services', 'banking');
    if (ind.includes('tech') || ind.includes('software') || ind.includes('semiconductor')) themes.push('technology', 'digital_transformation');
    if (ind.includes('manufact') || ind.includes('engineer')) themes.push('manufacturing', 'engineering');
    if (ind.includes('pharma') || ind.includes('health') || ind.includes('life sci')) themes.push('pharma', 'healthcare');
    if (ind.includes('food') || ind.includes('beverage') || ind.includes('consumer')) themes.push('food_industry', 'consumer_goods');
    if (ind.includes('energy') || ind.includes('util')) themes.push('energy', 'utilities');
    if (ind.includes('telecom')) themes.push('telecommunications');
    if (ind.includes('transport') || ind.includes('logist')) themes.push('logistics', 'transportation');
  }
  return [...new Set(themes)];
}

export function getRelevantKFStories(industry?: string, capabilities?: string[], themes?: string[]): KFClientStory[] {
  let scored = KF_CLIENT_STORIES.map(story => {
    let score = 0;
    if (industry) {
      const ind = industry.toLowerCase();
      if (story.industry.toLowerCase().includes(ind) || ind.includes(story.industry.toLowerCase().split('/')[0].trim())) score += 10;
      const indWords = ind.split(/[\s\/,]+/);
      const storyIndWords = story.industry.toLowerCase().split(/[\s\/,]+/);
      for (const w of indWords) {
        if (w.length > 3 && storyIndWords.some(sw => sw.includes(w) || w.includes(sw))) score += 3;
      }
    }
    if (capabilities?.length) {
      for (const cap of capabilities) {
        const capLower = cap.toLowerCase();
        for (const sc of story.capabilities) {
          if (sc.toLowerCase().includes(capLower) || capLower.includes(sc.toLowerCase())) score += 5;
        }
      }
    }
    if (themes?.length) {
      for (const theme of themes) {
        if (story.themes.includes(theme)) score += 4;
        const themeWords = theme.toLowerCase().split(/[_\s]+/);
        for (const tw of themeWords) {
          if (tw.length > 3 && story.themes.some(st => st.includes(tw))) score += 1;
        }
      }
    }
    return { story, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.filter(s => s.score > 0).slice(0, 8).map(s => s.story);
}

export interface CoachRecommendation {
  purpose: PresentationPurpose;
  purposeReason: string;
  audience: PresentationAudience;
  audienceReason: string;
  suggestedTopics: Array<{ topic: TopicCategory; reason: string; priority: 'must_include' | 'recommended' | 'optional' }>;
  template: PresentationTemplate;
  templateReason: string;
  suggestedTitle: string;
  narrativeArc: string;
  gapQuestions: Array<{ question: string; context: string; field: string }>;
  storyAngles: Array<{ angle: string; source: string }>;
  estimatedSlides: number;
  recommendedStories: RecommendedStory[];
}

export async function getProjectContextSummary(
  accountId: number,
  projectId: number
): Promise<ProjectContextSummary> {
  const allTopics: TopicCategory[] = [
    'discovery_insights', 'stakeholder_priorities', 'kpi_commitments',
    'alignment_progress', 'value_realization', 'evidence_pack',
    'success_stories', 'green_sheet_objectives', 'growth_accelerator',
    'competitive_landscape'
  ];
  const data = await aggregatePresentationData(accountId, projectId, allTopics);

  const discoveryAnswered = (data.discoveryQuestions || []).filter((q: any) => q.answer);
  const greenSheet = data.greenSheetData;
  const narrative = data.narrativeCanvas as any;
  const story = data.storyBuilderData as any;

  let totalDataPoints = 0;

  const discoveryInsights = {
    count: discoveryAnswered.length + (data.headlines || []).length,
    sample: discoveryAnswered.slice(0, 3).map((q: any) => q.question),
  };
  totalDataPoints += discoveryInsights.count;

  const kpis = {
    count: (data.kpiCommitments || []).length,
    sample: (data.kpiCommitments || []).slice(0, 3).map((k: any) => k.commitmentTitle || k.name || 'KPI'),
  };
  totalDataPoints += kpis.count;

  const valueCases = {
    count: (data.valueCases || []).length,
    sample: (data.valueCases || []).slice(0, 3).map((vc: any) => vc.title || 'Value Case'),
  };
  totalDataPoints += valueCases.count;

  const evidencePack = {
    count: (data.evidencePackItems || []).length,
    quality: data.evidencePack?.qualityScore ? `${data.evidencePack.qualityScore}/100` : 'N/A',
  };
  totalDataPoints += evidencePack.count;

  const successStories = {
    count: (data.successStories || []).length + (data.successStoryLibrary || []).length,
    sample: (data.successStories || []).slice(0, 2).map((s: any) => s.title || 'Story'),
  };
  totalDataPoints += successStories.count;

  const greenSheetSummary = {
    available: !!greenSheet?.callPlanner?.objective,
    objective: greenSheet?.callPlanner?.objective || '',
  };
  if (greenSheetSummary.available) totalDataPoints++;

  const narrativeCanvasSummary = {
    available: !!narrative?.keyMessage,
    keyMessage: narrative?.keyMessage || '',
  };
  if (narrativeCanvasSummary.available) totalDataPoints++;

  const storyBuilderSummary = {
    available: !!story?.before?.startingHook,
    hook: story?.before?.startingHook || '',
  };
  if (storyBuilderSummary.available) totalDataPoints++;

  const growthAccelerator = {
    count: (data.growthAcceleratorCanvases || []).length,
  };
  totalDataPoints += growthAccelerator.count;

  const competitiveLandscape = {
    available: !!(data.blueSheet?.data as any)?.competitions?.length,
  };
  if (competitiveLandscape.available) totalDataPoints++;

  return {
    projectName: data.project?.name || 'Unknown',
    companyName: data.project?.companyName || '',
    accountName: data.account?.name || '',
    phase: data.project?.currentPhase || 'discovery',
    sector: data.project?.sector || data.account?.industry || '',
    discoveryCompleted: !!data.project?.discoveryCompleted,
    availableData: {
      discoveryInsights,
      kpis,
      valueCases,
      evidencePack,
      successStories,
      greenSheet: greenSheetSummary,
      narrativeCanvas: narrativeCanvasSummary,
      storyBuilder: storyBuilderSummary,
      growthAccelerator,
      competitiveLandscape,
    },
    totalDataPoints,
  };
}

export async function generateCoachRecommendations(
  accountId: number,
  projectId: number,
  userContext: string,
  additionalMaterials?: string
): Promise<CoachRecommendation> {
  const allTopics: TopicCategory[] = [
    'discovery_insights', 'stakeholder_priorities', 'kpi_commitments',
    'alignment_progress', 'value_realization', 'evidence_pack',
    'success_stories', 'green_sheet_objectives', 'growth_accelerator',
    'competitive_landscape'
  ];
  const data = await aggregatePresentationData(accountId, projectId, allTopics);
  const dataSummary = summarizeDataForPrompt(data, allTopics);
  const contextSummary = await getProjectContextSummary(accountId, projectId);

  const industry = data.account?.industry || '';
  let libraryStories: any[] = [];
  try {
    libraryStories = await storage.getSuccessStoryLibrary({
      industry: industry || undefined,
      approvalStatus: 'approved',
    });
    if (libraryStories.length < 3 && industry) {
      const allApproved = await storage.getSuccessStoryLibrary({ approvalStatus: 'approved' });
      const existing = new Set(libraryStories.map((s: any) => s.id));
      for (const s of allApproved) {
        if (!existing.has(s.id)) libraryStories.push(s);
        if (libraryStories.length >= 10) break;
      }
    }
  } catch (e) {
    console.warn("[PresentationStudio] Failed to fetch library stories for coach:", e);
  }

  const projectCapabilities = extractCapabilitiesFromProject(data);
  const projectThemes = extractThemesFromProject(data);
  const relevantKFStories = getRelevantKFStories(industry, projectCapabilities, projectThemes);
  const allKFStories = relevantKFStories.length >= 3 ? relevantKFStories : KF_CLIENT_STORIES.slice(0, 8);

  const prompt = `You are a senior Korn Ferry presentation coach. A consultant is preparing a presentation for a client engagement. Based on the project data and the consultant's brief, recommend the best configuration.

=== PROJECT DATA ===
${dataSummary}

=== STORYTELLING ASSETS ===
${data.narrativeCanvas ? `Narrative Canvas: Opener: ${(data.narrativeCanvas as any).opener || 'N/A'}, Key Message: ${(data.narrativeCanvas as any).keyMessage || 'N/A'}, Proof Point: ${(data.narrativeCanvas as any).proofPoint || 'N/A'}, Call to Action: ${(data.narrativeCanvas as any).callToAction || 'N/A'}` : 'No narrative canvas available.'}
${data.storyBuilderData ? `Story Builder: Hook: ${(data.storyBuilderData as any).before?.startingHook || 'N/A'}, Hero: ${(data.storyBuilderData as any).before?.heroCharacter || 'N/A'}, Turning Point: ${(data.storyBuilderData as any).during?.turningPoint || 'N/A'}, Single Message: ${(data.storyBuilderData as any).before?.singleMessage || 'N/A'}` : 'No story builder data.'}

=== SUCCESS STORY LIBRARY (for recommendations) ===
${libraryStories.length > 0 ? libraryStories.slice(0, 8).map((s: any, i: number) => `${i + 1}. [ID:${s.id}] "${s.title}" - Industry: ${s.industry || 'N/A'}, Capability: ${s.capabilityName || 'N/A'}, Challenge: ${(s.challenge || '').substring(0, 100)}, Results: ${(s.results || '').substring(0, 100)}`).join('\n') : 'No stories in library yet.'}

=== KORN FERRY CLIENT STORIES (from kornferry.com/about-us/business-impact/client-stories) ===
These are REAL published Korn Ferry case studies. Recommend the most relevant ones based on the client's industry, engagement purpose, and challenges. Explain WHY each recommended story would strengthen the presentation.
${allKFStories.map((s, i) => `${i + 1}. [KF:${s.id}] "${s.title}" - Company: ${s.company}, Industry: ${s.industry}, Capabilities: ${s.capabilities.join(', ')}, Description: ${s.description}`).join('\n')}

=== DATA AVAILABILITY ===
Discovery Insights: ${contextSummary.availableData.discoveryInsights.count} items
KPIs: ${contextSummary.availableData.kpis.count} items
Value Cases: ${contextSummary.availableData.valueCases.count} items
Evidence Pack: ${contextSummary.availableData.evidencePack.count} items (quality: ${contextSummary.availableData.evidencePack.quality})
Success Stories: ${contextSummary.availableData.successStories.count} items
Green Sheet: ${contextSummary.availableData.greenSheet.available ? 'Available' : 'Missing'}
Narrative Canvas: ${contextSummary.availableData.narrativeCanvas.available ? 'Available' : 'Missing'}
Story Builder: ${contextSummary.availableData.storyBuilder.available ? 'Available' : 'Missing'}
Growth Accelerator: ${contextSummary.availableData.growthAccelerator.count} canvases
Competitive Landscape: ${contextSummary.availableData.competitiveLandscape.available ? 'Available' : 'Missing'}
Project Phase: ${contextSummary.phase}

=== CONSULTANT'S BRIEF ===
${userContext || 'No specific brief provided.'}

${additionalMaterials ? `=== ADDITIONAL MATERIALS ===\n${additionalMaterials}` : ''}

=== YOUR TASK ===
Recommend the optimal presentation configuration. For each recommendation, explain WHY based on the data.

Identify GAPS: If critical data is missing for the recommended approach, generate specific questions to ask the consultant. Focus on what would make the presentation stronger.

Identify STORY ANGLES: Based on available storytelling assets (narrative canvas, story builder, success stories), suggest 2-3 compelling narrative angles.

Return valid JSON:
{
  "purpose": "customer_engagement|qbr|executive_pitch|discovery_readout|handoff_brief|evidence_review|value_story",
  "purposeReason": "1-2 sentences explaining why this purpose fits",
  "audience": "c_suite|client_sponsor|delivery_team|board|internal_review|buying_committee",
  "audienceReason": "1-2 sentences explaining the audience recommendation",
  "suggestedTopics": [
    { "topic": "<topic_id>", "reason": "why include this", "priority": "must_include|recommended|optional" }
  ],
  "template": "executive_modern|data_driven|visual_narrative",
  "templateReason": "why this template style",
  "suggestedTitle": "A compelling presentation title",
  "narrativeArc": "Brief description of the recommended story flow",
  "gapQuestions": [
    { "question": "What specific question to ask", "context": "Why this matters", "field": "what data area this fills" }
  ],
  "storyAngles": [
    { "angle": "Description of the narrative angle", "source": "What data it draws from" }
  ],
  "estimatedSlides": 12,
  "recommendedStoryIds": [1, 2],
  "storyRelevanceReasons": { "1": "Why this story is relevant to this engagement" },
  "recommendedKFStories": [
    { "id": "kf-story-id", "relevanceReason": "2-3 sentences explaining WHY this Korn Ferry client story is relevant to this specific engagement and how it strengthens the presentation" }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a Korn Ferry senior presentation coach. You analyze project data and consultant context to recommend optimal presentation configurations. Always respond with valid JSON."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    const result = JSON.parse(content);

    const recommendedStories: RecommendedStory[] = [];
    const recIds: number[] = result.recommendedStoryIds || [];
    const reasons: Record<string, string> = result.storyRelevanceReasons || {};
    for (const sid of recIds) {
      const story = libraryStories.find((s: any) => s.id === sid);
      if (story) {
        recommendedStories.push({
          id: story.id,
          title: story.title || 'Untitled Story',
          industry: story.industry || '',
          capability: story.capabilityName || '',
          challenge: (story.challenge || '').substring(0, 200),
          results: (story.results || '').substring(0, 200),
          relevanceReason: reasons[String(sid)] || 'Relevant to this engagement context.',
          sourceType: 'library',
        });
      }
    }

    const recKFStories: Array<{ id: string; relevanceReason: string }> = result.recommendedKFStories || [];
    for (const rec of recKFStories) {
      const kfStory = KF_CLIENT_STORIES.find(s => s.id === rec.id);
      if (kfStory) {
        recommendedStories.push({
          id: kfStory.id,
          title: kfStory.title,
          industry: kfStory.industry,
          capability: kfStory.capabilities.join(', '),
          challenge: kfStory.description,
          results: '',
          relevanceReason: rec.relevanceReason || 'Relevant Korn Ferry client story for this engagement.',
          sourceUrl: kfStory.url,
          sourceType: 'kf_client_story',
          company: kfStory.company,
          imageUrl: kfStory.imageUrl,
        });
      }
    }

    return {
      purpose: result.purpose || 'customer_engagement',
      purposeReason: result.purposeReason || '',
      audience: result.audience || 'client_sponsor',
      audienceReason: result.audienceReason || '',
      suggestedTopics: result.suggestedTopics || [],
      template: result.template || 'visual_narrative',
      templateReason: result.templateReason || '',
      suggestedTitle: result.suggestedTitle || '',
      narrativeArc: result.narrativeArc || '',
      gapQuestions: result.gapQuestions || [],
      storyAngles: result.storyAngles || [],
      estimatedSlides: result.estimatedSlides || 12,
      recommendedStories,
    };
  } catch (error) {
    console.error("[PresentationStudio] Coach AI failed:", error);
    return generateFallbackCoachRecommendation(data, contextSummary, userContext);
  }
}

function generateFallbackCoachRecommendation(
  data: AggregatedData,
  context: ProjectContextSummary,
  _userContext: string
): CoachRecommendation {
  const hasKpis = context.availableData.kpis.count > 0;
  const hasEvidence = context.availableData.evidencePack.count > 0;
  const hasDiscovery = context.availableData.discoveryInsights.count > 0;

  const purpose: PresentationPurpose = context.phase === 'discovery' ? 'discovery_readout'
    : hasEvidence ? 'evidence_review'
    : hasKpis ? 'qbr'
    : 'customer_engagement';

  const topics: Array<{ topic: TopicCategory; reason: string; priority: 'must_include' | 'recommended' | 'optional' }> = [];
  if (hasDiscovery) topics.push({ topic: 'discovery_insights', reason: 'Key findings from research', priority: 'must_include' });
  if (hasKpis) topics.push({ topic: 'kpi_commitments', reason: 'Show measurable commitments', priority: 'must_include' });
  if (hasEvidence) topics.push({ topic: 'evidence_pack', reason: 'Proof of value delivered', priority: 'recommended' });
  if (context.availableData.successStories.count > 0) topics.push({ topic: 'success_stories', reason: 'Social proof and credibility', priority: 'recommended' });
  if (context.availableData.greenSheet.available) topics.push({ topic: 'green_sheet_objectives', reason: 'Meeting objectives alignment', priority: 'recommended' });

  const gaps: Array<{ question: string; context: string; field: string }> = [];
  if (!hasKpis) gaps.push({ question: 'What KPIs or outcomes have you committed to with this client?', context: 'Without KPIs, the presentation lacks measurable proof points.', field: 'kpis' });
  if (!context.availableData.greenSheet.available) gaps.push({ question: 'What is the primary objective for this meeting?', context: 'A clear objective helps shape the narrative arc.', field: 'green_sheet' });

  return {
    purpose,
    purposeReason: `Based on the ${context.phase} phase and ${context.totalDataPoints} data points available.`,
    audience: 'client_sponsor',
    audienceReason: 'Default audience. Please adjust based on who will be in the room.',
    suggestedTopics: topics,
    template: hasKpis ? 'data_driven' : 'visual_narrative',
    templateReason: hasKpis ? 'Data available to support a metrics-heavy approach.' : 'Narrative approach recommended until more data is available.',
    suggestedTitle: `${context.accountName} - ${context.projectName}`,
    narrativeArc: 'Context → Insights → Opportunities → Approach → Next Steps',
    gapQuestions: gaps,
    storyAngles: [],
    estimatedSlides: 10 + topics.length,
    recommendedStories: (() => {
      const caps = extractCapabilitiesFromProject(data);
      const themes = extractThemesFromProject(data);
      const relevant = getRelevantKFStories(data.account?.industry || '', caps, themes);
      return relevant.slice(0, 3).map(s => ({
        id: s.id,
        title: s.title,
        industry: s.industry,
        capability: s.capabilities.join(', '),
        challenge: s.description,
        results: '',
        relevanceReason: `Relevant ${s.industry} case study featuring ${s.capabilities[0]} that can strengthen your presentation narrative.`,
        sourceUrl: s.url,
        sourceType: 'kf_client_story' as const,
        company: s.company,
        imageUrl: s.imageUrl,
      }));
    })(),
  };
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

  if (topics.includes('evidence_pack')) {
    if (data.evidencePackItems.length > 0) {
      const itemSummary = data.evidencePackItems.slice(0, 12).map((item: any) =>
        `- [${item.itemType || 'N/A'}] Claim: "${item.claim || 'N/A'}" | Supporting Evidence: "${item.evidence?.substring(0, 200) || 'N/A'}" | Phase: ${item.phase || 'N/A'} | Confidence: ${item.confidence || 'N/A'} | Source: ${item.source || 'N/A'}`
      ).join('\n');
      sections.push(`EVIDENCE PACK (${data.evidencePackItems.length} items, Quality Score: ${data.evidencePack?.qualityScore || 'N/A'}):\n${itemSummary}\n\nIMPORTANT: You MUST use these specific evidence items verbatim in your slides. Create dedicated evidence slides that quote the exact claims and supporting evidence above. Do NOT generate generic evidence - use the real data provided.`);
    } else {
      sections.push(`EVIDENCE PACK: No evidence items found for this project. Create slides that acknowledge evidence collection is in progress and recommend gathering leading, mid-loop, and lagging indicators.`);
    }
  }

  if (topics.includes('success_stories')) {
    const stories: string[] = [];
    if (data.successStories.length > 0) {
      const projectStories = data.successStories.slice(0, 5).map((s: any) =>
        `- [Project Story] "${s.title}": Category: ${s.category || 'N/A'} | Industry: ${s.industry || 'N/A'} | Capability: ${s.capabilityName || 'N/A'} | Relevance: ${s.relevanceReason || 'N/A'} | Client: ${s.clientName || 'N/A'} | Excerpt: "${s.excerpt || s.description || 'N/A'}"`
      ).join('\n');
      stories.push(projectStories);
    }
    if (data.successStoryLibrary.length > 0) {
      const libraryStories = data.successStoryLibrary.slice(0, 5).map((s: any) =>
        `- [Library Story] "${s.title}": Challenge: "${s.challenge || 'N/A'}" | Solution: "${s.solution || 'N/A'}" | Results: "${s.results || 'N/A'}" | Metrics: "${s.metrics || 'N/A'}" | Industry: ${s.industry || 'N/A'} | Capability: ${s.capabilityName || 'N/A'} | Client: ${s.clientName || 'N/A'} | Timeframe: ${s.timeframeMonths ? s.timeframeMonths + ' months' : 'N/A'}`
      ).join('\n');
      stories.push(libraryStories);
    }
    const totalCount = data.successStories.length + data.successStoryLibrary.length;
    if (totalCount > 0) {
      sections.push(`SUCCESS STORIES (${totalCount} total - ${data.successStories.length} project-specific, ${data.successStoryLibrary.length} from library):\n${stories.join('\n')}\n\nIMPORTANT: You MUST incorporate these success stories into dedicated slides. Quote the real titles, challenges, solutions, and results. Create at least one slide per success story with specific details - do NOT generate generic success content.`);
    } else {
      sections.push(`SUCCESS STORIES: No success stories found for this project or in the library. Create a slide recommending the team document early wins and client testimonials to build the success story portfolio.`);
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

${request.audiencePriorities?.length ? `AUDIENCE PRIORITIES (User-confirmed — these are the TOP things this audience cares about. Structure the entire narrative around these priorities):
${request.audiencePriorities.map((p, i) => `${i + 1}. ${p.title}: ${p.description}\n   Recommendation: ${p.recommendation}`).join('\n')}
IMPORTANT: These priorities should drive the slide structure, data emphasis, and narrative arc. Each priority should be clearly addressed in at least 1-2 slides.\n` : ''}
${request.userBrief ? `CONSULTANT'S BRIEF:\n${request.userBrief}\n` : ''}
${request.additionalMaterials ? `ADDITIONAL CONTEXT/MATERIALS:\n${request.additionalMaterials}\n` : ''}
${request.gapAnswers?.length ? `CONSULTANT'S ANSWERS TO GAP QUESTIONS:\n${request.gapAnswers.map(ga => `Q: ${ga.question}\nA: ${ga.answer}`).join('\n')}\n` : ''}

STORYTELLING ASSETS:
${data.narrativeCanvas ? `Narrative Canvas: Opener: ${(data.narrativeCanvas as any).opener || 'N/A'}, Key Message: ${(data.narrativeCanvas as any).keyMessage || 'N/A'}, Proof Point: ${(data.narrativeCanvas as any).proofPoint || 'N/A'}, CTA: ${(data.narrativeCanvas as any).callToAction || 'N/A'}` : 'No narrative canvas.'}
${data.storyBuilderData ? `Story Builder: Hook: ${(data.storyBuilderData as any).before?.startingHook || 'N/A'}, Hero: ${(data.storyBuilderData as any).before?.heroCharacter || 'N/A'}, Turning Point: ${(data.storyBuilderData as any).during?.turningPoint || 'N/A'}, Single Message: ${(data.storyBuilderData as any).before?.singleMessage || 'N/A'}` : 'No story builder.'}

STORYTELLING INSTRUCTIONS: If Narrative Canvas or Story Builder data is available, weave it into the slide narrative. Use the opener for early slides, the key message/proof points for the middle, and the call to action for the summary/closing slides. Create a compelling arc that mirrors the story structure.

AVAILABLE DATA:
${dataSummary}

CRITICAL DESIGN PRINCIPLES:
1. EVERY SLIDE must contain substantial, specific content - NO generic placeholder text
2. Use REAL numbers, names, and data from the available data above - NEVER invent data that isn't provided
3. VARY slide types extensively - mix kpi_scorecard, chart, flow_diagram, comparison, quote, content, image_feature
4. Each kpi_scorecard slide should have 3-6 metrics with specific values and trend indicators
5. Each chart slide must have chartData with real labels and realistic data values (3-8 data points)
6. comparison slides must show specific before vs after values from the data
7. flow_diagram slides should have 3-5 clear steps with descriptions
8. Content slides should have 3-5 substantive bullet points with specific insights, not generic statements
9. Quote slides should feature client-relevant quotes or powerful value statements
10. Include bodyContent AND bulletPoints AND metrics on content slides where relevant - pack value into every slide
11. Speaker notes should be detailed talking points (2-3 sentences), not one-liners
12. talkTrack: For EVERY slide, generate a detailed talk track script (4-8 sentences). This is the presenter's verbatim script - what they would actually say out loud. Include: opening transition from previous slide, key points to emphasize, specific data callouts, audience engagement cues (e.g., "pause here for questions"), and a transition sentence to the next slide. Make it conversational and confident, as if a senior Korn Ferry consultant is presenting. This is different from speakerNotes which are brief reminders.
13. EVIDENCE SLIDES: If evidence pack data is provided, create dedicated slides that quote the EXACT claims and supporting evidence. Use the real evidence text, not summaries or paraphrases. Each evidence slide should reference the specific claim, its phase (leading/mid-loop/lagging), and confidence level.
14. SUCCESS STORY SLIDES: If success stories are provided, create at least one dedicated slide per story using the EXACT title, challenge, solution, and results from the data. Include the client name, industry, and specific metrics. Do NOT create generic "success" slides.

TEMPLATE GUIDELINES:
- executive_modern: 10-12 slides. Lead with bold metrics. Use kpi_scorecard + image_feature + comparison heavily. Every slide must have either metrics or a chart.
- data_driven: 12-15 slides. Heavy use of charts, kpi_scorecards, comparison slides. Include chartData on at least 40% of slides. Each chart needs 4+ labeled data points.
- visual_narrative: 10-14 slides. Story arc with quote slides, flow_diagrams, image_features. But still include data - every narrative slide should have at least one metric or bullet point backed by data.

IMAGE CATEGORIES (assign to image_feature and section_divider slides):
- 'professional', 'teamwork', 'technology', 'leadership', 'cityscape', 'innovation'

${request.brandTemplate ? `BRAND TEMPLATE (PRIMARY - takes priority over slide style):
Template Name: "${request.brandTemplate.name}"
- Fonts: Heading="${request.brandTemplate.fonts.major}", Body="${request.brandTemplate.fonts.minor}"
- Brand Colors: ${Object.entries(request.brandTemplate.colors).map(([k, v]) => `${k}: "#${v}"`).join(', ')}
- Available Layouts: ${request.brandTemplate.layouts.map(l => l.name).join(', ')}
IMPORTANT: The uploaded brand template defines the visual identity. Use ONLY these brand colors for charts, metrics, and visual elements. The slide style (${template}) controls content arrangement and tone, NOT colors or fonts. Prioritize accent1 and accent2 for primary chart colors, accent3-accent6 for secondary elements.` : `BRAND COLORS (REQUIRED for chart colors and metric colors - assign specific colors):
- Navy: "#00173B", Forest Green: "#00634F", Ocean Blue: "#005971"
- Emerald: "#009B77" (for positive/success), Mint: "#05C690" (highlights)
- Lime: "#8DC63F" (growth), Cyan: "#00ADBB" (info), Purple: "#A3238E" (premium)`}

IMAGE LIBRARY: When creating image_feature slides, reference available branded images using these categories:
- 'professional' - business professional headshots and office settings
- 'teamwork' - collaborative team scenes
- 'technology' - digital transformation and tech innovation
- 'leadership' - executive leadership and boardroom
- 'cityscape' - corporate skylines and modern architecture
- 'innovation' - creative thinking and breakthrough moments

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

Return ONLY valid JSON with a "slides" array. Each slide must have: id (e.g. "slide-1"), slideType, title, topicSource, speakerNotes, talkTrack. Include all relevant optional fields to make slides data-rich.`;


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
      talkTrack: slide.talkTrack,
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

export async function generateAudiencePriorities(
  accountId: number,
  projectId: number,
  purpose: PresentationPurpose,
  audience: PresentationAudience,
  selectedTopics: TopicCategory[]
): Promise<AudiencePriorityAdvice> {
  const aggregatedData = await aggregatePresentationData(accountId, projectId, selectedTopics);
  const dataSummary = summarizeDataForPrompt(aggregatedData, selectedTopics);
  const audienceContext = AUDIENCE_CONTEXT[audience];
  const purposeContext = PURPOSE_CONTEXT[purpose];

  const prompt = `You are a senior Korn Ferry presentation strategist and audience psychologist. Your job is to identify what THIS specific audience will care about MOST in this presentation — and coach the consultant on how to frame the conversation for maximum impact.

CONTEXT:
- Account: ${aggregatedData.account?.name || 'Unknown'} (${aggregatedData.account?.industry || 'Unknown industry'})
- Purpose: ${purpose} - ${purposeContext}
- Audience: ${audience} - ${audienceContext}
- Selected Topics: ${selectedTopics.join(', ')}

AVAILABLE DATA:
${dataSummary}

TASK: Analyze this specific situation and return a JSON object with:

1. "top3" - The TOP 3 things this audience will care about most. These are not generic — they should reflect what matters given THIS account's data, THIS purpose, and THIS audience type. For each:
   - "id": unique identifier (e.g., "roi-evidence")
   - "title": Concise priority name (3-6 words)
   - "description": What the audience is thinking/feeling about this (2-3 sentences, written from audience's perspective)
   - "recommendation": Specific tactical advice on how to address this in the presentation (2-3 sentences, actionable)
   - "rationale": Why this priority matters for moving the conversation forward (1-2 sentences)
   - "impact": "high" | "medium" | "low" — how much this will influence the audience's decision
   - "dataSupport": "strong" | "moderate" | "weak" — how well the available data supports this priority
   - "relatedTopics": which of the selected topics connect to this priority

2. "alternatives" - 5-6 alternative priorities the consultant could swap in. Same structure as top3 items.

3. "audienceInsight" - A 2-3 sentence psychological profile of what THIS audience type typically needs to feel confident and move forward. What's their unspoken concern?

4. "winningStrategy" - A 2-3 sentence description of the ideal narrative strategy to win this audience over, given the available data and purpose. What's the story arc that will resonate?

IMPORTANT: Be specific to the data available. If there are strong KPIs, emphasize evidence. If discovery is early, emphasize vision and methodology. If competitive landscape is present, address positioning. Never be generic — reference actual data points, KPI names, or evidence items where possible.

Return ONLY valid JSON.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a Korn Ferry audience analysis expert. You deeply understand what different executive audiences care about and how to frame presentations for maximum impact. Always respond with valid JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    const result = JSON.parse(content);

    const mapPriority = (p: any, idx: number): AudiencePriority => ({
      id: p.id || `priority-${idx}`,
      title: p.title || 'Untitled Priority',
      description: p.description || '',
      recommendation: p.recommendation || '',
      rationale: p.rationale || '',
      impact: p.impact || 'medium',
      dataSupport: p.dataSupport || 'moderate',
      relatedTopics: (p.relatedTopics || []).filter((t: string) => selectedTopics.includes(t as TopicCategory)),
    });

    return {
      top3: (result.top3 || []).slice(0, 3).map(mapPriority),
      alternatives: (result.alternatives || []).slice(0, 8).map(mapPriority),
      audienceInsight: result.audienceInsight || '',
      winningStrategy: result.winningStrategy || '',
    };
  } catch (error: any) {
    console.error("[PresentationStudio] Audience priorities generation failed:", error);
    return {
      top3: [
        { id: 'roi-impact', title: 'ROI & Business Impact', description: 'The audience wants to see measurable return on investment and clear business outcomes.', recommendation: 'Lead with quantified results and before/after comparisons.', rationale: 'Decision-makers need evidence that investment is paying off.', impact: 'high', dataSupport: 'moderate', relatedTopics: [] },
        { id: 'strategic-alignment', title: 'Strategic Alignment', description: 'They need to see how this work connects to their broader organizational strategy.', recommendation: 'Map your findings to their stated strategic priorities.', rationale: 'Ensures continued executive sponsorship and budget.', impact: 'high', dataSupport: 'moderate', relatedTopics: [] },
        { id: 'next-steps', title: 'Clear Next Steps', description: 'The audience wants to know what happens next and what decisions they need to make.', recommendation: 'End with 2-3 specific, time-bound action items.', rationale: 'Moves the conversation forward and demonstrates momentum.', impact: 'medium', dataSupport: 'strong', relatedTopics: [] },
      ],
      alternatives: [
        { id: 'risk-mitigation', title: 'Risk Mitigation', description: 'What risks exist and how are they being managed?', recommendation: 'Address risks head-on with mitigation plans.', rationale: 'Builds trust through transparency.', impact: 'medium', dataSupport: 'moderate', relatedTopics: [] },
        { id: 'competitive-edge', title: 'Competitive Differentiation', description: 'How does this create competitive advantage?', recommendation: 'Position outcomes against market benchmarks.', rationale: 'Justifies investment in competitive context.', impact: 'medium', dataSupport: 'weak', relatedTopics: [] },
      ],
      audienceInsight: 'This audience needs confidence that the engagement is on track and delivering measurable value.',
      winningStrategy: 'Lead with evidence, anchor to strategic goals, and close with clear momentum toward the next milestone.',
    };
  }
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
