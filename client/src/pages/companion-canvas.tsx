import { useState, useRef, useEffect, useCallback, createContext, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Bot, 
  Send, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Building2,
  BarChart3,
  Lightbulb,
  Play,
  ArrowRight,
  Zap,
  Mic,
  MicOff,
  Volume2,
  User,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  MessageSquare,
  FileText,
  Calendar,
  Users,
  Loader2,
  Check,
  X,
  ExternalLink,
  PlusCircle,
  Settings,
  Home
} from "lucide-react";
import { useVoiceSession } from "@/hooks/use-voice-session";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { LoopLogo, LoopLogoBrand } from "@/components/AppHeader";

interface Message {
  id: number;
  sessionId: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  toolCalls?: ToolCall[];
  richContent?: RichContent;
  createdAt: string;
}

interface ToolCall {
  name: string;
  arguments: Record<string, any>;
  result?: any;
}

interface RichContent {
  type: "account_card" | "initiative_card" | "kpi_list" | "action_buttons" | "progress" | "summary" | "meeting_prep" | "recommendations" | "accounts_list" | "initiatives_list";
  data: any;
}

// Convert tool results to rich content for inline display
function deriveRichContentFromToolCalls(toolCalls?: ToolCall[]): RichContent | null {
  if (!toolCalls || toolCalls.length === 0) return null;
  
  for (const tc of toolCalls) {
    if (!tc.result?.success || !tc.result?.data) continue;
    
    switch (tc.name) {
      case "getAccountSummary":
      case "createAccount":
        return { type: "account_card", data: tc.result.data };
      case "getInitiativeSummary":
      case "createInitiative":
      case "createInitiativeWithDiscovery":
        return { type: "initiative_card", data: tc.result.data };
      case "listKPIs":
        return { type: "kpi_list", data: tc.result.data };
      case "listAccounts":
        return { type: "accounts_list", data: tc.result.data };
      case "listInitiatives":
        return { type: "initiatives_list", data: tc.result.data };
      case "prepareMeetingBundle":
        return { type: "meeting_prep", data: tc.result.data };
      case "recommendKPIs":
      case "recommendNextAction":
        return { type: "recommendations", data: tc.result.data };
    }
  }
  return null;
}

interface PendingConfirmation {
  toolName: string;
  arguments: Record<string, any>;
  confirmationMessage: string;
  action: string;
  payload: Record<string, any>;
}

interface ContextPanelData {
  type: "empty" | "account" | "accounts" | "initiative" | "initiatives" | "kpis" | "meeting" | "recommendations";
  data?: any;
  title?: string;
}

