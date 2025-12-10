import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Sparkles } from "lucide-react";

// Custom Loop logo - modern infinity loop with Korn Ferry gradient
export function LoopLogo({ className, useGradient = false }: { className?: string; useGradient?: boolean }) {
  const gradientId = "loopGradient";
  
  return (
    <svg 
      viewBox="0 0 32 32" 
      fill="none" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {useGradient && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#005971" />
            <stop offset="50%" stopColor="#009B77" />
            <stop offset="100%" stopColor="#A3238E" />
          </linearGradient>
        </defs>
      )}
      {/* Modern infinity loop - flowing continuous path */}
      <path 
        d="M9.5 16C9.5 13.5 11.5 11 14.5 11C16.5 11 18 12 19.5 13.5L16 16L19.5 18.5C18 20 16.5 21 14.5 21C11.5 21 9.5 18.5 9.5 16Z"
        fill={useGradient ? `url(#${gradientId})` : "currentColor"}
      />
      <path 
        d="M22.5 16C22.5 18.5 20.5 21 17.5 21C15.5 21 14 20 12.5 18.5L16 16L12.5 13.5C14 12 15.5 11 17.5 11C20.5 11 22.5 13.5 22.5 16Z"
        fill={useGradient ? `url(#${gradientId})` : "currentColor"}
      />
      {/* Center connection point with glow effect */}
      <circle cx="16" cy="16" r="2.5" fill={useGradient ? "#A3238E" : "currentColor"} />
      <circle cx="16" cy="16" r="1.5" fill={useGradient ? "#05C690" : "currentColor"} opacity="0.9" />
    </svg>
  );
}

// Larger, more detailed logo for headers
export function LoopLogoBrand({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#005971" />
          <stop offset="40%" stopColor="#009B77" />
          <stop offset="100%" stopColor="#A3238E" />
        </linearGradient>
        <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#05C690" />
          <stop offset="100%" stopColor="#00ADBB" />
        </linearGradient>
      </defs>
      {/* Outer glow ring */}
      <circle cx="20" cy="20" r="18" stroke="url(#brandGradient)" strokeWidth="1.5" opacity="0.3" fill="none" />
      {/* Left loop */}
      <path 
        d="M11 20C11 16.5 13.5 13 17 13C19.5 13 21.5 14.5 23.5 16.5L20 20L23.5 23.5C21.5 25.5 19.5 27 17 27C13.5 27 11 23.5 11 20Z"
        fill="url(#brandGradient)"
      />
      {/* Right loop */}
      <path 
        d="M29 20C29 23.5 26.5 27 23 27C20.5 27 18.5 25.5 16.5 23.5L20 20L16.5 16.5C18.5 14.5 20.5 13 23 13C26.5 13 29 16.5 29 20Z"
        fill="url(#brandGradient)"
      />
      {/* Center spark */}
      <circle cx="20" cy="20" r="3" fill="#A3238E" />
      <circle cx="20" cy="20" r="2" fill="url(#glowGradient)" />
      <circle cx="20" cy="20" r="1" fill="white" opacity="0.8" />
    </svg>
  );
}

export function AppHeader() {
  const [location, navigate] = useLocation();
  
  const isLandingPage = location === "/" || location === "/welcome";
  const isCanvasPage = location === "/companion";
  
  if (isLandingPage) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity cursor-pointer" 
            onClick={() => navigate("/accounts")}
            data-testid="link-header-logo"
          >
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-semibold text-foreground text-sm">Korn Ferry</span>
              <span className="text-xs font-semibold bg-gradient-to-r from-secondary via-accent to-ai bg-clip-text text-transparent">Loop</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2" 
            onClick={() => navigate("/accounts")}
            data-testid="nav-accounts"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Accounts</span>
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={isCanvasPage ? "default" : "outline"}
            size="sm"
            className={`gap-2 ${
              isCanvasPage 
                ? "bg-gradient-to-r from-secondary to-ai text-white border-0" 
                : "border-ai/30 hover:border-ai/50 hover:bg-ai/5"
            }`}
            onClick={() => navigate("/companion")}
            data-testid="button-companion-canvas"
          >
            <Sparkles className={`w-4 h-4 ${isCanvasPage ? "text-white" : "text-ai"}`} />
            <span className="font-medium">Loop Canvas</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
