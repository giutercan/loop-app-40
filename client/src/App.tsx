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
import ProjectLayout from "@/components/ProjectLayout";

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
      <Route path="/" component={Landing} />
      <Route path="/projects" component={ProjectsDashboard} />
      <Route path="/projects/new" component={NewProject} />
      <Route path="/discovery">
        <Redirect to="/projects" />
      </Route>
      <Route path="/projects/:id/discovery" component={DiscoveryWithLayout} />
      <Route path="/projects/:id/alignment" component={AlignmentWithLayout} />
      <Route path="/projects/:id/realisation" component={RealizationWithLayout} />
      <Route path="/projects/:id/dashboard" component={DashboardWithLayout} />
      <Route path="/questionnaire/:token" component={Questionnaire} />
      <Route path="/shared/alignment/:token" component={SharedAlignment} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
