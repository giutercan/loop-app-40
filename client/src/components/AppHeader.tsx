import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Home, Building2, MessageSquarePlus } from "lucide-react";
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-secondary to-ai flex items-center justify-center">
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
          
          <Link href="/companion">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-accent/30 hover:border-accent/50 hover:bg-accent/5"
              data-testid="button-companion-canvas"
            >
              <MessageSquarePlus className="w-4 h-4 text-accent" />
              <span className="font-medium hidden sm:inline">Canvas</span>
            </Button>
          </Link>
          
          <Button
            onClick={() => setIsOpen(!isOpen)}
            variant={isOpen ? "default" : "outline"}
            size="sm"
            className={`gap-2 transition-all duration-300 ${
              isOpen 
                ? "bg-gradient-to-r from-secondary to-ai text-white border-0" 
                : "border-ai/30 hover:border-ai/50 hover:bg-ai/5"
            }`}
            data-testid="button-companion-trigger"
          >
            <Sparkles className={`w-4 h-4 ${isOpen ? "text-white" : "text-ai"}`} />
            <span className="font-medium">The Loop</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