function AccountCard({ account }: { account: any }) {
  const [, navigate] = useLocation();
  
  return (
    <Card className="hover-elevate cursor-pointer" onClick={() => navigate(`/accounts/${account.id}/sales`)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5 text-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate">{account.name}</h4>
            {account.industry && (
              <p className="text-sm text-muted-foreground">{account.industry}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              {account.tier && (
                <Badge variant="secondary" className="text-xs">{account.tier}</Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {account.projectCount || 0} initiatives
              </span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

function InitiativeCard({ initiative }: { initiative: any }) {
  const [, navigate] = useLocation();
  
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "discovery": return "bg-primary";
      case "alignment": return "bg-secondary";
      case "realisation": return "bg-ai";
      default: return "bg-muted";
    }
  };
  
  return (
    <Card className="hover-elevate cursor-pointer" onClick={() => navigate(`/projects/${initiative.id}/sales`)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", getPhaseColor(initiative.phase))}>
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate">{initiative.name}</h4>
            <p className="text-sm text-muted-foreground capitalize">{initiative.phase || "Discovery"} Phase</p>
            {initiative.promisedValue && (
              <p className="text-sm font-medium text-accent mt-1">
                ${(initiative.promisedValue / 1000000).toFixed(1)}M promised value
              </p>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

function KPICard({ kpi }: { kpi: any }) {
  const getHealthColor = (health: string) => {
    switch (health) {
      case "on_track": return "text-accent";
      case "at_risk": return "text-amber-500";
      case "off_track": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };
  
  const getHealthIcon = (health: string) => {
    switch (health) {
      case "on_track": return <CheckCircle2 className="h-4 w-4" />;
      case "at_risk": return <AlertCircle className="h-4 w-4" />;
      case "off_track": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };
  
  const progress = kpi.targetValue && kpi.currentValue 
    ? Math.min(100, (parseFloat(kpi.currentValue) / parseFloat(kpi.targetValue)) * 100)
    : 0;
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-medium text-foreground text-sm">{kpi.kpiName}</h4>
          <div className={cn("flex items-center gap-1", getHealthColor(kpi.healthStatus))}>
            {getHealthIcon(kpi.healthStatus)}
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-foreground">
            {kpi.currentValue || "—"}
          </span>
          <span className="text-sm text-muted-foreground">
            / {kpi.targetValue || "—"} {kpi.unit}
          </span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </CardContent>
    </Card>
  );
}

function ActionButtons({ actions, onAction }: { actions: any[]; onAction: (action: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action, i) => (
        <Button
          key={i}
          variant={action.primary ? "default" : "outline"}
          size="sm"
          onClick={() => onAction(action.prompt || action.action)}
          data-testid={`button-action-${i}`}
        >
          {action.icon && <action.icon className="h-4 w-4 mr-1" />}
          {action.label}
        </Button>
      ))}
    </div>
  );
}

function RecommendationCard({ recommendation, onAccept }: { recommendation: any; onAccept: () => void }) {
  return (
    <Card className="border-ai/30 bg-ai/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-ai/20 flex items-center justify-center shrink-0">
            <Lightbulb className="h-4 w-4 text-ai" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground text-sm">{recommendation.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">{recommendation.description}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-7 px-2 text-xs text-ai"
              onClick={onAccept}
              data-testid={`button-accept-recommendation-${recommendation.id}`}
            >
              Apply this <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RichMessageContent({ content, onAction }: { content: RichContent; onAction: (prompt: string) => void }) {
  switch (content.type) {
    case "account_card":
      return <AccountCard account={content.data} />;
    case "initiative_card":
      return <InitiativeCard initiative={content.data} />;
    case "kpi_list":
      return (
        <div className="space-y-2">
          {Array.isArray(content.data) && content.data.map((kpi: any) => (
            <KPICard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      );
    case "accounts_list":
      return (
        <div className="space-y-2">
          {Array.isArray(content.data) && content.data.slice(0, 5).map((account: any) => (
            <AccountCard key={account.id} account={account} />
          ))}
          {Array.isArray(content.data) && content.data.length > 5 && (
            <p className="text-xs text-muted-foreground text-center">
              +{content.data.length - 5} more accounts
            </p>
          )}
        </div>
      );
    case "initiatives_list":
      return (
        <div className="space-y-2">
          {Array.isArray(content.data) && content.data.slice(0, 5).map((initiative: any) => (
            <InitiativeCard key={initiative.id} initiative={initiative} />
          ))}
          {Array.isArray(content.data) && content.data.length > 5 && (
            <p className="text-xs text-muted-foreground text-center">
              +{content.data.length - 5} more initiatives
            </p>
          )}
        </div>
      );
    case "meeting_prep":
      return (
        <Card className="border-secondary/30 bg-secondary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-secondary" />
              <h4 className="font-medium text-foreground">Meeting Preparation</h4>
            </div>
            {content.data?.talkingPoints && (
              <div className="space-y-2">
                {content.data.talkingPoints.slice(0, 3).map((point: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      );
    case "action_buttons":
      return <ActionButtons actions={content.data} onAction={onAction} />;
    case "recommendations":
      return (
        <div className="space-y-2">
          {Array.isArray(content.data) && content.data.map((rec: any, i: number) => (
            <RecommendationCard 
              key={rec.id || i} 
              recommendation={rec} 
              onAccept={() => onAction(rec.prompt || `Apply recommendation: ${rec.title}`)}
            />
          ))}
        </div>
      );
    default:
      return null;
  }
}

// Format AI message content with visual structure
function FormattedMessage({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let listItems: { text: string; numbered: boolean }[] = [];
  let listStartIndex = 0;
  
  const renderList = (items: { text: string; numbered: boolean }[], startIdx: number) => {
    if (items.length === 0) return;
    const numbered = items[0].numbered;
    elements.push(
      <div key={`list-${startIdx}`} className="space-y-1.5 my-2">
        {items.map((item, i) => (
          <div key={`item-${startIdx}-${i}`} className="flex items-start gap-2">
            {numbered ? (
              <span className="text-xs font-semibold text-secondary bg-secondary/10 rounded-full h-5 w-5 flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
            ) : (
              <ChevronRight className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
            )}
            <span className="text-sm">{formatBold(item.text)}</span>
          </div>
        ))}
      </div>
    );
  };
  
  // Simple bold formatting - just handle **text**
  const formatBold = (text: string): JSX.Element => {
    const parts: (string | JSX.Element)[] = [];
    const regex = /\*\*([^*]+)\*\*/g;
    let lastIndex = 0;
    let match;
    let keyIdx = 0;
    
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(<strong key={keyIdx++} className="font-semibold">{match[1]}</strong>);
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return <>{parts.length > 0 ? parts : text}</>;
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for list items
    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    const numberedMatch = line.match(/^\d+\.\s+(.+)$/);
    
    if (bulletMatch) {
      if (listItems.length === 0) listStartIndex = i;
      listItems.push({ text: bulletMatch[1], numbered: false });
      continue;
    }
    
    if (numberedMatch) {
      if (listItems.length === 0) listStartIndex = i;
      listItems.push({ text: numberedMatch[1], numbered: true });
      continue;
    }
    
    // Not a list item - flush any pending list
    if (listItems.length > 0) {
      renderList(listItems, listStartIndex);
      listItems = [];
    }
    
    // Skip empty lines
    if (!line) continue;
    
    // Headers
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={`h4-${i}`} className="font-semibold text-foreground text-sm mt-3 mb-1 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
          {line.slice(4)}
        </h4>
      );
      continue;
    }
    
    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="font-bold text-foreground mt-3 mb-2">{line.slice(3)}</h3>
      );
      continue;
    }
    
    // Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="text-sm leading-relaxed">{formatBold(line)}</p>
    );
  }
  
  // Flush remaining list items
  if (listItems.length > 0) {
    renderList(listItems, listStartIndex);
  }
  
  return <div className="space-y-1">{elements}</div>;
}

function ContextPanel({ data }: { data: ContextPanelData }) {
  if (data.type === "empty") {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-secondary/10 to-ai/10 flex items-center justify-center mb-4">
          <Sparkles className="h-10 w-10 text-secondary" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">Context Panel</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          As we chat, I'll show relevant accounts, initiatives, KPIs, and data here for easy reference.
        </p>
      </div>
    );
  }
  
  if (data.type === "account" && data.data) {
    const account = data.data;
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
            <Building2 className="h-6 w-6 text-secondary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{account.name}</h3>
            <p className="text-sm text-muted-foreground">{account.industry || "No industry set"}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-secondary">{account.initiativeCount || 0}</p>
              <p className="text-xs text-muted-foreground">Initiatives</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-accent">
                ${((account.totalValue || 0) / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-muted-foreground">Total Value</p>
            </CardContent>
          </Card>
        </div>
        
        {account.initiatives && account.initiatives.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Initiatives</h4>
            {account.initiatives.map((initiative: any) => (
              <InitiativeCard key={initiative.id} initiative={initiative} />
            ))}
          </div>
        )}
      </div>
    );
  }
  
  if (data.type === "initiative" && data.data) {
    const initiative = data.data;
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-ai flex items-center justify-center">
            <Briefcase className="h-6 w-6 text-ai-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{initiative.name}</h3>
            <p className="text-sm text-muted-foreground capitalize">{initiative.phase || "Discovery"} Phase</p>
          </div>
        </div>
        
        {initiative.kpis && initiative.kpis.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Key Metrics</h4>
            {initiative.kpis.slice(0, 4).map((kpi: any) => (
              <KPICard key={kpi.id} kpi={kpi} />
            ))}
          </div>
        )}
      </div>
    );
  }
  
  if (data.type === "kpis" && data.data) {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground">{data.title || "KPIs"}</h3>
        <div className="space-y-2">
          {data.data.map((kpi: any) => (
            <KPICard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </div>
    );
  }
  
  if (data.type === "meeting" && data.data) {
    const meeting = data.data;
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center">
            <Calendar className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Meeting Prep</h3>
            <p className="text-sm text-muted-foreground">{meeting.type}</p>
          </div>
        </div>
        
        {meeting.talkingPoints && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Talking Points</h4>
            <ul className="space-y-1">
              {meeting.talkingPoints.map((point: string, i: number) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
  
  if (data.type === "accounts" && data.data) {
    const accounts = Array.isArray(data.data) ? data.data : [];
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
            <Building2 className="h-6 w-6 text-secondary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{data.title || "All Accounts"}</h3>
            <p className="text-sm text-muted-foreground">{accounts.length} accounts</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {accounts.map((account: any) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      </div>
    );
  }
  
  if (data.type === "initiatives" && data.data) {
    const initiatives = Array.isArray(data.data) ? data.data : [];
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-ai flex items-center justify-center">
            <Briefcase className="h-6 w-6 text-ai-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{data.title || "Initiatives"}</h3>
            <p className="text-sm text-muted-foreground">{initiatives.length} initiatives</p>
          </div>
        </div>
        
        <div className="space-y-2">
          {initiatives.map((initiative: any) => (
            <InitiativeCard key={initiative.id} initiative={initiative} />
          ))}
        </div>
      </div>
    );
  }
  
  return null;
}

export default function CompanionCanvas() {
  const [, navigate] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [contextPanel, setContextPanel] = useState<ContextPanelData>({ type: "empty" });
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('canvas-auto-speak') === 'true';
    }
    return false;
  });
  const [playingMessageId, setPlayingMessageId] = useState<number | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastMessageCountRef = useRef<number>(0);
  const hasInitializedRef = useRef<boolean>(false);
  const sendMessageRef = useRef<((text: string) => void) | null>(null);
  
  const handleVoiceTranscript = useCallback((text: string) => {
    if (text.trim() && sendMessageRef.current) {
      setInputValue(text);
      setIsTyping(true);
      sendMessageRef.current(text);
    }
  }, []);
  
  const voiceSession = useVoiceSession({
    onTranscript: handleVoiceTranscript,
    onError: (error) => {
      console.error("Voice error:", error);
      setVoiceError(error);
    },
    voice: "nova"
  });
  
  const { data: sessionData, isLoading: sessionLoading, refetch: refetchSession } = useQuery<{ session: any; messages: Message[] }>({
    queryKey: ['/api/companion/sessions', sessionId],
    enabled: !!sessionId,
  });
  
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/companion/sessions", {
        contextType: "canvas"
      });
      return res.json();
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
    }
  });
  
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/companion/chat", {
        sessionId,
        message,
        context: {
          currentPage: "/companion",
          canvasMode: true
        }
      });
      return res.json();
    },
    onSuccess: (data) => {
      refetchSession();
      if (data.pendingConfirmation) {
        setPendingConfirmation(data.pendingConfirmation);
      }
      if (data.contextUpdate) {
        setContextPanel(data.contextUpdate);
      }
      if (data.navigationCommand) {
        const nav = data.navigationCommand;
        if (nav.type === "navigate" && nav.path) {
          navigate(nav.path);
        }
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
        sessionId,
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
  
  // Connect sendMessageRef to the mutation for voice transcript callback
  useEffect(() => {
    sendMessageRef.current = (text: string) => {
      sendMessageMutation.mutate(text);
    };
  });
  
  useEffect(() => {
    if (!sessionId && !createSessionMutation.isPending) {
      createSessionMutation.mutate();
    }
  }, [sessionId]);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sessionData?.messages]);
  
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  useEffect(() => {
    const messages = sessionData?.messages || [];
    const currentCount = messages.length;
    
    if (!hasInitializedRef.current && currentCount > 0) {
      hasInitializedRef.current = true;
      lastMessageCountRef.current = currentCount;
      return;
    }
    
    if (hasInitializedRef.current && autoSpeakEnabled && currentCount > lastMessageCountRef.current && currentCount > 0) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage && latestMessage.role === 'assistant' && latestMessage.content) {
        setPlayingMessageId(latestMessage.id);
        voiceSession.playAudio(latestMessage.content).finally(() => {
          setPlayingMessageId(null);
        });
      }
    }
    
    lastMessageCountRef.current = currentCount;
  }, [sessionData?.messages, autoSpeakEnabled, voiceSession]);
  
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
  
  const handleQuickAction = (prompt: string) => {
    setIsTyping(true);
    sendMessageMutation.mutate(prompt);
  };
  
  const handleVoiceToggle = async () => {
    if (voiceSession.isProcessing) return;
    
    if (voiceSession.isRecording) {
      await voiceSession.stopRecording();
    } else {
      await voiceSession.startRecording();
    }
  };
  
  const toggleAutoSpeak = useCallback(() => {
    setAutoSpeakEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('canvas-auto-speak', String(newValue));
      if (!newValue) {
        voiceSession.stopAudio();
        setPlayingMessageId(null);
      }
      return newValue;
    });
  }, [voiceSession]);
  
  const messages = sessionData?.messages || [];
  
  // Organized quick starters by category
  const quickStartCategories = [
    {
      title: "Plan",
      description: "Research & strategize",
      color: "from-secondary to-secondary/80",
      actions: [
        { label: "View all accounts", prompt: "Show me all my accounts with their health status", icon: Building2 },
        { label: "Create new account", prompt: "I want to create a new account for a client", icon: PlusCircle },
        { label: "Research a company", prompt: "Help me research a company for discovery", icon: Lightbulb },
      ]
    },
    {
      title: "Execute", 
      description: "Take action & deliver",
      color: "from-ai to-ai/80",
      actions: [
        { label: "Prepare for meeting", prompt: "Help me prepare talking points for a client meeting", icon: Calendar },
        { label: "Create initiative", prompt: "I want to create a new initiative with AI discovery", icon: Zap },
        { label: "Add discovery notes", prompt: "Help me capture key insights from a discovery session", icon: FileText },
      ]
    },
    {
      title: "Measure",
      description: "Track & optimize", 
      color: "from-accent to-accent/80",
      actions: [
        { label: "Review KPIs", prompt: "Show me KPIs that need attention across all accounts", icon: Target },
        { label: "Value summary", prompt: "Give me a summary of total value being delivered", icon: TrendingUp },
        { label: "Health check", prompt: "Which accounts or initiatives need my attention today?", icon: BarChart3 },
      ]
    }
  ];
  
  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="h-14 border-b bg-gradient-to-r from-secondary to-ai flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/accounts">
            <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10" data-testid="button-back-home">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
              <LoopLogo className="h-6 w-6" useGradient />
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg">Loop Canvas</h1>
              <p className="text-white/60 text-xs">Your AI-powered workspace</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleAutoSpeak}
            className={cn(
              "h-8 w-8 rounded-full transition-colors",
              autoSpeakEnabled 
                ? "bg-white/30 text-white hover:bg-white/40" 
                : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
            )}
            data-testid="button-toggle-auto-speak"
            title={autoSpeakEnabled ? "Voice responses on" : "Voice responses off"}
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>
      </header>
      
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={60} minSize={40}>
          <div className="h-full flex flex-col">
            <ScrollArea className="flex-1 px-4" ref={scrollRef}>
              <div className="py-6 space-y-4 max-w-2xl mx-auto">
                {sessionLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-3/4" />
                    <Skeleton className="h-12 w-1/2 ml-auto" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-secondary/10 to-ai/10 flex items-center justify-center mb-4">
                        <Bot className="h-10 w-10 text-secondary" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Loop Canvas</h2>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        I'm Loop, your AI assistant. Just tell me what you'd like to do - I can create accounts, 
                        manage initiatives, track KPIs, prepare for meetings, and guide you through workflows.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground text-center">Get started with</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {quickStartCategories.map((category, catIndex) => (
                          <div key={catIndex} className="space-y-2">
                            <div className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r",
                              category.color
                            )}>
                              <span className="text-white font-semibold text-sm">{category.title}</span>
                              <span className="text-white/70 text-xs">{category.description}</span>
                            </div>
                            <div className="space-y-2">
                              {category.actions.map((action, actionIndex) => (
                                <Button
                                  key={actionIndex}
                                  variant="outline"
                                  className="w-full justify-start h-auto py-2.5 px-3 text-left"
                                  onClick={() => handleQuickAction(action.prompt)}
                                  disabled={sendMessageMutation.isPending}
                                  data-testid={`button-quick-${category.title.toLowerCase()}-${actionIndex}`}
                                >
                                  <action.icon className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                                  <span className="text-sm">{action.label}</span>
                                </Button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex",
                          msg.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] rounded-xl",
                            msg.role === "user"
                              ? "bg-secondary text-secondary-foreground px-4 py-3"
                              : "bg-muted px-4 py-3"
                          )}
                        >
                          {msg.role === "assistant" && (
                            <div className="flex items-center gap-2 mb-2">
                              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-secondary to-ai flex items-center justify-center">
                                <Sparkles className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-xs font-medium text-ai">Loop</span>
                              {playingMessageId === msg.id && (
                                <Badge variant="secondary" className="text-xs">
                                  <Volume2 className="h-3 w-3 mr-1 animate-pulse" /> Speaking
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          {msg.role === "assistant" ? (
                            <FormattedMessage content={msg.content} />
                          ) : (
                            <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                          )}
                          
                          {(() => {
                            const richContent = msg.richContent || deriveRichContentFromToolCalls(msg.toolCalls);
                            return richContent ? (
                              <div className="mt-3">
                                <RichMessageContent 
                                  content={richContent} 
                                  onAction={handleQuickAction} 
                                />
                              </div>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-xl px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-secondary to-ai flex items-center justify-center">
                              <Sparkles className="h-3 w-3 text-white" />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="h-2 w-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                              <span className="h-2 w-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                              <span className="h-2 w-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {pendingConfirmation && (
                      <Card className="border-amber-500/50 bg-amber-500/5">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground mb-2">
                                {pendingConfirmation.confirmationMessage}
                              </p>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => confirmActionMutation.mutate(true)}
                                  disabled={confirmActionMutation.isPending}
                                  data-testid="button-confirm-action"
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => confirmActionMutation.mutate(false)}
                                  disabled={confirmActionMutation.isPending}
                                  data-testid="button-cancel-action"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
            
            <div className="border-t p-4 bg-background">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleVoiceToggle}
                    disabled={voiceSession.isProcessing}
                    className={cn(
                      "shrink-0 transition-colors",
                      voiceSession.isRecording 
                        ? "bg-red-500 text-white hover:bg-red-600" 
                        : "hover:bg-muted"
                    )}
                    data-testid="button-voice-input"
                  >
                    {voiceSession.isProcessing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : voiceSession.isRecording ? (
                      <MicOff className="h-5 w-5" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </Button>
                  
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything or tell me what you'd like to do..."
                    className="flex-1"
                    disabled={sendMessageMutation.isPending}
                    data-testid="input-message"
                  />
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || sendMessageMutation.isPending}
                    variant="default"
                    className="shrink-0"
                    data-testid="button-send-message"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                
                {voiceSession.isRecording && (
                  <p className="text-xs text-center text-muted-foreground mt-2 animate-pulse">
                    Listening... Speak now
                  </p>
                )}
                
                {(voiceError || voiceSession.error) && (
                  <p className="text-xs text-center text-destructive mt-2">
                    {voiceError || voiceSession.error}
                  </p>
                )}
              </div>
            </div>
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={40} minSize={25}>
          <div className="h-full bg-muted/30 border-l overflow-auto">
            <ContextPanel data={contextPanel} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
