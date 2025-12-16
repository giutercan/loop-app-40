import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useSearch, Link } from "wouter";
import { useEffect, useState } from "react";
import { 
  Cloud, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Settings,
  Unplug,
  ExternalLink,
  Clock,
  Database,
  Target,
  ChevronLeft,
  Loader2
} from "lucide-react";
import { SiSalesforce } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface SalesforceStatus {
  connected: boolean;
  configured: boolean;
  integration?: {
    id: number;
    instanceUrl: string;
    userName: string;
    orgId: string;
    lastSyncAt: string | null;
  };
  syncStatus?: {
    lastSync: any;
    linkedAccounts: number;
    linkedOpportunities: number;
    accountsWithErrors: number;
    opportunitiesWithErrors: number;
  };
}

interface SyncLog {
  id: number;
  syncType: string;
  direction: string;
  status: string;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsSkipped: number;
  recordsFailed: number;
  startedAt: string;
  completedAt: string | null;
  errors: any[];
}

export default function IntegrationsPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [syncDirection, setSyncDirection] = useState<string>("bidirectional");

  const { data: salesforceStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery<SalesforceStatus>({
    queryKey: ["/api/integrations/salesforce/status"],
  });

  const { data: syncLogs } = useQuery<{ logs: SyncLog[] }>({
    queryKey: ["/api/integrations/salesforce/logs"],
    enabled: salesforceStatus?.connected === true,
  });

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    if (params.get("salesforce") === "connected") {
      toast({
        title: "Salesforce Connected",
        description: "Your Salesforce account has been successfully connected.",
      });
      refetchStatus();
      navigate("/integrations", { replace: true });
    } else if (params.get("salesforce") === "error") {
      toast({
        title: "Connection Failed",
        description: params.get("message") || "Failed to connect to Salesforce.",
        variant: "destructive",
      });
      navigate("/integrations", { replace: true });
    }
  }, [searchString, toast, navigate, refetchStatus]);

  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/integrations/salesforce/auth");
      return await response.json() as { authUrl: string };
    },
    onSuccess: (data: { authUrl: string }) => {
      window.location.href = data.authUrl;
    },
    onError: (error: any) => {
      toast({
        title: "Connection Error",
        description: error.message || "Failed to initiate Salesforce connection",
        variant: "destructive",
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/integrations/salesforce/disconnect");
    },
    onSuccess: () => {
      toast({
        title: "Disconnected",
        description: "Salesforce has been disconnected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/salesforce/status"] });
      setShowDisconnectDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to disconnect Salesforce",
        variant: "destructive",
      });
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (direction: string) => {
      const response = await apiRequest("POST", "/api/integrations/salesforce/sync", { direction });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sync Complete",
        description: "Data has been synchronized with Salesforce.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/salesforce/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/salesforce/logs"] });
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync with Salesforce",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleString();
  };

  const getSyncStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      case "partial":
        return <Badge variant="secondary" className="bg-yellow-600 text-white"><AlertTriangle className="h-3 w-3 mr-1" /> Partial</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case "pull":
        return <ArrowDown className="h-4 w-4" />;
      case "push":
        return <ArrowUp className="h-4 w-4" />;
      default:
        return <ArrowUpDown className="h-4 w-4" />;
    }
  };

  if (statusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/accounts">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Integrations</h1>
            <p className="text-muted-foreground">Connect external services to sync your data</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-3 rounded-lg bg-[#00A1E0]/10">
              <SiSalesforce className="h-8 w-8 text-[#00A1E0]" />
            </div>
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                Salesforce
                {salesforceStatus?.connected && (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" /> Connected
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Sync accounts and opportunities with Salesforce CRM
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!salesforceStatus?.configured ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Configuration Required</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Add your Salesforce Connected App credentials to enable this integration.
                      Set <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">SALESFORCE_CLIENT_ID</code>,{" "}
                      <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">SALESFORCE_CLIENT_SECRET</code>, and{" "}
                      <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">SALESFORCE_CALLBACK_URL</code> in your environment.
                    </p>
                  </div>
                </div>
              </div>
            ) : salesforceStatus?.connected ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Connected as</p>
                    <p className="font-medium">{salesforceStatus.integration?.userName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Instance</p>
                    <p className="font-medium text-sm truncate">{salesforceStatus.integration?.instanceUrl}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Last Synced</p>
                    <p className="font-medium flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {formatDate(salesforceStatus.integration?.lastSyncAt || null)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Organization ID</p>
                    <p className="font-medium text-sm">{salesforceStatus.integration?.orgId}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-dashed">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-2xl font-bold">{salesforceStatus.syncStatus?.linkedAccounts || 0}</p>
                          <p className="text-sm text-muted-foreground">Linked Accounts</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-dashed">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-2xl font-bold">{salesforceStatus.syncStatus?.linkedOpportunities || 0}</p>
                          <p className="text-sm text-muted-foreground">Linked Opportunities</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Select value={syncDirection} onValueChange={setSyncDirection}>
                    <SelectTrigger className="w-[180px]" data-testid="select-sync-direction">
                      <SelectValue placeholder="Sync direction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bidirectional">
                        <div className="flex items-center gap-2">
                          <ArrowUpDown className="h-4 w-4" />
                          Bidirectional
                        </div>
                      </SelectItem>
                      <SelectItem value="pull">
                        <div className="flex items-center gap-2">
                          <ArrowDown className="h-4 w-4" />
                          Pull from Salesforce
                        </div>
                      </SelectItem>
                      <SelectItem value="push">
                        <div className="flex items-center gap-2">
                          <ArrowUp className="h-4 w-4" />
                          Push to Salesforce
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => syncMutation.mutate(syncDirection)}
                    disabled={syncMutation.isPending}
                    data-testid="button-sync"
                  >
                    {syncMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Sync Now
                  </Button>
                  <div className="flex-1" />
                  <Button
                    variant="outline"
                    onClick={() => setShowDisconnectDialog(true)}
                    data-testid="button-disconnect"
                  >
                    <Unplug className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  Connect your Salesforce account to enable two-way data synchronization.
                </p>
                <Button
                  onClick={() => connectMutation.mutate()}
                  disabled={connectMutation.isPending}
                  data-testid="button-connect-salesforce"
                >
                  {connectMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4 mr-2" />
                  )}
                  Connect Salesforce
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {salesforceStatus?.connected && syncLogs?.logs && syncLogs.logs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sync History</CardTitle>
              <CardDescription>Recent synchronization activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {syncLogs.logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                    data-testid={`sync-log-${log.id}`}
                  >
                    <div className="flex items-center gap-3">
                      {getDirectionIcon(log.direction)}
                      <div>
                        <p className="font-medium text-sm">
                          {log.direction === "pull" ? "Pull" : log.direction === "push" ? "Push" : "Bidirectional"} Sync
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(log.startedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-sm">
                        <p className="text-muted-foreground">
                          {log.recordsCreated} created, {log.recordsUpdated} updated
                        </p>
                        {log.recordsFailed > 0 && (
                          <p className="text-red-500">{log.recordsFailed} failed</p>
                        )}
                      </div>
                      {getSyncStatusBadge(log.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Dialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Disconnect Salesforce?</DialogTitle>
              <DialogDescription>
                This will disconnect your Salesforce account. Existing linked records will remain,
                but no new syncs will occur until you reconnect.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDisconnectDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => disconnectMutation.mutate()}
                disabled={disconnectMutation.isPending}
                data-testid="button-confirm-disconnect"
              >
                {disconnectMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Disconnect
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
