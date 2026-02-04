import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Rocket,
  Users,
  Target,
  Compass,
  Map,
  Grid3x3,
  MessageSquare,
  FileText,
  Newspaper,
  Swords,
  PlayCircle,
  CheckCircle,
  Check,
  ChevronRight,
  ChevronDown,
  Brain,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Copy,
  Download,
  Eye,
  Loader2,
  HelpCircle,
  MessageCircle,
  Star,
  User,
  Heart
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";

interface GrowthAcceleratorCanvasProps {
  projectId: number;
  accountId?: number;
  companyName: string;
}

interface QuadrantItem {
  id: string;
  text: string;
  sourceType?: string;
  sourceId?: number;
}

interface BuyerPersona {
  id?: number;
  canvasId: number;
  personaName: string;
  personaTitle: string;
  personaCompany: string;
  // Enhanced profile fields
  ageRange?: string;
  careerStage?: string;
  familyStatus?: string;
  financialSituation?: string;
  behavioralTraits?: string[];
  engagementPreferences?: string[];
  challenges?: string[];
  // 4-quadrant structure
  facts: QuadrantItem[];
  goals: QuadrantItem[];
  pains: QuadrantItem[];
  behaviours: QuadrantItem[];
  aiGenerated?: boolean;
}

// Outcome mapping for linking journey phases to target outcomes
interface OutcomeMapping {
  outcomeId: string | number;
  relevance: "primary" | "supporting";
  howAddressed: string;
}

// Sales-aligned journey phase structure (like a professional playbook)
interface JourneyPhaseData {
  description: string;
  keyConsiderations: string[];
  keyActivities: string[];
  touchpoints: string[];
  questionsToAsk: string[];
  whatGoodLooksLike: string[];
  mustCompleteBeforeNext: string[];
  blockers: { blocker: string; severity: "high" | "medium" | "low" }[];
  outcomeMapping?: OutcomeMapping[];
  // Legacy fields preserved during conversion
  emotions?: string[];
  legacyFormat?: boolean;
}

interface BuyerJourneyPhases {
  prospecting?: JourneyPhaseData;
  qualifying?: JourneyPhaseData;
  discovery?: JourneyPhaseData;
  proposing?: JourneyPhaseData;
  negotiating?: JourneyPhaseData;
  closing?: JourneyPhaseData;
}

// Legacy format for backward compatibility
interface LegacyJourneyPhase {
  phaseId: string;
  phaseName: string;
  description?: string;
  tasks?: string[];
  emotions?: string[];
  painPoints?: string[];
  decisionFactors?: string[];
  touchpoints?: string[];
}

interface BuyerJourney {
  id?: number;
  canvasId: number;
  personaId?: number;
  journeyContext: string;
  phases: BuyerJourneyPhases | LegacyJourneyPhase[];
  solutionUnblocks: { phaseId: string; howUnblocks: string }[];
  aiGenerated?: boolean;
}

interface Hypothesis {
  id?: number;
  canvasId: number;
  personaId?: number;
  buyerHypothesis: string;
  buyerHypothesisRationale: string;
  buyerHypothesisFactIds: string[];
  buyerHypothesisBehaviourIds: string[];
  problemHypothesis: string;
  problemHypothesisRationale: string;
  problemHypothesisPainIds: string[];
  problemHypothesisGoalIds: string[];
  solutionHypothesis: string;
  solutionUrl: string;
  solutionFeatures: string[];
  version: number;
}

interface Prediction {
  id?: number;
  canvasId: number;
  hypothesisId?: number;
  prediction: string;
  sourceHypothesis: string;
  impactIfWrong: string;
  confidence: string;
  isRiskyPrediction: boolean;
  experimentStatus: string;
  experimentNotes?: string;
}

interface GrowthAcceleratorCanvas {
  id?: number;
  projectId: number;
  accountId?: number;
  title: string;
  targetMarket?: string;
  targetSolution?: string;
  currentSection: string;
  currentStep: string;
  sectionCompletion: Record<string, number>;
  status: string;
}

const GA_SECTIONS = [
  { id: "what_to_know", label: "What to Know", icon: Brain, color: "blue" },
  { id: "what_to_say", label: "What to Say", icon: MessageSquare, color: "purple" },
  { id: "what_to_show", label: "What to Show", icon: Eye, color: "amber" },
  { id: "what_to_do", label: "What to Do", icon: PlayCircle, color: "emerald" },
];

const GA_STEPS = {
  what_to_know: [
    { id: "buyer_persona", label: "Buyer Persona", icon: Users, description: "4-quadrant buyer profile" },
    { id: "hypotheses", label: "Hypotheses", icon: Lightbulb, description: "Buyer, Problem, Solution hypotheses" },
    { id: "buyer_journey", label: "Buyer Journey", icon: Map, description: "5-phase journey map" },
    { id: "predictions", label: "Predictions Grid", icon: Grid3x3, description: "2x2 confidence/impact matrix" },
    { id: "interview_script", label: "Interview Script", icon: MessageSquare, description: "Validation questions" },
  ],
  what_to_say: [
    { id: "solution_tenets", label: "Solution Tenets", icon: Compass, description: "Core value propositions" },
    { id: "press_release", label: "Press Release", icon: Newspaper, description: "Future-back narrative" },
  ],
  what_to_show: [
    { id: "battle_cards", label: "Battle Cards", icon: Swords, description: "Competitive positioning" },
  ],
  what_to_do: [
    { id: "sales_actions", label: "Sales Play Actions", icon: PlayCircle, description: "Executable playbook" },
  ],
};

// Sales-aligned journey phases (like a professional seller playbook)
const JOURNEY_PHASES = [
  { id: "prospecting", name: "Prospecting", description: "Strategic identification and outreach" },
  { id: "qualifying", name: "Qualifying", description: "Validating lead fit and readiness" },
  { id: "discovery", name: "Discovery", description: "Understanding needs and motivations" },
  { id: "proposing", name: "Proposing", description: "Presenting tailored solutions" },
  { id: "negotiating", name: "Negotiating", description: "Finalizing terms and agreements" },
  { id: "closing", name: "Closing", description: "Securing sign-off and handover" },
];

interface PersonaRecommendation {
  title: string;
  reasoning: string;
  priority: "primary" | "secondary" | "tertiary";
}

interface PersonaRecommendations {
  recommendations: PersonaRecommendation[];
  dataConfidence: "high" | "medium" | "low";
  confidenceReason: string;
}

