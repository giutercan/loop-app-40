import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Send,
  Sparkles,
  Target,
  TrendingUp,
  Building2,
  BarChart3,
  Lightbulb,
  ArrowRight,
  Zap,
  Mic,
  MicOff,
  Volume2,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  ChevronDown,
  Calendar,
  Loader2,
  Check,
  X,
  PlusCircle,
  Home,
  FileText,
  Eye,
  Bot,
  Wrench,
  ExternalLink,
  Activity,
  TrendingDown,
  Minus,
} from "lucide-react";
import { useVoiceSession } from "@/hooks/use-voice-session";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface Message {
  id: number;
  sessionId: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  toolCalls?: ToolCall[];
  createdAt: string;
}

interface ToolCall {
  toolName: string;
  arguments: Record<string, any>;
  result?: any;
}

interface DashboardPanel {
  type: "welcome" | "account" | "accounts" | "initiative" | "initiatives" | "kpis" | "meeting" | "recommendations" | "portfolio";
  data?: any;
  title?: string;
  charts?: ChartConfig[];
  metrics?: MetricConfig[];
  tables?: TableConfig[];
}

interface ChartConfig {
  id: string;
  type: "bar" | "doughnut" | "radar" | "gauge" | "horizontal_bar";
  title: string;
  labels: string[];
  data: number[];
  colors?: string[];
  maxValue?: number;
}

interface MetricConfig {
  label: string;
  value: string;
  trend?: "up" | "down" | "stable";
  color?: string;
  subtitle?: string;
}

interface TableConfig {
  title: string;
  headers: string[];
  rows: string[][];
}

const BRAND_COLORS = {
  navy: "#00173B",
  forest: "#00634F",
  ocean: "#005971",
  emerald: "#009B77",
  mint: "#05C690",
  lime: "#8DC63F",
  cyan: "#00ADBB",
  purple: "#A3238E",
  gray: "#929192",
};

const CHART_PALETTE = [BRAND_COLORS.forest, BRAND_COLORS.ocean, BRAND_COLORS.emerald, BRAND_COLORS.cyan, BRAND_COLORS.purple, BRAND_COLORS.lime, BRAND_COLORS.mint, BRAND_COLORS.gray];

