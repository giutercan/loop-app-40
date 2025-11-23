import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Target, TrendingDown, ChevronDown, Sparkles, Briefcase, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface KPI {
  id: number;
  kpiName: string;
  kpiType: "primary" | "supporting";
  unit: string;
  definition: string | null;
  baselineValue: string | null;
  baselineSource: string | null;
  targetValue: string | null;
  targetSource: string | null;
  benchmarkValue: string | null;
  benchmarkSource: string | null;
  isSelected: boolean;
}

interface Job {
  id: number;
  jobName: string;
  capabilityName: string;
  solutionArea: string | null;
  aggregationSummary: string | null;
  evidenceCount: number;
  kpis: KPI[];
}

interface AlignmentInteractiveProps {
  projectId: number;
  jobs: Job[];
}

export function AlignmentInteractive({ projectId, jobs }: AlignmentInteractiveProps) {
  const { toast } = useToast();

  const updateKPIMutation = useMutation({
    mutationFn: async ({ kpiId, data }: { kpiId: number; data: Partial<KPI> }) => {
      const res = await apiRequest("PATCH", `/api/job-theme-kpis/${kpiId}`, data);
      if (!res.ok) throw new Error("Failed to update KPI");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/alignment/finalized-jobs`], refetchType: "active" });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header with Summary Stats */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <CardHeader>
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">Value Alignment</CardTitle>
                <CardDescription>
                  Define baseline and target values to quantify the transformation opportunity
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary" data-testid="stat-priority-jobs">{jobs.length}</div>
                <div className="text-xs text-muted-foreground uppercase">Priority Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600" data-testid="stat-kpis-tracked">
                  {jobs.reduce((sum, job) => sum + job.kpis.filter(k => k.isSelected).length, 0)}
                </div>
                <div className="text-xs text-muted-foreground uppercase">KPIs Tracked</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Job Cards */}
      {jobs.map((job, idx) => {
        const selectedKPIs = job.kpis.filter(kpi => kpi.isSelected);
        
        return (
          <JobCard
            key={job.id}
            job={job}
            jobIndex={idx}
            selectedKPIs={selectedKPIs}
            updateKPIMutation={updateKPIMutation}
          />
        );
      })}
    </div>
  );
}

interface JobCardProps {
  job: Job;
  jobIndex: number;
  selectedKPIs: KPI[];
  updateKPIMutation: any;
}

function JobCard({ job, jobIndex, selectedKPIs, updateKPIMutation }: JobCardProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(jobIndex === 0);
  
  // Calculate completion percentage
  const completedKPIs = selectedKPIs.filter(kpi => 
    kpi.baselineValue && kpi.targetValue
  ).length;
  const completionPercentage = selectedKPIs.length > 0 
    ? Math.round((completedKPIs / selectedKPIs.length) * 100) 
    : 0;

  return (
    <Card 
      className={`border-l-4 transition-all ${isExpanded ? 'border-l-primary shadow-md' : 'border-l-primary/30'}`}
    >
      {/* Clickable Header */}
      <CardHeader 
        className="cursor-pointer hover-elevate active-elevate-2 rounded-t-md"
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid={`header-job-${job.id}`}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Badge variant="default" className="text-lg px-3 py-1.5 shrink-0">
              #{jobIndex + 1}
            </Badge>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                <span className="truncate">{job.jobName}</span>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
              </CardTitle>
              <CardDescription className="mt-1">
                {job.capabilityName} {job.solutionArea && `• ${job.solutionArea}`}
              </CardDescription>
            </div>
          </div>
          
          {/* Progress Ring */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-sm font-semibold">
                {completedKPIs}/{selectedKPIs.length} KPIs
              </div>
              <div className="text-xs text-muted-foreground">Configured</div>
            </div>
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-muted/20"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - completionPercentage / 100)}`}
                  className={completionPercentage === 100 ? "text-emerald-600" : "text-primary"}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold">{completionPercentage}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Expandable Content */}
      {isExpanded && (
        <CardContent className="space-y-4 pt-6">
          {selectedKPIs.length > 0 ? (
            selectedKPIs.map(kpi => (
              <KPICard key={kpi.id} kpi={kpi} updateKPIMutation={updateKPIMutation} />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No KPIs selected for this job in Discovery phase</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

interface KPICardProps {
  kpi: KPI;
  updateKPIMutation: any;
}

function KPICard({ kpi, updateKPIMutation }: KPICardProps) {
  const { toast } = useToast();
  const [baselineMode, setBaselineMode] = useState<"client" | "industry">("client");
  const [isGeneratingBenchmark, setIsGeneratingBenchmark] = useState(false);
  
  const baselineNum = parseFloat(kpi.baselineValue || "0");
  const targetNum = parseFloat(kpi.targetValue || "0");
  const hasValues = kpi.baselineValue && kpi.targetValue;
  const improvement = hasValues && baselineNum > 0 
    ? ((targetNum - baselineNum) / baselineNum * 100).toFixed(1)
    : null;

  const generateAIBenchmark = async () => {
    setIsGeneratingBenchmark(true);
    try {
      const response = await fetch(`/api/job-theme-kpis/${kpi.id}/generate-benchmark`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate benchmark");
      }
      
      const data = await response.json();
      
      // Auto-fill the baseline with AI suggestion
      updateKPIMutation.mutate({
        kpiId: kpi.id,
        data: {
          baselineValue: data.benchmarkValue,
          baselineSource: `AI-generated: ${data.source}`
        }
      });
      
      toast({
        title: "AI Benchmark Generated",
        description: data.rationale,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Could not generate industry benchmark. Please enter manually.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingBenchmark(false);
    }
  };

  return (
    <div 
      className="border-2 rounded-lg p-6 space-y-4 bg-gradient-to-br from-card to-muted/10 hover-elevate"
      data-testid={`kpi-card-${kpi.id}`}
    >
      {/* KPI Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-lg" data-testid={`text-kpi-name-${kpi.id}`}>
              {kpi.kpiName}
            </h4>
            <Badge variant={kpi.kpiType === "primary" ? "default" : "secondary"} className="text-xs">
              {kpi.kpiType}
            </Badge>
            {hasValues && improvement && (
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  parseFloat(improvement) > 0 ? 'border-emerald-600 text-emerald-600' : 'border-orange-600 text-orange-600'
                }`}
              >
                {parseFloat(improvement) > 0 ? '↑' : '↓'} {Math.abs(parseFloat(improvement))}%
              </Badge>
            )}
          </div>
          {kpi.definition && (
            <p className="text-sm text-muted-foreground mt-2">{kpi.definition}</p>
          )}
        </div>
      </div>

      {/* Visual Progress Bar */}
      {hasValues && (() => {
        const range = Math.abs(targetNum - baselineNum);
        const isTargetHigher = targetNum > baselineNum;
        
        // Calculate actual proportions for visualization
        // Use zero as the minimum reference point
        const minValue = Math.min(0, baselineNum, targetNum);
        const maxValue = Math.max(baselineNum, targetNum);
        const totalRange = maxValue - minValue;
        
        // Calculate percentage positions (ensuring we have at least 5% width for visibility)
        let baselinePercent = totalRange > 0 
          ? Math.max(5, ((baselineNum - minValue) / totalRange * 100))
          : 50;
        let targetPercent = totalRange > 0
          ? Math.max(5, ((targetNum - minValue) / totalRange * 100))
          : 50;
        
        // Ensure baseline and target don't overlap (min 5% gap)
        if (Math.abs(targetPercent - baselinePercent) < 5) {
          if (isTargetHigher) {
            targetPercent = Math.min(100, baselinePercent + 5);
          } else {
            baselinePercent = Math.min(100, targetPercent + 5);
          }
        }
        
        const [leftPercent, rightPercent] = isTargetHigher 
          ? [baselinePercent, targetPercent]
          : [targetPercent, baselinePercent];
        
        const gapPercent = rightPercent - leftPercent;
        
        return (
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-xs font-medium mb-1 flex-wrap gap-2">
              <span className="text-orange-600">Baseline: {kpi.baselineValue} {kpi.unit}</span>
              <span className="text-emerald-600">Target: {kpi.targetValue} {kpi.unit}</span>
            </div>
            <div className="relative h-5 bg-muted/20 rounded-full overflow-hidden border border-muted">
              {/* Baseline marker (left) */}
              <div 
                className={`absolute top-0 h-full ${isTargetHigher ? 'bg-orange-500' : 'bg-emerald-500'} flex items-center ${isTargetHigher ? 'justify-start pl-2' : 'justify-end pr-2'}`}
                style={{ 
                  left: '0%', 
                  width: `${leftPercent}%`,
                  borderTopLeftRadius: '9999px',
                  borderBottomLeftRadius: '9999px',
                }}
              >
                {leftPercent > 12 && (
                  <span className="text-white text-[9px] font-bold">
                    {isTargetHigher ? 'NOW' : 'GOAL'}
                  </span>
                )}
              </div>
              {/* Gap/improvement zone */}
              <div 
                className={`absolute top-0 h-full ${
                  isTargetHigher 
                    ? 'bg-gradient-to-r from-orange-300/50 via-yellow-200/50 to-emerald-300/50'
                    : 'bg-gradient-to-r from-emerald-300/50 via-yellow-200/50 to-orange-300/50'
                }`}
                style={{ 
                  left: `${leftPercent}%`, 
                  width: `${gapPercent}%` 
                }}
              />
              {/* Target marker (right) */}
              <div 
                className={`absolute top-0 h-full ${isTargetHigher ? 'bg-emerald-500' : 'bg-orange-500'} flex items-center ${isTargetHigher ? 'justify-end pr-2' : 'justify-start pl-2'}`}
                style={{ 
                  right: '0%', 
                  width: `${100 - rightPercent}%`,
                  borderTopRightRadius: '9999px',
                  borderBottomRightRadius: '9999px',
                }}
              >
                {(100 - rightPercent) > 12 && (
                  <span className="text-white text-[9px] font-bold">
                    {isTargetHigher ? 'GOAL' : 'NOW'}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
              <span className="text-[10px]">{isTargetHigher ? 'Current' : 'Target'}</span>
              <span className="flex items-center gap-1">
                {isTargetHigher ? '→' : '←'} 
                <span className="font-semibold text-foreground text-xs">{range.toFixed(1)} {kpi.unit} gap</span>
              </span>
              <span className="text-[10px]">{isTargetHigher ? 'Target' : 'Current'}</span>
            </div>
          </div>
        );
      })()}

      {/* Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Baseline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                <TrendingDown className="w-4 h-4 text-orange-600" />
              </div>
              <Label htmlFor={`baseline-${kpi.id}`} className="font-semibold">
                Baseline (Current State)
              </Label>
            </div>
            
            {/* Toggle Switch */}
            <div className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5">
              <span className={`text-xs ${baselineMode === "client" ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                Client Data
              </span>
              <Switch
                checked={baselineMode === "industry"}
                onCheckedChange={(checked) => setBaselineMode(checked ? "industry" : "client")}
                data-testid={`switch-baseline-mode-${kpi.id}`}
              />
              <span className={`text-xs ${baselineMode === "industry" ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                Industry
              </span>
            </div>
          </div>
          
          {baselineMode === "industry" && (
            <Button
              onClick={generateAIBenchmark}
              disabled={isGeneratingBenchmark}
              variant="outline"
              size="sm"
              className="w-full border-primary/30 hover:bg-primary/10"
              data-testid={`button-generate-benchmark-${kpi.id}`}
            >
              {isGeneratingBenchmark ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating AI Benchmark...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Benchmark
                </>
              )}
            </Button>
          )}
          
          <Input
            id={`baseline-${kpi.id}`}
            type="text"
            placeholder={
              baselineMode === "industry" 
                ? "Click button above to generate AI benchmark"
                : kpi.benchmarkValue ? `Benchmark: ${kpi.benchmarkValue}` : `Enter current ${kpi.unit}`
            }
            value={kpi.baselineValue || ""}
            onChange={(e) => {
              updateKPIMutation.mutate({
                kpiId: kpi.id,
                data: { baselineValue: e.target.value }
              });
            }}
            className="text-lg font-semibold"
            data-testid={`input-baseline-${kpi.id}`}
            disabled={baselineMode === "industry" && !kpi.baselineValue}
          />
          <Input
            type="text"
            placeholder={baselineMode === "industry" ? "AI-generated source" : "Data source (e.g., HRIS, Client report)"}
            value={kpi.baselineSource || ""}
            onChange={(e) => {
              updateKPIMutation.mutate({
                kpiId: kpi.id,
                data: { baselineSource: e.target.value }
              });
            }}
            className="text-sm"
            data-testid={`input-baseline-source-${kpi.id}`}
          />
        </div>

        {/* Target */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
              <Target className="w-4 h-4 text-emerald-600" />
            </div>
            <Label htmlFor={`target-${kpi.id}`} className="font-semibold">
              Target (Desired Outcome)
            </Label>
          </div>
          <Input
            id={`target-${kpi.id}`}
            type="text"
            placeholder={`Enter target ${kpi.unit}`}
            value={kpi.targetValue || ""}
            onChange={(e) => {
              updateKPIMutation.mutate({
                kpiId: kpi.id,
                data: { targetValue: e.target.value }
              });
            }}
            className="text-lg font-semibold"
            data-testid={`input-target-${kpi.id}`}
          />
          <Input
            type="text"
            placeholder="Target rationale (e.g., Industry best practice)"
            value={kpi.targetSource || ""}
            onChange={(e) => {
              updateKPIMutation.mutate({
                kpiId: kpi.id,
                data: { targetSource: e.target.value }
              });
            }}
            className="text-sm"
            data-testid={`input-target-source-${kpi.id}`}
          />
        </div>
      </div>

      {/* Benchmark Callout */}
      {kpi.benchmarkValue && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Korn Ferry Benchmark Available</p>
            <p className="text-sm text-muted-foreground mt-1">
              {kpi.benchmarkValue} {kpi.unit} {kpi.benchmarkSource && `• ${kpi.benchmarkSource}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
