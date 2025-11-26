import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  Circle, 
  ChevronRight,
  Sparkles,
  ArrowRight,
  Lightbulb,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Milestone {
  id: string;
  label: string;
  completed: boolean;
  count?: number;
  target?: number;
  progressText?: string;
}

interface PhaseProgress {
  milestones: Milestone[];
  completedCount: number;
  totalCount: number;
}

interface ProjectProgress {
  discovery: PhaseProgress;
  alignment: PhaseProgress;
  realization: PhaseProgress;
  summary: {
    discoveryComplete: boolean;
    alignmentComplete: boolean;
    realizationComplete: boolean;
    totalKPIs: number;
    totalPillars: number;
    totalValueCases: number;
  };
}

interface PhaseChecklistProps {
  projectId: number;
  currentPhase: "discovery" | "alignment" | "realisation";
}

const milestoneHints: Record<string, { action: string; description: string }> = {
  company_research: { 
    action: "Research company", 
    description: "Use AI to gather insights about the client's organization" 
  },
  strategic_pillars: { 
    action: "Add pillars", 
    description: "Define the strategic priorities driving this engagement" 
  },
  prioritize_jobs: { 
    action: "Prioritize jobs", 
    description: "Rank the most important jobs to focus on" 
  },
  select_kpis: { 
    action: "Select KPIs", 
    description: "Choose metrics to track for each priority" 
  },
  set_baselines: { 
    action: "Set baselines", 
    description: "Enter current values for each selected KPI" 
  },
  define_targets: { 
    action: "Define targets", 
    description: "Set target values to measure improvement" 
  },
  build_value_case: { 
    action: "Build value case", 
    description: "Create a business case with financial projections" 
  },
  track_progress: { 
    action: "Track progress", 
    description: "Record actual KPI values to measure results" 
  },
};

type PhaseKey = "discovery" | "alignment" | "realization";

const phaseConfig: Record<PhaseKey, { label: string; path: (id: number) => string; tabHints: Record<string, string> }> = {
  discovery: {
    label: "Discovery",
    path: (id: number) => `/projects/${id}/discovery`,
    tabHints: {
      company_research: "organisation",
      strategic_pillars: "pillars",
      prioritize_jobs: "jobs",
      select_kpis: "jobs",
    },
  },
  alignment: {
    label: "Alignment",
    path: (id: number) => `/projects/${id}/alignment`,
    tabHints: {
      set_baselines: "kpis",
      define_targets: "kpis",
      build_value_case: "value-cases",
    },
  },
  realization: {
    label: "Realization",
    path: (id: number) => `/projects/${id}/realisation`,
    tabHints: {
      track_progress: "tracking",
    },
  },
};

function normalizePhase(phase: string): PhaseKey {
  if (phase === "realisation") return "realization";
  return phase as PhaseKey;
}

function getNextIncompleteItem(progress: ProjectProgress): { 
  milestone: Milestone; 
  phase: "discovery" | "alignment" | "realization";
  hint: { action: string; description: string };
} | null {
  // Check Discovery first
  for (const milestone of progress.discovery.milestones) {
    if (!milestone.completed) {
      return { 
        milestone, 
        phase: "discovery",
        hint: milestoneHints[milestone.id] || { action: "Complete", description: milestone.label }
      };
    }
  }
  // Then Alignment
  for (const milestone of progress.alignment.milestones) {
    if (!milestone.completed) {
      return { 
        milestone, 
        phase: "alignment",
        hint: milestoneHints[milestone.id] || { action: "Complete", description: milestone.label }
      };
    }
  }
  // Finally Realization
  for (const milestone of progress.realization.milestones) {
    if (!milestone.completed) {
      return { 
        milestone, 
        phase: "realization",
        hint: milestoneHints[milestone.id] || { action: "Complete", description: milestone.label }
      };
    }
  }
  return null;
}

