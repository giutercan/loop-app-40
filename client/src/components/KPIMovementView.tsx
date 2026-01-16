import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Target,
  Calendar,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KPIMovement {
  id: string;
  kpiId: string;
  kpiName: string;
  baseline: string;
  baselineDate: string;
  current: string;
  currentDate: string;
  target: string;
  trendDirection: "up" | "down" | "flat";
  trendPercentage: number | null;
  trendDescription: string | null;
  ragStatus: "red" | "amber" | "green";
  ragNote: string | null;
  progressPercentage: number | null;
  projectedCompletionDate: string | null;
  readings: Array<{
    value: string;
    date: string;
    note: string | null;
  }>;
}

interface KPIMovementData {
  id: number;
  packId: number;
  projectId: number;
  successFrameId: number | null;
  movements: KPIMovement[];
  overallHealthScore: number | null;
  overallNarrative: string | null;
  lastCalculatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface KPIMovementViewProps {
  packId: number;
  projectName?: string;
  readOnly?: boolean;
  onUpdate?: () => void;
}

const ragColors = {
  red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const ragIcons = {
  red: XCircle,
  amber: MinusCircle,
  green: CheckCircle2,
};

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
};

function generateId() {
  return `mov-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function MovementCard({ 
  movement, 
  readOnly,
  onUpdate, 
  onRemove, 
  isExpanded,
  onToggleExpand
}: { 
  movement: KPIMovement; 
  readOnly: boolean;
  onUpdate: (updates: Partial<KPIMovement>) => void;
  onRemove: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const TrendIcon = trendIcons[movement.trendDirection];
  const RagIcon = ragIcons[movement.ragStatus];
  
  const trendColorClass = cn(
    movement.trendDirection === "up" && "text-emerald-600 dark:text-emerald-400",
    movement.trendDirection === "down" && "text-red-600 dark:text-red-400",
    movement.trendDirection === "flat" && "text-amber-600 dark:text-amber-400"
  );
  
  return (
    <Card className={cn(
      "border-l-4 hover-elevate",
      movement.ragStatus === "green" && "border-l-emerald-500",
      movement.ragStatus === "amber" && "border-l-amber-500",
      movement.ragStatus === "red" && "border-l-red-500"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex-1 min-w-0">
            {readOnly ? (
              <CardTitle className="text-base font-semibold">{movement.kpiName}</CardTitle>
            ) : (
              <Input
                value={movement.kpiName}
                onChange={(e) => onUpdate({ kpiName: e.target.value })}
                placeholder="KPI Name"
                className="text-base font-semibold h-8"
                data-testid={`input-movement-name-${movement.id}`}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("flex items-center gap-1", trendColorClass)}>
              <TrendIcon className="h-4 w-4" />
              {movement.trendPercentage !== null && (
                <span className="text-sm font-medium">
                  {movement.trendPercentage > 0 ? "+" : ""}{movement.trendPercentage}%
                </span>
              )}
            </div>
            <Badge className={cn("gap-1", ragColors[movement.ragStatus])}>
              <RagIcon className="h-3 w-3" />
            </Badge>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={onToggleExpand}
              data-testid={`button-toggle-movement-${movement.id}`}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {!readOnly && (
              <Button 
                size="icon" 
                variant="ghost"
                onClick={onRemove}
                data-testid={`button-remove-movement-${movement.id}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress to target</span>
            <span className="font-medium">{movement.progressPercentage || 0}%</span>
          </div>
          <Progress value={movement.progressPercentage || 0} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{movement.baseline} (baseline)</span>
            <span className="font-medium text-foreground">{movement.current}</span>
            <span>{movement.target} (target)</span>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Activity className="h-3 w-3" /> Baseline
              </Label>
              {readOnly ? (
                <div>
                  <div className="text-sm font-medium">{movement.baseline}</div>
                  <div className="text-xs text-muted-foreground">{movement.baselineDate}</div>
                </div>
              ) : (
                <>
                  <Input
                    value={movement.baseline}
                    onChange={(e) => onUpdate({ baseline: e.target.value })}
                    placeholder="e.g., 72%"
                    className="h-8"
                    data-testid={`input-baseline-${movement.id}`}
                  />
                  <Input
                    value={movement.baselineDate}
                    onChange={(e) => onUpdate({ baselineDate: e.target.value })}
                    placeholder="Date"
                    className="h-8"
                    data-testid={`input-baseline-date-${movement.id}`}
                  />
                </>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Current
              </Label>
              {readOnly ? (
                <div>
                  <div className="text-sm font-medium">{movement.current}</div>
                  <div className="text-xs text-muted-foreground">{movement.currentDate}</div>
                </div>
              ) : (
                <>
                  <Input
                    value={movement.current}
                    onChange={(e) => onUpdate({ current: e.target.value })}
                    placeholder="e.g., 78%"
                    className="h-8"
                    data-testid={`input-current-${movement.id}`}
                  />
                  <Input
                    value={movement.currentDate}
                    onChange={(e) => onUpdate({ currentDate: e.target.value })}
                    placeholder="Date"
                    className="h-8"
                    data-testid={`input-current-date-${movement.id}`}
                  />
                </>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Target className="h-3 w-3" /> Target
              </Label>
              {readOnly ? (
                <div className="text-sm font-medium">{movement.target}</div>
              ) : (
                <Input
                  value={movement.target}
                  onChange={(e) => onUpdate({ target: e.target.value })}
                  placeholder="e.g., 85%"
                  className="h-8"
                  data-testid={`input-target-${movement.id}`}
                />
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Trend Direction</Label>
              {readOnly ? (
                <div className="flex items-center gap-2">
                  <TrendIcon className={cn("h-4 w-4", trendColorClass)} />
                  <span className="text-sm capitalize">{movement.trendDirection}</span>
                </div>
              ) : (
                <Select
                  value={movement.trendDirection}
                  onValueChange={(v) => onUpdate({ trendDirection: v as any })}
                >
                  <SelectTrigger className="h-8" data-testid={`select-trend-${movement.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="up">Trending Up</SelectItem>
                    <SelectItem value="down">Trending Down</SelectItem>
                    <SelectItem value="flat">Flat</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">RAG Status</Label>
              {readOnly ? (
                <Badge className={cn("gap-1", ragColors[movement.ragStatus])}>
                  <RagIcon className="h-3 w-3" />
                  {movement.ragStatus === "green" ? "On Track" : movement.ragStatus === "amber" ? "At Risk" : "Off Track"}
                </Badge>
              ) : (
                <Select
                  value={movement.ragStatus}
                  onValueChange={(v) => onUpdate({ ragStatus: v as any })}
                >
                  <SelectTrigger className="h-8" data-testid={`select-rag-${movement.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="green">On Track</SelectItem>
                    <SelectItem value="amber">At Risk</SelectItem>
                    <SelectItem value="red">Off Track</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Trend %</Label>
              {readOnly ? (
                <div className={cn("text-sm font-medium", trendColorClass)}>
                  {movement.trendPercentage !== null ? `${movement.trendPercentage > 0 ? "+" : ""}${movement.trendPercentage}%` : "N/A"}
                </div>
              ) : (
                <Input
                  type="number"
                  value={movement.trendPercentage ?? ""}
                  onChange={(e) => onUpdate({ trendPercentage: e.target.value ? Number(e.target.value) : null })}
                  placeholder="e.g., 8.3"
                  className="h-8"
                  data-testid={`input-trend-pct-${movement.id}`}
                />
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Progress %</Label>
              {readOnly ? (
                <div className="text-sm font-medium">{movement.progressPercentage ?? 0}%</div>
              ) : (
                <Input
                  type="number"
                  value={movement.progressPercentage ?? ""}
                  onChange={(e) => onUpdate({ progressPercentage: e.target.value ? Number(e.target.value) : null })}
                  placeholder="0-100"
                  min={0}
                  max={100}
                  className="h-8"
                  data-testid={`input-progress-pct-${movement.id}`}
                />
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Trend Description</Label>
            {readOnly ? (
              <p className="text-sm text-muted-foreground">{movement.trendDescription || "No description"}</p>
            ) : (
              <Input
                value={movement.trendDescription || ""}
                onChange={(e) => onUpdate({ trendDescription: e.target.value })}
                placeholder="e.g., Improved 8.3% from baseline"
                className="h-8"
                data-testid={`input-trend-desc-${movement.id}`}
              />
            )}
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">RAG Note</Label>
            {readOnly ? (
              <p className="text-sm text-muted-foreground">{movement.ragNote || "No notes"}</p>
            ) : (
              <Textarea
                value={movement.ragNote || ""}
                onChange={(e) => onUpdate({ ragNote: e.target.value })}
                placeholder="Interpretive note about current status..."
                className="min-h-[60px] resize-none"
                data-testid={`textarea-rag-note-${movement.id}`}
              />
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function KPIMovementView({ 
  packId, 
  projectName,
  readOnly = false,
  onUpdate 
}: KPIMovementViewProps) {
  const [expandedMovements, setExpandedMovements] = useState<Set<string>>(new Set());
  const [editedView, setEditedView] = useState<KPIMovementData | null>(null);
  
  const { data: movementView, isLoading } = useQuery<KPIMovementData | null>({
    queryKey: ["/api/evidence-packs", packId, "kpi-movement"],
  });
  
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", `/api/evidence-packs/${packId}/kpi-movement`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evidence-packs", packId, "kpi-movement"] });
      onUpdate?.();
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      return apiRequest("PATCH", `/api/kpi-movements/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evidence-packs", packId, "kpi-movement"] });
      setEditedView(null);
      onUpdate?.();
    },
  });
  
  const currentView = editedView || movementView;
  
  const handleMovementUpdate = (movementId: string, updates: Partial<KPIMovement>) => {
    if (!currentView) return;
    
    const updatedMovements = currentView.movements.map(m => 
      m.id === movementId ? { ...m, ...updates } : m
    );
    
    if (editedView) {
      setEditedView({ ...editedView, movements: updatedMovements });
    } else {
      setEditedView({ ...currentView, movements: updatedMovements });
    }
  };
  
  const handleRemoveMovement = (movementId: string) => {
    if (!currentView) return;
    
    const updatedMovements = currentView.movements.filter(m => m.id !== movementId);
    
    if (editedView) {
      setEditedView({ ...editedView, movements: updatedMovements });
    } else {
      setEditedView({ ...currentView, movements: updatedMovements });
    }
  };
  
  const handleAddMovement = () => {
    const newMovement: KPIMovement = {
      id: generateId(),
      kpiId: "",
      kpiName: "",
      baseline: "",
      baselineDate: new Date().toISOString().split("T")[0],
      current: "",
      currentDate: new Date().toISOString().split("T")[0],
      target: "",
      trendDirection: "flat",
      trendPercentage: null,
      trendDescription: null,
      ragStatus: "amber",
      ragNote: null,
      progressPercentage: 0,
      projectedCompletionDate: null,
      readings: [],
    };
    
    if (currentView) {
      const updatedMovements = [...currentView.movements, newMovement];
      if (editedView) {
        setEditedView({ ...editedView, movements: updatedMovements });
      } else {
        setEditedView({ ...currentView, movements: updatedMovements });
      }
    } else {
      createMutation.mutate({ movements: [newMovement] });
    }
    
    setExpandedMovements(prev => new Set([...Array.from(prev), newMovement.id]));
  };
  
  const handleSave = () => {
    if (!editedView) return;
    updateMutation.mutate({
      id: editedView.id,
      movements: editedView.movements,
      overallHealthScore: editedView.overallHealthScore,
      overallNarrative: editedView.overallNarrative,
    });
  };
  
  const handleCancel = () => {
    setEditedView(null);
  };
  
  const toggleExpand = (movementId: string) => {
    setExpandedMovements(prev => {
      const next = new Set(prev);
      if (next.has(movementId)) {
        next.delete(movementId);
      } else {
        next.add(movementId);
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
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  const hasChanges = editedView !== null;
  const movementCount = currentView?.movements?.length || 0;
  
  const healthScore = currentView?.overallHealthScore ?? 0;
  const healthColor = cn(
    healthScore >= 70 && "text-emerald-600 dark:text-emerald-400",
    healthScore >= 40 && healthScore < 70 && "text-amber-600 dark:text-amber-400",
    healthScore < 40 && "text-red-600 dark:text-red-400"
  );
  
  const ragSummary = {
    green: currentView?.movements?.filter(m => m.ragStatus === "green").length || 0,
    amber: currentView?.movements?.filter(m => m.ragStatus === "amber").length || 0,
    red: currentView?.movements?.filter(m => m.ragStatus === "red").length || 0,
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              KPI Movement View
            </CardTitle>
            <CardDescription className="mt-1">
              {projectName ? `${projectName} - ` : ""}
              Baseline → Current → Trend with RAG status
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            {movementCount > 0 && (
              <>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Health Score</div>
                  <div className={cn("text-xl font-bold", healthColor)}>{healthScore}%</div>
                </div>
                <div className="flex items-center gap-1">
                  {ragSummary.green > 0 && (
                    <Badge className={ragColors.green}>{ragSummary.green}</Badge>
                  )}
                  {ragSummary.amber > 0 && (
                    <Badge className={ragColors.amber}>{ragSummary.amber}</Badge>
                  )}
                  {ragSummary.red > 0 && (
                    <Badge className={ragColors.red}>{ragSummary.red}</Badge>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {movementCount === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              No KPI movements tracked yet. Add movements to track progress over time.
            </p>
            {!readOnly && (
              <Button onClick={handleAddMovement} data-testid="button-add-first-movement">
                <Plus className="h-4 w-4 mr-2" />
                Add First KPI Movement
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {currentView?.movements.map((movement) => (
              <MovementCard
                key={movement.id}
                movement={movement}
                readOnly={readOnly}
                onUpdate={(updates) => handleMovementUpdate(movement.id, updates)}
                onRemove={() => handleRemoveMovement(movement.id)}
                isExpanded={expandedMovements.has(movement.id)}
                onToggleExpand={() => toggleExpand(movement.id)}
              />
            ))}
          </div>
        )}
        
        {!readOnly && movementCount > 0 && (
          <Button
            variant="outline"
            className="w-full border-dashed"
            onClick={handleAddMovement}
            data-testid="button-add-movement"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add KPI Movement
          </Button>
        )}
        
        {currentView && movementCount > 0 && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Overall Health Score</Label>
                {readOnly ? (
                  <div className={cn("text-2xl font-bold", healthColor)}>{healthScore}%</div>
                ) : (
                  <Input
                    type="number"
                    value={editedView?.overallHealthScore ?? currentView.overallHealthScore ?? ""}
                    onChange={(e) => {
                      const value = e.target.value ? Number(e.target.value) : null;
                      if (editedView) {
                        setEditedView({ ...editedView, overallHealthScore: value });
                      } else {
                        setEditedView({ ...currentView, overallHealthScore: value });
                      }
                    }}
                    placeholder="0-100"
                    min={0}
                    max={100}
                    className="h-8"
                    data-testid="input-overall-health"
                  />
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Overall Narrative</Label>
              {readOnly ? (
                <p className="text-sm text-muted-foreground">
                  {currentView.overallNarrative || "No overall narrative provided"}
                </p>
              ) : (
                <Textarea
                  value={editedView?.overallNarrative ?? currentView.overallNarrative ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (editedView) {
                      setEditedView({ ...editedView, overallNarrative: value });
                    } else {
                      setEditedView({ ...currentView, overallNarrative: value });
                    }
                  }}
                  placeholder="Summary of KPI movement and overall trajectory..."
                  className="resize-none"
                  data-testid="textarea-overall-narrative"
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
