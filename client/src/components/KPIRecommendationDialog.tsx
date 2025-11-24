import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, TrendingUp, Target, Award, Check, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { JobThemeKPI } from "@shared/schema";

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
        description: "Strategic KPIs have been suggested based on Korn Ferry's knowledge base",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate KPI recommendations",
        variant: "destructive",
      });
    },
  });

  // Select a recommended KPI mutation
  const selectMutation = useMutation({
    mutationFn: async (kpiId: number) => {
      const res = await apiRequest("PATCH", `/api/job-theme-kpis/${kpiId}`, { isSelected: true });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate both the KPIs list and the finalized jobs data
      queryClient.invalidateQueries({ queryKey: [`/api/job-themes/${jobThemeId}/kpis`] });
      
      // Invalidate finalized jobs query to refresh the Alignment page
      // Use refetchType: "all" to force refetch even if query is inactive
      const finalizedJobsKey = `/api/projects/${projectId}/alignment/finalized-jobs`;
      console.log(`[KPI Selection] Invalidating finalized jobs with key: ${finalizedJobsKey}, projectId:`, projectId);
      queryClient.invalidateQueries({ 
        queryKey: [finalizedJobsKey],
        refetchType: "all"
      });
      
      toast({
        title: "KPI Selected",
        description: "Added to your tracking list",
      });
    },
  });

  const handleSelectKPI = async (kpiId: number) => {
    // Optimistically update UI
    setSelectedKPIs(prev => new Set(prev).add(kpiId));
    
    try {
      await selectMutation.mutateAsync(kpiId);
    } catch (error) {
      // Revert optimistic update on failure
      setSelectedKPIs(prev => {
        const updated = new Set(prev);
        updated.delete(kpiId);
        return updated;
      });
    }
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
              <DialogTitle className="text-2xl">AI-Powered KPI Recommendations</DialogTitle>
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
                  Generate AI-powered KPI suggestions tailored to this job theme
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

                        {/* Korn Ferry Benchmark */}
                        {kpi.aiKornFerryBenchmark && (
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
                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t">
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
