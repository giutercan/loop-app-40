import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
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
  Camera,
  Download,
  MessageSquare,
  TrendingDown,
  Minus,
  Filter,
  LayoutGrid
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { RolePanel, Role, LifecyclePhase } from "@/components/RolePanel";

interface Initiative {
  id: number;
  name: string;
  phase: string;
  lifecyclePhase: string | null;
  status: string;
  ragStatus: string | null;
  owner: string | null;
  startDate: string | null;
  targetEndDate: string | null;
}

interface AccountIssue {
  id: number;
  title: string;
  description: string | null;
  severity: "low" | "medium" | "high" | "critical";
  type: "issue" | "risk" | "opportunity";
  status: "open" | "in_progress" | "resolved" | "closed";
  linkedInitiativeId: number | null;
  createdAt: string;
}

interface EvidenceArtefact {
  id: number;
  title: string;
  artefactType: string;
  sourceUrl: string | null;
  linkedInitiativeId: number | null;
  createdAt: string;
}

interface KPI {
  id: number;
  name: string;
  unit: string;
  baseline: string | null;
  target: string | null;
  current: string | null;
  initiativeId: number;
  initiativeName: string;
  jobName: string;
  status: "on-track" | "at-risk" | "off-track" | "no-data";
}

interface AccountUserRole {
  id: number;
  role: string;
  userName: string;
  userEmail: string | null;
}

interface ValueSpineData {
  account: {
    id: number;
    name: string;
    industry: string | null;
    tier: string | null;
    healthScore: number | null;
  };
  initiatives: Initiative[];
  issues: AccountIssue[];
  evidenceArtefacts: EvidenceArtefact[];
  userRoles: AccountUserRole[];
  kpis: KPI[];
  valueMetrics: {
    totalValuePromised: number;
    totalValueRealized: number;
    realizationPercent: number;
  };
  headlineValueCase: {
    id: number;
    title: string;
    estimatedNPV: string;
    confidence: string;
    status: string;
  } | null;
}

const roleFilters = [
  { value: "all", label: "All Roles" },
  { value: "sales", label: "Sales" },
  { value: "consultant", label: "Consultant" },
  { value: "delivery", label: "Delivery" },
  { value: "csm", label: "CSM" },
  { value: "client_sponsor", label: "Client Sponsor" },
];

const phaseFilters = [
  { value: "all", label: "All Phases" },
  { value: "discover_qualify", label: "Discover & Qualify" },
  { value: "shape_sell", label: "Shape & Sell" },
  { value: "deliver_realise", label: "Deliver & Realise" },
  { value: "review_renew", label: "Review & Renew" },
  { value: "learn_scale", label: "Learn & Scale" },
];

const severityColors: Record<string, string> = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const statusColors: Record<string, string> = {
  "on-track": "text-emerald-600",
  "at-risk": "text-amber-600",
  "off-track": "text-red-600",
  "no-data": "text-muted-foreground"
};

const ragColors: Record<string, string> = {
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500"
};

