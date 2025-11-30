import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sparkles,
  Loader2,
  Send,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
  Lightbulb,
  Target,
  TrendingUp,
  MessageSquare,
  FileText,
  Brain,
  Zap,
  BookOpen,
  Users,
  DollarSign,
  AlertCircle
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ValueJustification, ValueJustificationMessage } from "@shared/schema";

interface ValueJustificationStudioProps {
  projectId: number;
  priorityId: number;
  priorityName: string;
  onClose?: () => void;
}

interface PriorityContext {
  priority: {
    id: number;
    name: string;
    capabilityName: string | null;
    solutionArea: string | null;
    aggregationSummary: string | null;
    priorityRank: number | null;
  };
  company: {
    name: string;
    sector: string | null;
    businessUnit: string | null;
  } | null;
  discoveryInsights: Array<{
    id: number;
    label: string;
    value: string;
    confidence: string | null;
    source: string | null;
  }>;
  discoveryNotes: {
    freeformNotes: string | null;
    keyStakeholder: string | null;
    topChallenges: string | null;
    timeline: string | null;
  } | null;
  questionnaireResponses: Array<{
    id: number;
    question: string;
    answer: string;
    respondentType: string;
    respondentName: string | null;
  }>;
  kpis: Array<{
    id: number;
    name: string;
    type: string;
    unit: string | null;
    baselineValue: string | null;
    targetValue: string | null;
    aiStrategicRationale: string | null;
    aiKornFerryBenchmark: string | null;
  }>;
  kpiGaps: Array<{
    kpiName: string;
    baseline: number | null;
    target: number | null;
    gap: number | null;
    percentImprovement: string | null;
    unit: string | null;
  }>;
}

