import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import StatusBadge from "@/components/StatusBadge";
import RecordMeasurementDialog from "@/components/RecordMeasurementDialog";
import { QBRSummaryGenerator } from "@/components/QBRSummaryGenerator";
import {
  Download,
  FileText,
  Clock,
  CheckCircle2,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  AlertCircle,
  Target,
  DollarSign,
  Zap,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  ChevronDown,
  ChevronRight,
  Plus,
  BarChart3,
  Eye,
  Sparkles,
} from "lucide-react";
import { Link, useRoute } from "wouter";
import { useQuery, useQueries } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  Legend,
} from "recharts";
import type { Project, AnalyticsReview, JobTheme, JobThemeKPI, KPIActual } from "@shared/schema";

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

interface KPIWithActuals extends JobThemeKPI {
  actuals: KPIActual[];
  jobName?: string;
  capabilityName?: string;
}

interface FinalizedJobsResponse {
  finalized: boolean;
  jobs: JobTheme[];
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function HealthScoreGauge({ score }: { score: number }) {
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

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted/30"
          />
          <circle
            cx="48"
            cy="48"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={getColor()}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${getColor()}`}>{score}</span>
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

function KPIStatusRow({ kpi, onRecordMeasurement }: { kpi: DashboardData['kpiDetails'][0]; onRecordMeasurement: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isFinancialNoData = kpi.status === 'financial-no-data';
  const isNoData = kpi.status === 'no-data';
  
  const getStatusColor = () => {
    switch (kpi.status) {
      case 'on-track': return 'bg-primary text-primary-foreground';
      case 'at-risk': return 'bg-amber-500 text-white';
      case 'off-track': return 'bg-destructive text-destructive-foreground';
      case 'financial-no-data': return 'bg-slate-400 text-white';
      default: return 'bg-muted-foreground text-muted';
    }
  };

  const getStatusIcon = () => {
    switch (kpi.status) {
      case 'on-track': return <CheckCircle2 className="w-4 h-4" />;
      case 'at-risk': return <AlertTriangle className="w-4 h-4" />;
      case 'off-track': return <AlertCircle className="w-4 h-4" />;
      case 'financial-no-data': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const configAlert = kpi.alerts.find(a => a.type === 'missing-value-config');
  const hasValueConfigIssue = isFinancialNoData && configAlert;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger asChild>
        <div 
          className="flex items-center gap-4 p-3 rounded-lg border hover-elevate cursor-pointer transition-all"
          data-testid={`kpi-row-${kpi.id}`}
        >
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{kpi.name}</span>
              <span className="text-xs text-muted-foreground truncate">{kpi.jobName}</span>
            </div>
          </div>

          {!isFinancialNoData && !isNoData ? (
            <>
              <div className="hidden sm:flex items-center gap-4 shrink-0">
                <div className="w-32">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{kpi.progressPercent}%</span>
                  </div>
                  <Progress value={Math.max(0, Math.min(100, kpi.progressPercent))} className="h-1.5" />
                </div>
                
                <div className="text-right w-24">
                  <span className="font-mono text-sm font-medium">
                    {kpi.current !== null ? kpi.current.toLocaleString() : '--'}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">/ {kpi.target.toLocaleString()}</span>
                </div>

                <TrendIndicator direction={kpi.trendDirection} percent={kpi.trendPercent} />
              </div>
              
              <Badge className={`shrink-0 ${getStatusColor()}`}>
                {getStatusIcon()}
                <span className="ml-1 hidden sm:inline">{kpi.status.replace('-', ' ')}</span>
              </Badge>
            </>
          ) : (
            <Badge variant="outline" className="shrink-0 text-muted-foreground">
              {hasValueConfigIssue ? 'Config Required' : 'No Data'}
            </Badge>
          )}
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-2 ml-10 p-4 rounded-lg bg-muted/30 border">
          {hasValueConfigIssue ? (
            <div className="text-center py-4">
              <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Configuration Required</p>
              <p className="text-xs text-muted-foreground mt-1">{configAlert?.message}</p>
            </div>
          ) : isNoData ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Awaiting Measurements</p>
                <p className="text-xs text-muted-foreground mt-1">No measurements recorded yet</p>
              </div>
              <Button size="sm" onClick={onRecordMeasurement} data-testid={`button-record-${kpi.id}`}>
                <Plus className="w-4 h-4 mr-2" />
                Record Measurement
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Baseline</p>
                    <p className="font-mono font-medium">{kpi.baseline.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Current</p>
                    <p className="font-mono font-medium text-primary">{kpi.current?.toLocaleString() ?? '--'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Target</p>
                    <p className="font-mono font-medium">{kpi.target.toLocaleString()}</p>
                  </div>
                </div>
                
                {kpi.forecast !== null && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-muted-foreground">Forecast:</span>
                    <span className="font-mono text-sm">{kpi.forecast.toLocaleString()}</span>
                    {kpi.forecastStatus && (
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] ${
                          kpi.forecastStatus === 'exceeding' ? 'border-primary text-primary' :
                          kpi.forecastStatus === 'on-pace' ? 'border-amber-500 text-amber-500' :
                          'border-destructive text-destructive'
                        }`}
                      >
                        {kpi.forecastStatus}
                      </Badge>
                    )}
                  </div>
                )}

                <Button size="sm" onClick={onRecordMeasurement} data-testid={`button-record-${kpi.id}`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Record Measurement
                </Button>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-2">Trend</p>
                <SparklineChart data={kpi.history} baseline={kpi.baseline} target={kpi.target} />
                {kpi.lastUpdated && (
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Last updated: {format(new Date(kpi.lastUpdated), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function AlertsSection({ alerts }: { alerts: DashboardData['alerts'] }) {
  const [isOpen, setIsOpen] = useState(true);
  
  if (alerts.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-amber-500/30" data-testid="card-alerts">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover-elevate">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                Active Alerts
                <Badge variant="secondary">{alerts.length}</Badge>
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <ScrollArea className="h-[160px]">
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
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function FinancialSummary({ projectId }: { projectId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const financialData = [
    {
      year: 1,
      incrementalCashFlow: 2400000,
      cumulative: 2400000,
      npv: 2181818,
      notes: "Initial impact from retention improvement",
    },
    {
      year: 2,
      incrementalCashFlow: 3100000,
      cumulative: 5500000,
      npv: 2561983,
      notes: "Compounding effects + pipeline strength",
    },
    {
      year: 3,
      incrementalCashFlow: 3800000,
      cumulative: 9300000,
      npv: 2854176,
      notes: "Full program maturity",
    }
  ];
  
  const totalNPV = 7597977;
  const paybackMonths = 8;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card data-testid="card-financial-summary">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover-elevate">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Financial Summary
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Total NPV</span>
                    <p className="text-lg font-bold font-mono text-primary">${(totalNPV / 1000000).toFixed(2)}M</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Payback</span>
                    <p className="text-lg font-bold font-mono">{paybackMonths} mo</p>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 font-medium">Year</th>
                    <th className="text-right p-3 font-medium">Cash Flow</th>
                    <th className="text-right p-3 font-medium">Cumulative</th>
                    <th className="text-right p-3 font-medium">NPV</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {financialData.map((row) => (
                    <tr key={row.year} className="border-t">
                      <td className="p-3 font-medium">{row.year}</td>
                      <td className="p-3 text-right font-mono">${(row.incrementalCashFlow / 1000000).toFixed(2)}M</td>
                      <td className="p-3 text-right font-mono">${(row.cumulative / 1000000).toFixed(2)}M</td>
                      <td className="p-3 text-right font-mono font-bold">${(row.npv / 1000000).toFixed(2)}M</td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export default function Realisation() {
  const [, params] = useRoute("/projects/:id/realisation");
  const projectId = parseInt(params?.id || "0");
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedKPIForMeasurement, setSelectedKPIForMeasurement] = useState<any>(null);
  const [showRecordDialog, setShowRecordDialog] = useState(false);

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });

  const { data: analyticsReviews = [] } = useQuery<AnalyticsReview[]>({
    queryKey: [`/api/projects/${projectId}/analytics-reviews`],
    enabled: !!projectId,
  });

  const { data: dashboard, isLoading: dashboardLoading, isError } = useQuery<DashboardData>({
    queryKey: [`/api/projects/${projectId}/realization/dashboard`],
    enabled: !!projectId,
    refetchInterval: 60000,
    retry: 2,
  });

  const { data: finalizedJobsData } = useQuery<FinalizedJobsResponse>({
    queryKey: [`/api/projects/${projectId}/alignment/finalized-jobs`],
    enabled: !!projectId,
  });

  const finalizedJobs = finalizedJobsData?.jobs || [];
  
  const allKPIs: KPIWithActuals[] = [];
  finalizedJobs.forEach((job: any) => {
    const kpiList = job.kpis || [];
    kpiList
      .filter((kpi: JobThemeKPI) => kpi.isSelected && kpi.baselineValue && kpi.targetValue)
      .forEach((kpi: JobThemeKPI) => {
        allKPIs.push({
          ...kpi,
          actuals: [],
          jobName: job.jobName,
          capabilityName: job.capabilityName,
        });
      });
  });

  const actualsQueries = useQueries({
    queries: allKPIs.map(kpi => ({
      queryKey: [`/api/job-theme-kpis/${kpi.id}/actuals`],
      enabled: !!kpi.id,
    })),
  });

  const analyticsReview = analyticsReviews[0];
  const analyticsSignedOff = analyticsReview?.status === "approved";

  const handleRecordMeasurement = (kpi: any) => {
    const matchingKPI = allKPIs.find(k => k.id === kpi.id || k.kpiName === kpi.name);
    if (matchingKPI) {
      const index = allKPIs.indexOf(matchingKPI);
      const actuals = actualsQueries[index]?.data as KPIActual[] || [];
      setSelectedKPIForMeasurement({ ...matchingKPI, actuals });
      setShowRecordDialog(true);
    }
  };

  if (dashboardLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b bg-card p-4">
          <Skeleton className="h-8 w-48" />
        </div>
        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b bg-card p-4">
          <h1 className="text-xl font-semibold">Value Realization</h1>
        </div>
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="py-12 text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No realization data available yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Complete the Discovery and Alignment phases to begin tracking value realization.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const { healthBreakdown, kpiDetails, alerts, valueMetrics, milestonesSummary } = dashboard;

  const sortedKPIs = [...kpiDetails].sort((a, b) => {
    const statusOrder: Record<string, number> = { 
      'off-track': 0, 
      'at-risk': 1, 
      'financial-no-data': 2, 
      'no-data': 3, 
      'on-track': 4 
    };
    return (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5);
  });

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-card">
        <div className="p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">Value Realization</h1>
              <StatusBadge status={analyticsSignedOff ? "locked" : "pending"} />
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                <DialogTrigger asChild>
                  <Button data-testid="button-generate-report">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Generate Executive Report</DialogTitle>
                    <DialogDescription>
                      Create a board-ready summary of value realization progress
                    </DialogDescription>
                  </DialogHeader>
                  <QBRSummaryGenerator projectId={projectId} />
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" data-testid="button-export">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {!analyticsSignedOff && (
          <div className="bg-[#8DC63F]/10 border-t border-[#8DC63F]/20 px-6 py-2">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#00634F]" />
              <span className="text-sm text-muted-foreground">
                Analytics Review Pending • Tier 3 review {analyticsReview ? `• ${analyticsReview.status}` : "pending"}
              </span>
            </div>
          </div>
        )}
      </div>

      <main className="flex-1 overflow-auto p-6">
        <div className="space-y-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card data-testid="card-health-score">
              <CardContent className="pt-6 flex flex-col items-center">
                <HealthScoreGauge score={dashboard.overallHealthScore} />
                <p className="text-xs text-muted-foreground mt-2">Overall Health</p>
              </CardContent>
            </Card>

            <Card data-testid="card-value-realization">
              <CardContent className="pt-6">
                <div className="text-center">
                  <DollarSign className="w-5 h-5 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold font-mono text-primary">
                    {formatCurrency(valueMetrics.realized)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    of {formatCurrency(valueMetrics.promised)} promised
                  </div>
                  <Progress value={valueMetrics.realizationPercent} className="h-1.5 mt-3" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {valueMetrics.realizationPercent}% realized
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-kpi-breakdown">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>On Track</span>
                    </div>
                    <span className="font-bold">{healthBreakdown.onTrack}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>At Risk</span>
                    </div>
                    <span className="font-bold">{healthBreakdown.atRisk}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-destructive" />
                      <span>Off Track</span>
                    </div>
                    <span className="font-bold">{healthBreakdown.offTrack}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                      <span>No Data</span>
                    </div>
                    <span className="font-bold">{healthBreakdown.noData}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-milestones">
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-xl font-bold text-primary">{milestonesSummary.achieved}</div>
                    <div className="text-[10px] text-muted-foreground">Achieved</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-amber-500">{milestonesSummary.planned}</div>
                    <div className="text-[10px] text-muted-foreground">Planned</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-destructive">{milestonesSummary.missed}</div>
                    <div className="text-[10px] text-muted-foreground">Missed</div>
                  </div>
                </div>
                {dashboard.nextReviewDate && (
                  <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    Next Review: {format(new Date(dashboard.nextReviewDate), 'MMM d')}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <AlertsSection alerts={alerts} />

          <Card data-testid="card-kpi-performance">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  KPI Performance
                </CardTitle>
                <Badge variant="outline">{kpiDetails.length} KPIs</Badge>
              </div>
              <CardDescription>
                Track progress against baselines and targets. Click any KPI to expand details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sortedKPIs.map(kpi => (
                  <KPIStatusRow 
                    key={kpi.id} 
                    kpi={kpi} 
                    onRecordMeasurement={() => handleRecordMeasurement(kpi)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <FinancialSummary projectId={projectId} />

          {analyticsSignedOff && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-semibold text-primary">Analytics Sign-off Complete</p>
                    <p className="text-sm text-muted-foreground">
                      Your value realization report has been approved and is ready for export.
                    </p>
                  </div>
                  <Button className="ml-auto" data-testid="button-export-final">
                    <FileText className="w-4 h-4 mr-2" />
                    Export Final Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {showRecordDialog && selectedKPIForMeasurement && (
        <RecordMeasurementDialog
          kpi={selectedKPIForMeasurement}
          open={showRecordDialog}
          onOpenChange={setShowRecordDialog}
          onSuccess={() => {
            setShowRecordDialog(false);
            setSelectedKPIForMeasurement(null);
          }}
        />
      )}
    </div>
  );
}
