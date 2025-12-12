import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  File,
  Trash2,
  Loader2,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MessageSquare,
  PenLine,
  ChevronDown,
  ChevronUp,
  Users,
  Lightbulb,
  AlertTriangle,
  Target,
  Filter,
  List,
  LayoutGrid,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { format, formatDistanceToNow } from "date-fns";

interface InteractionArtifact {
  id: number;
  projectId: number;
  artifactType: string;
  meetingContext: string;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  objectStorageKey: string | null;
  title: string | null;
  freeformNotes: string | null;
  extractedText: string | null;
  meetingDate: string | null;
  meetingType: string | null;
  attendees: string[] | null;
  aiProcessingStatus: string;
  aiExtractedInsights: any;
  aiSummary: string | null;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ArtifactLibraryProps {
  projectId: number;
  companyName?: string;
}

export function ArtifactLibrary({ projectId, companyName }: ArtifactLibraryProps) {
  const { toast } = useToast();
  const [contextFilter, setContextFilter] = useState<"all" | "pre_meeting" | "post_meeting">("all");
  const [viewMode, setViewMode] = useState<"timeline" | "grid">("timeline");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedArtifact, setExpandedArtifact] = useState<number | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<InteractionArtifact | null>(null);

  const { data: artifacts = [], isLoading } = useQuery<InteractionArtifact[]>({
    queryKey: ["/api/projects", projectId, "interaction-artifacts"],
  });

