import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowLeft,
  FileText,
  Target,
  TrendingUp,
  Award,
  Lightbulb,
  Shield,
  MessageSquare,
  Send,
  Check,
  AlertTriangle,
  Loader2,
  Sparkles,
  ExternalLink,
  Download
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { EvidencePack, EvidencePackItem, EvidencePackComment } from "@shared/schema";

const itemTypeIcons: Record<string, any> = {
  discovery_insight: Lightbulb,
  outcome: Target,
  success_story: Award,
  benchmark: TrendingUp,
  proof_point: Shield,
  testimonial: MessageSquare,
  data: TrendingUp,
  claim: FileText,
  insight: Lightbulb,
  artifact: Package,
};

const valuePillarColors: Record<string, string> = {
  "Accelerate": "bg-blue-500/20 text-blue-700 dark:text-blue-400",
  "Expand": "bg-green-500/20 text-green-700 dark:text-green-400",
  "Assure": "bg-purple-500/20 text-purple-700 dark:text-purple-400",
  "Adapt": "bg-orange-500/20 text-orange-700 dark:text-orange-400",
  "grow": "bg-green-500/20 text-green-700 dark:text-green-400",
  "optimise": "bg-blue-500/20 text-blue-700 dark:text-blue-400",
  "derisk": "bg-orange-500/20 text-orange-700 dark:text-orange-400",
  "strengthen": "bg-purple-500/20 text-purple-700 dark:text-purple-400",
};

