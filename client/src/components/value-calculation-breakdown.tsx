import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Calculator,
  Info,
  FileText,
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  Database,
  Lightbulb,
} from "lucide-react";

interface CalculationInput {
  name: string;
  value: string | number;
  source: string;
  sourceType: "client_provided" | "benchmark" | "research" | "assumption" | "ai_calculated";
  confidence: "high" | "medium" | "low";
  notes?: string;
}

interface BenchmarkReference {
  name: string;
  value: string;
  source: string;
  year: string;
}

interface SensitivityRange {
  low: number;
  expected: number;
  high: number;
  methodology: string;
}

interface ValueCalculationBreakdown {
  formula: string;
  inputs: CalculationInput[];
  calculation: string;
  assumptions: string[];
  benchmarkReferences?: BenchmarkReference[];
  sensitivityRange?: SensitivityRange;
  lastUpdated: string;
  calculatedBy: "ai" | "consultant" | "client";
}

interface BaselineProvenance {
  source: string;
  date: string;
  methodology: string;
  confidence: "high" | "medium" | "low";
}

interface TargetProvenance {
  source: string;
  rationale: string;
  benchmarkComparison: string;
}

interface ValueCalculationBreakdownProps {
  value: number | string;
  unit?: string;
  breakdown?: ValueCalculationBreakdown;
  baselineValue?: string;
  baselineProvenance?: BaselineProvenance;
  targetValue?: string;
  targetProvenance?: TargetProvenance;
  valueCalculationNotes?: string;
  compact?: boolean;
}

const getSourceTypeIcon = (sourceType: CalculationInput["sourceType"]) => {
  switch (sourceType) {
    case "client_provided":
      return <Building2 className="w-3 h-3" />;
    case "benchmark":
      return <TrendingUp className="w-3 h-3" />;
    case "research":
      return <FileText className="w-3 h-3" />;
    case "assumption":
      return <AlertTriangle className="w-3 h-3" />;
    case "ai_calculated":
      return <Calculator className="w-3 h-3" />;
    default:
      return <Info className="w-3 h-3" />;
  }
};

const getSourceTypeBadge = (sourceType: CalculationInput["sourceType"]) => {
  const variants: Record<CalculationInput["sourceType"], string> = {
    client_provided: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    benchmark: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    research: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    assumption: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    ai_calculated: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  };
  const labels: Record<CalculationInput["sourceType"], string> = {
    client_provided: "Client Data",
    benchmark: "Benchmark",
    research: "Research",
    assumption: "Assumption",
    ai_calculated: "AI Calculated",
  };
  return (
    <Badge variant="outline" className={`text-xs ${variants[sourceType]}`}>
      {getSourceTypeIcon(sourceType)}
      <span className="ml-1">{labels[sourceType]}</span>
    </Badge>
  );
};

const getConfidenceBadge = (confidence: "high" | "medium" | "low") => {
  const styles = {
    high: "bg-emerald-500/10 text-emerald-600",
    medium: "bg-amber-500/10 text-amber-600",
    low: "bg-red-500/10 text-red-600",
  };
  return (
    <Badge variant="outline" className={`text-xs ${styles[confidence]}`}>
      {confidence === "high" && <CheckCircle2 className="w-3 h-3 mr-1" />}
      {confidence === "medium" && <AlertTriangle className="w-3 h-3 mr-1" />}
      {confidence === "low" && <HelpCircle className="w-3 h-3 mr-1" />}
      {confidence.charAt(0).toUpperCase() + confidence.slice(1)} Confidence
    </Badge>
  );
};

