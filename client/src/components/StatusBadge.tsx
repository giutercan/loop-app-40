import { Badge } from "@/components/ui/badge";
import { FileEdit, Lock, Clock } from "lucide-react";

type Status = "draft" | "locked" | "pending";

interface StatusBadgeProps {
  status: Status;
}

const statusConfig = {
  draft: {
    icon: FileEdit,
    label: "DRAFT",
    className: "bg-amber-500 hover:bg-amber-600 text-white border-amber-600"
  },
  locked: {
    icon: Lock,
    label: "LOCKED",
    className: "bg-green-600 hover:bg-green-700 text-white border-green-700"
  },
  pending: {
    icon: Clock,
    label: "PENDING REVIEW",
    className: "bg-blue-600 hover:bg-blue-700 text-white border-blue-700"
  }
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} gap-1.5 text-xs font-bold px-3 py-1`} data-testid={`badge-status-${status}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </Badge>
  );
}
