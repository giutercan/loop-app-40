import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useCompanion } from "@/components/AICompanionPanel";
import { cn } from "@/lib/utils";

function getContextType(location: string): string {
  if (location.includes("/discovery")) return "Discovery";
  if (location.includes("/alignment")) return "Alignment";
  if (location.includes("/realisation") || location.includes("/dashboard")) return "Realization";
  if (location.includes("/accounts/")) return "Account";
  if (location.includes("/projects/")) return "Initiative";
  return "Global";
}

function getContextColor(context: string): string {
  switch (context.toLowerCase()) {
    case "discovery":
      return "from-[#005971] to-[#0088a3]";
    case "alignment":
      return "from-[#A3238E] to-[#c44ab3]";
    case "realization":
      return "from-[#009B77] to-[#00c596]";
    case "account":
      return "from-[#00634F] to-[#009B77]";
    default:
      return "from-[#005971] to-[#A3238E]";
  }
}

export function LoopContextIndicator() {
  const { setIsOpen } = useCompanion();
  const [location] = useLocation();
  const contextType = getContextType(location);
  const gradientClass = getContextColor(contextType);
  
  return (
    <Button
      onClick={() => setIsOpen(true)}
      className={cn(
        "relative flex items-center gap-2 px-3 py-1.5 h-auto rounded-full shadow-md",
        "bg-gradient-to-r text-white font-medium text-sm",
        "transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
        gradientClass
      )}
      data-testid="button-loop-indicator"
    >
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-white/80 animate-pulse" />
        <Sparkles className="h-4 w-4" />
        <span className="font-semibold">The Loop</span>
        <span className="text-white/80">·</span>
        <span className="text-white/90">{contextType}</span>
      </div>
    </Button>
  );
}
