import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  BookOpen, Sparkles, CheckCircle2, AlertCircle, ChevronDown, ChevronRight,
  Pencil, PlayCircle, Target, Lightbulb, Zap, MessageCircle, Trophy,
  ArrowRight, Loader2, Mic, RefreshCw, FileText, Eye, EyeOff
} from "lucide-react";

interface StoryBuilderData {
  before: {
    singleMessage: string;
    emotionalReaction: string;
    startingHook: string;
    storyStructure: string;
    heroCharacter: string;
    evidenceToReference: string;
    tensionQuestions: Array<{ id?: string; prompt: string; response: string; order: number; methodology?: string; rationale?: string; source?: "ai" | "manual" }>;
  };
  during: {
    openingLine: string;
    turningPoint: string;
    keyDataPoints: string;
    pacingNotes: string;
  };
  after: {
    momentOfMeaning: string;
    explicitTakeaway: string;
    callToAction: string;
  };
  storyTest: {
    strangerCareScore: number | null;
    simplicityScore: number | null;
    leadershipValuesScore: number | null;
  };
}

interface StoryRefineResult {
  overallScore: number;
  overallFeedback: string;
  strengths: string[];
  improvements: Array<{ element: string; currentIssue: string; suggestion: string; improvedVersion?: string }>;
  missingElements: string[];
  nextSteps: string[];
}

interface TensionQuestion {
  id?: string;
  prompt: string;
  response: string;
  methodology?: string;
  rationale?: string;
  source?: "ai" | "manual";
  order: number;
}

interface SuggestedStory {
  title: string;
  client?: string;
  industry?: string;
  challenge?: string;
  outcome: string;
  metrics?: string[];
  solution?: string;
  relevance?: string;
  url?: string;
}

interface StoryCoachProps {
  storyBuilderData: StoryBuilderData;
  setStoryBuilderData: React.Dispatch<React.SetStateAction<StoryBuilderData>>;
  companyName?: string;
  isSaving?: boolean;
  lastSaved?: string | null;
  onAiSuggest: (field: string, stories: any[]) => void;
  onGenerateAll: (phase: "before" | "during" | "after") => void;
  onRefineStory: () => void;
  aiSuggestionLoading: string | null;
  onVoiceInput?: (field: string) => void;
  onExport: () => void;
  refineResult?: StoryRefineResult | null;
  onOpenTensionQuestions?: () => void;
  tensionQuestions?: TensionQuestion[];
  onRemoveTensionQuestion?: (id: string) => void;
  onUpdateTensionQuestionResponse?: (id: string, response: string) => void;
  onFindSuccessStories?: () => void;
  isLoadingStories?: boolean;
  suggestedStories?: SuggestedStory[];
  onSelectStory?: (story: SuggestedStory) => void;
}

type ElementStatus = "empty" | "draft" | "strong";

interface StoryElement {
  id: string;
  phase: "before" | "during" | "after";
  label: string;
  description: string;
  field: keyof StoryBuilderData["before"] | keyof StoryBuilderData["during"] | keyof StoryBuilderData["after"];
  getValue: (data: StoryBuilderData) => string;
  setValue: (data: StoryBuilderData, value: string) => StoryBuilderData;
  tips: string[];
  strengthCheck?: (value: string) => { status: ElementStatus; feedback: string };
}

