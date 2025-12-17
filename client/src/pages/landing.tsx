import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Zap, TrendingUp, Sparkles } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/Picture6_1763994371580.jpg";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#00173B] flex flex-col">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="container mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">Korn Ferry</span>
              <span className="text-sm font-semibold text-[#009B77]">Loop</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/presentation">
                <Button 
                  variant="ghost" 
                  className="text-white/80 hover:text-white hover:bg-white/10"
                  data-testid="button-header-story"
                >
                  The Story
                </Button>
              </Link>
              <Link href="/accounts">
                <Button 
                  className="bg-[#00634F] hover:bg-[#009B77] text-white"
                  data-testid="button-header-enter"
                >
                  Enter Loop
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Screen */}
      <section className="relative flex-1 flex items-center justify-center min-h-screen overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#00173B]/60 via-[#00173B]/40 to-[#00173B]/90" />
        
        {/* Content */}
        <div className="relative z-10 container mx-auto max-w-5xl px-6 lg:px-12 text-center">
          <h1 className="text-5xl sm:text-7xl lg:text-[120px] font-bold text-white leading-[0.9] tracking-tight mb-8">
            PROVE<br />
            <span className="text-[#009B77]">MORE</span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed">
            AI everywhere. Impact invisible.<br />
            <span className="text-white">Until now.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/presentation">
              <Button 
                size="lg"
                variant="outline"
                className="px-10 py-7 text-lg font-semibold border-2 border-white text-white hover:bg-white hover:text-[#00173B] transition-all"
                data-testid="button-hero-story"
              >
                <Zap className="mr-2 w-5 h-5" />
                Tell the Story
              </Button>
            </Link>
            <Link href="/accounts">
              <Button 
                size="lg"
                className="px-10 py-7 text-lg font-semibold bg-[#00634F] hover:bg-[#009B77] text-white"
                data-testid="button-hero-enter"
              >
                Enter Loop
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards - Bottom Strip */}
      <section className="relative z-10 -mt-24">
        <div className="container mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            <Link href="/presentation">
              <div 
                className="bg-[#00634F] p-8 lg:p-12 hover:bg-[#009B77] transition-colors cursor-pointer group"
                data-testid="card-story"
              >
                <p className="text-xs uppercase tracking-widest text-white/60 mb-3">The Narrative</p>
                <h3 className="text-xl lg:text-2xl font-bold text-white leading-tight">
                  WHY PROOF<br />IS THE NEW PITCH
                </h3>
                <ArrowRight className="w-5 h-5 text-white/60 mt-4 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>
            
            <Link href="/accounts">
              <div 
                className="bg-[#005971] p-8 lg:p-12 hover:bg-[#00634F] transition-colors cursor-pointer group"
                data-testid="card-platform"
              >
                <p className="text-xs uppercase tracking-widest text-white/60 mb-3">The Platform</p>
                <h3 className="text-xl lg:text-2xl font-bold text-white leading-tight">
                  YOUR COMMERCIAL<br />OPERATING SYSTEM
                </h3>
                <ArrowRight className="w-5 h-5 text-white/60 mt-4 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>
            
            <div 
              className="bg-[#A3238E] p-8 lg:p-12"
              data-testid="card-vision"
            >
              <p className="text-xs uppercase tracking-widest text-white/60 mb-3">The Vision</p>
              <h3 className="text-xl lg:text-2xl font-bold text-white leading-tight">
                TRUST EVERYWHERE.<br />PROOF EVERYWHERE.
              </h3>
              <Sparkles className="w-5 h-5 text-white/60 mt-4" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#00173B] py-8 mt-auto">
        <div className="container mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#00634F] to-[#009B77] rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-white/60">Korn Ferry Loop</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/40">
              <Link href="/accounts" className="hover:text-white transition-colors">Accounts</Link>
              <Link href="/presentation" className="hover:text-white transition-colors">Presentation</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