function SVGBarChart({ chart }: { chart: ChartConfig }) {
  const maxVal = Math.max(...chart.data, 1);
  const barWidth = Math.min(40, Math.floor(280 / chart.data.length) - 8);
  const chartWidth = chart.data.length * (barWidth + 8);
  const chartHeight = 140;

  return (
    <div className="w-full">
      <p className="text-xs font-medium text-muted-foreground mb-2">{chart.title}</p>
      <svg viewBox={`0 0 ${Math.max(chartWidth, 200)} ${chartHeight + 30}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {chart.data.map((val, i) => {
          const barH = Math.max(2, (val / maxVal) * chartHeight);
          const x = i * (barWidth + 8) + 4;
          const color = chart.colors?.[i] || CHART_PALETTE[i % CHART_PALETTE.length];
          return (
            <g key={i}>
              <rect x={x} y={chartHeight - barH} width={barWidth} height={barH} rx={3} fill={color} />
              <text x={x + barWidth / 2} y={chartHeight - barH - 4} textAnchor="middle" fontSize="8" fill={color} fontWeight="600">{val}</text>
              <text x={x + barWidth / 2} y={chartHeight + 14} textAnchor="middle" fontSize="7" fill="#929192">{chart.labels[i]}</text>
            </g>
          );
        })}
        <line x1="0" y1={chartHeight} x2={Math.max(chartWidth, 200)} y2={chartHeight} stroke="#e5e7eb" strokeWidth="1" />
      </svg>
    </div>
  );
}

function SVGDoughnutChart({ chart }: { chart: ChartConfig }) {
  const total = chart.data.reduce((a, b) => a + b, 0) || 1;
  let cumAngle = 0;
  const cx = 60, cy = 60, outerR = 52, innerR = 32;

  const segments = chart.data.map((val, i) => {
    const angle = (val / total) * 360;
    const start = cumAngle;
    cumAngle += angle;
    return { start, angle, color: chart.colors?.[i] || CHART_PALETTE[i % CHART_PALETTE.length], label: chart.labels[i], pct: Math.round((val / total) * 100) };
  });

  return (
    <div className="w-full">
      <p className="text-xs font-medium text-muted-foreground mb-2">{chart.title}</p>
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 120 120" className="w-28 h-28 shrink-0">
          {segments.map((seg, i) => {
            const startRad = (seg.start - 90) * Math.PI / 180;
            const endRad = (seg.start + seg.angle - 90) * Math.PI / 180;
            const largeArc = seg.angle > 180 ? 1 : 0;
            const x1 = cx + outerR * Math.cos(startRad), y1 = cy + outerR * Math.sin(startRad);
            const x2 = cx + outerR * Math.cos(endRad), y2 = cy + outerR * Math.sin(endRad);
            const ix1 = cx + innerR * Math.cos(endRad), iy1 = cy + innerR * Math.sin(endRad);
            const ix2 = cx + innerR * Math.cos(startRad), iy2 = cy + innerR * Math.sin(startRad);
            return <path key={i} d={`M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`} fill={seg.color} />;
          })}
        </svg>
        <div className="space-y-1 min-w-0 flex-1">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-xs text-muted-foreground truncate flex-1">{seg.label}</span>
              <span className="text-xs font-medium text-foreground shrink-0">{seg.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SVGRadarChart({ chart }: { chart: ChartConfig }) {
  const maxVal = chart.maxValue || Math.max(...chart.data, 100);
  const cx = 80, cy = 80, r = 65;
  const n = chart.data.length;
  const angleStep = (2 * Math.PI) / n;

  const getPoint = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const dist = (value / maxVal) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const dataPoints = chart.data.map((val, i) => getPoint(i, val));
  const pathD = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="w-full">
      <p className="text-xs font-medium text-muted-foreground mb-2">{chart.title}</p>
      <svg viewBox="0 0 160 170" className="w-full max-w-[220px] mx-auto">
        {gridLevels.map((level, li) => {
          const pts = Array.from({ length: n }, (_, i) => getPoint(i, maxVal * level));
          return <polygon key={li} points={pts.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />;
        })}
        {Array.from({ length: n }, (_, i) => {
          const p = getPoint(i, maxVal);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e5e7eb" strokeWidth="0.5" />;
        })}
        <polygon points={dataPoints.map(p => `${p.x},${p.y}`).join(' ')} fill={BRAND_COLORS.ocean + '33'} stroke={BRAND_COLORS.ocean} strokeWidth="1.5" />
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={BRAND_COLORS.ocean} />
        ))}
        {Array.from({ length: n }, (_, i) => {
          const p = getPoint(i, maxVal + 12);
          return <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="#666">{chart.labels[i]}</text>;
        })}
      </svg>
    </div>
  );
}

function SVGGaugeChart({ chart }: { chart: ChartConfig }) {
  const value = chart.data[0] || 0;
  const max = chart.maxValue || 100;
  const pct = Math.min(value / max, 1);
  const angle = pct * 180;
  const cx = 80, cy = 75, r = 55;

  const startAngle = -180;
  const endAngle = startAngle + angle;
  const startRad = (startAngle) * Math.PI / 180;
  const endRad = (endAngle) * Math.PI / 180;

  const x1 = cx + r * Math.cos(startRad), y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad), y2 = cy + r * Math.sin(endRad);
  const largeArc = angle > 180 ? 1 : 0;

  const color = pct >= 0.7 ? BRAND_COLORS.emerald : pct >= 0.4 ? "#f59e0b" : "#ef4444";

  return (
    <div className="w-full">
      <p className="text-xs font-medium text-muted-foreground mb-1">{chart.title}</p>
      <svg viewBox="0 0 160 95" className="w-full max-w-[180px] mx-auto">
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#e5e7eb" strokeWidth="10" strokeLinecap="round" />
        {angle > 0.5 && (
          <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
        )}
        <text x={cx} y={cy - 10} textAnchor="middle" fontSize="20" fontWeight="bold" fill={color}>{value}</text>
        <text x={cx} y={cy + 6} textAnchor="middle" fontSize="8" fill="#929192">{chart.labels[0] || "Score"}</text>
      </svg>
    </div>
  );
}

function SVGHorizontalBarChart({ chart }: { chart: ChartConfig }) {
  const maxVal = Math.max(...chart.data, 1);
  const barHeight = 18;
  const gap = 6;

  return (
    <div className="w-full">
      <p className="text-xs font-medium text-muted-foreground mb-2">{chart.title}</p>
      <div className="space-y-1">
        {chart.data.map((val, i) => {
          const pct = (val / maxVal) * 100;
          const color = chart.colors?.[i] || CHART_PALETTE[i % CHART_PALETTE.length];
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground w-20 truncate text-right">{chart.labels[i]}</span>
              <div className="flex-1 h-4 bg-muted/50 rounded-sm overflow-hidden">
                <div className="h-full rounded-sm transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
              </div>
              <span className="text-[10px] font-medium w-8 text-right" style={{ color }}>{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChartRenderer({ chart }: { chart: ChartConfig }) {
  switch (chart.type) {
    case "bar": return <SVGBarChart chart={chart} />;
    case "doughnut": return <SVGDoughnutChart chart={chart} />;
    case "radar": return <SVGRadarChart chart={chart} />;
    case "gauge": return <SVGGaugeChart chart={chart} />;
    case "horizontal_bar": return <SVGHorizontalBarChart chart={chart} />;
    default: return null;
  }
}

function MetricCard({ metric }: { metric: MetricConfig }) {
  const trendIcon = metric.trend === "up" ? <TrendingUp className="h-3 w-3" /> : metric.trend === "down" ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />;
  const trendColor = metric.trend === "up" ? "text-emerald-500" : metric.trend === "down" ? "text-red-500" : "text-amber-500";

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{metric.label}</p>
          <p className="text-lg font-bold mt-0.5" style={{ color: metric.color || BRAND_COLORS.navy }}>{metric.value}</p>
          {metric.subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{metric.subtitle}</p>}
        </div>
        {metric.trend && (
          <div className={cn("shrink-0 mt-1", trendColor)}>{trendIcon}</div>
        )}
      </div>
    </div>
  );
}

function DataTable({ table }: { table: TableConfig }) {
  return (
    <div className="w-full">
      <p className="text-xs font-medium text-muted-foreground mb-2">{table.title}</p>
      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/50">
              {table.headers.map((h, i) => (
                <th key={i} className="px-3 py-2 text-left font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri} className="border-t border-border">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-2 text-foreground">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function buildDashboardFromContext(contextUpdate: any): DashboardPanel {
  if (!contextUpdate) return { type: "welcome" };

  const panel: DashboardPanel = {
    type: contextUpdate.type,
    data: contextUpdate.data,
    title: contextUpdate.title,
    charts: [],
    metrics: [],
    tables: [],
  };

  if (contextUpdate.type === "account" && contextUpdate.data) {
    const acct = contextUpdate.data;
    panel.metrics = [
      { label: "Initiatives", value: String(acct.initiativeCount || acct.projectCount || 0), color: BRAND_COLORS.forest },
      { label: "Total Value", value: acct.totalValue ? `$${(acct.totalValue / 1000000).toFixed(1)}M` : "$0", trend: "up", color: BRAND_COLORS.emerald },
      { label: "Industry", value: acct.industry || "—", color: BRAND_COLORS.ocean },
      { label: "Tier", value: acct.tier || "—", color: BRAND_COLORS.purple },
    ];

    if (acct.initiatives && acct.initiatives.length > 0) {
      const phases: Record<string, number> = {};
      acct.initiatives.forEach((ini: any) => {
        const phase = ini.phase || "discovery";
        phases[phase] = (phases[phase] || 0) + 1;
      });
      panel.charts = [{
        id: "initiative-phases",
        type: "doughnut",
        title: "Initiatives by Phase",
        labels: Object.keys(phases).map(p => p.charAt(0).toUpperCase() + p.slice(1)),
        data: Object.values(phases),
      }];

      panel.tables = [{
        title: "Active Initiatives",
        headers: ["Initiative", "Phase", "Value"],
        rows: acct.initiatives.slice(0, 8).map((ini: any) => [
          ini.name,
          (ini.phase || "Discovery").charAt(0).toUpperCase() + (ini.phase || "discovery").slice(1),
          ini.promisedValue ? `$${(ini.promisedValue / 1000000).toFixed(1)}M` : "—",
        ]),
      }];
    }
  }

  if (contextUpdate.type === "accounts" && Array.isArray(contextUpdate.data)) {
    const accounts = contextUpdate.data;
    panel.metrics = [
      { label: "Total Accounts", value: String(accounts.length), color: BRAND_COLORS.forest },
      { label: "Enterprise", value: String(accounts.filter((a: any) => a.tier === "enterprise").length), color: BRAND_COLORS.navy },
      { label: "Strategic", value: String(accounts.filter((a: any) => a.tier === "strategic").length), color: BRAND_COLORS.ocean },
      { label: "Growth", value: String(accounts.filter((a: any) => a.tier === "growth").length), color: BRAND_COLORS.emerald },
    ];

    const industries: Record<string, number> = {};
    accounts.forEach((a: any) => {
      const ind = a.industry || "Other";
      industries[ind] = (industries[ind] || 0) + 1;
    });
    if (Object.keys(industries).length > 1) {
      panel.charts = [{
        id: "accounts-by-industry",
        type: "doughnut",
        title: "Accounts by Industry",
        labels: Object.keys(industries),
        data: Object.values(industries),
      }];
    }

    panel.tables = [{
      title: "Account Portfolio",
      headers: ["Account", "Industry", "Tier", "Initiatives"],
      rows: accounts.slice(0, 10).map((a: any) => [
        a.name,
        a.industry || "—",
        a.tier || "—",
        String(a.projectCount || 0),
      ]),
    }];
  }

  if (contextUpdate.type === "initiative" && contextUpdate.data) {
    const ini = contextUpdate.data;
    panel.metrics = [
      { label: "Phase", value: (ini.phase || "Discovery").charAt(0).toUpperCase() + (ini.phase || "discovery").slice(1), color: BRAND_COLORS.forest },
      { label: "Promised Value", value: ini.promisedValue ? `$${(ini.promisedValue / 1000000).toFixed(1)}M` : "—", trend: "up", color: BRAND_COLORS.emerald },
      { label: "KPIs", value: String(ini.kpis?.length || ini.kpiCount || 0), color: BRAND_COLORS.ocean },
      { label: "Health", value: ini.healthStatus || "Active", color: BRAND_COLORS.mint },
    ];

    if (ini.kpis && ini.kpis.length > 0) {
      const onTrack = ini.kpis.filter((k: any) => k.healthStatus === "on_track").length;
      const atRisk = ini.kpis.filter((k: any) => k.healthStatus === "at_risk").length;
      const offTrack = ini.kpis.filter((k: any) => k.healthStatus === "off_track").length;
      const notStarted = ini.kpis.length - onTrack - atRisk - offTrack;
      panel.charts = [{
        id: "kpi-health",
        type: "doughnut",
        title: "KPI Health Distribution",
        labels: ["On Track", "At Risk", "Off Track", "Not Started"].filter((_, i) => [onTrack, atRisk, offTrack, notStarted][i] > 0),
        data: [onTrack, atRisk, offTrack, notStarted].filter(v => v > 0),
        colors: [BRAND_COLORS.emerald, "#f59e0b", "#ef4444", BRAND_COLORS.gray].filter((_, i) => [onTrack, atRisk, offTrack, notStarted][i] > 0),
      }];

      panel.tables = [{
        title: "KPI Overview",
        headers: ["KPI", "Current", "Target", "Health"],
        rows: ini.kpis.slice(0, 8).map((k: any) => [
          k.kpiName,
          k.currentValue || "—",
          k.targetValue || "—",
          k.healthStatus?.replace("_", " ") || "—",
        ]),
      }];
    }
  }

  if (contextUpdate.type === "initiatives" && Array.isArray(contextUpdate.data)) {
    const initiatives = contextUpdate.data;
    panel.metrics = [
      { label: "Total Initiatives", value: String(initiatives.length), color: BRAND_COLORS.forest },
    ];

    const phases: Record<string, number> = {};
    initiatives.forEach((ini: any) => {
      const phase = ini.phase || "discovery";
      phases[phase] = (phases[phase] || 0) + 1;
    });
    panel.charts = [{
      id: "phases-dist",
      type: "bar",
      title: "Initiatives by Phase",
      labels: Object.keys(phases).map(p => p.charAt(0).toUpperCase() + p.slice(1)),
      data: Object.values(phases),
    }];

    panel.tables = [{
      title: "All Initiatives",
      headers: ["Initiative", "Phase", "Value"],
      rows: initiatives.slice(0, 10).map((ini: any) => [
        ini.name,
        (ini.phase || "Discovery").charAt(0).toUpperCase() + (ini.phase || "discovery").slice(1),
        ini.promisedValue ? `$${(ini.promisedValue / 1000000).toFixed(1)}M` : "—",
      ]),
    }];
  }

  if (contextUpdate.type === "kpis" && Array.isArray(contextUpdate.data)) {
    const kpis = contextUpdate.data;
    const onTrack = kpis.filter((k: any) => k.healthStatus === "on_track").length;
    const atRisk = kpis.filter((k: any) => k.healthStatus === "at_risk").length;
    const offTrack = kpis.filter((k: any) => k.healthStatus === "off_track").length;
    const notStarted = kpis.length - onTrack - atRisk - offTrack;

    panel.metrics = [
      { label: "Total KPIs", value: String(kpis.length), color: BRAND_COLORS.forest },
      { label: "On Track", value: String(onTrack), trend: "up", color: BRAND_COLORS.emerald },
      { label: "At Risk", value: String(atRisk), trend: "stable", color: "#f59e0b" },
      { label: "Off Track", value: String(offTrack), trend: "down", color: "#ef4444" },
    ];

    panel.charts = [{
      id: "kpi-health-dist",
      type: "doughnut",
      title: "KPI Health Overview",
      labels: ["On Track", "At Risk", "Off Track", "Not Started"].filter((_, i) => [onTrack, atRisk, offTrack, notStarted][i] > 0),
      data: [onTrack, atRisk, offTrack, notStarted].filter(v => v > 0),
      colors: [BRAND_COLORS.emerald, "#f59e0b", "#ef4444", BRAND_COLORS.gray].filter((_, i) => [onTrack, atRisk, offTrack, notStarted][i] > 0),
    }];

    const kpisWithProgress = kpis.filter((k: any) => k.currentValue && k.targetValue).slice(0, 6);
    if (kpisWithProgress.length > 0) {
      panel.charts.push({
        id: "kpi-progress",
        type: "horizontal_bar",
        title: "KPI Progress (Current vs Target)",
        labels: kpisWithProgress.map((k: any) => k.kpiName),
        data: kpisWithProgress.map((k: any) => {
          const pct = Math.min(100, Math.round((parseFloat(k.currentValue) / parseFloat(k.targetValue)) * 100));
          return isNaN(pct) ? 0 : pct;
        }),
      });
    }

    panel.tables = [{
      title: "KPI Details",
      headers: ["KPI", "Current", "Target", "Unit", "Health"],
      rows: kpis.slice(0, 10).map((k: any) => [
        k.kpiName,
        k.currentValue || "—",
        k.targetValue || "—",
        k.unit || "",
        k.healthStatus?.replace("_", " ") || "—",
      ]),
    }];
  }

  if (contextUpdate.type === "meeting" && contextUpdate.data) {
    const meeting = contextUpdate.data;
    panel.metrics = [
      { label: "Meeting Type", value: meeting.type || "General", color: BRAND_COLORS.ocean },
      { label: "Talking Points", value: String(meeting.talkingPoints?.length || 0), color: BRAND_COLORS.forest },
    ];
  }

  return panel;
}

function WelcomeDashboard() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <div className="relative mb-6">
        <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-[#00634F] to-[#005971] flex items-center justify-center shadow-lg">
          <Sparkles className="h-12 w-12 text-white" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-gradient-to-br from-[#009B77] to-[#05C690] flex items-center justify-center shadow-md">
          <Activity className="h-4 w-4 text-white" />
        </div>
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">Loop Intelligence</h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        Start a conversation with Loop to see live dashboards, analytics, and insights appear here.
        Ask about your accounts, KPIs, initiatives, or let Loop guide your next action.
      </p>
      <div className="grid grid-cols-2 gap-3 max-w-xs w-full">
        {[
          { icon: Building2, label: "Account Analytics", color: BRAND_COLORS.forest },
          { icon: Target, label: "KPI Tracking", color: BRAND_COLORS.ocean },
          { icon: BarChart3, label: "Portfolio View", color: BRAND_COLORS.purple },
          { icon: Calendar, label: "Meeting Prep", color: BRAND_COLORS.emerald },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg border border-border p-3">
            <item.icon className="h-4 w-4 shrink-0" style={{ color: item.color }} />
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardView({ panel }: { panel: DashboardPanel }) {
  if (panel.type === "welcome") return <WelcomeDashboard />;

  const hasMetrics = panel.metrics && panel.metrics.length > 0;
  const hasCharts = panel.charts && panel.charts.length > 0;
  const hasTables = panel.tables && panel.tables.length > 0;

  const meetingData = panel.type === "meeting" ? panel.data : null;
  const recommendationsData = panel.type === "recommendations" ? panel.data : null;

  return (
    <ScrollArea className="h-full">
      <div className="p-5 space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: BRAND_COLORS.forest + '15' }}>
            {panel.type === "account" ? <Building2 className="h-4 w-4" style={{ color: BRAND_COLORS.forest }} /> :
             panel.type === "accounts" ? <Building2 className="h-4 w-4" style={{ color: BRAND_COLORS.forest }} /> :
             panel.type === "initiative" ? <Briefcase className="h-4 w-4" style={{ color: BRAND_COLORS.ocean }} /> :
             panel.type === "initiatives" ? <Briefcase className="h-4 w-4" style={{ color: BRAND_COLORS.ocean }} /> :
             panel.type === "kpis" ? <Target className="h-4 w-4" style={{ color: BRAND_COLORS.emerald }} /> :
             panel.type === "meeting" ? <Calendar className="h-4 w-4" style={{ color: BRAND_COLORS.purple }} /> :
             <BarChart3 className="h-4 w-4" style={{ color: BRAND_COLORS.forest }} />}
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">{panel.title || panel.type}</h2>
            <p className="text-xs text-muted-foreground">Live data from Loop</p>
          </div>
        </div>

        {hasMetrics && (
          <div className={cn("grid gap-3", (panel.metrics!.length <= 2) ? "grid-cols-2" : (panel.metrics!.length <= 4) ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3")}>
            {panel.metrics!.map((m, i) => <MetricCard key={i} metric={m} />)}
          </div>
        )}

        {hasCharts && (
          <div className={cn("grid gap-4", panel.charts!.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
            {panel.charts!.map((chart) => (
              <Card key={chart.id}>
                <CardContent className="p-4">
                  <ChartRenderer chart={chart} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {meetingData && meetingData.talkingPoints && (
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-3">Talking Points</p>
              <div className="space-y-2">
                {meetingData.talkingPoints.map((point: string, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 shrink-0 mt-0.5" style={{ color: BRAND_COLORS.forest }} />
                    <span className="text-sm text-foreground">{point}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {recommendationsData && Array.isArray(recommendationsData) && (
          <div className="space-y-2">
            {recommendationsData.map((rec: any, i: number) => (
              <Card key={i} className="border-[#A3238E]/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: BRAND_COLORS.purple + '15' }}>
                      <Lightbulb className="h-4 w-4" style={{ color: BRAND_COLORS.purple }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{rec.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {hasTables && panel.tables!.map((table, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <DataTable table={table} />
            </CardContent>
          </Card>
        ))}

        {panel.type === "account" && panel.data && (
          <div className="flex gap-2">
            <Link href={`/accounts/${panel.data.id}/sales`}>
              <Button variant="outline" size="sm" data-testid="button-view-account">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Open Account
              </Button>
            </Link>
          </div>
        )}

        {panel.type === "initiative" && panel.data && (
          <div className="flex gap-2">
            <Link href={`/projects/${panel.data.id}/sales`}>
              <Button variant="outline" size="sm" data-testid="button-view-initiative">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Open Initiative
              </Button>
            </Link>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

function FormattedMessage({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let listItems: { text: string; numbered: boolean }[] = [];
  let listStartIndex = 0;

  const formatInline = (text: string): JSX.Element => {
    const parts: (string | JSX.Element)[] = [];
    const regex = /\*\*([^*]+)\*\*/g;
    let lastIndex = 0;
    let match;
    let keyIdx = 0;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
      parts.push(<strong key={keyIdx++} className="font-semibold text-foreground">{match[1]}</strong>);
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return <>{parts.length > 0 ? parts : text}</>;
  };

  const renderList = (items: { text: string; numbered: boolean }[], startIdx: number) => {
    if (items.length === 0) return;
    elements.push(
      <div key={`list-${startIdx}`} className="space-y-1 my-1.5">
        {items.map((item, i) => (
          <div key={`item-${startIdx}-${i}`} className="flex items-start gap-2">
            {item.numbered ? (
              <span className="text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: BRAND_COLORS.forest + '15', color: BRAND_COLORS.forest }}>
                {i + 1}
              </span>
            ) : (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: BRAND_COLORS.forest }} />
            )}
            <span className="text-sm leading-snug">{formatInline(item.text)}</span>
          </div>
        ))}
      </div>
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
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

    if (listItems.length > 0) {
      renderList(listItems, listStartIndex);
      listItems = [];
    }

    if (!line) continue;

    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={`h4-${i}`} className="font-semibold text-foreground text-sm mt-2 mb-1">{line.slice(4)}</h4>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="font-bold text-foreground mt-2 mb-1">{line.slice(3)}</h3>
      );
      continue;
    }
    elements.push(
      <p key={`p-${i}`} className="text-sm leading-relaxed">{formatInline(line)}</p>
    );
  }

  if (listItems.length > 0) renderList(listItems, listStartIndex);
  return <div className="space-y-0.5">{elements}</div>;
}

function ToolExecutionIndicator({ toolCalls }: { toolCalls: ToolCall[] }) {
  return (
    <div className="space-y-1 my-2">
      {toolCalls.map((tc, i) => {
        const isSuccess = tc.result?.success !== false;
        const toolLabel = tc.toolName.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
        return (
          <div key={i} className="flex items-center gap-2 text-xs rounded-md px-2.5 py-1.5 bg-muted/50 border border-border">
            {isSuccess ? (
              <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="h-3 w-3 text-red-500 shrink-0" />
            )}
            <Wrench className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">{toolLabel}</span>
            {isSuccess && <Badge variant="secondary" className="text-[10px] h-4 ml-auto">Done</Badge>}
          </div>
        );
      })}
    </div>
  );
}

function SourcesSection({ toolCalls }: { toolCalls: ToolCall[] }) {
  const [open, setOpen] = useState(false);
  const sources = toolCalls.filter(tc => tc.result?.success && tc.result?.data);
  if (sources.length === 0) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2 hover:text-foreground transition-colors" data-testid="button-toggle-sources">
          <Eye className="h-3 w-3" />
          <span>Sources and AI Reasoning</span>
          <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 space-y-1.5 text-xs text-muted-foreground bg-muted/30 rounded-md p-2.5 border border-border">
          {sources.map((tc, i) => (
            <div key={i} className="flex items-start gap-2">
              <FileText className="h-3 w-3 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-foreground">{tc.toolName}</span>
                {tc.arguments && Object.keys(tc.arguments).length > 0 && (
                  <span className="ml-1">({Object.entries(tc.arguments).map(([k, v]) => `${k}: ${v}`).join(', ')})</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function InlineActionButtons({ actions, onAction }: { actions: { label: string; prompt: string; primary?: boolean }[]; onAction: (prompt: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {actions.map((action, i) => (
        <Button
          key={i}
          variant={action.primary ? "default" : "outline"}
          size="sm"
          className="h-7 text-xs"
          onClick={() => onAction(action.prompt)}
          data-testid={`button-inline-action-${i}`}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}

export default function CompanionCanvas() {
  const [, navigate] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardPanel>({ type: "welcome" });
  const [pendingConfirmation, setPendingConfirmation] = useState<any>(null);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('canvas-auto-speak') === 'true';
    return false;
  });
  const [playingMessageId, setPlayingMessageId] = useState<number | null>(null);
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
    onError: (error) => console.error("Voice error:", error),
    voice: "nova"
  });

  const { data: sessionData, isLoading: sessionLoading, refetch: refetchSession } = useQuery<{ session: any; messages: Message[] }>({
    queryKey: ['/api/companion/sessions', sessionId],
    enabled: !!sessionId,
  });

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/companion/sessions", { contextType: "canvas" });
      return res.json();
    },
    onSuccess: (data) => setSessionId(data.sessionId),
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/companion/chat", {
        sessionId,
        message,
        context: { currentPage: "/companion", canvasMode: true }
      });
      return res.json();
    },
    onSuccess: (data) => {
      refetchSession();
      if (data.pendingConfirmation) setPendingConfirmation(data.pendingConfirmation);
      if (data.contextUpdate) {
        const newPanel = buildDashboardFromContext(data.contextUpdate);
        setDashboard(newPanel);
      }
      if (data.navigationCommand?.type === "navigate" && data.navigationCommand?.path) {
        navigate(data.navigationCommand.path);
      }
      setIsTyping(false);
    },
    onError: () => setIsTyping(false),
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
    onSuccess: (data) => {
      setPendingConfirmation(null);
      refetchSession();
      if (data?.contextUpdate) {
        setDashboard(buildDashboardFromContext(data.contextUpdate));
      }
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
    }
  });

  useEffect(() => {
    sendMessageRef.current = (text: string) => sendMessageMutation.mutate(text);
  });

  useEffect(() => {
    if (!sessionId && !createSessionMutation.isPending) createSessionMutation.mutate();
  }, [sessionId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [sessionData?.messages, isTyping]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
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
      if (latestMessage?.role === 'assistant' && latestMessage.content) {
        setPlayingMessageId(latestMessage.id);
        voiceSession.playAudio(latestMessage.content).finally(() => setPlayingMessageId(null));
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
    if (voiceSession.isRecording) await voiceSession.stopRecording();
    else await voiceSession.startRecording();
  };

  const toggleAutoSpeak = useCallback(() => {
    setAutoSpeakEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('canvas-auto-speak', String(newValue));
      if (!newValue) { voiceSession.stopAudio(); setPlayingMessageId(null); }
      return newValue;
    });
  }, [voiceSession]);

  const messages = sessionData?.messages || [];

  const quickStarters = [
    { label: "View all accounts", prompt: "Show me all my accounts with their health status", icon: Building2 },
    { label: "Create new account", prompt: "I want to create a new account for a client", icon: PlusCircle },
    { label: "KPIs needing attention", prompt: "Show me KPIs that need attention across all accounts", icon: Target },
    { label: "Prepare for a meeting", prompt: "Help me prepare talking points for a client meeting", icon: Calendar },
    { label: "Research a company", prompt: "Help me research a company for discovery", icon: Lightbulb },
    { label: "Health check", prompt: "Which accounts or initiatives need my attention today?", icon: Activity },
  ];

  return (
    <div className="h-screen flex flex-col bg-background" data-testid="companion-canvas">
      <header className="h-12 border-b flex items-center justify-between px-4 shrink-0 bg-card" data-testid="canvas-header">
        <div className="flex items-center gap-3">
          <Link href="/accounts">
            <Button variant="ghost" size="icon" data-testid="button-back-home">
              <Home className="h-4 w-4" />
            </Button>
          </Link>
          <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.forest}, ${BRAND_COLORS.ocean})` }}>
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground leading-none">Loop Canvas</h1>
            <p className="text-[10px] text-muted-foreground">AI-Powered Workspace</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleAutoSpeak}
            className={cn("h-8 w-8", autoSpeakEnabled && "text-[#009B77]")}
            data-testid="button-toggle-auto-speak"
            title={autoSpeakEnabled ? "Voice responses on" : "Voice responses off"}>
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-[65] border-r overflow-hidden bg-muted/20" data-testid="dashboard-panel">
          <DashboardView panel={dashboard} />
        </div>

        <div className="flex-[35] flex flex-col overflow-hidden min-w-[320px] max-w-[480px]" data-testid="chat-panel">
          <div className="px-3 py-2 border-b bg-card flex items-center gap-2">
            <Bot className="h-4 w-4" style={{ color: BRAND_COLORS.forest }} />
            <span className="text-xs font-medium text-foreground">Conversation</span>
            {messages.length > 0 && (
              <Badge variant="secondary" className="text-[10px] h-4 ml-auto">{messages.length}</Badge>
            )}
          </div>

          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="p-3 space-y-3">
              {sessionLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-3/4" />
                  <Skeleton className="h-8 w-1/2 ml-auto" />
                </div>
              ) : messages.length === 0 ? (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <div className="h-12 w-12 mx-auto rounded-xl flex items-center justify-center mb-3"
                         style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.forest}22, ${BRAND_COLORS.ocean}22)` }}>
                      <Sparkles className="h-6 w-6" style={{ color: BRAND_COLORS.forest }} />
                    </div>
                    <p className="text-sm font-medium text-foreground">How can I help?</p>
                    <p className="text-xs text-muted-foreground mt-1">Ask me anything about your accounts, initiatives, or KPIs</p>
                  </div>
                  <div className="space-y-1.5">
                    {quickStarters.map((action, i) => (
                      <button
                        key={i}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border text-left hover-elevate transition-colors"
                        onClick={() => handleQuickAction(action.prompt)}
                        disabled={sendMessageMutation.isPending}
                        data-testid={`button-quick-${i}`}
                      >
                        <action.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs text-foreground">{action.label}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[92%] rounded-xl",
                        msg.role === "user"
                          ? "px-3 py-2 text-white text-sm"
                          : "px-3 py-2.5 bg-card border border-border"
                      )} style={msg.role === "user" ? { backgroundColor: BRAND_COLORS.forest } : undefined}>

                        {msg.role === "assistant" && (
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <div className="h-5 w-5 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.forest}, ${BRAND_COLORS.ocean})` }}>
                              <Sparkles className="h-2.5 w-2.5 text-white" />
                            </div>
                            <span className="text-[10px] font-medium" style={{ color: BRAND_COLORS.forest }}>Loop</span>
                            {playingMessageId === msg.id && (
                              <Badge variant="secondary" className="text-[10px] h-4 ml-1">
                                <Volume2 className="h-2.5 w-2.5 mr-0.5 animate-pulse" /> Speaking
                              </Badge>
                            )}
                          </div>
                        )}

                        {msg.role === "assistant" ? (
                          <FormattedMessage content={msg.content} />
                        ) : (
                          <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                        )}

                        {msg.role === "assistant" && msg.toolCalls && msg.toolCalls.length > 0 && (
                          <>
                            <ToolExecutionIndicator toolCalls={msg.toolCalls} />
                            <SourcesSection toolCalls={msg.toolCalls} />
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-card border border-border rounded-xl px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.forest}, ${BRAND_COLORS.ocean})` }}>
                            <Sparkles className="h-2.5 w-2.5 text-white" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Loader2 className="h-3 w-3 animate-spin" style={{ color: BRAND_COLORS.forest }} />
                            <span className="text-xs text-muted-foreground">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {pendingConfirmation && (
                    <div className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground mb-2">{pendingConfirmation.confirmationMessage}</p>
                          <div className="flex items-center gap-2">
                            <Button size="sm" className="h-7 text-xs" onClick={() => confirmActionMutation.mutate(true)} disabled={confirmActionMutation.isPending} data-testid="button-confirm-yes">
                              <Check className="h-3 w-3 mr-1" /> Yes
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => confirmActionMutation.mutate(false)} disabled={confirmActionMutation.isPending} data-testid="button-confirm-no">
                              <X className="h-3 w-3 mr-1" /> No
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>

          <div className="border-t p-3 bg-card">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleVoiceToggle} disabled={voiceSession.isProcessing}
                className={cn("shrink-0 h-8 w-8", voiceSession.isRecording && "bg-red-500 text-white")}
                data-testid="button-voice-input">
                {voiceSession.isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : voiceSession.isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Input ref={inputRef} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Message Loop..." className="flex-1 h-8 text-sm" disabled={sendMessageMutation.isPending} data-testid="input-message" />
              <Button onClick={handleSendMessage} disabled={!inputValue.trim() || sendMessageMutation.isPending}
                size="icon" className="shrink-0 h-8 w-8" data-testid="button-send-message">
                {sendMessageMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            {voiceSession.isRecording && (
              <p className="text-[10px] text-center text-muted-foreground mt-1.5 animate-pulse">Listening... Speak now</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
