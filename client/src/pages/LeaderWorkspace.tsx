import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Eye, 
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Filter,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import type { EvidencePack } from "@shared/schema";

interface DashboardData {
  summary: {
    totalPacks: number;
    pendingReview: number;
    inReview: number;
    approved: number;
    rejected: number;
    shared: number;
    avgQualityScore: number | null;
    packsNeedingAttention: any[];
  };
  recentPacks: Array<EvidencePack & {
    projectName: string;
    itemCount: number;
    approvedItems: number;
    flaggedItems: number;
  }>;
}

const statusConfig = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: Package },
  pending_review: { label: "Pending Review", color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400", icon: Clock },
  in_review: { label: "In Review", color: "bg-blue-500/20 text-blue-700 dark:text-blue-400", icon: Eye },
  approved: { label: "Approved", color: "bg-green-500/20 text-green-700 dark:text-green-400", icon: CheckCircle2 },
  rejected: { label: "Needs Work", color: "bg-red-500/20 text-red-700 dark:text-red-400", icon: AlertCircle },
  shared: { label: "Shared", color: "bg-purple-500/20 text-purple-700 dark:text-purple-400", icon: ExternalLink },
};

function getQualityColor(score: number | null): string {
  if (score === null) return "bg-muted";
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

function getQualityLabel(score: number | null): string {
  if (score === null) return "Not scored";
  if (score >= 80) return "Strong";
  if (score >= 60) return "Moderate";
  return "Needs Work";
}

export default function LeaderWorkspace() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [qualityFilter, setQualityFilter] = useState<string>("all");

  const { data, isLoading, refetch } = useQuery<DashboardData>({
    queryKey: ["/api/leader/dashboard"],
  });

  const summary = data?.summary;
  const recentPacks = data?.recentPacks || [];

  const filteredPacks = recentPacks.filter(pack => {
    if (statusFilter !== "all" && pack.status !== statusFilter) return false;
    if (qualityFilter === "high" && (pack.qualityScore === null || pack.qualityScore < 80)) return false;
    if (qualityFilter === "medium" && (pack.qualityScore === null || pack.qualityScore < 60 || pack.qualityScore >= 80)) return false;
    if (qualityFilter === "low" && (pack.qualityScore !== null && pack.qualityScore >= 60)) return false;
    return true;
  });

  const needsAttentionPacks = recentPacks.filter(pack => 
    pack.status === "pending_review" || 
    (pack.qualityScore !== null && pack.qualityScore < 60)
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Leader Workspace</h1>
                <p className="text-sm text-muted-foreground">Evidence Pack Portfolio Review</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="link-home">
                  Back to Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
            </div>
            <Skeleton className="h-64" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
              <Card data-testid="stat-pending-review">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{summary?.pendingReview || 0}</p>
                      <p className="text-xs text-muted-foreground">Pending Review</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="stat-in-review">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Eye className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{summary?.inReview || 0}</p>
                      <p className="text-xs text-muted-foreground">In Review</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="stat-approved">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{summary?.approved || 0}</p>
                      <p className="text-xs text-muted-foreground">Approved</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="stat-rejected">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{summary?.rejected || 0}</p>
                      <p className="text-xs text-muted-foreground">Needs Work</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="stat-shared">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <ExternalLink className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{summary?.shared || 0}</p>
                      <p className="text-xs text-muted-foreground">Shared</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="stat-quality">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {summary?.avgQualityScore != null ? `${summary.avgQualityScore}%` : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">Avg Quality</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {needsAttentionPacks.length > 0 && (
              <Card className="border-orange-500/30 bg-orange-500/5" data-testid="card-attention-needed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Needs Your Attention ({needsAttentionPacks.length})
                  </CardTitle>
                  <CardDescription>
                    Packs pending review or with low quality scores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {needsAttentionPacks.slice(0, 5).map(pack => (
                      <Link key={pack.id} href={`/leader/review/${pack.id}`}>
                        <Card className="min-w-[200px] hover-elevate cursor-pointer">
                          <CardContent className="p-3">
                            <p className="font-medium text-sm truncate">{pack.projectName || pack.title}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={statusConfig[pack.status as keyof typeof statusConfig]?.color || ""} >
                                {statusConfig[pack.status as keyof typeof statusConfig]?.label}
                              </Badge>
                              {pack.qualityScore != null && pack.qualityScore < 60 && (
                                <Badge variant="outline" className="text-orange-600 border-orange-500/30">
                                  {pack.qualityScore}%
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="all" className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <TabsList>
                  <TabsTrigger value="all" data-testid="tab-all-packs">
                    All Packs ({summary?.totalPacks || 0})
                  </TabsTrigger>
                  <TabsTrigger value="review" data-testid="tab-review-packs">
                    Needs Review ({(summary?.pendingReview || 0) + (summary?.inReview || 0)})
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2 ml-auto">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]" data-testid="filter-status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending_review">Pending Review</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="shared">Shared</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={qualityFilter} onValueChange={setQualityFilter}>
                    <SelectTrigger className="w-[140px]" data-testid="filter-quality">
                      <SelectValue placeholder="Quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Quality</SelectItem>
                      <SelectItem value="high">High (80+)</SelectItem>
                      <SelectItem value="medium">Medium (60-79)</SelectItem>
                      <SelectItem value="low">Low (&lt;60)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TabsContent value="all" className="mt-4">
                <ScrollArea className="h-[calc(100vh-480px)]">
                  <div className="space-y-3 pr-4">
                    {filteredPacks.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                          <p className="text-muted-foreground">No evidence packs match your filters</p>
                        </CardContent>
                      </Card>
                    ) : (
                      filteredPacks.map(pack => {
                        const StatusIcon = statusConfig[pack.status as keyof typeof statusConfig]?.icon || Package;
                        return (
                          <Card key={pack.id} className="hover-elevate" data-testid={`card-pack-${pack.id}`}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${getQualityColor(pack.qualityScore)}/20`}>
                                  <Package className={`h-6 w-6 ${getQualityColor(pack.qualityScore).replace('bg-', 'text-').replace('/20', '')}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <h3 className="font-medium">{pack.projectName || pack.title}</h3>
                                      <p className="text-sm text-muted-foreground">{pack.title}</p>
                                    </div>
                                    <Badge className={statusConfig[pack.status as keyof typeof statusConfig]?.color || ""}>
                                      <StatusIcon className="w-3 h-3 mr-1" />
                                      {statusConfig[pack.status as keyof typeof statusConfig]?.label}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 mt-3">
                                    <div className="flex items-center gap-1.5 text-sm">
                                      <Package className="w-4 h-4 text-muted-foreground" />
                                      <span>{pack.itemCount} items</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm">
                                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                                      <span>{pack.approvedItems} approved</span>
                                    </div>
                                    {pack.flaggedItems > 0 && (
                                      <div className="flex items-center gap-1.5 text-sm text-orange-600">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{pack.flaggedItems} flagged</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1.5 text-sm ml-auto">
                                      {pack.qualityScore != null ? (
                                        <>
                                          <Progress 
                                            value={pack.qualityScore} 
                                            className={`w-16 h-2 ${pack.qualityScore >= 80 ? '[&>div]:bg-green-500' : pack.qualityScore >= 60 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'}`}
                                          />
                                          <span className="text-muted-foreground">{pack.qualityScore}%</span>
                                        </>
                                      ) : (
                                        <span className="text-muted-foreground text-xs">Not scored</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <Link href={`/leader/review/${pack.id}`}>
                                  <Button size="sm" data-testid={`button-review-${pack.id}`}>
                                    Review
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                  </Button>
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="review" className="mt-4">
                <ScrollArea className="h-[calc(100vh-480px)]">
                  <div className="space-y-3 pr-4">
                    {recentPacks.filter(p => p.status === "pending_review" || p.status === "in_review").length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500/30" />
                          <p className="text-muted-foreground">No packs waiting for review</p>
                        </CardContent>
                      </Card>
                    ) : (
                      recentPacks.filter(p => p.status === "pending_review" || p.status === "in_review").map(pack => {
                        const StatusIcon = statusConfig[pack.status as keyof typeof statusConfig]?.icon || Package;
                        return (
                          <Card key={pack.id} className="hover-elevate border-l-4 border-l-yellow-500" data-testid={`card-review-pack-${pack.id}`}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                                  <StatusIcon className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <h3 className="font-medium">{pack.projectName || pack.title}</h3>
                                      <p className="text-sm text-muted-foreground">
                                        {pack.ownerName ? `Submitted by ${pack.ownerName}` : pack.title}
                                      </p>
                                    </div>
                                    <Badge className={statusConfig[pack.status as keyof typeof statusConfig]?.color || ""}>
                                      {statusConfig[pack.status as keyof typeof statusConfig]?.label}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 mt-3 text-sm">
                                    <span>{pack.itemCount} items to review</span>
                                    {pack.submittedAt && (
                                      <span className="text-muted-foreground">
                                        Submitted {new Date(pack.submittedAt).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Link href={`/leader/review/${pack.id}`}>
                                  <Button data-testid={`button-start-review-${pack.id}`}>
                                    Start Review
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                  </Button>
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
