import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Zap,
  TrendingUp,
  Trophy,
  ChevronRight,
  ChevronDown,
  Calendar,
  Target,
  CheckCircle2,
  Circle,
  Layers,
  Users,
  Clock,
  Star,
  ArrowRight
} from "lucide-react";
import {
  UNIFIED_JOURNEY_PHASES,
  createUnifiedJourney,
  VALUE_PILLARS,
  type UnifiedPhase,
  type OutcomeLane,
  type UnifiedJourneyData,
  type SolutionPatternId,
  type ValuePillarId
} from "@shared/value-frameworks";

interface SelectedOutcome {
  id: string;
  name: string;
  solutionPattern: SolutionPatternId;
  pillar: ValuePillarId;
  expectedValue?: string;
  selected?: boolean;
}

interface UnifiedJourneyTimelineProps {
  selectedOutcomes: SelectedOutcome[];
  onOutcomeClick?: (outcomeId: string) => void;
  onOutcomeToggle?: (outcomeId: string, selected: boolean) => void;
  compact?: boolean;
  selectable?: boolean;
}

const phaseColorMap: Record<UnifiedPhase['color'], {
  bg: string;
  border: string;
  text: string;
  light: string;
  gradient: string;
}> = {
  blue: {
    bg: 'bg-blue-500',
    border: 'border-blue-400',
    text: 'text-blue-600',
    light: 'bg-blue-50',
    gradient: 'from-blue-500 to-blue-600'
  },
  violet: {
    bg: 'bg-violet-500',
    border: 'border-violet-400',
    text: 'text-violet-600',
    light: 'bg-violet-50',
    gradient: 'from-violet-500 to-violet-600'
  },
  emerald: {
    bg: 'bg-emerald-500',
    border: 'border-emerald-400',
    text: 'text-emerald-600',
    light: 'bg-emerald-50',
    gradient: 'from-emerald-500 to-emerald-600'
  }
};

const pillarColorMap: Record<string, string> = {
  emerald: 'bg-emerald-500',
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
  violet: 'bg-violet-500',
  slate: 'bg-slate-500',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  teal: 'bg-teal-500',
  cyan: 'bg-cyan-500',
  indigo: 'bg-indigo-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  rose: 'bg-rose-500'
};

const PhaseIcon = ({ icon }: { icon: string }) => {
  switch (icon) {
    case 'Zap': return <Zap className="w-4 h-4" />;
    case 'TrendingUp': return <TrendingUp className="w-4 h-4" />;
    case 'Trophy': return <Trophy className="w-4 h-4" />;
    default: return <Circle className="w-4 h-4" />;
  }
};

