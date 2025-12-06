// Korn Ferry Knowledge Structure with Detailed KPI Metadata and Calculation Framework

// ============================================================================
// ENTERPRISE OKR THEMES - Top-level strategic archetypes
// ============================================================================

export interface OKRKeyResult {
  description: string;
  metricType: string;
}

export interface OKRThemeDefinition {
  id: string;
  name: string;
  shortName: string;
  objective: string;
  description: string;
  exampleKeyResults: OKRKeyResult[];
  dataSources: string[];
  kornFerryAlignment: string[]; // Which KF solution areas align
  sectorVariants?: Record<string, { additionalKeyResults: string[]; notes: string }>;
}

export const ENTERPRISE_OKR_THEMES: OKRThemeDefinition[] = [
  {
    id: "growth",
    name: "Growth & Market Position",
    shortName: "Growth",
    objective: "Grow sustainable revenue and strengthen position in priority markets",
    description: "Focus on revenue growth, market share expansion, and strategic market positioning through new offers and segment penetration.",
    exampleKeyResults: [
      { description: "Increase total revenue by X percent year on year", metricType: "percentage" },
      { description: "Grow share in priority segment(s) by Y percentage points", metricType: "percentage" },
      { description: "Launch N offers in strategic segments with at least Z adoption in year one", metricType: "count" }
    ],
    dataSources: ["Board decks", "Investor reports", "Sales plans", "Product roadmaps"],
    kornFerryAlignment: ["COMMERCIAL", "TRANSFORM"],
    sectorVariants: {
      "financial_services": { additionalKeyResults: ["Grow AUM by X%", "Increase loan book by Y%"], notes: "Focus on capital efficiency" },
      "healthcare": { additionalKeyResults: ["Increase patient volume by X%", "Expand service lines"], notes: "Balance growth with quality" }
    }
  },
  {
    id: "profitability",
    name: "Profitability & Cost Effectiveness",
    shortName: "Profitability",
    objective: "Improve profitability while protecting service and quality",
    description: "Drive margin improvement through cost optimization, productivity gains, and strategic resource allocation without compromising service levels.",
    exampleKeyResults: [
      { description: "Improve operating margin by X basis points", metricType: "basis_points" },
      { description: "Reduce unit cost to serve by Y percent in target channels", metricType: "percentage" },
      { description: "Shift N percent of spend from run to change or growth initiatives", metricType: "percentage" }
    ],
    dataSources: ["Finance packs", "Productivity programmes", "Procurement data", "Transformation cases"],
    kornFerryAlignment: ["TRANSFORM", "REWARD"],
    sectorVariants: {
      "manufacturing": { additionalKeyResults: ["Reduce scrap rate by X%", "Improve OEE by Y%"], notes: "Focus on yield and efficiency" }
    }
  },
  {
    id: "customer",
    name: "Customer Value & Loyalty",
    shortName: "Customer",
    objective: "Increase customer satisfaction and deepen relationships",
    description: "Enhance customer experience, build loyalty, and strengthen relationships through improved service delivery and responsiveness.",
    exampleKeyResults: [
      { description: "Raise NPS or customer satisfaction score from A to B", metricType: "score" },
      { description: "Improve customer retention from X percent to Y percent in priority segments", metricType: "percentage" },
      { description: "Reduce complaint volume or response times by Z percent", metricType: "percentage" }
    ],
    dataSources: ["Customer surveys", "Service dashboards", "CRM systems"],
    kornFerryAlignment: ["DEVELOP", "TRANSFORM"],
    sectorVariants: {
      "healthcare": { additionalKeyResults: ["Improve patient satisfaction scores", "Reduce wait times by X%"], notes: "Patient experience is paramount" }
    }
  },
  {
    id: "operations",
    name: "Operational Reliability & Speed",
    shortName: "Operations",
    objective: "Increase reliability, speed and resilience of core operations",
    description: "Optimize operational performance through improved processes, reduced errors, and faster cycle times while building organizational resilience.",
    exampleKeyResults: [
      { description: "Improve on time delivery or service levels from X to Y", metricType: "percentage" },
      { description: "Reduce rework, error rates or incident volume by Z percent", metricType: "percentage" },
      { description: "Improve cycle times for key processes by N percent", metricType: "percentage" }
    ],
    dataSources: ["Operations dashboards", "Quality reports", "Risk logs"],
    kornFerryAlignment: ["TRANSFORM", "ANALYTICS"],
    sectorVariants: {
      "manufacturing": { additionalKeyResults: ["Improve first-pass yield by X%", "Reduce safety incidents by Y%"], notes: "Safety and quality critical" },
      "healthcare": { additionalKeyResults: ["Reduce medical errors by X%", "Improve care coordination"], notes: "Clinical outcomes focus" }
    }
  },
  {
    id: "people",
    name: "People, Leadership & Culture",
    shortName: "People",
    objective: "Build a capable, engaged workforce and AI-ready leaders",
    description: "Develop leadership capability, drive engagement, build inclusive culture, and prepare the workforce for AI-enabled ways of working.",
    exampleKeyResults: [
      { description: "Raise engagement or inclusion scores from X to Y in target groups", metricType: "score" },
      { description: "Increase critical roles with ready successors from A percent to B percent", metricType: "percentage" },
      { description: "Achieve N percent adoption of key AI tools by target personas", metricType: "percentage" }
    ],
    dataSources: ["Engagement surveys", "Talent data", "Learning analytics", "AI adoption reports"],
    kornFerryAlignment: ["ASSESS", "DEVELOP", "REWARD"],
  },
  {
    id: "digital_ai",
    name: "Digital, AI & Innovation",
    shortName: "Digital & AI",
    objective: "Use data and AI to improve decisions, productivity and client outcomes",
    description: "Accelerate digital transformation, deploy AI use cases at scale, and drive innovation to create competitive advantage.",
    exampleKeyResults: [
      { description: "Deliver N AI use cases to production with measured impact on cost, revenue or risk", metricType: "count" },
      { description: "Achieve X percent of transactions through digital or self-service channels", metricType: "percentage" },
      { description: "Reach Y percent of employees using AI assistance weekly in target workflows", metricType: "percentage" }
    ],
    dataSources: ["Digital roadmaps", "AI portfolio", "Product analytics"],
    kornFerryAlignment: ["DEVELOP", "TRANSFORM", "ANALYTICS"],
  },
  {
    id: "risk_sustainability",
    name: "Risk, Compliance & Sustainability",
    shortName: "Risk & ESG",
    objective: "Manage risk and improve ESG and compliance performance",
    description: "Strengthen risk management, ensure regulatory compliance, and advance environmental, social, and governance objectives.",
    exampleKeyResults: [
      { description: "Reduce high severity incidents by X percent", metricType: "percentage" },
      { description: "Achieve target ESG score or meet external standard by date D", metricType: "score" },
      { description: "Reach N percent completion on priority compliance training with impact on observed behaviours", metricType: "percentage" }
    ],
    dataSources: ["Risk reports", "ESG reporting", "Internal audit", "Compliance dashboards"],
    kornFerryAlignment: ["DEVELOP", "TRANSFORM"],
    sectorVariants: {
      "financial_services": { additionalKeyResults: ["Maintain capital ratios above X%", "Zero regulatory breaches"], notes: "Regulatory capital critical" }
    }
  }
];

// Helper functions for OKR Themes
export function getOKRThemeById(id: string): OKRThemeDefinition | undefined {
  return ENTERPRISE_OKR_THEMES.find(theme => theme.id === id);
}

export function getOKRThemesByKFAlignment(solutionArea: string): OKRThemeDefinition[] {
  return ENTERPRISE_OKR_THEMES.filter(theme => 
    theme.kornFerryAlignment.includes(solutionArea)
  );
}

export function getAllOKRThemeIds(): string[] {
  return ENTERPRISE_OKR_THEMES.map(theme => theme.id);
}

// ============================================================================
// KORN FERRY CAPABILITIES AND KPIs
// ============================================================================

export interface KPIDefinition {
  name: string;
  unit: string;
  definition: string;
  baselineGuidance: string;
  measurementFrequency: string;
}

export interface CapabilityMetadata {
  name: string;
  jobs: string;
  primaryKPI: KPIDefinition;
  supportingKPIs: Array<{ name: string; unit: string }>;
  translationFormula: string;
  defaultRealisationRate: number;
  exampleExposure: string;
  preferredResearchDesign: string;
  dataSources: string;
  notes: string;
}

export interface SolutionAreaData {
  name: string;
  title: string;
  description: string;
  capabilities: CapabilityMetadata[];
}

