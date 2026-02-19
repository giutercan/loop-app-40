import { useState, useEffect, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
  ChevronLeft,
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
  Pencil,
  X,
  Check,
  Send,
  Plus,
  Trash2,
  GripVertical,
  Maximize2,
  Minimize2,
  WandSparkles,
  Upload,
  Palette,
  Type,
  LayoutTemplate,
  Compass,
  HelpCircle,
  BookText,
  CircleDot,
  ArrowRight,
  Database,
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
  flowSteps?: Array<{ label: string; description?: string }>;
  comparisonItems?: Array<{ label: string; before: string; after: string }>;
  chartData?: any;
}

interface CoachingRecommendation {
  type: 'strength' | 'gap' | 'suggestion' | 'narrative_flow' | 'template_tip';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionableAdvice: string;
  relatedTopic?: TopicCategory;
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
  strength: { label: 'Strengths', color: 'text-emerald-700 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30', borderColor: 'border-emerald-200 dark:border-emerald-800', icon: CheckCircle2 },
  gap: { label: 'Gaps', color: 'text-amber-700 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-950/30', borderColor: 'border-amber-200 dark:border-amber-800', icon: AlertTriangle },
  suggestion: { label: 'Suggestions', color: 'text-blue-700 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-950/30', borderColor: 'border-blue-200 dark:border-blue-800', icon: Lightbulb },
  narrative_flow: { label: 'Narrative Flow', color: 'text-purple-700 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-950/30', borderColor: 'border-purple-200 dark:border-purple-800', icon: Brain },
  template_tip: { label: 'Template Tips', color: 'text-cyan-700 dark:text-cyan-400', bgColor: 'bg-cyan-50 dark:bg-cyan-950/30', borderColor: 'border-cyan-200 dark:border-cyan-800', icon: Layout },
};

function getSlideTypeLabel(slideType: string): string {
  const map: Record<string, string> = {
    title: 'Title', content: 'Content', metrics: 'Metrics', kpi_scorecard: 'KPI Scorecard',
    quote: 'Quote', bullets: 'Bullets', comparison: 'Comparison', timeline: 'Timeline',
    summary: 'Summary', divider: 'Divider', section_divider: 'Section', chart: 'Chart',
    flow_diagram: 'Flow', image_feature: 'Feature',
  };
  return map[slideType] || slideType;
}

function getTopicLabel(topic: TopicCategory): string {
  return TOPIC_DEFINITIONS.find(t => t.id === topic)?.label || topic;
}

const TEMPLATE_COLORS: Record<PresentationTemplate, { bg: string; accent: string; headerBg: string; headerText: string }> = {
  executive_modern: { bg: '#00173B', accent: '#009B77', headerBg: '#00173B', headerText: '#ffffff' },
  data_driven: { bg: '#ffffff', accent: '#005971', headerBg: '#005971', headerText: '#ffffff' },
  visual_narrative: { bg: '#00634F', accent: '#A3238E', headerBg: '#00634F', headerText: '#ffffff' },
};

