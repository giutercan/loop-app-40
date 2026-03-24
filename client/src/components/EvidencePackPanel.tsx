import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  Plus, 
  Trash2, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb,
  FileText,
  TrendingUp,
  Award,
  Target,
  MessageSquare,
  Eye,
  Sparkles,
  Loader2,
  ExternalLink,
  Clock,
  User,
  Shield,
  Download,
  Users,
  Building2,
  BarChart3,
  Heart,
  GraduationCap
} from "lucide-react";
import { SourceLink, SourcePreviewDrawer } from "@/components/evidence-pack";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { EvidencePack, EvidencePackItem, EvidencePackComment } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EvidencePackPanelProps {
  projectId: number;
  projectName?: string;
  trigger?: React.ReactNode;
}

interface EvidencePackResponse {
  pack: EvidencePack | null;
  items: EvidencePackItem[];
  comments: EvidencePackComment[];
}

const statusConfig = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: FileText },
  pending_review: { label: "Pending Review", color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400", icon: Clock },
  in_review: { label: "In Review", color: "bg-blue-500/20 text-blue-700 dark:text-blue-400", icon: Eye },
  approved: { label: "Approved", color: "bg-green-500/20 text-green-700 dark:text-green-400", icon: CheckCircle2 },
  rejected: { label: "Needs Work", color: "bg-red-500/20 text-red-700 dark:text-red-400", icon: AlertCircle },
  shared: { label: "Shared", color: "bg-purple-500/20 text-purple-700 dark:text-purple-400", icon: ExternalLink },
};

const itemTypeIcons = {
  claim: Target,
  insight: Lightbulb,
  outcome: TrendingUp,
  success_story: Award,
  benchmark: FileText,
  testimonial: MessageSquare,
  artifact: Package,
  // Quantitative evidence
  kpi: BarChart3,
  baseline: BarChart3,
  target: Target,
  assumption: AlertCircle,
  // Discovery evidence
  stakeholder_claim: Users,
  meeting_insight: MessageSquare,
  // Skills & coaching (internal-facing)
  coaching_observation: GraduationCap,
  communication_signal: MessageSquare,
  leadership_behavior: Award,
  skill_growth_metric: TrendingUp,
  // Relationship building
  stakeholder_trust_signal: Heart,
  relationship_milestone: CheckCircle2,
  engagement_indicator: Eye,
  // Deal progression
  risk: AlertCircle,
  decision: CheckCircle2,
  commitment: Target,
  deliverable: Package,
  next_action: Clock,
};

const valuePillarColors = {
  grow: "bg-green-500/20 text-green-700 dark:text-green-400",
  optimise: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
  derisk: "bg-orange-500/20 text-orange-700 dark:text-orange-400",
  strengthen: "bg-purple-500/20 text-purple-700 dark:text-purple-400",
};

// Audience scope configuration
const audienceScopeConfig = {
  customer: { label: "Customer-Facing", icon: Building2, color: "bg-blue-500/20 text-blue-700 dark:text-blue-400" },
  internal: { label: "Internal/Leadership", icon: Users, color: "bg-purple-500/20 text-purple-700 dark:text-purple-400" },
  both: { label: "All Audiences", icon: Eye, color: "bg-muted text-muted-foreground" },
};

// Skill domain configuration
const skillDomainConfig = {
  soft_skill: { label: "Soft Skills", icon: Heart, color: "bg-pink-500/20 text-pink-700 dark:text-pink-400" },
  hard_data: { label: "Hard Data", icon: BarChart3, color: "bg-green-500/20 text-green-700 dark:text-green-400" },
  relationship: { label: "Relationship", icon: Users, color: "bg-blue-500/20 text-blue-700 dark:text-blue-400" },
  skills_building: { label: "Skills Building", icon: GraduationCap, color: "bg-orange-500/20 text-orange-700 dark:text-orange-400" },
};

