import JSZip from "jszip";

export interface TemplatePlaceholder {
  type: string;
  idx?: string;
  name?: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TemplateSlideLayout {
  name: string;
  type: string;
  placeholders: TemplatePlaceholder[];
}

export interface TemplateBrandKit {
  colors: {
    dk1: string;
    lt1: string;
    dk2: string;
    lt2: string;
    accent1: string;
    accent2: string;
    accent3: string;
    accent4: string;
    accent5: string;
    accent6: string;
    hlink: string;
    folHlink: string;
  };
  fonts: {
    major: string;
    minor: string;
  };
  slideWidth: number;
  slideHeight: number;
  layouts: TemplateSlideLayout[];
  masterBackgroundColor?: string;
  sampleSlideCount: number;
}

export interface ParsedTemplate {
  id: string;
  name: string;
  uploadedAt: string;
  brandKit: TemplateBrandKit;
  rawFileBase64?: string;
}

function emuToInches(emu: number): number {
  return Math.round((emu / 914400) * 1000) / 1000;
}

function parseHexFromXml(colorStr: string): string {
  if (!colorStr) return "000000";
  return colorStr.replace(/^#/, "").toUpperCase();
}

function extractColorFromElement(xml: string, tagPattern: string): string {
  const regex = new RegExp(`<${tagPattern}[^>]*>([\\s\\S]*?)</${tagPattern.split(" ")[0]}>`, "i");
  const match = xml.match(regex);
  if (!match) return "";

  const srgbMatch = match[1].match(/a:srgbClr\s+val="([A-Fa-f0-9]{6})"/i);
  if (srgbMatch) return srgbMatch[1].toUpperCase();

  const sysMatch = match[1].match(/a:sysClr[^>]*lastClr="([A-Fa-f0-9]{6})"/i);
  if (sysMatch) return sysMatch[1].toUpperCase();

  return "";
}

function extractThemeColors(themeXml: string): TemplateBrandKit["colors"] {
  const defaults: TemplateBrandKit["colors"] = {
    dk1: "000000", lt1: "FFFFFF", dk2: "44546A", lt2: "E7E6E6",
    accent1: "4472C4", accent2: "ED7D31", accent3: "A5A5A5",
    accent4: "FFC000", accent5: "5B9BD5", accent6: "70AD47",
    hlink: "0563C1", folHlink: "954F72",
  };

  const colorNames = ["dk1", "lt1", "dk2", "lt2", "accent1", "accent2", "accent3", "accent4", "accent5", "accent6", "hlink", "folHlink"];

  for (const name of colorNames) {
    const color = extractColorFromElement(themeXml, `a:${name}`);
    if (color) {
      (defaults as any)[name] = color;
    }
  }

  return defaults;
}

function extractThemeFonts(themeXml: string): TemplateBrandKit["fonts"] {
  const fonts = { major: "Arial", minor: "Arial" };

  const majorMatch = themeXml.match(/a:majorFont[\s\S]*?a:latin\s+typeface="([^"]+)"/i);
  if (majorMatch) fonts.major = majorMatch[1];

  const minorMatch = themeXml.match(/a:minorFont[\s\S]*?a:latin\s+typeface="([^"]+)"/i);
  if (minorMatch) fonts.minor = minorMatch[1];

  return fonts;
}

function extractSlideSize(presentationXml: string): { width: number; height: number } {
  const match = presentationXml.match(/p:sldSz\s+cx="(\d+)"\s+cy="(\d+)"/i);
  if (match) {
    return { width: emuToInches(parseInt(match[1])), height: emuToInches(parseInt(match[2])) };
  }
  return { width: 13.333, height: 7.5 };
}

