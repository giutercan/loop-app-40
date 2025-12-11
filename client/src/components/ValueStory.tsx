import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Zap, 
  TrendingUp, 
  Target, 
  Quote, 
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Rocket
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect, useRef } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ValueStoryData {
  executiveNarrative: string;
  keyWins: {
    quickWins: string[];
    momentumBuilders: string[];
    strategicImpacts: string[];
  };
  valueProposition: string;
  impactSummary: {
    totalValue: string;
    primaryBenefits: string[];
    transformationJourney: string;
  };
  clientStory: string;
  callToAction: string;
  generatedAt: string;
}

interface ValueStoryProps {
  projectId: number;
}

export function ValueStory({ projectId }: ValueStoryProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const autoGenerateAttempted = useRef(false);
  
  const { data: valueStory, isLoading: isLoadingStory } = useQuery<ValueStoryData>({
    queryKey: ['/api/projects', projectId, 'value-story'],
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/projects/${projectId}/value-story`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'value-story'] });
    }
  });

  useEffect(() => {
    if (!isLoadingStory && !valueStory && !generateMutation.isPending && !autoGenerateAttempted.current) {
      autoGenerateAttempted.current = true;
      generateMutation.mutate();
    }
  }, [isLoadingStory, valueStory, generateMutation.isPending]);

  if (isLoadingStory || (!valueStory && generateMutation.isPending)) {
    return (
      <Card className="border-dashed bg-gradient-to-br from-violet-500/5 to-purple-500/5">
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
            </div>
            <div className="text-center">
              <p className="font-medium text-sm">Generating Value Story</p>
              <p className="text-xs text-muted-foreground mt-1">
                Creating your AI-powered transformation narrative...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!valueStory) {
    return (
      <Card className="border-dashed bg-gradient-to-br from-violet-500/5 to-purple-500/5">
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {generateMutation.isError ? "Generation Failed" : "Value Story"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {generateMutation.isError 
                  ? "Unable to generate story. Click below to retry."
                  : "Create an AI-powered narrative that tells the transformation story"
                }
              </p>
            </div>
            <Button 
              onClick={() => {
                autoGenerateAttempted.current = false;
                generateMutation.mutate();
              }}
              disabled={generateMutation.isPending}
              className="gap-2"
              data-testid="button-generate-value-story"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {generateMutation.isError ? "Retry Generation" : "Generate Value Story"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="value-story-container">
      {/* Value Proposition Banner */}
      <Card className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-medium leading-relaxed" data-testid="text-value-proposition">
                {valueStory.valueProposition}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="secondary" className="bg-white/20 text-white border-0 hover:bg-white/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Generated
                </Badge>
                <span className="text-xs text-white/70">
                  {new Date(valueStory.generatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="text-white hover:bg-white/20"
              data-testid="button-regenerate-value-story"
            >
              {generateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Executive Narrative */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <Card>
          <CardHeader className="pb-3">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer">
                <CardTitle className="text-base flex items-center gap-2">
                  <Quote className="w-4 h-4 text-violet-500" />
                  Executive Narrative
                </CardTitle>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div 
                className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed"
                data-testid="text-executive-narrative"
              >
                {valueStory.executiveNarrative.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Key Wins by Phase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Quick Wins */}
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Zap className="w-3 h-3 text-emerald-600" />
              </div>
              Quick Wins
              <Badge variant="outline" className="ml-auto text-xs">1-3 months</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {valueStory.keyWins.quickWins.map((win, idx) => (
                <li 
                  key={idx} 
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                  data-testid={`text-quick-win-${idx}`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{win}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Momentum Builders */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-blue-600" />
              </div>
              Momentum
              <Badge variant="outline" className="ml-auto text-xs">4-9 months</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {valueStory.keyWins.momentumBuilders.map((win, idx) => (
                <li 
                  key={idx} 
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                  data-testid={`text-momentum-win-${idx}`}
                >
                  <Clock className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>{win}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Strategic Impacts */}
        <Card className="border-l-4 border-l-violet-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-violet-500/10 flex items-center justify-center">
                <Rocket className="w-3 h-3 text-violet-600" />
              </div>
              Impact
              <Badge variant="outline" className="ml-auto text-xs">10-18+ months</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {valueStory.keyWins.strategicImpacts.map((win, idx) => (
                <li 
                  key={idx} 
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                  data-testid={`text-impact-win-${idx}`}
                >
                  <Target className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                  <span>{win}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Impact Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Impact Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Total Value */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
              <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400" data-testid="text-total-value">
                {valueStory.impactSummary.totalValue}
              </p>
            </div>

            {/* Primary Benefits */}
            <div>
              <h4 className="text-sm font-medium mb-2">Primary Benefits</h4>
              <div className="flex flex-wrap gap-2">
                {valueStory.impactSummary.primaryBenefits.map((benefit, idx) => (
                  <Badge 
                    key={idx} 
                    variant="secondary"
                    data-testid={`badge-benefit-${idx}`}
                  >
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Transformation Journey */}
            <div>
              <h4 className="text-sm font-medium mb-2">Transformation Journey</h4>
              <p className="text-sm text-muted-foreground" data-testid="text-transformation-journey">
                {valueStory.impactSummary.transformationJourney}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Success Story Preview */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Quote className="w-4 h-4 text-amber-500" />
            Success Story Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <blockquote 
            className="italic text-muted-foreground border-l-2 border-amber-500 pl-4"
            data-testid="text-client-story"
          >
            {valueStory.clientStory}
          </blockquote>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="text-center p-4 rounded-lg border border-dashed">
        <p className="text-sm font-medium" data-testid="text-call-to-action">
          {valueStory.callToAction}
        </p>
      </div>
    </div>
  );
}
