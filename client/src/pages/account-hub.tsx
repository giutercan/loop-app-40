import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useRoute, useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft,
  Building2, 
  TrendingUp, 
  Target, 
  Activity,
  ArrowRight,
  Users,
  Briefcase,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  ChevronRight,
  Star,
  Zap,
  Plus,
  AlertTriangle,
  TrendingDown,
  Minus,
  CircleDot,
  Circle,
  Search,
  Lightbulb,
  Handshake,
  Rocket,
  RefreshCw,
  GraduationCap,
  Filter,
  Eye,
  MessageSquare,
  Calendar,
  ArrowUpRight,
  Sparkles,
  Shield,
  Flag,
  Trophy,
  Bell
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AppTour } from "@/components/AppTour";
import { LoopContextIndicator } from "@/components/LoopContextIndicator";

interface InitiativeSummary {
  id: number;
  name: string;
  clientName: string | null;
  lifecyclePhase: string | null;
  discoveryFinalized: boolean;
  kpiCount: number;
  kpisOnTrack: number;
  kpisAtRisk: number;
  kpisNoData: number;
  promisedValue: number | null;
  realizedValue: number | null;
}

interface KPISummary {
  id: number;
  name: string;
  unit: string;
  initiativeId: number;
  initiativeName: string;
  jobName: string | null;
  baseline: string | null;
  target: string | null;
  current: string | null;
  status: "on-track" | "at-risk" | "off-track" | "no-data";
  promisedValue: number | null;
  realizedValue: number | null;
}

interface AccountIssue {
  id: number;
  title: string;
  type: "issue" | "risk" | "opportunity";
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "in_progress" | "resolved" | "closed";
  solutionArea: string | null;
  estimatedValue: number | null;
  owner: string | null;
  dueDate: string | null;
}

interface TeamRole {
  id: number;
  userName: string;
  userEmail: string | null;
  role: "sales" | "consultant" | "delivery" | "csm" | "client_sponsor";
  isPrimary: boolean;
}

interface ActivityItem {
  id: string;
  type: "insight" | "kpi_update" | "meeting" | "deliverable" | "milestone" | "risk" | "win";
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
  metadata?: Record<string, any>;
}

type ViewMode = "executive" | "manager" | "detailed";

interface AccountHubData {
  account: {
    id: number;
    name: string;
    industry: string | null;
    tier: "enterprise" | "strategic" | "growth" | null;
    companyLogoUrl: string | null;
    healthScore: number | null;
    strategyNotes: string | null;
    okrSummary: string | null;
    accountOwner: string | null;
    clientSponsor: string | null;
    contractStartDate: string | null;
    contractEndDate: string | null;
    annualContractValue: string | null;
    totalValuePromised: number | null;
    totalValueRealized: number | null;
    lastQbrDate: string | null;
    nextQbrDate: string | null;
  };
  initiatives: InitiativeSummary[];
  kpis: KPISummary[];
  issues: AccountIssue[];
  teamRoles: TeamRole[];
  headlineValue: {
    totalPromised: number;
    totalRealized: number;
    realizationRate: number;
    initiativesCount: number;
    initiativesActive: number;
    kpisTotal: number;
    kpisOnTrack: number;
    kpisAtRisk: number;
  };
}

const lifecyclePhases = [
  { 
    id: "discover_qualify", 
    label: "Discover & Qualify", 
    shortLabel: "Discover",
    icon: Search, 
    description: "Understanding client needs and qualifying opportunities",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    borderColor: "border-blue-300 dark:border-blue-700"
  },
  { 
    id: "shape_sell", 
    label: "Shape & Sell", 
    shortLabel: "Shape",
    icon: Lightbulb, 
    description: "Designing solutions and building value cases",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    borderColor: "border-purple-300 dark:border-purple-700"
  },
  { 
    id: "deliver_realise", 
    label: "Deliver & Realise", 
    shortLabel: "Deliver",
    icon: Rocket, 
    description: "Implementing and delivering promised value",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    borderColor: "border-emerald-300 dark:border-emerald-700"
  },
  { 
    id: "review_renew", 
    label: "Review & Renew", 
    shortLabel: "Review",
    icon: RefreshCw, 
    description: "Evaluating outcomes and expanding opportunities",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    borderColor: "border-amber-300 dark:border-amber-700"
  },
  { 
    id: "learn_scale", 
    label: "Learn & Scale", 
    shortLabel: "Scale",
    icon: GraduationCap, 
    description: "Capturing learnings and scaling success",
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-100 dark:bg-teal-900/30",
    borderColor: "border-teal-300 dark:border-teal-700"
  },
];

