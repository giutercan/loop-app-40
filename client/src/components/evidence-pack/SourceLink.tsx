import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Link2,
  Eye,
  Target,
  Lightbulb,
  TrendingUp,
  Award,
  Paperclip,
  ClipboardList,
  User,
  Sparkles
} from "lucide-react";
import type { EvidencePackItem } from "@shared/schema";

export const sourceTypeConfig: Record<string, { 
  label: string; 
  icon: typeof Link2; 
  getPath: (projectId: number, sourceId?: number | null, links?: any) => string | null 
}> = {
  kpi_commitment: {
    label: "KPI Commitment",
    icon: Target,
    getPath: (projectId, sourceId) => sourceId ? `/project/${projectId}/delivery?tab=kpis&commitmentId=${sourceId}` : null,
  },
  discovery_insight: {
    label: "Discovery Insight",
    icon: Lightbulb,
    getPath: (projectId) => `/project/${projectId}/sales?stage=discover`,
  },
  outcome: {
    label: "Outcome",
    icon: TrendingUp,
    getPath: (projectId) => `/project/${projectId}/sales?stage=design-outcomes`,
  },
  success_story: {
    label: "Success Story",
    icon: Award,
    getPath: (projectId) => `/project/${projectId}/delivery?tab=success`,
  },
  evidence_artefact: {
    label: "Artifact",
    icon: Paperclip,
    getPath: (projectId) => `/project/${projectId}/sales?stage=discover`,
  },
  bluesheet: {
    label: "Blue Sheet",
    icon: ClipboardList,
    getPath: (projectId) => `/project/${projectId}/blue-sheet`,
  },
  manual: {
    label: "Manual Entry",
    icon: User,
    getPath: () => null,
  },
  ai_generated: {
    label: "AI Generated",
    icon: Sparkles,
    getPath: () => null,
  },
};

export interface SourceLinkProps {
  item: EvidencePackItem;
  projectId: number;
  onNavigate?: () => void;
  onPreview?: (item: EvidencePackItem) => void;
}

export function SourceLink({ item, projectId, onNavigate, onPreview }: SourceLinkProps) {
  const [, setLocation] = useLocation();
  
  const sourceType = item.sourceType as string;
  const config = sourceTypeConfig[sourceType];
  
  if (!config) return null;
  
  const path = config.getPath(projectId, item.sourceId, item.links);
  const hasPreview = ["kpi_commitment", "discovery_insight", "bluesheet", "manual"].includes(sourceType);
  
  if (!path && !hasPreview) {
    return (
      <Badge 
        variant="outline" 
        className="text-xs gap-1 cursor-default"
        aria-label={`Source: ${config.label}`}
      >
        <config.icon className="w-3 h-3" aria-hidden="true" />
        {config.label}
      </Badge>
    );
  }
  
  const handleNavigate = () => {
    if (path) {
      onNavigate?.();
      setLocation(path);
    }
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview?.(item);
  };
  
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Source actions">
      {hasPreview && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              type="button"
              className="inline-flex"
              onClick={handlePreview}
              aria-label="Quick preview source"
              data-testid={`button-preview-${item.id}`}
            >
              <Badge 
                variant="outline" 
                className="text-xs gap-1 cursor-pointer hover-elevate"
              >
                <Eye className="w-3 h-3" aria-hidden="true" />
              </Badge>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Quick view source</p>
          </TooltipContent>
        </Tooltip>
      )}
      {path && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              type="button"
              className="inline-flex"
              onClick={handleNavigate}
              aria-label={`Navigate to ${config.label}`}
              data-testid={`link-source-${item.id}`}
            >
              <Badge 
                variant="outline" 
                className="text-xs gap-1 cursor-pointer hover-elevate"
              >
                <config.icon className="w-3 h-3" aria-hidden="true" />
                <Link2 className="w-3 h-3" aria-hidden="true" />
              </Badge>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Go to source: {config.label}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
