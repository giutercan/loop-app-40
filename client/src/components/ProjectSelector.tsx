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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Building2 } from "lucide-react";
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