const itemStatusConfig = {
  pending: { label: "Pending", color: "bg-muted text-muted-foreground" },
  approved: { label: "Approved", color: "bg-green-500/20 text-green-700 dark:text-green-400" },
  flagged: { label: "Flagged", color: "bg-orange-500/20 text-orange-700 dark:text-orange-400" },
  rejected: { label: "Rejected", color: "bg-red-500/20 text-red-700 dark:text-red-400" },
  needs_evidence: { label: "Needs Evidence", color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" },
};

export default function LeaderPackReview() {
  const params = useParams<{ id: string }>();
  const packId = parseInt(params.id || "0");
  const { toast } = useToast();
  
  const [selectedItem, setSelectedItem] = useState<EvidencePackItem | null>(null);
  const [comment, setComment] = useState("");
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [packComment, setPackComment] = useState("");

  const { data: pack, isLoading: packLoading } = useQuery<EvidencePack>({
    queryKey: ["/api/evidence-packs", packId],
    enabled: packId > 0,
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery<EvidencePackItem[]>({
    queryKey: ["/api/evidence-packs", packId, "items"],
    enabled: packId > 0,
  });

  const { data: comments = [] } = useQuery<EvidencePackComment[]>({
    queryKey: ["/api/evidence-packs", packId, "comments"],
    enabled: packId > 0,
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, status, reviewerComment }: { itemId: number; status: string; reviewerComment?: string }) => {
      return apiRequest("PATCH", `/api/evidence-packs/${packId}/items/${itemId}`, { itemStatus: status, reviewerComment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evidence-packs", packId, "items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/evidence-packs", packId] });
      setSelectedItem(null);
      setComment("");
      toast({ title: "Item updated" });
    },
    onError: () => {
      toast({ title: "Failed to update item", variant: "destructive" });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ itemId, content }: { itemId?: number; content: string }) => {
      return apiRequest("POST", `/api/evidence-packs/${packId}/comments`, { 
        itemId, 
        content,
        authorId: "leader",
        authorName: "Leader",
        commentType: itemId ? "item_feedback" : "general"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evidence-packs", packId, "comments"] });
      toast({ title: "Comment added" });
    },
  });

  const updatePackStatusMutation = useMutation({
    mutationFn: async ({ status, leaderComment }: { status: string; leaderComment?: string }) => {
      const endpoint = status === "approved" 
        ? `/api/evidence-packs/${packId}/approve`
        : status === "rejected"
        ? `/api/evidence-packs/${packId}/reject`
        : `/api/evidence-packs/${packId}/status`;
      
      return apiRequest("POST", endpoint, { status, leaderComment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evidence-packs", packId] });
      queryClient.invalidateQueries({ queryKey: ["/api/leader/dashboard"] });
      setShowApproveDialog(false);
      setShowRejectDialog(false);
      setPackComment("");
      toast({ title: "Pack status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update pack status", variant: "destructive" });
    },
  });

  const startReviewMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/evidence-packs/${packId}/start-review`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evidence-packs", packId] });
    },
  });

  const isLoading = packLoading || itemsLoading;

  const approvedCount = items.filter(i => i.itemStatus === "approved").length;
  const flaggedCount = items.filter(i => i.itemStatus === "flagged" || i.itemStatus === "rejected" || i.itemStatus === "needs_evidence").length;
  const pendingCount = items.filter(i => i.itemStatus === "pending").length;
  const reviewProgress = items.length > 0 ? Math.round(((items.length - pendingCount) / items.length) * 100) : 0;

  const groupedItems = items.reduce((acc, item) => {
    const section = item.section || "General";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, EvidencePackItem[]>);

  if (packId === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Invalid pack ID</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/leader">
                <Button variant="ghost" size="icon" data-testid="button-back">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">{pack?.title || "Pack Review"}</h1>
                <p className="text-sm text-muted-foreground">
                  {pack?.ownerName ? `By ${pack.ownerName}` : "Evidence Pack Review"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {pack?.status === "pending_review" && (
                <Button
                  variant="outline"
                  onClick={() => startReviewMutation.mutate()}
                  disabled={startReviewMutation.isPending}
                  data-testid="button-start-review"
                >
                  {startReviewMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Start Review
                </Button>
              )}
              {pack?.status === "in_review" && (
                <>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-500/30"
                    onClick={() => setShowRejectDialog(true)}
                    data-testid="button-reject-pack"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Request Changes
                  </Button>
                  <Button
                    onClick={() => setShowApproveDialog(true)}
                    disabled={pendingCount > 0}
                    data-testid="button-approve-pack"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Approve Pack
                  </Button>
                </>
              )}
              {(pack?.status === "approved" || pack?.status === "shared") && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => window.open(`/api/evidence-packs/${packId}/export/pdf`, '_blank')}
                    data-testid="button-export-pdf"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Export PDF
                  </Button>
                  <Badge className="bg-green-500/20 text-green-700">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {pack.status === "shared" ? "Shared" : "Approved"}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-64" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Review Progress</CardTitle>
                    <span className="text-sm text-muted-foreground">{reviewProgress}% reviewed</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={reviewProgress} className="h-2" />
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span>{approvedCount} approved</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      <span>{flaggedCount} flagged</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-muted" />
                      <span>{pendingCount} pending</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <ScrollArea className="h-[calc(100vh-320px)]">
                <div className="space-y-6 pr-4">
                  {Object.entries(groupedItems).map(([section, sectionItems]) => (
                    <div key={section} className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        {section}
                      </h3>
                      {sectionItems.map((item) => {
                        const ItemIcon = itemTypeIcons[item.itemType as keyof typeof itemTypeIcons] || FileText;
                        const statusConfig = itemStatusConfig[item.itemStatus as keyof typeof itemStatusConfig] || itemStatusConfig.pending;
                        const itemComments = comments.filter(c => c.itemId === item.id);

                        return (
                          <Card
                            key={item.id}
                            className={`hover-elevate cursor-pointer ${
                              selectedItem?.id === item.id ? "ring-2 ring-primary" : ""
                            } ${
                              item.itemStatus === "approved" ? "border-green-500/30" :
                              item.itemStatus === "flagged" || item.itemStatus === "rejected" ? "border-orange-500/30" :
                              item.itemStatus === "needs_evidence" ? "border-yellow-500/30" : ""
                            }`}
                            onClick={() => setSelectedItem(item)}
                            data-testid={`card-item-${item.id}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                  item.itemStatus === "approved" ? "bg-green-500/20" :
                                  item.itemStatus === "flagged" || item.itemStatus === "rejected" ? "bg-orange-500/20" :
                                  "bg-muted"
                                }`}>
                                  <ItemIcon className={`h-5 w-5 ${
                                    item.itemStatus === "approved" ? "text-green-600" :
                                    item.itemStatus === "flagged" || item.itemStatus === "rejected" ? "text-orange-600" :
                                    "text-muted-foreground"
                                  }`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium">{item.claim}</p>
                                  <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <Badge variant="outline" className="text-xs">
                                      {item.itemType.replace('_', ' ')}
                                    </Badge>
                                    {item.valuePillar && (
                                      <Badge className={`text-xs ${valuePillarColors[item.valuePillar as keyof typeof valuePillarColors]}`}>
                                        {item.valuePillar}
                                      </Badge>
                                    )}
                                    <Badge className={`text-xs ${statusConfig.color}`}>
                                      {statusConfig.label}
                                    </Badge>
                                    {item.aiGenerated && (
                                      <Badge variant="secondary" className="text-xs">
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        AI
                                      </Badge>
                                    )}
                                  </div>

                                  {item.proofSources && (item.proofSources as any[]).length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {(item.proofSources as any[]).slice(0, 3).map((source, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                          <Shield className="w-3 h-3 mr-1" />
                                          {source.title}
                                        </Badge>
                                      ))}
                                      {(item.proofSources as any[]).length > 3 && (
                                        <Badge variant="outline" className="text-xs">
                                          +{(item.proofSources as any[]).length - 3} more
                                        </Badge>
                                      )}
                                    </div>
                                  )}

                                  {itemComments.length > 0 && (
                                    <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                                      <MessageSquare className="w-3 h-3" />
                                      {itemComments.length} comment{itemComments.length > 1 ? "s" : ""}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-4">
              <Card className="sticky top-24">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Item Review</CardTitle>
                  <CardDescription>
                    {selectedItem ? "Review and provide feedback" : "Select an item to review"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedItem ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium">{selectedItem.claim}</p>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">
                          {selectedItem.itemType.replace('_', ' ')}
                        </p>
                      </div>

                      {selectedItem.proofSources && (selectedItem.proofSources as any[]).length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            Proof Sources
                          </h4>
                          <div className="space-y-2">
                            {(selectedItem.proofSources as any[]).map((source, idx) => (
                              <div key={idx} className="p-2 border rounded-md text-sm">
                                <div className="flex items-center gap-2">
                                  <Shield className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-medium">{source.title}</span>
                                </div>
                                {source.url && (
                                  <a href={source.url} target="_blank" rel="noopener noreferrer" 
                                     className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                                    <ExternalLink className="w-3 h-3" />
                                    View source
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedItem.coachingTip && (
                        <div className="p-2 bg-blue-500/10 rounded-md">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5" />
                            <p className="text-xs text-blue-700 dark:text-blue-400">{selectedItem.coachingTip}</p>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Feedback (optional)
                        </label>
                        <Textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Add feedback for the seller..."
                          className="mt-2"
                          rows={3}
                          data-testid="input-item-comment"
                        />
                      </div>

                      {pack?.status === "in_review" && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-red-600 border-red-500/30"
                            onClick={() => updateItemMutation.mutate({ 
                              itemId: selectedItem.id, 
                              status: "flagged",
                              reviewerComment: comment || undefined
                            })}
                            disabled={updateItemMutation.isPending}
                            data-testid="button-flag-item"
                          >
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Flag
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => updateItemMutation.mutate({ 
                              itemId: selectedItem.id, 
                              status: "approved",
                              reviewerComment: comment || undefined
                            })}
                            disabled={updateItemMutation.isPending}
                            data-testid="button-approve-item"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      )}

                      {comment && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            addCommentMutation.mutate({ itemId: selectedItem.id, content: comment });
                            setComment("");
                          }}
                          disabled={addCommentMutation.isPending}
                          data-testid="button-add-comment"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Add Comment Only
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">Click on an item to review it</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Pack Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Items</span>
                    <span className="font-medium">{items.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quality Score</span>
                    <span className="font-medium">
                      {pack?.qualityScore != null ? `${pack.qualityScore}%` : "—"}
                    </span>
                  </div>
                  {pack?.updatedAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span className="font-medium">
                        {new Date(pack.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Evidence Pack</DialogTitle>
            <DialogDescription>
              Approving this pack will allow the seller to share it with the buyer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={packComment}
              onChange={(e) => setPackComment(e.target.value)}
              placeholder="Add an approval note (optional)..."
              rows={3}
              data-testid="input-approval-note"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => updatePackStatusMutation.mutate({ status: "approved", leaderComment: packComment })}
              disabled={updatePackStatusMutation.isPending}
              data-testid="button-confirm-approve"
            >
              {updatePackStatusMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Approve Pack
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Send this pack back to the seller with feedback for improvements.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={packComment}
              onChange={(e) => setPackComment(e.target.value)}
              placeholder="Explain what changes are needed..."
              rows={4}
              data-testid="input-rejection-note"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => updatePackStatusMutation.mutate({ status: "rejected", leaderComment: packComment })}
              disabled={updatePackStatusMutation.isPending || !packComment.trim()}
              data-testid="button-confirm-reject"
            >
              {updatePackStatusMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Request Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
