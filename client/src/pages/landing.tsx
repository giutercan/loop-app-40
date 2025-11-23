import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, Target, Users, FileText, Mic, CheckCircle2, ArrowRight, Zap, TrendingUp, MessageSquare, BarChart3 } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-16 lg:h-20 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl lg:text-2xl font-bold">Korn Ferry</span>
                <p className="text-xs text-muted-foreground hidden lg:block">Value Lifecycle</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How It Works</a>
              <a href="#capabilities" className="text-sm font-medium hover:text-primary transition-colors">Capabilities</a>
            </nav>
            <Link href="/discovery">
              <Button size="lg" className="shadow-lg" data-testid="button-start-discovery">
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="text-sm px-4 py-1.5">
                  <Sparkles className="w-3 h-3 mr-1.5" />
                  Powered by AI
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
                  Unlock <span className="text-primary">Client Value</span> at Scale
                </h1>
                <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                  Transform client engagements from discovery to realization. AI-powered insights, strategic job mapping, and measurable outcomes—all in one platform.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/discovery">
                  <Button size="lg" className="px-8 py-6 text-lg shadow-xl" data-testid="button-hero-start">
                    Start Discovery
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                    See How It Works
                  </Button>
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">AI-Powered Research</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Strategic Job Mapping</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Measurable KPIs</span>
                </div>
              </div>
            </div>
            
            {/* Visual Feature Preview */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <Card className="hover-elevate transition-all duration-300 border-2">
                  <CardHeader className="pb-3">
                    <Brain className="w-8 h-8 text-primary mb-2" />
                    <CardTitle className="text-lg">AI Research</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      GPT-5 powered company insights with priority scoring
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="hover-elevate transition-all duration-300 border-2 mt-8">
                  <CardHeader className="pb-3">
                    <Target className="w-8 h-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Jobs Mapping</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Aggregate insights to strategic "Jobs We Do" themes
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="hover-elevate transition-all duration-300 border-2">
                  <CardHeader className="pb-3">
                    <MessageSquare className="w-8 h-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Client Collaboration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Share questionnaires and gather responses seamlessly
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="hover-elevate transition-all duration-300 border-2 mt-8">
                  <CardHeader className="pb-3">
                    <BarChart3 className="w-8 h-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Value Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Baseline to target KPIs with benchmark data
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Zap className="w-3 h-3 mr-1.5" />
              Platform Capabilities
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Everything You Need to Drive Value</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From AI-powered discovery to measurable outcomes, every feature is designed to accelerate client engagements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Research */}
            <Card className="hover-elevate">
              <CardHeader>
                <Brain className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-2xl">AI-Powered Research</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription className="text-base">
                  GPT-5 generates strategic, prioritized insights tagged with Korn Ferry consulting pillars and capabilities
                </CardDescription>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Up to 8 high-quality insights per research</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Priority scoring: Critical, High, Supporting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Follow-up questions for deeper investigation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Automatic KPI and solution area assignment</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Jobs & Priorities */}
            <Card className="hover-elevate">
              <CardHeader>
                <Target className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-2xl">Jobs & Priorities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription className="text-base">
                  Transform insights into actionable priorities using Korn Ferry's "Jobs We Do" strategic framework
                </CardDescription>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Automatic job theme aggregation from insights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Top-3 prioritization with drag-and-select</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>KPI selection with primary/supporting types</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Baseline data with benchmark fallbacks</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Notes & Enrichment */}
            <Card className="hover-elevate">
              <CardHeader>
                <FileText className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-2xl">Notes & Enrichment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription className="text-base">
                  Capture meeting notes, upload documents, and let AI extract strategic insights automatically
                </CardDescription>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Freeform note-taking during discovery calls</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>File uploads (PDF, Word, Excel, images)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>AI extracts metrics, challenges, opportunities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Auto-classification to capabilities</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Voice Notes */}
            <Card className="hover-elevate">
              <CardHeader>
                <Mic className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-2xl">Voice Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription className="text-base">
                  Record voice notes during meetings using browser speech recognition for instant transcription
                </CardDescription>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Real-time speech-to-text conversion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>No audio storage for privacy compliance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Transcriptions included in AI enrichment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Perfect for capturing live conversations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Client Collaboration */}
            <Card className="hover-elevate">
              <CardHeader>
                <Users className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-2xl">Client Collaboration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription className="text-base">
                  Share discovery questionnaires with clients via secure links and track response attribution
                </CardDescription>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Shareable questionnaire links (no login)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Visual distinction: consultant vs. client responses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>One-click link copying and sharing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>All responses organized by capability</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Alignment & Targets */}
            <Card className="hover-elevate">
              <CardHeader>
                <BarChart3 className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-2xl">Alignment & Targets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription className="text-base">
                  Set baseline and target values for KPIs to establish the value gap and build hypotheses
                </CardDescription>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Baseline values with source attribution</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Target values for desired outcomes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Korn Ferry benchmark comparisons</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Value gap visualization and tracking</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-32">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              The Process
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Three Phases to Value Realization</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A structured approach from initial discovery to measurable outcomes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Phase 1: Discovery */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <Card className="pt-8 hover-elevate h-full">
                <CardHeader>
                  <CardTitle className="text-2xl">Discovery</CardTitle>
                  <CardDescription className="text-base">
                    Gather comprehensive insights through AI research, notes, and client collaboration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Brain className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">AI Company Research</p>
                        <p className="text-xs text-muted-foreground">Strategic insights with priority scoring</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Notes & Documents</p>
                        <p className="text-xs text-muted-foreground">Capture and enrich with AI analysis</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Client Questionnaires</p>
                        <p className="text-xs text-muted-foreground">Collaborative discovery responses</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Jobs Prioritization</p>
                        <p className="text-xs text-muted-foreground">Top-3 strategic themes with KPIs</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Phase 2: Alignment */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <Card className="pt-8 hover-elevate h-full">
                <CardHeader>
                  <CardTitle className="text-2xl">Alignment</CardTitle>
                  <CardDescription className="text-base">
                    Establish baseline and target values to quantify the value gap
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <BarChart3 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Baseline Values</p>
                        <p className="text-xs text-muted-foreground">Current state with source attribution</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Target Outcomes</p>
                        <p className="text-xs text-muted-foreground">Desired state with benchmarks</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Value Gap Analysis</p>
                        <p className="text-xs text-muted-foreground">Baseline to target measurement</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Hypothesis Building</p>
                        <p className="text-xs text-muted-foreground">Foundation for value case</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Phase 3: Realization */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <Card className="pt-8 hover-elevate h-full">
                <CardHeader>
                  <CardTitle className="text-2xl">Realization</CardTitle>
                  <CardDescription className="text-base">
                    Track progress and measure outcomes throughout delivery
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <BarChart3 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">KPI Tracking</p>
                        <p className="text-xs text-muted-foreground">Real-time progress monitoring</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Value Measurement</p>
                        <p className="text-xs text-muted-foreground">Quantified impact reporting</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Outcome Validation</p>
                        <p className="text-xs text-muted-foreground">Achievement verification</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Executive Reporting</p>
                        <p className="text-xs text-muted-foreground">Board-ready deliverables</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl lg:text-6xl font-bold">
              Ready to Transform Your Client Engagements?
            </h2>
            <p className="text-xl lg:text-2xl text-muted-foreground">
              Start your first discovery project today and experience the power of AI-driven value lifecycle management
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link href="/discovery">
                <Button size="lg" className="px-10 py-7 text-lg shadow-2xl" data-testid="button-cta-start">
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">Korn Ferry</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                Empowering consultants to unlock client value through AI-powered discovery, strategic job mapping, and measurable outcomes.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/discovery" className="text-muted-foreground hover:text-primary">Get Started</Link></li>
                <li><a href="#features" className="text-muted-foreground hover:text-primary">Features</a></li>
                <li><a href="#how-it-works" className="text-muted-foreground hover:text-primary">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="https://www.kornferry.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">Korn Ferry</a></li>
                <li><a href="https://www.kornferry.com/insights" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">Insights</a></li>
                <li><a href="https://www.kornferry.com/about-us" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">About Us</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>© 2024 Korn Ferry. All rights reserved.</p>
              <p className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Powered by AI
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
