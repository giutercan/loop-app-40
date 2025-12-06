import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { 
  Target,
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle2,
  Plus,
  Info,
  Star,
  Building2,
  ArrowRight,
  Lightbulb,
  Calendar,
  Clock,
  Eye,
  MessageSquare
} from "lucide-react";
import {
  KPI_LIBRARY,
  OUTCOME_LIBRARY,
  KF_SUCCESS_STORIES,
  getKpiCategories,
  getKpisByCategory,
  getOutcomesForKpi,
  getSuccessStoryById,
  type KpiDefinition,
  type OutcomeDefinition,
  type KFSuccessStory
} from "@shared/knowledge";

// Discovery insight context for connecting recommendations
interface DiscoveryInsight {
  id: string;
  title: string;
  content: string;
  priority?: "high" | "medium" | "low";
}

// Selected outcome with timeline
interface SelectedOutcome {
  outcomeId: string;
  targetDate?: string;
  timeline?: "30_days" | "90_days" | "6_months" | "12_months" | "18_months";
}

interface KpiOutcomeSelectorProps {
  projectId: number;
  discoveryTheme?: string;
  companyName?: string;
  solutionAreas?: string[];
  discoveryInsights?: DiscoveryInsight[];
  onKpisSelected?: (kpiIds: string[]) => void;
  onOutcomesSelected?: (outcomes: SelectedOutcome[]) => void;
  onVisionComplete?: (vision: {
    kpis: string[];
    outcomes: SelectedOutcome[];
    totalValue?: number;
  }) => void;
  initialKpis?: string[];
  initialOutcomes?: string[];
}

const CATEGORY_COLORS: Record<string, string> = {
  leadership: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
  talent_acquisition: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  employee_experience: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  sales: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  organizational: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  rewards: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800",
};

const CATEGORY_ICONS: Record<string, typeof Target> = {
  leadership: Award,
  talent_acquisition: Building2,
  employee_experience: Star,
  sales: TrendingUp,
  organizational: Target,
  rewards: Sparkles,
};

interface KpiCardProps {
  kpi: KpiDefinition;
  isSelected: boolean;
  isRecommended: boolean;
  onToggle: (kpiId: string) => void;
}

