import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  TrendingUp,
  Award,
  Target,
  Lightbulb,
  Shield,
  MessageSquare,
  Sparkles,
  Building2,
  ExternalLink,
  Lock
} from "lucide-react";
import type { EvidencePack, EvidencePackItem } from "@shared/schema";

interface SharedPackData {
  pack: EvidencePack;
  items: EvidencePackItem[];
  project?: {
    companyName: string;
    industry?: string;
  };
}

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

export default function SharedEvidencePack() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const { data, isLoading, error } = useQuery<SharedPackData>({
    queryKey: ["/api/evidence-pack/share", token],
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-12 w-48 mb-4" />
          <Skeleton className="h-8 w-64 mb-8" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-xl font-bold mb-2">Evidence Pack Not Found</h1>
            <p className="text-muted-foreground">
              This link may be invalid or the evidence pack may no longer be available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { pack, items: allItems, project } = data;
  
  const items = allItems.filter(i => i.itemStatus === "approved");
  const approvedItems = items;
  const qualityScore = pack.qualityScore;

  const groupedItems = items.reduce((acc, item) => {
    const section = item.section || "Evidence";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, EvidencePackItem[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Evidence Pack</h1>
                <p className="text-sm text-muted-foreground">Korn Ferry Loop</p>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-700 dark:text-green-400" data-testid="badge-verified">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Card data-testid="card-pack-summary">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl" data-testid="text-pack-title">{pack.title}</CardTitle>
                  {project && (
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Building2 className="w-4 h-4" />
                      {project.companyName}
                      {project.industry && ` • ${project.industry}`}
                    </CardDescription>
                  )}
                </div>
                {qualityScore != null && (
                  <div className="text-center">
                    <div className={`h-14 w-14 rounded-full flex items-center justify-center ${
                      qualityScore >= 80 ? 'bg-green-500/20' : 
                      qualityScore >= 60 ? 'bg-yellow-500/20' : 'bg-red-500/20'
                    }`}>
                      <span className={`text-lg font-bold ${
                        qualityScore >= 80 ? 'text-green-600' : 
                        qualityScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {qualityScore}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Quality</p>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-muted/50" data-testid="stat-total-items">
                  <p className="text-2xl font-bold">{items.length}</p>
                  <p className="text-xs text-muted-foreground">Total Items</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10" data-testid="stat-verified-items">
                  <p className="text-2xl font-bold text-green-600">{approvedItems.length}</p>
                  <p className="text-xs text-muted-foreground">Verified</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10" data-testid="stat-categories">
                  <p className="text-2xl font-bold text-primary">
                    {Array.from(new Set(items.map(i => i.valuePillar).filter(Boolean))).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Categories</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <ScrollArea className="h-[calc(100vh-400px)]">
            <div className="space-y-6 pr-4">
              {Object.entries(groupedItems).map(([section, sectionItems]) => (
                <div key={section} className="space-y-3" data-testid={`section-${section.toLowerCase().replace(/\s+/g, '-')}`}>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2" data-testid={`text-section-header-${section.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Package className="w-4 h-4" />
                    {section}
                    <span className="text-xs font-normal">({sectionItems.length})</span>
                  </h2>

                  {sectionItems.map((item) => {
                    const ItemIcon = itemTypeIcons[item.itemType as keyof typeof itemTypeIcons] || FileText;
                    const isApproved = item.itemStatus === "approved";

                    return (
                      <Card 
                        key={item.id} 
                        className={isApproved ? "border-green-500/30" : ""}
                        data-testid={`card-shared-item-${item.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                              isApproved ? 'bg-green-500/20' : 'bg-muted'
                            }`}>
                              <ItemIcon className={`h-5 w-5 ${
                                isApproved ? 'text-green-600' : 'text-muted-foreground'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium" data-testid={`text-claim-${item.id}`}>{item.claim}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs capitalize">
                                  {item.itemType.replace('_', ' ')}
                                </Badge>
                                {item.valuePillar && (
                                  <Badge className={`text-xs ${valuePillarColors[item.valuePillar as keyof typeof valuePillarColors]}`}>
                                    {item.valuePillar}
                                  </Badge>
                                )}
                                {isApproved && (
                                  <Badge className="text-xs bg-green-500/20 text-green-700 dark:text-green-400">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                                {item.aiGenerated && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    AI-Assisted
                                  </Badge>
                                )}
                              </div>

                              {item.proofSources && (item.proofSources as any[]).length > 0 && (
                                <div className="mt-3">
                                  <p className="text-xs font-medium text-muted-foreground mb-2">
                                    Supporting Evidence:
                                  </p>
                                  <div className="space-y-2">
                                    {(item.proofSources as any[]).map((source, idx) => (
                                      <div key={idx} className="flex items-start gap-2 p-2 rounded-md bg-muted/50 text-sm">
                                        <Shield className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium">{source.title}</p>
                                          {source.type && (
                                            <p className="text-xs text-muted-foreground capitalize">{source.type}</p>
                                          )}
                                          {source.url && (
                                            <a 
                                              href={source.url} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                                              data-testid={`link-source-${item.id}-${idx}`}
                                            >
                                              <ExternalLink className="w-3 h-3" />
                                              View Source
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
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

          <Card className="bg-muted/30" data-testid="card-disclaimer">
            <CardContent className="p-4 text-center text-sm text-muted-foreground">
              <p>
                This evidence pack has been verified and approved by Korn Ferry. 
                For questions or additional information, please contact your Korn Ferry representative.
              </p>
              <p className="mt-2 text-xs">
                Generated on {new Date().toLocaleDateString()} • Powered by Korn Ferry Loop
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
