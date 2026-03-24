import type { EvidencePack, EvidencePackItem } from "@shared/schema";

function esc(str: string | null | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fmtType(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function fmtStatus(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

const valuePillarConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
  grow:      { label: "Grow",      bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  optimise:  { label: "Optimise",  bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  derisk:    { label: "De-risk",   bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  strengthen:{ label: "Strengthen",bg: "#faf5ff", color: "#7e22ce", border: "#e9d5ff" },
};

const phaseConfig: Record<string, { label: string; description: string; narrative: string; timelineLabel: string; accentColor: string; bg: string; border: string; headerBg: string }> = {
  leading: {
    label: "What We Saw Before Results",
    description: "Discovery insights, success frame, stakeholder mapping",
    narrative: "Before the numbers moved, here's what the team observed through careful discovery...",
    timelineLabel: "Discovered",
    accentColor: "#1d4ed8",
    bg: "#eff6ff",
    border: "#bfdbfe",
    headerBg: "#dbeafe",
  },
  mid_loop: {
    label: "How Discipline Held Under Pressure",
    description: "Assumption revisions, risk articulation, behavior signals",
    narrative: "When circumstances changed, here's how the engagement adapted...",
    timelineLabel: "Adapted",
    accentColor: "#b45309",
    bg: "#fffbeb",
    border: "#fde68a",
    headerBg: "#fef3c7",
  },
  lagging: {
    label: "Results with Context",
    description: "Outcomes achieved, KPIs delivered, artifacts",
    narrative: "The results speak to the journey, not just the destination...",
    timelineLabel: "Achieved",
    accentColor: "#15803d",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    headerBg: "#dcfce7",
  },
};

const itemStatusConfig: Record<string, { label: string; bg: string; color: string }> = {
  draft:                     { label: "Draft",              bg: "#f3f4f6", color: "#374151" },
  pending:                   { label: "Pending",            bg: "#fef9c3", color: "#b45309" },
  validated:                 { label: "Validated",          bg: "#dcfce7", color: "#15803d" },
  approved:                  { label: "Approved",           bg: "#dcfce7", color: "#15803d" },
  flagged:                   { label: "Flagged",            bg: "#ffedd5", color: "#c2410c" },
  rejected:                  { label: "Rejected",           bg: "#fee2e2", color: "#dc2626" },
  needs_evidence:            { label: "Needs Evidence",     bg: "#fef9c3", color: "#b45309" },
  needs_stakeholder_validation: { label: "Needs Validation", bg: "#dbeafe", color: "#1d4ed8" },
  needs_input:               { label: "Needs Input",        bg: "#faf5ff", color: "#7e22ce" },
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

function phaseIcon(phase: string): string {
  if (phase === "leading") return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
  if (phase === "mid_loop") return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>`;
}

function itemTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    outcome: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
    success_story: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`,
    kpi: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    insight: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`,
  };
  return icons[type] || `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
}

function renderItemCard(item: EvidencePackItem): string {
  const pillar = item.valuePillar ? valuePillarConfig[item.valuePillar] : null;
  const statusCfg = itemStatusConfig[item.itemStatus] || itemStatusConfig.draft;
  const kfOffering = (item as any).kfOffering || (item as any).provenance?.kfOffering;

  const confidencePct = item.itemConfidenceScore != null ? item.itemConfidenceScore : null;

  const proofSources = (item.proofSources as any[] | null) || [];

  const badges: string[] = [];
  if (pillar) {
    badges.push(`<span class="badge" style="background:${pillar.bg};color:${pillar.color};border:1px solid ${pillar.border};">${esc(pillar.label)}</span>`);
  }
  if (kfOffering) {
    badges.push(`<span class="badge" style="background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;">${esc(kfOffering)}</span>`);
  }
  if (confidencePct != null) {
    const confColor = confidencePct >= 70 ? "#15803d" : "#b45309";
    badges.push(`<span class="badge" style="background:#f9fafb;color:${confColor};border:1px solid #e5e7eb;">${confidencePct}% confidence</span>`);
  }
  const stakeholderName = (item.content as any)?.stakeholderName;
  if (stakeholderName) {
    badges.push(`<span class="badge" style="background:#f9fafb;color:#374151;border:1px solid #e5e7eb;">&#128100; ${esc(stakeholderName)}</span>`);
  }
  const srcLabel = item.sourceType ? (sourceLabels[item.sourceType] || fmtType(item.sourceType)) : null;
  if (srcLabel && item.sourceType !== 'manual') {
    badges.push(`<span class="badge" style="background:#f9fafb;color:#374151;border:1px solid #e5e7eb;">${esc(srcLabel)}</span>`);
  }
  badges.push(`<span class="badge" style="background:${statusCfg.bg};color:${statusCfg.color};border:none;">${esc(statusCfg.label)}</span>`);
  if (item.aiGenerated) {
    badges.push(`<span class="badge" style="background:#faf5ff;color:#7e22ce;border:1px solid #e9d5ff;">&#10022; AI-Assisted</span>`);
  }

  const sourcesHtml = proofSources.length > 0 ? `
    <div class="sources-block">
      <p class="sources-label">Supporting Evidence</p>
      ${proofSources.map((s: any) => `
        <div class="source-item">
          <span class="source-title">${esc(s.title || "")}</span>
          ${s.type ? `<span class="source-type">${esc(fmtType(s.type))}</span>` : ""}
          ${s.url ? `<a class="source-link" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">View &rarr;</a>` : ""}
        </div>
      `).join("")}
    </div>` : "";

  const narrativeCtx = (item as any).narrativeContext;
  const narrativeHtml = narrativeCtx ? `<p class="item-narrative">${esc(narrativeCtx)}</p>` : "";

  return `
    <div class="item-card">
      <div class="item-icon-wrap">
        <div class="item-type-icon">${itemTypeIcon(item.itemType)}</div>
        <span class="item-type-label">${esc(fmtType(item.itemType))}</span>
      </div>
      <div class="item-body">
        <p class="item-claim">${esc(item.claim)}</p>
        ${narrativeHtml}
        <div class="badges-row">${badges.join("")}</div>
        ${sourcesHtml}
      </div>
    </div>`;
}

export function generateEvidencePackHTML(
  pack: EvidencePack,
  items: EvidencePackItem[],
  projectName?: string
): string {
  const allItems = items; // show ALL items, not just approved
  const approvedCount = allItems.filter(i => i.itemStatus === "approved" || i.itemStatus === "validated").length;
  const kpiItems = allItems.filter(i => i.itemType === "kpi" || i.itemType === "outcome");
  const successStories = allItems.filter(i => i.itemType === "success_story" || i.itemType === "testimonial");
  const qs = pack.qualityScore;
  const qsColor = qs == null ? "#6b7280" : qs >= 80 ? "#15803d" : qs >= 60 ? "#b45309" : "#dc2626";
  const qsBg = qs == null ? "#f3f4f6" : qs >= 80 ? "#dcfce7" : qs >= 60 ? "#fef9c3" : "#fee2e2";

  const phases = ["leading", "mid_loop", "lagging"] as const;
  const itemsByPhase: Record<string, EvidencePackItem[]> = { leading: [], mid_loop: [], lagging: [] };
  allItems.forEach(item => {
    const p = (item.evidencePhase || "leading") as string;
    if (!itemsByPhase[p]) itemsByPhase[p] = [];
    itemsByPhase[p].push(item);
  });

  const threadCount = phases.filter(p => itemsByPhase[p].length > 0).length;

  // Source attribution counts
  const sourceCounts: Record<string, number> = {};
  allItems.forEach(item => {
    const src = item.sourceType || "manual";
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });

  // Summary columns (first 2 items each)
  function summaryColumn(phase: "leading" | "mid_loop" | "lagging"): string {
    const cfg = phaseConfig[phase];
    const phaseItems = itemsByPhase[phase];
    const shown = phaseItems.slice(0, 2);
    const extra = phaseItems.length - 2;
    return `
      <div class="summary-col" style="border-color:${cfg.border};background:${cfg.bg};">
        <h4 class="summary-col-title" style="color:${cfg.accentColor};">
          ${phaseIcon(phase)} ${phase === "leading" ? "What We Found" : phase === "mid_loop" ? "How We Adapted" : "What We Achieved"}
        </h4>
        ${shown.map(i => `<p class="summary-item">${esc(i.claim)}</p>`).join("")}
        ${extra > 0 ? `<p class="summary-more" style="color:${cfg.accentColor};">+${extra} more</p>` : ""}
        ${phaseItems.length === 0 ? `<p class="summary-empty">Building...</p>` : ""}
      </div>`;
  }

  // Phase sections - full items
  function phaseSection(phase: "leading" | "mid_loop" | "lagging"): string {
    const phaseItems = itemsByPhase[phase];
    if (phaseItems.length === 0) return "";
    const cfg = phaseConfig[phase];
    return `
      <div class="phase-section" style="border-color:${cfg.border};background:${cfg.bg};">
        <div class="phase-header" style="background:${cfg.headerBg};">
          <div class="phase-header-left">
            <span class="phase-icon-wrap" style="color:${cfg.accentColor};">${phaseIcon(phase)}</span>
            <div>
              <span class="phase-label" style="color:${cfg.accentColor};">${esc(cfg.label)}</span>
              <span class="phase-count">${phaseItems.length}</span>
              <p class="phase-narrative">${esc(cfg.narrative)}</p>
            </div>
          </div>
        </div>
        <div class="phase-items">
          ${phaseItems.map(renderItemCard).join("")}
        </div>
      </div>`;
  }

  const packStatusCfg: Record<string, { label: string; bg: string; color: string }> = {
    draft: { label: "Draft", bg: "#f3f4f6", color: "#374151" },
    pending_review: { label: "Pending Review", bg: "#fef9c3", color: "#b45309" },
    in_review: { label: "In Review", bg: "#dbeafe", color: "#1d4ed8" },
    approved: { label: "Approved", bg: "#dcfce7", color: "#15803d" },
    rejected: { label: "Needs Work", bg: "#fee2e2", color: "#dc2626" },
    shared: { label: "Shared", bg: "#f3e8ff", color: "#7e22ce" },
  };
  const packStatus = packStatusCfg[pack.status] || { label: fmtStatus(pack.status), bg: "#f3f4f6", color: "#374151" };

  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

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
      background: #f4f5f7;
      color: #111827;
      line-height: 1.55;
    }
    a { color: #CC4E28; text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* ── Top bar ── */
    .topbar {
      background: linear-gradient(135deg, #0a2240 0%, #1a3a5c 100%);
      padding: 0 32px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 20;
    }
    .topbar-brand { display: flex; align-items: center; gap: 12px; }
    .topbar-logo {
      width: 36px; height: 36px; border-radius: 8px;
      background: #CC4E28; display: flex; align-items: center; justify-content: center;
      color: #fff; flex-shrink: 0;
    }
    .topbar-name { font-size: 1rem; font-weight: 700; color: #fff; }
    .topbar-sub { font-size: 0.72rem; color: #93c5fd; }
    .topbar-right { display: flex; align-items: center; gap: 8px; }
    .verified-pill {
      display: inline-flex; align-items: center; gap: 5px;
      background: rgba(34,197,94,0.15); color: #86efac;
      border: 1px solid rgba(34,197,94,0.3);
      border-radius: 9999px; padding: 4px 12px; font-size: 0.75rem; font-weight: 600;
    }

    /* ── Page layout ── */
    main { max-width: 860px; margin: 28px auto; padding: 0 24px 56px; }
    .space { display: flex; flex-direction: column; gap: 20px; }

    /* ── Card ── */
    .card {
      background: #fff; border: 1px solid #e5e7eb;
      border-radius: 12px; overflow: hidden;
    }
    .card-header { padding: 20px 24px 0; }
    .card-body { padding: 16px 24px 20px; }

    /* ── Pack header card ── */
    .pack-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
    .pack-title { font-size: 1.5rem; font-weight: 800; margin-bottom: 6px; color: #0a2240; }
    .pack-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .pack-company { display: flex; align-items: center; gap: 5px; font-size: 0.82rem; color: #6b7280; }
    .status-pill {
      display: inline-flex; align-items: center; gap: 4px;
      border-radius: 9999px; padding: 3px 10px; font-size: 0.72rem; font-weight: 600;
    }
    .quality-ring {
      width: 64px; height: 64px; border-radius: 9999px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-size: 1.1rem; font-weight: 800; flex-shrink: 0;
    }
    .quality-sublabel { font-size: 0.65rem; font-weight: 500; text-align: center; margin-top: 2px; color: #6b7280; }

    /* ── Metrics grid ── */
    .metrics-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
    .metric-box {
      text-align: center; padding: 14px 8px; border-radius: 10px; border: 1px solid #e5e7eb;
      background: #f9fafb;
    }
    .metric-val { font-size: 1.75rem; font-weight: 800; line-height: 1; }
    .metric-val.green { color: #15803d; }
    .metric-val.blue { color: #1d4ed8; }
    .metric-val.amber { color: #b45309; }
    .metric-desc { font-size: 0.7rem; color: #6b7280; margin-top: 4px; }

    /* ── Value Story section ── */
    .value-story-card {
      background: linear-gradient(135deg, rgba(219,234,254,0.4) 0%, #fff 50%, rgba(220,252,231,0.4) 100%);
      border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;
    }
    .vs-header { padding: 20px 24px 0; }
    .vs-title { display: flex; align-items: center; gap: 8px; font-size: 1.1rem; font-weight: 700; color: #0a2240; }
    .vs-subtitle { font-size: 0.82rem; color: #6b7280; margin-top: 4px; }
    .vs-body { padding: 16px 24px 20px; }

    /* Journey timeline */
    .journey-timeline {
      display: flex; align-items: center; justify-content: center; gap: 16px;
      flex-wrap: wrap; margin-bottom: 20px; padding: 16px;
      background: rgba(255,255,255,0.8); border-radius: 10px; border: 1px solid #e5e7eb;
    }
    .timeline-step { display: flex; align-items: center; gap: 8px; }
    .timeline-dot {
      width: 36px; height: 36px; border-radius: 9999px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .timeline-label { font-size: 0.8rem; font-weight: 600; }
    .timeline-arrow { color: #9ca3af; font-size: 1.2rem; }

    /* Summary columns */
    .summary-cols { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 20px; }
    .summary-col { border: 1px solid; border-radius: 10px; padding: 14px; }
    .summary-col-title {
      font-size: 0.8rem; font-weight: 700; margin-bottom: 8px;
      display: flex; align-items: center; gap: 6px;
    }
    .summary-item { font-size: 0.75rem; color: #4b5563; margin-bottom: 5px; line-height: 1.4; }
    .summary-more { font-size: 0.72rem; font-weight: 600; margin-top: 4px; }
    .summary-empty { font-size: 0.75rem; color: #9ca3af; font-style: italic; }

    /* Thread count */
    .thread-row {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.78rem; color: #6b7280; margin-bottom: 16px;
    }
    .thread-check { color: #15803d; font-size: 1rem; }

    /* Source chips */
    .source-chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .source-chip {
      display: inline-flex; align-items: center; gap: 4px;
      background: #f3f4f6; border: 1px solid #e5e7eb;
      border-radius: 9999px; padding: 3px 10px;
      font-size: 0.7rem; color: #374151;
    }
    .source-chip-count { font-weight: 700; }

    /* Section label */
    .section-label {
      font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
      color: #6b7280; margin-bottom: 10px;
    }

    /* ── Phase sections ── */
    .phase-section { border: 1px solid; border-radius: 12px; overflow: hidden; }
    .phase-header {
      padding: 14px 16px; display: flex;
      align-items: flex-start; justify-content: space-between;
    }
    .phase-header-left { display: flex; align-items: flex-start; gap: 10px; }
    .phase-icon-wrap { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
    .phase-label { font-size: 0.9rem; font-weight: 700; }
    .phase-count {
      display: inline-flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,0.08); border-radius: 9999px;
      padding: 1px 8px; font-size: 0.72rem; font-weight: 600; margin-left: 6px; vertical-align: middle;
    }
    .phase-narrative { font-size: 0.75rem; color: #6b7280; font-style: italic; margin-top: 3px; }
    .phase-items { padding: 10px; display: flex; flex-direction: column; gap: 8px; border-top: 1px solid rgba(0,0,0,0.05); }

    /* ── Item card ── */
    .item-card {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 10px;
      padding: 14px 14px 12px; display: flex; gap: 12px;
    }
    .item-icon-wrap { display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0; width: 46px; }
    .item-type-icon {
      width: 34px; height: 34px; border-radius: 9999px;
      background: #fef9c3; color: #b45309;
      display: flex; align-items: center; justify-content: center;
    }
    .item-type-label { font-size: 0.6rem; color: #9ca3af; text-align: center; line-height: 1.2; word-break: break-word; }
    .item-body { flex: 1; min-width: 0; }
    .item-claim { font-size: 0.9rem; font-weight: 600; color: #111827; margin-bottom: 6px; }
    .item-narrative { font-size: 0.78rem; color: #6b7280; font-style: italic; margin-bottom: 8px; }
    .badges-row { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 8px; }
    .badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 2px 9px; border-radius: 9999px;
      font-size: 0.67rem; font-weight: 600; white-space: nowrap;
    }

    /* Proof sources */
    .sources-block { margin-top: 8px; padding-top: 8px; border-top: 1px solid #f3f4f6; }
    .sources-label { font-size: 0.7rem; font-weight: 700; color: #6b7280; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
    .source-item {
      display: flex; align-items: baseline; flex-wrap: wrap; gap: 6px;
      font-size: 0.75rem; padding: 6px 8px;
      background: #f9fafb; border-radius: 6px; margin-bottom: 4px;
    }
    .source-title { font-weight: 500; color: #374151; }
    .source-type { color: #9ca3af; font-size: 0.68rem; }
    .source-link { color: #CC4E28; font-size: 0.68rem; }

    /* ── Footer ── */
    .footer-note {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 10px;
      padding: 16px 20px; text-align: center; font-size: 0.78rem; color: #6b7280;
    }
    .footer-note p + p { margin-top: 5px; }
    .footer-date { font-size: 0.68rem; margin-top: 6px; }

    @media print {
      .topbar { position: static; }
      body { background: #fff; }
      .item-card, .phase-section, .value-story-card, .card { page-break-inside: avoid; }
    }
  </style>
</head>
<body>

  <!-- Top bar -->
  <div class="topbar">
    <div class="topbar-brand">
      <div class="topbar-logo">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
      </div>
      <div>
        <div class="topbar-name">Korn Ferry Loop</div>
        <div class="topbar-sub">Evidence Pack</div>
      </div>
    </div>
    <div class="topbar-right">
      <div class="verified-pill">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        Korn Ferry Verified
      </div>
    </div>
  </div>

  <main>
    <div class="space">

      <!-- ── Pack header card ── -->
      <div class="card">
        <div class="card-header">
          <div class="pack-top">
            <div>
              <h1 class="pack-title">${esc(pack.title)}</h1>
              <div class="pack-meta">
                ${projectName ? `<span class="pack-company">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  ${esc(projectName)}
                </span>` : ""}
                <span class="status-pill" style="background:${packStatus.bg};color:${packStatus.color};">${esc(packStatus.label)}</span>
              </div>
            </div>
            ${qs != null ? `
              <div>
                <div class="quality-ring" style="background:${qsBg};color:${qsColor};">${qs}%</div>
                <div class="quality-sublabel">Quality Score</div>
              </div>` : ""}
          </div>
        </div>
        <div class="card-body">
          <div class="metrics-grid">
            <div class="metric-box">
              <div class="metric-val green">${kpiItems.length}</div>
              <div class="metric-desc">Outcomes Delivered</div>
            </div>
            <div class="metric-box">
              <div class="metric-val blue">${approvedCount}</div>
              <div class="metric-desc">Validated Points</div>
            </div>
            <div class="metric-box">
              <div class="metric-val amber">${successStories.length}</div>
              <div class="metric-desc">Success Stories</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── The Value Story ── -->
      ${allItems.length > 0 ? `
      <div class="value-story-card">
        <div class="vs-header">
          <div class="vs-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            The Value Story
          </div>
          <p class="vs-subtitle">How we created measurable impact through disciplined engagement</p>
        </div>
        <div class="vs-body">

          <!-- Journey timeline -->
          <div class="journey-timeline">
            <div class="timeline-step">
              <div class="timeline-dot" style="background:#dbeafe;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <span class="timeline-label" style="color:#1d4ed8;">Discovered</span>
            </div>
            <span class="timeline-arrow">&rarr;</span>
            <div class="timeline-step">
              <div class="timeline-dot" style="background:#fef3c7;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <span class="timeline-label" style="color:#b45309;">Adapted</span>
            </div>
            <span class="timeline-arrow">&rarr;</span>
            <div class="timeline-step">
              <div class="timeline-dot" style="background:#dcfce7;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
              </div>
              <span class="timeline-label" style="color:#15803d;">Achieved</span>
            </div>
          </div>

          <!-- Three-column summary -->
          <div class="summary-cols">
            ${summaryColumn("leading")}
            ${summaryColumn("mid_loop")}
            ${summaryColumn("lagging")}
          </div>

          <!-- Thread count -->
          <div class="thread-row">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            Story flows through ${threadCount} phase${threadCount !== 1 ? "s" : ""}${threadCount === 3 ? " — Complete journey documented" : ""}
            ${threadCount === 3 ? `<span class="thread-check">&#10003;</span>` : ""}
          </div>

          <!-- Evidence sources -->
          <div class="section-label">Evidence Sources</div>
          <div class="source-chips">
            ${Object.entries(sourceCounts).map(([src, count]) => `
              <span class="source-chip">
                <span class="source-chip-count">${count}</span>
                ${esc(sourceLabels[src] || fmtType(src))}
              </span>`).join("")}
          </div>

        </div>
      </div>` : ""}

      <!-- ── Phase Sections (full detail) ── -->
      ${phases.map(p => phaseSection(p)).join("")}

      <!-- ── Footer ── -->
      <div class="footer-note">
        <p>This evidence pack has been compiled and verified by Korn Ferry. All evidence items support the value claims made during the engagement.</p>
        <p>For questions or additional information, please contact your Korn Ferry representative.</p>
        <p class="footer-date">Generated on ${esc(date)} &bull; Korn Ferry Loop &bull; Confidential</p>
      </div>

    </div>
  </main>

</body>
</html>`;
}
