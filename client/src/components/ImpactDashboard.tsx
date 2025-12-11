import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Target, 
  Shield, 
  Users, 
  Lightbulb, 
  Quote, 
  AlertTriangle, 
  CheckCircle2,
  BarChart3,
  Zap,
  ArrowRight,
  Clock,
  Rocket,
  Brain
} from "lucide-react";

interface Commitment {
  id: number;
  name?: string;
  commitmentTitle?: string;
  valuePillar?: string;
  baselineValue?: number | null;
  targetValue?: number | null;
  kpiUnit?: string;
  estimatedAnnualValue?: number | null;
  status?: string;
}

interface DiscoverySynthesis {
  executiveSummary?: string;
  keyChallenges?: string[];
  strategicOpportunities?: string[];
  keyInsights?: string[];
  summary?: string;
}

interface Risk {
  id: string;
  title: string;
  description?: string;
  severity: 'high' | 'medium' | 'low';
  category?: string;
  mitigationPlan?: string;
}

interface ImpactDashboardProps {
  companyName: string;
  projectName: string;
  commitments: Commitment[];
  discoverySynthesis?: DiscoverySynthesis;
  clientQuotes?: string[];
  risks?: Risk[];
  stakeholderName?: string;
  discoveryNotes?: {
    topChallenges?: string;
    keyStakeholder?: string;
    freeformNotes?: string;
  };
}

const VALUE_PILLAR_CONFIG: Record<string, { label: string; color: string; icon: typeof TrendingUp }> = {
  grow: { label: "Grow", color: "emerald", icon: TrendingUp },
  optimise: { label: "Optimise", color: "blue", icon: Target },
  derisk: { label: "De-risk", color: "amber", icon: Shield },
  strengthen: { label: "Strengthen", color: "violet", icon: Users },
};

