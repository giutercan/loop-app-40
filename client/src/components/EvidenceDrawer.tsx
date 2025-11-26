import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Award, 
  ExternalLink, 
  Building, 
  Sparkles, 
  Loader2, 
  Search,
  Filter,
  BookOpen,
  TrendingUp,
  CheckCircle2
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SuccessStory } from "@shared/schema";

interface EvidenceDrawerProps {
  projectId: number;
  trigger?: React.ReactNode;
  selectedPillar?: string;
  selectedKPIs?: string[];
}

export function EvidenceDrawer({ 
  projectId, 
  trigger,
  selectedPillar,
  selectedKPIs = []
}: EvidenceDrawerProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSolutionArea, setFilterSolutionArea] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const { data: stories = [], isLoading } = useQuery<SuccessStory[]>({
    queryKey: [`/api/projects/${projectId}/success-stories`],
    enabled: !!projectId && open,
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/projects/${projectId}/success-stories/generate`, {});
    },
    onSuccess: async (data: any) => {
      await queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${projectId}/success-stories`],
        refetchType: 'active'
      });
      toast({ 
        title: `${data.count} success stories generated`,
        description: "AI recommendations added to your evidence library"
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to generate success stories", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const solutionAreas = Array.from(new Set(stories.map(s => s.solutionArea).filter(Boolean)));

  const filteredStories = stories.filter(story => {
    const matchesSearch = !searchQuery || 
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.relevanceReason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.capabilityName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = !filterSolutionArea || story.solutionArea === filterSolutionArea;
    
    return matchesSearch && matchesFilter;
  });

  const contextualStories = filteredStories.filter(story => {
    if (!selectedPillar && selectedKPIs.length === 0) return true;
    
    const matchesPillar = !selectedPillar || 
      story.solutionArea?.toLowerCase().includes(selectedPillar.toLowerCase()) ||
      story.capabilityName?.toLowerCase().includes(selectedPillar.toLowerCase());
    
    const matchesKPI = selectedKPIs.length === 0 || 
      selectedKPIs.some(kpi => 
        story.relevanceReason?.toLowerCase().includes(kpi.toLowerCase()) ||
        story.title.toLowerCase().includes(kpi.toLowerCase())
      );
    
    return matchesPillar || matchesKPI;
  });

  const otherStories = filteredStories.filter(story => !contextualStories.includes(story));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" data-testid="button-open-evidence">
            <BookOpen className="w-4 h-4 mr-2" />
            Evidence Library
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl" data-testid="drawer-evidence">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Evidence Library
          </SheetTitle>
          <SheetDescription>
            Korn Ferry success stories and case studies to support your value cases
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search success stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-evidence"
              />
            </div>
            <Button 
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              size="sm"
              data-testid="button-generate-evidence"
            >
              {generateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </Button>
          </div>

          {solutionAreas.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <Badge
                variant={filterSolutionArea === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setFilterSolutionArea(null)}
                data-testid="filter-all"
              >
                All
              </Badge>
              {solutionAreas.map((area) => (
                <Badge
                  key={area}
                  variant={filterSolutionArea === area ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilterSolutionArea(area === filterSolutionArea ? null : area)}
                  data-testid={`filter-${area}`}
                >
                  {area}
                </Badge>
              ))}
            </div>
          )}

          <ScrollArea className="h-[calc(100vh-280px)]">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : stories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">No Evidence Yet</h3>
                <p className="text-sm text-muted-foreground text-center max-w-xs mb-4">
                  Generate relevant case studies based on your project context
                </p>
                <Button 
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending}
                  data-testid="button-generate-first-evidence"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Evidence
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="contextual" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="contextual" className="text-xs">
                    Relevant ({contextualStories.length})
                  </TabsTrigger>
                  <TabsTrigger value="all" className="text-xs">
                    All Stories ({filteredStories.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="contextual" className="space-y-3 mt-0">
                  {contextualStories.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No stories match your current context</p>
                      <p className="text-xs mt-1">Try generating more or viewing all stories</p>
                    </div>
                  ) : (
                    contextualStories.map((story) => (
                      <StoryCard key={story.id} story={story} isContextual />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="all" className="space-y-3 mt-0">
                  {filteredStories.map((story) => (
                    <StoryCard 
                      key={story.id} 
                      story={story} 
                      isContextual={contextualStories.includes(story)} 
                    />
                  ))}
                </TabsContent>
              </Tabs>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function StoryCard({ story, isContextual }: { story: SuccessStory; isContextual?: boolean }) {
  return (
    <Card 
      className={`hover-elevate transition-all ${isContextual ? 'border-primary/30 bg-primary/5' : ''}`}
      data-testid={`card-evidence-${story.id}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium leading-tight">
            {story.title}
          </CardTitle>
          {isContextual && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Relevant
            </Badge>
          )}
        </div>
        <CardDescription className="flex flex-wrap items-center gap-2 text-xs">
          {story.industry && (
            <span className="flex items-center gap-1">
              <Building className="w-3 h-3" />
              {story.industry}
            </span>
          )}
          {story.solutionArea && (
            <Badge variant="outline" className="text-xs py-0">
              {story.solutionArea}
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {story.relevanceReason && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {story.relevanceReason}
          </p>
        )}
        {story.excerpt && (
          <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
            <TrendingUp className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs">{story.excerpt}</p>
          </div>
        )}
        <div className="flex items-center justify-between pt-1">
          {story.capabilityName && (
            <Badge variant="secondary" className="text-xs">
              {story.capabilityName}
            </Badge>
          )}
          <a
            href={story.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs text-primary hover:underline ml-auto"
            data-testid={`link-evidence-${story.id}`}
          >
            View Case Study
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
