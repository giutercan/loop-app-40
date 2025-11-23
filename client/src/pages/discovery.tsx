import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import OrganisationCard from "@/components/OrganisationCard";
import ValueHypothesisBuilder from "@/components/ValueHypothesisBuilder";
import ProjectSelector from "@/components/ProjectSelector";
import StatusBadge from "@/components/StatusBadge";
import { ArrowLeft, Save, Send, FileText, Plus, Trash2, Sparkles, MessageSquarePlus, Briefcase, ExternalLink, Upload, Mic, X, File, Share2, Copy, Check, Users, Loader2, CheckCircle, Target, TrendingDown, Activity, Award, Building, Calendar } from "lucide-react";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import { Link, useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, CompanyDataPoint, Headline, DiscoveryNotes, DiscoveryQuestion, Attachment, SharedQuestionnaire, QuestionResponse, JobThemeWithKPIs, DiscoveryPhaseTransfer, SuccessStory } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";

// Job Theme Card Component - Displays prioritized job with KPIs and baseline input
interface KPI {
  id: number;
  jobThemeId: number;
  kpiName: string;
  kpiType: "primary" | "supporting";
  unit: string;
  isSelected: boolean;
  baselineValue: string | null;
  baselineSource: string | null;
  benchmarkValue: string | null;
  benchmarkSource: string | null;
  definition: string | null;
  measurementFrequency: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface JobThemeCardProps {
  theme: JobThemeWithKPIs;
  rank: number;
  updateKPIMutation: {
    mutate: (params: { kpiId: number; data: { isSelected?: boolean; baselineValue?: string; baselineSource?: string } }) => void;
    isPending: boolean;
  };
  isFinalized: boolean;
  onDeselect: () => void;
}

function JobThemeCard({ theme, rank, updateKPIMutation, isFinalized, onDeselect }: JobThemeCardProps) {
  const [baselineInputs, setBaselineInputs] = useState<Record<number, { value: string; source: string }>>({});
  
  const handleKPIToggle = (kpi: KPI) => {
    updateKPIMutation.mutate({
      kpiId: kpi.id,
      data: { isSelected: !kpi.isSelected }
    });
  };
  
  const handleBaselineUpdate = (kpi: KPI) => {
    const input = baselineInputs[kpi.id];
    if (input) {
      updateKPIMutation.mutate({
        kpiId: kpi.id,
        data: {
          baselineValue: input.value,
          baselineSource: input.source || "User input"
        }
      });
      // Clear input
      setBaselineInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[kpi.id];
        return newInputs;
      });
    }
  };
  
  return (
    <div className={`border rounded-md p-4 space-y-4 ${isFinalized ? 'bg-muted/30' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-primary text-primary-foreground">Priority #{rank}</Badge>
            {theme.solutionArea && <Badge variant="outline">{theme.solutionArea}</Badge>}
            {isFinalized && <Badge variant="secondary" className="bg-yellow-500 text-white">Locked</Badge>}
          </div>
          <div className="font-semibold text-lg">{theme.jobName}</div>
          <div className="text-sm text-muted-foreground mt-1">{theme.capabilityName}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{theme.evidenceCount} insights</Badge>
          </div>
        </div>
        {!isFinalized && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDeselect}
            data-testid={`button-deselect-${theme.id}`}
          >
            Deselect
          </Button>
        )}
      </div>
      
      {/* KPIs Section */}
      {theme.kpis && theme.kpis.length > 0 && (
        <div className="space-y-3 mt-4 pt-4 border-t">
          <div className="font-medium text-sm">Key Performance Indicators</div>
          {theme.kpis.map((kpi: KPI) => (
            <div key={kpi.id} className="border rounded-md p-3 space-y-3 bg-muted/30">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={kpi.isSelected}
                  onCheckedChange={() => handleKPIToggle(kpi)}
                  disabled={isFinalized}
                  data-testid={`checkbox-kpi-${kpi.id}`}
                />
                <div className="flex-1 space-y-2">
                  <div>
                    <div className="font-medium text-sm">{kpi.kpiName}</div>
                    <div className="text-xs text-muted-foreground">
                      {kpi.kpiType === 'primary' ? 'Primary KPI' : 'Supporting KPI'} • {kpi.unit}
                    </div>
                    {kpi.definition && (
                      <p className="text-xs text-muted-foreground mt-1">{kpi.definition}</p>
                    )}
                  </div>
                  
                  {/* Baseline Data Input - Only show if KPI is selected */}
                  {kpi.isSelected && (
                    <div className="space-y-2 mt-3 p-3 bg-background rounded border">
                      <div className="text-xs font-medium">Baseline Data</div>
                      
                      {/* Show existing baseline or Korn Ferry benchmark */}
                      {kpi.baselineValue ? (
                        <div className="flex items-center justify-between gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-900">
                          <div>
                            <div className="text-sm font-medium text-green-900 dark:text-green-100">{kpi.baselineValue}</div>
                            <div className="text-xs text-green-700 dark:text-green-300">Source: {kpi.baselineSource}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setBaselineInputs({
                                ...baselineInputs,
                                [kpi.id]: { value: kpi.baselineValue, source: kpi.baselineSource }
                              });
                            }}
                            data-testid={`button-edit-baseline-${kpi.id}`}
                          >
                            Edit
                          </Button>
                        </div>
                      ) : kpi.benchmarkValue ? (
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-900">
                          <div className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                            Korn Ferry Benchmark: {kpi.benchmarkValue}
                          </div>
                          <div className="text-xs text-blue-700 dark:text-blue-300">{kpi.benchmarkSource}</div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => {
                              setBaselineInputs({
                                ...baselineInputs,
                                [kpi.id]: { value: kpi.benchmarkValue, source: kpi.benchmarkSource }
                              });
                            }}
                          >
                            Use as Baseline
                          </Button>
                        </div>
                      ) : null}
                      
                      {/* Input form - disabled when finalized */}
                      {!isFinalized && (
                        <div className="flex gap-2 mt-2">
                          <Input
                            placeholder={`Enter ${kpi.kpiName.toLowerCase()}...`}
                            value={baselineInputs[kpi.id]?.value || ''}
                            onChange={(e) => setBaselineInputs({
                              ...baselineInputs,
                              [kpi.id]: { ...baselineInputs[kpi.id], value: e.target.value }
                            })}
                            data-testid={`input-baseline-${kpi.id}`}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleBaselineUpdate(kpi)}
                            disabled={!baselineInputs[kpi.id]?.value}
                            data-testid={`button-save-baseline-${kpi.id}`}
                          >
                            Save
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Realization Tab Components
// ============================================================================

function RealizationBusinessReviewsSection({ projectId }: { projectId: number | undefined }) {
  const { data: reviews = [] } = useQuery<any[]>({
    queryKey: ["/api/projects", projectId, "business-reviews"],
    enabled: !!projectId,
  });

  if (!projectId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Select a project to view business reviews
          </p>
        </CardContent>
      </Card>
    );
  }

  const completedReviews = reviews.filter(r => r.status === "completed");
  const upcomingReviews = reviews.filter(r => r.status === "scheduled");

  return (
    <Card data-testid="card-business-reviews">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Business Reviews
        </CardTitle>
        <CardDescription>
          Track client engagement and sentiment through regular business reviews
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-md p-4">
            <div className="text-sm text-muted-foreground mb-1">Completed</div>
            <div className="text-2xl font-semibold" data-testid="text-completed-reviews-count">{completedReviews.length}</div>
          </div>
          <div className="border rounded-md p-4">
            <div className="text-sm text-muted-foreground mb-1">Upcoming</div>
            <div className="text-2xl font-semibold" data-testid="text-upcoming-reviews-count">{upcomingReviews.length}</div>
          </div>
        </div>
        {reviews.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4" data-testid="text-no-reviews">
            No business reviews scheduled yet. Switch to the full Realization page to create your first review.
          </p>
        )}
        {reviews.length > 0 && (
          <div className="space-y-2">
            {reviews.slice(0, 3).map(review => (
              <div key={review.id} className="border rounded-md p-3 text-sm">
                <div className="font-medium">{review.reviewType} Review</div>
                <div className="text-muted-foreground">
                  {format(new Date(review.reviewDate), 'MMM d, yyyy')} • {review.status}
                </div>
              </div>
            ))}
            {reviews.length > 3 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{reviews.length - 3} more reviews
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RealizationProgressTrackingSection({ projectId }: { projectId: number | undefined }) {
  const { data: finalizedData } = useQuery<{
    finalized: boolean;
    jobs: any[];
    transferredAt: Date;
  }>({
    queryKey: ["/api/projects", projectId, "alignment", "finalized-jobs"],
    enabled: !!projectId,
  });

  if (!projectId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Select a project to view progress tracking
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!finalizedData?.finalized) {
    return (
      <Card data-testid="card-progress-tracking">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-primary" />
            Progress Tracking
          </CardTitle>
          <CardDescription>
            Monitor KPI progress from baseline to target values
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Discovery phase must be finalized before you can track KPI progress. Complete the "Jobs & Priorities" tab first.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalKPIs = finalizedData.jobs.reduce((sum, job) => sum + (job.kpis?.filter((k: any) => k.isSelected).length || 0), 0);
  
  return (
    <Card data-testid="card-progress-tracking">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-primary" />
          Progress Tracking
        </CardTitle>
        <CardDescription>
          Monitor {totalKPIs} KPIs across {finalizedData.jobs.length} prioritized jobs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="border rounded-md p-4">
              <div className="text-sm text-muted-foreground mb-1">Jobs</div>
              <div className="text-2xl font-semibold">{finalizedData.jobs.length}</div>
            </div>
            <div className="border rounded-md p-4">
              <div className="text-sm text-muted-foreground mb-1">Total KPIs</div>
              <div className="text-2xl font-semibold">{totalKPIs}</div>
            </div>
            <div className="border rounded-md p-4">
              <div className="text-sm text-muted-foreground mb-1">Finalized</div>
              <div className="text-2xl font-semibold">
                {format(new Date(finalizedData.transferredAt), 'MMM d')}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {finalizedData.jobs.map(job => {
              const selectedKPIs = job.kpis?.filter((k: any) => k.isSelected) || [];
              return (
                <div key={job.id} className="border rounded-md p-3 text-sm">
                  <div className="font-medium">{job.jobName}</div>
                  <div className="text-muted-foreground">{selectedKPIs.length} KPIs selected</div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Success Stories Tab Component
// ============================================================================

function SuccessStoriesSection({ projectId }: { projectId: number | undefined }) {
  const { data: stories = [] } = useQuery<SuccessStory[]>({
    queryKey: [`/api/projects/${projectId}/success-stories`],
    enabled: !!projectId,
  });

  if (!projectId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Select a project to view success stories
          </p>
        </CardContent>
      </Card>
    );
  }

  if (stories.length === 0) {
    return (
      <Card data-testid="card-success-stories-empty">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Success Stories
          </CardTitle>
          <CardDescription>
            Link relevant Korn Ferry client case studies to strengthen your value proposition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No Success Stories Yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              AI-powered recommendations coming soon. Generate relevant Korn Ferry case studies based on your project's insights and value hypotheses.
            </p>
            <Button disabled data-testid="button-generate-stories">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Recommendations (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="container-success-stories">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Success Stories
          </h2>
          <p className="text-sm text-muted-foreground">
            Korn Ferry case studies relevant to this engagement
          </p>
        </div>
        <Button disabled data-testid="button-generate-more-stories">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate More (Coming Soon)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stories.map((story) => (
          <Card key={story.id} className="hover-elevate" data-testid={`card-story-${story.id}`}>
            <CardHeader>
              <CardTitle className="text-base">{story.title}</CardTitle>
              <CardDescription className="space-y-2">
                {story.industry && (
                  <div className="flex items-center gap-2 text-xs">
                    <Building className="w-3 h-3" />
                    {story.industry}
                  </div>
                )}
                {story.category && (
                  <Badge variant="outline" className="text-xs">
                    {story.category}
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {story.relevanceReason && (
                <p className="text-sm text-muted-foreground">
                  {story.relevanceReason}
                </p>
              )}
              {story.capabilityName && (
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="secondary">{story.capabilityName}</Badge>
                  {story.solutionArea && (
                    <Badge variant="outline">{story.solutionArea}</Badge>
                  )}
                </div>
              )}
              <a
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-primary hover:underline"
                data-testid={`link-story-${story.id}`}
              >
                View Case Study
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Discovery() {
  const [location] = useLocation();
  const { toast } = useToast();
  const urlParams = new URLSearchParams(location.split('?')[1]);
  const projectIdParam = urlParams.get('project');
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(
    projectIdParam ? parseInt(projectIdParam) : undefined
  );

  const { data: project } = useQuery<Project>({
    queryKey: ["/api/projects", selectedProjectId],
    enabled: !!selectedProjectId,
  });

  const { data: dataPoints = [] } = useQuery<CompanyDataPoint[]>({
    queryKey: ["/api/projects", selectedProjectId, "data-points"],
    enabled: !!selectedProjectId,
  });

  const { data: headlines = [] } = useQuery<Headline[]>({
    queryKey: ["/api/projects", selectedProjectId, "headlines"],
    enabled: !!selectedProjectId,
  });

  const { data: notes } = useQuery<DiscoveryNotes>({
    queryKey: ["/api/projects", selectedProjectId, "discovery-notes"],
    enabled: !!selectedProjectId,
  });

  const { data: valueHypotheses = [] } = useQuery<any[]>({
    queryKey: ["/api/projects", selectedProjectId, "value-hypotheses"],
    enabled: !!selectedProjectId,
  });

  const { data: discoveryQuestions = [] } = useQuery<DiscoveryQuestion[]>({
    queryKey: ["/api/projects", selectedProjectId, "discovery-questions"],
    enabled: !!selectedProjectId,
  });

  const { data: attachments = [] } = useQuery<Attachment[]>({
    queryKey: ["/api/projects", selectedProjectId, "attachments"],
    enabled: !!selectedProjectId,
  });

  const { data: questionResponses = [] } = useQuery<QuestionResponse[]>({
    queryKey: ["/api/projects", selectedProjectId, "questionnaire-responses"],
    enabled: !!selectedProjectId,
  });

  const { data: sharedQuestionnaire } = useQuery<SharedQuestionnaire | null>({
    queryKey: ["/api/projects", selectedProjectId, "shared-questionnaire"],
    enabled: !!selectedProjectId,
  });

  // Jobs & Priorities queries (must be at top level, not inside TabsContent)
  const { data: jobThemesData, isLoading: jobThemesLoading } = useQuery<JobThemeWithKPIs[]>({
    queryKey: ["/api/projects", selectedProjectId, "job-themes"],
    enabled: !!selectedProjectId,
  });

  const { data: phaseTransfer } = useQuery<DiscoveryPhaseTransfer>({
    queryKey: ["/api/projects", selectedProjectId, "phase-transfer"],
    enabled: !!selectedProjectId,
  });

  // Alignment phase data (finalized jobs with KPIs)
  const { data: finalizedData } = useQuery<{
    finalized: boolean;
    jobs: Array<{
      id: number;
      jobName: string;
      capabilityName: string;
      solutionArea: string | null;
      priorityRank: number | null;
      aggregationSummary: string | null;
      evidenceCount: number;
      kpis: Array<{
        id: number;
        jobThemeId: number;
        kpiName: string;
        kpiType: "primary" | "supporting";
        unit: string;
        isSelected: boolean;
        baselineValue: string | null;
        baselineSource: string | null;
        targetValue: string | null;
        targetSource: string | null;
        benchmarkValue: string | null;
        benchmarkSource: string | null;
        definition: string | null;
        measurementFrequency: string | null;
      }>;
    }>;
    transferredAt: string | null;
  }>({
    queryKey: [`/api/projects/${selectedProjectId}/alignment/finalized-jobs`],
    enabled: !!selectedProjectId,
  });

  const [localNotes, setLocalNotes] = useState({
    freeformNotes: "",
    keyStakeholder: "",
    topChallenges: "",
    timeline: "",
  });

  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [isFollowUpDialogOpen, setIsFollowUpDialogOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [consultantAnswers, setConsultantAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    if (notes) {
      setLocalNotes({
        freeformNotes: notes.freeformNotes || "",
        keyStakeholder: notes.keyStakeholder || "",
        topChallenges: notes.topChallenges || "",
        timeline: notes.timeline || "",
      });
    }
  }, [notes]);

  const saveNotesMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProjectId) return;
      const res = await apiRequest("POST", `/api/projects/${selectedProjectId}/discovery-notes`, localNotes);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "discovery-notes"] });
      toast({
        title: "Notes saved",
        description: "Your discovery notes have been saved successfully.",
      });
    },
  });

  const updateProjectPhaseMutation = useMutation({
    mutationFn: async (phase: string) => {
      if (!selectedProjectId) return;
      const res = await apiRequest("PATCH", `/api/projects/${selectedProjectId}`, { currentPhase: phase });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId] });
    },
  });

  const researchCompanyMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProjectId) return;
      const res = await apiRequest("POST", `/api/projects/${selectedProjectId}/research`, {});
      return await res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "data-points"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "headlines"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "job-themes"] });
      toast({
        title: "Company research complete",
        description: data?.summary || "AI has populated company data and headlines.",
      });
    },
    onError: async (error: any) => {
      let errorMessage = "An error occurred during research.";
      try {
        const errorData = JSON.parse(error.message);
        errorMessage = errorData.details || errorData.error || errorMessage;
      } catch {
        errorMessage = error.message;
      }
      toast({
        title: "Research failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const followUpResearchMutation = useMutation({
    mutationFn: async (question: string) => {
      if (!selectedProjectId) return;
      const res = await apiRequest("POST", `/api/projects/${selectedProjectId}/research/follow-up`, { question });
      return await res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "data-points"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "headlines"] });
      setIsFollowUpDialogOpen(false);
      setFollowUpQuestion("");
      toast({
        title: "Additional research complete",
        description: data?.summary || "New insights have been added.",
      });
    },
    onError: async (error: any) => {
      let errorMessage = "An error occurred during follow-up research.";
      try {
        const errorData = JSON.parse(error.message);
        errorMessage = errorData.details || errorData.error || errorMessage;
      } catch {
        errorMessage = error.message;
      }
      toast({
        title: "Follow-up research failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const updateCapabilityMutation = useMutation({
    mutationFn: async ({ id, relevantCapability }: { id: number; relevantCapability: string | null }) => {
      const res = await apiRequest("PATCH", `/api/data-points/${id}`, { 
        relevantCapability 
      });
      return await res.json();
    },
    onMutate: async ({ id, relevantCapability }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/projects", selectedProjectId, "data-points"] });
      
      // Snapshot the previous value
      const previousDataPoints = queryClient.getQueryData(["/api/projects", selectedProjectId, "data-points"]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(["/api/projects", selectedProjectId, "data-points"], (old: any) => {
        if (!old) return old;
        return old.map((dp: any) => 
          dp.id === id 
            ? { ...dp, relevantCapability }
            : dp
        );
      });
      
      // Return context with the snapshot
      return { previousDataPoints };
    },
    onError: (err, variables, context: any) => {
      // Rollback to the previous value on error
      if (context?.previousDataPoints) {
        queryClient.setQueryData(
          ["/api/projects", selectedProjectId, "data-points"],
          context.previousDataPoints
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we're in sync
      queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", selectedProjectId, "data-points"]
      });
    },
  });

  const updateDataPointSelectionMutation = useMutation({
    mutationFn: async ({ id, selectedForNotes }: { id: number; selectedForNotes: boolean }) => {
      const res = await apiRequest("PATCH", `/api/data-points/${id}`, { 
        selectedForNotes
      });
      return await res.json();
    },
    onMutate: async ({ id, selectedForNotes }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/projects", selectedProjectId, "data-points"] });
      const previousDataPoints = queryClient.getQueryData(["/api/projects", selectedProjectId, "data-points"]);
      queryClient.setQueryData(["/api/projects", selectedProjectId, "data-points"], (old: any) => {
        if (!old) return old;
        return old.map((dp: any) => 
          dp.id === id 
            ? { ...dp, selectedForNotes }
            : dp
        );
      });
      return { previousDataPoints };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousDataPoints) {
        queryClient.setQueryData(
          ["/api/projects", selectedProjectId, "data-points"],
          context.previousDataPoints
        );
      }
      toast({
        title: "Selection failed",
        description: "Failed to update insight selection. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", selectedProjectId, "data-points"]
      });
    },
  });

  const generateDiscoveryQuestionsMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProjectId) return;
      const res = await apiRequest("POST", `/api/projects/${selectedProjectId}/discovery-questions/generate`, {});
      return await res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "discovery-questions"] });
      toast({
        title: "Discovery questions generated",
        description: data?.summary || "AI has generated discovery questions based on your selected insights.",
      });
    },
    onError: async (error: any) => {
      let errorMessage = "An error occurred during question generation.";
      try {
        const errorData = await error.response?.json();
        errorMessage = errorData?.error || errorMessage;
      } catch {}
      toast({
        title: "Generation failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const enrichFromNotesMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProjectId) return;
      const res = await apiRequest("POST", `/api/projects/${selectedProjectId}/enrich-from-notes`, {});
      return await res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "data-points"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "discovery-questions"] });
      toast({
        title: "Insights enriched",
        description: data?.summary || "AI has extracted new insights from your notes and attachments.",
      });
    },
    onError: async (error: any) => {
      let errorMessage = "An error occurred during enrichment.";
      try {
        const errorData = error.response?.json ? await error.response.json() : null;
        errorMessage = errorData?.error || errorMessage;
      } catch {}
      toast({
        title: "Enrichment failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const updateQuestionAnswerMutation = useMutation({
    mutationFn: async ({ id, answer }: { id: number; answer: string }) => {
      const res = await apiRequest("PATCH", `/api/discovery-questions/${id}`, { answer });
      return await res.json();
    },
    onMutate: async ({ id, answer }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/projects", selectedProjectId, "discovery-questions"] });
      const previousQuestions = queryClient.getQueryData(["/api/projects", selectedProjectId, "discovery-questions"]);
      queryClient.setQueryData(["/api/projects", selectedProjectId, "discovery-questions"], (old: any) => {
        if (!old) return old;
        return old.map((q: any) => 
          q.id === id 
            ? { ...q, answer }
            : q
        );
      });
      return { previousQuestions };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousQuestions) {
        queryClient.setQueryData(
          ["/api/projects", selectedProjectId, "discovery-questions"],
          context.previousQuestions
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", selectedProjectId, "discovery-questions"]
      });
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!selectedProjectId) return;

      // Validate file size on frontend
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_FILE_SIZE) {
        throw new Error("File size exceeds maximum limit of 10MB");
      }

      const reader = new FileReader();
      const content = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      const res = await apiRequest("POST", `/api/projects/${selectedProjectId}/attachments`, {
        type: "file",
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        content,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to upload file");
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "attachments"] });
      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    },
  });

  const saveVoiceNoteMutation = useMutation({
    mutationFn: async (transcript: string) => {
      if (!selectedProjectId) return;

      // Validate transcript is not empty
      if (!transcript || transcript.trim().length === 0) {
        throw new Error("Voice transcription cannot be empty");
      }

      const res = await apiRequest("POST", `/api/projects/${selectedProjectId}/attachments`, {
        type: "voice",
        content: transcript.trim(),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save voice note");
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "attachments"] });
      setVoiceTranscript("");
      toast({
        title: "Voice note saved",
        description: "Your voice transcription has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save voice note",
        variant: "destructive",
      });
    },
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/attachments/${id}`, {});
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete attachment");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "attachments"] });
      toast({
        title: "Attachment deleted",
        description: "The attachment has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete attachment",
        variant: "destructive",
      });
    },
  });

  const shareQuestionnaireMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProjectId) return;
      const res = await apiRequest("POST", `/api/projects/${selectedProjectId}/share-questionnaire`, {
        clientName: clientName || null,
        clientEmail: clientEmail || null,
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to share questionnaire");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "shared-questionnaire"] });
      toast({
        title: "Questionnaire shared",
        description: "A shareable link has been generated for your client.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Share failed",
        description: error.message || "Failed to share questionnaire",
        variant: "destructive",
      });
    },
  });

  const submitConsultantResponseMutation = useMutation({
    mutationFn: async ({ questionId, response }: { questionId: number; response: string }) => {
      if (!selectedProjectId) return;
      const res = await apiRequest("POST", `/api/projects/${selectedProjectId}/consultant-response`, {
        questionId,
        response,
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to submit response");
      }
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "questionnaire-responses"] });
      setConsultantAnswers(prev => {
        const newAnswers = { ...prev };
        delete newAnswers[variables.questionId];
        return newAnswers;
      });
      toast({
        title: "Response submitted",
        description: "Your answer has been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit response",
        variant: "destructive",
      });
    },
  });

  // Jobs & Priorities mutations (must be at top level, not inside TabsContent)
  const prioritizeJobsMutation = useMutation({
    mutationFn: async ({ prioritizedIds }: { prioritizedIds: number[] }) => {
      const res = await apiRequest("POST", `/api/projects/${selectedProjectId}/job-themes/prioritize`, {
        prioritizedIds
      });
      if (!res.ok) throw new Error("Failed to prioritize");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "job-themes"] });
      toast({ title: "Priorities updated successfully" });
    },
  });

  const updateKPIMutation = useMutation({
    mutationFn: async ({ kpiId, data }: { kpiId: number; data: { isSelected?: boolean; baselineValue?: string; baselineSource?: string; targetValue?: string; targetSource?: string } }) => {
      const res = await apiRequest("PATCH", `/api/job-theme-kpis/${kpiId}`, data);
      if (!res.ok) throw new Error("Failed to update KPI");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "job-themes"] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/alignment/finalized-jobs`] });
      toast({
        title: "KPI updated",
        description: "KPI has been updated successfully.",
      });
    },
  });

  const finalizeDiscoveryMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/projects/${selectedProjectId}/finalize-discovery`, {});
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to finalize");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "phase-transfer"] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/alignment/finalized-jobs`] });
      toast({
        title: "Discovery phase finalized",
        description: "Your selections have been locked and transferred to Alignment phase.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Finalize failed",
        description: error.message || "Failed to finalize discovery",
        variant: "destructive",
      });
    },
  });

  const handleCapabilityChange = (id: number, capability: string | null) => {
    updateCapabilityMutation.mutate({ 
      id, 
      relevantCapability: capability 
    });
  };

  const handleDataPointSelect = (id: number, selected: boolean) => {
    updateDataPointSelectionMutation.mutate({ 
      id, 
      selectedForNotes: selected
    });
  };

  const handleSaveDraft = () => {
    saveNotesMutation.mutate();
  };

  const handleSendToClient = () => {
    updateProjectPhaseMutation.mutate("alignment");
    toast({
      title: "Sent to client",
      description: "Discovery phase completed. Moving to Alignment phase.",
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFileMutation.mutate(file);
      e.target.value = "";
    }
  };

  const handleStartRecording = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast({
        title: "Not supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    let finalTranscript = "";
    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }
      setVoiceTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      toast({
        title: "Recording error",
        description: event.error,
        variant: "destructive",
      });
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    setIsRecording(true);
    (window as any).currentRecognition = recognition;
  };

  const handleStopRecording = () => {
    if ((window as any).currentRecognition) {
      (window as any).currentRecognition.stop();
      setIsRecording(false);
    }
  };

  const handleSaveVoiceNote = () => {
    const trimmedTranscript = voiceTranscript.trim();
    if (!trimmedTranscript) {
      toast({
        title: "Cannot save",
        description: "Voice transcription is empty. Please record something first.",
        variant: "destructive",
      });
      return;
    }
    saveVoiceNoteMutation.mutate(trimmedTranscript);
  };

  const handleCopyLink = () => {
    if (!sharedQuestionnaire) return;
    const shareUrl = `${window.location.origin}/questionnaire/${sharedQuestionnaire.shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
    toast({
      title: "Link copied!",
      description: "Share this link with your client.",
    });
  };

  const handleShareQuestionnaire = () => {
    shareQuestionnaireMutation.mutate();
  };

  if (!selectedProjectId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to Korn Ferry Value Lifecycle</CardTitle>
            <CardDescription>
              Select an existing project or create a new one to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectSelector
              currentProjectId={selectedProjectId}
              onProjectChange={(p) => setSelectedProjectId(p.id)}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" data-testid="button-back">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">Phase 1: Discovery</h1>
                  <StatusBadge status="draft" />
                </div>
                <p className="text-sm text-muted-foreground">{project?.companyName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ProjectSelector
                currentProjectId={selectedProjectId}
                onProjectChange={(p) => setSelectedProjectId(p.id)}
              />
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={saveNotesMutation.isPending}
                data-testid="button-save-draft"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveNotesMutation.isPending ? "Saving..." : "Save Draft"}
              </Button>
              <Button onClick={handleSendToClient} data-testid="button-send-to-client">
                <Send className="w-4 h-4 mr-2" />
                Send to Client
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 lg:px-8 py-8">
        <Tabs defaultValue="organisation" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 max-w-6xl" data-testid="tabs-discovery">
            <TabsTrigger value="organisation">Organisation</TabsTrigger>
            <TabsTrigger value="notes">Build Value Case</TabsTrigger>
            <TabsTrigger value="jobs">Jobs & Priorities</TabsTrigger>
            <TabsTrigger value="alignment">Alignment</TabsTrigger>
            <TabsTrigger value="realization" data-testid="tab-realization">Realization</TabsTrigger>
            <TabsTrigger value="successStories" data-testid="tab-success-stories">Success Stories</TabsTrigger>
          </TabsList>

          <TabsContent value="organisation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Company Research</CardTitle>
                <CardDescription>
                  Automatically research and populate company data using AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => researchCompanyMutation.mutate()}
                  disabled={researchCompanyMutation.isPending || !selectedProjectId}
                  data-testid="button-ai-research"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {researchCompanyMutation.isPending ? "Researching..." : "AI Research Company"}
                </Button>
              </CardContent>
            </Card>

            {dataPoints.length > 0 && (
              <>
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquarePlus className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold text-lg">Need More Information?</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Ask the AI for additional insights about {project?.companyName}
                        </p>
                        <Dialog open={isFollowUpDialogOpen} onOpenChange={setIsFollowUpDialogOpen}>
                          <DialogTrigger asChild>
                            <Button data-testid="button-ask-followup">
                              <Sparkles className="w-4 h-4 mr-2" />
                              Ask Follow-up Question
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Ask for Additional Research</DialogTitle>
                              <DialogDescription>
                                What specific information would you like to know about {project?.companyName}?
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="follow-up-question">Your Question</Label>
                                <Textarea
                                  id="follow-up-question"
                                  placeholder="e.g., What are their recent technology investments? What challenges do they face in digital transformation? What are their main competitors doing?"
                                  className="min-h-[120px]"
                                  value={followUpQuestion}
                                  onChange={(e) => setFollowUpQuestion(e.target.value)}
                                  data-testid="textarea-followup-question"
                                />
                              </div>
                              <div className="flex justify-end gap-3">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setIsFollowUpDialogOpen(false);
                                    setFollowUpQuestion("");
                                  }}
                                  data-testid="button-cancel-followup"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => followUpResearchMutation.mutate(followUpQuestion)}
                                  disabled={followUpResearchMutation.isPending || !followUpQuestion.trim()}
                                  data-testid="button-submit-followup"
                                >
                                  <Sparkles className="w-4 h-4 mr-2" />
                                  {followUpResearchMutation.isPending ? "Researching..." : "Get Insights"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <OrganisationCard
                  name={project?.companyName || ""}
                  sector={project?.sector || ""}
                  dataPoints={dataPoints.map(dp => ({
                    id: dp.id,
                    label: dp.label,
                    value: dp.value,
                    confidence: dp.confidence as "high" | "medium" | "low",
                    source: dp.source || undefined,
                    isFollowUp: Boolean(dp.provenance && typeof dp.provenance === 'object' && 'type' in dp.provenance && dp.provenance.type === 'ai_follow_up'),
                    selectedForNotes: dp.selectedForNotes,
                    relevantJob: dp.relevantJob || undefined,
                    relevantCapability: dp.relevantCapability || null,
                    priorityScore: dp.priorityScore,
                    kornFerryPillar: dp.kornFerryPillar || undefined,
                    solutionArea: dp.solutionArea || undefined,
                    relatedKPIs: (dp.relatedKPIs as string[] | null) || undefined,
                  }))}
                  headlines={headlines.map(h => ({
                    title: h.title,
                    date: h.date,
                    source: h.source,
                    url: h.url,
                    isFollowUp: h.source === "AI Follow-up",
                  }))}
                  onCapabilityChange={handleCapabilityChange}
                  onDataPointSelect={handleDataPointSelect}
                />
              </>
            )}

            {dataPoints.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>
                    Add data points about {project?.companyName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    No data points yet. Use AI research or add manually.
                  </p>
                  <Button data-testid="button-add-data-point">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Data Point
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            {/* Step 1: Capture Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <CardTitle>Capture Client Information</CardTitle>
                    <CardDescription>Write notes, upload files, or record voice memos from client conversations</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="freeform">Notes</Label>
                  <Textarea
                    id="freeform"
                    placeholder="Type or paste notes from meetings, conversations, or research... (e.g., 'Client has 50-75 sales reps, wants 40% revenue increase, current employee satisfaction at 65%')"
                    className="min-h-[120px] resize-none"
                    value={localNotes.freeformNotes}
                    onChange={(e) => setLocalNotes({ ...localNotes, freeformNotes: e.target.value })}
                    data-testid="textarea-notes"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground">OR</span>
                  <Separator className="flex-1" />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    data-testid="input-file-upload"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={uploadFileMutation.isPending}
                    data-testid="button-upload-file"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadFileMutation.isPending ? "Uploading..." : "Upload File"}
                  </Button>
                  {!isRecording ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleStartRecording}
                      data-testid="button-start-recording"
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      Record Voice Note
                    </Button>
                  ) : (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleStopRecording}
                      data-testid="button-stop-recording"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Stop Recording
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => saveNotesMutation.mutate()}
                    disabled={saveNotesMutation.isPending}
                    data-testid="button-save-notes"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saveNotesMutation.isPending ? "Saving..." : "Save Notes"}
                  </Button>
                </div>

                {isRecording && voiceTranscript && (
                  <div className="bg-primary/5 border border-primary/20 rounded-md p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4 text-primary animate-pulse" />
                        <span className="text-sm font-medium">Recording in progress...</span>
                      </div>
                      <Button 
                        size="sm"
                        onClick={handleSaveVoiceNote}
                        disabled={saveVoiceNoteMutation.isPending}
                        data-testid="button-save-voice-note"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {saveVoiceNoteMutation.isPending ? "Saving..." : "Save Voice Note"}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{voiceTranscript}</p>
                  </div>
                )}

                {attachments.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <Label className="text-xs text-muted-foreground">Attachments ({attachments.length})</Label>
                    <div className="space-y-2">
                      {attachments.map((attachment) => (
                        <div 
                          key={attachment.id} 
                          className="flex items-start justify-between gap-3 bg-muted/30 rounded-md p-2"
                          data-testid={`attachment-${attachment.id}`}
                        >
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            {attachment.type === "file" ? (
                              <File className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                            ) : (
                              <Mic className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              {attachment.type === "file" ? (
                                <>
                                  <p className="text-sm font-medium truncate">{attachment.fileName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {attachment.fileSize && `${(attachment.fileSize / 1024).toFixed(1)} KB`}
                                  </p>
                                </>
                              ) : (
                                <p className="text-sm line-clamp-2">{attachment.content}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAttachmentMutation.mutate(attachment.id)}
                            disabled={deleteAttachmentMutation.isPending}
                            data-testid={`button-delete-attachment-${attachment.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Extract Insights */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Extract Strategic Insights
                    </CardTitle>
                    <CardDescription>
                      AI analyzes your notes and files to identify metrics, challenges, and opportunities
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => enrichFromNotesMutation.mutate()}
                    disabled={enrichFromNotesMutation.isPending || (!notes?.freeformNotes && attachments.length === 0)}
                    data-testid="button-enrich-from-notes"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {enrichFromNotesMutation.isPending ? "Analyzing..." : "Extract Insights"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Click "Extract Insights" to have AI analyze your notes and files. Enriched insights will appear highlighted in Step 3 below, combined with any insights you selected from the Organization tab.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>Supported for AI analysis:</strong> Text files (.txt, .csv, .json) and voice notes
                </p>
              </CardContent>
            </Card>

            {/* Step 3: Combined Evidence */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <CardTitle>Evidence & Enriched Insights</CardTitle>
                    <CardDescription>
                      {(() => {
                        const selectedCount = dataPoints.filter(dp => dp.selectedForNotes).length;
                        const enrichedCount = dataPoints.filter(dp => (dp.provenance as any)?.type === 'notes_enrichment').length;
                        const total = selectedCount + enrichedCount;
                        
                        if (total === 0) {
                          return "Choose insights from the Organization tab to build your value case";
                        }
                        
                        const parts = [];
                        if (selectedCount > 0) parts.push(`${selectedCount} selected`);
                        if (enrichedCount > 0) parts.push(`${enrichedCount} enriched`);
                        return parts.join(' + ');
                      })()}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              {(() => {
                const combinedPoints = dataPoints.filter(dp => 
                  dp.selectedForNotes || (dp.provenance as any)?.type === 'notes_enrichment'
                );
                
                if (combinedPoints.length === 0) {
                  return (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Go to the <strong>Organization tab</strong> and check the boxes next to insights you want to include as evidence. 
                        You can also extract insights from your notes above using the "Extract Insights" button.
                      </p>
                    </CardContent>
                  );
                }
                
                return (
                  <CardContent className="space-y-6">
                    {[
                        'Success Profiles & Role Design',
                        'Standardised Assessments & Assessments at Scale',
                        'Leadership & Development Journeys',
                        'AI-Ready Leader (within L&D)',
                        'Organisation Strategy & Transformation',
                        'Total Rewards Optimisation (TRO)',
                        'Sales & Service (KF Sell)',
                        'People Analytics / KFI Analytics',
                        'Value Management / Client Success & Talent Suite',
                        null
                      ].map(capabilityKey => {
                        const capabilityPoints = combinedPoints.filter(dp => 
                          capabilityKey === null ? !dp.relevantCapability : dp.relevantCapability === capabilityKey
                        );
                        if (capabilityPoints.length === 0) return null;

                        const capabilityLabel = capabilityKey || 'Not Identified';

                        return (
                          <div key={capabilityKey || 'not-identified'} className="space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b">
                              <Briefcase className="w-4 h-4 text-primary" />
                              <h3 className="font-semibold text-sm">{capabilityLabel}</h3>
                              <Badge variant="secondary" className="text-xs">{capabilityPoints.length}</Badge>
                            </div>
                            <div className="space-y-2 pl-6">
                              {capabilityPoints.map((point, idx) => {
                                const isEnriched = (point.provenance as any)?.type === 'notes_enrichment';
                                
                                return (
                                  <div 
                                    key={point.id} 
                                    className={`rounded-md p-3 space-y-1.5 ${
                                      isEnriched 
                                        ? 'bg-primary/10 border-2 border-primary/30' 
                                        : 'bg-muted/30'
                                    }`}
                                    data-testid={`selected-point-${point.id}`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-xs font-medium text-muted-foreground">{point.label}</p>
                                        {isEnriched && (
                                          <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0">
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            New from enrichment
                                          </Badge>
                                        )}
                                      </div>
                                      <ConfidenceBadge level={point.confidence as "high" | "medium" | "low"} />
                                    </div>
                                    <p className="text-sm leading-relaxed">{point.value}</p>
                                    {point.source && (
                                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <ExternalLink className="w-3 h-3" />
                                        {point.source}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                  </CardContent>
                );
              })()}
            </Card>

            {/* Step 4: Discovery Questions - Only show if any evidence exists */}
            {dataPoints.filter(dp => dp.selectedForNotes || (dp.provenance as any)?.type === 'notes_enrichment').length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm shrink-0">
                      4
                    </div>
                    <div className="flex-1">
                      <CardTitle>Discovery Questions</CardTitle>
                      <CardDescription>AI-generated questions to investigate insights and capture data for KPI calculations</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={() => generateDiscoveryQuestionsMutation.mutate()}
                        disabled={generateDiscoveryQuestionsMutation.isPending}
                        data-testid="button-generate-questions"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {generateDiscoveryQuestionsMutation.isPending ? "Generating..." : "Generate Questions"}
                      </Button>
                      {discoveryQuestions.length > 0 && (
                        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" data-testid="button-share-with-client">
                              <Share2 className="w-4 h-4 mr-2" />
                              Share with Client
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                Share Questionnaire with Client
                              </DialogTitle>
                              <DialogDescription>
                                Generate a shareable link for your client to answer discovery questions collaboratively.
                              </DialogDescription>
                            </DialogHeader>
                            {!sharedQuestionnaire ? (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="clientName">Client Name (Optional)</Label>
                                  <Input
                                    id="clientName"
                                    placeholder="e.g., John Smith"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    data-testid="input-client-name"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="clientEmail">Client Email (Optional)</Label>
                                  <Input
                                    id="clientEmail"
                                    type="email"
                                    placeholder="e.g., john@company.com"
                                    value={clientEmail}
                                    onChange={(e) => setClientEmail(e.target.value)}
                                    data-testid="input-client-email"
                                  />
                                </div>
                                <Button 
                                  onClick={handleShareQuestionnaire} 
                                  disabled={shareQuestionnaireMutation.isPending}
                                  className="w-full"
                                  data-testid="button-generate-link"
                                >
                                  <Share2 className="w-4 h-4 mr-2" />
                                  {shareQuestionnaireMutation.isPending ? "Generating..." : "Generate Shareable Link"}
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                                  <Input
                                    readOnly
                                    value={`${window.location.origin}/questionnaire/${sharedQuestionnaire.shareToken}`}
                                    className="flex-1 bg-background"
                                    data-testid="input-share-link"
                                  />
                                  <Button onClick={handleCopyLink} size="icon" variant="outline" data-testid="button-copy-link">
                                    {linkCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                  </Button>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-2">
                                  <p>✓ Link generated and ready to share</p>
                                  <p>• Send this link to your client via email or messaging</p>
                                  <p>• They can answer questions without logging in</p>
                                  <p>• You'll see their responses in real-time</p>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </CardHeader>
                  <CardContent>
                    {discoveryQuestions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Click "Generate Questions" to create discovery questions based on your selected insights. 
                        These questions will help you dig deeper during client conversations and capture quantitative metrics for value calculations.
                      </p>
                    ) : (
                      <div className="space-y-6">
                        {[
                          'Success Profiles & Role Design',
                          'Standardised Assessments & Assessments at Scale',
                          'Leadership & Development Journeys',
                          'AI-Ready Leader (within L&D)',
                          'Organisation Strategy & Transformation',
                          'Total Rewards Optimisation (TRO)',
                          'Sales & Service (KF Sell)',
                          'People Analytics / KFI Analytics',
                          'Value Management / Client Success & Talent Suite',
                        ].map(capability => {
                          const capabilityQuestions = discoveryQuestions.filter(q => q.capabilityName === capability);
                          if (capabilityQuestions.length === 0) return null;

                          return (
                            <div key={capability} className="space-y-3">
                              <div className="flex items-center gap-2 pb-2 border-b">
                                <Briefcase className="w-4 h-4 text-primary" />
                                <h3 className="font-semibold text-sm">{capability}</h3>
                                <Badge variant="secondary" className="text-xs">{capabilityQuestions.length} question{capabilityQuestions.length !== 1 ? 's' : ''}</Badge>
                              </div>
                              <div className="space-y-3 pl-6">
                                {capabilityQuestions.map((question) => {
                                  const responses = questionResponses.filter(r => r.questionId === question.id);
                                  const consultantResponse = responses.find(r => r.respondentType === 'consultant');
                                  const clientResponse = responses.find(r => r.respondentType === 'client');

                                  return (
                                    <div 
                                      key={question.id} 
                                      className="bg-muted/30 rounded-md p-3 space-y-2.5"
                                      data-testid={`question-${question.id}`}
                                    >
                                      <div className="flex items-start gap-2">
                                        <p className="text-sm font-medium flex-1">{question.question}</p>
                                        <Badge 
                                          variant={question.questionType === 'quantitative' ? 'default' : question.questionType === 'qualitative' ? 'secondary' : 'outline'}
                                          className="text-xs shrink-0"
                                        >
                                          {question.questionType}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground italic">{question.purpose}</p>
                                      {question.relatedKPI && (
                                        <p className="text-xs text-primary font-medium">
                                          Related KPI: {question.relatedKPI}
                                        </p>
                                      )}

                                      {/* Existing Responses */}
                                      {responses.length > 0 && (
                                        <div className="space-y-2 pt-2">
                                          {clientResponse && (
                                            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-md p-3 space-y-1.5">
                                              <div className="flex items-center gap-2">
                                                <Badge className="bg-blue-600 text-white text-xs">
                                                  <Users className="w-3 h-3 mr-1" />
                                                  Client
                                                </Badge>
                                                {clientResponse.respondentName && (
                                                  <span className="text-xs text-muted-foreground">{clientResponse.respondentName}</span>
                                                )}
                                              </div>
                                              <p className="text-sm text-blue-900 dark:text-blue-100">{clientResponse.answer}</p>
                                            </div>
                                          )}
                                          {consultantResponse && (
                                            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-md p-3 space-y-1.5">
                                              <Badge className="bg-green-600 text-white text-xs">
                                                <Briefcase className="w-3 h-3 mr-1" />
                                                Consultant
                                              </Badge>
                                              <p className="text-sm text-green-900 dark:text-green-100">{consultantResponse.answer}</p>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Consultant Input (if not answered yet) */}
                                      {!consultantResponse && (
                                        <div className="pt-2 space-y-2">
                                          <Label className="text-xs text-muted-foreground">Your Answer (Consultant)</Label>
                                          <Textarea
                                            placeholder="Enter your answer..."
                                            className="min-h-[80px] resize-none text-sm"
                                            value={consultantAnswers[question.id] || ''}
                                            onChange={(e) => setConsultantAnswers({ ...consultantAnswers, [question.id]: e.target.value })}
                                            data-testid={`input-consultant-answer-${question.id}`}
                                          />
                                          <Button
                                            size="sm"
                                            onClick={() => {
                                              const answer = consultantAnswers[question.id]?.trim();
                                              if (!answer) {
                                                toast({
                                                  title: "Empty answer",
                                                  description: "Please provide an answer before submitting.",
                                                  variant: "destructive",
                                                });
                                                return;
                                              }
                                              submitConsultantResponseMutation.mutate({ questionId: question.id, response: answer });
                                            }}
                                            disabled={!consultantAnswers[question.id]?.trim() || submitConsultantResponseMutation.isPending}
                                            data-testid={`button-submit-consultant-${question.id}`}
                                          >
                                            {submitConsultantResponseMutation.isPending ? "Submitting..." : "Submit Answer"}
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 360 Discovery Summary - Consolidated View */}
              {(() => {
                const researchInsights = dataPoints.filter(dp => !(dp.provenance as any)?.type);
                const enrichedInsights = dataPoints.filter(dp => (dp.provenance as any)?.type === 'notes_enrichment');
                const totalQuestions = discoveryQuestions.length;
                
                // Count unique questions answered (deduped across all respondent types)
                const answeredQuestions = questionResponses.length > 0 
                  ? new Set(questionResponses.map(r => r.questionId)).size 
                  : 0;
                  
                // Count responses by respondent type
                const consultantResponses = questionResponses.filter(r => r.respondentType === 'consultant').length;
                const clientResponses = questionResponses.filter(r => r.respondentType === 'client').length;
                
                const hasMultipleSources = (researchInsights.length > 0 ? 1 : 0) +
                                          (enrichedInsights.length > 0 ? 1 : 0) +
                                          (answeredQuestions > 0 ? 1 : 0) >= 2;

                if (!hasMultipleSources) return null;

                // Aggregate by capability
                const capabilitySummary = [
                  'Success Profiles & Role Design',
                  'Standardised Assessments & Assessments at Scale',
                  'Leadership & Development Journeys',
                  'AI-Ready Leader (within L&D)',
                  'Organisation Strategy & Transformation',
                  'Total Rewards Optimisation (TRO)',
                  'Sales & Service (KF Sell)',
                  'People Analytics / KFI Analytics',
                  'Value Management / Client Success & Talent Suite',
                ].map(capability => {
                  const research = researchInsights.filter(dp => dp.relevantCapability === capability).length;
                  const enriched = enrichedInsights.filter(dp => dp.relevantCapability === capability).length;
                  const questions = discoveryQuestions.filter(q => q.capabilityName === capability).length;
                  const answered = discoveryQuestions
                    .filter(q => q.capabilityName === capability)
                    .filter(q => questionResponses.some(r => r.questionId === q.id)).length;
                  
                  const total = research + enriched;
                  if (total === 0 && questions === 0) return null;

                  return { capability, research, enriched, total, questions, answered };
                }).filter(Boolean);

                return (
                  <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg shrink-0">
                          360°
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl">Discovery Insights Summary</CardTitle>
                          <CardDescription>
                            Comprehensive view combining AI research, notes enrichment, and questionnaire responses
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Overall Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <Card className="bg-card/50">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardDescription className="text-xs">Research Insights</CardDescription>
                              <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{researchInsights.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">AI-generated findings</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-card/50">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardDescription className="text-xs">Enriched Insights</CardDescription>
                              <FileText className="w-4 h-4 text-primary" />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{enrichedInsights.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">From notes & files</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-card/50">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardDescription className="text-xs">Questions Answered</CardDescription>
                              <Users className="w-4 h-4 text-primary" />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{answeredQuestions}/{totalQuestions}</div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              {consultantResponses > 0 && (
                                <span className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-green-600"></span>
                                  {consultantResponses} consultant
                                </span>
                              )}
                              {clientResponses > 0 && (
                                <span className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                  {clientResponses} client
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Capability Breakdown */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b">
                          <Briefcase className="w-4 h-4 text-primary" />
                          <h3 className="font-semibold text-sm">Insights by Capability</h3>
                        </div>
                        <div className="space-y-2">
                          {capabilitySummary.map((item: any) => (
                            <div key={item.capability} className="bg-muted/30 rounded-md p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">{item.capability}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {item.total} insight{item.total !== 1 ? 's' : ''}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                {item.research > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    {item.research} research
                                  </span>
                                )}
                                {item.enriched > 0 && (
                                  <span className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {item.enriched} enriched
                                  </span>
                                )}
                                {item.questions > 0 && (
                                  <span className="flex items-center gap-1">
                                    <MessageSquarePlus className="w-3 h-3" />
                                    {item.answered}/{item.questions} answered
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Next Steps */}
                      <div className="bg-primary/10 border border-primary/30 rounded-md p-4 space-y-2">
                        <p className="text-sm font-medium text-primary">✓ Discovery Complete</p>
                        <p className="text-sm text-muted-foreground">
                          You've gathered comprehensive insights from multiple sources. Ready to move to the Alignment phase to map these findings to Korn Ferry Jobs and build value hypotheses.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            {(() => {
              // Use hooks from top level (already declared above)
              const isFinalized = phaseTransfer?.isFinalized || false;

              if (jobThemesLoading) {
                return (
                  <Card>
                    <CardContent className="pt-6 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <p className="text-sm text-muted-foreground">Loading job themes...</p>
                    </CardContent>
                  </Card>
                );
              }

              if (!jobThemesData || jobThemesData.length === 0) {
                return (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground text-center">
                        No job themes found. Complete your discovery research first to see aggregated Jobs We Do.
                      </p>
                    </CardContent>
                  </Card>
                );
              }

              const prioritizedThemes = jobThemesData.filter((t: any) => t.priorityRank !== null).sort((a: any, b: any) => (a.priorityRank || 999) - (b.priorityRank || 999));
              const unprioritizedThemes = jobThemesData.filter((t: any) => t.priorityRank === null);
              const canFinalize = prioritizedThemes.length > 0;

              return (
                <>
                  {/* Header Instructions */}
                  <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg shrink-0">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl">Jobs We Do - Value Build Priorities</CardTitle>
                          <CardDescription>
                            Select your top 3 priority jobs, choose relevant KPIs, and provide baseline data to build your value hypothesis.
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Prioritized Jobs (Top 3) */}
                  {prioritizedThemes.length > 0 && (
                    <Card className="border-primary/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-primary" />
                          Top {prioritizedThemes.length} Priority Job{prioritizedThemes.length !== 1 ? 's' : ''}
                        </CardTitle>
                        <CardDescription>
                          These are your selected priorities for value hypothesis building
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {prioritizedThemes.map((theme: JobThemeWithKPIs, idx: number) => (
                          <JobThemeCard 
                            key={theme.id} 
                            theme={theme} 
                            rank={idx + 1} 
                            updateKPIMutation={updateKPIMutation}
                            isFinalized={isFinalized}
                            onDeselect={() => {
                              if (!isFinalized) {
                                const newPrioritized = prioritizedThemes.filter(t => t.id !== theme.id).map(t => t.id);
                                prioritizeJobsMutation.mutate({ prioritizedIds: newPrioritized });
                              }
                            }}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Available Jobs for Selection */}
                  {unprioritizedThemes.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Available Jobs ({unprioritizedThemes.length})</CardTitle>
                        <CardDescription>
                          {prioritizedThemes.length < 3 
                            ? `Select ${3 - prioritizedThemes.length} more job${3 - prioritizedThemes.length !== 1 ? 's' : ''} to reach your top 3 priorities`
                            : "You've selected 3 priorities. Deselect one above to add a different job."
                          }
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {unprioritizedThemes.map((theme: any) => (
                          <div key={theme.id} className="border rounded-md p-4 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="font-semibold text-lg">{theme.jobName}</div>
                                <div className="text-sm text-muted-foreground mt-1">{theme.capabilityName}</div>
                                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                                  <Badge variant="secondary">{theme.evidenceCount} insights</Badge>
                                  {theme.solutionArea && <Badge variant="outline">{theme.solutionArea}</Badge>}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const newPrioritized = [...prioritizedThemes.map((t: JobThemeWithKPIs) => t.id), theme.id].slice(0, 3);
                                  prioritizeJobsMutation.mutate({ prioritizedIds: newPrioritized });
                                }}
                                disabled={isFinalized || prioritizedThemes.length >= 3 || prioritizeJobsMutation.isPending}
                                data-testid={`button-prioritize-${theme.id}`}
                              >
                                Select as Priority
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Finalize Discovery Button or Locked State */}
                  {canFinalize && (
                    isFinalized ? (
                      <Card className="border-yellow-500/30 bg-yellow-50 dark:bg-yellow-950/20">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-6 h-6 text-yellow-600" />
                            <div>
                              <p className="font-semibold text-yellow-900 dark:text-yellow-100">Discovery Phase Locked</p>
                              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                Your priorities have been finalized and locked. Visit the Alignment page to build value hypotheses.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="border-primary/30 bg-primary/5">
                        <CardContent className="pt-6 flex items-center justify-between">
                          <div>
                            <p className="font-semibold">Ready to Build Value Hypotheses?</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Finalize your discovery phase and move to Alignment to build detailed value cases.
                            </p>
                          </div>
                          <Button
                            size="lg"
                            onClick={() => finalizeDiscoveryMutation.mutate()}
                            disabled={finalizeDiscoveryMutation.isPending}
                            data-testid="button-finalize-discovery"
                          >
                            {finalizeDiscoveryMutation.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Finalizing...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Finalize Discovery
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  )}
                </>
              );
            })()}
          </TabsContent>

          <TabsContent value="alignment" className="space-y-6">
            {/* Finalized Discovery Jobs */}
            {finalizedData && finalizedData.finalized && finalizedData.jobs.length > 0 ? (
              <div className="space-y-4">
                <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg shrink-0">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl">Finalized Discovery Priorities</CardTitle>
                        <CardDescription>
                          Top {finalizedData.jobs.length} jobs from Discovery phase with baseline and target values
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {finalizedData.jobs.map((job, idx) => (
                  <Card key={job.id} className="border-l-4 border-l-primary">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <Badge variant="default" className="text-lg px-3 py-1 shrink-0" data-testid={`badge-job-rank-${idx + 1}`}>
                          #{idx + 1}
                        </Badge>
                        <div className="flex-1">
                          <CardTitle className="text-lg" data-testid={`text-job-name-${job.id}`}>{job.jobName}</CardTitle>
                          <CardDescription className="mt-1">
                            {job.capabilityName} {job.solutionArea && `• ${job.solutionArea}`}
                          </CardDescription>
                          {job.aggregationSummary && (
                            <p className="text-sm text-muted-foreground mt-2">{job.aggregationSummary}</p>
                          )}
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          {job.evidenceCount} insight{job.evidenceCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {job.kpis.filter(kpi => kpi.isSelected).length > 0 ? (
                        job.kpis.filter(kpi => kpi.isSelected).map(kpi => (
                          <div key={kpi.id} className="border rounded-md p-4 space-y-4 bg-card" data-testid={`kpi-card-${kpi.id}`}>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold" data-testid={`text-kpi-name-${kpi.id}`}>{kpi.kpiName}</h4>
                                  <Badge variant={kpi.kpiType === "primary" ? "default" : "secondary"} className="text-xs">
                                    {kpi.kpiType}
                                  </Badge>
                                </div>
                                {kpi.definition && (
                                  <p className="text-sm text-muted-foreground mt-1">{kpi.definition}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">Unit: {kpi.unit}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              {/* Baseline Value */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <TrendingDown className="w-4 h-4 text-orange-600" />
                                  <Label htmlFor={`baseline-${kpi.id}`} className="font-semibold">Baseline (Current)</Label>
                                </div>
                                <Input
                                  id={`baseline-${kpi.id}`}
                                  type="text"
                                  placeholder={kpi.benchmarkValue ? `Benchmark: ${kpi.benchmarkValue}` : "Enter baseline"}
                                  value={kpi.baselineValue || ""}
                                  onChange={(e) => {
                                    updateKPIMutation.mutate({
                                      kpiId: kpi.id,
                                      data: { baselineValue: e.target.value }
                                    });
                                  }}
                                  data-testid={`input-baseline-${kpi.id}`}
                                />
                                <Input
                                  type="text"
                                  placeholder="Source (e.g., HRIS, Client data)"
                                  value={kpi.baselineSource || ""}
                                  onChange={(e) => {
                                    updateKPIMutation.mutate({
                                      kpiId: kpi.id,
                                      data: { baselineSource: e.target.value }
                                    });
                                  }}
                                  className="text-sm"
                                  data-testid={`input-baseline-source-${kpi.id}`}
                                />
                              </div>

                              {/* Target Value */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Target className="w-4 h-4 text-emerald-600" />
                                  <Label htmlFor={`target-${kpi.id}`} className="font-semibold">Target (Outcome)</Label>
                                </div>
                                <Input
                                  id={`target-${kpi.id}`}
                                  type="text"
                                  placeholder="Enter target value"
                                  value={kpi.targetValue || ""}
                                  onChange={(e) => {
                                    updateKPIMutation.mutate({
                                      kpiId: kpi.id,
                                      data: { targetValue: e.target.value }
                                    });
                                  }}
                                  data-testid={`input-target-${kpi.id}`}
                                />
                                <Input
                                  type="text"
                                  placeholder="Source (e.g., Industry best practice)"
                                  value={kpi.targetSource || ""}
                                  onChange={(e) => {
                                    updateKPIMutation.mutate({
                                      kpiId: kpi.id,
                                      data: { targetSource: e.target.value }
                                    });
                                  }}
                                  className="text-sm"
                                  data-testid={`input-target-source-${kpi.id}`}
                                />
                              </div>
                            </div>

                            {/* Benchmark Reference (if available) */}
                            {kpi.benchmarkValue && (
                              <div className="bg-muted/50 rounded-md p-3 text-sm">
                                <p className="font-medium">Korn Ferry Benchmark</p>
                                <p className="text-muted-foreground">
                                  {kpi.benchmarkValue} {kpi.benchmarkSource && `(${kpi.benchmarkSource})`}
                                </p>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No KPIs selected for this job in Discovery phase
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Briefcase className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-center">Finalize Discovery First</CardTitle>
                  <CardDescription className="text-center">
                    Complete the Discovery phase by selecting top-3 jobs and their KPIs in the "Jobs & Priorities" tab, then click "Finalize Discovery" to unlock the Alignment phase.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>

          {/* Realization Tab */}
          <TabsContent value="realization" className="space-y-6">
            {/* Business Reviews Section */}
            <RealizationBusinessReviewsSection projectId={selectedProjectId} />
            
            {/* Progress Tracking Section */}
            <RealizationProgressTrackingSection projectId={selectedProjectId} />
          </TabsContent>

          {/* Success Stories Tab */}
          <TabsContent value="successStories" className="space-y-6">
            <SuccessStoriesSection projectId={selectedProjectId} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
