import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { 
  Plus, 
  TrendingUp,
  RefreshCw,
  Target as TargetIcon,
  ArrowRight,
  Briefcase,
  FileText,
  Check,
  Circle,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Loader2,
  Award,
  TrendingDown,
  Search
} from "lucide-react";
import type { Project, ValueCase, CompanyDataPoint, JobThemeKPI } from "@shared/schema";
import ValueCaseBuilder from "@/components/ValueCaseBuilder";
import ValueCaseCard from "@/components/ValueCaseCard";
import { ValueCaseCreationDialog } from "@/components/value-case-creation-dialog";
import { ReprioritizeDialog } from "@/components/ReprioritizeDialog";
import { ShareAlignmentDialog } from "@/components/ShareAlignmentDialog";
import { EvidenceDrawer } from "@/components/EvidenceDrawer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import KPIRecommendationDialog from "@/components/KPIRecommendationDialog";

type KPI = {
  id: number;
  kpiName: string;
  kpiType: "primary" | "supporting";
  unit: string;
  definition: string | null;
  baselineValue: string | null;
  baselineSource: string | null;
  baselineEnteredBy: string | null;
  baselineEnteredByName: string | null;
  targetValue: string | null;
  targetSource: string | null;
  targetEnteredBy: string | null;
  targetEnteredByName: string | null;
  benchmarkValue: string | null;
  benchmarkSource: string | null;
  customerComment: string | null;
  aiStrategicRationale: string | null;
  isSelected: boolean;
};

type JobWithKPIs = {
  id: number;
  jobName: string;
  capabilityName: string;
  solutionArea: string | null;
  priorityRank: number | null;
  aggregationSummary: string | null;
  evidenceCount: number;
  kpis: KPI[];
};

type FinalizedJobsResponse = {
  finalized: boolean;
  jobs: JobWithKPIs[];
  transferredAt: string | null;
};

type SelectedItem = 
  | { type: 'job'; id: number }
  | { type: 'valueCase'; id: number }
  | null;

