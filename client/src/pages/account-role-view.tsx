import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useRoute, useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Users,
  Briefcase,
  BarChart3,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  ChevronRight,
  Star,
  Plus,
  DollarSign,
  Lightbulb,
  RefreshCcw,
  LineChart,
  PieChart,
  ArrowUpRight,
  Download,
  Calendar,
  Eye
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { RolePanel, Role, LifecyclePhase, phaseLabels, roleLabels } from "@/components/RolePanel";

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

interface KPI {
  id: number;
  name: string;
  unit: string | null;
  baselineValue: number | null;
  targetValue: number | null;
  currentValue: number | null;
  initiativeId: number;
  initiativeName: string;
  status: "on-track" | "at-risk" | "off-track" | "no-data";
}

interface AccountIssue {
  id: number;
  title: string;
  description: string | null;
  severity: "low" | "medium" | "high" | "critical";
  type: "issue" | "risk" | "opportunity";
  status: string;
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
  kpis: KPI[];
  valueMetrics: {
    totalValuePromised: number;
    totalValueRealized: number;
    realizationPercent: number;
  };
}

const phaseFilters = [
  { value: "all", label: "All Phases" },
  { value: "discover_qualify", label: "Discover & Qualify" },
  { value: "shape_sell", label: "Shape & Sell" },
  { value: "deliver_realise", label: "Deliver & Realise" },
  { value: "review_renew", label: "Review & Renew" },
  { value: "learn_scale", label: "Learn & Scale" },
];

const ragColors: Record<string, string> = {
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500"
};

const severityColors: Record<string, string> = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const validRoles: Role[] = ["sales", "consultant", "delivery", "csm", "client_sponsor"];

const roleDefaultPhases: Record<Role, string[]> = {
  all: ["all"],
  sales: ["discover_qualify", "shape_sell"],
  consultant: ["discover_qualify", "shape_sell"],
  delivery: ["deliver_realise", "review_renew", "learn_scale"],
  csm: ["review_renew", "learn_scale"],
  client_sponsor: ["all"]
};

const rolePhaseLabels: Record<Role, string> = {
  all: "All Phases",
  sales: "Discover & Shape",
  consultant: "Discover & Shape",
  delivery: "Deliver, Review & Scale",
  csm: "Review & Scale",
  client_sponsor: "All Phases"
};

