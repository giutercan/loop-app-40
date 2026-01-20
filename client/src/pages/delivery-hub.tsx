import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Target, 
  Users, 
  AlertTriangle, 
  Lightbulb,
  Clock,
  TrendingUp,
  Heart,
  Shield,
  ArrowRight,
  RefreshCw,
  FileText,
  Star,
  Activity
} from "lucide-react";

interface HandoffPackage {
  executiveSummary: string;
  whyTheyBought: string[];
  successCriteria: string[];
  keyStakeholders: Array<{
    name: string;
    role: string;
    influence: string;
    notes: string;
  }>;
  risksAndConcerns: string[];
  specialCommitments: string[];
  recommendedActions: string[];
  generatedAt?: string;
}

interface DeliveryReadiness {
  score: number;
  checks: Array<{ label: string; passed: boolean; weight: number }>;
}

interface SuccessPlan {
  id: number;
  projectId: number;
  title: string;
  status: "draft" | "active" | "completed" | "archived";
  desiredOutcomes: Array<{
    id: string;
    outcome: string;
    businessImpact: string;
    successMetric: string;
    targetDate: string;
    status: "not_started" | "in_progress" | "achieved" | "at_risk";
  }> | null;
  overallProgress: number;
  riskLevel: "low" | "medium" | "high";
  executiveSponsor: string | null;
  deliveryLead: string | null;
  reviewCadence: string | null;
}

const LIFECYCLE_STAGES = [
  { id: "onboarding", label: "Onboarding", icon: Package, color: "bg-blue-500" },
  { id: "adoption", label: "Adoption", icon: TrendingUp, color: "bg-purple-500" },
  { id: "value_realization", label: "Value Realization", icon: Target, color: "bg-green-500" },
  { id: "expansion", label: "Expansion", icon: Star, color: "bg-amber-500" },
  { id: "advocacy", label: "Advocacy", icon: Heart, color: "bg-rose-500" },
];

