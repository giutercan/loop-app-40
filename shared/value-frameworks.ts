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
    financialImpact: { type: "revenue", multiplier: 1.0 },
    benchmarkRange: { low: 3, mid: 8, high: 15 }
  },
  revenue_per_employee: {
    id: "revenue_per_employee",
    name: "Revenue per Employee",
    category: "Financial Performance",
    pillar: "optimise",
    unit: "$K",
    description: "Total revenue divided by headcount",
    financialImpact: { type: "productivity", multiplier: 1.0 },
    benchmarkRange: { low: 150, mid: 250, high: 400 }
  },
  gross_margin: {
    id: "gross_margin",
    name: "Gross Margin",
    category: "Financial Performance",
    pillar: "optimise",
    unit: "%",
    description: "Gross profit as percentage of revenue",
    financialImpact: { type: "margin", multiplier: 1.0 },
    benchmarkRange: { low: 25, mid: 40, high: 60 }
  },
  
  // Cost & Efficiency
  cost_per_hire: {
    id: "cost_per_hire",
    name: "Cost per Hire",
    category: "Talent Acquisition",
    pillar: "optimise",
    unit: "$",
    description: "Total recruitment cost per successful hire",
    financialImpact: { type: "cost_reduction", multiplier: 1.0 },
    benchmarkRange: { low: 8000, mid: 4500, high: 2500 }
  },
  turnover_cost: {
    id: "turnover_cost",
    name: "Turnover Cost",
    category: "Retention",
    pillar: "derisk",
    unit: "$K",
    description: "Total cost of employee turnover",
    financialImpact: { type: "cost_avoidance", multiplier: 1.5 },
    benchmarkRange: { low: 75, mid: 50, high: 25 }
  },
  training_roi: {
    id: "training_roi",
    name: "Training ROI",
    category: "Learning & Development",
    pillar: "optimise",
    unit: "%",
    description: "Return on investment for training programs",
    financialImpact: { type: "roi", multiplier: 1.0 },
    benchmarkRange: { low: 50, mid: 150, high: 300 }
  },
  
  // Risk & Retention
  voluntary_turnover_rate: {
    id: "voluntary_turnover_rate",
    name: "Voluntary Turnover Rate",
    category: "Retention",
    pillar: "derisk",
    unit: "%",
    description: "Percentage of employees leaving voluntarily",
    financialImpact: { type: "cost_avoidance", multiplier: 1.5 },
    benchmarkRange: { low: 20, mid: 12, high: 6 }
  },
  regrettable_turnover_rate: {
    id: "regrettable_turnover_rate",
    name: "Regrettable Turnover Rate",
    category: "Retention",
    pillar: "derisk",
    unit: "%",
    description: "Turnover of high performers we wanted to keep",
    financialImpact: { type: "cost_avoidance", multiplier: 2.0 },
    benchmarkRange: { low: 15, mid: 8, high: 3 }
  },
  critical_role_vacancy_rate: {
    id: "critical_role_vacancy_rate",
    name: "Critical Role Vacancy Rate",
    category: "Succession",
    pillar: "derisk",
    unit: "%",
    description: "Percentage of critical roles currently vacant",
    financialImpact: { type: "risk", multiplier: 2.5 },
    benchmarkRange: { low: 15, mid: 8, high: 3 }
  },
  
  // Productivity & Performance
  employee_productivity: {
    id: "employee_productivity",
    name: "Employee Productivity Index",
    category: "Performance",
    pillar: "optimise",
    unit: "index",
    description: "Output per employee relative to baseline",
    financialImpact: { type: "productivity", multiplier: 1.0 },
    benchmarkRange: { low: 80, mid: 100, high: 130 }
  },
  quality_of_hire: {
    id: "quality_of_hire",
    name: "Quality of Hire",
    category: "Talent Acquisition",
    pillar: "grow",
    unit: "score",
    description: "Performance rating of new hires at 12 months",
    financialImpact: { type: "productivity", multiplier: 0.8 },
    benchmarkRange: { low: 60, mid: 75, high: 90 }
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

// ============================================
// OUTCOME JOURNEY TEMPLATES
// Pre-built journey patterns for common KF solutions
// ============================================
export interface JourneyPhase {
  phase: string;
  description: string;
  duration: string;
  activities: string[];
  milestones: string[];
}

export interface QuickWin {
  title: string;
  description: string;
  timeline: string;
  expectedImpact: string;
}

export interface KeyMilestone {
  title: string;
  targetWeek: number;
  description: string;
  successCriteria: string;
}

export const OUTCOME_JOURNEY_TEMPLATES: Record<SolutionPatternId, {
  phases: JourneyPhase[];
  quickWins: QuickWin[];
  milestones: KeyMilestone[];
  typicalTimeline: string;
}> = {
  leadership_development: {
    typicalTimeline: "18-24 months",
    phases: [
      {
        phase: "Foundation",
        description: "Assess current state and design program",
        duration: "Months 1-3",
        activities: ["Leadership assessment", "Gap analysis", "Program design", "Stakeholder alignment"],
        milestones: ["Assessment complete", "Development plan approved"]
      },
      {
        phase: "Build",
        description: "Develop leadership capabilities through structured programs",
        duration: "Months 4-12",
        activities: ["Development programs", "Coaching deployment", "Action learning projects", "Peer cohorts"],
        milestones: ["First cohort completed", "Initial behavior changes observed"]
      },
      {
        phase: "Embed",
        description: "Reinforce behaviors and measure impact",
        duration: "Months 13-18",
        activities: ["Succession planning integration", "Performance system alignment", "Culture reinforcement"],
        milestones: ["Promotion pipeline active", "Retention metrics improved"]
      },
      {
        phase: "Scale",
        description: "Expand to additional levels and sustain gains",
        duration: "Months 19-24",
        activities: ["Program expansion", "Internal capability building", "Continuous improvement"],
        milestones: ["Full pipeline coverage", "ROI validated"]
      }
    ],
    quickWins: [
      { title: "Assessment insights delivered", description: "Leadership gap analysis shared with executive team", timeline: "Week 4-6", expectedImpact: "Alignment on development priorities" },
      { title: "High-potential identification", description: "Top talent identified and engaged", timeline: "Week 8", expectedImpact: "Retention signal to key talent" },
      { title: "First coaching sessions", description: "Executive coaching begins for priority leaders", timeline: "Month 2", expectedImpact: "Immediate behavior coaching" }
    ],
    milestones: [
      { title: "Assessment Complete", targetWeek: 6, description: "All leaders assessed", successCriteria: "100% of target population assessed" },
      { title: "Development Plans Active", targetWeek: 12, description: "Individual development plans in place", successCriteria: "All participants have active IDPs" },
      { title: "First Promotions", targetWeek: 52, description: "Internal promotions from pipeline", successCriteria: "At least 2 internal promotions to target roles" },
      { title: "ROI Validated", targetWeek: 78, description: "Business impact measured", successCriteria: "Positive ROI demonstrated" }
    ]
  },
  sales_effectiveness: {
    typicalTimeline: "12-18 months",
    phases: [
      {
        phase: "Diagnose",
        description: "Assess current sales capability and identify gaps",
        duration: "Months 1-2",
        activities: ["Win/loss analysis", "Competency assessment", "Process mapping", "CRM data analysis"],
        milestones: ["Diagnostic complete", "Priority gaps identified"]
      },
      {
        phase: "Design",
        description: "Build tailored sales methodology and enablement",
        duration: "Months 2-4",
        activities: ["Methodology customization", "Playbook development", "Training design", "Tool configuration"],
        milestones: ["Methodology approved", "Training materials ready"]
      },
      {
        phase: "Deploy",
        description: "Roll out training and coaching at scale",
        duration: "Months 4-9",
        activities: ["Training delivery", "Manager coaching certification", "Deal coaching", "Reinforcement"],
        milestones: ["All reps trained", "Manager coaches active"]
      },
      {
        phase: "Optimize",
        description: "Measure impact and continuously improve",
        duration: "Months 10-18",
        activities: ["Performance tracking", "Coaching refinement", "Best practice sharing", "Methodology updates"],
        milestones: ["Win rate improvement", "Revenue targets met"]
      }
    ],
    quickWins: [
      { title: "Pipeline review cadence", description: "Weekly deal reviews implemented", timeline: "Week 2", expectedImpact: "Immediate visibility into deal health" },
      { title: "Top deal acceleration", description: "Focused coaching on top 10 deals", timeline: "Week 4", expectedImpact: "Faster close on priority opportunities" },
      { title: "Qualification improvements", description: "Better deal qualification criteria applied", timeline: "Month 2", expectedImpact: "Reduced wasted pursuit effort" }
    ],
    milestones: [
      { title: "Diagnostic Complete", targetWeek: 4, description: "Sales capability baseline established", successCriteria: "Gap analysis delivered to leadership" },
      { title: "Methodology Trained", targetWeek: 16, description: "All sellers certified on methodology", successCriteria: "100% completion rate" },
      { title: "Win Rate Lift", targetWeek: 36, description: "Measurable improvement in win rates", successCriteria: "5%+ improvement vs baseline" },
      { title: "Revenue Impact", targetWeek: 52, description: "Revenue targets achieved", successCriteria: "Pipeline velocity and revenue on target" }
    ]
  },
  talent_acquisition: {
    typicalTimeline: "6-12 months",
    phases: [
      {
        phase: "Assess",
        description: "Audit current TA process and identify bottlenecks",
        duration: "Months 1-2",
        activities: ["Process audit", "Candidate experience mapping", "Recruiter capability assessment", "Tech stack review"],
        milestones: ["Audit complete", "Quick wins identified"]
      },
      {
        phase: "Redesign",
        description: "Optimize processes and implement new approaches",
        duration: "Months 2-4",
        activities: ["Process redesign", "Assessment implementation", "EVP refinement", "Sourcing strategy"],
        milestones: ["New process live", "Assessments deployed"]
      },
      {
        phase: "Execute",
        description: "Full rollout with measurement",
        duration: "Months 4-9",
        activities: ["Recruiter training", "Hiring manager enablement", "Metrics tracking", "Continuous optimization"],
        milestones: ["All recruiters trained", "Metrics dashboard live"]
      },
      {
        phase: "Sustain",
        description: "Embed changes and measure outcomes",
        duration: "Months 9-12",
        activities: ["Quality of hire tracking", "Process refinement", "Internal capability building"],
        milestones: ["Cost per hire reduced", "Quality metrics improved"]
      }
    ],
    quickWins: [
      { title: "Bottleneck removal", description: "Eliminate top 3 process bottlenecks", timeline: "Week 3", expectedImpact: "Faster time-to-offer" },
      { title: "Assessment launch", description: "Predictive assessments for key roles", timeline: "Month 2", expectedImpact: "Better quality signals" },
      { title: "Interview training", description: "Structured interview training for HMs", timeline: "Month 2", expectedImpact: "More consistent evaluations" }
    ],
    milestones: [
      { title: "Audit Complete", targetWeek: 4, description: "Full TA process mapped", successCriteria: "Recommendations delivered" },
      { title: "New Process Live", targetWeek: 12, description: "Redesigned process operational", successCriteria: "All roles using new process" },
      { title: "Time-to-Fill Reduced", targetWeek: 24, description: "Hiring speed improved", successCriteria: "20%+ reduction" },
      { title: "Quality Validated", targetWeek: 52, description: "Quality of hire measured", successCriteria: "Positive correlation with performance" }
    ]
  },
  org_transformation: {
    typicalTimeline: "18-36 months",
    phases: [
      {
        phase: "Envision",
        description: "Define future state and change strategy",
        duration: "Months 1-3",
        activities: ["Future state design", "Impact assessment", "Change strategy", "Stakeholder mapping"],
        milestones: ["Future state approved", "Change roadmap defined"]
      },
      {
        phase: "Architect",
        description: "Design new structures and operating model",
        duration: "Months 3-6",
        activities: ["Organization design", "Role definition", "Process redesign", "Talent implications"],
        milestones: ["New structure approved", "Roles designed"]
      },
      {
        phase: "Transform",
        description: "Implement changes with active change management",
        duration: "Months 6-18",
        activities: ["Structure implementation", "Talent placement", "Change management", "Culture initiatives"],
        milestones: ["Day 1 achieved", "Key talent retained"]
      },
      {
        phase: "Embed",
        description: "Stabilize and optimize new operating model",
        duration: "Months 18-36",
        activities: ["Performance stabilization", "Culture embedding", "Continuous improvement", "Success measurement"],
        milestones: ["Operating effectively", "Benefits realized"]
      }
    ],
    quickWins: [
      { title: "Leadership alignment", description: "Senior team aligned on future vision", timeline: "Week 4", expectedImpact: "Unified leadership message" },
      { title: "Decision rights clarity", description: "Key decision rights clarified", timeline: "Month 2", expectedImpact: "Faster decision-making" },
      { title: "Communication launched", description: "Change story communicated broadly", timeline: "Month 2", expectedImpact: "Reduced uncertainty" }
    ],
    milestones: [
      { title: "Future State Approved", targetWeek: 8, description: "Board/ExCo approval of design", successCriteria: "Sign-off obtained" },
      { title: "Day 1 Launch", targetWeek: 24, description: "New structure goes live", successCriteria: "All roles staffed, reporting lines active" },
      { title: "Stabilization", targetWeek: 52, description: "Organization operating effectively", successCriteria: "Engagement scores stable" },
      { title: "Benefits Realized", targetWeek: 104, description: "Transformation benefits achieved", successCriteria: "Cost/productivity targets met" }
    ]
  },
  rewards_optimization: {
    typicalTimeline: "12-18 months",
    phases: [
      {
        phase: "Analyze",
        description: "Understand current rewards landscape and gaps",
        duration: "Months 1-3",
        activities: ["Pay equity analysis", "Market benchmarking", "Employee sentiment", "Cost modeling"],
        milestones: ["Analysis complete", "Gap report delivered"]
      },
      {
        phase: "Design",
        description: "Develop new rewards philosophy and programs",
        duration: "Months 3-6",
        activities: ["Philosophy development", "Structure design", "Incentive redesign", "Communication planning"],
        milestones: ["Design approved", "Budget confirmed"]
      },
      {
        phase: "Implement",
        description: "Roll out new programs with change management",
        duration: "Months 6-12",
        activities: ["System updates", "Manager training", "Employee communication", "Rollout execution"],
        milestones: ["Programs live", "All managers trained"]
      },
      {
        phase: "Measure",
        description: "Track impact and refine approach",
        duration: "Months 12-18",
        activities: ["Impact measurement", "Employee feedback", "Refinement", "Continuous improvement"],
        milestones: ["Retention improved", "Engagement lifted"]
      }
    ],
    quickWins: [
      { title: "Pay equity fixes", description: "Critical pay equity gaps addressed", timeline: "Month 2", expectedImpact: "Risk reduction, fairness signal" },
      { title: "Top talent review", description: "Targeted review of critical talent pay", timeline: "Month 3", expectedImpact: "Retention of key performers" },
      { title: "Communication clarity", description: "Clear total rewards statements", timeline: "Month 4", expectedImpact: "Better rewards understanding" }
    ],
    milestones: [
      { title: "Analysis Complete", targetWeek: 8, description: "Full rewards diagnostic delivered", successCriteria: "Recommendations presented" },
      { title: "Design Approved", targetWeek: 20, description: "New rewards structure approved", successCriteria: "Executive sign-off and budget" },
      { title: "Programs Live", targetWeek: 40, description: "New programs operational", successCriteria: "All employees transitioned" },
      { title: "Impact Measured", targetWeek: 72, description: "Benefits validated", successCriteria: "Retention and engagement improved" }
    ]
  }
};

// ============================================
// JOURNEY LOOP FRAMEWORK
// Interactive, cyclical value realization model
// ============================================

export interface JourneyLoopStage {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
  sequence: number;
  activities: string[];
  successSignals: string[];
  kpiHighlights: string[];
  customerMessage: string;
  duration: string;
}

export interface JourneyLoopProgress {
  stageId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  completionPercentage: number;
  startDate?: string;
  completedDate?: string;
  blockers?: string[];
  evidence?: string[];
}

export const JOURNEY_LOOP_STAGES: JourneyLoopStage[] = [
  {
    id: "implement",
    name: "Implement",
    shortName: "Implement",
    description: "Deploy solutions and embed new capabilities into the organization",
    icon: "Rocket",
    color: "blue",
    sequence: 1,
    activities: [
      "Solution deployment",
      "Change management activation",
      "Training and enablement",
      "Process integration",
      "Stakeholder communication"
    ],
    successSignals: [
      "Solution fully deployed",
      "Key stakeholders trained",
      "Processes documented",
      "Initial adoption metrics captured"
    ],
    kpiHighlights: [
      "Deployment completion rate",
      "Training completion rate",
      "Stakeholder engagement score"
    ],
    customerMessage: "We're putting the plan into action, deploying solutions and preparing your team for success.",
    duration: "Weeks 1-8"
  },
  {
    id: "test",
    name: "Test & Validate",
    shortName: "Test",
    description: "Validate approach, gather feedback, and refine based on real-world results",
    icon: "FlaskConical",
    color: "amber",
    sequence: 2,
    activities: [
      "Pilot program execution",
      "Feedback collection",
      "Performance monitoring",
      "Issue identification",
      "Rapid iteration"
    ],
    successSignals: [
      "Pilot results analyzed",
      "Key adjustments identified",
      "Stakeholder feedback incorporated",
      "Refinements deployed"
    ],
    kpiHighlights: [
      "Pilot success rate",
      "Feedback response rate",
      "Issue resolution time"
    ],
    customerMessage: "We're validating what works, gathering insights, and fine-tuning our approach based on real results.",
    duration: "Weeks 9-16"
  },
  {
    id: "realize",
    name: "Realize Value",
    shortName: "Realize",
    description: "Capture and measure tangible business outcomes and ROI",
    icon: "TrendingUp",
    color: "emerald",
    sequence: 3,
    activities: [
      "Outcome measurement",
      "ROI calculation",
      "Success story documentation",
      "Executive reporting",
      "Value communication"
    ],
    successSignals: [
      "KPI targets achieved",
      "ROI demonstrated",
      "Success stories captured",
      "Value communicated to stakeholders"
    ],
    kpiHighlights: [
      "Target achievement rate",
      "Financial ROI",
      "Stakeholder satisfaction"
    ],
    customerMessage: "We're measuring real impact—tracking outcomes, calculating ROI, and documenting your success.",
    duration: "Weeks 17-24"
  },
  {
    id: "learn",
    name: "Learn & Reflect",
    shortName: "Learn",
    description: "Analyze insights, identify lessons learned, and capture organizational knowledge",
    icon: "Lightbulb",
    color: "violet",
    sequence: 4,
    activities: [
      "Retrospective analysis",
      "Best practice documentation",
      "Knowledge transfer",
      "Capability assessment",
      "Gap identification"
    ],
    successSignals: [
      "Lessons documented",
      "Best practices shared",
      "Team capabilities enhanced",
      "Next opportunities identified"
    ],
    kpiHighlights: [
      "Knowledge retention score",
      "Capability improvement",
      "Lesson implementation rate"
    ],
    customerMessage: "We're capturing what we've learned—documenting insights and building lasting organizational capability.",
    duration: "Weeks 25-28"
  },
  {
    id: "iterate",
    name: "Iterate & Scale",
    shortName: "Iterate",
    description: "Expand successful approaches and prepare for the next cycle of value creation",
    icon: "RefreshCw",
    color: "rose",
    sequence: 5,
    activities: [
      "Success scaling",
      "New opportunity identification",
      "Strategic planning",
      "Resource optimization",
      "Next cycle preparation"
    ],
    successSignals: [
      "Approach scaled to new areas",
      "Next priorities defined",
      "Resources allocated",
      "Cycle restart planned"
    ],
    kpiHighlights: [
      "Scale rate",
      "New opportunity pipeline",
      "Continuous improvement index"
    ],
    customerMessage: "We're building on success—scaling what works and preparing for the next wave of value creation.",
    duration: "Weeks 29-32+"
  }
];

export type JourneyLoopStageId = typeof JOURNEY_LOOP_STAGES[number]['id'];

// Map existing journey phases to loop stages
export const mapPhasesToLoopStages = (phases: JourneyPhase[]): JourneyLoopStageId[] => {
  const phaseKeywords: Record<JourneyLoopStageId, string[]> = {
    implement: ['implement', 'deploy', 'build', 'launch', 'rollout', 'execute', 'activate'],
    test: ['test', 'pilot', 'validate', 'assess', 'evaluate', 'refine'],
    realize: ['realize', 'measure', 'track', 'achieve', 'deliver', 'embed', 'sustain'],
    learn: ['learn', 'reflect', 'review', 'analyze', 'insight'],
    iterate: ['iterate', 'scale', 'expand', 'optimize', 'improve', 'grow']
  };

  return phases.map(phase => {
    const phaseLower = phase.phase.toLowerCase();
    for (const [stageId, keywords] of Object.entries(phaseKeywords)) {
      if (keywords.some(kw => phaseLower.includes(kw))) {
        return stageId as JourneyLoopStageId;
      }
    }
    return 'implement' as JourneyLoopStageId;
  });
};

// Get default loop structure for a solution pattern
export const getLoopForSolutionPattern = (patternId: SolutionPatternId): {
  stages: JourneyLoopStage[];
  defaultProgress: JourneyLoopProgress[];
} => {
  const template = OUTCOME_JOURNEY_TEMPLATES[patternId];
  if (!template) {
    return {
      stages: JOURNEY_LOOP_STAGES,
      defaultProgress: JOURNEY_LOOP_STAGES.map(stage => ({
        stageId: stage.id,
        status: 'not_started' as const,
        completionPercentage: 0
      }))
    };
  }

  return {
    stages: JOURNEY_LOOP_STAGES.map(stage => ({
      ...stage,
      activities: stage.activities,
      duration: stage.duration
    })),
    defaultProgress: JOURNEY_LOOP_STAGES.map(stage => ({
      stageId: stage.id,
      status: 'not_started' as const,
      completionPercentage: 0
    }))
  };
};

// ============================================
// UNIFIED JOURNEY PHASES (3-Phase Model)
// Customer-friendly phased approach
// ============================================

export interface UnifiedPhase {
  id: 'near_term' | 'build_momentum' | 'realize_value';
  name: string;
  shortName: string;
  description: string;
  customerMessage: string;
  color: 'blue' | 'violet' | 'emerald';
  icon: string;
  typicalDuration: string;
  startMonth: number;
  endMonth: number;
}

export const UNIFIED_JOURNEY_PHASES: UnifiedPhase[] = [
  {
    id: 'near_term',
    name: 'Near-Term Wins',
    shortName: 'Quick Wins',
    description: 'Establish foundation and deliver early value',
    customerMessage: 'We start by building a strong foundation while delivering quick wins to demonstrate immediate value and build confidence.',
    color: 'blue',
    icon: 'Zap',
    typicalDuration: '1-3 months',
    startMonth: 0,
    endMonth: 3
  },
  {
    id: 'build_momentum',
    name: 'Build Momentum',
    shortName: 'Momentum',
    description: 'Scale initiatives and develop capabilities',
    customerMessage: 'With early wins secured, we build on success—expanding programs and developing deeper organizational capability.',
    color: 'violet',
    icon: 'TrendingUp',
    typicalDuration: '4-9 months',
    startMonth: 3,
    endMonth: 9
  },
  {
    id: 'realize_value',
    name: 'Realize Value',
    shortName: 'Impact',
    description: 'Measure impact and embed sustainable change',
    customerMessage: 'We validate ROI, embed lasting changes, and prepare your organization for continued success beyond our engagement.',
    color: 'emerald',
    icon: 'Trophy',
    typicalDuration: '10-18+ months',
    startMonth: 9,
    endMonth: 18
  }
];

export interface OutcomeLane {
  outcomeId: string;
  outcomeName: string;
  solutionPattern: SolutionPatternId;
  pillar: ValuePillarId;
  pillarColor: string;
  phases: {
    phaseId: UnifiedPhase['id'];
    activities: string[];
    milestones: string[];
    startWeek: number;
    endWeek: number;
  }[];
  totalDuration: string;
  expectedValue?: string;
}

export interface ConsolidatedPhase {
  phaseId: UnifiedPhase['id'];
  phaseName: string;
  phaseShortName: string;
  startWeek: number;
  endWeek: number;
  outcomeCount: number;
  outcomes: {
    id: string;
    name: string;
    pillar: ValuePillarId;
    pillarColor: string;
  }[];
  allActivities: { text: string; outcomeNames: string[] }[];
  allMilestones: { text: string; week: number; outcomeNames: string[] }[];
  keyDeliverables: string[];
}

export interface UnifiedJourneyData {
  phases: UnifiedPhase[];
  lanes: OutcomeLane[];
  consolidatedPhases: ConsolidatedPhase[];
  totalOutcomes: number;
  totalMonths: number;
  totalValue?: string;
  sharedMilestones: {
    week: number;
    title: string;
    outcomes: string[];
  }[];
}

// Map outcome journey templates to unified phases with normalized week spans
const mapTemplateToPhases = (template: typeof OUTCOME_JOURNEY_TEMPLATES[SolutionPatternId]): {
  phaseId: UnifiedPhase['id'];
  activities: string[];
  milestones: string[];
  startWeek: number;
  endWeek: number;
}[] => {
  // Default total months for the entire journey
  const TOTAL_MONTHS = 18;
  const TOTAL_WEEKS = TOTAL_MONTHS * 4;
  
  if (!template || !template.phases || template.phases.length === 0) {
    // Return default 3-phase structure
    return [
      { phaseId: 'near_term', activities: ['Foundation setup', 'Initial assessment'], milestones: ['Kickoff complete'], startWeek: 0, endWeek: 12 },
      { phaseId: 'build_momentum', activities: ['Implementation', 'Training'], milestones: ['Rollout complete'], startWeek: 12, endWeek: 48 },
      { phaseId: 'realize_value', activities: ['Measurement', 'Optimization'], milestones: ['ROI validated'], startWeek: 48, endWeek: 72 }
    ];
  }
  
  const phases = template.phases;
  const totalPhases = phases.length;
  
  // Calculate even distribution as fallback
  const weeksPerPhase = Math.floor(TOTAL_WEEKS / totalPhases);
  
  // First pass: try to parse durations from template
  const parsedPhases = phases.map((phase, index) => {
    const durationMatch = phase.duration ? phase.duration.match(/(\d+)/g) : null;
    return {
      phase,
      index,
      startMonth: durationMatch && durationMatch[0] ? parseInt(durationMatch[0]) : null,
      endMonth: durationMatch && durationMatch[1] ? parseInt(durationMatch[1]) : null
    };
  });
  
  // Second pass: normalize to sequential, non-overlapping week spans
  return parsedPhases.map((p, index) => {
    // Map original phases to unified phases based on position
    let phaseId: UnifiedPhase['id'];
    if (index === 0) {
      phaseId = 'near_term';
    } else if (index < totalPhases - 1) {
      phaseId = 'build_momentum';
    } else {
      phaseId = 'realize_value';
    }
    
    // Calculate sequential weeks to ensure no overlap
    const startWeek = index * weeksPerPhase;
    const endWeek = index === totalPhases - 1 ? TOTAL_WEEKS : (index + 1) * weeksPerPhase;
    
    return {
      phaseId,
      activities: p.phase.activities || [],
      milestones: p.phase.milestones || [],
      startWeek,
      endWeek
    };
  });
};

// Create unified journey from selected outcomes
export const createUnifiedJourney = (
  selectedOutcomes: {
    id: string;
    name: string;
    solutionPattern: SolutionPatternId;
    pillar: ValuePillarId;
    expectedValue?: string;
  }[]
): UnifiedJourneyData => {
  const lanes: OutcomeLane[] = selectedOutcomes.map(outcome => {
    const template = OUTCOME_JOURNEY_TEMPLATES[outcome.solutionPattern];
    const pillar = VALUE_PILLARS[outcome.pillar];
    const mappedPhases = mapTemplateToPhases(template);
    
    return {
      outcomeId: outcome.id,
      outcomeName: outcome.name,
      solutionPattern: outcome.solutionPattern,
      pillar: outcome.pillar,
      pillarColor: pillar?.color || 'slate',
      phases: mappedPhases,
      totalDuration: template?.typicalTimeline || '12-18 months',
      expectedValue: outcome.expectedValue
    };
  });

  // Find shared milestones (milestones that appear in the same week across outcomes)
  const milestonesByWeek: Record<number, { title: string; outcomes: string[] }[]> = {};
  lanes.forEach(lane => {
    lane.phases.forEach(phase => {
      phase.milestones.forEach((milestone, idx) => {
        const week = phase.startWeek + Math.floor((phase.endWeek - phase.startWeek) * (idx / (phase.milestones.length || 1)));
        if (!milestonesByWeek[week]) {
          milestonesByWeek[week] = [];
        }
        const existing = milestonesByWeek[week].find(m => m.title.toLowerCase() === milestone.toLowerCase());
        if (existing) {
          existing.outcomes.push(lane.outcomeName);
        } else {
          milestonesByWeek[week].push({ title: milestone, outcomes: [lane.outcomeName] });
        }
      });
    });
  });

  const sharedMilestones = Object.entries(milestonesByWeek)
    .filter(([_, milestones]) => milestones.some(m => m.outcomes.length > 1))
    .map(([week, milestones]) => ({
      week: parseInt(week),
      title: milestones.find(m => m.outcomes.length > 1)?.title || '',
      outcomes: milestones.find(m => m.outcomes.length > 1)?.outcomes || []
    }))
    .sort((a, b) => a.week - b.week);

  // Calculate max duration
  const maxEndWeek = Math.max(...lanes.flatMap(l => l.phases.map(p => p.endWeek)), 52);
  const totalMonths = Math.ceil(maxEndWeek / 4);

  // Build consolidated phases - merge all activities/milestones per phase across outcomes
  const consolidatedPhases: ConsolidatedPhase[] = UNIFIED_JOURNEY_PHASES.map(phase => {
    // Get all lanes that have this phase
    const lanesWithPhase = lanes.filter(lane => 
      lane.phases.some(p => p.phaseId === phase.id)
    );
    
    // Collect all activities with deduplication and source tracking
    const activityMap = new Map<string, string[]>();
    const milestoneList: { text: string; week: number; outcomeNames: string[] }[] = [];
    
    let phaseStartWeek = Infinity;
    let phaseEndWeek = 0;
    
    lanesWithPhase.forEach(lane => {
      const lanePhase = lane.phases.find(p => p.phaseId === phase.id);
      if (!lanePhase) return;
      
      // Track phase timing
      phaseStartWeek = Math.min(phaseStartWeek, lanePhase.startWeek);
      phaseEndWeek = Math.max(phaseEndWeek, lanePhase.endWeek);
      
      // Collect activities with deduplication
      lanePhase.activities.forEach(activity => {
        const normalizedActivity = activity.toLowerCase().trim();
        const existingKey = Array.from(activityMap.keys()).find(
          key => key.toLowerCase() === normalizedActivity
        );
        if (existingKey) {
          activityMap.get(existingKey)?.push(lane.outcomeName);
        } else {
          activityMap.set(activity, [lane.outcomeName]);
        }
      });
      
      // Collect milestones - distribute evenly across the phase duration
      const milestonesCount = lanePhase.milestones.length;
      lanePhase.milestones.forEach((milestone, idx) => {
        // Calculate week: for single milestone, place at midpoint; for multiple, distribute evenly
        let week: number;
        if (milestonesCount === 1) {
          // Single milestone goes at the midpoint of the phase
          week = Math.floor((lanePhase.startWeek + lanePhase.endWeek) / 2);
        } else {
          // Multiple milestones: distribute from start to end proportionally
          week = lanePhase.startWeek + Math.floor(
            (lanePhase.endWeek - lanePhase.startWeek) * ((idx + 1) / (milestonesCount + 1))
          );
        }
        
        const existing = milestoneList.find(
          m => m.text.toLowerCase() === milestone.toLowerCase()
        );
        if (existing) {
          if (!existing.outcomeNames.includes(lane.outcomeName)) {
            existing.outcomeNames.push(lane.outcomeName);
          }
        } else {
          milestoneList.push({ text: milestone, week, outcomeNames: [lane.outcomeName] });
        }
      });
    });
    
    // Convert activity map to array
    const allActivities = Array.from(activityMap.entries()).map(([text, outcomeNames]) => ({
      text,
      outcomeNames
    }));
    
    // Sort milestones by week
    milestoneList.sort((a, b) => a.week - b.week);
    
    // Generate key deliverables (top milestones that appear in multiple outcomes or are critical)
    const keyDeliverables = milestoneList
      .filter(m => m.outcomeNames.length > 1 || milestoneList.length <= 3)
      .slice(0, 3)
      .map(m => m.text);
    
    return {
      phaseId: phase.id,
      phaseName: phase.name,
      phaseShortName: phase.shortName,
      startWeek: phaseStartWeek === Infinity ? 0 : phaseStartWeek,
      endWeek: phaseEndWeek,
      outcomeCount: lanesWithPhase.length,
      outcomes: lanesWithPhase.map(lane => ({
        id: lane.outcomeId,
        name: lane.outcomeName,
        pillar: lane.pillar,
        pillarColor: lane.pillarColor
      })),
      allActivities,
      allMilestones: milestoneList,
      keyDeliverables
    };
  });

  return {
    phases: UNIFIED_JOURNEY_PHASES,
    lanes,
    consolidatedPhases,
    totalOutcomes: selectedOutcomes.length,
    totalMonths,
    sharedMilestones
  };
};
