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
  CheckCircle2, 
  Send, 
  FileText,
  Lightbulb,
  Target,
  Briefcase,
  TrendingDown
} from "lucide-react";
import type { Project, ValueHypothesis, CompanyDataPoint, JobThemeKPI } from "@shared/schema";
import ValueHypothesisBuilder from "@/components/ValueHypothesisBuilder";
import ValueHypothesisCard from "@/components/ValueHypothesisCard";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingHypothesis, setEditingHypothesis] = useState<ValueHypothesis | null>(null);

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: hypotheses = [] } = useQuery<ValueHypothesis[]>({
    queryKey: [`/api/projects/${projectId}/value-hypotheses`],
  });

  const { data: insights = [] } = useQuery<CompanyDataPoint[]>({
    queryKey: [`/api/projects/${projectId}/company-data`],
  });

  const { data: finalizedData } = useQuery<FinalizedJobsResponse>({
    queryKey: [`/api/projects/${projectId}/alignment/finalized-jobs`],
    enabled: !!projectId,
  });

  const draftHypotheses = hypotheses.filter(h => h.status === "draft");
  const sentHypotheses = hypotheses.filter(h => h.status === "sent");
  const approvedHypotheses = hypotheses.filter(h => h.status === "approved");

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

  const handleCreate = () => {
    setEditingHypothesis(null);
    setIsBuilderOpen(true);
  };

  const handleEdit = (hypothesis: ValueHypothesis) => {
    setEditingHypothesis(hypothesis);
    setIsBuilderOpen(true);
  };

  const handleClose = () => {
    setIsBuilderOpen(false);
    setEditingHypothesis(null);
  };

  if (!project) {
    return <div className="p-6">Loading project...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold mb-1">
                Alignment Phase
              </h1>
              <p className="text-sm text-muted-foreground">
                Build and refine value hypotheses with {project.companyName}
              </p>
            </div>
            <Button 
              onClick={handleCreate}
              size="default"
              data-testid="button-create-hypothesis"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Value Hypothesis
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <Card className="no-default-hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Hypotheses</p>
                    <p className="text-2xl font-bold mt-1">{hypotheses.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="no-default-hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Draft</p>
                    <p className="text-2xl font-bold mt-1">{draftHypotheses.length}</p>
                  </div>
                  <Lightbulb className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="no-default-hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Sent</p>
                    <p className="text-2xl font-bold mt-1">{sentHypotheses.length}</p>
                  </div>
                  <Send className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="no-default-hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold mt-1">{approvedHypotheses.length}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Finalized Discovery Jobs */}
        {finalizedData && finalizedData.finalized && finalizedData.jobs.length > 0 && (
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
        )}

        {/* Value Hypotheses Section */}
        {hypotheses.length === 0 ? (
          <Card className="max-w-2xl mx-auto mt-12">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-center">Build Your First Value Hypothesis</CardTitle>
              <CardDescription className="text-center">
                Use insights from Discovery to create quantified value hypotheses.
                Select a Korn Ferry capability, input assumptions, and calculate financial impact.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-6">
              <Button onClick={handleCreate} data-testid="button-create-first-hypothesis">
                <Plus className="h-4 w-4 mr-2" />
                Create Value Hypothesis
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all" data-testid="tab-all">
                All ({hypotheses.length})
              </TabsTrigger>
              <TabsTrigger value="draft" data-testid="tab-draft">
                Draft ({draftHypotheses.length})
              </TabsTrigger>
              <TabsTrigger value="sent" data-testid="tab-sent">
                Sent ({sentHypotheses.length})
              </TabsTrigger>
              <TabsTrigger value="approved" data-testid="tab-approved">
                Approved ({approvedHypotheses.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid gap-4">
                {hypotheses.map(hypothesis => (
                  <ValueHypothesisCard
                    key={hypothesis.id}
                    hypothesis={hypothesis}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="draft" className="mt-6">
              <div className="grid gap-4">
                {draftHypotheses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">
                    No draft hypotheses
                  </p>
                ) : (
                  draftHypotheses.map(hypothesis => (
                    <ValueHypothesisCard
                      key={hypothesis.id}
                      hypothesis={hypothesis}
                      onEdit={handleEdit}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="sent" className="mt-6">
              <div className="grid gap-4">
                {sentHypotheses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">
                    No sent hypotheses
                  </p>
                ) : (
                  sentHypotheses.map(hypothesis => (
                    <ValueHypothesisCard
                      key={hypothesis.id}
                      hypothesis={hypothesis}
                      onEdit={handleEdit}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="approved" className="mt-6">
              <div className="grid gap-4">
                {approvedHypotheses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">
                    No approved hypotheses
                  </p>
                ) : (
                  approvedHypotheses.map(hypothesis => (
                    <ValueHypothesisCard
                      key={hypothesis.id}
                      hypothesis={hypothesis}
                      onEdit={handleEdit}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Value Hypothesis Builder Dialog */}
      {isBuilderOpen && (
        <ValueHypothesisBuilder
          projectId={projectId}
          insights={insights}
          hypothesis={editingHypothesis}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