export default function ValueJustificationStudio({ 
  projectId, 
  priorityId, 
  priorityName,
  onClose 
}: ValueJustificationStudioProps) {
  const { toast } = useToast();
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const { 
    data: context, 
    isLoading: isLoadingContext,
    error: contextError 
  } = useQuery<PriorityContext>({
    queryKey: [`/api/projects/${projectId}/priorities/${priorityId}/context`],
    enabled: !!projectId && !!priorityId,
  });

  interface JustificationWithMessages extends ValueJustification {
    messages?: ValueJustificationMessage[];
  }
  
  const { 
    data: justificationData, 
    isLoading: isLoadingJustification, 
    error: justificationError,
    refetch: refetchJustification 
  } = useQuery<{ justification: JustificationWithMessages | null }>({
    queryKey: [`/api/projects/${projectId}/priorities/${priorityId}/value-justification`],
    enabled: !!projectId && !!priorityId,
  });
  
  const justification = justificationData?.justification;
  const messages = justification?.messages || [];

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/priorities/${priorityId}/value-justification/generate`, {
        tone: "executive",
        includeFinancials: true,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/priorities/${priorityId}/value-justification`] });
      toast({
        title: "Value justification generated",
        description: "AI has created a draft based on your Discovery insights and outcomes.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate value justification.",
        variant: "destructive",
      });
    },
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!justification?.id) throw new Error("No justification to refine");
      const res = await apiRequest("POST", `/api/value-justifications/${justification.id}/chat`, {
        message,
      });
      return res.json();
    },
    onSuccess: () => {
      setChatInput("");
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/priorities/${priorityId}/value-justification`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Chat failed",
        description: error.message || "Failed to process your message.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    chatMutation.mutate(chatInput);
  };

  const handleCopy = () => {
    if (justification?.draftContent) {
      navigator.clipboard.writeText(justification.draftContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Value justification content copied.",
      });
    }
  };

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const discoveryCount = (context?.discoveryInsights?.length || 0) + 
    (context?.questionnaireResponses?.length || 0) +
    (context?.discoveryNotes ? 1 : 0);
  
  const kpiCount = context?.kpis?.length || 0;
  const readyKpis = context?.kpiGaps?.filter(k => k.baseline !== null && k.target !== null).length || 0;

  const isLoading = isLoadingContext || isLoadingJustification;
  const hasError = contextError || justificationError;

  if (isLoading) {
    return (
      <Card className="mt-6" data-testid="value-justification-loading">
        <CardContent className="py-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Loading Value Justification Studio...</p>
        </CardContent>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card className="mt-6" data-testid="value-justification-error">
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load value justification data. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-8 space-y-6"
      data-testid="value-justification-studio"
    >
      <Separator className="my-2" />
      
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold" data-testid="text-studio-title">Value Justification Studio</h2>
          <p className="text-sm text-muted-foreground">AI-powered narrative from your Discovery and KPIs</p>
        </div>
      </div>

      <div className="flex items-center gap-2 py-3 px-4 rounded-lg bg-muted/50 border" data-testid="journey-flow-indicator">
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <div className="flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span className="font-medium" data-testid="text-discovery-count">{discoveryCount}</span>
            <span className="text-muted-foreground">insights</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-primary" />
            <span className="font-medium" data-testid="text-kpi-count">{readyKpis}/{kpiCount}</span>
            <span className="text-muted-foreground">KPIs ready</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-muted-foreground">Value Justification</span>
          </div>
        </div>
      </div>

      {!justification ? (
        <Card data-testid="card-generate-prompt">
          <CardContent className="py-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-cyan-100 dark:from-violet-900/30 dark:to-cyan-900/30 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-7 h-7 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Generate Value Justification</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
              AI will analyze your Discovery insights and KPI gaps to create a compelling value narrative for stakeholders.
            </p>
            <Button 
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending || isLoadingContext}
              className="gap-2"
              data-testid="button-generate-value-justification"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card data-testid="card-justification-draft">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Value Justification Draft
                      <Badge variant="outline" className="ml-2 font-normal" data-testid="badge-version">
                        v{justification.version}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {justification.status === 'draft' ? 'AI-generated draft' : 
                       justification.status === 'refined' ? 'Refined through conversation' : 'Approved'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="gap-1.5"
                      data-testid="button-copy-justification"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => generateMutation.mutate()}
                      disabled={generateMutation.isPending}
                      className="gap-1.5"
                      data-testid="button-regenerate-justification"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
                      Regenerate
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {justification.executiveSummary && (
                  <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-violet-50 to-cyan-50 dark:from-violet-900/20 dark:to-cyan-900/20 border border-violet-200/50 dark:border-violet-800/50">
                    <p className="text-xs font-medium text-violet-700 dark:text-violet-300 mb-1">Executive Summary</p>
                    <p className="text-sm leading-relaxed" data-testid="text-executive-summary">{justification.executiveSummary}</p>
                  </div>
                )}
                
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed" data-testid="text-justification-content">
                    {justification.draftContent}
                  </div>
                </div>

                {(justification.projectedValue || justification.confidenceLevel) && (
                  <div className="mt-6 pt-4 border-t flex flex-wrap gap-4">
                    {justification.projectedValue && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm" data-testid="text-projected-value">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            ${(justification.projectedValue / 100).toLocaleString()}
                          </span>
                          {justification.projectedValueTimeframe && (
                            <span className="text-muted-foreground"> ({justification.projectedValueTimeframe})</span>
                          )}
                        </span>
                      </div>
                    )}
                    {justification.confidenceLevel && (
                      <Badge 
                        variant="outline"
                        className={
                          justification.confidenceLevel === 'high' ? 'border-emerald-300 text-emerald-700 dark:text-emerald-400' :
                          justification.confidenceLevel === 'medium' ? 'border-amber-300 text-amber-700 dark:text-amber-400' :
                          'border-muted-foreground/30'
                        }
                        data-testid="badge-confidence"
                      >
                        {justification.confidenceLevel} confidence
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {context && (
              <Card data-testid="card-source-context">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Source Context
                  </CardTitle>
                  <CardDescription>Discovery data used to generate this justification</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {context.discoveryInsights.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Key Insights ({context.discoveryInsights.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {context.discoveryInsights.slice(0, 5).map((insight) => (
                          <Badge key={insight.id} variant="secondary" className="font-normal" data-testid={`badge-insight-${insight.id}`}>
                            {insight.label}
                          </Badge>
                        ))}
                        {context.discoveryInsights.length > 5 && (
                          <Badge variant="outline" className="font-normal">
                            +{context.discoveryInsights.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {context.kpiGaps.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">KPI Improvements</p>
                      <div className="space-y-2">
                        {context.kpiGaps.filter(k => k.percentImprovement).slice(0, 3).map((kpi, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm" data-testid={`text-kpi-gap-${idx}`}>
                            <span className="text-muted-foreground">{kpi.kpiName}</span>
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                              +{kpi.percentImprovement}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {context.discoveryNotes?.topChallenges && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Key Challenges</p>
                      <p className="text-sm text-muted-foreground" data-testid="text-challenges">{context.discoveryNotes.topChallenges}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col" data-testid="card-chat-panel">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Refine with AI
                </CardTitle>
                <CardDescription>Chat to adjust tone, focus, or add details</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <ScrollArea className="flex-1 -mx-4 px-4" ref={chatScrollRef}>
                  <div className="space-y-4 pb-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8" data-testid="chat-empty-state">
                        <Users className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                          Ask AI to refine the justification
                        </p>
                        <div className="mt-4 space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs w-full justify-start"
                            onClick={() => setChatInput("Make the tone more formal and data-driven")}
                            data-testid="button-suggestion-formal"
                          >
                            Make more formal and data-driven
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs w-full justify-start"
                            onClick={() => setChatInput("Add more focus on ROI and financial impact")}
                            data-testid="button-suggestion-roi"
                          >
                            Focus more on ROI
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs w-full justify-start"
                            onClick={() => setChatInput("Shorten the executive summary")}
                            data-testid="button-suggestion-shorten"
                          >
                            Shorten the summary
                          </Button>
                        </div>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          data-testid={`chat-message-${msg.id}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                              msg.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : msg.role === 'system'
                                ? 'bg-muted text-muted-foreground italic'
                                : 'bg-muted'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </motion.div>
                      ))
                    )}
                    {chatMutation.isPending && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                        data-testid="chat-loading"
                      >
                        <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span className="text-sm text-muted-foreground">Thinking...</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>

                <div className="pt-4 mt-auto border-t">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="How should I refine this?"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="min-h-[60px] resize-none"
                      data-testid="textarea-chat-input"
                    />
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim() || chatMutation.isPending}
                      data-testid="button-send-chat"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </motion.div>
  );
}
