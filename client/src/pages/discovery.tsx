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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import OrganisationCard from "@/components/OrganisationCard";
import ValueCaseBuilder from "@/components/ValueCaseBuilder";
import ProjectSelector from "@/components/ProjectSelector";
import StatusBadge from "@/components/StatusBadge";
import ProjectPhaseNav from "@/components/project-phase-nav";
import KPIRecommendationDialog from "@/components/KPIRecommendationDialog";
import { ArrowLeft, Save, Send, FileText, Plus, Trash2, Sparkles, MessageSquarePlus, Briefcase, ExternalLink, Upload, Mic, X, File, Share2, Copy, Check, Users, Loader2, CheckCircle, Target, TrendingDown, TrendingUp, Activity, Award, Building, Calendar, AlertCircle, ChevronDown, Lightbulb, BarChart3, MessageSquare } from "lucide-react";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import { Link, useLocation, useRoute } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, CompanyDataPoint, Headline, DiscoveryNotes, DiscoveryQuestion, Attachment, SharedQuestionnaire, QuestionResponse, JobThemeWithKPIs, DiscoveryPhaseTransfer, SuccessStory, JobThemeKPI, UpdateJobThemeKPIRequest } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

// Job Theme Card Component - Displays prioritized job with KPIs and baseline/target input
interface JobThemeCardProps {
  theme: JobThemeWithKPIs;
  rank: number;
  projectId: number;
  updateKPIMutation: {
    mutate: (params: { kpiId: number; data: UpdateJobThemeKPIRequest }) => void;
    isPending: boolean;
  };
  isFinalized: boolean;
  onDeselect: () => void;
}

