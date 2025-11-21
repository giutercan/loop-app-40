import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/StatusBadge";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import { ArrowLeft, Lock, Mail, CheckCircle2, Calendar } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function Alignment() {
  const [confirmBaseline, setConfirmBaseline] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [baselineLocked, setBaselineLocked] = useState(false);

  const handleConfirmBaseline = () => {
    if (confirmBaseline) {
      setEmailSent(true);
      setTimeout(() => {
        setBaselineLocked(true);
        console.log('Baseline locked after email confirmation');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" data-testid="button-back">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">Phase 2: Customer Alignment</h1>
                  {baselineLocked ? (
                    <StatusBadge status="locked" />
                  ) : (
                    <StatusBadge status="draft" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Acme Corporation Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" data-testid="button-save-progress">
                Save Progress
              </Button>
              <Button disabled={!baselineLocked} data-testid="button-finalize">
                Finalize Plan
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 lg:px-8 py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Strategic Challenge Mapping</CardTitle>
            <CardDescription>
              Select your top 3 business challenges and map them to Korn Ferry solutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Leadership Pipeline", description: "Building strong succession plans and developing future leaders" },
                { title: "Employee Retention", description: "Reducing turnover and improving employee engagement" },
                { title: "Talent Acquisition", description: "Finding and hiring top talent faster" },
                { title: "Culture Transformation", description: "Shifting organizational culture to support growth" }
              ].map((challenge, idx) => (
                <Card 
                  key={idx} 
                  className="hover-elevate cursor-pointer border-2"
                  data-testid={`card-challenge-${idx}`}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{challenge.title}</CardTitle>
                    <CardDescription>{challenge.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary">Korn Ferry Solution Available</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className={baselineLocked ? "border-green-600 border-2" : "border-amber-500 border-2"}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {baselineLocked && <Lock className="w-6 h-6 text-green-600" />}
                  Baseline Confirmation
                </CardTitle>
                <CardDescription>
                  Review and confirm the baseline data before locking
                </CardDescription>
              </div>
              {baselineLocked ? (
                <Badge className="bg-green-600 hover:bg-green-700 text-white">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Locked
                </Badge>
              ) : (
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
                  Pending Confirmation
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-3">
                <h3 className="font-semibold">Exposure Data with Provenance</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">Annual Cost of Turnover</p>
                    <p className="text-3xl font-bold font-mono">$12.5M</p>
                  </div>
                  <ConfidenceBadge level="high" />
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Sources:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Q3 2024 Earnings Call Transcript</li>
                    <li>• SEC Form 10-K Annual Report</li>
                    <li>• Internal HRIS data (provided by client)</li>
                  </ul>
                </div>
              </div>
            </div>

            {!baselineLocked && (
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="confirm"
                    checked={confirmBaseline}
                    onCheckedChange={(checked) => {
                      setConfirmBaseline(checked as boolean);
                      console.log('Baseline confirmation checkbox:', checked);
                    }}
                    data-testid="checkbox-confirm-baseline"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="confirm"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I confirm this baseline is accurate
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      By checking this box, you acknowledge that the baseline data is correct and will be locked after email confirmation
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleConfirmBaseline}
                  disabled={!confirmBaseline || emailSent}
                  className="w-full"
                  data-testid="button-confirm-and-send"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {emailSent ? "Confirmation Email Sent" : "Confirm & Send Email"}
                </Button>

                {emailSent && !baselineLocked && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                      Confirmation email sent
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Please check your email and click the confirmation link. The baseline will be locked once confirmed.
                    </p>
                  </div>
                )}
              </div>
            )}

            {baselineLocked && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-600 dark:text-green-400 mb-1">
                      Baseline Locked
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Confirmed on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Email confirmation received from customer
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              12-Month Timeline
            </CardTitle>
            <CardDescription>
              Drag and drop interventions, assign owners, and set milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-8 bg-muted/30 min-h-[400px] flex items-center justify-center">
              <div className="text-center space-y-3">
                <Calendar className="w-16 h-16 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Interactive Gantt timeline editor</p>
                <p className="text-sm text-muted-foreground">
                  Drag interventions, assign owners, and track milestones over 12 months
                </p>
                <Button variant="outline" data-testid="button-add-intervention">
                  Add First Intervention
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
