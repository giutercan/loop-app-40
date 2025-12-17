import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, Brain, Target, Users, CheckCircle2, ArrowRight, 
  TrendingUp, BarChart3, Building2, Search, Lightbulb, 
  Shield, Clock, Handshake, ChevronRight,
  Zap, FileText, Activity, CircleDot, Eye, Lock
} from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/Picture6_1763994371580.jpg";
import interventionImpactImage from "@assets/image_1765969612984.png";
import futureSellingImage from "@assets/image_1765969628368.png";
import { AnimatedBackground } from "@/components/AnimatedBackground";

const buyerExpectations = [
  {
    icon: Brain,
    title: "Using AI themselves",
    description: "Buyers are researching you before you research them. They arrive informed and skeptical.",
    color: "text-[#005971]",
    bgColor: "bg-[#005971]/10"
  },
  {
    icon: Eye,
    title: "Expecting evidence",
    description: "Generic promises don't work anymore. They want proof of outcomes, not just proposals.",
    color: "text-[#00634F]",
    bgColor: "bg-[#00634F]/10"
  },
  {
    icon: BarChart3,
    title: "Measuring everything",
    description: "Every vendor claim gets scrutinized. Made-up KPIs and unproven resources get exposed.",
    color: "text-[#A3238E]",
    bgColor: "bg-[#A3238E]/10"
  },
  {
    icon: Lock,
    title: "Demanding accountability",
    description: "They want to see the thread from promise to proof—and they're tracking it.",
    color: "text-[#009B77]",
    bgColor: "bg-[#009B77]/10"
  }
];

const loopCapabilities = [
  {
    icon: Search,
    title: "Embed customer knowledge",
    description: "AI-powered research that goes beyond facts to strategic insights relevant for every conversation."
  },
  {
    icon: Target,
    title: "Align on outcomes",
    description: "Collaborative client portal where strategies become committed outcomes with clear accountability."
  },
  {
    icon: Activity,
    title: "Track KPIs continuously",
    description: "Real-time progress tracking on every commitment—no more end-of-year scrambles for proof."
  },
  {
    icon: FileText,
    title: "Provide hard evidence",
    description: "Success stories and quantified impact that make renewals automatic and expansions inevitable."
  }
];

