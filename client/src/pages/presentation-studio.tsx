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
  ExternalLink,
  Building2,
  Clock,
  FolderOpen,
  History,
  RotateCcw,
  Mic,
  FileJson,
  Award,
  Swords,
  PlayCircle,
  Gauge,
  Trophy,
  ThumbsUp,
  ThumbsDown,
  CircleAlert,
  ListChecks,
  Save,
  Briefcase,
  CheckCircle,
  XCircle,
  MessageCircle,
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
  talkTrack?: string;
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

interface AudiencePriority {
  id: string;
  title: string;
  description: string;
  recommendation: string;
  rationale: string;
  impact: 'high' | 'medium' | 'low';
  dataSupport: 'strong' | 'moderate' | 'weak';
  relatedTopics: TopicCategory[];
}

interface AudiencePriorityAdvice {
  top3: AudiencePriority[];
  alternatives: AudiencePriority[];
  audienceInsight: string;
  winningStrategy: string;
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

const DEFAULT_TEMPLATE_COLORS: Record<PresentationTemplate, { bg: string; accent: string; headerBg: string; headerText: string; bodyFont: string; headerFont: string }> = {
  executive_modern: { bg: '#00173B', accent: '#009B77', headerBg: '#00173B', headerText: '#ffffff', bodyFont: 'Arial', headerFont: 'Arial' },
  data_driven: { bg: '#ffffff', accent: '#005971', headerBg: '#005971', headerText: '#ffffff', bodyFont: 'Arial', headerFont: 'Arial' },
  visual_narrative: { bg: '#00634F', accent: '#A3238E', headerBg: '#00634F', headerText: '#ffffff', bodyFont: 'Arial', headerFont: 'Arial' },
};

function brandKitToPreviewColors(brandKit: any): { bg: string; accent: string; headerBg: string; headerText: string; bodyFont: string; headerFont: string; masterBgGradient?: string } {
  const dk1 = brandKit?.colors?.dk1 || '00173B';
  const accent1 = brandKit?.colors?.accent1 || '005971';
  const lt1 = brandKit?.colors?.lt1 || 'FFFFFF';
  const masterBgColor = brandKit?.masterBackgroundColor;
  const masterBg = brandKit?.masterBackground;

  let bgColor = `#${dk1}`;
  let masterBgGradient: string | undefined;

  if (masterBgColor) {
    bgColor = `#${masterBgColor}`;
  } else if (masterBg?.type === 'solid' && masterBg?.color) {
    bgColor = `#${masterBg.color}`;
  }

  if (masterBg?.type === 'gradient' && masterBg?.gradientStops?.length >= 2) {
    const angle = masterBg.gradientAngle || 0;
    const stops = masterBg.gradientStops.map((s: any) => `#${s.color} ${s.position}%`).join(', ');
    masterBgGradient = `linear-gradient(${angle}deg, ${stops})`;
  }

  return {
    bg: bgColor,
    accent: `#${accent1}`,
    headerBg: `#${dk1}`,
    headerText: `#${lt1}`,
    bodyFont: brandKit?.fonts?.minor || 'Arial',
    headerFont: brandKit?.fonts?.major || 'Arial',
    masterBgGradient,
  };
}

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

function SlideFullPreview({ slide, index, template, brandColors }: { slide: SlideContent; index: number; template: PresentationTemplate; brandColors?: { bg: string; accent: string; headerBg: string; headerText: string; bodyFont: string; headerFont: string; masterBgGradient?: string } }) {
  const colors = brandColors || DEFAULT_TEMPLATE_COLORS[template];
  const isTitle = slide.slideType === 'title' || slide.slideType === 'section_divider' || slide.slideType === 'image_feature';
  const hasImage = (slide.slideType === 'image_feature' || slide.slideType === 'section_divider') && slide.imageCategory;
  const imageUrl = hasImage ? `/images/presentation-library/${slide.imageCategory}-1.jpg` : null;

  return (
    <div
      className="w-full aspect-[16/9] rounded-md overflow-hidden relative select-none"
      style={{
        backgroundColor: isTitle ? colors.bg : '#ffffff',
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
      }}
    >
      {hasImage && imageUrl && (
        <>
          <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <div className="absolute inset-0 bg-black/50" />
        </>
      )}
      {isTitle && !hasImage && (
        <div className="absolute inset-0" style={{ background: ('masterBgGradient' in colors && colors.masterBgGradient) || `linear-gradient(135deg, ${colors.bg} 0%, ${colors.accent}33 100%)` }} />
      )}

      {!isTitle && (
        <div className="h-[8%] flex items-center justify-between px-[4%]" style={{ backgroundColor: colors.headerBg }}>
          <span className="text-white font-semibold text-[clamp(7px,1.1vw,13px)] truncate" style={{ fontFamily: colors.headerFont }}>{slide.title}</span>
          <span className="text-white/50 text-[clamp(5px,0.5vw,7px)] shrink-0 ml-2">{index + 1}</span>
        </div>
      )}

      <div className={`${isTitle ? 'h-full' : 'h-[92%]'} p-[4%] flex flex-col relative`} style={{ fontFamily: colors.bodyFont }}>
        {isTitle && (
          <div className="flex-1 flex flex-col justify-center relative z-10">
            <div className="w-12 h-[2px] mb-3" style={{ backgroundColor: colors.accent }} />
            <p className="font-bold text-[clamp(14px,2.2vw,28px)] leading-tight text-white" style={{ fontFamily: colors.headerFont }}>
              {slide.title}
            </p>
            {slide.subtitle && (
              <p className="mt-2 text-[clamp(8px,1.1vw,14px)] text-white/70 leading-snug" style={{ fontFamily: colors.bodyFont }}>
                {slide.subtitle}
              </p>
            )}
            {slide.bodyContent && (
              <p className="mt-3 text-[clamp(6px,0.8vw,10px)] text-white/40" style={{ fontFamily: colors.bodyFont }}>
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
    masterBackgroundColor?: string;
    masterBackground?: { type: string; color?: string; gradientStops?: Array<{ color: string; position: number }>; gradientDirection?: string; gradientAngle?: number };
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
  const [step, setStep] = useState<'configure' | 'priorities' | 'review'>('configure');
  const [priorityAdvice, setPriorityAdvice] = useState<AudiencePriorityAdvice | null>(null);
  const [selectedPriorities, setSelectedPriorities] = useState<AudiencePriority[]>([]);
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const [fullScreenSlide, setFullScreenSlide] = useState<number | null>(null);
  const [refineInstruction, setRefineInstruction] = useState('');
  const [coachingPrompt, setCoachingPrompt] = useState('');
  const [isCoachingAll, setIsCoachingAll] = useState(false);
  const [refiningSlideId, setRefiningSlideId] = useState<string | null>(null);
  const [fillingGapIdx, setFillingGapIdx] = useState<number | null>(null);
  const [showBrandPanel, setShowBrandPanel] = useState(false);
  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  const templateFileRef = useRef<HTMLInputElement>(null);
  const [userBrief, setUserBrief] = useState('');
  const [additionalMaterials, setAdditionalMaterials] = useState('');
  const [coachResult, setCoachResult] = useState<any>(null);
  const [gapAnswers, setGapAnswers] = useState<Record<number, string>>({});
  const [readinessScore, setReadinessScore] = useState<any>(null);
  const [showReadiness, setShowReadiness] = useState(false);
  const [showRehearsalMode, setShowRehearsalMode] = useState(false);
  const [rehearsalNotes, setRehearsalNotes] = useState('');
  const [rehearsalFeedback, setRehearsalFeedback] = useState<any>(null);
  const [rehearsalSlideIndex, setRehearsalSlideIndex] = useState(0);
  const [rehearsalStartTime, setRehearsalStartTime] = useState<number | null>(null);
  const [showBattleSlideDialog, setShowBattleSlideDialog] = useState(false);
  const [competitorName, setCompetitorName] = useState('');
  const [quickRefineSlideId, setQuickRefineSlideId] = useState<string | null>(null);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [dealContext, setDealContext] = useState<any>(null);
  const [showDealContext, setShowDealContext] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [approvalComment, setApprovalComment] = useState('');
  const [outcomeValue, setOutcomeValue] = useState('');

  const { data: brandTemplates = [], refetch: refetchTemplates } = useQuery<BrandTemplate[]>({
    queryKey: ['/api/templates'],
  });

  const { data: activeTemplate, refetch: refetchActiveTemplate } = useQuery<BrandTemplate>({
    queryKey: ['/api/templates/active'],
  });

  const { data: savedPresentations = [], refetch: refetchSaved } = useQuery<Array<{
    id: string; accountId: number; projectId: number; accountName: string;
    projectName: string; title: string;
    purpose: string; audience: string; template: string; slideCount: number;
    topics: string[]; slides: any[]; coaching: any[]; narrativeFlow: string;
    estimatedDuration: string; brandTemplateName?: string; createdAt: string;
  }>>({
    queryKey: ['/api/presentations/saved'],
  });

  const deleteSavedMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/presentations/saved/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/presentations/saved'] });
      toast({ title: 'Deleted', description: 'Presentation removed from history.' });
    },
  });

  const { data: presentationHistory = [], refetch: refetchHistory } = useQuery<any[]>({
    queryKey: ['/api/presentations/history'],
  });

  const saveToHistoryMutation = useMutation({
    mutationFn: async () => {
      if (!plan) return;
      const res = await apiRequest('POST', '/api/presentations/save', {
        accountId: selectedAccountId,
        projectId: selectedProjectId,
        title: plan.title || customTitle || 'Untitled Presentation',
        purpose, audience,
        slides: plan.slides,
        template: plan.template,
        audiencePriorities: selectedPriorities,
        narrativeFlow: plan.narrativeFlow,
        coaching: plan.coaching,
        readinessScore: readinessScore,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/presentations/history'] });
      toast({ title: 'Saved to History', description: 'Presentation saved for tracking and approval.' });
    },
  });

  const approvalMutation = useMutation({
    mutationFn: async ({ id, action, comment }: { id: string; action: string; comment?: string }) => {
      const res = await apiRequest('POST', `/api/presentations/history/${id}/approval`, {
        action, comment, author: 'Current User',
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/presentations/history'] });
      setApprovalComment('');
      toast({ title: 'Status Updated', description: 'Approval status has been updated.' });
    },
  });

  const outcomeMutation = useMutation({
    mutationFn: async ({ id, outcome }: { id: string; outcome: string }) => {
      const res = await apiRequest('POST', `/api/presentations/history/${id}/outcome`, { outcome });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/presentations/history'] });
      setOutcomeValue('');
      toast({ title: 'Outcome Recorded', description: 'Deal outcome has been saved.' });
    },
  });

  const fetchDealContext = async () => {
    if (!selectedAccountId || !selectedProjectId) return;
    try {
      const res = await fetch(`/api/presentations/deal-context/${selectedAccountId}/${selectedProjectId}`);
      if (res.ok) {
        const ctx = await res.json();
        setDealContext(ctx);
        setShowDealContext(true);
      }
    } catch (e) {
      console.error("Error fetching deal context:", e);
    }
  };

  function clearAndStartNew() {
    setPlan(null);
    setStep('configure');
    setCoachResult(null);
    setGapAnswers({});
    setSelectedTopics([]);
    setPurpose('customer_engagement');
    setAudience('c_suite');
    setTemplateOverride(null);
    setCustomTitle('');
    setEditingSlideIndex(null);
    setPriorityAdvice(null);
    setSelectedPriorities([]);
    setDealContext(null);
    toast({ title: 'Workspace Cleared', description: 'Ready to create a new presentation.' });
  }

  function loadSavedPresentation(saved: typeof savedPresentations[0]) {
    setSelectedAccountId(saved.accountId);
    setSelectedProjectId(saved.projectId);
    setPurpose(saved.purpose as PresentationPurpose);
    setAudience(saved.audience as PresentationAudience);
    setTemplateOverride(saved.template as PresentationTemplate);
    setCustomTitle(saved.title);
    setSelectedTopics(saved.topics as TopicCategory[]);
    setPlan({
      recommendedTemplate: saved.template as PresentationTemplate,
      templateRationale: '',
      slides: saved.slides,
      coaching: saved.coaching || [],
      dataCompleteness: {} as any,
      narrativeFlow: saved.narrativeFlow,
      estimatedDuration: saved.estimatedDuration,
    });
    setStep('review');
    toast({ title: 'Presentation Loaded', description: `"${saved.title}" loaded with ${saved.slideCount} slides.` });
  }

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
      id: td.id, label: td.label, description: topicData?.description || '', icon: td.icon,
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

  useEffect(() => {
    if (topicsData && typeof topicsData === 'object' && selectedTopics.length === 0 && !coachResult) {
      const autoSelected = Object.entries(topicsData as Record<string, any>)
        .filter(([, val]) => val?.available && val?.dataPoints > 0)
        .map(([key]) => key as TopicCategory);
      if (autoSelected.length > 0) {
        setSelectedTopics(autoSelected);
      }
    }
  }, [topicsData]);

  const prioritiesMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/presentations/audience-priorities', {
        accountId: selectedAccountId, projectId: selectedProjectId,
        purpose, audience, selectedTopics,
      });
      return res.json();
    },
    onSuccess: (data: AudiencePriorityAdvice) => {
      setPriorityAdvice(data);
      setSelectedPriorities(data.top3.slice(0, 3));
      setStep('priorities');
    },
    onError: () => {
      toast({ title: 'Could not analyze audience', description: 'Proceeding with default generation.', variant: 'destructive' });
      setSelectedPriorities([]);
      setPriorityAdvice(null);
      generateMutation.mutate();
    },
  });

  function swapPriority(removeIdx: number, newPriority: AudiencePriority) {
    setSelectedPriorities(prev => {
      const next = [...prev];
      next[removeIdx] = newPriority;
      return next;
    });
  }

  function movePriority(fromIdx: number, toIdx: number) {
    setSelectedPriorities(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  }

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
        audiencePriorities: selectedPriorities.length > 0 ? selectedPriorities : undefined,
      });
      return res.json();
    },
    onSuccess: (data: PresentationPlan) => {
      setPlan(data);
      setStep('review');
      queryClient.invalidateQueries({ queryKey: ['/api/presentations/saved'] });
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

  const readinessMutation = useMutation({
    mutationFn: async () => {
      if (!plan) throw new Error('No plan');
      const account = accounts?.find((a: any) => a.id === selectedAccountId);
      const project = projects?.find((p: any) => p.id === selectedProjectId);
      const res = await apiRequest('POST', '/api/presentations/readiness-score', {
        slides: plan.slides, purpose, audience,
        audiencePriorities: selectedPriorities,
        accountName: account?.name, projectName: project?.name,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setReadinessScore(data);
      setShowReadiness(true);
    },
    onError: () => {
      toast({ title: 'Readiness Check Failed', description: 'Could not evaluate the presentation. Please try again.', variant: 'destructive' });
    },
  });

  const quickRefineMutation = useMutation({
    mutationFn: async ({ slide, action, customInstruction }: { slide: SlideContent; action: string; customInstruction?: string }) => {
      const res = await apiRequest('POST', '/api/presentations/refine-slide-quick', {
        slide, action, customInstruction, allSlides: plan?.slides, purpose, audience,
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
      setQuickRefineSlideId(null);
      toast({ title: 'Slide Refined', description: `Applied "${variables.action.replace(/_/g, ' ')}" refinement.` });
    },
    onError: () => {
      toast({ title: 'Refinement Failed', description: 'Could not refine the slide.', variant: 'destructive' });
    },
  });

  const rehearsalMutation = useMutation({
    mutationFn: async () => {
      if (!plan) throw new Error('No plan');
      const timeSpent = rehearsalStartTime ? (Date.now() - rehearsalStartTime) / 1000 : undefined;
      const res = await apiRequest('POST', '/api/presentations/rehearsal-feedback', {
        slides: plan.slides, talkingPoints: rehearsalNotes,
        audience, purpose, audiencePriorities: selectedPriorities,
        timeSpentSeconds: timeSpent,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setRehearsalFeedback(data);
    },
    onError: () => {
      toast({ title: 'Feedback Failed', description: 'Could not generate rehearsal feedback.', variant: 'destructive' });
    },
  });

  const battleSlideMutation = useMutation({
    mutationFn: async () => {
      if (!competitorName.trim()) throw new Error('No competitor');
      const res = await apiRequest('POST', '/api/presentations/battle-slide', {
        competitorName: competitorName.trim(),
        accountId: selectedAccountId, projectId: selectedProjectId,
        purpose, audience, existingSlides: plan?.slides,
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (!plan) return;
      const newSlides = [...plan.slides];
      const summaryIdx = newSlides.findIndex(s => s.slideType === 'summary');
      if (summaryIdx >= 0) {
        newSlides.splice(summaryIdx, 0, data);
      } else {
        newSlides.push(data);
      }
      setPlan({ ...plan, slides: newSlides });
      setShowBattleSlideDialog(false);
      setCompetitorName('');
      toast({ title: 'Battle Slide Added', description: `Competitive slide vs ${data.title?.split('vs')[1]?.trim() || 'competitor'} added to your deck.` });
    },
    onError: () => {
      toast({ title: 'Generation Failed', description: 'Could not generate the battle slide.', variant: 'destructive' });
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
      toast({ title: 'Coaching Applied', description: data.explanation || 'Content has been updated based on the recommendation.' });
    },
    onError: () => {
      setFillingGapIdx(null);
      toast({ title: 'Could Not Apply', description: 'Please try again or manually edit the slides.', variant: 'destructive' });
    },
  });

  const coachAllMutation = useMutation({
    mutationFn: async (instruction: string) => {
      const res = await apiRequest('POST', '/api/presentations/coach-iterate', {
        instruction,
        slides: plan?.slides || [],
        accountId: selectedAccountId,
        projectId: selectedProjectId,
        purpose,
        audience,
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      if (!plan) return;
      if (data.slides && Array.isArray(data.slides)) {
        const updatedSlides = plan.slides.map((s, i) => {
          const byId = data.slides.find((u: any) => u.id === s.id);
          const updated = byId || data.slides[i];
          if (!updated) return s;
          return { ...s, ...updated, id: s.id, topicSource: s.topicSource };
        });
        setPlan({ ...plan, slides: updatedSlides });
      }
      setCoachingPrompt('');
      setIsCoachingAll(false);
      toast({ title: 'Coaching Applied', description: data.summary || 'All slides have been updated based on your coaching direction.' });
    },
    onError: () => {
      setIsCoachingAll(false);
      toast({ title: 'Coaching Failed', description: 'Could not apply coaching to slides. Please try again.', variant: 'destructive' });
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

  const pdfExportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/presentations/export-pdf', {
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
        throw new Error(errText || 'PDF export failed');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${customTitle || 'Korn_Ferry_Presentation'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast({ title: 'PDF Export Complete', description: 'Your presentation PDF has been downloaded.' });
    },
    onError: (err: any) => {
      toast({ title: 'PDF Export Failed', description: err.message || 'Could not export PDF.', variant: 'destructive' });
    },
  });

  function exportAsJSON() {
    if (!plan) return;
    const exportData = {
      title: customTitle || 'Korn Ferry Presentation',
      purpose,
      audience,
      template: templateOverride || plan.recommendedTemplate,
      narrativeFlow: plan.narrativeFlow,
      estimatedDuration: plan.estimatedDuration,
      templateRationale: plan.templateRationale,
      exportedAt: new Date().toISOString(),
      slides: plan.slides.map(s => ({
        id: s.id,
        slideType: s.slideType,
        title: s.title,
        subtitle: s.subtitle,
        bodyContent: s.bodyContent,
        bulletPoints: s.bulletPoints,
        metrics: s.metrics,
        quoteText: s.quoteText,
        quoteAuthor: s.quoteAuthor,
        imageCategory: s.imageCategory,
        talkTrack: s.talkTrack,
        speakerNotes: s.speakerNotes,
        flowSteps: s.flowSteps,
        comparisonItems: s.comparisonItems,
        chartData: s.chartData,
        topicSource: s.topicSource,
      })),
      coaching: plan.coaching,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${customTitle || 'Korn_Ferry_Presentation'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'JSON Exported', description: 'Presentation data downloaded as JSON.' });
  }

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

  const previewBrandColors = activeTemplate && activeTemplate.id !== 'default'
    ? brandKitToPreviewColors(activeTemplate.brandKit)
    : undefined;

  if (step === 'priorities' && priorityAdvice) {
    const IMPACT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
      high: { label: 'High Impact', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
      medium: { label: 'Medium Impact', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
      low: { label: 'Low Impact', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-900/30' },
    };
    const DATA_SUPPORT_CONFIG: Record<string, { label: string; color: string }> = {
      strong: { label: 'Strong Data', color: 'text-emerald-600 dark:text-emerald-400' },
      moderate: { label: 'Moderate Data', color: 'text-amber-600 dark:text-amber-400' },
      weak: { label: 'Weak Data', color: 'text-red-600 dark:text-red-400' },
    };

    const availableAlternatives = priorityAdvice.alternatives.filter(
      alt => !selectedPriorities.some(sp => sp.id === alt.id)
    );

    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-background sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <Button variant="ghost" size="icon" onClick={() => setStep('configure')} data-testid="button-back-from-priorities">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Target className="w-5 h-5 text-[#009B77]" />
                  <h1 className="text-lg font-semibold text-foreground">Audience Priority Advisor</h1>
                </div>
                <p className="text-xs text-muted-foreground">What will your audience care about most?</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => { setSelectedPriorities([]); generateMutation.mutate(); }} disabled={generateMutation.isPending} data-testid="button-skip-priorities">
                Skip
              </Button>
              <Button
                size="sm"
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                data-testid="button-generate-with-priorities"
              >
                {generateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                {generateMutation.isPending ? 'Generating...' : 'Generate with These Priorities'}
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Brain className="w-4 h-4 text-[#005971]" />
                  <h3 className="text-sm font-semibold text-foreground">Audience Insight</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{priorityAdvice.audienceInsight}</p>
              </Card>

              <div>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <h3 className="text-sm font-semibold text-foreground">Your Top 3 Priorities</h3>
                  <Badge variant="secondary" className="text-[10px]">{selectedPriorities.length} selected</Badge>
                </div>
                <div className="space-y-3">
                  {selectedPriorities.map((priority, idx) => (
                    <Card key={priority.id} className="p-4 border-[#009B77]/20 bg-[#009B77]/3">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                          <span className="w-6 h-6 rounded-full bg-[#009B77] text-white flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                          {idx > 0 && (
                            <button onClick={() => movePriority(idx, idx - 1)} className="text-muted-foreground hover:text-foreground" data-testid={`button-move-up-${idx}`}>
                              <ChevronLeft className="w-3.5 h-3.5 rotate-90" />
                            </button>
                          )}
                          {idx < selectedPriorities.length - 1 && (
                            <button onClick={() => movePriority(idx, idx + 1)} className="text-muted-foreground hover:text-foreground" data-testid={`button-move-down-${idx}`}>
                              <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                            </button>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="text-sm font-semibold text-foreground">{priority.title}</h4>
                            <Badge variant="secondary" className={`text-[9px] ${IMPACT_CONFIG[priority.impact]?.bg} ${IMPACT_CONFIG[priority.impact]?.color}`}>
                              {IMPACT_CONFIG[priority.impact]?.label}
                            </Badge>
                            <Badge variant="secondary" className={`text-[9px] ${DATA_SUPPORT_CONFIG[priority.dataSupport]?.color}`}>
                              {DATA_SUPPORT_CONFIG[priority.dataSupport]?.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{priority.description}</p>
                          <div className="p-2.5 rounded-md bg-[#009B77]/5 border border-[#009B77]/10">
                            <div className="flex items-start gap-1.5">
                              <Lightbulb className="w-3.5 h-3.5 text-[#009B77] mt-0.5 shrink-0" />
                              <p className="text-xs text-foreground leading-relaxed">{priority.recommendation}</p>
                            </div>
                          </div>
                          {priority.rationale && (
                            <p className="text-[10px] text-muted-foreground mt-1.5 italic">{priority.rationale}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => {
                          const removed = selectedPriorities[idx];
                          setSelectedPriorities(prev => prev.filter((_, i) => i !== idx));
                          if (removed && !priorityAdvice.alternatives.some(a => a.id === removed.id)) {
                            setPriorityAdvice(prev => prev ? { ...prev, alternatives: [...prev.alternatives, removed] } : prev);
                          }
                        }} data-testid={`button-remove-priority-${idx}`}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {selectedPriorities.length === 0 && (
                    <Card className="p-6 text-center">
                      <p className="text-sm text-muted-foreground">No priorities selected. Add from the alternatives list or re-analyze.</p>
                    </Card>
                  )}
                </div>
              </div>

              <Card className="p-4">
                <div className="flex items-start gap-2">
                  <Compass className="w-4 h-4 text-[#A3238E] mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Winning Strategy</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{priorityAdvice.winningStrategy}</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Alternative Priorities</h3>
                <p className="text-[10px] text-muted-foreground mb-3">Click to add to your Top 3, or swap with an existing priority.</p>
                <div className="space-y-2">
                  {availableAlternatives.map((alt) => (
                    <button
                      key={alt.id}
                      className="w-full text-left p-3 rounded-md border border-border hover-elevate transition-colors"
                      onClick={() => {
                        if (selectedPriorities.length < 3) {
                          setSelectedPriorities(prev => [...prev, alt]);
                        } else {
                          swapPriority(2, alt);
                          toast({ title: 'Swapped Priority', description: `Replaced #3 with "${alt.title}".` });
                        }
                      }}
                      data-testid={`button-add-alt-${alt.id}`}
                    >
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-medium text-foreground">{alt.title}</span>
                        <Badge variant="secondary" className={`text-[9px] ${IMPACT_CONFIG[alt.impact]?.bg} ${IMPACT_CONFIG[alt.impact]?.color}`}>
                          {IMPACT_CONFIG[alt.impact]?.label}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-2">{alt.description}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Plus className="w-3 h-3 text-[#009B77]" />
                        <span className="text-[10px] text-[#009B77] font-medium">
                          {selectedPriorities.length < 3 ? 'Add to Top 3' : 'Swap with #3'}
                        </span>
                      </div>
                    </button>
                  ))}
                  {availableAlternatives.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">All alternatives are in your Top 3.</p>
                  )}
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => {
                    setSelectedPriorities(priorityAdvice.top3.slice(0, 3));
                  }} data-testid="button-reset-priorities">
                    <RotateCcw className="w-3 h-3 mr-2" />
                    Reset to AI Recommendations
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => prioritiesMutation.mutate()} disabled={prioritiesMutation.isPending} data-testid="button-reanalyze">
                    {prioritiesMutation.isPending ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <RefreshCcw className="w-3 h-3 mr-2" />}
                    Re-analyze Audience
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <Button variant="outline" onClick={clearAndStartNew} data-testid="button-clear-start-new">
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Clear & Start New
              </Button>
              <Button variant="outline" onClick={() => readinessMutation.mutate()} disabled={readinessMutation.isPending} data-testid="button-readiness-check">
                {readinessMutation.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Gauge className="w-4 h-4 mr-1.5" />}
                Check Readiness
              </Button>
              <Button variant="outline" onClick={() => { setShowRehearsalMode(true); setRehearsalSlideIndex(0); setRehearsalNotes(''); setRehearsalFeedback(null); setRehearsalStartTime(Date.now()); }} data-testid="button-rehearsal">
                <PlayCircle className="w-4 h-4 mr-1.5" />
                Rehearse
              </Button>
              <Button variant="outline" onClick={() => setShowBattleSlideDialog(true)} data-testid="button-battle-slide">
                <Swords className="w-4 h-4 mr-1.5" />
                Battle Slide
              </Button>
              <Button variant="outline" onClick={() => saveToHistoryMutation.mutate()} disabled={saveToHistoryMutation.isPending} data-testid="button-save-history">
                {saveToHistoryMutation.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
                Save
              </Button>
              {selectedAccountId && selectedProjectId && (
                <Button variant="outline" onClick={fetchDealContext} data-testid="button-deal-context">
                  <Briefcase className="w-4 h-4 mr-1.5" />
                  Deal Context
                </Button>
              )}
              <Button variant="outline" onClick={() => setShowHistoryPanel(true)} data-testid="button-history">
                <History className="w-4 h-4 mr-1.5" />
                History
                {presentationHistory.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">{presentationHistory.length}</Badge>
                )}
              </Button>
              <Button variant="outline" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending} data-testid="button-regenerate">
                {generateMutation.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <RefreshCcw className="w-4 h-4 mr-1.5" />}
                Regenerate
              </Button>
              <Button onClick={() => exportMutation.mutate()} disabled={exportMutation.isPending} data-testid="button-export-pptx">
                {exportMutation.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Download className="w-4 h-4 mr-1.5" />}
                Export PPTX
              </Button>
              <Button variant="outline" onClick={() => pdfExportMutation.mutate()} disabled={pdfExportMutation.isPending} data-testid="button-export-pdf">
                {pdfExportMutation.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <FileText className="w-4 h-4 mr-1.5" />}
                Export PDF
              </Button>
              <Button variant="outline" onClick={exportAsJSON} data-testid="button-export-json">
                <FileJson className="w-4 h-4 mr-1.5" />
                Export JSON
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
                            <SlideFullPreview slide={slide} index={idx} template={currentTemplate} brandColors={previewBrandColors} />
                          </div>
                        </div>

                        {refiningSlideId === slide.id && (
                          <div className="px-4 pb-4 border-t pt-3">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <WandSparkles className="w-4 h-4 text-[#A3238E]" />
                              <span className="text-sm font-medium text-foreground">AI Refinement</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 mb-3">
                              {[
                                { action: 'make_compelling', label: 'Make Compelling', icon: Sparkles },
                                { action: 'simplify_csuite', label: 'Simplify for C-Suite', icon: Users },
                                { action: 'add_data', label: 'Add Data Support', icon: BarChart3 },
                                { action: 'add_competitor', label: 'Add Differentiators', icon: Swords },
                                { action: 'shorten', label: 'Make Concise', icon: ListChecks },
                                { action: 'storytelling', label: 'Add Storytelling', icon: BookOpen },
                              ].map(({ action, label, icon: Icon }) => (
                                <Button
                                  key={action}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs justify-start"
                                  onClick={() => { setQuickRefineSlideId(slide.id); quickRefineMutation.mutate({ slide, action }); }}
                                  disabled={quickRefineMutation.isPending}
                                  data-testid={`button-quick-action-${action}-${idx}`}
                                >
                                  {quickRefineMutation.isPending && quickRefineSlideId === slide.id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Icon className="w-3 h-3 mr-1" />}
                                  {label}
                                </Button>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Or type custom instructions..."
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
                              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Mic className="w-3 h-3" />
                                Talk Track (Presenter Script)
                              </Label>
                              <Textarea
                                value={slide.talkTrack || ''}
                                onChange={e => updateSlide(idx, { talkTrack: e.target.value })}
                                placeholder="What to say when presenting this slide..."
                                className="resize-none text-sm"
                                rows={4}
                                data-testid={`input-slide-talktrack-${idx}`}
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Speaker Notes (Brief Reminders)</Label>
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
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 text-xs"
                                onClick={() => {
                                  setFillingGapIdx(idx);
                                  fillGapMutation.mutate(item);
                                }}
                                disabled={fillGapMutation.isPending && fillingGapIdx === idx}
                                data-testid={`button-apply-coaching-${idx}`}
                              >
                                {fillGapMutation.isPending && fillingGapIdx === idx ? (
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                ) : (
                                  <WandSparkles className="w-3 h-3 mr-1" />
                                )}
                                {isGap ? 'Fix with AI' : 'Apply to Slides'}
                              </Button>
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

              <Card className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#A3238E]" />
                  Coaching Prompt
                </h3>
                <p className="text-[10px] text-muted-foreground mb-2">Give directions to refine all slides at once. For example: "Make the tone more executive", "Add more data points", "Emphasize ROI".</p>
                <Textarea
                  placeholder="Enter coaching direction..."
                  value={coachingPrompt}
                  onChange={e => setCoachingPrompt(e.target.value)}
                  className="resize-none text-sm mb-2"
                  rows={3}
                  data-testid="input-coaching-prompt"
                />
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (coachingPrompt.trim()) {
                        setIsCoachingAll(true);
                        coachAllMutation.mutate(coachingPrompt.trim());
                      }
                    }}
                    disabled={!coachingPrompt.trim() || coachAllMutation.isPending}
                    data-testid="button-apply-coaching"
                  >
                    {coachAllMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                    Apply to All Slides
                  </Button>
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {['More executive tone', 'Add ROI emphasis', 'Simplify language', 'Strengthen storytelling'].map(suggestion => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      className="text-[10px]"
                      onClick={() => {
                        setCoachingPrompt(suggestion);
                        setIsCoachingAll(true);
                        coachAllMutation.mutate(suggestion);
                      }}
                      disabled={coachAllMutation.isPending}
                      data-testid={`button-coaching-quick-${suggestion.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
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
                <SlideFullPreview slide={plan.slides[fullScreenSlide]} index={fullScreenSlide} template={currentTemplate} brandColors={previewBrandColors} />
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
              {plan.slides[fullScreenSlide].talkTrack && (
                <div className="mt-2 p-3 rounded bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-1.5">
                    <Mic className="w-3 h-3" /> Talk Track
                  </p>
                  <p className="text-sm text-foreground">{plan.slides[fullScreenSlide].talkTrack}</p>
                </div>
              )}
              {plan.slides[fullScreenSlide].speakerNotes && (
                <div className="mt-2 p-3 rounded bg-muted/50 border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Speaker Notes</p>
                  <p className="text-sm text-foreground">{plan.slides[fullScreenSlide].speakerNotes}</p>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}

        {showReadiness && readinessScore && (
          <Dialog open={showReadiness} onOpenChange={setShowReadiness}>
            <DialogContent className="max-w-2xl w-[90vw] max-h-[85vh] overflow-y-auto" data-testid="dialog-readiness">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  <Gauge className="w-5 h-5 text-[#005971]" />
                  Presentation Readiness
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="relative w-24 h-24">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="8" />
                      <circle cx="50" cy="50" r="40" fill="none"
                        stroke={readinessScore.overallScore >= 75 ? '#009B77' : readinessScore.overallScore >= 50 ? '#F59E0B' : '#EF4444'}
                        strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${(readinessScore.overallScore / 100) * 251.2} 251.2`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-foreground">{readinessScore.overallScore}</span>
                      <span className="text-[10px] text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge variant={readinessScore.verdict === 'ready' ? 'default' : readinessScore.verdict === 'needs_work' ? 'secondary' : 'destructive'} className="mb-2">
                      {readinessScore.verdict === 'ready' ? 'Ready to Present' : readinessScore.verdict === 'needs_work' ? 'Needs Work' : 'Not Ready'}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{readinessScore.summary}</p>
                    {readinessScore.estimatedDeliveryMinutes && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Est. {readinessScore.estimatedDeliveryMinutes} min delivery</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {readinessScore.dimensions?.map((dim: any) => (
                    <div key={dim.name} className="p-2 rounded-md border text-center">
                      <div className="text-lg font-bold" style={{ color: dim.score >= 15 ? '#009B77' : dim.score >= 10 ? '#F59E0B' : '#EF4444' }}>
                        {dim.score}
                      </div>
                      <div className="text-[10px] text-muted-foreground leading-tight">{dim.name}</div>
                    </div>
                  ))}
                </div>

                {readinessScore.dimensions?.map((dim: any) => (
                  <div key={dim.name} className="p-3 rounded-md border">
                    <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{dim.name}</span>
                      <Badge variant="outline" className="text-xs">{dim.score}/20</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{dim.assessment}</p>
                    {dim.tips?.length > 0 && (
                      <div className="space-y-1">
                        {dim.tips.map((tip: string, ti: number) => (
                          <div key={ti} className="flex items-start gap-1.5">
                            <ArrowRight className="w-3 h-3 text-[#005971] mt-0.5 shrink-0" />
                            <span className="text-xs text-foreground">{tip}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {readinessScore.strengthHighlights?.length > 0 && (
                  <div className="p-3 rounded-md border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1 flex items-center gap-1"><Trophy className="w-3 h-3" /> Strengths</p>
                    {readinessScore.strengthHighlights.map((s: string, si: number) => (
                      <p key={si} className="text-xs text-foreground ml-4">{s}</p>
                    ))}
                  </div>
                )}

                {readinessScore.slideImprovements?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5"><CircleAlert className="w-4 h-4 text-amber-500" /> Slide-Specific Improvements</p>
                    <div className="space-y-2">
                      {readinessScore.slideImprovements.map((imp: any, ii: number) => (
                        <div key={ii} className="p-2 rounded border flex items-start gap-2">
                          <span className="text-xs font-mono text-muted-foreground shrink-0">#{(imp.slideIndex || 0) + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground">{imp.slideTitle}</p>
                            <p className="text-[11px] text-muted-foreground">{imp.issue}</p>
                            <p className="text-[11px] text-[#005971] dark:text-[#00ADBB] mt-0.5">{imp.suggestion}</p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => {
                            setShowReadiness(false);
                            const slideIdx = imp.slideIndex || 0;
                            if (plan?.slides[slideIdx]) {
                              setRefiningSlideId(plan.slides[slideIdx].id);
                              setRefineInstruction(imp.suggestion);
                            }
                          }} data-testid={`button-fix-slide-${ii}`}>
                            <WandSparkles className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {showRehearsalMode && plan && (
          <Dialog open={showRehearsalMode} onOpenChange={(v) => { if (!v) setShowRehearsalMode(false); }}>
            <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto" data-testid="dialog-rehearsal">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  <PlayCircle className="w-5 h-5 text-[#A3238E]" />
                  Rehearsal Mode
                  {rehearsalStartTime && (
                    <Badge variant="outline" className="text-xs ml-2">
                      <Clock className="w-3 h-3 mr-1" />
                      Started {Math.round((Date.now() - rehearsalStartTime) / 60000)} min ago
                    </Badge>
                  )}
                </DialogTitle>
              </DialogHeader>
              {!rehearsalFeedback ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="aspect-[16/9] mb-3">
                        <SlideFullPreview slide={plan.slides[rehearsalSlideIndex]} index={rehearsalSlideIndex} template={currentTemplate} brandColors={previewBrandColors} />
                      </div>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <Button variant="outline" size="sm" onClick={() => setRehearsalSlideIndex(Math.max(0, rehearsalSlideIndex - 1))} disabled={rehearsalSlideIndex === 0} data-testid="button-rehearsal-prev">
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">{rehearsalSlideIndex + 1} / {plan.slides.length}</span>
                        <Button variant="outline" size="sm" onClick={() => setRehearsalSlideIndex(Math.min(plan.slides.length - 1, rehearsalSlideIndex + 1))} disabled={rehearsalSlideIndex === plan.slides.length - 1} data-testid="button-rehearsal-next">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                      {plan.slides[rehearsalSlideIndex].talkTrack && (
                        <div className="mt-2 p-2 rounded bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                          <p className="text-[10px] font-medium text-blue-700 dark:text-blue-300 mb-0.5">Reference Talk Track</p>
                          <p className="text-xs text-foreground">{plan.slides[rehearsalSlideIndex].talkTrack}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <Label className="text-sm font-medium mb-2 flex items-center gap-1.5">
                        <Mic className="w-4 h-4 text-[#005971]" />
                        Your Talking Points
                      </Label>
                      <p className="text-xs text-muted-foreground mb-2">Type what you would say when presenting. Walk through all slides, then get AI coaching.</p>
                      <Textarea
                        placeholder="Type your talking points here as you go through each slide..."
                        value={rehearsalNotes}
                        onChange={e => setRehearsalNotes(e.target.value)}
                        className="flex-1 resize-none text-sm min-h-[200px]"
                        data-testid="textarea-rehearsal-notes"
                      />
                      <Button
                        className="mt-3 w-full"
                        onClick={() => rehearsalMutation.mutate()}
                        disabled={!rehearsalNotes.trim() || rehearsalMutation.isPending}
                        data-testid="button-get-feedback"
                      >
                        {rehearsalMutation.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Award className="w-4 h-4 mr-1.5" />}
                        Get AI Coaching Feedback
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${rehearsalFeedback.overallGrade === 'A' ? 'text-emerald-600' : rehearsalFeedback.overallGrade === 'B' ? 'text-blue-600' : rehearsalFeedback.overallGrade === 'C' ? 'text-amber-600' : 'text-red-600'}`}>
                        {rehearsalFeedback.overallGrade}
                      </div>
                      <p className="text-xs text-muted-foreground">Grade</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{rehearsalFeedback.summary}</p>
                      {rehearsalFeedback.timingAdvice && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {rehearsalFeedback.timingAdvice}</p>
                      )}
                    </div>
                  </div>

                  {rehearsalFeedback.priorityCoverage && (
                    <div className="p-3 rounded-md border">
                      <p className="text-xs font-medium text-foreground mb-1">Audience Priority Coverage: {rehearsalFeedback.priorityCoverage.coveragePercent}%</p>
                      <div className="w-full bg-muted rounded-full h-2 mb-2">
                        <div className="bg-[#009B77] h-2 rounded-full" style={{ width: `${rehearsalFeedback.priorityCoverage.coveragePercent || 0}%` }} />
                      </div>
                      {rehearsalFeedback.priorityCoverage.missed?.length > 0 && (
                        <p className="text-xs text-amber-600 dark:text-amber-400">Missed: {rehearsalFeedback.priorityCoverage.missed.join(', ')}</p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-md border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
                      <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1 flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> Strengths</p>
                      {rehearsalFeedback.strengths?.map((s: string, i: number) => (
                        <p key={i} className="text-xs text-foreground">{s}</p>
                      ))}
                    </div>
                    <div className="p-3 rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
                      <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1 flex items-center gap-1"><ThumbsDown className="w-3 h-3" /> Improvements</p>
                      {rehearsalFeedback.improvements?.map((s: string, i: number) => (
                        <p key={i} className="text-xs text-foreground">{s}</p>
                      ))}
                    </div>
                  </div>

                  {rehearsalFeedback.suggestedOpeningLine && (
                    <div className="p-3 rounded-md border bg-[#005971]/5">
                      <p className="text-xs font-medium text-[#005971] dark:text-[#00ADBB] mb-0.5">Suggested Opening</p>
                      <p className="text-sm text-foreground italic">"{rehearsalFeedback.suggestedOpeningLine}"</p>
                    </div>
                  )}
                  {rehearsalFeedback.suggestedClosingLine && (
                    <div className="p-3 rounded-md border bg-[#A3238E]/5">
                      <p className="text-xs font-medium text-[#A3238E] mb-0.5">Suggested Close / CTA</p>
                      <p className="text-sm text-foreground italic">"{rehearsalFeedback.suggestedClosingLine}"</p>
                    </div>
                  )}

                  {rehearsalFeedback.slideSpecificCoaching?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Per-Slide Coaching</p>
                      <div className="space-y-2">
                        {rehearsalFeedback.slideSpecificCoaching.map((sc: any, i: number) => (
                          <div key={i} className="p-2 rounded border flex items-start gap-2">
                            <span className="text-xs font-mono text-muted-foreground shrink-0">#{(sc.slideIndex || 0) + 1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground">{sc.slideTitle}</p>
                              <p className="text-xs text-muted-foreground">{sc.coaching}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button variant="outline" className="w-full" onClick={() => { setRehearsalFeedback(null); setRehearsalNotes(''); setRehearsalStartTime(Date.now()); }} data-testid="button-rehearse-again">
                    <RotateCcw className="w-4 h-4 mr-1.5" />
                    Practice Again
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}

        {showBattleSlideDialog && (
          <Dialog open={showBattleSlideDialog} onOpenChange={setShowBattleSlideDialog}>
            <DialogContent className="max-w-md" data-testid="dialog-battle-slide">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  <Swords className="w-5 h-5 text-[#A3238E]" />
                  Add Competitive Battle Slide
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Enter a competitor name to generate a "Why Korn Ferry" comparison slide with real-time competitive intelligence.</p>
                <Input
                  placeholder="e.g., McKinsey, Deloitte, Mercer, Heidrick..."
                  value={competitorName}
                  onChange={e => setCompetitorName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && competitorName.trim()) battleSlideMutation.mutate(); }}
                  data-testid="input-competitor-name"
                />
                <div className="flex gap-1.5 flex-wrap">
                  {['McKinsey', 'Deloitte', 'Mercer', 'Heidrick & Struggles', 'Spencer Stuart', 'Egon Zehnder'].map(name => (
                    <Button key={name} variant="outline" size="sm" className="text-xs" onClick={() => setCompetitorName(name)} data-testid={`button-competitor-${name.toLowerCase().replace(/\s+/g, '-')}`}>
                      {name}
                    </Button>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowBattleSlideDialog(false)} data-testid="button-cancel-battle">Cancel</Button>
                <Button onClick={() => battleSlideMutation.mutate()} disabled={!competitorName.trim() || battleSlideMutation.isPending} data-testid="button-generate-battle">
                  {battleSlideMutation.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Swords className="w-4 h-4 mr-1.5" />}
                  Generate Battle Slide
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {showHistoryPanel && (
          <Dialog open={showHistoryPanel} onOpenChange={setShowHistoryPanel}>
            <DialogContent className="max-w-3xl w-[90vw] max-h-[85vh] overflow-y-auto" data-testid="dialog-history">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  <History className="w-5 h-5 text-[#005971]" />
                  Presentation History
                  <Badge variant="secondary" className="text-xs">{presentationHistory.length} presentations</Badge>
                </DialogTitle>
              </DialogHeader>
              {presentationHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No presentations saved yet. Generate a presentation and click "Save" to track it here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {presentationHistory.map((pres: any) => (
                    <Card key={pres.id} className="p-3">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-medium text-foreground truncate">{pres.title || 'Untitled'}</span>
                            {pres.approvalStatus && (
                              <Badge
                                variant={pres.approvalStatus === 'approved' ? 'default' : pres.approvalStatus === 'pending' ? 'secondary' : 'destructive'}
                                className="text-xs"
                              >
                                {pres.approvalStatus === 'approved' && <CheckCircle className="w-3 h-3 mr-0.5" />}
                                {pres.approvalStatus === 'rejected' && <XCircle className="w-3 h-3 mr-0.5" />}
                                {pres.approvalStatus === 'pending' && <Clock className="w-3 h-3 mr-0.5" />}
                                {pres.approvalStatus}
                              </Badge>
                            )}
                            {pres.readinessScore && (
                              <Badge variant="outline" className="text-xs">
                                <Gauge className="w-3 h-3 mr-0.5" />
                                {pres.readinessScore}/100
                              </Badge>
                            )}
                            {pres.outcome && (
                              <Badge variant="outline" className="text-xs text-emerald-600">
                                <Trophy className="w-3 h-3 mr-0.5" />
                                {pres.outcome}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            <span>{pres.audience}</span>
                            <span>{pres.slideCount} slides</span>
                            <span>{new Date(pres.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                          {!pres.approvalStatus && (
                            <Button variant="outline" size="sm" onClick={() => approvalMutation.mutate({ id: pres.id, action: 'submit' })} data-testid={`button-submit-approval-${pres.id}`}>
                              <Send className="w-3 h-3 mr-1" />
                              Submit
                            </Button>
                          )}
                          {pres.approvalStatus === 'pending' && (
                            <>
                              <Button variant="outline" size="sm" className="text-emerald-600" onClick={() => approvalMutation.mutate({ id: pres.id, action: 'approve' })} data-testid={`button-approve-${pres.id}`}>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600" onClick={() => {
                                setSelectedHistoryId(pres.id);
                              }} data-testid={`button-reject-${pres.id}`}>
                                <XCircle className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {!pres.outcome && (
                            <Button variant="ghost" size="icon" onClick={() => {
                              setSelectedHistoryId(pres.id);
                              setOutcomeValue('');
                            }} data-testid={`button-outcome-${pres.id}`}>
                              <Trophy className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {selectedHistoryId === pres.id && !pres.outcome && (
                        <div className="mt-2 p-2 rounded border flex items-center gap-2 flex-wrap">
                          <Select value={outcomeValue} onValueChange={setOutcomeValue}>
                            <SelectTrigger className="flex-1" data-testid="select-outcome">
                              <SelectValue placeholder="Select outcome..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="won">Won</SelectItem>
                              <SelectItem value="lost">Lost</SelectItem>
                              <SelectItem value="deferred">Deferred</SelectItem>
                              <SelectItem value="expanded">Expanded</SelectItem>
                              <SelectItem value="renewed">Renewed</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" onClick={() => { outcomeMutation.mutate({ id: pres.id, outcome: outcomeValue }); setSelectedHistoryId(null); }} disabled={!outcomeValue} data-testid="button-save-outcome">
                            Save
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedHistoryId(null)} data-testid="button-cancel-outcome">Cancel</Button>
                        </div>
                      )}

                      {selectedHistoryId === pres.id && pres.approvalStatus === 'pending' && (
                        <div className="mt-2 p-2 rounded border space-y-2">
                          <Textarea
                            placeholder="Add rejection comment..."
                            value={approvalComment}
                            onChange={e => setApprovalComment(e.target.value)}
                            className="text-sm min-h-[60px]"
                            data-testid="textarea-rejection-comment"
                          />
                          <div className="flex gap-2 flex-wrap">
                            <Button size="sm" variant="destructive" onClick={() => {
                              approvalMutation.mutate({ id: pres.id, action: 'reject', comment: approvalComment });
                              setSelectedHistoryId(null);
                            }} data-testid="button-confirm-reject">
                              Reject with Comment
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedHistoryId(null)} data-testid="button-cancel-reject">Cancel</Button>
                          </div>
                        </div>
                      )}

                      {pres.approvalComments?.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {pres.approvalComments.map((c: any, ci: number) => (
                            <div key={ci} className="flex items-start gap-1.5 text-xs">
                              <MessageCircle className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                              <span className="text-muted-foreground"><strong>{c.author}</strong>: {c.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}

        {showDealContext && dealContext && (
          <Dialog open={showDealContext} onOpenChange={setShowDealContext}>
            <DialogContent className="max-w-lg" data-testid="dialog-deal-context">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  <Briefcase className="w-5 h-5 text-[#005971]" />
                  Deal Context
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Card className="p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Account</p>
                  <p className="text-sm font-medium text-foreground">{dealContext.account?.name}</p>
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                    {dealContext.account?.industry && <span>{dealContext.account.industry}</span>}
                    {dealContext.account?.employees && <span>{dealContext.account.employees} employees</span>}
                    {dealContext.account?.revenue && <span>Rev: {dealContext.account.revenue}</span>}
                  </div>
                </Card>
                <Card className="p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Engagement</p>
                  <p className="text-sm font-medium text-foreground">{dealContext.project?.name}</p>
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                    <Badge variant="outline" className="text-xs">{dealContext.project?.phase || 'Discovery'}</Badge>
                    {dealContext.project?.dealValue && <span>Value: ${dealContext.project.dealValue.toLocaleString()}</span>}
                  </div>
                </Card>
                <div className="grid grid-cols-3 gap-2">
                  <Card className="p-2 text-center">
                    <p className="text-lg font-bold text-foreground">{dealContext.jobThemeCount || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Job Themes</p>
                  </Card>
                  <Card className="p-2 text-center">
                    <p className="text-lg font-bold text-foreground">{dealContext.questionsAsked || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Questions</p>
                  </Card>
                  <Card className="p-2 text-center">
                    <p className="text-lg font-bold text-foreground">{dealContext.successStoryCount || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Stories</p>
                  </Card>
                </div>
                {dealContext.jobThemes?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Key Themes</p>
                    <div className="flex gap-1 flex-wrap">
                      {dealContext.jobThemes.map((t: any, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">{t.name || t.theme}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {dealContext.discoveryHighlights && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Discovery Notes</p>
                    <p className="text-xs text-foreground line-clamp-4">{dealContext.discoveryHighlights}</p>
                  </div>
                )}
                <div className="p-2 rounded bg-[#005971]/5 border border-[#005971]/10">
                  <p className="text-xs text-foreground">{dealContext.contextSummary}</p>
                </div>
              </div>
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
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-foreground block">{topic.label}</span>
                            {topic.description && (
                              <span className="text-[10px] text-muted-foreground block truncate">{topic.description}</span>
                            )}
                          </div>
                          {topic.available ? (
                            <Badge variant="secondary" className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 shrink-0">
                              <CheckCircle2 className="w-3 h-3 mr-0.5" />
                              {topic.dataPoints}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] text-muted-foreground shrink-0">No data</Badge>
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

                  {activeTemplate && activeTemplate.id !== 'default' ? (
                    <div className="mt-2 p-3 rounded-md border border-[#A3238E]/30 bg-[#A3238E]/5">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Palette className="w-4 h-4 text-[#A3238E]" />
                        <span className="text-sm font-medium text-foreground">Brand Template Active</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        "{activeTemplate.name}" controls all visual branding — colors, fonts, backgrounds, and layouts. Content tone is driven by your audience and purpose selections above.
                      </p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {Object.entries(activeTemplate.brandKit.colors).slice(0, 6).map(([key, val]) => (
                          <div key={key} className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: `#${val}` }} />
                            <span className="text-[10px] text-muted-foreground">{key}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
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
                  onClick={() => prioritiesMutation.mutate()}
                  disabled={selectedTopics.length === 0 || !selectedProjectId || prioritiesMutation.isPending}
                  data-testid="button-analyze-audience"
                >
                  {prioritiesMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Target className="w-4 h-4 mr-2" />}
                  {prioritiesMutation.isPending ? 'Analyzing Audience...' : 'Analyze Audience & Continue'}
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

                          {coachResult.recommendedStories?.length > 0 && (
                            <div>
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <BookOpen className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                <p className="text-[10px] font-medium text-muted-foreground">Recommended Client Stories</p>
                              </div>
                              <div className="space-y-1.5">
                                {coachResult.recommendedStories.map((story: any) => (
                                  <div key={story.id} className="p-2 rounded-md border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20" data-testid={`story-card-${story.id}`}>
                                    <div className="flex items-start justify-between gap-2 flex-wrap">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                          {story.sourceType === 'kf_client_story' && (
                                            <Badge variant="secondary" className="text-[8px] px-1 py-0 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">KF Case Study</Badge>
                                          )}
                                          {story.company && (
                                            <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                                              <Building2 className="w-2.5 h-2.5" />
                                              {story.company}
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-xs font-medium text-foreground leading-tight">{story.title}</p>
                                      </div>
                                      <div className="flex items-center gap-1 flex-wrap shrink-0">
                                        {story.industry && <Badge variant="outline" className="text-[9px] px-1 py-0">{story.industry}</Badge>}
                                      </div>
                                    </div>
                                    {story.capability && (
                                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                                        {story.capability.split(', ').slice(0, 3).map((cap: string) => (
                                          <Badge key={cap} variant="outline" className="text-[8px] px-1 py-0 border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400">{cap}</Badge>
                                        ))}
                                      </div>
                                    )}
                                    {story.challenge && <p className="text-[10px] text-muted-foreground mt-1">{story.challenge}</p>}
                                    {story.results && <p className="text-[10px] text-purple-700 dark:text-purple-300 mt-0.5 font-medium">{story.results}</p>}
                                    <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-1 italic">{story.relevanceReason}</p>
                                    {story.sourceUrl && (
                                      <a
                                        href={story.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 mt-1.5 text-[10px] text-purple-600 dark:text-purple-400 hover:underline"
                                        data-testid={`link-story-${story.id}`}
                                      >
                                        <ExternalLink className="w-2.5 h-2.5" />
                                        View full case study on kornferry.com
                                      </a>
                                    )}
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

                {savedPresentations.length > 0 && (
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <History className="w-4 h-4 text-[#005971]" />
                      <h3 className="text-sm font-semibold text-foreground">Presentation History</h3>
                      <Badge variant="secondary" className="text-[10px]">{savedPresentations.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {savedPresentations.slice(0, 10).map(saved => (
                        <div
                          key={saved.id}
                          className="flex items-center justify-between gap-2 p-2.5 rounded-md border border-border hover-elevate"
                          data-testid={`saved-presentation-${saved.id}`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-foreground truncate">{saved.title}</p>
                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">{saved.accountName} / {saved.projectName}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Layers className="w-2.5 h-2.5" />
                                {saved.slideCount} slides
                              </span>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {new Date(saved.createdAt).toLocaleDateString()}
                              </span>
                              {saved.brandTemplateName && (
                                <Badge variant="secondary" className="text-[9px]">{saved.brandTemplateName}</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => loadSavedPresentation(saved)}
                              title="Open & edit"
                              data-testid={`button-load-${saved.id}`}
                            >
                              <FolderOpen className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                loadSavedPresentation(saved);
                                setTimeout(() => exportMutation.mutate(), 500);
                              }}
                              title="Download PPTX"
                              data-testid={`button-download-${saved.id}`}
                            >
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteSavedMutation.mutate(saved.id)}
                              title="Delete"
                              data-testid={`button-delete-${saved.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
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