function MiniBarChart({ chartData, colors: templateColors }: { chartData: any; colors: any }) {
  if (!chartData?.data || !chartData?.labels) return null;
  const maxVal = Math.max(...chartData.data, 1);
  const barColors = chartData.colors || [templateColors.accent, '#005971', '#009B77', '#00ADBB', '#A3238E', '#8DC63F', '#05C690', '#929192'];

  if (chartData.type === 'pie' || chartData.type === 'doughnut') {
    const total = chartData.data.reduce((a: number, b: number) => a + b, 0) || 1;
    let cumAngle = 0;
    const segments = chartData.data.map((val: number, i: number) => {
      const angle = (val / total) * 360;
      const start = cumAngle;
      cumAngle += angle;
      return { start, angle, color: barColors[i % barColors.length], label: chartData.labels[i], val, pct: Math.round((val / total) * 100) };
    });

    return (
      <div className="flex items-center gap-3 w-full h-full">
        <div className="w-[45%] flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full max-w-[80px]">
            {segments.map((seg: any, i: number) => {
              const startRad = (seg.start - 90) * Math.PI / 180;
              const endRad = (seg.start + seg.angle - 90) * Math.PI / 180;
              const largeArc = seg.angle > 180 ? 1 : 0;
              const outerR = chartData.type === 'doughnut' ? 45 : 48;
              const innerR = chartData.type === 'doughnut' ? 28 : 0;
              const x1 = 50 + outerR * Math.cos(startRad);
              const y1 = 50 + outerR * Math.sin(startRad);
              const x2 = 50 + outerR * Math.cos(endRad);
              const y2 = 50 + outerR * Math.sin(endRad);
              if (chartData.type === 'doughnut') {
                const ix1 = 50 + innerR * Math.cos(endRad);
                const iy1 = 50 + innerR * Math.sin(endRad);
                const ix2 = 50 + innerR * Math.cos(startRad);
                const iy2 = 50 + innerR * Math.sin(startRad);
                return <path key={i} d={`M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`} fill={seg.color} />;
              }
              return <path key={i} d={`M 50 50 L ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} Z`} fill={seg.color} />;
            })}
          </svg>
        </div>
        <div className="w-[55%] space-y-0.5">
          {segments.slice(0, 5).map((seg: any, i: number) => (
            <div key={i} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-[clamp(5px,0.65vw,8px)] text-gray-600 truncate">{seg.label}</span>
              <span className="text-[clamp(5px,0.65vw,8px)] text-gray-400 ml-auto shrink-0">{seg.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex-1 flex items-end gap-[3%] px-[2%] pb-1">
        {chartData.data.slice(0, 8).map((val: number, i: number) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
            <div
              className="w-full rounded-t-sm min-h-[2px]"
              style={{
                height: `${Math.max(5, (val / maxVal) * 100)}%`,
                backgroundColor: barColors[i % barColors.length],
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-[3%] px-[2%]">
        {chartData.labels.slice(0, 8).map((label: string, i: number) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-[clamp(4px,0.5vw,7px)] text-gray-500 leading-none block truncate">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendArrow({ trend }: { trend?: string }) {
  if (trend === 'up') return <span className="text-emerald-500 text-[clamp(6px,0.7vw,10px)]">&#9650;</span>;
  if (trend === 'down') return <span className="text-red-500 text-[clamp(6px,0.7vw,10px)]">&#9660;</span>;
  if (trend === 'stable') return <span className="text-amber-500 text-[clamp(6px,0.7vw,10px)]">&#9644;</span>;
  return null;
}

function SlideFullPreview({ slide, index, template }: { slide: SlideContent; index: number; template: PresentationTemplate }) {
  const colors = TEMPLATE_COLORS[template];
  const isTitle = slide.slideType === 'title' || slide.slideType === 'section_divider' || slide.slideType === 'image_feature';

  return (
    <div
      className="w-full aspect-[16/9] rounded-md overflow-hidden relative select-none"
      style={{
        backgroundColor: isTitle ? colors.bg : '#ffffff',
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
      }}
    >
      {isTitle && (
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.accent}33 100%)` }} />
      )}

      {!isTitle && (
        <div className="h-[8%] flex items-center justify-between px-[4%]" style={{ backgroundColor: colors.headerBg }}>
          <span className="text-white font-semibold text-[clamp(7px,1.1vw,13px)] truncate">{slide.title}</span>
          <span className="text-white/50 text-[clamp(5px,0.5vw,7px)] shrink-0 ml-2">{index + 1}</span>
        </div>
      )}

      <div className={`${isTitle ? 'h-full' : 'h-[92%]'} p-[4%] flex flex-col relative`}>
        {isTitle && (
          <div className="flex-1 flex flex-col justify-center relative z-10">
            <div className="w-12 h-[2px] mb-3" style={{ backgroundColor: colors.accent }} />
            <p className="font-bold text-[clamp(14px,2.2vw,28px)] leading-tight text-white">
              {slide.title}
            </p>
            {slide.subtitle && (
              <p className="mt-2 text-[clamp(8px,1.1vw,14px)] text-white/70 leading-snug">
                {slide.subtitle}
              </p>
            )}
            {slide.bodyContent && (
              <p className="mt-3 text-[clamp(6px,0.8vw,10px)] text-white/40">
                {slide.bodyContent}
              </p>
            )}
            <div className="absolute bottom-[4%] right-[4%] w-8 h-8 rounded-full border border-white/20" style={{ backgroundColor: colors.accent + '33' }} />
          </div>
        )}

        {!isTitle && slide.slideType === 'kpi_scorecard' && slide.metrics && (
          <div className="flex-1 flex flex-col">
            {slide.bodyContent && <p className="text-[clamp(6px,0.8vw,10px)] text-gray-500 mb-2">{slide.bodyContent}</p>}
            <div className={`grid ${slide.metrics.length <= 3 ? 'grid-cols-3' : slide.metrics.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'} gap-2 flex-1`}>
              {slide.metrics.slice(0, 6).map((m, i) => (
                <div key={i} className="rounded-md p-2 flex flex-col items-center justify-center text-center" style={{ backgroundColor: (m.color || colors.accent) + '0D', borderLeft: `3px solid ${m.color || colors.accent}` }}>
                  <div className="flex items-center gap-1">
                    <p className="text-[clamp(12px,1.8vw,24px)] font-bold leading-none" style={{ color: m.color || colors.accent }}>{m.value}</p>
                    <TrendArrow trend={m.trend} />
                  </div>
                  <p className="text-[clamp(5px,0.65vw,8px)] text-gray-500 mt-1 leading-tight">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isTitle && slide.slideType === 'quote' && (
          <div className="flex-1 flex flex-col justify-center items-center text-center px-[8%]">
            <div className="text-[clamp(20px,3vw,40px)] leading-none mb-1" style={{ color: colors.accent + '44' }}>"</div>
            <p className="text-[clamp(8px,1.1vw,15px)] italic text-gray-700 leading-relaxed">{slide.quoteText}</p>
            {slide.quoteAuthor && (
              <div className="mt-2 flex items-center gap-1.5">
                <div className="w-6 h-[1px]" style={{ backgroundColor: colors.accent }} />
                <p className="text-[clamp(6px,0.75vw,10px)] font-medium" style={{ color: colors.accent }}>{slide.quoteAuthor}</p>
              </div>
            )}
            {slide.bodyContent && <p className="mt-2 text-[clamp(5px,0.6vw,8px)] text-gray-400">{slide.bodyContent}</p>}
          </div>
        )}

        {!isTitle && (slide.slideType === 'content' || slide.slideType === 'summary') && (
          <div className="flex-1 flex flex-col">
            {slide.bodyContent && <p className="text-[clamp(6px,0.85vw,11px)] text-gray-600 mb-1.5 leading-snug">{slide.bodyContent}</p>}

            <div className={`flex-1 flex ${slide.metrics && slide.metrics.length > 0 && slide.bulletPoints && slide.bulletPoints.length > 0 ? 'gap-3' : ''}`}>
              {slide.bulletPoints && slide.bulletPoints.length > 0 && (
                <div className={`space-y-1 ${slide.metrics && slide.metrics.length > 0 ? 'w-[55%]' : 'w-full'}`}>
                  {slide.bulletPoints.slice(0, 6).map((bp, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full mt-[3px] shrink-0" style={{ backgroundColor: colors.accent }} />
                      <span className="text-[clamp(5px,0.75vw,10px)] text-gray-700 leading-snug">{bp}</span>
                    </div>
                  ))}
                </div>
              )}

              {slide.metrics && slide.metrics.length > 0 && (
                <div className={`${slide.bulletPoints && slide.bulletPoints.length > 0 ? 'w-[45%]' : 'w-full'} grid ${slide.bulletPoints && slide.bulletPoints.length > 0 ? 'grid-cols-1' : 'grid-cols-2'} gap-1.5 auto-rows-min`}>
                  {slide.metrics.slice(0, 4).map((m, i) => (
                    <div key={i} className="rounded p-1.5 flex items-center gap-1.5" style={{ backgroundColor: (m.color || colors.accent) + '0D' }}>
                      <p className="text-[clamp(8px,1.2vw,16px)] font-bold leading-none" style={{ color: m.color || colors.accent }}>{m.value}</p>
                      <div className="min-w-0">
                        <p className="text-[clamp(4px,0.55vw,7px)] text-gray-500 truncate">{m.label}</p>
                        {m.trend && <TrendArrow trend={m.trend} />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {!isTitle && slide.slideType === 'comparison' && slide.comparisonItems && (
          <div className="flex-1 flex flex-col">
            {slide.bodyContent && <p className="text-[clamp(5px,0.7vw,9px)] text-gray-500 mb-1.5">{slide.bodyContent}</p>}
            <div className="flex-1">
              <div className="grid grid-cols-[1fr_1fr_1fr] gap-1 mb-1">
                <span className="text-[clamp(5px,0.6vw,8px)] font-semibold text-gray-500 uppercase tracking-wider"></span>
                <span className="text-[clamp(5px,0.6vw,8px)] font-semibold text-red-400 uppercase tracking-wider text-center">Before</span>
                <span className="text-[clamp(5px,0.6vw,8px)] font-semibold uppercase tracking-wider text-center" style={{ color: colors.accent }}>After</span>
              </div>
              {slide.comparisonItems.slice(0, 5).map((item, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr] gap-1 py-1 border-b border-gray-100 last:border-0">
                  <span className="text-[clamp(5px,0.7vw,9px)] font-medium text-gray-700">{item.label}</span>
                  <div className="text-center rounded px-1 py-0.5 bg-red-50">
                    <span className="text-[clamp(5px,0.7vw,9px)] text-red-600">{item.before}</span>
                  </div>
                  <div className="text-center rounded px-1 py-0.5" style={{ backgroundColor: colors.accent + '0D' }}>
                    <span className="text-[clamp(5px,0.7vw,9px)]" style={{ color: colors.accent }}>{item.after}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isTitle && slide.slideType === 'flow_diagram' && slide.flowSteps && (
          <div className="flex-1 flex flex-col justify-center">
            {slide.bodyContent && <p className="text-[clamp(5px,0.7vw,9px)] text-gray-500 mb-2 text-center">{slide.bodyContent}</p>}
            <div className="flex items-stretch justify-center gap-0 mx-auto w-full px-[2%]">
              {slide.flowSteps.slice(0, 5).map((step, i) => (
                <div key={i} className="flex items-center flex-1 min-w-0">
                  <div className="flex-1 min-w-0 rounded-md p-1.5 text-center" style={{ backgroundColor: colors.accent + '11', borderTop: `2px solid ${colors.accent}` }}>
                    <p className="text-[clamp(6px,0.8vw,10px)] font-semibold leading-tight" style={{ color: colors.accent }}>{step.label}</p>
                    {step.description && <p className="text-[clamp(4px,0.5vw,7px)] text-gray-500 mt-0.5 leading-tight line-clamp-2">{step.description}</p>}
                  </div>
                  {i < (slide.flowSteps?.length || 0) - 1 && (
                    <div className="shrink-0 px-0.5">
                      <ChevronRight className="w-3 h-3" style={{ color: colors.accent }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!isTitle && slide.slideType === 'chart' && slide.chartData && (
          <div className="flex-1 flex flex-col">
            {slide.bodyContent && <p className="text-[clamp(5px,0.7vw,9px)] text-gray-500 mb-1">{slide.bodyContent}</p>}
            <div className="flex-1">
              <MiniBarChart chartData={slide.chartData} colors={colors} />
            </div>
          </div>
        )}

        {!isTitle && slide.slideType === 'chart' && !slide.chartData && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-3/4 h-3/4 rounded bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-gray-300" />
            </div>
          </div>
        )}
      </div>

      {isTitle && (
        <div className="absolute bottom-[4%] left-[4%] text-[clamp(5px,0.5vw,7px)] text-white/30">
          {index + 1}
        </div>
      )}
    </div>
  );
}

interface BrandTemplate {
  id: string;
  name: string;
  uploadedAt: string;
  brandKit: {
    colors: Record<string, string>;
    fonts: { major: string; minor: string };
    slideWidth: number;
    slideHeight: number;
    layouts: Array<{ name: string; type: string; placeholders: Array<{ type: string; name?: string; x: number; y: number; w: number; h: number }> }>;
    sampleSlideCount: number;
  };
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
  const [step, setStep] = useState<'configure' | 'review'>('configure');
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const [fullScreenSlide, setFullScreenSlide] = useState<number | null>(null);
  const [refineInstruction, setRefineInstruction] = useState('');
  const [refiningSlideId, setRefiningSlideId] = useState<string | null>(null);
  const [fillingGapIdx, setFillingGapIdx] = useState<number | null>(null);
  const [showBrandPanel, setShowBrandPanel] = useState(false);
  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  const templateFileRef = useRef<HTMLInputElement>(null);
  const [userBrief, setUserBrief] = useState('');
  const [additionalMaterials, setAdditionalMaterials] = useState('');
  const [coachResult, setCoachResult] = useState<any>(null);
  const [gapAnswers, setGapAnswers] = useState<Record<number, string>>({});

  const { data: brandTemplates = [], refetch: refetchTemplates } = useQuery<BrandTemplate[]>({
    queryKey: ['/api/templates'],
  });

  const { data: activeTemplate, refetch: refetchActiveTemplate } = useQuery<BrandTemplate>({
    queryKey: ['/api/templates/active'],
  });

  const handleTemplateUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pptx')) {
      toast({ title: 'Invalid File', description: 'Please upload a .pptx file (PowerPoint format).', variant: 'destructive' });
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: 'File Too Large', description: 'Please upload a template under 50MB.', variant: 'destructive' });
      return;
    }
    setUploadingTemplate(true);
    try {
      const formData = new FormData();
      formData.append('template', file);
      const res = await fetch('/api/templates/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error || `Server error (${res.status})`);
      }
      const parsed = await res.json();
      refetchTemplates();
      refetchActiveTemplate();
      toast({ title: 'Template Uploaded', description: `"${parsed.name}" is now active. ${parsed.brandKit.layouts.length} layouts and ${Object.keys(parsed.brandKit.colors).length} colors extracted.` });
    } catch (err: any) {
      toast({ title: 'Upload Failed', description: err?.message || 'Could not parse the template file. Make sure it is a valid .pptx file.', variant: 'destructive' });
    } finally {
      setUploadingTemplate(false);
    }
  };

  const activateTemplate = async (id: string) => {
    try {
      await apiRequest('POST', `/api/templates/${id}/activate`, {});
      refetchActiveTemplate();
      toast({ title: 'Template Activated', description: 'This brand template will be used for exports.' });
    } catch {
      toast({ title: 'Error', description: 'Could not activate template.', variant: 'destructive' });
    }
  };

  const removeTemplate = async (id: string) => {
    try {
      await apiRequest('DELETE', `/api/templates/${id}`);
      refetchTemplates();
      refetchActiveTemplate();
      toast({ title: 'Template Removed' });
    } catch {
      toast({ title: 'Error', description: 'Could not remove template.', variant: 'destructive' });
    }
  };

  const { data: projectContext, isLoading: isLoadingContext } = useQuery({
    queryKey: ['/api/presentations/project-context', selectedAccountId, selectedProjectId],
    enabled: !!selectedAccountId && !!selectedProjectId,
  });

  const coachMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/presentations/coach', {
        accountId: selectedAccountId,
        projectId: selectedProjectId,
        userBrief: userBrief || undefined,
        additionalMaterials: additionalMaterials || undefined,
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      setCoachResult(data);
      if (data.purpose) setPurpose(data.purpose);
      if (data.audience) setAudience(data.audience);
      if (data.suggestedTopics?.length) {
        const mustInclude = data.suggestedTopics
          .filter((t: any) => t.priority === 'must_include' || t.priority === 'recommended')
          .map((t: any) => t.topic);
        setSelectedTopics(mustInclude);
      }
      if (data.template) setTemplateOverride(data.template);
      if (data.suggestedTitle) setCustomTitle(data.suggestedTitle);
      toast({ title: 'AI Coach Ready', description: 'Recommendations applied. Review and adjust before generating.' });
    },
    onError: () => {
      toast({ title: 'Coach Error', description: 'Could not generate recommendations. Please configure manually.', variant: 'destructive' });
    },
  });

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
      id: td.id, label: td.label, description: '', icon: td.icon,
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
    setCoachResult(null);
    setGapAnswers({});
  }, [selectedProjectId]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const gapAnswersList = Object.entries(gapAnswers)
        .filter(([, answer]) => answer.trim())
        .map(([idx, answer]) => ({
          question: coachResult?.gapQuestions?.[Number(idx)]?.question || '',
          answer,
        }));
      const res = await apiRequest('POST', '/api/presentations/plan', {
        accountId: selectedAccountId, projectId: selectedProjectId,
        purpose, audience, selectedTopics,
        templateOverride: templateOverride || undefined,
        customTitle: customTitle || undefined,
        userBrief: userBrief || undefined,
        additionalMaterials: additionalMaterials || undefined,
        gapAnswers: gapAnswersList.length > 0 ? gapAnswersList : undefined,
      });
      return res.json();
    },
    onSuccess: (data: PresentationPlan) => {
      setPlan(data);
      setStep('review');
      toast({ title: 'Presentation Generated', description: `${data.slides.length} slides created with AI-powered content.` });
    },
    onError: () => {
      toast({ title: 'Generation Failed', description: 'Could not generate the presentation. Please try again.', variant: 'destructive' });
    },
  });

  const refineMutation = useMutation({
    mutationFn: async ({ slide, instruction }: { slide: SlideContent; instruction: string }) => {
      const res = await apiRequest('POST', '/api/presentations/refine-slide', {
        slide, instruction, accountId: selectedAccountId, projectId: selectedProjectId, purpose, audience,
      });
      return res.json();
    },
    onSuccess: (data: SlideContent, variables) => {
      if (!plan) return;
      const idx = plan.slides.findIndex(s => s.id === variables.slide.id);
      if (idx === -1) return;
      const newSlides = [...plan.slides];
      newSlides[idx] = { ...newSlides[idx], ...data, id: newSlides[idx].id, topicSource: newSlides[idx].topicSource };
      setPlan({ ...plan, slides: newSlides });
      setRefiningSlideId(null);
      setRefineInstruction('');
      toast({ title: 'Slide Refined', description: 'The slide has been updated based on your instructions.' });
    },
    onError: () => {
      toast({ title: 'Refinement Failed', description: 'Could not refine the slide. Please try again.', variant: 'destructive' });
    },
  });

  const fillGapMutation = useMutation({
    mutationFn: async (coaching: CoachingRecommendation) => {
      const res = await apiRequest('POST', '/api/presentations/fill-gap', {
        coaching, slides: plan?.slides, accountId: selectedAccountId,
        projectId: selectedProjectId, purpose, audience,
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      if (!plan) return;
      const newSlides = [...plan.slides];

      if (data.action === 'add_slide' && data.slide) {
        const newSlide = { ...data.slide, id: `slide-gap-${Date.now()}` };
        const summaryIdx = newSlides.findIndex(s => s.slideType === 'summary');
        if (summaryIdx >= 0) {
          newSlides.splice(summaryIdx, 0, newSlide);
        } else {
          newSlides.push(newSlide);
        }
      } else if ((data.action === 'modify_existing' || data.action === 'add_content') && data.modifications) {
        for (const mod of data.modifications) {
          const targetIdx = newSlides.findIndex(s => s.id === mod.slideId);
          if (targetIdx >= 0 && mod.changes) {
            newSlides[targetIdx] = { ...newSlides[targetIdx], ...mod.changes, id: newSlides[targetIdx].id, topicSource: newSlides[targetIdx].topicSource };
          }
        }
        if (data.slide) {
          const newSlide = { ...data.slide, id: `slide-gap-${Date.now()}` };
          newSlides.push(newSlide);
        }
      }

      setPlan({ ...plan, slides: newSlides });
      setFillingGapIdx(null);
      toast({ title: 'Gap Addressed', description: data.explanation || 'Content has been added to address the coaching recommendation.' });
    },
    onError: () => {
      setFillingGapIdx(null);
      toast({ title: 'Could Not Fill Gap', description: 'Please try again or manually edit the slides.', variant: 'destructive' });
    },
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/presentations/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          accountId: selectedAccountId,
          projectId: selectedProjectId,
          purpose, audience, selectedTopics,
          templateOverride: templateOverride || plan?.recommendedTemplate || undefined,
          customTitle: customTitle || undefined,
          slides: plan?.slides || [],
        }),
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Export failed');
      }
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
    onError: (err: any) => {
      toast({ title: 'Export Failed', description: err.message || 'Could not export. Please try again.', variant: 'destructive' });
    },
  });

  function toggleTopic(topicId: TopicCategory) {
    setSelectedTopics(prev =>
      prev.includes(topicId) ? prev.filter(t => t !== topicId) : [...prev, topicId]
    );
  }

  function updateSlide(index: number, updates: Partial<SlideContent>) {
    if (!plan) return;
    const newSlides = [...plan.slides];
    newSlides[index] = { ...newSlides[index], ...updates };
    setPlan({ ...plan, slides: newSlides });
  }

  function deleteSlide(index: number) {
    if (!plan) return;
    const newSlides = plan.slides.filter((_, i) => i !== index);
    setPlan({ ...plan, slides: newSlides });
    if (editingSlideIndex === index) setEditingSlideIndex(null);
    toast({ title: 'Slide Removed' });
  }

  function addSlideAfter(index: number) {
    if (!plan) return;
    const newSlide: SlideContent = {
      id: `slide-new-${Date.now()}`,
      slideType: 'content',
      title: 'New Slide',
      bodyContent: '',
      bulletPoints: [],
      topicSource: plan.slides[index]?.topicSource || selectedTopics[0] || 'discovery_insights',
    };
    const newSlides = [...plan.slides];
    newSlides.splice(index + 1, 0, newSlide);
    setPlan({ ...plan, slides: newSlides });
    setEditingSlideIndex(index + 1);
  }

  function moveSlide(from: number, direction: 'up' | 'down') {
    if (!plan) return;
    const to = direction === 'up' ? from - 1 : from + 1;
    if (to < 0 || to >= plan.slides.length) return;
    const newSlides = [...plan.slides];
    [newSlides[from], newSlides[to]] = [newSlides[to], newSlides[from]];
    setPlan({ ...plan, slides: newSlides });
    if (editingSlideIndex === from) setEditingSlideIndex(to);
  }

  const currentTemplate = templateOverride || plan?.recommendedTemplate || 'executive_modern';

  if (step === 'review' && plan) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-background sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <Button variant="ghost" size="icon" onClick={() => setStep('configure')} data-testid="button-back-configure">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Eye className="w-4 h-4 text-[#A3238E]" />
                  <h1 className="text-lg font-semibold text-foreground">Review & Edit</h1>
                </div>
                <p className="text-xs text-muted-foreground">{plan.slides.length} slides · {plan.estimatedDuration}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending} data-testid="button-regenerate">
                {generateMutation.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <RefreshCcw className="w-4 h-4 mr-1.5" />}
                Regenerate
              </Button>
              <Button onClick={() => exportMutation.mutate()} disabled={exportMutation.isPending} data-testid="button-export-pptx">
                {exportMutation.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Download className="w-4 h-4 mr-1.5" />}
                Export PPTX
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ScrollArea className="h-[calc(100vh-140px)]">
                <div className="space-y-4 pr-2">
                  {plan.slides.map((slide, idx) => (
                    <div key={slide.id} data-testid={`slide-card-${idx}`}>
                      <Card className={`overflow-visible ${editingSlideIndex === idx ? 'ring-2 ring-[#005971]' : ''}`}>
                        <div className="flex items-center gap-2 p-3 border-b flex-wrap">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => moveSlide(idx, 'up')} disabled={idx === 0} data-testid={`button-move-up-${idx}`}>
                              <ChevronLeft className="w-3 h-3 rotate-90" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => moveSlide(idx, 'down')} disabled={idx === plan.slides.length - 1} data-testid={`button-move-down-${idx}`}>
                              <ChevronRight className="w-3 h-3 rotate-90" />
                            </Button>
                          </div>
                          <span className="text-xs font-mono text-muted-foreground">#{idx + 1}</span>
                          <Badge variant="secondary" className="text-xs">{getSlideTypeLabel(slide.slideType)}</Badge>
                          <Badge variant="outline" className="text-xs">{getTopicLabel(slide.topicSource)}</Badge>
                          <div className="ml-auto flex items-center gap-1 flex-wrap">
                            <Button variant="ghost" size="icon" onClick={() => setFullScreenSlide(idx)} data-testid={`button-fullscreen-${idx}`}>
                              <Maximize2 className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setEditingSlideIndex(editingSlideIndex === idx ? null : idx)} data-testid={`button-edit-${idx}`}>
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => {
                              setRefiningSlideId(refiningSlideId === slide.id ? null : slide.id);
                              setRefineInstruction('');
                            }} data-testid={`button-refine-${idx}`}>
                              <WandSparkles className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => addSlideAfter(idx)} data-testid={`button-add-after-${idx}`}>
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteSlide(idx)} data-testid={`button-delete-${idx}`}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="max-w-lg mx-auto">
                            <SlideFullPreview slide={slide} index={idx} template={currentTemplate} />
                          </div>
                        </div>

                        {refiningSlideId === slide.id && (
                          <div className="px-4 pb-4 border-t pt-3">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <WandSparkles className="w-4 h-4 text-[#A3238E]" />
                              <span className="text-sm font-medium text-foreground">AI Refinement</span>
                            </div>
                            <div className="flex gap-2">
                              <Input
                                placeholder="e.g., Make the title more impactful, add a client quote, simplify the bullets..."
                                value={refineInstruction}
                                onChange={e => setRefineInstruction(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' && refineInstruction.trim()) {
                                    refineMutation.mutate({ slide, instruction: refineInstruction });
                                  }
                                }}
                                data-testid={`input-refine-${idx}`}
                              />
                              <Button
                                size="icon"
                                onClick={() => refineMutation.mutate({ slide, instruction: refineInstruction })}
                                disabled={!refineInstruction.trim() || refineMutation.isPending}
                                data-testid={`button-refine-submit-${idx}`}
                              >
                                {refineMutation.isPending && refiningSlideId === slide.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                              </Button>
                            </div>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {['Make more concise', 'Add data points', 'Stronger call to action', 'Add client quote'].map(suggestion => (
                                <Button
                                  key={suggestion}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => {
                                    setRefineInstruction(suggestion);
                                    refineMutation.mutate({ slide, instruction: suggestion });
                                  }}
                                  disabled={refineMutation.isPending}
                                  data-testid={`button-quick-refine-${suggestion.toLowerCase().replace(/\s+/g, '-')}`}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}

                        {editingSlideIndex === idx && (
                          <div className="px-4 pb-4 border-t pt-3 space-y-3">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Pencil className="w-4 h-4 text-[#005971]" />
                              <span className="text-sm font-medium text-foreground">Edit Slide</span>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Title</Label>
                              <Input
                                value={slide.title}
                                onChange={e => updateSlide(idx, { title: e.target.value })}
                                data-testid={`input-slide-title-${idx}`}
                              />
                            </div>
                            {(slide.slideType === 'title' || slide.slideType === 'section_divider') && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Subtitle</Label>
                                <Input
                                  value={slide.subtitle || ''}
                                  onChange={e => updateSlide(idx, { subtitle: e.target.value })}
                                  data-testid={`input-slide-subtitle-${idx}`}
                                />
                              </div>
                            )}
                            <div>
                              <Label className="text-xs text-muted-foreground">Body Content</Label>
                              <Textarea
                                value={slide.bodyContent || ''}
                                onChange={e => updateSlide(idx, { bodyContent: e.target.value })}
                                className="resize-none text-sm"
                                rows={3}
                                data-testid={`input-slide-body-${idx}`}
                              />
                            </div>
                            {(slide.bulletPoints || slide.slideType === 'content' || slide.slideType === 'summary') && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Bullet Points (one per line)</Label>
                                <Textarea
                                  value={(slide.bulletPoints || []).join('\n')}
                                  onChange={e => updateSlide(idx, { bulletPoints: e.target.value.split('\n').filter(l => l.trim()) })}
                                  className="resize-none text-sm"
                                  rows={4}
                                  data-testid={`input-slide-bullets-${idx}`}
                                />
                              </div>
                            )}
                            {slide.slideType === 'quote' && (
                              <>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Quote Text</Label>
                                  <Textarea
                                    value={slide.quoteText || ''}
                                    onChange={e => updateSlide(idx, { quoteText: e.target.value })}
                                    className="resize-none text-sm"
                                    rows={3}
                                    data-testid={`input-slide-quote-${idx}`}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Quote Author</Label>
                                  <Input
                                    value={slide.quoteAuthor || ''}
                                    onChange={e => updateSlide(idx, { quoteAuthor: e.target.value })}
                                    data-testid={`input-slide-author-${idx}`}
                                  />
                                </div>
                              </>
                            )}
                            {slide.metrics && slide.metrics.length > 0 && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Metrics</Label>
                                <div className="space-y-2 mt-1">
                                  {slide.metrics.map((m, mi) => (
                                    <div key={mi} className="grid grid-cols-3 gap-2">
                                      <Input
                                        placeholder="Label"
                                        value={m.label}
                                        onChange={e => {
                                          const newMetrics = [...(slide.metrics || [])];
                                          newMetrics[mi] = { ...newMetrics[mi], label: e.target.value };
                                          updateSlide(idx, { metrics: newMetrics });
                                        }}
                                        data-testid={`input-metric-label-${idx}-${mi}`}
                                      />
                                      <Input
                                        placeholder="Value"
                                        value={m.value}
                                        onChange={e => {
                                          const newMetrics = [...(slide.metrics || [])];
                                          newMetrics[mi] = { ...newMetrics[mi], value: e.target.value };
                                          updateSlide(idx, { metrics: newMetrics });
                                        }}
                                        data-testid={`input-metric-value-${idx}-${mi}`}
                                      />
                                      <Input
                                        placeholder="Trend (optional)"
                                        value={m.trend || ''}
                                        onChange={e => {
                                          const newMetrics = [...(slide.metrics || [])];
                                          newMetrics[mi] = { ...newMetrics[mi], trend: e.target.value };
                                          updateSlide(idx, { metrics: newMetrics });
                                        }}
                                        data-testid={`input-metric-trend-${idx}-${mi}`}
                                      />
                                    </div>
                                  ))}
                                  <Button variant="outline" size="sm" className="text-xs" onClick={() => {
                                    const newMetrics = [...(slide.metrics || []), { label: '', value: '' }];
                                    updateSlide(idx, { metrics: newMetrics });
                                  }} data-testid={`button-add-metric-${idx}`}>
                                    <Plus className="w-3 h-3 mr-1" /> Add Metric
                                  </Button>
                                </div>
                              </div>
                            )}
                            {slide.comparisonItems && slide.comparisonItems.length > 0 && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Comparison Items</Label>
                                <div className="space-y-2 mt-1">
                                  {slide.comparisonItems.map((item, ci) => (
                                    <div key={ci} className="grid grid-cols-3 gap-2">
                                      <Input
                                        placeholder="Label"
                                        value={item.label}
                                        onChange={e => {
                                          const newItems = [...(slide.comparisonItems || [])];
                                          newItems[ci] = { ...newItems[ci], label: e.target.value };
                                          updateSlide(idx, { comparisonItems: newItems });
                                        }}
                                        data-testid={`input-comparison-label-${idx}-${ci}`}
                                      />
                                      <Input
                                        placeholder="Before"
                                        value={item.before}
                                        onChange={e => {
                                          const newItems = [...(slide.comparisonItems || [])];
                                          newItems[ci] = { ...newItems[ci], before: e.target.value };
                                          updateSlide(idx, { comparisonItems: newItems });
                                        }}
                                        data-testid={`input-comparison-before-${idx}-${ci}`}
                                      />
                                      <Input
                                        placeholder="After"
                                        value={item.after}
                                        onChange={e => {
                                          const newItems = [...(slide.comparisonItems || [])];
                                          newItems[ci] = { ...newItems[ci], after: e.target.value };
                                          updateSlide(idx, { comparisonItems: newItems });
                                        }}
                                        data-testid={`input-comparison-after-${idx}-${ci}`}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {slide.flowSteps && slide.flowSteps.length > 0 && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Flow Steps</Label>
                                <div className="space-y-2 mt-1">
                                  {slide.flowSteps.map((step, si) => (
                                    <div key={si} className="grid grid-cols-2 gap-2">
                                      <Input
                                        placeholder="Step label"
                                        value={step.label}
                                        onChange={e => {
                                          const newSteps = [...(slide.flowSteps || [])];
                                          newSteps[si] = { ...newSteps[si], label: e.target.value };
                                          updateSlide(idx, { flowSteps: newSteps });
                                        }}
                                        data-testid={`input-flow-label-${idx}-${si}`}
                                      />
                                      <Input
                                        placeholder="Description (optional)"
                                        value={step.description || ''}
                                        onChange={e => {
                                          const newSteps = [...(slide.flowSteps || [])];
                                          newSteps[si] = { ...newSteps[si], description: e.target.value };
                                          updateSlide(idx, { flowSteps: newSteps });
                                        }}
                                        data-testid={`input-flow-desc-${idx}-${si}`}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div>
                              <Label className="text-xs text-muted-foreground">Speaker Notes</Label>
                              <Textarea
                                value={slide.speakerNotes || ''}
                                onChange={e => updateSlide(idx, { speakerNotes: e.target.value })}
                                className="resize-none text-sm"
                                rows={2}
                                data-testid={`input-slide-notes-${idx}`}
                              />
                            </div>
                            <div className="flex justify-end">
                              <Button variant="outline" size="sm" onClick={() => setEditingSlideIndex(null)} data-testid={`button-done-editing-${idx}`}>
                                <Check className="w-3 h-3 mr-1" />
                                Done
                              </Button>
                            </div>
                          </div>
                        )}

                        {slide.coachingTip && editingSlideIndex !== idx && refiningSlideId !== slide.id && (
                          <div className="px-4 pb-3">
                            <div className="flex items-start gap-1.5 p-2 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                              <Lightbulb className="w-3 h-3 text-amber-600 mt-0.5 shrink-0" />
                              <p className="text-[10px] text-amber-800 dark:text-amber-300 leading-tight">{slide.coachingTip}</p>
                            </div>
                          </div>
                        )}
                      </Card>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Presentation className="w-4 h-4 text-[#005971]" />
                  Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Template</span>
                    <span className="font-medium text-foreground">{TEMPLATE_OPTIONS.find(t => t.value === currentTemplate)?.label}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Slides</span>
                    <span className="font-medium text-foreground">{plan.slides.length}</span>
                  </div>
                  <div className="flex justify-between gap-2">
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

              {plan.coaching.length > 0 && (
                <Card className="p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-[#005971]" />
                    Coaching ({plan.coaching.length})
                  </h3>
                  <div className="space-y-3">
                    {plan.coaching.map((item, idx) => {
                      const config = COACHING_TYPE_CONFIG[item.type];
                      if (!config) return null;
                      const IconComp = config.icon;
                      const isGap = item.type === 'gap';
                      return (
                        <div key={idx} className={`p-3 rounded-md border ${config.bgColor} ${config.borderColor}`}>
                          <div className="flex items-start gap-2">
                            <IconComp className={`w-4 h-4 shrink-0 mt-0.5 ${config.color}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-xs font-semibold text-foreground">{item.title}</p>
                                <Badge variant="outline" className="text-[10px]">{item.priority}</Badge>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-1">{item.description}</p>
                              <p className="text-[11px] mt-1 font-medium text-foreground/80">{item.actionableAdvice}</p>
                              {isGap && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-2 text-xs"
                                  onClick={() => {
                                    setFillingGapIdx(idx);
                                    fillGapMutation.mutate(item);
                                  }}
                                  disabled={fillGapMutation.isPending && fillingGapIdx === idx}
                                  data-testid={`button-fill-gap-${idx}`}
                                >
                                  {fillGapMutation.isPending && fillingGapIdx === idx ? (
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  ) : (
                                    <WandSparkles className="w-3 h-3 mr-1" />
                                  )}
                                  Fix with AI
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              <Card className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">Template Rationale</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{plan.templateRationale}</p>
              </Card>
            </div>
          </div>
        </div>

        {fullScreenSlide !== null && plan.slides[fullScreenSlide] && (
          <Dialog open={true} onOpenChange={() => setFullScreenSlide(null)}>
            <DialogContent className="max-w-4xl w-[90vw]" data-testid="dialog-fullscreen-slide">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-muted-foreground">#{fullScreenSlide + 1}</span>
                  <span>{plan.slides[fullScreenSlide].title}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <SlideFullPreview slide={plan.slides[fullScreenSlide]} index={fullScreenSlide} template={currentTemplate} />
              </div>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => setFullScreenSlide(Math.max(0, fullScreenSlide - 1))} disabled={fullScreenSlide === 0} data-testid="button-fullscreen-prev">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <span className="text-sm text-muted-foreground">{fullScreenSlide + 1} / {plan.slides.length}</span>
                <Button variant="outline" size="sm" onClick={() => setFullScreenSlide(Math.min(plan.slides.length - 1, fullScreenSlide + 1))} disabled={fullScreenSlide === plan.slides.length - 1} data-testid="button-fullscreen-next">
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              {plan.slides[fullScreenSlide].speakerNotes && (
                <div className="mt-2 p-3 rounded bg-muted/50 border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Speaker Notes</p>
                  <p className="text-sm text-foreground">{plan.slides[fullScreenSlide].speakerNotes}</p>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
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
                      <Select value={selectedAccountId?.toString() || ''} onValueChange={(val) => setSelectedAccountId(Number(val))}>
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
                      <Select value={selectedProjectId?.toString() || ''} onValueChange={(val) => setSelectedProjectId(Number(val))} disabled={!selectedAccountId}>
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
                            isSelected ? 'border-[#00634F] bg-[#00634F]/5' : 'border-border hover-elevate'
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
                            isSelected ? 'border-[#005971] bg-[#005971]/5' : 'border-border hover-elevate'
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
                            isChecked ? 'border-[#009B77] bg-[#009B77]/5' : 'border-border hover-elevate'
                          }`}
                          data-testid={`topic-${topic.id}`}
                        >
                          <Checkbox checked={isChecked} onCheckedChange={() => toggleTopic(topic.id)} data-testid={`checkbox-topic-${topic.id}`} />
                          <TopicIcon className={`w-4 h-4 shrink-0 ${isChecked ? 'text-[#009B77]' : 'text-muted-foreground'}`} />
                          <span className="text-sm text-foreground flex-1">{topic.label}</span>
                          {topic.available ? (
                            <Badge variant="secondary" className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3 mr-0.5" />
                              {topic.dataPoints}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] text-muted-foreground">No data</Badge>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-foreground">Brand Template</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBrandPanel(!showBrandPanel)}
                      data-testid="button-toggle-brand-panel"
                    >
                      <Palette className="w-3 h-3 mr-1" />
                      {showBrandPanel ? 'Hide' : 'Custom'}
                    </Button>
                  </div>

                  {activeTemplate && (
                    <div className="mb-3 p-2 rounded-md border border-[#005971]/20 bg-[#005971]/5">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <LayoutTemplate className="w-3 h-3 text-[#005971]" />
                        <span className="text-xs font-medium text-[#005971]">{activeTemplate.name}</span>
                        {activeTemplate.id === 'default' && (
                          <Badge variant="secondary" className="text-[9px]">Built-in</Badge>
                        )}
                        <Badge variant="secondary" className="text-[9px]">Active</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Type className="w-2.5 h-2.5" />{activeTemplate.brandKit.fonts.major}</span>
                        <span>{activeTemplate.brandKit.layouts.length} layouts</span>
                        <div className="flex gap-0.5">
                          {['accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6'].map(key => (
                            <div
                              key={key}
                              className="w-3 h-3 rounded-sm border border-border"
                              style={{ backgroundColor: `#${activeTemplate.brandKit.colors[key] || '888'}` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {!activeTemplate && (
                    <div className="mb-3 p-2 rounded-md border border-border bg-muted/30">
                      <p className="text-xs text-muted-foreground">Loading brand template...</p>
                    </div>
                  )}

                  {showBrandPanel && (
                    <div className="space-y-3 mb-3">
                      <Separator />
                      <p className="text-[10px] text-muted-foreground">
                        The Korn Ferry brand kit is built-in. To use your own company branding, upload a .pptx template below and its colors, fonts, and layouts will be extracted automatically.
                      </p>
                      <input
                        ref={templateFileRef}
                        type="file"
                        accept=".pptx"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleTemplateUpload(file);
                          e.target.value = '';
                        }}
                        data-testid="input-template-upload"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => templateFileRef.current?.click()}
                        disabled={uploadingTemplate}
                        data-testid="button-upload-template"
                      >
                        {uploadingTemplate ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Upload className="w-3 h-3 mr-1" />}
                        {uploadingTemplate ? 'Parsing...' : 'Upload Custom .pptx Template'}
                      </Button>

                      {brandTemplates.length > 0 && (
                        <div className="space-y-1.5">
                          {brandTemplates.map(t => {
                            const isActive = activeTemplate?.id === t.id;
                            return (
                              <div
                                key={t.id}
                                className={`flex items-center justify-between gap-2 p-2 rounded-md border text-left transition-colors ${
                                  isActive ? 'border-[#005971] bg-[#005971]/5' : 'border-border'
                                }`}
                                data-testid={`brand-template-${t.id}`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <p className={`text-xs font-medium truncate ${isActive ? 'text-[#005971]' : 'text-foreground'}`}>{t.name}</p>
                                    {t.id === 'default' && <Badge variant="secondary" className="text-[9px]">Built-in</Badge>}
                                    {isActive && <Badge variant="secondary" className="text-[9px]">Active</Badge>}
                                  </div>
                                  <p className="text-[10px] text-muted-foreground">{t.brandKit.fonts.major} / {t.brandKit.layouts.length} layouts</p>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  {!isActive && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => activateTemplate(t.id)}
                                      data-testid={`button-activate-${t.id}`}
                                    >
                                      <Check className="w-3 h-3" />
                                    </Button>
                                  )}
                                  {t.id !== 'default' && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeTemplate(t.id)}
                                      data-testid={`button-remove-${t.id}`}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <h4 className="text-xs font-medium text-muted-foreground mb-2 mt-2">Slide Style</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {TEMPLATE_OPTIONS.map(opt => {
                      const isSelected = (templateOverride || 'executive_modern') === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setTemplateOverride(opt.value)}
                          className={`p-3 rounded-md border text-left transition-colors ${
                            isSelected ? 'border-[#A3238E] bg-[#A3238E]/5' : 'border-border hover:bg-muted/50'
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
                  {generateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  {generateMutation.isPending ? 'Generating...' : 'Generate Presentation'}
                </Button>
              </div>
            </ScrollArea>
          </div>

          <div className="lg:col-span-3">
            <ScrollArea className="h-[calc(100vh-120px)]">
              <div className="space-y-4 pr-2">
                {selectedAccountId && selectedProjectId && projectContext ? (
                  <>
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Database className="w-4 h-4 text-[#005971]" />
                        <h3 className="text-sm font-semibold text-foreground">Project Data Available</h3>
                        <Badge variant="secondary" className="text-[10px]">{(projectContext as any).totalDataPoints} data points</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{(projectContext as any).accountName}</span>
                          {(projectContext as any).sector && <> / {(projectContext as any).sector}</>}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Phase: <span className="font-medium text-foreground capitalize">{(projectContext as any).phase}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { label: 'Discovery', count: (projectContext as any).availableData?.discoveryInsights?.count || 0, icon: Search },
                          { label: 'KPIs', count: (projectContext as any).availableData?.kpis?.count || 0, icon: Target },
                          { label: 'Value Cases', count: (projectContext as any).availableData?.valueCases?.count || 0, icon: TrendingUp },
                          { label: 'Evidence', count: (projectContext as any).availableData?.evidencePack?.count || 0, icon: Shield },
                          { label: 'Stories', count: (projectContext as any).availableData?.successStories?.count || 0, icon: BookOpen },
                          { label: 'Growth Accel.', count: (projectContext as any).availableData?.growthAccelerator?.count || 0, icon: Zap },
                        ].map(item => {
                          const ItemIcon = item.icon;
                          return (
                            <div key={item.label} className={`flex items-center gap-2 p-2 rounded-md border ${item.count > 0 ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-border bg-muted/30'}`}>
                              <ItemIcon className={`w-3 h-3 shrink-0 ${item.count > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`} />
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] text-muted-foreground leading-tight">{item.label}</p>
                                <p className={`text-xs font-semibold ${item.count > 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground'}`}>{item.count}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {[
                          { label: 'Green Sheet', available: (projectContext as any).availableData?.greenSheet?.available },
                          { label: 'Narrative', available: (projectContext as any).availableData?.narrativeCanvas?.available },
                          { label: 'Story Builder', available: (projectContext as any).availableData?.storyBuilder?.available },
                        ].map(item => (
                          <div key={item.label} className={`flex items-center gap-1.5 p-1.5 rounded-md border text-center ${item.available ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-border bg-muted/30'}`}>
                            {item.available ? <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" /> : <CircleDot className="w-3 h-3 text-muted-foreground shrink-0" />}
                            <span className="text-[10px] text-muted-foreground truncate">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Brain className="w-4 h-4 text-[#A3238E]" />
                        <h3 className="text-sm font-semibold text-foreground">AI Coach</h3>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="user-brief" className="text-xs text-muted-foreground mb-1 block">Your Brief</Label>
                          <Textarea
                            id="user-brief"
                            placeholder="Describe what this presentation should accomplish, e.g. 'QBR for Q1 showing progress on talent retention KPIs, need to address the CEO's concerns about leadership pipeline...'"
                            value={userBrief}
                            onChange={(e) => setUserBrief(e.target.value)}
                            className="resize-none text-sm"
                            rows={3}
                            data-testid="input-user-brief"
                          />
                        </div>
                        <div>
                          <Label htmlFor="additional-materials" className="text-xs text-muted-foreground mb-1 block">Additional Context (optional)</Label>
                          <Textarea
                            id="additional-materials"
                            placeholder="Paste notes, email excerpts, meeting minutes, or any additional materials to inform the presentation..."
                            value={additionalMaterials}
                            onChange={(e) => setAdditionalMaterials(e.target.value)}
                            className="resize-none text-sm"
                            rows={2}
                            data-testid="input-additional-materials"
                          />
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => coachMutation.mutate()}
                          disabled={coachMutation.isPending}
                          data-testid="button-coach"
                        >
                          {coachMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Compass className="w-4 h-4 mr-2" />}
                          {coachMutation.isPending ? 'Analyzing...' : 'Get AI Coach Recommendations'}
                        </Button>
                      </div>
                    </Card>

                    {coachResult && (
                      <Card className="p-4">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <Sparkles className="w-4 h-4 text-[#A3238E]" />
                          <h3 className="text-sm font-semibold text-foreground">Coach Recommendations</h3>
                          <Badge variant="secondary" className="text-[10px]">Applied</Badge>
                        </div>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded-md border border-border bg-muted/30">
                              <p className="text-[10px] text-muted-foreground">Purpose</p>
                              <p className="text-xs font-medium text-foreground">{PURPOSE_OPTIONS.find(o => o.value === coachResult.purpose)?.label || coachResult.purpose}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{coachResult.purposeReason}</p>
                            </div>
                            <div className="p-2 rounded-md border border-border bg-muted/30">
                              <p className="text-[10px] text-muted-foreground">Audience</p>
                              <p className="text-xs font-medium text-foreground">{AUDIENCE_OPTIONS.find(o => o.value === coachResult.audience)?.label || coachResult.audience}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{coachResult.audienceReason}</p>
                            </div>
                          </div>

                          {coachResult.suggestedTitle && (
                            <div className="p-2 rounded-md border border-[#005971]/20 bg-[#005971]/5">
                              <p className="text-[10px] text-muted-foreground">Suggested Title</p>
                              <p className="text-xs font-medium text-[#005971]">{coachResult.suggestedTitle}</p>
                            </div>
                          )}

                          {coachResult.narrativeArc && (
                            <div className="p-2 rounded-md border border-[#A3238E]/20 bg-[#A3238E]/5">
                              <div className="flex items-center gap-1.5 mb-1">
                                <BookText className="w-3 h-3 text-[#A3238E]" />
                                <p className="text-[10px] font-medium text-[#A3238E]">Narrative Arc</p>
                              </div>
                              <p className="text-xs text-foreground/80 leading-relaxed">{coachResult.narrativeArc}</p>
                            </div>
                          )}

                          {coachResult.suggestedTopics?.length > 0 && (
                            <div>
                              <p className="text-[10px] font-medium text-muted-foreground mb-1.5">Suggested Topics</p>
                              <div className="space-y-1">
                                {coachResult.suggestedTopics.map((t: any, i: number) => (
                                  <div key={i} className="flex items-start gap-2 p-1.5 rounded-md border border-border">
                                    <Badge variant="secondary" className={`text-[9px] shrink-0 ${t.priority === 'must_include' ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' : t.priority === 'recommended' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : ''}`}>
                                      {t.priority === 'must_include' ? 'Must' : t.priority === 'recommended' ? 'Rec.' : 'Opt.'}
                                    </Badge>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-medium text-foreground">{getTopicLabel(t.topic)}</p>
                                      <p className="text-[10px] text-muted-foreground leading-tight">{t.reason}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {coachResult.storyAngles?.length > 0 && (
                            <div>
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <BookText className="w-3 h-3 text-[#00634F]" />
                                <p className="text-[10px] font-medium text-muted-foreground">Story Angles</p>
                              </div>
                              <div className="space-y-1.5">
                                {coachResult.storyAngles.map((sa: any, i: number) => (
                                  <div key={i} className="flex items-start gap-2 p-2 rounded-md border border-[#00634F]/20 bg-[#00634F]/5">
                                    <ArrowRight className="w-3 h-3 text-[#00634F] mt-0.5 shrink-0" />
                                    <div className="min-w-0">
                                      <p className="text-xs text-foreground leading-tight">{sa.angle}</p>
                                      <p className="text-[10px] text-muted-foreground mt-0.5">Source: {sa.source}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {coachResult.gapQuestions?.length > 0 && (
                            <div>
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <HelpCircle className="w-3 h-3 text-amber-500" />
                                <p className="text-[10px] font-medium text-muted-foreground">Missing Information</p>
                              </div>
                              <div className="space-y-2">
                                {coachResult.gapQuestions.map((gq: any, i: number) => (
                                  <div key={i} className="p-2 rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
                                    <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-0.5">{gq.question}</p>
                                    <p className="text-[10px] text-amber-600 dark:text-amber-400 mb-1.5">{gq.context}</p>
                                    <Input
                                      placeholder="Your answer (optional, enhances the presentation)..."
                                      value={gapAnswers[i] || ''}
                                      onChange={(e) => setGapAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                                      className="text-xs"
                                      data-testid={`input-gap-answer-${i}`}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border">
                            <Presentation className="w-3 h-3 text-muted-foreground shrink-0" />
                            <p className="text-[10px] text-muted-foreground">
                              Est. {coachResult.estimatedSlides || 12} slides · {TEMPLATE_OPTIONS.find(t => t.value === coachResult.template)?.label || 'Visual Narrative'} style
                            </p>
                          </div>
                        </div>
                      </Card>
                    )}
                  </>
                ) : selectedAccountId && selectedProjectId && isLoadingContext ? (
                  <Card className="p-6">
                    <div className="flex items-center justify-center gap-2 py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Loading project data...</p>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-6">
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-[#005971]/10 flex items-center justify-center mx-auto mb-4">
                        <Presentation className="w-8 h-8 text-[#005971]" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Build Your Presentation</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                        Select an account and project to see available data, then use AI Coach to configure your presentation automatically.
                      </p>
                      <Separator className="my-6" />
                      <div className="text-left max-w-sm mx-auto space-y-3">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">How it works</h4>
                        <div className="flex items-start gap-2">
                          <Database className="w-3 h-3 text-[#005971] mt-1 shrink-0" />
                          <p className="text-xs text-muted-foreground">Select an account and project to see what data is available</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Brain className="w-3 h-3 text-[#A3238E] mt-1 shrink-0" />
                          <p className="text-xs text-muted-foreground">AI Coach analyzes your data, recommends purpose, audience, and topics</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <HelpCircle className="w-3 h-3 text-amber-500 mt-1 shrink-0" />
                          <p className="text-xs text-muted-foreground">Coach identifies gaps and asks for missing information to strengthen the deck</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <BookText className="w-3 h-3 text-[#00634F] mt-1 shrink-0" />
                          <p className="text-xs text-muted-foreground">Storytelling assets from Narrative Canvas and Story Builder are woven into slides</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Download className="w-3 h-3 text-[#00634F] mt-1 shrink-0" />
                          <p className="text-xs text-muted-foreground">Export as a branded PowerPoint using your active brand template</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
