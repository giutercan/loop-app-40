import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  BarChart3, 
  FileText, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Lightbulb,
  Briefcase,
  RefreshCcw,
  Star,
  LineChart,
  PieChart,
  ArrowUpRight
} from "lucide-react";

export type Role = "all" | "sales" | "consultant" | "delivery" | "csm" | "client_sponsor";
export type LifecyclePhase = "all" | "discover_qualify" | "shape_sell" | "deliver_realise" | "review_renew" | "learn_scale";

interface Initiative {
  id: number;
  name: string;
  status: string;
  lifecyclePhase: string | null;
  ragStatus: string | null;
  owner: string | null;
  phase: string;
}

interface KPI {
  id: number;
  name: string;
  status: string;
  baselineValue: number | null;
  targetValue: number | null;
  currentValue: number | null;
  initiativeId: number;
}

interface Issue {
  id: number;
  title: string;
  severity: string;
  status: string;
  type: string;
}

interface ValueMetrics {
  totalValuePromised: number;
  totalValueRealized: number;
  realizationPercent: number;
}

interface RolePanelProps {
  role: Role;
  phase: LifecyclePhase;
  initiatives: Initiative[];
  kpis: KPI[];
  issues: Issue[];
  valueMetrics: ValueMetrics;
  onActionClick?: (action: string, context?: any) => void;
}

const phaseLabels: Record<LifecyclePhase, string> = {
  all: "All Phases",
  discover_qualify: "Discover & Qualify",
  shape_sell: "Shape & Sell",
  deliver_realise: "Deliver & Realise",
  review_renew: "Review & Renew",
  learn_scale: "Learn & Scale"
};

const roleLabels: Record<Role, string> = {
  all: "All Roles",
  sales: "Sales",
  consultant: "Consultant",
  delivery: "Delivery",
  csm: "Customer Success",
  client_sponsor: "Client Sponsor"
};

