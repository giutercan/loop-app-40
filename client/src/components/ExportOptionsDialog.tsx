import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileText, Presentation, Building2, Users, MessageSquare, FileCheck } from "lucide-react";
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
    label: "Theme",
    description: "Discovery theme and focus area",
    icon: FileCheck,
    color: "text-purple-500",
  },
  {
    key: "includeIntelligence" as keyof ExportOptions,
    label: "Intelligence",
    description: "Company research, insights, annual report, earnings call",
    icon: Building2,
    color: "text-blue-500",
  },
  {
    key: "includeClientInteraction" as keyof ExportOptions,
    label: "Client Interaction",
    description: "Meeting attendees, Green Sheet / call planner",
    icon: Users,
    color: "text-teal-500",
  },
  {
    key: "includeSummary" as keyof ExportOptions,
    label: "Summary",
    description: "Discovery questions, Story coaching framework",
    icon: MessageSquare,
    color: "text-amber-500",
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
      <DialogContent className="sm:max-w-md" data-testid="dialog-export-options">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Export Discovery Report
          </DialogTitle>
          <DialogDescription>
            {companyName ? `Export report for ${companyName}` : "Choose what to include in your report"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b">
            <span className="text-sm font-medium text-muted-foreground">Select sections to export</span>
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
              return (
                <div
                  key={section.key}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30 hover-elevate cursor-pointer"
                  onClick={() => toggleOption(section.key)}
                  data-testid={`section-${section.key}`}
                >
                  <Checkbox
                    id={section.key}
                    checked={options[section.key]}
                    onCheckedChange={() => toggleOption(section.key)}
                    className="mt-0.5"
                    data-testid={`checkbox-${section.key}`}
                  />
                  <div className="flex-1 min-w-0">
                    <Label
                      htmlFor={section.key}
                      className="flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <Icon className={`w-4 h-4 ${section.color}`} />
                      {section.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {section.description}
                    </p>
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

        <DialogFooter className="flex-col sm:flex-row gap-2">
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
            className="gap-2"
            data-testid="button-export-pdf"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </Button>
          <Button
            onClick={() => handleExport("ppt")}
            disabled={noneSelected}
            className="gap-2"
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
