import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers
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
  onComplete?: (data: { strategies: OrganizationalStrategy[] }) => void;
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

export function StrategicAlignmentSelector({
  projectId,
  companyName,
  industry,
  onStrategiesSelected,
  onComplete
}: StrategicAlignmentSelectorProps) {
  const [selectedStrategies, setSelectedStrategies] = useState<Set<string>>(new Set());
  const [expandedStrategies, setExpandedStrategies] = useState<Set<string>>(new Set());
  const [customStrategies, setCustomStrategies] = useState<OrganizationalStrategy[]>([]);
  const [showAddCustom, setShowAddCustom] = useState(false);
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

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/strategic-recommendations`, {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/projects", projectId, "strategic-recommendations"], data);
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

  const handleComplete = () => {
    const selected = allStrategies.filter(s => selectedStrategies.has(s.id));
    onComplete?.({ strategies: selected });
  };

  return (
    <div className="space-y-4" data-testid="strategic-alignment-selector">
      <Card className="bg-gradient-to-r from-violet-500/5 to-purple-500/5 border-violet-500/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {companyName ? `${companyName}'s Strategic Priorities` : "Strategic Priorities"}
                </CardTitle>
                <CardDescription>
                  AI-recommended organizational strategies tailored to {companyName || "your client"}'s 
                  {industry ? ` ${industry}` : ""} context
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
                  <Button onClick={handleComplete} data-testid="button-confirm-strategies">
                    Confirm Selection
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
