import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Sparkles,
  ChevronDown, 
  ChevronUp, 
  Target,
  TrendingUp,
  Users,
  Building2,
  Lightbulb,
  Clock,
  Plus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Layers,
  BarChart3,
  DollarSign,
  Zap
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface OrganizationalStrategy {
  id: string;
  strategyName: string;
  strategyDescription: string;
  strategicCategory: "growth" | "transformation" | "talent" | "culture" | "operations" | "leadership";
  businessRationale: string;
  expectedOutcomes: string[];
  timeframe: "short_term" | "medium_term" | "long_term";
  complexityLevel: "low" | "medium" | "high";
  priority: "high" | "medium" | "low";
  industryRelevance: string;
  successIndicators: string[];
  isCustom?: boolean;
}

interface StrategyOutcome {
  id: string;
  strategyId: string;
  outcomeName: string;
  outcomeDescription: string;
  kpiDetails: {
    metricName: string;
    unit: string;
    suggestedBaseline: string;
    suggestedTarget: string;
    timeframe: string;
  };
  benchmark: {
    industryLow: string;
    industryMedian: string;
    industryHigh: string;
    source: string;
  };
  valuePillar: "grow" | "optimise" | "derisk" | "strengthen";
  achievability: "high" | "medium" | "low";
  businessImpact: string;
  kornFerrySolution: string;
}

interface StrategyOutcomesResult {
  outcomes: StrategyOutcome[];
  summary: string;
}

interface StrategicRecommendationsResult {
  strategies: OrganizationalStrategy[];
  executiveSummary: string;
  industryContext: string;
  recommendedFocus: string;
  generatedAt?: string;
}

interface StrategicAlignmentSelectorProps {
  projectId: number;
  companyName?: string;
  industry?: string;
  onStrategiesSelected?: (strategies: OrganizationalStrategy[]) => void;
  onComplete?: (data: { strategies: OrganizationalStrategy[]; outcomes: StrategyOutcome[] }) => void;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof Target; color: string }> = {
  growth: { 
    label: "Growth", 
    icon: TrendingUp, 
    color: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800" 
  },
  transformation: { 
    label: "Transformation", 
    icon: RefreshCw, 
    color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800" 
  },
  talent: { 
    label: "Talent", 
    icon: Users, 
    color: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800" 
  },
  culture: { 
    label: "Culture", 
    icon: Lightbulb, 
    color: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800" 
  },
  operations: { 
    label: "Operations", 
    icon: Building2, 
    color: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800" 
  },
  leadership: { 
    label: "Leadership", 
    icon: Target, 
    color: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800" 
  },
};

const TIMEFRAME_CONFIG: Record<string, { label: string; description: string }> = {
  short_term: { label: "3-6 Months", description: "Quick wins" },
  medium_term: { label: "6-12 Months", description: "Medium-term" },
  long_term: { label: "12-18 Months", description: "Strategic" },
};

const PRIORITY_CONFIG: Record<string, { color: string }> = {
  high: { color: "bg-red-500/10 text-red-600" },
  medium: { color: "bg-amber-500/10 text-amber-600" },
  low: { color: "bg-slate-500/10 text-slate-600" },
};

const VALUE_PILLAR_CONFIG: Record<string, { label: string; color: string; icon: typeof TrendingUp }> = {
  grow: { label: "Grow", color: "bg-emerald-100 text-emerald-700", icon: TrendingUp },
  optimise: { label: "Optimise", color: "bg-blue-100 text-blue-700", icon: BarChart3 },
  derisk: { label: "De-risk", color: "bg-amber-100 text-amber-700", icon: Target },
  strengthen: { label: "Strengthen", color: "bg-purple-100 text-purple-700", icon: Zap },
};

