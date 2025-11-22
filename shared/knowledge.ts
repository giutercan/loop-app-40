// Korn Ferry Knowledge Structure with Detailed KPI Metadata and Calculation Framework

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