function KpiCard({ kpi, isSelected, isRecommended, onToggle }: KpiCardProps) {
  const successStories = kpi.successStoryIds
    .map(id => getSuccessStoryById(id))
    .filter((s): s is KFSuccessStory => s !== undefined);

  return (
    <div 
      className={`relative p-4 rounded-lg border transition-all cursor-pointer ${
        isSelected 
          ? "border-primary bg-primary/5 dark:bg-primary/10" 
          : "border-border hover-elevate"
      }`}
      onClick={() => onToggle(kpi.id)}
      data-testid={`kpi-card-${kpi.id}`}
    >
      <div className="flex items-start gap-3">
        <Checkbox 
          checked={isSelected}
          className="mt-1"
          data-testid={`checkbox-kpi-${kpi.id}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-medium text-sm">{kpi.name}</span>
            {isRecommended && (
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700">
                <Lightbulb className="h-3 w-3 mr-1" />
                Recommended
              </Badge>
            )}
            {kpi.kornFerryProven && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge className="text-xs bg-gradient-to-r from-[#00338D] to-[#005EB8] text-white border-0">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    KF Proven
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-3">
                  <p className="font-medium mb-2">Korn Ferry Proven Results</p>
                  {successStories.length > 0 ? (
                    <ul className="space-y-1 text-xs">
                      {successStories.slice(0, 2).map(story => (
                        <li key={story.id} className="flex items-start gap-1">
                          <Star className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                          <span>{story.metric}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">Validated through KF methodology</p>
                  )}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{kpi.description}</p>
          <div className="flex items-center gap-4 mt-2 text-xs">
            <span className="text-muted-foreground">
              Baseline: <span className="font-medium text-foreground">{kpi.typicalBaseline}</span>
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">
              Benchmark: <span className="font-medium text-primary">{kpi.industryBenchmark}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface OutcomeCardProps {
  outcome: OutcomeDefinition;
  isHighlighted: boolean;
}

function OutcomeCard({ outcome, isHighlighted }: OutcomeCardProps) {
  const successStories = outcome.successStoryIds
    .map(id => getSuccessStoryById(id))
    .filter((s): s is KFSuccessStory => s !== undefined);

  return (
    <div 
      className={`p-4 rounded-lg border ${
        isHighlighted 
          ? "border-primary/50 bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10" 
          : "border-border/50 bg-muted/30"
      }`}
      data-testid={`outcome-card-${outcome.id}`}
    >
      <div className="flex items-start gap-3">
        {isHighlighted ? (
          <div className="p-1.5 rounded-full bg-gradient-to-r from-[#00338D] to-[#005EB8]">
            <CheckCircle2 className="h-4 w-4 text-white" />
          </div>
        ) : (
          <div className="p-1.5 rounded-full bg-muted">
            <Target className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`font-medium text-sm ${isHighlighted ? "text-primary" : ""}`}>
              {outcome.name}
            </span>
            {outcome.kornFerryProven && (
              <Badge className="text-xs bg-gradient-to-r from-[#00338D] to-[#005EB8] text-white border-0">
                <Star className="h-3 w-3 mr-1" />
                KF Proven
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-2">{outcome.description}</p>
          
          {isHighlighted && (
            <>
              <div className="flex items-center gap-2 text-xs mb-2">
                <Badge variant="outline" className="text-xs">
                  {outcome.kfCapability}
                </Badge>
              </div>
              <p className="text-xs text-primary/80 italic flex items-start gap-1">
                <TrendingUp className="h-3 w-3 mt-0.5 shrink-0" />
                {outcome.impactStatement}
              </p>
              
              {successStories.length > 0 && (
                <div className="mt-3 p-2 rounded bg-muted/50">
                  <p className="text-xs font-medium mb-1 flex items-center gap-1">
                    <Award className="h-3 w-3 text-amber-500" />
                    Success Stories
                  </p>
                  <ul className="space-y-1">
                    {successStories.slice(0, 2).map(story => (
                      <li key={story.id} className="text-xs text-muted-foreground">
                        <span className="font-medium">{story.client}</span>: {story.metric}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Timeline options for outcomes
const TIMELINE_OPTIONS = [
  { value: "30_days", label: "30 Days", description: "Quick wins" },
  { value: "90_days", label: "90 Days", description: "Short-term" },
  { value: "6_months", label: "6 Months", description: "Medium-term" },
  { value: "12_months", label: "12 Months", description: "Annual" },
  { value: "18_months", label: "18 Months", description: "Strategic" },
] as const;

export function KpiOutcomeSelector({
  projectId,
  discoveryTheme,
  companyName,
  solutionAreas = [],
  discoveryInsights = [],
  onKpisSelected,
  onOutcomesSelected,
  onVisionComplete,
  initialKpis = [],
  initialOutcomes = []
}: KpiOutcomeSelectorProps) {
  const [selectedKpis, setSelectedKpis] = useState<Set<string>>(new Set(initialKpis));
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["leadership"]));
  const [customKpiName, setCustomKpiName] = useState("");
  const [selectedOutcomes, setSelectedOutcomes] = useState<Map<string, SelectedOutcome>>(new Map());
  const [showVisionSummary, setShowVisionSummary] = useState(false);

  const categories = getKpiCategories();

  const recommendedKpiIds = useMemo(() => {
    const recommended = new Set<string>();
    
    if (discoveryTheme) {
      const themeToKpis: Record<string, string[]> = {
        "Leadership Development": ["succession-readiness", "leadership-effectiveness", "hipo-retention"],
        "Talent Acquisition": ["time-to-fill", "quality-of-hire", "dei-hiring"],
        "Employee Engagement": ["engagement-score", "enps", "voluntary-turnover"],
        "Sales Transformation": ["sales-win-rate", "revenue-per-seller", "sales-cycle-length"],
        "Organizational Design": ["productivity-index", "manager-effectiveness"],
        "Total Rewards": ["pay-equity-gap", "comp-competitiveness", "voluntary-turnover"],
        "Succession Planning": ["succession-readiness", "leadership-bench-strength", "hipo-retention"],
        "Culture Transformation": ["engagement-score", "voluntary-turnover", "manager-effectiveness"],
      };
      
      const matchingKpis = themeToKpis[discoveryTheme] || [];
      matchingKpis.forEach(id => recommended.add(id));
    }

    if (solutionAreas.length > 0) {
      KPI_LIBRARY.forEach(kpi => {
        if (kpi.relevantSolutionAreas.some(area => solutionAreas.includes(area))) {
          if (recommended.size < 5) {
            recommended.add(kpi.id);
          }
        }
      });
    }

    if (recommended.size === 0) {
      recommended.add("succession-readiness");
      recommended.add("engagement-score");
      recommended.add("quality-of-hire");
    }

    return recommended;
  }, [discoveryTheme, solutionAreas]);

  const cascadingOutcomes = useMemo(() => {
    const outcomes = new Map<string, OutcomeDefinition>();
    
    selectedKpis.forEach(kpiId => {
      const kpiOutcomes = getOutcomesForKpi(kpiId);
      kpiOutcomes.forEach(outcome => {
        outcomes.set(outcome.id, outcome);
      });
    });

    const sortedOutcomes = Array.from(outcomes.values()).sort((a, b) => {
      if (a.kornFerryProven && !b.kornFerryProven) return -1;
      if (!a.kornFerryProven && b.kornFerryProven) return 1;
      return b.successStoryIds.length - a.successStoryIds.length;
    });

    return sortedOutcomes;
  }, [selectedKpis]);

  const toggleKpi = (kpiId: string) => {
    const newSelected = new Set(selectedKpis);
    if (newSelected.has(kpiId)) {
      newSelected.delete(kpiId);
    } else {
      newSelected.add(kpiId);
    }
    setSelectedKpis(newSelected);
    onKpisSelected?.(Array.from(newSelected));
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const selectRecommended = () => {
    const newSelected = new Set(recommendedKpiIds);
    setSelectedKpis(newSelected);
    onKpisSelected?.(Array.from(newSelected));
  };

  // Toggle outcome selection with timeline
  const toggleOutcome = (outcomeId: string, timeline?: typeof TIMELINE_OPTIONS[number]["value"]) => {
    const newSelected = new Map(selectedOutcomes);
    if (newSelected.has(outcomeId)) {
      newSelected.delete(outcomeId);
    } else {
      newSelected.set(outcomeId, { outcomeId, timeline: timeline || "6_months" });
    }
    setSelectedOutcomes(newSelected);
    onOutcomesSelected?.(Array.from(newSelected.values()));
  };

  // Update timeline for an outcome
  const updateOutcomeTimeline = (outcomeId: string, timeline: typeof TIMELINE_OPTIONS[number]["value"]) => {
    const newSelected = new Map(selectedOutcomes);
    const existing = newSelected.get(outcomeId);
    if (existing) {
      newSelected.set(outcomeId, { ...existing, timeline });
      setSelectedOutcomes(newSelected);
      onOutcomesSelected?.(Array.from(newSelected.values()));
    }
  };

  // Complete vision with all selections
  const completeVision = () => {
    onVisionComplete?.({
      kpis: Array.from(selectedKpis),
      outcomes: Array.from(selectedOutcomes.values()),
    });
    setShowVisionSummary(true);
  };

  // Generate why this KPI matters based on discovery
  const getKpiRecommendationReason = (kpiId: string): string | null => {
    if (!discoveryTheme) return null;
    const reasons: Record<string, Record<string, string>> = {
      "Leadership Development": {
        "succession-readiness": "Your focus on leadership development directly impacts succession pipeline strength",
        "leadership-effectiveness": "Building leadership capability requires measurable effectiveness improvements",
        "hipo-retention": "Developing leaders means retaining your highest-potential talent",
      },
      "Talent Acquisition": {
        "time-to-fill": "Accelerating hiring velocity supports your growth objectives",
        "quality-of-hire": "Better talent acquisition drives long-term organizational performance",
        "dei-hiring": "Diverse hiring strengthens innovation and market responsiveness",
      },
      "Employee Engagement": {
        "engagement-score": "Engaged employees are the foundation of sustainable performance",
        "voluntary-turnover": "Reducing unwanted attrition protects your talent investment",
        "enps": "Employee advocacy reflects authentic organizational health",
      },
      "Sales Transformation": {
        "sales-win-rate": "Improving conversion directly impacts revenue growth",
        "revenue-per-seller": "Seller productivity drives profitable growth",
        "sales-cycle-length": "Faster deals mean accelerated revenue realization",
      },
    };
    return reasons[discoveryTheme]?.[kpiId] || null;
  };

  return (
    <div className="space-y-6" data-testid="kpi-outcome-selector">
      {/* Discovery Context - What led us here */}
      {(discoveryTheme || discoveryInsights.length > 0) && (
        <Card className="bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border-blue-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              Discovery Context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {discoveryTheme && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300">
                  <Eye className="h-3 w-3 mr-1" />
                  Theme: {discoveryTheme}
                </Badge>
              </div>
            )}
            {discoveryInsights.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Key insights driving these recommendations:</p>
                <div className="grid gap-2">
                  {discoveryInsights.slice(0, 3).map(insight => (
                    <div 
                      key={insight.id} 
                      className="p-2 rounded bg-muted/50 border-l-2 border-blue-500"
                    >
                      <p className="text-sm font-medium">{insight.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{insight.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!discoveryInsights.length && discoveryTheme && (
              <p className="text-sm text-muted-foreground">
                Based on your {discoveryTheme} focus, we've identified strategic goals that align with 
                {companyName ? ` ${companyName}'s` : " your"} priorities.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 1: Customer Strategic Goals (KPIs) */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {companyName ? `${companyName}'s Strategic Goals` : "Customer Strategic Goals"}
              </CardTitle>
              <CardDescription>
                What does {companyName || "the customer"} want to achieve? Select the business outcomes that matter most.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {selectedKpis.size} selected
              </Badge>
              {recommendedKpiIds.size > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={selectRecommended}
                  data-testid="button-select-recommended"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Use Recommended ({recommendedKpiIds.size})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map(category => {
            const categoryKpis = getKpisByCategory(category.id);
            const selectedInCategory = categoryKpis.filter(k => selectedKpis.has(k.id)).length;
            const isExpanded = expandedCategories.has(category.id);
            const CategoryIcon = CATEGORY_ICONS[category.id] || Target;

            return (
              <Collapsible 
                key={category.id} 
                open={isExpanded} 
                onOpenChange={() => toggleCategory(category.id)}
              >
                <CollapsibleTrigger asChild>
                  <div 
                    className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover-elevate"
                    data-testid={`category-trigger-${category.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${CATEGORY_COLORS[category.id]}`}>
                        <CategoryIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-medium">{category.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {categoryKpis.length} KPIs
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedInCategory > 0 && (
                        <Badge className="bg-primary text-primary-foreground">
                          {selectedInCategory} selected
                        </Badge>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="grid gap-3 pt-3 pl-4">
                    {categoryKpis.map(kpi => (
                      <KpiCard
                        key={kpi.id}
                        kpi={kpi}
                        isSelected={selectedKpis.has(kpi.id)}
                        isRecommended={recommendedKpiIds.has(kpi.id)}
                        onToggle={toggleKpi}
                      />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}

          <div className="flex items-center gap-2 pt-2">
            <Input
              placeholder="Add custom KPI..."
              value={customKpiName}
              onChange={(e) => setCustomKpiName(e.target.value)}
              className="flex-1"
              data-testid="input-custom-kpi"
            />
            <Button 
              variant="outline" 
              size="icon"
              disabled={!customKpiName.trim()}
              data-testid="button-add-custom-kpi"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Select Outcomes with Timelines */}
      {selectedKpis.size > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              How Will We Deliver?
              <Badge variant="outline" className="ml-2">{cascadingOutcomes.length} outcomes</Badge>
              {selectedOutcomes.size > 0 && (
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {selectedOutcomes.size} selected
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Select the outcomes you'll commit to delivering. Set realistic timelines for each.
              <span className="font-medium text-primary ml-1">KF Proven</span> outcomes have documented success.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cascadingOutcomes.map(outcome => {
                const isSelected = selectedOutcomes.has(outcome.id);
                const selectedOutcome = selectedOutcomes.get(outcome.id);
                const successStories = outcome.successStoryIds
                  .map(id => getSuccessStoryById(id))
                  .filter((s): s is KFSuccessStory => s !== undefined);

                return (
                  <div 
                    key={outcome.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isSelected 
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30" 
                        : outcome.kornFerryProven 
                          ? "border-primary/30 bg-gradient-to-r from-primary/5 to-transparent hover-elevate cursor-pointer"
                          : "border-border hover-elevate cursor-pointer"
                    }`}
                    onClick={() => !isSelected && toggleOutcome(outcome.id)}
                    data-testid={`outcome-selectable-${outcome.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={() => toggleOutcome(outcome.id)}
                        className="mt-1"
                        data-testid={`checkbox-outcome-${outcome.id}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`font-medium text-sm ${isSelected ? "text-emerald-700 dark:text-emerald-300" : ""}`}>
                            {outcome.name}
                          </span>
                          {outcome.kornFerryProven && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge className="text-xs bg-gradient-to-r from-[#00338D] to-[#005EB8] text-white border-0">
                                  <Star className="h-3 w-3 mr-1" />
                                  KF Proven
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs p-3">
                                <p className="font-medium mb-2">Proven Success</p>
                                {successStories.length > 0 ? (
                                  <ul className="space-y-1 text-xs">
                                    {successStories.slice(0, 2).map(story => (
                                      <li key={story.id}>
                                        <span className="font-medium">{story.client}</span>: {story.metric}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-xs">Validated through KF methodology</p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{outcome.description}</p>
                        
                        {/* Timeline selection when selected */}
                        {isSelected && (
                          <div className="mt-3 p-3 rounded-lg bg-white dark:bg-muted/30 border border-emerald-200 dark:border-emerald-800">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-4 w-4 text-emerald-600" />
                              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Target Timeline</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {TIMELINE_OPTIONS.map(option => (
                                <Button
                                  key={option.value}
                                  variant={selectedOutcome?.timeline === option.value ? "default" : "outline"}
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateOutcomeTimeline(outcome.id, option.value);
                                  }}
                                  className={selectedOutcome?.timeline === option.value 
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                                    : ""
                                  }
                                  data-testid={`timeline-${outcome.id}-${option.value}`}
                                >
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {option.label}
                                </Button>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {TIMELINE_OPTIONS.find(o => o.value === selectedOutcome?.timeline)?.description || "Select a target timeline"}
                            </p>
                          </div>
                        )}
                        
                        {!isSelected && outcome.impactStatement && (
                          <p className="text-xs text-primary/80 italic flex items-start gap-1 mt-2">
                            <TrendingUp className="h-3 w-3 mt-0.5 shrink-0" />
                            {outcome.impactStatement}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {cascadingOutcomes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Select strategic goals above to see how we can help deliver them</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vision Summary - Complete Picture */}
      {selectedKpis.size > 0 && selectedOutcomes.size > 0 && (
        <Card className="bg-gradient-to-r from-[#00338D]/5 to-[#005EB8]/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Value Vision Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-white dark:bg-muted/30 border">
                <p className="text-2xl font-bold text-primary">{selectedKpis.size}</p>
                <p className="text-xs text-muted-foreground">Strategic Goals</p>
              </div>
              <div className="p-3 rounded-lg bg-white dark:bg-muted/30 border">
                <p className="text-2xl font-bold text-emerald-600">{selectedOutcomes.size}</p>
                <p className="text-xs text-muted-foreground">Committed Outcomes</p>
              </div>
              <div className="p-3 rounded-lg bg-white dark:bg-muted/30 border">
                <p className="text-2xl font-bold text-amber-600">
                  {cascadingOutcomes.filter(o => selectedOutcomes.has(o.id) && o.kornFerryProven).length}
                </p>
                <p className="text-xs text-muted-foreground">KF Proven</p>
              </div>
            </div>

            {/* Timeline Overview */}
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Delivery Timeline
              </p>
              <div className="flex flex-wrap gap-2">
                {TIMELINE_OPTIONS.map(option => {
                  const count = Array.from(selectedOutcomes.values()).filter(
                    so => so.timeline === option.value
                  ).length;
                  if (count === 0) return null;
                  return (
                    <Badge key={option.value} variant="outline" className="text-xs">
                      {option.label}: {count} outcome{count > 1 ? "s" : ""}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Connection flow visualization */}
            <div className="p-3 rounded-lg bg-muted/30 border">
              <p className="text-xs text-muted-foreground mb-2">Complete Value Flow:</p>
              <div className="flex items-center gap-2 flex-wrap text-sm">
                {discoveryTheme && (
                  <>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300">
                      {discoveryTheme}
                    </Badge>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </>
                )}
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300">
                  {selectedKpis.size} Goals
                </Badge>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                  {selectedOutcomes.size} Outcomes
                </Badge>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <Badge className="bg-gradient-to-r from-[#00338D] to-[#005EB8] text-white border-0">
                  Value Delivery
                </Badge>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end">
              <Button 
                className="bg-gradient-to-r from-[#00338D] to-[#005EB8] text-white"
                onClick={completeVision}
                data-testid="button-complete-vision"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Finalize Value Vision
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Hint when KPIs selected but no outcomes */}
      {selectedKpis.size > 0 && selectedOutcomes.size === 0 && cascadingOutcomes.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="py-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Info className="h-5 w-5" />
              <p className="text-sm">
                Select outcomes above to build a complete value vision with timelines.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default KpiOutcomeSelector;
