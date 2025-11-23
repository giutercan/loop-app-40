import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Sparkles, 
  Copy,
  CheckCircle2,
  User,
  DollarSign,
  Cog,
  Download
} from "lucide-react";

interface ValueNarrativeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  valueCaseId: number;
  valueCaseName: string;
}

interface NarrativeSection {
  title: string;
  executiveSummary: string;
  [key: string]: string;
}

interface NarrativeData {
  ceoNarrative: NarrativeSection;
  cfoNarrative: NarrativeSection;
  ctoNarrative: NarrativeSection;
}

export function ValueNarrativeDialog({ 
  open, 
  onOpenChange, 
  projectId, 
  valueCaseId,
  valueCaseName 
}: ValueNarrativeDialogProps) {
  const { toast } = useToast();
  const [narrativeData, setNarrativeData] = useState<NarrativeData | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const generationKeyRef = useRef<string | null>(null);
  const requestedForThisOpenRef = useRef(false);

  // Generate narrative mutation with generation key for stale data prevention
  const generateMutation = useMutation({
    mutationFn: async () => {
      const currentKey = `${projectId}-${valueCaseId}-${Date.now()}`;
      generationKeyRef.current = currentKey;
      
      const response = await apiRequest(
        "POST",
        `/api/projects/${projectId}/value-cases/${valueCaseId}/generate-narrative`,
        {}
      );
      const data = await response.json();
      return { data, generationKey: currentKey };
    },
    onSuccess: ({ data, generationKey }) => {
      // Only apply if this is still the current generation request and dialog is open
      if (generationKeyRef.current === generationKey && open) {
        setNarrativeData(data.narrative);
        toast({
          title: "Value Narrative Generated",
          description: `Successfully generated stakeholder-focused narratives using ${data.successStoriesUsed} verified success stories.`,
        });
      }
    },
    onError: (error: any) => {
      // Only show error if dialog is still open
      if (open) {
        toast({
          variant: "destructive",
          title: "Generation Failed",
          description: error.message || "Failed to generate value narrative. Please try again.",
        });
      }
    },
  });

  // Trigger generation function (used by both auto-trigger and manual retry)
  // Allows concurrent requests - generation key system filters stale results
  const triggerGeneration = () => {
    if (open && !requestedForThisOpenRef.current) {
      requestedForThisOpenRef.current = true;
      generateMutation.mutate();
    }
  };

  // Reset state and trigger generation when dialog opens
  useEffect(() => {
    if (open) {
      // Dialog just opened - reset state and request flag
      setNarrativeData(null);
      generationKeyRef.current = null;
      requestedForThisOpenRef.current = false;
      
      // Trigger generation
      triggerGeneration();
    }
  }, [open]);

  const copyToClipboard = async (text: string, sectionName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionName);
      toast({
        title: "Copied!",
        description: "Narrative copied to clipboard",
      });
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
      });
    }
  };

  const renderNarrativeSection = (
    stakeholder: "CEO" | "CFO" | "CTO",
    narrative: NarrativeSection,
    icon: React.ReactNode,
    color: string
  ) => {
    const fullText = Object.entries(narrative)
      .filter(([key]) => key !== 'title')
      .map(([key, value]) => {
        const heading = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .trim();
        return `${heading.toUpperCase()}\n\n${value}`;
      })
      .join('\n\n---\n\n');

    const sectionId = `narrative-${stakeholder.toLowerCase()}`;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-xl font-semibold">{narrative.title}</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(fullText, sectionId)}
            data-testid={`button-copy-${stakeholder.toLowerCase()}`}
          >
            {copiedSection === sectionId ? (
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {copiedSection === sectionId ? "Copied" : "Copy All"}
          </Button>
        </div>

        <Card className={`${color} border-2`}>
          <CardHeader>
            <Badge className="w-fit">{stakeholder} Focus</Badge>
            <CardTitle className="text-lg mt-2">{narrative.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(narrative).map(([key, value]) => {
              if (key === 'title') return null;
              
              const heading = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .trim();

              return (
                <div key={key} className="space-y-2">
                  <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    {heading}
                  </h4>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{value}</p>
                  <Separator className="mt-3" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <DialogTitle>AI-Generated Value Narratives</DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Stakeholder-focused value stories for: <span className="font-medium">{valueCaseName}</span>
          </p>
        </DialogHeader>

        {/* Loading State */}
        {generateMutation.isPending && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-medium">Generating Value Narratives...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Analyzing value case and crafting tailored stories for each stakeholder
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {generateMutation.isError && (
          <div className="text-center py-12">
            <p className="text-destructive font-medium">Failed to generate narratives</p>
            <p className="text-sm text-muted-foreground mt-2">
              {(generateMutation.error as any)?.message || "An unexpected error occurred"}
            </p>
            <Button 
              onClick={() => {
                requestedForThisOpenRef.current = false;
                triggerGeneration();
              }} 
              className="mt-4"
              data-testid="button-retry-narrative"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Success State */}
        {narrativeData && !generateMutation.isPending && (
          <div className="space-y-6 py-4">
            <Tabs defaultValue="ceo" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ceo" data-testid="tab-ceo">
                  <User className="h-4 w-4 mr-2" />
                  CEO
                </TabsTrigger>
                <TabsTrigger value="cfo" data-testid="tab-cfo">
                  <DollarSign className="h-4 w-4 mr-2" />
                  CFO
                </TabsTrigger>
                <TabsTrigger value="cto" data-testid="tab-cto">
                  <Cog className="h-4 w-4 mr-2" />
                  CTO
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ceo" className="mt-6">
                {renderNarrativeSection(
                  "CEO",
                  narrativeData.ceoNarrative,
                  <User className="h-5 w-5 text-purple-600" />,
                  "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800"
                )}
              </TabsContent>

              <TabsContent value="cfo" className="mt-6">
                {renderNarrativeSection(
                  "CFO",
                  narrativeData.cfoNarrative,
                  <DollarSign className="h-5 w-5 text-emerald-600" />,
                  "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                )}
              </TabsContent>

              <TabsContent value="cto" className="mt-6">
                {renderNarrativeSection(
                  "CTO",
                  narrativeData.ctoNarrative,
                  <Cog className="h-5 w-5 text-blue-600" />,
                  "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-close-narrative"
              >
                Close
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  toast({
                    title: "Export Coming Soon",
                    description: "PDF/presentation export will be available in the next release.",
                  });
                }}
                data-testid="button-export-narrative"
              >
                <Download className="h-4 w-4 mr-2" />
                Export as PDF
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
