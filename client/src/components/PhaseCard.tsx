import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface PhaseCardProps {
  phaseNumber: number;
  title: string;
  description: string;
  icon: LucideIcon;
  outcomes: string[];
}

export default function PhaseCard({ phaseNumber, title, description, icon: Icon, outcomes }: PhaseCardProps) {
  return (
    <Card className="hover-elevate transition-all duration-200 h-full flex flex-col" data-testid={`card-phase-${phaseNumber}`}>
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="p-4 bg-primary/10 rounded-lg">
            <Icon className="w-12 h-12 text-primary" />
          </div>
          <Badge variant="secondary" className="text-lg font-bold px-3 py-1" data-testid={`badge-phase-number-${phaseNumber}`}>
            {phaseNumber}
          </Badge>
        </div>
        <div>
          <CardTitle className="text-2xl font-semibold mb-2">{title}</CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Expected Outcomes</p>
          <ul className="space-y-2">
            {outcomes.map((outcome, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-1">•</span>
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
