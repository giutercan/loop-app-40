/**
 * Korn Ferry Value Realisation Framework
 * Based on 2025 industry trends and best practices
 * 
 * Core Principle: Track quantified outcomes against promised value,
 * anchored to executive-level objectives (OKRs/strategic pillars)
 */

// ============================================
// VALUE NARRATIVE CATEGORIES (The 4 Pillars)
// Every KF solution hangs off one or more of these
// ============================================
export const VALUE_PILLARS = {
  grow: {
    id: "grow",
    name: "Grow",
    description: "Revenue, market share, innovation",
    color: "emerald",
    icon: "TrendingUp",
    examples: ["Revenue growth", "Market expansion", "New product success", "Customer acquisition"]
  },
  optimise: {
    id: "optimise", 
    name: "Optimise",
    description: "Productivity, cost, efficiency",
    color: "blue",
    icon: "Gauge",
    examples: ["Cost reduction", "Process efficiency", "Time-to-market", "Resource utilization"]
  },
  derisk: {
    id: "derisk",
    name: "De-risk",
    description: "Turnover, critical role failure, compliance, reputation",
    color: "amber",
    icon: "Shield",
    examples: ["Retention improvement", "Succession readiness", "Compliance", "Risk mitigation"]
  },
  strengthen: {
    id: "strengthen",
    name: "Strengthen Capability",
    description: "Leadership, culture, skills, diversity",
    color: "violet",
    icon: "Users",
    examples: ["Leadership pipeline", "Culture transformation", "Skills development", "DEI progress"]
  }
} as const;

export type ValuePillarId = keyof typeof VALUE_PILLARS;

// ============================================
// HEALTH SCORE DEFINITIONS
// Inspired by Customer Success methodology
// ============================================
export const HEALTH_SCORES = {
  on_track: {
    id: "on_track",
    label: "On Track",
    description: "Outcome progressing as expected toward target",
    color: "emerald",
    threshold: 0.8, // 80%+ of expected progress
    action: "Continue current approach"
  },
  at_risk: {
    id: "at_risk", 
    label: "At Risk",
    description: "Outcome showing signs of underperformance",
    color: "amber",
    threshold: 0.5, // 50-79% of expected progress
    action: "Investigate and adjust"
  },
  off_track: {
    id: "off_track",
    label: "Off Track", 
    description: "Outcome significantly behind target",
    color: "red",
    threshold: 0, // <50% of expected progress
    action: "Urgent intervention required"
  },
  needs_data: {
    id: "needs_data",
    label: "Needs Data",
    description: "Insufficient data to assess progress",
    color: "slate",
    threshold: null,
    action: "Collect baseline and current measurements"
  }
} as const;

