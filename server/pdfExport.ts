import type { EvidencePack, EvidencePackItem } from "@shared/schema";

// jsPDF has ESM/CJS interop issues in Node.js with tsx.
// We resolve it at runtime using createRequire so we always get the actual constructor.
import { createRequire } from "module";
const _require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const jsPDFLib: any = _require("jspdf");
// The class lives at .jsPDF in CJS, with .default as a fallback
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const JsPDF: any = jsPDFLib.jsPDF || jsPDFLib.default?.jsPDF || jsPDFLib.default || jsPDFLib;

// ── Colour palette ──────────────────────────────────────────────────────────
const C = {
  navy:    [10,  34,  64]  as [number, number, number],
  kfOrange:[204, 78,  40]  as [number, number, number],
  white:   [255, 255, 255] as [number, number, number],
  text:    [17,  24,  39]  as [number, number, number],
  muted:   [107, 114, 128] as [number, number, number],
  border:  [229, 231, 235] as [number, number, number],
  bg:      [249, 250, 251] as [number, number, number],
  green:   [21,  128, 61]  as [number, number, number],
  greenBg: [220, 252, 231] as [number, number, number],
  blue:    [29,  78,  216] as [number, number, number],
  blueBg:  [219, 234, 254] as [number, number, number],
  amber:   [180, 83,  9]   as [number, number, number],
  amberBg: [254, 243, 199] as [number, number, number],
  purple:  [126, 34,  206] as [number, number, number],
  purpleBg:[245, 243, 255] as [number, number, number],
  red:     [220, 38,  38]  as [number, number, number],
};

const valuePillarColors: Record<string, [number, number, number]> = {
  grow:      C.green,
  optimise:  C.blue,
  derisk:    C.amber,
  strengthen:C.purple,
};
const valuePillarLabels: Record<string, string> = {
  grow: "Grow", optimise: "Optimise", derisk: "De-risk", strengthen: "Strengthen",
};

const phaseConfig = {
  leading: {
    label:     "What We Saw Before Results",
    narrative: "Before the numbers moved, here's what the team observed through careful discovery...",
    timelineLabel: "Discovered",
    color:     C.blue,
    bgColor:   C.blueBg,
  },
  mid_loop: {
    label:     "How Discipline Held Under Pressure",
    narrative: "When circumstances changed, here's how the engagement adapted...",
    timelineLabel: "Adapted",
    color:     C.amber,
    bgColor:   C.amberBg,
  },
  lagging: {
    label:     "Results with Context",
    narrative: "The results speak to the journey, not just the destination...",
    timelineLabel: "Achieved",
    color:     C.green,
    bgColor:   C.greenBg,
  },
} as const;

const itemStatusLabels: Record<string, string> = {
  draft: "Draft", pending: "Pending", validated: "Validated", approved: "Approved",
  flagged: "Flagged", rejected: "Rejected", needs_evidence: "Needs Evidence",
  needs_stakeholder_validation: "Needs Validation", needs_input: "Needs Input",
};

const sourceLabels: Record<string, string> = {
  kpi_commitment: "KPI Commitment", discovery_insight: "Discovery Insight",
  bluesheet: "Blue Sheet", artifact: "Artifact", evidence_artefact: "Document",
  interaction: "Interaction", notes: "Notes", discovery_notes: "Discovery Notes",
  engagement_log: "Engagement", meeting_notes: "Meeting", success_story: "Success Story",
  success_story_library: "Success Library", business_review: "Business Review",
  assumption_revision: "Adaptation", decision_log: "Decision",
  kpi_actual: "KPI Result", deliverable: "Deliverable", manual: "Manual", ai_generated: "AI",
};

