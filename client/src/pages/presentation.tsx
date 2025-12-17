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
  Rocket,
  Search,
  Shield,
  Handshake,
  LineChart,
  AlertTriangle,
  Activity,
  MessageSquare
} from "lucide-react";

import executiveImage from "@assets/GettyImages-551703701_1765967640588.jpg";
import buyerImage from "@assets/Picture38_1765967640589.png";
import paradoxImage from "@assets/image_1765968794671.png";
import interventionImpactImage from "@assets/Screenshot_2025-12-17_112244_1765970588779.png";

interface Slide {
  id: string;
  content: JSX.Element;
}

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    // Slide 1: The Future of Buying
    {
      id: "buying",
      content: (
        <div className="relative h-full w-full overflow-hidden">
          {/* Background image with overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${buyerImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#00173B]/95 via-[#00173B]/80 to-transparent pointer-events-none" />
          
          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-end px-8 md:px-16">
            <div className="max-w-2xl text-right">
              <p className="text-[#05C690] text-sm md:text-base uppercase tracking-widest mb-4">
                The Real Shift
              </p>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                The future of selling<br/>
                <span className="text-[#929192]">starts with understanding</span><br/>
                <span className="text-[#00ADBB]">the future of buying.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-xl">
                Buyers arrive AI-prepared, skeptical, and impatient. They don't need information—they need <span className="text-[#05C690] font-semibold">credibility, evidence, and a conversation that builds confidence.</span>
              </p>
            </div>
          </div>
        </div>
      )
    },

    // Slide 2: The Paradox
    {
      id: "paradox",
      content: (
        <div className="relative h-full w-full overflow-hidden">
          {/* Background image with overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${paradoxImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#00173B]/95 via-[#00173B]/85 to-transparent pointer-events-none" />
          
          {/* Content on the left */}
          <div className="relative z-10 h-full flex items-center px-8 md:px-16">
            <div className="max-w-xl">
              <p className="text-[#A3238E] text-sm uppercase tracking-widest mb-4">
                The Paradox
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                AI everywhere.<br/>
                <span className="text-[#929192]">Invisible impact.</span>
              </h2>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                  <Activity className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span className="text-white">Activity inflation—more noise, not signal</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <span className="text-white">Inconsistent execution across reps</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                  <RefreshCcw className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <span className="text-white">Method decay under pressure</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                  <BarChart3 className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <span className="text-white">Made-up KPIs they can't prove</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                  <MessageSquare className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <span className="text-white">Unproven resources, generic conversations</span>
                </div>
              </div>

              <div className="bg-[#005971]/30 border border-[#00ADBB]/50 rounded-lg p-4">
                <p className="text-white font-medium">
                  From the CRO's view: <span className="text-[#05C690]">motion without lift.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 3: The CRO's Question
    {
      id: "cro",
      content: (
        <div className="relative h-full w-full overflow-hidden">
          {/* Background image with overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${executiveImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#00173B]/95 via-[#00173B]/85 to-[#00173B]/40 pointer-events-none" />
          
          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-start px-8 md:px-16">
            <div className="max-w-2xl text-left">
              <p className="text-[#00ADBB] text-sm uppercase tracking-widest mb-4">
                The Real Question
              </p>
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-8">
                "I have the tech.<br/>
                I have the people.<br/>
                <span className="text-[#05C690]">What's actually broken?"</span>
              </h2>
              <div className="space-y-3 text-white/80 text-lg">
                <p>Is it the GTM motion?</p>
                <p>The process?</p>
                <p>Seller behaviours?</p>
                <p className="text-[#05C690] font-medium">Or a leadership system not ready for AI?</p>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 4: The Unit of Performance Changed
    {
      id: "unit",
      content: (
        <div className="h-full flex flex-col items-center justify-center px-8 bg-white">
          <div className="max-w-4xl text-center">
            <p className="text-[#A3238E] text-sm uppercase tracking-widest mb-6">
              The Shift
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-[#00173B] leading-tight mb-10">
              The unit of performance changed.
            </h2>
            
            <div className="flex items-center justify-center gap-6 md:gap-12 mb-12">
              <div className="text-center">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#929192]/20 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-10 h-10 md:w-12 md:h-12 text-[#929192]" />
                </div>
                <p className="text-[#929192] font-medium">Heroic Seller</p>
                <p className="text-xs text-[#929192]">"They just knew"</p>
              </div>
              
              <ArrowRight className="w-8 h-8 text-[#009B77]" />
              
              <div className="text-center">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#00634F] to-[#005971] flex items-center justify-center mx-auto mb-3">
                  <div className="flex items-center gap-1">
                    <Users className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    <span className="text-white text-lg">+</span>
                    <Brain className="w-6 h-6 md:w-7 md:h-7 text-[#05C690]" />
                  </div>
                </div>
                <p className="text-[#00173B] font-semibold">Team + AI</p>
                <p className="text-xs text-[#929192]">Scales beyond heroics</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#00634F]/10 to-[#005971]/10 rounded-xl p-6 max-w-2xl mx-auto border border-[#009B77]/20">
              <p className="text-[#00173B] font-medium mb-4">The seller becomes the orchestrator of trust:</p>
              <div className="flex flex-wrap justify-center gap-3">
                <span className="bg-white px-3 py-1 rounded-full text-sm border border-[#00634F]/30 text-[#00634F]">Judgement</span>
                <span className="bg-white px-3 py-1 rounded-full text-sm border border-[#005971]/30 text-[#005971]">Influence</span>
                <span className="bg-white px-3 py-1 rounded-full text-sm border border-[#009B77]/30 text-[#009B77]">Navigating complexity</span>
                <span className="bg-white px-3 py-1 rounded-full text-sm border border-[#A3238E]/30 text-[#A3238E]">Closing</span>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 5: The Missing Piece - Proof
    {
      id: "proof",
      content: (
        <div className="h-full flex flex-col items-center justify-center px-8 bg-[#00173B]">
          <div className="max-w-4xl text-center">
            <Shield className="w-14 h-14 text-[#A3238E] mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
              If you can't prove what moved,<br/>
              <span className="text-[#929192]">you can't scale it.</span>
            </h2>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10">
              Most organisations see activity, but debate impact. Renewals depend on who tells the best story—not what evidence shows.
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto border border-[#05C690]/30">
              <p className="text-white text-lg">
                In the era of AI-powered buying, <span className="text-[#05C690] font-bold">credibility is earned, not claimed.</span>
              </p>
            </div>

            <p className="mt-10 text-xl text-[#00ADBB] font-medium">
              What would a commercial system look like that produces proof continuously?
            </p>
          </div>
        </div>
      )
    },

    // Slide 6: The Loop - Commercial OS
    {
      id: "loop",
      content: (
        <div className="h-full flex flex-col items-center justify-center px-8 bg-white">
          <div className="max-w-5xl w-full">
            <div className="text-center mb-10">
              <p className="text-[#009B77] text-sm uppercase tracking-widest mb-4">
                The Answer
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#00173B] leading-tight mb-4">
                Commercial Operating System + The Loop
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="bg-[#00634F]/5 rounded-xl p-6 border border-[#00634F]/20 text-center">
                <div className="w-12 h-12 rounded-full bg-[#00634F] flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-[#00173B] mb-2">Success Frame</h3>
                <p className="text-sm text-[#929192]">3-5 KPIs the CRO/CFO actually runs the business on. One small scoreboard everyone agrees on.</p>
              </div>
              
              <div className="bg-[#005971]/5 rounded-xl p-6 border border-[#005971]/20 text-center">
                <div className="w-12 h-12 rounded-full bg-[#005971] flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-[#00173B] mb-2">Flow-of-Work Enablement</h3>
                <p className="text-sm text-[#929192]">AI embedded in moments that matter. Method reinforced in the moment—not in training decks.</p>
              </div>
              
              <div className="bg-[#009B77]/5 rounded-xl p-6 border border-[#009B77]/20 text-center">
                <div className="w-12 h-12 rounded-full bg-[#009B77] flex items-center justify-center mx-auto mb-4">
                  <RefreshCcw className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-[#00173B] mb-2">The Closed Loop</h3>
                <p className="text-sm text-[#929192]">Baseline → change → shift → KPI impact → new baseline. Continuous evidence sponsors can defend.</p>
              </div>
            </div>

            {/* Loop visualization */}
            <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
              <span className="bg-[#00634F] text-white px-4 py-2 rounded-lg text-sm font-medium">Baseline</span>
              <ArrowRight className="w-5 h-5 text-[#929192]" />
              <span className="bg-[#005971] text-white px-4 py-2 rounded-lg text-sm font-medium">What Changed</span>
              <ArrowRight className="w-5 h-5 text-[#929192]" />
              <span className="bg-[#009B77] text-white px-4 py-2 rounded-lg text-sm font-medium">KPI Shift</span>
              <ArrowRight className="w-5 h-5 text-[#929192]" />
              <span className="bg-[#A3238E] text-white px-4 py-2 rounded-lg text-sm font-medium">New Baseline</span>
              <RefreshCcw className="w-5 h-5 text-[#009B77]" />
            </div>
          </div>
        </div>
      )
    },

    // Slide 7: Why Commercial Effectiveness First
    {
      id: "why",
      content: (
        <div className="h-full flex flex-col items-center justify-center px-8 bg-gradient-to-br from-[#00634F] to-[#005971]">
          <div className="max-w-4xl text-center">
            <BarChart3 className="w-12 h-12 text-[#05C690] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
              Why start with Commercial Effectiveness?
            </h2>
            <p className="text-lg text-white/80 mb-10">
              It's the fastest proving ground.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                <CheckCircle2 className="w-5 h-5 text-[#05C690] flex-shrink-0" />
                <span className="text-white">Metrics are clean</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                <CheckCircle2 className="w-5 h-5 text-[#05C690] flex-shrink-0" />
                <span className="text-white">Urgency is sponsor-owned</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                <CheckCircle2 className="w-5 h-5 text-[#05C690] flex-shrink-0" />
                <span className="text-white">Outcomes tie to revenue</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                <CheckCircle2 className="w-5 h-5 text-[#05C690] flex-shrink-0" />
                <span className="text-white">Forces hardest discipline</span>
              </div>
            </div>

            <div className="mt-10 p-4 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 max-w-xl mx-auto">
              <p className="text-white">
                Once the loop works here, it becomes a <span className="text-[#05C690] font-bold">template for all outcomes</span>—leadership, transformation, rewards.
              </p>
            </div>
          </div>
        </div>
      )
    },

    // Slide 8: Close - From Intervention to Impact
    {
      id: "close",
      content: (
        <div className="h-full w-full flex items-center justify-center p-6" style={{ backgroundColor: '#e8e4dc' }}>
          <img 
            src={interventionImpactImage} 
            alt="From Intervention to Impact: A System for Driving Client KPIs"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )
    }
  ];

  const currentSlideData = slides[currentSlide];
  
  // Determine if current slide has light or dark background for navigation styling
  const darkBgSlides = ["buying", "paradox", "cro", "proof", "why"];
  const isDarkBg = darkBgSlides.includes(currentSlideData.id);

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
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Minimal header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between">
        <Link href="/accounts">
          <Button 
            variant="ghost" 
            size="icon" 
            className={isDarkBg ? "text-white/70 hover:text-white hover:bg-white/10" : "text-[#00173B]/70 hover:text-[#00173B] hover:bg-[#00173B]/10"}
            data-testid="button-home"
          >
            <Home className="w-5 h-5" />
          </Button>
        </Link>
        
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${isDarkBg ? "text-white/50" : "text-[#929192]"}`}>
            {currentSlide + 1} / {slides.length}
          </span>
        </div>
      </header>

      {/* Main slide content */}
      <div 
        className="flex-1 overflow-hidden"
        data-testid={`slide-${currentSlideData.id}`}
      >
        {currentSlideData.content}
      </div>

      {/* Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={isDarkBg 
            ? "text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30" 
            : "text-[#00173B]/70 hover:text-[#00173B] hover:bg-[#00173B]/10 disabled:opacity-30"
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
                  : isDarkBg 
                    ? "bg-white/30 hover:bg-white/50" 
                    : "bg-[#00173B]/20 hover:bg-[#00173B]/40"
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
          className={isDarkBg 
            ? "text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30" 
            : "text-[#00173B]/70 hover:text-[#00173B] hover:bg-[#00173B]/10 disabled:opacity-30"
          }
          data-testid="button-next-slide"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </footer>
    </div>
  );
}
