import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  FileText, 
  MessageSquare, 
  UserCheck,
  Bot
} from "lucide-react";

export type DataSource = 
  | "ai_generated" 
  | "ai_follow_up" 
  | "notes_enrichment" 
  | "client" 
  | "consultant"
  | "ai_research";

interface SourceAttributionBadgeProps {
  source: DataSource;
  respondentName?: string | null;
  compact?: boolean;
}

export function SourceAttributionBadge({ 
  source, 
  respondentName,
  compact = false 
}: SourceAttributionBadgeProps) {
  const getSourceInfo = (): { 
    icon: React.ReactNode; 
    label: string; 
    variant: "default" | "secondary" | "outline"; 
    className?: string;
  } => {
    switch (source) {
      case "ai_generated":
      case "ai_research":
        return {
          icon: <Bot className="w-3 h-3" />,
          label: compact ? "AI" : "AI Research",
          variant: "secondary",
          className: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
        };
      
      case "ai_follow_up":
        return {
          icon: <Sparkles className="w-3 h-3" />,
          label: compact ? "AI+" : "AI Follow-up",
          variant: "secondary",
          className: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
        };
      
      case "notes_enrichment":
        return {
          icon: <FileText className="w-3 h-3" />,
          label: compact ? "Notes" : "From Notes",
          variant: "secondary",
          className: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
        };
      
      case "client":
        return {
          icon: <UserCheck className="w-3 h-3" />,
          label: compact ? (respondentName || "Client") : `Client: ${respondentName || "Response"}`,
          variant: "default",
          className: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
        };
      
      case "consultant":
        return {
          icon: <MessageSquare className="w-3 h-3" />,
          label: compact ? (respondentName || "Consultant") : `Consultant: ${respondentName || "Input"}`,
          variant: "outline",
          className: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700"
        };
      
      default:
        return {
          icon: <FileText className="w-3 h-3" />,
          label: "Unknown",
          variant: "secondary",
          className: ""
        };
    }
  };

  const info = getSourceInfo();

  return (
    <Badge 
      variant={info.variant}
      className={`gap-1 text-xs ${info.className || ""}`}
      data-testid={`badge-source-${source}`}
    >
      {info.icon}
      <span>{info.label}</span>
    </Badge>
  );
}

// Helper to extract source from CompanyDataPoint provenance
export function getInsightSource(provenance: any): DataSource {
  if (!provenance) return "ai_generated";
  if (typeof provenance === "string") return provenance as DataSource;
  if (typeof provenance === "object" && provenance.type) {
    return provenance.type as DataSource;
  }
  return "ai_generated";
}
