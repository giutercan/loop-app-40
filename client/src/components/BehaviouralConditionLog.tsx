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
  GitBranch, 
  ArrowRight, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  MinusCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Condition {
  id: string;
  conditionName: string;
  description: string | null;
  lever: string;
  targetBehaviour: string;
  expectedKPIImpact: string;
  hypothesis: string;
  workflowLocation: string | null;
  measurementMethod: string | null;
  ragStatus: "red" | "amber" | "green" | null;
  narrativeNote: string | null;
  observedBehaviourShift: string | null;
  linkedKPIIds: string[];
  createdAt: string;
  lastUpdatedAt: string;
}

interface BehaviouralLog {
  id: number;
  packId: number;
  projectId: number;
  version: number;
  conditions: Condition[];
  aiSuggestedConditions: any | null;
  createdAt: string;
  updatedAt: string;
}

interface BehaviouralConditionLogProps {
  packId: number;
  projectName?: string;
  readOnly?: boolean;
  onUpdate?: () => void;
}

const ragColors = {
  red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-700",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 dark:border-amber-700",
  green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700",
};

const ragIcons = {
  red: XCircle,
  amber: MinusCircle,
  green: CheckCircle2,
};

const ragLabels = {
  red: "Off Track",
  amber: "At Risk",
  green: "On Track",
};

