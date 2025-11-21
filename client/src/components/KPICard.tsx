import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import ConfidenceBadge from "./ConfidenceBadge";
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface KPICardProps {
  name: string;
  currentValue: string;
  baselineValue: string;
  delta: number;
  deltaPercentage: number;
  trend: "up" | "down";
  confidence: "high" | "medium" | "low";
  sparklineData: { value: number }[];
  unit?: string;
}

export default function KPICard({
  name,
  currentValue,
  baselineValue,
  delta,
  deltaPercentage,
  trend,
  confidence,
  sparklineData,
  unit = ""
}: KPICardProps) {
  const isPositive = trend === "up";
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className="hover-elevate" data-testid="card-kpi">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold">{name}</CardTitle>
          <ConfidenceBadge level={confidence} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-mono">{currentValue}</span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={isPositive ? "default" : "destructive"} 
              className="gap-1"
              data-testid="badge-trend"
            >
              <TrendIcon className="w-3 h-3" />
              {deltaPercentage > 0 ? "+" : ""}{deltaPercentage}%
            </Badge>
            <span className="text-sm text-muted-foreground">
              {delta > 0 ? "+" : ""}{delta} {unit} from baseline
            </span>
          </div>
        </div>

        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-3 border-t space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Baseline</span>
            <span className="font-medium font-mono">{baselineValue}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current</span>
            <span className="font-bold font-mono">{currentValue}</span>
          </div>
          <a 
            href="#" 
            className="text-xs text-primary hover:underline flex items-center gap-1 pt-2"
            data-testid="link-provenance"
            onClick={(e) => {
              e.preventDefault();
              console.log('View provenance clicked');
            }}
          >
            <ExternalLink className="w-3 h-3" />
            View Provenance
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
