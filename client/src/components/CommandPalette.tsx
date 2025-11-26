import { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  FolderPlus,
  Building2,
  Compass,
  Target,
  TrendingUp,
  ArrowRight,
  Sparkles,
  FileText,
  Settings,
  HelpCircle,
} from "lucide-react";
import type { Project } from "@shared/schema";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: open,
  });

  // Extract project ID from URL if we're on a project page
  const currentProjectId = useMemo(() => {
    const match = location.match(/\/projects\/(\d+)/);
    return match ? parseInt(match[1]) : undefined;
  }, [location]);

  const currentProject = projects.find((p) => p.id === currentProjectId);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const navigateTo = useCallback(
    (path: string) => {
      runCommand(() => setLocation(path));
    },
    [runCommand, setLocation]
  );

  const activeProjects = projects.filter((p) => p.status === "active");
  const otherProjects = activeProjects.filter((p) => p.id !== currentProjectId);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." data-testid="input-command-search" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {currentProject && (
          <>
            <CommandGroup heading="Current Project">
              <CommandItem
                onSelect={() => navigateTo(`/projects/${currentProject.id}/discovery`)}
                data-testid={`command-project-discovery-${currentProject.id}`}
              >
                <Compass className="mr-2 h-4 w-4 text-blue-500" />
                <span>Discovery</span>
                <CommandShortcut>Phase 1</CommandShortcut>
              </CommandItem>
              <CommandItem
                onSelect={() => navigateTo(`/projects/${currentProject.id}/alignment`)}
                data-testid={`command-project-alignment-${currentProject.id}`}
              >
                <Target className="mr-2 h-4 w-4 text-purple-500" />
                <span>Alignment</span>
                <CommandShortcut>Phase 2</CommandShortcut>
              </CommandItem>
              <CommandItem
                onSelect={() => navigateTo(`/projects/${currentProject.id}/realisation`)}
                data-testid={`command-project-realisation-${currentProject.id}`}
              >
                <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                <span>Realization</span>
                <CommandShortcut>Phase 3</CommandShortcut>
              </CommandItem>
              <CommandItem
                onSelect={() => navigateTo(`/projects/${currentProject.id}/dashboard`)}
                data-testid={`command-project-dashboard-${currentProject.id}`}
              >
                <LayoutDashboard className="mr-2 h-4 w-4 text-amber-500" />
                <span>Project Dashboard</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => navigateTo("/projects")} data-testid="command-nav-dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Projects Dashboard</span>
            <CommandShortcut>Home</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => navigateTo("/projects/new")} data-testid="command-nav-new-project">
            <FolderPlus className="mr-2 h-4 w-4" />
            <span>New Project</span>
          </CommandItem>
        </CommandGroup>

        {otherProjects.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Switch Project">
              {otherProjects.map((project) => (
                <CommandItem
                  key={project.id}
                  onSelect={() => navigateTo(`/projects/${project.id}/discovery`)}
                  data-testid={`command-switch-project-${project.id}`}
                >
                  {project.companyLogoUrl ? (
                    <img
                      src={project.companyLogoUrl}
                      alt=""
                      className="mr-2 h-4 w-4 rounded object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="flex-1">{project.companyName}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {project.currentPhase}
                  </span>
                  <ArrowRight className="ml-2 h-3 w-3 text-muted-foreground" />
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => {
              runCommand(() => {
                if (currentProjectId) {
                  setLocation(`/projects/${currentProjectId}/discovery`);
                } else {
                  setLocation("/projects/new");
                }
              });
            }}
            data-testid="command-action-ai-research"
          >
            <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
            <span>Run AI Research</span>
          </CommandItem>
          <CommandItem
            onSelect={() => navigateTo("/projects")}
            data-testid="command-action-view-all"
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>View All Projects</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />
        <CommandGroup heading="Help">
          <CommandItem disabled data-testid="command-help-docs">
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Documentation</span>
            <CommandShortcut>Coming soon</CommandShortcut>
          </CommandItem>
          <CommandItem disabled data-testid="command-help-shortcuts">
            <Settings className="mr-2 h-4 w-4" />
            <span>Keyboard Shortcuts</span>
            <CommandShortcut>?</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function CommandPaletteHint() {
  const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  
  return (
    <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
      <span>Press</span>
      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
        {isMac ? "⌘" : "Ctrl"}
      </kbd>
      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
        K
      </kbd>
      <span>to search</span>
    </div>
  );
}
