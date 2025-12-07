import { useState, useRef, useEffect, createContext, useContext, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  FileText, 
  Target, 
  TrendingUp, 
  MessageSquare,
  Check,
  XCircle,
  Loader2,
  ChevronRight,
  Building2,
  Calendar,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  Play,
  ArrowRight,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  useCompanionPresence, 
  type EntityReference, 
  type FormContext 
} from "@/hooks/use-companion-presence";
import { useProactiveInsights, type ProactiveInsight } from "@/hooks/use-proactive-insights";

interface Message {
  id: number;
  sessionId: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  toolCalls?: any[];
  createdAt: string;
}

interface PendingConfirmation {
  toolName: string;
  arguments: Record<string, any>;
  confirmationMessage: string;
  action: string;
  payload: Record<string, any>;
}

interface CompanionContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  accountId?: number;
  projectId?: number;
  sessionId: string | null;
  setContext: (ctx: { accountId?: number; projectId?: number }) => void;
  trackEntityView: (entity: EntityReference) => void;
  setFormContext: (context: FormContext | null) => void;
}

const CompanionContext = createContext<CompanionContextType | null>(null);

export function useCompanion() {
  const context = useContext(CompanionContext);
  if (!context) {
    throw new Error("useCompanion must be used within CompanionProvider");
  }
  return context;
}

export function CompanionProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [accountId, setAccountId] = useState<number | undefined>();
  const [projectId, setProjectId] = useState<number | undefined>();
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const presence = useCompanionPresence({ sessionId });
  
  const setContext = useCallback((ctx: { accountId?: number; projectId?: number }) => {
    setAccountId(ctx.accountId);
    setProjectId(ctx.projectId);
  }, []);
  
  const updateSessionId = useCallback((id: string | null) => {
    setSessionId(id);
  }, []);
  
  return (
    <CompanionContext.Provider value={{ 
      isOpen, 
      setIsOpen, 
      accountId, 
      projectId, 
      sessionId,
      setContext,
      trackEntityView: presence.trackEntityView,
      setFormContext: presence.setFormContext,
    }}>
      {children}
      <AICompanionPanel onSessionCreated={updateSessionId} />
      <CompanionTriggerButton />
    </CompanionContext.Provider>
  );
}

