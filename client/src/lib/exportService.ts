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

interface IntelligenceExportData {
  companyName: string;
  industry?: string;
  theme?: string;
  executiveSummary?: string;
  companyWebsite?: string;
  insights: Array<{
    title: string;
    value: string;
    category?: string;
    priority?: string;
    sourceUrl?: string;
  }>;
  annualReportSummary?: {
    fiscalYear: string;
    ceoLetterHighlights?: string[];
    strategicPriorities?: string[];
    riskFactors?: string[];
    reportUrl?: string;
  };
  earningsCallHighlights?: {
    quarter: string;
    executiveCommentary?: string[];
    workforceDiscussions?: string[];
    futureOutlook?: string;
    transcriptUrl?: string;
  };
  followUpResearch?: Array<{
    question: string;
    answer: string;
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

  // Intelligence Section (controlled by includeIntelligence option)
  if (options.includeIntelligence && data.executiveSummary) {
    pageNum++;
    const summarySlide = pres.addSlide();
    addGradientHeader(summarySlide, "Executive Summary", "Company Overview & Strategic Context");
    
    // Add card container for executive summary
    addCardContainer(summarySlide, 0.5, 1.3, 9, 3.5, KORN_FERRY_COLORS.teal);
    summarySlide.addText(data.executiveSummary, {
      x: 0.7,
      y: 1.45,
      w: 8.6,
      h: 3.2,
      fontSize: 13,
      fontFace: FONTS.body,
      color: KORN_FERRY_COLORS.text.replace("#", ""),
      valign: "top",
    });
    addKFFooter(summarySlide, pageNum);
  }

  if (options.includeIntelligence && data.insights.length > 0) {
    pageNum++;
    const insightsSlide = pres.addSlide();
    addKFHeader(pres, insightsSlide, "Key Insights");

    const rows: pptxgen.TableRow[] = [
      [
        { text: "Insight", options: { bold: true, fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") }, color: KORN_FERRY_COLORS.white.replace("#", "") } },
        { text: "Value", options: { bold: true, fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") }, color: KORN_FERRY_COLORS.white.replace("#", "") } },
        { text: "Category", options: { bold: true, fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") }, color: KORN_FERRY_COLORS.white.replace("#", "") } },
      ],
    ];

    data.insights.slice(0, 8).forEach((insight) => {
      rows.push([
        { text: insight.title, options: { fontSize: 10 } },
        { text: insight.value, options: { fontSize: 10 } },
        { text: insight.category || "-", options: { fontSize: 10 } },
      ]);
    });

    insightsSlide.addTable(rows, {
      x: 0.5,
      y: 1.2,
      w: 9,
      colW: [4, 3, 2],
      border: { pt: 0.5, color: KORN_FERRY_COLORS.muted.replace("#", "") },
      fontFace: FONTS.body,
    });
    addKFFooter(insightsSlide, pageNum);
  }

  if (options.includeIntelligence && data.annualReportSummary) {
    pageNum++;
    const arSlide = pres.addSlide();
    addGradientHeader(arSlide, `Annual Report - ${data.annualReportSummary.fiscalYear}`, data.annualReportSummary.reportUrl ? "Click link below for full report" : undefined);

    let yPos = 1.2;

    if (data.annualReportSummary.strategicPriorities?.length) {
      arSlide.addText("Strategic Priorities", {
        x: 0.5,
        y: yPos,
        w: 9,
        h: 0.3,
        fontSize: 14,
        fontFace: FONTS.heading,
        color: KORN_FERRY_COLORS.primary.replace("#", ""),
        bold: true,
      });
      yPos += 0.4;
      data.annualReportSummary.strategicPriorities.slice(0, 4).forEach((priority) => {
        arSlide.addText(`• ${priority}`, {
          x: 0.7,
          y: yPos,
          w: 8.5,
          h: 0.3,
          fontSize: 11,
          fontFace: FONTS.body,
          color: KORN_FERRY_COLORS.text.replace("#", ""),
        });
        yPos += 0.35;
      });
    }

    if (data.annualReportSummary.ceoLetterHighlights?.length) {
      yPos += 0.2;
      arSlide.addText("CEO Letter Highlights", {
        x: 0.5,
        y: yPos,
        w: 9,
        h: 0.3,
        fontSize: 14,
        fontFace: FONTS.heading,
        color: KORN_FERRY_COLORS.primary.replace("#", ""),
        bold: true,
      });
      yPos += 0.4;
      data.annualReportSummary.ceoLetterHighlights.slice(0, 3).forEach((highlight) => {
        arSlide.addText(`• ${highlight}`, {
          x: 0.7,
          y: yPos,
          w: 8.5,
          h: 0.3,
          fontSize: 11,
          fontFace: FONTS.body,
          color: KORN_FERRY_COLORS.text.replace("#", ""),
        });
        yPos += 0.35;
      });
    }

    addKFFooter(arSlide, pageNum);
  }

  if (options.includeIntelligence && data.earningsCallHighlights) {
    pageNum++;
    const ecSlide = pres.addSlide();
    addGradientHeader(ecSlide, `Earnings Call - ${data.earningsCallHighlights.quarter}`, data.earningsCallHighlights.transcriptUrl ? "Click link below for transcript" : undefined);

    let yPos = 1.2;

    if (data.earningsCallHighlights.executiveCommentary?.length) {
      ecSlide.addText("Executive Commentary", {
        x: 0.5,
        y: yPos,
        w: 9,
        h: 0.3,
        fontSize: 14,
        fontFace: FONTS.heading,
        color: KORN_FERRY_COLORS.primary.replace("#", ""),
        bold: true,
      });
      yPos += 0.4;
      data.earningsCallHighlights.executiveCommentary.slice(0, 3).forEach((quote) => {
        ecSlide.addText(`"${quote}"`, {
          x: 0.7,
          y: yPos,
          w: 8.5,
          h: 0.4,
          fontSize: 11,
          fontFace: FONTS.body,
          color: KORN_FERRY_COLORS.text.replace("#", ""),
          italic: true,
        });
        yPos += 0.45;
      });
    }

    if (data.earningsCallHighlights.futureOutlook) {
      yPos += 0.2;
      ecSlide.addText("Future Outlook", {
        x: 0.5,
        y: yPos,
        w: 9,
        h: 0.3,
        fontSize: 14,
        fontFace: FONTS.heading,
        color: KORN_FERRY_COLORS.primary.replace("#", ""),
        bold: true,
      });
      yPos += 0.4;
      ecSlide.addText(data.earningsCallHighlights.futureOutlook, {
        x: 0.7,
        y: yPos,
        w: 8.5,
        h: 0.8,
        fontSize: 11,
        fontFace: FONTS.body,
        color: KORN_FERRY_COLORS.text.replace("#", ""),
      });
    }

    addKFFooter(ecSlide, pageNum);
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
  const margin = 20;
  let yPos = 20;

  // Enhanced header with gradient effect
  doc.setFillColor(0, 51, 141); // primary
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setFillColor(8, 145, 178); // teal accent
  doc.rect(0, 35, pageWidth, 8, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("DISCOVERY REPORT", margin, 22);

  doc.setFontSize(14);
  doc.setTextColor(255, 107, 53); // secondary
  doc.text(data.companyName, margin, 32);

  if (options.includeTheme && data.theme) {
    doc.setFontSize(11);
    doc.setTextColor(8, 145, 178);
    doc.text(`Theme: ${data.theme}`, margin, 48);
    yPos = 58;
  } else {
    yPos = 52;
  }

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated ${new Date().toLocaleDateString()}`, margin, yPos);
  yPos += 10;

  if (options.includeIntelligence && data.executiveSummary) {
    yPos += 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 34, 64);
    doc.text("Executive Summary", margin, yPos);

    yPos += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    const lines = doc.splitTextToSize(data.executiveSummary, pageWidth - margin * 2);
    doc.text(lines, margin, yPos);
    yPos += lines.length * 5 + 10;
  }

  if (options.includeIntelligence && data.insights.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 34, 64);
    doc.text("Key Insights", margin, yPos);

    yPos += 10;
    data.insights.slice(0, 10).forEach((insight) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(10, 34, 64);
      doc.text(`• ${insight.title}`, margin, yPos);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);
      const valueLines = doc.splitTextToSize(insight.value, pageWidth - margin * 2 - 10);
      doc.text(valueLines, margin + 5, yPos + 5);
      yPos += 5 + valueLines.length * 5 + 5;
    });
  }

  if (options.includeIntelligence && data.annualReportSummary) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    yPos += 5;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 34, 64);
    doc.text(`Annual Report Summary - ${data.annualReportSummary.fiscalYear}`, margin, yPos);

    if (data.annualReportSummary.strategicPriorities?.length) {
      yPos += 10;
      doc.setFontSize(11);
      doc.text("Strategic Priorities", margin, yPos);
      yPos += 6;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      data.annualReportSummary.strategicPriorities.forEach((priority) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${priority}`, margin + 5, yPos);
        yPos += 6;
      });
    }
  }

  // Client Interaction Section
  // Meeting Attendees section
  if (options.includeClientInteraction && data.meetingAttendees && data.meetingAttendees.length > 0) {
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 34, 64);
    doc.text("Meeting Attendees", margin, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    
    data.meetingAttendees.forEach((attendee) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.text(`• ${attendee.name}`, margin, yPos);
      doc.setFont("helvetica", "normal");
      const details = [attendee.title, attendee.role, attendee.influence].filter(Boolean).join(" | ");
      if (details) {
        doc.text(`  ${details}`, margin + 5, yPos + 5);
        yPos += 12;
      } else {
        yPos += 7;
      }
    });
  }

  // Green Sheet section
  if (options.includeClientInteraction && data.greenSheet && (data.greenSheet.objective || data.greenSheet.desiredOutcome)) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    } else {
      yPos += 10;
    }
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 34, 64);
    doc.text("Call Planner (Green Sheet)", margin, yPos);
    yPos += 10;

    const sections = [
      { label: "Call Objective", value: data.greenSheet.objective },
      { label: "Desired Outcome", value: data.greenSheet.desiredOutcome },
      { label: "Opening Statement", value: data.greenSheet.openingStatement },
      { label: "Best Action Commitment", value: data.greenSheet.bestActionCommitment },
    ];

    sections.forEach((section) => {
      if (section.value) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(10, 34, 64);
        doc.text(section.label, margin, yPos);
        yPos += 6;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 41, 59);
        const lines = doc.splitTextToSize(section.value, pageWidth - margin * 2);
        doc.text(lines, margin, yPos);
        yPos += lines.length * 5 + 8;
      }
    });
  }

  // Summary Section
  // Discovery Questions section
  if (options.includeSummary && data.discoveryQuestions && data.discoveryQuestions.length > 0) {
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 34, 64);
    doc.text("Discovery Questions & Responses", margin, yPos);
    yPos += 10;

    data.discoveryQuestions.forEach((q, idx) => {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(10, 34, 64);
      doc.text(`${idx + 1}. ${q.question}`, margin, yPos);
      yPos += 6;
      
      if (q.answer) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 41, 59);
        const answerLines = doc.splitTextToSize(q.answer, pageWidth - margin * 2 - 10);
        doc.text(answerLines, margin + 5, yPos);
        yPos += answerLines.length * 5 + 3;
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

  // Story Coaching section
  if (options.includeSummary && data.storyCoaching && (data.storyCoaching.keyMessage || data.storyCoaching.openingHook)) {
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 34, 64);
    doc.text("Story Coaching Framework", margin, yPos);
    yPos += 12;

    const storyElements = [
      { label: "Key Message", value: data.storyCoaching.keyMessage },
      { label: "Emotional Goal", value: data.storyCoaching.emotionalGoal },
      { label: "Opening Hook", value: data.storyCoaching.openingHook },
      { label: "Turning Point", value: data.storyCoaching.turningPoint },
      { label: "Call to Action", value: data.storyCoaching.callToAction },
    ];

    storyElements.forEach((element) => {
      if (element.value) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(10, 34, 64);
        doc.text(`${element.label}:`, margin, yPos);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 41, 59);
        const lines = doc.splitTextToSize(element.value, pageWidth - margin * 2 - 40);
        doc.text(lines, margin + 40, yPos);
        yPos += Math.max(lines.length * 5, 6) + 4;
      }
    });

    // Tension Questions
    if (data.storyCoaching.tensionQuestions && data.storyCoaching.tensionQuestions.length > 0) {
      yPos += 5;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 107, 53);
      doc.text("Tension Questions", margin, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);
      data.storyCoaching.tensionQuestions.forEach((tq) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${tq.prompt}`, margin + 5, yPos);
        yPos += 6;
      });
    }
  }

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Confidential - Korn Ferry", pageWidth - margin - 40, doc.internal.pageSize.getHeight() - 10);

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
