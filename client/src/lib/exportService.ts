import pptxgen from "pptxgenjs";
import { jsPDF } from "jspdf";

const KORN_FERRY_COLORS = {
  primary: "#00338D",
  secondary: "#FF6B35",
  accent: "#FF6B35",
  success: "#10B981",
  warning: "#F59E0B",
  background: "#F8FAFC",
  text: "#1E293B",
  muted: "#64748B",
  white: "#FFFFFF",
  teal: "#0891B2",
  purple: "#7C3AED",
  cardBg: "#F1F5F9",
};

const FONTS = {
  heading: "Arial",
  body: "Arial",
};

// Export Options Interface
export interface ExportOptions {
  includeTheme: boolean;
  includeIntelligence: boolean;
  includeClientInteraction: boolean;
  includeSummary: boolean;
}

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  includeTheme: true,
  includeIntelligence: true,
  includeClientInteraction: true,
  includeSummary: true,
};

interface ExternalLink {
  label: string;
  url: string;
  source?: string;
}

export interface IntelligenceExportData {
  companyName: string;
  industry?: string;
  theme?: string;
  executiveSummary?: string;
  companyWebsite?: string;
  companyDetails?: {
    headquarters?: string;
    employeeCount?: string;
    revenue?: string;
    founded?: string;
  };
  insights: Array<{
    title: string;
    value: string;
    category?: string;
    priority?: string;
    sourceUrl?: string;
    kfOpportunity?: string;
    potentialValue?: string;
    relevantCapability?: string;
  }>;
  recentNews?: Array<{
    date: string;
    headline: string;
    source: string;
    summary: string;
    relevance?: string;
    opportunityType?: string;
  }>;
  competitors?: Array<{
    name: string;
    description: string;
    competitivePosition: string;
  }>;
  keyPeople?: Array<{
    name: string;
    title: string;
    relevance: string;
  }>;
  themeSpecificInsights?: {
    opportunitySignal?: string;
    howWeHelp?: string[];
    potentialValue?: string;
    keyQuestions?: string[];
  };
  annualReportSummary?: {
    fiscalYear: string;
    ceoLetterHighlights?: string[];
    strategicPriorities?: string[];
    riskFactors?: string[];
    reportUrl?: string;
    peopleMetrics?: {
      headcount?: string;
      turnover?: string;
      diversity?: string;
      engagement?: string;
    };
  };
  earningsCallHighlights?: {
    quarter: string;
    executiveCommentary?: string[];
    workforceDiscussions?: string[];
    futureOutlook?: string;
    analystQuestions?: string[];
    transcriptUrl?: string;
  };
  followUpResearch?: Array<{
    question: string;
    answer: string;
  }>;
  probeHistory?: Array<{
    role: string;
    content: string;
  }>;
  meetingAttendees?: Array<{
    name: string;
    title?: string;
    role?: string;
    influence?: string;
    affiliation?: string;
    linkedInUrl?: string;
  }>;
  greenSheet?: {
    objective?: string;
    desiredOutcome?: string;
    openingStatement?: string;
    bestActionCommitment?: string;
  };
  discoveryQuestions?: Array<{
    question: string;
    answer?: string;
    methodology?: string;
  }>;
  storyCoaching?: {
    keyMessage?: string;
    emotionalGoal?: string;
    openingHook?: string;
    turningPoint?: string;
    callToAction?: string;
    tensionQuestions?: Array<{
      prompt: string;
      response?: string;
      methodology?: string;
    }>;
  };
  narrativeCanvas?: {
    opener?: string;
    keyMessage?: string;
    proofPoint?: string;
    keyQuestions?: string[];
    callToAction?: string;
  };
  discoveryNotes?: {
    freeformNotes?: string;
    topChallenges?: string;
    keyStakeholder?: string;
  };
  valueCases?: Array<{
    title: string;
    description?: string;
    valuePillar?: string;
    estimatedValue?: number;
    status?: string;
  }>;
  notes?: Array<{
    content: string;
    category?: string;
    createdAt?: string;
  }>;
  dataPoints?: Array<{
    title: string;
    value: string;
    category?: string;
    priority?: string;
  }>;
  externalLinks?: ExternalLink[];
}

interface OutcomeExportData {
  companyName: string;
  initiativeName: string;
  outcomes: Array<{
    title: string;
    description?: string;
    valuePillar: string;
    status: string;
    estimatedValue?: string;
  }>;
  kpis: Array<{
    name: string;
    baseline?: string;
    target?: string;
    unit?: string;
    status?: string;
  }>;
  totalValue?: string;
  valueNarrative?: string;
}

interface CoachingExportData {
  companyName: string;
  initiativeName: string;
  synthesis?: string;
  recommendations: Array<{
    title: string;
    description: string;
    priority?: string;
  }>;
  talkingPoints?: string[];
  nextSteps?: string[];
}

// Visual styling helpers for enhanced exports
function addGradientHeader(slide: pptxgen.Slide, title: string, subtitle?: string) {
  // Gradient effect using two overlapping rectangles
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: "100%",
    h: 1.0,
    fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") },
  });
  slide.addShape("rect", {
    x: 0,
    y: 0.7,
    w: "100%",
    h: 0.3,
    fill: { color: KORN_FERRY_COLORS.teal.replace("#", "") },
  });

  slide.addText(title, {
    x: 0.5,
    y: 0.25,
    w: 8,
    h: 0.4,
    fontSize: 22,
    fontFace: FONTS.heading,
    color: KORN_FERRY_COLORS.white.replace("#", ""),
    bold: true,
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5,
      y: 0.65,
      w: 8,
      h: 0.25,
      fontSize: 11,
      fontFace: FONTS.body,
      color: KORN_FERRY_COLORS.white.replace("#", ""),
    });
  }

  slide.addText("KORN FERRY", {
    x: 8,
    y: 0.3,
    w: 1.5,
    h: 0.3,
    fontSize: 10,
    fontFace: FONTS.body,
    color: KORN_FERRY_COLORS.secondary.replace("#", ""),
    align: "right",
    bold: true,
  });
}

function addCardContainer(slide: pptxgen.Slide, x: number, y: number, w: number, h: number, accentColor?: string) {
  slide.addShape("rect", {
    x,
    y,
    w,
    h,
    fill: { color: KORN_FERRY_COLORS.cardBg.replace("#", "") },
    line: { color: "E2E8F0", pt: 1 },
  });
  if (accentColor) {
    slide.addShape("rect", {
      x,
      y,
      w: 0.08,
      h,
      fill: { color: accentColor.replace("#", "") },
    });
  }
}

function addSectionDivider(slide: pptxgen.Slide, y: number, label: string, color?: string) {
  const lineColor = color || KORN_FERRY_COLORS.teal;
  slide.addShape("rect", {
    x: 0.5,
    y,
    w: 9,
    h: 0.02,
    fill: { color: lineColor.replace("#", "") },
  });
  slide.addText(label.toUpperCase(), {
    x: 0.5,
    y: y + 0.05,
    w: 3,
    h: 0.25,
    fontSize: 9,
    fontFace: FONTS.heading,
    color: lineColor.replace("#", ""),
    bold: true,
  });
}

function addKFHeader(pres: pptxgen, slide: pptxgen.Slide, title: string) {
  addGradientHeader(slide, title);
}

function addKFFooter(slide: pptxgen.Slide, pageNum: number) {
  slide.addText(`Page ${pageNum}`, {
    x: 4.5,
    y: 5.3,
    w: 1,
    h: 0.2,
    fontSize: 8,
    fontFace: FONTS.body,
    color: KORN_FERRY_COLORS.muted.replace("#", ""),
    align: "center",
  });

  slide.addText("Confidential", {
    x: 8.5,
    y: 5.3,
    w: 1,
    h: 0.2,
    fontSize: 8,
    fontFace: FONTS.body,
    color: KORN_FERRY_COLORS.muted.replace("#", ""),
    align: "right",
  });
}

