export const CHANEL_DEMO_ACCOUNT = {
  id: 9999,
  name: "Chanel",
  industry: "Luxury Retail & Fashion",
  sector: "Haute Couture & Accessories",
  tier: "enterprise" as const,
  companyLogoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Chanel_logo.svg/200px-Chanel_logo.svg.png",
  website: "https://www.chanel.com",
  strategyNotes: "Global expansion into emerging markets while maintaining brand exclusivity. Focus on digital transformation, next-gen leadership pipeline, and sustainable luxury practices.",
  okrSummary: "O1: Accelerate leadership succession globally. O2: Reduce time-to-productivity for new boutique directors. O3: Strengthen cultural alignment across 400+ boutiques.",
  fiscalYearStart: "January",
  accountOwner: "Sarah Mitchell",
  clientSponsor: "Philippe Lefort, CHRO",
  annualContractValue: "$4.2M",
  primaryContactName: "Isabelle Renaud",
  primaryContactEmail: "i.renaud@chanel.com",
  healthScore: 85,
  totalValuePromised: 12500000,
  totalValueRealized: 4800000,
  status: "active" as const,
};

export const CHANEL_DEMO_PROJECT = {
  id: 9999,
  accountId: 9999,
  name: "Chanel",
  companyName: "Chanel S.A.",
  industry: "Luxury Retail & Fashion",
  phase: "alignment" as const,
  status: "active" as const,
  projectGoal: "Transform Chanel's leadership pipeline and talent development to support global expansion while preserving the maison's unique heritage and culture.",
  stakeholderName: "Philippe Lefort",
  stakeholderRole: "Chief Human Resources Officer",
  stakeholderEmail: "p.lefort@chanel.com",
  idealCustomerProfile: "Global luxury brand facing succession challenges, committed to cultural preservation, budget for transformation initiatives",
  aiResearchStatus: "completed" as const,
  discoveryFinalized: true,
};

export const CHANEL_DISCOVERY_INSIGHTS = [
  {
    id: 9001,
    projectId: 9999,
    title: "Critical Leadership Succession Gap",
    description: "Only 23% of boutique director roles have identified successors. With 35% of current directors retiring within 5 years, Chanel faces a significant leadership vacuum that threatens boutique performance and brand consistency.",
    category: "leadership",
    source: "ai_research",
    confidence: 92,
    priority: "critical",
    kornFerryPillar: "succession-planning",
    solutionArea: "ASSESS",
    isFollowUpNeeded: false,
    provenance: { source: "ai_research", model: "gpt-4o", generatedAt: new Date().toISOString() },
  },
  {
    id: 9002,
    projectId: 9999,
    title: "Extended New Director Onboarding",
    description: "New boutique directors take 14-18 months to reach full productivity vs. industry average of 9 months. This extended ramp-up period costs an estimated €2.3M annually in lost revenue opportunity.",
    category: "talent",
    source: "ai_research",
    confidence: 88,
    priority: "high",
    kornFerryPillar: "talent-acquisition",
    solutionArea: "DEVELOP",
    isFollowUpNeeded: false,
    provenance: { source: "ai_research", model: "gpt-4o", generatedAt: new Date().toISOString() },
  },
  {
    id: 9003,
    projectId: 9999,
    title: "Cultural Alignment Variance Across Regions",
    description: "Employee engagement surveys reveal 22-point variance in 'brand culture alignment' scores between European and Asia-Pacific boutiques. APAC region shows declining scores over past 3 years.",
    category: "culture",
    source: "ai_research",
    confidence: 85,
    priority: "high",
    kornFerryPillar: "culture-transformation",
    solutionArea: "TRANSFORM",
    isFollowUpNeeded: true,
    provenance: { source: "ai_research", model: "gpt-4o", generatedAt: new Date().toISOString() },
  },
  {
    id: 9004,
    projectId: 9999,
    title: "High Performer Retention Risk",
    description: "Voluntary turnover among high-potential talent (top 15%) is 18% vs. 8% industry benchmark for luxury retail. Exit interviews cite limited career visibility and development opportunities.",
    category: "talent",
    source: "ai_research",
    confidence: 90,
    priority: "critical",
    kornFerryPillar: "leadership-development",
    solutionArea: "DEVELOP",
    isFollowUpNeeded: false,
    provenance: { source: "ai_research", model: "gpt-4o", generatedAt: new Date().toISOString() },
  },
  {
    id: 9005,
    projectId: 9999,
    title: "Digital Skills Gap in Leadership",
    description: "Only 34% of current boutique directors rate themselves as 'confident' in digital client engagement tools. This limits omnichannel client experience delivery and threatens competitive position.",
    category: "capability",
    source: "ai_research",
    confidence: 82,
    priority: "medium",
    kornFerryPillar: "leadership-development",
    solutionArea: "DEVELOP",
    isFollowUpNeeded: true,
    provenance: { source: "ai_research", model: "gpt-4o", generatedAt: new Date().toISOString() },
  },
];

