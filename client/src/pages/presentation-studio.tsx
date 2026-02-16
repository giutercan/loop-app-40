import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Presentation,
  Download,
  Sparkles,
  Target,
  BarChart3,
  Users,
  FileText,
  Shield,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ChevronRight,
  Loader2,
  Brain,
  Layers,
  ArrowLeft,
  Eye,
  RefreshCcw,
  BookOpen,
  MessageSquare,
  Zap,
  Layout,
  Search,
} from "lucide-react";

type PresentationPurpose = 'customer_engagement' | 'qbr' | 'executive_pitch' | 'discovery_readout' | 'handoff_brief' | 'evidence_review' | 'value_story';
type PresentationAudience = 'c_suite' | 'client_sponsor' | 'delivery_team' | 'board' | 'internal_review' | 'buying_committee';
type PresentationTemplate = 'executive_modern' | 'data_driven' | 'visual_narrative';
type TopicCategory = 'discovery_insights' | 'stakeholder_priorities' | 'kpi_commitments' | 'alignment_progress' | 'value_realization' | 'evidence_pack' | 'success_stories' | 'green_sheet_objectives' | 'growth_accelerator' | 'competitive_landscape';

interface TopicInfo {
  id: TopicCategory;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  available: boolean;
  dataPoints: number;
}

interface SlideContent {
  id: string;
  slideType: string;
  title: string;
  subtitle?: string;
  bodyContent?: string;
  bulletPoints?: string[];
  metrics?: Array<{ label: string; value: string; trend?: string; color?: string }>;
  quoteText?: string;
  quoteAuthor?: string;
  imageCategory?: string;
  coachingTip?: string;
  speakerNotes?: string;
  topicSource: TopicCategory;
}

interface CoachingRecommendation {
  type: 'strength' | 'gap' | 'suggestion' | 'narrative_flow' | 'template_tip';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionableAdvice: string;
}

interface PresentationPlan {
  recommendedTemplate: PresentationTemplate;
  templateRationale: string;
  slides: SlideContent[];
  coaching: CoachingRecommendation[];
  narrativeFlow: string;
  estimatedDuration: string;
  dataCompleteness: Record<string, { available: boolean; dataPoints: number; quality: string }>;
}

const PURPOSE_OPTIONS: Array<{ value: PresentationPurpose; label: string; description: string; icon: React.ComponentType<any> }> = [
  { value: 'customer_engagement', label: 'Customer Engagement', description: 'Client-facing meeting deck', icon: Users },
  { value: 'qbr', label: 'QBR', description: 'Quarterly business review', icon: BarChart3 },
  { value: 'executive_pitch', label: 'Executive Pitch', description: 'C-suite value presentation', icon: TrendingUp },
  { value: 'discovery_readout', label: 'Discovery Readout', description: 'Share initial findings', icon: Search },
  { value: 'handoff_brief', label: 'Handoff Brief', description: 'Sales to delivery transition', icon: FileText },
  { value: 'evidence_review', label: 'Evidence Review', description: 'Proof of value showcase', icon: Shield },
  { value: 'value_story', label: 'Value Story', description: 'End-to-end value narrative', icon: Sparkles },
];

const AUDIENCE_OPTIONS: Array<{ value: PresentationAudience; label: string }> = [
  { value: 'c_suite', label: 'C-Suite' },
  { value: 'client_sponsor', label: 'Client Sponsor' },
  { value: 'delivery_team', label: 'Delivery Team' },
  { value: 'board', label: 'Board' },
  { value: 'internal_review', label: 'Internal Review' },
  { value: 'buying_committee', label: 'Buying Committee' },
];

const TOPIC_DEFINITIONS: Array<{ id: TopicCategory; label: string; icon: React.ComponentType<any> }> = [
  { id: 'discovery_insights', label: 'Discovery Insights', icon: Search },
  { id: 'stakeholder_priorities', label: 'Stakeholder Priorities', icon: Users },
  { id: 'kpi_commitments', label: 'KPI Commitments', icon: Target },
  { id: 'alignment_progress', label: 'Alignment Progress', icon: Layers },
  { id: 'value_realization', label: 'Value Realization', icon: TrendingUp },
  { id: 'evidence_pack', label: 'Evidence Pack', icon: Shield },
  { id: 'success_stories', label: 'Success Stories', icon: BookOpen },
  { id: 'green_sheet_objectives', label: 'Green Sheet Objectives', icon: MessageSquare },
  { id: 'growth_accelerator', label: 'Growth Accelerator', icon: Zap },
  { id: 'competitive_landscape', label: 'Competitive Landscape', icon: BarChart3 },
];

