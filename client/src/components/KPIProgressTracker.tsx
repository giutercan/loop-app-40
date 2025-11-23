import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import { Plus, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { queryClient } from "@/lib/queryClient";
import RecordMeasurementDialog from "./RecordMeasurementDialog";
import type { JobTheme, JobThemeKPI, KPIActual } from "@shared/schema";

interface KPIProgressTrackerProps {
  projectId: number;
}

interface KPIWithActuals extends JobThemeKPI {
  actuals: KPIActual[];
  jobName?: string;
  capabilityName?: string;
}

export default function KPIProgressTracker({ projectId }: KPIProgressTrackerProps) {
  const [selectedKPI, setSelectedKPI] = useState<KPIWithActuals | null>(null);
  const [showRecordDialog, setShowRecordDialog] = useState(false);

  // Fetch finalized jobs
  const { data: finalizedJobs = [] } = useQuery<JobTheme[]>({
    queryKey: [`/api/projects/${projectId}/alignment/finalized-jobs`],
    enabled: !!projectId,
  });

  // Fetch all KPIs for finalized jobs
  const finalizedJobIds = finalizedJobs.map(job => job.id);
  
  const kpiQueries = finalizedJobIds.map(jobId =>
    useQuery<JobThemeKPI[]>({
      queryKey: [`/api/job-themes/${jobId}/kpis`],
      enabled: !!jobId,
    })
  );

  // Collect all KPIs with their job context
  const allKPIs: KPIWithActuals[] = [];
  kpiQueries.forEach((query, index) => {
    if (query.data) {
      const job = finalizedJobs[index];
      query.data
        .filter(kpi => kpi.isSelected && kpi.baselineValue && kpi.targetValue)
        .forEach(kpi => {
          allKPIs.push({
            ...kpi,
            actuals: [],
            jobName: job.jobName,
            capabilityName: job.capabilityName,
          });
        });
    }
  });

  // Fetch actuals for each KPI
  const actualsQueries = allKPIs.map(kpi =>
    useQuery<KPIActual[]>({
      queryKey: [`/api/job-theme-kpis/${kpi.id}/actuals`],
      enabled: !!kpi.id,
    })
  );

  // Merge actuals into KPIs
  const kpisWithActuals: KPIWithActuals[] = allKPIs.map((kpi, index) => ({
    ...kpi,
    actuals: actualsQueries[index].data || [],
  }));

  // Calculate KPI status based on progress
  const getKPIStatus = (kpi: KPIWithActuals): 'on-track' | 'at-risk' | 'off-track' | 'no-data' => {
    if (kpi.actuals.length === 0) return 'no-data';

    const latestActual = kpi.actuals[0]; // Already sorted by date desc from API
    const baseline = parseFloat(kpi.baselineValue || '0');
    const target = parseFloat(kpi.targetValue || '0');
    const current = parseFloat(latestActual.actualValue);

    if (isNaN(baseline) || isNaN(target) || isNaN(current)) return 'no-data';

    const totalChange = target - baseline;
    const currentChange = current - baseline;
    const progressPercent = (currentChange / totalChange) * 100;

    // On track: making 80%+ of expected progress
    if (progressPercent >= 80) return 'on-track';
    // At risk: 50-80% of expected progress
    if (progressPercent >= 50) return 'at-risk';
    // Off track: <50% of expected progress
    return 'off-track';
  };

  // Prepare chart data for a KPI
  const prepareChartData = (kpi: KPIWithActuals) => {
    const baseline = parseFloat(kpi.baselineValue || '0');
    const target = parseFloat(kpi.targetValue || '0');

    const dataPoints = [
      {
        date: 'Baseline',
        value: baseline,
        label: 'Baseline',
      },
      ...kpi.actuals
        .slice()
        .reverse() // Show oldest to newest
        .map(actual => ({
          date: format(new Date(actual.actualDate), 'MMM d, yyyy'),
          value: parseFloat(actual.actualValue),
          label: format(new Date(actual.actualDate), 'MMM d'),
          source: actual.actualSource,
          notes: actual.notes,
        })),
      {
        date: 'Target',
        value: target,
        label: 'Target',
        isTarget: true,
      },
    ];

    return dataPoints;
  };

  const handleRecordMeasurement = (kpi: KPIWithActuals) => {
    setSelectedKPI(kpi);
    setShowRecordDialog(true);
  };

  const statusConfig = {
    'on-track': {
      label: 'On Track',
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
    },
    'at-risk': {
      label: 'At Risk',
      icon: Minus,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
    },
    'off-track': {
      label: 'Off Track',
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
    },
    'no-data': {
      label: 'No Data',
      icon: AlertCircle,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-900/20',
      borderColor: 'border-gray-200 dark:border-gray-800',
    },
  };

  if (kpisWithActuals.length === 0) {
    return (
      <Card data-testid="card-no-kpis">
        <CardHeader>
          <CardTitle>KPI Progress Tracking</CardTitle>
          <CardDescription>No KPIs configured for tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              No KPIs have been selected for tracking in the Alignment phase.
            </p>
            <p className="text-sm text-muted-foreground">
              Complete the Jobs & Priorities workflow and set baseline/target values to begin tracking.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="container-kpi-tracker">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-2xl">KPI Progress Tracking</CardTitle>
              <CardDescription>
                Track actual measurements against baselines and targets over time
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {Object.entries(statusConfig).map(([status, config]) => {
                const count = kpisWithActuals.filter(kpi => getKPIStatus(kpi) === status).length;
                if (count === 0 && status !== 'on-track') return null;
                const Icon = config.icon;
                return (
                  <Badge key={status} variant="outline" className={`${config.bgColor} ${config.borderColor}`}>
                    <Icon className={`w-3 h-3 mr-1 ${config.color}`} />
                    {count} {config.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {kpisWithActuals.map((kpi) => {
          const status = getKPIStatus(kpi);
          const config = statusConfig[status];
          const Icon = config.icon;
          const chartData = prepareChartData(kpi);
          const latestActual = kpi.actuals[0];

          return (
            <Card key={kpi.id} className={`border-l-4 ${config.borderColor}`} data-testid={`card-kpi-${kpi.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{kpi.kpiName}</CardTitle>
                      <Badge variant="outline" className={`${config.bgColor} ${config.borderColor}`}>
                        <Icon className={`w-3 h-3 mr-1 ${config.color}`} />
                        {config.label}
                      </Badge>
                    </div>
                    <CardDescription>
                      {kpi.jobName && <span className="font-medium">{kpi.jobName}</span>}
                      {kpi.capabilityName && <span className="text-muted-foreground"> • {kpi.capabilityName}</span>}
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleRecordMeasurement(kpi)}
                    data-testid={`button-record-measurement-${kpi.id}`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Record Measurement
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Status */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Baseline</p>
                    <p className="text-2xl font-bold font-mono">{kpi.baselineValue}{kpi.unit}</p>
                    {kpi.baselineSource && (
                      <p className="text-xs text-muted-foreground mt-1">{kpi.baselineSource}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current</p>
                    {latestActual ? (
                      <>
                        <p className="text-2xl font-bold font-mono text-primary">
                          {latestActual.actualValue}{kpi.unit}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(latestActual.actualDate), 'MMM d, yyyy')}
                        </p>
                      </>
                    ) : (
                      <p className="text-2xl font-bold font-mono text-muted-foreground">—</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Target</p>
                    <p className="text-2xl font-bold font-mono">{kpi.targetValue}{kpi.unit}</p>
                    {kpi.targetSource && (
                      <p className="text-xs text-muted-foreground mt-1">{kpi.targetSource}</p>
                    )}
                  </div>
                </div>

                {/* Progress Chart */}
                {kpi.actuals.length > 0 && (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis 
                          dataKey="label" 
                          tick={{ fontSize: 12 }}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          formatter={(value: any, name: string) => [
                            `${value}${kpi.unit}`,
                            name === 'value' ? 'Measurement' : name
                          ]}
                        />
                        <Legend />
                        <ReferenceLine
                          y={parseFloat(kpi.baselineValue || '0')}
                          stroke="hsl(var(--muted-foreground))"
                          strokeDasharray="3 3"
                          label={{ value: 'Baseline', position: 'insideTopLeft', fontSize: 12 }}
                        />
                        <ReferenceLine
                          y={parseFloat(kpi.targetValue || '0')}
                          stroke="hsl(var(--primary))"
                          strokeDasharray="3 3"
                          label={{ value: 'Target', position: 'insideTopRight', fontSize: 12 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Measurement History */}
                {kpi.actuals.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Measurement History</h4>
                    <div className="space-y-2">
                      {kpi.actuals.slice(0, 5).map((actual) => (
                        <div
                          key={actual.id}
                          className="flex items-start justify-between gap-4 p-3 rounded-lg bg-muted/50"
                          data-testid={`measurement-${actual.id}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono font-bold">{actual.actualValue}{kpi.unit}</span>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(actual.actualDate), 'MMM d, yyyy')}
                              </span>
                            </div>
                            {actual.actualSource && (
                              <p className="text-xs text-muted-foreground">Source: {actual.actualSource}</p>
                            )}
                            {actual.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{actual.notes}</p>
                            )}
                            {actual.validatedBy && (
                              <p className="text-xs text-muted-foreground">Validated by: {actual.validatedBy}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      {kpi.actuals.length > 5 && (
                        <p className="text-xs text-center text-muted-foreground">
                          +{kpi.actuals.length - 5} more measurements
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedKPI && (
        <RecordMeasurementDialog
          open={showRecordDialog}
          onOpenChange={setShowRecordDialog}
          kpi={selectedKPI}
          onSuccess={() => {
            setShowRecordDialog(false);
            // Invalidate queries to refetch data
            queryClient.invalidateQueries({ queryKey: [`/api/job-theme-kpis/${selectedKPI.id}/actuals`] });
          }}
        />
      )}
    </div>
  );
}
