/**
 * Loop Seller Companion — Office Script: create dated PRE/POST meeting-cycle tabs.
 *
 * Power Automate equivalent of the bundled `create_meeting_cycle.py`.
 * Run it from Power Automate with the Excel Online (Business) "Run script"
 * action against a CSWP workbook stored in OneDrive/SharePoint. No Azure required.
 *
 * The flow passes a `CycleInput` JSON object; the script returns the names of
 * the tabs it created so the flow can reference them downstream.
 *
 * Requires the workbook to contain: "CSWP Index", "Template - PRE", "Template - POST".
 */

interface CycleInput {
  meetingDate: string;            // ISO date, e.g. "2026-06-23"
  phase: "pre" | "post" | "both"; // which tabs to create
  account?: string;
  owner?: string;
  attendees?: string;
}

interface CycleResult {
  created: string[];   // tab names created
  warnings: string[];  // e.g. tab already existed (never overwrite silently)
}

function tabName(date: string, phase: "pre" | "post"): string {
  const name = `CSWP ${date} ${phase.toUpperCase()}`;
  if (name.length > 31) {
    throw new Error(`Sheet name too long for Excel (max 31): ${name}`);
  }
  return name;
}

function nextIndexRow(idx: ExcelScript.Worksheet): number {
  // Index entries start at row 6 (1-based) -> row index 5 (0-based ranges).
  let row = 6;
  while (true) {
    const v = idx.getRange(`A${row}`).getValue();
    if (v === "" || v === null || v === undefined) { return row; }
    row++;
  }
}

function findRowByDate(idx: ExcelScript.Worksheet, date: string): number | null {
  let row = 6;
  while (true) {
    const v = idx.getRange(`A${row}`).getValue();
    if (v === "" || v === null || v === undefined) { return null; }
    if (String(v) === date) { return row; }
    row++;
  }
}

function addPhase(
  workbook: ExcelScript.Workbook,
  input: CycleInput,
  phase: "pre" | "post",
  result: CycleResult
): void {
  const templateName = phase === "pre" ? "Template - PRE" : "Template - POST";
  const template = workbook.getWorksheet(templateName);
  if (!template) { throw new Error(`Missing required sheet: ${templateName}`); }

  const newName = tabName(input.meetingDate, phase);
  if (workbook.getWorksheet(newName)) {
    // Never overwrite a prior dated tab silently — surface it instead.
    result.warnings.push(`Tab already exists, skipped: ${newName}`);
    return;
  }

  const sheet = template.copy(ExcelScript.WorksheetPositionType.end);
  sheet.setName(newName);
  sheet.setVisibility(ExcelScript.SheetVisibility.visible);

  // Header cells mirror create_meeting_cycle.py
  sheet.getRange("B5").setValue(input.meetingDate);
  if (input.owner)     { sheet.getRange("C5").setValue(input.owner); }
  if (input.attendees) { sheet.getRange("E5").setValue(input.attendees); }
  if (input.account)   { sheet.getRange("B7").setValue(input.account); }

  // Update the CSWP Index
  const idx = workbook.getWorksheet("CSWP Index");
  if (phase === "pre") {
    const r = nextIndexRow(idx);
    idx.getRange(`A${r}`).setValue(input.meetingDate);
    idx.getRange(`B${r}`).setValue(newName);
    idx.getRange(`C${r}`).setValue("draft");
    if (input.account) { idx.getRange(`L${r}`).setValue(input.account); }
  } else {
    let target = findRowByDate(idx, input.meetingDate);
    if (target === null) {
      target = nextIndexRow(idx);
      idx.getRange(`A${target}`).setValue(input.meetingDate);
    }
    idx.getRange(`D${target}`).setValue(newName);
    idx.getRange(`E${target}`).setValue("not started");
  }

  result.created.push(newName);
}

function main(workbook: ExcelScript.Workbook, input: CycleInput): CycleResult {
  const result: CycleResult = { created: [], warnings: [] };

  for (const required of ["CSWP Index", "Template - PRE", "Template - POST"]) {
    if (!workbook.getWorksheet(required)) {
      throw new Error(`Workbook is missing required sheet: ${required}`);
    }
  }

  if (input.phase === "pre" || input.phase === "both") { addPhase(workbook, input, "pre", result); }
  if (input.phase === "post" || input.phase === "both") { addPhase(workbook, input, "post", result); }

  return result;
}
