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
  Rocket,
  Search,
  Shield,
  Handshake,
  LineChart
} from "lucide-react";

import executiveImage from "@assets/GettyImages-551703701_1765967640588.jpg";
import buyerImage from "@assets/Picture38_1765967640589.png";

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
      bgClass: "bg-white",
      content: (
        <div className="flex flex-col lg:flex-row items-center justify-center h-full gap-8 lg:gap-16 px-8">
          <div className="flex-1 max-w-2xl">
            <div className="mb-6">
              <span className="text-[#A3238E] text-lg md:text-xl font-semibold tracking-wide">
                2027
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#00173B] leading-tight mb-6">
              You've got the best tech.
              <br />
              <span className="text-[#005971]">The smartest sellers.</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#929192] mb-8">
              So why isn't performance leaping forward?
            </p>
            <div className="flex items-center gap-3">
              <Puzzle className="w-7 h-7 text-[#A3238E]" />
              <span className="text-lg text-[#00173B]/80">That's the puzzle we're here to solve.</span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <img 
              src={executiveImage} 
              alt="Executive leader" 
              className="w-64 md:w-80 lg:w-96 h-auto rounded-2xl shadow-xl"
            />
          </div>
        </div>
      )
    },

    // Slide 2: The Buyer Has Changed
    {
      id: "buyer",
      title: "",
      bgClass: "bg-white",
      content: (
        <div className="flex flex-col lg:flex-row items-center justify-center h-full gap-8 lg:gap-16 px-8">
          <div className="flex-shrink-0 order-2 lg:order-1">
            <img 
              src={buyerImage} 
              alt="Modern buyer" 
              className="w-64 md:w-80 lg:w-96 h-auto rounded-2xl shadow-xl"
            />
          </div>
          <div className="flex-1 max-w-2xl order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#00173B] leading-tight mb-6">
              The Buyer Has Changed
            </h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Brain className="w-6 h-6 text-[#A3238E] mt-1 flex-shrink-0" />
                <p className="text-lg text-[#00173B]/80">
                  They use <span className="font-semibold text-[#005971]">AI to do their research</span>—and come more prepared than ever
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Search className="w-6 h-6 text-[#005971] mt-1 flex-shrink-0" />
                <p className="text-lg text-[#00173B]/80">
                  They want <span className="font-semibold text-[#00634F]">evidence of work done</span>—not promises
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-[#009B77] mt-1 flex-shrink-0" />
                <p className="text-lg text-[#00173B]/80">
                  They choose partners based on <span className="font-semibold text-[#009B77]">trust, credibility, and proof</span>
                </p>
              </div>
            </div>
            <div className="bg-[#00634F]/5 border-l-4 border-[#00634F] p-4 rounded-r-lg">
              <p className="text-[#00173B] font-medium">
                AI supports the buyer—but trust and evidence decide who they choose.
              </p>
            </div>
          </div>
        </div>
      )
    },

    // Slide 3: The Seller Must Rise
    {
      id: "seller",
      title: "",
      bgClass: "bg-white",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#00173B] leading-tight max-w-4xl mb-8">
            To build credibility with today's buyer,
            <br />
            <span className="text-[#005971]">the seller must transform.</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mt-8">
            <div className="bg-[#929192]/10 rounded-2xl p-8 border border-[#929192]/20">
              <div className="text-[#929192] text-sm uppercase tracking-wider mb-4">The Old Unit</div>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Users className="w-12 h-12 text-[#929192]" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-[#929192]">The Heroic Seller</h3>
              <p className="text-sm text-[#929192] mt-3">Charisma and relationships alone</p>
            </div>
            
            <div className="bg-gradient-to-br from-[#00634F]/10 to-[#005971]/10 rounded-2xl p-8 border-2 border-[#009B77]">
              <div className="text-[#009B77] text-sm uppercase tracking-wider mb-4">The New Unit</div>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Users className="w-10 h-10 text-[#00634F]" />
                <span className="text-2xl text-[#009B77]">+</span>
                <Brain className="w-10 h-10 text-[#A3238E]" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-[#00173B]">Seller + AI Orchestrator</h3>
              <p className="text-sm text-[#00173B]/70 mt-3">Evidence, stories, and data-driven trust</p>
            </div>
          </div>
        </div>
      )
    },

    // Slide 4: What Makes the Loop Tight
    {
      id: "loop",
      title: "",
      bgClass: "bg-white",
      content: (
        <div className="flex flex-col items-center justify-center h-full px-8">
          <div className="mb-6">
            <RefreshCcw className="w-14 h-14 text-[#009B77] mx-auto" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#00173B] leading-tight text-center max-w-4xl mb-4">
            What Makes the Loop Tight
          </h2>
          <p className="text-lg md:text-xl text-[#929192] max-w-3xl text-center mb-10">
            We embed customer knowledge and align it with outcomes Korn Ferry can deliver.
          </p>
          
          <div className="flex items-center justify-center gap-3 md:gap-6 flex-wrap max-w-5xl">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#00634F] flex items-center justify-center mb-2">
                <Search className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <span className="text-[#00173B] font-semibold text-sm">Understand</span>
              <span className="text-[#929192] text-xs">Their Strategy</span>
            </div>
            <ArrowRight className="w-6 h-6 text-[#009B77] hidden md:block" />
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#005971] flex items-center justify-center mb-2">
                <Target className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <span className="text-[#00173B] font-semibold text-sm">Align</span>
              <span className="text-[#929192] text-xs">Outcomes</span>
            </div>
            <ArrowRight className="w-6 h-6 text-[#009B77] hidden md:block" />
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#009B77] flex items-center justify-center mb-2">
                <Zap className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <span className="text-[#00173B] font-semibold text-sm">Deliver</span>
              <span className="text-[#929192] text-xs">Real Impact</span>
            </div>
            <ArrowRight className="w-6 h-6 text-[#009B77] hidden md:block" />
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#A3238E] flex items-center justify-center mb-2">
                <LineChart className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <span className="text-[#00173B] font-semibold text-sm">Track</span>
              <span className="text-[#929192] text-xs">KPIs & Evidence</span>
            </div>
          </div>

          <div className="mt-10 bg-gradient-to-r from-[#00634F]/10 via-[#005971]/10 to-[#009B77]/10 rounded-xl p-6 max-w-3xl border border-[#009B77]/30">
            <p className="text-[#00173B] text-center font-medium">
              Not "believe us, we're Korn Ferry"—but <span className="text-[#009B77] font-bold">hard evidence and tracked KPIs</span> that close the loop on every engagement.
            </p>
          </div>
        </div>
      )
    },

    // Slide 5: Why Commercial Effectiveness First
    {
      id: "pilot",
      title: "",
      bgClass: "bg-white",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <div className="mb-6">
            <BarChart3 className="w-12 h-12 text-[#005971] mx-auto" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#00173B] leading-tight max-w-4xl mb-4">
            Starting with Commercial Effectiveness
          </h2>
          <p className="text-lg md:text-xl text-[#929192] max-w-3xl mb-10">
            The easiest place to measure. Learn fast. Prove the loop works.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl">
            <div className="bg-[#00634F]/5 rounded-xl p-6 border border-[#00634F]/20">
              <Zap className="w-10 h-10 text-[#00634F] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[#00173B] mb-2">Fast Learning</h3>
              <p className="text-sm text-[#929192]">Immediate feedback loops on seller performance</p>
            </div>
            <div className="bg-[#005971]/5 rounded-xl p-6 border border-[#005971]/20">
              <Target className="w-10 h-10 text-[#005971] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[#00173B] mb-2">Measurable Impact</h3>
              <p className="text-sm text-[#929192]">Clear metrics that prove value delivered</p>
            </div>
            <div className="bg-[#A3238E]/5 rounded-xl p-6 border border-[#A3238E]/20">
              <RefreshCcw className="w-10 h-10 text-[#A3238E] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[#00173B] mb-2">Expandable Template</h3>
              <p className="text-sm text-[#929192]">Leadership, Transformation, Rewards next</p>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-2 text-[#929192]">
            <span>Once proven here</span>
            <ArrowRight className="w-5 h-5 text-[#009B77]" />
            <span className="text-[#00173B] font-semibold">Template for all Korn Ferry solutions</span>
          </div>
        </div>
      )
    },

    // Slide 6: What the Loop Delivers
    {
      id: "built",
      title: "",
      bgClass: "bg-white",
      content: (
        <div className="flex flex-col items-center justify-center h-full px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#00173B] leading-tight text-center max-w-4xl mb-10">
            What the Loop Delivers
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
            <div className="text-left bg-[#00634F]/5 rounded-xl p-6 border border-[#00634F]/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#00634F] flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#00173B]">AI-Powered Discovery</h3>
              </div>
              <p className="text-[#929192] text-sm">Customer research, strategic insights, and targeted questions—in minutes, not hours.</p>
            </div>
            
            <div className="text-left bg-[#005971]/5 rounded-xl p-6 border border-[#005971]/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#005971] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#00173B]">Outcome Alignment</h3>
              </div>
              <p className="text-[#929192] text-sm">Co-create measurable outcomes with clients. Every promise documented and trackable.</p>
            </div>
            
            <div className="text-left bg-[#009B77]/5 rounded-xl p-6 border border-[#009B77]/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#009B77] flex items-center justify-center">
                  <Handshake className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#00173B]">Seamless Handoff</h3>
              </div>
              <p className="text-[#929192] text-sm">Sales to delivery without losing context. Delivery tracks KPIs and closes the loop.</p>
            </div>
            
            <div className="text-left bg-[#A3238E]/5 rounded-xl p-6 border border-[#A3238E]/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#A3238E] flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#00173B]">Evidence-Driven Trust</h3>
              </div>
              <p className="text-[#929192] text-sm">Hard evidence of impact—not "believe us." Client-visible dashboards prove value.</p>
            </div>
          </div>
        </div>
      )
    },

    // Slide 7: The Vision - Closing
    {
      id: "vision",
      title: "",
      bgClass: "bg-gradient-to-br from-[#00634F] via-[#005971] to-[#00173B]",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <div className="mb-8">
            <Rocket className="w-14 h-14 text-[#05C690] mx-auto" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-5xl mb-8">
            The World's First
            <br />
            <span className="text-[#05C690]">Talent-to-Value Platform</span>
          </h2>
          
          <div className="max-w-3xl space-y-5 mt-6">
            <div className="flex items-center gap-4 text-left bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
              <CircleDot className="w-5 h-5 text-[#05C690] flex-shrink-0" />
              <p className="text-lg text-white">Selling excellence becomes <span className="text-[#05C690] font-semibold">consistent</span></p>
            </div>
            <div className="flex items-center gap-4 text-left bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
              <CircleDot className="w-5 h-5 text-[#05C690] flex-shrink-0" />
              <p className="text-lg text-white">Buyer trust becomes <span className="text-[#05C690] font-semibold">evidence-driven</span></p>
            </div>
            <div className="flex items-center gap-4 text-left bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
              <CircleDot className="w-5 h-5 text-[#05C690] flex-shrink-0" />
              <p className="text-lg text-white">Korn Ferry becomes <span className="text-[#05C690] font-semibold">essential infrastructure</span></p>
            </div>
          </div>
          
          <div className="mt-12 p-6 rounded-xl bg-white/15 backdrop-blur-sm border border-[#05C690]/40 max-w-2xl">
            <p className="text-xl md:text-2xl text-white font-medium">
              One trusted loop at a time.
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentSlideData = slides[currentSlide];
  const isLightBg = currentSlideData.bgClass === "bg-white";

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
            className={isLightBg ? "text-[#00173B]/70 hover:text-[#00173B] hover:bg-[#00173B]/10" : "text-white/70 hover:text-white hover:bg-white/10"}
            data-testid="button-home"
          >
            <Home className="w-5 h-5" />
          </Button>
        </Link>
        
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${isLightBg ? "text-[#929192]" : "text-white/50"}`}>
            {currentSlide + 1} / {slides.length}
          </span>
        </div>
      </header>

      {/* Main slide content */}
      <div 
        className="flex-1 flex flex-col p-8 pt-20 md:p-16 md:pt-24 overflow-y-auto"
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
          className={isLightBg 
            ? "text-[#00173B]/70 hover:text-[#00173B] hover:bg-[#00173B]/10 disabled:opacity-30" 
            : "text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30"
          }
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
                  ? "w-8 bg-[#009B77]" 
                  : isLightBg 
                    ? "bg-[#00173B]/20 hover:bg-[#00173B]/40" 
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
          className={isLightBg 
            ? "text-[#00173B]/70 hover:text-[#00173B] hover:bg-[#00173B]/10 disabled:opacity-30" 
            : "text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30"
          }
          data-testid="button-next-slide"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </footer>
    </div>
  );
}
