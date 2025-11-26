import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
import ValueJustificationStudio from "@/components/ValueJustificationStudio";

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
      {/* Clean Minimal Header */}
      <motion.div 
        className="border-b bg-background shrink-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold tracking-tight">Alignment</h1>
                  <div className="h-5 w-px bg-border" />
                  <span className="text-sm text-muted-foreground">{project.companyName}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <EvidenceDrawer projectId={projectId} />
              {finalizedData && finalizedData.jobs.length > 0 && (
                <Button 
                  onClick={() => setIsReprioritizeOpen(true)}
                  size="sm"
                  variant="ghost"
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
                variant="outline"
                data-testid="button-create-value-case"
              >
                <Plus className="h-4 w-4 mr-2" />
                Value Case
              </Button>
              {hasReadyKPIs && project.currentPhase === "alignment" && (
                <Button 
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => startTrackingMutation.mutate()}
                  disabled={startTrackingMutation.isPending}
                  data-testid="button-start-tracking-realization"
                >
                  {startTrackingMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  Start Realization
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Clean Two-Column Layout */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left Sidebar - Clean List */}
        <div className="w-80 shrink-0 border-r bg-muted/30 flex flex-col">
          <Tabs defaultValue="jobs" className="flex-1 flex flex-col">
            <div className="px-4 pt-4 pb-3 space-y-3">
              <TabsList className="grid w-full grid-cols-2 h-9">
                <TabsTrigger value="jobs" className="text-xs gap-1.5" data-testid="tab-priorities">
                  <Briefcase className="w-3.5 h-3.5" />
                  Priorities ({filteredJobs.length})
                </TabsTrigger>
                <TabsTrigger value="cases" className="text-xs gap-1.5" data-testid="tab-value-cases">
                  <FileText className="w-3.5 h-3.5" />
                  Value Cases ({filteredValueCases.length})
                </TabsTrigger>
              </TabsList>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-background/60 border-0 focus-visible:ring-1"
                  data-testid="input-search-alignment"
                />
              </div>
            </div>

            {/* Priorities Tab */}
            <TabsContent value="jobs" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="px-3 pb-4">
                  <p className="text-xs text-muted-foreground mb-3 px-1">
                    Key initiatives from Discovery. Set baseline and target KPIs.
                  </p>
                  <div className="space-y-1">
                  {isLoadingJobs ? (
                    <div className="p-12 text-center text-muted-foreground text-sm">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-3" />
                      Loading...
                    </div>
                  ) : filteredJobs.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground text-sm">
                      No finalized jobs yet
                    </div>
                  ) : (
                    filteredJobs.map((job, index) => {
                      const completion = getJobCompletion(job);
                      const isSelected = selectedItem?.type === 'job' && selectedItem.id === job.id;
                      const isComplete = completion.percentage === 100;
                      
                      return (
                        <motion.button
                          key={job.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.15, delay: index * 0.03 }}
                          onClick={() => setSelectedItem({ type: 'job', id: job.id })}
                          className={`w-full text-left px-3 py-3 rounded-lg transition-all group ${
                            isSelected 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-background/80'
                          }`}
                          data-testid={`button-select-job-${job.id}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 ${
                              isSelected 
                                ? 'bg-primary-foreground/20 text-primary-foreground' 
                                : isComplete 
                                  ? 'bg-emerald-500/10 text-emerald-600' 
                                  : 'bg-muted text-muted-foreground'
                            }`}>
                              {isComplete ? <Check className="w-3.5 h-3.5" /> : index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium leading-tight ${isSelected ? '' : 'text-foreground'}`}>
                                {job.jobName}
                              </p>
                              <p className={`text-xs mt-1 ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                {completion.completed}/{completion.total} KPIs ready
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })
                  )}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Value Cases Tab */}
            <TabsContent value="cases" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="px-3 pb-4">
                  <p className="text-xs text-muted-foreground mb-3 px-1">
                    Business justifications with ROI projections for stakeholders.
                  </p>
                  <div className="space-y-1">
                  {filteredValueCases.length === 0 ? (
                    <button
                      onClick={handleCreate}
                      className="w-full p-8 rounded-lg border border-dashed text-center text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                      data-testid="button-create-first-value-case-sidebar"
                    >
                      <Plus className="w-5 h-5 mx-auto mb-2" />
                      Create Value Case
                    </button>
                  ) : (
                    filteredValueCases.map((valueCase, index) => {
                      const isSelected = selectedItem?.type === 'valueCase' && selectedItem.id === valueCase.id;
                      
                      return (
                        <motion.button
                          key={valueCase.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.15, delay: index * 0.03 }}
                          onClick={() => setSelectedItem({ type: 'valueCase', id: valueCase.id })}
                          className={`w-full text-left px-3 py-3 rounded-lg transition-all ${
                            isSelected 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-background/80'
                          }`}
                          data-testid={`button-select-value-case-${valueCase.id}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected ? 'bg-primary-foreground/20' : 'bg-muted'
                            }`}>
                              <FileText className={`w-3.5 h-3.5 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium leading-tight ${isSelected ? '' : 'text-foreground'}`}>
                                {valueCase.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                  {valueCase.status}
                                </span>
                                {valueCase.estimatedNPV && (
                                  <>
                                    <span className={`text-xs ${isSelected ? 'text-primary-foreground/50' : 'text-muted-foreground/50'}`}>•</span>
                                    <span className={`text-xs ${isSelected ? 'text-primary-foreground/70' : 'text-emerald-600'}`}>
                                      {valueCase.estimatedNPV}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })
                  )}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden bg-background">
          <ScrollArea className="h-full">
            <div className="p-8 max-w-3xl">
              <AnimatePresence mode="wait">
                {!selectedItem ? (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center h-[calc(100vh-200px)]"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
                        <TargetIcon className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <p className="text-lg font-medium">Select a priority or case</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Choose from the sidebar to view details
                      </p>
                    </div>
                  </motion.div>
                ) : selectedJob ? (
                  <motion.div
                    key={`job-${selectedJob.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <JobDetailView 
                      job={selectedJob}
                      projectId={projectId}
                      updateKPIMutation={updateKPIMutation}
                      onShowRecommendations={() => {
                        setActiveRecommendationJob(selectedJob);
                        setShowRecommendations(true);
                      }}
                    />
                  </motion.div>
                ) : selectedValueCase ? (
                  <motion.div 
                    key={`case-${selectedValueCase.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold tracking-tight">{selectedValueCase.title}</h2>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant={
                              selectedValueCase.status === 'approved' ? 'default' :
                              selectedValueCase.status === 'sent' ? 'secondary' : 'outline'
                            }
                          >
                            {selectedValueCase.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {selectedValueCase.capabilityName}
                            {selectedValueCase.solutionArea && ` • ${selectedValueCase.solutionArea}`}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
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
                  </motion.div>
                ) : null}
              </AnimatePresence>
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight mb-3">{job.jobName}</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="font-normal">{job.capabilityName}</Badge>
          {job.solutionArea && (
            <Badge variant="outline" className="font-normal">{job.solutionArea}</Badge>
          )}
        </div>
        {job.aggregationSummary && (
          <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
            {job.aggregationSummary}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-4 py-4 border-y">
        <div className="flex items-center gap-3 min-w-fit">
          <div className="text-2xl font-semibold tabular-nums">
            {completedKPIs.length}<span className="text-muted-foreground font-normal">/{selectedKPIs.length}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            KPIs<br />ready
          </div>
        </div>
        <div className="flex-1">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onShowRecommendations}
          className="gap-2"
          data-testid={`button-recommend-kpis-${job.id}`}
        >
          <Sparkles className="h-4 w-4" />
          Suggest KPIs
        </Button>
      </div>

      {/* KPI List */}
      {selectedKPIs.length > 0 ? (
        <div className="space-y-4">
          {/* Primary KPIs */}
          {primaryKPIs.length > 0 && (
            <Collapsible open={primaryOpen} onOpenChange={setPrimaryOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 w-full text-left group mb-3">
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${primaryOpen ? '' : '-rotate-90'}`} />
                <span className="text-sm font-medium text-muted-foreground">Primary KPIs</span>
                <span className="text-xs text-muted-foreground/60">{primaryKPIs.length}</span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-3">
                  {primaryKPIs.map((kpi, idx) => (
                    <KPICard 
                      key={kpi.id} 
                      kpi={kpi} 
                      updateKPIMutation={updateKPIMutation}
                      index={idx}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Supporting KPIs */}
          {supportingKPIs.length > 0 && (
            <Collapsible open={supportingOpen} onOpenChange={setSupportingOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 w-full text-left group mb-3">
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${supportingOpen ? '' : '-rotate-90'}`} />
                <span className="text-sm font-medium text-muted-foreground">Supporting KPIs</span>
                <span className="text-xs text-muted-foreground/60">{supportingKPIs.length}</span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-3">
                  {supportingKPIs.map((kpi, idx) => (
                    <KPICard 
                      key={kpi.id} 
                      kpi={kpi} 
                      updateKPIMutation={updateKPIMutation}
                      index={idx}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <TargetIcon className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <p className="font-medium mb-1">No KPIs selected</p>
          <p className="text-sm text-muted-foreground mb-4">Add KPIs to track progress</p>
          <Button
            variant="outline"
            size="sm"
            onClick={onShowRecommendations}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Get AI Suggestions
          </Button>
        </div>
      )}

      {/* Value Justification Studio - AI-powered value narrative */}
      {selectedKPIs.length > 0 && completedKPIs.length > 0 && (
        <ValueJustificationStudio
          projectId={projectId}
          priorityId={job.id}
          priorityName={job.jobName}
        />
      )}
    </div>
  );
}

// KPI Card Component - Clean minimal design
interface KPICardProps {
  kpi: KPI;
  updateKPIMutation: any;
  index?: number;
}

function KPICard({ kpi, updateKPIMutation, index = 0 }: KPICardProps) {
  const { toast } = useToast();
  const [isGeneratingBenchmark, setIsGeneratingBenchmark] = useState(false);
  
  const [localBaselineValue, setLocalBaselineValue] = useState(kpi.baselineValue || "");
  const [localTargetValue, setLocalTargetValue] = useState(kpi.targetValue || "");
  
  useEffect(() => {
    setLocalBaselineValue(kpi.baselineValue || "");
  }, [kpi.baselineValue]);
  
  useEffect(() => {
    setLocalTargetValue(kpi.targetValue || "");
  }, [kpi.targetValue]);
  
  const baselineNum = parseFloat(localBaselineValue || "0");
  const targetNum = parseFloat(localTargetValue || "0");
  const hasValues = localBaselineValue && localTargetValue;
  
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className={`p-4 rounded-lg border bg-card transition-colors ${
        isComplete ? 'border-emerald-500/30 bg-emerald-500/5' : ''
      }`}
      data-testid={`kpi-card-${kpi.id}`}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium" data-testid={`text-kpi-name-${kpi.id}`}>
              {kpi.kpiName}
            </h3>
            {isComplete && (
              <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
          {kpi.definition && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {kpi.definition}
            </p>
          )}
        </div>
        <Badge variant="outline" className="shrink-0 text-xs font-normal">{kpi.unit}</Badge>
      </div>

      {/* Benchmark hint */}
      {kpi.benchmarkValue && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/5 text-xs mb-4">
          <Award className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-muted-foreground">Benchmark:</span>
          <span className="font-medium">{kpi.benchmarkValue} {kpi.unit}</span>
        </div>
      )}

      {/* Two Column Input Layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* Baseline */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Baseline</label>
          <Input
            type="text"
            placeholder="Current value"
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
            className="h-9"
            data-testid={`input-baseline-${kpi.id}`}
          />
          {!localBaselineValue && (
            <Button
              onClick={generateAIBenchmark}
              disabled={isGeneratingBenchmark}
              variant="ghost"
              size="sm"
              className="w-full h-7 text-xs gap-1.5"
              data-testid={`button-generate-benchmark-${kpi.id}`}
            >
              {isGeneratingBenchmark ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              {isGeneratingBenchmark ? "..." : "AI suggest"}
            </Button>
          )}
        </div>

        {/* Target */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Target</label>
          <Input
            type="text"
            placeholder="Target value"
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
            className="h-9"
            data-testid={`input-target-${kpi.id}`}
          />
        </div>
      </div>

      {/* Customer Comment */}
      {kpi.customerComment && (
        <div className="mt-3 p-2 rounded bg-muted/30 text-xs">
          <span className="text-muted-foreground">Note:</span> {kpi.customerComment}
        </div>
      )}

      {/* Impact indicator when complete */}
      <AnimatePresence>
        {hasValues && (
          <motion.div 
            className="mt-4 pt-3 border-t flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2">
              {isImproving ? (
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-orange-600" />
              )}
              <span className={`text-sm font-medium ${isImproving ? 'text-emerald-600' : 'text-orange-600'}`}>
                {isImproving ? '+' : ''}{improvement.toFixed(0)}%
              </span>
              <span className="text-xs text-muted-foreground">improvement</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{localBaselineValue}</span>
              <ArrowRight className="w-3 h-3" />
              <span className="font-medium text-foreground">{localTargetValue}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