export const KORN_FERRY_SOLUTIONS: Record<string, SolutionAreaData> = {
  ASSESS: {
    name: "ASSESS",
    title: "Success Profiles & Standardised Assessments",
    description: "Create the data spine for hiring, promotion and development",
    capabilities: [
      {
        name: "Success Profiles & Role Design",
        jobs: "Define role success; align roles; anchor selection/promotion; workforce planning; feed digital profiles",
        primaryKPI: {
          name: "Quality of Hire (QoH) at 6 months",
          unit: "Index 0-100",
          definition: "Composite index combining objective performance (50%), hiring manager rating (30%), retention at 6 months (20%)",
          baselineGuidance: "Prefer prior 12 months cohort mean; 6-month definitive measure for pilot",
          measurementFrequency: "6 months definitive (also 12 month check)"
        },
        supportingKPIs: [
          { name: "Time to Productivity", unit: "Days" },
          { name: "Hiring Manager Satisfaction", unit: "1-5 scale" }
        ],
        translationFormula: "Financial impact = QoH_delta × Hires_per_year × Avg_margin_per_role × Realisation_rate",
        defaultRealisationRate: 0.60,
        exampleExposure: "# hires per year (e.g., 120)",
        preferredResearchDesign: "Matched cohort (or randomised hiring-source trials)",
        dataSources: "HRIS, performance systems, manager survey",
        notes: "Map QoH_index -> probability of success; store mapping table in library"
      },
      {
        name: "Standardised Assessments & Assessments at Scale",
        jobs: "Measure capability; scale delivery; create norms; integrate into workflows; Responsible AI governance",
        primaryKPI: {
          name: "Predictive Validity (AUC or correlation r)",
          unit: "AUC (0.5-1.0) or r (-1 to 1)",
          definition: "Statistical link between assessment score and later job performance or retention",
          baselineGuidance: "Validate on historic cohorts; cross-validation and holdout sets recommended",
          measurementFrequency: "12 months (validation)"
        },
        supportingKPIs: [
          { name: "Assessment Completion Rate", unit: "Percent (%)" },
          { name: "Time to Offer", unit: "Days" }
        ],
        translationFormula: "Value = (Improved predictive validity → % more hires meeting success profile) × annual_hires × avg_contribution × Realisation − assessment_costs",
        defaultRealisationRate: 0.60,
        exampleExposure: "Annual hires (e.g., 100)",
        preferredResearchDesign: "Retrospective validation or prospective matched cohort",
        dataSources: "Assessment platform, HRIS, performance ratings",
        notes: "Include bias/fairness tests and confidence intervals"
      }
    ]
  },
  DEVELOP: {
    name: "DEVELOP",
    title: "Leadership & Development including AI-Ready Leader",
    description: "Build leaders, embed behaviour, link learning to business outcomes, prepare leaders for Human+AI",
    capabilities: [
      {
        name: "Leadership & Development Journeys",
        jobs: "Build leaders; change behaviour; link learning to business KPIs; develop succession; measure programmes",
        primaryKPI: {
          name: "Business KPI Delta attributable to participants",
          unit: "Depends on KPI (%, £)",
          definition: "Change in sponsor-chosen business KPI (e.g., revenue per team %, productivity per FTE) attributable to participants",
          baselineGuidance: "Prefer 12 months baseline; 6 and 12 month checks",
          measurementFrequency: "6 months interim; 12 months final"
        },
        supportingKPIs: [
          { name: "Competency Gain (assessment/360 delta)", unit: "Index or points" },
          { name: "Behavioural Application Rate", unit: "Percent (%)" }
        ],
        translationFormula: "Value = KPI_delta × #_teams × unit_value_per_KPI_point × Realisation_rate",
        defaultRealisationRate: 0.60,
        exampleExposure: "Teams affected (e.g., 20)",
        preferredResearchDesign: "Matched cohort or staged rollout; Kirkpatrick Level 4+",
        dataSources: "Finance systems; operational KPIs; 360/assessment data",
        notes: "Document attribution model and sensitivity"
      },
      {
        name: "AI-Ready Leader (within L&D)",
        jobs: "Prepare leaders for Human+AI decisions; build AI literacy; embed governance; speed data-driven decisions",
        primaryKPI: {
          name: "AI Readiness Index (0-100) OR Decision Lead Time (hours)",
          unit: "Index 0-100 OR hours",
          definition: "Composite of AI literacy, data fluency, ethical judgement and practical adoption OR mean time for representative decisions",
          baselineGuidance: "Pre/post assessment; cohort comparison",
          measurementFrequency: "6 and 12 months"
        },
        supportingKPIs: [
          { name: "AI Adoption Rate", unit: "% decisions aided" },
          { name: "Ethical/Compliance Score", unit: "Index or count" }
        ],
        translationFormula: "Value = Time_saved_per_decision × decisions_per_year × value_per_decision_hour × Realisation_rate (if using lead time)",
        defaultRealisationRate: 0.50,
        exampleExposure: "Decisions per year or leaders covered (placeholder)",
        preferredResearchDesign: "Cohort comparison with matched leaders",
        dataSources: "Leader assessments; system logs; governance records",
        notes: "Include Responsible AI checklist and incident logs"
      }
    ]
  },
  TRANSFORM: {
    name: "TRANSFORM",
    title: "Organisation Strategy & Transformation",
    description: "Redesign operating models, unlock structural savings and capability",
    capabilities: [
      {
        name: "Organisation Strategy & Transformation",
        jobs: "Redesign operating model; deliver capability; align people/process; unlock structural savings",
        primaryKPI: {
          name: "Productivity per FTE (or Process Cycle Time)",
          unit: "£ per FTE OR hours/days",
          definition: "Output (revenue or units) per FTE, or average cycle time for key process",
          baselineGuidance: "12 months preferred baseline; continuous monitoring",
          measurementFrequency: "Quarterly (process) and 12 months (productivity)"
        },
        supportingKPIs: [
          { name: "Cost per unit", unit: "£" },
          { name: "Error/Rework Rate", unit: "%" }
        ],
        translationFormula: "Savings = Productivity_gain_per_FTE × FTEs_affected × labour_cost_per_FTE − transformation_cost",
        defaultRealisationRate: 0.70,
        exampleExposure: "FTEs affected (e.g., 200)",
        preferredResearchDesign: "Whole-unit comparison or difference-in-differences across sites",
        dataSources: "ERP, process logs, finance systems",
        notes: "Use DID or staged rollout; include quality impacts"
      }
    ]
  },
  REWARD: {
    name: "REWARD",
    title: "Total Rewards Optimisation",
    description: "Design reward mix that maximises perceived employee value and retention",
    capabilities: [
      {
        name: "Total Rewards Optimisation (TRO)",
        jobs: "Maximise perceived employee value per £; rebalance spend; model cost vs perceived value; align rewards to EVP",
        primaryKPI: {
          name: "Perceived Employee Value per £ Spend OR Retention rate (priority cohorts)",
          unit: "Index/£ OR %",
          definition: "Conjoint-based perceived value divided by employer spend OR retention % for target cohorts",
          baselineGuidance: "Pre/post conjoint; segment-level analysis",
          measurementFrequency: "6-12 months post-implementation"
        },
        supportingKPIs: [
          { name: "Take-up Rate", unit: "%" },
          { name: "Cost per Employee", unit: "£" }
        ],
        translationFormula: "Value = Retention_improvement × cohort_size × avg_replacement_cost + (value of rebalanced spend) − incremental_cost",
        defaultRealisationRate: 0.50,
        exampleExposure: "Employees in cohort (e.g., 500)",
        preferredResearchDesign: "Segmented trials or cohort comparisons",
        dataSources: "Survey (conjoint), payroll, HRIS",
        notes: "TRO cases show high leverage when aligned to segments"
      }
    ]
  },
  COMMERCIAL: {
    name: "COMMERCIAL",
    title: "Sales & Service / KF Sell",
    description: "Improve commercial execution, pipeline and seller performance",
    capabilities: [
      {
        name: "Sales & Service (KF Sell)",
        jobs: "Increase win rate, deal size and velocity; improve forecast; raise seller productivity",
        primaryKPI: {
          name: "Win Rate (ppt change)",
          unit: "Percentage points (%)",
          definition: "% of opportunities closed won (closed won / total opportunities)",
          baselineGuidance: "Rolling 12 months baseline (CRM); segment by seller or region",
          measurementFrequency: "Monthly and 12 months"
        },
        supportingKPIs: [
          { name: "Average Deal Size", unit: "£" },
          { name: "Pipeline Velocity", unit: "Days or % conversion" }
        ],
        translationFormula: "Incremental revenue = WinRate_delta × Pipeline_exposure × Avg_deal_margin × Realisation_rate",
        defaultRealisationRate: 0.70,
        exampleExposure: "Pipeline exposure (e.g., £100,000,000)",
        preferredResearchDesign: "Staged rollout, matched seller cohorts",
        dataSources: "CRM, sales enablement tools, pipeline reports",
        notes: "Use S&S ROI templates; compute NPV/payback"
      }
    ]
  },
  ANALYTICS: {
    name: "ANALYTICS",
    title: "Analytics & Governance",
    description: "Provide insight, predictive models and the governance spine to measure and scale value",
    capabilities: [
      {
        name: "People Analytics / KFI Analytics",
        jobs: "Identify drivers of engagement/performance; build predictive models; validate assessment-to-outcome links; quantify savings",
        primaryKPI: {
          name: "Turnover Risk Predictive Accuracy (AUC) and Realised Turnover Reduction (%)",
          unit: "AUC and percentage (%)",
          definition: "Model predictive accuracy and realised reduction in voluntary turnover after interventions",
          baselineGuidance: "Baseline: prior 12 months turnover; model validation on holdout sets",
          measurementFrequency: "Monthly and 12 months"
        },
        supportingKPIs: [
          { name: "Top drivers (feature importance)", unit: "List / scores" },
          { name: "Promotion velocity for retained talent", unit: "Months/ratio" }
        ],
        translationFormula: "Savings = Turnover_reduction × #employees × replacement_cost − analytics_cost",
        defaultRealisationRate: 0.60,
        exampleExposure: "Employees in scope (e.g., 1000)",
        preferredResearchDesign: "Backtested predictive models with holdout and cross-validation",
        dataSources: "HRIS, engagement surveys, performance data",
        notes: "Include backtest results and uplift monitoring"
      },
      {
        name: "Value Management / Client Success & Talent Suite",
        jobs: "Align solutions to outcomes; track adoption and outcomes; govern re-measurement; deliver Talent Suite",
        primaryKPI: {
          name: "Value Realisation % (Actual vs Target)",
          unit: "%",
          definition: "Actual realised financial value divided by the target value stated in the Value Hypothesis",
          baselineGuidance: "Baseline = target value set in the hypothesis; track monthly",
          measurementFrequency: "Monthly and final remeasure at 12 months"
        },
        supportingKPIs: [
          { name: "Adoption Rate", unit: "%" },
          { name: "Time to First Value", unit: "Months" }
        ],
        translationFormula: "Value Realisation % = realised_value ÷ target_value; use for scale decision",
        defaultRealisationRate: 0.60,
        exampleExposure: "Target NPV or target_value (placeholder)",
        preferredResearchDesign: "Governance-based measurement; aggregate from solution KPIs",
        dataSources: "Aggregated solution KPIs, usage logs, finance",
        notes: "Serve as governance header; aggregate values from other offerings"
      }
    ]
  }
} as const;

export type SolutionArea = keyof typeof KORN_FERRY_SOLUTIONS;
export const SOLUTION_AREAS = Object.keys(KORN_FERRY_SOLUTIONS) as SolutionArea[];

// Helper to get all KPIs for a solution area
export function getKPIsForSolution(solution: SolutionArea): string[] {
  const solutionData = KORN_FERRY_SOLUTIONS[solution];
  const kpis: string[] = [];
  
  solutionData.capabilities.forEach(cap => {
    kpis.push(cap.primaryKPI.name);
    cap.supportingKPIs.forEach(kpi => kpis.push(kpi.name));
  });
  
  return kpis;
}