export const CHANEL_AI_OUTCOME_SUGGESTIONS = [
  {
    id: "outcome-suggestion-1",
    outcomeName: "Leadership Bench Strength Index",
    description: "Percentage of critical leadership roles with at least one ready-now successor identified and validated through assessment",
    outcomeType: "leading" as const,
    sourceInsightTitle: "Critical Leadership Succession Gap",
    sourceInsightId: 9001,
    valuePillar: "de-risk",
    solutionPattern: "succession-planning",
    suggestedBaseline: "23%",
    suggestedTarget: "75%",
    baselineReasoning: "Current internal assessment shows only 23% of 142 boutique director positions have identified successors. This baseline was derived from Chanel's Q3 talent review data and represents a significant gap compared to industry standards.",
    industryBenchmark: {
      low: "40%",
      median: "60%", 
      high: "80%",
      source: "Luxury Retail Talent Benchmark 2024"
    },
    targetRecommendation: {
      suggestedTarget: "75%",
      achievementRationale: "Based on Chanel's existing talent review infrastructure and executive commitment, achieving 75% bench strength is realistic. Korn Ferry has helped similar luxury brands increase their succession coverage by 40-50 percentage points within 12 months through structured assessment and accelerated development programs.",
      timeframeMonths: 12,
      successFactors: [
        "Executive sponsor commitment from CHRO Philippe Lefort",
        "Existing talent review data provides accurate baseline",
        "142 director roles are well-defined with clear competency models",
        "Proven Korn Ferry succession methodology for luxury retail"
      ]
    },
    kornFerryBenchmark: "Top-quartile luxury brands achieve 75-85% bench strength for critical roles",
    estimatedAnnualValue: 3200000,
    rationale: "Reducing succession risk protects €180M annual boutique revenue. Each unplanned director vacancy costs avg €420K in lost sales and transition costs.",
    confidence: 94,
    provenance: {
      source: "ai_generated",
      sourceInsightTitle: "Critical Leadership Succession Gap",
      generatedAt: new Date().toISOString()
    }
  },
  {
    id: "outcome-suggestion-2",
    outcomeName: "Time-to-Productivity (New Directors)",
    description: "Months required for new boutique directors to achieve 90% of target boutique performance metrics",
    outcomeType: "lagging" as const,
    sourceInsightTitle: "Extended New Director Onboarding",
    sourceInsightId: 9002,
    valuePillar: "optimise",
    solutionPattern: "leadership-development",
    suggestedBaseline: "16 months",
    suggestedTarget: "9 months",
    baselineReasoning: "Analysis of 47 director appointments over past 3 years shows median time to reach 90% boutique performance is 16 months. This significantly exceeds the 9-month luxury retail benchmark.",
    industryBenchmark: {
      low: "12 months",
      median: "9 months",
      high: "6 months",
      source: "Korn Ferry Luxury Retail Leadership Study"
    },
    targetRecommendation: {
      suggestedTarget: "9 months",
      achievementRationale: "Chanel's structured onboarding program provides a foundation to accelerate. By implementing Korn Ferry's leadership transition methodology with 90-day milestones, similar luxury brands have reduced time-to-productivity by 40-45%. The existing mentorship culture at Chanel will support rapid adoption.",
      timeframeMonths: 9,
      successFactors: [
        "Existing structured onboarding provides acceleration foundation",
        "Strong boutique mentor culture enables peer learning",
        "Clear performance metrics already defined for directors",
        "Regional training infrastructure is in place"
      ]
    },
    kornFerryBenchmark: "Best-in-class luxury retailers achieve 6-8 month director productivity ramp",
    estimatedAnnualValue: 2300000,
    rationale: "Reducing ramp time by 7 months across 15-20 annual appointments saves €2.3M in opportunity cost and accelerates boutique performance.",
    confidence: 88,
    provenance: {
      source: "ai_generated",
      sourceInsightTitle: "Extended New Director Onboarding",
      generatedAt: new Date().toISOString()
    }
  },
  {
    id: "outcome-suggestion-3",
    outcomeName: "Cultural Alignment Score",
    description: "Average employee score on 'I understand and embody the Chanel brand values' (1-10 scale)",
    outcomeType: "leading" as const,
    sourceInsightTitle: "Cultural Alignment Variance Across Regions",
    sourceInsightId: 9003,
    valuePillar: "strengthen-capability",
    solutionPattern: "culture-transformation",
    suggestedBaseline: "6.8",
    suggestedTarget: "8.5",
    baselineReasoning: "Global average from annual engagement survey is 6.8/10, with Europe at 7.9 and APAC at 5.7. The regional variance indicates inconsistent culture transmission and development.",
    industryBenchmark: {
      low: "6.5",
      median: "7.5",
      high: "8.5+",
      source: "Luxury Brand Culture Index"
    },
    targetRecommendation: {
      suggestedTarget: "8.5",
      achievementRationale: "Chanel's strong heritage culture provides the foundation for alignment. Focused cultural immersion programs for APAC combined with Europe-APAC mentorship pairings can close the gap. Korn Ferry has achieved similar 1.5+ point improvements for luxury brands within 12-18 months.",
      timeframeMonths: 15,
      successFactors: [
        "Strong European culture scores provide best-practice examples",
        "Heritage brand values are well-documented and revered",
        "APAC leadership receptive to cultural development programs",
        "Existing engagement survey infrastructure enables tracking"
      ]
    },
    kornFerryBenchmark: "Top luxury brands maintain 8.2+ cultural alignment with <10% regional variance",
    estimatedAnnualValue: 1800000,
    rationale: "Each 0.5 point increase in cultural alignment correlates with 3% improvement in client satisfaction and 2% reduction in voluntary turnover.",
    confidence: 85,
    provenance: {
      source: "ai_generated",
      sourceInsightTitle: "Cultural Alignment Variance Across Regions",
      generatedAt: new Date().toISOString()
    }
  },
  {
    id: "outcome-suggestion-4",
    outcomeName: "High-Potential Retention Rate",
    description: "Annual retention rate of employees identified as high-potential (top 15% performers)",
    outcomeType: "lagging" as const,
    sourceInsightTitle: "High Performer Retention Risk",
    sourceInsightId: 9004,
    valuePillar: "de-risk",
    solutionPattern: "talent-acquisition",
    suggestedBaseline: "82%",
    suggestedTarget: "92%",
    baselineReasoning: "Current high-potential turnover is 18% (82% retention). Exit data shows primary drivers are limited career visibility and development investment. Industry benchmark for luxury retail is 92%.",
    industryBenchmark: {
      low: "85%",
      median: "90%",
      high: "95%",
      source: "Global Luxury Talent Report 2024"
    },
    targetRecommendation: {
      suggestedTarget: "92%",
      achievementRationale: "Exit interview data reveals clear, addressable root causes: career visibility and development. By implementing structured career pathing with visible succession maps and personalized development plans, similar luxury brands have achieved 8-12 point retention improvements. Chanel's strong brand loyalty provides additional retention leverage.",
      timeframeMonths: 12,
      successFactors: [
        "Exit data clearly identifies addressable root causes",
        "Strong brand loyalty creates retention advantage",
        "Budget allocated for development investments",
        "HR systems support career path visibility"
      ]
    },
    kornFerryBenchmark: "Top employers in luxury achieve 93%+ high-potential retention through structured development",
    estimatedAnnualValue: 2800000,
    rationale: "Each high-potential departure costs 2.5x salary in replacement and lost institutional knowledge. Improving retention by 10% saves €2.8M annually.",
    confidence: 91,
    provenance: {
      source: "ai_generated",
      sourceInsightTitle: "High Performer Retention Risk",
      generatedAt: new Date().toISOString()
    }
  },
  {
    id: "outcome-suggestion-5",
    outcomeName: "Digital Leadership Capability Score",
    description: "Percentage of boutique directors certified as 'digitally proficient' through assessment",
    outcomeType: "leading" as const,
    sourceInsightTitle: "Digital Skills Gap in Leadership",
    sourceInsightId: 9005,
    valuePillar: "strengthen-capability",
    solutionPattern: "leadership-development",
    suggestedBaseline: "34%",
    suggestedTarget: "80%",
    baselineReasoning: "Self-assessment data shows only 34% of directors rate themselves confident in digital tools. Validated assessment would likely show even lower actual capability levels.",
    industryBenchmark: {
      low: "45%",
      median: "65%",
      high: "85%",
      source: "Luxury Digital Transformation Index"
    },
    targetRecommendation: {
      suggestedTarget: "80%",
      achievementRationale: "Digital proficiency is a learnable skill with the right program design. Chanel's investment in omnichannel infrastructure means directors have motivation to develop. Cohort-based certification programs with peer support typically achieve 70-80% certification rates within 6 months.",
      timeframeMonths: 8,
      successFactors: [
        "Directors motivated by omnichannel client demands",
        "Digital tools already deployed across boutiques",
        "Peer learning culture supports cohort approach",
        "Certification provides clear development milestone"
      ]
    },
    kornFerryBenchmark: "Leading omnichannel retailers achieve 80%+ digital proficiency in customer-facing leadership",
    estimatedAnnualValue: 1500000,
    rationale: "Digitally proficient directors drive 12% higher omnichannel conversion rates. Closing the capability gap unlocks €1.5M in digital revenue.",
    confidence: 82,
    provenance: {
      source: "ai_generated",
      sourceInsightTitle: "Digital Skills Gap in Leadership",
      generatedAt: new Date().toISOString()
    }
  },
  {
    id: "outcome-suggestion-6",
    outcomeName: "Succession Pipeline Velocity",
    description: "Average time (months) for high-potential employees to be ready for next-level role",
    outcomeType: "lagging" as const,
    sourceInsightTitle: "Critical Leadership Succession Gap",
    sourceInsightId: 9001,
    valuePillar: "optimise",
    solutionPattern: "succession-planning",
    suggestedBaseline: "36 months",
    suggestedTarget: "24 months",
    baselineReasoning: "Current talent pipeline analysis shows average 36-month development cycle for director-ready candidates. This is too slow given retirement timeline and growth plans.",
    industryBenchmark: {
      low: "30 months",
      median: "24 months",
      high: "18 months",
      source: "Executive Succession Benchmark"
    },
    targetRecommendation: {
      suggestedTarget: "24 months",
      achievementRationale: "Accelerated development programs with stretch assignments, executive mentoring, and targeted capability building can compress the 36-month timeline. Chanel's commitment to internal promotion provides motivation for high-potentials to engage with accelerated tracks. Korn Ferry's proven methodology achieves 25-35% timeline compression.",
      timeframeMonths: 18,
      successFactors: [
        "Strong internal promotion culture motivates participation",
        "Executive mentorship capacity is available",
        "Clear director competency model guides development",
        "Stretch assignment opportunities exist across regions"
      ]
    },
    kornFerryBenchmark: "Accelerated development programs achieve 18-24 month readiness cycles",
    estimatedAnnualValue: 900000,
    rationale: "Faster pipeline velocity reduces external hire dependency (40% premium) and ensures cultural fit. 12-month acceleration saves €900K annually.",
    confidence: 86,
    provenance: {
      source: "ai_generated",
      sourceInsightTitle: "Critical Leadership Succession Gap",
      generatedAt: new Date().toISOString()
    }
  }
];

