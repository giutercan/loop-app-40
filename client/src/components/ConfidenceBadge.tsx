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
    className: "bg-green-600 hover:bg-green-700 text-white border-green-700"
  },
  medium: {
    icon: AlertCircle,
    label: "Medium Confidence",
    variant: "secondary" as const,
    className: "bg-amber-500 hover:bg-amber-600 text-white border-amber-600"
  },
  low: {
    icon: XCircle,
    label: "Low Confidence",
    variant: "destructive" as const,
    className: "bg-red-600 hover:bg-red-700 text-white border-red-700"
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