// Helper to get capability metadata by name
export function getCapabilityMetadata(capabilityName: string): CapabilityMetadata | null {
  for (const solution of Object.values(KORN_FERRY_SOLUTIONS)) {
    const capability = solution.capabilities.find(cap => cap.name === capabilityName);
    if (capability) return capability;
  }
  return null;
}

// Helper to get capability by solution area and KPI
export function getCapabilityByKPI(kpiName: string): CapabilityMetadata | null {
  for (const solution of Object.values(KORN_FERRY_SOLUTIONS)) {
    const capability = solution.capabilities.find(cap => 
      cap.primaryKPI.name === kpiName || 
      cap.supportingKPIs.some(kpi => kpi.name === kpiName)
    );
    if (capability) return capability;
  }
  return null;
}

// Helper to get solution summary for AI prompts
export function getSolutionSummary(): string {
  return Object.entries(KORN_FERRY_SOLUTIONS).map(([key, solution]) => {
    const capabilities = solution.capabilities.map(cap => 
      `  - ${cap.name}: ${cap.jobs}\n    Primary KPI: ${cap.primaryKPI.name}`
    ).join('\n');
    return `${key} (${solution.title}):\n${capabilities}`;
  }).join('\n\n');
}

// Helper to get all KPIs for a capability (primary + supporting)
export function getAllKPIsForCapability(capabilityName: string): Array<{ name: string; unit: string; type: 'primary' | 'supporting'; definition?: string; measurementFrequency?: string }> {
  const capability = getCapabilityMetadata(capabilityName);
  if (!capability) return [];
  
  const kpis = [
    {
      name: capability.primaryKPI.name,
      unit: capability.primaryKPI.unit,
      type: 'primary' as const,
      definition: capability.primaryKPI.definition,
      measurementFrequency: capability.primaryKPI.measurementFrequency
    },
    ...capability.supportingKPIs.map(kpi => ({
      name: kpi.name,
      unit: kpi.unit,
      type: 'supporting' as const
    }))
  ];
  
  return kpis;
}

// Helper to get solution area for a capability
export function getSolutionAreaForCapability(capabilityName: string): string | null {
  for (const [solutionKey, solution] of Object.entries(KORN_FERRY_SOLUTIONS)) {
    const capability = solution.capabilities.find(cap => cap.name === capabilityName);
    if (capability) return solution.name;
  }
  return null;
}

// Discovery question templates for each capability
export interface DiscoveryQuestionTemplate {
  question: string;
  type: 'quantitative' | 'qualitative' | 'both';
  purpose: string;
  relatedKPI?: string;
}

export const CAPABILITY_DISCOVERY_QUESTIONS: Record<string, DiscoveryQuestionTemplate[]> = {
  "Success Profiles & Role Design": [
    {
      question: "How many new hires do you typically bring on board annually for this role or function?",
      type: "quantitative",
      purpose: "Establish exposure for value calculation",
      relatedKPI: "Quality of Hire (QoH) at 6 months"
    },
    {
      question: "What is the average time it takes for a new hire in this role to reach full productivity?",
      type: "quantitative",
      purpose: "Baseline for improvement measurement",
      relatedKPI: "Time to Productivity"
    },
    {
      question: "What percentage of your recent hires in this role are meeting performance expectations at the 6-month mark?",
      type: "quantitative",
      purpose: "Establish current Quality of Hire baseline",
      relatedKPI: "Quality of Hire (QoH) at 6 months"
    },
    {
      question: "What are the primary challenges or pain points you experience in the hiring process for this role?",
      type: "qualitative",
      purpose: "Contextualize the opportunity and identify specific areas for improvement"
    }
  ],
  "Standardised Assessments & Assessments at Scale": [
    {
      question: "How many candidates do you assess annually across the roles where you'd implement standardized assessments?",
      type: "quantitative",
      purpose: "Establish assessment volume for value calculation",
      relatedKPI: "Assessment Completion Rate"
    },
    {
      question: "What is your current offer-to-acceptance ratio, and what percentage of accepted offers turn into successful hires (retained beyond 12 months)?",
      type: "quantitative",
      purpose: "Baseline for predictive validity improvement",
      relatedKPI: "Predictive Validity (AUC or correlation r)"
    },
    {
      question: "What assessment methods are you currently using, if any, and how confident are you in their ability to predict job success?",
      type: "qualitative",
      purpose: "Understand current state and identify gaps"
    }
  ],
  "Leadership & Development Journeys": [
    {
      question: "How many leaders or teams would participate in this development initiative annually?",
      type: "quantitative",
      purpose: "Establish exposure for value calculation",
      relatedKPI: "Business KPI Delta attributable to participants"
    },
    {
      question: "What specific business KPI (e.g., team revenue, productivity, customer satisfaction) would you like this leadership program to impact?",
      type: "both",
      purpose: "Identify the target KPI for value measurement",
      relatedKPI: "Business KPI Delta attributable to participants"
    },
    {
      question: "What is the current baseline performance for that KPI, and what improvement would represent meaningful business impact?",
      type: "quantitative",
      purpose: "Establish baseline and target for value calculation",
      relatedKPI: "Business KPI Delta attributable to participants"
    },
    {
      question: "What are the key leadership gaps or behavioral changes you want to see from this program?",
      type: "qualitative",
      purpose: "Define success criteria and contextualize the hypothesis"
    }
  ],
  "AI-Ready Leader (within L&D)": [
    {
      question: "How many leaders would you want to develop AI readiness capabilities?",
      type: "quantitative",
      purpose: "Establish exposure for value calculation",
      relatedKPI: "AI Readiness Index (0-100) OR Decision Lead Time (hours)"
    },
    {
      question: "On average, how long does it currently take your leadership team to make data-driven decisions, from information gathering to action?",
      type: "quantitative",
      purpose: "Baseline for decision lead time improvement",
      relatedKPI: "AI Readiness Index (0-100) OR Decision Lead Time (hours)"
    },
    {
      question: "What percentage of leadership decisions currently leverage AI or advanced analytics, and what barriers prevent greater adoption?",
      type: "both",
      purpose: "Assess current AI adoption and identify opportunities",
      relatedKPI: "AI Adoption Rate"
    }
  ],
  "Organisation Strategy & Transformation": [
    {
      question: "How many employees or teams would be affected by this organizational transformation?",
      type: "quantitative",
      purpose: "Establish exposure for value calculation",
      relatedKPI: "Productivity per FTE OR Net Promoter Score (NPS) delta"
    },
    {
      question: "What operational or business KPI would you most want to see improve as a result of this transformation (e.g., productivity, customer satisfaction, time-to-market)?",
      type: "both",
      purpose: "Identify target KPI for value measurement",
      relatedKPI: "Productivity per FTE OR Net Promoter Score (NPS) delta"
    },
    {
      question: "What is your current baseline for that KPI, and what does success look like?",
      type: "quantitative",
      purpose: "Establish baseline and improvement target",
      relatedKPI: "Productivity per FTE OR Net Promoter Score (NPS) delta"
    },
    {
      question: "What are the main organizational challenges or cultural barriers you're trying to address with this transformation?",
      type: "qualitative",
      purpose: "Contextualize the transformation and identify critical success factors"
    }
  ],
  "Total Rewards Optimisation (TRO)": [
    {
      question: "What is your current total compensation spend annually for the employee population you're targeting?",
      type: "quantitative",
      purpose: "Establish baseline for cost optimization",
      relatedKPI: "Compensation Cost as % Revenue"
    },
    {
      question: "What is your current voluntary turnover rate for critical roles, and what does it cost to replace one of these employees?",
      type: "quantitative",
      purpose: "Establish retention baseline and replacement cost",
      relatedKPI: "Voluntary Turnover Rate (critical roles)"
    },
    {
      question: "How satisfied are employees with the current rewards structure, and what elements do they value most?",
      type: "qualitative",
      purpose: "Understand perception gaps and optimization opportunities"
    }
  ],
  "Sales & Service (KF Sell)": [
    {
      question: "How many sales or service professionals would be included in this initiative?",
      type: "quantitative",
      purpose: "Establish exposure for value calculation",
      relatedKPI: "Revenue per Sales FTE OR Customer Satisfaction Score (CSAT)"
    },
    {
      question: "What is the current average revenue per salesperson (or customer satisfaction score for service roles)?",
      type: "quantitative",
      purpose: "Establish baseline for improvement",
      relatedKPI: "Revenue per Sales FTE OR Customer Satisfaction Score (CSAT)"
    },
    {
      question: "What percentage of your sales or service team consistently meets or exceeds their targets?",
      type: "quantitative",
      purpose: "Assess current performance distribution",
      relatedKPI: "Revenue per Sales FTE OR Customer Satisfaction Score (CSAT)"
    },
    {
      question: "What are the primary challenges your sales or service teams face in achieving their goals?",
      type: "qualitative",
      purpose: "Identify root causes and intervention points"
    }
  ],
  "People Analytics / KFI Analytics": [
    {
      question: "What business decision or HR process would you like to improve with better people analytics?",
      type: "qualitative",
      purpose: "Identify the primary use case and value opportunity"
    },
    {
      question: "How many HR or business decisions of this type do you make annually, and what is the typical impact of each decision?",
      type: "both",
      purpose: "Quantify decision frequency and impact",
      relatedKPI: "Decision Accuracy OR Time to Insight"
    },
    {
      question: "What data sources do you currently use for these decisions, and how long does it take to gather and analyze the information?",
      type: "both",
      purpose: "Assess current state and time savings opportunity",
      relatedKPI: "Time to Insight"
    }
  ],
  "Value Management / Client Success & Talent Suite": [
    {
      question: "How many client engagements or talent initiatives would benefit from enhanced value tracking and measurement?",
      type: "quantitative",
      purpose: "Establish scope for value calculation"
    },
    {
      question: "What is the typical value (revenue or cost savings) of a successful client engagement or talent initiative?",
      type: "quantitative",
      purpose: "Establish value per engagement for scaling calculation"
    },
    {
      question: "What percentage of your current initiatives have clearly defined and measured business outcomes?",
      type: "quantitative",
      purpose: "Assess baseline for value management maturity"
    },
    {
      question: "What are the main challenges in demonstrating ROI or business impact to stakeholders?",
      type: "qualitative",
      purpose: "Identify process gaps and improvement opportunities"
    }
  ]
};

// Korn Ferry Industry Benchmarks - Fallback values when client baseline data is unavailable
export interface KPIBenchmark {
  kpiName: string;
  benchmarkValue: string;
  source: string;
  industry: string;
  year: number;
}

