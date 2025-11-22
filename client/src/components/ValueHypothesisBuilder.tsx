import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Calculator, 
  ChevronRight, 
  Save,
  Target,
  TrendingUp,
  Calendar 
} from "lucide-react";
import type { ValueHypothesis, CompanyDataPoint } from "@shared/schema";
import type { SolutionArea } from "@shared/knowledge";
import { KORN_FERRY_SOLUTIONS } from "@shared/knowledge";
import {
  calculateSuccessProfilesValue,
  calculateStandardisedAssessmentsValue,
  calculateSalesServiceValue,
  calculateTransformationValue,
  calculateTotalRewardsValue,
  calculateAnalyticsValue,
  calculateLeadershipDevValue,
  formatCurrency,
  type ValueCalculationResult
} from "@shared/valueCalculations";

export interface ValueHypothesisBuilderProps {
  projectId: number;
  insights: CompanyDataPoint[];
  hypothesis: ValueHypothesis | null;
  onClose: () => void;
}

const SOLUTION_COLORS: Record<string, string> = {
  ASSESS: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  DEVELOP: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  TRANSFORM: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
  REWARD: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  COMMERCIAL: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  ANALYTICS: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800",
};

type Step = "basic" | "capability" | "inputs" | "results";

export default function ValueHypothesisBuilder({ 
  projectId, 
  insights,
  hypothesis, 
  onClose 
}: ValueHypothesisBuilderProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("basic");
  
  // Form state
  const [title, setTitle] = useState(hypothesis?.title || "");
  const [rationale, setRationale] = useState(hypothesis?.rationale || "");
  const [selectedSolution, setSelectedSolution] = useState<SolutionArea | null>(
    hypothesis?.solutionArea as SolutionArea || null
  );
  const [selectedCapability, setSelectedCapability] = useState<string | null>(
    hypothesis?.capabilityName || null
  );
  const [linkedInsightIds, setLinkedInsightIds] = useState<string[]>(
    hypothesis?.linkedInsights || []
  );
  const [calculationInputs, setCalculationInputs] = useState<any>(
    hypothesis?.calculationInputs || {}
  );
  const [calculationResults, setCalculationResults] = useState<ValueCalculationResult | null>(
    hypothesis?.calculationResults as ValueCalculationResult || null
  );

  // Only show capabilities that have calculation functions implemented
  const SUPPORTED_CAPABILITIES = [
    "Success Profiles & Role Design",
    "Standardised Assessments & Assessments at Scale",
    "Sales & Service (KF Sell)",
    "Organisation Strategy & Transformation",
    "Total Rewards Optimisation (TRO)",
    "People Analytics / KFI Analytics",
    "Leadership & Development Journeys"
  ];

  const capabilities = useMemo(() => {
    if (!selectedSolution) return [];
    return KORN_FERRY_SOLUTIONS[selectedSolution].capabilities.filter(
      cap => SUPPORTED_CAPABILITIES.includes(cap.name)
    );
  }, [selectedSolution]);

  const selectedCapabilityData = useMemo(() => {
    if (!selectedCapability) return null;
    return capabilities.find(c => c.name === selectedCapability) || null;
  }, [selectedCapability, capabilities]);

  // Calculate value based on inputs
  const handleCalculate = () => {
    if (!selectedCapability) return;

    // Validate inputs before calculation
    const hasRequiredInputs = validateInputs(selectedCapability, calculationInputs);
    if (!hasRequiredInputs) {
      toast({
        title: "Missing inputs",
        description: "Please fill in all required fields before calculating.",
        variant: "destructive",
      });
      return;
    }

    try {
      let result: ValueCalculationResult | null = null;

      switch (selectedCapability) {
        case "Success Profiles & Role Design":
          result = calculateSuccessProfilesValue(calculationInputs);
          break;
        case "Standardised Assessments & Assessments at Scale":
          result = calculateStandardisedAssessmentsValue(calculationInputs);
          break;
        case "Sales & Service (KF Sell)":
          result = calculateSalesServiceValue(calculationInputs);
          break;
        case "Organisation Strategy & Transformation":
          result = calculateTransformationValue(calculationInputs);
          break;
        case "Total Rewards Optimisation (TRO)":
          result = calculateTotalRewardsValue(calculationInputs);
          break;
        case "People Analytics / KFI Analytics":
          result = calculateAnalyticsValue(calculationInputs);
          break;
        case "Leadership & Development Journeys":
          result = calculateLeadershipDevValue(calculationInputs);
          break;
        default:
          toast({
            title: "Not yet implemented",
            description: "Calculation for this capability is not yet implemented.",
            variant: "destructive",
          });
          return;
      }

      setCalculationResults(result);
      setStep("results");
    } catch (error) {
      toast({
        title: "Calculation error",
        description: error instanceof Error ? error.message : "Failed to calculate value",
        variant: "destructive",
      });
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        projectId,
        title,
        capabilityName: selectedCapability!,
        solutionArea: selectedSolution!,
        calculationInputs,
        calculationResults,
        linkedInsights: linkedInsightIds,
        rationale,
        status: "draft" as const,
        confidence: "medium" as const,
      };

      if (hypothesis) {
        const res = await apiRequest("PATCH", `/api/value-hypotheses/${hypothesis.id}`, data);
        return res.json();
      } else {
        const res = await apiRequest("POST", `/api/projects/${projectId}/value-hypotheses`, data);
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/value-hypotheses`] });
      toast({
        title: "Success",
        description: `Value hypothesis ${hypothesis ? "updated" : "created"} successfully`,
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const canProceed = () => {
    switch (step) {
      case "basic":
        return title.trim().length > 0;
      case "capability":
        return selectedSolution && selectedCapability;
      case "inputs":
        return true; // Can proceed to calculate
      case "results":
        return calculationResults !== null;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (step === "basic") setStep("capability");
    else if (step === "capability") setStep("inputs");
    else if (step === "inputs") handleCalculate();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {hypothesis ? "Edit Value Hypothesis" : "Create Value Hypothesis"}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Basic Information */}
        {step === "basic" && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Hypothesis Title</Label>
              <Input
                id="title"
                placeholder="e.g., Improve Quality of Hire in Sales Organization"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="input-hypothesis-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rationale">Rationale (Optional)</Label>
              <Textarea
                id="rationale"
                placeholder="Why is this hypothesis valuable for the client?"
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                rows={3}
                data-testid="textarea-rationale"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose} data-testid="button-cancel">
                Cancel
              </Button>
              <Button 
                onClick={nextStep} 
                disabled={!canProceed()}
                data-testid="button-next-basic"
              >
                Next: Select Capability
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Select Capability */}
        {step === "capability" && (
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>Select Korn Ferry Solution Area</Label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(KORN_FERRY_SOLUTIONS).map(([key, solution]) => (
                  <Card
                    key={key}
                    className={`cursor-pointer hover-elevate ${
                      selectedSolution === key ? 'border-primary border-2' : ''
                    }`}
                    onClick={() => {
                      setSelectedSolution(key as SolutionArea);
                      setSelectedCapability(null);
                    }}
                    data-testid={`card-solution-${key}`}
                  >
                    <CardHeader className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Badge className={SOLUTION_COLORS[key]}>{key}</Badge>
                          <h4 className="font-semibold mt-2 text-sm">{solution.title}</h4>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            {selectedSolution && (
              <>
                <Separator />
                <div className="space-y-3">
                  <Label>Select Capability</Label>
                  <div className="space-y-2">
                    {capabilities.map((capability) => (
                      <Card
                        key={capability.name}
                        className={`cursor-pointer hover-elevate ${
                          selectedCapability === capability.name ? 'border-primary border-2' : ''
                        }`}
                        onClick={() => setSelectedCapability(capability.name)}
                        data-testid={`card-capability-${capability.name}`}
                      >
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-sm mb-1">{capability.name}</h4>
                          <p className="text-xs text-muted-foreground">{capability.jobs}</p>
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-xs font-medium text-muted-foreground">
                              Primary KPI: {capability.primaryKPI.name}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-between gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep("basic")} data-testid="button-back-capability">
                Back
              </Button>
              <Button 
                onClick={nextStep} 
                disabled={!canProceed()}
                data-testid="button-next-capability"
              >
                Next: Enter Assumptions
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Calculation Inputs */}
        {step === "inputs" && selectedCapabilityData && (
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Translation Formula</h3>
              <p className="text-sm font-mono text-muted-foreground">
                {selectedCapabilityData.translationFormula}
              </p>
            </div>

            <div className="space-y-3">
              <Label>Calculation Assumptions</Label>
              {renderInputFields(selectedCapability!, calculationInputs, setCalculationInputs)}
            </div>

            <div className="flex justify-between gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep("capability")} data-testid="button-back-inputs">
                Back
              </Button>
              <Button 
                onClick={handleCalculate}
                data-testid="button-calculate"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Value
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === "results" && calculationResults && (
          <div className="space-y-4 py-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Value Calculation Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Year 1 Value</p>
                    <p className="text-2xl font-bold">{formatCurrency(calculationResults.year1Value)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total NPV ({calculationResults.horizonYears} years)</p>
                    <p className="text-2xl font-bold">{formatCurrency(calculationResults.totalNPV)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Payback Period</p>
                    <p className="text-2xl font-bold">
                      {calculationResults.paybackMonths === Infinity ? "N/A" : `${calculationResults.paybackMonths}mo`}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-2">Year-by-Year Breakdown</p>
                  <div className="space-y-2">
                    {calculationResults.yearlyBreakdown.map((year) => (
                      <div key={year.year} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Year {year.year}</span>
                        <div className="flex gap-4">
                          <span>Gross: {formatCurrency(year.grossValue)}</span>
                          <span>Net: {formatCurrency(year.netValue)}</span>
                          <span className="font-medium">NPV: {formatCurrency(year.discountedValue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep("inputs")} data-testid="button-back-results">
                Back to Inputs
              </Button>
              <Button 
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                data-testid="button-save-hypothesis"
              >
                <Save className="h-4 w-4 mr-2" />
                {saveMutation.isPending ? "Saving..." : "Save Hypothesis"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Validation function to check if all required inputs are provided
function validateInputs(capabilityName: string, inputs: any): boolean {
  switch (capabilityName) {
    case "Success Profiles & Role Design":
      return !!(inputs.qohDelta && inputs.hiresPerYear && inputs.avgMarginPerHire);
    case "Standardised Assessments & Assessments at Scale":
      return !!(inputs.aucBase && inputs.aucDelta && inputs.selectionRate && inputs.annualHires && inputs.avgContribution);
    case "Sales & Service (KF Sell)":
      return !!(inputs.winRateDelta && inputs.pipelineExposure && inputs.avgDealMargin);
    case "Organisation Strategy & Transformation":
      return !!(inputs.productivityGainPerFTE && inputs.ftesAffected);
    case "Total Rewards Optimisation (TRO)":
      return !!(inputs.retentionImprovement && inputs.cohortSize && inputs.avgReplacementCost);
    case "People Analytics / KFI Analytics":
      return !!(inputs.turnoverReduction && inputs.employeesInScope && inputs.replacementCost);
    case "Leadership & Development Journeys":
      return !!(inputs.kpiDelta && inputs.teamsAffected && inputs.unitValuePerKPIPoint);
    default:
      return false;
  }
}

// Helper function to render input fields based on capability type
function renderInputFields(
  capabilityName: string,
  inputs: any,
  setInputs: (inputs: any) => void
) {
  const updateInput = (key: string, value: string) => {
    const numValue = parseFloat(value);
    setInputs({ ...inputs, [key]: isNaN(numValue) ? undefined : numValue });
  };

  switch (capabilityName) {
    case "Success Profiles & Role Design":
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="qohDelta">QoH Improvement (index points)</Label>
            <Input
              id="qohDelta"
              type="number"
              value={inputs.qohDelta || ""}
              onChange={(e) => updateInput("qohDelta", e.target.value)}
              placeholder="e.g., 10"
              data-testid="input-qohDelta"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hiresPerYear">Hires per Year</Label>
            <Input
              id="hiresPerYear"
              type="number"
              value={inputs.hiresPerYear || ""}
              onChange={(e) => updateInput("hiresPerYear", e.target.value)}
              placeholder="e.g., 120"
              data-testid="input-hiresPerYear"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avgMarginPerHire">Avg Margin per Hire (£)</Label>
            <Input
              id="avgMarginPerHire"
              type="number"
              value={inputs.avgMarginPerHire || ""}
              onChange={(e) => updateInput("avgMarginPerHire", e.target.value)}
              placeholder="e.g., 50000"
              data-testid="input-avgMarginPerHire"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="implementationCost">Implementation Cost (£)</Label>
            <Input
              id="implementationCost"
              type="number"
              value={inputs.implementationCost || ""}
              onChange={(e) => updateInput("implementationCost", e.target.value)}
              placeholder="e.g., 100000"
              data-testid="input-implementationCost"
            />
          </div>
        </div>
      );

    case "Standardised Assessments & Assessments at Scale":
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="aucBase">Baseline AUC (0.5-1.0)</Label>
            <Input
              id="aucBase"
              type="number"
              step="0.01"
              min="0.5"
              max="1.0"
              value={inputs.aucBase || ""}
              onChange={(e) => updateInput("aucBase", e.target.value)}
              placeholder="e.g., 0.70"
              data-testid="input-aucBase"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aucDelta">AUC Improvement</Label>
            <Input
              id="aucDelta"
              type="number"
              step="0.01"
              min="0"
              max="0.5"
              value={inputs.aucDelta || ""}
              onChange={(e) => updateInput("aucDelta", e.target.value)}
              placeholder="e.g., 0.05"
              data-testid="input-aucDelta"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="selectionRate">Selection Rate (0-1)</Label>
            <Input
              id="selectionRate"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={inputs.selectionRate || ""}
              onChange={(e) => updateInput("selectionRate", e.target.value)}
              placeholder="e.g., 0.50"
              data-testid="input-selectionRate"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="annualHires">Annual Hires</Label>
            <Input
              id="annualHires"
              type="number"
              value={inputs.annualHires || ""}
              onChange={(e) => updateInput("annualHires", e.target.value)}
              placeholder="e.g., 100"
              data-testid="input-annualHires"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avgContribution">Avg Contribution per Hire (£)</Label>
            <Input
              id="avgContribution"
              type="number"
              value={inputs.avgContribution || ""}
              onChange={(e) => updateInput("avgContribution", e.target.value)}
              placeholder="e.g., 90000"
              data-testid="input-avgContribution"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assessmentCostPerHire">Assessment Cost per Hire (£, optional)</Label>
            <Input
              id="assessmentCostPerHire"
              type="number"
              value={inputs.assessmentCostPerHire || ""}
              onChange={(e) => updateInput("assessmentCostPerHire", e.target.value)}
              placeholder="e.g., 200"
              data-testid="input-assessmentCostPerHire"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="implementationCost">Implementation Cost (£)</Label>
            <Input
              id="implementationCost"
              type="number"
              value={inputs.implementationCost || ""}
              onChange={(e) => updateInput("implementationCost", e.target.value)}
              placeholder="e.g., 100000"
              data-testid="input-implementationCost"
            />
          </div>
        </div>
      );

    case "Sales & Service (KF Sell)":
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="winRateDelta">Win Rate Improvement (pp)</Label>
            <Input
              id="winRateDelta"
              type="number"
              value={inputs.winRateDelta || ""}
              onChange={(e) => updateInput("winRateDelta", e.target.value)}
              placeholder="e.g., 5"
              data-testid="input-winRateDelta"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pipelineExposure">Pipeline Exposure (£)</Label>
            <Input
              id="pipelineExposure"
              type="number"
              value={inputs.pipelineExposure || ""}
              onChange={(e) => updateInput("pipelineExposure", e.target.value)}
              placeholder="e.g., 100000000"
              data-testid="input-pipelineExposure"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avgDealMargin">Avg Deal Margin (0-1)</Label>
            <Input
              id="avgDealMargin"
              type="number"
              step="0.01"
              value={inputs.avgDealMargin || ""}
              onChange={(e) => updateInput("avgDealMargin", e.target.value)}
              placeholder="e.g., 0.25"
              data-testid="input-avgDealMargin"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="implementationCost">Implementation Cost (£)</Label>
            <Input
              id="implementationCost"
              type="number"
              value={inputs.implementationCost || ""}
              onChange={(e) => updateInput("implementationCost", e.target.value)}
              placeholder="e.g., 200000"
              data-testid="input-implementationCost"
            />
          </div>
        </div>
      );

    case "Organisation Strategy & Transformation":
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="productivityGainPerFTE">Productivity Gain per FTE (£)</Label>
            <Input
              id="productivityGainPerFTE"
              type="number"
              value={inputs.productivityGainPerFTE || ""}
              onChange={(e) => updateInput("productivityGainPerFTE", e.target.value)}
              placeholder="e.g., 15000"
              data-testid="input-productivityGainPerFTE"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ftesAffected">FTEs Affected</Label>
            <Input
              id="ftesAffected"
              type="number"
              value={inputs.ftesAffected || ""}
              onChange={(e) => updateInput("ftesAffected", e.target.value)}
              placeholder="e.g., 200"
              data-testid="input-ftesAffected"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="labourCostPerFTE">Labour Cost per FTE (£)</Label>
            <Input
              id="labourCostPerFTE"
              type="number"
              value={inputs.labourCostPerFTE || ""}
              onChange={(e) => updateInput("labourCostPerFTE", e.target.value)}
              placeholder="e.g., 60000"
              data-testid="input-labourCostPerFTE"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="implementationCost">Implementation Cost (£)</Label>
            <Input
              id="implementationCost"
              type="number"
              value={inputs.implementationCost || ""}
              onChange={(e) => updateInput("implementationCost", e.target.value)}
              placeholder="e.g., 500000"
              data-testid="input-implementationCost"
            />
          </div>
        </div>
      );

    case "Total Rewards Optimisation (TRO)":
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="retentionImprovement">Retention Improvement (pp)</Label>
            <Input
              id="retentionImprovement"
              type="number"
              value={inputs.retentionImprovement || ""}
              onChange={(e) => updateInput("retentionImprovement", e.target.value)}
              placeholder="e.g., 5"
              data-testid="input-retentionImprovement"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cohortSize">Cohort Size (employees)</Label>
            <Input
              id="cohortSize"
              type="number"
              value={inputs.cohortSize || ""}
              onChange={(e) => updateInput("cohortSize", e.target.value)}
              placeholder="e.g., 500"
              data-testid="input-cohortSize"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avgReplacementCost">Avg Replacement Cost (£)</Label>
            <Input
              id="avgReplacementCost"
              type="number"
              value={inputs.avgReplacementCost || ""}
              onChange={(e) => updateInput("avgReplacementCost", e.target.value)}
              placeholder="e.g., 50000"
              data-testid="input-avgReplacementCost"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spendRebalanceValue">Spend Rebalance Value (£, optional)</Label>
            <Input
              id="spendRebalanceValue"
              type="number"
              value={inputs.spendRebalanceValue || ""}
              onChange={(e) => updateInput("spendRebalanceValue", e.target.value)}
              placeholder="e.g., 100000"
              data-testid="input-spendRebalanceValue"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="implementationCost">Implementation Cost (£)</Label>
            <Input
              id="implementationCost"
              type="number"
              value={inputs.implementationCost || ""}
              onChange={(e) => updateInput("implementationCost", e.target.value)}
              placeholder="e.g., 150000"
              data-testid="input-implementationCost"
            />
          </div>
        </div>
      );

    case "People Analytics / KFI Analytics":
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="turnoverReduction">Turnover Reduction (pp)</Label>
            <Input
              id="turnoverReduction"
              type="number"
              value={inputs.turnoverReduction || ""}
              onChange={(e) => updateInput("turnoverReduction", e.target.value)}
              placeholder="e.g., 3"
              data-testid="input-turnoverReduction"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employeesInScope">Employees in Scope</Label>
            <Input
              id="employeesInScope"
              type="number"
              value={inputs.employeesInScope || ""}
              onChange={(e) => updateInput("employeesInScope", e.target.value)}
              placeholder="e.g., 1000"
              data-testid="input-employeesInScope"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="replacementCost">Replacement Cost per Employee (£)</Label>
            <Input
              id="replacementCost"
              type="number"
              value={inputs.replacementCost || ""}
              onChange={(e) => updateInput("replacementCost", e.target.value)}
              placeholder="e.g., 40000"
              data-testid="input-replacementCost"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="implementationCost">Implementation Cost (£)</Label>
            <Input
              id="implementationCost"
              type="number"
              value={inputs.implementationCost || ""}
              onChange={(e) => updateInput("implementationCost", e.target.value)}
              placeholder="e.g., 80000"
              data-testid="input-implementationCost"
            />
          </div>
        </div>
      );

    case "Leadership & Development Journeys":
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="kpiDelta">KPI Delta (improvement)</Label>
            <Input
              id="kpiDelta"
              type="number"
              value={inputs.kpiDelta || ""}
              onChange={(e) => updateInput("kpiDelta", e.target.value)}
              placeholder="e.g., 15"
              data-testid="input-kpiDelta"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="teamsAffected">Teams Affected</Label>
            <Input
              id="teamsAffected"
              type="number"
              value={inputs.teamsAffected || ""}
              onChange={(e) => updateInput("teamsAffected", e.target.value)}
              placeholder="e.g., 20"
              data-testid="input-teamsAffected"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unitValuePerKPIPoint">Value per KPI Point (£)</Label>
            <Input
              id="unitValuePerKPIPoint"
              type="number"
              value={inputs.unitValuePerKPIPoint || ""}
              onChange={(e) => updateInput("unitValuePerKPIPoint", e.target.value)}
              placeholder="e.g., 5000"
              data-testid="input-unitValuePerKPIPoint"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="implementationCost">Implementation Cost (£)</Label>
            <Input
              id="implementationCost"
              type="number"
              value={inputs.implementationCost || ""}
              onChange={(e) => updateInput("implementationCost", e.target.value)}
              placeholder="e.g., 120000"
              data-testid="input-implementationCost"
            />
          </div>
        </div>
      );

    default:
      return (
        <p className="text-sm text-muted-foreground">
          Input fields for this capability are not yet configured. Please contact support.
        </p>
      );
  }
}
