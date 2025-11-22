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
import { ArrowLeft, Save, Send, FileText, Plus, Trash2, Sparkles, MessageSquarePlus, Briefcase, ExternalLink } from "lucide-react";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import { Link, useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, CompanyDataPoint, Headline, DiscoveryNotes } from "@shared/schema";

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

  const [localNotes, setLocalNotes] = useState({
    freeformNotes: "",
    keyStakeholder: "",
    topChallenges: "",
    timeline: "",
  });

  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [isFollowUpDialogOpen, setIsFollowUpDialogOpen] = useState(false);

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

  const updateDataPointSelectionMutation = useMutation({
    mutationFn: async ({ id, selectedForNotes, relevantJob }: { id: number; selectedForNotes: boolean; relevantJob?: string }) => {
      // Send relevantJob as null if undefined to clear it in the database
      const res = await apiRequest("PATCH", `/api/data-points/${id}`, { 
        selectedForNotes, 
        relevantJob: relevantJob !== undefined ? relevantJob : null 
      });
      return await res.json();
    },
    onMutate: async ({ id, selectedForNotes, relevantJob }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/projects", selectedProjectId, "data-points"] });
      
      // Snapshot the previous value
      const previousDataPoints = queryClient.getQueryData(["/api/projects", selectedProjectId, "data-points"]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(["/api/projects", selectedProjectId, "data-points"], (old: any) => {
        if (!old) return old;
        return old.map((dp: any) => 
          dp.id === id 
            ? { 
                ...dp, 
                selectedForNotes, 
                // If relevantJob is explicitly undefined, clear it; otherwise use the new value or keep existing
                relevantJob: relevantJob !== undefined ? relevantJob : null 
              }
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

  const handleDataPointSelect = (id: number, selected: boolean, job?: string) => {
    updateDataPointSelectionMutation.mutate({ 
      id, 
      selectedForNotes: selected, 
      relevantJob: job 
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
          <TabsList className="grid w-full grid-cols-3 max-w-2xl" data-testid="tabs-discovery">
            <TabsTrigger value="organisation">Organisation</TabsTrigger>
            <TabsTrigger value="notes">Notes & Evidence</TabsTrigger>
            <TabsTrigger value="hypothesis">Value Hypothesis</TabsTrigger>
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
            {dataPoints.filter(dp => dp.selectedForNotes).length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Evidence Selected Yet</CardTitle>
                  <CardDescription>
                    Select key insights from the Organization tab to build your evidence base
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Go to the Organization tab and check the insights you want to add to Notes & Evidence. 
                    Tag them with relevant Korn Ferry jobs to organize your findings.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Evidence Organized by Korn Ferry Jobs</CardTitle>
                    <CardDescription>
                      {dataPoints.filter(dp => dp.selectedForNotes).length} insight{dataPoints.filter(dp => dp.selectedForNotes).length !== 1 ? 's' : ''} selected from research
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {['leadership-development', 'talent-acquisition', 'succession-planning', 'culture-transformation', 'organizational-design', 'change-management', null].map(jobKey => {
                      const jobPoints = dataPoints.filter(dp => dp.selectedForNotes && (jobKey === null ? !dp.relevantJob : dp.relevantJob === jobKey));
                      if (jobPoints.length === 0) return null;

                      const jobLabel = jobKey 
                        ? ({
                            'leadership-development': 'Leadership Development',
                            'talent-acquisition': 'Talent Acquisition',
                            'succession-planning': 'Succession Planning',
                            'culture-transformation': 'Culture Transformation',
                            'organizational-design': 'Organizational Design',
                            'change-management': 'Change Management',
                          }[jobKey] || jobKey)
                        : 'Uncategorized';

                      return (
                        <div key={jobKey || 'uncategorized'} className="space-y-3">
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <Briefcase className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold text-sm">{jobLabel}</h3>
                            <Badge variant="secondary" className="text-xs">{jobPoints.length}</Badge>
                          </div>
                          <div className="space-y-2 pl-6">
                            {jobPoints.map((point, idx) => (
                              <div 
                                key={point.id} 
                                className="bg-muted/30 rounded-md p-3 space-y-1.5"
                                data-testid={`selected-point-${idx}`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-xs font-medium text-muted-foreground">{point.label}</p>
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
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Additional Notes</CardTitle>
                    <CardDescription>Add context and observations to complement the evidence</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="stakeholder">Key Stakeholder</Label>
                      <Input
                        id="stakeholder"
                        placeholder="Name, Title"
                        value={localNotes.keyStakeholder}
                        onChange={(e) => setLocalNotes({ ...localNotes, keyStakeholder: e.target.value })}
                        data-testid="input-stakeholder"
                      />
                    </div>
                    <div>
                      <Label htmlFor="freeform">Freeform Notes</Label>
                      <Textarea
                        id="freeform"
                        placeholder="Capture additional insights..."
                        className="min-h-[200px] resize-none"
                        value={localNotes.freeformNotes}
                        onChange={(e) => setLocalNotes({ ...localNotes, freeformNotes: e.target.value })}
                        data-testid="textarea-notes"
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="hypothesis" className="space-y-6">
            {valueHypotheses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Saved Value Hypotheses</CardTitle>
                  <CardDescription>
                    {valueHypotheses.length} hypothesis{valueHypotheses.length !== 1 ? 'es' : ''} created
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {valueHypotheses.map((hyp: any, idx: number) => (
                      <div
                        key={hyp.id}
                        className="p-4 border rounded-md space-y-2"
                        data-testid={`hypothesis-${idx}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium">Job: {hyp.job}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              KPI: {hyp.primaryKpi} | Exposure: {hyp.exposure} | Target: {hyp.target}
                            </div>
                            {hyp.researchDesign && (
                              <div className="text-sm text-muted-foreground mt-2">
                                Research Design: {hyp.researchDesign}
                              </div>
                            )}
                          </div>
                          <StatusBadge status={hyp.status || "draft"} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {selectedProjectId && <ValueHypothesisBuilder projectId={selectedProjectId} />}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