export const KORN_FERRY_BENCHMARKS: KPIBenchmark[] = [
  // ASSESS Benchmarks
  {
    kpiName: "Quality of Hire (QoH) at 6 months",
    benchmarkValue: "65-70",
    source: "Korn Ferry 2024 Talent Acquisition Study",
    industry: "Cross-industry",
    year: 2024
  },
  {
    kpiName: "Time to Productivity",
    benchmarkValue: "90-120",
    source: "Korn Ferry 2024 Onboarding Effectiveness Study",
    industry: "Cross-industry",
    year: 2024
  },
  {
    kpiName: "Predictive Validity (AUC or correlation r)",
    benchmarkValue: "0.65-0.75",
    source: "Korn Ferry Assessment Validation Meta-Analysis 2023",
    industry: "Cross-industry",
    year: 2023
  },
  {
    kpiName: "Assessment Completion Rate",
    benchmarkValue: "85-92",
    source: "Korn Ferry Assessment Platform Benchmarks 2024",
    industry: "Cross-industry",
    year: 2024
  },
  
  // DEVELOP Benchmarks
  {
    kpiName: "Business KPI Delta attributable to participants",
    benchmarkValue: "8-15",
    source: "Korn Ferry Leadership Development Impact Study 2023",
    industry: "Cross-industry",
    year: 2023
  },
  {
    kpiName: "Competency Gain (assessment/360 delta)",
    benchmarkValue: "12-18",
    source: "Korn Ferry 360 Feedback Effectiveness Study 2024",
    industry: "Cross-industry",
    year: 2024
  },
  {
    kpiName: "AI Readiness Index (0-100) OR Decision Lead Time (hours)",
    benchmarkValue: "55-65",
    source: "Korn Ferry AI Leadership Readiness Report 2024",
    industry: "Cross-industry",
    year: 2024
  },
  
  // TRANSFORM Benchmarks
  {
    kpiName: "Productivity per FTE (or Process Cycle Time)",
    benchmarkValue: "£85,000-£120,000",
    source: "Korn Ferry Organizational Transformation Study 2023",
    industry: "Cross-industry",
    year: 2023
  },
  {
    kpiName: "Cost per unit",
    benchmarkValue: "Varies by industry",
    source: "Industry-specific benchmarks available",
    industry: "Cross-industry",
    year: 2024
  },
  
  // REWARD Benchmarks
  {
    kpiName: "Perceived Employee Value per £ Spend OR Retention rate (priority cohorts)",
    benchmarkValue: "82-88",
    source: "Korn Ferry Total Rewards Optimization Study 2024",
    industry: "Cross-industry",
    year: 2024
  },
  {
    kpiName: "Voluntary Turnover Rate (critical roles)",
    benchmarkValue: "8-12",
    source: "Korn Ferry Retention and Engagement Study 2024",
    industry: "Cross-industry",
    year: 2024
  },
  
  // COMMERCIAL Benchmarks
  {
    kpiName: "Revenue per Sales FTE OR Customer Satisfaction Score (CSAT)",
    benchmarkValue: "£450,000-£750,000 OR 82-88",
    source: "Korn Ferry Sales Effectiveness Benchmarks 2024",
    industry: "Cross-industry",
    year: 2024
  },
  {
    kpiName: "Win Rate",
    benchmarkValue: "25-35",
    source: "Korn Ferry Sales Performance Study 2023",
    industry: "Cross-industry",
    year: 2023
  },
  
  // ANALYTICS Benchmarks
  {
    kpiName: "Decision Accuracy OR Time to Insight",
    benchmarkValue: "75-85 OR 3-7 days",
    source: "Korn Ferry People Analytics Maturity Study 2024",
    industry: "Cross-industry",
    year: 2024
  },
  {
    kpiName: "Analytics Adoption Rate",
    benchmarkValue: "45-65",
    source: "Korn Ferry Analytics Adoption Report 2024",
    industry: "Cross-industry",
    year: 2024
  }
];

// Helper to get benchmark for a KPI
export function getBenchmarkForKPI(kpiName: string): KPIBenchmark | null {
  return KORN_FERRY_BENCHMARKS.find(b => b.kpiName === kpiName) || null;
}

// ============================================================================
// COMPETITIVE INTELLIGENCE - Korn Ferry vs Competitors by Solution Area
// ============================================================================

export interface CompetitorOffering {
  name: string;
  description: string;
  strengths: string[];
  limitations: string[];
}

export interface Competitor {
  id: string;
  name: string;
  shortName: string;
  category: "big4" | "boutique" | "hrtech" | "management_consulting" | "executive_search";
  website: string;
  description: string;
  solutionAreas: string[]; // Which KF solution areas they compete in
  offerings: Record<string, CompetitorOffering>; // Key offerings by solution area
}

export interface KornFerryDifferentiator {
  id: string;
  title: string;
  description: string;
  proofPoints: string[];
  relevantSolutionAreas: string[];
  competitiveAdvantageVs: string[]; // Which competitors this differentiates against
}

export interface CompetitorComparison {
  solutionArea: string;
  kornFerryStrengths: string[];
  competitorWeaknesses: Record<string, string[]>; // Competitor ID -> weaknesses
  battleCards: Array<{
    scenario: string;
    kornFerryResponse: string;
    winTheme: string;
  }>;
}

// Major competitors in talent and organizational consulting
export const COMPETITORS: Competitor[] = [
  {
    id: "mckinsey",
    name: "McKinsey & Company",
    shortName: "McKinsey",
    category: "management_consulting",
    website: "mckinsey.com",
    description: "Global management consulting firm with talent practice",
    solutionAreas: ["TRANSFORM", "DEVELOP", "ANALYTICS"],
    offerings: {
      TRANSFORM: {
        name: "McKinsey Organization Practice",
        description: "Org design, operating models, talent strategy",
        strengths: ["CEO-level relationships", "Cross-functional transformation", "Strong brand in boardroom"],
        limitations: ["Less depth in talent assessment", "Higher cost", "Generalist approach to people topics"]
      },
      DEVELOP: {
        name: "McKinsey Leadership Programs",
        description: "Executive development and leadership transformation",
        strengths: ["Top-tier executive access", "Business strategy integration"],
        limitations: ["Limited assessment IP", "Less depth in behavioral science", "Fewer proprietary tools"]
      }
    }
  },
  {
    id: "deloitte",
    name: "Deloitte Human Capital",
    shortName: "Deloitte",
    category: "big4",
    website: "deloitte.com",
    description: "Big 4 consulting firm with comprehensive human capital practice",
    solutionAreas: ["TRANSFORM", "DEVELOP", "REWARD", "ANALYTICS"],
    offerings: {
      TRANSFORM: {
        name: "Human Capital Consulting",
        description: "Workforce transformation, org design, M&A integration",
        strengths: ["Technology integration", "Global delivery capability", "Audit/tax cross-sell"],
        limitations: ["More technology-focused than people-focused", "Less proprietary assessment IP", "Consultant quality variance"]
      },
      REWARD: {
        name: "Total Rewards",
        description: "Compensation strategy and benchmarking",
        strengths: ["Large compensation database", "Technology integration"],
        limitations: ["Less conjoint/preference modeling depth", "More transactional than strategic"]
      },
      ANALYTICS: {
        name: "Workforce Analytics",
        description: "People analytics and workforce planning",
        strengths: ["Technology platforms", "Data integration"],
        limitations: ["Less behavioral science depth", "Fewer predictive validity studies"]
      }
    }
  },
  {
    id: "mercer",
    name: "Mercer",
    shortName: "Mercer",
    category: "boutique",
    website: "mercer.com",
    description: "Global consulting leader in health, wealth, and career",
    solutionAreas: ["REWARD", "ASSESS", "DEVELOP", "ANALYTICS"],
    offerings: {
      REWARD: {
        name: "Mercer Career",
        description: "Compensation benchmarking, job architecture, rewards strategy",
        strengths: ["Market-leading compensation data", "Global pay benchmarking", "Benefits consulting"],
        limitations: ["Less leadership development depth", "Transactional focus on surveys", "Limited assessment integration"]
      },
      ASSESS: {
        name: "Mercer | Mettl",
        description: "Assessment platform and psychometric testing",
        strengths: ["Digital assessment platform", "High volume capability"],
        limitations: ["Less executive assessment depth", "Acquired platform vs. proprietary IP", "Limited success profile methodology"]
      }
    }
  },
  {
    id: "egon_zehnder",
    name: "Egon Zehnder",
    shortName: "Egon Zehnder",
    category: "executive_search",
    website: "egonzehnder.com",
    description: "Executive search and leadership advisory firm",
    solutionAreas: ["ASSESS", "DEVELOP"],
    offerings: {
      ASSESS: {
        name: "Leadership Advisory",
        description: "Executive assessment, board assessment, succession planning",
        strengths: ["Executive relationship depth", "Board-level credibility", "Search integration"],
        limitations: ["Narrower solution set", "Less scalable assessment", "Limited analytics depth"]
      },
      DEVELOP: {
        name: "Executive Development",
        description: "CEO and executive coaching and development",
        strengths: ["Senior executive focus", "Coaching network"],
        limitations: ["Less programmatic L&D", "Smaller scale capability", "Less measurement rigor"]
      }
    }
  },
  {
    id: "heidrick",
    name: "Heidrick & Struggles",
    shortName: "Heidrick",
    category: "executive_search",
    website: "heidrick.com",
    description: "Executive search and leadership consulting firm",
    solutionAreas: ["ASSESS", "DEVELOP"],
    offerings: {
      ASSESS: {
        name: "Heidrick Consulting",
        description: "Leadership assessment and culture advisory",
        strengths: ["Search integration", "CEO/board relationships", "Culture assessment tools"],
        limitations: ["Smaller consulting practice", "Less depth in programmatic assessment", "Limited reward/commercial expertise"]
      },
      DEVELOP: {
        name: "Leadership Development",
        description: "Executive coaching and team effectiveness",
        strengths: ["Executive access", "Team coaching"],
        limitations: ["Less scalable programs", "Limited measurement", "Smaller faculty network"]
      }
    }
  },
  {
    id: "shl",
    name: "SHL",
    shortName: "SHL",
    category: "hrtech",
    website: "shl.com",
    description: "Talent measurement and assessment technology provider",
    solutionAreas: ["ASSESS", "ANALYTICS"],
    offerings: {
      ASSESS: {
        name: "SHL Talent Assessment",
        description: "Psychometric assessments, cognitive tests, situational judgment",
        strengths: ["Large assessment library", "Strong normative data", "Technology platform"],
        limitations: ["Product-focused vs. consulting", "Less strategic advisory", "Limited development integration"]
      },
      ANALYTICS: {
        name: "SHL TalentCentral",
        description: "Assessment platform with analytics",
        strengths: ["Technology at scale", "AI-enhanced assessments"],
        limitations: ["Less consulting depth", "Platform vs. advisory model", "Limited org transformation capability"]
      }
    }
  },
  {
    id: "gallup",
    name: "Gallup",
    shortName: "Gallup",
    category: "boutique",
    website: "gallup.com",
    description: "Analytics and advice firm focused on engagement and strengths",
    solutionAreas: ["DEVELOP", "ANALYTICS"],
    offerings: {
      DEVELOP: {
        name: "CliftonStrengths",
        description: "Strengths-based development and team building",
        strengths: ["Strong brand recognition", "Simple methodology", "Large coach network"],
        limitations: ["Narrow focus on strengths", "Less comprehensive L&D", "Limited leadership assessment depth"]
      },
      ANALYTICS: {
        name: "Gallup Q12 Engagement",
        description: "Employee engagement surveys and analytics",
        strengths: ["Industry benchmark", "Research credibility", "Simple metrics"],
        limitations: ["Narrow engagement focus", "Less predictive analytics", "Limited talent assessment integration"]
      }
    }
  },
  {
    id: "bts",
    name: "BTS",
    shortName: "BTS",
    category: "boutique",
    website: "bts.com",
    description: "Strategy execution and leadership development firm",
    solutionAreas: ["DEVELOP", "COMMERCIAL"],
    offerings: {
      DEVELOP: {
        name: "BTS Leadership Programs",
        description: "Experiential learning and business simulations",
        strengths: ["Business simulation expertise", "Strategy alignment", "Custom programs"],
        limitations: ["Less assessment depth", "Limited succession planning", "Smaller global footprint"]
      },
      COMMERCIAL: {
        name: "Sales Transformation",
        description: "Sales effectiveness and commercial capability",
        strengths: ["Business simulation", "Sales training expertise"],
        limitations: ["Less assessment integration", "Limited reward expertise", "Smaller delivery network"]
      }
    }
  }
];

