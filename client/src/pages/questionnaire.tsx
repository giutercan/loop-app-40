import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Briefcase, CheckCircle, Loader2, Users } from "lucide-react";

type DiscoveryQuestion = {
  id: number;
  projectId: number;
  question: string;
  capabilityName: string;
  context: string;
};

type QuestionResponse = {
  id: number;
  questionId: number;
  answer: string;
  respondentType: string;
  respondentName: string | null;
  respondentEmail: string | null;
};

type QuestionnaireData = {
  questions: DiscoveryQuestion[];
  responses: QuestionResponse[];
  clientName: string | null;
  clientEmail: string | null;
};

export default function QuestionnairePage() {
  const [, params] = useRoute("/questionnaire/:token");
  const token = params?.token;
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<number>>(new Set());

  const { data: questionnaireData, isLoading } = useQuery<QuestionnaireData>({
    queryKey: ["/api/questionnaire", token],
    enabled: !!token,
  });

  const submitResponseMutation = useMutation({
    mutationFn: async ({ questionId, response }: { questionId: number; response: string }) => {
      const res = await apiRequest("POST", `/api/questionnaire/${token}/responses`, {
        questionId,
        response,
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to submit response");
      }
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/questionnaire", token] });
      setSubmittedQuestions(prev => new Set(prev).add(variables.questionId));
      setAnswers(prev => {
        const newAnswers = { ...prev };
        delete newAnswers[variables.questionId];
        return newAnswers;
      });
      toast({
        title: "Response submitted",
        description: "Your answer has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit response",
        variant: "destructive",
      });
    },
  });

  const handleSubmitAnswer = (questionId: number) => {
    const answer = answers[questionId]?.trim();
    if (!answer) {
      toast({
        title: "Empty answer",
        description: "Please provide an answer before submitting.",
        variant: "destructive",
      });
      return;
    }
    submitResponseMutation.mutate({ questionId, response: answer });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading questionnaire...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!questionnaireData || !token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Questionnaire Not Found</CardTitle>
            <CardDescription>
              This questionnaire link is invalid or has expired.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { questions, responses, clientName } = questionnaireData;

  // Group questions by capability
  const capabilities = [
    'Success Profiles & Role Design',
    'Standardised Assessments & Assessments at Scale',
    'Leadership & Development Journeys',
    'AI-Ready Leader (within L&D)',
    'Organisation Strategy & Transformation',
    'Total Rewards Optimisation (TRO)',
    'Sales & Service (KF Sell)',
    'People Analytics / KFI Analytics',
    'Value Management / Client Success & Talent Suite',
  ];

  const groupedQuestions = capabilities.map(capability => ({
    capability,
    questions: questions.filter(q => q.capabilityName === capability),
  })).filter(group => group.questions.length > 0);

  const getResponseForQuestion = (questionId: number) => {
    return responses.find(r => r.questionId === questionId && r.respondentType === 'client');
  };

  const allQuestionsAnswered = questions.every(q => 
    getResponseForQuestion(q.id) || submittedQuestions.has(q.id)
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div className="flex-1">
                <CardTitle className="text-2xl">Discovery Questionnaire</CardTitle>
                <CardDescription>
                  {clientName ? `Welcome, ${clientName}!` : 'Welcome!'} Your consultant has shared these questions to better understand your organization and priorities.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">Instructions:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Answer each question to the best of your knowledge</li>
                <li>Provide specific details, metrics, or examples when possible</li>
                <li>You can answer questions in any order</li>
                <li>Your responses are saved automatically upon submission</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Questions by Capability */}
        {groupedQuestions.map(({ capability, questions: capQuestions }) => (
          <Card key={capability}>
            <CardHeader>
              <div className="flex items-center gap-2 pb-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">{capability}</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {capQuestions.filter(q => getResponseForQuestion(q.id) || submittedQuestions.has(q.id)).length} / {capQuestions.length} answered
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {capQuestions.map((question, idx) => {
                const existingResponse = getResponseForQuestion(question.id);
                const isSubmitted = submittedQuestions.has(question.id);
                const hasAnswer = existingResponse || isSubmitted;

                return (
                  <div key={question.id} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground font-medium text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="space-y-1.5">
                          <p className="font-medium leading-relaxed">{question.question}</p>
                          {question.context && (
                            <p className="text-sm text-muted-foreground">{question.context}</p>
                          )}
                        </div>

                        {hasAnswer ? (
                          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-md p-4 space-y-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />
                              <span className="text-sm font-medium text-green-700 dark:text-green-400">Response Submitted</span>
                            </div>
                            {existingResponse && (
                              <p className="text-sm text-green-900 dark:text-green-200">{existingResponse.answer}</p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Textarea
                              placeholder="Type your answer here..."
                              value={answers[question.id] || ''}
                              onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                              rows={4}
                              className="resize-none"
                              data-testid={`input-answer-${question.id}`}
                            />
                            <Button
                              onClick={() => handleSubmitAnswer(question.id)}
                              disabled={!answers[question.id]?.trim() || submitResponseMutation.isPending}
                              size="sm"
                              data-testid={`button-submit-${question.id}`}
                            >
                              {submitResponseMutation.isPending ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                'Submit Answer'
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    {idx < capQuestions.length - 1 && <div className="border-t ml-9" />}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}

        {/* Completion Message */}
        {allQuestionsAnswered && (
          <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-500" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">All questions answered!</p>
                  <p className="text-sm text-green-700 dark:text-green-300">Thank you for completing the questionnaire. Your consultant will review your responses.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