function extractPlaceholders(layoutXml: string): TemplatePlaceholder[] {
  const placeholders: TemplatePlaceholder[] = [];

  const spRegex = /<p:sp\b[\s\S]*?<\/p:sp>/gi;
  let spMatch;
  while ((spMatch = spRegex.exec(layoutXml)) !== null) {
    const spBlock = spMatch[0];

    const phMatch = spBlock.match(/<p:ph\s+([^/]*?)\/>/i) || spBlock.match(/<p:ph\s+([^>]*?)>/i);
    if (!phMatch) continue;

    const phAttrs = phMatch[1];
    const typeMatch = phAttrs.match(/type="([^"]+)"/);
    const idxMatch = phAttrs.match(/idx="([^"]+)"/);

    const type = typeMatch ? typeMatch[1] : "body";
    const idx = idxMatch ? idxMatch[1] : undefined;

    let x = 0, y = 0, w = 0, h = 0;
    const offMatch = spBlock.match(/a:off\s+x="(\d+)"\s+y="(\d+)"/i);
    const extMatch = spBlock.match(/a:ext\s+cx="(\d+)"\s+cy="(\d+)"/i);

    if (offMatch) {
      x = emuToInches(parseInt(offMatch[1]));
      y = emuToInches(parseInt(offMatch[2]));
    }
    if (extMatch) {
      w = emuToInches(parseInt(extMatch[1]));
      h = emuToInches(parseInt(extMatch[2]));
    }

    let name = "";
    const nvSpPrMatch = spBlock.match(/<p:nvSpPr>[\s\S]*?<p:cNvPr[^>]*name="([^"]*)"[^>]*>/i);
    if (nvSpPrMatch) name = nvSpPrMatch[1];

    placeholders.push({ type, idx, name, x, y, w, h });
  }

  return placeholders;
}

function extractLayoutName(layoutXml: string): string {
  const match = layoutXml.match(/<p:cSld\s+name="([^"]+)"/i);
  if (match) return match[1];

  const match2 = layoutXml.match(/p:cSld[\s\S]*?name="([^"]+)"/i);
  if (match2) return match2[1];

  return "Unknown Layout";
}

function classifyLayout(name: string, placeholders: TemplatePlaceholder[]): string {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("title") && (lowerName.includes("only") || placeholders.length <= 2)) return "title";
  if (lowerName.includes("title") && lowerName.includes("content")) return "content";
  if (lowerName.includes("two") || lowerName.includes("comparison")) return "two_column";
  if (lowerName.includes("section") || lowerName.includes("divider")) return "section_divider";
  if (lowerName.includes("blank")) return "blank";
  if (lowerName.includes("picture") || lowerName.includes("image")) return "image";
  if (placeholders.some(p => p.type === "title") && placeholders.some(p => p.type === "body")) return "content";
  if (placeholders.some(p => p.type === "ctrTitle")) return "title";
  return "content";
}

export async function parseTemplateFromBuffer(buffer: Buffer, fileName: string): Promise<TemplateBrandKit> {
  const zip = await JSZip.loadAsync(buffer);

  let colors: TemplateBrandKit["colors"] = {
    dk1: "000000", lt1: "FFFFFF", dk2: "44546A", lt2: "E7E6E6",
    accent1: "4472C4", accent2: "ED7D31", accent3: "A5A5A5",
    accent4: "FFC000", accent5: "5B9BD5", accent6: "70AD47",
    hlink: "0563C1", folHlink: "954F72",
  };
  let fonts: TemplateBrandKit["fonts"] = { major: "Arial", minor: "Arial" };

  const themeFile = zip.file(/ppt\/theme\/theme1\.xml/i)[0];
  if (themeFile) {
    const themeXml = await themeFile.async("string");
    colors = extractThemeColors(themeXml);
    fonts = extractThemeFonts(themeXml);
  }

  let slideWidth = 13.333;
  let slideHeight = 7.5;
  const presFile = zip.file("ppt/presentation.xml");
  if (presFile) {
    const presXml = await presFile.async("string");
    const size = extractSlideSize(presXml);
    slideWidth = size.width;
    slideHeight = size.height;
  }

  const layouts: TemplateSlideLayout[] = [];
  const layoutFiles = zip.file(/ppt\/slideLayouts\/slideLayout\d+\.xml/i);

  for (const layoutFile of layoutFiles) {
    const layoutXml = await layoutFile.async("string");
    const name = extractLayoutName(layoutXml);
    const placeholders = extractPlaceholders(layoutXml);
    const type = classifyLayout(name, placeholders);
    layouts.push({ name, type, placeholders });
  }

  layouts.sort((a, b) => {
    const order: Record<string, number> = { title: 0, content: 1, two_column: 2, section_divider: 3, image: 4, blank: 5 };
    return (order[a.type] ?? 99) - (order[b.type] ?? 99);
  });

  const slideFiles = zip.file(/ppt\/slides\/slide\d+\.xml/i);

  return {
    colors,
    fonts,
    slideWidth,
    slideHeight,
    layouts,
    sampleSlideCount: slideFiles.length,
  };
}
