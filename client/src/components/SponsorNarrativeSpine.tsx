import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle2,
  RefreshCw,
  Clock,
  FileText,
  Quote,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SpineData {
  executiveSummary: string | null;
  problemStatement: string | null;
  approachSummary: string | null;
  keyOutcomes: string[];
  lessonsLearned: string | null;
  nextSteps: string | null;
  quotableExcerpts: string[];
  sponsorVoiceNotes: string | null;
}

interface NarrativeSpine {
  id: number;
  packId: number;
  projectId: number;
  version: number;
  spine: SpineData;
  aiGenerated: boolean;
  aiGeneratedAt: string | null;
  aiModel: string | null;
  aiConfidence: number | null;
  humanEditedAt: string | null;
  humanEditedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SponsorNarrativeSpineProps {
  packId: number;
  projectName?: string;
  readOnly?: boolean;
  onUpdate?: () => void;
}

const emptySpine: SpineData = {
  executiveSummary: null,
  problemStatement: null,
  approachSummary: null,
  keyOutcomes: [],
  lessonsLearned: null,
  nextSteps: null,
  quotableExcerpts: [],
  sponsorVoiceNotes: null,
};

export function SponsorNarrativeSpine({ 
  packId, 
  projectName,
  readOnly = false,
  onUpdate 
}: SponsorNarrativeSpineProps) {
  const [editedSpine, setEditedSpine] = useState<NarrativeSpine | null>(null);
  const [newOutcome, setNewOutcome] = useState("");
  const [newExcerpt, setNewExcerpt] = useState("");
  
  const { data: narrativeSpine, isLoading } = useQuery<NarrativeSpine | null>({
    queryKey: ["/api/evidence-packs", packId, "narrative-spine"],
  });
  
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", `/api/evidence-packs/${packId}/narrative-spine`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evidence-packs", packId, "narrative-spine"] });
      onUpdate?.();
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      return apiRequest("PATCH", `/api/narrative-spines/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evidence-packs", packId, "narrative-spine"] });
      setEditedSpine(null);
      onUpdate?.();
    },
  });
  
  const currentSpine = editedSpine || narrativeSpine;
  const spineData = currentSpine?.spine || emptySpine;
  
  const handleSpineUpdate = (key: keyof SpineData, value: any) => {
    if (!currentSpine) {
      createMutation.mutate({
        spine: { ...emptySpine, [key]: value },
        aiGenerated: false,
      });
      return;
    }
    
    const updatedSpineData = { ...spineData, [key]: value };
    
    if (editedSpine) {
      setEditedSpine({ ...editedSpine, spine: updatedSpineData });
    } else {
      setEditedSpine({ ...currentSpine, spine: updatedSpineData });
    }
  };
  
  const handleAddOutcome = () => {
    if (!newOutcome.trim()) return;
    
    const updatedOutcomes = [...(spineData.keyOutcomes || []), newOutcome.trim()];
    handleSpineUpdate("keyOutcomes", updatedOutcomes);
    setNewOutcome("");
  };
  
  const handleRemoveOutcome = (index: number) => {
    const updatedOutcomes = spineData.keyOutcomes.filter((_, i) => i !== index);
    handleSpineUpdate("keyOutcomes", updatedOutcomes);
  };
  
  const handleAddExcerpt = () => {
    if (!newExcerpt.trim()) return;
    
    const updatedExcerpts = [...(spineData.quotableExcerpts || []), newExcerpt.trim()];
    handleSpineUpdate("quotableExcerpts", updatedExcerpts);
    setNewExcerpt("");
  };
  
  const handleRemoveExcerpt = (index: number) => {
    const updatedExcerpts = spineData.quotableExcerpts.filter((_, i) => i !== index);
    handleSpineUpdate("quotableExcerpts", updatedExcerpts);
  };
  
  const handleSave = () => {
    if (!editedSpine) return;
    updateMutation.mutate({
      id: editedSpine.id,
      spine: editedSpine.spine,
      humanEditedAt: new Date().toISOString(),
      humanEditedBy: "User",
    });
  };
  
  const handleCancel = () => {
    setEditedSpine(null);
    setNewOutcome("");
    setNewExcerpt("");
  };
  
  const handleInitializeSpine = () => {
    createMutation.mutate({
      spine: emptySpine,
      aiGenerated: false,
    });
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  const hasChanges = editedSpine !== null;
  const isAIGenerated = currentSpine?.aiGenerated;
  const aiConfidence = currentSpine?.aiConfidence;
  
  const hasContent = spineData.executiveSummary || 
    spineData.problemStatement || 
    spineData.approachSummary || 
    (spineData.keyOutcomes && spineData.keyOutcomes.length > 0);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Sponsor Narrative Spine
            </CardTitle>
            <CardDescription className="mt-1">
              {projectName ? `${projectName} - ` : ""}
              The reusable story structure that becomes any artifact
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isAIGenerated && (
              <Badge variant="outline" className="gap-1">
                <Sparkles className="h-3 w-3" />
                AI Generated
                {aiConfidence != null && ` (${Math.round(aiConfidence * 100)}%)`}
              </Badge>
            )}
            {currentSpine?.version && currentSpine.version > 1 && (
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                v{currentSpine.version}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!currentSpine && !hasContent ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              No narrative spine created yet. Start building your sponsor story.
            </p>
            {!readOnly && (
              <Button onClick={handleInitializeSpine} data-testid="button-initialize-spine">
                <FileText className="h-4 w-4 mr-2" />
                Start Narrative
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                Executive Summary
                <Badge variant="secondary" className="text-xs">Required</Badge>
              </Label>
              {readOnly ? (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm">{spineData.executiveSummary || "Not provided"}</p>
                </div>
              ) : (
                <Textarea
                  value={spineData.executiveSummary || ""}
                  onChange={(e) => handleSpineUpdate("executiveSummary", e.target.value)}
                  placeholder="A 2-3 sentence summary of the engagement and its impact..."
                  className="min-h-[80px] resize-none"
                  data-testid="textarea-executive-summary"
                />
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Problem Statement</Label>
              {readOnly ? (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm">{spineData.problemStatement || "Not provided"}</p>
                </div>
              ) : (
                <Textarea
                  value={spineData.problemStatement || ""}
                  onChange={(e) => handleSpineUpdate("problemStatement", e.target.value)}
                  placeholder="What challenge or opportunity did the sponsor face?"
                  className="min-h-[80px] resize-none"
                  data-testid="textarea-problem-statement"
                />
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Approach Summary</Label>
              {readOnly ? (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm">{spineData.approachSummary || "Not provided"}</p>
                </div>
              ) : (
                <Textarea
                  value={spineData.approachSummary || ""}
                  onChange={(e) => handleSpineUpdate("approachSummary", e.target.value)}
                  placeholder="How did we approach the challenge? What levers did we apply?"
                  className="min-h-[80px] resize-none"
                  data-testid="textarea-approach-summary"
                />
              )}
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                Key Outcomes
                <Badge variant="secondary" className="text-xs">{spineData.keyOutcomes?.length || 0} items</Badge>
              </Label>
              
              <div className="space-y-2">
                {spineData.keyOutcomes?.map((outcome, index) => (
                  <div key={index} className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-sm flex-1">{outcome}</span>
                    {!readOnly && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => handleRemoveOutcome(index)}
                        data-testid={`button-remove-outcome-${index}`}
                      >
                        <span className="text-destructive">&times;</span>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              {!readOnly && (
                <div className="flex gap-2">
                  <Textarea
                    value={newOutcome}
                    onChange={(e) => setNewOutcome(e.target.value)}
                    placeholder="Add a key outcome..."
                    className="min-h-[60px] resize-none flex-1"
                    data-testid="textarea-new-outcome"
                  />
                  <Button
                    onClick={handleAddOutcome}
                    disabled={!newOutcome.trim()}
                    data-testid="button-add-outcome"
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Lessons Learned</Label>
              {readOnly ? (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm">{spineData.lessonsLearned || "Not provided"}</p>
                </div>
              ) : (
                <Textarea
                  value={spineData.lessonsLearned || ""}
                  onChange={(e) => handleSpineUpdate("lessonsLearned", e.target.value)}
                  placeholder="What did we learn? What would we do differently?"
                  className="min-h-[80px] resize-none"
                  data-testid="textarea-lessons-learned"
                />
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Next Steps
              </Label>
              {readOnly ? (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm">{spineData.nextSteps || "Not provided"}</p>
                </div>
              ) : (
                <Textarea
                  value={spineData.nextSteps || ""}
                  onChange={(e) => handleSpineUpdate("nextSteps", e.target.value)}
                  placeholder="What comes next? Future opportunities or recommendations?"
                  className="min-h-[80px] resize-none"
                  data-testid="textarea-next-steps"
                />
              )}
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Quote className="h-4 w-4" />
                Quotable Excerpts
                <Badge variant="secondary" className="text-xs">{spineData.quotableExcerpts?.length || 0} quotes</Badge>
              </Label>
              
              <div className="space-y-2">
                {spineData.quotableExcerpts?.map((excerpt, index) => (
                  <div key={index} className="border-l-4 border-l-primary/40 bg-muted/30 rounded-r-lg p-3">
                    <div className="flex items-start gap-2">
                      <Quote className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-sm italic flex-1">"{excerpt}"</span>
                      {!readOnly && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => handleRemoveExcerpt(index)}
                          data-testid={`button-remove-excerpt-${index}`}
                        >
                          <span className="text-destructive">&times;</span>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {!readOnly && (
                <div className="flex gap-2">
                  <Textarea
                    value={newExcerpt}
                    onChange={(e) => setNewExcerpt(e.target.value)}
                    placeholder="Add a quotable excerpt from sponsor conversations..."
                    className="min-h-[60px] resize-none flex-1"
                    data-testid="textarea-new-excerpt"
                  />
                  <Button
                    onClick={handleAddExcerpt}
                    disabled={!newExcerpt.trim()}
                    data-testid="button-add-excerpt"
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Sponsor Voice Notes</Label>
              <p className="text-xs text-muted-foreground">
                Capture the sponsor's own words, tone, and priorities for authentic storytelling
              </p>
              {readOnly ? (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm">{spineData.sponsorVoiceNotes || "Not provided"}</p>
                </div>
              ) : (
                <Textarea
                  value={spineData.sponsorVoiceNotes || ""}
                  onChange={(e) => handleSpineUpdate("sponsorVoiceNotes", e.target.value)}
                  placeholder="Key phrases, concerns, and priorities expressed by the sponsor..."
                  className="min-h-[80px] resize-none"
                  data-testid="textarea-sponsor-voice"
                />
              )}
            </div>
          </>
        )}
      </CardContent>
      
      {hasChanges && !readOnly && (
        <CardFooter className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel} data-testid="button-cancel-changes">
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updateMutation.isPending}
            data-testid="button-save-changes"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