export const CHANEL_CONFIRMED_OUTCOMES = [
  {
    id: 8001,
    projectId: 9999,
    name: "Leadership Bench Strength Index",
    description: "Percentage of critical leadership roles with at least one ready-now successor identified and validated",
    unit: "%",
    baselineValue: 23,
    targetValue: 75,
    targetDate: new Date("2025-12-31"),
    estimatedAnnualValue: 3200000,
    valuePillar: "de-risk",
    solutionPattern: "succession-planning",
    status: "client_confirmed",
    provenance: {
      source: "ai_generated",
      sourceInsightTitle: "Critical Leadership Succession Gap",
      outcomeType: "leading",
      generatedAt: new Date().toISOString()
    }
  },
  {
    id: 8002,
    projectId: 9999,
    name: "Time-to-Productivity (New Directors)",
    description: "Months required for new boutique directors to achieve 90% of target boutique performance metrics",
    unit: "months",
    baselineValue: 16,
    targetValue: 9,
    targetDate: new Date("2025-12-31"),
    estimatedAnnualValue: 2300000,
    valuePillar: "optimise",
    solutionPattern: "leadership-development",
    status: "client_confirmed",
    provenance: {
      source: "ai_generated",
      sourceInsightTitle: "Extended New Director Onboarding",
      outcomeType: "lagging",
      generatedAt: new Date().toISOString()
    }
  },
  {
    id: 8003,
    projectId: 9999,
    name: "High-Potential Retention Rate",
    description: "Annual retention rate of employees identified as high-potential (top 15% performers)",
    unit: "%",
    baselineValue: 82,
    targetValue: 92,
    targetDate: new Date("2025-12-31"),
    estimatedAnnualValue: 2800000,
    valuePillar: "de-risk",
    solutionPattern: "talent-acquisition",
    status: "client_confirmed",
    provenance: {
      source: "ai_generated",
      sourceInsightTitle: "High Performer Retention Risk",
      outcomeType: "lagging",
      generatedAt: new Date().toISOString()
    }
  },
];

