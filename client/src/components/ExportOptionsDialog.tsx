import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Presentation,
  Building2,
  Users,
  Target,
  Layers,
} from "lucide-react";
import type { ExportOptions } from "@/lib/exportService";

interface ExportOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: "ppt" | "pdf", options: ExportOptions) => void;
  companyName?: string;
}

const SECTION_CONFIG = [
  {
    key: "includeTheme" as keyof ExportOptions,
    label: "Strategic Theme",
    description: "Discovery theme, focus area & theme-specific KF opportunities",
    icon: Target,
    subsections: ["Theme Analysis", "KF Opportunity Signal", "Key Questions"],
  },
  {
    key: "includeIntelligence" as keyof ExportOptions,
    label: "Market Intelligence",
    description: "Comprehensive company research & competitive landscape",
    icon: Building2,
    subsections: [
      "Company Profile",
      "Strategic Insights",
      "Recent News",
      "Competitors",
      "Key Executives",
      "Annual Report",
      "Earnings Call",
    ],
  },
  {
    key: "includeClientInteraction" as keyof ExportOptions,
    label: "Client Interaction",
    description: "Meeting prep, stakeholders & strategic call planning",
    icon: Users,
    subsections: ["Meeting Attendees", "Green Sheet / Call Planner"],
  },
  {
    key: "includeSummary" as keyof ExportOptions,
    label: "Discovery & Analysis",
    description: "Full discovery findings, value cases & narrative work",
    icon: Layers,
    subsections: [
      "Discovery Questions",
      "Discovery Notes",
      "Value Cases",
      "Narrative Canvas",
      "Story Coaching",
      "Probe Research",
      "Project Notes",
      "Data Points",
    ],
  },
];

export function ExportOptionsDialog({
  open,
  onOpenChange,
  onExport,
  companyName,
}: ExportOptionsDialogProps) {
  const [options, setOptions] = useState<ExportOptions>({
    includeTheme: true,
    includeIntelligence: true,
    includeClientInteraction: true,
    includeSummary: true,
  });

  const allSelected = Object.values(options).every(Boolean);
  const noneSelected = Object.values(options).every((v) => !v);
  const selectedCount = Object.values(options).filter(Boolean).length;

  const toggleAll = () => {
    const newValue = !allSelected;
    setOptions({
      includeTheme: newValue,
      includeIntelligence: newValue,
      includeClientInteraction: newValue,
      includeSummary: newValue,
    });
  };

  const toggleOption = (key: keyof ExportOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExport = (format: "ppt" | "pdf") => {
    if (noneSelected) return;
    onExport(format, options);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden" data-testid="dialog-export-options">
        <div className="bg-[#00338D] px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-white text-lg font-bold tracking-wide flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0891B2]" />
                Export Discovery Report
              </DialogTitle>
              <DialogDescription className="text-white/70 mt-1 text-sm">
                {companyName ? `Comprehensive report for ${companyName}` : "Choose what to include in your report"}
              </DialogDescription>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[#FF6B35] font-bold text-xs tracking-widest">KORN FERRY</span>
              <div className="text-[#0891B2] text-[10px] tracking-wider mt-0.5">LOOP</div>
            </div>
          </div>
          <div className="h-[3px] bg-[#0891B2] mt-4 rounded-full" />
          <div className="h-[2px] bg-[#FF6B35] mt-1 rounded-full opacity-60" />
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              {selectedCount} of {SECTION_CONFIG.length} sections selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAll}
              className="text-xs"
              data-testid="button-toggle-all-sections"
            >
              {allSelected ? "Deselect All" : "Select All"}
            </Button>
          </div>

          <div className="space-y-3">
            {SECTION_CONFIG.map((section) => {
              const Icon = section.icon;
              const isChecked = options[section.key];
              return (
                <div
                  key={section.key}
                  className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                    isChecked
                      ? "border-[#00338D]/30 bg-[#00338D]/5 dark:bg-[#00338D]/10 dark:border-[#00338D]/40"
                      : "border-border bg-muted/20"
                  }`}
                  onClick={() => toggleOption(section.key)}
                  data-testid={`section-${section.key}`}
                >
                  <Checkbox
                    id={section.key}
                    checked={isChecked}
                    onCheckedChange={() => toggleOption(section.key)}
                    className="mt-0.5"
                    data-testid={`checkbox-${section.key}`}
                  />
                  <div className="flex-1 min-w-0">
                    <Label
                      htmlFor={section.key}
                      className="flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <Icon className={`w-4 h-4 ${isChecked ? "text-[#00338D] dark:text-[#0891B2]" : "text-muted-foreground"}`} />
                      {section.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {section.description}
                    </p>
                    {isChecked && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {section.subsections.map((sub) => (
                          <Badge
                            key={sub}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 h-5 font-normal"
                          >
                            {sub}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {noneSelected && (
            <p className="text-sm text-destructive text-center">
              Please select at least one section to export
            </p>
          )}
        </div>

        <DialogFooter className="px-6 py-4 bg-muted/30 border-t flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-export"
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("pdf")}
            disabled={noneSelected}
            className="gap-2 border-[#0891B2]/40 text-[#0891B2] hover:text-[#0891B2]"
            data-testid="button-export-pdf"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </Button>
          <Button
            onClick={() => handleExport("ppt")}
            disabled={noneSelected}
            className="gap-2 bg-[#00338D] hover:bg-[#00338D]/90 text-white"
            data-testid="button-export-ppt"
          >
            <Presentation className="w-4 h-4" />
            Export PPT
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
