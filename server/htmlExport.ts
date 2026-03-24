import type { EvidencePack, EvidencePackItem } from "@shared/schema";

const valuePillarStyles: Record<string, string> = {
  "Accelerate": "background:#dbeafe;color:#1d4ed8;",
  "Expand": "background:#dcfce7;color:#15803d;",
  "Assure": "background:#f3e8ff;color:#7e22ce;",
  "Adapt": "background:#ffedd5;color:#c2410c;",
  "grow": "background:#dcfce7;color:#15803d;",
  "optimise": "background:#dbeafe;color:#1d4ed8;",
  "derisk": "background:#ffedd5;color:#c2410c;",
  "strengthen": "background:#f3e8ff;color:#7e22ce;",
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatItemType(itemType: string): string {
  return itemType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export function generateEvidencePackHTML(
  pack: EvidencePack,
  items: EvidencePackItem[],
  projectName?: string
): string {
  const approvedItems = items.filter(i => i.itemStatus === "approved");
  const categories = Array.from(new Set(approvedItems.map(i => i.valuePillar).filter(Boolean))).length;
  const qualityScore = pack.qualityScore;

  const groupedItems = approvedItems.reduce((acc, item) => {
    const section = item.section || "Evidence";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, EvidencePackItem[]>);

  const qualityScoreColor =
    qualityScore == null ? "#6b7280"
    : qualityScore >= 80 ? "#15803d"
    : qualityScore >= 60 ? "#b45309"
    : "#dc2626";

  const qualityScoreBg =
    qualityScore == null ? "#f3f4f6"
    : qualityScore >= 80 ? "#dcfce7"
    : qualityScore >= 60 ? "#fef9c3"
    : "#fee2e2";

  const sectionsHtml = Object.entries(groupedItems).map(([section, sectionItems]) => {
    const itemsHtml = sectionItems.map(item => {
      const pillarStyle = item.valuePillar ? (valuePillarStyles[item.valuePillar] || "background:#f3f4f6;color:#374151;") : "";

      const sourcesHtml = item.proofSources && (item.proofSources as any[]).length > 0
        ? `<div class="sources">
            <p class="sources-label">Supporting Evidence:</p>
            ${(item.proofSources as any[]).map((source: any) => `
              <div class="source-item">
                <p class="source-title">${escapeHtml(source.title || "")}</p>
                ${source.type ? `<p class="source-type">${escapeHtml(source.type)}</p>` : ""}
                ${source.url ? `<a class="source-link" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">View Source &rarr;</a>` : ""}
              </div>
            `).join("")}
          </div>`
        : "";

      return `
        <div class="item-card">
          <div class="item-icon-col">
            <div class="item-icon${item.itemStatus === "approved" ? " item-icon-approved" : ""}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
          </div>
          <div class="item-content">
            <p class="item-claim">${escapeHtml(item.claim)}</p>
            <div class="item-badges">
              <span class="badge badge-outline">${escapeHtml(formatItemType(item.itemType))}</span>
              ${item.valuePillar ? `<span class="badge" style="${pillarStyle}">${escapeHtml(item.valuePillar)}</span>` : ""}
              ${item.itemStatus === "approved" ? `<span class="badge badge-verified">&#10003; Verified</span>` : ""}
              ${item.aiGenerated ? `<span class="badge badge-secondary">&#10022; AI-Assisted</span>` : ""}
            </div>
            ${sourcesHtml}
          </div>
        </div>
      `;
    }).join("");

    return `
      <div class="section">
        <h2 class="section-header">
          <svg class="section-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
          ${escapeHtml(section)}
          <span class="section-count">(${sectionItems.length})</span>
        </h2>
        <div class="items-list">
          ${itemsHtml}
        </div>
      </div>
    `;
  }).join("");

  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(pack.title)} — Evidence Pack | Korn Ferry Loop</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #f8f9fa;
      color: #1a1a1a;
      line-height: 1.5;
      min-height: 100vh;
    }
    a { color: #CC4E28; text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* Header */
    .site-header {
      background: #ffffff;
      border-bottom: 1px solid #e5e7eb;
      padding: 16px 0;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .site-header .inner {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo-block {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-icon {
      height: 40px;
      width: 40px;
      border-radius: 8px;
      background: #CC4E28;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
    }
    .logo-title { font-size: 1rem; font-weight: 700; }
    .logo-sub { font-size: 0.8rem; color: #6b7280; }
    .verified-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #bbf7d0;
      border-radius: 9999px;
      padding: 4px 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .verified-badge svg { width: 14px; height: 14px; }

    /* Main layout */
    main {
      max-width: 800px;
      margin: 32px auto;
      padding: 0 24px 48px;
    }
    .space-y { display: flex; flex-direction: column; gap: 24px; }

    /* Cards */
    .card {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    .card-header { padding: 20px 24px 8px; }
    .card-content { padding: 12px 24px 20px; }

    /* Summary card */
    .summary-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }
    .pack-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 6px; }
    .pack-company {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      color: #6b7280;
    }
    .quality-circle {
      width: 56px;
      height: 56px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      font-weight: 700;
      flex-shrink: 0;
    }
    .quality-label { text-align: center; font-size: 0.7rem; color: #6b7280; margin-top: 4px; }

    /* Stats grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      text-align: center;
    }
    .stat-box {
      padding: 12px;
      border-radius: 6px;
    }
    .stat-box.default { background: #f3f4f6; }
    .stat-box.green { background: #f0fdf4; }
    .stat-box.orange { background: #fff7ed; }
    .stat-number { font-size: 1.5rem; font-weight: 700; }
    .stat-number.green { color: #15803d; }
    .stat-number.orange { color: #CC4E28; }
    .stat-desc { font-size: 0.72rem; color: #6b7280; margin-top: 2px; }

    /* Sections */
    .section { }
    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.78rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #6b7280;
      margin-bottom: 12px;
    }
    .section-icon { flex-shrink: 0; }
    .section-count { font-weight: 400; font-size: 0.72rem; }
    .items-list { display: flex; flex-direction: column; gap: 12px; }

    /* Item cards */
    .item-card {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      display: flex;
      gap: 12px;
      border-left: 3px solid #bbf7d0;
    }
    .item-icon-col { flex-shrink: 0; }
    .item-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b7280;
    }
    .item-icon-approved {
      background: #dcfce7;
      color: #15803d;
    }
    .item-content { flex: 1; min-width: 0; }
    .item-claim { font-size: 0.95rem; font-weight: 500; margin-bottom: 8px; }

    /* Badges */
    .item-badges { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 10px;
      border-radius: 9999px;
      font-size: 0.72rem;
      font-weight: 500;
      white-space: nowrap;
    }
    .badge-outline {
      background: transparent;
      border: 1px solid #d1d5db;
      color: #374151;
      text-transform: capitalize;
    }
    .badge-verified {
      background: #dcfce7;
      color: #15803d;
    }
    .badge-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    /* Sources */
    .sources { margin-top: 10px; }
    .sources-label { font-size: 0.75rem; font-weight: 600; color: #6b7280; margin-bottom: 6px; }
    .source-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 8px 10px;
      background: #f9fafb;
      border-radius: 6px;
      margin-bottom: 6px;
      font-size: 0.82rem;
    }
    .source-title { font-weight: 500; }
    .source-type { color: #6b7280; font-size: 0.75rem; text-transform: capitalize; }
    .source-link { color: #CC4E28; font-size: 0.75rem; }

    /* Disclaimer */
    .disclaimer {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px 24px;
      text-align: center;
      font-size: 0.82rem;
      color: #6b7280;
    }
    .disclaimer p + p { margin-top: 6px; }
    .disclaimer .date-line { font-size: 0.72rem; }

    @media print {
      .site-header { position: static; }
      body { background: #fff; }
    }
  </style>
</head>
<body>

  <header class="site-header">
    <div class="inner">
      <div class="logo-block">
        <div class="logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
        </div>
        <div>
          <div class="logo-title">Evidence Pack</div>
          <div class="logo-sub">Korn Ferry Loop</div>
        </div>
      </div>
      <div class="verified-badge">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        Verified
      </div>
    </div>
  </header>

  <main>
    <div class="space-y">

      <!-- Summary card -->
      <div class="card">
        <div class="card-header">
          <div class="summary-top">
            <div>
              <h1 class="pack-title">${escapeHtml(pack.title)}</h1>
              ${projectName ? `<div class="pack-company">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                ${escapeHtml(projectName)}
              </div>` : ""}
            </div>
            ${qualityScore != null ? `<div>
              <div class="quality-circle" style="background:${qualityScoreBg};color:${qualityScoreColor};">
                ${qualityScore}%
              </div>
              <div class="quality-label">Quality</div>
            </div>` : ""}
          </div>
        </div>
        <div class="card-content">
          <div class="stats-grid">
            <div class="stat-box default">
              <div class="stat-number">${approvedItems.length}</div>
              <div class="stat-desc">Total Items</div>
            </div>
            <div class="stat-box green">
              <div class="stat-number green">${approvedItems.length}</div>
              <div class="stat-desc">Verified</div>
            </div>
            <div class="stat-box orange">
              <div class="stat-number orange">${categories}</div>
              <div class="stat-desc">Categories</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Evidence sections -->
      ${sectionsHtml}

      <!-- Disclaimer -->
      <div class="disclaimer">
        <p>This evidence pack has been verified and approved by Korn Ferry. For questions or additional information, please contact your Korn Ferry representative.</p>
        <p class="date-line">Generated on ${escapeHtml(date)} &bull; Powered by Korn Ferry Loop</p>
      </div>

    </div>
  </main>

</body>
</html>`;
}
