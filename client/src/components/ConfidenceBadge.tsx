import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

type ConfidenceLevel = "high" | "medium" | "low";

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
}

const confidenceConfig = {
  high: {
    icon: CheckCircle2,
    label: "High Confidence",
    variant: "default" as const,
    className: "bg-[#05C690] hover:bg-[#009B77] text-white border-[#009B77]"
  },
  medium: {
    icon: AlertCircle,
    label: "Medium Confidence",
    variant: "secondary" as const,
    className: "bg-[#8DC63F] hover:bg-[#8DC63F]/90 text-white border-[#8DC63F]"
  },
  low: {
    icon: XCircle,
    label: "Low Confidence",
    variant: "destructive" as const,
    className: "bg-[#A3238E] hover:bg-[#A3238E]/90 text-white border-[#A3238E]"
  }
};

export default function ConfidenceBadge({ level }: ConfidenceBadgeProps) {
  const config = confidenceConfig[level];
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} gap-1 text-xs px-3 py-1`} data-testid={`badge-confidence-${level}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}
