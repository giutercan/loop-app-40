import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Focus,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  Users,
  FileText,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AIGuidanceEvent {
  id: number;
  projectId: number;
  eventType: string;
  targetPersona: string;
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  description: string | null;
  suggestedAction: string | null;
  relatedArtifact: string | null;
  relatedArtifactId: number | null;
  status: string;
  createdAt: string;
}

interface SellerDashboardProps {
  projectId: number;
  projectName?: string;
  currentPhase?: "discovery" | "alignment" | "realization";
  packId?: number;
  onNavigateToArtifact?: (artifactType: string, artifactId?: number) => void;
}

const priorityColors = {
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300",
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300",
};

const priorityLabels = {
  critical: "Critical",
  high: "High Priority",
  medium: "Medium",
  low: "Low Priority",
};

interface WhatMattersItem {
  id: string;
  title: string;
  description: string;
  type: "kpi" | "milestone" | "relationship" | "meeting";
  urgency: "immediate" | "soon" | "upcoming";
  linkedArtifact?: string;
}

interface WhatsMissingItem {
  id: string;
  title: string;
  description: string;
  gapType: "evidence" | "confirmation" | "document" | "stakeholder";
  severity: "critical" | "moderate" | "minor";
  suggestedFix: string;
}

interface NextActionItem {
  id: string;
  title: string;
  description: string;
  actionType: "capture" | "confirm" | "update" | "schedule";
  estimatedTime: string;
  expectedOutcome: string;
}

