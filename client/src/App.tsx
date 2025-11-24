import { Switch, Route, Redirect } from "wouter";
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
import Questionnaire from "@/pages/questionnaire";
import SharedAlignment from "@/pages/shared-alignment";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/projects" component={ProjectsDashboard} />
      <Route path="/projects/new" component={NewProject} />
      <Route path="/discovery">
        <Redirect to="/projects" />
      </Route>
      <Route path="/projects/:id/discovery" component={Discovery} />
      <Route path="/projects/:id/alignment" component={Alignment} />
      <Route path="/projects/:id/realisation" component={Realization} />
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
