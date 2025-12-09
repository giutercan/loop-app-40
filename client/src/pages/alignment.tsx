import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  TrendingUp,
  Gauge,
  Shield,
  Users,
  Target,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Loader2,
  Check,
  Edit2,
  CheckCircle2,
  Circle,
  BarChart3,
  Zap,
  Lightbulb,
  Clock,
  CheckCircle
} from "lucide-react";
import type { Project, JobThemeKPI } from "@shared/schema";
import { 
  VALUE_PILLARS, 
  LEADING_INDICATORS, 
  LAGGING_INDICATORS,
  SOLUTION_VALUE_PATTERNS,
  type ValuePillarId 
} from "@shared/value-frameworks";
import { ShareAlignmentDialog } from "@/components/ShareAlignmentDialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Pillar icons mapping
const PILLAR_ICONS = {
  grow: TrendingUp,
  optimise: Gauge,
  derisk: Shield,
  strengthen: Users
};

// Pillar colors for visual grouping
const PILLAR_COLORS = {
  grow: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-600", accent: "bg-emerald-500" },
  optimise: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-600", accent: "bg-blue-500" },
  derisk: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-600", accent: "bg-amber-500" },
  strengthen: { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-600", accent: "bg-violet-500" }
};

// Customer-focused KPI with deliverables
interface CustomerKPI {
  id: string;
  name: string;
  description: string;
  pillar: ValuePillarId;
  category: string;
  unit: string;
  benchmarkRange?: { low: number; mid: number; high: number };
  type: "leading" | "lagging";
  baseline: string | null;
  target: string | null;
  deliverables: Deliverable[];
  isSelected: boolean;
}

interface Deliverable {
  id: string;
  title: string;
  description: string;
  timeline: string;
  status: "planned" | "in_progress" | "completed";
}

// Map solution patterns to deliverables
const SOLUTION_DELIVERABLES: Record<string, Deliverable[]> = {
  leadership_development: [
    { id: "ld1", title: "Leadership Assessment", description: "360° competency evaluation and gap analysis", timeline: "Month 1-2", status: "planned" },
    { id: "ld2", title: "Executive Coaching", description: "1:1 coaching for senior leaders", timeline: "Month 2-12", status: "planned" },
    { id: "ld3", title: "Development Program", description: "Cohort-based leadership development", timeline: "Month 3-12", status: "planned" },
    { id: "ld4", title: "Succession Planning", description: "Critical role mapping and successor identification", timeline: "Month 4-8", status: "planned" }
  ],
  sales_effectiveness: [
    { id: "se1", title: "Sales Capability Assessment", description: "Evaluate current sales team competencies", timeline: "Month 1-2", status: "planned" },
    { id: "se2", title: "Sales Methodology Training", description: "Implement proven sales frameworks", timeline: "Month 2-4", status: "planned" },
    { id: "se3", title: "Coaching Infrastructure", description: "Manager coaching capability development", timeline: "Month 3-6", status: "planned" },
    { id: "se4", title: "Performance Analytics", description: "Dashboard and metrics implementation", timeline: "Month 2-4", status: "planned" }
  ],
  org_transformation: [
    { id: "ot1", title: "Organization Design", description: "Structure analysis and redesign", timeline: "Month 1-3", status: "planned" },
    { id: "ot2", title: "Role Clarity Workshop", description: "Define accountabilities and decision rights", timeline: "Month 2-4", status: "planned" },
    { id: "ot3", title: "Change Management", description: "Communication and adoption support", timeline: "Month 3-12", status: "planned" },
    { id: "ot4", title: "Culture Alignment", description: "Values activation and behavior change", timeline: "Month 4-12", status: "planned" }
  ],
  talent_acquisition: [
    { id: "ta1", title: "Hiring Process Optimization", description: "Streamline recruitment workflow", timeline: "Month 1-2", status: "planned" },
    { id: "ta2", title: "Assessment Integration", description: "Predictive hiring assessments", timeline: "Month 2-3", status: "planned" },
    { id: "ta3", title: "Employer Branding", description: "EVP development and activation", timeline: "Month 2-4", status: "planned" },
    { id: "ta4", title: "Onboarding Excellence", description: "New hire integration program", timeline: "Month 3-6", status: "planned" }
  ],
  rewards_optimization: [
    { id: "ro1", title: "Compensation Benchmarking", description: "Market analysis and positioning", timeline: "Month 1-2", status: "planned" },
    { id: "ro2", title: "Pay Structure Design", description: "Salary bands and progression paths", timeline: "Month 2-4", status: "planned" },
    { id: "ro3", title: "Incentive Program", description: "Variable pay and recognition design", timeline: "Month 3-5", status: "planned" },
    { id: "ro4", title: "Total Rewards Communication", description: "Employee value proposition messaging", timeline: "Month 4-6", status: "planned" }
  ]
};

type FinalizedJobsResponse = {
  finalized: boolean;
  jobs: Array<{
    id: number;
    jobName: string;
    capabilityName: string;
    solutionArea: string | null;
    kpis: Array<{
      id: number;
      kpiName: string;
      kpiType: "primary" | "supporting";
      unit: string;
      definition: string | null;
      baselineValue: string | null;
      targetValue: string | null;
      benchmarkValue: string | null;
      isSelected: boolean;
    }>;
  }>;
};

export default function AlignmentPage() {
  const [, params] = useRoute("/projects/:id/alignment");
  const projectId = parseInt(params?.id || "0");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [selectedKPI, setSelectedKPI] = useState<CustomerKPI | null>(null);
  const [editingBaseline, setEditingBaseline] = useState(false);
  const [editingTarget, setEditingTarget] = useState(false);
  const [tempBaseline, setTempBaseline] = useState("");
  const [tempTarget, setTempTarget] = useState("");
  const [expandedDeliverables, setExpandedDeliverables] = useState(true);
  const [expandedRecommendations, setExpandedRecommendations] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState<Array<{
    title: string;
    description: string;
    expectedImpact: string;
    timeline: string;
    confidence: "high" | "medium" | "low";
    relatedSuccessPattern?: string;
    keyActivities: string[];
  }>>([]);

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: finalizedData, isLoading } = useQuery<FinalizedJobsResponse>({
    queryKey: [`/api/projects/${projectId}/alignment/finalized-jobs`],
    enabled: !!projectId,
  });

  // Determine the solution pattern from finalized jobs
  const solutionPattern = useMemo(() => {
    if (!finalizedData?.jobs?.length) return "leadership_development";
    // Look at the first job's capability or solution area to determine pattern
    const firstJob = finalizedData.jobs[0];
    const capName = firstJob.capabilityName?.toLowerCase() || "";
    const solArea = firstJob.solutionArea?.toLowerCase() || "";
    
    if (capName.includes("sales") || solArea.includes("sales")) return "sales_effectiveness";
    if (capName.includes("leadership") || solArea.includes("leadership")) return "leadership_development";
    if (capName.includes("org") || solArea.includes("transformation")) return "org_transformation";
    if (capName.includes("talent") || solArea.includes("acquisition")) return "talent_acquisition";
    if (capName.includes("reward") || solArea.includes("compensation")) return "rewards_optimization";
    return "leadership_development";
  }, [finalizedData]);

  // Build customer KPIs from the solution pattern
  const customerKPIs = useMemo<CustomerKPI[]>(() => {
    const pattern = SOLUTION_VALUE_PATTERNS[solutionPattern as keyof typeof SOLUTION_VALUE_PATTERNS];
    if (!pattern) return [];

    const kpis: CustomerKPI[] = [];
    const deliverables = SOLUTION_DELIVERABLES[solutionPattern] || [];

    // Add leading indicators
    pattern.recommendedKPIs.leading.forEach((kpiId) => {
      const indicator = LEADING_INDICATORS[kpiId as keyof typeof LEADING_INDICATORS];
      if (indicator) {
        // Check if we have existing data from finalized jobs
        const existingKpi = finalizedData?.jobs
          ?.flatMap(j => j.kpis)
          ?.find(k => k.kpiName.toLowerCase().includes(indicator.name.toLowerCase().split(" ")[0]));

        kpis.push({
          id: indicator.id,
          name: indicator.name,
          description: indicator.description,
          pillar: indicator.pillar as ValuePillarId,
          category: indicator.category,
          unit: indicator.unit,
          benchmarkRange: indicator.benchmarkRange,
          type: "leading",
          baseline: existingKpi?.baselineValue || null,
          target: existingKpi?.targetValue || null,
          deliverables: deliverables.slice(0, 2), // Associate first 2 deliverables with leading
          isSelected: existingKpi?.isSelected ?? true
        });
      }
    });

    // Add lagging indicators
    pattern.recommendedKPIs.lagging.forEach((kpiId) => {
      const indicator = LAGGING_INDICATORS[kpiId as keyof typeof LAGGING_INDICATORS];
      if (indicator) {
        const existingKpi = finalizedData?.jobs
          ?.flatMap(j => j.kpis)
          ?.find(k => k.kpiName.toLowerCase().includes(indicator.name.toLowerCase().split(" ")[0]));

        kpis.push({
          id: indicator.id,
          name: indicator.name,
          description: indicator.description,
          pillar: indicator.pillar as ValuePillarId,
          category: indicator.category,
          unit: indicator.unit,
          type: "lagging",
          baseline: existingKpi?.baselineValue || null,
          target: existingKpi?.targetValue || null,
          deliverables: deliverables.slice(2), // Associate remaining deliverables with lagging
          isSelected: existingKpi?.isSelected ?? true
        });
      }
    });

    return kpis;
  }, [solutionPattern, finalizedData]);

  // Group KPIs by pillar
  const kpisByPillar = useMemo(() => {
    const grouped: Record<ValuePillarId, CustomerKPI[]> = {
      grow: [],
      optimise: [],
      derisk: [],
      strengthen: []
    };
    customerKPIs.forEach(kpi => {
      if (grouped[kpi.pillar]) {
        grouped[kpi.pillar].push(kpi);
      }
    });
    return grouped;
  }, [customerKPIs]);

  // Calculate metrics
  const totalKPIs = customerKPIs.length;
  const configuredKPIs = customerKPIs.filter(k => k.baseline && k.target).length;
  const completionPercent = totalKPIs > 0 ? Math.round((configuredKPIs / totalKPIs) * 100) : 0;

  // Auto-select first KPI on initial load
  useEffect(() => {
    if (!selectedKPI && customerKPIs.length > 0) {
      setSelectedKPI(customerKPIs[0]);
      setTempBaseline(customerKPIs[0].baseline || "");
      setTempTarget(customerKPIs[0].target || "");
    }
  }, [customerKPIs.length]); // Only run when KPIs first become available

  // Mutation to update KPI values (simulated - in real app would update job theme KPIs)
  const updateKPIMutation = useMutation({
    mutationFn: async ({ kpiId, data }: { kpiId: string; data: { baseline?: string; target?: string } }) => {
      // In real implementation, this would update the job theme KPI
      // For now, just simulate success
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/alignment/finalized-jobs`] });
      toast({
        title: "Value saved",
        description: "Your outcome target has been updated.",
      });
    }
  });

  // Start tracking
  const startTrackingMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/projects/${projectId}`, { currentPhase: "realisation" });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      toast({
        title: "Value Realization Started",
        description: "You can now track progress toward your outcomes.",
      });
      setLocation(`/projects/${projectId}/realisation`);
    }
  });

  // AI recommendations mutation
  const getRecommendationsMutation = useMutation({
    mutationFn: async (kpi: CustomerKPI) => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/kpi-value-cases`, {
        kpiName: kpi.name,
        kpiDescription: kpi.description,
        pillar: VALUE_PILLARS[kpi.pillar].name,
        category: kpi.category,
        unit: kpi.unit,
        baseline: kpi.baseline,
        target: kpi.target,
        benchmarkRange: kpi.benchmarkRange
      });
      return await res.json();
    },
    onSuccess: (data) => {
      setAiRecommendations(data.recommendations || []);
      toast({
        title: "Recommendations ready",
        description: "AI has analyzed this outcome and generated value case recommendations.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Could not generate recommendations",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const handleSaveBaseline = () => {
    if (selectedKPI && tempBaseline) {
      updateKPIMutation.mutate({ kpiId: selectedKPI.id, data: { baseline: tempBaseline } });
      setSelectedKPI({ ...selectedKPI, baseline: tempBaseline });
    }
    setEditingBaseline(false);
  };

  const handleSaveTarget = () => {
    if (selectedKPI && tempTarget) {
      updateKPIMutation.mutate({ kpiId: selectedKPI.id, data: { target: tempTarget } });
      setSelectedKPI({ ...selectedKPI, target: tempTarget });
    }
    setEditingTarget(false);
  };

  if (!project) {
    return <div className="p-6">Loading project...</div>;
  }

  const patternInfo = SOLUTION_VALUE_PATTERNS[solutionPattern as keyof typeof SOLUTION_VALUE_PATTERNS];

  return (
    <div className="h-full flex flex-col">
      {/* Clean Header */}
      <motion.div 
        className="border-b bg-background shrink-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold tracking-tight">Customer Outcomes</h1>
                  <div className="h-5 w-px bg-border" />
                  <span className="text-sm text-muted-foreground">{project.companyName}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Define the outcomes that matter to your customer, then map deliverables to achieve them
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShareAlignmentDialog projectId={projectId} />
              {configuredKPIs > 0 && project.currentPhase === "alignment" && (
                <Button 
                  size="sm"
                  onClick={() => startTrackingMutation.mutate()}
                  disabled={startTrackingMutation.isPending}
                  data-testid="button-start-tracking"
                >
                  {startTrackingMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  Start Tracking
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Summary Strip */}
      <div className="border-b bg-muted/30 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-normal">
                <Sparkles className="h-3 w-3 mr-1" />
                {patternInfo?.name || "Value Framework"}
              </Badge>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-4">
              {Object.entries(VALUE_PILLARS).map(([key, pillar]) => {
                const count = kpisByPillar[key as ValuePillarId]?.length || 0;
                if (count === 0) return null;
                const PillarIcon = PILLAR_ICONS[key as ValuePillarId];
                const colors = PILLAR_COLORS[key as ValuePillarId];
                return (
                  <div key={key} className="flex items-center gap-1.5">
                    <div className={`w-5 h-5 rounded flex items-center justify-center ${colors.bg}`}>
                      <PillarIcon className={`h-3 w-3 ${colors.text}`} />
                    </div>
                    <span className="text-xs text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Configured</span>
              <span className="text-sm font-medium">{configuredKPIs}/{totalKPIs}</span>
            </div>
            <Progress value={completionPercent} className="w-24 h-2" />
          </div>
        </div>
      </div>

      {/* Main Content - Two Panels */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left Panel - KPI Navigator */}
        <div className="w-80 shrink-0 border-r bg-muted/20 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b">
            <h3 className="text-sm font-medium">Customer KPIs</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Outcomes your customer wants to achieve</p>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-4">
              {isLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                </div>
              ) : (
                Object.entries(VALUE_PILLARS).map(([pillarKey, pillar]) => {
                  const pillarKPIs = kpisByPillar[pillarKey as ValuePillarId];
                  if (!pillarKPIs?.length) return null;
                  
                  const PillarIcon = PILLAR_ICONS[pillarKey as ValuePillarId];
                  const colors = PILLAR_COLORS[pillarKey as ValuePillarId];
                  
                  return (
                    <div key={pillarKey} className="space-y-2">
                      {/* Pillar Header */}
                      <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${colors.bg}`}>
                        <PillarIcon className={`h-3.5 w-3.5 ${colors.text}`} />
                        <span className={`text-xs font-medium ${colors.text}`}>{pillar.name}</span>
                        <span className={`text-xs ${colors.text} opacity-70`}>• {pillar.description}</span>
                      </div>
                      
                      {/* KPI Items */}
                      <div className="space-y-1 pl-1">
                        {pillarKPIs.map((kpi) => {
                          const isSelected = selectedKPI?.id === kpi.id;
                          const isConfigured = kpi.baseline && kpi.target;
                          
                          return (
                            <motion.button
                              key={kpi.id}
                              onClick={() => {
                                setSelectedKPI(kpi);
                                setTempBaseline(kpi.baseline || "");
                                setTempTarget(kpi.target || "");
                              }}
                              className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-start gap-3 ${
                                isSelected 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'hover:bg-background'
                              }`}
                              data-testid={`button-kpi-${kpi.id}`}
                            >
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                isSelected 
                                  ? 'bg-primary-foreground/20' 
                                  : isConfigured 
                                    ? 'bg-emerald-500/10' 
                                    : 'bg-muted'
                              }`}>
                                {isConfigured ? (
                                  <CheckCircle2 className={`h-3 w-3 ${isSelected ? 'text-primary-foreground' : 'text-emerald-600'}`} />
                                ) : (
                                  <Circle className={`h-3 w-3 ${isSelected ? 'text-primary-foreground/60' : 'text-muted-foreground'}`} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium leading-tight ${isSelected ? '' : 'text-foreground'}`}>
                                  {kpi.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-[10px] px-1.5 py-0 h-4 ${
                                      isSelected ? 'border-primary-foreground/30 text-primary-foreground/80' : ''
                                    }`}
                                  >
                                    {kpi.type === "leading" ? "Leading" : "Lagging"}
                                  </Badge>
                                  {kpi.deliverables.length > 0 && (
                                    <span className={`text-[10px] ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                      {kpi.deliverables.length} deliverables
                                    </span>
                                  )}
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - KPI Detail */}
        <div className="flex-1 overflow-hidden bg-background">
          <ScrollArea className="h-full">
            <div className="p-8 max-w-2xl">
              <AnimatePresence mode="wait">
                {!selectedKPI ? (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center h-[400px]"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <Target className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <p className="text-lg font-medium">Select an outcome</p>
                      <p className="text-sm text-muted-foreground mt-1">Choose a KPI to set targets and view deliverables</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={selectedKPI.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* KPI Header */}
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${PILLAR_COLORS[selectedKPI.pillar].bg}`}>
                            {(() => {
                              const PillarIcon = PILLAR_ICONS[selectedKPI.pillar];
                              return <PillarIcon className={`h-5 w-5 ${PILLAR_COLORS[selectedKPI.pillar].text}`} />;
                            })()}
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold">{selectedKPI.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {VALUE_PILLARS[selectedKPI.pillar].name}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {selectedKPI.type === "leading" ? "Leading Indicator" : "Lagging Indicator"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-muted-foreground mt-3">{selectedKPI.description}</p>
                    </div>

                    {/* Benchmark Info */}
                    {selectedKPI.benchmarkRange && (
                      <Card className="border-dashed">
                        <CardContent className="py-4">
                          <div className="flex items-center gap-2 mb-3">
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Industry Benchmarks</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Low</p>
                              <p className="text-lg font-semibold text-muted-foreground">{selectedKPI.benchmarkRange.low}{selectedKPI.unit === "%" ? "%" : ""}</p>
                            </div>
                            <div className="flex-1 h-2 bg-gradient-to-r from-red-200 via-amber-200 to-emerald-200 rounded-full" />
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Mid</p>
                              <p className="text-lg font-semibold text-amber-600">{selectedKPI.benchmarkRange.mid}{selectedKPI.unit === "%" ? "%" : ""}</p>
                            </div>
                            <div className="flex-1 h-2 bg-gradient-to-r from-amber-200 to-emerald-200 rounded-full" />
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">High</p>
                              <p className="text-lg font-semibold text-emerald-600">{selectedKPI.benchmarkRange.high}{selectedKPI.unit === "%" ? "%" : ""}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Baseline & Target */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Baseline */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Current Baseline</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {editingBaseline ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={tempBaseline}
                                onChange={(e) => setTempBaseline(e.target.value)}
                                placeholder={`Enter value (${selectedKPI.unit})`}
                                className="h-9"
                                autoFocus
                                data-testid="input-baseline"
                              />
                              <Button size="sm" onClick={handleSaveBaseline} data-testid="button-save-baseline">
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold">
                                {selectedKPI.baseline || "—"} 
                                <span className="text-sm text-muted-foreground ml-1">{selectedKPI.unit}</span>
                              </span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  setTempBaseline(selectedKPI.baseline || "");
                                  setEditingBaseline(true);
                                }}
                                data-testid="button-edit-baseline"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Target */}
                      <Card className="border-primary/20 bg-primary/5">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-primary">Target Outcome</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {editingTarget ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={tempTarget}
                                onChange={(e) => setTempTarget(e.target.value)}
                                placeholder={`Enter target (${selectedKPI.unit})`}
                                className="h-9"
                                autoFocus
                                data-testid="input-target"
                              />
                              <Button size="sm" onClick={handleSaveTarget} data-testid="button-save-target">
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-primary">
                                {selectedKPI.target || "—"}
                                <span className="text-sm text-primary/70 ml-1">{selectedKPI.unit}</span>
                              </span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  setTempTarget(selectedKPI.target || "");
                                  setEditingTarget(true);
                                }}
                                data-testid="button-edit-target"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Deliverables Section */}
                    <Collapsible open={expandedDeliverables} onOpenChange={setExpandedDeliverables}>
                      <Card>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-secondary" />
                                <CardTitle className="text-base">How We'll Achieve This</CardTitle>
                                <Badge variant="secondary" className="ml-2">
                                  {selectedKPI.deliverables.length} deliverables
                                </Badge>
                              </div>
                              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedDeliverables ? 'rotate-180' : ''}`} />
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="pt-0">
                            <div className="space-y-3">
                              {selectedKPI.deliverables.map((deliverable, index) => (
                                <motion.div
                                  key={deliverable.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
                                >
                                  <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-xs font-semibold text-secondary">{index + 1}</span>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <p className="font-medium text-sm">{deliverable.title}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{deliverable.description}</p>
                                      </div>
                                      <Badge variant="outline" className="text-[10px] shrink-0">
                                        {deliverable.timeline}
                                      </Badge>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>

                    {/* AI Recommendations Section */}
                    <Card className="border-secondary/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-secondary/20 to-ai/20 flex items-center justify-center">
                              <Lightbulb className="h-4 w-4 text-secondary" />
                            </div>
                            <div>
                              <CardTitle className="text-base">AI Value Case Recommendations</CardTitle>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Tailored initiatives to achieve this outcome
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => getRecommendationsMutation.mutate(selectedKPI)}
                            disabled={getRecommendationsMutation.isPending}
                            data-testid="button-get-recommendations"
                          >
                            {getRecommendationsMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Get Recommendations
                              </>
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      
                      {aiRecommendations.length > 0 && (
                        <CardContent className="pt-0">
                          <div className="space-y-4">
                            {aiRecommendations.map((rec, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 rounded-lg border bg-muted/30"
                              >
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <div className="flex items-start gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                      rec.confidence === "high" ? "bg-emerald-500/10 text-emerald-600" :
                                      rec.confidence === "medium" ? "bg-amber-500/10 text-amber-600" :
                                      "bg-slate-500/10 text-slate-600"
                                    }`}>
                                      <CheckCircle className="h-3.5 w-3.5" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-sm">{rec.title}</h4>
                                      <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                                    </div>
                                  </div>
                                  <Badge variant={
                                    rec.confidence === "high" ? "default" :
                                    rec.confidence === "medium" ? "secondary" : "outline"
                                  } className="shrink-0 text-[10px]">
                                    {rec.confidence} confidence
                                  </Badge>
                                </div>
                                
                                <div className="ml-9 space-y-2">
                                  <div className="flex items-center gap-4 text-xs">
                                    <div className="flex items-center gap-1.5 text-emerald-600">
                                      <TrendingUp className="h-3.5 w-3.5" />
                                      <span>{rec.expectedImpact}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                      <Clock className="h-3.5 w-3.5" />
                                      <span>{rec.timeline}</span>
                                    </div>
                                  </div>
                                  
                                  {rec.keyActivities.length > 0 && (
                                    <Collapsible>
                                      <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                        <ChevronRight className="h-3 w-3 transition-transform [[data-state=open]>&]:rotate-90" />
                                        Key activities ({rec.keyActivities.length})
                                      </CollapsibleTrigger>
                                      <CollapsibleContent className="mt-2">
                                        <div className="space-y-1">
                                          {rec.keyActivities.map((activity, actIdx) => (
                                            <div key={actIdx} className="flex items-start gap-2 text-xs text-muted-foreground">
                                              <span className="text-secondary">•</span>
                                              <span>{activity}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </CollapsibleContent>
                                    </Collapsible>
                                  )}
                                  
                                  {rec.relatedSuccessPattern && (
                                    <p className="text-[10px] text-muted-foreground italic">
                                      Based on: {rec.relatedSuccessPattern}
                                    </p>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