function fmtType(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export async function generateEvidencePackPDF(
  pack: EvidencePack,
  items: EvidencePackItem[],
  projectName?: string
): Promise<Buffer> {
  const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();   // 210
  const H = doc.internal.pageSize.getHeight();  // 297
  const ML = 18; // left margin
  const MR = 18; // right margin
  const CW = W - ML - MR; // content width = 174
  let y = 0;
  let pageNum = 1;

  // ── Helpers ────────────────────────────────────────────────────────────────
  function newPage() {
    renderFooter(pageNum);
    doc.addPage();
    pageNum++;
    y = 16;
    renderPageHeader();
  }

  function guard(needed: number) {
    if (y + needed > H - 20) newPage();
  }

  function renderTopBar() {
    doc.setFillColor(...C.navy);
    doc.rect(0, 0, W, 22, "F");
    doc.setFillColor(...C.kfOrange);
    doc.rect(0, 22, W, 2, "F");

    doc.setTextColor(...C.white);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("KORN FERRY", ML, 13);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Evidence Pack", ML + 55, 13);

    const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    doc.setFontSize(8);
    doc.text(dateStr, W - MR, 13, { align: "right" });

    y = 30;
  }

  function renderPageHeader() {
    doc.setFillColor(...C.navy);
    doc.rect(0, 0, W, 10, "F");
    doc.setTextColor(...C.white);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("KORN FERRY  |  Evidence Pack", ML, 7);
    y = 16;
  }

  function renderFooter(pn: number) {
    doc.setDrawColor(...C.border);
    doc.line(ML, H - 14, W - MR, H - 14);
    doc.setTextColor(...C.muted);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(`Page ${pn}`, W / 2, H - 8, { align: "center" });
    doc.text("Korn Ferry | Confidential", ML, H - 8);
    doc.text(pack.title.length > 40 ? pack.title.slice(0, 40) + "…" : pack.title, W - MR, H - 8, { align: "right" });
  }

  function sectionDivider(label: string, color: [number,number,number] = C.navy) {
    guard(12);
    doc.setFillColor(...color);
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(ML, y, CW, 8, "F");
    doc.setTextColor(...C.white);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.text(label.toUpperCase(), ML + 4, y + 5.5);
    y += 12;
  }

  function pill(text: string, bg: [number,number,number], fg: [number,number,number], x: number, py: number): number {
    doc.setFillColor(...bg);
    const tw = doc.getTextWidth(text);
    const pw = tw + 6;
    doc.roundedRect(x, py - 3.5, pw, 5.5, 1, 1, "F");
    doc.setTextColor(...fg);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.text(text, x + 3, py);
    return pw + 3;
  }

  function wrap(text: string, maxW: number): string[] {
    return doc.splitTextToSize(text, maxW);
  }

  // ── Render item ────────────────────────────────────────────────────────────
  function renderItem(item: EvidencePackItem) {
    const claimLines = wrap(item.claim, CW - 10);
    const proofSources = (item.proofSources as any[] | null) || [];
    const kfOffering = (item as any).kfOffering || (item as any).provenance?.kfOffering;
    const confidence = item.itemConfidenceScore != null ? item.itemConfidenceScore : null;
    const stakeholderName = (item.content as any)?.stakeholderName;
    const sourceLabel = item.sourceType ? (sourceLabels[item.sourceType] || fmtType(item.sourceType)) : null;
    const statusLabel = itemStatusLabels[item.itemStatus] || fmtType(item.itemStatus);
    const pillarLabel = item.valuePillar ? (valuePillarLabels[item.valuePillar] || item.valuePillar) : null;
    const pillarColor = item.valuePillar ? valuePillarColors[item.valuePillar] || C.muted : C.muted;

    const boxH =
      claimLines.length * 4.5 + 8 +          // claim
      5.5 +                                   // badge row
      (proofSources.length > 0 ? 4 + Math.min(proofSources.length, 3) * 5 : 0) + // sources
      6;                                       // bottom padding

    guard(boxH);

    // Card background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...C.border);
    doc.roundedRect(ML, y, CW, boxH, 2, 2, "FD");

    // Left accent strip
    doc.setFillColor(...(pillarColor));
    doc.rect(ML, y, 2.5, boxH, "F");

    // Claim text
    doc.setTextColor(...C.text);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.text(claimLines, ML + 6, y + 5.5);
    let iy = y + claimLines.length * 4.5 + 6;

    // Badges row
    let bx = ML + 6;
    if (pillarLabel) {
      const [r, g, b] = pillarColor;
      bx += pill(pillarLabel, [r + 200 > 255 ? 255 : r + 200, g + 200 > 255 ? 255 : g + 200, b + 200 > 255 ? 255 : b + 200] as [number,number,number], pillarColor, bx, iy);
    }
    if (kfOffering) {
      bx += pill(String(kfOffering), C.blueBg, C.blue, bx, iy);
    }
    if (sourceLabel && item.sourceType !== "manual") {
      bx += pill(sourceLabel, C.bg, C.muted, bx, iy);
    }
    if (confidence != null) {
      bx += pill(`${confidence}% conf`, C.bg, confidence >= 70 ? C.green : C.amber, bx, iy);
    }
    if (stakeholderName) {
      bx += pill(String(stakeholderName), C.bg, C.muted, bx, iy);
    }
    const [stBg, stFg]: [[number,number,number],[number,number,number]] =
      (item.itemStatus === "approved" || item.itemStatus === "validated")
        ? [C.greenBg, C.green]
        : item.itemStatus === "flagged" || item.itemStatus === "rejected"
          ? [[255, 226, 226], C.red]
          : [C.bg, C.muted];
    bx += pill(statusLabel, stBg, stFg, bx, iy);
    iy += 5.5;

    // Proof sources
    if (proofSources.length > 0) {
      doc.setTextColor(...C.muted);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.text("Supporting Evidence:", ML + 6, iy);
      iy += 4;
      for (const src of proofSources.slice(0, 3)) {
        const srcLine = wrap(`• ${src.title || ""}${src.type ? ` (${fmtType(src.type)})` : ""}`, CW - 12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C.muted);
        doc.text(srcLine, ML + 8, iy);
        iy += srcLine.length * 4;
      }
      if (proofSources.length > 3) {
        doc.text(`  + ${proofSources.length - 3} more`, ML + 8, iy);
        iy += 4;
      }
    }

    y += boxH + 3;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Page 1 — Title + Summary
  // ═══════════════════════════════════════════════════════════════════════════
  renderTopBar();

  // Pack title
  doc.setTextColor(...C.navy);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const titleLines = wrap(pack.title, CW);
  doc.text(titleLines, ML, y);
  y += titleLines.length * 7.5 + 4;

  if (projectName) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.muted);
    doc.text(`Account: ${projectName}`, ML, y);
    y += 6;
  }

  // Status + quality
  const statusLabel = {
    draft: "Draft", pending_review: "Pending Review", in_review: "In Review",
    approved: "Approved", rejected: "Needs Work", shared: "Shared",
  }[pack.status] || fmtType(pack.status);
  const statusFg: [number,number,number] = (pack.status === "approved" || pack.status === "shared") ? C.green : C.amber;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...statusFg);
  doc.text(`Status: ${statusLabel}`, ML, y);
  if (pack.qualityScore != null) {
    doc.setTextColor(...C.muted);
    doc.setFont("helvetica", "normal");
    doc.text(`Quality Score: ${pack.qualityScore}%`, ML + 55, y);
  }
  y += 10;

  // Horizontal rule
  doc.setDrawColor(...C.border);
  doc.line(ML, y, W - MR, y);
  y += 8;

  // ── Metrics row ────────────────────────────────────────────────────────────
  const allItems = items;
  const approvedCount = allItems.filter(i => i.itemStatus === "approved" || i.itemStatus === "validated").length;
  const kpiItems = allItems.filter(i => i.itemType === "kpi" || i.itemType === "outcome");
  const successStories = allItems.filter(i => i.itemType === "success_story" || i.itemType === "testimonial");

  const metrics = [
    { val: String(kpiItems.length),     label: "Outcomes Delivered", color: C.green },
    { val: String(approvedCount),        label: "Validated Points",   color: C.blue },
    { val: String(successStories.length),label: "Success Stories",    color: C.amber },
    { val: String(allItems.length),      label: "Total Evidence",     color: C.navy },
  ];
  const mw = CW / 4;
  metrics.forEach((m, i) => {
    const mx = ML + i * mw;
    doc.setFillColor(...C.bg);
    doc.roundedRect(mx, y, mw - 3, 20, 2, 2, "F");
    doc.setTextColor(...m.color);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(m.val, mx + mw / 2 - 1.5, y + 12, { align: "center" });
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.muted);
    doc.text(m.label, mx + mw / 2 - 1.5, y + 18, { align: "center" });
  });
  y += 26;

  // ── Value Story summary ────────────────────────────────────────────────────
  const itemsByPhase: Record<string, EvidencePackItem[]> = { leading: [], mid_loop: [], lagging: [] };
  allItems.forEach(item => {
    const p = (item.evidencePhase || "leading") as string;
    if (!itemsByPhase[p]) itemsByPhase[p] = [];
    itemsByPhase[p].push(item);
  });
  const threadCount = (["leading","mid_loop","lagging"] as const).filter(p => itemsByPhase[p].length > 0).length;

  sectionDivider("The Value Story", C.navy);

  // Journey row: Discovered → Adapted → Achieved
  const phaseOrder = ["leading","mid_loop","lagging"] as const;
  const stepW = CW / 3;
  phaseOrder.forEach((phase, i) => {
    const cfg = phaseConfig[phase];
    const sx = ML + i * stepW;
    doc.setFillColor(...cfg.bgColor);
    doc.roundedRect(sx, y, stepW - 4, 14, 2, 2, "F");
    doc.setTextColor(...cfg.color);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.text(cfg.timelineLabel, sx + (stepW - 4) / 2, y + 6, { align: "center" });
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.muted);
    doc.text(`${itemsByPhase[phase].length} items`, sx + (stepW - 4) / 2, y + 11, { align: "center" });
    if (i < 2) {
      doc.setTextColor(...C.muted);
      doc.setFontSize(10);
      doc.text("→", sx + stepW - 4, y + 8, { align: "center" });
    }
  });
  y += 18;

  // Summary previews
  phaseOrder.forEach((phase, i) => {
    const cfg = phaseConfig[phase];
    const phaseItems = itemsByPhase[phase];
    const sx = ML + i * stepW;
    if (phaseItems.length === 0) return;
    const preview = phaseItems.slice(0, 2);
    let py = y;
    doc.setTextColor(...cfg.color);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    const headerLines = wrap(cfg.label, stepW - 8);
    doc.text(headerLines, sx, py);
    py += headerLines.length * 4 + 2;
    preview.forEach(item => {
      const cl = wrap(item.claim, stepW - 8);
      doc.setTextColor(...C.muted);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.text(cl.slice(0, 2), sx, py);
      py += Math.min(cl.length, 2) * 4;
    });
    if (phaseItems.length > 2) {
      doc.setTextColor(...cfg.color);
      doc.setFontSize(6.5);
      doc.text(`+${phaseItems.length - 2} more`, sx, py);
    }
  });

  // Estimate how tall the previews were
  const maxPreviewLines = Math.max(...phaseOrder.map(phase => {
    const phaseItems = itemsByPhase[phase];
    if (phaseItems.length === 0) return 0;
    const cfg = phaseConfig[phase];
    const hLines = wrap(cfg.label, stepW - 8).length;
    const preview = phaseItems.slice(0, 2);
    const iLines = preview.reduce((acc, item) => acc + Math.min(wrap(item.claim, stepW - 8).length, 2), 0);
    return hLines + iLines + 1;
  }));
  y += maxPreviewLines * 4 + 8;

  // Source attribution
  const sourceCounts: Record<string, number> = {};
  allItems.forEach(item => {
    const src = item.sourceType || "manual";
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });
  doc.setTextColor(...C.muted);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("EVIDENCE SOURCES", ML, y);
  y += 4;
  let sx2 = ML;
  const sy = y;
  Object.entries(sourceCounts).forEach(([src, count]) => {
    const label = `${count}× ${sourceLabels[src] || fmtType(src)}`;
    const tw = doc.getTextWidth(label) + 8;
    if (sx2 + tw > W - MR) { sx2 = ML; y += 7; }
    doc.setFillColor(...C.bg);
    doc.setDrawColor(...C.border);
    doc.roundedRect(sx2, y - 3.5, tw, 5.5, 1, 1, "FD");
    doc.setTextColor(...C.muted);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.text(label, sx2 + 4, y);
    sx2 += tw + 3;
  });
  y += 10;

  // ═══════════════════════════════════════════════════════════════════════════
  // Pages — Journey Phase Sections
  // ═══════════════════════════════════════════════════════════════════════════
  for (const phase of phaseOrder) {
    const phaseItems = itemsByPhase[phase];
    if (phaseItems.length === 0) continue;
    const cfg = phaseConfig[phase];

    guard(20);
    sectionDivider(`${cfg.timelineLabel} — ${cfg.label}`, cfg.color);

    // Phase narrative
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...C.muted);
    const narrativeLines = wrap(cfg.narrative, CW);
    guard(narrativeLines.length * 4.5 + 4);
    doc.text(narrativeLines, ML, y);
    y += narrativeLines.length * 4.5 + 6;

    for (const item of phaseItems) {
      renderItem(item);
    }
    y += 4;
  }

  // ── Final footer ───────────────────────────────────────────────────────────
  guard(30);
  doc.setDrawColor(...C.border);
  doc.line(ML, y, W - MR, y);
  y += 6;
  const disclaimer = wrap(
    "This Evidence Pack has been compiled to support the value claims made during this engagement. All evidence items have been reviewed for accuracy and relevance. For questions or additional validation, please contact your Korn Ferry representative.",
    CW
  );
  doc.setTextColor(...C.muted);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "italic");
  doc.text(disclaimer, ML, y);

  renderFooter(pageNum);

  return Buffer.from(doc.output("arraybuffer"));
}
