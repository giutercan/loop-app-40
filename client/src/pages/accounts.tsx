import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Building2, 
  TrendingUp, 
  Target, 
  Activity,
  ArrowRight,
  Users,
  Briefcase,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  ChevronRight,
  ChevronDown,
  Star,
  Zap,
  Search,
  Lightbulb,
  Rocket,
  RefreshCw,
  GraduationCap,
  FolderOpen,
  Layers
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

const lifecyclePhases = [
  { id: "discover_qualify", label: "Discover", icon: Search, color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  { id: "shape_sell", label: "Shape", icon: Lightbulb, color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
  { id: "deliver_realise", label: "Deliver", icon: Rocket, color: "text-emerald-600", bgColor: "bg-emerald-100 dark:bg-emerald-900/30" },
  { id: "review_renew", label: "Review", icon: RefreshCw, color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
  { id: "learn_scale", label: "Scale", icon: GraduationCap, color: "text-rose-600", bgColor: "bg-rose-100 dark:bg-rose-900/30" },
];

const rolePortals = [
  {
    id: "sales",
    label: "Sales Portal",
    description: "Pipeline visibility, opportunity tracking, and presales activities",
    icon: TrendingUp,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    phases: ["discover_qualify", "shape_sell"],
    focus: "Discover & Shape"
  },
  {
    id: "delivery",
    label: "Delivery Portal", 
    description: "Implementation tracking, KPI logging, and value realization",
    icon: Users,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    phases: ["deliver_realise", "review_renew", "learn_scale"],
    focus: "Deliver, Review & Scale"
  }
];

interface Project {
  id: number;
  name: string;
  companyName: string;
  currentPhase: "discovery" | "alignment" | "realisation";
  accountId: number | null;
}

const phaseLabels: Record<string, { label: string; color: string }> = {
  discovery: { label: "Discovery", color: "text-blue-600" },
  alignment: { label: "Alignment", color: "text-purple-600" },
  realisation: { label: "Realization", color: "text-emerald-600" }
};

interface Account {
  id: number;
  name: string;
  industry: string | null;
  tier: "enterprise" | "strategic" | "growth" | null;
  healthScore: number | null;
  contractStartDate: string | null;
  contractEndDate: string | null;
  annualContractValue: string | null;
  primaryContactName: string | null;
  primaryContactEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

const tierColors: Record<string, string> = {
  enterprise: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  strategic: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  growth: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
};

const healthColors: Record<string, string> = {
  healthy: "text-emerald-600",
  warning: "text-amber-600",
  critical: "text-red-600"
};

function getHealthStatus(score: number | null): { label: string; color: string } {
  if (score === null) return { label: "No Data", color: "text-muted-foreground" };
  if (score >= 70) return { label: "Healthy", color: healthColors.healthy };
  if (score >= 40) return { label: "At Risk", color: healthColors.warning };
  return { label: "Critical", color: healthColors.critical };
}

export default function AccountsDashboard() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [isNewAccountOpen, setIsNewAccountOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountIndustry, setNewAccountIndustry] = useState("");
  const [newAccountTier, setNewAccountTier] = useState<string>("");
  const [hasMigrated, setHasMigrated] = useState(false);

  const { data: accounts = [], isLoading, refetch: refetchAccounts } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: allProjects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const [expandedAccounts, setExpandedAccounts] = useState<Record<number, boolean>>({});

  const getProjectsForAccount = (accountId: number) => {
    return allProjects.filter(p => p.accountId === accountId);
  };

  const toggleAccountExpanded = (accountId: number) => {
    setExpandedAccounts(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const migrateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/migrate/projects-to-accounts");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      setHasMigrated(true);
    },
    onError: (error: any) => {
      console.error("Migration error:", error);
    }
  });

  useEffect(() => {
    if (!hasMigrated && !migrateMutation.isPending) {
      migrateMutation.mutate();
    }
  }, [hasMigrated]);

  const createAccountMutation = useMutation({
    mutationFn: async (data: { name: string; industry: string; tier: string }) => {
      const response = await apiRequest("POST", "/api/accounts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      setIsNewAccountOpen(false);
      setNewAccountName("");
      setNewAccountIndustry("");
      setNewAccountTier("");
      toast({
        title: "Account created",
        description: "The new account has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create account.",
      });
    },
  });

  const handleCreateAccount = () => {
    if (!newAccountName.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please enter an account name.",
      });
      return;
    }
    createAccountMutation.mutate({
      name: newAccountName.trim(),
      industry: newAccountIndustry || "",
      tier: newAccountTier || "growth"
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-16 lg:h-20 items-center justify-between">
            <Link 
              href="/" 
              className="flex items-center gap-3 hover-elevate rounded-lg px-2 py-1 -mx-2"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Korn Ferry</span>
                <p className="text-xs text-muted-foreground hidden lg:block">Client Value Hub</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link href="/projects">
                <Button variant="outline" size="sm" data-testid="link-projects">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Projects View
                </Button>
              </Link>
              <Dialog open={isNewAccountOpen} onOpenChange={setIsNewAccountOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="shadow-lg shadow-primary/20" data-testid="button-new-account">
                    <Plus className="w-4 h-4 mr-2" />
                    New Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Account</DialogTitle>
                    <DialogDescription>
                      Add a new client account to track value across initiatives.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="account-name">Account Name</Label>
                      <Input
                        id="account-name"
                        placeholder="Enter company name"
                        value={newAccountName}
                        onChange={(e) => setNewAccountName(e.target.value)}
                        data-testid="input-account-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account-industry">Industry</Label>
                      <Input
                        id="account-industry"
                        placeholder="e.g., Technology, Healthcare"
                        value={newAccountIndustry}
                        onChange={(e) => setNewAccountIndustry(e.target.value)}
                        data-testid="input-account-industry"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account-tier">Account Tier</Label>
                      <Select value={newAccountTier} onValueChange={setNewAccountTier}>
                        <SelectTrigger data-testid="select-account-tier">
                          <SelectValue placeholder="Select tier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                          <SelectItem value="strategic">Strategic</SelectItem>
                          <SelectItem value="growth">Growth</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNewAccountOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateAccount}
                      disabled={createAccountMutation.isPending}
                      data-testid="button-create-account"
                    >
                      {createAccountMutation.isPending ? "Creating..." : "Create Account"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-b from-primary/5 to-background py-8 lg:py-12">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          {/* Lifecycle Flow Visual */}
          <div className="mb-8 hidden lg:block">
            <div className="flex items-center justify-between bg-card rounded-xl p-4 border">
              {lifecyclePhases.map((phase, index) => {
                const Icon = phase.icon;
                return (
                  <div key={phase.id} className="flex items-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-lg ${phase.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${phase.color}`} />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{phase.label}</span>
                    </div>
                    {index < lifecyclePhases.length - 1 && (
                      <ArrowRight className="w-5 h-5 text-muted-foreground/40 mx-4" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Accounts Section with Role Access */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-1">Your Accounts</h2>
              <p className="text-muted-foreground">
                Select an account and choose your role view
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                <Building2 className="w-3.5 h-3.5 mr-1.5" />
                {accounts.length} Accounts
              </Badge>
            </div>
          </div>

          {accounts.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Building2 className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No accounts yet</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Create your first client account to start tracking value across initiatives.
                </p>
                <Button onClick={() => setIsNewAccountOpen(true)} data-testid="button-add-first-account">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Account
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account) => {
                const health = getHealthStatus(account.healthScore);
                return (
                  <Card 
                    key={account.id}
                    className="transition-all duration-200 h-full"
                    data-testid={`card-account-${account.id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {account.name}
                            </CardTitle>
                            {account.industry && (
                              <CardDescription>{account.industry}</CardDescription>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        {account.tier && (
                          <Badge className={tierColors[account.tier] || "bg-muted"}>
                            {account.tier.charAt(0).toUpperCase() + account.tier.slice(1)}
                          </Badge>
                        )}
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${health.color}`}>
                            {health.label}
                          </span>
                          {account.healthScore !== null && (
                            <span className="text-xs text-muted-foreground">
                              ({account.healthScore}%)
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {account.healthScore !== null && (
                        <Progress 
                          value={account.healthScore} 
                          className="h-2"
                        />
                      )}

                      {/* Projects Dropdown */}
                      {(() => {
                        const accountProjects = getProjectsForAccount(account.id);
                        const isExpanded = expandedAccounts[account.id];
                        return accountProjects.length > 0 ? (
                          <Collapsible open={isExpanded} onOpenChange={() => toggleAccountExpanded(account.id)}>
                            <CollapsibleTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="w-full justify-between px-2 h-auto py-2"
                                data-testid={`button-toggle-projects-${account.id}`}
                              >
                                <div className="flex items-center gap-2">
                                  <FolderOpen className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">{accountProjects.length} Project{accountProjects.length > 1 ? 's' : ''}</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-2 space-y-1">
                              {accountProjects.map((project) => {
                                const phase = phaseLabels[project.currentPhase] || { label: project.currentPhase, color: "text-muted-foreground" };
                                return (
                                  <div 
                                    key={project.id} 
                                    className="rounded-lg border bg-muted/30 p-2 space-y-2"
                                    data-testid={`project-row-${project.id}`}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <Layers className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                        <span className="text-sm font-medium truncate">{project.name}</span>
                                      </div>
                                      <Badge variant="secondary" className={`text-xs shrink-0 ${phase.color}`}>
                                        {phase.label}
                                      </Badge>
                                    </div>
                                    <div className="flex gap-1.5">
                                      <Link href={`/projects/${project.id}/sales`} className="flex-1">
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="w-full h-7 text-xs gap-1"
                                          data-testid={`button-project-sales-${project.id}`}
                                        >
                                          <TrendingUp className="w-3 h-3 text-blue-600" />
                                          Sales
                                        </Button>
                                      </Link>
                                      <Link href={`/projects/${project.id}/delivery`} className="flex-1">
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="w-full h-7 text-xs gap-1"
                                          data-testid={`button-project-delivery-${project.id}`}
                                        >
                                          <Users className="w-3 h-3 text-emerald-600" />
                                          Delivery
                                        </Button>
                                      </Link>
                                    </div>
                                  </div>
                                );
                              })}
                            </CollapsibleContent>
                          </Collapsible>
                        ) : (
                          <div className="text-center py-2 text-xs text-muted-foreground">
                            No projects yet
                          </div>
                        );
                      })()}

                      {/* Role Access Buttons */}
                      <div className="pt-2 border-t space-y-2">
                        <p className="text-xs text-muted-foreground font-medium">Open account as:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {rolePortals.map((portal) => {
                            const Icon = portal.icon;
                            return (
                              <Link key={portal.id} href={`/accounts/${account.id}/${portal.id}`}>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full justify-start gap-2 group"
                                  data-testid={`button-${portal.id}-${account.id}`}
                                >
                                  <Icon className={`w-4 h-4 ${portal.color}`} />
                                  <span className="truncate">{portal.label.replace(' Portal', '')}</span>
                                  <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Button>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