// ============================================
// OUTCOME LIBRARY - LEADING INDICATORS
// Behavioral and process metrics (early signals)
// ============================================
export const LEADING_INDICATORS = {
  // Sales Effectiveness
  sales_pipeline_velocity: {
    id: "sales_pipeline_velocity",
    name: "Pipeline Velocity",
    category: "Sales Effectiveness",
    pillar: "grow",
    unit: "deals/month",
    description: "Speed at which opportunities move through pipeline",
    benchmarkRange: { low: 10, mid: 25, high: 50 }
  },
  sales_win_rate: {
    id: "sales_win_rate",
    name: "Win Rate",
    category: "Sales Effectiveness",
    pillar: "grow",
    unit: "%",
    description: "Percentage of opportunities won",
    benchmarkRange: { low: 15, mid: 25, high: 40 }
  },
  sales_cycle_time: {
    id: "sales_cycle_time",
    name: "Sales Cycle Time",
    category: "Sales Effectiveness",
    pillar: "optimise",
    unit: "days",
    description: "Average time from opportunity to close",
    benchmarkRange: { low: 120, mid: 90, high: 45 }
  },
  quota_attainment: {
    id: "quota_attainment",
    name: "Quota Attainment",
    category: "Sales Effectiveness",
    pillar: "grow",
    unit: "%",
    description: "Percentage of reps hitting quota",
    benchmarkRange: { low: 40, mid: 60, high: 80 }
  },
  
  // Leadership Development
  leadership_bench_strength: {
    id: "leadership_bench_strength",
    name: "Leadership Bench Strength",
    category: "Leadership Development",
    pillar: "strengthen",
    unit: "ratio",
    description: "Ready-now successors per critical role",
    benchmarkRange: { low: 0.5, mid: 1.0, high: 2.0 }
  },
  high_potential_retention: {
    id: "high_potential_retention",
    name: "High Potential Retention",
    category: "Leadership Development",
    pillar: "derisk",
    unit: "%",
    description: "Retention rate of identified high potentials",
    benchmarkRange: { low: 70, mid: 85, high: 95 }
  },
  leadership_assessment_scores: {
    id: "leadership_assessment_scores",
    name: "Leadership Competency Scores",
    category: "Leadership Development",
    pillar: "strengthen",
    unit: "score",
    description: "Average leadership competency assessment scores",
    benchmarkRange: { low: 3.0, mid: 3.5, high: 4.2 }
  },
  promotion_readiness: {
    id: "promotion_readiness",
    name: "Promotion Readiness Rate",
    category: "Leadership Development",
    pillar: "strengthen",
    unit: "%",
    description: "Percentage of successors ready for next role",
    benchmarkRange: { low: 30, mid: 50, high: 70 }
  },
  
  // Talent & Engagement
  engagement_score: {
    id: "engagement_score",
    name: "Employee Engagement Score",
    category: "Talent & Engagement",
    pillar: "strengthen",
    unit: "score",
    description: "Overall employee engagement survey score",
    benchmarkRange: { low: 60, mid: 72, high: 85 }
  },
  manager_effectiveness: {
    id: "manager_effectiveness",
    name: "Manager Effectiveness Score",
    category: "Talent & Engagement",
    pillar: "strengthen",
    unit: "score",
    description: "Manager effectiveness rating from direct reports",
    benchmarkRange: { low: 3.2, mid: 3.8, high: 4.3 }
  },
  internal_mobility_rate: {
    id: "internal_mobility_rate",
    name: "Internal Mobility Rate",
    category: "Talent & Engagement",
    pillar: "strengthen",
    unit: "%",
    description: "Percentage of roles filled internally",
    benchmarkRange: { low: 20, mid: 35, high: 50 }
  },
  
  // Organizational Effectiveness
  time_to_productivity: {
    id: "time_to_productivity",
    name: "Time to Productivity",
    category: "Organizational Effectiveness",
    pillar: "optimise",
    unit: "months",
    description: "Average time for new hires to reach full productivity",
    benchmarkRange: { low: 12, mid: 6, high: 3 }
  },
  decision_cycle_time: {
    id: "decision_cycle_time",
    name: "Decision Cycle Time",
    category: "Organizational Effectiveness",
    pillar: "optimise",
    unit: "days",
    description: "Average time to make key decisions",
    benchmarkRange: { low: 30, mid: 14, high: 5 }
  }
} as const;

