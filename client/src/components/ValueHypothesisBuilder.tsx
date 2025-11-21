import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

const steps = [
  { id: 1, name: "Select Job" },
  { id: 2, name: "Primary KPI" },
  { id: 3, name: "Exposure" },
  { id: 4, name: "Target" },
  { id: 5, name: "Review" }
];

export default function ValueHypothesisBuilder() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    job: "",
    primaryKPI: "",
    exposure: "",
    target: "",
    researchDesign: ""
  });

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      console.log('Next step:', currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      console.log('Previous step:', currentStep - 1);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-testid="value-hypothesis-builder">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create Value Hypothesis</CardTitle>
            <CardDescription>Step {currentStep} of 5: {steps[currentStep - 1].name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between mb-6">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center gap-2">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step.id < currentStep 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : step.id === currentStep
                      ? 'border-primary text-primary'
                      : 'border-muted text-muted-foreground'
                  }`}>
                    {step.id < currentStep ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className="font-semibold">{step.id}</span>
                    )}
                  </div>
                  <span className="text-xs text-center max-w-[80px]">{step.name}</span>
                </div>
              ))}
            </div>

            <Separator />

            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="job">Select Korn Ferry Job</Label>
                  <Select 
                    value={formData.job} 
                    onValueChange={(value) => {
                      setFormData({ ...formData, job: value });
                      console.log('Job selected:', value);
                    }}
                  >
                    <SelectTrigger id="job" data-testid="select-job">
                      <SelectValue placeholder="Choose a job..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leadership-development">Leadership Development</SelectItem>
                      <SelectItem value="talent-acquisition">Talent Acquisition Optimization</SelectItem>
                      <SelectItem value="succession-planning">Succession Planning</SelectItem>
                      <SelectItem value="culture-transformation">Culture Transformation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.job && (
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <p className="text-sm font-medium mb-2">Job Description</p>
                    <p className="text-sm text-muted-foreground">
                      Help organizations build strong leadership pipelines through assessment, development programs, and succession planning frameworks.
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="primaryKPI">Primary KPI</Label>
                  <Select 
                    value={formData.primaryKPI} 
                    onValueChange={(value) => {
                      setFormData({ ...formData, primaryKPI: value });
                      console.log('Primary KPI selected:', value);
                    }}
                  >
                    <SelectTrigger id="primaryKPI" data-testid="select-primary-kpi">
                      <SelectValue placeholder="Choose primary KPI..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retention">Employee Retention Rate</SelectItem>
                      <SelectItem value="time-to-fill">Time to Fill Critical Roles</SelectItem>
                      <SelectItem value="pipeline-strength">Leadership Pipeline Strength</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.primaryKPI && (
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <p className="text-sm font-medium mb-2">Definition (Korn Ferry Standard)</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Percentage of employees who remain with the organization over a 12-month period.
                    </p>
                    <p className="text-sm font-medium mb-1">Unit: Percentage (%)</p>
                    <p className="text-sm font-medium">Measurement: Annual survey + HRIS data</p>
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="exposure">Exposure Value</Label>
                  <Input 
                    id="exposure" 
                    type="number" 
                    placeholder="Enter exposure value"
                    value={formData.exposure}
                    onChange={(e) => {
                      setFormData({ ...formData, exposure: e.target.value });
                      console.log('Exposure entered:', e.target.value);
                    }}
                    data-testid="input-exposure"
                  />
                </div>
                <div className="border rounded-lg p-4 bg-amber-500/10 border-amber-500/20">
                  <p className="text-sm font-medium mb-2">Auto-suggested from Analysis</p>
                  <p className="text-sm mb-2">Based on Q3 earnings call and 10-K filing, estimated annual cost of turnover: $12.5M</p>
                  <p className="text-xs text-muted-foreground">Source: SEC Filing 2024-Q3, Confidence: High</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-3"
                    onClick={() => {
                      setFormData({ ...formData, exposure: "12500000" });
                      console.log('Auto-suggested value accepted');
                    }}
                    data-testid="button-accept-suggestion"
                  >
                    Accept Suggestion
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="target">Target Value</Label>
                  <Input 
                    id="target" 
                    type="number" 
                    placeholder="Enter target value"
                    value={formData.target}
                    onChange={(e) => {
                      setFormData({ ...formData, target: e.target.value });
                      console.log('Target entered:', e.target.value);
                    }}
                    data-testid="input-target"
                  />
                </div>
                <div>
                  <Label htmlFor="researchDesign">Research Design (Optional)</Label>
                  <Textarea 
                    id="researchDesign" 
                    placeholder="Describe the research design..."
                    value={formData.researchDesign}
                    onChange={(e) => {
                      setFormData({ ...formData, researchDesign: e.target.value });
                      console.log('Research design entered');
                    }}
                    data-testid="textarea-research-design"
                  />
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Review Your Hypothesis</h3>
                <div className="space-y-3 border rounded-lg p-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Job</p>
                    <p className="font-medium">{formData.job || "Not selected"}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Primary KPI</p>
                    <p className="font-medium">{formData.primaryKPI || "Not selected"}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Exposure</p>
                    <p className="font-medium font-mono">${formData.exposure || "0"}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Target</p>
                    <p className="font-medium font-mono">{formData.target || "0"}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={handleBack} 
                disabled={currentStep === 1}
                data-testid="button-back"
              >
                Back
              </Button>
              <Button 
                onClick={handleNext}
                data-testid="button-next"
              >
                {currentStep === 5 ? "Create Hypothesis" : "Next"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Job</p>
              <p className="font-medium">{formData.job || "—"}</p>
            </div>
            <Separator />
            <div>
              <p className="text-muted-foreground">Primary KPI</p>
              <p className="font-medium">{formData.primaryKPI || "—"}</p>
            </div>
            <Separator />
            <div>
              <p className="text-muted-foreground">Exposure</p>
              <p className="font-medium font-mono">{formData.exposure ? `$${formData.exposure}` : "—"}</p>
            </div>
            <Separator />
            <div>
              <p className="text-muted-foreground">Target</p>
              <p className="font-medium font-mono">{formData.target || "—"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