export function UnifiedJourneyTimeline({
  selectedOutcomes,
  onOutcomeClick,
  onOutcomeToggle,
  compact = false,
  selectable = false
}: UnifiedJourneyTimelineProps) {
  const [expandedLane, setExpandedLane] = useState<string | null>(null);
  const [hoveredPhase, setHoveredPhase] = useState<UnifiedPhase['id'] | null>(null);

  const filteredOutcomes = useMemo(() => {
    if (selectable) {
      return selectedOutcomes.filter(o => o.selected !== false);
    }
    return selectedOutcomes;
  }, [selectedOutcomes, selectable]);

  const journeyData = useMemo(() => {
    if (filteredOutcomes.length === 0) return null;
    return createUnifiedJourney(filteredOutcomes);
  }, [filteredOutcomes]);

  if (!journeyData || journeyData.lanes.length === 0) {
    return (
      <Card className="border-dashed" data-testid="empty-journey-timeline">
        <CardContent className="py-12 text-center">
          <Layers className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">
            Select outcomes to see your unified implementation journey
          </p>
          <p className="text-sm text-muted-foreground/60 mt-2">
            The timeline will show how all selected outcomes fit together
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalWeeks = journeyData.totalMonths * 4;

  return (
    <Card className="overflow-hidden" data-testid="unified-journey-timeline">
      <CardHeader className="pb-3 border-b bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Implementation Journey</CardTitle>
              <p className="text-sm text-muted-foreground">
                {journeyData.totalOutcomes} outcome{journeyData.totalOutcomes > 1 ? 's' : ''} over ~{journeyData.totalMonths} months
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {UNIFIED_JOURNEY_PHASES.map(phase => (
              <Badge
                key={phase.id}
                variant="outline"
                className={`${phaseColorMap[phase.color].text} ${phaseColorMap[phase.color].border}`}
              >
                <PhaseIcon icon={phase.icon} />
                <span className="ml-1">{phase.shortName}</span>
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative">
          <div className="flex border-b">
            {UNIFIED_JOURNEY_PHASES.map((phase, idx) => {
              const phaseWidth = ((phase.endMonth - phase.startMonth) / journeyData.totalMonths) * 100;
              const colors = phaseColorMap[phase.color];
              const outcomesInPhase = journeyData.lanes.filter(lane =>
                lane.phases.some(p => p.phaseId === phase.id)
              ).length;

              return (
                <div
                  key={phase.id}
                  className={`relative px-4 py-3 ${colors.light} dark:bg-opacity-10 border-r last:border-r-0 transition-all`}
                  style={{ width: `${Math.max(phaseWidth, 20)}%` }}
                  onMouseEnter={() => setHoveredPhase(phase.id)}
                  onMouseLeave={() => setHoveredPhase(null)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`p-1 rounded ${colors.bg} text-white`}>
                      <PhaseIcon icon={phase.icon} />
                    </div>
                    <span className={`font-semibold text-sm ${colors.text}`}>
                      {phase.name}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{phase.typicalDuration}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {outcomesInPhase} outcome{outcomesInPhase !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <AnimatePresence>
                    {hoveredPhase === phase.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute left-2 right-2 top-full mt-2 z-20"
                      >
                        <Card className="shadow-lg">
                          <CardContent className="p-3">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {phase.customerMessage}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="relative" style={{ minHeight: compact ? 'auto' : '200px' }}>
            <div className="absolute inset-0 flex pointer-events-none">
              {UNIFIED_JOURNEY_PHASES.map((phase, idx) => {
                const phaseWidth = ((phase.endMonth - phase.startMonth) / journeyData.totalMonths) * 100;
                return (
                  <div
                    key={phase.id}
                    className="border-r last:border-r-0 border-dashed border-muted-foreground/20"
                    style={{ width: `${Math.max(phaseWidth, 20)}%` }}
                  />
                );
              })}
            </div>

            <div className="relative divide-y">
              {journeyData.lanes.map((lane, laneIdx) => {
                const isExpanded = expandedLane === lane.outcomeId;
                const pillarColor = pillarColorMap[lane.pillarColor] || 'bg-slate-500';

                return (
                  <motion.div
                    key={lane.outcomeId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: laneIdx * 0.05 }}
                    className="relative"
                    data-testid={`lane-${lane.outcomeId}`}
                  >
                    <div
                      className={`flex items-center gap-3 px-4 py-3 hover-elevate cursor-pointer transition-all ${
                        isExpanded ? 'bg-muted/50' : ''
                      }`}
                      onClick={() => setExpandedLane(isExpanded ? null : lane.outcomeId)}
                    >
                      <div className={`w-1 h-8 rounded-full ${pillarColor}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{lane.outcomeName}</span>
                          <Badge variant="outline" className="text-xs">
                            {lane.totalDuration}
                          </Badge>
                        </div>
                        {lane.expectedValue && (
                          <span className="text-xs text-muted-foreground">
                            Expected: {lane.expectedValue}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOutcomeClick?.(lane.outcomeId);
                        }}
                      >
                        View Details
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-muted/30"
                        >
                          <div className="px-4 py-3">
                            <div className="flex gap-1 mb-3">
                              {lane.phases.map((phase, phaseIdx) => {
                                const phaseConfig = UNIFIED_JOURNEY_PHASES.find(p => p.id === phase.phaseId);
                                const colors = phaseConfig ? phaseColorMap[phaseConfig.color] : phaseColorMap.blue;
                                const startPct = (phase.startWeek / totalWeeks) * 100;
                                const widthPct = ((phase.endWeek - phase.startWeek) / totalWeeks) * 100;

                                return (
                                  <Popover key={phaseIdx}>
                                    <PopoverTrigger asChild>
                                      <div
                                        className={`h-6 rounded cursor-pointer transition-all hover:opacity-80 ${colors.bg}`}
                                        style={{ 
                                          marginLeft: phaseIdx === 0 ? `${startPct}%` : '2px',
                                          width: `${Math.max(widthPct - 1, 5)}%`
                                        }}
                                      />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-72">
                                      <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                          <div className={`p-1 rounded ${colors.bg} text-white`}>
                                            {phaseConfig && <PhaseIcon icon={phaseConfig.icon} />}
                                          </div>
                                          <span className="font-semibold">{phaseConfig?.name}</span>
                                        </div>
                                        <div>
                                          <span className="text-xs font-medium text-muted-foreground">Activities:</span>
                                          <ul className="mt-1 space-y-1">
                                            {phase.activities.slice(0, 3).map((activity, i) => (
                                              <li key={i} className="text-xs flex items-center gap-1">
                                                <Circle className="w-2 h-2" />
                                                {activity}
                                              </li>
                                            ))}
                                            {phase.activities.length > 3 && (
                                              <li className="text-xs text-muted-foreground">
                                                +{phase.activities.length - 3} more
                                              </li>
                                            )}
                                          </ul>
                                        </div>
                                        {phase.milestones.length > 0 && (
                                          <div>
                                            <span className="text-xs font-medium text-muted-foreground">Milestones:</span>
                                            <div className="mt-1 flex flex-wrap gap-1">
                                              {phase.milestones.map((milestone, i) => (
                                                <Badge key={i} variant="outline" className="text-xs">
                                                  <Star className="w-3 h-3 mr-1" />
                                                  {milestone}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                );
                              })}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {lane.phases.flatMap(p => p.milestones).slice(0, 4).map((milestone, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  {milestone}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {!compact && journeyData.sharedMilestones.length > 0 && (
            <div className="border-t bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Shared Milestones</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {journeyData.sharedMilestones.slice(0, 5).map((milestone, i) => (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="cursor-help">
                        <Calendar className="w-3 h-3 mr-1" />
                        Week {milestone.week}: {milestone.title}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Shared by: {milestone.outcomes.join(', ')}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function JourneySummaryStats({ 
  selectedOutcomes 
}: { 
  selectedOutcomes: SelectedOutcome[] 
}) {
  const journeyData = useMemo(() => {
    if (selectedOutcomes.length === 0) return null;
    return createUnifiedJourney(selectedOutcomes);
  }, [selectedOutcomes]);

  if (!journeyData) return null;

  const pillarCounts = selectedOutcomes.reduce((acc, outcome) => {
    acc[outcome.pillar] = (acc[outcome.pillar] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex items-center gap-6 text-sm" data-testid="journey-summary-stats">
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground">Outcomes:</span>
        <span className="font-semibold">{journeyData.totalOutcomes}</span>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground">Duration:</span>
        <span className="font-semibold">~{journeyData.totalMonths} months</span>
      </div>
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground">Pillars:</span>
        <div className="flex gap-1">
          {Object.entries(pillarCounts).map(([pillar, count]) => {
            const pillarConfig = VALUE_PILLARS[pillar as ValuePillarId];
            return (
              <Badge 
                key={pillar} 
                variant="secondary" 
                className="text-xs"
              >
                {pillarConfig?.name || pillar} ({count})
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}