// ============================================
// OUTCOME LIBRARY - LAGGING INDICATORS
// Hard business results (outcomes)
// ============================================
export const LAGGING_INDICATORS = {
  // Revenue & Growth
  revenue_growth: {
    id: "revenue_growth",
    name: "Revenue Growth",
    category: "Financial Performance",
    pillar: "grow",
    unit: "%",
    description: "Year-over-year revenue growth rate",
    financialImpact: { type: "revenue", multiplier: 1.0 }
  },
  revenue_per_employee: {
    id: "revenue_per_employee",
    name: "Revenue per Employee",
    category: "Financial Performance",
    pillar: "optimise",
    unit: "$",
    description: "Total revenue divided by headcount",
    financialImpact: { type: "productivity", multiplier: 1.0 }
  },
  gross_margin: {
    id: "gross_margin",
    name: "Gross Margin",
    category: "Financial Performance",
    pillar: "optimise",
    unit: "%",
    description: "Gross profit as percentage of revenue",
    financialImpact: { type: "margin", multiplier: 1.0 }
  },
  
  // Cost & Efficiency
  cost_per_hire: {
    id: "cost_per_hire",
    name: "Cost per Hire",
    category: "Talent Acquisition",
    pillar: "optimise",
    unit: "$",
    description: "Total recruitment cost per successful hire",
    financialImpact: { type: "cost_reduction", multiplier: 1.0 }
  },
  turnover_cost: {
    id: "turnover_cost",
    name: "Turnover Cost",
    category: "Retention",
    pillar: "derisk",
    unit: "$",
    description: "Total cost of employee turnover",
    financialImpact: { type: "cost_avoidance", multiplier: 1.5 }
  },
  training_roi: {
    id: "training_roi",
    name: "Training ROI",
    category: "Learning & Development",
    pillar: "optimise",
    unit: "%",
    description: "Return on investment for training programs",
    financialImpact: { type: "roi", multiplier: 1.0 }
  },
  
  // Risk & Retention
  voluntary_turnover_rate: {
    id: "voluntary_turnover_rate",
    name: "Voluntary Turnover Rate",
    category: "Retention",
    pillar: "derisk",
    unit: "%",
    description: "Percentage of employees leaving voluntarily",
    financialImpact: { type: "cost_avoidance", multiplier: 1.5 }
  },
  regrettable_turnover_rate: {
    id: "regrettable_turnover_rate",
    name: "Regrettable Turnover Rate",
    category: "Retention",
    pillar: "derisk",
    unit: "%",
    description: "Turnover of high performers we wanted to keep",
    financialImpact: { type: "cost_avoidance", multiplier: 2.0 }
  },
  critical_role_vacancy_rate: {
    id: "critical_role_vacancy_rate",
    name: "Critical Role Vacancy Rate",
    category: "Succession",
    pillar: "derisk",
    unit: "%",
    description: "Percentage of critical roles currently vacant",
    financialImpact: { type: "risk", multiplier: 2.5 }
  },
  
  // Productivity & Performance
  employee_productivity: {
    id: "employee_productivity",
    name: "Employee Productivity Index",
    category: "Performance",
    pillar: "optimise",
    unit: "index",
    description: "Output per employee relative to baseline",
    financialImpact: { type: "productivity", multiplier: 1.0 }
  },
  quality_of_hire: {
    id: "quality_of_hire",
    name: "Quality of Hire",
    category: "Talent Acquisition",
    pillar: "grow",
    unit: "score",
    description: "Performance rating of new hires at 12 months",
    financialImpact: { type: "productivity", multiplier: 0.8 }
  }
} as const;

// ============================================
// VALUE CANVAS TEMPLATE
// Standard structure for capturing value at entry
// ============================================
export interface ValueCanvasEntry {
  clientNorthStar: string;
  strategicContext: string;
  valueOutcomes: {
    id: string;
    outcome: string;
    pillar: ValuePillarId;
    kpiId: string;
    baseline: number | null;
    target: number;
    timeHorizon: string; // e.g., "12 months"
    clientOwner: string;
    kfOwner: string;
  }[];
  successConditions: string[];
  riskFactors: string[];
}

export const VALUE_CANVAS_TEMPLATE: ValueCanvasEntry = {
  clientNorthStar: "",
  strategicContext: "",
  valueOutcomes: [], // Should contain 3-5 co-owned KPIs
  successConditions: [
    "Executive sponsorship secured",
    "Data access confirmed",
    "Stakeholder alignment complete",
    "Change management plan in place",
    "Measurement cadence agreed"
  ],
  riskFactors: []
};

// ============================================
// QBR/EBR TEMPLATE STRUCTURE
// Standard sections for business reviews
// ============================================
export const QBR_TEMPLATE = {
  sections: [
    {
      id: "where_we_started",
      title: "Where We Started",
      description: "Original objectives, baseline metrics, and success criteria",
      prompts: [
        "What were the original strategic objectives?",
        "What were baseline measurements for each KPI?",
        "What conditions for success were identified?"
      ]
    },
    {
      id: "what_changed",
      title: "What's Changed",
      description: "Progress made, interventions delivered, and adjustments made",
      prompts: [
        "What key activities were completed this period?",
        "What adjustments were made to the approach?",
        "What unexpected challenges or opportunities emerged?"
      ]
    },
    {
      id: "what_data_says",
      title: "What the Data Says",
      description: "Current KPI status, trends, and health assessment",
      prompts: [
        "What is the current status of each KPI?",
        "What trends are emerging?",
        "Which outcomes are on track vs at risk?"
      ]
    },
    {
      id: "what_next",
      title: "What We Do Next",
      description: "Recommended actions, course corrections, and upcoming milestones",
      prompts: [
        "What interventions are recommended?",
        "What decisions need to be made?",
        "What are the key milestones for next period?"
      ]
    }
  ],
  annexes: [
    {
      id: "cfo_annex",
      title: "CFO Annex",
      description: "Financial assumptions, NPV, payback period, scenario analysis"
    },
    {
      id: "people_story",
      title: "People & Capability Story",
      description: "Behavioral shifts, capability development, culture indicators"
    }
  ]
};

