import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  Circle,
  ArrowRight,
  Sparkles,
  FileText,
  BarChart3,
  BookOpen,
  AlertCircle,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";

type LifecyclePhase = "discovery" | "alignment" | "realisation";

interface PhaseArtifactStatus {
  successFrame: { complete: boolean; locked: boolean; kpiCount: number };
  behaviouralLog: { complete: boolean; conditionCount: number; observationCount: number };
  kpiMovement: { complete: boolean; movementCount: number; hasProgress: boolean };
  narrativeSpine: { complete: boolean; hasSummary: boolean; version: number };
}

interface LifecyclePhaseGuidanceProps {
  projectId: number;
  packId: number;
  currentPhase: LifecyclePhase;
  onPhaseTransition?: (newPhase: LifecyclePhase) => void;
}

const phaseConfig = {
  discovery: {
    label: "Discovery",
    icon: Search,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    description: "Identify sponsor outcomes and establish baselines",
    keyArtifacts: ["successFrame"],
    primaryFocus: "Define what success looks like from the sponsor's perspective",
    checklistItems: [
      { id: "identify-sponsor", label: "Identify key sponsor stakeholders", artifact: "successFrame" },
      { id: "define-kpis", label: "Define 3-5 sponsor-owned KPIs", artifact: "successFrame" },
      { id: "establish-baselines", label: "Establish baseline measurements", artifact: "successFrame" },
      { id: "set-targets", label: "Set realistic target values", artifact: "successFrame" },
    ],
    transitionCriteria: [
      "At least 3 KPIs defined",
      "All KPI baselines locked",
      "Sponsor alignment confirmed"
    ]
  },
  alignment: {
    label: "Alignment",
    icon: Target,
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    description: "Lock hypotheses and confirm measurement approach",
    keyArtifacts: ["successFrame", "behaviouralLog"],
    primaryFocus: "Define the lever→behaviour→outcome hypotheses",
    checklistItems: [
      { id: "lock-baselines", label: "Lock all KPI baselines", artifact: "successFrame" },
      { id: "define-behaviours", label: "Define behavioural conditions (max 5)", artifact: "behaviouralLog" },
      { id: "link-kpis", label: "Link behaviours to KPIs", artifact: "behaviouralLog" },
      { id: "confirm-approach", label: "Confirm measurement approach with sponsor", artifact: "successFrame" },
    ],
    transitionCriteria: [
      "All baselines locked",
      "At least 2 behavioural conditions defined",
      "Hypotheses linked to KPIs"
    ]
  },
  realisation: {
    label: "Realization",
    icon: TrendingUp,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    description: "Capture evidence and build the sponsor narrative",
    keyArtifacts: ["behaviouralLog", "kpiMovement", "narrativeSpine"],
    primaryFocus: "Document evidence of change and synthesize the value story",
    checklistItems: [
      { id: "capture-observations", label: "Capture behavioural observations", artifact: "behaviouralLog" },
      { id: "track-movement", label: "Track KPI movements", artifact: "kpiMovement" },
      { id: "update-narrative", label: "Update narrative spine", artifact: "narrativeSpine" },
      { id: "prepare-story", label: "Prepare sponsor-ready story", artifact: "narrativeSpine" },
    ],
    transitionCriteria: [
      "Evidence captured for all conditions",
      "KPI progress documented",
      "Narrative spine complete"
    ]
  }
};

const artifactIcons = {
  successFrame: FileText,
  behaviouralLog: BarChart3,
  kpiMovement: TrendingUp,
  narrativeSpine: BookOpen
};

const artifactLabels = {
  successFrame: "Success Frame",
  behaviouralLog: "Behavioural Log",
  kpiMovement: "KPI Movement",
  narrativeSpine: "Narrative Spine"
};

