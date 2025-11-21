import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import PhaseCard from "@/components/PhaseCard";
import { Search, Handshake, TrendingUp, Shield, Database, Award, ArrowRight, PlayCircle } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-16 lg:h-20 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Korn Ferry</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#overview" className="text-sm font-medium hover:text-primary">Overview</a>
              <a href="#how-it-works" className="text-sm font-medium hover:text-primary">How It Works</a>
              <a href="#trust" className="text-sm font-medium hover:text-primary">Trust & Security</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/discovery">
                <Button size="lg" data-testid="button-start-discovery">
                  Start Discovery
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/alignment">
                <Button size="lg" variant="outline" data-testid="button-view-alignment">
                  View Alignment Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            <div className="lg:col-span-3 space-y-6">
              <Badge variant="secondary" className="text-sm">Trusted by Fortune 500 Companies</Badge>
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight">
                Korn Ferry Value Lifecycle
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground">
                Rapid discovery, clear alignment and a measurable path to value. Work with your team in the meeting, then hold leaders to results.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/discovery">
                  <Button size="lg" className="px-8 py-6 text-lg" data-testid="button-hero-start">
                    Start Discovery
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/alignment">
                  <Button size="lg" variant="outline" className="px-8 py-6 text-lg" data-testid="button-hero-alignment">
                    View Alignment Portal
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="aspect-video bg-muted rounded-lg border-2 border-border flex items-center justify-center hover-elevate">
                <div className="text-center space-y-3">
                  <PlayCircle className="w-16 h-16 mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">30-second explainer video</p>
                  <p className="text-xs text-muted-foreground">Discovery → Alignment → Realisation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="overview" className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-semibold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Three phases guide you from initial discovery to measurable value realization with full transparency and governance
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PhaseCard
              phaseNumber={1}
              title="Discovery"
              description="Rapid understanding using public data and live note capture during discovery calls"
              icon={Search}
              outcomes={[
                "Complete organisation profile with confidence scoring",
                "Auto-suggested exposure with provenance",
                "Draft value hypothesis ready for client review"
              ]}
            />
            <PhaseCard
              phaseNumber={2}
              title="Alignment"
              description="Customer confirms challenges, selects KPIs, and creates a signed 12-month plan"
              icon={Handshake}
              outcomes={[
                "Top 3 strategic challenges mapped to solutions",
                "Signed baseline with email confirmation",
                "Visual 12-month timeline with governance"
              ]}
            />
            <PhaseCard
              phaseNumber={3}
              title="Realisation"
              description="Track progress, measure value, and generate board-ready reports with Analytics sign-off"
              icon={TrendingUp}
              outcomes={[
                "Real-time KPI tracking with confidence levels",
                "NPV calculations with full transparency",
                "Analytics-approved final report"
              ]}
            />
          </div>
        </div>
      </section>

      <section id="trust" className="py-16 lg:py-24">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-semibold mb-4">Trust & Security</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Shield className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle className="text-xl">Responsible AI</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  All AI-powered features include transparency checklists and human-in-the-loop validation for Tier 3 reports
                </CardDescription>
                <a href="#" className="text-primary text-sm hover:underline inline-block mt-4" data-testid="link-responsible-ai">
                  Read Full Policy →
                </a>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Database className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle className="text-xl">Data Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  No audio stored. All evidence tracked with provenance. Full audit trail for Analytics review
                </CardDescription>
                <a href="#" className="text-primary text-sm hover:underline inline-block mt-4" data-testid="link-data-policy">
                  View Data Policy →
                </a>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Award className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle className="text-xl">Analytics SLA</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  48-hour turnaround for Tier 3 reviews. Quality assurance and sign-off for all final reports
                </CardDescription>
                <a href="#" className="text-primary text-sm hover:underline inline-block mt-4" data-testid="link-analytics-sla">
                  Learn More →
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Korn Ferry</h3>
              <p className="text-sm text-muted-foreground">
                Enabling value-driven partnerships through transparent measurement
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Responsible AI</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Analytics SLA</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Support</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Sales</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Feedback</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <Separator className="mb-8" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2024 Korn Ferry. All rights reserved.</p>
            <p>Trusted by leading organizations worldwide</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
