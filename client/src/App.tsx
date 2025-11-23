import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Discovery from "@/pages/discovery";
import Alignment from "@/pages/alignment";
import Realization from "@/pages/realization";
import Questionnaire from "@/pages/questionnaire";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/discovery" component={Discovery} />
      <Route path="/projects/:id/discovery" component={Discovery} />
      <Route path="/projects/:id/alignment" component={Alignment} />
      <Route path="/projects/:id/realisation" component={Realization} />
      <Route path="/questionnaire/:token" component={Questionnaire} />
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
