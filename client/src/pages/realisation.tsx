import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import KPICard from "@/components/KPICard";
import FinancialAppendix from "@/components/FinancialAppendix";
import StatusBadge from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, FileText, Clock, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function Realisation() {
  const analyticsSignedOff = false;

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
                  <h1 className="text-xl font-bold">Phase 3: Value Realisation</h1>
                  <StatusBadge status={analyticsSignedOff ? "locked" : "pending"} />
                </div>
                <p className="text-sm text-muted-foreground">Acme Corporation - Month 7</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" data-testid="button-export-draft">
                <Download className="w-4 h-4 mr-2" />
                Export Draft
              </Button>
              <Button disabled={!analyticsSignedOff} data-testid="button-export-final">
                <FileText className="w-4 h-4 mr-2" />
                Export Final Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      {!analyticsSignedOff && (
        <div className="bg-amber-500/10 border-b border-amber-500/20">
          <div className="container mx-auto max-w-7xl px-4 lg:px-8 py-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-600 dark:text-amber-400">
                    Analytics Review Pending
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tier 3 review in progress • Ticket #A-2847 • SLA: 18 hours remaining
                  </p>
                </div>
              </div>
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
                Reviewer: Sarah Chen
              </Badge>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto max-w-7xl px-4 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-3xl" data-testid="tabs-realisation">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="attribution">Attribution</TabsTrigger>
            <TabsTrigger value="report">Final Report</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">KPI Performance Overview</CardTitle>
                <CardDescription>Baseline vs current measurements with confidence levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <KPICard
                    name="Employee Retention Rate"
                    currentValue="94.2"
                    baselineValue="87.5"
                    delta={6.7}
                    deltaPercentage={7.7}
                    trend="up"
                    confidence="high"
                    unit="%"
                    sparklineData={[
                      { value: 87.5 },
                      { value: 88.2 },
                      { value: 89.1 },
                      { value: 90.5 },
                      { value: 91.8 },
                      { value: 93.2 },
                      { value: 94.2 }
                    ]}
                  />
                  <KPICard
                    name="Time to Fill Position"
                    currentValue="28"
                    baselineValue="42"
                    delta={-14}
                    deltaPercentage={-33.3}
                    trend="up"
                    confidence="high"
                    unit="days"
                    sparklineData={[
                      { value: 42 },
                      { value: 40 },
                      { value: 38 },
                      { value: 35 },
                      { value: 32 },
                      { value: 30 },
                      { value: 28 }
                    ]}
                  />
                  <KPICard
                    name="Leadership Pipeline Strength"
                    currentValue="8.1"
                    baselineValue="6.4"
                    delta={1.7}
                    deltaPercentage={26.6}
                    trend="up"
                    confidence="medium"
                    unit="/10"
                    sparklineData={[
                      { value: 6.4 },
                      { value: 6.7 },
                      { value: 7.0 },
                      { value: 7.3 },
                      { value: 7.6 },
                      { value: 7.9 },
                      { value: 8.1 }
                    ]}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial">
            <FinancialAppendix
              data={[
                {
                  year: 1,
                  incrementalCashFlow: 2400000,
                  cumulative: 2400000,
                  npv: 2181818,
                  notes: "Initial impact from retention improvement",
                  calculation: "NPV = $2,400,000 / (1 + 0.10)^1 = $2,181,818\nAssumptions:\n- 15% reduction in turnover\n- Average replacement cost: $85,000\n- Baseline turnover: 18.5%"
                },
                {
                  year: 2,
                  incrementalCashFlow: 3100000,
                  cumulative: 5500000,
                  npv: 2561983,
                  notes: "Compounding effects + pipeline strength",
                  calculation: "NPV = $3,100,000 / (1 + 0.10)^2 = $2,561,983\nAssumptions:\n- Additional 8% improvement\n- Leadership pipeline reducing external hires"
                },
                {
                  year: 3,
                  incrementalCashFlow: 3800000,
                  cumulative: 9300000,
                  npv: 2854176,
                  notes: "Full program maturity",
                  calculation: "NPV = $3,800,000 / (1 + 0.10)^3 = $2,854,176\nAssumptions:\n- Sustained retention gains\n- Faster time-to-productivity"
                }
              ]}
              totalNPV={7597977}
              paybackMonths={8}
              discountRate={10}
            />
          </TabsContent>

          <TabsContent value="attribution">
            <Card data-testid="card-attribution">
              <CardHeader>
                <CardTitle className="text-2xl">Attribution Model</CardTitle>
                <CardDescription>
                  How we attribute value improvements to interventions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Selected Model: Proportional Attribution</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Value is attributed proportionally to interventions based on timing and documented impact
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Leadership Development Program</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Talent Acquisition Optimization</span>
                      <span className="font-medium">35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Culture Initiatives</span>
                      <span className="font-medium">20%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Scenario Comparison</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { scenario: "Conservative", npv: "$5.2M", confidence: "High" },
                      { scenario: "Base Case", npv: "$7.6M", confidence: "Medium" },
                      { scenario: "Optimistic", npv: "$10.8M", confidence: "Low" }
                    ].map((item, idx) => (
                      <Card key={idx} data-testid={`scenario-${idx}`}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{item.scenario}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold font-mono mb-2">{item.npv}</p>
                          <Badge variant="secondary">{item.confidence} Confidence</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="report">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Final Report Export</CardTitle>
                <CardDescription>
                  Generate board-ready report with Analytics sign-off
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {analyticsSignedOff ? (
                  <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-start gap-3 mb-4">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-600 dark:text-green-400 mb-1">
                          Analytics Sign-off Complete
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Reviewed by Sarah Chen • Approved on {new Date().toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Ticket #A-2847 • All quality checks passed
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Clock className="w-6 h-6 text-amber-600" />
                      <div>
                        <p className="font-semibold text-amber-600 dark:text-amber-400 mb-1">
                          Awaiting Analytics Sign-off
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          Final report export is blocked until Tier 3 review is complete
                        </p>
                        <Button variant="outline" size="sm" data-testid="button-view-ticket">
                          View Ticket Status
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="font-semibold">Report Contents</h3>
                  <ul className="space-y-2 text-sm">
                    {[
                      "Executive Summary",
                      "Methodology & Research Design",
                      "Results & KPI Performance",
                      "Financial Appendix with NPV Calculations",
                      "Attribution Model & Scenarios",
                      "Evidence & Provenance Appendix",
                      "Analytics Sign-off Stamp"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button 
                    disabled={!analyticsSignedOff}
                    data-testid="button-export-pptx"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export as PowerPoint
                  </Button>
                  <Button 
                    variant="outline"
                    disabled={!analyticsSignedOff}
                    data-testid="button-export-pdf"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export as PDF
                  </Button>
                  <Button 
                    variant="outline"
                    disabled={!analyticsSignedOff}
                    data-testid="button-export-word"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export as Word
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
