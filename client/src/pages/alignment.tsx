import { useState, useMemo } from "react";
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
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp,
  Target,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Loader2,
  Check,
  Edit2,
  BarChart3,
  Lightbulb,
  Clock,
  CheckCircle,
  Info,
  Play,
  Milestone,
  ArrowUpRight
} from "lucide-react";
import type { Project } from "@shared/schema";
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

// Outcome represents what the customer wants to achieve
interface Outcome {
  id: string;
  name: string;
  whyItMatters: string;
  baseline: string | null;
  target: string | null;
  unit: string;
  benchmarkRange?: { low: number; mid: number; high: number };
  pillar: ValuePillarId;
  category: string;
  supportingMetrics: SupportingMetric[];
  initiatives: Initiative[];
}

interface SupportingMetric {
  id: string;
  name: string;
  description: string;
  unit: string;
  benchmarkRange?: { low: number; mid: number; high: number };
}

interface Initiative {
  id: string;
  name: string;
  description: string;
  timeline: string;
  status: "planned" | "in_progress" | "completed";
}

// Map solution patterns to initiatives
const SOLUTION_INITIATIVES: Record<string, Initiative[]> = {
  leadership_development: [
    { id: "ld1", name: "Leadership Assessment & Gap Analysis", description: "360° competency evaluation to identify development priorities", timeline: "Month 1-2", status: "planned" },
    { id: "ld2", name: "Executive Coaching Program", description: "1:1 coaching for senior leaders to accelerate growth", timeline: "Month 2-12", status: "planned" },
    { id: "ld3", name: "Leadership Development Cohort", description: "Cohort-based program building critical leadership capabilities", timeline: "Month 3-12", status: "planned" },
    { id: "ld4", name: "Succession Planning Framework", description: "Critical role mapping and successor development paths", timeline: "Month 4-8", status: "planned" }
  ],
  sales_effectiveness: [
    { id: "se1", name: "Sales Capability Diagnostic", description: "Evaluate current sales team competencies and gaps", timeline: "Month 1-2", status: "planned" },
    { id: "se2", name: "Sales Methodology Implementation", description: "Deploy proven sales frameworks across the organization", timeline: "Month 2-4", status: "planned" },
    { id: "se3", name: "Manager Coaching Capability", description: "Enable sales managers to coach their teams effectively", timeline: "Month 3-6", status: "planned" },
    { id: "se4", name: "Performance Analytics Dashboard", description: "Real-time visibility into sales performance metrics", timeline: "Month 2-4", status: "planned" }
  ],
  org_transformation: [
    { id: "ot1", name: "Organization Design Review", description: "Structure analysis and redesign for strategic alignment", timeline: "Month 1-3", status: "planned" },
    { id: "ot2", name: "Role Clarity & Accountabilities", description: "Define decision rights and eliminate overlaps", timeline: "Month 2-4", status: "planned" },
    { id: "ot3", name: "Change Management Program", description: "Communication and adoption support for the transformation", timeline: "Month 3-12", status: "planned" },
    { id: "ot4", name: "Culture Activation", description: "Align behaviors and values to new ways of working", timeline: "Month 4-12", status: "planned" }
  ],
  talent_acquisition: [
    { id: "ta1", name: "Hiring Process Optimization", description: "Streamline recruitment workflow for speed and quality", timeline: "Month 1-2", status: "planned" },
    { id: "ta2", name: "Predictive Assessment Integration", description: "Implement assessments that predict job success", timeline: "Month 2-3", status: "planned" },
    { id: "ta3", name: "Employer Brand Development", description: "Create compelling EVP to attract top talent", timeline: "Month 2-4", status: "planned" },
    { id: "ta4", name: "Onboarding Excellence Program", description: "Accelerate new hire productivity and retention", timeline: "Month 3-6", status: "planned" }
  ],
  rewards_optimization: [
    { id: "ro1", name: "Market Compensation Benchmarking", description: "Understand competitive positioning in your market", timeline: "Month 1-2", status: "planned" },
    { id: "ro2", name: "Pay Structure Redesign", description: "Create transparent salary bands and career paths", timeline: "Month 2-4", status: "planned" },
    { id: "ro3", name: "Incentive Program Design", description: "Align variable pay with business outcomes", timeline: "Month 3-5", status: "planned" },
    { id: "ro4", name: "Total Rewards Communication", description: "Help employees understand their full value package", timeline: "Month 4-6", status: "planned" }
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
  
  const [expandedOutcome, setExpandedOutcome] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<{ outcomeId: string; field: "baseline" | "target" } | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [localOverrides, setLocalOverrides] = useState<Record<string, { baseline?: string; target?: string }>>({});
  const [aiRecommendations, setAiRecommendations] = useState<Record<string, Array<{
    title: string;
    description: string;
    expectedImpact: string;
    timeline: string;
    confidence: "high" | "medium" | "low";
    keyActivities: string[];
  }>>>({});
  const [loadingRecommendations, setLoadingRecommendations] = useState<string | null>(null);

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

  // Build outcomes from solution pattern
  const outcomes = useMemo<Outcome[]>(() => {
    const pattern = SOLUTION_VALUE_PATTERNS[solutionPattern as keyof typeof SOLUTION_VALUE_PATTERNS];
    if (!pattern) return [];

    const initiatives = SOLUTION_INITIATIVES[solutionPattern] || [];
    const outcomeList: Outcome[] = [];

    // Primary outcomes from lagging indicators (these are what customers ultimately want)
    pattern.recommendedKPIs.lagging.forEach((kpiId, index) => {
      const indicator = LAGGING_INDICATORS[kpiId as keyof typeof LAGGING_INDICATORS];
      if (indicator) {
        const existingKpi = finalizedData?.jobs
          ?.flatMap(j => j.kpis)
          ?.find(k => k.kpiName.toLowerCase().includes(indicator.name.toLowerCase().split(" ")[0]));

        // Get supporting metrics from leading indicators
        const supportingMetrics: SupportingMetric[] = pattern.recommendedKPIs.leading
          .slice(index * 2, index * 2 + 2)
          .map(leadingId => {
            const leading = LEADING_INDICATORS[leadingId as keyof typeof LEADING_INDICATORS];
            if (!leading) return null;
            return {
              id: leading.id,
              name: leading.name,
              description: leading.description,
              unit: leading.unit,
              benchmarkRange: leading.benchmarkRange
            };
          })
          .filter(Boolean) as SupportingMetric[];

        outcomeList.push({
          id: indicator.id,
          name: indicator.name,
          whyItMatters: indicator.description,
          baseline: existingKpi?.baselineValue || null,
          target: existingKpi?.targetValue || null,
          unit: indicator.unit,
          benchmarkRange: (indicator as any).benchmarkRange,
          pillar: indicator.pillar as ValuePillarId,
          category: indicator.category,
          supportingMetrics,
          initiatives: initiatives.slice(index * 2, index * 2 + 2).length > 0 
            ? initiatives.slice(index * 2, index * 2 + 2) 
            : initiatives.slice(0, 2)
        });
      }
    });

    return outcomeList;
  }, [solutionPattern, finalizedData]);

  // Merge local overrides with computed outcomes
  const mergedOutcomes = useMemo(() => {
    return outcomes.map(outcome => {
      const overrides = localOverrides[outcome.id];
      if (!overrides) return outcome;
      return {
        ...outcome,
        baseline: overrides.baseline ?? outcome.baseline,
        target: overrides.target ?? outcome.target
      };
    });
  }, [outcomes, localOverrides]);

  // Calculate summary metrics
  const configuredOutcomes = mergedOutcomes.filter(o => o.baseline && o.target).length;
  const totalOutcomes = mergedOutcomes.length;
  const completionPercent = totalOutcomes > 0 ? Math.round((configuredOutcomes / totalOutcomes) * 100) : 0;

  // Mutations
  const updateOutcomeMutation = useMutation({
    mutationFn: async ({ outcomeId, data }: { outcomeId: string; data: { baseline?: string; target?: string } }) => {
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/alignment/finalized-jobs`] });
      toast({
        title: "Saved",
        description: "Outcome value updated.",
      });
    }
  });

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

  const getAIRecommendations = async (outcome: Outcome) => {
    setLoadingRecommendations(outcome.id);
    try {
      const res = await apiRequest("POST", `/api/projects/${projectId}/kpi-value-cases`, {
        kpiName: outcome.name,
        kpiDescription: outcome.whyItMatters,
        pillar: VALUE_PILLARS[outcome.pillar].name,
        category: outcome.category,
        unit: outcome.unit,
        baseline: outcome.baseline,
        target: outcome.target,
        benchmarkRange: outcome.benchmarkRange
      });
      const data = await res.json();
      setAiRecommendations(prev => ({ ...prev, [outcome.id]: data.recommendations || [] }));
      toast({
        title: "Recommendations ready",
        description: "AI has analyzed this outcome and suggested initiatives.",
      });
    } catch (error: any) {
      toast({
        title: "Could not generate recommendations",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoadingRecommendations(null);
    }
  };

  const handleSaveValue = (outcome: Outcome, field: "baseline" | "target") => {
    if (tempValue) {
      // Update local state immediately for responsive UI
      setLocalOverrides(prev => ({
        ...prev,
        [outcome.id]: {
          ...prev[outcome.id],
          [field]: tempValue
        }
      }));
      // Also fire the mutation for persistence
      updateOutcomeMutation.mutate({ 
        outcomeId: outcome.id, 
        data: { [field]: tempValue } 
      });
    }
    setEditingField(null);
    setTempValue("");
  };

  if (!project) {
    return <div className="p-6">Loading...</div>;
  }

  const patternInfo = SOLUTION_VALUE_PATTERNS[solutionPattern as keyof typeof SOLUTION_VALUE_PATTERNS];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <motion.div 
        className="border-b shrink-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Outcome Alignment</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Define what {project.companyName} wants to achieve and how we'll get there
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ShareAlignmentDialog projectId={projectId} />
              {configuredOutcomes > 0 && project.currentPhase === "alignment" && (
                <Button 
                  onClick={() => startTrackingMutation.mutate()}
                  disabled={startTrackingMutation.isPending}
                  data-testid="button-start-tracking"
                >
                  {startTrackingMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Start Tracking Progress
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Executive Summary */}
      <div className="px-6 py-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Focus Area</span>
              <p className="font-medium">{patternInfo?.name || "Value Framework"}</p>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Outcomes Defined</span>
              <p className="font-medium">{configuredOutcomes} of {totalOutcomes}</p>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Readiness</span>
              <div className="flex items-center gap-2 mt-0.5">
                <Progress value={completionPercent} className="w-20 h-2" />
                <span className="text-sm font-medium">{completionPercent}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Loading outcomes...</p>
            </div>
          ) : mergedOutcomes.length === 0 ? (
            <Card className="p-12 text-center">
              <Target className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="text-lg font-medium mt-4">No outcomes defined yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Complete the discovery phase to define customer outcomes
              </p>
            </Card>
          ) : (
            mergedOutcomes.map((outcome, index) => (
              <motion.div
                key={outcome.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  {/* Outcome Header - Always Visible */}
                  <div 
                    className="p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedOutcome(expandedOutcome === outcome.id ? null : outcome.id)}
                    data-testid={`outcome-card-${outcome.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {VALUE_PILLARS[outcome.pillar].name}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {outcome.category}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold">{outcome.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{outcome.whyItMatters}</p>
                      </div>
                      
                      {/* Quick Status */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="flex items-center gap-3">
                            <div>
                              <span className="text-xs text-muted-foreground">Current</span>
                              <p className="text-lg font-semibold">
                                {outcome.baseline || "—"} 
                                <span className="text-xs text-muted-foreground ml-1">{outcome.unit}</span>
                              </p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <span className="text-xs text-muted-foreground">Target</span>
                              <p className="text-lg font-semibold text-primary">
                                {outcome.target || "—"}
                                <span className="text-xs text-primary/70 ml-1">{outcome.unit}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${expandedOutcome === outcome.id ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedOutcome === outcome.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="border-t">
                          {/* Section 1: The Journey - Baseline to Target */}
                          <div className="p-5 bg-muted/20">
                            <div className="flex items-center gap-2 mb-4">
                              <Target className="h-4 w-4 text-primary" />
                              <h4 className="font-medium">The Journey</h4>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                              {/* Baseline */}
                              <Card className="border-muted">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Where We Are Now
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  {editingField?.outcomeId === outcome.id && editingField?.field === "baseline" ? (
                                    <div className="flex items-center gap-2">
                                      <Input
                                        value={tempValue}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        placeholder={`Value (${outcome.unit})`}
                                        className="h-9"
                                        autoFocus
                                        data-testid="input-baseline"
                                      />
                                      <Button size="sm" onClick={() => handleSaveValue(outcome, "baseline")}>
                                        <Check className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between">
                                      <span className="text-2xl font-bold">
                                        {outcome.baseline || "—"} 
                                        <span className="text-sm text-muted-foreground ml-1">{outcome.unit}</span>
                                      </span>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setTempValue(outcome.baseline || "");
                                          setEditingField({ outcomeId: outcome.id, field: "baseline" });
                                        }}
                                        data-testid="button-edit-baseline"
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>

                              {/* Benchmark Context */}
                              <Card className="border-secondary/20 bg-secondary/5">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm font-medium text-secondary">
                                    Industry Benchmark
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  {outcome.benchmarkRange ? (
                                    <div className="space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Low</span>
                                        <span className="text-muted-foreground">Top Quartile</span>
                                      </div>
                                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                                        <div 
                                          className="absolute left-0 h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-600 rounded-full"
                                          style={{ width: '100%' }}
                                        />
                                      </div>
                                      <div className="flex justify-between text-xs">
                                        <span>{outcome.benchmarkRange.low}{outcome.unit}</span>
                                        <span className="font-medium text-emerald-600">{outcome.benchmarkRange.high}{outcome.unit}</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No benchmark data available</p>
                                  )}
                                </CardContent>
                              </Card>

                              {/* Target */}
                              <Card className="border-primary/20 bg-primary/5">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm font-medium text-primary">
                                    Where We Want To Be
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  {editingField?.outcomeId === outcome.id && editingField?.field === "target" ? (
                                    <div className="flex items-center gap-2">
                                      <Input
                                        value={tempValue}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        placeholder={`Target (${outcome.unit})`}
                                        className="h-9"
                                        autoFocus
                                        data-testid="input-target"
                                      />
                                      <Button size="sm" onClick={() => handleSaveValue(outcome, "target")}>
                                        <Check className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between">
                                      <span className="text-2xl font-bold text-primary">
                                        {outcome.target || "—"}
                                        <span className="text-sm text-primary/70 ml-1">{outcome.unit}</span>
                                      </span>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setTempValue(outcome.target || "");
                                          setEditingField({ outcomeId: outcome.id, field: "target" });
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
                          </div>

                          {/* Section 2: How We'll Measure Success */}
                          {outcome.supportingMetrics.length > 0 && (
                            <div className="p-5 border-t">
                              <div className="flex items-center gap-2 mb-4">
                                <BarChart3 className="h-4 w-4 text-secondary" />
                                <h4 className="font-medium">How We'll Measure Progress</h4>
                                <span className="text-xs text-muted-foreground">(Leading Indicators)</span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                {outcome.supportingMetrics.map((metric) => (
                                  <div 
                                    key={metric.id}
                                    className="p-3 rounded-lg border bg-muted/30"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <p className="font-medium text-sm">{metric.name}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{metric.description}</p>
                                      </div>
                                      {metric.benchmarkRange && (
                                        <Badge variant="outline" className="text-[10px] shrink-0">
                                          Top: {metric.benchmarkRange.high}{metric.unit}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Section 3: How We'll Get There */}
                          <div className="p-5 border-t">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <Milestone className="h-4 w-4 text-primary" />
                                <h4 className="font-medium">How We'll Get There</h4>
                                <span className="text-xs text-muted-foreground">(Korn Ferry Initiatives)</span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  getAIRecommendations(outcome);
                                }}
                                disabled={loadingRecommendations === outcome.id}
                                data-testid="button-get-recommendations"
                              >
                                {loadingRecommendations === outcome.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Analyzing...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    AI Suggestions
                                  </>
                                )}
                              </Button>
                            </div>
                            
                            <div className="space-y-3">
                              {outcome.initiatives.map((initiative, idx) => (
                                <div 
                                  key={initiative.id}
                                  className="flex items-start gap-3 p-3 rounded-lg border"
                                >
                                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-semibold text-primary">{idx + 1}</span>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <p className="font-medium text-sm">{initiative.name}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{initiative.description}</p>
                                      </div>
                                      <Badge variant="secondary" className="text-[10px] shrink-0">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {initiative.timeline}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* AI Recommendations */}
                            {aiRecommendations[outcome.id]?.length > 0 && (
                              <div className="mt-4 pt-4 border-t">
                                <div className="flex items-center gap-2 mb-3">
                                  <Lightbulb className="h-4 w-4 text-amber-500" />
                                  <span className="text-sm font-medium">AI Recommended Initiatives</span>
                                </div>
                                <div className="space-y-3">
                                  {aiRecommendations[outcome.id].map((rec, idx) => (
                                    <div 
                                      key={idx}
                                      className="p-3 rounded-lg border border-amber-200/50 bg-amber-50/30 dark:bg-amber-950/10"
                                    >
                                      <div className="flex items-start justify-between gap-2 mb-2">
                                        <div>
                                          <p className="font-medium text-sm">{rec.title}</p>
                                          <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>
                                        </div>
                                        <Badge variant={rec.confidence === "high" ? "default" : "secondary"} className="text-[10px] shrink-0">
                                          {rec.confidence}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-4 text-xs mt-2">
                                        <div className="flex items-center gap-1 text-emerald-600">
                                          <ArrowUpRight className="h-3 w-3" />
                                          <span>{rec.expectedImpact}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                          <Clock className="h-3 w-3" />
                                          <span>{rec.timeline}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
