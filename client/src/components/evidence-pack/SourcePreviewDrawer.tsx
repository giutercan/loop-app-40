import { useLocation } from "wouter";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import type { EvidencePackItem } from "@shared/schema";
import { sourceTypeConfig } from "./SourceLink";

export interface SourcePreviewDrawerProps {
  item: EvidencePackItem | null;
  projectId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SourcePreviewDrawer({ item, projectId, open, onOpenChange }: SourcePreviewDrawerProps) {
  const [, setLocation] = useLocation();
  
  if (!item) return null;
  
  const sourceType = item.sourceType as string;
  const config = sourceTypeConfig[sourceType];
  const path = config?.getPath(projectId, item.sourceId, item.links);
  const itemContent = item.content as Record<string, any> || {};
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="sm:max-w-md" 
        aria-label="Source details drawer"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {config && <config.icon className="w-5 h-5" aria-hidden="true" />}
            Source Details
          </SheetTitle>
          <SheetDescription>
            {config?.label || "Source"} for this evidence item
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-4" role="region" aria-label="Source information">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Evidence Claim</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{item.claim}</p>
            </CardContent>
          </Card>
          
          {Object.keys(itemContent).length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Source Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2" role="list" aria-label="Source data fields">
                {itemContent.metricName && (
                  <div className="flex justify-between text-sm" role="listitem">
                    <span className="text-muted-foreground">Metric</span>
                    <span className="font-medium">{itemContent.metricName}</span>
                  </div>
                )}
                {itemContent.baselineValue && (
                  <div className="flex justify-between text-sm" role="listitem">
                    <span className="text-muted-foreground">Baseline</span>
                    <span className="font-medium">{itemContent.baselineValue} {itemContent.unit || ''}</span>
                  </div>
                )}
                {itemContent.targetValue && (
                  <div className="flex justify-between text-sm" role="listitem">
                    <span className="text-muted-foreground">Target</span>
                    <span className="font-medium">{itemContent.targetValue} {itemContent.unit || ''}</span>
                  </div>
                )}
                {itemContent.stakeholderName && (
                  <div className="flex justify-between text-sm" role="listitem">
                    <span className="text-muted-foreground">Stakeholder</span>
                    <span className="font-medium">{itemContent.stakeholderName}</span>
                  </div>
                )}
                {itemContent.stakeholderRole && (
                  <div className="flex justify-between text-sm" role="listitem">
                    <span className="text-muted-foreground">Role</span>
                    <span className="font-medium">{itemContent.stakeholderRole}</span>
                  </div>
                )}
                {itemContent.riskDescription && (
                  <div className="text-sm" role="listitem">
                    <span className="text-muted-foreground block mb-1">Risk Description</span>
                    <p className="text-sm">{itemContent.riskDescription}</p>
                  </div>
                )}
                {itemContent.severity && (
                  <div className="flex justify-between text-sm" role="listitem">
                    <span className="text-muted-foreground">Severity</span>
                    <Badge variant="outline" className="text-xs">{itemContent.severity}</Badge>
                  </div>
                )}
                {itemContent.mitigationPlan && (
                  <div className="text-sm" role="listitem">
                    <span className="text-muted-foreground block mb-1">Mitigation</span>
                    <p className="text-sm">{itemContent.mitigationPlan}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Provenance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2" role="list" aria-label="Provenance details">
              <div className="flex justify-between text-sm" role="listitem">
                <span className="text-muted-foreground">Source Type</span>
                <Badge variant="outline" className="text-xs">{sourceType.replace(/_/g, ' ')}</Badge>
              </div>
              {item.sourceId && (
                <div className="flex justify-between text-sm" role="listitem">
                  <span className="text-muted-foreground">Source ID</span>
                  <span className="font-mono text-xs">{item.sourceId}</span>
                </div>
              )}
              {item.sourceKind && (
                <div className="flex justify-between text-sm" role="listitem">
                  <span className="text-muted-foreground">Origin</span>
                  <Badge variant="outline" className="text-xs">{item.sourceKind}</Badge>
                </div>
              )}
              {item.confidenceLevel && (
                <div className="flex justify-between text-sm" role="listitem">
                  <span className="text-muted-foreground">Confidence</span>
                  <Badge 
                    className={`text-xs ${
                      item.confidenceLevel === 'high' ? 'bg-green-500/20 text-green-700 dark:text-green-400' :
                      item.confidenceLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                      'bg-muted text-muted-foreground'
                    }`}
                  >
                    {item.confidenceLevel}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
          
          {path && (
            <Button 
              className="w-full" 
              onClick={() => {
                onOpenChange(false);
                setLocation(path);
              }}
              data-testid="button-go-to-source"
              aria-label={`Navigate to full ${config?.label || 'source'} page`}
            >
              <ExternalLink className="w-4 h-4 mr-2" aria-hidden="true" />
              Go to Full Source
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