function CompanionTriggerButton() {
  const { isOpen, setIsOpen } = useCompanion();
  
  if (isOpen) return null;
  
  return (
    <Button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-[#005971] to-[#A3238E] hover:from-[#00634F] hover:to-[#A3238E] transition-all duration-300"
      size="icon"
      data-testid="button-companion-trigger"
    >
      <Sparkles className="h-6 w-6 text-white" />
    </Button>
  );
}

interface InsightCardProps {
  insight: ProactiveInsight;
  onAction: (prompt: string) => void;
  onDismiss: () => void;
  disabled?: boolean;
}

function InsightCard({ insight, onAction, onDismiss, disabled }: InsightCardProps) {
  const getInsightIcon = () => {
    switch (insight.type) {
      case "recommendation":
        return <Lightbulb className="h-4 w-4 text-[#009B77]" />;
      case "tip":
        return <Sparkles className="h-4 w-4 text-[#005971]" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "action":
        return <Play className="h-4 w-4 text-[#A3238E]" />;
      default:
        return <Lightbulb className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  const getBorderColor = () => {
    switch (insight.type) {
      case "recommendation":
        return "border-[#009B77]/30";
      case "tip":
        return "border-[#005971]/30";
      case "warning":
        return "border-amber-500/30";
      case "action":
        return "border-[#A3238E]/30";
      default:
        return "border-muted";
    }
  };
  
  const getBgColor = () => {
    switch (insight.type) {
      case "recommendation":
        return "bg-[#009B77]/5";
      case "tip":
        return "bg-[#005971]/5";
      case "warning":
        return "bg-amber-500/5";
      case "action":
        return "bg-[#A3238E]/5";
      default:
        return "bg-muted/50";
    }
  };
  
  return (
    <Card 
      className={cn("border", getBorderColor(), getBgColor())}
      data-testid={`insight-card-${insight.id}`}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className="mt-0.5">{getInsightIcon()}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{insight.title}</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 text-muted-foreground shrink-0"
                onClick={onDismiss}
                data-testid={`button-dismiss-insight-${insight.id}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {insight.description}
            </p>
            {insight.actionPrompt && insight.actionLabel && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-7 px-2 text-xs text-[#005971] hover:text-[#00634F]"
                onClick={() => onAction(insight.actionPrompt!)}
                disabled={disabled}
                data-testid={`button-insight-action-${insight.id}`}
              >
                {insight.actionLabel}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AICompanionPanelProps {
  onSessionCreated?: (sessionId: string | null) => void;
}

function AICompanionPanel({ onSessionCreated }: AICompanionPanelProps) {
  const { isOpen, setIsOpen, accountId, projectId } = useCompanion();
  const [location] = useLocation();
  const [localSessionId, setLocalSessionId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const currentPage = location;
  
  const { 
    insights,
    allInsights,
    dismissInsight, 
    dismissAll,
    resetDismissed,
    routeContext 
  } = useProactiveInsights({
    accountId,
    projectId,
    enabled: isOpen,
    maxInsights: 3,
  });
  
  const { data: sessionData, isLoading: sessionLoading, refetch: refetchSession } = useQuery<{ session: any; messages: Message[] }>({
    queryKey: ['/api/companion/sessions', localSessionId],
    enabled: !!localSessionId,
  });
  
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/companion/sessions", {
        accountId,
        projectId,
        contextType: getContextType()
      });
      return res.json();
    },
    onSuccess: (data) => {
      setLocalSessionId(data.sessionId);
      onSessionCreated?.(data.sessionId);
    }
  });
  
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/companion/chat", {
        sessionId: localSessionId,
        message,
        context: {
          accountId,
          projectId,
          currentPage
        }
      });
      return res.json();
    },
    onSuccess: (data) => {
      refetchSession();
      if (data.pendingConfirmation) {
        setPendingConfirmation(data.pendingConfirmation);
      }
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
    }
  });
  
  const confirmActionMutation = useMutation({
    mutationFn: async (confirmed: boolean) => {
      if (!pendingConfirmation) return;
      const res = await apiRequest("POST", "/api/companion/confirm", {
        sessionId: localSessionId,
        action: pendingConfirmation.action,
        payload: pendingConfirmation.payload,
        confirmed
      });
      return res.json();
    },
    onSuccess: () => {
      setPendingConfirmation(null);
      refetchSession();
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
    }
  });
  
  function getContextType(): string {
    if (location.includes("/discovery")) return "discovery";
    if (location.includes("/alignment")) return "alignment";
    if (location.includes("/realisation") || location.includes("/dashboard")) return "realisation";
    if (location.includes("/accounts/")) return "account";
    if (location.includes("/projects/")) return "initiative";
    return "global";
  }
  
  useEffect(() => {
    if (isOpen && !localSessionId && !createSessionMutation.isPending) {
      createSessionMutation.mutate();
    }
  }, [isOpen, localSessionId]);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sessionData?.messages]);
  
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  const handleSendMessage = () => {
    if (!inputValue.trim() || sendMessageMutation.isPending) return;
    
    const message = inputValue.trim();
    setInputValue("");
    setIsTyping(true);
    sendMessageMutation.mutate(message);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleQuickAction = (action: string) => {
    setInputValue(action);
    sendMessageMutation.mutate(action);
    setInputValue("");
    setIsTyping(true);
  };
  
  const messages = sessionData?.messages || [];
  
  const quickActions = [
    { 
      label: "Summarize this initiative", 
      prompt: "Give me a summary of this initiative's status and key metrics",
      icon: FileText,
      show: !!projectId
    },
    { 
      label: "Prepare for meeting", 
      prompt: "Help me prepare for a client meeting - what are the key talking points?",
      icon: Calendar,
      show: !!projectId || !!accountId
    },
    { 
      label: "KPI recommendations", 
      prompt: "What KPIs should I focus on based on the current strategic priorities?",
      icon: Target,
      show: !!projectId
    },
    { 
      label: "Account overview", 
      prompt: "Give me an overview of this account's initiatives and value realization",
      icon: Building2,
      show: !!accountId
    },
    { 
      label: "Track progress", 
      prompt: "What's the current progress on our key metrics?",
      icon: TrendingUp,
      show: !!projectId
    },
    { 
      label: "Value insights", 
      prompt: "What insights can you share about our value realization journey?",
      icon: BarChart3,
      show: true
    },
  ].filter(action => action.show);
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-md p-0 flex flex-col bg-gradient-to-b from-background to-muted/20"
        data-testid="panel-companion"
      >
        <SheetHeader className="px-4 py-3 border-b bg-gradient-to-r from-[#005971] to-[#A3238E]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <SheetTitle className="text-white text-base font-semibold">AI Companion</SheetTitle>
                <p className="text-white/70 text-xs">Powered by GPT-4</p>
              </div>
            </div>
            <Badge variant="outline" className="text-white/80 border-white/30 text-xs">
              {getContextType()}
            </Badge>
          </div>
        </SheetHeader>
        
        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className="py-4 space-y-4">
            {sessionLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-3/4" />
                <Skeleton className="h-12 w-1/2 ml-auto" />
              </div>
            ) : messages.length === 0 ? (
              <div className="space-y-4">
                <div className="text-center py-6">
                  <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-r from-[#005971]/10 to-[#A3238E]/10 flex items-center justify-center mb-3">
                    <Bot className="h-8 w-8 text-[#005971]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">How can I help?</h3>
                  <p className="text-sm text-muted-foreground">
                    I can help you understand your data, prepare for meetings, and manage KPIs.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick Actions</p>
                  <div className="grid gap-2">
                    {quickActions.slice(0, 4).map((action, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="justify-start text-left h-auto py-2 px-3 hover-elevate"
                        onClick={() => handleQuickAction(action.prompt)}
                        disabled={sendMessageMutation.isPending}
                        data-testid={`button-quick-action-${i}`}
                      >
                        <action.icon className="h-4 w-4 mr-2 text-[#005971]" />
                        <span className="text-sm">{action.label}</span>
                        <ChevronRight className="h-3 w-3 ml-auto text-muted-foreground" />
                      </Button>
                    ))}
                  </div>
                </div>
                
                {showInsights && insights.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <Zap className="h-3 w-3 text-[#A3238E]" />
                        Contextual Insights
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-muted-foreground"
                        onClick={() => setShowInsights(false)}
                        data-testid="button-hide-insights"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {insights.map((insight) => (
                        <InsightCard
                          key={insight.id}
                          insight={insight}
                          onAction={(prompt) => handleQuickAction(prompt)}
                          onDismiss={() => dismissInsight(insight.id)}
                          disabled={sendMessageMutation.isPending}
                        />
                      ))}
                    </div>
                  </div>
                ) : (!showInsights || (insights.length === 0 && allInsights.length > 0)) && (
                  <div className="pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-muted-foreground"
                      onClick={() => {
                        setShowInsights(true);
                        resetDismissed();
                      }}
                      data-testid="button-show-insights"
                    >
                      <Zap className="h-3 w-3 mr-1 text-[#A3238E]" />
                      Show contextual insights
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2",
                      msg.role === "user"
                        ? "bg-[#005971] text-white"
                        : "bg-muted"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-1 mb-1">
                        <Sparkles className="h-3 w-3 text-[#A3238E]" />
                        <span className="text-xs font-medium text-[#A3238E]">AI</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.toolCalls && msg.toolCalls.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <p className="text-xs opacity-70">
                          Used: {msg.toolCalls.map(tc => tc.toolName).join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin text-[#A3238E]" />
                    <span className="text-xs text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {pendingConfirmation && (
          <Card className="mx-4 mb-2 border-[#A3238E]/30 bg-[#A3238E]/5">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-[#A3238E] mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Confirm Action</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    {pendingConfirmation.confirmationMessage}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => confirmActionMutation.mutate(true)}
                      disabled={confirmActionMutation.isPending}
                      className="bg-[#009B77] hover:bg-[#00634F]"
                      data-testid="button-confirm-action"
                    >
                      {confirmActionMutation.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Check className="h-3 w-3 mr-1" />
                      )}
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => confirmActionMutation.mutate(false)}
                      disabled={confirmActionMutation.isPending}
                      data-testid="button-cancel-action"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Separator />
        
        <div className="p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              disabled={sendMessageMutation.isPending || !localSessionId}
              className="flex-1"
              data-testid="input-companion-message"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || sendMessageMutation.isPending || !localSessionId}
              size="icon"
              className="bg-[#005971] hover:bg-[#00634F]"
              data-testid="button-send-message"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default AICompanionPanel;
