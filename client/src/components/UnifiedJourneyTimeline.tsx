import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Zap,
  TrendingUp,
  Trophy,
  ChevronRight,
  ChevronDown,
  Layers,
  Clock,
  Target,
  CheckCircle2,
  Circle,
  ArrowRight,
  Shield,
  BarChart3,
  Sparkles,
  FileEdit,
  Send,
  CheckCircle,
  Play,
  DollarSign
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
  status?: "draft" | "proposed" | "confirmed" | "in_progress" | "completed";
  description?: string;
  baselineValue?: string;
  targetValue?: string;
  metricUnit?: string;
  strategyName?: string;
}

interface UnifiedJourneyTimelineProps {
  selectedOutcomes: SelectedOutcome[];
  onOutcomeClick?: (outcomeId: string) => void;
  onOutcomeToggle?: (outcomeId: string, selected: boolean) => void;
  compact?: boolean;
  selectable?: boolean;
}

const phaseConfig: Record<UnifiedPhase['id'], {
  icon: typeof Zap;
  color: string;
  bgLight: string;
  border: string;
  text: string;
  gradient: string;
}> = {
  near_term: {
    icon: Zap,
    color: 'bg-blue-500',
    bgLight: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-500 to-blue-600'
  },
  build_momentum: {
    icon: TrendingUp,
    color: 'bg-violet-500',
    bgLight: 'bg-violet-50 dark:bg-violet-950/30',
    border: 'border-violet-200 dark:border-violet-800',
    text: 'text-violet-600 dark:text-violet-400',
    gradient: 'from-violet-500 to-violet-600'
  },
  realize_value: {
    icon: Trophy,
    color: 'bg-emerald-500',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-500 to-emerald-600'
  }
};

const pillarColors: Record<string, { dot: string; bar: string; bg: string }> = {
  emerald: { dot: 'bg-emerald-500', bar: 'bg-emerald-500/20', bg: 'bg-emerald-50' },
  blue: { dot: 'bg-blue-500', bar: 'bg-blue-500/20', bg: 'bg-blue-50' },
  amber: { dot: 'bg-amber-500', bar: 'bg-amber-500/20', bg: 'bg-amber-50' },
  violet: { dot: 'bg-violet-500', bar: 'bg-violet-500/20', bg: 'bg-violet-50' },
};

const pillarIcons: Record<ValuePillarId, typeof TrendingUp> = {
  grow: TrendingUp,
  optimise: BarChart3,
  derisk: Shield,
  strengthen: Sparkles
};

const statusConfig: Record<string, { label: string; color: string; icon: typeof FileEdit }> = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300", icon: FileEdit },
  proposed: { label: "Proposed", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: Send },
  confirmed: { label: "Confirmed", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Play },
  completed: { label: "Completed", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: Trophy }
};

