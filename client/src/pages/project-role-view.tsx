import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  ArrowLeft,
  ArrowRight,
  Building2, 
  TrendingUp, 
  Target, 
  Users,
  Briefcase,
  BarChart3,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  Clock,
  FileText,
  ChevronRight,
  ChevronDown,
  Star,
  Plus,
  DollarSign,
  Lightbulb,
  RefreshCcw,
  LineChart,
  PieChart,
  ArrowUpRight,
  Download,
  Calendar,
  Eye,
  MessageSquare,
  ClipboardList,
  Layers,
  Activity,
  FileCheck,
  UserCheck,
  Sparkles,
  Loader2,
  HelpCircle,
  Check,
  Database,
  UserCircle,
  Phone,
  Mail,
  Flag,
  Shield,
  Zap,
  FileSearch,
  Newspaper,
  TrendingDown,
  Globe,
  Trophy,
  Heart,
  Award,
  MessageCircle,
  ExternalLink,
  X,
  Play,
  Search,
  RefreshCw
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, JobTheme } from "@shared/schema";

type Role = "sales" | "consultant" | "delivery" | "csm" | "client_sponsor";

interface KPI {
  id: number;
  name: string;
  unit: string | null;
  baselineValue: number | null;
  targetValue: number | null;
  currentValue: number | null;
  status: "on-track" | "at-risk" | "off-track" | "no-data";
}

interface ProjectInsight {
  id: number;
  content: string;
  priority: string | null;
  confidence: string | null;
  kornferryPillar: string | null;
  solutionArea: string | null;
}

interface Note {
  id: number;
  content: string;
  category: string | null;
  createdAt: string;
}

interface ValueCase {
  id: number;
  title: string;
  description: string | null;
  status: string;
  estimatedValue: number | null;
}