const tierColors: Record<string, string> = {
  enterprise: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  strategic: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  growth: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
};

const roleLabels: Record<string, string> = {
  sales: "Sales",
  consultant: "Consultant", 
  delivery: "Delivery",
  csm: "CSM",
  client_sponsor: "Client Sponsor"
};

const severityColors: Record<string, string> = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const statusColors: Record<string, string> = {
  "on-track": "text-emerald-600",
  "at-risk": "text-amber-600",
  "off-track": "text-red-600",
  "no-data": "text-muted-foreground"
};

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "$0";
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

function getHealthStatus(score: number | null): { label: string; color: string } {
  if (score === null) return { label: "No Data", color: "text-muted-foreground" };
  if (score >= 70) return { label: "Healthy", color: "text-emerald-600" };
  if (score >= 40) return { label: "At Risk", color: "text-amber-600" };
  return { label: "Critical", color: "text-red-600" };
}

function getPhaseIndex(phase: string | null): number {
  if (!phase) return 0;
  return lifecyclePhases.findIndex(p => p.id === phase);
}

// Generate mock activity data based on real account data
function generateActivityFeed(hubData: AccountHubData): ActivityItem[] {
  const activities: ActivityItem[] = [];
  const now = new Date();
  
  // Generate activities based on real data patterns
  if (hubData.kpis.length > 0) {
    const recentKpi = hubData.kpis[0];
    activities.push({
      id: `kpi-${recentKpi.id}`,
      type: "kpi_update",
      title: `KPI Updated: ${recentKpi.name}`,
      description: `Current value: ${recentKpi.current || 'Pending'} | Target: ${recentKpi.target || 'TBD'}`,
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      user: "System"
    });
  }
  
  if (hubData.initiatives.length > 0) {
    const initiative = hubData.initiatives[0];
    activities.push({
      id: `init-${initiative.id}`,
      type: "milestone",
      title: `Initiative Progress: ${initiative.name}`,
      description: `${initiative.kpisOnTrack} of ${initiative.kpiCount} KPIs on track`,
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000),
    });
  }
  
  if (hubData.issues.length > 0) {
    const issue = hubData.issues[0];
    activities.push({
      id: `issue-${issue.id}`,
      type: issue.type === "opportunity" ? "win" : "risk",
      title: issue.title,
      description: `${issue.severity} priority | ${issue.status}`,
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000),
    });
  }
  
  // Add some contextual activities
  activities.push({
    id: "insight-1",
    type: "insight",
    title: "New Discovery Insight",
    description: "AI identified potential value driver in sales operations",
    timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    user: "AI Research"
  });
  
  if (hubData.account.nextQbrDate) {
    activities.push({
      id: "meeting-qbr",
      type: "meeting",
      title: "Upcoming QBR Scheduled",
      description: `Business review on ${new Date(hubData.account.nextQbrDate).toLocaleDateString()}`,
      timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000),
    });
  }
  
  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

function getActivityIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "insight": return { icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30" };
    case "kpi_update": return { icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/30" };
    case "meeting": return { icon: Calendar, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" };
    case "deliverable": return { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/30" };
    case "milestone": return { icon: Flag, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30" };
    case "risk": return { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30" };
    case "win": return { icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30" };
    default: return { icon: Activity, color: "text-muted-foreground", bg: "bg-muted" };
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function AccountHub() {
  const [, params] = useRoute("/accounts/:id/hub");
  const accountId = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("executive");

  const { data: hubData, isLoading, error } = useQuery<AccountHubData>({
    queryKey: ["/api/accounts", accountId, "hub"],
    queryFn: async () => {
      const response = await fetch(`/api/accounts/${accountId}/hub`);
      if (!response.ok) throw new Error("Failed to fetch account hub data");
      return response.json();
    },
    enabled: accountId > 0
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading account hub...</p>
        </div>
      </div>
    );
  }

  if (error || !hubData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
              <h2 className="text-lg font-semibold">Failed to load account</h2>
              <p className="text-muted-foreground">
                {error instanceof Error ? error.message : "Unable to fetch account data"}
              </p>
              <Button variant="outline" onClick={() => setLocation("/accounts")} data-testid="button-back-accounts-error">
                Back to Accounts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { account, initiatives, kpis, issues, teamRoles, headlineValue } = hubData;
  const activityFeed = generateActivityFeed(hubData);

  // Filter initiatives by lifecycle phase
  const filteredInitiatives = phaseFilter === "all" 
    ? initiatives 
    : initiatives.filter(i => i.lifecyclePhase === phaseFilter);

  // Count initiatives per phase for the stepper
  const initiativesByPhase = lifecyclePhases.map(phase => ({
    ...phase,
    count: initiatives.filter(i => i.lifecyclePhase === phase.id).length
  }));

  // Determine the current (most advanced) phase
  const activePhaseIndex = Math.max(
    ...initiatives.map(i => getPhaseIndex(i.lifecyclePhase)),
    0
  );

  // Calculate days until next QBR
  const daysUntilQbr = account.nextQbrDate 
    ? Math.ceil((new Date(account.nextQbrDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Get critical issues count
  const criticalIssues = issues.filter(i => 
    (i.status === "open" || i.status === "in_progress") && 
    (i.severity === "critical" || i.severity === "high")
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 space-y-6">
        {/* Enhanced Header with Back Navigation and Actions */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/accounts")} data-testid="button-back-accounts">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold" data-testid="text-account-name">{account.name}</h1>
                {account.tier && (
                  <Badge className={tierColors[account.tier]} data-testid="badge-account-tier">
                    {account.tier.charAt(0).toUpperCase() + account.tier.slice(1)}
                  </Badge>
                )}
                <LoopContextIndicator />
              </div>
              <p className="text-muted-foreground">
                {account.industry || "No industry specified"} 
                {account.accountOwner && <span className="ml-2"> | Owned by {account.accountOwner}</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 border rounded-md p-1 bg-muted/50" data-testid="container-view-mode">
              <Button 
                variant={viewMode === "executive" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setViewMode("executive")}
                data-testid="button-view-executive"
              >
                <Eye className="w-3 h-3 mr-1" />
                Executive
              </Button>
              <Button 
                variant={viewMode === "manager" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setViewMode("manager")}
                data-testid="button-view-manager"
              >
                <Users className="w-3 h-3 mr-1" />
                Manager
              </Button>
              <Button 
                variant={viewMode === "detailed" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setViewMode("detailed")}
                data-testid="button-view-detailed"
              >
                <BarChart3 className="w-3 h-3 mr-1" />
                Detailed
              </Button>
            </div>
            <AppTour context="accountHub" />
            <Link href={`/accounts/${accountId}`}>
              <Button variant="outline" size="sm" data-testid="button-value-spine">
                <BarChart3 className="w-4 h-4 mr-2" />
                Value Spine
              </Button>
            </Link>
            <Link href={`/projects/new?accountId=${accountId}`}>
              <Button size="sm" data-testid="button-new-initiative">
                <Plus className="w-4 h-4 mr-2" />
                New Initiative
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Command Center Section */}
        <div className="grid gap-4 lg:grid-cols-12">
          {/* Health Score Gauge - Prominent */}
          <Card className="lg:col-span-3 bg-gradient-to-br from-card to-muted/20">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <p className="text-sm text-muted-foreground mb-3">Account Health</p>
                <div className="relative w-28 h-28 mb-3">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-muted"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(account.healthScore || 0) * 2.64} 264`}
                      className={getHealthStatus(account.healthScore).color}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold" data-testid="text-health-score-hero">
                    {account.healthScore ?? "-"}
                  </span>
                </div>
                <Badge 
                  className={`${getHealthStatus(account.healthScore).color === "text-emerald-600" 
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" 
                    : getHealthStatus(account.healthScore).color === "text-amber-600"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                    : getHealthStatus(account.healthScore).color === "text-red-600"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                    : "bg-muted"}`}
                  data-testid="badge-health-status"
                >
                  {getHealthStatus(account.healthScore).label}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Value Realization Progress */}
          <Card className="lg:col-span-5">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">Value Realization</p>
                  <Badge variant="outline" className="text-xs">
                    {headlineValue.realizationRate.toFixed(0)}% realized
                  </Badge>
                </div>
                
                {/* Value Bar Visualization */}
                <div className="relative h-8 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(headlineValue.realizationRate, 100)}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-4">
                    <span className="text-xs font-medium text-white drop-shadow-sm z-10">
                      {formatCurrency(headlineValue.totalRealized)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Promised</p>
                    <p className="text-lg font-bold" data-testid="text-promised-hero">{formatCurrency(headlineValue.totalPromised)}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Realized</p>
                    <p className="text-lg font-bold text-emerald-600" data-testid="text-realized-hero">{formatCurrency(headlineValue.totalRealized)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Grid */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-3">
            <Card className="hover-elevate">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="text-initiatives-hero">{headlineValue.initiativesActive}</p>
                    <p className="text-xs text-muted-foreground">Active Initiatives</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-elevate">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    headlineValue.kpisAtRisk > 0 
                      ? "bg-amber-100 dark:bg-amber-900/30" 
                      : "bg-emerald-100 dark:bg-emerald-900/30"
                  }`}>
                    <Target className={`w-5 h-5 ${
                      headlineValue.kpisAtRisk > 0 ? "text-amber-600" : "text-emerald-600"
                    }`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="text-kpis-hero">
                      {headlineValue.kpisOnTrack}/{headlineValue.kpisTotal}
                    </p>
                    <p className="text-xs text-muted-foreground">KPIs On Track</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-elevate">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    criticalIssues > 0 
                      ? "bg-red-100 dark:bg-red-900/30" 
                      : "bg-muted"
                  }`}>
                    <AlertTriangle className={`w-5 h-5 ${
                      criticalIssues > 0 ? "text-red-600" : "text-muted-foreground"
                    }`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="text-alerts-hero">{criticalIssues}</p>
                    <p className="text-xs text-muted-foreground">Needs Attention</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-elevate">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="text-qbr-hero">
                      {daysUntilQbr !== null ? (daysUntilQbr > 0 ? daysUntilQbr : "Now") : "-"}
                    </p>
                    <p className="text-xs text-muted-foreground">Days to QBR</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Activity Feed & Quick Context Section - Hidden in Executive view */}
        {viewMode !== "executive" && (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Activity Feed */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Recent Activity
                </CardTitle>
                <Badge variant="outline" className="text-xs">Live</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {activityFeed.map((activity) => {
                  const { icon: ActivityIcon, color, bg } = getActivityIcon(activity.type);
                  return (
                    <button 
                      key={activity.id}
                      className="flex items-start gap-3 p-2 rounded-md hover-elevate w-full text-left"
                      data-testid={`button-activity-${activity.id}`}
                    >
                      <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
                        <ActivityIcon className={`w-4 h-4 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {formatTimeAgo(activity.timestamp)}
                          {activity.user && ` | ${activity.user}`}
                        </p>
                      </div>
                    </button>
                  );
                })}
                {activityFeed.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Context Cards */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Account Snapshot
              </CardTitle>
              <CardDescription>What you need to know right now</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {/* What We Promised */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20" data-testid="card-promised-snapshot">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-primary" />
                    <p className="font-medium text-sm">What We Promised</p>
                  </div>
                  <p className="text-2xl font-bold mb-1" data-testid="text-promised-snapshot">{formatCurrency(headlineValue.totalPromised)}</p>
                  <p className="text-xs text-muted-foreground">
                    Across {headlineValue.initiativesCount} initiative{headlineValue.initiativesCount !== 1 ? "s" : ""} with {headlineValue.kpisTotal} KPIs
                  </p>
                </div>

                {/* What We've Delivered */}
                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20" data-testid="card-delivered-snapshot">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <p className="font-medium text-sm">What We've Delivered</p>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600 mb-1" data-testid="text-delivered-snapshot">{formatCurrency(headlineValue.totalRealized)}</p>
                  <p className="text-xs text-muted-foreground">
                    {headlineValue.kpisOnTrack} KPIs on track, {headlineValue.realizationRate.toFixed(0)}% realized
                  </p>
                </div>

                {/* Needs Attention */}
                <div 
                  className={`p-4 rounded-lg ${
                    headlineValue.kpisAtRisk > 0 || criticalIssues > 0
                      ? "bg-amber-500/5 border border-amber-500/20"
                      : "bg-muted/50 border border-muted"
                  }`}
                  data-testid="card-attention-snapshot"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className={`w-4 h-4 ${
                      headlineValue.kpisAtRisk > 0 || criticalIssues > 0 ? "text-amber-600" : "text-muted-foreground"
                    }`} />
                    <p className="font-medium text-sm">Needs Attention</p>
                  </div>
                  {headlineValue.kpisAtRisk > 0 || criticalIssues > 0 ? (
                    <div className="space-y-1">
                      {headlineValue.kpisAtRisk > 0 && (
                        <p className="text-sm text-amber-700 dark:text-amber-400" data-testid="text-kpis-at-risk">
                          {headlineValue.kpisAtRisk} KPI{headlineValue.kpisAtRisk !== 1 ? "s" : ""} at risk
                        </p>
                      )}
                      {criticalIssues > 0 && (
                        <p className="text-sm text-amber-700 dark:text-amber-400" data-testid="text-critical-issues">
                          {criticalIssues} critical issue{criticalIssues !== 1 ? "s" : ""} open
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-emerald-600" data-testid="text-all-clear">All clear - no urgent items</p>
                  )}
                </div>

                {/* Coming Up */}
                <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20" data-testid="card-upcoming-snapshot">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <p className="font-medium text-sm">Coming Up</p>
                  </div>
                  {account.nextQbrDate ? (
                    <div>
                      <p className="text-sm font-medium" data-testid="text-next-qbr-label">Next QBR</p>
                      <p className="text-xs text-muted-foreground" data-testid="text-next-qbr-date">
                        {new Date(account.nextQbrDate).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                        {daysUntilQbr !== null && daysUntilQbr > 0 && (
                          <span className="ml-1">({daysUntilQbr} days)</span>
                        )}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground" data-testid="text-no-upcoming">No upcoming events scheduled</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Customer Value Journey - Manager and Detailed views only */}
        {viewMode !== "executive" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Customer Value Journey</CardTitle>
            <CardDescription>Track progress across the 5-phase lifecycle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute top-8 left-0 right-0 h-1 bg-muted" />
              <div 
                className="absolute top-8 left-0 h-1 bg-primary transition-all duration-300"
                style={{ width: `${((activePhaseIndex + 1) / lifecyclePhases.length) * 100}%` }}
              />
              
              <div className="flex justify-between relative">
                {initiativesByPhase.map((phase, index) => {
                  const PhaseIcon = phase.icon;
                  const isActive = index <= activePhaseIndex;
                  const isCurrent = index === activePhaseIndex;
                  
                  return (
                    <button
                      key={phase.id}
                      onClick={() => setPhaseFilter(phase.id === phaseFilter ? "all" : phase.id)}
                      className={`flex flex-col items-center w-[18%] group cursor-pointer transition-all ${
                        phaseFilter === phase.id ? "scale-105" : ""
                      }`}
                      data-testid={`button-phase-${phase.id}`}
                    >
                      <div 
                        className={`w-16 h-16 rounded-full flex items-center justify-center z-10 border-4 transition-all ${
                          isCurrent 
                            ? `${phase.bgColor} ${phase.borderColor} ${phase.color} ring-4 ring-offset-2 ring-offset-background ring-primary/20` 
                            : isActive 
                              ? `${phase.bgColor} ${phase.borderColor} ${phase.color}` 
                              : "bg-muted border-muted-foreground/20 text-muted-foreground"
                        } ${phaseFilter === phase.id ? "ring-4 ring-offset-2 ring-offset-background ring-primary" : ""}`}
                      >
                        <PhaseIcon className="w-6 h-6" />
                      </div>
                      <div className="mt-2 text-center">
                        <p className={`text-sm font-medium ${isActive ? "" : "text-muted-foreground"}`}>
                          {phase.shortLabel}
                        </p>
                        {phase.count > 0 && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {phase.count} initiative{phase.count !== 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Value Metrics Grid - Manager and Detailed views only */}
        {viewMode !== "executive" && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="hover-elevate">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Promised Value</p>
                  <p className="text-2xl font-bold" data-testid="text-promised-value">
                    {formatCurrency(headlineValue.totalPromised)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-elevate">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Realized Value</p>
                  <p className="text-2xl font-bold" data-testid="text-realized-value">
                    {formatCurrency(headlineValue.totalRealized)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <div className="mt-3">
                <Progress value={headlineValue.realizationRate} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {headlineValue.realizationRate.toFixed(0)}% realized
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-elevate">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Initiatives</p>
                  <p className="text-2xl font-bold" data-testid="text-initiatives-count">
                    {headlineValue.initiativesActive}/{headlineValue.initiativesCount}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {headlineValue.initiativesActive} active
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover-elevate">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Outcomes On Track</p>
                  <p className="text-2xl font-bold" data-testid="text-kpis-ontrack">
                    {headlineValue.kpisOnTrack}/{headlineValue.kpisTotal}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              {headlineValue.kpisAtRisk > 0 && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {headlineValue.kpisAtRisk} at risk
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        )}

        {/* Initiative List - Detailed view only */}
        {viewMode === "detailed" && (
        <>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-lg font-semibold">
            {phaseFilter === "all" 
              ? `All Initiatives (${filteredInitiatives.length})` 
              : `${lifecyclePhases.find(p => p.id === phaseFilter)?.label} (${filteredInitiatives.length})`
            }
          </h2>
          <div className="flex items-center gap-2">
            <Select value={phaseFilter} onValueChange={setPhaseFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-phase-filter">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Phases</SelectItem>
                {lifecyclePhases.map(phase => (
                  <SelectItem key={phase.id} value={phase.id}>
                    {phase.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredInitiatives.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No initiatives found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {phaseFilter === "all" 
                    ? "Create your first initiative to get started"
                    : `No initiatives in the ${lifecyclePhases.find(p => p.id === phaseFilter)?.label} phase`
                  }
                </p>
                <Link href={`/projects/new?accountId=${accountId}`}>
                  <Button data-testid="button-new-initiative-empty">
                    <Plus className="w-4 h-4 mr-2" />
                    New Initiative
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredInitiatives.map((initiative) => {
              const phase = lifecyclePhases.find(p => p.id === initiative.lifecyclePhase);
              const PhaseIcon = phase?.icon || Circle;
              const progressPercent = initiative.kpiCount > 0 
                ? (initiative.kpisOnTrack / initiative.kpiCount) * 100 
                : 0;
              
              return (
                <Card 
                  key={initiative.id} 
                  className="hover-elevate cursor-pointer"
                  onClick={() => setLocation(`/projects/${initiative.id}/discovery`)}
                  data-testid={`card-initiative-${initiative.id}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {phase && (
                          <Badge className={`${phase.bgColor} ${phase.color} border ${phase.borderColor}`}>
                            <PhaseIcon className="w-3 h-3 mr-1" />
                            {phase.shortLabel}
                          </Badge>
                        )}
                        {initiative.discoveryFinalized && (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Finalized
                          </Badge>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                    <CardTitle className="text-base mt-2">{initiative.name}</CardTitle>
                    {initiative.clientName && (
                      <CardDescription>{initiative.clientName}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">KPIs</span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={statusColors["on-track"]}>
                            {initiative.kpisOnTrack} on track
                          </span>
                          {initiative.kpisAtRisk > 0 && (
                            <span className={statusColors["at-risk"]}>
                              {initiative.kpisAtRisk} at risk
                            </span>
                          )}
                        </div>
                      </div>
                      <Progress value={progressPercent} className="h-1.5" />
                      
                      <div className="flex items-center justify-between gap-4 text-sm pt-2 border-t">
                        <div>
                          <p className="text-muted-foreground">Promised</p>
                          <p className="font-medium">{formatCurrency(initiative.promisedValue)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">Realized</p>
                          <p className="font-medium text-emerald-600">
                            {formatCurrency(initiative.realizedValue)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Quick Phase Links */}
                      <div className="flex items-center gap-1 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                        <Link href={`/projects/${initiative.id}/discovery`}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-2 text-xs"
                            data-testid={`button-discovery-${initiative.id}`}
                          >
                            <Search className="w-3 h-3 mr-1" />
                            Discovery
                          </Button>
                        </Link>
                        <Link href={`/projects/${initiative.id}/alignment`}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-2 text-xs"
                            data-testid={`button-alignment-${initiative.id}`}
                          >
                            <Target className="w-3 h-3 mr-1" />
                            Alignment
                          </Button>
                        </Link>
                        <Link href={`/projects/${initiative.id}/realisation`}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-2 text-xs"
                            data-testid={`button-realisation-${initiative.id}`}
                          >
                            <Activity className="w-3 h-3 mr-1" />
                            Realize
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
        </>
        )}

        {/* Detailed sections - Issues, Team, Account Health - Detailed view only */}
        {viewMode === "detailed" && (
        <>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
              <div>
                <CardTitle className="text-lg">Issues & Opportunities</CardTitle>
                <CardDescription>Track blockers and growth opportunities</CardDescription>
              </div>
              <Badge variant="outline">
                {issues.filter(i => i.status === "open" || i.status === "in_progress").length} open
              </Badge>
            </CardHeader>
            <CardContent>
              {issues.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No issues or opportunities logged</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {issues.slice(0, 5).map((issue) => (
                    <div 
                      key={issue.id}
                      className="flex items-start justify-between gap-4 p-3 rounded-md bg-muted/50"
                      data-testid={`item-issue-${issue.id}`}
                    >
                      <div className="flex items-start gap-3">
                        {issue.type === "opportunity" ? (
                          <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5" />
                        ) : issue.type === "risk" ? (
                          <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{issue.title}</p>
                          {issue.solutionArea && (
                            <p className="text-xs text-muted-foreground">{issue.solutionArea}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={severityColors[issue.severity]} variant="secondary">
                          {issue.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {issues.length > 5 && (
                    <Button variant="ghost" className="w-full mt-2" data-testid="button-view-all-issues">
                      View all {issues.length} items
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team</CardTitle>
              <CardDescription>Account team members</CardDescription>
            </CardHeader>
            <CardContent>
              {teamRoles.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No team members assigned</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {teamRoles.map((member) => (
                    <div 
                      key={member.id}
                      className="flex items-center justify-between gap-2"
                      data-testid={`item-team-${member.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {member.userName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{member.userName}</p>
                          <p className="text-xs text-muted-foreground">{roleLabels[member.role]}</p>
                        </div>
                      </div>
                      {member.isPrimary && (
                        <Star className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Health Score</p>
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        className="text-muted"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        strokeDasharray={`${(account.healthScore || 0) * 1.76} 176`}
                        className={getHealthStatus(account.healthScore).color}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" data-testid="text-health-score">
                      {account.healthScore ?? "-"}
                    </span>
                  </div>
                  <div>
                    <p className={`font-medium ${getHealthStatus(account.healthScore).color}`} data-testid="text-health-status">
                      {getHealthStatus(account.healthScore).label}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Contract Period</p>
                {account.contractStartDate || account.contractEndDate ? (
                  <div className="space-y-1">
                    {account.contractStartDate && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Start:</span>{" "}
                        {new Date(account.contractStartDate).toLocaleDateString()}
                      </p>
                    )}
                    {account.contractEndDate && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">End:</span>{" "}
                        {new Date(account.contractEndDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not specified</p>
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Annual Contract Value</p>
                <p className="text-xl font-semibold" data-testid="text-acv">
                  {account.annualContractValue 
                    ? `$${parseFloat(account.annualContractValue).toLocaleString()}`
                    : "Not specified"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        </>
        )}
      </div>
    </div>
  );
}
