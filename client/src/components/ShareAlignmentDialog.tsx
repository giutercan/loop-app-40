import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Copy, Share2, Check } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ShareAlignmentDialogProps {
  projectId: number;
}

interface ShareLinkResponse {
  shareLink: {
    id: number;
    projectId: number;
    shareToken: string;
    customerName: string | null;
    customerEmail: string | null;
    permissions: string;
    status: string;
    expiresAt: string | null;
    createdAt: string;
    lastAccessedAt: string | null;
  } | null;
  shareUrl: string;
}

export function ShareAlignmentDialog({ projectId }: ShareAlignmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [expiresInDays, setExpiresInDays] = useState<string>("30");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Fetch existing share link
  const { data: existingLink } = useQuery<ShareLinkResponse>({
    queryKey: [`/api/projects/${projectId}/alignment/share`],
    enabled: open,
  });

  // Create new share link mutation
  const createShareLinkMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/projects/${projectId}/alignment/share`, {
        customerName: customerName || null,
        customerEmail: customerEmail || null,
        expiresInDays: expiresInDays === "never" ? null : parseInt(expiresInDays),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/alignment/share`] });
      toast({
        title: "Share link created",
        description: "Your alignment page is now shareable with the customer",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to create share link",
        description: error.message || "Please try again",
      });
    },
  });

  // Revoke share link mutation
  const revokeShareLinkMutation = useMutation({
    mutationFn: async (linkId: number) => {
      return await apiRequest("DELETE", `/api/projects/${projectId}/alignment/share/${linkId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/alignment/share`] });
      toast({
        title: "Share link revoked",
        description: "The customer can no longer access this alignment page",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to revoke share link",
        description: error.message || "Please try again",
      });
    },
  });

  const handleCreateShareLink = () => {
    createShareLinkMutation.mutate();
  };

  const handleCopyLink = () => {
    const shareUrl = existingLink?.shareUrl 
      ? `${window.location.origin}${existingLink.shareUrl}`
      : "";
    
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Link copied",
      description: "Share link copied to clipboard",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = () => {
    if (existingLink?.shareLink?.id) {
      revokeShareLinkMutation.mutate(existingLink.shareLink.id);
    }
  };

  const activeShareLink = existingLink?.shareLink?.status === "active" ? existingLink.shareLink : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid="button-share-alignment">
          <Share2 className="h-4 w-4 mr-2" />
          Share with Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" data-testid="dialog-share-alignment">
        <DialogHeader>
          <DialogTitle>Share Alignment with Customer</DialogTitle>
          <DialogDescription>
            {activeShareLink
              ? "Your alignment page is currently shared. Customers can view and edit KPIs."
              : "Generate a secure link for customers to collaborate on baseline and target values."}
          </DialogDescription>
        </DialogHeader>

        {activeShareLink ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                readOnly
                value={`${window.location.origin}${existingLink?.shareUrl || ""}`}
                className="flex-1"
                data-testid="input-share-url"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopyLink}
                data-testid="button-copy-link"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="space-y-2 text-sm">
              {activeShareLink.customerName && (
                <p>
                  <span className="text-muted-foreground">Shared with:</span> {activeShareLink.customerName}
                </p>
              )}
              {activeShareLink.expiresAt && (
                <p>
                  <span className="text-muted-foreground">Expires:</span>{" "}
                  {new Date(activeShareLink.expiresAt).toLocaleDateString()}
                </p>
              )}
              <p>
                <span className="text-muted-foreground">Permissions:</span> View, Edit, Comment
              </p>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleRevoke}
              disabled={revokeShareLinkMutation.isPending}
              data-testid="button-revoke-link"
            >
              Revoke Access
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name (Optional)</Label>
              <Input
                id="customerName"
                placeholder="e.g., John Smith"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                data-testid="input-customer-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">Customer Email (Optional)</Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="e.g., john@company.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                data-testid="input-customer-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresIn">Link Expiration</Label>
              <Select value={expiresInDays} onValueChange={setExpiresInDays}>
                <SelectTrigger id="expiresIn" data-testid="select-expiration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="never">Never expires</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {!activeShareLink && (
          <DialogFooter>
            <Button
              onClick={handleCreateShareLink}
              disabled={createShareLinkMutation.isPending}
              data-testid="button-generate-link"
            >
              {createShareLinkMutation.isPending ? "Generating..." : "Generate Link"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
