import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Brain, Target, Users, FileText, Mic, CheckCircle2, ArrowRight, Zap, TrendingUp, MessageSquare, BarChart3, Calendar, Award, Activity, Search, Lightbulb, LineChart, Play, Building2, Briefcase, Rocket, RefreshCw, GraduationCap, Shield, UserCheck, Truck, Headphones } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import heroImage from "@assets/Picture6_1763994371580.jpg";

const lifecyclePhases = [
  { 
    id: "discover_qualify", 
    label: "Discover & Qualify", 
    shortLabel: "Discover",
    icon: Search, 
    description: "Understanding client needs and qualifying opportunities",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    borderColor: "border-blue-300 dark:border-blue-700"
  },
  { 
    id: "shape_sell", 
    label: "Shape & Sell", 
    shortLabel: "Shape",
    icon: Lightbulb, 
    description: "Designing solutions and building value cases",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    borderColor: "border-purple-300 dark:border-purple-700"
  },
  { 
    id: "deliver_realise", 
    label: "Deliver & Realise", 
    shortLabel: "Deliver",
    icon: Rocket, 
    description: "Implementing and delivering promised value",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    borderColor: "border-emerald-300 dark:border-emerald-700"
  },
  { 
    id: "review_renew", 
    label: "Review & Renew", 
    shortLabel: "Review",
    icon: RefreshCw, 
    description: "Evaluating outcomes and expanding opportunities",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    borderColor: "border-amber-300 dark:border-amber-700"
  },
  { 
    id: "learn_scale", 
    label: "Learn & Scale", 
    shortLabel: "Scale",
    icon: GraduationCap, 
    description: "Capturing learnings and scaling success",
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-100 dark:bg-rose-900/30",
    borderColor: "border-rose-300 dark:border-rose-700"
  },
];

const roleViews = [
  {
    id: "sales",
    label: "Sales",
    icon: TrendingUp,
    description: "Pipeline visibility, opportunity tracking, and win/loss insights",
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30"
  },
  {
    id: "consultant",
    label: "Consultant",
    icon: Brain,
    description: "Discovery research, value case building, and client insights",
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/30"
  },
  {
    id: "delivery",
    label: "Delivery",
    icon: Truck,
    description: "Implementation tracking, KPI logging, and milestone management",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30"
  },
  {
    id: "csm",
    label: "CSM",
    icon: Headphones,
    description: "Account health, renewals, and customer success metrics",
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/30"
  },
];

