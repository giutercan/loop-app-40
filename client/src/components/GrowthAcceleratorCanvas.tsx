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
  HelpCircle
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
  facts: QuadrantItem[];
  goals: QuadrantItem[];
  pains: QuadrantItem[];
  behaviours: QuadrantItem[];
  aiGenerated?: boolean;
}

interface JourneyPhase {
  phaseId: string;
  phaseName: string;
  tasks: string[];
  emotions: string[];
  painPoints: string[];
  decisionFactors: string[];
}

interface BuyerJourney {
  id?: number;
  canvasId: number;
  personaId?: number;
  journeyContext: string;
  phases: JourneyPhase[];
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

const JOURNEY_PHASES = [
  { id: "awareness", name: "Awareness", description: "Prospect realizes they have a problem" },
  { id: "consideration", name: "Consideration", description: "Evaluating possible solutions" },
  { id: "decision", name: "Decision", description: "Selecting a vendor/solution" },
  { id: "implementation", name: "Implementation", description: "Rolling out the solution" },
  { id: "value_realization", name: "Value Realization", description: "Achieving promised outcomes" },
];

export function GrowthAcceleratorCanvas({ projectId, accountId, companyName }: GrowthAcceleratorCanvasProps) {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("what_to_know");
  const [activeStep, setActiveStep] = useState("buyer_persona");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [canvasTitle, setCanvasTitle] = useState(`${companyName} Sales Play`);
  
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

  const generatePersonaMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/growth-accelerator/canvases/${canvas!.id}/generate-persona`, {
        projectId,
        companyName,
      });
      return res.json();
    },
    onSuccess: () => {
      refetchPersona();
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

      const addTitle = (text: string, size: number = 16) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", "bold");
        doc.text(text, leftMargin, yPos);
        yPos += lineHeight + 2;
      };

      const addSubtitle = (text: string) => {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(text, leftMargin, yPos);
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

      if (journey && journey.phases?.length) {
        checkPageBreak(60);
        addTitle("3. BUYER JOURNEY", 14);
        if (journey.journeyContext) addText(`Context: ${journey.journeyContext}`);
        journey.phases.forEach((phase: any) => {
          addSubtitle(phase.phaseName || 'Phase');
          if (phase.tasks?.length) {
            addText("Tasks:");
            phase.tasks.forEach((t: string) => addText(`- ${t}`, 5));
          }
          if (phase.emotions?.length) {
            addText(`Emotions: ${phase.emotions.join(", ")}`);
          }
          if (phase.painPoints?.length) {
            addText(`Pain Points: ${phase.painPoints.join(", ")}`);
          }
          if (phase.decisionFactors?.length) {
            addText(`Decision Factors: ${phase.decisionFactors.join(", ")}`);
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
      return (
        <Card className="border-dashed">
          <CardContent className="py-8 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Generate Buyer Persona</h4>
              <p className="text-sm text-muted-foreground max-w-sm">
                AI will create a 4-quadrant buyer persona using your discovery insights, 
                company data points, and notes.
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
            <Button 
              onClick={() => generatePersonaMutation.mutate()}
              disabled={generatePersonaMutation.isPending}
              className="gap-2"
              data-testid="button-generate-persona"
            >
              {generatePersonaMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
              Generate with AI
            </Button>
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
          {persona.aiGenerated && (
            <Badge variant="outline" className="gap-1 text-purple-600 border-purple-500/30 bg-purple-500/5">
              <Sparkles className="w-3 h-3" />
              AI Generated
            </Badge>
          )}
        </div>

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
            return (
              <Card key={quadrant.id} className={`${colorClasses[quadrant.color]}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColors[quadrant.color]}`}>
                      <QuadrantIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{quadrant.label}</CardTitle>
                      <CardDescription className="text-xs">{quadrant.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(quadrant.items as QuadrantItem[]).slice(0, 4).map((item, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-2 flex-shrink-0" />
                        <span>{typeof item === 'string' ? item : item.text}</span>
                      </li>
                    ))}
                    {quadrant.items.length === 0 && (
                      <li className="text-sm text-muted-foreground italic">No items yet</li>
                    )}
                  </ul>
                  {quadrant.items.length > 4 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      +{quadrant.items.length - 4} more
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
          {journey.aiGenerated && (
            <Badge variant="outline" className="gap-1 text-purple-600 border-purple-500/30 bg-purple-500/5">
              <Sparkles className="w-3 h-3" />
              AI Generated
            </Badge>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {JOURNEY_PHASES.map((phase, idx) => {
            const journeyPhase = (journey.phases || []).find((p: JourneyPhase) => p.phaseId === phase.id);
            return (
              <Card key={phase.id} className="min-w-[200px] flex-1 border-amber-500/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center text-xs font-bold text-amber-600">
                      {idx + 1}
                    </div>
                    <CardTitle className="text-sm">{phase.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  {journeyPhase ? (
                    <>
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">Tasks</p>
                        <ul className="space-y-1">
                          {journeyPhase.tasks?.slice(0, 2).map((task: string, i: number) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="w-1 h-1 rounded-full bg-foreground/40 mt-1.5" />
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">Pain Points</p>
                        <ul className="space-y-1">
                          {journeyPhase.painPoints?.slice(0, 2).map((pain: string, i: number) => (
                            <li key={i} className="text-red-600/80 flex items-start gap-1">
                              <AlertTriangle className="w-3 h-3 mt-0.5" />
                              {pain}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground italic">Not mapped</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderHypotheses = () => {
    const currentHypothesis = hypotheses?.[0];

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle>Hypotheses</CardTitle>
              <CardDescription>Buyer, Problem, and Solution hypotheses to validate</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentHypothesis ? (
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
              </div>
              <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <h4 className="font-semibold text-emerald-600 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Solution Hypothesis
                </h4>
                <p className="text-sm">{currentHypothesis.solutionHypothesis}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Complete the buyer persona to generate hypotheses</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderPredictionsGrid = () => {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Grid3x3 className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <CardTitle>Predictions Grid</CardTitle>
              <CardDescription>2x2 matrix of confidence vs impact predictions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {predictions && predictions.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                <h4 className="font-semibold text-red-600 text-xs uppercase mb-2">High Impact, Low Confidence</h4>
                <ul className="space-y-2">
                  {predictions
                    .filter(p => p.isRiskyPrediction)
                    .slice(0, 3)
                    .map((pred, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <AlertTriangle className="w-3 h-3 mt-1 text-red-500" />
                        {pred.prediction}
                      </li>
                    ))}
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <h4 className="font-semibold text-emerald-600 text-xs uppercase mb-2">High Impact, High Confidence</h4>
                <ul className="space-y-2">
                  {predictions
                    .filter(p => !p.isRiskyPrediction && p.confidence === "high")
                    .slice(0, 3)
                    .map((pred, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 mt-1 text-emerald-500" />
                        {pred.prediction}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Complete hypotheses to generate predictions</p>
            </div>
          )}
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <CardTitle>{script.scriptName}</CardTitle>
              <CardDescription>Target: {script.targetRole}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {script.sections?.map((section: any, idx: number) => (
            <div key={idx} className="p-4 rounded-lg border bg-muted/30">
              <h4 className="font-semibold mb-3">{section.sectionName}</h4>
              <div className="space-y-3">
                {section.questions?.map((q: any, qIdx: number) => (
                  <div key={qIdx} className="pl-4 border-l-2 border-teal-500/30">
                    <p className="font-medium text-sm">{q.question}</p>
                    <p className="text-xs text-muted-foreground mt-1">Validates: {q.validates}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
    </div>
  );
}