export const CHANEL_HANDOFF_PACKET = {
  id: 7001,
  projectId: 9999,
  commitmentIds: [8001, 8002, 8003],
  executiveSummary: "Strategic talent transformation initiative for Chanel focusing on leadership succession, director development, and high-potential retention. Total annual value of €8.3M across three confirmed outcomes. Client sponsor Philippe Lefort (CHRO) has approved targets and timeline. Q1 2025 kickoff with monthly progress reviews.",
  createdAt: new Date(),
  createdBy: "Sarah Mitchell",
  acceptanceState: "accepted",
  acceptedAt: new Date(),
  acceptedBy: "Marie Dubois",
  csmOwnerName: "Marie Dubois",
  acceptanceNotes: "Confirmed alignment with Chanel leadership. Establishing measurement framework in partnership with HR Analytics team. First progress review scheduled for January 2025.",
};

export const CHANEL_DELIVERY_OUTCOMES = [
  {
    id: 8001,
    projectId: 9999,
    name: "Leadership Bench Strength Index",
    description: "Percentage of critical leadership roles with at least one ready-now successor identified and validated",
    unit: "%",
    baselineValue: 23,
    targetValue: 75,
    currentValue: 38,
    estimatedAnnualValue: 3200000,
    status: "in_delivery",
    healthStatus: "on-track",
    lastMeasurement: new Date("2024-11-15"),
    measurements: [
      { date: "2024-09-01", value: 23, notes: "Baseline established" },
      { date: "2024-10-01", value: 29, notes: "Initial succession assessments completed for EU region" },
      { date: "2024-11-15", value: 38, notes: "APAC succession mapping complete, 21 new successors identified" },
    ]
  },
  {
    id: 8002,
    projectId: 9999,
    name: "Time-to-Productivity (New Directors)",
    description: "Months required for new boutique directors to achieve 90% of target boutique performance metrics",
    unit: "months",
    baselineValue: 16,
    targetValue: 9,
    currentValue: 13,
    estimatedAnnualValue: 2300000,
    status: "in_delivery",
    healthStatus: "at-risk",
    lastMeasurement: new Date("2024-11-10"),
    measurements: [
      { date: "2024-09-01", value: 16, notes: "Baseline confirmed from cohort analysis" },
      { date: "2024-11-10", value: 13, notes: "Accelerated onboarding program launched, early results promising but slower than projected" },
    ]
  },
  {
    id: 8003,
    projectId: 9999,
    name: "High-Potential Retention Rate",
    description: "Annual retention rate of employees identified as high-potential (top 15% performers)",
    unit: "%",
    baselineValue: 82,
    targetValue: 92,
    currentValue: 87,
    estimatedAnnualValue: 2800000,
    status: "in_delivery",
    healthStatus: "on-track",
    lastMeasurement: new Date("2024-11-20"),
    measurements: [
      { date: "2024-09-01", value: 82, notes: "YTD baseline from HRIS data" },
      { date: "2024-10-15", value: 84, notes: "Career pathing program launched" },
      { date: "2024-11-20", value: 87, notes: "Strong improvement, 3 at-risk HiPos retained through intervention" },
    ]
  },
];

