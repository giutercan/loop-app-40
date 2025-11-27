import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
  Star,
  Zap
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

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

  const { data: accounts = [], isLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

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

      <div className="bg-gradient-to-b from-primary/5 to-background py-12 lg:py-16">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">Client Value Hub</h1>
              <p className="text-muted-foreground text-lg">
                Track promised vs. delivered value across all client accounts
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
                  <Link key={account.id} href={`/accounts/${account.id}`}>
                    <Card 
                      className="hover-elevate cursor-pointer transition-all duration-200 group h-full"
                      data-testid={`card-account-${account.id}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                {account.name}
                              </CardTitle>
                              {account.industry && (
                                <CardDescription>{account.industry}</CardDescription>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
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

                        {account.annualContractValue && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Target className="w-4 h-4" />
                            <span>ACV: {account.annualContractValue}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