export default function AlignmentPage() {
  const [, params] = useRoute("/projects/:id/alignment");
  const projectId = parseInt(params?.id || "0");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [isCreationDialogOpen, setIsCreationDialogOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isReprioritizeOpen, setIsReprioritizeOpen] = useState(false);
  const [editingValueCase, setEditingValueCase] = useState<ValueCase | null>(null);
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [activeRecommendationJob, setActiveRecommendationJob] = useState<JobWithKPIs | null>(null);

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: valueCases = [] } = useQuery<ValueCase[]>({
    queryKey: [`/api/projects/${projectId}/value-cases`],
  });

  const { data: insights = [] } = useQuery<CompanyDataPoint[]>({
    queryKey: [`/api/projects/${projectId}/company-data`],
  });

  const { data: finalizedData, isLoading: isLoadingJobs } = useQuery<FinalizedJobsResponse>({
    queryKey: [`/api/projects/${projectId}/alignment/finalized-jobs`],
    enabled: !!projectId,
  });

  const { data: allJobThemes = [] } = useQuery<JobWithKPIs[]>({
    queryKey: [`/api/projects/${projectId}/job-themes`],
    enabled: !!projectId,
  });

  const jobs = finalizedData?.jobs || [];

  // Auto-select first job when data loads
  useEffect(() => {
    if (jobs.length > 0 && !selectedItem) {
      setSelectedItem({ type: 'job', id: jobs[0].id });
    }
  }, [jobs, selectedItem]);

  const draftValueCases = valueCases.filter(h => h.status === "draft");
  const sentValueCases = valueCases.filter(h => h.status === "sent");
  const approvedValueCases = valueCases.filter(h => h.status === "approved");

  // Filter items by search
  const filteredJobs = jobs.filter(job => 
    job.jobName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.capabilityName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredValueCases = valueCases.filter(vc =>
    vc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mutation to update KPI baseline/target values
  const updateKPIMutation = useMutation({
    mutationFn: async ({ kpiId, data }: { kpiId: number; data: Partial<KPI> }) => {
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

  // Get selected job or value case
  const selectedJob = selectedItem?.type === 'job' 
    ? jobs.find(j => j.id === selectedItem.id) 
    : null;
  const selectedValueCase = selectedItem?.type === 'valueCase'
    ? valueCases.find(vc => vc.id === selectedItem.id)
    : null;

  // Calculate job completion
  const getJobCompletion = (job: JobWithKPIs) => {
    const selectedKPIs = job.kpis.filter(k => k.isSelected);
    const completedKPIs = selectedKPIs.filter(k => k.baselineValue && k.targetValue);
    return {
      completed: completedKPIs.length,
      total: selectedKPIs.length,
      percentage: selectedKPIs.length > 0 ? Math.round((completedKPIs.length / selectedKPIs.length) * 100) : 0
    };
  };

  // Calculate overall metrics
  const allKPIs = jobs.flatMap(job => job.kpis.filter(k => k.isSelected));
  const completedKPIs = allKPIs.filter(k => k.baselineValue && k.targetValue);
  const overallCompletion = allKPIs.length > 0 ? Math.round((completedKPIs.length / allKPIs.length) * 100) : 0;

  // Check if ready for realization
  const hasReadyKPIs = jobs.some((job: JobWithKPIs) => 
    job.kpis && job.kpis.some((kpi: KPI) => 
      kpi.isSelected && kpi.baselineValue && kpi.targetValue
    )
  );

  if (!project) {
    return <div className="p-6">Loading project...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Compact Header */}
      <div className="border-b bg-card shrink-0">
        <div className="p-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-lg font-semibold">Alignment</h1>
                <p className="text-xs text-muted-foreground">
                  {project.companyName} • {overallCompletion}% complete
                </p>
              </div>
              {/* Progress indicator */}
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: `${overallCompletion}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{completedKPIs.length}/{allKPIs.length} KPIs</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <EvidenceDrawer projectId={projectId} />
              {finalizedData && finalizedData.jobs.length > 0 && (
                <Button 
                  onClick={() => setIsReprioritizeOpen(true)}
                  size="sm"
                  variant="outline"
                  data-testid="button-reprioritize-jobs"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Re-prioritize
                </Button>
              )}
              <ShareAlignmentDialog projectId={projectId} />
              <Button 
                onClick={handleCreate}
                size="sm"
                data-testid="button-create-value-case"
              >
                <Plus className="h-4 w-4 mr-2" />
                Value Case
              </Button>
              {hasReadyKPIs && project.currentPhase === "alignment" && (
                <Button 
                  size="sm"
                  variant="default"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => startTrackingMutation.mutate()}
                  disabled={startTrackingMutation.isPending}
                  data-testid="button-start-tracking-realization"
                >
                  {startTrackingMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  Start Tracking
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Master-Detail Layout */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Master Panel - List */}
          <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
            <div className="h-full flex flex-col border-r">
              {/* Search */}
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs & cases..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                    data-testid="input-search-alignment"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-2 space-y-4">
                  {/* Jobs Section */}
                  <div>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5" />
                      Priority Jobs ({filteredJobs.length})
                    </div>
                    <div className="space-y-1">
                      {isLoadingJobs ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                          <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                          Loading jobs...
                        </div>
                      ) : filteredJobs.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                          No finalized jobs yet
                        </div>
                      ) : (
                        filteredJobs.map((job, index) => {
                          const completion = getJobCompletion(job);
                          const isSelected = selectedItem?.type === 'job' && selectedItem.id === job.id;
                          
                          return (
                            <button
                              key={job.id}
                              onClick={() => setSelectedItem({ type: 'job', id: job.id })}
                              className={`w-full text-left p-3 rounded-md transition-colors ${
                                isSelected 
                                  ? 'bg-primary/10 border border-primary/30' 
                                  : 'hover-elevate'
                              }`}
                              data-testid={`button-select-job-${job.id}`}
                            >
                              <div className="flex items-start gap-2">
                                <Badge variant="outline" className="shrink-0 text-xs">
                                  #{index + 1}
                                </Badge>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    {job.jobName}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {job.capabilityName}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  {completion.percentage === 100 ? (
                                    <Check className="w-4 h-4 text-emerald-500" />
                                  ) : completion.percentage > 0 ? (
                                    <div className="w-4 h-4 relative">
                                      <Circle className="w-4 h-4 text-muted-foreground/30" />
                                      <div 
                                        className="absolute inset-0 w-4 h-4 rounded-full border-2 border-primary"
                                        style={{ 
                                          clipPath: `polygon(0 0, 100% 0, 100% ${completion.percentage}%, 0 ${completion.percentage}%)`
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-amber-500" />
                                  )}
                                </div>
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full transition-all ${
                                      completion.percentage === 100 ? 'bg-emerald-500' : 'bg-primary'
                                    }`}
                                    style={{ width: `${completion.percentage}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {completion.completed}/{completion.total}
                                </span>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Value Cases Section */}
                  <div>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" />
                      Value Cases ({filteredValueCases.length})
                    </div>
                    <div className="space-y-1">
                      {filteredValueCases.length === 0 ? (
                        <button
                          onClick={handleCreate}
                          className="w-full p-3 rounded-md border border-dashed text-center text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                          data-testid="button-create-first-value-case-sidebar"
                        >
                          <Plus className="w-4 h-4 mx-auto mb-1" />
                          Create Value Case
                        </button>
                      ) : (
                        filteredValueCases.map((valueCase) => {
                          const isSelected = selectedItem?.type === 'valueCase' && selectedItem.id === valueCase.id;
                          
                          return (
                            <button
                              key={valueCase.id}
                              onClick={() => setSelectedItem({ type: 'valueCase', id: valueCase.id })}
                              className={`w-full text-left p-3 rounded-md transition-colors ${
                                isSelected 
                                  ? 'bg-primary/10 border border-primary/30' 
                                  : 'hover-elevate'
                              }`}
                              data-testid={`button-select-value-case-${valueCase.id}`}
                            >
                              <div className="flex items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    {valueCase.title}
                                  </p>
                                </div>
                                <Badge 
                                  variant={
                                    valueCase.status === 'approved' ? 'default' :
                                    valueCase.status === 'sent' ? 'secondary' : 'outline'
                                  }
                                  className="shrink-0 text-xs"
                                >
                                  {valueCase.status}
                                </Badge>
                              </div>
                              {valueCase.estimatedNPV && (
                                <p className="text-xs text-emerald-600 mt-1">
                                  {valueCase.estimatedNPV}
                                </p>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Detail Panel */}
          <ResizablePanel defaultSize={70}>
            <ScrollArea className="h-full">
              <div className="p-6">
                {!selectedItem ? (
                  // Empty state
                  <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                    <div className="text-center">
                      <TargetIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-lg font-medium">Select an item</p>
                      <p className="text-sm text-muted-foreground">
                        Choose a job or value case from the list to view details
                      </p>
                    </div>
                  </div>
                ) : selectedJob ? (
                  // Job Detail View
                  <JobDetailView 
                    job={selectedJob}
                    projectId={projectId}
                    updateKPIMutation={updateKPIMutation}
                    onShowRecommendations={() => {
                      setActiveRecommendationJob(selectedJob);
                      setShowRecommendations(true);
                    }}
                  />
                ) : selectedValueCase ? (
                  // Value Case Detail View
                  <div className="space-y-6">
                    {/* Value Case Header */}
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-xl font-semibold">{selectedValueCase.title}</h2>
                          <Badge 
                            variant={
                              selectedValueCase.status === 'approved' ? 'default' :
                              selectedValueCase.status === 'sent' ? 'secondary' : 'outline'
                            }
                          >
                            {selectedValueCase.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {selectedValueCase.capabilityName}
                          {selectedValueCase.solutionArea && ` • ${selectedValueCase.solutionArea}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(selectedValueCase)}
                          data-testid={`button-edit-value-case-${selectedValueCase.id}`}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                    
                    {/* Value Case Card with full details */}
                    <ValueCaseCard
                      valueCase={selectedValueCase}
                      onEdit={handleEdit}
                    />
                  </div>
                ) : null}
              </div>
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Dialogs */}
      <ValueCaseCreationDialog 
        open={isCreationDialogOpen}
        onOpenChange={setIsCreationDialogOpen}
        projectId={projectId}
      />

      {isBuilderOpen && (
        <ValueCaseBuilder
          projectId={projectId}
          insights={insights}
          valueCase={editingValueCase}
          onClose={handleClose}
        />
      )}

      <ReprioritizeDialog
        open={isReprioritizeOpen}
        onOpenChange={setIsReprioritizeOpen}
        projectId={projectId}
        currentJobs={finalizedData?.jobs || []}
        allJobs={allJobThemes}
      />

      {activeRecommendationJob && (
        <KPIRecommendationDialog
          jobThemeId={activeRecommendationJob.id}
          jobName={activeRecommendationJob.jobName}
          projectId={projectId}
          open={showRecommendations}
          onOpenChange={(open) => {
            setShowRecommendations(open);
            if (!open) setActiveRecommendationJob(null);
          }}
        />
      )}
    </div>
  );
}

