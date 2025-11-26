import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  TrendingUp,
  RefreshCw,
  Target as TargetIcon,
  ArrowRight
} from "lucide-react";
import type { Project, ValueCase, CompanyDataPoint, JobThemeKPI } from "@shared/schema";
import ValueCaseBuilder from "@/components/ValueCaseBuilder";
import ValueCaseCard from "@/components/ValueCaseCard";
import { ValueCaseCreationDialog } from "@/components/value-case-creation-dialog";
import { AlignmentInteractive } from "@/components/alignment-interactive";
import { ReprioritizeDialog } from "@/components/ReprioritizeDialog";
import { ShareAlignmentDialog } from "@/components/ShareAlignmentDialog";
import { EvidenceDrawer } from "@/components/EvidenceDrawer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";

type JobWithKPIs = {
  id: number;
  jobName: string;
  capabilityName: string;
  solutionArea: string | null;
  priorityRank: number | null;
  aggregationSummary: string | null;
  evidenceCount: number;
  kpis: JobThemeKPI[];
};

type FinalizedJobsResponse = {
  finalized: boolean;
  jobs: JobWithKPIs[];
  transferredAt: string | null;
};

export default function AlignmentPage() {
  const [, params] = useRoute("/projects/:id/alignment");
  const projectId = parseInt(params?.id || "0");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [isCreationDialogOpen, setIsCreationDialogOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isReprioritizeOpen, setIsReprioritizeOpen] = useState(false);
  const [editingValueCase, setEditingValueCase] = useState<ValueCase | null>(null);

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: valueCases = [] } = useQuery<ValueCase[]>({
    queryKey: [`/api/projects/${projectId}/value-cases`],
  });

  const { data: insights = [] } = useQuery<CompanyDataPoint[]>({
    queryKey: [`/api/projects/${projectId}/company-data`],
  });

  const { data: finalizedData } = useQuery<FinalizedJobsResponse>({
    queryKey: [`/api/projects/${projectId}/alignment/finalized-jobs`],
    enabled: !!projectId,
  });

  const { data: allJobThemes = [] } = useQuery<JobWithKPIs[]>({
    queryKey: [`/api/projects/${projectId}/job-themes`],
    enabled: !!projectId,
  });

  const draftValueCases = valueCases.filter(h => h.status === "draft");
  const sentValueCases = valueCases.filter(h => h.status === "sent");
  const approvedValueCases = valueCases.filter(h => h.status === "approved");

  // Mutation to update KPI baseline/target values
  const updateKPIMutation = useMutation({
    mutationFn: async ({ kpiId, data }: { kpiId: number; data: { baselineValue?: string; baselineSource?: string; targetValue?: string; targetSource?: string } }) => {
      const res = await apiRequest("PATCH", `/api/job-theme-kpis/${kpiId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/alignment/finalized-jobs`] });
      toast({
        title: "KPI updated",
        description: "Baseline or target value has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update KPI value.",
        variant: "destructive",
      });
    },
  });

  // Mutation to start tracking value realization
  const startTrackingMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/projects/${projectId}`, { currentPhase: "realisation" });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      toast({
        title: "Value Realization Started",
        description: "You can now track KPI progress and measure value delivered.",
      });
      // Navigate to realization page using wouter
      setLocation(`/projects/${projectId}/realisation`);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to start tracking",
        description: error.message || "Unable to transition to Realization phase.",
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    setIsCreationDialogOpen(true);
  };

  const handleEdit = (valueCase: ValueCase) => {
    setEditingValueCase(valueCase);
    setIsBuilderOpen(true);
  };

  const handleClose = () => {
    setIsBuilderOpen(false);
    setEditingValueCase(null);
  };

  if (!project) {
    return <div className="p-6">Loading project...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Action Bar */}
      <div className="border-b bg-card">
        <div className="p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-semibold">Value Cases & KPI Alignment</h1>
              <p className="text-sm text-muted-foreground">
                Build and refine value cases with {project.companyName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <EvidenceDrawer projectId={projectId} />
              {finalizedData && finalizedData.jobs.length > 0 && (
                <Button 
                  onClick={() => setIsReprioritizeOpen(true)}
                  size="default"
                  variant="outline"
                  data-testid="button-reprioritize-jobs"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Re-prioritize Jobs
                </Button>
              )}
              <ShareAlignmentDialog projectId={projectId} />
              <Button 
                onClick={handleCreate}
                size="default"
                data-testid="button-create-value-case"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Value Case
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Finalized Discovery Jobs with Interactive KPI Management */}
        <AlignmentInteractive projectId={projectId} />

        {/* Start Tracking CTA - Show when ready to move to Realization */}
        {finalizedData && finalizedData.jobs.length > 0 && project.currentPhase === "alignment" && (
          (() => {
            // Check if we have KPIs with baselines and targets
            const hasReadyKPIs = finalizedData.jobs.some((job: JobWithKPIs) => 
              job.kpis && job.kpis.some((kpi: JobThemeKPI) => 
                kpi.isSelected && kpi.baselineValue && kpi.targetValue
              )
            );

            if (!hasReadyKPIs) return null;

            return (
              <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10" data-testid="card-start-tracking-cta">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                        <TargetIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Ready to Track Value Realization</CardTitle>
                        <CardDescription className="mt-1">
                          You've set KPI baselines and targets. Start tracking actual progress and measure value delivered.
                        </CardDescription>
                      </div>
                    </div>
                    <Button 
                      size="lg"
                      onClick={() => startTrackingMutation.mutate()}
                      disabled={startTrackingMutation.isPending}
                      data-testid="button-start-tracking-realization"
                    >
                      {startTrackingMutation.isPending ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          Start Tracking Value Realization
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            );
          })()
        )}

        {/* Value Cases Section */}
        {valueCases.length === 0 ? (
          <Card className="max-w-2xl mx-auto mt-12">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-center">Build Your First Value Case</CardTitle>
              <CardDescription className="text-center">
                Use insights from Discovery to create quantified value cases.
                AI will recommend cases based on your finalized jobs and KPIs.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-6">
              <Button onClick={handleCreate} data-testid="button-create-first-value-case">
                <Plus className="h-4 w-4 mr-2" />
                Create Value Case
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all" data-testid="tab-all">
                All ({valueCases.length})
              </TabsTrigger>
              <TabsTrigger value="draft" data-testid="tab-draft">
                Draft ({draftValueCases.length})
              </TabsTrigger>
              <TabsTrigger value="sent" data-testid="tab-sent">
                Sent ({sentValueCases.length})
              </TabsTrigger>
              <TabsTrigger value="approved" data-testid="tab-approved">
                Approved ({approvedValueCases.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid gap-4">
                {valueCases.map(valueCase => (
                  <ValueCaseCard
                    key={valueCase.id}
                    valueCase={valueCase}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="draft" className="mt-6">
              <div className="grid gap-4">
                {draftValueCases.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">
                    No draft value cases
                  </p>
                ) : (
                  draftValueCases.map(valueCase => (
                    <ValueCaseCard
                      key={valueCase.id}
                      valueCase={valueCase}
                      onEdit={handleEdit}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="sent" className="mt-6">
              <div className="grid gap-4">
                {sentValueCases.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">
                    No sent value cases
                  </p>
                ) : (
                  sentValueCases.map(valueCase => (
                    <ValueCaseCard
                      key={valueCase.id}
                      valueCase={valueCase}
                      onEdit={handleEdit}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="approved" className="mt-6">
              <div className="grid gap-4">
                {approvedValueCases.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">
                    No approved value cases
                  </p>
                ) : (
                  approvedValueCases.map(valueCase => (
                    <ValueCaseCard
                      key={valueCase.id}
                      valueCase={valueCase}
                      onEdit={handleEdit}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Value Case Creation Dialog (AI-powered) */}
      <ValueCaseCreationDialog 
        open={isCreationDialogOpen}
        onOpenChange={setIsCreationDialogOpen}
        projectId={projectId}
      />

      {/* Value Case Builder Dialog (for editing) */}
      {isBuilderOpen && (
        <ValueCaseBuilder
          projectId={projectId}
          insights={insights}
          valueCase={editingValueCase}
          onClose={handleClose}
        />
      )}

      {/* Re-prioritize Dialog */}
      <ReprioritizeDialog
        open={isReprioritizeOpen}
        onOpenChange={setIsReprioritizeOpen}
        projectId={projectId}
        currentJobs={finalizedData?.jobs || []}
        allJobs={allJobThemes}
      />
    </div>
  );
}
