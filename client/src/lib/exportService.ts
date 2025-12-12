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
};

const FONTS = {
  heading: "Arial",
  body: "Arial",
};

interface IntelligenceExportData {
  companyName: string;
  industry?: string;
  theme?: string;
  executiveSummary?: string;
  insights: Array<{
    title: string;
    value: string;
    category?: string;
    priority?: string;
  }>;
  annualReportSummary?: {
    fiscalYear: string;
    ceoLetterHighlights?: string[];
    strategicPriorities?: string[];
    riskFactors?: string[];
  };
  earningsCallHighlights?: {
    quarter: string;
    executiveCommentary?: string[];
    workforceDiscussions?: string[];
    futureOutlook?: string;
  };
  followUpResearch?: Array<{
    question: string;
    answer: string;
  }>;
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

function addKFHeader(pres: pptxgen, slide: pptxgen.Slide, title: string) {
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: "100%",
    h: 0.8,
    fill: { color: KORN_FERRY_COLORS.primary.replace("#", "") },
  });

  slide.addText(title, {
    x: 0.5,
    y: 0.2,
    w: 8,
    h: 0.4,
    fontSize: 20,
    fontFace: FONTS.heading,
    color: KORN_FERRY_COLORS.white.replace("#", ""),
    bold: true,
  });

  slide.addText("KORN FERRY", {
    x: 8,
    y: 0.25,
    w: 1.5,
    h: 0.3,
    fontSize: 10,
    fontFace: FONTS.body,
    color: KORN_FERRY_COLORS.secondary.replace("#", ""),
    align: "right",
  });
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

export function generateIntelligencePPT(data: IntelligenceExportData): void {
  const pres = new pptxgen();
  pres.title = `${data.companyName} - Intelligence Report`;
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
  titleSlide.addText("INTELLIGENCE REPORT", {
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
  if (data.industry) {
    titleSlide.addText(data.industry, {
      x: 0.5,
      y: 2.8,
      w: 9,
      h: 0.4,
      fontSize: 18,
      fontFace: FONTS.body,
      color: KORN_FERRY_COLORS.white.replace("#", ""),
    });
  }
  titleSlide.addText(`Generated ${new Date().toLocaleDateString()}`, {
    x: 0.5,
    y: 4.8,
    w: 9,
    h: 0.3,
    fontSize: 12,
    fontFace: FONTS.body,
    color: KORN_FERRY_COLORS.muted.replace("#", ""),
  });

  if (data.executiveSummary) {
    pageNum++;
    const summarySlide = pres.addSlide();
    addKFHeader(pres, summarySlide, "Executive Summary");
    summarySlide.addText(data.executiveSummary, {
      x: 0.5,
      y: 1.2,
      w: 9,
      h: 3.8,
      fontSize: 14,
      fontFace: FONTS.body,
      color: KORN_FERRY_COLORS.text.replace("#", ""),
      valign: "top",
    });
    addKFFooter(summarySlide, pageNum);
  }

  if (data.insights.length > 0) {
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

  if (data.annualReportSummary) {
    pageNum++;
    const arSlide = pres.addSlide();
    addKFHeader(pres, arSlide, `Annual Report Summary - ${data.annualReportSummary.fiscalYear}`);

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

  if (data.earningsCallHighlights) {
    pageNum++;
    const ecSlide = pres.addSlide();
    addKFHeader(pres, ecSlide, `Earnings Call Highlights - ${data.earningsCallHighlights.quarter}`);

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

  pres.writeFile({ fileName: `${data.companyName}_Intelligence_Report.pptx` });
}

export function generateIntelligencePDF(data: IntelligenceExportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  doc.setFillColor(10, 34, 64);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("INTELLIGENCE REPORT", margin, 25);

  doc.setFontSize(14);
  doc.setTextColor(0, 163, 224);
  doc.text(data.companyName, margin, 35);

  yPos = 55;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated ${new Date().toLocaleDateString()}`, margin, yPos);

  if (data.executiveSummary) {
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

  if (data.insights.length > 0) {
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

  if (data.annualReportSummary) {
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

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Confidential - Korn Ferry", pageWidth - margin - 40, doc.internal.pageSize.getHeight() - 10);

  doc.save(`${data.companyName}_Intelligence_Report.pdf`);
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