  const processArtifactMutation = useMutation({
    mutationFn: async (artifactId: number) => {
      return apiRequest("POST", `/api/interaction-artifacts/${artifactId}/process`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "interaction-artifacts"] });
      toast({ title: "AI processing complete", description: "Insights have been extracted from your document." });
    },
    onError: (error: any) => {
      toast({ title: "Processing failed", description: error.message, variant: "destructive" });
    }
  });

  const deleteArtifactMutation = useMutation({
    mutationFn: async (artifactId: number) => {
      return apiRequest("DELETE", `/api/interaction-artifacts/${artifactId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "interaction-artifacts"] });
      toast({ title: "Deleted", description: "The artifact has been removed." });
      setSelectedArtifact(null);
    }
  });

  const filteredArtifacts = artifacts.filter(a => {
    if (contextFilter !== "all" && a.meetingContext !== contextFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        a.title?.toLowerCase().includes(query) ||
        a.fileName?.toLowerCase().includes(query) ||
        a.freeformNotes?.toLowerCase().includes(query) ||
        a.aiSummary?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const groupedByDate = filteredArtifacts.reduce((acc, artifact) => {
    const date = artifact.meetingDate 
      ? format(new Date(artifact.meetingDate), "yyyy-MM-dd")
      : format(new Date(artifact.createdAt), "yyyy-MM-dd");
    if (!acc[date]) acc[date] = [];
    acc[date].push(artifact);
    return acc;
  }, {} as Record<string, InteractionArtifact[]>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-3 h-3 text-emerald-600" />;
      case "processing": return <Loader2 className="w-3 h-3 animate-spin text-blue-600" />;
      case "pending": return <Clock className="w-3 h-3 text-amber-600" />;
      case "failed": return <AlertCircle className="w-3 h-3 text-red-600" />;
      default: return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "document": return <FileText className="w-4 h-4" />;
      case "transcript": return <MessageSquare className="w-4 h-4" />;
      case "notes": return <PenLine className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const getContextBadge = (context: string) => {
    if (context === "pre_meeting") {
      return <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-700 border-blue-500/30">Pre-Meeting</Badge>;
    }
    return <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 border-emerald-500/30">Post-Meeting</Badge>;
  };

  const preMeetingCount = artifacts.filter(a => a.meetingContext === "pre_meeting").length;
  const postMeetingCount = artifacts.filter(a => a.meetingContext === "post_meeting").length;

  return (
    <Card data-testid="artifact-library-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Meeting Artifact Library
            </CardTitle>
            <CardDescription>
              All documents, notes, and transcripts from {companyName || "this initiative"} interactions
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{artifacts.length} total</Badge>
            {preMeetingCount > 0 && (
              <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/30">
                {preMeetingCount} pre-meeting
              </Badge>
            )}
            {postMeetingCount > 0 && (
              <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30">
                {postMeetingCount} post-meeting
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search artifacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-artifacts"
            />
          </div>
          
          <Tabs value={contextFilter} onValueChange={(v) => setContextFilter(v as any)}>
            <TabsList className="h-9">
              <TabsTrigger value="all" className="text-xs" data-testid="tab-filter-all">
                All
              </TabsTrigger>
              <TabsTrigger value="pre_meeting" className="text-xs" data-testid="tab-filter-pre">
                <Target className="w-3 h-3 mr-1" />
                Pre-Meeting
              </TabsTrigger>
              <TabsTrigger value="post_meeting" className="text-xs" data-testid="tab-filter-post">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Post-Meeting
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex border rounded-md">
            <Button 
              variant={viewMode === "timeline" ? "secondary" : "ghost"} 
              size="sm" 
              className="h-9 px-2"
              onClick={() => setViewMode("timeline")}
              data-testid="button-view-timeline"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === "grid" ? "secondary" : "ghost"} 
              size="sm" 
              className="h-9 px-2"
              onClick={() => setViewMode("grid")}
              data-testid="button-view-grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredArtifacts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No artifacts found</p>
            <p className="text-xs mt-1">
              {searchQuery ? "Try adjusting your search" : "Upload documents or add notes in Green Sheet or Post-Meeting sections"}
            </p>
          </div>
        ) : viewMode === "timeline" ? (
          <ScrollArea className="max-h-[500px]">
            <div className="space-y-6">
              {sortedDates.map(date => (
                <div key={date} className="relative">
                  <div className="sticky top-0 bg-background z-10 py-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {format(new Date(date), "EEEE, MMMM d, yyyy")}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {groupedByDate[date].length} item{groupedByDate[date].length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="border-l-2 border-muted ml-2 pl-4 space-y-3 mt-2">
                    {groupedByDate[date].map(artifact => (
                      <div 
                        key={artifact.id}
                        className="relative cursor-pointer"
                        onClick={() => setSelectedArtifact(artifact)}
                        data-testid={`artifact-timeline-${artifact.id}`}
                      >
                        <div className="absolute -left-[22px] top-3 w-3 h-3 rounded-full bg-muted border-2 border-background" />
                        <div className="p-3 rounded-lg border bg-card hover-elevate">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                              {getTypeIcon(artifact.artifactType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-sm truncate">{artifact.title || artifact.fileName}</p>
                                {getContextBadge(artifact.meetingContext)}
                              </div>
                              {artifact.aiSummary && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{artifact.aiSummary}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                {artifact.meetingType && <span className="capitalize">{artifact.meetingType}</span>}
                                {artifact.fileSize && <span>{formatFileSize(artifact.fileSize)}</span>}
                                <span>{formatDistanceToNow(new Date(artifact.createdAt), { addSuffix: true })}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(artifact.aiProcessingStatus)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredArtifacts.map(artifact => (
              <div 
                key={artifact.id}
                className="p-3 rounded-lg border bg-card cursor-pointer hover-elevate"
                onClick={() => setSelectedArtifact(artifact)}
                data-testid={`artifact-grid-${artifact.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                    {getTypeIcon(artifact.artifactType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{artifact.title || artifact.fileName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getContextBadge(artifact.meetingContext)}
                      {getStatusIcon(artifact.aiProcessingStatus)}
                    </div>
                  </div>
                </div>
                {artifact.aiSummary && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{artifact.aiSummary}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={!!selectedArtifact} onOpenChange={() => setSelectedArtifact(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedArtifact && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getTypeIcon(selectedArtifact.artifactType)}
                  {selectedArtifact.title || selectedArtifact.fileName}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2 flex-wrap">
                  {getContextBadge(selectedArtifact.meetingContext)}
                  {selectedArtifact.meetingType && (
                    <Badge variant="secondary" className="text-xs capitalize">{selectedArtifact.meetingType}</Badge>
                  )}
                  {selectedArtifact.meetingDate && (
                    <span className="text-xs">{format(new Date(selectedArtifact.meetingDate), "MMM d, yyyy")}</span>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {selectedArtifact.freeformNotes && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Notes</h4>
                    <div className="p-3 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap">
                      {selectedArtifact.freeformNotes}
                    </div>
                  </div>
                )}

                {selectedArtifact.aiSummary && (
                  <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <div className="flex items-center gap-1 text-xs font-medium text-violet-700 mb-2">
                      <Sparkles className="w-3 h-3" />
                      AI Summary
                    </div>
                    <p className="text-sm">{selectedArtifact.aiSummary}</p>
                  </div>
                )}

                {selectedArtifact.aiExtractedInsights && (
                  <div className="space-y-3">
                    {selectedArtifact.aiExtractedInsights.insights?.length > 0 && (
                      <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                        <div className="flex items-center gap-1 text-xs font-medium text-blue-700 mb-2">
                          <Lightbulb className="w-3 h-3" />
                          Key Insights
                        </div>
                        <ul className="text-sm space-y-1.5">
                          {selectedArtifact.aiExtractedInsights.insights.map((insight: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-blue-600 mt-0.5">•</span>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedArtifact.aiExtractedInsights.actionItems?.length > 0 && (
                      <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                        <div className="flex items-center gap-1 text-xs font-medium text-emerald-700 mb-2">
                          <CheckCircle2 className="w-3 h-3" />
                          Action Items
                        </div>
                        <ul className="text-sm space-y-1.5">
                          {selectedArtifact.aiExtractedInsights.actionItems.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-emerald-600 mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedArtifact.aiExtractedInsights.risks?.length > 0 && (
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                        <div className="flex items-center gap-1 text-xs font-medium text-amber-700 mb-2">
                          <AlertTriangle className="w-3 h-3" />
                          Risks & Concerns
                        </div>
                        <ul className="text-sm space-y-1.5">
                          {selectedArtifact.aiExtractedInsights.risks.map((risk: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-amber-600 mt-0.5">•</span>
                              <span>{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedArtifact.aiExtractedInsights.opportunities?.length > 0 && (
                      <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                        <div className="flex items-center gap-1 text-xs font-medium text-green-700 mb-2">
                          <Target className="w-3 h-3" />
                          Opportunities
                        </div>
                        <ul className="text-sm space-y-1.5">
                          {selectedArtifact.aiExtractedInsights.opportunities.map((opp: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-green-600 mt-0.5">•</span>
                              <span>{opp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedArtifact.aiExtractedInsights.stakeholderMentions?.length > 0 && (
                      <div className="p-3 rounded-lg bg-muted">
                        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-2">
                          <Users className="w-3 h-3" />
                          Stakeholders Mentioned
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedArtifact.aiExtractedInsights.stakeholderMentions.map((name: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">{name}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedArtifact.aiProcessingStatus === "pending" && (
                  <div className="flex justify-center">
                    <Button 
                      onClick={() => processArtifactMutation.mutate(selectedArtifact.id)}
                      disabled={processArtifactMutation.isPending}
                      data-testid="button-process-artifact-dialog"
                    >
                      {processArtifactMutation.isPending ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                      ) : (
                        <><Sparkles className="w-4 h-4 mr-2" /> Analyze with AI</>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <DialogFooter className="flex justify-between gap-2">
                <Button 
                  variant="ghost" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => deleteArtifactMutation.mutate(selectedArtifact.id)}
                  data-testid="button-delete-artifact-dialog"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button variant="outline" onClick={() => setSelectedArtifact(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
