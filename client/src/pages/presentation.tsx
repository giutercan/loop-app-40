import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Home,
  Target,
  Brain,
  Users,
  TrendingUp,
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BarChart3,
  RefreshCcw,
  CircleDot,
  Puzzle,
  Rocket
} from "lucide-react";

interface Slide {
  id: string;
  title: string;
  content: JSX.Element;
  bgClass: string;
}

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    // Slide 1: The Hook - 2027 Puzzle
    {
      id: "hook",
      title: "",
      bgClass: "bg-[#00173B]",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <div className="mb-8">
            <span className="text-[#05C690] text-xl md:text-2xl font-semibold tracking-wide">
              2027
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight max-w-5xl mb-8">
            You've got the best tech.
            <br />
            <span className="text-[#00ADBB]">The smartest sellers.</span>
            <br />
            <span className="text-[#929192]">So why isn't performance leaping forward?</span>
          </h1>
          <div className="mt-12 flex items-center gap-3">
            <Puzzle className="w-8 h-8 text-[#A3238E]" />
            <span className="text-xl text-white/80">That's the puzzle we're here to solve.</span>
          </div>
        </div>
      )
    },

    // Slide 2: The Shift - Buyers Changed
    {
      id: "shift",
      title: "",
      bgClass: "bg-gradient-to-br from-[#00634F] to-[#005971]",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-5xl mb-12">
            Buyers walk in armed with AI.
            <br />
            <span className="text-[#05C690]">They expect credibility and evidence.</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="text-[#929192] text-sm uppercase tracking-wider mb-4">The Old Unit</div>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Users className="w-12 h-12 text-white/60" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white/70">The Heroic Seller</h3>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 border-2 border-[#05C690]">
              <div className="text-[#05C690] text-sm uppercase tracking-wider mb-4">The New Unit</div>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Users className="w-10 h-10 text-white" />
                <span className="text-2xl text-[#05C690]">+</span>
                <Brain className="w-10 h-10 text-[#A3238E]" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white">Seller + AI Orchestrator</h3>
            </div>
          </div>
        </div>
      )
    },

    // Slide 3: The Loop - Our Solution
    {
      id: "loop",
      title: "",
      bgClass: "bg-[#00173B]",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <div className="mb-6">
            <RefreshCcw className="w-16 h-16 text-[#009B77] mx-auto" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-4xl mb-8">
            One Trusted Loop
          </h2>
          <p className="text-xl md:text-2xl text-[#929192] max-w-3xl mb-12">
            Aligning customer strategy with Korn Ferry's evidence-backed outcomes.
          </p>
          
          <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-[#00634F] flex items-center justify-center mb-3">
                <Target className="w-10 h-10 text-white" />
              </div>
              <span className="text-white font-semibold">Discover</span>
            </div>
            <ArrowRight className="w-8 h-8 text-[#05C690] hidden md:block" />
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-[#005971] flex items-center justify-center mb-3">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <span className="text-white font-semibold">Align</span>
            </div>
            <ArrowRight className="w-8 h-8 text-[#05C690] hidden md:block" />
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-[#009B77] flex items-center justify-center mb-3">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <span className="text-white font-semibold">Realize</span>
            </div>
            <ArrowRight className="w-8 h-8 text-[#05C690] hidden md:block" />
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-[#A3238E] flex items-center justify-center mb-3">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <span className="text-white font-semibold">Prove</span>
            </div>
          </div>
        </div>
      )
    },

    // Slide 4: Why Commercial Effectiveness First
    {
      id: "pilot",
      title: "",
      bgClass: "bg-gradient-to-br from-[#005971] to-[#00634F]",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <div className="mb-6">
            <BarChart3 className="w-14 h-14 text-[#8DC63F] mx-auto" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight max-w-4xl mb-6">
            Starting with Commercial Effectiveness
          </h2>
          <p className="text-xl md:text-2xl text-white/80 max-w-3xl mb-12">
            The easiest place to measure. Learn fast. Prove the loop works.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Zap className="w-10 h-10 text-[#8DC63F] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Fast Learning</h3>
              <p className="text-sm text-white/70">Immediate feedback loops on seller performance</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Target className="w-10 h-10 text-[#00ADBB] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Measurable Impact</h3>
              <p className="text-sm text-white/70">Clear metrics that prove value delivered</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <RefreshCcw className="w-10 h-10 text-[#A3238E] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Expandable Template</h3>
              <p className="text-sm text-white/70">Leadership, Transformation, Rewards next</p>
            </div>
          </div>
        </div>
      )
    },

    // Slide 5: What We've Built
    {
      id: "built",
      title: "",
      bgClass: "bg-[#00173B]",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight max-w-4xl mb-10">
            What the Loop Delivers
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
            <div className="text-left bg-gradient-to-br from-[#00634F]/30 to-[#005971]/30 rounded-xl p-6 border border-[#00634F]/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#00634F] flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">AI-Powered Discovery</h3>
              </div>
              <p className="text-white/70 text-sm">Company research, strategic insights, and targeted questions in minutes—not hours.</p>
            </div>
            
            <div className="text-left bg-gradient-to-br from-[#005971]/30 to-[#00634F]/30 rounded-xl p-6 border border-[#005971]/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#005971] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Outcome Alignment</h3>
              </div>
              <p className="text-white/70 text-sm">Co-create measurable outcomes with clients. Every promise documented and trackable.</p>
            </div>
            
            <div className="text-left bg-gradient-to-br from-[#009B77]/30 to-[#05C690]/30 rounded-xl p-6 border border-[#009B77]/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#009B77] flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Seamless Handoff</h3>
              </div>
              <p className="text-white/70 text-sm">Sales to delivery without losing context. No more "what did sales promise?"</p>
            </div>
            
            <div className="text-left bg-gradient-to-br from-[#A3238E]/30 to-[#005971]/30 rounded-xl p-6 border border-[#A3238E]/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#A3238E] flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Evidence-Driven Trust</h3>
              </div>
              <p className="text-white/70 text-sm">Track and prove ROI with client-visible dashboards. Renewals backed by data.</p>
            </div>
          </div>
        </div>
      )
    },

    // Slide 6: The Vision - Closing
    {
      id: "vision",
      title: "",
      bgClass: "bg-gradient-to-br from-[#00634F] via-[#005971] to-[#00173B]",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <div className="mb-8">
            <Rocket className="w-16 h-16 text-[#05C690] mx-auto" />
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-5xl mb-8">
            The World's First
            <br />
            <span className="text-[#05C690]">Talent-to-Value Platform</span>
          </h2>
          
          <div className="max-w-3xl space-y-6 mt-8">
            <div className="flex items-center gap-4 text-left">
              <CircleDot className="w-6 h-6 text-[#009B77] flex-shrink-0" />
              <p className="text-lg md:text-xl text-white/90">Selling excellence becomes <span className="text-[#05C690] font-semibold">consistent</span></p>
            </div>
            <div className="flex items-center gap-4 text-left">
              <CircleDot className="w-6 h-6 text-[#009B77] flex-shrink-0" />
              <p className="text-lg md:text-xl text-white/90">Buyer trust becomes <span className="text-[#05C690] font-semibold">evidence-driven</span></p>
            </div>
            <div className="flex items-center gap-4 text-left">
              <CircleDot className="w-6 h-6 text-[#009B77] flex-shrink-0" />
              <p className="text-lg md:text-xl text-white/90">Korn Ferry becomes <span className="text-[#05C690] font-semibold">essential infrastructure</span></p>
            </div>
          </div>
          
          <div className="mt-16 p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-[#05C690]/30 max-w-2xl">
            <p className="text-xl md:text-2xl text-white font-medium">
              One trusted loop at a time.
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentSlideData = slides[currentSlide];

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
    }
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    goToSlide(currentSlide + 1);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentSlide - 1);
  }, [currentSlide, goToSlide]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "Home") {
        goToSlide(0);
      } else if (e.key === "End") {
        goToSlide(slides.length - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, goToSlide, slides.length]);

  return (
    <div className={`min-h-screen flex flex-col ${currentSlideData.bgClass} transition-all duration-500`}>
      {/* Minimal header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between">
        <Link href="/accounts">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white/70 hover:text-white hover:bg-white/10"
            data-testid="button-home"
          >
            <Home className="w-5 h-5" />
          </Button>
        </Link>
        
        <div className="flex items-center gap-2">
          <span className="text-white/50 text-sm font-medium">
            {currentSlide + 1} / {slides.length}
          </span>
        </div>
      </header>

      {/* Main slide content */}
      <div 
        className="flex-1 flex flex-col p-8 md:p-16 overflow-y-auto"
        data-testid={`slide-${currentSlideData.id}`}
      >
        {currentSlideData.content}
      </div>

      {/* Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30"
          data-testid="button-prev-slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        {/* Slide dots */}
        <div className="flex items-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide 
                  ? "w-8 bg-[#05C690]" 
                  : "bg-white/30 hover:bg-white/50"
              }`}
              data-testid={`button-slide-dot-${index}`}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30"
          data-testid="button-next-slide"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </footer>
    </div>
  );
}
