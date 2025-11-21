import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrganisationCard from "@/components/OrganisationCard";
import ValueHypothesisBuilder from "@/components/ValueHypothesisBuilder";
import ProjectSelector from "@/components/ProjectSelector";
import StatusBadge from "@/components/StatusBadge";
import { ArrowLeft, Save, Send, FileText, Plus, Trash2 } from "lucide-react";
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

  const [localNotes, setLocalNotes] = useState({
    freeformNotes: "",
    keyStakeholder: "",
    topChallenges: "",
    timeline: "",
  });

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
            {dataPoints.length > 0 && (
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

          <TabsContent value="hypothesis">
            {selectedProjectId && <ValueHypothesisBuilder projectId={selectedProjectId} />}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