// ============================================
// SOLUTION-SPECIFIC VALUE PATTERNS
// Pre-built patterns for common KF solutions
// ============================================
export const SOLUTION_VALUE_PATTERNS = {
  sales_effectiveness: {
    id: "sales_effectiveness",
    name: "Sales Effectiveness",
    description: "Improve sales performance and revenue growth",
    primaryPillars: ["grow", "optimise"],
    recommendedKPIs: {
      leading: ["sales_win_rate", "sales_cycle_time", "quota_attainment", "sales_pipeline_velocity"],
      lagging: ["revenue_growth", "revenue_per_employee", "gross_margin"]
    },
    typicalTimeline: "12-18 months",
    benchmarkImpact: {
      conservative: { revenue: 0.05, winRate: 0.10 },
      moderate: { revenue: 0.12, winRate: 0.20 },
      aggressive: { revenue: 0.20, winRate: 0.35 }
    }
  },
  leadership_development: {
    id: "leadership_development",
    name: "Leadership Development",
    description: "Build leadership pipeline and capability",
    primaryPillars: ["strengthen", "derisk"],
    recommendedKPIs: {
      leading: ["leadership_bench_strength", "high_potential_retention", "leadership_assessment_scores", "promotion_readiness"],
      lagging: ["voluntary_turnover_rate", "regrettable_turnover_rate", "employee_productivity"]
    },
    typicalTimeline: "18-24 months",
    benchmarkImpact: {
      conservative: { retention: 0.05, benchStrength: 0.15 },
      moderate: { retention: 0.12, benchStrength: 0.30 },
      aggressive: { retention: 0.20, benchStrength: 0.50 }
    }
  },
  org_transformation: {
    id: "org_transformation",
    name: "Organization Transformation",
    description: "Redesign organization for agility and performance",
    primaryPillars: ["optimise", "strengthen"],
    recommendedKPIs: {
      leading: ["decision_cycle_time", "time_to_productivity", "internal_mobility_rate", "engagement_score"],
      lagging: ["revenue_per_employee", "employee_productivity", "voluntary_turnover_rate"]
    },
    typicalTimeline: "18-36 months",
    benchmarkImpact: {
      conservative: { productivity: 0.08, engagement: 0.05 },
      moderate: { productivity: 0.15, engagement: 0.12 },
      aggressive: { productivity: 0.25, engagement: 0.20 }
    }
  },
  talent_acquisition: {
    id: "talent_acquisition",
    name: "Talent Acquisition Excellence",
    description: "Optimize hiring quality and efficiency",
    primaryPillars: ["optimise", "grow"],
    recommendedKPIs: {
      leading: ["time_to_productivity", "manager_effectiveness"],
      lagging: ["cost_per_hire", "quality_of_hire", "voluntary_turnover_rate"]
    },
    typicalTimeline: "6-12 months",
    benchmarkImpact: {
      conservative: { costPerHire: -0.10, qualityOfHire: 0.08 },
      moderate: { costPerHire: -0.20, qualityOfHire: 0.15 },
      aggressive: { costPerHire: -0.35, qualityOfHire: 0.25 }
    }
  },
  rewards_optimization: {
    id: "rewards_optimization",
    name: "Rewards & Recognition Optimization",
    description: "Align compensation with performance and retention",
    primaryPillars: ["derisk", "optimise"],
    recommendedKPIs: {
      leading: ["engagement_score", "high_potential_retention"],
      lagging: ["voluntary_turnover_rate", "regrettable_turnover_rate", "employee_productivity"]
    },
    typicalTimeline: "12-18 months",
    benchmarkImpact: {
      conservative: { retention: 0.05, engagement: 0.04 },
      moderate: { retention: 0.10, engagement: 0.08 },
      aggressive: { retention: 0.18, engagement: 0.15 }
    }
  }
} as const;

