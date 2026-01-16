import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart3,
  Users,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  HandHelping,
  Repeat,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ChevronRight,
  Target,
  Sparkles,
  Scale
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ManagerDashboardProps {
  projectId: number;
  projectName?: string;
  teamSize?: number;
  onNavigateToProject?: (projectId: number) => void;
}

interface ConfidenceBreakdownItem {
  id: string;
  dealName: string;
  sellerName: string;
  overallConfidence: number;
  kpiConfidence: number;
  behaviourConfidence: number;
  narrativeCompleteness: number;
  trend: "improving" | "declining" | "stable";
  flags: string[];
}

interface CoachInterveneItem {
  id: string;
  dealName: string;
  sellerName: string;
  recommendation: "coach" | "intervene" | "observe";
  reasoning: string;
  signals: string[];
  suggestedAction: string;
  urgency: "high" | "medium" | "low";
}

interface ScalingPatternItem {
  id: string;
  patternName: string;
  description: string;
  successRate: number;
  timesUsed: number;
  recentWins: string[];
  applicableTo: string[];
}

const confidenceColors = {
  high: "text-emerald-600 dark:text-emerald-400",
  medium: "text-amber-600 dark:text-amber-400",
  low: "text-red-600 dark:text-red-400"
};

function getConfidenceLevel(score: number): "high" | "medium" | "low" {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function ConfidenceBreakdown({ projectId }: { projectId: number }) {
  const breakdownItems: ConfidenceBreakdownItem[] = [
    {
      id: "1",
      dealName: "Acme Corp Transformation",
      sellerName: "Sarah Johnson",
      overallConfidence: 78,
      kpiConfidence: 85,
      behaviourConfidence: 72,
      narrativeCompleteness: 65,
      trend: "improving",
      flags: []
    },
    {
      id: "2",
      dealName: "TechStart Sales Enablement",
      sellerName: "Mike Chen",
      overallConfidence: 45,
      kpiConfidence: 60,
      behaviourConfidence: 35,
      narrativeCompleteness: 40,
      trend: "declining",
      flags: ["Missing baseline data", "No recent updates"]
    },
    {
      id: "3",
      dealName: "Global Retail Leadership",
      sellerName: "Emily Davis",
      overallConfidence: 62,
      kpiConfidence: 70,
      behaviourConfidence: 55,
      narrativeCompleteness: 80,
      trend: "stable",
      flags: ["Sponsor meeting overdue"]
    }
  ];
  
  const trendIcons = {
    improving: <TrendingUp className="h-4 w-4 text-emerald-500" />,
    declining: <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />,
    stable: <MinusCircle className="h-4 w-4 text-amber-500" />
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          Confidence Breakdown
        </CardTitle>
        <CardDescription>
          Pattern recognition across your portfolio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {breakdownItems.map((item) => {
          const level = getConfidenceLevel(item.overallConfidence);
          return (
            <div key={item.id} className="p-3 rounded-lg border hover-elevate" data-testid={`card-confidence-item-${item.id}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{item.dealName}</span>
                    {trendIcons[item.trend]}
                  </div>
                  <span className="text-xs text-muted-foreground">{item.sellerName}</span>
                </div>
                <div className={cn("text-2xl font-bold", confidenceColors[level])}>
                  {item.overallConfidence}%
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">KPIs</div>
                  <Progress value={item.kpiConfidence} className="h-1.5" />
                  <span className="text-xs">{item.kpiConfidence}%</span>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Behaviour</div>
                  <Progress value={item.behaviourConfidence} className="h-1.5" />
                  <span className="text-xs">{item.behaviourConfidence}%</span>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Narrative</div>
                  <Progress value={item.narrativeCompleteness} className="h-1.5" />
                  <span className="text-xs">{item.narrativeCompleteness}%</span>
                </div>
              </div>
              
              {item.flags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.flags.map((flag, i) => (
                    <Badge key={i} variant="outline" className="text-xs text-amber-600 border-amber-300">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {flag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        
        <div className="text-center pt-2">
          <Button variant="outline" size="sm" data-testid="button-view-all-deals">
            View All Deals
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CoachVsIntervene({ projectId }: { projectId: number }) {
  const items: CoachInterveneItem[] = [
    {
      id: "1",
      dealName: "TechStart Sales Enablement",
      sellerName: "Mike Chen",
      recommendation: "intervene",
      reasoning: "Pattern indicates seller may be stuck - multiple weeks without evidence updates, declining confidence",
      signals: [
        "No activity in 12 days",
        "Behavioural conditions at 35%",
        "Sponsor engagement dropping"
      ],
      suggestedAction: "Schedule 1:1 to understand blockers and provide direct support",
      urgency: "high"
    },
    {
      id: "2",
      dealName: "Global Retail Leadership",
      sellerName: "Emily Davis",
      recommendation: "coach",
      reasoning: "Good foundation but narrative needs strengthening - can be addressed with coaching",
      signals: [
        "Strong KPI tracking",
        "Narrative completeness gap",
        "Sponsor meeting overdue"
      ],
      suggestedAction: "Coaching session on narrative construction and sponsor communication",
      urgency: "medium"
    },
    {
      id: "3",
      dealName: "Acme Corp Transformation",
      sellerName: "Sarah Johnson",
      recommendation: "observe",
      reasoning: "Trending positive across all dimensions - let the seller continue building momentum",
      signals: [
        "Consistent weekly updates",
        "KPIs locked and tracking",
        "Strong narrative foundation"
      ],
      suggestedAction: "Recognize progress in team meeting; observe for reusable patterns",
      urgency: "low"
    }
  ];
  
  const recommendationConfig = {
    intervene: {
      icon: <HandHelping className="h-5 w-5" />,
      color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    },
    coach: {
      icon: <MessageSquare className="h-5 w-5" />,
      color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
    },
    observe: {
      icon: <Target className="h-5 w-5" />,
      color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
    }
  };
  
  const urgencyLabels = {
    high: { text: "Act Now", color: "bg-red-100 text-red-700" },
    medium: { text: "This Week", color: "bg-amber-100 text-amber-700" },
    low: { text: "When Available", color: "bg-blue-100 text-blue-700" }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Scale className="h-5 w-5 text-blue-500" />
          Coach vs Intervene
        </CardTitle>
        <CardDescription>
          AI-guided decisions on how to support your team
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => {
          const config = recommendationConfig[item.recommendation];
          return (
            <div 
              key={item.id} 
              className="p-3 rounded-lg border"
              data-testid={`card-coach-item-${item.id}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="font-medium text-sm">{item.dealName}</span>
                  <div className="text-xs text-muted-foreground">{item.sellerName}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn("gap-1", config.color)}>
                    {config.icon}
                    <span className="capitalize">{item.recommendation}</span>
                  </Badge>
                  <Badge variant="secondary" className={cn("text-xs", urgencyLabels[item.urgency].color)}>
                    {urgencyLabels[item.urgency].text}
                  </Badge>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">{item.reasoning}</p>
              
              <div className="mb-2">
                <div className="text-xs font-medium mb-1">Signals:</div>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {item.signals.map((signal, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-current" />
                      {signal}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex items-start gap-2 p-2 rounded bg-muted/50">
                <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <span className="text-xs">{item.suggestedAction}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function WhatsScaling({ projectId }: { projectId: number }) {
  const patterns: ScalingPatternItem[] = [
    {
      id: "1",
      patternName: "Early Sponsor Lock-in",
      description: "Locking Success Frame KPIs within first 30 days correlates with 2.3x higher close rates",
      successRate: 87,
      timesUsed: 12,
      recentWins: ["Acme Corp", "DataFlow Inc"],
      applicableTo: ["Enterprise", "Strategic accounts"]
    },
    {
      id: "2",
      patternName: "Weekly Behaviour Check-ins",
      description: "Teams with weekly behaviour condition updates show 40% faster time-to-value",
      successRate: 72,
      timesUsed: 8,
      recentWins: ["TechStart", "Global Retail"],
      applicableTo: ["All deal sizes"]
    },
    {
      id: "3",
      patternName: "AI-Generated Narrative Drafts",
      description: "Using AI to generate first draft of narrative spine saves 4 hours avg per deal",
      successRate: 95,
      timesUsed: 23,
      recentWins: ["Multiple deals"],
      applicableTo: ["Time-constrained sellers"]
    }
  ];
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Repeat className="h-5 w-5 text-blue-500" />
          What's Scaling
        </CardTitle>
        <CardDescription>
          Reusable patterns from your top performers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {patterns.map((pattern) => (
          <div key={pattern.id} className="p-3 rounded-lg border hover-elevate" data-testid={`card-pattern-item-${pattern.id}`}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="font-medium text-sm">{pattern.patternName}</span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {pattern.successRate}% success rate
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Used {pattern.timesUsed}x
                  </Badge>
                </div>
              </div>
              <Button size="icon" variant="ghost" data-testid={`button-pattern-${pattern.id}`}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground mb-2">{pattern.description}</p>
            
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Recent wins:</span>
              {pattern.recentWins.slice(0, 2).map((win, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500" />
                  {win}
                </Badge>
              ))}
            </div>
          </div>
        ))}
        
        <Button variant="outline" className="w-full" data-testid="button-share-patterns">
          Share Patterns with Team
        </Button>
      </CardContent>
    </Card>
  );
}

export function ManagerDashboard({ 
  projectId, 
  projectName,
  teamSize = 5,
  onNavigateToProject 
}: ManagerDashboardProps) {
  const portfolioHealth = 68;
  const healthLevel = getConfidenceLevel(portfolioHealth);
  
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2" data-testid="text-manager-dashboard-title">
            Manager Dashboard
            {projectName && (
              <span className="text-muted-foreground font-normal">- {projectName}</span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Portfolio oversight and team coaching guidance
          </p>
        </div>
        
        <Card className="p-3" data-testid="card-portfolio-stats">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Portfolio Health</div>
              <div className={cn("text-2xl font-bold", confidenceColors[healthLevel])} data-testid="text-portfolio-health">
                {portfolioHealth}%
              </div>
            </div>
            <div className="pl-4">
              <div className="text-xs text-muted-foreground">Team Size</div>
              <div className="flex items-center gap-1" data-testid="text-team-size">
                <Users className="h-4 w-4" />
                <span className="font-medium">{teamSize}</span>
              </div>
            </div>
            <div className="pl-4">
              <div className="text-xs text-muted-foreground">Active Deals</div>
              <div className="flex items-center gap-1" data-testid="text-active-deals">
                <Target className="h-4 w-4" />
                <span className="font-medium">8</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ConfidenceBreakdown projectId={projectId} />
        <CoachVsIntervene projectId={projectId} />
        <WhatsScaling projectId={projectId} />
      </div>
    </div>
  );
}
