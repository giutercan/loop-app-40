import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ConfidenceBadge from "./ConfidenceBadge";
import { ExternalLink, Building2, TrendingUp, Briefcase, BarChart3, Users, CheckSquare, Star, Flame } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DataPoint {
  id?: number;
  label: string;
  value: string;
  confidence: "high" | "medium" | "low";
  source?: string;
  isFollowUp?: boolean;
  selectedForNotes?: boolean;
  relevantJob?: string;
  priorityScore?: number;
  kornFerryPillar?: string;
  solutionArea?: string;
  relatedKPIs?: string[];
}

interface Headline {
  title: string;
  date: string;
  source: string;
  url: string;
  isFollowUp?: boolean;
}

interface OrganisationCardProps {
  name: string;
  sector: string;
  dataPoints: DataPoint[];
  revenueData?: { month: string; revenue: number }[];
  headlines?: Headline[];
  onDataPointSelect?: (id: number, selected: boolean, job?: string) => void;
}

const KORN_FERRY_JOBS = [
  { value: "leadership-development", label: "Leadership Development" },
  { value: "talent-acquisition", label: "Talent Acquisition" },
  { value: "succession-planning", label: "Succession Planning" },
  { value: "culture-transformation", label: "Culture Transformation" },
  { value: "organizational-design", label: "Organizational Design" },
  { value: "change-management", label: "Change Management" },
];

const SOLUTION_AREA_COLORS: Record<string, string> = {
  "ASSESS": "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300",
  "DEVELOP": "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300",
  "TRANSFORM": "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300",
  "REWARD": "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300",
  "COMMERCIAL": "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300",
  "ANALYTICS": "bg-cyan-100 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300",
};

const PriorityIndicator = ({ score = 3 }: { score?: number }) => {
  // Ensure score is in valid range (1-5)
  const validScore = Math.max(1, Math.min(5, score || 3));
  
  if (validScore === 5) {
    return (
      <div className="flex items-center gap-1" title="Critical Priority - Top 3 insights">
        <Flame className="w-3.5 h-3.5 text-orange-500" />
        <span className="text-xs font-semibold text-orange-500">Critical</span>
      </div>
    );
  }
  
  if (validScore === 4) {
    return (
      <div className="flex items-center gap-0.5" title="High Priority">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-3 h-3 ${i < validScore ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
          />
        ))}
      </div>
    );
  }
  
  // For scores 1-3, show a simpler indicator
  return (
    <div className="flex items-center gap-0.5" title={`Priority ${validScore}/5`}>
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          className={`w-2.5 h-2.5 ${i < validScore ? 'fill-muted-foreground/60 text-muted-foreground/60' : 'text-muted-foreground/20'}`}
        />
      ))}
    </div>
  );
};

const getKornFerryPillarLabel = (pillar?: string) => {
  const job = KORN_FERRY_JOBS.find(j => j.value === pillar);
  return job?.label || null;
};