// ============================================
// FINANCIAL CALCULATION HELPERS
// Standard logic for value-to-financial conversion
// ============================================
export const FINANCIAL_MULTIPLIERS = {
  // Average salary assumptions for cost calculations
  avgSalary: 75000,
  
  // Turnover cost multipliers (% of salary)
  turnoverCost: {
    entry: 0.5,
    professional: 1.0,
    manager: 1.5,
    executive: 2.0
  },
  
  // Revenue per employee benchmarks by industry
  revenuePerEmployee: {
    technology: 350000,
    financial_services: 280000,
    healthcare: 180000,
    manufacturing: 220000,
    retail: 150000,
    professional_services: 200000
  },
  
  // Productivity impact multipliers
  productivityToRevenue: 0.6, // 1% productivity = 0.6% revenue impact
  
  // Discount rate for NPV calculations
  discountRate: 0.10
};

// ============================================
// VALUE REALISATION LIFECYCLE STAGES
// Based on Benefits Realisation Management (BRM)
// ============================================
export const VALUE_LIFECYCLE_STAGES = [
  {
    id: "discover",
    name: "Discover & Qualify",
    description: "Identify value opportunities and validate fit",
    activities: ["AI Research", "Discovery Questions", "Value Hypothesis"],
    outputs: ["Initial Value Canvas", "Qualified Opportunity"]
  },
  {
    id: "shape",
    name: "Shape & Sell",
    description: "Co-create value story with client",
    activities: ["Value Case Development", "KPI Selection", "Financial Modeling"],
    outputs: ["Value Agreement", "Business Case", "Proposal"]
  },
  {
    id: "deliver",
    name: "Deliver & Realise",
    description: "Execute and track value creation",
    activities: ["Value Board Tracking", "Health Monitoring", "Course Correction"],
    outputs: ["Progress Reports", "Intervention Actions"]
  },
  {
    id: "review",
    name: "Review & Renew",
    description: "Assess outcomes and plan next steps",
    activities: ["QBR/EBR", "Value Story Generation", "Expansion Planning"],
    outputs: ["Value Realization Report", "Renewal/Expansion Plan"]
  },
  {
    id: "learn",
    name: "Learn & Scale",
    description: "Codify patterns for replication",
    activities: ["Pattern Capture", "Benchmark Update", "Success Story"],
    outputs: ["Playbook Updates", "Internal Library Entry"]
  }
];

// ============================================
// AI PROMPT TEMPLATES FOR VALUE NARRATIVES
// ============================================
export const VALUE_NARRATIVE_PROMPTS = {
  executive_summary: `Generate an executive summary for a business review that covers:
1. Original objectives and current status
2. Key KPI movements (baseline → current → target)
3. Value realized to date
4. Recommended next steps

Format: Clear, concise, suitable for C-suite audience.`,

  cfo_annex: `Generate a CFO-focused financial analysis including:
1. Investment summary and assumptions
2. Value realized vs projected (with variance explanation)
3. Updated NPV and payback period
4. Risk-adjusted scenarios (conservative/moderate/aggressive)

Format: Quantitative, with clear logic chains.`,

  people_story: `Generate a people and capability story covering:
1. Behavioral and mindset shifts observed
2. Capability development progress
3. Cultural indicators and changes
4. How these translate to business outcomes

Format: Qualitative insights linked to quantitative impact.`,

  kpi_recommendation: `Based on the discovery insights and strategic priorities, recommend:
1. 3-5 primary KPIs to track (mix of leading and lagging)
2. Suggested baselines and targets
3. Data sources and measurement approach
4. How each KPI links to strategic objectives

Consider the client's industry, maturity, and data availability.`
};

export type SolutionPatternId = keyof typeof SOLUTION_VALUE_PATTERNS;
export type LeadingIndicatorId = keyof typeof LEADING_INDICATORS;
export type LaggingIndicatorId = keyof typeof LAGGING_INDICATORS;