function NextStepPrompt({ 
  nextItem,
  projectId,
}: { 
  nextItem: { milestone: Milestone; phase: "discovery" | "alignment" | "realization"; hint: { action: string; description: string } };
  projectId: number;
}) {
  const phaseKey = nextItem.phase === "realization" ? "realization" : nextItem.phase;
  const config = phaseConfig[phaseKey];
  const path = config.path(projectId);

  return (
    <div className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20" data-testid="next-step-prompt">
      <div className="flex items-start gap-2">
        <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <p className="text-xs font-medium text-primary">Next Step</p>
            <p className="text-sm font-medium">{nextItem.hint.action}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{nextItem.hint.description}</p>
          </div>
          <Link href={path}>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
              Go to {config.label}
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function MilestoneItem({ 
  milestone, 
  projectId, 
  phase,
  index = 0
}: { 
  milestone: Milestone; 
  projectId: number; 
  phase: PhaseKey;
  index?: number;
}) {
  const config = phaseConfig[phase];

  return (
    <motion.div 
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className={`flex items-start gap-2 py-1.5 text-sm ${
        milestone.completed ? "text-muted-foreground" : "text-foreground"
      }`}
      data-testid={`milestone-${milestone.id}`}
    >
      {milestone.completed ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        </motion.div>
      ) : (
        <Circle className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-0.5" />
      )}
      <div className="flex-1 min-w-0">
        <span className={milestone.completed ? "line-through" : ""}>
          {milestone.label}
        </span>
        {milestone.progressText && !milestone.completed && (
          <span className="ml-1.5 text-xs text-muted-foreground">
            ({milestone.progressText})
          </span>
        )}
        {milestone.count !== undefined && milestone.completed && (
          <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0">
            {milestone.count}
          </Badge>
        )}
      </div>
    </motion.div>
  );
}

function PhaseSection({
  phase,
  progress,
  projectId,
  isCurrentPhase,
  isExpanded,
}: {
  phase: PhaseKey;
  progress: PhaseProgress;
  projectId: number;
  isCurrentPhase: boolean;
  isExpanded: boolean;
}) {
  const config = phaseConfig[phase];
  const isComplete = progress.completedCount === progress.totalCount;

  return (
    <Collapsible defaultOpen={isExpanded}>
      <CollapsibleTrigger className="w-full group">
        <div className="flex items-center justify-between py-2 hover-elevate rounded-md px-2 -mx-2">
          <div className="flex items-center gap-2">
            {isComplete ? (
              <CheckCircle2 className="w-4 h-4 text-primary" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                <span className="text-[10px] font-medium text-muted-foreground">
                  {progress.completedCount}
                </span>
              </div>
            )}
            <span className={`text-sm font-medium ${isCurrentPhase ? "text-primary" : ""}`}>
              {config.label}
            </span>
            {isCurrentPhase && (
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                Current
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {progress.completedCount}/{progress.totalCount}
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pl-6 pb-2 space-y-0.5">
          {progress.milestones.map((milestone, idx) => (
            <MilestoneItem
              key={milestone.id}
              milestone={milestone}
              projectId={projectId}
              phase={phase}
              index={idx}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function PhaseChecklist({ projectId, currentPhase }: PhaseChecklistProps) {
  const { data: progress, isLoading } = useQuery<ProjectProgress>({
    queryKey: [`/api/projects/${projectId}/progress`],
    enabled: projectId > 0,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3 p-2">
        <Skeleton className="h-4 w-24" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    );
  }

  if (!progress) {
    return null;
  }

  const totalCompleted = 
    progress.discovery.completedCount + 
    progress.alignment.completedCount + 
    progress.realization.completedCount;
  const totalMilestones = 
    progress.discovery.totalCount + 
    progress.alignment.totalCount + 
    progress.realization.totalCount;
  const overallProgress = totalMilestones > 0 
    ? Math.round((totalCompleted / totalMilestones) * 100) 
    : 0;

  const normalizedPhase = normalizePhase(currentPhase);
  const nextItem = getNextIncompleteItem(progress);

  return (
    <div className="space-y-4" data-testid="phase-checklist">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium">Progress</span>
          </div>
          <span className="text-muted-foreground">{overallProgress}% complete</span>
        </div>
        <Progress value={overallProgress} className="h-1.5" />
      </div>

      {nextItem && (
        <NextStepPrompt nextItem={nextItem} projectId={projectId} />
      )}

      <div className="space-y-1">
        <PhaseSection
          phase="discovery"
          progress={progress.discovery}
          projectId={projectId}
          isCurrentPhase={normalizedPhase === "discovery"}
          isExpanded={normalizedPhase === "discovery"}
        />
        <PhaseSection
          phase="alignment"
          progress={progress.alignment}
          projectId={projectId}
          isCurrentPhase={normalizedPhase === "alignment"}
          isExpanded={normalizedPhase === "alignment"}
        />
        <PhaseSection
          phase="realization"
          progress={progress.realization}
          projectId={projectId}
          isCurrentPhase={normalizedPhase === "realization"}
          isExpanded={normalizedPhase === "realization"}
        />
      </div>

      {overallProgress === 100 && (
        <div className="flex items-center gap-2 p-2 rounded-md bg-primary/10 text-primary text-xs">
          <CheckCircle2 className="w-4 h-4" />
          <span className="font-medium">All milestones complete!</span>
        </div>
      )}
    </div>
  );
}
