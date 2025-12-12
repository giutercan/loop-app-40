import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, Presentation, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportButtonProps {
  onExportPPT: () => void;
  onExportPDF: () => void;
  label?: string;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ExportButton({
  onExportPPT,
  onExportPDF,
  label = "Export",
  disabled = false,
  variant = "outline",
  size = "default",
}: ExportButtonProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<"ppt" | "pdf" | null>(null);

  const handleExport = async (type: "ppt" | "pdf") => {
    setIsExporting(true);
    setExportType(type);

    try {
      if (type === "ppt") {
        await onExportPPT();
        toast({
          title: "PowerPoint Generated",
          description: "Your presentation has been downloaded.",
        });
      } else {
        await onExportPDF();
        toast({
          title: "PDF Generated",
          description: "Your document has been downloaded.",
        });
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "There was an error generating your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || isExporting}
          data-testid="button-export-dropdown"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleExport("ppt")}
          disabled={isExporting}
          data-testid="menu-item-export-ppt"
        >
          <Presentation className="w-4 h-4 mr-2 text-orange-500" />
          <span>PowerPoint (.pptx)</span>
          {exportType === "ppt" && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("pdf")}
          disabled={isExporting}
          data-testid="menu-item-export-pdf"
        >
          <FileText className="w-4 h-4 mr-2 text-red-500" />
          <span>PDF Document (.pdf)</span>
          {exportType === "pdf" && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
