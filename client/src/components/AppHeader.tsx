import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Sparkles } from "lucide-react";

// Custom Loop logo - infinity-inspired connected circles
function LoopLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 32 32" 
      fill="none" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Two connected loops forming an infinity-like shape */}
      <path 
        d="M8 16C8 12.686 10.686 10 14 10C15.5 10 16.5 10.5 17.5 11.5L14.5 14.5C14.5 14.5 14 14 13.5 14C12.119 14 11 15.119 11 16.5C11 17.881 12.119 19 13.5 19C14 19 14.5 18.5 14.5 18.5L17.5 21.5C16.5 22.5 15.5 23 14 23C10.686 23 8 20.314 8 17V16Z"
        fill="currentColor"
      />
      <path 
        d="M24 16C24 19.314 21.314 22 18 22C16.5 22 15.5 21.5 14.5 20.5L17.5 17.5C17.5 17.5 18 18 18.5 18C19.881 18 21 16.881 21 15.5C21 14.119 19.881 13 18.5 13C18 13 17.5 13.5 17.5 13.5L14.5 10.5C15.5 9.5 16.5 9 18 9C21.314 9 24 11.686 24 15V16Z"
        fill="currentColor"
      />
      {/* Central connection spark */}
      <circle cx="16" cy="16" r="2" fill="currentColor" opacity="0.8"/>
    </svg>
  );
}

export function AppHeader() {
  const [location] = useLocation();
  
  const isLandingPage = location === "/" || location === "/welcome";
  const isCanvasPage = location === "/companion";
  
  if (isLandingPage) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/accounts">
            <a className="flex items-center gap-2 hover:opacity-80 transition-opacity" data-testid="link-header-logo">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-secondary to-ai flex items-center justify-center">
                <LoopLogo className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="font-semibold text-foreground text-sm">Korn Ferry</span>
                <span className="text-xs text-ai font-medium">Loop</span>
              </div>
            </a>
          </Link>
          <Link href="/accounts">
            <Button variant="ghost" size="sm" className="gap-2" data-testid="nav-accounts">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Accounts</span>
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/companion">
            <Button
              variant={isCanvasPage ? "default" : "outline"}
              size="sm"
              className={`gap-2 ${
                isCanvasPage 
                  ? "bg-gradient-to-r from-secondary to-ai text-white border-0" 
                  : "border-ai/30 hover:border-ai/50 hover:bg-ai/5"
              }`}
              data-testid="button-companion-canvas"
            >
              <Sparkles className={`w-4 h-4 ${isCanvasPage ? "text-white" : "text-ai"}`} />
              <span className="font-medium">Loop Canvas</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
