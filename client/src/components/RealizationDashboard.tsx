import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine
} from "recharts";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  Zap,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Bell
} from "lucide-react";
import { format } from "date-fns";

interface RealizationDashboardProps {
  projectId: number;
}

interface DashboardData {
  overallHealthScore: number;
  healthBreakdown: {
    onTrack: number;
    atRisk: number;
    offTrack: number;
    noData: number;
    financialNoData?: number;
  };
  kpiDetails: Array<{
    id: number;
    name: string;
    jobName: string;
    unit: string | null;
    baseline: number;
    target: number;
    current: number | null;
    progressPercent: number;
    status: 'on-track' | 'at-risk' | 'off-track' | 'no-data' | 'financial-no-data';
    healthScore: number;
    trendDirection: 'up' | 'down' | 'stable';
    trendPercent: number;
    forecast: number | null;
    forecastStatus: 'exceeding' | 'on-pace' | 'behind' | null;
    lastUpdated: string | null;
    history: Array<{ date: string; value: number }>;
    alerts: Array<{ type: string; message: string; severity: 'warning' | 'critical' }>;
  }>;
  alerts: Array<{
    kpiId: number;
    kpiName: string;
    type: string;
    message: string;
    severity: 'warning' | 'critical';
  }>;
  valueMetrics: {
    promised: number;
    realized: number;
    realizationPercent: number;
  };
  milestonesSummary: {
    total: number;
    achieved: number;
    planned: number;
    missed: number;
    upcoming: Array<any>;
  };
  lastReviewDate?: string;
  nextReviewDate?: string;
  interventionsActive: number;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function HealthScoreGauge({ score, size = 'lg' }: { score: number; size?: 'sm' | 'lg' }) {
  const getColor = () => {
    if (score >= 80) return 'text-primary';
    if (score >= 50) return 'text-amber-500';
    return 'text-destructive';
  };

  const getLabel = () => {
    if (score >= 80) return 'Healthy';
    if (score >= 50) return 'At Risk';
    return 'Critical';
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-2">
        <div className="relative w-10 h-10">
          <svg className="w-10 h-10 -rotate-90">
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-muted/30"
            />
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={2 * Math.PI * 16}
              strokeDashoffset={(2 * Math.PI * 16) - (score / 100) * (2 * Math.PI * 16)}
              strokeLinecap="round"
              className={getColor()}
            />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${getColor()}`}>
            {score}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/30"
          />
          <circle
            cx="64"
            cy="64"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={getColor()}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${getColor()}`}>{score}</span>
          <span className="text-xs text-muted-foreground">of 100</span>
        </div>
      </div>
      <Badge 
        variant="outline" 
        className={`mt-2 ${score >= 80 ? 'border-primary text-primary' : score >= 50 ? 'border-amber-500 text-amber-500' : 'border-destructive text-destructive'}`}
      >
        {getLabel()}
      </Badge>
    </div>
  );
}