interface DiscoveryQuestion {
  id: number;
  projectId: number;
  capabilityName: string;
  question: string;
  questionType: "quantitative" | "qualitative" | "both";
  methodology: "MILLER_HEIMAN" | "SPIN" | "PSS" | null;
  methodologyStage: string | null;
  purpose: string;
  relatedKPI: string | null;
  followUpHint: string | null;
  answer: string | null;
  isAsked: boolean;
  notes: string | null;
  isTemplate: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface SalesforceOpportunity {
  id: string;
  name: string;
  stage: string;
  amount: number;
  probability: number;
  closeDate: string;
  owner: string;
  nextStep: string;
}

interface SalesforceContact {
  id: string;
  name: string;
  title: string;
  role: "economic_buyer" | "user_buyer" | "technical_buyer" | "coach" | "champion";
  email: string;
  phone: string;
  lastActivity: string;
  influence: "high" | "medium" | "low";
}

interface BlueSheetData {
  singleSalesObjective: string;
  idealCustomerCriteria: string[];
  buyingInfluences: {
    type: string;
    name: string;
    rating: "G" | "Y" | "R";
    action: string;
  }[];
  redFlags: string[];
  strengthsLeverage: string[];
  competition: {
    competitor: string;
    position: string;
    strategy: string;
  }[];
  bestActionPlan: string[];
}

interface EnhancedOpportunity extends SalesforceOpportunity {
  redFlags: string[];
  greenFlags: string[];
  blueSheet: {
    singleSalesObjective: string;
    idealCustomerProfile: string;
    competitiveAdvantage: string;
    minAcceptableOutcome: string;
  };
  buyingInfluences: {
    contactId: string;
    name: string;
    title: string;
    role: SalesforceContact["role"];
    influence: "high" | "medium" | "low";
    rating: "growth" | "trouble" | "even_keel" | "overconfident";
    degreeOfInfluence: number;
    concerns: string;
  }[];
  actionPlan: {
    priority: "high" | "medium" | "low";
    action: string;
    owner: string;
    dueDate: string;
  }[];
}

function generateSimulatedSalesforceData(companyName: string): { opportunities: EnhancedOpportunity[]; contacts: SalesforceContact[]; crossOpportunityInfluences: { name: string; title: string; role: string; opportunities: string[]; }[] } {
  const stages = ["Qualification", "Needs Analysis", "Proposal", "Negotiation", "Closed Won"];
  const titles = ["CHRO", "VP HR", "Head of Talent", "CFO", "CEO", "VP L&D", "Director Comp & Benefits"];
  const roles: SalesforceContact["role"][] = ["economic_buyer", "user_buyer", "technical_buyer", "coach", "champion"];
  
  const opportunities: EnhancedOpportunity[] = [
    {
      id: "OPP-001",
      name: `${companyName} - Leadership Development Initiative`,
      stage: "Proposal",
      amount: 850000,
      probability: 65,
      closeDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      owner: "Sarah Mitchell",
      nextStep: "Executive presentation scheduled for next week",
      redFlags: [
        "CFO has not been engaged - risk of budget objection",
        "Competitor (DDI) has existing relationship with VP L&D",
        "Timeline pressure - fiscal year budget expires in 60 days"
      ],
      greenFlags: [
        "CHRO is strong executive sponsor",
        "Clear pain point documented from earnings call",
        "Budget already allocated in HR strategic plan",
        "Champion (Maria Santos) actively selling internally"
      ],
      blueSheet: {
        singleSalesObjective: "Close $850K leadership development program including assessment, coaching, and L&D curriculum by Q1 end",
        idealCustomerProfile: "Global enterprise with 10,000+ employees, recent transformation initiative, leadership pipeline concerns",
        competitiveAdvantage: "Integrated assessment-to-development approach, Korn Ferry benchmarks, proven ROI methodology",
        minAcceptableOutcome: "$500K initial phase with expansion pathway"
      },
      buyingInfluences: [
        { contactId: "CON-001", name: "Jennifer Williams", title: "CHRO", role: "economic_buyer", influence: "high", rating: "growth", degreeOfInfluence: 5, concerns: "Wants measurable leadership bench strength improvement" },
        { contactId: "CON-003", name: "Maria Santos", title: "Head of L&D", role: "champion", influence: "high", rating: "growth", degreeOfInfluence: 4, concerns: "Needs scalable program that integrates with existing LMS" },
        { contactId: "CON-004", name: "Robert Kim", title: "CFO", role: "economic_buyer", influence: "high", rating: "even_keel", degreeOfInfluence: 5, concerns: "Requires clear ROI and payback period documentation" }
      ],
      actionPlan: [
        { priority: "high", action: "Schedule CFO ROI presentation with value case", owner: "Sarah Mitchell", dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { priority: "high", action: "Prepare competitive differentiation vs DDI", owner: "Solutions Team", dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { priority: "medium", action: "Get Maria to introduce us to VP L&D", owner: "Sarah Mitchell", dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
      ]
    },
    {
      id: "OPP-002",
      name: `${companyName} - Talent Assessment Program`,
      stage: "Needs Analysis",
      amount: 320000,
      probability: 40,
      closeDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      owner: "Michael Chen",
      nextStep: "Discovery workshop with HR leadership",
      redFlags: [
        "No executive sponsor identified yet",
        "Competing priorities with digital transformation",
        "Procurement process unclear"
      ],
      greenFlags: [
        "Strong user buyer engagement from VP TA",
        "Existing relationship from previous project",
        "Clear hiring quality issues documented"
      ],
      blueSheet: {
        singleSalesObjective: "Win $320K assessment platform deal for high-volume hiring roles by Q2",
        idealCustomerProfile: "Company with 500+ annual hires, quality of hire concerns, willing to invest in predictive hiring",
        competitiveAdvantage: "AI-powered assessments, validated success profiles, integration capabilities",
        minAcceptableOutcome: "$150K pilot program with 3 role families"
      },
      buyingInfluences: [
        { contactId: "CON-002", name: "David Thompson", title: "VP Talent Acquisition", role: "user_buyer", influence: "medium", rating: "growth", degreeOfInfluence: 3, concerns: "Wants to reduce time-to-hire and improve quality metrics" },
        { contactId: "CON-001", name: "Jennifer Williams", title: "CHRO", role: "economic_buyer", influence: "high", rating: "even_keel", degreeOfInfluence: 4, concerns: "Needs alignment with broader HR technology strategy" }
      ],
      actionPlan: [
        { priority: "high", action: "Identify and engage executive sponsor", owner: "Michael Chen", dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { priority: "medium", action: "Map procurement process and timeline", owner: "Michael Chen", dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { priority: "medium", action: "Prepare ROI case study from similar industry", owner: "Solutions Team", dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
      ]
    },
    {
      id: "OPP-003",
      name: `${companyName} - Pay Equity Analysis`,
      stage: "Qualification",
      amount: 180000,
      probability: 25,
      closeDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      owner: "Sarah Mitchell",
      nextStep: "Initial scoping call with Comp team",
      redFlags: [
        "Legal team driving - may prefer legal firm",
        "Low urgency despite lawsuit news",
        "Budget not yet approved"
      ],
      greenFlags: [
        "Recent lawsuit creates external pressure",
        "CHRO publicly committed to fair pay",
        "Korn Ferry has strong pay equity reputation"
      ],
      blueSheet: {
        singleSalesObjective: "Win $180K pay equity analysis and remediation planning engagement",
        idealCustomerProfile: "Company facing pay equity scrutiny, public commitment to DEI, budget for remediation",
        competitiveAdvantage: "Korn Ferry pay data, statistical analysis expertise, remediation planning experience",
        minAcceptableOutcome: "$80K diagnostic analysis with remediation roadmap"
      },
      buyingInfluences: [
        { contactId: "CON-001", name: "Jennifer Williams", title: "CHRO", role: "economic_buyer", influence: "high", rating: "trouble", degreeOfInfluence: 5, concerns: "Under board pressure to address pay equity quickly" },
        { contactId: "CON-005", name: "Lisa Park", title: "Director Compensation", role: "user_buyer", influence: "medium", rating: "even_keel", degreeOfInfluence: 3, concerns: "Needs methodology that stands up to legal scrutiny" }
      ],
      actionPlan: [
        { priority: "high", action: "Connect with General Counsel to understand legal requirements", owner: "Sarah Mitchell", dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { priority: "high", action: "Prepare pay equity case study with legal defensibility angle", owner: "Solutions Team", dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { priority: "medium", action: "Get budget confirmation from CHRO", owner: "Sarah Mitchell", dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
      ]
    }
  ];
  
  const contacts: SalesforceContact[] = [
    {
      id: "CON-001",
      name: "Jennifer Williams",
      title: "CHRO",
      role: "economic_buyer",
      email: `j.williams@${companyName.toLowerCase().replace(/\s/g, '')}.com`,
      phone: "+1 (555) 123-4567",
      lastActivity: "Met at industry conference - discussed succession challenges",
      influence: "high"
    },
    {
      id: "CON-002",
      name: "David Thompson",
      title: "VP Talent Acquisition",
      role: "user_buyer",
      email: `d.thompson@${companyName.toLowerCase().replace(/\s/g, '')}.com`,
      phone: "+1 (555) 234-5678",
      lastActivity: "Demo of assessment platform - very engaged",
      influence: "medium"
    },
    {
      id: "CON-003",
      name: "Maria Santos",
      title: "Head of L&D",
      role: "champion",
      email: `m.santos@${companyName.toLowerCase().replace(/\s/g, '')}.com`,
      phone: "+1 (555) 345-6789",
      lastActivity: "Strong advocate - wants to pilot new programs",
      influence: "high"
    },
    {
      id: "CON-004",
      name: "Robert Kim",
      title: "CFO",
      role: "economic_buyer",
      email: `r.kim@${companyName.toLowerCase().replace(/\s/g, '')}.com`,
      phone: "+1 (555) 456-7890",
      lastActivity: "Budget approval meeting - needs ROI data",
      influence: "high"
    },
    {
      id: "CON-005",
      name: "Lisa Park",
      title: "Director Compensation",
      role: "user_buyer",
      email: `l.park@${companyName.toLowerCase().replace(/\s/g, '')}.com`,
      phone: "+1 (555) 567-8901",
      lastActivity: "Initial call - interested in pay equity methodology",
      influence: "medium"
    }
  ];
  
  // Find buying influences that appear in multiple opportunities
  const influenceCount: Record<string, { name: string; title: string; role: string; opportunities: string[] }> = {};
  opportunities.forEach(opp => {
    opp.buyingInfluences.forEach(bi => {
      if (!influenceCount[bi.contactId]) {
        influenceCount[bi.contactId] = { name: bi.name, title: bi.title, role: bi.role, opportunities: [] };
      }
      influenceCount[bi.contactId].opportunities.push(opp.name);
    });
  });
  
  const crossOpportunityInfluences = Object.values(influenceCount).filter(ic => ic.opportunities.length > 1);
  
  return { opportunities, contacts, crossOpportunityInfluences };
}

interface MarketIntelligence {
  recentNews: {
    date: string;
    headline: string;
    source: string;
    sourceUrl: string;
    summary: string;
    relevance: "high" | "medium" | "low";
  }[];
  annualReportHighlights: {
    fiscalYear: string;
    revenue: string;
    headcount: string;
    strategicPriorities: string[];
    hrInitiatives: string[];
  };
  earningsCallInsights: {
    quarter: string;
    ceoQuotes: string[];
    talentMentions: string[];
    challengesDiscussed: string[];
  };
  industryTrends: {
    trend: string;
    impact: string;
    opportunity: string;
    themes: string[];
  }[];
}

function generateMarketIntelligence(companyName: string, themeId?: string): MarketIntelligence {
  const allNews = [
    {
      date: "Nov 15, 2024",
      headline: `${companyName} Announces Major Digital Transformation Initiative`,
      source: "Business Wire",
      sourceUrl: "https://www.businesswire.com/news/",
      summary: "Company commits $500M to modernize operations and upskill workforce over next 3 years. CHRO Jennifer Williams quoted on 'people-first approach to transformation.'",
      relevance: "high" as const,
      themes: ["transformation", "leadership"]
    },
    {
      date: "Nov 8, 2024",
      headline: `${companyName} Reports Q3 Results, Beats Expectations Despite Headwinds`,
      source: "Reuters",
      sourceUrl: "https://www.reuters.com/business/",
      summary: "Revenue up 8% YoY. CEO emphasized need for 'talent agility' to navigate market uncertainty. Plans to invest in leadership development.",
      relevance: "high" as const,
      themes: ["leadership", "sales-effectiveness"]
    },
    {
      date: "Oct 28, 2024",
      headline: `${companyName} Named to Fortune 100 Best Companies to Work For`,
      source: "Fortune",
      sourceUrl: "https://fortune.com/ranking/best-companies/",
      summary: "Recognized for learning & development programs and inclusive culture. Employee engagement scores up 12 points from prior year.",
      relevance: "medium" as const,
      themes: ["leadership", "talent-acquisition"]
    },
    {
      date: "Oct 15, 2024",
      headline: `Industry Report: Skills Gap Threatens Growth for Companies Like ${companyName}`,
      source: "McKinsey Quarterly",
      sourceUrl: "https://www.mckinsey.com/quarterly/",
      summary: `Study finds 67% of companies in this sector face critical leadership pipeline gaps. ${companyName} specifically mentioned as seeking external solutions.`,
      relevance: "high" as const,
      themes: ["leadership", "talent-acquisition"]
    },
    {
      date: "Nov 12, 2024",
      headline: `${companyName} CHRO Discusses Succession Planning at Industry Conference`,
      source: "HR Executive",
      sourceUrl: "https://hrexecutive.com/",
      summary: "Jennifer Williams outlined 3-year plan to develop 120 senior leaders internally. 'We need to build our bench strength for the next decade of growth.'",
      relevance: "high" as const,
      themes: ["leadership"]
    },
    {
      date: "Nov 5, 2024",
      headline: `${companyName} Launches AI-Powered Hiring Platform`,
      source: "TechCrunch",
      sourceUrl: "https://techcrunch.com/",
      summary: "New platform aims to reduce time-to-hire by 40% and improve quality of hire metrics. Piloting in technology and sales divisions first.",
      relevance: "high" as const,
      themes: ["talent-acquisition"]
    },
    {
      date: "Oct 20, 2024",
      headline: `${companyName} Restructures Commercial Operations for Growth`,
      source: "Wall Street Journal",
      sourceUrl: "https://www.wsj.com/business/",
      summary: "Major reorganization of sales and go-to-market teams. CEO: 'We're building a commercial engine that can scale globally.'",
      relevance: "high" as const,
      themes: ["transformation", "sales-effectiveness"]
    },
    {
      date: "Nov 1, 2024",
      headline: `${companyName} Faces Pay Equity Lawsuit, Pledges Compensation Review`,
      source: "Bloomberg",
      sourceUrl: "https://www.bloomberg.com/",
      summary: "Company commits to third-party compensation audit following class action. CHRO states commitment to 'fair and competitive pay for all employees.'",
      relevance: "high" as const,
      themes: ["rewards"]
    },
    {
      date: "Oct 25, 2024",
      headline: `${companyName} Announces New Benefits Package, Stock Options for All`,
      source: "CNBC",
      sourceUrl: "https://www.cnbc.com/",
      summary: "Expanded equity participation and mental health benefits aim to improve retention. CFO notes 'investment in our people pays dividends.'",
      relevance: "high" as const,
      themes: ["rewards"]
    },
    {
      date: "Nov 10, 2024",
      headline: `${companyName} Sales Force Expansion: 500 New Hires Planned`,
      source: "Sales Force Magazine",
      sourceUrl: "https://www.salesforcemag.com/",
      summary: "Aggressive hiring in enterprise sales as company targets 30% revenue growth. VP Sales: 'We need elite talent to capture market opportunity.'",
      relevance: "high" as const,
      themes: ["sales-effectiveness", "talent-acquisition"]
    }
  ];

  const filteredNews = themeId 
    ? allNews.filter(n => n.themes.includes(themeId)).slice(0, 5)
    : allNews.slice(0, 4);

  return {
    recentNews: filteredNews.map(({ themes, ...rest }) => rest),
    annualReportHighlights: {
      fiscalYear: "FY2024",
      revenue: "$12.4B (up 11% YoY)",
      headcount: "45,000 employees globally",
      strategicPriorities: [
        "Accelerate digital transformation across all business units",
        "Build next-generation leadership bench",
        "Drive operational excellence through talent optimization",
        "Expand into emerging markets with local leadership"
      ],
      hrInitiatives: [
        "Launch enterprise-wide leadership competency framework",
        "Implement AI-powered talent marketplace",
        "Reduce voluntary turnover by 15% in critical roles",
        "Increase internal mobility to 40% of open roles"
      ]
    },
    earningsCallInsights: {
      quarter: "Q3 FY2024",
      ceoQuotes: [
        "Our people are our greatest competitive advantage. We're doubling down on leadership development.",
        "The board has approved significant investment in our talent infrastructure for 2025.",
        "We're looking for strategic partners who understand enterprise transformation."
      ],
      talentMentions: [
        "Succession planning for 120 senior roles over next 18 months",
        "Hiring 2,000 new roles in technology and analytics",
        "Launching executive assessment program in Q1 2025",
        "CHRO leading new 'Future of Work' task force"
      ],
      challengesDiscussed: [
        "Competition for AI/ML talent intensifying",
        "Mid-level manager capability gaps affecting execution",
        "Need to accelerate time-to-productivity for new hires",
        "Succession risk in several critical business units"
      ]
    },
    industryTrends: [
      {
        trend: "Skills-based hiring gaining momentum",
        impact: "Traditional job architectures becoming obsolete",
        opportunity: "Position Korn Ferry's skills taxonomy and assessment capabilities",
        themes: ["talent-acquisition", "transformation"]
      },
      {
        trend: "AI disruption creating leadership uncertainty",
        impact: "Executives unsure how to lead through transformation",
        opportunity: "Leverage Korn Ferry's AI leadership research and development programs",
        themes: ["leadership", "transformation"]
      },
      {
        trend: "Pay transparency regulations expanding",
        impact: "Companies scrambling to address equity and competitiveness",
        opportunity: "Highlight Korn Ferry's compensation benchmarking and pay equity solutions",
        themes: ["rewards"]
      },
      {
        trend: "Hybrid work models becoming permanent",
        impact: "Manager effectiveness declining in distributed teams",
        opportunity: "Propose leadership development focused on virtual team effectiveness",
        themes: ["leadership", "sales-effectiveness"]
      }
    ]
  };
}

function generateBlueSheetData(companyName: string): BlueSheetData {
  return {
    singleSalesObjective: `Secure a $1.2M multi-year engagement with ${companyName} for comprehensive leadership development and talent assessment programs, with initial implementation in Q2.`,
    idealCustomerCriteria: [
      "Large enterprise (10,000+ employees) undergoing transformation",
      "Commitment to data-driven talent decisions",
      "Active investment in leadership pipeline",
      "Executive sponsorship for people initiatives",
      "Budget allocation for external consulting"
    ],
    buyingInfluences: [
      { type: "Economic Buyer", name: "Jennifer Williams (CHRO)", rating: "G", action: "Schedule 1:1 to discuss strategic alignment" },
      { type: "Economic Buyer", name: "Robert Kim (CFO)", rating: "Y", action: "Prepare ROI analysis and case studies" },
      { type: "User Buyer", name: "David Thompson (VP TA)", rating: "G", action: "Provide demo access and references" },
      { type: "User Buyer", name: "Maria Santos (Head L&D)", rating: "G", action: "Engage as champion for internal advocacy" },
      { type: "Technical Buyer", name: "IT Security Team", rating: "Y", action: "Complete security questionnaire" },
      { type: "Coach", name: "Maria Santos", rating: "G", action: "Weekly check-ins on internal politics" }
    ],
    redFlags: [
      "CFO focus on cost reduction may impact budget approval",
      "Competing initiative from McKinsey on org design",
      "New CEO starting in Q3 could reset priorities",
      "IT integration concerns with existing HRIS"
    ],
    strengthsLeverage: [
      "Strong existing relationship with CHRO from previous company",
      "Successful case study from competitor in same industry",
      "Unique IP in AI-powered leadership assessment",
      "Champion actively promoting internally"
    ],
    competition: [
      { competitor: "McKinsey", position: "Incumbent on org design", strategy: "Differentiate on talent-specific expertise and IP" },
      { competitor: "DDI", position: "Proposed for assessment", strategy: "Emphasize integrated approach and proven methodology" },
      { competitor: "Internal HR", position: "DIY option", strategy: "Show ROI vs. internal resource constraints" }
    ],
    bestActionPlan: [
      "Week 1: Schedule CFO meeting with ROI presentation and industry benchmarks",
      "Week 2: Facilitate peer reference call with similar client CHRO",
      "Week 3: Present pilot proposal with success metrics and milestones",
      "Week 4: Address IT security concerns through technical deep-dive",
      "Week 5: Coordinate champion to gain internal momentum before CEO transition"
    ]
  };
}

const methodologyMeta: Record<string, { label: string; color: string; description: string }> = {
  SPIN: { 
    label: "SPIN Selling", 
    color: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    description: "Situation, Problem, Implication, Need-Payoff"
  },
  MILLER_HEIMAN: { 
    label: "Miller Heiman", 
    color: "bg-purple-500/10 text-purple-700 border-purple-500/20",
    description: "Strategic Selling Framework"
  },
  PSS: { 
    label: "PSS", 
    color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    description: "Professional Selling Skills"
  }
};

const stageMeta: Record<string, string> = {
  situation: "Situation",
  problem: "Problem", 
  implication: "Implication",
  need_payoff: "Need-Payoff",
  conceptual: "Conceptual",
  attitude: "Attitude",
  commitment: "Commitment",
  open_probe: "Open Probe",
  control_probe: "Control Probe",
  confirm_probe: "Confirm Probe"
};

const validRoles: Role[] = ["sales", "consultant", "delivery", "csm", "client_sponsor"];

const roleLabels: Record<Role, string> = {
  sales: "Sales",
  consultant: "Consultant",
  delivery: "Delivery",
  csm: "Customer Success",
  client_sponsor: "Client Sponsor"
};

const roleIcons: Record<Role, typeof DollarSign> = {
  sales: DollarSign,
  consultant: Lightbulb,
  delivery: LineChart,
  csm: Users,
  client_sponsor: Target
};

const phaseLabels: Record<string, string> = {
  discover_qualify: "Discover & Qualify",
  shape_sell: "Shape & Sell",
  deliver_realise: "Deliver & Realise",
  review_renew: "Review & Renew",
  learn_scale: "Learn & Scale"
};

const ragColors: Record<string, string> = {
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500"
};

export default function ProjectRoleView() {
  const [, params] = useRoute("/projects/:id/:role");
  const projectId = parseInt(params?.id || "0");
  const roleParam = params?.role || "";
  const role = validRoles.includes(roleParam as Role) ? (roleParam as Role) : null;
  const { toast } = useToast();
  
  const isSalesRoleParam = roleParam === "sales" || roleParam === "consultant";
  const isDeliveryRoleParam = roleParam === "delivery" || roleParam === "csm";
  const [activeTab, setActiveTab] = useState(isSalesRoleParam ? "guided-discovery" : "health");
  const [isLogKPIOpen, setIsLogKPIOpen] = useState(false);
  
  // Reset tab when role changes
  useEffect(() => {
    if (isSalesRoleParam) {
      setActiveTab("guided-discovery");
    } else if (isDeliveryRoleParam) {
      setActiveTab("health");
    }
  }, [roleParam, isSalesRoleParam, isDeliveryRoleParam]);
  const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);
  const [kpiActualValue, setKpiActualValue] = useState("");
  const [kpiNote, setKpiNote] = useState("");
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteCategory, setNewNoteCategory] = useState("general");
  
  // Discovery workflow state
  const [discoveryStep, setDiscoveryStep] = useState<"theme-select" | "intelligence" | "questions" | "review" | "insights">("theme-select");
  const [selectedDiscoveryTheme, setSelectedDiscoveryTheme] = useState<string | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  const [questionAnswers, setQuestionAnswers] = useState<Record<number, string>>({});
  const [discoveryCompleted, setDiscoveryCompleted] = useState(false);
  
  // Interactive Call Builder state
  const [callPhase, setCallPhase] = useState<"opening" | "discovery" | "support" | "closing">("opening");
  const [myCallFlow, setMyCallFlow] = useState<{id: number; question: string; phase: string; methodology?: string}[]>([]);
  const [activeMethodologyFilter, setActiveMethodologyFilter] = useState<string | null>(null);
  const [showCoachingTip, setShowCoachingTip] = useState(true);
  
  // Legacy discovery mode (for backward compatibility)
  const [isDiscoveryModeDialogOpen, setIsDiscoveryModeDialogOpen] = useState(false);
  const [discoveryMode, setDiscoveryMode] = useState<"focused" | "full">("full");
  const [selectedSolutionArea, setSelectedSolutionArea] = useState<string>("");
  
  // Korn Ferry Solution Areas
  const solutionAreas = [
    { id: "ASSESS", name: "Assess", description: "Success Profiles & Assessments" },
    { id: "DEVELOP", name: "Develop", description: "Leadership & Development" },
    { id: "TRANSFORM", name: "Transform", description: "Organisation Strategy" },
    { id: "REWARD", name: "Reward", description: "Total Rewards" },
    { id: "COMMERCIAL", name: "Commercial", description: "Sales Effectiveness" }
  ];
  
  // Discovery Themes aligned with Korn Ferry offerings - with opportunity focus
  const discoveryThemes = [
    { 
      id: "kf-full-search", 
      name: "We are Korn Ferry", 
      icon: Building2,
      color: "primary",
      description: "Comprehensive search across ALL Korn Ferry capabilities - AI identifies opportunities by solution area",
      kornferryOffering: "Full Korn Ferry Suite",
      valueProposition: "End-to-end organizational consulting for talent strategy, leadership, and business performance",
      opportunitySignals: ["executive transition", "growth plans", "M&A", "digital transformation", "talent crisis", "performance gaps"],
      isFullSearch: true
    },
    { 
      id: "leadership", 
      name: "Leadership Development", 
      icon: Users,
      color: "blue",
      description: "Build next-generation leaders and executive bench strength",
      kornferryOffering: "Korn Ferry Leadership & Development",
      valueProposition: "Accelerate leader readiness, build succession pipelines, and develop high-potential talent",
      opportunitySignals: ["CEO succession", "leadership gaps", "executive turnover", "growth requiring new leaders", "merger integration", "new strategy execution"],
      howWeHelp: [
        "Leadership assessment and development programs",
        "Succession planning and bench strength building", 
        "Executive coaching and onboarding",
        "High-potential identification and acceleration"
      ]
    },
    { 
      id: "talent-acquisition", 
      name: "Talent Acquisition & Assessment", 
      icon: UserCheck,
      color: "purple",
      description: "Improve hiring quality and reduce mis-hires",
      kornferryOffering: "Korn Ferry Assess",
      valueProposition: "Hire the right people, reduce turnover, and build predictive selection processes",
      opportunitySignals: ["high turnover", "hiring challenges", "skills gaps", "expansion hiring", "quality of hire issues", "DEI initiatives"],
      howWeHelp: [
        "Success profiles and competency frameworks",
        "Assessment and selection tools",
        "Interview training and calibration",
        "Candidate experience optimization"
      ]
    },
    { 
      id: "transformation", 
      name: "Organizational Transformation", 
      icon: RefreshCcw,
      color: "emerald",
      description: "Restructure for agility, efficiency, and growth",
      kornferryOffering: "Korn Ferry Transform",
      valueProposition: "Design operating models that drive performance, reduce costs, and enable strategy",
      opportunitySignals: ["restructuring", "cost reduction", "efficiency programs", "M&A integration", "digital transformation", "new operating model"],
      howWeHelp: [
        "Organization design and restructuring",
        "Operating model optimization",
        "Culture transformation",
        "Change management and adoption"
      ]
    },
    { 
      id: "rewards", 
      name: "Total Rewards & Compensation", 
      icon: DollarSign,
      color: "amber",
      description: "Optimize pay, benefits, and retention strategies",
      kornferryOffering: "Korn Ferry Reward",
      valueProposition: "Attract, retain, and motivate talent through competitive and equitable rewards",
      opportunitySignals: ["pay equity concerns", "retention issues", "compensation reviews", "executive pay scrutiny", "benefits redesign", "incentive misalignment"],
      howWeHelp: [
        "Compensation benchmarking and strategy",
        "Pay equity analysis and remediation",
        "Executive compensation design",
        "Total rewards optimization"
      ]
    },
    { 
      id: "sales-effectiveness", 
      name: "Sales Effectiveness", 
      icon: TrendingUp,
      color: "rose",
      description: "Drive revenue through commercial excellence",
      kornferryOffering: "Korn Ferry Commercial",
      valueProposition: "Improve win rates, accelerate deals, and build high-performing sales organizations",
      opportunitySignals: ["revenue growth targets", "sales underperformance", "go-to-market changes", "sales force expansion", "channel optimization", "customer experience"],
      howWeHelp: [
        "Sales talent assessment and development",
        "Sales process and methodology",
        "Sales compensation and incentives",
        "Sales leadership coaching"
      ]
    }
  ];

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
    enabled: projectId > 0
  });

  const { data: insights = [] } = useQuery<ProjectInsight[]>({
    queryKey: ["/api/projects", projectId, "insights"],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/insights`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: projectId > 0
  });

  const { data: kpis = [] } = useQuery<KPI[]>({
    queryKey: ["/api/projects", projectId, "kpis"],
    queryFn: async () => {
      const themesResponse = await fetch(`/api/projects/${projectId}/job-themes`);
      if (!themesResponse.ok) return [];
      const themes = await themesResponse.json();
      
      const kpisToFetch: Array<{ kpi: any; index: number }> = [];
      themes.forEach((theme: any) => {
        if (theme.kpis) {
          theme.kpis.forEach((kpi: any) => {
            kpisToFetch.push({ kpi, index: kpisToFetch.length });
          });
        }
      });
      
      const kpisNeedingActuals = kpisToFetch.filter(({ kpi }) => !kpi.currentValue && kpi.id);
      const actualsPromises = kpisNeedingActuals.map(async ({ kpi }) => {
        try {
          const response = await fetch(`/api/kpis/${kpi.id}/actuals`);
          if (response.ok) {
            const actuals = await response.json();
            return { kpiId: kpi.id, currentValue: actuals.length > 0 ? actuals[actuals.length - 1].actualValue : null };
          }
        } catch {}
        return { kpiId: kpi.id, currentValue: null };
      });
      
      const actualsResults = await Promise.all(actualsPromises);
      const actualsMap = new Map(actualsResults.map(r => [r.kpiId, r.currentValue]));
      
      return kpisToFetch.map(({ kpi }) => {
        const currentValue = kpi.currentValue ?? actualsMap.get(kpi.id) ?? null;
        const kpiWithCurrent = { ...kpi, currentValue };
        return {
          ...kpiWithCurrent,
          status: getKPIStatus(kpiWithCurrent)
        };
      });
    },
    enabled: projectId > 0
  });

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ["/api/projects", projectId, "notes"],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/notes`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: projectId > 0
  });

  const { data: valueCases = [] } = useQuery<ValueCase[]>({
    queryKey: ["/api/projects", projectId, "value-cases"],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/value-cases`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: projectId > 0
  });

  const { data: jobThemes = [] } = useQuery<JobTheme[]>({
    queryKey: ["/api/projects", projectId, "job-themes"],
    enabled: projectId > 0
  });

  const { data: discoveryQuestions = [], isLoading: questionsLoading } = useQuery<DiscoveryQuestion[]>({
    queryKey: ["/api/projects", projectId, "discovery-questions"],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/discovery-questions`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: projectId > 0
  });

  const [expandedMethodologies, setExpandedMethodologies] = useState<Record<string, boolean>>({
    SPIN: true,
    MILLER_HEIMAN: true,
    PSS: true
  });

  const generateQuestionsMutation = useMutation({
    mutationFn: async (params: { mode: "focused" | "full"; solutionArea?: string }) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/discovery-questions/generate`, {
        mode: params.mode,
        solutionArea: params.solutionArea
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "discovery-questions"] });
      setIsDiscoveryModeDialogOpen(false);
      toast({ 
        title: "Questions Generated", 
        description: data.summary || "AI-powered discovery questions are ready." 
      });
    },
    onError: (error: any) => {
      toast({ 
        variant: "destructive", 
        title: "Generation Failed", 
        description: error.message || "Could not generate questions. Ensure you have job themes set up." 
      });
    }
  });
  
  const handleStartDiscovery = () => {
    // Directly generate questions based on the theme selected in step 1
    const isFullSearch = selectedDiscoveryTheme === "kf-full-search";
    const solutionAreaMap: Record<string, string> = {
      "leadership": "DEVELOP",
      "talent-acquisition": "ASSESS",
      "transformation": "TRANSFORM",
      "rewards": "REWARD",
      "sales-effectiveness": "COMMERCIAL"
    };
    
    generateQuestionsMutation.mutate({
      mode: isFullSearch ? "full" : "focused",
      solutionArea: isFullSearch ? undefined : solutionAreaMap[selectedDiscoveryTheme || ""]
    });
  };

  const markQuestionAskedMutation = useMutation({
    mutationFn: async ({ questionId, isAsked }: { questionId: number; isAsked: boolean }) => {
      const response = await apiRequest("PATCH", `/api/discovery-questions/${questionId}`, { isAsked });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "discovery-questions"] });
    }
  });

  const groupedQuestions = discoveryQuestions.reduce((acc, q) => {
    const method = q.methodology || "OTHER";
    if (!acc[method]) acc[method] = [];
    acc[method].push(q);
    return acc;
  }, {} as Record<string, DiscoveryQuestion[]>);

  const logKPIMutation = useMutation({
    mutationFn: async (data: { kpiId: number; actualValue: number; note: string }) => {
      const response = await apiRequest("POST", `/api/kpis/${data.kpiId}/actuals`, {
        actualValue: data.actualValue,
        note: data.note,
        actualDate: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "kpis"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "job-themes"] });
      if (project?.accountId) {
        queryClient.invalidateQueries({ queryKey: ["/api/accounts", project.accountId, "value-spine"] });
      }
      setIsLogKPIOpen(false);
      setSelectedKPI(null);
      setKpiActualValue("");
      setKpiNote("");
      toast({ title: "KPI logged", description: "Measurement recorded successfully." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to log KPI." });
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: async (data: { content: string; category: string }) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/notes`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "notes"] });
      setIsAddNoteOpen(false);
      setNewNoteContent("");
      setNewNoteCategory("general");
      toast({ title: "Note added", description: "Your note has been saved." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to add note." });
    }
  });

  const getKPIStatus = (kpi: any): "on-track" | "at-risk" | "off-track" | "no-data" => {
    if (!kpi.baselineValue || !kpi.targetValue) return "no-data";
    if (!kpi.currentValue) return "no-data";
    const progress = ((kpi.currentValue - kpi.baselineValue) / (kpi.targetValue - kpi.baselineValue)) * 100;
    if (progress >= 80) return "on-track";
    if (progress >= 50) return "at-risk";
    return "off-track";
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Invalid Role</h2>
            <p className="text-muted-foreground mb-4">
              The role "{roleParam}" is not recognized.
            </p>
            <Link href={`/projects/${projectId}`}>
              <Button data-testid="button-back-to-project">Return to Project</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (projectLoading || !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCcw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const RoleIcon = roleIcons[role];
  const isSalesRole = role === "sales" || role === "consultant";
  const isDeliveryRole = role === "delivery" || role === "csm";
  const accountId = project.accountId;

  const kpisOnTrack = kpis.filter(k => k.status === "on-track").length;
  const kpisAtRisk = kpis.filter(k => k.status === "at-risk" || k.status === "off-track").length;
  const totalValue = valueCases.reduce((sum, vc) => sum + (vc.estimatedValue || 0), 0);

  const renderSalesWorkspace = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid grid-cols-5 w-full max-w-3xl">
        <TabsTrigger value="guided-discovery" data-testid="tab-guided-discovery">
          <Sparkles className="w-4 h-4 mr-2" />
          Guided Discovery
        </TabsTrigger>
        <TabsTrigger value="execution-canvas" data-testid="tab-execution-canvas">
          <Target className="w-4 h-4 mr-2" />
          Execution Canvas
        </TabsTrigger>
        <TabsTrigger value="success-stories" data-testid="tab-success-stories">
          <Star className="w-4 h-4 mr-2" />
          Success Stories
        </TabsTrigger>
        <TabsTrigger value="value-cases" data-testid="tab-value-cases">
          <DollarSign className="w-4 h-4 mr-2" />
          Value Cases
        </TabsTrigger>
        <TabsTrigger value="handoff" data-testid="tab-handoff">
          <ArrowUpRight className="w-4 h-4 mr-2" />
          Handoff
        </TabsTrigger>
      </TabsList>

      {/* Execution Canvas - Core 3-5 KPIs per engagement (Trend #1: Outcomes & shared KPIs) */}
      <TabsContent value="execution-canvas" className="space-y-6">
        <Card className="bg-gradient-to-r from-primary/5 to-emerald-500/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Execution Canvas</CardTitle>
                  <CardDescription>Track shared KPIs, value progress, and actionable next steps</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                {kpis.filter(k => k.baselineValue && k.targetValue).length} / 5 Defined
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Summary stats */}
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground">Total Value Potential</p>
                <p className="text-2xl font-bold text-primary">${(totalValue / 1000000).toFixed(1)}M</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground">Strategic Priorities</p>
                <p className="text-2xl font-bold">{jobThemes.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground">Discovery Insights</p>
                <p className="text-2xl font-bold">{insights.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Health Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium">On Track</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600">
                {kpis.filter(k => k.status === "on-track").length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium">At Risk</span>
              </div>
              <p className="text-2xl font-bold text-amber-600">
                {kpis.filter(k => k.status === "at-risk").length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-red-500/5 border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium">Off Track</span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {kpis.filter(k => k.status === "off-track").length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-muted/30 border-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Needs Data</span>
              </div>
              <p className="text-2xl font-bold text-muted-foreground">
                {kpis.filter(k => k.status === "no-data").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Shared KPIs Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Shared Outcome KPIs
            </CardTitle>
            <CardDescription>
              Define baseline, target, and benefit owner for each key outcome
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpis.slice(0, 5).map((kpi, index) => {
                const statusConfig: Record<string, { color: string; bg: string; icon: typeof CheckCircle }> = {
                  "on-track": { color: "text-emerald-600", bg: "bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle },
                  "at-risk": { color: "text-amber-600", bg: "bg-amber-500/10 border-amber-500/30", icon: AlertTriangle },
                  "off-track": { color: "text-red-600", bg: "bg-red-500/10 border-red-500/30", icon: AlertCircle },
                  "no-data": { color: "text-muted-foreground", bg: "border", icon: HelpCircle }
                };
                const config = statusConfig[kpi.status] || statusConfig["no-data"];
                const StatusIcon = config.icon;
                
                return (
                  <div key={kpi.id} className={`p-4 rounded-lg ${config.bg} hover-elevate`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.color} bg-background`}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{kpi.name}</h4>
                          <p className="text-xs text-muted-foreground">{kpi.unit || "units"}</p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${config.color} border-current`}
                      >
                        {kpi.status === "on-track" && "On Track"}
                        {kpi.status === "at-risk" && "At Risk"}
                        {kpi.status === "off-track" && "Off Track"}
                        {kpi.status === "no-data" && "Needs Data"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="p-2 rounded bg-background/80">
                        <span className="text-muted-foreground block text-xs">Baseline</span>
                        <span className="font-medium">{kpi.baselineValue ?? "—"}</span>
                      </div>
                      <div className="p-2 rounded bg-background/80">
                        <span className="text-muted-foreground block text-xs">Current</span>
                        <span className={`font-medium ${config.color}`}>{kpi.currentValue ?? "—"}</span>
                      </div>
                      <div className="p-2 rounded bg-background/80">
                        <span className="text-muted-foreground block text-xs">Target</span>
                        <span className="font-medium text-primary">{kpi.targetValue ?? "—"}</span>
                      </div>
                      <div className="p-2 rounded bg-background/80">
                        <span className="text-muted-foreground block text-xs">Progress</span>
                        <span className="font-medium text-emerald-600">
                          {kpi.baselineValue && kpi.targetValue && kpi.currentValue
                            ? `${Math.round(((kpi.currentValue - kpi.baselineValue) / (kpi.targetValue - kpi.baselineValue)) * 100)}%`
                            : "—"
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {kpis.length === 0 && (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No KPIs defined yet</p>
                  <Link href={`/projects/${projectId}/discovery`}>
                    <Button data-testid="button-define-kpis">
                      <Plus className="w-4 h-4 mr-2" />
                      Define KPIs in Discovery
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actionable Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Actionable Next Steps
            </CardTitle>
            <CardDescription>Recommended actions based on current progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kpis.filter(k => k.status === "no-data").length > 0 && (
                <div className="p-3 rounded-lg bg-muted/50 border flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Gather baseline data for KPIs</p>
                    <p className="text-xs text-muted-foreground">
                      {kpis.filter(k => k.status === "no-data").length} KPI(s) need baseline values defined to track progress
                    </p>
                  </div>
                </div>
              )}
              {kpis.filter(k => k.status === "at-risk").length > 0 && (
                <div className="p-3 rounded-lg bg-amber-500/5 border-amber-500/20 border flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Review at-risk KPIs</p>
                    <p className="text-xs text-muted-foreground">
                      {kpis.filter(k => k.status === "at-risk").length} KPI(s) are trending behind target - schedule a review
                    </p>
                  </div>
                </div>
              )}
              {kpis.filter(k => k.status === "off-track").length > 0 && (
                <div className="p-3 rounded-lg bg-red-500/5 border-red-500/20 border flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Take corrective action</p>
                    <p className="text-xs text-muted-foreground">
                      {kpis.filter(k => k.status === "off-track").length} KPI(s) are significantly behind - immediate intervention recommended
                    </p>
                  </div>
                </div>
              )}
              {insights.filter(i => i.priority === "high").length > 0 && (
                <div className="p-3 rounded-lg bg-purple-500/5 border-purple-500/20 border flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Review high-priority insights</p>
                    <p className="text-xs text-muted-foreground">
                      {insights.filter(i => i.priority === "high").length} strategic insight(s) flagged for discussion
                    </p>
                  </div>
                </div>
              )}
              {kpis.length > 0 && kpis.every(k => k.status === "on-track") && (
                <div className="p-3 rounded-lg bg-emerald-500/5 border-emerald-500/20 border flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">All KPIs on track</p>
                    <p className="text-xs text-muted-foreground">
                      Consider documenting wins as success stories for future opportunities
                    </p>
                  </div>
                </div>
              )}
              {kpis.length === 0 && insights.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Complete discovery and define KPIs to see recommended actions
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Value-linked commercial notes (Trend #2) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Value-Linked Commercial Elements
            </CardTitle>
            <CardDescription>
              Success fees and leading indicators tied to outcomes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg border border-dashed">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium">Leading Indicators</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Adoption rate, completion %, manager coaching quality
                </p>
              </div>
              <div className="p-4 rounded-lg border border-dashed">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-amber-600" />
                  <span className="font-medium">Success Fee Opportunities</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Optional success fees on controllable outcomes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Guided Discovery - Theme-Driven Workflow */}
      <TabsContent value="guided-discovery" className="space-y-6">
        {/* Discovery Workflow Progress */}
        <Card className="bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-amber-500/5 border-blue-500/20">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <FileSearch className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Guided Discovery</CardTitle>
                  <CardDescription>Theme-focused research and question generation</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-blue-600 border-blue-500/30 bg-blue-500/5">
                  <Database className="w-3 h-3 mr-1" />
                  Salesforce Connected
                </Badge>
                <Badge variant="outline" className="text-purple-600 border-purple-500/30 bg-purple-500/5">
                  <Globe className="w-3 h-3 mr-1" />
                  AI Research
                </Badge>
              </div>
            </div>
            {/* Progress Steps - Clickable Navigation */}
            <div className="flex items-center gap-2 mt-4">
              {[
                { step: "theme-select" as const, label: "Theme", num: 1 },
                { step: "intelligence" as const, label: "Intelligence", num: 2 },
                { step: "questions" as const, label: "Questions", num: 3 },
                { step: "review" as const, label: "Review", num: 4 },
                { step: "insights" as const, label: "Insights", num: 5 }
              ].map((s, idx) => {
                const stepOrder = ["theme-select", "intelligence", "questions", "review", "insights"];
                const currentIdx = stepOrder.indexOf(discoveryStep);
                const thisIdx = stepOrder.indexOf(s.step);
                const isComplete = thisIdx < currentIdx;
                const isCurrent = s.step === discoveryStep;
                const canNavigate = isComplete || isCurrent || (thisIdx === currentIdx + 1 && selectedDiscoveryTheme);
                
                return (
                  <div key={s.step} className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (canNavigate || isComplete) {
                          setDiscoveryStep(s.step);
                        }
                      }}
                      disabled={!canNavigate && !isComplete}
                      className={`flex items-center gap-2 transition-all ${
                        canNavigate || isComplete ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed opacity-60"
                      }`}
                      data-testid={`button-step-${s.step}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                        isComplete ? "bg-emerald-500 text-white" : 
                        isCurrent ? "bg-primary text-primary-foreground" : 
                        "bg-muted text-muted-foreground"
                      } ${canNavigate && !isCurrent ? "hover:ring-2 hover:ring-primary/50" : ""}`}>
                        {isComplete ? <Check className="w-4 h-4" /> : s.num}
                      </div>
                      <span className={`text-sm ${isCurrent ? "font-medium" : "text-muted-foreground"} ${canNavigate && !isCurrent ? "hover:text-foreground" : ""}`}>{s.label}</span>
                    </button>
                    {idx < 4 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </div>
                );
              })}
            </div>
          </CardHeader>
        </Card>

        {/* Step 1: Theme Selection */}
        {discoveryStep === "theme-select" && (
          <Card className="border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">We are</p>
                  <h2 className="text-2xl font-bold text-primary">Korn Ferry</h2>
                  <p className="text-sm text-muted-foreground">Organizational Consulting</p>
                </div>
              </div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Select Discovery Theme
              </CardTitle>
              <CardDescription>Choose a focus area aligned with Korn Ferry capabilities to guide your discovery conversation</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {/* We are Korn Ferry - Full Search Option */}
              {(() => {
                const kfFullSearch = discoveryThemes.find(t => t.id === "kf-full-search");
                if (!kfFullSearch) return null;
                const ThemeIcon = kfFullSearch.icon;
                const isSelected = selectedDiscoveryTheme === kfFullSearch.id;
                return (
                  <div 
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all mb-6 ${
                      isSelected 
                        ? "border-primary bg-gradient-to-r from-primary/10 to-blue-500/10 ring-2 ring-primary" 
                        : "border-primary/30 bg-gradient-to-r from-primary/5 to-blue-500/5 hover:from-primary/10 hover:to-blue-500/10"
                    }`}
                    onClick={() => setSelectedDiscoveryTheme(kfFullSearch.id)}
                    data-testid="theme-kf-full-search"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <ThemeIcon className="w-7 h-7 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-lg text-primary">{kfFullSearch.name}</h4>
                          <Badge className="bg-primary/10 text-primary border-primary/20">Recommended</Badge>
                          {isSelected && <CheckCircle className="w-6 h-6 text-primary ml-auto" />}
                        </div>
                        <p className="text-sm font-medium mb-2">{kfFullSearch.valueProposition}</p>
                        <p className="text-xs text-muted-foreground mb-2">{kfFullSearch.description}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-600">Leadership</Badge>
                          <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-600">Talent</Badge>
                          <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-600">Transform</Badge>
                          <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-600">Reward</Badge>
                          <Badge variant="outline" className="text-xs border-rose-500/30 text-rose-600">Commercial</Badge>
                        </div>
                        <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Opportunity Signals:</p>
                          <div className="flex flex-wrap gap-1">
                            {(kfFullSearch.opportunitySignals || []).map((signal, idx) => (
                              <Badge key={idx} className="text-xs bg-primary/10 text-primary border-primary/20">
                                {signal}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <p className="text-sm text-muted-foreground mb-4 font-medium">Or focus on a specific capability:</p>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {discoveryThemes.filter(t => t.id !== "kf-full-search").map((theme) => {
                  const ThemeIcon = theme.icon;
                  const isSelected = selectedDiscoveryTheme === theme.id;
                  const colorClasses: Record<string, string> = {
                    blue: "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10",
                    purple: "border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10",
                    emerald: "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10",
                    amber: "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10",
                    rose: "border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10"
                  };
                  const iconColors: Record<string, string> = {
                    blue: "text-blue-600",
                    purple: "text-purple-600",
                    emerald: "text-emerald-600",
                    amber: "text-amber-600",
                    rose: "text-rose-600"
                  };
                  const bgColors: Record<string, string> = {
                    blue: "bg-blue-500/10",
                    purple: "bg-purple-500/10",
                    emerald: "bg-emerald-500/10",
                    amber: "bg-amber-500/10",
                    rose: "bg-rose-500/10"
                  };
                  return (
                    <div 
                      key={theme.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected ? `${colorClasses[theme.color]} ring-2 ring-primary` : "hover-elevate"
                      }`}
                      onClick={() => setSelectedDiscoveryTheme(theme.id)}
                      data-testid={`theme-${theme.id}`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg ${bgColors[theme.color]} flex items-center justify-center`}>
                          <ThemeIcon className={`w-5 h-5 ${iconColors[theme.color]}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm">{theme.name}</h4>
                            {isSelected && <CheckCircle className="w-5 h-5 text-primary" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{theme.kornferryOffering}</p>
                        </div>
                      </div>
                      {/* Value proposition */}
                      <p className="text-xs font-medium mb-2">{theme.valueProposition}</p>
                      {/* Opportunity signals */}
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Look for:</p>
                        <div className="flex flex-wrap gap-1">
                          {(theme.opportunitySignals || []).slice(0, 3).map((signal, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {signal}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {/* How we help preview */}
                      {theme.howWeHelp && (
                        <div className={`p-2 rounded ${bgColors[theme.color]} mt-2`}>
                          <p className="text-xs flex items-center gap-1">
                            <Sparkles className={`w-3 h-3 ${iconColors[theme.color]}`} />
                            <span className="font-medium">{theme.howWeHelp[0]}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={() => setDiscoveryStep("intelligence")} 
                  disabled={!selectedDiscoveryTheme}
                  data-testid="button-next-to-intelligence"
                >
                  Continue to Intelligence
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Intelligence (Theme-Filtered News + Salesforce) */}
        {discoveryStep === "intelligence" && project && (() => {
          const selectedTheme = discoveryThemes.find(t => t.id === selectedDiscoveryTheme);
          const isFullSearch = selectedDiscoveryTheme === "kf-full-search";
          const sfData = generateSimulatedSalesforceData(project.companyName);
          const marketIntel = generateMarketIntelligence(project.companyName, selectedDiscoveryTheme || undefined);
          const blueSheet = generateBlueSheetData(project.companyName);
          
          // For full search, generate OPPORTUNITY-focused content grouped by theme
          const opportunityData = isFullSearch ? {
            leadership: {
              opportunitySignal: "Leadership Pipeline Gap Identified",
              articles: [
                { headline: `${project.companyName} CEO Announces Succession Planning Initiative`, date: "Nov 25, 2024", source: "Business Wire", summary: "New CEO transition planned for 2026 - accelerating leadership pipeline development", opportunityType: "Succession Planning" },
                { headline: `${project.companyName} Reports 40% Executive Turnover`, date: "Nov 20, 2024", source: "HR Executive", summary: "CHRO cites leadership bench weakness as critical priority", opportunityType: "Leadership Gap" }
              ],
              howWeHelp: [
                "Leadership assessment to identify ready-now successors",
                "Acceleration programs for high-potential leaders", 
                "Executive coaching for new role transitions",
                "Succession planning methodology and tools"
              ],
              potentialValue: "$2-5M"
            },
            talent: {
              opportunitySignal: "Hiring Quality & Retention Challenges",
              articles: [
                { headline: `${project.companyName} Struggles with 35% First-Year Turnover`, date: "Nov 22, 2024", source: "TechCrunch", summary: "Quality of hire concerns driving search for better assessment approach", opportunityType: "Retention Crisis" },
                { headline: `${project.companyName} Plans 500-Person Hiring Wave`, date: "Nov 18, 2024", source: "Wall Street Journal", summary: "Expansion requires scalable, predictive hiring process", opportunityType: "Scale Hiring" }
              ],
              howWeHelp: [
                "Success Profiles defining what great looks like",
                "Predictive assessments reducing mis-hires by 50%",
                "Interview training for hiring managers",
                "Candidate experience optimization"
              ],
              potentialValue: "$1-3M"
            },
            transformation: {
              opportunitySignal: "Organizational Restructuring Underway",
              articles: [
                { headline: `${project.companyName} Announces $500M Cost Reduction Program`, date: "Nov 23, 2024", source: "Reuters", summary: "Major restructuring to create leaner, more agile operating model", opportunityType: "Restructuring" },
                { headline: `${project.companyName} Acquires Competitor - Integration Begins`, date: "Nov 19, 2024", source: "Harvard Business Review", summary: "M&A integration requiring organization design and culture alignment", opportunityType: "M&A Integration" }
              ],
              howWeHelp: [
                "Organization design for new operating model",
                "Workforce planning and right-sizing",
                "Culture integration and change management",
                "Leadership alignment on new structure"
              ],
              potentialValue: "$3-8M"
            },
            rewards: {
              opportunitySignal: "Compensation & Retention Under Pressure",
              articles: [
                { headline: `${project.companyName} Faces Pay Equity Lawsuit`, date: "Nov 21, 2024", source: "Compensation Today", summary: "Class action alleging gender pay disparities - urgent need for analysis", opportunityType: "Pay Equity" },
                { headline: `${project.companyName} Losing Top Talent to Competitors`, date: "Nov 17, 2024", source: "Forbes", summary: "Executive compensation review needed to stay competitive", opportunityType: "Retention" }
              ],
              howWeHelp: [
                "Pay equity analysis and remediation planning",
                "Market competitive benchmarking",
                "Executive compensation redesign",
                "Total rewards strategy optimization"
              ],
              potentialValue: "$1-2M"
            },
            commercial: {
              opportunitySignal: "Revenue Growth & Sales Performance",
              articles: [
                { headline: `${project.companyName} Misses Q3 Revenue Target by 15%`, date: "Nov 24, 2024", source: "Industry Week", summary: "Sales underperformance driving urgent commercial effectiveness review", opportunityType: "Sales Performance" },
                { headline: `${project.companyName} Expands into 5 New Markets`, date: "Nov 16, 2024", source: "Sales Management", summary: "Go-to-market transformation needed for new territories", opportunityType: "GTM Expansion" }
              ],
              howWeHelp: [
                "Sales force effectiveness assessment",
                "Sales talent profiling and development",
                "Incentive compensation redesign",
                "Sales methodology implementation"
              ],
              potentialValue: "$2-4M"
            }
          } : null;

          const themeLabels: Record<string, { name: string; color: string; icon: any }> = {
            leadership: { name: "Leadership Development", color: "blue", icon: Users },
            talent: { name: "Talent Acquisition", color: "purple", icon: UserCheck },
            transformation: { name: "Organizational Transformation", color: "emerald", icon: RefreshCcw },
            rewards: { name: "Total Rewards", color: "amber", icon: DollarSign },
            commercial: { name: "Sales Effectiveness", color: "rose", icon: TrendingUp }
          };
          
          return (
            <>
              {/* Recent News & Press - Different display for Full Search vs Focused */}
              {isFullSearch ? (
                <Card className="border-primary/20">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle>Korn Ferry Opportunity Intelligence</CardTitle>
                          <CardDescription>AI-identified opportunities mapped to Korn Ferry solutions</CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-primary/20">Full Search Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {Object.entries(opportunityData!).map(([themeKey, data]) => {
                        const themeMeta = themeLabels[themeKey];
                        const ThemeIcon = themeMeta.icon;
                        const colorClasses: Record<string, string> = {
                          blue: "border-blue-500/30 bg-blue-500/5",
                          purple: "border-purple-500/30 bg-purple-500/5",
                          emerald: "border-emerald-500/30 bg-emerald-500/5",
                          amber: "border-amber-500/30 bg-amber-500/5",
                          rose: "border-rose-500/30 bg-rose-500/5"
                        };
                        const iconColors: Record<string, string> = {
                          blue: "text-blue-600",
                          purple: "text-purple-600",
                          emerald: "text-emerald-600",
                          amber: "text-amber-600",
                          rose: "text-rose-600"
                        };
                        const bgColors: Record<string, string> = {
                          blue: "bg-blue-600",
                          purple: "bg-purple-600",
                          emerald: "bg-emerald-600",
                          amber: "bg-amber-600",
                          rose: "bg-rose-600"
                        };
                        return (
                          <div key={themeKey} className={`rounded-xl border-2 overflow-hidden ${colorClasses[themeMeta.color]}`}>
                            {/* Header with opportunity signal */}
                            <div className={`px-4 py-3 ${bgColors[themeMeta.color]} text-white`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <ThemeIcon className="w-5 h-5" />
                                  <div>
                                    <h4 className="font-bold text-sm">{themeMeta.name}</h4>
                                    <p className="text-xs opacity-90">{data.opportunitySignal}</p>
                                  </div>
                                </div>
                                <Badge className="bg-white/20 text-white border-white/30 text-xs">
                                  Est. {data.potentialValue}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="p-4">
                              {/* Evidence from news */}
                              <div className="mb-4">
                                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                  Opportunity Evidence
                                </h5>
                                <div className="space-y-2">
                                  {data.articles.map((article, idx) => (
                                    <div key={idx} className="p-3 rounded-lg bg-background border hover-elevate">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="text-xs">{article.opportunityType}</Badge>
                                        <span className="text-xs text-muted-foreground">{article.date} • {article.source}</span>
                                      </div>
                                      <p className="text-sm font-medium">{article.headline}</p>
                                      <p className="text-xs text-muted-foreground mt-1">{article.summary}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* How Korn Ferry helps */}
                              <div className={`p-3 rounded-lg ${colorClasses[themeMeta.color]}`}>
                                <h5 className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                                  <Sparkles className={`w-3 h-3 ${iconColors[themeMeta.color]}`} />
                                  How Korn Ferry Helps
                                </h5>
                                <ul className="space-y-1">
                                  {data.howWeHelp.map((item, idx) => (
                                    <li key={idx} className="text-sm flex items-start gap-2">
                                      <CheckCircle className={`w-4 h-4 ${iconColors[themeMeta.color]} mt-0.5 flex-shrink-0`} />
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-amber-500/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Newspaper className="w-5 h-5 text-amber-600" />
                        Recent News & Press
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{selectedTheme?.name}</Badge>
                        <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/5">
                          AI Monitored
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>Latest company news filtered by {selectedTheme?.name || "selected theme"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {marketIntel.recentNews.map((news, idx) => (
                        <div 
                          key={idx} 
                          className={`p-3 rounded-lg border hover-elevate ${news.relevance === "high" ? "border-amber-500/30 bg-amber-500/5" : ""}`}
                          data-testid={`card-news-${idx}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-muted-foreground">{news.date}</span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <a 
                                  href={news.sourceUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                                  data-testid={`link-news-source-${idx}`}
                                >
                                  {news.source}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                                {news.relevance === "high" && (
                                  <Badge className="text-xs bg-amber-500/10 text-amber-700 border-amber-500/20">
                                    High Relevance
                                  </Badge>
                                )}
                              </div>
                              <a 
                                href={news.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                                data-testid={`link-news-${idx}`}
                              >
                                <h4 className="font-semibold text-sm mb-1 hover:text-primary cursor-pointer">{news.headline}</h4>
                              </a>
                              <p className="text-xs text-muted-foreground">{news.summary}</p>
                            </div>
                            <a 
                              href={news.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary"
                            >
                              <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Annual Report & Earnings Insights */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Annual Report Highlights */}
                <Card className="border-blue-500/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Annual Report
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">{marketIntel.annualReportHighlights.fiscalYear}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="font-bold">{marketIntel.annualReportHighlights.revenue}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                        <p className="text-xs text-muted-foreground">Headcount</p>
                        <p className="font-bold">{marketIntel.annualReportHighlights.headcount}</p>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-muted-foreground mb-2">STRATEGIC PRIORITIES</h5>
                      <ul className="space-y-1">
                        {marketIntel.annualReportHighlights.strategicPriorities.map((priority, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <Target className="w-3 h-3 text-blue-600 mt-1 flex-shrink-0" />
                            {priority}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-muted-foreground mb-2">HR INITIATIVES</h5>
                      <ul className="space-y-1">
                        {marketIntel.annualReportHighlights.hrInitiatives.map((initiative, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <Users className="w-3 h-3 text-purple-600 mt-1 flex-shrink-0" />
                            {initiative}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Earnings Call Insights */}
                <Card className="border-emerald-500/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-emerald-600" />
                        Earnings Call
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">{marketIntel.earningsCallInsights.quarter}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h5 className="text-xs font-semibold text-muted-foreground mb-2">CEO QUOTES</h5>
                      <div className="space-y-2">
                        {marketIntel.earningsCallInsights.ceoQuotes.map((quote, idx) => (
                          <div key={idx} className="p-2 rounded bg-emerald-500/5 border-l-2 border-emerald-500 text-sm italic">
                            "{quote}"
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-muted-foreground mb-2">TALENT MENTIONS</h5>
                      <ul className="space-y-1">
                        {marketIntel.earningsCallInsights.talentMentions.map((mention, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-emerald-600 mt-1 flex-shrink-0" />
                            {mention}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-muted-foreground mb-2">CHALLENGES DISCUSSED</h5>
                      <ul className="space-y-1">
                        {marketIntel.earningsCallInsights.challengesDiscussed.map((challenge, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <AlertTriangle className="w-3 h-3 text-amber-600 mt-1 flex-shrink-0" />
                            {challenge}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Industry Trends & Opportunities */}
              <Card className="border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Industry Trends & Korn Ferry Opportunities
                  </CardTitle>
                  <CardDescription>Market dynamics and how to position our solutions • Highlights match your selected theme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {marketIntel.industryTrends.map((trend, idx) => {
                      const isFullSearch = selectedDiscoveryTheme === "kf-full-search";
                      const matchesTheme = isFullSearch || (selectedDiscoveryTheme && trend.themes.includes(selectedDiscoveryTheme));
                      const currentTheme = discoveryThemes.find(t => t.id === selectedDiscoveryTheme);
                      
                      return (
                        <div 
                          key={idx} 
                          className={`p-4 rounded-lg border hover-elevate transition-all ${
                            matchesTheme 
                              ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20" 
                              : ""
                          }`}
                          data-testid={`card-trend-${idx}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                              <Lightbulb className={`w-4 h-4 ${matchesTheme ? "text-primary" : "text-purple-600"}`} />
                              {trend.trend}
                            </h4>
                            {matchesTheme && (
                              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs flex-shrink-0">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {isFullSearch ? "Relevant" : currentTheme?.name}
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-medium text-muted-foreground w-16">Impact:</span>
                              <span className="flex-1">{trend.impact}</span>
                            </div>
                            <div className={`flex items-start gap-2 p-2 rounded ${
                              matchesTheme 
                                ? "bg-primary/10 border border-primary/30" 
                                : "bg-purple-500/5 border border-purple-500/20"
                            }`}>
                              <Sparkles className={`w-3 h-3 mt-1 ${matchesTheme ? "text-primary" : "text-purple-600"}`} />
                              <span className={`flex-1 font-medium ${matchesTheme ? "text-primary" : "text-purple-700"}`}>{trend.opportunity}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* CRM Pipeline & Opportunities - Condensed Collapsible View */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-blue-600" />
                      Salesforce Pipeline
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Demo Data</Badge>
                      <span className="text-lg font-bold text-primary">
                        ${(sfData.opportunities.reduce((sum, o) => sum + o.amount, 0) / 1000000).toFixed(2)}M
                      </span>
                    </div>
                  </div>
                  <CardDescription>{sfData.opportunities.length} active opportunities • Click to expand details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sfData.opportunities.map((opp) => {
                      const roleColors: Record<string, string> = {
                        economic_buyer: "bg-amber-500/10 text-amber-700 border-amber-500/20",
                        user_buyer: "bg-blue-500/10 text-blue-700 border-blue-500/20",
                        technical_buyer: "bg-purple-500/10 text-purple-700 border-purple-500/20",
                        coach: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
                        champion: "bg-primary/10 text-primary border-primary/20"
                      };
                      const roleLabelsMap: Record<string, string> = {
                        economic_buyer: "Economic Buyer",
                        user_buyer: "User Buyer",
                        technical_buyer: "Technical Buyer",
                        coach: "Coach",
                        champion: "Champion"
                      };
                      const ratingColors: Record<string, string> = {
                        growth: "text-emerald-600",
                        trouble: "text-rose-600",
                        even_keel: "text-blue-600",
                        overconfident: "text-amber-600"
                      };
                      
                      return (
                        <Collapsible key={opp.id}>
                          <div className="rounded-lg border overflow-hidden">
                            <CollapsibleTrigger asChild>
                              <div className="p-3 cursor-pointer hover-elevate flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold text-sm">{opp.name.replace(`${project?.companyName} - `, '')}</h4>
                                      <Badge className="text-xs" variant="outline">{opp.stage}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{opp.owner} • Close: {opp.closeDate}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-rose-600 font-medium">{opp.redFlags.length}</span>
                                    <Flag className="w-3 h-3 text-rose-500" />
                                    <span className="text-xs text-emerald-600 font-medium ml-2">{opp.greenFlags.length}</span>
                                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold">${(opp.amount / 1000).toFixed(0)}K</p>
                                    <span className={`text-xs ${opp.probability >= 60 ? "text-emerald-600" : opp.probability >= 40 ? "text-amber-600" : "text-muted-foreground"}`}>
                                      {opp.probability}%
                                    </span>
                                  </div>
                                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="border-t p-4 bg-muted/30 space-y-4">
                                {/* Red & Green Flags */}
                                <div className="grid gap-3 md:grid-cols-2">
                                  <div className="p-3 rounded-lg border border-rose-500/20 bg-rose-500/5">
                                    <h5 className="text-xs font-semibold uppercase tracking-wider text-rose-600 mb-2 flex items-center gap-1">
                                      <AlertTriangle className="w-3 h-3" />
                                      Red Flags ({opp.redFlags.length})
                                    </h5>
                                    <ul className="space-y-1">
                                      {opp.redFlags.map((flag, idx) => (
                                        <li key={idx} className="text-xs flex items-start gap-1">
                                          <span className="text-rose-500 mt-0.5">•</span>
                                          {flag}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                                    <h5 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-2 flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" />
                                      Green Flags ({opp.greenFlags.length})
                                    </h5>
                                    <ul className="space-y-1">
                                      {opp.greenFlags.map((flag, idx) => (
                                        <li key={idx} className="text-xs flex items-start gap-1">
                                          <span className="text-emerald-500 mt-0.5">•</span>
                                          {flag}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                                
                                {/* Blue Sheet Summary */}
                                <div className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/5">
                                  <h5 className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2 flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    Blue Sheet
                                  </h5>
                                  <div className="grid gap-2 md:grid-cols-2 text-xs">
                                    <div>
                                      <span className="font-medium text-muted-foreground">SSO:</span>
                                      <p>{opp.blueSheet.singleSalesObjective}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-muted-foreground">Competitive Advantage:</span>
                                      <p>{opp.blueSheet.competitiveAdvantage}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-muted-foreground">ICP:</span>
                                      <p>{opp.blueSheet.idealCustomerProfile}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-muted-foreground">Min Acceptable:</span>
                                      <p>{opp.blueSheet.minAcceptableOutcome}</p>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Buying Influences */}
                                <div className="p-3 rounded-lg border">
                                  <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    Buying Influences ({opp.buyingInfluences.length})
                                  </h5>
                                  <div className="space-y-2">
                                    {opp.buyingInfluences.map((bi, idx) => (
                                      <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded bg-background">
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                            <UserCircle className="w-4 h-4 text-muted-foreground" />
                                          </div>
                                          <div>
                                            <span className="text-xs font-medium">{bi.name}</span>
                                            <span className="text-xs text-muted-foreground ml-1">({bi.title})</span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Badge className={`${roleColors[bi.role]} text-xs`}>
                                            {roleLabelsMap[bi.role]}
                                          </Badge>
                                          <span className={`text-xs font-medium ${ratingColors[bi.rating]}`}>
                                            {bi.rating.replace('_', ' ')}
                                          </span>
                                          <div className="flex">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                              <div 
                                                key={i} 
                                                className={`w-2 h-2 rounded-full mx-0.5 ${i < bi.degreeOfInfluence ? 'bg-primary' : 'bg-muted'}`}
                                              />
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                {/* Action Plan */}
                                <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                                  <h5 className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2 flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    Action Plan ({opp.actionPlan.length})
                                  </h5>
                                  <div className="space-y-2">
                                    {opp.actionPlan.map((action, idx) => (
                                      <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded bg-background text-xs">
                                        <div className="flex items-center gap-2 flex-1">
                                          <Badge 
                                            variant="outline" 
                                            className={`text-xs ${action.priority === 'high' ? 'border-rose-500/30 text-rose-600' : action.priority === 'medium' ? 'border-amber-500/30 text-amber-600' : 'border-muted'}`}
                                          >
                                            {action.priority}
                                          </Badge>
                                          <span>{action.action}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <span>{action.owner}</span>
                                          <span>•</span>
                                          <span>{action.dueDate}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Cross-Opportunity Buying Influences */}
              {sfData.crossOpportunityInfluences.length > 0 && (
                <Card className="border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      Key Buying Influences (Multi-Opportunity)
                    </CardTitle>
                    <CardDescription>Stakeholders involved in multiple opportunities - high strategic value</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {sfData.crossOpportunityInfluences.map((influence, idx) => {
                        const roleColors: Record<string, string> = {
                          economic_buyer: "bg-amber-500/10 text-amber-700 border-amber-500/20",
                          user_buyer: "bg-blue-500/10 text-blue-700 border-blue-500/20",
                          technical_buyer: "bg-purple-500/10 text-purple-700 border-purple-500/20",
                          coach: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
                          champion: "bg-primary/10 text-primary border-primary/20"
                        };
                        const roleLabelsMap: Record<string, string> = {
                          economic_buyer: "Economic Buyer",
                          user_buyer: "User Buyer",
                          technical_buyer: "Technical Buyer",
                          coach: "Coach",
                          champion: "Champion"
                        };
                        return (
                          <div key={idx} className="p-3 rounded-lg border bg-purple-500/5 border-purple-500/20">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                                  <UserCircle className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-sm">{influence.name}</h4>
                                    <Badge className={`${roleColors[influence.role]} text-xs`}>
                                      {roleLabelsMap[influence.role]}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{influence.title}</p>
                                </div>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {influence.opportunities.length} Opportunities
                              </Badge>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {influence.opportunities.map((oppName, oidx) => (
                                <Badge key={oidx} variant="outline" className="text-xs">
                                  {oppName.replace(`${project?.companyName} - `, '')}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation for Intelligence Step */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setDiscoveryStep("theme-select")} data-testid="button-back-to-theme">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Theme
                </Button>
                <Button onClick={() => setDiscoveryStep("questions")} data-testid="button-next-to-questions">
                  Continue to Questions
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          );
        })()}

        {/* Step 3: Discovery Toolkit - Comprehensive Call Preparation */}
        {discoveryStep === "questions" && (() => {
          const currentTheme = discoveryThemes.find(t => t.id === selectedDiscoveryTheme);
          const isFullSearch = selectedDiscoveryTheme === "kf-full-search";
          
          // Generate Call Planner / Green Sheet data
          const callPlanner = {
            objective: `Discover ${project?.companyName}'s key business challenges and priorities related to ${currentTheme?.name || "organizational transformation"}`,
            desiredOutcome: "Qualify opportunity, identify key stakeholders, understand decision timeline, and schedule follow-up meeting",
            openingStatement: `"Based on our research, we understand ${project?.companyName} is navigating [specific challenge]. We've helped similar organizations achieve [outcome]. I'd love to understand your perspective on the current priorities."`,
            rapportBuilders: [
              `Reference recent news: "${project?.companyName}'s recent initiatives in [area]"`,
              "Ask about their career journey and current role",
              "Connect on shared experiences or industry challenges",
              "Acknowledge their expertise before diving into questions"
            ],
            credibilityStatements: [
              `"We've worked with [X] organizations in your industry facing similar challenges"`,
              `"Our research shows that top-performing companies in your sector focus on [insight]"`,
              `"We recently helped [similar company] achieve [measurable outcome]"`,
              `"Korn Ferry benchmarks indicate that best-in-class organizations [specific data point]"`
            ]
          };
          
          // Success stories for credibility - enhanced with storytelling and relevance
          const successStories = [
            {
              client: "Fortune 500 Technology Company",
              industry: "Technology",
              challenge: "Leadership pipeline gap ahead of major digital transformation",
              situation: "The CHRO discovered only 2 of 12 executive roles had ready-now successors, with a major cloud transition planned in 18 months.",
              solution: "Korn Ferry Leadership Assessment & Development program",
              approach: "We assessed 200 senior leaders, identified 40 high-potentials, and created personalized 12-month acceleration plans with executive coaching.",
              outcome: "Accelerated 40 leaders to readiness in 12 months, 85% retention of high-potentials",
              metrics: ["40 leaders accelerated", "85% retention rate", "12-month timeline"],
              relevantTo: ["leadership", "transformation", "kf-full-search"],
              storyLink: "/success-stories/tech-leadership-pipeline",
              whyRelevantTo: (company: string) => `Like ${company}, this client faced pressure to develop leaders quickly during a major business transformation. The accelerated timeline and measurable outcomes demonstrate our ability to deliver results under pressure.`,
              howToTell: "Start with the urgency: 'Only 2 of 12 executive seats had successors.' Then paint the solution and close with the metric that matters most to your buyer."
            },
            {
              client: "Global Healthcare Provider",
              industry: "Healthcare",
              challenge: "High turnover in critical clinical roles driving quality concerns",
              situation: "35% first-year turnover in nursing and clinical roles was affecting patient satisfaction scores and driving up recruitment costs by $4M annually.",
              solution: "Korn Ferry Success Profiles and predictive hiring assessments",
              approach: "We built success profiles for 15 critical clinical roles, implemented predictive assessments, and trained 80 hiring managers on behavioral interviewing.",
              outcome: "Reduced first-year turnover by 45%, improved patient satisfaction scores by 22%",
              metrics: ["45% turnover reduction", "22% satisfaction improvement", "$2.1M annual savings"],
              relevantTo: ["talent-acquisition", "kf-full-search"],
              storyLink: "/success-stories/healthcare-talent",
              whyRelevantTo: (company: string) => `${company}'s industry relies heavily on getting the right people in critical roles. This story shows how better hiring decisions cascade into customer satisfaction and cost savings.`,
              howToTell: "Lead with the cost: '$4M in wasted recruitment.' Show the human impact on patients. End with ROI that any CFO would appreciate."
            },
            {
              client: "Multinational Manufacturer",
              industry: "Manufacturing",
              challenge: "Post-merger integration with redundant structures and culture clash",
              situation: "Following a $3B acquisition, leadership faced 40% role overlap, two competing cultures, and synergy targets of $300M within 24 months.",
              solution: "Korn Ferry Organization Design and Culture Integration",
              approach: "We designed the new operating model, created a culture integration roadmap, and provided change management support for 15,000 affected employees.",
              outcome: "Achieved $200M synergies 6 months ahead of schedule, 90% retention of key talent",
              metrics: ["$200M synergies", "6 months early", "90% key talent retention"],
              relevantTo: ["transformation", "kf-full-search"],
              storyLink: "/success-stories/manufacturing-merger",
              whyRelevantTo: (company: string) => `If ${company} is navigating any significant structural change—M&A, reorganization, or operating model shift—this story demonstrates our ability to deliver hard synergy targets while protecting the talent that matters.`,
              howToTell: "Set the stakes: '$3B deal on the line.' Describe the complexity. Celebrate the early delivery and retention—that's the differentiator."
            },
            {
              client: "Regional Financial Services Firm",
              industry: "Financial Services",
              challenge: "Pay equity concerns and difficulty attracting top talent",
              situation: "A pay equity audit revealed 12% gender pay gap, and offer acceptance rates had dropped to 65% as competitors offered more compelling packages.",
              solution: "Korn Ferry Total Rewards Strategy and benchmarking",
              approach: "We conducted comprehensive market benchmarking, redesigned the pay structure with equity principles, and created a compelling EVP narrative.",
              outcome: "Closed gender pay gap, improved offer acceptance rate from 65% to 88%",
              metrics: ["Pay gap closed", "88% offer acceptance", "23% improvement"],
              relevantTo: ["rewards", "kf-full-search"],
              storyLink: "/success-stories/finserv-rewards",
              whyRelevantTo: (company: string) => `Pay equity and talent competitiveness are board-level concerns for most organizations like ${company}. This story shows how strategic rewards work can solve both problems simultaneously.`,
              howToTell: "Frame it as a risk story first: 'Potential lawsuit exposure from pay gaps.' Then show the talent win: 'From losing candidates to winning them.'"
            },
            {
              client: "B2B Software Company",
              industry: "Technology",
              challenge: "Missed revenue targets 3 consecutive quarters despite market growth",
              situation: "Despite a growing TAM, the sales team missed quota 3 quarters running. Win rates were 18%, below the 25% industry benchmark.",
              solution: "Korn Ferry Sales Effectiveness program and talent assessment",
              approach: "We assessed the entire 120-person sales force, redesigned territories, implemented a new sales methodology, and restructured incentive compensation.",
              outcome: "Increased win rates by 35%, shortened sales cycle by 20%",
              metrics: ["35% higher win rates", "20% faster deals", "$15M incremental revenue"],
              relevantTo: ["sales-effectiveness", "kf-full-search"],
              storyLink: "/success-stories/software-sales",
              whyRelevantTo: (company: string) => `Revenue performance is every CEO's priority. This story shows how ${company} could unlock hidden potential in their commercial organization—without adding headcount.`,
              howToTell: "Use the contrast: 'Growing market, shrinking results.' Show the diagnosis. Land on the revenue number—that's what executives remember."
            }
          ].filter(story => isFullSearch || story.relevantTo.includes(selectedDiscoveryTheme || ""));
          
          // SPIN Questions framework
          const spinQuestions = {
            situation: [
              `What is your current approach to ${currentTheme?.name?.toLowerCase() || "talent management"}?`,
              "How is your organization structured to handle these challenges?",
              "What systems and processes are currently in place?",
              "Who are the key stakeholders involved in decisions like this?"
            ],
            problem: [
              "What's the biggest obstacle preventing you from achieving your goals?",
              "Where do you see the most significant gaps in your current approach?",
              "What keeps you up at night regarding this challenge?",
              "How does this issue compare to other priorities you're managing?"
            ],
            implication: [
              "If this problem continues, what impact will it have on your business results?",
              "How does this affect your team's ability to execute on the strategy?",
              "What's the cost of not addressing this over the next 12-24 months?",
              "How does this challenge impact your competitive position?"
            ],
            needPayoff: [
              "If you could solve this, what would that mean for your organization?",
              "How would success in this area support your broader strategic goals?",
              "What ROI would make this investment worthwhile?",
              "How would your stakeholders react to achieving these outcomes?"
            ]
          };
          
          // Miller Heiman Strategic Selling framework
          const millerHeimanQuestions = {
            conceptual: [
              "What's driving the urgency to address this now?",
              "How does this initiative align with your overall business strategy?",
              "What would success look like from your perspective?",
              "What has prevented you from solving this before?"
            ],
            economicBuyer: [
              "Who has the final authority on investments like this?",
              "What criteria will be used to evaluate the business case?",
              "What budget parameters are you working within?",
              "What's the timeline for making this decision?"
            ],
            technicalBuyer: [
              "What specific requirements must any solution meet?",
              "How will success be measured and tracked?",
              "What existing systems or processes must we integrate with?",
              "What potential obstacles do you see in implementation?"
            ],
            userBuyer: [
              "How will the end users' experience change?",
              "What resistance might we expect and from whom?",
              "What training or change management will be needed?",
              "How will adoption be ensured?"
            ]
          };
          
          // PSS Professional Selling Skills framework
          const pssQuestions = {
            opening: [
              "Thank you for making time today. Before we dive in, what's most important for you to cover in our conversation?",
              "I've done some research on your organization. May I share a few observations and get your perspective?"
            ],
            probing: [
              "Tell me more about how that affects your day-to-day operations?",
              "What have you tried before and what were the results?",
              "How do others in your organization view this challenge?",
              "What would need to be true for you to move forward?"
            ],
            supporting: [
              "Based on what you've shared, here's how we've helped similar organizations...",
              "That aligns with research we've conducted across [X] companies...",
              "I can see why that's a priority. Let me share a relevant example..."
            ],
            closing: [
              "Given what we've discussed, what would be the most valuable next step?",
              "Would it be helpful to schedule a deeper dive with [relevant expert]?",
              "Can we agree on a timeline to move forward?"
            ]
          };
          
          return (
          <>
            {/* Call Preparation Header */}
            <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Discovery Toolkit</CardTitle>
                      <CardDescription>Your complete call preparation for {project?.companyName} - {currentTheme?.name}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={handleStartDiscovery}
                      disabled={generateQuestionsMutation.isPending}
                      data-testid="button-generate-questions"
                    >
                      {generateQuestionsMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate AI Questions
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Green Sheet / Call Planner */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-emerald-500/20">
                <CardHeader className="bg-emerald-500/5">
                  <CardTitle className="flex items-center gap-2 text-emerald-700">
                    <ClipboardList className="w-5 h-5" />
                    Call Planner (Green Sheet)
                  </CardTitle>
                  <CardDescription>Your strategic framework for this conversation</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                      <Target className="w-4 h-4 text-emerald-600" />
                      Call Objective
                    </h4>
                    <p className="text-sm p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      {callPlanner.objective}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Desired Outcome
                    </h4>
                    <p className="text-sm p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      {callPlanner.desiredOutcome}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      Suggested Opening
                    </h4>
                    <p className="text-sm italic p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      {callPlanner.openingStatement}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Rapport & Credibility */}
              <Card className="border-blue-500/20">
                <CardHeader className="bg-blue-500/5">
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Users className="w-5 h-5" />
                    Build Rapport & Credibility
                  </CardTitle>
                  <CardDescription>Establish trust and demonstrate expertise</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Rapport Builders</h4>
                    <div className="space-y-2">
                      {callPlanner.rapportBuilders.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-blue-500/5">
                          <Heart className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Credibility Statements</h4>
                    <div className="space-y-2">
                      {callPlanner.credibilityStatements.map((statement, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm italic p-2 rounded-lg bg-blue-500/5">
                          <Award className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          {statement}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Success Stories with Storytelling Coach */}
            <Card className="border-amber-500/20">
              <CardHeader className="bg-amber-500/5">
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <Trophy className="w-5 h-5" />
                  Success Stories & Storytelling Coach
                </CardTitle>
                <CardDescription>Build credibility with compelling stories for {project?.companyName}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-6">
                {/* Storytelling Framework - Collapsible */}
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <div className="p-4 rounded-xl border-2 border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 cursor-pointer hover-elevate">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-amber-700" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-amber-800">Story Crafting Guide</h4>
                            <p className="text-xs text-amber-700">Before, During & After - Make your stories memorable</p>
                          </div>
                        </div>
                        <ChevronDown className="w-5 h-5 text-amber-700" />
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-4 space-y-4">
                      {/* BEFORE */}
                      <div className="p-4 rounded-lg border bg-background">
                        <h5 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/30">1</Badge>
                          BEFORE: Craft Your Story
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2 p-2 rounded bg-blue-500/5">
                            <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span><strong>Single Message:</strong> What's the one idea they MUST remember? Say it in one sentence.</span>
                          </div>
                          <div className="flex items-start gap-2 p-2 rounded bg-blue-500/5">
                            <Heart className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span><strong>Emotion:</strong> What should they feel? Urgency? Hope? Resolve? What's at stake?</span>
                          </div>
                          <div className="flex items-start gap-2 p-2 rounded bg-blue-500/5">
                            <Zap className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span><strong>Hook:</strong> High tension moment? Provocative question? "Picture this..." Surprising fact?</span>
                          </div>
                          <div className="flex items-start gap-2 p-2 rounded bg-blue-500/5">
                            <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span><strong>Structure:</strong> Situation → Struggle → Insight → Outcome</span>
                          </div>
                          <div className="flex items-start gap-2 p-2 rounded bg-blue-500/5">
                            <Users className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span><strong>Hero:</strong> Who's the character? Their motivations? How did they change?</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* DURING */}
                      <div className="p-4 rounded-lg border bg-background">
                        <h5 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30">2</Badge>
                          DURING: Tell Your Story
                        </h5>
                        <div className="grid gap-2 md:grid-cols-2 text-sm">
                          <div className="p-2 rounded bg-emerald-500/5 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>Start fast — no preamble</span>
                          </div>
                          <div className="p-2 rounded bg-emerald-500/5 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>Short sentences in tension</span>
                          </div>
                          <div className="p-2 rounded bg-emerald-500/5 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>Show the turning point</span>
                          </div>
                          <div className="p-2 rounded bg-emerald-500/5 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>Don't over-explain data</span>
                          </div>
                          <div className="p-2 rounded bg-emerald-500/5 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>Keep it conversational</span>
                          </div>
                          <div className="p-2 rounded bg-emerald-500/5 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>Pause strategically</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* AFTER */}
                      <div className="p-4 rounded-lg border bg-background">
                        <h5 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <Badge className="bg-purple-500/10 text-purple-700 border-purple-500/30">3</Badge>
                          AFTER: Land Your Story
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="p-2 rounded bg-purple-500/5 flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                            <span>Finish with a "moment of meaning" — crisp insight or forward-looking question</span>
                          </div>
                          <div className="p-2 rounded bg-purple-500/5 flex items-start gap-2">
                            <ArrowRight className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                            <span>Make the takeaway explicit but not obvious — connect story to action</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* TEST */}
                      <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <h5 className="font-semibold text-sm mb-2 text-amber-800 flex items-center gap-2">
                          <HelpCircle className="w-4 h-4" />
                          Test Your Story
                        </h5>
                        <div className="space-y-1 text-sm text-amber-900">
                          <p>• Would a stranger care? If not, sharpen the tension.</p>
                          <p>• Can someone retell it? Keep it simple.</p>
                          <p>• Does it reveal leadership, judgment, or values? That's a leader's story.</p>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Success Stories List - Simplified */}
                <div className="space-y-4">
                  {successStories.map((story, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-sm">{story.client}</h4>
                            <Badge variant="outline" className="text-xs">{story.industry}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{story.challenge}</p>
                        </div>
                        <Link href={story.storyLink}>
                          <Button size="sm" variant="outline" className="text-xs" data-testid={`link-story-${idx}`}>
                            <FileText className="w-3 h-3 mr-1" />
                            Full Story
                          </Button>
                        </Link>
                      </div>
                      
                      {/* Why Relevant */}
                      <div className="p-2 rounded bg-primary/5 border border-primary/20 mb-3">
                        <p className="text-xs"><strong>For {project?.companyName}:</strong> {story.whyRelevantTo(project?.companyName || "this client")}</p>
                      </div>
                      
                      {/* Metrics inline */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {story.metrics.map((metric, mIdx) => (
                          <Badge key={mIdx} className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 text-xs">
                            {metric}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* How to tell */}
                      <p className="text-xs italic text-amber-700">Tip: "{story.howToTell}"</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strategic Questions - Simplified Single Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  Question Frameworks
                </CardTitle>
                <CardDescription>Quick reference guides for each methodology - expand for examples</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Methodology Pills */}
                <div className="grid gap-3 md:grid-cols-3">
                  {/* SPIN */}
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <div className="p-3 rounded-lg border cursor-pointer hover-elevate bg-purple-500/5 border-purple-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs">SPIN</Badge>
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs font-medium">Situation → Problem → Implication → Need</p>
                        <p className="text-xs text-muted-foreground">Uncover pain & build value</p>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-2 p-3 rounded-lg border bg-purple-500/5 space-y-2">
                        <div className="text-xs"><Badge variant="outline" className="text-xs mr-1">S</Badge> {spinQuestions.situation[0]}</div>
                        <div className="text-xs"><Badge variant="outline" className="text-xs mr-1">P</Badge> {spinQuestions.problem[0]}</div>
                        <div className="text-xs"><Badge variant="outline" className="text-xs mr-1">I</Badge> {spinQuestions.implication[0]}</div>
                        <div className="text-xs"><Badge variant="outline" className="text-xs mr-1">N</Badge> {spinQuestions.needPayoff[0]}</div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                  
                  {/* Miller Heiman */}
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <div className="p-3 rounded-lg border cursor-pointer hover-elevate bg-blue-500/5 border-blue-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">Miller Heiman</Badge>
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs font-medium">Map Buying Influences</p>
                        <p className="text-xs text-muted-foreground">Economic • User • Technical • Coach</p>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-2 p-3 rounded-lg border bg-blue-500/5 space-y-2">
                        <div className="text-xs"><Users className="w-3 h-3 inline mr-1" /> <strong>Concept:</strong> {millerHeimanQuestions.conceptual[0]}</div>
                        <div className="text-xs"><Users className="w-3 h-3 inline mr-1" /> <strong>Economic:</strong> {millerHeimanQuestions.economicBuyer[0]}</div>
                        <div className="text-xs"><Users className="w-3 h-3 inline mr-1" /> <strong>Technical:</strong> {millerHeimanQuestions.technicalBuyer[0]}</div>
                        <div className="text-xs"><Users className="w-3 h-3 inline mr-1" /> <strong>User:</strong> {millerHeimanQuestions.userBuyer[0]}</div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                  
                  {/* PSS */}
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <div className="p-3 rounded-lg border cursor-pointer hover-elevate bg-emerald-500/5 border-emerald-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">PSS</Badge>
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs font-medium">Open → Probe → Support → Close</p>
                        <p className="text-xs text-muted-foreground">Conversation flow structure</p>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-2 p-3 rounded-lg border bg-emerald-500/5 space-y-2">
                        <div className="text-xs"><ArrowRight className="w-3 h-3 inline mr-1" /> <strong>Open:</strong> "{pssQuestions.opening[0]}"</div>
                        <div className="text-xs"><ArrowRight className="w-3 h-3 inline mr-1" /> <strong>Probe:</strong> "{pssQuestions.probing[0]}"</div>
                        <div className="text-xs"><ArrowRight className="w-3 h-3 inline mr-1" /> <strong>Support:</strong> "{pssQuestions.supporting[0]}"</div>
                        <div className="text-xs"><ArrowRight className="w-3 h-3 inline mr-1" /> <strong>Close:</strong> "{pssQuestions.closing[0]}"</div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Call Builder */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Your Call Builder
                        <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white border-0">Interactive</Badge>
                      </CardTitle>
                      <CardDescription>Build your personalized conversation flow - add questions to your call plan</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm">
                      <ClipboardList className="w-3 h-3 mr-1" />
                      {myCallFlow.length} in your flow
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Coaching Tip - Contextual */}
                {showCoachingTip && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 relative">
                    <button 
                      className="absolute top-2 right-2 text-amber-700 hover:text-amber-900"
                      onClick={() => setShowCoachingTip(false)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="w-5 h-5 text-amber-700" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-amber-800 mb-1">Coach Tip: {callPhase === "opening" ? "Start Strong" : callPhase === "discovery" ? "Go Deep" : callPhase === "support" ? "Build Value" : "Land the Next Step"}</h4>
                        <p className="text-sm text-amber-700">
                          {callPhase === "opening" && "Open with a provocative insight from your research. Show you've done your homework. Get them curious."}
                          {callPhase === "discovery" && "Ask one question at a time. Listen more than you talk. Follow the thread - their answers reveal the real opportunity."}
                          {callPhase === "support" && "Share stories that mirror their situation. Use phrases like 'We've seen this pattern before...' to build credibility."}
                          {callPhase === "closing" && "Don't ask 'Do you have any questions?' Instead, propose a specific next step with a date."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Conversation Phase Tabs */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "opening", label: "Opening", icon: Play, color: "emerald" },
                    { id: "discovery", label: "Discovery", icon: Search, color: "blue" },
                    { id: "support", label: "Support", icon: Award, color: "purple" },
                    { id: "closing", label: "Closing", icon: Target, color: "amber" }
                  ].map((phase) => {
                    const PhaseIcon = phase.icon;
                    const isActive = callPhase === phase.id;
                    const phaseQuestions = myCallFlow.filter(q => q.phase === phase.id);
                    return (
                      <button
                        key={phase.id}
                        onClick={() => setCallPhase(phase.id as typeof callPhase)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          isActive 
                            ? `bg-${phase.color}-500/20 border-2 border-${phase.color}-500/50 text-${phase.color}-700` 
                            : "border border-muted hover-elevate"
                        }`}
                      >
                        <PhaseIcon className="w-4 h-4" />
                        <span className="font-medium text-sm">{phase.label}</span>
                        {phaseQuestions.length > 0 && (
                          <Badge variant="secondary" className="text-xs">{phaseQuestions.length}</Badge>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* My Call Flow - What I've Added */}
                {myCallFlow.filter(q => q.phase === callPhase).length > 0 && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-primary" />
                      Your {callPhase.charAt(0).toUpperCase() + callPhase.slice(1)} Questions
                    </h4>
                    <div className="space-y-2">
                      {myCallFlow.filter(q => q.phase === callPhase).map((item, idx) => (
                        <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                            {idx + 1}
                          </div>
                          <p className="text-sm flex-1">{item.question}</p>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6"
                            onClick={() => setMyCallFlow(prev => prev.filter(q => q.id !== item.id))}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Methodology Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Filter by:</span>
                  {["SPIN", "MILLER_HEIMAN", "PSS"].map(m => (
                    <button
                      key={m}
                      onClick={() => setActiveMethodologyFilter(activeMethodologyFilter === m ? null : m)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        activeMethodologyFilter === m 
                          ? methodologyMeta[m]?.color + " border" 
                          : "bg-muted/50 hover:bg-muted"
                      }`}
                    >
                      {methodologyMeta[m]?.label || m}
                    </button>
                  ))}
                  {activeMethodologyFilter && (
                    <button 
                      onClick={() => setActiveMethodologyFilter(null)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* AI Questions - Interactive Cards */}
                <div className="space-y-3">
                  {discoveryQuestions.length === 0 ? (
                    <div className="text-center py-12 rounded-xl border-2 border-dashed">
                      <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h4 className="font-semibold mb-2">Generate Personalized Questions</h4>
                      <p className="text-sm text-muted-foreground mb-4">AI will create questions based on your research and selected theme</p>
                      <Button 
                        onClick={handleStartDiscovery}
                        disabled={generateQuestionsMutation.isPending}
                      >
                        {generateQuestionsMutation.isPending ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                        ) : (
                          <><Sparkles className="w-4 h-4 mr-2" />Generate AI Questions</>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          AI-Suggested Questions
                          <Badge variant="secondary" className="text-xs">{discoveryQuestions.filter(q => !activeMethodologyFilter || q.methodology === activeMethodologyFilter).length}</Badge>
                        </h4>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handleStartDiscovery}
                          disabled={generateQuestionsMutation.isPending}
                        >
                          {generateQuestionsMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                          Regenerate
                        </Button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        {discoveryQuestions
                          .filter(q => !activeMethodologyFilter || q.methodology === activeMethodologyFilter)
                          .slice(0, 10)
                          .map(q => {
                            const isInFlow = myCallFlow.some(f => f.id === q.id);
                            const meta = methodologyMeta[q.methodology || "SPIN"];
                            return (
                              <div 
                                key={q.id} 
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                  isInFlow 
                                    ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                                    : "hover:border-primary/50 hover:bg-primary/5"
                                }`}
                                onClick={() => {
                                  if (isInFlow) {
                                    setMyCallFlow(prev => prev.filter(f => f.id !== q.id));
                                  } else {
                                    setMyCallFlow(prev => [...prev, { id: q.id, question: q.question, phase: callPhase, methodology: q.methodology || undefined }]);
                                  }
                                }}
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <Badge className={`${meta?.color || ""} border text-xs`}>{meta?.label || q.methodology}</Badge>
                                  {isInFlow ? (
                                    <Badge className="bg-primary text-primary-foreground text-xs">
                                      <Check className="w-3 h-3 mr-1" />Added
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs hover:bg-primary hover:text-primary-foreground">
                                      <Plus className="w-3 h-3 mr-1" />Add
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm font-medium mb-2">{q.question}</p>
                                <p className="text-xs text-muted-foreground">{q.purpose}</p>
                                {q.relatedKPI && (
                                  <div className="mt-2 p-2 rounded bg-blue-500/5 border border-blue-500/20">
                                    <p className="text-xs text-blue-700 flex items-center gap-1">
                                      <ArrowRight className="w-3 h-3" />
                                      Related: {q.relatedKPI}
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </>
                  )}
                </div>

                {/* Quick Add - Methodology-based questions */}
                <div className="p-4 rounded-xl border bg-muted/30">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-600" />
                    Quick Add by Methodology
                  </h4>
                  <div className="grid gap-3 md:grid-cols-3">
                    {/* SPIN Quick Add */}
                    <div className="space-y-2">
                      <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs mb-2">SPIN</Badge>
                      {Object.entries(spinQuestions).slice(0, 2).map(([stage, questions]) => (
                        <button
                          key={stage}
                          onClick={() => setMyCallFlow(prev => [...prev, { 
                            id: Date.now() + Math.random(), 
                            question: questions[0], 
                            phase: callPhase,
                            methodology: "SPIN"
                          }])}
                          className="w-full text-left p-2 rounded border text-xs hover-elevate bg-background"
                        >
                          <Badge variant="outline" className="text-xs mb-1">{stage.charAt(0).toUpperCase()}</Badge>
                          <p className="line-clamp-2">{questions[0]}</p>
                        </button>
                      ))}
                    </div>
                    {/* Miller Heiman Quick Add */}
                    <div className="space-y-2">
                      <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs mb-2">Miller Heiman</Badge>
                      {Object.entries(millerHeimanQuestions).slice(0, 2).map(([buyer, questions]) => (
                        <button
                          key={buyer}
                          onClick={() => setMyCallFlow(prev => [...prev, { 
                            id: Date.now() + Math.random(), 
                            question: questions[0], 
                            phase: callPhase,
                            methodology: "MILLER_HEIMAN"
                          }])}
                          className="w-full text-left p-2 rounded border text-xs hover-elevate bg-background"
                        >
                          <Badge variant="outline" className="text-xs mb-1">{buyer === "conceptual" ? "Concept" : buyer === "economicBuyer" ? "Econ" : "User"}</Badge>
                          <p className="line-clamp-2">{questions[0]}</p>
                        </button>
                      ))}
                    </div>
                    {/* PSS Quick Add */}
                    <div className="space-y-2">
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs mb-2">PSS</Badge>
                      {Object.entries(pssQuestions).slice(0, 2).map(([phase, questions]) => (
                        <button
                          key={phase}
                          onClick={() => setMyCallFlow(prev => [...prev, { 
                            id: Date.now() + Math.random(), 
                            question: questions[0], 
                            phase: callPhase,
                            methodology: "PSS"
                          }])}
                          className="w-full text-left p-2 rounded border text-xs hover-elevate bg-background"
                        >
                          <Badge variant="outline" className="text-xs mb-1">{phase.charAt(0).toUpperCase() + phase.slice(1)}</Badge>
                          <p className="line-clamp-2">{questions[0]}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setDiscoveryStep("intelligence")} data-testid="button-back-to-intelligence">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Intelligence
              </Button>
              <Button onClick={() => setDiscoveryStep("review")} data-testid="button-next-to-review">
                Continue to Review
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
          );
        })()} {/* End of Step 3: Questions/Discovery Toolkit */}

        {/* Step 4: Review & Select Questions */}
        {discoveryStep === "review" && (() => {
          const generateExportContent = () => {
            const themeName = selectedDiscoveryTheme ? discoveryThemes.find(t => t.id === selectedDiscoveryTheme)?.name : "Discovery";
            const lines: string[] = [];
            lines.push(`# ${themeName} Discovery - Call Preparation`);
            lines.push(`Generated: ${new Date().toLocaleDateString()}`);
            lines.push("");
            
            const hasCallFlow = myCallFlow && myCallFlow.length > 0;
            const selectedQs = discoveryQuestions && selectedQuestions 
              ? discoveryQuestions.filter(q => selectedQuestions.has(q.id)) 
              : [];
            const hasSelectedQuestions = selectedQs.length > 0;
            
            if (!hasCallFlow && !hasSelectedQuestions) {
              lines.push("No questions selected for this discovery session.");
              return lines.join("\n");
            }
            
            if (hasCallFlow) {
              lines.push("## My Call Flow");
              lines.push("");
              const phases = ["opening", "discovery", "support", "closing"];
              phases.forEach(phase => {
                const phaseQuestions = myCallFlow.filter(q => q.phase === phase);
                if (phaseQuestions.length > 0) {
                  lines.push(`### ${phase.charAt(0).toUpperCase() + phase.slice(1)}`);
                  phaseQuestions.forEach((q, i) => {
                    lines.push(`${i + 1}. ${q.question}`);
                    if (q.methodology) lines.push(`   [${q.methodology}]`);
                  });
                  lines.push("");
                }
              });
            }
            
            if (hasSelectedQuestions) {
              lines.push("## Selected Discovery Questions");
              lines.push("");
              selectedQs.forEach((q, i) => {
                lines.push(`${i + 1}. ${q.question}`);
                lines.push(`   Methodology: ${q.methodology || "General"}`);
                if (q.followUpHint) lines.push(`   Follow-up: ${q.followUpHint}`);
                if (q.relatedKPI) lines.push(`   KPI: ${q.relatedKPI}`);
                lines.push("");
              });
            }
            
            return lines.join("\n");
          };
          
          const handleCopyToClipboard = async () => {
            try {
              await navigator.clipboard.writeText(generateExportContent());
              toast({ title: "Copied!", description: "Call preparation exported to clipboard" });
            } catch {
              toast({ title: "Copy failed", description: "Please try the download option instead", variant: "destructive" });
            }
          };
          
          const handleDownload = () => {
            try {
              const content = generateExportContent();
              const blob = new Blob([content], { type: "text/markdown" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `discovery-call-prep-${new Date().toISOString().split("T")[0]}.md`;
              a.click();
              URL.revokeObjectURL(url);
              toast({ title: "Downloaded!", description: "Call preparation saved as markdown file" });
            } catch {
              toast({ title: "Download failed", description: "Unable to generate file", variant: "destructive" });
            }
          };
          
          return (
          <>
            {/* My Call Flow Summary */}
            {myCallFlow.length > 0 && (
              <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-blue-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Phone className="w-5 h-5 text-primary" />
                    My Call Flow ({myCallFlow.length} questions)
                  </CardTitle>
                  <CardDescription>Your custom conversation structure from the Questions step</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-4">
                    {(["opening", "discovery", "support", "closing"] as const).map(phase => {
                      const phaseQuestions = myCallFlow.filter(q => q.phase === phase);
                      const phaseColors: Record<string, string> = {
                        opening: "border-emerald-500/30 bg-emerald-500/5",
                        discovery: "border-blue-500/30 bg-blue-500/5",
                        support: "border-purple-500/30 bg-purple-500/5",
                        closing: "border-amber-500/30 bg-amber-500/5"
                      };
                      return (
                        <div key={phase} className={`p-3 rounded-lg border ${phaseColors[phase]}`}>
                          <h5 className="font-semibold text-xs uppercase tracking-wide mb-2 text-muted-foreground">
                            {phase}
                          </h5>
                          {phaseQuestions.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">No questions</p>
                          ) : (
                            <div className="space-y-2">
                              {phaseQuestions.map((q, i) => (
                                <div key={q.id} className="flex items-start gap-2">
                                  <span className="text-xs font-medium text-muted-foreground">{i + 1}.</span>
                                  <p className="text-xs line-clamp-2">{q.question}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  Review & Select Questions
                </CardTitle>
                <CardDescription>Choose which questions to use in your discovery conversation, then complete in-system or export</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {discoveryQuestions.length === 0 && myCallFlow.length === 0 ? (
                    <div className="text-center py-8">
                      <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No questions generated yet. Go back to generate questions first.</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedQuestions(new Set(discoveryQuestions.map(q => q.id)))}
                            data-testid="button-select-all"
                          >
                            Select All
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedQuestions(new Set())}
                            data-testid="button-clear-all"
                          >
                            Clear All
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            {selectedQuestions.size} of {discoveryQuestions.length} selected
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleCopyToClipboard}
                            disabled={selectedQuestions.size === 0 && myCallFlow.length === 0}
                            data-testid="button-copy-clipboard"
                          >
                            <ClipboardList className="w-4 h-4 mr-2" />
                            Copy
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleDownload}
                            disabled={selectedQuestions.size === 0 && myCallFlow.length === 0}
                            data-testid="button-download-export"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {discoveryQuestions.map((q) => {
                          const meta = methodologyMeta[q.methodology || "SPIN"];
                          const isSelected = selectedQuestions.has(q.id);
                          return (
                            <div 
                              key={q.id} 
                              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover-elevate"
                              }`}
                              onClick={() => {
                                const newSet = new Set(selectedQuestions);
                                if (isSelected) {
                                  newSet.delete(q.id);
                                } else {
                                  newSet.add(q.id);
                                }
                                setSelectedQuestions(newSet);
                              }}
                              data-testid={`question-item-${q.id}`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                  isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                                }`}>
                                  {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium mb-2">{q.question}</p>
                                  <div className="flex flex-wrap gap-2">
                                    <Badge className={`${meta?.color || ""} border text-xs`}>{meta?.label || q.methodology}</Badge>
                                    <Badge variant="outline" className="text-xs">{q.capabilityName}</Badge>
                                    {q.relatedKPI && (
                                      <Badge variant="secondary" className="text-xs">KPI: {q.relatedKPI}</Badge>
                                    )}
                                  </div>
                                  {q.followUpHint && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                      <span className="font-medium">Follow-up:</span> {q.followUpHint}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Answer Questions In-System */}
            {selectedQuestions.size > 0 && (
              <Card className="border-emerald-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    Complete Discovery In-System
                  </CardTitle>
                  <CardDescription>Record answers to selected questions for enhanced insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {discoveryQuestions.filter(q => selectedQuestions.has(q.id)).slice(0, 5).map((q) => (
                      <div key={q.id} className="p-4 rounded-lg border">
                        <p className="text-sm font-medium mb-2">{q.question}</p>
                        <Textarea 
                          placeholder="Record the customer's response..."
                          className="min-h-[80px]"
                          value={questionAnswers[q.id] || ""}
                          onChange={(e) => setQuestionAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                          data-testid={`answer-${q.id}`}
                        />
                      </div>
                    ))}
                    {selectedQuestions.size > 5 && (
                      <p className="text-sm text-muted-foreground text-center">
                        Showing 5 of {selectedQuestions.size} selected questions
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation for Review Step */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setDiscoveryStep("questions")} data-testid="button-back-to-questions">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Questions
              </Button>
              <Button 
                onClick={() => {
                  setDiscoveryCompleted(true);
                  setDiscoveryStep("insights");
                }}
                disabled={selectedQuestions.size === 0}
                data-testid="button-complete-discovery"
              >
                Complete Discovery & Generate Insights
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
          );
        })()} {/* End of Step 4: Review */}

        {/* Step 5: Enhanced Insights */}
        {discoveryStep === "insights" && discoveryCompleted && (() => {
          const themeName = selectedDiscoveryTheme ? discoveryThemes.find(t => t.id === selectedDiscoveryTheme)?.name : "General";
          const selectedQs = discoveryQuestions.filter(q => selectedQuestions.has(q.id));
          const answeredCount = Object.values(questionAnswers).filter(a => a && a.trim().length > 0).length;
          
          const methodologyCounts = {
            SPIN: selectedQs.filter(q => q.methodology === "SPIN").length,
            MILLER_HEIMAN: selectedQs.filter(q => q.methodology === "MILLER_HEIMAN").length,
            PSS: selectedQs.filter(q => q.methodology === "PSS").length
          };
          
          const totalMethodologyCount = methodologyCounts.SPIN + methodologyCounts.MILLER_HEIMAN + methodologyCounts.PSS;
          
          const getMethodologyInsight = (methodology: string, count: number) => {
            if (count === 0) return null;
            const insights: Record<string, { title: string; insight: string }> = {
              SPIN: { title: "Pain Points Explored", insight: "SPIN questions helped uncover customer situation, problems, and implications. Strong foundation for value-based positioning." },
              MILLER_HEIMAN: { title: "Buying Process Mapped", insight: "Blue Sheet insights gathered on decision makers, buying influences, and win themes. Political landscape is clearer." },
              PSS: { title: "Solution Fit Validated", insight: "Professional Selling Skills questions confirmed solution-customer alignment and established consultative credibility." }
            };
            return insights[methodology];
          };

          return (
          <>
            {/* Discovery Summary Header */}
            <Card className="bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5 border-emerald-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle>Discovery Complete</CardTitle>
                      <CardDescription>Enhanced insights from your {themeName} discovery</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 text-sm px-3 py-1">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Completed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="p-3 rounded-lg bg-background/50 border text-center">
                    <div className="text-2xl font-bold text-primary">{selectedQs.length}</div>
                    <div className="text-xs text-muted-foreground">Questions Selected</div>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 border text-center">
                    <div className="text-2xl font-bold text-blue-600">{myCallFlow.length}</div>
                    <div className="text-xs text-muted-foreground">Call Flow Items</div>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 border text-center">
                    <div className="text-2xl font-bold text-purple-600">{answeredCount}</div>
                    <div className="text-xs text-muted-foreground">Responses Recorded</div>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 border text-center">
                    <div className="text-2xl font-bold text-amber-600">
                      {Object.values(methodologyCounts).filter(c => c > 0).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Methodologies Used</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Methodology Coverage Analysis */}
            <Card className="border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-600" />
                  Methodology Coverage
                </CardTitle>
                <CardDescription>How your discovery leveraged Korn Ferry selling methodologies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { key: "SPIN", name: "SPIN Selling", color: "purple", count: methodologyCounts.SPIN },
                    { key: "MILLER_HEIMAN", name: "Miller Heiman", color: "blue", count: methodologyCounts.MILLER_HEIMAN },
                    { key: "PSS", name: "PSS", color: "emerald", count: methodologyCounts.PSS }
                  ].map(m => {
                    const insight = getMethodologyInsight(m.key, m.count);
                    return (
                      <div 
                        key={m.key} 
                        className={`p-4 rounded-lg border ${m.count > 0 ? `bg-${m.color}-500/5 border-${m.color}-500/20` : "bg-muted/30 border-muted"}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm">{m.name}</span>
                          <Badge variant={m.count > 0 ? "default" : "outline"} className="text-xs">
                            {m.count} questions
                          </Badge>
                        </div>
                        {insight ? (
                          <>
                            <p className="font-medium text-xs text-primary mb-1">{insight.title}</p>
                            <p className="text-xs text-muted-foreground">{insight.insight}</p>
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">Not used in this discovery. Consider for follow-up.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Key Trends - Theme Specific */}
            <Card className="border-blue-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Key Trends for {themeName}
                </CardTitle>
                <CardDescription>Strategic patterns identified from your discovery</CardDescription>
              </CardHeader>
              <CardContent>
                {totalMethodologyCount > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        <h4 className="font-semibold text-sm">Strategic Priority Alignment</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">Customer priorities align with Korn Ferry {themeName} capabilities. Clear path to demonstrating unique value proposition.</p>
                      <Badge className="mt-2 bg-blue-500/10 text-blue-700 border-blue-500/20">High Confidence</Badge>
                    </div>
                    <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <h4 className="font-semibold text-sm">Budget Signals Positive</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">Economic buyer engaged early. ROI framework will strengthen business case for {themeName} investment.</p>
                      <Badge className="mt-2 bg-emerald-500/10 text-emerald-700 border-emerald-500/20">Positive Signal</Badge>
                    </div>
                    <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-amber-600" />
                        <h4 className="font-semibold text-sm">Stakeholder Complexity</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">Multiple decision makers identified. Champion development and political navigation will be critical success factors.</p>
                      <Badge className="mt-2 bg-amber-500/10 text-amber-700 border-amber-500/20">Monitor</Badge>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-purple-600" />
                        <h4 className="font-semibold text-sm">Cross-Sell Opportunity</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">Discovery revealed adjacent needs beyond {themeName}. Consider expanding scope or planning follow-on engagements.</p>
                      <Badge className="mt-2 bg-purple-500/10 text-purple-700 border-purple-500/20">Opportunity</Badge>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-lg bg-muted/30 border text-center">
                    <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium text-sm mb-1">Limited Methodology Coverage</p>
                    <p className="text-sm text-muted-foreground">Your discovery used general questions. Consider incorporating SPIN, Miller Heiman, or PSS methodology questions in follow-up conversations for deeper insights.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gaps & Follow-Up Required */}
            <Card className="border-amber-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Gaps & Follow-Up Required
                </CardTitle>
                <CardDescription>Areas requiring additional discovery or validation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {methodologyCounts.SPIN === 0 && (
                    <div className="flex items-start gap-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Pain Points Not Fully Explored</p>
                        <p className="text-xs text-muted-foreground">Consider SPIN questions in follow-up to better understand situation, problems, and implications.</p>
                      </div>
                    </div>
                  )}
                  {methodologyCounts.MILLER_HEIMAN === 0 && (
                    <div className="flex items-start gap-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Buying Process Unclear</p>
                        <p className="text-xs text-muted-foreground">Miller Heiman questions would help map decision makers, buying influences, and political landscape.</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Success Metrics Need Definition</p>
                      <p className="text-xs text-muted-foreground">Work with stakeholders to establish specific KPIs and targets for measuring {themeName} impact.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Competitive Landscape</p>
                      <p className="text-xs text-muted-foreground">Validate positioning against potential competitors and prepare differentiation talking points.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Next Steps */}
            <Card className="border-emerald-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-emerald-600" />
                  Recommended Next Steps
                </CardTitle>
                <CardDescription>Actionable items to advance the opportunity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg border hover-elevate">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-sm flex-shrink-0">1</div>
                    <div>
                      <p className="font-medium text-sm">Share Discovery Summary with Champion</p>
                      <p className="text-xs text-muted-foreground">Export your call preparation and share key insights. Build internal advocacy for the {themeName} initiative.</p>
                      <Badge className="mt-2" variant="outline">This Week</Badge>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border hover-elevate">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-sm flex-shrink-0">2</div>
                    <div>
                      <p className="font-medium text-sm">Schedule Value Discussion with Economic Buyer</p>
                      <p className="text-xs text-muted-foreground">Prepare ROI model using industry benchmarks and Korn Ferry success stories relevant to {themeName}.</p>
                      <Badge className="mt-2" variant="outline">Next Week</Badge>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border hover-elevate">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-sm flex-shrink-0">3</div>
                    <div>
                      <p className="font-medium text-sm">Complete Blue Sheet Analysis</p>
                      <p className="text-xs text-muted-foreground">Document buying center roles, competitive positioning, and win themes in opportunity record.</p>
                      <Badge className="mt-2" variant="outline">Week 2</Badge>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border hover-elevate">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-sm flex-shrink-0">4</div>
                    <div>
                      <p className="font-medium text-sm">Prepare Custom Proposal</p>
                      <p className="text-xs text-muted-foreground">Use discovery insights to tailor {themeName} proposal addressing specific customer challenges and success criteria.</p>
                      <Badge className="mt-2" variant="outline">Week 3</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation for Insights Step */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setDiscoveryStep("review")} data-testid="button-back-to-review">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Review
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    const content = `# Discovery Insights - ${themeName}\n\n## Summary\n- Questions Selected: ${selectedQs.length}\n- Call Flow Items: ${myCallFlow.length}\n- Responses Recorded: ${answeredCount}\n\n## Methodology Coverage\n- SPIN: ${methodologyCounts.SPIN} questions\n- Miller Heiman: ${methodologyCounts.MILLER_HEIMAN} questions\n- PSS: ${methodologyCounts.PSS} questions`;
                    navigator.clipboard.writeText(content);
                    toast({ title: "Copied!", description: "Insights summary copied to clipboard" });
                  }}
                  data-testid="button-copy-insights"
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Copy Summary
                </Button>
                <Button 
                  onClick={() => {
                    setDiscoveryStep("theme-select");
                    setSelectedDiscoveryTheme(null);
                    setSelectedQuestions(new Set());
                    setQuestionAnswers({});
                    setDiscoveryCompleted(false);
                    setMyCallFlow([]);
                  }}
                  data-testid="button-start-new-discovery"
                >
                  Start New Discovery
                  <RefreshCcw className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </>
          );
        })()}
      </TabsContent>

      <TabsContent value="value-cases" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Value Cases</CardTitle>
            <CardDescription>Business value propositions for this engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {valueCases.map(vc => (
                <div key={vc.id} className="p-4 rounded-lg border hover-elevate">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{vc.title}</h4>
                      {vc.description && (
                        <p className="text-sm text-muted-foreground mt-1">{vc.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{vc.status}</Badge>
                      {vc.estimatedValue && (
                        <p className="text-lg font-bold text-green-600 mt-1">
                          ${(vc.estimatedValue / 1000000).toFixed(2)}M
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {valueCases.length === 0 && (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No value cases created yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Success Stories - KF success stories for proof points (Trend #6: HR value quantification) */}
      <TabsContent value="success-stories" className="space-y-6">
        <Card className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-amber-500/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <CardTitle>Korn Ferry Success Stories</CardTitle>
                <CardDescription>Verified case studies and proof points for value conversations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-sm">ROI Stories</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Proven impact ranges and financial bridges
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-sm">Industry Benchmarks</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Selection accuracy, development lift, turnover changes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-600" />
              Relevant Success Stories
            </CardTitle>
            <CardDescription>
              Stories matching this engagement's solution areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Sample success story cards - would be populated from API */}
              <div className="p-4 rounded-lg border hover-elevate">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">Leadership Development Program</h4>
                  <Badge className="bg-emerald-500/10 text-emerald-600">Verified</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Fortune 500 technology company achieved 35% improvement in leadership pipeline quality
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">Develop</Badge>
                  <Badge variant="outline" className="text-xs">Leadership</Badge>
                  <Badge variant="secondary" className="text-xs">+35% Pipeline Quality</Badge>
                </div>
              </div>
              <div className="p-4 rounded-lg border hover-elevate">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">Sales Effectiveness Transformation</h4>
                  <Badge className="bg-emerald-500/10 text-emerald-600">Verified</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Global manufacturing company increased sales productivity by 22% within 12 months
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">Transform</Badge>
                  <Badge variant="outline" className="text-xs">Sales</Badge>
                  <Badge variant="secondary" className="text-xs">+22% Productivity</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Handoff - Transition to Delivery (Sales to Delivery flow) */}
      <TabsContent value="handoff" className="space-y-6">
        <Card className="bg-gradient-to-r from-emerald-500/5 to-primary/5 border-emerald-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <ArrowUpRight className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <CardTitle>Handoff to Delivery</CardTitle>
                  <CardDescription>Transition this engagement to the delivery team</CardDescription>
                </div>
              </div>
              <Badge variant={kpis.length >= 3 && valueCases.length >= 1 ? "default" : "secondary"}>
                {kpis.length >= 3 && valueCases.length >= 1 ? "Ready for Handoff" : "Preparation Needed"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Before handing off, ensure the Value Canvas is complete with shared KPIs, baselines, and targets.
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <div className={`p-4 rounded-lg border ${kpis.length >= 3 ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {kpis.length >= 3 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    )}
                    <span className="font-medium text-sm">Value Canvas KPIs</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {kpis.length} / 3 minimum defined
                  </p>
                </div>
                <div className={`p-4 rounded-lg border ${valueCases.length >= 1 ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {valueCases.length >= 1 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    )}
                    <span className="font-medium text-sm">Value Cases</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {valueCases.length} case(s) created
                  </p>
                </div>
                <div className={`p-4 rounded-lg border ${insights.length >= 5 ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {insights.length >= 5 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    )}
                    <span className="font-medium text-sm">Discovery Complete</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {insights.length} insights captured
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              Handoff will notify the delivery team and lock value canvas items
            </p>
            <Link href={`/projects/${projectId}/delivery`}>
              <Button 
                disabled={kpis.length < 3 || valueCases.length < 1}
                data-testid="button-handoff-to-delivery"
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Complete Handoff
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Handoff Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className={`w-5 h-5 ${kpis.length >= 3 ? "text-emerald-600" : "text-muted-foreground"}`} />
                <span className={kpis.length >= 3 ? "" : "text-muted-foreground"}>
                  3-5 shared KPIs defined with baselines and targets
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className={`w-5 h-5 ${valueCases.length >= 1 ? "text-emerald-600" : "text-muted-foreground"}`} />
                <span className={valueCases.length >= 1 ? "" : "text-muted-foreground"}>
                  At least one value case created
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className={`w-5 h-5 ${insights.length >= 5 ? "text-emerald-600" : "text-muted-foreground"}`} />
                <span className={insights.length >= 5 ? "" : "text-muted-foreground"}>
                  Discovery insights documented (5+ recommended)
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Success fee / commercial terms noted (optional)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  const renderDeliveryWorkspace = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid grid-cols-5 w-full max-w-3xl">
        <TabsTrigger value="health" data-testid="tab-health">
          <Activity className="w-4 h-4 mr-2" />
          Health Dashboard
        </TabsTrigger>
        <TabsTrigger value="kpis" data-testid="tab-kpis">
          <BarChart3 className="w-4 h-4 mr-2" />
          KPI Tracking
        </TabsTrigger>
        <TabsTrigger value="qbr" data-testid="tab-qbr">
          <Calendar className="w-4 h-4 mr-2" />
          QBR
        </TabsTrigger>
        <TabsTrigger value="governance" data-testid="tab-governance">
          <Layers className="w-4 h-4 mr-2" />
          Value Governance
        </TabsTrigger>
        <TabsTrigger value="success-capture" data-testid="tab-success-capture">
          <Star className="w-4 h-4 mr-2" />
          Success Capture
        </TabsTrigger>
      </TabsList>

      {/* Health Dashboard - CS-style health scores (Trend #4: CS playbooks in value governance) */}
      <TabsContent value="health" className="space-y-6">
        <Card className="bg-gradient-to-r from-emerald-500/5 to-blue-500/5 border-emerald-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <CardTitle>Engagement Health Dashboard</CardTitle>
                  <CardDescription>Real-time health scores and value delivery status</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Overall Health</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${kpisAtRisk === 0 ? "bg-emerald-500" : kpisAtRisk <= 2 ? "bg-amber-500" : "bg-red-500"}`} />
                  <span className="text-xl font-bold">
                    {kpisAtRisk === 0 ? "Healthy" : kpisAtRisk <= 2 ? "At Risk" : "Critical"}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-sm">On Track</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600">{kpisOnTrack}</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-sm">At Risk</span>
                </div>
                <p className="text-2xl font-bold text-amber-600">{kpisAtRisk}</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-sm">Total KPIs</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{kpis.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-sm">Value Realized</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">${(totalValue * 0.3 / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                KPI Health Summary
              </CardTitle>
              <Button size="sm" onClick={() => setIsLogKPIOpen(true)} data-testid="button-log-kpi">
                <Plus className="w-4 h-4 mr-1" />
                Log
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kpis.slice(0, 5).map(kpi => (
                  <div key={kpi.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{kpi.name}</span>
                      <div className="flex items-center gap-2">
                        {/* AI Trend Flag */}
                        {kpi.currentValue && kpi.targetValue && (
                          <Badge variant="outline" className="text-xs">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {kpi.status === "on-track" ? "Trending Up" : "Needs Attention"}
                          </Badge>
                        )}
                        <Badge variant={
                          kpi.status === "on-track" ? "default" :
                          kpi.status === "at-risk" ? "secondary" : "destructive"
                        }>
                          {kpi.status}
                        </Badge>
                      </div>
                    </div>
                    <Progress 
                      value={kpi.currentValue && kpi.targetValue ? 
                        Math.min(100, (kpi.currentValue / kpi.targetValue) * 100) : 0
                      } 
                      className="flex-1"
                    />
                  </div>
                ))}
                {kpis.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No KPIs tracked yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Priority Themes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {jobThemes.slice(0, 5).map(theme => (
                  <div key={theme.id} className="p-3 rounded-lg bg-muted/50 hover-elevate">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{theme.jobName}</span>
                      <Badge variant="outline">{theme.solutionArea || "general"}</Badge>
                    </div>
                    {theme.capabilityName && (
                      <p className="text-xs text-muted-foreground mt-1">{theme.capabilityName}</p>
                    )}
                  </div>
                ))}
                {jobThemes.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No priorities defined yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="kpis" className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>KPI Tracking</CardTitle>
              <CardDescription>Monitor and log KPI measurements</CardDescription>
            </div>
            <Button onClick={() => setIsLogKPIOpen(true)} data-testid="button-log-kpi-main">
              <Plus className="w-4 h-4 mr-2" />
              Log Measurement
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpis.map(kpi => (
                <div key={kpi.id} className="p-4 rounded-lg border hover-elevate">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{kpi.name}</h4>
                      <p className="text-sm text-muted-foreground">{kpi.unit || "units"}</p>
                    </div>
                    <Badge variant={
                      kpi.status === "on-track" ? "default" :
                      kpi.status === "at-risk" ? "secondary" : 
                      kpi.status === "off-track" ? "destructive" : "outline"
                    }>
                      {kpi.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Baseline</span>
                      <p className="font-medium">{kpi.baselineValue ?? "—"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Current</span>
                      <p className="font-medium">{kpi.currentValue ?? "—"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Target</span>
                      <p className="font-medium">{kpi.targetValue ?? "—"}</p>
                    </div>
                  </div>
                  <Progress 
                    value={kpi.currentValue && kpi.targetValue ? 
                      Math.min(100, ((kpi.currentValue - (kpi.baselineValue || 0)) / ((kpi.targetValue || 1) - (kpi.baselineValue || 0))) * 100) : 0
                    } 
                    className="mt-3"
                  />
                </div>
              ))}
              {kpis.length === 0 && (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No KPIs to track</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* QBR - Quarterly Business Reviews (Trend #4: CS playbooks in value governance) */}
      <TabsContent value="qbr" className="space-y-6">
        <Card className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border-blue-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Quarterly Business Review</CardTitle>
                  <CardDescription>Generate QBR decks and capture evidence</CardDescription>
                </div>
              </div>
              <Button data-testid="button-generate-qbr">
                <Download className="w-4 h-4 mr-2" />
                Generate QBR Deck
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-sm">Evidence Collected</span>
                </div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Screenshots & documents</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-sm">Success Stories</span>
                </div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Ready for QBR</p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-sm">KPIs Tracked</span>
                </div>
                <p className="text-2xl font-bold">{kpis.length}</p>
                <p className="text-xs text-muted-foreground">With baseline & target</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              Evidence Collection
            </CardTitle>
            <CardDescription>Upload screenshots, documents, and testimonials for QBR</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <FileCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                Drag and drop files here, or click to upload
              </p>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Upload Evidence
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Value Governance - VRO principles (Trend #3: Value Realisation Office) */}
      <TabsContent value="governance" className="space-y-6">
        <Card className="bg-gradient-to-r from-purple-500/5 to-pink-500/5 border-purple-500/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Layers className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>Value Governance</CardTitle>
                <CardDescription>Value Realisation Office principles and tracking</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-sm">Benefit Owner Assigned</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Each KPI has a designated client owner accountable for measurement
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-sm">Regular Cadence</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Monthly check-ins with quarterly reviews scheduled
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Governance Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className={`w-5 h-5 ${kpis.length >= 3 ? "text-emerald-600" : "text-muted-foreground"}`} />
                <span className={kpis.length >= 3 ? "" : "text-muted-foreground"}>
                  3-5 shared KPIs defined with benefit owners
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Monthly KPI review cadence established
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Quarterly business review scheduled
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Value realisation report template prepared
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Issues & Risks
            </CardTitle>
            <CardDescription>Track blockers and risks to value delivery</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No issues or risks logged yet</p>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Log Issue
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Success Capture - Capture success stories (Trend #6: HR value quantification) */}
      <TabsContent value="success-capture" className="space-y-6">
        <Card className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-amber-500/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <CardTitle>Success Story Capture</CardTitle>
                <CardDescription>Document wins and outcomes for future proof points</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-sm">Quantified Outcomes</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Document measurable improvements with before/after data
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-sm">Client Testimonials</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Capture quotes and feedback from stakeholders
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-600" />
                Captured Success Stories
              </CardTitle>
              <CardDescription>Stories ready for verification and library addition</CardDescription>
            </div>
            <Button data-testid="button-capture-story">
              <Plus className="w-4 h-4 mr-2" />
              Capture Story
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No success stories captured yet</p>
              <p className="text-sm text-muted-foreground">
                Document wins as they happen to build your proof point library
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Story Template</CardTitle>
            <CardDescription>Use this structure to capture compelling success stories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-lg border">
                <span className="text-sm font-medium">Challenge</span>
                <p className="text-xs text-muted-foreground mt-1">What was the business problem?</p>
              </div>
              <div className="p-3 rounded-lg border">
                <span className="text-sm font-medium">Solution</span>
                <p className="text-xs text-muted-foreground mt-1">What Korn Ferry solution was implemented?</p>
              </div>
              <div className="p-3 rounded-lg border">
                <span className="text-sm font-medium">Outcome</span>
                <p className="text-xs text-muted-foreground mt-1">What measurable results were achieved?</p>
              </div>
              <div className="p-3 rounded-lg border">
                <span className="text-sm font-medium">Quote</span>
                <p className="text-xs text-muted-foreground mt-1">Client testimonial or endorsement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  const otherRole = isSalesRole ? "delivery" : isDeliveryRole ? "sales" : null;
  const otherRoleLabel = otherRole === "sales" ? "Sales Portal" : otherRole === "delivery" ? "Delivery Portal" : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-16 lg:h-20 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Link href="/accounts">
                  <Button variant="ghost" size="sm" className="h-auto py-1 px-2" data-testid="breadcrumb-accounts">
                    <Building2 className="w-3 h-3 mr-1" />
                    Accounts
                  </Button>
                </Link>
                <ChevronRight className="w-4 h-4" />
                {accountId && (
                  <>
                    <Link href={`/accounts/${accountId}/${role}`}>
                      <Button variant="ghost" size="sm" className="h-auto py-1 px-2" data-testid="breadcrumb-account">
                        {project.companyName}
                      </Button>
                    </Link>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
                <span className="font-medium text-foreground">{project.name}</span>
                <ChevronRight className="w-4 h-4" />
                <Badge variant="secondary">{roleLabels[role]}</Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="hidden sm:flex">
                {project.lifecyclePhase ? phaseLabels[project.lifecyclePhase] || project.lifecyclePhase : "Active"}
              </Badge>
              
              {project.ragStatus && (
                <div className={`w-3 h-3 rounded-full ${ragColors[project.ragStatus] || "bg-gray-400"}`} />
              )}

              {otherRole && (
                <Link href={`/projects/${projectId}/${otherRole}`}>
                  <Button variant="ghost" size="sm" data-testid={`button-switch-to-${otherRole}`}>
                    Switch to {otherRoleLabel}
                  </Button>
                </Link>
              )}

              <Link href={`/projects/${projectId}`}>
                <Button variant="outline" size="sm" data-testid="button-project-detail">
                  Full Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <RoleIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <p className="text-muted-foreground">{roleLabels[role]} Workspace</p>
            </div>
          </div>
        </div>

        {isSalesRole && renderSalesWorkspace()}
        {isDeliveryRole && renderDeliveryWorkspace()}
        {!isSalesRole && !isDeliveryRole && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Workspace for {roleLabels[role]} coming soon</p>
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={isLogKPIOpen} onOpenChange={setIsLogKPIOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log KPI Measurement</DialogTitle>
            <DialogDescription>Record an actual value for a KPI</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select KPI</Label>
              <Select
                value={selectedKPI?.id.toString() || ""}
                onValueChange={(v) => setSelectedKPI(kpis.find(k => k.id.toString() === v) || null)}
              >
                <SelectTrigger data-testid="select-kpi">
                  <SelectValue placeholder="Choose a KPI" />
                </SelectTrigger>
                <SelectContent>
                  {kpis.map(kpi => (
                    <SelectItem key={kpi.id} value={kpi.id.toString()}>
                      {kpi.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedKPI && (
              <>
                <div className="grid grid-cols-2 gap-4 text-sm p-3 rounded-lg bg-muted">
                  <div>
                    <span className="text-muted-foreground">Baseline:</span>
                    <span className="ml-2 font-medium">{selectedKPI.baselineValue ?? "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Target:</span>
                    <span className="ml-2 font-medium">{selectedKPI.targetValue ?? "N/A"}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Actual Value</Label>
                  <Input
                    type="number"
                    value={kpiActualValue}
                    onChange={(e) => setKpiActualValue(e.target.value)}
                    placeholder="Enter measured value"
                    data-testid="input-kpi-value"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Note (optional)</Label>
                  <Textarea
                    value={kpiNote}
                    onChange={(e) => setKpiNote(e.target.value)}
                    placeholder="Add context..."
                    data-testid="input-kpi-note"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogKPIOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (selectedKPI && kpiActualValue) {
                  logKPIMutation.mutate({
                    kpiId: selectedKPI.id,
                    actualValue: parseFloat(kpiActualValue),
                    note: kpiNote
                  });
                }
              }}
              disabled={!selectedKPI || !kpiActualValue || logKPIMutation.isPending}
              data-testid="button-save-kpi"
            >
              {logKPIMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>Capture observations and insights</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={newNoteCategory} onValueChange={setNewNoteCategory}>
                <SelectTrigger data-testid="select-note-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="discovery">Discovery</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="action">Action Item</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Write your note..."
                rows={4}
                data-testid="input-note-content"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddNoteOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (newNoteContent.trim()) {
                  addNoteMutation.mutate({
                    content: newNoteContent.trim(),
                    category: newNoteCategory
                  });
                }
              }}
              disabled={!newNoteContent.trim() || addNoteMutation.isPending}
              data-testid="button-save-note"
            >
              {addNoteMutation.isPending ? "Saving..." : "Save Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discovery Mode Selection Dialog */}
      <Dialog open={isDiscoveryModeDialogOpen} onOpenChange={setIsDiscoveryModeDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Discovery Mode
            </DialogTitle>
            <DialogDescription>
              Choose how you want AI to generate discovery questions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <RadioGroup value={discoveryMode} onValueChange={(v) => setDiscoveryMode(v as "focused" | "full")}>
              <div 
                className={`p-4 rounded-lg border cursor-pointer transition-all ${discoveryMode === "focused" ? "border-primary bg-primary/5" : "hover-elevate"}`}
                onClick={() => setDiscoveryMode("focused")}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="focused" id="focused" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="focused" className="text-base font-medium cursor-pointer">
                      Focused Search
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Focus on a specific Korn Ferry solution area. Best when you know which capability will deliver the most impact.
                    </p>
                    {discoveryMode === "focused" && (
                      <div className="mt-4">
                        <Label className="text-sm">Select Solution Area</Label>
                        <Select value={selectedSolutionArea} onValueChange={setSelectedSolutionArea}>
                          <SelectTrigger className="mt-2" data-testid="select-solution-area">
                            <SelectValue placeholder="Choose a solution area..." />
                          </SelectTrigger>
                          <SelectContent>
                            {solutionAreas.map(area => (
                              <SelectItem key={area.id} value={area.id}>
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">{area.name}</span>
                                  <span className="text-xs text-muted-foreground">{area.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div 
                className={`p-4 rounded-lg border cursor-pointer transition-all ${discoveryMode === "full" ? "border-primary bg-primary/5" : "hover-elevate"}`}
                onClick={() => setDiscoveryMode("full")}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="full" id="full" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="full" className="text-base font-medium cursor-pointer">
                      We Are Korn Ferry Search
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Comprehensive discovery across all Korn Ferry solutions. Groups questions by capability and recommends solution combinations for maximum impact.
                    </p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {solutionAreas.map(area => (
                        <Badge key={area.id} variant="outline" className="text-xs">
                          {area.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDiscoveryModeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                const isFullSearch = discoveryMode === "full";
                const solutionAreaMap: Record<string, string> = {
                  "DEVELOP": "leadership",
                  "ASSESS": "talent-acquisition",
                  "TRANSFORM": "transformation",
                  "REWARD": "rewards",
                  "COMMERCIAL": "sales-effectiveness"
                };
                generateQuestionsMutation.mutate({
                  mode: isFullSearch ? "full" : "focused",
                  solutionArea: isFullSearch ? undefined : selectedSolutionArea
                });
              }}
              disabled={generateQuestionsMutation.isPending || (discoveryMode === "focused" && !selectedSolutionArea)}
              data-testid="button-run-discovery"
            >
              {generateQuestionsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Run Discovery
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
