import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  MessageSquare,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Save,
  Sparkles,
  HelpCircle,
  Lightbulb
} from "lucide-react";

interface DiscoveryQuestion {
  id: number;
  projectId: number;
  capabilityName: string;
  question: string;
  questionType: "quantitative" | "qualitative" | "both";
  methodology: "MILLER_HEIMAN" | "SPIN" | "PSS" | null;
  methodologyStage: string | null;
  purpose: string;
  relatedKPI: string | null;
  followUpHint: string | null;
  answer: string | null;
  isAsked: boolean;
  notes: string | null;
  isTemplate: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface PostMeetingQuestionAnswersProps {
  projectId: number;
  companyName?: string;
}

const methodologyColors: Record<string, string> = {
  SPIN: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  MILLER_HEIMAN: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  PSS: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
};

export function PostMeetingQuestionAnswers({ projectId, companyName }: PostMeetingQuestionAnswersProps) {
  const { toast } = useToast();
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [localAnswers, setLocalAnswers] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});

  const { data: questions = [], isLoading } = useQuery<DiscoveryQuestion[]>({
    queryKey: ["/api/projects", projectId, "discovery-questions"],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/discovery-questions`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: projectId > 0
  });

  const askedQuestions = questions.filter(q => q.isAsked);

  useEffect(() => {
    const initial: Record<number, string> = {};
    askedQuestions.forEach(q => {
      if (q.answer) {
        initial[q.id] = q.answer;
      }
    });
    setLocalAnswers(prev => ({ ...initial, ...prev }));
  }, [questions]);

  const saveAnswerMutation = useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: number; answer: string }) => {
      const response = await apiRequest("PATCH", `/api/discovery-questions/${questionId}`, { answer });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "discovery-questions"] });
      setSaving(prev => ({ ...prev, [variables.questionId]: false }));
      toast({ title: "Answer Saved", description: "Your response has been captured for AI coaching" });
    },
    onError: (_, variables) => {
      setSaving(prev => ({ ...prev, [variables.questionId]: false }));
      toast({ title: "Error", description: "Failed to save answer", variant: "destructive" });
    }
  });

  const handleSaveAnswer = (questionId: number) => {
    const answer = localAnswers[questionId];
    if (!answer?.trim()) return;
    setSaving(prev => ({ ...prev, [questionId]: true }));
    saveAnswerMutation.mutate({ questionId, answer: answer.trim() });
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <div className="animate-pulse">Loading questions...</div>
      </div>
    );
  }

  if (askedQuestions.length === 0) {
    return (
      <div className="p-6 text-center border rounded-lg border-dashed bg-muted/10">
        <HelpCircle className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground mb-2">No questions marked as asked yet</p>
        <p className="text-xs text-muted-foreground">
          Mark questions as "Asked" in the Discovery Toolkit during or after your meeting
        </p>
      </div>
    );
  }

  const answeredCount = askedQuestions.filter(q => q.answer || localAnswers[q.id]?.trim()).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-600" />
          <span className="font-medium">Meeting Questions & Responses</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-emerald-600 border-emerald-300">
            {answeredCount}/{askedQuestions.length} answered
          </Badge>
          <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20">
            <Sparkles className="w-3 h-3 mr-1" />
            Feeds AI Coaching
          </Badge>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Record client responses to the questions you asked during the meeting. This information enriches AI coaching and strategic insights.
      </p>

      <div className="space-y-3">
        {askedQuestions.map((question) => {
          const isExpanded = expandedQuestion === question.id;
          const hasAnswer = !!(question.answer || localAnswers[question.id]?.trim());
          const isSaving = saving[question.id];
          
          return (
            <Card 
              key={question.id} 
              className={`transition-all ${hasAnswer ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}
            >
              <Collapsible open={isExpanded} onOpenChange={(open) => setExpandedQuestion(open ? question.id : null)}>
                <CollapsibleTrigger className="w-full" data-testid={`trigger-question-${question.id}`}>
                  <div className="p-4 flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                      hasAnswer ? 'bg-emerald-500/20 text-emerald-600' : 'bg-amber-500/20 text-amber-600'
                    }`}>
                      {hasAnswer ? <CheckCircle2 className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{question.question}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {question.methodology && (
                          <Badge variant="outline" className={`text-xs ${methodologyColors[question.methodology]}`}>
                            {question.methodology === "MILLER_HEIMAN" ? "Miller Heiman" : question.methodology}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{question.capabilityName}</span>
                        {hasAnswer && (
                          <Badge className="bg-emerald-500/20 text-emerald-700 text-xs">Answered</Badge>
                        )}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3">
                    {question.purpose && (
                      <div className="flex items-start gap-2 p-2 rounded bg-muted/30">
                        <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Purpose: </span>{question.purpose}
                        </p>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Client Response</label>
                      <Textarea
                        placeholder="Record what the client shared in response to this question..."
                        value={localAnswers[question.id] || ""}
                        onChange={(e) => setLocalAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
                        className="min-h-[100px]"
                        data-testid={`textarea-answer-${question.id}`}
                      />
                    </div>

                    {question.followUpHint && (
                      <div className="p-2 rounded bg-blue-500/10 text-xs text-blue-700">
                        <span className="font-medium">Follow-up hint: </span>{question.followUpHint}
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleSaveAnswer(question.id)}
                        disabled={isSaving || !localAnswers[question.id]?.trim()}
                        data-testid={`button-save-answer-${question.id}`}
                      >
                        {isSaving ? (
                          <>Saving...</>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-1" />
                            Save Response
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {answeredCount === askedQuestions.length && askedQuestions.length > 0 && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">All questions answered!</span>
          </div>
          <p className="text-sm text-emerald-600 mt-1">
            These responses will be used to enrich AI coaching and generate strategic insights for your next engagement.
          </p>
        </div>
      )}
    </div>
  );
}