function StrategyCard({ 
  strategy, 
  isSelected, 
  isExpanded,
  onToggle, 
  onExpandToggle
}: { 
  strategy: OrganizationalStrategy; 
  isSelected: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onExpandToggle: () => void;
}) {
  const categoryConfig = CATEGORY_CONFIG[strategy.strategicCategory] || CATEGORY_CONFIG.leadership;
  const CategoryIcon = categoryConfig.icon;
  const timeframeConfig = TIMEFRAME_CONFIG[strategy.timeframe] || TIMEFRAME_CONFIG.medium_term;
  const priorityConfig = PRIORITY_CONFIG[strategy.priority] || PRIORITY_CONFIG.medium;

  return (
    <div 
      className={`relative rounded-lg border transition-all ${
        isSelected 
          ? "border-primary bg-primary/5 dark:bg-primary/10" 
          : "border-border hover-elevate"
      }`}
      data-testid={`strategy-card-${strategy.id}`}
    >
      <div 
        className="p-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-start gap-3">
          <Checkbox 
            checked={isSelected}
            onCheckedChange={() => onToggle()}
            onClick={(e) => e.stopPropagation()}
            className="mt-1"
            data-testid={`checkbox-strategy-${strategy.id}`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-medium text-sm">{strategy.strategyName}</span>
              {strategy.isCustom && (
                <Badge variant="outline" className="text-xs">Custom</Badge>
              )}
              <Badge className={`text-xs ${priorityConfig.color}`}>
                {strategy.priority.charAt(0).toUpperCase() + strategy.priority.slice(1)} Priority
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {strategy.strategyDescription}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`text-xs ${categoryConfig.color}`}>
                <CategoryIcon className="h-3 w-3 mr-1" />
                {categoryConfig.label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {timeframeConfig.label}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={(e) => { e.stopPropagation(); onExpandToggle(); }}
            data-testid={`button-expand-strategy-${strategy.id}`}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t mt-0">
          <div className="pt-3 space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Business Rationale</p>
              <p className="text-sm">{strategy.businessRationale}</p>
            </div>
            
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Industry Relevance</p>
              <p className="text-sm text-primary/80">{strategy.industryRelevance}</p>
            </div>
            
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Expected Outcomes</p>
              <ul className="space-y-1">
                {strategy.expectedOutcomes.map((outcome, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-1 shrink-0" />
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Success Indicators</p>
              <div className="flex flex-wrap gap-1">
                {strategy.successIndicators.map((indicator, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {indicator}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OutcomeCard({ 
  outcome, 
  strategy,
  isSelected,
  onToggle
}: { 
  outcome: StrategyOutcome;
  strategy?: OrganizationalStrategy;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const pillarConfig = VALUE_PILLAR_CONFIG[outcome.valuePillar] || VALUE_PILLAR_CONFIG.strengthen;
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div 
      className={`rounded-lg border p-4 transition-all ${
        isSelected 
          ? "border-emerald-500 bg-emerald-500/5" 
          : "border-border hover-elevate"
      }`}
      data-testid={`outcome-card-${outcome.id}`}
    >
      <div className="flex items-start gap-3">
        <Checkbox 
          checked={isSelected}
          onCheckedChange={() => onToggle()}
          className="mt-1"
          data-testid={`checkbox-outcome-${outcome.id}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-medium text-sm">{outcome.outcomeName}</span>
            <Badge className={`text-xs ${pillarConfig.color}`}>
              {pillarConfig.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {outcome.achievability === "high" ? "High" : outcome.achievability === "medium" ? "Medium" : "Low"} Achievability
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{outcome.outcomeDescription}</p>
          
          <div className="flex items-center gap-4 text-xs mb-2">
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3 text-muted-foreground" />
              <span><strong>Baseline:</strong> {outcome.kpiDetails.suggestedBaseline}</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-emerald-500" />
              <span><strong>Target:</strong> {outcome.kpiDetails.suggestedTarget}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span>{outcome.kpiDetails.timeframe}</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="h-6 px-2 text-xs"
            data-testid={`button-toggle-outcome-details-${outcome.id}`}
          >
            {showDetails ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
            {showDetails ? "Hide Details" : "Show Details"}
          </Button>

          {showDetails && (
            <div className="mt-3 pt-3 border-t space-y-2">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-medium text-muted-foreground mb-1">Industry Benchmarks</p>
                  <div className="space-y-1">
                    <p>Low: {outcome.benchmark.industryLow}</p>
                    <p>Median: {outcome.benchmark.industryMedian}</p>
                    <p className="text-emerald-600">High: {outcome.benchmark.industryHigh}</p>
                  </div>
                  <p className="text-muted-foreground mt-1 italic">{outcome.benchmark.source}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground mb-1">Business Impact</p>
                  <p>{outcome.businessImpact}</p>
                  <p className="mt-2 font-medium text-muted-foreground">Korn Ferry Solution</p>
                  <Badge variant="outline" className="mt-1">{outcome.kornFerrySolution}</Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function StrategicAlignmentSelector({
  projectId,
  companyName,
  industry,
  onStrategiesSelected,
  onComplete
}: StrategicAlignmentSelectorProps) {
  const [phase, setPhase] = useState<"strategies" | "outcomes">("strategies");
  const [selectedStrategies, setSelectedStrategies] = useState<Set<string>>(new Set());
  const [expandedStrategies, setExpandedStrategies] = useState<Set<string>>(new Set());
  const [customStrategies, setCustomStrategies] = useState<OrganizationalStrategy[]>([]);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [confirmedStrategies, setConfirmedStrategies] = useState<OrganizationalStrategy[]>([]);
  const [outcomes, setOutcomes] = useState<StrategyOutcome[]>([]);
  const [selectedOutcomes, setSelectedOutcomes] = useState<Set<string>>(new Set());
  const [showHandoffConfirmation, setShowHandoffConfirmation] = useState(false);
  const [hasRestoredFromSaved, setHasRestoredFromSaved] = useState(false);
  const [customStrategyForm, setCustomStrategyForm] = useState({
    name: "",
    description: "",
    category: "leadership" as OrganizationalStrategy["strategicCategory"],
    timeframe: "medium_term" as OrganizationalStrategy["timeframe"],
    priority: "medium" as OrganizationalStrategy["priority"],
  });

  const { data: cachedRecommendations, isLoading: cacheLoading } = useQuery<StrategicRecommendationsResult>({
    queryKey: ["/api/projects", projectId, "strategic-recommendations"],
    retry: false,
  });

  const { data: savedSelection } = useQuery<{
    id: number;
    projectId: number;
    selectedStrategiesData: {
      strategies: OrganizationalStrategy[];
      selectedIds: string[];
      customStrategies: OrganizationalStrategy[];
    } | null;
    generatedOutcomesData: {
      outcomes: StrategyOutcome[];
      selectedOutcomeIds: string[];
    } | null;
    handoffConfirmed: boolean;
    status: string;
  }>({
    queryKey: ["/api/projects", projectId, "strategy-selection"],
    retry: false,
  });

  const saveSelectionMutation = useMutation({
    mutationFn: async (data: {
      selectedStrategiesData?: {
        strategies: OrganizationalStrategy[];
        selectedIds: string[];
        customStrategies: OrganizationalStrategy[];
      };
      generatedOutcomesData?: {
        outcomes: StrategyOutcome[];
        selectedOutcomeIds: string[];
      };
      handoffConfirmed?: boolean;
      status?: string;
    }) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/strategy-selection`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "strategy-selection"] });
    },
  });

  useEffect(() => {
    if (savedSelection && !hasRestoredFromSaved && savedSelection.selectedStrategiesData) {
      const { strategies, selectedIds, customStrategies: savedCustom } = savedSelection.selectedStrategiesData;
      
      if (savedCustom?.length > 0) {
        setCustomStrategies(savedCustom);
      }
      
      if (selectedIds?.length > 0) {
        setSelectedStrategies(new Set(selectedIds));
        const confirmed = strategies.filter((s: OrganizationalStrategy) => selectedIds.includes(s.id));
        if (confirmed.length > 0) {
          setConfirmedStrategies(confirmed);
        }
      }

      if (savedSelection.generatedOutcomesData) {
        const { outcomes: savedOutcomes, selectedOutcomeIds } = savedSelection.generatedOutcomesData;
        if (savedOutcomes?.length > 0) {
          setOutcomes(savedOutcomes);
          setSelectedOutcomes(new Set(selectedOutcomeIds || savedOutcomes.map((o: StrategyOutcome) => o.id)));
          setPhase("outcomes");
        }
      }

      setHasRestoredFromSaved(true);
    }
  }, [savedSelection, hasRestoredFromSaved]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/strategic-recommendations`, {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/projects", projectId, "strategic-recommendations"], data);
    },
  });

  const generateOutcomesMutation = useMutation({
    mutationFn: async (strategies: OrganizationalStrategy[]) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/strategy-outcomes`, {
        selectedStrategies: strategies.map(s => ({
          id: s.id,
          strategyName: s.strategyName,
          strategyDescription: s.strategyDescription,
          strategicCategory: s.strategicCategory,
          businessRationale: s.businessRationale,
          expectedOutcomes: s.expectedOutcomes,
          timeframe: s.timeframe,
          priority: s.priority
        }))
      });
      return response.json() as Promise<StrategyOutcomesResult>;
    },
    onSuccess: (data) => {
      setOutcomes(data.outcomes);
      setSelectedOutcomes(new Set(data.outcomes.map(o => o.id)));
      
      saveSelectionMutation.mutate({
        generatedOutcomesData: {
          outcomes: data.outcomes,
          selectedOutcomeIds: data.outcomes.map(o => o.id),
        },
        status: "outcomes_generated",
      });
    },
  });

  const allStrategies = [
    ...(cachedRecommendations?.strategies || []),
    ...customStrategies
  ];

  const hasStrategies = allStrategies.length > 0;
  const isLoading = cacheLoading || generateMutation.isPending;

  const toggleStrategy = (strategyId: string) => {
    const newSelected = new Set(selectedStrategies);
    if (newSelected.has(strategyId)) {
      newSelected.delete(strategyId);
    } else {
      newSelected.add(strategyId);
    }
    setSelectedStrategies(newSelected);
    
    const selected = allStrategies.filter(s => newSelected.has(s.id));
    onStrategiesSelected?.(selected);
  };

  const toggleExpand = (strategyId: string) => {
    const newExpanded = new Set(expandedStrategies);
    if (newExpanded.has(strategyId)) {
      newExpanded.delete(strategyId);
    } else {
      newExpanded.add(strategyId);
    }
    setExpandedStrategies(newExpanded);
  };

  const selectAllHighPriority = () => {
    const highPriorityIds = allStrategies
      .filter(s => s.priority === "high")
      .map(s => s.id);
    setSelectedStrategies(new Set(highPriorityIds));
    
    const selected = allStrategies.filter(s => highPriorityIds.includes(s.id));
    onStrategiesSelected?.(selected);
  };

  const addCustomStrategy = () => {
    if (!customStrategyForm.name.trim()) return;
    
    const newStrategy: OrganizationalStrategy = {
      id: `custom_${Date.now()}`,
      strategyName: customStrategyForm.name,
      strategyDescription: customStrategyForm.description || customStrategyForm.name,
      strategicCategory: customStrategyForm.category,
      businessRationale: "Custom strategy added by user",
      expectedOutcomes: ["To be defined"],
      timeframe: customStrategyForm.timeframe,
      complexityLevel: "medium",
      priority: customStrategyForm.priority,
      industryRelevance: "User-defined strategy",
      successIndicators: ["To be defined"],
      isCustom: true,
    };
    
    setCustomStrategies([...customStrategies, newStrategy]);
    setShowAddCustom(false);
    setCustomStrategyForm({
      name: "",
      description: "",
      category: "leadership",
      timeframe: "medium_term",
      priority: "medium",
    });
  };

  const handleConfirmStrategies = () => {
    const selected = allStrategies.filter(s => selectedStrategies.has(s.id));
    setConfirmedStrategies(selected);
    setPhase("outcomes");
    generateOutcomesMutation.mutate(selected);
    
    saveSelectionMutation.mutate({
      selectedStrategiesData: {
        strategies: allStrategies,
        selectedIds: Array.from(selectedStrategies),
        customStrategies: customStrategies,
      },
      status: "strategies_confirmed",
    });
  };

  const toggleOutcome = (outcomeId: string) => {
    const newSelected = new Set(selectedOutcomes);
    if (newSelected.has(outcomeId)) {
      newSelected.delete(outcomeId);
    } else {
      newSelected.add(outcomeId);
    }
    setSelectedOutcomes(newSelected);
  };

  const handleSaveOutcomes = () => {
    saveSelectionMutation.mutate({
      generatedOutcomesData: {
        outcomes: outcomes,
        selectedOutcomeIds: Array.from(selectedOutcomes),
      },
      status: "outcomes_selected",
    });
  };

  const handleComplete = () => {
    setShowHandoffConfirmation(true);
  };

  const handleConfirmHandoff = () => {
    const selectedOutcomesList = outcomes.filter(o => selectedOutcomes.has(o.id));
    
    saveSelectionMutation.mutate({
      generatedOutcomesData: {
        outcomes: outcomes,
        selectedOutcomeIds: Array.from(selectedOutcomes),
      },
      handoffConfirmed: true,
      status: "handoff_confirmed",
    });
    
    setShowHandoffConfirmation(false);
    onComplete?.({ strategies: confirmedStrategies, outcomes: selectedOutcomesList });
  };

  const getStrategyForOutcome = (strategyId: string) => {
    return confirmedStrategies.find(s => s.id === strategyId);
  };

  return (
    <div className="space-y-4" data-testid="strategic-alignment-selector">
      {phase === "strategies" ? (
        <Card className="bg-gradient-to-r from-violet-500/5 to-purple-500/5 border-violet-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Step 1: Select Strategies
                    <Badge variant="outline" className="text-xs font-normal">1 of 2</Badge>
                  </CardTitle>
                  <CardDescription>
                    AI-recommended organizational strategies for {companyName || "your client"}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  {selectedStrategies.size} selected
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && !hasStrategies ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : !hasStrategies ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-violet-500/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-violet-600" />
                </div>
                <h3 className="font-semibold mb-2">Generate Strategic Recommendations</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                  Our AI will analyze {companyName || "your client"}'s industry context and recommend 
                  organizational strategies that drive meaningful business outcomes.
                </p>
                <Button 
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending}
                  data-testid="button-generate-strategies"
                >
                  {generateMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Strategies
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <>
                {cachedRecommendations?.executiveSummary && (
                  <div className="p-3 rounded-lg bg-muted/50 border-l-4 border-violet-500">
                    <p className="text-sm">{cachedRecommendations.executiveSummary}</p>
                    {cachedRecommendations.recommendedFocus && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
                        <Lightbulb className="h-3 w-3 mt-0.5 shrink-0 text-amber-500" />
                        <span><strong>Recommended focus:</strong> {cachedRecommendations.recommendedFocus}</span>
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={selectAllHighPriority}
                      data-testid="button-select-high-priority"
                    >
                      <Target className="h-4 w-4 mr-1" />
                      Select High Priority
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowAddCustom(true)}
                      data-testid="button-add-custom-strategy"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Custom
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => generateMutation.mutate()}
                    disabled={generateMutation.isPending}
                    data-testid="button-refresh-strategies"
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>

                <div className="space-y-3">
                  {allStrategies.map(strategy => (
                    <StrategyCard
                      key={strategy.id}
                      strategy={strategy}
                      isSelected={selectedStrategies.has(strategy.id)}
                      isExpanded={expandedStrategies.has(strategy.id)}
                      onToggle={() => toggleStrategy(strategy.id)}
                      onExpandToggle={() => toggleExpand(strategy.id)}
                    />
                  ))}
                </div>

                {selectedStrategies.size > 0 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      {selectedStrategies.size} {selectedStrategies.size === 1 ? 'strategy' : 'strategies'} selected
                    </div>
                    <Button onClick={handleConfirmStrategies} data-testid="button-confirm-strategies">
                      Generate Outcomes
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border-emerald-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Step 2: Review Outcomes
                    <Badge variant="outline" className="text-xs font-normal">2 of 2</Badge>
                  </CardTitle>
                  <CardDescription>
                    AI-generated measurable outcomes based on {confirmedStrategies.length} selected {confirmedStrategies.length === 1 ? 'strategy' : 'strategies'}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  {selectedOutcomes.size} outcomes selected
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setPhase("strategies")}
              data-testid="button-back-to-strategies"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Strategies
            </Button>

            {generateOutcomesMutation.isPending ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Sparkles className="h-4 w-4 animate-pulse text-emerald-500" />
                  Generating outcomes from your selected strategies...
                </div>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : outcomes.length > 0 ? (
              <>
                <div className="p-3 rounded-lg bg-muted/50 border-l-4 border-emerald-500">
                  <p className="text-sm">
                    Based on your selected strategies, we've identified {outcomes.length} measurable outcomes. 
                    Select the outcomes you want to commit to with your client.
                  </p>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedOutcomes(new Set(outcomes.map(o => o.id)))}
                    data-testid="button-select-all-outcomes"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => generateOutcomesMutation.mutate(confirmedStrategies)}
                    disabled={generateOutcomesMutation.isPending}
                    data-testid="button-refresh-outcomes"
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${generateOutcomesMutation.isPending ? 'animate-spin' : ''}`} />
                    Regenerate
                  </Button>
                </div>

                {confirmedStrategies.map(strategy => {
                  const strategyOutcomes = outcomes.filter(o => o.strategyId === strategy.id);
                  if (strategyOutcomes.length === 0) return null;
                  
                  return (
                    <div key={strategy.id} className="space-y-2">
                      <div className="flex items-center gap-2 py-2">
                        <Badge variant="outline" className={CATEGORY_CONFIG[strategy.strategicCategory]?.color}>
                          {strategy.strategyName}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {strategyOutcomes.length} {strategyOutcomes.length === 1 ? 'outcome' : 'outcomes'}
                        </span>
                      </div>
                      <div className="space-y-2 pl-2 border-l-2 border-muted">
                        {strategyOutcomes.map(outcome => (
                          <OutcomeCard
                            key={outcome.id}
                            outcome={outcome}
                            strategy={strategy}
                            isSelected={selectedOutcomes.has(outcome.id)}
                            onToggle={() => toggleOutcome(outcome.id)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}

                {selectedOutcomes.size > 0 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      {selectedOutcomes.size} {selectedOutcomes.size === 1 ? 'outcome' : 'outcomes'} selected
                    </div>
                    <Button onClick={handleComplete} data-testid="button-confirm-outcomes">
                      Confirm & Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No outcomes generated yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={showAddCustom} onOpenChange={setShowAddCustom}>
        <DialogContent data-testid="dialog-add-custom-strategy">
          <DialogHeader>
            <DialogTitle>Add Custom Strategy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Strategy Name</label>
              <Input
                placeholder="e.g., Accelerate Digital Talent Acquisition"
                value={customStrategyForm.name}
                onChange={(e) => setCustomStrategyForm({ ...customStrategyForm, name: e.target.value })}
                data-testid="input-custom-strategy-name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Brief description of this strategic priority..."
                value={customStrategyForm.description}
                onChange={(e) => setCustomStrategyForm({ ...customStrategyForm, description: e.target.value })}
                data-testid="input-custom-strategy-description"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  className="w-full mt-1 p-2 border rounded-md text-sm"
                  value={customStrategyForm.category}
                  onChange={(e) => setCustomStrategyForm({ 
                    ...customStrategyForm, 
                    category: e.target.value as OrganizationalStrategy["strategicCategory"] 
                  })}
                  data-testid="select-custom-strategy-category"
                >
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Timeframe</label>
                <select
                  className="w-full mt-1 p-2 border rounded-md text-sm"
                  value={customStrategyForm.timeframe}
                  onChange={(e) => setCustomStrategyForm({ 
                    ...customStrategyForm, 
                    timeframe: e.target.value as OrganizationalStrategy["timeframe"] 
                  })}
                  data-testid="select-custom-strategy-timeframe"
                >
                  {Object.entries(TIMEFRAME_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <select
                  className="w-full mt-1 p-2 border rounded-md text-sm"
                  value={customStrategyForm.priority}
                  onChange={(e) => setCustomStrategyForm({ 
                    ...customStrategyForm, 
                    priority: e.target.value as OrganizationalStrategy["priority"] 
                  })}
                  data-testid="select-custom-strategy-priority"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCustom(false)} data-testid="button-cancel-custom-strategy">Cancel</Button>
            <Button onClick={addCustomStrategy} disabled={!customStrategyForm.name.trim()} data-testid="button-save-custom-strategy">
              Add Strategy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showHandoffConfirmation} onOpenChange={setShowHandoffConfirmation}>
        <DialogContent data-testid="dialog-handoff-confirmation" className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Confirm Handoff to Delivery
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              You are about to finalize these outcomes and hand them off to the Delivery team. 
              This action will mark the following as confirmed:
            </p>
            
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Selected Strategies</span>
                <Badge variant="outline">{confirmedStrategies.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Selected Outcomes</span>
                <Badge variant="outline">{selectedOutcomes.size}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Estimated Value</span>
                <Badge className="bg-emerald-100 text-emerald-700">
                  <DollarSign className="w-3 h-3 mr-1" />
                  Ready for tracking
                </Badge>
              </div>
            </div>

            <div className="border rounded-lg p-3 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Important:</strong> Once confirmed, outcomes will be created as KPI commitments 
                and will be visible to the Delivery team for tracking and realization.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowHandoffConfirmation(false)} 
              data-testid="button-cancel-handoff"
            >
              Go Back
            </Button>
            <Button 
              onClick={handleConfirmHandoff} 
              className="bg-emerald-600 hover:bg-emerald-700"
              data-testid="button-confirm-handoff"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirm Handoff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