export default function OrganisationCard({ 
  name, 
  sector, 
  dataPoints,
  revenueData = [],
  headlines = [],
  onDataPointSelect
}: OrganisationCardProps) {
  // Categorize data points based on their labels
  const strategicPoints = dataPoints.filter(dp => 
    dp.label.toLowerCase().includes('strategic') || 
    dp.label.toLowerCase().includes('initiative') ||
    dp.label.toLowerCase().includes('transformation') ||
    dp.label.toLowerCase().includes('market position') ||
    dp.label.toLowerCase().includes('investment') ||
    dp.label.toLowerCase().includes('leadership') ||
    dp.label.toLowerCase().includes('m&a') ||
    dp.label.toLowerCase().includes('acquisition') ||
    dp.label.toLowerCase().includes('esg') ||
    dp.label.toLowerCase().includes('sustainability')
  );
  
  const industryPoints = dataPoints.filter(dp => 
    dp.label.toLowerCase().includes('trend') ||
    dp.label.toLowerCase().includes('industry') ||
    dp.label.toLowerCase().includes('competitive') ||
    dp.label.toLowerCase().includes('market') ||
    dp.label.toLowerCase().includes('regulatory') ||
    dp.label.toLowerCase().includes('supply chain') ||
    dp.label.toLowerCase().includes('disruption')
  );
  
  const businessPoints = dataPoints.filter(dp => 
    !strategicPoints.includes(dp) && !industryPoints.includes(dp)
  );

  const renderDataPointSection = (title: string, points: DataPoint[], icon: any, description: string) => {
    if (points.length === 0) return null;
    
    const Icon = icon;
    
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-md shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
        <div className="space-y-2.5 pl-11">
          {points.map((point) => (
            <div 
              key={point.id || point.label} 
              className={`rounded-md p-3 space-y-2.5 hover-elevate ${
                point.priorityScore === 5 
                  ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30'
                  : point.isFollowUp 
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'bg-muted/30'
              }`}
              data-testid={`datapoint-${point.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-medium text-muted-foreground">{point.label}</p>
                  {point.isFollowUp && (
                    <Badge variant="default" className="text-xs px-1.5 py-0 h-5">New</Badge>
                  )}
                  {point.kornFerryPillar && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                      {getKornFerryPillarLabel(point.kornFerryPillar)}
                    </Badge>
                  )}
                  {point.solutionArea && (
                    <Badge 
                      className={`text-xs px-1.5 py-0 h-5 ${SOLUTION_AREA_COLORS[point.solutionArea] || 'bg-secondary text-secondary-foreground'}`}
                      data-testid={`badge-solution-${point.id}`}
                    >
                      {point.solutionArea}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <PriorityIndicator score={point.priorityScore ?? 3} />
                  <ConfidenceBadge level={point.confidence} />
                </div>
              </div>
              <p className="text-sm leading-relaxed">{point.value}</p>
              {point.relatedKPIs && point.relatedKPIs.length > 0 && (
                <div className="flex items-start gap-2 pt-1">
                  <span className="text-xs text-muted-foreground font-medium shrink-0">Relevant KPIs:</span>
                  <div className="flex flex-wrap gap-1">
                    {point.relatedKPIs.map((kpi, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className="text-xs px-1.5 py-0 h-5 font-normal"
                        data-testid={`badge-kpi-${point.id}-${idx}`}
                      >
                        {kpi}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {point.source && (
                <a 
                  href="#" 
                  className="text-xs text-primary hover:underline flex items-center gap-1 w-fit"
                  data-testid={`link-source-${point.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Source clicked:', point.source);
                  }}
                >
                  <ExternalLink className="w-3 h-3" />
                  {point.source}
                </a>
              )}
              {onDataPointSelect && point.id && (
                <div className="flex items-center gap-3 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`select-${point.id}`}
                      checked={point.selectedForNotes}
                      onCheckedChange={(checked) => {
                        // When unchecking, clear the relevantJob to remove it from Notes & Evidence grouping
                        onDataPointSelect(point.id!, checked as boolean, checked ? point.relevantJob : undefined);
                      }}
                      data-testid={`checkbox-select-${point.id}`}
                    />
                    <label 
                      htmlFor={`select-${point.id}`} 
                      className="text-xs font-medium cursor-pointer"
                    >
                      Add to Notes & Evidence
                    </label>
                  </div>
                  {point.selectedForNotes && (
                    <Select
                      value={point.relevantJob || ""}
                      onValueChange={(value) => {
                        // Selecting a job implicitly selects the data point
                        onDataPointSelect(point.id!, true, value);
                      }}
                    >
                      <SelectTrigger className="h-7 w-[200px] text-xs" data-testid={`select-job-${point.id}`}>
                        <SelectValue placeholder="Select job relevance..." />
                      </SelectTrigger>
                      <SelectContent>
                        {KORN_FERRY_JOBS.map(job => (
                          <SelectItem key={job.value} value={job.value} className="text-xs">
                            {job.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card data-testid="card-organisation">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">{name}</CardTitle>
              <CardDescription className="mt-1">
                <Badge variant="secondary" className="mt-1">{sector}</Badge>
              </CardDescription>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Strategic insights to inform Korn Ferry's consulting engagement
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderDataPointSection(
          "Strategic Intelligence",
          strategicPoints,
          Briefcase,
          "Key initiatives and organizational priorities relevant for transformation and leadership advisory"
        )}

        {strategicPoints.length > 0 && industryPoints.length > 0 && <Separator />}

        {renderDataPointSection(
          "Industry Context",
          industryPoints,
          BarChart3,
          "Market dynamics and competitive landscape insights for strategy consulting"
        )}

        {(strategicPoints.length > 0 || industryPoints.length > 0) && businessPoints.length > 0 && <Separator />}

        {renderDataPointSection(
          "Business Performance",
          businessPoints,
          Users,
          "Operational and financial indicators to understand organizational health"
        )}

        {revenueData.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">Revenue Trend</h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.375rem',
                      fontSize: '12px'
                    }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {headlines.length > 0 && (
          <>
            <Separator />
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="headlines" className="border-none">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline py-2" data-testid="accordion-headlines">
                  Recent Headlines & News ({headlines.length})
                </AccordionTrigger>
                <AccordionContent className="pt-3">
                  <p className="text-xs text-muted-foreground mb-3">
                    Strategic news and developments to understand recent company activities
                  </p>
                  <div className="space-y-2">
                    {headlines.map((headline, idx) => (
                      <div 
                        key={idx} 
                        className={`rounded-md p-3 hover-elevate ${
                          headline.isFollowUp 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'bg-muted/30'
                        }`}
                        data-testid={`headline-${idx}`}
                      >
                        <div className="flex items-start gap-2">
                          <a 
                            href={headline.url} 
                            className="text-sm font-medium hover:text-primary hover:underline flex-1"
                            onClick={(e) => {
                              e.preventDefault();
                              console.log('Headline clicked:', headline.title);
                            }}
                          >
                            {headline.title}
                          </a>
                          {headline.isFollowUp && (
                            <Badge variant="default" className="text-xs px-1.5 py-0 h-5 shrink-0">New</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                          <span>{headline.source}</span>
                          <span>•</span>
                          <span>{headline.date}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}
      </CardContent>
    </Card>
  );
}
