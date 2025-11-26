import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Building2, 
  Search, 
  TrendingUp, 
  Target, 
  Activity,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  Trash2,
  Pencil,
  Sparkles,
  BarChart3,
  Users,
  Zap
} from "lucide-react";
import { LogoEditDialog } from "@/components/LogoEditDialog";
import { CommandPaletteHint } from "@/components/CommandPalette";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AppTour } from "@/components/AppTour";
import emptyStateImage from "@assets/Picture35_1763994371581.jpg";

interface Project {
  id: number;
  companyName: string;
  companyLogoUrl: string | null;
  sector: string | null;
  currentPhase: "discovery" | "alignment" | "realisation";
  status: "active" | "completed" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

export default function ProjectsDashboard() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [editingLogoProject, setEditingLogoProject] = useState<Project | null>(null);
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (projectId: number) => {
      try {
        const response = await apiRequest("DELETE", `/api/projects/${projectId}`);
        const data = await response.json();
        if (!data.success) {
          throw new Error("Delete operation failed");
        }
        return data;
      } catch (error: any) {
        // Re-throw to ensure onError is triggered
        throw new Error(error.message || "Failed to delete project");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"], refetchType: 'active' });
      toast({
        title: "Project deleted",
        description: "The project has been successfully removed.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message || "Failed to delete the project. Please try again.",
      });
    },
  });

  // Track which projects we've already attempted to fetch logos for
  const attemptedLogosRef = useRef<Set<number>>(new Set());

  // Auto-fetch logos for projects that don't have them (runs once per project)
  useEffect(() => {
    const fetchMissingLogos = async () => {
      const projectsWithoutLogos = projects.filter(
        p => !p.companyLogoUrl && !attemptedLogosRef.current.has(p.id)
      );
      if (projectsWithoutLogos.length === 0) return;

      let updated = false;
      for (const project of projectsWithoutLogos) {
        attemptedLogosRef.current.add(project.id);
        try {
          const response = await apiRequest("POST", `/api/projects/${project.id}/fetch-logo`);
          const data = await response.json();
          if (data.updated) {
            updated = true;
          }
        } catch (error) {
          console.error(`Failed to fetch logo for project ${project.id}:`, error);
        }
      }

      // Refresh projects list if any logos were updated
      if (updated) {
        queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      }
    };

    if (projects.length > 0) {
      fetchMissingLogos();
    }
  }, [projects]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-16 lg:h-20 items-center justify-between">
            <Link 
              href="/" 
              className="flex items-center gap-3 hover-elevate rounded-lg px-2 py-1 -mx-2"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Korn Ferry</span>
                <p className="text-xs text-muted-foreground hidden lg:block">Value Lifecycle</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
              <CommandPaletteHint />
              <AppTour autoStart />
              <Button 
                size="lg" 
                className="shadow-lg shadow-primary/20" 
                data-testid="button-new-project"
                onClick={() => setLocation('/projects/new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/80">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 py-12 lg:py-16 relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Left: Title & Description */}
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white">
                    Client Engagements
                  </h1>
                  <p className="text-white/70 text-sm lg:text-base">
                    Manage value lifecycle across Discovery, Alignment & Realization
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Quick Stats */}
            <div className="flex flex-wrap gap-4 lg:gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/20 min-w-[120px]">
                <div className="flex items-center gap-2 text-white/70 text-xs font-medium mb-1">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Total
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-white">{projects.length}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/20 min-w-[120px]">
                <div className="flex items-center gap-2 text-white/70 text-xs font-medium mb-1">
                  <Zap className="w-3.5 h-3.5" />
                  Active
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-white">
                  {projects.filter(p => p.status === "active").length}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/20 min-w-[120px]">
                <div className="flex items-center gap-2 text-white/70 text-xs font-medium mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  New
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-white">
                  {projects.filter(p => {
                    const created = new Date(p.createdAt);
                    const now = new Date();
                    return created.getMonth() === now.getMonth() && 
                           created.getFullYear() === now.getFullYear();
                  }).length}
                </div>
              </div>
            </div>
          </div>

          {/* Phase Distribution Bar - Using Korn Ferry Brand Colors */}
          {projects.length > 0 && (
            <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-white/80">Phase Distribution</span>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#005971' }} />
                    <span className="text-white/70">Discovery</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#A3238E' }} />
                    <span className="text-white/70">Alignment</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#009B77' }} />
                    <span className="text-white/70">Realization</span>
                  </span>
                </div>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-white/10">
                {(() => {
                  const discovery = projects.filter(p => p.currentPhase === "discovery").length;
                  const alignment = projects.filter(p => p.currentPhase === "alignment").length;
                  const realisation = projects.filter(p => p.currentPhase === "realisation").length;
                  const total = projects.length;
                  return (
                    <>
                      {discovery > 0 && (
                        <div 
                          className="transition-all duration-500" 
                          style={{ width: `${(discovery / total) * 100}%`, backgroundColor: '#005971' }}
                        />
                      )}
                      {alignment > 0 && (
                        <div 
                          className="transition-all duration-500" 
                          style={{ width: `${(alignment / total) * 100}%`, backgroundColor: '#A3238E' }}
                        />
                      )}
                      {realisation > 0 && (
                        <div 
                          className="transition-all duration-500" 
                          style={{ width: `${(realisation / total) * 100}%`, backgroundColor: '#009B77' }}
                        />
                      )}
                    </>
                  );
                })()}
              </div>
              <div className="flex justify-between mt-2 text-xs text-white/60">
                <span>{projects.filter(p => p.currentPhase === "discovery").length} in Discovery</span>
                <span>{projects.filter(p => p.currentPhase === "alignment").length} in Alignment</span>
                <span>{projects.filter(p => p.currentPhase === "realisation").length} in Realization</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 lg:px-8 py-8 lg:py-12">
        <div className="space-y-8">

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <Card className="border-2 overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Left: Image */}
                  <div className="relative h-64 md:h-auto min-h-[400px]">
                    <img
                      src={emptyStateImage}
                      alt="Professional ready to start"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
                  </div>
                  
                  {/* Right: Content */}
                  <div className="flex flex-col items-center justify-center p-12 space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Briefcase className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-center space-y-3 max-w-md">
                      <h3 className="text-2xl font-bold">Ready to Start</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Create your first client engagement project and unlock AI-powered insights, strategic value alignment, and measurable outcomes.
                      </p>
                    </div>
                    <Button 
                      size="lg" 
                      className="shadow-lg shadow-primary/20"
                      data-testid="button-create-first-project"
                      onClick={() => setLocation('/projects/new')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Project
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card 
                  key={project.id} 
                  className="hover-elevate transition-all duration-300 group border-2 hover:border-primary/20"
                  data-testid={`card-project-${project.id}`}
                >
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div 
                          className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0 overflow-hidden group/logo cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingLogoProject(project);
                          }}
                          data-testid={`button-edit-logo-${project.id}`}
                        >
                          {project.companyLogoUrl ? (
                            <img 
                              src={project.companyLogoUrl} 
                              alt={`${project.companyName} logo`}
                              className="w-full h-full object-contain p-1"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                              }}
                              data-testid={`img-company-logo-${project.id}`}
                            />
                          ) : null}
                          <Building2 className={`w-5 h-5 text-primary ${project.companyLogoUrl ? 'hidden' : ''}`} />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                            <Pencil className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-lg font-bold truncate" data-testid={`text-company-name-${project.id}`}>
                            {project.companyName}
                          </CardTitle>
                          {project.sector && (
                            <CardDescription className="text-sm truncate">
                              {project.sector}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      
                      {/* Delete Button */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                            data-testid={`button-delete-project-${project.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Project</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{project.companyName}"? This action cannot be undone and will permanently remove all project data, including insights, hypotheses, and KPI tracking.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-testid={`button-cancel-delete-${project.id}`}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(project.id)}
                              disabled={deleteMutation.isPending}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              data-testid={`button-confirm-delete-${project.id}`}
                            >
                              {deleteMutation.isPending ? "Deleting..." : "Delete Project"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    {/* Phase Progress Stepper */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>Started {new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      {/* Visual Phase Stepper */}
                      <div className="relative">
                        {/* Progress Line */}
                        <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted" />
                        <div 
                          className="absolute top-4 left-4 h-0.5 bg-primary transition-all duration-500"
                          style={{
                            width: project.currentPhase === "discovery" ? "0%" :
                                   project.currentPhase === "alignment" ? "50%" : "100%"
                          }}
                        />
                        
                        {/* Phase Steps - Korn Ferry Brand Colors */}
                        <div className="relative flex justify-between">
                          {[
                            { id: "discovery", label: "Discovery", icon: Search, color: '#005971' },
                            { id: "alignment", label: "Alignment", icon: Target, color: '#A3238E' },
                            { id: "realisation", label: "Realization", icon: Activity, color: '#009B77' },
                          ].map((phase, index) => {
                            const phaseOrder = ["discovery", "alignment", "realisation"];
                            const currentIndex = phaseOrder.indexOf(project.currentPhase);
                            const isCompleted = index < currentIndex;
                            const isCurrent = phase.id === project.currentPhase;
                            const PhaseIcon = phase.icon;
                            
                            return (
                              <div key={phase.id} className="flex flex-col items-center">
                                <div 
                                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    isCompleted 
                                      ? "bg-primary text-primary-foreground"
                                      : !isCurrent
                                        ? "bg-muted text-muted-foreground"
                                        : ""
                                  }`}
                                  style={isCurrent ? { backgroundColor: phase.color, color: 'white', boxShadow: `0 0 0 4px ${phase.color}20` } : undefined}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : (
                                    <PhaseIcon className="w-4 h-4" />
                                  )}
                                </div>
                                <span className={`text-[10px] mt-1.5 font-medium ${
                                  isCurrent ? "text-foreground" : "text-muted-foreground"
                                }`}>
                                  {phase.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <Button 
                      className="w-full group-hover:shadow-lg transition-shadow" 
                      variant="outline"
                      data-testid={`button-open-project-${project.id}`}
                      onClick={() => setLocation(`/projects/${project.id}/discovery`)}
                    >
                      Open Project
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Logo Edit Dialog */}
      {editingLogoProject && (
        <LogoEditDialog
          open={!!editingLogoProject}
          onOpenChange={(open) => !open && setEditingLogoProject(null)}
          projectId={editingLogoProject.id}
          companyName={editingLogoProject.companyName}
          currentLogoUrl={editingLogoProject.companyLogoUrl}
        />
      )}
    </div>
  );
}