const storyElements: StoryElement[] = [
  {
    id: "singleMessage",
    phase: "before",
    label: "Core Message",
    description: "The one idea they MUST remember",
    field: "singleMessage",
    getValue: (d) => d.before.singleMessage,
    setValue: (d, v) => ({ ...d, before: { ...d.before, singleMessage: v } }),
    tips: ["Keep it to one sentence", "Make it provocative", "Should pass the 'so what?' test"],
    strengthCheck: (v) => {
      if (!v) return { status: "empty", feedback: "Start with your core message" };
      const words = v.split(" ").length;
      if (words > 25) return { status: "draft", feedback: "Too long - simplify to one sentence" };
      if (words < 5) return { status: "draft", feedback: "Add more substance" };
      return { status: "strong", feedback: "Clear and concise!" };
    }
  },
  {
    id: "emotionalReaction",
    phase: "before",
    label: "Emotional Goal",
    description: "What should they feel?",
    field: "emotionalReaction",
    getValue: (d) => d.before.emotionalReaction,
    setValue: (d, v) => ({ ...d, before: { ...d.before, emotionalReaction: v } }),
    tips: ["Momentum, Urgency, Hope, Resolve, Curiosity", "Think about what's at stake"],
    strengthCheck: (v) => {
      if (!v) return { status: "empty", feedback: "Define the emotional response you want" };
      return { status: "strong", feedback: "Emotion defined" };
    }
  },
  {
    id: "startingHook",
    phase: "before",
    label: "Opening Hook",
    description: "Grab attention immediately",
    field: "startingHook",
    getValue: (d) => d.before.startingHook,
    setValue: (d, v) => ({ ...d, before: { ...d.before, startingHook: v } }),
    tips: ["Start with tension", "Use 'Picture this...'", "Ask a provocative question"],
    strengthCheck: (v) => {
      if (!v) return { status: "empty", feedback: "Add a hook to grab attention" };
      if (v.toLowerCase().startsWith("i want to")) return { status: "draft", feedback: "Skip the preamble - jump into action" };
      return { status: "strong", feedback: "Strong hook!" };
    }
  },
  {
    id: "heroCharacter",
    phase: "before",
    label: "Hero & Characters",
    description: "Who is this story about?",
    field: "heroCharacter",
    getValue: (d) => d.before.heroCharacter,
    setValue: (d, v) => ({ ...d, before: { ...d.before, heroCharacter: v } }),
    tips: ["Every story needs a protagonist", "Show their transformation", "Make them relatable"],
    strengthCheck: (v) => {
      if (!v) return { status: "empty", feedback: "Identify your story's hero" };
      return { status: "strong", feedback: "Characters defined" };
    }
  },
  {
    id: "openingLine",
    phase: "during",
    label: "Opening Line",
    description: "Your first spoken words",
    field: "openingLine",
    getValue: (d) => d.during.openingLine,
    setValue: (d, v) => ({ ...d, during: { ...d.during, openingLine: v } }),
    tips: ["Enter at the moment of action", "No warm-up needed", "Drop them into the scene"],
    strengthCheck: (v) => {
      if (!v) return { status: "empty", feedback: "Craft your opening line" };
      if (v.toLowerCase().includes("i want to tell you")) return { status: "draft", feedback: "Skip the preamble!" };
      return { status: "strong", feedback: "Strong opening!" };
    }
  },
  {
    id: "turningPoint",
    phase: "during",
    label: "Turning Point",
    description: "The pivotal moment",
    field: "turningPoint",
    getValue: (d) => d.during.turningPoint,
    setValue: (d, v) => ({ ...d, during: { ...d.during, turningPoint: v } }),
    tips: ["What realization changed everything?", "Show the 'aha' moment", "Build to this moment"],
    strengthCheck: (v) => {
      if (!v) return { status: "empty", feedback: "Define your story's turning point" };
      return { status: "strong", feedback: "Turning point set" };
    }
  },
  {
    id: "momentOfMeaning",
    phase: "after",
    label: "Moment of Meaning",
    description: "The insight that resonates",
    field: "momentOfMeaning",
    getValue: (d) => d.after.momentOfMeaning,
    setValue: (d, v) => ({ ...d, after: { ...d.after, momentOfMeaning: v } }),
    tips: ["A crisp insight", "Forward-looking question", "Short reflective conclusion"],
    strengthCheck: (v) => {
      if (!v) return { status: "empty", feedback: "End with meaning" };
      return { status: "strong", feedback: "Meaningful conclusion" };
    }
  },
  {
    id: "callToAction",
    phase: "after",
    label: "Call to Action",
    description: "What should they do next?",
    field: "callToAction",
    getValue: (d) => d.after.callToAction,
    setValue: (d, v) => ({ ...d, after: { ...d.after, callToAction: v } }),
    tips: ["Be specific", "Make it easy to say yes", "Connect to their goals"],
    strengthCheck: (v) => {
      if (!v) return { status: "empty", feedback: "Add a clear call to action" };
      return { status: "strong", feedback: "Clear next step" };
    }
  }
];

