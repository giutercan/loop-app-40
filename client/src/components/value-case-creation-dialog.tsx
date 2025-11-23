import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Sparkles, Plus, CheckCircle2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ValueCaseRecommendation {
  name: string;
  description: string;
  linkedJobThemeIds: number[];
  suggestedKPIs: string[];
  estimatedNPV: string;
  estimatedPaybackMonths: number;
  rationale: string;
}

interface ValueCaseCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
}

export function ValueCaseCreationDialog({ open, onOpenChange, projectId }: ValueCaseCreationDialogProps) {
  const { toast } = useToast();
  const [selectedRecommendation, setSelectedRecommendation] = useState<ValueCaseRecommendation | null>(null);
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  // Fetch AI recommendations
  const { data: recommendationsData, isLoading, error } = useQuery({
    queryKey: [`/api/projects/${projectId}/value-cases/generate-recommendations`],
    queryFn: async () => {
      const response = await apiRequest(
        "POST",
        `/api/projects/${projectId}/value-cases/generate-recommendations`,
        {}
      );
      const data = await response.json();
      return data as { recommendations: ValueCaseRecommendation[] };
    },
    enabled: open, // Only fetch when dialog is open
    retry: false, // Don't retry on error
  });

  // Create value case mutation
  const createValueCaseMutation = useMutation({
    mutationFn: async (recommendation: ValueCaseRecommendation) => {
      return apiRequest("POST", `/api/projects/${projectId}/value-cases`, {
        title: recommendation.name,
        rationale: recommendation.rationale,
        status: "draft",
        linkedJobThemeIds: recommendation.linkedJobThemeIds,
        suggestedKPIs: recommendation.suggestedKPIs,
        estimatedNPV: recommendation.estimatedNPV,
        estimatedPaybackMonths: recommendation.estimatedPaybackMonths,
        capabilityName: null,
        solutionArea: null,
        calculationInputs: {},
        calculationResults: {},
        linkedInsights: [],
        confidence: "medium",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/value-cases`] });
      toast({
        title: "Value case created",
        description: "Your value case has been created successfully.",
      });
      onOpenChange(false);
      setSelectedRecommendation(null);
      setIsCreatingCustom(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create value case",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateFromRecommendation = () => {
    if (selectedRecommendation) {
      createValueCaseMutation.mutate(selectedRecommendation);
    }
  };

  const handleCreateCustom = () => {
    // Close dialog and trigger custom creation flow (handled by parent)
    setIsCreatingCustom(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Create Value Case
          </DialogTitle>
          <DialogDescription>
            AI-generated recommendations based on your finalized Discovery jobs and KPIs. Select one to create, or start from scratch.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3" data-testid="loading-recommendations">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing your Discovery data to generate recommendations...</p>
          </div>
        )}

        {error && (
          <div className="py-8" data-testid="error-recommendations">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Unable to generate recommendations</CardTitle>
                <CardDescription>
                  {error.message || "Failed to generate AI recommendations. You can still create a custom value case."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleCreateCustom} variant="outline" data-testid="button-create-custom-error">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Custom Value Case
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {recommendationsData && !isLoading && !error && (
          <div className="space-y-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3" data-testid="recommendations-list">
                {(recommendationsData.recommendations || []).map((rec, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all ${
                      selectedRecommendation === rec
                        ? "ring-2 ring-primary bg-primary/5"
                        : "hover-elevate"
                    }`}
                    onClick={() => setSelectedRecommendation(rec)}
                    data-testid={`recommendation-card-${index}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {selectedRecommendation === rec && (
                              <CheckCircle2 className="w-5 h-5 text-primary" data-testid={`selected-icon-${index}`} />
                            )}
                            {rec.name}
                          </CardTitle>
                          <CardDescription className="mt-1">{rec.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Estimated NPV</p>
                          <p className="text-sm font-semibold text-emerald-600" data-testid={`npv-${index}`}>{rec.estimatedNPV}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Payback Period</p>
                          <p className="text-sm font-semibold" data-testid={`payback-${index}`}>{rec.estimatedPaybackMonths} months</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Linked Discovery Jobs</p>
                        <div className="flex flex-wrap gap-1">
                          {rec.linkedJobThemeIds.map((jobId, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs" data-testid={`job-badge-${index}-${idx}`}>
                              Job #{jobId}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Key Performance Indicators</p>
                        <div className="flex flex-wrap gap-1">
                          {rec.suggestedKPIs.slice(0, 3).map((kpi, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs" data-testid={`kpi-badge-${index}-${idx}`}>
                              {kpi}
                            </Badge>
                          ))}
                          {rec.suggestedKPIs.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{rec.suggestedKPIs.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Strategic Rationale</p>
                        <p className="text-sm text-foreground/80" data-testid={`rationale-${index}`}>{rec.rationale}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            <div className="flex items-center justify-between pt-4 border-t gap-3">
              <Button
                onClick={handleCreateCustom}
                variant="outline"
                data-testid="button-create-custom"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Instead
              </Button>
              
              <div className="flex gap-2">
                <Button onClick={() => onOpenChange(false)} variant="ghost" data-testid="button-cancel">
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateFromRecommendation}
                  disabled={!selectedRecommendation || createValueCaseMutation.isPending}
                  data-testid="button-create-selected"
                >
                  {createValueCaseMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Selected Value Case
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
