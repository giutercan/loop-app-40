import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, TrendingUp, Calendar, Target } from "lucide-react";
import type { ValueHypothesis } from "@shared/schema";
import { formatCurrency } from "@shared/valueCalculations";

interface ValueHypothesisCardProps {
  hypothesis: ValueHypothesis;
  onEdit: (hypothesis: ValueHypothesis) => void;
}

const SOLUTION_COLORS: Record<string, string> = {
  ASSESS: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  DEVELOP: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  TRANSFORM: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
  REWARD: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  COMMERCIAL: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  ANALYTICS: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  sent: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
};

export default function ValueHypothesisCard({ hypothesis, onEdit }: ValueHypothesisCardProps) {
  const results = hypothesis.calculationResults as any;
  
  return (
    <Card className="hover-elevate" data-testid={`card-hypothesis-${hypothesis.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={SOLUTION_COLORS[hypothesis.solutionArea || "ASSESS"]}>
                {hypothesis.solutionArea}
              </Badge>
              <Badge className={STATUS_COLORS[hypothesis.status]}>
                {hypothesis.status.charAt(0).toUpperCase() + hypothesis.status.slice(1)}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold mb-1">{hypothesis.title}</h3>
            <p className="text-sm text-muted-foreground">{hypothesis.capabilityName}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(hypothesis)}
            data-testid={`button-edit-hypothesis-${hypothesis.id}`}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {results && (
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Year 1 Value</span>
              </div>
              <p className="text-xl font-bold">
                {formatCurrency(results.year1Value)}
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                <span>Total NPV</span>
              </div>
              <p className="text-xl font-bold">
                {formatCurrency(results.totalNPV)}
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Payback</span>
              </div>
              <p className="text-xl font-bold">
                {results.paybackMonths === Infinity ? "N/A" : `${results.paybackMonths} months`}
              </p>
            </div>
          </div>
        )}
        
        {hypothesis.rationale && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">{hypothesis.rationale}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
