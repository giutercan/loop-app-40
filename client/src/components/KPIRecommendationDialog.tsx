import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sparkles, TrendingUp, Target, Award, Check, Zap, BarChart3, Clock, CheckCircle2, Lightbulb, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { JobThemeKPI } from "@shared/schema";

interface IndustryBenchmark {
  low: string;
  median: string;
  high: string;
  source: string;
}

interface TargetRecommendation {
  suggestedTarget: string;
  achievementRationale: string;
  timeframeMonths: number;
  successFactors: string[];
}

interface KPIRecommendationDialogProps {
  jobThemeId: number;
  jobName: string;
  projectId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function KPIRecommendationDialog({ jobThemeId, jobName, projectId, open, onOpenChange }: KPIRecommendationDialogProps) {
  const { toast } = useToast();
  const [selectedKPIs, setSelectedKPIs] = useState<Set<number>>(new Set());
  const [editingTargetId, setEditingTargetId] = useState<number | null>(null);
  const [editedTargets, setEditedTargets] = useState<Record<number, string>>({});

  // Reset editing state when dialog closes
  useEffect(() => {
    if (!open) {
      setEditingTargetId(null);
    }
  }, [open]);

  // Fetch AI recommendations
  const { data: recommendations = [], isLoading, error } = useQuery<JobThemeKPI[]>({
    queryKey: [`/api/job-themes/${jobThemeId}/recommend-kpis`],
    enabled: open,
  });

  // Generate recommendations mutation (triggered by button)
  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/job-themes/${jobThemeId}/recommend-kpis`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/job-themes/${jobThemeId}/recommend-kpis`] });
      queryClient.invalidateQueries({ queryKey: [`/api/job-themes/${jobThemeId}/kpis`] });
      toast({
        title: "AI Recommendations Generated",
        description: "Strategic outcomes have been suggested based on Korn Ferry's knowledge base",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate outcome recommendations",
        variant: "destructive",
      });
    },
  });

  // Select a recommended KPI mutation with optional target value
  const selectMutation = useMutation({
    mutationFn: async ({ kpiId, targetValue }: { kpiId: number; targetValue?: string }) => {
      const payload: { isSelected: boolean; targetValue?: string } = { isSelected: true };
      if (targetValue) {
        payload.targetValue = targetValue;
      }
      const res = await apiRequest("PATCH", `/api/job-theme-kpis/${kpiId}`, payload);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate both the KPIs list and the finalized jobs data
      queryClient.invalidateQueries({ queryKey: [`/api/job-themes/${jobThemeId}/kpis`] });
      queryClient.invalidateQueries({ queryKey: [`/api/job-themes/${jobThemeId}/recommend-kpis`] });
      
      // Invalidate finalized jobs query to refresh the Alignment page
      const finalizedJobsKey = `/api/projects/${projectId}/alignment/finalized-jobs`;
      queryClient.invalidateQueries({ 
        queryKey: [finalizedJobsKey],
        refetchType: "all"
      });
      
      toast({
        title: "Outcome Selected",
        description: "Added to your tracking list with your target value",
      });
    },
  });

  const handleSelectKPI = async (kpiId: number) => {
    // Optimistically update UI
    setSelectedKPIs(prev => new Set(prev).add(kpiId));
    
    // Get the edited target value if any, or the AI suggested target
    const kpi = recommendations.find(k => k.id === kpiId);
    const targetRec = kpi?.aiTargetRecommendation as TargetRecommendation | null;
    const targetValue = editedTargets[kpiId] || targetRec?.suggestedTarget;
    
    try {
      await selectMutation.mutateAsync({ kpiId, targetValue });
      // Clear the editing state
      setEditingTargetId(null);
    } catch (error) {
      // Revert optimistic update on failure
      setSelectedKPIs(prev => {
        const updated = new Set(prev);
        updated.delete(kpiId);
        return updated;
      });
    }
  };

  // Handle target value edit
  const handleTargetEdit = (kpiId: number, value: string) => {
    setEditedTargets(prev => ({ ...prev, [kpiId]: value }));
  };

  // Get the display target (edited or AI suggested)
  const getDisplayTarget = (kpi: JobThemeKPI): string => {
    const targetRec = kpi.aiTargetRecommendation as TargetRecommendation | null;
    return editedTargets[kpi.id] || targetRec?.suggestedTarget || '';
  };

  const handleGenerateRecommendations = async () => {
    await generateMutation.mutateAsync();
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" data-testid="dialog-kpi-recommendations">
        <DialogHeader className="space-y-3 pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">AI-Powered Outcome Recommendations</DialogTitle>
              <DialogDescription className="text-base mt-1">
                Strategic metrics for <span className="font-medium text-foreground">"{jobName}"</span> curated by Korn Ferry AI
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Loading strategic insights...</p>
            </div>
          )}

          {error && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6">
                <p className="text-destructive font-medium">Failed to load recommendations</p>
                <p className="text-sm text-muted-foreground mt-1">Please try again or contact support</p>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && recommendations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">No recommendations yet</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Generate AI-powered outcome suggestions tailored to this job theme
                </p>
              </div>
              <Button 
                onClick={handleGenerateRecommendations} 
                disabled={generateMutation.isPending}
                size="lg"
                className="mt-2"
                data-testid="button-generate-recommendations"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {generateMutation.isPending ? "Generating..." : "Generate Recommendations"}
              </Button>
            </div>
          )}

          {recommendations.length > 0 && (
            <>
              {/* Header with count and regenerate */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="px-3 py-1">
                    {recommendations.length} recommendation{recommendations.length > 1 ? 's' : ''}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Powered by Korn Ferry AI</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleGenerateRecommendations}
                  disabled={generateMutation.isPending}
                  data-testid="button-regenerate-recommendations"
                >
                  <Zap className="mr-2 h-3 w-3" />
                  {generateMutation.isPending ? "Regenerating..." : "Regenerate"}
                </Button>
              </div>

              {/* KPI Cards */}
              <div className="grid gap-4">
                {recommendations.map((kpi) => {
                  const isSelected = selectedKPIs.has(kpi.id);
                  const achievabilityScore = kpi.aiAchievabilityScore || 0;
                  const impactScore = kpi.aiValueImpactScore || 0;
                  
                  return (
                    <Card 
                      key={kpi.id} 
                      className={`relative overflow-hidden transition-all ${
                        isSelected 
                          ? "border-primary/50 bg-primary/5 shadow-sm" 
                          : "hover-elevate"
                      }`}
                      data-testid={`card-recommended-kpi-${kpi.id}`}
                    >
                      {/* Gradient accent bar */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500" />
                      
                      <CardContent className="pt-6 space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
                                <Award className="mr-1 h-3 w-3" />
                                Korn Ferry Recommended
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {kpi.kpiType === "primary" ? "Primary" : "Supporting"}
                              </Badge>
                            </div>
                            <h3 className="text-lg font-semibold leading-tight">{kpi.kpiName}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{kpi.definition}</p>
                          </div>
                          
                          {/* Action Button */}
                          <Button
                            onClick={() => handleSelectKPI(kpi.id)}
                            disabled={isSelected || selectMutation.isPending}
                            variant={isSelected ? "outline" : "default"}
                            size="sm"
                            className="shrink-0"
                            data-testid={`button-select-kpi-${kpi.id}`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                Added
                              </>
                            ) : (
                              <>
                                <Target className="mr-2 h-4 w-4" />
                                Select
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Scores - Modern horizontal layout */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* Achievability Score */}
                          <div className={`rounded-lg p-3 ${getScoreBackground(achievabilityScore)}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-muted-foreground">Achievability</span>
                              <Target className={`h-4 w-4 ${getScoreColor(achievabilityScore)}`} />
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className={`text-3xl font-bold ${getScoreColor(achievabilityScore)}`}>
                                {achievabilityScore}
                              </span>
                              <span className="text-sm text-muted-foreground">/10</span>
                            </div>
                            {/* Progress bar */}
                            <div className="mt-2 h-1.5 bg-white/50 dark:bg-black/20 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all ${
                                  achievabilityScore >= 8 
                                    ? "bg-emerald-500" 
                                    : achievabilityScore >= 6 
                                    ? "bg-amber-500" 
                                    : "bg-orange-500"
                                }`}
                                style={{ width: `${achievabilityScore * 10}%` }}
                              />
                            </div>
                          </div>

                          {/* Value Impact Score */}
                          <div className={`rounded-lg p-3 ${getScoreBackground(impactScore)}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-muted-foreground">Value Impact</span>
                              <TrendingUp className={`h-4 w-4 ${getScoreColor(impactScore)}`} />
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className={`text-3xl font-bold ${getScoreColor(impactScore)}`}>
                                {impactScore}
                              </span>
                              <span className="text-sm text-muted-foreground">/10</span>
                            </div>
                            {/* Progress bar */}
                            <div className="mt-2 h-1.5 bg-white/50 dark:bg-black/20 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all ${
                                  impactScore >= 8 
                                    ? "bg-emerald-500" 
                                    : impactScore >= 6 
                                    ? "bg-amber-500" 
                                    : "bg-orange-500"
                                }`}
                                style={{ width: `${impactScore * 10}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Industry Benchmark Range - Visual display */}
                        {(() => {
                          const benchmark = kpi.aiIndustryBenchmark as IndustryBenchmark | null;
                          if (!benchmark) return null;
                          return (
                            <div className="rounded-lg bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/40 dark:to-gray-950/40 border border-slate-200/50 dark:border-slate-700/50 p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                                  <BarChart3 className="h-3.5 w-3.5" />
                                  Industry Benchmark Range
                                </div>
                                <span className="text-[10px] text-muted-foreground italic">{benchmark.source}</span>
                              </div>
                              
                              {/* Visual benchmark bar */}
                              <div className="relative pt-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex flex-col items-center">
                                    <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{benchmark.low}</span>
                                    <span className="text-[10px] text-muted-foreground">Bottom 25%</span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{benchmark.median}</span>
                                    <span className="text-[10px] text-muted-foreground">Median</span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{benchmark.high}</span>
                                    <span className="text-[10px] text-muted-foreground">Top 25%</span>
                                  </div>
                                </div>
                                <div className="h-2 rounded-full bg-gradient-to-r from-orange-200 via-amber-200 to-emerald-200 dark:from-orange-900/50 dark:via-amber-900/50 dark:to-emerald-900/50" />
                              </div>
                            </div>
                          );
                        })()}

                        {/* Target Achievement Recommendation - Editable */}
                        {(() => {
                          const target = kpi.aiTargetRecommendation as TargetRecommendation | null;
                          if (!target) return null;
                          const isEditingThis = editingTargetId === kpi.id;
                          const displayTarget = getDisplayTarget(kpi);
                          const hasEditedTarget = editedTargets[kpi.id] !== undefined;
                          
                          return (
                            <div className="rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200/50 dark:border-emerald-800/50 p-4 space-y-3">
                              {/* Target header with editable value */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/50">
                                    <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-emerald-800 dark:text-emerald-200">
                                        {hasEditedTarget ? 'Your Target' : 'Recommended Target'}
                                      </span>
                                      {hasEditedTarget && (
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-emerald-400 text-emerald-700 dark:text-emerald-300">
                                          Edited
                                        </Badge>
                                      )}
                                    </div>
                                    {isEditingThis ? (
                                      <div className="flex items-center gap-2 mt-1">
                                        <Input
                                          value={editedTargets[kpi.id] ?? target.suggestedTarget}
                                          onChange={(e) => handleTargetEdit(kpi.id, e.target.value)}
                                          className="h-9 text-lg font-bold w-32 bg-white dark:bg-emerald-950"
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              setEditingTargetId(null);
                                            }
                                            if (e.key === 'Escape') {
                                              setEditingTargetId(null);
                                              setEditedTargets(prev => {
                                                const updated = { ...prev };
                                                delete updated[kpi.id];
                                                return updated;
                                              });
                                            }
                                          }}
                                          autoFocus
                                          data-testid={`input-edit-target-${kpi.id}`}
                                        />
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => setEditingTargetId(null)}
                                          className="h-8 px-2 text-emerald-700"
                                        >
                                          Done
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{displayTarget}</span>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          onClick={() => setEditingTargetId(kpi.id)}
                                          className="h-7 w-7 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100"
                                          data-testid={`button-edit-target-${kpi.id}`}
                                        >
                                          <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 border-0 shrink-0">
                                  <Clock className="mr-1 h-3 w-3" />
                                  {target.timeframeMonths} months
                                </Badge>
                              </div>

                              {/* Achievement rationale */}
                              <div className="flex gap-2 bg-white/60 dark:bg-black/20 rounded-md p-3">
                                <Lightbulb className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                <p className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">
                                  {target.achievementRationale}
                                </p>
                              </div>

                              {/* Success factors */}
                              <div className="space-y-1.5">
                                <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Why This Is Achievable:</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                  {target.successFactors.map((factor, idx) => (
                                    <div key={idx} className="flex items-start gap-1.5 text-sm text-emerald-700 dark:text-emerald-300">
                                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-500" />
                                      <span>{factor}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Strategic Rationale */}
                        <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            Strategic Value
                          </div>
                          <p className="text-sm leading-relaxed">
                            {kpi.aiStrategicRationale}
                          </p>
                        </div>

                        {/* Korn Ferry Benchmark (legacy/fallback) */}
                        {kpi.aiKornFerryBenchmark && !kpi.aiIndustryBenchmark && (
                          <div className="rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200/50 dark:border-blue-800/50 p-3 space-y-1">
                            <div className="flex items-center gap-2 text-xs font-medium text-blue-900 dark:text-blue-100">
                              <Award className="h-3 w-3" />
                              Korn Ferry Benchmark
                            </div>
                            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                              {kpi.aiKornFerryBenchmark}
                            </p>
                          </div>
                        )}

                        {/* Measurement Details */}
                        <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground pt-2 border-t">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium">Unit:</span>
                            <Badge variant="secondary" className="text-xs">{kpi.unit}</Badge>
                          </div>
                          <div className="w-px h-3 bg-border" />
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium">Frequency:</span>
                            <Badge variant="secondary" className="text-xs">{kpi.measurementFrequency}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