export function ImpactDashboard({
  companyName,
  projectName,
  commitments,
  discoverySynthesis,
  clientQuotes = [],
  risks = [],
  stakeholderName,
  discoveryNotes
}: ImpactDashboardProps) {
  const confirmedCommitments = commitments.filter(c => c.status === 'confirmed');
  const draftCommitments = commitments.filter(c => c.status === 'draft' || c.status === 'proposed');
  const totalValue = confirmedCommitments.reduce((sum, c) => sum + (c.estimatedAnnualValue || 0), 0);
  
  const pillarBreakdown = confirmedCommitments.reduce((acc: Record<string, { count: number; value: number }>, c) => {
    const pillar = c.valuePillar || 'other';
    if (!acc[pillar]) acc[pillar] = { count: 0, value: 0 };
    acc[pillar].count++;
    acc[pillar].value += c.estimatedAnnualValue || 0;
    return acc;
  }, {});

  const highRisks = risks.filter(r => r.severity === 'high');
  const mediumRisks = risks.filter(r => r.severity === 'medium');
  const lowRisks = risks.filter(r => r.severity === 'low');

  const alignmentScore = commitments.length > 0 
    ? Math.round((confirmedCommitments.length / commitments.length) * 100)
    : 0;

  return (
    <div className="space-y-6" data-testid="impact-dashboard">
      {/* Executive Summary Banner */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Executive Impact Summary</h2>
              <p className="text-white/80 leading-relaxed" data-testid="text-executive-summary">
                {discoverySynthesis?.executiveSummary || 
                 discoverySynthesis?.summary || 
                 `${companyName} engaged Korn Ferry to drive measurable business outcomes through ${confirmedCommitments.length} strategic initiatives worth $${(totalValue / 1000).toFixed(0)}K in annual value.`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Value */}
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <BarChart3 className="w-4 h-4" />
              Total Value
            </div>
            <div className="text-2xl font-bold text-emerald-600" data-testid="text-total-value">
              ${(totalValue / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">annual impact</p>
          </CardContent>
        </Card>

        {/* Confirmed Outcomes */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <CheckCircle2 className="w-4 h-4" />
              Confirmed
            </div>
            <div className="text-2xl font-bold text-blue-600" data-testid="text-confirmed-count">
              {confirmedCommitments.length}
            </div>
            <p className="text-xs text-muted-foreground">outcomes ready</p>
          </CardContent>
        </Card>

        {/* Alignment Score */}
        <Card className="border-l-4 border-l-violet-500">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Target className="w-4 h-4" />
              Alignment
            </div>
            <div className="text-2xl font-bold text-violet-600" data-testid="text-alignment-score">
              {alignmentScore}%
            </div>
            <Progress value={alignmentScore} className="h-1 mt-1" />
          </CardContent>
        </Card>

        {/* Risk Score */}
        <Card className={`border-l-4 ${highRisks.length > 0 ? 'border-l-red-500' : mediumRisks.length > 0 ? 'border-l-amber-500' : 'border-l-emerald-500'}`}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <AlertTriangle className="w-4 h-4" />
              Risks
            </div>
            <div className={`text-2xl font-bold ${highRisks.length > 0 ? 'text-red-600' : mediumRisks.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`} data-testid="text-risk-count">
              {risks.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {highRisks.length > 0 ? `${highRisks.length} high priority` : 'under control'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Discovery Insights + Client Quotes Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Discovery Insights */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Discovery Insights
            </CardTitle>
            <CardDescription>Key findings from the discovery phase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {discoverySynthesis?.keyChallenges && discoverySynthesis.keyChallenges.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  Key Challenges
                </h4>
                <ul className="space-y-1.5">
                  {discoverySynthesis.keyChallenges.slice(0, 4).map((challenge, idx) => (
                    <li 
                      key={idx} 
                      className="text-sm text-muted-foreground flex items-start gap-2"
                      data-testid={`text-challenge-${idx}`}
                    >
                      <span className="text-amber-500">•</span>
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {discoverySynthesis?.strategicOpportunities && discoverySynthesis.strategicOpportunities.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Zap className="w-3 h-3 text-emerald-500" />
                  Strategic Opportunities
                </h4>
                <ul className="space-y-1.5">
                  {discoverySynthesis.strategicOpportunities.slice(0, 4).map((opp, idx) => (
                    <li 
                      key={idx} 
                      className="text-sm text-muted-foreground flex items-start gap-2"
                      data-testid={`text-opportunity-${idx}`}
                    >
                      <span className="text-emerald-500">•</span>
                      {opp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {discoveryNotes?.topChallenges && !discoverySynthesis?.keyChallenges?.length && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  {discoveryNotes.topChallenges}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client Quotes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Quote className="w-4 h-4 text-blue-500" />
              Client Voice
            </CardTitle>
            <CardDescription>Key quotes from stakeholder conversations</CardDescription>
          </CardHeader>
          <CardContent>
            {clientQuotes.length > 0 ? (
              <div className="space-y-3">
                {clientQuotes.slice(0, 3).map((quote, idx) => (
                  <blockquote 
                    key={idx}
                    className="border-l-2 border-blue-500 pl-4 py-2 italic text-sm text-muted-foreground"
                    data-testid={`quote-${idx}`}
                  >
                    "{quote}"
                  </blockquote>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <Quote className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No client quotes captured yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Quotes can be added from discovery conversations
                </p>
              </div>
            )}
            
            {stakeholderName && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="text-muted-foreground">Key Stakeholder:</span>{' '}
                    <span className="font-medium" data-testid="text-stakeholder">{stakeholderName}</span>
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Outcomes Scorecard by Value Pillar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-violet-500" />
            Outcomes Scorecard
          </CardTitle>
          <CardDescription>Confirmed outcomes by value pillar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(VALUE_PILLAR_CONFIG).map(([key, config]) => {
              const pillarData = pillarBreakdown[key] || { count: 0, value: 0 };
              const IconComponent = config.icon;
              
              return (
                <div 
                  key={key}
                  className={`p-4 rounded-lg border bg-gradient-to-br from-${config.color}-500/5 to-${config.color}-500/10`}
                  data-testid={`scorecard-${key}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-lg bg-${config.color}-500/20 flex items-center justify-center`}>
                      <IconComponent className={`w-4 h-4 text-${config.color}-600`} />
                    </div>
                    <span className="font-medium">{config.label}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{pillarData.count}</span>
                      <span className="text-sm text-muted-foreground">outcomes</span>
                    </div>
                    <div className={`text-sm font-medium text-${config.color}-600`}>
                      ${(pillarData.value / 1000).toFixed(0)}K value
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Confirmed Outcomes List */}
          {confirmedCommitments.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium mb-3">Confirmed Outcomes</h4>
              <div className="space-y-2">
                {confirmedCommitments.slice(0, 6).map((c) => {
                  const pillarConfig = VALUE_PILLAR_CONFIG[c.valuePillar || 'other'];
                  return (
                    <div 
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                      data-testid={`outcome-row-${c.id}`}
                    >
                      <div className="flex items-center gap-3">
                        {pillarConfig && (
                          <Badge variant="outline" className="text-xs">
                            {pillarConfig.label}
                          </Badge>
                        )}
                        <span className="text-sm font-medium">{c.name || c.commitmentTitle}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          {c.baselineValue ?? '—'} <ArrowRight className="w-3 h-3 inline" /> {c.targetValue ?? '—'} {c.kpiUnit}
                        </span>
                        {c.estimatedAnnualValue && (
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700">
                            ${(c.estimatedAnnualValue / 1000).toFixed(0)}K
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Visualization */}
      {risks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Risk Assessment
            </CardTitle>
            <CardDescription>Identified risks and mitigation status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-red-700">High Priority</span>
                  <Badge variant="destructive">{highRisks.length}</Badge>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-amber-700">Medium Priority</span>
                  <Badge className="bg-amber-600">{mediumRisks.length}</Badge>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-700">Low Priority</span>
                  <Badge className="bg-emerald-600">{lowRisks.length}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {risks.slice(0, 5).map((risk) => (
                <div 
                  key={risk.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    risk.severity === 'high' 
                      ? 'border-l-red-500 bg-red-500/5' 
                      : risk.severity === 'medium'
                        ? 'border-l-amber-500 bg-amber-500/5'
                        : 'border-l-emerald-500 bg-emerald-500/5'
                  }`}
                  data-testid={`risk-row-${risk.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h5 className="text-sm font-medium">{risk.title}</h5>
                      {risk.description && (
                        <p className="text-xs text-muted-foreground mt-1">{risk.description}</p>
                      )}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={
                        risk.severity === 'high' 
                          ? 'text-red-700' 
                          : risk.severity === 'medium'
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                      }
                    >
                      {risk.severity}
                    </Badge>
                  </div>
                  {risk.mitigationPlan && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Mitigation:</span> {risk.mitigationPlan}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Value Journey Preview */}
      <Card className="bg-gradient-to-r from-violet-500/5 to-purple-500/5 border-violet-500/20">
        <CardContent className="py-6">
          <div className="flex items-center gap-3 mb-4">
            <Rocket className="w-5 h-5 text-violet-600" />
            <h3 className="font-semibold">Implementation Journey</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-emerald-500/10">
              <Zap className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-emerald-600">Quick Wins</div>
              <p className="text-xs text-muted-foreground">0-3 months</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-500/10">
              <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-blue-600">Momentum</div>
              <p className="text-xs text-muted-foreground">4-9 months</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-violet-500/10">
              <Target className="w-5 h-5 text-violet-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-violet-600">Impact</div>
              <p className="text-xs text-muted-foreground">10-18 months</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