export function RolePanel({ 
  role, 
  phase, 
  initiatives, 
  kpis, 
  issues, 
  valueMetrics,
  onActionClick 
}: RolePanelProps) {
  
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const kpisOnTrack = kpis.filter(k => k.status === "on-track").length;
  const kpisAtRisk = kpis.filter(k => k.status === "at-risk").length;
  const kpisOffTrack = kpis.filter(k => k.status === "off-track").length;
  const openIssues = issues.filter(i => i.status === "open" || i.status === "in_progress");
  const criticalIssues = issues.filter(i => i.severity === "critical" && (i.status === "open" || i.status === "in_progress"));
  
  const activeInitiatives = initiatives.filter(i => 
    i.status !== "completed" && i.status !== "closed" && i.status !== "cancelled"
  ).length;
  const completedInitiatives = initiatives.filter(i => i.status === "completed").length;

  if (role === "all") {
    return null;
  }

  const renderSalesView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Sales Dashboard</h3>
        </div>
        {phase !== "all" && (
          <Badge variant="outline">{phaseLabels[phase]}</Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="hover-elevate">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Value Promised</p>
                <p className="text-xl font-bold">{formatCurrency(valueMetrics.totalValuePromised)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-elevate">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Deals</p>
                <p className="text-xl font-bold">{activeInitiatives}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {(phase === "all" || phase === "discover_qualify" || phase === "shape_sell") && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pipeline Actions</CardTitle>
            <CardDescription>Key actions for your current opportunities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => onActionClick?.("create_value_case")}
              data-testid="button-create-value-case-sales"
            >
              <FileText className="w-4 h-4" />
              Create Value Case
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => onActionClick?.("schedule_discovery")}
              data-testid="button-schedule-discovery-sales"
            >
              <Lightbulb className="w-4 h-4" />
              Schedule Discovery Session
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => onActionClick?.("view_success_stories")}
              data-testid="button-view-success-stories-sales"
            >
              <Star className="w-4 h-4" />
              Browse Success Stories
            </Button>
          </CardContent>
        </Card>
      )}

      {criticalIssues.length > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">{criticalIssues.length} Critical Issue{criticalIssues.length > 1 ? "s" : ""}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Attention needed on account risks</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderConsultantView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Consultant Workspace</h3>
        </div>
        {phase !== "all" && (
          <Badge variant="outline">{phaseLabels[phase]}</Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="hover-elevate">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">KPIs Tracked</p>
                <p className="text-xl font-bold">{kpis.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-elevate">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Realized Value</p>
                <p className="text-xl font-bold">{valueMetrics.realizationPercent}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Discovery & Alignment</CardTitle>
          <CardDescription>Build and refine value cases</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
            onClick={() => onActionClick?.("start_discovery")}
            data-testid="button-start-discovery-consultant"
          >
            <Lightbulb className="w-4 h-4" />
            Conduct Discovery Research
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
            onClick={() => onActionClick?.("build_value_case")}
            data-testid="button-build-value-case-consultant"
          >
            <FileText className="w-4 h-4" />
            Build Value Case
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
            onClick={() => onActionClick?.("set_kpi_targets")}
            data-testid="button-set-kpi-targets-consultant"
          >
            <Target className="w-4 h-4" />
            Define KPI Targets
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">KPI Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm">{kpisOnTrack} On Track</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm">{kpisAtRisk} At Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm">{kpisOffTrack} Off Track</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDeliveryView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LineChart className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Delivery Dashboard</h3>
        </div>
        {phase !== "all" && (
          <Badge variant="outline">{phaseLabels[phase]}</Badge>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="hover-elevate">
          <CardContent className="pt-4 text-center">
            <div className="w-10 h-10 rounded-full mx-auto bg-green-500/10 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold">{kpisOnTrack}</p>
            <p className="text-xs text-muted-foreground">On Track</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="pt-4 text-center">
            <div className="w-10 h-10 rounded-full mx-auto bg-yellow-500/10 flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold">{kpisAtRisk}</p>
            <p className="text-xs text-muted-foreground">At Risk</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="pt-4 text-center">
            <div className="w-10 h-10 rounded-full mx-auto bg-red-500/10 flex items-center justify-center mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold">{kpisOffTrack}</p>
            <p className="text-xs text-muted-foreground">Off Track</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Execution Actions</CardTitle>
          <CardDescription>Track progress and log actuals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
            onClick={() => onActionClick?.("log_kpi_actual")}
            data-testid="button-log-kpi-actual-delivery"
          >
            <BarChart3 className="w-4 h-4" />
            Log KPI Measurement
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
            onClick={() => onActionClick?.("update_initiative_status")}
            data-testid="button-update-status-delivery"
          >
            <RefreshCcw className="w-4 h-4" />
            Update Initiative Status
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
            onClick={() => onActionClick?.("flag_risk")}
            data-testid="button-flag-risk-delivery"
          >
            <AlertTriangle className="w-4 h-4" />
            Flag Risk or Blocker
          </Button>
        </CardContent>
      </Card>

      {openIssues.length > 0 && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium">{openIssues.length} Open Issue{openIssues.length > 1 ? "s" : ""}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onActionClick?.("view_issues")}
                data-testid="button-view-issues-delivery"
              >
                View All
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCSMView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Customer Success View</h3>
        </div>
        {phase !== "all" && (
          <Badge variant="outline">{phaseLabels[phase]}</Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="hover-elevate">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Value Delivered</p>
                <p className="text-xl font-bold">{formatCurrency(valueMetrics.totalValueRealized)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-elevate">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Realization</p>
                <p className="text-xl font-bold">{valueMetrics.realizationPercent}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Promised vs Delivered</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Promised</span>
                <span className="font-medium">{formatCurrency(valueMetrics.totalValuePromised)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full">
                <div className="h-full bg-primary/40 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Delivered</span>
                <span className="font-medium">{formatCurrency(valueMetrics.totalValueRealized)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full">
                <div 
                  className="h-full bg-primary rounded-full" 
                  style={{ width: `${Math.min(valueMetrics.realizationPercent, 100)}%` }} 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Renewal & Expansion</CardTitle>
          <CardDescription>Actions for customer growth</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
            onClick={() => onActionClick?.("prepare_qbr")}
            data-testid="button-prepare-qbr-csm"
          >
            <FileText className="w-4 h-4" />
            Prepare QBR Summary
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
            onClick={() => onActionClick?.("identify_expansion")}
            data-testid="button-identify-expansion-csm"
          >
            <TrendingUp className="w-4 h-4" />
            Identify Expansion Opportunities
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
            onClick={() => onActionClick?.("create_success_story")}
            data-testid="button-create-success-story-csm"
          >
            <Star className="w-4 h-4" />
            Document Success Story
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderClientSponsorView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Executive Summary</h3>
        </div>
        {phase !== "all" && (
          <Badge variant="outline">{phaseLabels[phase]}</Badge>
        )}
      </div>

      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Value Realized to Date</p>
            <p className="text-4xl font-bold text-primary">{formatCurrency(valueMetrics.totalValueRealized)}</p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-muted-foreground">of {formatCurrency(valueMetrics.totalValuePromised)} promised</span>
              <Badge variant="outline" className="bg-background">
                {valueMetrics.realizationPercent}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="hover-elevate">
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold">{completedInitiatives}</p>
            <p className="text-sm text-muted-foreground">Completed Initiatives</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold">{activeInitiatives}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">KPI Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm">Meeting Targets</span>
              </div>
              <span className="font-medium">{kpisOnTrack}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-sm">Needs Attention</span>
              </div>
              <span className="font-medium">{kpisAtRisk}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm">Behind Target</span>
              </div>
              <span className="font-medium">{kpisOffTrack}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {criticalIssues.length > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">{criticalIssues.length} Critical Issue{criticalIssues.length > 1 ? "s" : ""} Requiring Attention</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div data-testid={`role-panel-${role}`} className="p-4">
      {role === "sales" && renderSalesView()}
      {role === "consultant" && renderConsultantView()}
      {role === "delivery" && renderDeliveryView()}
      {role === "csm" && renderCSMView()}
      {role === "client_sponsor" && renderClientSponsorView()}
    </div>
  );
}

export { phaseLabels, roleLabels };
