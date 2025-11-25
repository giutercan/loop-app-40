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
import { ArrowLeft, ArrowRight, Save, FileText, Plus, Trash2, Sparkles, MessageSquarePlus, Briefcase, ExternalLink, Upload, Mic, X, File, Share2, Copy, Check, Users, Loader2, CheckCircle, Target, TrendingDown, TrendingUp, Activity, Award, Building, Calendar, AlertCircle, ChevronDown, Lightbulb, BarChart3, MessageSquare, Edit, Lock, Unlock, Flag, GripVertical, Layers, RefreshCw, Star } from "lucide-react";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import { AppTour } from "@/components/AppTour";
import { Link, useLocation, useRoute } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, CompanyDataPoint, Headline, DiscoveryNotes, DiscoveryQuestion, Attachment, SharedQuestionnaire, QuestionResponse, JobThemeWithKPIs, DiscoveryPhaseTransfer, SuccessStory, JobThemeKPI, UpdateJobThemeKPIRequest, StrategicPillar, PillarObjective, PillarOkrTheme } from "@shared/schema";
import type { OKRThemeDefinition } from "@shared/knowledge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

// Job Theme Card Component - Displays prioritized job with KPIs and baseline/target input
interface PillarOption {
  id: number;
  name: string;
}

interface JobThemeCardProps {
  theme: JobThemeWithKPIs;
  rank: number | null;
  projectId: number;
  updateKPIMutation: {
    mutate: (params: { kpiId: number; data: UpdateJobThemeKPIRequest }) => void;
    isPending: boolean;
  };
  isFinalized: boolean;
  editMode: boolean;
  onDeselect: () => void;
  pillars?: PillarOption[];
  onPillarLink?: (jobThemeId: number, pillarId: number | null) => void;
}

