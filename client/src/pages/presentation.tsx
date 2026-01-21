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
  MessageSquare,
  Layers,
  Workflow,
  ArrowDown,
  Repeat2,
  Database
} from "lucide-react";

import executiveImage from "@assets/GettyImages-551703701_1765967640588.jpg";
import buyerImage from "@assets/Picture38_1765967640589.png";
import paradoxImage from "@assets/image_1765968794671.png";
import sellerImage from "@assets/image_1768493517409.png";

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
            <div className="max-w-3xl text-right">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                The future of selling<br/>
                <span className="text-[#00ADBB]">starts with the buyer.</span>
              </h1>
              
              {/* Key message - the shift */}
              <p className="text-xl md:text-2xl text-white font-medium mb-6">
                Today's buyers arrive:
              </p>

              {/* Buyer state - visual icons with clear labels */}
              <div className="flex items-center justify-end gap-6 mb-10">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#00ADBB]/20 border-2 border-[#00ADBB] flex items-center justify-center mb-2">
                    <Brain className="w-7 h-7 md:w-8 md:h-8 text-[#00ADBB]" />
                  </div>
                  <span className="text-sm text-white font-medium">AI-prepared</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#A3238E]/20 border-2 border-[#A3238E] flex items-center justify-center mb-2">
                    <Shield className="w-7 h-7 md:w-8 md:h-8 text-[#A3238E]" />
                  </div>
                  <span className="text-sm text-white font-medium">Skeptical</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#8DC63F]/20 border-2 border-[#8DC63F] flex items-center justify-center mb-2">
                    <TrendingUp className="w-7 h-7 md:w-8 md:h-8 text-[#8DC63F]" />
                  </div>
                  <span className="text-sm text-white font-medium">Under pressure</span>
                </div>
              </div>

              {/* Trust equation - simplified */}
              <div className="bg-[#005971]/40 backdrop-blur-sm rounded-xl p-5 border border-[#00ADBB]/30 max-w-xl ml-auto">
                <p className="text-lg md:text-xl text-white mb-3">
                  Trust comes from:
                </p>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-[#05C690] font-bold text-lg">Coherence</span>
                  <span className="text-white">+</span>
                  <span className="text-[#05C690] font-bold text-lg">Consistency</span>
                  <span className="text-white">+</span>
                  <span className="text-[#05C690] font-bold text-lg">Proof</span>
                </div>
              </div>
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
                  <Activity className="w-5 h-5 text-[#A3238E] flex-shrink-0" />
                  <span className="text-white">More activity, but less signal</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                  <AlertTriangle className="w-5 h-5 text-[#8DC63F] flex-shrink-0" />
                  <span className="text-white">Inconsistent execution across reps</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                  <RefreshCcw className="w-5 h-5 text-[#00ADBB] flex-shrink-0" />
                  <span className="text-white">Methods that decay under pressure</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                  <BarChart3 className="w-5 h-5 text-[#009B77] flex-shrink-0" />
                  <span className="text-white">KPIs that sound plausible but can't be proven</span>
                </div>
              </div>

              <div className="bg-[#005971]/30 border border-[#00ADBB]/50 rounded-lg p-4 mb-4">
                <p className="text-white font-medium">
                  From the CRO's view: <span className="text-[#05C690]">motion without lift.</span>
                </p>
              </div>

              <p className="text-white/90 text-lg">
                The quiet casualty? <span className="text-[#00ADBB] font-medium">Human judgment under pressure.</span>
              </p>
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
                The CRO's Moment
              </p>
              
              {/* What I have - visual pills */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm border border-white/20">Salesforce</span>
                <span className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm border border-white/20">Enablement</span>
                <span className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm border border-white/20">AI pilots</span>
                <span className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm border border-white/20">Good people</span>
              </div>

              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-8">
                <span className="text-[#05C690]">"What's actually broken?"</span>
              </h2>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <span className="text-white/80 text-lg">GTM motion?</span>
                <span className="text-white/50">|</span>
                <span className="text-white/80 text-lg">Process?</span>
                <span className="text-white/50">|</span>
                <span className="text-white/80 text-lg">Seller behaviour?</span>
              </div>

              <div className="bg-[#005971]/30 border border-[#00ADBB]/50 rounded-lg p-4">
                <p className="text-white">
                  Or a system <span className="text-[#00ADBB] font-medium">never designed for AI-level complexity?</span>
                </p>
                <p className="text-white/80 text-sm mt-2">
                  We've quietly made the seller role impossible.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 4: The Impossible Job
    {
      id: "impossible",
      content: (
        <div className="relative h-full w-full overflow-hidden">
          {/* Background image with overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${sellerImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#00173B]/70 to-[#00173B]/95 pointer-events-none" />
          
          {/* Content on left side */}
          <div className="relative z-10 h-full flex items-center justify-start px-8 md:px-16">
            <div className="max-w-lg text-left">
              <p className="text-[#A3238E] text-sm uppercase tracking-widest mb-4">
                The Impossible Job
              </p>
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-8">
                We turned the seller role<br/>
                <span className="text-[#929192]">into an impossible job.</span>
              </h2>
              
              {/* Icon-based visual - what we ask sellers to do */}
              <p className="text-white/70 text-sm mb-4">We ask sellers to be everything:</p>
              <div className="flex flex-wrap gap-3 mb-8">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <Search className="w-4 h-4 text-[#8DC63F]" />
                  <span className="text-white text-sm">Research</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <Handshake className="w-4 h-4 text-[#00ADBB]" />
                  <span className="text-white text-sm">Relationships</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <Target className="w-4 h-4 text-[#A3238E]" />
                  <span className="text-white text-sm">Method</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <MessageSquare className="w-4 h-4 text-[#009B77]" />
                  <span className="text-white text-sm">Proposals</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <BarChart3 className="w-4 h-4 text-[#05C690]" />
                  <span className="text-white text-sm">Reporting</span>
                </div>
              </div>

              {/* Tension statement */}
              <div className="bg-[#005971]/40 border border-[#00ADBB]/50 rounded-lg p-4">
                <p className="text-white">
                  When pressure hits, <span className="text-[#05C690] font-medium">trust-building gives way first.</span>
                </p>
                <p className="text-white/70 text-sm mt-2">
                  The system pulls judgment away from where it matters most.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 5: The Unit of Performance Changed
    {
      id: "unit",
      content: (
        <div className="h-full flex flex-col items-center justify-center px-8 bg-white">
          <div className="max-w-4xl text-center">
            <p className="text-[#A3238E] text-sm uppercase tracking-widest mb-4">
              The Shift
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-[#00173B] leading-tight mb-8">
              The unit of performance changed.
            </h2>
            
            {/* Visual transformation */}
            <div className="flex items-center justify-center gap-4 md:gap-8 mb-8">
              {/* Old: Heroic Seller - faded */}
              <div className="text-center opacity-50">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#929192]/20 border-2 border-dashed border-[#929192]/40 flex items-center justify-center mx-auto mb-2">
                  <Users className="w-8 h-8 md:w-10 md:h-10 text-[#929192]" />
                </div>
                <p className="text-[#929192] text-sm font-medium">Heroic Seller</p>
                <p className="text-xs text-[#929192]/70">"They just knew"</p>
              </div>
              
              <ArrowRight className="w-6 h-6 md:w-8 md:h-8 text-[#009B77]" />
              
              {/* New: Team + AI - vibrant */}
              <div className="text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#00634F] to-[#005971] flex items-center justify-center mx-auto mb-2 shadow-lg">
                  <div className="flex items-center gap-1">
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    <span className="text-white text-sm">+</span>
                    <Brain className="w-5 h-5 md:w-6 md:h-6 text-[#05C690]" />
                  </div>
                </div>
                <p className="text-[#00173B] font-semibold text-sm">Team + AI</p>
              </div>

              <ArrowRight className="w-6 h-6 md:w-8 md:h-8 text-[#009B77]" />

              {/* Result: Orchestrator of Trust */}
              <div className="text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#A3238E] to-[#00634F] flex items-center justify-center mx-auto mb-2 shadow-lg ring-2 ring-[#05C690]/30">
                  <Handshake className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <p className="text-[#00173B] font-bold text-sm">Orchestrator</p>
                <p className="text-xs text-[#A3238E]">of Trust</p>
              </div>
            </div>

            {/* What only humans do - icon pills */}
            <p className="text-[#929192] text-sm mb-4">What only humans do still matters most:</p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <div className="flex items-center gap-2 bg-[#00634F]/10 px-4 py-2 rounded-full border border-[#00634F]/30">
                <Brain className="w-4 h-4 text-[#00634F]" />
                <span className="text-[#00634F] font-medium text-sm">Judgment</span>
              </div>
              <div className="flex items-center gap-2 bg-[#005971]/10 px-4 py-2 rounded-full border border-[#005971]/30">
                <Users className="w-4 h-4 text-[#005971]" />
                <span className="text-[#005971] font-medium text-sm">Influence</span>
              </div>
              <div className="flex items-center gap-2 bg-[#009B77]/10 px-4 py-2 rounded-full border border-[#009B77]/30">
                <CircleDot className="w-4 h-4 text-[#009B77]" />
                <span className="text-[#009B77] font-medium text-sm">Navigating complexity</span>
              </div>
              <div className="flex items-center gap-2 bg-[#A3238E]/10 px-4 py-2 rounded-full border border-[#A3238E]/30">
                <CheckCircle2 className="w-4 h-4 text-[#A3238E]" />
                <span className="text-[#A3238E] font-medium text-sm">Closing</span>
              </div>
            </div>

            {/* Closing tension */}
            <div className="bg-[#00173B] rounded-xl p-5 max-w-2xl mx-auto">
              <p className="text-white">
                But the system around the seller has to change —
              </p>
              <p className="text-[#929192] text-sm mt-1">
                or that judgment gets <span className="text-[#00ADBB]">diluted</span>, <span className="text-[#00ADBB]">inconsistent</span>, and eventually <span className="text-[#00ADBB]">exhausted</span>.
              </p>
            </div>
          </div>
        </div>
      )
    },

    // Slide 6: The Missing Piece - Proof
    {
      id: "proof",
      content: (
        <div className="h-full flex flex-col items-center justify-center px-8 bg-[#00173B]">
          <div className="max-w-4xl text-center">
            <p className="text-[#A3238E] text-sm uppercase tracking-widest mb-4">
              The Credibility Gap
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-8">
              If you can't prove what moved,<br/>
              <span className="text-[#929192]">you can't scale it.</span>
            </h2>
            
            {/* Activity vs Impact visual */}
            <div className="flex items-center justify-center gap-6 md:gap-12 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 border-2 border-[#929192]/50 flex items-center justify-center mx-auto mb-2">
                  <Activity className="w-8 h-8 md:w-10 md:h-10 text-[#929192]" />
                </div>
                <p className="text-white font-medium text-sm">Activity</p>
                <p className="text-[#929192] text-xs">Visible</p>
              </div>
              
              <div className="text-[#929192] text-2xl">vs</div>
              
              <div className="text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 border-2 border-dashed border-[#A3238E]/50 flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-[#A3238E]" />
                </div>
                <p className="text-white font-medium text-sm">Impact</p>
                <p className="text-[#A3238E] text-xs">Arguable</p>
              </div>
            </div>

            {/* What you must prove */}
            <p className="text-white/70 text-sm mb-4">If you can't show:</p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-[#05C690]/40">
                <RefreshCcw className="w-4 h-4 text-[#05C690]" />
                <span className="text-white text-sm">What changed</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-[#00ADBB]/40">
                <ArrowRight className="w-4 h-4 text-[#00ADBB]" />
                <span className="text-white text-sm">What shifted</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-[#8DC63F]/40">
                <LineChart className="w-4 h-4 text-[#8DC63F]" />
                <span className="text-white text-sm">What moved the number</span>
              </div>
            </div>

            {/* Consequences */}
            <div className="flex justify-center gap-4 mb-8">
              <span className="text-[#929192] text-sm">You can't <span className="text-white font-medium">scale it</span></span>
              <span className="text-[#929192]">|</span>
              <span className="text-[#929192] text-sm">You can't <span className="text-white font-medium">defend it at renewal</span></span>
            </div>

            {/* Credibility closing */}
            <div className="bg-[#005971]/30 border border-[#00ADBB]/50 rounded-xl p-5 max-w-xl mx-auto">
              <p className="text-white text-lg">
                In this era, <span className="text-[#05C690] font-bold">credibility is earned, not claimed.</span>
              </p>
            </div>
          </div>
        </div>
      )
    },

    // Slide 7: The Loop - Commercial OS
    {
      id: "loop",
      content: (
        <div className="h-full flex flex-col items-center justify-center px-8 bg-white">
          <div className="max-w-5xl w-full">
            <div className="text-center mb-6">
              <p className="text-[#009B77] text-sm uppercase tracking-widest mb-3">
                The Answer
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#00173B] leading-tight mb-3">
                Commercial Operating System + The Loop
              </h2>
              {/* Dismissal */}
              <div className="flex justify-center gap-4 mb-2">
                <span className="text-[#929192] text-sm line-through">Not a tool</span>
                <span className="text-[#929192]">|</span>
                <span className="text-[#929192] text-sm line-through">Not automation theatre</span>
              </div>
            </div>
            
            {/* Three parts - streamlined */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#00634F]/5 rounded-xl p-5 border border-[#00634F]/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#00634F] flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-[#00173B]">Success Frame</h3>
                </div>
                <p className="text-sm text-[#929192]">3-5 KPIs. One scoreboard everyone agrees on.</p>
              </div>
              
              <div className="bg-[#005971]/5 rounded-xl p-5 border border-[#005971]/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#005971] flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-[#00173B]">Flow-of-Work</h3>
                </div>
                <p className="text-sm text-[#929192]">AI at moments that matter. Method in the work.</p>
              </div>
              
              <div className="bg-[#009B77]/5 rounded-xl p-5 border border-[#009B77]/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#009B77] flex items-center justify-center flex-shrink-0">
                    <RefreshCcw className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-[#00173B]">The Closed Loop</h3>
                </div>
                <p className="text-sm text-[#929192]">Evidence that compounds, not decays.</p>
              </div>
            </div>

            {/* Loop visualization - circular representation */}
            <div className="bg-[#00173B] rounded-xl p-5 mb-6">
              <p className="text-white/70 text-xs uppercase tracking-widest text-center mb-4">The Closed Loop</p>
              <div className="relative">
                {/* Main flow */}
                <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
                  <div className="flex items-center gap-2 bg-[#00634F] text-white px-4 py-2 rounded-full text-sm font-medium">
                    <CircleDot className="w-4 h-4" />
                    <span>Baseline</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#929192]" />
                  <div className="flex items-center gap-2 bg-[#005971] text-white px-4 py-2 rounded-full text-sm font-medium">
                    <RefreshCcw className="w-4 h-4" />
                    <span>Change</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#929192]" />
                  <div className="flex items-center gap-2 bg-[#A3238E] text-white px-4 py-2 rounded-full text-sm font-medium">
                    <Users className="w-4 h-4" />
                    <span>Behavior Shift</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#929192]" />
                  <div className="flex items-center gap-2 bg-[#009B77] text-white px-4 py-2 rounded-full text-sm font-medium">
                    <TrendingUp className="w-4 h-4" />
                    <span>KPI Impact</span>
                  </div>
                </div>
                {/* Loop back arrow */}
                <div className="flex items-center justify-center mt-4">
                  <div className="flex items-center gap-3 bg-[#8DC63F]/20 border border-[#8DC63F]/50 px-6 py-2 rounded-full">
                    <RefreshCcw className="w-5 h-5 text-[#8DC63F]" />
                    <span className="text-[#8DC63F] text-sm font-medium">New Baseline feeds back</span>
                    <ArrowRight className="w-4 h-4 text-[#8DC63F] rotate-180" />
                  </div>
                </div>
              </div>
            </div>

            {/* Closing punch */}
            <div className="text-center">
              <p className="text-[#00173B]">
                Not perfect attribution. <span className="font-bold text-[#009B77]">Disciplined evidence sponsors can defend.</span>
              </p>
            </div>
          </div>
        </div>
      )
    },

    // Slide 8: Why Commercial Effectiveness First
    {
      id: "why",
      content: (
        <div className="h-full flex flex-col items-center justify-center px-8 bg-white">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-8">
              <p className="text-[#A3238E] text-sm uppercase tracking-widest mb-3">
                The Starting Point
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#00173B] leading-tight mb-2">
                Why start with Commercial Effectiveness?
              </h2>
              <p className="text-[#929192]">The fastest proving ground.</p>
            </div>
            
            {/* 3 Visual pillars */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00634F] to-[#009B77] flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <p className="font-bold text-[#00173B]">Clean Metrics</p>
                <p className="text-sm text-[#929192]">Numbers that don't lie</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#005971] to-[#00ADBB] flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <p className="font-bold text-[#00173B]">Sponsor-Owned Urgency</p>
                <p className="text-sm text-[#929192]">Real accountability</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A3238E] to-[#8DC63F] flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <p className="font-bold text-[#00173B]">Ties to Revenue</p>
                <p className="text-sm text-[#929192]">Direct line to results</p>
              </div>
            </div>

            {/* Tension point */}
            <div className="bg-[#00173B] rounded-xl p-4 mb-8 text-center">
              <p className="text-white">
                This is where <span className="text-[#A3238E] font-bold">discipline breaks first</span> under pressure.
              </p>
            </div>

            {/* Template expansion */}
            <div className="text-center">
              <p className="text-[#929192] text-sm mb-4">Once the loop works here, it becomes a template for:</p>
              <div className="flex flex-wrap justify-center gap-3">
                <div className="flex items-center gap-2 bg-[#00634F]/10 px-5 py-2 rounded-full border border-[#00634F]/30">
                  <Users className="w-4 h-4 text-[#00634F]" />
                  <span className="text-[#00634F] font-medium">Leadership</span>
                </div>
                <div className="flex items-center gap-2 bg-[#005971]/10 px-5 py-2 rounded-full border border-[#005971]/30">
                  <RefreshCcw className="w-4 h-4 text-[#005971]" />
                  <span className="text-[#005971] font-medium">Transformation</span>
                </div>
                <div className="flex items-center gap-2 bg-[#A3238E]/10 px-5 py-2 rounded-full border border-[#A3238E]/30">
                  <Sparkles className="w-4 h-4 text-[#A3238E]" />
                  <span className="text-[#A3238E] font-medium">Rewards</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 9: Close - The Future of Selling
    {
      id: "close",
      content: (
        <div className="h-full flex flex-col items-center justify-center px-8 bg-gradient-to-br from-[#00173B] via-[#00173B] to-[#00634F]">
          <div className="max-w-4xl text-center">
            {/* Bold opening */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3">
              The future of selling
            </h2>
            <p className="text-xl md:text-2xl text-[#929192] mb-8">
              is not a better pitch deck.
            </p>
            
            <p className="text-2xl md:text-3xl text-[#05C690] font-bold mb-10">
              It's a better system.
            </p>

            {/* Visual system elements */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-full border border-white/20">
                <Layers className="w-5 h-5 text-[#8DC63F]" />
                <span className="text-white font-medium">One method</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-full border border-white/20">
                <MessageSquare className="w-5 h-5 text-[#00ADBB]" />
                <span className="text-white font-medium">One language</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-full border border-white/20">
                <Workflow className="w-5 h-5 text-[#A3238E]" />
                <span className="text-white font-medium">Embedded in the flow</span>
              </div>
            </div>

            {/* The loop visual */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <RefreshCcw className="w-6 h-6 text-[#05C690]" />
                <p className="text-white">A closed loop that turns every intervention into <span className="text-[#05C690] font-bold">measurable lift</span></p>
              </div>
              <p className="text-white/80">— and every lift into <span className="text-[#8DC63F] font-bold">learning</span>.</p>
            </div>

            {/* Power closing */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <div className="flex items-center gap-2 bg-[#009B77] px-4 py-2 rounded-full">
                <Shield className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">Trust everywhere</span>
              </div>
              <div className="flex items-center gap-2 bg-[#00ADBB] px-4 py-2 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">Proof everywhere</span>
              </div>
              <div className="flex items-center gap-2 bg-[#A3238E] px-4 py-2 rounded-full">
                <TrendingUp className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">Performance that compounds</span>
              </div>
            </div>

            {/* Final punch */}
            <p className="text-2xl md:text-3xl text-white font-bold">
              That's the <span className="text-[#05C690]">Loop</span>.
            </p>
          </div>
        </div>
      )
    },

    // Slide 10: Where Customer Journeys Break
    {
      id: "handoff",
      content: (
        <div className="h-full flex flex-col items-center justify-center px-8 bg-[#00173B]">
          <div className="max-w-5xl w-full">
            <div className="text-center mb-8">
              <p className="text-[#A3238E] text-sm uppercase tracking-widest mb-4">
                The Handoff Problem
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Where most customer journeys break
              </h2>
              <p className="text-xl text-[#929192]">
                The handoff from sales to delivery is where context, intent, and trust are usually lost.
              </p>
            </div>

            {/* Loop Flow Visual */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/10">
              <div className="flex flex-col items-center">
                {/* The circular flow */}
                <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap mb-6">
                  <div className="flex items-center gap-2 bg-[#009B77] text-white px-5 py-3 rounded-full text-sm font-medium shadow-lg">
                    <Users className="w-5 h-5" />
                    <span>Customer</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <ArrowRight className="w-6 h-6 text-[#929192]" />
                    <span className="text-xs text-[#929192]/70 mt-1">Engages</span>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-[#00ADBB] text-white px-5 py-3 rounded-full text-sm font-medium shadow-lg">
                    <Target className="w-5 h-5" />
                    <span>Sales</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <ArrowRight className="w-6 h-6 text-[#A3238E]" />
                    <span className="text-xs text-[#A3238E] mt-1 font-medium">Handoff</span>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-[#8DC63F] text-white px-5 py-3 rounded-full text-sm font-medium shadow-lg">
                    <Handshake className="w-5 h-5" />
                    <span>Delivery / CS</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <ArrowRight className="w-6 h-6 text-[#929192]" />
                    <span className="text-xs text-[#929192]/70 mt-1">Serves</span>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-[#009B77] text-white px-5 py-3 rounded-full text-sm font-medium shadow-lg">
                    <Users className="w-5 h-5" />
                    <span>Customer</span>
                  </div>
                </div>

                {/* Breakpoint indicators - phrases by the arrows */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
                  <div className="flex items-center gap-3 bg-[#A3238E]/20 border border-[#A3238E]/40 rounded-lg px-4 py-3">
                    <AlertTriangle className="w-5 h-5 text-[#A3238E] flex-shrink-0" />
                    <span className="text-white text-sm">Customer repeats themselves</span>
                  </div>
                  <div className="flex items-center gap-3 bg-[#A3238E]/20 border border-[#A3238E]/40 rounded-lg px-4 py-3">
                    <AlertTriangle className="w-5 h-5 text-[#A3238E] flex-shrink-0" />
                    <span className="text-white text-sm">Delivery doesn't know why we sold this</span>
                  </div>
                  <div className="flex items-center gap-3 bg-[#A3238E]/20 border border-[#A3238E]/40 rounded-lg px-4 py-3">
                    <AlertTriangle className="w-5 h-5 text-[#A3238E] flex-shrink-0" />
                    <span className="text-white text-sm">Success becomes reactive instead of intentional</span>
                  </div>
                </div>
              </div>
            </div>

            {/* The Loop Reframing */}
            <div className="bg-gradient-to-r from-[#00634F]/30 to-[#009B77]/30 border border-[#05C690]/50 rounded-xl p-6 text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Database className="w-6 h-6 text-[#05C690]" />
                <h3 className="text-xl font-bold text-white">The Loop Reframing</h3>
              </div>
              <p className="text-lg text-white mb-4">
                The Loop creates a <span className="text-[#05C690] font-bold">single, shared source of truth</span> — from first conversation to value realization.
              </p>
            </div>

            {/* Closing statement */}
            <div className="flex justify-center gap-4">
              <div className="flex items-center gap-2 bg-[#009B77] px-5 py-3 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span className="text-white font-medium">Same context</span>
              </div>
              <div className="flex items-center gap-2 bg-[#00ADBB] px-5 py-3 rounded-full">
                <Target className="w-5 h-5 text-white" />
                <span className="text-white font-medium">Same outcomes</span>
              </div>
              <div className="flex items-center gap-2 bg-[#8DC63F] px-5 py-3 rounded-full">
                <Repeat2 className="w-5 h-5 text-white" />
                <span className="text-white font-medium">No rework</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentSlideData = slides[currentSlide];
  
  // Determine if current slide has light or dark background for navigation styling
  const darkBgSlides = ["buying", "paradox", "cro", "proof", "why", "close", "handoff"];
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