export function LifecyclePhaseGuidance({
  projectId,
  packId,
  currentPhase,
  onPhaseTransition
}: LifecyclePhaseGuidanceProps) {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  
  const { data: artifacts, isLoading: artifactsLoading } = useQuery<{
    successFrame: any;
    behaviouralLog: any;
    kpiMovement: any;
    narrativeSpine: any;
  }>({
    queryKey: ['/api/evidence-packs', packId, 'artifacts'],
    enabled: !!packId
  });
  
  const { data: guidance, isLoading: guidanceLoading, refetch: refetchGuidance } = useQuery<any[]>({
    queryKey: ['/api/projects', projectId, 'guidance', 'pending'],
    enabled: !!projectId
  });
  
  const triggerInferenceMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/evidence-packs/${packId}/infer`, {
        targetPersona: "seller"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'guidance'] });
    }
  });
  
  const phaseData = phaseConfig[currentPhase];
  const PhaseIcon = phaseData.icon;
  
  const getArtifactStatus = (): PhaseArtifactStatus => {
    return {
      successFrame: {
        complete: !!artifacts?.successFrame?.kpis?.length,
        locked: artifacts?.successFrame?.kpis?.every((k: any) => k.baselineLocked) ?? false,
        kpiCount: artifacts?.successFrame?.kpis?.length ?? 0
      },
      behaviouralLog: {
        complete: !!artifacts?.behaviouralLog?.conditions?.length,
        conditionCount: artifacts?.behaviouralLog?.conditions?.length ?? 0,
        observationCount: artifacts?.behaviouralLog?.conditions?.reduce(
          (sum: number, c: any) => sum + (c.observations?.length ?? 0), 0
        ) ?? 0
      },
      kpiMovement: {
        complete: !!artifacts?.kpiMovement?.movements?.length,
        movementCount: artifacts?.kpiMovement?.movements?.length ?? 0,
        hasProgress: artifacts?.kpiMovement?.movements?.some((m: any) => m.current !== m.baseline) ?? false
      },
      narrativeSpine: {
        complete: !!artifacts?.narrativeSpine?.spine?.agreedSuccess?.summary,
        hasSummary: !!artifacts?.narrativeSpine?.spine?.agreedSuccess?.summary,
        version: artifacts?.narrativeSpine?.version ?? 0
      }
    };
  };
  
  const artifactStatus = getArtifactStatus();
  
  const getPhaseProgress = (): number => {
    const checklistItems = phaseData.checklistItems;
    let completed = 0;
    
    for (const item of checklistItems) {
      if (completedItems.has(item.id)) {
        completed++;
        continue;
      }
      
      if (item.artifact === "successFrame") {
        if (item.id === "define-kpis" && artifactStatus.successFrame.kpiCount >= 3) completed++;
        else if (item.id === "lock-baselines" && artifactStatus.successFrame.locked) completed++;
        else if (item.id === "establish-baselines" && artifactStatus.successFrame.kpiCount > 0) completed++;
      } else if (item.artifact === "behaviouralLog") {
        if (item.id === "define-behaviours" && artifactStatus.behaviouralLog.conditionCount >= 2) completed++;
        else if (item.id === "capture-observations" && artifactStatus.behaviouralLog.observationCount > 0) completed++;
      } else if (item.artifact === "kpiMovement") {
        if (item.id === "track-movement" && artifactStatus.kpiMovement.hasProgress) completed++;
      } else if (item.artifact === "narrativeSpine") {
        if (item.id === "update-narrative" && artifactStatus.narrativeSpine.hasSummary) completed++;
        else if (item.id === "prepare-story" && artifactStatus.narrativeSpine.version > 0) completed++;
      }
    }
    
    return Math.round((completed / checklistItems.length) * 100);
  };
  
  const progress = getPhaseProgress();
  
  const canTransition = (): boolean => {
    switch (currentPhase) {
      case "discovery":
        return artifactStatus.successFrame.kpiCount >= 3 && artifactStatus.successFrame.locked;
      case "alignment":
        return artifactStatus.successFrame.locked && artifactStatus.behaviouralLog.conditionCount >= 2;
      case "realisation":
        return artifactStatus.narrativeSpine.hasSummary;
      default:
        return false;
    }
  };
  
  const getNextPhase = (): LifecyclePhase | null => {
    switch (currentPhase) {
      case "discovery": return "alignment";
      case "alignment": return "realisation";
      default: return null;
    }
  };
  
  if (artifactsLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <Card className={cn("border", phaseData.borderColor)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className={cn("p-2 rounded-lg", phaseData.bgColor)}>
                <PhaseIcon className={cn("h-5 w-5", phaseData.color)} />
              </div>
              <div>
                <CardTitle className="text-base" data-testid="text-phase-title">
                  {phaseData.label} Phase
                </CardTitle>
                <CardDescription>{phaseData.description}</CardDescription>
              </div>
            </div>
            <Badge className={cn(phaseData.bgColor, phaseData.color, "border-0")} data-testid="badge-phase-progress">
              {progress}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Phase Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm font-medium mb-1">
              <Target className="h-4 w-4 text-muted-foreground" />
              Primary Focus
            </div>
            <p className="text-sm text-muted-foreground">{phaseData.primaryFocus}</p>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Phase Checklist</div>
            {phaseData.checklistItems.map((item) => {
              const ArtifactIcon = artifactIcons[item.artifact as keyof typeof artifactIcons];
              const isComplete = completedItems.has(item.id) || (
                (item.artifact === "successFrame" && item.id === "define-kpis" && artifactStatus.successFrame.kpiCount >= 3) ||
                (item.artifact === "successFrame" && item.id === "lock-baselines" && artifactStatus.successFrame.locked) ||
                (item.artifact === "behaviouralLog" && item.id === "define-behaviours" && artifactStatus.behaviouralLog.conditionCount >= 2) ||
                (item.artifact === "kpiMovement" && item.id === "track-movement" && artifactStatus.kpiMovement.hasProgress) ||
                (item.artifact === "narrativeSpine" && item.id === "update-narrative" && artifactStatus.narrativeSpine.hasSummary)
              );
              
              return (
                <div 
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg hover-elevate",
                    isComplete ? "bg-emerald-50/50 dark:bg-emerald-900/10" : "bg-muted/30"
                  )}
                  data-testid={`checklist-item-${item.id}`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className={cn("text-sm flex-1", isComplete && "text-muted-foreground")}>
                    {item.label}
                  </span>
                  <Badge variant="outline" className="text-xs gap-1">
                    <ArtifactIcon className="h-3 w-3" />
                    {artifactLabels[item.artifact as keyof typeof artifactLabels]}
                  </Badge>
                </div>
              );
            })}
          </div>
          
          {canTransition() && getNextPhase() && (
            <div className="pt-2 border-t">
              <Button 
                className="w-full"
                onClick={() => onPhaseTransition?.(getNextPhase()!)}
                data-testid="button-advance-phase"
              >
                Advance to {phaseConfig[getNextPhase()!].label} Phase
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              AI-Powered Guidance
            </CardTitle>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => triggerInferenceMutation.mutate()}
              disabled={triggerInferenceMutation.isPending}
              data-testid="button-refresh-guidance"
            >
              <RefreshCw className={cn("h-4 w-4 mr-1", triggerInferenceMutation.isPending && "animate-spin")} />
              Refresh
            </Button>
          </div>
          <CardDescription>
            Phase-appropriate recommendations based on your evidence pack
          </CardDescription>
        </CardHeader>
        <CardContent>
          {guidanceLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : guidance && guidance.length > 0 ? (
            <div className="space-y-2">
              {guidance.slice(0, 3).map((event: any) => (
                <div 
                  key={event.id}
                  className="p-3 rounded-lg border bg-muted/30 hover-elevate"
                  data-testid={`guidance-item-${event.id}`}
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className={cn(
                      "h-4 w-4 mt-0.5 shrink-0",
                      event.priority === "high" ? "text-red-500" :
                      event.priority === "medium" ? "text-amber-500" : "text-blue-500"
                    )} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{event.message}</p>
                      {event.suggestedActions?.[0] && (
                        <button 
                          className="flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          data-testid={`button-guidance-action-${event.id}`}
                        >
                          {event.suggestedActions[0].action}
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No guidance available yet</p>
              <p className="text-xs mt-1">Click Refresh to generate AI recommendations</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Key Artifacts for This Phase</CardTitle>
          <CardDescription>
            Focus on these artifacts during {phaseData.label.toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(artifactStatus).map(([key, status]) => {
              const isKeyArtifact = phaseData.keyArtifacts.includes(key);
              const Icon = artifactIcons[key as keyof typeof artifactIcons];
              const label = artifactLabels[key as keyof typeof artifactLabels];
              
              return (
                <div 
                  key={key}
                  className={cn(
                    "p-3 rounded-lg border",
                    isKeyArtifact ? "border-primary/30 bg-primary/5" : "bg-muted/30",
                    status.complete && "border-emerald-300 dark:border-emerald-700"
                  )}
                  data-testid={`artifact-status-${key}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={cn(
                      "h-4 w-4",
                      status.complete ? "text-emerald-500" : "text-muted-foreground"
                    )} />
                    <span className="text-sm font-medium">{label}</span>
                    {isKeyArtifact && (
                      <Badge variant="secondary" className="text-xs ml-auto">Focus</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {key === "successFrame" && (
                      <span>{status.kpiCount} KPIs {status.locked ? "(locked)" : ""}</span>
                    )}
                    {key === "behaviouralLog" && (
                      <span>{status.conditionCount} conditions, {status.observationCount} observations</span>
                    )}
                    {key === "kpiMovement" && (
                      <span>{status.movementCount} tracked {status.hasProgress ? "(with progress)" : ""}</span>
                    )}
                    {key === "narrativeSpine" && (
                      <span>v{status.version} {status.hasSummary ? "(has summary)" : ""}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
