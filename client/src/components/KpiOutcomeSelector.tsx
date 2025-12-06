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
  Lightbulb
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

interface KpiOutcomeSelectorProps {
  projectId: number;
  discoveryTheme?: string;
  solutionAreas?: string[];
  onKpisSelected?: (kpiIds: string[]) => void;
  onOutcomesSelected?: (outcomeIds: string[]) => void;
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

export function KpiOutcomeSelector({
  projectId,
  discoveryTheme,
  solutionAreas = [],
  onKpisSelected,
  onOutcomesSelected,
  initialKpis = [],
  initialOutcomes = []
}: KpiOutcomeSelectorProps) {
  const [selectedKpis, setSelectedKpis] = useState<Set<string>>(new Set(initialKpis));
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["leadership"]));
  const [customKpiName, setCustomKpiName] = useState("");

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

  return (
    <div className="space-y-6" data-testid="kpi-outcome-selector">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Select Key KPIs
              </CardTitle>
              <CardDescription>
                Choose the metrics you want to track. We'll recommend outcomes based on your selection.
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

      {selectedKpis.size > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Recommended Outcomes
              <Badge variant="outline" className="ml-2">{cascadingOutcomes.length}</Badge>
            </CardTitle>
            <CardDescription>
              These outcomes will help you achieve your selected KPIs. 
              <span className="font-medium text-primary ml-1">Highlighted outcomes</span> show where Korn Ferry has proven success.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cascadingOutcomes.map(outcome => (
                <OutcomeCard
                  key={outcome.id}
                  outcome={outcome}
                  isHighlighted={outcome.kornFerryProven}
                />
              ))}
              
              {cascadingOutcomes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Select KPIs above to see recommended outcomes</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedKpis.size > 0 && cascadingOutcomes.length > 0 && (
        <Card className="bg-gradient-to-r from-[#00338D]/5 to-[#005EB8]/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-[#00338D] to-[#005EB8]">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">
                    {selectedKpis.size} KPIs selected → {cascadingOutcomes.filter(o => o.kornFerryProven).length} KF Proven Outcomes
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ready to create value commitments with proven success potential
                  </p>
                </div>
              </div>
              <Button 
                className="bg-gradient-to-r from-[#00338D] to-[#005EB8] text-white"
                data-testid="button-proceed-to-commitments"
              >
                Proceed to Commitments
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default KpiOutcomeSelector;
