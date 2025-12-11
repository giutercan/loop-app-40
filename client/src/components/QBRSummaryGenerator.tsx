import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Sparkles,
  Copy,
  Download,
  RefreshCw,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Target,
  Users,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react";
import { format } from "date-fns";
import type { Project } from "@shared/schema";

interface QBRSummaryGeneratorProps {
  projectId: number;
}

interface DashboardData {
  overallHealthScore: number;
  healthBreakdown: {
    onTrack: number;
    atRisk: number;
    offTrack: number;
    noData: number;
  };
  kpiDetails: Array<{
    id: number;
    name: string;
    jobName: string;
    progressPercent: number;
    status: 'on-track' | 'at-risk' | 'off-track' | 'no-data';
    current: number | null;
    target: number;
    baseline: number;
    trendDirection: 'up' | 'down' | 'stable';
  }>;
  alerts: Array<{
    kpiId: number;
    kpiName: string;
    message: string;
    severity: 'warning' | 'critical';
  }>;
  valueMetrics: {
    promised: number;
    realized: number;
    realizationPercent: number;
  };
  milestonesSummary: {
    total: number;
    achieved: number;
    planned: number;
    missed: number;
  };
  lastReviewDate?: string;
  nextReviewDate?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function QBRSummaryGenerator({ projectId }: QBRSummaryGeneratorProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<string>("");
  const [summaryType, setSummaryType] = useState<"executive" | "detailed" | "action_items">("executive");
  const [editedSummary, setEditedSummary] = useState<string>("");

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });

  const { data: dashboard, isLoading: isDashboardLoading } = useQuery<DashboardData>({
    queryKey: [`/api/projects/${projectId}/realization/dashboard`],
    enabled: !!projectId,
  });

  const generateMutation = useMutation({
    mutationFn: async (type: string) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/qbr-summary/generate`, {
        summaryType: type,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedSummary(data.summary);
      setEditedSummary(data.summary);
      toast({
        title: "Summary Generated",
        description: "Your executive summary has been created.",
      });
    },
    onError: () => {
      const fallbackSummary = generateLocalSummary();
      setGeneratedSummary(fallbackSummary);
      setEditedSummary(fallbackSummary);
    },
  });

  const generateLocalSummary = () => {
    if (!project || !dashboard) return "";

    const { healthBreakdown, valueMetrics, milestonesSummary, alerts, kpiDetails } = dashboard;
    const totalKPIs = healthBreakdown.onTrack + healthBreakdown.atRisk + healthBreakdown.offTrack + healthBreakdown.noData;

    const topPerformers = kpiDetails
      .filter(k => k.status === 'on-track')
      .slice(0, 3)
      .map(k => k.name);

    const needsAttention = kpiDetails
      .filter(k => k.status === 'off-track' || k.status === 'at-risk')
      .slice(0, 3)
      .map(k => k.name);

    if (summaryType === "executive") {
      return `# Quarterly Business Review Summary
## ${project.companyName} - ${format(new Date(), 'MMMM yyyy')}

### Executive Overview
${project.name} is ${dashboard.overallHealthScore >= 80 ? 'performing well' : dashboard.overallHealthScore >= 50 ? 'progressing with some areas needing attention' : 'facing challenges that require immediate action'} with an overall health score of ${dashboard.overallHealthScore}%.

### Value Realization
- **Value Promised:** ${formatCurrency(valueMetrics.promised)}
- **Value Realized:** ${formatCurrency(valueMetrics.realized)}
- **Realization Rate:** ${valueMetrics.realizationPercent}%

### Outcome Performance
- **On Track:** ${healthBreakdown.onTrack} of ${totalKPIs} Outcomes (${Math.round((healthBreakdown.onTrack / totalKPIs) * 100)}%)
- **At Risk:** ${healthBreakdown.atRisk} Outcomes
- **Off Track:** ${healthBreakdown.offTrack} Outcomes
${healthBreakdown.noData > 0 ? `- **Awaiting Data:** ${healthBreakdown.noData} Outcomes` : ''}

### Milestones
- **Achieved:** ${milestonesSummary.achieved} of ${milestonesSummary.total}
- **In Progress:** ${milestonesSummary.planned}
${milestonesSummary.missed > 0 ? `- **Missed:** ${milestonesSummary.missed}` : ''}

### Key Highlights
${topPerformers.length > 0 ? `**Strong Performers:** ${topPerformers.join(', ')}` : 'No top performers identified yet.'}

${needsAttention.length > 0 ? `**Needs Attention:** ${needsAttention.join(', ')}` : ''}

${alerts.length > 0 ? `### Active Alerts
${alerts.slice(0, 3).map(a => `- ${a.kpiName}: ${a.message}`).join('\n')}` : ''}

---
*Generated on ${format(new Date(), 'PPP')}*`;
    }

    if (summaryType === "action_items") {
      return `# Action Items - ${project.companyName}
## Generated ${format(new Date(), 'PPP')}

### Immediate Priorities
${needsAttention.map((kpi, i) => `${i + 1}. Review and develop intervention plan for **${kpi}**`).join('\n')}
${healthBreakdown.noData > 0 ? `${needsAttention.length + 1}. Collect baseline data for ${healthBreakdown.noData} outcome(s) missing measurements` : ''}

### This Quarter
- Review progress on ${milestonesSummary.planned} planned milestones
- Address ${alerts.filter(a => a.severity === 'critical').length} critical alerts
- Schedule follow-up with key stakeholders

### Recommendations
${dashboard.overallHealthScore < 50 ? '- **Urgent:** Conduct diagnostic review of off-track outcomes' : ''}
${valueMetrics.realizationPercent < 50 ? '- Accelerate value realization activities' : ''}
- Continue monitoring ${healthBreakdown.atRisk} at-risk outcomes
- Celebrate and communicate wins from ${healthBreakdown.onTrack} on-track outcomes

---
*Next Review: ${dashboard.nextReviewDate ? format(new Date(dashboard.nextReviewDate), 'PPP') : 'TBD'}*`;
    }

    return `# Detailed Progress Report
## ${project.companyName} - ${format(new Date(), 'MMMM yyyy')}

### Initiative: ${project.name}
**Sector:** ${project.sector || 'Not specified'}
**Business Unit:** ${project.businessUnit || 'Not specified'}
**Current Phase:** Realization

---

### Health Score: ${dashboard.overallHealthScore}/100

The overall health score reflects the weighted performance across all tracked outcomes.

### Value Metrics
| Metric | Value |
|--------|-------|
| Value Promised | ${formatCurrency(valueMetrics.promised)} |
| Value Realized | ${formatCurrency(valueMetrics.realized)} |
| Realization % | ${valueMetrics.realizationPercent}% |

### Outcome Breakdown

#### On Track (${healthBreakdown.onTrack})
${kpiDetails.filter(k => k.status === 'on-track').map(k => `- ${k.name}: ${k.progressPercent}% progress`).join('\n') || 'None'}

#### At Risk (${healthBreakdown.atRisk})
${kpiDetails.filter(k => k.status === 'at-risk').map(k => `- ${k.name}: ${k.progressPercent}% progress`).join('\n') || 'None'}

#### Off Track (${healthBreakdown.offTrack})
${kpiDetails.filter(k => k.status === 'off-track').map(k => `- ${k.name}: ${k.progressPercent}% progress`).join('\n') || 'None'}

### Milestones Summary
- Total: ${milestonesSummary.total}
- Achieved: ${milestonesSummary.achieved}
- Planned: ${milestonesSummary.planned}
- Missed: ${milestonesSummary.missed}

---
*Report generated on ${format(new Date(), 'PPP p')}*`;
  };

  const handleGenerate = () => {
    if (!project || !dashboard) {
      toast({
        title: "Unable to generate",
        description: "Initiative data is not available.",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate(summaryType);
    setIsDialogOpen(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedSummary);
      toast({
        title: "Copied!",
        description: "Summary copied to clipboard.",
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Please select and copy manually.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([editedSummary], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `QBR_Summary_${project?.companyName?.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded",
      description: "Summary downloaded as Markdown file.",
    });
  };

  if (isDashboardLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dashboard) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No data available for summary generation</p>
        </CardContent>
      </Card>
    );
  }

  const { healthBreakdown, valueMetrics, alerts } = dashboard;
  const totalKPIs = healthBreakdown.onTrack + healthBreakdown.atRisk + healthBreakdown.offTrack + healthBreakdown.noData;

  return (
    <>
      <Card data-testid="card-qbr-generator">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            QBR Executive Summary
          </CardTitle>
          <CardDescription>
            Generate AI-powered executive summaries for quarterly business reviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold font-mono">{dashboard.overallHealthScore}</div>
              <div className="text-xs text-muted-foreground">Health Score</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold font-mono text-primary">{healthBreakdown.onTrack}</div>
              <div className="text-xs text-muted-foreground">On Track</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold font-mono">{formatCurrency(valueMetrics.realized)}</div>
              <div className="text-xs text-muted-foreground">Value Realized</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold font-mono">{alerts.length}</div>
              <div className="text-xs text-muted-foreground">Active Alerts</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Select value={summaryType} onValueChange={(v: any) => setSummaryType(v)}>
              <SelectTrigger className="w-48" data-testid="select-summary-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="executive">Executive Summary</SelectItem>
                <SelectItem value="detailed">Detailed Report</SelectItem>
                <SelectItem value="action_items">Action Items</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              data-testid="button-generate-summary"
            >
              {generateMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Generate Summary
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {summaryType === "executive" ? "Executive Summary" : summaryType === "detailed" ? "Detailed Report" : "Action Items"}
            </DialogTitle>
            <DialogDescription>
              Review and edit the generated summary before exporting
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="preview" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="edit">Edit</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="mt-4">
              <ScrollArea className="h-[400px] border rounded-lg p-4">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm">{editedSummary}</pre>
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="edit" className="mt-4">
              <Textarea
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                className="h-[400px] font-mono text-sm"
                data-testid="textarea-edit-summary"
              />
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditedSummary(generatedSummary);
              }}
              data-testid="button-reset-summary"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline" onClick={handleCopy} data-testid="button-copy-summary">
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button onClick={handleDownload} data-testid="button-download-summary">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
