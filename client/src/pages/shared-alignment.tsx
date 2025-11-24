import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Building2, Sparkles, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface JobThemeKPI {
  id: number;
  kpiName: string;
  kpiType: string;
  unit: string;
  baselineValue: string | null;
  targetValue: string | null;
  baselineEnteredBy: string | null;
  baselineEnteredByName: string | null;
  targetEnteredBy: string | null;
  targetEnteredByName: string | null;
  customerComment: string | null;
  definition: string | null;
}

interface JobTheme {
  id: number;
  jobName: string;
  capabilityName: string;
  kpis: JobThemeKPI[];
}

interface SharedAlignmentData {
  project: {
    name: string;
    companyName: string;
  };
  jobThemes: JobTheme[];
  permissions: string;
  customerName: string | null;
}

export default function SharedAlignmentPage() {
  const [, params] = useRoute("/shared/alignment/:token");
  const token = params?.token || "";
  const { toast } = useToast();
  const [customerName, setCustomerName] = useState("");

  const { data, isLoading, error } = useQuery<SharedAlignmentData>({
    queryKey: [`/api/alignment/shared/${token}`],
    enabled: !!token,
  });

  // Set initial customer name from share link
  useEffect(() => {
    if (data?.customerName) {
      setCustomerName(data.customerName);
    }
  }, [data?.customerName]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading alignment data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              This link may have expired or been revoked. Please contact the consultant for a new link.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const canEdit = data.permissions === "edit";
  const selectedJobThemes = data.jobThemes.filter(job => 
    job.kpis.some(kpi => kpi.baselineValue || kpi.targetValue)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto p-6">
          {/* Company Logo and Name */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold" data-testid="text-company-name">
                {data.project.companyName}
              </h1>
              <p className="text-xs text-muted-foreground">
                Korn Ferry Value Alignment
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-1">
                Alignment Collaboration
              </h2>
              <p className="text-sm text-muted-foreground">
                {data.project.name}
              </p>
            </div>
            <Badge variant="secondary" data-testid="badge-permission">
              {canEdit ? "Edit Access" : "View Only"}
            </Badge>
          </div>

          {/* Customer Name Input */}
          {canEdit && (
            <div className="mt-6 max-w-sm">
              <Label htmlFor="customerName">Your Name (Optional)</Label>
              <Input
                id="customerName"
                placeholder="Enter your name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-2"
                data-testid="input-customer-name-field"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your name will be attributed to any values you enter
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto p-6">
        {selectedJobThemes.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No KPIs Selected Yet</CardTitle>
              <CardDescription>
                The consultant hasn't selected any KPIs for collaboration yet. Please check back later.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-6">
            {selectedJobThemes.map((job) => (
              <SharedJobThemeCard
                key={job.id}
                job={job}
                token={token}
                canEdit={canEdit}
                customerName={customerName}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface SharedJobThemeCardProps {
  job: JobTheme;
  token: string;
  canEdit: boolean;
  customerName: string;
}

function SharedJobThemeCard({ job, token, canEdit, customerName }: SharedJobThemeCardProps) {
  const { toast } = useToast();
  const selectedKPIs = job.kpis.filter(kpi => kpi.baselineValue || kpi.targetValue);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{job.jobName}</CardTitle>
            <CardDescription className="mt-1">{job.capabilityName}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {selectedKPIs.map((kpi) => (
            <SharedKPIRow
              key={kpi.id}
              kpi={kpi}
              token={token}
              canEdit={canEdit}
              customerName={customerName}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface SharedKPIRowProps {
  kpi: JobThemeKPI;
  token: string;
  canEdit: boolean;
  customerName: string;
}

function SharedKPIRow({ kpi, token, canEdit, customerName }: SharedKPIRowProps) {
  const { toast } = useToast();
  const [localBaseline, setLocalBaseline] = useState(kpi.baselineValue || "");
  const [localTarget, setLocalTarget] = useState(kpi.targetValue || "");
  const [localComment, setLocalComment] = useState(kpi.customerComment || "");

  // Sync with server data
  useEffect(() => {
    setLocalBaseline(kpi.baselineValue || "");
  }, [kpi.baselineValue]);

  useEffect(() => {
    setLocalTarget(kpi.targetValue || "");
  }, [kpi.targetValue]);

  useEffect(() => {
    setLocalComment(kpi.customerComment || "");
  }, [kpi.customerComment]);

  const updateKPIMutation = useMutation({
    mutationFn: async (data: { baselineValue?: string; targetValue?: string; customerComment?: string }) => {
      return await apiRequest("PATCH", `/api/alignment/shared/${token}/kpis/${kpi.id}`, {
        ...data,
        customerName: customerName || "Customer",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/alignment/shared/${token}`], refetchType: "all" });
      toast({
        title: "Updated successfully",
        description: "Your changes have been saved",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Please try again",
      });
    },
  });

  const generateRationaleMutation = useMutation<{ rationale: string; confidence: string }, Error, void>({
    mutationFn: async (): Promise<{ rationale: string; confidence: string }> => {
      const response = await apiRequest("POST", `/api/alignment/shared/${token}/kpis/${kpi.id}/generate-rationale`, {});
      return response as unknown as { rationale: string; confidence: string };
    },
    onSuccess: (data: { rationale: string; confidence: string }) => {
      setLocalComment(data.rationale);
      updateKPIMutation.mutate({ customerComment: data.rationale });
      toast({
        title: "AI Rationale Generated",
        description: "You can edit the suggestion before saving",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: error.message || "Please ensure baseline and target values are set",
      });
    },
  });

  const handleBaselineBlur = () => {
    if (localBaseline !== kpi.baselineValue) {
      updateKPIMutation.mutate({ baselineValue: localBaseline });
    }
  };

  const handleTargetBlur = () => {
    if (localTarget !== kpi.targetValue) {
      updateKPIMutation.mutate({ targetValue: localTarget });
    }
  };

  const handleCommentBlur = () => {
    if (localComment !== kpi.customerComment) {
      updateKPIMutation.mutate({ customerComment: localComment });
    }
  };

  const baselineNum = parseFloat(localBaseline || "0");
  const targetNum = parseFloat(localTarget || "0");
  const hasValues = localBaseline && localTarget;
  const gap = hasValues ? Math.abs(targetNum - baselineNum) : 0;
  const improvement = hasValues && baselineNum !== 0 
    ? ((targetNum - baselineNum) / baselineNum * 100) 
    : 0;

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium">{kpi.kpiName}</h4>
          {kpi.definition && (
            <p className="text-sm text-muted-foreground mt-1">{kpi.definition}</p>
          )}
          <Badge variant="outline" className="mt-2" data-testid={`badge-kpi-type-${kpi.id}`}>
            {kpi.kpiType === "primary" ? "Primary KPI" : "Supporting KPI"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Baseline */}
        <div className="space-y-2">
          <Label htmlFor={`baseline-${kpi.id}`}>
            Current Baseline
            {kpi.baselineEnteredBy && (
              <span className="text-xs text-muted-foreground ml-2">
                (by {kpi.baselineEnteredBy === "customer" ? kpi.baselineEnteredByName || "Customer" : "Consultant"})
              </span>
            )}
          </Label>
          <Input
            id={`baseline-${kpi.id}`}
            type="text"
            placeholder={`e.g., 50 ${kpi.unit}`}
            value={localBaseline}
            onChange={(e) => setLocalBaseline(e.target.value)}
            onBlur={handleBaselineBlur}
            disabled={!canEdit}
            data-testid={`input-baseline-${kpi.id}`}
          />
        </div>

        {/* Target */}
        <div className="space-y-2">
          <Label htmlFor={`target-${kpi.id}`}>
            Target (Desired)
            {kpi.targetEnteredBy && (
              <span className="text-xs text-muted-foreground ml-2">
                (by {kpi.targetEnteredBy === "customer" ? kpi.targetEnteredByName || "Customer" : "Consultant"})
              </span>
            )}
          </Label>
          <Input
            id={`target-${kpi.id}`}
            type="text"
            placeholder={`e.g., 75 ${kpi.unit}`}
            value={localTarget}
            onChange={(e) => setLocalTarget(e.target.value)}
            onBlur={handleTargetBlur}
            disabled={!canEdit}
            data-testid={`input-target-${kpi.id}`}
          />
        </div>

        {/* Gap & Benefit */}
        <div className="space-y-2">
          <Label>Gap & Benefit</Label>
          {hasValues ? (
            <div className="flex items-center gap-2 h-9">
              {targetNum > baselineNum ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-orange-600" />
              )}
              <span className="font-medium">{gap.toFixed(2)}</span>
              <span className="text-sm text-muted-foreground">
                ({improvement > 0 ? "+" : ""}{improvement.toFixed(1)}%)
              </span>
            </div>
          ) : (
            <div className="flex items-center h-9 text-sm text-muted-foreground">
              Enter values to see gap
            </div>
          )}
        </div>
      </div>

      {/* Customer Comment */}
      {canEdit && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`comment-${kpi.id}`}>Your Notes / Rationale (Optional)</Label>
            {hasValues && (
              <Button
                size="sm"
                variant="outline"
                className="gap-2 h-8"
                onClick={() => generateRationaleMutation.mutate()}
                disabled={generateRationaleMutation.isPending}
                data-testid={`button-ai-suggest-${kpi.id}`}
              >
                {generateRationaleMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Suggest
                  </>
                )}
              </Button>
            )}
          </div>
          <Textarea
            id={`comment-${kpi.id}`}
            placeholder="Add context about these values or explain your reasoning..."
            value={localComment}
            onChange={(e) => setLocalComment(e.target.value)}
            onBlur={handleCommentBlur}
            rows={2}
            data-testid={`textarea-comment-${kpi.id}`}
          />
        </div>
      )}

      {kpi.customerComment && !canEdit && (
        <div className="bg-muted/50 p-3 rounded-md">
          <p className="text-sm font-medium mb-1">Customer Note:</p>
          <p className="text-sm">{kpi.customerComment}</p>
        </div>
      )}
    </div>
  );
}
