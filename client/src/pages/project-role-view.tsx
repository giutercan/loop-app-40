import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  ArrowLeft,
  ArrowRight,
  Building2, 
  TrendingUp, 
  Target, 
  Users,
  Briefcase,
  BarChart3,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  Clock,
  FileText,
  ChevronRight,
  ChevronDown,
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
  Eye,
  MessageSquare,
  ClipboardList,
  Layers,
  Activity,
  FileCheck,
  UserCheck,
  Sparkles,
  Loader2,
  HelpCircle,
  Check
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, JobTheme } from "@shared/schema";

type Role = "sales" | "consultant" | "delivery" | "csm" | "client_sponsor";

interface KPI {
  id: number;
  name: string;
  unit: string | null;
  baselineValue: number | null;
  targetValue: number | null;
  currentValue: number | null;
  status: "on-track" | "at-risk" | "off-track" | "no-data";
}

interface ProjectInsight {
  id: number;
  content: string;
  priority: string | null;
  confidence: string | null;
  kornferryPillar: string | null;
  solutionArea: string | null;
}

interface Note {
  id: number;
  content: string;
  category: string | null;
  createdAt: string;
}

interface ValueCase {
  id: number;
  title: string;
  description: string | null;
  status: string;
  estimatedValue: number | null;
}

