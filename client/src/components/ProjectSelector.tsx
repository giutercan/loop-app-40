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
  DialogFooter,
} from "@/components/ui/dialog";
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
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    name: "",
    companyName: "",
    sector: "",
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const createProjectMutation = useMutation({
    mutationFn: async (project: typeof newProject) => {
      const res = await apiRequest("POST", "/api/projects", project);
      return await res.json();
    },
    onSuccess: (data: Project) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsCreating(false);
      setNewProject({ name: "", companyName: "", sector: "" });
      toast({
        title: "Project created",
        description: `${data.name} has been created successfully.`,
      });
      if (onProjectChange) {
        onProjectChange(data);
      }
      setLocation(`/discovery?project=${data.id}`);
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
      const res = await apiRequest("DELETE", `/api/projects/${projectId}`, {});
      return await res.json();
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setProjectToDelete(null);
      toast({
        title: "Project deleted",
        description: "Project has been permanently deleted.",
      });
      // If the deleted project was the current one, navigate away
      if (currentProjectId === deletedId) {
        setLocation("/");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
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

  return (
    <div className="flex items-center gap-2">
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

      {currentProjectId && (
        <Dialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
          <DialogTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                const project = projects.find(p => p.id === currentProjectId);
                if (project) setProjectToDelete(project);
              }}
              data-testid="button-delete-project"
              title="Delete project"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          {projectToDelete && (
            <DialogContent data-testid="dialog-delete-confirmation">
              <DialogHeader>
                <DialogTitle>Delete Project</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{projectToDelete.name}"? This action cannot be undone and will delete all associated data.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setProjectToDelete(null)}
                  data-testid="button-cancel-delete"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteProjectMutation.mutate(projectToDelete.id)}
                  disabled={deleteProjectMutation.isPending}
                  data-testid="button-confirm-delete"
                >
                  {deleteProjectMutation.isPending ? "Deleting..." : "Delete Project"}
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
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
    </div>
  );
}