// Korn Ferry's key differentiators
export const KORN_FERRY_DIFFERENTIATORS: KornFerryDifferentiator[] = [
  {
    id: "four-dimensions",
    title: "Four Dimensions of Leadership & Professional Success",
    description: "Proprietary framework integrating competencies, traits, drivers, and experiences - validated across 70+ million assessments",
    proofPoints: [
      "Based on 70+ million leadership assessments",
      "Predictive validity proven across 4,000+ studies",
      "Integrates personality, cognitive ability, and behavioral competencies",
      "Connected to business outcomes through validated research"
    ],
    relevantSolutionAreas: ["ASSESS", "DEVELOP"],
    competitiveAdvantageVs: ["shl", "gallup", "egon_zehnder", "heidrick", "mercer"]
  },
  {
    id: "success-profiles",
    title: "Success Profiles Methodology",
    description: "Data-driven role profiling that defines what great looks like at every level - beyond generic competency models",
    proofPoints: [
      "Benchmarked against 4+ million role profiles",
      "Links role requirements to organizational strategy",
      "Integrates with hiring, development, and succession",
      "Predictively valid for performance outcomes"
    ],
    relevantSolutionAreas: ["ASSESS", "DEVELOP", "TRANSFORM"],
    competitiveAdvantageVs: ["mckinsey", "deloitte", "mercer", "shl"]
  },
  {
    id: "pay-data",
    title: "World's Largest Compensation Database",
    description: "Compensation data covering 30+ million incumbents across 25,000 organizations in 150+ countries",
    proofPoints: [
      "30+ million incumbents in database",
      "25,000+ participating organizations",
      "150+ countries covered",
      "Real-time market intelligence"
    ],
    relevantSolutionAreas: ["REWARD"],
    competitiveAdvantageVs: ["deloitte", "mckinsey"]
  },
  {
    id: "integrated-solutions",
    title: "End-to-End Talent Lifecycle Integration",
    description: "Unique ability to connect assessment, development, succession, and rewards into coherent talent strategy",
    proofPoints: [
      "Single platform connecting all talent processes",
      "Data flows between hiring, development, and succession",
      "Consistent competency language across solutions",
      "Unified analytics and reporting"
    ],
    relevantSolutionAreas: ["ASSESS", "DEVELOP", "TRANSFORM", "REWARD", "ANALYTICS"],
    competitiveAdvantageVs: ["mckinsey", "deloitte", "egon_zehnder", "heidrick", "gallup", "bts"]
  },
  {
    id: "kf-listen",
    title: "KF Listen - Real-time Employee Insights",
    description: "Continuous listening platform that captures employee sentiment and links it to business outcomes",
    proofPoints: [
      "AI-powered sentiment analysis",
      "Links engagement to turnover risk",
      "Predictive analytics for retention",
      "Actionable manager dashboards"
    ],
    relevantSolutionAreas: ["ANALYTICS", "DEVELOP"],
    competitiveAdvantageVs: ["gallup", "deloitte"]
  },
  {
    id: "kf-sell",
    title: "KF Sell - Commercial Excellence",
    description: "Comprehensive sales effectiveness solution combining assessment, training, and methodology",
    proofPoints: [
      "Proven ROI in 500+ sales transformations",
      "Integration with CRM and sales analytics",
      "Proprietary sales competency framework",
      "End-to-end from hiring to development to compensation"
    ],
    relevantSolutionAreas: ["COMMERCIAL"],
    competitiveAdvantageVs: ["bts", "deloitte", "mckinsey"]
  },
  {
    id: "ai-ready-leader",
    title: "AI-Ready Leader Development",
    description: "Purpose-built programs to prepare leaders for Human+AI collaboration and ethical AI governance",
    proofPoints: [
      "Developed with latest AI research",
      "Focuses on AI literacy AND ethical judgment",
      "Practical AI adoption frameworks",
      "Integrated with leadership assessment"
    ],
    relevantSolutionAreas: ["DEVELOP"],
    competitiveAdvantageVs: ["mckinsey", "deloitte", "bts", "gallup"]
  }
];

// Solution area competitive comparisons
export const COMPETITIVE_COMPARISONS: CompetitorComparison[] = [
  {
    solutionArea: "ASSESS",
    kornFerryStrengths: [
      "Four Dimensions framework validated on 70M+ assessments",
      "Success Profiles methodology linking roles to strategy",
      "Executive assessment with search legacy",
      "Full integration with development and succession"
    ],
    competitorWeaknesses: {
      "shl": ["Product-centric vs. consulting model", "Limited strategic advisory", "No development integration"],
      "mercer": ["Acquired assessment platform", "Limited executive depth", "Transactional focus"],
      "egon_zehnder": ["Narrower solution set", "Less scalable", "Limited analytics"],
      "heidrick": ["Smaller consulting practice", "Less programmatic capability"]
    },
    battleCards: [
      {
        scenario: "Client wants high-volume assessment for early-career hiring",
        kornFerryResponse: "Combine Korn Ferry Assess with Success Profiles to ensure assessments predict job success, not just test scores. Show ROI through quality-of-hire tracking.",
        winTheme: "Predictive validity and business outcomes"
      },
      {
        scenario: "Client considering SHL for cost reasons",
        kornFerryResponse: "Highlight that assessment is only valuable if it predicts performance. Show our validation studies and offer to prove ROI through a pilot with measurable outcomes.",
        winTheme: "Business impact over cost-per-assessment"
      }
    ]
  },
  {
    solutionArea: "DEVELOP",
    kornFerryStrengths: [
      "Assessment-led development with personalized journeys",
      "World's largest leadership development faculty",
      "Business impact measurement methodology",
      "AI-Ready Leader capability"
    ],
    competitorWeaknesses: {
      "mckinsey": ["Limited proprietary assessment", "Generalist approach", "Less measurement rigor"],
      "gallup": ["Narrow strengths focus", "Limited leadership depth", "No succession integration"],
      "bts": ["Less assessment depth", "Limited succession planning", "Smaller footprint"],
      "egon_zehnder": ["Less programmatic L&D", "Smaller scale", "Limited measurement"]
    },
    battleCards: [
      {
        scenario: "Client wants McKinsey for leadership development",
        kornFerryResponse: "Acknowledge McKinsey's strategy credibility, then position our differentiated assessment-led approach that creates personalized development journeys with measurable behavior change.",
        winTheme: "Personalization and measurement"
      },
      {
        scenario: "Client considering Gallup for engagement and development",
        kornFerryResponse: "Strengths are important but insufficient. Show how our Four Dimensions approach provides a more complete picture of leadership potential and development needs.",
        winTheme: "Comprehensive vs. one-dimensional"
      }
    ]
  },
  {
    solutionArea: "TRANSFORM",
    kornFerryStrengths: [
      "Integration of organization design with talent strategy",
      "M&A expertise with cultural integration",
      "Workforce planning with analytics",
      "Change leadership development"
    ],
    competitorWeaknesses: {
      "mckinsey": ["Less depth in talent", "Higher cost", "More strategy than implementation"],
      "deloitte": ["More technology-focused", "Less people expertise", "Variable consultant quality"]
    },
    battleCards: [
      {
        scenario: "Client wants McKinsey for operating model redesign",
        kornFerryResponse: "Acknowledge McKinsey's strategy capability, but highlight that org design fails without the right talent strategy. Position our integrated approach combining structure with capability building.",
        winTheme: "Structure + Talent integration"
      },
      {
        scenario: "Client considering Deloitte for M&A integration",
        kornFerryResponse: "Deloitte excels at systems integration. For people integration - cultural alignment, leadership retention, capability transfer - our expertise in assessment and culture is unmatched.",
        winTheme: "People-focused M&A success"
      }
    ]
  },
  {
    solutionArea: "REWARD",
    kornFerryStrengths: [
      "World's largest compensation database (30M+ incumbents)",
      "Total Rewards Optimization methodology",
      "Pay equity expertise with analytics",
      "Integration with job architecture and success profiles"
    ],
    competitorWeaknesses: {
      "mercer": ["Transactional survey focus", "Less strategic advisory", "Limited assessment integration"],
      "deloitte": ["Smaller pay database", "Less specialized expertise", "More technology focus"]
    },
    battleCards: [
      {
        scenario: "Client wants Mercer for compensation benchmarking",
        kornFerryResponse: "Acknowledge Mercer's data, but highlight our Total Rewards Optimization approach that maximizes perceived employee value per dollar spent, not just market positioning.",
        winTheme: "Strategic optimization over benchmarking"
      },
      {
        scenario: "Client needs pay equity analysis",
        kornFerryResponse: "Our pay equity methodology combines the world's largest database with job architecture expertise. We don't just identify gaps - we help fix root causes in job structures and practices.",
        winTheme: "Root cause analysis and sustainable solutions"
      }
    ]
  },
  {
    solutionArea: "COMMERCIAL",
    kornFerryStrengths: [
      "End-to-end sales transformation capability",
      "Assessment integration for sales hiring",
      "Sales compensation expertise",
      "Proven ROI methodology"
    ],
    competitorWeaknesses: {
      "bts": ["Less assessment integration", "Limited reward expertise", "Smaller network"],
      "deloitte": ["Less sales-specific expertise", "Technology focus over behavior"]
    },
    battleCards: [
      {
        scenario: "Client considering BTS for sales training",
        kornFerryResponse: "Training alone doesn't transform sales. Show how KF Sell integrates assessment (hire better), development (build capability), and compensation (motivate right behaviors) for sustainable sales improvement.",
        winTheme: "Integrated transformation over training"
      }
    ]
  },
  {
    solutionArea: "ANALYTICS",
    kornFerryStrengths: [
      "Talent analytics connected to business outcomes",
      "Predictive models validated on our assessment data",
      "Turnover risk and succession analytics",
      "Integration with KF Listen and broader data"
    ],
    competitorWeaknesses: {
      "deloitte": ["Less behavioral science", "Technology platform focus", "Fewer validity studies"],
      "gallup": ["Narrow engagement focus", "Less predictive analytics", "Limited assessment data"],
      "shl": ["Platform vs. advisory", "Limited consulting depth"]
    },
    battleCards: [
      {
        scenario: "Client wants people analytics platform",
        kornFerryResponse: "Analytics without action is just reporting. Show how our analytics are connected to interventions - assessment, development, succession - so insights translate to impact.",
        winTheme: "Insights to action"
      }
    ]
  }
];

