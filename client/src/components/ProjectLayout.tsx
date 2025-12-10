import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Target,
  Activity,
  Building2,
  Home,
  ChevronRight,
  HelpCircle,
  CheckCircle2,
  Pencil,
  FolderOpen,
} from "lucide-react";
import { AppTour } from "@/components/AppTour";
import { PhaseChecklist } from "@/components/PhaseChecklist";
import { LogoEditDialog } from "@/components/LogoEditDialog";
import { CommandPaletteHint } from "@/components/CommandPalette";
import { LoopContextIndicator } from "@/components/LoopContextIndicator";
import type { Project, Account } from "@shared/schema";

interface ProjectLayoutProps {
  projectId: number;
  currentPhase: "discovery" | "alignment" | "realisation";
  children: React.ReactNode;
}

const phases = [
  {
    id: "discovery" as const,
    label: "Discovery",
    description: "Research & Insights",
    icon: Search,
    path: (id: number) => `/projects/${id}/discovery`,
  },
  {
    id: "alignment" as const,
    label: "Alignment",
    description: "Jobs & KPI Targets",
    icon: Target,
    path: (id: number) => `/projects/${id}/alignment`,
  },
  {
    id: "realisation" as const,
    label: "Realization",
    description: "Track & Measure",
    icon: Activity,
    path: (id: number) => `/projects/${id}/realisation`,
  },
];

function getPhaseProgress(currentPhase: "discovery" | "alignment" | "realisation"): number {
  switch (currentPhase) {
    case "discovery":
      return 33;
    case "alignment":
      return 66;
    case "realisation":
      return 100;
    default:
      return 0;
  }
}

function getPhaseIndex(phase: "discovery" | "alignment" | "realisation"): number {
  return phases.findIndex((p) => p.id === phase);
}

