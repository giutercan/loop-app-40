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
  Filter
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

export default function AccountHub() {
  const [, params] = useRoute("/accounts/:id/hub");
  const accountId = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/accounts")} data-testid="button-back-accounts">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold" data-testid="text-account-name">{account.name}</h1>
                {account.tier && (
                  <Badge className={tierColors[account.tier]} data-testid="badge-account-tier">
                    {account.tier.charAt(0).toUpperCase() + account.tier.slice(1)}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {account.industry || "No industry specified"} 
                {account.accountOwner && <span className="ml-2"> Owned by {account.accountOwner}</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="hover-elevate">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Promised Value</p>
                  <p className="text-2xl font-bold" data-testid="text-promised-value">
                    {formatCurrency(headlineValue.totalPromised)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-elevate">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Realized Value</p>
                  <p className="text-2xl font-bold" data-testid="text-realized-value">
                    {formatCurrency(headlineValue.totalRealized)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Initiatives</p>
                  <p className="text-2xl font-bold" data-testid="text-initiatives-count">
                    {headlineValue.initiativesActive}/{headlineValue.initiativesCount}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">KPIs On Track</p>
                  <p className="text-2xl font-bold" data-testid="text-kpis-ontrack">
                    {headlineValue.kpisOnTrack}/{headlineValue.kpisTotal}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
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

        <div className="flex items-center justify-between">
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
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">KPIs</span>
                        <div className="flex items-center gap-2">
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
                      
                      <div className="flex items-center justify-between text-sm pt-2 border-t">
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
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

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
      </div>
    </div>
  );
}
