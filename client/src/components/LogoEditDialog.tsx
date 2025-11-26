import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Loader2, Check, X, RefreshCw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LogoEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  companyName: string;
  currentLogoUrl: string | null;
}

export function LogoEditDialog({
  open,
  onOpenChange,
  projectId,
  companyName,
  currentLogoUrl,
}: LogoEditDialogProps) {
  const { toast } = useToast();
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl || "");
  const [previewError, setPreviewError] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    setLogoUrl(currentLogoUrl || "");
    setPreviewError(false);
    setPreviewLoading(false);
  }, [open, currentLogoUrl]);

  const updateLogoMutation = useMutation({
    mutationFn: async (newLogoUrl: string | null) => {
      const response = await apiRequest("PATCH", `/api/projects/${projectId}/logo`, {
        logoUrl: newLogoUrl,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update logo");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setLogoUrl(data.logoUrl || "");
      setPreviewError(false);
      // Invalidate all project-related queries to ensure UI updates everywhere
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      toast({
        title: data.logoUrl ? "Logo updated" : "Logo removed",
        description: data.logoUrl 
          ? "The company logo has been updated successfully."
          : "The company logo has been removed.",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update logo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const autoFetchMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/fetch-logo`);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.logoUrl) {
        setLogoUrl(data.logoUrl);
        setPreviewError(false);
        toast({
          title: "Logo found",
          description: "A logo was found for this company.",
        });
      } else {
        toast({
          title: "No logo found",
          description: "Could not find a logo for this company automatically.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Search failed",
        description: "Could not search for company logo.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateLogoMutation.mutate(logoUrl);
  };

  const handleClear = () => {
    updateLogoMutation.mutate(null);
  };

  const handlePreviewLoad = () => {
    setPreviewLoading(false);
    setPreviewError(false);
  };

  const handlePreviewError = () => {
    setPreviewLoading(false);
    setPreviewError(true);
  };

  const handleUrlChange = (value: string) => {
    setLogoUrl(value);
    if (value) {
      setPreviewLoading(true);
      setPreviewError(false);
    } else {
      setPreviewLoading(false);
      setPreviewError(false);
    }
  };

  const isValidUrl = logoUrl && !previewError && !previewLoading;
  const hasChanges = logoUrl !== (currentLogoUrl || "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Company Logo</DialogTitle>
          <DialogDescription>
            Set a custom logo for {companyName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center">
            <div className="relative h-24 w-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50">
              {logoUrl ? (
                <>
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className={`h-20 w-20 object-contain rounded ${previewError ? 'hidden' : ''}`}
                    onLoad={handlePreviewLoad}
                    onError={handlePreviewError}
                  />
                  {previewLoading && (
                    <Loader2 className="h-8 w-8 text-muted-foreground animate-spin absolute" />
                  )}
                  {previewError && (
                    <div className="flex flex-col items-center text-destructive">
                      <X className="h-8 w-8" />
                      <span className="text-xs mt-1">Invalid</span>
                    </div>
                  )}
                </>
              ) : (
                <Building2 className="h-12 w-12 text-muted-foreground/50" />
              )}
              {isValidUrl && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <div className="flex gap-2">
              <Input
                id="logoUrl"
                data-testid="input-logo-url"
                placeholder="https://example.com/logo.png"
                value={logoUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => autoFetchMutation.mutate()}
                disabled={autoFetchMutation.isPending}
                title="Auto-fetch logo"
                data-testid="button-auto-fetch-logo"
              >
                {autoFetchMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a direct link to the company logo image, or click the refresh button to auto-fetch.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {currentLogoUrl && (
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              disabled={updateLogoMutation.isPending}
              className="sm:mr-auto"
              data-testid="button-clear-logo"
            >
              Remove Logo
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-logo"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges || previewError || updateLogoMutation.isPending}
            data-testid="button-save-logo"
          >
            {updateLogoMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Logo"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
