import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitHubExportDialog } from "@/components/github-export-dialog";
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
  Layers,
  Trash2,
  MoreVertical,
  ExternalLink,
  Settings,
  ArrowUpRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";


// Sales workflow stages (4-stage journey)
const salesStages = [
  { id: "discover", label: "Discover", shortLabel: "1", color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  { id: "build_value", label: "Build Value", shortLabel: "2", color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
  { id: "align", label: "Align", shortLabel: "3", color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
  { id: "handoff", label: "Handoff", shortLabel: "4", color: "text-emerald-600", bgColor: "bg-emerald-100 dark:bg-emerald-900/30" },
];

// Delivery workflow stages (4-stage Delivery journey)
const deliveryStages = [
  { id: "health_dashboard", label: "Health Dashboard", color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  { id: "kpi_tracking", label: "KPI Tracking", color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
  { id: "business_review", label: "Business Review", color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
  { id: "success_stories", label: "Success Stories", color: "text-emerald-600", bgColor: "bg-emerald-100 dark:bg-emerald-900/30" },
];

// Legacy phase labels (for backward compatibility)
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
  companyLogoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: number;
  name: string;
  companyName: string;
  companyLogoUrl: string | null;
  currentPhase: "discovery" | "alignment" | "realisation";
  salesStage: "discover" | "build_value" | "align" | "handoff" | null;
  deliveryStage: "health_dashboard" | "kpi_tracking" | "business_review" | "success_stories" | null;
  accountId: number | null;
  updatedAt: string | null;
  createdAt: string | null;
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

  const getAccountLogo = (account: Account) => {
    if (account.companyLogoUrl) return account.companyLogoUrl;
    const projects = getProjectsForAccount(account.id);
    const projectWithLogo = projects.find(p => p.companyLogoUrl);
    return projectWithLogo?.companyLogoUrl || null;
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

  const deleteAccountMutation = useMutation({
    mutationFn: async (accountId: number) => {
      const response = await apiRequest("DELETE", `/api/accounts/${accountId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Account deleted",
        description: "The account and all its data have been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete account.",
      });
    },
  });

  const deleteInitiativeMutation = useMutation({
    mutationFn: async (initiativeId: number) => {
      const response = await apiRequest("DELETE", `/api/projects/${initiativeId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Initiative deleted",
        description: "The initiative has been permanently removed.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete initiative.",
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
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground variant="subtle" />
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-16 lg:h-20 items-center justify-between">
            <Link 
              href="/" 
              className="flex items-center gap-3 hover-elevate rounded-lg px-2 py-1 -mx-2"
              data-testid="link-landing-logo"
            >
              <div>
                <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Korn Ferry</span>
                <p className="text-xs text-muted-foreground hidden lg:block">Client Value Hub</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-4 flex-wrap">
              <GitHubExportDialog />
              <Link href="/integrations">
                <Button variant="ghost" size="icon" data-testid="button-integrations">
                  <Settings className="w-5 h-5" />
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
          {/* Accounts Section */}
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
              {accounts.map((account) => (
                <AccountCard 
                  key={account.id} 
                  account={account} 
                  logo={getAccountLogo(account)}
                  projects={getProjectsForAccount(account.id)}
                  expandedAccounts={expandedAccounts}
                  toggleAccountExpanded={toggleAccountExpanded}
                  onDelete={(id) => deleteAccountMutation.mutate(id)}
                  isDeleting={deleteAccountMutation.isPending}
                  onDeleteInitiative={(id) => deleteInitiativeMutation.mutate(id)}
                  isDeletingInitiative={deleteInitiativeMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AccountCard({ 
  account, 
  logo, 
  projects, 
  expandedAccounts, 
  toggleAccountExpanded,
  onDelete,
  isDeleting,
  onDeleteInitiative,
  isDeletingInitiative
}: { 
  account: Account; 
  logo: string | null;
  projects: Project[];
  expandedAccounts: Record<number, boolean>;
  toggleAccountExpanded: (id: number) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
  onDeleteInitiative: (id: number) => void;
  isDeletingInitiative: boolean;
}) {
  const [imageError, setImageError] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [initiativeToDelete, setInitiativeToDelete] = useState<Project | null>(null);
  const health = getHealthStatus(account.healthScore);
  const isExpanded = expandedAccounts[account.id];

  const handleDelete = () => {
    onDelete(account.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card 
        className="transition-all duration-200 h-full hover-elevate micro-lift card-glow animate-fade-in-up"
        data-testid={`card-account-${account.id}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {logo && !imageError ? (
                <div className="w-12 h-12 rounded-xl bg-white border overflow-hidden flex items-center justify-center shrink-0">
                  <img 
                    src={logo} 
                    alt={`${account.name} logo`}
                    className="w-10 h-10 object-contain"
                    onError={() => setImageError(true)}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-primary">
                    {account.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <CardTitle className="text-lg truncate">
                  {account.name}
                </CardTitle>
                {account.industry && (
                  <CardDescription className="truncate">{account.industry}</CardDescription>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" data-testid={`button-account-menu-${account.id}`}>
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/accounts/${account.id}`} className="flex items-center gap-2 cursor-pointer">
                    <ExternalLink className="w-4 h-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => setShowDeleteDialog(true)}
                  data-testid={`button-delete-account-${account.id}`}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

          {/* Initiatives List */}
          {projects.length > 0 ? (
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
                    <span className="text-sm font-medium">{projects.length} Initiative{projects.length > 1 ? 's' : ''}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-2">
                <Link href={`/projects/new?accountId=${account.id}`}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mb-2 gap-1.5 border-dashed"
                    data-testid={`button-add-initiative-expanded-${account.id}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add New Initiative
                  </Button>
                </Link>
                {projects.map((project) => {
                  // Derive salesStage from currentPhase for backward compatibility with legacy data
                  const deriveSalesStageFromPhase = (phase: string): "discover" | "build_value" | "align" | "handoff" => {
                    if (phase === "realisation") return "handoff"; // Completed sales, moved to delivery
                    if (phase === "alignment") return "align"; // In alignment phase
                    return "discover"; // Default to discovery
                  };
                  
                  const currentSalesStage = project.salesStage || deriveSalesStageFromPhase(project.currentPhase);
                  const currentSalesIndex = salesStages.findIndex(s => s.id === currentSalesStage);
                  const isInDelivery = project.deliveryStage !== null || project.currentPhase === "realisation";
                  const currentStageInfo = salesStages.find(s => s.id === currentSalesStage);
                  const currentDeliveryStage = project.deliveryStage || "health_dashboard";
                  const currentDeliveryIndex = deliveryStages.findIndex(s => s.id === currentDeliveryStage);
                  const currentDeliveryInfo = deliveryStages.find(s => s.id === currentDeliveryStage);
                  
                  // Calculate time since last update
                  const getTimeAgo = (date: Date | string | null | undefined) => {
                    if (!date) return "No activity";
                    const now = new Date();
                    const updated = new Date(date);
                    if (isNaN(updated.getTime())) return "No activity";
                    const diffMs = now.getTime() - updated.getTime();
                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    const diffMins = Math.floor(diffMs / (1000 * 60));
                    
                    if (diffDays > 30) return `${Math.floor(diffDays / 30)}mo ago`;
                    if (diffDays > 0) return `${diffDays}d ago`;
                    if (diffHours > 0) return `${diffHours}h ago`;
                    if (diffMins > 0) return `${diffMins}m ago`;
                    return "Just now";
                  };
                  
                  // Determine next milestone based on current stage
                  const getNextMilestone = () => {
                    if (isInDelivery) {
                      const nextIdx = currentDeliveryIndex + 1;
                      if (nextIdx < deliveryStages.length) {
                        return { label: deliveryStages[nextIdx].label, type: "next" };
                      }
                      return { label: "Value Realized", type: "complete" };
                    } else {
                      const nextIdx = currentSalesIndex + 1;
                      if (nextIdx < salesStages.length) {
                        return { label: salesStages[nextIdx].label, type: "next" };
                      }
                      return { label: "Ready for Handoff", type: "ready" };
                    }
                  };
                  
                  const nextMilestone = getNextMilestone();
                  const progressPercent = isInDelivery 
                    ? Math.round(((currentDeliveryIndex + 1) / deliveryStages.length) * 100)
                    : Math.round(((currentSalesIndex + 1) / salesStages.length) * 100);
                  
                  return (
                    <div 
                      key={project.id} 
                      className="rounded-lg border bg-muted/30 p-3 space-y-3"
                      data-testid={`project-row-${project.id}`}
                    >
                      {/* Header: Initiative Name + Delete */}
                      <div className="flex items-center gap-2 min-w-0">
                        <Layers className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium truncate flex-1" data-testid={`text-initiative-name-${project.id}`}>{project.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-muted-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInitiativeToDelete(project);
                          }}
                          data-testid={`button-delete-initiative-${project.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      
                      {/* Current Phase + Progress */}
                      <div className="space-y-2">
                        {/* Phase Display - Prominent */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {isInDelivery ? (
                              <div className={`p-1.5 rounded-md ${currentDeliveryInfo?.bgColor || "bg-emerald-100"}`}>
                                <Users className={`w-3.5 h-3.5 ${currentDeliveryInfo?.color || "text-emerald-600"}`} />
                              </div>
                            ) : (
                              <div className={`p-1.5 rounded-md ${currentStageInfo?.bgColor || "bg-blue-100"}`}>
                                <TrendingUp className={`w-3.5 h-3.5 ${currentStageInfo?.color || "text-blue-600"}`} />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-sm font-semibold ${isInDelivery ? currentDeliveryInfo?.color : currentStageInfo?.color}`} data-testid={`text-current-phase-${project.id}`}>
                                  {isInDelivery ? currentDeliveryInfo?.label : currentStageInfo?.label}
                                </span>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {isInDelivery ? "Delivery" : "Sales"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span data-testid={`text-last-activity-${project.id}`}>{getTimeAgo(project.updatedAt)}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Progress Ring */}
                          <div className="relative w-10 h-10 shrink-0" data-testid={`progress-ring-${project.id}`}>
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                className="text-muted/30"
                              />
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeDasharray={`${progressPercent}, 100`}
                                className={isInDelivery ? "text-emerald-500" : "text-blue-500"}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[10px] font-bold">{progressPercent}%</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Compact Step Indicator */}
                        <div className="flex items-center gap-0.5">
                          {(isInDelivery ? deliveryStages : salesStages).map((stage, idx) => {
                            const currentIdx = isInDelivery ? currentDeliveryIndex : currentSalesIndex;
                            const isCompleted = idx < currentIdx;
                            const isCurrent = idx === currentIdx;
                            
                            return (
                              <div 
                                key={stage.id} 
                                className={`flex-1 h-1.5 rounded-full transition-all ${
                                  isCompleted 
                                    ? "bg-emerald-500" 
                                    : isCurrent 
                                      ? (isInDelivery ? "bg-emerald-400" : "bg-blue-400")
                                      : "bg-muted"
                                }`}
                                title={stage.label}
                              />
                            );
                          })}
                        </div>
                        
                        {/* Next Milestone */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>Next:</span>
                            <span className="font-medium text-foreground" data-testid={`text-next-milestone-${project.id}`}>{nextMilestone.label}</span>
                          </div>
                          {isInDelivery && (
                            <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300">
                              <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                              Handoff Complete
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-1.5 pt-1">
                        <Link href={`/projects/${project.id}/sales`} className="flex-1">
                          <Button 
                            variant={!isInDelivery ? "default" : "outline"}
                            size="sm" 
                            className="w-full text-xs gap-1"
                            data-testid={`button-project-sales-${project.id}`}
                          >
                            <TrendingUp className="w-3 h-3" />
                            Sales
                          </Button>
                        </Link>
                        <Link href={`/projects/${project.id}/delivery`} className="flex-1">
                          <Button 
                            variant={isInDelivery ? "default" : "outline"}
                            size="sm" 
                            className="w-full text-xs gap-1"
                            data-testid={`button-project-delivery-${project.id}`}
                          >
                            <Users className="w-3 h-3" />
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
            <div className="text-center py-4 text-sm text-muted-foreground border rounded-lg bg-muted/20 space-y-2">
              <FolderOpen className="w-5 h-5 mx-auto opacity-50" />
              <p>No initiatives yet</p>
              <Link href={`/projects/new?accountId=${account.id}`}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 gap-1"
                  data-testid={`button-add-initiative-${account.id}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Initiative
                </Button>
              </Link>
            </div>
          )}

          {/* Quick Actions */}
          <div className="pt-2 border-t">
            <Link href={`/accounts/${account.id}`}>
              <Button 
                variant="default" 
                size="sm" 
                className="w-full gap-2"
                data-testid={`button-view-account-${account.id}`}
              >
                <Building2 className="w-4 h-4" />
                Open Account Hub
                <ArrowRight className="w-3 h-3 ml-auto" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{account.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this account and all associated initiatives, KPI commitments, and handoffs. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!initiativeToDelete} onOpenChange={(open) => !open && setInitiativeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{initiativeToDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this initiative and all associated data including KPIs, insights, and progress tracking. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingInitiative}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (initiativeToDelete) {
                  onDeleteInitiative(initiativeToDelete.id);
                  setInitiativeToDelete(null);
                }
              }} 
              disabled={isDeletingInitiative}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete-initiative"
            >
              {isDeletingInitiative ? "Deleting..." : "Delete Initiative"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
