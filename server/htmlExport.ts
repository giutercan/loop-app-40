import type { EvidencePack, EvidencePackItem } from "@shared/schema";

// ── Utilities ──────────────────────────────────────────────────────────────
function esc(str: string | null | undefined): string {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function fmt(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
function progress(pct: number, color: string): string {
  const clamped = Math.min(100, Math.max(0, pct));
  return `<div class="progress-track"><div class="progress-bar" style="width:${clamped}%;background:${color};"></div></div>`;
}
function badge(text: string, bg: string, fg: string, border = "transparent"): string {
  return `<span class="badge" style="background:${bg};color:${fg};border:1px solid ${border};">${esc(text)}</span>`;
}

// ── Config maps ────────────────────────────────────────────────────────────
const valuePillarCfg: Record<string, { label: string; desc: string; bg: string; fg: string; border: string }> = {
  grow:      { label: "Grow",       desc: "Revenue & market expansion",       bg: "#f0fdf4", fg: "#15803d", border: "#bbf7d0" },
  optimise:  { label: "Optimise",   desc: "Efficiency & productivity",         bg: "#eff6ff", fg: "#1d4ed8", border: "#bfdbfe" },
  derisk:    { label: "De-risk",    desc: "Risk mitigation & compliance",      bg: "#fff7ed", fg: "#c2410c", border: "#fed7aa" },
  strengthen:{ label: "Strengthen", desc: "Capability & culture building",     bg: "#faf5ff", fg: "#7e22ce", border: "#e9d5ff" },
};

const phaseCfg: Record<string, {
  label: string; description: string; narrative: string;
  timelineLabel: string; fg: string; bg: string; border: string; headerBg: string;
}> = {
  leading: {
    label: "What We Saw Before Results",
    description: "Discovery insights, success frame, stakeholder mapping",
    narrative: "Before the numbers moved, here\u2019s what the team observed through careful discovery\u2026",
    timelineLabel: "Discovered",
    fg: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe", headerBg: "#dbeafe",
  },
  mid_loop: {
    label: "How Discipline Held Under Pressure",
    description: "Assumption revisions, risk articulation, behavior signals",
    narrative: "When circumstances changed, here\u2019s how the engagement adapted\u2026",
    timelineLabel: "Adapted",
    fg: "#b45309", bg: "#fffbeb", border: "#fde68a", headerBg: "#fef3c7",
  },
  lagging: {
    label: "Results with Context",
    description: "Outcomes achieved, KPIs delivered, artifacts",
    narrative: "The results speak to the journey, not just the destination\u2026",
    timelineLabel: "Achieved",
    fg: "#15803d", bg: "#f0fdf4", border: "#bbf7d0", headerBg: "#dcfce7",
  },
};

const itemStatusCfg: Record<string, { label: string; bg: string; fg: string }> = {
  draft:                        { label: "Draft",              bg: "#f3f4f6", fg: "#374151" },
  pending:                      { label: "Pending",            bg: "#fef9c3", fg: "#b45309" },
  validated:                    { label: "Validated",          bg: "#dcfce7", fg: "#15803d" },
  approved:                     { label: "Approved",           bg: "#dcfce7", fg: "#15803d" },
  flagged:                      { label: "Flagged",            bg: "#ffedd5", fg: "#c2410c" },
  rejected:                     { label: "Rejected",           bg: "#fee2e2", fg: "#dc2626" },
  needs_evidence:               { label: "Needs Evidence",     bg: "#fef9c3", fg: "#b45309" },
  needs_stakeholder_validation: { label: "Needs Validation",   bg: "#dbeafe", fg: "#1d4ed8" },
  needs_input:                  { label: "Needs Input",        bg: "#faf5ff", fg: "#7e22ce" },
};

const skillDomainCfg: Record<string, { label: string }> = {
  soft_skill:     { label: "Soft Skills" },
  hard_data:      { label: "Hard Data" },
  relationship:   { label: "Relationship" },
  skills_building:{ label: "Skills Building" },
};

const sourceLabelMap: Record<string, string> = {
  kpi_commitment: "KPI Commitment",  discovery_insight: "Discovery Insight",
  bluesheet: "Blue Sheet",           artifact: "Artifact",
  evidence_artefact: "Document",     interaction: "Interaction",
  notes: "Notes",                    discovery_notes: "Discovery Notes",
  engagement_log: "Engagement",      meeting_notes: "Meeting",
  success_story: "Success Story",    success_story_library: "Success Library",
  business_review: "Business Review",assumption_revision: "Adaptation",
  decision_log: "Decision",          kpi_actual: "KPI Result",
  deliverable: "Deliverable",        manual: "Manual",
  ai_generated: "AI",
};

// ── SVG icons (inline) ─────────────────────────────────────────────────────
const ICON = {
  eye:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  shield:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  trophy:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>`,
  target:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  book:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  award: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`,
  chart: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  users: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  grad:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  link:  `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  msg:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  tip:   `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`,
  doc:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  check: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  right: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
};

// ── Item card (full detail) ────────────────────────────────────────────────
function itemCard(item: EvidencePackItem): string {
  const pillar = item.valuePillar ? valuePillarCfg[item.valuePillar] : null;
  const statusC = itemStatusCfg[item.itemStatus] || itemStatusCfg.draft;
  const kfOffering = (item as any).kfOffering || (item as any).provenance?.kfOffering;
  const stakeholderName = (item.content as any)?.stakeholderName;
  const whatThisProves = (item.content as any)?.whatThisProves;
  const confidencePct = item.itemConfidenceScore;
  const proofSources = (item.proofSources as any[] | null) || [];
  const srcLabel = item.sourceType ? (sourceLabelMap[item.sourceType] || fmt(item.sourceType)) : null;

  const badgeHtml: string[] = [];
  if (pillar) badgeHtml.push(badge(pillar.label, pillar.bg, pillar.fg, pillar.border));
  if (kfOffering) badgeHtml.push(badge(String(kfOffering), "#eff6ff", "#1d4ed8", "#bfdbfe"));
  if (srcLabel && item.sourceType !== "manual") badgeHtml.push(badge(srcLabel, "#f3f4f6", "#374151", "#e5e7eb"));
  if (confidencePct != null) {
    const fg = confidencePct >= 70 ? "#15803d" : "#b45309";
    badgeHtml.push(badge(`${confidencePct}% confidence`, "#f9fafb", fg, "#e5e7eb"));
  }
  if (stakeholderName) badgeHtml.push(badge(`👤 ${stakeholderName}`, "#f9fafb", "#374151", "#e5e7eb"));
  if (item.itemStatus && item.itemStatus !== "draft") {
    badgeHtml.push(badge(statusC.label, statusC.bg, statusC.fg));
  }
  if (item.aiGenerated || item.sourceType === "ai_generated" || (item as any).sourceKind === "ai") {
    badgeHtml.push(badge("✦ AI-Assisted", "#faf5ff", "#7e22ce", "#e9d5ff"));
  }
  if (item.evidencePhase && phaseCfg[item.evidencePhase]) {
    const phC = phaseCfg[item.evidencePhase];
    badgeHtml.push(badge(phC.timelineLabel, phC.bg, phC.fg, phC.border));
  }

  const sourcesHtml = proofSources.length > 0 ? `
    <div class="sources-block">
      <p class="sources-label">${ICON.link} Supporting Evidence</p>
      ${proofSources.map((s: any) => `
        <div class="source-row">
          <span class="source-title">${esc(s.title || "")}</span>
          ${s.type ? `<span class="source-type">${esc(fmt(s.type))}</span>` : ""}
          ${s.url ? `<a class="source-link" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">View &rarr;</a>` : ""}
          ${s.excerpt ? `<p class="source-excerpt">"${esc(s.excerpt)}"</p>` : ""}
        </div>`).join("")}
    </div>` : "";

  const whatThisProvesHtml = whatThisProves ? `
    <div class="what-proves">
      <span class="what-proves-label">${ICON.right} What this proves:</span>
      <span class="what-proves-text">${esc(whatThisProves)}</span>
    </div>` : "";

  const coachingTipHtml = item.coachingTip ? `
    <div class="coaching-tip">
      <span class="tip-label">${ICON.tip} Coaching tip:</span>
      <span class="tip-text">${esc(item.coachingTip)}</span>
    </div>` : "";

  const reviewerCommentHtml = item.reviewerComment ? `
    <div class="reviewer-comment">
      <span class="reviewer-label">${ICON.msg} Reviewer:</span>
      <span class="reviewer-text">${esc(item.reviewerComment)}</span>
    </div>` : "";

  return `
    <div class="item-card">
      <div class="item-type-col">
        <div class="item-type-icon">${ICON.doc}</div>
        <span class="item-type-label">${esc(fmt(item.itemType))}</span>
      </div>
      <div class="item-body">
        <p class="item-claim">${esc(item.claim)}</p>
        ${whatThisProvesHtml}
        <div class="badges-row">${badgeHtml.join("")}</div>
        ${sourcesHtml}
        ${coachingTipHtml}
        ${reviewerCommentHtml}
      </div>
    </div>`;
}

// ── Main export function ───────────────────────────────────────────────────
export function generateEvidencePackHTML(
  pack: EvidencePack,
  items: EvidencePackItem[],
  projectName?: string
): string {
  const allItems = items;

  // Phase grouping
  const byPhase: Record<string, EvidencePackItem[]> = { leading: [], mid_loop: [], lagging: [] };
  allItems.forEach(item => {
    const p = (item.evidencePhase || "leading") as string;
    if (!byPhase[p]) byPhase[p] = [];
    byPhase[p].push(item);
  });
  const threadCount = (["leading","mid_loop","lagging"] as const).filter(p => byPhase[p].length > 0).length;

  // Pillar grouping
  const byPillar: Record<string, EvidencePackItem[]> = {};
  allItems.forEach(item => {
    const p = item.valuePillar || "unassigned";
    if (!byPillar[p]) byPillar[p] = [];
    byPillar[p].push(item);
  });

  // Skill domain grouping
  const byDomain: Record<string, EvidencePackItem[]> = {};
  allItems.forEach(item => {
    const d = (item as any).skillDomain || "unassigned";
    if (!byDomain[d]) byDomain[d] = [];
    byDomain[d].push(item);
  });

  // Counts
  const approvedCount = allItems.filter(i => i.itemStatus === "approved" || i.itemStatus === "validated").length;
  const kpiItems = allItems.filter(i => i.itemType === "kpi" || i.itemType === "outcome");
  const successItems = allItems.filter(i => i.itemType === "success_story" || i.itemType === "testimonial");
  const qs = pack.qualityScore;
  const qsBg = qs == null ? "#f3f4f6" : qs >= 80 ? "#dcfce7" : qs >= 60 ? "#fef9c3" : "#fee2e2";
  const qsFg = qs == null ? "#6b7280" : qs >= 80 ? "#15803d" : qs >= 60 ? "#b45309" : "#dc2626";

  // Source counts
  const sourceCounts: Record<string, number> = {};
  allItems.forEach(item => {
    const src = item.sourceType || "manual";
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });

  const packStatusLabels: Record<string, { label: string; bg: string; fg: string }> = {
    draft:          { label: "Draft",          bg: "#f3f4f6", fg: "#374151" },
    pending_review: { label: "Pending Review", bg: "#fef9c3", fg: "#b45309" },
    in_review:      { label: "In Review",      bg: "#dbeafe", fg: "#1d4ed8" },
    approved:       { label: "Approved",       bg: "#dcfce7", fg: "#15803d" },
    rejected:       { label: "Needs Work",     bg: "#fee2e2", fg: "#dc2626" },
    shared:         { label: "Shared",         bg: "#f3e8ff", fg: "#7e22ce" },
  };
  const packStatus = packStatusLabels[pack.status] || { label: fmt(pack.status), bg: "#f3f4f6", fg: "#374151" };

  // Trust Velocity Scorecard
  const storyCompleteness = (byPhase.leading.length > 0 ? 33 : 0) +
                             (byPhase.mid_loop.length > 0 ? 33 : 0) +
                             (byPhase.lagging.length > 0 ? 34 : 0);

  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // ── HTML ──────────────────────────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(pack.title)} — Evidence Pack | Korn Ferry</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #f4f5f7; color: #111827; line-height: 1.55; font-size: 14px;
    }
    a { color: #CC4E28; text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* Top bar */
    .topbar {
      background: linear-gradient(135deg, #0a2240 0%, #1a3a5c 100%);
      padding: 0 32px; height: 56px;
      display: flex; align-items: center; justify-content: space-between;
      position: sticky; top: 0; z-index: 20;
    }
    .topbar-brand { display: flex; align-items: center; gap: 12px; }
    .topbar-logo { width: 36px; height: 36px; border-radius: 8px; background: #CC4E28; display: flex; align-items: center; justify-content: center; color: #fff; }
    .topbar-name { font-size: 1rem; font-weight: 700; color: #fff; }
    .topbar-sub { font-size: 0.7rem; color: #93c5fd; }
    .verified-pill {
      display: inline-flex; align-items: center; gap: 5px;
      background: rgba(34,197,94,0.15); color: #86efac;
      border: 1px solid rgba(34,197,94,0.3); border-radius: 9999px;
      padding: 4px 12px; font-size: 0.72rem; font-weight: 600;
    }

    /* Layout */
    main { max-width: 900px; margin: 24px auto; padding: 0 20px 60px; }
    .stack { display: flex; flex-direction: column; gap: 18px; }

    /* Cards */
    .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
    .card-hd { padding: 18px 22px 0; }
    .card-bd { padding: 14px 22px 18px; }
    .section-label {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.78rem; font-weight: 700; margin-bottom: 10px; color: #374151;
    }
    .section-sublabel { font-size: 0.72rem; color: #6b7280; font-weight: 400; margin-left: 4px; }

    /* View dividers */
    .view-heading {
      display: flex; align-items: center; gap: 10px;
      font-size: 0.72rem; font-weight: 800; text-transform: uppercase;
      letter-spacing: 0.1em; color: #6b7280; margin-top: 6px;
    }
    .view-heading::before, .view-heading::after {
      content: ""; flex: 1; height: 1px; background: #e5e7eb;
    }

    /* Pack header */
    .pack-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
    .pack-title { font-size: 1.5rem; font-weight: 800; color: #0a2240; margin-bottom: 6px; }
    .pack-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .pack-company { display: flex; align-items: center; gap: 5px; font-size: 0.8rem; color: #6b7280; }
    .status-pill { display: inline-flex; align-items: center; border-radius: 9999px; padding: 3px 10px; font-size: 0.7rem; font-weight: 600; }
    .quality-ring {
      width: 64px; height: 64px; border-radius: 9999px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-size: 1.1rem; font-weight: 800; flex-shrink: 0; line-height: 1;
    }
    .quality-sublabel { font-size: 0.62rem; color: #6b7280; text-align: center; margin-top: 2px; }

    /* Metrics */
    .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .metric-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 8px; text-align: center; }
    .metric-val { font-size: 1.8rem; font-weight: 800; line-height: 1; }
    .metric-desc { font-size: 0.68rem; color: #6b7280; margin-top: 4px; }

    /* Value Story */
    .vs-card {
      background: linear-gradient(135deg, rgba(219,234,254,0.3) 0%, #fff 50%, rgba(220,252,231,0.3) 100%);
      border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;
    }
    .vs-title { display: flex; align-items: center; gap: 8px; font-size: 1rem; font-weight: 700; color: #0a2240; }
    .vs-subtitle { font-size: 0.78rem; color: #6b7280; margin-top: 3px; }

    /* Journey timeline */
    .timeline-row {
      display: flex; align-items: center; justify-content: center; gap: 14px;
      flex-wrap: wrap; padding: 16px; background: rgba(255,255,255,0.9);
      border-radius: 10px; border: 1px solid #e5e7eb; margin-bottom: 18px;
    }
    .t-step { display: flex; align-items: center; gap: 8px; }
    .t-dot {
      width: 34px; height: 34px; border-radius: 9999px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .t-label { font-size: 0.8rem; font-weight: 600; }
    .t-arrow { color: #9ca3af; font-size: 1.1rem; }

    /* Summary cols */
    .summary-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 18px; }
    .summary-col { border: 1px solid; border-radius: 10px; padding: 14px; }
    .summary-col-title { font-size: 0.78rem; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 5px; }
    .summary-item { font-size: 0.73rem; color: #4b5563; margin-bottom: 5px; line-height: 1.4; }
    .summary-more { font-size: 0.7rem; font-weight: 600; margin-top: 4px; }
    .summary-empty { font-size: 0.73rem; color: #9ca3af; font-style: italic; }

    /* Thread + source row */
    .thread-row { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: #6b7280; margin-bottom: 14px; }
    .source-chips { display: flex; flex-wrap: wrap; gap: 5px; }
    .source-chip {
      display: inline-flex; align-items: center; gap: 3px;
      background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 9999px;
      padding: 2px 9px; font-size: 0.68rem; color: #374151;
    }
    .chip-count { font-weight: 700; }

    /* Value by Pillar */
    .pillar-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
    .pillar-card { border: 1px solid; border-radius: 10px; padding: 14px; }
    .pillar-name { font-size: 0.85rem; font-weight: 700; margin-bottom: 3px; }
    .pillar-desc { font-size: 0.72rem; color: #6b7280; margin-bottom: 10px; }
    .pillar-items { display: flex; flex-direction: column; gap: 6px; }
    .pillar-item { display: flex; align-items: flex-start; gap: 8px; padding: 8px 10px; background: #fff; border: 1px solid #e5e7eb; border-radius: 7px; font-size: 0.78rem; }
    .pillar-item-icon { flex-shrink: 0; color: #9ca3af; margin-top: 1px; }

    /* Success Stories */
    .story-card { display: flex; align-items: flex-start; gap: 12px; padding: 14px; border: 1px solid #fde68a; background: #fff; border-radius: 10px; }
    .story-quote { font-size: 0.88rem; font-style: italic; color: #374151; }
    .story-via { font-size: 0.72rem; color: #6b7280; margin-top: 6px; }

    /* Trust Velocity Scorecard */
    .scorecard-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .scorecard-tile { background: #fff; border: 1px solid; border-radius: 10px; padding: 14px; }
    .tile-header { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; font-size: 0.78rem; font-weight: 600; }
    .tile-val { font-size: 1.75rem; font-weight: 800; line-height: 1; }
    .tile-desc { font-size: 0.68rem; color: #6b7280; }
    .progress-track { height: 4px; background: #e5e7eb; border-radius: 9999px; margin-top: 8px; overflow: hidden; }
    .progress-bar { height: 100%; border-radius: 9999px; }

    /* Skills grid */
    .skills-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .skill-tile { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px 14px; }
    .skill-name { font-size: 0.75rem; font-weight: 600; color: #374151; margin-bottom: 4px; }
    .skill-counts { display: flex; align-items: baseline; gap: 6px; }
    .skill-num { font-size: 1.3rem; font-weight: 800; }
    .skill-sub { font-size: 0.68rem; color: #6b7280; }
    .skill-validated { font-size: 0.68rem; font-weight: 600; color: #15803d; margin-left: auto; }

    /* Phase sections */
    .phase-section { border: 1px solid; border-radius: 12px; overflow: hidden; }
    .phase-hd { padding: 14px 16px; display: flex; align-items: flex-start; gap: 10px; }
    .phase-icon { width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
    .phase-label { font-size: 0.9rem; font-weight: 700; }
    .phase-count {
      display: inline-flex; align-items: center;
      background: rgba(0,0,0,0.08); border-radius: 9999px;
      padding: 1px 7px; font-size: 0.7rem; font-weight: 600; margin-left: 6px;
    }
    .phase-narrative { font-size: 0.73rem; font-style: italic; color: #6b7280; margin-top: 3px; }
    .phase-items { border-top: 1px solid rgba(0,0,0,0.06); padding: 10px; display: flex; flex-direction: column; gap: 8px; }
    .phase-arrow { display: flex; align-items: center; justify-content: center; padding: 6px 0; }
    .phase-arrow-inner { display: flex; align-items: center; gap: 8px; background: #f3f4f6; border-radius: 9999px; padding: 4px 12px; font-size: 0.72rem; color: #6b7280; }

    /* Item cards */
    .item-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px 13px; display: flex; gap: 10px; }
    .item-type-col { display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0; width: 44px; }
    .item-type-icon { width: 32px; height: 32px; border-radius: 9999px; background: #fef9c3; color: #b45309; display: flex; align-items: center; justify-content: center; }
    .item-type-label { font-size: 0.58rem; color: #9ca3af; text-align: center; line-height: 1.2; word-break: break-word; }
    .item-body { flex: 1; min-width: 0; }
    .item-claim { font-size: 0.9rem; font-weight: 600; color: #111827; margin-bottom: 7px; }

    /* Item meta badges */
    .badges-row { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 8px; }
    .badge { display: inline-flex; align-items: center; gap: 3px; padding: 2px 8px; border-radius: 9999px; font-size: 0.65rem; font-weight: 600; white-space: nowrap; }

    /* What this proves */
    .what-proves { display: flex; align-items: flex-start; gap: 5px; font-size: 0.75rem; color: #374151; margin-bottom: 7px; border-left: 2px solid #fde68a; padding-left: 8px; }
    .what-proves-label { flex-shrink: 0; color: #b45309; display: flex; align-items: center; gap: 4px; font-weight: 600; }
    .what-proves-text { font-style: italic; }

    /* Coaching tip */
    .coaching-tip { display: flex; align-items: flex-start; gap: 5px; background: #fefce8; border: 1px solid #fef08a; border-radius: 7px; padding: 7px 9px; font-size: 0.73rem; color: #713f12; margin-top: 7px; }
    .tip-label { display: flex; align-items: center; gap: 4px; font-weight: 700; flex-shrink: 0; }
    .tip-text { line-height: 1.4; }

    /* Reviewer comment */
    .reviewer-comment { display: flex; align-items: flex-start; gap: 5px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 7px; padding: 7px 9px; font-size: 0.73rem; color: #1e40af; margin-top: 6px; }
    .reviewer-label { display: flex; align-items: center; gap: 4px; font-weight: 700; flex-shrink: 0; }
    .reviewer-text { line-height: 1.4; }

    /* Proof sources */
    .sources-block { margin-top: 8px; padding-top: 8px; border-top: 1px solid #f3f4f6; }
    .sources-label { display: flex; align-items: center; gap: 5px; font-size: 0.68rem; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
    .source-row { display: flex; align-items: baseline; flex-wrap: wrap; gap: 6px; font-size: 0.73rem; padding: 6px 8px; background: #f9fafb; border-radius: 6px; margin-bottom: 4px; }
    .source-title { font-weight: 500; color: #374151; }
    .source-type { color: #9ca3af; font-size: 0.66rem; }
    .source-link { color: #CC4E28; font-size: 0.66rem; }
    .source-excerpt { font-size: 0.66rem; color: #6b7280; font-style: italic; width: 100%; margin-top: 2px; }

    /* Footer */
    .footer { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px 20px; text-align: center; font-size: 0.75rem; color: #6b7280; }
    .footer p + p { margin-top: 4px; }
    .footer .date { font-size: 0.65rem; margin-top: 5px; }

    @media print {
      .topbar { position: static; }
      body { background: #fff; }
      .item-card, .phase-section, .vs-card, .card { page-break-inside: avoid; }
    }
  </style>
</head>
<body>

<div class="topbar">
  <div class="topbar-brand">
    <div class="topbar-logo">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    </div>
    <div>
      <div class="topbar-name">Korn Ferry Loop</div>
      <div class="topbar-sub">Evidence Pack Export</div>
    </div>
  </div>
  <div class="verified-pill">${ICON.check} Korn Ferry Verified</div>
</div>

<main>
<div class="stack">

<!-- ═══ PACK HEADER ═══════════════════════════════════════════════════════ -->
<div class="card">
  <div class="card-hd">
    <div class="pack-top">
      <div>
        <h1 class="pack-title">${esc(pack.title)}</h1>
        <div class="pack-meta">
          ${projectName ? `<span class="pack-company">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            ${esc(projectName)}
          </span>` : ""}
          <span class="status-pill" style="background:${packStatus.bg};color:${packStatus.fg};">${esc(packStatus.label)}</span>
          ${pack.description ? `<span style="font-size:0.78rem;color:#6b7280;">${esc(pack.description)}</span>` : ""}
        </div>
      </div>
      ${qs != null ? `<div>
        <div class="quality-ring" style="background:${qsBg};color:${qsFg};">${qs}%</div>
        <div class="quality-sublabel">Quality Score</div>
      </div>` : ""}
    </div>
  </div>
  <div class="card-bd">
    <div class="metrics-grid">
      <div class="metric-box">
        <div class="metric-val" style="color:#15803d;">${kpiItems.length}</div>
        <div class="metric-desc">Outcomes Delivered</div>
      </div>
      <div class="metric-box">
        <div class="metric-val" style="color:#1d4ed8;">${approvedCount}</div>
        <div class="metric-desc">Validated Points</div>
      </div>
      <div class="metric-box">
        <div class="metric-val" style="color:#b45309;">${successItems.length}</div>
        <div class="metric-desc">Success Stories</div>
      </div>
    </div>
  </div>
</div>

<!-- ═══ CLIENT VIEW ════════════════════════════════════════════════════════ -->
<div class="view-heading">Client View — what clients will see when you share this pack</div>

${allItems.length > 0 ? `
<!-- The Value Story -->
<div class="vs-card">
  <div class="card-hd">
    <div class="vs-title">${ICON.book} The Value Story</div>
    <p class="vs-subtitle">How we created measurable impact through disciplined engagement</p>
  </div>
  <div class="card-bd">
    <!-- Journey timeline -->
    <div class="timeline-row">
      <div class="t-step">
        <div class="t-dot" style="background:#dbeafe;">${ICON.eye.replace('14', '16').replace('14', '16')}</div>
        <span class="t-label" style="color:#1d4ed8;">Discovered</span>
      </div>
      <span class="t-arrow">&rarr;</span>
      <div class="t-step">
        <div class="t-dot" style="background:#fef3c7;">${ICON.shield.replace('14', '16').replace('14', '16')}</div>
        <span class="t-label" style="color:#b45309;">Adapted</span>
      </div>
      <span class="t-arrow">&rarr;</span>
      <div class="t-step">
        <div class="t-dot" style="background:#dcfce7;">${ICON.trophy.replace('14', '16').replace('14', '16')}</div>
        <span class="t-label" style="color:#15803d;">Achieved</span>
      </div>
    </div>

    <!-- Three-column summary -->
    <div class="summary-cols">
      ${(["leading","mid_loop","lagging"] as const).map(phase => {
        const cfg = phaseCfg[phase];
        const phaseItems = byPhase[phase];
        const shown = phaseItems.slice(0, 2);
        const extra = phaseItems.length - 2;
        const colTitle = phase === "leading" ? "What We Found" : phase === "mid_loop" ? "How We Adapted" : "What We Achieved";
        const colIcon = phase === "leading" ? ICON.eye : phase === "mid_loop" ? ICON.shield : ICON.trophy;
        return `
          <div class="summary-col" style="border-color:${cfg.border};background:${cfg.bg};">
            <div class="summary-col-title" style="color:${cfg.fg};">${colIcon} ${esc(colTitle)}</div>
            ${shown.map(i => `<p class="summary-item">${esc(i.claim)}</p>`).join("")}
            ${extra > 0 ? `<p class="summary-more" style="color:${cfg.fg};">+${extra} more</p>` : ""}
            ${phaseItems.length === 0 ? `<p class="summary-empty">Building…</p>` : ""}
          </div>`;
      }).join("")}
    </div>

    <!-- Thread count -->
    <div class="thread-row">
      ${ICON.link}
      Story flows through ${threadCount} phase${threadCount !== 1 ? "s" : ""}${threadCount === 3 ? " — Complete journey documented ✓" : ""}
    </div>

    <!-- Source attribution -->
    <div class="section-label">${ICON.link} Evidence Sources</div>
    <div class="source-chips">
      ${Object.entries(sourceCounts).map(([src, cnt]) => `
        <span class="source-chip">
          <span class="chip-count">${cnt}</span>
          ${esc(sourceLabelMap[src] || fmt(src))}
        </span>`).join("")}
    </div>
  </div>
</div>` : ""}

${Object.entries(valuePillarCfg).some(([k]) => (byPillar[k] || []).length > 0) ? `
<!-- Value by Strategic Pillar -->
<div class="card">
  <div class="card-hd">
    <div class="section-label">${ICON.target} Value by Strategic Pillar</div>
  </div>
  <div class="card-bd">
    <div class="pillar-grid">
      ${Object.entries(valuePillarCfg).map(([k, v]) => {
        const pItems = byPillar[k] || [];
        if (pItems.length === 0) return "";
        return `
          <div class="pillar-card" style="background:${v.bg};border-color:${v.border};">
            <div class="pillar-name" style="color:${v.fg};">${esc(v.label)}</div>
            <div class="pillar-desc">${esc(v.desc)}</div>
            <div class="pillar-items">
              ${pItems.map(i => `
                <div class="pillar-item">
                  <span class="pillar-item-icon">${ICON.doc}</span>
                  <span>${esc(i.claim)}</span>
                </div>`).join("")}
            </div>
          </div>`;
      }).join("")}
    </div>
  </div>
</div>` : ""}

${successItems.length > 0 ? `
<!-- Success Stories -->
<div class="card" style="border-color:#fde68a;background:#fffbeb;">
  <div class="card-hd">
    <div class="section-label" style="color:#b45309;">${ICON.award} Success Stories &amp; Testimonials</div>
  </div>
  <div class="card-bd">
    <div class="stack" style="gap:10px;">
      ${successItems.map(story => `
        <div class="story-card">
          <div style="color:#f59e0b;flex-shrink:0;margin-top:2px;">${ICON.msg}</div>
          <div>
            <p class="story-quote">"${esc(story.claim)}"</p>
            ${story.sourceType ? `<p class="story-via">— via ${esc(fmt(story.sourceType))}</p>` : ""}
          </div>
        </div>`).join("")}
    </div>
  </div>
</div>` : ""}

<!-- ═══ COACHING VIEW ══════════════════════════════════════════════════════ -->
<div class="view-heading">Coaching View — internal metrics and behavioral quality signals</div>

${allItems.length > 0 ? `
<!-- Trust Velocity Scorecard -->
<div class="card" style="border-color:#fde68a;background:#fffbeb;">
  <div class="card-hd">
    <div class="section-label" style="color:#b45309;">${ICON.trophy} Trust Velocity Scorecard <span class="section-sublabel">Behavioral quality signals beyond the numbers</span></div>
  </div>
  <div class="card-bd">
    <div class="scorecard-grid">
      <div class="scorecard-tile" style="border-color:#bfdbfe;">
        <div class="tile-header" style="color:#1d4ed8;">${ICON.eye} Discovery Signals</div>
        <div class="tile-val" style="color:#1d4ed8;">${byPhase.leading.length}</div>
        <div class="tile-desc">leading indicators</div>
        ${progress(Math.min(100, (byPhase.leading.length / 5) * 100), "#3b82f6")}
      </div>
      <div class="scorecard-tile" style="border-color:#fde68a;">
        <div class="tile-header" style="color:#b45309;">${ICON.shield} Deal Discipline</div>
        <div class="tile-val" style="color:#b45309;">${byPhase.mid_loop.length}</div>
        <div class="tile-desc">behavior signals</div>
        ${progress(Math.min(100, (byPhase.mid_loop.length / 3) * 100), "#f59e0b")}
      </div>
      <div class="scorecard-tile" style="border-color:#bbf7d0;">
        <div class="tile-header" style="color:#15803d;">${ICON.check} Results Documented</div>
        <div class="tile-val" style="color:#15803d;">${byPhase.lagging.length}</div>
        <div class="tile-desc">outcomes captured</div>
        ${progress(Math.min(100, (byPhase.lagging.length / 5) * 100), "#22c55e")}
      </div>
      <div class="scorecard-tile" style="border-color:#e5e7eb;">
        <div class="tile-header">${ICON.book} Story Completeness</div>
        <div class="tile-val">${storyCompleteness}%</div>
        <div class="tile-desc">journey coverage</div>
        ${progress(storyCompleteness, "#8b5cf6")}
      </div>
    </div>
  </div>
</div>` : ""}

${Object.keys(skillDomainCfg).some(d => (byDomain[d] || []).length > 0) ? `
<!-- Skills & Relationship Metrics -->
<div class="card" style="border-color:#e9d5ff;background:#faf5ff;">
  <div class="card-hd">
    <div class="section-label" style="color:#7e22ce;">${ICON.grad} Skills &amp; Relationship Metrics</div>
  </div>
  <div class="card-bd">
    <div class="skills-grid">
      ${Object.entries(skillDomainCfg).map(([domain, cfg]) => {
        const dItems = byDomain[domain] || [];
        const validatedCnt = dItems.filter(i => i.itemStatus === "approved" || i.itemStatus === "validated").length;
        return `
          <div class="skill-tile">
            <div class="skill-name">${esc(cfg.label)}</div>
            <div class="skill-counts">
              <span class="skill-num">${dItems.length}</span>
              <span class="skill-sub">items</span>
              ${validatedCnt > 0 ? `<span class="skill-validated">${validatedCnt} validated</span>` : ""}
            </div>
          </div>`;
      }).join("")}
    </div>
  </div>
</div>` : ""}

<!-- ═══ ALL EVIDENCE — Journey Phases ══════════════════════════════════════ -->
<div class="view-heading">All Evidence Items — full detail, all phases expanded</div>

${(["leading","mid_loop","lagging"] as const).map((phase, phaseIdx) => {
  const phaseItems = byPhase[phase];
  if (phaseItems.length === 0) return "";
  const cfg = phaseCfg[phase];
  const isLast = phaseIdx === 2 || (["leading","mid_loop","lagging"] as const).slice(phaseIdx + 1).every(p => byPhase[p].length === 0);
  const hasNext = !isLast && (["leading","mid_loop","lagging"] as const).slice(phaseIdx + 1).some(p => byPhase[p].length > 0);
  const phIcon = phase === "leading" ? ICON.eye : phase === "mid_loop" ? ICON.shield : ICON.trophy;

  return `
    <div class="phase-section" style="border-color:${cfg.border};background:${cfg.bg};">
      <div class="phase-hd" style="background:${cfg.headerBg};">
        <div class="phase-icon" style="color:${cfg.fg};">${phIcon}</div>
        <div>
          <div>
            <span class="phase-label" style="color:${cfg.fg};">${esc(cfg.label)}</span>
            <span class="phase-count">${phaseItems.length}</span>
          </div>
          <p class="phase-narrative">${esc(cfg.narrative)}</p>
        </div>
      </div>
      <div class="phase-items">
        ${phaseItems.map(itemCard).join("")}
      </div>
    </div>
    ${hasNext ? `<div class="phase-arrow"><div class="phase-arrow-inner">${ICON.right} Leads to</div></div>` : ""}`;
}).join("")}

<!-- Footer -->
<div class="footer">
  <p>This evidence pack has been compiled and verified by Korn Ferry. All evidence items support the value claims made during the engagement.</p>
  <p>For questions or additional information, please contact your Korn Ferry representative.</p>
  <p class="date">Generated on ${esc(date)} &bull; Korn Ferry Loop &bull; Confidential &bull; ${allItems.length} total evidence items</p>
</div>

</div>
</main>
</body>
</html>`;
}
