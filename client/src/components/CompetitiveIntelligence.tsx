import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Shield, 
  Target, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Swords,
  Zap,
  Users,
  Building2,
  Lightbulb,
  BookOpen,
  BarChart3,
  Trophy
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CompetitiveIntelligence as CompetitiveIntelligenceType, CompetitiveSummary } from "@shared/schema";
import { getThemeCompetitiveMapping, type ThemeCompetitiveMapping } from "@shared/knowledge";

interface CompetitiveIntelligenceProps {
  projectId: number;
  companyName: string;
  solutionAreas?: string[];
  discoveryTheme?: string;
}

const SOLUTION_AREA_COLORS: Record<string, string> = {
  ASSESS: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  DEVELOP: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  TRANSFORM: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
  REWARD: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  COMMERCIAL: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  ANALYTICS: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800",
};

const LIKELIHOOD_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300",
  medium: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
  low: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
};

interface CompetitorCardProps {
  competitor: CompetitiveIntelligenceType;
  companyName: string;
}

function CompetitorCard({ competitor, companyName }: CompetitorCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Card className="hover-elevate" data-testid={`card-competitor-${competitor.competitorId}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge className={SOLUTION_AREA_COLORS[competitor.solutionArea]}>
                    {competitor.solutionArea}
                  </Badge>
                </div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  {competitor.competitorName}
                </CardTitle>
                {competitor.winTheme && (
                  <CardDescription className="mt-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="font-medium">Win Theme:</span> {competitor.winTheme}
                  </CardDescription>
                )}
              </div>
              <Button variant="ghost" size="icon" data-testid={`button-expand-competitor-${competitor.competitorId}`}>
                {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-primary" />
                Why Korn Ferry Wins vs {competitor.competitorName} for {companyName}
              </h4>
              <p className="text-sm text-muted-foreground">{competitor.contextualPositioning}</p>
            </div>
            
            {competitor.clientSpecificAdvantages && competitor.clientSpecificAdvantages.length > 0 && (
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-emerald-600" />
                  Client-Specific Advantages
                </h4>
                <ul className="space-y-2">
                  {competitor.clientSpecificAdvantages.map((advantage, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{advantage}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {competitor.conversationStarters && competitor.conversationStarters.length > 0 && (
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  Conversation Starters
                </h4>
                <div className="space-y-2">
                  {competitor.conversationStarters.map((starter, i) => (
                    <div key={i} className="bg-muted/50 rounded-lg p-3 text-sm italic">
                      "{starter}"
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {competitor.battleCardScenario && (
              <div className="border rounded-lg p-4 bg-amber-50 dark:bg-amber-950/20">
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <Swords className="h-4 w-4 text-amber-600" />
                  Battle Card
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-amber-700 dark:text-amber-400">Scenario:</span>
                    <p className="text-muted-foreground mt-1">{competitor.battleCardScenario}</p>
                  </div>
                  <div>
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">Response:</span>
                    <p className="text-muted-foreground mt-1">{competitor.battleCardResponse}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

interface SummaryCardProps {
  summary: CompetitiveSummary;
}

function SummaryCard({ summary }: SummaryCardProps) {
  const likelihood = summary.competitorLikelihood as Record<string, { likelihood: string; reason: string }> | null;
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Competitive Positioning Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">{summary.executiveSummary}</p>
        
        {summary.industryContext && (
          <div>
            <h4 className="font-medium mb-2">Industry Context</h4>
            <p className="text-sm text-muted-foreground">{summary.industryContext}</p>
          </div>
        )}
        
        <div className="grid md:grid-cols-2 gap-6">
          {summary.keyWinThemes && summary.keyWinThemes.length > 0 && (
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-emerald-600" />
                Key Win Themes
              </h4>
              <ul className="space-y-2">
                {summary.keyWinThemes.map((theme, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/20">
                      {theme}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {summary.avoidThemes && summary.avoidThemes.length > 0 && (
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Themes to Avoid
              </h4>
              <ul className="space-y-2">
                {summary.avoidThemes.map((theme, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/20">
                      {theme}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {likelihood && Object.keys(likelihood).length > 0 && (
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Users className="h-4 w-4" />
              Competitor Likelihood
            </h4>
            <div className="space-y-2">
              {Object.entries(likelihood).map(([competitorId, data]) => (
                <div key={competitorId} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <span className="font-medium capitalize">{competitorId.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-2">
                    <Badge className={LIKELIHOOD_COLORS[data.likelihood] || "bg-gray-100"}>
                      {data.likelihood.charAt(0).toUpperCase() + data.likelihood.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Theme-specific KF Playbook component
function KFPlaybookCard({ themeMapping, companyName }: { themeMapping: ThemeCompetitiveMapping; companyName: string }) {
  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          KF Playbook: {themeMapping.themeName}
        </CardTitle>
        <CardDescription>Theme-specific positioning and proof points for {companyName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-2 text-sm uppercase tracking-wider text-primary">
                <MessageSquare className="h-4 w-4" />
                Opening Question
              </h4>
              <p className="text-sm italic bg-muted/50 p-3 rounded-lg border-l-4 border-primary">
                "{themeMapping.kfPlaybook.openingQuestion}"
              </p>
            </div>
            
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-2 text-sm uppercase tracking-wider text-emerald-600">
                <Trophy className="h-4 w-4" />
                Proof Point
              </h4>
              <p className="text-sm bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border-l-4 border-emerald-500">
                {themeMapping.kfPlaybook.proofPoint}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-2 text-sm uppercase tracking-wider text-blue-600">
                <BarChart3 className="h-4 w-4" />
                KPI Benchmark
              </h4>
              <p className="text-sm bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border-l-4 border-blue-500">
                {themeMapping.kfPlaybook.kpiBenchmark}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-2 text-sm uppercase tracking-wider text-purple-600">
                <Sparkles className="h-4 w-4" />
                Success Story Hook
              </h4>
              <p className="text-sm bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg border-l-4 border-purple-500">
                {themeMapping.kfPlaybook.successStoryHook}
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-amber-600" />
              Buyer Signals to Listen For
            </h4>
            <ul className="space-y-2">
              {themeMapping.buyerSignals.map((signal, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-amber-500 mt-0.5">•</span>
                  {signal}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-emerald-600" />
              Key Win Themes
            </h4>
            <ul className="space-y-2">
              {themeMapping.keyWinThemes.map((theme, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  {theme}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {themeMapping.avoidThemes.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              Avoid These Topics
            </h4>
            <ul className="space-y-2">
              {themeMapping.avoidThemes.map((theme, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-rose-700 dark:text-rose-400">
                  <span className="mt-0.5">•</span>
                  {theme}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Theme-specific battlecard component
function ThemeBattleCards({ themeMapping }: { themeMapping: ThemeCompetitiveMapping }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Swords className="h-5 w-5 text-amber-600" />
        Theme-Specific Battle Cards
      </h3>
      <div className="grid gap-4">
        {themeMapping.battleCards.map((card, i) => (
          <Card key={i} className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300">
                  vs {card.competitorId.replace(/_/g, ' ')}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {card.winTheme}
                </Badge>
              </div>
              <div>
                <span className="font-medium text-amber-700 dark:text-amber-400 text-sm">Scenario:</span>
                <p className="text-sm text-muted-foreground mt-1">{card.scenario}</p>
              </div>
              <div>
                <span className="font-medium text-emerald-700 dark:text-emerald-400 text-sm">KF Response:</span>
                <p className="text-sm mt-1">{card.response}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function CompetitiveIntelligence({ projectId, companyName, solutionAreas, discoveryTheme }: CompetitiveIntelligenceProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("playbook");
  
  const defaultAreas = solutionAreas || ["ASSESS", "DEVELOP", "TRANSFORM", "REWARD", "COMMERCIAL", "ANALYTICS"];
  
  // Get theme-specific competitive mapping
  const themeMapping = discoveryTheme ? getThemeCompetitiveMapping(discoveryTheme) : undefined;
  
  const { data, isLoading, error } = useQuery<{
    positioning: CompetitiveIntelligenceType[];
    summary: CompetitiveSummary | null;
  }>({
    queryKey: ['/api/projects', projectId, 'competitive-intelligence'],
  });
  
  const generateMutation = useMutation({
    mutationFn: async (regenerate: boolean) => {
      return await apiRequest("POST", `/api/projects/${projectId}/competitive-intelligence/generate`, {
        solutionAreas: defaultAreas,
        regenerate
      });
    },
    onSuccess: () => {
      toast({
        title: "Competitive Intelligence Generated",
        description: "AI has analyzed the competitive landscape for this opportunity.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'competitive-intelligence'] });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate competitive intelligence.",
        variant: "destructive",
      });
    }
  });
  
  const hasData = data && (data.positioning?.length > 0 || data.summary);
  
  const groupedByArea = data?.positioning?.reduce((acc, pos) => {
    const area = pos.solutionArea;
    if (!acc[area]) acc[area] = [];
    acc[area].push(pos);
    return acc;
  }, {} as Record<string, CompetitiveIntelligenceType[]>) || {};
  
  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="competitive-intelligence-loading">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  
  if (error) {
    return (
      <Card data-testid="competitive-intelligence-error">
        <CardContent className="py-8 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="font-medium mb-2">Failed to Load Competitive Intelligence</h3>
          <p className="text-sm text-muted-foreground mb-4">
            There was an error loading the competitive analysis.
          </p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'competitive-intelligence'] })}
            data-testid="button-retry-competitive-intelligence"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (!hasData) {
    return (
      <Card data-testid="competitive-intelligence-empty">
        <CardContent className="py-12 text-center">
          <Swords className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Competitive Intelligence</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Generate AI-powered competitive positioning tailored to {companyName}. 
            Understand how Korn Ferry differentiates against key competitors for this opportunity.
          </p>
          <Button 
            onClick={() => generateMutation.mutate(false)}
            disabled={generateMutation.isPending}
            data-testid="button-generate-competitive-intelligence"
          >
            {generateMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Competitors...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Competitive Intelligence
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6" data-testid="competitive-intelligence-container">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            Competitive Intelligence
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {themeMapping 
              ? `Theme-specific positioning for ${themeMapping.themeName}` 
              : `AI-powered competitive positioning for ${companyName}`
            }
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => generateMutation.mutate(true)}
          disabled={generateMutation.isPending}
          data-testid="button-regenerate-competitive-intelligence"
        >
          {generateMutation.isPending ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Regenerate
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-competitive-intelligence" className="flex-wrap h-auto gap-1">
          {themeMapping && (
            <>
              <TabsTrigger value="playbook" data-testid="tab-playbook">
                <BookOpen className="h-4 w-4 mr-1" />
                KF Playbook
              </TabsTrigger>
              <TabsTrigger value="battlecards" data-testid="tab-battlecards">
                <Swords className="h-4 w-4 mr-1" />
                Battle Cards
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="overview" data-testid="tab-overview">All Competitors</TabsTrigger>
          {Object.keys(groupedByArea).map(area => (
            <TabsTrigger key={area} value={area} data-testid={`tab-${area.toLowerCase()}`}>
              {area}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {themeMapping && (
          <>
            <TabsContent value="playbook" className="mt-4">
              <KFPlaybookCard themeMapping={themeMapping} companyName={companyName} />
            </TabsContent>
            
            <TabsContent value="battlecards" className="mt-4">
              <ThemeBattleCards themeMapping={themeMapping} />
            </TabsContent>
          </>
        )}
        
        <TabsContent value="overview" className="mt-4 space-y-4">
          {data.summary && <SummaryCard summary={data.summary} />}
          {data.positioning?.map(competitor => (
            <CompetitorCard 
              key={`${competitor.competitorId}-${competitor.solutionArea}`} 
              competitor={competitor}
              companyName={companyName}
            />
          ))}
        </TabsContent>
        
        {Object.entries(groupedByArea).map(([area, competitors]) => (
          <TabsContent key={area} value={area} className="mt-4 space-y-4">
            {competitors.map(competitor => (
              <CompetitorCard 
                key={competitor.competitorId} 
                competitor={competitor}
                companyName={companyName}
              />
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}