export default function ProjectLayout({
  projectId,
  currentPhase,
  children,
}: ProjectLayoutProps) {
  const [location] = useLocation();
  const [editingLogo, setEditingLogo] = useState(false);

  const isValidProjectId = projectId && projectId > 0 && !isNaN(projectId);

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!isValidProjectId,
  });

  const { data: parentAccount } = useQuery<Account>({
    queryKey: [`/api/accounts/${project?.accountId}`],
    enabled: !!project?.accountId,
  });

  if (!isValidProjectId) {
    return <>{children}</>;
  }

  const currentPhaseIndex = getPhaseIndex(currentPhase);

  const sidebarStyle = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon">

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-sidebar-foreground/60">
                Current Project
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-2 py-3 space-y-3 group-data-[collapsible=icon]:hidden">
                  {projectLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ) : project ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div 
                          className="relative w-6 h-6 rounded bg-sidebar-accent/50 flex items-center justify-center shrink-0 overflow-hidden group/logo cursor-pointer"
                          onClick={() => setEditingLogo(true)}
                          data-testid="button-sidebar-edit-logo"
                        >
                          {project.companyLogoUrl ? (
                            <img 
                              src={project.companyLogoUrl} 
                              alt={project.companyName}
                              className="w-full h-full object-contain p-0.5"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                              }}
                              data-testid="img-sidebar-company-logo"
                            />
                          ) : null}
                          <Building2 className={`w-4 h-4 text-sidebar-foreground/70 ${project.companyLogoUrl ? 'hidden' : ''}`} />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center rounded">
                            <Pencil className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        <span className="font-semibold truncate" data-testid="sidebar-project-name">
                          {project.companyName}
                        </span>
                      </div>
                      {project.sector && (
                        <Badge variant="secondary" className="text-xs">
                          {project.sector}
                        </Badge>
                      )}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-sidebar-foreground/70">Progress</span>
                          <span className="font-medium">{getPhaseProgress(currentPhase)}%</span>
                        </div>
                        <Progress value={getPhaseProgress(currentPhase)} className="h-1.5" />
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-sidebar-foreground/70">No project selected</p>
                  )}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-sidebar-foreground/60">
                Phases
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {phases.map((phase, index) => {
                    const Icon = phase.icon;
                    const isActive = currentPhase === phase.id;
                    const isCompleted = index < currentPhaseIndex;

                    return (
                      <SidebarMenuItem key={phase.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={phase.label}
                        >
                          <Link
                            href={phase.path(projectId)}
                            data-testid={`sidebar-phase-${phase.id}`}
                          >
                            <div className="relative">
                              <Icon className="w-4 h-4" />
                              {isCompleted && (
                                <CheckCircle2 className="absolute -top-1 -right-1 w-3 h-3 text-primary bg-sidebar rounded-full" />
                              )}
                            </div>
                            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                              <span className="font-medium">{phase.label}</span>
                              <span className="text-xs text-sidebar-foreground/60">
                                {phase.description}
                              </span>
                            </div>
                            {isActive && (
                              <Badge
                                variant="secondary"
                                className="ml-auto text-xs group-data-[collapsible=icon]:hidden"
                              >
                                Current
                              </Badge>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="group-data-[collapsible=icon]:hidden">
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-sidebar-foreground/60">
                Checklist
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-2">
                  <PhaseChecklist projectId={projectId} currentPhase={currentPhase} />
                </div>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-sidebar-foreground/60">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {parentAccount && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Parent Account">
                        <Link href={`/accounts/${parentAccount.id}`} data-testid="sidebar-parent-account">
                          <FolderOpen className="w-4 h-4" />
                          <span className="group-data-[collapsible=icon]:hidden truncate">{parentAccount.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="All Accounts">
                      <Link href="/accounts" data-testid="sidebar-all-accounts">
                        <Building2 className="w-4 h-4" />
                        <span className="group-data-[collapsible=icon]:hidden">All Accounts</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="All Projects">
                      <Link href="/projects" data-testid="sidebar-all-projects">
                        <Home className="w-4 h-4" />
                        <span className="group-data-[collapsible=icon]:hidden">All Projects</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border">
            <div className="p-2 group-data-[collapsible=icon]:hidden">
              <AppTour context="discovery" />
            </div>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        <div className="flex flex-col flex-1 min-w-0">
          <header className="sticky top-0 z-40 flex items-center justify-between gap-4 h-14 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />

              <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
                <Link
                  href="/accounts"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="breadcrumb-accounts"
                >
                  Accounts
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                {parentAccount && (
                  <>
                    <Link
                      href={`/accounts/${parentAccount.id}`}
                      className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                      data-testid="breadcrumb-account"
                    >
                      <span className="truncate max-w-[80px]">{parentAccount.name}</span>
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </>
                )}
                <Link
                  href="/projects"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="breadcrumb-projects"
                >
                  Projects
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                {projectLoading ? (
                  <Skeleton className="h-4 w-24" />
                ) : (
                  <span className="font-medium truncate max-w-[120px]" data-testid="breadcrumb-project">
                    {project?.companyName || "Unknown"}
                  </span>
                )}
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                <Badge variant="outline" className="font-medium capitalize">
                  {currentPhase === "realisation" ? "Realization" : currentPhase}
                </Badge>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <LoopContextIndicator />
              <CommandPaletteHint />
              <div className="flex items-center gap-2">
                {phases.map((phase, index) => {
                  const isActive = currentPhase === phase.id;
                  const isCompleted = index < currentPhaseIndex;

                  return (
                    <Link
                      key={phase.id}
                      href={phase.path(projectId)}
                      className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors hover-elevate ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isCompleted
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground"
                      }`}
                      data-testid={`header-phase-${phase.id}`}
                    >
                      <phase.icon className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">{phase.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>

      {/* Logo Edit Dialog */}
      {project && (
        <LogoEditDialog
          open={editingLogo}
          onOpenChange={setEditingLogo}
          projectId={projectId}
          companyName={project.companyName}
          currentLogoUrl={project.companyLogoUrl}
        />
      )}
    </SidebarProvider>
  );
}