export default function Landing() {
  const [activePhase, setActivePhase] = useState("discover_qualify");
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-16 lg:h-20 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Korn Ferry</span>
                <p className="text-xs text-muted-foreground hidden lg:block">Client Value Hub</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/accounts" className="text-sm font-medium hover:text-primary transition-colors">Accounts</Link>
              <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How It Works</a>
            </nav>
            <Link href="/accounts">
              <Button size="lg" className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all" data-testid="button-get-started">
                <Building2 className="mr-2 w-4 h-4" />
                View Accounts
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 lg:py-36 overflow-hidden">
        {/* Layered Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Left: Content */}
            <div className="space-y-10">
              <div className="space-y-6">
                <Badge variant="secondary" className="text-sm px-4 py-2 shadow-md">
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  Powered by AI
                </Badge>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                  Unlock <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Client Value</span> at Scale
                </h1>
                <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-xl">
                  Transform client engagements from discovery to realization. AI-powered insights, strategic job mapping, and measurable outcomes—all in one platform.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/accounts">
                  <Button 
                    size="lg" 
                    className="px-10 py-7 text-lg font-semibold shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:scale-105 transition-all duration-300" 
                    data-testid="button-hero-start"
                  >
                    <Building2 className="mr-2 w-5 h-5" />
                    Open Client Hub
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="px-8 py-7 text-lg font-semibold" 
                    data-testid="button-hero-projects"
                  >
                    <Briefcase className="mr-2 w-5 h-5" />
                    View Projects
                  </Button>
                </Link>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">AI-Powered Research</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Strategic Job Mapping</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Measurable KPIs</span>
                </div>
              </div>
            </div>
            
            {/* Right: Professional Hero Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border-2 border-primary/10 group">
                <img
                  src={heroImage}
                  alt="Professional consultant collaboration"
                  className="w-full h-auto object-cover"
                />
                {/* Gradient Overlay for subtle branding */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                
                {/* Feature Stats Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background/95 via-background/80 to-transparent">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">5</div>
                      <div className="text-xs text-muted-foreground">Phases</div>
                    </div>
                    <div className="text-center border-l border-border">
                      <div className="text-2xl font-bold text-foreground">4</div>
                      <div className="text-xs text-muted-foreground">Role Views</div>
                    </div>
                    <div className="text-center border-l border-border">
                      <div className="text-2xl font-bold text-foreground">AI</div>
                      <div className="text-xs text-muted-foreground">Powered</div>
                    </div>
                    <div className="text-center border-l border-border">
                      <div className="text-2xl font-bold text-foreground">∞</div>
                      <div className="text-xs text-muted-foreground">Value</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Small feature cards below */}
              <div className="grid grid-cols-2 gap-5 mt-6">
                <Card className="hover-elevate transition-all duration-300 border-2 hover:border-primary/20 group">
                  <CardHeader className="pb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                      <Brain className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-sm font-bold">AI Research</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      GPT-4o insights with priority scoring
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="hover-elevate transition-all duration-300 border-2 hover:border-primary/20 group">
                  <CardHeader className="pb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                      <BarChart3 className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-sm font-bold">Value Alignment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Baseline to target KPIs with benchmark data
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="hover-elevate transition-all duration-300 border-2 hover:border-primary/20 group">
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Activity className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-bold">Progress Tracking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Monitor KPIs from baseline to target in real-time
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="hover-elevate transition-all duration-300 border-2 hover:border-primary/20 group">
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-bold">Business Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Track client engagement with sentiment analysis
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Phase Lifecycle Journey */}
      <section id="lifecycle" className="py-24 lg:py-36 relative overflow-hidden bg-gradient-to-br from-muted/30 via-background to-muted/30">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-6 shadow-md">
              <Rocket className="w-3.5 h-3.5 mr-2" />
              Complete Customer Journey
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              5-Phase Value Lifecycle
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Guide every engagement from initial discovery through scaled success with a unified view across all phases
            </p>
          </div>

          {/* Lifecycle Timeline */}
          <div className="relative mb-16">
            {/* Connection Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-emerald-500 via-amber-500 to-rose-500 transform -translate-y-1/2 hidden lg:block" />
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {lifecyclePhases.map((phase, index) => {
                const Icon = phase.icon;
                return (
                  <div 
                    key={phase.id}
                    className="relative group"
                    data-testid={`lifecycle-phase-${phase.id}`}
                  >
                    <Card className={`hover-elevate transition-all duration-300 border-2 ${phase.borderColor} ${activePhase === phase.id ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                      <CardContent className="pt-6 pb-4 text-center">
                        <div className={`w-14 h-14 mx-auto rounded-2xl ${phase.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`w-7 h-7 ${phase.color}`} />
                        </div>
                        <Badge variant="outline" className="mb-2 text-xs">Phase {index + 1}</Badge>
                        <h3 className="font-bold text-base mb-2">{phase.shortLabel}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {phase.description}
                        </p>
                      </CardContent>
                    </Card>
                    {/* Arrow connector for mobile */}
                    {index < lifecyclePhases.length - 1 && (
                      <div className="flex justify-center my-2 md:hidden">
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Value Flow Visual */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">Promised</div>
                  <p className="text-muted-foreground">Track value commitments made to clients</p>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-8 h-8 text-primary hidden md:block" />
                  <div className="md:hidden text-4xl font-bold text-primary">→</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">Delivered</div>
                  <p className="text-muted-foreground">Measure and prove realized outcomes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Role-Based Views */}
      <section id="roles" className="py-24 lg:py-36 relative overflow-hidden">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-6 shadow-md">
              <Users className="w-3.5 h-3.5 mr-2" />
              Tailored Experiences
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Role-Based Dashboards
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Every team member sees what matters most to their role—from pipeline to delivery to renewals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roleViews.map((role) => {
              const Icon = role.icon;
              return (
                <Card 
                  key={role.id}
                  className="hover-elevate transition-all duration-300 border-2 hover:border-primary/30 group"
                  data-testid={`role-card-${role.id}`}
                >
                  <CardHeader className="pb-2">
                    <div className={`w-12 h-12 rounded-xl ${role.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-6 h-6 ${role.color}`} />
                    </div>
                    <CardTitle className="text-lg">{role.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {role.description}
                    </p>
                    <Link href="/accounts">
                      <Button variant="outline" size="sm" className="w-full" data-testid={`button-explore-${role.id}`}>
                        Explore View
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link href="/accounts">
              <Button size="lg" className="shadow-lg shadow-primary/20" data-testid="button-open-hub">
                <Building2 className="mr-2 w-5 h-5" />
                Open Client Value Hub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Process Demo */}
      <section id="how-it-works" className="py-24 lg:py-36 relative overflow-hidden">
        {/* Layered Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent opacity-60" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
        
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-6 shadow-md">
              <Play className="w-3.5 h-3.5 mr-2" />
              See It In Action
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              AI-Powered Value Discovery
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              From research to realization—watch how AI accelerates the entire engagement lifecycle
            </p>
          </div>

          {/* Phase Tabs */}
          <Tabs value={activePhase} onValueChange={setActivePhase} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-12 h-auto p-2 bg-muted/50" data-testid="tabs-demo-phases">
              {lifecyclePhases.map((phase) => {
                const Icon = phase.icon;
                return (
                  <TabsTrigger 
                    key={phase.id}
                    value={phase.id} 
                    className="text-sm lg:text-base py-3 data-[state=active]:bg-background data-[state=active]:shadow-lg"
                    data-testid={`tab-${phase.id}`}
                  >
                    <Icon className="w-4 h-4 mr-1 lg:mr-2" />
                    <span className="font-medium hidden sm:inline">{phase.shortLabel}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Discover & Qualify Phase Demo */}
            <TabsContent value="discover_qualify" className="space-y-8" data-testid="demo-discover-qualify">
              <Card className="border-2 border-primary/20 shadow-2xl">
                <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                      <Brain className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">AI-Powered Company Research</CardTitle>
                      <CardDescription className="text-base mt-1">
                        GPT-5 analyzes TechCorp Industries and generates strategic insights
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Sample Insights */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Lightbulb className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-lg">Generated Insights (Sample)</h3>
                    </div>
                    
                    <Card className="bg-muted/30 border-l-4 border-l-red-500" data-testid="demo-insight-1">
                      <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="destructive" className="text-xs">Critical Priority</Badge>
                          <Badge variant="secondary" className="text-xs">Growth Strategy</Badge>
                          <Badge variant="outline" className="text-xs">95% Confidence</Badge>
                        </div>
                        <p className="text-base font-medium mb-2">
                          Current market share declining in core segments
                        </p>
                        <p className="text-sm text-muted-foreground">
                          TechCorp's flagship product line has lost 12% market share over 18 months to emerging competitors leveraging AI-driven customization. Revenue impact estimated at $45M annually.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs bg-primary/5">
                            <BarChart3 className="w-3 h-3 mr-1" />
                            Revenue Growth Rate
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-primary/5">
                            <Target className="w-3 h-3 mr-1" />
                            Market Share %
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30 border-l-4 border-l-orange-500" data-testid="demo-insight-2">
                      <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className="bg-orange-500 text-white text-xs">High Priority</Badge>
                          <Badge variant="secondary" className="text-xs">Operating Model</Badge>
                          <Badge variant="outline" className="text-xs">88% Confidence</Badge>
                        </div>
                        <p className="text-base font-medium mb-2">
                          Operational inefficiencies in supply chain management
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Manufacturing cycle time 40% higher than industry benchmark due to legacy systems and siloed data. Opportunity to reduce costs by $18M through digital transformation.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs bg-primary/5">
                            <Activity className="w-3 h-3 mr-1" />
                            Cycle Time Reduction
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-primary/5">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Operating Margin %
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30 border-l-4 border-l-blue-500" data-testid="demo-insight-3">
                      <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className="bg-blue-500 text-white text-xs">Supporting</Badge>
                          <Badge variant="secondary" className="text-xs">Talent & Culture</Badge>
                          <Badge variant="outline" className="text-xs">82% Confidence</Badge>
                        </div>
                        <p className="text-base font-medium mb-2">
                          High turnover in critical technical roles
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Employee retention in engineering and data science roles 25% below industry average. Exit interviews cite limited career development and outdated tech stack.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs bg-primary/5">
                            <Users className="w-3 h-3 mr-1" />
                            Employee Retention Rate
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-primary/5">
                            <Award className="w-3 h-3 mr-1" />
                            Employee Engagement Score
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-primary/5 border-l-4 border-l-primary p-4 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-1">AI Capabilities</p>
                        <p className="text-sm text-muted-foreground">
                          Insights automatically classified into 9 Korn Ferry capabilities, tagged with solution areas, 
                          and linked to relevant KPIs. Consultants can ask follow-up questions for deeper investigation.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Alignment Phase Demo */}
            <TabsContent value="shape_sell" className="space-y-8" data-testid="demo-shape-sell">
              <Card className="border-2 border-primary/20 shadow-2xl">
                <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                      <Target className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Jobs & Value Building</CardTitle>
                      <CardDescription className="text-base mt-1">
                        Transform insights into prioritized jobs with measurable KPI targets
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Priority Jobs */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-lg">Top 3 Priority Jobs</h3>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        3 Jobs Selected
                      </Badge>
                    </div>

                    {/* Job 1 */}
                    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/30" data-testid="demo-job-1">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-primary text-primary-foreground">Priority #1</Badge>
                              <Badge variant="outline">Growth Strategy</Badge>
                            </div>
                            <h4 className="text-lg font-bold mb-2">Accelerate Revenue Growth Through Market Expansion</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                              Based on 3 critical insights about market share decline and competitive positioning
                            </p>
                          </div>
                        </div>
                        
                        {/* KPIs */}
                        <div className="space-y-3 bg-background/60 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <BarChart3 className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-sm">Key Performance Indicators</span>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1">
                                <p className="text-sm font-medium mb-1">Revenue Growth Rate</p>
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Baseline:</span>
                                    <Badge variant="outline" className="text-xs bg-orange-500/10">3.2%</Badge>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Target:</span>
                                    <Badge variant="outline" className="text-xs bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">12.5%</Badge>
                                  </div>
                                  <Badge className="bg-emerald-500 text-white text-xs">↑ 290%</Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1">
                                <p className="text-sm font-medium mb-1">Market Share %</p>
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Baseline:</span>
                                    <Badge variant="outline" className="text-xs bg-orange-500/10">18.5%</Badge>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Target:</span>
                                    <Badge variant="outline" className="text-xs bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">25.0%</Badge>
                                  </div>
                                  <Badge className="bg-emerald-500 text-white text-xs">↑ 35%</Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Job 2 */}
                    <Card className="bg-muted/30 border-2" data-testid="demo-job-2">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">Priority #2</Badge>
                              <Badge variant="outline">Operating Model</Badge>
                            </div>
                            <h4 className="text-lg font-bold mb-2">Optimize Supply Chain Operations</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                              Based on 2 high-priority insights about operational inefficiencies
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-background/60 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <BarChart3 className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-sm">2 Primary KPIs • 1 Supporting</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Cycle Time Reduction, Operating Margin %, Cost per Unit
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Job 3 */}
                    <Card className="bg-muted/30 border-2" data-testid="demo-job-3">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">Priority #3</Badge>
                              <Badge variant="outline">Talent & Culture</Badge>
                            </div>
                            <h4 className="text-lg font-bold mb-2">Enhance Technical Talent Retention</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                              Based on supporting insights about employee turnover
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-background/60 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <BarChart3 className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-sm">2 Primary KPIs</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Employee Retention Rate, Employee Engagement Score
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-primary/5 border-l-4 border-l-primary p-4 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-1">AI-Powered Benchmarks</p>
                        <p className="text-sm text-muted-foreground">
                          Consultants can toggle between client data and industry benchmarks. AI generates baseline values 
                          with confidence scores when client data is unavailable, accelerating the alignment process.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Realization Phase Demo */}
            <TabsContent value="deliver_realise" className="space-y-8" data-testid="demo-deliver-realise">
              <Card className="border-2 border-primary/20 shadow-2xl">
                <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Progress Tracking & Business Reviews</CardTitle>
                      <CardDescription className="text-base mt-1">
                        Monitor KPI progress and manage ongoing client engagement
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* KPI Progress Tracking */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <LineChart className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-lg">KPI Progress (6 Months)</h3>
                    </div>

                    <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10 border-2 border-emerald-500/30" data-testid="demo-kpi-progress">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-bold">Revenue Growth Rate</h4>
                              <Badge className="bg-emerald-500 text-white">On Track</Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground w-20">Baseline</span>
                                <div className="flex-1 bg-orange-500/20 h-2 rounded-full overflow-hidden">
                                  <div className="bg-orange-500 h-full" style={{width: '25.6%'}} />
                                </div>
                                <Badge variant="outline" className="text-xs bg-orange-500/10">3.2%</Badge>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium w-20">Actual (Q2)</span>
                                <div className="flex-1 bg-primary/20 h-2 rounded-full overflow-hidden">
                                  <div className="bg-primary h-full" style={{width: '56%'}} />
                                </div>
                                <Badge variant="outline" className="text-xs bg-primary/10">7.0%</Badge>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground w-20">Target</span>
                                <div className="flex-1 bg-emerald-500/20 h-2 rounded-full overflow-hidden">
                                  <div className="bg-emerald-500 h-full" style={{width: '100%'}} />
                                </div>
                                <Badge variant="outline" className="text-xs bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">12.5%</Badge>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              ✓ Progress: 41% of gap closed • Trajectory: Ahead of schedule
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30 border-2" data-testid="demo-kpi-progress-2">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-bold">Market Share %</h4>
                              <Badge variant="secondary">In Progress</Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground w-20">Baseline</span>
                                <div className="flex-1 bg-orange-500/20 h-2 rounded-full overflow-hidden">
                                  <div className="bg-orange-500 h-full" style={{width: '74%'}} />
                                </div>
                                <Badge variant="outline" className="text-xs bg-orange-500/10">18.5%</Badge>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium w-20">Actual (Q2)</span>
                                <div className="flex-1 bg-primary/20 h-2 rounded-full overflow-hidden">
                                  <div className="bg-primary h-full" style={{width: '80%'}} />
                                </div>
                                <Badge variant="outline" className="text-xs bg-primary/10">20.0%</Badge>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground w-20">Target</span>
                                <div className="flex-1 bg-emerald-500/20 h-2 rounded-full overflow-hidden">
                                  <div className="bg-emerald-500 h-full" style={{width: '100%'}} />
                                </div>
                                <Badge variant="outline" className="text-xs bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">25.0%</Badge>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              ✓ Progress: 23% of gap closed • Trajectory: On schedule
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Business Reviews */}
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-lg">Business Review Timeline</h3>
                    </div>

                    <div className="space-y-3">
                      <Card className="bg-muted/30 border-l-4 border-l-emerald-500" data-testid="demo-review-1">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-emerald-500 text-white text-xs">Completed</Badge>
                                <Badge variant="outline" className="text-xs">Quarterly</Badge>
                                <span className="text-xs text-muted-foreground">Apr 15, 2025</span>
                              </div>
                              <p className="font-semibold mb-1">Q1 2025 Business Review</p>
                              <p className="text-sm text-muted-foreground">
                                Client Sentiment: Positive • 3 Action Items • 2 Key Decisions
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-primary/5 border-l-4 border-l-primary" data-testid="demo-review-2">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="text-xs">Scheduled</Badge>
                                <Badge variant="outline" className="text-xs">Quarterly</Badge>
                                <span className="text-xs text-muted-foreground">Jul 22, 2025</span>
                              </div>
                              <p className="font-semibold mb-1">Q2 2025 Business Review</p>
                              <p className="text-sm text-muted-foreground">
                                Review KPI progress and alignment on growth initiatives
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="bg-primary/5 border-l-4 border-l-primary p-4 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-1">Continuous Engagement</p>
                        <p className="text-sm text-muted-foreground">
                          Track actual KPI values over time, manage business reviews with sentiment tracking, 
                          and link success stories to demonstrate proven outcomes to clients.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Review & Renew Phase Demo */}
            <TabsContent value="review_renew" className="space-y-8" data-testid="demo-review-renew">
              <Card className="border-2 border-primary/20 shadow-2xl">
                <CardHeader className="border-b bg-gradient-to-r from-amber-500/10 to-amber-500/5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                      <RefreshCw className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Review & Renew</CardTitle>
                      <CardDescription className="text-base mt-1">
                        Evaluate outcomes, capture wins, and identify expansion opportunities
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
                      <CardContent className="pt-6 text-center">
                        <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">87%</div>
                        <p className="text-sm text-muted-foreground">Value Realized</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                      <CardContent className="pt-6 text-center">
                        <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">$2.4M</div>
                        <p className="text-sm text-muted-foreground">Proven Impact</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
                      <CardContent className="pt-6 text-center">
                        <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">3</div>
                        <p className="text-sm text-muted-foreground">Expansion Opportunities</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="bg-amber-500/10 border-l-4 border-l-amber-500 p-4 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <RefreshCw className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-1">Quarterly Business Reviews</p>
                        <p className="text-sm text-muted-foreground">
                          Structured QBRs with value scorecards, client sentiment tracking, and renewal planning
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Learn & Scale Phase Demo */}
            <TabsContent value="learn_scale" className="space-y-8" data-testid="demo-learn-scale">
              <Card className="border-2 border-primary/20 shadow-2xl">
                <CardHeader className="border-b bg-gradient-to-r from-rose-500/10 to-rose-500/5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg">
                      <GraduationCap className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Learn & Scale</CardTitle>
                      <CardDescription className="text-base mt-1">
                        Capture learnings and scale success across the organization
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Award className="w-5 h-5 text-primary" />
                          Success Story Library
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Verified case studies with measurable outcomes that can be shared with new prospects
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">12 Verified Stories</Badge>
                          <Badge variant="outline">$45M Total Impact</Badge>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-primary" />
                          Pattern Recognition
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          AI identifies winning patterns across engagements to accelerate future deals
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">Industry Insights</Badge>
                          <Badge variant="outline">Best Practices</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="bg-rose-500/10 border-l-4 border-l-rose-500 p-4 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <GraduationCap className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-1">Organizational Learning</p>
                        <p className="text-sm text-muted-foreground">
                          Turn individual engagement successes into repeatable playbooks for the entire team
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link href="/accounts">
              <Button 
                size="lg" 
                className="px-12 py-7 text-lg font-semibold shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
                data-testid="button-demo-cta"
              >
                <Building2 className="mr-2 w-5 h-5" />
                Explore Client Value Hub
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              View accounts, initiatives, and role-based dashboards
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-36 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
        {/* Subtle accent gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative">
          <div className="text-center mb-20">
            <Badge variant="secondary" className="mb-6 shadow-md">
              <Zap className="w-3.5 h-3.5 mr-2" />
              Platform Capabilities
            </Badge>
            <h2 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Everything You Need to Drive Value
            </h2>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              From AI-powered discovery to measurable outcomes, every feature is designed to accelerate client engagements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Research */}
            <Card className="hover-elevate transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 group border-2">
              <CardHeader className="pb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Brain className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">AI-Powered Research</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <CardDescription className="text-base leading-relaxed">
                  GPT-5 generates strategic, prioritized insights tagged with Korn Ferry consulting pillars and capabilities
                </CardDescription>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Up to 8 high-quality insights per research</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Priority scoring: Critical, High, Supporting</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Follow-up questions for deeper investigation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Automatic KPI and solution area assignment</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Jobs & Priorities */}
            <Card className="hover-elevate transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 group border-2">
              <CardHeader className="pb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Jobs & Priorities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <CardDescription className="text-base leading-relaxed">
                  Transform insights, questions, and responses into actionable priorities using Korn Ferry's "Jobs We Do" framework
                </CardDescription>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Job themes from AI insights + client responses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Top-3 prioritization with re-prioritize capability</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>KPI selection with primary/supporting types</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Baseline data with benchmark fallbacks</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Notes & Enrichment */}
            <Card className="hover-elevate transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 group border-2">
              <CardHeader className="pb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <FileText className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Notes & Enrichment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <CardDescription className="text-base leading-relaxed">
                  Capture meeting notes, upload documents, and let AI extract strategic insights automatically
                </CardDescription>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Freeform note-taking during discovery calls</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>File uploads (PDF, Word, Excel, images)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>AI extracts metrics, challenges, opportunities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Auto-classification to capabilities</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Voice Notes */}
            <Card className="hover-elevate transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 group border-2">
              <CardHeader className="pb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Mic className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Voice Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <CardDescription className="text-base leading-relaxed">
                  Record voice notes during meetings using browser speech recognition for instant transcription
                </CardDescription>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Real-time speech-to-text conversion</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>No audio storage for privacy compliance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Transcriptions included in AI enrichment</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Perfect for capturing live conversations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Client Collaboration */}
            <Card className="hover-elevate transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 group border-2">
              <CardHeader className="pb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Client Collaboration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <CardDescription className="text-base leading-relaxed">
                  Share discovery questionnaires with clients and track complete data provenance with source attribution badges
                </CardDescription>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Shareable questionnaire links (no login)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Source attribution badges: AI, Client, Consultant, Notes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Client responses integrated into job themes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Complete data provenance tracking throughout workflow</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Alignment & Targets */}
            <Card className="hover-elevate transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 group border-2">
              <CardHeader className="pb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <BarChart3 className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Alignment & Targets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <CardDescription className="text-base leading-relaxed">
                  Executive dashboard with completion progress, estimated value impact, and client engagement metrics
                </CardDescription>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Real-time completion progress tracking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Estimated value impact with KPI completion status</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Client engagement metrics and contribution tracking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Value gap visualization with benchmark comparisons</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Business Reviews */}
            <Card className="hover-elevate transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 group border-2">
              <CardHeader className="pb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Calendar className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Business Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <CardDescription className="text-base leading-relaxed">
                  Schedule and track client business reviews with sentiment analysis and outcome documentation
                </CardDescription>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Quarterly, Monthly, and Ad-hoc review types</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Client sentiment tracking (Positive, Neutral, Negative)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Key outcomes, action items, and decisions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Automatic filtering: Completed vs. Upcoming</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Progress Tracking */}
            <Card className="hover-elevate transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 group border-2">
              <CardHeader className="pb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Activity className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <CardDescription className="text-base leading-relaxed">
                  Monitor KPI progress over time showing movement from baseline to actual to target values
                </CardDescription>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Baseline → Actual → Target visualization</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Historical KPI tracking with timestamps</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Integration with finalized discovery jobs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Real-time progress notes and updates</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Success Stories */}
            <Card className="hover-elevate transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 group border-2">
              <CardHeader className="pb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Award className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Success Stories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <CardDescription className="text-base leading-relaxed">
                  Link relevant Korn Ferry client case studies to projects for proven outcome references
                </CardDescription>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Link published Korn Ferry case studies</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Track by industry, title, and impact summary</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Reference proven outcomes in value cases</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span>Capability-based story organization</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 lg:py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/8 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            <h2 className="text-5xl lg:text-7xl font-bold leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Ready to Transform Your Client Engagements?
            </h2>
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
              Start your first discovery project today and experience the power of AI-driven value lifecycle management
            </p>
            <div className="flex flex-wrap gap-6 justify-center pt-6">
              <Link href="/discovery">
                <Button 
                  size="lg" 
                  className="px-12 py-8 text-xl font-bold shadow-2xl shadow-primary/40 hover:shadow-primary/50 hover:scale-105 transition-all duration-300" 
                  data-testid="button-cta-start"
                >
                  Get Started Now
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-16 bg-gradient-to-b from-muted/30 to-muted/10">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-7 h-7 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold">Korn Ferry</span>
              </div>
              <p className="text-base text-muted-foreground max-w-md leading-relaxed">
                Empowering consultants to unlock client value through AI-powered discovery, strategic job mapping, and measurable outcomes.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-5 text-lg">Platform</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/discovery" className="text-muted-foreground hover:text-primary transition-colors">Get Started</Link></li>
                <li><a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-5 text-lg">Company</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="https://www.kornferry.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">Korn Ferry</a></li>
                <li><a href="https://www.kornferry.com/insights" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">Insights</a></li>
                <li><a href="https://www.kornferry.com/about-us" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">About Us</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p className="font-medium">© 2024 Korn Ferry. All rights reserved.</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="font-medium">Powered by AI</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
