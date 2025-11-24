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
  Trash2
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import emptyStateImage from "@assets/Picture35_1763994371581.jpg";

interface Project {
  id: number;
  companyName: string;
  sector: string | null;
  currentPhase: "discovery" | "alignment" | "realisation";
  status: "active" | "completed" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

export default function ProjectsDashboard() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
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
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Projects</h1>
                <p className="text-muted-foreground">Manage client engagements across the value lifecycle</p>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-sm font-medium">Total Projects</CardDescription>
                <CardTitle className="text-3xl font-bold">{projects.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-sm font-medium">Active Engagements</CardDescription>
                <CardTitle className="text-3xl font-bold">
                  {projects.filter(p => p.status === "active").length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-sm font-medium">This Month</CardDescription>
                <CardTitle className="text-3xl font-bold">
                  {projects.filter(p => {
                    const created = new Date(p.createdAt);
                    const now = new Date();
                    return created.getMonth() === now.getMonth() && 
                           created.getFullYear() === now.getFullYear();
                  }).length}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

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
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-primary" />
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

                    {/* Phase Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>Started {new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={project.currentPhase === "discovery" ? "secondary" : "outline"} 
                          className="flex items-center gap-1.5"
                        >
                          <Search className="w-3 h-3" />
                          Discovery
                        </Badge>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <Badge 
                          variant={project.currentPhase === "alignment" ? "secondary" : "outline"} 
                          className="flex items-center gap-1.5"
                        >
                          <Target className="w-3 h-3" />
                          Alignment
                        </Badge>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <Badge 
                          variant={project.currentPhase === "realisation" ? "secondary" : "outline"} 
                          className="flex items-center gap-1.5"
                        >
                          <Activity className="w-3 h-3" />
                          Realization
                        </Badge>
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
    </div>
  );
}