// Helper functions for competitive intelligence
export function getCompetitorsBySolutionArea(solutionArea: string): Competitor[] {
  return COMPETITORS.filter(c => c.solutionAreas.includes(solutionArea));
}

export function getCompetitorById(id: string): Competitor | undefined {
  return COMPETITORS.find(c => c.id === id);
}

export function getDifferentiatorsBySolutionArea(solutionArea: string): KornFerryDifferentiator[] {
  return KORN_FERRY_DIFFERENTIATORS.filter(d => d.relevantSolutionAreas.includes(solutionArea));
}

export function getDifferentiatorsVsCompetitor(competitorId: string): KornFerryDifferentiator[] {
  return KORN_FERRY_DIFFERENTIATORS.filter(d => d.competitiveAdvantageVs.includes(competitorId));
}

export function getCompetitiveComparison(solutionArea: string): CompetitorComparison | undefined {
  return COMPETITIVE_COMPARISONS.find(c => c.solutionArea === solutionArea);
}

export function getCompetitorSummary(): string {
  return COMPETITORS.map(c => 
    `${c.name} (${c.category}): Competes in ${c.solutionAreas.join(", ")}`
  ).join("\n");
}

// ============================================================================
// KPI LIBRARY - Measurable outcomes with KF success story mappings
// ============================================================================

export interface KFSuccessStory {
  id: string;
  title: string;
  client: string; // Anonymized or public client name
  industry: string;
  metric: string; // The measurable result
  description: string;
  year: number;
  solutionUsed: string; // KF solution/product used
}

export interface KpiDefinition {
  id: string;
  name: string;
  category: "leadership" | "talent_acquisition" | "employee_experience" | "sales" | "organizational" | "rewards";
  description: string;
  metricType: "percentage" | "score" | "days" | "ratio" | "currency" | "count";
  typicalBaseline: string;
  industryBenchmark: string;
  stretchTarget: string;
  kornFerryProven: boolean;
  successStoryIds: string[]; // Links to KF success stories
  relevantSolutionAreas: string[];
  calculationHint: string;
}

export interface OutcomeDefinition {
  id: string;
  name: string;
  description: string;
  linkedKpiIds: string[]; // Which KPIs this outcome drives
  kornFerryProven: boolean;
  successStoryIds: string[];
  relevantSolutionAreas: string[];
  kfCapability: string; // Which KF product/service delivers this
  impactStatement: string; // What success looks like
}

// Korn Ferry Success Stories - based on real case studies
export const KF_SUCCESS_STORIES: KFSuccessStory[] = [
  {
    id: "healthcare-exec-placement",
    title: "Healthcare Executive Placement Excellence",
    client: "Fortune 100 Healthcare Companies",
    industry: "Healthcare",
    metric: "1,000+ healthcare executives placed with 45% diversity (33% women, 25% POC)",
    description: "Placed over 1,000 healthcare executives in 5 years, serving 12 of Fortune 100 healthcare companies with industry-leading diversity outcomes.",
    year: 2024,
    solutionUsed: "Executive Search"
  },
  {
    id: "rpo-construction",
    title: "Major Construction RPO Transformation",
    client: "Major Construction Company",
    industry: "Construction",
    metric: "44% DE&I hires achieved, 96% offer acceptance rate, 88% hiring manager satisfaction",
    description: "Delivered 1,700+ hires with exceptional diversity outcomes, nearly doubling the client's 25% DE&I target.",
    year: 2024,
    solutionUsed: "RPO"
  },
  {
    id: "allianz-engagement",
    title: "Global Insurance Leader Employee Engagement",
    client: "Allianz (World's Largest Insurance Company)",
    industry: "Insurance",
    metric: "Enhanced team performance through comprehensive engagement measurement",
    description: "Used Korn Ferry Listen technology and consulting expertise to improve employee engagement and team effectiveness.",
    year: 2024,
    solutionUsed: "Korn Ferry Listen"
  },
  {
    id: "state-farm-leadership",
    title: "Mutual Insurance Leadership Pipeline",
    client: "Major Mutual Insurance Company",
    industry: "Insurance",
    metric: "Developed leadership pipeline with improved talent development strategies",
    description: "Used Korn Ferry Assess to build a robust leadership succession pipeline and enhance talent development programs.",
    year: 2024,
    solutionUsed: "Korn Ferry Assess"
  },
  {
    id: "telstra-nps",
    title: "Telecommunications NPS Improvement",
    client: "Major Australian Telecommunications Provider",
    industry: "Telecommunications",
    metric: "Improved NPS scores through customer service training",
    description: "Partnered to provide comprehensive customer service training that directly improved Net Promoter Scores.",
    year: 2024,
    solutionUsed: "Professional Development"
  },
  {
    id: "brenntag-sales",
    title: "Chemical Distribution Sales Transformation",
    client: "Global Chemical & Ingredients Distributor",
    industry: "Chemical Distribution",
    metric: "Implemented consistent global sales processes driving revenue growth",
    description: "Helped implement consistent sales processes across global operations through Korn Ferry Sell methodology.",
    year: 2024,
    solutionUsed: "Korn Ferry Sell"
  },
  {
    id: "imi-sales-culture",
    title: "Engineering Company Sales Culture",
    client: "Global Engineering Company",
    industry: "Engineering",
    metric: "Improved sales processes and built culture of success",
    description: "Transformed sales effectiveness through Korn Ferry Sell, embedding a winning sales culture.",
    year: 2024,
    solutionUsed: "Korn Ferry Sell"
  },
  {
    id: "natwest-talent",
    title: "UK Financial Institution Talent Strategy",
    client: "Major UK Financial Institution",
    industry: "Financial Services",
    metric: "Advanced talent strategy using assessment products",
    description: "Used Korn Ferry Assess products to advance talent strategy and improve leadership selection.",
    year: 2024,
    solutionUsed: "Korn Ferry Assess"
  },
  {
    id: "asml-talent-mgmt",
    title: "Semiconductor Leader Talent Management",
    client: "Global Semiconductor Industry Supplier",
    industry: "Technology",
    metric: "Enabled strong talent management structure",
    description: "Built comprehensive talent management infrastructure for a leading semiconductor supplier.",
    year: 2024,
    solutionUsed: "Talent Management Consulting"
  },
  {
    id: "maersk-transformation",
    title: "Maersk Human-Centric Talent Strategy",
    client: "Maersk",
    industry: "Logistics & Transportation",
    metric: "Transformational talent management strategy opening new business horizons",
    description: "Developed new human-centric talent management strategy transforming the organization.",
    year: 2023,
    solutionUsed: "Organizational Transformation"
  },
  {
    id: "goodyear-ld",
    title: "Tire Company Global L&D Framework",
    client: "Major North American Tire Company",
    industry: "Manufacturing",
    metric: "Integrated global learning and development framework",
    description: "Developed and integrated a global L&D framework for consistent leadership development.",
    year: 2024,
    solutionUsed: "Leadership Development"
  },
  {
    id: "biopharma-rpo",
    title: "Biopharmaceutical Global RPO Partnership",
    client: "Global Biopharmaceutical Company",
    industry: "Healthcare & Life Sciences",
    metric: "Complete recruitment solution with improved talent acquisition",
    description: "Implemented end-to-end recruitment solution improving talent acquisition processes globally.",
    year: 2024,
    solutionUsed: "RPO"
  }
];

