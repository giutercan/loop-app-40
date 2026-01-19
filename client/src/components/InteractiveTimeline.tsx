import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  Flag,
  Users,
  Zap,
  Target,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Filter,
  BarChart3,
  Play,
  ArrowUpRight,
  Sparkles,
  Shield,
  Activity
} from "lucide-react";
import { format, differenceInDays, startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";

interface InteractiveTimelineProps {
  projectId: number;
  companyName?: string;
}

type EventType = 'milestone' | 'kpi_update' | 'value_realized' | 'review' | 'action' | 'decision' | 'intervention';
type EventStatus = 'completed' | 'in_progress' | 'upcoming' | 'overdue' | 'at_risk';
type TimeFilter = 'all' | 'last_30' | 'last_90' | 'this_quarter' | 'next_quarter';

interface TimelineEvent {
  id: string;
  type: EventType;
  date: Date;
  title: string;
  description: string;
  status: EventStatus;
  phase?: 'discovery' | 'alignment' | 'realization';
  pillar?: 'grow' | 'optimise' | 'derisk' | 'strengthen';
  valueImpact?: number;
  currentValue?: number;
  targetValue?: number;
  unit?: string;
  relatedKpiId?: number;
  relatedOutcomeId?: string;
  metadata?: Record<string, any>;
}

const eventTypeConfig: Record<EventType, { 
  icon: typeof Flag; 
  label: string; 
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  milestone: { 
    icon: Flag, 
    label: "Milestone", 
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    borderColor: "border-purple-300 dark:border-purple-700"
  },
  kpi_update: { 
    icon: BarChart3, 
    label: "KPI Update", 
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    borderColor: "border-blue-300 dark:border-blue-700"
  },
  value_realized: { 
    icon: DollarSign, 
    label: "Value Realized", 
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    borderColor: "border-emerald-300 dark:border-emerald-700"
  },
  review: { 
    icon: Users, 
    label: "Review", 
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    borderColor: "border-indigo-300 dark:border-indigo-700"
  },
  action: { 
    icon: Zap, 
    label: "Action", 
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    borderColor: "border-amber-300 dark:border-amber-700"
  },
  decision: { 
    icon: Target, 
    label: "Decision", 
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-100 dark:bg-rose-900/30",
    borderColor: "border-rose-300 dark:border-rose-700"
  },
  intervention: { 
    icon: Activity, 
    label: "Intervention", 
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    borderColor: "border-orange-300 dark:border-orange-700"
  }
};

const statusConfig: Record<EventStatus, { 
  icon: typeof CheckCircle2; 
  label: string; 
  color: string;
  dotColor: string;
}> = {
  completed: { 
    icon: CheckCircle2, 
    label: "Completed", 
    color: "text-emerald-600 dark:text-emerald-400",
    dotColor: "bg-emerald-500"
  },
  in_progress: { 
    icon: Play, 
    label: "In Progress", 
    color: "text-blue-600 dark:text-blue-400",
    dotColor: "bg-blue-500"
  },
  upcoming: { 
    icon: Clock, 
    label: "Upcoming", 
    color: "text-slate-500 dark:text-slate-400",
    dotColor: "bg-slate-400"
  },
  overdue: { 
    icon: AlertCircle, 
    label: "Overdue", 
    color: "text-red-600 dark:text-red-400",
    dotColor: "bg-red-500"
  },
  at_risk: { 
    icon: AlertCircle, 
    label: "At Risk", 
    color: "text-amber-600 dark:text-amber-400",
    dotColor: "bg-amber-500"
  }
};

const pillarConfig: Record<string, { color: string; icon: typeof TrendingUp }> = {
  grow: { color: "text-emerald-600", icon: TrendingUp },
  optimise: { color: "text-blue-600", icon: BarChart3 },
  derisk: { color: "text-amber-600", icon: Shield },
  strengthen: { color: "text-violet-600", icon: Sparkles }
};

export function InteractiveTimeline({ projectId, companyName }: InteractiveTimelineProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [groupByMonth, setGroupByMonth] = useState(true);

  const { data: timelineAPIEvents = [], isLoading: timelineLoading } = useQuery<any[]>({
    queryKey: [`/api/projects/${projectId}/realization/timeline`],
    enabled: !!projectId,
  });

  const { data: kpiCommitments = [] } = useQuery<any[]>({
    queryKey: [`/api/projects/${projectId}/kpi-commitments`],
    enabled: !!projectId,
  });

  const { data: valueCases = [] } = useQuery<any[]>({
    queryKey: [`/api/projects/${projectId}/value-cases`],
    enabled: !!projectId,
  });

  const events = useMemo<TimelineEvent[]>(() => {
    const allEvents: TimelineEvent[] = [];
    const now = new Date();

    timelineAPIEvents.forEach((event: any) => {
      const eventDate = new Date(event.date);
      const isPast = eventDate < now;
      
      allEvents.push({
        id: `api-${event.type}-${event.id}`,
        type: event.type as EventType,
        date: eventDate,
        title: event.title,
        description: event.description || '',
        status: isPast ? 'completed' : 'upcoming',
        phase: 'realization',
        metadata: event.data
      });
    });

    kpiCommitments.forEach((commitment: any) => {
      if (commitment.targetDate) {
        const targetDate = new Date(commitment.targetDate);
        const isPast = targetDate < now;
        const progressPercent = commitment.baselineValue && commitment.targetValue && commitment.currentValue
          ? ((commitment.currentValue - commitment.baselineValue) / (commitment.targetValue - commitment.baselineValue)) * 100
          : 0;
        
        allEvents.push({
          id: `kpi-${commitment.id}`,
          type: 'kpi_update',
          date: targetDate,
          title: commitment.commitmentTitle || 'KPI Target',
          description: commitment.metricName || commitment.description || '',
          status: isPast 
            ? (progressPercent >= 80 ? 'completed' : progressPercent >= 50 ? 'at_risk' : 'overdue')
            : 'upcoming',
          phase: 'realization',
          pillar: commitment.valuePillar as any,
          currentValue: commitment.currentValue,
          targetValue: commitment.targetValue,
          unit: commitment.metricUnit,
          relatedKpiId: commitment.id,
          valueImpact: commitment.estimatedValue
        });

        if (commitment.currentValue && commitment.baselineValue) {
          const valueChange = commitment.currentValue - commitment.baselineValue;
          if (valueChange !== 0) {
            allEvents.push({
              id: `value-${commitment.id}`,
              type: 'value_realized',
              date: new Date(),
              title: `Value Progress: ${commitment.commitmentTitle}`,
              description: `${valueChange > 0 ? '+' : ''}${valueChange}${commitment.metricUnit || ''} from baseline`,
              status: 'completed',
              phase: 'realization',
              pillar: commitment.valuePillar as any,
              currentValue: commitment.currentValue,
              targetValue: commitment.targetValue,
              valueImpact: valueChange
            });
          }
        }
      }
    });

    valueCases.forEach((vc: any) => {
      if (vc.createdAt) {
        allEvents.push({
          id: `vc-${vc.id}`,
          type: 'decision',
          date: new Date(vc.createdAt),
          title: vc.title || 'Value Case Created',
          description: vc.description || '',
          status: vc.status === 'approved' ? 'completed' : 'in_progress',
          phase: 'alignment',
          valueImpact: vc.estimatedValue
        });
      }
    });

    return allEvents.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [timelineAPIEvents, kpiCommitments, valueCases]);

  const filteredEvents = useMemo(() => {
    let filtered = [...events];
    const now = new Date();

    if (timeFilter !== 'all') {
      const filterDates: Record<TimeFilter, { start: Date; end: Date }> = {
        all: { start: new Date(0), end: addMonths(now, 12) },
        last_30: { start: subMonths(now, 1), end: now },
        last_90: { start: subMonths(now, 3), end: now },
        this_quarter: { 
          start: startOfMonth(subMonths(now, now.getMonth() % 3)),
          end: endOfMonth(addMonths(startOfMonth(subMonths(now, now.getMonth() % 3)), 2))
        },
        next_quarter: {
          start: startOfMonth(addMonths(now, 3 - (now.getMonth() % 3))),
          end: endOfMonth(addMonths(startOfMonth(addMonths(now, 3 - (now.getMonth() % 3))), 2))
        }
      };
      const { start, end } = filterDates[timeFilter];
      filtered = filtered.filter(e => e.date >= start && e.date <= end);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(e => e.type === typeFilter);
    }

    return filtered;
  }, [events, timeFilter, typeFilter]);

  const groupedEvents = useMemo(() => {
    if (!groupByMonth) return { ungrouped: filteredEvents };
    
    const groups: Record<string, TimelineEvent[]> = {};
    filteredEvents.forEach(event => {
      const monthKey = format(event.date, 'MMMM yyyy');
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(event);
    });
    return groups;
  }, [filteredEvents, groupByMonth]);

  const stats = useMemo(() => {
    const completed = events.filter(e => e.status === 'completed').length;
    const inProgress = events.filter(e => e.status === 'in_progress').length;
    const upcoming = events.filter(e => e.status === 'upcoming').length;
    const atRisk = events.filter(e => e.status === 'at_risk' || e.status === 'overdue').length;
    const totalValue = events.reduce((sum, e) => sum + (e.valueImpact || 0), 0);
    
    return { completed, inProgress, upcoming, atRisk, totalValue, total: events.length };
  }, [events]);

  const toggleEventExpanded = (eventId: string) => {
    setExpandedEvents(prev => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };

  if (timelineLoading) {
    return (
      <Card data-testid="timeline-loading">
        <CardContent className="py-12 text-center">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-muted rounded-full" />
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="interactive-timeline">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-500 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Project Timeline</h3>
            <p className="text-sm text-muted-foreground">
              {events.length} events · {stats.completed} completed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
            <SelectTrigger className="w-[140px] h-8" data-testid="select-time-filter">
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="last_30">Last 30 Days</SelectItem>
              <SelectItem value="last_90">Last 90 Days</SelectItem>
              <SelectItem value="this_quarter">This Quarter</SelectItem>
              <SelectItem value="next_quarter">Next Quarter</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as EventType | 'all')}>
            <SelectTrigger className="w-[140px] h-8" data-testid="select-type-filter">
              <Filter className="w-3.5 h-3.5 mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(eventTypeConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <span className="flex items-center gap-2">
                    <config.icon className="w-3.5 h-3.5" />
                    {config.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={groupByMonth ? "secondary" : "outline"}
            size="sm"
            onClick={() => setGroupByMonth(!groupByMonth)}
            className="h-8"
            data-testid="button-toggle-grouping"
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            Group by Month
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{stats.completed}</p>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <Play className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.inProgress}</p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Clock className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">{stats.upcoming}</p>
                <p className="text-xs text-slate-500">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.atRisk}</p>
                <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Needs Attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.totalValue > 0 && (
        <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">Total Value Impact</p>
                  <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                    ${stats.totalValue.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="w-5 h-5" />
                <span className="font-medium">Tracking</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground font-medium">No events found</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                Try adjusting your filters or add milestones and KPI updates
              </p>
            </CardContent>
          </Card>
        ) : groupByMonth ? (
          Object.entries(groupedEvents).map(([monthKey, monthEvents]) => (
            <Collapsible key={monthKey} defaultOpen={true}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-10 px-3 hover:bg-muted/50"
                  data-testid={`collapsible-${monthKey}`}
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {monthKey}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {monthEvents.length}
                    </Badge>
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 border-l-2 border-muted ml-4 mt-2 space-y-3">
                {monthEvents.map(event => (
                  <TimelineEventCard
                    key={event.id}
                    event={event}
                    isExpanded={expandedEvents.has(event.id)}
                    onToggle={() => toggleEventExpanded(event.id)}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))
        ) : (
          <div className="pl-4 border-l-2 border-muted space-y-3">
            {filteredEvents.map(event => (
              <TimelineEventCard
                key={event.id}
                event={event}
                isExpanded={expandedEvents.has(event.id)}
                onToggle={() => toggleEventExpanded(event.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineEventCard({ 
  event, 
  isExpanded, 
  onToggle 
}: { 
  event: TimelineEvent; 
  isExpanded: boolean; 
  onToggle: () => void;
}) {
  const typeConfig = eventTypeConfig[event.type];
  const status = statusConfig[event.status];
  const TypeIcon = typeConfig.icon;
  const StatusIcon = status.icon;
  const pillar = event.pillar ? pillarConfig[event.pillar] : null;
  const PillarIcon = pillar?.icon;

  const progressPercent = event.currentValue && event.targetValue
    ? Math.min(100, Math.max(0, (event.currentValue / event.targetValue) * 100))
    : null;

  const daysAgo = differenceInDays(new Date(), event.date);
  const dateLabel = daysAgo === 0 
    ? 'Today' 
    : daysAgo === 1 
      ? 'Yesterday'
      : daysAgo < 0
        ? `In ${Math.abs(daysAgo)} days`
        : `${daysAgo} days ago`;

  return (
    <div 
      className="relative group"
      data-testid={`timeline-event-${event.id}`}
    >
      <div className={`absolute -left-[21px] top-3 w-4 h-4 rounded-full ${status.dotColor} border-2 border-background shadow-sm z-10`} />
      
      <Card 
        className={`ml-2 cursor-pointer transition-all hover:shadow-md ${isExpanded ? 'ring-1 ring-primary/20' : ''}`}
        onClick={onToggle}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg ${typeConfig.bgColor} flex items-center justify-center flex-shrink-0`}>
              <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium text-sm truncate">{event.title}</h4>
                <Badge variant="outline" className={`text-xs ${typeConfig.color} ${typeConfig.borderColor}`}>
                  {typeConfig.label}
                </Badge>
                {pillar && PillarIcon && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <PillarIcon className={`w-3 h-3 ${pillar.color}`} />
                    {event.pillar}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(event.date, 'MMM d, yyyy')}
                </span>
                <span className="text-muted-foreground/50">·</span>
                <span className={status.color}>{dateLabel}</span>
                <Badge variant="secondary" className={`text-xs ${status.color}`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </div>

              {progressPercent !== null && (
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{progressPercent.toFixed(0)}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-1.5" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{event.currentValue}{event.unit}</span>
                    <span>Target: {event.targetValue}{event.unit}</span>
                  </div>
                </div>
              )}

              {event.valueImpact && event.type === 'value_realized' && (
                <div className="mt-2 flex items-center gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <DollarSign className="w-3 h-3 mr-0.5" />
                    {event.valueImpact > 0 ? '+' : ''}{event.valueImpact.toLocaleString()}
                  </Badge>
                </div>
              )}

              {isExpanded && event.description && (
                <p className="mt-3 text-sm text-muted-foreground border-t pt-3">
                  {event.description}
                </p>
              )}
            </div>

            <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default InteractiveTimeline;
