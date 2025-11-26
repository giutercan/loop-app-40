import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Target,
  Activity
} from "lucide-react";
import { format } from "date-fns";
import type { JobThemeKPI, KPIActual } from "@shared/schema";

interface KPITractionProps {
  projectId: number;
}

interface FinalizedJobsResponse {
  finalized: boolean;
  jobs: Array<{
    id: number;
    jobName: string;
    capabilityName: string;
    solutionArea: string;
    kpis: JobThemeKPI[];
  }>;
}

interface EnrichedKPI {
  kpi: JobThemeKPI;
  jobName: string;
  jobId: number;
  solutionArea: string;
  latestActual?: KPIActual;
  progress: number;
  variance: number;
  status: 'on-track' | 'at-risk' | 'off-track' | 'no-data';
  trend: 'improving' | 'declining' | 'stable';
}

export default function KPITraction({ projectId }: KPITractionProps) {
  const [expandedJobs, setExpandedJobs] = useState<Set<number>>(new Set([1]));

  const { data: finalizedJobsData, isLoading } = useQuery<FinalizedJobsResponse>({
    queryKey: [`/api/projects/${projectId}/alignment/finalized-jobs`],
    enabled: !!projectId,
  });

  const finalizedJobs = finalizedJobsData?.jobs || [];

  // Collect all selected KPIs
  const allKPIs: Array<{ kpi: JobThemeKPI; jobId: number; jobName: string; solutionArea: string }> = [];
  finalizedJobs.forEach((job) => {
    const kpiList = job.kpis || [];
    kpiList
      .filter((kpi: JobThemeKPI) => kpi.isSelected && kpi.baselineValue && kpi.targetValue)
      .forEach((kpi: JobThemeKPI) => {
        allKPIs.push({
          kpi,
          jobId: job.id,
          jobName: job.jobName,
          solutionArea: job.solutionArea,
        });
      });
  });

  // Fetch actuals for all KPIs
  const actualsQuery = useQuery({
    queryKey: [`/api/projects/${projectId}/all-kpi-actuals`],
    queryFn: async () => {
      const results = await Promise.all(
        allKPIs.map(async ({ kpi }) => {
          const res = await fetch(`/api/job-theme-kpis/${kpi.id}/actuals`);
          if (!res.ok) return { kpiId: kpi.id, actuals: [] };
          const data = await res.json();
          return { kpiId: kpi.id, actuals: data };
        })
      );
      return results;
    },
    enabled: allKPIs.length > 0,
  });

  const calculateMetrics = (kpi: JobThemeKPI, actuals: KPIActual[]): Omit<EnrichedKPI, 'kpi' | 'jobName' | 'jobId' | 'solutionArea'> => {
    if (actuals.length === 0) {
      return {
        latestActual: undefined,
        progress: 0,
        variance: 0,
        status: 'no-data',
        trend: 'stable',
      };
    }

    const baseline = parseFloat(kpi.baselineValue || '0');
    const target = parseFloat(kpi.targetValue || '0');
    const latestActual = actuals[0];
    const current = parseFloat(latestActual.actualValue);

    if (isNaN(baseline) || isNaN(target) || isNaN(current)) {
      return {
        latestActual,
        progress: 0,
        variance: 0,
        status: 'no-data',
        trend: 'stable',
      };
    }

    const totalDistance = Math.abs(target - baseline);
    const isIncreasingKPI = target > baseline;
    
    let completedDistance: number;
    if (isIncreasingKPI) {
      completedDistance = current - baseline;
    } else {
      completedDistance = baseline - current;
    }

    const progressRatio = totalDistance === 0 ? (current === target ? 1 : 0) : Math.max(0, Math.min(1, completedDistance / totalDistance));
    const progress = progressRatio * 100;

    // Variance: how far current is from target
    const variance = isIncreasingKPI ? current - target : target - current;

    // Status determination
    let status: 'on-track' | 'at-risk' | 'off-track' = 'off-track';
    if (progressRatio >= 0.85) status = 'on-track';
    else if (progressRatio >= 0.60) status = 'at-risk';

    // Trend calculation (comparing last two measurements)
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (actuals.length >= 2) {
      const previousValue = parseFloat(actuals[1].actualValue);
      if (isIncreasingKPI) {
        trend = current > previousValue ? 'improving' : current < previousValue ? 'declining' : 'stable';
      } else {
        trend = current < previousValue ? 'improving' : current > previousValue ? 'declining' : 'stable';
      }
    }

    return {
      latestActual,
      progress,
      variance,
      status,
      trend,
    };
  };

  // Enrich KPIs with metrics
  const enrichedKPIs: EnrichedKPI[] = allKPIs.map(({ kpi, jobId, jobName, solutionArea }) => {
    const actualsData = actualsQuery.data?.find(a => a.kpiId === kpi.id);
    const actuals = actualsData?.actuals || [];
    const metrics = calculateMetrics(kpi, actuals);
    
    return {
      kpi,
      jobId,
      jobName,
      solutionArea,
      ...metrics,
    };
  });

  // Group by job
  const kpisByJob = enrichedKPIs.reduce((acc, enrichedKPI) => {
    if (!acc[enrichedKPI.jobId]) {
      acc[enrichedKPI.jobId] = {
        jobId: enrichedKPI.jobId,
        jobName: enrichedKPI.jobName,
        solutionArea: enrichedKPI.solutionArea,
        kpis: [],
      };
    }
    acc[enrichedKPI.jobId].kpis.push(enrichedKPI);
    return acc;
  }, {} as Record<number, { jobId: number; jobName: string; solutionArea: string; kpis: EnrichedKPI[] }>);

  const jobGroups = Object.values(kpisByJob);

  const toggleJob = (jobId: number) => {
    const newExpanded = new Set(expandedJobs);
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId);
    } else {
      newExpanded.add(jobId);
    }
    setExpandedJobs(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'at-risk':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'off-track':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on-track':
        return <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">On Track</Badge>;
      case 'at-risk':
        return <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">At Risk</Badge>;
      case 'off-track':
        return <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">Off Track</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">No Data</Badge>;
    }
  };

  if (isLoading || actualsQuery.isLoading) {
    return (
      <div className="space-y-6" data-testid="skeleton-kpi-traction">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-primary/20 animate-pulse" />
                  <div className="h-7 w-48 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-5 w-64 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-6 w-24 bg-muted animate-pulse rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-l-4 border-l-muted">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-6 w-8 bg-muted animate-pulse rounded" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 w-48 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
                      <div className="h-2 w-24 bg-muted animate-pulse rounded-full" />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="container-kpi-traction">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Target className="w-6 h-6 text-primary" />
                KPI Traction & Performance
              </CardTitle>
              <CardDescription>
                Detailed variance analysis and contribution by priority job
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              {enrichedKPIs.length} KPIs Tracked
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobGroups.map((group, groupIndex) => {
              const isExpanded = expandedJobs.has(group.jobId);
              const avgProgress = group.kpis.reduce((sum, k) => sum + k.progress, 0) / group.kpis.length;
              const onTrackCount = group.kpis.filter(k => k.status === 'on-track').length;
              const totalCount = group.kpis.length;

              return (
                <Card key={group.jobId} className="border-l-4 border-l-primary/30" data-testid={`card-job-group-${group.jobId}`}>
                  <CardHeader 
                    className="hover-elevate active-elevate-2 cursor-pointer"
                    onClick={() => toggleJob(group.jobId)}
                  >
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Badge variant="default" className="shrink-0">
                          #{groupIndex + 1}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base flex items-center gap-2">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            <span className="truncate">{group.jobName.split(';')[0].trim()}</span>
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {group.solutionArea}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{Math.round(avgProgress)}%</div>
                          <div className="text-xs text-muted-foreground">Avg Progress</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{onTrackCount}/{totalCount}</div>
                          <div className="text-xs text-muted-foreground">On Track</div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {isExpanded && (
                    <CardContent className="pt-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[30%]">KPI Name</TableHead>
                              <TableHead className="text-center">Status</TableHead>
                              <TableHead className="text-center">Trend</TableHead>
                              <TableHead className="text-right">Baseline</TableHead>
                              <TableHead className="text-right">Current</TableHead>
                              <TableHead className="text-right">Target</TableHead>
                              <TableHead className="text-right">Variance</TableHead>
                              <TableHead className="text-right">Progress</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {group.kpis.map((enrichedKPI) => (
                              <TableRow key={enrichedKPI.kpi.id} data-testid={`row-kpi-${enrichedKPI.kpi.id}`}>
                                <TableCell className="font-medium">
                                  <div>
                                    <div className="line-clamp-2">{enrichedKPI.kpi.kpiName}</div>
                                    {enrichedKPI.latestActual && (
                                      <div className="text-xs text-muted-foreground mt-1">
                                        Last updated: {format(new Date(enrichedKPI.latestActual.actualDate), 'MMM d, yyyy')}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    {getStatusIcon(enrichedKPI.status)}
                                    {getStatusBadge(enrichedKPI.status)}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  {getTrendIcon(enrichedKPI.trend)}
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  {enrichedKPI.kpi.baselineValue}
                                  {enrichedKPI.kpi.unit && <span className="text-xs ml-1">{enrichedKPI.kpi.unit}</span>}
                                </TableCell>
                                <TableCell className="text-right font-mono font-bold text-primary">
                                  {enrichedKPI.latestActual 
                                    ? enrichedKPI.latestActual.actualValue
                                    : '—'
                                  }
                                  {enrichedKPI.kpi.unit && enrichedKPI.latestActual && (
                                    <span className="text-xs ml-1">{enrichedKPI.kpi.unit}</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  {enrichedKPI.kpi.targetValue}
                                  {enrichedKPI.kpi.unit && <span className="text-xs ml-1">{enrichedKPI.kpi.unit}</span>}
                                </TableCell>
                                <TableCell className="text-right">
                                  {enrichedKPI.latestActual ? (
                                    <span className={enrichedKPI.variance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                      {enrichedKPI.variance > 0 ? '+' : ''}{enrichedKPI.variance.toFixed(1)}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full transition-all ${
                                          enrichedKPI.status === 'on-track' ? 'bg-green-500' :
                                          enrichedKPI.status === 'at-risk' ? 'bg-yellow-500' :
                                          enrichedKPI.status === 'off-track' ? 'bg-red-500' :
                                          'bg-gray-400'
                                        }`}
                                        style={{ width: `${Math.min(100, Math.max(0, enrichedKPI.progress))}%` }}
                                      />
                                    </div>
                                    <span className="font-mono text-sm w-12 text-right">
                                      {Math.round(enrichedKPI.progress)}%
                                    </span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
