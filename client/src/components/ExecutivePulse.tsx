import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, AlertCircle, CheckCircle2, Activity, DollarSign } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface ExecutivePulseProps {
  projectId: number;
}

interface ProjectValueMetrics {
  totalValuePromised: number;
  totalValueRealized: number;
  valuePromisedBreakdown: Record<string, number>;
  valueRealizedBreakdown: Record<string, number>;
  overallProgressPercent: number;
  kpisOnTrack: number;
  kpisAtRisk: number;
  kpisOffTrack: number;
  kpisNoData: number;
  confidenceLevel?: number;
  lastReviewDate?: string;
  nextReviewDate?: string;
  clientSentimentAvg?: number;
  calculationNotes?: string;
}

export default function ExecutivePulse({ projectId }: ExecutivePulseProps) {
  // Fetch aggregated value metrics from backend
  const { data: metrics, isLoading } = useQuery<ProjectValueMetrics>({
    queryKey: [`/api/projects/${projectId}/realization/metrics`],
    enabled: !!projectId,
  });

  if (isLoading || !metrics) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading Value Delivery Command Center...</CardTitle>
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

  // Extract metrics
  const {
    totalValuePromised,
    totalValueRealized,
    overallProgressPercent,
    kpisOnTrack,
    kpisAtRisk,
    kpisOffTrack,
    kpisNoData,
    confidenceLevel,
    nextReviewDate,
    clientSentimentAvg,
  } = metrics;

  const totalKPIs = kpisOnTrack + kpisAtRisk + kpisOffTrack + kpisNoData;
  const valueGap = totalValuePromised - totalValueRealized;
  const valueRealizedPercent = totalValuePromised > 0 
    ? Math.round((totalValueRealized / totalValuePromised) * 100) 
    : 0;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Status breakdown for pie chart
  const statusData = [
    { name: 'On Track', value: kpisOnTrack, color: '#10b981' },
    { name: 'At Risk', value: kpisAtRisk, color: '#f59e0b' },
    { name: 'Off Track', value: kpisOffTrack, color: '#ef4444' },
    { name: 'No Data', value: kpisNoData, color: '#9ca3af' },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6" data-testid="container-executive-pulse">
      {/* Value Delivery Header */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10" data-testid="card-value-header">
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-primary" />
                Value Delivery Command Center
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Real-time tracking of business value realized vs. promised
              </CardDescription>
            </div>
            {nextReviewDate && (
              <Badge variant="outline" className="bg-background">
                Next Review: {new Date(nextReviewDate).toLocaleDateString()}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Value Promised</p>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(totalValuePromised)}</p>
              <p className="text-xs text-muted-foreground">Total commitment from alignment</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Value Realized</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(totalValueRealized)}</p>
              <Progress value={valueRealizedPercent} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground">{valueRealizedPercent}% of promised value delivered</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Remaining Value Gap</p>
              <p className="text-3xl font-bold text-orange-600">{formatCurrency(valueGap)}</p>
              <p className="text-xs text-muted-foreground">Still to be realized</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall Progress */}
        <Card className="border-primary/20" data-testid="card-overall-progress">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              KPI Progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">
                {overallProgressPercent}%
              </div>
              <Progress value={overallProgressPercent} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Across {totalKPIs} tracked KPIs
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Confidence Level */}
        {confidenceLevel !== undefined && (
          <Card className="border-blue-200 dark:border-blue-800" data-testid="card-confidence">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Confidence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-blue-600">
                  {confidenceLevel}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Data quality & reliability
                </p>
              </div>
            </CardContent>
          </Card>
        )}

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
                {kpisOnTrack}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalKPIs > 0 ? Math.round((kpisOnTrack / totalKPIs) * 100) : 0}% of KPIs
              </p>
            </div>
          </CardContent>
        </Card>

        {/* At Risk + Off Track KPIs */}
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
                {kpisAtRisk + kpisOffTrack}
              </div>
              <p className="text-xs text-muted-foreground">
                {kpisAtRisk} at risk, {kpisOffTrack} off track
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Status Distribution */}
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
                Key observations from current progress and recommendations
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-primary/10">
              Last updated: {new Date().toLocaleDateString()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {totalValueRealized > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    Value Delivered: {formatCurrency(totalValueRealized)}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {valueRealizedPercent}% of promised value has been realized across {kpisOnTrack} on-track KPIs. Strong progress toward engagement goals.
                  </p>
                </div>
              </div>
            )}
            
            {valueGap > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <Target className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-900 dark:text-orange-100">
                    Remaining Opportunity: {formatCurrency(valueGap)}
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Focus interventions on the {kpisAtRisk + kpisOffTrack} KPIs needing attention to close the value gap and maximize business impact.
                  </p>
                </div>
              </div>
            )}

            {(kpisAtRisk + kpisOffTrack) > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900 dark:text-yellow-100">
                    Action Required
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {kpisAtRisk + kpisOffTrack} KPIs need immediate attention ({kpisAtRisk} at risk, {kpisOffTrack} off track). Schedule business review to address blockers.
                  </p>
                </div>
              </div>
            )}

            {kpisNoData > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800">
                <Activity className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Measurement Gap
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {kpisNoData} KPIs don't have actual measurements yet. Begin tracking to establish progress baselines and quantify value impact.
                  </p>
                </div>
              </div>
            )}
            
            {clientSentimentAvg !== undefined && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <Activity className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Client Sentiment: {clientSentimentAvg}/5
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Average client satisfaction across business reviews. {clientSentimentAvg >= 4 ? 'Strong partnership health.' : 'Consider deeper stakeholder engagement.'}
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
