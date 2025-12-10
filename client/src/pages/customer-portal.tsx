import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Target, 
  TrendingUp, 
  BarChart3, 
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Users,
  RefreshCw,
  Clock,
  ThumbsUp,
  Send,
  Loader2,
  FileText,
  Layers
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PortalStrategy {
  id: string;
  strategyName: string;
  strategyDescription: string;
  strategicCategory: string;
  businessRationale: string;
  expectedOutcomes: string[];
  timeframe: string;
  priority: string;
}

interface PortalOutcome {
  id: string;
  strategyId: string;
  outcomeName: string;
  outcomeDescription: string;
  kpiDetails: {
    metricName: string;
    unit: string;
    suggestedBaseline: string;
    suggestedTarget: string;
    timeframe: string;
  };
  valuePillar: string;
  achievability: string;
  businessImpact: string;
  kornFerrySolution: string;
  clientApproved?: boolean;
}

interface PortalComment {
  id: string;
  section: string;
  itemId: string;
  comment: string;
  createdAt: string;
  customerName: string;
}

interface CustomerPortalData {
  project: {
    id: number;
    name: string;
    companyName: string;
    companyLogoUrl: string | null;
    sector: string | null;
  };
  strategies: PortalStrategy[];
  outcomes: PortalOutcome[];
  commitments: Array<{
    id: number;
    commitmentTitle: string;
    commitmentDescription: string;
    status: string;
    valuePillar: string;
    baselineValue: string | null;
    targetValue: string | null;
    metricUnit: string | null;
  }>;
  permissions: string;
  customerName: string | null;
  welcomeMessage: string | null;
  portalTitle: string | null;
  portalSections: {
    overview: boolean;
    strategies: boolean;
    outcomes: boolean;
    progress: boolean;
  } | null;
  clientComments: PortalComment[];
  clientApprovals: Array<{
    section: string;
    itemId: string;
    approved: boolean;
    approvedAt: string;
    customerName: string;
  }>;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof Target; color: string }> = {
  growth: { label: "Growth", icon: TrendingUp, color: "bg-emerald-100 text-emerald-800" },
  transformation: { label: "Transformation", icon: RefreshCw, color: "bg-blue-100 text-blue-800" },
  talent: { label: "Talent", icon: Users, color: "bg-purple-100 text-purple-800" },
  culture: { label: "Culture", icon: Lightbulb, color: "bg-amber-100 text-amber-800" },
  operations: { label: "Operations", icon: Building2, color: "bg-slate-100 text-slate-800" },
  leadership: { label: "Leadership", icon: Target, color: "bg-rose-100 text-rose-800" },
};

const VALUE_PILLAR_CONFIG: Record<string, { label: string; color: string }> = {
  grow: { label: "Grow", color: "bg-emerald-100 text-emerald-700" },
  optimise: { label: "Optimise", color: "bg-blue-100 text-blue-700" },
  derisk: { label: "De-risk", color: "bg-amber-100 text-amber-700" },
  strengthen: { label: "Strengthen", color: "bg-purple-100 text-purple-700" },
};

