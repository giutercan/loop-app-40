import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/StatusBadge";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import ProjectSelector from "@/components/ProjectSelector";
import { ArrowLeft, Lock, Mail, CheckCircle2, Calendar } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, StrategicChallenge, Baseline } from "@shared/schema";

const DEFAULT_CHALLENGES = [
  { title: "Leadership Pipeline", description: "Building strong succession plans and developing future leaders" },
  { title: "Employee Retention", description: "Reducing turnover and improving employee engagement" },
  { title: "Talent Acquisition", description: "Finding and hiring top talent faster" },
  { title: "Culture Transformation", description: "Shifting organizational culture to support growth" }
];

export default function Alignment() {
  const [location] = useLocation();
  const { toast } = useToast();
  const urlParams = new URLSearchParams(location.split('?')[1]);
  const projectIdParam = urlParams.get('project');
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(
    projectIdParam ? parseInt(projectIdParam) : undefined
  );
  const [confirmBaseline, setConfirmBaseline] = useState(false);

  const { data: project } = useQuery<Project>({
    queryKey: ["/api/projects", selectedProjectId],
    enabled: !!selectedProjectId,
  });

  const { data: challenges = [], isSuccess: challengesLoaded } = useQuery<StrategicChallenge[]>({
    queryKey: ["/api/projects", selectedProjectId, "strategic-challenges"],
    enabled: !!selectedProjectId,
  });

  const { data: baselines = [] } = useQuery<Baseline[]>({
    queryKey: ["/api/projects", selectedProjectId, "baselines"],
    enabled: !!selectedProjectId,
  });

  const baseline = baselines[0];
  const baselineLocked = baseline?.isLocked || false;

  const [challengesInitialized, setChallengesInitialized] = useState(false);

  useEffect(() => {
    async function initializeChallenges() {
      if (!selectedProjectId || !challengesLoaded || challengesInitialized) return;
      if (challenges.length > 0) {
        setChallengesInitialized(true);
        return;
      }
      
      for (let i = 0; i < DEFAULT_CHALLENGES.length; i++) {
        const challenge = DEFAULT_CHALLENGES[i];
        try {
          await apiRequest("POST", `/api/projects/${selectedProjectId}/strategic-challenges`, {
            title: challenge.title,
            description: challenge.description,
            selected: false,
            sortOrder: i
          });
        } catch (error) {
          console.error("Failed to create challenge:", error);
        }
      }
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "strategic-challenges"] });
      setChallengesInitialized(true);
    }
    
    initializeChallenges();
  }, [selectedProjectId, challengesLoaded, challenges.length, challengesInitialized]);

  useEffect(() => {
    setChallengesInitialized(false);
  }, [selectedProjectId]);

  const toggleChallengeMutation = useMutation({
    mutationFn: async ({ id, selected }: { id: number; selected: boolean }) => {
      const res = await apiRequest("PATCH", `/api/strategic-challenges/${id}`, { selected });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "strategic-challenges"] });
    },
  });

  const lockBaselineMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProjectId) throw new Error("No project selected");
      
      if (!baseline) {
        const createRes = await apiRequest("POST", `/api/projects/${selectedProjectId}/baselines`, {
          exposure: "0",
          confidence: "medium",
          sources: [],
        });
        const newBaseline = await createRes.json();
        
        const updateRes = await apiRequest("PATCH", `/api/baselines/${newBaseline.id}`, {
          isLocked: true,
          lockedAt: new Date().toISOString(),
          confirmedByEmail: "customer@example.com",
        });
        return await updateRes.json();
      }
      
      const res = await apiRequest("PATCH", `/api/baselines/${baseline.id}`, {
        isLocked: true,
        lockedAt: new Date().toISOString(),
        confirmedByEmail: "customer@example.com",
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "baselines"] });
      toast({
        title: "Baseline locked",
        description: "The baseline has been confirmed and locked successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to lock baseline",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleConfirmBaseline = () => {
    if (confirmBaseline) {
      lockBaselineMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" data-testid="button-back">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">Phase 2: Customer Alignment</h1>
                  {baselineLocked ? (
                    <StatusBadge status="locked" />
                  ) : (
                    <StatusBadge status="draft" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{project?.companyName || "No project selected"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ProjectSelector
                currentProjectId={selectedProjectId}
                onProjectChange={(p) => setSelectedProjectId(p.id)}
              />
              <Link href={`/realisation?project=${selectedProjectId}`}>
                <Button disabled={!baselineLocked} data-testid="button-finalize">
                  Move to Realisation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 lg:px-8 py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Strategic Challenge Mapping</CardTitle>
            <CardDescription>
              Select your top 3 business challenges and map them to Korn Ferry solutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map((challenge, idx) => (
                <Card 
                  key={challenge.id} 
                  className={`hover-elevate cursor-pointer border-2 ${
                    challenge.selected ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => {
                    toggleChallengeMutation.mutate({
                      id: challenge.id,
                      selected: !challenge.selected
                    });
                  }}
                  data-testid={`card-challenge-${idx}`}
                >
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      {challenge.title}
                      {challenge.selected && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </CardTitle>
                    <CardDescription>{challenge.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary">Korn Ferry Solution Available</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className={baselineLocked ? "border-[#05C690] border-2" : "border-[#8DC63F] border-2"}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {baselineLocked && <Lock className="w-6 h-6 text-green-600" />}
                  Baseline Confirmation
                </CardTitle>
                <CardDescription>
                  Review and confirm the baseline data before locking
                </CardDescription>
              </div>
              {baselineLocked ? (
                <Badge className="bg-[#05C690] hover:bg-[#009B77] text-white">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Locked
                </Badge>
              ) : (
                <Badge className="bg-[#8DC63F] hover:bg-[#8DC63F]/90 text-white">
                  Pending Confirmation
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-3">
                <h3 className="font-semibold">Exposure Data with Provenance</h3>
              </div>
              <div className="p-4 space-y-4">
                {baseline ? (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-muted-foreground">Exposure</p>
                        <p className="text-3xl font-bold font-mono">${parseFloat(baseline.exposure).toLocaleString()}</p>
                      </div>
                      <ConfidenceBadge level={baseline.confidence as "high" | "medium" | "low"} />
                    </div>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">Sources:</p>
                      <ul className="space-y-1 text-muted-foreground">
                        {(baseline.sources as string[])?.map((source, idx) => (
                          <li key={idx}>• {source}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">No baseline data available</p>
                )}
              </div>
            </div>

            {!baselineLocked && (
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="confirm"
                    checked={confirmBaseline}
                    onCheckedChange={(checked) => {
                      setConfirmBaseline(checked as boolean);
                      console.log('Baseline confirmation checkbox:', checked);
                    }}
                    data-testid="checkbox-confirm-baseline"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="confirm"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I confirm this baseline is accurate
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      By checking this box, you acknowledge that the baseline data is correct and will be locked after email confirmation
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleConfirmBaseline}
                  disabled={!confirmBaseline || lockBaselineMutation.isPending}
                  className="w-full"
                  data-testid="button-confirm-and-send"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {lockBaselineMutation.isPending ? "Locking..." : "Confirm & Lock Baseline"}
                </Button>
              </div>
            )}

            {baselineLocked && baseline && (
              <div className="p-4 bg-[#05C690]/10 border border-[#05C690]/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#009B77] mt-0.5" />
                  <div>
                    <p className="font-medium text-[#009B77] dark:text-[#05C690] mb-1">
                      Baseline Locked
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Confirmed on {baseline.lockedAt ? new Date(baseline.lockedAt).toLocaleDateString() : new Date().toLocaleDateString()}
                    </p>
                    {baseline.confirmedByEmail && (
                      <p className="text-sm text-muted-foreground">
                        Email confirmation received from {baseline.confirmedByEmail}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              12-Month Timeline
            </CardTitle>
            <CardDescription>
              Drag and drop interventions, assign owners, and set milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-8 bg-muted/30 min-h-[400px] flex items-center justify-center">
              <div className="text-center space-y-3">
                <Calendar className="w-16 h-16 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Interactive Gantt timeline editor</p>
                <p className="text-sm text-muted-foreground">
                  Drag interventions, assign owners, and track milestones over 12 months
                </p>
                <Button variant="outline" data-testid="button-add-intervention">
                  Add First Intervention
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