// KPI Library - organized by category
export const KPI_LIBRARY: KpiDefinition[] = [
  // Leadership KPIs
  {
    id: "succession-readiness",
    name: "Leadership Succession Readiness",
    category: "leadership",
    description: "Percentage of critical leadership roles with at least one ready-now successor identified and validated",
    metricType: "percentage",
    typicalBaseline: "35%",
    industryBenchmark: "65%",
    stretchTarget: "85%",
    kornFerryProven: true,
    successStoryIds: ["state-farm-leadership", "maersk-transformation"],
    relevantSolutionAreas: ["ASSESS", "DEVELOP"],
    calculationHint: "Ready-now successors / Critical leadership positions × 100"
  },
  {
    id: "leadership-bench-strength",
    name: "Leadership Bench Strength",
    category: "leadership",
    description: "Average number of ready successors per critical leadership role",
    metricType: "ratio",
    typicalBaseline: "0.8",
    industryBenchmark: "1.5",
    stretchTarget: "2.0",
    kornFerryProven: true,
    successStoryIds: ["state-farm-leadership"],
    relevantSolutionAreas: ["ASSESS", "DEVELOP"],
    calculationHint: "Total ready successors / Critical roles"
  },
  {
    id: "hipo-retention",
    name: "High-Potential Retention Rate",
    category: "leadership",
    description: "Percentage of identified high-potential employees retained year-over-year",
    metricType: "percentage",
    typicalBaseline: "75%",
    industryBenchmark: "88%",
    stretchTarget: "95%",
    kornFerryProven: true,
    successStoryIds: ["maersk-transformation"],
    relevantSolutionAreas: ["ASSESS", "DEVELOP", "REWARD"],
    calculationHint: "HiPos retained / HiPos at start of period × 100"
  },
  {
    id: "leadership-effectiveness",
    name: "Leadership Effectiveness Score",
    category: "leadership",
    description: "Average leadership effectiveness rating from 360 assessments or engagement surveys",
    metricType: "score",
    typicalBaseline: "3.2/5",
    industryBenchmark: "3.8/5",
    stretchTarget: "4.2/5",
    kornFerryProven: true,
    successStoryIds: ["goodyear-ld", "state-farm-leadership"],
    relevantSolutionAreas: ["ASSESS", "DEVELOP"],
    calculationHint: "Average of leadership assessment scores"
  },

  // Talent Acquisition KPIs
  {
    id: "time-to-fill",
    name: "Time to Fill Critical Roles",
    category: "talent_acquisition",
    description: "Average number of days to fill critical/leadership positions",
    metricType: "days",
    typicalBaseline: "90 days",
    industryBenchmark: "60 days",
    stretchTarget: "45 days",
    kornFerryProven: true,
    successStoryIds: ["rpo-construction", "biopharma-rpo"],
    relevantSolutionAreas: ["ASSESS"],
    calculationHint: "Average days from requisition open to offer accepted"
  },
  {
    id: "quality-of-hire",
    name: "Quality of Hire Index",
    category: "talent_acquisition",
    description: "Composite score based on new hire performance, retention, and hiring manager satisfaction",
    metricType: "score",
    typicalBaseline: "65/100",
    industryBenchmark: "78/100",
    stretchTarget: "88/100",
    kornFerryProven: true,
    successStoryIds: ["rpo-construction", "healthcare-exec-placement"],
    relevantSolutionAreas: ["ASSESS"],
    calculationHint: "(Performance rating + 1-year retention + HM satisfaction) / 3"
  },
  {
    id: "offer-acceptance",
    name: "Offer Acceptance Rate",
    category: "talent_acquisition",
    description: "Percentage of job offers accepted by candidates",
    metricType: "percentage",
    typicalBaseline: "80%",
    industryBenchmark: "90%",
    stretchTarget: "96%",
    kornFerryProven: true,
    successStoryIds: ["rpo-construction"],
    relevantSolutionAreas: ["ASSESS", "REWARD"],
    calculationHint: "Offers accepted / Offers extended × 100"
  },
  {
    id: "dei-hiring",
    name: "Diversity Hiring Rate",
    category: "talent_acquisition",
    description: "Percentage of new hires from underrepresented groups",
    metricType: "percentage",
    typicalBaseline: "25%",
    industryBenchmark: "38%",
    stretchTarget: "45%",
    kornFerryProven: true,
    successStoryIds: ["rpo-construction", "healthcare-exec-placement"],
    relevantSolutionAreas: ["ASSESS"],
    calculationHint: "Diverse hires / Total hires × 100"
  },

  // Employee Experience KPIs
  {
    id: "engagement-score",
    name: "Employee Engagement Score",
    category: "employee_experience",
    description: "Overall employee engagement measured through validated survey",
    metricType: "score",
    typicalBaseline: "62/100",
    industryBenchmark: "72/100",
    stretchTarget: "82/100",
    kornFerryProven: true,
    successStoryIds: ["allianz-engagement"],
    relevantSolutionAreas: ["DEVELOP", "REWARD"],
    calculationHint: "Aggregate engagement survey score"
  },
  {
    id: "enps",
    name: "Employee Net Promoter Score (eNPS)",
    category: "employee_experience",
    description: "Likelihood of employees recommending the organization as a place to work",
    metricType: "score",
    typicalBaseline: "+15",
    industryBenchmark: "+35",
    stretchTarget: "+50",
    kornFerryProven: true,
    successStoryIds: ["allianz-engagement"],
    relevantSolutionAreas: ["DEVELOP", "REWARD"],
    calculationHint: "% Promoters - % Detractors"
  },
  {
    id: "voluntary-turnover",
    name: "Voluntary Turnover Rate",
    category: "employee_experience",
    description: "Percentage of employees who voluntarily leave the organization annually",
    metricType: "percentage",
    typicalBaseline: "18%",
    industryBenchmark: "12%",
    stretchTarget: "8%",
    kornFerryProven: true,
    successStoryIds: ["allianz-engagement", "maersk-transformation"],
    relevantSolutionAreas: ["DEVELOP", "REWARD"],
    calculationHint: "Voluntary departures / Average headcount × 100"
  },

  // Sales KPIs
  {
    id: "sales-win-rate",
    name: "Sales Win Rate",
    category: "sales",
    description: "Percentage of qualified opportunities converted to closed-won deals",
    metricType: "percentage",
    typicalBaseline: "22%",
    industryBenchmark: "35%",
    stretchTarget: "45%",
    kornFerryProven: true,
    successStoryIds: ["brenntag-sales", "imi-sales-culture"],
    relevantSolutionAreas: ["COMMERCIAL"],
    calculationHint: "Closed-won / (Closed-won + Closed-lost) × 100"
  },
  {
    id: "revenue-per-seller",
    name: "Revenue per Seller",
    category: "sales",
    description: "Average revenue generated per sales representative",
    metricType: "currency",
    typicalBaseline: "Varies by industry",
    industryBenchmark: "Top quartile performance",
    stretchTarget: "+25% improvement",
    kornFerryProven: true,
    successStoryIds: ["brenntag-sales", "imi-sales-culture"],
    relevantSolutionAreas: ["COMMERCIAL"],
    calculationHint: "Total revenue / Number of sellers"
  },
  {
    id: "sales-cycle-length",
    name: "Sales Cycle Length",
    category: "sales",
    description: "Average number of days from opportunity creation to close",
    metricType: "days",
    typicalBaseline: "120 days",
    industryBenchmark: "90 days",
    stretchTarget: "75 days",
    kornFerryProven: true,
    successStoryIds: ["brenntag-sales"],
    relevantSolutionAreas: ["COMMERCIAL"],
    calculationHint: "Average days from opportunity open to close"
  },

  // Organizational KPIs
  {
    id: "productivity-index",
    name: "Workforce Productivity Index",
    category: "organizational",
    description: "Revenue or output per full-time equivalent employee",
    metricType: "currency",
    typicalBaseline: "Industry baseline",
    industryBenchmark: "Top quartile",
    stretchTarget: "+15% improvement",
    kornFerryProven: true,
    successStoryIds: ["maersk-transformation", "asml-talent-mgmt"],
    relevantSolutionAreas: ["TRANSFORM", "ANALYTICS"],
    calculationHint: "Revenue / FTE count"
  },
  {
    id: "customer-nps",
    name: "Customer Net Promoter Score",
    category: "organizational",
    description: "Customer likelihood to recommend products/services",
    metricType: "score",
    typicalBaseline: "+20",
    industryBenchmark: "+40",
    stretchTarget: "+55",
    kornFerryProven: true,
    successStoryIds: ["telstra-nps"],
    relevantSolutionAreas: ["DEVELOP", "TRANSFORM"],
    calculationHint: "% Promoters - % Detractors"
  },
  {
    id: "manager-effectiveness",
    name: "Manager Effectiveness Score",
    category: "organizational",
    description: "Employee ratings of their direct manager's effectiveness",
    metricType: "score",
    typicalBaseline: "3.4/5",
    industryBenchmark: "4.0/5",
    stretchTarget: "4.3/5",
    kornFerryProven: true,
    successStoryIds: ["goodyear-ld", "allianz-engagement"],
    relevantSolutionAreas: ["DEVELOP"],
    calculationHint: "Average manager effectiveness survey score"
  },

  // Rewards KPIs
  {
    id: "pay-equity-gap",
    name: "Pay Equity Gap",
    category: "rewards",
    description: "Unexplained pay gap between demographic groups after controlling for legitimate factors",
    metricType: "percentage",
    typicalBaseline: "5-8%",
    industryBenchmark: "<3%",
    stretchTarget: "<1%",
    kornFerryProven: true,
    successStoryIds: [],
    relevantSolutionAreas: ["REWARD"],
    calculationHint: "Regression-adjusted pay gap"
  },
  {
    id: "comp-competitiveness",
    name: "Compensation Competitiveness Ratio",
    category: "rewards",
    description: "How pay compares to market median for comparable roles",
    metricType: "percentage",
    typicalBaseline: "95%",
    industryBenchmark: "100%",
    stretchTarget: "105%",
    kornFerryProven: true,
    successStoryIds: [],
    relevantSolutionAreas: ["REWARD"],
    calculationHint: "Average actual pay / Market median pay × 100"
  }
];