export function generateIntelligencePPT(data: IntelligenceExportData, options: ExportOptions = DEFAULT_EXPORT_OPTIONS): void {
  const pres = new pptxgen();
  pres.title = `${data.companyName} - Discovery Report`;
  pres.author = "Korn Ferry Loop";
  pres.layout = "LAYOUT_WIDE";

  let pageNum = 1;

  // Enhanced Title Slide with gradient and visual elements
  const titleSlide = pres.addSlide();
  // Background gradient effect
  titleSlide.addShape("rect", {
    x: 0,
    y: 0,
    w: "100%",
    h: "100%",
    fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") },
  });
  // Accent stripe
  titleSlide.addShape("rect", {
    x: 0,
    y: 4.2,
    w: "100%",
    h: 0.15,
    fill: { color: KORN_FERRY_COLORS.teal.replace("#", "") },
  });
  // Secondary accent
  titleSlide.addShape("rect", {
    x: 0,
    y: 4.4,
    w: "100%",
    h: 0.08,
    fill: { color: KORN_FERRY_COLORS.secondary.replace("#", "") },
  });
  
  titleSlide.addText("DISCOVERY REPORT", {
    x: 0.5,
    y: 1.3,
    w: 9,
    h: 0.6,
    fontSize: 38,
    fontFace: FONTS.heading,
    color: KORN_FERRY_COLORS.white.replace("#", ""),
    bold: true,
  });
  titleSlide.addText(data.companyName, {
    x: 0.5,
    y: 2.0,
    w: 9,
    h: 0.5,
    fontSize: 28,
    fontFace: FONTS.heading,
    color: KORN_FERRY_COLORS.secondary.replace("#", ""),
  });
  if (data.industry) {
    titleSlide.addText(data.industry, {
      x: 0.5,
      y: 2.6,
      w: 9,
      h: 0.4,
      fontSize: 18,
      fontFace: FONTS.body,
      color: KORN_FERRY_COLORS.white.replace("#", ""),
    });
  }
  if (options.includeTheme && data.theme) {
    titleSlide.addText(`Theme: ${data.theme}`, {
      x: 0.5,
      y: 3.1,
      w: 9,
      h: 0.35,
      fontSize: 14,
      fontFace: FONTS.body,
      color: KORN_FERRY_COLORS.teal.replace("#", ""),
      italic: true,
    });
  }
  // Company website link if available
  if (data.companyWebsite) {
    titleSlide.addText(data.companyWebsite, {
      x: 0.5,
      y: 3.6,
      w: 9,
      h: 0.3,
      fontSize: 11,
      fontFace: FONTS.body,
      color: KORN_FERRY_COLORS.teal.replace("#", ""),
      hyperlink: { url: data.companyWebsite },
    });
  }
  titleSlide.addText(`Generated ${new Date().toLocaleDateString()}`, {
    x: 0.5,
    y: 4.7,
    w: 9,
    h: 0.3,
    fontSize: 12,
    fontFace: FONTS.body,
    color: KORN_FERRY_COLORS.muted.replace("#", ""),
  });
  titleSlide.addText("KORN FERRY", {
    x: 8,
    y: 0.3,
    w: 1.5,
    h: 0.3,
    fontSize: 12,
    fontFace: FONTS.heading,
    color: KORN_FERRY_COLORS.secondary.replace("#", ""),
    align: "right",
    bold: true,
  });

  // ===== COMPANY PROFILE SLIDE =====
  if (options.includeIntelligence && (data.executiveSummary || data.companyDetails)) {
    pageNum++;
    const profileSlide = pres.addSlide();
    addGradientHeader(profileSlide, "Company Profile", `${data.companyName} - Overview`);

    let yPos = 1.2;

    if (data.companyDetails) {
      const details = data.companyDetails;
      const detailItems = [
        { label: "Headquarters", value: details.headquarters },
        { label: "Employees", value: details.employeeCount },
        { label: "Revenue", value: details.revenue },
        { label: "Founded", value: details.founded },
        { label: "Industry", value: data.industry },
      ].filter(d => d.value);

      if (detailItems.length > 0) {
        addCardContainer(profileSlide, 0.5, yPos, 9, 0.7, KORN_FERRY_COLORS.teal);
        const detailText = detailItems.map(d => `${d.label}: ${d.value}`).join("  |  ");
        profileSlide.addText(detailText, {
          x: 0.7, y: yPos + 0.15, w: 8.6, h: 0.4,
          fontSize: 11, fontFace: FONTS.body, color: KORN_FERRY_COLORS.text.replace("#", ""),
        });
        yPos += 0.9;
      }
    }

    if (data.executiveSummary) {
      profileSlide.addText("Executive Summary", {
        x: 0.5, y: yPos, w: 9, h: 0.3,
        fontSize: 13, fontFace: FONTS.heading, color: KORN_FERRY_COLORS.primary.replace("#", ""), bold: true,
      });
      yPos += 0.35;
      addCardContainer(profileSlide, 0.5, yPos, 9, 3.0, KORN_FERRY_COLORS.teal);
      profileSlide.addText(data.executiveSummary, {
        x: 0.7, y: yPos + 0.1, w: 8.6, h: 2.8,
        fontSize: 11, fontFace: FONTS.body, color: KORN_FERRY_COLORS.text.replace("#", ""), valign: "top",
      });
    }
    addKFFooter(profileSlide, pageNum);
  }

  // ===== STRATEGIC INSIGHTS SLIDES (paginated) =====
  if (options.includeIntelligence && data.insights.length > 0) {
    const insightsPerSlide = 4;
    for (let i = 0; i < data.insights.length; i += insightsPerSlide) {
      pageNum++;
      const batch = data.insights.slice(i, i + insightsPerSlide);
      const insightsSlide = pres.addSlide();
      addGradientHeader(insightsSlide, "Strategic Insights", `${i + 1}-${Math.min(i + insightsPerSlide, data.insights.length)} of ${data.insights.length}`);

      let yPos = 1.2;
      batch.forEach((insight) => {
        addCardContainer(insightsSlide, 0.5, yPos, 9, 0.9, KORN_FERRY_COLORS.teal);
        insightsSlide.addText(insight.title, {
          x: 0.7, y: yPos + 0.05, w: 5, h: 0.25,
          fontSize: 11, fontFace: FONTS.heading, color: KORN_FERRY_COLORS.primary.replace("#", ""), bold: true,
        });
        if (insight.priority) {
          insightsSlide.addText(insight.priority.toUpperCase(), {
            x: 7.5, y: yPos + 0.05, w: 1.8, h: 0.2,
            fontSize: 8, fontFace: FONTS.body, color: insight.priority === "high" ? "DC2626" : KORN_FERRY_COLORS.muted.replace("#", ""), align: "right",
          });
        }
        insightsSlide.addText(insight.value, {
          x: 0.7, y: yPos + 0.3, w: 8.6, h: 0.35,
          fontSize: 10, fontFace: FONTS.body, color: KORN_FERRY_COLORS.text.replace("#", ""), valign: "top",
        });
        if (insight.kfOpportunity) {
          insightsSlide.addText(`KF Opportunity: ${insight.kfOpportunity}`, {
            x: 0.7, y: yPos + 0.65, w: 8.6, h: 0.2,
            fontSize: 9, fontFace: FONTS.body, color: KORN_FERRY_COLORS.secondary.replace("#", ""), italic: true,
          });
        }
        yPos += 1.0;
      });
      addKFFooter(insightsSlide, pageNum);
    }
  }

  // ===== THEME-SPECIFIC INSIGHTS SLIDE =====
  if (options.includeIntelligence && data.themeSpecificInsights && data.theme) {
    pageNum++;
    const themeSlide = pres.addSlide();
    addGradientHeader(themeSlide, `Theme Analysis: ${data.theme}`, "Opportunity Assessment");

    let yPos = 1.2;
    if (data.themeSpecificInsights.opportunitySignal) {
      addCardContainer(themeSlide, 0.5, yPos, 9, 0.8, KORN_FERRY_COLORS.secondary);
      themeSlide.addText("Opportunity Signal", {
        x: 0.7, y: yPos + 0.05, w: 3, h: 0.2,
        fontSize: 10, fontFace: FONTS.heading, color: KORN_FERRY_COLORS.secondary.replace("#", ""), bold: true,
      });
      themeSlide.addText(data.themeSpecificInsights.opportunitySignal, {
        x: 0.7, y: yPos + 0.3, w: 8.6, h: 0.4,
        fontSize: 10, fontFace: FONTS.body, color: KORN_FERRY_COLORS.text.replace("#", ""), valign: "top",
      });
      yPos += 0.95;
    }
    if (data.themeSpecificInsights.potentialValue) {
      themeSlide.addText(`Potential Value: ${data.themeSpecificInsights.potentialValue}`, {
        x: 0.5, y: yPos, w: 9, h: 0.3,
        fontSize: 12, fontFace: FONTS.heading, color: KORN_FERRY_COLORS.success.replace("#", ""), bold: true,
      });
      yPos += 0.4;
    }
    if (data.themeSpecificInsights.howWeHelp?.length) {
      addSectionDivider(themeSlide, yPos, "How Korn Ferry Helps", KORN_FERRY_COLORS.primary);
      yPos += 0.35;
      data.themeSpecificInsights.howWeHelp.forEach((item) => {
        themeSlide.addText(`• ${item}`, {
          x: 0.7, y: yPos, w: 8.5, h: 0.25,
          fontSize: 10, fontFace: FONTS.body, color: KORN_FERRY_COLORS.text.replace("#", ""),
        });
        yPos += 0.3;
      });
    }
    if (data.themeSpecificInsights.keyQuestions?.length) {
      yPos += 0.1;
      addSectionDivider(themeSlide, yPos, "Key Questions to Explore", KORN_FERRY_COLORS.teal);
      yPos += 0.35;
      data.themeSpecificInsights.keyQuestions.forEach((q) => {
        themeSlide.addText(`• ${q}`, {
          x: 0.7, y: yPos, w: 8.5, h: 0.25,
          fontSize: 10, fontFace: FONTS.body, color: KORN_FERRY_COLORS.text.replace("#", ""),
        });
        yPos += 0.3;
      });
    }
    addKFFooter(themeSlide, pageNum);
  }

  // ===== RECENT NEWS SLIDE =====
  if (options.includeIntelligence && data.recentNews && data.recentNews.length > 0) {
    pageNum++;
    const newsSlide = pres.addSlide();
    addGradientHeader(newsSlide, "Recent News & Developments", `${data.recentNews.length} items tracked`);

    let yPos = 1.2;
    data.recentNews.slice(0, 6).forEach((news) => {
      const relevanceColor = news.relevance === "high" ? KORN_FERRY_COLORS.secondary : news.relevance === "medium" ? KORN_FERRY_COLORS.teal : KORN_FERRY_COLORS.muted;
      addCardContainer(newsSlide, 0.5, yPos, 9, 0.6, relevanceColor);
      newsSlide.addText(news.headline, {
        x: 0.7, y: yPos + 0.05, w: 7, h: 0.2,
        fontSize: 10, fontFace: FONTS.heading, color: KORN_FERRY_COLORS.primary.replace("#", ""), bold: true,
      });
      newsSlide.addText(`${news.date} | ${news.source}`, {
        x: 7.8, y: yPos + 0.05, w: 1.5, h: 0.15,
        fontSize: 7, fontFace: FONTS.body, color: KORN_FERRY_COLORS.muted.replace("#", ""), align: "right",
      });
      newsSlide.addText(news.summary, {
        x: 0.7, y: yPos + 0.28, w: 8.6, h: 0.25,
        fontSize: 9, fontFace: FONTS.body, color: KORN_FERRY_COLORS.text.replace("#", ""), valign: "top",
      });
      yPos += 0.7;
    });
    addKFFooter(newsSlide, pageNum);
  }

  // ===== COMPETITIVE LANDSCAPE SLIDE =====
  if (options.includeIntelligence && data.competitors && data.competitors.length > 0) {
    pageNum++;
    const compSlide = pres.addSlide();
    addGradientHeader(compSlide, "Competitive Landscape", "Market Position & Competitors");

    const compRows: pptxgen.TableRow[] = [
      [
        { text: "Competitor", options: { bold: true, fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") }, color: KORN_FERRY_COLORS.white.replace("#", ""), fontSize: 10 } },
        { text: "Description", options: { bold: true, fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") }, color: KORN_FERRY_COLORS.white.replace("#", ""), fontSize: 10 } },
        { text: "Competitive Position", options: { bold: true, fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") }, color: KORN_FERRY_COLORS.white.replace("#", ""), fontSize: 10 } },
      ],
    ];
    data.competitors.forEach((comp) => {
      compRows.push([
        { text: comp.name, options: { fontSize: 10, bold: true } },
        { text: comp.description, options: { fontSize: 9 } },
        { text: comp.competitivePosition, options: { fontSize: 9 } },
      ]);
    });
    compSlide.addTable(compRows, {
      x: 0.5, y: 1.2, w: 9, colW: [2, 4, 3],
      border: { pt: 0.5, color: KORN_FERRY_COLORS.muted.replace("#", "") }, fontFace: FONTS.body,
    });
    addKFFooter(compSlide, pageNum);
  }

  // ===== KEY PEOPLE SLIDE =====
  if (options.includeIntelligence && data.keyPeople && data.keyPeople.length > 0) {
    pageNum++;
    const peopleSlide = pres.addSlide();
    addGradientHeader(peopleSlide, "Key People & Executives", "Leadership Team");

    const peopleRows: pptxgen.TableRow[] = [
      [
        { text: "Name", options: { bold: true, fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") }, color: KORN_FERRY_COLORS.white.replace("#", ""), fontSize: 10 } },
        { text: "Title", options: { bold: true, fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") }, color: KORN_FERRY_COLORS.white.replace("#", ""), fontSize: 10 } },
        { text: "Relevance", options: { bold: true, fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") }, color: KORN_FERRY_COLORS.white.replace("#", ""), fontSize: 10 } },
      ],
    ];
    data.keyPeople.forEach((person) => {
      peopleRows.push([
        { text: person.name, options: { fontSize: 10, bold: true } },
        { text: person.title, options: { fontSize: 10 } },
        { text: person.relevance, options: { fontSize: 9 } },
      ]);
    });
    peopleSlide.addTable(peopleRows, {
      x: 0.5, y: 1.2, w: 9, colW: [2.5, 3, 3.5],
      border: { pt: 0.5, color: KORN_FERRY_COLORS.muted.replace("#", "") }, fontFace: FONTS.body,
    });
    addKFFooter(peopleSlide, pageNum);
  }

  // ===== ANNUAL REPORT SLIDE =====
  if (options.includeIntelligence && data.annualReportSummary) {
    pageNum++;
    const arSlide = pres.addSlide();
    addGradientHeader(arSlide, `Annual Report - ${data.annualReportSummary.fiscalYear}`, data.annualReportSummary.reportUrl ? "Click link below for full report" : undefined);

    let yPos = 1.2;

    if (data.annualReportSummary.strategicPriorities?.length) {
      arSlide.addText("Strategic Priorities", {
        x: 0.5, y: yPos, w: 9, h: 0.3,
        fontSize: 13, fontFace: FONTS.heading, color: KORN_FERRY_COLORS.primary.replace("#", ""), bold: true,
      });
      yPos += 0.35;
      data.annualReportSummary.strategicPriorities.forEach((priority) => {
        arSlide.addText(`• ${priority}`, {
          x: 0.7, y: yPos, w: 8.5, h: 0.25,
          fontSize: 10, fontFace: FONTS.body, color: KORN_FERRY_COLORS.text.replace("#", ""),
        });
        yPos += 0.3;
      });
    }

    if (data.annualReportSummary.ceoLetterHighlights?.length) {
      yPos += 0.15;
      arSlide.addText("CEO Letter Highlights", {
        x: 0.5, y: yPos, w: 9, h: 0.3,
        fontSize: 13, fontFace: FONTS.heading, color: KORN_FERRY_COLORS.primary.replace("#", ""), bold: true,
      });
      yPos += 0.35;
      data.annualReportSummary.ceoLetterHighlights.forEach((highlight) => {
        arSlide.addText(`• ${highlight}`, {
          x: 0.7, y: yPos, w: 8.5, h: 0.25,
          fontSize: 10, fontFace: FONTS.body, color: KORN_FERRY_COLORS.text.replace("#", ""),
        });
        yPos += 0.3;
      });
    }

    if (data.annualReportSummary.riskFactors?.length) {
      yPos += 0.15;
      arSlide.addText("Risk Factors", {
        x: 0.5, y: yPos, w: 9, h: 0.3,
        fontSize: 13, fontFace: FONTS.heading, color: KORN_FERRY_COLORS.warning.replace("#", ""), bold: true,
      });
      yPos += 0.35;
      data.annualReportSummary.riskFactors.forEach((risk) => {
        arSlide.addText(`• ${risk}`, {
          x: 0.7, y: yPos, w: 8.5, h: 0.25,
          fontSize: 10, fontFace: FONTS.body, color: KORN_FERRY_COLORS.text.replace("#", ""),
        });
        yPos += 0.3;
      });
    }

    if (data.annualReportSummary.peopleMetrics) {
      const pm = data.annualReportSummary.peopleMetrics;
      const metrics = [
        { label: "Headcount", value: pm.headcount },
        { label: "Turnover", value: pm.turnover },
        { label: "Diversity", value: pm.diversity },
        { label: "Engagement", value: pm.engagement },
      ].filter(m => m.value);
      if (metrics.length > 0) {
        yPos += 0.15;
        arSlide.addText("People Metrics", {
          x: 0.5, y: yPos, w: 9, h: 0.3,
          fontSize: 13, fontFace: FONTS.heading, color: KORN_FERRY_COLORS.purple.replace("#", ""), bold: true,
        });
        yPos += 0.35;
        metrics.forEach((m) => {
          arSlide.addText(`${m.label}: ${m.value}`, {
            x: 0.7, y: yPos, w: 8.5, h: 0.25,
            fontSize: 10, fontFace: FONTS.body, color: KORN_FERRY_COLORS.text.replace("#", ""),
          });
          yPos += 0.28;
        });
      }
    }

    if (data.annualReportSummary.reportUrl) {
      arSlide.addText(data.annualReportSummary.reportUrl, {
        x: 0.5, y: 4.8, w: 9, h: 0.25,
        fontSize: 9, fontFace: FONTS.body, color: KORN_FERRY_COLORS.teal.replace("#", ""),
        hyperlink: { url: data.annualReportSummary.reportUrl },
      });
    }
    addKFFooter(arSlide, pageNum);
  }

  // ===== EARNINGS CALL SLIDE =====
  if (options.includeIntelligence && data.earningsCallHighlights) {
    pageNum++;
    const ecSlide = pres.addSlide();
    addGradientHeader(ecSlide, `Earnings Call - ${data.earningsCallHighlights.quarter}`, data.earningsCallHighlights.transcriptUrl ? "Click link for transcript" : undefined);

    let yPos = 1.2;

    if (data.earningsCallHighlights.executiveCommentary?.length) {
      ecSlide.addText("Executive Commentary", {
        x: 0.5, y: yPos, w: 9, h: 0.3,
        fontSize: 13, fontFace: FONTS.heading, color: KORN_FERRY_COLORS.primary.replace("#", ""), bold: true,
      });
      yPos += 0.35;
      data.earningsCallHighlights.executiveCommentary.forEach((quote) => {
        ecSlide.addText(`"${quote}"`, {
          x: 0.7, y: yPos, w: 8.5, h: 0.35,
          fontSize: 10, fontFace: FONTS.body, color: KORN_FERRY_COLORS.text.replace("#", ""), italic: true,
        });
        yPos += 0.4;
      });
    }

    if (data.earningsCallHighlights.workforceDiscussions?.length) {
      yPos += 0.1;
      ecSlide.addText("Workforce Discussions", {
        x: 0.5, y: yPos, w: 9, h: 0.3,
        fontSize: 13, fontFace: FONTS.heading, color: KORN_FERRY_COLORS.purple.replace("#", ""), bold: true,
      });
      yPos += 0.35;
      data.earningsCallHighlights.workforceDiscussions.forEach((item) => {
        ecSlide.addText(`• ${item}`, {
          x: 0.7, y: yPos, w: 8.5, h: 0.25,
          fontSize: 10, fontFace: FONTS.body, color: KORN_FERRY_COLORS.text.replace("#", ""),
        });
        yPos += 0.3;
      });
    }

    if (data.earningsCallHighlights.futureOutlook) {
      yPos += 0.1;
      ecSlide.addText("Future Outlook", {
        x: 0.5, y: yPos, w: 9, h: 0.25,
        fontSize: 13, fontFace: FONTS.heading, color: KORN_FERRY_COLORS.primary.replace("#", ""), bold: true,
      });
      yPos += 0.3;
      ecSlide.addText(data.earningsCallHighlights.futureOutlook, {
        x: 0.7, y: yPos, w: 8.5, h: 0.6,
        fontSize: 10, fontFace: FONTS.body, color: KORN_FERRY_COLORS.text.replace("#", ""), valign: "top",
      });
    }

    if (data.earningsCallHighlights.analystQuestions?.length) {
      const aqSlide = pres.addSlide();
      pageNum++;
      addGradientHeader(aqSlide, "Analyst Questions", `From ${data.earningsCallHighlights.quarter} Earnings Call`);
      let aqY = 1.2;
      data.earningsCallHighlights.analystQuestions.forEach((q) => {
        aqSlide.addText(`• ${q}`, {
          x: 0.7, y: aqY, w: 8.5, h: 0.35,
          fontSize: 10, fontFace: FONTS.body, color: KORN_FERRY_COLORS.text.replace("#", ""),
        });
        aqY += 0.4;
      });
      addKFFooter(aqSlide, pageNum);
    }

    addKFFooter(ecSlide, pageNum - (data.earningsCallHighlights.analystQuestions?.length ? 1 : 0));
  }

  // Client Interaction Section (controlled by includeClientInteraction option)
  // Meeting Attendees slide
  if (options.includeClientInteraction && data.meetingAttendees && data.meetingAttendees.length > 0) {
    pageNum++;
    const attendeesSlide = pres.addSlide();
    addGradientHeader(attendeesSlide, "Meeting Attendees", "Key Stakeholders & Decision Makers");

    const attendeeRows: pptxgen.TableRow[] = [
      [
        { text: "Name", options: { bold: true, fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") }, color: KORN_FERRY_COLORS.white.replace("#", "") } },
        { text: "Title", options: { bold: true, fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") }, color: KORN_FERRY_COLORS.white.replace("#", "") } },
        { text: "Role", options: { bold: true, fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") }, color: KORN_FERRY_COLORS.white.replace("#", "") } },
        { text: "Influence", options: { bold: true, fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") }, color: KORN_FERRY_COLORS.white.replace("#", "") } },
      ],
    ];

    data.meetingAttendees.slice(0, 8).forEach((attendee) => {
      attendeeRows.push([
        { text: attendee.name || "", options: { fontSize: 10 } },
        { text: attendee.title || "", options: { fontSize: 10 } },
        { text: attendee.role || "", options: { fontSize: 10 } },
        { text: attendee.influence || "", options: { fontSize: 10 } },
      ]);
    });

    attendeesSlide.addTable(attendeeRows, {
      x: 0.5,
      y: 1.2,
      w: 9,
      fontFace: FONTS.body,
      fontSize: 10,
      border: { type: "solid", pt: 0.5, color: KORN_FERRY_COLORS.muted.replace("#", "") },
    });

    addKFFooter(attendeesSlide, pageNum);
  }

  // Green Sheet / Call Planner slide
  if (options.includeClientInteraction && data.greenSheet && (data.greenSheet.objective || data.greenSheet.desiredOutcome)) {
    pageNum++;
    const gsSlide = pres.addSlide();
    addGradientHeader(gsSlide, "Call Planner", "Meeting Preparation & Objectives");

    let yPos = 1.2;
    const sections = [
      { label: "Call Objective", value: data.greenSheet.objective },
      { label: "Desired Outcome", value: data.greenSheet.desiredOutcome },
      { label: "Opening Statement", value: data.greenSheet.openingStatement },
      { label: "Best Action Commitment", value: data.greenSheet.bestActionCommitment },
    ];

    sections.forEach((section) => {
      if (section.value) {
        gsSlide.addText(section.label, {
          x: 0.5,
          y: yPos,
          w: 9,
          h: 0.25,
          fontSize: 12,
          fontFace: FONTS.heading,
          color: KORN_FERRY_COLORS.primary.replace("#", ""),
          bold: true,
        });
        yPos += 0.3;
        gsSlide.addText(section.value, {
          x: 0.5,
          y: yPos,
          w: 9,
          h: 0.6,
          fontSize: 10,
          fontFace: FONTS.body,
          color: KORN_FERRY_COLORS.text.replace("#", ""),
          valign: "top",
        });
        yPos += 0.7;
      }
    });

    addKFFooter(gsSlide, pageNum);
  }

  // Summary Section (controlled by includeSummary option)
  // Discovery Questions slide
  if (options.includeSummary && data.discoveryQuestions && data.discoveryQuestions.length > 0) {
    pageNum++;
    const questionsSlide = pres.addSlide();
    addGradientHeader(questionsSlide, "Discovery Questions", "Guided Discovery Q&A");

    let yPos = 1.2;
    data.discoveryQuestions.slice(0, 5).forEach((q, idx) => {
      questionsSlide.addText(`${idx + 1}. ${q.question}`, {
        x: 0.5,
        y: yPos,
        w: 9,
        h: 0.3,
        fontSize: 11,
        fontFace: FONTS.heading,
        color: KORN_FERRY_COLORS.primary.replace("#", ""),
        bold: true,
      });
      yPos += 0.35;
      if (q.answer) {
        questionsSlide.addText(q.answer, {
          x: 0.7,
          y: yPos,
          w: 8.5,
          h: 0.5,
          fontSize: 10,
          fontFace: FONTS.body,
          color: KORN_FERRY_COLORS.text.replace("#", ""),
          valign: "top",
        });
        yPos += 0.55;
      }
      if (q.methodology) {
        questionsSlide.addText(`[${q.methodology}]`, {
          x: 0.7,
          y: yPos - 0.1,
          w: 1.5,
          h: 0.2,
          fontSize: 8,
          fontFace: FONTS.body,
          color: KORN_FERRY_COLORS.muted.replace("#", ""),
        });
      }
      yPos += 0.2;
    });

    addKFFooter(questionsSlide, pageNum);
  }

  // Story Coaching slide
  if (options.includeSummary && data.storyCoaching && (data.storyCoaching.keyMessage || data.storyCoaching.openingHook)) {
    pageNum++;
    const storySlide = pres.addSlide();
    addGradientHeader(storySlide, "Story Coaching", "Narrative Framework & Key Messages");

    let yPos = 1.2;
    const storyElements = [
      { label: "Key Message", value: data.storyCoaching.keyMessage },
      { label: "Emotional Goal", value: data.storyCoaching.emotionalGoal },
      { label: "Opening Hook", value: data.storyCoaching.openingHook },
      { label: "Turning Point", value: data.storyCoaching.turningPoint },
      { label: "Call to Action", value: data.storyCoaching.callToAction },
    ];

    storyElements.forEach((element) => {
      if (element.value) {
        storySlide.addText(element.label, {
          x: 0.5,
          y: yPos,
          w: 2,
          h: 0.25,
          fontSize: 10,
          fontFace: FONTS.heading,
          color: KORN_FERRY_COLORS.primary.replace("#", ""),
          bold: true,
        });
        storySlide.addText(element.value, {
          x: 2.5,
          y: yPos,
          w: 7,
          h: 0.4,
          fontSize: 10,
          fontFace: FONTS.body,
          color: KORN_FERRY_COLORS.text.replace("#", ""),
          valign: "top",
        });
        yPos += 0.5;
      }
    });

    // Tension Questions
    if (data.storyCoaching.tensionQuestions && data.storyCoaching.tensionQuestions.length > 0) {
      yPos += 0.2;
      storySlide.addText("Tension Questions", {
        x: 0.5,
        y: yPos,
        w: 9,
        h: 0.25,
        fontSize: 12,
        fontFace: FONTS.heading,
        color: KORN_FERRY_COLORS.secondary.replace("#", ""),
        bold: true,
      });
      yPos += 0.35;
      data.storyCoaching.tensionQuestions.slice(0, 4).forEach((tq) => {
        storySlide.addText(`• ${tq.prompt}`, {
          x: 0.7,
          y: yPos,
          w: 8.5,
          h: 0.3,
          fontSize: 10,
          fontFace: FONTS.body,
          color: KORN_FERRY_COLORS.text.replace("#", ""),
        });
        yPos += 0.35;
      });
    }

    addKFFooter(storySlide, pageNum);
  }

  // ===== NARRATIVE CANVAS SLIDE =====
  if (options.includeSummary && data.narrativeCanvas && (data.narrativeCanvas.opener || data.narrativeCanvas.keyMessage)) {
    pageNum++;
    const ncSlide = pres.addSlide();
    addGradientHeader(ncSlide, "Narrative Canvas", "Sales Narrative Framework");

    let yPos = 1.2;
    const canvasItems = [
      { label: "Opening Statement", value: data.narrativeCanvas.opener },
      { label: "Key Message", value: data.narrativeCanvas.keyMessage },
      { label: "Proof Point", value: data.narrativeCanvas.proofPoint },
      { label: "Call to Action", value: data.narrativeCanvas.callToAction },
    ];

    canvasItems.forEach((item) => {
      if (item.value) {
        addCardContainer(ncSlide, 0.5, yPos, 9, 0.7, KORN_FERRY_COLORS.teal);
        ncSlide.addText(item.label, {
          x: 0.7, y: yPos + 0.05, w: 2.5, h: 0.25,
          fontSize: 10, fontFace: FONTS.heading, color: KORN_FERRY_COLORS.primary.replace("#", ""), bold: true,
        });
        ncSlide.addText(item.value, {
          x: 0.7, y: yPos + 0.3, w: 8.6, h: 0.35,
          fontSize: 10, fontFace: FONTS.body, color: KORN_FERRY_COLORS.text.replace("#", ""), valign: "top",
        });
        yPos += 0.8;
      }
    });

    if (data.narrativeCanvas.keyQuestions?.length) {
      addSectionDivider(ncSlide, yPos, "Key Questions", KORN_FERRY_COLORS.secondary);
      yPos += 0.35;
      data.narrativeCanvas.keyQuestions.forEach((q) => {
        ncSlide.addText(`• ${q}`, {
          x: 0.7, y: yPos, w: 8.5, h: 0.25,
          fontSize: 10, fontFace: FONTS.body, color: KORN_FERRY_COLORS.text.replace("#", ""),
        });
        yPos += 0.3;
      });
    }
    addKFFooter(ncSlide, pageNum);
  }

  // ===== DISCOVERY NOTES SLIDE =====
  if (options.includeSummary && data.discoveryNotes && (data.discoveryNotes.freeformNotes || data.discoveryNotes.topChallenges || data.discoveryNotes.keyStakeholder)) {
    pageNum++;
    const dnSlide = pres.addSlide();
    addGradientHeader(dnSlide, "Discovery Notes", "Field Notes & Observations");

    let yPos = 1.2;
    if (data.discoveryNotes.topChallenges) {
      addCardContainer(dnSlide, 0.5, yPos, 9, 1.0, KORN_FERRY_COLORS.warning);
      dnSlide.addText("Top Challenges", {
        x: 0.7, y: yPos + 0.05, w: 3, h: 0.25,
        fontSize: 11, fontFace: FONTS.heading, color: KORN_FERRY_COLORS.warning.replace("#", ""), bold: true,
      });
      dnSlide.addText(data.discoveryNotes.topChallenges, {
        x: 0.7, y: yPos + 0.3, w: 8.6, h: 0.6,
        fontSize: 10, fontFace: FONTS.body, color: KORN_FERRY_COLORS.text.replace("#", ""), valign: "top",
      });
      yPos += 1.15;
    }
    if (data.discoveryNotes.keyStakeholder) {
      dnSlide.addText(`Key Stakeholder: ${data.discoveryNotes.keyStakeholder}`, {
        x: 0.5, y: yPos, w: 9, h: 0.3,
        fontSize: 11, fontFace: FONTS.heading, color: KORN_FERRY_COLORS.primary.replace("#", ""), bold: true,
      });
      yPos += 0.4;
    }
    if (data.discoveryNotes.freeformNotes) {
      addCardContainer(dnSlide, 0.5, yPos, 9, 2.5);
      dnSlide.addText(data.discoveryNotes.freeformNotes, {
        x: 0.7, y: yPos + 0.1, w: 8.6, h: 2.3,
        fontSize: 10, fontFace: FONTS.body, color: KORN_FERRY_COLORS.text.replace("#", ""), valign: "top",
      });
    }
    addKFFooter(dnSlide, pageNum);
  }

  // ===== VALUE CASES SLIDE =====
  if (options.includeSummary && data.valueCases && data.valueCases.length > 0) {
    pageNum++;
    const vcSlide = pres.addSlide();
    const totalValue = data.valueCases.reduce((sum, vc) => sum + (vc.estimatedValue || 0), 0);
    addGradientHeader(vcSlide, "Value Cases", totalValue > 0 ? `Total Estimated Value: $${totalValue.toLocaleString()}` : `${data.valueCases.length} cases identified`);

    const vcRows: pptxgen.TableRow[] = [
      [
        { text: "Value Case", options: { bold: true, fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") }, color: KORN_FERRY_COLORS.white.replace("#", ""), fontSize: 10 } },
        { text: "Value Pillar", options: { bold: true, fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") }, color: KORN_FERRY_COLORS.white.replace("#", ""), fontSize: 10 } },
        { text: "Est. Value", options: { bold: true, fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") }, color: KORN_FERRY_COLORS.white.replace("#", ""), fontSize: 10 } },
        { text: "Status", options: { bold: true, fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") }, color: KORN_FERRY_COLORS.white.replace("#", ""), fontSize: 10 } },
      ],
    ];
    data.valueCases.forEach((vc) => {
      vcRows.push([
        { text: vc.title, options: { fontSize: 9 } },
        { text: vc.valuePillar || "-", options: { fontSize: 9 } },
        { text: vc.estimatedValue ? `$${vc.estimatedValue.toLocaleString()}` : "-", options: { fontSize: 9 } },
        { text: vc.status || "Draft", options: { fontSize: 9 } },
      ]);
    });
    vcSlide.addTable(vcRows, {
      x: 0.5, y: 1.2, w: 9, colW: [4, 2, 1.5, 1.5],
      border: { pt: 0.5, color: KORN_FERRY_COLORS.muted.replace("#", "") }, fontFace: FONTS.body,
    });
    addKFFooter(vcSlide, pageNum);
  }

  // ===== PROBE RESEARCH SLIDE =====
  if (options.includeSummary && data.probeHistory && data.probeHistory.length > 0) {
    pageNum++;
    const probeSlide = pres.addSlide();
    addGradientHeader(probeSlide, "Deep-Dive Research", "Follow-Up Intelligence Queries");

    let yPos = 1.2;
    const userQueries = data.probeHistory.filter(p => p.role === "user");
    const assistantResponses = data.probeHistory.filter(p => p.role === "assistant");

    for (let i = 0; i < userQueries.length && yPos < 4.8; i++) {
      addCardContainer(probeSlide, 0.5, yPos, 9, 0.8, KORN_FERRY_COLORS.teal);
      probeSlide.addText(`Q: ${userQueries[i].content}`, {
        x: 0.7, y: yPos + 0.05, w: 8.6, h: 0.2,
        fontSize: 10, fontFace: FONTS.heading, color: KORN_FERRY_COLORS.primary.replace("#", ""), bold: true,
      });
      if (assistantResponses[i]) {
        probeSlide.addText(assistantResponses[i].content.substring(0, 300) + (assistantResponses[i].content.length > 300 ? "..." : ""), {
          x: 0.7, y: yPos + 0.3, w: 8.6, h: 0.45,
          fontSize: 9, fontFace: FONTS.body, color: KORN_FERRY_COLORS.text.replace("#", ""), valign: "top",
        });
      }
      yPos += 0.9;
    }
    addKFFooter(probeSlide, pageNum);
  }

  // ===== PROJECT NOTES SLIDE =====
  if (options.includeSummary && data.notes && data.notes.length > 0) {
    pageNum++;
    const notesSlide = pres.addSlide();
    addGradientHeader(notesSlide, "Project Notes", `${data.notes.length} notes recorded`);

    let yPos = 1.2;
    data.notes.slice(0, 8).forEach((note) => {
      if (yPos > 4.5) return;
      const catLabel = note.category ? `[${note.category}] ` : "";
      notesSlide.addText(`${catLabel}${note.content}`, {
        x: 0.7, y: yPos, w: 8.5, h: 0.4,
        fontSize: 10, fontFace: FONTS.body, color: KORN_FERRY_COLORS.text.replace("#", ""), valign: "top",
      });
      yPos += 0.45;
    });
    addKFFooter(notesSlide, pageNum);
  }

  // ===== DATA POINTS SLIDE =====
  if (options.includeSummary && data.dataPoints && data.dataPoints.length > 0) {
    pageNum++;
    const dpSlide = pres.addSlide();
    addGradientHeader(dpSlide, "Research Data Points", `${data.dataPoints.length} data points collected`);

    const dpRows: pptxgen.TableRow[] = [
      [
        { text: "Data Point", options: { bold: true, fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") }, color: KORN_FERRY_COLORS.white.replace("#", ""), fontSize: 10 } },
        { text: "Value", options: { bold: true, fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") }, color: KORN_FERRY_COLORS.white.replace("#", ""), fontSize: 10 } },
        { text: "Category", options: { bold: true, fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") }, color: KORN_FERRY_COLORS.white.replace("#", ""), fontSize: 10 } },
      ],
    ];
    data.dataPoints.slice(0, 12).forEach((dp) => {
      dpRows.push([
        { text: dp.title, options: { fontSize: 9 } },
        { text: dp.value, options: { fontSize: 9 } },
        { text: dp.category || "-", options: { fontSize: 9 } },
      ]);
    });
    dpSlide.addTable(dpRows, {
      x: 0.5, y: 1.2, w: 9, colW: [3, 4, 2],
      border: { pt: 0.5, color: KORN_FERRY_COLORS.muted.replace("#", "") }, fontFace: FONTS.body,
    });
    addKFFooter(dpSlide, pageNum);
  }

  // External Links slide (if any links provided)
  if (data.externalLinks && data.externalLinks.length > 0) {
    pageNum++;
    const linksSlide = pres.addSlide();
    addGradientHeader(linksSlide, "External Links", "Additional Resources & References");

    let yPos = 1.3;
    data.externalLinks.forEach((link) => {
      if (yPos < 4.5) {
        addCardContainer(linksSlide, 0.5, yPos, 9, 0.5, KORN_FERRY_COLORS.teal);
        linksSlide.addText(link.label, {
          x: 0.7,
          y: yPos + 0.1,
          w: 4,
          h: 0.3,
          fontSize: 11,
          fontFace: FONTS.heading,
          color: KORN_FERRY_COLORS.primary.replace("#", ""),
          bold: true,
        });
        linksSlide.addText(link.url, {
          x: 4.8,
          y: yPos + 0.1,
          w: 4.5,
          h: 0.3,
          fontSize: 10,
          fontFace: FONTS.body,
          color: KORN_FERRY_COLORS.teal.replace("#", ""),
          hyperlink: { url: link.url },
        });
        yPos += 0.6;
      }
    });

    addKFFooter(linksSlide, pageNum);
  }

  pres.writeFile({ fileName: `${data.companyName}_Discovery_Report.pptx` });
}

export function generateIntelligencePDF(data: IntelligenceExportData, options: ExportOptions = DEFAULT_EXPORT_OPTIONS): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = 20;

  function checkPageBreak(needed: number) {
    if (yPos + needed > pageHeight - 15) {
      doc.addPage();
      yPos = 20;
    }
  }

  function addPdfSectionHeader(title: string) {
    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 34, 64);
    doc.text(title, margin, yPos);
    yPos += 10;
  }

  function addPdfSubHeader(title: string, color?: [number, number, number]) {
    checkPageBreak(15);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...(color || [10, 34, 64]));
    doc.text(title, margin, yPos);
    yPos += 7;
  }

  function addPdfBody(text: string, indent = 0) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    lines.forEach((line: string) => {
      checkPageBreak(6);
      doc.text(line, margin + indent, yPos);
      yPos += 5;
    });
    yPos += 2;
  }

  function addPdfBullet(text: string, indent = 5) {
    checkPageBreak(7);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    const lines = doc.splitTextToSize(`• ${text}`, contentWidth - indent);
    lines.forEach((line: string) => {
      checkPageBreak(6);
      doc.text(line, margin + indent, yPos);
      yPos += 5;
    });
    yPos += 2;
  }

  doc.setFillColor(0, 51, 141);
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setFillColor(8, 145, 178);
  doc.rect(0, 35, pageWidth, 8, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("DISCOVERY REPORT", margin, 22);

  doc.setFontSize(14);
  doc.setTextColor(255, 107, 53);
  doc.text(data.companyName, margin, 32);

  yPos = 52;
  if (options.includeTheme && data.theme) {
    doc.setFontSize(11);
    doc.setTextColor(8, 145, 178);
    doc.text(`Theme: ${data.theme}`, margin, 48);
    yPos = 58;
  }

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated ${new Date().toLocaleDateString()}`, margin, yPos);
  yPos += 12;

  // ===== COMPANY PROFILE =====
  if (options.includeIntelligence && (data.companyDetails || data.executiveSummary)) {
    if (data.companyDetails) {
      const details = [
        data.companyDetails.headquarters ? `HQ: ${data.companyDetails.headquarters}` : null,
        data.companyDetails.employeeCount ? `Employees: ${data.companyDetails.employeeCount}` : null,
        data.companyDetails.revenue ? `Revenue: ${data.companyDetails.revenue}` : null,
        data.companyDetails.founded ? `Founded: ${data.companyDetails.founded}` : null,
        data.industry ? `Industry: ${data.industry}` : null,
      ].filter(Boolean).join("  |  ");
      if (details) {
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, yPos - 4, contentWidth, 10, "F");
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 41, 59);
        doc.text(details, margin + 3, yPos + 2);
        yPos += 14;
      }
    }

    if (data.executiveSummary) {
      addPdfSectionHeader("Executive Summary");
      addPdfBody(data.executiveSummary);
    }
  }

  // ===== STRATEGIC INSIGHTS =====
  if (options.includeIntelligence && data.insights.length > 0) {
    doc.addPage();
    yPos = 20;
    addPdfSectionHeader("Strategic Insights");

    data.insights.forEach((insight) => {
      checkPageBreak(25);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(10, 34, 64);
      doc.text(`• ${insight.title}`, margin, yPos);
      if (insight.priority) {
        doc.setFontSize(8);
        doc.setTextColor(insight.priority === "high" ? 220 : 100, insight.priority === "high" ? 38 : 116, insight.priority === "high" ? 38 : 139);
        doc.text(`[${insight.priority.toUpperCase()}]`, pageWidth - margin - 15, yPos);
      }
      yPos += 6;

      addPdfBody(insight.value, 5);

      if (insight.kfOpportunity) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(255, 107, 53);
        const oppLines = doc.splitTextToSize(`KF Opportunity: ${insight.kfOpportunity}`, contentWidth - 10);
        oppLines.forEach((line: string) => {
          checkPageBreak(5);
          doc.text(line, margin + 5, yPos);
          yPos += 5;
        });
        yPos += 2;
      }
      if (insight.potentialValue) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(16, 185, 129);
        doc.text(`Potential Value: ${insight.potentialValue}`, margin + 5, yPos);
        yPos += 7;
      }
    });
  }

  // ===== THEME-SPECIFIC INSIGHTS =====
  if (options.includeIntelligence && data.themeSpecificInsights && data.theme) {
    checkPageBreak(40);
    addPdfSectionHeader(`Theme Analysis: ${data.theme}`);
    if (data.themeSpecificInsights.opportunitySignal) {
      addPdfSubHeader("Opportunity Signal", [255, 107, 53]);
      addPdfBody(data.themeSpecificInsights.opportunitySignal, 5);
    }
    if (data.themeSpecificInsights.potentialValue) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(16, 185, 129);
      doc.text(`Potential Value: ${data.themeSpecificInsights.potentialValue}`, margin, yPos);
      yPos += 8;
    }
    if (data.themeSpecificInsights.howWeHelp?.length) {
      addPdfSubHeader("How Korn Ferry Helps");
      data.themeSpecificInsights.howWeHelp.forEach(item => addPdfBullet(item));
    }
    if (data.themeSpecificInsights.keyQuestions?.length) {
      addPdfSubHeader("Key Questions");
      data.themeSpecificInsights.keyQuestions.forEach(q => addPdfBullet(q));
    }
  }

  // ===== RECENT NEWS =====
  if (options.includeIntelligence && data.recentNews && data.recentNews.length > 0) {
    doc.addPage();
    yPos = 20;
    addPdfSectionHeader(`Recent News & Developments (${data.recentNews.length} items)`);

    data.recentNews.forEach((news) => {
      checkPageBreak(20);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(10, 34, 64);
      doc.text(news.headline, margin, yPos);
      yPos += 5;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(`${news.date} | ${news.source}${news.relevance ? ` | ${news.relevance} relevance` : ""}`, margin + 5, yPos);
      yPos += 5;
      addPdfBody(news.summary, 5);
    });
  }

  // ===== COMPETITIVE LANDSCAPE =====
  if (options.includeIntelligence && data.competitors && data.competitors.length > 0) {
    checkPageBreak(30);
    addPdfSectionHeader("Competitive Landscape");

    data.competitors.forEach((comp) => {
      checkPageBreak(20);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(10, 34, 64);
      doc.text(comp.name, margin, yPos);
      yPos += 6;
      addPdfBody(comp.description, 5);
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 116, 139);
      const posLines = doc.splitTextToSize(`Position: ${comp.competitivePosition}`, contentWidth - 10);
      posLines.forEach((line: string) => {
        checkPageBreak(5);
        doc.text(line, margin + 5, yPos);
        yPos += 5;
      });
      yPos += 3;
    });
  }

  // ===== KEY PEOPLE =====
  if (options.includeIntelligence && data.keyPeople && data.keyPeople.length > 0) {
    checkPageBreak(30);
    addPdfSectionHeader("Key People & Executives");

    data.keyPeople.forEach((person) => {
      checkPageBreak(12);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(10, 34, 64);
      doc.text(`${person.name} - ${person.title}`, margin, yPos);
      yPos += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);
      const relLines = doc.splitTextToSize(person.relevance, contentWidth - 10);
      relLines.forEach((line: string) => {
        checkPageBreak(5);
        doc.text(line, margin + 5, yPos);
        yPos += 5;
      });
      yPos += 3;
    });
  }

  // ===== ANNUAL REPORT =====
  if (options.includeIntelligence && data.annualReportSummary) {
    doc.addPage();
    yPos = 20;
    addPdfSectionHeader(`Annual Report - ${data.annualReportSummary.fiscalYear}`);

    if (data.annualReportSummary.strategicPriorities?.length) {
      addPdfSubHeader("Strategic Priorities");
      data.annualReportSummary.strategicPriorities.forEach(p => addPdfBullet(p));
    }
    if (data.annualReportSummary.ceoLetterHighlights?.length) {
      addPdfSubHeader("CEO Letter Highlights");
      data.annualReportSummary.ceoLetterHighlights.forEach(h => addPdfBullet(h));
    }
    if (data.annualReportSummary.riskFactors?.length) {
      addPdfSubHeader("Risk Factors", [245, 158, 11]);
      data.annualReportSummary.riskFactors.forEach(r => addPdfBullet(r));
    }
    if (data.annualReportSummary.peopleMetrics) {
      const pm = data.annualReportSummary.peopleMetrics;
      const metrics = [
        pm.headcount ? `Headcount: ${pm.headcount}` : null,
        pm.turnover ? `Turnover: ${pm.turnover}` : null,
        pm.diversity ? `Diversity: ${pm.diversity}` : null,
        pm.engagement ? `Engagement: ${pm.engagement}` : null,
      ].filter(Boolean);
      if (metrics.length > 0) {
        addPdfSubHeader("People Metrics", [124, 58, 237]);
        metrics.forEach(m => addPdfBullet(m!));
      }
    }
  }

  // ===== EARNINGS CALL =====
  if (options.includeIntelligence && data.earningsCallHighlights) {
    checkPageBreak(30);
    addPdfSectionHeader(`Earnings Call - ${data.earningsCallHighlights.quarter}`);

    if (data.earningsCallHighlights.executiveCommentary?.length) {
      addPdfSubHeader("Executive Commentary");
      data.earningsCallHighlights.executiveCommentary.forEach(q => {
        checkPageBreak(10);
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(30, 41, 59);
        const lines = doc.splitTextToSize(`"${q}"`, contentWidth - 10);
        lines.forEach((line: string) => {
          checkPageBreak(5);
          doc.text(line, margin + 5, yPos);
          yPos += 5;
        });
        yPos += 3;
      });
    }
    if (data.earningsCallHighlights.workforceDiscussions?.length) {
      addPdfSubHeader("Workforce Discussions", [124, 58, 237]);
      data.earningsCallHighlights.workforceDiscussions.forEach(w => addPdfBullet(w));
    }
    if (data.earningsCallHighlights.futureOutlook) {
      addPdfSubHeader("Future Outlook");
      addPdfBody(data.earningsCallHighlights.futureOutlook, 5);
    }
    if (data.earningsCallHighlights.analystQuestions?.length) {
      addPdfSubHeader("Analyst Questions");
      data.earningsCallHighlights.analystQuestions.forEach(q => addPdfBullet(q));
    }
  }

  // ===== MEETING ATTENDEES =====
  if (options.includeClientInteraction && data.meetingAttendees && data.meetingAttendees.length > 0) {
    doc.addPage();
    yPos = 20;
    addPdfSectionHeader("Meeting Attendees");

    data.meetingAttendees.forEach((attendee) => {
      checkPageBreak(15);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(10, 34, 64);
      doc.text(`• ${attendee.name}`, margin, yPos);
      doc.setFont("helvetica", "normal");
      const details = [attendee.title, attendee.role, attendee.influence, attendee.affiliation].filter(Boolean).join(" | ");
      if (details) {
        doc.setTextColor(30, 41, 59);
        doc.text(`  ${details}`, margin + 5, yPos + 5);
        yPos += 12;
      } else {
        yPos += 7;
      }
    });
  }

  // ===== GREEN SHEET =====
  if (options.includeClientInteraction && data.greenSheet && (data.greenSheet.objective || data.greenSheet.desiredOutcome)) {
    checkPageBreak(30);
    addPdfSectionHeader("Call Planner (Green Sheet)");

    const sections = [
      { label: "Call Objective", value: data.greenSheet.objective },
      { label: "Desired Outcome", value: data.greenSheet.desiredOutcome },
      { label: "Opening Statement", value: data.greenSheet.openingStatement },
      { label: "Best Action Commitment", value: data.greenSheet.bestActionCommitment },
    ];

    sections.forEach((section) => {
      if (section.value) {
        checkPageBreak(15);
        addPdfSubHeader(section.label);
        addPdfBody(section.value, 5);
      }
    });
  }

  // ===== DISCOVERY QUESTIONS =====
  if (options.includeSummary && data.discoveryQuestions && data.discoveryQuestions.length > 0) {
    doc.addPage();
    yPos = 20;
    addPdfSectionHeader("Discovery Questions & Responses");

    data.discoveryQuestions.forEach((q, idx) => {
      checkPageBreak(15);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(10, 34, 64);
      const qLines = doc.splitTextToSize(`${idx + 1}. ${q.question}`, contentWidth);
      qLines.forEach((line: string) => {
        checkPageBreak(6);
        doc.text(line, margin, yPos);
        yPos += 5;
      });
      yPos += 1;

      if (q.answer) {
        addPdfBody(q.answer, 5);
      }
      if (q.methodology) {
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`[${q.methodology}]`, margin + 5, yPos);
        yPos += 5;
      }
      yPos += 3;
    });
  }

  // ===== STORY COACHING =====
  if (options.includeSummary && data.storyCoaching && (data.storyCoaching.keyMessage || data.storyCoaching.openingHook)) {
    checkPageBreak(40);
    addPdfSectionHeader("Story Coaching Framework");

    const storyElements = [
      { label: "Key Message", value: data.storyCoaching.keyMessage },
      { label: "Emotional Goal", value: data.storyCoaching.emotionalGoal },
      { label: "Opening Hook", value: data.storyCoaching.openingHook },
      { label: "Turning Point", value: data.storyCoaching.turningPoint },
      { label: "Call to Action", value: data.storyCoaching.callToAction },
    ];

    storyElements.forEach((element) => {
      if (element.value) {
        checkPageBreak(10);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(10, 34, 64);
        doc.text(`${element.label}:`, margin, yPos);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 41, 59);
        const lines = doc.splitTextToSize(element.value, contentWidth - 45);
        doc.text(lines, margin + 40, yPos);
        yPos += Math.max(lines.length * 5, 6) + 4;
      }
    });

    if (data.storyCoaching.tensionQuestions && data.storyCoaching.tensionQuestions.length > 0) {
      yPos += 3;
      addPdfSubHeader("Tension Questions", [255, 107, 53]);
      data.storyCoaching.tensionQuestions.forEach((tq) => addPdfBullet(tq.prompt));
    }
  }

  // ===== NARRATIVE CANVAS =====
  if (options.includeSummary && data.narrativeCanvas && (data.narrativeCanvas.opener || data.narrativeCanvas.keyMessage)) {
    checkPageBreak(40);
    addPdfSectionHeader("Narrative Canvas");

    const canvasItems = [
      { label: "Opening Statement", value: data.narrativeCanvas.opener },
      { label: "Key Message", value: data.narrativeCanvas.keyMessage },
      { label: "Proof Point", value: data.narrativeCanvas.proofPoint },
      { label: "Call to Action", value: data.narrativeCanvas.callToAction },
    ];

    canvasItems.forEach((item) => {
      if (item.value) {
        addPdfSubHeader(item.label);
        addPdfBody(item.value, 5);
      }
    });

    if (data.narrativeCanvas.keyQuestions?.length) {
      addPdfSubHeader("Key Questions", [255, 107, 53]);
      data.narrativeCanvas.keyQuestions.forEach(q => addPdfBullet(q));
    }
  }

  // ===== DISCOVERY NOTES =====
  if (options.includeSummary && data.discoveryNotes && (data.discoveryNotes.freeformNotes || data.discoveryNotes.topChallenges || data.discoveryNotes.keyStakeholder)) {
    checkPageBreak(30);
    addPdfSectionHeader("Discovery Notes");

    if (data.discoveryNotes.topChallenges) {
      addPdfSubHeader("Top Challenges", [245, 158, 11]);
      addPdfBody(data.discoveryNotes.topChallenges, 5);
    }
    if (data.discoveryNotes.keyStakeholder) {
      addPdfSubHeader("Key Stakeholder");
      addPdfBody(data.discoveryNotes.keyStakeholder, 5);
    }
    if (data.discoveryNotes.freeformNotes) {
      addPdfSubHeader("Field Notes");
      addPdfBody(data.discoveryNotes.freeformNotes, 5);
    }
  }

  // ===== VALUE CASES =====
  if (options.includeSummary && data.valueCases && data.valueCases.length > 0) {
    doc.addPage();
    yPos = 20;
    const totalValue = data.valueCases.reduce((sum, vc) => sum + (vc.estimatedValue || 0), 0);
    addPdfSectionHeader(`Value Cases${totalValue > 0 ? ` (Total: $${totalValue.toLocaleString()})` : ""}`);

    data.valueCases.forEach((vc) => {
      checkPageBreak(20);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(10, 34, 64);
      doc.text(`• ${vc.title}`, margin, yPos);
      yPos += 5;
      const meta = [
        vc.valuePillar ? `Pillar: ${vc.valuePillar}` : null,
        vc.estimatedValue ? `Value: $${vc.estimatedValue.toLocaleString()}` : null,
        vc.status ? `Status: ${vc.status}` : null,
      ].filter(Boolean).join(" | ");
      if (meta) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(meta, margin + 5, yPos);
        yPos += 5;
      }
      if (vc.description) {
        addPdfBody(vc.description, 5);
      }
      yPos += 2;
    });
  }

  // ===== PROBE RESEARCH =====
  if (options.includeSummary && data.probeHistory && data.probeHistory.length > 0) {
    checkPageBreak(30);
    addPdfSectionHeader("Deep-Dive Research");

    const userQueries = data.probeHistory.filter(p => p.role === "user");
    const assistantResponses = data.probeHistory.filter(p => p.role === "assistant");

    for (let i = 0; i < userQueries.length; i++) {
      checkPageBreak(15);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(10, 34, 64);
      doc.text(`Q: ${userQueries[i].content}`, margin, yPos);
      yPos += 6;
      if (assistantResponses[i]) {
        addPdfBody(assistantResponses[i].content, 5);
      }
      yPos += 3;
    }
  }

  // ===== PROJECT NOTES =====
  if (options.includeSummary && data.notes && data.notes.length > 0) {
    checkPageBreak(20);
    addPdfSectionHeader(`Project Notes (${data.notes.length})`);

    data.notes.forEach((note) => {
      checkPageBreak(10);
      const catLabel = note.category ? `[${note.category}] ` : "";
      addPdfBody(`${catLabel}${note.content}`, 3);
    });
  }

  // ===== DATA POINTS =====
  if (options.includeSummary && data.dataPoints && data.dataPoints.length > 0) {
    checkPageBreak(20);
    addPdfSectionHeader(`Research Data Points (${data.dataPoints.length})`);

    data.dataPoints.forEach((dp) => {
      checkPageBreak(12);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(10, 34, 64);
      doc.text(`• ${dp.title}`, margin, yPos);
      yPos += 5;
      addPdfBody(dp.value, 5);
    });
  }

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Confidential - Korn Ferry", pageWidth - margin - 40, pageHeight - 10);

  doc.save(`${data.companyName}_Discovery_Report.pdf`);
}

export function generateOutcomesPPT(data: OutcomeExportData): void {
  const pres = new pptxgen();
  pres.title = `${data.companyName} - Value Alignment Report`;
  pres.author = "Korn Ferry Loop";
  pres.layout = "LAYOUT_WIDE";

  let pageNum = 1;

  const titleSlide = pres.addSlide();
  titleSlide.addShape("rect", {
    x: 0,
    y: 0,
    w: "100%",
    h: "100%",
    fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") },
  });
  titleSlide.addText("VALUE ALIGNMENT REPORT", {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 0.6,
    fontSize: 36,
    fontFace: FONTS.heading,
    color: KORN_FERRY_COLORS.white.replace("#", ""),
    bold: true,
  });
  titleSlide.addText(data.companyName, {
    x: 0.5,
    y: 2.2,
    w: 9,
    h: 0.5,
    fontSize: 28,
    fontFace: FONTS.heading,
    color: KORN_FERRY_COLORS.secondary.replace("#", ""),
  });
  titleSlide.addText(data.initiativeName, {
    x: 0.5,
    y: 2.8,
    w: 9,
    h: 0.4,
    fontSize: 18,
    fontFace: FONTS.body,
    color: KORN_FERRY_COLORS.white.replace("#", ""),
  });
  if (data.totalValue) {
    titleSlide.addShape("rect", {
      x: 0.5,
      y: 3.5,
      w: 3,
      h: 0.8,
      fill: { color: KORN_FERRY_COLORS.success.replace("#", "") },
    });
    titleSlide.addText(`Total Value: ${data.totalValue}`, {
      x: 0.7,
      y: 3.6,
      w: 2.8,
      h: 0.6,
      fontSize: 16,
      fontFace: FONTS.heading,
      color: KORN_FERRY_COLORS.white.replace("#", ""),
      bold: true,
    });
  }

  if (data.outcomes.length > 0) {
    pageNum++;
    const outcomesSlide = pres.addSlide();
    addKFHeader(pres, outcomesSlide, "Strategic Outcomes");

    const valuePillars: Record<string, typeof data.outcomes> = {};
    data.outcomes.forEach((outcome) => {
      const pillar = outcome.valuePillar || "Other";
      if (!valuePillars[pillar]) valuePillars[pillar] = [];
      valuePillars[pillar].push(outcome);
    });

    let yPos = 1.1;
    const pillarColors: Record<string, string> = {
      Grow: "10B981",
      Optimise: "3B82F6",
      "De-risk": "F59E0B",
      Strengthen: "8B5CF6",
    };

    Object.entries(valuePillars).slice(0, 4).forEach(([pillar, outcomes]) => {
      outcomesSlide.addShape("rect", {
        x: 0.5,
        y: yPos,
        w: 0.1,
        h: 0.9,
        fill: { color: pillarColors[pillar] || KORN_FERRY_COLORS.secondary.replace("#", "") },
      });
      outcomesSlide.addText(pillar.toUpperCase(), {
        x: 0.7,
        y: yPos,
        w: 2,
        h: 0.25,
        fontSize: 10,
        fontFace: FONTS.heading,
        color: pillarColors[pillar] || KORN_FERRY_COLORS.secondary.replace("#", ""),
        bold: true,
      });

      outcomes.slice(0, 2).forEach((outcome, idx) => {
        outcomesSlide.addText(`• ${outcome.title}`, {
          x: 0.8,
          y: yPos + 0.3 + idx * 0.3,
          w: 8.5,
          h: 0.25,
          fontSize: 10,
          fontFace: FONTS.body,
          color: KORN_FERRY_COLORS.text.replace("#", ""),
        });
      });

      yPos += 1.1;
    });

    addKFFooter(outcomesSlide, pageNum);
  }

  if (data.kpis.length > 0) {
    pageNum++;
    const kpiSlide = pres.addSlide();
    addKFHeader(pres, kpiSlide, "KPI Commitments");

    const rows: pptxgen.TableRow[] = [
      [
        { text: "KPI", options: { bold: true, fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") }, color: KORN_FERRY_COLORS.white.replace("#", "") } },
        { text: "Baseline", options: { bold: true, fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") }, color: KORN_FERRY_COLORS.white.replace("#", "") } },
        { text: "Target", options: { bold: true, fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") }, color: KORN_FERRY_COLORS.white.replace("#", "") } },
        { text: "Status", options: { bold: true, fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") }, color: KORN_FERRY_COLORS.white.replace("#", "") } },
      ],
    ];

    data.kpis.slice(0, 8).forEach((kpi) => {
      rows.push([
        { text: kpi.name, options: { fontSize: 10 } },
        { text: kpi.baseline || "-", options: { fontSize: 10 } },
        { text: kpi.target || "-", options: { fontSize: 10 } },
        { text: kpi.status || "Pending", options: { fontSize: 10 } },
      ]);
    });

    kpiSlide.addTable(rows, {
      x: 0.5,
      y: 1.2,
      w: 9,
      colW: [4, 1.5, 1.5, 2],
      border: { pt: 0.5, color: KORN_FERRY_COLORS.muted.replace("#", "") },
      fontFace: FONTS.body,
    });
    addKFFooter(kpiSlide, pageNum);
  }

  if (data.valueNarrative) {
    pageNum++;
    const narrativeSlide = pres.addSlide();
    addKFHeader(pres, narrativeSlide, "Value Narrative");
    narrativeSlide.addText(data.valueNarrative, {
      x: 0.5,
      y: 1.2,
      w: 9,
      h: 3.8,
      fontSize: 12,
      fontFace: FONTS.body,
      color: KORN_FERRY_COLORS.text.replace("#", ""),
      valign: "top",
    });
    addKFFooter(narrativeSlide, pageNum);
  }

  pres.writeFile({ fileName: `${data.companyName}_Value_Alignment_Report.pptx` });
}

export function generateOutcomesPDF(data: OutcomeExportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  doc.setFillColor(10, 34, 64);
  doc.rect(0, 0, pageWidth, 45, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("VALUE ALIGNMENT REPORT", margin, 25);

  doc.setFontSize(14);
  doc.setTextColor(0, 163, 224);
  doc.text(data.companyName, margin, 35);

  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(data.initiativeName, margin, 42);

  yPos = 55;
  if (data.totalValue) {
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(margin, yPos, 60, 15, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Value: ${data.totalValue}`, margin + 5, yPos + 10);
    yPos += 25;
  }

  if (data.outcomes.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 34, 64);
    doc.text("Strategic Outcomes", margin, yPos);
    yPos += 10;

    data.outcomes.forEach((outcome) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(10, 34, 64);
      doc.text(`• ${outcome.title}`, margin, yPos);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(`[${outcome.valuePillar || "Other"}]`, margin + 5, yPos + 5);
      yPos += 12;
    });
  }

  if (data.kpis.length > 0) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 34, 64);
    doc.text("KPI Commitments", margin, yPos);
    yPos += 10;

    doc.setFillColor(10, 34, 64);
    doc.rect(margin, yPos, pageWidth - margin * 2, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text("KPI", margin + 2, yPos + 5);
    doc.text("Baseline", margin + 70, yPos + 5);
    doc.text("Target", margin + 100, yPos + 5);
    doc.text("Status", margin + 130, yPos + 5);
    yPos += 10;

    doc.setTextColor(30, 41, 59);
    data.kpis.slice(0, 10).forEach((kpi, idx) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      const bgColor = idx % 2 === 0 ? 248 : 241;
      doc.setFillColor(bgColor, bgColor, bgColor);
      doc.rect(margin, yPos - 4, pageWidth - margin * 2, 8, "F");

      doc.setFont("helvetica", "normal");
      doc.text(kpi.name.substring(0, 35), margin + 2, yPos);
      doc.text(kpi.baseline || "-", margin + 70, yPos);
      doc.text(kpi.target || "-", margin + 100, yPos);
      doc.text(kpi.status || "Pending", margin + 130, yPos);
      yPos += 8;
    });
  }

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Confidential - Korn Ferry", pageWidth - margin - 40, doc.internal.pageSize.getHeight() - 10);

  doc.save(`${data.companyName}_Value_Alignment_Report.pdf`);
}

export function generateCoachingPPT(data: CoachingExportData): void {
  const pres = new pptxgen();
  pres.title = `${data.companyName} - Executive Briefing`;
  pres.author = "Korn Ferry Loop";
  pres.layout = "LAYOUT_WIDE";

  let pageNum = 1;

  const titleSlide = pres.addSlide();
  titleSlide.addShape("rect", {
    x: 0,
    y: 0,
    w: "100%",
    h: "100%",
    fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") },
  });
  titleSlide.addText("EXECUTIVE BRIEFING", {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 0.6,
    fontSize: 36,
    fontFace: FONTS.heading,
    color: KORN_FERRY_COLORS.white.replace("#", ""),
    bold: true,
  });
  titleSlide.addText(data.companyName, {
    x: 0.5,
    y: 2.2,
    w: 9,
    h: 0.5,
    fontSize: 28,
    fontFace: FONTS.heading,
    color: KORN_FERRY_COLORS.secondary.replace("#", ""),
  });
  titleSlide.addText(data.initiativeName, {
    x: 0.5,
    y: 2.8,
    w: 9,
    h: 0.4,
    fontSize: 18,
    fontFace: FONTS.body,
    color: KORN_FERRY_COLORS.white.replace("#", ""),
  });

  if (data.synthesis) {
    pageNum++;
    const synthesisSlide = pres.addSlide();
    addKFHeader(pres, synthesisSlide, "Discovery Synthesis");
    synthesisSlide.addText(data.synthesis, {
      x: 0.5,
      y: 1.2,
      w: 9,
      h: 3.8,
      fontSize: 12,
      fontFace: FONTS.body,
      color: KORN_FERRY_COLORS.text.replace("#", ""),
      valign: "top",
    });
    addKFFooter(synthesisSlide, pageNum);
  }

  if (data.recommendations.length > 0) {
    pageNum++;
    const recSlide = pres.addSlide();
    addKFHeader(pres, recSlide, "AI Recommendations");

    let yPos = 1.2;
    data.recommendations.slice(0, 4).forEach((rec, idx) => {
      recSlide.addShape("rect", {
        x: 0.5,
        y: yPos,
        w: 0.4,
        h: 0.4,
        fill: { color: KORN_FERRY_COLORS.secondary.replace("#", "") },
      });
      recSlide.addText(`${idx + 1}`, {
        x: 0.5,
        y: yPos,
        w: 0.4,
        h: 0.4,
        fontSize: 14,
        fontFace: FONTS.heading,
        color: KORN_FERRY_COLORS.white.replace("#", ""),
        align: "center",
        valign: "middle",
        bold: true,
      });
      recSlide.addText(rec.title, {
        x: 1.1,
        y: yPos,
        w: 8,
        h: 0.3,
        fontSize: 12,
        fontFace: FONTS.heading,
        color: KORN_FERRY_COLORS.primary.replace("#", ""),
        bold: true,
      });
      recSlide.addText(rec.description, {
        x: 1.1,
        y: yPos + 0.35,
        w: 8,
        h: 0.5,
        fontSize: 10,
        fontFace: FONTS.body,
        color: KORN_FERRY_COLORS.text.replace("#", ""),
      });
      yPos += 1;
    });
    addKFFooter(recSlide, pageNum);
  }

  if (data.talkingPoints?.length || data.nextSteps?.length) {
    pageNum++;
    const actionSlide = pres.addSlide();
    addKFHeader(pres, actionSlide, "Talking Points & Next Steps");

    let yPos = 1.2;

    if (data.talkingPoints?.length) {
      actionSlide.addText("Key Talking Points", {
        x: 0.5,
        y: yPos,
        w: 4,
        h: 0.3,
        fontSize: 14,
        fontFace: FONTS.heading,
        color: KORN_FERRY_COLORS.primary.replace("#", ""),
        bold: true,
      });
      yPos += 0.4;
      data.talkingPoints.slice(0, 5).forEach((point) => {
        actionSlide.addText(`• ${point}`, {
          x: 0.7,
          y: yPos,
          w: 4,
          h: 0.3,
          fontSize: 10,
          fontFace: FONTS.body,
          color: KORN_FERRY_COLORS.text.replace("#", ""),
        });
        yPos += 0.35;
      });
    }

    if (data.nextSteps?.length) {
      yPos += 0.3;
      actionSlide.addText("Next Steps", {
        x: 0.5,
        y: yPos,
        w: 4,
        h: 0.3,
        fontSize: 14,
        fontFace: FONTS.heading,
        color: KORN_FERRY_COLORS.success.replace("#", ""),
        bold: true,
      });
      yPos += 0.4;
      data.nextSteps.slice(0, 5).forEach((step, idx) => {
        actionSlide.addText(`${idx + 1}. ${step}`, {
          x: 0.7,
          y: yPos,
          w: 8.5,
          h: 0.3,
          fontSize: 10,
          fontFace: FONTS.body,
          color: KORN_FERRY_COLORS.text.replace("#", ""),
        });
        yPos += 0.35;
      });
    }

    addKFFooter(actionSlide, pageNum);
  }

  pres.writeFile({ fileName: `${data.companyName}_Executive_Briefing.pptx` });
}

export function generateCoachingPDF(data: CoachingExportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  doc.setFillColor(10, 34, 64);
  doc.rect(0, 0, pageWidth, 45, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("EXECUTIVE BRIEFING", margin, 25);

  doc.setFontSize(14);
  doc.setTextColor(0, 163, 224);
  doc.text(data.companyName, margin, 35);

  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(data.initiativeName, margin, 42);

  yPos = 55;

  if (data.synthesis) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 34, 64);
    doc.text("Discovery Synthesis", margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    const lines = doc.splitTextToSize(data.synthesis, pageWidth - margin * 2);
    doc.text(lines, margin, yPos);
    yPos += lines.length * 5 + 10;
  }

  if (data.recommendations.length > 0) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 34, 64);
    doc.text("AI Recommendations", margin, yPos);
    yPos += 10;

    data.recommendations.forEach((rec, idx) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFillColor(0, 163, 224);
      doc.circle(margin + 3, yPos - 2, 3, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(`${idx + 1}`, margin + 1.5, yPos);

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(10, 34, 64);
      doc.text(rec.title, margin + 10, yPos);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);
      const descLines = doc.splitTextToSize(rec.description, pageWidth - margin * 2 - 10);
      doc.text(descLines, margin + 10, yPos + 5);
      yPos += 5 + descLines.length * 5 + 8;
    });
  }

  if (data.nextSteps?.length) {
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }
    yPos += 5;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129);
    doc.text("Next Steps", margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    data.nextSteps.forEach((step, idx) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`${idx + 1}. ${step}`, margin, yPos);
      yPos += 6;
    });
  }

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Confidential - Korn Ferry", pageWidth - margin - 40, doc.internal.pageSize.getHeight() - 10);

  doc.save(`${data.companyName}_Executive_Briefing.pdf`);
}

export type { IntelligenceExportData, OutcomeExportData, CoachingExportData };