export function UnifiedJourneyTimeline({
  selectedOutcomes,
  onOutcomeClick,
  onOutcomeToggle,
  compact = false,
  selectable = false
}: UnifiedJourneyTimelineProps) {
  const [selectedLane, setSelectedLane] = useState<string | null>(null);
  const [showAllActivities, setShowAllActivities] = useState<Record<string, boolean>>({});

  // When selectable, show ALL outcomes (even deselected ones) so checkboxes remain visible
  // Only filter to selected outcomes when NOT in selectable mode
  const filteredOutcomes = useMemo(() => {
    if (selectable) {
      // In selectable mode, show all outcomes with their selection state
      return selectedOutcomes;
    }
    // In non-selectable mode, only show outcomes marked as selected
    return selectedOutcomes.filter(o => o.selected !== false);
  }, [selectedOutcomes, selectable]);

  const journeyData = useMemo(() => {
    if (filteredOutcomes.length === 0) return null;
    return createUnifiedJourney(filteredOutcomes);
  }, [filteredOutcomes]);

  // Calculate total weeks from actual journey data - use max endWeek from all lanes
  const totalWeeks = useMemo(() => {
    if (!journeyData) return 72;
    const allEndWeeks = journeyData.lanes.flatMap(lane => 
      lane.phases.map(p => p.endWeek)
    );
    // Guard against empty arrays (Math.max returns -Infinity for empty arrays)
    const maxEndWeek = allEndWeeks.length > 0 ? Math.max(...allEndWeeks) : 0;
    return maxEndWeek > 0 ? maxEndWeek : journeyData.totalMonths * 4;
  }, [journeyData]);

  if (!journeyData || journeyData.lanes.length === 0) {
    return (
      <Card className="border-dashed border-2" data-testid="empty-journey-timeline">
        <CardContent className="py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground font-medium">
            Select outcomes to see your implementation journey
          </p>
          <p className="text-sm text-muted-foreground/60 mt-2 max-w-sm mx-auto">
            The timeline will show how all selected outcomes flow together across phases
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleToggle = (outcomeId: string, newSelected: boolean) => {
    if (onOutcomeToggle) {
      onOutcomeToggle(outcomeId, newSelected);
    }
  };

  return (
    <div className="space-y-0" data-testid="unified-journey-timeline">
      {/* Header Summary */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-emerald-500 flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Value Journey</h3>
            <p className="text-sm text-muted-foreground">
              {journeyData.totalOutcomes} outcome{journeyData.totalOutcomes > 1 ? 's' : ''} · ~{journeyData.totalMonths} months
            </p>
          </div>
        </div>
      </div>

      {/* Phase Rail - Clean horizontal spine */}
      <div className="relative mb-1">
        <div className="flex">
          {UNIFIED_JOURNEY_PHASES.map((phase, idx) => {
            const config = phaseConfig[phase.id];
            const Icon = config.icon;
            const outcomesInPhase = journeyData.lanes.filter(lane =>
              lane.phases.some(p => p.phaseId === phase.id)
            ).length;

            return (
              <div 
                key={phase.id}
                className="flex-1 relative"
              >
                {/* Phase Header */}
                <div className={`px-4 py-4 ${config.bgLight} ${idx === 0 ? 'rounded-tl-xl' : ''} ${idx === UNIFIED_JOURNEY_PHASES.length - 1 ? 'rounded-tr-xl' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-7 h-7 rounded-lg ${config.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className={`font-semibold text-sm ${config.text}`}>
                      {phase.shortName}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-9">
                    {phase.typicalDuration}
                  </p>
                </div>

                {/* Connector Arrow */}
                {idx < UNIFIED_JOURNEY_PHASES.length - 1 && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
                    <div className="w-6 h-6 rounded-full bg-background border-2 border-muted flex items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Lanes - Clean progress ribbons */}
      <Card className="overflow-hidden">
        <div className="divide-y">
          {journeyData.lanes.map((lane, laneIdx) => {
            const colors = pillarColors[lane.pillarColor] || pillarColors.blue;
            const isSelected = selectedLane === lane.outcomeId;
            const pillarConfig = VALUE_PILLARS[lane.pillar as ValuePillarId];
            const outcome = selectedOutcomes.find(o => o.id === lane.outcomeId);
            const isOutcomeSelected = outcome?.selected !== false;

            return (
              <motion.div
                key={lane.outcomeId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: laneIdx * 0.05 }}
                className={`relative transition-colors ${
                  !isOutcomeSelected ? 'opacity-50 bg-muted/20' : 
                  isSelected ? 'bg-muted/50' : 'hover:bg-muted/30'
                }`}
                data-testid={`lane-${lane.outcomeId}`}
              >
                {/* Lane Content */}
                <div 
                  className="flex items-center gap-4 px-4 py-4 cursor-pointer"
                  onClick={() => setSelectedLane(isSelected ? null : lane.outcomeId)}
                >
                  {/* Selectable Checkbox */}
                  {selectable && (
                    <Checkbox
                      checked={isOutcomeSelected}
                      onCheckedChange={(checked) => handleToggle(lane.outcomeId, checked === true)}
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0"
                      data-testid={`checkbox-outcome-${lane.outcomeId}`}
                    />
                  )}

                  {/* Pillar Indicator */}
                  <div className={`w-2 h-10 rounded-full ${colors.dot} shrink-0`} />

                  {/* Outcome Info with Pillar Icon and Status */}
                  <div className="min-w-0 flex-shrink-0 w-56">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const PillarIcon = pillarIcons[lane.pillar as ValuePillarId];
                        return PillarIcon ? <PillarIcon className={`w-4 h-4 ${pillarConfig?.color?.replace('bg-', 'text-') || 'text-muted-foreground'}`} /> : null;
                      })()}
                      <p className="font-medium text-sm truncate">{lane.outcomeName}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <Badge variant="secondary" className={`text-xs px-1.5 py-0`}>
                        {pillarConfig?.name || lane.pillar}
                      </Badge>
                      {outcome?.status && statusConfig[outcome.status] && (() => {
                        const StatusIcon = statusConfig[outcome.status].icon;
                        return (
                          <Badge className={`text-xs px-1.5 py-0 ${statusConfig[outcome.status].color}`}>
                            <StatusIcon className="w-3 h-3 mr-0.5" />
                            {statusConfig[outcome.status].label}
                          </Badge>
                        );
                      })()}
                      <span className="text-xs text-muted-foreground">{lane.totalDuration}</span>
                    </div>
                  </div>

                  {/* Visual Progress Bar - Proportional to actual timing */}
                  <div className="flex-1 flex items-center gap-0.5 relative h-3">
                    {/* Background track */}
                    <div className="absolute inset-0 flex gap-0.5">
                      {UNIFIED_JOURNEY_PHASES.map((phase) => (
                        <div 
                          key={phase.id}
                          className="flex-1 h-3 rounded-sm bg-muted/50"
                        />
                      ))}
                    </div>
                    
                    {/* Activity bars - positioned proportionally with proper clamping */}
                    {lane.phases.map((lanePhase, phaseIdx) => {
                      const config = phaseConfig[lanePhase.phaseId as UnifiedPhase['id']];
                      // Clamp start position between 0-100%
                      const startPct = Math.max(0, Math.min(100, (lanePhase.startWeek / totalWeeks) * 100));
                      // Calculate width with proper bounds: minimum 3%, but never exceed container
                      const rawWidth = ((lanePhase.endWeek - lanePhase.startWeek) / totalWeeks) * 100;
                      const maxAllowedWidth = Math.max(0, 100 - startPct);
                      const widthPct = Math.min(Math.max(rawWidth, 3), maxAllowedWidth);

                      return (
                        <motion.div
                          key={lanePhase.phaseId}
                          initial={{ width: 0 }}
                          animate={{ width: `${widthPct}%` }}
                          transition={{ duration: 0.5, delay: laneIdx * 0.1 + phaseIdx * 0.1 }}
                          className={`absolute h-3 rounded-sm ${config.color} ${!isOutcomeSelected ? 'opacity-40' : ''}`}
                          style={{ left: `${startPct}%` }}
                        />
                      );
                    })}
                  </div>

                  {/* Expand Indicator */}
                  <div className="shrink-0">
                    {isSelected ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Action */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOutcomeClick?.(lane.outcomeId);
                    }}
                    data-testid={`button-view-outcome-${lane.outcomeId}`}
                  >
                    Details
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>

                {/* Expanded Detail Panel */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t bg-muted/20"
                    >
                      <div className="p-4">
                        {/* Responsive flex layout for variable phase counts */}
                        <div className="flex flex-wrap gap-4">
                          {lane.phases.map((phase) => {
                            const phaseInfo = UNIFIED_JOURNEY_PHASES.find(p => p.id === phase.phaseId);
                            const config = phaseInfo ? phaseConfig[phaseInfo.id] : phaseConfig.near_term;
                            const Icon = config.icon;
                            const phaseKey = `${lane.outcomeId}-${phase.phaseId}`;
                            const showAll = showAllActivities[phaseKey];
                            const visibleActivities = showAll ? phase.activities : phase.activities.slice(0, 3);

                            return (
                              <div 
                                key={phase.phaseId}
                                className={`rounded-lg p-3 ${config.bgLight} ${config.border} border flex-1 min-w-[200px] max-w-[320px]`}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <Icon className={`w-4 h-4 ${config.text}`} />
                                  <span className={`text-sm font-medium ${config.text}`}>
                                    {phaseInfo?.shortName}
                                  </span>
                                  <span className="text-xs text-muted-foreground ml-auto">
                                    Wk {phase.startWeek}-{phase.endWeek}
                                  </span>
                                </div>
                                
                                {phase.activities.length > 0 && (
                                  <div className="space-y-1">
                                    {visibleActivities.map((activity, i) => (
                                      <div key={i} className="flex items-start gap-2">
                                        <Circle className="w-1.5 h-1.5 mt-1.5 fill-current text-muted-foreground shrink-0" />
                                        <span className="text-xs text-muted-foreground">{activity}</span>
                                      </div>
                                    ))}
                                    {phase.activities.length > 3 && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setShowAllActivities(prev => ({
                                            ...prev,
                                            [phaseKey]: !prev[phaseKey]
                                          }));
                                        }}
                                        className="text-xs text-primary hover:underline pl-3.5"
                                        data-testid={`button-toggle-activities-${phaseKey}`}
                                      >
                                        {showAll ? 'Show less' : `+${phase.activities.length - 3} more`}
                                      </button>
                                    )}
                                  </div>
                                )}

                                {phase.milestones.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-dashed">
                                    <div className="flex flex-wrap gap-1">
                                      {phase.milestones.map((milestone, i) => (
                                        <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">
                                          <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                                          {milestone}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Phase Legend - Clean summary */}
      <div className="mt-4 flex items-center justify-center gap-6">
        {UNIFIED_JOURNEY_PHASES.map((phase) => {
          const config = phaseConfig[phase.id];
          
          return (
            <div key={phase.id} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${config.color}`} />
              <span className="text-xs text-muted-foreground">{phase.name}</span>
            </div>
          );
        })}
      </div>
    </div>
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