function SparklineChart({ data, baseline, target }: { data: Array<{ date: string; value: number }>; baseline: number; target: number }) {
  if (data.length < 2) {
    return (
      <div className="h-12 flex items-center justify-center text-xs text-muted-foreground">
        Not enough data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <defs>
          <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <ReferenceLine y={baseline} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.5} />
        <ReferenceLine y={target} stroke="hsl(var(--primary))" strokeDasharray="3 3" strokeOpacity={0.5} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#sparklineGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function TrendIndicator({ direction, percent }: { direction: 'up' | 'down' | 'stable'; percent: number }) {
  if (direction === 'stable') {
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Minus className="w-3 h-3" />
        <span className="text-xs">Stable</span>
      </div>
    );
  }

  const isPositive = direction === 'up';
  return (
    <div className={`flex items-center gap-1 ${isPositive ? 'text-primary' : 'text-destructive'}`}>
      {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      <span className="text-xs font-medium">{Math.abs(percent)}%</span>
    </div>
  );
}

function KPICard({ kpi, index = 0 }: { kpi: DashboardData['kpiDetails'][0]; index?: number }) {
  const isFinancialNoData = kpi.status === 'financial-no-data';
  
  const getStatusColor = () => {
    switch (kpi.status) {
      case 'on-track': return 'border-primary/30 bg-primary/5';
      case 'at-risk': return 'border-amber-500/30 bg-amber-500/5';
      case 'off-track': return 'border-destructive/30 bg-destructive/5';
      case 'financial-no-data': return 'border-slate-400/30 bg-slate-100/50 dark:bg-slate-800/30';
      default: return 'border-muted';
    }
  };

  const getStatusIcon = () => {
    switch (kpi.status) {
      case 'on-track': return <CheckCircle2 className="w-4 h-4 text-primary" />;
      case 'at-risk': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'off-track': return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'financial-no-data': return <AlertTriangle className="w-4 h-4 text-slate-500" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  // Detect alert types for appropriate messaging
  const configAlert = kpi.alerts.find(a => a.type === 'missing-value-config');
  const invalidDataAlert = kpi.alerts.find(a => a.type === 'invalid-data' || a.type === 'invalid-latest-data');
  const isNoData = kpi.status === 'no-data';
  
  // Determine what kind of issue this KPI has
  const hasValueConfigIssue = isFinancialNoData && configAlert;
  const hasMeasurementIssue = (isNoData || isFinancialNoData) && !hasValueConfigIssue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
    >
      <Card className={`hover-elevate transition-all ${getStatusColor()}`} data-testid={`card-kpi-${kpi.id}`}>
        <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium truncate">{kpi.name}</CardTitle>
            <CardDescription className="text-xs truncate">{kpi.jobName}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {!isFinancialNoData && !isNoData && (
              <TrendIndicator direction={kpi.trendDirection} percent={kpi.trendPercent} />
            )}
            {getStatusIcon()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasValueConfigIssue ? (
          <div className="text-center py-4">
            <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Configuration Required</p>
            <p className="text-xs text-muted-foreground mt-1">
              {configAlert?.message || 'Missing value-per-unit configuration'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              This outcome is excluded from health scoring until configured.
            </p>
          </div>
        ) : hasMeasurementIssue ? (
          <div className="text-center py-4">
            <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-muted-foreground">
              {invalidDataAlert ? 'Invalid Measurements' : 'Awaiting Measurements'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {invalidDataAlert?.message || 'No valid measurements recorded yet'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              This outcome is excluded from health scoring until valid data is available.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold font-mono">
                  {kpi.current !== null ? kpi.current.toLocaleString() : '--'}
                </span>
                {kpi.unit && <span className="text-sm text-muted-foreground ml-1">{kpi.unit}</span>}
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <div>Target: {kpi.target.toLocaleString()}</div>
                <div>Baseline: {kpi.baseline.toLocaleString()}</div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{kpi.progressPercent}%</span>
              </div>
              <Progress 
                value={Math.max(0, Math.min(100, kpi.progressPercent))} 
                className="h-2"
              />
            </div>

            <SparklineChart data={kpi.history} baseline={kpi.baseline} target={kpi.target} />
          </>
        )}

        {kpi.forecast !== null && (
          <div className="flex items-center justify-between pt-1 border-t text-xs">
            <span className="text-muted-foreground">Forecast</span>
            <div className="flex items-center gap-1">
              <span className="font-mono">{kpi.forecast.toLocaleString()}</span>
              {kpi.forecastStatus && (
                <Badge 
                  variant="outline" 
                  className={`text-[10px] py-0 px-1 ${
                    kpi.forecastStatus === 'exceeding' ? 'border-primary text-primary' :
                    kpi.forecastStatus === 'on-pace' ? 'border-amber-500 text-amber-500' :
                    'border-destructive text-destructive'
                  }`}
                >
                  {kpi.forecastStatus === 'exceeding' ? 'Exceeding' : kpi.forecastStatus === 'on-pace' ? 'On Pace' : 'Behind'}
                </Badge>
              )}
            </div>
          </div>
        )}

        {kpi.lastUpdated && (
          <div className="text-[10px] text-muted-foreground">
            Last updated: {format(new Date(kpi.lastUpdated), 'MMM d, yyyy')}
          </div>
        )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AlertsPanel({ alerts }: { alerts: DashboardData['alerts'] }) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <CheckCircle2 className="w-8 h-8 mb-2 text-primary" />
        <p className="text-sm font-medium">All Clear</p>
        <p className="text-xs">No alerts at this time</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[200px]">
      <div className="space-y-2">
        {alerts.map((alert, idx) => (
          <div 
            key={idx}
            className={`flex items-start gap-3 p-3 rounded-md border ${
              alert.severity === 'critical' 
                ? 'border-destructive/30 bg-destructive/5' 
                : 'border-amber-500/30 bg-amber-500/5'
            }`}
            data-testid={`alert-${idx}`}
          >
            {alert.severity === 'critical' ? (
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{alert.kpiName}</p>
              <p className="text-xs text-muted-foreground">{alert.message}</p>
            </div>
            <Badge 
              variant="outline" 
              className={`shrink-0 text-[10px] ${
                alert.severity === 'critical' ? 'border-destructive text-destructive' : 'border-amber-500 text-amber-500'
              }`}
            >
              {alert.severity}
            </Badge>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

export function RealizationDashboard({ projectId }: RealizationDashboardProps) {
  const { data: dashboard, isLoading, error, isError } = useQuery<DashboardData>({
    queryKey: [`/api/projects/${projectId}/realization/dashboard`],
    enabled: !!projectId,
    refetchInterval: 60000,
    retry: 2,
  });

  if (isError) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <p className="text-destructive font-medium mb-2">Failed to load dashboard</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No realization data available yet</p>
        </CardContent>
      </Card>
    );
  }

  const { healthBreakdown, kpiDetails, alerts, valueMetrics, milestonesSummary } = dashboard;

  return (
    <div className="space-y-6" data-testid="realization-dashboard">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Health Score */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0 }}
        >
          <Card data-testid="card-health-score">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Overall Health
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <HealthScoreGauge score={dashboard.overallHealthScore} />
            </CardContent>
          </Card>
        </motion.div>

        {/* KPI Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card data-testid="card-kpi-breakdown">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Outcome Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-sm">On Track</span>
                  </div>
                  <span className="font-bold">{healthBreakdown.onTrack}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-sm">At Risk</span>
                  </div>
                  <span className="font-bold">{healthBreakdown.atRisk}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    <span className="text-sm">Off Track</span>
                  </div>
                  <span className="font-bold">{healthBreakdown.offTrack}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                    <span className="text-sm">No Data</span>
                  </div>
                  <span className="font-bold">{healthBreakdown.noData}</span>
                </div>
                {healthBreakdown.financialNoData !== undefined && healthBreakdown.financialNoData > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-400" />
                      <span className="text-sm text-muted-foreground">Missing Value Config</span>
                    </div>
                    <span className="font-bold text-muted-foreground">{healthBreakdown.financialNoData}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Value Realization */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card data-testid="card-value-realization">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Value Realized
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold font-mono text-primary">
                  {formatCurrency(valueMetrics.realized)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  of {formatCurrency(valueMetrics.promised)} promised
                </div>
                <div className="mt-3">
                  <Progress value={valueMetrics.realizationPercent} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {valueMetrics.realizationPercent}% realized
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card data-testid="card-milestones">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{milestonesSummary.achieved}</div>
                  <div className="text-xs text-muted-foreground">Achieved</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-500">{milestonesSummary.planned}</div>
                  <div className="text-xs text-muted-foreground">Planned</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-destructive">{milestonesSummary.missed}</div>
                  <div className="text-xs text-muted-foreground">Missed</div>
                </div>
              </div>
              {dashboard.nextReviewDate && (
                <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  Next Review: {format(new Date(dashboard.nextReviewDate), 'MMM d, yyyy')}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card data-testid="card-alerts">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              Active Alerts
              <Badge variant="secondary" className="ml-2">{alerts.length}</Badge>
            </CardTitle>
            <CardDescription>Outcomes requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertsPanel alerts={alerts} />
          </CardContent>
        </Card>
      )}

      {/* KPI Progress Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Outcome Progress</h3>
          <Badge variant="outline">{kpiDetails.length} Outcomes</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiDetails
            .sort((a, b) => {
              const statusOrder: Record<string, number> = { 
                'off-track': 0, 
                'at-risk': 1, 
                'financial-no-data': 2, 
                'no-data': 3, 
                'on-track': 4 
              };
              return (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5);
            })
            .map((kpi, idx) => (
              <KPICard key={kpi.id} kpi={kpi} index={idx} />
            ))}
        </div>
      </div>
    </div>
  );
}
