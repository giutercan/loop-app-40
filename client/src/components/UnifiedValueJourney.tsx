import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  Zap,
  TrendingUp,
  Target,
  Award,
  Clock,
  CheckCircle2,
  Circle,
  BarChart3,
  Layers
} from "lucide-react";

interface Outcome {
  id: string;
  outcomeName: string;
  outcomeDescription: string;
  valuePillar: "grow" | "optimise" | "derisk" | "strengthen";
  kpiDetails: {
    metricName: string;
    unit: string;
    suggestedBaseline: string;
    suggestedTarget: string;
    timeframe: string;
  };
  estimatedValue?: number;
  achievability?: "high" | "medium" | "low";
  implementationMonths?: number;
}

interface JourneyPhase {
  name: string;
  weeks: string;
  activities: string[];
  milestones: string[];
}

interface OutcomeJourney {
  outcomeId: string;
  phases: JourneyPhase[];
}

interface UnifiedValueJourneyProps {
  outcomes: Outcome[];
  selectedOutcomeIds?: Set<string>;
  onOutcomeToggle?: (outcomeId: string) => void;
  onSelectAll?: () => void;
  projectId?: number;
}

const VALUE_PILLAR_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: typeof TrendingUp }> = {
  grow: { label: "Grow", color: "text-emerald-600", bgColor: "bg-emerald-100 dark:bg-emerald-900/30", icon: TrendingUp },
  optimise: { label: "Optimise", color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30", icon: BarChart3 },
  derisk: { label: "De-risk", color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900/30", icon: Target },
  strengthen: { label: "Strengthen", color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-900/30", icon: Zap },
};

const PHASE_COLORS = {
  quickWins: "bg-blue-400",
  momentum: "bg-emerald-400", 
  impact: "bg-purple-400"
};

function generateJourneyPhases(outcome: Outcome): JourneyPhase[] {
  const pillar = outcome.valuePillar;
  const months = outcome.implementationMonths || 18;
  
  const basePhases: Record<string, JourneyPhase[]> = {
    grow: [
      {
        name: "Quick Wins",
        weeks: "Wk 0-12",
        activities: ["Market opportunity assessment", "Pipeline analysis", "Revenue optimization quick wins"],
        milestones: ["Assessment complete", "Quick wins identified"]
      },
      {
        name: "Momentum",
        weeks: "Wk 12-36",
        activities: ["Sales capability development", "Market expansion planning", "Partnership development"],
        milestones: ["Revenue growth trajectory", "Market share gains"]
      },
      {
        name: "Impact",
        weeks: "Wk 36-72",
        activities: ["Sustainable growth model", "Competitive positioning", "Scale operations"],
        milestones: ["Revenue targets met", "Growth engine operational"]
      }
    ],
    optimise: [
      {
        name: "Quick Wins",
        weeks: "Wk 0-12",
        activities: ["Process efficiency audit", "Cost reduction identification", "Workflow optimization"],
        milestones: ["Baseline established", "Optimization roadmap approved"]
      },
      {
        name: "Momentum",
        weeks: "Wk 12-36",
        activities: ["Technology implementation", "Process reengineering", "Performance system alignment"],
        milestones: ["Efficiency gains measured", "Systems integrated"]
      },
      {
        name: "Impact",
        weeks: "Wk 36-72",
        activities: ["Operational excellence", "Continuous improvement", "Productivity scaling"],
        milestones: ["Cost savings realized", "Efficiency targets met"]
      }
    ],
    derisk: [
      {
        name: "Quick Wins",
        weeks: "Wk 0-18",
        activities: ["Leadership assessment", "Gap analysis", "Program design"],
        milestones: ["Assessment complete", "Development plan approved"]
      },
      {
        name: "Momentum",
        weeks: "Wk 18-36",
        activities: ["Development programs", "Coaching deployment", "Action learning projects"],
        milestones: ["First cohort completed", "Initial behavior changes observed"]
      },
      {
        name: "Momentum",
        weeks: "Wk 36-54",
        activities: ["Succession planning integration", "Performance system alignment", "Culture reinforcement"],
        milestones: ["Promotion pipeline active", "Retention metrics improved"]
      },
      {
        name: "Impact",
        weeks: "Wk 54-72",
        activities: ["Program expansion", "Internal capability building", "Continuous improvement"],
        milestones: ["Full pipeline coverage", "ROI validated"]
      }
    ],
    strengthen: [
      {
        name: "Quick Wins",
        weeks: "Wk 0-12",
        activities: ["Culture assessment", "Engagement baseline", "Change readiness"],
        milestones: ["Culture baseline set", "Priority areas identified"]
      },
      {
        name: "Momentum",
        weeks: "Wk 12-36",
        activities: ["Leadership alignment", "Communication cascade", "Behavior modeling"],
        milestones: ["Leadership aligned", "Culture initiatives launched"]
      },
      {
        name: "Impact",
        weeks: "Wk 36-72",
        activities: ["Culture embedding", "Recognition systems", "Sustainable practices"],
        milestones: ["Engagement improved", "Culture shift measured"]
      }
    ]
  };

  return basePhases[pillar] || basePhases.derisk;
}

function OutcomeRow({ 
  outcome, 
  isSelected, 
  onToggle,
  journeyPhases
}: { 
  outcome: Outcome; 
  isSelected: boolean;
  onToggle: () => void;
  journeyPhases: JourneyPhase[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const pillarConfig = VALUE_PILLAR_CONFIG[outcome.valuePillar] || VALUE_PILLAR_CONFIG.strengthen;
  const PillarIcon = pillarConfig.icon;
  
  const months = outcome.implementationMonths || 18;
  const estimatedValue = outcome.estimatedValue || Math.floor(Math.random() * 2000 + 1000);

  const progressSegments = useMemo(() => {
    const totalPhases = journeyPhases.length;
    const quickWinPhases = journeyPhases.filter(p => p.name === "Quick Wins").length;
    const momentumPhases = journeyPhases.filter(p => p.name === "Momentum").length;
    const impactPhases = journeyPhases.filter(p => p.name === "Impact").length;
    
    return {
      quickWins: (quickWinPhases / totalPhases) * 100,
      momentum: (momentumPhases / totalPhases) * 100,
      impact: (impactPhases / totalPhases) * 100
    };
  }, [journeyPhases]);

  return (
    <div className="border-b last:border-b-0" data-testid={`journey-outcome-row-${outcome.id}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="flex items-center gap-3 py-3 px-4 hover-elevate">
          <Checkbox 
            checked={isSelected}
            onCheckedChange={() => onToggle()}
            data-testid={`checkbox-journey-outcome-${outcome.id}`}
          />
          
          <div className={`flex items-center gap-2 min-w-[140px] ${pillarConfig.color}`}>
            <PillarIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{pillarConfig.label}</span>
          </div>
          
          <span className="text-xs text-muted-foreground min-w-[80px]">{months}-{months + 6} months</span>
          
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 h-3 rounded-full overflow-hidden flex bg-muted">
              <div 
                className={`${PHASE_COLORS.quickWins}`} 
                style={{ width: `${progressSegments.quickWins}%` }}
              />
              <div 
                className={`${PHASE_COLORS.momentum}`} 
                style={{ width: `${progressSegments.momentum}%` }}
              />
              <div 
                className={`${PHASE_COLORS.impact}`} 
                style={{ width: `${progressSegments.impact}%` }}
              />
            </div>
          </div>
          
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1"
              data-testid={`button-expand-journey-${outcome.id}`}
            >
              Details
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-2 bg-muted/30">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {journeyPhases.map((phase, idx) => {
                const isQuickWins = phase.name === "Quick Wins";
                const isMomentum = phase.name === "Momentum";
                const isImpact = phase.name === "Impact";
                
                const phaseColor = isQuickWins 
                  ? "text-blue-600 border-blue-400" 
                  : isMomentum 
                    ? "text-emerald-600 border-emerald-400"
                    : "text-purple-600 border-purple-400";
                
                const phaseIcon = isQuickWins 
                  ? Zap 
                  : isMomentum 
                    ? TrendingUp 
                    : Award;
                const PhaseIcon = phaseIcon;

                return (
                  <div 
                    key={idx} 
                    className={`rounded-lg border-l-4 bg-card p-3 ${phaseColor}`}
                    data-testid={`phase-card-${outcome.id}-${idx}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <PhaseIcon className="h-4 w-4" />
                      <span className="font-semibold text-sm">{phase.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{phase.weeks}</span>
                    </div>
                    
                    <ul className="space-y-1 mb-3">
                      {phase.activities.slice(0, 3).map((activity, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                          <Circle className="h-2 w-2 mt-1 shrink-0 fill-current" />
                          {activity}
                        </li>
                      ))}
                      {phase.activities.length > 3 && (
                        <li className="text-xs text-muted-foreground">+{phase.activities.length - 3} more</li>
                      )}
                    </ul>
                    
                    <div className="pt-2 border-t space-y-1">
                      {phase.milestones.map((milestone, i) => (
                        <div key={i} className="flex items-center gap-1 text-xs">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          <span>{milestone}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function UnifiedValueJourney({
  outcomes,
  selectedOutcomeIds = new Set(),
  onOutcomeToggle,
  onSelectAll,
  projectId
}: UnifiedValueJourneyProps) {
  const selectedCount = selectedOutcomeIds.size;
  const totalCount = outcomes.length;
  
  const groupedOutcomes = useMemo(() => {
    const groups: Record<string, Outcome[]> = {};
    
    outcomes.forEach(outcome => {
      const months = outcome.implementationMonths || 18;
      let timeGroup: string;
      
      if (months <= 6) {
        timeGroup = "3-6 months";
      } else if (months <= 12) {
        timeGroup = "6-12 months";
      } else if (months <= 18) {
        timeGroup = "12-18 months";
      } else {
        timeGroup = "18-24 months";
      }
      
      if (!groups[timeGroup]) {
        groups[timeGroup] = [];
      }
      groups[timeGroup].push(outcome);
    });
    
    return groups;
  }, [outcomes]);

  const totalValue = useMemo(() => {
    return outcomes.reduce((sum, o) => sum + (o.estimatedValue || 2500), 0);
  }, [outcomes]);

  const journeyPhasesMap = useMemo(() => {
    const map = new Map<string, JourneyPhase[]>();
    outcomes.forEach(outcome => {
      map.set(outcome.id, generateJourneyPhases(outcome));
    });
    return map;
  }, [outcomes]);

  if (outcomes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4" data-testid="unified-value-journey">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Unified Value Journey</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Outcomes ordered by value priority and grouped by similar implementation timelines
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {selectedCount} of {totalCount} outcomes selected
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {Object.entries(groupedOutcomes)
            .sort(([a], [b]) => {
              const order = ["18-24 months", "12-18 months", "6-12 months", "3-6 months"];
              return order.indexOf(a) - order.indexOf(b);
            })
            .map(([timeGroup, groupOutcomes]) => (
              <div key={timeGroup} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{timeGroup}</span>
                  <Badge className="text-xs">{groupOutcomes.length} outcome{groupOutcomes.length !== 1 ? 's' : ''}</Badge>
                  <div className="flex items-center gap-1 ml-2">
                    {groupOutcomes.map((o, i) => (
                      <Badge 
                        key={i} 
                        variant="secondary" 
                        className="text-xs"
                      >
                        #{i + 1} ${(o.estimatedValue || 2500).toLocaleString()}K
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          
          <Card className="bg-gradient-to-r from-blue-500/5 via-emerald-500/5 to-purple-500/5">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base">Value Journey</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {totalCount} outcomes · ~18 months
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 space-y-4">
              <div className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-blue-600">Quick Wins</p>
                      <p className="text-xs text-muted-foreground">1-3 months</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="text-sm font-medium text-emerald-600">Momentum</p>
                      <p className="text-xs text-muted-foreground">4-9 months</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium text-purple-600">Impact</p>
                      <p className="text-xs text-muted-foreground">10-18+ months</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border overflow-hidden">
                {outcomes.map(outcome => (
                  <OutcomeRow
                    key={outcome.id}
                    outcome={outcome}
                    isSelected={selectedOutcomeIds.has(outcome.id)}
                    onToggle={() => onOutcomeToggle?.(outcome.id)}
                    journeyPhases={journeyPhasesMap.get(outcome.id) || []}
                  />
                ))}
              </div>
              
              <div className="flex items-center justify-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${PHASE_COLORS.quickWins}`} />
                  <span className="text-xs text-muted-foreground">Near-Term Wins</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${PHASE_COLORS.momentum}`} />
                  <span className="text-xs text-muted-foreground">Build Momentum</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${PHASE_COLORS.impact}`} />
                  <span className="text-xs text-muted-foreground">Realize Value</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

export default UnifiedValueJourney;
