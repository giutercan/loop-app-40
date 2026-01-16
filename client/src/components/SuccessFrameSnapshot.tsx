import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Target, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Plus, 
  Trash2,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SponsorKPI {
  id: string;
  kpiName: string;
  baseline: string | null;
  baselineDate: string | null;
  baselineSource: string | null;
  target: string | null;
  targetTimeframe: string | null;
  confidenceLevel: "high" | "medium" | "exploratory";
  ownerName: string | null;
  ownerRole: string | null;
  notes: string | null;
  linkedJobThemeKPIId: number | null;
}

interface SuccessFrame {
  id: number;
  packId: number;
  projectId: number;
  version: number;
  isCurrentVersion: boolean;
  kpis: SponsorKPI[];
  uncertaintyStatement: string | null;
  assumptionsNotes: string | null;
  isLocked: boolean;
  lockedAt: string | null;
  lockedBy: string | null;
  aiInferred: boolean;
  aiInferenceSource: string | null;
  aiConfirmedBy: string | null;
  aiConfirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SuccessFrameSnapshotProps {
  packId: number;
  projectName?: string;
  readOnly?: boolean;
  onUpdate?: () => void;
}

const confidenceColors = {
  high: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  exploratory: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

const confidenceLabels = {
  high: "High Confidence",
  medium: "Medium Confidence",
  exploratory: "Exploratory",
};

function generateId() {
  return `kpi-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function KPICard({ 
  kpi, 
  isLocked, 
  onUpdate, 
  onRemove, 
  isExpanded,
  onToggleExpand
}: { 
  kpi: SponsorKPI; 
  isLocked: boolean;
  onUpdate: (updates: Partial<SponsorKPI>) => void;
  onRemove: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  return (
    <Card className="border-l-4 border-l-primary/40 hover-elevate">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex-1 min-w-0">
            {isLocked ? (
              <CardTitle className="text-base font-semibold truncate">{kpi.kpiName}</CardTitle>
            ) : (
              <Input
                value={kpi.kpiName}
                onChange={(e) => onUpdate({ kpiName: e.target.value })}
                placeholder="KPI Name"
                className="text-base font-semibold h-8"
                data-testid={`input-kpi-name-${kpi.id}`}
              />
            )}
          </div>
          <div className="flex items-center gap-1">
            <Badge className={cn("text-xs", confidenceColors[kpi.confidenceLevel])}>
              {confidenceLabels[kpi.confidenceLevel]}
            </Badge>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={onToggleExpand}
              data-testid={`button-toggle-kpi-${kpi.id}`}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {!isLocked && (
              <Button 
                size="icon" 
                variant="ghost"
                onClick={onRemove}
                data-testid={`button-remove-kpi-${kpi.id}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Baseline
              </Label>
              {isLocked ? (
                <div className="text-sm font-medium">{kpi.baseline || "Not set"}</div>
              ) : (
                <Input
                  value={kpi.baseline || ""}
                  onChange={(e) => onUpdate({ baseline: e.target.value })}
                  placeholder="e.g., 72% win rate"
                  className="h-8"
                  data-testid={`input-kpi-baseline-${kpi.id}`}
                />
              )}
              {kpi.baselineDate && (
                <span className="text-xs text-muted-foreground">as of {kpi.baselineDate}</span>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Target className="h-3 w-3" /> Target
              </Label>
              {isLocked ? (
                <div className="text-sm font-medium">{kpi.target || "Not set"}</div>
              ) : (
                <Input
                  value={kpi.target || ""}
                  onChange={(e) => onUpdate({ target: e.target.value })}
                  placeholder="e.g., Improve by 10%"
                  className="h-8"
                  data-testid={`input-kpi-target-${kpi.id}`}
                />
              )}
              {kpi.targetTimeframe && (
                <span className="text-xs text-muted-foreground">by {kpi.targetTimeframe}</span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Target Timeframe
              </Label>
              {isLocked ? (
                <div className="text-sm">{kpi.targetTimeframe || "Not set"}</div>
              ) : (
                <Input
                  value={kpi.targetTimeframe || ""}
                  onChange={(e) => onUpdate({ targetTimeframe: e.target.value })}
                  placeholder="e.g., Q4 2025"
                  className="h-8"
                  data-testid={`input-kpi-timeframe-${kpi.id}`}
                />
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Confidence Level</Label>
              {isLocked ? (
                <Badge className={cn("text-xs", confidenceColors[kpi.confidenceLevel])}>
                  {confidenceLabels[kpi.confidenceLevel]}
                </Badge>
              ) : (
                <Select
                  value={kpi.confidenceLevel}
                  onValueChange={(v) => onUpdate({ confidenceLevel: v as any })}
                >
                  <SelectTrigger className="h-8" data-testid={`select-confidence-${kpi.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Confidence</SelectItem>
                    <SelectItem value="medium">Medium Confidence</SelectItem>
                    <SelectItem value="exploratory">Exploratory</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" /> Owner Name
              </Label>
              {isLocked ? (
                <div className="text-sm">{kpi.ownerName || "Not assigned"}</div>
              ) : (
                <Input
                  value={kpi.ownerName || ""}
                  onChange={(e) => onUpdate({ ownerName: e.target.value })}
                  placeholder="e.g., Jane Smith, CRO"
                  className="h-8"
                  data-testid={`input-kpi-owner-${kpi.id}`}
                />
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Owner Role</Label>
              {isLocked ? (
                <div className="text-sm">{kpi.ownerRole || "Not set"}</div>
              ) : (
                <Input
                  value={kpi.ownerRole || ""}
                  onChange={(e) => onUpdate({ ownerRole: e.target.value })}
                  placeholder="e.g., Chief Revenue Officer"
                  className="h-8"
                  data-testid={`input-kpi-owner-role-${kpi.id}`}
                />
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Notes</Label>
            {isLocked ? (
              <div className="text-sm text-muted-foreground">{kpi.notes || "No notes"}</div>
            ) : (
              <Textarea
                value={kpi.notes || ""}
                onChange={(e) => onUpdate({ notes: e.target.value })}
                placeholder="Additional context or assumptions..."
                className="min-h-[60px] resize-none"
                data-testid={`textarea-kpi-notes-${kpi.id}`}
              />
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function SuccessFrameSnapshot({ 
  packId, 
  projectName,
  readOnly = false,
  onUpdate 
}: SuccessFrameSnapshotProps) {
  const [expandedKPIs, setExpandedKPIs] = useState<Set<string>>(new Set());
  const [editedFrame, setEditedFrame] = useState<SuccessFrame | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const { data: successFrame, isLoading } = useQuery<SuccessFrame | null>({
    queryKey: ["/api/evidence-packs", packId, "success-frame"],
  });
  
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", `/api/evidence-packs/${packId}/success-frame`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evidence-packs", packId, "success-frame"] });
      onUpdate?.();
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      return apiRequest("PATCH", `/api/success-frames/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evidence-packs", packId, "success-frame"] });
      setEditedFrame(null);
      onUpdate?.();
    },
  });
  
  const lockMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("POST", `/api/success-frames/${id}/lock`, { lockedBy: "User" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evidence-packs", packId, "success-frame"] });
      onUpdate?.();
    },
  });
  
  const confirmAIMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("POST", `/api/success-frames/${id}/confirm-ai`, { confirmedBy: "User" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evidence-packs", packId, "success-frame"] });
      onUpdate?.();
    },
  });
  
  const currentFrame = editedFrame || successFrame;
  
  const handleKPIUpdate = (kpiId: string, updates: Partial<SponsorKPI>) => {
    if (!currentFrame) return;
    
    const updatedKPIs = currentFrame.kpis.map(kpi => 
      kpi.id === kpiId ? { ...kpi, ...updates } : kpi
    );
    
    if (editedFrame) {
      setEditedFrame({ ...editedFrame, kpis: updatedKPIs });
    } else {
      setEditedFrame({ ...currentFrame, kpis: updatedKPIs });
    }
  };
  
  const handleRemoveKPI = (kpiId: string) => {
    if (!currentFrame) return;
    
    const updatedKPIs = currentFrame.kpis.filter(kpi => kpi.id !== kpiId);
    
    if (editedFrame) {
      setEditedFrame({ ...editedFrame, kpis: updatedKPIs });
    } else {
      setEditedFrame({ ...currentFrame, kpis: updatedKPIs });
    }
  };
  
  const handleAddKPI = () => {
    const newKPI: SponsorKPI = {
      id: generateId(),
      kpiName: "",
      baseline: null,
      baselineDate: null,
      baselineSource: null,
      target: null,
      targetTimeframe: null,
      confidenceLevel: "exploratory",
      ownerName: null,
      ownerRole: null,
      notes: null,
      linkedJobThemeKPIId: null,
    };
    
    if (currentFrame) {
      const updatedKPIs = [...currentFrame.kpis, newKPI];
      if (editedFrame) {
        setEditedFrame({ ...editedFrame, kpis: updatedKPIs });
      } else {
        setEditedFrame({ ...currentFrame, kpis: updatedKPIs });
      }
    } else {
      createMutation.mutate({ kpis: [newKPI] });
    }
    
    setExpandedKPIs(prev => new Set([...Array.from(prev), newKPI.id]));
    setShowAddForm(false);
  };
  
  const handleSave = () => {
    if (!editedFrame) return;
    updateMutation.mutate({
      id: editedFrame.id,
      kpis: editedFrame.kpis,
      uncertaintyStatement: editedFrame.uncertaintyStatement,
      assumptionsNotes: editedFrame.assumptionsNotes,
    });
  };
  
  const handleCancel = () => {
    setEditedFrame(null);
  };
  
  const toggleExpand = (kpiId: string) => {
    setExpandedKPIs(prev => {
      const next = new Set(prev);
      if (next.has(kpiId)) {
        next.delete(kpiId);
      } else {
        next.add(kpiId);
      }
      return next;
    });
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  const hasChanges = editedFrame !== null;
  const isLocked = currentFrame?.isLocked || readOnly;
  const isAIInferred = currentFrame?.aiInferred && !currentFrame?.aiConfirmedAt;
  const kpiCount = currentFrame?.kpis?.length || 0;
  const canAddMore = kpiCount < 5;
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Success Frame
              {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
            </CardTitle>
            <CardDescription className="mt-1">
              {projectName ? `${projectName} - ` : ""}
              Sponsor-owned KPIs defining what success looks like
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isAIInferred && (
              <Badge variant="outline" className="gap-1">
                <Sparkles className="h-3 w-3" />
                AI Suggested
              </Badge>
            )}
            {currentFrame && !isLocked && !readOnly && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => lockMutation.mutate(currentFrame.id)}
                disabled={lockMutation.isPending}
                data-testid="button-lock-frame"
              >
                <Lock className="h-4 w-4 mr-1" />
                Lock Frame
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isAIInferred && currentFrame && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  AI has inferred these KPIs from discovery data
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Review and confirm, or adjust to match sponsor priorities
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => confirmAIMutation.mutate(currentFrame.id)}
              disabled={confirmAIMutation.isPending}
              data-testid="button-confirm-ai"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Confirm
            </Button>
          </div>
        )}
        
        {kpiCount === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              No KPIs defined yet. Add sponsor-owned KPIs to track success.
            </p>
            {!readOnly && (
              <Button onClick={handleAddKPI} data-testid="button-add-first-kpi">
                <Plus className="h-4 w-4 mr-2" />
                Add First KPI
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {currentFrame?.kpis.map((kpi) => (
              <KPICard
                key={kpi.id}
                kpi={kpi}
                isLocked={isLocked}
                onUpdate={(updates) => handleKPIUpdate(kpi.id, updates)}
                onRemove={() => handleRemoveKPI(kpi.id)}
                isExpanded={expandedKPIs.has(kpi.id)}
                onToggleExpand={() => toggleExpand(kpi.id)}
              />
            ))}
          </div>
        )}
        
        {!readOnly && !isLocked && canAddMore && kpiCount > 0 && (
          <Button
            variant="outline"
            className="w-full border-dashed"
            onClick={handleAddKPI}
            data-testid="button-add-kpi"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add KPI ({kpiCount}/5)
          </Button>
        )}
        
        {!canAddMore && kpiCount >= 5 && (
          <div className="text-center py-2 text-sm text-muted-foreground flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Maximum 5 KPIs (focused success frame)
          </div>
        )}
        
        {currentFrame && (
          <div className="border-t pt-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Uncertainty Statement
              </Label>
              {isLocked ? (
                <p className="text-sm text-muted-foreground">
                  {currentFrame.uncertaintyStatement || "No uncertainty statement provided"}
                </p>
              ) : (
                <Textarea
                  value={editedFrame?.uncertaintyStatement ?? currentFrame.uncertaintyStatement ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (editedFrame) {
                      setEditedFrame({ ...editedFrame, uncertaintyStatement: value });
                    } else {
                      setEditedFrame({ ...currentFrame, uncertaintyStatement: value });
                    }
                  }}
                  placeholder="What we don't know yet, or can't control..."
                  className="resize-none"
                  data-testid="textarea-uncertainty"
                />
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Assumptions Notes</Label>
              {isLocked ? (
                <p className="text-sm text-muted-foreground">
                  {currentFrame.assumptionsNotes || "No assumptions documented"}
                </p>
              ) : (
                <Textarea
                  value={editedFrame?.assumptionsNotes ?? currentFrame.assumptionsNotes ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (editedFrame) {
                      setEditedFrame({ ...editedFrame, assumptionsNotes: value });
                    } else {
                      setEditedFrame({ ...currentFrame, assumptionsNotes: value });
                    }
                  }}
                  placeholder="Key assumptions we're making..."
                  className="resize-none"
                  data-testid="textarea-assumptions"
                />
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      {hasChanges && !readOnly && (
        <CardFooter className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel} data-testid="button-cancel-changes">
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updateMutation.isPending}
            data-testid="button-save-changes"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