interface DiscoveryQuestion {
  id: number;
  projectId: number;
  capabilityName: string;
  question: string;
  questionType: "quantitative" | "qualitative" | "both";
  methodology: "MILLER_HEIMAN" | "SPIN" | "PSS" | null;
  methodologyStage: string | null;
  purpose: string;
  relatedKPI: string | null;
  followUpHint: string | null;
  answer: string | null;
  isAsked: boolean;
  notes: string | null;
  isTemplate: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const methodologyMeta: Record<string, { label: string; color: string; description: string }> = {
  SPIN: { 
    label: "SPIN Selling", 
    color: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    description: "Situation, Problem, Implication, Need-Payoff"
  },
  MILLER_HEIMAN: { 
    label: "Miller Heiman", 
    color: "bg-purple-500/10 text-purple-700 border-purple-500/20",
    description: "Strategic Selling Framework"
  },
  PSS: { 
    label: "PSS", 
    color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    description: "Professional Selling Skills"
  }
};

const stageMeta: Record<string, string> = {
  situation: "Situation",
  problem: "Problem", 
  implication: "Implication",
  need_payoff: "Need-Payoff",
  conceptual: "Conceptual",
  attitude: "Attitude",
  commitment: "Commitment",
  open_probe: "Open Probe",
  control_probe: "Control Probe",
  confirm_probe: "Confirm Probe"
};

const validRoles: Role[] = ["sales", "consultant", "delivery", "csm", "client_sponsor"];

const roleLabels: Record<Role, string> = {
  sales: "Sales",
  consultant: "Consultant",
  delivery: "Delivery",
  csm: "Customer Success",
  client_sponsor: "Client Sponsor"
};

const roleIcons: Record<Role, typeof DollarSign> = {
  sales: DollarSign,
  consultant: Lightbulb,
  delivery: LineChart,
  csm: Users,
  client_sponsor: Target
};

const phaseLabels: Record<string, string> = {
  discover_qualify: "Discover & Qualify",
  shape_sell: "Shape & Sell",
  deliver_realise: "Deliver & Realise",
  review_renew: "Review & Renew",
  learn_scale: "Learn & Scale"
};

const ragColors: Record<string, string> = {
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500"
};

export default function ProjectRoleView() {
  const [, params] = useRoute("/projects/:id/:role");
  const projectId = parseInt(params?.id || "0");
  const roleParam = params?.role || "";
  const role = validRoles.includes(roleParam as Role) ? (roleParam as Role) : null;
  const { toast } = useToast();
  
  const isSalesRoleParam = roleParam === "sales" || roleParam === "consultant";
  const isDeliveryRoleParam = roleParam === "delivery" || roleParam === "csm";
  const [activeTab, setActiveTab] = useState(isSalesRoleParam ? "guided-discovery" : "health");
  const [isLogKPIOpen, setIsLogKPIOpen] = useState(false);
  
  // Reset tab when role changes
  useEffect(() => {
    if (isSalesRoleParam) {
      setActiveTab("guided-discovery");
    } else if (isDeliveryRoleParam) {
      setActiveTab("health");
    }
  }, [roleParam, isSalesRoleParam, isDeliveryRoleParam]);
  const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);
  const [kpiActualValue, setKpiActualValue] = useState("");
  const [kpiNote, setKpiNote] = useState("");
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteCategory, setNewNoteCategory] = useState("general");
  
  // Discovery mode selection
  const [isDiscoveryModeDialogOpen, setIsDiscoveryModeDialogOpen] = useState(false);
  const [discoveryMode, setDiscoveryMode] = useState<"focused" | "full">("full");
  const [selectedSolutionArea, setSelectedSolutionArea] = useState<string>("");
  
  // Korn Ferry Solution Areas
  const solutionAreas = [
    { id: "ASSESS", name: "Assess", description: "Success Profiles & Assessments - hiring, promotion, development data" },
    { id: "DEVELOP", name: "Develop", description: "Leadership & Development - build leaders, AI-ready leadership" },
    { id: "TRANSFORM", name: "Transform", description: "Organisation Strategy - operating models, structural savings" },
    { id: "REWARD", name: "Reward", description: "Total Rewards - optimize reward mix, retention, pay equity" },
    { id: "COMMERCIAL", name: "Commercial", description: "Sales Effectiveness - go-to-market, sales enablement" }
  ];

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
    enabled: projectId > 0
  });

  const { data: insights = [] } = useQuery<ProjectInsight[]>({
    queryKey: ["/api/projects", projectId, "insights"],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/insights`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: projectId > 0
  });

  const { data: kpis = [] } = useQuery<KPI[]>({
    queryKey: ["/api/projects", projectId, "kpis"],
    queryFn: async () => {
      const themesResponse = await fetch(`/api/projects/${projectId}/job-themes`);
      if (!themesResponse.ok) return [];
      const themes = await themesResponse.json();
      
      const kpisToFetch: Array<{ kpi: any; index: number }> = [];
      themes.forEach((theme: any) => {
        if (theme.kpis) {
          theme.kpis.forEach((kpi: any) => {
            kpisToFetch.push({ kpi, index: kpisToFetch.length });
          });
        }
      });
      
      const kpisNeedingActuals = kpisToFetch.filter(({ kpi }) => !kpi.currentValue && kpi.id);
      const actualsPromises = kpisNeedingActuals.map(async ({ kpi }) => {
        try {
          const response = await fetch(`/api/kpis/${kpi.id}/actuals`);
          if (response.ok) {
            const actuals = await response.json();
            return { kpiId: kpi.id, currentValue: actuals.length > 0 ? actuals[actuals.length - 1].actualValue : null };
          }
        } catch {}
        return { kpiId: kpi.id, currentValue: null };
      });
      
      const actualsResults = await Promise.all(actualsPromises);
      const actualsMap = new Map(actualsResults.map(r => [r.kpiId, r.currentValue]));
      
      return kpisToFetch.map(({ kpi }) => {
        const currentValue = kpi.currentValue ?? actualsMap.get(kpi.id) ?? null;
        const kpiWithCurrent = { ...kpi, currentValue };
        return {
          ...kpiWithCurrent,
          status: getKPIStatus(kpiWithCurrent)
        };
      });
    },
    enabled: projectId > 0
  });

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ["/api/projects", projectId, "notes"],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/notes`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: projectId > 0
  });

  const { data: valueCases = [] } = useQuery<ValueCase[]>({
    queryKey: ["/api/projects", projectId, "value-cases"],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/value-cases`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: projectId > 0
  });

  const { data: jobThemes = [] } = useQuery<JobTheme[]>({
    queryKey: ["/api/projects", projectId, "job-themes"],
    enabled: projectId > 0
  });

  const { data: discoveryQuestions = [], isLoading: questionsLoading } = useQuery<DiscoveryQuestion[]>({
    queryKey: ["/api/projects", projectId, "discovery-questions"],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/discovery-questions`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: projectId > 0
  });

  const [expandedMethodologies, setExpandedMethodologies] = useState<Record<string, boolean>>({
    SPIN: true,
    MILLER_HEIMAN: true,
    PSS: true
  });

  const generateQuestionsMutation = useMutation({
    mutationFn: async (params: { mode: "focused" | "full"; solutionArea?: string }) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/discovery-questions/generate`, {
        mode: params.mode,
        solutionArea: params.solutionArea
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "discovery-questions"] });
      setIsDiscoveryModeDialogOpen(false);
      toast({ 
        title: "Questions Generated", 
        description: data.summary || "AI-powered discovery questions are ready." 
      });
    },
    onError: (error: any) => {
      toast({ 
        variant: "destructive", 
        title: "Generation Failed", 
        description: error.message || "Could not generate questions. Ensure you have job themes set up." 
      });
    }
  });
  
  const handleStartDiscovery = () => {
    setDiscoveryMode("full");
    setSelectedSolutionArea("");
    setIsDiscoveryModeDialogOpen(true);
  };
  
  const handleRunDiscovery = () => {
    if (discoveryMode === "focused" && !selectedSolutionArea) {
      toast({
        variant: "destructive",
        title: "Select a Solution Area",
        description: "Please select a Korn Ferry solution area to focus the discovery."
      });
      return;
    }
    generateQuestionsMutation.mutate({
      mode: discoveryMode,
      solutionArea: discoveryMode === "focused" ? selectedSolutionArea : undefined
    });
  };

  const markQuestionAskedMutation = useMutation({
    mutationFn: async ({ questionId, isAsked }: { questionId: number; isAsked: boolean }) => {
      const response = await apiRequest("PATCH", `/api/discovery-questions/${questionId}`, { isAsked });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "discovery-questions"] });
    }
  });

  const groupedQuestions = discoveryQuestions.reduce((acc, q) => {
    const method = q.methodology || "OTHER";
    if (!acc[method]) acc[method] = [];
    acc[method].push(q);
    return acc;
  }, {} as Record<string, DiscoveryQuestion[]>);

  const logKPIMutation = useMutation({
    mutationFn: async (data: { kpiId: number; actualValue: number; note: string }) => {
      const response = await apiRequest("POST", `/api/kpis/${data.kpiId}/actuals`, {
        actualValue: data.actualValue,
        note: data.note,
        actualDate: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "kpis"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "job-themes"] });
      if (project?.accountId) {
        queryClient.invalidateQueries({ queryKey: ["/api/accounts", project.accountId, "value-spine"] });
      }
      setIsLogKPIOpen(false);
      setSelectedKPI(null);
      setKpiActualValue("");
      setKpiNote("");
      toast({ title: "KPI logged", description: "Measurement recorded successfully." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to log KPI." });
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: async (data: { content: string; category: string }) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/notes`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "notes"] });
      setIsAddNoteOpen(false);
      setNewNoteContent("");
      setNewNoteCategory("general");
      toast({ title: "Note added", description: "Your note has been saved." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to add note." });
    }
  });

  const getKPIStatus = (kpi: any): "on-track" | "at-risk" | "off-track" | "no-data" => {
    if (!kpi.baselineValue || !kpi.targetValue) return "no-data";
    if (!kpi.currentValue) return "no-data";
    const progress = ((kpi.currentValue - kpi.baselineValue) / (kpi.targetValue - kpi.baselineValue)) * 100;
    if (progress >= 80) return "on-track";
    if (progress >= 50) return "at-risk";
    return "off-track";
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Invalid Role</h2>
            <p className="text-muted-foreground mb-4">
              The role "{roleParam}" is not recognized.
            </p>
            <Link href={`/projects/${projectId}`}>
              <Button data-testid="button-back-to-project">Return to Project</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (projectLoading || !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCcw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const RoleIcon = roleIcons[role];
  const isSalesRole = role === "sales" || role === "consultant";
  const isDeliveryRole = role === "delivery" || role === "csm";
  const accountId = project.accountId;

  const kpisOnTrack = kpis.filter(k => k.status === "on-track").length;
  const kpisAtRisk = kpis.filter(k => k.status === "at-risk" || k.status === "off-track").length;
  const totalValue = valueCases.reduce((sum, vc) => sum + (vc.estimatedValue || 0), 0);

  const renderSalesWorkspace = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid grid-cols-5 w-full max-w-3xl">
        <TabsTrigger value="guided-discovery" data-testid="tab-guided-discovery">
          <Sparkles className="w-4 h-4 mr-2" />
          Guided Discovery
        </TabsTrigger>
        <TabsTrigger value="execution-canvas" data-testid="tab-execution-canvas">
          <Target className="w-4 h-4 mr-2" />
          Execution Canvas
        </TabsTrigger>
        <TabsTrigger value="success-stories" data-testid="tab-success-stories">
          <Star className="w-4 h-4 mr-2" />
          Success Stories
        </TabsTrigger>
        <TabsTrigger value="value-cases" data-testid="tab-value-cases">
          <DollarSign className="w-4 h-4 mr-2" />
          Value Cases
        </TabsTrigger>
        <TabsTrigger value="handoff" data-testid="tab-handoff">
          <ArrowUpRight className="w-4 h-4 mr-2" />
          Handoff
        </TabsTrigger>
      </TabsList>

      {/* Execution Canvas - Core 3-5 KPIs per engagement (Trend #1: Outcomes & shared KPIs) */}
      <TabsContent value="execution-canvas" className="space-y-6">
        <Card className="bg-gradient-to-r from-primary/5 to-emerald-500/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Execution Canvas</CardTitle>
                  <CardDescription>Track shared KPIs, value progress, and actionable next steps</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                {kpis.filter(k => k.baselineValue && k.targetValue).length} / 5 Defined
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Summary stats */}
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground">Total Value Potential</p>
                <p className="text-2xl font-bold text-primary">${(totalValue / 1000000).toFixed(1)}M</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground">Strategic Priorities</p>
                <p className="text-2xl font-bold">{jobThemes.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground">Discovery Insights</p>
                <p className="text-2xl font-bold">{insights.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Health Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium">On Track</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600">
                {kpis.filter(k => k.status === "on-track").length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium">At Risk</span>
              </div>
              <p className="text-2xl font-bold text-amber-600">
                {kpis.filter(k => k.status === "at-risk").length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-red-500/5 border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium">Off Track</span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {kpis.filter(k => k.status === "off-track").length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-muted/30 border-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Needs Data</span>
              </div>
              <p className="text-2xl font-bold text-muted-foreground">
                {kpis.filter(k => k.status === "no-data").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Shared KPIs Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Shared Outcome KPIs
            </CardTitle>
            <CardDescription>
              Define baseline, target, and benefit owner for each key outcome
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpis.slice(0, 5).map((kpi, index) => {
                const statusConfig: Record<string, { color: string; bg: string; icon: typeof CheckCircle }> = {
                  "on-track": { color: "text-emerald-600", bg: "bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle },
                  "at-risk": { color: "text-amber-600", bg: "bg-amber-500/10 border-amber-500/30", icon: AlertTriangle },
                  "off-track": { color: "text-red-600", bg: "bg-red-500/10 border-red-500/30", icon: AlertCircle },
                  "no-data": { color: "text-muted-foreground", bg: "border", icon: HelpCircle }
                };
                const config = statusConfig[kpi.status] || statusConfig["no-data"];
                const StatusIcon = config.icon;
                
                return (
                  <div key={kpi.id} className={`p-4 rounded-lg ${config.bg} hover-elevate`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.color} bg-background`}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{kpi.name}</h4>
                          <p className="text-xs text-muted-foreground">{kpi.unit || "units"}</p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${config.color} border-current`}
                      >
                        {kpi.status === "on-track" && "On Track"}
                        {kpi.status === "at-risk" && "At Risk"}
                        {kpi.status === "off-track" && "Off Track"}
                        {kpi.status === "no-data" && "Needs Data"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="p-2 rounded bg-background/80">
                        <span className="text-muted-foreground block text-xs">Baseline</span>
                        <span className="font-medium">{kpi.baselineValue ?? "—"}</span>
                      </div>
                      <div className="p-2 rounded bg-background/80">
                        <span className="text-muted-foreground block text-xs">Current</span>
                        <span className={`font-medium ${config.color}`}>{kpi.currentValue ?? "—"}</span>
                      </div>
                      <div className="p-2 rounded bg-background/80">
                        <span className="text-muted-foreground block text-xs">Target</span>
                        <span className="font-medium text-primary">{kpi.targetValue ?? "—"}</span>
                      </div>
                      <div className="p-2 rounded bg-background/80">
                        <span className="text-muted-foreground block text-xs">Progress</span>
                        <span className="font-medium text-emerald-600">
                          {kpi.baselineValue && kpi.targetValue && kpi.currentValue
                            ? `${Math.round(((kpi.currentValue - kpi.baselineValue) / (kpi.targetValue - kpi.baselineValue)) * 100)}%`
                            : "—"
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {kpis.length === 0 && (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No KPIs defined yet</p>
                  <Link href={`/projects/${projectId}/discovery`}>
                    <Button data-testid="button-define-kpis">
                      <Plus className="w-4 h-4 mr-2" />
                      Define KPIs in Discovery
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actionable Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Actionable Next Steps
            </CardTitle>
            <CardDescription>Recommended actions based on current progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kpis.filter(k => k.status === "no-data").length > 0 && (
                <div className="p-3 rounded-lg bg-muted/50 border flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Gather baseline data for KPIs</p>
                    <p className="text-xs text-muted-foreground">
                      {kpis.filter(k => k.status === "no-data").length} KPI(s) need baseline values defined to track progress
                    </p>
                  </div>
                </div>
              )}
              {kpis.filter(k => k.status === "at-risk").length > 0 && (
                <div className="p-3 rounded-lg bg-amber-500/5 border-amber-500/20 border flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Review at-risk KPIs</p>
                    <p className="text-xs text-muted-foreground">
                      {kpis.filter(k => k.status === "at-risk").length} KPI(s) are trending behind target - schedule a review
                    </p>
                  </div>
                </div>
              )}
              {kpis.filter(k => k.status === "off-track").length > 0 && (
                <div className="p-3 rounded-lg bg-red-500/5 border-red-500/20 border flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Take corrective action</p>
                    <p className="text-xs text-muted-foreground">
                      {kpis.filter(k => k.status === "off-track").length} KPI(s) are significantly behind - immediate intervention recommended
                    </p>
                  </div>
                </div>
              )}
              {insights.filter(i => i.priority === "high").length > 0 && (
                <div className="p-3 rounded-lg bg-purple-500/5 border-purple-500/20 border flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Review high-priority insights</p>
                    <p className="text-xs text-muted-foreground">
                      {insights.filter(i => i.priority === "high").length} strategic insight(s) flagged for discussion
                    </p>
                  </div>
                </div>
              )}
              {kpis.length > 0 && kpis.every(k => k.status === "on-track") && (
                <div className="p-3 rounded-lg bg-emerald-500/5 border-emerald-500/20 border flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">All KPIs on track</p>
                    <p className="text-xs text-muted-foreground">
                      Consider documenting wins as success stories for future opportunities
                    </p>
                  </div>
                </div>
              )}
              {kpis.length === 0 && insights.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Complete discovery and define KPIs to see recommended actions
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Value-linked commercial notes (Trend #2) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Value-Linked Commercial Elements
            </CardTitle>
            <CardDescription>
              Success fees and leading indicators tied to outcomes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg border border-dashed">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium">Leading Indicators</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Adoption rate, completion %, manager coaching quality
                </p>
              </div>
              <div className="p-4 rounded-lg border border-dashed">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-amber-600" />
                  <span className="font-medium">Success Fee Opportunities</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Optional success fees on controllable outcomes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Guided Discovery - AI-assisted research with Korn Ferry methodologies (Miller Heiman, SPIN, PSS) */}
      <TabsContent value="guided-discovery" className="space-y-6">
        <Card className="bg-gradient-to-r from-purple-500/5 to-blue-500/5 border-purple-500/20">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Guided Discovery</CardTitle>
                  <CardDescription>AI-powered questions using Korn Ferry methodologies (Miller Heiman, SPIN, PSS)</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleStartDiscovery}
                  disabled={generateQuestionsMutation.isPending}
                  data-testid="button-generate-questions"
                >
                  {generateQuestionsMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Discovery
                    </>
                  )}
                </Button>
                <Link href={`/projects/${projectId}/discovery`}>
                  <Button variant="outline" size="sm" data-testid="button-full-discovery">
                    Full Discovery
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-sm">Total Questions</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{discoveryQuestions.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-sm">Asked</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600">
                  {discoveryQuestions.filter(q => q.isAsked).length}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-sm">High Priority Insights</span>
                </div>
                <p className="text-2xl font-bold text-amber-600">
                  {insights.filter(i => i.priority === "high").length}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-sm">Job Themes</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{jobThemes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {questionsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : discoveryQuestions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Discovery Questions Yet</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Generate AI-powered questions based on your discovery insights. Ensure you have job themes set up first.
              </p>
              <Button 
                onClick={handleStartDiscovery}
                disabled={generateQuestionsMutation.isPending}
                data-testid="button-generate-questions-empty"
              >
                {generateQuestionsMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start AI Discovery
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {["SPIN", "MILLER_HEIMAN", "PSS"].map(methodology => {
              const questions = groupedQuestions[methodology] || [];
              if (questions.length === 0) return null;
              const meta = methodologyMeta[methodology];
              const isExpanded = expandedMethodologies[methodology];
              
              return (
                <Collapsible 
                  key={methodology}
                  open={isExpanded}
                  onOpenChange={(open) => setExpandedMethodologies(prev => ({ ...prev, [methodology]: open }))}
                >
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover-elevate">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={`${meta.color} border`}>{meta.label}</Badge>
                            <div>
                              <CardTitle className="text-base">{meta.description}</CardTitle>
                              <CardDescription>{questions.length} questions • {questions.filter(q => q.isAsked).length} asked</CardDescription>
                            </div>
                          </div>
                          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {questions.sort((a, b) => a.sortOrder - b.sortOrder).map(q => (
                            <div 
                              key={q.id} 
                              className={`p-4 rounded-lg border ${q.isAsked ? "border-emerald-500/30 bg-emerald-500/5" : "hover-elevate"}`}
                              data-testid={`question-card-${q.id}`}
                            >
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{q.question}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{q.purpose}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant={q.isAsked ? "outline" : "default"}
                                  onClick={() => markQuestionAskedMutation.mutate({ questionId: q.id, isAsked: !q.isAsked })}
                                  disabled={markQuestionAskedMutation.isPending}
                                  data-testid={`button-mark-asked-${q.id}`}
                                >
                                  {q.isAsked ? (
                                    <>
                                      <Check className="w-3 h-3 mr-1" />
                                      Asked
                                    </>
                                  ) : (
                                    "Mark Asked"
                                  )}
                                </Button>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                {q.methodologyStage && (
                                  <Badge variant="outline" className="text-xs">
                                    {stageMeta[q.methodologyStage] || q.methodologyStage}
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-xs">
                                  {q.questionType}
                                </Badge>
                                {q.relatedKPI && (
                                  <Badge className="bg-primary/10 text-primary text-xs">
                                    KPI: {q.relatedKPI}
                                  </Badge>
                                )}
                              </div>
                              {q.followUpHint && (
                                <div className="mt-3 p-2 rounded bg-muted/50 text-xs text-muted-foreground">
                                  <span className="font-medium">Follow-up hint:</span> {q.followUpHint}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI-Generated Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.slice(0, 5).map(insight => (
                  <div key={insight.id} className="p-3 rounded-lg border hover-elevate">
                    <p className="text-sm mb-2">{insight.content}</p>
                    <div className="flex flex-wrap gap-1">
                      {insight.priority && (
                        <Badge variant={insight.priority === "high" ? "destructive" : "outline"} className="text-xs">
                          {insight.priority}
                        </Badge>
                      )}
                      {insight.kornferryPillar && (
                        <Badge className="bg-primary/10 text-primary text-xs">{insight.kornferryPillar}</Badge>
                      )}
                    </div>
                  </div>
                ))}
                {insights.length === 0 && (
                  <div className="text-center py-6">
                    <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Run AI research to generate insights</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Discovery Notes
              </CardTitle>
              <Button size="sm" onClick={() => setIsAddNoteOpen(true)} data-testid="button-add-note">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notes.slice(0, 5).map(note => (
                  <div key={note.id} className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm">{note.content}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">{note.category || "general"}</Badge>
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {notes.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No notes yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="value-cases" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Value Cases</CardTitle>
            <CardDescription>Business value propositions for this engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {valueCases.map(vc => (
                <div key={vc.id} className="p-4 rounded-lg border hover-elevate">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{vc.title}</h4>
                      {vc.description && (
                        <p className="text-sm text-muted-foreground mt-1">{vc.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{vc.status}</Badge>
                      {vc.estimatedValue && (
                        <p className="text-lg font-bold text-green-600 mt-1">
                          ${(vc.estimatedValue / 1000000).toFixed(2)}M
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {valueCases.length === 0 && (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No value cases created yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Success Stories - KF success stories for proof points (Trend #6: HR value quantification) */}
      <TabsContent value="success-stories" className="space-y-6">
        <Card className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-amber-500/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <CardTitle>Korn Ferry Success Stories</CardTitle>
                <CardDescription>Verified case studies and proof points for value conversations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-sm">ROI Stories</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Proven impact ranges and financial bridges
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-sm">Industry Benchmarks</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Selection accuracy, development lift, turnover changes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-600" />
              Relevant Success Stories
            </CardTitle>
            <CardDescription>
              Stories matching this engagement's solution areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Sample success story cards - would be populated from API */}
              <div className="p-4 rounded-lg border hover-elevate">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">Leadership Development Program</h4>
                  <Badge className="bg-emerald-500/10 text-emerald-600">Verified</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Fortune 500 technology company achieved 35% improvement in leadership pipeline quality
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">Develop</Badge>
                  <Badge variant="outline" className="text-xs">Leadership</Badge>
                  <Badge variant="secondary" className="text-xs">+35% Pipeline Quality</Badge>
                </div>
              </div>
              <div className="p-4 rounded-lg border hover-elevate">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">Sales Effectiveness Transformation</h4>
                  <Badge className="bg-emerald-500/10 text-emerald-600">Verified</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Global manufacturing company increased sales productivity by 22% within 12 months
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">Transform</Badge>
                  <Badge variant="outline" className="text-xs">Sales</Badge>
                  <Badge variant="secondary" className="text-xs">+22% Productivity</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Handoff - Transition to Delivery (Sales to Delivery flow) */}
      <TabsContent value="handoff" className="space-y-6">
        <Card className="bg-gradient-to-r from-emerald-500/5 to-primary/5 border-emerald-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <ArrowUpRight className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <CardTitle>Handoff to Delivery</CardTitle>
                  <CardDescription>Transition this engagement to the delivery team</CardDescription>
                </div>
              </div>
              <Badge variant={kpis.length >= 3 && valueCases.length >= 1 ? "default" : "secondary"}>
                {kpis.length >= 3 && valueCases.length >= 1 ? "Ready for Handoff" : "Preparation Needed"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Before handing off, ensure the Value Canvas is complete with shared KPIs, baselines, and targets.
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <div className={`p-4 rounded-lg border ${kpis.length >= 3 ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {kpis.length >= 3 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    )}
                    <span className="font-medium text-sm">Value Canvas KPIs</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {kpis.length} / 3 minimum defined
                  </p>
                </div>
                <div className={`p-4 rounded-lg border ${valueCases.length >= 1 ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {valueCases.length >= 1 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    )}
                    <span className="font-medium text-sm">Value Cases</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {valueCases.length} case(s) created
                  </p>
                </div>
                <div className={`p-4 rounded-lg border ${insights.length >= 5 ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {insights.length >= 5 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    )}
                    <span className="font-medium text-sm">Discovery Complete</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {insights.length} insights captured
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              Handoff will notify the delivery team and lock value canvas items
            </p>
            <Link href={`/projects/${projectId}/delivery`}>
              <Button 
                disabled={kpis.length < 3 || valueCases.length < 1}
                data-testid="button-handoff-to-delivery"
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Complete Handoff
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Handoff Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className={`w-5 h-5 ${kpis.length >= 3 ? "text-emerald-600" : "text-muted-foreground"}`} />
                <span className={kpis.length >= 3 ? "" : "text-muted-foreground"}>
                  3-5 shared KPIs defined with baselines and targets
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className={`w-5 h-5 ${valueCases.length >= 1 ? "text-emerald-600" : "text-muted-foreground"}`} />
                <span className={valueCases.length >= 1 ? "" : "text-muted-foreground"}>
                  At least one value case created
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className={`w-5 h-5 ${insights.length >= 5 ? "text-emerald-600" : "text-muted-foreground"}`} />
                <span className={insights.length >= 5 ? "" : "text-muted-foreground"}>
                  Discovery insights documented (5+ recommended)
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Success fee / commercial terms noted (optional)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  const renderDeliveryWorkspace = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid grid-cols-5 w-full max-w-3xl">
        <TabsTrigger value="health" data-testid="tab-health">
          <Activity className="w-4 h-4 mr-2" />
          Health Dashboard
        </TabsTrigger>
        <TabsTrigger value="kpis" data-testid="tab-kpis">
          <BarChart3 className="w-4 h-4 mr-2" />
          KPI Tracking
        </TabsTrigger>
        <TabsTrigger value="qbr" data-testid="tab-qbr">
          <Calendar className="w-4 h-4 mr-2" />
          QBR
        </TabsTrigger>
        <TabsTrigger value="governance" data-testid="tab-governance">
          <Layers className="w-4 h-4 mr-2" />
          Value Governance
        </TabsTrigger>
        <TabsTrigger value="success-capture" data-testid="tab-success-capture">
          <Star className="w-4 h-4 mr-2" />
          Success Capture
        </TabsTrigger>
      </TabsList>

      {/* Health Dashboard - CS-style health scores (Trend #4: CS playbooks in value governance) */}
      <TabsContent value="health" className="space-y-6">
        <Card className="bg-gradient-to-r from-emerald-500/5 to-blue-500/5 border-emerald-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <CardTitle>Engagement Health Dashboard</CardTitle>
                  <CardDescription>Real-time health scores and value delivery status</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Overall Health</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${kpisAtRisk === 0 ? "bg-emerald-500" : kpisAtRisk <= 2 ? "bg-amber-500" : "bg-red-500"}`} />
                  <span className="text-xl font-bold">
                    {kpisAtRisk === 0 ? "Healthy" : kpisAtRisk <= 2 ? "At Risk" : "Critical"}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-sm">On Track</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600">{kpisOnTrack}</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-sm">At Risk</span>
                </div>
                <p className="text-2xl font-bold text-amber-600">{kpisAtRisk}</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-sm">Total KPIs</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{kpis.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-sm">Value Realized</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">${(totalValue * 0.3 / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                KPI Health Summary
              </CardTitle>
              <Button size="sm" onClick={() => setIsLogKPIOpen(true)} data-testid="button-log-kpi">
                <Plus className="w-4 h-4 mr-1" />
                Log
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kpis.slice(0, 5).map(kpi => (
                  <div key={kpi.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{kpi.name}</span>
                      <div className="flex items-center gap-2">
                        {/* AI Trend Flag */}
                        {kpi.currentValue && kpi.targetValue && (
                          <Badge variant="outline" className="text-xs">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {kpi.status === "on-track" ? "Trending Up" : "Needs Attention"}
                          </Badge>
                        )}
                        <Badge variant={
                          kpi.status === "on-track" ? "default" :
                          kpi.status === "at-risk" ? "secondary" : "destructive"
                        }>
                          {kpi.status}
                        </Badge>
                      </div>
                    </div>
                    <Progress 
                      value={kpi.currentValue && kpi.targetValue ? 
                        Math.min(100, (kpi.currentValue / kpi.targetValue) * 100) : 0
                      } 
                      className="flex-1"
                    />
                  </div>
                ))}
                {kpis.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No KPIs tracked yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Priority Themes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {jobThemes.slice(0, 5).map(theme => (
                  <div key={theme.id} className="p-3 rounded-lg bg-muted/50 hover-elevate">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{theme.jobName}</span>
                      <Badge variant="outline">{theme.solutionArea || "general"}</Badge>
                    </div>
                    {theme.capabilityName && (
                      <p className="text-xs text-muted-foreground mt-1">{theme.capabilityName}</p>
                    )}
                  </div>
                ))}
                {jobThemes.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No priorities defined yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="kpis" className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>KPI Tracking</CardTitle>
              <CardDescription>Monitor and log KPI measurements</CardDescription>
            </div>
            <Button onClick={() => setIsLogKPIOpen(true)} data-testid="button-log-kpi-main">
              <Plus className="w-4 h-4 mr-2" />
              Log Measurement
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpis.map(kpi => (
                <div key={kpi.id} className="p-4 rounded-lg border hover-elevate">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{kpi.name}</h4>
                      <p className="text-sm text-muted-foreground">{kpi.unit || "units"}</p>
                    </div>
                    <Badge variant={
                      kpi.status === "on-track" ? "default" :
                      kpi.status === "at-risk" ? "secondary" : 
                      kpi.status === "off-track" ? "destructive" : "outline"
                    }>
                      {kpi.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Baseline</span>
                      <p className="font-medium">{kpi.baselineValue ?? "—"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Current</span>
                      <p className="font-medium">{kpi.currentValue ?? "—"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Target</span>
                      <p className="font-medium">{kpi.targetValue ?? "—"}</p>
                    </div>
                  </div>
                  <Progress 
                    value={kpi.currentValue && kpi.targetValue ? 
                      Math.min(100, ((kpi.currentValue - (kpi.baselineValue || 0)) / ((kpi.targetValue || 1) - (kpi.baselineValue || 0))) * 100) : 0
                    } 
                    className="mt-3"
                  />
                </div>
              ))}
              {kpis.length === 0 && (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No KPIs to track</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* QBR - Quarterly Business Reviews (Trend #4: CS playbooks in value governance) */}
      <TabsContent value="qbr" className="space-y-6">
        <Card className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border-blue-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Quarterly Business Review</CardTitle>
                  <CardDescription>Generate QBR decks and capture evidence</CardDescription>
                </div>
              </div>
              <Button data-testid="button-generate-qbr">
                <Download className="w-4 h-4 mr-2" />
                Generate QBR Deck
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-sm">Evidence Collected</span>
                </div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Screenshots & documents</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-sm">Success Stories</span>
                </div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Ready for QBR</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-sm">KPIs Tracked</span>
                </div>
                <p className="text-2xl font-bold">{kpis.length}</p>
                <p className="text-xs text-muted-foreground">With baseline & target</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              Evidence Collection
            </CardTitle>
            <CardDescription>Upload screenshots, documents, and testimonials for QBR</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <FileCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                Drag and drop files here, or click to upload
              </p>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Upload Evidence
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Value Governance - VRO principles (Trend #3: Value Realisation Office) */}
      <TabsContent value="governance" className="space-y-6">
        <Card className="bg-gradient-to-r from-purple-500/5 to-pink-500/5 border-purple-500/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Layers className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>Value Governance</CardTitle>
                <CardDescription>Value Realisation Office principles and tracking</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-sm">Benefit Owner Assigned</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Each KPI has a designated client owner accountable for measurement
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-sm">Regular Cadence</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Monthly check-ins with quarterly reviews scheduled
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Governance Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className={`w-5 h-5 ${kpis.length >= 3 ? "text-emerald-600" : "text-muted-foreground"}`} />
                <span className={kpis.length >= 3 ? "" : "text-muted-foreground"}>
                  3-5 shared KPIs defined with benefit owners
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Monthly KPI review cadence established
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Quarterly business review scheduled
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Value realisation report template prepared
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Issues & Risks
            </CardTitle>
            <CardDescription>Track blockers and risks to value delivery</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No issues or risks logged yet</p>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Log Issue
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Success Capture - Capture success stories (Trend #6: HR value quantification) */}
      <TabsContent value="success-capture" className="space-y-6">
        <Card className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-amber-500/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <CardTitle>Success Story Capture</CardTitle>
                <CardDescription>Document wins and outcomes for future proof points</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-sm">Quantified Outcomes</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Document measurable improvements with before/after data
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-sm">Client Testimonials</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Capture quotes and feedback from stakeholders
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-600" />
                Captured Success Stories
              </CardTitle>
              <CardDescription>Stories ready for verification and library addition</CardDescription>
            </div>
            <Button data-testid="button-capture-story">
              <Plus className="w-4 h-4 mr-2" />
              Capture Story
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No success stories captured yet</p>
              <p className="text-sm text-muted-foreground">
                Document wins as they happen to build your proof point library
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Story Template</CardTitle>
            <CardDescription>Use this structure to capture compelling success stories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-lg border">
                <span className="text-sm font-medium">Challenge</span>
                <p className="text-xs text-muted-foreground mt-1">What was the business problem?</p>
              </div>
              <div className="p-3 rounded-lg border">
                <span className="text-sm font-medium">Solution</span>
                <p className="text-xs text-muted-foreground mt-1">What Korn Ferry solution was implemented?</p>
              </div>
              <div className="p-3 rounded-lg border">
                <span className="text-sm font-medium">Outcome</span>
                <p className="text-xs text-muted-foreground mt-1">What measurable results were achieved?</p>
              </div>
              <div className="p-3 rounded-lg border">
                <span className="text-sm font-medium">Quote</span>
                <p className="text-xs text-muted-foreground mt-1">Client testimonial or endorsement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  const otherRole = isSalesRole ? "delivery" : isDeliveryRole ? "sales" : null;
  const otherRoleLabel = otherRole === "sales" ? "Sales Portal" : otherRole === "delivery" ? "Delivery Portal" : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-16 lg:h-20 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Link href="/accounts">
                  <Button variant="ghost" size="sm" className="h-auto py-1 px-2" data-testid="breadcrumb-accounts">
                    <Building2 className="w-3 h-3 mr-1" />
                    Accounts
                  </Button>
                </Link>
                <ChevronRight className="w-4 h-4" />
                {accountId && (
                  <>
                    <Link href={`/accounts/${accountId}/${role}`}>
                      <Button variant="ghost" size="sm" className="h-auto py-1 px-2" data-testid="breadcrumb-account">
                        {project.companyName}
                      </Button>
                    </Link>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
                <span className="font-medium text-foreground">{project.name}</span>
                <ChevronRight className="w-4 h-4" />
                <Badge variant="secondary">{roleLabels[role]}</Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="hidden sm:flex">
                {project.lifecyclePhase ? phaseLabels[project.lifecyclePhase] || project.lifecyclePhase : "Active"}
              </Badge>
              
              {project.ragStatus && (
                <div className={`w-3 h-3 rounded-full ${ragColors[project.ragStatus] || "bg-gray-400"}`} />
              )}

              {otherRole && (
                <Link href={`/projects/${projectId}/${otherRole}`}>
                  <Button variant="ghost" size="sm" data-testid={`button-switch-to-${otherRole}`}>
                    Switch to {otherRoleLabel}
                  </Button>
                </Link>
              )}

              <Link href={`/projects/${projectId}`}>
                <Button variant="outline" size="sm" data-testid="button-project-detail">
                  Full Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <RoleIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <p className="text-muted-foreground">{roleLabels[role]} Workspace</p>
            </div>
          </div>
        </div>

        {isSalesRole && renderSalesWorkspace()}
        {isDeliveryRole && renderDeliveryWorkspace()}
        {!isSalesRole && !isDeliveryRole && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Workspace for {roleLabels[role]} coming soon</p>
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={isLogKPIOpen} onOpenChange={setIsLogKPIOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log KPI Measurement</DialogTitle>
            <DialogDescription>Record an actual value for a KPI</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select KPI</Label>
              <Select
                value={selectedKPI?.id.toString() || ""}
                onValueChange={(v) => setSelectedKPI(kpis.find(k => k.id.toString() === v) || null)}
              >
                <SelectTrigger data-testid="select-kpi">
                  <SelectValue placeholder="Choose a KPI" />
                </SelectTrigger>
                <SelectContent>
                  {kpis.map(kpi => (
                    <SelectItem key={kpi.id} value={kpi.id.toString()}>
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
                  <Label>Actual Value</Label>
                  <Input
                    type="number"
                    value={kpiActualValue}
                    onChange={(e) => setKpiActualValue(e.target.value)}
                    placeholder="Enter measured value"
                    data-testid="input-kpi-value"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Note (optional)</Label>
                  <Textarea
                    value={kpiNote}
                    onChange={(e) => setKpiNote(e.target.value)}
                    placeholder="Add context..."
                    data-testid="input-kpi-note"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogKPIOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (selectedKPI && kpiActualValue) {
                  logKPIMutation.mutate({
                    kpiId: selectedKPI.id,
                    actualValue: parseFloat(kpiActualValue),
                    note: kpiNote
                  });
                }
              }}
              disabled={!selectedKPI || !kpiActualValue || logKPIMutation.isPending}
              data-testid="button-save-kpi"
            >
              {logKPIMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>Capture observations and insights</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={newNoteCategory} onValueChange={setNewNoteCategory}>
                <SelectTrigger data-testid="select-note-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="discovery">Discovery</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="action">Action Item</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Write your note..."
                rows={4}
                data-testid="input-note-content"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddNoteOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (newNoteContent.trim()) {
                  addNoteMutation.mutate({
                    content: newNoteContent.trim(),
                    category: newNoteCategory
                  });
                }
              }}
              disabled={!newNoteContent.trim() || addNoteMutation.isPending}
              data-testid="button-save-note"
            >
              {addNoteMutation.isPending ? "Saving..." : "Save Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discovery Mode Selection Dialog */}
      <Dialog open={isDiscoveryModeDialogOpen} onOpenChange={setIsDiscoveryModeDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Discovery Mode
            </DialogTitle>
            <DialogDescription>
              Choose how you want AI to generate discovery questions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <RadioGroup value={discoveryMode} onValueChange={(v) => setDiscoveryMode(v as "focused" | "full")}>
              <div 
                className={`p-4 rounded-lg border cursor-pointer transition-all ${discoveryMode === "focused" ? "border-primary bg-primary/5" : "hover-elevate"}`}
                onClick={() => setDiscoveryMode("focused")}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="focused" id="focused" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="focused" className="text-base font-medium cursor-pointer">
                      Focused Search
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Focus on a specific Korn Ferry solution area. Best when you know which capability will deliver the most impact.
                    </p>
                    {discoveryMode === "focused" && (
                      <div className="mt-4">
                        <Label className="text-sm">Select Solution Area</Label>
                        <Select value={selectedSolutionArea} onValueChange={setSelectedSolutionArea}>
                          <SelectTrigger className="mt-2" data-testid="select-solution-area">
                            <SelectValue placeholder="Choose a solution area..." />
                          </SelectTrigger>
                          <SelectContent>
                            {solutionAreas.map(area => (
                              <SelectItem key={area.id} value={area.id}>
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">{area.name}</span>
                                  <span className="text-xs text-muted-foreground">{area.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div 
                className={`p-4 rounded-lg border cursor-pointer transition-all ${discoveryMode === "full" ? "border-primary bg-primary/5" : "hover-elevate"}`}
                onClick={() => setDiscoveryMode("full")}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="full" id="full" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="full" className="text-base font-medium cursor-pointer">
                      We Are Korn Ferry Search
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Comprehensive discovery across all Korn Ferry solutions. Groups questions by capability and recommends solution combinations for maximum impact.
                    </p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {solutionAreas.map(area => (
                        <Badge key={area.id} variant="outline" className="text-xs">
                          {area.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDiscoveryModeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRunDiscovery}
              disabled={generateQuestionsMutation.isPending || (discoveryMode === "focused" && !selectedSolutionArea)}
              data-testid="button-run-discovery"
            >
              {generateQuestionsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Run Discovery
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
