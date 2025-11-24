import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  Plus,
  Flag,
  Users,
  Zap,
  Target as TargetIcon
} from "lucide-react";
import { format, parseISO, isAfter, isBefore, isToday } from "date-fns";
import type { JobThemeKPI, KPIActual } from "@shared/schema";

interface MomentumTimelineProps {
  projectId: number;
}

interface FinalizedJobsResponse {
  finalized: boolean;
  jobs: Array<{
    id: number;
    jobName: string;
    kpis: JobThemeKPI[];
  }>;
}

interface TimelineEvent {
  id: string;
  type: 'measurement' | 'milestone' | 'action' | 'review' | 'intervention';
  date: Date;
  kpiId?: number;
  kpiName?: string;
  jobName?: string;
  title: string;
  description: string;
  value?: string;
  unit?: string;
  status?: 'completed' | 'upcoming' | 'overdue' | 'scheduled' | 'pending' | 'in-progress';
  icon: any;
  color: string;
}

interface TimelineAPIEvent {
  type: 'milestone' | 'review' | 'intervention';
  id: number;
  title: string;
  description: string;
  date: string;
  status: string;
  data: any;
}

export default function MomentumTimeline({ projectId }: MomentumTimelineProps) {
  // Fetch timeline events from backend (milestones, reviews, interventions)
  const { data: timelineAPIEvents = [], isLoading: timelineLoading } = useQuery<TimelineAPIEvent[]>({
    queryKey: [`/api/projects/${projectId}/realization/timeline`],
    enabled: !!projectId,
  });

  const { data: finalizedJobsData } = useQuery<FinalizedJobsResponse>({
    queryKey: [`/api/projects/${projectId}/alignment/finalized-jobs`],
    enabled: !!projectId,
  });

  const finalizedJobs = finalizedJobsData?.jobs || [];

  // Collect all selected KPIs
  const allKPIs: Array<{ kpi: JobThemeKPI; jobName: string }> = [];
  finalizedJobs.forEach((job) => {
    const kpiList = job.kpis || [];
    kpiList
      .filter((kpi: JobThemeKPI) => kpi.isSelected && kpi.baselineValue && kpi.targetValue)
      .forEach((kpi: JobThemeKPI) => {
        allKPIs.push({
          kpi,
          jobName: job.jobName,
        });
      });
  });

  // Fetch actuals for all KPIs
  const actualsQuery = useQuery({
    queryKey: [`/api/projects/${projectId}/all-timeline-actuals`],
    queryFn: async () => {
      const results = await Promise.all(
        allKPIs.map(async ({ kpi, jobName }) => {
          const res = await fetch(`/api/job-theme-kpis/${kpi.id}/actuals`);
          if (!res.ok) return { kpi, jobName, actuals: [] };
          const data = await res.json();
          return { kpi, jobName, actuals: data };
        })
      );
      return results;
    },
    enabled: allKPIs.length > 0,
  });

  // Build timeline events from actuals
  const timelineEvents: TimelineEvent[] = [];

  actualsQuery.data?.forEach(({ kpi, jobName, actuals }) => {
    actuals.forEach((actual: KPIActual, index: number) => {
      const eventDate = new Date(actual.actualDate);
      const isLatest = index === 0;
      
      timelineEvents.push({
        id: `measurement-${actual.id}`,
        type: 'measurement',
        date: eventDate,
        kpiId: kpi.id,
        kpiName: kpi.kpiName,
        jobName: jobName.split(';')[0].trim(),
        title: `${kpi.kpiName} Measured`,
        description: actual.notes || `Updated measurement: ${actual.actualValue}${kpi.unit || ''}`,
        value: actual.actualValue,
        unit: kpi.unit,
        status: 'completed',
        icon: CheckCircle2,
        color: isLatest ? 'text-primary bg-primary/10 border-primary' : 'text-green-600 bg-green-100 dark:bg-green-900/20 border-green-200',
      });
    });
  });

  // Add timeline events from API (milestones, reviews, interventions)
  timelineAPIEvents.forEach((event) => {
    const eventDate = new Date(event.date);
    const isPast = eventDate < new Date();
    
    if (event.type === 'milestone') {
      timelineEvents.push({
        id: `milestone-${event.id}`,
        type: 'milestone',
        date: eventDate,
        title: event.title,
        description: event.description,
        status: event.status as any,
        icon: Flag,
        color: isPast 
          ? 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 border-purple-200'
          : 'text-purple-500 bg-purple-50 dark:bg-purple-900/10 border-purple-100',
      });
    } else if (event.type === 'review') {
      timelineEvents.push({
        id: `review-${event.id}`,
        type: 'review',
        date: eventDate,
        title: event.title,
        description: event.description,
        status: event.status as any,
        icon: Users,
        color: isPast 
          ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 border-blue-200'
          : 'text-blue-500 bg-blue-50 dark:bg-blue-900/10 border-blue-100',
      });
    } else if (event.type === 'intervention') {
      timelineEvents.push({
        id: `intervention-${event.id}`,
        type: 'intervention',
        date: eventDate,
        title: event.title,
        description: event.description,
        status: event.status as any,
        icon: Zap,
        color: event.status === 'completed' 
          ? 'text-green-600 bg-green-100 dark:bg-green-900/20 border-green-200'
          : event.status === 'in-progress'
          ? 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 border-orange-200'
          : 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 border-gray-200',
      });
    }
  });

  // Add upcoming actions (next measurement dates based on measurement frequency)
  actualsQuery.data?.forEach(({ kpi, jobName, actuals }) => {
    if (actuals.length > 0) {
      const latestActual = actuals[0];
      const latestDate = new Date(latestActual.actualDate);
      const now = new Date();
      
      // Calculate next measurement date (simplistic - 30 days for monthly, 90 for quarterly)
      let daysUntilNext = 30; // default monthly
      if (kpi.measurementFrequency?.toLowerCase().includes('quarter')) {
        daysUntilNext = 90;
      } else if (kpi.measurementFrequency?.toLowerCase().includes('annual')) {
        daysUntilNext = 365;
      } else if (kpi.measurementFrequency?.toLowerCase().includes('6 month')) {
        daysUntilNext = 180;
      }

      const nextMeasurementDate = new Date(latestDate.getTime() + daysUntilNext * 24 * 60 * 60 * 1000);
      
      if (isAfter(nextMeasurementDate, now)) {
        timelineEvents.push({
          id: `action-${kpi.id}-next`,
          type: 'action',
          date: nextMeasurementDate,
          kpiId: kpi.id,
          kpiName: kpi.kpiName,
          jobName: jobName.split(';')[0].trim(),
          title: `Next Measurement Due: ${kpi.kpiName}`,
          description: kpi.measurementFrequency ? `Frequency: ${kpi.measurementFrequency}` : 'Scheduled measurement',
          status: 'upcoming',
          icon: Calendar,
          color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 border-blue-200',
        });
      } else {
        // Overdue measurement
        timelineEvents.push({
          id: `action-${kpi.id}-overdue`,
          type: 'action',
          date: nextMeasurementDate,
          kpiId: kpi.id,
          kpiName: kpi.kpiName,
          jobName: jobName.split(';')[0].trim(),
          title: `Overdue Measurement: ${kpi.kpiName}`,
          description: `Was due ${format(nextMeasurementDate, 'MMM d, yyyy')}`,
          status: 'overdue',
          icon: AlertCircle,
          color: 'text-red-600 bg-red-100 dark:bg-red-900/20 border-red-200',
        });
      }
    }
  });

  // Sort events by date (most recent first)
  timelineEvents.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Group events by date proximity (within 7 days = same group)
  const groupedEvents: Array<{ dateRange: string; events: TimelineEvent[] }> = [];
  let currentGroup: TimelineEvent[] = [];
  let currentGroupStartDate: Date | null = null;

  timelineEvents.forEach((event) => {
    if (!currentGroupStartDate) {
      currentGroupStartDate = event.date;
      currentGroup = [event];
    } else {
      const daysDiff = Math.abs((currentGroupStartDate.getTime() - event.date.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 7) {
        currentGroup.push(event);
      } else {
        groupedEvents.push({
          dateRange: format(currentGroupStartDate, 'MMM d, yyyy'),
          events: currentGroup,
        });
        currentGroupStartDate = event.date;
        currentGroup = [event];
      }
    }
  });

  if (currentGroup.length > 0 && currentGroupStartDate) {
    groupedEvents.push({
      dateRange: format(currentGroupStartDate, 'MMM d, yyyy'),
      events: currentGroup,
    });
  }

  if (actualsQuery.isLoading || timelineLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Timeline...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <Clock className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="container-momentum-timeline">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Momentum Timeline
              </CardTitle>
              <CardDescription>
                Measurement history, milestones, and upcoming actions
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              {timelineEvents.length} Events
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {timelineEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                No timeline events yet
              </p>
              <p className="text-sm text-muted-foreground">
                Record KPI measurements to start building your value realization timeline
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {groupedEvents.map((group, groupIndex) => (
                <div key={groupIndex} className="relative">
                  {/* Date Label */}
                  <div className="sticky top-0 z-10 mb-4 -mx-6 px-6 py-2 bg-muted/50 backdrop-blur-sm border-y">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold text-sm">{group.dateRange}</span>
                      <Badge variant="outline" className="ml-2">
                        {group.events.length} {group.events.length === 1 ? 'event' : 'events'}
                      </Badge>
                    </div>
                  </div>

                  {/* Timeline Events */}
                  <div className="space-y-4 relative">
                    {/* Vertical line */}
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

                    {group.events.map((event) => {
                      const Icon = event.icon;
                      const isToday_ = isToday(event.date);
                      
                      return (
                        <div 
                          key={event.id} 
                          className="relative pl-14"
                          data-testid={`timeline-event-${event.id}`}
                        >
                          {/* Icon */}
                          <div 
                            className={`absolute left-0 w-10 h-10 rounded-full border-2 flex items-center justify-center ${event.color}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>

                          {/* Content Card */}
                          <Card className={`${isToday_ ? 'border-primary shadow-md' : ''}`}>
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-sm font-medium flex items-center gap-2 flex-wrap">
                                    {event.title}
                                    {isToday_ && (
                                      <Badge className="bg-primary text-primary-foreground">Today</Badge>
                                    )}
                                    {event.status === 'overdue' && (
                                      <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200">
                                        Overdue
                                      </Badge>
                                    )}
                                  </CardTitle>
                                  <CardDescription className="text-xs mt-1">
                                    {event.description}
                                  </CardDescription>
                                </div>
                                {event.value && (
                                  <div className="text-right shrink-0">
                                    <div className="text-xl font-bold font-mono text-primary">
                                      {event.value}{event.unit}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardHeader>
                            {event.jobName && (
                              <CardContent className="pt-0">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Badge variant="outline" className="text-xs">
                                    {event.jobName}
                                  </Badge>
                                  {event.kpiName && (
                                    <span className="truncate">{event.kpiName}</span>
                                  )}
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Call to Action for No Data */}
          {timelineEvents.filter(e => e.type === 'measurement').length === 0 && (
            <div className="mt-8 p-6 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 shrink-0">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Start Tracking Value Realization</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Begin recording actual measurements for your KPIs to build a comprehensive timeline of value delivery
                  </p>
                  <Button size="sm" data-testid="button-record-first-measurement">
                    <Plus className="w-4 h-4 mr-2" />
                    Record First Measurement
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