function JobThemeCard({ theme, rank, projectId, updateKPIMutation, isFinalized, onDeselect }: JobThemeCardProps) {
  const { toast } = useToast();
  const [baselineInputs, setBaselineInputs] = useState<Record<number, { value: string; source: string }>>({});
  const [targetInputs, setTargetInputs] = useState<Record<number, { value: string; source: string }>>({});
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  const handleKPIToggle = (kpi: JobThemeKPI) => {
    updateKPIMutation.mutate({
      kpiId: kpi.id,
      data: { isSelected: !kpi.isSelected }
    });
  };
  
  const handleBaselineUpdate = (kpi: JobThemeKPI) => {
    const input = baselineInputs[kpi.id];
    if (input) {
      // Validate that the value is numeric
      const numericValue = parseFloat(input.value);
      if (isNaN(numericValue)) {
        toast({
          title: "Invalid Input",
          description: "Baseline value must be a valid number",
          variant: "destructive",
        });
        return;
      }
      
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
  
  const handleTargetUpdate = (kpi: JobThemeKPI) => {
    const input = targetInputs[kpi.id];
    if (input) {
      // Validate that the value is numeric
      const numericValue = parseFloat(input.value);
      if (isNaN(numericValue)) {
        toast({
          title: "Invalid Input",
          description: "Target value must be a valid number",
          variant: "destructive",
        });
        return;
      }
      
      updateKPIMutation.mutate({
        kpiId: kpi.id,
        data: {
          targetValue: input.value,
          targetSource: input.source || "User input"
        }
      });
      // Clear input
      setTargetInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[kpi.id];
        return newInputs;
      });
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Job Summary */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="font-semibold text-base">{theme.jobName}</div>
          <div className="text-sm text-muted-foreground mt-1">{theme.capabilityName}</div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">{theme.evidenceCount} insights</Badge>
            {theme.solutionArea && <Badge variant="outline" className="text-xs">{theme.solutionArea}</Badge>}
            {isFinalized && <Badge variant="secondary" className="bg-yellow-500 text-white text-xs">Locked</Badge>}
          </div>
        </div>
        {!isFinalized && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRecommendations(true)}
            className="gap-2 shrink-0"
            data-testid={`button-recommend-kpis-${theme.id}`}
          >
            <Sparkles className="h-4 w-4" />
            Suggest KPIs
          </Button>
        )}
      </div>
      
      <KPIRecommendationDialog
        jobThemeId={theme.id}
        jobName={theme.jobName}
        projectId={projectId}
        open={showRecommendations}
        onOpenChange={setShowRecommendations}
      />
      
      {/* KPIs Section */}
      {theme.kpis && theme.kpis.length > 0 && (
        <div className="space-y-3 mt-4 pt-4 border-t">
          <div className="font-medium text-sm">Key Performance Indicators</div>
          {theme.kpis.map((kpi: JobThemeKPI) => (
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
                                [kpi.id]: { value: kpi.baselineValue || '', source: kpi.baselineSource || '' }
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
                                [kpi.id]: { value: kpi.benchmarkValue || '', source: kpi.benchmarkSource || '' }
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
                          <Input
                            placeholder="Source..."
                            value={baselineInputs[kpi.id]?.source || ''}
                            onChange={(e) => setBaselineInputs({
                              ...baselineInputs,
                              [kpi.id]: { ...baselineInputs[kpi.id], source: e.target.value }
                            })}
                            data-testid={`input-baseline-source-${kpi.id}`}
                            className="w-48"
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
                  
                  {/* Target Data Input - Only show if KPI is selected and baseline is set */}
                  {kpi.isSelected && kpi.baselineValue && (
                    <div className="space-y-2 mt-3 p-3 bg-background rounded border">
                      <div className="text-xs font-medium">Target Value</div>
                      
                      {/* Show existing target */}
                      {kpi.targetValue ? (
                        <div className="flex items-center justify-between gap-2 p-2 bg-purple-50 dark:bg-purple-950/20 rounded border border-purple-200 dark:border-purple-900">
                          <div>
                            <div className="text-sm font-medium text-purple-900 dark:text-purple-100">{kpi.targetValue}</div>
                            <div className="text-xs text-purple-700 dark:text-purple-300">Source: {kpi.targetSource}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setTargetInputs({
                                ...targetInputs,
                                [kpi.id]: { value: kpi.targetValue || '', source: kpi.targetSource || '' }
                              });
                            }}
                            data-testid={`button-edit-target-${kpi.id}`}
                          >
                            Edit
                          </Button>
                        </div>
                      ) : null}
                      
                      {/* Input form - disabled when finalized */}
                      {!isFinalized && (
                        <div className="flex gap-2 mt-2">
                          <Input
                            placeholder={`Enter target ${kpi.kpiName.toLowerCase()}...`}
                            value={targetInputs[kpi.id]?.value || ''}
                            onChange={(e) => setTargetInputs({
                              ...targetInputs,
                              [kpi.id]: { ...targetInputs[kpi.id], value: e.target.value }
                            })}
                            data-testid={`input-target-${kpi.id}`}
                          />
                          <Input
                            placeholder="Source..."
                            value={targetInputs[kpi.id]?.source || ''}
                            onChange={(e) => setTargetInputs({
                              ...targetInputs,
                              [kpi.id]: { ...targetInputs[kpi.id], source: e.target.value }
                            })}
                            data-testid={`input-target-source-${kpi.id}`}
                            className="w-48"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleTargetUpdate(kpi)}
                            disabled={!targetInputs[kpi.id]?.value}
                            data-testid={`button-save-target-${kpi.id}`}
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
// Success Stories Tab Component
// ============================================================================

function SuccessStoriesSection({ projectId }: { projectId: number | undefined }) {
  const { toast } = useToast();
  
  const { data: stories = [] } = useQuery<SuccessStory[]>({
    queryKey: [`/api/projects/${projectId}/success-stories`],
    enabled: !!projectId,
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/projects/${projectId}/success-stories/generate`, {});
    },
    onSuccess: async (data: any) => {
      await queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}/success-stories`],
        refetchType: 'active'
      });
      toast({ 
        title: `${data.count} success stories generated`,
        description: "AI recommendations added to your project"
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to generate success stories", 
        description: error.message, 
        variant: "destructive" 
      });
    },
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
              Generate relevant Korn Ferry case studies based on your project's insights and value hypotheses using AI.
            </p>
            <Button 
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              data-testid="button-generate-stories"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Recommendations
                </>
              )}
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
        <Button 
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          data-testid="button-generate-more-stories"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate More
            </>
          )}
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
  const [, params] = useRoute("/projects/:id/discovery");
  const projectId = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });

  const { data: dataPoints = [] } = useQuery<CompanyDataPoint[]>({
    queryKey: [`/api/projects/${projectId}/data-points`],
    enabled: !!projectId,
  });

  const { data: headlines = [] } = useQuery<Headline[]>({
    queryKey: [`/api/projects/${projectId}/headlines`],
    enabled: !!projectId,
  });

  const { data: notes } = useQuery<DiscoveryNotes>({
    queryKey: [`/api/projects/${projectId}/discovery-notes`],
    enabled: !!projectId,
  });

  const { data: valueCases = [] } = useQuery<any[]>({
    queryKey: [`/api/projects/${projectId}/value-cases`],
    enabled: !!projectId,
  });

  const { data: discoveryQuestions = [] } = useQuery<DiscoveryQuestion[]>({
    queryKey: [`/api/projects/${projectId}/discovery-questions`],
    enabled: !!projectId,
  });

  const { data: attachments = [] } = useQuery<Attachment[]>({
    queryKey: [`/api/projects/${projectId}/attachments`],
    enabled: !!projectId,
  });

  const { data: questionResponses = [] } = useQuery<QuestionResponse[]>({
    queryKey: [`/api/projects/${projectId}/questionnaire-responses`],
    enabled: !!projectId,
  });

  const { data: sharedQuestionnaire } = useQuery<SharedQuestionnaire | null>({
    queryKey: [`/api/projects/${projectId}/shared-questionnaire`],
    enabled: !!projectId,
  });

  // Jobs & Priorities queries (must be at top level, not inside TabsContent)
  const { data: jobThemesData, isLoading: jobThemesLoading } = useQuery<JobThemeWithKPIs[]>({
    queryKey: [`/api/projects/${projectId}/job-themes`],
    enabled: !!projectId,
  });

  const { data: phaseTransfer } = useQuery<DiscoveryPhaseTransfer>({
    queryKey: [`/api/projects/${projectId}/phase-transfer`],
    enabled: !!projectId,
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
    queryKey: [`/api/projects/${projectId}/alignment/finalized-jobs`],
    enabled: !!projectId,
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
      if (!projectId) return;
      const res = await apiRequest("POST", `/api/projects/${projectId}/discovery-notes`, localNotes);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/discovery-notes`] });
      toast({
        title: "Notes saved",
        description: "Your discovery notes have been saved successfully.",
      });
    },
  });

  const updateProjectPhaseMutation = useMutation({
    mutationFn: async (phase: string) => {
      if (!projectId) return;
      const res = await apiRequest("PATCH", `/api/projects/${projectId}`, { currentPhase: phase });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
    },
  });

  const researchCompanyMutation = useMutation({
    mutationFn: async () => {
      if (!projectId) return;
      const res = await apiRequest("POST", `/api/projects/${projectId}/research`, {});
      return await res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/data-points`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/headlines`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/job-themes`] });
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
      if (!projectId) return;
      const res = await apiRequest("POST", `/api/projects/${projectId}/research/follow-up`, { question });
      return await res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/data-points`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/headlines`] });
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
      await queryClient.cancelQueries({ queryKey: [`/api/projects/${projectId}/data-points`] });
      
      // Snapshot the previous value
      const previousDataPoints = queryClient.getQueryData([`/api/projects/${projectId}/data-points`]);
      
      // Optimistically update to the new value
      queryClient.setQueryData([`/api/projects/${projectId}/data-points`], (old: any) => {
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
          [`/api/projects/${projectId}/data-points`],
          context.previousDataPoints
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we're in sync
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}/data-points`]
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
      await queryClient.cancelQueries({ queryKey: [`/api/projects/${projectId}/data-points`] });
      const previousDataPoints = queryClient.getQueryData([`/api/projects/${projectId}/data-points`]);
      queryClient.setQueryData([`/api/projects/${projectId}/data-points`], (old: any) => {
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
          [`/api/projects/${projectId}/data-points`],
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
        queryKey: [`/api/projects/${projectId}/data-points`]
      });
    },
  });

  const generateDiscoveryQuestionsMutation = useMutation({
    mutationFn: async () => {
      if (!projectId) return;
      const res = await apiRequest("POST", `/api/projects/${projectId}/discovery-questions/generate`, {});
      return await res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/discovery-questions`] });
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
      if (!projectId) return;
      const res = await apiRequest("POST", `/api/projects/${projectId}/enrich-from-notes`, {});
      return await res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/data-points`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/discovery-questions`] });
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
      await queryClient.cancelQueries({ queryKey: [`/api/projects/${projectId}/discovery-questions`] });
      const previousQuestions = queryClient.getQueryData([`/api/projects/${projectId}/discovery-questions`]);
      queryClient.setQueryData([`/api/projects/${projectId}/discovery-questions`], (old: any) => {
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
          [`/api/projects/${projectId}/discovery-questions`],
          context.previousQuestions
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}/discovery-questions`]
      });
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!projectId) return;

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

      const res = await apiRequest("POST", `/api/projects/${projectId}/attachments`, {
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
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/attachments`] });
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
      if (!projectId) return;

      // Validate transcript is not empty
      if (!transcript || transcript.trim().length === 0) {
        throw new Error("Voice transcription cannot be empty");
      }

      const res = await apiRequest("POST", `/api/projects/${projectId}/attachments`, {
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
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/attachments`] });
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
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/attachments`] });
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
      if (!projectId) return;
      const res = await apiRequest("POST", `/api/projects/${projectId}/share-questionnaire`, {
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
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/shared-questionnaire`] });
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
      if (!projectId) return;
      const res = await apiRequest("POST", `/api/projects/${projectId}/consultant-response`, {
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
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/questionnaire-responses`] });
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
      const res = await apiRequest("POST", `/api/projects/${projectId}/job-themes/prioritize`, {
        prioritizedIds
      });
      if (!res.ok) throw new Error("Failed to prioritize");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/job-themes`] });
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
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/job-themes`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/alignment/finalized-jobs`] });
      toast({
        title: "KPI updated",
        description: "KPI has been updated successfully.",
      });
    },
  });

  const finalizeDiscoveryMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/finalize-discovery`, {});
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to finalize");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/phase-transfer`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/alignment/finalized-jobs`] });
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

  if (!projectId) {
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
              currentProjectId={projectId}
              onProjectChange={(p) => setLocation(`/projects/${p.id}/discovery`)}
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
                currentProjectId={projectId}
                onProjectChange={(p) => setLocation(`/projects/${p.id}/discovery`)}
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

      {project && (
        <ProjectPhaseNav 
          projectId={projectId!}
          projectName={project.companyName}
          currentPhase="discovery"
        />
      )}

      <main className="container mx-auto max-w-7xl px-4 lg:px-8 py-8">
        <Tabs defaultValue="organisation" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-4xl" data-testid="tabs-discovery">
            <TabsTrigger value="organisation">Organisation</TabsTrigger>
            <TabsTrigger value="notes">Build Value Case</TabsTrigger>
            <TabsTrigger value="jobs">Jobs & Priorities</TabsTrigger>
            <TabsTrigger value="successStories" data-testid="tab-success-stories">Success Stories</TabsTrigger>
          </TabsList>

          <TabsContent value="organisation" className="space-y-6">
            <Collapsible defaultOpen={true}>
              <div className="rounded-lg border bg-card hover-elevate">
                <CollapsibleTrigger className="w-full p-6 cursor-pointer">
                  <div className="flex items-center justify-between w-full">
                    <div className="text-left">
                      <h3 className="text-lg font-semibold leading-none tracking-tight">AI-Powered Company Research</h3>
                      <p className="text-sm text-muted-foreground mt-1.5">
                        Automatically research and populate company data using AI
                      </p>
                    </div>
                    <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                  </div>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <Card className="mt-2">
                  <CardContent className="pt-6">
                    <Button
                      onClick={() => researchCompanyMutation.mutate()}
                      disabled={researchCompanyMutation.isPending || !projectId}
                      data-testid="button-ai-research"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {researchCompanyMutation.isPending ? "Researching..." : "AI Research Company"}
                    </Button>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>

            {dataPoints.length > 0 && (
              <>
                <Collapsible defaultOpen={false}>
                  <div className="rounded-lg border border-primary/20 bg-primary/5 hover-elevate">
                    <CollapsibleTrigger className="w-full p-6 cursor-pointer">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <MessageSquarePlus className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold leading-none tracking-tight">Need More Information?</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1.5">
                            Ask the AI for additional insights about {project?.companyName}
                          </p>
                        </div>
                        <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                      </div>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <Card className="mt-2 border-primary/20 bg-primary/5">
                      <CardContent className="pt-6">
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
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible defaultOpen={true}>
                  <div className="rounded-lg border bg-card hover-elevate">
                    <CollapsibleTrigger className="w-full p-6 cursor-pointer">
                      <div className="flex items-center justify-between w-full">
                        <div className="text-left">
                          <h3 className="text-lg font-semibold leading-none tracking-tight">Company Data & Headlines</h3>
                          <p className="text-sm text-muted-foreground mt-1.5">
                            Research insights and news about {project?.companyName}
                          </p>
                        </div>
                        <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                      </div>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <Card className="mt-2">
                      <CardContent className="pt-6">
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
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
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
            {/* Step 1: Capture Information - Modernized */}
            <div className="rounded-lg border bg-gradient-to-br from-background to-muted/20">
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">Capture Client Information</h3>
                    <p className="text-sm text-muted-foreground">Notes, files, or voice memos from client conversations</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Textarea
                    id="freeform"
                    placeholder="Type notes from meetings... (e.g., '50-75 sales reps, wants 40% revenue increase')"
                    className="min-h-[100px] resize-none"
                    value={localNotes.freeformNotes}
                    onChange={(e) => setLocalNotes({ ...localNotes, freeformNotes: e.target.value })}
                    data-testid="textarea-notes"
                  />

                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">or attach</span>
                    <div className="h-px flex-1 bg-border" />
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
                </div>
              </div>
            </div>

            {/* Step 2: Extract Insights - Modernized */}
            <div className="relative rounded-lg border bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-cyan-950/20 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500" />
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white font-bold shrink-0 shadow-md">
                      2
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-semibold">Extract Strategic Insights</h3>
                        <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <p className="text-sm text-muted-foreground">AI analyzes your notes to identify metrics, challenges, and opportunities</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => enrichFromNotesMutation.mutate()}
                    disabled={enrichFromNotesMutation.isPending || (!notes?.freeformNotes && attachments.length === 0)}
                    size="lg"
                    className="shrink-0"
                    data-testid="button-enrich-from-notes"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {enrichFromNotesMutation.isPending ? "Analyzing..." : "Extract Insights"}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground bg-background/60 rounded-md p-3 border">
                  <strong>✓ Supported:</strong> Text files (.txt, .csv, .json) and voice notes
                </div>
              </div>
            </div>

            {/* Step 3: Combined Evidence - Modernized */}
            <div className="rounded-lg border bg-gradient-to-br from-background to-muted/20">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold shrink-0 shadow-md">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">Evidence & Enriched Insights</h3>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const selectedCount = dataPoints.filter(dp => dp.selectedForNotes).length;
                        const enrichedCount = dataPoints.filter(dp => (dp.provenance as any)?.type === 'notes_enrichment').length;
                        const total = selectedCount + enrichedCount;
                        
                        if (total === 0) {
                          return <p className="text-sm text-muted-foreground">No insights selected yet</p>;
                        }
                        
                        return (
                          <>
                            {selectedCount > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {selectedCount} selected
                              </Badge>
                            )}
                            {enrichedCount > 0 && (
                              <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 text-xs">
                                <Sparkles className="w-3 h-3 mr-1" />
                                {enrichedCount} enriched
                              </Badge>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              {(() => {
                const combinedPoints = dataPoints.filter(dp => 
                  dp.selectedForNotes || (dp.provenance as any)?.type === 'notes_enrichment'
                );
                
                if (combinedPoints.length === 0) {
                  return (
                    <div className="bg-muted/30 rounded-md p-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        Go to the <strong>Organization tab</strong> and check the boxes next to insights you want to include as evidence. 
                        You can also extract insights from your notes above using the "Extract Insights" button.
                      </p>
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-4">
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
                          <Collapsible key={capabilityKey || 'not-identified'} defaultOpen={true}>
                            <CollapsibleTrigger className="w-full p-4 rounded-lg border bg-muted/30 hover-elevate group">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <Briefcase className="w-4 h-4 text-primary" />
                                  <h3 className="font-semibold text-sm">{capabilityLabel}</h3>
                                  <Badge variant="secondary" className="text-xs">{capabilityPoints.length}</Badge>
                                </div>
                                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="space-y-2 mt-2">
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
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                  </div>
                );
              })()}
              </div>
            </div>

            {/* Step 4: Discovery Questions - Modernized */}
            {dataPoints.filter(dp => dp.selectedForNotes || (dp.provenance as any)?.type === 'notes_enrichment').length > 0 && (
              <div className="relative rounded-lg border bg-gradient-to-br from-background to-muted/10 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500" />
                <div className="p-6">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 text-white font-bold shrink-0 shadow-md">
                        4
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-semibold">Discovery Questions</h3>
                          {discoveryQuestions.length > 0 && (
                            <Badge className="bg-gradient-to-r from-orange-600 to-pink-600 text-white border-0">
                              {discoveryQuestions.length} questions
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">Top 10 high-impact questions to move the needle</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
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
                  {discoveryQuestions.length === 0 ? (
                    <div className="bg-muted/30 rounded-md p-6 text-center mt-6">
                      <p className="text-sm text-muted-foreground">
                        Click "Generate Questions" above to create 10 high-impact discovery questions based on your insights.
                      </p>
                    </div>
                  ) : (
                      <div className="space-y-6">
                        {(() => {
                          // Group questions by their actual capability name from the database
                          const capabilityGroups = discoveryQuestions.reduce((acc: Record<string, typeof discoveryQuestions>, q) => {
                            const cap = q.capabilityName || 'General';
                            if (!acc[cap]) acc[cap] = [];
                            acc[cap].push(q);
                            return acc;
                          }, {});
                          
                          // Sort capabilities alphabetically for consistent display
                          return Object.entries(capabilityGroups)
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([capability, capabilityQuestions]) => (
                            <div key={capability} className="space-y-3">
                              <div className="flex items-center gap-2 pb-2 border-b">
                                <Briefcase className="w-4 h-4 text-primary" />
                                <h3 className="font-semibold text-sm">{capability}</h3>
                                <Badge variant="secondary" className="text-xs">{capabilityQuestions.length} question{capabilityQuestions.length !== 1 ? 's' : ''}</Badge>
                              </div>
                              <div className="space-y-3">
                                {capabilityQuestions.map((question, idx) => {
                                  const responses = questionResponses.filter(r => r.questionId === question.id);
                                  const consultantResponse = responses.find(r => r.respondentType === 'consultant');
                                  const clientResponse = responses.find(r => r.respondentType === 'client');

                                  return (
                                    <div 
                                      key={question.id} 
                                      className="bg-gradient-to-br from-background to-muted/20 rounded-lg border p-4 space-y-3 hover-elevate"
                                      data-testid={`question-${question.id}`}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 text-white font-semibold text-xs shrink-0">
                                          {idx + 1}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                          <p className="text-sm font-medium leading-relaxed">{question.question}</p>
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <Badge 
                                              variant={question.questionType === 'quantitative' ? 'default' : 'secondary'}
                                              className="text-xs"
                                            >
                                              {question.questionType}
                                            </Badge>
                                            {question.relatedKPI && (
                                              <Badge variant="outline" className="text-xs">
                                                KPI: {question.relatedKPI}
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-xs text-muted-foreground">{question.purpose}</p>
                                        </div>
                                      </div>

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
                          ));
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Key Discovery Insights - Actionable Summary */}
              {(() => {
                const researchInsights = dataPoints.filter(dp => !(dp.provenance as any)?.type);
                const enrichedInsights = dataPoints.filter(dp => (dp.provenance as any)?.type === 'notes_enrichment');
                
                // Get top priority insights for client discussions
                const topResearch = researchInsights
                  .filter(dp => dp.priorityScore && dp.priorityScore >= 8)
                  .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0))
                  .slice(0, 3);
                
                const topEnriched = enrichedInsights
                  .filter(dp => dp.confidence === 'high')
                  .slice(0, 3);
                
                // Get answered questions with responses
                const answeredQuestionsWithResponses = discoveryQuestions
                  .filter(q => questionResponses.some(r => r.questionId === q.id))
                  .slice(0, 3)
                  .map(q => ({
                    question: q,
                    responses: questionResponses.filter(r => r.questionId === q.id)
                  }));
                
                const hasInsights = topResearch.length > 0 || topEnriched.length > 0 || answeredQuestionsWithResponses.length > 0;
                if (!hasInsights) return null;

                return (
                  <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg shrink-0">
                          ✓
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl">Key Discovery Insights</CardTitle>
                          <CardDescription>
                            Top findings from your research - ready to discuss with client
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Top Research Insights */}
                      {topResearch.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold text-sm">High-Priority Research Findings</h3>
                          </div>
                          <div className="space-y-2">
                            {topResearch.map(insight => (
                              <div key={insight.id} className="bg-card rounded-md p-3 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-xs font-medium text-muted-foreground">{insight.label}</p>
                                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                    {insight.priorityScore && (
                                      <Badge variant="default" className="text-xs">
                                        Priority: {insight.priorityScore}/10
                                      </Badge>
                                    )}
                                    {insight.relevantCapability && (
                                      <Badge variant="outline" className="text-xs">
                                        {insight.relevantCapability}
                                      </Badge>
                                    )}
                                    <ConfidenceBadge level={insight.confidence as "high" | "medium" | "low"} />
                                  </div>
                                </div>
                                <p className="text-sm leading-relaxed">{insight.value}</p>
                                {(insight.solutionArea || (insight.relatedKPIs && insight.relatedKPIs.length > 0)) && (
                                  <div className="flex items-start gap-3 text-xs text-muted-foreground border-t pt-2">
                                    {insight.solutionArea && (
                                      <span className="flex items-center gap-1">
                                        <Target className="w-3 h-3" />
                                        {insight.solutionArea}
                                      </span>
                                    )}
                                    {insight.relatedKPIs && insight.relatedKPIs.length > 0 && (
                                      <span className="flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        {insight.relatedKPIs.slice(0, 2).join(', ')}
                                        {insight.relatedKPIs.length > 2 && ` +${insight.relatedKPIs.length - 2} more`}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Top Enriched Insights */}
                      {topEnriched.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <FileText className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold text-sm">High-Confidence Notes Insights</h3>
                          </div>
                          <div className="space-y-2">
                            {topEnriched.map(insight => (
                              <div key={insight.id} className="bg-primary/10 border-2 border-primary/30 rounded-md p-3 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-xs font-medium text-muted-foreground">{insight.label}</p>
                                    <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0">
                                      <Sparkles className="w-3 h-3 mr-1" />
                                      From notes
                                    </Badge>
                                  </div>
                                  {insight.relevantCapability && (
                                    <Badge variant="outline" className="text-xs shrink-0">
                                      {insight.relevantCapability}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm leading-relaxed">{insight.value}</p>
                                {(insight.solutionArea || (insight.relatedKPIs && insight.relatedKPIs.length > 0)) && (
                                  <div className="flex items-start gap-3 text-xs text-muted-foreground border-t border-primary/20 pt-2">
                                    {insight.solutionArea && (
                                      <span className="flex items-center gap-1">
                                        <Target className="w-3 h-3" />
                                        {insight.solutionArea}
                                      </span>
                                    )}
                                    {insight.relatedKPIs && insight.relatedKPIs.length > 0 && (
                                      <span className="flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        {insight.relatedKPIs.slice(0, 2).join(', ')}
                                        {insight.relatedKPIs.length > 2 && ` +${insight.relatedKPIs.length - 2} more`}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Strategic Questionnaire Analysis */}
                      {(() => {
                        const totalQuestions = discoveryQuestions.length;
                        const answeredQuestions = new Set(questionResponses.map(r => r.questionId)).size;
                        const clientResponses = questionResponses.filter(r => r.respondentType === 'client');
                        const consultantResponses = questionResponses.filter(r => r.respondentType === 'consultant');
                        
                        // Analyze by capability
                        const capabilityEngagement = discoveryQuestions.reduce((acc, q) => {
                          const cap = q.capabilityName || 'General';
                          if (!acc[cap]) acc[cap] = { total: 0, answered: 0, clientAnswered: 0 };
                          acc[cap].total++;
                          if (questionResponses.some(r => r.questionId === q.id)) {
                            acc[cap].answered++;
                            if (clientResponses.some(r => r.questionId === q.id)) {
                              acc[cap].clientAnswered++;
                            }
                          }
                          return acc;
                        }, {} as Record<string, { total: number; answered: number; clientAnswered: number }>);
                        
                        const topEngagedCapabilities = Object.entries(capabilityEngagement)
                          .sort((a, b) => b[1].answered - a[1].answered)
                          .slice(0, 3);
                        
                        const unansweredCapabilities = Object.entries(capabilityEngagement)
                          .filter(([_, stats]) => stats.answered === 0 && stats.total > 0)
                          .slice(0, 3);

                        if (totalQuestions === 0) return null;

                        return (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b">
                              <Users className="w-4 h-4 text-primary" />
                              <h3 className="font-semibold text-sm">Discovery Engagement Analysis</h3>
                            </div>
                            
                            {/* Overall Progress */}
                            <div className="grid grid-cols-3 gap-3">
                              <div className="bg-card rounded-md p-3">
                                <div className="text-2xl font-bold text-primary">{answeredQuestions}/{totalQuestions}</div>
                                <p className="text-xs text-muted-foreground mt-1">Questions Answered</p>
                              </div>
                              <div className="bg-card rounded-md p-3">
                                <div className="text-2xl font-bold text-blue-600">{clientResponses.length}</div>
                                <p className="text-xs text-muted-foreground mt-1">Client Responses</p>
                              </div>
                              <div className="bg-card rounded-md p-3">
                                <div className="text-2xl font-bold text-green-600">{consultantResponses.length}</div>
                                <p className="text-xs text-muted-foreground mt-1">Consultant Responses</p>
                              </div>
                            </div>

                            {/* Top Engaged Capabilities */}
                            {topEngagedCapabilities.length > 0 && (
                              <div className="bg-primary/5 rounded-md p-3 space-y-2">
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4 text-primary" />
                                  <p className="text-sm font-semibold">Most Engaged Capabilities</p>
                                </div>
                                {topEngagedCapabilities.map(([capability, stats]) => (
                                  <div key={capability} className="flex items-center justify-between gap-2">
                                    <span className="text-xs">{capability}</span>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {stats.answered}/{stats.total} answered
                                      </Badge>
                                      {stats.clientAnswered > 0 && (
                                        <Badge variant="default" className="text-xs">
                                          {stats.clientAnswered} from client
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Discovery Gaps */}
                            {unansweredCapabilities.length > 0 && (
                              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 space-y-3">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Discovery Gaps - Need Attention</p>
                                  </div>
                                  <p className="text-xs text-yellow-700 dark:text-yellow-400 leading-relaxed">
                                    <strong>What this means:</strong> These capabilities have unanswered discovery questions, meaning you lack the data needed to build a compelling value case in these areas.
                                  </p>
                                  <p className="text-xs text-yellow-700 dark:text-yellow-400 leading-relaxed">
                                    <strong>What to do:</strong> Before finalizing discovery, either (1) get client responses for these areas via the shared questionnaire, or (2) focus your value case on the engaged capabilities above where you have solid data.
                                  </p>
                                </div>
                                <div className="space-y-1 pt-1 border-t border-yellow-300 dark:border-yellow-700">
                                  {unansweredCapabilities.map(([capability, stats]) => (
                                    <div key={capability} className="flex items-center justify-between gap-2">
                                      <span className="text-xs text-yellow-800 dark:text-yellow-300">{capability}</span>
                                      <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-700 dark:text-yellow-400">
                                        {stats.total} unanswered
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Strategic Response Insights */}
                            {clientResponses.length > 0 && (
                              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-900 rounded-md p-4 space-y-3">
                                <div className="flex items-center gap-2 pb-2 border-b border-blue-300 dark:border-blue-800">
                                  <Lightbulb className="w-4 h-4 text-blue-600" />
                                  <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">Client Response Insights</h4>
                                  <Badge variant="outline" className="ml-auto text-xs border-blue-400">
                                    Based on {clientResponses.length} response{clientResponses.length !== 1 ? 's' : ''}
                                  </Badge>
                                </div>

                                {/* Key Metrics Extracted */}
                                {(() => {
                                  const metrics: string[] = [];
                                  clientResponses.forEach(r => {
                                    // Extract numbers/percentages from responses
                                    const matches = r.answer.match(/(\d+(?:\.\d+)?)\s*(?:percent|%|million|USD|accuracy|days?|months?)/gi);
                                    if (matches && matches.length > 0) {
                                      matches.slice(0, 2).forEach(m => metrics.push(m));
                                    }
                                  });
                                  
                                  if (metrics.length > 0) {
                                    return (
                                      <div className="space-y-2">
                                        <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-1">
                                          <BarChart3 className="w-3 h-3" />
                                          Key Metrics Mentioned
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          {metrics.slice(0, 6).map((metric, idx) => (
                                            <Badge key={idx} variant="secondary" className="bg-white dark:bg-slate-800 text-xs">
                                              {metric}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}

                                {/* Key Themes from Responses */}
                                {(() => {
                                  const themes: string[] = [];
                                  const keywords = ['challenge', 'problem', 'issue', 'opportunity', 'improvement', 'gap', 'risk', 'priority', 'goal', 'strategy'];
                                  
                                  clientResponses.forEach(r => {
                                    keywords.forEach(keyword => {
                                      const regex = new RegExp(`([^.!?]*${keyword}[s]?[^.!?]*[.!?])`, 'gi');
                                      const matches = r.answer.match(regex);
                                      if (matches && matches.length > 0) {
                                        themes.push(matches[0].trim());
                                      }
                                    });
                                  });
                                  
                                  if (themes.length > 0) {
                                    return (
                                      <div className="space-y-2">
                                        <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-1">
                                          <MessageSquare className="w-3 h-3" />
                                          Key Themes Identified
                                        </p>
                                        <div className="space-y-1">
                                          {themes.slice(0, 3).map((theme, idx) => (
                                            <div key={idx} className="text-xs text-blue-900 dark:text-blue-100 bg-white/60 dark:bg-slate-800/60 rounded px-2 py-1 italic">
                                              "{theme.length > 120 ? theme.substring(0, 120) + '...' : theme}"
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}

                                {/* Discussion Points */}
                                <div className="space-y-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                                  <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-1">
                                    <Target className="w-3 h-3" />
                                    For Your Next Client Discussion
                                  </p>
                                  <ul className="space-y-1 text-xs text-blue-900 dark:text-blue-100">
                                    <li className="flex items-start gap-2">
                                      <span className="text-blue-600 shrink-0">•</span>
                                      <span>Validate the quantitative metrics mentioned - ensure you understand baseline context and measurement methods</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <span className="text-blue-600 shrink-0">•</span>
                                      <span>Probe deeper into challenges mentioned - ask "What have you tried?" and "What would success look like?"</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <span className="text-blue-600 shrink-0">•</span>
                                      <span>Connect insights to business impact - translate operational challenges into financial/strategic consequences</span>
                                    </li>
                                    {clientResponses.some(r => r.answer.toLowerCase().includes('forecast') || r.answer.toLowerCase().includes('predict')) && (
                                      <li className="flex items-start gap-2">
                                        <span className="text-blue-600 shrink-0">•</span>
                                        <span>Explore forecasting/prediction challenges - opportunity for data-driven solutions and analytics capabilities</span>
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              </div>
                            )}

                            {/* Sample Responses */}
                            {answeredQuestionsWithResponses.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground">Sample Responses</p>
                                {answeredQuestionsWithResponses.slice(0, 2).map(({ question, responses }) => (
                                  <div key={question.id} className="bg-card rounded-md p-2 space-y-2">
                                    <p className="text-xs font-medium">{question.question}</p>
                                    {responses.slice(0, 1).map((response, idx) => (
                                      <div key={idx} className="pl-2 border-l-2 border-primary/30">
                                        <Badge 
                                          variant={response.respondentType === 'client' ? 'default' : 'secondary'} 
                                          className="text-xs mb-1"
                                        >
                                          {response.respondentType === 'client' 
                                            ? (response.respondentName || 'Client') 
                                            : 'Consultant'}
                                        </Badge>
                                        <p className="text-xs text-muted-foreground italic line-clamp-2">"{response.answer}"</p>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Next Steps */}
                      <div className="bg-primary/10 border border-primary/30 rounded-md p-4 space-y-2">
                        <p className="text-sm font-medium text-primary">✓ Ready for Client Discussion</p>
                        <p className="text-sm text-muted-foreground">
                          Use these key insights to discuss value opportunities with your client. Move to Jobs & Priorities to select top 3 focus areas.
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
                        No highlighted priorities found. Complete your discovery research first to see potential priorities.
                      </p>
                    </CardContent>
                  </Card>
                );
              }

              const prioritizedThemes = jobThemesData.filter((t: any) => t.priorityRank !== null).sort((a: any, b: any) => (a.priorityRank || 999) - (b.priorityRank || 999));
              const unprioritizedThemes = jobThemesData.filter((t: any) => t.priorityRank === null);
              
              // Validation for finalization: need 3 jobs with at least 1 KPI each
              const canFinalize = prioritizedThemes.length === 3 && 
                prioritizedThemes.every((t: JobThemeWithKPIs) => 
                  t.kpis && t.kpis.some(kpi => kpi.isSelected)
                );

              return (
                <>
                  {/* Progress Header */}
                  <div className="flex items-center justify-between gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-lg">Build Your Value Case</h2>
                        <p className="text-sm text-muted-foreground">Select top 3 highlighted priorities to focus on</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{prioritizedThemes.length}/3</div>
                        <div className="text-xs text-muted-foreground">Priorities Selected</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {prioritizedThemes.reduce((acc: number, t: JobThemeWithKPIs) => acc + (t.kpis?.filter(k => k.isSelected).length || 0), 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">KPIs Tracked</div>
                      </div>
                    </div>
                  </div>

                  {/* Available Highlighted Priorities - Compact Grid */}
                  {unprioritizedThemes.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Available Highlighted Priorities</span>
                          <Badge variant="secondary">{unprioritizedThemes.length} remaining</Badge>
                        </CardTitle>
                        <CardDescription>Click any priority to add it to your value case (max 3)</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                          {unprioritizedThemes.map((theme: any) => (
                            <button
                              key={theme.id}
                              className="text-left border rounded-lg p-3 hover-elevate active-elevate-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => {
                                // Prevent duplicates by checking if theme already exists in prioritized list
                                const currentIds = prioritizedThemes.map((t: JobThemeWithKPIs) => t.id);
                                if (currentIds.includes(theme.id)) {
                                  toast({
                                    title: "Already selected",
                                    description: "This highlighted priority is already selected.",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                const newPrioritized = [...currentIds, theme.id].slice(0, 3);
                                prioritizeJobsMutation.mutate({ prioritizedIds: newPrioritized });
                              }}
                              disabled={isFinalized || prioritizedThemes.length >= 3 || prioritizeJobsMutation.isPending}
                              data-testid={`button-select-job-${theme.id}`}
                            >
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm line-clamp-2">{theme.jobName}</h4>
                                <p className="text-xs text-muted-foreground">{theme.capabilityName}</p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {theme.evidenceCount} insights
                                  </Badge>
                                  {theme.solutionArea && (
                                    <Badge variant="outline" className="text-xs line-clamp-1">
                                      {theme.solutionArea}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Priority Slots with Integrated KPI Configuration */}
                  <div className="space-y-4">
                    {[1, 2, 3].map((slot) => {
                      const theme = prioritizedThemes[slot - 1] as JobThemeWithKPIs | undefined;
                      const selectedKPIs = theme?.kpis?.filter(k => k.isSelected).length || 0;
                      const totalKPIs = theme?.kpis?.length || 0;
                      
                      return (
                        <Card 
                          key={slot}
                          className={`${theme ? 'border-primary/30' : 'border-dashed border-muted'}`}
                          data-testid={`priority-slot-${slot}`}
                        >
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Badge className="bg-primary text-primary-foreground">Priority #{slot}</Badge>
                                {theme && (
                                  <>
                                    <div className="text-sm text-muted-foreground">•</div>
                                    <div className="text-sm font-medium">{selectedKPIs}/{totalKPIs} KPIs selected</div>
                                  </>
                                )}
                              </div>
                              {theme && !isFinalized && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const newPrioritized = prioritizedThemes.filter(t => t.id !== theme.id).map(t => t.id);
                                    prioritizeJobsMutation.mutate({ prioritizedIds: newPrioritized });
                                  }}
                                  data-testid={`button-remove-${theme.id}`}
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Remove
                                </Button>
                              )}
                            </div>
                          </CardHeader>

                          {theme ? (
                            <CardContent className="pt-0">
                              <JobThemeCard 
                                theme={theme} 
                                rank={slot} 
                                projectId={projectId}
                                updateKPIMutation={updateKPIMutation}
                                isFinalized={isFinalized}
                                onDeselect={() => {}}
                              />
                            </CardContent>
                          ) : (
                            <CardContent className="pt-0">
                              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
                                <Plus className="w-8 h-8 text-muted-foreground mb-2" />
                                <p className="text-sm font-medium">No highlighted priority selected</p>
                                <p className="text-xs text-muted-foreground mt-1">Choose from available highlighted priorities above</p>
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                  </div>

                  {/* Finalize Discovery Button or Requirements Message */}
                  {isFinalized ? (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                      <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-green-900 dark:text-green-100">Discovery Phase Complete</p>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Your priorities are locked. Continue to Alignment to build value cases.
                        </p>
                      </div>
                      <Link href={`/projects/${projectId}/alignment`}>
                        <Button data-testid="button-go-to-alignment">
                          Go to Alignment
                        </Button>
                      </Link>
                    </div>
                  ) : canFinalize ? (
                    <div className="flex items-center justify-between gap-4 p-6 rounded-lg bg-primary/10 border-2 border-primary/30">
                      <div>
                        <p className="font-semibold text-lg">Ready to move forward?</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Lock your priorities and proceed to build value cases in Alignment
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
                    </div>
                  ) : prioritizedThemes.length > 0 && (
                    <div className="p-4 rounded-lg bg-muted border border-muted">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">Complete all requirements to finalize</p>
                          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                            {prioritizedThemes.length < 3 && (
                              <li>• Select {3 - prioritizedThemes.length} more highlighted {3 - prioritizedThemes.length !== 1 ? 'priorities' : 'priority'} (currently {prioritizedThemes.length}/3)</li>
                            )}
                            {prioritizedThemes.some((t: JobThemeWithKPIs) => !t.kpis || !t.kpis.some(kpi => kpi.isSelected)) && (
                              <li>• Select at least 1 KPI for each highlighted priority</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </TabsContent>

          {/* Success Stories Tab */}
          <TabsContent value="successStories" className="space-y-6">
            <SuccessStoriesSection projectId={projectId} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