function generateId() {
  return `cond-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function ConditionCard({ 
  condition, 
  readOnly,
  onUpdate, 
  onRemove, 
  isExpanded,
  onToggleExpand
}: { 
  condition: Condition; 
  readOnly: boolean;
  onUpdate: (updates: Partial<Condition>) => void;
  onRemove: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const RagIcon = condition.ragStatus ? ragIcons[condition.ragStatus] : MinusCircle;
  
  return (
    <Card className={cn(
      "border-l-4 hover-elevate",
      condition.ragStatus === "green" && "border-l-emerald-500",
      condition.ragStatus === "amber" && "border-l-amber-500",
      condition.ragStatus === "red" && "border-l-red-500",
      !condition.ragStatus && "border-l-muted"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex-1 min-w-0">
            {readOnly ? (
              <CardTitle className="text-base font-semibold">{condition.conditionName}</CardTitle>
            ) : (
              <Input
                value={condition.conditionName}
                onChange={(e) => onUpdate({ conditionName: e.target.value })}
                placeholder="Condition Name"
                className="text-base font-semibold h-8"
                data-testid={`input-condition-name-${condition.id}`}
              />
            )}
            {condition.description && (
              <p className="text-sm text-muted-foreground mt-1">{condition.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {condition.ragStatus && (
              <Badge className={cn("gap-1", ragColors[condition.ragStatus])}>
                <RagIcon className="h-3 w-3" />
                {ragLabels[condition.ragStatus]}
              </Badge>
            )}
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={onToggleExpand}
              data-testid={`button-toggle-condition-${condition.id}`}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {!readOnly && (
              <Button 
                size="icon" 
                variant="ghost"
                onClick={onRemove}
                data-testid={`button-remove-condition-${condition.id}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-2 text-sm flex-wrap">
          <Badge variant="outline" className="gap-1">
            <GitBranch className="h-3 w-3" />
            {condition.lever || "No lever"}
          </Badge>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{condition.targetBehaviour || "Behaviour"}</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-primary">{condition.expectedKPIImpact || "KPI"}</span>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4 pt-2">
          <div className="bg-muted/50 rounded-lg p-3">
            <Label className="text-xs text-muted-foreground">Hypothesis</Label>
            {readOnly ? (
              <p className="text-sm mt-1">{condition.hypothesis || "No hypothesis defined"}</p>
            ) : (
              <Textarea
                value={condition.hypothesis}
                onChange={(e) => onUpdate({ hypothesis: e.target.value })}
                placeholder="If we apply [lever], then [behaviour] will change, which should improve [KPI]..."
                className="mt-1 min-h-[60px] resize-none"
                data-testid={`textarea-hypothesis-${condition.id}`}
              />
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Lever</Label>
              {readOnly ? (
                <div className="text-sm font-medium">{condition.lever || "Not set"}</div>
              ) : (
                <Input
                  value={condition.lever}
                  onChange={(e) => onUpdate({ lever: e.target.value })}
                  placeholder="e.g., Coaching toolkit"
                  className="h-8"
                  data-testid={`input-lever-${condition.id}`}
                />
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Target Behaviour</Label>
              {readOnly ? (
                <div className="text-sm font-medium">{condition.targetBehaviour || "Not set"}</div>
              ) : (
                <Input
                  value={condition.targetBehaviour}
                  onChange={(e) => onUpdate({ targetBehaviour: e.target.value })}
                  placeholder="e.g., Weekly 1:1 coaching"
                  className="h-8"
                  data-testid={`input-behaviour-${condition.id}`}
                />
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Expected KPI Impact</Label>
              {readOnly ? (
                <div className="text-sm font-medium">{condition.expectedKPIImpact || "Not set"}</div>
              ) : (
                <Input
                  value={condition.expectedKPIImpact}
                  onChange={(e) => onUpdate({ expectedKPIImpact: e.target.value })}
                  placeholder="e.g., Rep productivity"
                  className="h-8"
                  data-testid={`input-kpi-impact-${condition.id}`}
                />
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Workflow Location</Label>
              {readOnly ? (
                <div className="text-sm">{condition.workflowLocation || "Not specified"}</div>
              ) : (
                <Input
                  value={condition.workflowLocation || ""}
                  onChange={(e) => onUpdate({ workflowLocation: e.target.value })}
                  placeholder="Where this shows up in daily work"
                  className="h-8"
                  data-testid={`input-workflow-${condition.id}`}
                />
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">RAG Status</Label>
              {readOnly ? (
                condition.ragStatus ? (
                  <Badge className={cn("gap-1", ragColors[condition.ragStatus])}>
                    {ragLabels[condition.ragStatus]}
                  </Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">Not assessed</span>
                )
              ) : (
                <Select
                  value={condition.ragStatus || "none"}
                  onValueChange={(v) => onUpdate({ ragStatus: v === "none" ? null : v as any })}
                >
                  <SelectTrigger className="h-8" data-testid={`select-rag-${condition.id}`}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not assessed</SelectItem>
                    <SelectItem value="green">On Track</SelectItem>
                    <SelectItem value="amber">At Risk</SelectItem>
                    <SelectItem value="red">Off Track</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Narrative Note</Label>
            {readOnly ? (
              <p className="text-sm text-muted-foreground">{condition.narrativeNote || "No notes"}</p>
            ) : (
              <Textarea
                value={condition.narrativeNote || ""}
                onChange={(e) => onUpdate({ narrativeNote: e.target.value })}
                placeholder="Interpretation and context (not explanation)..."
                className="min-h-[60px] resize-none"
                data-testid={`textarea-narrative-${condition.id}`}
              />
            )}
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Observed Behaviour Shift</Label>
            {readOnly ? (
              <p className="text-sm text-muted-foreground">{condition.observedBehaviourShift || "Not yet observed"}</p>
            ) : (
              <Textarea
                value={condition.observedBehaviourShift || ""}
                onChange={(e) => onUpdate({ observedBehaviourShift: e.target.value })}
                placeholder="What actually changed? What are you seeing?"
                className="min-h-[60px] resize-none"
                data-testid={`textarea-observed-${condition.id}`}
              />
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function BehaviouralConditionLog({ 
  packId, 
  projectName,
  readOnly = false,
  onUpdate 
}: BehaviouralConditionLogProps) {
  const [expandedConditions, setExpandedConditions] = useState<Set<string>>(new Set());
  const [editedLog, setEditedLog] = useState<BehaviouralLog | null>(null);
  
  const { data: behaviouralLog, isLoading } = useQuery<BehaviouralLog | null>({
    queryKey: ["/api/evidence-packs", packId, "behavioural-log"],
  });
  
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", `/api/evidence-packs/${packId}/behavioural-log`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evidence-packs", packId, "behavioural-log"] });
      onUpdate?.();
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      return apiRequest("PATCH", `/api/behavioural-logs/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evidence-packs", packId, "behavioural-log"] });
      setEditedLog(null);
      onUpdate?.();
    },
  });
  
  const currentLog = editedLog || behaviouralLog;
  
  const handleConditionUpdate = (conditionId: string, updates: Partial<Condition>) => {
    if (!currentLog) return;
    
    const updatedConditions = currentLog.conditions.map(c => 
      c.id === conditionId ? { ...c, ...updates, lastUpdatedAt: new Date().toISOString() } : c
    );
    
    if (editedLog) {
      setEditedLog({ ...editedLog, conditions: updatedConditions });
    } else {
      setEditedLog({ ...currentLog, conditions: updatedConditions });
    }
  };
  
  const handleRemoveCondition = (conditionId: string) => {
    if (!currentLog) return;
    
    const updatedConditions = currentLog.conditions.filter(c => c.id !== conditionId);
    
    if (editedLog) {
      setEditedLog({ ...editedLog, conditions: updatedConditions });
    } else {
      setEditedLog({ ...currentLog, conditions: updatedConditions });
    }
  };
  
  const handleAddCondition = () => {
    const newCondition: Condition = {
      id: generateId(),
      conditionName: "",
      description: null,
      lever: "",
      targetBehaviour: "",
      expectedKPIImpact: "",
      hypothesis: "",
      workflowLocation: null,
      measurementMethod: null,
      ragStatus: null,
      narrativeNote: null,
      observedBehaviourShift: null,
      linkedKPIIds: [],
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    };
    
    if (currentLog) {
      const updatedConditions = [...currentLog.conditions, newCondition];
      if (editedLog) {
        setEditedLog({ ...editedLog, conditions: updatedConditions });
      } else {
        setEditedLog({ ...currentLog, conditions: updatedConditions });
      }
    } else {
      createMutation.mutate({ conditions: [newCondition] });
    }
    
    setExpandedConditions(prev => new Set([...Array.from(prev), newCondition.id]));
  };
  
  const handleSave = () => {
    if (!editedLog) return;
    updateMutation.mutate({
      id: editedLog.id,
      conditions: editedLog.conditions,
    });
  };
  
  const handleCancel = () => {
    setEditedLog(null);
  };
  
  const toggleExpand = (conditionId: string) => {
    setExpandedConditions(prev => {
      const next = new Set(prev);
      if (next.has(conditionId)) {
        next.delete(conditionId);
      } else {
        next.add(conditionId);
      }
      return next;
    });
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  const hasChanges = editedLog !== null;
  const conditionCount = currentLog?.conditions?.length || 0;
  const canAddMore = conditionCount < 5;
  
  const ragSummary = {
    green: currentLog?.conditions?.filter(c => c.ragStatus === "green").length || 0,
    amber: currentLog?.conditions?.filter(c => c.ragStatus === "amber").length || 0,
    red: currentLog?.conditions?.filter(c => c.ragStatus === "red").length || 0,
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              Behavioural Condition Log
            </CardTitle>
            <CardDescription className="mt-1">
              {projectName ? `${projectName} - ` : ""}
              Lever → Behaviour → KPI hypotheses tracking
            </CardDescription>
          </div>
          {conditionCount > 0 && (
            <div className="flex items-center gap-2">
              {ragSummary.green > 0 && (
                <Badge className={ragColors.green}>{ragSummary.green} on track</Badge>
              )}
              {ragSummary.amber > 0 && (
                <Badge className={ragColors.amber}>{ragSummary.amber} at risk</Badge>
              )}
              {ragSummary.red > 0 && (
                <Badge className={ragColors.red}>{ragSummary.red} off track</Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {conditionCount === 0 ? (
          <div className="text-center py-8">
            <GitBranch className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              No conditions defined yet. Add hypotheses linking levers to behaviours and KPIs.
            </p>
            {!readOnly && (
              <Button onClick={handleAddCondition} data-testid="button-add-first-condition">
                <Plus className="h-4 w-4 mr-2" />
                Add First Condition
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {currentLog?.conditions.map((condition) => (
              <ConditionCard
                key={condition.id}
                condition={condition}
                readOnly={readOnly}
                onUpdate={(updates) => handleConditionUpdate(condition.id, updates)}
                onRemove={() => handleRemoveCondition(condition.id)}
                isExpanded={expandedConditions.has(condition.id)}
                onToggleExpand={() => toggleExpand(condition.id)}
              />
            ))}
          </div>
        )}
        
        {!readOnly && canAddMore && conditionCount > 0 && (
          <Button
            variant="outline"
            className="w-full border-dashed"
            onClick={handleAddCondition}
            data-testid="button-add-condition"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Condition ({conditionCount}/5)
          </Button>
        )}
        
        {!canAddMore && conditionCount >= 5 && (
          <div className="text-center py-2 text-sm text-muted-foreground flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Maximum 5 conditions (focused behaviour tracking)
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
