import { Switch, Route, Redirect, useRoute } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import ProjectsDashboard from "@/pages/projects-dashboard";
import NewProject from "@/pages/new-project";
import Discovery from "@/pages/discovery";
import Alignment from "@/pages/alignment";
import Realization from "@/pages/realisation";
import Dashboard from "@/pages/dashboard";
import Questionnaire from "@/pages/questionnaire";
import SharedAlignment from "@/pages/shared-alignment";
import AccountsDashboard from "@/pages/accounts";
import AccountValueSpine from "@/pages/account-value-spine";
import AccountHub from "@/pages/account-hub";
import AccountRoleView from "@/pages/account-role-view";
import ProjectRoleView from "@/pages/project-role-view";
import Presentation from "@/pages/presentation";
import ProjectLayout from "@/components/ProjectLayout";
import { CommandPalette } from "@/components/CommandPalette";
import { DemoModeProvider } from "@/demo/DemoModeContext";
import { ExecutiveDemoTour } from "@/demo/ExecutiveDemoTour";
import { CompanionProvider } from "@/components/AICompanionPanel";

function DiscoveryWithLayout() {
  const [, params] = useRoute("/projects/:id/discovery");
  const projectId = parseInt(params?.id || "0");
  
  return (
    <ProjectLayout projectId={projectId} currentPhase="discovery">
      <Discovery />
    </ProjectLayout>
  );
}

function AlignmentWithLayout() {
  const [, params] = useRoute("/projects/:id/alignment");
  const projectId = parseInt(params?.id || "0");
  
  return (
    <ProjectLayout projectId={projectId} currentPhase="alignment">
      <Alignment />
    </ProjectLayout>
  );
}

function RealizationWithLayout() {
  const [, params] = useRoute("/projects/:id/realisation");
  const projectId = parseInt(params?.id || "0");
  
  return (
    <ProjectLayout projectId={projectId} currentPhase="realisation">
      <Realization />
    </ProjectLayout>
  );
}

function DashboardWithLayout() {
  const [, params] = useRoute("/projects/:id/dashboard");
  const projectId = parseInt(params?.id || "0");
  
  return (
    <ProjectLayout projectId={projectId} currentPhase="realisation">
      <Dashboard />
    </ProjectLayout>
  );
}

function Router() {
  return (
    <Switch>
      {/* Landing page is the entry point */}
      <Route path="/" component={Landing} />
      <Route path="/welcome" component={Landing} />
      {/* Projects route now redirects to accounts - account-centric architecture */}
      <Route path="/projects">
        <Redirect to="/accounts" />
      </Route>
      <Route path="/projects/new" component={NewProject} />
      <Route path="/accounts" component={AccountsDashboard} />
      <Route path="/accounts/:id/hub" component={AccountHub} />
      <Route path="/accounts/:id/:role" component={AccountRoleView} />
      <Route path="/accounts/:id" component={AccountValueSpine} />
      <Route path="/projects/:id/:role" component={ProjectRoleView} />
      <Route path="/discovery">
        <Redirect to="/projects" />
      </Route>
      <Route path="/projects/:id/discovery" component={DiscoveryWithLayout} />
      <Route path="/projects/:id/alignment" component={AlignmentWithLayout} />
      <Route path="/projects/:id/realisation" component={RealizationWithLayout} />
      <Route path="/projects/:id/dashboard" component={DashboardWithLayout} />
      <Route path="/questionnaire/:token" component={Questionnaire} />
      <Route path="/shared/alignment/:token" component={SharedAlignment} />
      <Route path="/presentation" component={Presentation} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DemoModeProvider>
          <CompanionProvider>
            <CommandPalette />
            <ExecutiveDemoTour />
            <Toaster />
            <Router />
          </CompanionProvider>
        </DemoModeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
