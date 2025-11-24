import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, AlertCircle, CheckCircle2, Activity } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import type { JobThemeKPI, KPIActual } from "@shared/schema";

interface ExecutivePulseProps {
  projectId: number;
}

interface FinalizedJobsResponse {
  finalized: boolean;
  jobs: Array<{
    id: number;
    jobName: string;
    capabilityName: string;
    kpis: JobThemeKPI[];
  }>;
}

interface KPIWithActuals extends JobThemeKPI {
  actuals: KPIActual[];
  jobName?: string;
  progress: number;
  status: 'on-track' | 'at-risk' | 'off-track' | 'no-data';
}

export default function ExecutivePulse({ projectId }: ExecutivePulseProps) {
  const { data: finalizedJobsData, isLoading } = useQuery<FinalizedJobsResponse>({
    queryKey: [`/api/projects/${projectId}/alignment/finalized-jobs`],
    enabled: !!projectId,
  });

  const finalizedJobs = finalizedJobsData?.jobs || [];

  // Collect all selected KPIs with baseline and target
  const allKPIs: KPIWithActuals[] = [];
  finalizedJobs.forEach((job) => {
    const kpiList = job.kpis || [];
    kpiList
      .filter((kpi: JobThemeKPI) => kpi.isSelected && kpi.baselineValue && kpi.targetValue)
      .forEach((kpi: JobThemeKPI) => {
        allKPIs.push({
          ...kpi,
          actuals: [],
          jobName: job.jobName,
          progress: 0,
          status: 'no-data',
        });
      });
  });

  // Fetch actuals for all KPIs
  const actualsQueries = useQuery({
    queryKey: [`/api/projects/${projectId}/all-kpi-actuals`],
    queryFn: async () => {
      const results = await Promise.all(
        allKPIs.map(async (kpi) => {
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

  // Calculate KPI metrics
  const calculateKPIMetrics = (kpi: JobThemeKPI, actuals: KPIActual[]) => {
    if (actuals.length === 0) return { progress: 0, status: 'no-data' as const };

    const baseline = parseFloat(kpi.baselineValue || '0');
    const target = parseFloat(kpi.targetValue || '0');
    const latestActual = actuals[0];
    const current = parseFloat(latestActual.actualValue);

    if (isNaN(baseline) || isNaN(target) || isNaN(current)) {
      return { progress: 0, status: 'no-data' as const };
    }

    const totalDistance = Math.abs(target - baseline);
    if (totalDistance === 0) {
      return { 
        progress: current === target ? 100 : 0, 
        status: current === target ? 'on-track' as const : 'off-track' as const 
      };
    }

    const isIncreasingKPI = target > baseline;
    let completedDistance: number;
    if (isIncreasingKPI) {
      completedDistance = current - baseline;
    } else {
      completedDistance = baseline - current;
    }

    const progressRatio = Math.max(0, Math.min(1, completedDistance / totalDistance));
    const progress = progressRatio * 100;

    let status: 'on-track' | 'at-risk' | 'off-track' = 'off-track';
    if (progressRatio >= 0.85) status = 'on-track';
    else if (progressRatio >= 0.60) status = 'at-risk';

    return { progress, status };
  };

  // Enrich KPIs with actuals and metrics
  const enrichedKPIs: KPIWithActuals[] = allKPIs.map((kpi) => {
    const actualsData = actualsQueries.data?.find(a => a.kpiId === kpi.id);
    const actuals = actualsData?.actuals || [];
    const metrics = calculateKPIMetrics(kpi, actuals);
    
    return {
      ...kpi,
      actuals,
      progress: metrics.progress,
      status: metrics.status,
    };
  });

  // Calculate executive metrics
  const totalKPIs = enrichedKPIs.length;
  const onTrackCount = enrichedKPIs.filter(k => k.status === 'on-track').length;
  const atRiskCount = enrichedKPIs.filter(k => k.status === 'at-risk').length;
  const offTrackCount = enrichedKPIs.filter(k => k.status === 'off-track').length;
  const noDataCount = enrichedKPIs.filter(k => k.status === 'no-data').length;
  
  const overallProgress = totalKPIs > 0 
    ? enrichedKPIs.reduce((sum, kpi) => sum + kpi.progress, 0) / totalKPIs 
    : 0;

  const healthScore = totalKPIs > 0
    ? Math.round((onTrackCount * 100 + atRiskCount * 60) / totalKPIs)
    : 0;

  // Status breakdown for pie chart
  const statusData = [
    { name: 'On Track', value: onTrackCount, color: '#10b981' },
    { name: 'At Risk', value: atRiskCount, color: '#f59e0b' },
    { name: 'Off Track', value: offTrackCount, color: '#ef4444' },
    { name: 'No Data', value: noDataCount, color: '#9ca3af' },
  ].filter(item => item.value > 0);

  // Job-level performance
  const jobPerformance = finalizedJobs.map(job => {
    const jobKPIs = enrichedKPIs.filter(k => k.jobThemeId === job.id);
    const avgProgress = jobKPIs.length > 0
      ? jobKPIs.reduce((sum, k) => sum + k.progress, 0) / jobKPIs.length
      : 0;
    
    return {
      name: job.jobName.split(';')[0].trim(),
      progress: Math.round(avgProgress),
      kpiCount: jobKPIs.length,
    };
  });

  if (isLoading || actualsQueries.isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading Executive Summary...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <Activity className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="container-executive-pulse">
      {/* Header with Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall Progress */}
        <Card className="border-primary/30" data-testid="card-overall-progress">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Overall Progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">
                {Math.round(overallProgress)}%
              </div>
              <Progress value={overallProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Across {totalKPIs} tracked KPIs
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Health Score */}
        <Card className={`border-l-4 ${healthScore >= 80 ? 'border-l-green-500' : healthScore >= 60 ? 'border-l-yellow-500' : 'border-l-red-500'}`} data-testid="card-health-score">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Health Score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className={`text-4xl font-bold ${healthScore >= 80 ? 'text-green-600' : healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {healthScore}
              </div>
              <p className="text-xs text-muted-foreground">
                Engagement health index
              </p>
            </div>
          </CardContent>
        </Card>

        {/* On Track KPIs */}
        <Card className="border-green-200 dark:border-green-800" data-testid="card-on-track">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              On Track
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-green-600">
                {onTrackCount}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalKPIs > 0 ? Math.round((onTrackCount / totalKPIs) * 100) : 0}% of KPIs
              </p>
            </div>
          </CardContent>
        </Card>

        {/* At Risk KPIs */}
        <Card className="border-yellow-200 dark:border-yellow-800" data-testid="card-at-risk">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              Needs Attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-yellow-600">
                {atRiskCount + offTrackCount}
              </div>
              <p className="text-xs text-muted-foreground">
                {atRiskCount} at risk, {offTrackCount} off track
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card data-testid="card-status-distribution">
          <CardHeader>
            <CardTitle>KPI Status Distribution</CardTitle>
            <CardDescription>Real-time snapshot of value realization progress</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No KPI data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Performance */}
        <Card data-testid="card-job-performance">
          <CardHeader>
            <CardTitle>Performance by Priority Job</CardTitle>
            <CardDescription>Progress across strategic job themes</CardDescription>
          </CardHeader>
          <CardContent>
            {jobPerformance.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={jobPerformance} layout="horizontal">
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, 'Progress']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="progress" fill="hsl(var(--primary))" name="Progress %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No job performance data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Value Insights */}
      <Card className="border-primary/20" data-testid="card-value-insights">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Value Realization Insights
              </CardTitle>
              <CardDescription>
                Key observations from current progress
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-primary/10">
              Last updated: {new Date().toLocaleDateString()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {onTrackCount > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    Strong Momentum
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {onTrackCount} KPIs are on track, demonstrating clear value delivery on {Math.round((onTrackCount / totalKPIs) * 100)}% of commitments
                  </p>
                </div>
              </div>
            )}
            
            {(atRiskCount + offTrackCount) > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900 dark:text-yellow-100">
                    Action Required
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {atRiskCount + offTrackCount} KPIs need attention. Consider scheduling a business review to address blockers and adjust interventions.
                  </p>
                </div>
              </div>
            )}

            {noDataCount > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800">
                <Activity className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Measurement Gap
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {noDataCount} KPIs don't have actual measurements yet. Begin tracking to establish progress baselines.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