const valuePillars = [
  {
    id: "grow",
    title: "Grow",
    subtitle: "Revenue & Market Share",
    icon: TrendingUp,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    borderColor: "border-emerald-200 dark:border-emerald-800"
  },
  {
    id: "optimise",
    title: "Optimise",
    subtitle: "Productivity & Efficiency",
    icon: BarChart3,
    color: "text-sky-600",
    bgColor: "bg-sky-50 dark:bg-sky-900/20",
    borderColor: "border-sky-200 dark:border-sky-800"
  },
  {
    id: "derisk",
    title: "De-risk",
    subtitle: "Retention & Compliance",
    icon: Shield,
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    borderColor: "border-amber-200 dark:border-amber-800"
  },
  {
    id: "strengthen",
    title: "Strengthen",
    subtitle: "Leadership & Culture",
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800"
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground variant="vibrant" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-xl relative">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <span className="text-xl font-bold">Korn Ferry</span>
                <p className="text-xs font-semibold bg-gradient-to-r from-secondary via-accent to-ai bg-clip-text text-transparent hidden sm:block">Loop</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#paradox" className="text-sm font-medium hover:text-[#00634F] transition-colors" data-testid="link-nav-paradox">The Paradox</a>
              <a href="#solution" className="text-sm font-medium hover:text-[#00634F] transition-colors" data-testid="link-nav-solution">The Solution</a>
              <a href="#pillars" className="text-sm font-medium hover:text-[#00634F] transition-colors" data-testid="link-nav-pillars">Value Pillars</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/presentation">
                <Button variant="outline" className="border-[#00634F]/30 text-[#00634F] hover:bg-[#00634F]/5" data-testid="button-header-presentation">
                  <Zap className="mr-2 w-4 h-4" />
                  Tell the Story
                </Button>
              </Link>
              <Link href="/accounts">
                <Button className="bg-[#00634F] hover:bg-[#005971]" data-testid="button-header-cta">
                  <Building2 className="mr-2 w-4 h-4" />
                  Enter Platform
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - The Paradox */}
      <section className="relative py-24 lg:py-32 overflow-hidden bg-[#00173B]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00634F]/20 via-transparent to-[#A3238E]/10" />
        
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge className="bg-[#A3238E]/20 text-[#A3238E] border-[#A3238E]/30">
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              The Future of Buying & Selling
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-white">
              AI everywhere.{" "}
              <span className="text-[#929192]">
                Invisible impact.
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-white/70 leading-relaxed max-w-3xl mx-auto">
              The world is flooded with AI promises. But when leaders ask "what did we actually get?"—the silence is deafening.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link href="/accounts">
                <Button 
                  size="lg" 
                  className="bg-[#00634F] hover:bg-[#009B77] px-8 py-6 text-base font-semibold shadow-lg" 
                  data-testid="button-hero-start"
                >
                  Enter the Platform
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/presentation">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="px-8 py-6 text-base font-semibold border-white/30 text-white hover:bg-white/10" 
                  data-testid="button-hero-presentation"
                >
                  <Zap className="mr-2 w-5 h-5" />
                  Tell the Story
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Buyer Reality Section */}
      <section id="paradox" className="py-20 lg:py-28 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-[#005971]/30 text-[#005971]">
              <Eye className="w-3.5 h-3.5 mr-2" />
              The New Buyer
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Your buyers have changed</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              They're smarter, more skeptical, and armed with AI themselves
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {buyerExpectations.map((item) => {
              const Icon = item.icon;
              return (
                <Card 
                  key={item.title} 
                  className="border hover-elevate transition-all"
                  data-testid={`buyer-card-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <CardContent className="pt-6">
                    <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* The Real Question */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-[#00173B] to-[#005971]">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="bg-[#00ADBB]/20 text-[#00ADBB] border-[#00ADBB]/30 mb-6">
              The Real Question
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-white leading-tight mb-8">
              "I have the tech.<br/>
              I have the people.<br/>
              <span className="text-[#05C690]">What's actually broken?"</span>
            </h2>
            <div className="space-y-3 text-white/70 text-lg mb-8">
              <p>Is it the GTM motion?</p>
              <p>The process?</p>
              <p>Seller behaviours?</p>
              <p className="text-[#05C690] font-medium">Or a leadership system not ready for AI?</p>
            </div>
            <p className="text-xl text-white/90 font-medium">
              The answer: <span className="text-[#05C690]">They can't prove what they promised.</span>
            </p>
          </div>
        </div>
      </section>

      {/* The Solution - Loop */}
      <section id="solution" className="py-20 lg:py-28">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-[#00634F]/10 text-[#00634F] border-[#00634F]/20 mb-4">
              <Lightbulb className="w-3.5 h-3.5 mr-2" />
              The Solution
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Loop: Your Commercial Operating System
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The closed-loop system that tracks every promise from pitch to proof
            </p>
          </div>
          
          {/* The Loop Flow */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6 mb-16">
            {[
              { icon: Search, label: "Embed Knowledge", color: "from-[#00634F]" },
              { icon: Target, label: "Align Outcomes", color: "from-[#005971]" },
              { icon: Activity, label: "Track KPIs", color: "from-[#009B77]" },
              { icon: FileText, label: "Prove Value", color: "from-[#A3238E]" }
            ].map((step, idx) => (
              <div key={step.label} className="flex items-center gap-4">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} to-transparent/50 flex items-center justify-center`}>
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <div className="lg:hidden text-center">
                  <p className="font-semibold text-sm">{step.label}</p>
                </div>
                {idx < 3 && (
                  <>
                    <ChevronRight className="w-6 h-6 text-muted-foreground hidden lg:block" />
                    <div className="lg:hidden text-2xl text-muted-foreground">↓</div>
                  </>
                )}
              </div>
            ))}
          </div>
          
          <div className="hidden lg:flex justify-center gap-20 mb-16 text-center">
            <p className="font-semibold w-20">Embed Knowledge</p>
            <p className="font-semibold w-20">Align Outcomes</p>
            <p className="font-semibold w-20">Track KPIs</p>
            <p className="font-semibold w-20">Prove Value</p>
          </div>
          
          {/* Capability Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loopCapabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <Card 
                  key={cap.title} 
                  className="hover-elevate transition-all border"
                  data-testid={`capability-card-${cap.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00634F]/10 to-[#005971]/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-[#00634F]" />
                    </div>
                    <h3 className="font-semibold text-base mb-2">{cap.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {cap.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Value Pillars Section */}
      <section id="pillars" className="py-20 lg:py-28 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <CircleDot className="w-3.5 h-3.5 mr-2" />
              Value Framework
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Every outcome maps to business value</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four pillars that translate talent investments into measurable impact
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {valuePillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Card 
                  key={pillar.id} 
                  className={`${pillar.bgColor} ${pillar.borderColor} border hover-elevate transition-all text-center`}
                  data-testid={`pillar-card-${pillar.id}`}
                >
                  <CardContent className="pt-6">
                    <div className={`w-14 h-14 mx-auto rounded-xl ${pillar.bgColor} flex items-center justify-center mb-3`}>
                      <Icon className={`w-7 h-7 ${pillar.color}`} />
                    </div>
                    <h3 className={`font-bold text-lg ${pillar.color}`}>{pillar.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{pillar.subtitle}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* The Shift */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div>
              <Badge className="bg-[#A3238E]/10 text-[#A3238E] border-[#A3238E]/20 mb-4">
                The Shift
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                The unit of performance changed
              </h2>
            </div>
            
            <div className="flex items-center justify-center gap-8 lg:gap-16">
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-muted-foreground/50 mb-2">Individuals</div>
                <p className="text-sm text-muted-foreground">Traditional focus</p>
              </div>
              <ArrowRight className="w-8 h-8 text-[#00634F]" />
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-[#00634F] mb-2">Teams</div>
                <p className="text-sm text-muted-foreground">Where value is created</p>
              </div>
            </div>
            
            <Card className="bg-gradient-to-br from-[#00634F]/5 via-[#005971]/5 to-[#009B77]/5 border-[#00634F]/20">
              <CardContent className="py-8">
                <p className="text-xl font-medium leading-relaxed">
                  "Teams are the new unit of performance. The proof is in what they deliver together—
                  <span className="text-[#00634F]"> and that proof must be visible."</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Commercial Effectiveness First */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-[#00634F] to-[#005971] text-white">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <Badge className="bg-white/10 text-white border-white/20">
              <Clock className="w-3.5 h-3.5 mr-2" />
              Why Start Here
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold">
              Commercial Effectiveness is the fastest proving ground
            </h2>
            <p className="text-lg text-white/80 leading-relaxed">
              Every sale is a test of whether you can prove value. Win rates, deal velocity, renewal rates—these aren't just metrics. They're evidence of whether your system works.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
              <div className="text-center" data-testid="stat-cycles">
                <div className="text-4xl lg:text-5xl font-bold mb-2">Fast</div>
                <p className="text-white/70 text-sm">Sales cycles provide rapid feedback loops</p>
              </div>
              <div className="text-center border-l border-r border-white/20 px-8" data-testid="stat-measurable">
                <div className="text-4xl lg:text-5xl font-bold mb-2">Clear</div>
                <p className="text-white/70 text-sm">Win/loss data is objective and measurable</p>
              </div>
              <div className="text-center" data-testid="stat-template">
                <div className="text-4xl lg:text-5xl font-bold mb-2">Scalable</div>
                <p className="text-white/70 text-sm">Becomes template for all outcome tracking</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intervention to Impact System */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto max-w-6xl px-4 lg:px-8">
          <div className="text-center mb-10">
            <Badge className="bg-[#005971]/10 text-[#005971] border-[#005971]/20 mb-4">
              <BarChart3 className="w-3.5 h-3.5 mr-2" />
              Proven Results
            </Badge>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#00173B]">
              From Intervention to Impact
            </h2>
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg border">
            <img 
              src={interventionImpactImage} 
              alt="A System for Driving Client KPIs - Up to 40% increase in Win Rate, Shorten Sales Cycles by up to 30%, Reduce A-Player Attrition by up to 6 p.p."
              className="w-full h-auto"
              data-testid="img-intervention-impact"
            />
          </div>
        </div>
      </section>

      {/* Future of Selling Vision */}
      <section className="py-0">
        <img 
          src={futureSellingImage} 
          alt="The future of selling is not a better pitch deck. It's a better system. Trust everywhere. Proof everywhere. Performance that compounds."
          className="w-full h-auto"
          data-testid="img-future-selling"
        />
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Enter Platform Card */}
            <Card className="bg-gradient-to-br from-[#00634F] to-[#009B77] border-0 text-white overflow-hidden">
              <CardContent className="p-8 lg:p-12 flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                  <Building2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold mb-4">Enter the Platform</h3>
                <p className="text-white/80 mb-8 flex-grow">
                  Start managing accounts, tracking outcomes, and proving value with Loop's full capabilities.
                </p>
                <Link href="/accounts">
                  <Button 
                    size="lg" 
                    className="w-full bg-white text-[#00634F] hover:bg-white/90 font-semibold" 
                    data-testid="button-cta-platform"
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            {/* Tell the Story Card */}
            <Card className="bg-gradient-to-br from-[#00173B] to-[#005971] border-0 text-white overflow-hidden">
              <CardContent className="p-8 lg:p-12 flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold mb-4">Tell the Story</h3>
                <p className="text-white/80 mb-8 flex-grow">
                  Walk through the full narrative in 90 seconds—the buyer shift, the proof gap, and how Loop closes it.
                </p>
                <Link href="/presentation">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="w-full border-white text-white hover:bg-white/10 font-semibold" 
                    data-testid="button-cta-presentation"
                  >
                    View Presentation
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
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
                <p className="text-xs text-white/60">Loop</p>
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