function WhatMattersNow({ projectId, phase }: { projectId: number; phase?: string }) {
  const { data: guidance, isLoading } = useQuery<AIGuidanceEvent[]>({
    queryKey: ["/api/projects", projectId, "guidance", "pending"],
  });
  
  const mattersItems: WhatMattersItem[] = [
    {
      id: "1",
      title: "CRO quarterly review in 5 days",
      description: "Jane Smith (CRO) has a quarterly review meeting where our engagement outcomes may be discussed",
      type: "meeting",
      urgency: "immediate",
      linkedArtifact: "narrative-spine"
    },
    {
      id: "2", 
      title: "Pipeline velocity KPI approaching target",
      description: "Currently at 78% of target - 2% away from milestone. Strong positive momentum.",
      type: "kpi",
      urgency: "immediate",
      linkedArtifact: "kpi-movement"
    },
    {
      id: "3",
      title: "New cohort starting next week",
      description: "12 sales managers entering the coaching program - key behavioural condition observation opportunity",
      type: "milestone",
      urgency: "soon",
      linkedArtifact: "behavioural-log"
    }
  ];
  
  const urgencyIcons = {
    immediate: <AlertTriangle className="h-4 w-4 text-red-500" />,
    soon: <Clock className="h-4 w-4 text-amber-500" />,
    upcoming: <Target className="h-4 w-4 text-blue-500" />
  };
  
  const typeIcons = {
    kpi: <TrendingUp className="h-4 w-4" />,
    milestone: <CheckCircle2 className="h-4 w-4" />,
    relationship: <Users className="h-4 w-4" />,
    meeting: <FileText className="h-4 w-4" />
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Focus className="h-5 w-5 text-blue-500" />
          What Matters Now
        </CardTitle>
        <CardDescription>
          Context-aware priorities for your current phase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {mattersItems.map((item) => (
          <div 
            key={item.id} 
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover-elevate"
            data-testid={`card-matters-item-${item.id}`}
          >
            <div className="mt-0.5">{urgencyIcons[item.urgency]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{item.title}</span>
                <div className="text-muted-foreground">{typeIcons[item.type]}</div>
              </div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
            {item.linkedArtifact && (
              <Button size="icon" variant="ghost" data-testid={`button-view-${item.id}`}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        
        {guidance && guidance.length > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Sparkles className="h-3 w-3" />
              AI-detected priorities
            </div>
            {guidance.slice(0, 2).map((event) => (
              <div 
                key={event.id}
                className="flex items-start gap-3 p-2 rounded-lg border bg-muted/50"
                data-testid={`card-guidance-event-${event.id}`}
              >
                <Badge className={cn("text-xs mt-0.5", priorityColors[event.priority])}>
                  {priorityLabels[event.priority]}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WhatsMissing({ projectId, packId }: { projectId: number; packId?: number }) {
  const missingItems: WhatsMissingItem[] = [
    {
      id: "1",
      title: "Baseline not locked for 'Sales cycle time'",
      description: "KPI added 2 weeks ago but baseline still in exploratory state",
      gapType: "confirmation",
      severity: "moderate",
      suggestedFix: "Confirm baseline with sponsor or mark as 'data pending'"
    },
    {
      id: "2",
      title: "No observed behaviour shift for 'Coaching cadence'",
      description: "Condition has been active for 3 weeks with no observations recorded",
      gapType: "evidence",
      severity: "critical",
      suggestedFix: "Schedule observation session or add field notes from recent coaching"
    },
    {
      id: "3",
      title: "Narrative spine missing executive summary",
      description: "All other sections populated but executive summary is empty",
      gapType: "document",
      severity: "moderate",
      suggestedFix: "Use AI to generate summary from existing content"
    }
  ];
  
  const severityColors = {
    critical: "bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800",
    moderate: "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800",
    minor: "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
  };
  
  const gapIcons = {
    evidence: <FileText className="h-4 w-4 text-orange-500" />,
    confirmation: <CheckCircle2 className="h-4 w-4 text-amber-500" />,
    document: <FileText className="h-4 w-4 text-blue-500" />,
    stakeholder: <Users className="h-4 w-4 text-purple-500" />
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          What's Missing
        </CardTitle>
        <CardDescription>
          AI-detected gaps in your evidence collection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {missingItems.map((item) => (
          <div 
            key={item.id}
            className={cn(
              "p-3 rounded-lg border",
              severityColors[item.severity]
            )}
            data-testid={`card-missing-item-${item.id}`}
          >
            <div className="flex items-start gap-2 mb-2">
              {gapIcons[item.gapType]}
              <div className="flex-1">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 pl-6">
              <Lightbulb className="h-3 w-3 text-emerald-500" />
              <span className="text-xs text-emerald-600 dark:text-emerald-400">{item.suggestedFix}</span>
            </div>
          </div>
        ))}
        
        <div className="text-center pt-2">
          <Button variant="outline" size="sm" data-testid="button-view-all-gaps">
            View All Gaps
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NextBestAction({ projectId, phase }: { projectId: number; phase?: string }) {
  const nextActions: NextActionItem[] = [
    {
      id: "1",
      title: "Record coaching observation from Thursday session",
      description: "Manager coaching session happened 2 days ago - capture observations while fresh",
      actionType: "capture",
      estimatedTime: "5 min",
      expectedOutcome: "Behavioural condition evidence added"
    },
    {
      id: "2",
      title: "Confirm pipeline velocity baseline with Sarah",
      description: "She mentioned having updated numbers - confirm and lock baseline",
      actionType: "confirm",
      estimatedTime: "10 min",
      expectedOutcome: "Success frame KPI locked"
    },
    {
      id: "3",
      title: "Generate narrative excerpt for QBR",
      description: "Use AI to create sponsor-ready summary from current evidence",
      actionType: "update",
      estimatedTime: "3 min",
      expectedOutcome: "QBR-ready narrative excerpt"
    }
  ];
  
  const actionIcons = {
    capture: <FileText className="h-4 w-4 text-blue-500" />,
    confirm: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    update: <TrendingUp className="h-4 w-4 text-purple-500" />,
    schedule: <Clock className="h-4 w-4 text-orange-500" />
  };
  
  const actionColors = {
    capture: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    confirm: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    update: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    schedule: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-emerald-500" />
          Next Best Action
        </CardTitle>
        <CardDescription>
          Recommended actions to strengthen your evidence pack
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {nextActions.map((action, index) => (
          <div 
            key={action.id}
            className={cn(
              "p-3 rounded-lg border hover-elevate",
              index === 0 && "ring-2 ring-primary/20"
            )}
            data-testid={`card-action-item-${action.id}`}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                actionColors[action.actionType]
              )}>
                {actionIcons[action.actionType]}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-medium">{action.title}</p>
                  <Badge variant="secondary" className="text-xs">
                    {action.estimatedTime}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{action.description}</p>
                <div className="flex items-center gap-2 text-xs">
                  <ArrowRight className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {action.expectedOutcome}
                  </span>
                </div>
              </div>
            </div>
            {index === 0 && (
              <div className="mt-3 pt-3 border-t">
                <Button size="sm" className="w-full" data-testid={`button-action-${action.id}`}>
                  Start Now
                </Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function SellerDashboard({ 
  projectId, 
  projectName,
  currentPhase = "discovery",
  packId,
  onNavigateToArtifact 
}: SellerDashboardProps) {
  const phaseLabels = {
    discovery: "Discovery Phase",
    alignment: "Alignment Phase",
    realization: "Realization Phase"
  };
  
  const phaseColors = {
    discovery: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    alignment: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    realization: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2" data-testid="text-seller-guidance-title">
            Seller Guidance
            {projectName && (
              <span className="text-muted-foreground font-normal">- {projectName}</span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your personalized evidence capture guidance
          </p>
        </div>
        <Badge className={cn(phaseColors[currentPhase])} data-testid="badge-current-phase">
          {phaseLabels[currentPhase]}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WhatMattersNow projectId={projectId} phase={currentPhase} />
        <WhatsMissing projectId={projectId} packId={packId} />
        <NextBestAction projectId={projectId} phase={currentPhase} />
      </div>
    </div>
  );
}
