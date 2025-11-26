import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Plus, 
  TrendingUp,
  RefreshCw,
  Target as TargetIcon,
  ArrowRight,
  Briefcase,
  FileText,
  Check,
  ChevronDown,
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

      {/* Clean Two-Column Layout */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left Sidebar - Tabbed Navigation */}
        <div className="w-72 shrink-0 border-r bg-muted/20 flex flex-col">
          <Tabs defaultValue="jobs" className="flex-1 flex flex-col">
            <div className="p-4 border-b">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="jobs" className="gap-2" data-testid="tab-jobs">
                  <Briefcase className="w-4 h-4" />
                  Jobs ({filteredJobs.length})
                </TabsTrigger>
                <TabsTrigger value="cases" className="gap-2" data-testid="tab-value-cases">
                  <FileText className="w-4 h-4" />
                  Cases ({filteredValueCases.length})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Search */}
            <div className="px-4 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                  data-testid="input-search-alignment"
                />
              </div>
            </div>

            {/* Jobs Tab */}
            <TabsContent value="jobs" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-2">
                  {isLoadingJobs ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-3" />
                      Loading jobs...
                    </div>
                  ) : filteredJobs.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
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
                          className={`w-full text-left p-4 rounded-lg transition-all ${
                            isSelected 
                              ? 'bg-primary text-primary-foreground shadow-md' 
                              : 'bg-background hover-elevate border'
                          }`}
                          data-testid={`button-select-job-${job.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {job.jobName}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-1 bg-muted/50 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full transition-all ${
                                      isSelected 
                                        ? 'bg-primary-foreground/60'
                                        : completion.percentage === 100 ? 'bg-emerald-500' : 'bg-primary/60'
                                    }`}
                                    style={{ width: `${completion.percentage}%` }}
                                  />
                                </div>
                                <span className={`text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                  {completion.completed}/{completion.total}
                                </span>
                              </div>
                            </div>
                            {completion.percentage === 100 && (
                              <Check className={`w-4 h-4 shrink-0 ${isSelected ? 'text-primary-foreground' : 'text-emerald-500'}`} />
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Value Cases Tab */}
            <TabsContent value="cases" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-2">
                  {filteredValueCases.length === 0 ? (
                    <button
                      onClick={handleCreate}
                      className="w-full p-6 rounded-lg border-2 border-dashed text-center text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                      data-testid="button-create-first-value-case-sidebar"
                    >
                      <Plus className="w-6 h-6 mx-auto mb-2" />
                      Create Value Case
                    </button>
                  ) : (
                    filteredValueCases.map((valueCase) => {
                      const isSelected = selectedItem?.type === 'valueCase' && selectedItem.id === valueCase.id;
                      
                      return (
                        <button
                          key={valueCase.id}
                          onClick={() => setSelectedItem({ type: 'valueCase', id: valueCase.id })}
                          className={`w-full text-left p-4 rounded-lg transition-all ${
                            isSelected 
                              ? 'bg-primary text-primary-foreground shadow-md' 
                              : 'bg-background hover-elevate border'
                          }`}
                          data-testid={`button-select-value-case-${valueCase.id}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm">
                              {valueCase.title}
                            </p>
                            <Badge 
                              variant={isSelected ? "secondary" : (
                                valueCase.status === 'approved' ? 'default' :
                                valueCase.status === 'sent' ? 'secondary' : 'outline'
                              )}
                              className="shrink-0 text-xs"
                            >
                              {valueCase.status}
                            </Badge>
                          </div>
                          {valueCase.estimatedNPV && (
                            <p className={`text-xs mt-2 ${isSelected ? 'text-primary-foreground/80' : 'text-emerald-600'}`}>
                              {valueCase.estimatedNPV}
                            </p>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-8 max-w-4xl mx-auto">
              {!selectedItem ? (
                <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                  <div className="text-center">
                    <TargetIcon className="w-16 h-16 mx-auto mb-6 text-muted-foreground/30" />
                    <p className="text-xl font-medium">Select an item</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Choose a job or value case from the sidebar
                    </p>
                  </div>
                </div>
              ) : selectedJob ? (
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
                <div className="space-y-8">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-semibold">{selectedValueCase.title}</h2>
                        <Badge 
                          variant={
                            selectedValueCase.status === 'approved' ? 'default' :
                            selectedValueCase.status === 'sent' ? 'secondary' : 'outline'
                          }
                        >
                          {selectedValueCase.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">
                        {selectedValueCase.capabilityName}
                        {selectedValueCase.solutionArea && ` • ${selectedValueCase.solutionArea}`}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(selectedValueCase)}
                      data-testid={`button-edit-value-case-${selectedValueCase.id}`}
                    >
                      Edit
                    </Button>
                  </div>
                  <ValueCaseCard
                    valueCase={selectedValueCase}
                    onEdit={handleEdit}
                  />
                </div>
              ) : null}
            </div>
          </ScrollArea>
        </div>
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
  const [primaryOpen, setPrimaryOpen] = useState(true);
  const [supportingOpen, setSupportingOpen] = useState(true);
  
  const selectedKPIs = job.kpis.filter(k => k.isSelected);
  const primaryKPIs = selectedKPIs.filter(k => k.kpiType === "primary");
  const supportingKPIs = selectedKPIs.filter(k => k.kpiType === "supporting");
  const completedKPIs = selectedKPIs.filter(k => k.baselineValue && k.targetValue);
  const completionPercentage = selectedKPIs.length > 0 
    ? Math.round((completedKPIs.length / selectedKPIs.length) * 100) 
    : 0;

  return (
    <div className="space-y-8">
      {/* Clean Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-2">{job.jobName}</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="outline">{job.capabilityName}</Badge>
          {job.solutionArea && (
            <Badge variant="secondary">{job.solutionArea}</Badge>
          )}
        </div>
        {job.aggregationSummary && (
          <p className="text-muted-foreground mt-4 leading-relaxed">
            {job.aggregationSummary}
          </p>
        )}
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-6 p-4 rounded-lg bg-muted/30 border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">{completedKPIs.length}/{selectedKPIs.length}</span>
          </div>
          <div>
            <p className="text-sm font-medium">KPIs Ready</p>
            <p className="text-xs text-muted-foreground">{completionPercentage}% complete</p>
          </div>
        </div>
        <div className="flex-1 max-w-xs">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
        <Button
          variant="outline"
          onClick={onShowRecommendations}
          className="gap-2 ml-auto"
          data-testid={`button-recommend-kpis-${job.id}`}
        >
          <Sparkles className="h-4 w-4" />
          Suggest KPIs
        </Button>
      </div>

      {/* KPI Cards Section */}
      {selectedKPIs.length > 0 ? (
        <div className="space-y-6">
          {/* Primary KPIs */}
          {primaryKPIs.length > 0 && (
            <Collapsible open={primaryOpen} onOpenChange={setPrimaryOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 w-full text-left py-2 group">
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${primaryOpen ? '' : '-rotate-90'}`} />
                <span className="font-semibold">Primary KPIs</span>
                <Badge variant="default" className="ml-2">{primaryKPIs.length}</Badge>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <div className="space-y-4">
                  {primaryKPIs.map((kpi) => (
                    <KPICard 
                      key={kpi.id} 
                      kpi={kpi} 
                      updateKPIMutation={updateKPIMutation} 
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Supporting KPIs */}
          {supportingKPIs.length > 0 && (
            <Collapsible open={supportingOpen} onOpenChange={setSupportingOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 w-full text-left py-2 group">
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${supportingOpen ? '' : '-rotate-90'}`} />
                <span className="font-semibold">Supporting KPIs</span>
                <Badge variant="secondary" className="ml-2">{supportingKPIs.length}</Badge>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <div className="space-y-4">
                  {supportingKPIs.map((kpi) => (
                    <KPICard 
                      key={kpi.id} 
                      kpi={kpi} 
                      updateKPIMutation={updateKPIMutation} 
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <TargetIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-lg font-medium mb-2">No KPIs selected</p>
            <p className="text-muted-foreground mb-6">Add KPIs to track progress for this job</p>
            <Button
              variant="default"
              onClick={onShowRecommendations}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Get AI Suggestions
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// KPI Card Component - Clean card-based layout
interface KPICardProps {
  kpi: KPI;
  updateKPIMutation: any;
}

function KPICard({ kpi, updateKPIMutation }: KPICardProps) {
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
  const isComplete = hasValues;

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
    <Card 
      className={`transition-all ${isComplete ? 'border-emerald-200 dark:border-emerald-800' : ''}`}
      data-testid={`kpi-card-${kpi.id}`}
    >
      <CardContent className="p-6">
        {/* KPI Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg" data-testid={`text-kpi-name-${kpi.id}`}>
                {kpi.kpiName}
              </h3>
              {isComplete && (
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            {kpi.definition && (
              <p className="text-sm text-muted-foreground">
                {kpi.definition}
              </p>
            )}
          </div>
          <Badge variant="outline" className="shrink-0">{kpi.unit}</Badge>
        </div>

        {/* Benchmark hint */}
        {kpi.benchmarkValue && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/5 border border-primary/20 mb-6">
            <Award className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm">
              <span className="text-muted-foreground">Korn Ferry Benchmark:</span>{" "}
              <span className="font-semibold">{kpi.benchmarkValue} {kpi.unit}</span>
            </span>
          </div>
        )}

        {/* Two Column Layout: Baseline & Target */}
        <div className="grid grid-cols-2 gap-6">
          {/* Baseline Column */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">Current (Baseline)</label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder={`Enter value`}
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
                className="text-base font-semibold"
                data-testid={`input-baseline-${kpi.id}`}
              />
            </div>
            {kpi.baselineEnteredBy === "customer" && kpi.baselineEnteredByName && (
              <Badge variant="secondary" className="text-xs">
                by {kpi.baselineEnteredByName}
              </Badge>
            )}
            <Button
              onClick={generateAIBenchmark}
              disabled={isGeneratingBenchmark}
              variant="outline"
              size="sm"
              className="w-full gap-2"
              data-testid={`button-generate-benchmark-${kpi.id}`}
            >
              {isGeneratingBenchmark ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {isGeneratingBenchmark ? "Generating..." : "AI Suggest Baseline"}
            </Button>
          </div>

          {/* Target Column */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">Target (Desired)</label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder={`Enter target`}
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
                className="text-base font-semibold"
                data-testid={`input-target-${kpi.id}`}
              />
            </div>
            {kpi.targetEnteredBy === "customer" && kpi.targetEnteredByName && (
              <Badge variant="secondary" className="text-xs">
                by {kpi.targetEnteredByName}
              </Badge>
            )}
            <Input
              type="text"
              placeholder="Rationale for target..."
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
              className="text-sm"
              data-testid={`input-target-source-${kpi.id}`}
            />
          </div>
        </div>

        {/* Customer Comment */}
        {kpi.customerComment && (
          <div className="mt-4 p-3 rounded-md bg-muted/50 border">
            <p className="text-xs font-medium mb-1">Customer Note:</p>
            <p className="text-sm text-muted-foreground">{kpi.customerComment}</p>
          </div>
        )}

        {/* Impact Summary - only show when both values are set */}
        {hasValues && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                  isImproving ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-orange-50 dark:bg-orange-900/20'
                }`}>
                  {isImproving ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-orange-600" />
                  )}
                  <span className={`font-semibold ${isImproving ? 'text-emerald-700 dark:text-emerald-400' : 'text-orange-700 dark:text-orange-400'}`}>
                    {gap.toFixed(1)} {kpi.unit} gap
                  </span>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${isImproving ? 'text-emerald-600' : 'text-orange-600'}`}>
                    {isImproving ? '+' : ''}{improvement.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">improvement</div>
                </div>
              </div>
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    isImproving ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-orange-500 to-orange-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.abs(improvement))}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