export default function AccountValueSpine() {
  const [, params] = useRoute("/accounts/:id");
  const accountId = parseInt(params?.id || "0");
  const { toast } = useToast();
  const [roleFilter, setRoleFilter] = useState("all");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [isNewIssueOpen, setIsNewIssueOpen] = useState(false);
  const [newIssueTitle, setNewIssueTitle] = useState("");
  const [newIssueDescription, setNewIssueDescription] = useState("");
  const [newIssueSeverity, setNewIssueSeverity] = useState("medium");
  const [newIssueType, setNewIssueType] = useState("issue");

  const { data: valueSpine, isLoading } = useQuery<ValueSpineData>({
    queryKey: ["/api/accounts", accountId, "value-spine"],
    queryFn: async () => {
      const response = await fetch(`/api/accounts/${accountId}/value-spine`);
      if (!response.ok) throw new Error("Failed to fetch account data");
      return response.json();
    },
    enabled: accountId > 0
  });

  const createIssueMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; severity: string; type: string }) => {
      const response = await apiRequest("POST", `/api/accounts/${accountId}/issues`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts", accountId, "value-spine"] });
      setIsNewIssueOpen(false);
      setNewIssueTitle("");
      setNewIssueDescription("");
      setNewIssueSeverity("medium");
      setNewIssueType("issue");
      toast({
        title: "Issue created",
        description: "The issue has been added to the account.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create issue.",
      });
    },
  });

  const handleCreateIssue = () => {
    if (!newIssueTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please enter an issue title.",
      });
      return;
    }
    createIssueMutation.mutate({
      title: newIssueTitle.trim(),
      description: newIssueDescription.trim() || "",
      severity: newIssueSeverity,
      type: newIssueType
    });
  };

  if (isLoading || !valueSpine) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading account data...</p>
        </div>
      </div>
    );
  }

  const { account, initiatives, issues, evidenceArtefacts, kpis, valueMetrics, headlineValueCase } = valueSpine;
  
  // Apply phase filter to initiatives and KPIs
  const filteredInitiatives = phaseFilter === "all" 
    ? initiatives 
    : initiatives.filter(i => i.lifecyclePhase === phaseFilter);
  
  const filteredInitiativeIds = new Set(filteredInitiatives.map(i => i.id));
  const filteredKpis = phaseFilter === "all" 
    ? kpis 
    : kpis.filter(k => filteredInitiativeIds.has(k.initiativeId));
  
  const kpisOnTrack = filteredKpis.filter(k => k.status === "on-track").length;
  const kpisAtRisk = filteredKpis.filter(k => k.status === "at-risk").length;
  const kpisOffTrack = filteredKpis.filter(k => k.status === "off-track").length;
  const openIssues = issues.filter(i => i.status === "open" || i.status === "in_progress");

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-16 lg:h-20 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/accounts">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Accounts
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Building2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <span className="text-xl font-bold">{account.name}</span>
                  {account.industry && (
                    <p className="text-xs text-muted-foreground">{account.industry}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href={`/accounts/${accountId}/hub`}>
                <Button variant="outline" size="sm" data-testid="button-hub">
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Hub
                </Button>
              </Link>
              <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                <SelectTrigger className="w-[160px]" data-testid="select-phase-filter">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by phase" />
                </SelectTrigger>
                <SelectContent>
                  {phaseFilters.map(phase => (
                    <SelectItem key={phase.value} value={phase.value}>
                      {phase.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[160px]" data-testid="select-role-filter">
                  <Users className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  {roleFilters.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-7xl px-4 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="hover-elevate">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Value Promised</span>
                <Target className="w-4 h-4 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(valueMetrics.totalValuePromised)}
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-elevate">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Value Realized</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-600">
                {formatCurrency(valueMetrics.totalValueRealized)}
              </div>
              <div className="mt-2">
                <Progress value={valueMetrics.realizationPercent} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{valueMetrics.realizationPercent}% realized</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-elevate">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">KPI Health</span>
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium">{kpisOnTrack}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm font-medium">{kpisAtRisk}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm font-medium">{kpisOffTrack}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{filteredKpis.length} total KPIs tracked</p>
            </CardContent>
          </Card>
          
          <Card className="hover-elevate">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Open Issues</span>
                <AlertCircle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold">
                {openIssues.length}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {issues.filter(i => i.severity === "critical" || i.severity === "high").length} high priority
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="initiatives" data-testid="tab-initiatives">Initiatives</TabsTrigger>
            <TabsTrigger value="kpis" data-testid="tab-kpis">KPIs</TabsTrigger>
            <TabsTrigger value="issues" data-testid="tab-issues">Issues</TabsTrigger>
            <TabsTrigger value="evidence" data-testid="tab-evidence">Evidence</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {roleFilter !== "all" ? (
              <Card>
                <RolePanel
                  role={roleFilter as Role}
                  phase={phaseFilter as LifecyclePhase}
                  initiatives={filteredInitiatives.map(i => ({
                    id: i.id,
                    name: i.name,
                    status: i.status,
                    lifecyclePhase: i.lifecyclePhase,
                    ragStatus: i.ragStatus,
                    owner: i.owner,
                    phase: i.phase
                  }))}
                  kpis={filteredKpis.map(k => ({
                    id: k.id,
                    name: k.name,
                    status: k.status,
                    baselineValue: k.baselineValue,
                    targetValue: k.targetValue,
                    currentValue: k.currentValue,
                    initiativeId: k.initiativeId
                  }))}
                  issues={openIssues.map(i => ({
                    id: i.id,
                    title: i.title,
                    severity: i.severity,
                    status: i.status,
                    type: i.type
                  }))}
                  valueMetrics={valueMetrics}
                  onActionClick={(action, context) => {
                    toast({
                      title: "Action triggered",
                      description: `${action} action initiated`,
                    });
                  }}
                />
              </Card>
            ) : (
              <>
                <div className="grid gap-6 lg:grid-cols-2">
                  {headlineValueCase && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-amber-500" />
                          Headline Value Case
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <h3 className="font-semibold mb-2">{headlineValueCase.title}</h3>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">NPV: <span className="font-medium text-foreground">{headlineValueCase.estimatedNPV}</span></span>
                          <Badge variant="secondary">{headlineValueCase.confidence} confidence</Badge>
                          <Badge>{headlineValueCase.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        Active Initiatives
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {filteredInitiatives.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No initiatives linked to this account yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {filteredInitiatives.slice(0, 3).map(init => (
                            <Link key={init.id} href={`/projects/${init.id}/discovery`}>
                              <div className="flex items-center justify-between p-3 rounded-lg hover-elevate cursor-pointer border bg-card">
                                <div>
                                  <p className="font-medium">{init.name}</p>
                                  <p className="text-xs text-muted-foreground capitalize">{init.lifecyclePhase || init.phase}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {init.ragStatus && (
                                    <span className={`w-3 h-3 rounded-full ${ragColors[init.ragStatus] || "bg-gray-400"}`} />
                                  )}
                                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </div>
                              </div>
                            </Link>
                          ))}
                          {filteredInitiatives.length > 3 && (
                            <p className="text-sm text-muted-foreground text-center">
                              +{filteredInitiatives.length - 3} more initiatives
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      Recent Issues & Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {openIssues.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No open issues.</p>
                    ) : (
                      <div className="space-y-3">
                        {openIssues.slice(0, 5).map(issue => (
                          <div key={issue.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                            <div className="flex items-center gap-3">
                              <Badge className={severityColors[issue.severity]}>
                                {issue.severity}
                              </Badge>
                              <div>
                                <p className="font-medium">{issue.title}</p>
                                <p className="text-xs text-muted-foreground capitalize">{issue.type}</p>
                              </div>
                            </div>
                            <Badge variant="outline">{issue.status.replace("_", " ")}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="initiatives" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">All Initiatives</h2>
              <Link href="/projects/new">
                <Button size="sm" data-testid="button-new-initiative">
                  <Plus className="w-4 h-4 mr-2" />
                  New Initiative
                </Button>
              </Link>
            </div>
            
            {filteredInitiatives.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {phaseFilter === "all" 
                      ? "No initiatives linked to this account"
                      : `No initiatives in the ${phaseFilters.find(p => p.value === phaseFilter)?.label} phase`
                    }
                  </p>
                  <Link href="/projects/new">
                    <Button variant="outline" data-testid="button-create-initiative">Create Initiative</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredInitiatives.map(init => (
                  <Card key={init.id} className="hover-elevate">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{init.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="capitalize">{init.lifecyclePhase || init.phase}</span>
                              {init.owner && (
                                <>
                                  <span className="text-muted-foreground">•</span>
                                  <span>{init.owner}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {init.ragStatus && (
                            <span className={`w-3 h-3 rounded-full ${ragColors[init.ragStatus] || "bg-gray-400"}`} />
                          )}
                          <Badge variant="outline" className="capitalize">{init.status}</Badge>
                          <Link href={`/projects/${init.id}/discovery`}>
                            <Button variant="ghost" size="sm" data-testid={`button-view-initiative-${init.id}`}>
                              View
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="kpis" className="space-y-6">
            <h2 className="text-lg font-semibold">
              KPI Tracking 
              {phaseFilter !== "all" && (
                <span className="text-muted-foreground font-normal text-sm ml-2">
                  ({filteredKpis.length} in {phaseFilters.find(p => p.value === phaseFilter)?.label})
                </span>
              )}
            </h2>
            
            {filteredKpis.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {phaseFilter === "all" 
                      ? "No KPIs tracked yet"
                      : `No KPIs in the ${phaseFilters.find(p => p.value === phaseFilter)?.label} phase`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredKpis.map(kpi => (
                  <Card key={kpi.id} className="hover-elevate">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{kpi.name}</h3>
                            <Badge variant="outline" className="text-xs">{kpi.unit}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {kpi.initiativeName} • {kpi.jobName}
                          </p>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <p className="text-muted-foreground text-xs">Baseline</p>
                            <p className="font-mono font-medium">{kpi.baseline || "—"}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-muted-foreground text-xs">Target</p>
                            <p className="font-mono font-medium">{kpi.target || "—"}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-muted-foreground text-xs">Current</p>
                            <p className={`font-mono font-medium ${statusColors[kpi.status]}`}>
                              {kpi.current || "—"}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {kpi.status === "on-track" && <TrendingUp className="w-4 h-4 text-emerald-600" />}
                            {kpi.status === "at-risk" && <Minus className="w-4 h-4 text-amber-600" />}
                            {kpi.status === "off-track" && <TrendingDown className="w-4 h-4 text-red-600" />}
                            <span className={`text-sm font-medium capitalize ${statusColors[kpi.status]}`}>
                              {kpi.status.replace("-", " ")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="issues" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Issues & Opportunities</h2>
              <Dialog open={isNewIssueOpen} onOpenChange={setIsNewIssueOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="button-new-issue">
                    <Plus className="w-4 h-4 mr-2" />
                    New Issue
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Issue</DialogTitle>
                    <DialogDescription>
                      Track issues, risks, or opportunities for this account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="issue-title">Title</Label>
                      <Input
                        id="issue-title"
                        placeholder="Issue title"
                        value={newIssueTitle}
                        onChange={(e) => setNewIssueTitle(e.target.value)}
                        data-testid="input-issue-title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="issue-description">Description</Label>
                      <Textarea
                        id="issue-description"
                        placeholder="Describe the issue..."
                        value={newIssueDescription}
                        onChange={(e) => setNewIssueDescription(e.target.value)}
                        data-testid="input-issue-description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={newIssueType} onValueChange={setNewIssueType}>
                          <SelectTrigger data-testid="select-issue-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="issue">Issue</SelectItem>
                            <SelectItem value="risk">Risk</SelectItem>
                            <SelectItem value="opportunity">Opportunity</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Severity</Label>
                        <Select value={newIssueSeverity} onValueChange={setNewIssueSeverity}>
                          <SelectTrigger data-testid="select-issue-severity">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNewIssueOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateIssue}
                      disabled={createIssueMutation.isPending}
                      data-testid="button-create-issue"
                    >
                      {createIssueMutation.isPending ? "Creating..." : "Create Issue"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {issues.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No issues or opportunities tracked</p>
                  <Button variant="outline" onClick={() => setIsNewIssueOpen(true)}>
                    Add Issue
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {issues.map(issue => (
                  <Card key={issue.id} className="hover-elevate">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={severityColors[issue.severity]}>
                            {issue.severity}
                          </Badge>
                          <div>
                            <h3 className="font-semibold">{issue.title}</h3>
                            {issue.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">{issue.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">{issue.type}</Badge>
                          <Badge variant="secondary" className="capitalize">{issue.status.replace("_", " ")}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="evidence" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Evidence & Artefacts</h2>
              <Button size="sm" variant="outline" data-testid="button-add-evidence">
                <Plus className="w-4 h-4 mr-2" />
                Add Evidence
              </Button>
            </div>
            
            {evidenceArtefacts.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No evidence artefacts yet</p>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    Add screenshots, documents, reports, and testimonials to support QBR discussions.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {evidenceArtefacts.map(artefact => (
                  <Card key={artefact.id} className="hover-elevate">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          {artefact.artefactType === "screenshot" && <Camera className="w-5 h-5" />}
                          {artefact.artefactType === "document" && <FileText className="w-5 h-5" />}
                          {artefact.artefactType === "report" && <BarChart3 className="w-5 h-5" />}
                          {artefact.artefactType === "testimonial" && <MessageSquare className="w-5 h-5" />}
                          {artefact.artefactType === "data_export" && <Download className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{artefact.title}</h3>
                          <p className="text-xs text-muted-foreground capitalize">
                            {artefact.artefactType.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