// Job Detail View Component
interface JobDetailViewProps {
  job: JobWithKPIs;
  projectId: number;
  updateKPIMutation: any;
  onShowRecommendations: () => void;
}

function JobDetailView({ job, projectId, updateKPIMutation, onShowRecommendations }: JobDetailViewProps) {
  const selectedKPIs = job.kpis.filter(k => k.isSelected);
  const completedKPIs = selectedKPIs.filter(k => k.baselineValue && k.targetValue);
  const completionPercentage = selectedKPIs.length > 0 
    ? Math.round((completedKPIs.length / selectedKPIs.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Job Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold">{job.jobName}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {job.capabilityName} {job.solutionArea && `• ${job.solutionArea}`}
          </p>
          {job.aggregationSummary && (
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              {job.aggregationSummary}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onShowRecommendations}
            className="gap-2"
            data-testid={`button-recommend-kpis-${job.id}`}
          >
            <Sparkles className="h-4 w-4" />
            Suggest KPIs
          </Button>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {completedKPIs.length}/{selectedKPIs.length}
            </div>
            <div className="text-xs text-muted-foreground">KPIs Ready</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Alignment Progress</span>
          <span className="font-semibold">{completionPercentage}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* KPI Table */}
      {selectedKPIs.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-primary/20 bg-muted/30">
                    <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      KPI Metric
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Current (Baseline)
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <ArrowRight className="w-4 h-4 mx-auto" />
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Target (Desired)
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Gap & Benefit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedKPIs.map((kpi, index) => (
                    <KPIRow 
                      key={kpi.id} 
                      kpi={kpi} 
                      index={index}
                      updateKPIMutation={updateKPIMutation} 
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <TargetIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No KPIs selected for this job in Discovery phase</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onShowRecommendations}
              className="mt-4 gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Get AI KPI Suggestions
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// KPI Row Component
interface KPIRowProps {
  kpi: KPI;
  index: number;
  updateKPIMutation: any;
}

function KPIRow({ kpi, index, updateKPIMutation }: KPIRowProps) {
  const { toast } = useToast();
  const [isGeneratingBenchmark, setIsGeneratingBenchmark] = useState(false);
  
  const [localBaselineValue, setLocalBaselineValue] = useState(kpi.baselineValue || "");
  const [localTargetValue, setLocalTargetValue] = useState(kpi.targetValue || "");
  const [localTargetSource, setLocalTargetSource] = useState(kpi.targetSource || "");
  
  useEffect(() => {
    setLocalBaselineValue(kpi.baselineValue || "");
  }, [kpi.baselineValue]);
  
  useEffect(() => {
    setLocalTargetValue(kpi.targetValue || "");
  }, [kpi.targetValue]);
  
  useEffect(() => {
    setLocalTargetSource(kpi.targetSource || "");
  }, [kpi.targetSource]);
  
  const baselineNum = parseFloat(localBaselineValue || "0");
  const targetNum = parseFloat(localTargetValue || "0");
  const hasValues = localBaselineValue && localTargetValue;
  
  const gap = hasValues ? Math.abs(targetNum - baselineNum) : 0;
  const improvement = hasValues && baselineNum > 0 
    ? ((targetNum - baselineNum) / baselineNum * 100)
    : 0;
  const isImproving = improvement > 0;

  const generateAIBenchmark = async () => {
    setIsGeneratingBenchmark(true);
    try {
      const response = await fetch(`/api/job-theme-kpis/${kpi.id}/generate-benchmark`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate benchmark");
      }
      
      const data = await response.json();
      
      setLocalBaselineValue(data.benchmarkValue);
      updateKPIMutation.mutate({
        kpiId: kpi.id,
        data: {
          baselineValue: data.benchmarkValue,
          baselineSource: `AI: ${data.source}`
        }
      });
      
      toast({
        title: "AI Benchmark Generated",
        description: data.rationale,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Could not generate benchmark",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingBenchmark(false);
    }
  };

  return (
    <tr 
      className={`border-b border-muted ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
      data-testid={`kpi-row-${kpi.id}`}
    >
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm" data-testid={`text-kpi-name-${kpi.id}`}>
              {kpi.kpiName}
            </span>
            <Badge variant={kpi.kpiType === "primary" ? "default" : "secondary"} className="text-xs">
              {kpi.kpiType}
            </Badge>
          </div>
          {kpi.definition && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {kpi.definition}
            </p>
          )}
          {kpi.benchmarkValue && (
            <div className="flex items-center gap-1 text-xs text-primary mt-1">
              <Award className="w-3 h-3" />
              <span>KF Benchmark: {kpi.benchmarkValue} {kpi.unit}</span>
            </div>
          )}
        </div>
      </td>

      <td className="px-4 py-4">
        <div className="space-y-2 min-w-[180px]">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder={`Enter ${kpi.unit}`}
              value={localBaselineValue}
              onChange={(e) => setLocalBaselineValue(e.target.value)}
              onBlur={(e) => {
                if (e.target.value !== kpi.baselineValue) {
                  updateKPIMutation.mutate({
                    kpiId: kpi.id,
                    data: { baselineValue: e.target.value }
                  });
                }
              }}
              className="text-sm font-semibold"
              data-testid={`input-baseline-${kpi.id}`}
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">{kpi.unit}</span>
          </div>
          {kpi.baselineEnteredBy === "customer" && kpi.baselineEnteredByName && (
            <Badge variant="secondary" className="text-xs">
              by {kpi.baselineEnteredByName}
            </Badge>
          )}
          <Button
            onClick={generateAIBenchmark}
            disabled={isGeneratingBenchmark}
            variant="ghost"
            size="sm"
            className="w-full h-7 text-xs gap-1"
            data-testid={`button-generate-benchmark-${kpi.id}`}
          >
            {isGeneratingBenchmark ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            {isGeneratingBenchmark ? "Generating..." : "AI Suggest"}
          </Button>
        </div>
      </td>

      <td className="px-4 py-4">
        <div className="flex justify-center">
          <div className={`rounded-full p-2 ${hasValues ? 'bg-primary/10' : 'bg-muted/30'}`}>
            <ArrowRight className={`w-4 h-4 ${hasValues ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
        </div>
      </td>

      <td className="px-4 py-4">
        <div className="space-y-2 min-w-[180px]">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder={`Target ${kpi.unit}`}
              value={localTargetValue}
              onChange={(e) => setLocalTargetValue(e.target.value)}
              onBlur={(e) => {
                if (e.target.value !== kpi.targetValue) {
                  updateKPIMutation.mutate({
                    kpiId: kpi.id,
                    data: { targetValue: e.target.value }
                  });
                }
              }}
              className="text-sm font-semibold"
              data-testid={`input-target-${kpi.id}`}
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">{kpi.unit}</span>
          </div>
          {kpi.targetEnteredBy === "customer" && kpi.targetEnteredByName && (
            <Badge variant="secondary" className="text-xs">
              by {kpi.targetEnteredByName}
            </Badge>
          )}
          {kpi.customerComment && (
            <div className="bg-muted/50 p-2 rounded-md mt-2">
              <p className="text-xs font-medium mb-0.5">Customer Note:</p>
              <p className="text-xs text-muted-foreground">{kpi.customerComment}</p>
            </div>
          )}
          <Input
            type="text"
            placeholder="Rationale..."
            value={localTargetSource}
            onChange={(e) => setLocalTargetSource(e.target.value)}
            onBlur={(e) => {
              if (e.target.value !== kpi.targetSource) {
                updateKPIMutation.mutate({
                  kpiId: kpi.id,
                  data: { targetSource: e.target.value }
                });
              }
            }}
            className="text-xs h-7"
            data-testid={`input-target-source-${kpi.id}`}
          />
        </div>
      </td>

      <td className="px-6 py-4">
        {hasValues ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`rounded-md px-3 py-1.5 ${isImproving ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
                <div className="text-sm font-bold flex items-center gap-1">
                  {isImproving ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-orange-600" />
                  )}
                  <span className={isImproving ? 'text-emerald-700 dark:text-emerald-400' : 'text-orange-700 dark:text-orange-400'}>
                    {gap.toFixed(1)} {kpi.unit}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  gap to close
                </div>
              </div>
            </div>

            <div className={`rounded-md px-3 py-1.5 ${isImproving ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'}`}>
              <div className="text-lg font-bold">
                {isImproving ? '+' : ''}{improvement.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                improvement if achieved
              </div>
            </div>

            <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
              <div 
                className={`absolute top-0 left-0 h-full rounded-full ${
                  isImproving ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-orange-500 to-orange-400'
                }`}
                style={{ width: `${Math.min(100, Math.abs(improvement))}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground italic">
              Enter baseline & target<br/>to see benefit
            </p>
          </div>
        )}
      </td>
    </tr>
  );
}