export default function DeliveryHub() {
  const [, params] = useRoute("/projects/:projectId/delivery-hub");
  const projectId = params?.projectId ? parseInt(params.projectId) : null;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId,
  });

  const { data: handoffPackage, isLoading: packageLoading } = useQuery<HandoffPackage | null>({
    queryKey: ["/api/projects", projectId, "handoff-package"],
    enabled: !!projectId,
  });

  const { data: readiness, isLoading: readinessLoading } = useQuery<DeliveryReadiness>({
    queryKey: ["/api/projects", projectId, "delivery-readiness"],
    enabled: !!projectId,
  });

  const { data: successPlans, isLoading: plansLoading } = useQuery<SuccessPlan[]>({
    queryKey: ["/api/projects", projectId, "success-plans"],
    enabled: !!projectId,
  });

  const generatePackageMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/projects/${projectId}/handoff-package/generate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "handoff-package"] });
      toast({ title: "Handoff package generated", description: "AI has compiled the handoff brief" });
    },
    onError: (error: any) => {
      toast({ title: "Generation failed", description: error.message, variant: "destructive" });
    },
  });

  const initializeSuccessPlanMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/projects/${projectId}/success-plans/initialize`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "success-plans"] });
      toast({ title: "Success plan created", description: "Initial success plan generated from commitments" });
    },
    onError: (error: any) => {
      toast({ title: "Creation failed", description: error.message, variant: "destructive" });
    },
  });

  const confirmHandoffMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/projects/${projectId}/confirm-handoff`, {
        confirmedBy: "Current User",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      toast({ title: "Handoff confirmed", description: "Project transitioned to Delivery phase" });
    },
  });

  if (!projectId) {
    return <div className="p-8">Project ID required</div>;
  }

  if (projectLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const currentStage = (project as any)?.csLifecycleStage || "onboarding";
  const healthScore = (project as any)?.healthScore ?? 100;
  const maturityScore = (project as any)?.maturityScore ?? 0;
  const handoffConfirmed = !!(project as any)?.handoffConfirmedAt;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto" data-testid="delivery-hub-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-page-title">
            <Package className="h-8 w-8 text-primary" />
            Delivery Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            {(project as any)?.companyName || "Project"} - Customer Success Management
          </p>
        </div>
        {!handoffConfirmed && readiness && readiness.score >= 80 && (
          <Button 
            onClick={() => confirmHandoffMutation.mutate()}
            className="gap-2"
            data-testid="button-confirm-handoff"
          >
            <CheckCircle2 className="h-4 w-4" />
            Confirm Handoff
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card data-testid="card-health-score">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" />
              Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">{healthScore}</div>
              <Progress 
                value={healthScore} 
                className="flex-1 h-3"
              />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-maturity-score">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              Maturity Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">{maturityScore}</div>
              <Progress 
                value={maturityScore} 
                className="flex-1 h-3"
              />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-lifecycle-stage">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              Lifecycle Stage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {LIFECYCLE_STAGES.map((stage, idx) => {
                const isActive = stage.id === currentStage;
                const StageIcon = stage.icon;
                return (
                  <div 
                    key={stage.id}
                    className={`flex items-center ${idx < LIFECYCLE_STAGES.length - 1 ? "flex-1" : ""}`}
                  >
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive ? stage.color + " text-white" : "bg-muted"
                      }`}
                      title={stage.label}
                    >
                      <StageIcon className="h-4 w-4" />
                    </div>
                    {idx < LIFECYCLE_STAGES.length - 1 && (
                      <div className="flex-1 h-1 bg-muted mx-1" />
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {LIFECYCLE_STAGES.find(s => s.id === currentStage)?.label || "Unknown"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="handoff" data-testid="tab-handoff">Handoff Package</TabsTrigger>
          <TabsTrigger value="success-plan" data-testid="tab-success-plan">Success Plan</TabsTrigger>
          <TabsTrigger value="health" data-testid="tab-health">Health & Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card data-testid="card-delivery-readiness">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Delivery Readiness
              </CardTitle>
              <CardDescription>
                Pre-flight checks before transitioning to delivery
              </CardDescription>
            </CardHeader>
            <CardContent>
              {readinessLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : readiness ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold" data-testid="text-readiness-score">{readiness.score}%</div>
                    <Progress value={readiness.score} className="flex-1 h-4" data-testid="progress-readiness" />
                    <Badge variant={readiness.score >= 80 ? "default" : "secondary"} data-testid="badge-readiness-status">
                      {readiness.score >= 80 ? "Ready" : "In Progress"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {readiness.checks.map((check, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                        data-testid={`readiness-check-${idx}`}
                      >
                        {check.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" data-testid={`icon-check-passed-${idx}`} />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" data-testid={`icon-check-failed-${idx}`} />
                        )}
                        <span className="text-sm" data-testid={`text-check-label-${idx}`}>{check.label}</span>
                        <Badge variant="outline" className="ml-auto text-xs" data-testid={`badge-check-weight-${idx}`}>
                          {check.weight}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Unable to calculate readiness</p>
              )}
            </CardContent>
          </Card>

          {successPlans && successPlans.length > 0 && (
            <Card data-testid="card-success-plan-summary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Success Plan Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                {successPlans.map((plan) => (
                  <div key={plan.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{plan.title}</span>
                      <Badge variant={plan.status === "active" ? "default" : "secondary"}>
                        {plan.status}
                      </Badge>
                    </div>
                    <Progress value={plan.overallProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      {plan.desiredOutcomes?.filter(o => o.status === "achieved").length || 0} of {plan.desiredOutcomes?.length || 0} outcomes achieved
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="handoff" className="space-y-6">
          <Card data-testid="card-handoff-package">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    AI Handoff Package
                  </CardTitle>
                  <CardDescription>
                    Comprehensive brief for the delivery team
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => generatePackageMutation.mutate()}
                  disabled={generatePackageMutation.isPending}
                  data-testid="button-generate-package"
                >
                  {generatePackageMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {handoffPackage ? "Regenerate" : "Generate"} Package
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {packageLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : handoffPackage ? (
                <div className="space-y-6">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Executive Summary</h4>
                    <p className="text-sm">{handoffPackage.executiveSummary}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-500" />
                        Why They Bought
                      </h4>
                      <ul className="space-y-2">
                        {handoffPackage.whyTheyBought.map((reason, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-1 text-muted-foreground" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        Success Criteria
                      </h4>
                      <ul className="space-y-2">
                        {handoffPackage.successCriteria.map((criterion, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-1 text-muted-foreground" />
                            {criterion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      Key Stakeholders
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {handoffPackage.keyStakeholders.map((stakeholder, idx) => (
                        <div key={idx} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{stakeholder.name}</span>
                            <Badge variant={
                              stakeholder.influence === "high" ? "default" :
                              stakeholder.influence === "medium" ? "secondary" : "outline"
                            }>
                              {stakeholder.influence}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{stakeholder.role}</p>
                          {stakeholder.notes && (
                            <p className="text-xs mt-2 text-muted-foreground">{stakeholder.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Risks & Concerns
                      </h4>
                      <ul className="space-y-2">
                        {handoffPackage.risksAndConcerns.map((risk, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded">
                            <AlertTriangle className="h-3 w-3 mt-1 text-amber-500" />
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-blue-500" />
                        Recommended Actions
                      </h4>
                      <ul className="space-y-2">
                        {handoffPackage.recommendedActions.map((action, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                            <span className="font-medium text-blue-600">{idx + 1}.</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {handoffPackage.specialCommitments.length > 0 && (
                    <div className="space-y-3 p-4 border-2 border-dashed rounded-lg">
                      <h4 className="font-medium flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500" />
                        Special Commitments
                      </h4>
                      <ul className="space-y-2">
                        {handoffPackage.specialCommitments.map((commitment, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <Star className="h-3 w-3 mt-1 text-amber-500" />
                            {commitment}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {handoffPackage.generatedAt && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Generated {new Date(handoffPackage.generatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No Handoff Package Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate an AI-powered handoff brief to help the delivery team succeed
                  </p>
                  <Button
                    onClick={() => generatePackageMutation.mutate()}
                    disabled={generatePackageMutation.isPending}
                    data-testid="button-generate-package-empty"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Handoff Package
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="success-plan" className="space-y-6">
          {plansLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : successPlans && successPlans.length > 0 ? (
            successPlans.map((plan) => (
              <Card key={plan.id} data-testid={`card-success-plan-${plan.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{plan.title}</CardTitle>
                      <CardDescription>
                        {plan.executiveSponsor && `Sponsor: ${plan.executiveSponsor}`}
                        {plan.deliveryLead && ` | Lead: ${plan.deliveryLead}`}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        plan.riskLevel === "low" ? "default" :
                        plan.riskLevel === "medium" ? "secondary" : "destructive"
                      }>
                        {plan.riskLevel} risk
                      </Badge>
                      <Badge variant="outline">{plan.status}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Progress</span>
                      <span>{plan.overallProgress}%</span>
                    </div>
                    <Progress value={plan.overallProgress} className="h-2" />
                  </div>

                  {plan.desiredOutcomes && plan.desiredOutcomes.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Desired Outcomes</h4>
                      {plan.desiredOutcomes.map((outcome) => (
                        <div key={outcome.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{outcome.outcome}</span>
                            <Badge variant={
                              outcome.status === "achieved" ? "default" :
                              outcome.status === "in_progress" ? "secondary" :
                              outcome.status === "at_risk" ? "destructive" : "outline"
                            }>
                              {outcome.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{outcome.businessImpact}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Metric: {outcome.successMetric}</span>
                            <span>Target: {new Date(outcome.targetDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No Success Plan Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Initialize a success plan from your confirmed commitments
                </p>
                <Button
                  onClick={() => initializeSuccessPlanMutation.mutate()}
                  disabled={initializeSuccessPlanMutation.isPending}
                  data-testid="button-initialize-success-plan"
                >
                  {initializeSuccessPlanMutation.isPending && (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Initialize Success Plan
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <Card data-testid="card-health-factors">
            <CardHeader>
              <CardTitle>Health Factors</CardTitle>
              <CardDescription>
                Composite health score based on key indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Engagement", value: (project as any)?.healthFactors?.engagement ?? 0, color: "bg-blue-500" },
                  { label: "Adoption", value: (project as any)?.healthFactors?.adoption ?? 0, color: "bg-purple-500" },
                  { label: "Sentiment", value: (project as any)?.healthFactors?.sentiment ?? 0, color: "bg-green-500" },
                  { label: "Outcomes", value: (project as any)?.healthFactors?.outcomes ?? 0, color: "bg-amber-500" },
                ].map((factor) => (
                  <div key={factor.label} className="text-center p-4 border rounded-lg">
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          cx="32" cy="32" r="28"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-muted"
                        />
                        <circle
                          cx="32" cy="32" r="28"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${(factor.value / 100) * 176} 176`}
                          className={factor.color.replace("bg-", "text-")}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                        {factor.value}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{factor.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-lifecycle-journey">
            <CardHeader>
              <CardTitle>Customer Journey</CardTitle>
              <CardDescription>
                Track progression through the customer success lifecycle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {LIFECYCLE_STAGES.map((stage, idx) => {
                  const isActive = stage.id === currentStage;
                  const isPast = LIFECYCLE_STAGES.findIndex(s => s.id === currentStage) > idx;
                  const StageIcon = stage.icon;
                  
                  return (
                    <div key={stage.id} className="flex-1 flex flex-col items-center">
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                          isActive ? stage.color + " text-white" : 
                          isPast ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <StageIcon className="h-6 w-6" />
                      </div>
                      <span className={`text-xs text-center ${isActive ? "font-bold" : "text-muted-foreground"}`}>
                        {stage.label}
                      </span>
                      {idx < LIFECYCLE_STAGES.length - 1 && (
                        <div className="absolute left-1/2 w-full h-1 bg-muted -z-10" style={{ top: "24px" }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                {currentStage === "onboarding" && "Focus on getting the customer up and running with initial training and setup."}
                {currentStage === "adoption" && "Drive feature adoption and ensure the customer is getting value from the solution."}
                {currentStage === "value_realization" && "Track and validate the promised business outcomes are being achieved."}
                {currentStage === "expansion" && "Identify opportunities for upsell, cross-sell, or deeper partnership."}
                {currentStage === "advocacy" && "Cultivate the customer as a reference and advocate for your solution."}
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
