import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  ChevronDown, 
  Sparkles, 
  Loader2,
  ArrowRight,
  Award
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import KPIRecommendationDialog from "@/components/KPIRecommendationDialog";

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
}

interface FinalizedJobsResponse {
  finalized: boolean;
  jobs: Job[];
  transferredAt: string | null;
}

export function AlignmentInteractive({ projectId }: AlignmentInteractiveProps) {
  const { toast } = useToast();
  
  // Fetch finalized jobs data
  const { data: finalizedData, isLoading } = useQuery<FinalizedJobsResponse>({
    queryKey: [`/api/projects/${projectId}/alignment/finalized-jobs`],
    enabled: !!projectId,
  });
  
  const jobs = finalizedData?.jobs || [];

  const updateKPIMutation = useMutation({
    mutationFn: async ({ kpiId, data }: { kpiId: number; data: Partial<KPI> }) => {
      const res = await apiRequest("PATCH", `/api/job-theme-kpis/${kpiId}`, data);
      if (!res.ok) throw new Error("Failed to update KPI");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/alignment/finalized-jobs`], refetchType: "all" });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">Loading finalized jobs...</p>
      </div>
    );
  }
  
  // Show empty state if not finalized
  if (!finalizedData?.finalized || jobs.length === 0) {
    return (
      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="text-center">No Finalized Discovery Data</CardTitle>
          <CardDescription className="text-center">
            Complete and finalize the Discovery phase to see job themes and KPIs here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

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
                  Define baseline → target to quantify transformation value
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

      {/* Job Cards with Comprehensive Table */}
      {jobs.map((job, idx) => {
        const selectedKPIs = job.kpis.filter(kpi => kpi.isSelected);
        
        return (
          <JobCard
            key={job.id}
            job={job}
            jobIndex={idx}
            selectedKPIs={selectedKPIs}
            projectId={projectId}
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
  projectId: number;
  updateKPIMutation: any;
}

function JobCard({ job, jobIndex, selectedKPIs, projectId, updateKPIMutation }: JobCardProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(jobIndex === 0);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  // Calculate completion stats
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
        className="hover-elevate active-elevate-2 rounded-t-md cursor-pointer"
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
          
          {/* Actions and Stats */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowRecommendations(true);
              }}
              className="gap-2"
              data-testid={`button-recommend-kpis-${job.id}`}
            >
              <Sparkles className="h-4 w-4" />
              Suggest KPIs
            </Button>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {completedKPIs}/{selectedKPIs.length}
              </div>
              <div className="text-xs text-muted-foreground">KPIs Ready</div>
            </div>
          </div>
        </div>
        
        <KPIRecommendationDialog
          jobThemeId={job.id}
          jobName={job.jobName}
          projectId={projectId}
          open={showRecommendations}
          onOpenChange={setShowRecommendations}
        />
      </CardHeader>

      {/* Expandable Content - Comprehensive Table */}
      {isExpanded && (
        <CardContent className="pt-6">
          {selectedKPIs.length > 0 ? (
            <ComprehensiveKPITable 
              kpis={selectedKPIs} 
              updateKPIMutation={updateKPIMutation} 
            />
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

interface ComprehensiveKPITableProps {
  kpis: KPI[];
  updateKPIMutation: any;
}

function ComprehensiveKPITable({ kpis, updateKPIMutation }: ComprehensiveKPITableProps) {
  return (
    <div className="overflow-x-auto -mx-6">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-primary/20 bg-muted/30">
            <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              KPI Metric
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Current (Baseline)
            </th>
            <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <ArrowRight className="w-4 h-4 mx-auto" />
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Target (Desired)
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Gap & Benefit
            </th>
          </tr>
        </thead>
        <tbody>
          {kpis.map((kpi, index) => (
            <ComprehensiveKPIRow 
              key={kpi.id} 
              kpi={kpi} 
              index={index}
              updateKPIMutation={updateKPIMutation} 
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface ComprehensiveKPIRowProps {
  kpi: KPI;
  index: number;
  updateKPIMutation: any;
}

function ComprehensiveKPIRow({ kpi, index, updateKPIMutation }: ComprehensiveKPIRowProps) {
  const { toast } = useToast();
  const [isGeneratingBenchmark, setIsGeneratingBenchmark] = useState(false);
  
  // Local state for immediate updates before server sync
  const [localBaselineValue, setLocalBaselineValue] = useState(kpi.baselineValue || "");
  const [localTargetValue, setLocalTargetValue] = useState(kpi.targetValue || "");
  const [localTargetSource, setLocalTargetSource] = useState(kpi.targetSource || "");
  
  // Sync local state with server data when props change
  useEffect(() => {
    setLocalBaselineValue(kpi.baselineValue || "");
  }, [kpi.baselineValue]);
  
  useEffect(() => {
    setLocalTargetValue(kpi.targetValue || "");
  }, [kpi.targetValue]);
  
  useEffect(() => {
    setLocalTargetSource(kpi.targetSource || "");
  }, [kpi.targetSource]);
  
  const baselineNum = parseFloat(localBaselineValue || "0");
  const targetNum = parseFloat(localTargetValue || "0");
  const hasValues = localBaselineValue && localTargetValue;
  
  // Calculate gap and improvement
  const gap = hasValues ? Math.abs(targetNum - baselineNum) : 0;
  const improvement = hasValues && baselineNum > 0 
    ? ((targetNum - baselineNum) / baselineNum * 100)
    : 0;
  const isImproving = improvement > 0;

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
      setLocalBaselineValue(data.benchmarkValue);
      updateKPIMutation.mutate({
        kpiId: kpi.id,
        data: {
          baselineValue: data.benchmarkValue,
          baselineSource: `AI: ${data.source}`
        }
      });
      
      toast({
        title: "AI Benchmark Generated",
        description: data.rationale,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Could not generate benchmark",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingBenchmark(false);
    }
  };

  return (
    <tr 
      className={`border-b border-muted ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
      data-testid={`kpi-row-${kpi.id}`}
    >
      {/* KPI Name Column */}
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm" data-testid={`text-kpi-name-${kpi.id}`}>
              {kpi.kpiName}
            </span>
            <Badge variant={kpi.kpiType === "primary" ? "default" : "secondary"} className="text-xs">
              {kpi.kpiType}
            </Badge>
          </div>
          {kpi.definition && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {kpi.definition}
            </p>
          )}
          {kpi.benchmarkValue && (
            <div className="flex items-center gap-1 text-xs text-primary mt-1">
              <Award className="w-3 h-3" />
              <span>KF Benchmark: {kpi.benchmarkValue} {kpi.unit}</span>
            </div>
          )}
        </div>
      </td>

      {/* Current/Baseline Column */}
      <td className="px-4 py-4">
        <div className="space-y-2 min-w-[180px]">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder={`Enter ${kpi.unit}`}
              value={localBaselineValue}
              onChange={(e) => {
                setLocalBaselineValue(e.target.value);
              }}
              onBlur={(e) => {
                if (e.target.value !== kpi.baselineValue) {
                  updateKPIMutation.mutate({
                    kpiId: kpi.id,
                    data: { baselineValue: e.target.value }
                  });
                }
              }}
              className="text-sm font-semibold"
              data-testid={`input-baseline-${kpi.id}`}
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">{kpi.unit}</span>
          </div>
          <Button
            onClick={generateAIBenchmark}
            disabled={isGeneratingBenchmark}
            variant="ghost"
            size="sm"
            className="w-full h-7 text-xs gap-1"
            data-testid={`button-generate-benchmark-${kpi.id}`}
          >
            {isGeneratingBenchmark ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            {isGeneratingBenchmark ? "Generating..." : "AI Suggest"}
          </Button>
        </div>
      </td>

      {/* Arrow Column */}
      <td className="px-4 py-4">
        <div className="flex justify-center">
          <div className={`rounded-full p-2 ${hasValues ? 'bg-primary/10' : 'bg-muted/30'}`}>
            <ArrowRight className={`w-4 h-4 ${hasValues ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
        </div>
      </td>

      {/* Target Column */}
      <td className="px-4 py-4">
        <div className="space-y-2 min-w-[180px]">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder={`Target ${kpi.unit}`}
              value={localTargetValue}
              onChange={(e) => {
                setLocalTargetValue(e.target.value);
              }}
              onBlur={(e) => {
                if (e.target.value !== kpi.targetValue) {
                  updateKPIMutation.mutate({
                    kpiId: kpi.id,
                    data: { targetValue: e.target.value }
                  });
                }
              }}
              className="text-sm font-semibold"
              data-testid={`input-target-${kpi.id}`}
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">{kpi.unit}</span>
          </div>
          <Input
            type="text"
            placeholder="Rationale..."
            value={localTargetSource}
            onChange={(e) => {
              setLocalTargetSource(e.target.value);
            }}
            onBlur={(e) => {
              if (e.target.value !== kpi.targetSource) {
                updateKPIMutation.mutate({
                  kpiId: kpi.id,
                  data: { targetSource: e.target.value }
                });
              }
            }}
            className="text-xs h-7"
            data-testid={`input-target-source-${kpi.id}`}
          />
        </div>
      </td>

      {/* Gap & Benefit Column */}
      <td className="px-6 py-4">
        {hasValues ? (
          <div className="space-y-2">
            {/* Gap Value */}
            <div className="flex items-center gap-2">
              <div className={`rounded-md px-3 py-1.5 ${isImproving ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
                <div className="text-sm font-bold flex items-center gap-1">
                  {isImproving ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-orange-600" />
                  )}
                  <span className={isImproving ? 'text-emerald-700 dark:text-emerald-400' : 'text-orange-700 dark:text-orange-400'}>
                    {gap.toFixed(1)} {kpi.unit}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  gap to close
                </div>
              </div>
            </div>

            {/* Improvement Percentage */}
            <div className={`rounded-md px-3 py-1.5 ${isImproving ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'}`}>
              <div className="text-lg font-bold">
                {isImproving ? '+' : ''}{improvement.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                improvement if achieved
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
              <div 
                className={`absolute top-0 left-0 h-full rounded-full ${
                  isImproving ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-orange-500 to-orange-400'
                }`}
                style={{ 
                  width: `${Math.min(100, Math.abs(improvement))}%` 
                }}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground italic">
              Enter baseline & target<br/>to see benefit
            </p>
          </div>
        )}
      </td>
    </tr>
  );
}
