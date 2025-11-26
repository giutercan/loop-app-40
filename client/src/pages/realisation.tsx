import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExecutivePulse from "@/components/ExecutivePulse";
import KPITraction from "@/components/KPITraction";
import MomentumTimeline from "@/components/MomentumTimeline";
import KPIProgressTracker from "@/components/KPIProgressTracker";
import FinancialAppendix from "@/components/FinancialAppendix";
import StatusBadge from "@/components/StatusBadge";
import { RealizationDashboard } from "@/components/RealizationDashboard";
import { QBRSummaryGenerator } from "@/components/QBRSummaryGenerator";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Clock, LayoutDashboard, CheckCircle2 } from "lucide-react";
import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Project, AnalyticsReview, Kpi } from "@shared/schema";

export default function Realisation() {
  const [, params] = useRoute("/projects/:id/realisation");
  const projectId = parseInt(params?.id || "0");
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });

  const { data: analyticsReviews = [] } = useQuery<AnalyticsReview[]>({
    queryKey: [`/api/projects/${projectId}/analytics-reviews`],
    enabled: !!projectId,
  });

  const { data: kpis = [] } = useQuery<Kpi[]>({
    queryKey: [`/api/projects/${projectId}/kpis`],
    enabled: !!projectId,
  });

  const analyticsReview = analyticsReviews[0];
  const analyticsSignedOff = analyticsReview?.status === "approved";

  return (
    <div className="h-full flex flex-col">
      {/* Action Bar */}
      <div className="border-b bg-card">
        <div className="p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">Value Realization</h1>
              <StatusBadge status={analyticsSignedOff ? "locked" : "pending"} />
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
      </div>

      {!analyticsSignedOff && (
        <div className="bg-[#8DC63F]/10 border-b border-[#8DC63F]/20">
          <div className="px-6 py-3">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#00634F] mt-0.5" />
                <div>
                  <p className="font-medium text-[#00634F] dark:text-[#8DC63F]">
                    Analytics Review Pending
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tier 3 review {analyticsReview ? `• ${analyticsReview.status}` : "pending"}
                  </p>
                </div>
              </div>
              {analyticsReview && (
                <Badge className="bg-[#8DC63F] hover:bg-[#8DC63F]/90 text-white">
                  Reviewer: {analyticsReview.reviewer || "Pending assignment"}
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-4xl" data-testid="tabs-realisation">
            <TabsTrigger value="dashboard">Executive Pulse</TabsTrigger>
            <TabsTrigger value="kpis">KPI Tracking</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="attribution">Attribution</TabsTrigger>
            <TabsTrigger value="report">Final Report</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Value Realization Dashboard</h2>
                <p className="text-sm text-muted-foreground">Real-time overview of value realization progress and KPI health</p>
              </div>
              <Link href={`/projects/${projectId}/dashboard`}>
                <Button variant="outline" data-testid="button-open-dashboard">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Customize Dashboard
                </Button>
              </Link>
            </div>
            <RealizationDashboard projectId={projectId} />
            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">Momentum & Timeline</h3>
              <MomentumTimeline 
                projectId={projectId} 
                onNavigateToKPITracking={() => setActiveTab("kpis")}
              />
            </div>
          </TabsContent>

          <TabsContent value="kpis" className="space-y-6">
            <KPIProgressTracker projectId={projectId} />
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

          <TabsContent value="report" className="space-y-6">
            <QBRSummaryGenerator projectId={projectId} />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Final Report Export</CardTitle>
                <CardDescription>
                  Generate board-ready report with Analytics sign-off
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {analyticsSignedOff ? (
                  <div className="p-6 bg-[#05C690]/10 border border-[#05C690]/20 rounded-lg">
                    <div className="flex items-start gap-3 mb-4">
                      <CheckCircle2 className="w-6 h-6 text-[#009B77]" />
                      <div>
                        <p className="font-semibold text-[#009B77] dark:text-[#05C690] mb-1">
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
                  <div className="p-6 bg-[#8DC63F]/10 border border-[#8DC63F]/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Clock className="w-6 h-6 text-[#00634F]" />
                      <div>
                        <p className="font-semibold text-[#00634F] dark:text-[#8DC63F] mb-1">
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