export const DEMO_TOUR_STEPS = [
  {
    target: '[data-demo-step="account-header"]',
    title: "Welcome to the Client Value Hub",
    content: "This is your single source of truth for client engagement. Every insight, outcome, and value commitment lives here - from first discovery to realized business impact.",
    placement: "bottom" as const,
    spotlightPadding: 10,
  },
  {
    target: '[data-demo-step="discovery-research"]',
    title: "AI-Powered Discovery",
    content: "Our AI analyzes 50+ data sources in seconds - annual reports, earnings calls, news, and industry benchmarks. No more hours of manual research. This uncovered 5 critical insights for Chanel.",
    placement: "right" as const,
    spotlightPadding: 10,
  },
  {
    target: '[data-demo-step="insight-card"]',
    title: "Actionable Insights",
    content: "Each insight is prioritized by business impact and mapped to Korn Ferry capabilities. See how 'Critical Leadership Succession Gap' directly links to our Succession Planning solutions.",
    placement: "bottom" as const,
    spotlightPadding: 10,
  },
  {
    target: '[data-demo-step="kpi-suggestions"]',
    title: "AI-Suggested Outcomes with Benchmarks",
    content: "The magic: AI transforms insights into measurable outcomes with Industry Benchmarks and Korn Ferry data. No manual re-entry - the connection is automatic and fully traceable.",
    placement: "left" as const,
    spotlightPadding: 10,
  },
  {
    target: '[data-demo-step="benchmark-display"]',
    title: "Data-Driven Recommendations",
    content: "Every outcome shows Industry Benchmarks (low/mid/high ranges) and Korn Ferry best practice data. Clients see exactly where they stand and what 'good' looks like.",
    placement: "bottom" as const,
    spotlightPadding: 10,
  },
  {
    target: '[data-demo-step="multi-select"]',
    title: "Batch Operations",
    content: "Select multiple outcomes at once and add them in a single action. Time saved: consultants report 70% faster outcome setup compared to manual entry.",
    placement: "right" as const,
    spotlightPadding: 10,
  },
  {
    target: '[data-demo-step="kpi-pipeline"]',
    title: "Visual Outcome Pipeline",
    content: "Track outcomes from draft to client confirmation to delivery. The purple 'AI Generated' badges show full provenance - executives love the audit trail.",
    placement: "bottom" as const,
    spotlightPadding: 10,
  },
  {
    target: '[data-demo-step="handoff-section"]',
    title: "Seamless Sales-to-Delivery Handoff",
    content: "One click bundles confirmed outcomes into a handoff package. The delivery team receives complete context - no information lost in transition.",
    placement: "left" as const,
    spotlightPadding: 10,
  },
  {
    target: '[data-demo-step="delivery-dashboard"]',
    title: "Delivery Value Tracking",
    content: "CSMs track progress against promised outcomes. Visual health indicators (On Track, At Risk) enable proactive intervention before QBRs.",
    placement: "right" as const,
    spotlightPadding: 10,
  },
  {
    target: '[data-demo-step="value-summary"]',
    title: "Executive Value Summary",
    content: "Real-time view of €8.3M in promised value, with €4.8M already realized. This is the ROI story that wins renewals.",
    placement: "bottom" as const,
    spotlightPadding: 10,
  },
];
