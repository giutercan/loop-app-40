import { Button } from "@/components/ui/button";
import { Play, X, Sparkles, Loader2 } from "lucide-react";
import { useDemoMode } from "./DemoModeContext";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

export function DemoModeButton() {
  const { isDemoMode, startDemo, endDemo, tourRunning, setTourRunning } = useDemoMode();
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const seedAndStartDemo = async () => {
    setIsSeeding(true);
    try {
      const res = await apiRequest("POST", "/api/demo/seed-chanel", {});
      const data = await res.json();
      
      await queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      
      setShowStartDialog(false);
      startDemo("Chanel");
      
      if (data.projectId) {
        setLocation(`/projects/${data.projectId}/sales`);
      }
      
      toast({
        title: "Demo Ready",
        description: "Chanel demo data loaded. Starting guided tour...",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Demo Setup Failed",
        description: error.message || "Failed to load demo data",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  if (isDemoMode) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
          <Sparkles className="w-3 h-3 mr-1" />
          Demo Mode: Chanel
        </Badge>
        {!tourRunning && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setTourRunning(true)}
            data-testid="button-restart-tour"
          >
            <Play className="w-3 h-3 mr-1" />
            Restart Tour
          </Button>
        )}
        <Button 
          size="sm" 
          variant="ghost"
          onClick={endDemo}
          data-testid="button-end-demo"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowStartDialog(true)}
        className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30 hover:border-purple-500/50"
        data-testid="button-start-demo"
      >
        <Play className="w-4 h-4 mr-2 text-purple-600" />
        <span className="text-purple-600 font-medium">Executive Demo</span>
      </Button>

      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Chanel Executive Demo
            </DialogTitle>
            <DialogDescription>
              Experience the complete Value Lifecycle journey with Chanel as our showcase client.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/5 to-blue-500/5 border border-purple-500/20">
              <h4 className="font-semibold mb-2">What you'll see:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">1.</span>
                  <span><strong>AI-Powered Discovery</strong> - Instant company research and insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">2.</span>
                  <span><strong>Smart Outcome Suggestions</strong> - Industry & Korn Ferry benchmarks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">3.</span>
                  <span><strong>Batch Operations</strong> - Multi-select and bulk actions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">4.</span>
                  <span><strong>Seamless Handoff</strong> - Sales to Delivery in one click</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">5.</span>
                  <span><strong>Value Tracking</strong> - €12.5M promised, €4.8M realized</span>
                </li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-700">
                <strong>Demo uses fictional data</strong> for Chanel. The guided tour highlights key features with executive-focused messaging.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStartDialog(false)} disabled={isSeeding}>
              Cancel
            </Button>
            <Button 
              onClick={seedAndStartDemo}
              className="bg-purple-600 hover:bg-purple-700"
              data-testid="button-confirm-start-demo"
              disabled={isSeeding}
            >
              {isSeeding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting Up Demo...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Demo Tour
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
