import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Edit3, 
  Save, 
  RotateCcw, 
  DollarSign, 
  Target, 
  AlertCircle, 
  CheckCircle2, 
  Activity, 
  TrendingUp,
  Calendar,
  Users,
  BarChart3,
  Layers,
  Bell,
  Clock,
  GripVertical
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, DashboardLayout, WidgetConfig, LayoutItem } from "@shared/schema";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

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

interface StrategicPillar {
  id: number;
  name: string;
  projectId: number;
}

interface JobTheme {
  id: number;
  pillarId: number | null;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "value-summary", type: "value-summary", title: "Value Summary", visible: true },
  { id: "kpi-status-chart", type: "kpi-status-chart", title: "KPI Status", visible: true },
  { id: "confidence-gauge", type: "confidence-gauge", title: "Confidence Level", visible: true },
  { id: "client-sentiment", type: "client-sentiment", title: "Client Sentiment", visible: true },
  { id: "upcoming-reviews", type: "upcoming-reviews", title: "Upcoming Reviews", visible: true },
  { id: "risk-alerts", type: "risk-alerts", title: "Risk Alerts", visible: true },
  { id: "strategic-coverage", type: "strategic-coverage", title: "Strategic Coverage", visible: true },
  { id: "recent-activity", type: "recent-activity", title: "Recent Activity", visible: true },
];

