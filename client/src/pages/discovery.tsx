import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ArrowLeft, Save, Send, FileText, Plus, Trash2, Sparkles, MessageSquarePlus } from "lucide-react";
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
                <OrganisationCard
                  name={project?.companyName || ""}
                  sector={project?.sector || ""}
                  dataPoints={dataPoints.map(dp => ({
                    label: dp.label,
                    value: dp.value,
                    confidence: dp.confidence as "high" | "medium" | "low",
                    source: dp.source || undefined,
                  }))}
                  headlines={headlines.map(h => ({
                    title: h.title,
                    date: h.date,
                    source: h.source,
                    url: h.url,
                  }))}
                />

                <Card>
                  <CardHeader>
                    <CardTitle>Need More Information?</CardTitle>
                    <CardDescription>
                      Ask the AI for additional insights about {project?.companyName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Dialog open={isFollowUpDialogOpen} onOpenChange={setIsFollowUpDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" data-testid="button-ask-followup">
                          <MessageSquarePlus className="w-4 h-4 mr-2" />
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
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Freeform Notes</CardTitle>
                  <CardDescription>Capture key insights from discovery conversation</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Start typing your notes here..."
                    className="min-h-[400px] resize-none"
                    value={localNotes.freeformNotes}
                    onChange={(e) => setLocalNotes({ ...localNotes, freeformNotes: e.target.value })}
                    data-testid="textarea-notes"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Changes are saved when you click Save Draft
                  </p>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Structured Fields</CardTitle>
                  <CardDescription>Capture specific data points</CardDescription>
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
                    <Label htmlFor="challenges">Top Challenges</Label>
                    <Textarea
                      id="challenges"
                      placeholder="List main challenges..."
                      className="resize-none"
                      value={localNotes.topChallenges}
                      onChange={(e) => setLocalNotes({ ...localNotes, topChallenges: e.target.value })}
                      data-testid="textarea-challenges"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeline">Timeline</Label>
                    <Input
                      id="timeline"
                      placeholder="Expected timeline"
                      value={localNotes.timeline}
                      onChange={(e) => setLocalNotes({ ...localNotes, timeline: e.target.value })}
                      data-testid="input-timeline"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
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
