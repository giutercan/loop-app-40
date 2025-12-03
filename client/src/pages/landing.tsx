import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, Brain, Target, Users, CheckCircle2, ArrowRight, 
  TrendingUp, BarChart3, Building2, Search, Lightbulb, 
  Shield, AlertTriangle, Clock, Handshake, ChevronRight,
  Zap, FileText, MessageSquare, Activity, LineChart
} from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/Picture6_1763994371580.jpg";

const valuePillars = [
  {
    id: "grow",
    title: "Grow",
    subtitle: "Revenue & Market Share",
    icon: TrendingUp,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    metrics: ["Revenue growth", "Market expansion", "Innovation"]
  },
  {
    id: "optimise",
    title: "Optimise",
    subtitle: "Productivity & Efficiency",
    icon: BarChart3,
    color: "text-sky-600",
    bgColor: "bg-sky-50 dark:bg-sky-900/20",
    borderColor: "border-sky-200 dark:border-sky-800",
    metrics: ["Cost reduction", "Process efficiency", "Time-to-market"]
  },
  {
    id: "derisk",
    title: "De-risk",
    subtitle: "Retention & Compliance",
    icon: Shield,
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    borderColor: "border-amber-200 dark:border-amber-800",
    metrics: ["Turnover reduction", "Succession readiness", "Risk mitigation"]
  },
  {
    id: "strengthen",
    title: "Strengthen",
    subtitle: "Leadership & Culture",
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    metrics: ["Leadership pipeline", "Culture shift", "Skills development"]
  }
];

const challenges = [
  {
    icon: Clock,
    title: "Discovery is Manual",
    description: "Hours spent on company research, scattered notes, and missed insights that could drive value conversations.",
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-900/20"
  },
  {
    icon: AlertTriangle,
    title: "Value Gets Lost",
    description: "Promises made in sales don't always translate to delivery. No clear tracking of committed outcomes.",
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-900/20"
  },
  {
    icon: MessageSquare,
    title: "Siloed Conversations",
    description: "Sales, delivery, and client sponsors operate in different systems with no shared view of value.",
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-900/20"
  },
  {
    icon: LineChart,
    title: "Hard to Prove ROI",
    description: "At renewal time, teams struggle to articulate the value delivered with concrete, trackable metrics.",
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-900/20"
  }
];

