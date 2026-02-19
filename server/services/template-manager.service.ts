import { parseTemplateFromBuffer, type TemplateBrandKit, type ParsedTemplate, type TemplateSlideLayout } from "./template-parser.service";

const templates = new Map<string, ParsedTemplate>();

let activeTemplateId: string | null = null;

const DEFAULT_KORN_FERRY_BRAND_KIT: TemplateBrandKit = {
  colors: {
    dk1: "00173B",
    lt1: "FFFFFF",
    dk2: "44546A",
    lt2: "E7E6E6",
    accent1: "005971",
    accent2: "009B77",
    accent3: "929192",
    accent4: "05C690",
    accent5: "00ADBB",
    accent6: "8DC63F",
    hlink: "0563C1",
    folHlink: "A3238E",
  },
  fonts: {
    major: "Arial",
    minor: "Arial",
  },
  slideWidth: 13.333,
  slideHeight: 7.5,
  layouts: [
    {
      name: "Title Slide",
      type: "title",
      placeholders: [
        { type: "ctrTitle", name: "Title", x: 0.8, y: 2.0, w: 11.7, h: 1.5 },
        { type: "subTitle", name: "Subtitle", x: 0.8, y: 3.6, w: 11.7, h: 0.8 },
      ],
      decorativeShapes: [],
    },
    {
      name: "Title and Content",
      type: "content",
      placeholders: [
        { type: "title", name: "Title", x: 0.8, y: 0.4, w: 11.7, h: 0.8 },
        { type: "body", name: "Content", x: 0.8, y: 1.4, w: 11.7, h: 5.4 },
      ],
      decorativeShapes: [],
    },
    {
      name: "Two Content",
      type: "two_column",
      placeholders: [
        { type: "title", name: "Title", x: 0.8, y: 0.4, w: 11.7, h: 0.8 },
        { type: "body", idx: "1", name: "Left Content", x: 0.8, y: 1.4, w: 5.6, h: 5.4 },
        { type: "body", idx: "2", name: "Right Content", x: 6.6, y: 1.4, w: 5.6, h: 5.4 },
      ],
      decorativeShapes: [],
    },
    {
      name: "Section Header",
      type: "section_divider",
      placeholders: [
        { type: "title", name: "Section Title", x: 0.8, y: 2.5, w: 11.7, h: 1.0 },
        { type: "body", name: "Description", x: 0.8, y: 3.6, w: 11.7, h: 0.8 },
      ],
      decorativeShapes: [],
    },
    {
      name: "Blank",
      type: "blank",
      placeholders: [],
      decorativeShapes: [],
    },
  ],
  masterDecorativeShapes: [],
  sampleSlideCount: 0,
};

function initializeDefaults() {
  const defaultTemplate: ParsedTemplate = {
    id: "default",
    name: "Korn Ferry Standard",
    uploadedAt: new Date().toISOString(),
    brandKit: DEFAULT_KORN_FERRY_BRAND_KIT,
  };
  templates.set("default", defaultTemplate);
  activeTemplateId = "default";
}

initializeDefaults();

export async function uploadTemplate(fileName: string, fileBuffer: Buffer): Promise<ParsedTemplate> {
  const id = `template_${Date.now()}`;
  const brandKit = await parseTemplateFromBuffer(fileBuffer, fileName);

  const cleanName = fileName
    .replace(/\.pptx$/i, "")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const parsed: ParsedTemplate = {
    id,
    name: cleanName,
    uploadedAt: new Date().toISOString(),
    brandKit,
  };

  templates.set(id, parsed);
  activeTemplateId = id;

  return parsed;
}

export function getTemplates(): ParsedTemplate[] {
  return Array.from(templates.values()).map(t => ({
    ...t,
    rawFileBase64: undefined,
  }));
}

export function getTemplate(id: string): ParsedTemplate | undefined {
  return templates.get(id);
}

export function getActiveTemplate(): ParsedTemplate | undefined {
  if (!activeTemplateId) return templates.get("default");
  return templates.get(activeTemplateId) || templates.get("default");
}

export function setActiveTemplate(id: string): boolean {
  if (!templates.has(id)) return false;
  activeTemplateId = id;
  return true;
}

export function deleteTemplate(id: string): boolean {
  if (id === "default") return false;
  templates.delete(id);
  if (activeTemplateId === id) {
    activeTemplateId = "default";
  }
  return true;
}

export function getActiveBrandKit(): TemplateBrandKit {
  const active = getActiveTemplate();
  return active?.brandKit || DEFAULT_KORN_FERRY_BRAND_KIT;
}

export function mapBrandKitToExportColors(brandKit: TemplateBrandKit): {
  navy: string;
  forestGreen: string;
  oceanBlue: string;
  emerald: string;
  mint: string;
  lime: string;
  cyan: string;
  purple: string;
  gray: string;
  white: string;
  lightGray: string;
  titleBg: string;
  headerFont: string;
  bodyFont: string;
  slideWidth: number;
  slideHeight: number;
} {
  return {
    navy: brandKit.colors.dk1,
    forestGreen: brandKit.colors.accent2,
    oceanBlue: brandKit.colors.accent1,
    emerald: brandKit.colors.accent2,
    mint: brandKit.colors.accent4,
    lime: brandKit.colors.accent6,
    cyan: brandKit.colors.accent5,
    purple: brandKit.colors.folHlink,
    gray: brandKit.colors.accent3,
    white: brandKit.colors.lt1,
    lightGray: brandKit.colors.lt2,
    titleBg: brandKit.colors.dk1,
    headerFont: brandKit.fonts.major,
    bodyFont: brandKit.fonts.minor,
    slideWidth: brandKit.slideWidth,
    slideHeight: brandKit.slideHeight,
  };
}

export function getTemplateLayoutForSlideType(
  brandKit: TemplateBrandKit,
  slideType: string
): TemplateSlideLayout | undefined {
  const typeMap: Record<string, string> = {
    title: "title",
    section_divider: "section_divider",
    content: "content",
    kpi_scorecard: "content",
    chart: "content",
    timeline: "content",
    quote: "content",
    flow_diagram: "content",
    comparison: "two_column",
    summary: "content",
    image_feature: "content",
  };

  const layoutType = typeMap[slideType] || "content";
  const layout = brandKit.layouts.find(l => l.type === layoutType);
  if (!layout) return brandKit.layouts.find(l => l.type === "content");
  return layout;
}

export function isCustomBrandTemplate(templateId: string | undefined): boolean {
  return !!templateId && templateId !== "default";
}
