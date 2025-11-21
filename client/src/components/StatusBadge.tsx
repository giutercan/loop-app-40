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
    className: "bg-[#8DC63F] hover:bg-[#8DC63F]/90 text-white border-[#8DC63F]"
  },
  locked: {
    icon: Lock,
    label: "LOCKED",
    className: "bg-[#05C690] hover:bg-[#009B77] text-white border-[#009B77]"
  },
  pending: {
    icon: Clock,
    label: "PENDING REVIEW",
    className: "bg-[#00ADBB] hover:bg-[#00ADBB]/90 text-white border-[#00ADBB]"
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
