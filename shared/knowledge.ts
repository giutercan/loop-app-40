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
