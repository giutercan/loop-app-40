import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Target, 
  TrendingUp, 
  ChevronRight, 
  Home,
  Building2
} from "lucide-react";

interface ProjectPhaseNavProps {
  projectId: number;
  projectName: string;
  currentPhase: "discovery" | "alignment" | "realisation";
}

export default function ProjectPhaseNav({ 
  projectId, 
  projectName, 
  currentPhase 
}: ProjectPhaseNavProps) {
  const phases = [
    {
      id: "discovery" as const,
      label: "Discovery",
      icon: Search,
      path: `/projects/${projectId}/discovery`,
    },
    {
      id: "alignment" as const,
      label: "Alignment",
      icon: Target,
      path: `/projects/${projectId}/alignment`,
    },
    {
      id: "realisation" as const,
      label: "Realization",
      icon: TrendingUp,
      path: `/projects/${projectId}/realisation`,
    },
  ];

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-4 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 py-3 text-sm">
          <Link 
            href="/projects"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover-elevate active-elevate-2"
            data-testid="breadcrumb-projects"
          >
            <Home className="w-4 h-4" />
            Projects
          </Link>
          
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium" data-testid="breadcrumb-project-name">
              {projectName}
            </span>
          </div>
        </div>

        {/* Phase Navigation Tabs */}
        <div className="flex items-center gap-2 pb-2 overflow-x-auto">
          {phases.map((phase, index) => {
            const Icon = phase.icon;
            const isActive = currentPhase === phase.id;
            
            return (
              <Link 
                key={phase.id} 
                href={phase.path}
                className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow hover:bg-primary/90' 
                    : 'hover-elevate active-elevate-2'
                }`}
                data-testid={`nav-phase-${phase.id}`}
              >
                <Icon className="w-4 h-4" />
                {phase.label}
                {isActive && (
                  <Badge 
                    variant="secondary" 
                    className="ml-1 bg-primary-foreground/20 text-primary-foreground text-xs px-1.5"
                  >
                    Current
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