export function ValueCalculationBreakdown({
  value,
  unit = "$",
  breakdown,
  baselineValue,
  baselineProvenance,
  targetValue,
  targetProvenance,
  valueCalculationNotes,
  compact = false,
  commitmentId,
}: ValueCalculationBreakdownProps & { commitmentId?: number }) {
  const [isOpen, setIsOpen] = useState(false);

  const formattedValue = typeof value === "number" 
    ? unit === "$" 
      ? `$${(value / 1000000).toFixed(1)}M` 
      : `${value}${unit}`
    : value;

  const hasProvenance = breakdown || baselineProvenance || targetProvenance || valueCalculationNotes;
  const testId = commitmentId ? `button-value-breakdown-${commitmentId}` : "button-value-breakdown";

  if (!hasProvenance) {
    return <span data-testid={commitmentId ? `text-value-${commitmentId}` : "text-value"}>{formattedValue}</span>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 font-bold text-inherit cursor-pointer border-none bg-transparent p-0 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          data-testid={testId}
        >
          {formattedValue}
          <Info className="w-3 h-3 text-muted-foreground" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Value Calculation Breakdown
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {breakdown && (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Formula
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="block p-3 bg-muted rounded-md text-sm font-mono">
                    {breakdown.formula}
                  </code>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Calculation Inputs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {breakdown.inputs.map((input, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 bg-muted/50 rounded-lg border"
                      data-testid={`input-item-${idx}`}
                    >
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{input.name}</p>
                          <p className="text-lg font-bold text-primary">{input.value}</p>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          {getSourceTypeBadge(input.sourceType)}
                          {getConfidenceBadge(input.confidence)}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="w-3 h-3" />
                        <span>{input.source}</span>
                      </div>
                      {input.notes && (
                        <p className="mt-1 text-xs text-muted-foreground italic">
                          Note: {input.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Step-by-Step Calculation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-3 rounded-md font-mono">
                    {breakdown.calculation}
                  </pre>
                </CardContent>
              </Card>

              {breakdown.assumptions && breakdown.assumptions.length > 0 && (
                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="w-4 h-4" />
                      Key Assumptions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {breakdown.assumptions.map((assumption, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <ChevronRight className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span>{assumption}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {breakdown.benchmarkReferences && breakdown.benchmarkReferences.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Benchmark References
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {breakdown.benchmarkReferences.map((ref, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div>
                            <p className="text-sm font-medium">{ref.name}</p>
                            <p className="text-xs text-muted-foreground">{ref.source} ({ref.year})</p>
                          </div>
                          <Badge variant="secondary">{ref.value}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {breakdown.sensitivityRange && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Sensitivity Range
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Low</p>
                        <p className="font-medium text-red-600">
                          ${(breakdown.sensitivityRange.low / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      <div className="flex-1 h-2 bg-gradient-to-r from-red-200 via-emerald-200 to-red-200 rounded-full relative">
                        <div 
                          className="absolute w-3 h-3 bg-emerald-600 rounded-full top-1/2 -translate-y-1/2"
                          style={{ left: "50%" }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">High</p>
                        <p className="font-medium text-red-600">
                          ${(breakdown.sensitivityRange.high / 1000000).toFixed(1)}M
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-emerald-600">
                        Expected: ${(breakdown.sensitivityRange.expected / 1000000).toFixed(1)}M
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Methodology: {breakdown.sensitivityRange.methodology}
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {(baselineProvenance || targetProvenance) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Baseline & Target Provenance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {baselineProvenance && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Baseline: {baselineValue}
                    </p>
                    <div className="p-3 bg-muted rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          <FileText className="w-3 h-3 mr-1" />
                          {baselineProvenance.source}
                        </Badge>
                        {getConfidenceBadge(baselineProvenance.confidence)}
                      </div>
                      <p className="text-sm">{baselineProvenance.methodology}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Date: {new Date(baselineProvenance.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {targetProvenance && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Target: {targetValue}
                    </p>
                    <div className="p-3 bg-muted rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          <FileText className="w-3 h-3 mr-1" />
                          {targetProvenance.source}
                        </Badge>
                      </div>
                      <p className="text-sm">{targetProvenance.rationale}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Benchmark: {targetProvenance.benchmarkComparison}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {valueCalculationNotes && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Calculation Notes
              </p>
              <p className="text-sm">{valueCalculationNotes}</p>
            </div>
          )}

          {breakdown && (
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <span>
                Calculated by: {breakdown.calculatedBy === "ai" ? "AI Assistant" : breakdown.calculatedBy}
              </span>
              <span>
                Last updated: {new Date(breakdown.lastUpdated).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ValueWithProvenance({
  value,
  unit = "$",
  commitment,
  className = "",
}: {
  value: number | string;
  unit?: string;
  commitment?: any;
  className?: string;
}) {
  const formattedValue = typeof value === "number" 
    ? unit === "$" 
      ? `$${(value / 1000000).toFixed(1)}M` 
      : `${value}${unit}`
    : value;

  const commitmentId = commitment?.id;

  if (!commitment?.valueCalculationBreakdown && !commitment?.baselineProvenance && !commitment?.targetProvenance) {
    return (
      <span 
        className={className} 
        data-testid={commitmentId ? `text-value-simple-${commitmentId}` : "text-value-simple"}
      >
        {formattedValue}
      </span>
    );
  }

  return (
    <ValueCalculationBreakdown
      value={value}
      unit={unit}
      breakdown={commitment.valueCalculationBreakdown}
      baselineValue={commitment.baselineValue}
      baselineProvenance={commitment.baselineProvenance}
      targetValue={commitment.targetValue}
      targetProvenance={commitment.targetProvenance}
      valueCalculationNotes={commitment.valueCalculationNotes}
      commitmentId={commitmentId}
    />
  );
}
