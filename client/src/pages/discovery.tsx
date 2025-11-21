import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrganisationCard from "@/components/OrganisationCard";
import ValueHypothesisBuilder from "@/components/ValueHypothesisBuilder";
import StatusBadge from "@/components/StatusBadge";
import { ArrowLeft, Save, Send, FileText } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function Discovery() {
  const [notes, setNotes] = useState("");
  const [stakeholder, setStakeholder] = useState("");

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
                  <h1 className="text-xl font-bold">Phase 1: Discovery</h1>
                  <StatusBadge status="draft" />
                </div>
                <p className="text-sm text-muted-foreground">Acme Corporation Session</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" data-testid="button-save-draft">
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button data-testid="button-send-to-client">
                <Send className="w-4 h-4 mr-2" />
                Send to Client
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 lg:px-8 py-8">
        <Tabs defaultValue="organisation" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl" data-testid="tabs-discovery">
            <TabsTrigger value="organisation">Organisation</TabsTrigger>
            <TabsTrigger value="notes">Notes & Evidence</TabsTrigger>
            <TabsTrigger value="hypothesis">Value Hypothesis</TabsTrigger>
          </TabsList>

          <TabsContent value="organisation" className="space-y-6">
            <OrganisationCard
              name="Acme Corporation"
              sector="Technology & Enterprise Software"
              dataPoints={[
                { label: "Annual Revenue", value: "$2.4B", confidence: "high", source: "Q3 2024 Earnings Report" },
                { label: "Employee Count", value: "12,500", confidence: "high", source: "LinkedIn Data" },
                { label: "Market Cap", value: "$18.7B", confidence: "medium", source: "NYSE Real-time" },
                { label: "Revenue Growth", value: "+24% YoY", confidence: "high", source: "Investor Presentation" }
              ]}
              revenueData={[
                { month: "Jan", revenue: 180 },
                { month: "Feb", revenue: 195 },
                { month: "Mar", revenue: 210 },
                { month: "Apr", revenue: 205 },
                { month: "May", revenue: 220 },
                { month: "Jun", revenue: 240 }
              ]}
              headlines={[
                {
                  title: "Acme Corporation announces strategic partnership with major cloud provider",
                  date: "2 days ago",
                  source: "TechCrunch",
                  url: "#"
                },
                {
                  title: "Q3 earnings beat expectations, stock rises 12%",
                  date: "1 week ago",
                  source: "Reuters",
                  url: "#"
                }
              ]}
            />

            <Card>
              <CardHeader>
                <CardTitle>Auto-Suggested Exposure</CardTitle>
                <CardDescription>
                  Based on public filings and investor communications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 bg-[#8DC63F]/10 border-[#8DC63F]/20">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold mb-1">Estimated Annual Cost of Turnover</p>
                      <p className="text-3xl font-bold font-mono">$12.5M</p>
                    </div>
                    <StatusBadge status="draft" />
                  </div>
                  <Separator className="my-3" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">Key Assumptions:</p>
                    <ul className="space-y-1 text-muted-foreground ml-4">
                      <li>• Current turnover rate: 18.5% (from earnings call)</li>
                      <li>• Average replacement cost: $85,000 per employee</li>
                      <li>• Total affected headcount: 12,500 employees</li>
                    </ul>
                    <p className="text-xs text-muted-foreground pt-2">
                      Source: Q3 2024 Earnings Call Transcript, SEC 10-K Filing
                    </p>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button size="sm" data-testid="button-accept-exposure">Accept</Button>
                    <Button size="sm" variant="outline" data-testid="button-edit-exposure">Edit Assumptions</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Freeform Notes</CardTitle>
                  <CardDescription>Capture key insights from discovery conversation</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Start typing your notes here..."
                    className="min-h-[400px] resize-none"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    data-testid="textarea-notes"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Auto-saved • Last saved 2 minutes ago</p>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Structured Fields</CardTitle>
                  <CardDescription>Capture specific data points</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="stakeholder">Key Stakeholder</Label>
                    <Input
                      id="stakeholder"
                      placeholder="Name, Title"
                      value={stakeholder}
                      onChange={(e) => setStakeholder(e.target.value)}
                      data-testid="input-stakeholder"
                    />
                  </div>
                  <div>
                    <Label htmlFor="challenges">Top Challenges</Label>
                    <Textarea
                      id="challenges"
                      placeholder="List main challenges..."
                      className="resize-none"
                      data-testid="textarea-challenges"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeline">Timeline</Label>
                    <Input
                      id="timeline"
                      placeholder="Expected timeline"
                      data-testid="input-timeline"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Evidence & Provenance
                </CardTitle>
                <CardDescription>All public documents used in this analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { title: "Q3 2024 Earnings Call Transcript", date: "Oct 15, 2024", excerpt: "...turnover has been a challenge, currently at 18.5%..." },
                    { title: "SEC Form 10-K Annual Report", date: "Dec 31, 2023", excerpt: "...total workforce of approximately 12,500 employees..." },
                    { title: "Investor Presentation Q3 2024", date: "Oct 20, 2024", excerpt: "...revenue growth of 24% year-over-year..." }
                  ].map((doc, idx) => (
                    <div key={idx} className="border rounded-lg p-4" data-testid={`evidence-${idx}`}>
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">{doc.date}</p>
                      </div>
                      <p className="text-sm text-muted-foreground italic">{doc.excerpt}</p>
                      <Button size="sm" variant="ghost" className="px-0 mt-2" data-testid={`button-view-doc-${idx}`}>
                        View Full Document →
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hypothesis">
            <ValueHypothesisBuilder />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
