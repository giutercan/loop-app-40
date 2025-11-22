import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ConfidenceBadge from "./ConfidenceBadge";
import { ExternalLink, Building2, TrendingUp, Briefcase, BarChart3, Users } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DataPoint {
  label: string;
  value: string;
  confidence: "high" | "medium" | "low";
  source?: string;
}

interface Headline {
  title: string;
  date: string;
  source: string;
  url: string;
}

interface OrganisationCardProps {
  name: string;
  sector: string;
  dataPoints: DataPoint[];
  revenueData?: { month: string; revenue: number }[];
  headlines?: Headline[];
}

export default function OrganisationCard({ 
  name, 
  sector, 
  dataPoints,
  revenueData = [],
  headlines = []
}: OrganisationCardProps) {
  return (
    <Card data-testid="card-organisation">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold">{name}</CardTitle>
              <CardDescription className="mt-1">
                <Badge variant="secondary" className="mt-2">{sector}</Badge>
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dataPoints.map((point, idx) => (
            <div key={idx} className="border rounded-lg p-4 space-y-2" data-testid={`datapoint-${idx}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{point.label}</p>
                <ConfidenceBadge level={point.confidence} />
              </div>
              <p className="text-2xl font-bold font-mono">{point.value}</p>
              {point.source && (
                <a 
                  href="#" 
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                  data-testid={`link-source-${idx}`}
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Source clicked:', point.source);
                  }}
                >
                  <ExternalLink className="w-3 h-3" />
                  {point.source}
                </a>
              )}
            </div>
          ))}
        </div>

        {revenueData.length > 0 && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Revenue Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.375rem'
                  }}
                />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {headlines.length > 0 && (
          <div>
            <Separator className="mb-4" />
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="headlines">
                <AccordionTrigger data-testid="accordion-headlines">
                  Recent Headlines ({headlines.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {headlines.map((headline, idx) => (
                      <div key={idx} className="border-l-4 border-primary pl-4 py-2" data-testid={`headline-${idx}`}>
                        <a 
                          href={headline.url} 
                          className="font-medium hover:text-primary hover:underline"
                          onClick={(e) => {
                            e.preventDefault();
                            console.log('Headline clicked:', headline.title);
                          }}
                        >
                          {headline.title}
                        </a>
                        <p className="text-xs text-muted-foreground mt-1">
                          {headline.source} • {headline.date}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
