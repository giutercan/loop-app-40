import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, Target, Award, Check } from "lucide-react";
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
    if (score >= 8) return "text-green-600 dark:text-green-400";
    if (score >= 6) return "text-yellow-600 dark:text-yellow-400";
    return "text-orange-600 dark:text-orange-400";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 8) return "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300";
    if (score >= 6) return "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300";
    return "bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-kpi-recommendations">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered KPI Recommendations
          </DialogTitle>
          <DialogDescription>
            Strategic KPIs for "{jobName}" - curated by Korn Ferry's knowledge base
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              Loading recommendations...
            </div>
          )}

          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <p className="text-destructive">Failed to load recommendations</p>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && recommendations.length === 0 && (
            <div className="text-center py-8 space-y-4">
              <p className="text-muted-foreground">No recommendations generated yet</p>
              <Button 
                onClick={handleGenerateRecommendations} 
                disabled={generateMutation.isPending}
                data-testid="button-generate-recommendations"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {generateMutation.isPending ? "Generating..." : "Generate Recommendations"}
              </Button>
            </div>
          )}

          {recommendations.length > 0 && (
            <>
              <div className="flex items-center justify-between border-b pb-3">
                <p className="text-sm text-muted-foreground">
                  {recommendations.length} strategic KPI{recommendations.length > 1 ? 's' : ''} recommended
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleGenerateRecommendations}
                  disabled={generateMutation.isPending}
                  data-testid="button-regenerate-recommendations"
                >
                  <Sparkles className="mr-2 h-3 w-3" />
                  {generateMutation.isPending ? "Regenerating..." : "Regenerate"}
                </Button>
              </div>

              <div className="space-y-3">
                {recommendations.map((kpi) => (
                  <Card 
                    key={kpi.id} 
                    className={selectedKPIs.has(kpi.id) ? "border-primary bg-primary/5" : ""}
                    data-testid={`card-recommended-kpi-${kpi.id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant="default" className="bg-primary">
                              <Award className="mr-1 h-3 w-3" />
                              Korn Ferry Recommended
                            </Badge>
                            <Badge variant="outline">
                              {kpi.kpiType === "primary" ? "Primary KPI" : "Supporting KPI"}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{kpi.kpiName}</CardTitle>
                          <CardDescription className="mt-1">{kpi.definition}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Strategic Rationale */}
                      <div className="bg-muted/50 rounded-md p-3">
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          Strategic Value
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {kpi.aiStrategicRationale}
                        </p>
                      </div>

                      {/* Scores */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Achievability</p>
                          <div className="flex items-center gap-2">
                            <Target className={`h-4 w-4 ${getScoreColor(kpi.aiAchievabilityScore || 0)}`} />
                            <span className={`text-2xl font-bold ${getScoreColor(kpi.aiAchievabilityScore || 0)}`}>
                              {kpi.aiAchievabilityScore}/10
                            </span>
                            <Badge className={getScoreBadge(kpi.aiAchievabilityScore || 0)}>
                              {(kpi.aiAchievabilityScore || 0) >= 8 ? "High" : (kpi.aiAchievabilityScore || 0) >= 6 ? "Medium" : "Low"}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Value Impact</p>
                          <div className="flex items-center gap-2">
                            <TrendingUp className={`h-4 w-4 ${getScoreColor(kpi.aiValueImpactScore || 0)}`} />
                            <span className={`text-2xl font-bold ${getScoreColor(kpi.aiValueImpactScore || 0)}`}>
                              {kpi.aiValueImpactScore}/10
                            </span>
                            <Badge className={getScoreBadge(kpi.aiValueImpactScore || 0)}>
                              {(kpi.aiValueImpactScore || 0) >= 8 ? "High" : (kpi.aiValueImpactScore || 0) >= 6 ? "Medium" : "Low"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Korn Ferry Benchmark */}
                      {kpi.aiKornFerryBenchmark && (
                        <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
                          <h4 className="text-sm font-medium mb-1 flex items-center gap-2 text-primary">
                            <Award className="h-4 w-4" />
                            Korn Ferry Benchmark
                          </h4>
                          <p className="text-sm">
                            {kpi.aiKornFerryBenchmark}
                          </p>
                        </div>
                      )}

                      {/* Measurement Details */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Unit: <strong>{kpi.unit}</strong></span>
                        <span className="text-muted-foreground/50">•</span>
                        <span>Frequency: <strong>{kpi.measurementFrequency}</strong></span>
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Button
                        onClick={() => handleSelectKPI(kpi.id)}
                        disabled={selectedKPIs.has(kpi.id) || selectMutation.isPending}
                        className="w-full"
                        variant={selectedKPIs.has(kpi.id) ? "outline" : "default"}
                        data-testid={`button-select-kpi-${kpi.id}`}
                      >
                        {selectedKPIs.has(kpi.id) ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Added to Tracking
                          </>
                        ) : (
                          <>
                            <Target className="mr-2 h-4 w-4" />
                            Select for Tracking
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
