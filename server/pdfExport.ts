import jsPDF from "jspdf";
import type { EvidencePack, EvidencePackItem } from "@shared/schema";

const COLORS = {
  primary: [204, 78, 40] as [number, number, number],
  secondary: [100, 100, 100] as [number, number, number],
  text: [51, 51, 51] as [number, number, number],
  muted: [128, 128, 128] as [number, number, number],
  success: [34, 139, 34] as [number, number, number],
  warning: [255, 140, 0] as [number, number, number],
  border: [220, 220, 220] as [number, number, number],
};

const valuePillarColors: Record<string, [number, number, number]> = {
  "Accelerate": [59, 130, 246],
  "Expand": [34, 197, 94],
  "Assure": [168, 85, 247],
  "Adapt": [249, 115, 22],
};

export async function generateEvidencePackPDF(
  pack: EvidencePack,
  items: EvidencePackItem[],
  projectName?: string
): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;

  const addHeader = () => {
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, pageWidth, 35, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Evidence Pack", margin, 20);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Korn Ferry Loop", margin, 28);
    
    doc.setFontSize(10);
    const dateText = `Generated: ${new Date().toLocaleDateString()}`;
    const dateWidth = doc.getTextWidth(dateText);
    doc.text(dateText, pageWidth - margin - dateWidth, 28);
    
    yPos = 50;
  };

  const addFooter = (pageNum: number) => {
    doc.setDrawColor(...COLORS.border);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    
    doc.setTextColor(...COLORS.muted);
    doc.setFontSize(9);
    doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 8, { align: "center" });
    doc.text("Confidential - For Internal Use Only", margin, pageHeight - 8);
  };

  const checkPageBreak = (neededHeight: number): boolean => {
    if (yPos + neededHeight > pageHeight - 25) {
      addFooter(doc.getNumberOfPages());
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  const wrapText = (text: string, maxWidth: number): string[] => {
    return doc.splitTextToSize(text, maxWidth);
  };

  addHeader();

  doc.setTextColor(...COLORS.text);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const titleLines = wrapText(pack.title, contentWidth);
  doc.text(titleLines, margin, yPos);
  yPos += titleLines.length * 7 + 5;

  if (projectName) {
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.muted);
    doc.setFont("helvetica", "normal");
    doc.text(`Project: ${projectName}`, margin, yPos);
    yPos += 8;
  }

  const statusLabel = pack.status === "approved" ? "Approved" : 
                      pack.status === "shared" ? "Shared" : 
                      pack.status.replace('_', ' ').charAt(0).toUpperCase() + pack.status.replace('_', ' ').slice(1);
  
  doc.setFontSize(10);
  if (pack.status === "approved" || pack.status === "shared") {
    doc.setTextColor(...COLORS.success);
  } else {
    doc.setTextColor(...COLORS.warning);
  }
  doc.text(`Status: ${statusLabel}`, margin, yPos);
  
  if (pack.qualityScore != null) {
    const scoreText = `Quality Score: ${pack.qualityScore}%`;
    doc.text(scoreText, margin + 60, yPos);
  }
  yPos += 12;

  doc.setDrawColor(...COLORS.border);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  doc.setTextColor(...COLORS.text);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Summary", margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.secondary);
  
  const summaryStats = [
    `Total Evidence Items: ${items.length}`,
    `Approved Items: ${items.filter(i => i.itemStatus === "approved").length}`,
    `Categories Covered: ${Array.from(new Set(items.map(i => i.valuePillar).filter(Boolean))).length}`,
  ];
  
  summaryStats.forEach((stat) => {
    doc.text(`• ${stat}`, margin + 4, yPos);
    yPos += 6;
  });
  yPos += 8;

  const groupedItems = items.reduce((acc, item) => {
    const section = item.section || "General Evidence";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, EvidencePackItem[]>);

  for (const [section, sectionItems] of Object.entries(groupedItems)) {
    checkPageBreak(30);
    
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPos - 4, contentWidth, 10, "F");
    
    doc.setTextColor(...COLORS.text);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(section.toUpperCase(), margin + 4, yPos + 3);
    yPos += 14;

    for (const item of sectionItems) {
      const estimatedHeight = 40 + (item.proofSources ? (item.proofSources as any[]).length * 8 : 0);
      checkPageBreak(estimatedHeight);
      
      doc.setDrawColor(...COLORS.border);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, yPos - 2, contentWidth, 0.5, 1, 1, "S");
      
      const claimLines = wrapText(item.claim, contentWidth - 10);
      doc.setTextColor(...COLORS.text);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(claimLines, margin + 4, yPos + 4);
      yPos += claimLines.length * 5 + 4;

      doc.setFontSize(9);
      doc.setTextColor(...COLORS.muted);
      
      const typeLabel = item.itemType.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      doc.text(typeLabel, margin + 4, yPos);
      
      if (item.valuePillar) {
        const pillarColor = valuePillarColors[item.valuePillar] || COLORS.secondary;
        doc.setTextColor(...pillarColor);
        doc.text(`| ${item.valuePillar}`, margin + 40, yPos);
      }
      
      if (item.itemStatus === "approved") {
        doc.setTextColor(...COLORS.success);
        doc.text("✓ Approved", contentWidth - 10, yPos);
      }
      yPos += 6;

      if (item.proofSources && (item.proofSources as any[]).length > 0) {
        doc.setTextColor(...COLORS.secondary);
        doc.setFontSize(8);
        doc.text("Supporting Evidence:", margin + 4, yPos);
        yPos += 4;
        
        for (const source of (item.proofSources as any[]).slice(0, 3)) {
          const sourceText = `• ${source.title}${source.type ? ` (${source.type})` : ''}`;
          const sourceLines = wrapText(sourceText, contentWidth - 16);
          doc.text(sourceLines, margin + 8, yPos);
          yPos += sourceLines.length * 4;
        }
        
        if ((item.proofSources as any[]).length > 3) {
          doc.text(`  + ${(item.proofSources as any[]).length - 3} more sources`, margin + 8, yPos);
          yPos += 4;
        }
      }

      yPos += 6;
    }
    
    yPos += 4;
  }

  checkPageBreak(40);
  yPos += 10;
  doc.setDrawColor(...COLORS.border);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  
  const disclaimerLines = wrapText(
    "This Evidence Pack has been compiled to support the value claims made during our engagement. All evidence items have been reviewed for accuracy and relevance. For questions or additional validation, please contact your Korn Ferry representative.",
    contentWidth
  );
  doc.text(disclaimerLines, margin, yPos);

  addFooter(doc.getNumberOfPages());

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return pdfBuffer;
}