const DEFAULT_LAYOUTS = {
  lg: [
    { i: "value-summary", x: 0, y: 0, w: 12, h: 3, minW: 6, minH: 2 },
    { i: "kpi-status-chart", x: 0, y: 3, w: 4, h: 4, minW: 3, minH: 3 },
    { i: "confidence-gauge", x: 4, y: 3, w: 4, h: 4, minW: 2, minH: 2 },
    { i: "client-sentiment", x: 8, y: 3, w: 4, h: 4, minW: 2, minH: 2 },
    { i: "risk-alerts", x: 0, y: 7, w: 6, h: 4, minW: 3, minH: 3 },
    { i: "upcoming-reviews", x: 6, y: 7, w: 6, h: 4, minW: 3, minH: 3 },
    { i: "strategic-coverage", x: 0, y: 11, w: 6, h: 4, minW: 3, minH: 3 },
    { i: "recent-activity", x: 6, y: 11, w: 6, h: 4, minW: 3, minH: 3 },
  ],
  md: [
    { i: "value-summary", x: 0, y: 0, w: 8, h: 3, minW: 4, minH: 2 },
    { i: "kpi-status-chart", x: 0, y: 3, w: 4, h: 4, minW: 3, minH: 3 },
    { i: "confidence-gauge", x: 4, y: 3, w: 4, h: 4, minW: 2, minH: 2 },
    { i: "client-sentiment", x: 0, y: 7, w: 4, h: 4, minW: 2, minH: 2 },
    { i: "risk-alerts", x: 4, y: 7, w: 4, h: 4, minW: 3, minH: 3 },
    { i: "upcoming-reviews", x: 0, y: 11, w: 4, h: 4, minW: 3, minH: 3 },
    { i: "strategic-coverage", x: 4, y: 11, w: 4, h: 4, minW: 3, minH: 3 },
    { i: "recent-activity", x: 0, y: 15, w: 8, h: 4, minW: 4, minH: 3 },
  ],
  sm: [
    { i: "value-summary", x: 0, y: 0, w: 1, h: 4, minW: 1, minH: 3 },
    { i: "kpi-status-chart", x: 0, y: 4, w: 1, h: 5, minW: 1, minH: 4 },
    { i: "confidence-gauge", x: 0, y: 9, w: 1, h: 3, minW: 1, minH: 2 },
    { i: "client-sentiment", x: 0, y: 12, w: 1, h: 3, minW: 1, minH: 2 },
    { i: "risk-alerts", x: 0, y: 15, w: 1, h: 4, minW: 1, minH: 3 },
    { i: "upcoming-reviews", x: 0, y: 19, w: 1, h: 4, minW: 1, minH: 3 },
    { i: "strategic-coverage", x: 0, y: 23, w: 1, h: 4, minW: 1, minH: 3 },
    { i: "recent-activity", x: 0, y: 27, w: 1, h: 4, minW: 1, minH: 3 },
  ],
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface WidgetProps {
  metrics: ProjectValueMetrics | null;
  pillars?: StrategicPillar[];
  jobs?: JobTheme[];
  isEditMode: boolean;
}

function ValueSummaryWidget({ metrics, isEditMode }: WidgetProps) {
  if (!metrics) {
    return <WidgetSkeleton />;
  }

  const { totalValuePromised, totalValueRealized } = metrics;
  const valueGap = totalValuePromised - totalValueRealized;
  const valueRealizedPercent = totalValuePromised > 0 
    ? Math.round((totalValueRealized / totalValuePromised) * 100) 
    : 0;

  return (
    <Card className={`h-full border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 ${isEditMode ? 'cursor-move' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          Value Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Value Promised</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalValuePromised)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Value Realized</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValueRealized)}</p>
            <Progress value={valueRealizedPercent} className="h-1.5 mt-1" />
            <p className="text-xs text-muted-foreground">{valueRealizedPercent}% delivered</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Remaining Gap</p>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(valueGap)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function KPIStatusChartWidget({ metrics, isEditMode }: WidgetProps) {
  if (!metrics) {
    return <WidgetSkeleton />;
  }

  const { kpisOnTrack, kpisAtRisk, kpisOffTrack, kpisNoData } = metrics;
  const statusData = [
    { name: 'On Track', value: kpisOnTrack, color: '#10b981' },
    { name: 'At Risk', value: kpisAtRisk, color: '#f59e0b' },
    { name: 'Off Track', value: kpisOffTrack, color: '#ef4444' },
    { name: 'No Data', value: kpisNoData, color: '#9ca3af' },
  ].filter(item => item.value > 0);

  return (
    <Card className={`h-full ${isEditMode ? 'cursor-move' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          KPI Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {statusData.length > 0 ? (
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={60}
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
          <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
            No KPI data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ConfidenceGaugeWidget({ metrics, isEditMode }: WidgetProps) {
  if (!metrics) {
    return <WidgetSkeleton />;
  }

  const { confidenceLevel, overallProgressPercent } = metrics;

  return (
    <Card className={`h-full ${isEditMode ? 'cursor-move' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Confidence & Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">KPI Progress</span>
              <span className="text-2xl font-bold text-primary">{overallProgressPercent}%</span>
            </div>
            <Progress value={overallProgressPercent} className="h-2" />
          </div>
          {confidenceLevel !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Data Confidence</span>
                <span className="text-2xl font-bold text-blue-600">{confidenceLevel}%</span>
              </div>
              <Progress value={confidenceLevel} className="h-2 [&>div]:bg-blue-500" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ClientSentimentWidget({ metrics, isEditMode }: WidgetProps) {
  if (!metrics) {
    return <WidgetSkeleton />;
  }

  const { clientSentimentAvg } = metrics;
  const sentiment = clientSentimentAvg ?? 0;
  const sentimentLabel = sentiment >= 4 ? "Positive" : sentiment >= 3 ? "Neutral" : "Needs Attention";
  const sentimentColor = sentiment >= 4 ? "text-green-600" : sentiment >= 3 ? "text-yellow-600" : "text-red-600";

  return (
    <Card className={`h-full ${isEditMode ? 'cursor-move' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Client Sentiment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-[120px]">
          <div className={`text-4xl font-bold ${sentimentColor}`}>
            {sentiment > 0 ? sentiment.toFixed(1) : "—"}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{sentimentLabel}</p>
          <div className="flex gap-1 mt-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <div
                key={star}
                className={`w-3 h-3 rounded-full ${
                  star <= Math.round(sentiment) ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RiskAlertsWidget({ metrics, isEditMode }: WidgetProps) {
  if (!metrics) {
    return <WidgetSkeleton />;
  }

  const { kpisAtRisk, kpisOffTrack, kpisNoData } = metrics;
  const totalAtRisk = kpisAtRisk + kpisOffTrack;

  return (
    <Card className={`h-full border-orange-200 dark:border-orange-800 ${isEditMode ? 'cursor-move' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          Risk Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {totalAtRisk > 0 ? (
            <>
              <div className="flex items-center justify-between p-2 rounded bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <span className="text-sm">KPIs Needing Attention</span>
                <Badge variant="outline" className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300">
                  {totalAtRisk}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                  <div className="text-xl font-bold text-yellow-600">{kpisAtRisk}</div>
                  <div className="text-xs text-muted-foreground">At Risk</div>
                </div>
                <div className="p-2 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="text-xl font-bold text-red-600">{kpisOffTrack}</div>
                  <div className="text-xs text-muted-foreground">Off Track</div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-300">All KPIs on track</span>
            </div>
          )}
          {kpisNoData > 0 && (
            <div className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <span className="text-sm text-muted-foreground">Missing data</span>
              <Badge variant="outline">{kpisNoData} KPIs</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function UpcomingReviewsWidget({ metrics, isEditMode }: WidgetProps) {
  if (!metrics) {
    return <WidgetSkeleton />;
  }

  const { nextReviewDate, lastReviewDate } = metrics;

  return (
    <Card className={`h-full ${isEditMode ? 'cursor-move' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Business Reviews
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {nextReviewDate ? (
            <div className="p-3 rounded bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Next Review</span>
              </div>
              <p className="text-lg font-semibold">
                {new Date(nextReviewDate).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          ) : (
            <div className="p-3 rounded bg-muted/50 border border-muted text-center">
              <p className="text-sm text-muted-foreground">No upcoming review scheduled</p>
            </div>
          )}
          {lastReviewDate && (
            <div className="text-xs text-muted-foreground">
              Last review: {new Date(lastReviewDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StrategicCoverageWidget({ pillars, jobs, isEditMode }: WidgetProps) {
  const pillarCount = pillars?.length || 0;
  const jobCount = jobs?.length || 0;
  const linkedJobs = jobs?.filter(j => j.pillarId !== null).length || 0;
  const coveragePercent = pillarCount > 0 ? Math.round((linkedJobs / Math.max(jobCount, 1)) * 100) : 0;

  return (
    <Card className={`h-full ${isEditMode ? 'cursor-move' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-600" />
          Strategic Coverage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 rounded bg-muted/50">
              <div className="text-2xl font-bold text-primary">{pillarCount}</div>
              <div className="text-xs text-muted-foreground">Strategic Pillars</div>
            </div>
            <div className="text-center p-3 rounded bg-muted/50">
              <div className="text-2xl font-bold text-cyan-600">{jobCount}</div>
              <div className="text-xs text-muted-foreground">Jobs Identified</div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pillar Linkage</span>
              <span className="font-medium">{linkedJobs}/{jobCount} linked</span>
            </div>
            <Progress value={coveragePercent} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentActivityWidget({ isEditMode }: WidgetProps) {
  return (
    <Card className={`h-full ${isEditMode ? 'cursor-move' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm">Dashboard customization enabled</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-sm">Drag widgets to rearrange</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-sm">Click Edit to customize layout</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WidgetSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id || "0");
  
  const { toast } = useToast();
  const [isEditMode, setIsEditMode] = useState(false);
  const [layouts, setLayouts] = useState<Record<string, LayoutItem[]>>(DEFAULT_LAYOUTS);
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery<ProjectValueMetrics>({
    queryKey: [`/api/projects/${projectId}/realization/metrics`],
    enabled: !!projectId,
  });

  const { data: pillars } = useQuery<StrategicPillar[]>({
    queryKey: [`/api/projects/${projectId}/strategic-pillars`],
    enabled: !!projectId,
  });

  const { data: jobThemes } = useQuery<JobTheme[]>({
    queryKey: [`/api/projects/${projectId}/job-themes`],
    enabled: !!projectId,
  });

  const { data: savedLayout } = useQuery<DashboardLayout | { layout: null }>({
    queryKey: [`/api/projects/${projectId}/dashboard-layout`],
    enabled: !!projectId,
  });

  const saveLayoutMutation = useMutation({
    mutationFn: async (data: { layoutConfig: Record<string, LayoutItem[]>; widgets: WidgetConfig[] }) => {
      const res = await apiRequest("PUT", `/api/projects/${projectId}/dashboard-layout`, data);
      if (!res.ok) throw new Error("Failed to save layout");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/dashboard-layout`] });
      setHasUnsavedChanges(false);
      toast({ title: "Dashboard layout saved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save layout", variant: "destructive" });
    },
  });

  useEffect(() => {
    if (savedLayout && 'layoutConfig' in savedLayout && savedLayout.layoutConfig) {
      setLayouts(savedLayout.layoutConfig as Record<string, LayoutItem[]>);
      setWidgets(savedLayout.widgets as WidgetConfig[]);
    }
  }, [savedLayout]);

  const handleLayoutChange = useCallback((currentLayout: LayoutItem[], allLayouts: Record<string, LayoutItem[]>) => {
    if (isEditMode) {
      setLayouts(allLayouts);
      setHasUnsavedChanges(true);
    }
  }, [isEditMode]);

  const handleSave = useCallback(() => {
    saveLayoutMutation.mutate({ layoutConfig: layouts, widgets });
    setIsEditMode(false);
  }, [layouts, widgets, saveLayoutMutation]);

  const handleReset = useCallback(() => {
    setLayouts(DEFAULT_LAYOUTS);
    setWidgets(DEFAULT_WIDGETS);
    setHasUnsavedChanges(true);
  }, []);

  const renderWidget = useCallback((widget: WidgetConfig) => {
    if (!widget.visible) return null;

    const widgetProps: WidgetProps = {
      metrics: metrics || null,
      pillars,
      jobs: jobThemes,
      isEditMode,
    };

    switch (widget.type) {
      case "value-summary":
        return <ValueSummaryWidget {...widgetProps} />;
      case "kpi-status-chart":
        return <KPIStatusChartWidget {...widgetProps} />;
      case "confidence-gauge":
        return <ConfidenceGaugeWidget {...widgetProps} />;
      case "client-sentiment":
        return <ClientSentimentWidget {...widgetProps} />;
      case "upcoming-reviews":
        return <UpcomingReviewsWidget {...widgetProps} />;
      case "risk-alerts":
        return <RiskAlertsWidget {...widgetProps} />;
      case "strategic-coverage":
        return <StrategicCoverageWidget {...widgetProps} />;
      case "recent-activity":
        return <RecentActivityWidget {...widgetProps} />;
      default:
        return null;
    }
  }, [metrics, pillars, jobThemes, isEditMode]);

  if (!projectId) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-muted-foreground">Invalid project ID</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <Link href={`/projects/${projectId}/realisation`}>
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Realization
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">{project?.name || "Dashboard"}</h1>
                <p className="text-sm text-muted-foreground">{project?.companyName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Edit Mode</span>
                <Switch
                  checked={isEditMode}
                  onCheckedChange={setIsEditMode}
                  data-testid="switch-edit-mode"
                />
              </div>
              
              {isEditMode && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    data-testid="button-reset-layout"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saveLayoutMutation.isPending}
                    data-testid="button-save-layout"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saveLayoutMutation.isPending ? "Saving..." : "Save Layout"}
                  </Button>
                </>
              )}
              
              {hasUnsavedChanges && !isEditMode && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                  Unsaved changes
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {isEditMode && (
          <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <GripVertical className="w-4 h-4" />
              <span className="text-sm">Drag widgets to rearrange. Resize by dragging corners. Click Save when done.</span>
            </div>
          </div>
        )}

        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 768, sm: 480 }}
          cols={{ lg: 12, md: 8, sm: 1 }}
          rowHeight={60}
          onLayoutChange={handleLayoutChange}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          useCSSTransforms={true}
        >
          {widgets.filter(w => w.visible).map((widget) => (
            <div key={widget.id} data-testid={`widget-${widget.id}`}>
              {renderWidget(widget)}
            </div>
          ))}
        </ResponsiveGridLayout>
      </main>
    </div>
  );
}
