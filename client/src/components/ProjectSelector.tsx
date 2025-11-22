import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Building2, Trash2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Project } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface ProjectSelectorProps {
  currentProjectId?: number;
  onProjectChange?: (project: Project) => void;
}

export default function ProjectSelector({ currentProjectId, onProjectChange }: ProjectSelectorProps) {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [pendingProject, setPendingProject] = useState<any>(null);
  const [companyLogo, setCompanyLogo] = useState<string>("");
  const [newProject, setNewProject] = useState({
    name: "",
    companyName: "",
    businessUnit: "",
    sector: "",
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const verifyCompanyMutation = useMutation({
    mutationFn: async (companyName: string) => {
      const res = await apiRequest("POST", "/api/verify-company", { companyName });
      return await res.json();
    },
    onSuccess: (data: { logoUrl: string }) => {
      setCompanyLogo(data.logoUrl);
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (project: typeof newProject) => {
      const res = await apiRequest("POST", "/api/projects", project);
      return await res.json();
    },
    onSuccess: (data: Project) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setPendingProject(data);
      setIsCreating(false);
      
      // Fetch company logo for verification
      verifyCompanyMutation.mutate(data.companyName);
      setIsVerifying(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: number) => {
      await apiRequest("DELETE", `/api/projects/${projectId}`, {});
    },
    onSuccess: (_, deletedProjectId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project deleted",
        description: "The project has been permanently deleted.",
      });
      
      // If we just deleted the current project, redirect to home
      if (currentProjectId === deletedProjectId) {
        setLocation("/");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleProjectChange = (projectId: string) => {
    const project = projects.find(p => p.id === parseInt(projectId));
    if (project) {
      if (onProjectChange) {
        onProjectChange(project);
      }
      setLocation(`/discovery?project=${project.id}`);
    }
  };

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/projects/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  const handleCreateProject = () => {
    if (!newProject.name || !newProject.companyName) {
      toast({
        title: "Validation error",
        description: "Project name and company name are required.",
        variant: "destructive",
      });
      return;
    }
    createProjectMutation.mutate(newProject);
  };

  const handleConfirmCompany = () => {
    if (pendingProject) {
      // Update project with logo URL
      updateProjectMutation.mutate({
        id: pendingProject.id,
        data: { companyLogoUrl: companyLogo }
      });

      setIsVerifying(false);
      setNewProject({ name: "", companyName: "", businessUnit: "", sector: "" });
      setPendingProject(null);
      setCompanyLogo("");
      
      toast({
        title: "Project created",
        description: `${pendingProject.name} has been created successfully.`,
      });
      
      if (onProjectChange) {
        onProjectChange(pendingProject);
      }
      setLocation(`/discovery?project=${pendingProject.id}`);
    }
  };

  const handleCorrectCompany = () => {
    // Delete the pending project and go back to creation
    if (pendingProject) {
      deleteProjectMutation.mutate(pendingProject.id);
      setIsVerifying(false);
      setPendingProject(null);
      setCompanyLogo("");
      setIsCreating(true);
    }
  };

  const currentProject = projects.find(p => p.id === currentProjectId);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 min-w-[300px]">
        <Building2 className="w-5 h-5 text-muted-foreground" />
        <Select value={currentProjectId?.toString()} onValueChange={handleProjectChange}>
          <SelectTrigger data-testid="select-project">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id.toString()}>
                {project.name} - {project.companyName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {currentProjectId && currentProject && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              size="icon" 
              variant="outline"
              data-testid="button-delete-project"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{currentProject.name}" for {currentProject.companyName}? 
                This action cannot be undone and will permanently delete all associated data including discovery notes, 
                value hypotheses, KPIs, and financial projections.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteProjectMutation.mutate(currentProjectId)}
                disabled={deleteProjectMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete"
              >
                {deleteProjectMutation.isPending ? "Deleting..." : "Delete Project"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogTrigger asChild>
          <Button size="icon" variant="outline" data-testid="button-new-project">
            <Plus className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Start a new value lifecycle engagement
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                placeholder="e.g., Leadership Development Initiative"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                data-testid="input-project-name"
              />
            </div>
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="e.g., Acme Corporation"
                value={newProject.companyName}
                onChange={(e) => setNewProject({ ...newProject, companyName: e.target.value })}
                data-testid="input-company-name"
              />
            </div>
            <div>
              <Label htmlFor="businessUnit">Business Unit (Optional)</Label>
              <Input
                id="businessUnit"
                placeholder="e.g., Cloud Services Division"
                value={newProject.businessUnit}
                onChange={(e) => setNewProject({ ...newProject, businessUnit: e.target.value })}
                data-testid="input-business-unit"
              />
            </div>
            <div>
              <Label htmlFor="sector">Sector (Optional)</Label>
              <Input
                id="sector"
                placeholder="e.g., Technology & Enterprise Software"
                value={newProject.sector}
                onChange={(e) => setNewProject({ ...newProject, sector: e.target.value })}
                data-testid="input-sector"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsCreating(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateProject}
                disabled={createProjectMutation.isPending}
                data-testid="button-create"
              >
                {createProjectMutation.isPending ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Company Verification Dialog */}
      <Dialog open={isVerifying} onOpenChange={setIsVerifying}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Company</DialogTitle>
            <DialogDescription>
              Is this the correct company for {pendingProject?.companyName}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-center p-6 bg-muted/30 rounded-lg">
              {verifyCompanyMutation.isPending ? (
                <div className="text-sm text-muted-foreground">Loading company logo...</div>
              ) : companyLogo ? (
                <img 
                  src={companyLogo} 
                  alt={`${pendingProject?.companyName} logo`}
                  className="max-h-32 max-w-full object-contain"
                  onError={(e) => {
                    // Fallback if logo fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = 
                      '<div class="text-sm text-muted-foreground">No logo found</div>';
                  }}
                  data-testid="img-company-logo"
                />
              ) : (
                <div className="text-sm text-muted-foreground">No logo found</div>
              )}
            </div>
            
            <div className="text-center">
              <p className="font-medium">{pendingProject?.companyName}</p>
              {pendingProject?.businessUnit && (
                <p className="text-sm text-muted-foreground">{pendingProject.businessUnit}</p>
              )}
              {pendingProject?.sector && (
                <p className="text-sm text-muted-foreground">{pendingProject.sector}</p>
              )}
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={handleConfirmCompany}
                disabled={updateProjectMutation.isPending}
                data-testid="button-confirm-company"
              >
                Yes, this is correct
              </Button>
              <Button
                variant="outline"
                onClick={handleCorrectCompany}
                disabled={deleteProjectMutation.isPending}
                data-testid="button-correct-company"
              >
                No, let me correct it
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