export function GrowthAcceleratorCanvas({ projectId, accountId, companyName }: GrowthAcceleratorCanvasProps) {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("what_to_know");
  const [activeStep, setActiveStep] = useState("buyer_persona");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [canvasTitle, setCanvasTitle] = useState(`${companyName} Sales Play`);
  const [selectedPersonaTitle, setSelectedPersonaTitle] = useState<string | null>(null);
  const [customPersonaTitle, setCustomPersonaTitle] = useState("");
  const [showPersonaSelector, setShowPersonaSelector] = useState(false);
  const [autoGenerationPhase, setAutoGenerationPhase] = useState<string | null>(null);
  const [autoGenerationFailed, setAutoGenerationFailed] = useState(false);
  const [aiRefinePrompt, setAiRefinePrompt] = useState("");
  const [showRefineDialog, setShowRefineDialog] = useState(false);
  const [refineTarget, setRefineTarget] = useState<{ type: string; id?: number } | null>(null);
  
  const { data: canvas, isLoading: canvasLoading, refetch: refetchCanvas } = useQuery<GrowthAcceleratorCanvas>({
    queryKey: ["/api/projects", projectId, "growth-accelerator/canvases"],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/growth-accelerator/canvases`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch canvas");
      const canvases = await res.json();
      return canvases?.[0] || null;
    },
  });

  const { data: persona, isLoading: personaLoading, refetch: refetchPersona } = useQuery<BuyerPersona>({
    queryKey: ["/api/growth-accelerator/canvases", canvas?.id, "personas"],
    enabled: !!canvas?.id,
    queryFn: async () => {
      const res = await fetch(`/api/growth-accelerator/canvases/${canvas!.id}/personas`);
      if (!res.ok) return null;
      const personas = await res.json();
      return personas?.[0] || null;
    },
  });

  const { data: journey, isLoading: journeyLoading, refetch: refetchJourney } = useQuery<BuyerJourney>({
    queryKey: ["/api/growth-accelerator/canvases", canvas?.id, "journeys"],
    enabled: !!canvas?.id,
    queryFn: async () => {
      const res = await fetch(`/api/growth-accelerator/canvases/${canvas!.id}/journeys`);
      if (!res.ok) return null;
      const journeys = await res.json();
      return journeys?.[0] || null;
    },
  });

  const { data: hypotheses, refetch: refetchHypotheses } = useQuery<Hypothesis[]>({
    queryKey: ["/api/growth-accelerator/canvases", canvas?.id, "hypotheses"],
    enabled: !!canvas?.id,
    queryFn: async () => {
      const res = await fetch(`/api/growth-accelerator/canvases/${canvas!.id}/hypotheses`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: predictions, refetch: refetchPredictions } = useQuery<Prediction[]>({
    queryKey: ["/api/growth-accelerator/canvases", canvas?.id, "predictions"],
    enabled: !!canvas?.id,
    queryFn: async () => {
      const res = await fetch(`/api/growth-accelerator/canvases/${canvas!.id}/predictions`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: projectInsights } = useQuery<any[]>({
    queryKey: ["/api/projects", projectId, "insights"],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/insights`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: discoveryNotes } = useQuery<any[]>({
    queryKey: ["/api/projects", projectId, "notes"],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/notes`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createCanvasMutation = useMutation({
    mutationFn: async (data: Partial<GrowthAcceleratorCanvas>) => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/growth-accelerator/canvases`, data);
      return res.json();
    },
    onSuccess: () => {
      refetchCanvas();
      setShowCreateDialog(false);
      toast({
        title: "Canvas Created",
        description: "Your Growth Accelerator canvas is ready to build.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create canvas.",
        variant: "destructive",
      });
    },
  });

  const recommendPersonasMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/growth-accelerator/canvases/${canvas!.id}/recommend-personas`, {
        projectId,
        companyName,
      });
      return res.json() as Promise<PersonaRecommendations>;
    },
    onSuccess: (data) => {
      if (data.recommendations?.length > 0) {
        const primaryRec = data.recommendations[0];
        setSelectedPersonaTitle(primaryRec.title);
        
        // If in auto-generation mode, automatically generate with the primary recommendation
        if (autoGenerationPhase === "persona") {
          generatePersonaMutation.mutate({ selectedTitle: primaryRec.title });
        } else {
          // Manual mode - show selector dialog
          setShowPersonaSelector(true);
        }
      } else {
        setShowPersonaSelector(true);
      }
    },
    onError: () => {
      setAutoGenerationPhase(null);
      setAutoGenerationFailed(true);
      toast({
        title: "Error",
        description: "Failed to get persona recommendations. Click 'Generate Persona' to try again.",
        variant: "destructive",
      });
    },
  });

  const generatePersonaMutation = useMutation({
    mutationFn: async (params?: { selectedTitle?: string; customTitle?: string }) => {
      const res = await apiRequest("POST", `/api/growth-accelerator/canvases/${canvas!.id}/generate-persona`, {
        projectId,
        companyName,
        selectedTitle: params?.selectedTitle || selectedPersonaTitle,
        customTitle: params?.customTitle || customPersonaTitle || undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      refetchPersona();
      setShowPersonaSelector(false);
      setSelectedPersonaTitle(null);
      setCustomPersonaTitle("");
      toast({
        title: "Persona Generated",
        description: "AI has created a buyer persona based on your discovery data.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate persona.",
        variant: "destructive",
      });
    },
  });

  const resetPersonaMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/growth-accelerator/canvases/${canvas!.id}/personas`);
      return res.json();
    },
    onSuccess: () => {
      refetchPersona();
      refetchHypotheses();
      refetchJourney();
      refetchPredictions();
      setShowPersonaSelector(false);
      setSelectedPersonaTitle(null);
      setCustomPersonaTitle("");
      toast({
        title: "Persona Reset",
        description: "Persona and related data have been cleared. You can now generate a new persona.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reset persona.",
        variant: "destructive",
      });
    },
  });

  const generateJourneyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/growth-accelerator/canvases/${canvas!.id}/generate-journey`, {
        projectId,
        personaId: persona?.id,
      });
      return res.json();
    },
    onSuccess: () => {
      refetchJourney();
      toast({
        title: "Journey Generated",
        description: "AI has mapped the buyer journey based on persona insights.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate journey.",
        variant: "destructive",
      });
    },
  });

  // Hypotheses generation mutation
  const generateHypothesesMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/growth-accelerator/canvases/${canvas!.id}/generate-hypotheses`, {
        projectId,
        personaId: persona?.id,
      });
      return res.json();
    },
    onSuccess: () => {
      refetchHypotheses();
      toast({
        title: "Hypotheses Generated",
        description: "AI has created buyer, problem, and solution hypotheses.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate hypotheses.",
        variant: "destructive",
      });
    },
  });

  // Predictions generation mutation  
  const generatePredictionsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/growth-accelerator/canvases/${canvas!.id}/generate-predictions`, {
        projectId,
        hypothesisId: hypotheses?.[0]?.id,
      });
      return res.json();
    },
    onSuccess: () => {
      refetchPredictions();
      toast({
        title: "Predictions Generated",
        description: "AI has created a predictions matrix based on your hypotheses.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate predictions.",
        variant: "destructive",
      });
    },
  });

  // Additional queries for GA data
  const { data: interviewScripts, refetch: refetchInterviewScripts } = useQuery<any[]>({
    queryKey: ["/api/growth-accelerator/canvases", canvas?.id, "interview-scripts"],
    queryFn: () => canvas?.id ? fetch(`/api/growth-accelerator/canvases/${canvas.id}/interview-scripts`).then(r => r.json()) : Promise.resolve([]),
    enabled: !!canvas?.id,
  });

  const { data: battleCards, refetch: refetchBattleCards } = useQuery<any[]>({
    queryKey: ["/api/growth-accelerator/canvases", canvas?.id, "battle-cards"],
    queryFn: () => canvas?.id ? fetch(`/api/growth-accelerator/canvases/${canvas.id}/battle-cards`).then(r => r.json()) : Promise.resolve([]),
    enabled: !!canvas?.id,
  });

  const { data: tenets, refetch: refetchTenets } = useQuery<any>({
    queryKey: ["/api/growth-accelerator/canvases", canvas?.id, "solution-tenets"],
    queryFn: () => canvas?.id ? fetch(`/api/growth-accelerator/canvases/${canvas.id}/solution-tenets`).then(r => r.json()) : Promise.resolve(null),
    enabled: !!canvas?.id,
  });

  const { data: pressRelease, refetch: refetchPressRelease } = useQuery<any>({
    queryKey: ["/api/growth-accelerator/canvases", canvas?.id, "press-release"],
    queryFn: () => canvas?.id ? fetch(`/api/growth-accelerator/canvases/${canvas.id}/press-release`).then(r => r.json()) : Promise.resolve(null),
    enabled: !!canvas?.id,
  });

  const { data: salesActions, refetch: refetchSalesActions } = useQuery<any>({
    queryKey: ["/api/growth-accelerator/canvases", canvas?.id, "actions"],
    queryFn: () => canvas?.id ? fetch(`/api/growth-accelerator/canvases/${canvas.id}/actions`).then(r => r.json()) : Promise.resolve(null),
    enabled: !!canvas?.id,
  });

  // New AI generation mutations
  const generateInterviewScriptMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/growth-accelerator/canvases/${canvas?.id}/generate-interview-script`, {
      projectId,
      personaId: persona?.id,
    }),
    onSuccess: () => {
      refetchInterviewScripts();
      toast({ title: "Interview Script Generated", description: "AI has created a discovery interview script." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate interview script.", variant: "destructive" });
    },
  });

  const generateBattleCardMutation = useMutation({
    mutationFn: (competitorName: string) => apiRequest("POST", `/api/growth-accelerator/canvases/${canvas?.id}/generate-battle-cards`, {
      projectId,
      competitorName,
    }),
    onSuccess: () => {
      refetchBattleCards();
      toast({ title: "Battle Card Generated", description: "AI has created competitive battle cards with live market intelligence." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate battle cards.", variant: "destructive" });
    },
  });

  const generateTenetsMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/growth-accelerator/canvases/${canvas?.id}/generate-tenets`, { projectId }),
    onSuccess: () => {
      refetchTenets();
      toast({ title: "Solution Tenets Generated", description: "AI has created customer-centric design principles." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate tenets.", variant: "destructive" });
    },
  });

  const generatePressReleaseMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/growth-accelerator/canvases/${canvas?.id}/generate-press-release`, { projectId }),
    onSuccess: () => {
      refetchPressRelease();
      toast({ title: "Press Release Generated", description: "AI has created a Working Backwards press release." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate press release.", variant: "destructive" });
    },
  });

  const generateSalesActionsMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/growth-accelerator/canvases/${canvas?.id}/generate-sales-actions`, { projectId }),
    onSuccess: () => {
      refetchSalesActions();
      toast({ title: "Sales Actions Generated", description: "AI has created a prioritized action plan." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate sales actions.", variant: "destructive" });
    },
  });

  // AI refinement mutation - refines content based on user prompt
  const refineContentMutation = useMutation({
    mutationFn: async ({ type, id, prompt }: { type: string; id?: number; prompt: string }) => {
      const res = await apiRequest("POST", `/api/growth-accelerator/canvases/${canvas?.id}/refine`, {
        type,
        itemId: id,
        prompt,
        projectId,
      });
      return res.json();
    },
    onSuccess: () => {
      // Refetch based on content type
      if (refineTarget?.type === "persona") refetchPersona();
      if (refineTarget?.type === "hypotheses") refetchHypotheses();
      if (refineTarget?.type === "journey") refetchJourney();
      if (refineTarget?.type === "predictions") refetchPredictions();
      
      setShowRefineDialog(false);
      setAiRefinePrompt("");
      setRefineTarget(null);
      toast({
        title: "Content Refined",
        description: "AI has updated the content based on your feedback.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to refine content.",
        variant: "destructive",
      });
    },
  });

  // Auto-generation flow: when canvas exists but no persona, auto-generate
  useEffect(() => {
    if (
      canvas?.id && 
      !personaLoading && 
      persona === null && 
      !generatePersonaMutation.isPending &&
      !recommendPersonasMutation.isPending &&
      !autoGenerationPhase &&
      !autoGenerationFailed // Don't retry if previously failed
    ) {
      setAutoGenerationPhase("persona");
      toast({
        title: "Generating Sales Play",
        description: "AI is analyzing discovery data to create your buyer persona...",
      });
      recommendPersonasMutation.mutate();
    }
  }, [canvas?.id, personaLoading, persona, generatePersonaMutation.isPending, recommendPersonasMutation.isPending, autoGenerationPhase, autoGenerationFailed]);

  // Chain generation: after persona created, auto-generate hypotheses
  useEffect(() => {
    if (
      persona && 
      autoGenerationPhase === "persona" &&
      !generateHypothesesMutation.isPending &&
      (!hypotheses || hypotheses.length === 0)
    ) {
      setAutoGenerationPhase("hypotheses");
      toast({
        title: "Generating Hypotheses",
        description: "AI is creating buyer, problem, and solution hypotheses...",
      });
      generateHypothesesMutation.mutate();
    }
  }, [persona, autoGenerationPhase, hypotheses, generateHypothesesMutation.isPending]);

  // Chain generation: after hypotheses created, auto-generate journey
  useEffect(() => {
    if (
      hypotheses && 
      hypotheses.length > 0 && 
      autoGenerationPhase === "hypotheses" &&
      !generateJourneyMutation.isPending &&
      !journey
    ) {
      setAutoGenerationPhase("journey");
      toast({
        title: "Generating Buyer Journey",
        description: "AI is mapping the buyer journey with outcome linkages...",
      });
      generateJourneyMutation.mutate();
    }
  }, [hypotheses, autoGenerationPhase, journey, generateJourneyMutation.isPending]);

  // Chain generation: after journey created, auto-generate predictions
  useEffect(() => {
    if (
      journey && 
      autoGenerationPhase === "journey" &&
      !generatePredictionsMutation.isPending &&
      (!predictions || predictions.length === 0)
    ) {
      setAutoGenerationPhase("predictions");
      toast({
        title: "Generating Predictions",
        description: "AI is creating a predictions matrix...",
      });
      generatePredictionsMutation.mutate();
    }
  }, [journey, autoGenerationPhase, predictions, generatePredictionsMutation.isPending]);

  // Chain generation: after predictions created, auto-generate interview script
  useEffect(() => {
    if (
      predictions && 
      predictions.length > 0 && 
      autoGenerationPhase === "predictions" &&
      !generateInterviewScriptMutation.isPending &&
      (!interviewScripts || interviewScripts.length === 0)
    ) {
      setAutoGenerationPhase("interview");
      toast({
        title: "Generating Interview Script",
        description: "AI is creating discovery interview questions...",
      });
      generateInterviewScriptMutation.mutate();
    }
  }, [predictions, autoGenerationPhase, interviewScripts, generateInterviewScriptMutation.isPending]);

  // Chain generation: after interview script created, auto-generate tenets
  useEffect(() => {
    // Check if tenets is null, undefined, or empty array - need to generate
    const needsTenets = tenets === null || tenets === undefined || (Array.isArray(tenets) && tenets.length === 0);
    if (
      interviewScripts && 
      interviewScripts.length > 0 && 
      autoGenerationPhase === "interview" &&
      !generateTenetsMutation.isPending &&
      needsTenets
    ) {
      setAutoGenerationPhase("tenets");
      toast({
        title: "Generating Solution Tenets",
        description: "AI is creating customer-centric design principles...",
      });
      generateTenetsMutation.mutate();
    }
  }, [interviewScripts, autoGenerationPhase, tenets, generateTenetsMutation.isPending]);

  // Chain generation: after tenets created, auto-generate press release
  useEffect(() => {
    // Check if tenets has content (object with properties or non-empty array)
    const hasTenets = tenets && (Array.isArray(tenets) ? tenets.length > 0 : Object.keys(tenets).length > 0);
    // Check if press release needs generation
    const needsPressRelease = pressRelease === null || pressRelease === undefined;
    if (
      hasTenets && 
      autoGenerationPhase === "tenets" &&
      !generatePressReleaseMutation.isPending &&
      needsPressRelease
    ) {
      setAutoGenerationPhase("press_release");
      toast({
        title: "Generating Press Release",
        description: "AI is creating a Working Backwards press release...",
      });
      generatePressReleaseMutation.mutate();
    }
  }, [tenets, autoGenerationPhase, pressRelease, generatePressReleaseMutation.isPending]);

  // Chain generation: after press release created, auto-generate sales actions
  useEffect(() => {
    // Check if press release has content
    const hasPressRelease = pressRelease && Object.keys(pressRelease).length > 0;
    // Check if sales actions needs generation
    const needsSalesActions = salesActions === null || salesActions === undefined || 
      (typeof salesActions === 'object' && Object.keys(salesActions).length === 0);
    if (
      hasPressRelease && 
      autoGenerationPhase === "press_release" &&
      !generateSalesActionsMutation.isPending &&
      needsSalesActions
    ) {
      setAutoGenerationPhase("actions");
      toast({
        title: "Generating Sales Actions",
        description: "AI is creating a prioritized action plan...",
      });
      generateSalesActionsMutation.mutate();
    }
  }, [pressRelease, autoGenerationPhase, salesActions, generateSalesActionsMutation.isPending]);

  // Complete auto-generation phase after all sections generated
  useEffect(() => {
    const hasSalesActions = salesActions && typeof salesActions === 'object' && Object.keys(salesActions).length > 0;
    if (hasSalesActions && autoGenerationPhase === "actions") {
      setAutoGenerationPhase(null);
      toast({
        title: "Sales Play Complete",
        description: "Full framework generated: Persona, Hypotheses, Journey, Predictions, Interview Script, Tenets, Press Release, and Action Plan. Review and refine as needed.",
      });
    }
  }, [salesActions, autoGenerationPhase]);

  const getSectionCompletion = (sectionId: string): number => {
    if (!canvas?.sectionCompletion) return 0;
    return canvas.sectionCompletion[sectionId] || 0;
  };

  const getCurrentSteps = () => {
    return GA_STEPS[activeSection as keyof typeof GA_STEPS] || [];
  };

  const handleCreateCanvas = () => {
    createCanvasMutation.mutate({
      projectId,
      accountId,
      title: canvasTitle,
      currentSection: "what_to_know",
      currentStep: "buyer_persona",
      sectionCompletion: {},
      status: "draft",
    });
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!canvas) return;
    setIsExporting(true);
    
    try {
      const doc = new jsPDF();
      let yPos = 20;
      const leftMargin = 20;
      const pageWidth = 170;
      const lineHeight = 6;

      // Korn Ferry brand colors for PDF
      const KF_FOREST = [0, 99, 79] as const;    // #00634F
      const KF_OCEAN = [0, 89, 113] as const;    // #005971
      const KF_EMERALD = [0, 155, 119] as const; // #009B77
      const KF_NAVY = [0, 23, 59] as const;      // #00173B
      const BLACK = [0, 0, 0] as const;
      
      const addTitle = (text: string, size: number = 16) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...KF_FOREST);
        doc.text(text, leftMargin, yPos);
        doc.setTextColor(...BLACK);
        yPos += lineHeight + 2;
      };

      const addSubtitle = (text: string) => {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...KF_OCEAN);
        doc.text(text, leftMargin, yPos);
        doc.setTextColor(...BLACK);
        yPos += lineHeight;
      };

      const addText = (text: string, indent: number = 0) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(text, pageWidth - indent);
        if (yPos + (lines.length * lineHeight) > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(lines, leftMargin + indent, yPos);
        yPos += lines.length * lineHeight + 2;
      };

      const checkPageBreak = (neededSpace: number = 30) => {
        if (yPos + neededSpace > 280) {
          doc.addPage();
          yPos = 20;
        }
      };

      addTitle(`${canvas.title} - Sales Play`, 18);
      addText(`Company: ${companyName}`);
      addText(`Created: ${new Date().toLocaleDateString()}`);
      yPos += 10;

      if (persona) {
        checkPageBreak(60);
        addTitle("1. BUYER PERSONA", 14);
        if (persona.personaName) addText(`Name: ${persona.personaName}`);
        if (persona.personaTitle) addText(`Title: ${persona.personaTitle}`);
        if (persona.personaCompany) addText(`Company: ${persona.personaCompany}`);
        
        const facts = persona.facts || [];
        const goals = persona.goals || [];
        const pains = persona.pains || [];
        const behaviours = persona.behaviours || [];
        
        if (facts.length) {
          addSubtitle("Facts (What They Know)");
          facts.forEach((item: any) => addText(`- ${typeof item === 'string' ? item : (item.text || '')}`, 5));
        }
        if (goals.length) {
          addSubtitle("Goals (What They Want)");
          goals.forEach((item: any) => addText(`- ${typeof item === 'string' ? item : (item.text || '')}`, 5));
        }
        if (pains.length) {
          addSubtitle("Pains (Challenges)");
          pains.forEach((item: any) => addText(`- ${typeof item === 'string' ? item : (item.text || '')}`, 5));
        }
        if (behaviours.length) {
          addSubtitle("Behaviours (What They Do)");
          behaviours.forEach((item: any) => addText(`- ${typeof item === 'string' ? item : (item.text || '')}`, 5));
        }
        yPos += 8;
      }

      if (hypotheses?.length) {
        checkPageBreak(60);
        addTitle("2. HYPOTHESES", 14);
        hypotheses.forEach((h: any, idx: number) => {
          addSubtitle(`Hypothesis ${idx + 1}`);
          if (h.buyerHypothesis) {
            addText(`Buyer Hypothesis: ${h.buyerHypothesis}`);
            if (h.buyerHypothesisRationale) addText(`  Rationale: ${h.buyerHypothesisRationale}`, 5);
          }
          if (h.problemHypothesis) {
            addText(`Problem Hypothesis: ${h.problemHypothesis}`);
            if (h.problemHypothesisRationale) addText(`  Rationale: ${h.problemHypothesisRationale}`, 5);
          }
          if (h.solutionHypothesis) {
            addText(`Solution Hypothesis: ${h.solutionHypothesis}`);
          }
        });
        yPos += 8;
      }

      if (journey && journey.phases) {
        checkPageBreak(60);
        addTitle("3. BUYER JOURNEY", 14);
        if (journey.journeyContext) addText(`Context: ${journey.journeyContext}`);
        
        // Handle both new object format and legacy array format
        type ProcessedPhase = { phaseName: string } & Partial<JourneyPhaseData> & { [key: string]: any };
        let phasesToProcess: ProcessedPhase[] = [];
        
        if (Array.isArray(journey.phases)) {
          // Legacy array format
          phasesToProcess = journey.phases.map((p: LegacyJourneyPhase) => ({ ...p, phaseName: p.phaseName }));
        } else {
          // New object format - only include phases that exist
          JOURNEY_PHASES.forEach(p => {
            const phaseObj = (journey.phases as BuyerJourneyPhases)[p.id as keyof BuyerJourneyPhases];
            if (phaseObj) {
              phasesToProcess.push({ ...phaseObj, phaseName: p.name });
            }
          });
        }
        
        phasesToProcess.forEach((phase) => {
          addSubtitle(phase.phaseName || 'Phase');
          // New format fields
          if (phase.keyActivities?.length) {
            addText("Key Activities:");
            phase.keyActivities.forEach((t: string) => addText(`- ${t}`, 5));
          }
          if (phase.questionsToAsk?.length) {
            addText("Questions to Ask:");
            phase.questionsToAsk.forEach((q: string) => addText(`- "${q}"`, 5));
          }
          if (phase.whatGoodLooksLike?.length) {
            addText(`What Good Looks Like: ${phase.whatGoodLooksLike.join(", ")}`);
          }
          // Legacy format fields (for backward compatibility)
          if (phase.tasks?.length) {
            addText("Tasks:");
            phase.tasks.forEach((t: string) => addText(`- ${t}`, 5));
          }
          if (phase.painPoints?.length) {
            addText(`Pain Points: ${phase.painPoints.join(", ")}`);
          }
          if (phase.emotions?.length) {
            addText(`Emotions: ${phase.emotions.join(", ")}`);
          }
          if (phase.decisionFactors?.length) {
            addText(`Decision Factors: ${phase.decisionFactors.join(", ")}`);
          }
          // Add outcome mapping to PDF with KF branding
          if (phase.outcomeMapping?.length) {
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...KF_FOREST);
            doc.text("Target Outcomes:", leftMargin, yPos);
            doc.setTextColor(...BLACK);
            yPos += lineHeight;
            phase.outcomeMapping.forEach((mapping: OutcomeMapping) => {
              const label = mapping.relevance === 'primary' ? '[PRIMARY]' : '[SUPPORTING]';
              doc.setFontSize(9);
              doc.setFont("helvetica", "bold");
              if (mapping.relevance === 'primary') {
                doc.setTextColor(...KF_EMERALD);
              } else {
                doc.setTextColor(...KF_OCEAN);
              }
              doc.text(label, leftMargin + 5, yPos);
              const labelWidth = doc.getTextWidth(label) + 2;
              doc.setFont("helvetica", "normal");
              doc.setTextColor(...BLACK);
              const descLines = doc.splitTextToSize(mapping.howAddressed, pageWidth - 10 - labelWidth);
              doc.text(descLines, leftMargin + 5 + labelWidth, yPos);
              yPos += descLines.length * lineHeight + 1;
            });
          }
        });
        yPos += 8;
      }

      if (predictions?.length) {
        checkPageBreak(40);
        addTitle("4. PREDICTIONS MATRIX", 14);
        predictions.forEach((p: any) => {
          const predText = p.prediction || '';
          if (predText) {
            addText(`- ${predText}`);
            if (p.impactIfWrong) addText(`  Impact if Wrong: ${p.impactIfWrong}`, 5);
            if (p.confidence) addText(`  Confidence: ${p.confidence}`, 5);
            if (p.isRiskyPrediction) addText(`  [RISKY PREDICTION]`, 5);
          }
        });
        yPos += 8;
      }

      if (interviewScripts?.length) {
        checkPageBreak(40);
        addTitle("5. INTERVIEW QUESTIONS", 14);
        interviewScripts.forEach((script: any) => {
          if (script.questions?.length) {
            script.questions.forEach((q: any, idx: number) => {
              addText(`${idx + 1}. ${q.question || q}`);
            });
          }
        });
        yPos += 8;
      }

      if (tenets) {
        checkPageBreak(40);
        addTitle("6. SOLUTION TENETS", 14);
        const tenetsData = tenets.tenets || [];
        tenetsData.forEach((t: any, idx: number) => {
          addText(`${idx + 1}. ${t.title || t.tenet || t}`);
          if (t.description) addText(`   ${t.description}`, 5);
        });
        yPos += 8;
      }

      if (pressRelease) {
        checkPageBreak(60);
        addTitle("7. PRESS RELEASE", 14);
        if (pressRelease.headline) addSubtitle(pressRelease.headline);
        if (pressRelease.subHeadline) addText(pressRelease.subHeadline);
        if (pressRelease.body) addText(pressRelease.body);
        if (pressRelease.customerQuote) {
          addSubtitle("Customer Quote:");
          addText(pressRelease.customerQuote);
        }
        yPos += 8;
      }

      if (battleCards?.length) {
        checkPageBreak(60);
        addTitle("8. COMPETITIVE BATTLE CARDS", 14);
        battleCards.forEach((card: any) => {
          const compName = card.competitorName || 'Competitor';
          addSubtitle(`vs. ${compName}`);
          if (card.companyOverview) addText(card.companyOverview);
          const strengths = card.strengths || [];
          if (strengths.length) {
            addText("Strengths:");
            strengths.forEach((s: any) => addText(`- ${typeof s === 'string' ? s : (s.text || '')}`, 5));
          }
          const weaknesses = card.weaknesses || [];
          if (weaknesses.length) {
            addText("Weaknesses:");
            weaknesses.forEach((w: any) => addText(`- ${typeof w === 'string' ? w : (w.text || '')}`, 5));
          }
          const diffs = card.differentiators || card.ourDifferentiators || [];
          if (diffs.length) {
            addText("Our Differentiators:");
            diffs.forEach((d: any) => addText(`- ${typeof d === 'string' ? d : (d.text || '')}`, 5));
          }
        });
        yPos += 8;
      }

      if (salesActions) {
        checkPageBreak(60);
        addTitle("9. SALES ACTIONS", 14);
        const actions = salesActions.actions || salesActions;
        const immediate = actions.immediateActions || actions.immediate || [];
        const shortTerm = actions.shortTermActions || actions.shortTerm || [];
        const mediumTerm = actions.mediumTermActions || actions.mediumTerm || [];
        
        if (immediate.length) {
          addSubtitle("Immediate Actions (This Week)");
          immediate.forEach((a: any) => addText(`- ${typeof a === 'string' ? a : (a.action || a.text || '')}`, 5));
        }
        if (shortTerm.length) {
          addSubtitle("Short-Term Actions (This Month)");
          shortTerm.forEach((a: any) => addText(`- ${typeof a === 'string' ? a : (a.action || a.text || '')}`, 5));
        }
        if (mediumTerm.length) {
          addSubtitle("Medium-Term Actions (This Quarter)");
          mediumTerm.forEach((a: any) => addText(`- ${typeof a === 'string' ? a : (a.action || a.text || '')}`, 5));
        }
      }

      const fileName = `${companyName.replace(/\s+/g, '_')}_Sales_Play_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      toast({ title: "PDF Exported", description: `Sales play document saved as ${fileName}` });
    } catch (error) {
      toast({ title: "Export Failed", description: "Could not generate PDF", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  if (canvasLoading) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!canvas) {
    return (
      <Card className="border-dashed border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-purple-500/5 to-amber-500/5">
        <CardContent className="py-12">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
              <Rocket className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Growth Accelerator</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Build buyer-centric sales plays using Amazon's Working Backwards methodology. 
                Transform your discovery insights into actionable selling frameworks.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 my-4">
              {GA_SECTIONS.map((section) => {
                const SectionIcon = section.icon;
                return (
                  <Badge key={section.id} variant="outline" className="gap-1.5 py-1.5 px-3">
                    <SectionIcon className="w-3.5 h-3.5" />
                    {section.label}
                  </Badge>
                );
              })}
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2" data-testid="button-create-ga-canvas">
                  <Rocket className="w-4 h-4" />
                  Start Sales Play Builder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-primary" />
                    Create Sales Play Canvas
                  </DialogTitle>
                  <DialogDescription>
                    Initialize your Growth Accelerator canvas to build buyer-centric sales plays.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="canvas-title">Canvas Title</Label>
                    <Input
                      id="canvas-title"
                      value={canvasTitle}
                      onChange={(e) => setCanvasTitle(e.target.value)}
                      placeholder="e.g., Enterprise Leadership Development Play"
                      data-testid="input-canvas-title"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateCanvas}
                    disabled={createCanvasMutation.isPending}
                    data-testid="button-confirm-create-canvas"
                  >
                    {createCanvasMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Canvas
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderBuyerPersona = () => {
    if (personaLoading) {
      return (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      );
    }

    if (!persona) {
      const recommendations = recommendPersonasMutation.data?.recommendations || [];
      const dataConfidence = recommendPersonasMutation.data?.dataConfidence;
      const confidenceReason = recommendPersonasMutation.data?.confidenceReason;

      return (
        <Card className="border-dashed">
          <CardContent className="py-8 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Generate Buyer Persona</h4>
              <p className="text-sm text-muted-foreground max-w-sm">
                AI will analyze your discovery data and recommend buyer personas, 
                or you can specify a custom target buyer.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="gap-1">
                <Sparkles className="w-3 h-3" />
                {projectInsights?.length || 0} insights available
              </Badge>
              <Badge variant="outline" className="gap-1">
                <FileText className="w-3 h-3" />
                {discoveryNotes?.length || 0} notes available
              </Badge>
            </div>

            {showPersonaSelector ? (
              <div className="w-full max-w-md space-y-4 text-left">
                {dataConfidence && (
                  <div className={`text-xs p-2 rounded-lg ${
                    dataConfidence === 'high' ? 'bg-emerald-500/10 text-emerald-600' :
                    dataConfidence === 'medium' ? 'bg-amber-500/10 text-amber-600' :
                    'bg-red-500/10 text-red-600'
                  }`}>
                    <span className="font-medium capitalize">{dataConfidence} confidence:</span> {confidenceReason}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select a recommended persona:</label>
                  {recommendations.map((rec, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        setSelectedPersonaTitle(rec.title);
                        setCustomPersonaTitle("");
                      }}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedPersonaTitle === rec.title && !customPersonaTitle
                          ? 'border-blue-500 bg-blue-500/5' 
                          : 'border-border hover:border-blue-500/50'
                      }`}
                      data-testid={`persona-option-${idx}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{rec.title}</span>
                        </div>
                        <Badge variant="outline" className={`text-xs ${
                          rec.priority === 'primary' ? 'text-blue-600 border-blue-500/30' :
                          rec.priority === 'secondary' ? 'text-purple-600 border-purple-500/30' :
                          'text-muted-foreground'
                        }`}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{rec.reasoning}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Or enter a custom buyer title:</label>
                  <input
                    type="text"
                    value={customPersonaTitle}
                    onChange={(e) => {
                      setCustomPersonaTitle(e.target.value);
                      if (e.target.value) setSelectedPersonaTitle(null);
                    }}
                    placeholder="e.g., Chief Financial Officer"
                    className="w-full p-2 text-sm border rounded-lg bg-background"
                    data-testid="input-custom-persona-title"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowPersonaSelector(false);
                      setSelectedPersonaTitle(null);
                      setCustomPersonaTitle("");
                    }}
                    data-testid="button-cancel-persona"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => generatePersonaMutation.mutate({
                      selectedTitle: selectedPersonaTitle || undefined,
                      customTitle: customPersonaTitle || undefined,
                    })}
                    disabled={generatePersonaMutation.isPending || (!selectedPersonaTitle && !customPersonaTitle)}
                    className="gap-2 flex-1"
                    data-testid="button-confirm-generate-persona"
                  >
                    {generatePersonaMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4" />
                    )}
                    Generate Persona
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => recommendPersonasMutation.mutate()}
                  disabled={recommendPersonasMutation.isPending}
                  className="gap-2"
                  data-testid="button-recommend-personas"
                >
                  {recommendPersonasMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Get AI Recommendations
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowPersonaSelector(true);
                  }}
                  className="gap-2"
                  data-testid="button-manual-persona"
                >
                  <Users className="w-4 h-4" />
                  Enter Custom Persona
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    const quadrants = [
      { id: "facts", label: "Facts", icon: FileText, items: persona.facts || [], color: "blue", description: "What we know about this buyer" },
      { id: "goals", label: "Goals", icon: Target, items: persona.goals || [], color: "emerald", description: "What they're trying to achieve" },
      { id: "pains", label: "Pains", icon: AlertTriangle, items: persona.pains || [], color: "red", description: "Obstacles and frustrations" },
      { id: "behaviours", label: "Behaviours", icon: Users, items: persona.behaviours || [], color: "purple", description: "How they make decisions" },
    ];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{persona.personaName || "Buyer Persona"}</h3>
              <p className="text-sm text-muted-foreground">
                {persona.personaTitle} at {persona.personaCompany || companyName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {persona.aiGenerated && (
              <Badge variant="outline" className="gap-1 text-purple-600 border-purple-500/30 bg-purple-500/5">
                <Sparkles className="w-3 h-3" />
                AI Generated
              </Badge>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setRefineTarget({ type: "persona", id: persona.id });
                setShowRefineDialog(true);
              }}
              className="gap-1"
              style={{ borderColor: 'hsl(var(--kf-emerald) / 0.5)', color: 'hsl(var(--kf-forest))' }}
              data-testid="button-refine-persona"
            >
              <MessageSquare className="w-3 h-3" />
              Refine with AI
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => resetPersonaMutation.mutate()}
              disabled={resetPersonaMutation.isPending}
              className="gap-1 text-red-600 border-red-500/30 hover:bg-red-500/10"
              data-testid="button-reset-persona"
            >
              {resetPersonaMutation.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              Reset
            </Button>
          </div>
        </div>

        {/* Enhanced Profile Section */}
        {(persona.ageRange || persona.careerStage || persona.behavioralTraits?.length) && (
          <Card className="border-slate-500/20 bg-slate-500/5 mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-slate-600" />
                Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {persona.ageRange && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Age Range</p>
                    <p className="text-sm">{persona.ageRange}</p>
                  </div>
                )}
                {persona.careerStage && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Career Stage</p>
                    <p className="text-sm">{persona.careerStage}</p>
                  </div>
                )}
                {persona.familyStatus && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Family Status</p>
                    <p className="text-sm">{persona.familyStatus}</p>
                  </div>
                )}
                {persona.financialSituation && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Financial Focus</p>
                    <p className="text-sm">{persona.financialSituation}</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {persona.behavioralTraits && persona.behavioralTraits.length > 0 && (
                  <div className="border-l-2 border-slate-400 pl-3">
                    <p className="text-xs text-muted-foreground font-semibold mb-2 uppercase tracking-wide">Behavioral Traits</p>
                    <ul className="space-y-1">
                      {persona.behavioralTraits.map((trait, idx) => (
                        <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                          <span className="text-slate-400 mt-1">•</span>
                          <span>{typeof trait === 'object' && trait !== null ? (trait as any).text || JSON.stringify(trait) : String(trait)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {persona.engagementPreferences && persona.engagementPreferences.length > 0 && (
                  <div className="border-l-2 border-blue-400 pl-3">
                    <p className="text-xs text-muted-foreground font-semibold mb-2 uppercase tracking-wide">Engagement Preferences</p>
                    <ul className="space-y-1">
                      {persona.engagementPreferences.map((pref, idx) => (
                        <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>{typeof pref === 'object' && pref !== null ? (pref as any).text || JSON.stringify(pref) : String(pref)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {persona.challenges && persona.challenges.length > 0 && (
                  <div className="border-l-2 border-amber-400 pl-3">
                    <p className="text-xs text-muted-foreground font-semibold mb-2 uppercase tracking-wide">Key Challenges</p>
                    <ul className="space-y-1">
                      {persona.challenges.map((challenge, idx) => (
                        <li key={idx} className="text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
                          <span className="text-amber-400 mt-1">•</span>
                          <span>{typeof challenge === 'object' && challenge !== null ? (challenge as any).text || JSON.stringify(challenge) : String(challenge)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-4">
          {quadrants.map((quadrant) => {
            const QuadrantIcon = quadrant.icon;
            const colorClasses: Record<string, string> = {
              blue: "border-blue-500/30 bg-blue-500/5",
              emerald: "border-emerald-500/30 bg-emerald-500/5",
              red: "border-red-500/30 bg-red-500/5",
              purple: "border-purple-500/30 bg-purple-500/5",
            };
            const iconColors: Record<string, string> = {
              blue: "text-blue-600 bg-blue-500/10",
              emerald: "text-emerald-600 bg-emerald-500/10",
              red: "text-red-600 bg-red-500/10",
              purple: "text-purple-600 bg-purple-500/10",
            };
            
            // WBT recommended counts
            const recommendedCounts: Record<string, string> = {
              facts: "20-25 recommended",
              goals: "5-8 recommended",
              pains: "4-6 recommended",
              behaviours: "3-5 recommended",
            };
            
            // Helper to render origin badge for Goals
            const renderOriginBadge = (origin?: string) => {
              if (!origin) return null;
              const colors: Record<string, string> = {
                social: "bg-pink-500/10 text-pink-600 border-pink-500/30",
                emotional: "bg-amber-500/10 text-amber-600 border-amber-500/30",
                functional: "bg-blue-500/10 text-blue-600 border-blue-500/30",
              };
              return (
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${colors[origin] || ''}`}>
                  {origin.charAt(0).toUpperCase() + origin.slice(1)}
                </Badge>
              );
            };
            
            // Helper to render urgency/intensity badges for Pains
            const renderUrgencyIntensity = (urgency?: string, intensity?: string) => {
              const levelColors: Record<string, string> = {
                high: "bg-red-500/10 text-red-600",
                medium: "bg-amber-500/10 text-amber-600",
                low: "bg-slate-500/10 text-slate-600",
              };
              return (
                <div className="flex gap-1 mt-1">
                  {urgency && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${levelColors[urgency] || ''}`}>
                      Urgency: {urgency}
                    </span>
                  )}
                  {intensity && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${levelColors[intensity] || ''}`}>
                      Intensity: {intensity}
                    </span>
                  )}
                </div>
              );
            };
            
            // Helper to render effort/efficacy badges for Behaviours
            const renderEffortEfficacy = (effortLevel?: string, efficacy?: string) => {
              const effortLabels: Record<string, string> = {
                seeking_solutions: "Researching",
                taking_explicit_actions: "Acting",
                investing_time_money: "Investing",
              };
              const efficacyColors: Record<string, string> = {
                not_working: "bg-red-500/10 text-red-600",
                partially_working: "bg-amber-500/10 text-amber-600",
                working_well: "bg-green-500/10 text-green-600",
              };
              return (
                <div className="flex gap-1 mt-1 flex-wrap">
                  {effortLevel && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600">
                      {effortLabels[effortLevel] || effortLevel}
                    </span>
                  )}
                  {efficacy && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${efficacyColors[efficacy] || ''}`}>
                      {efficacy.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
              );
            };
            
            return (
              <Card key={quadrant.id} className={`${colorClasses[quadrant.color]}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColors[quadrant.color]}`}>
                        <QuadrantIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{quadrant.label}</CardTitle>
                        <CardDescription className="text-xs">{quadrant.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      {quadrant.items.length} / {recommendedCounts[quadrant.id]?.split(' ')[0] || '?'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {(quadrant.items as any[]).slice(0, 5).map((item, idx) => {
                      const itemText = typeof item === 'string' 
                        ? item 
                        : (item.text || item.fact || item.goal || item.pain || item.behaviour || '');
                      
                      return (
                        <li key={idx} className="text-sm border-l-2 border-foreground/20 pl-2">
                          <div className="flex items-start gap-2 flex-wrap">
                            <span className="flex-1">{itemText}</span>
                            {/* Goals: Show origin badge */}
                            {quadrant.id === 'goals' && item.origin && renderOriginBadge(item.origin)}
                          </div>
                          
                          {/* Goals: Show measure of success */}
                          {quadrant.id === 'goals' && item.measureOfSuccess && (
                            <p className="text-[10px] text-muted-foreground mt-1 italic">
                              Success: "{item.measureOfSuccess}"
                            </p>
                          )}
                          
                          {/* Pains: Show urgency/intensity and linked goals */}
                          {quadrant.id === 'pains' && (
                            <>
                              {renderUrgencyIntensity(item.urgency, item.intensity)}
                              {item.linkedGoalIds?.length > 0 && (
                                <p className="text-[10px] text-emerald-600 mt-1">
                                  Blocks: {item.linkedGoalIds.join(', ')}
                                </p>
                              )}
                            </>
                          )}
                          
                          {/* Behaviours: Show effort/efficacy and linked pains */}
                          {quadrant.id === 'behaviours' && (
                            <>
                              {renderEffortEfficacy(item.effortLevel, item.efficacy)}
                              {item.competitorSolution && (
                                <p className="text-[10px] text-amber-600 mt-1">
                                  Using: {item.competitorSolution}
                                </p>
                              )}
                            </>
                          )}
                          
                          {/* Facts: Show category */}
                          {quadrant.id === 'facts' && item.category && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 mt-1 inline-block">
                              {item.category}
                            </span>
                          )}
                        </li>
                      );
                    })}
                    {quadrant.items.length === 0 && (
                      <li className="text-sm text-muted-foreground italic">No items yet</li>
                    )}
                  </ul>
                  {quadrant.items.length > 5 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      +{quadrant.items.length - 5} more items
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderBuyerJourney = () => {
    if (journeyLoading) {
      return <Skeleton className="h-64" />;
    }

    if (!journey) {
      return (
        <Card className="border-dashed">
          <CardContent className="py-8 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Map className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Generate Buyer Journey</h4>
              <p className="text-sm text-muted-foreground max-w-sm">
                Map the 5-phase buyer journey showing tasks, emotions, and pain points 
                at each stage.
              </p>
            </div>
            <Button 
              onClick={() => generateJourneyMutation.mutate()}
              disabled={generateJourneyMutation.isPending || !persona}
              className="gap-2"
              data-testid="button-generate-journey"
            >
              {generateJourneyMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
              Generate Journey Map
            </Button>
            {!persona && (
              <p className="text-xs text-muted-foreground">Complete buyer persona first</p>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Map className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold">Buyer Journey Map</h3>
              <p className="text-sm text-muted-foreground">
                {journey.journeyContext === "pre_solution" ? "Pre-Solution" : "Post-Solution"} Journey
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {journey.aiGenerated && (
              <Badge variant="outline" className="gap-1 text-purple-600 border-purple-500/30 bg-purple-500/5">
                <Sparkles className="w-3 h-3" />
                AI Generated
              </Badge>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setRefineTarget({ type: "journey", id: journey.id });
                setShowRefineDialog(true);
              }}
              className="gap-1"
              style={{ borderColor: 'hsl(var(--kf-emerald) / 0.5)', color: 'hsl(var(--kf-forest))' }}
              data-testid="button-refine-journey"
            >
              <MessageSquare className="w-3 h-3" />
              Refine
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Handle both legacy array format and new object format */}
          {Array.isArray(journey.phases) ? (
            // Legacy format: render array phases directly
            (journey.phases as LegacyJourneyPhase[]).map((legacyPhase, idx) => {
              const journeyPhase: JourneyPhaseData = {
                description: legacyPhase.description || "",
                keyConsiderations: [],
                keyActivities: legacyPhase.tasks || [],
                touchpoints: legacyPhase.touchpoints || [],
                questionsToAsk: [],
                whatGoodLooksLike: legacyPhase.decisionFactors || [],
                mustCompleteBeforeNext: [],
                blockers: (legacyPhase.painPoints || []).map((p: string) => ({ blocker: p, severity: "medium" as const })),
                emotions: legacyPhase.emotions || [],
                legacyFormat: true
              };
              return (
                <Card key={legacyPhase.phaseId} className="border-amber-500/20 bg-amber-500/5">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-700">
                        {idx + 1}
                      </div>
                      <div>
                        <CardTitle className="text-sm">{legacyPhase.phaseName}</CardTitle>
                        <CardDescription className="text-xs">{legacyPhase.phaseId}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs space-y-3">
                    {journeyPhase.keyActivities?.length > 0 && (
                      <div>
                        <p className="font-semibold text-emerald-700 mb-1 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Tasks
                        </p>
                        <ul className="space-y-1">
                          {journeyPhase.keyActivities.slice(0, 3).map((activity: string, i: number) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                              <span>{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {journeyPhase.blockers?.length > 0 && (
                      <div>
                        <p className="font-semibold text-red-700 mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Pain Points
                        </p>
                        <ul className="space-y-1">
                          {journeyPhase.blockers.slice(0, 2).map((blocker, i: number) => (
                            <li key={i} className="flex items-start gap-1 text-red-600/80">
                              <span className="w-1 h-1 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                              <span>{blocker.blocker}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {journeyPhase.emotions && journeyPhase.emotions.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {journeyPhase.emotions.slice(0, 3).map((emotion: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-700 border-amber-500/30">
                            {emotion}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            // New format: render using JOURNEY_PHASES
            JOURNEY_PHASES.map((phase, idx) => {
              const journeyPhase = (journey.phases as BuyerJourneyPhases)[phase.id as keyof BuyerJourneyPhases];
              return (
                <Card key={phase.id} className="border-amber-500/20 bg-amber-500/5">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-700">
                        {idx + 1}
                      </div>
                      <div>
                        <CardTitle className="text-sm">{phase.name}</CardTitle>
                        <CardDescription className="text-xs">{phase.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs space-y-3">
                    {journeyPhase ? (
                    <>
                      {journeyPhase.description && (
                        <p className="text-sm text-muted-foreground">{journeyPhase.description}</p>
                      )}
                      
                      {journeyPhase.keyActivities?.length > 0 && (
                        <div>
                          <p className="font-semibold text-emerald-700 mb-1 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Key Activities
                          </p>
                          <ul className="space-y-1">
                            {journeyPhase.keyActivities.slice(0, 3).map((activity: string, i: number) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                <span>{activity}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {journeyPhase.questionsToAsk?.length > 0 && (
                        <div>
                          <p className="font-semibold text-blue-700 mb-1 flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            Questions to Ask
                          </p>
                          <ul className="space-y-1">
                            {journeyPhase.questionsToAsk.slice(0, 2).map((q: string, i: number) => (
                              <li key={i} className="flex items-start gap-1 italic text-blue-600/80">
                                <span className="not-italic">"</span>{q}<span className="not-italic">"</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {journeyPhase.whatGoodLooksLike?.length > 0 && (
                        <div>
                          <p className="font-semibold text-purple-700 mb-1 flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            What Good Looks Like
                          </p>
                          <ul className="space-y-1">
                            {journeyPhase.whatGoodLooksLike.slice(0, 2).map((item: string, i: number) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {journeyPhase.blockers?.length > 0 && (
                        <div>
                          <p className="font-semibold text-red-700 mb-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Blockers
                          </p>
                          <ul className="space-y-1">
                            {journeyPhase.blockers.slice(0, 2).map((blocker, i: number) => (
                              <li key={i} className="flex items-start gap-1">
                                <Badge variant="outline" className={`text-[10px] px-1 py-0 ${
                                  blocker.severity === 'high' ? 'border-red-500/50 text-red-600' :
                                  blocker.severity === 'medium' ? 'border-amber-500/50 text-amber-600' :
                                  'border-slate-500/50 text-slate-600'
                                }`}>
                                  {blocker.severity}
                                </Badge>
                                <span>{blocker.blocker}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {journeyPhase.emotions && journeyPhase.emotions.length > 0 && (
                        <div>
                          <p className="font-semibold text-pink-700 mb-1 flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            Buyer Emotions
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {journeyPhase.emotions.slice(0, 4).map((emotion: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-[10px] border-pink-500/30 text-pink-600 bg-pink-500/5">
                                {emotion}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {journeyPhase.outcomeMapping && journeyPhase.outcomeMapping.length > 0 && (
                        <div className="pt-2 border-t" style={{ borderColor: 'hsl(var(--kf-emerald) / 0.2)' }}>
                          <p className="font-semibold mb-1 flex items-center gap-1" style={{ color: 'hsl(var(--kf-forest))' }}>
                            <Target className="w-3 h-3" />
                            Target Outcomes
                          </p>
                          <ul className="space-y-1.5">
                            {journeyPhase.outcomeMapping.slice(0, 2).map((mapping: OutcomeMapping, i: number) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <Badge 
                                  variant="outline" 
                                  className="text-[9px] px-1 py-0 flex-shrink-0"
                                  style={mapping.relevance === 'primary' 
                                    ? { borderColor: 'hsl(var(--kf-emerald) / 0.5)', color: 'hsl(var(--kf-forest))', backgroundColor: 'hsl(var(--kf-emerald) / 0.1)' }
                                    : { borderColor: 'hsl(var(--kf-ocean) / 0.5)', color: 'hsl(var(--kf-ocean))' }
                                  }
                                >
                                  {mapping.relevance}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground leading-tight">
                                  {mapping.howAddressed}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground italic">Not mapped yet</p>
                  )}
                </CardContent>
              </Card>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderHypotheses = () => {
    const currentHypothesis = hypotheses?.[0];

    if (!currentHypothesis) {
      return (
        <Card className="border-dashed">
          <CardContent className="py-8 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Generate Hypotheses</h4>
              <p className="text-sm text-muted-foreground max-w-sm">
                AI will create Buyer, Problem, and Solution hypotheses based on your persona.
              </p>
            </div>
            <Button 
              onClick={() => generateHypothesesMutation.mutate()}
              disabled={generateHypothesesMutation.isPending || !persona}
              className="gap-2"
              data-testid="button-generate-hypotheses"
            >
              {generateHypothesesMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
              Generate Hypotheses
            </Button>
            {!persona && (
              <p className="text-xs text-muted-foreground">Complete buyer persona first</p>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Hypotheses</CardTitle>
                <CardDescription>Buyer, Problem, and Solution hypotheses to validate</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 text-purple-600 border-purple-500/30 bg-purple-500/5">
                <Sparkles className="w-3 h-3" />
                AI Generated
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setRefineTarget({ type: "hypotheses", id: currentHypothesis.id });
                  setShowRefineDialog(true);
                }}
                className="gap-1"
                style={{ borderColor: 'hsl(var(--kf-emerald) / 0.5)', color: 'hsl(var(--kf-forest))' }}
                data-testid="button-refine-hypotheses"
              >
                <MessageSquare className="w-3 h-3" />
                Refine
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Buyer Hypothesis
              </h4>
              <p className="text-sm">{currentHypothesis.buyerHypothesis}</p>
              {currentHypothesis.buyerHypothesisRationale && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Rationale: {currentHypothesis.buyerHypothesisRationale}
                </p>
              )}
            </div>
            <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
              <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Problem Hypothesis
              </h4>
              <p className="text-sm">{currentHypothesis.problemHypothesis}</p>
              {currentHypothesis.problemHypothesisRationale && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Rationale: {currentHypothesis.problemHypothesisRationale}
                </p>
              )}
            </div>
            <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <h4 className="font-semibold text-emerald-600 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Solution Hypothesis
              </h4>
              <p className="text-sm">{currentHypothesis.solutionHypothesis}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPredictionsGrid = () => {
    if (!predictions || predictions.length === 0) {
      return (
        <Card className="border-dashed">
          <CardContent className="py-8 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Grid3x3 className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Generate Predictions</h4>
              <p className="text-sm text-muted-foreground max-w-sm">
                AI will create a 2x2 predictions matrix based on your hypotheses.
              </p>
            </div>
            <Button 
              onClick={() => generatePredictionsMutation.mutate()}
              disabled={generatePredictionsMutation.isPending || !hypotheses?.length}
              className="gap-2"
              data-testid="button-generate-predictions"
            >
              {generatePredictionsMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
              Generate Predictions
            </Button>
            {!hypotheses?.length && (
              <p className="text-xs text-muted-foreground">Complete hypotheses first</p>
            )}
          </CardContent>
        </Card>
      );
    }

    // Categorize predictions into 4 quadrants based on WBT methodology
    // X-axis: Impact if wrong (how much it causes Persona rethink) - Low left, High right
    // Y-axis: Confidence level - High top, Low bottom
    // Bottom-right = "Riskiest Predictions" (high impact, low confidence) - these need experimentation
    // Note: Schema uses impactIfWrong field, but we treat any non-null impactIfWrong as "high impact"
    const getImpact = (p: any): "high" | "low" => {
      // If explicitly marked as risky, it's high impact
      if (p.isRiskyPrediction) return "high";
      // If impactIfWrong field has content, it's high impact
      if (p.impactIfWrong && p.impactIfWrong.length > 0) return "high";
      // Check direct impact field if present
      if (p.impact === "high") return "high";
      if (p.impact === "low") return "low";
      // Default based on confidence - low confidence suggests high risk/impact
      return p.confidence === "high" ? "low" : "high";
    };
    
    const highConfHighImpact = predictions.filter(p => p.confidence === "high" && getImpact(p) === "high" && !p.isRiskyPrediction);
    const highConfLowImpact = predictions.filter(p => p.confidence === "high" && getImpact(p) === "low" && !p.isRiskyPrediction);
    const lowConfLowImpact = predictions.filter(p => (p.confidence === "low" || p.confidence === "medium") && getImpact(p) === "low" && !p.isRiskyPrediction);
    const riskyPredictions = predictions.filter(p => p.isRiskyPrediction === true);

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Grid3x3 className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <CardTitle>Predictions 2x2 Grid</CardTitle>
                <CardDescription>Sort predictions by Impact (if wrong) vs Confidence to identify riskiest assumptions</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 text-purple-600 border-purple-500/30 bg-purple-500/5">
                <Sparkles className="w-3 h-3" />
                AI Generated
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => generatePredictionsMutation.mutate()}
                disabled={generatePredictionsMutation.isPending}
                className="gap-1"
                data-testid="button-regenerate-predictions"
              >
                {generatePredictionsMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                Regenerate
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 2x2 Grid with axis labels */}
          <div className="relative">
            {/* Y-axis label */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-semibold text-muted-foreground whitespace-nowrap">
              ← Low Confidence — High Confidence →
            </div>
            
            <div className="ml-6">
              {/* X-axis label */}
              <div className="text-center text-xs font-semibold text-muted-foreground mb-2">
                ← Low Impact — High Impact →
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Top-left: High Confidence, Low Impact - "Park for now" */}
                <div className="p-4 rounded-lg bg-slate-500/5 border border-slate-500/20 min-h-[140px]">
                  <h4 className="font-semibold text-slate-600 text-xs uppercase mb-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    Low Impact, High Confidence
                  </h4>
                  <p className="text-[10px] text-muted-foreground mb-2">Park these - low priority</p>
                  <ul className="space-y-1.5">
                    {highConfLowImpact.slice(0, 2).map((pred, i) => (
                      <li key={i} className="text-xs flex items-start gap-1.5 text-muted-foreground">
                        <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                        <span className="line-clamp-2">{pred.prediction}</span>
                      </li>
                    ))}
                    {highConfLowImpact.length === 0 && (
                      <li className="text-xs text-muted-foreground italic">None identified</li>
                    )}
                  </ul>
                </div>
                
                {/* Top-right: High Confidence, High Impact - "Foundation" */}
                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 min-h-[140px]">
                  <h4 className="font-semibold text-emerald-600 text-xs uppercase mb-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    High Impact, High Confidence
                  </h4>
                  <p className="text-[10px] text-emerald-600/70 mb-2">Foundation - proceed confidently</p>
                  <ul className="space-y-1.5">
                    {highConfHighImpact.filter(p => !p.isRiskyPrediction).slice(0, 2).map((pred, i) => (
                      <li key={i} className="text-xs flex items-start gap-1.5">
                        <CheckCircle className="w-3 h-3 mt-0.5 text-emerald-500 flex-shrink-0" />
                        <span className="line-clamp-2">{pred.prediction}</span>
                      </li>
                    ))}
                    {highConfHighImpact.filter(p => !p.isRiskyPrediction).length === 0 && (
                      <li className="text-xs text-muted-foreground italic">None identified</li>
                    )}
                  </ul>
                </div>
                
                {/* Bottom-left: Low Confidence, Low Impact - "Monitor" */}
                <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 min-h-[140px]">
                  <h4 className="font-semibold text-amber-600 text-xs uppercase mb-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Low Impact, Low Confidence
                  </h4>
                  <p className="text-[10px] text-amber-600/70 mb-2">Monitor - validate opportunistically</p>
                  <ul className="space-y-1.5">
                    {lowConfLowImpact.slice(0, 2).map((pred, i) => (
                      <li key={i} className="text-xs flex items-start gap-1.5 text-amber-700">
                        <span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                        <span className="line-clamp-2">{pred.prediction}</span>
                      </li>
                    ))}
                    {lowConfLowImpact.length === 0 && (
                      <li className="text-xs text-muted-foreground italic">None identified</li>
                    )}
                  </ul>
                </div>
                
                {/* Bottom-right: Low Confidence, High Impact - "RISKIEST - Experiment!" */}
                <div className="p-4 rounded-lg bg-red-500/10 border-2 border-red-500/40 min-h-[140px] relative">
                  <div className="absolute -top-2 -right-2">
                    <Badge className="bg-red-500 text-white text-[10px] px-2">EXPERIMENT</Badge>
                  </div>
                  <h4 className="font-semibold text-red-600 text-xs uppercase mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    High Impact, Low Confidence
                  </h4>
                  <p className="text-[10px] text-red-600/70 mb-2">Riskiest - prioritize for CDI testing</p>
                  <ul className="space-y-1.5">
                    {riskyPredictions.slice(0, 3).map((pred, i) => (
                      <li key={i} className="text-xs flex items-start gap-1.5 text-red-700">
                        <AlertTriangle className="w-3 h-3 mt-0.5 text-red-500 flex-shrink-0" />
                        <span className="line-clamp-2">{pred.prediction}</span>
                      </li>
                    ))}
                    {riskyPredictions.length === 0 && (
                      <li className="text-xs text-muted-foreground italic">None identified</li>
                    )}
                  </ul>
                </div>
              </div>
              
              {/* Summary stats */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-muted-foreground">
                    Total: <strong>{predictions.length}</strong> predictions
                  </span>
                  <span className="text-red-600">
                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                    <strong>{riskyPredictions.length}</strong> risky (need testing)
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground max-w-xs text-right">
                  Focus CDI interviews on the bottom-right quadrant to validate high-impact, low-confidence assumptions
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderInterviewScript = () => {
    const script = interviewScripts?.[0];
    
    if (!script) {
      return (
        <Card className="border-dashed border-2 border-teal-500/20">
          <CardContent className="py-12 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="font-bold mb-2">Interview Script</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Generate a structured discovery interview script based on your buyer persona and hypotheses.
              </p>
            </div>
            <Button 
              onClick={() => generateInterviewScriptMutation.mutate()}
              disabled={generateInterviewScriptMutation.isPending || !persona}
              className="gap-2"
              data-testid="button-generate-interview-script"
            >
              {generateInterviewScriptMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
              Generate Interview Script
            </Button>
            {!persona && (
              <p className="text-xs text-muted-foreground">Complete buyer persona first</p>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <CardTitle>{script.scriptName || "Discovery Interview Script"}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <span>Target: {script.targetRole}</span>
                  {script.estimatedDuration && (
                    <Badge variant="outline" className="text-xs">{script.estimatedDuration}</Badge>
                  )}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 text-purple-600 border-purple-500/30 bg-purple-500/5">
                <Sparkles className="w-3 h-3" />
                AI Generated
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => generateInterviewScriptMutation.mutate()}
                disabled={generateInterviewScriptMutation.isPending}
                className="gap-1"
                data-testid="button-regenerate-interview-script"
              >
                {generateInterviewScriptMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                Regenerate
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Interview Tips */}
          {script.interviewTips && script.interviewTips.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <h4 className="font-semibold text-sm text-amber-700 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Mom Test Tips
              </h4>
              <ul className="space-y-1">
                {script.interviewTips.map((tip: string, idx: number) => (
                  <li key={idx} className="text-xs flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Interview Sections */}
          {script.sections?.map((section: any, idx: number) => (
            <div key={idx} className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">{section.sectionName}</h4>
                {section.timeAllocation && (
                  <Badge variant="outline" className="text-xs">{section.timeAllocation}</Badge>
                )}
              </div>
              {section.sectionPurpose && (
                <p className="text-xs text-muted-foreground mb-3 italic">{section.sectionPurpose}</p>
              )}
              <div className="space-y-4">
                {section.questions?.map((q: any, qIdx: number) => (
                  <div key={qIdx} className="pl-4 border-l-2 border-teal-500/30">
                    <div className="flex items-start gap-2 mb-1">
                      <p className="font-medium text-sm flex-1">{q.question}</p>
                      {q.hypothesisId && (
                        <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-600">
                          {q.hypothesisId}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <strong>Validates:</strong> {q.validates}
                    </p>
                    {q.listenFor && q.listenFor.length > 0 && (
                      <div className="mt-2">
                        <p className="text-[10px] font-semibold text-emerald-600 uppercase mb-1">Listen For:</p>
                        <ul className="space-y-0.5">
                          {q.listenFor.map((signal: string, sIdx: number) => (
                            <li key={sIdx} className="text-xs text-emerald-700 flex items-start gap-1">
                              <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span>{signal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {q.redFlags && q.redFlags.length > 0 && (
                      <div className="mt-2">
                        <p className="text-[10px] font-semibold text-red-600 uppercase mb-1">Red Flags:</p>
                        <ul className="space-y-0.5">
                          {q.redFlags.map((flag: string, fIdx: number) => (
                            <li key={fIdx} className="text-xs text-red-600 flex items-start gap-1">
                              <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span>{flag}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {q.followUps && q.followUps.length > 0 && (
                      <div className="mt-2">
                        <p className="text-[10px] font-semibold text-blue-600 uppercase mb-1">Follow-up Probes:</p>
                        <ul className="space-y-0.5">
                          {q.followUps.map((followUp: string, fuIdx: number) => (
                            <li key={fuIdx} className="text-xs text-blue-600 flex items-start gap-1">
                              <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span>{followUp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* Closing Script */}
          {script.closingScript && (
            <div className="p-3 rounded-lg bg-slate-500/5 border border-slate-500/20">
              <h4 className="font-semibold text-sm mb-2">Closing Script</h4>
              <p className="text-sm">{script.closingScript}</p>
            </div>
          )}
          
          {/* Simulated Transcript */}
          {script.simulatedTranscript && (
            <div className="p-4 rounded-lg bg-gradient-to-br from-teal-500/5 to-purple-500/5 border border-teal-500/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-teal-600" />
                  Simulated Interview Transcript
                </h4>
                <Badge variant="outline" className="text-xs">Practice Material</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                This simulated conversation helps you prepare for real interviews. Notice how questions flow naturally and build on responses.
              </p>
              <div className="bg-background/50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                  {script.simulatedTranscript.split('\\n').join('\n')}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderBattleCards = () => {
    const [competitorInput, setCompetitorInput] = useState("");
    const card = battleCards?.[0];
    
    if (!card) {
      return (
        <Card className="border-dashed border-2 border-red-500/20">
          <CardContent className="py-12 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Swords className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold mb-2">Competitive Battle Cards</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Generate competitive intelligence with live market data using Perplexity AI.
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <Input 
                placeholder="Competitor name (e.g., Accenture)" 
                value={competitorInput}
                onChange={(e) => setCompetitorInput(e.target.value)}
                className="w-48"
              />
              <Button 
                onClick={() => generateBattleCardMutation.mutate(competitorInput || "Generic Competitor")}
                disabled={generateBattleCardMutation.isPending}
                className="gap-2"
                data-testid="button-generate-battle-card"
              >
                {generateBattleCardMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4" />
                )}
                Generate Battle Card
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Swords className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <CardTitle>vs {card.competitorName}</CardTitle>
              <CardDescription>Competitive Battle Card</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
              <h4 className="font-semibold text-red-600 mb-2">Their Strengths</h4>
              <ul className="space-y-1 text-sm">
                {card.competitorStrengths?.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <h4 className="font-semibold text-emerald-600 mb-2">Their Weaknesses</h4>
              <ul className="space-y-1 text-sm">
                {card.competitorWeaknesses?.map((w: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-emerald-500 mt-1" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {card.winThemes?.length > 0 && (
            <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <h4 className="font-semibold text-blue-600 mb-2">Win Themes</h4>
              {card.winThemes.map((theme: any, i: number) => (
                <div key={i} className="mb-2">
                  <p className="font-medium text-sm">{theme.theme}</p>
                  <ul className="text-xs text-muted-foreground mt-1">
                    {theme.talkingPoints?.map((tp: string, j: number) => (
                      <li key={j}>• {tp}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderTenets = () => {
    const tenetData = tenets;
    
    if (!tenetData?.tenets?.length) {
      return (
        <Card className="border-dashed border-2 border-purple-500/20">
          <CardContent className="py-12 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Compass className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold mb-2">Solution Tenets</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Generate customer-centric design principles that guide your solution delivery.
              </p>
            </div>
            <Button 
              onClick={() => generateTenetsMutation.mutate()}
              disabled={generateTenetsMutation.isPending || !hypotheses?.length}
              className="gap-2"
              data-testid="button-generate-tenets"
            >
              {generateTenetsMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
              Generate Tenets
            </Button>
            {!hypotheses?.length && (
              <p className="text-xs text-muted-foreground">Complete hypotheses first</p>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Compass className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle>Solution Tenets</CardTitle>
              <CardDescription>Customer-centric design principles</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {tenetData.tenets.map((tenet: any) => (
            <div key={tenet.tenetNumber} className="p-4 rounded-lg border bg-purple-500/5 border-purple-500/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-600 font-bold text-sm">
                  {tenet.tenetNumber}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{tenet.tenet}</p>
                  <p className="text-sm text-muted-foreground mt-1">{tenet.rationale}</p>
                  {tenet.tradeoffs && (
                    <p className="text-xs text-amber-600 mt-2">Trade-off: {tenet.tradeoffs}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const renderPressRelease = () => {
    const pr = pressRelease;
    
    if (!pr) {
      return (
        <Card className="border-dashed border-2 border-amber-500/20">
          <CardContent className="py-12 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Newspaper className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold mb-2">Press Release</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Generate a Working Backwards style press release announcing your future success.
              </p>
            </div>
            <Button 
              onClick={() => generatePressReleaseMutation.mutate()}
              disabled={generatePressReleaseMutation.isPending || !hypotheses?.length}
              className="gap-2"
              data-testid="button-generate-press-release"
            >
              {generatePressReleaseMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
              Generate Press Release
            </Button>
            {!hypotheses?.length && (
              <p className="text-xs text-muted-foreground">Complete hypotheses first</p>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{pr.headline}</CardTitle>
              {pr.subheadline && <CardDescription>{pr.subheadline}</CardDescription>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p className="text-xs text-muted-foreground mb-4">{pr.dateline}</p>
          <p className="font-medium">{pr.openingParagraph}</p>
          {pr.clientQuote && (
            <blockquote className="border-l-4 border-primary pl-4 my-4 italic">
              "{pr.clientQuote.quote}"
              <footer className="text-sm text-muted-foreground not-italic">— {pr.clientQuote.attribution}</footer>
            </blockquote>
          )}
          {pr.bodyParagraphs?.map((p: string, i: number) => (
            <p key={i}>{p}</p>
          ))}
          {pr.partnerQuote && (
            <blockquote className="border-l-4 border-purple-500 pl-4 my-4 italic">
              "{pr.partnerQuote.quote}"
              <footer className="text-sm text-muted-foreground not-italic">— {pr.partnerQuote.attribution}</footer>
            </blockquote>
          )}
          <p>{pr.closingParagraph}</p>
          {pr.keyMetrics?.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-6 not-prose">
              {pr.keyMetrics.map((m: any, i: number) => (
                <div key={i} className="text-center p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <div className="text-2xl font-bold text-amber-600">{m.value}</div>
                  <div className="text-xs text-muted-foreground">{m.metric}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderSalesActions = () => {
    const actions = salesActions;
    
    if (!actions) {
      return (
        <Card className="border-dashed border-2 border-emerald-500/20">
          <CardContent className="py-12 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <PlayCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold mb-2">Sales Action Plan</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Generate a prioritized action plan based on your complete Growth Accelerator analysis.
              </p>
            </div>
            <Button 
              onClick={() => generateSalesActionsMutation.mutate()}
              disabled={generateSalesActionsMutation.isPending || !hypotheses?.length}
              className="gap-2"
              data-testid="button-generate-sales-actions"
            >
              {generateSalesActionsMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
              Generate Action Plan
            </Button>
            {!hypotheses?.length && (
              <p className="text-xs text-muted-foreground">Complete previous steps first</p>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <PlayCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle>{actions.salesPlayName}</CardTitle>
              <CardDescription>Prioritized Sales Action Plan</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Immediate (Next 7 Days)
            </h4>
            <div className="space-y-2">
              {actions.immediateActions?.map((a: any, i: number) => (
                <div key={i} className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                  <p className="font-medium text-sm">{a.action}</p>
                  <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                    <span>Owner: {a.owner}</span>
                    <span>Validates: {a.validates}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-amber-600 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Short-term (Next 30 Days)
            </h4>
            <div className="space-y-2">
              {actions.shortTermActions?.map((a: any, i: number) => (
                <div key={i} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <p className="font-medium text-sm">{a.action}</p>
                  <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                    <span>Owner: {a.owner}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-emerald-600 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Medium-term (Next 90 Days)
            </h4>
            <div className="space-y-2">
              {actions.mediumTermActions?.map((a: any, i: number) => (
                <div key={i} className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <p className="font-medium text-sm">{a.action}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case "buyer_persona":
        return renderBuyerPersona();
      case "buyer_journey":
        return renderBuyerJourney();
      case "hypotheses":
        return renderHypotheses();
      case "predictions":
        return renderPredictionsGrid();
      case "interview_script":
        return renderInterviewScript();
      case "solution_tenets":
        return renderTenets();
      case "press_release":
        return renderPressRelease();
      case "battle_cards":
        return renderBattleCards();
      case "sales_actions":
        return renderSalesActions();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-amber-500/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                <Rocket className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>{canvas.title}</CardTitle>
                <CardDescription>Sales Play Builder - Working Backwards Methodology</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleExportPDF}
                disabled={isExporting}
                data-testid="button-export-pdf"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-1" />
                )}
                Export PDF
              </Button>
              <Badge variant="outline" className="text-purple-600 border-purple-500/30 bg-purple-500/5">
                <Brain className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
              <Badge variant="outline">
                Status: {canvas.status}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            {GA_SECTIONS.map((section, idx) => {
              const SectionIcon = section.icon;
              const isActive = activeSection === section.id;
              const completion = getSectionCompletion(section.id);
              const colorStyles: Record<string, string> = {
                blue: "border-blue-500/30 bg-blue-500/5 text-blue-600",
                purple: "border-purple-500/30 bg-purple-500/5 text-purple-600",
                amber: "border-amber-500/30 bg-amber-500/5 text-amber-600",
                emerald: "border-emerald-500/30 bg-emerald-500/5 text-emerald-600",
              };
              return (
                <div key={section.id} className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveSection(section.id);
                      const steps = GA_STEPS[section.id as keyof typeof GA_STEPS];
                      if (steps?.length) setActiveStep(steps[0].id);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                      isActive
                        ? `${colorStyles[section.color]} ring-2 ring-primary/50`
                        : "border-border/50 bg-background hover-elevate"
                    }`}
                    data-testid={`section-${section.id}`}
                  >
                    <SectionIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{section.label}</span>
                    {completion > 0 && completion < 100 && (
                      <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center text-xs font-bold">
                        {Math.round(completion)}
                      </div>
                    )}
                    {completion === 100 && (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    )}
                  </button>
                  {idx < GA_SECTIONS.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <Card className="sticky top-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {getCurrentSteps().map((step, idx) => {
                const StepIcon = step.icon;
                const isActive = activeStep === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`w-full text-left p-2 rounded-lg transition-all flex items-center gap-2 ${
                      isActive
                        ? "bg-primary/10 border border-primary/30"
                        : "hover-elevate"
                    }`}
                    data-testid={`step-${step.id}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isActive ? "text-primary" : ""}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {step.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-9">
          {renderStepContent()}
        </div>
      </div>

      {/* AI Refine Dialog */}
      <Dialog open={showRefineDialog} onOpenChange={setShowRefineDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: 'hsl(var(--kf-emerald))' }} />
              Refine with AI
            </DialogTitle>
            <DialogDescription>
              Tell AI how you'd like to improve or change this {refineTarget?.type || "content"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              value={aiRefinePrompt}
              onChange={(e) => setAiRefinePrompt(e.target.value)}
              placeholder="e.g., Make the persona more senior-focused, add emphasis on cost reduction goals, include more specific industry challenges..."
              className="min-h-[120px]"
              data-testid="textarea-refine-prompt"
            />
            <p className="text-xs text-muted-foreground">
              AI will update the content while preserving the overall structure.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowRefineDialog(false);
                setAiRefinePrompt("");
                setRefineTarget(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (refineTarget && aiRefinePrompt.trim()) {
                  refineContentMutation.mutate({
                    type: refineTarget.type,
                    id: refineTarget.id,
                    prompt: aiRefinePrompt.trim(),
                  });
                }
              }}
              disabled={refineContentMutation.isPending || !aiRefinePrompt.trim()}
              style={{ backgroundColor: 'hsl(var(--kf-emerald))' }}
              data-testid="button-confirm-refine"
            >
              {refineContentMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Refine Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