export default function CustomerPortalPage() {
  const [, params] = useRoute("/portal/:token");
  const token = params?.token || "";
  const { toast } = useToast();
  const [customerName, setCustomerName] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const { data, isLoading, error, refetch } = useQuery<CustomerPortalData>({
    queryKey: [`/api/portal/${token}`],
    enabled: !!token,
  });

  useEffect(() => {
    if (data?.customerName) {
      setCustomerName(data.customerName);
    }
  }, [data?.customerName]);

  const addCommentMutation = useMutation({
    mutationFn: async (commentData: { section: string; itemId: string; comment: string }) => {
      const response = await apiRequest("POST", `/api/portal/${token}/comment`, {
        ...commentData,
        customerName: customerName || "Anonymous",
      });
      return response.json();
    },
    onSuccess: (_data, variables) => {
      toast({ title: "Comment added", description: "Your feedback has been recorded" });
      const key = `${variables.section}_${variables.itemId}`;
      setCommentInputs(prev => ({ ...prev, [key]: "" }));
      refetch();
    },
    onError: () => {
      toast({ variant: "destructive", title: "Failed to add comment" });
    },
  });

  const getCommentKey = (section: string, itemId: string) => `${section}_${itemId}`;

  const handleCommentChange = (section: string, itemId: string, value: string) => {
    const key = getCommentKey(section, itemId);
    setCommentInputs(prev => ({ ...prev, [key]: value }));
  };

  const getCommentValue = (section: string, itemId: string) => {
    return commentInputs[getCommentKey(section, itemId)] || "";
  };

  const approveItemMutation = useMutation({
    mutationFn: async (approvalData: { section: string; itemId: string }) => {
      const response = await apiRequest("POST", `/api/portal/${token}/approve`, {
        ...approvalData,
        customerName: customerName || "Anonymous",
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Approved!", description: "Your approval has been recorded" });
      refetch();
    },
    onError: () => {
      toast({ variant: "destructive", title: "Failed to record approval" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading your collaboration portal...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              This link may have expired or been revoked. Please contact your Korn Ferry consultant for a new link.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const canEdit = data.permissions === "edit" || data.permissions === "comment";
  const sections = data.portalSections || { overview: true, strategies: true, outcomes: true, progress: true };

  const getApprovalStatus = (section: string, itemId: string) => {
    return data.clientApprovals?.find(a => a.section === section && a.itemId === itemId);
  };

  const getCommentsForItem = (section: string, itemId: string) => {
    return data.clientComments?.filter(c => c.section === section && c.itemId === itemId) || [];
  };

  const handleAddComment = (section: string, itemId: string) => {
    const comment = getCommentValue(section, itemId);
    if (!comment.trim()) return;
    addCommentMutation.mutate({ section, itemId, comment });
  };

  const handleApprove = (section: string, itemId: string) => {
    approveItemMutation.mutate({ section, itemId });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="border-b bg-white dark:bg-slate-900 shadow-sm">
        <div className="container mx-auto p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20">
              {data.project.companyLogoUrl ? (
                <img 
                  src={data.project.companyLogoUrl} 
                  alt={`${data.project.companyName} logo`}
                  className="w-full h-full object-contain p-2"
                  data-testid="img-portal-company-logo"
                />
              ) : (
                <Building2 className="h-7 w-7 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-portal-company-name">
                {data.project.companyName}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span>{data.portalTitle || "Collaboration Portal"}</span>
                <Badge variant="outline" className="text-xs">
                  Powered by Korn Ferry
                </Badge>
              </p>
            </div>
          </div>

          {data.welcomeMessage && (
            <div className="bg-primary/5 rounded-lg p-4 mb-4 border border-primary/10">
              <p className="text-sm text-muted-foreground">{data.welcomeMessage}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{data.project.name}</h2>
              <p className="text-sm text-muted-foreground">{data.project.sector || "Strategic Initiative"}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" data-testid="badge-portal-permission">
                {canEdit ? "Collaboration Access" : "View Only"}
              </Badge>
              {canEdit && (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Your name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-40 h-8 text-sm"
                    data-testid="input-portal-customer-name"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            {sections.overview && (
              <TabsTrigger value="overview" data-testid="tab-overview">
                <FileText className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
            )}
            {sections.strategies && (
              <TabsTrigger value="strategies" data-testid="tab-strategies">
                <Layers className="w-4 h-4 mr-2" />
                Strategies
              </TabsTrigger>
            )}
            {sections.outcomes && (
              <TabsTrigger value="outcomes" data-testid="tab-outcomes">
                <Target className="w-4 h-4 mr-2" />
                Outcomes
              </TabsTrigger>
            )}
            {sections.progress && (
              <TabsTrigger value="progress" data-testid="tab-progress">
                <BarChart3 className="w-4 h-4 mr-2" />
                Progress
              </TabsTrigger>
            )}
          </TabsList>

          {sections.overview && (
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Engagement Overview
                  </CardTitle>
                  <CardDescription>
                    Summary of our strategic collaboration with {data.project.companyName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-emerald-600">{data.strategies?.length || 0}</div>
                      <div className="text-sm text-muted-foreground">Strategic Priorities</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-blue-600">{data.outcomes?.length || 0}</div>
                      <div className="text-sm text-muted-foreground">Proposed Outcomes</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-purple-600">{data.commitments?.length || 0}</div>
                      <div className="text-sm text-muted-foreground">Active Commitments</div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-medium mb-3">How to Collaborate</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <MessageSquare className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Add Comments</p>
                          <p className="text-xs text-muted-foreground">
                            Share your feedback on strategies and outcomes
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <ThumbsUp className="w-5 h-5 text-emerald-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Approve Items</p>
                          <p className="text-xs text-muted-foreground">
                            Indicate your approval for proposed outcomes
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {sections.strategies && (
            <TabsContent value="strategies" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-violet-500" />
                    Strategic Priorities
                  </CardTitle>
                  <CardDescription>
                    Recommended organizational strategies aligned with your goals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.strategies?.length > 0 ? (
                    <div className="space-y-4">
                      {data.strategies.map((strategy) => {
                        const categoryConfig = CATEGORY_CONFIG[strategy.strategicCategory] || CATEGORY_CONFIG.leadership;
                        const CategoryIcon = categoryConfig.icon;
                        const approval = getApprovalStatus("strategies", strategy.id);
                        const comments = getCommentsForItem("strategies", strategy.id);

                        return (
                          <div 
                            key={strategy.id} 
                            className="border rounded-lg p-4 space-y-3"
                            data-testid={`strategy-item-${strategy.id}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">{strategy.strategyName}</h4>
                                  <Badge className={`text-xs ${categoryConfig.color}`}>
                                    <CategoryIcon className="w-3 h-3 mr-1" />
                                    {categoryConfig.label}
                                  </Badge>
                                  {approval?.approved && (
                                    <Badge className="bg-emerald-100 text-emerald-700">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Approved
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{strategy.strategyDescription}</p>
                              </div>
                            </div>

                            <div className="bg-muted/30 rounded-lg p-3">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Business Rationale</p>
                              <p className="text-sm">{strategy.businessRationale}</p>
                            </div>

                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">Expected Outcomes</p>
                              <div className="flex flex-wrap gap-2">
                                {strategy.expectedOutcomes.map((outcome, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {outcome}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {comments.length > 0 && (
                              <div className="border-t pt-3">
                                <p className="text-xs font-medium text-muted-foreground mb-2">Comments</p>
                                <div className="space-y-2">
                                  {comments.map((comment) => (
                                    <div key={comment.id} className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2">
                                      <p className="text-sm">{comment.comment}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        — {comment.customerName} • {new Date(comment.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {canEdit && (
                              <div className="border-t pt-3 flex items-center gap-2">
                                {!approval?.approved && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleApprove("strategies", strategy.id)}
                                    disabled={approveItemMutation.isPending}
                                    data-testid={`button-approve-strategy-${strategy.id}`}
                                  >
                                    <ThumbsUp className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                )}
                                <div className="flex-1 flex gap-2">
                                  <Input
                                    placeholder="Add a comment..."
                                    value={getCommentValue("strategies", strategy.id)}
                                    onChange={(e) => handleCommentChange("strategies", strategy.id, e.target.value)}
                                    className="h-8 text-sm"
                                    data-testid={`input-comment-strategy-${strategy.id}`}
                                  />
                                  <Button 
                                    size="sm"
                                    onClick={() => handleAddComment("strategies", strategy.id)}
                                    disabled={addCommentMutation.isPending || !getCommentValue("strategies", strategy.id).trim()}
                                    data-testid={`button-send-comment-strategy-${strategy.id}`}
                                  >
                                    <Send className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No strategies have been shared yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {sections.outcomes && (
            <TabsContent value="outcomes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-500" />
                    Proposed Outcomes
                  </CardTitle>
                  <CardDescription>
                    Measurable outcomes aligned with your strategic priorities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.outcomes?.length > 0 ? (
                    <div className="space-y-4">
                      {data.outcomes.map((outcome) => {
                        const pillarConfig = VALUE_PILLAR_CONFIG[outcome.valuePillar] || VALUE_PILLAR_CONFIG.strengthen;
                        const approval = getApprovalStatus("outcomes", outcome.id);
                        const comments = getCommentsForItem("outcomes", outcome.id);

                        return (
                          <div 
                            key={outcome.id} 
                            className="border rounded-lg p-4 space-y-3"
                            data-testid={`outcome-item-${outcome.id}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">{outcome.outcomeName}</h4>
                                  <Badge className={`text-xs ${pillarConfig.color}`}>
                                    {pillarConfig.label}
                                  </Badge>
                                  {approval?.approved && (
                                    <Badge className="bg-emerald-100 text-emerald-700">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Approved
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{outcome.outcomeDescription}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="bg-muted/30 rounded-lg p-2 text-center">
                                <p className="text-xs text-muted-foreground">Metric</p>
                                <p className="text-sm font-medium">{outcome.kpiDetails.metricName}</p>
                              </div>
                              <div className="bg-muted/30 rounded-lg p-2 text-center">
                                <p className="text-xs text-muted-foreground">Baseline</p>
                                <p className="text-sm font-medium">{outcome.kpiDetails.suggestedBaseline}</p>
                              </div>
                              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-2 text-center">
                                <p className="text-xs text-muted-foreground">Target</p>
                                <p className="text-sm font-medium text-emerald-600">{outcome.kpiDetails.suggestedTarget}</p>
                              </div>
                              <div className="bg-muted/30 rounded-lg p-2 text-center">
                                <p className="text-xs text-muted-foreground">Timeframe</p>
                                <p className="text-sm font-medium">{outcome.kpiDetails.timeframe}</p>
                              </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Business Impact</p>
                              <p className="text-sm">{outcome.businessImpact}</p>
                            </div>

                            {comments.length > 0 && (
                              <div className="border-t pt-3">
                                <p className="text-xs font-medium text-muted-foreground mb-2">Your Feedback</p>
                                <div className="space-y-2">
                                  {comments.map((comment) => (
                                    <div key={comment.id} className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2">
                                      <p className="text-sm">{comment.comment}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        — {comment.customerName} • {new Date(comment.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {canEdit && (
                              <div className="border-t pt-3 flex items-center gap-2">
                                {!approval?.approved && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleApprove("outcomes", outcome.id)}
                                    disabled={approveItemMutation.isPending}
                                    data-testid={`button-approve-outcome-${outcome.id}`}
                                  >
                                    <ThumbsUp className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                )}
                                <div className="flex-1 flex gap-2">
                                  <Input
                                    placeholder="Add a comment..."
                                    value={getCommentValue("outcomes", outcome.id)}
                                    onChange={(e) => handleCommentChange("outcomes", outcome.id, e.target.value)}
                                    className="h-8 text-sm"
                                    data-testid={`input-comment-outcome-${outcome.id}`}
                                  />
                                  <Button 
                                    size="sm"
                                    onClick={() => handleAddComment("outcomes", outcome.id)}
                                    disabled={addCommentMutation.isPending || !getCommentValue("outcomes", outcome.id).trim()}
                                    data-testid={`button-send-comment-outcome-${outcome.id}`}
                                  >
                                    <Send className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No outcomes have been shared yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {sections.progress && (
            <TabsContent value="progress" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Commitment Progress
                  </CardTitle>
                  <CardDescription>
                    Track the status of agreed-upon commitments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.commitments?.length > 0 ? (
                    <div className="space-y-4">
                      {data.commitments.map((commitment) => {
                        const pillarConfig = VALUE_PILLAR_CONFIG[commitment.valuePillar] || VALUE_PILLAR_CONFIG.strengthen;
                        
                        return (
                          <div 
                            key={commitment.id} 
                            className="border rounded-lg p-4"
                            data-testid={`commitment-item-${commitment.id}`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">{commitment.commitmentTitle}</h4>
                                  <Badge className={`text-xs ${pillarConfig.color}`}>
                                    {pillarConfig.label}
                                  </Badge>
                                  <Badge 
                                    variant="outline" 
                                    className={commitment.status === "confirmed" ? "border-emerald-500 text-emerald-700" : ""}
                                  >
                                    {commitment.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{commitment.commitmentDescription}</p>
                              </div>
                            </div>

                            {(commitment.baselineValue || commitment.targetValue) && (
                              <div className="grid grid-cols-3 gap-3 mt-3">
                                <div className="bg-muted/30 rounded-lg p-2 text-center">
                                  <p className="text-xs text-muted-foreground">Baseline</p>
                                  <p className="text-sm font-medium">
                                    {commitment.baselineValue || "—"} {commitment.metricUnit || ""}
                                  </p>
                                </div>
                                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-2 text-center">
                                  <p className="text-xs text-muted-foreground">Target</p>
                                  <p className="text-sm font-medium text-emerald-600">
                                    {commitment.targetValue || "—"} {commitment.metricUnit || ""}
                                  </p>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2 text-center">
                                  <p className="text-xs text-muted-foreground">Current</p>
                                  <p className="text-sm font-medium text-blue-600">In Progress</p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No commitments have been confirmed yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      <footer className="border-t bg-white dark:bg-slate-900 py-4 mt-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>Powered by <span className="font-semibold">Korn Ferry Loop</span></p>
        </div>
      </footer>
    </div>
  );
}