const features = [
  {
    icon: Brain,
    title: "AI-Powered Research",
    description: "GPT-4o generates strategic insights, methodology questions, and auto-classifies by priority and solution fit."
  },
  {
    icon: Handshake,
    title: "Client Alignment",
    description: "Share secure links for client review. Track status: Shared, Awaiting Review, Confirmed."
  },
  {
    icon: Target,
    title: "Value Tracking",
    description: "Health scores, KPI progress, and success stories linked to realized outcomes."
  },
  {
    icon: FileText,
    title: "Seamless Handoff",
    description: "Sales bundles confirmed outcomes for delivery. Full context transfers instantly."
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00634F] to-[#005971] rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">Korn Ferry</span>
                <p className="text-xs text-muted-foreground hidden sm:block">Value Lifecycle Platform</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#challenge" className="text-sm font-medium hover:text-[#00634F] transition-colors" data-testid="link-nav-challenge">The Challenge</a>
              <a href="#solution" className="text-sm font-medium hover:text-[#00634F] transition-colors" data-testid="link-nav-solution">Our Solution</a>
              <a href="#pillars" className="text-sm font-medium hover:text-[#00634F] transition-colors" data-testid="link-nav-pillars">Value Pillars</a>
              <a href="#features" className="text-sm font-medium hover:text-[#00634F] transition-colors" data-testid="link-nav-features">Features</a>
            </nav>
            <Link href="/accounts">
              <Button className="bg-[#00634F] hover:bg-[#005971]" data-testid="button-header-cta">
                <Building2 className="mr-2 w-4 h-4" />
                Enter Platform
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00634F]/5 via-[#005971]/5 to-transparent" />
        
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge className="bg-[#A3238E]/10 text-[#A3238E] border-[#A3238E]/20 hover:bg-[#A3238E]/15">
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  AI-Powered Platform
                </Badge>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                  Transform How You{" "}
                  <span className="bg-gradient-to-r from-[#00634F] to-[#009B77] bg-clip-text text-transparent">
                    Sell, Deliver & Prove Value
                  </span>
                </h1>
                <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-lg">
                  One platform where every team—from sales to delivery—can discover, align, and realize value together.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Link href="/accounts">
                  <Button 
                    size="lg" 
                    className="bg-[#00634F] hover:bg-[#005971] px-8 py-6 text-base font-semibold shadow-lg" 
                    data-testid="button-hero-start"
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/presentation">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="px-8 py-6 text-base font-semibold border-[#00634F]/30 text-[#00634F] hover:bg-[#00634F]/5" 
                    data-testid="button-hero-presentation"
                  >
                    <Zap className="mr-2 w-5 h-5" />
                    View Presentation
                  </Button>
                </Link>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 pt-2">
                {["AI Discovery", "Client Collaboration", "Value Tracking"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#009B77]" />
                    <span className="text-sm font-medium text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50">
                <img
                  src={heroImage}
                  alt="Professional consultant collaboration"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div data-testid="stat-hero-research-time">
                      <div className="text-2xl font-bold">60%</div>
                      <div className="text-xs text-muted-foreground">Less Research Time</div>
                    </div>
                    <div className="border-l border-border" data-testid="stat-hero-visibility">
                      <div className="text-2xl font-bold">100%</div>
                      <div className="text-xs text-muted-foreground">Outcome Visibility</div>
                    </div>
                    <div className="border-l border-border" data-testid="stat-hero-platform">
                      <div className="text-2xl font-bold">1</div>
                      <div className="text-xs text-muted-foreground">Unified Platform</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Challenge Section */}
      <section id="challenge" className="py-20 lg:py-28 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <AlertTriangle className="w-3.5 h-3.5 mr-2" />
              The Challenge
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">What We Heard From the Field</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Common pain points that prevent teams from maximizing client value
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {challenges.map((challenge) => {
              const Icon = challenge.icon;
              return (
                <Card 
                  key={challenge.title} 
                  className={`${challenge.bgColor} border-0 hover-elevate transition-all`}
                  data-testid={`challenge-card-${challenge.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <CardContent className="pt-6">
                    <div className={`w-12 h-12 rounded-xl ${challenge.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${challenge.color}`} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{challenge.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {challenge.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Vision / Solution Section */}
      <section id="solution" className="py-20 lg:py-28">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-[#00634F]/10 text-[#00634F] border-[#00634F]/20 mb-4">
              <Lightbulb className="w-3.5 h-3.5 mr-2" />
              Our Vision
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">A Unified Value Lifecycle</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              One platform where every team can discover, align, and realize value together
            </p>
          </div>
          
          {/* Journey Flow */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 mb-16">
            {/* Discover */}
            <Card className="w-full lg:w-72 bg-gradient-to-br from-[#00634F]/5 to-[#00634F]/10 border-[#00634F]/20" data-testid="journey-card-discover">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#00634F]/10 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-[#00634F]" />
                </div>
                <h3 className="font-bold text-lg mb-1">Discover</h3>
                <p className="text-sm text-muted-foreground">AI-powered research & insights</p>
              </CardContent>
            </Card>
            
            <ChevronRight className="w-8 h-8 text-muted-foreground hidden lg:block" />
            <div className="lg:hidden text-2xl text-muted-foreground">↓</div>
            
            {/* Align */}
            <Card className="w-full lg:w-72 bg-gradient-to-br from-[#005971]/5 to-[#005971]/10 border-[#005971]/20" data-testid="journey-card-align">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#005971]/10 flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-[#005971]" />
                </div>
                <h3 className="font-bold text-lg mb-1">Align</h3>
                <p className="text-sm text-muted-foreground">Collaborative client outcomes</p>
              </CardContent>
            </Card>
            
            <ChevronRight className="w-8 h-8 text-muted-foreground hidden lg:block" />
            <div className="lg:hidden text-2xl text-muted-foreground">↓</div>
            
            {/* Realize */}
            <Card className="w-full lg:w-72 bg-gradient-to-br from-[#009B77]/5 to-[#009B77]/10 border-[#009B77]/20" data-testid="journey-card-realize">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#009B77]/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-[#009B77]" />
                </div>
                <h3 className="font-bold text-lg mb-1">Realize</h3>
                <p className="text-sm text-muted-foreground">Tracked & proven value</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Quote */}
          <div className="max-w-2xl mx-auto">
            <Card className="bg-gradient-to-br from-[#00634F]/5 via-[#005971]/5 to-[#009B77]/5 border-[#00634F]/20">
              <CardContent className="py-8 text-center">
                <p className="text-xl font-medium leading-relaxed">
                  "From first conversation to proven impact—
                  <span className="text-muted-foreground"> one continuous thread of value."</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Value Pillars Section */}
      <section id="pillars" className="py-20 lg:py-28 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Activity className="w-3.5 h-3.5 mr-2" />
              Value Framework
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">The 4 Value Pillars</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every Korn Ferry solution maps to measurable business impact
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {valuePillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Card 
                  key={pillar.id} 
                  className={`${pillar.bgColor} ${pillar.borderColor} border hover-elevate transition-all`}
                  data-testid={`pillar-card-${pillar.id}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl ${pillar.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${pillar.color}`} />
                      </div>
                      <div>
                        <h3 className={`font-bold text-xl ${pillar.color}`}>{pillar.title}</h3>
                        <p className="text-sm text-muted-foreground">{pillar.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {pillar.metrics.map((metric) => (
                        <Badge key={metric} variant="secondary" className="text-xs">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-[#A3238E]/10 text-[#A3238E] border-[#A3238E]/20 mb-4">
              <Zap className="w-3.5 h-3.5 mr-2" />
              Platform Capabilities
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Key Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to drive and prove value
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.title} 
                  className="hover-elevate transition-all border"
                  data-testid={`feature-card-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00634F]/10 to-[#005971]/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-[#00634F]" />
                    </div>
                    <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Impact Stats Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-[#00634F] to-[#005971] text-white">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">The Impact</h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              What this means for Korn Ferry teams
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center" data-testid="stat-impact-research">
              <div className="text-5xl lg:text-6xl font-bold mb-2">60%</div>
              <p className="text-white/80">Less time on manual research with AI-powered discovery</p>
            </div>
            <div className="text-center border-l border-r border-white/20 px-8" data-testid="stat-impact-visibility">
              <div className="text-5xl lg:text-6xl font-bold mb-2">100%</div>
              <p className="text-white/80">Visibility into promised vs. delivered outcomes</p>
            </div>
            <div className="text-center" data-testid="stat-impact-platform">
              <div className="text-5xl lg:text-6xl font-bold mb-2">1</div>
              <p className="text-white/80">Single source of truth across the value lifecycle</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#00634F] to-[#009B77] flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold">
              Ready to Transform Value Delivery?
            </h2>
            <p className="text-lg text-muted-foreground">
              The Value Lifecycle Platform is built by Korn Ferry, for Korn Ferry—helping every team prove and maximize client impact.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link href="/accounts">
                <Button 
                  size="lg" 
                  className="bg-[#00634F] hover:bg-[#005971] px-10 py-7 text-lg font-semibold shadow-lg" 
                  data-testid="button-cta-start"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-[#00173B] text-white">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00634F] to-[#009B77] rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold">Korn Ferry</span>
                <p className="text-xs text-white/60">Value Lifecycle Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/accounts" className="text-sm text-white/80 hover:text-white transition-colors" data-testid="link-footer-accounts">
                Accounts
              </Link>
              <Link href="/presentation" className="text-sm text-white/80 hover:text-white transition-colors" data-testid="link-footer-presentation">
                Presentation
              </Link>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Sparkles className="w-4 h-4" />
              <span>Powered by AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