const emotionOptions = ["Momentum", "Urgency", "Hope", "Resolve", "Curiosity", "Concern"];
const structureOptions = [
  { value: "situation-struggle-insight-outcome", label: "Situation → Struggle → Insight → Outcome" },
  { value: "problem-agitate-solve", label: "Problem → Agitate → Solve" },
  { value: "before-after-bridge", label: "Before → After → Bridge" },
  { value: "context-action-result", label: "Context → Action → Result" },
  { value: "hero-journey", label: "Hero's Journey" }
];

export function StoryCoach({
  storyBuilderData,
  setStoryBuilderData,
  companyName,
  isSaving,
  lastSaved,
  onAiSuggest,
  onGenerateAll,
  onRefineStory,
  aiSuggestionLoading,
  onVoiceInput,
  onExport,
  refineResult,
  onOpenTensionQuestions,
  tensionQuestions,
  onRemoveTensionQuestion,
  onUpdateTensionQuestionResponse,
  onFindSuccessStories,
  isLoadingStories,
  suggestedStories,
  onSelectStory
}: StoryCoachProps) {
  const [expandedElements, setExpandedElements] = useState<Set<string>>(new Set(["singleMessage"]));
  const [showPreview, setShowPreview] = useState(false);
  const [activePhase, setActivePhase] = useState<"before" | "during" | "after">("before");
  const [showCoachingPanel, setShowCoachingPanel] = useState(true);

  const toggleElement = (id: string) => {
    setExpandedElements(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const storyStrength = useMemo(() => {
    let filled = 0;
    let strong = 0;
    let feedback: string[] = [];

    storyElements.forEach(el => {
      const value = el.getValue(storyBuilderData);
      if (el.strengthCheck) {
        const result = el.strengthCheck(value);
        if (result.status !== "empty") filled++;
        if (result.status === "strong") strong++;
        if (result.status === "draft") feedback.push(`${el.label}: ${result.feedback}`);
      } else if (value) {
        filled++;
        strong++;
      }
    });

    const testScores = [
      storyBuilderData.storyTest.strangerCareScore,
      storyBuilderData.storyTest.simplicityScore,
      storyBuilderData.storyTest.leadershipValuesScore
    ].filter(s => s !== null && s >= 3).length;

    const totalPossible = storyElements.length + 3;
    const totalScore = strong + testScores;
    const percentage = Math.round((totalScore / totalPossible) * 100);

    return { percentage, filled, strong, feedback, testScores };
  }, [storyBuilderData]);

  const phaseProgress = useMemo(() => {
    const phases = { before: 0, during: 0, after: 0 };
    const phaseTotals = { before: 0, during: 0, after: 0 };

    storyElements.forEach(el => {
      phaseTotals[el.phase]++;
      const value = el.getValue(storyBuilderData);
      if (value && value.length > 0) phases[el.phase]++;
    });

    return {
      before: phaseTotals.before > 0 ? Math.round((phases.before / phaseTotals.before) * 100) : 0,
      during: phaseTotals.during > 0 ? Math.round((phases.during / phaseTotals.during) * 100) : 0,
      after: phaseTotals.after > 0 ? Math.round((phases.after / phaseTotals.after) * 100) : 0
    };
  }, [storyBuilderData]);

  const currentPhaseElements = storyElements.filter(el => el.phase === activePhase);

  const getStatusColor = (status: ElementStatus) => {
    switch (status) {
      case "strong": return "bg-emerald-500";
      case "draft": return "bg-amber-500";
      default: return "bg-muted";
    }
  };

  const getPhaseColor = (phase: "before" | "during" | "after") => {
    switch (phase) {
      case "before": return { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-700", accent: "bg-emerald-500" };
      case "during": return { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-700", accent: "bg-blue-500" };
      case "after": return { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-700", accent: "bg-amber-500" };
    }
  };

  const generateStoryPreview = () => {
    const parts: string[] = [];
    if (storyBuilderData.before.startingHook) parts.push(storyBuilderData.before.startingHook);
    if (storyBuilderData.during.openingLine) parts.push(storyBuilderData.during.openingLine);
    if (storyBuilderData.before.heroCharacter) parts.push(`This is about ${storyBuilderData.before.heroCharacter}.`);
    if (storyBuilderData.during.turningPoint) parts.push(storyBuilderData.during.turningPoint);
    if (storyBuilderData.after.momentOfMeaning) parts.push(storyBuilderData.after.momentOfMeaning);
    if (storyBuilderData.after.explicitTakeaway) parts.push(storyBuilderData.after.explicitTakeaway);
    if (storyBuilderData.after.callToAction) parts.push(storyBuilderData.after.callToAction);
    return parts.join("\n\n") || "Start building your story to see a preview...";
  };

  const colors = getPhaseColor(activePhase);

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Story Coach
                <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">Interactive</Badge>
              </CardTitle>
              <CardDescription className="flex items-center gap-2 flex-wrap">
                Craft compelling stories for {companyName}
                {lastSaved && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-green-500/10 text-green-700 border-green-500/30">
                    <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                    {lastSaved}
                  </Badge>
                )}
                {isSaving && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-yellow-500/10 text-yellow-700 border-yellow-500/30">
                    <Loader2 className="w-2.5 h-2.5 mr-1 animate-spin" />
                    Saving...
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              data-testid="button-toggle-preview"
            >
              {showPreview ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefineStory}
              disabled={aiSuggestionLoading === "refine"}
              data-testid="button-refine-story"
            >
              {aiSuggestionLoading === "refine" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
              Refine
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-primary to-purple-600"
              onClick={() => onGenerateAll(activePhase)}
              disabled={aiSuggestionLoading === "all"}
              data-testid="button-generate-all-story"
            >
              {aiSuggestionLoading === "all" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />}
              Generate {activePhase.toUpperCase()}
            </Button>
            <Button variant="outline" size="sm" onClick={onExport} data-testid="button-export-story">
              <FileText className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Story Strength Score */}
        <div className="mt-4 p-4 rounded-lg bg-card border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="font-semibold">Story Strength</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${storyStrength.percentage >= 70 ? "text-emerald-600" : storyStrength.percentage >= 40 ? "text-amber-600" : "text-muted-foreground"}`}>
                {storyStrength.percentage}%
              </span>
            </div>
          </div>
          <Progress value={storyStrength.percentage} className="h-2 mb-3" />
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{storyStrength.strong}/{storyElements.length} elements strong</span>
            <span>{storyStrength.testScores}/3 tests passed</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Phase Navigation */}
        <div className="flex gap-2 mb-4">
          {(["before", "during", "after"] as const).map(phase => {
            const phaseColors = getPhaseColor(phase);
            const progress = phaseProgress[phase];
            return (
              <button
                key={phase}
                onClick={() => setActivePhase(phase)}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${activePhase === phase ? `${phaseColors.bg} ${phaseColors.border}` : "border-transparent hover:bg-muted/50"}`}
                data-testid={`button-phase-${phase}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-semibold ${activePhase === phase ? phaseColors.text : "text-muted-foreground"}`}>
                    {phase === "before" && <Pencil className="w-4 h-4 inline mr-1" />}
                    {phase === "during" && <PlayCircle className="w-4 h-4 inline mr-1" />}
                    {phase === "after" && <Target className="w-4 h-4 inline mr-1" />}
                    {phase.toUpperCase()}
                  </span>
                  <span className="text-xs text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-1" />
              </button>
            );
          })}
        </div>

        {/* Story Preview Panel */}
        {showPreview && (
          <div className="mb-4 p-4 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Story Preview</span>
            </div>
            <p className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground italic">
              {generateStoryPreview()}
            </p>
          </div>
        )}

        {/* Main Content Area with Coaching Sidebar */}
        <div className={`grid gap-4 ${showCoachingPanel ? "lg:grid-cols-3" : ""}`}>
          {/* Story Elements */}
          <div className={showCoachingPanel ? "lg:col-span-2" : ""}>
            <div className="space-y-3">
              {/* Phase Header */}
              <div className={`p-3 rounded-lg ${colors.bg} ${colors.border} border`}>
                <div className="flex items-center gap-2">
                  {activePhase === "before" && <Pencil className={`w-5 h-5 ${colors.text}`} />}
                  {activePhase === "during" && <PlayCircle className={`w-5 h-5 ${colors.text}`} />}
                  {activePhase === "after" && <Target className={`w-5 h-5 ${colors.text}`} />}
                  <span className={`font-bold ${colors.text}`}>
                    {activePhase === "before" && "Crafting the Story"}
                    {activePhase === "during" && "Telling the Story"}
                    {activePhase === "after" && "Landing the Story"}
                  </span>
                </div>
              </div>

              {/* Special: Emotion selector for BEFORE phase */}
              {activePhase === "before" && (
                <div className="p-3 rounded-lg border bg-card">
                  <Label className="text-sm font-medium mb-2 block">Emotional Goal</Label>
                  <div className="flex flex-wrap gap-2">
                    {emotionOptions.map(emotion => (
                      <Badge
                        key={emotion}
                        variant={storyBuilderData.before.emotionalReaction === emotion ? "default" : "outline"}
                        className="cursor-pointer hover-elevate"
                        onClick={() => setStoryBuilderData(prev => ({ ...prev, before: { ...prev.before, emotionalReaction: emotion } }))}
                      >
                        {emotion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Special: Structure selector for BEFORE phase */}
              {activePhase === "before" && (
                <div className="p-3 rounded-lg border bg-card">
                  <Label className="text-sm font-medium mb-2 block">Story Structure</Label>
                  <Select
                    value={storyBuilderData.before.storyStructure}
                    onValueChange={(v) => setStoryBuilderData(prev => ({ ...prev, before: { ...prev.before, storyStructure: v } }))}
                  >
                    <SelectTrigger data-testid="select-story-structure">
                      <SelectValue placeholder="Select a narrative structure" />
                    </SelectTrigger>
                    <SelectContent>
                      {structureOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Collapsible Story Elements */}
              {currentPhaseElements.filter(el => el.id !== "emotionalReaction").map((element, idx) => {
                const value = element.getValue(storyBuilderData);
                const isExpanded = expandedElements.has(element.id);
                const strengthResult = element.strengthCheck?.(value) || { status: value ? "strong" : "empty", feedback: "" };

                return (
                  <Collapsible
                    key={element.id}
                    open={isExpanded}
                    onOpenChange={() => toggleElement(element.id)}
                  >
                    <div className={`rounded-lg border bg-card overflow-hidden transition-all ${isExpanded ? "ring-2 ring-primary/20" : ""}`}>
                      <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(strengthResult.status as ElementStatus)}`} />
                          <span className={`w-6 h-6 rounded-full ${colors.accent} text-white flex items-center justify-center text-xs font-bold`}>
                            {idx + 1}
                          </span>
                          <div className="text-left">
                            <p className="font-medium text-sm">{element.label}</p>
                            {!isExpanded && value && (
                              <p className="text-xs text-muted-foreground truncate max-w-[300px]">{value}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {strengthResult.status === "strong" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          {strengthResult.status === "draft" && <AlertCircle className="w-4 h-4 text-amber-500" />}
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="px-3 pb-3 pt-0">
                          <p className="text-xs text-muted-foreground mb-2 italic pl-11">{element.description}</p>
                          
                          <div className="flex items-start gap-2">
                            <Textarea
                              placeholder={`Enter your ${element.label.toLowerCase()}...`}
                              value={value}
                              onChange={(e) => setStoryBuilderData(prev => element.setValue(prev, e.target.value))}
                              className="min-h-[80px] text-sm flex-1"
                              data-testid={`input-${element.id}`}
                            />
                          </div>

                          {/* Inline Coaching Feedback */}
                          {strengthResult.feedback && strengthResult.status !== "strong" && (
                            <div className="mt-2 p-2 rounded bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 flex items-start gap-2">
                              <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-amber-700 dark:text-amber-400">{strengthResult.feedback}</span>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onAiSuggest(element.id, [])}
                              disabled={aiSuggestionLoading === element.id}
                              className="text-primary h-7"
                              data-testid={`button-ai-${element.id}`}
                            >
                              {aiSuggestionLoading === element.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                              Generate
                            </Button>
                            {onVoiceInput && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onVoiceInput(element.id)}
                                className="text-muted-foreground h-7"
                                data-testid={`button-voice-${element.id}`}
                              >
                                <Mic className="w-3 h-3 mr-1" />
                                Voice
                              </Button>
                            )}
                          </div>

                          {/* Quick Tips */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {element.tips.map((tip, i) => (
                              <Badge key={i} variant="outline" className="text-[10px] bg-muted/50">
                                {tip}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}

              {/* BEFORE Phase Special Sections: Tension Questions & Success Stories */}
              {activePhase === "before" && (
                <div className="space-y-3 mt-4">
                  {/* Tension Questions Section */}
                  <div className="p-4 rounded-lg border bg-blue-500/5 border-blue-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">?</div>
                        <Label className="font-medium">Tension Questions</Label>
                        <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-700 border-blue-500/30">
                          SPIN • Miller Heiman • PSS
                        </Badge>
                      </div>
                      {onOpenTensionQuestions && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={onOpenTensionQuestions}
                          className="h-7 gap-1 border-blue-500/30 text-blue-600"
                          data-testid="button-add-tension-questions"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span className="text-xs">Generate Questions</span>
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 italic">
                      AI-generated questions based on Korn Ferry methodologies to keep the conversation flowing
                    </p>

                    {tensionQuestions && tensionQuestions.length > 0 ? (
                      <div className="space-y-2">
                        {tensionQuestions.map((q, idx) => (
                          <div key={q.id || `tq-${idx}`} className="p-3 rounded-lg border bg-card">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                {q.methodology && (
                                  <Badge 
                                    variant="outline" 
                                    className={`text-[10px] shrink-0 ${
                                      q.methodology === "SPIN" ? "bg-blue-500/10 text-blue-700 border-blue-500/30" :
                                      q.methodology === "MILLER_HEIMAN" ? "bg-purple-500/10 text-purple-700 border-purple-500/30" :
                                      q.methodology === "PSS" ? "bg-amber-500/10 text-amber-700 border-amber-500/30" :
                                      "bg-gray-500/10 text-gray-700 border-gray-500/30"
                                    }`}
                                  >
                                    {q.methodology === "MILLER_HEIMAN" ? "Miller Heiman" : q.methodology}
                                  </Badge>
                                )}
                                {q.source === "ai" && (
                                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 border-emerald-500/30">
                                    <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                                    AI
                                  </Badge>
                                )}
                              </div>
                              {onRemoveTensionQuestion && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                  onClick={() => onRemoveTensionQuestion(q.id || `tq-${idx}`)}
                                  data-testid={`button-remove-question-${idx}`}
                                >
                                  ×
                                </Button>
                              )}
                            </div>
                            <p className="text-sm font-medium mb-2">{q.prompt}</p>
                            {q.rationale && <p className="text-xs text-muted-foreground mb-2 italic">{q.rationale}</p>}
                            {onUpdateTensionQuestionResponse && (
                              <Textarea
                                placeholder="Add your notes or the response you received..."
                                value={q.response}
                                onChange={(e) => onUpdateTensionQuestionResponse(q.id || `tq-${idx}`, e.target.value)}
                                className="min-h-[50px] text-sm"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 border-2 border-dashed rounded-lg">
                        <MessageCircle className="w-6 h-6 mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-xs text-muted-foreground">No questions added yet</p>
                        <p className="text-xs text-muted-foreground mt-1">Click "Generate Questions" for AI-powered recommendations</p>
                      </div>
                    )}
                  </div>

                  {/* Success Stories Section */}
                  <div className="p-4 rounded-lg border bg-amber-500/5 border-amber-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-600" />
                        <Label className="font-medium">Korn Ferry Success Stories</Label>
                      </div>
                      {onFindSuccessStories && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={onFindSuccessStories}
                          disabled={isLoadingStories}
                          className="h-7 gap-1 border-amber-500/30 text-amber-700"
                          data-testid="button-find-stories"
                        >
                          {isLoadingStories ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trophy className="w-3 h-3" />}
                          <span className="text-xs">Find Relevant Stories</span>
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 italic">
                      Reference past client successes to build credibility
                    </p>

                    {suggestedStories && suggestedStories.length > 0 ? (
                      <div className="space-y-2">
                        {suggestedStories.map((story, idx) => (
                          <div 
                            key={idx} 
                            className="p-3 rounded-lg border bg-card cursor-pointer hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors"
                            onClick={() => onSelectStory?.(story)}
                            data-testid={`card-success-story-${idx}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium">{story.title}</p>
                                {(story.client || story.industry) && (
                                  <p className="text-xs text-muted-foreground">
                                    {[story.client, story.industry].filter(Boolean).join(" • ")}
                                  </p>
                                )}
                              </div>
                              <Badge variant="outline" className="text-[10px] shrink-0">Use</Badge>
                            </div>
                            <p className="text-xs mt-1">{story.outcome}</p>
                            {story.metrics && story.metrics.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {story.metrics.slice(0, 3).map((m, i) => (
                                  <Badge key={i} variant="secondary" className="text-[10px]">{m}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 border-2 border-dashed rounded-lg">
                        <Trophy className="w-6 h-6 mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-xs text-muted-foreground">No stories loaded yet</p>
                        <p className="text-xs text-muted-foreground mt-1">Click "Find Relevant Stories" to get AI suggestions</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Coaching Sidebar */}
          {showCoachingPanel && (
            <div className="space-y-3">
              <Card className="border-primary/20">
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">AI Coach</span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => setShowCoachingPanel(false)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="py-3 px-4 pt-0">
                  <div className="space-y-3">
                    {/* AI Refine Results */}
                    {refineResult && (
                      <div className="space-y-2">
                        <div className="p-2 rounded bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-primary">AI Score</span>
                            <Badge className={refineResult.overallScore >= 7 ? "bg-emerald-500" : refineResult.overallScore >= 5 ? "bg-amber-500" : "bg-red-500"}>
                              {refineResult.overallScore}/10
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{refineResult.overallFeedback}</p>
                        </div>
                        {refineResult.improvements.slice(0, 2).map((imp, i) => (
                          <div key={i} className="p-2 rounded bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                            <p className="text-xs font-medium text-amber-800 dark:text-amber-300">{imp.element}</p>
                            <p className="text-xs text-amber-700 dark:text-amber-400">{imp.suggestion}</p>
                          </div>
                        ))}
                        {refineResult.nextSteps.length > 0 && (
                          <div className="p-2 rounded bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                            <p className="text-xs font-medium text-blue-800 dark:text-blue-300">Next Steps</p>
                            <ul className="text-xs text-blue-700 dark:text-blue-400 list-disc pl-3 mt-1 space-y-0.5">
                              {refineResult.nextSteps.slice(0, 2).map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Dynamic Coaching Tips based on current state */}
                    {!refineResult && storyStrength.feedback.length > 0 ? (
                      storyStrength.feedback.slice(0, 3).map((tip, i) => (
                        <div key={i} className="p-2 rounded bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                          <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {tip}
                          </p>
                        </div>
                      ))
                    ) : !refineResult && storyStrength.percentage >= 70 ? (
                      <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          Your story is shaping up well! Consider running the Story Test.
                        </p>
                      </div>
                    ) : !refineResult && (
                      <div className="p-2 rounded bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-700 dark:text-blue-400 flex items-start gap-2">
                          <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          Keep building! Complete more elements to strengthen your story.
                        </p>
                      </div>
                    )}

                    {/* Phase-specific tips */}
                    <div className="pt-2 border-t">
                      <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-2">
                        {activePhase.toUpperCase()} Phase Tips
                      </p>
                      <div className="space-y-2">
                        {activePhase === "before" && (
                          <>
                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                              <Zap className="w-3 h-3 mt-0.5 flex-shrink-0 text-emerald-500" />
                              <span>Start with one clear message</span>
                            </div>
                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                              <MessageCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-emerald-500" />
                              <span>Make the hook provocative</span>
                            </div>
                          </>
                        )}
                        {activePhase === "during" && (
                          <>
                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                              <Zap className="w-3 h-3 mt-0.5 flex-shrink-0 text-blue-500" />
                              <span>Enter at the moment of action</span>
                            </div>
                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                              <MessageCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-blue-500" />
                              <span>Keep it conversational</span>
                            </div>
                          </>
                        )}
                        {activePhase === "after" && (
                          <>
                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                              <Zap className="w-3 h-3 mt-0.5 flex-shrink-0 text-amber-500" />
                              <span>End with clear meaning</span>
                            </div>
                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                              <MessageCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-amber-500" />
                              <span>Include a specific ask</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs"
                        onClick={onRefineStory}
                        disabled={aiSuggestionLoading === "refine"}
                        data-testid="button-coach-refine"
                      >
                        {aiSuggestionLoading === "refine" ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                        Review & Improve My Story
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Toggle Coaching Panel Button */}
          {!showCoachingPanel && (
            <Button
              size="sm"
              variant="outline"
              className="fixed right-4 top-1/2 -translate-y-1/2 z-10"
              onClick={() => setShowCoachingPanel(true)}
            >
              <Lightbulb className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
