import { useState, useEffect } from "react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Building2, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Project } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Debounced company search
  useEffect(() => {
    if (companySearchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search-companies?query=${encodeURIComponent(companySearchQuery)}`);
        const data = await response.json();
        setSearchResults(data || []);
      } catch (error) {
        console.error("Error searching companies:", error);
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [companySearchQuery]);

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
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    {project.companyLogoUrl ? (
                      <>
                        <img 
                          src={project.companyLogoUrl} 
                          alt={project.companyName}
                          className="w-5 h-5 object-contain rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <Building2 className="w-4 h-4 text-muted-foreground hidden" />
                      </>
                    ) : (
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <span>{project.name} - {project.companyName}</span>
                </div>
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
              <AlertDialogTitle>Delete Initiative</AlertDialogTitle>
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
                {deleteProjectMutation.isPending ? "Deleting..." : "Delete Initiative"}
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
            <DialogTitle>Create New Initiative</DialogTitle>
            <DialogDescription>
              Start a new value loop engagement
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="projectName">Initiative Name</Label>
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
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between font-normal"
                    data-testid="button-company-search"
                  >
                    {newProject.companyName || "Search for a company..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput 
                      placeholder="Type to search companies..." 
                      value={companySearchQuery}
                      onValueChange={setCompanySearchQuery}
                      data-testid="input-company-search"
                    />
                    <CommandList>
                      <CommandEmpty>
                        {companySearchQuery.length < 2 
                          ? "Type at least 2 characters to search" 
                          : "No companies found"}
                      </CommandEmpty>
                      {searchResults.length > 0 && (
                        <CommandGroup>
                          {searchResults.map((company) => (
                            <CommandItem
                              key={company.domain}
                              value={company.name}
                              onSelect={(currentValue) => {
                                setNewProject({ ...newProject, companyName: company.name });
                                setOpenCombobox(false);
                                setCompanySearchQuery("");
                              }}
                              data-testid={`company-option-${company.domain}`}
                            >
                              <div className="flex items-center gap-2">
                                {company.logo && (
                                  <img 
                                    src={company.logo} 
                                    alt={company.name}
                                    className="w-5 h-5 object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                )}
                                <div className="flex flex-col">
                                  <span className="text-sm">{company.name}</span>
                                  {company.domain && (
                                    <span className="text-xs text-muted-foreground">{company.domain}</span>
                                  )}
                                </div>
                              </div>
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  newProject.companyName === company.name ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground mt-1.5">
                Or type manually if not found in search
              </p>
              <Input
                placeholder="Or type company name manually"
                value={newProject.companyName}
                onChange={(e) => {
                  setNewProject({ ...newProject, companyName: e.target.value });
                }}
                className="mt-2"
                data-testid="input-company-manual"
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
