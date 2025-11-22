export const KORN_FERRY_SOLUTIONS = {
  ASSESS: {
    name: "ASSESS",
    title: "Success Profiles & Standardised Assessments",
    description: "Create the data spine for hiring, promotion and development",
    capabilities: [
      {
        name: "Success Profiles & Role Design",
        jobs: "Define what 'good' looks like for each role, align roles to strategy, anchor selection/promotion, support workforce planning, feed digital profiles",
        primaryKPI: {
          name: "Quality of Hire at 6 months (QoH6)",
          description: "Composite index (0–100) combining objective performance (50%), manager rating (30%) and retention (20%)",
          type: "index"
        },
        supportingKPIs: [
          { name: "Time to Productivity", unit: "days" },
          { name: "Hiring Manager Satisfaction", unit: "1–5 scale" }
        ]
      },
      {
        name: "Standardised Assessments & Assessments at Scale",
        jobs: "Objectively measure capability, scale delivery, provide norms, integrate into workflows, ensure Responsible AI",
        primaryKPI: {
          name: "Predictive Validity (AUC or correlation r)",
          description: "Statistical link between assessment score and job performance/retention",
          type: "correlation"
        },
        supportingKPIs: [
          { name: "Assessment Completion Rate", unit: "%" },
          { name: "Time to Offer", unit: "days" }
        ]
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
        jobs: "Build leaders who deliver outcomes, change behaviour, link learning to business KPIs, develop succession, measure programmes",
        primaryKPI: {
          name: "Business KPI Delta",
          description: "Change in business metrics attributable to participants (e.g., revenue per team % change, productivity per FTE change)",
          type: "percentage"
        },
        supportingKPIs: [
          { name: "Competency Gain", unit: "assessment/360 delta" },
          { name: "Behavioural Application Rate", unit: "% applying skill on job" }
        ]
      },
      {
        name: "AI-Ready Leader",
        jobs: "Prepare leaders for Human+AI decisions, build AI literacy, set governance, increase speed and quality of data-driven decisions",
        primaryKPI: {
          name: "AI Readiness Index or Decision Lead Time",
          description: "AI Readiness (0–100) or Decision Lead Time (hours) for representative decisions",
          type: "composite"
        },
        supportingKPIs: [
          { name: "AI Adoption Rate", unit: "% decisions aided" },
          { name: "Ethical compliance score/incidents", unit: "score or count" }
        ]
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
        jobs: "Redesign operating models, deliver capability for large transformation, align people/processes, unlock cost savings or revenue capacity",
        primaryKPI: {
          name: "Productivity per FTE",
          description: "Or Process Cycle Time for process improvements",
          type: "ratio"
        },
        supportingKPIs: [
          { name: "Cost per unit", unit: "currency" },
          { name: "Error / Rework Rate", unit: "%" }
        ]
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
        jobs: "Maximise perceived employee value per employer £, rebalance spend, model cost vs perceived value, align rewards to EVP and segments",
        primaryKPI: {
          name: "Perceived Employee Value per £ Spend",
          description: "Or Retention Rate for Priority Cohorts (%)",
          type: "composite"
        },
        supportingKPIs: [
          { name: "Take-up Rate", unit: "%" },
          { name: "Cost per Employee", unit: "£" }
        ]
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
        jobs: "Raise win rates, deal size, pipeline velocity, seller productivity and embed methodology/tech",
        primaryKPI: {
          name: "Win Rate",
          description: "Percentage point change in win rate",
          type: "percentage"
        },
        supportingKPIs: [
          { name: "Average Deal Size", unit: "£" },
          { name: "Pipeline Velocity", unit: "days or conversion rate" }
        ]
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
        jobs: "Identify drivers of engagement/performance/turnover, build predictive models, validate assessment-to-outcome links, quantify savings",
        primaryKPI: {
          name: "Turnover Risk Predictive Accuracy (AUC) and Realised Turnover Reduction",
          description: "Predictive accuracy and actual turnover reduction (%)",
          type: "composite"
        },
        supportingKPIs: [
          { name: "Feature importance list", unit: "qualitative" },
          { name: "Promotion velocity for key talent", unit: "time" }
        ]
      },
      {
        name: "Value Management / Client Success & Talent Suite",
        jobs: "Align solutions to business outcomes, track adoption and outcomes, govern re-measurement and case capture, deliver Talent Suite components",
        primaryKPI: {
          name: "Value Realisation %",
          description: "Actual vs Target value realisation",
          type: "percentage"
        },
        supportingKPIs: [
          { name: "Adoption Rate", unit: "%" },
          { name: "Time to First Value", unit: "months" }
        ]
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

// Helper to get solution summary for AI prompts
export function getSolutionSummary(): string {
  return Object.entries(KORN_FERRY_SOLUTIONS).map(([key, solution]) => {
    const capabilities = solution.capabilities.map(cap => 
      `  - ${cap.name}: ${cap.jobs}\n    Primary KPI: ${cap.primaryKPI.name}`
    ).join('\n');
    return `${key} (${solution.title}):\n${capabilities}`;
  }).join('\n\n');
}
