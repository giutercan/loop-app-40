import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Github, Loader2, ExternalLink, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export function GitHubExportDialog() {
  const [open, setOpen] = useState(false);
  const [repoName, setRepoName] = useState("korn-ferry-loop");
  const [isPrivate, setIsPrivate] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState<{ repoUrl: string; filesCommitted: number } | null>(null);
  const { toast } = useToast();

  const handleExport = async () => {
    if (!repoName.trim()) {
      toast({ title: "Repository name required", variant: "destructive" });
      return;
    }
    setIsExporting(true);
    setResult(null);
    try {
      const res = await apiRequest("POST", "/api/export/github", { repoName: repoName.trim(), isPrivate });
      const data = await res.json();
      setResult(data);
      toast({ title: "Exported to GitHub", description: `${data.filesCommitted} files pushed to ${data.repoUrl}` });
    } catch (error: any) {
      toast({ title: "Export failed", description: error.message, variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setResult(null); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid="button-github-export">
          <Github className="w-4 h-4 mr-2" />
          Export to GitHub
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export to GitHub</DialogTitle>
          <DialogDescription>Push the entire project codebase to a GitHub repository.</DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30">
              <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm text-muted-foreground">{result.filesCommitted} files exported</p>
            <a href={result.repoUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" data-testid="link-github-repo">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Repository
              </Button>
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="repo-name">Repository Name</Label>
              <Input
                id="repo-name"
                data-testid="input-repo-name"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="my-project"
                disabled={isExporting}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="private-toggle">Private repository</Label>
              <Switch
                id="private-toggle"
                data-testid="switch-private-repo"
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
                disabled={isExporting}
              />
            </div>
            <Button
              onClick={handleExport}
              disabled={isExporting || !repoName.trim()}
              data-testid="button-confirm-export"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Github className="w-4 h-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
