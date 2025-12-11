import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  ArrowRight,
  ArrowRightCircle,
  Users, 
  Target, 
  AlertTriangle, 
  Zap, 
  FileText,
  CheckCircle2,
  Clock,
  DollarSign,
  Building2,
  Briefcase,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  MessageSquare,
  Lightbulb,
  Flag,
  Shield,
  Send,
  Copy,
  ExternalLink,
  Sparkles,
  RefreshCw,
  ChevronRight,
  Check,
  User
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImpactDashboard } from "@/components/ImpactDashboard";
import { ValueStory } from "@/components/ValueStory";

const VALUE_PILLAR_CONFIG = {
  grow: { label: "Grow", color: "emerald", icon: TrendingUp },
  optimise: { label: "Optimise", color: "blue", icon: Target },
  derisk: { label: "De-risk", color: "amber", icon: Shield },
  strengthen: { label: "Strengthen", color: "violet", icon: Users },
};

export default function HandoffHub() {
  const [, params] = useRoute("/projects/:id/handoff");
  const projectId = parseInt(params?.id || "0");
  const { toast } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [handoffNotes, setHandoffNotes] = useState("");
  const [notesInitialized, setNotesInitialized] = useState(false);

  const { data: project, isLoading: projectLoading } = useQuery<any>({
    queryKey: ["/api/projects", projectId],
    enabled: projectId > 0,
  });

  // Initialize handoff notes from project data 
  useEffect(() => {
    if (project && !notesInitialized) {
      setHandoffNotes(project.handoffNotes || "");
      setNotesInitialized(true);
    }
  }, [project, notesInitialized]);

  const isHandoffConfirmed = !!project?.handoffConfirmedAt;

  const { data: commitments = [] } = useQuery<any[]>({
    queryKey: ["/api/projects", projectId, "commitments"],
    enabled: projectId > 0,
  });

  const { data: discoveryNotes } = useQuery<any>({
    queryKey: ["/api/projects", projectId, "discovery-notes"],
    enabled: projectId > 0,
  });

  const { data: synthesis } = useQuery<any>({
    queryKey: ["/api/projects", projectId, "discovery-insights", "summary"],
    enabled: projectId > 0,
  });


  const { data: strategySelection } = useQuery<any>({
    queryKey: ["/api/projects", projectId, "strategy-selection"],
    enabled: projectId > 0,
  });

  const confirmedCommitments = commitments.filter((c: any) => c.status === "confirmed");
  const totalValue = confirmedCommitments.reduce((sum: number, c: any) => sum + (c.estimatedAnnualValue || 0), 0);

  const commitmentsByPillar = confirmedCommitments.reduce((acc: any, c: any) => {
    const pillar = c.valuePillar || "other";
    if (!acc[pillar]) acc[pillar] = [];
    acc[pillar].push(c);
    return acc;
  }, {});

  const confirmHandoffMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/confirm-handoff`, {
        handoffNotes,
        confirmedAt: new Date().toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "commitments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "discovery-insights", "summary"] });
      toast({
        title: "Handoff Confirmed",
        description: "Project successfully handed off to delivery team.",
      });
      setShowConfirmDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Handoff Failed",
        description: error?.message || "Unable to complete handoff. Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyHandoffSummary = () => {
    const summary = `
HANDOFF SUMMARY: ${project?.name || "Project"}
Company: ${project?.companyName}
Total Value: $${(totalValue / 1000).toFixed(0)}K annually

CONFIRMED OUTCOMES (${confirmedCommitments.length}):
${confirmedCommitments.map((c: any) => `• ${c.name}: ${c.baselineValue || "—"} → ${c.targetValue || "—"} ${c.kpiUnit || ""}`).join("\n")}

KEY STAKEHOLDER: ${discoveryNotes?.keyStakeholder || "Not specified"}
TOP CHALLENGES: ${discoveryNotes?.topChallenges || "Not specified"}
    `.trim();
    
    navigator.clipboard.writeText(summary);
    toast({
      title: "Copied to clipboard",
      description: "Handoff summary ready to share",
    });
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const readinessChecks = [
    { label: "Confirmed outcomes defined", passed: confirmedCommitments.length > 0 },
    { label: "Value metrics established", passed: confirmedCommitments.some((c: any) => c.targetValue) },
    { label: "Stakeholder identified", passed: !!discoveryNotes?.keyStakeholder || !!project?.clientLead },
    { label: "Discovery completed", passed: (synthesis?.keyInsights?.length > 0) || !!project?.discoverySynthesis || !!project?.discoveryCompleted },
    { label: "Strategy selection complete", passed: !!strategySelection?.selectedStrategiesData || confirmedCommitments.length >= 3 },
  ];
  const readinessScore = Math.round((readinessChecks.filter(c => c.passed).length / readinessChecks.length) * 100);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/projects/${projectId}/sales`}>
                <Button variant="ghost" size="sm" data-testid="button-back-to-project">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Project
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  <ArrowRightCircle className="w-5 h-5 text-emerald-600" />
                  Sales to Delivery Handoff
                </h1>
                <p className="text-sm text-muted-foreground">{project?.companyName} • {project?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={copyHandoffSummary} data-testid="button-copy-summary">
                <Copy className="w-4 h-4 mr-2" />
                Copy Summary
              </Button>
              {isHandoffConfirmed ? (
                <Badge className="bg-emerald-600 text-white py-2 px-4">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Handoff Confirmed {project?.handoffConfirmedAt && `• ${new Date(project.handoffConfirmedAt).toLocaleDateString()}`}
                </Badge>
              ) : (
              <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={readinessScore < 60}
                    data-testid="button-confirm-handoff"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Confirm Handoff
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Sales to Delivery Handoff</DialogTitle>
                    <DialogDescription>
                      This will notify the delivery team and transition the project to the delivery phase.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <label className="text-sm font-medium mb-2 block">
                      Handoff Notes (optional)
                    </label>
                    <Textarea
                      placeholder="Any additional context for the delivery team..."
                      value={handoffNotes}
                      onChange={(e) => setHandoffNotes(e.target.value)}
                      className="min-h-[100px]"
                      data-testid="input-handoff-notes"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => confirmHandoffMutation.mutate()}
                      disabled={confirmHandoffMutation.isPending}
                      data-testid="button-confirm-handoff-final"
                    >
                      {confirmHandoffMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      Confirm & Notify Delivery
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card data-testid="card-value-summary">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                      Value Summary
                    </CardTitle>
                    <CardDescription>Total committed value for this engagement</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-600">
                      ${(totalValue / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-muted-foreground">annually</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-4">
                  {Object.entries(VALUE_PILLAR_CONFIG).map(([key, config]) => {
                    const pillarCommitments = commitmentsByPillar[key] || [];
                    const pillarValue = pillarCommitments.reduce((sum: number, c: any) => sum + (c.estimatedAnnualValue || 0), 0);
                    const IconComponent = config.icon;
                    
                    return (
                      <div 
                        key={key} 
                        className={`p-3 rounded-lg border bg-${config.color}-500/5 border-${config.color}-500/20`}
                        data-testid={`pillar-summary-${key}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <IconComponent className={`w-4 h-4 text-${config.color}-600`} />
                          <span className="text-sm font-medium">{config.label}</span>
                        </div>
                        <div className="text-xl font-bold">{pillarCommitments.length}</div>
                        <div className="text-xs text-muted-foreground">
                          ${(pillarValue / 1000).toFixed(0)}K value
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-value-narrative">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Value Narrative
                </CardTitle>
                <CardDescription>AI-generated summary for delivery team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold uppercase text-amber-700">Why This Engagement</span>
                  </div>
                  <p className="text-sm leading-relaxed">
                    {synthesis?.summary || 
                     project?.discoverySynthesis?.summary || 
                     discoveryNotes?.topChallenges || 
                     `${project?.companyName} engaged Korn Ferry to drive measurable business outcomes across ${confirmedCommitments.length} key initiatives.`}
                  </p>
                </div>
                
                {synthesis?.keyInsights?.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold">Key Discovery Insights</span>
                    </div>
                    <div className="grid gap-2">
                      {synthesis.keyInsights.slice(0, 3).map((insight: any, idx: number) => (
                        <div key={idx} className="p-2 rounded-md bg-muted/50 text-sm">
                          {typeof insight === 'string' ? insight : (insight.content || insight.insight)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {strategySelection?.selectedStrategiesData && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-semibold">Selected Strategic Focus Areas</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(strategySelection.selectedStrategiesData).slice(0, 5).map(([key, strategy]: [string, any]) => (
                        <Badge key={key} variant="outline" className="bg-emerald-500/10 border-emerald-500/30">
                          {strategy.name || key}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI-Generated Value Story */}
            <ValueStory projectId={projectId} />

            <Card data-testid="card-outcomes-scorecard">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      Outcomes Scorecard
                    </CardTitle>
                    <CardDescription>Confirmed commitments for delivery</CardDescription>
                  </div>
                  <Badge variant="secondary">{confirmedCommitments.length} outcomes</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {confirmedCommitments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No confirmed outcomes yet</p>
                    <p className="text-xs mt-1">Confirm outcomes in the Sales workspace first</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(commitmentsByPillar).map(([pillar, items]: [string, any]) => {
                      const config = VALUE_PILLAR_CONFIG[pillar as keyof typeof VALUE_PILLAR_CONFIG] || { label: pillar, color: "gray", icon: Target };
                      const IconComponent = config.icon;
                      
                      return (
                        <div key={pillar}>
                          <div className="flex items-center gap-2 mb-2">
                            <IconComponent className={`w-4 h-4 text-${config.color}-600`} />
                            <span className="text-sm font-semibold">{config.label}</span>
                            <Badge variant="outline" className="text-xs">{items.length}</Badge>
                          </div>
                          <div className="space-y-2">
                            {items.map((c: any) => (
                              <div 
                                key={c.id} 
                                className="p-3 rounded-lg border bg-card hover-elevate"
                                data-testid={`outcome-card-${c.id}`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm">{c.name}</h4>
                                    {c.outcomeStatement && (
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.outcomeStatement}</p>
                                    )}
                                  </div>
                                  <div className="text-right shrink-0">
                                    <div className="text-sm font-semibold">
                                      {c.baselineValue || "—"} → {c.targetValue || "—"}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{c.kpiUnit || ""}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                  {c.estimatedAnnualValue && (
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="w-3 h-3" />
                                      ${(c.estimatedAnnualValue / 1000).toFixed(0)}K/yr
                                    </span>
                                  )}
                                  {c.solutionPattern && (
                                    <Badge variant="outline" className="text-[10px]">
                                      {c.solutionPattern.replace(/_/g, " ")}
                                    </Badge>
                                  )}
                                  {c.targetDate && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(c.targetDate).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-quick-wins">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Quick Wins Roadmap
                </CardTitle>
                <CardDescription>Early value activities for first 90 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-4 rounded-lg border bg-emerald-500/5 border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-emerald-500 text-white">Days 1-30</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span>Kickoff meeting with stakeholders</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span>Baseline data collection</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span>Quick assessment & diagnostic</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg border bg-blue-500/5 border-blue-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-blue-500 text-white">Days 31-60</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <span>Solution design workshops</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <span>Pilot program launch</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <span>First progress review</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg border bg-violet-500/5 border-violet-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-violet-500 text-white">Days 61-90</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <Flag className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
                        <span>Early results measurement</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Flag className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
                        <span>Stakeholder feedback session</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Flag className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
                        <span>Scale-up planning</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card data-testid="card-handoff-readiness">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Handoff Readiness
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600">{readinessScore}%</div>
                  <Progress value={readinessScore} className="mt-2 h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {readinessScore >= 80 ? "Ready for handoff" : readinessScore >= 60 ? "Almost ready" : "More preparation needed"}
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  {readinessChecks.map((check, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      {check.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      <span className={check.passed ? "" : "text-muted-foreground"}>{check.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-stakeholders">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Key Stakeholders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {discoveryNotes?.keyStakeholder ? (
                  <div className="p-3 rounded-lg border bg-blue-500/5 border-blue-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-sm">Client Sponsor</span>
                    </div>
                    <p className="text-sm">{discoveryNotes.keyStakeholder}</p>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No stakeholders documented</p>
                  </div>
                )}
                
                {project?.clientLead && (
                  <div className="p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-sm">Client Lead</span>
                    </div>
                    <p className="text-sm">{project.clientLead}</p>
                  </div>
                )}
                
                {project?.initiativeOwner && (
                  <div className="p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">KF Delivery Lead</span>
                    </div>
                    <p className="text-sm">{project.initiativeOwner}</p>
                  </div>
                )}

                {confirmedCommitments.some((c: any) => c.customerStakeholderName) && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase text-muted-foreground">Outcome Owners</div>
                    {confirmedCommitments
                      .filter((c: any) => c.customerStakeholderName)
                      .slice(0, 3)
                      .map((c: any) => (
                        <div key={c.id} className="flex items-center justify-between text-sm">
                          <span>{c.customerStakeholderName}</span>
                          <span className="text-xs text-muted-foreground">{c.customerStakeholderTitle}</span>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-risk-register">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Risk Register
                </CardTitle>
              </CardHeader>
              <CardContent>
                {discoveryNotes?.topChallenges ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-amber-500/20 text-amber-700 border-amber-500/30 text-xs">
                          From Discovery
                        </Badge>
                      </div>
                      <p className="text-sm">{discoveryNotes.topChallenges}</p>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium mb-1">Recommended Mitigations:</p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Regular stakeholder check-ins</li>
                        <li>Clear escalation paths</li>
                        <li>Milestone-based progress reviews</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No risks documented</p>
                    <p className="text-xs mt-1">Add challenges in discovery notes</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-discovery-context">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-violet-600" />
                  Discovery Context
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project?.discoveryTheme && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Theme</span>
                    <Badge variant="outline">{project.discoveryTheme}</Badge>
                  </div>
                )}
                
                {discoveryNotes?.timeline && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Timeline</span>
                    <span>{discoveryNotes.timeline}</span>
                  </div>
                )}
                
                {discoveryNotes?.freeformNotes && (
                  <div className="mt-3">
                    <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Notes</div>
                    <ScrollArea className="h-32">
                      <p className="text-sm whitespace-pre-wrap">{discoveryNotes.freeformNotes}</p>
                    </ScrollArea>
                  </div>
                )}
                
                {!project?.discoveryTheme && !discoveryNotes?.freeformNotes && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No discovery context captured</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