export default function AccountRoleView() {
  const [, params] = useRoute("/accounts/:id/:role");
  const accountId = parseInt(params?.id || "0");
  const roleParam = params?.role || "";
  const role = validRoles.includes(roleParam as Role) ? (roleParam as Role) : null;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [isLogKPIOpen, setIsLogKPIOpen] = useState(false);

  useEffect(() => {
    if (role) {
      const defaultPhase = roleDefaultPhases[role][0] === "all" ? "all" : roleDefaultPhases[role][0];
      setPhaseFilter(defaultPhase);
    }
  }, [role]);
  const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);
  const [kpiActualValue, setKpiActualValue] = useState("");
  const [kpiNote, setKpiNote] = useState("");
  const [isNewIssueOpen, setIsNewIssueOpen] = useState(false);
  const [newIssueTitle, setNewIssueTitle] = useState("");
  const [newIssueDescription, setNewIssueDescription] = useState("");
  const [newIssueSeverity, setNewIssueSeverity] = useState("medium");
  const [newIssueType, setNewIssueType] = useState<"issue" | "risk" | "opportunity">("opportunity");

  if (!role) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Invalid Role</h2>
            <p className="text-muted-foreground mb-4">
              The role "{roleParam}" is not recognized. Please select a valid role.
            </p>
            <Link href={`/accounts/${accountId}`}>
              <Button data-testid="button-back-to-account">Return to Account</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: valueSpine, isLoading } = useQuery<ValueSpineData>({
    queryKey: ["/api/accounts", accountId, "value-spine"],
    queryFn: async () => {
      const response = await fetch(`/api/accounts/${accountId}/value-spine`);
      if (!response.ok) throw new Error("Failed to fetch account data");
      return response.json();
    },
    enabled: accountId > 0
  });

  const logKPIActualMutation = useMutation({
    mutationFn: async (data: { kpiId: number; actualValue: number; note: string }) => {
      const response = await apiRequest("POST", `/api/kpis/${data.kpiId}/actuals`, {
        actualValue: data.actualValue,
        note: data.note,
        actualDate: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts", accountId, "value-spine"] });
      setIsLogKPIOpen(false);
      setSelectedKPI(null);
      setKpiActualValue("");
      setKpiNote("");
      toast({
        title: "KPI measurement logged",
        description: "The actual value has been recorded successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to log KPI measurement.",
      });
    }
  });

  const createIssueMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; severity: string; type: string; status: string }) => {
      const response = await apiRequest("POST", `/api/accounts/${accountId}/issues`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts", accountId, "value-spine"] });
      setIsNewIssueOpen(false);
      setNewIssueTitle("");
      setNewIssueDescription("");
      setNewIssueSeverity("medium");
      setNewIssueType("opportunity");
      toast({
        title: "Issue created",
        description: "The discovery finding has been logged to the account.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create issue.",
      });
    }
  });

  const handleCreateIssue = () => {
    if (!newIssueTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please enter a title for the finding.",
      });
      return;
    }
    createIssueMutation.mutate({
      title: newIssueTitle.trim(),
      description: newIssueDescription.trim() || "",
      severity: newIssueSeverity,
      type: newIssueType,
      status: "open"
    });
  };

  const handleLogKPI = () => {
    if (!selectedKPI || !kpiActualValue.trim()) {
      toast({
        variant: "destructive",
        title: "Missing value",
        description: "Please enter an actual value for the KPI.",
      });
      return;
    }
    const numericValue = parseFloat(kpiActualValue.trim());
    if (isNaN(numericValue)) {
      toast({
        variant: "destructive",
        title: "Invalid value",
        description: "Please enter a valid number.",
      });
      return;
    }
    logKPIActualMutation.mutate({
      kpiId: selectedKPI.id,
      actualValue: numericValue,
      note: kpiNote.trim()
    });
  };

  if (isLoading || !valueSpine) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading {roleLabels[role]} view...</p>
        </div>
      </div>
    );
  }

  const { account, initiatives, issues, kpis, valueMetrics } = valueSpine;

  const rolePhases = role ? roleDefaultPhases[role] : ["all"];
  const isRoleRelevantPhase = (phase: string | null) => {
    if (rolePhases.includes("all")) return true;
    if (!phase) return false;
    return rolePhases.includes(phase);
  };
  
  const rolePhaseFilters = rolePhases.includes("all") 
    ? phaseFilters 
    : [
        { value: "all", label: `All ${rolePhaseLabels[role!]}` },
        ...phaseFilters.filter(p => rolePhases.includes(p.value))
      ];

  const roleRelevantInitiatives = initiatives.filter(i => isRoleRelevantPhase(i.lifecyclePhase));
  const filteredInitiatives = phaseFilter === "all" 
    ? roleRelevantInitiatives 
    : roleRelevantInitiatives.filter(i => i.lifecyclePhase === phaseFilter);
  
  const filteredInitiativeIds = new Set(filteredInitiatives.map(i => i.id));
  const filteredKpis = phaseFilter === "all" 
    ? kpis.filter(k => new Set(roleRelevantInitiatives.map(i => i.id)).has(k.initiativeId))
    : kpis.filter(k => filteredInitiativeIds.has(k.initiativeId));

  const kpisOnTrack = filteredKpis.filter(k => k.status === "on-track").length;
  const kpisAtRisk = filteredKpis.filter(k => k.status === "at-risk").length;
  const kpisOffTrack = filteredKpis.filter(k => k.status === "off-track").length;
  const activeInitiatives = filteredInitiatives.filter(i => 
    i.status !== "completed" && i.status !== "closed" && i.status !== "cancelled"
  ).length;
  const completedInitiatives = filteredInitiatives.filter(i => i.status === "completed").length;
  const openIssues = issues.filter(i => i.status === "open" || i.status === "in_progress");
  const criticalIssues = issues.filter(i => i.severity === "critical" && (i.status === "open" || i.status === "in_progress"));

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const getRoleIcon = () => {
    switch (role) {
      case "sales": return <DollarSign className="w-6 h-6" />;
      case "consultant": return <Lightbulb className="w-6 h-6" />;
      case "delivery": return <LineChart className="w-6 h-6" />;
      case "csm": return <Users className="w-6 h-6" />;
      case "client_sponsor": return <Target className="w-6 h-6" />;
      default: return <Users className="w-6 h-6" />;
    }
  };

  const renderSalesDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover-elevate">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Value Promised</p>
                <p className="text-2xl font-bold">{formatCurrency(valueMetrics.totalValuePromised)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Opportunities</p>
                <p className="text-2xl font-bold">{activeInitiatives}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Win Rate Potential</p>
                <p className="text-2xl font-bold">{valueMetrics.realizationPercent}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed Deals</p>
                <p className="text-2xl font-bold">{completedInitiatives}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Pipeline Opportunities
            </CardTitle>
            <CardDescription>Active deals and their status</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredInitiatives.length === 0 ? (
              <p className="text-sm text-muted-foreground">No opportunities in pipeline</p>
            ) : (
              <div className="space-y-3">
                {filteredInitiatives.slice(0, 5).map(init => (
                  <Link key={init.id} href={`/projects/${init.id}/discovery`} data-testid={`link-initiative-${init.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover-elevate cursor-pointer border bg-card">
                      <div>
                        <p className="font-medium">{init.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{init.lifecyclePhase || init.phase}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {init.ragStatus && (
                          <span className={`w-3 h-3 rounded-full ${ragColors[init.ragStatus] || "bg-gray-400"}`} />
                        )}
                        <Badge variant="outline" className="capitalize">{init.status}</Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common sales activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-create-value-case-sales-full">
              <FileText className="w-4 h-4" />
              Create New Value Case
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-schedule-discovery-sales-full">
              <Calendar className="w-4 h-4" />
              Schedule Discovery Session
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-browse-success-stories-sales-full">
              <Star className="w-4 h-4" />
              Browse Success Stories
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-export-pipeline-sales-full">
              <Download className="w-4 h-4" />
              Export Pipeline Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {criticalIssues.length > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Critical Account Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalIssues.map(issue => (
                <div key={issue.id} className="flex items-center justify-between p-2 rounded border bg-background">
                  <span>{issue.title}</span>
                  <Badge variant="destructive">Critical</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderConsultantDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover-elevate">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">KPIs Tracked</p>
                <p className="text-2xl font-bold">{filteredKpis.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On Track</p>
                <p className="text-2xl font-bold">{kpisOnTrack}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Realized</p>
                <p className="text-2xl font-bold">{valueMetrics.realizationPercent}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Initiatives</p>
                <p className="text-2xl font-bold">{activeInitiatives}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              KPI Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-4">
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
            <div className="space-y-3">
              {filteredKpis.slice(0, 5).map(kpi => (
                <div key={kpi.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div>
                    <p className="font-medium">{kpi.name}</p>
                    <p className="text-xs text-muted-foreground">{kpi.initiativeName}</p>
                  </div>
                  <Badge variant={kpi.status === "on-track" ? "default" : kpi.status === "at-risk" ? "secondary" : "destructive"}>
                    {kpi.status.replace("-", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Consultant Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-conduct-discovery-consultant-full">
              <Lightbulb className="w-4 h-4" />
              Conduct Discovery Research
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2" 
              onClick={() => setIsNewIssueOpen(true)}
              data-testid="button-log-discovery-finding-consultant-full"
            >
              <AlertCircle className="w-4 h-4" />
              Log Discovery Finding
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-build-value-case-consultant-full">
              <FileText className="w-4 h-4" />
              Build Value Case
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-define-kpis-consultant-full">
              <Target className="w-4 h-4" />
              Define KPI Targets
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-view-alignment-consultant-full">
              <Eye className="w-4 h-4" />
              View Alignment Table
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderDeliveryDashboard = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary/5 to-emerald-500/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Value Delivery Progress</h3>
                <p className="text-sm text-muted-foreground">Promised vs Delivered</p>
              </div>
            </div>
            <Badge variant={valueMetrics.realizationPercent >= 80 ? "default" : valueMetrics.realizationPercent >= 50 ? "secondary" : "destructive"}>
              {valueMetrics.realizationPercent}% Realized
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-background/50">
              <p className="text-2xl font-bold text-primary">{formatCurrency(valueMetrics.totalValuePromised)}</p>
              <p className="text-xs text-muted-foreground">Promised Value</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background/50">
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(valueMetrics.totalValueRealized)}</p>
              <p className="text-xs text-muted-foreground">Delivered Value</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background/50">
              <p className="text-2xl font-bold">{formatCurrency(valueMetrics.totalValuePromised - valueMetrics.totalValueRealized)}</p>
              <p className="text-xs text-muted-foreground">Value Gap</p>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={valueMetrics.realizationPercent} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover-elevate bg-green-500/5 border-green-500/20">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 rounded-full mx-auto bg-green-500/10 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-3xl font-bold">{kpisOnTrack}</p>
            <p className="text-sm text-muted-foreground">On Track</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate bg-yellow-500/5 border-yellow-500/20">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 rounded-full mx-auto bg-yellow-500/10 flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold">{kpisAtRisk}</p>
            <p className="text-sm text-muted-foreground">At Risk</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate bg-red-500/5 border-red-500/20">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 rounded-full mx-auto bg-red-500/10 flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-3xl font-bold">{kpisOffTrack}</p>
            <p className="text-sm text-muted-foreground">Off Track</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 rounded-full mx-auto bg-blue-500/10 flex items-center justify-center mb-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-3xl font-bold">{openIssues.length}</p>
            <p className="text-sm text-muted-foreground">Open Issues</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              KPIs Requiring Measurement
            </CardTitle>
            <CardDescription>Log actual values for tracked KPIs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredKpis.slice(0, 6).map(kpi => (
                <div key={kpi.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div>
                    <p className="font-medium">{kpi.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Target: {kpi.targetValue ?? "N/A"}</span>
                      <span>•</span>
                      <span>Current: {kpi.currentValue ?? "N/A"}</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSelectedKPI(kpi);
                      setIsLogKPIOpen(true);
                    }}
                    data-testid={`button-log-kpi-${kpi.id}`}
                  >
                    Log
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCcw className="w-5 h-5" />
              Delivery Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => setIsLogKPIOpen(true)}
              data-testid="button-log-measurement-delivery-full"
            >
              <BarChart3 className="w-4 h-4" />
              Log KPI Measurement
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-update-status-delivery-full">
              <RefreshCcw className="w-4 h-4" />
              Update Initiative Status
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-flag-risk-delivery-full">
              <AlertTriangle className="w-4 h-4" />
              Flag Risk or Blocker
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-export-report-delivery-full">
              <Download className="w-4 h-4" />
              Export Delivery Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {openIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Open Issues & Blockers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {openIssues.map(issue => (
                <div key={issue.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <Badge className={severityColors[issue.severity]}>{issue.severity}</Badge>
                    <span>{issue.title}</span>
                  </div>
                  <Badge variant="outline">{issue.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCSMDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover-elevate">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Value Delivered</p>
                <p className="text-2xl font-bold">{formatCurrency(valueMetrics.totalValueRealized)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <PieChart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Realization</p>
                <p className="text-2xl font-bold">{valueMetrics.realizationPercent}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedInitiatives}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{activeInitiatives}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Promised vs Delivered Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Promised</span>
                <span className="font-medium">{formatCurrency(valueMetrics.totalValuePromised)}</span>
              </div>
              <div className="h-3 bg-muted rounded-full">
                <div className="h-full bg-primary/40 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Delivered</span>
                <span className="font-medium">{formatCurrency(valueMetrics.totalValueRealized)}</span>
              </div>
              <div className="h-3 bg-muted rounded-full">
                <div 
                  className="h-full bg-primary rounded-full" 
                  style={{ width: `${Math.min(valueMetrics.realizationPercent, 100)}%` }} 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              KPI Health Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-green-500" />
                  <span>Meeting Targets</span>
                </div>
                <span className="text-xl font-bold">{kpisOnTrack}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-yellow-500" />
                  <span>Needs Attention</span>
                </div>
                <span className="text-xl font-bold">{kpisAtRisk}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-red-500" />
                  <span>Behind Target</span>
                </div>
                <span className="text-xl font-bold">{kpisOffTrack}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              CSM Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-prepare-qbr-csm-full">
              <FileText className="w-4 h-4" />
              Prepare QBR Summary
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-identify-expansion-csm-full">
              <TrendingUp className="w-4 h-4" />
              Identify Expansion Opportunities
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-document-success-csm-full">
              <Star className="w-4 h-4" />
              Document Success Story
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-schedule-review-csm-full">
              <Calendar className="w-4 h-4" />
              Schedule Business Review
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderClientSponsorDashboard = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">Value Realized to Date</p>
            <p className="text-5xl font-bold text-primary">{formatCurrency(valueMetrics.totalValueRealized)}</p>
            <div className="flex items-center justify-center gap-3 text-sm">
              <span className="text-muted-foreground">of {formatCurrency(valueMetrics.totalValuePromised)} promised</span>
              <Badge variant="outline" className="bg-background text-lg px-3 py-1">
                {valueMetrics.realizationPercent}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover-elevate">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{completedInitiatives}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{activeInitiatives}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-green-600">{kpisOnTrack}</p>
            <p className="text-sm text-muted-foreground">KPIs On Track</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-red-600">{kpisOffTrack}</p>
            <p className="text-sm text-muted-foreground">KPIs Behind</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              KPI Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>On Track</span>
                  <span className="font-medium">{kpisOnTrack} of {filteredKpis.length}</span>
                </div>
                <Progress value={(kpisOnTrack / filteredKpis.length) * 100 || 0} className="h-3 bg-green-100" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>At Risk</span>
                  <span className="font-medium">{kpisAtRisk} of {filteredKpis.length}</span>
                </div>
                <Progress value={(kpisAtRisk / filteredKpis.length) * 100 || 0} className="h-3 bg-yellow-100" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Off Track</span>
                  <span className="font-medium">{kpisOffTrack} of {filteredKpis.length}</span>
                </div>
                <Progress value={(kpisOffTrack / filteredKpis.length) * 100 || 0} className="h-3 bg-red-100" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Recent Initiatives
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredInitiatives.length === 0 ? (
              <p className="text-sm text-muted-foreground">No initiatives to display</p>
            ) : (
              <div className="space-y-3">
                {filteredInitiatives.slice(0, 4).map(init => (
                  <div key={init.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div>
                      <p className="font-medium">{init.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{init.status}</p>
                    </div>
                    {init.ragStatus && (
                      <span className={`w-4 h-4 rounded-full ${ragColors[init.ragStatus] || "bg-gray-400"}`} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {criticalIssues.length > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Issues Requiring Executive Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalIssues.map(issue => (
                <div key={issue.id} className="flex items-center justify-between p-3 rounded border bg-background">
                  <span>{issue.title}</span>
                  <Badge variant="destructive">Critical</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderDashboard = () => {
    switch (role) {
      case "sales": return renderSalesDashboard();
      case "consultant": return renderConsultantDashboard();
      case "delivery": return renderDeliveryDashboard();
      case "csm": return renderCSMDashboard();
      case "client_sponsor": return renderClientSponsorDashboard();
      default: return renderSalesDashboard();
    }
  };

  const otherPortal = role === "sales" ? "delivery" : role === "delivery" ? "sales" : null;
  const otherPortalLabel = otherPortal === "sales" ? "Sales Portal" : otherPortal === "delivery" ? "Delivery Portal" : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-16 lg:h-20 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/accounts/${accountId}`}>
                <Button variant="ghost" size="sm" data-testid="button-back-value-spine">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Value Spine
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                  {getRoleIcon()}
                </div>
                <div>
                  <span className="text-xl font-bold">{roleLabels[role]} Portal</span>
                  <p className="text-xs text-muted-foreground">{account.name} • {rolePhaseLabels[role]}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-phase-filter">
                  <SelectValue placeholder="Filter by phase" />
                </SelectTrigger>
                <SelectContent>
                  {rolePhaseFilters.map(phase => (
                    <SelectItem key={phase.value} value={phase.value} data-testid={`option-phase-${phase.value}`}>
                      {phase.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {otherPortal && (
                <Link href={`/accounts/${accountId}/${otherPortal}`}>
                  <Button variant="ghost" size="sm" data-testid={`button-switch-to-${otherPortal}`}>
                    Switch to {otherPortalLabel}
                  </Button>
                </Link>
              )}
              
              <Link href={`/accounts/${accountId}/hub`}>
                <Button variant="outline" size="sm" data-testid="button-hub">
                  Account Hub
                </Button>
              </Link>
              
              <Link href="/accounts">
                <Button variant="ghost" size="sm" data-testid="button-all-accounts">
                  All Accounts
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 lg:px-8 py-8">
        {renderDashboard()}
      </main>

      <Dialog open={isLogKPIOpen} onOpenChange={(open) => {
          setIsLogKPIOpen(open);
          if (!open) {
            setSelectedKPI(null);
            setKpiActualValue("");
            setKpiNote("");
          }
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log KPI Measurement</DialogTitle>
            <DialogDescription>
              {selectedKPI ? `Record actual value for ${selectedKPI.name}` : "Select a KPI and enter its measurement"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="kpiSelect">Select KPI</Label>
              <Select 
                value={selectedKPI?.id.toString() || ""} 
                onValueChange={(value) => {
                  const kpi = filteredKpis.find(k => k.id.toString() === value);
                  setSelectedKPI(kpi || null);
                }}
              >
                <SelectTrigger data-testid="select-kpi-for-logging">
                  <SelectValue placeholder="Choose a KPI to log" />
                </SelectTrigger>
                <SelectContent>
                  {filteredKpis.map(kpi => (
                    <SelectItem key={kpi.id} value={kpi.id.toString()} data-testid={`option-kpi-${kpi.id}`}>
                      {kpi.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedKPI && (
              <>
                <div className="grid grid-cols-2 gap-4 text-sm p-3 rounded-lg bg-muted">
                  <div>
                    <span className="text-muted-foreground">Baseline:</span>
                    <span className="ml-2 font-medium">{selectedKPI.baselineValue ?? "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Target:</span>
                    <span className="ml-2 font-medium">{selectedKPI.targetValue ?? "N/A"}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actualValue">Actual Value</Label>
                  <Input
                    id="actualValue"
                    type="number"
                    value={kpiActualValue}
                    onChange={(e) => setKpiActualValue(e.target.value)}
                    placeholder="Enter the measured value"
                    data-testid="input-kpi-actual-value"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">Note (optional)</Label>
                  <Textarea
                    id="note"
                    value={kpiNote}
                    onChange={(e) => setKpiNote(e.target.value)}
                    placeholder="Add any relevant context..."
                    data-testid="input-kpi-note"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogKPIOpen(false)} data-testid="button-cancel-log-kpi">
              Cancel
            </Button>
            <Button 
              onClick={handleLogKPI} 
              disabled={!selectedKPI || !kpiActualValue.trim() || logKPIActualMutation.isPending}
              data-testid="button-save-log-kpi"
            >
              {logKPIActualMutation.isPending ? "Saving..." : "Log Measurement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewIssueOpen} onOpenChange={(open) => {
        setIsNewIssueOpen(open);
        if (!open) {
          setNewIssueTitle("");
          setNewIssueDescription("");
          setNewIssueSeverity("medium");
          setNewIssueType("opportunity");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Discovery Finding</DialogTitle>
            <DialogDescription>
              Record an opportunity, risk, or issue discovered during the engagement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="issueTitle">Title</Label>
              <Input
                id="issueTitle"
                value={newIssueTitle}
                onChange={(e) => setNewIssueTitle(e.target.value)}
                placeholder="Describe the finding..."
                data-testid="input-issue-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issueDescription">Description (optional)</Label>
              <Textarea
                id="issueDescription"
                value={newIssueDescription}
                onChange={(e) => setNewIssueDescription(e.target.value)}
                placeholder="Add additional context..."
                data-testid="input-issue-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issueType">Type</Label>
                <Select value={newIssueType} onValueChange={(v) => setNewIssueType(v as "issue" | "risk" | "opportunity")}>
                  <SelectTrigger data-testid="select-issue-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opportunity" data-testid="option-type-opportunity">Opportunity</SelectItem>
                    <SelectItem value="risk" data-testid="option-type-risk">Risk</SelectItem>
                    <SelectItem value="issue" data-testid="option-type-issue">Issue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="issueSeverity">Severity</Label>
                <Select value={newIssueSeverity} onValueChange={setNewIssueSeverity}>
                  <SelectTrigger data-testid="select-issue-severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low" data-testid="option-severity-low">Low</SelectItem>
                    <SelectItem value="medium" data-testid="option-severity-medium">Medium</SelectItem>
                    <SelectItem value="high" data-testid="option-severity-high">High</SelectItem>
                    <SelectItem value="critical" data-testid="option-severity-critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewIssueOpen(false)} data-testid="button-cancel-issue">
              Cancel
            </Button>
            <Button 
              onClick={handleCreateIssue} 
              disabled={!newIssueTitle.trim() || createIssueMutation.isPending}
              data-testid="button-save-issue"
            >
              {createIssueMutation.isPending ? "Creating..." : "Create Finding"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
