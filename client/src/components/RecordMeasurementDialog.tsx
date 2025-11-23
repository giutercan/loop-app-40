import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { JobThemeKPI, InsertKPIActual } from "@shared/schema";

interface RecordMeasurementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kpi: JobThemeKPI & { jobName?: string; capabilityName?: string };
  onSuccess: () => void;
}

export default function RecordMeasurementDialog({
  open,
  onOpenChange,
  kpi,
  onSuccess,
}: RecordMeasurementDialogProps) {
  const { toast } = useToast();
  const [actualValue, setActualValue] = useState("");
  const [actualDate, setActualDate] = useState<Date>(new Date());
  const [actualSource, setActualSource] = useState("");
  const [notes, setNotes] = useState("");
  const [validatedBy, setValidatedBy] = useState("");

  const recordMutation = useMutation({
    mutationFn: async (data: InsertKPIActual) => {
      const response = await apiRequest(`/api/job-theme-kpis/${kpi.id}/actuals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Measurement recorded",
        description: `Successfully recorded ${actualValue}${kpi.unit} for ${kpi.kpiName}`,
      });
      // Reset form
      setActualValue("");
      setActualSource("");
      setNotes("");
      setValidatedBy("");
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to record measurement",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!actualValue) {
      toast({
        title: "Value required",
        description: "Please enter a measurement value",
        variant: "destructive",
      });
      return;
    }

    // Validate that value is a number
    if (isNaN(parseFloat(actualValue))) {
      toast({
        title: "Invalid value",
        description: "Please enter a valid number",
        variant: "destructive",
      });
      return;
    }

    recordMutation.mutate({
      jobThemeKPIId: kpi.id,
      actualValue,
      actualDate,
      actualSource: actualSource || undefined,
      notes: notes || undefined,
      validatedBy: validatedBy || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-record-measurement">
        <DialogHeader>
          <DialogTitle>Record Measurement</DialogTitle>
          <DialogDescription>
            Record a new actual measurement for {kpi.kpiName}
            {kpi.jobName && <span className="block text-sm mt-1">Job: {kpi.jobName}</span>}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Context */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Baseline</p>
              <p className="text-lg font-bold font-mono">{kpi.baselineValue}{kpi.unit}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Target</p>
              <p className="text-lg font-bold font-mono">{kpi.targetValue}{kpi.unit}</p>
            </div>
          </div>

          {/* Actual Value */}
          <div className="space-y-2">
            <Label htmlFor="actualValue">
              Actual Value <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="actualValue"
                type="number"
                step="any"
                value={actualValue}
                onChange={(e) => setActualValue(e.target.value)}
                placeholder="Enter measured value"
                required
                data-testid="input-actual-value"
                className="flex-1"
              />
              <div className="flex items-center px-3 bg-muted rounded-md border">
                <span className="text-sm text-muted-foreground">{kpi.unit}</span>
              </div>
            </div>
          </div>

          {/* Measurement Date */}
          <div className="space-y-2">
            <Label htmlFor="actualDate">
              Measurement Date <span className="text-destructive">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  data-testid="button-select-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {actualDate ? format(actualDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={actualDate}
                  onSelect={(date) => date && setActualDate(date)}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Data Source */}
          <div className="space-y-2">
            <Label htmlFor="actualSource">Data Source</Label>
            <Input
              id="actualSource"
              value={actualSource}
              onChange={(e) => setActualSource(e.target.value)}
              placeholder="e.g., Client HRIS, Survey results, Financial system"
              data-testid="input-actual-source"
            />
            <p className="text-xs text-muted-foreground">
              Where did this measurement come from?
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional context about this measurement..."
              rows={3}
              data-testid="input-notes"
            />
          </div>

          {/* Validated By */}
          <div className="space-y-2">
            <Label htmlFor="validatedBy">Validated By</Label>
            <Input
              id="validatedBy"
              value={validatedBy}
              onChange={(e) => setValidatedBy(e.target.value)}
              placeholder="Name of consultant or client who validated this data"
              data-testid="input-validated-by"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={recordMutation.isPending}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={recordMutation.isPending || !actualValue}
              data-testid="button-save-measurement"
            >
              {recordMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Record Measurement
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
