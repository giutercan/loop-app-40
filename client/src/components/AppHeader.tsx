import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Home, Building2 } from "lucide-react";
import { useCompanion } from "@/components/AICompanionPanel";

export function AppHeader() {
  const { isOpen, setIsOpen, accountId, projectId } = useCompanion();
  const [location] = useLocation();
  
  const isLandingPage = location === "/" || location === "/welcome";
  
  if (isLandingPage) return null;

  const getContextLabel = () => {
    if (projectId) return "Project Context Active";
    if (accountId) return "Account Context Active";
    return null;
  };

  const contextLabel = getContextLabel();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/accounts">
            <a className="flex items-center gap-2 hover:opacity-80 transition-opacity" data-testid="link-header-logo">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#005971] to-[#A3238E] flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-foreground hidden sm:inline">Korn Ferry</span>
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
          {contextLabel && (
            <Badge variant="outline" className="hidden md:flex text-xs text-muted-foreground border-muted">
              {contextLabel}
            </Badge>
          )}
          
          <Button
            onClick={() => setIsOpen(!isOpen)}
            variant={isOpen ? "default" : "outline"}
            size="sm"
            className={`gap-2 transition-all duration-300 ${
              isOpen 
                ? "bg-gradient-to-r from-[#005971] to-[#A3238E] text-white border-0 hover:from-[#00634F] hover:to-[#A3238E]" 
                : "border-[#A3238E]/30 hover:border-[#A3238E]/50 hover:bg-[#A3238E]/5"
            }`}
            data-testid="button-companion-trigger"
          >
            <Sparkles className={`w-4 h-4 ${isOpen ? "text-white" : "text-[#A3238E]"}`} />
            <span className="font-medium">The Loop</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
