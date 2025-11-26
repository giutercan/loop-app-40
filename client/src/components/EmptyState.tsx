import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  testId?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
  testId,
}: EmptyStateProps) {
  return (
    <Card className={`max-w-2xl mx-auto ${className}`} data-testid={testId}>
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-center">{title}</CardTitle>
        <CardDescription className="text-center">{description}</CardDescription>
      </CardHeader>
      {actionLabel && onAction && (
        <CardContent className="flex justify-center pb-6">
          <Button onClick={onAction} data-testid={`${testId}-action`}>
            {actionLabel}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