export function EvidencePackPanel({ 
  projectId, 
  projectName,
  trigger 
}: EvidencePackPanelProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [newItemClaim, setNewItemClaim] = useState("");
  const [newItemType, setNewItemType] = useState<string>("claim");
  const [newItemPillar, setNewItemPillar] = useState<string>("");
  const [newItemSection, setNewItemSection] = useState("");
  const [previewItem, setPreviewItem] = useState<EvidencePackItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [audienceFilter, setAudienceFilter] = useState<"all" | "customer" | "internal">("customer");

  const { data, isLoading, refetch } = useQuery<EvidencePackResponse>({
    queryKey: [`/api/projects/${projectId}/evidence-pack`],
    enabled: !!projectId && open,
  });

  const createPackMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/projects/${projectId}/evidence-pack`, {
        title: `${projectName || 'Project'} - Evidence Pack`,
        ownerName: "Seller",
        ownerId: "current-user",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/evidence-pack`] });
      toast({ title: "Evidence Pack created" });
    },
    onError: (error: Error) => {
      // If pack already exists, just refetch to show it
      if (error.message.includes("already exists")) {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/evidence-pack`] });
        refetch();
        return;
      }
      toast({ title: "Failed to create pack", description: error.message, variant: "destructive" });
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (itemData: { claim: string; itemType: string; valuePillar?: string; section?: string }) => {
      return await apiRequest("POST", `/api/evidence-packs/${data?.pack?.id}/items`, {
        ...itemData,
        actorName: "Seller",
        actorId: "current-user",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/evidence-pack`] });
      setNewItemClaim("");
      setNewItemType("claim");
      setNewItemPillar("");
      setNewItemSection("");
      setAddItemOpen(false);
      toast({ title: "Item added to pack" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add item", description: error.message, variant: "destructive" });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      return await apiRequest("DELETE", `/api/evidence-pack-items/${itemId}`, {
        actorName: "Seller",
        actorId: "current-user",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/evidence-pack`] });
      toast({ title: "Item removed from pack" });
    },
  });

  const submitForReviewMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PATCH", `/api/evidence-packs/${data?.pack?.id}`, {
        status: "pending_review",
        actorName: "Seller",
        actorId: "current-user",
        actorRole: "seller",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/evidence-pack`] });
      toast({ title: "Pack submitted for review", description: "A leader will review your evidence pack" });
    },
  });

  const [activeTab, setActiveTab] = useState<string>("items");
  const [recommendations, setRecommendations] = useState<any>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const sharePackMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/evidence-packs/${data?.pack?.id}/share`, {});
    },
    onSuccess: (response: any) => {
      const url = `${window.location.origin}/evidence/${response.shareToken}`;
      setShareUrl(url);
      setShowShareDialog(true);
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/evidence-pack`] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to generate share link", description: error.message, variant: "destructive" });
    },
  });

  const getRecommendationsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/evidence-packs/${data?.pack?.id}/recommendations`, {
        phase: "discovery"
      });
    },
    onSuccess: (data) => {
      setRecommendations(data);
      toast({ title: "AI Recommendations loaded" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to get recommendations", description: error.message, variant: "destructive" });
    },
  });

  const addRecommendedItemMutation = useMutation({
    mutationFn: async (rec: any) => {
      return await apiRequest("POST", `/api/evidence-packs/${data?.pack?.id}/items`, {
        claim: rec.claim,
        itemType: rec.itemType,
        valuePillar: rec.valuePillar,
        section: rec.section,
        proofSources: rec.proofSources,
        coachingTip: rec.coachingTip,
        aiGenerated: true,
        aiProvenance: {
          model: "gpt-4o",
          prompt: "Evidence pack recommendations",
          generatedAt: new Date().toISOString(),
          confidence: rec.confidence
        },
        actorName: "Seller",
        actorId: "current-user",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/evidence-pack`] });
      toast({ title: "Recommendation added to pack" });
    },
  });

  const pack = data?.pack;
  const items = data?.items || [];
  const comments = data?.comments || [];

  const approvedCount = items.filter(i => i.itemStatus === "approved").length;
  const flaggedCount = items.filter(i => i.itemStatus === "flagged" || i.itemStatus === "needs_evidence").length;
  const pendingCount = items.filter(i => i.itemStatus === "pending").length;

  const qualityScore = pack?.qualityScore ?? 0;
  const StatusIcon = pack?.status ? statusConfig[pack.status as keyof typeof statusConfig]?.icon : FileText;

  // Filter items by audience scope
  const filteredItems = items.filter(item => {
    if (audienceFilter === "all") return true;
    const itemAudience = (item as any).audienceScope || "both";
    if (audienceFilter === "customer") {
      return itemAudience === "customer" || itemAudience === "both";
    }
    if (audienceFilter === "internal") {
      return itemAudience === "internal" || itemAudience === "both";
    }
    return true;
  });

  const groupedItems = filteredItems.reduce((acc, item) => {
    const section = item.section || "General";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, EvidencePackItem[]>);

  const unresolvedComments = comments.filter(c => !c.isResolved);

  return (
    <>
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" data-testid="button-open-evidence-pack">
            <Package className="w-4 h-4 mr-2" />
            Evidence Pack
            {pack && items.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {items.length}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl" data-testid="panel-evidence-pack">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Evidence Pack
          </SheetTitle>
          <SheetDescription>
            Build and curate your proof points for client validation
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : !pack ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No Evidence Pack Yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-xs mb-4">
                Create an evidence pack to collect and organize proof points for this engagement
              </p>
              <Button 
                onClick={() => createPackMutation.mutate()}
                disabled={createPackMutation.isPending}
                data-testid="button-create-evidence-pack"
              >
                {createPackMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Evidence Pack
              </Button>
            </div>
          ) : (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{pack.title}</CardTitle>
                    <Badge className={statusConfig[pack.status as keyof typeof statusConfig]?.color || ""}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig[pack.status as keyof typeof statusConfig]?.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>{approvedCount} approved</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{pendingCount} pending</span>
                    </div>
                    {flaggedCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <span>{flaggedCount} needs work</span>
                      </div>
                    )}
                  </div>

                  {qualityScore > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Quality Score</span>
                        <span className="font-medium">{qualityScore}%</span>
                      </div>
                      <Progress 
                        value={qualityScore} 
                        className={`h-1.5 ${qualityScore >= 70 ? '[&>div]:bg-green-500' : qualityScore >= 50 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'}`}
                      />
                    </div>
                  )}

                  {unresolvedComments.length > 0 && (
                    <div className="flex items-center gap-2 p-2 rounded-md bg-orange-500/10 text-sm">
                      <MessageSquare className="w-4 h-4 text-orange-500 shrink-0" />
                      <span className="text-orange-700 dark:text-orange-400">
                        {unresolvedComments.length} unresolved comment{unresolvedComments.length > 1 ? 's' : ''} from leader
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" data-testid="button-add-item">
                          <Plus className="w-4 h-4 mr-1" />
                          Add Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Evidence Item</DialogTitle>
                          <DialogDescription>
                            Add a claim or proof point to your evidence pack
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Claim / Statement</label>
                            <Textarea
                              placeholder="e.g., We reduce time-to-hire by 25% through our assessment process"
                              value={newItemClaim}
                              onChange={(e) => setNewItemClaim(e.target.value)}
                              data-testid="input-item-claim"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Type</label>
                              <Select value={newItemType} onValueChange={setNewItemType}>
                                <SelectTrigger data-testid="select-item-type">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="claim">Claim</SelectItem>
                                  <SelectItem value="insight">Insight</SelectItem>
                                  <SelectItem value="outcome">Outcome</SelectItem>
                                  <SelectItem value="success_story">Success Story</SelectItem>
                                  <SelectItem value="benchmark">Benchmark</SelectItem>
                                  <SelectItem value="testimonial">Testimonial</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Value Pillar</label>
                              <Select value={newItemPillar} onValueChange={setNewItemPillar}>
                                <SelectTrigger data-testid="select-item-pillar">
                                  <SelectValue placeholder="Optional" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="grow">Grow</SelectItem>
                                  <SelectItem value="optimise">Optimise</SelectItem>
                                  <SelectItem value="derisk">De-risk</SelectItem>
                                  <SelectItem value="strengthen">Strengthen</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Section (optional)</label>
                            <Input
                              placeholder="e.g., ROI Claims, Implementation"
                              value={newItemSection}
                              onChange={(e) => setNewItemSection(e.target.value)}
                              data-testid="input-item-section"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setAddItemOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => addItemMutation.mutate({
                              claim: newItemClaim,
                              itemType: newItemType,
                              valuePillar: newItemPillar || undefined,
                              section: newItemSection || undefined,
                            })}
                            disabled={!newItemClaim.trim() || addItemMutation.isPending}
                            data-testid="button-confirm-add-item"
                          >
                            {addItemMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : null}
                            Add Item
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {pack.status === "draft" && items.length > 0 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" data-testid="button-submit-review">
                            <Send className="w-4 h-4 mr-1" />
                            Submit for Review
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Submit for Leader Review?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Your evidence pack will be sent to a leader for review. They may approve, 
                              request changes, or provide coaching feedback on your claims.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => submitForReviewMutation.mutate()}
                              data-testid="button-confirm-submit"
                            >
                              Submit
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    {items.length > 0 && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`/api/evidence-packs/${pack.id}/export/pdf`, '_blank')}
                          data-testid="button-export-pdf"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Export PDF
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`/api/evidence-packs/${pack.id}/export/html`, '_blank')}
                          data-testid="button-export-html"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Export HTML
                        </Button>
                      </>
                    )}

                    {(pack.status === "approved" || pack.status === "shared") && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          if (pack.shareToken) {
                            const url = `${window.location.origin}/evidence/${pack.shareToken}`;
                            setShareUrl(url);
                            setShowShareDialog(true);
                          } else {
                            sharePackMutation.mutate();
                          }
                        }}
                        disabled={sharePackMutation.isPending}
                        data-testid="button-share-pack"
                      >
                        {sharePackMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <ExternalLink className="w-4 h-4 mr-1" />
                        )}
                        Share with Buyer
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* View Mode Toggle - Client View vs Coaching View */}
              <div className="mb-4">
                <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
                  <Button
                    size="sm"
                    variant={audienceFilter === "customer" ? "default" : "ghost"}
                    onClick={() => setAudienceFilter("customer")}
                    className="flex-1 h-9"
                    data-testid="filter-customer"
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Client View
                  </Button>
                  <Button
                    size="sm"
                    variant={audienceFilter === "internal" ? "secondary" : "ghost"}
                    onClick={() => setAudienceFilter("internal")}
                    className="flex-1 h-9"
                    data-testid="filter-internal"
                  >
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Coaching View
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    {audienceFilter === "customer" && "What clients will see when you share this pack"}
                    {audienceFilter === "internal" && "Internal coaching metrics & leadership content"}
                    {audienceFilter === "all" && "Showing all content"}
                  </p>
                  {audienceFilter === "internal" && (() => {
                    const hiddenCount = items.filter(item => {
                      const scope = (item as any).audienceScope;
                      return scope === "internal";
                    }).length;
                    return hiddenCount > 0 ? (
                      <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-600 dark:text-purple-400">
                        {hiddenCount} internal-only item{hiddenCount > 1 ? "s" : ""}
                      </Badge>
                    ) : null;
                  })()}
                </div>
              </div>

              {/* CLIENT VIEW - Executive Summary & Value Pillar Cards */}
              {audienceFilter === "customer" && (
                <>
                  {/* Executive Summary Header */}
                  <Card className="mb-4 border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-transparent">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{projectName || "Engagement"} Value Summary</h3>
                          <p className="text-sm text-muted-foreground">Evidence of delivered value and outcomes</p>
                        </div>
                        <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-400">
                          {filteredItems.length} Evidence Items
                        </Badge>
                      </div>
                      
                      {/* Key Metrics Row */}
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-medium text-green-700 dark:text-green-400">Outcomes</span>
                          </div>
                          <span className="text-xl font-bold">{filteredItems.filter(i => i.itemType === "outcome" || i.itemType === "kpi").length}</span>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Validated</span>
                          </div>
                          <span className="text-xl font-bold">{filteredItems.filter(i => i.itemStatus === "approved").length}</span>
                        </div>
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <div className="flex items-center gap-2 mb-1">
                            <Award className="w-4 h-4 text-amber-600" />
                            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Success Stories</span>
                          </div>
                          <span className="text-xl font-bold">{filteredItems.filter(i => i.itemType === "success_story" || i.itemType === "testimonial").length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Value Pillar Sections */}
                  <div className="space-y-4 mb-4">
                    {(["grow", "optimise", "derisk", "strengthen"] as const).map((pillar) => {
                      const pillarItems = filteredItems.filter(item => item.valuePillar === pillar);
                      if (pillarItems.length === 0) return null;
                      
                      const pillarConfig = {
                        grow: { label: "Grow", icon: TrendingUp, color: "border-green-500/30 bg-green-500/5", headerColor: "text-green-700 dark:text-green-400", description: "Revenue & market expansion" },
                        optimise: { label: "Optimise", icon: Target, color: "border-blue-500/30 bg-blue-500/5", headerColor: "text-blue-700 dark:text-blue-400", description: "Efficiency & cost reduction" },
                        derisk: { label: "De-risk", icon: Shield, color: "border-orange-500/30 bg-orange-500/5", headerColor: "text-orange-700 dark:text-orange-400", description: "Risk mitigation & compliance" },
                        strengthen: { label: "Strengthen", icon: Users, color: "border-purple-500/30 bg-purple-500/5", headerColor: "text-purple-700 dark:text-purple-400", description: "Talent & capability building" },
                      };
                      
                      const config = pillarConfig[pillar];
                      const PillarIcon = config.icon;
                      
                      return (
                        <Card key={pillar} className={config.color}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <PillarIcon className={`w-5 h-5 ${config.headerColor}`} />
                                <div>
                                  <CardTitle className={`text-base ${config.headerColor}`}>{config.label}</CardTitle>
                                  <p className="text-xs text-muted-foreground">{config.description}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {pillarItems.length} item{pillarItems.length > 1 ? "s" : ""}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-2">
                              {pillarItems.map((item) => {
                                const ItemIcon = itemTypeIcons[item.itemType as keyof typeof itemTypeIcons] || FileText;
                                const kfOffering = (item as any).links?.kfOffering || (item as any).content?.kfOffering;
                                
                                return (
                                  <div 
                                    key={item.id}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-background border hover-elevate cursor-pointer"
                                    onClick={() => {
                                      setPreviewItem(item);
                                      setPreviewOpen(true);
                                    }}
                                    data-testid={`client-item-${item.id}`}
                                  >
                                    <div className={`p-2 rounded-md ${config.color}`}>
                                      <ItemIcon className={`w-4 h-4 ${config.headerColor}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium line-clamp-2">{item.claim}</p>
                                      <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <Badge variant="outline" className="text-xs capitalize">
                                          {item.itemType.replace('_', ' ')}
                                        </Badge>
                                        {kfOffering && (
                                          <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                                            {kfOffering}
                                          </Badge>
                                        )}
                                        {item.itemStatus === "approved" && (
                                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                        )}
                                        {item.sourceType && (
                                          <span className="text-xs text-muted-foreground">
                                            Source: {item.sourceType.replace('_', ' ')}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <Eye className="w-4 h-4 text-muted-foreground shrink-0" />
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    
                    {/* Uncategorized items (no value pillar) */}
                    {(() => {
                      const uncategorizedItems = filteredItems.filter(item => !item.valuePillar);
                      if (uncategorizedItems.length === 0) return null;
                      
                      return (
                        <Card className="border-muted">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base text-muted-foreground">Other Evidence</CardTitle>
                              <Badge variant="outline" className="text-xs">
                                {uncategorizedItems.length} item{uncategorizedItems.length > 1 ? "s" : ""}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-2">
                              {uncategorizedItems.map((item) => {
                                const ItemIcon = itemTypeIcons[item.itemType as keyof typeof itemTypeIcons] || FileText;
                                
                                return (
                                  <div 
                                    key={item.id}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-background border hover-elevate cursor-pointer"
                                    onClick={() => {
                                      setPreviewItem(item);
                                      setPreviewOpen(true);
                                    }}
                                    data-testid={`client-item-${item.id}`}
                                  >
                                    <ItemIcon className="w-4 h-4 text-muted-foreground mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm">{item.claim}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-xs capitalize">
                                          {item.itemType.replace('_', ' ')}
                                        </Badge>
                                        {item.itemStatus === "approved" && (
                                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                        )}
                                      </div>
                                    </div>
                                    <Eye className="w-4 h-4 text-muted-foreground shrink-0" />
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })()}

                    {/* Success Stories Section */}
                    {(() => {
                      const successItems = filteredItems.filter(i => i.itemType === "success_story" || i.itemType === "testimonial");
                      if (successItems.length === 0) return null;
                      
                      return (
                        <Card className="border-amber-500/30 bg-amber-500/5">
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                              <Award className="w-5 h-5 text-amber-600" />
                              <CardTitle className="text-base text-amber-700 dark:text-amber-400">Success Stories & Testimonials</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-3">
                              {successItems.map((item) => (
                                <div 
                                  key={item.id}
                                  className="p-4 rounded-lg bg-background border border-amber-500/20"
                                  data-testid={`success-story-${item.id}`}
                                >
                                  <div className="flex items-start gap-3">
                                    <MessageSquare className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
                                    <div>
                                      <p className="text-sm italic">"{item.claim}"</p>
                                      {item.sourceType && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                          — via {item.sourceType.replace('_', ' ')}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })()}
                  </div>
                </>
              )}

              {/* COACHING VIEW - Skills & Relationship Scorecard */}
              {audienceFilter === "internal" && filteredItems.length > 0 && (
                <Card className="mb-4 border-purple-500/20 bg-purple-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-purple-500" />
                      Skills & Relationship Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(skillDomainConfig).map(([domain, config]) => {
                        const domainItems = filteredItems.filter(
                          (item) => (item as any).skillDomain === domain
                        );
                        const DomainIcon = config.icon;
                        const validatedCount = domainItems.filter(
                          (item) => item.itemStatus === "approved" || item.itemStatus === "validated"
                        ).length;
                        
                        return (
                          <div key={domain} className="p-2 rounded-md bg-background border">
                            <div className="flex items-center gap-2 mb-1">
                              <DomainIcon className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs font-medium">{config.label}</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-bold">{domainItems.length}</span>
                              <span className="text-xs text-muted-foreground">items</span>
                              {validatedCount > 0 && (
                                <span className="text-xs text-green-600 ml-auto">
                                  {validatedCount} validated
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Relationship health summary */}
                    {(() => {
                      const trustSignals = filteredItems.filter(
                        (item) => item.itemType === "stakeholder_trust_signal"
                      );
                      if (trustSignals.length === 0) return null;
                      
                      const avgRating = trustSignals.reduce((sum, item) => {
                        const val = parseFloat((item as any).metricValue || "0");
                        return sum + (isNaN(val) ? 0 : val);
                      }, 0) / trustSignals.length;
                      
                      return (
                        <div className="mt-3 p-2 rounded-md bg-blue-500/10 border border-blue-500/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-medium">Relationship Health</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-blue-600">{avgRating.toFixed(1)}</span>
                              <span className="text-xs text-muted-foreground">/ 5</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Based on {trustSignals.length} stakeholder trust signal{trustSignals.length > 1 ? "s" : ""}
                          </p>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Coaching View uses Tabs for Items/AI Suggestions */}
              {audienceFilter === "internal" && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="items" className="flex-1" data-testid="tab-items">
                    <Package className="w-4 h-4 mr-1" />
                    All Items ({filteredItems.length})
                  </TabsTrigger>
                  <TabsTrigger value="recommendations" className="flex-1" data-testid="tab-recommendations">
                    <Sparkles className="w-4 h-4 mr-1" />
                    AI Coaching
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="items" className="mt-4">
                  <ScrollArea className="h-[calc(100vh-480px)]">
                    <div className="space-y-4 pr-4">
                      {Object.keys(groupedItems).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No items yet. Add claims and proof points to build your pack.</p>
                        </div>
                      ) : (
                        Object.entries(groupedItems).map(([section, sectionItems]) => (
                          <div key={section} className="space-y-2">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              {section}
                            </h4>
                            {sectionItems.map((item) => {
                              const ItemIcon = itemTypeIcons[item.itemType as keyof typeof itemTypeIcons] || FileText;
                              const itemComment = comments.find(c => c.itemId === item.id && !c.isResolved);
                              
                              return (
                                <Card 
                                  key={item.id} 
                                  className={`hover-elevate ${
                                    item.itemStatus === "approved" ? "border-green-500/30" :
                                    item.itemStatus === "flagged" || item.itemStatus === "rejected" ? "border-orange-500/30" :
                                    item.itemStatus === "needs_evidence" ? "border-yellow-500/30" : ""
                                  }`}
                                  data-testid={`card-evidence-item-${item.id}`}
                                >
                                  <CardContent className="p-3 space-y-2">
                                    <div className="flex items-start gap-2">
                                      <ItemIcon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm">{item.claim}</p>
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                          <Badge variant="outline" className="text-xs">
                                            {item.itemType.replace('_', ' ')}
                                          </Badge>
                                          {item.valuePillar && (
                                            <Badge className={`text-xs ${valuePillarColors[item.valuePillar as keyof typeof valuePillarColors]}`}>
                                              {item.valuePillar}
                                            </Badge>
                                          )}
                                          {(item as any).skillDomain && skillDomainConfig[(item as any).skillDomain as keyof typeof skillDomainConfig] && (
                                            <Badge className={`text-xs ${skillDomainConfig[(item as any).skillDomain as keyof typeof skillDomainConfig].color}`}>
                                              {(() => {
                                                const DomainIcon = skillDomainConfig[(item as any).skillDomain as keyof typeof skillDomainConfig].icon;
                                                return <DomainIcon className="w-3 h-3 mr-1" />;
                                              })()}
                                              {skillDomainConfig[(item as any).skillDomain as keyof typeof skillDomainConfig].label}
                                            </Badge>
                                          )}
                                          {(item as any).audienceScope === "internal" && (
                                            <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-600 dark:text-purple-400">
                                              <Users className="w-3 h-3 mr-1" />
                                              Internal Only
                                            </Badge>
                                          )}
                                          {item.aiGenerated && (
                                            <Badge variant="secondary" className="text-xs">
                                              <Sparkles className="w-3 h-3 mr-1" />
                                              AI
                                            </Badge>
                                          )}
                                          {item.itemStatus === "approved" && (
                                            <Badge className="text-xs bg-green-500/20 text-green-700 dark:text-green-400">
                                              <CheckCircle2 className="w-3 h-3 mr-1" />
                                              Approved
                                            </Badge>
                                          )}
                                          {(item.itemStatus === "flagged" || item.itemStatus === "rejected") && (
                                            <Badge className="text-xs bg-orange-500/20 text-orange-700 dark:text-orange-400">
                                              <AlertCircle className="w-3 h-3 mr-1" />
                                              Needs Work
                                            </Badge>
                                          )}
                                          {item.sourceType && (
                                            <SourceLink 
                                              item={item} 
                                              projectId={projectId} 
                                              onNavigate={() => setOpen(false)}
                                              onPreview={(item) => {
                                                setPreviewItem(item);
                                                setPreviewOpen(true);
                                              }}
                                            />
                                          )}
                                        </div>
                                      </div>
                                      {pack.status === "draft" && (
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="shrink-0 h-8 w-8"
                                          onClick={() => deleteItemMutation.mutate(item.id)}
                                          data-testid={`button-delete-item-${item.id}`}
                                        >
                                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                                        </Button>
                                      )}
                                    </div>

                                    {item.coachingTip && (
                                      <div className="flex items-start gap-2 p-2 rounded-md bg-blue-500/10 text-xs">
                                        <Lightbulb className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                                        <span className="text-blue-700 dark:text-blue-400">{item.coachingTip}</span>
                                      </div>
                                    )}

                                    {item.reviewerComment && (
                                      <div className="flex items-start gap-2 p-2 rounded-md bg-muted text-xs">
                                        <User className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                        <div>
                                          <span className="font-medium">Leader feedback: </span>
                                          <span className="text-muted-foreground">{item.reviewerComment}</span>
                                        </div>
                                      </div>
                                    )}

                                    {itemComment && (
                                      <div className="flex items-start gap-2 p-2 rounded-md bg-orange-500/10 text-xs">
                                        <MessageSquare className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                                        <div>
                                          <span className="font-medium text-orange-700 dark:text-orange-400">
                                            {itemComment.authorName}: 
                                          </span>
                                          <span className="text-orange-700 dark:text-orange-400 ml-1">
                                            {itemComment.content}
                                          </span>
                                        </div>
                                      </div>
                                    )}

                                    {item.proofSources && (item.proofSources as any[]).length > 0 && (
                                      <div className="flex flex-wrap gap-1 pt-1">
                                        {(item.proofSources as any[]).map((source, idx) => (
                                          <Badge key={idx} variant="outline" className="text-xs">
                                            <Shield className="w-3 h-3 mr-1" />
                                            {source.title}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="recommendations" className="mt-4">
                  <ScrollArea className="h-[calc(100vh-480px)]">
                    <div className="space-y-4 pr-4">
                      {!recommendations ? (
                        <div className="text-center py-8">
                          <Sparkles className="w-12 h-12 mx-auto mb-3 text-primary/30" />
                          <h4 className="font-medium mb-2">AI-Powered Recommendations</h4>
                          <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-4">
                            Get AI suggestions for evidence items based on your discovery insights and committed outcomes
                          </p>
                          <Button
                            onClick={() => getRecommendationsMutation.mutate()}
                            disabled={getRecommendationsMutation.isPending}
                            data-testid="button-get-recommendations"
                          >
                            {getRecommendationsMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4 mr-2" />
                            )}
                            Generate Recommendations
                          </Button>
                        </div>
                      ) : (
                        <>
                          {recommendations.packCoaching && (
                            <Card className="border-primary/20 bg-primary/5">
                              <CardContent className="p-3">
                                <div className="flex items-start gap-2">
                                  <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                  <div>
                                    <h5 className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                                      Pack Coaching
                                    </h5>
                                    <p className="text-sm">{recommendations.packCoaching}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {recommendations.qualityAssessment && (
                            <Card>
                              <CardContent className="p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Shield className="w-4 h-4" />
                                  <span className="text-xs font-semibold uppercase tracking-wider">
                                    Quality Assessment
                                  </span>
                                  <Badge 
                                    className={`text-xs ml-auto ${
                                      recommendations.qualityAssessment.overallStrength === 'strong' 
                                        ? 'bg-green-500/20 text-green-700' 
                                        : recommendations.qualityAssessment.overallStrength === 'moderate'
                                        ? 'bg-yellow-500/20 text-yellow-700'
                                        : 'bg-red-500/20 text-red-700'
                                    }`}
                                  >
                                    {recommendations.qualityAssessment.overallStrength}
                                  </Badge>
                                </div>
                                {recommendations.qualityAssessment.gaps?.length > 0 && (
                                  <div className="space-y-1 text-xs text-muted-foreground">
                                    <p className="font-medium">Gaps to address:</p>
                                    <ul className="list-disc list-inside pl-2">
                                      {recommendations.qualityAssessment.gaps.map((gap: string, idx: number) => (
                                        <li key={idx}>{gap}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}

                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">
                            Suggested Items ({recommendations.recommendations?.length || 0})
                          </h4>

                          {recommendations.recommendations?.map((rec: any, idx: number) => {
                            const RecIcon = itemTypeIcons[rec.itemType as keyof typeof itemTypeIcons] || FileText;
                            return (
                              <Card key={idx} className="hover-elevate" data-testid={`card-recommendation-${idx}`}>
                                <CardContent className="p-3 space-y-2">
                                  <div className="flex items-start gap-2">
                                    <RecIcon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm">{rec.claim}</p>
                                      <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <Badge variant="outline" className="text-xs">
                                          {rec.itemType.replace('_', ' ')}
                                        </Badge>
                                        {rec.valuePillar && (
                                          <Badge className={`text-xs ${valuePillarColors[rec.valuePillar as keyof typeof valuePillarColors]}`}>
                                            {rec.valuePillar}
                                          </Badge>
                                        )}
                                        <Badge variant="secondary" className="text-xs">
                                          {rec.confidence}% confidence
                                        </Badge>
                                      </div>
                                    </div>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="shrink-0 h-8 w-8"
                                      onClick={() => addRecommendedItemMutation.mutate(rec)}
                                      disabled={addRecommendedItemMutation.isPending}
                                      data-testid={`button-add-recommendation-${idx}`}
                                    >
                                      <Plus className="w-4 h-4 text-primary" />
                                    </Button>
                                  </div>
                                  
                                  <p className="text-xs text-muted-foreground">{rec.reasoning}</p>
                                  
                                  {rec.coachingTip && (
                                    <div className="flex items-start gap-2 p-2 rounded-md bg-blue-500/10 text-xs">
                                      <Lightbulb className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                                      <span className="text-blue-700 dark:text-blue-400">{rec.coachingTip}</span>
                                    </div>
                                  )}

                                  {rec.proofSources?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 pt-1">
                                      {rec.proofSources.map((source: any, sIdx: number) => (
                                        <Badge key={sIdx} variant="outline" className="text-xs">
                                          <Shield className="w-3 h-3 mr-1" />
                                          {source.title}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}

                          <div className="pt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => getRecommendationsMutation.mutate()}
                              disabled={getRecommendationsMutation.isPending}
                              data-testid="button-refresh-recommendations"
                            >
                              {getRecommendationsMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Sparkles className="w-4 h-4 mr-2" />
                              )}
                              Refresh Recommendations
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>

    <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Evidence Pack</DialogTitle>
          <DialogDescription>
            Share this link with your buyer to give them access to the verified evidence pack.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Input 
              value={shareUrl || ""} 
              readOnly 
              className="flex-1 bg-background"
              data-testid="input-share-url"
            />
            <Button
              size="sm"
              onClick={() => {
                if (shareUrl) {
                  navigator.clipboard.writeText(shareUrl);
                  toast({ title: "Link copied to clipboard" });
                }
              }}
              data-testid="button-copy-link"
            >
              Copy
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            This link will allow anyone with access to view the evidence pack, including all approved claims and supporting evidence.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowShareDialog(false)} data-testid="button-share-done">
            Done
          </Button>
          <Button onClick={() => window.open(shareUrl || "", "_blank")} data-testid="button-preview-share">
            <ExternalLink className="w-4 h-4 mr-1" />
            Preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
    <SourcePreviewDrawer
      item={previewItem}
      projectId={projectId}
      open={previewOpen}
      onOpenChange={setPreviewOpen}
    />
    </>
  );
}
