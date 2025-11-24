import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Check, X } from "lucide-react";

interface Job {
  id: number;
  jobName: string;
  capabilityName: string;
  solutionArea: string | null;
  priorityRank: number | null;
  evidenceCount: number;
}

interface ReprioritizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  currentJobs: Job[];
  allJobs: Job[];
}

export function ReprioritizeDialog({
  open,
  onOpenChange,
  projectId,
  currentJobs,
  allJobs,
}: ReprioritizeDialogProps) {
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<number[]>(
    currentJobs.map(j => j.id)
  );

  const prioritizeMutation = useMutation({
    mutationFn: async ({ prioritizedIds }: { prioritizedIds: number[] }) => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/job-themes/prioritize`, {
        prioritizedIds
      });
      if (!res.ok) throw new Error("Failed to re-prioritize");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/alignment/finalized-jobs`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/job-themes`] });
      toast({ title: "Priorities updated successfully" });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Failed to update priorities",
        description: "Please try again",
        variant: "destructive"
      });
    }
  });

  const toggleJob = (jobId: number) => {
    if (selectedIds.includes(jobId)) {
      setSelectedIds(selectedIds.filter(id => id !== jobId));
    } else if (selectedIds.length < 3) {
      setSelectedIds([...selectedIds, jobId]);
    }
  };

  const handleSave = () => {
    if (selectedIds.length !== 3) {
      toast({
        title: "Select exactly 3 jobs",
        description: "You must prioritize exactly 3 jobs",
        variant: "destructive"
      });
      return;
    }
    prioritizeMutation.mutate({ prioritizedIds: selectedIds });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Re-prioritize Jobs</DialogTitle>
          <DialogDescription>
            Select 3 priority jobs to focus on. Current selection: {selectedIds.length}/3
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 py-4">
          {allJobs.map((job) => {
            const isSelected = selectedIds.includes(job.id);
            const selectionIndex = selectedIds.indexOf(job.id);
            
            return (
              <Card
                key={job.id}
                className={`p-4 cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "hover-elevate active-elevate-2"
                }`}
                onClick={() => toggleJob(job.id)}
                data-testid={`job-option-${job.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isSelected && (
                        <Badge variant="default" className="shrink-0">
                          #{selectionIndex + 1}
                        </Badge>
                      )}
                      <h4 className="font-semibold text-sm truncate">{job.jobName}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">{job.capabilityName}</p>
                    {job.solutionArea && (
                      <Badge variant="secondary" className="text-xs mt-2">
                        {job.solutionArea}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-xs">
                      {job.evidenceCount} evidence
                    </Badge>
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-muted" />
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={prioritizeMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={selectedIds.length !== 3 || prioritizeMutation.isPending}
            data-testid="button-save-priorities"
          >
            {prioritizeMutation.isPending ? "Saving..." : "Save Priorities"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