const TEMPLATE_OPTIONS: Array<{ value: PresentationTemplate; label: string; description: string }> = [
  { value: 'executive_modern', label: 'Executive Modern', description: 'Clean, minimal, impactful' },
  { value: 'data_driven', label: 'Data Driven', description: 'Charts, metrics, evidence-heavy' },
  { value: 'visual_narrative', label: 'Visual Narrative', description: 'Image-rich storytelling' },
];

const COACHING_TYPE_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string; icon: React.ComponentType<any> }> = {
  strength: { label: 'Strengths', color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', icon: CheckCircle2 },
  gap: { label: 'Gaps', color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', icon: AlertTriangle },
  suggestion: { label: 'Suggestions', color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', icon: Lightbulb },
  narrative_flow: { label: 'Narrative Flow', color: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', icon: Brain },
  template_tip: { label: 'Template Tips', color: 'text-cyan-700', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200', icon: Layout },
};

function getSlideTypeLabel(slideType: string): string {
  const map: Record<string, string> = {
    title: 'Title',
    content: 'Content',
    metrics: 'Metrics',
    quote: 'Quote',
    bullets: 'Bullets',
    comparison: 'Comparison',
    timeline: 'Timeline',
    summary: 'Summary',
    divider: 'Divider',
  };
  return map[slideType] || slideType;
}

function getTopicLabel(topic: TopicCategory): string {
  return TOPIC_DEFINITIONS.find(t => t.id === topic)?.label || topic;
}

export default function PresentationStudioPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<TopicCategory[]>([]);
  const [purpose, setPurpose] = useState<PresentationPurpose>('customer_engagement');
  const [audience, setAudience] = useState<PresentationAudience>('client_sponsor');
  const [templateOverride, setTemplateOverride] = useState<PresentationTemplate | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [plan, setPlan] = useState<PresentationPlan | null>(null);
  const [step, setStep] = useState<'configure' | 'preview'>('configure');

  const { data: accounts = [] } = useQuery({ queryKey: ['/api/accounts'] });
  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
    enabled: !!selectedAccountId,
    select: (data: any[]) => data.filter((p: any) => p.accountId === selectedAccountId),
  });
  const { data: topicsData } = useQuery({
    queryKey: ['/api/presentations/topics', selectedProjectId],
    enabled: !!selectedProjectId,
  });

  const availableTopics: TopicInfo[] = TOPIC_DEFINITIONS.map(td => {
    const topicData = topicsData && typeof topicsData === 'object'
      ? (topicsData as Record<string, any>)[td.id]
      : null;
    return {
      id: td.id,
      label: td.label,
      description: '',
      icon: td.icon,
      available: topicData?.available ?? false,
      dataPoints: topicData?.dataPoints ?? 0,
    };
  });

  useEffect(() => {
    setSelectedProjectId(null);
    setSelectedTopics([]);
    setPlan(null);
    setStep('configure');
  }, [selectedAccountId]);

  useEffect(() => {
    setSelectedTopics([]);
    setPlan(null);
    setStep('configure');
  }, [selectedProjectId]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/presentations/plan', {
        accountId: selectedAccountId,
        projectId: selectedProjectId,
        purpose,
        audience,
        selectedTopics,
        templateOverride: templateOverride || undefined,
        customTitle: customTitle || undefined,
      });
      return res.json();
    },
    onSuccess: (data: PresentationPlan) => {
      setPlan(data);
      setStep('preview');
      toast({ title: 'Presentation Generated', description: `${data.slides.length} slides created with ${data.coaching.length} coaching recommendations.` });
    },
    onError: () => {
      toast({ title: 'Generation Failed', description: 'Could not generate the presentation plan. Please try again.', variant: 'destructive' });
    },
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/presentations/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: selectedAccountId,
          projectId: selectedProjectId,
          purpose,
          audience,
          selectedTopics,
          templateOverride: templateOverride || undefined,
          customTitle: customTitle || undefined,
        }),
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${customTitle || 'Korn_Ferry_Presentation'}.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast({ title: 'Export Complete', description: 'Your presentation has been downloaded.' });
    },
    onError: () => {
      toast({ title: 'Export Failed', description: 'Could not export the presentation. Please try again.', variant: 'destructive' });
    },
  });

  function toggleTopic(topicId: TopicCategory) {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(t => t !== topicId)
        : [...prev, topicId]
    );
  }

  function renderCoachingPanel(coaching: CoachingRecommendation[]) {
    const grouped = coaching.reduce((acc, c) => {
      if (!acc[c.type]) acc[c.type] = [];
      acc[c.type].push(c);
      return acc;
    }, {} as Record<string, CoachingRecommendation[]>);

    return (
      <div className="space-y-4">
        {Object.entries(grouped).map(([type, items]) => {
          const config = COACHING_TYPE_CONFIG[type];
          if (!config) return null;
          const IconComp = config.icon;
          return (
            <div key={type}>
              <div className="flex items-center gap-2 mb-2">
                <IconComp className={`w-4 h-4 ${config.color}`} />
                <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
                <Badge variant="secondary" className="text-xs">{items.length}</Badge>
              </div>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <Card key={idx} className={`p-3 ${config.bgColor} border ${config.borderColor}`}>
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                        <p className="text-xs mt-2 font-medium text-foreground/80">{item.actionableAdvice}</p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {item.priority}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderSlidePreview(slide: SlideContent, index: number) {
    return (
      <Card
        key={slide.id}
        className="p-4 hover-elevate cursor-default"
        data-testid={`slide-card-${index}`}
      >
        <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-muted-foreground">#{index + 1}</span>
            <Badge variant="secondary" className="text-xs">{getSlideTypeLabel(slide.slideType)}</Badge>
            <Badge variant="outline" className="text-xs">{getTopicLabel(slide.topicSource)}</Badge>
          </div>
        </div>
        <h4 className="text-sm font-semibold text-foreground mb-1 leading-tight">{slide.title}</h4>
        {slide.subtitle && (
          <p className="text-xs text-muted-foreground mb-2">{slide.subtitle}</p>
        )}

        <div className="rounded-md bg-muted/50 p-3 min-h-[80px]">
          {slide.slideType === 'metrics' && slide.metrics ? (
            <div className="grid grid-cols-2 gap-2">
              {slide.metrics.slice(0, 4).map((m, i) => (
                <div key={i} className="rounded bg-background p-2">
                  <p className="text-[10px] text-muted-foreground truncate">{m.label}</p>
                  <p className="text-sm font-bold" style={{ color: m.color || '#00634F' }}>{m.value}</p>
                  {m.trend && <p className="text-[10px] text-muted-foreground">{m.trend}</p>}
                </div>
              ))}
            </div>
          ) : slide.slideType === 'quote' && slide.quoteText ? (
            <div>
              <p className="text-xs italic text-muted-foreground leading-relaxed">"{slide.quoteText.slice(0, 120)}..."</p>
              {slide.quoteAuthor && <p className="text-[10px] mt-1 font-medium text-foreground/70">- {slide.quoteAuthor}</p>}
            </div>
          ) : slide.bulletPoints && slide.bulletPoints.length > 0 ? (
            <ul className="space-y-1">
              {slide.bulletPoints.slice(0, 4).map((bp, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-[#00634F] mt-1.5 shrink-0" />
                  <span className="text-[10px] text-muted-foreground leading-tight">{bp.slice(0, 60)}{bp.length > 60 ? '...' : ''}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-1.5">
              <div className="h-1.5 rounded bg-muted w-full" />
              <div className="h-1.5 rounded bg-muted w-4/5" />
              <div className="h-1.5 rounded bg-muted w-3/5" />
            </div>
          )}
        </div>

        {slide.coachingTip && (
          <div className="mt-2 flex items-start gap-1.5 p-2 rounded bg-amber-50 border border-amber-200">
            <Lightbulb className="w-3 h-3 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-[10px] text-amber-800 leading-tight">{slide.coachingTip}</p>
          </div>
        )}
      </Card>
    );
  }

  if (step === 'preview' && plan) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-background sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStep('configure')}
                data-testid="button-back-configure"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Eye className="w-4 h-4 text-[#A3238E]" />
                  <h1 className="text-lg font-semibold text-foreground">Presentation Preview</h1>
                </div>
                <p className="text-xs text-muted-foreground">{plan.slides.length} slides · {plan.estimatedDuration}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => setStep('configure')}
                data-testid="button-reconfigure"
              >
                <RefreshCcw className="w-4 h-4 mr-1.5" />
                Reconfigure
              </Button>
              <Button
                onClick={() => exportMutation.mutate()}
                disabled={exportMutation.isPending}
                data-testid="button-export-pptx"
              >
                {exportMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-1.5" />
                )}
                Export PPTX
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {plan.slides.map((slide, idx) => renderSlidePreview(slide, idx))}
              </div>
            </div>

            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Presentation className="w-4 h-4 text-[#005971]" />
                  Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Template</span>
                    <span className="font-medium text-foreground">{TEMPLATE_OPTIONS.find(t => t.value === (templateOverride || plan.recommendedTemplate))?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Slides</span>
                    <span className="font-medium text-foreground">{plan.slides.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium text-foreground">{plan.estimatedDuration}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#A3238E]" />
                  Narrative Flow
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{plan.narrativeFlow}</p>
              </Card>

              <Card className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">Template Rationale</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{plan.templateRationale}</p>
              </Card>

              {plan.coaching.length > 0 && (
                <Card className="p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-[#005971]" />
                    Coaching ({plan.coaching.length})
                  </h3>
                  {renderCoachingPanel(plan.coaching)}
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <Link href="/accounts">
            <Button variant="ghost" size="icon" data-testid="button-back-accounts">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Sparkles className="w-5 h-5 text-[#A3238E]" />
              <h1 className="text-lg font-semibold text-foreground">Presentation Studio</h1>
            </div>
            <p className="text-xs text-muted-foreground">AI-powered presentation builder</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <ScrollArea className="h-[calc(100vh-120px)]">
              <div className="space-y-6 pr-2">
                <Card className="p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Account & Project</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="account-select" className="text-xs text-muted-foreground mb-1 block">Account</Label>
                      <Select
                        value={selectedAccountId?.toString() || ''}
                        onValueChange={(val) => setSelectedAccountId(Number(val))}
                      >
                        <SelectTrigger data-testid="select-account" id="account-select">
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {(accounts as any[]).map((acc: any) => (
                            <SelectItem key={acc.id} value={acc.id.toString()} data-testid={`select-account-${acc.id}`}>
                              {acc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="project-select" className="text-xs text-muted-foreground mb-1 block">Project</Label>
                      <Select
                        value={selectedProjectId?.toString() || ''}
                        onValueChange={(val) => setSelectedProjectId(Number(val))}
                        disabled={!selectedAccountId}
                      >
                        <SelectTrigger data-testid="select-project" id="project-select">
                          <SelectValue placeholder={selectedAccountId ? "Select project" : "Select account first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {(projects as any[]).map((proj: any) => (
                            <SelectItem key={proj.id} value={proj.id.toString()} data-testid={`select-project-${proj.id}`}>
                              {proj.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Purpose</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {PURPOSE_OPTIONS.map(opt => {
                      const Icon = opt.icon;
                      const isSelected = purpose === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setPurpose(opt.value)}
                          className={`flex items-center gap-3 p-3 rounded-md border text-left transition-colors ${
                            isSelected
                              ? 'border-[#00634F] bg-[#00634F]/5'
                              : 'border-border hover-elevate'
                          }`}
                          data-testid={`purpose-${opt.value}`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#00634F]' : 'text-muted-foreground'}`} />
                          <div className="min-w-0">
                            <p className={`text-sm font-medium ${isSelected ? 'text-[#00634F]' : 'text-foreground'}`}>{opt.label}</p>
                            <p className="text-xs text-muted-foreground">{opt.description}</p>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#00634F] ml-auto shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Audience</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {AUDIENCE_OPTIONS.map(opt => {
                      const isSelected = audience === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setAudience(opt.value)}
                          className={`p-2.5 rounded-md border text-center transition-colors ${
                            isSelected
                              ? 'border-[#005971] bg-[#005971]/5'
                              : 'border-border hover-elevate'
                          }`}
                          data-testid={`audience-${opt.value}`}
                        >
                          <p className={`text-xs font-medium ${isSelected ? 'text-[#005971]' : 'text-foreground'}`}>{opt.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Topics</h3>
                  <div className="space-y-2">
                    {availableTopics.map(topic => {
                      const TopicIcon = TOPIC_DEFINITIONS.find(td => td.id === topic.id)?.icon || FileText;
                      const isChecked = selectedTopics.includes(topic.id);
                      return (
                        <label
                          key={topic.id}
                          className={`flex items-center gap-3 p-2.5 rounded-md border cursor-pointer transition-colors ${
                            isChecked
                              ? 'border-[#009B77] bg-[#009B77]/5'
                              : 'border-border hover-elevate'
                          }`}
                          data-testid={`topic-${topic.id}`}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleTopic(topic.id)}
                            data-testid={`checkbox-topic-${topic.id}`}
                          />
                          <TopicIcon className={`w-4 h-4 shrink-0 ${isChecked ? 'text-[#009B77]' : 'text-muted-foreground'}`} />
                          <span className="text-sm text-foreground flex-1">{topic.label}</span>
                          {topic.available ? (
                            <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700">
                              <CheckCircle2 className="w-3 h-3 mr-0.5" />
                              {topic.dataPoints}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] text-muted-foreground">
                              No data
                            </Badge>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Template</h3>
                  {plan && (
                    <p className="text-xs text-muted-foreground mb-2">
                      Recommended: <span className="font-medium">{TEMPLATE_OPTIONS.find(t => t.value === plan.recommendedTemplate)?.label}</span>
                    </p>
                  )}
                  <div className="grid grid-cols-1 gap-2">
                    {TEMPLATE_OPTIONS.map(opt => {
                      const isSelected = (templateOverride || plan?.recommendedTemplate) === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setTemplateOverride(opt.value)}
                          className={`p-3 rounded-md border text-left transition-colors ${
                            isSelected
                              ? 'border-[#A3238E] bg-[#A3238E]/5'
                              : 'border-border hover-elevate'
                          }`}
                          data-testid={`template-${opt.value}`}
                        >
                          <p className={`text-sm font-medium ${isSelected ? 'text-[#A3238E]' : 'text-foreground'}`}>{opt.label}</p>
                          <p className="text-xs text-muted-foreground">{opt.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Custom Title</h3>
                  <Input
                    placeholder="Optional presentation title"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    data-testid="input-custom-title"
                  />
                </Card>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => generateMutation.mutate()}
                  disabled={selectedTopics.length === 0 || !selectedProjectId || generateMutation.isPending}
                  data-testid="button-generate"
                >
                  {generateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  {generateMutation.isPending ? 'Generating...' : 'Generate Presentation'}
                </Button>
              </div>
            </ScrollArea>
          </div>

          <div className="lg:col-span-3">
            <ScrollArea className="h-[calc(100vh-120px)]">
              {plan && plan.coaching.length > 0 ? (
                <div className="space-y-4 pr-2">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Brain className="w-4 h-4 text-[#A3238E]" />
                      <h3 className="text-sm font-semibold text-foreground">Coaching Recommendations</h3>
                      <Badge variant="secondary" className="text-xs">{plan.coaching.length}</Badge>
                    </div>
                    {renderCoachingPanel(plan.coaching)}
                  </Card>

                  <Card className="p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Narrative Flow</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{plan.narrativeFlow}</p>
                  </Card>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => setStep('preview')}
                      data-testid="button-view-slides"
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      View Slides ({plan.slides.length})
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => exportMutation.mutate()}
                      disabled={exportMutation.isPending}
                      data-testid="button-export-from-configure"
                    >
                      {exportMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-1.5" />
                      )}
                      Export PPTX
                    </Button>
                  </div>
                </div>
              ) : (
                <Card className="p-6">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-[#005971]/10 flex items-center justify-center mx-auto mb-4">
                      <Presentation className="w-8 h-8 text-[#005971]" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Build Your Presentation</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                      Select an account, project, and topics to generate an AI-powered branded presentation with coaching recommendations.
                    </p>
                    <Separator className="my-6" />
                    <div className="text-left max-w-sm mx-auto space-y-3">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tips for effective presentations</h4>
                      <div className="flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 text-[#009B77] mt-1 shrink-0" />
                        <p className="text-xs text-muted-foreground">Select topics with high data availability for richer content</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 text-[#009B77] mt-1 shrink-0" />
                        <p className="text-xs text-muted-foreground">Match your audience to the purpose for tailored messaging</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 text-[#009B77] mt-1 shrink-0" />
                        <p className="text-xs text-muted-foreground">Include evidence packs and KPI data for credibility</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 text-[#009B77] mt-1 shrink-0" />
                        <p className="text-xs text-muted-foreground">Use coaching recommendations to refine your narrative</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}