// Outcome definitions - what actions drive KPI improvements
export const OUTCOME_LIBRARY: OutcomeDefinition[] = [
  // Leadership Outcomes
  {
    id: "build-succession-pipeline",
    name: "Build Leadership Succession Pipeline",
    description: "Identify, assess, and develop ready successors for all critical leadership roles",
    linkedKpiIds: ["succession-readiness", "leadership-bench-strength", "hipo-retention"],
    kornFerryProven: true,
    successStoryIds: ["state-farm-leadership", "healthcare-exec-placement"],
    relevantSolutionAreas: ["ASSESS", "DEVELOP"],
    kfCapability: "Korn Ferry Assess + Succession Planning",
    impactStatement: "Organizations with strong succession pipelines are 2.5x more likely to outperform peers"
  },
  {
    id: "assess-leadership-potential",
    name: "Assess Leadership Potential at Scale",
    description: "Use validated assessments to identify high-potential leaders across the organization",
    linkedKpiIds: ["succession-readiness", "leadership-bench-strength", "quality-of-hire"],
    kornFerryProven: true,
    successStoryIds: ["state-farm-leadership", "natwest-talent"],
    relevantSolutionAreas: ["ASSESS"],
    kfCapability: "Korn Ferry Assess - Four Dimensions",
    impactStatement: "Based on 70M+ leadership assessments with proven predictive validity"
  },
  {
    id: "accelerate-leader-development",
    name: "Accelerate Leader Development",
    description: "Deploy targeted development programs for emerging and senior leaders",
    linkedKpiIds: ["leadership-effectiveness", "hipo-retention", "engagement-score"],
    kornFerryProven: true,
    successStoryIds: ["goodyear-ld", "maersk-transformation"],
    relevantSolutionAreas: ["DEVELOP"],
    kfCapability: "Leadership Development Programs",
    impactStatement: "Integrated L&D frameworks drive 23% higher leadership effectiveness scores"
  },
  {
    id: "executive-coaching",
    name: "Deploy Executive Coaching",
    description: "One-on-one coaching for senior leaders to accelerate performance and transition",
    linkedKpiIds: ["leadership-effectiveness", "hipo-retention"],
    kornFerryProven: true,
    successStoryIds: ["state-farm-leadership"],
    relevantSolutionAreas: ["DEVELOP"],
    kfCapability: "Executive Coaching",
    impactStatement: "Executive coaching delivers 5-7x ROI through improved leader performance"
  },

  // Talent Acquisition Outcomes
  {
    id: "implement-rpo",
    name: "Implement RPO Solution",
    description: "Partner with Korn Ferry for end-to-end recruitment process outsourcing",
    linkedKpiIds: ["time-to-fill", "quality-of-hire", "offer-acceptance", "dei-hiring"],
    kornFerryProven: true,
    successStoryIds: ["rpo-construction", "biopharma-rpo"],
    relevantSolutionAreas: ["ASSESS"],
    kfCapability: "Recruitment Process Outsourcing",
    impactStatement: "Korn Ferry RPO: #1 ranked by HRO Today, 96% offer acceptance rates"
  },
  {
    id: "reduce-hiring-bias",
    name: "Reduce Bias in Hiring Decisions",
    description: "Implement structured assessments and training to minimize unconscious bias",
    linkedKpiIds: ["dei-hiring", "quality-of-hire"],
    kornFerryProven: true,
    successStoryIds: ["rpo-construction", "healthcare-exec-placement"],
    relevantSolutionAreas: ["ASSESS"],
    kfCapability: "Korn Ferry Assess + Inclusive Hiring Training",
    impactStatement: "44% DE&I hires achieved vs 25% target through structured assessment"
  },
  {
    id: "executive-search",
    name: "Executive Search for Critical Roles",
    description: "Leverage Korn Ferry's executive search for C-suite and senior leadership hires",
    linkedKpiIds: ["time-to-fill", "quality-of-hire", "dei-hiring"],
    kornFerryProven: true,
    successStoryIds: ["healthcare-exec-placement"],
    relevantSolutionAreas: ["ASSESS"],
    kfCapability: "Executive Search",
    impactStatement: "Forbes #1 America's Best Executive Recruiter 2024"
  },

  // Employee Experience Outcomes
  {
    id: "measure-engagement",
    name: "Implement Continuous Engagement Listening",
    description: "Deploy Korn Ferry Listen for real-time employee engagement measurement and action",
    linkedKpiIds: ["engagement-score", "enps", "voluntary-turnover"],
    kornFerryProven: true,
    successStoryIds: ["allianz-engagement"],
    relevantSolutionAreas: ["DEVELOP"],
    kfCapability: "Korn Ferry Listen",
    impactStatement: "World's largest insurance company enhanced team performance through Listen"
  },
  {
    id: "manager-development",
    name: "Develop People Manager Capability",
    description: "Train managers on employee engagement, coaching, and performance conversations",
    linkedKpiIds: ["manager-effectiveness", "engagement-score", "voluntary-turnover"],
    kornFerryProven: true,
    successStoryIds: ["goodyear-ld", "allianz-engagement"],
    relevantSolutionAreas: ["DEVELOP"],
    kfCapability: "First-Line Essentials + Manager Development",
    impactStatement: "Effective managers are the #1 driver of employee engagement"
  },
  {
    id: "culture-transformation",
    name: "Drive Culture Transformation",
    description: "Align organizational culture with strategy through assessment and targeted interventions",
    linkedKpiIds: ["engagement-score", "voluntary-turnover", "productivity-index"],
    kornFerryProven: true,
    successStoryIds: ["maersk-transformation"],
    relevantSolutionAreas: ["TRANSFORM"],
    kfCapability: "Culture Shaping",
    impactStatement: "Human-centric talent strategy opens new business horizons"
  },

  // Sales Outcomes
  {
    id: "sales-methodology",
    name: "Implement Strategic Sales Methodology",
    description: "Deploy Korn Ferry Sell with Miller Heiman methodology for consistent sales execution",
    linkedKpiIds: ["sales-win-rate", "revenue-per-seller", "sales-cycle-length"],
    kornFerryProven: true,
    successStoryIds: ["brenntag-sales", "imi-sales-culture"],
    relevantSolutionAreas: ["COMMERCIAL"],
    kfCapability: "Korn Ferry Sell",
    impactStatement: "AI-enabled Blue Sheet methodology proven to improve win rates"
  },
  {
    id: "sales-culture",
    name: "Build High-Performance Sales Culture",
    description: "Transform sales organization culture through coaching, incentives, and capability building",
    linkedKpiIds: ["sales-win-rate", "revenue-per-seller"],
    kornFerryProven: true,
    successStoryIds: ["imi-sales-culture", "brenntag-sales"],
    relevantSolutionAreas: ["COMMERCIAL"],
    kfCapability: "Sales Transformation Consulting",
    impactStatement: "Consistent global sales processes driving revenue growth"
  },
  {
    id: "sales-talent-assessment",
    name: "Assess and Hire Top Sales Talent",
    description: "Use validated assessments to identify and hire salespeople with success DNA",
    linkedKpiIds: ["sales-win-rate", "revenue-per-seller", "quality-of-hire"],
    kornFerryProven: true,
    successStoryIds: [],
    relevantSolutionAreas: ["ASSESS", "COMMERCIAL"],
    kfCapability: "Sales Assessment + Korn Ferry Assess",
    impactStatement: "Top performers outsell average performers by 2x - assessment identifies them"
  },

  // Organizational Outcomes
  {
    id: "customer-service-training",
    name: "Elevate Customer Service Capability",
    description: "Train frontline teams on customer service excellence to drive NPS",
    linkedKpiIds: ["customer-nps", "engagement-score"],
    kornFerryProven: true,
    successStoryIds: ["telstra-nps"],
    relevantSolutionAreas: ["DEVELOP"],
    kfCapability: "Service Ready™ Solutions",
    impactStatement: "Customer service training directly improved NPS scores"
  },
  {
    id: "org-design",
    name: "Optimize Organization Design",
    description: "Redesign organization structure to align with strategy and improve effectiveness",
    linkedKpiIds: ["productivity-index", "engagement-score"],
    kornFerryProven: true,
    successStoryIds: ["maersk-transformation", "asml-talent-mgmt"],
    relevantSolutionAreas: ["TRANSFORM"],
    kfCapability: "Organization Strategy",
    impactStatement: "Right structure enables 20%+ productivity improvement"
  },
  {
    id: "workforce-planning",
    name: "Strategic Workforce Planning",
    description: "Build data-driven workforce plans aligned with business strategy",
    linkedKpiIds: ["productivity-index", "time-to-fill", "succession-readiness"],
    kornFerryProven: true,
    successStoryIds: ["asml-talent-mgmt"],
    relevantSolutionAreas: ["ANALYTICS", "TRANSFORM"],
    kfCapability: "Workforce Planning + Korn Ferry Intelligence Cloud",
    impactStatement: "Proactive workforce planning reduces talent gaps by 40%"
  },

  // Rewards Outcomes
  {
    id: "pay-equity-analysis",
    name: "Conduct Pay Equity Analysis",
    description: "Analyze and remediate unexplained pay gaps across demographic groups",
    linkedKpiIds: ["pay-equity-gap", "engagement-score"],
    kornFerryProven: true,
    successStoryIds: [],
    relevantSolutionAreas: ["REWARD"],
    kfCapability: "Pay Equity Consulting",
    impactStatement: "World's largest compensation database enables precise equity analysis"
  },
  {
    id: "total-rewards-optimization",
    name: "Optimize Total Rewards Strategy",
    description: "Maximize perceived employee value per compensation dollar spent",
    linkedKpiIds: ["comp-competitiveness", "voluntary-turnover", "engagement-score"],
    kornFerryProven: true,
    successStoryIds: [],
    relevantSolutionAreas: ["REWARD"],
    kfCapability: "Total Rewards Optimization",
    impactStatement: "Strategic rewards drive 15% higher retention at same cost"
  }
];

// Helper functions for KPI and Outcome lookups
export function getKpisByCategory(category: KpiDefinition["category"]): KpiDefinition[] {
  return KPI_LIBRARY.filter(k => k.category === category);
}

export function getKpiById(id: string): KpiDefinition | undefined {
  return KPI_LIBRARY.find(k => k.id === id);
}

export function getKpisForSolutionArea(solutionArea: string): KpiDefinition[] {
  return KPI_LIBRARY.filter(k => k.relevantSolutionAreas.includes(solutionArea));
}

export function getOutcomesForKpi(kpiId: string): OutcomeDefinition[] {
  return OUTCOME_LIBRARY.filter(o => o.linkedKpiIds.includes(kpiId));
}

export function getOutcomeById(id: string): OutcomeDefinition | undefined {
  return OUTCOME_LIBRARY.find(o => o.id === id);
}

export function getSuccessStoryById(id: string): KFSuccessStory | undefined {
  return KF_SUCCESS_STORIES.find(s => s.id === id);
}

export function getKpiCategories(): Array<{ id: KpiDefinition["category"]; label: string }> {
  return [
    { id: "leadership", label: "Leadership & Succession" },
    { id: "talent_acquisition", label: "Talent Acquisition" },
    { id: "employee_experience", label: "Employee Experience" },
    { id: "sales", label: "Sales Performance" },
    { id: "organizational", label: "Organizational Effectiveness" },
    { id: "rewards", label: "Rewards & Compensation" }
  ];
}