function JobThemeCard({ theme, rank, projectId, updateKPIMutation, isFinalized, editMode, onDeselect, pillars, onPillarLink }: JobThemeCardProps) {
  const { toast } = useToast();
  const [baselineInputs, setBaselineInputs] = useState<Record<number, { value: string; source: string }>>({});
  const [targetInputs, setTargetInputs] = useState<Record<number, { value: string; source: string }>>({});
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  
  // Track which KPIs have unsaved edits (dirty flags)
  const [dirtyBaseline, setDirtyBaseline] = useState<Set<number>>(new Set());
  const [dirtyTarget, setDirtyTarget] = useState<Set<number>>(new Set());
  
  // Group KPIs by type
  const primaryKPIs = theme.kpis.filter(kpi => kpi.kpiType === "primary");
  const supportingKPIs = theme.kpis.filter(kpi => kpi.kpiType === "supporting");
  
  // Rehydrate input state from fresh KPI props whenever they change
  // This ensures inputs always show server-normalized data after refetch
  useEffect(() => {
    const newBaselineInputs: Record<number, { value: string; source: string }> = {};
    const newTargetInputs: Record<number, { value: string; source: string }> = {};
    
    theme.kpis.forEach(kpi => {
      // Only rehydrate if this KPI is NOT currently being edited (no dirty flag)
      // Use explicit null/undefined checks to preserve zero values
      if (!dirtyBaseline.has(kpi.id) && kpi.baselineValue != null) {
        newBaselineInputs[kpi.id] = {
          value: kpi.baselineValue,
          source: kpi.baselineSource || ''
        };
      }
      
      if (!dirtyTarget.has(kpi.id) && kpi.targetValue != null) {
        newTargetInputs[kpi.id] = {
          value: kpi.targetValue,
          source: kpi.targetSource || ''
        };
      }
    });
    
    setBaselineInputs(prev => ({ ...newBaselineInputs, ...Object.fromEntries(
      Object.entries(prev).filter(([id]) => dirtyBaseline.has(Number(id)))
    )}));
    setTargetInputs(prev => ({ ...newTargetInputs, ...Object.fromEntries(
      Object.entries(prev).filter(([id]) => dirtyTarget.has(Number(id)))
    )}));
  }, [theme.kpis, dirtyBaseline, dirtyTarget]);
  
  // Helper functions to get current values
  const getBaselineValue = (kpi: JobThemeWithKPIs['kpis'][0]) => {
    return baselineInputs[kpi.id]?.value ?? kpi.baselineValue ?? '';
  };
  
  const getBaselineSource = (kpi: JobThemeWithKPIs['kpis'][0]) => {
    return baselineInputs[kpi.id]?.source ?? kpi.baselineSource ?? '';
  };
  
  const getTargetValue = (kpi: JobThemeWithKPIs['kpis'][0]) => {
    return targetInputs[kpi.id]?.value ?? kpi.targetValue ?? '';
  };
  
  const getTargetSource = (kpi: JobThemeWithKPIs['kpis'][0]) => {
    return targetInputs[kpi.id]?.source ?? kpi.targetSource ?? '';
  };
  
  const handleKPIToggle = (kpi: JobThemeWithKPIs['kpis'][0]) => {
    // Clear dirty flags when deselecting a KPI
    if (kpi.isSelected) {
      setDirtyBaseline(prev => {
        const newSet = new Set(prev);
        newSet.delete(kpi.id);
        return newSet;
      });
      setDirtyTarget(prev => {
        const newSet = new Set(prev);
        newSet.delete(kpi.id);
        return newSet;
      });
    }
    
    updateKPIMutation.mutate({
      kpiId: kpi.id,
      data: { isSelected: !kpi.isSelected }
    });
  };
  
  const handleBaselineUpdate = (kpi: JobThemeWithKPIs['kpis'][0]) => {
    // Check if user has made any edits
    if (!dirtyBaseline.has(kpi.id)) {
      toast({
        title: "No Changes",
        description: "Make changes before updating",
      });
      return;
    }
    
    const value = getBaselineValue(kpi);
    const source = getBaselineSource(kpi) || "User input";
    
    if (!value) return;
    
    // Validate that the value is numeric
    const numericValue = parseFloat(value);
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
        baselineValue: value,
        baselineSource: source
      }
    });
    
    // Clear dirty flag - useEffect will rehydrate from fresh KPI props after refetch
    setDirtyBaseline(prev => {
      const newSet = new Set(prev);
      newSet.delete(kpi.id);
      return newSet;
    });
  };
  
  const handleTargetUpdate = (kpi: JobThemeWithKPIs['kpis'][0]) => {
    // Check if user has made any edits
    if (!dirtyTarget.has(kpi.id)) {
      toast({
        title: "No Changes",
        description: "Make changes before updating",
      });
      return;
    }
    
    const value = getTargetValue(kpi);
    const source = getTargetSource(kpi) || "User input";
    
    if (!value) return;
    
    // Validate that the value is numeric
    const numericValue = parseFloat(value);
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
        targetValue: value,
        targetSource: source
      }
    });
    
    // Clear dirty flag - useEffect will rehydrate from fresh KPI props after refetch
    setDirtyTarget(prev => {
      const newSet = new Set(prev);
      newSet.delete(kpi.id);
      return newSet;
    });
  };
  
  // Mutation for generating AI industry benchmarks
  const generateBenchmarkMutation = useMutation({
    mutationFn: async (kpiId: number): Promise<JobThemeKPI> => {
      const response = await apiRequest("POST", `/api/job-theme-kpis/${kpiId}/generate-benchmark`, {});
      return await response.json();
    },
    onSuccess: async (updatedKPI: JobThemeKPI) => {
      await queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}/job-themes`],
        refetchType: 'active'
      });
      toast({
        title: "Industry Baseline Generated",
        description: `AI generated benchmark: ${updatedKPI.benchmarkValue} ${updatedKPI.unit}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate benchmark",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Render a single KPI card (reusable for both primary and supporting)
  const renderKPI = (kpi: JobThemeWithKPIs['kpis'][0]) => {
            const achievabilityScore = kpi.aiAchievabilityScore || 0;
            const impactScore = kpi.aiValueImpactScore || 0;
            const isAIRecommended = kpi.isAIRecommended;
            
            const getScoreColor = (score: number) => {
              if (score >= 8) return "text-emerald-600 dark:text-emerald-400";
              if (score >= 6) return "text-amber-600 dark:text-amber-400";
              return "text-orange-600 dark:text-orange-400";
            };

            const getScoreBackground = (score: number) => {
              if (score >= 8) return "bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30";
              if (score >= 6) return "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30";
              return "bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30";
            };

            // Calculate delta if both baseline and target exist
            const baselineNum = parseFloat(kpi.baselineValue || '0');
            const targetNum = parseFloat(kpi.targetValue || '0');
            const hasDelta = kpi.baselineValue && kpi.targetValue && baselineNum > 0;
            const deltaPercent = hasDelta ? ((targetNum - baselineNum) / baselineNum * 100) : 0;
            
            return (
            <div 
              key={kpi.id} 
              className={`group relative overflow-visible rounded-xl transition-all duration-300 ${
                kpi.isSelected 
                  ? "shadow-lg shadow-primary/10 ring-2 ring-primary/30" 
                  : "hover-elevate shadow-md"
              }`}
            >
              {/* Glassmorphism background with gradient */}
              <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                kpi.isSelected
                  ? "bg-gradient-to-br from-primary/10 via-primary/5 to-background backdrop-blur-sm"
                  : "bg-gradient-to-br from-background via-muted/30 to-background"
              }`} />
              
              {/* Animated gradient accent bar */}
              {isAIRecommended && (
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-t-xl opacity-90 animate-pulse" />
              )}
              
              <div className="relative p-6 space-y-5">
                {/* BAND 1: HEADLINE BAR with Checkbox and Title */}
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 mt-1 transition-transform duration-200 ${
                    kpi.isSelected ? 'scale-110' : 'group-hover:scale-105'
                  }`}>
                    <Checkbox
                      checked={kpi.isSelected}
                      onCheckedChange={() => handleKPIToggle(kpi)}
                      disabled={isFinalized && !editMode}
                      className="h-5 w-5"
                      data-testid={`checkbox-kpi-${kpi.id}`}
                    />
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    {/* Badges and metadata */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {isAIRecommended && (
                        <Badge className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 text-white border-0 shadow-sm">
                          <Award className="mr-1 h-3.5 w-3.5" />
                          Korn Ferry Recommended
                        </Badge>
                      )}
                      <Badge variant="outline" className="font-medium">
                        {kpi.kpiType === "primary" ? "Primary" : "Supporting"}
                      </Badge>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
                        <Badge variant="secondary" className="font-mono">{kpi.unit}</Badge>
                        <div className="w-px h-3 bg-border" />
                        <span>{kpi.measurementFrequency}</span>
                      </div>
                    </div>
                    
                    {/* KPI Name - Larger, bolder */}
                    <div>
                      <h3 className="text-xl font-bold leading-tight tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                        {kpi.kpiName}
                      </h3>
                      {kpi.definition && (
                        <p className="text-sm text-muted-foreground leading-relaxed mt-1.5">
                          {kpi.definition}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* BAND 2: METRIC CANVAS - Baseline & Target Visualization */}
                {kpi.isSelected && (kpi.baselineValue || kpi.targetValue) && (
                  <div className="grid grid-cols-2 gap-4">
                    {/* Baseline Metric Tile */}
                    {kpi.baselineValue && (
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 p-4 hover-elevate group/baseline">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
                        <div className="relative space-y-2">
                          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            BASELINE
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 font-mono">
                              {kpi.baselineValue}
                            </span>
                            <span className="text-sm text-muted-foreground">{kpi.unit}</span>
                          </div>
                          <div className="text-xs text-emerald-700/70 dark:text-emerald-400/70">
                            {kpi.baselineSource}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Target Metric Tile */}
                    {kpi.targetValue && (
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20 p-4 hover-elevate group/target">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
                        <div className="relative space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-medium text-purple-700 dark:text-purple-400">
                              <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                              TARGET
                            </div>
                            {hasDelta && (
                              <Badge className={`${
                                deltaPercent > 0 
                                  ? 'bg-gradient-to-r from-emerald-600 to-green-600' 
                                  : 'bg-gradient-to-r from-orange-600 to-red-600'
                              } text-white border-0 text-xs font-bold`}>
                                {deltaPercent > 0 ? '+' : ''}{deltaPercent.toFixed(1)}%
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-purple-900 dark:text-purple-100 font-mono">
                              {kpi.targetValue}
                            </span>
                            <span className="text-sm text-muted-foreground">{kpi.unit}</span>
                          </div>
                          <div className="text-xs text-purple-700/70 dark:text-purple-400/70">
                            {kpi.targetSource}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* AI Scores - Show only if AI recommended AND scores exist */}
                {isAIRecommended && achievabilityScore && impactScore && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent border border-cyan-500/20 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">Achievability</span>
                        <Target className={`h-5 w-5 ${getScoreColor(achievabilityScore)}`} />
                      </div>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className={`text-4xl font-bold ${getScoreColor(achievabilityScore)} font-mono`}>
                          {achievabilityScore}
                        </span>
                        <span className="text-lg text-muted-foreground font-medium">/10</span>
                      </div>
                      <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            achievabilityScore >= 8 ? "bg-gradient-to-r from-emerald-500 to-green-500" : 
                            achievabilityScore >= 6 ? "bg-gradient-to-r from-amber-500 to-yellow-500" : 
                            "bg-gradient-to-r from-orange-500 to-red-500"
                          }`}
                          style={{ width: `${achievabilityScore * 10}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent border border-purple-500/20 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Value Impact</span>
                        <TrendingUp className={`h-5 w-5 ${getScoreColor(impactScore)}`} />
                      </div>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className={`text-4xl font-bold ${getScoreColor(impactScore)} font-mono`}>
                          {impactScore}
                        </span>
                        <span className="text-lg text-muted-foreground font-medium">/10</span>
                      </div>
                      <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            impactScore >= 8 ? "bg-gradient-to-r from-emerald-500 to-green-500" : 
                            impactScore >= 6 ? "bg-gradient-to-r from-amber-500 to-yellow-500" : 
                            "bg-gradient-to-r from-orange-500 to-red-500"
                          }`}
                          style={{ width: `${impactScore * 10}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* BAND 3: INTELLIGENCE BAND - AI Insights */}
                {(kpi.aiStrategicRationale || kpi.aiKornFerryBenchmark) && (
                  <div className="space-y-3">
                    {kpi.aiStrategicRationale && (
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-transparent border border-indigo-500/20 p-4">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
                        <div className="relative space-y-2">
                          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                            <TrendingUp className="h-4 w-4" />
                            Strategic Value
                          </div>
                          <p className="text-sm leading-relaxed text-foreground/90">
                            {kpi.aiStrategicRationale}
                          </p>
                        </div>
                      </div>
                    )}

                    {kpi.aiKornFerryBenchmark && (
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent border border-blue-500/20 p-4">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl" />
                        <div className="relative space-y-2">
                          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                            <Award className="h-4 w-4" />
                            Korn Ferry Benchmark
                          </div>
                          <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                            {kpi.aiKornFerryBenchmark}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                  
                {/* BAND 4: ACTION RAIL - Baseline Data Input/Edit */}
                {kpi.isSelected && (!isFinalized || editMode) && (
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-2 border-blue-500/30 p-5">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                          <span className="text-sm font-bold text-blue-900 dark:text-blue-100">
                            {kpi.baselineValue ? '✏️ Edit Baseline Data' : 'Add Baseline Data'}
                          </span>
                        </div>
                        <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300">
                          Editable
                        </Badge>
                      </div>
                      
                      {/* Show Korn Ferry benchmark if available and no baseline set */}
                      {!kpi.baselineValue && kpi.benchmarkValue && (
                        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent border border-blue-500/30 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
                                <Award className="h-3.5 w-3.5" />
                                Korn Ferry Benchmark Available
                              </div>
                              <div className="text-sm font-bold text-blue-900 dark:text-blue-100">{kpi.benchmarkValue} {kpi.unit}</div>
                              <div className="text-xs text-blue-700/70 dark:text-blue-300/70 mt-0.5">{kpi.benchmarkSource}</div>
                            </div>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 shadow-sm hover:shadow-md transition-shadow"
                              onClick={() => {
                                setBaselineInputs({
                                  ...baselineInputs,
                                  [kpi.id]: { value: kpi.benchmarkValue || '', source: kpi.benchmarkSource || '' }
                                });
                                // Mark as dirty when benchmark is used
                                setDirtyBaseline(prev => new Set(prev).add(kpi.id));
                              }}
                              data-testid={`button-use-benchmark-${kpi.id}`}
                            >
                              Use as Baseline
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Generate AI industry benchmark if none exists */}
                      {!kpi.baselineValue && !kpi.benchmarkValue && (
                        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent border border-purple-500/30 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1">
                                <Sparkles className="h-3.5 w-3.5" />
                                Industry Benchmark Not Available
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Let AI generate an industry baseline value for this KPI
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2 border-purple-500/30 hover:bg-purple-500/10"
                              onClick={() => generateBenchmarkMutation.mutate(kpi.id)}
                              disabled={generateBenchmarkMutation.isPending}
                              data-testid={`button-generate-benchmark-${kpi.id}`}
                            >
                              {generateBenchmarkMutation.isPending ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-3.5 w-3.5" />
                                  Generate
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Input form - Pre-fill with existing values or show empty */}
                      <div className="flex flex-col gap-3">
                          <div className="grid grid-cols-[1fr,auto] gap-2">
                            <Input
                              placeholder={`Enter ${kpi.kpiName.toLowerCase()}...`}
                              value={baselineInputs[kpi.id]?.value || kpi.baselineValue || ''}
                              onChange={(e) => {
                                setBaselineInputs({
                                  ...baselineInputs,
                                  [kpi.id]: { 
                                    value: e.target.value, 
                                    source: baselineInputs[kpi.id]?.source || kpi.baselineSource || '' 
                                  }
                                });
                                // Mark as dirty when user edits
                                setDirtyBaseline(prev => new Set(prev).add(kpi.id));
                              }}
                              className="text-base font-medium"
                              data-testid={`input-baseline-${kpi.id}`}
                            />
                            <div className="flex items-center text-sm text-muted-foreground font-medium px-2">
                              {kpi.unit}
                            </div>
                          </div>
                          <div className="grid grid-cols-[1fr,auto] gap-2">
                            <Input
                              placeholder="Data source (e.g., Q4 2024 Report)..."
                              value={baselineInputs[kpi.id]?.source || kpi.baselineSource || ''}
                              onChange={(e) => {
                                setBaselineInputs({
                                  ...baselineInputs,
                                  [kpi.id]: { 
                                    value: baselineInputs[kpi.id]?.value || kpi.baselineValue || '', 
                                    source: e.target.value 
                                  }
                                });
                                // Mark as dirty when user edits
                                setDirtyBaseline(prev => new Set(prev).add(kpi.id));
                              }}
                              data-testid={`input-baseline-source-${kpi.id}`}
                            />
                            <Button
                              onClick={() => handleBaselineUpdate(kpi)}
                              disabled={!dirtyBaseline.has(kpi.id)}
                              className="bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-sm hover:shadow-md transition-shadow"
                              data-testid={`button-save-baseline-${kpi.id}`}
                            >
                              {kpi.baselineValue ? 'Update' : 'Save'} Baseline
                            </Button>
                          </div>
                        </div>
                    </div>
                  </div>
                )}
                  
                {/* Target Data Input/Edit - Only show if baseline is set */}
                {kpi.isSelected && kpi.baselineValue && (!isFinalized || editMode) && (
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-2 border-purple-500/30 p-5">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                          <span className="text-sm font-bold text-purple-900 dark:text-purple-100">
                            {kpi.targetValue ? '✏️ Edit Target Value' : 'Set Target Value'}
                          </span>
                        </div>
                        <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300">
                          Editable
                        </Badge>
                      </div>
                      
                      {/* Input form - Pre-fill with existing values or show empty */}
                      <div className="flex flex-col gap-3">
                          <div className="grid grid-cols-[1fr,auto] gap-2">
                            <Input
                              placeholder={`Enter target ${kpi.kpiName.toLowerCase()}...`}
                              value={targetInputs[kpi.id]?.value || kpi.targetValue || ''}
                              onChange={(e) => {
                                setTargetInputs({
                                  ...targetInputs,
                                  [kpi.id]: { 
                                    value: e.target.value, 
                                    source: targetInputs[kpi.id]?.source || kpi.targetSource || '' 
                                  }
                                });
                                // Mark as dirty when user edits
                                setDirtyTarget(prev => new Set(prev).add(kpi.id));
                              }}
                              className="text-base font-medium"
                              data-testid={`input-target-${kpi.id}`}
                            />
                            <div className="flex items-center text-sm text-muted-foreground font-medium px-2">
                              {kpi.unit}
                            </div>
                          </div>
                          <div className="grid grid-cols-[1fr,auto] gap-2">
                            <Input
                              placeholder="Data source (e.g., Strategic Plan 2025)..."
                              value={targetInputs[kpi.id]?.source || kpi.targetSource || ''}
                              onChange={(e) => {
                                setTargetInputs({
                                  ...targetInputs,
                                  [kpi.id]: { 
                                    value: targetInputs[kpi.id]?.value || kpi.targetValue || '', 
                                    source: e.target.value 
                                  }
                                });
                                // Mark as dirty when user edits
                                setDirtyTarget(prev => new Set(prev).add(kpi.id));
                              }}
                              data-testid={`input-target-source-${kpi.id}`}
                            />
                            <Button
                              onClick={() => handleTargetUpdate(kpi)}
                              disabled={!dirtyTarget.has(kpi.id)}
                              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm hover:shadow-md transition-shadow"
                              data-testid={`button-save-target-${kpi.id}`}
                            >
                              {kpi.targetValue ? 'Update' : 'Save'} Target
                            </Button>
                          </div>
                        </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            );
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-4">
      {/* Job Summary */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="shrink-0"
                data-testid={`button-toggle-${theme.id}`}
              >
                <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
              </Button>
            </CollapsibleTrigger>
            <div className="flex-1">
              <div className="font-semibold text-base">{theme.jobName}</div>
              <div className="text-sm text-muted-foreground mt-1">{theme.capabilityName}</div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">{theme.evidenceCount} insights</Badge>
                {theme.solutionArea && <Badge variant="outline" className="text-xs">{theme.solutionArea}</Badge>}
                {/* Pillar Link Badge */}
                {theme.pillarId && pillars && (
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-primary/10 border-primary/30 text-primary gap-1"
                  >
                    <Flag className="w-3 h-3" />
                    {pillars.find(p => p.id === theme.pillarId)?.name || 'Linked Pillar'}
                  </Badge>
                )}
              </div>
              {/* Pillar Selector */}
              {pillars && pillars.length > 0 && onPillarLink && !isFinalized && (
                <div className="mt-3 flex items-center gap-2">
                  <Flag className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Select
                    value={theme.pillarId?.toString() || ""}
                    onValueChange={(value) => {
                      onPillarLink(theme.id, value ? parseInt(value) : null);
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs w-[200px]" data-testid={`select-pillar-${theme.id}`}>
                      <SelectValue placeholder="Link to Strategic Pillar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs text-muted-foreground">
                        No pillar linked
                      </SelectItem>
                      {pillars.map((pillar) => (
                        <SelectItem key={pillar.id} value={pillar.id.toString()} className="text-xs">
                          {pillar.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
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
      
      <CollapsibleContent className="space-y-6">
        {/* Primary KPIs Section */}
        {primaryKPIs.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="h-px flex-1 bg-gradient-to-r from-purple-500/50 to-transparent" />
              <Badge variant="outline" className="font-semibold bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
                <Target className="h-3.5 w-3.5 mr-1.5" />
                Primary KPIs
              </Badge>
              <div className="h-px flex-1 bg-gradient-to-l from-purple-500/50 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {primaryKPIs.map(kpi => renderKPI(kpi))}
            </div>
          </div>
        )}
        
        {/* Supporting KPIs Section */}
        {supportingKPIs.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/50 to-transparent" />
              <Badge variant="outline" className="font-semibold bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border-cyan-500/30">
                <Activity className="h-3.5 w-3.5 mr-1.5" />
                Supporting KPIs
              </Badge>
              <div className="h-px flex-1 bg-gradient-to-l from-cyan-500/50 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supportingKPIs.map(kpi => renderKPI(kpi))}
            </div>
          </div>
        )}
        
        {/* Empty state if no KPIs */}
        {primaryKPIs.length === 0 && supportingKPIs.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">
            No KPIs selected yet. Click "Suggest KPIs" to get AI recommendations.
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
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
  const [kpiEditMode, setKpiEditMode] = useState(false);

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

  // Strategic Pillars queries
  interface PillarWithObjectives extends StrategicPillar {
    objectives?: PillarObjective[];
  }
  
  const { data: strategicPillars = [], isLoading: pillarsLoading, refetch: refetchPillars } = useQuery<PillarWithObjectives[]>({
    queryKey: [`/api/projects/${projectId}/strategic-pillars`],
    enabled: !!projectId,
  });

  // OKR Themes - knowledge base themes and project links
  const { data: okrThemes = [] } = useQuery<OKRThemeDefinition[]>({
    queryKey: ['/api/okr-themes'],
  });

  const { data: pillarOkrThemeLinks = [], refetch: refetchPillarOkrThemes } = useQuery<PillarOkrTheme[]>({
    queryKey: [`/api/projects/${projectId}/pillar-okr-themes`],
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

  // Strategic Pillars state
  const [newPillarName, setNewPillarName] = useState("");
  const [newPillarDescription, setNewPillarDescription] = useState("");
  const [editingPillarId, setEditingPillarId] = useState<number | null>(null);
  const [editingPillarData, setEditingPillarData] = useState({ name: "", description: "" });
  const [newObjective, setNewObjective] = useState({ pillarId: 0, objective: "", objectiveType: "company" as "company" | "hr" | "talent" });
  const [isAddObjectiveOpen, setIsAddObjectiveOpen] = useState(false);
  const [addingObjectiveToPillar, setAddingObjectiveToPillar] = useState<number | null>(null);

  // Strategic Pillars mutations
  const generatePillarsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/strategic-pillars/generate`, {});
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to generate pillars");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/strategic-pillars`] });
      toast({
        title: "Strategic pillars generated",
        description: `Created ${data.pillars?.length || 0} strategic pillars based on your discovery research.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate strategic pillars",
        variant: "destructive",
      });
    },
  });

  const createPillarMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/strategic-pillars`, {
        ...data,
        priority: (strategicPillars?.length || 0) + 1,
        status: "draft",
        isAISuggested: false,
      });
      if (!res.ok) throw new Error("Failed to create pillar");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/strategic-pillars`] });
      setNewPillarName("");
      setNewPillarDescription("");
      toast({ title: "Strategic pillar added" });
    },
  });

  const updatePillarMutation = useMutation({
    mutationFn: async ({ pillarId, data }: { pillarId: number; data: Partial<StrategicPillar> }) => {
      const res = await apiRequest("PATCH", `/api/strategic-pillars/${pillarId}`, data);
      if (!res.ok) throw new Error("Failed to update pillar");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/strategic-pillars`] });
      setEditingPillarId(null);
      toast({ title: "Strategic pillar updated" });
    },
  });

  const deletePillarMutation = useMutation({
    mutationFn: async (pillarId: number) => {
      const res = await apiRequest("DELETE", `/api/strategic-pillars/${pillarId}`, {});
      if (!res.ok) throw new Error("Failed to delete pillar");
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/strategic-pillars`] });
      toast({ title: "Strategic pillar removed" });
    },
  });

  const createObjectiveMutation = useMutation({
    mutationFn: async ({ pillarId, data }: { pillarId: number; data: { objective: string; objectiveType: string } }) => {
      const res = await apiRequest("POST", `/api/strategic-pillars/${pillarId}/objectives`, {
        ...data,
        status: "not_started",
        isAISuggested: false,
      });
      if (!res.ok) throw new Error("Failed to create objective");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/strategic-pillars`] });
      setNewObjective({ pillarId: 0, objective: "", objectiveType: "company" });
      setAddingObjectiveToPillar(null);
      toast({ title: "Objective added" });
    },
  });

  const deleteObjectiveMutation = useMutation({
    mutationFn: async (objectiveId: number) => {
      const res = await apiRequest("DELETE", `/api/pillar-objectives/${objectiveId}`, {});
      if (!res.ok) throw new Error("Failed to delete objective");
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/strategic-pillars`] });
      toast({ title: "Objective removed" });
    },
  });

  // Update OKR theme links for a pillar
  const updatePillarOkrThemesMutation = useMutation({
    mutationFn: async ({ pillarId, okrThemeIds }: { pillarId: number; okrThemeIds: string[] }) => {
      const res = await apiRequest("PUT", `/api/strategic-pillars/${pillarId}/okr-themes`, {
        okrThemeIds,
      });
      if (!res.ok) throw new Error("Failed to update OKR themes");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/pillar-okr-themes`] });
      toast({ title: "OKR themes updated" });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update OKR themes",
        variant: "destructive",
      });
    },
  });

  // Link job theme to strategic pillar
  const linkJobToPillarMutation = useMutation({
    mutationFn: async ({ jobThemeId, pillarId }: { jobThemeId: number; pillarId: number | null }) => {
      const res = await apiRequest("PATCH", `/api/job-themes/${jobThemeId}/pillar-link`, {
        pillarId: pillarId,
        pillarLinkageNarrative: null
      });
      if (!res.ok) throw new Error("Failed to link job to pillar");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/job-themes`] });
      toast({ title: "Job linked to strategic pillar" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to link job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePillarLink = (jobThemeId: number, pillarId: number | null) => {
    // Handle "none" value which comes as parseInt("none") = NaN
    const finalPillarId = pillarId && !isNaN(pillarId) ? pillarId : null;
    linkJobToPillarMutation.mutate({ jobThemeId, pillarId: finalPillarId });
  };

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
              <AppTour />
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={saveNotesMutation.isPending}
                data-testid="button-save-draft"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveNotesMutation.isPending ? "Saving..." : "Save Draft"}
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
          <TabsList className="grid w-full grid-cols-5 max-w-5xl" data-testid="tabs-discovery">
            <TabsTrigger value="organisation" data-testid="tab-research">Organisation</TabsTrigger>
            <TabsTrigger value="notes" data-testid="tab-value-case">Build Value Case</TabsTrigger>
            <TabsTrigger value="pillars" data-testid="tab-strategic-pillars">Strategic Pillars</TabsTrigger>
            <TabsTrigger value="jobs" data-testid="tab-jobs">Jobs & Priorities</TabsTrigger>
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

          <TabsContent value="pillars" className="space-y-6">
            {/* Strategic Pillars Introduction */}
            <div className="flex items-center justify-between gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
                  <Flag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">Strategic Pillars</h2>
                  <p className="text-sm text-muted-foreground">
                    Define 3-5 organizational priorities that connect to the client's business strategy
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{strategicPillars.length}</div>
                  <div className="text-xs text-muted-foreground">Pillars Defined</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {strategicPillars.filter(p => p.status === "confirmed").length}
                  </div>
                  <div className="text-xs text-muted-foreground">Confirmed</div>
                </div>
              </div>
            </div>

            {/* AI Generation Button */}
            {strategicPillars.length === 0 && dataPoints.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary/10">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Generate Strategic Pillars with AI</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Based on your discovery research, AI will suggest 3-5 strategic pillars with associated objectives.
                      </p>
                    </div>
                    <Button
                      onClick={() => generatePillarsMutation.mutate()}
                      disabled={generatePillarsMutation.isPending}
                      data-testid="button-generate-pillars"
                    >
                      {generatePillarsMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing Discovery Data...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Strategic Pillars
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {strategicPillars.length === 0 && dataPoints.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <AlertCircle className="w-10 h-10 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Complete your company research in the Organisation tab first to generate strategic pillars.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {pillarsLoading && (
              <Card>
                <CardContent className="pt-6 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading strategic pillars...</p>
                </CardContent>
              </Card>
            )}

            {/* Pillars List */}
            {!pillarsLoading && strategicPillars.length > 0 && (
              <div className="space-y-4">
                {strategicPillars
                  .sort((a, b) => (a.priority || 999) - (b.priority || 999))
                  .map((pillar, index) => (
                  <Card key={pillar.id} className="overflow-visible" data-testid={`card-pillar-${pillar.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            {editingPillarId === pillar.id ? (
                              <div className="space-y-2">
                                <Input
                                  value={editingPillarData.name}
                                  onChange={(e) => setEditingPillarData(prev => ({ ...prev, name: e.target.value }))}
                                  placeholder="Pillar name"
                                  data-testid={`input-edit-pillar-name-${pillar.id}`}
                                />
                                <Textarea
                                  value={editingPillarData.description}
                                  onChange={(e) => setEditingPillarData(prev => ({ ...prev, description: e.target.value }))}
                                  placeholder="Description"
                                  className="min-h-[80px]"
                                  data-testid={`textarea-edit-pillar-desc-${pillar.id}`}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => updatePillarMutation.mutate({ 
                                      pillarId: pillar.id, 
                                      data: editingPillarData 
                                    })}
                                    disabled={updatePillarMutation.isPending}
                                    data-testid={`button-save-pillar-${pillar.id}`}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingPillarId(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-lg">{pillar.name}</CardTitle>
                                  {pillar.isAISuggested && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Sparkles className="w-3 h-3 mr-1" />
                                      AI Suggested
                                    </Badge>
                                  )}
                                  {pillar.confidence && (
                                    <ConfidenceBadge level={pillar.confidence} />
                                  )}
                                  <Badge 
                                    variant={pillar.status === "confirmed" ? "default" : "outline"}
                                    className="text-xs"
                                  >
                                    {pillar.status === "confirmed" ? "Confirmed" : "Draft"}
                                  </Badge>
                                </div>
                                <CardDescription className="mt-1">{pillar.description}</CardDescription>
                              </>
                            )}
                          </div>
                        </div>
                        {editingPillarId !== pillar.id && (
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setEditingPillarId(pillar.id);
                                setEditingPillarData({ name: pillar.name, description: pillar.description || "" });
                              }}
                              data-testid={`button-edit-pillar-${pillar.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {pillar.status !== "confirmed" && (
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => updatePillarMutation.mutate({ 
                                  pillarId: pillar.id, 
                                  data: { status: "confirmed" } 
                                })}
                                title="Confirm this pillar"
                                data-testid={`button-confirm-pillar-${pillar.id}`}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                if (confirm("Remove this strategic pillar?")) {
                                  deletePillarMutation.mutate(pillar.id);
                                }
                              }}
                              data-testid={`button-delete-pillar-${pillar.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Enterprise OKR Themes Section */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Layers className="w-4 h-4 text-muted-foreground" />
                          Enterprise OKR Themes
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {okrThemes.map((theme) => {
                            const isLinked = pillarOkrThemeLinks.some(
                              link => link.pillarId === pillar.id && link.okrThemeId === theme.id
                            );
                            return (
                              <Badge
                                key={theme.id}
                                variant={isLinked ? "default" : "outline"}
                                className={`cursor-pointer transition-colors ${isLinked ? "" : "hover-elevate"}`}
                                onClick={() => {
                                  const currentThemeIds = pillarOkrThemeLinks
                                    .filter(link => link.pillarId === pillar.id)
                                    .map(link => link.okrThemeId);
                                  
                                  const newThemeIds = isLinked
                                    ? currentThemeIds.filter(id => id !== theme.id)
                                    : [...currentThemeIds, theme.id];
                                  
                                  updatePillarOkrThemesMutation.mutate({
                                    pillarId: pillar.id,
                                    okrThemeIds: newThemeIds,
                                  });
                                }}
                                data-testid={`badge-okr-theme-${pillar.id}-${theme.id}`}
                              >
                                {isLinked && <Check className="w-3 h-3 mr-1" />}
                                {theme.shortName}
                              </Badge>
                            );
                          })}
                        </div>
                        {pillarOkrThemeLinks.filter(link => link.pillarId === pillar.id).length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {pillarOkrThemeLinks
                              .filter(link => link.pillarId === pillar.id)
                              .map(link => okrThemes.find(t => t.id === link.okrThemeId)?.objective)
                              .filter(Boolean)
                              .join(" • ")}
                          </p>
                        )}
                      </div>

                      <Separator />

                      {/* Objectives Section */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <Target className="w-4 h-4 text-muted-foreground" />
                            Business Objectives
                          </h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setAddingObjectiveToPillar(pillar.id);
                              setNewObjective({ pillarId: pillar.id, objective: "", objectiveType: "company" });
                            }}
                            data-testid={`button-add-objective-${pillar.id}`}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Objective
                          </Button>
                        </div>

                        {/* Add Objective Form */}
                        {addingObjectiveToPillar === pillar.id && (
                          <div className="p-3 bg-muted/50 rounded-md space-y-3">
                            <Input
                              placeholder="Enter objective (e.g., Reduce time-to-hire by 25%)"
                              value={newObjective.objective}
                              onChange={(e) => setNewObjective(prev => ({ ...prev, objective: e.target.value }))}
                              data-testid={`input-new-objective-${pillar.id}`}
                            />
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                {(["company", "hr", "talent"] as const).map((type) => (
                                  <Button
                                    key={type}
                                    size="sm"
                                    variant={newObjective.objectiveType === type ? "default" : "outline"}
                                    onClick={() => setNewObjective(prev => ({ ...prev, objectiveType: type }))}
                                    className="capitalize"
                                  >
                                    {type}
                                  </Button>
                                ))}
                              </div>
                              <div className="flex-1" />
                              <Button
                                size="sm"
                                onClick={() => {
                                  if (newObjective.objective.trim()) {
                                    createObjectiveMutation.mutate({
                                      pillarId: pillar.id,
                                      data: {
                                        objective: newObjective.objective,
                                        objectiveType: newObjective.objectiveType
                                      }
                                    });
                                  }
                                }}
                                disabled={!newObjective.objective.trim() || createObjectiveMutation.isPending}
                                data-testid={`button-save-objective-${pillar.id}`}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setAddingObjectiveToPillar(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Objectives List */}
                        {pillar.objectives && pillar.objectives.length > 0 ? (
                          <div className="space-y-2">
                            {pillar.objectives.map((obj) => (
                              <div 
                                key={obj.id} 
                                className="flex items-start gap-3 p-3 bg-muted/30 rounded-md group"
                                data-testid={`objective-${obj.id}`}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {obj.objectiveType}
                                    </Badge>
                                    {obj.isAISuggested && (
                                      <Badge variant="secondary" className="text-xs">
                                        <Sparkles className="w-2 h-2 mr-1" />
                                        AI
                                      </Badge>
                                    )}
                                    {obj.timeline && (
                                      <span className="text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3 inline mr-1" />
                                        {obj.timeline}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm">{obj.objective}</p>
                                  {(() => {
                                    const keyResults = obj.keyResults as Array<{ result: string; target: string }> | null;
                                    if (!keyResults || !Array.isArray(keyResults) || keyResults.length === 0) return null;
                                    return (
                                      <div className="mt-2 space-y-1">
                                        {keyResults.map((kr, idx) => (
                                          <div key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                                            <Activity className="w-3 h-3" />
                                            <span>{kr.result}</span>
                                            {kr.target && (
                                              <Badge variant="outline" className="text-xs">
                                                Target: {kr.target}
                                              </Badge>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  })()}
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => {
                                    if (confirm("Remove this objective?")) {
                                      deleteObjectiveMutation.mutate(obj.id);
                                    }
                                  }}
                                  data-testid={`button-delete-objective-${obj.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic py-2">
                            No objectives defined yet. Add objectives to connect this pillar to measurable outcomes.
                          </p>
                        )}

                        {/* Source Insights */}
                        {pillar.sourceInsightIds && pillar.sourceInsightIds.length > 0 && (
                          <div className="pt-3 border-t">
                            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                              <Lightbulb className="w-3 h-3" />
                              Based on {pillar.sourceInsightIds.length} discovery insights
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {pillar.sourceInsightIds.slice(0, 5).map((insightId) => {
                                const insight = dataPoints.find(dp => dp.id === insightId);
                                return insight ? (
                                  <Badge key={insightId} variant="outline" className="text-xs">
                                    {insight.label}
                                  </Badge>
                                ) : null;
                              })}
                              {pillar.sourceInsightIds.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{pillar.sourceInsightIds.length - 5} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Add New Pillar Manually */}
            {!pillarsLoading && strategicPillars.length > 0 && strategicPillars.length < 5 && (
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <Collapsible>
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">Add Strategic Pillar Manually</span>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-pillar-name">Pillar Name</Label>
                        <Input
                          id="new-pillar-name"
                          placeholder="e.g., Digital Transformation, Operational Excellence"
                          value={newPillarName}
                          onChange={(e) => setNewPillarName(e.target.value)}
                          data-testid="input-new-pillar-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-pillar-desc">Description</Label>
                        <Textarea
                          id="new-pillar-desc"
                          placeholder="Describe why this pillar is strategically important..."
                          value={newPillarDescription}
                          onChange={(e) => setNewPillarDescription(e.target.value)}
                          className="min-h-[80px]"
                          data-testid="textarea-new-pillar-desc"
                        />
                      </div>
                      <Button
                        onClick={() => {
                          if (newPillarName.trim()) {
                            createPillarMutation.mutate({
                              name: newPillarName.trim(),
                              description: newPillarDescription.trim()
                            });
                          }
                        }}
                        disabled={!newPillarName.trim() || createPillarMutation.isPending}
                        data-testid="button-create-pillar"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Pillar
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            )}

            {/* Regenerate Button */}
            {strategicPillars.length > 0 && dataPoints.length > 0 && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (confirm("This will generate new AI suggestions. Your current pillars will remain, but duplicates may be created. Continue?")) {
                      generatePillarsMutation.mutate();
                    }
                  }}
                  disabled={generatePillarsMutation.isPending}
                  data-testid="button-regenerate-pillars"
                >
                  {generatePillarsMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate More Suggestions
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Validation Message */}
            {strategicPillars.length > 0 && strategicPillars.length < 3 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-4">
                <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Define at least 3 strategic pillars before moving to Jobs & Priorities.
                </p>
              </div>
            )}

            {/* Next Steps */}
            {strategicPillars.length >= 3 && (
              <div className="bg-primary/10 border border-primary/30 rounded-md p-4 space-y-2">
                <p className="text-sm font-medium text-primary flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Strategic Pillars Defined
                </p>
                <p className="text-sm text-muted-foreground">
                  You have {strategicPillars.length} strategic pillars. Move to Jobs & Priorities to link specific initiatives to these pillars.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            {(() => {
              const isFinalized = phaseTransfer?.isFinalized || false;
              const [showRegenConfirm, setShowRegenConfirm] = useState(false);
              const [selectedPillarFilter, setSelectedPillarFilter] = useState<number | null>(null);

              // Regenerate mutation
              const regenerateJobsMutation = useMutation({
                mutationFn: async () => {
                  const res = await apiRequest("POST", `/api/projects/${projectId}/job-themes/regenerate`);
                  if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.error || "Failed to regenerate jobs");
                  }
                  return res.json();
                },
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/job-themes`] });
                  toast({
                    title: "Jobs Regenerated",
                    description: "New job recommendations have been generated from your Strategic Pillars.",
                  });
                  setShowRegenConfirm(false);
                },
                onError: (error: Error) => {
                  toast({
                    title: "Regeneration Failed",
                    description: error.message,
                    variant: "destructive",
                  });
                },
              });

              // AI auto-assign to pillars mutation
              const autoAssignPillarsMutation = useMutation({
                mutationFn: async ({ reassignAll = false }: { reassignAll?: boolean }) => {
                  const res = await apiRequest("POST", `/api/projects/${projectId}/job-themes/auto-assign-pillars`, { reassignAll });
                  if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.error || "Failed to auto-assign pillars");
                  }
                  return res.json();
                },
                onSuccess: (data) => {
                  queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/job-themes`] });
                  if (data.assignedCount > 0) {
                    toast({
                      title: "Pillars Auto-Assigned",
                      description: `AI assigned ${data.assignedCount} job${data.assignedCount !== 1 ? 's' : ''} to strategic pillars.`,
                    });
                  } else {
                    toast({
                      title: "No Changes",
                      description: data.message || "All jobs are already assigned to pillars.",
                    });
                  }
                },
                onError: (error: Error) => {
                  toast({
                    title: "Auto-Assignment Failed",
                    description: error.message,
                    variant: "destructive",
                  });
                },
              });

              if (jobThemesLoading) {
                return (
                  <Card>
                    <CardContent className="pt-6 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <p className="text-sm text-muted-foreground">Loading recommendations...</p>
                    </CardContent>
                  </Card>
                );
              }

              // Group jobs by pillar
              const jobsByPillar = new Map<number | null, JobThemeWithKPIs[]>();
              (jobThemesData || []).forEach((job: JobThemeWithKPIs) => {
                const pillarId = job.pillarId || null;
                if (!jobsByPillar.has(pillarId)) {
                  jobsByPillar.set(pillarId, []);
                }
                jobsByPillar.get(pillarId)!.push(job);
              });

              const prioritizedThemes = (jobThemesData || []).filter((t: any) => t.priorityRank !== null).sort((a: any, b: any) => (a.priorityRank || 999) - (b.priorityRank || 999));
              const totalKPIsSelected = prioritizedThemes.reduce((acc: number, t: JobThemeWithKPIs) => acc + (t.kpis?.filter(k => k.isSelected).length || 0), 0);
              
              const canFinalize = prioritizedThemes.length === 3 && 
                prioritizedThemes.every((t: JobThemeWithKPIs) => 
                  t.kpis && t.kpis.some(kpi => kpi.isSelected)
                );

              // Filter jobs based on selected pillar
              const filteredJobs = selectedPillarFilter !== null
                ? (jobThemesData || []).filter((j: JobThemeWithKPIs) => j.pillarId === selectedPillarFilter)
                : (jobThemesData || []);

              const unprioritizedJobs = filteredJobs.filter((t: any) => t.priorityRank === null);

              // Empty state - no pillars or no jobs
              if (strategicPillars.length === 0) {
                return (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4 py-8">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-muted">
                          <Flag className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Define Strategic Pillars First</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Go to the Strategic Pillars tab to define your client's strategic priorities before generating job recommendations.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              if (!jobThemesData || jobThemesData.length === 0) {
                return (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4 py-8">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary/10">
                          <Sparkles className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Generate Job Recommendations</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Based on your {strategicPillars.length} Strategic Pillars, AI will recommend targeted jobs with KPIs.
                          </p>
                        </div>
                        <Button
                          onClick={() => regenerateJobsMutation.mutate()}
                          disabled={regenerateJobsMutation.isPending}
                          data-testid="button-generate-jobs"
                        >
                          {regenerateJobsMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generate from Pillars
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              // Calculate linkage stats
              const unlinkedCount = jobsByPillar.get(null)?.length || 0;
              const linkedCount = (jobThemesData?.length || 0) - unlinkedCount;
              const pillarsWithJobs = strategicPillars.filter(p => (jobsByPillar.get(p.id)?.length || 0) > 0).length;
              const allPillarsHaveJobs = pillarsWithJobs === strategicPillars.length && strategicPillars.length > 0;

              return (
                <>
                  {/* Strategic Context Summary - The Thread from Discovery */}
                  <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0">
                          <Layers className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm mb-2">Strategic Thread</h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                            <span className="bg-muted px-2 py-1 rounded">
                              {new Set(pillarOkrThemeLinks.map(l => l.okrThemeId)).size} OKR Themes
                            </span>
                            <ArrowRight className="w-3 h-3" />
                            <span className="bg-muted px-2 py-1 rounded">
                              {strategicPillars.length} Strategic Pillars
                            </span>
                            <ArrowRight className="w-3 h-3" />
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded font-medium">
                              {jobThemesData?.length || 0} Jobs
                            </span>
                          </div>
                          {/* Linkage Status */}
                          <div className="mt-3 flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              {allPillarsHaveJobs ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                              )}
                              <span className="text-xs">
                                {pillarsWithJobs}/{strategicPillars.length} pillars have linked jobs
                              </span>
                            </div>
                            {unlinkedCount > 0 && (
                              <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 dark:text-amber-400">
                                {unlinkedCount} job{unlinkedCount !== 1 ? 's' : ''} need{unlinkedCount === 1 ? 's' : ''} assignment
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-sm py-1">
                            {prioritizedThemes.length}/3 Selected
                          </Badge>
                          <Badge variant="secondary" className="text-sm py-1">
                            {totalKPIsSelected} KPIs
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Bar */}
                  <div className="flex items-center justify-end gap-2">
                    {!isFinalized && (
                      <>
                        {/* AI Auto-Assign Button - show when there are unassigned jobs */}
                        {unlinkedCount > 0 && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => autoAssignPillarsMutation.mutate({ reassignAll: false })}
                            disabled={autoAssignPillarsMutation.isPending}
                            data-testid="button-auto-assign-pillars"
                          >
                            {autoAssignPillarsMutation.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Assigning...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                AI Assign to Pillars
                              </>
                            )}
                          </Button>
                        )}
                        {showRegenConfirm ? (
                          <div className="flex items-center gap-2 bg-destructive/10 px-3 py-1.5 rounded-md">
                            <span className="text-sm text-destructive">Clear all and regenerate?</span>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => regenerateJobsMutation.mutate()}
                              disabled={regenerateJobsMutation.isPending}
                              data-testid="button-confirm-regenerate"
                            >
                              {regenerateJobsMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Yes"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setShowRegenConfirm(false)}
                              data-testid="button-cancel-regenerate"
                            >
                              No
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowRegenConfirm(true)}
                            data-testid="button-regenerate-jobs"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Regenerate
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Status Banner */}
                  {isFinalized ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-green-900 dark:text-green-100">Discovery Complete</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant={kpiEditMode ? "outline" : "secondary"}
                          size="sm"
                          onClick={() => setKpiEditMode(!kpiEditMode)}
                          data-testid="button-toggle-kpi-edit-mode"
                        >
                          {kpiEditMode ? <Lock className="w-3 h-3 mr-1" /> : <Edit className="w-3 h-3 mr-1" />}
                          {kpiEditMode ? "Lock" : "Edit KPIs"}
                        </Button>
                        <Link href={`/projects/${projectId}/alignment`}>
                          <Button size="sm" data-testid="button-go-to-alignment">
                            Alignment <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : canFinalize ? (
                    <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-primary/10 border border-primary/30">
                      <p className="font-medium">Ready to finalize?</p>
                      <Button
                        onClick={() => finalizeDiscoveryMutation.mutate()}
                        disabled={finalizeDiscoveryMutation.isPending}
                        data-testid="button-finalize-discovery"
                      >
                        {finalizeDiscoveryMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Finalize Discovery
                      </Button>
                    </div>
                  ) : prioritizedThemes.length > 0 && prioritizedThemes.length < 3 ? (
                    <div className="p-3 rounded-lg bg-muted text-sm">
                      Select {3 - prioritizedThemes.length} more {3 - prioritizedThemes.length !== 1 ? 'priorities' : 'priority'} to finalize
                    </div>
                  ) : null}

                  {/* ========== STEP 1: YOUR SELECTED PRIORITIES ========== */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">1</div>
                      <div>
                        <h2 className="text-lg font-semibold">Your Selected Priorities</h2>
                        <p className="text-sm text-muted-foreground">Select 3 jobs to focus on for this engagement</p>
                      </div>
                    </div>
                    
                    {/* Priority Slots - Always show 3 slots */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[0, 1, 2].map((slotIndex) => {
                        const theme = prioritizedThemes[slotIndex];
                        const linkedPillar = theme ? strategicPillars.find(p => p.id === theme.pillarId) : null;
                        
                        if (theme) {
                          return (
                            <Card key={slotIndex} className="border-primary bg-primary/5" data-testid={`priority-slot-${slotIndex}`}>
                              <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                  <Badge className="bg-primary text-primary-foreground">Priority #{slotIndex + 1}</Badge>
                                  {!isFinalized && (
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6"
                                      onClick={() => {
                                        const newPrioritized = prioritizedThemes.filter((t: JobThemeWithKPIs) => t.id !== theme.id).map((t: JobThemeWithKPIs) => t.id);
                                        prioritizeJobsMutation.mutate({ prioritizedIds: newPrioritized });
                                      }}
                                      disabled={prioritizeJobsMutation.isPending}
                                      data-testid={`button-remove-priority-${theme.id}`}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0 space-y-3">
                                <div>
                                  <h3 className="font-semibold text-sm line-clamp-2">{theme.jobName}</h3>
                                  <p className="text-xs text-muted-foreground">{theme.capabilityName}</p>
                                </div>
                                
                                {/* Pillar Assignment */}
                                <div className="space-y-1">
                                  <label className="text-xs font-medium text-muted-foreground">Strategic Pillar:</label>
                                  {!isFinalized ? (
                                    <Select
                                      value={theme.pillarId?.toString() || ""}
                                      onValueChange={(value) => {
                                        if (handlePillarLink) {
                                          handlePillarLink(theme.id, value === "unlink" ? null : value ? parseInt(value) : null);
                                        }
                                      }}
                                    >
                                      <SelectTrigger className="h-8 text-xs" data-testid={`priority-assign-pillar-${theme.id}`}>
                                        <SelectValue>
                                          {linkedPillar ? (
                                            <span className="flex items-center gap-1 text-foreground">
                                              <Flag className="w-3 h-3 text-primary" />
                                              {linkedPillar.name.length > 15 ? linkedPillar.name.slice(0, 15) + "..." : linkedPillar.name}
                                            </span>
                                          ) : (
                                            <span className="text-muted-foreground italic">Click to assign...</span>
                                          )}
                                        </SelectValue>
                                      </SelectTrigger>
                                      <SelectContent>
                                        {theme.pillarId && (
                                          <SelectItem value="unlink" className="text-muted-foreground">
                                            Remove from pillar
                                          </SelectItem>
                                        )}
                                        {strategicPillars.filter(p => p.id !== theme.pillarId).map((p) => (
                                          <SelectItem key={p.id} value={p.id.toString()}>
                                            {p.name.length > 30 ? p.name.slice(0, 30) + "..." : p.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : linkedPillar ? (
                                    <Badge variant="outline" className="text-xs w-full justify-center">
                                      <Flag className="w-3 h-3 mr-1" />
                                      {linkedPillar.name.length > 18 ? linkedPillar.name.slice(0, 18) + "..." : linkedPillar.name}
                                    </Badge>
                                  ) : (
                                    <span className="text-xs text-muted-foreground italic">No pillar assigned</span>
                                  )}
                                </div>
                                
                                <div className="flex items-center justify-between text-xs">
                                  <span className="flex items-center gap-1 text-muted-foreground">
                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                    {theme.kpis?.filter(k => k.isSelected).length || 0} KPIs
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        } else {
                          return (
                            <Card key={slotIndex} className="border-dashed border-2 bg-muted/20" data-testid={`priority-slot-empty-${slotIndex}`}>
                              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="w-10 h-10 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center mb-2">
                                  <span className="text-muted-foreground/50 font-medium">{slotIndex + 1}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">Empty slot</p>
                                <p className="text-xs text-muted-foreground/70">Select a job below</p>
                              </CardContent>
                            </Card>
                          );
                        }
                      })}
                    </div>
                    
                    {/* Progress indicator */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{prioritizedThemes.length} of 3 priorities selected</span>
                          {prioritizedThemes.length === 3 && <CheckCircle className="w-4 h-4 text-green-600" />}
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-300" 
                            style={{ width: `${(prioritizedThemes.length / 3) * 100}%` }}
                          />
                        </div>
                      </div>
                      {canFinalize && !isFinalized && (
                        <Button
                          onClick={() => finalizeDiscoveryMutation.mutate()}
                          disabled={finalizeDiscoveryMutation.isPending}
                          data-testid="button-finalize-inline"
                        >
                          {finalizeDiscoveryMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Finalize
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  {/* ========== STEP 2: BROWSE & SELECT JOBS ========== */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">2</div>
                    <div>
                      <h2 className="text-lg font-semibold">Browse & Select Jobs</h2>
                      <p className="text-sm text-muted-foreground">Click "Add to Priorities" on any job to select it</p>
                    </div>
                  </div>

                  {/* Available Jobs Section */}
                  <div className="space-y-4">
                    {/* Sticky Filter Section */}
                    <div className="sticky top-0 z-10 bg-background py-3 -mx-4 px-4 border-b">
                      <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                          Jobs by Pillar
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {jobThemesData?.length || 0} total • {prioritizedThemes.length}/3 prioritized
                        </span>
                      </div>
                    
                      {/* Pillar Filter Tabs */}
                      <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant={selectedPillarFilter === null ? "default" : "outline"}
                        onClick={() => setSelectedPillarFilter(null)}
                        data-testid="filter-all"
                      >
                        All ({jobThemesData?.length || 0})
                      </Button>
                      {(jobsByPillar.get(null)?.length || 0) > 0 && (
                        <Button
                          size="sm"
                          variant={selectedPillarFilter === -1 ? "default" : "outline"}
                          onClick={() => setSelectedPillarFilter(-1)}
                          className={selectedPillarFilter === -1 ? "" : "border-amber-300 text-amber-700 dark:text-amber-400"}
                          data-testid="filter-unassigned"
                        >
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Unassigned ({jobsByPillar.get(null)?.length || 0})
                        </Button>
                      )}
                      {strategicPillars.map(pillar => {
                        const count = jobsByPillar.get(pillar.id)?.length || 0;
                        if (count === 0) return null;
                        return (
                          <Button
                            key={pillar.id}
                            size="sm"
                            variant={selectedPillarFilter === pillar.id ? "default" : "outline"}
                            onClick={() => setSelectedPillarFilter(pillar.id)}
                            data-testid={`filter-pillar-${pillar.id}`}
                          >
                            {pillar.name.length > 15 ? pillar.name.slice(0, 15) + "..." : pillar.name} ({count})
                          </Button>
                        );
                      })}
                      </div>
                    </div>
                    
                    {/* Filtered Job List */}
                    {(() => {
                      // Determine which jobs to display based on filter
                      const getFilteredJobs = (): JobThemeWithKPIs[] => {
                        if (selectedPillarFilter === null) {
                          // Show ALL jobs including prioritized ones
                          return jobThemesData || [];
                        } else if (selectedPillarFilter === -1) {
                          return jobsByPillar.get(null) || [];
                        } else {
                          return jobsByPillar.get(selectedPillarFilter) || [];
                        }
                      };
                      
                      const filteredJobs = getFilteredJobs();
                      const showingUnassigned = selectedPillarFilter === -1;
                      
                      if (filteredJobs.length === 0) {
                        return (
                          <div className="text-center py-8 text-muted-foreground">
                            <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No jobs found for this filter.</p>
                          </div>
                        );
                      }
                      
                      return (
                        <Card className={showingUnassigned ? "border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/10" : ""}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <div className="flex items-center gap-3">
                                {showingUnassigned ? (
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 shrink-0">
                                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                  </div>
                                ) : selectedPillarFilter !== null ? (
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 shrink-0">
                                    <Flag className="w-4 h-4 text-primary" />
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted shrink-0">
                                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                )}
                                <div>
                                  <CardTitle className="text-base">
                                    {showingUnassigned 
                                      ? "Unassigned Jobs" 
                                      : selectedPillarFilter !== null 
                                        ? strategicPillars.find(p => p.id === selectedPillarFilter)?.name 
                                        : "All Available Jobs"}
                                  </CardTitle>
                                  <CardDescription>
                                    {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
                                    {showingUnassigned && " need pillar assignment"}
                                  </CardDescription>
                                </div>
                              </div>
                              {showingUnassigned && !isFinalized && (
                                <Button
                                  size="sm"
                                  onClick={() => autoAssignPillarsMutation.mutate({ reassignAll: false })}
                                  disabled={autoAssignPillarsMutation.isPending}
                                  data-testid="button-auto-assign-inline"
                                >
                                  {autoAssignPillarsMutation.isPending ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Assigning...
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-4 h-4 mr-2" />
                                      AI Assign All
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {filteredJobs.map((theme: JobThemeWithKPIs) => {
                              const canSelect = !isFinalized && prioritizedThemes.length < 3 && !prioritizedThemes.some((t: JobThemeWithKPIs) => t.id === theme.id);
                              const isPrioritized = prioritizedThemes.some((t: JobThemeWithKPIs) => t.id === theme.id);
                              const priorityIndex = prioritizedThemes.findIndex((t: JobThemeWithKPIs) => t.id === theme.id);
                              const linkedPillar = strategicPillars.find(p => p.id === theme.pillarId);
                              const needsAssignment = !theme.pillarId;
                              
                              return (
                                <Collapsible key={theme.id}>
                                  <div className={`p-3 rounded-lg border ${isPrioritized ? 'bg-primary/5 border-primary/30' : needsAssignment ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800' : 'bg-muted/30'}`} data-testid={`job-card-${theme.id}`}>
                                    <div className="flex items-center justify-between gap-3 flex-wrap">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          {isPrioritized && (
                                            <Badge className="bg-primary text-primary-foreground text-xs">#{priorityIndex + 1}</Badge>
                                          )}
                                          <span className="font-medium text-sm">{theme.jobName}</span>
                                          {linkedPillar && selectedPillarFilter === null && (
                                            <Badge variant="outline" className="text-xs">
                                              <Flag className="w-3 h-3 mr-1" />
                                              {linkedPillar.name.length > 15 ? linkedPillar.name.slice(0, 15) + "..." : linkedPillar.name}
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                          {theme.capabilityName} • {theme.kpis?.filter(k => k.isSelected).length || 0} KPIs
                                        </p>
                                        {theme.pillarLinkageNarrative && (
                                          <p className="text-xs text-muted-foreground mt-1 italic line-clamp-1">
                                            {theme.pillarLinkageNarrative}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        {!isFinalized && (
                                          <Select
                                            value={theme.pillarId?.toString() || ""}
                                            onValueChange={(value) => {
                                              if (handlePillarLink) {
                                                handlePillarLink(theme.id, value === "unlink" ? null : value ? parseInt(value) : null);
                                              }
                                            }}
                                          >
                                            <SelectTrigger className="h-8 w-[180px] text-xs" data-testid={`assign-pillar-${theme.id}`}>
                                              <SelectValue placeholder="Assign to pillar..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {theme.pillarId && (
                                                <SelectItem value="unlink" className="text-muted-foreground">
                                                  Remove from pillar
                                                </SelectItem>
                                              )}
                                              {strategicPillars.filter(p => p.id !== theme.pillarId).map((p) => (
                                                <SelectItem key={p.id} value={p.id.toString()}>
                                                  {p.name.length > 25 ? p.name.slice(0, 25) + "..." : p.name}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        )}
                                        {canSelect && (
                                          <Button
                                            size="sm"
                                            onClick={() => {
                                              const currentIds = prioritizedThemes.map((t: JobThemeWithKPIs) => t.id);
                                              const newPrioritized = [...currentIds, theme.id].slice(0, 3);
                                              prioritizeJobsMutation.mutate({ prioritizedIds: newPrioritized });
                                            }}
                                            disabled={prioritizeJobsMutation.isPending}
                                            data-testid={`button-prioritize-${theme.id}`}
                                          >
                                            <Star className="w-3 h-3 mr-1" />
                                            Add to Priorities
                                          </Button>
                                        )}
                                        {isPrioritized && !isFinalized && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                              const newPrioritized = prioritizedThemes.filter((t: JobThemeWithKPIs) => t.id !== theme.id).map((t: JobThemeWithKPIs) => t.id);
                                              prioritizeJobsMutation.mutate({ prioritizedIds: newPrioritized });
                                            }}
                                            disabled={prioritizeJobsMutation.isPending}
                                            data-testid={`button-remove-priority-${theme.id}`}
                                          >
                                            <X className="w-3 h-3 mr-1" />
                                            Remove
                                          </Button>
                                        )}
                                        <CollapsibleTrigger asChild>
                                          <Button variant="ghost" size="sm" data-testid={`expand-job-${theme.id}`}>
                                            <ChevronDown className="w-4 h-4" />
                                          </Button>
                                        </CollapsibleTrigger>
                                      </div>
                                    </div>
                                  </div>
                                  <CollapsibleContent>
                                    <div className="mt-2 p-4 rounded-lg bg-muted/20 border">
                                      <JobThemeCard 
                                        theme={theme} 
                                        rank={isPrioritized ? priorityIndex + 1 : null} 
                                        projectId={projectId}
                                        updateKPIMutation={updateKPIMutation}
                                        isFinalized={isFinalized}
                                        editMode={kpiEditMode || !isFinalized}
                                        onDeselect={() => {}}
                                        pillars={strategicPillars?.map(p => ({ id: p.id, name: p.name })) || []}
                                        onPillarLink={handlePillarLink}
                                      />
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              );
                            })}
                          </CardContent>
                        </Card>
                      );
                    })()}

                    {/* Empty State - when no jobs at all */}
                    {(jobThemesData?.length || 0) === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">No jobs generated yet</p>
                        <p className="text-sm mt-1">Click "Regenerate" to create job recommendations from your Strategic Pillars.</p>
                      </div>
                    )}
                  </div>
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
