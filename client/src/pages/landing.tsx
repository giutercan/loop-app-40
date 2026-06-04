import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Sparkles } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/Picture6_1763994371580.jpg";
import { GitHubExportDialog } from "@/components/github-export-dialog";

export default function Landing() {
  return (
    <div className="h-screen bg-[#00173B] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="container mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">Korn Ferry</span>
              <span className="text-sm font-semibold text-[#009B77]">Loop</span>
            </div>
            <div className="flex items-center gap-3">
              <GitHubExportDialog />
              <Link href="/presentation">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white/80 hover:text-white hover:bg-white/10"
                  data-testid="button-header-story"
                >
                  The Story
                </Button>
              </Link>
              <Link href="/accounts">
                <Button 
                  size="sm"
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

      {/* Hero Section - Takes remaining space */}
      <section className="relative flex-1 flex flex-col">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#00173B]/70 via-[#00173B]/50 to-[#00173B]" />
        
        {/* Main Content - Centered */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="container mx-auto max-w-5xl px-6 lg:px-12 text-center">
            <h1 className="text-4xl sm:text-6xl lg:text-8xl xl:text-[100px] font-bold text-white leading-[0.9] tracking-tight mb-6">
              CLOSE<br />
              <span className="text-[#009B77]">THE LOOP</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-white/80 max-w-xl mx-auto mb-8 leading-relaxed">
              Because outcomes matter.<br />
              <span className="text-white">And now you can prove them.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/presentation">
                <Button 
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-base font-semibold border-2 border-white text-white hover:bg-white hover:text-[#00173B] transition-all"
                  data-testid="button-hero-story"
                >
                  <Zap className="mr-2 w-4 h-4" />
                  Tell the Story
                </Button>
              </Link>
              <Link href="/accounts">
                <Button 
                  size="lg"
                  className="px-8 py-6 text-base font-semibold bg-[#00634F] hover:bg-[#009B77] text-white"
                  data-testid="button-hero-enter"
                >
                  Enter Loop
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Feature Cards - Bottom of viewport */}
        <div className="relative z-10 pb-8">
          <div className="container mx-auto max-w-5xl px-6 lg:px-12">
            <div className="grid grid-cols-3 gap-px bg-white/10">
              <Link href="/presentation" className="block">
                <div 
                  className="bg-[#00634F] p-6 h-28 flex flex-col justify-between hover:bg-[#009B77] transition-colors cursor-pointer group"
                  data-testid="card-story"
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/60 mb-1">The Narrative</p>
                    <h3 className="text-sm lg:text-base font-bold text-white leading-snug">
                      WHY PROOF IS THE NEW PITCH
                    </h3>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/60 group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>
              
              <Link href="/accounts" className="block">
                <div 
                  className="bg-[#005971] p-6 h-28 flex flex-col justify-between hover:bg-[#00634F] transition-colors cursor-pointer group"
                  data-testid="card-platform"
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/60 mb-1">The Platform</p>
                    <h3 className="text-sm lg:text-base font-bold text-white leading-snug">
                      YOUR COMMERCIAL OS
                    </h3>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/60 group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>
              
              <div 
                className="bg-[#A3238E] p-6 h-28 flex flex-col justify-between"
                data-testid="card-vision"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/60 mb-1">The Vision</p>
                  <h3 className="text-sm lg:text-base font-bold text-white leading-snug">
                    TRUST & PROOF EVERYWHERE
                  </h3>
                </div>
                <Sparkles className="w-4 h-4 text-white/60" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
